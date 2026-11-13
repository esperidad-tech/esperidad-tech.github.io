/* Atelier des sons de Brumeval — LÉO, le boss final du donjon (Bible §13.33 ; proposés le 13 novembre, À VALIDER PAR ROMAIN :
   « à chaque attaque de Léo, il faut un son »). Mêmes règles que bestiaire.js : une fonction (A : le moteur, P : la prise,
   P.t : l'instant de départ) qui rend {duree}. « moment » : l'instant du coup dans le son (le jeu le cale sur l'image).
   Une seule version (A) de chacun pour l'instant : le jeu la joue en attendant le choix de Romain. */
(function(G){
'use strict';
var S = G.BRUITAGES;
function bus(A, P, pan, rev){ return A.bus(P, {rev:rev == null ? .45 : rev, grotte:.35, pan:pan == null ? .3 : pan}); }
/* un souffle qui passe (une arme, un bras, une cape) */
function fouet(A, t, d, o, dest){
  o = o || {};
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:o.f || 500, pts:[[d, o.f2 || 2200]], q:o.q || 1.4}], env:[[0, 0], [d * .55, 1], [d, 0]], g:o.g == null ? 1 : o.g}, dest);
}
/* une grosse voix d'homme (ou de bête) */
function voix(A, t, d, o, dest){
  o = o || {};
  var f = o.f || 110, env = o.env || [[0, 0], [.05, 1], [d * .7, .85], [d, 0]], g = o.g == null ? .32 : o.g;
  A.ton(t, {type:'sawtooth', f:f, f2:f * (o.chute || .8), gl:d, env:env, g:g, gigue:o.gigue || 14, trem:[o.rr || 24, o.tr == null ? .8 : o.tr], sat:o.sat || 2,
    filtres:[{type:'peaking', f:o.f1 || 600, q:1.3, gain:8}, {type:'peaking', f:o.f2 || 1300, q:2, gain:5}, {type:'lowpass', f:o.lp || 2400, q:.7}]}, dest);
  A.bruit(t, {bp:o.fb || 900, bq:1, env:env, g:g * (o.souffle == null ? .9 : o.souffle), rugueux:.8, rugVit:6}, dest);
}
function bois(A, t, o, dest){ o = o || {}; A.choc(t, {f:o.f || 240, f2:o.f2 || 90, d:o.d || .16, g:o.g == null ? .7 : o.g, sat:3, corps:1.8, corpsF:o.cf || 620}, dest); }
function fer(A, t, f, g, dest){ [1, 2.76, 5.4].forEach(function(m, k){ A.ton(t, {f:f * m, env:[[0, 0], [.003, 1], [.5 - k * .12, 0]], g:(g || .12) / (k + 1)}, dest); }); }

