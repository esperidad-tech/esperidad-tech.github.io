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
  /* (le gant et la bague : coupés du film le 19 novembre, avec leur ritournelle ; tout ce qui suit arrive 3,3 secondes plus tôt) */
  a(I, 14.9, function(t){                                                                           /* « Vous êtes allés trop loin… » */
    [m(38), m(41), m(44)].forEach(function(f){ cuivre(A, t, f, 3.4, .03, proche); });
    A.choeur(t + .2, [m(50), m(53), m(56)], 3.3, {voyelle:'o', a:1, r:1.2, g:.02}, loin);
  });
  a(I, 18.5, function(t){                                                                           /* « Monsieur le maire… ? » : ça monte */
    [m(50), m(51), m(56)].forEach(function(f){ trem(A, t, f, 2.2, .014, proche, {f2:f * 1.19, vit:13, env:[[0, 0], [2, 1], [2.2, 0]]}); });
    montee(A, t + 1.2, 1.0, .3, loin);
  });
  a(I, 20.7, function(t){                                                                           /* « Gardes ! Attrapez-les ! » */
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

/* =================== LA PUB DE 30 SECONDES (jeu/pub ; Romain, 16 novembre : « une musique un peu fun, vraiment bien travaillée […] bien rythmé ») ===================
   120 à la minute : UN TEMPS = 0,5 s, UNE MESURE = 2 s ; le montage coupe sur les temps (jeu/pub/pub.js).
     mesures 1-2   (0 → 4 s)     la table : un ukulélé égrené, des claquements de doigts, puis le roulement et la montée (la plongée dans la tablette)
     mesures 3-7   (4 → 14 s)    LE REFRAIN (do, sol, la mineur, fa, do) : le marimba, le ukulélé à contretemps, la basse qui rebondit, les mains
     mesures 8-9   (14 → 18 s)   le mystère (la mineur, mi) : à mi-vitesse, le motif de l'homme en cape à la harpe, les cordes qui tremblent
     mesures 10-11 (18 → 22 s)   le donjon (la mineur, sol) : la grosse caisse sur tous les temps, la basse au galop, les cuivres
     mesure 12     (22 → 24 s)   la rafale : quatre « hé ! » sur les quatre mots, le roulement, la gamme qui grimpe
     mesure 13     (24 → 26 s)   la fête : le refrain une octave au-dessus, sifflé
     mesures 14-15 (26 → fin)    le titre : le grand accord, quatre notes qui montent, et « ta-dam » */
M.cineMusPubA = function(A, P){
  var I = Instance(A, P), G = 1.0, sec = A.bus(P, {grotte:.05, g:G}), tamb = A.bus(P, {grotte:.09, g:G * .72}), loin = A.bus(P, {grotte:.3, g:G * .85}), ech = I.echo(loin, {temps:.375, retour:.35, lp:2600, sortie:.4});
  function kick(t, g){ A.tambour(t, {f:58, d:.22, g:(g || 1) * .34}, tamb); }
  function clap(t, g){ g = (g || 1) * .1; [0, .011, .024].forEach(function(x, k){ A.bruit(t + x, {coul:'blanc', filtres:[{type:'bandpass', f:1500 + k * 320, q:.9}], env:A.perc(.001, .08 + k * .025), g:g}, tamb); }); }
  function chat(t, g){ A.bruit(t, {coul:'blanc', hp:7200, env:A.perc(.001, .032), g:(g || 1) * .03}, tamb); }
  function caisse(t, g){ A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:1900, q:.7}], env:A.perc(.002, .1), g:g}, tamb); A.ton(t, {f:190, f2:140, gl:.08, env:A.perc(.002, .08), g:g * .5}, tamb); }
  function mar(t, n, g){ var f = m(n); g = g || 1; A.ton(t, {type:'sine', f:f, env:A.perc(.002, .34), g:g * .12}, sec); A.ton(t, {type:'sine', f:f * 4, env:A.perc(.001, .06), g:g * .022}, sec); A.ton(t, {type:'triangle', f:f * 2, env:A.perc(.002, .13), g:g * .014}, sec); }
  function uke(t, notes, g, long){ notes.forEach(function(n, k){ A.harpe(t + k * .013, m(n), {t60:long || .5, g:(g || 1) * .06, lp:3400}, sec); }); }
  function basse(t, n, d, g){ g = g || 1; A.ton(t, {type:'triangle', f:m(n), env:[[0, 0], [.008, 1], [d * .5, .6], [d, 0]], g:g * .15, filtres:[{type:'lowpass', f:650}]}, sec); A.ton(t, {type:'sine', f:m(n), env:[[0, 0], [.008, 1], [d, 0]], g:g * .09}, sec); }
  function siffle(t, n, g){ var f = m(n); A.ton(t, {type:'sine', f:f * .98, f2:f, gl:.05, env:[[0, 0], [.03, 1], [.16, .8], [.24, 0]], g:(g || 1) * .034, vib:[6, f * .012], vibRetard:.07}, loin); }
  function hey(t, g){ A.choeur(t, [m(72), m(76), m(79)], .3, {voyelle:'a', a:.015, r:.2, g:(g || 1) * .034}, loin); }
  var ACC = {C:[60, 64, 67, 72], G:[59, 62, 67, 74], Am:[57, 60, 64, 69], F:[57, 60, 65, 72], E:[56, 59, 64, 68]}, BAS = {C:36, G:31, Am:33, F:29, E:28};
  function mesure(t, acc, o){                                     /* une mesure du refrain : grosse caisse, mains, charleston, ukulélé à contretemps, basse */
    o = o || {};
    for(var b = 0; b < 4; b++){
      var tb = t + b * .5;
      if(o.quatre || b % 2 === 0) kick(tb, o.k);
      if(o.mains || b % 2 === 1) clap(tb, o.c);
      chat(tb, .7); chat(tb + .25, 1.25); if(o.double){ chat(tb + .125, .6); chat(tb + .375, .6); }
      if(!o.sansUke) uke(tb + .25, ACC[acc], o.u);
      if(o.galop){ basse(tb, BAS[acc], .2, 1); basse(tb + .25, BAS[acc], .14, .75); basse(tb + .375, BAS[acc] + 12, .1, .7); }
      else { basse(tb, BAS[acc], .22, 1); basse(tb + .25, BAS[acc] + 12, .16, .7); }
    }
  }
  function air(t, notes, g, joue){ notes.forEach(function(n, k){ if(n) (joue || mar)(t + k * .25, n, g); }); }

  /* --- la table (0 → 4 s) --- */
  a(I, 0, function(t){
    [60, 64, 67, 72, 67, 64, 60, 64].forEach(function(n, k){ A.harpe(t + .02 + k * .25, m(n), {t60:.9, g:.1, lp:3000}, sec); chat(t + k * .25, k % 2 ? 1.2 : .7); });
    kick(t, .6); kick(t + 1, .6); basse(t, 36, .5, .9); clap(t + .5, .55); clap(t + 1.5, .55); mar(t + .5, 84, .6); mar(t + 1.5, 86, .6);
  });
  a(I, 2, function(t){
    [59, 62, 67, 74, 67, 62, 59, 62].forEach(function(n, k){ A.harpe(t + k * .25, m(n), {t60:.9, g:.1, lp:3000}, sec); chat(t + k * .25, k % 2 ? 1.2 : .7); });
    basse(t, 31, .5, .9); clap(t + .5, .6); mar(t + .5, 88, .6); kick(t, .7); kick(t + .5, .7);
    for(var k = 0; k < 8; k++) caisse(t + 1 + k * .125, .025 + k * .012);                                /* le roulement */
    kick(t + 1, .8); kick(t + 1.5, .9); kick(t + 1.75, 1);
    montee(A, t + .8, 1.2, .3, loin);
    [72, 74, 76, 77, 79, 81, 83, 84].forEach(function(n, k){ mar(t + 1 + k * .125, n, .45 + k * .06); });   /* la gamme : on plonge */
  });
  /* --- LE REFRAIN (4 → 14 s) --- */
  a(I, 4, function(t){ frappe(A, t, .26, tamb); hey(t, 1.1); mesure(t, 'C'); air(t, [76, 76, 79, 76, 72, 0, 76, 79]); uke(t, ACC.C, 1.3, 1.4); });
  a(I, 6, function(t){ mesure(t, 'G'); air(t, [74, 74, 79, 74, 71, 0, 74, 79]); });
  a(I, 8, function(t){ mesure(t, 'Am'); air(t, [72, 72, 76, 72, 69, 0, 72, 76]); air(t, [84, 0, 0, 0, 81, 0, 0, 0], .5, siffle); });
  a(I, 10, function(t){ mesure(t, 'F', {double:1}); air(t, [69, 72, 77, 81, 79, 77, 76, 74]); air(t, [81, 0, 0, 0, 79, 0, 76, 74], .8, siffle); });
  a(I, 12, function(t){
    mesure(t, 'C', {double:1}); air(t, [72, 76, 79, 84, 83, 79, 74, 0]); air(t, [84, 0, 0, 0, 83, 0, 0, 0], .8, siffle);
    [[1.5, 130], [1.625, 130], [1.75, 105], [1.875, 84]].forEach(function(x){ A.tambour(t + x[0], {f:x[1], d:.2, g:.26}, tamb); });   /* la descente de toms : on change de monde */
  });
  /* --- LE MYSTÈRE (14 → 18 s) : à mi-vitesse --- */
  a(I, 14, function(t){
    frappe(A, t, .2, tamb); fond(A, t, [m(33), m(45)], 4, .026, sec, {a:.2, r:.5});
    trem(A, t + .1, m(69), 3.9, .011, sec, {env:[[0, 0], [.4, .7], [3.3, 1], [3.9, 0]]}); trem(A, t + .1, m(64), 3.9, .011, sec, {env:[[0, 0], [.4, .7], [3.3, 1], [3.9, 0]]});
    for(var k = 0; k < 16; k++) chat(t + k * .25, k % 2 ? .9 : .5);
    [0, 2].forEach(function(x){ kick(t + x, 1); A.tambour(t + x + 1, {f:92, d:.4, g:.24}, tamb); clap(t + x + 1, .7); kick(t + x + 1.75, .7); });
    [[.5, 69], [1, 72], [1.5, 75], [2, 76]].forEach(function(n){ A.harpe(t + n[0], m(n[1]), {t60:1.6, g:.085, lp:2600}, ech); });        /* son motif (celui de l'entrée du donjon) */
    [[2.5, 81], [2.75, 84], [3, 87], [3.25, 88]].forEach(function(n){ A.harpe(t + n[0], m(n[1]), {t60:1.2, g:.06, lp:3000}, ech); });
    basse(t, 33, .9, 1); basse(t + 2, 28, .9, 1);
    cuivre(A, t + 2, m(40), 2, .045, sec); cuivre(A, t + 2, m(47), 2, .035, sec);
    for(var q = 0; q < 8; q++) caisse(t + 3 + q * .125, .02 + q * .011);
    montee(A, t + 2.9, 1.1, .26, loin);
  });
  /* --- LE DONJON (18 → 22 s) --- */
  function coup(t, notes, g){ notes.forEach(function(n){ cuivre(A, t, m(n), .45, g, sec); }); }
  a(I, 18, function(t){ frappe(A, t, .28, tamb); mesure(t, 'Am', {quatre:1, galop:1, double:1, u:.8}); air(t, [69, 72, 76, 72, 69, 72, 76, 81]); coup(t, [45, 52, 57], .05); coup(t + .75, [45, 52, 57], .04); coup(t + 1.5, [48, 52, 57], .04); });
  a(I, 20, function(t){ mesure(t, 'G', {quatre:1, galop:1, double:1, u:.8}); air(t, [67, 71, 74, 71, 67, 71, 74, 79]); coup(t, [43, 50, 55], .05); coup(t + .75, [43, 50, 55], .04); coup(t + 1.5, [47, 50, 55], .04); });
  /* --- LA RAFALE (22 → 24 s) : quatre mots, quatre « hé ! » --- */
  a(I, 22, function(t){
    ['F', 'F', 'G', 'G'].forEach(function(c, b){ var tb = t + b * .5; hey(tb, 1.15); kick(tb, 1); kick(tb + .25, .8); clap(tb, 1); uke(tb, ACC[c], 1.3, .6); basse(tb, BAS[c], .22, 1); basse(tb + .25, BAS[c] + 12, .16, .8); });
    for(var k = 0; k < 16; k++) caisse(t + k * .125, .018 + k * .008);
    [72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91].forEach(function(n, k){ mar(t + .5 + k * .125, n, .5 + k * .04); });
    montee(A, t + .8, 1.2, .3, loin);
  });
  /* --- LA FÊTE (24 → 26 s) --- */
  a(I, 24, function(t){ frappe(A, t, .26, tamb); mesure(t, 'C', {quatre:1, mains:1, double:1}); air(t, [88, 88, 91, 88, 84, 0, 88, 91]); air(t, [88, 0, 91, 0, 84, 0, 88, 91], .9, siffle); hey(t + 1, 1.1); hey(t + 1.5, 1.1); });
  /* --- LE TITRE (26 → fin) --- */
  a(I, 26, function(t){
    frappe(A, t, .34, tamb); kick(t, 1.2); clap(t, 1.1);
    uke(t, [48, 55, 60, 64, 67, 72], 1.5, 2.6); [36, 43, 48, 52].forEach(function(n){ cuivre(A, t, m(n), 1.7, .04, sec); });
    A.choeur(t, [m(72), m(76), m(79)], 1.6, {voyelle:'a', a:.03, r:1, g:.03}, loin); basse(t, 36, 1.4, 1.1);
    [[.5, 72], [.75, 76], [1, 79], [1.25, 84]].forEach(function(n){ mar(t + n[0], n[1], 1); siffle(t + n[0], n[1] + 12, .8); });
    chat(t + .5, 1); chat(t + .75, 1); chat(t + 1, 1); chat(t + 1.25, 1); clap(t + 1.5, .8);
    /* « ta-dam » */
    kick(t + 2, 1.1); clap(t + 2, 1); uke(t + 2, ACC.G, 1.5, .5); basse(t + 2, 31, .3, 1.1); [43, 50, 55].forEach(function(n){ cuivre(A, t + 2, m(n), .4, .04, sec); });
    kick(t + 2.5, 1.3); clap(t + 2.5, 1.1); uke(t + 2.5, [48, 55, 60, 64, 67, 72], 1.6, 2.2); basse(t + 2.5, 36, 1.1, 1.2); [36, 48, 52, 55].forEach(function(n){ cuivre(A, t + 2.5, m(n), 1.1, .045, sec); });
    A.ton(t + 2.5, {type:'sine', f:m(96), env:A.perc(.002, 1.2), g:.03}, loin); A.ton(t + 2.5, {type:'sine', f:m(84), env:A.perc(.002, 1.2), g:.04}, loin); hey(t + 2.5, 1.2);
  });
  return I;
};

