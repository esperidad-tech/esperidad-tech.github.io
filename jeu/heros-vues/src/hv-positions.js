/* ==========================================================
   Les héros « en volume » — LES POSITIONS DU PISTEUR (Romain, 23 novembre, 15 h 04).
   « Quand le pisteur appuie sur accroupi, on voit le personnage qui est debout […] qui s'accroupit. Et là, quand il est accroupi,
   je veux qu'il reste comme ça […] et dans cette position, je veux qu'il fasse des mouvements un peu naturels […] Il faut que le
   personnage ait de la vie. »
   Une position = une pose de base (où elle reste) + des GESTES : de petites animations, image clé par image clé, qu'elle fait de
   temps en temps (au hasard, avec un temps d'attente), puis elle revient à la pose de base.
   Un geste = [[quand (secondes depuis le début du geste), ce qui change par rapport à la pose de base], …] ; le dernier est {}
   (le retour). Entre deux images clés, tout glisse (on mélange les nombres, HV.melange). Une image clé identique à la précédente
   = elle tient la pose.
   Le pantin (hv-pantin.js) : p.position(nom) ; p.joue(geste) (ce geste-là, tout de suite).
   Chargé après hv-poses.js.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES;
function avec(base, plus){ var R = {}, k; for(k in base) R[k] = base[k]; for(k in plus) R[k] = plus[k]; return R; }

/* ---------- Les poses de base des positions ---------- */
/* aux aguets, prête à bondir (Romain : « plus penchée, comme s'il était prêt à partir en courant ») : les pieds écartés, les
   genoux pliés, le poids en avant, les mains prêtes, l'arc tenu bas devant elle */
P.posAguets = avec(P.repos, {bas:[0, 48, 6], bang:[24, 0, 0], dos:[24, 0, -6], piedG:[-36, 386, 12], piedD:[34, 386, -10], ouvG:0.5, ouvD:0.5,
  genouG:[-0.5, 0, 1], genouD:[0.5, 0, 1], pointeD:10,
  mainG:[-50, 230, 38], coudeG:[-0.8, 0.3, -0.5], arcAxe:[0.25, 0.5, 0.85], arcDir:[-0.9, 0.3, -0.2], poingG:0.8,
  mainD:[44, 226, 40], coudeD:[0.8, 0.3, -0.5], mdirD:[-0.2, 0.2, 1], poingD:0.35, hoche:-12,
  sourire:-0.3, largeB:0.8, sourcils:-0.5, plisse:0.2});
/* accroupie : sur la pointe des pieds, l'avant-bras droit sur le genou ; l'arc debout à côté de son genou gauche, un bout au sol
   (avant, il était en travers des genoux et passait dans l'autre bras) */
P.posAccroupi = avec(P.accroupie, {mainG:[-60, 312, 62], coudeG:[-1, 0.3, -0.2], arcAxe:[0, 1, 0.06], arcDir:[-0.3, 0, 1], poingG:0.85, pouceG:[0.2, -1, 0.2]});
/* un genou à terre, au repos : les jambes de « elle vise, un genou à terre » (le bassin tourné vers sa droite), les épaules face à
   nous ; l'avant-bras gauche posé sur le genou levé, l'arc debout, un bout au sol ; l'autre main sur la cuisse */
var JAMBES_GENOU = {bas:[8, 86, 0], bang:[0, 0, -50], piedG:[-74, 386, 12], genouG:[-0.6, -0.6, 0.5], ouvG:3, piedD:[84, 394, -16], pointeD:88, ouvD:-3, genouD:[0.2, 1, 0.3]};
P.posGenou = avec(P.repos, avec(JAMBES_GENOU, {dos:[4, 0, 44], tete:6,
  mainG:[-66, 300, 44], relG:0, coudeG:[-1, 0.3, -0.2], poingG:0.85, arcAxe:[0, 1, 0.05], arcDir:[-0.3, 0, 1],
  mainD:[30, 300, 30], relD:0, coudeD:[1, 0.2, -0.3], mdirD:[0, 0.8, 0.5], poingD:0.25,
  sourire:0.2, sourcils:-0.1}));
