/* Atelier des sons de Brumeval — les bruitages, en plusieurs versions (A, B, C).
   Chaque son est une fonction (A : le moteur, P : la prise, avec P.t l'instant de départ).
   Elle rend {duree, moment} : moment = l'instant clé (le lâcher de la corde, la fin du swish). */
(function(G){
'use strict';
var h = Moteur.hasard;
var S = {};
var RAT = 2300;            /* la hauteur de base d'une voix de rat (Hz) */

/* =================== petits morceaux communs =================== */
function clic(A, t, f, g, dest){ A.bruit(t, {bp:f, bq:1.4, env:[[0, 0], [.0006, 1], [.008, 0]], g:g}, dest); }

/* le bois de l'arc qui grince pendant qu'on tire (des accrocs de plus en plus serrés dans les résonances du bois) */
function grinceArc(A, t, d, o, dest){
  var buf = A.grincement(d, {i0:o.i0 || .034, i1:o.i1 || .011, irr:.4, forme:function(u){ return .3 + .7 * Math.min(1, u * 1.3); }});
  (o.res || [380, 930, 1850]).forEach(function(f, k){
    A.joue(t, buf, {filtres:[{type:'bandpass', f:f, q:o.q || 10}], g:(o.g || 3) * [1, .75, .5][k], env:[[0, 0], [.06, 1], [d - .05, 1], [d, 0]]}, dest);
  });
}
/* la corde qui part : le clic, la corde grave qui vibre, le bois qui se détend, la claque */
function lacherCorde(A, t, o, dest){
  var t60 = o.t60 || .45;
  clic(A, t, 3000, o.clic || .5, dest);
  A.joue(t, A.pince(o.f || 98, {t60:t60, eclat:o.eclat || .4, pos:.1}), {g:o.gc || .8, lp:o.lp || 2200, sat:o.sat || 1.6, vit:1, vit2:.965}, dest);   /* la corde : grave, un peu de bourdonnement, la note qui retombe */
  A.choc(t + .003, {f:o.ft || 150, f2:72, d:.09, g:o.gt || .4, sat:2, corpsF:260}, dest);
  A.bruit(t + .002, {coul:'rose', bp:700, bq:1.5, env:A.perc(.002, .06), g:o.claque || 1.2}, dest);   /* la claque de la corde */
  A.bruit(t + .01, {bp:1300, bp2:2600, bpt:.1, bq:1.5, env:[[0, 0], [.03, 1], [.12, 0]], g:.2}, dest);   /* la flèche qui part */
}
/* le sifflement de la flèche en vol */
function sifflement(A, t, d, o, dest){
  var env = o.env || [[0, 0], [d * .32, 1], [d * .8, .6], [d, 0]];
  A.bruit(t, {bp:o.f1, bp2:o.f2, bpt:d, bq:o.q || 14, env:env, g:o.gb == null ? 1.6 : o.gb, trem:o.trem}, dest);
  if(o.gt) A.ton(t, {f:o.f1, f2:o.f2, gl:d, env:env, g:o.gt, gigue:o.gigue || 20, vib:o.vib, trem:o.trem}, dest);
  A.bruit(t, {bp:900, bq:1, env:env, g:o.air == null ? .25 : o.air}, dest);
}
/* un « toc » dans le bois */
function toc(A, t, base, o, dest){
  clic(A, t, o.clicF || 2800, o.clic || .6, dest);
  A.modes(t, base, [[1, .8, .12 * (o.long || 1)], [2.31, .5, .08 * (o.long || 1)], [3.93, .32, .06], [5.6, .2, .04]], {g:o.g || .3}, dest);
  A.choc(t, {f:o.fc || 170, f2:(o.fc || 170) * .55, d:.08 * (o.long || 1), g:o.gc || .3, sat:1.8}, dest);
}
/* la flèche plantée qui vibre : « dwoïng » */
function vibreFleche(A, t, o, dest){
  A.joue(t, A.pince(o.f || 190, {t60:o.t60 || .9, eclat:.45}), {g:o.g || .35, lp:o.lp || 2600, trem:[o.trem || 28, .95], sat:1.5, vit2:o.monte}, dest);
}
/* le swish d'une lame */
function swish(A, t, d, o, dest){
  var env = [[0, 0], [d * .62, 1], [d, 0]];
  A.bruit(t, {filtres:[{type:'bandpass', f:o.f1 || 700, pts:[[d * .62, o.f2 || 3400], [d, o.f3 || 1500]], q:o.q || 2.5}], env:env, g:o.g || 1.1}, dest);
  A.bruit(t, {hp:5000, env:env, g:(o.g || 1.1) * .12}, dest);
}
/* le chant d'une lame (shiiing) */
function chantLame(A, t, o, dest){
  A.modes(t, o.f || 2900, [[1, 1, .7, 2], [1.47, .6, .55, 3], [2.09, .45, .45], [2.56, .3, .35], [3.21, .2, .25]], {g:o.g || .06, a:.02}, dest);
}
/* la lame dans la chair : la claque, le coup sourd, un peu mouillé */
function tchac(A, t, o, dest){
  var g = o.g || 1;
  A.bruit(t, {bp:1100, bq:1, env:A.perc(.001, .03), g:.8 * g}, dest);
  A.choc(t, {f:170, f2:70, d:.11, g:.5 * g}, dest);
  A.bruit(t + .01, {filtres:[{type:'lowpass', f:2000, pts:[[.07, 400]], q:5}], env:A.perc(.003, .07), g:.5 * g * (o.mouille == null ? 1 : o.mouille)}, dest);
}
/* une frappe sur du métal */
function tinc(A, t, f, o, dest){
  clic(A, t, 5200, o.clic || .6, dest);
  A.modes(t, f, [[1, 1, .55, 3], [2.76, .5, .32, 4], [5.4, .3, .18], [8.93, .15, .1]], {g:o.g || .22}, dest);
  A.bruit(t, {hp:6000, env:A.perc(.0005, .025), g:.25}, dest);
}
/* le BONG de la louche sur la marmite : des harmoniques tordues qui battent entre elles */
function bong(A, t, f, o, dest){
  var l = o.long || 1;
  A.bruit(t, {bp:1900, bq:1.2, env:A.perc(.0008, .018), g:.8}, dest);
  A.choc(t, {f:120, f2:65, d:.1, g:.4}, dest);
  A.modes(t, f, [[1, 1, 2.4 * l, 1.1], [1.52, .55, 1.8 * l, 1.6], [2.03, .45, 1.5 * l], [2.61, .38, 1.2 * l, 2.2], [3.27, .3, .9 * l], [4.11, .2, .7 * l], [5.2, .12, .5 * l], [6.6, .07, .3]], {g:o.g || .2, chute:o.chute}, dest);
}
/* le sifflement d'un rat en colère (comme un chat) */
function sifflementRat(A, t, d, g, dest){
  A.bruit(t, {filtres:[{type:'highpass', f:2500}, {type:'bandpass', f:4800, q:.9}], env:[[0, 0], [.02, 1], [d * .7, .7], [d, 0]], g:g, rugueux:.5, rugVit:4}, dest);
}
/* les dents qui claquent (le rat qui grince des dents de rage) */
function dents(A, t, n, dest){
  for(var k = 0; k < n; k++) A.bruit(t + k * h(.058, .075), {bp:3200, bq:5, env:A.perc(.0005, .009), g:h(.6, 1)}, dest);
}
/* le feu qui prend : fwoosh */
function embrase(A, t, g, dest){
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:280, pts:[[.25, 2200], [.5, 900]], q:.8}], env:[[0, 0], [.08, 1], [.5, 0]], g:.9 * g}, dest);
  A.bruit(t, {coul:'brun', lp:400, env:[[0, 0], [.05, 1], [.45, 0]], g:.6 * g}, dest);
}
/* la braise qui grésille et crépite, longtemps */
function gresille(A, t, d, o, dest){
  var g = o.g || 1, apres = o.apres || .55;
  A.bruit(t, {hp:o.hp || 4200, env:[[0, 0], [.15, .35], [apres, .4], [apres + .25, 1], [d * .65, .6], [d, 0]], g:.13 * g, rugueux:.7, rugVit:2}, dest);
  A.joue(t, A.crepitement(d, o.densite || 28, {forme:function(u){ var x = u * d; return Math.min(1, x / apres * .5 + (x > apres ? .5 : 0)) * Math.pow(1 - u, 1.3); }}),
    {g:.4 * g, env:[[0, 1], [d * .7, 1], [d, 0]], filtres:[{type:'highpass', f:900}, {type:'peaking', f:3200, q:1, gain:5}]}, dest);
}
/* le sploutch de la colle */
function sploutch(A, t, o, dest){
  var g = o.g || 1;
  A.ton(t, {f:o.f || 380, f2:70, gl:.11, env:A.perc(.003, .12), g:.5 * g, sat:1.6, lp:1500}, dest);
  A.bruit(t, {filtres:[{type:'lowpass', f:2600, pts:[[.18, 200]], q:7}], env:[[0, 0], [.004, 1], [.05, .55], [.2, 0]], g:.8 * g}, dest);
  for(var k = 0; k < (o.bulles == null ? 4 : o.bulles); k++){
    var tt = t + .06 + Math.random() * .2, f = h(260, 520);
    A.ton(tt, {f:f, f2:f * h(1.8, 2.6), gl:.03, env:A.perc(.002, .04), g:h(.06, .14) * g}, dest);
  }
}
/* la colle qui s'étire puis lâche (tchlok) */
function etire(A, t, o, dest){
  var d = o.d || .16, g = o.g || 1;
  A.bruit(t, {filtres:[{type:'bandpass', f:450, pts:[[d, 1500]], q:9}], env:[[0, 0], [d * .7, 1], [d, 0]], g:1.2 * g, rugueux:.6, rugVit:5}, dest);
  A.ton(t + d, {f:900, f2:280, gl:.035, env:A.perc(.001, .04), g:.22 * g}, dest);
  A.bruit(t + d, {bp:1800, bq:2, env:A.perc(.0005, .015), g:.35 * g}, dest);
}
/* le dérapage sur l'huile */
function glisse(A, t, d, dest){
  A.bruit(t, {filtres:[{type:'bandpass', f:900, pts:[[d, 2600]], q:8}], env:[[0, 0], [.04, 1], [d * .8, .8], [d, 0]], g:1.4, rugueux:.3}, dest);
  A.ton(t, {type:'triangle', f:900, f2:2600, gl:d, env:[[0, 0], [.04, 1], [d * .8, .7], [d, 0]], g:.14, gigue:40}, dest);
}
/* une petite toux de rat */
function toux(A, t, o, dest){
  var g = o.g || 1, hh = o.h || 1;
  A.bruit(t, {bp:(o.f || 1700) * hh, bq:1.4, env:[[0, 0], [.005, 1], [.04, .35], [.09 * (o.long || 1), 0]], g:.9 * g, rugueux:o.gras, rugVit:8}, dest);
  A.bruit(t, {bp:3600 * hh, bq:3, env:[[0, 0], [.004, 1], [.03, .3], [.07, 0]], g:.45 * g}, dest);
  A.cri(t, {forme:'toux', d:.05, h:.78 * hh, rauque:.6, grain:.9, souffle:0, g:.13 * g}, dest);
}
function quinte(A, t, n, o, dest){
  var x = 0;
  for(var k = 0; k < n; k++){ toux(A, t + x, {g:1 - k * .14, h:(o.h || 1) * h(.96, 1.04), f:o.f, gras:o.gras, long:o.long}, dest); x += h(.11, .15) * (o.long || 1); }
  return x;
}
/* l'inspiration qui siffle entre deux quintes */
function inspire(A, t, d, dest){
  A.bruit(t, {bp:2400, bp2:3300, bpt:d, bq:5, env:[[0, 0], [d * .35, 1], [d, 0]], g:.5}, dest);
  A.ton(t, {f:2800, f2:3100, gl:d, env:[[0, 0], [d * .35, 1], [d, 0]], g:.02}, dest);
}
/* le BOUM de l'explosion (le grave est saturé : on l'entend aussi sur une tablette) */
function boum(A, t, o, dest){
  var g = o.g || 1;
  A.bruit(t, {hp:1500, env:A.perc(.001, .06), g:.9 * g}, dest);
  A.ton(t, {f:140, f2:32, gl:1.1, env:[[0, 0], [.003, 1], [.3, .5], [1.5, 0]], g:.9 * g, sat:3, lp:900}, dest);
  A.bruit(t, {coul:'rose', filtres:[{type:'lowpass', f:3000, pts:[[1.2, 120]], q:.8}], env:[[0, 0], [.004, 1], [.25, .45], [1.6, 0]], g:1.6 * g}, dest);
  A.bruit(t + .05, {coul:'brun', lp:260, env:[[0, 0], [.08, 1], [2.2, 0]], g:1.4 * g}, dest);
  A.joue(t + .03, A.crepitement(.9, 30), {g:.35 * g, hp:1500}, dest);
}
/* la brume noire qui s'échappe : un souffle qui se dissipe */
function brume(A, t, g, dest){
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:500, pts:[[1.4, 1400]], q:.9}], env:[[0, 0], [.25, 1], [1.6, 0]], g:.6 * g}, dest);
}
/* de petites étoiles qui tombent */
function etincelles(A, t, g, dest){
  [96, 93, 91, 88, 86, 84, 81, 79, 76, 74].forEach(function(n, k){ A.ton(t + k * .055, {type:'triangle', f:A.midi(n), env:A.perc(.002, .5), g:.05 * g}, dest); });
}
/* un cuivre de fanfare : trois dents de scie, le filtre qui s'ouvre, un vibrato qui arrive */
function cuivre(A, t, f, d, g, dest){
  [-6, 0, 7].forEach(function(det){
    A.ton(t, {type:'sawtooth', f:f, det:det, env:[[0, 0], [.035, 1], [d * .7, .85], [d, 0]], g:g, filtres:[{type:'lowpass', f:600, pts:[[.06, 3400], [.3, 1900]], q:1.2}], vib:[5.5, f * .006], vibRetard:.25}, dest);
  });
}
function timbale(A, t, g, dest){
  A.ton(t, {f:98, f2:92, gl:.4, env:[[0, 0], [.004, 1], [.2, .5], [.9, 0]], g:.6 * g, sat:1.6, lp:1200}, dest);
  A.bruit(t, {coul:'rose', lp:700, env:A.perc(.002, .08), g:.4 * g}, dest);
}