/* ---------- phase 1 : le meunier en cape noire ---------- */
S.leoFleauA = function(A, P){
  var t = P.t, o = bus(A, P), c = t + .5;
  fouet(A, t, .28, {f:400, f2:1500, g:.8}, o); fouet(A, t + .24, .26, {f:500, f2:1900, g:1}, o);
  bois(A, c, {f:260, g:.8}, o); bois(A, c + .13, {f:210, g:.9, d:.2}, bus(A, P, -.3));
  fer(A, c + .02, 880, .06, o);
  return {duree:1.2};
};
S.leoFleauA.moment = .5;
S.leoChargeA = function(A, P){
  var t = P.t, o = bus(A, P, .4), o2 = bus(A, P, -.4, .55), k, n = 7;
  for(k = 0; k < n; k++) A.choc(t + .9 * Math.pow(k / n, .75), {f:90, f2:40, d:.14, g:.35 + k * .08, sat:3, corps:1.2, corpsF:200}, k > 3 ? o2 : o);
  voix(A, t + .2, .7, {f:130, chute:1.2, g:.18}, o);
  A.choc(t + .95, {f:120, f2:34, d:.4, g:1, sat:4, corps:1.8, corpsF:260}, o2);
  return {duree:1.6};
};
S.leoChargeA.moment = .95;
S.leoMarteauA = function(A, P){
  var t = P.t, o = bus(A, P), c = t + .45, o2 = bus(A, P, -.25, .6);
  fouet(A, t, .42, {f:260, f2:1100, g:1.1}, o);
  A.choc(c, {f:105, f2:30, d:.5, g:1.1, sat:4, corps:1.9, corpsF:240}, o2); bois(A, c, {f:180, g:.6, d:.22}, o2);
  A.bruit(c + .03, {coul:'brun', lp:220, env:[[0, 0], [.08, 1], [.9, 0]], g:1}, o2);
  return {duree:1.6};
};
S.leoMarteauA.moment = .45;
S.leoMeuleA = function(A, P){
  var t = P.t, o = bus(A, P, .2), o2 = bus(A, P, -.5, .5), d = 1.1;
  voix(A, t, .35, {f:120, chute:1.3, g:.2}, o);
  A.bruit(t + .3, {coul:'brun', filtres:[{type:'lowpass', f:320, pts:[[d, 200]]}], env:[[0, 0], [.2, 1], [d * .8, .9], [d, 0]], g:1.3, rugueux:.9, rugVit:11}, o);
  A.joue(t + .3, A.crepitement(d, 70), {g:.45, filtres:[{type:'highpass', f:2200}, {type:'lowpass', f:7000}]}, o2);
  A.choc(t + .3 + d * .75, {f:150, f2:60, d:.25, g:.6, corps:1.4, corpsF:400}, o2);
  return {duree:1.8};
};
S.leoMeuleA.moment = 1.1;
S.leoFarineA = function(A, P){
  var t = P.t, o = bus(A, P, .3, .3);
  A.bruit(t, {coul:'rose', filtres:[{type:'lowpass', f:1800, pts:[[.6, 500]]}], env:[[0, 0], [.03, 1], [.2, .5], [.9, 0]], g:1.1}, o);
  A.bruit(t + .02, {hp:3000, env:[[0, 0], [.02, 1], [.5, 0]], g:.25}, o);
  return {duree:1};
};
S.leoCrochetA = function(A, P){
  var t = P.t, o = bus(A, P, .2), o2 = bus(A, P, -.4), k;
  for(k = 0; k < 6; k++) fer(A, t + k * .05, 1500 + (k % 3) * 400, .05, o);          /* la chaîne file */
  fouet(A, t, .3, {f:700, f2:2600, g:.7}, o);
  var c = t + .34;
  fer(A, c, 620, .16, o2); bois(A, c, {f:200, g:.7}, o2);
  for(k = 0; k < 5; k++) fer(A, c + .12 + k * .06, 1300 - k * 90, .05, o2);           /* il tire */
  return {duree:1.2};
};
S.leoCrochetA.moment = .34;
S.leoBoumA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .7);
  A.bruit(t, {hp:1500, env:[[0, 0], [.004, 1], [.08, 0]], g:.9}, o);
  A.choc(t, {f:90, f2:24, d:.9, g:1.4, sat:5, corps:2, corpsF:160}, o);
  A.bruit(t, {coul:'brun', filtres:[{type:'lowpass', f:900, pts:[[1.4, 120]]}], env:[[0, 0], [.01, 1], [.3, .6], [1.6, 0]], g:1.8, sat:3}, o);
  A.joue(t + .2, A.crepitement(1.2, 50), {g:.5, filtres:[{type:'highpass', f:1800}]}, o);
  return {duree:2.2};
};
S.leoCapeA = function(A, P){
  var t = P.t, o = bus(A, P, .2), o2 = bus(A, P, -.2, .6);
  fouet(A, t, .5, {f:220, f2:900, q:.9, g:1.3}, o);
  A.bruit(t + .1, {coul:'rose', lp:700, env:[[0, 0], [.06, 1], [.14, .3], [.2, .9], [.5, 0]], g:.9}, o);            /* le tissu claque */
  [0, .09, .2].forEach(function(dt){ A.bruit(t + .5 + dt, {coul:'rose', filtres:[{type:'bandpass', f:1200, pts:[[.25, 300]], q:1}], env:[[0, 0], [.01, 1], [.3, 0]], g:.7}, o2); });   /* pfff : les torches */
  A.ton(t + .55, {f:70, f2:45, gl:1, env:[[0, 0], [.3, 1], [1.4, 0]], g:.25}, o2);
  return {duree:2};
};
S.leoCapeA.moment = .5;
S.leoTorchesA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .5);
  [0, .12].forEach(function(dt, k){ A.bruit(t + dt, {coul:'rose', filtres:[{type:'bandpass', f:300, pts:[[.3, 1400]], q:.9}], env:[[0, 0], [.12, 1], [.5, 0]], g:1}, bus(A, P, k ? .5 : -.5)); });
  A.joue(t + .2, A.crepitement(.9, 30), {g:.4, filtres:[{type:'highpass', f:1500}]}, o);
  [660, 990, 1320].forEach(function(f, k){ A.ton(t + .05 + k * .05, {f:f, env:[[0, 0], [.02, 1], [.7, 0]], g:.05}, o); });
  return {duree:1.3};
};
/* ---------- phase 2 : torse nu, en colère ---------- */
S.leoSiffletA = function(A, P){
  var t = P.t, o = bus(A, P, .3, .6);
  A.ton(t, {f:2100, f2:2900, gl:.18, env:[[0, 0], [.02, 1], [.2, .9], [.26, 0]], g:.16, vib:[38, 60]}, o);
  A.ton(t + .32, {f:2900, f2:2500, gl:.5, env:[[0, 0], [.02, 1], [.45, .9], [.55, 0]], g:.18, vib:[38, 70]}, o);
  A.bruit(t, {hp:4000, env:[[0, 0], [.02, 1], [.85, 0]], g:.08}, o);
  return {duree:1.3};
};
S.leoSiffletA.moment = .5;
S.leoPoingA = function(A, P){
  var t = P.t, o = bus(A, P, -.2, .35);
  fouet(A, t, .12, {f:800, f2:2400, g:.8}, o);
  A.choc(t + .12, {f:170, f2:60, d:.18, g:.9, sat:3, corps:1.8, corpsF:520}, o);
  return {duree:.6};
};
S.leoPoingA.moment = .12;
S.leoFauxA = function(A, P){
  var t = P.t, o = bus(A, P, .3), o2 = bus(A, P, -.4);
  A.bruit(t, {filtres:[{type:'bandpass', f:1500, pts:[[.4, 5200]], q:2.4}], env:[[0, 0], [.3, 1], [.42, 0]], g:1.1}, o);
  fer(A, t + .36, 2300, .08, o2); fer(A, t + .4, 3100, .05, o2);
  A.bruit(t + .38, {hp:3500, env:[[0, 0], [.01, 1], [.25, 0]], g:.3}, o2);
  return {duree:1.1};
};
S.leoFauxA.moment = .38;
S.leoSautA = function(A, P){
  var t = P.t, o = bus(A, P, .2), o2 = bus(A, P, -.2, .7);
  voix(A, t, .3, {f:140, chute:1.5, g:.2}, o); fouet(A, t + .1, .5, {f:300, f2:120, g:.8}, o);
  var c = t + .65;
  A.choc(c, {f:80, f2:22, d:.8, g:1.4, sat:5, corps:2, corpsF:150}, o2);
  A.bruit(c, {coul:'brun', lp:260, env:[[0, 0], [.02, 1], [1.2, 0]], g:1.5}, o2);
  A.joue(c + .1, A.crepitement(.9, 45), {g:.4, filtres:[{type:'highpass', f:1200}, {type:'lowpass', f:5000}]}, o2);
  return {duree:2};
};
S.leoSautA.moment = .65;
S.leoGourdeA = function(A, P){
  var t = P.t, o = bus(A, P, .35, .3), k;
  A.ton(t, {f:500, f2:900, gl:.06, env:A.perc(.004, .1), g:.2}, o);                              /* le bouchon : pop */
  for(k = 0; k < 6; k++) A.ton(t + .3 + k * .3, {f:150 + (k % 2) * 40, f2:260, gl:.16, env:[[0, 0], [.03, 1], [.2, 0]], g:.3, lp:700}, o);   /* glou, glou… */
  voix(A, t + 2.2, .5, {f:120, chute:.8, g:.16, souffle:1.6}, o);                                  /* aaah */
  return {duree:2.9};
};
S.leoGourdeA.moment = 2.1;
S.leoLancerA = function(A, P){
  var t = P.t, o = bus(A, P, .2), o2 = bus(A, P, -.4);
  fouet(A, t, .22, {f:600, f2:2000, g:.9}, o);
  A.ton(t + .05, {f:1900, f2:2800, gl:.3, env:[[0, 0], [.02, 1], [.3, .7], [.4, 0]], g:.12, vib:[30, 120]}, o2);          /* le rat couine en vol */
  A.choc(t + .4, {f:300, f2:120, d:.12, g:.5}, o2);
  return {duree:.9};
};
S.leoLancerA.moment = .4;
/* ---------- phase 3 : la potion ---------- */
S.leoRafaleA = function(A, P){
  var t = P.t, k;
  for(k = 0; k < 6; k++){ var o = bus(A, P, -.5 + k * .15, .35); fouet(A, t + k * .11, .08, {f:900, f2:2400, g:.5}, o); A.choc(t + .06 + k * .11, {f:170 - k * 8, f2:60, d:.14, g:.75, sat:3, corps:1.7, corpsF:480}, o); }
  voix(A, t, .7, {f:90, chute:1.1, g:.22, rr:30}, bus(A, P, .3));
  return {duree:1.3};
};
S.leoRafaleA.moment = .06;
S.leoHurlementA = function(A, P){
  var t = P.t, o = bus(A, P, .2, .8), d = 1.5;
  voix(A, t, d, {f:95, chute:.7, g:.5, rr:21, f1:520, f2:1100, env:[[0, 0], [.12, 1], [d * .7, .9], [d, 0]], sat:3}, o);
  voix(A, t + .04, d, {f:142, chute:.72, g:.25, rr:26, f1:700, f2:1700}, bus(A, P, -.3, .8));
  A.bruit(t, {coul:'brun', lp:200, env:[[0, 0], [.2, 1], [d, 0]], g:1.2}, o);
  return {duree:2.4};
};
S.leoHurlementA.moment = .3;
S.leoAttrapeA = function(A, P){
  var t = P.t, o = bus(A, P, -.2), o2 = bus(A, P, -.5, .6);
  fouet(A, t, .16, {f:500, f2:1600, g:.8}, o); A.choc(t + .14, {f:220, f2:110, d:.12, g:.5}, o);                 /* il l'attrape */
  fouet(A, t + .3, .3, {f:260, f2:1300, g:1.1}, o);
  A.choc(t + .62, {f:110, f2:30, d:.5, g:1.2, sat:4, corps:2, corpsF:300}, o2);                                   /* … et frappe l'autre avec */
  return {duree:1.5};
};
S.leoAttrapeA.moment = .62;
S.leoSouffleA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .6), d = 1.3;
  voix(A, t, .3, {f:80, chute:1.4, g:.2}, o);
  A.bruit(t + .2, {coul:'rose', filtres:[{type:'bandpass', f:500, pts:[[d, 1400]], q:.7}], env:[[0, 0], [.12, 1], [d * .8, .9], [d, 0]], g:1.6, rugueux:.7, rugVit:14}, o);
  A.joue(t + .3, A.crepitement(d, 60), {g:.5, filtres:[{type:'highpass', f:1600}]}, bus(A, P, -.4));
  A.bruit(t + .2, {coul:'brun', lp:180, env:[[0, 0], [.2, 1], [d, 0]], g:1.1}, o);
  return {duree:1.9};
};
S.leoSouffleA.moment = .3;
/* ---------- ce qui lui arrive ---------- */
S.leoToucheA = function(A, P){ var t = P.t, o = bus(A, P, .3, .3); voix(A, t, .22, {f:150, chute:.7, g:.22, env:[[0, 0], [.02, 1], [.22, 0]]}, o); return {duree:.4}; };
S.leoGlisseA = function(A, P){
  var t = P.t, o = bus(A, P, .2), o2 = bus(A, P, .1, .6);
  A.ton(t, {f:500, f2:1700, gl:.3, env:[[0, 0], [.03, 1], [.3, 0]], g:.14}, o);                                    /* ziiip */
  voix(A, t + .1, .3, {f:200, chute:1.4, g:.16}, o);                                                               /* hé ?! */
  A.choc(t + .55, {f:95, f2:28, d:.6, g:1.2, sat:4, corps:2, corpsF:200}, o2);
  return {duree:1.5};
};
S.leoGlisseA.moment = .55;
S.leoSonneA = function(A, P){
  var t = P.t, o = bus(A, P, .2, .5);
  bois(A, t, {f:300, f2:140, g:.9, d:.2}, o);
  [0, .16, .32, .48].forEach(function(dt, k){ A.ton(t + .15 + dt, {f:1400 + k * 180, env:A.perc(.004, .28), g:.07}, bus(A, P, k % 2 ? .5 : -.1)); });   /* les petites étoiles */
  voix(A, t + .1, .5, {f:130, chute:.7, g:.14, tr:.3}, o);
  return {duree:1.2};
};
S.leoSaigneA = function(A, P){ var t = P.t, o = bus(A, P, P.pan == null ? 0 : P.pan, .2); A.ton(t, {f:900, f2:420, gl:.07, env:A.perc(.003, .09), g:.09}, o); A.ton(t + .06, {f:700, f2:300, gl:.06, env:A.perc(.003, .08), g:.05}, o); return {duree:.3}; };
S.leoCasseA = function(A, P){
  var t = P.t, o = bus(A, P, -.2, .3);
  bois(A, t, {f:420, f2:160, g:.8, d:.1, cf:1200}, o); bois(A, t + .05, {f:300, f2:110, g:.6, d:.16}, o);
  A.joue(t, A.crepitement(.3, 60), {g:.5, filtres:[{type:'highpass', f:2000}]}, o);
  return {duree:.7};
};
S.leoRamasseA = function(A, P){ var t = P.t, o = bus(A, P, -.3, .3); bois(A, t, {f:330, g:.4, d:.1}, o); fer(A, t + .08, 1200, .07, o); [660, 880, 1320].forEach(function(f, k){ A.ton(t + .16 + k * .07, {f:f, env:A.perc(.005, .3), g:.07}, o); }); return {duree:.8}; };
S.leoDechireA = function(A, P){
  var t = P.t, o = bus(A, P, .3, .4);
  A.joue(t, A.crepitement(.55, 120), {g:.8, filtres:[{type:'bandpass', f:2400, q:.8}]}, o);
  A.bruit(t, {filtres:[{type:'bandpass', f:900, pts:[[.5, 3200]], q:1.2}], env:[[0, 0], [.05, 1], [.5, .8], [.6, 0]], g:.9, rugueux:.9, rugVit:22}, o);
  voix(A, t + .5, 1, {f:110, chute:1.25, g:.4, sat:3}, bus(A, P, .2, .7));                                          /* RAAAH */
  return {duree:1.8};
};
S.leoPotionA = function(A, P){
  var t = P.t, o = bus(A, P, .3, .5), k;
  for(k = 0; k < 4; k++) A.ton(t + k * .22, {f:170 + (k % 2) * 40, f2:280, gl:.14, env:[[0, 0], [.03, 1], [.18, 0]], g:.3, lp:700}, o);
  for(k = 0; k < 14; k++) A.ton(t + 1 + k * .09, {f:300 + k * 70, f2:500 + k * 90, gl:.08, env:A.perc(.01, .1), g:.06}, bus(A, P, -.4 + k * .06));   /* ça bouillonne et ça monte */
  A.ton(t + 1, {type:'sawtooth', f:55, f2:110, gl:1.3, env:[[0, 0], [.4, 1], [1.4, 0]], g:.2, lp:500, sat:3}, o);
  voix(A, t + 2.2, 1.4, {f:80, chute:.75, g:.5, rr:19, sat:3, f1:480, f2:1000}, bus(A, P, .1, .8));
  return {duree:3.8};
};
S.leoChuteA = function(A, P){
  var t = P.t, o = bus(A, P, .2, .6);
  voix(A, t, .6, {f:120, chute:.55, g:.25, tr:.3}, o);
  A.choc(t + .5, {f:140, f2:50, d:.3, g:.7, corps:1.6, corpsF:300}, o);                   /* un genou */
  A.choc(t + 1.3, {f:90, f2:26, d:.7, g:1.1, sat:4, corps:2, corpsF:200}, o);             /* tout le reste */
  return {duree:2.2};
};
})(window);
