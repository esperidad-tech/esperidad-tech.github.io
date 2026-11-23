/* ==========================================================
   Les héros « en volume » — LES POSES DU PISTEUR (Romain, 23 novembre : « au moins une vingtaine de poses pour le Pisteur »,
   « des poses accroupies, les deux mains posées au sol », « le Pisteur qui piste », « le mode furtif »).
   Une pose n'est que des nombres (voir HV.POSES dans hv-pantin.js : ce que veut dire chaque clé). Elles marchent pour toute
   tenue construite en volume. HV.LISTE : l'ordre où on les montre, [nom, ce qu'on dit à l'écran, famille] ; HV.FAMILLES.
   Pour vérifier une pose : essai/poses.html#nom:* (huit angles) et HV.os(h, HV.pose(nom)) (où sont les os : un bras « au bout »
   mesure 92,7 ; un genou à terre est à y = 403 ; un poignet posé au sol vers y = 398).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES;
HV.FAMILLES = [['calme', 'Tranquille'], ['piste', 'Sur la piste'], ['furtif', 'Furtive'], ['chasse', 'À la chasse'], ['combat', 'Au combat']];
HV.LISTE = [['repos', 'Au repos', 'calme'], ['hanche', 'La main sur la hanche', 'calme'], ['coucou', 'Coucou !', 'calme']];
function ajoute(famille, nom, titre, pose){ if(pose) P[nom] = pose; HV.LISTE.push([nom, titre, famille]); }
/* un genou à terre (le sien gauche), l'autre pied à plat devant : la base de plusieurs poses */
var GENOU = {bas:[0, 86, -12], piedD:[15, 394, -72], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1], ouvG:0.2};
function avec(base, plus){ var R = {}, k; for(k in base) R[k] = base[k]; for(k in plus) R[k] = plus[k]; return R; }

/* ---------- Tranquille ---------- */
/* elle réfléchit : un doigt sur la joue */
ajoute('calme', 'reflechit', 'Elle réfléchit', {mainD:[14, 135, 23], coudeD:[0.5, 0.9, 0.3], mdirD:[-0.3, -1, 0], poingD:0.85, indexD:1, pouceD:[-1, -0.1, 0.3],
  pen:6, tete:-10, hoche:4, sourcils:-0.3, brasDessus:1, bx:-2});
/* elle regarde par-dessus son épaule : le dos se vrille, la tête finit le mouvement */
ajoute('calme', 'derriere', 'Par-dessus son épaule', {bang:[0, 0, 6], dos:[0, 0, 38], tete:48, sourcils:0.3, mainD:[46, 238, -6]});
/* une révérence : le dos se plie, une main sur le ventre */
ajoute('calme', 'reverence', 'Une révérence', {bas:[0, 8, -16], bang:[20, 0, 0], dos:[36, 0, 0], hoche:26, mainD:[-4, 206, 24], coudeD:[1, 0.3, -0.2], mdirD:[-1, 0.1, 0],
  mainG:[-78, 222, -10], coudeG:[-0.8, -0.3, -0.6], piedD:[22, 386, -30], pointeD:30, genouD:[0.3, 0, 1], sourcils:0.3});
/* à bout de souffle : pliée en deux, les mains sur les genoux */
ajoute('calme', 'essouffle', 'À bout de souffle', {bas:[0, 34, -16], bang:[28, 0, 0], dos:[44, 0, 0], piedG:[-24, 386, 4], piedD:[24, 386, 4], genouG:[-0.3, 0, 1], genouD:[0.3, 0, 1],
  mainG:[-29, 310, 36], relG:0, coudeG:[-1, 0, -0.3], mdirG:[0.1, 0.9, 0.3], mainD:[29, 310, 36], relD:0, coudeD:[1, 0, -0.3], mdirD:[-0.1, 0.9, 0.3], poingD:0.3,
  arcAxe:[-0.5, 0.8, 0.3], arcDir:[-0.8, -0.5, 0.2], hoche:22, sourcils:0.5});