/* =================== LES DEUX DESCENTES, REFAITES EN 2D (18 novembre ; jeu/cine/src/film-descente*.js ; Bible §13.68) ===================
   Romain : « une musique un peu mystérieuse, inquiétante, mais aussi un petit peu rythmée ». En ré mineur : un petit moteur de cordes
   pincées (ré – la – ré – la – fa – la – ré – la), à 100 à la minute, qui part et s'arrête avec les héros ; un battement sourd ; un air
   de quatre notes au célesta, dont la dernière sonne faux exprès (sol dièse, do dièse) ; des cordes qui tremblent quand ça se tend ;
   un chœur dans la grande salle ; trois cloches de verre pour la pierre de rune ; et le moteur qui repart, plus décidé, sur « Allons-y ».
   o = les instants du film (jeu/cine/src/film-descente-3.js : assembler) ; la même fin pour les deux (o.fin : le plan « regard »). */
function descente(o){
  return function(A, P){
    var I = Instance(A, P), proche = A.bus(P, {grotte:.35, g:1.6}), tamb = A.bus(P, {grotte:.7, g:1.45}), loin = A.bus(P, {grotte:1, g:1.1}), ech = I.echo(loin, {temps:.45, retour:.42, lp:2400, sortie:.5});
    var CR = .3, MOTIF = [38, 45, 50, 45, 41, 45, 50, 45], MOTIF2 = [38, 45, 50, 45, 43, 46, 50, 46];
    /* le moteur : des cordes pincées, graves ; t0 → t1 ; f : sa force ; v : 2 = la deuxième mesure monte (plus décidé) */
    function moteur(t, t0, t1, f, v){
      for(var k = 0, x = t0; x < t1 - .05; k++, x += CR){
        var mo = v === 2 && Math.floor(k / 8) % 2 ? MOTIF2 : MOTIF, n = mo[k % 8], dq = U_inv(t0, t0 + 1.2, x) * (1 - U_inv(t1 - 1.2, t1, x) * .6);
        A.harpe(t + x, m(n), {t60:.9, g:.085 * f * dq * (k % 4 === 0 ? 1.25 : k % 2 ? .7 : 1), lp:1500}, proche);
        if(k % 8 === 0) sourd(A, t + x, .13 * f * dq, tamb);
        if(k % 8 === 4) sourd(A, t + x, .07 * f * dq, tamb);
        if(v === 2 && k % 2 === 0) A.bruit(t + x, {coul:'blanc', hp:5200, env:A.perc(.002, .05), g:.012 * f * dq}, proche);
      }
    }
    /* l'air du mystère : quatre notes, la dernière fausse ; puis sa réponse */
    function air(t, x, g, rep){ (rep ? [[0, 76], [.6, 77], [1.2, 74], [1.8, 73]] : [[0, 74], [.6, 77], [1.2, 81], [1.8, 80]]).forEach(function(n){ A.harpe(t + x + n[0], m(n[1]), {t60:2.2, g:g, lp:3200}, ech); A.ton(t + x + n[0], {type:'sine', f:m(n[1] + 12), env:A.perc(.004, .9), g:g * .22}, ech); }); }
    function tension(t, x, d, g){ trem(A, t + x, m(57), d, g, proche, {env:[[0, 0], [d * .75, 1], [d, 0]]}); trem(A, t + x, m(58), d, g * .8, proche, {env:[[0, 0], [d * .75, 1], [d, 0]]}); }
    a(I, 0, function(t){
      /* le fond : le ré tout en bas, tout le long, et l'air de la nuit ou du souterrain */
      fond(A, t, [m(26), m(33)], o.duree, .026, proche, {a:2.5, r:2.5});
      A.bruit(t, {coul:'brun', bp:220, bq:.8, env:[[0, 0], [3, 1], [o.duree - 2, .8], [o.duree, 0]], g:.035}, loin);
      o.debut(t, {A:A, moteur:moteur, air:air, tension:tension, proche:proche, tamb:tamb, loin:loin, ech:ech});
      /* LA FIN COMMUNE (f : le Pisteur regarde à ses pieds) */
      var f = o.fin;
      A.harpe(t + f + 1.3, m(62), {t60:2.6, g:.06, lp:2400}, ech); A.harpe(t + f + 2.0, m(61), {t60:2.6, g:.05, lp:2400}, ech);          /* il baisse les yeux : deux notes qui descendent */
      /* le carnet dans le noir : presque rien ; puis la torche l'éclaire — l'air, en clair, et un accord chaud */
      sourd(A, t + f + 3.6, .1, tamb); sourd(A, t + f + 4.75, .08, tamb);
      tension(t, f + 4.0, 2.1, .008);
      air(t, f + 6.1, .06, 0);
      A.choeur(t + f + 6.0, [m(50), m(57), m(62)], 3.4, {voyelle:'o', a:1.2, r:1.6, g:.016}, loin);
      /* la pierre de rune : trois cloches de verre, un chœur plus haut */
      var r = f + 8.4;
      [[0, 86], [.5, 81], [1.0, 89], [1.9, 86], [2.5, 93]].forEach(function(n){ A.cloche(t + r + n[0], m(n[1]), {d:2.6, rapport:3.5, indice:.5, g:.02}, ech); });
      A.choeur(t + r + .2, [m(62), m(69), m(74)], 4.2, {voyelle:'ou', a:1.4, r:1.8, g:.014}, loin);
      /* le Sage se demande ce que c'est : l'air, sa réponse */
      air(t, r + 4.3, .05, 1);
      tension(t, r + 6.0, 2.3, .009);
      /* « Allons-y. Odette doit être par là. » : le moteur repart, plus décidé ; un cuivre qui monte ; un dernier coup, au noir */
      var al = f + 16.6;
      moteur(t, al + .3, al + 4.9, 1.15, 2);
      [[.9, 38, 1.4], [2.1, 41, 1.3], [3.3, 45, 1.7]].forEach(function(n){ cuivre(A, t + al + n[0], m(n[1]), n[2], .034, proche); cuivre(A, t + al + n[0], m(n[1] + 12), n[2], .016, loin); });
      air(t, al + 1.5, .045, 0);
      montee(A, t + al + 3.7, 1.1, .1, loin);
      frappe(A, t + al + 4.85, .3, tamb);
      A.choeur(t + al + 3.4, [m(50), m(57), m(62), m(65)], 2.4, {voyelle:'a', a:.9, r:1, g:.016}, loin);
    });
    return I;
  };
}
function A_(K){ return K.A; }
function U_inv(a, b, v){ return b === a ? 0 : Math.max(0, Math.min(1, (v - a) / (b - a))); }
/* LE PUITS (49,8 s) : la clairière 0 → 7 ; la margelle 7 → 11,6 (la torche lâchée à 8,9) ; la corde 11,6 → 15 ; le conduit 15 → 20,6 ;
   le fond du puits 20,6 → 28 (il se pose à 23,2, les bêtes détalent ; il relève la torche à 25) ; la fin commune à 28 */