/* =================== 1. L'ARC =================== */
S.arcA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:-.35});
  A.bruit(t, {bp:2600, bq:3, env:A.perc(.001, .02), g:.35}, o);                              /* la flèche qu'on encoche */
  grinceArc(A, t + .08, .7, {}, o);
  A.bruit(t + .1, {bp:2200, bq:3, env:[[0, 0], [.3, .5], [.66, 1], [.7, 0]], g:.06, rugueux:.6}, o);   /* la flèche qui frotte */
  lacherCorde(A, t + .8, {f:98, t60:.5}, o);
  return {duree:1.4, moment:.8};
};
S.arcB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.2, pan:-.35});
  A.bruit(t, {filtres:[{type:'bandpass', f:1200, pts:[[.45, 2600]], q:2}], env:[[0, 0], [.3, 1], [.46, .8], [.48, 0]], g:.45, rugueux:.8, rugVit:3}, o);   /* la corde qu'on tend vite */
  lacherCorde(A, t + .5, {f:140, t60:.18, clic:.6, claque:1.0, gt:.45, sat:2.4, eclat:.7, lp:3200}, o);
  return {duree:.9, moment:.5};
};
S.arcC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4, pan:-.35});
  clic(A, t, 2400, .5, o);
  grinceArc(A, t + .1, 1.0, {i0:.045, i1:.012, res:[260, 640, 1300], q:12, g:3.4}, o);
  A.bruit(t + .12, {bp:1900, bq:3, env:[[0, 0], [.5, .5], [.95, 1], [1, 0]], g:.05, rugueux:.6}, o);
  lacherCorde(A, t + 1.12, {f:78, t60:.95, gc:.9, ft:120, gt:.5, eclat:.5}, o);
  return {duree:2.2, moment:1.12};
};