/* en garde : la dague au poing (la pose « En garde ») */
P.posGarde = avec(P.combat, {});

/* ---------- Les gestes ---------- */
/* (pour ne pas tout réécrire : la pose de tir à genou, et la main qui va au carquois) */
var VISE = {mainG:[-116, 151, 5], relG:1, coudeG:[0, 0.7, -0.6], pouceG:[0, -1, 0.1], arcAxe:[0, 1, 0], arcDir:[-1, 0, 0.04], poingG:0.75,
  dos:[0, 0, 50], tete:-84, brasDessus:1, sourcils:-0.6, plisse:0.45, sourire:-0.1, largeB:0.75};
var CARQUOIS = {mainD:[38, 106, -15], relD:1, coudeD:[0.5, -1, 0.5], mdirD:[0, -0.4, -0.9], pouceD:[-0.2, -1, 0.4], poingD:0.5, tete:20, pen:3};
function plus(a, b){ return avec(a, b); }
/* accroupie, penchée pour toucher le sol (la main droite au sol, mesurée : bras tendu 92,7) */
var PENCHE = {bas:[0, 108, -12], bang:[38, 0, 0], dos:[46, 0, 0], hoche:30, regY:1, relD:0, mdirD:[-0.1, 0.5, 1], poingD:0.1, mainG:[-70, 362, 88], relG:0};