M.cineMusPuitsA = descente({duree:49.8, fin:28, debut:function(t, K){
  K.moteur(t, .4, 5.6, .8);                                                         /* ils marchent vers le puits */
  K.air(t, 2.6, .05, 0);
  K.tension(t, 7.2, 1.8, .009);                                                     /* il se penche sur le noir */
  montee(A_(K), t + 8.2, .8, .07, K.loin);
  sourd(A_(K), t + 10.35, .2, K.tamb);                                              /* la torche touche le fond, très loin */
  K.air(t, 9.5, .04, 1);
  K.moteur(t, 11.9, 20.2, .7);                                                      /* la corde : le moteur, tout doux, jusqu'en bas */
  [15.4, 17.8].forEach(function(x){ A_(K).harpe(t + x, m(69), {t60:2.4, g:.04, lp:2600}, K.ech); A_(K).harpe(t + x + .6, m(68), {t60:2.4, g:.035, lp:2600}, K.ech); });
  K.tension(t, 21.2, 2.2, .01);                                                     /* le fond : ça se tend jusqu'à ce qu'il se pose */
  frappe(A_(K), t + 23.25, .16, K.tamb);
  A_(K).choeur(t + 23.4, [m(50), m(53), m(57)], 4.4, {voyelle:'ou', a:1, r:2, g:.016}, K.loin);
  K.air(t, 25.2, .055, 0);                                                          /* la torche se lève : la salle apparaît */
}});
/* LA CRYPTE (52 s) : la clé 0 → 6,8 (elle tourne à 2,1 ; la porte s'ouvre à 3,7) ; l'escalier 6,8 → 13 ; le couloir aux arches 13 → 22 ;
   les niches 22 → 25,6 ; la salle 25,6 → 30,2 ; la fin commune à 30,2 */
M.cineMusEscalierA = descente({duree:52, fin:30.2, debut:function(t, K){
  K.tension(t, .3, 1.9, .008);                                                      /* la clé */
  sourd(A_(K), t + 2.5, .16, K.tamb);
  K.air(t, 3.9, .05, 0);                                                            /* la porte s'ouvre sur le noir */
  montee(A_(K), t + 5.6, 1.1, .07, K.loin);
  K.moteur(t, 7.0, 12.8, .75);                                                      /* l'escalier */
  K.air(t, 9.4, .04, 1);
  K.moteur(t, 13.1, 25.4, .9);                                                      /* le couloir aux arches, les niches : le moteur ne s'arrête pas */
  [14.8, 19.6].forEach(function(x){ K.air(t, x, .045, x > 16 ? 1 : 0); });
  K.tension(t, 22.1, 3.3, .011);                                                    /* les crânes ; les yeux dans le trou */
  A_(K).choeur(t + 22.2, [m(50), m(56)], 3.2, {voyelle:'a', a:1, r:1.4, g:.014}, K.loin);
  frappe(A_(K), t + 25.6, .14, K.tamb);                                             /* la salle */
  A_(K).choeur(t + 25.8, [m(50), m(53), m(57)], 4, {voyelle:'ou', a:1, r:2, g:.016}, K.loin);
  K.air(t, 27.4, .05, 0);
}});
/* =================== LES QUATRE FILMS DES HÉROS (jeu/pub/heros.js ; Romain, 17 novembre : « un peu le même style avec le même rythme » que la pub) ===================
   La même musique de fête que la pub (120 à la minute, un temps = 0,5 s, les mêmes instruments), mais UN AIR PAR HÉROS, dans son ton, joué par
   son instrument : le Pisteur siffle et court (do), l'Alchimiste fait des bulles au marimba (ré), le Barde chante au luth (fa), le Sage égrène
   sa harpe et sa cloche (la). Le même découpage pour les quatre, celui du montage :
     mesure 1      (0 → 2 s)     le héros arrive : un grand coup, son nom (0,5 s), sa devise (1 s)
     mesure 2      (2 → 4 s)     chez lui : l'accord égrené, le roulement, la gamme qui monte
     mesures 3-7   (4 → 14 s)    LE REFRAIN (do, sol, la mineur, fa, do, dans le ton du héros) : son air
     mesures 8-9   (14 → 18 s)   le pont, à mi-vitesse : son instrument tout seul sur une nappe, puis le roulement
     mesures 10-11 (18 → 22 s)   la nuit (la mineur, sol) : la grosse caisse sur tous les temps, la basse au galop, les cuivres — pour le Barde, la fête
     mesure 12     (22 → 24 s)   la rafale : quatre « hé ! » sur les quatre mots
     mesure 13     (24 → 26 s)   l'équipe : le refrain une octave au-dessus
     mesures 14-15 (26 → fin)    « Joue le… ! » : le grand accord, quatre notes qui montent, et « ta-dam » */
