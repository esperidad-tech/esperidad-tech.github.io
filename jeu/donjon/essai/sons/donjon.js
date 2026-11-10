/* Atelier des sons de Brumeval — les sons du donjon complet (proposés le 9 novembre, à valider par Romain) :
   les nouvelles armes et les objets des héros, les potions, le combat, les objets et les salles.
   Mêmes règles que bruitages.js : une fonction (A : le moteur, P : la prise) qui rend {duree}. Rien n'est encore branché dans le jeu. */
(function(G){
'use strict';
var h = Moteur.hasard, S = G.BRUITAGES, O = G.BRUITAGES_OUTILS;
function ici(P, t){ return {t:t, sec:P.sec, cave:P.cave, grotte:P.grotte}; }
function m(n){ return Moteur.midi(n); }
/* une pluie de petites étincelles brillantes (n notes très courtes, très aiguës) */
function scintille(A, t, d, n, g, dest){
  for(var k = 0; k < n; k++){ var tt = t + Math.random() * d, f = h(2600, 6000); A.ton(tt, {f:f, env:A.perc(.002, h(.05, .14)), g:g * h(.4, 1)}, dest); }
}
/* un arpège de cloches douces */
function carillon(A, t, notes, iv, o, dest){
  notes.forEach(function(n, k){ A.cloche(t + k * iv, m(n), {d:o.d || 1.6, rapport:o.rapport || 3.5, indice:o.indice || .9, g:o.g || .04}, dest); });
}
/* du papier qui bruisse */
function papier(A, t, d, g, dest){
  A.bruit(t, {filtres:[{type:'bandpass', f:2200, pts:[[d * .5, 4200], [d, 2600]], q:1}], env:[[0, 0], [d * .3, 1], [d, 0]], g:.35 * g}, dest);
  A.joue(t, A.crepitement(d, 70), {g:.25 * g, filtres:[{type:'highpass', f:2500}, {type:'lowpass', f:7000}]}, dest);
}
/* une pierre qui frotte (grave, rugueuse) */
function frotte(A, t, d, g, dest){
  A.bruit(t, {coul:'brun', filtres:[{type:'bandpass', f:260, q:1}, {type:'lowpass', f:900}], env:[[0, 0], [.15, 1], [d - .2, .9], [d, 0]], g:1.6 * g, rugueux:.9, rugVit:9}, dest);
  A.bruit(t, {coul:'rose', bp:900, bq:1.5, env:[[0, 0], [.15, 1], [d - .2, .8], [d, 0]], g:.35 * g, rugueux:1, rugVit:14}, dest);
  A.ton(t, {type:'sawtooth', f:48, env:[[0, 0], [.2, 1], [d - .2, .8], [d, 0]], g:.1 * g, lp:300, sat:2, gigue:3}, dest);
}

/* =================== LES NOUVELLES FLÈCHES =================== */
/* la flèche d'argent : contre les créatures de brume — une traînée qui brille, et un éclat de lumière en touchant */
S.flecheArgentA = function(A, P){
  var t = P.t, d = .5, o = A.bus(P, {rev:.3, pan:-.5, pan2:.6, pant:d});
  O.sifflement(A, t, d, {f1:3000, f2:2300, q:12, gt:.05}, o);
  scintille(A, t + .05, d, 14, .02, o);
  var c = t + d, oc = A.bus(ici(P, c), {rev:.5, pan:.6});
  A.modes(c, 2600, [[1, 1, .5, 3], [2.76, .4, .3], [5.4, .2, .15]], {g:.08}, oc);
  carillon(A, c + .02, [88, 91, 96], .05, {g:.04, d:1.2}, oc);
  return {duree:1.6};
};
S.flecheArgentB = function(A, P){
  var t = P.t, d = .55, o = A.bus(P, {rev:.35, pan:-.5, pan2:.6, pant:d});
  O.sifflement(A, t, d, {f1:3200, f2:2600, q:10, gt:.12, vib:[7, 30]}, o);                    /* une flèche qui chante */
  var c = t + d, oc = A.bus(ici(P, c), {rev:.55, pan:.6});
  [84, 88, 91, 96, 100].forEach(function(n, k){ A.cloche(c + k * .035, m(n), {d:1.3, rapport:3.5, indice:1.1, g:.035}, oc); });
  O.brume(A, c + .05, .5, oc);
  return {duree:1.9};
};
/* la flèche lourde : contre l'armure — lourde en vol, et des étincelles sur le métal */
S.flecheLourdeA = function(A, P){
  var t = P.t, d = .45, o = A.bus(P, {rev:.25, pan:-.5, pan2:.6, pant:d});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:450, pts:[[d * .5, 900], [d, 600]], q:2}], env:[[0, 0], [d * .5, 1], [d, 0]], g:.9}, o);   /* wouf */
  var c = t + d, oc = A.bus(ici(P, c), {rev:.45, pan:.6});
  A.choc(c, {f:180, f2:70, d:.15, g:.6, sat:3}, oc);
  A.modes(c, 380, [[1, 1, .9, 2], [2.4, .6, .6, 3], [3.8, .4, .4], [5.1, .25, .25]], {g:.2}, oc);                    /* KLANG */
  A.joue(c + .01, A.crepitement(.5, 70), {g:.5, hp:4000}, oc);                                                       /* des étincelles */
  scintille(A, c, .35, 8, .02, oc);
  return {duree:1.6};
};
S.flecheLourdeB = function(A, P){
  var t = P.t, d = .4, o = A.bus(P, {rev:.25, pan:-.5, pan2:.6, pant:d});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:600, pts:[[d, 1100]], q:1.5}], env:[[0, 0], [d * .6, 1], [d, 0]], g:.8}, o);
  var c = t + d, oc = A.bus(ici(P, c), {rev:.4, pan:.6});
  A.choc(c, {f:220, f2:90, d:.12, g:.7, sat:3.5}, oc);                                                               /* TCHONK : elle traverse la plaque */
  A.bruit(c, {coul:'rose', bp:1800, bq:1, env:A.perc(.001, .05), g:1, sat:3}, oc);
  A.modes(c + .02, 1100, [[1, 1, 1.2, 2], [2.32, .5, .8], [4.25, .3, .4]], {g:.07}, oc);
  O.vibreFleche(A, c + .01, {f:140, t60:.5, g:.25, trem:20}, oc);
  return {duree:1.6};
};

