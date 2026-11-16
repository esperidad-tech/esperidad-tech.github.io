/* Atelier des sons de Brumeval — LES MUSIQUES DES CINÉMATIQUES (Bible §13.45 ; Romain, 15 novembre, 16 h 57 : « il faut ajouter
   une petite musique en fonction de la situation »). Une musique par film, calée à la seconde sur ses images (jeu/cine/src/films.js) :
   elle ne tourne pas en boucle, elle raconte le film. Toutes en ré mineur, comme le donjon.
   Le jeu ne les fabrique pas en direct : jeu/cine/bande-son.py les rend une fois, avec les bruitages du film, dans la bande-son
   (sortie/<film>.mp3) que le lecteur joue avec la vidéo. Dans l'Atelier, on les écoute seules (Léo › Cinématiques).
   Une musique : MUSIQUES[id + lettre] = function(A, P) -> une Instance (musiques.js) ; « a(I, t, fn) » joue fn une fois, t secondes après le début. */
(function(G){
'use strict';
if(!G.MUSIQUES || !G.MUSIQUES_OUTILS) return;
var h = Moteur.hasard, m = Moteur.midi, M = G.MUSIQUES, T = G.MUSIQUES_OUTILS, Instance = T.Instance, boite = T.boite;
function a(I, t, fn){ I.chaque(t, 1e6, function(tt){ fn(tt); }); }
/* une nappe grave qui commence et finit (pas un bourdon sans fin) */
function fond(A, t, freqs, d, g, dest, o){
  o = o || {};
  freqs.forEach(function(f){ [-7, 7].forEach(function(det){
    A.ton(t, {type:'sawtooth', f:f, det:det + h(-2, 2), env:[[0, 0], [o.a || 1.5, 1], [Math.max((o.a || 1.5) + .1, d - (o.r || 2)), .9], [d, 0]], g:g, filtres:[{type:'lowpass', f:o.lp || 260, q:.7}]}, dest);
  }); });
}
/* un cuivre grave qui gonfle (cor, trombone) */
function cuivre(A, t, f, d, g, dest){
  var env = [[0, 0], [Math.min(.35, d * .3), 1], [d * .7, .8], [d, 0]];
  A.ton(t, {type:'sawtooth', f:f, env:env, g:g, sat:1.3, filtres:[{type:'lowpass', f:280, pts:[[Math.min(.4, d * .3), 1500], [d, 380]], q:1.2}]}, dest);
  A.ton(t, {type:'sawtooth', f:f, det:9, env:env, g:g * .7, filtres:[{type:'lowpass', f:900, q:.7}]}, dest);
}
/* un grand coup (grosse caisse, cymbale, le grave qui tremble) */
function frappe(A, t, g, dest){
  A.tambour(t, {f:56, d:1.7, g:g}, dest);
  A.bruit(t, {coul:'blanc', hp:2600, env:[[0, 0], [.004, 1], [1.5, 0]], g:g * .16}, dest);
  A.bruit(t, {coul:'brun', lp:140, env:A.perc(.01, 1.3), g:g * .8}, dest);
}
/* le souffle qui monte juste avant un coup (une cymbale à l'envers) */
function montee(A, t, d, g, dest){ A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:250, pts:[[d, 4200]], q:1.1}], env:[[0, 0], [d * .94, 1], [d, 0]], g:g}, dest); }
/* des cordes en trémolo (l'archet qui tremble) */
function trem(A, t, f, d, g, dest, o){
  o = o || {};
  A.ton(t, {type:'sawtooth', f:f, f2:o.f2, gl:d, det:h(-4, 4), env:o.env || [[0, 0], [d * .6, 1], [d, 0]], g:g, trem:[o.vit || 11, .9], vib:[5, f * .004], filtres:[{type:'lowpass', f:o.lp || 1500, q:.6}]}, dest);
}
/* un battement sourd (le cœur, des pas lointains) */
function sourd(A, t, g, dest){ A.tambour(t, {f:62, d:.5, g:g}, dest); }

