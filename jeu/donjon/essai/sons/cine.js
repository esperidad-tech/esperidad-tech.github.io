/* Atelier des sons de Brumeval — LES CINÉMATIQUES (Bible §13.45 ; 15 novembre). La vidéo des cinématiques est muette : ces
   bruitages (la liste « sons » de chaque film, jeu/cine/src/films.js) sont mélangés d'avance, avec la musique du film
   (cine-musiques.js), dans sa bande-son (jeu/cine/bande-son.py → <film>.mp3) ; sans elle, le jeu les joue un par un, à l'instant dit.
   APRÈS UNE RETOUCHE ICI (ou une version choisie par Romain) : relancer bande-son.py, sinon le jeu garde l'ancienne bande-son.
   Tous NEUFS (🆕) : une seule version (A) chacun, que le jeu joue en attendant que Romain les écoute dans l'Atelier.
   Mêmes règles que leo.js : une fonction (A : le moteur, P : la prise, P.t : l'instant de départ) qui rend {duree}. */
(function(G){
'use strict';
var S = G.BRUITAGES;
function h(a, b){ return a + Math.random() * (b - a); }
function bus(A, P, pan, rev){ return A.bus(P, {rev:rev == null ? .5 : rev, grotte:.4, pan:pan == null ? 0 : pan}); }
function fouet(A, t, d, o, dest){
  o = o || {};
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:o.f || 500, pts:[[d, o.f2 || 2200]], q:o.q || 1.4}], env:[[0, 0], [d * .55, 1], [d, 0]], g:o.g == null ? 1 : o.g}, dest);
}
function voix(A, t, d, o, dest){
  o = o || {};
  var f = o.f || 110, env = o.env || [[0, 0], [.05, 1], [d * .7, .85], [d, 0]], g = o.g == null ? .3 : o.g;
  A.ton(t, {type:'sawtooth', f:f, f2:f * (o.chute || .8), gl:d, env:env, g:g, gigue:o.gigue || 14, trem:[o.rr || 24, o.tr == null ? .8 : o.tr], sat:o.sat || 2,
    filtres:[{type:'peaking', f:o.f1 || 600, q:1.3, gain:8}, {type:'peaking', f:o.f2 || 1300, q:2, gain:5}, {type:'lowpass', f:o.lp || 2400, q:.7}]}, dest);
  A.bruit(t, {bp:o.fb || 900, bq:1, env:env, g:g * (o.souffle == null ? .9 : o.souffle), rugueux:.8, rugVit:6}, dest);
}
function souffle(A, t, d, g, f, dest){ A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:f || 700, q:.9}], env:[[0, 0], [d * .3, 1], [d, 0]], g:g}, dest); }
function fer(A, t, f, g, dest){ [1, 2.76, 5.4].forEach(function(m, k){ A.ton(t, {f:f * m, env:[[0, 0], [.003, 1], [.5 - k * .12, 0]], g:(g || .12) / (k + 1)}, dest); }); }
function bois(A, t, o, dest){ o = o || {}; A.choc(t, {f:o.f || 240, f2:o.f2 || 90, d:o.d || .16, g:o.g == null ? .7 : o.g, sat:3, corps:1.8, corpsF:o.cf || 620}, dest); }
function lourd(A, t, g, dest){ A.choc(t, {f:110, f2:38, d:.32, g:g == null ? .8 : g, sat:3, corps:1.8, corpsF:240}, dest); A.bruit(t, {coul:'brun', filtres:[{type:'lowpass', f:600}], env:A.perc(.004, .25), g:.3 * (g || .8)}, dest); }

/* les outils qui tombent sur la pierre (le fléau, le marteau, le crochet) */
S.cineOutilsA = function(A, P){
  var t = P.t, o = bus(A, P, h(-.3, .3), .45);
  bois(A, t, {f:300, f2:120, g:.75, d:.12, cf:900}, o); fer(A, t + .01, h(780, 980), .1, o);
  bois(A, t + .11, {f:260, f2:100, g:.45, d:.1}, o); fer(A, t + .12, h(1100, 1300), .05, o);
  A.joue(t + .02, A.crepitement(.25, 40), {g:.35, filtres:[{type:'highpass', f:1800}]}, o);
  return {duree:1.2};
};
/* il souffle fort (trois grandes respirations) */
S.cineSouffleA = function(A, P){
  var t = P.t, o = bus(A, P, .1, .35);
  for(var k = 0; k < 3; k++){
    souffle(A, t + k * 1.1, .45, .55, 900, o);              /* il inspire */
    souffle(A, t + k * 1.1 + .48, .55, .7, 520, o);          /* il expire */
    voix(A, t + k * 1.1 + .5, .4, {f:95, chute:.85, g:.06, tr:.2, souffle:1.6}, o);
  }
  return {duree:3.6};
};
/* un grognement sourd */
S.cineGrogneA = function(A, P){
  var t = P.t, o = bus(A, P, .1, .6);
  voix(A, t, 1.3, {f:72, chute:.92, g:.36, rr:17, tr:.95, sat:3, f1:420, f2:900, lp:1600}, o);
  return {duree:2};
};
/* un pas lourd */
S.cinePasA = function(A, P){ var t = P.t, o = bus(A, P, .1, .5); lourd(A, t, .7, o); A.joue(t + .02, A.crepitement(.12, 30), {g:.25, filtres:[{type:'bandpass', f:2400}]}, o); return {duree:1}; };
/* la cape qui s'envole (un grand claquement de tissu) */
S.cineCapeA = function(A, P){
  var t = P.t, o = bus(A, P, .5, .4);
  fouet(A, t, .32, {f:300, f2:1600, g:1.1}, o);
  for(var k = 0; k < 7; k++) A.bruit(t + .25 + k * .09, {coul:'rose', filtres:[{type:'bandpass', f:h(500, 900), q:1.6}], env:A.perc(.01, .08), g:.5 * (1 - k / 8)}, bus(A, P, .5 + k * .06, .4));
  return {duree:1.4};
};
/* l'onde de choc : un grand coup sourd, la salle qui gronde, des cailloux qui retombent */
S.cineOndeA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .7);
  A.choc(t, {f:80, f2:26, d:.9, g:1.2, sat:4, corps:2, corpsF:180}, o);
  A.bruit(t, {coul:'brun', filtres:[{type:'lowpass', f:180}], env:[[0, 0], [.08, 1], [2.2, 0]], g:.9, rugueux:.6, rugVit:4}, o);
  A.joue(t + .35, A.crepitement(1.4, 70), {g:.4, filtres:[{type:'bandpass', f:2600, q:.7}]}, bus(A, P, .4, .5));
  return {duree:2.8};
};
/* il s'essuie la bouche d'un revers de poignet */
S.cineEssuieA = function(A, P){ var t = P.t, o = bus(A, P, .2, .2); fouet(A, t, .28, {f:1200, f2:2600, q:.8, g:.35}, o); return {duree:.6}; };
/* il recrache le bouchon */
S.cineCracheA = function(A, P){
  var t = P.t, o = bus(A, P, -.3, .35);
  A.bruit(t, {filtres:[{type:'bandpass', f:1400, q:1.2}], env:A.perc(.005, .09), g:.6}, o);
  A.ton(t + .02, {f:260, f2:140, gl:.08, env:A.perc(.004, .07), g:.12}, o);
  [.45, .62, .74].forEach(function(d, k){ bois(A, t + d, {f:900 - k * 80, f2:600, g:.18 - k * .04, d:.04, cf:2400}, bus(A, P, -.6, .35)); });
  return {duree:1.2};
};
/* le cœur qui cogne (deux fois deux coups) */
S.cineCoeurA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .25);
  [0, .26, .9, 1.16].forEach(function(d, k){ A.choc(t + d, {f:62, f2:34, d:.22, g:k % 2 ? .55 : .8, corps:1.4, corpsF:120}, o); });
  return {duree:2};
};
/* la potion monte : un souffle qui grimpe, un grondement, jusqu'à l'éclair */
S.cineMonteeA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .6), d = 1.3;
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:200, pts:[[d, 4200]], q:1.1}], env:[[0, 0], [d * .9, 1], [d, 0]], g:1}, o);
  A.ton(t, {type:'sawtooth', f:60, f2:240, gl:d, env:[[0, 0], [d * .8, 1], [d, 0]], g:.16, lp:900, sat:3}, o);
  A.choc(t + d, {f:140, f2:40, d:.8, g:1, sat:4, corps:2, corpsF:300}, o);
  A.ton(t + d, {f:1760, f2:1700, gl:1, env:[[0, 0], [.01, 1], [1.4, 0]], g:.08, vib:[5, 12]}, o);
  return {duree:2.8};
};
/* il s'effondre : les genoux, puis les mains */
S.cineChuteA = function(A, P){ var t = P.t, o = bus(A, P, .1, .5); lourd(A, t, .55, o); lourd(A, t + .32, .4, o); souffle(A, t + .05, .5, .4, 600, o); return {duree:1.4}; };
/* des pas qui descendent, au loin (l'écho de l'escalier) */
S.cinePasEchoA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.85, grotte:.8, pan:.7});
  for(var k = 0; k < 4; k++) A.pas(t + k * .42, {f:h(95, 120), bp:h(1300, 1800), g:.22 + k * .06}, o);
  return {duree:2.6};
};
/* la lanterne qui grince en se balançant */
S.cineLanterneA = function(A, P){
  var t = P.t, o = bus(A, P, .6, .5);
  [0, .55, 1.1].forEach(function(d, k){ A.ton(t + d, {type:'triangle', f:1450 + k * 60, f2:1180, gl:.32, env:[[0, 0], [.04, 1], [.35, 0]], g:.05, vib:[9, 25]}, o); });
  fer(A, t + .2, 1900, .03, o);
  return {duree:1.8};
};
/* un pas sur une marche de pierre (plus clair, plus d'écho) */
S.cinePasEscalierA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.6, grotte:.6, pan:.5});
  A.pas(t, {f:h(110, 135), bp:h(1700, 2300), g:.6}, o);
  A.pas(t + .4, {f:h(110, 135), bp:h(1700, 2300), g:.5}, o);
  return {duree:1.4};
};
/* les gardes : la cotte de mailles qui cliquette, le bout des lances sur la pierre */
S.cineArmureA = function(A, P){
  var t = P.t, o = bus(A, P, h(.2, .7), .55);
  A.joue(t, A.crepitement(.5, 90), {g:.32, filtres:[{type:'highpass', f:3200}]}, o);
  A.modes(t + .05, 2900, [[1, 1, .12], [2.4, .5, .08], [3.9, .3, .05]], {g:.04}, o);
  A.pas(t + .02, {f:120, bp:1900, g:.4}, o); A.pas(t + .3, {f:115, bp:1800, g:.35}, o);
  A.choc(t + .18, {f:500, f2:300, d:.05, g:.15, corps:1.2, corpsF:1500}, o);
  return {duree:1.2};
};
/* le gant de cuir qu'on tire, doigt après doigt */
S.cineGantA = function(A, P){
  var t = P.t, o = bus(A, P, -.1, .2);
  for(var k = 0; k < 4; k++){
    A.bruit(t + k * .42, {coul:'rose', filtres:[{type:'bandpass', f:h(1500, 2400), q:2}], env:[[0, 0], [.08, 1], [.28, 0]], g:.22}, o);
    A.ton(t + k * .42 + .05, {type:'triangle', f:h(700, 900), f2:h(1100, 1400), gl:.18, env:A.perc(.02, .16), g:.025}, o);
  }
  fouet(A, t + 1.7, .3, {f:800, f2:2200, g:.3}, o);
  return {duree:2.3};
};
/* la bague qui brille : un tintement d'argent, froid */
S.cineBagueA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.7, grotte:.3, pan:-.2});
  [2637, 3520, 4186].forEach(function(f, k){ A.ton(t + k * .07, {f:f, env:[[0, 0], [.004, 1], [1.6 - k * .3, 0]], g:.07 / (k + 1), vib:[6, 6]}, o); });
  A.ton(t, {f:622, f2:587, gl:1.6, env:[[0, 0], [.02, 1], [1.8, 0]], g:.05}, o);
  return {duree:2.4};
};
/* les lances qui s'abaissent (des souffles d'acier) */
S.cineLancesA = function(A, P){
  var t = P.t;
  [0, .08, .15, .21, .28, .33].forEach(function(d, k){ var o = bus(A, P, -.6 + k * .24, .45); fouet(A, t + d, .22, {f:1400, f2:4200, q:2, g:.35}, o); fer(A, t + d + .2, h(1800, 2600), .03, o); });
  return {duree:1.4};
};
/* les gardes s'élancent : des pas lourds, en désordre, et le métal */
S.cineGardesA = function(A, P){
  var t = P.t;
  for(var k = 0; k < 10; k++){ var o = bus(A, P, h(-.7, .7), .5); lourd(A, t + k * .17 + h(0, .05), .35 + k * .04, o); if(k % 2) A.joue(t + k * .17, A.crepitement(.2, 50), {g:.2, filtres:[{type:'highpass', f:3000}]}, o); }
  return {duree:2.4};
};
/* le coup final (le noir tombe) */
S.cineCoupA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .8);
  A.choc(t, {f:70, f2:28, d:1.2, g:1.2, sat:4, corps:2.2, corpsF:160}, o);
  fer(A, t + .01, 220, .2, o); fer(A, t + .02, 330, .1, o);
  A.bruit(t, {coul:'brun', filtres:[{type:'lowpass', f:300}], env:[[0, 0], [.05, 1], [2.4, 0]], g:.6}, o);
  return {duree:3.2};
};

