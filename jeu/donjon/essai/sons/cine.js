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
})(window);