/* =================== LE SAGE : LE CRISTAL DE LUNE, LE BÂTON DE CHÊNE =================== */
/* le cristal de lune : la rune éclaire TOUTE la salle */
S.cristalA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.6, grotte:.5});
  A.cloche(t, 2093, {d:2.4, rapport:2.76, indice:2, g:.07}, o);                                                       /* le cristal qu'on frappe */
  A.bruit(t + .05, {filtres:[{type:'highpass', f:1500}, {type:'bandpass', f:2500, pts:[[.6, 7000]], q:.8}], env:[[0, 0], [.4, 1], [1.3, 0]], g:.5}, A.bus(P, {rev:.5, pan:-.8, pan2:.8, pant:1.2}));   /* l'éclair qui traverse la salle */
  [1568, 2093, 2637, 3136, 4186].forEach(function(f){ A.ton(t + .1, {f:f * h(.995, 1.005), env:[[0, 0], [.3, 1], [1.2, .5], [2.2, 0]], g:.012, vib:[h(5, 7), 6]}, o); });
  A.choc(t + .05, {f:120, f2:50, d:.4, g:.3, sat:2, bruit:0}, o);
  return {duree:2.8};
};
S.cristalB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.6, grotte:.6});
  [60, 64, 67, 72, 76, 79, 84, 88].forEach(function(n, k){ A.harpe(t + k * .04, m(n), {t60:2, g:.13}, o); });     /* la harpe qui monte */
  A.choeur(t + .2, [m(72), m(76), m(79)], 2.2, {voyelle:'a', a:.3, r:1.2, g:.04}, o);
  carillon(A, t + .4, [91, 96, 100], .08, {g:.035, d:1.8}, o);
  return {duree:3.0};
};
/* le bâton de chêne : le bouclier protège deux héros */
S.batonA = function(A, P){
  var t = P.t;
  [[0, -.5], [.32, .5]].forEach(function(e){
    var o = A.bus(ici(P, t + e[0]), {rev:.55, pan:e[1]});
    O.toc(A, t + e[0], 300, {long:1.4, fc:140, gc:.4, clicF:1800}, o);                                                /* toc, sur le chêne */
    A.ton(t + e[0] + .05, {f:170, f2:520, gl:.55, env:[[0, 0], [.05, 1], [1.1, 0]], g:.1}, o);                       /* un dôme qui se lève */
    [523.3, 784, 1046.5].forEach(function(f, k){ A.ton(t + e[0] + .25 + k * .03, {f:f, env:[[0, 0], [.2, 1], [1.2, 0]], g:.03}, o); });
  });
  return {duree:1.8};
};
S.batonB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.6});
  A.choc(t, {f:110, f2:55, d:.3, g:.55, sat:2, corpsF:350, corps:1.4}, o);                                            /* le bâton frappe le sol */
  A.modes(t, 180, [[1, 1, .3], [2.6, .5, .2], [4.1, .3, .12]], {g:.2}, o);
  A.nappe(t + .1, [m(55), m(59), m(62), m(67)], 2.2, {type:'triangle', a:.5, r:1.2, lp:1800, lp1:500, g:.05}, o);   /* une chaleur douce */
  [-.6, .6].forEach(function(p, k){ var oo = A.bus(ici(P, t + .3 + k * .2), {rev:.6, pan:p}); carillon(A, t + .3 + k * .2, [79, 83, 86], .04, {g:.03}, oo); });
  return {duree:2.6};
};
/* l'amulette de vie : le héros qui tombe se relève tout seul (relève dorée) */
S.amuletteA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.55, grotte:.3});
  [0, .45].forEach(function(x){ A.choc(t + x, {f:70, f2:40, d:.16, g:.5, sat:2, bruit:0}, o); A.choc(t + x + .17, {f:62, f2:38, d:.14, g:.35, sat:2, bruit:0}, o); });   /* le cœur repart */
  [60, 64, 67, 72, 76, 79, 84].forEach(function(n, k){ A.harpe(t + .9 + k * .06, m(n), {t60:2.2, g:.14}, o); });
  A.choeur(t + 1.0, [m(60), m(64), m(67)], 2.4, {voyelle:'a', a:.4, r:1.4, g:.05}, o);
  carillon(A, t + 1.3, [84, 88, 91], .1, {g:.035}, o);
  return {duree:3.6};
};
S.amuletteB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.55, grotte:.4});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:300, pts:[[1.2, 3000]], q:1}], env:[[0, 0], [1, 1], [1.4, 0]], g:.5}, o);   /* le souffle de vie qui monte */
  A.nappe(t + .2, [m(60), m(67), m(72), m(76)], 2.6, {a:.8, r:1.2, lp:2600, lp1:600, g:.04}, o);
  carillon(A, t + 1.2, [76, 79, 84], .16, {g:.05, d:2}, o);                                                           /* ta-da-da */
  return {duree:3.4};
};