function musiqueHeros(o){
  return function(A, P){
    var I = Instance(A, P), G = 1.0, TR = o.tr || 0, sec = A.bus(P, {grotte:.05, g:G}), tamb = A.bus(P, {grotte:.09, g:G * .72}), loin = A.bus(P, {grotte:.3, g:G * .85}), ech = I.echo(loin, {temps:.375, retour:.35, lp:2600, sortie:.4});
    function n_(n){ return m(n + TR); }
    function kick(t, g){ A.tambour(t, {f:58, d:.22, g:(g || 1) * .34}, tamb); }
    function clap(t, g){ g = (g || 1) * .1; [0, .011, .024].forEach(function(x, k){ A.bruit(t + x, {coul:'blanc', filtres:[{type:'bandpass', f:1500 + k * 320, q:.9}], env:A.perc(.001, .08 + k * .025), g:g}, tamb); }); }
    function chat(t, g){ A.bruit(t, {coul:'blanc', hp:7200, env:A.perc(.001, .032), g:(g || 1) * .03}, tamb); }
    function caisse(t, g){ A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:1900, q:.7}], env:A.perc(.002, .1), g:g}, tamb); A.ton(t, {f:190, f2:140, gl:.08, env:A.perc(.002, .08), g:g * .5}, tamb); }
    function mar(t, n, g){ var f = n_(n); g = g || 1; A.ton(t, {type:'sine', f:f, env:A.perc(.002, .34), g:g * .12}, sec); A.ton(t, {type:'sine', f:f * 4, env:A.perc(.001, .06), g:g * .022}, sec); A.ton(t, {type:'triangle', f:f * 2, env:A.perc(.002, .13), g:g * .014}, sec); }
    function uke(t, notes, g, long){ notes.forEach(function(n, k){ A.harpe(t + k * .013, n_(n), {t60:long || .5, g:(g || 1) * .06, lp:3400}, sec); }); }
    function basse(t, n, d, g){ g = g || 1; A.ton(t, {type:'triangle', f:n_(n), env:[[0, 0], [.008, 1], [d * .5, .6], [d, 0]], g:g * .15, filtres:[{type:'lowpass', f:650}]}, sec); A.ton(t, {type:'sine', f:n_(n), env:[[0, 0], [.008, 1], [d, 0]], g:g * .09}, sec); }
    function siffle(t, n, g){ var f = n_(n); A.ton(t, {type:'sine', f:f * .98, f2:f, gl:.05, env:[[0, 0], [.03, 1], [.16, .8], [.24, 0]], g:(g || 1) * .034, vib:[6, f * .012], vibRetard:.07}, loin); }
    function hey(t, g){ A.choeur(t, [n_(72), n_(76), n_(79)], .3, {voyelle:'a', a:.015, r:.2, g:(g || 1) * .034}, loin); }
    /* les instruments des héros */
    function luth(t, n, g){ g = g || 1; A.harpe(t, n_(n), {t60:.7, g:g * .11, lp:3000}, sec); A.harpe(t + .008, n_(n - 12), {t60:.5, g:g * .05, lp:1800}, sec); }                        /* le luth du Barde : la note et son octave grave */
    function harpe(t, n, g){ A.harpe(t, n_(n), {t60:1.5, g:(g || 1) * .1, lp:3600}, ech); }                                                                                          /* la harpe du Sage, avec son écho */
    function cloche(t, n, g){ var f = n_(n); g = (g || 1) * .03; A.ton(t, {type:'sine', f:f, env:A.perc(.002, 1.1), g:g}, loin); A.ton(t, {type:'sine', f:f * 2.76, env:A.perc(.002, .5), g:g * .35}, loin); A.ton(t, {type:'sine', f:f * 5.4, env:A.perc(.001, .2), g:g * .16}, loin); }
    function bulle(t, n, g){ var f = n_(n); A.ton(t, {type:'sine', f:f * .7, f2:f * 1.5, gl:.09, env:A.perc(.004, .12), g:(g || 1) * .05}, loin); }                                    /* une bulle du chaudron : « bloup » */
    function pizz(t, n, g){ A.harpe(t, n_(n), {t60:.28, g:(g || 1) * .1, lp:2400}, sec); }                                                                                           /* une corde pincée, sèche : les pas du Pisteur */
    var ACC = {C:[60, 64, 67, 72], G:[59, 62, 67, 74], Am:[57, 60, 64, 69], F:[57, 60, 65, 72]}, BAS = {C:36, G:31, Am:33, F:29};
    function mesure(t, acc, q){                                     /* une mesure du refrain : grosse caisse, mains, charleston, ukulélé à contretemps, basse */
      q = q || {};
      for(var b = 0; b < 4; b++){
        var tb = t + b * .5;
        if(q.quatre || b % 2 === 0) kick(tb, q.k);
        if(q.mains || b % 2 === 1) clap(tb, q.c);
        chat(tb, .7); chat(tb + .25, 1.25); if(q.double){ chat(tb + .125, .6); chat(tb + .375, .6); }
        if(!q.sansUke) uke(tb + .25, ACC[acc], q.u);
        if(q.galop){ basse(tb, BAS[acc], .2, 1); basse(tb + .25, BAS[acc], .14, .75); basse(tb + .375, BAS[acc] + 12, .1, .7); }
        else { basse(tb, BAS[acc], .22, 1); basse(tb + .25, BAS[acc] + 12, .16, .7); }
      }
    }
    var JOUE = {mar:mar, siffle:siffle, luth:luth, harpe:harpe, cloche:cloche, bulle:bulle, pizz:pizz};
    function air(t, notes, g, joue, oct){ notes.forEach(function(n, k){ if(n) JOUE[joue || o.voix](t + k * .25, n + (oct || 0), g); }); }
    function doubleAir(t, notes, g){ air(t, notes, g); if(o.voix2) air(t, notes.map(function(n, k){ return o.rare && k % 2 ? 0 : n; }), (g || 1) * (o.g2 || .7), o.voix2, o.oct2 == null ? 12 : o.oct2); }

    /* --- le héros arrive (0 → 2 s) --- */
    a(I, 0, function(t){
      frappe(A, t, .26, tamb); kick(t, 1); basse(t, BAS.C, .5, 1);
      hey(t + .5, 1.1); uke(t + .5, [48, 55, 60, 64, 67, 72], 1.4, 1.6); kick(t + .5, 1); clap(t + .5, .9);                                  /* son nom */
      kick(t + 1, .9); clap(t + 1, .8); air(t + 1, [84, 88, 91], .9, o.voix2 || o.voix); basse(t + 1, BAS.G, .4, .9);                       /* sa devise */
      [0, .25, .5, .75].forEach(function(x, k){ chat(t + 1 + x, k % 2 ? 1.2 : .7); }); kick(t + 1.5, .8); clap(t + 1.75, .6); air(t + 1.5, [79, 76], .7);
    });
    /* --- chez lui (2 → 4 s) --- */
    a(I, 2, function(t){
      [59, 62, 67, 74, 67, 62, 59, 62].forEach(function(n, k){ A.harpe(t + k * .25, n_(n), {t60:.9, g:.1, lp:3000}, sec); chat(t + k * .25, k % 2 ? 1.2 : .7); });
      basse(t, BAS.G, .5, .9); clap(t + .5, .6); kick(t, .7); kick(t + .5, .7); air(t, [0, 0, 86, 0], .6);
      for(var k = 0; k < 8; k++) caisse(t + 1 + k * .125, .025 + k * .012);                                /* le roulement */
      kick(t + 1, .8); kick(t + 1.5, .9); kick(t + 1.75, 1);
      montee(A, t + .8, 1.2, .3, loin);
      [72, 74, 76, 77, 79, 81, 83, 84].forEach(function(n, k){ mar(t + 1 + k * .125, n, .45 + k * .06); });   /* la gamme : c'est parti */
    });
    /* --- LE REFRAIN (4 → 14 s) : l'air du héros --- */
    a(I, 4, function(t){ frappe(A, t, .26, tamb); hey(t, 1.1); mesure(t, 'C', o.batt); doubleAir(t, o.air[0]); uke(t, ACC.C, 1.3, 1.4); });
    a(I, 6, function(t){ mesure(t, 'G', o.batt); doubleAir(t, o.air[1]); });
    a(I, 8, function(t){ mesure(t, 'Am', o.batt); doubleAir(t, o.air[2]); });
    a(I, 10, function(t){ var q = {double:1}; if(o.batt) Object.keys(o.batt).forEach(function(k){ q[k] = o.batt[k]; }); mesure(t, 'F', q); doubleAir(t, o.air[3]); });
    a(I, 12, function(t){
      var q = {double:1}; if(o.batt) Object.keys(o.batt).forEach(function(k){ q[k] = o.batt[k]; }); mesure(t, 'C', q); doubleAir(t, o.air[4]);
      [[1.5, 130], [1.625, 130], [1.75, 105], [1.875, 84]].forEach(function(x){ A.tambour(t + x[0], {f:x[1], d:.2, g:.26}, tamb); });   /* la descente de toms */
    });
    /* --- LE PONT (14 → 18 s), à mi-vitesse : l'instrument du héros, presque seul --- */
    a(I, 14, function(t){
      frappe(A, t, .18, tamb);
      A.choeur(t, [n_(57), n_(60), n_(64)], 2, {voyelle:'ou', a:.2, r:.5, g:.02}, loin); A.choeur(t + 2, [n_(57), n_(60), n_(65)], 2, {voyelle:'ou', a:.2, r:.5, g:.02}, loin);
      for(var k = 0; k < 16; k++) chat(t + k * .25, k % 2 ? .9 : .5);
      [0, 2].forEach(function(x){ kick(t + x, 1); clap(t + x + 1, .7); kick(t + x + 1.75, .7); });
      basse(t, BAS.Am, .9, 1); basse(t + 1, BAS.Am + 12, .4, .7); basse(t + 2, BAS.F, .9, 1); basse(t + 3, BAS.F + 12, .4, .7);
      uke(t + .5, ACC.Am, .9, .9); uke(t + 1.5, ACC.Am, .9, .9); uke(t + 2.5, ACC.F, .9, .9);
      o.pont.forEach(function(p){ JOUE[o.voixPont || o.voix](t + p[0], p[1], 1.1); if(o.voix2) JOUE[o.voix2](t + p[0], p[1] + 12, .6); });
      for(var q = 0; q < 8; q++) caisse(t + 3 + q * .125, .02 + q * .011);
      montee(A, t + 2.9, 1.1, .26, loin);
    });
    /* --- LA NUIT (18 → 22 s) : le donjon — ou la fête, pour le Barde --- */
    function coup(t, notes, g){ notes.forEach(function(n){ cuivre(A, t, n_(n), .45, g, sec); }); }
    if(o.fete){
      a(I, 18, function(t){ frappe(A, t, .26, tamb); mesure(t, 'F', {quatre:1, mains:1, double:1}); doubleAir(t, [81, 84, 81, 77, 81, 84, 89, 0]); hey(t + 1, 1); hey(t + 1.5, 1); });
      a(I, 20, function(t){ mesure(t, 'G', {quatre:1, mains:1, double:1}); doubleAir(t, [79, 83, 79, 74, 79, 83, 86, 0]); hey(t + 1, 1); hey(t + 1.5, 1); });
    } else {
      a(I, 18, function(t){ frappe(A, t, .28, tamb); mesure(t, 'Am', {quatre:1, galop:1, double:1, u:.8}); air(t, [69, 72, 76, 72, 69, 72, 76, 81]); coup(t, [45, 52, 57], .05); coup(t + .75, [45, 52, 57], .04); coup(t + 1.5, [48, 52, 57], .04); });
      a(I, 20, function(t){ mesure(t, 'G', {quatre:1, galop:1, double:1, u:.8}); air(t, [67, 71, 74, 71, 67, 71, 74, 79]); coup(t, [43, 50, 55], .05); coup(t + .75, [43, 50, 55], .04); coup(t + 1.5, [47, 50, 55], .04); });
    }
    /* --- LA RAFALE (22 → 24 s) : quatre mots, quatre « hé ! » --- */
    a(I, 22, function(t){
      ['F', 'F', 'G', 'G'].forEach(function(c, b){ var tb = t + b * .5; hey(tb, 1.15); kick(tb, 1); kick(tb + .25, .8); clap(tb, 1); uke(tb, ACC[c], 1.3, .6); basse(tb, BAS[c], .22, 1); basse(tb + .25, BAS[c] + 12, .16, .8); });
      for(var k = 0; k < 16; k++) caisse(t + k * .125, .018 + k * .008);
      [72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91].forEach(function(n, k){ mar(t + .5 + k * .125, n, .5 + k * .04); });
      montee(A, t + .8, 1.2, .3, loin);
    });
    /* --- L'ÉQUIPE (24 → 26 s) : le refrain du héros, une octave au-dessus --- */
    a(I, 24, function(t){ frappe(A, t, .26, tamb); mesure(t, 'C', {quatre:1, mains:1, double:1}); air(t, o.air[0], 1, 'mar', 12); air(t, o.air[0], .9, 'siffle', 12); hey(t + 1, 1.1); hey(t + 1.5, 1.1); });
    /* --- « JOUE LE… ! » (26 → fin) --- */
    a(I, 26, function(t){
      frappe(A, t, .34, tamb); kick(t, 1.2); clap(t, 1.1);
      uke(t, [48, 55, 60, 64, 67, 72], 1.5, 2.6); [36, 43, 48, 52].forEach(function(n){ cuivre(A, t, n_(n), 1.7, .04, sec); });
      A.choeur(t, [n_(72), n_(76), n_(79)], 1.6, {voyelle:'a', a:.03, r:1, g:.03}, loin); basse(t, BAS.C, 1.4, 1.1);
      [[.5, 72], [.75, 76], [1, 79], [1.25, 84]].forEach(function(n){ JOUE[o.voix](t + n[0], n[1], 1); siffle(t + n[0], n[1] + 12, .8); });
      chat(t + .5, 1); chat(t + .75, 1); chat(t + 1, 1); chat(t + 1.25, 1); clap(t + 1.5, .8);
      /* « ta-dam » */
      kick(t + 2, 1.1); clap(t + 2, 1); uke(t + 2, ACC.G, 1.5, .5); basse(t + 2, BAS.G, .3, 1.1); [43, 50, 55].forEach(function(n){ cuivre(A, t + 2, n_(n), .4, .04, sec); });
      kick(t + 2.5, 1.3); clap(t + 2.5, 1.1); uke(t + 2.5, [48, 55, 60, 64, 67, 72], 1.6, 2.2); basse(t + 2.5, BAS.C, 1.1, 1.2); [36, 48, 52, 55].forEach(function(n){ cuivre(A, t + 2.5, n_(n), 1.1, .045, sec); });
      A.ton(t + 2.5, {type:'sine', f:n_(96), env:A.perc(.002, 1.2), g:.03}, loin); A.ton(t + 2.5, {type:'sine', f:n_(84), env:A.perc(.002, 1.2), g:.04}, loin); hey(t + 2.5, 1.2);
    });
    return I;
  };
}
/* le Pisteur (do) : il court — des cordes pincées, et l'air sifflé par-dessus ; la basse au galop */
M.cineMusHerosPisteurA = musiqueHeros({tr:0, voix:'pizz', voix2:'siffle', oct2:12, batt:{galop:1},
  air:[[72, 76, 79, 76, 84, 0, 79, 76], [74, 79, 83, 79, 86, 0, 83, 79], [72, 76, 81, 76, 84, 0, 81, 76], [77, 81, 84, 81, 79, 77, 76, 74], [72, 0, 76, 79, 84, 84, 0, 0]],
  pont:[[0, 76], [.5, 72], [1, 69], [1.5, 72], [2, 77], [2.5, 72], [3, 69]]});