HV.POSITIONS = {
  /* AU REPOS : debout, elle vit ; de temps en temps elle se tourne à droite, à gauche, regarde derrière elle, regarde son arc */
  repos:{titre:'Au repos', base:'repos', attente:[2.2, 4.5], gestes:{
    droite:[[1.0, {tourne:38, tete:12}], [2.6, {tourne:38, tete:12}], [3.0, {tourne:38, tete:-4}], [4.2, {}]],
    gauche:[[1.0, {tourne:-38, tete:-12}], [2.6, {tourne:-38, tete:-12}], [3.0, {tourne:-38, tete:4}], [4.2, {}]],
    derriere:[[0.9, {bang:[0, 0, 6], dos:[0, 0, 36], tete:46, sourcils:0.3}], [2.3, {bang:[0, 0, 6], dos:[0, 0, 36], tete:46, sourcils:0.3}], [3.1, {}]],
    arc:[[0.8, {mainG:[-34, 212, 30], arcAxe:[0.25, 0.95, 0.2], arcDir:[-0.6, 0, 0.8], hoche:12, regY:0.6, regX:-0.4}],
      [1.6, {mainG:[-30, 208, 32], arcAxe:[-0.2, 0.95, 0.25], arcDir:[-0.2, 0, 1], hoche:12, regY:0.6, regX:-0.4}],
      [2.3, {mainG:[-34, 212, 30], arcAxe:[0.25, 0.95, 0.2], arcDir:[-0.6, 0, 0.8], hoche:12, regY:0.6, regX:-0.4}], [3.1, {}]]
  }},
  /* AUX AGUETS : prête à bondir ; elle scrute à gauche, à droite ; d'un coup elle a vu quelque chose : les mains se préparent,
     le corps part d'un côté… puis non, elle reste sur place */
  aguets:{titre:'Aux aguets', base:'posAguets', attente:[1.6, 3.4], gestes:{
    scrute:[[0.7, {tete:-48, tourne:-8}], [1.6, {tete:-48, tourne:-8}], [2.5, {tete:44, tourne:8}], [3.4, {tete:44, tourne:8}], [4.1, {}]],
    alerteD:[[0.22, {tete:40, tourne:18, bas:[12, 50, 6], mainD:[52, 206, 50], mainG:[-40, 214, 46], sourcils:0.5, ouvre:0.25, plisse:-0.3}],
      [1.3, {tete:40, tourne:18, bas:[12, 50, 6], mainD:[52, 206, 50], mainG:[-40, 214, 46], sourcils:0.5, ouvre:0.25, plisse:-0.3}],
      [1.6, {tete:30, tourne:14, bas:[8, 46, 6], mainD:[50, 210, 48], mainG:[-42, 216, 44], sourcils:-0.2}], [2.6, {}]],
    alerteG:[[0.22, {tete:-40, tourne:-18, bas:[-12, 50, 6], mainD:[40, 212, 48], mainG:[-58, 206, 44], sourcils:0.5, ouvre:0.25, plisse:-0.3}],
      [1.3, {tete:-40, tourne:-18, bas:[-12, 50, 6], mainD:[40, 212, 48], mainG:[-58, 206, 44], sourcils:0.5, ouvre:0.25, plisse:-0.3}],
      [1.6, {tete:-30, tourne:-14, bas:[-8, 46, 6], mainD:[42, 214, 46], mainG:[-56, 210, 42], sourcils:-0.2}], [2.6, {}]]
  }},
  /* ACCROUPI : elle s'accroupit et y reste ; elle regarde autour d'elle, au sol, pose la main, lit une trace, enlève une poussière,
     se tourne pour regarder derrière elle, bouge son arc, tire sur son baudrier */
  accroupi:{titre:'Accroupi', base:'posAccroupi', attente:[2, 4], gestes:{
    regarde:[[0.6, {tete:-52}], [1.4, {tete:-52}], [2.2, {tete:48}], [3.0, {tete:48}], [3.6, {}]],
    /* (pour poser la main au sol, elle se penche : le bassin descend, le dos se plie ; l'arc descend avec sa main gauche) */
    sol:[[0.6, plus(PENCHE, {hoche:20, regY:1, mainD:[30, 380, 84], poingD:0.1})], [1.1, plus(PENCHE, {mainD:[24, 398, 86]})],
      [2.6, plus(PENCHE, {mainD:[26, 398, 86], tete:-30, regY:0.4})], [3.3, {}]],
    trace:[[0.9, plus(PENCHE, {mainD:[22, 398, 88], indexD:1, poingD:0.2, sourcils:-0.45, largeB:0.65})],
      [1.6, plus(PENCHE, {mainD:[8, 396, 94], indexD:1, poingD:0.2, sourcils:-0.45, largeB:0.65})],
      [2.3, plus(PENCHE, {mainD:[24, 398, 86], indexD:1, poingD:0.2, sourcils:-0.45, largeB:0.65})],
      [2.9, plus(PENCHE, {mainD:[24, 398, 86], indexD:1, poingD:0.2, hoche:14, regY:0.1, sourcils:0.3})], [3.7, {}]],
    /* (elle enlève une poussière sur son genou gauche, de la main droite) */
    poussiere:[[0.5, {mainD:[-10, 318, 74], relD:0, mdirD:[-1, 0.3, 0.2], poingD:0.1, hoche:14, regY:0.6, regX:-0.4}],
      [0.72, {mainD:[-20, 322, 72], relD:0, mdirD:[-1, 0.3, 0.2], poingD:0.1, hoche:14, regY:0.6, regX:-0.4}],
      [0.94, {mainD:[-10, 318, 74], relD:0, mdirD:[-1, 0.3, 0.2], poingD:0.1, hoche:14, regY:0.6, regX:-0.4}],
      [1.16, {mainD:[-20, 322, 72], relD:0, mdirD:[-1, 0.3, 0.2], poingD:0.1, hoche:14, regY:0.6, regX:-0.4}], [1.8, {}]],
    derriere:[[1.0, {tourne:-34, dos:[22, 0, -20], tete:-50, sourcils:0.3}], [2.4, {tourne:-34, dos:[22, 0, -20], tete:-50, sourcils:0.3}], [3.4, {}]],
    arc:[[0.8, {mainG:[-44, 300, 80], arcAxe:[0.6, 0.6, 0.5], hoche:10, regX:-0.5, regY:0.3}], [1.5, {mainG:[-40, 304, 78], arcAxe:[0.1, 0.8, 0.6], hoche:10, regX:-0.5, regY:0.3}], [2.3, {}]],
    baudrier:[[0.6, {mainD:[-8, 172, 30], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:8, regY:0.5}],
      [0.9, {mainD:[-8, 180, 32], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:8, regY:0.5}], [1.2, {mainD:[-8, 172, 30], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:8, regY:0.5}], [1.8, {}]]
  }},
  /* UN GENOU À TERRE : au repos ; elle sort une flèche, l'encoche, bande l'arc, ne tire pas, relâche, range la flèche ; elle met son
     arc à l'horizontale et l'inspecte, le nettoie ; la main en visière, elle observe les alentours */
  genou:{titre:'Un genou à terre', base:'posGenou', attente:[2.2, 4], gestes:{
    fleche:[
      [0.8, CARQUOIS], [1.0, plus(CARQUOIS, {poingD:0.95, flecheD:1})],
      [1.7, {mainD:[30, 196, 44], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[-0.4, 0.1, 1], poingD:0.95, flecheD:1, pouceD:[-0.8, 0, 0.5], tete:-30, mainG:[-92, 210, 30], relG:1, coudeG:[-0.6, 0.6, -0.5], arcAxe:[0, 1, 0], arcDir:[-1, 0, 0.1], pouceG:[0, -1, 0.1]}],
      [2.4, plus(VISE, {mainD:[-82, 152, 8], relD:1, coudeD:[1, -0.2, -0.4], poingD:0.9, flecheD:1, pouceD:[-1, 0, 0.1], tendu:0})],
      [2.6, plus(VISE, {mainD:[-82, 152, 8], relD:1, coudeD:[1, -0.2, -0.4], poingD:0.9, flecheD:0, pouceD:[-1, 0, 0.1], tendu:0.04})],
      [3.4, plus(VISE, {mainD:[17, 128, 12], relD:1, coudeD:[1, -0.35, -0.3], poingD:0.8, tendu:1})],
      [4.8, plus(VISE, {mainD:[17, 128, 12], relD:1, coudeD:[1, -0.35, -0.3], poingD:0.8, tendu:1})],
      [5.7, plus(VISE, {mainD:[-82, 152, 8], relD:1, coudeD:[1, -0.2, -0.4], poingD:0.9, tendu:0.04, sourcils:0.1, plisse:0})],
      [5.9, plus(VISE, {mainD:[-82, 152, 8], relD:1, coudeD:[1, -0.2, -0.4], poingD:0.9, tendu:0, flecheD:1, pouceD:[-1, 0, 0.1], sourcils:0.1, plisse:0})],
      /* (la flèche redescend devant elle, la pointe en bas, avant de repartir dans le carquois : jamais devant son visage) */
      [6.5, {mainD:[30, 204, 44], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[-0.4, 0.1, 1], poingD:0.95, flecheD:1, pouceD:[0, 1, 0.2], tete:-10}],
      [7.3, plus(CARQUOIS, {poingD:0.95, flecheD:1})], [7.5, plus(CARQUOIS, {poingD:0.5, flecheD:0})], [8.4, {}]],
    inspecte:[
      [0.9, {mainG:[-24, 214, 52], relG:1, coudeG:[-0.8, 0.5, -0.4], arcAxe:[1, 0.02, 0.15], arcDir:[0, -1, 0.2], pouceG:[0, -1, 0.3], mainD:[18, 212, 56], relD:1, coudeD:[0.8, 0.5, -0.4], mdirD:[1, 0, 0.2], poingD:0.2, hoche:16, regY:0.8, sourcils:-0.2}],
      [1.5, {mainG:[-24, 214, 52], relG:1, coudeG:[-0.8, 0.5, -0.4], arcAxe:[1, 0.02, 0.15], arcDir:[0, -1, 0.2], pouceG:[0, -1, 0.3], mainD:[52, 210, 58], relD:1, coudeD:[0.8, 0.5, -0.4], mdirD:[1, 0, 0.2], poingD:0.2, hoche:16, regY:0.8, regX:0.5, sourcils:-0.2}],
      [2.1, {mainG:[-24, 214, 52], relG:1, coudeG:[-0.8, 0.5, -0.4], arcAxe:[1, 0.02, 0.15], arcDir:[0, -1, 0.2], pouceG:[0, -1, 0.3], mainD:[20, 212, 56], relD:1, coudeD:[0.8, 0.5, -0.4], mdirD:[1, 0, 0.2], poingD:0.2, hoche:16, regY:0.8, sourcils:-0.2}],
      [2.7, {mainG:[-24, 214, 52], relG:1, coudeG:[-0.8, 0.5, -0.4], arcAxe:[1, 0.02, 0.15], arcDir:[0, -1, 0.2], pouceG:[0, -1, 0.3], mainD:[54, 210, 58], relD:1, coudeD:[0.8, 0.5, -0.4], mdirD:[1, 0, 0.2], poingD:0.2, hoche:16, regY:0.8, regX:0.5, sourcils:-0.2}],
      [3.4, {mainG:[-24, 214, 52], relG:1, coudeG:[-0.8, 0.5, -0.4], arcAxe:[1, 0.02, 0.15], arcDir:[0, -1, 0.2], pouceG:[0, -1, 0.3], mainD:[30, 300, 30], relD:0, hoche:12, regY:0.6, sourire:0.6}], [4.3, {}]],
    visiere:[
      [0.8, {mainD:[27, 83, 23], relD:1, coudeD:[1, 0.2, -0.2], mdirD:[-1, 0.05, 0.1], pouceD:[0, 1, 0.4], poingD:0, brasDessus:1, tete:-34, plisse:0.55, sourire:0, largeB:0.8, sourcils:-0.2}],
      [2.0, {mainD:[27, 83, 23], relD:1, coudeD:[1, 0.2, -0.2], mdirD:[-1, 0.05, 0.1], pouceD:[0, 1, 0.4], poingD:0, brasDessus:1, tete:-34, plisse:0.55, sourire:0, largeB:0.8, sourcils:-0.2}],
      [3.0, {mainD:[27, 83, 23], relD:1, coudeD:[1, 0.2, -0.2], mdirD:[-1, 0.05, 0.1], pouceD:[0, 1, 0.4], poingD:0, brasDessus:1, tete:30, plisse:0.55, sourire:0, largeB:0.8, sourcils:-0.2}],
      [4.2, {mainD:[27, 83, 23], relD:1, coudeD:[1, 0.2, -0.2], mdirD:[-1, 0.05, 0.1], pouceD:[0, 1, 0.4], poingD:0, brasDessus:1, tete:30, plisse:0.55, sourire:0, largeB:0.8, sourcils:-0.2}], [5.0, {}]]
  }},
  /* EN GARDE : la plupart du temps elle attend ; de temps en temps, deux coups de dague ; un pas de côté, une esquive ; elle range
     sa dague, se redresse un peu… et la ressort */
  garde:{titre:'En garde', base:'posGarde', attente:[2.4, 4.5], gestes:{
    coups:[[0.22, {mainD:[56, 176, 14], coudeD:[1, 0.3, -0.4], bas:[4, 26, -4], dos:[12, 0, -34]}],
      [0.4, {mainD:[-6, 184, 86], coudeD:[0.8, 0.5, -0.1], bas:[-2, 30, 12], dos:[16, 0, 4], ouvre:0.5, sourcils:-1}],
      [0.62, {mainD:[-14, 168, 60], coudeD:[0.6, 0.6, -0.2], bas:[-2, 30, 10], dos:[14, 0, 8]}],
      [0.82, {mainD:[64, 196, 76], coudeD:[1, 0.3, -0.2], bas:[6, 30, 12], dos:[16, 0, -30], ouvre:0.5, sourcils:-1}],
      [1.6, {}]],
    esquive:[[0.3, {bas:[-20, 32, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-54, 386, 6], genouG:[-0.5, 0, 1], piedD:[12, 386, -10], mainG:[-76, 206, 10], mainD:[56, 178, 30], sourcils:0.7, sourcilsIn:0.6, ouvre:0.4, tete:18}],
      [0.8, {bas:[-20, 32, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-54, 386, 6], genouG:[-0.5, 0, 1], piedD:[12, 386, -10], mainG:[-76, 206, 10], mainD:[56, 178, 30], sourcils:0.7, sourcilsIn:0.6, ouvre:0.4, tete:18}],
      [1.1, {bas:[18, 30, -6], bang:[-4, 10, 0], dos:[-6, 12, 0], piedD:[52, 386, -14], genouD:[0.5, 0, 1], piedG:[-12, 386, 10], mainD:[60, 182, 40], sourcils:0.5, tete:-14}],
      [1.5, {bas:[18, 30, -6], bang:[-4, 10, 0], dos:[-6, 12, 0], piedD:[52, 386, -14], genouD:[0.5, 0, 1], piedG:[-12, 386, 10], mainD:[60, 182, 40], sourcils:0.5, tete:-14}], [2.1, {}]],
    range:[[0.6, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], hoche:10, regY:0.6}], [0.8, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:0, hoche:10, regY:0.6}],
      [1.6, {bas:[0, 6, 0], bang:[0, 0, 0], dos:[4, 0, -6], mainD:[48, 240, 4], coudeD:[0.7, -0.1, -0.7], mdirD:[0, 0, 0], poingD:0.3, dague:0, sourcils:0, sourire:0.3, largeB:1, plisse:0}],
      [3.2, {bas:[0, 6, 0], bang:[0, 0, 0], dos:[4, 0, -6], mainD:[48, 240, 4], coudeD:[0.7, -0.1, -0.7], mdirD:[0, 0, 0], poingD:0.3, dague:0, sourcils:0, sourire:0.3, largeB:1, plisse:0, tete:20}],
      [3.7, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:0, hoche:6}], [3.85, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:1, hoche:6}],
      [4.3, {}]]
  }}
};
HV.LISTE_POSITIONS = ['repos', 'aguets', 'accroupi', 'genou', 'garde'];
HV.NOMS_GESTES = {droite:'À droite', gauche:'À gauche', derriere:'Derrière elle', arc:'Son arc', scrute:'Elle scrute', alerteD:'Alerte !', alerteG:'Alerte, à gauche !',
  regarde:'Elle regarde', sol:'Main au sol', trace:'Elle lit une trace', poussiere:'Une poussière', baudrier:'Son baudrier',
  fleche:'Une flèche', inspecte:'Elle inspecte son arc', visiere:'La main en visière', coups:'Deux coups', esquive:'Esquive', range:'Range sa dague'};

