/* Atelier des sons de Brumeval — les musiques du donjon complet (proposées le 9 novembre, à valider par Romain).
   Règle de Romain (9 novembre, 10 h 48) : une musique reste une musique d'ambiance — des nappes, des basses, des cloches
   lointaines, de l'eau, du vent grave… mais RIEN d'aigu ni d'animal (pas de couinements, de grattements, de sifflements aigus).
   Les couleurs de salle (canaux, ossuaire) se jouent par-dessus le fond commun du donjon (MUSIQUES.donjon, ré mineur). */
(function(G){
'use strict';
var h = Moteur.hasard, m = Moteur.midi, M = G.MUSIQUES, T = G.MUSIQUES_OUTILS, O = G.BRUITAGES_OUTILS;
var Instance = T.Instance, bourdon = T.bourdon, souffle = T.souffle, ruisseau = T.ruisseau, tremolo = T.tremolo, boite = T.boite, flute = T.flute;
function hasardDans(l){ return l[Math.floor(Math.random() * l.length)]; }
/* un tampon joué en boucle sans fin (le crépitement du feu) */
function boucleTampon(I, buf, o){
  var A = I.A, ctx = A.ctx, t = I.P.t, s = I.continu(ctx.createBufferSource()); s.buffer = buf; s.loop = true;
  var n = s, f = A.chaine(t, s, o.filtres || []);
  var g = A.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.g, t + 2);
  f.connect(g); g.connect(o.dest); s.start(t, h(0, 2));
  return g;
}
/* une note de bois creux (des os, un xylophone) */
function bois(A, t, f, g, dest){ A.modes(t, f, [[1, 1, .7], [3.93, .22, .18], [9.2, .05, .05]], {g:g, a:.002}, dest); }
/* un tuba : une note grave et ronde, courte, dont le filtre s'ouvre puis se referme */
function tuba(A, t, f, d, g, dest){
  A.ton(t, {type:'sawtooth', f:f, env:[[0, 0], [.02, 1], [d * .6, .7], [d, 0]], g:g, sat:1.4, filtres:[{type:'lowpass', f:250, pts:[[.04, 900], [d, 300]], q:1.5}]}, dest);
  A.ton(t, {type:'square', f:f * 2, env:[[0, 0], [.02, 1], [d, 0]], g:g * .12, lp:700}, dest);
}
/* un basson un peu comique (une anche douce) */
function basson(A, t, f, d, g, dest){
  A.ton(t, {type:'square', f:f, env:[[0, 0], [.04, 1], [d * .8, .8], [d, 0]], g:g, filtres:[{type:'peaking', f:500, q:1.5, gain:6}, {type:'lowpass', f:1400, q:.7}], vib:[5, f * .008], vibRetard:.15}, dest);
}
/* une bulle grave qui remonte du fond (de l'eau, pas une bête) */
function bloup(A, t, g, dest){ var f = h(140, 230); A.ton(t, {f:f, f2:f * 1.8, gl:.07, env:[[0, 0], [.004, 1], [.06, .4], [.16, 0]], g:g, sat:1.2}, dest); }

/* =================== LE FEU DE CAMP (l'ambiance du feu lui-même, en boucle) =================== */
M.feuCampA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {rev:.25});
  souffle(I, {dest:proche, coul:'brun', f:300, q:.7, balai:120, lfo1:.07, lfo2:.13, g:.07});                         /* la flamme qui respire */
  boucleTampon(I, A.crepitement(6, 16, {forme:function(){ return .8; }}), {dest:proche, g:.35, filtres:[{type:'highpass', f:700}, {type:'lowpass', f:4500}]});
  I.chaque(1, function(){ return h(1.5, 4); }, function(t){ A.bruit(t, {coul:'rose', bp:h(900, 1600), bq:1.2, env:A.perc(.001, .05), g:.35}, proche); A.choc(t, {f:160, f2:80, d:.06, g:.08, bruit:0, corps:.4}, proche); });   /* pop ! */
  return I;
};
M.feuCampB = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {rev:.3});
  boucleTampon(I, A.crepitement(6, 26, {forme:function(){ return .8; }}), {dest:proche, g:.3, filtres:[{type:'highpass', f:900}, {type:'lowpass', f:5000}]});
  souffle(I, {dest:proche, coul:'rose', f:350, q:.6, balai:150, lfo1:.05, lfo2:.11, g:.03});
  I.chaque(4, function(){ return h(6, 10); }, function(t){                                                            /* une bûche qui se tasse */
    A.choc(t, {f:130, f2:60, d:.18, g:.18, sat:1.8, corpsF:400}, proche);
    A.joue(t + .02, A.crepitement(.6, 70), {g:.3, filtres:[{type:'highpass', f:900}, {type:'lowpass', f:4500}]}, proche);
  });
  I.chaque(2, function(){ return h(5, 9); }, function(t){ A.bruit(t, {coul:'brun', bp:280, bq:1, env:[[0, 0], [.6, 1], [1.8, 0]], g:.25}, proche); });   /* fwoom, la flamme qui monte */
  return I;
};