/* =================== L'ENTRÉE (entree, 15,2 s) : l'homme en cape attend dans l'ombre, ses yeux s'allument, il avance, il parle =================== */
M.cineMusEntreeA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.35}), tamb = A.bus(P, {grotte:.7, g:.9}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.42, retour:.45, lp:2200, sortie:.5});
  a(I, 0, function(t){
    fond(A, t, [m(26), m(33)], 15, .04, proche, {a:1.4, r:1.2});                                    /* le ré tout en bas, dans le noir */
    A.bruit(t, {coul:'brun', bp:240, bq:.8, env:[[0, 0], [2, 1], [13, .8], [15, 0]], g:.05}, loin);    /* l'air du souterrain */
  });
  a(I, 1.35, function(t){                                                                          /* ses yeux s'allument */
    [m(38), m(44)].forEach(function(f){ cuivre(A, t, f, 3.2, .045, proche); });                     /* ré et la bémol : ça grince */
    A.choeur(t, [m(50), m(56)], 3.4, {voyelle:'a', a:.25, r:2, g:.026}, loin);
    [[0, 62], [.45, 65], [.9, 68], [1.35, 69]].forEach(function(p){ A.harpe(t + .5 + p[0], m(p[1]), {t60:2.2, g:.08, lp:2200}, ech); });
  });
  a(I, 2.2, function(t){ [0, 1.15, 2.3].forEach(function(x){ sourd(A, t + x, .12, tamb); }); trem(A, t, m(45), 4, .016, proche, {env:[[0, 0], [3.5, 1], [4, .4]]}); });
  a(I, 3.98, function(t){ A.tambour(t, {f:52, d:1.1, g:.3}, tamb); });                              /* ses deux pas */
  a(I, 4.93, function(t){ A.tambour(t, {f:48, d:1.2, g:.34}, tamb); });
  a(I, 6.5, function(t){                                                                           /* « J'attends ce moment depuis longtemps. » */
    A.choeur(t, [m(50), m(53), m(57)], 3.2, {voyelle:'ou', a:1, r:1.4, g:.018}, loin);
    [[0, 62], [.6, 65], [1.2, 68], [1.8, 69], [2.6, 61], [3.0, 62]].forEach(function(p){ A.harpe(t + p[0], m(p[1]), {t60:1.8, g:.07, lp:2000}, ech); });
  });
  a(I, 9.7, function(t){                                                                           /* « Vous n'auriez jamais dû venir ici. » */
    [m(38), m(45), m(50)].forEach(function(f){ cuivre(A, t, f, 2.6, .04, proche); });
    trem(A, t, m(45), 2.7, .02, proche, {f2:m(46)}); trem(A, t, m(50), 2.7, .016, proche, {f2:m(51)});
  });
  a(I, 12.4, function(t){                                                                          /* « Je vais m'occuper de vous. » : le cœur qui accélère, ça monte */
    [.2, .8, 1.3, 1.7, 1.95, 2.15].forEach(function(x, k){ sourd(A, t + x, .12 + k * .03, tamb); });
    montee(A, t + 1.05, 1.0, .3, loin);
  });
  a(I, 14.45, function(t){                                                                         /* le coup : le combat commence */
    frappe(A, t, .5, tamb);
    [m(38), m(39), m(44)].forEach(function(f){ cuivre(A, t, f, 1.6, .05, proche); });
    A.choeur(t, [m(50), m(51), m(56)], 1.2, {voyelle:'a', a:.05, r:.9, g:.03}, loin);
  });
  return I;
};

