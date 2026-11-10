/* Atelier des sons de Brumeval — les musiques d'ambiance, fabriquées en direct et sans fin.
   Une musique = des sons continus (bourdon, souffle) + des « voix » qui reviennent à leur rythme
   (accords, gouttes, petites notes lointaines). Le programmateur de la page appelle I.pas(jusqua)
   souvent ; hors ligne, on l'appelle une seule fois pour toute la durée. */
(function(G){
'use strict';
var h = Moteur.hasard, m = Moteur.midi;
var M = {};

function Instance(A, P){
  var I = {A:A, P:P, gens:[], noeuds:[], fini:false};
  I.chaque = function(debut, iv, fn){ I.gens.push({p:P.t + debut, iv:iv, fn:fn, n:0}); };
  I.pas = function(jusqua){
    if(I.fini) return;
    var maintenant = A.ctx.currentTime;
    I.gens.forEach(function(gn){
      var garde = 0;
      while(gn.p < jusqua && garde++ < 400){
        if(gn.p >= maintenant - .02){ try{ gn.fn(gn.p, gn.n); }catch(e){ if(G.console) console.warn('musique', e); } }
        gn.n++;
        gn.p += typeof gn.iv === 'function' ? gn.iv(gn.n) : gn.iv;
      }
    });
  };
  I.continu = function(n){ I.noeuds.push(n); return n; };
  I.arreter = function(t, fondu){
    if(I.fini) return;
    fondu = fondu || 1.5; I.fini = true;
    P.couper(t, fondu / 4);
    I.noeuds.forEach(function(n){ try{ n.stop(t + fondu + .3); }catch(e){} });
    A.plusTard(t - A.ctx.currentTime + fondu + .6, function(){ P.lacher(); (I.echos || []).forEach(function(e){ e.couper(); }); });
  };
  I.echo = function(dest, o){ var e = A.echo(dest, o); (I.echos = I.echos || []).push(e); return e; };
  return I;
}

/* un bourdon grave qui ne s'arrête pas (deux voix légèrement désaccordées par note, un filtre qui respire) */
function bourdon(I, freqs, o){
  var A = I.A, ctx = A.ctx, t = I.P.t;
  var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp || 300; lp.Q.value = .7;
  var lfo = I.continu(ctx.createOscillator()); lfo.frequency.value = o.lfo || .04;
  var lg = A.gain(o.lfoAmp == null ? 100 : o.lfoAmp); lfo.connect(lg); lg.connect(lp.frequency); lfo.start(t);
  var amp = A.gain(0); amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(o.g || .06, t + (o.a || 4));
  lp.connect(amp); amp.connect(o.dest);
  freqs.forEach(function(f){
    [-6, 6].forEach(function(det){
      var x = I.continu(ctx.createOscillator()); x.type = o.type || 'sawtooth'; x.frequency.value = f; x.detune.value = det + h(-2, 2);
      x.connect(lp); x.start(t);
    });
  });
  return amp;
}
/* l'air du souterrain qui respire (un bruit sourd dont la couleur et le volume bougent lentement) */
function souffle(I, o){
  var A = I.A, ctx = A.ctx, t = I.P.t;
  var s = I.continu(ctx.createBufferSource()); s.buffer = A[o.coul || 'brun']; s.loop = true;
  var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.f || 380; f.Q.value = o.q || .6;
  var l1 = I.continu(ctx.createOscillator()), l1g = A.gain(o.balai || 140); l1.frequency.value = o.lfo1 || .055; l1.connect(l1g); l1g.connect(f.frequency);
  var g = A.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.g || .05, t + 3);
  var l2 = I.continu(ctx.createOscillator()), l2g = A.gain((o.g || .05) * .5); l2.frequency.value = o.lfo2 || .09; l2.connect(l2g); l2g.connect(g.gain);
  s.connect(f); f.connect(g); g.connect(o.dest);
  s.start(t, h(0, s.buffer.duration * .9)); l1.start(t); l2.start(t);
}
/* de l'eau qui coule : un tampon de petites bulles, lu deux fois à des vitesses différentes pour ne jamais se répéter pareil */
function ruisseau(I, o){
  var A = I.A, ctx = A.ctx, t = I.P.t, buf = A.eau(5, o.densite || 70, {fmin:o.fmin || 450, fmax:o.fmax || 2400});
  [[.93, 0], [1.07, 2.3]].forEach(function(v, k){
    var s = I.continu(ctx.createBufferSource()); s.buffer = buf; s.loop = true; s.playbackRate.value = v[0];
    var g = A.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.g || .1, t + 3);
    if(ctx.createStereoPanner){ var p = ctx.createStereoPanner(); p.pan.value = k ? .4 : -.4; s.connect(p); p.connect(g); } else s.connect(g);
    g.connect(o.dest); s.start(t, v[1]);
  });
  /* et le grondement sourd de l'eau, très bas */
  var n = I.continu(ctx.createBufferSource()); n.buffer = A.brun; n.loop = true;
  var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
  var gn = A.gain(0); gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime((o.g || .1) * .5, t + 3);
  n.connect(lp); lp.connect(gn); gn.connect(o.dest); n.start(t, h(0, 2));
}
/* une note continue qui tremble (trémolo de cordes très doux) */
function tremolo(I, notes, o){
  var A = I.A, ctx = A.ctx, t = I.P.t;
  var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp || 1600;
  var tr = A.gain(.5), lfo = I.continu(ctx.createOscillator()), lg = A.gain(.45); lfo.frequency.value = o.vit || 6.5; lfo.connect(lg); lg.connect(tr.gain); lfo.start(t);
  var amp = A.gain(0); amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(o.g || .02, t + 5);
  if(o.houle){ var hl = I.continu(ctx.createOscillator()), hg = A.gain((o.g || .02) * .7); hl.frequency.value = o.houle; hl.connect(hg); hg.connect(amp.gain); hl.start(t); }
  lp.connect(tr); tr.connect(amp); amp.connect(o.dest);
  notes.forEach(function(f){ [-5, 5].forEach(function(det){ var x = I.continu(ctx.createOscillator()); x.type = o.type || 'sawtooth'; x.frequency.value = f; x.detune.value = det; x.connect(lp); x.start(t); }); });
  return amp;
}
/* une note de boîte à musique un peu usée */
function boite(A, t, f, g, dest){
  var det = h(-14, 6);
  A.ton(t, {f:f, det:det, env:[[0, 0], [.002, 1], [.3, .35], [1.8, 0]], g:g}, dest);
  A.ton(t, {f:f * 4.02, det:det, env:[[0, 0], [.001, 1], [.25, 0]], g:g * .25}, dest);
  A.ton(t, {f:f * 2, det:det, env:[[0, 0], [.002, 1], [.6, 0]], g:g * .2}, dest);
  A.bruit(t, {hp:5000, env:A.perc(.0005, .006), g:g * .5}, dest);
}
/* une flûte creuse (le puits qui chante) */
/* une goutte d'eau grave dans une grande salle : basse et douce, pour ne jamais ressembler à un petit cri */
function goutteGrave(A, t, g, dest){ A.goutte(t, {f:h(300, 480), monte:1.5, gl:.035, g:g}, dest); }
function flute(A, t, f, d, g, dest){
  A.ton(t, {f:f, env:[[0, 0], [.25, 1], [d * .55, .7], [d, 0]], g:g, vib:[4.5, f * .006], vibRetard:.4}, dest);
  A.ton(t, {f:f * 2, env:[[0, 0], [.3, 1], [d * .5, .5], [d, 0]], g:g * .12}, dest);
  A.bruit(t, {bp:f, bq:12, env:[[0, 0], [.2, 1], [d * .55, .6], [d, 0]], g:g * 3}, dest);
}