/* =================== 2. LA FLÈCHE EN VOL =================== */
S.volA = function(A, P){
  var d = .5, o = A.bus(P, {rev:.18, pan:-.5, pan2:.6, pant:d});
  sifflement(A, P.t, d, {f1:2700, f2:1900, q:14, gt:.06}, o);
  return {duree:d};
};
S.volB = function(A, P){
  var d = .45, t = P.t, o = A.bus(P, {rev:.18, pan:-.5, pan2:.6, pant:d}), env = [[0, 0], [d * .45, 1], [d, 0]];
  A.bruit(t, {filtres:[{type:'bandpass', f:700, pts:[[d * .45, 1700], [d, 900]], q:1.2}], env:env, g:.7}, o);
  A.bruit(t, {hp:4000, env:env, g:.1}, o);
  return {duree:d};
};
S.volC = function(A, P){
  var d = .6, o = A.bus(P, {rev:.2, pan:-.5, pan2:.6, pant:d});
  sifflement(A, P.t, d, {f1:3000, f2:1700, q:10, gt:.1, vib:[9, 40], trem:[36, .7], env:[[0, 0], [.12, 1], [.45, .7], [d, 0]], air:.2}, o);
  return {duree:d};
};

/* =================== 3. LA FLÈCHE PLANTÉE =================== */
S.chairFA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.2, pan:.45});
  A.choc(t, {f:240, f2:85, d:.1, g:.6, sat:2.2, blp:1100}, o);
  A.bruit(t, {hp:3000, env:A.perc(.0005, .005), g:.35}, o);
  return {duree:.3};
};
S.chairFB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.2, pan:.45});
  A.choc(t, {f:240, f2:85, d:.1, g:.55, sat:2.2, blp:1100}, o);
  A.bruit(t + .005, {filtres:[{type:'lowpass', f:1800, pts:[[.12, 250]], q:7}], env:[[0, 0], [.004, 1], [.04, .5], [.13, 0]], g:.6}, o);
  A.ton(t + .01, {f:320, f2:120, gl:.08, env:A.perc(.003, .08), g:.25}, o);
  return {duree:.35};
};
S.chairFC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.2, pan:.45});
  A.choc(t, {f:240, f2:85, d:.1, g:.6, sat:2.2, blp:1100}, o);
  A.bruit(t, {hp:3000, env:A.perc(.0005, .005), g:.35}, o);
  vibreFleche(A, t + .004, {f:170, t60:.35, g:.3, lp:1800, trem:22}, o);
  return {duree:.5};
};
S.boisA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.5});
  toc(A, t, 420, {}, o);
  vibreFleche(A, t + .01, {t60:.25, g:.15}, o);
  return {duree:.45};
};
S.boisB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.5});
  toc(A, t, 420, {}, o);
  vibreFleche(A, t + .01, {f:180, t60:1.0, g:.45, trem:26, monte:1.07}, o);
  return {duree:1.2};
};
S.boisC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, pan:.5});
  toc(A, t, 230, {long:1.8, fc:120, gc:.5, clicF:2000}, o);
  vibreFleche(A, t + .01, {f:150, t60:.6, g:.25, trem:24}, o);
  return {duree:1.0};
};

