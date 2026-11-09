/* Atelier des sons de Brumeval — le moteur.
   Tout est fabriqué avec Web Audio, sans aucun fichier : oscillateurs, bruits filtrés, cordes pincées
   (Karplus-Strong calculé en JavaScript), craquements et crépitements calculés en JavaScript,
   réverbération par convolution d'une réponse fabriquée.
   Le même moteur marche en direct (AudioContext) et hors ligne (OfflineAudioContext), pour vérifier les sons. */
(function(G){
'use strict';
function hasard(a, b){ return a + Math.random() * (b - a); }
function choix(l){ return l[Math.floor(Math.random() * l.length)]; }
function midi(m){ return 440 * Math.pow(2, (m - 69) / 12); }

function Moteur(ctx, opt){
  opt = opt || {};
  var sr = ctx.sampleRate, horsLigne = !!opt.horsLigne;
  var A = {ctx:ctx, sr:sr, hasard:hasard, choix:choix, midi:midi, horsLigne:horsLigne};

  /* ---------- les bruits de base (3 à 4 secondes, joués en boucle à partir d'un endroit au hasard) ---------- */
  function tampon(sec, ncan, fn){
    var n = Math.floor(sr * sec), b = ctx.createBuffer(ncan || 1, n, sr);
    for(var c = 0; c < (ncan || 1); c++) fn(b.getChannelData(c), n, c);
    return b;
  }
  function normaliseRms(d, n, cible){
    var s = 0, i; for(i = 0; i < n; i++) s += d[i] * d[i];
    var k = cible / Math.sqrt(s / n || 1); for(i = 0; i < n; i++) d[i] *= k;
  }
  A.blanc = tampon(3, 1, function(d, n){ for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; });
  A.rose = tampon(3, 1, function(d, n){
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for(var i = 0; i < n; i++){
      var w = Math.random() * 2 - 1;
      b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852;
      b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926;
    }
    normaliseRms(d, n, .3);
  });
  A.brun = tampon(3, 1, function(d, n){
    var l = 0, i;
    for(i = 0; i < n; i++){ l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l; }
    var pente = (d[n - 1] - d[0]) / n;                         /* pour que la boucle ne claque pas */
    for(i = 0; i < n; i++) d[i] -= pente * i;
    normaliseRms(d, n, .3);
  });
  /* un bruit très lent (sous 90 Hz) : sert à faire trembler une hauteur ou un volume, comme un vrai gosier */
  A.lent = tampon(4, 1, function(d, n){
    var a = 1 - Math.exp(-2 * Math.PI * 90 / sr), l1 = 0, l2 = 0, i;
    for(i = 0; i < n; i++){ l1 += (Math.random() * 2 - 1 - l1) * a; l2 += (l1 - l2) * a; d[i] = l2; }
    var pente = (d[n - 1] - d[0]) / n; for(i = 0; i < n; i++) d[i] -= pente * i;
    normaliseRms(d, n, .5);
  });

  /* ---------- la réverbération : une réponse fabriquée (premiers échos sur la pierre, puis une queue qui s'assombrit) ---------- */
  function reponse(duree, o){
    return tampon(duree, 2, function(d, n, c){
      var pre = Math.floor(sr * (o.pre || .012)), lp = 0, i;
      for(i = 0; i < n; i++){
        var u = i / n, k = o.clair - (o.clair - o.sombre) * Math.pow(u, .6);
        lp += (Math.random() * 2 - 1 - lp) * k;
        var env = Math.pow(10, -3 * (i / sr) / duree), mont = i < pre ? 0 : Math.min(1, (i - pre) / (sr * .006));
        d[i] = lp * env * mont;
      }
      for(var e = 0; e < (o.echos || 0); e++){                /* les premiers rebonds, différents à gauche et à droite */
        var p = Math.floor(sr * hasard(.006, o.ecart || .07)), amp = hasard(.25, .7) * (1 - e / (o.echos + 2)), sg = Math.random() < .5 ? -1 : 1;
        for(var j = 0; j < 24 && p + j < n; j++) d[p + j] += sg * amp * Math.exp(-j / 4) * (j % 2 ? -.4 : 1);
      }
    });
  }

  /* ---------- la sortie : bruitages, musique, deux salles de réverbération, volume, compresseur ---------- */
  A.volume = ctx.createGain(); A.volume.gain.value = opt.volume == null ? .8 : opt.volume;
  if(opt.sortie) A.volume.connect(opt.sortie);            /* branché dans la chaîne d'un autre (le jeu) */
  else if(opt.brut) A.volume.connect(ctx.destination);
  else {
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = .003; comp.release.value = .18;
    /* après le compresseur, un écrêtage tout doux : jamais de craquement, même tout fort */
    var doux = ctx.createWaveShaper(), nc = 4096, cc = new Float32Array(nc);
    for(var ic = 0; ic < nc; ic++){ var xc = ic / (nc - 1) * 2 - 1, ax = Math.abs(xc); cc[ic] = ax < .7 ? xc : Math.sign(xc) * (.7 + .3 * Math.tanh((ax - .7) / .3)); }
    doux.curve = cc;
    A.volume.connect(comp); comp.connect(doux); doux.connect(ctx.destination);
  }
  A.sfx = ctx.createGain(); A.sfx.connect(A.volume);
  A.mus = ctx.createGain(); A.mus.connect(A.volume);
  var cave = ctx.createConvolver(); cave.buffer = reponse(2.4, {clair:.55, sombre:.06, echos:7, ecart:.06, pre:.01});
  var caveRet = ctx.createGain(); caveRet.gain.value = .7; cave.connect(caveRet); caveRet.connect(A.volume);
  A.caveIn = ctx.createGain(); A.caveIn.connect(cave);
  var grotte = ctx.createConvolver(); grotte.buffer = reponse(4.5, {clair:.35, sombre:.025, echos:9, ecart:.12, pre:.03});
  var grotteRet = ctx.createGain(); grotteRet.gain.value = .8; grotte.connect(grotteRet); grotteRet.connect(A.volume);
  A.grotteIn = ctx.createGain(); A.grotteIn.connect(grotte);

  /* plus tard (seulement en direct : hors ligne, rien ne traîne) */
  A.plusTard = function(sec, fn){ if(!horsLigne) setTimeout(fn, Math.max(0, sec) * 1000); };
  function g(v){ var x = ctx.createGain(); x.gain.value = v == null ? 1 : v; return x; }
  A.gain = g;
  /* quand une source a fini, on débranche sa sortie : la tablette n'a plus à calculer ses filtres */
  function nettoie(src, sortie){ src.onended = function(){ try{ sortie.disconnect(); }catch(e){} }; }
  A.nettoie = nettoie;

  /* une « prise » : l'endroit où un son se branche, avec son niveau, sa part sèche et ses parts de réverbération */
  A.prise = function(t, niveau, vers){
    niveau = niveau == null ? 1 : niveau;
    var P = {t:t, niveau:niveau};
    P.sec = g(niveau); P.sec.connect(vers === 'mus' ? A.mus : A.sfx);
    P.cave = g(niveau); P.cave.connect(A.caveIn);
    P.grotte = g(niveau); P.grotte.connect(A.grotteIn);
    P.couper = function(t2, tau){ [P.sec, P.cave, P.grotte].forEach(function(x){ x.gain.cancelScheduledValues(t2); x.gain.setValueAtTime(x.gain.value, t2); x.gain.setTargetAtTime(0, t2, tau || .05); }); };
    P.monter = function(t2, tau){ [P.sec, P.cave, P.grotte].forEach(function(x){ x.gain.cancelScheduledValues(t2); x.gain.setValueAtTime(x.gain.value, t2); x.gain.setTargetAtTime(niveau, t2, tau || .05); }); };
    P.lacher = function(){ [P.sec, P.cave, P.grotte].forEach(function(x){ try{ x.disconnect(); }catch(e){} }); };
    return P;
  };
  /* une entrée de son : sèche vers la prise, un peu dans la cave (rev) ou dans la grande grotte (grotte), placée à gauche ou à droite */
  A.bus = function(P, o){
    o = o || {};
    var e = g(o.g == null ? 1 : o.g), s = e;
    if(o.hp){ var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = o.hp; f.Q.value = .6; s.connect(f); s = f; }   /* enlève le très grave que la tablette ne rend pas */
    if(o.pan != null && ctx.createStereoPanner){
      var p = ctx.createStereoPanner(); p.pan.setValueAtTime(o.pan, P.t);
      if(o.pan2 != null) p.pan.linearRampToValueAtTime(o.pan2, P.t + (o.pant || 1));
      s.connect(p); s = p;
    }
    s.connect(P.sec);
    if(o.rev){ var r = g(o.rev); s.connect(r); r.connect(P.cave); e.envoiCave = r; }
    if(o.grotte){ var r2 = g(o.grotte); s.connect(r2); r2.connect(P.grotte); e.envoiGrotte = r2; }
    return e;
  };
  /* un bus « qui s'éloigne » : le son baisse, s'assourdit, part sur le côté et sonne de plus en plus dans la salle */
  A.lointain = function(P, t, duree, o){
    o = o || {};
    var e = g(1), lp = ctx.createBiquadFilter(), v = g(1);
    lp.type = 'lowpass'; lp.Q.value = .5;
    lp.frequency.setValueAtTime(o.lp1 || 9000, t); lp.frequency.exponentialRampToValueAtTime(o.lp2 || 1400, t + duree);
    v.gain.setValueAtTime(1, t); v.gain.exponentialRampToValueAtTime(o.fin || .12, t + duree);
    e.connect(lp); lp.connect(v);
    var s = v;
    if(ctx.createStereoPanner){ var p = ctx.createStereoPanner(); p.pan.setValueAtTime(o.pan1 == null ? .1 : o.pan1, t); p.pan.linearRampToValueAtTime(o.pan2 == null ? .95 : o.pan2, t + duree); v.connect(p); s = p; }
    s.connect(P.sec);
    var r = g(0); r.gain.setValueAtTime(o.rev1 == null ? .15 : o.rev1, t); r.gain.linearRampToValueAtTime(o.rev2 == null ? .9 : o.rev2, t + duree);
    lp.connect(r); r.connect(o.grotte ? P.grotte : P.cave);
    return e;
  };

  /* ---------- enveloppes ---------- */
  /* pts : [[instant, valeur], ...] ; les montées sont droites, les descentes en courbe (comme un vrai son qui s'éteint) */
  A.env = function(param, t, pts, gain){
    gain = gain == null ? 1 : gain;
    var prev = Math.max(pts[0][1] * gain, 1e-4);
    param.setValueAtTime(prev, t + pts[0][0]);
    for(var i = 1; i < pts.length; i++){
      var v = Math.max(pts[i][1] * gain, 1e-4), tt = t + pts[i][0];
      if(pts[i][2] === 'lin' || v > prev) param.linearRampToValueAtTime(v, tt);
      else param.exponentialRampToValueAtTime(v, tt);
      prev = v;
    }
    return t + pts[pts.length - 1][0];
  };
  A.perc = function(a, d){ return [[0, 0], [a, 1], [a + d, 0]]; };
  A.ahd = function(a, h, d, s){ return [[0, 0], [a, 1], [a + h, s == null ? 1 : s], [a + h + d, 0]]; };
  function enveloppeDe(o){
    if(o.env) return o.env;
    var a = o.a == null ? .005 : o.a;
    return [[0, 0], [a, 1], [a + (o.tenue || 0), 1], [a + (o.tenue || 0) + o.d, 0]];
  }
  /* une courbe de hauteur douce qui passe par des points [fraction du temps, hauteur] */
  A.courbe = function(pts, duree, mult){
    mult = mult || 1;
    var N = Math.max(16, Math.ceil(duree * 400)), c = new Float32Array(N), k = 0;
    for(var i = 0; i < N; i++){
      var u = i / (N - 1);
      while(k < pts.length - 2 && u > pts[k + 1][0]) k++;
      var a = pts[k], b = pts[k + 1], s = (u - a[0]) / Math.max(1e-6, b[0] - a[0]);
      s = Math.max(0, Math.min(1, s)); s = (1 - Math.cos(Math.PI * s)) / 2;
      c[i] = a[1] * Math.pow(b[1] / a[1], s) * mult;
    }
    return c;
  };

  /* ---------- filtres, saturation ---------- */
  A.filtre = function(t, src, f){
    var b = ctx.createBiquadFilter();
    b.type = f.type || 'lowpass';
    b.frequency.setValueAtTime(f.f, t);
    if(f.pts){ f.pts.forEach(function(p){ b.frequency.exponentialRampToValueAtTime(p[1], t + p[0]); }); }
    else if(f.f2) b.frequency.exponentialRampToValueAtTime(f.f2, t + (f.t2 || .1));
    if(f.q != null) b.Q.value = f.q;
    if(f.gain != null) b.gain.value = f.gain;
    src.connect(b);
    return b;
  };
  A.chaine = function(t, src, liste){ var n = src; (liste || []).forEach(function(f){ n = A.filtre(t, n, f); }); return n; };
  var courbesSat = {};
  A.sature = function(drive){
    var k = Math.round(drive * 10) / 10;
    if(!courbesSat[k]){
      var n = 2048, c = new Float32Array(n), norm = Math.tanh(k);
      for(var i = 0; i < n; i++){ var x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(k * x) / norm; }
      courbesSat[k] = c;
    }
    var w = ctx.createWaveShaper(); w.curve = courbesSat[k]; w.oversample = 'none';
    return w;
  };
  function filtresRaccourcis(o){
    var l = o.filtres ? o.filtres.slice() : [];
    if(o.hp) l.push({type:'highpass', f:o.hp, q:o.hpq == null ? .7 : o.hpq});
    if(o.lp) l.push({type:'lowpass', f:o.lp, f2:o.lp2, t2:o.lpt, q:o.lq == null ? .7 : o.lq});
    if(o.bp) l.push({type:'bandpass', f:o.bp, f2:o.bp2, t2:o.bpt, q:o.bq == null ? 1 : o.bq});
    return l;
  }

  /* ---------- un oscillateur ----------
     o.f (o.f2, o.gl : glissando) ou o.courbe (Float32Array de hauteurs) ; o.type ou o.vague ;
     o.vib [vitesse, ampleur en Hz] ; o.gigue (tremblement de hauteur en Hz) ; o.trem [vitesse, profondeur 0..1] ;
     enveloppe : o.env, ou o.a / o.tenue / o.d ; o.g : le volume ; o.sat : saturation ; filtres : o.lp, o.hp, o.bp, o.filtres */
  A.ton = function(t, o, dest){
    var x = ctx.createOscillator(), amp = g(0), env = enveloppeDe(o);
    var fin = t + env[env.length - 1][0], dur = fin - t;
    if(o.vague) x.setPeriodicWave(o.vague); else x.type = o.type || 'sine';
    if(o.courbe) x.frequency.setValueCurveAtTime(o.courbe, t, o.cd || dur);
    else { x.frequency.setValueAtTime(o.f, t); if(o.pts) o.pts.forEach(function(p){ x.frequency.exponentialRampToValueAtTime(p[1], t + p[0]); }); if(o.f2) x.frequency.exponentialRampToValueAtTime(o.f2, t + (o.gl || dur)); }
    if(o.det) x.detune.value = o.det;
    if(o.vib){
      var v = ctx.createOscillator(), vg = g(0); v.frequency.value = o.vib[0];
      vg.gain.setValueAtTime(o.vibRetard ? 0 : o.vib[1], t); if(o.vibRetard) vg.gain.linearRampToValueAtTime(o.vib[1], t + o.vibRetard);
      v.connect(vg); vg.connect(x.frequency); v.start(t); v.stop(fin + .05);
    }
    if(o.gigue){ var j = ctx.createBufferSource(); j.buffer = A.lent; j.loop = true; var jg = g(o.gigue); j.connect(jg); jg.connect(x.frequency); j.start(t, hasard(0, 3)); j.stop(fin + .05); }
    A.env(amp.gain, t, env, o.g == null ? .3 : o.g);
    var n = x;
    if(o.sat){ var pre = g(1); n.connect(pre); var w = A.sature(o.sat); pre.connect(w); n = w; }
    n = A.chaine(t, n, filtresRaccourcis(o));
    if(o.trem){
      var tr = g(1 - o.trem[1] / 2), lfo = ctx.createOscillator(), lg = g(o.trem[1] / 2);
      lfo.frequency.value = o.trem[0]; lfo.connect(lg); lg.connect(tr.gain); lfo.start(t); lfo.stop(fin + .05);
      n.connect(tr); n = tr;
    }
    n.connect(amp); amp.connect(dest);
    x.start(t); x.stop(fin + .05); nettoie(x, amp);
    return {osc:x, gain:amp, fin:fin};
  };

  /* ---------- un bruit filtré ----------
     o.coul : 'blanc' (défaut), 'rose', 'brun' ; o.vit : vitesse de lecture (plus lent = plus sourd) ;
     filtres : o.bp / o.lp / o.hp (+ o.bp2, o.bpt : balayage), ou o.filtres ; enveloppe comme A.ton ; o.trem ; o.rugueux (0..1) */
  A.bruit = function(t, o, dest){
    var s = ctx.createBufferSource(), amp = g(0), env = enveloppeDe(o);
    var fin = t + env[env.length - 1][0];
    s.buffer = A[o.coul || 'blanc']; s.loop = true;
    if(o.vit) s.playbackRate.value = o.vit;
    A.env(amp.gain, t, env, o.g == null ? .3 : o.g);
    var n0 = s;
    if(o.sat){ var w0 = A.sature(o.sat), pg0 = g(o.pre || 1); s.connect(pg0); pg0.connect(w0); n0 = w0; }
    var n = A.chaine(t, n0, filtresRaccourcis(o));
    if(o.trem){
      var tr = g(1 - o.trem[1] / 2), lfo = ctx.createOscillator(), lg = g(o.trem[1] / 2);
      lfo.frequency.value = o.trem[0]; lfo.connect(lg); lg.connect(tr.gain); lfo.start(t); lfo.stop(fin + .05);
      n.connect(tr); n = tr;
    }
    if(o.rugueux){                                            /* un grain qui gratte : le volume tremble vite et au hasard */
      var rg = g(1 - o.rugueux * .5), j = ctx.createBufferSource(); j.buffer = A.lent; j.loop = true; j.playbackRate.value = o.rugVit || 3;
      var jg = g(o.rugueux * .9); j.connect(jg); jg.connect(rg.gain); j.start(t, hasard(0, 3)); j.stop(fin + .05);
      n.connect(rg); n = rg;
    }
    n.connect(amp); amp.connect(dest);
    s.start(t, hasard(0, 2.5)); s.stop(fin + .05); nettoie(s, amp);
    return {src:s, gain:amp, fin:fin};
  };

  /* ---------- une corde pincée (Karplus-Strong, calculée en JavaScript, juste et sans limite de hauteur) ----------
     o.t60 : temps pour s'éteindre ; o.eclat (0..1) : brillance du pincement ; o.pos (0..0.5) : où l'on pince */
  var cachePince = {};
  A.pince = function(f, o){
    o = o || {};
    var t60 = o.t60 || 1.5, duree = Math.min(o.duree || t60 * 1.1, 6), eclat = o.eclat == null ? .6 : o.eclat, pos = o.pos == null ? .18 : o.pos;
    var cle = [Math.round(f * 10), t60, duree, eclat, pos, o.var || 0].join('|');
    if(cachePince[cle]) return cachePince[cle];
    var n = Math.floor(sr * duree), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    var L = sr / f, N = Math.max(2, Math.floor(L - .5 - .1)), frac = L - N - .5, C = (1 - frac) / (1 + frac);
    var ring = new Float32Array(N), lp = 0, i;
    for(i = 0; i < N; i++){ lp += (Math.random() * 2 - 1 - lp) * eclat; ring[i] = lp; }
    var dp = Math.max(1, Math.floor(N * pos)), copie = ring.slice();
    for(i = 0; i < N; i++) ring[i] = copie[i] - copie[(i - dp + N) % N];       /* le point de pincement */
    var perte = Math.pow(10, -3 / (t60 * f)), p = 0, prev = 0, apx = 0, apy = 0, mx = 0;
    for(i = 0; i < n; i++){
      var x = ring[p]; d[i] = x;
      var moy = perte * .5 * (x + prev); prev = x;
      var ap = C * moy + apx - C * apy; apx = moy; apy = ap;
      ring[p] = ap; p++; if(p >= N) p = 0;
      var ax = x < 0 ? -x : x; if(ax > mx) mx = ax;
    }
    var k = .9 / (mx || 1), fondu = Math.floor(sr * .02);
    for(i = 0; i < n; i++) d[i] *= k * (i > n - fondu ? (n - i) / fondu : 1);
    cachePince[cle] = b;
    return b;
  };
  /* jouer un tampon (corde, craquement...) avec volume, vitesse, filtres et enveloppe */
  A.joue = function(t, buf, o, dest){
    o = o || {};
    var s = ctx.createBufferSource(), amp = g(0);
    s.buffer = buf; if(o.vit) s.playbackRate.value = o.vit;
    var dur = o.d || buf.duration / (o.vit || 1);
    if(o.vit2){ s.playbackRate.setValueAtTime(o.vit || 1, t); s.playbackRate.linearRampToValueAtTime(o.vit2, t + dur); }
    A.env(amp.gain, t, o.env || [[0, 1], [Math.max(.01, dur - .03), 1], [dur, 0]], o.g == null ? .5 : o.g);
    var n = s;
    if(o.sat){ var w = A.sature(o.sat); n.connect(w); n = w; }
    n = A.chaine(t, n, filtresRaccourcis(o));
    if(o.trem){
      var tr = g(1 - o.trem[1] / 2), lfo = ctx.createOscillator(), lg = g(o.trem[1] / 2);
      lfo.frequency.value = o.trem[0]; lfo.connect(lg); lg.connect(tr.gain); lfo.start(t); lfo.stop(t + dur + .05);
      n.connect(tr); n = tr;
    }
    n.connect(amp); amp.connect(dest);
    s.start(t); s.stop(t + dur + .02); nettoie(s, amp);
    return {src:s, gain:amp, fin:t + dur};
  };

  /* ---------- des résonances (métal, bois) : des sinus qui s'éteignent chacun à leur vitesse ----------
     liste : [[rapport, volume, t60, (désaccord en Hz)], ...] */
  A.modes = function(t, f, liste, o, dest){
    o = o || {};
    liste.forEach(function(m){
      var fr = f * m[0];
      if(fr > sr * .45) return;
      var att = o.a || .0015;
      A.ton(t, {f:fr, f2:o.chute ? fr * o.chute : null, gl:m[2], env:[[0, 0], [att, 1], [m[2], .001]], g:(o.g || .3) * m[1]}, dest);
      if(m[3]) A.ton(t, {f:fr + m[3], env:[[0, 0], [att, 1], [m[2] * .9, .001]], g:(o.g || .3) * m[1] * .6}, dest);
    });
  };

  /* ---------- un choc sourd (un corps qui tombe, un coup) : audible même sur un petit haut-parleur grâce à la saturation ---------- */
  A.choc = function(t, o, dest){
    o = o || {};
    var d = o.d || .14;
    A.ton(t, {f:o.f || 170, f2:o.f2 || 52, gl:d * .8, env:[[0, 0], [.004, 1], [d * .35, .5], [d, 0]], g:o.g == null ? .5 : o.g, sat:o.sat == null ? 2.5 : o.sat, lp:o.lp || 1200}, dest);
    if(o.bruit !== 0) A.bruit(t, {coul:'rose', lp:o.blp || 900, lq:.9, env:[[0, 0], [.002, 1], [d * .5, 0]], g:(o.g == null ? .5 : o.g) * (o.bruit == null ? .6 : o.bruit)}, dest);
    if(o.corps !== 0) A.bruit(t, {coul:'rose', bp:o.corpsF || 480, bq:1.3, env:[[0, 0], [.002, 1], [d * .45, 0]], g:(o.g == null ? .5 : o.g) * (o.corps == null ? 1.6 : o.corps)}, dest);
  };

  /* ---------- un cri d'animal (le rat) ----------
     Une voix aiguë qui glisse vite (o.pts : [fraction, hauteur relative]), avec un gosier qui tremble (o.grain),
     du souffle (o.souffle), un trille rapide (o.trille [vitesse, ampleur]) et, pour la douleur ou la rage, une voix éraillée (o.rauque). */
  var vagueCri = (function(){
    var im = new Float32Array([0, 1, .45, .22, .11, .055, .028, .014]);
    return ctx.createPeriodicWave(new Float32Array(im.length), im);
  })();
  A.FORMES = {
    iik:      [[0, .68], [.1, 1.18], [.3, 1.08], [.55, 1.0], [1, .7]],
    aie:      [[0, .78], [.08, 1.22], [.25, 1.15], [.45, 1.18], [.75, .9], [1, .62]],
    plainte:  [[0, .95], [.15, 1.06], [.4, .96], [.7, .82], [1, .58]],
    question: [[0, .72], [.5, .8], [.85, 1.12], [1, 1.16]],
    cri:      [[0, .66], [.06, 1.24], [.2, 1.12], [.38, 1.26], [.6, 1.1], [.82, .98], [1, .7]],
    peur:     [[0, .88], [.15, 1.34], [.45, 1.18], [.7, 1.25], [1, .88]],
    effort:   [[0, .84], [.25, 1.0], [.7, 1.08], [1, .78]],
    toux:     [[0, 1], [.3, .8], [1, .6]]
  };
  A.cri = function(t, o, dest){
    var V = A.voix || {};
    var d = (o.d || .15) * (V.long || 1), f0 = (o.f || 2300) * (o.h || 1) * (V.h || 1), pts = typeof o.forme === 'string' ? A.FORMES[o.forme] : (o.forme || A.FORMES.iik);
    pts = pts.map(function(p, i){ return [p[0], p[1] * (i && !o.fixe ? hasard(.95, 1.05) : 1)]; });   /* jamais deux fois tout à fait le même */
    var c = A.courbe(pts, d, f0), fm = f0 * .95, grain = Math.min(1, (o.grain == null ? .5 : o.grain) + (V.grain || 0)), rauque = Math.min(1, (o.rauque || 0) + (V.rauque || 0)), gv = o.g == null ? .3 : o.g;
    var a = o.a || .012, fin = t + d;
    var env = o.env || [[0, 0], [a, 1], [d * .55, .78], [d, 0]];
    var x = ctx.createOscillator(); x.setPeriodicWave(vagueCri);
    x.frequency.setValueCurveAtTime(c, t, d);
    var j = ctx.createBufferSource(); j.buffer = A.lent; j.loop = true; j.playbackRate.value = o.gVit || 1.4;
    var jg = g(fm * .07 * grain); j.connect(jg); jg.connect(x.frequency);
    if(o.trille){ var lt = ctx.createOscillator(), ltg = g(fm * o.trille[1]); lt.frequency.value = o.trille[0]; lt.connect(ltg); ltg.connect(x.frequency); lt.start(t); lt.stop(fin + .05); }
    var amp = g(0), shim = g(1 - grain * .4), sg = g(grain * .55);
    j.connect(sg); sg.connect(shim.gain);
    var n = x;
    if(rauque){
      var sub = ctx.createOscillator(); sub.type = 'sawtooth';
      sub.frequency.setValueCurveAtTime(A.courbe(pts, d, f0 * .5), t, d);
      var subg = g(rauque * .45); sub.connect(subg);
      var m = g(1); x.connect(m); subg.connect(m);
      var pre = g(1 + rauque * 2.5); m.connect(pre);
      var w = A.sature(1 + rauque * 3.5); pre.connect(w); n = w;
      sub.start(t); sub.stop(fin + .05);
    }
    n = A.chaine(t, n, [{type:'highpass', f:o.hp || 800, q:.7}, {type:'peaking', f:f0 * 1.05, q:1.2, gain:4}, {type:'lowpass', f:o.lp || 9500, q:.5}]);
    n.connect(shim); shim.connect(amp); amp.connect(dest);
    A.env(amp.gain, t, env, gv * (rauque ? 1 / (1 + rauque * .9) : 1));
    j.start(t, hasard(0, 3)); j.stop(fin + .05);
    x.start(t); x.stop(fin + .05); nettoie(x, amp);
    /* le souffle du petit gosier, et l'attaque */
    var sf = o.souffle == null ? .18 : o.souffle;
    if(sf > 0){
      A.bruit(t, {bp:fm * 1.05, bq:2.2, env:env, g:gv * sf * 1.6}, dest);
      A.bruit(t, {hp:3500, env:[[0, 0], [.002, 1], [.018, 0]], g:gv * sf * .9}, dest);
    }
    if(rauque) A.bruit(t, {bp:fm * .9, bq:3, env:env, g:gv * rauque * .5, rugueux:.9, rugVit:6}, dest);
    return fin;
  };

  /* ---------- des tampons calculés : craquement de bois, crépitement, griffes ---------- */
  /* un grincement : des petits accrocs de plus en plus serrés (le bois qui frotte et qui accroche) */
  A.grincement = function(duree, o){
    o = o || {};
    var n = Math.floor(sr * duree), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    var t = 0, i0 = o.i0 || .03, i1 = o.i1 || .009, irr = o.irr == null ? .35 : o.irr;
    while(t < duree - .005){
      var u = t / duree, iv = i0 * Math.pow(i1 / i0, u);
      var amp = (o.forme ? o.forme(u) : Math.sin(Math.PI * Math.min(1, u * 1.2)) * .6 + .4) * hasard(.55, 1);
      var p = Math.floor(t * sr);
      for(var k = 0; k < 90 && p + k < n; k++) d[p + k] += amp * (Math.random() * 2 - 1) * Math.exp(-k / 9) * (k < 3 ? 2 : 1);
      t += iv * (1 + hasard(-irr, irr));
    }
    return b;
  };
  /* un crépitement : des petits « pops » au hasard, plus nombreux au début (densite : par seconde) */
  A.crepitement = function(duree, densite, o){
    o = o || {};
    var n = Math.floor(sr * duree), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0), t = 0;
    while(t < duree){
      var u = t / duree, dens = densite * (o.forme ? o.forme(u) : 1 - u * .6);
      t += -Math.log(1 - Math.random()) / Math.max(.5, dens);
      var p = Math.floor(t * sr), gros = Math.random() < .12, amp = (gros ? hasard(.7, 1) : hasard(.08, .4)) * (o.forme ? o.forme(u) : 1 - u * .5), len = gros ? hasard(60, 220) : hasard(10, 60);
      for(var k = 0; k < len * 3 && p + k < n; k++) d[p + k] += amp * (Math.random() * 2 - 1) * Math.exp(-k / len);
    }
    return b;
  };
  /* de l'eau qui coule : des centaines de petites bulles qui « plic » en montant (modèle de bulle de van den Doel) */
  A.eau = function(duree, densite, o){
    o = o || {};
    var n = Math.floor(sr * duree), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    var nb = Math.floor(duree * densite), fmin = o.fmin || 450, fmax = o.fmax || 2600;
    for(var k = 0; k < nb; k++){
      var f0 = fmin * Math.pow(fmax / fmin, Math.pow(Math.random(), .7));
      var dec = .13 * f0 + .0072 * Math.pow(f0, 1.5), amp = hasard(.2, 1) * Math.pow(fmin / f0, .5);
      var p0 = Math.floor(Math.random() * n), len = Math.min(Math.floor(sr * 5 / dec), 4000), ph = 0;
      for(var i = 0; i < len; i++){
        var tt = i / sr, f = f0 * (1 + .1 * dec * tt);
        ph += 2 * Math.PI * f / sr;
        d[(p0 + i) % n] += amp * Math.exp(-dec * tt) * Math.sin(ph) * Math.min(1, i / 8);
      }
    }
    var mx = 0, i2; for(i2 = 0; i2 < n; i2++){ var ax = Math.abs(d[i2]); if(ax > mx) mx = ax; }
    for(i2 = 0; i2 < n; i2++) d[i2] *= .9 / (mx || 1);
    return b;
  };
  /* des griffes qui trottinent vite sur la pierre */
  A.griffes = function(duree, vitesse){
    var n = Math.floor(sr * duree), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0), t = 0, k2 = 0;
    while(t < duree){
      var p = Math.floor(t * sr), amp = hasard(.3, 1) * (k2 % 4 === 0 ? 1 : .6);
      for(var k = 0; k < 120 && p + k < n; k++) d[p + k] += amp * (Math.random() * 2 - 1) * Math.exp(-k / 14);
      t += (1 / (vitesse || 22)) * hasard(.55, 1.35); k2++;
    }
    return b;
  };

  /* ---------- un écho (retard qui revient en s'assourdissant), gauche et droite décalés ---------- */
  A.echo = function(dest, o){
    o = o || {};
    var e = g(1), dl = ctx.createDelay(3), dr = ctx.createDelay(3), fb = g(o.retour == null ? .38 : o.retour), lp = ctx.createBiquadFilter();
    dl.delayTime.value = o.temps || .36; dr.delayTime.value = (o.temps || .36) * (o.decal || 1.5);
    lp.type = 'lowpass'; lp.frequency.value = o.lp || 2600;
    e.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl);
    lp.connect(dr);
    var s = o.sortie == null ? .7 : o.sortie;
    if(ctx.createStereoPanner){
      var pl = ctx.createStereoPanner(), pr = ctx.createStereoPanner(); pl.pan.value = -.6; pr.pan.value = .6;
      var gl = g(s), gr = g(s * .8); lp.connect(gl); gl.connect(pl); pl.connect(dest); dr.connect(gr); gr.connect(pr); pr.connect(dest);
    } else { var gs = g(s); lp.connect(gs); gs.connect(dest); }
    e.couper = function(){ try{ fb.gain.value = 0; e.disconnect(); }catch(x){} };
    return e;
  };

  /* ---------- des instruments (musiques, fanfares) ---------- */
  /* une cloche douce (modulation de fréquence) : o.rapport 3.5 = cloche, 2.76 = métal, 4 = boîte à musique */
  A.cloche = function(t, f, o, dest){
    o = o || {};
    var d = o.d || 2.5, r = o.rapport || 3.5, idx = o.indice == null ? 1.4 : o.indice, gg = o.g == null ? .1 : o.g;
    var car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = g(0), amp = g(0);
    car.frequency.value = f; mod.frequency.value = f * r;
    mg.gain.setValueAtTime(f * idx, t); mg.gain.exponentialRampToValueAtTime(f * idx * .04 + .01, t + d * .5);
    mod.connect(mg); mg.connect(car.frequency);
    A.env(amp.gain, t, [[0, 0], [o.a || .003, 1], [d * .22, .42], [d, 0]], gg);
    car.connect(amp); amp.connect(dest);
    car.start(t); mod.start(t); car.stop(t + d + .05); mod.stop(t + d + .05); nettoie(car, amp);
  };
  /* une harpe (corde pincée) */
  A.harpe = function(t, f, o, dest){
    o = o || {};
    var b = A.pince(f, {t60:o.t60 || 2.2, eclat:o.eclat == null ? .45 : o.eclat, pos:o.pos == null ? .2 : o.pos});
    return A.joue(t, b, {g:o.g == null ? .3 : o.g, lp:o.lp || 4500}, dest);
  };
  /* une goutte qui tombe dans l'eau : une petite note qui monte très vite */
  A.goutte = function(t, o, dest){
    o = o || {};
    var f = o.f || hasard(900, 1800);
    A.ton(t, {f:f, f2:f * (o.monte || 2.3), gl:o.gl || .022, env:[[0, 0], [.0015, 1], [.05, .3], [.11, 0]], g:o.g == null ? .08 : o.g}, dest);
  };
  /* un tambour grave et lointain */
  A.tambour = function(t, o, dest){
    o = o || {};
    var d = o.d || .6, gg = o.g == null ? .5 : o.g, f = o.f || 95;
    A.ton(t, {f:f, f2:f * .5, gl:d * .6, env:[[0, 0], [.004, 1], [d * .3, .4], [d, 0]], g:gg, sat:2, lp:700}, dest);
    A.bruit(t, {coul:'rose', lp:500, env:A.perc(.002, .12), g:gg * .5}, dest);
  };
  /* une corde frottée (violoncelle, alto) : deux dents de scie, la caisse, et le crin sur la corde */
  A.archet = function(t, f, d, o, dest){
    o = o || {};
    var a = o.a || .25, gg = o.g == null ? .06 : o.g, r = o.r || .3;
    var caisse = g(1), sortie = A.chaine(t, caisse, [{type:'peaking', f:290, q:1.6, gain:5}, {type:'peaking', f:1100, q:1.5, gain:3}, {type:'lowpass', f:o.lp || 2400, q:.6}]);
    sortie.connect(dest); A.plusTard(t - ctx.currentTime + d + .6, function(){ try{ sortie.disconnect(); }catch(e){} });
    [-5, 5].forEach(function(det){ A.ton(t, {type:'sawtooth', f:f, det:det, env:[[0, 0], [a, 1], [Math.max(a + .01, d - r), .85], [d, 0]], g:gg, vib:[5.2, f * .008], vibRetard:a + .2}, caisse); });
    A.bruit(t, {bp:Math.min(f * 3, 8000), bq:4, env:[[0, 0], [a, 1], [Math.max(a + .01, d - r), .7], [d, 0]], g:gg * 2}, caisse);
  };
  /* des voix lointaines sans paroles (des « ou », des « o », des « a ») : dents de scie et formants */
  A.FORMANTS = {ou:[[320, 1, 9], [800, .35, 10], [2500, .08, 12]], o:[[450, 1, 9], [800, .5, 10], [2830, .1, 12]], a:[[730, 1, 8], [1090, .5, 9], [2440, .15, 12]]};
  A.choeur = function(t, freqs, d, o, dest){
    o = o || {};
    var src = g(1), sortie = g(1), F = A.FORMANTS[o.voyelle || 'ou'];
    F.forEach(function(fm){
      var b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = fm[0]; b.Q.value = fm[2];
      var gk = g(fm[1] * 3); src.connect(b); b.connect(gk); gk.connect(sortie);
    });
    sortie.connect(dest); A.plusTard(t - ctx.currentTime + d + .6, function(){ try{ sortie.disconnect(); }catch(e){} });
    var a = o.a || 2.5, r = o.r || 3;
    freqs.forEach(function(f){
      [-7, 6].forEach(function(det){
        A.ton(t, {type:'sawtooth', f:f, det:det + hasard(-3, 3), env:[[0, 0], [a, 1], [Math.max(a + .01, d - r), .9], [d, 0]], g:o.g == null ? .05 : o.g, vib:[hasard(4.5, 5.5), f * .006], vibRetard:1}, src);
      });
    });
  };
  /* une nappe douce (des cordes très lointaines) : le filtre s'ouvre puis se referme */
  A.nappe = function(t, freqs, d, o, dest){
    o = o || {};
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = .6;
    lp.frequency.setValueAtTime(o.lp1 || 350, t); lp.frequency.linearRampToValueAtTime(o.lp || 1000, t + d * .45); lp.frequency.linearRampToValueAtTime(o.lp1 || 350, t + d);
    lp.connect(dest); A.plusTard(t - ctx.currentTime + d + .6, function(){ try{ lp.disconnect(); }catch(e){} });
    var a = o.a || 3, r = o.r || 3, gg = o.g == null ? .04 : o.g;
    freqs.forEach(function(f){
      A.ton(t, {type:o.type || 'sawtooth', f:f, det:-6, env:[[0, 0], [a, 1], [d - r, .9], [d, 0]], g:gg}, lp);
      A.ton(t, {type:'triangle', f:f, det:7, env:[[0, 0], [a, 1], [d - r, .9], [d, 0]], g:gg * 1.2}, lp);
    });
  };
  /* un pas de botte sur la pierre */
  A.pas = function(t, o, dest){
    o = o || {};
    var gg = o.g == null ? 1 : o.g;
    A.choc(t, {f:o.f || 115, f2:50, d:.075, g:.35 * gg, sat:2, bruit:.4}, dest);
    A.bruit(t, {bp:o.bp || 1800, bq:.9, env:A.perc(.001, .045), g:.22 * gg}, dest);
    A.bruit(t + .01, {hp:4500, env:A.perc(.001, .02), g:.05 * gg}, dest);
  };

  return A;
}

G.Moteur = Moteur;
G.Moteur.hasard = hasard; G.Moteur.choix = choix; G.Moteur.midi = midi;
})(window);