/* =================== EXPLORATION =================== */
/* A — La grotte qui respire (ré mineur) : bourdon, souffle, accords très lents, gouttes, notes de cloche au loin */
M.exploA = function(A, P){
  var I = Instance(A, P);
  var proche = A.bus(P, {grotte:.35}), loin = A.bus(P, {grotte:1.1, g:.7}), ech = I.echo(loin, {temps:.42, retour:.42, lp:2200, sortie:.6});
  bourdon(I, [m(38), m(45)], {dest:proche, lp:280, g:.07, lfo:.035, lfoAmp:110});
  souffle(I, {dest:proche, f:380, g:.05});
  var accords = [[62, 65, 69], [58, 62, 65], [55, 58, 62], [57, 60, 64]];
  I.chaque(.5, 11, function(t, n){ A.nappe(t, accords[n % 4].map(m), 14, {a:4, r:4.5, lp:900, lp1:300, g:.028}, proche); });
  I.chaque(1.2, function(){ return h(3, 7); }, function(t){ goutteGrave(A, t, h(.03, .06), Math.random() < .6 ? ech : loin); });
  var penta = [74, 77, 79, 81, 84, 86];
  I.chaque(3, function(){ return h(4, 9); }, function(t){
    var k = Math.floor(Math.random() * penta.length), nb = Math.random() < .35 ? 2 + Math.floor(Math.random() * 2) : 1, dir = Math.random() < .5 ? -1 : 1;
    for(var i = 0; i < nb; i++){
      var note = penta[Math.max(0, Math.min(penta.length - 1, k + dir * i))];
      A.cloche(t + i * .48, m(note), {d:3, rapport:3.5, indice:.9, g:.035}, ech);
      A.cloche(t + i * .48, m(note), {d:3, rapport:3.5, indice:.9, g:.025}, loin);
    }
  });
  I.chaque(15, function(){ return h(22, 38); }, function(t){ A.bruit(t, {coul:'brun', lp:140, env:[[0, 0], [2.5, 1], [6, 0]], g:.25}, loin); });
  return I;
};
/* B — La boîte à musique perdue (la mineur) : une petite berceuse qui revient de loin, entre de longs silences */
M.exploB = function(A, P){
  var I = Instance(A, P);
  var proche = A.bus(P, {grotte:.3}), loin = A.bus(P, {grotte:.9, g:.8}), ech = I.echo(loin, {temps:.5, retour:.35, lp:2600, sortie:.5});
  bourdon(I, [m(33), m(40)], {dest:proche, type:'triangle', lp:400, g:.09, lfo:.03, lfoAmp:80});
  souffle(I, {dest:proche, f:500, g:.03});
  var accords = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]];
  var phrase1 = [[0, 76], [1, 81], [2, 83], [3, 84], [4, 83], [5, 81], [6, 77], [8, 76], [9, 74], [10, 77], [11, 81], [12, 80], [14, 81]];
  var phrase2 = [[0, 74], [1, 77], [2, 81], [3, 79], [4, 77], [6, 76], [8, 74], [9, 72], [10, 71], [12, 69]];
  var temps = .5;
  function joue(t, phrase, oct){
    var ralenti = Math.random() < .4;
    phrase.forEach(function(p, k){
      var x = p[0] * temps * (ralenti && k > phrase.length - 4 ? 1 + (k - phrase.length + 4) * .08 : 1) + h(-.015, .015);
      boite(A, t + x, m(p[1] + oct), .07, proche);
      boite(A, t + x, m(p[1] + oct), .04, ech);
    });
  }
  I.chaque(.3, 8, function(t, n){
    A.nappe(t, accords[n % 4].map(m), 10, {type:'triangle', a:3, r:4, lp:700, lp1:250, g:.04}, proche);
    if(n % 8 === 0) joue(t + .5, phrase1, n % 16 === 8 ? -12 : 0);
    else if(n % 8 === 2) joue(t + .5, phrase2, 0);
    else if(Math.random() < .6){
      var notes = accords[n % 4];
      boite(A, t + h(1, 5), m(notes[Math.floor(Math.random() * 3)] + 12), .045, ech);
    }
  });
  I.chaque(4, function(){ return h(6, 11); }, function(t){ goutteGrave(A, t, h(.03, .05), ech); });
  return I;
};
/* C — Lanterne dans la brume (mi dorien, un peu d'espoir) : voix lointaines, harpe, vent */
M.exploC = function(A, P){
  var I = Instance(A, P);
  var proche = A.bus(P, {grotte:.4}), loin = A.bus(P, {grotte:1.1, g:.7}), ech = I.echo(loin, {temps:.38, retour:.3, lp:3000, sortie:.5});
  bourdon(I, [m(40), m(47)], {dest:proche, type:'triangle', lp:350, g:.08, lfo:.03});
  souffle(I, {dest:proche, coul:'rose', f:700, q:.8, balai:400, lfo1:.05, g:.025});
  var accords = [[52, 55, 59, 62], [45, 52, 57, 61], [52, 55, 59, 62], [50, 54, 57, 62]];
  I.accord = accords[0];
  I.chaque(.4, 12, function(t, n){
    I.accord = accords[n % 4];
    A.choeur(t, I.accord.map(m), 15, {voyelle:n % 2 ? 'o' : 'ou', a:4, r:4.5, g:.03}, proche);
  });
  I.chaque(5, function(){ return h(7, 12); }, function(t){
    var a = I.accord, nb = 4 + Math.floor(Math.random() * 3);
    for(var k = 0; k < nb; k++){
      var note = a[k % a.length] + 12 * (1 + Math.floor(k / a.length));
      A.harpe(t + k * .17, m(note), {t60:2.5, g:.12}, proche);
      if(k === nb - 1) A.harpe(t + k * .17, m(note), {t60:2.5, g:.08}, ech);
    }
  });
  I.chaque(10, function(){ return h(15, 25); }, function(t){ A.cloche(t, m(Math.random() < .5 ? 83 : 88), {d:4, rapport:3.5, indice:.8, g:.03}, loin); });
  return I;
};

