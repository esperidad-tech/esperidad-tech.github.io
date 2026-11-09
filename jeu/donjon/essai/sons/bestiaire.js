/* Atelier des sons de Brumeval — le bestiaire du donjon complet (proposé le 9 novembre, à valider par Romain).
   Pour chaque monstre : son cri, quand il est touché, comment il s'en va (fuite ou défaite), et ses gestes à lui.
   Mêmes règles que bruitages.js : une fonction (A : le moteur, P : la prise, P.t : l'instant de départ) qui rend {duree}.
   Rien ici n'est encore branché dans le jeu : Romain écoute et choisit d'abord. */
(function(G){
'use strict';
var h = Moteur.hasard, ch = Moteur.choix, S = G.BRUITAGES, O = G.BRUITAGES_OUTILS;
function ici(P, t){ return {t:t, sec:P.sec, cave:P.cave, grotte:P.grotte}; }

/* =================== les voix et les gestes communs =================== */
/* un grognement : une voix grave qui roule (« rrrr »), avec un souffle râpeux */
function grogne(A, t, d, o, dest){
  o = o || {};
  var f = o.f || 120, g = o.g == null ? .3 : o.g, env = o.env || [[0, 0], [.06, 1], [d * .7, .8], [d, 0]];
  A.ton(t, {type:'sawtooth', f:f, f2:f * (o.chute || .85), gl:d, env:env, g:g, gigue:o.gigue || 18, trem:[o.rr || 27, .9], sat:o.sat || 1.8,
    filtres:[{type:'peaking', f:o.f1 || 650, q:1.4, gain:7}, {type:'peaking', f:o.f2 || 1500, q:2, gain:4}, {type:'lowpass', f:o.lp || 2200, q:.7}]}, dest);
  A.bruit(t, {bp:o.fb || 1100, bq:1, env:env, g:g * (o.souffle == null ? 1.1 : o.souffle), rugueux:.9, rugVit:o.rugVit || 7}, dest);
}
/* un sifflement de bête (comme un chat en colère) */
function siffle(A, t, d, o, dest){
  o = o || {};
  A.bruit(t, {filtres:[{type:'highpass', f:o.hp || 2600}, {type:'bandpass', f:o.f || 5000, pts:o.f2 ? [[d, o.f2]] : null, q:o.q || .9}],
    env:o.env || [[0, 0], [.04, 1], [d * .7, .7], [d, 0]], g:o.g == null ? .6 : o.g, rugueux:o.rug == null ? .45 : o.rug, rugVit:o.rugVit || 4}, dest);
}
/* des mandibules qui cliquettent (vit : clics par seconde, ou une fonction de 0 à 1) */
function cliquetis(A, t, d, o, dest){
  o = o || {};
  var x = 0, k = 0, v = o.vit || 18;
  while(x < d){
    var vv = typeof v === 'function' ? v(x / d) : v;
    A.bruit(t + x, {bp:h(o.f1 || 2400, o.f2 || 4200), bq:5, env:A.perc(.0004, o.long || .007), g:(o.g || .5) * h(.55, 1) * (k % 2 ? .7 : 1)}, dest);
    A.ton(t + x, {f:h(1600, 2400) * (o.h || 1), env:A.perc(.0005, .012), g:(o.g || .5) * .05}, dest);
    x += h(.6, 1.4) / vv; k++;
  }
}
/* une crécelle (« krrrrr ») : un bruit coupé très vite */
function stridule(A, t, d, o, dest){
  o = o || {};
  var env = [[0, 0], [.03, 1], [d * .8, .85], [d, 0]], g = o.g == null ? .8 : o.g;
  A.bruit(t, {bp:o.f || 3200, bq:o.q || 2.2, env:env, g:g, trem:[o.vit || 50, 1]}, dest);
  A.bruit(t, {bp:(o.f || 3200) * 1.9, bq:3, env:env, g:g * .35, trem:[o.vit || 50, 1]}, dest);
}
/* un battement d'aile de chauve-souris : l'air poussé, la peau qui claque */
function battement(A, t, o, dest){
  o = o || {};
  var g = o.g == null ? 1 : o.g, f = o.f || 900;
  A.bruit(t, {coul:'rose', bp:f, bq:.9, env:[[0, 0], [.012, 1], [o.d || .07, 0]], g:.7 * g}, dest);
  A.bruit(t + .004, {bp:f * 2.8, bq:1.5, env:A.perc(.002, .025), g:.25 * g}, dest);
  A.choc(t, {f:150, f2:80, d:.06, g:.12 * g, sat:1.5, bruit:0, corps:.3, corpsF:400}, dest);
}
function ailes(A, P, t, n, iv, o){
  o = o || {};
  for(var k = 0; k < n; k++){
    var tt = t + k * iv * h(.9, 1.1);
    battement(A, tt, {g:(o.g || 1) * (o.fade ? 1 - k / n * .7 : h(.8, 1)), f:(o.f || 900) * h(.9, 1.1), d:o.d}, A.bus(ici(P, tt), {rev:.25, pan:o.pan2 != null ? o.pan2 * k / n : Math.sin(k * 1.3) * (o.pan || .4)}));
  }
  return n * iv;
}
/* un chuchotement sans paroles : des syllabes de souffle dans des voyelles */
function chuchote(A, t, n, o, dest){
  o = o || {};
  var x = 0, voy = o.voy || ['ou', 'o', 'a'];
  for(var k = 0; k < n; k++){
    var d = h(o.d1 || .12, o.d2 || .26), F = A.FORMANTS[ch(voy)], gg = (o.g || 2) * h(.6, 1), m = (o.h || 1) * h(.95, 1.08);
    F.forEach(function(fm){ A.bruit(t + x, {bp:fm[0] * m, bq:fm[2] * .8, env:[[0, 0], [d * .3, 1], [d, 0]], g:gg * fm[1]}, dest); });
    if(Math.random() < (o.s == null ? .35 : o.s)) A.bruit(t + x + d * .6, {hp:5000, env:[[0, 0], [.03, 1], [.12, 0]], g:gg * .08}, dest);   /* un « sss » */
    x += d + h(.02, o.pause || .12);
  }
  return x;
}
/* une bulle qui remonte (« bloup ») */
function bulle(A, t, o, dest){
  o = o || {};
  var f = o.f || h(220, 480);
  A.ton(t, {f:f, f2:f * (o.monte || 2.4), gl:o.gl || .05, env:[[0, 0], [.003, 1], [.04, .4], [o.d || .09, 0]], g:o.g || .2}, dest);
}
function glouglou(A, t, n, o, dest){
  o = o || {};
  var x = 0;
  for(var k = 0; k < n; k++){ bulle(A, t + x, {f:(o.f || 300) * h(.85, 1.2), g:(o.g || .2) * h(.7, 1) * (o.fade ? 1 - k / n * .7 : 1), monte:o.monte}, dest); x += h(o.i1 || .07, o.i2 || .16); }
  A.bruit(t, {coul:'rose', lp:700, env:[[0, 0], [.03, 1], [x * .8, .5], [x + .1, 0]], g:(o.g || .2) * .5}, dest);
  return x;
}
/* le coassement : une voix très grave faite de petits coups de gorge (la poche qui vibre), dans des voyelles « o » et « a » */
function coasse(A, t, d, o, dest){
  o = o || {};
  var f = o.f || 90, pr = o.coups || 22, g = o.g == null ? .35 : o.g, chute = o.chute || .8;
  var env = o.env || [[0, 0], [.04, 1], [d * .6, .85], [d, 0]];
  var voix = A.gain(1), F = A.chaine(t, voix, [{type:'peaking', f:o.f1 || 420, q:2, gain:9}, {type:'peaking', f:o.f2 || 1100, q:2.5, gain:6}, {type:'lowpass', f:o.lp || 2600, q:.7}]);
  F.connect(dest);
  A.ton(t, {type:'sawtooth', f:f, f2:f * chute, gl:d, env:env, g:g, trem:[pr, 1], sat:o.sat || 2.4, gigue:o.gigue || 5, vib:o.vib}, voix);
  A.ton(t, {type:'square', f:f * .5, f2:f * .5 * chute, gl:d, env:env, g:g * .35, trem:[pr, 1], lp:500, sat:1.5}, dest);   /* le ventre */
  A.bruit(t, {coul:'rose', bp:o.f1 || 420, bq:2, env:env, g:g * .6, trem:[pr, 1], rugueux:.6}, voix);
}
/* une plaque de métal frappée */
var PLAQUE = [[1, 1, .5, 2], [2.32, .6, .35, 3], [4.25, .4, .22], [6.8, .2, .14]];
function clang(A, t, f, o, dest){
  o = o || {};
  var l = o.long || 1;
  O.clic(A, t, o.clicF || 4000, o.clic == null ? .5 : o.clic, dest);
  A.modes(t, f, (o.modes || PLAQUE).map(function(m){ return [m[0], m[1], m[2] * l, m[3]]; }), {g:o.g || .2, chute:o.chute}, dest);
  if(o.choc !== 0) A.choc(t, {f:o.fc || 180, f2:90, d:.08, g:o.choc || .3, sat:2}, dest);
}
/* une petite pièce d'armure qui tinte */
function tinte(A, t, g, dest){ A.modes(t, h(2200, 3800), [[1, 1, h(.08, .2)], [2.7, .4, .07], [5.1, .2, .04]], {g:.06 * g}, dest); O.clic(A, t, 6000, .25 * g, dest); }
/* le grincement d'une articulation rouillée (des accrocs dans des résonances) */
function rouille(A, t, d, o, dest){
  o = o || {};
  var buf = A.grincement(d, {i0:o.i0 || .04, i1:o.i1 || .015, irr:.5});
  (o.res || [320, 780, 1600]).forEach(function(f, k){ A.joue(t, buf, {filtres:[{type:'bandpass', f:f, q:o.q || 12}], g:(o.g || 2.4) * [1, .75, .5][k], env:[[0, 0], [.05, 1], [d - .05, 1], [d, 0]]}, dest); });
}
/* un pas de fer très lourd */
function pasFer(A, t, g, dest){
  A.choc(t, {f:95, f2:42, d:.32, g:.7 * g, sat:3, corpsF:300, corps:1.4}, dest);
  A.modes(t + .005, 150, [[1, 1, .6, 1], [2.13, .6, .45, 2], [3.27, .45, .3], [4.9, .3, .2], [7.1, .15, .1]], {g:.16 * g}, dest);
  A.bruit(t, {coul:'rose', lp:1800, env:A.perc(.002, .12), g:.6 * g}, dest);
}
/* une éclaboussure d'eau (n : la quantité d'eau) */
function eclabousse(A, t, n, o, dest){
  o = o || {};
  var d = o.d || .7;
  A.bruit(t, {coul:'rose', filtres:[{type:'lowpass', f:o.lp || 5000, pts:[[d, 500]], q:.7}], env:[[0, 0], [.006, 1], [d * .3, .45], [d, 0]], g:(o.g || 1) * .9}, dest);
  A.joue(t, A.eau(Math.max(.5, d), 90 * n, {fmin:o.fmin || 400, fmax:o.fmax || 2400}), {g:(o.g || 1) * .5, env:[[0, 1], [d * .5, .8], [d, 0]]}, dest);
  if(n > 1) A.choc(t, {f:110, f2:45, d:.25, g:(o.g || 1) * .5, sat:2.5, corpsF:300}, dest);
}
/* des gouttes qui retombent un peu partout */
function pluie(A, P, t, d, n, g){
  for(var k = 0; k < n; k++){ var tt = t + Math.pow(Math.random(), 1.4) * d; A.goutte(tt, {f:h(700, 2000), g:h(.04, .1) * (g || 1)}, A.bus(ici(P, tt), {rev:.3, pan:h(-.8, .8)})); }
}

/* =================== LE RAT CUIRASSÉ =================== */
/* — son cri : un grognement — */
S.cuirCriA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4}), casque = A.echo(o, {temps:.009, decal:1.3, retour:.6, lp:5200, sortie:.55}), voix = A.gain(1);
  voix.connect(o); voix.connect(casque);
  grogne(A, t, .9, {f:105, rr:24, g:.32}, voix);
  A.cri(t + .85, {forme:'cri', d:.3, h:.7, rauque:.7, grain:.9, g:.3}, voix);
  A.plusTard(3, casque.couper);
  return {duree:1.4};
};
S.cuirCriB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  [0, .32].forEach(function(x){
    A.bruit(t + x, {bp:700, bq:2.5, env:[[0, 0], [.01, 1], [.05, .4], [.13, 0]], g:1.1}, o);                    /* il renifle : « hmpf » */
    A.ton(t + x, {type:'sawtooth', f:170, f2:120, gl:.1, env:A.perc(.008, .1), g:.08, lp:900}, o);
  });
  grogne(A, t + .62, .55, {f:125, rr:30, g:.3, chute:.8}, o);
  return {duree:1.3};
};
S.cuirCriC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.4});
  grogne(A, t, 1.1, {f:98, rr:22, g:.3, f1:560, chute:.9}, o);
  for(var k = 0; k < 9; k++) tinte(A, t + .15 + k * h(.07, .11), 1 - k * .07, o);                      /* il se secoue : l'armure tinte */
  return {duree:1.5};
};
/* — touché : l'armure tinte — */
S.cuirToucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.4});
  clang(A, t, 1450, {g:.18, choc:.25}, o);
  clang(A, t + .03, 2150, {g:.1, choc:0, clic:.2}, o);
  A.cri(t + .12, {forme:'aie', d:.16, h:.78, rauque:.5, grain:.8, g:.28}, o);
  return {duree:.9};
};
S.cuirToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4, pan:.4});
  clang(A, t, 640, {g:.2, long:1.4, choc:.4, fc:150}, o);
  for(var k = 0; k < 5; k++) tinte(A, t + .1 + k * .06, .9 - k * .14, o);
  grogne(A, t + .25, .35, {f:130, rr:32, g:.26}, o);
  return {duree:1.2};
};
/* — le casque qui tombe (le tournis après deux coups de louche) — */
S.cuirCasqueA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.3, pan2:.6, pant:1.4}), x = 0, iv = .34, g = 1;
  for(var k = 0; k < 6; k++){ clang(A, t + x, 620 * h(.98, 1.02), {g:.2 * g, choc:.25 * g, long:.8, modes:[[1, 1, .45, 2], [1.55, .7, .35], [2.3, .5, .25, 3], [3.4, .3, .15]]}, o); x += iv; iv *= .66; g *= .72; }
  for(var j = 0; j < 14; j++){ tinte(A, t + x, .5 * (1 - j / 14), o); x += .05 * (1 - j / 18); }      /* il tourne sur lui-même, comme une pièce */
  A.cri(t + x + .15, {forme:'question', d:.18, h:.82, g:.2, souffle:.3}, o);                          /* « hein ? » */
  return {duree:x + .6};
};
S.cuirCasqueB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.2, pan2:.9, pant:1.6});
  O.bong(A, t, 330, {g:.2, long:.6}, o);
  A.bruit(t + .2, {bp:2600, bq:3, env:[[0, 0], [.05, 1], [1.1, .6], [1.3, 0]], g:.5, trem:[19, .9], rugueux:.5}, o);   /* il roule… */
  for(var k = 0; k < 8; k++) tinte(A, t + .25 + k * .14, .6, o);
  clang(A, t + 1.45, 900, {g:.12, choc:.15}, o);                                                         /* …et s'arrête contre le mur : « tonk » */
  return {duree:2.2};
};
/* — mort ou fuite — */
S.cuirFinA = function(A, P){
  var t = P.t, d = 1.7, lo = A.lointain(P, t, d, {pan1:.3, pan2:.95, fin:.08, lp2:1600});
  var x = 0;
  for(var k = 0; k < 5; k++){ A.cri(t + x, {forme:'peur', d:h(.1, .15), h:h(.78, .9), rauque:.3, grain:.6, g:.3}, lo); x += h(.2, .28); }
  A.joue(t, A.griffes(1.5, 18), {g:.4, hp:2200}, lo);
  for(var j = 0; j < 12; j++) tinte(A, t + j * .12 + h(0, .04), .8, lo);
  return {duree:2.2};
};
S.cuirFinB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.4});
  A.cri(t, {forme:'cri', d:.35, h:.72, rauque:.8, grain:.9, g:.3}, o);
  A.choc(t + .4, {f:120, f2:45, d:.25, g:.7, sat:3, corps:1.6}, o);
  [0, .07, .16, .3, .45].forEach(function(x, k){ clang(A, t + .4 + x, h(700, 1900), {g:.12 - k * .015, choc:k ? 0 : .3, long:.7, clic:.3}, A.bus(ici(P, t + .4 + x), {rev:.45, pan:h(-.2, .9)})); });
  A.cri(t + 1.05, {forme:'plainte', d:.6, h:.68, souffle:.5, g:.16, a:.05}, o);
  return {duree:2.0};
};