/* =================== LE CRI DE LÉO (Romain, 15 novembre, 16 h 57 : « est-ce que tu peux générer un cri ? ») ===================
   Une vraie voix d'homme fabriquée : des cordes vocales (trois dents de scie un peu désaccordées, une hauteur qui tremble),
   un grognement une octave dessous, la gorge qui force (saturation), puis la bouche : quatre résonances (les « formants ») qui
   passent de « AAA » à « OOO ». Ce n'est pas une voix enregistrée : ça ne sonnera jamais tout à fait comme un vrai homme. */
var VOY = {a:[730, 1090, 2440, 3400], o:[500, 850, 2400, 3300], e:[600, 1700, 2500, 3400], ou:[350, 750, 2300, 3200]};
function rugir(A, t, d, o, dest){
  var ctx = A.ctx, f0 = o.f || 110, pts = o.hauteur || [[0, .8], [.12, 1.12], [.45, 1.22], [.8, 1.05], [1, .78]];
  var c = A.courbe(pts, d, f0), csub = A.courbe(pts, d, f0 * .5);
  var env = o.env || [[0, 0], [.07, 1], [d * .72, .88], [d, 0]], gv = o.g == null ? .5 : o.g;
  /* la source : les cordes vocales */
  var src = A.gain(1);
  [-9, 7, 16].forEach(function(det, k){
    var x = ctx.createOscillator(); x.type = 'sawtooth'; x.frequency.setValueCurveAtTime(c, t, d); x.detune.value = det;
    var j = ctx.createBufferSource(); j.buffer = A.lent; j.loop = true; j.playbackRate.value = 1.6 + k * .4;
    var jg = A.gain(f0 * (o.gigue == null ? .035 : o.gigue)); j.connect(jg); jg.connect(x.frequency);
    var xg = A.gain(k ? .55 : .7); x.connect(xg); xg.connect(src);
    x.start(t); x.stop(t + d + .05); j.start(t, h(0, 3)); j.stop(t + d + .05);
  });
  if(o.grogne){                                                       /* le grognement, une octave dessous */
    var s2 = ctx.createOscillator(); s2.type = 'square'; s2.frequency.setValueCurveAtTime(csub, t, d);
    var s2g = A.gain(o.grogne * .45); s2.connect(s2g); s2g.connect(src); s2.start(t); s2.stop(t + d + .05);
  }
  /* la gorge qui force */
  var pre = A.gain(1 + (o.force || 1.5)), w = A.sature(1 + (o.force || 1.5) * 1.6); src.connect(pre); pre.connect(w);
  /* le souffle qui passe dans la gorge */
  var souf = ctx.createBufferSource(); souf.buffer = A.rose; souf.loop = true;
  var sg = A.gain(o.souffle == null ? .35 : o.souffle); souf.connect(sg); souf.start(t, h(0, 1.5)); souf.stop(t + d + .05);
  /* la bouche : quatre résonances qui vont d'une voyelle à l'autre */
  var v1 = VOY[o.de || 'a'], v2 = VOY[o.vers || 'o'], bouche = A.gain(1), poids = [1, .62, .3, .14], qs = [5.5, 7, 10, 12];
  v1.forEach(function(f, k){
    var b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = qs[k];
    b.frequency.setValueAtTime(f, t); b.frequency.linearRampToValueAtTime(f, t + d * .4); b.frequency.linearRampToValueAtTime(v2[k], t + d * .9);
    var bg = A.gain(poids[k] * 2.6); w.connect(b); sg.connect(b); b.connect(bg); bg.connect(bouche);
  });
  var corps = ctx.createBiquadFilter(); corps.type = 'lowpass'; corps.frequency.value = 420; corps.Q.value = .8;   /* la poitrine */
  var cg = A.gain(.5); w.connect(corps); corps.connect(cg); cg.connect(bouche);
  var amp = A.gain(0), fin = A.chaine(t, bouche, [{type:'highpass', f:85, q:.7}, {type:'lowpass', f:o.lp || 6500, q:.6}]);
  fin.connect(amp); amp.connect(dest);
  A.env(amp.gain, t, env, gv);
  A.plusTard(t - ctx.currentTime + d + .5, function(){ try{ amp.disconnect(); }catch(e){} });
}
/* il prend son souffle (avant), il reprend son souffle (après) */
function inspire(A, t, d, g, dest){ A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:1100, pts:[[d, 1700]], q:1.2}], env:[[0, 0], [d * .8, 1], [d, 0]], g:g}, dest); }
function expire(A, t, d, g, dest){ A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:900, pts:[[d, 500]], q:1}], env:[[0, 0], [.04, 1], [d, 0]], g:g, rugueux:.6, rugVit:9}, dest); }

/* A — le cri de rage : un homme, gorge ouverte, « AAAAH » qui finit en « OOO » */
S.cineCriA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .7), d = 1.75;
  inspire(A, t, .32, .35, o);
  rugir(A, t + .3, d, {f:118, grogne:.35, force:1.6, g:.55}, o);
  rugir(A, t + .33, d - .05, {f:236, hauteur:[[0, .78], [.15, 1.08], [.5, 1.16], [.85, 1], [1, .76]], force:.8, souffle:.2, g:.12, lp:7500}, bus(A, P, .25, .7));   /* l'harmonique qui crie plus haut */
  expire(A, t + .3 + d - .05, .5, .25, o);
  return {duree:2.8};
};
S.cineCriA.moment = .45;
/* B — le rugissement : plus grave, plus rauque, presque une bête */
S.cineCriB = function(A, P){
  var t = P.t, o = bus(A, P, 0, .8), d = 2.1;
  inspire(A, t, .4, .4, o);
  rugir(A, t + .36, d, {f:84, grogne:.8, force:2.6, gigue:.05, de:'a', vers:'ou', g:.6, lp:5000}, o);
  rugir(A, t + .4, d - .1, {f:126, grogne:.2, force:1.8, g:.22, de:'e', vers:'o'}, bus(A, P, -.2, .8));
  A.bruit(t + .36, {coul:'brun', lp:220, env:[[0, 0], [.15, 1], [d, 0]], g:.9}, o);                  /* le grondement dans la poitrine */
  expire(A, t + .36 + d - .1, .6, .3, o);
  return {duree:3.2};
};
S.cineCriB.moment = .5;
/* C — le cri qui monte et se casse : il force jusqu'à ce que la voix déraille */
S.cineCriC = function(A, P){
  var t = P.t, o = bus(A, P, 0, .7), d = 1.9;
  inspire(A, t, .3, .35, o);
  rugir(A, t + .28, d, {f:122, hauteur:[[0, .75], [.2, 1.05], [.55, 1.3], [.62, 1.62], [.78, 1.55], [1, .9]], grogne:.45, force:2.1, gigue:.045, g:.52}, o);
  expire(A, t + .28 + d - .05, .55, .3, o);
  return {duree:2.9};
};
S.cineCriC.moment = .45;

