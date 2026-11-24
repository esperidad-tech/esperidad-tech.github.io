// ===== Les sons du Sage : tout est fabriqué par le navigateur (aucun fichier) =====
// des bruitages doux, et une musique de combat 8 bits (11 parties ≈ 2 min 30, puis elle change de tonalité à chaque tour)
const SON = (() => {
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const SV = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let ac = null, master, sfx, mus, musLP, slowLP, noiseBuf, P25, P12, base = 0;
  // les deux curseurs de volume : 0 = coupé, 1 = normal, 2 = deux fois plus fort
  const vol0 = (k, old) => { const v = LS(k); if (v !== null && v !== '' && !isNaN(+v)) return Math.max(0, Math.min(2, +v)); return LS(old) === '0' ? 0 : 1; };
  let vMus = vol0('sage-vmus', 'sage-mus'), vSfx = vol0('sage-vsfx', 'sage-sfx');
  let sfxOn = vSfx > 0, musOn = vMus > 0;
  const VOL = { sfx: 0.65, mus: 0.05 };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function build(ctx) {
    ac = ctx;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -22; comp.knee.value = 10; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.25;
    slowLP = ac.createBiquadFilter(); slowLP.type = 'lowpass'; slowLP.frequency.value = 16000; slowLP.Q.value = 0.5;
    master = ac.createGain(); master.gain.value = 0.8;
    master.connect(slowLP); slowLP.connect(comp); comp.connect(ac.destination);
    sfx = ac.createGain(); sfx.gain.value = VOL.sfx * vSfx; sfx.connect(master);
    mus = ac.createGain(); mus.gain.value = 0; mus.connect(master);
    // la mélodie passe dans un filtre doux, avec un petit écho
    musLP = ac.createBiquadFilter(); musLP.type = 'lowpass'; musLP.frequency.value = 3000; musLP.Q.value = 0.3; musLP.connect(mus);
    const dl = ac.createDelay(1), fb = ac.createGain(), wet = ac.createGain();
    dl.delayTime.value = 60 / 150 * 0.75; fb.gain.value = 0.25; wet.gain.value = 0.18;
    musLP.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(mus);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    P25 = pulse(0.25); P12 = pulse(0.125);
  }
  function pulse(duty) { const n = 32, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) re[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * duty); return ac.createPeriodicWave(re, im); }
  function init() {
    if (ac) { if (ac.state === 'suspended' && ac.resume) ac.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    try { build(new AC()); } catch (e) { ac = null; return false; }
    return true;
  }
  const now = () => ac.currentTime + base;

  // ----- les briques : une note, un souffle -----
  function tone(f, dur, o = {}) {
    const t = now() + (o.at || 0) + 0.005;
    const os = ac.createOscillator(), g = ac.createGain();
    if (o.type === 'p25') os.setPeriodicWave(P25); else if (o.type === 'p12') os.setPeriodicWave(P12); else os.type = o.type || 'triangle';
    os.frequency.setValueAtTime(f, t); if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    const G0 = o.gain ?? 0.1, A = o.attack ?? 0.004;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(G0, t + A); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = os; if (o.lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; os.connect(fl); node = fl; }
    node.connect(g); g.connect(o.bus || sfx); os.start(t); os.stop(t + dur + 0.03);
  }
  function noise(dur, o = {}) {
    const t = now() + (o.at || 0) + 0.005;
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = o.ft || 'bandpass'; fl.frequency.setValueAtTime(o.f || 1000, t); if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + dur); fl.Q.value = o.q ?? 1;
    const g = ac.createGain(), G0 = o.gain ?? 0.1, A = o.attack ?? 0.004;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(G0, t + A); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl); fl.connect(g); g.connect(o.bus || sfx); src.start(t, Math.random() * 0.9); src.stop(t + dur + 0.03);
  }
  const arp = (notes, step, o) => notes.forEach((m, i) => tone(hz(m), o.dur || 0.2, { ...o, at: (o.at || 0) + i * step }));

  // ----- les bruitages (tous petits volumes) -----
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  let shatN = 0, shatT = -9;
  const LIB = {
    tick: () => tone(300, 0.05, { type: 'triangle', gain: 0.05 }),
    boing: () => tone(540, 0.15, { type: 'sine', gain: 0.055, slide: 250 }),
    crumble: k => { noise(0.2, { ft: 'lowpass', f: 1000, f2: 220, gain: 0.08 * k }); tone(150, 0.12, { type: 'triangle', gain: 0.045 * k, slide: 70 }); },
    shatter: () => { // les éclats montent la gamme quand ils s'enchaînent
      const t = now(); shatN = t - shatT < 0.45 ? Math.min(PENTA.length - 1, shatN + 1) : 0; shatT = t;
      const f = hz(76 + PENTA[shatN]); tone(f, 0.3, { type: 'triangle', gain: 0.065 }); tone(f * 2, 0.14, { type: 'sine', gain: 0.022 }); noise(0.07, { ft: 'highpass', f: 5000, gain: 0.02 });
    },
    beam: () => { noise(0.28, { f: 1400, f2: 5000, q: 1.4, gain: 0.055 }); tone(660, 0.26, { type: 'sine', gain: 0.035, slide: 1320 }); },
    vee: () => { noise(0.32, { f: 450, f2: 2400, q: 1.2, gain: 0.075 }); tone(196, 0.2, { type: 'triangle', gain: 0.05, slide: 392 }); },
    ring: () => { noise(0.5, { f: 1500, f2: 260, q: 1, gain: 0.07 }); tone(300, 0.45, { type: 'sine', gain: 0.055, slide: 110 }); },
    wall: () => { tone(110, 0.26, { type: 'sine', gain: 0.11, slide: 60 }); noise(0.2, { ft: 'lowpass', f: 600, gain: 0.06 }); },
    fail: () => { tone(392, 0.12, { type: 'triangle', gain: 0.045 }); tone(330, 0.18, { type: 'triangle', gain: 0.045, at: 0.11 }); },
    ouch: () => tone(150, 0.15, { type: 'square', gain: 0.045, lp: 700, slide: 110 }),
    pick: () => tone(hz(88 + [0, 2, 4, 7][Math.floor(Math.random() * 4)]), 0.08, { type: 'sine', gain: 0.028 }),
    page: () => arp([72, 76, 79, 84], 0.07, { type: 'triangle', gain: 0.05, dur: 0.26 }),
    choice: () => arp([79, 83, 86], 0.04, { type: 'sine', gain: 0.032, dur: 0.55 }),
    card: () => arp([72, 76, 79], 0.08, { type: 'p25', gain: 0.04, lp: 2600, dur: 0.18 }),
    combo: () => { arp([67, 71, 74, 79, 83, 86], 0.065, { type: 'p25', gain: 0.042, lp: 3000, dur: 0.22 }); tone(hz(91), 0.7, { type: 'sine', gain: 0.03, at: 0.4 }); },
    brushOn: () => noise(0.16, { f: 2400, f2: 1100, q: 0.8, gain: 0.045 }),
    brushOff: () => noise(0.12, { f: 1100, f2: 2400, q: 0.8, gain: 0.03 }),
    key: () => tone(1100, 0.035, { type: 'sine', gain: 0.03 }),
    bad: () => { tone(196, 0.12, { type: 'square', gain: 0.032, lp: 900 }); tone(165, 0.2, { type: 'square', gain: 0.032, lp: 900, at: 0.12 }); },
    good: () => arp([74, 78, 81, 86], 0.09, { type: 'p25', gain: 0.045, lp: 3000, dur: 0.3 }),
    side: () => { tone(hz(50), 0.45, { type: 'square', gain: 0.035, lp: 600 }); tone(hz(49), 0.6, { type: 'square', gain: 0.035, lp: 600, at: 0.42 }); },
    tink: () => tone(1760, 0.08, { type: 'sine', gain: 0.03 }),
    splash: () => { for (let i = 0; i < 3; i++) tone(380 + Math.random() * 200, 0.07, { type: 'sine', gain: 0.03, slide: 900, at: i * 0.05 }); },
    toss: () => noise(0.18, { f: 700, f2: 1400, q: 2, gain: 0.022 }),
    arrows: () => { noise(0.07, { ft: 'highpass', f: 3000, gain: 0.028 }); noise(0.07, { ft: 'highpass', f: 3600, gain: 0.022, at: 0.06 }); },
    slash: () => { noise(0.05, { ft: 'highpass', f: 4000, gain: 0.035 }); tone(1300, 0.06, { type: 'triangle', gain: 0.025, slide: 700 }); },
    barde: () => { const b = [74, 77, 79, 81, 84][Math.floor(Math.random() * 5)]; tone(hz(b), 0.22, { type: 'triangle', gain: 0.035 }); tone(hz(b + 7), 0.22, { type: 'triangle', gain: 0.022, at: 0.09 }); },
    hoo: () => tone(520, 0.18, { type: 'sine', gain: 0.028, slide: 430 }),
    zap: () => { tone(1500, 0.09, { type: 'square', gain: 0.018, lp: 4000, slide: 400 }); noise(0.06, { ft: 'highpass', f: 2500, gain: 0.018 }); },
    sky: () => { noise(0.07, { ft: 'highpass', f: 2000, gain: 0.05 }); noise(0.7, { ft: 'lowpass', f: 500, f2: 120, gain: 0.09, attack: 0.02, at: 0.03 }); },
    fireball: () => { noise(0.4, { ft: 'lowpass', f: 1800, f2: 180, gain: 0.085 }); tone(90, 0.3, { type: 'sine', gain: 0.06, slide: 45 }); },
    bonk: () => tone(240, 0.07, { type: 'sine', gain: 0.045, slide: 150 }),
    strike: () => { noise(0.5, { ft: 'highpass', f: 3000, gain: 0.035 }); arp([72, 76, 79, 84, 88], 0.06, { type: 'p25', gain: 0.04, lp: 3000, dur: 0.18, at: 0.05 }); },
    tornado: () => noise(1.6, { f: 400, f2: 1400, q: 2, gain: 0.045, attack: 0.3 }),
    pulse: () => { tone(120, 0.6, { type: 'sine', gain: 0.09, slide: 60 }); noise(0.4, { f: 800, f2: 200, gain: 0.035 }); },
    mirror: () => arp([79, 83, 86], 0.03, { type: 'triangle', gain: 0.02, dur: 0.35 }),
    echo: () => { tone(hz(84), 0.2, { type: 'sine', gain: 0.022 }); tone(hz(79), 0.25, { type: 'sine', gain: 0.018, at: 0.1 }); },
    frenzy: () => arp([62, 65, 69, 72, 74, 77, 81, 86], 0.045, { type: 'p25', gain: 0.04, lp: 3200, dur: 0.12 }),
    rage: () => { tone(55, 0.8, { type: 'sine', gain: 0.13, slide: 40 }); tone(hz(45), 0.9, { type: 'square', gain: 0.03, lp: 500 }); tone(hz(46), 0.9, { type: 'square', gain: 0.03, lp: 500 }); },
    trap: () => noise(0.12, { f: 1200, q: 2, gain: 0.045 }),
    glass: () => { noise(0.2, { ft: 'highpass', f: 4000, gain: 0.045 }); tone(2200, 0.2, { type: 'sine', gain: 0.025, slide: 1500 }); },
    nova: () => arp([88, 86, 84, 81, 79], 0.035, { type: 'sine', gain: 0.022, dur: 0.12 }),
    start: () => arp([62, 69, 74], 0.1, { type: 'p25', gain: 0.04, lp: 3000, dur: 0.2 }),
    win: () => { arp([74, 78, 81, 86, 81, 86], 0.14, { type: 'p25', gain: 0.05, lp: 3200, dur: 0.2 }); tone(hz(90), 1.1, { type: 'p25', gain: 0.05, lp: 3200, at: 0.84 }); },
    lose: () => arp([69, 67, 65, 62], 0.3, { type: 'triangle', gain: 0.055, dur: 0.45 })
  };
  // le même bruit ne revient pas trop vite, et pas plus de 10 bruits par image
  const GAP = { tick: 0.06, boing: 0.07, crumble: 0.05, shatter: 0.045, pick: 0.05, ouch: 0.25, tink: 0.08, arrows: 0.3, slash: 0.12, barde: 0.25, hoo: 0.2, zap: 0.08, bonk: 0.06, splash: 0.15, toss: 0.2, trap: 0.1, sky: 0.15, fireball: 0.1, echo: 0.2, mirror: 0.2, nova: 0.5, side: 1, beam: 0.05, vee: 0.05, ring: 0.1, wall: 0.08, tornado: 0.4, pulse: 0.3 };
  const last = {}; let budget = 10;
  function play(name, k = 1, ui) {
    if (!ac || !sfxOn || !LIB[name]) return;
    const t = now(), gap = GAP[name] ?? 0.03;
    if (last[name] !== undefined && t - last[name] < gap) return;
    if (!ui) { if (budget <= 0) return; budget--; }
    last[name] = t;
    try { LIB[name](k); } catch (e) {}
  }

  // ----- la musique de combat : 8 bits, 150 battements par minute, en doubles croches -----
  // une mesure = 16 doubles croches. Écriture : « D5:2 » = ré pendant 2 doubles croches (2 par défaut), « r » = silence,
  // « ~ » devant = la note glisse d'en dessous, « * » devant = elle bégaie, « \ » derrière = elle tombe d'une octave à la fin.
  const NN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function parseBar(str) {
    const at = new Array(16).fill(null); let step = 0;
    for (const tok of str.trim().split(/\s+/)) {
      let t = tok, slide = false, drop = false, stut = false;
      if (t[0] === '~') { slide = true; t = t.slice(1); }
      if (t[0] === '*') { stut = true; t = t.slice(1); }
      if (t.endsWith('\\')) { drop = true; t = t.slice(0, -1); }
      const [n, dd] = t.split(':'), d = dd ? +dd : 2;
      if (n !== 'r') { const mm = n.match(/^([A-G])([#b]?)(\d)$/); if (!mm) throw new Error('note ' + tok); at[step] = { m: 12 * (+mm[3] + 1) + NN[mm[1]] + (mm[2] === '#' ? 1 : mm[2] === 'b' ? -1 : 0), d, slide, drop, stut }; }
      step += d;
    }
    if (step !== 16) throw new Error('mesure de ' + step + ' : ' + str);
    return at;
  }
  function parseChord(c) {
    const mm = c.match(/^([A-G])([#b]?)(m|7|dim)?$/), pc = (NN[mm[1]] + (mm[2] === '#' ? 1 : mm[2] === 'b' ? -1 : 0) + 12) % 12;
    const iv = mm[3] === 'm' ? [0, 3, 7] : mm[3] === 'dim' ? [0, 3, 6] : mm[3] === '7' ? [0, 4, 7, 10] : [0, 4, 7];
    let r = 60 + pc; if (r > 66) r -= 12; let b = 36 + pc; if (b < 38) b += 12;
    return { r, b, iv };
  }
  const HMIN = [2, 4, 5, 7, 9, 10, 1], NMIN = [2, 4, 5, 7, 9, 10, 0], GMIN = [7, 9, 10, 0, 2, 3, 6];
  const SEC = {
    // l'intro : la batterie monte, puis une montée de notes
    I: { sc: HMIN, ch: ['Dm', 'Dm', 'Dm', 'A'], mel: ['r:16', 'r:16', 'r:16', 'A4:1 D5:1 F5:1 A5:1 D6:1 F6:1 ~A6:2 r:8'] },
    // le thème du combat
    A: { sc: HMIN, ch: ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'Gm', 'A'], mel: [
      'D5:2 D5:1 D5:1 A5:2 D5:2 C6:3 A5:1 r:2 G5:2', 'F5:3 G5:1 r:2 F5:2 D5:4 r:2 C5:2', 'E5:2 E5:1 E5:1 G5:2 E5:2 C6:3 G5:1 r:2 E5:2', 'C#5:4 E5:2 A5:2 ~G5:6 r:2',
      'D5:2 D5:1 D5:1 A5:2 D5:2 D6:3 C6:1 r:2 A5:2', 'Bb5:3 A5:1 r:2 G5:2 F5:2 G5:2 A5:2 Bb5:2', '~D6:4 C6:2 Bb5:2 A5:2 G5:2 F5:2 E5:2', '~E5:6 C#5:2 A4:4 r:4'] },
    // la réponse
    A2: { sc: HMIN, ch: ['Dm', 'Bb', 'C', 'A', 'Dm', 'Gm', 'A', 'Dm'], mel: [
      'A5:2 r:1 A5:1 G5:2 A5:2 F5:2 D5:2 r:2 D5:2', '*F5:2 G5:2 F5:2 D5:2 Bb4:4 r:2 D5:2', 'G5:2 r:1 G5:1 F5:2 G5:2 E5:2 C5:2 r:2 C5:2', '*E5:2 F5:2 E5:2 C#5:2 A4:4 r:2 C#5:2',
      'D5:2 F5:2 A5:2 D6:2 C#6:2 D6:2 E6:2 F6:2', '~G6:4 F6:2 E6:2 D6:2 Bb5:2 G5:2 Bb5:2', 'A5:2 r:1 A5:1 G5:2 F5:2 E5:2 F5:2 E5:2 C#5:2', 'D5:8\\ r:8'] },
    // la charge (ça monte, en majeur)
    B: { sc: NMIN, ch: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'A7'], mel: [
      'C6:3 A5:3 F5:2 C6:3 A5:3 F5:2', 'C6:3 G5:3 E5:2 C6:3 G5:3 E5:2', 'D6:3 A5:3 F5:2 D6:3 A5:3 F5:2', 'D6:3 Bb5:3 F5:2 ~F6:6 r:2',
      'A5:2 C6:2 F6:2 E6:2 C6:2 A5:2 G5:2 A5:2', 'G5:2 C6:2 E6:2 D6:2 C6:2 G5:2 E5:2 G5:2', 'F5:2 Bb5:2 D6:2 C6:2 Bb5:2 F5:2 D5:2 F5:2', '~E5:4 G5:4 Bb5:4 C#6:4'] },
    // la pause qui fait peur (les arpèges et de longues notes qui vibrent)
    C: { sc: HMIN, ch: ['Dm', 'A', 'Bb', 'F', 'Gm', 'C', 'A', 'A'], mel: [
      'A5:12 G5:2 F5:2', 'E5:8 F5:4 E5:4', 'D5:12 F5:2 Bb5:2', 'A5:8 G5:4 F5:4', 'G5:12 Bb5:2 D6:2', 'C6:8 Bb5:4 A5:4', '~A5:8 C#6:4 E6:4', 'G6:4 F6:2 E6:2 D6:2 C#6:2 Bb5:2 A5:2'] },
    // l'appel et la réponse, très vite
    D: { sc: HMIN, ch: ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Bb', 'A7'], mel: [
      'D6:1 C6:1 A5:1 F5:1 D5:2 r:2 D6:1 C6:1 A5:1 F5:1 D5:2 r:2', 'E5:2 G5:2 C6:2 E6:4 D6:2 C6:2 G5:2', 'D6:1 Bb5:1 F5:1 D5:1 Bb4:2 r:2 D6:1 Bb5:1 F5:1 D5:1 Bb4:2 r:2', 'C#5:2 E5:2 A5:2 C#6:4 E6:2 C#6:2 A5:2',
      'F6:2 E6:2 D6:2 A5:2 F6:2 E6:2 D6:2 A5:2', 'E6:2 D6:2 C6:2 G5:2 E6:2 D6:2 C6:2 G5:2', 'D6:2 C6:2 Bb5:2 F5:2 D6:2 C6:2 Bb5:2 F5:2', 'C#6:2 D6:2 E6:2 F6:2 ~G6:4 E6:4'] },
    // la marche (en sol mineur)
    G: { sc: GMIN, ch: ['Gm', 'D', 'Gm', 'D', 'Eb', 'Bb', 'Cm', 'D7'], mel: [
      'G5:3 G5:1 Bb5:2 D6:2 C6:3 Bb5:1 A5:2 G5:2', 'F#5:4 A5:2 D6:2 ~C6:6 r:2', 'G5:3 G5:1 Bb5:2 D6:2 Eb6:3 D6:1 C6:2 Bb5:2', 'A5:4 F#5:2 D5:2 ~A5:6 r:2',
      'G5:2 Bb5:2 Eb6:2 Bb5:2 G6:4 F6:2 Eb6:2', 'D6:2 F6:2 Bb5:2 F5:2 D6:4 C6:2 Bb5:2', 'C6:2 Eb6:2 G5:2 C6:2 D6:2 C6:2 Bb5:2 A5:2', '~F#5:4 A5:4 C6:4 D6:4'] }
  };
  for (const k in SEC) { const S = SEC[k]; S.bars = S.mel.map(parseBar); S.chords = S.ch.map(parseChord); }
  // l'ordre des parties, avec leur habillage (basse, batterie, deuxième voix)
  const SEQ = [
    { s: 'I', bass: 'drive', dr: 'intro' },
    { s: 'A', bass: 'drive', dr: 'rock' }, { s: 'A2', bass: 'drive', dr: 'rock' }, { s: 'B', bass: 'synco', dr: 'drive' }, { s: 'D', bass: 'gallop', dr: 'drive' },
    { s: 'C', bass: 'half', dr: 'half' }, { s: 'A', bass: 'gallop', dr: 'blast', harm: true, pew: true }, { s: 'A2', bass: 'gallop', dr: 'blast', harm: true },
    { s: 'G', bass: 'drive', dr: 'rock', pew: true }, { s: 'B', bass: 'synco', dr: 'drive', harm: true }, { s: 'D', bass: 'gallop', dr: 'blast' }, { s: 'A2', bass: 'drive', dr: 'rock', harm: true }
  ];
  const LOOP = 1, TRANS = [0, 2, -3, 1]; // à chaque tour, la musique change de tonalité (ré, mi, si, mi bémol mineur)
  const BASSP = { drive: 'R.O.R.O.R.O.R.O.', gallop: 'R.RRO.RRR.RRO.RR', synco: 'R..R..O.R..R.5O.', half: 'R.......5.....O.' };
  const DRUM = {
    rock: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    drive: { k: 'x.....x.x.....x.', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx' },
    half: { k: 'x...............', s: '........x.......', h: 'x...x...x...x...' },
    blast: { k: 'x...x...x...x...', s: '....x..x....x.x.', h: 'x.x.x.x.x.x.x.x.' },
    intro: { k: 'x.......x.......', s: '', h: '' }
  };
  let playing = false, timer = null, musT = 0, secI = 0, barI = 0, stepI = 0, pass = 0, level = 1, tempo = 1;
  const stepLen = () => 60 / (150 * tempo) / 4;
  function harmOf(m, sc) { const pc = ((m % 12) + 12) % 12, i = sc.indexOf(pc); if (i < 0) return m - 3; return m - ((pc - sc[(i + 5) % 7] + 12) % 12); }
  function lead(n, t, tr, st, type, g, harm, sc) {
    const m = (harm ? harmOf(n.m, sc) : n.m) + tr, f = hz(m), dur = st * n.d * 0.92, end = t + Math.max(0.05, dur);
    const os = ac.createOscillator(), e = ac.createGain();
    os.setPeriodicWave(type === 'p12' ? P12 : P25);
    if (n.slide) { os.frequency.setValueAtTime(f * 0.84, t); os.frequency.exponentialRampToValueAtTime(f, t + 0.06); } else os.frequency.setValueAtTime(f, t);
    if (n.drop) { os.frequency.setValueAtTime(f, t + dur * 0.5); os.frequency.exponentialRampToValueAtTime(f / 2, end); }
    if (n.d >= 4 && !n.drop) { // une note tenue vibre
      const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 6.5;
      lg.gain.setValueAtTime(0, t); lg.gain.setValueAtTime(0, t + 0.12); lg.gain.linearRampToValueAtTime(f * 0.014, t + 0.3); l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(end + 0.05);
    }
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + 0.005);
    if (n.stut) { const h = st * 0.5; e.gain.setValueAtTime(g, t + h * 0.6); e.gain.linearRampToValueAtTime(0.0001, t + h * 0.7); e.gain.setValueAtTime(0.0001, t + h); e.gain.linearRampToValueAtTime(g, t + h + 0.005); }
    const sus = Math.max(t + 0.02, end - 0.03); e.gain.linearRampToValueAtTime(g * 0.7, Math.min(sus, t + 0.1)); e.gain.setValueAtTime(g * 0.7, sus); e.gain.linearRampToValueAtTime(0.0001, end);
    os.connect(e); e.connect(musLP); os.start(t); os.stop(end + 0.03);
  }
  function simple(f, dur, t, type, g, dest, f2) {
    const os = ac.createOscillator(), e = ac.createGain();
    if (type === 'p25') os.setPeriodicWave(P25); else if (type === 'p12') os.setPeriodicWave(P12); else os.type = type;
    os.frequency.setValueAtTime(f, t); if (f2) os.frequency.exponentialRampToValueAtTime(f2, t + dur);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + 0.004); e.gain.setValueAtTime(g * 0.8, t + Math.max(0.006, dur - 0.025)); e.gain.linearRampToValueAtTime(0.0001, t + dur);
    os.connect(e); e.connect(dest || mus); os.start(t); os.stop(t + dur + 0.02);
  }
  function hit(kind, t, k = 1) {
    if (kind === 'kick') { simple(150, 0.14, t, 'sine', 0.55 * k, mus, 42); return; }
    if (kind === 'tom') { simple(k, 0.16, t, 'triangle', 0.32, mus, k * 0.45); return; }
    const src = ac.createBufferSource(); src.buffer = noiseBuf; const fl = ac.createBiquadFilter(), e = ac.createGain();
    const P = { hat: [7500, 'highpass', 0.03, 0.045], snare: [2000, 'bandpass', 0.12, 0.17], crash: [5000, 'highpass', 0.9, 0.05], rise: [600, 'bandpass', 1.5, 0.05] }[kind];
    fl.type = P[1]; fl.frequency.setValueAtTime(P[0], t); if (kind === 'rise') fl.frequency.exponentialRampToValueAtTime(6000, t + P[2]); fl.Q.value = kind === 'rise' ? 3 : 0.8;
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(P[3] * k, kind === 'rise' ? t + P[2] * 0.9 : t + 0.003); e.gain.exponentialRampToValueAtTime(0.0001, t + P[2]);
    src.connect(fl); fl.connect(e); e.connect(mus); src.start(t, Math.random() * 0.5); src.stop(t + P[2] + 0.02);
    if (kind === 'snare') simple(190, 0.06, t, 'triangle', 0.12, mus, 120);
  }
  function playStep(t) {
    const E = SEQ[secI], S = SEC[E.s], st = stepLen(), tr = TRANS[pass % TRANS.length], C = S.chords[barI], n = S.bars[barI][stepI], last = barI === S.bars.length - 1;
    const duty = pass % 2 ? 'p12' : 'p25';
    // la mélodie, et la deuxième voix (à partir de 3 côtés, ou dans les parties fortes)
    if (n) { lead(n, t, tr, st, duty, 0.2); if ((E.harm && level >= 3) || level >= 4) if (n.d >= 2) lead(n, t, tr, st, duty === 'p25' ? 'p12' : 'p25', 0.09, true, S.sc); }
    // la basse
    const bp = BASSP[E.bass][stepI];
    if (bp !== '.') { let len = 1; while (stepI + len < 16 && BASSP[E.bass][stepI + len] === '.') len++; simple(hz(C.b + tr + (bp === 'O' ? 12 : bp === '5' ? 7 : 0)), st * len * 0.85, t, 'triangle', 0.3); }
    // la batterie (avec un roulement de toms à la fin de chaque partie)
    const D = DRUM[E.dr], fill = last && E.s !== 'I' && stepI >= 8;
    if (E.s === 'I') { // l'intro : ça s'ajoute mesure après mesure
      if (D.k[stepI] === 'x') hit('kick', t);
      if (barI >= 1 && stepI % 2 === 0) hit('hat', t, 0.8);
      if (barI >= 2 && (stepI === 4 || stepI === 12)) hit('snare', t);
      if (barI === 2 && stepI === 0) hit('rise', t);
    } else if (fill) {
      if (stepI % 2 === 0) hit('tom', t, [330, 260, 200, 150][(stepI - 8) / 2]);
      if (stepI >= 12) hit('snare', t, 0.6);
    } else {
      if (D.k[stepI] === 'x') hit('kick', t);
      if (D.s[stepI] === 'x') hit('snare', t);
      if (D.h[stepI] === 'x' || (level >= 4 && E.dr !== 'half')) hit('hat', t, stepI % 4 === 2 ? 1 : 0.7);
    }
    if (barI === 0 && stepI === 0 && E.s !== 'I' && level >= 3) hit('crash', t);
    // un petit « piou » laser à l'entrée des parties fortes
    if (E.pew && barI === 0 && stepI === 0) simple(1800, 0.25, t, 'p12', 0.05, musLP, 140);
    // les arpèges (à partir de 2 côtés, et toujours dans la pause)
    if (level >= 2 || E.s === 'C') { const iv = C.iv, tones = [0, iv[1], iv[2], 12, iv[2] + 12, 12, iv[2], iv[1]]; simple(hz(C.r + 12 + tr + tones[stepI % 8]), st * 0.7, t, 'p12', E.s === 'C' ? 0.07 : 0.045, musLP); }
  }
  function advance() {
    if (++stepI < 16) return; stepI = 0;
    if (++barI < SEC[SEQ[secI].s].bars.length) return; barI = 0;
    if (++secI >= SEQ.length) { secI = LOOP; pass++; }
  }
  function sched(upTo) {
    if (musT < ac.currentTime - 0.05) musT = ac.currentTime + 0.05; // l'onglet a dormi : on ne rattrape pas
    while (musT < upTo) { playStep(musT); advance(); musT += stepLen(); }
  }
  function music(on) {
    if (!ac) return;
    if (on && !playing) { playing = true; secI = 0; barI = 0; stepI = 0; pass = 0; musT = ac.currentTime + 0.12; timer = setInterval(() => sched(ac.currentTime + 0.2), 40); sched(ac.currentTime + 0.2); }
    if (!on && playing) { playing = false; clearInterval(timer); }
    mus.gain.cancelScheduledValues(ac.currentTime); mus.gain.setTargetAtTime(on ? VOL.mus * vMus : 0, ac.currentTime, on ? 0.2 : 0.5);
  }
  function duck(on) { if (ac && playing) mus.gain.setTargetAtTime(VOL.mus * vMus * (on ? 0.4 : 1), ac.currentTime, 0.2); }
  function hidden(h) { if (!ac) return; try { if (h) ac.suspend(); else ac.resume(); } catch (e) {} }
  function slow(on) { if (ac) slowLP.frequency.setTargetAtTime(on ? 850 : 16000, ac.currentTime, 0.06); }

  // ----- écouter le jeu : chaque nouvel effet donne son bruit -----
  const FX = { burst: 'shatter', beam: 'beam', vee: 'vee', ring: 'ring', chain: 'zap', slash: 'slash', flaque: 'splash', trap: 'trap', shieldbreak: 'glass', side: 'side', nova: 'nova', fireball: 'fireball', sky: 'sky', pulse: 'pulse', mirror: 'mirror', echo: 'echo', strike: 'strike', tornado: 'tornado', bonk: 'bonk', pop2: 'trap', frenzy: 'frenzy', free: 'good' };
  let W = null;
  function watch(s) {
    if (!ac) return;
    budget = 10;
    if (!W || W.s !== s) W = { s, kills: s.kills, shards: s.shards.length, ink: s.ink, pages: s.pages.length, walls: s.walls.length, rage: s.rage || 0, over: s.over };
    for (const e of s.fx) {
      if (e._snd) continue; e._snd = 1;
      if (e.k === 'pop') { const t = e.t; if (t[0] === '−') play(e.col === '#ff4d5e' ? 'ouch' : 'tick'); else if (t === 'sonné !') play('boing'); else if (t === 'renvoyée !' || t === 'paré !') play('tink'); }
      else if (FX[e.k]) play(e.k === 'fireball' && e.stone ? 'bonk' : FX[e.k]);
    }
    const dk = s.kills - W.kills; if (dk > 0) play('crumble', Math.min(1.4, 0.7 + 0.1 * dk));
    if (s.shards.length < W.shards && s.ink > W.ink) play('pick');
    if (s.pages.length > W.pages) play('page');
    if (s.walls.length > W.walls) play('wall');
    if ((s.rage || 0) > W.rage) play('rage', 1, true);
    for (const b of s.bolts) if (b.arrow && !b._snd) { b._snd = 1; play('arrows'); }
    for (const p of s.potions) if (!p._snd) { p._snd = 1; play('toss'); }
    for (const n of s.notes) if (!n._snd) { n._snd = 1; play('barde'); }
    for (const o of s.owls) { if (o.mode === 'pique' && !o._snd) { o._snd = 1; play('hoo'); } else if (o.mode !== 'pique') o._snd = 0; }
    if (s.over && !W.over) { music(false); play(s.over === 'win' ? 'win' : 'lose', 1, true); }
    // la musique s'étoffe quand la place se remplit de côtés, et accélère avec la colère du cœur
    const lv = Math.min(4, G.sidesNow(s) + ((s.rage || 0) > 0 ? 1 : 0));
    level = lv; tempo = 1 + 0.04 * Math.min(3, s.rage || 0);
    Object.assign(W, { kills: s.kills, shards: s.shards.length, ink: s.ink, pages: s.pages.length, walls: s.walls.length, rage: s.rage || 0, over: s.over });
  }
  function setVol(kind, v) {
    v = Math.max(0, Math.min(2, v));
    if (kind === 'mus') { vMus = v; musOn = v > 0; SV('sage-vmus', String(v)); if (ac && playing) mus.gain.setTargetAtTime(VOL.mus * v, ac.currentTime, 0.08); }
    else { vSfx = v; sfxOn = v > 0; SV('sage-vsfx', String(v)); if (ac) sfx.gain.setTargetAtTime(VOL.sfx * v, ac.currentTime, 0.05); }
  }
  // pour mesurer le volume sans écouter (un enregistrement hors ligne)
  async function measure(plan, seconds, withMusic, lvl) {
    const off = new OfflineAudioContext(2, Math.round(44100 * seconds), 44100), keep = { ac, master, sfx, mus, musLP, slowLP, noiseBuf, P25, P12, sfxOn, musOn, playing, level };
    sfxOn = true; musOn = true; build(off); sfx.gain.value = VOL.sfx; mus.gain.value = VOL.mus;
    if (withMusic) { secI = typeof withMusic === 'number' ? withMusic : 0; barI = 0; stepI = 0; pass = 0; level = lvl || 1; musT = 0.05; sched(seconds - 0.1); }
    for (const [t, name] of plan) { base = t; delete last[name]; budget = 99; play(name); }
    base = 0;
    const buf = await off.startRendering();
    ({ ac, master, sfx, mus, musLP, slowLP, noiseBuf, P25, P12, sfxOn, musOn, playing, level } = keep);
    const d = buf.getChannelData(0); let sum = 0, peak = 0, win = 0, wmax = 0; const W2 = 4410;
    for (let i = 0; i < d.length; i++) { const v = d[i]; sum += v * v; peak = Math.max(peak, Math.abs(v)); win += v * v; if (i % W2 === W2 - 1) { wmax = Math.max(wmax, win / W2); win = 0; } }
    const db = x => Math.round(10 * Math.log10(x + 1e-12) * 10) / 10;
    return { rms: db(sum / d.length), loudest100ms: db(wmax), peak: Math.round(20 * Math.log10(peak + 1e-12) * 10) / 10 };
  }
  return { init, play: (n, k) => play(n, k, true), music, duck, slow, hidden, watch, setVol, get vMus() { return vMus; }, get vSfx() { return vSfx; }, get playing() { return playing; }, measure, LIB, SEC, SEQ, TRANS };
})();
