// ===== MUSIQUE : quatre chansons originales, une par acte, chacune son style =====
// Acte I : folk de taverne (luth, bodhrán, accordéon, flûte à bec, violon).
// Acte II : forge d'Orient (darbouka, oud, flûte du désert, cordes, enclumes).
// Acte III : chevauchée d'orchestre (cordes au galop, timbales, cors, trompettes).
// Acte IV : la tempête, électro-techno ; puis « Le tube de l'été », électro-techno à fond.
// Chaque chanson commence avec peu d'instruments ; les autres arrivent quand on joue bien (« niveau » 0 à 3) ;
// beaucoup de Parfait déclenchent le MÉGA REFRAIN (une mesure qui monte, puis 8 mesures où tout le monde joue).
const Musique = (() => {
  const I = Son.I;
  const N = () => Son.N;
  // ---- les accords, fabriqués à partir de leur nom (« Dm », « Bb », « F# »…) ----
  const PC = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const dans = (p, lo) => lo + (((p - lo) % 12) + 12) % 12;
  const cache = {};
  function acc(nom) {
    if (cache[nom]) return cache[nom];
    const x = nom.match(/^([A-G][#b]?)(m?)$/), pc = PC[x[1]], mineur = x[2] === 'm';
    const pcs = [pc, (pc + (mineur ? 3 : 4)) % 12, (pc + 7) % 12];
    const v = pcs.map(p => dans(p, 55)).sort((a, b) => a - b);
    const tri = pcs.map(p => dans(p, 64)).sort((a, b) => a - b);
    return (cache[nom] = { nom, r: dans(pc, 36), v, a: [...v, v[0] + 12], tri, pcs, rac: dans(pc, 64), mineur });
  }
  const GALOP = [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15];
  const joue = (ph, s, f) => { for (const [st, m, l] of ph) if (st === s) f(m, l); };
  const tierceDe = ch => ch.mineur ? 3 : 4;
  const grave = ch => (ch.r >= 41 ? ch.r - 12 : ch.r); // la note la plus grave de l'accord (entre 43 et 82 Hz)

  // ---------- les morceaux de rythme partagés par une chanson et sa relance ----------
  // Acte I : le bodhrán et le luth « boum-tchac »
  function bodhran(s, t, fort) {
    if (s === 0 || s === 8) I.bodhran(t, 0.55, true);
    else if (s % 2 === 0) I.bodhran(t, s === 4 || s === 12 ? 0.42 : 0.2 + (fort ? 0.08 : 0), false);
    if (fort && s === 15) I.bodhran(t, 0.18, false);
  }
  function luth(s, t, P, ch, sw, plus) {
    const bas = ch.r + 12, accord = [ch.r + 12, ...ch.v, ch.v[0] + 12];
    if (s === 0) I.corde(t, bas, 0.3, 'luth', -0.25, N().music);
    if (s === 8) I.corde(t, bas + 7 > 59 ? bas - 5 : bas + 7, 0.26, 'luth', -0.25, N().music);
    if (s === 4 || s === 12) I.gratte(t, accord, 0.12, 'luth', 1, 0.012, N().music, P * 0.9);
    if (plus && (s === 6 || s === 14)) I.gratte(t + sw, ch.v, 0.065, 'luth', -1, 0.009, N().music, P * 0.4);
  }
  // Acte II : le rythme « maqsum » de la darbouka (doum tek - tek doum - tek -)
  function maqsum(s, t, plus) {
    if (s === 0 || s === 8) I.darbouka(t, 'doum', 0.62, 0);
    if (s === 2 || s === 6 || s === 12) I.darbouka(t, 'tek', 0.4, 0.12);
    if (plus && (s === 4 || s === 10 || s === 14 || s === 15)) I.darbouka(t, 'ka', 0.34, -0.15);
  }
  const DOUM808 = [[0, 0, 5], [6, 0, 2], [8, 0, 4], [14, 12, 2, true]]; // [pas, intervalle, durée, glissade vers le haut]
  function b808forge(s, t, q, ch, v = 0.42) {
    for (const [st, iv, l, gl] of DOUM808) if (st === s) I.b808(t, grave(ch) + iv, q * l * 0.95, v, gl ? { de: grave(ch), glisse: 0.07, grain: 0.6 } : { grain: 0.6 });
  }
  const OUD = [[0, 0], [3, 0], [4, 7], [6, 12], [8, 0], [10, 't'], [12, 7], [14, 'n']];
  function oud(s, t, ch, v = 0.3) {
    const nb = ch.nom === 'E' ? 1 : ch.nom === 'G' ? -2 : ch.nom === 'Dm' ? 2 : -1;
    for (const [st, iv] of OUD) if (st === s) I.corde(t, ch.r + 12 + (iv === 't' ? tierceDe(ch) : iv === 'n' ? nb : iv), v, 'oud', -0.3, N().music);
  }
  // Acte III : les violoncelles au galop, et les timbales accordées sur l'accord
  const timb = ch => (ch.r <= 40 ? ch.r + 12 : ch.r);
  function galop(s, t, q, ch, v = 1) {
    if (GALOP.includes(s)) I.cordes(t, s % 4 === 0 ? [ch.r + 12, ch.r + 19] : [ch.r + 12], q * 0.8, (s % 4 === 0 ? 0.03 : 0.021) * v, { att: 0.004, rel: 0.07, cut: 2600, leger: true, sec: true, bas: true });
  }
  // Acte IV : la basse acide (pas de double-croche → [intervalle, accent])
  const ACID = [[0, 1], [0, 0], [12, 0], null, [0, 0], [7, 1], [12, 0], [0, 0], null, [0, 1], ['t', 0], [12, 0], [0, 0], [7, 0], [12, 1], [0, 0]];
  function acide(s, t, q, ch, cut, v = 0.07) {
    const a = ACID[s]; if (!a) return;
    I.acid(t, ch.r + 12 + (a[0] === 't' ? tierceDe(ch) : a[0]), q * 0.8, v, cut, a[1]);
  }

  // ================= les quatre chansons =================
  const CHANSONS = [
    { // ---------- Acte I : « La taverne » — folk à danser, ré mineur, 100 ----------
      nom: 'La taverne', bpm: 100, ton: 2, salle: 'taverne', gain: 0,
      couplet: ['Dm', 'C', 'Dm', 'Am'], refrain: ['F', 'C', 'Dm', 'Am', 'F', 'C', 'Am', 'Dm'],
      montee: 'A', cadence: ['Dm', 'C', 'Bb', 'A'], decale: 5, victoire: 'D',
      melodie: [
        [[0, 74, 2], [2, 76, 2], [4, 77, 2], [6, 79, 2], [8, 81, 4], [12, 79, 2], [14, 77, 2]],
        [[0, 76, 2], [2, 74, 2], [4, 72, 2], [6, 74, 2], [8, 76, 4], [12, 72, 4]],
        [[0, 74, 2], [2, 76, 2], [4, 77, 2], [6, 81, 2], [8, 79, 2], [10, 77, 2], [12, 76, 2], [14, 77, 2]],
        [[0, 76, 4], [4, 72, 2], [6, 69, 2], [8, 72, 2], [10, 76, 2], [12, 74, 4]]],
      hook: [
        [[0, 81, 3], [3, 79, 1], [4, 77, 2], [6, 72, 2], [8, 77, 2], [10, 79, 2], [12, 81, 4]],
        [[0, 79, 3], [3, 77, 1], [4, 76, 2], [6, 72, 2], [8, 76, 2], [10, 77, 2], [12, 79, 4]],
        [[0, 77, 3], [3, 76, 1], [4, 74, 2], [6, 69, 2], [8, 74, 2], [10, 76, 2], [12, 77, 2], [14, 79, 2]],
        [[0, 81, 4], [4, 79, 2], [6, 76, 2], [8, 72, 4], [12, 76, 4]],
        [[0, 81, 3], [3, 79, 1], [4, 77, 2], [6, 72, 2], [8, 77, 2], [10, 79, 2], [12, 81, 4]],
        [[0, 79, 3], [3, 77, 1], [4, 76, 2], [6, 72, 2], [8, 76, 2], [10, 77, 2], [12, 79, 4]],
        [[0, 76, 3], [3, 77, 1], [4, 79, 2], [6, 81, 2], [8, 84, 4], [12, 81, 4]],
        [[0, 77, 2], [2, 76, 2], [4, 74, 4], [8, 74, 8]]],
      jouer(sec, b, s, t, P, q, ch, niv) {
        const mega = sec === 'M', sw = s % 4 === 2 ? q * 0.28 : 0, tt = t + sw; // un peu « chaloupé »
        bodhran(s, s % 4 === 2 ? tt : t, mega);
        luth(s, t, P, ch, sw, niv >= 1 || mega);
        // la contrebasse, dès le début (pendant le méga refrain, c'est la grosse basse qui la remplace sur les temps forts)
        if (!mega) { if (s === 0) I.contrebasse(t, ch.r, P * 1.6, 0.6); if (s === 8) I.contrebasse(t, ch.r + 7 > 47 ? ch.r - 5 : ch.r + 7, P * 1.6, 0.52); }
        if (niv >= 1 || mega) { if (s === 4 || s === 12) I.clap(t, 0.4); if (s % 4 === 2) I.tamb(tt, mega ? 0.15 : 0.13); if (!mega && (s === 0 || s === 8)) { I.kickRond(t, 0.6); I.plancher(t, 0.3); } }
        if (niv >= 2 || mega) {
          if (!mega && s === 14) I.contrebasse(tt, ch.r + 12, q * 1.5, 0.32);
          if (s % 4 === 2) I.accordeon(tt, ch.v, q * 1.3, 0.02, 0.3);
        }
        if (niv >= 3 && !mega) joue(this.melodie[b % 4], s, (m, l) => I.flutebec(tt, m, q * l * 0.92, 0.12, 0.15));
        if (mega) {
          // le méga refrain « folk qui tape » : le gros pied sur chaque temps, une basse profonde, la contrebasse qui rebondit
          if (s % 4 === 0) I.kickRond(t, 0.85, P, true);
          if (s === 0 || s === 8) I.b808(t, grave(ch), P * 1.8, 0.34, { grain: 0.35 });
          if (s % 4 === 2) I.contrebasse(tt, ch.r + (s === 6 || s === 14 ? 12 : 0), q * 1.4, 0.42);
          if (s === 0) I.bourdon(t, [ch.r + 12, ch.r + 19], P * 3.9, 0.02);
          if (s === 2 || s === 10) I.gratte(tt, ch.v, 0.08, 'luth', 1, 0.009, N().music, P * 0.4);
          if (s === 6) I.bodhran(tt, 0.4, true);
          if (s === 12 && b % 4 === 3) I.hey(t);
          joue(this.hook[b], s, (m, l) => { I.violon(tt, m, q * l * 0.95, 0.15, 0.15); I.violon(tt, m - 12, q * l * 0.95, 0.07, -0.2); I.flutebec(tt, m + 12, q * l * 0.9, 0.05, -0.35); });
        }
      },
      build(s, t, P, q, ch) { // la montée : le bodhrán roule, le violon tient, la salle crie « Hé ! »
        if (s % 4 === 0) I.plancher(t, 0.6);
        if (s >= 8) I.bodhran(t, 0.14 + (s - 8) * 0.045, false); else if (s % 2 === 0) I.bodhran(t, 0.2, false);
        if (s === 0 || s === 8) I.gratte(t, [ch.r + 12, ...ch.v, ch.v[0] + 12], 0.17, 'luth', 1, 0.015, N().music);
        if (s === 0) { I.b808(t, grave(ch), P * 3.8, 0.3, { de: grave(ch) - 5, glisse: P * 3, grain: 0.4 }); I.violon(t, ch.rac + 12, P * 3.7, 0.07, 0.1, N().music); }
        if (s % 4 === 0) I.kickRond(t, 0.5 + s * 0.03);
        if (s === 12) I.hey(t);
      },
      relance(k, b, s, t, P, q, ch) {
        if (k <= 2 && s % 4 === 0) I.tic(t, s === 0);
        if ((k === 1 || k === 2) && s === 0) I.bourdon(t, [ch.r + 12, ch.r + 19], P * 3.9, 0.016);
        if (k >= 2) bodhran(s, t, k === 4);
        if (k >= 3) { luth(s, t, P, ch, 0, true); if (s === 0) I.contrebasse(t, ch.r, P * 1.6, 0.55); if (s === 8) I.contrebasse(t, ch.r + 7 > 47 ? ch.r - 5 : ch.r + 7, P * 1.6, 0.5); }
        if (k === 4 && (s === 0 || s === 8)) I.kickRond(t, 0.6);
        if (k === 4) { if (s === 4 || s === 12) I.clap(t, 0.3); if (s % 4 === 2) I.accordeon(t, ch.v, q * 1.3, 0.02, 0.3); if (b === 7 && s >= 8) I.bodhran(t, 0.2 + (s - 8) * 0.04, false); }
      },
      sons: {
        note(t, m, q) { I.corde(t, m, 0.95, 'luth', -0.1, N().sfx); I.flutebec(t, m + 12, 0.13, 0.1, 0.2, N().sfx); if (q === 2) I.corde(t + 0.05, m + 12, 0.35, 'harpe', 0.35, N().sfx); },
        repousse(t, tons) { I.gratte(t, [tons[0] - 12, ...tons], 0.32, 'luth', 1, 0.016, N().sfx); I.bodhran(t, 0.9, true, N().sfx); I.bodhran(t + 0.06, 0.4, false, N().sfx); I.vent(t); },
        stop(t, tons) { [tons[0], tons[1], tons[2], tons[0] + 12, tons[1] + 12].forEach((m, i) => I.corde(t + i * 0.05, m, 0.32 - i * 0.03, 'harpe', -0.4 + i * 0.2, N().sfx)); I.ding(t + 0.25, tons[2] + 12, 0.07); },
        vague(t, tons) { const m = tons[2] + 12; for (let i = 0; i < 6; i++) I.flutebec(t + i * 0.05, i % 2 ? m + 2 : m, 0.05, 0.08, 0.2, N().sfx); I.tamb(t, 0.16); I.tamb(t + 0.1, 0.12); I.tamb(t + 0.2, 0.08); I.vent(t); },
        tue(t, m) { I.corde(t, m, 0.45, 'harpe', 0.3, N().sfx); I.ding(t, m, 0.09); },
        solo(t, m, d, v) { I.flutebec(t, m, d, v * 1.1, 0, N().lead); I.corde(t, m, v * 3, 'luth', 0, N().lead); },
      },
    },
    { // ---------- Acte II : « La forge » — forge d'Orient, la mineur / mi, 112 ----------
      nom: 'La forge', bpm: 112, ton: 9, salle: 'forge', gain: -1,
      couplet: ['E', 'F', 'E', 'Dm'], refrain: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'],
      montee: 'E', cadence: ['Am', 'G', 'F', 'E'], decale: 0, victoire: 'A',
      melodie: [
        [[0, 76, 2], [2, 77, 1], [3, 80, 1], [4, 81, 4], [8, 80, 2], [10, 77, 2], [12, 76, 4]],
        [[0, 77, 2], [2, 76, 1], [3, 77, 1], [4, 81, 2], [6, 80, 2], [8, 77, 4], [12, 76, 4]],
        [[0, 71, 2], [2, 72, 1], [3, 74, 1], [4, 76, 2], [6, 77, 2], [8, 80, 2], [10, 77, 2], [12, 76, 4]],
        [[0, 74, 2], [2, 72, 2], [4, 71, 2], [6, 72, 2], [8, 74, 4], [12, 77, 2], [14, 76, 2]]],
      hook: [
        [[0, 76, 4], [4, 77, 2], [6, 76, 2], [8, 72, 2], [10, 71, 2], [12, 69, 4]],
        [[0, 74, 4], [4, 76, 2], [6, 74, 2], [8, 71, 2], [10, 69, 2], [12, 67, 4]],
        [[0, 72, 4], [4, 74, 2], [6, 72, 2], [8, 69, 2], [10, 72, 2], [12, 77, 4]],
        [[0, 76, 2], [2, 77, 2], [4, 80, 4], [8, 77, 2], [10, 76, 2], [12, 80, 2], [14, 83, 2]],
        [[0, 81, 4], [4, 83, 2], [6, 81, 2], [8, 77, 2], [10, 76, 2], [12, 72, 4]],
        [[0, 79, 4], [4, 81, 2], [6, 79, 2], [8, 76, 2], [10, 74, 2], [12, 71, 4]],
        [[0, 77, 4], [4, 79, 2], [6, 77, 2], [8, 76, 2], [10, 74, 2], [12, 72, 4]],
        [[0, 71, 2], [2, 72, 2], [4, 74, 2], [6, 76, 2], [8, 80, 8]]],
      jouer(sec, b, s, t, P, q, ch, niv) {
        const mega = sec === 'M';
        maqsum(s, t, niv >= 1 || mega);
        b808forge(s, t, q, ch, mega ? 0.48 : 0.3 + niv * 0.04);
        if (mega && (s === 3 || s === 11)) I.b808(t, grave(ch), q * 1.5, 0.3, { grain: 0.7 });
        if (s === 4 || s === 12) I.enclume(t, mega ? 0.12 : 0.07);
        if (niv >= 1 || mega) { if (s === 4 || s === 12) I.clap(t, 0.36); if (s % 2 === 0) I.tamb(t, s % 4 === 2 ? 0.13 : 0.06); }
        if (niv >= 2 || mega) { oud(s, t, ch); if (s === 0) I.cordes(t, [ch.r + 12, ch.r + 19], P * 3.9, 0.014, { att: 0.3, cut: 1400, bas: true }); }
        if (niv >= 3 && !mega) joue(this.melodie[b % 4], s, (m, l) => I.ney(t, m, q * l * 0.95, 0.13, 0.12));
        if (mega) {
          if (s === 0 && b === 0) I.gong(t, 0.11);
          if (s === 6 || s === 14) I.zills(t, 0.06, 0.35);
          if (s % 2 === 1 && s !== 15) I.darbouka(t, 'ka', 0.16, 0.2);
          if (s === 0 && b % 2 === 0) I.choeur(t, ch.v.map(m => m + 12), P * 7.6, 0.04);
          if (s === 0) I.cordes(t, [ch.r + 12, ...ch.v], P * 3.9, 0.02, { att: 0.08, cut: 2600 });
          joue(this.hook[b], s, (m, l) => { I.violon(t, m, q * l * 0.95, 0.13, -0.2); I.violon(t, m - 12, q * l * 0.95, 0.085, 0.2); I.ney(t, m + 12, q * l * 0.9, 0.045, 0); });
        }
      },
      build(s, t, P, q, ch) { // la montée : la darbouka roule de plus en plus vite
        if (s % 4 === 0) I.darbouka(t, 'doum', 0.62);
        if (s < 12) I.darbouka(t, 'tek', 0.16 + s * 0.025, 0.12);
        else { I.darbouka(t, 'tek', 0.45, 0.12); I.darbouka(t + q / 2, 'ka', 0.42, -0.12); }
        if (s === 0) { I.cordes(t, [ch.r + 12, ...ch.v], P * 3.9, 0.026, { att: P * 3, cut: 3000 }); I.frotte(t, P * 3.9, 0.11); I.corde(t, ch.r + 12, 0.4, 'oud', 0, N().music); I.b808(t, grave(ch), P * 3.8, 0.34, { de: grave(ch) - 7, glisse: P * 3.4, grain: 0.6 }); }
        if (s === 12) I.zills(t, 0.08);
      },
      relance(k, b, s, t, P, q, ch) {
        if (k <= 2 && s % 4 === 0) I.tic(t, s === 0);
        if ((k === 1 || k === 2) && s === 0) I.cordes(t, [ch.r + 12, ch.r + 19], P * 3.9, 0.016, { att: 0.3, cut: 1500, bas: true });
        if (k === 1 && s === 0) I.enclume(t, 0.06);
        if (k >= 2) { maqsum(s, t, k === 4); if (s === 4 || s === 12) I.clap(t, 0.26); }
        if (k >= 3) { oud(s, t, ch); b808forge(s, t, q, ch, 0.4); if (s % 2 === 0) I.tamb(t, s % 4 === 2 ? 0.09 : 0.04); if (s === 4 || s === 12) I.enclume(t, 0.08); if (s === 0) I.cordes(t, [ch.r + 12, ch.r + 19], P * 3.9, 0.014, { att: 0.3, cut: 1400, bas: true }); }
        if (k === 4) {
          if (s === 0 && b % 4 === 0) I.gong(t, 0.08);
          if (s === 6 || s === 14) I.zills(t, 0.05, 0.35);
          if (b === 7 && s >= 8) { I.darbouka(t, 'tek', 0.2 + (s - 8) * 0.04, 0.12); I.darbouka(t + q / 2, 'ka', 0.2 + (s - 8) * 0.04, -0.12); }
        }
      },
      sons: {
        note(t, m, q) { I.corde(t, m, 1, 'oud', -0.1, N().sfx); I.darbouka(t, 'tek', 0.45, 0.25, N().sfx); if (q === 2) I.zills(t + 0.02, 0.05, 0.35, N().sfx); },
        repousse(t, tons) { I.enclume(t, 0.15); I.darbouka(t, 'doum', 1, 0, N().sfx); I.cordes(t, [tons[0] - 12, ...tons.slice(0, 3)], 0.35, 0.05, { att: 0.005, rel: 0.3, cut: 4200, bus: N().sfx, sec: true }); I.vent(t); },
        stop(t, tons) { I.gong(t, 0.09, N().sfx); I.bol(t + 0.01, tons[0] + 12, 0.08); },
        vague(t, tons) { for (let i = 0; i < 6; i++) I.zills(t + i * 0.045, 0.05 - i * 0.006, i % 2 ? 0.45 : -0.45, N().sfx); I.vent(t); I.ney(t, tons[2] + 12, 0.25, 0.06, 0, N().sfx); },
        tue(t, m) { I.zills(t, 0.065, 0.2, N().sfx); I.corde(t, m, 0.35, 'oud', 0.2, N().sfx); },
        solo(t, m, d, v) { I.ney(t, m, d, v * 1.05, 0, N().lead); I.corde(t, m, v * 2.8, 'oud', 0, N().lead, d + 0.3); },
      },
    },
    { // ---------- Acte III : « La chevauchée » — orchestre au galop, sol mineur, 124 ----------
      nom: 'La chevauchée', bpm: 124, ton: 7, salle: 'cathedrale', gain: 0.5,
      couplet: ['Gm', 'F', 'Eb', 'D'], refrain: ['Eb', 'F', 'Gm', 'Gm', 'Eb', 'F', 'D', 'D'],
      montee: 'D', cadence: ['Gm', 'F', 'Eb', 'D'], decale: -2, victoire: 'G',
      melodie: [
        [[0, 67, 1], [1, 70, 1], [2, 74, 2], [4, 72, 1], [5, 70, 1], [6, 69, 2], [8, 67, 2], [10, 74, 2], [12, 70, 2], [14, 69, 2]],
        [[0, 65, 1], [1, 69, 1], [2, 72, 2], [4, 70, 1], [5, 69, 1], [6, 67, 2], [8, 65, 2], [10, 72, 2], [12, 69, 2], [14, 67, 2]],
        [[0, 63, 1], [1, 67, 1], [2, 70, 2], [4, 69, 1], [5, 67, 1], [6, 65, 2], [8, 63, 2], [10, 70, 2], [12, 67, 2], [14, 65, 2]],
        [[0, 62, 1], [1, 66, 1], [2, 69, 2], [4, 72, 2], [6, 69, 2], [8, 66, 2], [10, 69, 2], [12, 74, 4]]],
      hook: [
        [[0, 79, 4], [4, 77, 2], [6, 75, 2], [8, 74, 4], [12, 75, 2], [14, 77, 2]],
        [[0, 77, 4], [4, 75, 2], [6, 74, 2], [8, 72, 4], [12, 74, 2], [14, 75, 2]],
        [[0, 74, 6], [6, 79, 2], [8, 82, 4], [12, 81, 2], [14, 79, 2]],
        [[0, 79, 8], [8, 74, 4], [12, 70, 4]],
        [[0, 79, 4], [4, 77, 2], [6, 75, 2], [8, 74, 4], [12, 75, 2], [14, 77, 2]],
        [[0, 77, 4], [4, 75, 2], [6, 74, 2], [8, 72, 4], [12, 74, 2], [14, 75, 2]],
        [[0, 78, 4], [4, 79, 2], [6, 81, 2], [8, 78, 4], [12, 74, 4]],
        [[0, 81, 2], [2, 79, 2], [4, 78, 2], [6, 76, 2], [8, 74, 8]]],
      jouer(sec, b, s, t, P, q, ch, niv) {
        const mega = sec === 'M', tm = timb(ch);
        galop(s, t, q, ch);
        if (s === 0) { I.timbale(t, tm, 0.55); I.b808(t, grave(ch), P * 1.6, 0.36, { grain: 0.3 }); }
        if (s % 4 === 0) I.contrebasse(t, ch.r, q * 1.8, 0.4);
        if (niv >= 1 || mega) {
          if (s === 0 || s === 8 || s === 10) I.kickRond(t, s === 10 ? 0.45 : 0.6);
          if (s === 8) I.timbale(t, tm - 5, 0.45);
          if (s === 0) I.grossecaisse(t, 0.5);
          if (s === 4 || s === 12) I.caisse(t, 0.38);
          if (s === 14 || s === 15) I.caisse(t, 0.14);
        }
        if (niv >= 2 || mega) {
          if (s === 0) I.cuivres(t, ch.v, P * 3.6, 0.026, { clair: 0.15 });
          if (s === 8) I.b808(t, grave(ch), P * 1.6, 0.28, { grain: 0.3 });
        }
        if (niv >= 3 && !mega) joue(this.melodie[b % 4], s, (m, l) => { I.violon(t, m + 12, q * l * 0.95, 0.07, -0.25); I.violon(t, m, q * l * 0.95, 0.045, 0.25); });
        if (mega) {
          if (s === 0 && b % 2 === 0) { I.crash(t, 0.26); I.timbale(t, tm, 0.7); I.braam(t, [grave(ch) + 12, grave(ch) + 19, grave(ch) + 24], P * 3, 0.04); }
          if (s === 0 || s === 6 || s === 10) I.taiko(t, s === 0 ? 55 : 72, s === 0 ? 0.7 : 0.45);
          if (b % 2 === 1 && (s === 12 || s === 14)) I.timbale(t, tm, 0.32);
          if (s === 0 && b % 2 === 0) I.choeur(t, ch.v.map(m => m + 12), P * 7.6, 0.032);
          if (s === 0) I.cordes(t, [ch.r + 24, ...ch.v.map(m => m + 12)], P * 3.9, 0.02, { att: 0.06, cut: 3400 });
          joue(this.hook[b], s, (m, l) => { I.cuivres(t, [m], q * l * 0.95, 0.09, { clair: 0.95, p: -0.15 }); I.cuivres(t, [m - 12], q * l * 0.95, 0.06, { clair: 0.5, p: 0.2 }); I.violon(t, m, q * l * 0.95, 0.06, 0.3); });
        }
      },
      build(s, t, P, q, ch) { // la montée : roulement de caisse claire et de timbales, la cymbale gonfle
        I.caisse(t, 0.07 + s * 0.02); I.caisse(t + q / 2, 0.06 + s * 0.02);
        if (s % 2 === 0) I.timbale(t, timb(ch), 0.18 + s * 0.03);
        if (s === 0) I.braam(t, [grave(ch) + 12, grave(ch) + 19], P * 3.6, 0.035);
        if (s === 12) I.b808(t, grave(ch), P, 0.4, { de: grave(ch) + 12, glisse: P * 0.8, grain: 0.5 });
        if (s === 0) { I.frotte(t, P * 3.9, 0.15); I.cuivres(t, ch.v, P * 3.8, 0.034, { clair: 0.3 }); I.cordes(t, [ch.r + 12, ch.r + 24], P * 3.9, 0.024, { att: P * 3 }); }
      },
      relance(k, b, s, t, P, q, ch) {
        const tm = timb(ch);
        if (k <= 2 && s % 4 === 0) I.tic(t, s === 0);
        if ((k === 1 || k === 2) && s === 0) I.cordes(t, [ch.r + 12, ...ch.v], P * 3.9, 0.018, { att: 0.3, cut: 1800 });
        if (k === 1 && s === 0) I.timbale(t, tm, 0.35);
        if (k >= 2) { if (s === 0) { I.grossecaisse(t, 0.45); I.timbale(t, tm, 0.5); } if (s === 8) I.timbale(t, tm - 5, 0.4); if (s === 4 || s === 12) I.snare(t, 0.3); }
        if (k >= 3) { galop(s, t, q, ch); if (s === 0) { I.cuivres(t, ch.v, P * 3.6, 0.024, { clair: 0.15 }); I.b808(t, grave(ch), P * 1.6, 0.34, { grain: 0.3 }); } if (s % 4 === 0) I.contrebasse(t, ch.r, q * 1.8, 0.4); }
        if (k === 4 && (s === 0 || s === 8)) I.kickRond(t, 0.6);
        if (k === 4) {
          if (s === 0 && b % 4 === 0) I.crash(t, 0.24);
          if (s === 0 && b % 2 === 1) I.cuivres(t, ch.tri, 0.25, 0.04, { clair: 0.8 });
          if (b === 7 && s >= 8) { I.snare(t, 0.12 + (s - 8) * 0.04); I.snare(t + q / 2, 0.1 + (s - 8) * 0.04); }
        }
      },
      sons: {
        note(t, m, q) { I.corde(t, m, 1, 'pizz', -0.15, N().sfx); I.cuivres(t, [m], 0.16, 0.1, { clair: 0.85, bus: N().sfx, p: 0.15 }); if (q === 2) I.corde(t + 0.04, m + 12, 0.38, 'harpe', 0.3, N().sfx); },
        repousse(t, tons) { // le coup d'orchestre
          I.cuivres(t, [tons[0] - 12, ...tons.slice(0, 3)], 0.4, 0.04, { clair: 0.8, bus: N().sfx });
          I.cordes(t, tons.slice(0, 3).map(m => m + 12), 0.3, 0.03, { att: 0.005, rel: 0.3, cut: 5000, bus: N().sfx, sec: true });
          I.timbale(t, 43, 0.5, N().sfx); I.grossecaisse(t, 0.4, N().sfx);
        },
        stop(t, tons) { I.cordes(t, tons.slice(0, 3).map(m => m + 12), 0.7, 0.065, { att: 0.01, rel: 0.4, cut: 5000, trem: 14, bus: N().sfx }); I.frotte(t, 0.5, 0.12, N().sfx); },
        vague(t, tons) { [tons[0], tons[1], tons[2], tons[0] + 12, tons[1] + 12, tons[2] + 12, tons[0] + 24].forEach((m, i) => I.corde(t + i * 0.03, m, 0.26, 'harpe', -0.5 + i * 0.16, N().sfx)); },
        tue(t, m) { I.corde(t, m, 0.42, 'harpe', 0.2, N().sfx); I.ding(t, m, 0.08); },
        solo(t, m, d, v) { I.violon(t, m, d, v * 1.05, 0, N().lead); I.corde(t, m, v * 2.2, 'harpe', 0, N().lead); },
      },
    },
    { // ---------- Acte IV : « La tempête » — électro-techno, si mineur, 136 ----------
      nom: 'La tempête', bpm: 136, ton: 11, salle: 'club', gain: -2,
      couplet: ['Bm', 'Bm', 'G', 'G', 'A', 'A', 'F#', 'F#'], refrain: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'F#', 'F#'],
      montee: 'F#', cadence: ['Bm', 'A', 'G', 'F#'], decale: 2, victoire: 'B',
      melodie: [
        [[0, 78, 2], [2, 76, 2], [4, 74, 2], [6, 76, 1], [7, 78, 3], [10, 71, 2]],
        [[8, 74, 2], [10, 76, 2], [12, 78, 4]],
        [[0, 79, 2], [2, 78, 2], [4, 74, 2], [6, 78, 1], [7, 79, 3], [10, 71, 2]],
        [[8, 74, 2], [10, 76, 2], [12, 78, 2], [14, 76, 2]],
        [[0, 76, 2], [2, 74, 2], [4, 73, 2], [6, 74, 1], [7, 76, 3], [10, 69, 2]],
        [[8, 73, 2], [10, 74, 2], [12, 76, 4]],
        [[0, 78, 2], [2, 79, 2], [4, 82, 2], [6, 79, 1], [7, 78, 3], [10, 73, 2]],
        [[8, 70, 2], [10, 73, 2], [12, 76, 2], [14, 78, 2]]],
      hook: [
        [[0, 83, 3], [3, 78, 3], [6, 83, 2], [8, 85, 2], [10, 86, 2], [12, 85, 2], [14, 81, 2]],
        [[0, 83, 3], [3, 79, 3], [6, 83, 2], [8, 86, 4], [12, 83, 2], [14, 81, 2]],
        [[0, 81, 3], [3, 78, 3], [6, 81, 2], [8, 86, 2], [10, 85, 2], [12, 83, 2], [14, 81, 2]],
        [[0, 85, 3], [3, 81, 3], [6, 76, 2], [8, 81, 4], [12, 83, 2], [14, 85, 2]],
        [[0, 86, 3], [3, 83, 3], [6, 78, 2], [8, 83, 2], [10, 85, 2], [12, 86, 2], [14, 85, 2]],
        [[0, 83, 3], [3, 79, 3], [6, 74, 2], [8, 79, 2], [10, 83, 2], [12, 86, 2], [14, 83, 2]],
        [[0, 82, 3], [3, 85, 3], [6, 82, 2], [8, 78, 2], [10, 79, 2], [12, 82, 2], [14, 85, 2]],
        [[0, 85, 6], [6, 83, 2], [8, 82, 4], [12, 78, 4]]],
      jouer(sec, b, s, t, P, q, ch, niv) {
        const mega = sec === 'M';
        if (s % 4 === 0) I.kickDur(t, mega ? 1 : niv >= 1 ? 0.75 : 0.6, P);
        // la basse : sur le contretemps, puis elle « roule » (trois coups par temps) pendant le méga refrain
        if (mega) { if (s % 4 !== 0) I.reese(t, grave(ch) + (s % 4 === 3 ? 12 : 0), q * 0.9, 0.27, { cut: 650 + (b % 4) * 180, ouvre: 3 }); }
        else if (s % 4 === 2) I.reese(t, grave(ch), q * 1.6, niv >= 1 ? 0.3 : 0.24, { cut: 480 });
        if (!mega && niv >= 1 && b % 2 === 1 && s === 15) I.reese(t, grave(ch) + 12, q * 0.8, 0.2, { cut: 900 });
        if (niv >= 1 || mega) { if (s === 4 || s === 12) I.clap(t, 0.46); I.hatMetal(t, s % 4 === 2 ? 0.12 : 0.05, s % 4 === 2); }
        if (niv >= 2 || mega) acide(s, t, q, ch, mega ? 1300 : 420 + (b % 8) * 90, 0.09);
        if (niv >= 3 && !mega) { joue(this.melodie[b], s, (m, l) => I.pluck(t, m, 0.13, 0.2)); if (s === 6 || s === 14) I.stab(t, ch.v, 0.04, 0.12); }
        if (mega) {
          if (s === 0 && b % 4 === 0) I.crash(t, 0.3);
          if (s % 4 === 2) I.supersaw(t, ch.v.map(m => m + 12), q * 1.5, 0.036, 4400, true);
          if (s === 12 && b % 4 === 3) I.hey(t);
          if (s === 0 && b % 2 === 0) I.choeur(t, ch.v.map(m => m + 12), P * 7.6, 0.03);
          joue(this.hook[b], s, (m, l) => { I.synthlead(t, m - 12, q * l * 0.92, 0.13, -0.1); I.synthlead(t, m, q * l * 0.92, 0.05, 0.15); });
        }
      },
      build(s, t, P, q, ch) { // la montée : ça siffle, la caisse claire accélère
        if (s % 4 === 0 && s < 12) I.kickDur(t, 0.9, P);
        I.snare(t, 0.08 + s * 0.025); if (s >= 8) I.snare(t + q / 2, 0.08 + s * 0.025);
        if (s === 0) { I.riser(t, P * 3.9, 0.08); I.supersaw(t, ch.v, P * 3.9, 0.02, 2400); }
        if (s === 8) I.b808(t, grave(ch), P * 2, 0.4, { de: grave(ch) + 24, glisse: P * 1.8, grain: 0.8 });
        if (s % 2 === 0) acide(s, t, q, ch, 500 + s * 120, 0.06);
      },
      relance(k, b, s, t, P, q, ch) {
        if (k <= 2 && s % 4 === 0) I.tic(t, s === 0);
        if ((k === 1 || k === 2) && s === 0) I.nappe(t, ch.v, P * 3.9, 0.02, 1100);
        if (k >= 2) { if (s % 4 === 0) I.kickDur(t, 0.95, P); if (s === 4 || s === 12) I.clap(t, 0.38); }
        if (k >= 3) { if (s % 4 === 2) I.reese(t, grave(ch), q * 1.6, 0.3, { cut: 520 }); I.hatMetal(t, s % 4 === 2 ? 0.1 : 0.04, s % 4 === 2); if (s === 0) I.nappe(t, ch.v, P * 3.9, 0.018, 1700); }
        if (k === 4) {
          acide(s, t, q, ch, 700 + (b % 8) * 80, 0.06);
          if (s === 0 && b % 4 === 0) I.crash(t, 0.26);
          if (b === 7 && s >= 8) { I.snare(t, 0.12 + (s - 8) * 0.04); I.snare(t + q / 2, 0.1 + (s - 8) * 0.04); }
        }
      },
      sons: {
        note(t, m, q) { I.pluck(t, m, 0.3, -0.15, N().sfx); I.voix(t, m - 12, 0.12, 0.2, 1, N().sfx); if (q === 2) I.pluck(t + 0.02, m + 12, 0.09, 0.35, N().sfx); },
        repousse(t, tons) { I.supersaw(t, [tons[0] - 12, ...tons.slice(0, 3)], 0.3, 0.02, 5200); I.b808(t, tons[0] - 36, 0.4, 0.2, { bus: N().sfx, grain: 0.8 }); I.vent(t); I.clap(t, 0.4); },
        stop(t, tons) { for (let i = 0; i < 6; i++) I.pluck(t + i * 0.055, tons[0] + 12, 0.17 * (1 - i * 0.13), i % 2 ? 0.4 : -0.4, N().sfx); I.stop(t + 0.3, tons[0]); },
        vague(t) { I.laser(t, 0.1); I.vent(t); I.hatMetal(t, 0.15, true); },
        tue(t, m) { I.pluck(t, m + 12, 0.1, 0.25, N().sfx); I.ding(t, m, 0.08); },
        solo(t, m, d, v) { I.synthlead(t, m, d, v * 0.95, 0, N().lead); I.pluck(t, m + 12, v * 0.5, 0, N().lead); },
      },
    },
  ];

  // ================= « Le tube de l'été » : la victoire, en électro-techno à fond =================
  // ré majeur (les accords du refrain de « La tempête », mais en fête), 140, une basse énorme
  const TUBE = {
    nom: 'Le tube de l\'été', bpm: 140, gain: 1.5, acc: ['Bm', 'G', 'D', 'A'],
    hook: [
      [[0, 78, 2], [2, 78, 1], [3, 76, 1], [4, 74, 2], [6, 76, 2], [8, 78, 3], [11, 81, 3], [14, 78, 2]],
      [[0, 74, 2], [2, 74, 1], [3, 76, 1], [4, 78, 2], [6, 79, 2], [8, 78, 3], [11, 76, 3], [14, 74, 2]],
      [[0, 69, 2], [2, 74, 1], [3, 76, 1], [4, 78, 2], [6, 81, 2], [8, 83, 3], [11, 81, 3], [14, 78, 2]],
      [[0, 76, 3], [3, 73, 3], [6, 76, 2], [8, 81, 4], [12, 79, 2], [14, 78, 2]],
      [[0, 78, 2], [2, 78, 1], [3, 76, 1], [4, 74, 2], [6, 76, 2], [8, 78, 3], [11, 81, 3], [14, 78, 2]],
      [[0, 74, 2], [2, 74, 1], [3, 76, 1], [4, 78, 2], [6, 79, 2], [8, 78, 3], [11, 76, 3], [14, 74, 2]],
      [[0, 81, 2], [2, 81, 1], [3, 83, 1], [4, 81, 2], [6, 78, 2], [8, 74, 4], [12, 76, 2], [14, 78, 2]],
      [[0, 76, 6], [6, 73, 2], [8, 76, 2], [10, 81, 6]]],
  };
  // le refrain en basse : « boum » sur chaque contretemps, une glissade à la fin de chaque phrase (comme les tubes des festivals)
  function basseTube(b, s, t, q, ch, fort) {
    const gr = grave(ch);
    if (s % 4 === 2) { I.b808(t, gr, q * 1.7, fort ? 0.5 : 0.46, { grain: 0.9 }); I.reese(t, gr + 12, q * 1.5, 0.15, { cut: 900, sub: 0 }); }
    if (b % 4 === 3 && s === 14) I.b808(t, gr + 12, q * 2, 0.4, { de: gr, glisse: q * 1.2, grain: 0.9 });
  }
  function basseRoule(b, s, t, q, ch, cut) { // trois coups par temps, avec un saut d'octave
    const gr = grave(ch);
    if (s % 4 !== 0) I.reese(t, gr + (s % 4 === 3 ? 12 : 0), q * 0.9, 0.28, { cut, ouvre: 3 });
    if (s % 4 === 2) I.b808(t, gr, q * 1.4, 0.32, { grain: 0.9 });
  }
  function tube(sec, b, s, t, P, q, ch) {
    const intro = sec === 'TI', monte = sec === 'TB', pause = sec === 'TR';
    const drop = sec === 'TD' || sec === 'TM' || sec === 'TN', mega = sec === 'TM' || sec === 'TN', encore = sec === 'TN';
    if (intro) { // l'air arrive, comme derrière une porte, et la basse est déjà là
      if (s % 4 === 0) I.kickDur(t, 0.55, P);
      if (s % 4 === 2) I.hatMetal(t, 0.07, true);
      if (s === 0) { I.nappe(t, ch.v, P * 3.9, 0.02, 900); I.b808(t, grave(ch), P * 3.6, 0.3, { grain: 0.4, cut: 500 }); }
      joue(TUBE.hook[b], s, (m, l) => I.pluck(t, m, 0.08, 0));
    }
    if (monte) { // deux mesures qui montent, montent… puis la basse plonge, et un temps de silence
      const i = b * 16 + s;
      if (b === 0 ? s % 4 === 0 : s < 8 && s % 2 === 0) I.kickDur(t, 0.85, P);
      if (b === 0 ? s % 2 === 0 : s < 12) I.caisse(t, 0.08 + i * 0.009);
      if (b === 1 && s < 12) I.caisse(t + q / 2, 0.08 + i * 0.009);
      if (b === 0 && s === 0) I.riser(t, P * 7, 0.09);
      if (s === 0) I.supersaw(t, ch.v.map(m => m + 12), P * (b ? 2.9 : 3.9), 0.012 + b * 0.008, 1200 + b * 1800);
      if (s % 2 === 0 && i < 24) I.reese(t, grave(ch) + 12, q * 1.5, 0.08 + i * 0.006, { cut: 300 + i * 70, sub: 0.3 });
      if (b === 1 && s === 4) I.b808(t, grave(ch), P * 1.9, 0.45, { de: grave(ch) + 24, glisse: P * 1.7, grain: 0.9 });
      if (b === 1 && s === 8) I.hey(t);
    }
    if (pause) { // « ENCORE UNE FOIS ! » : tout s'arrête, ça remonte, et ça repart
      if (s === 0) { I.crash(t, 0.4); I.hey(t); I.supersaw(t, ch.v.map(m => m + 12), P * 1.9, 0.03, 3000); I.b808(t, grave(ch), P * 1.8, 0.4, { grain: 0.8 }); I.riser(t, P * 3.7, 0.09); }
      if (s >= 8 && s < 15) { I.caisse(t, 0.12 + (s - 8) * 0.05); I.caisse(t + q / 2, 0.1 + (s - 8) * 0.05); }
      if (s === 8) I.b808(t, grave(ch), P * 1.6, 0.42, { de: grave(ch) + 24, glisse: P * 1.4, grain: 0.9 });
    }
    if (drop) {
      if (s % 4 === 0) I.kickDur(t, 1, P);
      if (s === 0 && b === 0) { I.crash(t, 0.42); I.b808(t, grave(ch), P * 1.2, 0.5, { grain: 0.9 }); }
      if (s === 4 || s === 12) { I.clap(t, 0.45); if (mega) I.caisse(t, 0.36); }
      if (encore && (s === 0 || s === 8)) I.clap(t, 0.25);
      if (encore) I.hatMetal(t, s % 4 === 2 ? 0.13 : 0.06, s % 4 === 2, s % 2 ? 0.35 : -0.25);
      else I.hatMetal(t, s % 4 === 2 ? 0.12 : 0.05, s % 4 === 2);
      if (mega) basseRoule(b, s, t, q, ch, encore ? 1100 : 800); else basseTube(b, s, t, q, ch);
      if (s % 2 === 0) I.acid(t, ch.r + 24 + (s % 8 === 6 ? 7 : 0), q * 0.8, mega ? 0.05 : 0.04, encore ? 2200 : mega ? 1700 : 1100, s % 8 === 0 ? 1 : 0);
      if (s % 4 === 2) I.supersaw(t, ch.v.map(m => m + 12), q * 1.3, mega ? 0.032 : 0.022, mega ? 5000 : 4200, true);
      joue(TUBE.hook[b % 8], s, (m, l) => {
        I.synthlead(t, m, q * l * 0.92, mega ? 0.085 : 0.07, -0.1);
        if (mega) { I.synthlead(t, m + 12, q * l * 0.92, encore ? 0.06 : 0.05, 0.15); I.voix(t, m - 12, q * l * 0.9, encore ? 0.13 : 0.11, 1, Son.N.music); }
        else I.pluck(t, m + 12, 0.045, 0.25);
      });
      if (mega) {
        I.tamb(t, s % 4 === 2 ? 0.14 : 0.05);
        if (s === 0 && b % 2 === 0) I.choeur(t, ch.v.map(m => m + 12), P * 7.6, encore ? 0.06 : 0.05);
        if (s === 0 && b % (encore ? 2 : 4) === 0) I.crash(t, 0.3);
        if (s === 12 && b % (encore ? 2 : 4) === (encore ? 1 : 3)) I.hey(t);
      }
    }
  }
  // le dernier accord : tout le monde, une fois, très fort, et la basse qui plonge
  function finTube(s, t, P, ch) {
    if (s !== 0) return;
    I.crash(t, 0.45); I.kickDur(t, 1, P); I.hey(t);
    I.b808(t, grave(ch), P * 3.2, 0.5, { de: grave(ch) + 12, glisse: P * 1.5, grain: 0.9, rel: 0.4 });
    I.reese(t, grave(ch) + 12, P * 2.5, 0.16, { cut: 900, sub: 0 });
    I.supersaw(t, ch.v.map(m => m + 12), P * 3, 0.035, 4500); I.choeur(t, ch.v.map(m => m + 12), P * 3, 0.05);
    I.synthlead(t, ch.tri[0] + 12, P * 3, 0.08);
  }

  // ================= les sections =================
  // C : couplet (en boucle) ; U : la montée ; M : le méga refrain ; G0 : « 1, 2, 3, 4 » ; G1 à G4 : la relance ;
  // GC : la musique cale ; V : la victoire ; TI, TB, TD, TM, TR (« encore une fois ! »), TN (le refrain encore), TF : le tube.
  const nBars = (sec, ch) => ({ C: ch.couplet.length, U: 1, M: 8, G0: 1, G1: 4, G2: 4, G3: 4, G4: 8, GC: 1, V: 2, TI: 2, TB: 2, TD: 8, TM: 8, TR: 1, TN: 8, TF: 1 })[sec];
  function nomAccord(sec, b, c) {
    if (sec === 'C') return c.couplet[b];
    if (sec === 'M') return c.refrain[b];
    if (sec === 'G1' || sec === 'G2') return c.refrain[b];
    if (sec === 'G3') return c.refrain[4 + b];
    if (sec === 'G4') return c.cadence[b % 4];
    if (sec === 'V') return c.victoire;
    if (sec === 'TF') return 'D';
    if (sec === 'TR') return 'A';
    if (sec[0] === 'T') return TUBE.acc[b % 4];
    return c.montee;
  }

  const M = { on: false, chanson: 0, bpm: 100, nextT: 0, s: 0, bar: 0, sec: 'C', file: [], beatN: -1, niveau: 0, niv: 0, megaDemande: false, bars: [], cb: {} };
  const sp = () => 60 / M.bpm;
  const C = () => CHANSONS[M.chanson];

  function demarrer(t0, cb, chanson, niveau) {
    const c = CHANSONS[chanson];
    Object.assign(M, { on: true, chanson, bpm: c.bpm, nextT: t0, s: 0, bar: 0, sec: 'C', file: [], beatN: -1, niveau, niv: niveau, megaDemande: false, bars: [], cb });
    Son.salle(c.salle); Son.volume(c.gain, Math.max(0, t0 - 0.1)); Son.tempo(M.bpm); Son.retablir(t0 - 0.05);
  }
  function relancer(t0, chanson, final) {
    const c = CHANSONS[chanson];
    Object.assign(M, { on: true, chanson, bpm: c.bpm, nextT: t0, s: 0, bar: 0, sec: 'G0', file: final ? ['G1', 'G2', 'G3', 'G4', 'TI', 'TB', 'TD', 'TM', 'TR', 'TN', 'TF'] : ['G1', 'G2', 'G3', 'G4', 'C'], megaDemande: false });
    Son.salle(c.salle); Son.volume(c.gain, Math.max(0, t0 - 0.1)); Son.tempo(M.bpm); Son.retablir(t0 - 0.05);
  }
  function arreter() { M.on = false; }
  function couper(t) { M.on = false; Son.couper(t); }
  function planifier(ac) {
    if (!M.on) return;
    const horizon = ac.currentTime + 0.14;
    let garde = 0;
    while (M.on && M.nextT < horizon && garde++ < 64) { pas(M.nextT); avancer(); }
  }
  function avancer() {
    M.nextT += sp() / 4; M.s++;
    if (M.s < 16) return;
    M.s = 0; M.bar++;
    if (M.sec === 'C' && M.megaDemande && M.bar % 4 === 0) { M.sec = 'U'; M.bar = 0; M.megaDemande = false; M.file.unshift('M', 'C'); return; }
    if (M.bar < nBars(M.sec, C())) return;
    M.bar = 0;
    if (M.sec === 'V' || M.sec === 'TF') { M.on = false; M.cb.fin && M.cb.fin(M.nextT); return; }
    if (M.file.length) { M.sec = M.file.shift(); if (M.sec === 'TI') { M.bpm = TUBE.bpm; Son.tempo(M.bpm); Son.volume(TUBE.gain, M.nextT); } }
  }

  function pas(t) {
    const c = C(), sec = M.sec, b = M.bar, s = M.s, chN = nomAccord(sec, b, c), ch = acc(chN), P = sp(), q = P / 4;
    if (s === 0) {
      M.niv = M.niveau;
      M.bars.push({ t0: t, ch: chN, sec, b }); if (M.bars.length > 24) M.bars.shift();
      if (b === 0) M.cb.section && M.cb.section({ sec, t0: t, P, chanson: M.chanson, n: nBars(sec, c) });
    }
    if (s % 4 === 0) { M.beatN++; M.cb.temps && M.cb.temps({ t, n: M.beatN, b: s / 4, sec, bar: b, ch: chN, P, nBars: nBars(sec, c) }); }
    if (sec[0] === 'G') return c.relance(sec === 'G0' || sec === 'GC' ? 0 : +sec[1], b, s, t, P, q, ch);
    if (sec === 'U') return c.build(s, t, P, q, ch);
    if (sec === 'V') return victoire(b, s, t, P, q, ch);
    if (sec === 'TF') return finTube(s, t, P, ch);
    if (sec[0] === 'T') return tube(sec, b, s, t, P, q, ch);
    c.jouer(sec, b, s, t, P, q, ch, M.niv);
  }

  function victoire(b, s, t, P, q, ch) {
    if (b === 0 && s === 0) { I.crash(t, 0.35); I.kick(t, 1, P); I.basse(t, ch.r, P * 6, 0.45, 0.6); I.nappe(t, ch.v, P * 7, 0.06, 2400); I.stab(t, ch.v, 0.08, P); }
    if (b === 0 && s === 4) I.snare(t, 0.4);
    const fan = { 0: [ch.tri[0], 2], 2: [ch.tri[1], 2], 4: [ch.tri[2], 2], 6: [ch.tri[0] + 12, 10] };
    if (b === 0 && fan[s]) { I.lead(t, fan[s][0], q * fan[s][1], 0.15); I.lead(t, fan[s][0] + 12, q * fan[s][1], 0.05); }
    if (b === 1 && s === 0) { I.kick(t, 1, P); I.stab(t, ch.v, 0.09, P * 2); I.crash(t, 0.3); }
  }

  function accordA(t) {
    for (let i = M.bars.length - 1; i >= 0; i--) if (M.bars[i].t0 <= t + 0.02) return M.bars[i];
    return M.bars[0] || { ch: 'Dm' };
  }
  function tonsChant(t) { const a = acc(accordA(t).ch); return [...a.tri, a.tri[0] + 12]; }

  return {
    M, CHANSONS, TUBE, acc, nBars, nomAccord, demarrer, relancer, arreter, couper, planifier, tonsChant,
    demanderMega() { M.megaDemande = true; },
    cale(k) { M.file.unshift('GC', 'G' + k); },
    get bpm() { return M.bpm; },
  };
})();