/* ---------- Sur la piste ---------- */
/* elle guette au loin, la main en visière */
ajoute('piste', 'guet', 'Elle guette au loin', {bas:[0, 2, 0], dos:[5, 0, 10], mainD:[27, 83, 23], coudeD:[1, 0.2, -0.2], mdirD:[-1, 0.05, 0.1], pouceD:[0, 1, 0.4], poingD:0,
  tete:14, sourcils:0.4, brasDessus:1});
/* elle montre du doigt */
ajoute('piste', 'montre', 'Elle montre du doigt', {dos:[2, 0, 14], mainD:[78, 147, 58], coudeD:[0.5, 0.8, -0.2], poingD:0.9, indexD:1, pouceD:[0, -1, 0.2], tete:26, sourcils:0.3});
/* elle tend l'oreille, la main derrière */
ajoute('piste', 'ecoute', "Elle tend l'oreille", {dos:[4, 6, 0], mainD:[41, 108, -3], coudeD:[1, 0.5, 0.2], mdirD:[0, -1, 0.1], pouceD:[-1, 0, 0], poingD:0.25, pen:-8, tete:-14, hoche:2, sourcils:0.5});
/* accroupie, sur la pointe des pieds, les avant-bras sur les genoux, l'arc en travers */
ajoute('piste', 'accroupie', 'Accroupie', {bas:[0, 94, -10], bang:[16, 0, 0], dos:[22, 0, 0],
  piedG:[-25, 386, 4], piedD:[25, 386, 4], pointeG:44, pointeD:44, ouvG:0.7, ouvD:0.7, genouG:[-0.55, -0.2, 1], genouD:[0.55, -0.2, 1],
  mainG:[-38, 326, 74], relG:0, coudeG:[-1, 0.2, -0.3], mdirG:[0.2, 0.6, 0.6], mainD:[38, 326, 74], relD:0, coudeD:[1, 0.2, -0.3], mdirD:[-0.2, 0.9, 0.3],
  arcAxe:[1, 0, 0.05], arcDir:[0, -0.25, 1], hoche:4});
/* un genou à terre, assise sur son talon, une main sur la trace, l'arc planté à côté d'elle */
ajoute('piste', 'piste', 'Elle lit une trace', {bas:[0, 105, -30], bang:[42, 0, 6], dos:[46, 0, 6],
  piedD:[15, 394, -50], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 40], genouG:[-0.3, -0.5, 1], ouvG:0.2,
  mainD:[30, 397, 72], relD:0, coudeD:[1, -0.2, -0.4], mdirD:[-0.1, 0.5, 0.85], pouceD:[-1, 0, 0.2], poingD:0.05,
  mainG:[-50, 300, 44], relG:0, coudeG:[-1, 0.3, -0.2], hoche:26, tete:6});
/* accroupie très bas, les deux mains posées au sol, l'arc couché par terre sous sa main */
ajoute('piste', 'mainsAuSol', 'Les deux mains au sol', {bas:[0, 116, -24], bang:[38, 0, 0], dos:[42, 0, 0],
  piedG:[-30, 386, -8], piedD:[30, 386, -8], pointeG:50, pointeD:50, ouvG:1, ouvD:1, genouG:[-0.8, -0.3, 1], genouD:[0.8, -0.3, 1],
  mainG:[-22, 398, 70], relG:0, coudeG:[-1, -0.3, -0.2], mdirG:[0.1, 0.3, 1], pouceG:[1, 0, 0.2], poingG:0.3,
  mainD:[22, 398, 70], relD:0, coudeD:[1, -0.3, -0.2], mdirD:[-0.1, 0.3, 1], pouceD:[-1, 0, 0.2], poingD:0.05,
  arcAxe:[0.25, 0, 1], arcDir:[-1, -0.1, 0], hoche:16});
/* elle ramasse quelque chose : les genoux pliés, une main tendue vers le sol, l'autre sur le genou */
ajoute('piste', 'ramasse', 'Elle ramasse un indice', {bas:[0, 100, -22], bang:[40, 0, 0], dos:[40, 0, 8],
  piedG:[-22, 386, 24], genouG:[-0.4, -0.3, 1], piedD:[22, 386, -30], pointeD:46, genouD:[0.4, 0, 1],
  mainD:[24, 388, 76], relD:0, coudeD:[1, -0.2, -0.3], mdirD:[0, 0.9, 0.4], pouceD:[-1, 0, 0], poingD:0.4,
  mainG:[-42, 368, 62], relG:0, coudeG:[-1, 0.2, -0.3], arcAxe:[0.3, 0.1, 1], arcDir:[-1, -0.2, 0], hoche:22});