/* =================== LES POTIONS (le bruit de la potion seule, sans le monstre) =================== */
function verreBrise(A, t, g, dest){
  A.ton(t, {f:4300, env:A.perc(.001, .08), g:.08 * g}, dest);
  A.bruit(t, {hp:4800, env:A.perc(.001, .12), g:.3 * g}, dest);
  for(var k = 0; k < 9; k++) A.ton(t + h(0, .18), {f:h(2500, 7500), env:A.perc(.001, h(.06, .3)), g:h(.02, .06) * g}, dest);
}
S.potGivreA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.4});
  verreBrise(A, t, 1, o);
  A.joue(t + .05, A.crepitement(.8, 140, {forme:function(u){ return Math.pow(1 - u, 1.4); }}), {g:.6, filtres:[{type:'highpass', f:3500}, {type:'lowpass', f:9000}]}, o);   /* la glace qui craque */
  A.bruit(t + .05, {hp:6000, env:[[0, 0], [.2, 1], [1, 0]], g:.15}, o);
  O.grinceArc(A, t + .1, .5, {res:[1500, 3100, 5200], q:14, g:1.2, i0:.02, i1:.006}, o);                              /* crrrk : la glace prend */
  return {duree:1.3};
};
S.potGivreB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, pan:.4});
  verreBrise(A, t, .8, o);
  [76, 79, 83, 86, 88, 91].forEach(function(n, k){ A.ton(t + .1 + k * .05, {type:'triangle', f:m(n) * h(.99, 1.01), env:A.perc(.002, .5), g:.035}, o); });   /* le cristal qui pousse */
  A.bruit(t + .4, {hp:2500, env:A.perc(.001, .03), g:.6, sat:3}, o);                                                    /* crac ! */
  scintille(A, t + .45, .6, 8, .02, o);
  return {duree:1.4};
};
S.potAcideA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  verreBrise(A, t, .8, o);
  A.joue(t + .05, A.crepitement(1.8, 120, {forme:function(u){ return 1 - u * .8; }}), {g:.5, filtres:[{type:'highpass', f:2500}, {type:'lowpass', f:8000}]}, o);   /* tsss… ça ronge */
  A.bruit(t + .05, {hp:4000, env:[[0, 0], [.1, 1], [1.4, .6], [1.9, 0]], g:.2, rugueux:.6, rugVit:6}, o);
  for(var k = 0; k < 6; k++){ var tt = t + .2 + k * h(.18, .3), f = h(300, 600); A.ton(tt, {f:f, f2:f * 2, gl:.04, env:A.perc(.003, .07), g:.06}, o); }   /* des bulles */
  return {duree:2.1};
};
S.potAcideB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.4});
  O.sploutch(A, t, {g:.8, f:340, bulles:3}, o);
  A.joue(t + .1, A.crepitement(1.4, 90), {g:.45, hp:3000}, o);
  A.modes(t + .25, 420, [[1, 1, 1.4, 1.5], [2.3, .5, 1, 2], [3.6, .3, .6]], {g:.06, chute:.82}, o);                    /* le métal qui fond et gémit */
  return {duree:1.8};
};
S.potHuileA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  verreBrise(A, t, .7, o);
  A.bruit(t + .04, {filtres:[{type:'lowpass', f:1400, pts:[[.35, 250]], q:8}], env:[[0, 0], [.02, 1], [.35, 0]], g:.9}, o);   /* glouc : une flaque épaisse */
  A.ton(t + .05, {f:240, f2:110, gl:.2, env:A.perc(.005, .22), g:.2, sat:1.4}, o);
  O.glisse(A, t + .55, .25, o);                                                                                       /* ça glisse ! */
  return {duree:1.1};
};
S.potHuileB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  A.ton(t, {f:300, f2:80, gl:.15, env:A.perc(.003, .2), g:.4, sat:1.8, lp:1200}, o);                                   /* splotch huileux */
  A.bruit(t, {filtres:[{type:'lowpass', f:2000, pts:[[.25, 300]], q:6}], env:A.perc(.004, .25), g:.8}, o);
  [.35, .7, 1.0].forEach(function(x){ A.goutte(t + x, {f:h(350, 500), monte:1.4, gl:.05, g:.06}, o); });            /* de grosses gouttes lentes */
  return {duree:1.3};
};
S.potColleA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  verreBrise(A, t, .6, o);
  O.sploutch(A, t + .03, {g:1}, o);
  O.etire(A, t + .4, {d:.22, g:.7}, o);
  O.etire(A, t + .75, {d:.3, g:.6}, o);
  return {duree:1.3};
};
S.potColleB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  O.sploutch(A, t, {f:260, g:1.3, bulles:8}, o);                                                                       /* un gros pâté de colle */
  A.bruit(t + .2, {filtres:[{type:'bandpass', f:350, pts:[[.8, 1300]], q:8}], env:[[0, 0], [.6, 1], [.8, 0]], g:1, rugueux:.7, rugVit:5}, o);   /* qui s'étire longtemps */
  A.ton(t + 1.0, {f:800, f2:250, gl:.04, env:A.perc(.001, .05), g:.18}, o);
  return {duree:1.4};
};