/* =================== L'ARAIGNÉE DES CAVES =================== */
S.araiCriA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.35});
  cliquetis(A, t, .45, {vit:22, g:.55}, o);
  siffle(A, t + .4, .7, {f:4800, g:.7}, o);
  cliquetis(A, t + 1.05, .25, {vit:26, g:.4}, o);
  return {duree:1.4};
};
S.araiCriB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.35});
  siffle(A, t, 1.0, {f:2600, f2:6200, q:1.2, g:.75, env:[[0, 0], [.6, 1], [.9, .8], [1, 0]]}, o);       /* un sifflement qui monte */
  A.bruit(t, {coul:'rose', bp:900, bq:1, env:[[0, 0], [.5, 1], [1, 0]], g:.25, rugueux:.7}, o);
  cliquetis(A, t + .95, .3, {vit:30, g:.5}, o);
  return {duree:1.4};
};
S.araiCriC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.35});
  stridule(A, t, .55, {vit:46, f:3000}, o);
  stridule(A, t + .7, .8, {vit:42, f:2700}, o);
  cliquetis(A, t + 1.5, .2, {vit:24, g:.4}, o);
  return {duree:1.8};
};
/* — la toile projetée (un héros passe son tour) — */
S.araiToileA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.4, pan2:-.4, pant:.45});
  A.bruit(t, {filtres:[{type:'bandpass', f:800, pts:[[.08, 3000]], q:2}], env:A.perc(.004, .08), g:1.1}, o);       /* pfft ! */
  A.bruit(t + .05, {filtres:[{type:'bandpass', f:2200, pts:[[.35, 5200]], q:6}], env:[[0, 0], [.1, 1], [.35, 0]], g:.9}, o);   /* le fil qui file */
  var o2 = A.bus(ici(P, t + .42), {rev:.3, pan:-.4});
  O.sploutch(A, t + .42, {g:.7, f:420, bulles:2}, o2);
  O.etire(A, t + .62, {d:.22, g:.5}, o2);
  return {duree:1.1};
};
S.araiToileB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.4, pan2:-.4, pant:.4});
  A.ton(t, {f:1900, f2:650, gl:.38, env:[[0, 0], [.02, 1], [.3, .7], [.4, 0]], g:.1, vib:[22, 60]}, o);       /* ziouuu */
  A.bruit(t, {bp:3000, bq:4, env:[[0, 0], [.02, 1], [.4, 0]], g:.5}, o);
  var o2 = A.bus(ici(P, t + .4), {rev:.3, pan:-.4});
  A.joue(t + .4, A.pince(260, {t60:.35, eclat:.5}), {g:.4, lp:2500, vit2:.82}, o2);                               /* le fil qui se tend : « twang » */
  O.sploutch(A, t + .4, {g:.6, f:360, bulles:3}, o2);
  return {duree:1.0};
};
/* — touchée — */
S.araiToucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.35});
  A.cri(t, {forme:'aie', f:3100, d:.2, rauque:.35, grain:.8, g:.3}, o);
  cliquetis(A, t + .15, .35, {vit:35, g:.5}, o);
  return {duree:.7};
};
S.araiToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.35});
  A.choc(t, {f:150, f2:60, d:.1, g:.45}, o);
  siffle(A, t + .03, .4, {f:5200, g:.8, env:[[0, 0], [.01, 1], [.15, .6], [.4, 0]]}, o);
  A.cri(t + .38, {forme:'iik', f:2600, d:.1, g:.2}, o);
  return {duree:.7};
};
/* — mort — */
S.araiMortA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.35});
  A.cri(t, {forme:'cri', f:2800, d:.3, rauque:.4, grain:.8, g:.26}, o);
  A.choc(t + .32, {f:130, f2:50, d:.2, g:.6, sat:2.5}, o);                                         /* elle tombe sur le dos */
  cliquetis(A, t + .4, 1.3, {vit:function(u){ return 28 * (1 - u) + 4; }, g:.5}, o);              /* ses pattes gigotent, de moins en moins */
  siffle(A, t + 1.8, .5, {f:3600, g:.3, rug:.2}, o);
  return {duree:2.4};
};
S.araiMortB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.35});
  siffle(A, t, .9, {f:5200, f2:900, q:1.1, g:.8, env:[[0, 0], [.03, 1], [.6, .6], [.9, 0]]}, o);   /* elle se dégonfle */
  A.joue(t + .1, A.crepitement(.9, 60), {g:.6, filtres:[{type:'highpass', f:1500}, {type:'lowpass', f:6000}]}, o);   /* elle se recroqueville */
  A.choc(t + .85, {f:160, f2:70, d:.1, g:.35}, o);
  return {duree:1.4};
};