/* =================== FIN DE LA PHASE 1 (a12, 13,6 s) : il tombe, arrache sa cape, hurle, bande ses muscles =================== */
M.cineMusA12A = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.3}), tamb = A.bus(P, {grotte:.6, g:.9}), loin = A.bus(P, {grotte:1, g:.7});
  a(I, 0, function(t){
    fond(A, t, [m(26), m(33)], 13.4, .045, proche, {a:1.2, r:1});                                 /* le ré tout en bas, qui gronde */
    A.archet(t + .3, m(38), 5.2, {a:1.2, r:.6, g:.03}, proche);
    trem(A, t + 1.8, m(45), 3.7, .02, proche, {env:[[0, 0], [3.5, 1], [3.7, 0]]});                /* la et si bémol : ça grince… */
    trem(A, t + 2.2, m(46), 3.3, .018, proche, {env:[[0, 0], [3.1, 1], [3.3, 0]]});
    [1.2, 2.25, 3.15, 3.9, 4.5, 4.95, 5.25].forEach(function(x, k){ sourd(A, t + x, .12 + k * .02, tamb); });   /* le cœur qui s'emballe */
    montee(A, t + 4.55, .93, .35, loin);
  });
  a(I, 5.48, function(t){                                                                           /* il arrache sa cape : BOUM */
    frappe(A, t, .55, tamb);
    [m(38), m(45), m(50)].forEach(function(f){ cuivre(A, t, f, 2.4, .05, proche); });
    A.choeur(t, [m(62), m(65), m(69)], 1.8, {voyelle:'a', a:.08, r:1.2, g:.03}, loin);
  });
  a(I, 6.8, function(t){                                                                            /* le cri : la musique se tient en dessous */
    trem(A, t, m(50), 2.1, .018, proche, {env:[[0, 0], [.3, 1], [1.8, .8], [2.1, 0]]});
    trem(A, t, m(53), 2.1, .014, proche, {env:[[0, 0], [.3, 1], [1.8, .8], [2.1, 0]]});
  });
  a(I, 8.9, function(t){                                                                            /* les biceps : trois coups */
    [0, .34, .68].forEach(function(x, k){ A.tambour(t + x, {f:70 - k * 6, d:.9, g:.34 + k * .08}, tamb); });
    [m(38), m(45)].forEach(function(f){ cuivre(A, t + .68, f, 1.4, .05, proche); });
  });
  a(I, 10.0, function(t){ frappe(A, t, .35, tamb); });
  a(I, 10.6, function(t){                                                                           /* il se gonfle : ça monte, sans finir (le combat reprend) */
    [[46, 50, 53], [45, 49, 52]].forEach(function(acc, k){ acc.forEach(function(n){ cuivre(A, t + k * 1.3, m(n - 12), 1.5, .035, proche); }); });
    A.choeur(t, [m(58), m(62), m(65)], 1.4, {voyelle:'o', a:.4, r:.6, g:.022}, loin);
    A.choeur(t + 1.3, [m(57), m(61), m(64)], 1.7, {voyelle:'a', a:.3, r:1.2, g:.026}, loin);
    montee(A, t + .5, 1.0, .25, loin);
    [1.5, 1.75, 2.0, 2.25].forEach(function(x){ A.tambour(t + x, {f:75, d:.4, g:.22}, tamb); });
  });
  return I;
};

/* =================== FIN DE LA PHASE 2 (b23, 14,2 s) : « Très bien… Je n'ai pas le choix. », la potion, la transformation =================== */
M.cineMusB23A = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.3}), tamb = A.bus(P, {grotte:.6, g:.9}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.38, retour:.4, lp:3000, sortie:.5});
  a(I, 0, function(t){
    fond(A, t, [m(26)], 9.9, .04, proche, {a:1.5, r:.4});                                        /* fatigué : un fond bas */
    A.nappe(t + .2, [m(50), m(53), m(57)], 3.6, {type:'triangle', a:1.2, r:1, lp:700, lp1:260, g:.03}, proche);   /* ré mineur */
    A.nappe(t + 3.4, [m(46), m(50), m(53)], 1.8, {type:'triangle', a:.6, r:.6, lp:700, lp1:260, g:.03}, proche);   /* « Très bien… » : si bémol */
    A.nappe(t + 4.9, [m(43), m(46), m(50)], 2.2, {type:'triangle', a:.5, r:.8, lp:700, lp1:260, g:.032}, proche);  /* « Je n'ai pas le choix. » : sol mineur */
    A.archet(t + 4.9, m(31), 2.3, {a:.5, r:.6, g:.03}, proche);
  });
  a(I, 6.9, function(t){                                                                            /* la potion : de petites notes de verre, vertes */
    [[0, 81], [.45, 82], [.9, 86], [1.6, 89], [2.2, 86], [2.65, 82]].forEach(function(p){ boite(A, t + p[0], m(p[1]), .05, proche); boite(A, t + p[0], m(p[1]), .025, ech); });
    A.cloche(t + .1, m(93), {d:2.5, rapport:2.01, indice:.5, g:.02}, loin);
    trem(A, t, m(50), 2.9, .016, proche, {env:[[0, 0], [2.6, 1], [2.9, 0]]});
    trem(A, t + .3, m(51), 2.6, .012, proche, {env:[[0, 0], [2.3, 1], [2.6, 0]]});
    [1.95, 2.25, 2.55].forEach(function(x){ A.harpe(t + x, m(38), {t60:1.2, g:.12}, proche); });   /* il boit : glou, glou, glou */
  });
  a(I, 10.25, function(t){                                                                          /* ça agit : le cœur qui cogne de plus en plus vite */
    [0, .62, 1.12, 1.5, 1.78, 1.98, 2.12, 2.24].forEach(function(x, k){ sourd(A, t + x, .16 + k * .03, tamb); });
    [m(50), m(51), m(57)].forEach(function(f, k){ trem(A, t + .2, f, 2.1, .016 + k * .002, proche, {f2:f * 1.34, vit:13, env:[[0, 0], [1.9, 1], [2.1, 0]]}); });   /* les cordes montent, montent */
    A.choeur(t + .4, [m(50), m(57), m(62)], 1.9, {voyelle:'ou', a:1.2, r:.3, g:.02}, loin);
    montee(A, t + 1.2, 1.0, .35, loin);
  });
  a(I, 12.5, function(t){                                                                           /* il hurle : tout tombe d'un coup */
    frappe(A, t, .6, tamb);
    [m(26), m(38), m(45), m(50), m(53)].forEach(function(f){ cuivre(A, t, f, 1.7, .045, proche); });
    A.choeur(t, [m(62), m(65), m(69), m(74)], 1.6, {voyelle:'a', a:.06, r:1, g:.028}, loin);
    [.5, .75, 1.0].forEach(function(x){ A.tambour(t + x, {f:68, d:.6, g:.28}, tamb); });
  });
  return I;
};