/* =================== 4. LA DAGUE =================== */
S.swishA = function(A, P){
  var o = A.bus(P, {rev:.15, pan:.1});
  swish(A, P.t, .22, {}, o);
  return {duree:.22, moment:.2};
};
S.swishB = function(A, P){
  var o = A.bus(P, {rev:.15, pan:.1});
  swish(A, P.t, .16, {f1:900, f2:3000, f3:1800, g:.6}, o);
  swish(A, P.t + .2, .2, {f1:600, f2:3600, f3:1400, g:1.1}, o);
  return {duree:.42, moment:.39};
};
S.swishC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.1});
  A.bruit(t, {bp:5500, bq:5, env:[[0, 0], [.01, 1], [.08, .6], [.12, 0]], g:.5}, o);          /* la lame qui glisse */
  swish(A, t + .05, .22, {}, o);
  chantLame(A, t + .06, {}, o);
  return {duree:.7, moment:.25};
};
S.chairDA = function(A, P){
  tchac(A, P.t, {}, A.bus(P, {rev:.2, pan:.4}));
  return {duree:.3};
};
S.chairDB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.2, pan:.4});
  A.choc(t, {f:120, f2:55, d:.15, g:.7, sat:3}, o);
  A.bruit(t, {coul:'rose', lp:500, env:A.perc(.002, .1), g:.5}, o);
  return {duree:.3};
};
S.chairDC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.2, pan:.4});
  A.bruit(t, {filtres:[{type:'bandpass', f:3000, pts:[[.05, 1200]], q:2}], env:A.perc(.002, .05), g:.7}, o);   /* la lame qui tranche */
  tchac(A, t + .02, {mouille:1.4}, o);
  return {duree:.35};
};
S.metalA = function(A, P){
  tinc(A, P.t, 1350, {}, A.bus(P, {rev:.3, pan:.4}));
  return {duree:.7};
};
S.metalB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.4});
  clic(A, t, 4200, .7, o);
  A.choc(t, {f:200, f2:110, d:.08, g:.35}, o);
  A.modes(t, 520, [[1, 1, 1.1, 1.5], [1.59, .7, .85, 2], [2.14, .55, .7], [2.3, .5, .6, 2.5], [2.65, .4, .5], [3.6, .3, .35], [5.1, .18, .2]], {g:.18}, o);
  return {duree:1.3};
};
S.metalC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  tinc(A, t, 1150, {}, o);
  A.bruit(t + .02, {bp:4200, bp2:2200, bpt:.25, bq:12, env:[[0, 0], [.01, 1], [.2, .6], [.27, 0]], g:1.2}, o);   /* la lame qui ripe */
  tinc(A, t + .22, 1700, {g:.08, clic:.3}, o);
  return {duree:.9};
};