/* =================== LA PETITE ARAIGNÉE =================== */
S.petiteCriA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  cliquetis(A, t, .35, {vit:34, g:.4, f1:4000, f2:6500, h:1.8}, o);
  A.cri(t + .35, {forme:'iik', f:5200, d:.07, g:.22}, o);
  return {duree:.6};
};
S.petiteCriB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  stridule(A, t, .3, {vit:70, f:5200, g:.6}, o);
  A.cri(t + .34, {forme:'question', f:4800, d:.1, g:.2}, o);
  return {duree:.6};
};
S.petiteToucheA = function(A, P){
  var o = A.bus(P, {rev:.25, pan:.45});
  A.cri(P.t, {forme:'iik', f:5400, d:.08, grain:.6, g:.26}, o);
  O.clic(A, P.t, 5000, .4, o);
  return {duree:.3};
};
S.petiteToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.45});
  A.ton(t, {f:420, f2:180, gl:.05, env:A.perc(.002, .06), g:.2, sat:1.5}, o);
  A.cri(t + .02, {forme:'aie', f:5000, d:.07, g:.22}, o);
  A.cri(t + .14, {forme:'aie', f:4600, d:.09, g:.18}, o);
  return {duree:.4};
};
S.petiteMortA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.45});
  A.cri(t, {forme:'iik', f:5200, d:.06, g:.2}, o);
  A.bruit(t + .07, {coul:'rose', lp:2500, env:A.perc(.003, .14), g:.9}, o);                         /* pouf ! */
  A.ton(t + .07, {f:900, f2:1500, gl:.04, env:A.perc(.002, .06), g:.12}, o);
  O.etincelles(A, t + .12, .4, o);
  return {duree:.9};
};
S.petiteMortB = function(A, P){
  var t = P.t, lo = A.lointain(P, t, .7, {pan1:.4, pan2:1, fin:.08, lp2:2000});
  A.cri(t, {forme:'peur', f:5000, d:.08, g:.22}, lo);
  A.joue(t, A.griffes(.6, 40), {g:.45, hp:3500}, lo);
  A.bruit(t + .1, {filtres:[{type:'bandpass', f:900, pts:[[.18, 4500]], q:2}], env:[[0, 0], [.15, 1], [.2, 0]], g:.5}, lo);   /* zip ! */
  return {duree:.9};
};