/* ---------- Furtive ---------- */
/* aux aguets : les genoux fléchis, l'arc devant elle */
ajoute('furtif', 'aguets', 'Aux aguets', {bas:[0, 16, -4], bang:[6, 0, 0], dos:[12, 0, -8],
  piedG:[-27, 386, 14], piedD:[25, 386, -14], mainG:[-56, 212, 30], coudeG:[-0.8, 0.3, -0.5], mainD:[42, 216, 22], coudeD:[0.8, 0.2, -0.6], hoche:3, sourcils:-0.3});
/* à pas de loup : penchée, un pied devant, l'autre sur la pointe */
ajoute('furtif', 'furtif', 'À pas de loup', {bas:[0, 36, 0], bang:[14, 0, -6], dos:[24, 0, 12],
  piedG:[-18, 386, 40], piedD:[18, 386, -44], pointeD:38, genouD:[0.3, 0.2, 1],
  mainG:[-48, 236, 22], coudeG:[-0.8, 0.2, -0.5], arcAxe:[0, 0.45, 0.9], arcDir:[-0.9, 0.3, -0.15],
  mainD:[40, 214, 34], coudeD:[0.8, 0.3, -0.5], mdirD:[0, 0.3, 0.7], hoche:-4, sourcils:-0.4});
/* … et le pas suivant */
ajoute('furtif', 'furtif2', 'Le pas suivant', {bas:[0, 36, 0], bang:[14, 0, 6], dos:[24, 0, -12],
  piedD:[18, 386, 40], piedG:[-18, 386, -44], pointeG:38, genouG:[-0.3, 0.2, 1],
  mainG:[-46, 226, 30], coudeG:[-0.8, 0.2, -0.5], arcAxe:[0, 0.45, 0.9], arcDir:[-0.9, 0.3, -0.15],
  mainD:[42, 228, 14], coudeD:[0.8, 0.3, -0.5], mdirD:[0, 0.3, 0.7], hoche:-4, sourcils:-0.4});
/* « chut ! » : un doigt sur les lèvres */
ajoute('furtif', 'chut', 'Chut !', {bas:[0, 10, 0], dos:[8, 0, 0], mainD:[9, 129, 25], coudeD:[0.5, 0.9, 0.3], mdirD:[-0.1, -1, 0], poingD:0.95, indexD:1, pouceD:[-1, 0, 0.3],
  sourcils:0.4, brasDessus:1});
/* à l'affût : un genou à terre, l'arc prêt devant elle */
ajoute('furtif', 'affut', "À l'affût", avec(GENOU, {bang:[8, 0, 0], dos:[14, 0, -10], mainG:[-50, 214, 40], coudeG:[-0.8, 0.4, -0.4], arcAxe:[0.45, 0.6, 0.66], arcDir:[-0.6, -0.3, 0.7],
  mainD:[22, 208, 34], coudeD:[0.9, 0.3, -0.4], poingD:0.5, tete:-12, hoche:-2, sourcils:-0.5}));

/* ---------- À la chasse ---------- */
ajoute('chasse', 'tir', 'Elle vise');
/* elle vise, un genou à terre. Comme les archers : de côté par rapport à la cible, le pied du côté de l'arc devant (le tibia
   droit), l'autre genou à terre ; le bassin est tourné vers la cible, les épaules restent dans l'axe de la flèche */
ajoute('chasse', 'tirGenou', 'Elle vise, un genou à terre', {bas:[8, 86, 0], bang:[0, 0, -50], dos:[0, 0, 50],
  piedG:[-74, 386, 12], genouG:[-0.6, -0.6, 0.5], ouvG:3, piedD:[84, 394, -16], pointeD:88, ouvD:-3, genouD:[0.2, 1, 0.3],
  mainG:[-116, 151, 5], coudeG:[0, 0.7, -0.6], mainD:[17, 128, 12], coudeD:[1, -0.35, -0.3], poingD:0.8,
  tete:-84, sourcils:-0.6, arcDir:[-1, 0, 0.04], tendu:1, brasDessus:1});