/* =================== LE RASSEMBLEMENT AU VIEUX CHÊNE (le film « chene », Bible §12.63 ; 16 novembre) ===================
   On est DEHORS, la nuit : presque pas d'écho (rien de la grotte), des pas dans la terre et l'herbe, des voix de village. */
/* GD : la force du son en cours (réglée en tête de chaque son, d'après les mesures : la foule doit passer au-dessus de la marche) */
var GD = 1;
function dehors(A, P, pan, rev){ return A.bus(P, {g:GD, rev:rev == null ? .16 : rev, pan:pan == null ? 0 : pan}); }
function pasTerre(A, t, g, dest){ A.choc(t, {f:h(70, 95), f2:38, d:.07, g:.3 * g, sat:1.6, bruit:.5}, dest); A.bruit(t, {coul:'rose', bp:h(500, 1100), bq:.8, env:A.perc(.002, .06), g:.26 * g}, dest); }
/* une voix de villageois (une syllabe, sans paroles) : o = {f, d, voyelle, monte (1 = tout droit), g} */
function gens(A, t, o, dest){
  var f = o.f || 180, d = o.d || .4, F = A.FORMANTS[o.voyelle || 'a'];
  F.forEach(function(fm){
    A.ton(t, {type:'sawtooth', f:f, f2:f * (o.monte || 1), gl:d, det:h(-12, 12), env:o.env || [[0, 0], [.04, 1], [d * .6, .8], [d, 0]], g:(o.g == null ? .1 : o.g) * fm[1], gigue:8, vib:[5.5, f * .01],
      filtres:[{type:'bandpass', f:fm[0], q:fm[2] * .55}]}, dest);
  });
  A.bruit(t, {coul:'rose', bp:1400, bq:.7, env:o.env || [[0, 0], [.04, 1], [d * .6, .8], [d, 0]], g:(o.g == null ? .1 : o.g) * .35}, dest);
}
/* la foule en marche : beaucoup de pas dans la terre, un brouhaha, le feu des torches qui ronfle */
S.cineFouleA = function(A, P){
  GD = 3;
  var t = P.t, d = 3.4;
  for(var k = 0; k < 34; k++) pasTerre(A, t + h(0, d - .2), h(.35, .8), dehors(A, P, h(-.8, .8)));
  for(var v = 0; v < 12; v++) gens(A, t + h(.1, d - .5), {f:h(110, 240), d:h(.18, .4), voyelle:['a', 'o', 'ou'][v % 3], monte:h(.9, 1.12), g:.035}, dehors(A, P, h(-.7, .7), .25));
  A.bruit(t, {coul:'brun', bp:320, bq:.7, env:[[0, 0], [.5, 1], [d - .6, .9], [d, 0]], g:.16, rugueux:.5, rugVit:11}, dehors(A, P, 0, .2));
  return {duree:d + .3};
};
/* la foule répond : « OUAIS ! » (des voix d'hommes et de femmes, ensemble) */
S.cineClameurA = function(A, P){
  GD = 4;
  var t = P.t;
  [[118, 0], [132, .03], [150, .06], [176, .02], [220, .05], [262, .08], [294, .04], [196, .07]].forEach(function(v, k){
    gens(A, t + v[1] + h(0, .04), {f:v[0] * h(.97, 1.03), d:h(.75, 1.05), voyelle:k % 3 ? 'a' : 'o', monte:1.1, g:.085, env:[[0, 0], [.07, 1], [.45, .85], [1, 0]]}, dehors(A, P, -.7 + k * .2, .3));
  });
  for(var k = 0; k < 6; k++) pasTerre(A, t + .1 + k * .13 + h(0, .04), .6, dehors(A, P, h(-.6, .6)));
  return {duree:1.6};
};
/* la foule passe en force : des pas pressés, des épaules, un « hé ! » */
S.cineFoulePasseA = function(A, P){
  GD = 2.6;
  var t = P.t;
  for(var k = 0; k < 20; k++) pasTerre(A, t + k * .075 + h(0, .05), h(.5, .95), dehors(A, P, h(-.7, .7)));
  for(var c = 0; c < 4; c++) A.bruit(t + .1 + c * .3, {coul:'rose', filtres:[{type:'bandpass', f:h(500, 900), q:1.3}], env:A.perc(.03, .16), g:.3}, dehors(A, P, h(-.5, .5)));
  gens(A, t + .25, {f:150, d:.3, voyelle:'a', monte:1.15, g:.08}, dehors(A, P, -.3, .25));
  gens(A, t + .7, {f:205, d:.28, voyelle:'o', monte:1.1, g:.07}, dehors(A, P, .4, .25));
  gens(A, t + 1.0, {f:128, d:.34, voyelle:'a', monte:.9, g:.07}, dehors(A, P, .1, .25));
  return {duree:1.9};
};
/* la barrière de bois qui tombe dans l'herbe */
S.cineBarriereA = function(A, P){
  GD = 1;
  var t = P.t, o = dehors(A, P, .15, .2);
  bois(A, t, {f:330, f2:120, g:.8, d:.13, cf:800}, o);
  bois(A, t + .16, {f:250, f2:95, g:.7, d:.16, cf:560}, o); bois(A, t + .24, {f:420, f2:160, g:.4, d:.08, cf:1100}, o);
  A.choc(t + .2, {f:95, f2:40, d:.22, g:.5, sat:2, corps:1.5, corpsF:220}, o);
  A.bruit(t + .2, {coul:'rose', bp:900, bq:.6, env:A.perc(.01, .3), g:.3}, o);
  [.42, .55, .64].forEach(function(x, k){ bois(A, t + x, {f:h(280, 380), f2:130, g:.28 - k * .07, d:.06, cf:900}, o); });
  return {duree:1.2};
};
/* le vent de la nuit dans les feuilles du chêne */
S.cineVentA = function(A, P){
  GD = 1.7;
  var t = P.t, d = 4;
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:420, pts:[[d * .45, 900], [d, 380]], q:.7}], env:[[0, 0], [d * .4, 1], [d * .7, .6], [d, 0]], g:.22}, dehors(A, P, -.3, .25));
  A.bruit(t + .4, {coul:'blanc', filtres:[{type:'bandpass', f:3200, pts:[[d * .5, 5200], [d - .4, 2800]], q:.9}], env:[[0, 0], [d * .45, 1], [d - .4, 0]], g:.035, rugueux:.5, rugVit:7}, dehors(A, P, .4, .25));
  return {duree:d + .2};
};
/* une chouette, au loin : « hou… hou-hou » */
S.cineHibouA = function(A, P){
  GD = 1.6;
  var t = P.t, o = A.bus(P, {g:GD, rev:.6, pan:-.5});
  [[0, .5, 392], [.85, .22, 380], [1.12, .55, 372]].forEach(function(n){
    A.ton(t + n[0], {type:'sine', f:n[2], f2:n[2] * .94, gl:n[1], env:[[0, 0], [.06, 1], [n[1] * .7, .8], [n[1], 0]], g:.05, vib:[6, 5]}, o);
    A.ton(t + n[0], {type:'sine', f:n[2] * 2, f2:n[2] * 1.88, gl:n[1], env:[[0, 0], [.06, 1], [n[1], 0]], g:.008}, o);
  });
  return {duree:2.2};
};
/* l'allumette : elle gratte, elle s'enflamme */
S.cineAllumetteA = function(A, P){
  GD = 3;
  var t = P.t, o = dehors(A, P, .1, .12);
  A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:3800, pts:[[.16, 5200]], q:1.2}], env:[[0, 0], [.02, .7], [.15, 1], [.18, 0]], g:.42, rugueux:.9, rugVit:38}, o);
  A.bruit(t + .16, {coul:'rose', filtres:[{type:'bandpass', f:900, pts:[[.12, 2600], [.6, 1200]], q:.8}], env:[[0, 0], [.05, 1], [.22, .45], [.75, 0]], g:.5}, o);
  A.joue(t + .2, A.crepitement(.5, 26), {g:.16, filtres:[{type:'highpass', f:2600}]}, o);
  return {duree:1.1};
};
/* la mèche qui brûle : elle fuse, elle crépite, de plus en plus fort */
S.cineMecheA = function(A, P){
  GD = 2.4;
  var t = P.t, d = 2.45, o = dehors(A, P, .2, .1);
  A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:4200, pts:[[d, 6400]], q:1.1}], env:[[0, 0], [.08, .5], [d - .1, 1], [d, 0]], g:.2, rugueux:.8, rugVit:46}, o);
  A.joue(t, A.crepitement(d, 70), {g:.3, filtres:[{type:'highpass', f:3000}]}, o);
  A.joue(t + d * .5, A.crepitement(d * .5, 110), {g:.28, filtres:[{type:'highpass', f:2200}]}, o);
  return {duree:d + .1};
};
/* PFFFT ! le fumigène part : un grand souffle qui crache, puis qui siffle longtemps */
S.cinePffftA = function(A, P){
  GD = 1;
  var t = P.t, o = dehors(A, P, 0, .3), c = dehors(A, P, -.4, .3), d = dehors(A, P, .4, .3);
  A.choc(t, {f:120, f2:38, d:.5, g:.9, sat:3, corps:2, corpsF:200}, o);
  A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:700, pts:[[.25, 3400], [1.6, 1500], [4, 900]], q:.7}], env:[[0, 0], [.03, 1], [.5, .75], [1.8, .4], [4.2, 0]], g:.75}, o);
  A.bruit(t + .02, {coul:'rose', filtres:[{type:'bandpass', f:300, pts:[[.3, 900], [3, 420]], q:.8}], env:[[0, 0], [.05, 1], [1.2, .5], [3.4, 0]], g:.7}, c);
  A.bruit(t + .05, {coul:'blanc', hp:5200, env:[[0, 0], [.04, 1], [.9, .35], [3.6, 0]], g:.14, rugueux:.6, rugVit:30}, d);
  A.joue(t + .05, A.crepitement(1.4, 90), {g:.3, filtres:[{type:'highpass', f:2400}]}, o);
  return {duree:4.4};
};
S.cinePffftA.moment = .03;
/* tout le village retient son souffle : « OH ! » */
S.cineOhA = function(A, P){
  GD = 5;
  var t = P.t;
  for(var k = 0; k < 5; k++) inspire(A, t + h(0, .08), h(.28, .4), .3, dehors(A, P, -.6 + k * .3, .2));
  [[196, 0], [247, .04], [294, .02], [330, .06], [147, .05], [370, .08]].forEach(function(v, k){
    gens(A, t + .22 + v[1], {f:v[0], d:h(.4, .6), voyelle:'o', monte:.86, g:.075, env:[[0, 0], [.03, 1], [.2, .7], [.55, 0]]}, dehors(A, P, -.7 + k * .28, .3));
  });
  return {duree:1.2};
};
/* quelqu'un tousse dans la fumée (trois petites toux sèches) */
S.cineTouxA = function(A, P){
  GD = 3.4;
  var t = P.t, o = dehors(A, P, h(-.5, .5), .2), f = h(140, 230);
  [0, .26, .5].forEach(function(x, k){
    var g = [.9, 1, .7][k];
    A.bruit(t + x, {coul:'rose', filtres:[{type:'bandpass', f:h(800, 1100), q:.9}, {type:'peaking', f:2400, q:1.2, gain:6}], env:[[0, 0], [.012, 1], [.07, .5], [.17, 0]], g:.55 * g, rugueux:.8, rugVit:60}, o);
    gens(A, t + x, {f:f * (1 + k * .05), d:.13, voyelle:'a', monte:.8, g:.06 * g, env:[[0, 0], [.01, 1], [.13, 0]]}, o);
  });
  return {duree:1};
};
/* deux hommes qui arrivent en courant (de loin, de plus en plus près), essoufflés */
S.cineCourseA = function(A, P){
  GD = 1.8;
  var t = P.t, d = 4.2, n = 26;
  for(var k = 0; k < n; k++){
    var x = k / n, o = A.bus(P, {g:GD, rev:.3 - .18 * x, pan:(k % 2 ? .25 : -.15) * (1 - x * .5)});
    pasTerre(A, t + x * d + h(0, .02), .35 + .85 * x, o);
    if(k % 4 === 3) souffle(A, t + x * d + .05, .2, .1 + .22 * x, 800, o);
  }
  return {duree:d + .4};
};
/* tout le monde recule et s'enfuit : des pas dans tous les sens, des cris étouffés */
S.cineFouleFuitA = function(A, P){
  GD = 2.5;
  var t = P.t, d = 3.3;
  for(var k = 0; k < 44; k++){ var x = Math.pow(h(0, 1), .8); pasTerre(A, t + x * d, h(.4, .9) * (1 - x * .45), A.bus(P, {g:GD, rev:.16 + .3 * x, pan:h(-.9, .9)})); }
  [[.15, 262, 'a'], [.5, 175, 'o'], [.9, 330, 'a'], [1.4, 147, 'o'], [1.9, 247, 'a'], [2.5, 196, 'o']].forEach(function(v, k){
    gens(A, t + v[0], {f:v[1], d:h(.3, .5), voyelle:v[2], monte:h(1.05, 1.25), g:.06 * (1 - k * .1)}, A.bus(P, {g:GD, rev:.25 + k * .06, pan:h(-.8, .8)}));
  });
  for(var c = 0; c < 5; c++) A.bruit(t + h(.1, d - .6), {coul:'rose', filtres:[{type:'bandpass', f:h(500, 900), q:1.3}], env:A.perc(.03, .18), g:.25}, dehors(A, P, h(-.7, .7)));
  return {duree:d + .4};
};