/* =================== COMBAT =================== */
/* A — Le cœur qui bat (ré phrygien, 66 battements par minute) : battement sourd, ostinato grave, trémolo tendu */
M.combatA = function(A, P){
  var I = Instance(A, P), b = 60 / 66;
  var proche = A.bus(P, {grotte:.25}), coeur = A.bus(P, {grotte:.2}), loin = A.bus(P, {grotte:1, g:.7});
  bourdon(I, [m(38)], {dest:proche, lp:260, g:.05, lfo:.05, lfoAmp:60, a:2});
  tremolo(I, [m(50), m(57), m(63)], {dest:loin, g:.02, vit:6.5, lp:1500, houle:1 / (16 * b)});
  I.chaque(.5, b, function(t){
    A.choc(t, {f:90, f2:50, d:.17, g:.4, sat:3, lp:600, bruit:.25, corpsF:220, corps:.8}, coeur);
    A.choc(t + .2, {f:82, f2:48, d:.14, g:.25, sat:3, lp:600, bruit:.25, corpsF:220, corps:.8}, coeur);
  });
  var motif = [0, 0, 0, 1, 0, 0, 3, 1], trans = [0, -4, -2, 0];
  I.chaque(.5, b / 2, function(t, n){
    var note = 38 + trans[Math.floor(n / 32) % 4] + motif[n % 8], fort = n % 8 === 0;
    A.ton(t, {type:'sawtooth', f:m(note), env:A.perc(.005, .16), g:fort ? .09 : .06, filtres:[{type:'lowpass', f:300, pts:[[.02, 1300], [.15, 300]], q:3}]}, proche);
    A.ton(t, {type:'square', f:m(note + 12), env:A.perc(.005, .1), g:fort ? .02 : .012, lp:900}, proche);
  });
  return I;
};
/* B — Tambours lointains (do mineur, 84 battements par minute) : tambours dans la grotte, violoncelle, pizzicati */
M.combatB = function(A, P){
  var I = Instance(A, P), b = 60 / 84;
  var proche = A.bus(P, {grotte:.3}), tamb = A.bus(P, {grotte:.9, g:.8}), loin = A.bus(P, {grotte:1, g:.7});
  bourdon(I, [m(36), m(43)], {dest:proche, lp:240, g:.05, lfo:.04, lfoAmp:60, a:2});
  var rythme = [[0, 1], [1.5, .6], [2, .8], [4, 1], [5.5, .6], [6, .8], [6.5, .5]];
  I.chaque(.4, 8 * b, function(t){ rythme.forEach(function(p){ A.tambour(t + p[0] * b, {f:p[1] > .9 ? 80 : 95, d:.7, g:.32 * p[1]}, tamb); }); });
  var basse = [48, 48, 44, 43];
  I.chaque(.4, 2 * b, function(t, n){ A.archet(t, m(basse[n % 4]), 2 * b + .1, {a:.18, r:.25, g:.04}, proche); });
  var pizz = [60, 67, 63, 67, 60, 67, 62, 67];
  I.chaque(.4, b / 2, function(t, n){ if(n % 16 < 12) A.harpe(t, m(pizz[n % 8]), {t60:.35, eclat:.6, g:.12}, proche); });
  I.chaque(.4 + 8 * b, 16 * b, function(t){
    [44, 51].forEach(function(n){ [-5, 5].forEach(function(det){
      A.ton(t, {type:'sawtooth', f:m(n), det:det, env:[[0, 0], [2.5, 1], [4, .6], [5.5, 0]], g:.03, filtres:[{type:'lowpass', f:300, pts:[[2.5, 1400], [5.5, 300]], q:1}]}, loin);
    }); });
  });
  return I;
};