/* elle vise en l'air (ce qui vole) */
ajoute('chasse', 'tirHaut', 'Elle vise en l\'air', {dos:[-4, 8, 0], mainG:[-100, 97, 5], coudeG:[0, 0.7, -0.6], mainD:[24, 141, 12], coudeD:[1, 0.1, -0.3], poingD:0.8,
  tete:-84, hoche:-15, sourcils:-0.6, arcAxe:[-0.5, 0.87, 0], arcDir:[-0.87, -0.5, 0.04], tendu:1, brasDessus:1, piedG:[-28, 386, 3], piedD:[24, 386, -3]});
/* elle prend une flèche dans son carquois */
ajoute('chasse', 'fleche', 'Elle prend une flèche', {mainD:[38, 106, -15], coudeD:[0.5, -1, 0.5], mdirD:[0, -0.4, -0.9], poingD:0.7, tete:16, pen:3,
  mainG:[-54, 214, 26], coudeG:[-0.8, 0.3, -0.5]});
/* elle court : penchée, un genou levé, l'arc à la main */
ajoute('chasse', 'course', 'Elle court', {bas:[0, 10, 0], bang:[14, 0, -8], dos:[10, 0, 18],
  piedG:[-15, 350, 40], pointeG:-15, genouG:[-0.1, -0.4, 1], piedD:[15, 378, -52], pointeD:55, genouD:[0.1, 0.3, 1],
  mainD:[40, 196, 38], coudeD:[0.9, 0.5, -0.5], poingD:0.8, mainG:[-48, 226, -34], coudeG:[-0.8, -0.2, -0.7], arcAxe:[0, 0.5, 0.87], arcDir:[-0.9, 0.3, -0.2],
  hoche:-6, sourcils:-0.2});
/* victoire : l'arc brandi au-dessus de la tête */
ajoute('chasse', 'victoire', 'Victoire !', {bas:[0, -2, 0], mainG:[-74, 70, 4], coudeG:[-1, 0.3, 0], arcAxe:[1, 0.1, 0], arcDir:[0, -1, 0.1],
  mainD:[60, 84, 8], coudeD:[1, 0.4, 0], poingD:1, sourcils:0.8, hoche:-6, brasDessus:1});

/* ---------- Au combat ---------- */
/* en garde : la dague au poing, l'arc en retrait */
ajoute('combat', 'combat', 'En garde', {bas:[0, 24, 0], bang:[4, 0, 12], dos:[12, 0, -22], piedG:[-32, 386, 16], piedD:[30, 386, -20], ouvD:0.8,
  mainD:[36, 190, 56], coudeD:[0.9, 0.5, -0.3], poingD:1, pouceD:[0, -1, 0.3], dague:1, mainG:[-66, 214, -8], coudeG:[-0.8, 0.2, -0.6], sourcils:-0.8, hoche:4});
/* elle frappe : une grande fente, la dague en avant */
ajoute('combat', 'fente', 'Elle frappe', {bas:[0, 44, 26], bang:[16, 0, -10], dos:[10, 0, -16], piedD:[22, 386, 84], genouD:[0.2, -0.3, 1], piedG:[-22, 386, -58], pointeG:42, genouG:[-0.3, 0.4, 1],
  mainD:[34, 168, 88], coudeD:[1, 0.4, -0.2], mdirD:[0, 1, 0.3], poingD:1, pouceD:[0, -0.2, 1], dague:1, mainG:[-68, 200, -28], coudeG:[-0.8, -0.2, -0.6], sourcils:-0.9, hoche:2});
/* elle esquive : tout le corps part sur le côté */
ajoute('combat', 'esquive', 'Elle esquive', {bas:[-18, 30, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-50, 386, 2], genouG:[-0.5, 0, 1], piedD:[14, 386, -4],
  mainG:[-76, 200, 10], coudeG:[-0.9, 0.3, -0.4], mainD:[66, 176, 20], coudeD:[1, 0.4, -0.2], sourcils:0.7, hoche:-4, tete:20});