/* =================== DEUX NOUVELLES COULEURS DE SALLE (par-dessus le fond du donjon) =================== */
/* les canaux : de l'eau qui court, une petite mélodie de boîte à musique au loin, une cloche grave */
M.canauxA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.4}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.45, retour:.4, lp:2200, sortie:.55});
  ruisseau(I, {dest:proche, densite:55, fmin:300, fmax:1400, g:.11});
  souffle(I, {dest:proche, coul:'brun', f:240, q:.8, balai:60, lfo1:.04, lfo2:.18, g:.05});                           /* l'eau qui clapote contre la pierre */
  var notes = [62, 65, 67, 69, 72];
  I.chaque(2, function(){ return h(7, 11); }, function(t){ var k = Math.floor(Math.random() * 3); [0, 1, 2].forEach(function(i){ boite(A, t + i * .5, m(notes[k + i]), .045, ech); }); });
  I.chaque(8, function(){ return h(12, 18); }, function(t){ A.cloche(t, m(45), {d:4, rapport:3.5, indice:.6, g:.035}, loin); });
  return I;
};
M.canauxB = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.45}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.6, retour:.45, lp:1800, sortie:.6});
  souffle(I, {dest:proche, coul:'brun', f:300, q:.6, balai:100, lfo1:.03, lfo2:.15, g:.07});                         /* de lentes vagues */
  tremolo(I, [m(50), m(57)], {dest:loin, type:'triangle', g:.012, vit:4, lp:800});
  var notes = [50, 53, 55, 57, 60, 62, 64, 65];
  I.chaque(1, function(){ return h(3, 6); }, function(t){ var a = hasardDans(notes); A.harpe(t, m(a), {t60:3, g:.12, lp:2000}, ech); if(Math.random() < .5) A.harpe(t + .4, m(a + hasardDans([3, 5, 7])), {t60:3, g:.09, lp:2000}, ech); });
  I.chaque(3, function(){ return h(6, 10); }, function(t){ bloup(A, t, .05, ech); });
  return I;
};
/* l'ossuaire : des notes de bois creux (comme des os qui chantent), un chœur grave qui fredonne, le vent */
M.ossuaireA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.45}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.5, retour:.35, lp:2000, sortie:.5});
  var notes = [50, 53, 55, 57, 60, 62];
  I.chaque(1, function(){ return h(3, 5); }, function(t){ var a = hasardDans(notes); bois(A, t, m(a), .07, proche); bois(A, t + .28, m(a - hasardDans([2, 3, 5])), .05, ech); });
  I.chaque(.5, 10, function(t, n){ A.choeur(t, [m(50), m(n % 2 ? 55 : 57)], 12, {voyelle:'ou', a:3, r:4, g:.022}, loin); });
  souffle(I, {dest:loin, coul:'brun', f:280, q:.8, balai:80, lfo1:.03, lfo2:.07, g:.04});
  return I;
};
M.ossuaireB = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.45}), loin = A.bus(P, {grotte:1, g:.7});
  souffle(I, {dest:loin, coul:'rose', f:380, q:1.3, balai:120, lfo1:.04, lfo2:.09, g:.03});                          /* le vent grave entre les crânes */
  var notes = [50, 53, 55, 57];
  I.chaque(1.5, function(){ return h(6, 9); }, function(t){ flute(A, t, m(hasardDans(notes)), 3.2, .03, proche); });   /* une flûte creuse, grave */
  I.chaque(4, function(){ return h(11, 15); }, function(t){ A.cloche(t, m(45), {d:4.5, rapport:3.5, indice:.7, g:.04}, loin); });
  return I;
};