/* =================== LE COMBAT =================== */
/* « ça rebondit » : un coup sur un ennemi immunisé (son point faible est fermé) */
S.rebondA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.4});
  O.tinc(A, t, 1500, {g:.12}, o);
  A.ton(t + .02, {f:220, f2:330, gl:.5, env:[[0, 0], [.005, 1], [.5, 0]], g:.25, vib:[17, 45], sat:1.2}, o);           /* boïng */
  return {duree:.8};
};
S.rebondB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.4, pan2:-.6, pant:.4});
  O.tinc(A, t, 1800, {g:.12}, o);
  A.ton(t + .03, {f:3400, f2:1300, gl:.38, env:[[0, 0], [.01, 1], [.32, .5], [.4, 0]], g:.06, vib:[9, 40]}, o);        /* ptiou ! le ricochet */
  A.bruit(t + .03, {bp:2600, bp2:1200, bpt:.35, bq:4, env:[[0, 0], [.01, 1], [.38, 0]], g:.4}, o);
  return {duree:.7};
};
S.rebondC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.4});
  A.choc(t, {f:200, f2:90, d:.1, g:.5, sat:2.5}, o);                                                                    /* tonk */
  O.vibreFleche(A, t + .02, {f:150, t60:.8, g:.35, trem:16}, o);                                                        /* et ça vibre */
  A.ton(t + .45, {f:420, f2:180, gl:.35, env:[[0, 0], [.02, 1], [.4, 0]], g:.08, vib:[8, 25]}, o);                    /* bwoïng… raté */
  return {duree:1.1};
};
/* le point faible qui s'ouvre */
S.faibleA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.4});
  A.bruit(t, {bp:2500, bq:1.2, env:A.perc(.0008, .03), g:.8, sat:3}, o);                                                /* crac */
  A.ton(t + .03, {type:'triangle', f:600, f2:1800, gl:.25, env:[[0, 0], [.02, 1], [.3, 0]], g:.06}, o);
  carillon(A, t + .25, [84, 88], .07, {g:.05, d:1.4}, o);                                                               /* ding ! */
  return {duree:1.6};
};
S.faibleB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.4});
  O.clic(A, t, 3500, .6, o); O.clic(A, t + .12, 2600, .7, o);                                                           /* clic-clac, la serrure */
  A.modes(t + .12, 900, [[1, 1, .12], [2.4, .4, .08]], {g:.08}, o);
  [72, 76, 79, 84].forEach(function(n, k){ A.harpe(t + .2 + k * .07, m(n), {t60:1.6, g:.15}, o); });
  return {duree:1.5};
};