/* =================== 5. LES RATS TOUCHÉS =================== */
/* — par une flèche : un couinement bref — */
S.ratFlecheA = function(A, P){
  A.cri(P.t, {forme:'iik', d:.15, f:RAT * h(.96, 1.04), grain:.5, souffle:.2, g:.32}, A.bus(P, {rev:.25, pan:.45}));
  return {duree:.3};
};
S.ratFlecheB = function(A, P){
  var o = A.bus(P, {rev:.25, pan:.45});
  A.cri(P.t, {forme:'iik', d:.07, h:.92, g:.24}, o);
  A.cri(P.t + .09, {forme:'iik', d:.17, h:1.08, grain:.55, g:.32}, o);
  return {duree:.4};
};
S.ratFlecheC = function(A, P){
  var o = A.bus(P, {rev:.25, pan:.45});
  A.cri(P.t, {forme:'aie', d:.24, h:.88, rauque:.35, grain:.7, g:.34}, o);
  A.cri(P.t + .3, {forme:'plainte', d:.2, h:.8, g:.15, souffle:.35}, o);
  return {duree:.6};
};
/* — par la dague : un couinement et un choc sourd — */
S.ratDagueA = function(A, P){
  var o = A.bus(P, {rev:.22, pan:.4});
  A.choc(P.t, {f:160, f2:60, d:.11, g:.55}, o);
  A.cri(P.t + .025, {forme:'aie', d:.2, rauque:.2, grain:.6, g:.32}, o);
  return {duree:.35};
};
S.ratDagueB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.22, pan:.4});
  A.choc(t, {f:130, f2:55, d:.15, g:.65, sat:3}, o);
  A.cri(t + .03, {forme:'cri', d:.34, h:.95, rauque:.5, grain:.8, g:.34}, o);
  [.5, .62, .74].forEach(function(x, k){ A.bruit(t + x, {bp:3000, bq:1.5, env:[[0, 0], [.02, 1], [.07, 0]], g:.18 - k * .04}, o); });   /* il souffle vite */
  return {duree:.85};
};
S.ratDagueC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.22, pan:.4});
  A.choc(t, {f:150, f2:60, d:.12, g:.55}, o);
  sifflementRat(A, t + .04, .26, .6, o);
  A.cri(t + .3, {forme:'iik', d:.13, h:1.05, rauque:.25, g:.3}, o);
  return {duree:.5};
};
/* — par le feu : un cri, et le grésillement qui continue — */
S.ratFeuA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  embrase(A, t, 1, o);
  A.cri(t + .05, {forme:'cri', d:.65, h:1.08, rauque:.5, grain:.8, g:.36, trille:[13, .03]}, o);
  gresille(A, t + .15, 3, {apres:.6}, o);
  return {duree:3.2};
};
S.ratFeuB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  embrase(A, t, 1, o);
  A.cri(t + .05, {forme:'cri', d:.55, h:1.05, rauque:.5, grain:.8, g:.34}, o);
  A.cri(t + 1.05, {forme:'iik', d:.1, h:1.15, rauque:.2, g:.26}, o);
  A.cri(t + 1.55, {forme:'iik', d:.1, h:1.2, rauque:.2, g:.24}, o);
  A.cri(t + 2.1, {forme:'iik', d:.09, h:1.12, g:.2}, o);
  gresille(A, t + .15, 3.2, {apres:.5}, o);
  return {duree:3.4};
};
S.ratFeuC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  embrase(A, t, 1.2, o);
  A.cri(t + .05, {forme:'cri', d:.8, h:1.25, rauque:.4, grain:.7, g:.36, trille:[14, .08]}, o);
  [0, .14, .28].forEach(function(x){ A.cri(t + .95 + x, {forme:'aie', d:.1, h:1.2, rauque:.3, g:.24}, o); });
  gresille(A, t + .12, 3, {g:1.3, hp:5500, densite:40, apres:.75}, o);
  return {duree:3.2};
};
/* — par la lumière : un gémissement d'ébloui — */
S.ratLumiereA = function(A, P){
  var o = A.bus(P, {rev:.3, pan:.45});
  A.cri(P.t, {forme:'plainte', d:.85, h:.82, souffle:.5, grain:.45, g:.3, a:.06, trille:[7, .025]}, o);
  A.cri(P.t + 1.0, {forme:'plainte', d:.4, h:.75, souffle:.6, g:.17, a:.05}, o);
  return {duree:1.5};
};
S.ratLumiereB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.45});
  A.cri(t, {forme:'iik', d:.12, h:1.15, g:.28}, o);
  A.cri(t + .2, {forme:'plainte', d:.7, h:.85, souffle:.45, g:.28, a:.05, trille:[6, .03]}, o);
  [.95, 1.05, 1.17, 1.27].forEach(function(x){ A.bruit(t + x, {bp:h(3000, 5000), bq:1.5, env:A.perc(.01, .05), g:.1}, o); });   /* il se frotte les yeux */
  return {duree:1.45};
};
S.ratLumiereC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.45});
  [0, 1, 2].forEach(function(k){ A.cri(t + k * .32, {forme:'question', d:.2, h:.92 - k * .05, g:.26, souffle:.3}, o); });
  A.cri(t + 1.05, {forme:'plainte', d:.9, h:.8, souffle:.4, g:.26, a:.06, trille:[4.5, .07]}, o);
  return {duree:2.1};
};
/* — par la louche : le BONG, puis un grognement furieux — */
S.ratLoucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.45});
  bong(A, t, 205, {g:.28}, o);
  sifflementRat(A, t + .55, .35, .3, o);
  dents(A, t + .92, 7, o);
  A.cri(t + 1.38, {forme:'cri', d:.42, h:.7, rauque:.8, grain:.9, g:.36}, o);
  return {duree:2.6};
};
S.ratLoucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.45});
  bong(A, t, 205, {g:.28}, o);
  A.ton(t + .55, {type:'sawtooth', f:150, f2:135, env:[[0, 0], [.05, 1], [.55, .8], [.7, 0]], g:.3, gigue:25, trem:[27, .9], filtres:[{type:'peaking', f:700, q:1.5, gain:6}, {type:'lowpass', f:1500, q:.7}]}, o);   /* grrrr */
  A.bruit(t + .55, {bp:1200, bq:1, env:[[0, 0], [.05, 1], [.55, .8], [.7, 0]], g:.35, rugueux:.9, rugVit:6}, o);
  A.cri(t + 1.3, {forme:'cri', d:.3, h:.75, rauque:.7, grain:.9, g:.34}, o);
  A.cri(t + 1.7, {forme:'aie', d:.25, h:.8, rauque:.6, grain:.9, g:.32}, o);
  return {duree:2.6};
};
S.ratLoucheC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, pan:.45});
  bong(A, t, 165, {long:1.4, chute:.985, g:.28}, o);
  dents(A, t + .7, 6, o);
  A.cri(t + 1.1, {forme:[[0, .6], [.6, 1.1], [1, 1.25]], d:.7, h:.75, rauque:.7, grain:.9, g:.36}, o);
  return {duree:3.2};
};
/* — dans la colle : il se débat, couine, et la colle fait sploutch — */
S.ratColleA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  sploutch(A, t, {}, o);
  for(var k = 0; k < 4; k++){
    var x = t + .4 + k * .38;
    etire(A, x, {d:.16, g:.6}, o);
    A.cri(x + .04, {forme:'effort', d:.13, h:.9 + k * .04, rauque:.3, grain:.7, g:.36}, o);
  }
  sploutch(A, t + 2.0, {g:.7}, o);
  return {duree:2.5};
};
S.ratColleB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.45});
  sploutch(A, t, {f:300, g:1.3, bulles:7}, o);
  [.5, 1.2].forEach(function(x, k){
    etire(A, t + x, {d:.3, g:.7}, o);
    A.cri(t + x + .05, {forme:'aie', d:.25, h:.88 + k * .06, rauque:.4, grain:.8, g:.38}, o);
  });
  sploutch(A, t + 1.85, {g:.9}, o);
  return {duree:2.4};
};
S.ratColleC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  sploutch(A, t, {}, o);
  for(var k = 0; k < 6; k++){
    var x = t + .35 + k * .21;
    etire(A, x, {d:.09, g:.5}, o);
    A.cri(x + .02, {forme:'peur', d:.09, h:1.05 + (k % 2) * .1, g:.34}, o);
  }
  sploutch(A, t + 1.75, {g:.8}, o);
  return {duree:2.2};
};
/* — sur l'huile : il glisse (fwiiit), cri de surprise, puis la chute — */
S.ratHuileA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.35, pan2:.6, pant:.7});
  glisse(A, t, .35, o);
  A.cri(t + .36, {forme:[[0, .8], [.3, 1.35], [1, 1.2]], d:.18, h:1.1, grain:.5, g:.32}, o);
  A.choc(t + .72, {f:150, f2:55, d:.13, g:.6}, o);
  A.choc(t + .86, {f:170, f2:70, d:.07, g:.25}, o);
  A.joue(t + .95, A.griffes(.35, 22), {g:.35, hp:2500}, o);
  return {duree:1.4};
};
S.ratHuileB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.35, pan2:.6, pant:.7});
  A.ton(t, {f:500, f2:2600, gl:.38, env:[[0, 0], [.03, 1], [.36, .8], [.4, 0]], g:.13, vib:[7, 25]}, o);   /* le sifflet de dessin animé */
  A.cri(t + .42, {forme:[[0, .8], [.3, 1.35], [1, 1.2]], d:.18, h:1.15, g:.3}, o);
  A.choc(t + .75, {f:200, f2:60, d:.12, g:.6}, o);
  A.cri(t + 1.0, {forme:'plainte', d:.3, h:.8, g:.16, souffle:.4}, o);
  return {duree:1.45};
};
S.ratHuileC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.35, pan2:.6, pant:.9});
  glisse(A, t, .35, o);
  A.cri(t + .36, {forme:[[0, .8], [.3, 1.35], [1, 1.2]], d:.2, h:1.1, g:.32}, o);
  A.ton(t + .58, {f:2400, f2:600, gl:.5, env:[[0, 0], [.03, 1], [.45, .7], [.5, 0]], g:.09, vib:[8, 30]}, o);   /* la chute qui siffle */
  A.choc(t + 1.1, {f:140, f2:45, d:.2, g:.75, sat:3}, o);
  A.bruit(t + 1.1, {coul:'rose', lp:1500, env:A.perc(.02, .35), g:.35}, o);   /* la poussière */
  return {duree:1.8};
};
/* — dans le nuage : trois quintes de toux — */
S.ratNuageA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  var x = quinte(A, t, 4, {}, o);
  inspire(A, t + x + .1, .22, o);
  var t2 = t + x + .42; x = quinte(A, t2, 3, {h:1.05}, o);
  inspire(A, t2 + x + .1, .22, o);
  var t3 = t2 + x + .42; x = quinte(A, t3, 4, {h:.97}, o);
  return {duree:t3 + x + .3 - t};
};
S.ratNuageB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  var x = quinte(A, t, 3, {}, o);
  inspire(A, t + x + .1, .2, o);
  var t2 = t + x + .38; x = quinte(A, t2, 3, {h:1.05}, o);
  var t3 = t2 + x + .2;
  x = quinte(A, t3, 2, {h:1.02}, o);
  A.cri(t3 + x + .15, {forme:'question', d:.09, h:1.0, g:.2}, o);                /* hi... */
  A.cri(t3 + x + .3, {forme:'question', d:.1, h:1.1, g:.22}, o);                 /* ...hi... */
  A.bruit(t3 + x + .45, {hp:2000, env:A.perc(.002, .12), g:1.1}, o);              /* ...tchi ! */
  A.cri(t3 + x + .46, {forme:'toux', d:.06, h:1.1, g:.15}, o);
  return {duree:t3 + x + .75 - t};
};
S.ratNuageC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  var opt = {f:1100, gras:.9, long:1.25, h:.95};
  var x = quinte(A, t, 3, opt, o);
  inspire(A, t + x + .1, .32, o);
  var t2 = t + x + .52; x = quinte(A, t2, 4, opt, o);
  inspire(A, t2 + x + .1, .32, o);
  var t3 = t2 + x + .52; x = quinte(A, t3, 3, opt, o);
  return {duree:t3 + x + .35 - t};
};
/* — le coup critique : un gros cri et l'explosion — */
S.ratCritiqueA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.4});
  A.cri(t, {forme:'cri', d:.6, h:1.1, rauque:.75, grain:.9, g:.4, trille:[11, .035]}, o);
  boum(A, t + .55, {}, o);
  brume(A, t + .65, 1, o);
  return {duree:2.8};
};
S.ratCritiqueB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, grotte:.8, pan:.4});
  A.cri(t, {forme:'cri', d:.32, h:1.15, rauque:.75, grain:.9, g:.4}, o);
  boum(A, t + .26, {g:1.2}, o);
  brume(A, t + .4, .8, o);
  return {duree:3.2};
};
S.ratCritiqueC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, pan:.4});
  A.cri(t, {forme:'cri', d:.55, h:1.1, rauque:.6, grain:.8, g:.38}, o);
  boum(A, t + .5, {g:.7}, o);
  etincelles(A, t + .55, 1, o);
  brume(A, t + .6, 1.1, o);
  return {duree:2.6};
};
/* — la fuite : des couinements de peur qui s'éloignent — */
S.ratFuiteA = function(A, P){
  var t = P.t, d = 1.5, lo = A.lointain(P, t, d, {pan1:.2, pan2:.95, fin:.08, lp2:1500});
  var x = 0;
  for(var k = 0; k < 6; k++){ A.cri(t + x, {forme:'peur', d:h(.09, .14), h:h(1.05, 1.25), grain:.6, g:.32}, lo); x += h(.15, .22); }
  A.joue(t, A.griffes(1.35, 24), {g:.45, hp:2500, filtres:[{type:'peaking', f:4200, q:1, gain:4}]}, lo);
  return {duree:2.0};
};
S.ratFuiteB = function(A, P){
  var t = P.t, d = 2.4, lo = A.lointain(P, t, d, {pan1:.2, pan2:.9, fin:.1, lp2:1200, grotte:true, rev2:1.2}), ec = A.echo(lo, {temps:.23, retour:.35, lp:2000, sortie:.5});
  var voix = A.gain(1); voix.connect(lo); voix.connect(ec);
  var x = 0;
  for(var k = 0; k < 6; k++){ A.cri(t + x, {forme:'peur', d:h(.11, .16), h:1.18 - k * .04, grain:.6, g:.3}, voix); x += h(.28, .36); }
  A.joue(t, A.griffes(2.2, 20), {g:.35, hp:2500}, lo);
  A.plusTard(5, ec.couper);
  return {duree:3.4};
};
S.ratFuiteC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.2, pan:.4});
  A.cri(t, {forme:'peur', d:.14, h:1.2, g:.32}, o);
  A.bruit(t + .12, {filtres:[{type:'bandpass', f:400, pts:[[.18, 3200]], q:2}], env:[[0, 0], [.15, 1], [.2, 0]], g:.8}, o);   /* zip ! */
  var lo = A.lointain(P, t + .3, .7, {pan1:.6, pan2:1, fin:.1, lp2:2000});
  for(var k = 0; k < 4; k++) A.cri(t + .32 + k * .1, {forme:'peur', d:.06, h:1.3 - k * .04, g:.24}, lo);
  return {duree:1.2};
};