/* =================== LE REPOS AU FEU DE CAMP (une musique à part, chaude et douce) =================== */
M.reposA = function(A, P){
  var I = Instance(A, P), b = .5, proche = A.bus(P, {grotte:.3}), loin = A.bus(P, {grotte:.9, g:.7});
  bourdon(I, [m(41), m(48)], {dest:proche, type:'triangle', lp:450, g:.05, lfo:.03, lfoAmp:60});
  var accords = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]];                                              /* fa, ré mineur, si bémol, do */
  I.chaque(.3, 8 * b, function(t, n){
    var a = accords[n % 4];
    A.nappe(t, a.map(m), 8 * b + 1, {type:'triangle', a:1, r:1.5, lp:900, lp1:400, g:.035}, proche);
    [0, 1, 2, 1, 2, 3, 2, 1].forEach(function(i, k){ var note = i < 3 ? a[i] + 12 : a[0] + 24; A.harpe(t + k * b, m(note), {t60:2, g:.1, lp:3000}, proche); });   /* la berceuse à la harpe */
  });
  var air = [[0, 72], [1, 74], [2, 77], [4, 76], [5, 74], [6, 72], [8, 69], [10, 70], [11, 69], [12, 67], [14, 65]];
  I.chaque(.3 + 16 * b, 32 * b, function(t){ air.forEach(function(p){ flute(A, t + p[0] * b, m(p[1] - 12), b * 1.6, .03, loin); }); });
  return I;
};
M.reposB = function(A, P){
  var I = Instance(A, P), b = .55, proche = A.bus(P, {grotte:.3}), loin = A.bus(P, {grotte:.9, g:.8}), ech = I.echo(loin, {temps:.55, retour:.3, lp:2600, sortie:.4});
  var basses = [36, 33, 29, 31];                                                                                     /* do, la, fa, sol */
  I.chaque(.3, 8 * b, function(t, n){ A.archet(t, m(basses[n % 4]), 8 * b + .2, {a:.6, r:1, g:.035, lp:1200}, proche); A.nappe(t, [m(basses[n % 4] + 24), m(basses[n % 4] + 28), m(basses[n % 4] + 31)], 8 * b + 1, {type:'triangle', a:1.2, r:1.5, lp:800, lp1:350, g:.025}, proche); });
  var berceuse = [[0, 72], [1, 76], [2, 79], [3, 77], [4, 76], [5, 74], [6, 72], [8, 74], [9, 76], [10, 74], [11, 72], [12, 71], [14, 72]];
  I.chaque(.8, 16 * b, function(t){ berceuse.forEach(function(p){ boite(A, t + p[0] * b + h(-.01, .01), m(p[1]), .06, proche); boite(A, t + p[0] * b, m(p[1]), .03, ech); }); });
  return I;
};