/* =================== LA CHAUVE-SOURIS =================== */
S.chauveCriA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:-.3});
  [0, .09, .18].forEach(function(x, k){ A.cri(t + x, {forme:'iik', f:4300, d:.06, h:1 + k * .05, grain:.4, g:.24}, o); });
  A.cri(t + .42, {forme:'iik', f:4600, d:.08, g:.22}, o);
  return {duree:.6};
};
S.chauveCriB = function(A, P){
  var o = A.bus(P, {rev:.35, pan:-.3});
  A.cri(P.t, {forme:'cri', f:3600, d:.38, trille:[30, .05], rauque:.3, grain:.7, g:.28}, o);
  return {duree:.6};
};
S.chauveCriC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:-.3});
  for(var k = 0; k < 9; k++){ A.bruit(t + k * .028, {hp:6500, env:A.perc(.0003, .004), g:.6}, o); A.ton(t + k * .028, {f:7200, env:A.perc(.0005, .008), g:.03}, o); }   /* le « radar » */
  A.ton(t + .3, {f:7000, f2:3200, gl:.12, env:A.perc(.004, .12), g:.07}, o);
  A.cri(t + .45, {forme:'peur', f:3900, d:.16, grain:.5, g:.24}, o);
  return {duree:.75};
};
/* — les battements d'ailes — */
S.chauveAilesA = function(A, P){ var d = ailes(A, P, P.t, 13, .09, {pan:.6, f:1000}); return {duree:d + .2}; };
S.chauveAilesB = function(A, P){ var d = ailes(A, P, P.t, 7, .17, {pan:.5, f:750, d:.11, g:1.2}); return {duree:d + .3}; };
/* — le piqué — */
S.chauvePiqueA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.8, pan2:-.5, pant:.75});
  ailes(A, P, t, 3, .09, {pan:.6});
  A.cri(t + .25, {forme:'cri', f:3800, d:.25, rauque:.3, g:.24}, o);
  A.bruit(t + .3, {filtres:[{type:'bandpass', f:3200, pts:[[.5, 700]], q:3}], env:[[0, 0], [.3, 1], [.5, 0]], g:.9}, o);   /* elle fond sur sa cible */
  O.tchac(A, t + .8, {g:.6, mouille:.4}, A.bus(ici(P, t + .8), {rev:.2, pan:-.4}));
  return {duree:1.1};
};
S.chauvePiqueB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.25, pan:.8, pan2:-.5, pant:.6});
  battement(A, t, {g:1.2, f:800, d:.12}, o);                                                            /* les ailes se replient */
  A.ton(t + .1, {f:2600, f2:800, gl:.5, env:[[0, 0], [.05, 1], [.45, .7], [.5, 0]], g:.07, vib:[11, 50]}, o);   /* ziiiou */
  A.bruit(t + .1, {bp:1500, bq:1.2, env:[[0, 0], [.4, 1], [.5, 0]], g:.5}, o);
  O.tchac(A, t + .62, {g:.7, mouille:.3}, A.bus(ici(P, t + .62), {rev:.2, pan:-.4}));
  return {duree:.95};
};
/* — touchée — */
S.chauveToucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:-.3});
  A.cri(t, {forme:'aie', f:3900, d:.18, grain:.7, g:.28}, o);
  ailes(A, P, t + .12, 5, .06, {pan:.7, f:1100, g:.8});                                                 /* les ailes en pagaille */
  return {duree:.6};
};
S.chauveToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:-.3});
  A.choc(t, {f:170, f2:70, d:.08, g:.4}, o);
  A.cri(t + .02, {forme:'iik', f:4400, d:.1, g:.26}, o);
  A.bruit(t + .15, {coul:'rose', bp:1000, bq:.9, env:[[0, 0], [.04, 1], [.35, 0]], g:.5, trem:[16, .9]}, o);   /* elle se rattrape */
  return {duree:.6};
};
/* — mort — */
S.chauveMortA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:-.2, pan2:.3, pant:.9});
  A.cri(t, {forme:'plainte', f:3600, d:.25, g:.22}, o);
  A.ton(t + .15, {f:1900, f2:420, gl:.8, env:[[0, 0], [.05, 1], [.75, .6], [.8, 0]], g:.05, vib:[12, 60]}, o);   /* elle tombe en tournoyant */
  ailes(A, P, t + .2, 3, .2, {g:.4, fade:true});
  A.choc(t + .95, {f:220, f2:90, d:.08, g:.3, sat:1.5}, o);                                              /* ploc */
  return {duree:1.3};
};
S.chauveMortB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:-.2});
  A.cri(t, {forme:'iik', f:4200, d:.1, g:.24}, o);
  O.brume(A, t + .1, 1.1, o);                                                                           /* une créature de brume : elle s'évapore */
  O.etincelles(A, t + .25, .5, o);
  return {duree:1.8};
};

