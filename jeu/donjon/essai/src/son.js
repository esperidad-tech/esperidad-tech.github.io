/* Les bruitages de la salle des rats : tout est fabriqué avec Web Audio, sans aucun fichier.
   Ils démarrent au premier toucher (le bouton « Descendre ») ; un bouton les coupe. Ce n'est pas une voix :
   la voix du conteur reste seulement sur les boutons 🔊. */
(function(){
'use strict';
var S = window.SALLE = window.SALLE || {};
var ctx = null, sortie, bruits, amb, revIn, blanc, brun, actif = true, ambianceLancee = false;
try{ actif = localStorage.getItem('salle-rats-son') !== 'non'; }catch(e){}

function hasard(a, b){ return a + Math.random() * (b - a); }

/* ---------- le montage : bruitages + réverbération de souterrain + ambiance ---------- */
function impulsion(duree, pente){
  var n = Math.floor(ctx.sampleRate * duree), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for(var c = 0; c < 2; c++){
    var d = b.getChannelData(c), lp = 0;
    for(var i = 0; i < n; i++){
      var x = Math.random() * 2 - 1;
      lp = lp + (x - lp) * (0.25 + 0.6 * (1 - i / n));     /* les échos s'assombrissent en s'éteignant */
      d[i] = lp * Math.pow(1 - i / n, pente) * (i < ctx.sampleRate * .012 ? i / (ctx.sampleRate * .012) : 1);
    }
  }
  return b;
}
function demarrer(){
  var AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  if(!ctx){
    try{ ctx = new AC(); }catch(e){ ctx = null; return; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .2;
    comp.connect(ctx.destination);
    sortie = ctx.createGain(); sortie.gain.value = actif ? 1 : 0; sortie.connect(comp);
    bruits = ctx.createGain(); bruits.gain.value = .85; bruits.connect(sortie);
    var rev = ctx.createConvolver(); rev.buffer = impulsion(2.8, 2.6);
    var revG = ctx.createGain(); revG.gain.value = .55; rev.connect(revG); revG.connect(sortie);
    revIn = ctx.createGain(); revIn.connect(rev);
    amb = ctx.createGain(); amb.gain.value = 1; amb.connect(sortie);
    var n = ctx.sampleRate * 2;
    blanc = ctx.createBuffer(1, n, ctx.sampleRate); brun = ctx.createBuffer(1, n, ctx.sampleRate);
    var db = blanc.getChannelData(0), dr = brun.getChannelData(0), l = 0;
    for(var i = 0; i < n; i++){ var w = Math.random() * 2 - 1; db[i] = w; l = (l + .02 * w) / 1.02; dr[i] = l * 3.5; }
  }
  if(ctx.state === 'suspended'){ try{ ctx.resume(); }catch(e){} }
  if(!ambianceLancee){ ambianceLancee = true; ambiance(); }
}
function pret(){ return !!ctx && actif && ctx.state !== 'closed'; }
function t0(dt){ return ctx.currentTime + (dt || 0) + .01; }
/* une sortie : sec vers les bruitages, et un peu (ou beaucoup) dans la réverbération */
function bus(humide, vers){
  var g = ctx.createGain(); g.connect(vers || bruits);
  var h = ctx.createGain(); h.gain.value = humide == null ? .25 : humide; g.connect(h); h.connect(revIn);
  return g;
}
function enveloppe(g, t, gain, a, d, tenue){
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(gain, .0002), t + a);
  if(tenue) g.gain.setValueAtTime(Math.max(gain, .0002), t + a + tenue);
  g.gain.exponentialRampToValueAtTime(.0001, t + a + (tenue || 0) + d);
}
/* un oscillateur (o.f2 : glissando ; o.lp : filtre ; o.vib : vibrato [vitesse, ampleur]) */
function ton(t, o, dest){
  var x = ctx.createOscillator(), g = ctx.createGain(), fin = t + (o.a || .005) + (o.tenue || 0) + o.d;
  x.type = o.type || 'sine';
  x.frequency.setValueAtTime(o.f, t);
  if(o.pts) o.pts.forEach(function(p){ x.frequency.linearRampToValueAtTime(p[1], t + p[0]); });
  if(o.f2) x.frequency.exponentialRampToValueAtTime(o.f2, t + (o.gl || o.d));
  if(o.det) x.detune.value = o.det;
  if(o.vib){ var v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = o.vib[0]; vg.gain.value = o.vib[1]; v.connect(vg); vg.connect(x.frequency); v.start(t); v.stop(fin + .05); }
  enveloppe(g, t, o.g, o.a || .005, o.d, o.tenue);
  var src = x;
  if(o.lp){ var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o.lp, t); if(o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t + (o.lpt || o.d)); f.Q.value = o.lq || .7; x.connect(f); src = f; }
  src.connect(g); g.connect(dest);
  x.start(t); x.stop(fin + .05);
  return x;
}
/* un souffle de bruit filtré (o.type : bandpass, lowpass, highpass ; o.f2 : balayage du filtre) */
function souffle(t, o, dest){
  var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = o.brun ? brun : blanc; s.loop = true;
  f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f, t);
  if(o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + (o.gl || o.d));
  f.Q.value = o.q || 1;
  enveloppe(g, t, o.g, o.a || .003, o.d, o.tenue);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t, Math.random() * 1.5); s.stop(t + (o.a || .003) + (o.tenue || 0) + o.d + .05);
  return g;
}
/* une corde pincée (Karplus-Strong) : la corde de l'arc */
function corde(t, f, duree, gain, dest){
  var d = ctx.createDelay(1), fb = ctx.createGain(), lp = ctx.createBiquadFilter(), out = ctx.createGain();
  d.delayTime.value = 1 / f; fb.gain.value = .985; lp.type = 'lowpass'; lp.frequency.value = 2600;
  var ex = ctx.createBufferSource(); ex.buffer = blanc;
  var eg = ctx.createGain(); eg.gain.setValueAtTime(gain, t); eg.gain.setValueAtTime(0, t + 2 / f);
  ex.connect(eg); eg.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); d.connect(out); out.connect(dest);
  out.gain.setValueAtTime(1, t); out.gain.exponentialRampToValueAtTime(.0001, t + duree);
  fb.gain.setValueAtTime(.985, t + duree); fb.gain.linearRampToValueAtTime(0, t + duree + .05);
  ex.start(t); ex.stop(t + .05);
  setTimeout(function(){ try{ d.disconnect(); fb.disconnect(); out.disconnect(); }catch(e){} }, (duree + .3) * 1000 + (t - ctx.currentTime) * 1000);
}

