/* Le cerveau du robot qui joue la phase 2, version 2 (node : tests/robot.js ; page : tests/partie.py).
   Il voit les attaques avec un temps de retard (« bon » : 0,35 s ; « moyen » : 0,6 s, et il se trompe parfois). */
(function (G) {
'use strict';
var P2 = G.P2, REG = P2.REG, d2 = P2.d2, distSeg = P2.distSeg;

// combien de temps reste-t-il avant qu'un coup tombe ici ? (Infinity : rien de prévu)
function avantCoup(S, x, y, reac) {
  var t = Infinity, A = REG.armure;
  if (S.crepite && S.crepite.t > reac) {
    var c = S.crepite, cote = c.cote === 'g' ? x < REG.salle.L / 2 : x >= REG.salle.L / 2;
    if (cote) t = Math.min(t, REG.crepite.annonce - c.t);
  }
  S.ombres.forEach(function (o) { if (o.t > reac && d2(x, y, o.x, o.y) < REG.colonnes.r + 0.45) t = Math.min(t, REG.colonnes.ombre - o.t); });
  if (S.vague && S.vague.t > reac && !P2.abrite(S, x, y)) {
    var V = REG.vague, v = S.vague, k = Math.max(0, (d2(x, y, A.x, A.y) - A.r) / (v.rMax - A.r)), arr = V.annonce + V.traverse * k;
    if (v.t < arr + V.flammes) t = Math.min(t, Math.max(0, arr - v.t));
  }
  S.doigts.forEach(function (dg) { if (!dg.boum && dg.t > reac && P2.surLigne(S, dg, x, y)) t = Math.min(t, REG.doigts.annonce - dg.t); });
  if (S.danse) {
    var dz = S.danse, T = REG.danse.dure / dz.motif.length, a = P2.anneau(x, y);
    if (!dz.explose && a !== dz.motif[dz.k]) t = Math.min(t, T * REG.danse.alerte - dz.st);
    if (dz.k + 1 < dz.motif.length && a !== dz.motif[dz.k + 1]) t = Math.min(t, T - dz.st + T * REG.danse.alerte);
  }
  if (S.coque) t = Math.min(t, REG.coque.dure - S.coque.t + 0.3);
  return t;
}
function voitArmure(S, x, y) {
  var A = REG.armure;
  for (var i = 0; i < S.colonnes.length; i++) if (distSeg(S.colonnes[i].x, S.colonnes[i].y, x, y, A.x, A.y) < REG.colonnes.r + 0.05) return false;
  return true;
}

function robot(S, mem, dtR) {
  var h = S.h, A = REG.armure, ent = {mx: 0, my: 0};
  var reac = mem.niveau === 'moyen' ? 0.6 : 0.35;
  if (S.phase === 'fini' || S.phase === 'explose' || S.phase === 'transfo' || h.mort > 0) return ent;

  // le code
  if (S.code.ouvert) {
    mem.tape = (mem.tape || 0) - dtR;
    if (mem.tape <= 0) { var i = S.code.saisie.length, s = S.cri ? S.cri[i] : P2.SYMS[0];
      if (mem.niveau === 'moyen' && Math.random() < 0.04) s = P2.SYMS[(P2.SYMS.indexOf(s) + 1) % 12];
      P2.taper(S, s); mem.tape = mem.niveau === 'moyen' ? 1.0 : 0.7; }
    return ent;
  }

  // un sort en cours : on reste tant que rien ne tombe ici avant la fin
  var acIci = avantCoup(S, h.x, h.y, reac);
  var orbeAFaire = S.orbe && S.orbe.t > REG.orbe.chute + reac && (S.orbe.porte || REG.orbe.chute + REG.orbe.meche - S.orbe.t > 2.5);
  if (h.lance && acIci > h.lance.dur - h.lance.t + 0.15 && !orbeAFaire) return ent;
  // où aller : on note des places
  var best = null, bs = -1e9, cols = 28, rows = 20, rayonVeut = false;
  var rayonLx = S.rayon ? REG.lanternes[S.rayon.couleur] : null;
  rayonVeut = !!(S.rayon && S.rayon.t > reac && h.pv > 45 && !S.danse);
  var orbeBut = null;
  if (orbeAFaire) orbeBut = S.orbe.porte ? REG.lanternes[S.orbe.couleur] : [S.orbe.x, S.orbe.y];
  var cands = [[h.x, h.y]];
  for (var ci = 0; ci <= cols; ci++) for (var cj = 0; cj <= rows; cj++) cands.push([0.4 + 13.2 * ci / cols, 0.4 + 9.2 * cj / rows]);
  cands.forEach(function (c) {
    var x = c[0], y = c[1];
    if (!P2.libreEn(S, x, y, REG.heros.r)) return;
    var dist = d2(x, y, h.x, h.y), temps = dist / REG.heros.vit, ac = avantCoup(S, x, y, reac);
    var sc = -dist * 0.4 + (dist < 0.05 ? (orbeBut ? 0 : 4) : 0);                 // rester où l'on est, si c'est bien
    if (ac < Infinity) sc -= 300;                                    // un coup tombera ici
    if (ac < Infinity && ac < temps) sc -= 200;
    if (S.vague && S.vague.t > reac && P2.abrite(S, x, y)) sc += 40;
    if (!voitArmure(S, x, y) && S.phase === 'combat') sc -= 25;      // derrière une colonne, on ne tape pas
    sc -= Math.abs(x - 7) * 0.5 + Math.abs(y - 6.5) * 0.4;          // (R) la bonne habitude : le milieu de la salle
    if (orbeBut) sc -= d2(x, y, orbeBut[0], orbeBut[1]) * 15;
    if (rayonVeut) sc -= distSeg(x, y, rayonLx[0], rayonLx[1], A.x, A.y) * 6;
    if (S.danse) { var dz = S.danse, k = dz.explose ? dz.k + 1 : dz.k; if (k < dz.motif.length && P2.anneau(x, y) === dz.motif[k]) sc += 60; }
    if (sc > bs) { bs = sc; best = c; }
  });
  var dx = best[0] - h.x, dy = best[1] - h.y, dd = Math.hypot(dx, dy);
  if (dd > 0.12) {
    ent.mx = dx / dd; ent.my = dy / dd;
    if (dd > 1.6 && acIci < 1.2 && h.sautT <= 0) P2.sauter(S, dx, dy);
    return ent;
  }
  // sur place : quel sort ?
  if (h.lance) return ent;
  var cible = S.reps.length ? S.reps.reduce(function (a, b) { return d2(a.x, a.y, A.x, A.y) < d2(b.x, b.y, A.x, A.y) ? a : b; }) : null;
  var lib = acIci;
  if (h.pv <= 60 && lib > REG.soin.lance + 0.2) { P2.lancer(S, 'soin'); return ent; }
  if (S.coque && voitArmure(S, h.x, h.y)) {
    var reste = REG.coque.dure - S.coque.t;
    if (S.coque.pv > 20 && lib > REG.feu.lance + 0.2 && reste > REG.feu.lance + 0.4) { S.cible = null; P2.lancer(S, 'feu'); return ent; }
    if (lib > REG.glace.lance + 0.2) { S.cible = null; P2.lancer(S, 'glace'); return ent; }
  }
  if (S.main && S.main.cx !== null) {
    var el = S.main.type === 'givre' ? 'feu' : 'glace';
    if (mem.niveau === 'moyen' && !S.main.essai) { S.main.essai = 1; if (Math.random() < 0.1) el = el === 'feu' ? 'glace' : 'feu'; }
    if (lib > REG[el].lance + 0.3 && voitArmure(S, h.x, h.y)) { S.cible = null; P2.lancer(S, el); return ent; }
  }
  if (cible && S.phase !== 'transfo') { if (S.cible !== cible) P2.viser(S, cible.x, cible.y); if (lib > REG.glace.lance + 0.2) P2.lancer(S, 'glace'); return ent; }
  if (S.rayon && S.rayon.coupe) { if (h.pv < 75 && lib > 2.2) { P2.lancer(S, 'soin'); return ent; } if (lib > 1.7) P2.lancer(S, 'glace'); return ent; }
  if (h.pv < 75 && S.phase === 'bulle' && lib > 2.2) { P2.lancer(S, 'soin'); return ent; }
  if (S.phase === 'combat' && voitArmure(S, h.x, h.y)) {
    if (lib > REG.feu.lance + 0.3) P2.lancer(S, 'feu');
    else if (lib > REG.glace.lance + 0.2) P2.lancer(S, 'glace');
  }
  if (S.phase === 'bulle' && S.cri && lib > 3.5) { P2.ouvrirCode(S); mem.tape = 0.8; }
  return ent;
}
G.RobotP2 = robot;
})(typeof window !== 'undefined' ? window : globalThis);
