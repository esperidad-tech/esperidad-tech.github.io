/* Le cerveau du robot qui joue la phase 2 : il tourne dans node (tests/robot.js) et dans la page (tests/partie.py).
   Il réagit avec un temps de retard (niveau « bon » : 0,35 s ; « moyen » : 0,6 s et quelques erreurs). */
(function (G) {
'use strict';
var P2 = G.P2, REG = P2.REG;
function robot(S, mem, dtR) {
  const h = S.h, a = S.att, r = REG.heros.rayon, L = S.L, FACON = S.reg.facon, NIVEAU = mem.niveau || 'bon';
  const reac = NIVEAU === 'bon' ? 0.35 : 0.6;
  const vu = a && a.t * 1 > reac;                    // il n'a pas encore vu l'attaque
  const ent = {tirer: false};
  if (S.phase === 'fini' || S.phase === 'explose') return ent;
  // le code
  if (S.phase === 'bulle' && S.cri && !S.code.ouvert && S.code.bloque <= 0 && h.mort <= 0 && h.gel <= 0) {
    const D = S.danse, sur = P2.surDanse(S);
    if (D && D.attente <= 0 && sur >= 0) {
      const prochain = D.motif[(D.pos + 1) % D.motif.length];
      if (P2.bandeDe(S, h.x) === sur && prochain === sur && !D.explose) { P2.ouvrirCode(S); mem.tape = 0.8; }
    }
  }
  if (S.code.ouvert) {
    mem.tape -= dtR;
    if (mem.tape <= 0) {
      const i = S.code.saisie.length;
      let s = S.cri ? S.cri[i] : P2.SYMS[0];
      if (NIVEAU === 'moyen' && Math.random() < 0.04) s = P2.SYMS[(P2.SYMS.indexOf(s) + 1) % 12];
      P2.taper(S, s); mem.tape = NIVEAU === 'bon' ? 0.7 : 1.0;
    }
    return ent;
  }
  // couper, remède
  if (a && a.type === 'grosCoup' && a.t > reac + 0.3) P2.couper(S);
  if (a && (a.type === 'chaud' || a.type === 'froid') && a.t > reac + 0.4 && !a.fait) {
    let el = a.type === 'chaud' ? 'glace' : 'feu';
    if (NIVEAU === 'moyen' && !a.essai) { a.essai = 1; if (Math.random() < 0.15) el = el === 'feu' ? 'glace' : 'feu'; }
    P2.remede(S, el);
  }
  // où aller : on note des places sur le sol
  let best = null, bs = -1e9;
  const cols = 14, rows = 9;
  for (let i = 0; i <= cols; i++) for (let j = 0; j <= rows; j++) {
    const x = L.solG + r + (L.solD - L.solG - 2 * r) * i / cols, y = L.solHaut + r + (L.solBas - L.solHaut - 2 * r) * j / rows;
    let sc = -Math.hypot(x - h.x, y - h.y) * 0.05;
    if (S.phase === 'combat') {
      if (vu && a.type === 'poing' && a.t < a.fin && P2.dansPoing(S, a, x)) sc -= 100;
      if (vu && a.type === 'souffle' && a.t < a.fin && y < P2.basSouffle(S) + r * 1.4) sc -= 100;
      if (a && a.type === 'charge' && h.charge && a.t > a.prep + reac && (h.charge === 'or') !== P2.coteOr(S, a, x)) sc -= 100;
      if (S.reps.length) { let dm = 1e9; S.reps.forEach(p => { dm = Math.min(dm, Math.hypot(p.x - x, p.y - y)); }); sc -= dm * 0.25; }
      if (FACON === 'faible' && S.pf.ouvert) sc -= Math.abs(x - S.pf.x) * 0.12;
      if (FACON === 'immobile') sc -= Math.hypot(x - h.x, y - h.y) * 0.15;
      if (S.bouc.actif > 0 && FACON === 'faible' && Math.abs(x - S.pf.x) < REG.faible.largeur + 8) sc -= 30;
      sc -= Math.abs(y - (L.solBas - 60)) * 0.02;   // il aime bien le fond de la salle
    } else if (S.phase === 'bulle' && S.danse && S.danse.attente <= 0) {
      const D = S.danse, n = REG.bandes[S.forme].n, w = (L.solD - L.solG) / n;
      const vise = D.explose || D.t > D.T * REG.alerte - 0.05 ? D.motif[(D.pos + 1) % D.motif.length] : D.motif[D.pos % D.motif.length];
      const bx = L.solG + w * (vise + 0.5);
      sc -= Math.abs(x - bx) * 0.6;
      if (!D.explose && P2.bandeDe(S, x) !== D.motif[D.pos % D.motif.length]) sc -= 50;
    }
    if (sc > bs) { bs = sc; best = {x, y}; }
  }
  // le bouclier : en « immobile », on bouge un peu pour ne pas taper ; ailleurs on s'arrête de taper
  if (S.bouc.actif > 0 && FACON === 'immobile') { mem.zig = (mem.zig || 1) * -1; best = {x: h.x + mem.zig * 6, y: h.y}; }
  if (best) { S.cible.x = best.x; S.cible.y = best.y; }
  // boire
  const calme = !a || a.type === 'reparateurs' || (a.type === 'grosCoup' && S.couperT <= 0);
  if (S.phase === 'combat' && h.pv < 55 && calme && h.potion <= 0 && !S.reps.length) { P2.potion(S); S.cible.x = h.x; S.cible.y = h.y; }
  if (h.potion > 0) { S.cible.x = h.x; S.cible.y = h.y; }
  if (S.phase === 'bulle' && h.pv < 75 && S.danse && S.danse.attente > 0.8) P2.potion(S);
  ent.tirer = FACON === 'bouton' && !(S.bouc.actif > 0 || S.bouc.monte > 0);
  return ent;
}

G.RobotP2 = robot;
})(typeof window !== 'undefined' ? window : globalThis);