/* =================== LA FIN, LÉO PARLE (finLeo, 41,8 s) : triste, puis la peur quand il parle du maire, puis le mystère =================== */
M.cineMusFinLeoA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.35}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.5, retour:.35, lp:2600, sortie:.45});
  a(I, 0, function(t){                                                                              /* la potion s'en va : une lueur qui redescend */
    A.ton(t, {type:'triangle', f:m(93), f2:m(81), gl:1.9, env:[[0, 0], [.05, 1], [1.9, 0]], g:.02, trem:[9, .7]}, loin);
    A.ton(t + .1, {type:'triangle', f:m(88), f2:m(76), gl:1.8, env:[[0, 0], [.05, 1], [1.8, 0]], g:.015, trem:[7, .7]}, loin);
  });
  /* triste : des notes de harpe lentes, une nappe, le violoncelle (ré mineur, si bémol, sol mineur, la) */
  var TRISTE = [[38, [50, 53, 57, 62]], [34, [50, 53, 58, 62]], [31, [50, 55, 58, 62]], [33, [49, 52, 57, 61]]];
  TRISTE.forEach(function(c, k){
    a(I, 2.4 + k * 3.4, function(t){
      A.archet(t, m(c[0]), 3.6, {a:.8, r:.9, g:.03}, proche);
      A.nappe(t, c[1].slice(0, 3).map(m), 3.8, {type:'triangle', a:1, r:1.2, lp:850, lp1:300, g:.022}, proche);
      [0, 1, 2, 3, 2, 1].forEach(function(i, j){ A.harpe(t + j * .55, m(c[1][i] + 12), {t60:2.4, g:.075}, proche); });
    });
  });
  /* la peur (« C'est lui qui a tout préparé… ») : ça s'assombrit, des cordes qui tremblent, des coups sourds comme des pas */
  a(I, 15.6, function(t){
    A.ton(t, {type:'sawtooth', f:m(26), env:[[0, 0], [2, 1], [10.5, .9], [11, 0]], g:.03, filtres:[{type:'lowpass', f:220}]}, proche);
    trem(A, t + .5, m(50), 10.2, .012, proche, {env:[[0, 0], [3, 1], [9.5, 1], [10.2, 0]], vit:9});
    trem(A, t + 1.5, m(51), 9.2, .01, proche, {env:[[0, 0], [3, 1], [8.5, 1], [9.2, 0]], vit:10});
    A.nappe(t + .2, [m(50), m(51), m(57)], 10, {type:'triangle', a:3, r:2, lp:600, lp1:250, g:.016}, proche);
    [1.2, 3.4, 5.6, 7.8, 9.6].forEach(function(x){ sourd(A, t + x, .1, loin); });
  });
  a(I, 22.3, function(t){ A.cloche(t, m(69), {d:3.5, rapport:3.5, indice:.7, g:.03}, loin); });   /* « Odette… » */
  /* le mystère (« Il descend souvent… une ville, sous Brumeval ») : de grosses cloches très loin, un chœur sans paroles */
  a(I, 26.7, function(t){
    [0, 3.9, 7.8].forEach(function(x){ A.cloche(t + x, m(38), {d:6, rapport:3.5, indice:.9, g:.045}, loin); });
    A.choeur(t + .3, [m(50), m(57), m(64)], 7, {voyelle:'ou', a:2.5, r:2.5, g:.022}, loin);
    A.choeur(t + 6.2, [m(50), m(55), m(62)], 5, {voyelle:'o', a:2, r:2.5, g:.02}, loin);
    [[3.9, 86], [4.5, 89], [5.2, 93], [7.9, 88], [8.6, 84]].forEach(function(p){ boite(A, t + p[0], m(p[1]), .03, ech); });
    A.ton(t, {type:'sawtooth', f:m(26), env:[[0, 0], [2, 1], [11, .8], [15, 0]], g:.03, filtres:[{type:'lowpass', f:200}]}, proche);
  });
  a(I, 37.6, function(t){ A.cloche(t + 2.3, m(26 + 12), {d:5, rapport:3.5, indice:.8, g:.04}, loin); });   /* « Personne n'y va. Jamais. » */
  return I;
};