/* l'Alchimiste (ré) : ça bout — le marimba qui rebondit, des bulles par-dessus */
M.cineMusHerosAlchimisteA = musiqueHeros({tr:2, voix:'mar', voix2:'bulle', oct2:12, rare:1, g2:1,
  air:[[79, 0, 76, 0, 79, 81, 79, 76], [74, 0, 71, 0, 74, 76, 74, 71], [76, 0, 72, 0, 76, 77, 76, 72], [77, 0, 81, 0, 84, 81, 77, 76], [79, 76, 72, 76, 79, 84, 0, 0]],
  pont:[[0, 81], [.25, 84], [.5, 88], [1.5, 84], [2, 81], [2.25, 84], [2.5, 89], [3, 84]]});
/* le Barde (fa) : il chante — le luth, et l'air sifflé ; la nuit, pour lui, c'est la fête */
M.cineMusHerosBardeA = musiqueHeros({tr:5, voix:'luth', voix2:'siffle', oct2:12, rare:1, fete:1,
  air:[[76, 77, 79, 0, 79, 81, 79, 76], [74, 76, 79, 0, 83, 81, 79, 74], [72, 74, 76, 0, 81, 79, 76, 72], [77, 79, 81, 0, 84, 83, 81, 79], [79, 76, 79, 84, 0, 84, 0, 0]],
  pont:[[0, 76], [.5, 77], [1, 76], [1.5, 72], [2, 77], [2.5, 81], [3, 79]]});