/* =================== les bruitages =================== */
var B = {};
/* la course des héros : des bottes sur la pierre */
B.pasHeros = function(duree, n){
  var o = bus(.3), t = t0(), k = 0;
  n = n || 1;
  for(var x = 0; x < duree; x += .15 / Math.max(1, n * .7)){
    var tt = t + x + hasard(0, .02), fort = Math.min(1, .35 + x / duree);
    ton(tt, {f:hasard(95, 125), f2:48, d:.09, g:.22 * fort}, o);
    souffle(tt, {type:'bandpass', f:hasard(1400, 2200), q:.9, d:.05, g:.1 * fort}, o);
    if(k++ % 3 === 0) souffle(tt + .02, {type:'highpass', f:5200, d:.03, g:.025 * fort}, o);   /* les boucles de ceinture */
  }
};
/* la course des rats : des griffes qui cliquettent, vite */
B.pasRats = function(duree){
  var o = bus(.3), t = t0();
  for(var x = 0; x < duree; x += hasard(.035, .06)){
    souffle(t + x, {type:'highpass', f:hasard(3200, 5200), d:hasard(.01, .02), g:hasard(.03, .08)}, o);
    if(Math.random() < .25) souffle(t + x, {type:'bandpass', f:900, q:2, d:.02, g:.04}, o);
  }
};
/* un couinement de rat (h : la hauteur) */
B.couine = function(dt, h, long){
  if(!pret()) return;
  var o = bus(.35), t = t0(dt); h = h || 1; long = long || 1;
  var f = hasard(2100, 2700) * h;
  ton(t, {type:'sine', f:f * .8, pts:[[.04 * long, f * 1.18], [.13 * long, f * .92]], d:.16 * long, a:.012, g:.09, vib:[hasard(24, 34), f * .05]}, o);
  ton(t, {type:'triangle', f:f * 1.6, pts:[[.04 * long, f * 2.3], [.13 * long, f * 1.8]], d:.12 * long, a:.012, g:.025}, o);
};
/* le claquement de mâchoire */
B.machoire = function(dt){
  if(!pret()) return;
  var o = bus(.2), t = t0(dt);
  [0, .05].forEach(function(x){
    souffle(t + x, {type:'bandpass', f:2900, q:4, d:.016, g:.45}, o);
    ton(t + x, {type:'square', f:hasard(480, 560), d:.03, g:.05, lp:1400}, o);
  });
  souffle(t + .07, {type:'lowpass', f:1200, f2:300, d:.1, g:.22}, o);
};
/* la corde de l'arc, puis le sifflement de la flèche */
B.arc = function(){
  if(!pret()) return;
  var o = bus(.25), t = t0();
  corde(t, 104, 1.1, .7, o);
  souffle(t, {type:'bandpass', f:420, q:1.5, d:.06, g:.28}, o);
  souffle(t + .04, {type:'bandpass', f:3600, f2:900, q:9, a:.06, d:.32, g:.28}, bus(.15));
};
/* un coup qui porte (force de 0,5 à 1,5) */
B.impact = function(force, dt){
  if(!pret()) return;
  force = force || 1;
  var o = bus(.3), t = t0(dt);
  ton(t, {f:170, f2:42, d:.22, g:.55 * force}, o);
  souffle(t, {type:'lowpass', f:1100, f2:180, d:.16, g:.4 * force}, o);
  souffle(t, {type:'bandpass', f:2600, q:1, d:.025, g:.22 * force}, o);
};
/* une morsure sur un héros (le choc mou) */
B.morsure = function(dt){
  if(!pret()) return;
  var o = bus(.2), t = t0(dt);
  ton(t, {f:120, f2:55, d:.14, g:.4}, o);
  souffle(t, {type:'lowpass', f:700, d:.1, g:.25}, o);
};
/* le verre qui se brise */
B.verre = function(dt){
  if(!pret()) return;
  var o = bus(.45), t = t0(dt);
  ton(t, {f:4300, d:.09, g:.12}, o);
  souffle(t, {type:'highpass', f:4800, d:.13, g:.22}, o);
  for(var k = 0; k < 11; k++) ton(t + hasard(0, .22), {f:hasard(2500, 8200), d:hasard(.08, .45), g:hasard(.025, .08)}, o);
  souffle(t + .05, {type:'bandpass', f:3600, q:2.5, d:.3, g:.06}, o);
};
/* le feu qui prend, puis crépite (duree) */
B.feu = function(duree, dt){
  if(!pret()) return;
  var o = bus(.3), t = t0(dt); duree = duree || 1.6;
  souffle(t, {type:'bandpass', f:260, f2:2400, q:.8, a:.08, d:.5, g:.3}, o);
  souffle(t, {brun:true, type:'lowpass', f:520, a:.15, tenue:duree * .6, d:duree * .4, g:.22}, o);
  for(var x = 0; x < duree; x += hasard(.02, .07)) souffle(t + x, {type:'bandpass', f:hasard(1200, 5200), q:2, d:hasard(.005, .02), g:hasard(.04, .2) * (1 - x / duree * .6)}, o);
};
/* la brûlure qui revient au tour des rats : un petit souffle et des crépitements */
B.brule = function(dt){ if(!pret()) return; B.feu(.7, dt); };
/* le BONG de la louche : une cloche de métal aux harmoniques tordues */
B.bong = function(){
  if(!pret()) return;
  var o = bus(.55), t = t0(), f = 176;
  souffle(t, {type:'bandpass', f:1300, q:1, d:.04, g:.45}, o);
  ton(t, {f:95, f2:58, d:.16, g:.45}, o);
  [[1, .5, 2.6], [2.0, .2, 1.6], [2.76, .3, 1.9], [4.07, .14, 1.1], [5.4, .12, .8], [6.8, .06, .5], [8.2, .04, .35]].forEach(function(p){
    ton(t, {f:f * p[0], d:p[2], g:p[1] * .5, a:.002}, o);
    ton(t, {f:f * p[0] * 1.004, d:p[2] * .9, g:p[1] * .3, a:.002}, o);
  });
};
/* la toux (h : la hauteur ; les rats toussent aigu) */
B.toux = function(dt, h){
  if(!pret()) return;
  var o = bus(.3), t = t0(dt); h = h || 1;
  [[0, 1], [.2, .7]].forEach(function(p){
    souffle(t + p[0], {type:'bandpass', f:950 * h, q:1.6, a:.008, d:.15, g:.38 * p[1]}, o);
    souffle(t + p[0], {type:'bandpass', f:2500 * h, q:3, a:.008, d:.11, g:.12 * p[1]}, o);
    ton(t + p[0], {type:'sawtooth', f:180 * h, f2:120 * h, d:.12, g:.03 * p[1], lp:900}, o);
  });
};
/* le « splotch » de la colle */
B.splotch = function(dt){
  if(!pret()) return;
  var o = bus(.25), t = t0(dt);
  souffle(t, {type:'lowpass', f:2600, f2:160, q:3, d:.26, g:.5}, o);
  ton(t, {f:430, f2:62, d:.2, g:.38}, o);
  for(var k = 0; k < 4; k++) ton(t + .1 + k * .07, {f:hasard(260, 420), f2:hasard(600, 800), gl:.04, d:.06, g:.07}, o);
};
/* le scintillement magique (la lumière, la rune) */
B.magie = function(dt){
  if(!pret()) return;
  var o = bus(.8), t = t0(dt);
  [1046.5, 1318.5, 1568, 2093, 2637, 3136, 4186].forEach(function(f, k){
    ton(t + k * .045, {type:'triangle', f:f, d:.9, g:.05}, o);
    ton(t + k * .045, {f:f * 2, d:.5, g:.015}, o);
  });
  var g = souffle(t, {type:'highpass', f:6500, a:.1, d:.9, g:.06}, o);
  var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.type = 'square'; lfo.frequency.value = 17; lg.gain.value = .03; lfo.connect(lg); lg.connect(g.gain); lfo.start(t); lfo.stop(t + 1.1);
};
/* le dôme du bouclier qui se forme */
B.dome = function(){
  if(!pret()) return;
  var o = bus(.6), t = t0();
  ton(t, {f:170, f2:520, gl:.55, d:1.3, a:.05, g:.14}, o);
  ton(t, {f:173, f2:527, gl:.55, d:1.2, a:.05, g:.1}, o);
  [523.3, 784, 1046.5, 1568].forEach(function(f, k){ ton(t + .2 + k * .03, {f:f, a:.25, d:1.4, g:.045}, o); });
  souffle(t, {type:'bandpass', f:380, f2:1700, q:.8, a:.1, d:.45, g:.12}, o);
};
/* le dôme qui encaisse une morsure */
B.absorbe = function(dt){
  if(!pret()) return;
  var o = bus(.6), t = t0(dt);
  ton(t, {f:1568, d:.6, g:.08}, o); ton(t, {f:2093, d:.5, g:.05}, o); ton(t, {f:784, d:.4, g:.06}, o);
  souffle(t, {type:'bandpass', f:1200, q:3, d:.15, g:.12}, o);
};
/* le GROS boum du critique */
B.boum = function(){
  if(!pret()) return;
  var o = bus(.7), t = t0();
  souffle(t, {type:'highpass', f:1500, d:.06, g:.7}, o);
  ton(t, {f:130, f2:30, gl:1, d:1.5, a:.002, g:1}, o);
  ton(t, {type:'triangle', f:65, f2:28, gl:1.2, d:1.6, g:.4}, o);
  souffle(t, {type:'lowpass', f:2600, f2:110, gl:1.3, d:1.7, a:.003, g:.85}, o);
  souffle(t + .05, {brun:true, type:'lowpass', f:240, d:2.4, a:.08, g:.55}, o);
  for(var k = 0; k < 14; k++) souffle(t + hasard(.03, .5), {type:'bandpass', f:hasard(1500, 6000), q:2, d:hasard(.01, .04), g:hasard(.05, .18)}, o);
};
/* l'aspiration juste avant le critique (le ralenti) */
B.aspire = function(){
  if(!pret()) return;
  var o = bus(.4), t = t0();
  souffle(t, {type:'bandpass', f:300, f2:3000, q:2, a:.28, d:.04, g:.22}, o);
  ton(t, {f:220, f2:880, gl:.3, a:.25, d:.05, g:.05}, o);
};
/* la fuite d'un rat : un couinement qui file, et ses griffes */
B.fuiteRat = function(){
  if(!pret()) return;
  var o = bus(.35), t = t0();
  ton(t, {f:3400, pts:[[.08, 3900], [.4, 1700]], d:.45, a:.01, g:.1, vib:[30, 220]}, o);
  ton(t + .5, {f:3000, pts:[[.25, 1500]], d:.3, a:.01, g:.06, vib:[30, 180]}, o);
  B.pasRats(.9);
};
/* la rage : un grondement et des cris */
B.rage = function(){
  if(!pret()) return;
  var o = bus(.35), t = t0();
  var x = ton(t, {type:'sawtooth', f:105, f2:85, d:.7, a:.05, g:.16, lp:900}, o);
  var am = ctx.createOscillator(), ag = ctx.createGain(); am.frequency.value = 23; ag.gain.value = 40; am.connect(ag); ag.connect(x.frequency); am.start(t); am.stop(t + .8);
  for(var k = 0; k < 3; k++) B.couine(.12 + k * .16, 1.25, .8);
};
/* le Sage tourne une page */
B.page = function(){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  souffle(t, {type:'bandpass', f:2400, f2:4800, q:1, d:.08, g:.16}, o);
  souffle(t + .1, {type:'bandpass', f:2000, f2:4200, q:1, d:.09, g:.12}, o);
};
/* les bulles de la potion qu'on prépare */
B.bulles = function(duree){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  for(var x = 0; x < (duree || .45); x += hasard(.03, .07)) ton(t + x, {f:hasard(180, 420), f2:hasard(500, 900), gl:.04, d:.05, g:hasard(.04, .09)}, o);
};
/* ce qui vole (la fiole, les herbes) */
B.vole = function(duree){
  if(!pret()) return;
  souffle(t0(), {type:'bandpass', f:500, f2:1900, q:1.2, a:(duree || .4) * .5, d:(duree || .4) * .5, g:.12}, bus(.2));
};
/* la dague : un sifflement et la lame */
B.dague = function(){
  if(!pret()) return;
  var o = bus(.25), t = t0();
  souffle(t, {type:'bandpass', f:900, f2:5200, q:3, d:.16, g:.32}, o);
  ton(t + .1, {f:2900, d:.18, g:.05}, o); ton(t + .1, {f:4100, d:.12, g:.03}, o);
};
/* un soin : une petite montée claire */
B.soin = function(){
  if(!pret()) return;
  var o = bus(.6), t = t0();
  [784, 988, 1175, 1568, 1976].forEach(function(f, k){ ton(t + k * .07, {type:'triangle', f:f, d:.55, g:.055}, o); });
};
/* le Cœur vaillant : un battement, puis la montée */
B.coeur = function(){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  [0, .16, .55, .71].forEach(function(x, k){ ton(t + x, {f:k % 2 ? 52 : 62, f2:40, d:.14, g:.6}, o); });
  setTimeout(B.soin, 900);
};
/* un héros tombe */
B.tombe = function(){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  ton(t, {f:95, f2:38, d:.28, g:.55}, o);
  souffle(t, {type:'lowpass', f:450, d:.22, g:.32}, o);
  souffle(t + .03, {type:'bandpass', f:1600, d:.14, g:.07}, o);
};
/* la petite fanfare de victoire */
B.fanfare = function(){
  if(!pret()) return;
  var o = bus(.45), t = t0();
  function cuivre(tt, f, d, g){
    [-7, 7].forEach(function(det){ ton(tt, {type:'sawtooth', f:f, det:det, a:.03, tenue:d * .6, d:d * .4 + .15, g:g, lp:700, lp2:3200, lpt:.08, lq:1.5}, o); });
  }
  [[0, 392, .12], [.14, 523.3, .12], [.28, 659.3, .12], [.42, 784, .3]].forEach(function(n){ cuivre(t + n[0], n[1], n[2], .07); });
  [523.3, 659.3, 784, 1046.5].forEach(function(f){ cuivre(t + .8, f, 1.3, .05); });
  ton(t + .8, {f:98, f2:60, d:.4, g:.5}, o);
  setTimeout(function(){ B.magie(); }, 850);
};
/* un petit toc de doigt (choisir) */
B.clic = function(){
  if(!pret()) return;
  ton(t0(), {f:1250, f2:900, d:.045, g:.035}, bus(.15));
};