/* =================== LA PUB (jeu/pub, 16 novembre) : les petits bruits du montage =================== */
/* un mot qui surgit : « pop ! » */
S.pubPopA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.08});
  A.ton(t, {type:'sine', f:420, f2:1250, gl:.07, env:A.perc(.002, .13), g:.3}, o); A.ton(t + .005, {type:'triangle', f:840, f2:2300, gl:.06, env:A.perc(.002, .07), g:.1}, o);
  A.bruit(t, {coul:'blanc', hp:5000, env:A.perc(.001, .03), g:.08}, o);
  return {duree:.25};
};
/* une image chasse l'autre : « fffiou » */
S.pubWhooshA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.12, pan:h(-.3, .3)});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:500, pts:[[.16, 3600], [.34, 900]], q:1.1}], env:[[0, 0], [.14, 1], [.36, 0]], g:.9}, o);
  A.bruit(t + .03, {coul:'blanc', filtres:[{type:'bandpass', f:2400, pts:[[.14, 7000], [.3, 2000]], q:1.6}], env:[[0, 0], [.12, 1], [.3, 0]], g:.18}, o);
  return {duree:.45};
};
/* la caméra plonge dans la tablette : ça monte, ça aspire, « tchac » */
S.pubPlongeeA = function(A, P){
  var t = P.t, d = 1.15, o = A.bus(P, {rev:.2});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:240, pts:[[d, 5200]], q:1.4}], env:[[0, 0], [d * .85, 1], [d, .2], [d + .12, 0]], g:.5}, o);
  A.ton(t, {type:'sine', f:140, f2:1500, gl:d, env:[[0, 0], [d * .9, 1], [d, 0]], g:.07, vib:[11, 14]}, o);
  A.choc(t + d, {f:150, f2:50, d:.3, g:.42, sat:2, bruit:.4}, o); A.bruit(t + d, {coul:'blanc', hp:3000, env:A.perc(.001, .25), g:.16}, o);
  return {duree:d + .5};
};
S.pubPlongeeA.moment = 1.15;
/* le titre arrive : des étincelles */
S.pubTadaA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.4});
  [1568, 1976, 2349, 3136, 2637, 3520, 4186].forEach(function(f, k){ A.ton(t + k * .045, {type:'sine', f:f, env:A.perc(.002, .5 - k * .03), g:.12}, o); });
  A.bruit(t, {coul:'blanc', hp:6500, env:[[0, 0], [.01, 1], [.5, .2], [1, 0]], g:.1, rugueux:.5, rugVit:30}, o);
  return {duree:1.2};
};

/* ---------------------------------------------------------------- 17 novembre (Romain) : les deux descentes (jeu/cine/src/film-descente.js ; Bible §13.62) — NEUFS, à écouter */
/* la grille de la crypte : le fer rouillé qui grince longtemps, puis le « clong » quand elle bute */
S.cineGrilleA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .6);
  A.ton(t, {type:'sawtooth', f:260, f2:540, gl:1.5, env:[[0, 0], [.2, 1], [1.3, .85], [1.8, 0]], g:.05, gigue:30, trem:[19, .9], sat:2, filtres:[{type:'bandpass', f:1400, q:3}, {type:'lowpass', f:2600, q:.7}]}, o);
  A.ton(t + 1.0, {type:'sawtooth', f:610, f2:300, gl:1.3, env:[[0, 0], [.15, 1], [1.0, .7], [1.4, 0]], g:.04, gigue:26, trem:[23, .9], sat:2, filtres:[{type:'bandpass', f:1900, q:4}]}, o);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:900, pts:[[1.6, 2200]], q:1.6}], env:[[0, 0], [.4, 1], [1.7, .5], [2.3, 0]], g:.2, rugueux:.9, rugVit:21}, o);
  lourd(A, t + 2.35, .8, o); fer(A, t + 2.35, 430, .22, o);
  return {duree:4};
};
/* une goutte qui tombe dans le noir, très loin : « plic… » et son écho */
S.cineGoutteA = function(A, P){
  var t = P.t, o = bus(A, P, h(-.6, .6), .9), f = h(1500, 2100);
  A.ton(t, {type:'sine', f:f, f2:f * .42, gl:.07, env:A.perc(.002, .16), g:.12}, o);
  A.ton(t + .26, {type:'sine', f:f * .96, f2:f * .4, gl:.07, env:A.perc(.002, .14), g:.05}, o);
  A.ton(t + .55, {type:'sine', f:f * .9, f2:f * .38, gl:.07, env:A.perc(.002, .12), g:.025}, o);
  return {duree:1.6};
};
/* la corde qui file entre les mains gantées : ça frotte, ça couine un peu */
S.cineCordeA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .5);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:700, pts:[[.5, 1500], [.9, 900]], q:1.2}], env:[[0, 0], [.12, 1], [.55, .8], [.9, 0]], g:.34, rugueux:.7, rugVit:24}, o);
  A.ton(t + .08, {type:'triangle', f:1800, f2:1250, gl:.7, env:[[0, 0], [.1, 1], [.7, 0]], g:.012, vib:[12, 40]}, o);
  A.pas(t + .75, {f:90, bp:900, g:.2}, o);
  return {duree:1.1};
};
/* au fond, une lueur qui chante tout bas : un accord de verre, de plus en plus clair */
S.cineLueurA = function(A, P){
  var t = P.t, o = bus(A, P, 0, .9);
  [[220, .05], [330, .045], [440.5, .04], [660, .03], [880, .02]].forEach(function(n, k){
    A.ton(t + k * .35, {type:'sine', f:n[0], env:[[0, 0], [1.6, 1], [3.2, .8], [4.4, 0]], g:n[1], vib:[4.5 + k * .3, n[0] * .004]}, o);
  });
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:500, pts:[[4, 1400]], q:.8}], env:[[0, 0], [2, 1], [4.2, 0]], g:.06}, o);
  return {duree:4.6};
};