/* =================== LE FEU FOLLET =================== */
S.folletCriA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.3, pan:.2}), ec = A.echo(o, {temps:.27, retour:.35, lp:3000, sortie:.4}), v = A.gain(1);
  v.connect(o); v.connect(ec);
  var d = chuchote(A, t, 6, {g:2.2}, v);
  A.ton(t, {f:880, env:[[0, 0], [.4, 1], [d, .6], [d + .4, 0]], g:.012, vib:[5, 6]}, o);
  A.plusTard(5, ec.couper);
  return {duree:d + .8};
};
S.folletCriB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.3, pan:.2});
  var d = chuchote(A, t, 7, {g:2.2, h:1.35, d1:.07, d2:.12, pause:.05, voy:['a', 'o'], s:.1}, o);   /* il rit tout bas : hi hi hi */
  A.ton(t, {f:1320, f2:1480, gl:d, env:[[0, 0], [.1, 1], [d, 0]], g:.012, trem:[9, .8]}, o);
  return {duree:d + .4};
};
S.folletCriC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.6, pan:.2});
  A.choeur(t, [A.midi(62), A.midi(69)], 2.2, {voyelle:'ou', a:.5, r:1.2, g:.035}, o);              /* ouuuh… */
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:500, pts:[[1, 1400], [2.2, 600]], q:1.2}], env:[[0, 0], [.6, 1], [2.2, 0]], g:.35}, o);
  return {duree:2.6};
};
/* — la flamme froide (12 sur deux héros) — */
S.folletFlammeA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:0, pan2:-.5, pant:.6});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:400, pts:[[.25, 3200], [.7, 1500]], q:1}], env:[[0, 0], [.08, 1], [.7, 0]], g:.9}, o);   /* fwoosh glacé */
  [2637, 3136, 3951, 4699].forEach(function(f, k){ A.cloche(t + .08 + k * .06, f, {d:1, rapport:2.76, indice:1.1, g:.022}, o); });
  A.joue(t + .1, A.crepitement(.8, 50), {g:.35, hp:5000}, o);                                         /* le givre qui craque */
  return {duree:1.3};
};
S.folletFlammeB = function(A, P){
  var t = P.t;
  [-.6, .6].forEach(function(p, k){
    var o = A.bus(ici(P, t + k * .22), {rev:.4, pan:p});
    A.bruit(t + k * .22, {coul:'rose', filtres:[{type:'bandpass', f:600, pts:[[.3, 2400]], q:1.4}], env:[[0, 0], [.05, 1], [.45, 0]], g:.8}, o);
    [88, 84, 81, 76].forEach(function(n, j){ A.ton(t + k * .22 + .1 + j * .07, {type:'triangle', f:A.midi(n + 12 * (1 - k)), env:A.perc(.002, .35), g:.035}, o); });   /* du verre qui descend */
  });
  return {duree:1.2};
};
/* — touché — */
S.folletToucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.2});
  A.bruit(t, {coul:'rose', bp:1300, bq:1.2, env:[[0, 0], [.02, 1], [.45, 0]], g:.8, trem:[13, .9]}, o);   /* la flamme vacille */
  chuchote(A, t + .1, 1, {g:2.4, h:1.5, d1:.14, d2:.16, voy:['a'], s:0}, o);                               /* « hii ! » */
  return {duree:.7};
};
S.folletToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, pan:.2});
  A.joue(t, A.crepitement(.4, 90), {g:.9, filtres:[{type:'highpass', f:2500}, {type:'lowpass', f:8000}]}, o);   /* pfft, elle crachote */
  A.cloche(t, 2349, {d:.8, rapport:2.76, indice:1.4, g:.04}, o);
  return {duree:.9};
};
/* — il s'éteint — */
S.folletMortA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, pan:.2});
  A.bruit(t, {bp:1200, bq:.8, env:[[0, 0], [.02, 1], [.18, 0]], g:1}, o);                                  /* pfiou, comme une bougie */
  A.ton(t + .05, {f:1200, f2:300, gl:.5, env:[[0, 0], [.02, 1], [.5, 0]], g:.05}, o);
  A.bruit(t + .15, {coul:'rose', filtres:[{type:'bandpass', f:900, pts:[[1, 400]], q:1}], env:[[0, 0], [.3, 1], [1.1, 0]], g:.35}, o);   /* la fumée qui monte */
  return {duree:1.4};
};
S.folletMortB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.6, grotte:.4, pan:.2});
  chuchote(A, t, 1, {g:2.6, h:.85, d1:.7, d2:.8, voy:['o'], s:0}, o);                                        /* un dernier soupir */
  [88, 84, 79, 76, 72].forEach(function(n, k){ A.cloche(t + .3 + k * .16, A.midi(n), {d:1.4, rapport:3.5, indice:.8, g:.03 * (1 - k * .15)}, o); });
  return {duree:2.0};
};

/* =================== LE TÊTARD =================== */
S.tetardCriA = function(A, P){
  var o = A.bus(P, {rev:.3, pan:.55});
  var d = glouglou(A, P.t, 4, {f:280, g:.22, i1:.12, i2:.2}, o);
  return {duree:d + .2};
};
S.tetardCriB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.55});
  A.cri(t, {forme:'question', f:1700, d:.12, grain:.6, g:.22}, o);
  glouglou(A, t + .15, 2, {f:350, g:.2}, o);
  return {duree:.6};
};
S.tetardToucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.55});
  bulle(A, t, {f:700, monte:2.8, g:.25, d:.06}, o);                                                        /* plip ! */
  A.cri(t + .05, {forme:'iik', f:2400, d:.08, g:.2}, o);
  return {duree:.35};
};
S.tetardToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.55});
  A.bruit(t, {filtres:[{type:'lowpass', f:3000, pts:[[.12, 300]], q:6}], env:A.perc(.003, .14), g:1}, o);   /* splatch ! */
  A.choc(t, {f:210, f2:80, d:.08, g:.35}, o);
  return {duree:.35};
};
S.tetardMortA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.55});
  bulle(A, t, {f:260, monte:1.6, g:.3, d:.12}, o);                                                        /* ploc */
  glouglou(A, t + .2, 6, {f:420, g:.16, i1:.08, i2:.14, monte:2.8, fade:true}, o);
  return {duree:1.2};
};
S.tetardMortB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.55});
  A.ton(t, {f:500, f2:1300, gl:.03, env:A.perc(.001, .05), g:.25}, o);                                  /* pop ! */
  A.bruit(t, {hp:3000, env:A.perc(.001, .03), g:.4}, o);
  A.joue(t + .05, A.crepitement(.5, 80), {g:.3, hp:4000}, o);                                           /* un petit pschitt */
  return {duree:.7};
};

/* =================== LE ROI DES RATS (élite) =================== */
/* une foule de rats qui couinent en même temps, chacun à sa place dans la salle */
function foule(A, P, t, d, n, o){
  o = o || {};
  for(var k = 0; k < n; k++){
    var tt = t + Math.random() * d, oo = A.bus(ici(P, tt), {rev:.3, pan:h(-.5, .9)});
    A.cri(tt, {forme:o.forme || ch(['iik', 'peur', 'question', 'aie']), d:h(.06, .15), h:h(o.h1 || .88, o.h2 || 1.3), grain:.6, rauque:o.rauque || 0, g:h(.12, .22) * (o.g || 1)}, oo);
  }
}
S.roiCriA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.3});
  foule(A, P, t, 1.8, 16);
  A.joue(t, A.griffes(2, 40), {g:.4, hp:2500}, o);
  A.joue(t + .1, A.griffes(1.8, 34), {g:.3, hp:2200}, A.bus(P, {rev:.3, pan:.7}));
  A.bruit(t, {bp:2000, bq:1.5, env:[[0, 0], [.3, 1], [1.7, .8], [2, 0]], g:.12, rugueux:.8, rugVit:5}, o);   /* les queues qui frottent */
  return {duree:2.3};
};
S.roiCriB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.3});
  grogne(A, t, 1.6, {f:110, rr:26, g:.24, chute:.9}, o);
  foule(A, P, t + .1, 1.4, 10, {forme:'cri', h1:.7, h2:.92, rauque:.6, g:1.1});
  return {duree:2.0};
};
S.roiCriC = function(A, P){
  var t = P.t;
  for(var b = 0; b < 4; b++){                                                                             /* ils couinent ensemble, en rythme */
    for(var k = 0; k < 5; k++){ var oo = A.bus(ici(P, t + b * .3), {rev:.3, pan:h(-.4, .9)}); A.cri(t + b * .3 + h(0, .02), {forme:'iik', d:.09, h:[1, 1.12, .9, 1.25, 1.05][k] * (b === 3 ? 1.15 : 1), g:.12, fixe:true}, oo); }
  }
  foule(A, P, t + 1.3, .6, 10);
  return {duree:2.1};
};
/* — l'attaque : le grouillement sur chaque héros — */
S.roiAttaqueA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.3, pan:.9, pan2:-.8, pant:1.2});
  A.joue(t, A.griffes(1.3, 45), {g:.5, hp:2200, env:[[0, .2], [.9, 1], [1.3, 0]]}, o);                  /* la vague arrive */
  foule(A, P, t + .3, 1, 12);
  [.9, 1.05, 1.2].forEach(function(x){ O.dents(A, t + x, 3, A.bus(ici(P, t + x), {rev:.2, pan:h(-.8, 0)})); A.choc(t + x + .1, {f:140, f2:60, d:.1, g:.4}, A.bus(ici(P, t + x), {pan:-.5})); });
  return {duree:1.8};
};
S.roiAttaqueB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:0});
  A.bruit(t, {coul:'brun', lp:400, env:[[0, 0], [.4, 1], [1.3, .8], [1.6, 0]], g:1.2, sat:2}, o);   /* le grondement */
  foule(A, P, t, 1.4, 14, {g:1.2});
  [.5, .85, 1.2].forEach(function(x){ A.choc(t + x, {f:150, f2:55, d:.12, g:.5}, A.bus(ici(P, t + x), {rev:.2, pan:h(-.8, -.2)})); O.dents(A, t + x - .06, 2, o); });
  return {duree:1.9};
};
/* — touché — */
S.roiToucheA = function(A, P){
  var t = P.t;
  [.82, .95, 1.08, 1.2, 1.32, .9].forEach(function(hh, k){ A.cri(t + k * .015, {forme:'aie', d:.22, h:hh, rauque:.3, grain:.7, g:.13}, A.bus(ici(P, t), {rev:.3, pan:-.3 + k * .2})); });   /* un chœur de « aïe » */
  A.choc(t, {f:150, f2:60, d:.12, g:.5}, A.bus(P, {pan:.3}));
  return {duree:.6};
};
S.roiToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:.3});
  A.choc(t, {f:130, f2:50, d:.15, g:.6, sat:3}, o);
  A.cri(t + .02, {forme:'cri', d:.45, h:.68, rauque:.9, grain:.9, g:.3}, o);
  rouille(A, t + .25, .5, {res:[420, 1050, 2100], g:1.6, i0:.05, i1:.03}, o);                             /* le nœud de queues qui se tord */
  return {duree:.95};
};
/* — défaite : le nœud se défait — */
S.roiFinA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4, pan:.3});
  A.ton(t, {f:300, f2:900, gl:.05, env:A.perc(.002, .08), g:.2, sat:1.5}, o);                            /* pop ! */
  for(var k = 0; k < 9; k++){
    var tt = t + .1 + k * .07, cote = k % 2 ? 1 : -1, lo = A.lointain(ici(P, tt), tt, 1.1, {pan1:cote * .2, pan2:cote * h(.7, 1), fin:.06, lp2:1500});
    A.cri(tt, {forme:'peur', d:h(.09, .13), h:h(1, 1.3), g:.18}, lo); A.cri(tt + .25, {forme:'peur', d:.08, h:h(1, 1.3), g:.12}, lo);
  }
  A.joue(t + .1, A.griffes(1.3, 50), {g:.4, hp:2500, env:[[0, 1], [.8, .6], [1.3, 0]]}, o);
  return {duree:2.0};
};
S.roiFinB = function(A, P){
  var t = P.t;
  foule(A, P, t, .6, 10, {forme:'peur', g:1.1});
  for(var k = 0; k < 5; k++){ var tt = t + .4 + k * h(.15, .25), oo = A.bus(ici(P, tt), {rev:.4, pan:h(-.9, .9)}); eclabousse(A, tt, 1, {g:.35, d:.4}, oo); }   /* plouf, plouf : tous dans les égouts */
  return {duree:1.9};
};

