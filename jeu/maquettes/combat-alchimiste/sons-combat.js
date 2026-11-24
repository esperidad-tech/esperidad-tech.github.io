/* Les sons du combat de l'Alchimiste (enquête 10, combat final) — version 11, 24 novembre.
   Romain, 24 nov. 11 h 46 : « Les sons, ils sont affreux, ils sont tous à refaire. Il faut mettre des sons vraiment d'armée, une
   petite musique, une musique de combat qui soit prenante et qui soit pas chiante, parce qu'elle dure quand même assez longtemps. »
   Tout est fabriqué avec le moteur de l'Atelier des sons du donjon (jeu/donjon/essai/sons/moteur.js, bruitages.js, musiques.js),
   sans aucun fichier. En ré mineur, comme le donjon ; rien d'aigu ni d'animal dans la musique (la règle de Romain du 9 novembre).
   SonsCombat.demarrer() au premier toucher ; .jouer(nom) ; .musique(true / false) ; .phase(0 à 4) ; .couper(muet). */
(function (G) {
  "use strict";
  var SC = {}, A = null, ctx = null, O = null, T = null, h, m;
  var BUS = null, dernier = {}, MUS = null, PHASE = 0, TENSION = 0, MUET = false;

  SC.pret = function () { return !!A; };
  SC.demarrer = function (ctxDonne) {
    if (A && !ctxDonne) { if (ctx.state === "suspended") try { ctx.resume(); } catch (e) {} return true; }
    if (!G.Moteur) return false;
    try {
      ctx = ctxDonne || new (G.AudioContext || G.webkitAudioContext)();
      A = G.Moteur(ctx, { volume: 0.85, horsLigne: !!ctxDonne }); O = G.BRUITAGES_OUTILS || {}; T = G.MUSIQUES_OUTILS || null;
      h = G.Moteur.hasard; m = G.Moteur.midi;
      // des prises qui restent branchées : sèche, un peu de salle, beaucoup de salle (la place de Brumeval, de nuit)
      var P = A.prise(0, 1);
      BUS = { P: P, sec: A.bus(P, { rev: 0.18 }), salle: A.bus(P, { rev: 0.45, grotte: 0.12 }), loin: A.bus(P, { rev: 0.7, grotte: 0.35, g: 0.8 }),
        g: A.bus(P, { rev: 0.25, pan: -0.25 }), d: A.bus(P, { rev: 0.25, pan: 0.25 }) };
      return true;
    } catch (e) { A = null; return false; }
  };
  SC.couper = function (muet) { MUET = !!muet; if (A) A.volume.gain.setTargetAtTime(MUET ? 0 : 0.85, ctx.currentTime, 0.05); };
  SC.phase = function (p) { PHASE = p; };
  SC.tension = function (x) { TENSION = Math.max(0, Math.min(1, x)); };

  /* ================= les bruitages ================= */
  function porcelaine(t, g, dest) { O.tinc(A, t, h(1700, 2600), { g: 0.08 * g, clic: 0.3 }, dest); }
  // la voix de Grosbec : dans son casque en bec, elle sort étouffée, grave, éraillée
  function voix(t, o, dest) {
    return A.cri(t, { f: o.f || 150, forme: o.forme || "effort", d: o.d || 0.45, rauque: o.rauque == null ? 0.6 : o.rauque, grain: 0.7, hp: 90, lp: o.lp || 950, souffle: 0.25, g: o.g || 0.35, a: 0.03 }, dest);
  }
  function cor(t, f, d, g, dest) {
    var env = [[0, 0], [Math.min(0.35, d * 0.3), 1], [d * 0.75, 0.85], [d, 0]];
    A.ton(t, { type: "sawtooth", f: f, env: env, g: g, sat: 1.3, filtres: [{ type: "lowpass", f: 300, pts: [[Math.min(0.4, d * 0.3), 1500], [d, 420]], q: 1.2 }], vib: [5, f * 0.006], vibRetard: 0.3 }, dest);
    A.ton(t, { type: "sawtooth", f: f, det: 8, env: env, g: g * 0.6, filtres: [{ type: "lowpass", f: 900, q: 0.7 }] }, dest);
  }
  var BR = {
    // l'explosion : le claquement, le grave qui tombe, les débris qui retombent
    boom: function (t, B) { O.boum(A, t, { g: 0.75 }, B.salle); O.craque(A, t + 0.05, 0.35, 0.25, B.salle); A.bruit(t, { coul: "brun", lp: 180, env: A.perc(0.01, 1.1), g: 0.5 }, B.loin); },
    // une petite flamme qui prend
    feu: function (t, B) { O.embrase(A, t, 0.45, B.sec); },
    pschitt: function (t, B) { A.bruit(t, { hp: 2400, env: [[0, 0], [0.02, 1], [0.12, 0.7], [0.55, 0]], g: 0.22 }, B.sec); A.joue(t, A.crepitement(0.5, 60), { g: 0.25, hp: 3000, env: [[0, 1], [0.5, 0]] }, B.sec); },
    zap: function (t, B) { A.joue(t, A.crepitement(0.35, 160, { forme: function (u) { return 1 - u * 0.7; } }), { g: 0.5, hp: 1500, env: [[0, 1], [0.35, 0]] }, B.sec); A.ton(t, { type: "sawtooth", f: 110, env: A.perc(0.005, 0.3), g: 0.16, trem: [32, 0.9], lp: 2500 }, B.sec); A.bruit(t, { hp: 3000, env: A.perc(0.002, 0.2), g: 0.25, rugueux: 0.9, rugVit: 12 }, B.sec); },
    // un automate qui tombe : le choc sourd, et sa coque de porcelaine qui tinte
    thud: function (t, B) { A.choc(t, { f: h(120, 160), f2: 55, d: 0.12, g: 0.3, sat: 2, bruit: 0.5 }, B.sec); porcelaine(t + 0.01, 1, B.sec); },
    // percuter un mur : bam
    bam: function (t, B) { A.choc(t, { f: 170, f2: 70, d: 0.1, g: 0.35, sat: 2.5 }, B.sec); O.tinc(A, t, h(1200, 1500), { g: 0.12 }, B.sec); },
    // Grosbec touché par un corps : un grand coup sur son armure
    gong: function (t, B) { A.choc(t, { f: 95, f2: 45, d: 0.3, g: 0.55, sat: 3 }, B.salle); A.cloche(t, m(45), { d: 2.2, rapport: 2.76, indice: 1.6, g: 0.1 }, B.salle); O.claque(A, t, 0.35, B.sec); A.cloche(t + 0.01, m(57), { d: 1.4, rapport: 3.9, indice: 1.2, g: 0.04 }, B.loin); },
    // son bouclier arrête le coup : une cloche claire, et un frisson doré
    bloque: function (t, B) { A.cloche(t, m(76), { d: 1.3, rapport: 2.4, indice: 0.9, g: 0.15 }, B.salle); A.cloche(t, m(83), { d: 0.9, rapport: 3.5, indice: 0.6, g: 0.07 }, B.loin); O.clic(A, t, 5200, 0.5, B.sec); },
    bouclier: function (t, B) { [69, 74, 76, 81].forEach(function (n, k) { A.cloche(t + k * 0.07, m(n), { d: 1.6, rapport: 2, indice: 0.5, g: 0.04 }, B.loin); }); A.bruit(t, { coul: "rose", filtres: [{ type: "bandpass", f: 800, pts: [[0.5, 3000]], q: 2 }], env: [[0, 0], [0.4, 1], [0.8, 0]], g: 0.12 }, B.loin); },
    // la vague : le rouleau qui gronde, l'eau qui déferle et bouillonne
    vague: function (t, B) {
      A.bruit(t, { coul: "rose", filtres: [{ type: "lowpass", f: 500, pts: [[0.35, 2600], [1.5, 500]], q: 0.8 }], env: [[0, 0], [0.3, 1], [0.9, 0.7], [1.6, 0]], g: 0.55 }, B.salle);
      A.bruit(t, { coul: "brun", lp: 220, env: [[0, 0], [0.25, 1], [1.4, 0]], g: 0.5 }, B.loin);
      A.joue(t + 0.15, A.eau(1.3, 110, { fmin: 500, fmax: 2600 }), { g: 0.5, env: [[0, 0], [0.15, 1], [1.3, 0]] }, B.sec);
    },
    splat: function (t, B) { O.sploutch(A, t, { g: 0.5, f: 300 }, B.sec); for (var k = 0; k < 4; k++) A.goutte(t + 0.03 + k * h(0.03, 0.07), { g: 0.05 }, B.sec); },
    // la fiole qui part (un petit swish) ; la fiole qui éclate (du verre)
    choisir: function (t, B) { O.tinc(A, t, h(2300, 2700), { g: 0.06, clic: 0.25 }, B.sec); },
    fiole: function (t, B) { O.swish(A, t, 0.16, { f1: 900, f2: 2800, f3: 1300, g: 0.45 }, B.sec); },
    verre: function (t, B) { [3100, 4200, 5300].forEach(function (f, k) { O.tinc(A, t + k * 0.012, f * h(0.95, 1.05), { g: 0.07, clic: 0.4 }, B.sec); }); A.bruit(t, { hp: 5000, env: A.perc(0.001, 0.08), g: 0.25 }, B.sec); },
    pop: function (t, B) { A.ton(t, { f: h(420, 560), f2: 1300, gl: 0.03, env: A.perc(0.002, 0.05), g: 0.32 }, B.sec); },
    crac: function (t, B) { O.craque(A, t, 0.22, 0.45, B.sec); A.choc(t, { f: 200, f2: 90, d: 0.08, g: 0.3 }, B.sec); porcelaine(t + 0.02, 1.5, B.sec); },
    boing: function (t, B) { A.ton(t, { type: "triangle", f: 160, f2: 520, gl: 0.16, env: A.perc(0.003, 0.32), g: 0.33, vib: [18, 30] }, B.sec); },
    atchoum: function (t, B) { A.cri(t, { f: 950, forme: "aie", d: 0.08, souffle: 0.4, g: 0.1, h: h(0.9, 1.1) }, B.sec); A.bruit(t + 0.08, { bp: 2300, bq: 1, env: A.perc(0.003, 0.16), g: 0.3 }, B.sec); },
    vent: function (t, B) { O.brume(A, t, 0.5, B.salle); },
    cracheur: function (t, B) { O.embrase(A, t, 0.3, B.sec); A.bruit(t, { bp: 900, bq: 1.5, env: A.perc(0.01, 0.15), g: 0.2 }, B.sec); },
    // l'Alchimiste prend un coup : un « hmpf » sourd
    aie: function (t, B) { A.choc(t, { f: 120, f2: 60, d: 0.1, g: 0.25 }, B.sec); A.cri(t, { f: 175, forme: "aie", d: 0.16, hp: 110, lp: 1800, rauque: 0.25, souffle: 0.35, g: 0.16 }, B.sec); },
    soin: function (t, B) { [74, 78, 81, 86].forEach(function (n, k) { A.harpe(t + k * 0.06, m(n), { t60: 1.2, g: 0.08, lp: 3500 }, B.salle); }); },
    combo: function (t, B) { [[0, 62], [0.1, 66], [0.2, 69]].forEach(function (n) { O.cuivre(A, t + n[0], m(n[1]), 0.16, 0.05, B.salle); }); O.cuivre(A, t + 0.3, m(74), 0.5, 0.06, B.salle); O.timbale(A, t + 0.3, 0.6, B.salle); },
    // le cœur d'un automate détruit qui file vers Grosbec ; l'automate qui s'effondre (« Pouf »)
    mort: function (t, B) { A.bruit(t, { coul: "rose", bp: 700, bq: 0.8, env: A.perc(0.003, 0.2), g: 0.22 }, B.sec); porcelaine(t, 0.8, B.sec); porcelaine(t + 0.05, 0.6, B.sec); O.tinc(A, t + 0.08, h(900, 1100), { g: 0.06 }, B.sec); },
    etincelle: function (t, B) { A.ton(t, { type: "triangle", f: m(81), f2: m(88), gl: 0.4, env: A.perc(0.01, 0.4), g: 0.04 }, B.loin); },
    lianes: function (t, B) { A.bruit(t, { bp: 1800, bq: 0.8, env: [[0, 0], [0.1, 1], [0.6, 0]], g: 0.22, rugueux: 0.8, rugVit: 7 }, B.sec); A.joue(t, A.grincement(0.5, { i0: 0.05, i1: 0.02 }), { g: 0.6, bp: 500, bq: 3 }, B.sec); },
    colonnes: function (t, B) { [0, 0.06, 0.12].forEach(function (d) { O.embrase(A, t + d, 0.6, B.salle); }); A.bruit(t, { coul: "brun", lp: 300, env: [[0, 0], [0.1, 1], [1.2, 0]], g: 0.6 }, B.loin); },
    volcan: function (t, B) { O.sploutch(A, t, { g: 0.6, f: 220 }, B.salle); A.bruit(t, { coul: "brun", lp: 250, env: [[0, 0], [0.05, 1], [0.8, 0]], g: 0.5 }, B.loin); A.joue(t + 0.1, A.eau(0.8, 60, { fmin: 300, fmax: 1200 }), { g: 0.4 }, B.sec); },
    savon: function (t, B) { O.glisse(A, t, 0.22, B.sec); },
    // ---- l'armée de Grosbec ----
    // le cor de guerre : la salve sort
    cor: function (t, B) { cor(t, m(38), 1.1, 0.09, B.loin); cor(t, m(45), 1.1, 0.07, B.loin); cor(t + 0.5, m(50), 0.9, 0.06, B.loin); O.timbale(A, t, 0.6, B.salle); },
    // les tambours de guerre : une grosse salve
    tambours: function (t, B) { [0, 0.22, 0.44, 0.66, 0.77, 0.88, 1.1].forEach(function (d, k) { A.tambour(t + d, { f: k % 3 === 2 ? 95 : 70, d: 0.6, g: 0.45 }, B.salle); }); cor(t + 0.9, m(38), 1.3, 0.1, B.loin); cor(t + 0.9, m(45), 1.3, 0.08, B.loin); cor(t + 0.9, m(50), 1.3, 0.06, B.loin); },
    // la troupe qui sort des portes : des bottes de métal et des coques qui s'entrechoquent
    pas: function (t, B) { for (var k = 0; k < 10; k++) { var tt = t + k * 0.13 + h(0, 0.03); A.pas(tt, { g: 0.35, f: h(100, 140), bp: 1500 }, k % 2 ? B.g : B.d); if (k % 3 === 0) porcelaine(tt + 0.02, 0.8, B.loin); } },
    // Grosbec frappe du pied
    pied: function (t, B) { O.chuteGrave(A, t, 0.9, 0.7, B.salle); A.choc(t, { f: 80, f2: 38, d: 0.35, g: 0.5, sat: 3 }, B.salle); O.craque(A, t + 0.03, 0.2, 0.2, B.loin); },
    // sa voix étouffée : il grogne, il hurle un ordre, il prend un coup, il explose de colère
    grogne: function (t, B) { voix(t, { f: 125, forme: "effort", d: 0.5, g: 0.3 }, B.salle); },
    crie: function (t, B) { voix(t, { f: 165, forme: "cri", d: 0.55, rauque: 0.5, g: 0.32, lp: 1200 }, B.salle); voix(t + 0.62, { f: 180, forme: "cri", d: 0.45, rauque: 0.5, g: 0.3, lp: 1200 }, B.salle); },
    aieBoss: function (t, B) { voix(t, { f: 150, forme: "aie", d: 0.25, rauque: 0.45, g: 0.3 }, B.salle); },
    colere: function (t, B) { voix(t, { f: 120, forme: "effort", d: 0.4, rauque: 0.8, g: 0.32 }, B.salle); voix(t + 0.45, { f: 135, forme: "cri", d: 0.9, rauque: 0.95, g: 0.36, lp: 1100 }, B.salle); A.bruit(t + 0.4, { coul: "brun", lp: 200, env: [[0, 0], [0.2, 1], [1, 0]], g: 0.35 }, B.loin); },
    // ---- version 12 ----
    // « ALLEZ ! ALLEZ ! ALLEZ ! » : trois cris rauques et forts, qui montent
    allez: function (t, B) { [0, 0.34, 0.68].forEach(function (d, k) { voix(t + d, { f: 160 + k * 18, forme: "cri", d: 0.28, rauque: 0.75, g: 0.42, lp: 1400 }, B.salle); }); A.tambour(t, { f: 70, d: 0.5, g: 0.35 }, B.salle); A.tambour(t + 0.68, { f: 70, d: 0.5, g: 0.4 }, B.salle); },
    // le berserker frappe : un cri de rage métallique, une lame
    berserker: function (t, B) { A.cri(t, { f: 260, forme: "cri", d: 0.22, rauque: 0.8, grain: 0.8, hp: 150, lp: 2600, souffle: 0.3, g: 0.2 }, B.sec); O.swish(A, t + 0.05, 0.12, { f1: 1200, f2: 4200, f3: 2000, g: 0.35 }, B.sec); },
    // une armure : le coup rebondit (clang)
    armure: function (t, B) { O.tinc(A, t, h(900, 1100), { g: 0.16, clic: 0.6 }, B.sec); A.choc(t, { f: 260, f2: 160, d: 0.06, g: 0.2 }, B.sec); A.cloche(t, m(64), { d: 0.6, rapport: 3.1, indice: 1.4, g: 0.04 }, B.sec); },
    // le court-circuit : un grand claquement électrique qui grésille
    courtcircuit: function (t, B) { O.claque(A, t, 0.5, B.salle); A.joue(t, A.crepitement(0.9, 220, { forme: function (u) { return 1 - u * 0.8; } }), { g: 0.6, hp: 1200, env: [[0, 1], [0.9, 0]] }, B.salle); A.ton(t, { type: "sawtooth", f: 90, f2: 40, gl: 0.8, env: A.perc(0.005, 0.8), g: 0.18, trem: [40, 0.9], lp: 1800 }, B.salle); },
    // la cuirasse du Colosse tombe : des plaques de fer sur les pavés
    armureTombe: function (t, B) { [0, 0.12, 0.27, 0.36].forEach(function (d) { A.choc(t + d, { f: h(140, 200), f2: 70, d: 0.18, g: 0.4, sat: 3 }, B.salle); O.tinc(A, t + d, h(600, 900), { g: 0.15 }, B.salle); }); },
    // le porte-barricade plante ses pieux
    planter: function (t, B) { O.toc(A, t, 180, { g: 0.4, long: 1.4 }, B.sec); O.toc(A, t + 0.14, 200, { g: 0.3 }, B.sec); },
    // le bois qui prend feu ; la barricade qui casse
    feuBois: function (t, B) { O.embrase(A, t, 0.5, B.sec); A.joue(t + 0.1, A.crepitement(1.2, 30), { g: 0.4, hp: 1500 }, B.sec); },
    brise: function (t, B) { O.craque(A, t, 0.3, 0.6, B.salle); A.choc(t, { f: 160, f2: 70, d: 0.15, g: 0.35 }, B.salle); },
    // le Colosse arrive : trois pas qui font trembler, et le cor grave
    colosse: function (t, B) { [0, 0.55, 1.1].forEach(function (d) { O.chuteGrave(A, t + d, 0.7, 0.6, B.salle); A.choc(t + d, { f: 70, f2: 35, d: 0.3, g: 0.5, sat: 3 }, B.salle); }); cor(t + 0.2, m(33), 1.8, 0.1, B.loin); cor(t + 0.2, m(40), 1.8, 0.07, B.loin); },
    // la fin
    victoire: function (t, B) { if (G.BRUITAGES && G.BRUITAGES.victoireA) G.BRUITAGES.victoireA(A, { t: t, sec: B.P.sec, cave: B.P.cave, grotte: B.P.grotte }); },
    defaite: function (t, B) { [[0, 50], [0.5, 49], [1.0, 45], [1.6, 38]].forEach(function (n) { cor(t + n[0], m(n[1] - 12), 0.9, 0.08, B.loin); }); O.timbale(A, t + 1.6, 0.8, B.salle); }
  };
  // pour ne pas tout noyer : un même bruit pas plus souvent que…
  var LIMITE = { allez: 0.9, berserker: 0.25, armure: 0.12, courtcircuit: 0.3, planter: 0.3, feuBois: 0.4, brise: 0.15, thud: 0.07, pop: 0.06, mort: 0.08, etincelle: 0.15, boom: 0.09, gong: 0.12, bam: 0.08, zap: 0.12, splat: 0.08, verre: 0.06, pschitt: 0.12, atchoum: 0.12, crac: 0.08, bloque: 0.15, aie: 0.2, aieBoss: 0.6, grogne: 0.8 };
  SC.jouer = function (nom) {
    if (!A || MUET) return;
    var f = BR[nom]; if (!f) return;
    var now = ctx.currentTime; if (dernier[nom] && now - dernier[nom] < (LIMITE[nom] || 0.05)) return; dernier[nom] = now;
    try { f(now + 0.01, BUS); } catch (e) { if (G.console) console.warn("son", nom, e); }
  };
  SC.connu = function (nom) { return !!BR[nom]; };

  /* ================= la musique du combat ================= */
  // Ré mineur, 112 à la minute. Des parties de 4 mesures qui s'enchaînent et ne se ressemblent pas ; elle grandit avec le combat :
  //  phase 0 (l'attente) : un cœur de tambours, le bourdon ;
  //  phase 1 (Grosbec en pleine forme) : tambours de guerre, violoncelles qui trottent, pizzicati malicieux, l'air de cor ;
  //  phase 2 (trois quarts) : les violoncelles galopent, les cuivres frappent, des cordes qui tremblent ;
  //  phase 3 (la moitié) : plus vite dans la tête — caisse claire, l'air passe aux cordes et monte d'une quarte ;
  //  phase 4 (le dernier quart) : tout le monde, avec le chœur.
  var BPM = 112, b = 60 / BPM;
  var PROG = [[38, [50, 53, 57]], [34, [46, 50, 53]], [36, [48, 52, 55]], [33, [45, 49, 52]]];      // ré m, si bémol, do, la
  var PROG3 = [[38, [50, 53, 57]], [43, [43, 46, 50]], [34, [46, 50, 53]], [33, [45, 49, 52]]];    // ré m, sol m, si bémol, la
  var AIR = [[0, 62, 1.5], [1.5, 65, 0.5], [2, 69, 1], [3, 67, 1], [4, 65, 1.5], [5.5, 64, 0.5], [6, 62, 2], [8, 60, 1.5], [9.5, 62, 0.5], [10, 64, 1], [11, 65, 1], [12, 64, 1.5], [13.5, 62, 0.5], [14, 61, 2]];
  var AIR2 = [[0, 69, 1.5], [1.5, 67, 0.5], [2, 65, 1], [3, 64, 1], [4, 65, 1.5], [5.5, 67, 0.5], [6, 69, 2], [8, 70, 1.5], [9.5, 69, 0.5], [10, 67, 1], [11, 65, 1], [12, 64, 2], [14, 62, 2]];
  var R = {
    coeur: [[0, 1], [2, 0.6]],
    taiko: [[0, 1], [0.75, 0.45], [1.5, 0.7], [2, 0.9], [3, 0.6], [3.5, 0.55]],
    galop: [[0, 1], [0.5, 0.5], [1, 0.7], [1.5, 0.6], [2, 0.95], [2.75, 0.5], [3, 0.7], [3.5, 0.7], [3.75, 0.5]],
    roule: [[0, 1], [0.5, 0.6], [1, 0.8], [1.5, 0.6], [2, 1], [2.25, 0.5], [2.5, 0.6], [2.75, 0.7], [3, 0.8], [3.25, 0.7], [3.5, 0.85], [3.75, 0.95]]
  };
  function prog() { return PHASE >= 3 ? PROG3 : PROG; }
  function corM(t, f, d, g, dest) { cor(t, f, d, g, dest); }
  function trem(t, f, d, g, dest) { [-5, 5].forEach(function (det) { A.ton(t, { type: "sawtooth", f: f, det: det, env: [[0, 0], [d * 0.3, 1], [d * 0.85, 0.85], [d, 0]], g: g, trem: [11, 0.8], filtres: [{ type: "lowpass", f: 1300, q: 0.6 }] }, dest); }); }
  SC.musique = function (on) {
    if (!A || !T) return;
    if (!on) { if (MUS) { var I0 = MUS.I; I0.arreter(ctx.currentTime + 0.05, 2); clearInterval(MUS.minuteur); MUS = null; } return; }
    if (MUS) return;
    var P = A.prise(ctx.currentTime + 0.15, 0.5, "mus"), I = T.Instance(A, P);
    var proche = A.bus(P, { rev: 0.2 }), tamb = A.bus(P, { rev: 0.4, grotte: 0.15, g: 0.95 }), loin = A.bus(P, { rev: 0.6, grotte: 0.35, g: 0.75 });
    T.bourdon(I, [m(38)], { dest: proche, lp: 240, g: 0.035, lfo: 0.05, lfoAmp: 60, a: 2 });
    // les tambours de guerre (toutes les mesures) ; un roulement avant chaque nouvelle partie de 4 mesures
    I.chaque(0.2, 4 * b, function (t, n) {
      var fin = n % 4 === 3, p = PHASE, r = p === 0 ? R.coeur : p === 1 ? (n % 8 < 6 ? R.taiko : R.coeur) : p === 2 ? R.taiko : R.galop;
      if (fin && p >= 1) r = R.roule;
      r.forEach(function (x) { A.tambour(t + x[0] * b, { f: x[1] > 0.85 ? 70 : 88, d: 0.6, g: (0.26 + 0.08 * TENSION) * x[1] }, tamb); });
      if (n % 4 === 0 && p >= 3) { A.tambour(t, { f: 52, d: 1.4, g: 0.4 }, tamb); A.bruit(t, { coul: "brun", lp: 150, env: A.perc(0.01, 1), g: 0.25 }, tamb); }
    });
    // la caisse claire, à contretemps (phases 3 et 4)
    I.chaque(0.2 + b / 2, b, function (t, n) { if (PHASE < 3 || n % 16 >= 14) return; A.bruit(t, { coul: "rose", bp: 1500, bq: 0.9, env: A.perc(0.002, 0.08), g: 0.07 }, tamb); });
    // les violoncelles : ils trottent (phase 1, noires), puis galopent (croches)
    I.chaque(0.2, b / 2, function (t, n) {
      if (PHASE === 0) return;
      var mesure = Math.floor(n / 8), acc = prog()[mesure % 4], k = n % 8;
      if (PHASE === 1 && k % 2) return;
      var notes = [0, 0, 12, 0, 3, 0, -2, 0], note = acc[0] + notes[k], fort = k === 0;
      A.ton(t, { type: "sawtooth", f: m(note), env: A.perc(0.006, PHASE === 1 ? 0.3 : 0.2), g: fort ? 0.08 : 0.055, filtres: [{ type: "lowpass", f: 320, pts: [[0.02, 1400], [0.18, 320]], q: 2.5 }] }, proche);
    });
    // les pizzicati malicieux (phase 1 seulement : c'est encore un jeu)
    I.chaque(0.2 + b * 0.5, b, function (t, n) {
      if (PHASE !== 1 || n % 16 >= 12) return;
      var acc = prog()[Math.floor(n / 4) % 4][1], nn = acc[(n * 2 + Math.floor(n / 8)) % 3] + (n % 8 === 7 ? 12 : 0);
      A.harpe(t, m(nn), { t60: 0.5, eclat: 0.35, g: 0.12, lp: 2200 }, proche);
    });
    // les cuivres qui frappent (phase 2 et plus)
    I.chaque(0.2, 4 * b, function (t, n) {
      if (PHASE < 2 || n % 8 === 4) return;
      var a = prog()[n % 4][1];
      [[0, 0.7, 0.032], [2.5, 0.6, 0.024]].forEach(function (x) { a.forEach(function (nn) { A.ton(t + x[0] * b, { type: "sawtooth", f: m(nn - 12), env: [[0, 0], [0.03, 1], [x[1] * b * 0.7, 0.6], [x[1] * b, 0]], g: x[2] * (1 + 0.3 * TENSION), sat: 1.2, filtres: [{ type: "lowpass", f: 500, pts: [[0.04, 1800], [x[1] * b, 500]], q: 1.2 }] }, proche); }); });
      if (n % 4 === 3) A.bruit(t + 3 * b, { coul: "rose", filtres: [{ type: "bandpass", f: 300, pts: [[b, 3000]], q: 1 }], env: [[0, 0], [b * 0.95, 1], [b, 0]], g: 0.1 }, loin);
    });
    // les cordes qui tremblent (phase 2 et plus)
    I.chaque(0.2, 4 * b, function (t, n) {
      if (PHASE < 2) return;
      var a = prog()[n % 4][1];
      trem(t, m(a[1]), 4 * b, 0.012, loin); trem(t, m(a[2]), 4 * b, 0.01, loin);
    });
    // l'air de cor : une partie sur deux ; aux cordes, une quarte plus haut, en phase 3 ; tout le monde en phase 4
    I.chaque(0.2, 16 * b, function (t, n) {
      if (PHASE === 0 || n % 2 === 0) return;
      var air = Math.floor(n / 2) % 2 ? AIR2 : AIR, haut = PHASE >= 3 ? 5 : 0;
      air.forEach(function (p) {
        corM(t + p[0] * b, m(p[1] - 12 + haut), p[2] * b * 0.95, 0.032, proche);
        if (PHASE >= 3) A.archet(t + p[0] * b, m(p[1] + haut), p[2] * b * 0.95, { a: 0.08, r: 0.15, g: 0.022 }, loin);
      });
    });
    // le chœur (phase 4)
    I.chaque(0.2, 8 * b, function (t, n) {
      if (PHASE < 4) return;
      var a = prog()[(n * 2) % 4][1];
      A.choeur(t, [m(a[0]), m(a[1]), m(a[2])], 8 * b, { voyelle: "a", a: 1.5, r: 1.5, g: 0.022 }, loin);
    });
    I.pas(ctx.currentTime + 1.2);
    MUS = { I: I, minuteur: setInterval(function () { try { I.pas(ctx.currentTime + 1.2); } catch (e) {} }, 300) };
    SC._instance = I;
  };

  G.SonsCombat = SC;
})(window);