/* =================== LA FIN, LE MAIRE (finMaire, 27,2 s) : le souterrain, le maire descend, le gant, « Gardes ! » =================== */
M.cineMusFinMaireA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.35}), tamb = A.bus(P, {grotte:.7, g:.9}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.45, retour:.4, lp:2400, sortie:.5});
  a(I, 0, function(t){
    A.nappe(t, [m(50), m(53), m(57)], 2.6, {type:'triangle', a:.2, r:2, lp:700, lp1:300, g:.02}, proche);   /* ce qui reste de la fin de Léo */
    A.bruit(t + 1.2, {coul:'brun', filtres:[{type:'bandpass', f:300, q:.6}], env:[[0, 0], [2, 1], [9, .8], [11, 0]], g:.25}, loin);   /* l'air du souterrain */
    A.ton(t + 1.4, {type:'sawtooth', f:m(26), env:[[0, 0], [2.5, 1], [9, .9], [9.8, 0]], g:.035, filtres:[{type:'lowpass', f:220}]}, proche);
    A.cloche(t + 2.2, m(45), {d:4, rapport:3.5, indice:.8, g:.025}, loin);
  });
  a(I, 2.7, function(t){                                                                            /* il descend : une marche lente et lourde */
    for(var k = 0; k < 10; k++){
      A.tambour(t + k * .8, {f:k % 2 ? 66 : 60, d:.7, g:.16 + Math.min(k, 6) * .015}, tamb);
      if(k % 2 === 0) cuivre(A, t + k * .8, m(k % 4 ? 39 : 38), 1.5, .03 + k * .002, proche);       /* ré, mi bémol : ça menace */
    }
    trem(A, t + 2, m(50), 6, .012, proche, {f2:m(53), env:[[0, 0], [5, 1], [6, 0]], vit:10});
  });
  a(I, 10.8, function(t){ trem(A, t, m(38), 4.2, .018, proche, {env:[[0, 0], [.5, 1], [3.6, 1], [4.2, 0]], vit:8, lp:900}); });   /* « Que s'est-il passé ici ? » */
  a(I, 14.7, function(t){                                                                           /* le gant, la bague : une petite ritournelle qui fait froid */
    [[0, 74], [.4, 75], [.8, 68], [1.6, 74], [2.0, 75], [2.4, 68], [2.9, 63]].forEach(function(p){ boite(A, t + p[0], m(p[1]), .045, proche); boite(A, t + p[0], m(p[1]), .02, ech); });
    A.ton(t, {type:'sawtooth', f:m(26), env:[[0, 0], [.5, 1], [3.2, .9], [3.6, 0]], g:.03, filtres:[{type:'lowpass', f:200}]}, proche);
    A.cloche(t + 2.1, m(86), {d:2.5, rapport:2.76, indice:.6, g:.02}, loin);                          /* la bague qui luit */
  });
  a(I, 18.2, function(t){                                                                           /* « Vous êtes allés trop loin… » */
    [m(38), m(41), m(44)].forEach(function(f){ cuivre(A, t, f, 3.4, .03, proche); });
    A.choeur(t + .2, [m(50), m(53), m(56)], 3.3, {voyelle:'o', a:1, r:1.2, g:.02}, loin);
  });
  a(I, 21.8, function(t){                                                                           /* « Monsieur le maire… ? » : ça monte */
    [m(50), m(51), m(56)].forEach(function(f){ trem(A, t, f, 2.2, .014, proche, {f2:f * 1.19, vit:13, env:[[0, 0], [2, 1], [2.2, 0]]}); });
    montee(A, t + 1.2, 1.0, .3, loin);
  });
  a(I, 24.0, function(t){                                                                           /* « Gardes ! Attrapez-les ! » */
    frappe(A, t, .5, tamb);
    [m(26), m(38), m(45), m(51)].forEach(function(f){ cuivre(A, t, f, 1.2, .04, proche); });
    for(var k = 0; k < 10; k++) A.tambour(t + .9 + k * .2, {f:k % 2 ? 80 : 70, d:.3, g:.18 + k * .015}, tamb);   /* la charge */
    [m(38), m(39)].forEach(function(f, k){ cuivre(A, t + .9 + k * .8, f, .8, .035, proche); });
  });
  return I;
};