/* ---------------------------------------------------------------- 18 novembre (Romain, 00 h 02) : les deux descentes REFAITES en 2D (jeu/cine/src/film-descente*.js ; Bible §13.68)
   « des sons de ce qu'ils font : les bruits de pas, la torche qui brûle… » — NEUFS, à écouter */
/* (un bus à son niveau : les niveaux ci-dessous ont été réglés à la mesure, le 18 novembre — personne n'a encore écouté) */
function busG(A, P, pan, rev, g){ return A.bus(P, {g:g, rev:rev == null ? .5 : rev, grotte:.4, pan:pan == null ? 0 : pan}); }
/* la torche qui brûle (3,6 s, rejouée bout à bout) : la flamme qui ronfle et bat, des crépitements */
S.cineTorcheA = function(A, P){
  var t = P.t, d = 3.8, o = busG(A, P, .15, .3, 0.42);
  A.bruit(t, {coul:'brun', filtres:[{type:'lowpass', f:520, q:.7}], env:[[0, 0], [.25, 1], [d - .4, 1], [d, 0]], g:.32, rugueux:.75, rugVit:13}, o);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:900, pts:[[d * .5, 1300], [d, 800]], q:.8}], env:[[0, 0], [.3, 1], [d - .4, .9], [d, 0]], g:.07, rugueux:.9, rugVit:19}, o);
  A.joue(t + .1, A.crepitement(d - .3, 9), {g:.2, filtres:[{type:'highpass', f:1900}]}, o);
  return {duree:d};
};
/* une étoffe qui bouge (une cape, une manche) */
S.cineEtoffeA = function(A, P){
  var t = P.t, o = busG(A, P, h(-.2, .2, 1.8), .3);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:1500, pts:[[.3, 700]], q:.8}], env:[[0, 0], [.07, 1], [.2, .5], [.42, 0]], g:.2, rugueux:.5, rugVit:30}, o);
  return {duree:.5};
};
/* la flamme qui passe (la torche qu'on déplace vite) */
S.cineSouffleFeuA = function(A, P){
  var t = P.t, o = bus(A, P, -.2, .4);
  A.bruit(t, {coul:'brun', filtres:[{type:'bandpass', f:260, pts:[[.35, 820], [.9, 340]], q:.9}], env:[[0, 0], [.3, 1], [.9, 0]], g:.5, rugueux:.6, rugVit:22}, o);
  A.joue(t + .15, A.crepitement(.5, 30), {g:.14, filtres:[{type:'highpass', f:2400}]}, o);
  return {duree:1};
};
/* un petit éclat de lumière sur du laiton */
S.cineEclatA = function(A, P){
  var t = P.t, o = busG(A, P, .2, .9, 1.4);
  [[3136, 0], [4186, .07], [5274, .16]].forEach(function(n){ A.ton(t + n[1], {type:'sine', f:n[0], env:A.perc(.004, .7), g:.022}, o); });
  return {duree:1.2};
};
/* la pierre de rune : elle chante tout bas, un accord de verre un peu faux, qui bat */
S.cineRuneA = function(A, P){
  var t = P.t, d = 3.8, o = busG(A, P, .1, .9, 0.7);
  [[293.7, .05], [440, .04], [587.3, .034], [622.3, .018], [880, .016]].forEach(function(n, k){
    A.ton(t + k * .12, {type:'sine', f:n[0], det:h(-4, 4), env:[[0, 0], [.9, 1], [d - 1.2, .85], [d, 0]], g:n[1], vib:[3.4 + k * .4, n[0] * .003], trem:[2.4, .35]}, o);
  });
  A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:5200, q:3}], env:[[0, 0], [1.2, 1], [d, 0]], g:.012}, o);
  return {duree:d + .2};
};
/* « hm ? » : une petite voix intriguée */
S.cineHmA = function(A, P){
  var t = P.t, o = busG(A, P, .15, .35, 0.6);
  voix(A, t, .34, {f:232, chute:1.3, g:.09, f1:420, f2:1100, lp:1700, souffle:.25, gigue:5, tr:.2, sat:1.2, env:[[0, 0], [.06, 1], [.24, .8], [.34, 0]]}, o);
  return {duree:.5};
};
/* un pas sur la pierre (un seul : le film les place un par un) */
S.cinePasPierreA = function(A, P){
  var t = P.t, o = A.bus(P, {rev:.5, grotte:.55, pan:h(-.25, .35)});
  A.pas(t, {f:h(92, 122), bp:h(1300, 2000), g:h(.36, .48)}, o);
  return {duree:.7};
};
/* un pas dans l'herbe, la nuit : sourd, des brins froissés */
S.cinePasHerbeA = function(A, P){
  GD = 1.5;
  var t = P.t, o = dehors(A, P, h(-.3, .3), .15);
  A.pas(t, {f:h(70, 90), bp:h(600, 900), g:.34}, o);
  A.bruit(t + .01, {coul:'blanc', filtres:[{type:'bandpass', f:h(2600, 3600), q:.8}], env:[[0, 0], [.02, 1], [.16, 0]], g:.07, rugueux:.8, rugVit:40}, o);
  return {duree:.5};
};
/* la torche lâchée dans le puits : elle file en sifflant, cogne tout en bas, loin, et roule */
S.cineChuteTorcheA = function(A, P){
  var t = P.t, o = busG(A, P, .2, .5, 0.7), loin = A.bus(P, {rev:1, grotte:1, pan:.2, g:.6});
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:1700, pts:[[1.1, 260]], q:1.3}], env:[[0, 0], [.1, 1], [.6, .5], [1.2, 0]], g:.34, rugueux:.6, rugVit:26}, o);
  bois(A, t + 1.42, {f:210, f2:80, g:.5, d:.16, cf:520}, loin); bois(A, t + 1.66, {f:260, f2:110, g:.28, d:.1, cf:700}, loin); bois(A, t + 1.82, {f:300, f2:120, g:.16, d:.08, cf:800}, loin);
  A.joue(t + 1.45, A.crepitement(.6, 30), {g:.12, filtres:[{type:'highpass', f:2200}]}, loin);
  return {duree:2.8};
};
/* la corde et le treuil qui grincent sous le poids */
S.cineCordeGrinceA = function(A, P){
  var t = P.t, o = busG(A, P, -.1, .45, 2.8);
  A.ton(t, {type:'sawtooth', f:150, f2:210, gl:.9, env:[[0, 0], [.15, 1], [.8, .8], [1.2, 0]], g:.045, gigue:22, trem:[15, .9], sat:2, filtres:[{type:'bandpass', f:820, q:2.6}, {type:'lowpass', f:1800, q:.7}]}, o);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:620, pts:[[1, 980]], q:1.6}], env:[[0, 0], [.3, 1], [1.2, 0]], g:.12, rugueux:.9, rugVit:17}, o);
  return {duree:1.5};
};
/* une petite bête qui couine */
S.cineCouinementA = function(A, P){
  var t = P.t, o = busG(A, P, h(-.6, .6, 2.8), .7);
  [0, .09, .2].forEach(function(d, k){ var f = h(3000, 3700); A.ton(t + d, {type:'triangle', f:f, f2:f * h(1.15, 1.35), gl:.05, env:[[0, 0], [.008, 1], [.05, .7], [.07, 0]], g:.03 - k * .006}, o); });
  return {duree:.6};
};
/* des petites pattes qui détalent sur la pierre, un couinement */
S.cineBetesA = function(A, P){
  var t = P.t, d = 1.3, o = busG(A, P, h(-.5, .5, 4), .6);
  A.joue(t, A.crepitement(d, 46), {g:.26, filtres:[{type:'bandpass', f:2300, q:1.2}], env:[[0, 0], [.08, 1], [d * .6, .7], [d, 0]]}, o);
  A.joue(t + .1, A.crepitement(d - .3, 30), {g:.14, filtres:[{type:'highpass', f:3600}]}, A.bus(P, {g:4, rev:.7, grotte:.8, pan:h(-.8, .8)}));
  var f = h(3100, 3600); A.ton(t + .12, {type:'triangle', f:f, f2:f * 1.25, gl:.05, env:[[0, 0], [.008, 1], [.06, 0]], g:.022}, o);
  return {duree:d + .2};
};
/* il se laisse tomber sur les dalles : les deux pieds, l'étoffe */
S.cineAtterritA = function(A, P){
  var t = P.t, o = busG(A, P, 0, .55, 0.4);
  lourd(A, t, .62, o); A.pas(t + .06, {f:105, bp:1500, g:.4}, o);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:1100, pts:[[.3, 600]], q:.8}], env:[[0, 0], [.04, 1], [.34, 0]], g:.16}, o);
  return {duree:.9};
};
/* la clé glisse dans la serrure : du fer qui frotte, un petit « tic » */
S.cineCleEntreA = function(A, P){
  var t = P.t, o = busG(A, P, .2, .4, 1.6);
  A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:3300, pts:[[.3, 4300]], q:2}], env:[[0, 0], [.04, 1], [.26, .6], [.32, 0]], g:.1, rugueux:.9, rugVit:48}, o);
  fer(A, t + .3, h(1500, 1800), .05, o);
  return {duree:.8};
};
/* la clé tourne : le pêne recule — « clac… clonk » */
S.cineCleTourneA = function(A, P){
  var t = P.t, o = busG(A, P, .2, .55, 0.55);
  A.bruit(t, {coul:'blanc', filtres:[{type:'bandpass', f:2400, q:2}], env:[[0, 0], [.03, .7], [.2, .5], [.24, 0]], g:.07, rugueux:.9, rugVit:36}, o);
  bois(A, t + .24, {f:330, f2:150, g:.5, d:.07, cf:1100}, o); fer(A, t + .24, 900, .1, o);
  lourd(A, t + .46, .6, o); fer(A, t + .46, 520, .14, o);
  return {duree:1.3};
};
/* l'air froid qui monte d'en bas : un souffle grave, une plainte lointaine */
S.cineVentCaveA = function(A, P){
  var t = P.t, d = 4.2, o = A.bus(P, {g:.8, rev:.9, grotte:1, pan:0});
  A.bruit(t, {coul:'brun', filtres:[{type:'bandpass', f:210, pts:[[d * .5, 340], [d, 190]], q:.9}], env:[[0, 0], [d * .4, 1], [d * .75, .6], [d, 0]], g:.34}, o);
  A.ton(t + .5, {type:'sine', f:176, f2:190, gl:d - 1, env:[[0, 0], [1.4, 1], [d - 1.2, .6], [d - .5, 0]], g:.016, vib:[.8, 5]}, o);
  return {duree:d + .2};
};
/* =================== LES TROIS FILMS DU DÉBUT DES ENQUÊTES (jeu/cine/src/film-debut1/2/3.js ; Bible §13.69 ; 18 novembre) — NEUFS, à écouter ===================
   Romain : « une cinématique à chaque début d'enquête, comme un générique d'épisode ». On est au village : dehors (presque pas d'écho),
   ou dans le bureau du maire (une petite pièce feutrée). */