/* =================== 6. VICTOIRE ET FUITE DES HÉROS =================== */
S.victoireA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45});
  [[0, 392], [.15, 523.3], [.3, 659.3]].forEach(function(n){ cuivre(A, t + n[0], n[1], .14, .07, o); });
  cuivre(A, t + .45, 784, .45, .08, o);
  for(var k = 0; k < 6; k++) timbale(A, t + .62 + k * .055, .25 + k * .05, o);
  timbale(A, t + .95, 1, o);
  [261.6, 329.6, 392, 523.3].forEach(function(f){ cuivre(A, t + .95, f, 1.6, .045, o); });
  A.bruit(t + .95, {hp:6000, env:A.perc(.003, 1.4), g:.1}, o);                        /* la cymbale */
  etincelles(A, t + 1.05, .8, o);
  return {duree:3.0};
};
S.victoireB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5});
  [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84].forEach(function(n, k){ A.harpe(t + k * .045, A.midi(n), {t60:1.6, g:.22}, o); });
  [72, 76, 79, 84].forEach(function(n, k){ A.cloche(t + .75 + k * .02, A.midi(n), {d:2.6, rapport:3.5, indice:1.2, g:.09}, o); });
  A.choeur(t + .7, [261.6, 329.6, 392], 2.4, {voyelle:'a', a:.3, r:1.4, g:.05}, o);
  etincelles(A, t + .8, .6, o);
  return {duree:3.3};
};
S.fuiteA = function(A, P){
  var t = P.t, lo = A.lointain(P, t, 1.5, {pan1:-.2, pan2:-.9, fin:.25, lp2:2500, rev2:.6});
  var x = 0;
  for(var k = 0; k < 8; k++){ A.pas(t + x, {g:1 - k * .05}, lo); x += .22 - k * .007; }
  var o = A.bus(P, {rev:.7, pan:-.7}), p = t + 1.75;
  A.choc(p, {f:110, f2:45, d:.3, g:.85, sat:3, corpsF:320, corps:1.6}, o);             /* la porte claque */
  A.bruit(p, {coul:'rose', bp:1100, bq:1.2, env:A.perc(.001, .07), g:1.2}, o);
  A.modes(p, 180, [[1, .6, .25], [2.4, .4, .18], [3.7, .3, .1]], {g:.25}, o);
  A.modes(p + .004, 410, [[1, .7, .16], [2.13, .5, .1], [3.4, .3, .07]], {g:.18}, o);
  clic(A, p + .02, 3000, .5, o);
  clic(A, p + .16, 3400, .35, o);                                                       /* le loquet */
  return {duree:3.2};
};
S.fuiteB = function(A, P){
  var t = P.t, lo = A.lointain(P, t, 1.2, {pan1:-.2, pan2:-.85, fin:.3, lp2:2500, rev2:.6});
  for(var k = 0; k < 6; k++) A.pas(t + k * .19, {g:.9 - k * .08}, lo);
  var o = A.bus(P, {rev:.6});
  [69, 67, 64, 62].forEach(function(n, k){ A.harpe(t + 1.0 + k * .28, A.midi(n), {t60:2, g:.3}, o); A.cloche(t + 1.0 + k * .28, A.midi(n + 12), {d:1.6, g:.03}, o); });
  A.choeur(t + 1.9, [146.8, 174.6, 220], 2.6, {voyelle:'ou', a:.5, r:1.5, g:.045}, o);
  return {duree:4.5};
};

G.BRUITAGES = S;
})(window);