/* =================== LE GARDIEN DE ROUILLE (élite) =================== */
S.gardienPasA = function(A, P){
  var t = P.t;
  [0, .85].forEach(function(x, k){ var o = A.bus(ici(P, t + x), {rev:.5, grotte:.3, pan:k ? .3 : -.1}); rouille(A, t + x, .3, {g:1.8}, o); pasFer(A, t + x + .3, 1, o); });   /* l'articulation grince, puis le pied retombe */
  return {duree:2.1};
};
S.gardienPasB = function(A, P){
  var t = P.t;
  [0, .7].forEach(function(x, k){
    var o = A.bus(ici(P, t + x), {rev:.5, grotte:.3, pan:k ? .3 : -.1});
    A.choc(t + x, {f:80, f2:38, d:.4, g:.8, sat:3.5, corpsF:250, corps:1.5}, o);
    for(var j = 0; j < 7; j++) tinte(A, t + x + .03 + j * h(.03, .06), .9 - j * .1, o);                 /* la chaîne qui tinte */
  });
  return {duree:1.6};
};
/* — le poing (30 sur celui de devant) — */
S.gardienPoingA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.3, pan:.3, pan2:-.3, pant:.6});
  rouille(A, t, .45, {g:2, i0:.05, i1:.02}, o);                                                           /* il lève le bras */
  A.bruit(t + .45, {coul:'rose', filtres:[{type:'bandpass', f:400, pts:[[.25, 1600]], q:1.3}], env:[[0, 0], [.2, 1], [.27, 0]], g:1.2}, o);   /* whoum */
  var c = t + .72, o2 = A.bus(ici(P, c), {rev:.55, grotte:.4, pan:-.3});
  A.choc(c, {f:110, f2:35, d:.45, g:.9, sat:4, corps:1.6, corpsF:280}, o2);
  clang(A, c, 210, {g:.22, long:2, choc:0, modes:[[1, 1, .9, 1.5], [1.72, .7, .7], [2.61, .5, .5, 2], [3.9, .3, .3], [5.3, .2, .2]]}, o2);
  A.joue(c + .05, A.crepitement(.8, 40), {g:.4, filtres:[{type:'highpass', f:1500}, {type:'lowpass', f:6000}]}, o2);   /* la poussière de rouille */
  return {duree:2.2};
};
S.gardienPoingB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.3, pan:.3});
  rouille(A, t, .6, {g:2.2, i0:.06, i1:.025, res:[260, 640, 1300]}, o);
  var c = t + .7, o2 = A.bus(ici(P, c), {rev:.6, grotte:.6, pan:-.2});
  A.choc(c, {f:100, f2:30, d:.5, g:.8, sat:4}, o2);
  O.bong(A, c, 98, {long:1.5, chute:.97, g:.26}, o2);                                                     /* le gong */
  A.bruit(c + .05, {coul:'brun', lp:250, env:[[0, 0], [.1, 1], [1.8, 0]], g:1.2, sat:2}, o2);
  return {duree:2.8};
};
/* — les runes qui bourdonnent — */
S.gardienRunesA = function(A, P){
  var t = P.t, d = 2.6, o = A.bus(P, {rev:.45, grotte:.4, pan:.2}), env = [[0, 0], [.6, 1], [d - .6, .9], [d, 0]];
  [110, 165, 220].forEach(function(f, k){ A.ton(t, {type:'sawtooth', f:f, det:k * 4, env:env, g:.05, lp:900, trem:[6 + k, .5], sat:1.4}, o); });
  [1760, 2640].forEach(function(f){ A.ton(t + .2, {f:f, env:env, g:.012, vib:[5.5, 9]}, o); });
  return {duree:d + .2};
};
S.gardienRunesB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.5, pan:.2});
  [0, .45, .9, 1.35].forEach(function(x, k){
    var f = [196, 247, 294, 392][k];
    A.ton(t + x, {type:'triangle', f:f * .7, f2:f, gl:.25, env:[[0, 0], [.2, 1], [1.4, .5], [2, 0]], g:.09, trem:[4, .6], sat:1.6, lp:2200}, o);   /* « vwouum » */
    A.cloche(t + x + .2, f * 4, {d:1.4, rapport:3.5, indice:.9, g:.025}, o);
  });
  return {duree:3.5};
};
/* — touché — */
S.gardienToucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.55, grotte:.3, pan:.3});
  clang(A, t, 380, {g:.24, long:1.8, choc:.45, fc:140, modes:[[1, 1, .9, 1.5], [2.04, .6, .7], [2.95, .5, .5, 2], [4.2, .3, .3], [5.9, .15, .2]]}, o);
  A.joue(t + .08, A.crepitement(.6, 40), {g:.35, filtres:[{type:'highpass', f:1800}, {type:'lowpass', f:6000}]}, o);
  return {duree:1.8};
};
S.gardienToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.3, pan:.3});
  A.choc(t, {f:140, f2:60, d:.2, g:.8, sat:3, corpsF:400}, o);                                            /* tonk */
  A.modes(t, 300, [[1, 1, .3], [2.3, .5, .2], [3.6, .3, .1]], {g:.18}, o);
  for(var k = 0; k < 10; k++) A.modes(t + .15 + Math.pow(Math.random(), .8) * .9, h(2500, 5000), [[1, 1, .04], [2.6, .4, .03]], {g:h(.02, .05)}, o);   /* la rouille qui tombe en miettes */
  return {duree:1.3};
};
/* — l'effondrement — */
S.gardienFinA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.55, grotte:.4, pan:.2});
  rouille(A, t, 1.0, {g:2.2, i0:.07, i1:.02, res:[240, 600, 1250]}, o);
  for(var k = 0; k < 7; k++){
    var tt = t + .8 + k * h(.13, .22), oo = A.bus(ici(P, tt), {rev:.5, grotte:.3, pan:h(-.8, .8)});
    clang(A, tt, h(300, 1100) * (1 - k * .06), {g:.16, choc:.3, long:1.2, clic:.3}, oo);
  }
  var c = t + 2.3, oc = A.bus(ici(P, c), {rev:.6, grotte:.6, pan:0});
  A.choc(c, {f:90, f2:30, d:.6, g:.9, sat:4, corps:1.8}, oc);
  O.boum(A, c, {g:.4}, oc);
  return {duree:4.2};
};
S.gardienFinB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.55, grotte:.5, pan:.2});
  A.ton(t, {type:'sawtooth', f:62, f2:38, gl:1.4, env:[[0, 0], [.3, 1], [1.2, .8], [1.5, 0]], g:.25, sat:3, lp:700, gigue:4}, o);   /* il gémit, tout grave */
  [220, 165, 110].forEach(function(f){ A.ton(t, {f:f, f2:f * .5, gl:1.6, env:[[0, 0], [.1, 1], [1.6, 0]], g:.04, sat:1.4}, o); });   /* les runes s'éteignent */
  var c = t + 1.5, oc = A.bus(ici(P, c), {rev:.6, grotte:.6, pan:0});
  O.boum(A, c, {g:.5}, oc);
  for(var k = 0; k < 9; k++){ var tt = c + .05 + Math.pow(Math.random(), 1.5) * 1.4, oo = A.bus(ici(P, tt), {rev:.5, pan:h(-.9, .9)}); clang(A, tt, h(400, 2400), {g:h(.06, .14), choc:k < 3 ? .3 : 0, clic:.25}, oo); }
  O.bong(A, c + 1.6, 520, {g:.08, long:.5}, A.bus(ici(P, c + 1.6), {rev:.5, pan:.7}));                   /* le casque qui roule jusqu'au mur */
  return {duree:4.5};
};