/* =================== LES SALLES : un fond commun (le donjon) + une couleur par salle =================== */
M.donjon = function(A, P){
  var I = Instance(A, P);
  var proche = A.bus(P, {grotte:.35});
  bourdon(I, [m(38), m(45)], {dest:proche, lp:260, g:.06, lfo:.035, lfoAmp:90});
  souffle(I, {dest:proche, f:360, g:.04});
  var accords = [[62, 65, 69], [58, 62, 65]];
  I.chaque(.5, 14, function(t, n){ A.nappe(t, accords[n % 2].map(m), 17, {a:5, r:5.5, lp:750, lp1:300, g:.022}, proche); });
  return I;
};
/* le puits : de l'eau qui coule, des gouttes en écho, une flûte creuse */
M.puits = function(A, P){
  var I = Instance(A, P);
  var proche = A.bus(P, {grotte:.4}), loin = A.bus(P, {grotte:1, g:.7}), ech = I.echo(loin, {temps:.31, retour:.5, lp:2400, sortie:.7});
  ruisseau(I, {dest:proche, densite:60, g:.12});
  I.chaque(.6, function(){ return h(2.5, 5); }, function(t){ goutteGrave(A, t, h(.04, .07), Math.random() < .5 ? ech : proche); });
  var notes = [55, 57, 60, 62, 65];
  I.chaque(2, function(){ return h(6, 10); }, function(t){ var f = m(notes[Math.floor(Math.random() * notes.length)]); flute(A, t, f, 2.4, .03, proche); flute(A, t, f, 2.4, .025, ech); });
  return I;
};
/* la cave aux toiles : des cordes graves qui tremblent (une seconde mineure, pour la tension), des notes de harpe qui descendent,
   une cloche grave au loin, un souffle de vent. (Refaite le 9 novembre : plus de grincements, de sifflements aigus ni de petits pas.) */