/* ---------- Jouer : où elle en est à l'instant t (appelé par le pantin à chaque image) ---------- */
function eio(u){ return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
function attente(Po){ return Po.attente[0] + Math.random() * (Po.attente[1] - Po.attente[0]); }
function choisir(Po, dernier){ var n = Object.keys(Po.gestes).filter(function(g){ return g !== dernier; }); return n[Math.floor(Math.random() * n.length)]; }
/* la pose d'un geste au temps u (secondes depuis son début), à partir de la pose de base */
HV.gesteImage = function(base, Gst, u){
  var prevT = 0, prevK = base, i;
  for(i = 0; i < Gst.length; i++){
    var Ki = avec(base, Gst[i][1]);
    if(u <= Gst[i][0]){ var w = (u - prevT) / ((Gst[i][0] - prevT) || 1); return HV.melange(prevK, Ki, eio(Math.max(0, Math.min(1, w)))); }
    prevT = Gst[i][0]; prevK = Ki;
  }
  return base;
};
HV.positionImage = function(p, base, t){
  var Po = HV.POSITIONS[p.posi];
  if(!Po) return base;
  if(!p.gest){
    if(p.prochain == null) p.prochain = t + attente(Po) * 0.6;
    var force = p.gestForce && Po.gestes[p.gestForce] ? p.gestForce : null;
    /* (p.sansHasard : elle ne fait que les gestes qu'on lui demande — les films) */
    if(force || (t >= p.prochain && !p.sansHasard)){ var nom = force || choisir(Po, p.dernier); p.gestForce = null; p.gest = {nom:nom, t0:t}; p.dernier = nom; }
  }
  if(p.gest){
    var Gst = Po.gestes[p.gest.nom], u = t - p.gest.t0;
    if(u >= Gst[Gst.length - 1][0]){ p.gest = null; p.prochain = t + attente(Po); return base; }
    return HV.gesteImage(base, Gst, u);
  }
  return base;
};
})(window);