/* le Sage (la) : il réfléchit — la harpe égrenée et son écho, une cloche sur les temps forts */
M.cineMusHerosSageA = musiqueHeros({tr:-3, voix:'harpe', voix2:'cloche', oct2:12, rare:1, g2:1,
  air:[[72, 76, 79, 76, 84, 79, 76, 79], [71, 74, 79, 74, 86, 79, 74, 79], [69, 72, 76, 72, 84, 76, 72, 76], [69, 72, 77, 72, 81, 77, 84, 81], [72, 76, 79, 84, 88, 0, 84, 0]],
  pont:[[0, 81], [.5, 76], [1, 72], [1.5, 76], [2, 81], [2.5, 77], [3, 72], [3.5, 77]]});
/* =================== LES TROIS FILMS DU DÉBUT DES ENQUÊTES (film-debut1/2/3.js ; Bible §13.69 ; 18 novembre) — NEUVES, à écouter ===================
   Le village, dehors ou dans le bureau du maire : presque pas d'écho. Chaque enquête a son petit air (quelques notes qu'on retient), qu'on
   entend doucement au début du film et en entier sur le titre. */
function village(A, P, I, G){
  G = G || 1;
  var V = {sec:A.bus(P, {grotte:.05, g:G}), tamb:A.bus(P, {grotte:.1, g:G * .8}), loin:A.bus(P, {grotte:.34, g:G * .9})};
  V.ech = I.echo(V.loin, {temps:.38, retour:.34, lp:2600, sortie:.4});
  V.harpe = function(t, n, g, long){ A.harpe(t, m(n), {t60:long || 1.8, g:(g || 1) * .075, lp:3200}, V.ech); };
  V.cel = function(t, n, g){ var f = m(n); g = g || 1; A.ton(t, {type:'sine', f:f, env:A.perc(.002, .9), g:g * .05}, V.ech); A.ton(t, {type:'sine', f:f * 3, env:A.perc(.001, .22), g:g * .008}, V.ech); A.cloche(t, f * 2, {d:.8, g:g * .008, rapport:2.76, indice:.5}, V.ech); };
  V.pizz = function(t, n, g){ A.harpe(t, m(n), {t60:.34, g:(g || 1) * .1, lp:1800, eclat:.3}, V.sec); };
  V.flute = function(t, n, d, g){ var f = m(n); g = (g || 1) * .04; A.ton(t, {type:'sine', f:f * .985, f2:f, gl:.06, env:[[0, 0], [.06, 1], [Math.max(.07, d - .08), .85], [d, 0]], g:g, vib:[5.4, f * .007], vibRetard:.18}, V.loin); A.ton(t, {type:'triangle', f:f * 2, env:[[0, 0], [.06, 1], [d, 0]], g:g * .12}, V.loin); A.bruit(t, {bp:f * 2, bq:3, env:[[0, 0], [.03, 1], [.12, .25], [d, 0]], g:g * .5}, V.loin); };
  V.basson = function(t, n, d, g){ var f = m(n); g = (g || 1) * .06; A.ton(t, {type:'sawtooth', f:f, env:[[0, 0], [.02, 1], [d * .6, .7], [d, 0]], g:g, filtres:[{type:'lowpass', f:520, q:1.2}, {type:'peaking', f:480, q:2, gain:5}]}, V.sec); };
  V.basse = function(t, n, d, g){ g = g || 1; A.ton(t, {type:'triangle', f:m(n), env:[[0, 0], [.008, 1], [d * .5, .6], [d, 0]], g:g * .13, filtres:[{type:'lowpass', f:600}]}, V.sec); };
  V.cordes = function(t, notes, d, g, o){ o = o || {}; A.nappe(t, notes.map(m), d, {a:o.a || 1.2, r:o.r || 1.4, g:(g || 1) * .02, lp:o.lp || 1400, lp1:o.lp1 || 500}, V.loin); };
  V.voix = function(t, notes, d, g, voy, o){ o = o || {}; A.choeur(t, notes.map(m), d, {voyelle:voy || 'ou', a:o.a || .8, r:o.r || 1.2, g:(g || 1) * .02}, V.loin); };
  V.trem = function(t, n, d, g, o){ trem(A, t, m(n), d, (g || 1) * .018, V.sec, o); };
  V.clap = function(t, g){ g = (g || 1) * .09; [0, .011, .024].forEach(function(x, k){ A.bruit(t + x, {coul:'blanc', filtres:[{type:'bandpass', f:1500 + k * 320, q:.9}], env:A.perc(.001, .08 + k * .02), g:g}, V.tamb); }); };
  V.tambourin = function(t, g){ A.bruit(t, {coul:'blanc', hp:5200, env:A.perc(.001, .09), g:(g || 1) * .035}, V.tamb); A.cloche(t, 3900, {d:.14, g:(g || 1) * .006, rapport:1.9, indice:1.2}, V.tamb); };
  V.kick = function(t, g){ A.tambour(t, {f:60, d:.24, g:(g || 1) * .3}, V.tamb); };
  V.timb = function(t, g, f){ A.tambour(t, {f:f || 73, d:.9, g:(g || 1) * .26}, V.tamb); };
  V.violon = function(t, n, d, g){ A.archet(t, m(n), d, {a:.03, r:Math.min(.08, d * .4), g:(g || 1) * .03, lp:3000}, V.sec); };
  V.cuivre = function(t, notes, d, g){ notes.forEach(function(n){ cuivre(A, t, m(n), d, (g || 1) * .04, V.sec); }); };
  return V;
}

/* ---------- ENQUÊTE 1, « La Lanterne d'Or » (debut1, 40,2 s). L'air de la Lanterne : la ré fa mi | ré la si♭ la (une boîte à musique).
   0 → 6,2    le bureau, la nuit : l'air, tout doux (un célesta, la harpe)
   6,2 → 15,2 l'ombre à la fenêtre, la main : des cordes pincées à pas de loup, les cordes qui tremblent ; la Lanterne s'en va (l'air descend)
   15,2 → 19,8 la fuite : les cordes pincées courent, de plus en plus loin
   19,8 → 24,4 la nuit passe : la harpe monte, de plus en plus vite ; le matin (ré majeur)
   24,4 → 28,8 le maire entre, tout content : une petite marche au basson — qui s'arrête net
   28,8 → 32,6 son visage : un roulement qui monte, un accord qui grince
   32,6 → 37   la panique : à gauche ? à droite ? « C'est une catastrophe ! » : le grand coup, la caméra s'envole
   37 → fin    le titre : l'air en entier, et l'accord clair */