M.toiles = function(A, P){
  var I = Instance(A, P);
  var proche = A.bus(P, {grotte:.45}), loin = A.bus(P, {grotte:1, g:.7});
  tremolo(I, [m(50), m(51), m(57)], {dest:loin, type:'triangle', g:.022, vit:5, lp:900});
  var notes = [62, 61, 57, 55, 53, 50];
  I.chaque(1.5, function(){ return h(4, 7); }, function(t){ var k = Math.floor(Math.random() * 4); for(var i = 0; i < 3; i++) A.harpe(t + i * .45, m(notes[k + i]), {t60:2.5, g:.13, lp:1800}, proche); });
  I.chaque(6, function(){ return h(10, 16); }, function(t){ A.cloche(t, m(50), {d:4, rapport:3.5, indice:.7, g:.035}, loin); });
  I.chaque(3, function(){ return h(8, 14); }, function(t){ A.bruit(t, {coul:'brun', bp:300, bq:1.2, env:[[0, 0], [2.5, 1], [6, 0]], g:.2}, loin); });
  return I;
};
/* l'atelier : une horloge, une machine qui souffle, des cliquets, une enclume au loin, de la vapeur */
M.atelier = function(A, P){
  var I = Instance(A, P), ctx = A.ctx, t0 = P.t;
  var proche = A.bus(P, {grotte:.35}), loin = A.bus(P, {grotte:1, g:.7});
  /* la machine : un grave qui pompe doucement */
  var x = I.continu(ctx.createOscillator()); x.type = 'sawtooth'; x.frequency.value = 55;
  var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
  var pompe = A.gain(.5), lfo = I.continu(ctx.createOscillator()), lg = A.gain(.45); lfo.frequency.value = .7; lfo.connect(lg); lg.connect(pompe.gain);
  var amp = A.gain(0); amp.gain.setValueAtTime(0, t0); amp.gain.linearRampToValueAtTime(.06, t0 + 3);
  x.connect(lp); lp.connect(pompe); pompe.connect(amp); amp.connect(proche); x.start(t0); lfo.start(t0);
  I.chaque(.2, 1, function(t, n){ A.bruit(t, {bp:n % 2 ? 700 : 900, bq:6, env:A.perc(.001, .03), g:.7}, proche); });   /* tic-tac de bois, grave */
  I.chaque(4, function(){ return h(7, 12); }, function(t){
    A.modes(t, m([57, 62, 65][Math.floor(Math.random() * 3)]), [[1, 1, 1.6, 1], [2.76, .45, 1.1], [5.4, .2, .5]], {g:.045}, loin);
  });
  I.chaque(6, function(){ return h(10, 16); }, function(t){ A.bruit(t, {coul:'rose', bp:500, bq:1, env:[[0, 0], [.4, 1], [1.4, .6], [2, 0]], g:.12}, loin); });   /* la vapeur, grave */
  I.chaque(8, 16, function(t){ [62, 65, 64, 57].forEach(function(n, k){ A.cloche(t + k * .35, m(n), {d:2, rapport:2.76, indice:1, g:.03}, loin); }); });
  return I;
};

G.MUSIQUES = M;
/* les outils, prêtés aux nouvelles musiques de l'atelier (musiques-donjon.js) — rien ne change ici */
G.MUSIQUES_OUTILS = {Instance:Instance, bourdon:bourdon, souffle:souffle, ruisseau:ruisseau, tremolo:tremolo, boite:boite, flute:flute};
})(window);