/* ==========================================================
   LES PETITS GESTES : ce qui bouge une fois la pose prise. g(F, w, t) : F, la pose de cette image (on y ajoute le geste) ;
   w : 0 → 1 pendant qu'elle prend la pose ; t : les secondes depuis qu'elle l'a prise.
   ========================================================== */
/* ==========================================================
   LES VISAGES : une expression par pose (Romain, 23 novembre, 13 h 36 : « il n'y a aucune expression de visage […] pour chaque
   position, il faut qu'elle ait une expression de visage qui corresponde »). Les nombres (hv-tete.js) :
   sourire (1 sourit, 0 neutre, -1 les coins tombent), ouvre (la bouche s'ouvre), largeB (0,45 lèvres pincées … 1,2 grande),
   bouchex (une moue de côté), sourcils (-1 froncés … 1 levés), sourcilsIn (le bout près du nez remonte : inquiète, fatiguée),
   sourcilsAsym (un sourcil plus haut), plisse (> 0 elle plisse les yeux ; < 0 grands ouverts), rougit, regX / regY (le regard).
   Le pouce (pouceG) : pour tenir l'arc devant elle, le pouce en haut — la paume face à nous, l'arc passe devant (hv-corps.js).
   ========================================================== */
var VISAGES = {
  repos:{},
  hanche:{sourire:1, sourcilsAsym:0.35, plisse:0.15},                                          /* sûre d'elle */
  coucou:{sourire:1, ouvre:0.35, sourcils:0.6, plisse:0.2},                                    /* toute contente */
  reflechit:{sourire:0.1, largeB:0.7, bouchex:0.6, sourcilsAsym:0.8, regX:0.6, regY:-0.6},    /* hmm… */
  derriere:{sourire:0.3, sourcils:0.4, regX:0.4},                                              /* curieuse */
  reverence:{sourire:1, plisse:0.3, regY:0.7},                                                 /* polie, les yeux baissés */
  essouffle:{sourire:-0.1, ouvre:0.65, sourcilsIn:0.8, plisse:0.3, rougit:0.9},              /* épuisée */
  guet:{sourire:0, largeB:0.8, sourcils:-0.2, plisse:0.55},                                   /* elle plisse les yeux au soleil */
  montre:{sourire:0.6, ouvre:0.35, sourcils:0.7, plisse:-0.15},                                /* « là ! » */
  ecoute:{sourire:0, largeB:0.7, sourcils:0.5, sourcilsAsym:0.3, regX:-0.7},                  /* elle tend l'oreille */
  accroupie:{sourire:0.1, sourcils:-0.25, regY:0.35},                                          /* attentive */
  piste:{sourire:0, largeB:0.65, sourcils:-0.45, plisse:0.2, regY:1},                          /* concentrée sur la trace */
  mainsAuSol:{sourire:-0.1, largeB:0.8, sourcils:-0.35, plisse:0.15},                          /* sérieuse, prête à bondir */
  ramasse:{sourire:0.5, ouvre:0.15, sourcils:0.6, regY:1},                                     /* elle a trouvé quelque chose */
  aguets:{sourire:-0.3, largeB:0.8, sourcils:-0.5, plisse:0.2},                                /* méfiante */
  furtif:{sourire:-0.15, largeB:0.65, sourcils:-0.6, plisse:0.25},                            /* lèvres pincées, pas un bruit */
  furtif2:{sourire:-0.15, largeB:0.65, sourcils:-0.6, plisse:0.25},
  chut:{sourire:0, ouvre:0.3, largeB:0.45, sourcils:0.5, plisse:0.25},                         /* « chhh » */
  affut:{sourire:-0.25, largeB:0.75, sourcils:-0.7, plisse:0.35},                              /* elle guette sa proie */
  tir:{sourire:-0.1, largeB:0.75, sourcils:-0.8, plisse:0.5},                                  /* elle vise : un œil plissé */
  tirGenou:{sourire:-0.1, largeB:0.75, sourcils:-0.8, plisse:0.5, pouceG:[0, -1, 0.1]},
  tirHaut:{sourire:-0.1, largeB:0.75, sourcils:-0.8, plisse:0.5, pouceG:[0, -1, 0.1]},
  fleche:{sourire:0.2, sourcils:-0.3, plisse:0.1},                                             /* calme, elle se prépare */
  course:{sourire:0, ouvre:0.45, sourcils:-0.4, sourcilsIn:0.3, rougit:0.5},                   /* l'effort */
  victoire:{sourire:1, ouvre:0.7, sourcils:0.9, plisse:0.45, rougit:0.6},                      /* elle rit */
  combat:{sourire:-0.6, largeB:1, sourcils:-1, plisse:0.3},                                    /* les dents serrées */
  fente:{sourire:-0.5, ouvre:0.55, largeB:0.9, sourcils:-1, plisse:0.2},                       /* elle crie en frappant */
  esquive:{sourire:-0.3, ouvre:0.45, largeB:0.7, sourcils:0.8, sourcilsIn:0.7, plisse:-0.4}    /* surprise, alarmée */
};
Object.keys(VISAGES).forEach(function(nom){ var v = VISAGES[nom], k; if(P[nom]) for(k in v) P[nom][k] = v[k]; });
HV.VISAGES = VISAGES;