/* =================== BOURBE, LE BOSS (lourd, un peu drôle, et gluant) =================== */
/* A — La marche du crapaud : un tuba qui fait « oum-pa », des tambours, un basson qui descend en se dandinant */
M.bossA = function(A, P){
  var I = Instance(A, P), b = 60 / 92, proche = A.bus(P, {grotte:.3}), tamb = A.bus(P, {grotte:.7, g:.85}), loin = A.bus(P, {grotte:1, g:.7});
  var racines = [38, 34, 31, 33], accords = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]];
  I.chaque(.3, 4 * b, function(t, n){
    var r = racines[n % 4], a = accords[n % 4];
    tuba(A, t, m(r), b * .9, .12, proche); tuba(A, t + 2 * b, m(r + 7), b * .9, .1, proche);                          /* oum… */
    [1, 3].forEach(function(x){ a.forEach(function(nn){ A.ton(t + x * b, {type:'square', f:m(nn), env:A.perc(.008, .14), g:.016, lp:1100}, proche); }); });   /* …pa */
    A.tambour(t, {f:80, d:.7, g:.32}, tamb); A.tambour(t + 2 * b, {f:90, d:.6, g:.22}, tamb);
    [1, 3].forEach(function(x){ A.bruit(t + x * b, {coul:'rose', bp:1400, bq:.8, env:A.perc(.002, .07), g:.12}, tamb); });
    if(n % 2 === 1) bloup(A, t + 3.5 * b, .06, proche);                                                               /* le marais qui fait « bloup » */
  });
  var air = [[0, 62], [.5, 61], [1, 60], [2, 57], [3, 58], [3.5, 57], [4, 53], [6, 50], [7, 52], [7.5, 53]];
  I.chaque(.3 + 16 * b, 16 * b, function(t, n){ if(n % 2 === 0) air.forEach(function(p){ basson(A, t + p[0] * b, m(p[1] - 12), b * .7, .035, loin); }); });
  return I;
};
/* B — Le bassin qui gronde : plus lent, de gros tambours, un violoncelle qui insiste, des cuivres graves qui gonflent */
M.bossB = function(A, P){
  var I = Instance(A, P), b = 60 / 76, proche = A.bus(P, {grotte:.35}), tamb = A.bus(P, {grotte:.9, g:.8}), loin = A.bus(P, {grotte:1, g:.7});
  bourdon(I, [m(38)], {dest:proche, lp:240, g:.05, lfo:.05, lfoAmp:60, a:2});
  var rythme = [[0, 1], [1.5, .6], [2, .9], [3, .5]];
  I.chaque(.3, 4 * b, function(t){ rythme.forEach(function(p){ A.tambour(t + p[0] * b, {f:p[1] > .8 ? 75 : 90, d:.75, g:.34 * p[1]}, tamb); }); });
  var cello = [50, 50, 51, 50, 50, 50, 46, 48];                                                                      /* ré, ré, mi bémol, ré… : ça insiste */
  I.chaque(.3, b, function(t, n){ A.archet(t, m(cello[n % 8]), b * .95, {a:.06, r:.15, g:.04}, proche); });
  I.chaque(.3 + 8 * b, 16 * b, function(t){ [38, 45].forEach(function(nn){ [-6, 6].forEach(function(det){ A.ton(t, {type:'sawtooth', f:m(nn), det:det, env:[[0, 0], [2, 1], [3.5, .6], [5, 0]], g:.03, filtres:[{type:'lowpass', f:250, pts:[[2, 1300], [5, 250]], q:1.2}]}, loin); }); }); });
  I.chaque(2, function(){ return h(3, 6); }, function(t){ bloup(A, t, .05, proche); });
  return I;
};
/* C — Le marais qui swingue : une basse pincée qui se balance, des « splotch » en guise de claquements de mains, des cuivres graves */
M.bossC = function(A, P){
  var I = Instance(A, P), b = 60 / 100, proche = A.bus(P, {grotte:.3}), loin = A.bus(P, {grotte:.9, g:.7});
  var marche = [38, 41, 43, 44, 45, 43, 41, 40, 38, 36, 34, 33, 34, 36, 37, 38];                                       /* une basse qui marche, en se dandinant */
  I.chaque(.3, b, function(t, n){
    var sw = n % 2 ? b * .16 : 0;                                                                                    /* le balancement */
    A.harpe(t + sw, m(marche[n % 16]), {t60:.5, eclat:.3, g:.25, lp:1200}, proche);
    if(n % 2 === 1){ A.bruit(t, {coul:'rose', filtres:[{type:'lowpass', f:1500, pts:[[.1, 400]], q:4}], env:A.perc(.003, .12), g:.35}, proche); A.choc(t, {f:150, f2:80, d:.08, g:.12, bruit:0, corps:.5}, proche); }   /* splotch */
    if(n % 8 === 7) [50, 53, 57].forEach(function(nn){ O.cuivre(A, t + b * .5, m(nn), b * .6, .025, loin); });       /* des cuivres graves */
  });
  I.chaque(.3, 4 * b, function(t){ A.tambour(t, {f:85, d:.5, g:.25}, proche); });
  return I;
};