function piece(A, P, pan, g){ return A.bus(P, {g:g == null ? 1 : g, rev:.22, pan:pan == null ? 0 : pan}); }
/* un oiseau : quelques notes très aiguës qui glissent */
function oiseau(A, t, f, n, g, dest){
  for(var k = 0; k < n; k++){ var f1 = f * h(.9, 1.15), d = h(.05, .11);
    A.ton(t + k * h(.1, .16), {type:'sine', f:f1, f2:f1 * h(.75, 1.45), gl:d, env:[[0, 0], [.008, 1], [d, 0]], g:g}, dest); }
}
/* des battements d'ailes : des petits claquements de plumes, de plus en plus loin */
function ailes(A, t, n, g, pan, P, vit){
  for(var k = 0; k < n; k++){ var x = k / n;
    A.bruit(t + k * (vit || .085) + h(0, .02), {coul:'rose', filtres:[{type:'bandpass', f:h(700, 1500), q:1.1}], env:A.perc(.008, .05), g:g * (1 - x * .7)}, A.bus(P, {g:GD, rev:.12 + .3 * x, pan:pan + x * .5})); }
}

/* ---------- ENQUÊTE 1 : « La Lanterne d'Or » ---------- */
/* la nuit dans le bureau : presque rien — un souffle très grave, un grillon très loin */
S.cineNuitA = function(A, P){
  GD = 1.6;
  var t = P.t, d = 5.6, o = dehors(A, P, 0, .3);
  A.bruit(t, {coul:'brun', filtres:[{type:'lowpass', f:260}], env:[[0, 0], [1.2, 1], [d - 1.4, 1], [d, 0]], g:.2}, o);
  for(var k = 0; k < 9; k++){ var tt = t + .5 + k * .56 + h(0, .05);
    for(var j = 0; j < 3; j++) A.ton(tt + j * .045, {type:'sine', f:4300, env:[[0, 0], [.004, 1], [.03, 0]], g:.006, trem:[60, .9]}, dehors(A, P, -.6, .5)); }
  return {duree:d + .2};
};
/* la pendule : tic… tac… (huit battements) */
S.cineTicTacA = function(A, P){
  var t = P.t, o = piece(A, P, .5, 1.5);
  for(var k = 0; k < 8; k++){ var tt = t + k * .5, f = k % 2 ? 1500 : 1900;
    A.ton(tt, {type:'square', f:f, env:A.perc(.001, .018), g:.035, filtres:[{type:'bandpass', f:f, q:6}]}, o);
    A.choc(tt, {f:420, f2:260, d:.03, g:.12, sat:1.5, corps:1.2, corpsF:900}, o); }
  return {duree:4.2};
};
/* la Lanterne d'Or : une lumière qui chante — un accord de verre, des poussières d'or qui tintent */
S.cineLanterneOrA = function(A, P){
  var t = P.t, o = A.bus(P, {g:1.5, rev:.8, pan:0});
  [[523.3, .04], [659.3, .034], [784, .03], [1046.5, .02]].forEach(function(n, k){
    A.ton(t + k * .22, {type:'sine', f:n[0], env:[[0, 0], [.9, 1], [2.2, .7], [3.4, 0]], g:n[1], vib:[4.6 + k * .4, n[0] * .003]}, o); });
  for(var k = 0; k < 9; k++) A.cloche(t + .5 + h(0, 2.2), [2093, 2637, 3136, 3520][k % 4] * h(.99, 1.01), {d:.7, g:.012, rapport:2.76, indice:.6}, o);
  return {duree:3.8};
};
/* la fenêtre : le loquet qu'on soulève, puis les battants qui grincent en s'ouvrant */
S.cineFenetreA = function(A, P){
  var t = P.t, o = piece(A, P, .2, 1.6);
  fer(A, t, 1250, .07, o); bois(A, t + .02, {f:520, f2:240, g:.3, d:.05, cf:1400}, o);
  A.ton(t + .2, {type:'sawtooth', f:330, f2:520, gl:1.0, env:[[0, 0], [.15, 1], [.8, .8], [1.2, 0]], g:.028, gigue:28, trem:[21, .9], sat:2, filtres:[{type:'bandpass', f:1500, q:3}, {type:'lowpass', f:2800, q:.7}]}, o);
  A.bruit(t + .2, {coul:'rose', filtres:[{type:'bandpass', f:800, pts:[[1, 1600]], q:1.4}], env:[[0, 0], [.3, 1], [1.2, 0]], g:.08, rugueux:.8, rugVit:18}, o);
  bois(A, t + 1.25, {f:300, f2:130, g:.3, d:.09, cf:700}, o);
  return {duree:1.8};
};
/* une main prend l'anneau de la Lanterne : un petit tintement de métal, un froissement d'étoffe */
S.cinePriseA = function(A, P){
  var t = P.t, o = piece(A, P, 0, 1.6);
  fouet(A, t, .22, {f:900, f2:2000, q:.9, g:.18}, o);
  A.cloche(t + .18, 1760, {d:.5, g:.035, rapport:2.4, indice:.8}, o); A.cloche(t + .26, 2349, {d:.4, g:.02, rapport:2.4, indice:.8}, o);
  return {duree:.9};
};
/* la lumière s'en va : le chant de verre glisse vers le grave et s'éteint, un souffle l'emporte */
S.cineLueurPartA = function(A, P){
  var t = P.t, o = A.bus(P, {g:1.5, rev:.8, pan:.3});
  [[784, .034], [1046.5, .026], [1318.5, .018]].forEach(function(n, k){
    A.ton(t + k * .05, {type:'sine', f:n[0], f2:n[0] * .5, gl:1.8, env:[[0, 0], [.1, 1], [1.2, .5], [2, 0]], g:n[1], vib:[5, n[0] * .004]}, o); });
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:1800, pts:[[1.6, 420]], q:.9}], env:[[0, 0], [.3, 1], [1.8, 0]], g:.1}, o);
  return {duree:2.2};
};
/* des pas légers et rapides sur les pavés, qui s'éloignent (on ne sait pas qui court) */
S.cineCourseLegereA = function(A, P){
  GD = 2.2;
  var t = P.t, n = 15;
  for(var k = 0; k < n; k++){ var x = k / n, o = A.bus(P, {g:GD, rev:.2 + .5 * x, pan:.15 - x * .3});
    A.pas(t + k * .155 + h(0, .012), {f:h(150, 185), bp:h(2200, 3000), g:.5 * (1 - x * .72)}, o); }
  return {duree:2.8};
};
/* la nuit passe très vite : la pendule s'emballe, un grand souffle monte, puis la lumière du matin (un accord clair) */
S.cineTempsPasseA = function(A, P){
  var t = P.t, o = piece(A, P, .4, 1.4), o2 = A.bus(P, {g:1.5, rev:.7, pan:0}), tt = 0, pas = .34;
  for(var k = 0; k < 38 && tt < 3.3; k++){ var f = k % 2 ? 1500 : 1900;
    A.ton(t + tt, {type:'square', f:f, env:A.perc(.001, .015), g:.03, filtres:[{type:'bandpass', f:f, q:6}]}, o); tt += pas; pas = Math.max(.045, pas * .9); }
  A.bruit(t + .3, {coul:'rose', filtres:[{type:'bandpass', f:300, pts:[[3.2, 2400]], q:.8}], env:[[0, 0], [2.9, 1], [3.5, 0]], g:.13}, o2);
  [[392, .03], [493.9, .028], [587.3, .026], [784, .02]].forEach(function(n, k){
    A.ton(t + 3.1 + k * .07, {type:'sine', f:n[0], env:[[0, 0], [.35, 1], [1.2, .6], [2.2, 0]], g:n[1], vib:[4.8, n[0] * .003]}, o2); });
  return {duree:5.5};
};
/* les oiseaux du matin : trois ou quatre petits chants qui se répondent */
S.cineOiseauxA = function(A, P){
  GD = 1.5;
  var t = P.t;
  [[.0, 3100, 4, -.5], [.45, 4200, 3, .4], [1.0, 2700, 5, .1], [1.7, 3800, 3, -.3], [2.2, 4500, 4, .6], [2.9, 3000, 4, -.1]].forEach(function(q){
    oiseau(A, t + q[0] + h(0, .08), q[1], q[2], .016, A.bus(P, {g:GD, rev:.35, pan:q[3]})); });
  return {duree:3.8};
};
/* la porte du bureau : la poignée, le pêne, les gonds */
S.cinePorteBureauA = function(A, P){
  var t = P.t, o = piece(A, P, -.3, 1.6);
  fer(A, t, 900, .08, o); bois(A, t + .08, {f:260, f2:120, g:.45, d:.1, cf:640}, o);
  A.ton(t + .2, {type:'sawtooth', f:210, f2:300, gl:.7, env:[[0, 0], [.1, 1], [.55, .7], [.8, 0]], g:.022, gigue:22, trem:[17, .9], sat:2, filtres:[{type:'bandpass', f:1100, q:3}]}, o);
  return {duree:1.2};
};
/* le maire arrive en chantonnant : « hm-hm, hm-hmm… » (content de sa journée) */
S.cineFredonneA = function(A, P){
  GD = 2.2;
  var t = P.t, o = piece(A, P, -.2, GD);
  [[0, 196, .2], [.26, 246.9, .2], [.52, 293.7, .34], [.98, 246.9, .2], [1.24, 293.7, .5]].forEach(function(n){
    gens(A, t + n[0], {f:n[1] * .5, d:n[2], voyelle:'ou', monte:1, g:.1, env:[[0, 0], [.04, 1], [n[2] * .7, .8], [n[2], 0]]}, o); });
  return {duree:2};
};
/* trois pas sur le parquet du bureau */
S.cinePasParquetA = function(A, P){
  var t = P.t, o = piece(A, P, -.1, 1.5);
  [0, .42, .84].forEach(function(x, k){ bois(A, t + x, {f:h(170, 210), f2:80, g:.5, d:.1, cf:h(420, 560)}, o); A.bruit(t + x, {bp:1500, bq:.9, env:A.perc(.001, .04), g:.1}, o);
    if(k === 1) A.ton(t + x + .03, {type:'sawtooth', f:480, f2:560, gl:.14, env:[[0, 0], [.03, 1], [.16, 0]], g:.008, gigue:20, filtres:[{type:'bandpass', f:1700, q:4}]}, o); });
  return {duree:1.4};
};
/* la stupeur : il retient son souffle d'un coup — et un coup sourd, comme le cœur qui tombe */
S.cineStupeurA = function(A, P){
  GD = 2.4;
  var t = P.t, o = piece(A, P, 0, GD);
  inspire(A, t, .34, .5, o);
  gens(A, t + .04, {f:140, d:.3, voyelle:'o', monte:1.25, g:.05, env:[[0, 0], [.03, 1], [.3, 0]]}, o);
  A.choc(t + .42, {f:90, f2:36, d:.5, g:.7, sat:2.4, corps:1.6, corpsF:200}, A.bus(P, {g:GD, rev:.6, pan:0}));
  return {duree:1.3};
};
/* les pigeons s'envolent du toit, d'un seul coup */
S.cineEnvolA = function(A, P){
  GD = 2.2;
  var t = P.t;
  ailes(A, t, 16, .34, -.5, P, .07); ailes(A, t + .12, 14, .3, .1, P, .08); ailes(A, t + .3, 12, .24, -.1, P, .09);
  for(var k = 0; k < 3; k++) A.ton(t + .1 + k * .35, {type:'sine', f:h(420, 520), f2:h(330, 380), gl:.2, env:[[0, 0], [.04, 1], [.22, 0]], g:.014, trem:[26, .8]}, dehors(A, P, h(-.5, .5), .4));
  return {duree:2.2};
};