M.cineMusDebut1A = function(A, P){
  var I = Instance(A, P), V = village(A, P, I, 1);
  var AIR = [69, 74, 77, 76, 74, 69, 70, 69];
  a(I, .5, function(t){
    V.cordes(t, [50, 57, 62], 6, .8, {a:2, r:2});
    AIR.forEach(function(n, k){ V.cel(t + .6 + k * .6, n + 12, 1); if(k % 2 === 0) V.harpe(t + .6 + k * .6, [50, 57, 53, 57][k / 2], .7, 2.4); });
  });
  a(I, 6.2, function(t){                                                                            /* l'ombre : à pas de loup */
    fond(A, t, [m(38)], 9, .03, V.sec, {a:1, r:1.5});
    [[.3, 50], [.9, 53], [1.5, 50], [2.1, 56], [2.7, 50], [3.3, 53], [3.9, 57], [4.5, 56], [5.1, 50], [5.5, 53], [5.9, 56], [6.3, 57]].forEach(function(q){ V.pizz(t + q[0], q[1], .9); });
    V.trem(t + 1.9, 69, 2.4, 1, {f2:m(70)}); V.trem(t + 1.9, 62, 2.4, .8);                           /* la fenêtre s'ouvre */
  });
  a(I, 11.5, function(t){                                                                           /* la main soulève la Lanterne : la harpe monte… */
    [62, 65, 69, 74, 77, 81].forEach(function(n, k){ V.harpe(t + k * .09, n, .8, 1.4); });
    [[.9, 81], [1.35, 77], [1.8, 76], [2.25, 74], [2.7, 69], [3.15, 65]].forEach(function(q, k){ V.cel(t + q[0], q[1], 1 - k * .12); });   /* …et la lumière s'en va */
    V.pizz(t + 3.5, 38, 1.2);
  });
  a(I, 15.2, function(t){                                                                           /* la fuite : les cordes courent et s'éloignent */
    for(var k = 0; k < 24; k++){ var g = 1 - k / 26; V.pizz(t + k * .17, [50, 57, 53, 57, 50, 57, 55, 57][k % 8], g); if(k % 4 === 0) V.basse(t + k * .17, 38, .3, g); }
    [[.4, 74], [.74, 77], [1.08, 76], [1.76, 74], [2.1, 69]].forEach(function(q, k){ V.flute(t + q[0], q[1], .3, 1 - k * .1); });
    V.cordes(t + 2.6, [50, 57, 65], 3.2, .7, {a:1.2, r:1.6});
  });
  a(I, 19.8, function(t){                                                                           /* la nuit passe : de plus en plus vite, de plus en plus clair */
    var tt = .1, pas = .3, G2 = [50, 57, 62, 66, 69, 74, 78, 81, 86], k = 0;
    while(tt < 3.9){ V.harpe(t + tt, G2[k % G2.length] + (k % G2.length < 3 && tt < 1.6 ? 0 : 0), .5 + tt * .12, 1.2); tt += pas; pas = Math.max(.07, pas * .93); k++; }
    V.cordes(t + 1.2, [50, 57, 62, 66], 4.4, 1, {a:2.6, r:1.2, lp:2400});
    V.voix(t + 3.5, [62, 66, 69], 2.2, 1, 'a', {a:.9, r:1});
  });
  a(I, 24.5, function(t){                                                                           /* le maire, tout content : pom, pom, pom… */
    [[0, 41], [.36, 48], [.72, 41], [1.08, 48], [1.44, 43], [1.8, 48], [2.16, 41], [2.52, 48]].forEach(function(q){ V.basson(t + q[0], q[1], .26, 1); });
    [[.18, [65, 69]], [.54, [65, 69]], [.9, [65, 69]], [1.26, [64, 67]], [1.62, [64, 70]], [1.98, [64, 70]], [2.34, [65, 69]]].forEach(function(q){ q[1].forEach(function(n){ V.pizz(t + q[0], n, .6); }); });
    [[.0, 72, .3], [.36, 77, .3], [.72, 81, .5], [1.44, 79, .3], [1.8, 76, .3], [2.16, 77, .5]].forEach(function(q){ V.flute(t + q[0], q[1], q[2], 1); });
    V.basson(t + 2.95, 37, .9, 1.3); V.trem(t + 2.95, 61, 1.2, .8);                                 /* …il voit : la marche s'arrête net, sur une fausse note */
  });
  a(I, 28.8, function(t){                                                                           /* son visage : ça monte */
    for(var k = 0; k < 22; k++) A.tambour(t + .2 + k * .13, {f:68, d:.2, g:.03 + k * .008}, V.tamb);
    V.trem(t + .3, 62, 3.4, 1.2, {f2:m(63)}); V.trem(t + .3, 68, 3.4, 1, {f2:m(69)});
    V.cuivre(t + 1.2, [38, 44, 50], 2.5, 1);                                                        /* « Elle a disparu ! » */
    montee(A, t + 2.8, .95, .22, V.loin);
  });
  a(I, 32.6, function(t){                                                                           /* la panique : à gauche ? à droite ? */
    frappe(A, t, .32, V.tamb);
    for(var k = 0; k < 14; k++){ V.pizz(t + .1 + k * .14, [62, 65, 62, 68][k % 4] + (k > 7 ? 2 : 0), 1); if(k % 2 === 0) V.basse(t + .1 + k * .14, k > 7 ? 40 : 38, .12, 1); }
    [[.55, 81, 82], [1.45, 82, 84]].forEach(function(q){ V.flute(t + q[0], q[1], .16, 1.1); V.flute(t + q[0] + .18, q[2], .3, 1.1); });   /* deux petites questions */
    V.cuivre(t + 2.1, [38, 45, 50], 2.2, 1.2);                                                      /* « C'est une catastrophe ! » */
    for(var r = 0; r < 9; r++) A.tambour(t + 2.15 + r * .09, {f:70, d:.16, g:.06 + r * .014}, V.tamb);
    frappe(A, t + 3.0, .5, V.tamb);                                                                 /* la caméra s'envole */
    V.voix(t + 3.0, [62, 65, 69], 2.4, 1.3, 'a', {a:.06, r:1.6});
    [50, 57, 62, 65, 69, 74, 77, 81, 86].forEach(function(n, k){ V.harpe(t + 3.05 + k * .07, n, .8, 1.6); });
  });
  a(I, 37.05, function(t){                                                                          /* le titre : l'air en entier */
    V.cordes(t, [50, 57, 62, 65], 3.3, 1.3, {a:.3, r:1.6, lp:2200});
    AIR.slice(0, 6).forEach(function(n, k){ V.cel(t + .1 + k * .26, n + 12, 1.3); V.harpe(t + .1 + k * .26, n, .9, 1.6); });
    var tf = t + 1.78;
    [50, 57, 62, 66, 69, 74].forEach(function(n, k){ V.harpe(tf + k * .03, n, 1, 2.6); });           /* l'accord clair (ré majeur) */
    V.cel(tf, 86, 1.4); V.cel(tf + .16, 90, 1.2); V.timb(tf, .9, 73); V.voix(tf, [62, 66, 69], 1.6, 1.2, 'a', {a:.05, r:1.3});
  });
  return I;
};

/* ---------- ENQUÊTE 2, « La rivière rouge » (debut2, 38,6 s). L'air de la rivière : do fa la sol fa ré do (une flûte, le matin) —
   puis le même, en mineur et tout en bas, quand l'eau est rouge.
   0 → 14,8    l'aube au lavoir : la flûte, la harpe qui coule
   14,8 → 18,8 le drap sort de l'eau : la flûte reste sur une note, un accord froid
   18,8 → 23,6 son visage, son cri : les cordes tremblent et montent
   23,6 → 33,4 la rivière rouge, vue d'en haut ; le village accourt : des coups sourds, les voix, les cordes qui courent
   33,4 → fin  les visages ; le titre : l'air en mineur, la cloche, le dernier coup */
M.cineMusDebut2A = function(A, P){
  var I = Instance(A, P), V = village(A, P, I, 1);
  function coule(t, acc, n, g){ for(var k = 0; k < n; k++) V.harpe(t + k * .3, acc[k % acc.length], g || .6, 1.6); }
  a(I, .4, function(t){
    V.cordes(t, [53, 60, 65], 14.2, .7, {a:2.5, r:2.5});
    coule(t + .3, [53, 60, 65, 69, 65, 60], 12, .5); coule(t + 3.9, [50, 57, 62, 65, 62, 57], 12, .5); coule(t + 7.5, [46, 53, 58, 62, 58, 53], 12, .5); coule(t + 11.1, [48, 55, 60, 64, 60, 55], 10, .5);
    [[1.2, 72, .5], [1.8, 77, .5], [2.4, 81, .9], [3.6, 79, .5], [4.2, 77, .5], [4.8, 74, .9], [6.0, 72, 1.4],
     [8.2, 74, .5], [8.8, 77, .5], [9.4, 82, .9], [10.6, 81, .5], [11.2, 79, .5], [11.8, 76, .9], [13.0, 77, 1.2]].forEach(function(q){ V.flute(t + q[0], q[1], q[2], 1); });
  });
  a(I, 14.8, function(t){                                                                           /* le drap sort… rouge */
    V.flute(t + .1, 76, 2.2, .8);
    V.trem(t + 1.4, 49, 2.8, 1.2); V.trem(t + 1.9, 56, 2.3, 1);
    V.cordes(t + 1.9, [50, 56, 61], 3, 1, {a:.6, r:1.4, lp:1000});
    V.cel(t + 2.0, 85, .9); V.cel(t + 2.5, 80, .8); V.cel(t + 3.0, 73, .7);
  });
  a(I, 18.8, function(t){                                                                           /* son visage : ça monte jusqu'au cri */
    fond(A, t, [m(38)], 5, .035, V.sec, {a:.8, r:.6});
    V.trem(t, 62, 4.8, 1.1, {f2:m(65)}); V.trem(t + .6, 68, 4.2, 1, {f2:m(70)}); V.trem(t + 1.6, 74, 3.2, .9, {f2:m(77)});
    for(var k = 0; k < 9; k++) V.timb(t + .9 + k * .44, .25 + k * .07, 62);
    montee(A, t + 3.7, 1.05, .26, V.loin);
  });
  a(I, 23.6, function(t){                                                                           /* LA RIVIÈRE ROUGE */
    frappe(A, t, .5, V.tamb);
    V.cuivre(t, [38, 45, 50, 53], 3.4, 1.2);
    V.voix(t + .1, [50, 53, 57], 5.2, 1.3, 'ou', {a:.3, r:2});
    [[.9, 62], [1.5, 65], [2.1, 69], [2.7, 67], [3.3, 65], [3.9, 62]].forEach(function(q){ V.harpe(t + q[0], q[1], 1, 2.2); V.basson(t + q[0], q[1] - 24, .5, .7); });   /* l'air, en mineur */
    [1.2, 2.4, 3.6, 4.8].forEach(function(x){ V.timb(t + x, .6, 58); });
  });
  a(I, 29.0, function(t){                                                                           /* le village accourt */
    for(var k = 0; k < 26; k++){ V.pizz(t + k * .165, [50, 57, 53, 57, 50, 58, 53, 57][k % 8], .8); if(k % 4 === 0) V.basse(t + k * .165, 38, .3, 1); }
    V.cordes(t, [50, 57, 62, 65], 4.6, 1, {a:1, r:1.2});
    V.trem(t + 2.6, 69, 2, .9, {f2:m(70)});
  });
  a(I, 33.4, function(t){ V.voix(t, [50, 55, 58], 2, 1.1, 'ou', {a:.4, r:.9}); V.timb(t + .2, .5, 58); V.timb(t + 1.1, .6, 58); });   /* les visages */
  a(I, 35.25, function(t){                                                                          /* le titre */
    frappe(A, t, .42, V.tamb);
    V.cordes(t, [38, 50, 57, 62], 3.2, 1.4, {a:.2, r:1.6, lp:1800});
    [[.1, 62], [.45, 65], [.8, 69], [1.15, 67], [1.5, 65], [1.85, 62]].forEach(function(q){ V.cel(t + q[0], q[1] + 12, 1.2); V.harpe(t + q[0], q[1], 1, 1.8); });
    A.cloche(t + 2.2, m(50), {d:2.6, g:.06}, V.loin); V.timb(t + 2.2, 1, 55); V.voix(t + 2.2, [50, 57], 1.1, 1.2, 'ou', {a:.05, r:.9});
  });
  return I;
};