/* =================== LES OBJETS ET LES SALLES =================== */
S.ramasseA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3});
  A.bruit(t, {bp:1500, bq:1, env:[[0, 0], [.04, 1], [.12, 0]], g:.5}, o);                                              /* hop… */
  A.ton(t + .1, {f:600, f2:1100, gl:.05, env:A.perc(.002, .08), g:.15}, o);                                            /* …pop, dans le sac */
  [1568, 2093, 2637].forEach(function(f, k){ A.ton(t + .2 + k * .06, {type:'triangle', f:f, env:A.perc(.002, .3), g:.04}, o); });
  return {duree:.8};
};
S.ramasseB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35});
  A.cloche(t, 1760, {d:.8, rapport:2.76, indice:1.2, g:.05}, o); A.cloche(t + .1, 2349, {d:1, rapport:2.76, indice:1.2, g:.05}, o);   /* tintin */
  A.joue(t + .2, A.crepitement(.35, 60), {g:.3, filtres:[{type:'bandpass', f:1500, q:.8}]}, o);                      /* le sac qui bruisse */
  return {duree:1.0};
};
S.coffreA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4});
  O.clic(A, t, 2800, .6, o); A.choc(t, {f:200, f2:100, d:.06, g:.3}, o);                                               /* le loquet */
  O.grinceArc(A, t + .15, .9, {res:[300, 720, 1500], q:11, g:2.6, i0:.05, i1:.02}, o);                                /* le couvercle grince */
  A.choc(t + 1.1, {f:130, f2:60, d:.15, g:.35, corpsF:300}, o);
  [72, 76, 79, 84, 88].forEach(function(n, k){ A.harpe(t + 1.2 + k * .06, m(n), {t60:1.8, g:.12}, o); });             /* ta-da ! */
  scintille(A, t + 1.25, .5, 8, .02, o);
  return {duree:2.4};
};
S.coffreB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45});
  O.tinc(A, t, 900, {g:.12}, o);                                                                                        /* clac, la serrure */
  A.choc(t + .35, {f:95, f2:45, d:.3, g:.6, sat:2.5, corpsF:280, corps:1.4}, o);                                       /* clonk, le gros couvercle */
  O.toc(A, t + .35, 180, {long:1.6, fc:110, gc:.4, clicF:1500}, o);
  A.choeur(t + .55, [m(67), m(72), m(76)], 1.8, {voyelle:'a', a:.25, r:1.1, g:.045}, o);                              /* aaah, la lumière */
  return {duree:2.5};
};
S.portePierreA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.4, pan:-.2});
  frotte(A, t, 2.2, 1, o);                                                                                             /* la pierre qui frotte */
  A.choc(t + 2.2, {f:80, f2:35, d:.4, g:.8, sat:3.5, corpsF:250, corps:1.5}, o);                                      /* boum, ouverte */
  A.joue(t + 2.25, A.crepitement(.8, 40), {g:.35, filtres:[{type:'bandpass', f:1500, q:.7}]}, o);                     /* un peu de poussière */
  return {duree:3.4};
};
S.portePierreB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.55, grotte:.6, pan:-.2});
  O.clic(A, t, 1800, .6, o); A.choc(t, {f:150, f2:80, d:.08, g:.3}, o);                                              /* le mécanisme */
  frotte(A, t + .3, .7, 1.1, o);
  A.choc(t + 1.0, {f:70, f2:30, d:.6, g:.9, sat:4, corps:1.6}, o);                                                     /* BOUM, d'un coup */
  A.bruit(t + 1.03, {coul:'brun', lp:250, env:[[0, 0], [.1, 1], [1.5, 0]], g:1, sat:2}, o);
  A.joue(t + 1.1, A.crepitement(1.6, 25, {forme:function(u){ return 1 - u; }}), {g:.35, filtres:[{type:'bandpass', f:1200, q:.7}]}, o);   /* la poussière qui retombe */
  return {duree:3.2};
};
/* le piège des dalles : sur les dalles sombres, −15 à toute l'équipe */
S.dallesA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:0});
  O.toc(A, t, 650, {long:.8, fc:220, gc:.3, clicF:3000}, o);                                                           /* clic… */
  A.bruit(t + .55, {bp:900, bq:2, env:[[0, 0], [.1, 1], [.4, .8], [.5, 0]], g:.5, trem:[30, .8]}, o);                 /* …le mécanisme tourne… */
  [0, .12, .24].forEach(function(x, k){ var tt = t + 1.05 + x, oo = A.bus(ici(P, tt), {rev:.3, pan:-.8 + k * .8, pan2:.4 - k * .4, pant:.2});
    A.bruit(tt, {bp:2600, bp2:1500, bpt:.18, bq:5, env:[[0, 0], [.03, 1], [.2, 0]], g:.6}, oo);                       /* pchiou ! */
    A.choc(tt + .2, {f:160, f2:70, d:.1, g:.4}, oo); });
  return {duree:1.7};
};
S.dallesB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.3, pan:0});
  frotte(A, t, .5, .9, o);                                                                                             /* la dalle s'enfonce */
  A.choc(t + .5, {f:110, f2:50, d:.2, g:.5, sat:2.5}, o);
  [0, .14, .3].forEach(function(x, k){ A.choc(t + 1.0 + x, {f:120 - k * 10, f2:50, d:.15, g:.55, sat:2.5, corpsF:380}, A.bus(ici(P, t + 1 + x), {rev:.4, pan:-.6 + k * .6})); });   /* boum, boum, boum : ça tombe sur l'équipe */
  return {duree:1.8};
};
/* la page de sauvegarde du Sage (une page blanche qu'on remplit) */
S.pageSauveA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45});
  papier(A, t, .4, 1, o);                                                                                              /* la page s'ouvre */
  for(var k = 0; k < 14; k++) A.bruit(t + .5 + k * h(.05, .08), {bp:3500, bq:3, env:A.perc(.003, .04), g:h(.15, .3)}, o);   /* la plume qui gratte */
  carillon(A, t + 1.4, [76, 79, 83, 88], .12, {g:.04, d:2}, o);
  A.choeur(t + 1.4, [m(64), m(71)], 2, {voyelle:'ou', a:.4, r:1.2, g:.03}, o);
  return {duree:3.2};
};
S.pageSauveB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5});
  papier(A, t, .3, 1, o); papier(A, t + .32, .3, .8, o);                                                               /* deux pages qui tournent */
  A.nappe(t + .5, [m(72), m(76), m(79), m(84)], 1.8, {a:.4, r:1, lp:4000, lp1:800, g:.03}, o);                         /* la page s'illumine */
  A.cloche(t + .9, m(79), {d:2, g:.06}, o); A.cloche(t + 1.25, m(72), {d:2.2, g:.06}, o);                                /* ding-dong */
  return {duree:3.2};
};
S.codeOkA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4});
  [0, .14, .28].forEach(function(x, k){ O.toc(A, t + x, 700 + k * 120, {long:.7, clicF:3200, gc:.2}, o); });           /* trois pierres */
  [72, 76, 79, 84].forEach(function(n, k){ A.harpe(t + .45 + k * .07, m(n), {t60:1.8, g:.15}, o); });
  scintille(A, t + .6, .4, 6, .02, o);
  return {duree:1.8};
};
S.codeOkB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45});
  carillon(A, t, [79, 84, 88], .1, {g:.06, d:1.6}, o);                                                                 /* le petit carillon */
  A.bruit(t, {coul:'rose', bp:800, bp2:2400, bpt:.5, bq:1, env:[[0, 0], [.2, 1], [.6, 0]], g:.15}, o);
  return {duree:1.8};
};
S.codeNonA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3});
  A.ton(t, {type:'square', f:140, env:[[0, 0], [.01, 1], [.2, .8], [.25, 0]], g:.06, lp:900, trem:[28, .6]}, o);     /* bzzt, doucement */
  A.ton(t + .3, {type:'triangle', f:392, f2:370, gl:.2, env:A.perc(.01, .22), g:.08}, o);
  A.ton(t + .52, {type:'triangle', f:330, f2:300, gl:.3, env:A.perc(.01, .35), g:.08}, o);
  return {duree:1.0};
};
S.codeNonB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35});
  O.toc(A, t, 380, {long:1.2, fc:140, gc:.35}, o);                                                                     /* clonk, la pierre ne bouge pas */
  A.ton(t + .12, {f:600, f2:250, gl:.3, env:[[0, 0], [.02, 1], [.32, 0]], g:.1, vib:[6, 8]}, o);                    /* bwoop */
  return {duree:.8};
};
/* des pas dans le couloir (l'équipe va d'une salle à l'autre) */
S.pasCouloirA = function(A, P){
  var t = P.t, d = 2.8;
  [{f:115, bp:1800, iv:.5, d0:0}, {f:135, bp:2200, iv:.46, d0:.17}, {f:100, bp:1500, iv:.54, d0:.31}].forEach(function(hh, k){
    var lo = A.bus(P, {rev:.4, grotte:.3, pan:-.7 + k * .2, pan2:.6 + k * .1, pant:d});
    for(var x = hh.d0; x < d; x += hh.iv * h(.95, 1.05)) A.pas(t + x, {f:hh.f, bp:hh.bp, g:.65 * Math.sin(Math.PI * Math.min(1, (x + .2) / d))}, lo);
  });
  return {duree:d + .6};
};
S.pasCouloirB = function(A, P){
  var t = P.t, d = 2.2, lo = A.bus(P, {rev:.4, grotte:.3, pan:-.6, pan2:.6, pant:d});
  for(var x = 0; x < d; x += h(.15, .2)){
    A.pas(t + x, {f:h(100, 140), bp:h(1500, 2300), g:.6 * Math.sin(Math.PI * Math.min(1, (x + .1) / d))}, lo);
    if(Math.random() < .35) A.modes(t + x + .02, h(2600, 4200), [[1, 1, .08], [2.7, .4, .05]], {g:.025}, lo);       /* le sac qui tinte */
  }
  return {duree:d + .6};
};
/* Romain, 10 novembre (16 h 33) : « le bruit de course est affreux : un petit bruit plus discret, plus sympathique ».
   C — de petits pas feutrés : on marche, on ne court pas ; pas d'écho de caverne, presque rien dans les aigus */