/* ---------- ENQUÊTE 2 : « La rivière rouge » ---------- */
/* la rivière qui coule devant le lavoir : un courant doux, des petits clapotis */
S.cineRiviereA = function(A, P){
  GD = 1.5;
  var t = P.t, d = 7, o = dehors(A, P, 0, .2);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:900, q:.6}, {type:'lowpass', f:2600}], env:[[0, 0], [1.2, 1], [d - 1.5, 1], [d, 0]], g:.07, rugueux:.4, rugVit:3}, o);
  A.joue(t + .2, A.eau(d - .6, 16, {fmin:500, fmax:2200}), {g:.3, env:[[0, 0], [1, 1], [d - 2, 1], [d - .6, 0]]}, dehors(A, P, -.3, .25));
  return {duree:d + .2};
};
/* le coq du village : « co-co-ri-coooo ! », au loin */
S.cineCoqA = function(A, P){
  GD = 1.6;
  var t = P.t, o = A.bus(P, {g:GD, rev:.5, pan:.5});
  [[0, .13, 520, 560], [.17, .13, 600, 640], [.34, .2, 700, 780], [.58, .9, 880, 560]].forEach(function(n, k){
    A.ton(t + n[0], {type:'sawtooth', f:n[2], f2:n[3], gl:n[1], env:[[0, 0], [.02, 1], [n[1] * .7, .85], [n[1], 0]], g:.03, gigue:18, trem:[k === 3 ? 34 : 0, .5], sat:2,
      filtres:[{type:'bandpass', f:1500, q:1.6}, {type:'peaking', f:2600, q:2, gain:6}]}, o); });
  return {duree:2};
};
/* le drap plongé dans l'eau : « plouf », puis l'eau qui se referme et le linge qu'on frotte */
S.cineLingeA = function(A, P){
  GD = 1.8;
  var t = P.t, o = dehors(A, P, .1, .2);
  A.choc(t, {f:150, f2:60, d:.16, g:.4, sat:1.6}, o);
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:1300, pts:[[.5, 600]], q:.8}], env:[[0, 0], [.02, 1], [.25, .5], [.7, 0]], g:.34}, o);
  A.joue(t + .05, A.eau(1.4, 40, {fmin:500, fmax:2600}), {g:.5, env:[[0, 1], [.5, .7], [1.4, 0]]}, o);
  fouet(A, t + .8, .3, {f:500, f2:1100, q:.8, g:.2}, o); fouet(A, t + 1.2, .3, {f:1100, f2:500, q:.8, g:.18}, o);
  return {duree:1.9};
};
/* le drap ruisselle : beaucoup de gouttes, puis de moins en moins */
S.cineGouttesA = function(A, P){
  GD = 1.8;
  var t = P.t, o = dehors(A, P, 0, .25);
  A.joue(t, A.eau(1.2, 55, {fmin:700, fmax:3000}), {g:.45, env:[[0, 1], [.5, .6], [1.2, 0]]}, o);
  for(var k = 0; k < 14; k++) A.goutte(t + .2 + Math.pow(k / 14, 1.6) * 2.4 + h(0, .04), {f:h(900, 1700), g:.07 * (1 - k / 20)}, dehors(A, P, h(-.3, .3), .3));
  return {duree:3};
};
/* elle sursaute : un souffle coupé net */
S.cineSursautA = function(A, P){
  GD = 2.6;
  var t = P.t, o = dehors(A, P, 0, .15);
  inspire(A, t, .26, .55, o);
  gens(A, t + .02, {f:330, d:.22, voyelle:'a', monte:1.3, g:.05, env:[[0, 0], [.02, 1], [.22, 0]]}, o);
  return {duree:.7};
};
/* le cri de la lavandière : « AAAH ! » (une voix de femme, qui monte) */
S.cineCriFemmeA = function(A, P){
  GD = 2.6;
  var t = P.t, o = A.bus(P, {g:GD, rev:.35, pan:0});
  gens(A, t, {f:392, d:.95, voyelle:'a', monte:1.32, g:.12, env:[[0, 0], [.05, 1], [.55, .9], [.95, 0]]}, o);
  gens(A, t + .01, {f:396, d:.9, voyelle:'a', monte:1.3, g:.06, env:[[0, 0], [.05, 1], [.5, .9], [.9, 0]]}, o);
  A.bruit(t, {coul:'rose', bp:2600, bq:1, env:[[0, 0], [.05, 1], [.9, 0]], g:.03, rugueux:.6, rugVit:30}, o);
  return {duree:1.4};
};
/* le seau de bois lâché sur le quai : il cogne, il rebondit, il roule un peu */
S.cineSeauA = function(A, P){
  GD = 1.8;
  var t = P.t, o = dehors(A, P, .4, .2);
  bois(A, t, {f:260, f2:110, g:.9, d:.16, cf:480}, o); A.choc(t, {f:120, f2:55, d:.2, g:.4, sat:2}, o);
  [.24, .42, .55, .64].forEach(function(x, k){ bois(A, t + x, {f:h(280, 340), f2:130, g:.55 - k * .12, d:.09, cf:h(500, 640)}, o); });
  A.bruit(t + .7, {coul:'brun', filtres:[{type:'bandpass', f:300, q:1}], env:[[0, 0], [.1, 1], [.6, 0]], g:.2, rugueux:.9, rugVit:14}, o);
  fer(A, t + .01, 640, .05, o);
  return {duree:1.5};
};
/* le village murmure, inquiet : des voix basses qui se mêlent, sans paroles */
S.cineMurmureA = function(A, P){
  GD = 3.2;
  var t = P.t, d = 4.6;
  for(var v = 0; v < 30; v++){ var tt = t + h(0, d - .5), x = (tt - t) / d, env = Math.sin(Math.PI * Math.min(1, x * 1.15)) * .9 + .1;
    gens(A, tt, {f:h(105, 250), d:h(.14, .34), voyelle:['ou', 'o', 'a', 'ou'][v % 4], monte:h(.88, 1.08), g:.03 * env}, dehors(A, P, h(-.8, .8), .25)); }
  A.bruit(t, {coul:'rose', bp:700, bq:.6, env:[[0, 0], [.8, 1], [d - 1, .9], [d, 0]], g:.03, rugueux:.7, rugVit:9}, dehors(A, P, 0, .2));
  return {duree:d + .2};
};