/* ---------- ENQUÊTE 3, « La lettre d'Odette » (debut3, 37,2 s). L'air d'Odette : la do fa mi ré do la (tendre) ; la danse du village (ré majeur).
   0 → 5,2     le village attend : les cordes retenues, un cœur qui bat
   5,2 → 14    le maire sort, la lettre : l'air d'Odette, tout doux (célesta, harpe)
   14 → 20,8   « Odette va bien ! » : le grand accord, le soulagement qui monte
   20,8 → 30,2 « Grande fête cette nuit ! » : la fanfare, puis la danse (violon, mains, tambourin)
   30,2 → 33,2 le chat : la danse s'éloigne ; trois notes graves — quelque chose cloche
   33,2 → fin  le titre : l'air d'Odette… qui finit sur une question */
M.cineMusDebut3A = function(A, P){
  var I = Instance(A, P), V = village(A, P, I, 1);
  var ODETTE = [69, 72, 77, 76, 74, 72, 69];
  a(I, .3, function(t){
    V.cordes(t, [50, 57, 62], 5.4, 1, {a:2, r:1.4, lp:1100});
    V.trem(t + 1, 65, 4, .7); [1.0, 2.2, 3.4, 4.4].forEach(function(x){ sourd(A, t + x, .09, V.tamb); sourd(A, t + x + .28, .06, V.tamb); });
  });
  a(I, 5.2, function(t){                                                                            /* la porte s'ouvre : l'espoir */
    [50, 57, 62, 65, 69].forEach(function(n, k){ V.harpe(t + .5 + k * .16, n, .8, 2); });
    V.cordes(t + 1, [53, 60, 65], 3.6, .9, {a:1.2, r:1.2});
  });
  a(I, 9.5, function(t){                                                                            /* la lettre : l'air d'Odette */
    V.cordes(t, [53, 60, 65, 69], 4.8, .8, {a:1.2, r:1.6});
    ODETTE.forEach(function(n, k){ V.cel(t + .3 + k * .55, n + 12, 1.1); if(k % 2 === 0) V.harpe(t + .3 + k * .55, [53, 57, 58, 53][k / 2], .7, 2.4); });
  });
  a(I, 14.2, function(t){                                                                           /* « Odette va bien ! » */
    [53, 60, 65, 69, 72, 77].forEach(function(n, k){ V.harpe(t + .45 + k * .035, n, 1, 2.6); });
    V.voix(t + .45, [65, 69, 72], 2.8, 1.2, 'a', {a:.15, r:1.6}); V.timb(t + .45, .7, 65);
    V.cordes(t + .45, [53, 60, 65, 69], 6.2, 1.2, {a:.4, r:1.2, lp:2400});
    for(var k = 0; k < 16; k++) V.tambourin(t + 3.3 + k * .2, .4 + k * .06);                         /* le soulagement gagne tout le monde */
    [[3.3, 69], [3.7, 72], [4.1, 74], [4.5, 77], [4.9, 79], [5.3, 81], [5.7, 84], [6.1, 86]].forEach(function(q){ V.harpe(t + q[0], q[1], .8, 1.2); });
    montee(A, t + 5.6, .95, .2, V.loin);
  });
  a(I, 20.8, function(t){                                                                           /* « Grande fête cette nuit, sur la place ! » : la fanfare */
    frappe(A, t, .36, V.tamb);
    [[0, [62, 66, 69], .32], [.36, [62, 66, 69], .16], [.54, [62, 66, 69], .16], [.72, [64, 67, 71], .34], [1.08, [66, 69, 74], .9]].forEach(function(q){ V.cuivre(t + q[0], q[1].map(function(n){ return n - 12; }), q[2] + .15, 1.1); q[1].forEach(function(n){ V.pizz(t + q[0], n, .8); }); });
    V.voix(t + 1.08, [62, 66, 69], 2.6, 1, 'a', {a:.1, r:1.6});
    for(var k = 0; k < 12; k++) A.tambour(t + 2.4 + k * .13, {f:74, d:.18, g:.05 + k * .012}, V.tamb);
  });
  a(I, 25.0, function(t){                                                                           /* LA DANSE (132 à la minute : un temps = 0,4545 s) */
    var T = .4545, ACC = [[50, 57, 62, 66], [55, 59, 62, 67], [57, 61, 64, 69], [50, 57, 62, 66], [47, 54, 59, 62], [55, 59, 62, 67], [57, 61, 64, 69], [50, 57, 62, 66]];
    var DANSE = [[74, 78, 81, 78], [79, 83, 86, 83], [81, 85, 88, 85], [86, 81, 78, 74], [78, 74, 71, 74], [79, 83, 86, 83], [88, 85, 81, 85], [86, 0, 86, 0]];
    for(var me = 0; me < 6; me++){
      var loin = me >= 5 ? .35 : 1;                                                                 /* (à 30,2 s on est au ras des pavés, avec le chat : la danse s'éloigne) */
      for(var b = 0; b < 2; b++){ var tb = t + (me * 2 + b) * T;
        V.kick(tb, .9 * loin); V.clap(tb + T / 2, .9 * loin); V.tambourin(tb + T / 4, .8 * loin); V.tambourin(tb + T * 3 / 4, loin);
        V.basse(tb, ACC[me][0] - 12, .3, loin); ACC[me].slice(1).forEach(function(n){ V.pizz(tb + T / 2, n, .55 * loin); });
        [0, 1].forEach(function(q){ var n = DANSE[me][b * 2 + q]; if(n) V.violon(tb + q * T / 2, n, T / 2 * .92, 1.1 * loin); });
      }
    }
  });
  a(I, 30.5, function(t){                                                                           /* le chat : quelque chose cloche */
    fond(A, t, [m(38)], 3.4, .03, V.sec, {a:.6, r:1});
    [[.3, 50], [.95, 51], [1.6, 50]].forEach(function(q){ V.basson(t + q[0], q[1], .5, 1.2); V.harpe(t + q[0], q[1] + 12, .7, 1.4); });
    V.trem(t + 1.4, 68, 1.6, .8);
  });
  a(I, 33.25, function(t){                                                                          /* le titre : l'air d'Odette… et une question */
    V.cordes(t, [53, 60, 65], 2.2, 1.2, {a:.2, r:.9, lp:2200});
    ODETTE.slice(0, 5).forEach(function(n, k){ V.cel(t + .1 + k * .3, n + 12, 1.3); V.harpe(t + .1 + k * .3, n, .9, 1.6); });
    var tf = t + 1.7;
    V.cordes(tf, [49, 56, 61, 65], 2.2, 1.2, {a:.15, r:1.5, lp:1600});                               /* l'accord qui ne finit pas (il manque quelque chose : la vraie Odette) */
    V.cel(tf, 85, 1.3); V.cel(tf + .3, 80, 1.1); V.timb(tf, .7, 55); V.voix(tf, [61, 65, 68], 1.6, 1, 'ou', {a:.1, r:1.3});
  });
  return I;
};
})(window);