/* =================== LA FIN DU DONJON : LÉO RETROUVÉ =================== */
/* A — La lanterne de Léo : une harpe, un chœur, des cloches, en do majeur ; enfin de l'espoir */
M.finDonjonA = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.4}), loin = A.bus(P, {grotte:1, g:.7});
  var accords = [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]];                              /* do, sol, la mineur, fa */
  I.chaque(.4, 4, function(t, n){
    var a = accords[n % 4];
    A.choeur(t, a.slice(1).map(m), 5, {voyelle:n % 2 ? 'a' : 'o', a:1.2, r:1.8, g:.028}, proche);
    A.archet(t, m(a[0]), 4.2, {a:.5, r:.8, g:.03}, proche);
    [0, 1, 2, 3, 2, 1].forEach(function(i, k){ A.harpe(t + k * .6, m(a[i] + 12), {t60:2.2, g:.1}, proche); });
  });
  var cloches = [[0, 76], [1, 79], [2, 84], [4, 83], [6, 79], [8, 81], [9, 79], [10, 76], [12, 74], [14, 72]];
  I.chaque(.4 + 16, 32, function(t){ cloches.forEach(function(p){ A.cloche(t + p[0] * .5, m(p[1]), {d:2, rapport:3.5, indice:.8, g:.03}, loin); }); });
  return I;
};
/* B — La boîte à musique retrouvée : la berceuse de l'exploration (B), mais en majeur — on a gagné */
M.finDonjonB = function(A, P){
  var I = Instance(A, P), proche = A.bus(P, {grotte:.3}), loin = A.bus(P, {grotte:.9, g:.8}), ech = I.echo(loin, {temps:.5, retour:.3, lp:2600, sortie:.45});
  bourdon(I, [m(33), m(40)], {dest:proche, type:'triangle', lp:400, g:.06, lfo:.03, lfoAmp:60});
  var accords = [[57, 61, 64], [54, 57, 61], [50, 54, 57], [52, 56, 59]];                                              /* la, fa dièse mineur, ré, mi */
  var phrase = [[0, 76], [1, 81], [2, 83], [3, 85], [4, 83], [5, 81], [6, 78], [8, 76], [9, 74], [10, 78], [11, 81], [12, 80], [14, 81]];
  I.chaque(.3, 8, function(t, n){
    A.nappe(t, accords[n % 4].map(m), 10, {type:'triangle', a:2.5, r:3.5, lp:900, lp1:300, g:.04}, proche);
    if(n % 4 === 0) phrase.forEach(function(p){ boite(A, t + .5 + p[0] * .5, m(p[1]), .065, proche); boite(A, t + .5 + p[0] * .5, m(p[1]), .035, ech); });
    else if(n % 4 === 2) A.cloche(t + 1, m(accords[n % 4][0] + 12), {d:3, rapport:3.5, indice:.8, g:.03}, loin);
  });
  return I;
};

})(window);