/* =================== l'ambiance du souterrain : gouttes et souffle =================== */
function ambiance(){
  /* le souffle : un bruit sourd qui respire tout doucement */
  var s = ctx.createBufferSource(); s.buffer = brun; s.loop = true;
  var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 340; f.Q.value = .6;
  var g = ctx.createGain(); g.gain.value = .045;
  var l1 = ctx.createOscillator(), l1g = ctx.createGain(); l1.frequency.value = .055; l1g.gain.value = 140; l1.connect(l1g); l1g.connect(f.frequency);
  var l2 = ctx.createOscillator(), l2g = ctx.createGain(); l2.frequency.value = .09; l2g.gain.value = .022; l2.connect(l2g); l2g.connect(g.gain);
  s.connect(f); f.connect(g); g.connect(amb);
  s.start(); l1.start(); l2.start();
  /* les gouttes qui tombent quelque part, loin */
  function goutte(){
    if(ctx && actif && ctx.state === 'running'){
      var o = bus(.9, amb), t = t0(), fr = hasard(850, 1700);
      ton(t, {f:fr, f2:fr * 2.3, gl:.025, d:.08, g:hasard(.02, .05)}, o);
      if(Math.random() < .3) ton(t + .2, {f:fr * 1.2, f2:fr * 2.6, gl:.02, d:.06, g:.015}, o);
    }
    setTimeout(goutte, hasard(1300, 4600));
  }
  setTimeout(goutte, 1200);
}

S.Son = {
  demarrer:demarrer,
  actif:function(){ return actif; },
  basculer:function(){
    actif = !actif;
    try{ localStorage.setItem('salle-rats-son', actif ? 'oui' : 'non'); }catch(e){}
    if(ctx) sortie.gain.setTargetAtTime(actif ? 1 : 0, ctx.currentTime, .05);
    return actif;
  },
  jouer:function(nom){
    if(!pret() || !B[nom]) return;
    try{ B[nom].apply(null, Array.prototype.slice.call(arguments, 1)); }catch(e){ if(window.console) console.warn('son', nom, e); }
  },
  liste:Object.keys(B),
  etat:function(){ return ctx ? ctx.state : 'pas encore'; }
};
})();