/* =================== LE RASSEMBLEMENT AU VIEUX CHÊNE (chene, 61,8 s ; Bible §12.63 ; Romain, 16 novembre : « une musique de révolte
   puis, quand la fumée arrive, une musique de stress ») ===================
   0 → 12 s     LA RÉVOLTE : une marche (tambours, cors, cordes graves) ; Silas barre le chemin (elle retient son souffle), on passe (le coup)
   12 → 24,7 s  LE CHÊNE, puis L'HOMME EN CAPE : presque rien (une harpe, un fond grave), puis les cordes qui tremblent, le cœur, ça monte
   24,7 s       PFFFT : le grand coup
   24,7 → 58 s  LE STRESS : les cordes graves qui galopent, le tambour qui cogne, les aigus qui grincent ; elle se fait PETITE sous les
                répliques (38 → 55 s : des enfants lisent), puis repart pour la fuite
   58 → fin     les yeux dans l'ombre : le motif de l'homme en cape (le même qu'à l'entrée du donjon : ré, fa, la bémol, la)
   On est dehors : presque pas d'écho. */
M.cineMusCheneA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.1}), tamb = A.bus(P, {grotte:.22, g:.9}), loin = A.bus(P, {grotte:.5, g:.7}), ech = I.echo(loin, {temps:.42, retour:.4, lp:2200, sortie:.45});
  function caisse(t, g){ A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:1900, q:.7}], env:A.perc(.002, .11), g:g}, tamb); A.ton(t, {f:190, f2:140, gl:.08, env:A.perc(.002, .09), g:g * .5}, tamb); }
  function ra(t, g){ [0, .083, .166].forEach(function(x, k){ caisse(t + x, g * (.55 + k * .2)); }); }                      /* ra-ta-ta */
  function corde(t, n, d, g){ A.archet(t, m(n), d, {a:.02, r:d * .5, g:g, lp:1500}, proche); }                               /* une note courte, à l'archet */
  function cor(t, n, d, g){ cuivre(A, t, m(n), d, g, proche); A.ton(t, {type:'triangle', f:m(n), env:[[0, 0], [.08, 1], [d * .7, .8], [d, 0]], g:g * .7, vib:[5, m(n) * .004], vibRetard:.3}, proche); }
  function coup(t, notes, d, g){ notes.forEach(function(n){ cuivre(A, t, m(n), d, g, proche); }); }

  /* ---------------- LA RÉVOLTE (un temps = 0,5 s) ---------------- */
  a(I, 0, function(t){
    for(var k = 0; k < 13; k++){                                                                      /* la marche : 0 → 6,5 s */
      var x = k * .5, f = Math.min(1, .35 + k * .12);
      if(k % 2 === 0) A.tambour(t + x, {f:68, d:.55, g:.3 * f}, tamb); else caisse(t + x, .11 * f);
      if(k % 4 === 3) ra(t + x + .25, .08 * f);
    }
    /* les cordes graves : ré ré fa ré | ré ré la ré | si♭ si♭ ré si♭ | la… */
    [38, 38, 41, 38, 38, 38, 45, 38, 34, 34, 38, 34, 33, 33, 37, 33, 38, 38, 41, 38, 38, 38, 45, 38, 34, 34].forEach(function(n, k){ corde(t + k * .25, n, .2, .03 * Math.min(1, .4 + k * .08)); });
    fond(A, t, [m(26), m(38)], 6.8, .03, proche, {a:1, r:.6});
    /* les cors : la, ré, fa… mi, ré, LA (le cri de Gaspard) sol, fa */
    [[1.0, 45, .5], [1.5, 50, .5], [2.0, 53, 1.0], [3.0, 52, .5], [3.5, 50, .5], [4.0, 57, 1.5], [5.5, 55, .5], [6.0, 53, .7]].forEach(function(n){ cor(t + n[0], n[1], n[2] + .12, .05); });
    A.choeur(t + 3.9, [m(57), m(62), m(65)], 2.4, {voyelle:'a', a:.25, r:1.2, g:.022}, loin);        /* « Tous au Vieux Chêne ! » : le village avec lui */
  });
  a(I, 6.6, function(t){                                                                              /* Silas barre le chemin : la marche retient son souffle */
    trem(A, t, m(57), 3.8, .016, proche, {env:[[0, 0], [.3, .6], [3.2, 1], [3.8, 0]]});
    trem(A, t + .2, m(58), 3.6, .013, proche, {env:[[0, 0], [.3, .5], [3, 1], [3.6, 0]]});
    fond(A, t, [m(26), m(33)], 3.9, .035, proche, {a:.4, r:.5});
    [.4, 1.4, 2.4, 2.9, 3.4].forEach(function(x, k){ sourd(A, t + x, .13 + k * .02, tamb); });
    cuivre(A, t + .1, m(39), 1.6, .035, proche);                                                      /* mi bémol : non ! */
    ra(t + 3.3, .1); ra(t + 3.55, .13);
  });
  a(I, 10.4, function(t){                                                                             /* on passe ! */
    frappe(A, t, .42, tamb);
    coup(t, [38, 45, 50, 53], 1.5, .05);
    A.choeur(t, [m(62), m(65), m(69)], 1.5, {voyelle:'a', a:.06, r:1, g:.026}, loin);
    [.5, .75, 1.0, 1.25].forEach(function(x, k){ if(k % 2) caisse(t + x, .12); else A.tambour(t + x, {f:68, d:.4, g:.3}, tamb); });
    [38, 38, 41, 45, 50].forEach(function(n, k){ corde(t + .5 + k * .2, n, .18, .034); });
    A.tambour(t + 1.55, {f:55, d:1.4, g:.36}, tamb);                                                  /* et on arrive : le chêne */
  });

  /* ---------------- LE CHÊNE SOUS LA LUNE, PUIS L'HOMME EN CAPE ---------------- */
  a(I, 12.0, function(t){
    fond(A, t, [m(26), m(33)], 12.8, .034, proche, {a:1.5, r:.5});
    A.choeur(t + .3, [m(50), m(57)], 4.2, {voyelle:'ou', a:1.4, r:1.8, g:.016}, loin);
    [[.5, 62], [1.1, 69], [1.7, 74], [2.6, 72], [3.2, 69]].forEach(function(n){ A.harpe(t + n[0], m(n[1]), {t60:2.4, g:.07, lp:2400}, ech); });
  });
  a(I, 16.2, function(t){                                                                             /* derrière le chêne : quelqu'un */
    trem(A, t, m(57), 8.5, .02, proche, {env:[[0, 0], [1.5, .35], [6.2, .7], [8.4, 1], [8.5, 0]]});
    trem(A, t + 1.3, m(58), 7.2, .016, proche, {env:[[0, 0], [1.5, .3], [5, .7], [7.1, 1], [7.2, 0]]});
    [.6, 1.9, 3.1, 4.2, 5.2, 6.1, 6.8, 7.4, 7.85, 8.2].forEach(function(x, k){ sourd(A, t + x, .1 + k * .016, tamb); });   /* le cœur, de plus en plus vite */
    [[1.4, 62], [1.85, 65], [2.3, 68], [2.75, 69]].forEach(function(n){ A.harpe(t + n[0], m(n[1]), {t60:2, g:.06, lp:2000}, ech); });      /* son motif */
    cuivre(A, t + 3.7, m(38), 2.2, .03, proche); cuivre(A, t + 3.7, m(44), 2.2, .026, proche);        /* l'allumette : ré et la bémol, ça grince */
    trem(A, t + 6.1, m(69), 2.4, .014, proche, {f2:m(75), env:[[0, 0], [2.2, 1], [2.4, 0]]});          /* la mèche brûle : ça monte, ça monte… */
    trem(A, t + 6.1, m(62), 2.4, .014, proche, {f2:m(68), env:[[0, 0], [2.2, 1], [2.4, 0]]});
    montee(A, t + 7.3, 1.2, .3, loin);
  });

  /* ---------------- PFFFT ! ET LE STRESS (un temps = 0,4 s) ---------------- */
  var OST = [38, 38, 39, 38, 38, 38, 41, 39];                                                         /* ré ré mi♭ ré | ré ré fa mi♭ : ça galope */
  function galop(t, d, g, haut){ for(var k = 0; k * .2 < d - .05; k++) corde(t + k * .2, OST[k % 8] + (haut || 0), .15, g * (k % 4 === 0 ? 1.25 : 1)); }
  function cogne(t, d, g, double){ for(var k = 0; k * .4 < d - .05; k++){ A.tambour(t + k * .4, {f:k % 4 === 0 ? 56 : 66, d:.42, g:g * (k % 4 === 0 ? 1.2 : .8)}, tamb); if(double) caisse(t + k * .4 + .2, g * .3); } }
  function grince(t, d, g, n){ trem(A, t, m(n || 74), d, g, proche, {env:[[0, 0], [.25, .8], [d * .8, 1], [d, 0]], lp:2200}); trem(A, t, m((n || 74) + 1), d, g * .8, proche, {env:[[0, 0], [.25, .8], [d * .8, 1], [d, 0]], lp:2200}); }
  a(I, 24.7, function(t){                                                                             /* PFFFT : la fumée rouge */
    frappe(A, t, .55, tamb);
    coup(t, [38, 39, 44], 2.2, .055);
    A.choeur(t, [m(62), m(63), m(68)], 2.2, {voyelle:'a', a:.06, r:1.6, g:.03}, loin);
    fond(A, t, [m(26), m(33)], 13.6, .036, proche, {a:.3, r:.6});
    galop(t + .8, 3.3, .03); cogne(t + .8, 3.3, .2);
    grince(t + .8, 3.3, .012);
  });
  a(I, 28.8, function(t){                                                                             /* les villageois pétrifiés */
    coup(t, [38, 44, 51], 1.8, .05); A.tambour(t, {f:52, d:1.3, g:.4}, tamb);
    galop(t + .4, 4.6, .026); cogne(t + .4, 4.6, .15);
    grince(t + .2, 4.8, .013, 75);
    A.choeur(t + 2.4, [m(57), m(63)], 2.6, {voyelle:'o', a:.6, r:1.2, g:.018}, loin);
  });
  a(I, 33.8, function(t){                                                                             /* le maire accourt : plus vite, plus fort */
    coup(t, [38, 45], 1.2, .045);
    galop(t, 4.4, .034); galop(t, 4.4, .02, 12); cogne(t, 4.4, .22, true);
    grince(t, 4.4, .014, 74);
    [[.4, 50], [1.2, 51], [2.0, 53], [2.8, 56], [3.6, 57]].forEach(function(n){ cor(t + n[0], n[1], .7, .034); });      /* les cors montent avec lui */
    montee(A, t + 3.4, 1.0, .22, loin);
  });
  a(I, 38.2, function(t){                                                                             /* Silas et le maire parlent : la musique se fait petite (on lit) */
    coup(t, [38, 39, 44], 1.6, .045); A.tambour(t, {f:52, d:1.2, g:.36}, tamb);
    fond(A, t, [m(26), m(33)], 16.8, .03, proche, {a:.4, r:.8});
    galop(t + .4, 16.2, .017);
    for(var k = 0; k < 20; k++) sourd(A, t + .4 + k * .8, .11, tamb);                                   /* le cœur */
    trem(A, t + .4, m(69), 6.6, .009, proche, {env:[[0, 0], [1, 1], [6, 1], [6.6, 0]]});
    trem(A, t + 7, m(70), 6.8, .01, proche, {env:[[0, 0], [1, 1], [6.2, 1], [6.8, 0]]});
    A.choeur(t + 11, [m(50), m(56)], 2.9, {voyelle:'ou', a:.8, r:1.2, g:.02}, loin);                   /* « La zone est condamnée. » : froid */
    cuivre(A, t + 11, m(38), 2.6, .03, proche);
  });
  a(I, 52.0, function(t){ coup(t, [38, 45, 50], 1.4, .045); A.tambour(t, {f:54, d:1.1, g:.34}, tamb); });        /* « Rentrez chez vous ! » */
  a(I, 54.8, function(t){                                                                             /* tout le monde s'enfuit */
    coup(t, [38, 39, 44], 1.4, .05);
    galop(t, 3.2, .034); galop(t, 3.2, .022, 12); cogne(t, 3.2, .24, true);
    grince(t, 3.2, .015, 75);
    montee(A, t + 2.1, 1.2, .3, loin);
    frappe(A, t + 3.38, .4, tamb);
  });
  /* ---------------- LES YEUX DANS L'OMBRE ---------------- */
  a(I, 58.2, function(t){
    fond(A, t, [m(26), m(33)], 3.6, .04, proche, {a:.3, r:1.6});
    A.choeur(t + .2, [m(50), m(56)], 3.2, {voyelle:'ou', a:.6, r:1.8, g:.022}, loin);
    [[.5, 62], [.95, 65], [1.4, 68], [1.85, 69]].forEach(function(n){ A.harpe(t + n[0], m(n[1]), {t60:2.2, g:.085, lp:2200}, ech); });   /* son motif : c'est lui */
    [.4, 1.5, 2.6].forEach(function(x){ sourd(A, t + x, .13, tamb); });
    A.tambour(t + 2.75, {f:48, d:1.2, g:.26}, tamb);
  });
  return I;
};
})(window);