var TAU = Math.PI * 2;
HV.GESTES = {
  /* ses doigts suivent le bord de la trace ; elle relève un instant les yeux */
  piste:function(F, w, t){ var a = Math.sin(TAU * t / 2.6); F.mainD = [F.mainD[0] + 5 * a * w, F.mainD[1], F.mainD[2] + 3 * Math.cos(TAU * t / 2.6) * w]; F.hoche -= 5 * Math.max(0, Math.sin(TAU * t / 7)) * w; },
  /* elle balaie l'horizon */
  guet:function(F, w, t){ F.tete += 16 * Math.sin(TAU * t / 5.2) * w; F.dos = [F.dos[0], F.dos[1], F.dos[2] + 6 * Math.sin(TAU * t / 5.2) * w]; },
  /* la tête un peu plus penchée, par à-coups */
  ecoute:function(F, w, t){ F.pen -= 3 * Math.max(0, Math.sin(TAU * t / 3.4)) * w; },
  /* elle regarde à droite, à gauche, sans bouger les mains */
  mainsAuSol:function(F, w, t){ F.tete += 22 * Math.sin(TAU * t / 4.4) * w; },
  accroupie:function(F, w, t){ F.tete += 14 * Math.sin(TAU * t / 5) * w; },
  /* elle reprend son souffle : le dos monte et descend */
  essouffle:function(F, w, t){ var a = Math.sin(TAU * t / 1.5); F.dos = [F.dos[0] - 3.2 * a * w, F.dos[1], F.dos[2]]; F.hoche += 3 * a * w; F.bas = [F.bas[0], F.bas[1] + 1.5 * a * w, F.bas[2]]; },
  /* elle secoue son arc au-dessus de sa tête */
  victoire:function(F, w, t){ var a = Math.sin(TAU * t * 1.6); F.mainG = [F.mainG[0], F.mainG[1] + 6 * a * w, F.mainG[2]]; F.mainD = [F.mainD[0], F.mainD[1] - 5 * a * w, F.mainD[2]]; F.bas = [F.bas[0], F.bas[1] + 2 * Math.abs(a) * w, F.bas[2]]; },
  /* en garde : elle se balance d'un pied sur l'autre, la dague bouge */
  combat:function(F, w, t){ var a = Math.sin(TAU * t / 1.3); F.bas = [F.bas[0] + 3 * a * w, F.bas[1] + 2 * Math.abs(a) * w, F.bas[2]]; F.mainD = [F.mainD[0], F.mainD[1] + 3 * a * w, F.mainD[2] + 3 * Math.cos(TAU * t / 1.3) * w]; },
  /* aux aguets : elle tourne la tête d'un côté, de l'autre */
  aguets:function(F, w, t){ F.tete += 24 * Math.sin(TAU * t / 4) * w; }
};
})(window);