S.pasCouloirC = function(A, P){
  var t = P.t, d = 1.7, lo = A.bus(P, {rev:.12, pan:-.3, pan2:.3, pant:d});
  for(var x = 0, k = 0; x < d; x += h(.29, .33), k++){
    var g = Math.sin(Math.PI * Math.min(1, (x + .3) / (d + .3))), pied = k % 2 ? 1 : .88;
    A.ton(t + x, {f:150 * pied, f2:72, gl:.06, env:A.perc(.004, .085), g:.3 * g, lp:520}, lo);                                        /* le talon, tout doux */
    A.bruit(t + x + .004, {coul:'rose', filtres:[{type:'bandpass', f:h(650, 950), q:.8}, {type:'lowpass', f:1700}], env:A.perc(.004, .055), g:.2 * g}, lo);   /* la semelle sur la pierre */
  }
  return {duree:d + .35};
};
/* D — un petit trottinement de bois, léger : « tap-tap, tap-tap, tap » (deux notes qui se répondent, comme une comptine) */
S.pasCouloirD = function(A, P){
  var t = P.t, lo = A.bus(P, {rev:.18, pan:-.25, pan2:.25, pant:1.5});
  [[0, 392, 1], [.14, 494, .7], [.44, 392, .9], [.58, 523, .7], [.9, 440, .85], [1.04, 587, .65], [1.36, 523, .8]].forEach(function(n){
    A.modes(t + n[0], n[1], [[1, .8, .11], [2.76, .25, .05], [5.4, .08, .03]], {g:.16 * n[2]}, lo);              /* la lame de bois */
    A.ton(t + n[0], {f:n[1] * .5, f2:n[1] * .42, gl:.05, env:A.perc(.003, .06), g:.08 * n[2], lp:700}, lo);        /* le petit choc du pied */
  });
  return {duree:1.75};
};
/* la brume qui se dissipe sur la carte */
S.brumeCarteA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.6, grotte:.4, pan:-.3, pan2:.3, pant:1.6});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:400, pts:[[1.6, 2400]], q:.9}], env:[[0, 0], [.6, 1], [1.8, 0]], g:.45}, o);   /* pfffouu */
  A.cloche(t + .7, m(91), {d:2.2, rapport:3.5, indice:.7, g:.02}, o);
  return {duree:2.6};
};
S.brumeCarteB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.6, grotte:.5});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:600, pts:[[.9, 1400], [1.8, 900]], q:1.4}], env:[[0, 0], [.8, 1], [1.8, 0]], g:.35}, A.bus(P, {rev:.6, pan:-.7, pan2:.7, pant:1.8}));   /* un vent doux */
  [74, 79, 81].forEach(function(n, k){ A.harpe(t + .6 + k * .2, m(n), {t60:2.4, g:.1}, o); });
  return {duree:2.8};
};

})(window);
