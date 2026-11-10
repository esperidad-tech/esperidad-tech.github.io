
/* ============ Les sons du labo : de petits sons discrets, fabriqués par le programme (comme ceux du jeu) ============
   Mêmes briques que moteur-base.js (note, tendre, bruit) : chaque son se recopie tel quel dans le jeu.
   Rien ne joue avant le premier toucher (les navigateurs l'interdisent), et le bouton 🔈 des réglages coupe tout. */
var SON = {actif:true, ctx:null};
try { if(localStorage.getItem('brumeval-labo-son') === 'non') SON.actif = false; } catch(e){}
function audio(){
  if(!SON.ctx){ try { SON.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ SON.ctx = null; } }
  if(SON.ctx && SON.ctx.state === 'suspended') try { SON.ctx.resume(); } catch(e){}
  return SON.ctx;
}
function note(f, t0, duree, type, vol, glisse){
  var a = audio(); if(!a) return; var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + duree + 0.05);
}
/* Une note douce : attaque arrondie, fin en fondu ; un triangle passe par un filtre (son chaud, sans aigus durs) */
function tendre(f, t0, duree, vol, glisse, att, type, filtre){
  var a = audio(); if(!a) return; var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
  g.connect(a.destination); o.start(t); o.stop(t + duree + 0.03);
}
/* Un souffle : du bruit filtré dont la hauteur glisse de f0 à f1 (un tiroir qui coulisse, une loupe qui passe, une allumette) */
function souffle(t0, duree, vol, f0, f1, q, type){
  var a = audio(); if(!a) return; var t = a.currentTime + t0, n = Math.floor(a.sampleRate*duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for(var i = 0; i < n; i++) d[i] = Math.random()*2 - 1;
  var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf;
  f.type = type || 'bandpass'; f.Q.value = q || 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1 || f0, t + duree);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.06, duree*.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + duree + .02);
}
/* De tout petits grains secs (la craie, la poudre, le feu qui crépite) */
function grains(t0, duree, vol, nb, passeHaut){
  var a = audio(); if(!a) return; var t = a.currentTime + t0, sr = a.sampleRate, n = Math.floor(sr*duree), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
  for(var k = 0; k < nb; k++){ var c = Math.floor(n*Math.random()*.9), l = Math.floor(sr*(.001 + Math.random()*.004)), v = .4 + Math.random()*.6; for(var j = 0; j < l && c + j < n; j++) d[c + j] += (Math.random()*2 - 1)*v*(1 - j/l); }
  var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = passeHaut || 2400; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + duree + .02);
}
var SONS = {
  /* toucher */
  clic:function(){ tendre(523, 0, .055, .04, 440, .005); },                                                   /* un « toc » tout doux */
  choisir:function(){ tendre(587, 0, .07, .04, 660, .006); tendre(880, .05, .1, .022, null, .008); },          /* on choisit ce qu'on analyse */
  non:function(){ tendre(300, 0, .09, .045, 262, .01, 'triangle', 900); tendre(262, .09, .12, .04, 233, .01, 'triangle', 800); },   /* cet outil ne sert pas ici */
  recule:function(){ souffle(0, .16, .02, 900, 420, .7); },                                                     /* on revient d'un pas */
  /* la loupe */
  loupe:function(){ souffle(0, .5, .022, 500, 1500, .7); tendre(1568, .56, .22, .022, null, .004); tendre(2349, .57, .16, .008, null, .004); },   /* elle s'envole, puis le verre tinte en se posant */
  zoom:function(){ souffle(0, .45, .018, 380, 1100, .6); },
  dezoom:function(){ souffle(0, .4, .018, 1100, 380, .6); },
  /* les tiroirs */
  tiroirOuvre:function(){ souffle(0, .38, .05, 260, 520, 1.1, 'lowpass'); tendre(150, .36, .09, .06, 110, .004, 'triangle', 600); grains(.02, .32, .012, 14, 1800); },
  tiroirFerme:function(){ souffle(0, .3, .045, 520, 240, 1.1, 'lowpass'); tendre(130, .28, .11, .075, 90, .004, 'triangle', 500); },
  casier:function(){ tendre(330, 0, .07, .05, 262, .005, 'triangle', 1000); grains(0, .08, .014, 6, 2600); },   /* on fouille un casier */
  carte:function(){ souffle(0, .1, .03, 2400, 3600, .8); tendre(740, .03, .05, .014, null, .004); },             /* un échantillon glisse sous la loupe */
  compare:function(){ tendre(660, 0, .7, .012, 1320, .2); tendre(990, .1, .6, .006, 1980, .2); },                /* le rai de lumière passe */
  bon:function(){ tendre(660, 0, .12, .07, null, .01, 'triangle', 2600); tendre(990, .09, .2, .07, null, .01, 'triangle', 2800); tendre(1320, .2, .28, .03, null, .012); },
  faux:function(){ tendre(330, 0, .13, .055, 294, .01, 'triangle', 1100); tendre(247, .1, .2, .05, 220, .01, 'triangle', 900); },
  /* les bocaux, les gouttes, la poudre */
  pipette:function(){ tendre(520, 0, .09, .03, 880, .01); },                                                     /* la pipette aspire */
  goutte:function(){ tendre(1500, 0, .05, .05, 760, .003); tendre(620, .045, .12, .035, 300, .004); },          /* ploc */
  chaud:function(){ souffle(0, .5, .016, 5200, 3000, .6, 'highpass'); },                                         /* pschh, l'eau chaude */
  poudre:function(){ grains(0, .3, .03, 30, 3200); },
  bulles:function(){ for(var i = 0; i < 7; i++){ var f = 700 + Math.random()*900; tendre(f, i*.09 + Math.random()*.04, .06, .022, f*1.5, .005); } },
  taches:function(){ tendre(392, 0, .3, .02, 330, .05); },                                                       /* la tache s'étale */
  /* la bougie */
  pince:function(){ tendre(2200, 0, .03, .014, null, .002); tendre(2600, .05, .03, .012, null, .002); },        /* tic-tic de la pince */
  flamme:function(){ souffle(0, .5, .03, 300, 900, .5, 'lowpass'); grains(.1, 1, .018, 22, 1600); },             /* le feu grossit et crépite */
  /* le microscope */
  molette:function(){ [0, .06, .12].forEach(function(t, i){ tendre(1400 - i*90, t, .03, .028, null, .002, 'triangle', 3000); }); souffle(.02, .2, .01, 800, 1700, .8); },
  tropPetit:function(){ tendre(392, 0, .1, .04, 349, .01, 'triangle', 1200); },
  prise:function(){ tendre(2200, 0, .03, .016, null, .002); tendre(1175, .04, .08, .02, 1568, .006); },         /* la pince attrape un grain */
  coupelle:function(){ tendre(2093, 0, .16, .03, null, .003); tendre(3136, .005, .1, .012, null, .003); },      /* le grain tinte dans le verre */
  acarien:function(){ [0, .05, .1, .15].forEach(function(t, i){ tendre(1200 + i*150, t, .03, .014, null, .003); }); },
  /* le test des couleurs */
  monte:function(){ tendre(294, 0, 2.6, .012, 587, .4); for(var i = 0; i < 9; i++){ var f = 500 + i*70 + Math.random()*60; tendre(f, .2 + i*.28, .07, .012, f*1.3, .006); } },   /* l'alcool grimpe dans le papier */
  papier:function(){ souffle(0, .12, .028, 1800, 3000, .8); },
  /* l'ardoise */
  craie:function(){ [0, .16, .34].forEach(function(t){ souffle(t, .12, .022, 3200, 2600, 1.4); grains(t, .12, .014, 10, 3000); }); },
  /* Mimi */
  miaou:function(){ var a = audio(); if(!a) return; tendre(620, 0, .34, .035, 940, .05, 'triangle', 2400); tendre(940, .16, .3, .03, 560, .05, 'triangle', 2200); },
  ronron:function(){ for(var i = 0; i < 14; i++) tendre(58 + (i % 2)*4, i*.055, .05, .05, null, .012, 'triangle', 300); },
  saut:function(){ souffle(0, .22, .02, 500, 1300, .7); },
  pose:function(){ tendre(140, 0, .08, .05, 100, .005, 'triangle', 500); },
  /* les trois bulles de l'atelier (le même « pop » que les pastilles de la carte du jeu) */
  pastilles:function(n){ var gamme = [523, 587, 659, 784, 880, 1047]; for(var i = 0; i < Math.min(Math.max(n || 1, 1), 6); i++){ var f = gamme[i], t = .07*i + .05; tendre(f*.72, t, .085, .03, f*1.18, .005, 'sine', 2600); tendre(f*2, t + .012, .05, .006, null, .003); } }
};
function son(nom, x){ if(!SON.actif) return; try { (SONS[nom] || SONS.clic)(x); } catch(e){} }