/* ---------- ENQUÊTE 3 : « La lettre d'Odette » ---------- */
/* l'aube sur la place : un vent très doux, deux ou trois oiseaux qui s'éveillent */
S.cineAubeA = function(A, P){
  GD = 1.5;
  var t = P.t, d = 5.6;
  A.bruit(t, {coul:'rose', filtres:[{type:'bandpass', f:500, pts:[[d * .5, 800], [d, 450]], q:.6}], env:[[0, 0], [1.4, 1], [d - 1.6, .8], [d, 0]], g:.07}, dehors(A, P, -.2, .25));
  [[.9, 3300, 3, .5], [2.3, 4100, 4, -.4], [3.6, 2900, 3, .2], [4.5, 3700, 3, -.6]].forEach(function(q){ oiseau(A, t + q[0], q[1], q[2], .012, A.bus(P, {g:GD, rev:.4, pan:q[3]})); });
  return {duree:d + .2};
};
/* la grande porte de la mairie : le verrou, les deux vantaux lourds qui s'ouvrent */
S.cinePorteMairieA = function(A, P){
  GD = 2;
  var t = P.t, o = A.bus(P, {g:GD, rev:.35, pan:0});
  fer(A, t, 520, .12, o); lourd(A, t + .05, .5, o);
  A.ton(t + .25, {type:'sawtooth', f:150, f2:230, gl:1.1, env:[[0, 0], [.2, 1], [.9, .8], [1.3, 0]], g:.03, gigue:24, trem:[13, .9], sat:2, filtres:[{type:'bandpass', f:800, q:2.4}, {type:'lowpass', f:2000, q:.7}]}, o);
  A.bruit(t + .25, {coul:'brun', filtres:[{type:'bandpass', f:340, q:1}], env:[[0, 0], [.3, 1], [1.3, 0]], g:.2, rugueux:.9, rugVit:10}, o);
  lourd(A, t + 1.5, .4, o);
  return {duree:2.2};
};
/* une lettre qu'on déplie : le papier craque */
S.cinePapierA = function(A, P){
  GD = 2;
  var t = P.t, o = dehors(A, P, 0, .12);
  A.joue(t, A.crepitement(.5, 70), {g:.3, filtres:[{type:'highpass', f:2200}]}, o);
  fouet(A, t + .05, .2, {f:2400, f2:4200, q:.7, g:.14}, o); fouet(A, t + .42, .24, {f:3600, f2:2000, q:.7, g:.12}, o);
  A.joue(t + .5, A.crepitement(.35, 50), {g:.2, filtres:[{type:'highpass', f:2600}]}, o);
  return {duree:1.1};
};
/* tout le village souffle de soulagement : « aaah… » */
S.cineSoupirA = function(A, P){
  GD = 4;
  var t = P.t;
  for(var k = 0; k < 6; k++) expire(A, t + h(0, .12), h(.6, .9), .3, dehors(A, P, -.7 + k * .28, .2));
  [[196, 0], [247, .05], [294, .02], [165, .07], [330, .04]].forEach(function(v, k){
    gens(A, t + .05 + v[1], {f:v[0], d:h(.7, .95), voyelle:'a', monte:.8, g:.06, env:[[0, 0], [.08, 1], [.4, .6], [.9, 0]]}, dehors(A, P, -.6 + k * .3, .3)); });
  return {duree:1.5};
};
/* « HOURRA ! » : tout le village crie de joie, des mains qui claquent */
S.cineHourraA = function(A, P){
  GD = 4.5;
  var t = P.t;
  [[131, 0], [147, .04], [175, .02], [196, .06], [233, .03], [262, .07], [294, .01], [330, .05], [392, .08], [440, .04]].forEach(function(v, k){
    gens(A, t + v[1] + h(0, .05), {f:v[0] * h(.97, 1.03), d:h(1.1, 1.6), voyelle:k % 3 ? 'a' : 'o', monte:1.18, g:.08, env:[[0, 0], [.08, 1], [.8, .9], [1.5, 0]]}, dehors(A, P, -.8 + k * .18, .3)); });
  for(var c = 0; c < 22; c++) A.bruit(t + .3 + h(0, 1.6), {coul:'blanc', filtres:[{type:'bandpass', f:h(1400, 2400), q:1.4}], env:A.perc(.002, .035), g:.3}, dehors(A, P, h(-.8, .8), .2));
  return {duree:2.4};
};
/* la fête commence : des applaudissements, des rires, des « youhou ! », des pieds qui dansent */
S.cineFeteA = function(A, P){
  GD = 3.6;
  var t = P.t, d = 4.4;
  for(var c = 0; c < 90; c++){ var x = h(0, 1); A.bruit(t + x * (d - .4), {coul:'blanc', filtres:[{type:'bandpass', f:h(1300, 2600), q:1.4}], env:A.perc(.002, .03), g:.24 * (1 - x * .5)}, dehors(A, P, h(-.9, .9), .2)); }
  [[.2, 330, 1.5], [.9, 247, 1.4], [1.5, 440, 1.6], [2.2, 294, 1.3], [2.9, 392, 1.5], [3.4, 220, 1.3]].forEach(function(v, k){
    gens(A, t + v[0], {f:v[1], d:h(.3, .5), voyelle:k % 2 ? 'ou' : 'a', monte:v[2], g:.06}, dehors(A, P, h(-.7, .7), .3)); });
  /* un rire : « ha-ha-ha-ha » */
  for(var r2 = 0; r2 < 5; r2++) gens(A, t + 1.1 + r2 * .15, {f:280 - r2 * 12, d:.1, voyelle:'a', monte:.9, g:.05, env:[[0, 0], [.015, 1], [.1, 0]]}, dehors(A, P, -.4, .25));
  for(var p2 = 0; p2 < 14; p2++) pasTerre(A, t + h(.2, d - .4), h(.4, .8), dehors(A, P, h(-.8, .8)));
  return {duree:d + .2};
};
/* les cloches du clocher sonnent la fête : un carillon clair, à toute volée */
S.cineClocheJoieA = function(A, P){
  GD = 1.6;
  var t = P.t, o = A.bus(P, {g:GD, rev:.75, pan:.4});
  [392, 493.9, 587.3, 392, 659.3, 587.3, 493.9, 784, 587.3, 493.9, 392, 587.3].forEach(function(f, k){
    A.cloche(t + k * .36 + h(0, .03), f, {d:2.4, g:.05, rapport:3.5, indice:1.6}, o); A.cloche(t + k * .36, f * 2.01, {d:1.2, g:.012, rapport:2.76, indice:.8}, o); });
  return {duree:6.6};
};
/* la fête, de loin (on est au ras des pavés, avec le chat) : un brouhaha joyeux, étouffé */
S.cineFeteLoinA = function(A, P){
  GD = 2.4;
  var t = P.t, d = 3.6;
  for(var c = 0; c < 46; c++) A.bruit(t + h(0, d - .3), {coul:'blanc', filtres:[{type:'bandpass', f:h(1000, 1600), q:1.2}, {type:'lowpass', f:1800}], env:A.perc(.003, .035), g:.14}, A.bus(P, {g:GD, rev:.6, pan:h(-.7, .7)}));
  for(var v = 0; v < 12; v++) gens(A, t + h(0, d - .5), {f:h(150, 330), d:h(.2, .4), voyelle:['a', 'o', 'ou'][v % 3], monte:h(1.05, 1.3), g:.022}, A.bus(P, {g:GD, rev:.6, pan:h(-.7, .7)}));
  return {duree:d + .3};
};
/* Moustache : « miaou ? » (un petit miaulement qui monte, puis redescend) */
S.cineMiaouA = function(A, P){
  GD = 2.6;
  var t = P.t, o = dehors(A, P, .1, .18), d = .62;
  [[1, .05], [2, .03], [3, .012]].forEach(function(m){
    A.ton(t, {type:'sawtooth', f:520 * m[0], pts:null, f2:760 * m[0], gl:d * .45, env:[[0, 0], [.06, 1], [d * .5, .9], [d, 0]], g:m[1] * .5, vib:[7, 9 * m[0]], vibRetard:.2,
      filtres:[{type:'bandpass', f:1400, pts:[[d * .45, 2300], [d, 1100]], q:2.2}]}, o);
    A.ton(t + d * .45, {type:'sawtooth', f:760 * m[0], f2:540 * m[0], gl:d * .55, env:[[0, 0], [.03, 1], [d * .35, .7], [d * .55, 0]], g:m[1] * .5, vib:[7, 9 * m[0]],
      filtres:[{type:'bandpass', f:2300, pts:[[d * .55, 1100]], q:2.2}]}, o); });
  return {duree:.9};
};
})(window);