/* =================== BOURBE, LE CRAPAUD (boss) =================== */
S.bourbeCriA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.6, pan:.1});
  coasse(A, t, 1.3, {f:74, coups:18, f1:380, f2:950, chute:.72, g:.4}, o);                                /* BRRROOOAAAK */
  glouglou(A, t + 1.25, 3, {f:200, g:.2}, o);
  return {duree:2.0};
};
S.bourbeCriB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.6, pan:.1});
  coasse(A, t, .25, {f:96, coups:28, f1:500, f2:1250, chute:.95, g:.38}, o);                              /* rib… */
  coasse(A, t + .38, .75, {f:80, coups:20, f1:360, f2:900, chute:.8, g:.42, env:[[0, 0], [.03, 1], [.5, .9], [.75, 0]]}, o);   /* …BIT ! */
  return {duree:1.5};
};
S.bourbeCriC = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.6, pan:.1});
  coasse(A, t, 1.5, {f:70, coups:16, f1:400, f2:1000, chute:.8, g:.38, gigue:14, vib:[5, 6]}, o);
  A.joue(t + .1, A.eau(1.4, 70, {fmin:150, fmax:700}), {g:.5, lp:1500, env:[[0, 0], [.2, 1], [1.2, .8], [1.4, 0]]}, o);   /* ça gargouille dans sa gorge */
  return {duree:2.2};
};
/* — la langue qui claque (elle avale un héros) — */
S.bourbeLangueA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:0, pan2:-.6, pant:.15});
  A.bruit(t, {filtres:[{type:'bandpass', f:700, pts:[[.09, 3500]], q:2}], env:A.perc(.004, .09), g:1.2}, o);   /* fwip */
  A.joue(t + .02, A.pince(140, {t60:.3, eclat:.5}), {g:.5, lp:2000, vit2:.7, sat:1.6}, o);                 /* la langue élastique */
  O.tchac(A, t + .14, {g:.9, mouille:1.8}, A.bus(ici(P, t + .14), {rev:.3, pan:-.6}));                      /* TCHAK */
  return {duree:.7};
};
S.bourbeLangueB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.35, pan:-.4});
  O.etire(A, t, {d:.2, g:.9}, o);
  A.bruit(t + .2, {hp:1500, env:A.perc(.0005, .02), g:1.2, sat:4, pre:2}, o);                              /* clac ! */
  A.ton(t + .21, {f:320, f2:90, gl:.15, env:A.perc(.003, .2), g:.3, trem:[24, .8], sat:1.6}, o);          /* thwong */
  O.sploutch(A, t + .22, {g:.6, bulles:2}, o);
  return {duree:.7};
};
/* — il gobe un héros — */
S.bourbeGobeA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4, pan:0});
  A.bruit(t, {filtres:[{type:'lowpass', f:3000, pts:[[.3, 300]], q:6}], env:[[0, 0], [.05, 1], [.3, 0]], g:1}, o);   /* slurp */
  A.ton(t + .3, {f:320, f2:110, gl:.12, env:A.perc(.004, .16), g:.45, sat:2}, o);                          /* GLOUPS */
  A.ton(t + .55, {f:220, f2:80, gl:.15, env:A.perc(.004, .2), g:.4, sat:2}, o);
  A.ton(t + .85, {type:'sawtooth', f:190, env:[[0, 0], [.02, 1], [.18, .8], [.25, 0]], g:.08, lp:450, trem:[22, .7]}, o);   /* « mmf ! » tout étouffé */
  return {duree:1.3};
};
S.bourbeGobeB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4, pan:0});
  A.bruit(t, {filtres:[{type:'bandpass', f:600, pts:[[.5, 2000]], q:5}], env:[[0, 0], [.4, 1], [.55, 0]], g:1, rugueux:.6, rugVit:9}, o);   /* un long slurp */
  [0, .2, .42].forEach(function(x, k){ A.ton(t + .6 + x, {f:300 - k * 60, f2:100 - k * 20, gl:.1, env:A.perc(.003, .14), g:.4, sat:2}, o); });   /* glou-glou-gloups */
  coasse(A, t + 1.3, .3, {f:120, coups:30, g:.25, chute:1.05}, o);                                        /* hm ! (content) */
  return {duree:1.9};
};
/* — le rot — */
S.bourbeRotA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, grotte:.4, pan:0});
  A.ton(t, {type:'sawtooth', f:76, f2:60, gl:1.1, env:[[0, 0], [.05, 1], [.9, .8], [1.1, 0]], g:.35, sat:3, gigue:9,
    filtres:[{type:'peaking', f:450, q:2, gain:9}, {type:'peaking', f:800, q:2, gain:6}, {type:'lowpass', f:1800}]}, o);
  A.bruit(t, {coul:'rose', bp:500, bq:2, env:[[0, 0], [.05, 1], [1.1, 0]], g:.5, rugueux:1, rugVit:14}, o);
  bulle(A, t + 1.1, {f:180, monte:2, g:.25, d:.12}, o);                                                    /* bloub */
  return {duree:1.5};
};
S.bourbeRotB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, grotte:.4, pan:0});
  A.ton(t, {type:'sawtooth', f:88, f2:72, gl:.4, env:[[0, 0], [.03, 1], [.3, .8], [.4, 0]], g:.35, sat:3, gigue:9, filtres:[{type:'peaking', f:500, q:2, gain:9}, {type:'lowpass', f:1800}]}, o);
  A.bruit(t, {coul:'rose', bp:550, bq:2, env:[[0, 0], [.03, 1], [.4, 0]], g:.5, rugueux:1, rugVit:14}, o);
  coasse(A, t + .65, .14, {f:150, coups:34, g:.22, chute:1.1, f1:600}, o);                                /* « hm ! » gêné */
  return {duree:1.0};
};
/* — le plongeon — */
S.bourbePlongeA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.5, pan:0});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:500, pts:[[.25, 1500]], q:1.4}], env:[[0, 0], [.2, 1], [.26, 0]], g:.6}, o);
  eclabousse(A, t + .25, 3, {g:1.1, d:.9, fmin:300, fmax:2000}, o);                                      /* plouf géant */
  glouglou(A, t + .9, 10, {f:220, g:.14, i1:.08, i2:.16, fade:true}, A.bus(ici(P, t + .9), {rev:.4, grotte:.4, pan:0}));
  return {duree:2.6};
};
S.bourbePlongeB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.5, pan:0});
  eclabousse(A, t, 2, {g:.9, d:.6}, o);
  A.bruit(t + .4, {coul:'brun', lp:500, env:[[0, 0], [.3, 1], [1.6, 0]], g:.6}, o);                      /* l'eau se referme */
  glouglou(A, t + .5, 14, {f:170, g:.15, i1:.1, i2:.2, monte:2, fade:true}, o);
  return {duree:3.0};
};
/* — le saut (15 sur tous) et la grosse gerbe d'eau — */
S.bourbeSautA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.5, pan:0});
  coasse(A, t, .18, {f:110, coups:30, g:.3, chute:1.2}, o);                                               /* hop ! */
  A.bruit(t + .1, {coul:'rose', filtres:[{type:'bandpass', f:300, pts:[[.4, 1600]], q:1.3}], env:[[0, 0], [.3, 1], [.45, 0]], g:.8}, o);
  var c = t + .95, oc = A.bus(ici(P, c), {rev:.6, grotte:.7, pan:0});
  A.choc(c, {f:75, f2:28, d:.6, g:.9, sat:4.5, corps:1.6, corpsF:250}, oc);                               /* SPLAAASH */
  eclabousse(A, c, 4, {g:1.2, d:1.1, fmin:250, fmax:2200}, oc);
  pluie(A, P, c + .3, 1.6, 22, 1);                                                                         /* les gouttes retombent partout */
  return {duree:3.3};
};
S.bourbeSautB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.5, pan:0});
  A.ton(t, {f:200, f2:600, gl:.4, env:[[0, 0], [.05, 1], [.4, 0]], g:.08, vib:[8, 20]}, o);
  var c = t + .7, oc = A.bus(ici(P, c), {rev:.6, grotte:.8, pan:0});
  A.choc(c, {f:70, f2:25, d:.7, g:1, sat:5, corps:1.8, corpsF:220}, oc);
  A.bruit(c + .03, {coul:'brun', lp:220, env:[[0, 0], [.1, 1], [2.2, 0]], g:1.4, sat:2}, oc);           /* toute la salle tremble */
  eclabousse(A, c, 3, {g:1, d:.9}, oc);
  for(var k = 0; k < 10; k++){ var tt = c + .2 + Math.random() * 1.2; A.modes(tt, h(1200, 3200), [[1, 1, .05], [2.4, .4, .03]], {g:h(.03, .07)}, A.bus(ici(P, tt), {rev:.4, pan:h(-.9, .9)})); }   /* des cailloux tombent du plafond */
  return {duree:3.2};
};
/* — il rit quand on le chatouille (le héros avalé) — */
S.bourbeRireA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, grotte:.4, pan:0});
  [112, 122, 116, 106, 96].forEach(function(f, k){ coasse(A, t + k * .17, .14, {f:f, coups:30, g:.34, chute:.92, f1:480}, o); });   /* BWA-HA-HA-HA-HA */
  A.ton(t + .9, {f:520, f2:950, gl:.05, env:A.perc(.003, .08), g:.12}, o);                                  /* hic ! */
  return {duree:1.3};
};
S.bourbeRireB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, grotte:.4, pan:0});
  [170, 182, 176].forEach(function(f, k){ coasse(A, t + k * .13, .09, {f:f, coups:36, g:.24, chute:1.05, f1:600, f2:1500}, o); });   /* hi-hi-hi */
  [98, 92, 86].forEach(function(f, k){ coasse(A, t + .55 + k * .2, .17, {f:f, coups:26, g:.36, chute:.9}, o); });                      /* ho-ho-HO */
  A.bruit(t + 1.25, {coul:'rose', bp:900, bq:1, env:[[0, 0], [.05, 1], [.35, 0]], g:.5}, o);                                            /* pfff */
  return {duree:1.7};
};
/* — touché — */
S.bourbeToucheA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, grotte:.3, pan:0});
  A.bruit(t, {filtres:[{type:'lowpass', f:2500, pts:[[.1, 400]], q:5}], env:A.perc(.002, .12), g:.9}, o);   /* une claque mouillée */
  coasse(A, t + .03, .32, {f:86, coups:24, g:.4, chute:.6}, o);                                               /* OUARG */
  return {duree:.8};
};
S.bourbeToucheB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.45, grotte:.3, pan:0});
  A.ton(t, {f:150, f2:95, gl:.3, env:[[0, 0], [.003, 1], [.1, .6], [.45, 0]], g:.5, sat:2.2, vib:[14, 10], lp:1600}, o);   /* boïng, sur son gros ventre */
  A.choc(t, {f:160, f2:70, d:.1, g:.35, corpsF:300}, o);
  grogne(A, t + .35, .3, {f:90, rr:20, g:.25, f1:450}, o);
  return {duree:.9};
};
/* — la défaite — */
S.bourbeFinA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.55, grotte:.6, pan:0});
  coasse(A, t, 1.7, {f:88, coups:17, g:.4, chute:.55, f1:400, env:[[0, 0], [.08, 1], [1.2, .7], [1.7, 0]]}, o);   /* un long coassement triste */
  eclabousse(A, t + 1.9, 2, {g:.8, d:.7}, o);
  glouglou(A, t + 2.3, 6, {f:180, g:.12, fade:true}, o);
  return {duree:3.4};
};
S.bourbeFinB = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.5, pan:0, pan2:.5, pant:1.3});
  A.ton(t, {f:900, f2:260, gl:1.3, env:[[0, 0], [.05, 1], [1.2, .7], [1.3, 0]], g:.08, trem:[34, .8]}, o);   /* il se dégonfle comme un ballon : ffrrrt */
  A.bruit(t, {bp:1400, bp2:500, bpt:1.3, bq:3, env:[[0, 0], [.05, 1], [1.2, .7], [1.3, 0]], g:.6, trem:[34, .8]}, o);
  var c = t + 1.4, oc = A.bus(ici(P, c), {rev:.5, grotte:.5, pan:.5});
  A.choc(c, {f:110, f2:40, d:.3, g:.7, sat:3}, oc);
  eclabousse(A, c, 2, {g:.7, d:.6}, oc);
  coasse(A, c + .9, .12, {f:130, coups:34, g:.2, chute:1.05, f1:550}, oc);                                     /* … rib. */
  return {duree:2.6};
};

})(window);
