// ===== SON : le moteur de sons (tout est fabriqué en direct, aucun fichier) =====
const Son = (() => {
  let ac = null;
  const N = {};
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const ksCache = new Map();

  function gainTo(dest, v) { const g = ac.createGain(); g.gain.value = v; g.connect(dest); return g; }
  function filtre(type, f, q, dest) {
    const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f;
    if (q != null) b.Q.value = q; b.connect(dest); return b;
  }
  function osc(type, f, t, dur, dest) {
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    o.connect(dest); o.start(t); o.stop(t + dur); return o;
  }
  function bruit(t, dur, dest) {
    const s = ac.createBufferSource(); s.buffer = N.bruit; s.connect(dest);
    s.start(t, Math.random() * 0.6); s.stop(t + dur); return s;
  }
  // enveloppe : monte en a, redescend en d
  function vca(t, a, v, d, dest) {
    const g = ac.createGain(); v = Math.max(v, 0.0002);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    g.connect(dest); return g;
  }
  // enveloppe tenue : monte, tient (en baissant un peu), relâche
  function vcaTenu(t, a, v, dur, rel, dest, garde = 0.7) {
    const g = ac.createGain(); v = Math.max(v, 0.0002);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.setTargetAtTime(v * garde, t + a, Math.max(0.03, dur * 0.4));
    g.gain.setValueAtTime(v * garde, t + Math.max(dur, a + 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, a + 0.01) + rel);
    g.connect(dest); return g;
  }
  function envoi(node, bus, v) { const g = ac.createGain(); g.gain.value = v; node.connect(g); g.connect(bus); }
  function vibrato(t, dur, targets, prof = 14, vit = 5.6, delai = 0.12) {
    if (dur < 0.2) return;
    const l = ac.createOscillator(); l.frequency.value = vit;
    const lg = ac.createGain(); lg.gain.setValueAtTime(0, t);
    lg.gain.setValueAtTime(0, t + delai); lg.gain.linearRampToValueAtTime(prof, t + Math.min(dur, delai + 0.3));
    l.connect(lg); for (const o of targets) lg.connect(o.detune);
    l.start(t); l.stop(t + dur + 0.2);
  }

  function construire(contexte) {
    ac = contexte;
    const c = ac;
    // la chaîne finale : un compresseur doux qui « colle » le mélange, puis un limiteur qui empêche de saturer
    N.comp = c.createDynamicsCompressor();
    N.comp.threshold.value = -16; N.comp.knee.value = 8; N.comp.ratio.value = 3;
    N.comp.attack.value = 0.01; N.comp.release.value = 0.2;
    N.lim = c.createDynamicsCompressor();
    N.lim.threshold.value = -4; N.lim.knee.value = 0; N.lim.ratio.value = 20;
    N.lim.attack.value = 0.001; N.lim.release.value = 0.08;
    N.sortie = c.createGain(); N.sortie.gain.value = 0.92;
    N.master = c.createGain();
    N.master.connect(N.comp); N.comp.connect(N.lim); N.lim.connect(N.sortie); N.sortie.connect(c.destination);
    N.chanson = gainTo(N.master, 1); // le volume propre à chaque chanson (les boutons n'en dépendent pas)
    N.drums = gainTo(N.chanson, 0.9);
    N.pompe = c.createGain(); N.pompe.connect(N.chanson);
    N.music = gainTo(N.pompe, 0.85);
    N.basse = gainTo(N.pompe, 0.36); // les basses ont leur propre « tuyau » (elles respirent avec le kick)
    N.lead = gainTo(N.chanson, 0.75);
    N.voix = gainTo(N.master, 0.95);
    N.sfx = gainTo(N.master, 1.25);
    // bruit blanc
    const len = Math.floor(c.sampleRate * 2.4);
    N.bruit = c.createBuffer(1, len, c.sampleRate);
    const d = N.bruit.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    // réverbération : une « salle » par chanson (taverne, forge, cathédrale, club)
    N.revIn = c.createGain();
    N.revRet = gainTo(N.master, 0.42);
    N.revLp = filtre('lowpass', 5200, 0.5, N.revRet);
    N.rev = null; N.salle = '';
    salle('pierre');
    // écho calé sur le tempo
    N.dly = c.createDelay(2); N.dly.delayTime.value = 0.375;
    N.dlyFb = c.createGain(); N.dlyFb.gain.value = 0.3;
    N.dlyLp = c.createBiquadFilter(); N.dlyLp.type = 'lowpass'; N.dlyLp.frequency.value = 2600;
    N.dlyIn = c.createGain();
    N.dlyIn.connect(N.dly); N.dly.connect(N.dlyLp); N.dlyLp.connect(N.dlyFb); N.dlyFb.connect(N.dly);
    N.dlyLp.connect(gainTo(N.master, 0.32));
    // onde « pulse 25 % » (le son des vieilles consoles)
    const n = 48, re = new Float32Array(n + 1), im = new Float32Array(n + 1);
    for (let k = 1; k <= n; k++) re[k] = 2 * Math.sin(k * Math.PI * 0.25) / (k * Math.PI);
    N.pulse = c.createPeriodicWave(re, im);
    // courbe de distorsion (la guitare)
    // (un nombre impair de points : le milieu vaut exactement 0, sinon chaque distorsion ajoute un petit courant continu)
    const cv = new Float32Array(1025);
    for (let i = 0; i < 1025; i++) { const x = i / 512 - 1; cv[i] = Math.tanh(x * 3.2) / Math.tanh(3.2); }
    N.dist = cv;
  }

  // Grosbec coupe la musique : batterie, instruments et mélodie se taisent d'un coup (la voix et les bruits restent)
  const BASE = { drums: 0.9, music: 0.85, lead: 0.75, basse: 0.36 };
  function couper(t) { for (const k in BASE) { const p = N[k].gain; p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.setTargetAtTime(0.0001, t, 0.015); } }
  function retablir(t) { for (const k in BASE) { const p = N[k].gain; p.cancelScheduledValues(t); p.setValueAtTime(0.0001, t); p.setTargetAtTime(BASE[k], t, 0.01); } }

  function volume(db, t) { if (ac) { const p = N.chanson.gain; p.cancelScheduledValues(t); p.setTargetAtTime(Math.pow(10, (db || 0) / 20), t, 0.03); } }
  function tempo(bpm) { if (ac) N.dly.delayTime.setValueAtTime(60 / bpm * 0.75, ac.currentTime); }

  function pomper(t, sp) {
    const p = N.pompe.gain;
    p.cancelScheduledValues(t); p.setValueAtTime(0.45, t); p.setTargetAtTime(1, t + 0.015, sp * 0.13);
  }

  // corde pincée (Karplus-Strong) pour le luth
  function ksBuf(m) {
    if (ksCache.has(m)) return ksCache.get(m);
    const sr = ac.sampleRate, len = Math.floor(sr * 0.9), b = ac.createBuffer(1, len, sr), d = b.getChannelData(0);
    const P = Math.max(2, Math.round(sr / mtof(m))), buf = new Float32Array(P);
    let prev = 0; for (let i = 0; i < P; i++) { const r = Math.random() * 2 - 1; prev = prev * 0.5 + r * 0.5; buf[i] = prev; }
    let k = 0;
    for (let i = 0; i < len; i++) { const a = buf[k], b2 = buf[(k + 1) % P]; d[i] = a; buf[k] = 0.4985 * (a + b2); k = (k + 1) % P; }
    ksCache.set(m, b); return b;
  }

  // ---------- version 5 : la stéréo, les salles, les vraies cordes pincées ----------
  // placer un son à gauche (-1) ou à droite (+1)
  function pan(dest, p) {
    if (!p || !ac.createStereoPanner) return dest;
    const s = ac.createStereoPanner(); s.pan.value = Math.max(-1, Math.min(1, p)); s.connect(dest); return s;
  }
  // les salles : durée de l'écho, premiers rebonds sur les murs, clarté, volume
  const SALLES = {
    pierre: { dur: 2.1, pente: 5.5, er: [], lp: 5200, ret: 0.42 },
    taverne: { dur: 1.0, pente: 6.5, er: [[0.009, 0.45], [0.016, 0.35], [0.023, 0.3], [0.031, 0.22], [0.044, 0.15]], lp: 6500, ret: 0.4 },
    forge: { dur: 1.7, pente: 6, er: [[0.017, 0.4], [0.029, 0.3], [0.043, 0.22], [0.061, 0.15]], lp: 4600, ret: 0.42 },
    cathedrale: { dur: 3.0, pente: 5.6, er: [[0.027, 0.3], [0.045, 0.24], [0.071, 0.18], [0.097, 0.12]], lp: 5200, ret: 0.5 },
    club: { dur: 1.4, pente: 6.8, er: [[0.007, 0.3], [0.013, 0.2], [0.021, 0.14]], lp: 7500, ret: 0.36 },
  };
  function salle(nom) {
    const Sx = SALLES[nom] || SALLES.pierre;
    if (!ac || N.salle === nom) return;
    N.salle = nom;
    const sr = ac.sampleRate, rl = Math.floor(sr * Sx.dur), ir = ac.createBuffer(2, rl, sr);
    for (let ch = 0; ch < 2; ch++) {
      const x = ir.getChannelData(ch);
      for (let i = 0; i < rl; i++) { const u = i / rl; x[i] = (Math.random() * 2 - 1) * Math.exp(-Sx.pente * u) * (1 - u) * (i < 240 ? i / 240 : 1); }
      for (const [d, a] of Sx.er) { const k = Math.floor((d + (ch ? 0.0041 : 0)) * sr); if (k < rl) x[k] += a * (Math.random() < 0.5 ? -1 : 1); }
    }
    const nv = ac.createConvolver(); nv.buffer = ir; nv.connect(N.revLp); N.revIn.connect(nv);
    const old = N.rev;
    if (old) { try { N.revIn.disconnect(old); } catch (e) {} setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 4000); }
    N.rev = nv; N.revLp.frequency.value = Sx.lp; N.revRet.gain.value = Sx.ret;
  }
  // les cordes pincées : durée du tampon, temps d'extinction, clarté de l'attaque, endroit du doigt, perte (0,5 = sombre)
  const CORDES = {
    luth: { dur: 1.5, t60: 1.7, clair: 0.75, pos: 0.16, perte: 0.4 },
    harpe: { dur: 2.0, t60: 2.6, clair: 0.5, pos: 0.12, perte: 0.48 },
    oud: { dur: 1.3, t60: 1.4, clair: 0.42, pos: 0.23, perte: 0.5 },
    pizz: { dur: 0.6, t60: 0.5, clair: 0.55, pos: 0.2, perte: 0.5 },
    cb: { dur: 0.9, t60: 1.0, clair: 0.3, pos: 0.22, perte: 0.5 },
    clavecin: { dur: 1.4, t60: 1.9, clair: 0.95, pos: 0.07, perte: 0.3 },
  };
  // la caisse de résonance de chaque instrument : [type, fréquence, Q, gain]
  const CORPS = {
    luth: [['peaking', 230, 1.2, 4], ['peaking', 2600, 1.4, 3], ['highpass', 90, 0.7]],
    harpe: [['peaking', 300, 1, 2], ['lowpass', 7000, 0.5]],
    oud: [['peaking', 150, 1, 6], ['peaking', 950, 1.2, -3], ['lowpass', 3400, 0.6]],
    pizz: [['peaking', 320, 1, 4], ['lowpass', 4500, 0.6]],
    cb: [['peaking', 95, 1, 6], ['lowpass', 1800, 0.6]],
    clavecin: [['peaking', 1900, 1.2, 4], ['highpass', 160, 0.7]],
  };
  function ksCorde(type, m) {
    const cle = type + m; if (ksCache.has(cle)) return ksCache.get(cle);
    const C = CORDES[type], sr = ac.sampleRate, len = Math.floor(sr * C.dur), b = ac.createBuffer(1, len, sr), d = b.getChannelData(0);
    const f = mtof(m), P = Math.max(2, Math.round(sr / f + C.perte)), buf = new Float32Array(P);
    let lp = 0; const a = 0.12 + 0.88 * C.clair;
    for (let i = 0; i < P; i++) { lp += a * ((Math.random() * 2 - 1) - lp); buf[i] = lp; }
    const k0 = Math.max(1, Math.round(C.pos * P)), ex = Float32Array.from(buf);
    let moy = 0; for (let i = 0; i < P; i++) { buf[i] = ex[i] - ex[(i + k0) % P]; moy += buf[i]; } moy /= P;
    let mx = 0; for (let i = 0; i < P; i++) { buf[i] -= moy; mx = Math.max(mx, Math.abs(buf[i])); }
    for (let i = 0; i < P; i++) buf[i] /= mx || 1;
    const gg = Math.pow(0.001, 1 / (f * C.t60)), Sp = C.perte;
    let k = 0;
    for (let i = 0; i < len; i++) { const x0 = buf[k], x1 = buf[(k + 1) % P]; d[i] = x0; buf[k] = gg * ((1 - Sp) * x0 + Sp * x1); k = (k + 1) % P; }
    ksCache.set(cle, b); return b;
  }
  // le charleston métallique : six ondes carrées désaccordées, filtrées vers l'aigu, calculées une seule fois
  const hats = {};
  function hatBuf(ouvert) {
    const cle = ouvert ? 'o' : 'f'; if (hats[cle]) return hats[cle];
    const sr = ac.sampleRate, d = ouvert ? 0.3 : 0.06, n = Math.floor(sr * d), b = ac.createBuffer(1, n, sr), x = b.getChannelData(0);
    const fs = [205.3, 304.4, 369.6, 522.7, 540, 800].map(f => f * 1.7);
    for (let i = 0; i < n; i++) { let v = 0; for (const f of fs) v += ((i * f / sr) % 1) < 0.5 ? 1 : -1; x[i] = v / 6; }
    // deux passe-haut (7 kHz) puis l'enveloppe
    const w = 2 * Math.PI * 7200 / sr, al = Math.sin(w) / (2 * 0.7), c = Math.cos(w), a0 = 1 + al;
    const b0 = (1 + c) / 2 / a0, b1 = -(1 + c) / a0, b2 = b0, a1 = -2 * c / a0, a2 = (1 - al) / a0;
    for (let pass = 0; pass < 2; pass++) { let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < n; i++) { const x0 = x[i], y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x0; y2 = y1; y1 = y0; x[i] = y0; } }
    const tau = ouvert ? 0.08 : 0.012;
    for (let i = 0; i < n; i++) x[i] *= Math.exp(-i / sr / tau) * (i < 20 ? i / 20 : 1);
    return (hats[cle] = b);
  }
  // un peu de souffle sur un son tenu, sans créer une source de bruit par note trop longue
  function souffle(t, dur, f, q, v, dest) { bruit(t, Math.min(dur, 2.2), filtre('bandpass', Math.min(f, 9000), q, vcaTenu(t, 0.03, v, Math.min(dur, 2.1), 0.06, dest))); }

  const I = {
    kick(t, v = 1, sp = 0.5) {
      const g = vca(t, 0.003, v, 0.34, N.drums);
      const o = osc('sine', 150, t, 0.42, g); o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
      const g2 = vca(t, 0.002, v * 0.5, 0.06, N.drums);
      const o2 = osc('triangle', 290, t, 0.09, g2); o2.frequency.exponentialRampToValueAtTime(110, t + 0.05);
      bruit(t, 0.02, filtre('highpass', 2600, 0.7, vca(t, 0.001, v * 0.22, 0.012, N.drums)));
      pomper(t, sp);
    },
    snare(t, v = 0.55) {
      const g = vca(t, 0.002, v, 0.17, N.drums);
      bruit(t, 0.24, filtre('bandpass', 1900, 0.6, g));
      const g2 = vca(t, 0.002, v * 0.55, 0.09, N.drums);
      const o = osc('triangle', 215, t, 0.12, g2); o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      envoi(g, N.revIn, 0.22);
    },
    clap(t, v = 0.45) {
      const bp = filtre('bandpass', 1150, 1.1, N.drums);
      for (let i = 0; i < 3; i++) bruit(t + i * 0.011, 0.03, vca(t + i * 0.011, 0.001, v, 0.012, bp));
      bruit(t + 0.033, 0.22, vca(t + 0.033, 0.001, v * 0.9, 0.16, bp));
      envoi(bp, N.revIn, 0.3);
    },
    hat(t, v = 0.12, ouvert = false) {
      const g = vca(t, 0.001, v * 1.5, ouvert ? 0.24 : 0.035, N.drums);
      bruit(t, ouvert ? 0.3 : 0.06, filtre('highpass', ouvert ? 7000 : 8200, 0.5, g));
    },
    tamb(t, v = 0.14) {
      const bp = filtre('bandpass', 8800, 2.2, N.drums);
      for (let i = 0; i < 3; i++) bruit(t + i * 0.008, 0.06, vca(t + i * 0.008, 0.001, v * (1 - i * 0.25), 0.045, bp));
    },
    crash(t, v = 0.3) {
      const g = vca(t, 0.002, v, 1.5, N.drums);
      bruit(t, 1.6, filtre('highpass', 4300, 0.4, g));
      envoi(g, N.revIn, 0.35);
    },
    tom(t, f, v = 0.5) {
      const g = vca(t, 0.002, v, 0.24, N.drums);
      const o = osc('sine', f * 1.7, t, 0.3, g); o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    },
    basse(t, m, dur, v = 0.42, br = 1) {
      const f = mtof(m);
      const g = vcaTenu(t, 0.004, v, dur * 0.75, dur * 0.3, N.music, 0.8);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 7;
      lp.frequency.setValueAtTime(320 + 2200 * br, t); lp.frequency.exponentialRampToValueAtTime(300 + 260 * br, t + 0.17);
      lp.connect(g);
      osc('sawtooth', f, t, dur + 0.05, lp);
      osc('square', f / 2, t, dur + 0.05, gainTo(lp, 0.35));
    },
    arp(t, m, v = 0.1, cut = 2600) {
      const g = vca(t, 0.003, v, 0.12, N.music);
      osc('square', mtof(m), t, 0.16, filtre('lowpass', cut, 1, g));
      envoi(g, N.dlyIn, 0.35);
    },
    cloche(t, m, dur, v = 0.2) {
      const f = mtof(m);
      const g = vca(t, 0.002, v, 0.3 + dur * 0.5, N.lead); osc('triangle', f, t, 1.3, g);
      osc('sine', f * 2, t, 0.7, vca(t, 0.002, v * 0.4, 0.4, N.lead));
      osc('sine', f * 4, t, 0.3, vca(t, 0.001, v * 0.25, 0.12, N.lead));
      envoi(g, N.dlyIn, 0.4); envoi(g, N.revIn, 0.35);
    },
    lead(t, m, dur, v = 0.12) {
      const f = mtof(m);
      const g = vcaTenu(t, 0.008, v, dur, 0.09, N.lead, 0.72);
      const lp = filtre('lowpass', 3400, 0.8, g);
      const o1 = ac.createOscillator(); o1.setPeriodicWave(N.pulse); o1.frequency.setValueAtTime(f, t);
      const o2 = ac.createOscillator(); o2.type = 'sawtooth'; o2.frequency.setValueAtTime(f, t); o2.detune.value = 8;
      o1.connect(lp); o2.connect(gainTo(lp, 0.45));
      o1.start(t); o2.start(t); o1.stop(t + dur + 0.12); o2.stop(t + dur + 0.12);
      vibrato(t, dur, [o1, o2], 14);
      envoi(g, N.dlyIn, 0.28); envoi(g, N.revIn, 0.22);
    },
    stab(t, ms, v = 0.06, dur = 0.16) {
      const g = vca(t, 0.004, v, dur, N.music);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur); lp.connect(g);
      for (const m of ms) for (const dt of [-9, 9]) { const o = osc('sawtooth', mtof(m), t, dur + 0.06, lp); o.detune.value = dt; }
      envoi(g, N.revIn, 0.2);
    },
    nappe(t, ms, dur, v = 0.035, cut = 1400) {
      const g = vcaTenu(t, 0.35, v, dur, 0.6, N.music, 1);
      const lp = filtre('lowpass', cut, 0.7, g);
      for (const m of ms) for (const dt of [-11, 0, 11]) { const o = osc('sawtooth', mtof(m), t, dur + 0.7, lp); o.detune.value = dt; }
      envoi(g, N.revIn, 0.5);
    },
    // la guitare du solo
    guitare(t, m, dur, v = 0.2) {
      const f = mtof(m);
      const pre = ac.createGain(); pre.gain.value = 2.4;
      const ws = ac.createWaveShaper(); ws.curve = N.dist; ws.oversample = '2x';
      const g = vcaTenu(t, 0.005, v, dur, 0.1, N.lead, 0.8);
      const lp = filtre('lowpass', 4300, 0.7, g);
      const pk = filtre('peaking', 950, 1, lp); pk.gain.value = 4;
      const hp = filtre('highpass', 130, 0.7, pk);
      pre.connect(ws); ws.connect(hp);
      const o1 = osc('sawtooth', f, t, dur + 0.15, pre);
      const o2 = osc('sawtooth', f, t, dur + 0.15, pre); o2.detune.value = 7;
      osc('square', f / 2, t, dur + 0.15, gainTo(pre, 0.3));
      vibrato(t, dur, [o1, o2], 22, 6, 0.14);
      bruit(t, 0.03, filtre('bandpass', 3200, 1.5, vca(t, 0.001, v * 0.5, 0.02, N.lead)));
      envoi(g, N.dlyIn, 0.22); envoi(g, N.revIn, 0.25);
    },
    // accord de puissance étouffé (la guitare d'accompagnement)
    chug(t, m, dur = 0.1, v = 0.07) {
      const f = mtof(m);
      const pre = ac.createGain(); pre.gain.value = 2.2;
      const ws = ac.createWaveShaper(); ws.curve = N.dist;
      const g = vca(t, 0.003, v, dur, N.music);
      const lp = filtre('lowpass', 1500, 0.8, g);
      pre.connect(ws); ws.connect(filtre('highpass', 90, 0.7, lp));
      osc('sawtooth', f, t, dur + 0.05, pre);
      osc('sawtooth', f * 1.4983, t, dur + 0.05, pre);
      osc('sawtooth', f * 2, t, dur + 0.05, gainTo(pre, 0.6));
    },
    // le chant du Barde : une voix « Aaah » + une corde de luth pincée
    voix(t, m, dur, v = 0.26, voy = 0, bus) {
      const f = mtof(m);
      const F = [[800, 1150, 2900], [450, 800, 2830], [350, 2000, 2800]][voy];
      const A = [[1, 0.5, 0.22], [1, 0.45, 0.18], [1, 0.3, 0.2]][voy];
      const g = vcaTenu(t, 0.02, v, dur, 0.14, bus || N.voix, 0.75);
      const src = ac.createGain(); src.gain.value = 1;
      F.forEach((ff, i) => { const bp = filtre('bandpass', ff, 7, gainTo(g, A[i] * 1.8)); src.connect(bp); });
      const o1 = osc('sawtooth', f, t, dur + 0.2, src);
      const o2 = osc('sawtooth', f, t, dur + 0.2, src); o2.detune.value = 7;
      osc('triangle', f, t, dur + 0.2, gainTo(g, 0.18));
      vibrato(t, dur, [o1, o2], 24, 5.2, 0.07);
      envoi(g, N.revIn, 0.35); envoi(g, N.dlyIn, 0.14);
    },
    pince(t, m, v = 0.4) {
      const s = ac.createBufferSource(); s.buffer = ksBuf(m);
      const g = vca(t, 0.001, v, 0.85, N.lead);
      s.connect(filtre('lowpass', 5000, 0.5, g)); s.start(t); s.stop(t + 0.9);
      envoi(g, N.revIn, 0.25);
    },
    ding(t, m, v = 0.14) {
      const f = mtof(m);
      osc('sine', f * 2, t, 0.6, vca(t, 0.001, v, 0.5, N.sfx));
      osc('sine', f * 5.04, t, 0.25, vca(t, 0.001, v * 0.35, 0.18, N.sfx));
      bruit(t, 0.08, filtre('highpass', 6000, 0.6, vca(t, 0.001, v * 0.9, 0.06, N.sfx)));
    },
    bong(t) {
      for (const [f, v, d] of [[330, 0.18, 0.5], [897, 0.09, 0.35], [1460, 0.05, 0.2]])
        osc('sine', f, t, d + 0.05, vca(t, 0.001, v, d, N.sfx));
    },
    couac(t, m) {
      const f = mtof(m);
      const g = vca(t, 0.01, 0.16, 0.26, N.sfx);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
      bp.frequency.setValueAtTime(1300, t); bp.frequency.exponentialRampToValueAtTime(450, t + 0.25); bp.connect(g);
      const o = osc('square', f, t, 0.3, bp); o.frequency.exponentialRampToValueAtTime(f * 0.78, t + 0.24);
      const o2 = osc('square', f * 1.06, t, 0.3, bp); o2.frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.24);
    },
    tchac(t) { // une note de solo ratée : la corde étouffée
      bruit(t, 0.06, filtre('bandpass', 900, 2, vca(t, 0.001, 0.12, 0.05, N.sfx)));
      osc('square', 110, t, 0.06, filtre('lowpass', 600, 1, vca(t, 0.001, 0.08, 0.05, N.sfx)));
    },
    vent(t) {
      const g = vca(t, 0.05, 0.22, 0.2, N.sfx);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(4200, t + 0.24); bp.connect(g);
      bruit(t, 0.3, bp);
    },
    aie(t) {
      const o = osc('square', 300, t, 0.22, filtre('lowpass', 1200, 1, vca(t, 0.002, 0.14, 0.2, N.sfx)));
      o.frequency.exponentialRampToValueAtTime(90, t + 0.2);
      bruit(t, 0.12, filtre('lowpass', 500, 0.7, vca(t, 0.001, 0.4, 0.1, N.sfx)));
    },
    clang(t, v = 0.16) { // un automate frappe
      bruit(t, 0.1, filtre('bandpass', 2400, 3, vca(t, 0.001, v, 0.08, N.sfx)));
      osc('square', 180, t, 0.08, filtre('lowpass', 900, 1, vca(t, 0.001, v * 0.6, 0.06, N.sfx)));
    },
    boom(t) {
      const g = vca(t, 0.004, 1, 0.9, N.sfx);
      const o = osc('sine', 120, t, 1, g); o.frequency.exponentialRampToValueAtTime(30, t + 0.8);
      bruit(t, 0.9, filtre('lowpass', 700, 0.7, vca(t, 0.002, 0.6, 0.7, N.sfx)));
      envoi(g, N.revIn, 0.4);
      I.crash(t, 0.4);
    },
    montee(t, dur) {
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05); g.connect(N.sfx);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(7000, t + dur); bp.connect(g);
      bruit(t, dur + 0.05, bp);
      envoi(g, N.revIn, 0.3);
    },
    bec(t) { // Grosbec frappe le sol
      I.boom(t);
      for (const [f, v] of [[220, 0.15], [587, 0.08]]) osc('square', f, t, 0.3, filtre('lowpass', 1500, 1, vca(t, 0.001, v, 0.25, N.sfx)));
    },
    scratch(t) { // le disque qu'on arrête net
      const g = vca(t, 0.004, 0.32, 0.6, N.sfx);
      const o = osc('sawtooth', 340, t, 0.65, filtre('lowpass', 1800, 2, g)); o.frequency.exponentialRampToValueAtTime(28, t + 0.6);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4;
      bp.frequency.setValueAtTime(3200, t); bp.frequency.exponentialRampToValueAtTime(260, t + 0.32); bp.connect(vca(t, 0.002, 0.35, 0.3, N.sfx));
      bruit(t, 0.34, bp);
    },
    rire(t) { [50, 49, 47, 45].forEach((m, i) => I.voix(t + i * 0.2, m, 0.14, 0.32, 0)); },
    tic(t, fort) { osc('square', fort ? 1760 : 1320, t, 0.03, filtre('bandpass', 1900, 3, vca(t, 0.001, fort ? 0.2 : 0.12, 0.02, N.sfx))); },
    repousse(t, ms) { // le grand accord
      const g = vca(t, 0.004, 0.13, 0.5, N.sfx);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
      lp.frequency.setValueAtTime(4500, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.45); lp.connect(g);
      for (const m of ms) for (const dt of [-10, 10]) { const o = osc('sawtooth', mtof(m), t, 0.6, lp); o.detune.value = dt; }
      const w = vca(t, 0.01, 0.25, 0.3, N.sfx); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1;
      bp.frequency.setValueAtTime(600, t); bp.frequency.exponentialRampToValueAtTime(3000, t + 0.3); bp.connect(w); bruit(t, 0.35, bp);
      envoi(g, N.revIn, 0.4);
    },
    stop(t, m) { // le point d'orgue : un accord de cristal qui reste suspendu
      for (const [dm, v] of [[24, 0.09], [31, 0.06], [36, 0.04]]) {
        const g = vcaTenu(t, 0.01, v, 0.6, 0.5, N.sfx, 0.8);
        const o = osc('sine', mtof(m + dm), t, 1.2, g);
        const l = ac.createOscillator(); l.frequency.value = 9; const lg = ac.createGain(); lg.gain.value = 18; l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + 1.2);
        envoi(g, N.revIn, 0.5);
      }
      bruit(t, 0.05, filtre('highpass', 7000, 0.7, vca(t, 0.001, 0.25, 0.04, N.sfx)));
    },
    vague(t) {
      const g = vca(t, 0.03, 0.22, 0.35, N.sfx); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(2400, t + 0.3); bp.connect(g); bruit(t, 0.4, bp);
      [76, 81, 88].forEach((m, i) => osc('sine', mtof(m), t + i * 0.04, 0.4, vca(t + i * 0.04, 0.005, 0.06, 0.3, N.sfx)));
      envoi(g, N.revIn, 0.3);
    },
    lancer(t) { const g = vca(t, 0.01, 0.12, 0.12, N.sfx); const bp = filtre('bandpass', 1400, 1.2, g); bruit(t, 0.15, bp); },
    // ----- GROSBEC : sa voix sombre et son armure (version 9 — Romain : « des gémissements, des cris sombres, des bruits métalliques
    // quand il bouge ; tu les mets en fond pour pas que ça gêne la musique ») -----
    // sa voix : deux scies graves dans une « gorge » (deux résonances), rauque (elle tremble 31 fois par seconde), étouffée par le casque.
    // sorte : 'allez' (deux coups : « al-lez ! »), 'cri' (long, qui descend), 'mal' (une plainte), 'grogne'
    grosVoix(t, sorte = 'allez', v = 1) {
      const P = { allez: [[0, 0.17, 96, 108, 700, 1150], [0.21, 0.3, 102, 76, 450, 1700]], cri: [[0, 1.0, 124, 60, 620, 1050]], mal: [[0, 0.75, 86, 68, 380, 820]], grogne: [[0, 0.42, 74, 62, 340, 760]] }[sorte] || [];
      for (const [d, dur, f0, f1, F1, F2] of P) {
        const t0 = t + d, sortie = vcaTenu(t0, 0.035, 0.3 * v, dur, 0.14, N.sfx, 0.75), bas = filtre('lowpass', 2200, 0.7, sortie);
        const rauque = ac.createGain(); rauque.gain.value = 0.7; rauque.connect(bas); osc('sawtooth', 31, t0, dur + 0.25, gainTo(rauque.gain, 0.3));
        const b1 = filtre('bandpass', F1, 5, rauque), b2 = filtre('bandpass', F2, 7, gainTo(rauque, 0.6)), gr = filtre('lowpass', 260, 0.7, gainTo(rauque, 0.9));
        for (const k of [1, 1.008, 0.5]) { const o = osc(k === 0.5 ? 'square' : 'sawtooth', f0 * k, t0, dur + 0.25, gainTo(b1, k === 0.5 ? 0.5 : 1)); o.frequency.exponentialRampToValueAtTime(f1 * k, t0 + dur); o.connect(b2); o.connect(gr); }
        bruit(t0, dur + 0.1, filtre('bandpass', F2, 2, vcaTenu(t0, 0.03, 0.045 * v, dur, 0.1, N.sfx)));
      }
    },
    // son armure : un grincement (deux plaques qui frottent), puis un « clang » sourd. lourd : un gros coup
    grosMetal(t, v = 1, lourd = false) {
      const g = vca(t, 0.004, 0.13 * v, lourd ? 0.5 : 0.26, N.sfx);
      for (const [f, a] of [[311, 1], [523, 0.7], [847, 0.5], [1373, 0.35], [2217, 0.2]]) osc('triangle', f * (lourd ? 0.62 : 1) * (0.97 + Math.random() * 0.06), t, 0.6, gainTo(g, a * 0.5));
      bruit(t, 0.06, filtre('bandpass', lourd ? 900 : 2400, 1.5, vca(t, 0.002, 0.16 * v, 0.05, N.sfx)));
      const tg = Math.max(ac.currentTime, t - 0.16), bp = filtre('bandpass', 1500, 9, vcaTenu(tg, 0.05, 0.04 * v, 0.14, 0.05, N.sfx)); bruit(tg, 0.22, bp); bp.frequency.setValueAtTime(1500, tg); bp.frequency.linearRampToValueAtTime(2600, tg + 0.16);
    },
    // un golem qui retombe sur les dalles ; une lourde porte de bronze qui s'ouvre
    choc(t, v = 1) { const g = vca(t, 0.003, 0.45 * v, 0.3, N.sfx); const o = osc('sine', 110, t, 0.36, g); o.frequency.exponentialRampToValueAtTime(38, t + 0.16); bruit(t, 0.12, filtre('lowpass', 700, 0.8, vca(t, 0.002, 0.28 * v, 0.1, N.sfx))); },
    porte(t, v = 1) {
      bruit(t, 0.5, filtre('lowpass', 180, 1, vcaTenu(t, 0.05, 0.2 * v, 0.35, 0.15, N.sfx)));
      const bp = filtre('bandpass', 700, 12, vcaTenu(t, 0.06, 0.03 * v, 0.3, 0.1, N.sfx)); bruit(t, 0.5, bp); bp.frequency.setValueAtTime(600, t); bp.frequency.exponentialRampToValueAtTime(1500, t + 0.4);
    },
    renvoi(t) { for (const [f, v, d] of [[880, 0.12, 0.4], [1760, 0.06, 0.25], [2637, 0.04, 0.15]]) osc('sine', f, t, d + 0.05, vca(t, 0.001, v, d, N.sfx)); },
    non(t) { osc('triangle', 180, t, 0.12, vca(t, 0.005, 0.1, 0.1, N.sfx)); },
    bois(t, v = 0.15, fort = false) { // le bloc de bois des rouages
      const f = fort ? 1180 : 1560;
      osc('sine', f, t, 0.07, vca(t, 0.001, v, 0.05, N.drums));
      osc('triangle', f * 2.71, t, 0.03, vca(t, 0.001, v * 0.3, 0.02, N.drums));
      bruit(t, 0.015, filtre('bandpass', 3200, 2, vca(t, 0.001, v * 0.5, 0.01, N.drums)));
    },
    clav(t, ms, v = 0.05) { // clavinette funky
      const g = vca(t, 0.002, v, 0.12, N.music);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.2;
      bp.frequency.setValueAtTime(2600, t); bp.frequency.exponentialRampToValueAtTime(800, t + 0.11); bp.connect(g);
      for (const m of ms) osc('square', mtof(m + 12), t, 0.15, bp);
    },
    enclume(t, v = 0.12) { // le marteau sur l'enclume
      for (const [f, a, d] of [[1520, 1, 0.5], [2390, 0.6, 0.35], [3970, 0.4, 0.22], [5210, 0.22, 0.14]])
        osc('sine', f, t, d + 0.05, vca(t, 0.001, v * a, d, N.drums));
      bruit(t, 0.03, filtre('highpass', 3000, 0.7, vca(t, 0.001, v * 1.2, 0.02, N.drums)));
    },
    taiko(t, f, v = 0.7) { // les grands tambours
      const g = vca(t, 0.002, v, 0.45, N.drums);
      const o = osc('sine', f * 1.8, t, 0.5, g); o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
      osc('triangle', f * 2.9, t, 0.1, vca(t, 0.001, v * 0.3, 0.06, N.drums));
      bruit(t, 0.08, filtre('lowpass', 900, 0.8, vca(t, 0.001, v * 0.5, 0.06, N.drums)));
      envoi(g, N.revIn, 0.3);
    },
    flute(t, m, dur, v = 0.15) {
      const f = mtof(m);
      const g = vcaTenu(t, 0.035, v, dur, 0.12, N.lead, 0.85);
      const lp = filtre('lowpass', 3400, 0.7, g);
      const o1 = osc('triangle', f, t, dur + 0.2, lp);
      const o2 = osc('square', f, t, dur + 0.2, gainTo(lp, 0.13));
      vibrato(t, dur, [o1, o2], 18, 5.4, 0.12);
      bruit(t, Math.min(dur, 0.3) + 0.02, filtre('bandpass', Math.min(f * 2, 6000), 3, vca(t, 0.02, v * 0.35, 0.14, N.lead)));
      envoi(g, N.revIn, 0.35); envoi(g, N.dlyIn, 0.2);
    },
    choeur(t, ms, dur, v = 0.045) { ms.forEach((m, i) => I.voix(t + i * 0.012, m, dur, v, i % 2 ? 1 : 0, N.music)); },
    supersaw(t, ms, dur, v = 0.03, cut = 3200, leger = false) { // le gros accord qui brille (leger : 3 scies au lieu de 5, pour les passages chargés)
      const g = vcaTenu(t, 0.02, v * (leger ? 1.25 : 1), dur, 0.3, N.music, 0.9);
      const lp = filtre('lowpass', cut, 0.7, g);
      for (const m of ms) for (const dt of leger ? [-20, 0, 20] : [-22, -9, 0, 9, 22]) { const o = osc('sawtooth', mtof(m), t, dur + 0.35, lp); o.detune.value = dt; }
      envoi(g, N.revIn, 0.35);
    },
    marimba(t, m, v = 0.12) { // le marimba des tropiques
      const f = mtof(m), g = vca(t, 0.001, v, 0.32, N.music);
      osc('sine', f, t, 0.45, g);
      osc('sine', f * 4, t, 0.12, vca(t, 0.001, v * 0.3, 0.05, N.music));
      osc('triangle', f * 2, t, 0.2, vca(t, 0.001, v * 0.18, 0.1, N.music));
      envoi(g, N.dlyIn, 0.18); envoi(g, N.revIn, 0.15);
    },
    sub(t, m, dur, v = 0.42) { // la grosse basse du tube
      const f = mtof(m), g = vcaTenu(t, 0.005, v, dur, 0.07, N.music, 0.9);
      const lp = filtre('lowpass', 760, 0.7, g);
      const ws = ac.createWaveShaper(); ws.curve = N.dist; ws.connect(lp);
      const pre = ac.createGain(); pre.gain.value = 1.5; pre.connect(ws);
      const o = osc('sine', f * 1.35, t, dur + 0.1, pre); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      osc('sine', f / 2, t, dur + 0.1, gainTo(g, 0.9));
      osc('sawtooth', f, t, dur + 0.1, filtre('lowpass', 400, 1, gainTo(g, 0.25)));
    },
    sifflet(t, m, dur, v = 0.1) { // le sifflement de l'été
      const f = mtof(m), g = vcaTenu(t, 0.02, v, dur, 0.08, N.lead, 0.9);
      const o = osc('sine', f * 0.97, t, dur + 0.15, g); o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
      vibrato(t, dur, [o], 22, 6.2, 0.08);
      bruit(t, dur + 0.05, filtre('bandpass', Math.min(f, 8000), 8, vca(t, 0.02, v * 0.6, dur, N.lead)));
      envoi(g, N.revIn, 0.3); envoi(g, N.dlyIn, 0.22);
    },
    hey(t) { // « Hé ! » : la foule
      [52, 57, 61, 64].forEach((m, i) => I.voix(t + i * 0.009, m, 0.11, 0.16, 0, N.music));
      bruit(t, 0.12, filtre('bandpass', 1700, 1, vca(t, 0.004, 0.22, 0.09, N.music)));
    },
    rim(t, v = 0.12) { // le petit coup du dembow
      osc('triangle', 430, t, 0.05, vca(t, 0.001, v, 0.035, N.drums));
      bruit(t, 0.04, filtre('bandpass', 2600, 2, vca(t, 0.001, v * 0.8, 0.03, N.drums)));
    },
    rate(t) { // la défaite : wah wah wah waaah
      [62, 61, 60, 59].forEach((m, i) => {
        const tt = t + i * 0.42, d = i === 3 ? 1.1 : 0.36;
        const g = vcaTenu(tt, 0.03, 0.16, d, 0.15, N.sfx, 0.85);
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2;
        bp.frequency.setValueAtTime(500, tt); bp.frequency.linearRampToValueAtTime(1400, tt + d * 0.5);
        bp.frequency.linearRampToValueAtTime(600, tt + d); bp.connect(g);
        const o = osc('sawtooth', mtof(m - 12), tt, d + 0.2, bp);
        if (i === 3) vibrato(tt, d, [o], 40, 5, 0.2);
      });
    },

    // ================= version 5 : la nouvelle banque d'instruments =================
    // --- les cordes pincées (luth, harpe, oud, pizzicato, contrebasse, clavecin) ---
    corde(t, m, v = 0.3, type = 'luth', p = 0, bus, dur) {
      const C = CORDES[type], fin = Math.max(0.06, dur ? Math.min(dur, C.dur) : C.dur);
      const s = ac.createBufferSource(); s.buffer = ksCorde(type, m);
      const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + fin - 0.05); g.gain.linearRampToValueAtTime(0.0001, t + fin);
      g.connect(pan(bus || N.lead, p));
      let x = g;
      for (const [ty, f, q, gn] of CORPS[type]) { const b = filtre(ty, f, q, x); if (gn != null) b.gain.value = gn; x = b; }
      s.connect(x); s.start(t); s.stop(t + fin + 0.01);
      envoi(g, N.revIn, type === 'cb' ? 0.08 : 0.25);
    },
    // un accord gratté (vers = 1 : vers le bas ; -1 : vers le haut)
    gratte(t, ms, v = 0.16, type = 'luth', vers = 1, ecart = 0.011, bus, dur) {
      const o = vers > 0 ? ms : [...ms].reverse(), n = o.length;
      o.forEach((m, i) => I.corde(t + i * ecart, m, v * (1 - i * 0.07), type, (i / Math.max(1, n - 1) - 0.5) * 0.6 * vers, bus, dur));
    },
    // --- les vents ---
    flutebec(t, m, dur, v = 0.12, p = 0, bus) { // la flûte à bec : douce, un petit « tchiff » au début
      const f = mtof(m), d = pan(bus || N.lead, p), g = vcaTenu(t, 0.025, v, dur, 0.06, d, 0.85);
      const lp = filtre('lowpass', 4200, 0.5, g);
      const o1 = osc('sine', f, t, dur + 0.15, lp), o2 = osc('triangle', f * 2, t, dur + 0.15, gainTo(lp, 0.07)), o3 = osc('sine', f * 3, t, dur + 0.15, gainTo(lp, 0.035));
      vibrato(t, dur, [o1, o2, o3], 9, 5, 0.25);
      bruit(t, 0.06, filtre('bandpass', Math.min(f * 3, 9000), 2, vca(t, 0.003, v * 0.45, 0.04, d)));
      if (dur > 0.12) souffle(t, dur, f * 2, 4, v * 0.05, d);
      envoi(g, N.revIn, 0.3);
    },
    ney(t, m, dur, v = 0.13, p = 0, bus) { // la flûte du désert : beaucoup de souffle, elle glisse vers la note
      const f = mtof(m), d = pan(bus || N.lead, p), g = vcaTenu(t, 0.05, v, dur, 0.14, d, 0.85);
      const lp = filtre('lowpass', 2800, 0.6, g);
      const o1 = osc('sine', f, t, dur + 0.25, lp); o1.frequency.setValueAtTime(f * 0.955, t); o1.frequency.exponentialRampToValueAtTime(f, t + 0.09);
      const o2 = osc('triangle', f * 2, t, dur + 0.25, gainTo(lp, 0.12)); o2.frequency.setValueAtTime(f * 1.91, t); o2.frequency.exponentialRampToValueAtTime(f * 2, t + 0.09);
      vibrato(t, dur, [o1, o2], 17, 5.2, 0.22);
      souffle(t, dur + 0.05, f, 2.5, v * 0.42, d);
      envoi(g, N.revIn, 0.45); envoi(g, N.dlyIn, 0.14);
    },
    // --- les archets ---
    violon(t, m, dur, v = 0.1, p = 0, bus) {
      const f = mtof(m), d = pan(bus || N.lead, p), g = vcaTenu(t, 0.045, v, dur, 0.16, d, 0.85);
      const c1 = filtre('peaking', 480, 1.3, filtre('highpass', 190, 0.7, g)); c1.gain.value = 6;
      const c2 = filtre('peaking', 2700, 1.6, c1); c2.gain.value = 6;
      const lp = filtre('lowpass', 6500, 0.5, c2);
      const o1 = osc('sawtooth', f, t, dur + 0.3, lp), o2 = osc('sawtooth', f, t, dur + 0.3, gainTo(lp, 0.55)); o2.detune.value = 7;
      vibrato(t, dur, [o1, o2], 20, 5.8, 0.16);
      if (dur > 0.15) souffle(t, dur, 3200, 0.8, v * 0.07, d);
      envoi(g, N.revIn, 0.4);
    },
    // l'orchestre à cordes (o.att : attaque ; o.cut : clarté ; o.rel : relâche ; o.trem : trémolo)
    cordes(t, ms, dur, v = 0.035, o = {}) {
      const att = o.att != null ? o.att : 0.18, rel = o.rel != null ? o.rel : 0.35;
      const g = vcaTenu(t, att, v, dur, rel, o.bus || N.music, 0.9);
      let entree = g;
      if (o.trem) { const tg = ac.createGain(); tg.gain.value = 0.55; tg.connect(g); const l = ac.createOscillator(); l.type = 'square'; l.frequency.value = o.trem; const lg = ac.createGain(); lg.gain.value = 0.45; l.connect(lg); lg.connect(tg.gain); l.start(t); l.stop(t + dur + rel + 0.1); entree = tg; }
      const pk = filtre('peaking', 520, 1, filtre('lowpass', o.cut || 2400, 0.6, entree)); pk.gain.value = 4;
      const hp = filtre('highpass', o.bas ? 50 : 110, 0.7, pk);
      ms.forEach((m, i) => {
        const d = pan(hp, ms.length > 1 ? (i / (ms.length - 1) - 0.5) * 1.1 : 0);
        for (const dt of o.leger ? [-8, 8] : [-13, 0, 12]) { const x = osc('sawtooth', mtof(m), t, dur + rel + 0.1, d); x.detune.value = dt + (Math.random() - 0.5) * 5; }
      });
      envoi(g, N.revIn, o.sec ? 0.2 : 0.45);
    },
    // --- les cuivres : cors (sombres) ou trompettes (claires) ---
    cuivres(t, ms, dur, v = 0.05, o = {}) {
      const clair = o.clair != null ? o.clair : 0.5, g = vcaTenu(t, 0.03, v, dur, 0.12, pan(o.bus || N.music, o.p || 0), 0.8);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.6;
      const c0 = 350 + 500 * clair, c1 = 1300 + 3800 * clair;
      lp.frequency.setValueAtTime(c0, t); lp.frequency.exponentialRampToValueAtTime(c1, t + 0.06); lp.frequency.setTargetAtTime(c1 * 0.6, t + 0.09, 0.25);
      lp.connect(filtre('highpass', 90, 0.7, g));
      for (const m of ms) for (const dt of [-6, 6]) {
        const x = osc('sawtooth', mtof(m), t, dur + 0.2, lp);
        x.detune.setValueAtTime(dt - 45, t); x.detune.linearRampToValueAtTime(dt, t + 0.05);
      }
      envoi(g, N.revIn, 0.35);
    },
    // --- l'accordéon et la vielle ---
    accordeon(t, ms, dur, v = 0.03, p = 0) {
      const g = vcaTenu(t, 0.02, v, dur, 0.07, pan(N.music, p), 0.9);
      const pk = filtre('peaking', 1400, 0.8, filtre('lowpass', 3800, 0.6, g)); pk.gain.value = 5;
      const hp = filtre('highpass', 200, 0.7, pk);
      for (const m of ms) for (const dt of [-9, 9]) { const x = ac.createOscillator(); x.setPeriodicWave(N.pulse); x.frequency.value = mtof(m); x.detune.value = dt; x.connect(hp); x.start(t); x.stop(t + dur + 0.12); }
      envoi(g, N.revIn, 0.2);
    },
    bourdon(t, ms, dur, v = 0.022) { // la vielle à roue : une note qui ne s'arrête pas, un peu nasillarde
      const g = vcaTenu(t, 0.3, v, dur, 0.4, N.music, 1);
      const pk = filtre('peaking', 1100, 2, filtre('lowpass', 2400, 0.6, g)); pk.gain.value = 9;
      for (const m of ms) osc('sawtooth', mtof(m), t, dur + 0.5, pk);
      envoi(g, N.revIn, 0.3);
    },
    // --- les tambours du monde ---
    bodhran(t, v = 0.5, grave = true, bus) { // le tambour irlandais
      const dest = bus || N.drums, f0 = grave ? 96 : 175, f1 = grave ? 62 : 132, d = grave ? 0.3 : 0.09;
      const g = vca(t, 0.002, v, d, dest);
      const o = osc('sine', f0, t, d + 0.05, g); o.frequency.exponentialRampToValueAtTime(f1, t + d * 0.6);
      bruit(t, 0.05, filtre('bandpass', grave ? 520 : 1400, 0.8, vca(t, 0.001, v * (grave ? 0.32 : 0.55), 0.03, dest)));
      envoi(g, N.revIn, 0.15);
    },
    plancher(t, v = 0.5) { // le pied qui tape sur le plancher de la taverne
      const g = vca(t, 0.003, v, 0.18, N.drums);
      const o = osc('sine', 82, t, 0.22, g); o.frequency.exponentialRampToValueAtTime(48, t + 0.1);
      bruit(t, 0.05, filtre('lowpass', 380, 0.8, vca(t, 0.001, v * 0.6, 0.04, N.drums)));
      envoi(g, N.revIn, 0.2);
    },
    darbouka(t, coup = 'doum', v = 0.5, p = 0, bus) {
      const dest = pan(bus || N.drums, p), sum = gainTo(dest, 1);
      if (coup === 'doum') {
        const g = vca(t, 0.002, v, 0.36, sum);
        const o = osc('sine', 150, t, 0.42, g); o.frequency.exponentialRampToValueAtTime(96, t + 0.05);
        osc('sine', 236, t, 0.2, vca(t, 0.002, v * 0.28, 0.14, sum));
        bruit(t, 0.03, filtre('lowpass', 900, 0.7, vca(t, 0.001, v * 0.3, 0.02, sum)));
      } else { // tek : sec, au bord ; ka : plus doux
        const tek = coup === 'tek', w = tek ? v : v * 0.55;
        bruit(t, 0.05, filtre('highpass', 1700, 0.7, filtre('bandpass', 4300, 0.9, vca(t, 0.001, w * 0.9, 0.028, sum))));
        osc('sine', tek ? 1060 : 880, t, 0.08, vca(t, 0.001, w * 0.32, 0.05, sum));
        osc('sine', tek ? 1740 : 1490, t, 0.05, vca(t, 0.001, w * 0.16, 0.03, sum));
      }
      envoi(sum, N.revIn, 0.18);
    },
    zills(t, v = 0.07, p = 0.3, bus) { // les petites cymbales des doigts
      const sum = gainTo(pan(bus || N.drums, p), 1);
      for (const [f, a, d] of [[2740, 1, 0.9], [4130, 0.6, 0.6], [5570, 0.4, 0.45], [7220, 0.25, 0.3]])
        osc('sine', f, t, d + 0.05, vca(t, 0.001, v * a, d, sum));
      bruit(t, 0.02, filtre('highpass', 6000, 0.7, vca(t, 0.001, v * 0.8, 0.015, sum)));
      envoi(sum, N.revIn, 0.3);
    },
    castagnettes(t, v = 0.1, p = -0.3) {
      const dest = pan(N.drums, p);
      for (const dt of [0, 0.026]) {
        bruit(t + dt, 0.02, filtre('bandpass', 2300, 3, vca(t + dt, 0.0005, v, 0.014, dest)));
        osc('sine', 1900, t + dt, 0.03, vca(t + dt, 0.0005, v * 0.3, 0.014, dest));
      }
    },
    gong(t, v = 0.14, bus) {
      const sum = gainTo(bus || N.drums, 1);
      for (const [f, a, d] of [[86, 1, 3.4], [129, 0.6, 3], [174, 0.5, 2.5], [231, 0.4, 2.1], [311, 0.3, 1.7], [427, 0.2, 1.3], [588, 0.12, 1]]) {
        const o = osc('sine', f * 1.012, t, d + 0.1, vca(t, 0.004, v * a, d, sum)); o.frequency.exponentialRampToValueAtTime(f, t + 0.7);
      }
      bruit(t, 0.08, filtre('lowpass', 1200, 0.7, vca(t, 0.002, v * 0.6, 0.06, sum)));
      envoi(sum, N.revIn, 0.5);
    },
    bol(t, m, v = 0.09, bus) { // le bol chantant : il « tourne » longtemps
      const f = mtof(m), sum = gainTo(bus || N.sfx, 1);
      for (const [r, a, d, bat] of [[1, 1, 2.2, 1.4], [2.71, 0.5, 1.6, 2.1], [5.1, 0.25, 0.9, 3]]) {
        osc('sine', f * r, t, d + 0.1, vca(t, 0.01, v * a * 0.6, d, sum));
        osc('sine', f * r + bat, t, d + 0.1, vca(t, 0.01, v * a * 0.6, d, sum));
      }
      envoi(sum, N.revIn, 0.5);
    },
    // --- l'orchestre : timbales, grosse caisse, cymbale frottée, coup d'orchestre ---
    timbale(t, m, v = 0.5, bus) {
      const f = mtof(m), sum = gainTo(bus || N.drums, 1);
      for (const [r, a, d] of [[1, 0.55, 1.1], [1.5, 0.28, 0.8], [1.98, 0.17, 0.6], [2.44, 0.1, 0.45], [2.9, 0.06, 0.35]]) {
        const o = osc('sine', f * r * 1.03, t, d + 0.1, vca(t, 0.003, v * a, d, sum)); o.frequency.exponentialRampToValueAtTime(f * r, t + 0.08);
      }
      bruit(t, 0.06, filtre('lowpass', 1500, 0.7, vca(t, 0.001, v * 0.5, 0.05, sum)));
      envoi(sum, N.revIn, 0.4);
    },
    grossecaisse(t, v = 0.6, bus) {
      const dest = bus || N.drums, g = vca(t, 0.004, v, 0.9, dest);
      const o = osc('sine', 72, t, 1, g); o.frequency.exponentialRampToValueAtTime(47, t + 0.3);
      bruit(t, 0.1, filtre('lowpass', 300, 0.7, vca(t, 0.002, v * 0.5, 0.08, dest)));
      envoi(g, N.revIn, 0.45);
    },
    frotte(t, dur, v = 0.16, bus) { // la cymbale qui gonfle
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12); g.connect(bus || N.drums);
      bruit(t, Math.min(2.2, dur + 0.15), filtre('highpass', 4800, 0.5, g)); envoi(g, N.revIn, 0.5);
    },
    roulement(t, dur, v0, v1, pas, frappe) { // une suite de petits coups qui monte (caisse claire, darbouka, timbales…)
      const n = Math.max(1, Math.floor(dur / pas));
      for (let i = 0; i < n; i++) frappe(t + i * pas, v0 + (v1 - v0) * i / n);
    },
    // --- l'électro ---
    kickDur(t, v = 1, sp = 0.5) { // le kick de techno : court, sec, saturé
      const g = vca(t, 0.002, v, 0.32, N.drums);
      const ws = ac.createWaveShaper(); ws.curve = N.dist; ws.connect(filtre('lowpass', 5200, 0.5, g));
      const pre = ac.createGain(); pre.gain.value = 1.6; pre.connect(ws);
      const o = osc('sine', 195, t, 0.38, pre); o.frequency.exponentialRampToValueAtTime(54, t + 0.06); o.frequency.exponentialRampToValueAtTime(43, t + 0.3);
      bruit(t, 0.012, filtre('highpass', 3200, 0.7, vca(t, 0.0005, v * 0.3, 0.008, N.drums)));
      const q2 = osc('sine', 110, t, 0.5, vca(t, 0.003, v * 0.3, 0.38, N.drums)); q2.frequency.exponentialRampToValueAtTime(46, t + 0.07); // la queue grave, propre
      pomper(t, sp);
    },
    acid(t, m, dur, v = 0.09, cut = 600, acc = 0) { // la basse acide qui « couine »
      const f = mtof(m), g = vcaTenu(t, 0.003, v * (1 + acc * 0.35), dur, 0.03, N.music, 0.85);
      const ws = ac.createWaveShaper(); ws.curve = N.dist; ws.connect(filtre('highpass', 70, 0.7, g));
      const pre = ac.createGain(); pre.gain.value = 1.3; pre.connect(ws);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 15 + acc * 4;
      lp.frequency.setValueAtTime(cut * (2.3 + acc * 2.4), t); lp.frequency.exponentialRampToValueAtTime(Math.max(140, cut * 0.55), t + 0.12 + acc * 0.08);
      lp.connect(pre);
      osc('sawtooth', f, t, dur + 0.05, gainTo(lp, 0.45));
      envoi(g, N.dlyIn, 0.16);
    },
    roule(t, m, dur, v = 0.3) { // la basse qui roule
      const f = mtof(m), g = vca(t, 0.003, v, dur, N.music);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4;
      lp.frequency.setValueAtTime(1500, t); lp.frequency.exponentialRampToValueAtTime(240, t + Math.max(0.05, dur)); lp.connect(g);
      for (const dt of [-12, 12]) { const o = osc('sawtooth', f, t, dur + 0.05, lp); o.detune.value = dt; }
      osc('sine', f, t, dur + 0.05, gainTo(g, 0.9));
    },
    pluck(t, m, v = 0.1, p = 0, bus) { // la note pincée du synthé
      const f = mtof(m), g = vca(t, 0.002, v, 0.3, pan(bus || N.lead, p));
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
      lp.frequency.setValueAtTime(6500, t); lp.frequency.exponentialRampToValueAtTime(480, t + 0.22); lp.connect(g);
      for (const dt of [-14, 0, 14]) { const o = osc('sawtooth', f, t, 0.36, lp); o.detune.value = dt; }
      osc('square', f * 2, t, 0.1, gainTo(lp, 0.15));
      envoi(g, N.dlyIn, 0.35); envoi(g, N.revIn, 0.22);
    },
    synthlead(t, m, dur, v = 0.09, p = 0, bus) { // la grosse mélodie de synthé
      const f = mtof(m), g = vcaTenu(t, 0.006, v, dur, 0.12, pan(bus || N.lead, p), 0.8);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(7500, t); lp.frequency.setTargetAtTime(3300, t + 0.02, 0.12); lp.connect(g);
      const os = [-17, -6, 6, 17].map(dt => { const o = osc('sawtooth', f, t, dur + 0.2, lp); o.detune.value = dt; return o; });
      os.push(osc('square', f / 2, t, dur + 0.2, gainTo(lp, 0.25)));
      vibrato(t, dur, os, 13, 5.5, 0.28);
      envoi(g, N.dlyIn, 0.28); envoi(g, N.revIn, 0.28);
    },
    riser(t, dur, v = 0.1) { // ça monte, ça monte…
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + dur);
      g.gain.setTargetAtTime(0.0001, t + dur, 0.02); g.connect(N.sfx);
      const lp = filtre('lowpass', 2600, 1.5, g);
      for (const dt of [-10, 10]) { const o = osc('sawtooth', 180, t, dur + 0.1, lp); o.detune.value = dt; o.frequency.exponentialRampToValueAtTime(1500, t + dur); }
      I.montee(t, dur);
    },
    // ================= version 6 : les vraies basses, de meilleurs tambours =================
    // Chaque basse a deux couches : le grave pur (qu'on sent au casque ou sur une enceinte) et un « grain »
    // (des harmoniques) qui la rend audible même sur le petit haut-parleur d'un téléphone.
    b808(t, m, dur, v = 0.45, o = {}) { // la basse 808 : un grave qui tient, avec une petite chute au début (ou une glissade)
      const f = mtof(m), rel = o.rel != null ? o.rel : 0.1, grain = o.grain != null ? o.grain : 0.5;
      const g = vcaTenu(t, 0.004, v, dur, rel, o.bus || N.basse, o.garde != null ? o.garde : 0.85);
      const x = ac.createOscillator(); x.type = 'sine';
      if (o.de != null) { x.frequency.setValueAtTime(mtof(o.de), t); x.frequency.setValueAtTime(mtof(o.de), t + 0.02); x.frequency.exponentialRampToValueAtTime(f, t + 0.02 + (o.glisse || 0.08)); }
      else { x.frequency.setValueAtTime(f * 1.7, t); x.frequency.exponentialRampToValueAtTime(f, t + 0.04); }
      x.start(t); x.stop(t + dur + rel + 0.05);
      x.connect(g);
      const pre = ac.createGain(); pre.gain.value = 2.5 + grain * 4;
      const ws = ac.createWaveShaper(); ws.curve = N.dist;
      ws.connect(filtre('lowpass', o.cut || 1100, 0.7, filtre('highpass', 120, 0.7, gainTo(g, grain * 0.5))));
      x.connect(pre); pre.connect(ws);
    },
    contrebasse(t, m, dur, v = 0.5, p = 0) { // la contrebasse : la corde pincée + son grave de bois + le choc du doigt
      I.corde(t, m, v * 0.85, 'cb', p, N.basse, dur + 0.15);
      const f = mtof(m), g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.6, t + 0.008);
      g.gain.exponentialRampToValueAtTime(v * 0.22, t + Math.max(0.05, dur)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);
      g.connect(N.basse);
      osc('sine', f, t, dur + 0.25, g); osc('triangle', f * 2, t, dur + 0.25, gainTo(g, 0.12));
      bruit(t, 0.04, filtre('lowpass', 220, 0.8, vca(t, 0.001, v * 0.5, 0.03, N.basse)));
    },
    reese(t, m, dur, v = 0.24, o = {}) { // la grosse basse électro : deux scies qui se frottent, et un grave dessous
      const f = mtof(m), rel = o.rel != null ? o.rel : 0.04, g = vcaTenu(t, 0.004, v, dur, rel, o.bus || N.basse, 0.9);
      const c = o.cut || 700, lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = o.q || 2.5;
      lp.frequency.setValueAtTime(c * (o.ouvre || 2.4), t); lp.frequency.exponentialRampToValueAtTime(c, t + Math.min(0.18, Math.max(0.03, dur)));
      lp.connect(g);
      const ws = ac.createWaveShaper(); ws.curve = N.dist; ws.connect(lp);
      const pre = ac.createGain(); pre.gain.value = 1.2; pre.connect(ws);
      for (const dt of [-17, 17]) { const x = osc('sawtooth', f, t, dur + rel + 0.05, gainTo(pre, 0.5)); x.detune.value = dt; }
      osc('sine', f, t, dur + rel + 0.05, gainTo(g, o.sub != null ? o.sub : 1));
    },
    kickRond(t, v = 0.9, sp = 0.5, pompe = false) { // le gros pied qui tape : rond, profond (folk-pop, épique)
      const g = vca(t, 0.003, v * 0.7, 0.42, N.drums);
      const o = osc('sine', 120, t, 0.5, g); o.frequency.exponentialRampToValueAtTime(52, t + 0.07); o.frequency.exponentialRampToValueAtTime(44, t + 0.45);
      osc('triangle', 240, t, 0.05, vca(t, 0.001, v * 0.25, 0.03, N.drums));
      bruit(t, 0.03, filtre('lowpass', 2500, 0.7, vca(t, 0.001, v * 0.25, 0.02, N.drums)));
      envoi(g, N.revIn, 0.08);
      if (pompe) pomper(t, sp);
    },
    caisse(t, v = 0.5) { // une caisse claire plus vraie : la peau (deux tons) + le timbre
      const sum = gainTo(N.drums, 1);
      for (const [f, a, d] of [[185, 1, 0.09], [330, 0.6, 0.06]]) { const o = osc('sine', f * 1.25, t, d + 0.05, vca(t, 0.001, v * a * 0.6, d, sum)); o.frequency.exponentialRampToValueAtTime(f, t + 0.02); }
      bruit(t, 0.28, filtre('highpass', 1400, 0.7, filtre('peaking', 5200, 1, vca(t, 0.001, v * 0.8, 0.2, sum))));
      envoi(sum, N.revIn, 0.25);
    },
    hatMetal(t, v = 0.1, ouvert = false, p = 0.25) { // le charleston des boîtes à rythmes : six notes métalliques (fabriqué une fois, rejoué ensuite)
      const s = ac.createBufferSource(); s.buffer = hatBuf(ouvert);
      const g = ac.createGain(); g.gain.value = v * 2.2; g.connect(pan(N.drums, p));
      s.connect(g); s.start(t);
    },
    braam(t, ms, dur, v = 0.045) { // le grand « BRAAAM » des films d'aventure
      const g = vcaTenu(t, 0.05, v, dur, 0.5, N.music, 0.8);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2.5;
      lp.frequency.setValueAtTime(180, t); lp.frequency.exponentialRampToValueAtTime(1500, t + 0.22); lp.frequency.setTargetAtTime(500, t + 0.3, dur * 0.4);
      lp.connect(g);
      const ws = ac.createWaveShaper(); ws.curve = N.dist; ws.connect(lp);
      const pre = ac.createGain(); pre.gain.value = 1.6; pre.connect(ws);
      for (const m of ms) for (const dt of [-10, 10]) { const x = osc('sawtooth', mtof(m), t, dur + 0.6, gainTo(pre, 0.35)); x.detune.value = dt; }
      envoi(g, N.revIn, 0.5);
    },
    corne(t, m, dur, v = 0.09) { // la corne des fêtes (« pouet pouet pouuuet »)
      const f = mtof(m), g = vcaTenu(t, 0.008, v, dur, 0.06, N.sfx, 0.9);
      const pk = filtre('peaking', 1600, 1.2, filtre('lowpass', 5200, 0.7, g)); pk.gain.value = 8;
      const ws = ac.createWaveShaper(); ws.curve = N.dist; ws.connect(filtre('highpass', 280, 0.7, pk));
      const pre = ac.createGain(); pre.gain.value = 1.8; pre.connect(ws);
      for (const [r, a] of [[1, 1], [1.006, 0.8], [2, 0.5], [1.5, 0.35]]) {
        const o = osc('sawtooth', f * r, t, dur + 0.1, gainTo(pre, a * 0.4));
        o.frequency.setValueAtTime(f * r * 0.97, t); o.frequency.exponentialRampToValueAtTime(f * r, t + 0.03);
      }
      envoi(g, N.revIn, 0.2);
    },
    laser(t, v = 0.1) {
      const g = vca(t, 0.002, v, 0.3, N.sfx);
      const o = osc('sawtooth', 2900, t, 0.34, filtre('lowpass', 5000, 2, g)); o.frequency.exponentialRampToValueAtTime(160, t + 0.3);
      envoi(g, N.dlyIn, 0.4);
    },
  };

  const vider = () => ksCache.clear(); // (les cordes pincées déjà calculées : on les oublie entre deux chansons, pour la mémoire du téléphone)
  return { construire, tempo, volume, couper, retablir, salle, vider, I, mtof, get ac() { return ac; }, get N() { return N; } };
})();
