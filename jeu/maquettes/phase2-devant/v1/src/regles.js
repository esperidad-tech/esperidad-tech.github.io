/* ==========================================================
   Phase 2 de l'enquête 10 — les trois de devant contre l'armure de Grosbec
   MAQUETTE RAPIDE EN FORMES SIMPLES (chantier 3 du § 18.11 de la Bible)
   Les règles seules, sans dessin : ce fichier tourne aussi dans node (tests/).
   (R) = décidé par Romain (§ 18.4) ; (C) = point de départ de Claude, à régler.
   ========================================================== */
(function (G) {
'use strict';

var REG = {
  vie: 3000,                       // (C) la vie de l'armure : trois tiers de 1000 (R : trois formes)
  heros: {pv: 100, vitesse: 640, rayon: 20},
  tir: {cadence: 0.45, degat: 13, vitesse: 900},          // (C) un coup toutes les 0,45 s
  immobileApres: 0.3,              // façon « immobile » : il tape tout seul après 0,3 s sans bouger
  faible: {ouvert: 5, ferme: 1.8, vitesse: 48, largeur: 38, bonus: 1.5}, // façon « point faible »
  potion: {duree: 2.5, bouge: 7},  // (R) rester immobile deux ou trois secondes ; un coup le coupe
  couper: {recharge: 12},          // (R) le bouton pour couper le gros coup « ne revient pas vite » ; (C) 12 s, et 17 s au moins entre deux gros coups
  ralentiForce: 0.3,               // (R) « pas mal ralenti » : le combat à 30 %
  mortBloque: 10,                  // (R) mort sous la bulle : bouton du code grisé ; (C) 10 s
  mortDuree: 2,                    // (C) le temps de se relever
  degats: {                        // en points de vie du héros (il en a 100)
    poing: 45, souffle: 35, grosCoup: 85, bande: 70, chaud: 50, froid: 20,
    mauvaisRemede: 50, charge: 40, renvoi: 7, mauvaisCode: 20
  },
  remedeBon: 200,                  // (C) le bon remède : l'armure sonnée, gros dégâts
  sonnee: 3,
  reparateur: {vitesse: 70, soin: 30, rayon: 11},         // soin : points de vie de l'armure par seconde
  bonusCharge: {duree: 6, fois: 2},                        // (C) la bonne couleur : coups deux fois plus forts
  // les attaques : durées en secondes à la vitesse « normale »
  att: {
    poing: {prep: 1.7, coup: 0.55},
    souffle: {prep: 1.8, balaie: 0.7, brule: 0.6, part: 0.68},   // part : la part du sol brûlée (on recule au fond)
    grosCoup: {prep: 3.5},
    reparateurs: {prep: 0.8},
    chaud: {monte: 1.2, fenetre: 4.5},
    froid: {monte: 1.2, fenetre: 4.5, gel: 2.5},
    charge: {eclair: 0.8, attente: 3.2}
  },
  // le programme de chaque forme : on tourne en boucle (R : les attaques de § 18.4 ; C : l'ordre)
  formes: {
    1: {prog: ['poing', 'souffle', 'poing', 'reparateurs', 'grosCoup', 'souffle', 'poing', 'reparateurs', 'poing', 'grosCoup'], pause: 1.4, vite: 1},
    2: {prog: ['charge', 'poing', 'remede', 'charge', 'poing', 'remede'], pause: 1.3, vite: 1},
    3: {prog: ['poing', 'souffle', 'poing', 'grosCoup', 'poing', 'souffle'], pause: 0.9, vite: 1 / 0.72}
  },
  bouclier: {premier: 5, monte: 0.8, actif: 4.5, entre: 9},  // forme 3 : le bouclier qui renvoie
  // la danse des bandes sous la bulle (R : de plus en plus rapide, plus dure à chaque forme)
  bandes: {
    1: {n: 4, t0: 2.4, tmin: 1.0, pas: 0.06},
    2: {n: 5, t0: 2.1, tmin: 0.9, pas: 0.06},
    3: {n: 6, t0: 1.9, tmin: 0.8, pas: 0.06}
  },
  alerte: 0.6,                     // la part du pas où les bandes s'allument avant d'exploser
  danseAttente: 1.8,               // après le symbole, avant la première bande
  transfo: 2.6,                    // la pièce qui tombe, l'armure qui change
  explose: 3.2                     // la fin
};

var SYMS = ['🌙', '⭐', '☀️', '🔑', '🍄', '🐟', '🌳', '🔔', '🎩', '❤️', '🔥', '🐱'];

// les réglages du menu (C) : ce que Romain compare en jouant
var REGLAGES_DEFAUT = {
  facon: 'immobile',   // 'immobile' | 'bouton' | 'faible'  (§ 18.10, point 5 : pas tranché)
  pisteur: 25,         // secondes après le symbole ; 0 = seulement au bouton
  vitesse: 1,          // 0.8 | 1 | 1.25
  symbole: 0.25,       // la part de la vie de l'armure à enlever à chaque forme : 0.15 | 0.25 | 0.333
  ralenti: 5,          // secondes : 3 | 5 | 8
  aides: true,         // les boutons qui clignotent quand c'est le moment
  role: 'barde'        // 'barde' | 'sage' | 'alchimiste'
};

// un hasard qu'on peut rejouer (les tests)
function hasard(graine) {
  var s = (graine >>> 0) || 1;
  return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 1000000) / 1000000; };
}

function hautTier(forme) { return REG.vie * (4 - forme) / 3; }   // 3000, 2000, 1000
function seuil(S) { return Math.max(hautTier(S.forme) - S.reg.symbole * REG.vie, hautTier(S.forme + 1) + 1); }

function nouvelle(L, reglages, graine) {
  var reg = {};
  for (var k in REGLAGES_DEFAUT) reg[k] = (reglages && reglages[k] !== undefined) ? reglages[k] : REGLAGES_DEFAUT[k];
  var S = {
    L: L, reg: reg, rnd: hasard(graine || 12345),
    t: 0, reel: 0, forme: 1, phase: 'combat',
    vie: REG.vie,
    h: {x: L.W / 2, y: L.solBas - 70, pv: REG.heros.pv, mort: 0, invul: 0, gel: 0, calme: 0,
        potion: 0, px: 0, py: 0, charge: null, bonus: 0, tirT: 0, coupe: 0},
    cible: {x: L.W / 2, y: L.solBas - 70},
    att: null, idx: 0, attente: 2, dernierCote: [], sonnee: 0,
    reps: [], tirs: [], renvois: [],
    bouc: {avant: REG.bouclier.premier, monte: 0, actif: 0},
    pf: {x: L.W / 2, dir: 1, ouvert: true, t: REG.faible.ouvert},
    couperT: 0,
    symbole: null, cri: null, pisteurT: 0,
    danse: null,
    code: {ouvert: false, saisie: [], ralenti: 0, bloque: 0},
    transfoT: 0, piece: null,
    lent: 1,
    stats: {debutForme: 0, formes: [], morts: 0, potions: 0, coups: {}, coupes: 0, remedes: 0, mauvaisRemedes: 0, mauvaisCodes: 0, reparesPV: 0},
    evts: []
  };
  return S;
}

function evt(S, type, o) { o = o || {}; o.type = type; o.t = S.reel; S.evts.push(o); if (S.evts.length > 60) S.evts.shift(); }

/* ---------- le héros prend un coup ---------- */
function coup(S, n, source) {
  var h = S.h;
  if (h.mort > 0 || h.invul > 0 || S.phase === 'explose' || S.phase === 'fini') return false;
  if (h.potion > 0) { h.potion = 0; evt(S, 'potionCoupee'); }
  h.pv -= n; h.coupe = 0.35;
  S.stats.coups[source] = (S.stats.coups[source] || 0) + n;
  evt(S, 'aie', {n: n, source: source, x: h.x, y: h.y});
  if (h.pv <= 0) mourir(S);
  return true;
}

function mourir(S) {
  var h = S.h;
  h.pv = 0; h.mort = REG.mortDuree; h.potion = 0; h.charge = null; h.gel = 0;
  S.stats.morts++;
  evt(S, 'mort', {x: h.x, y: h.y, phase: S.phase});
  if (S.code.ouvert) fermerCode(S);
  if (S.phase === 'combat') { S.att = null; S.tirs = []; S.renvois = []; }
}

function relever(S) {
  var h = S.h;
  h.pv = REG.heros.pv; h.invul = 1.2;
  if (S.phase === 'combat') {
    // (C, pas validé) mort avant son symbole : on recommence la forme en cours, l'armure remise à neuf pour lui
    S.vie = hautTier(S.forme); S.att = null; S.idx = 0; S.attente = 2; S.reps = []; S.tirs = []; S.renvois = [];
    S.bouc = {avant: REG.bouclier.premier, monte: 0, actif: 0}; S.sonnee = 0;
    evt(S, 'reprise');
  } else if (S.phase === 'bulle') {
    // (R) mort pendant la bulle : il refait la danse ; le bouton du code est grisé, avec un petit chiffre
    S.code.bloque = REG.mortBloque;
  }
  evt(S, 'releve', {x: h.x, y: h.y});
}

/* ---------- les gestes du joueur ---------- */
function libre(S) { var h = S.h; return h.mort <= 0 && h.gel <= 0 && !S.code.ouvert; }

function potion(S) {
  var h = S.h;
  if (!libre(S) || h.potion > 0 || h.pv >= REG.heros.pv || S.phase === 'explose' || S.phase === 'fini') return false;
  h.potion = REG.potion.duree; h.px = h.x; h.py = h.y;
  S.cible.x = h.x; S.cible.y = h.y;   // il s'arrête pour boire
  evt(S, 'potion');
  return true;
}

function couper(S) {
  var a = S.att;
  if (!libre(S) || S.couperT > 0 || !a || a.type !== 'grosCoup' || a.t >= a.prep) return false;
  S.att = null; S.attente = 1.2; S.sonnee = 1.2; S.couperT = REG.couper.recharge;
  S.stats.coupes++;
  evt(S, 'coupe');
  return true;
}

function remede(S, el) {
  var a = S.att;
  if (!libre(S) || S.phase !== 'combat' || !a || (a.type !== 'chaud' && a.type !== 'froid') || a.fait) return false;
  a.fait = true;
  var bon = (a.type === 'chaud' && el === 'glace') || (a.type === 'froid' && el === 'feu');
  if (bon) {
    S.stats.remedes++;
    S.att = null; S.sonnee = REG.sonnee; S.attente = REG.sonnee;
    evt(S, 'remedeBon', {el: el});
    blesser(S, REG.remedeBon, {x: S.L.W / 2, y: S.L.bossY});
  } else {
    S.stats.mauvaisRemedes++;
    S.att = null; S.attente = 1.2;
    evt(S, 'remedeMauvais', {el: el});
    coup(S, REG.degats.mauvaisRemede, 'remede');
  }
  return true;
}

function ouvrirCode(S) {
  if (S.phase !== 'bulle' || S.h.mort > 0 || S.code.bloque > 0 || S.code.ouvert || S.h.gel > 0) return false;
  S.code.ouvert = true; S.code.saisie = []; S.code.ralenti = S.reg.ralenti;
  S.h.potion = 0;
  S.cible.x = S.h.x; S.cible.y = S.h.y;     // (R) pendant qu'on tape, on ne dirige plus son héros
  evt(S, 'codeOuvert');
  return true;
}

function fermerCode(S) {
  if (!S.code.ouvert) return false;
  S.code.ouvert = false; S.code.saisie = []; S.code.ralenti = 0;
  return true;
}

function taper(S, sym) {
  var c = S.code;
  if (!c.ouvert || c.saisie.length >= 3) return false;
  c.saisie.push(sym);
  if (c.saisie.length === 3) {
    var bon = S.cri && c.saisie.join('') === S.cri.join('');
    if (bon) reussir(S); else rater(S);
  }
  return true;
}

function effacer(S) { if (!S.code.ouvert || !S.code.saisie.length) return false; S.code.saisie.pop(); return true; }

function rater(S) {
  S.stats.mauvaisCodes++;
  S.code.ouvert = false; S.code.ralenti = 0; S.code.saisie = [];
  evt(S, 'codeFaux');
  coup(S, REG.degats.mauvaisCode, 'code');   // (C, pas validé) un mauvais code : vitesse normale tout de suite, avec un coup en plus
}

function reussir(S) {
  S.code.ouvert = false; S.code.saisie = [];
  S.code.ralenti = 1.0;          // (C) le ralenti continue un instant pendant que la pièce tombe
  S.stats.formes.push(S.t - S.stats.debutForme);
  S.danse = null;
  S.piece = {forme: S.forme, t: 0};
  S.vie = hautTier(S.forme + 1);
  evt(S, 'codeBon', {forme: S.forme});
  if (S.forme >= 3) { S.vie = 0; S.phase = 'explose'; S.transfoT = REG.explose; evt(S, 'explose'); }
  else { S.phase = 'transfo'; S.transfoT = REG.transfo; }
}

function pisteurCrie(S) {
  if (S.phase !== 'bulle' || S.cri) return false;
  var c = [];
  do { c = [0, 0, 0].map(function () { return SYMS[Math.floor(S.rnd() * SYMS.length)]; }); } while (c[0] === c[1] && c[1] === c[2]);
  S.cri = c;
  evt(S, 'cri');
  return true;
}

/* ---------- les dégâts sur l'armure ---------- */
function blesser(S, n, ou) {
  if (S.phase !== 'combat') return;
  var s = seuil(S);
  S.vie = Math.max(s, S.vie - n);
  evt(S, 'touche', {n: n, x: ou.x, y: ou.y});
  if (S.vie <= s + 0.01) symbole(S);
}

function symbole(S) {
  // (R) un certain pourcentage de vie en moins : un symbole s'affiche, un seul ; l'armure se met sous la bulle
  S.phase = 'bulle';
  S.symbole = SYMS[Math.floor(S.rnd() * SYMS.length)];
  S.cri = null;
  S.pisteurT = S.reg.pisteur > 0 ? S.reg.pisteur : Infinity;
  S.att = null; S.reps = []; S.tirs = []; S.renvois = []; S.sonnee = 0;
  S.bouc.actif = 0; S.bouc.monte = 0;
  S.h.charge = null;
  S.danse = {attente: REG.danseAttente, k: 0, t: 0, pos: -1, explose: false, motif: motif(REG.bandes[S.forme].n)};
  evt(S, 'symbole', {sym: S.symbole});
}

function motif(n) { // (R) la danse de Heigan ; (C) on reste deux pas de suite au bord : le moment calme pour taper le code
  var m = [0, 0];
  for (var i = 1; i < n - 1; i++) m.push(i);
  m.push(n - 1, n - 1);
  for (i = n - 2; i >= 1; i--) m.push(i);
  return m;
}

function bandeDe(S, x) {
  var L = S.L, n = REG.bandes[S.forme].n, w = (L.solD - L.solG) / n;
  return Math.max(0, Math.min(n - 1, Math.floor((x - L.solG) / w)));
}

function pasDanse(S, k) { var b = REG.bandes[S.forme]; return Math.max(b.tmin, b.t0 - k * b.pas); }

/* ---------- les zones des attaques (servent au dessin et au robot) ---------- */
function dansPoing(S, a, x) { return a.cote === 'g' ? x < S.L.W / 2 : x >= S.L.W / 2; }
function basSouffle(S) { var L = S.L; return L.solHaut + (L.solBas - L.solHaut) * REG.att.souffle.part; }
function coteOr(S, a, x) { return a.orGauche ? x < S.L.W / 2 : x >= S.L.W / 2; }

/* ---------- le programme de l'armure ---------- */
function lancer(S, type) {
  var A = REG.att, a = {type: type, t: 0};
  if (type === 'poing') {
    var dc = S.dernierCote, c = S.rnd() < 0.5 ? 'g' : 'd';
    if (dc.length >= 2 && dc[dc.length - 1] === dc[dc.length - 2]) c = dc[dc.length - 1] === 'g' ? 'd' : 'g'; // jamais trois fois le même côté
    dc.push(c); if (dc.length > 4) dc.shift();
    a.cote = c; a.prep = A.poing.prep; a.fin = A.poing.prep + A.poing.coup;
  } else if (type === 'souffle') {
    a.prep = A.souffle.prep; a.fin = A.souffle.prep + A.souffle.balaie + A.souffle.brule;
  } else if (type === 'grosCoup') {
    a.prep = A.grosCoup.prep; a.fin = A.grosCoup.prep + 0.6;
  } else if (type === 'reparateurs') {
    a.prep = A.reparateurs.prep; a.fin = a.prep;
  } else if (type === 'remede') {
    // (C) le premier au hasard, puis chacun son tour : on voit les deux
    a.type = S.dernierRemede ? (S.dernierRemede === 'chaud' ? 'froid' : 'chaud') : (S.rnd() < 0.5 ? 'chaud' : 'froid');
    S.dernierRemede = a.type;
    a.prep = A[a.type].monte; a.fin = A[a.type].monte + A[a.type].fenetre;
  } else if (type === 'charge') {
    a.prep = A.charge.eclair; a.fin = A.charge.eclair + A.charge.attente; a.orGauche = S.rnd() < 0.5;
    a.couleur = S.rnd() < 0.5 ? 'or' : 'rouge';
  }
  S.att = a;
  evt(S, 'annonce', {att: a.type});
}

function avancerArmure(S, dt) {
  var F = REG.formes[S.forme], v = S.reg.vitesse * F.vite, d = dt * v;
  if (S.sonnee > 0) S.sonnee -= dt;
  var a = S.att, h = S.h, D = REG.degats;
  if (!a) {
    S.attente -= d;
    if (S.attente <= 0) { lancer(S, F.prog[S.idx % F.prog.length]); S.idx++; }
  }
  var avant = a ? a.t : 0; if (a) a.t += d;
  switch (a && a.type) {
    case 'poing':
      if (avant < a.prep && a.t >= a.prep) { evt(S, 'boum', {cote: a.cote}); if (h.mort <= 0 && dansPoing(S, a, h.x)) coup(S, D.poing, 'poing'); }
      break;
    case 'souffle':
      if (a.t >= a.prep && !a.touche) {
        var A = REG.att.souffle, L = S.L, k = Math.min(1, (a.t - a.prep) / A.balaie);
        var front = L.solHaut + (basSouffle(S) - L.solHaut) * k;
        if (h.y - REG.heros.rayon * 0.6 < front && h.y < basSouffle(S) + REG.heros.rayon * 0.4) { a.touche = true; coup(S, D.souffle, 'souffle'); }
      }
      break;
    case 'grosCoup':
      if (avant < a.prep && a.t >= a.prep) { evt(S, 'grosBoum'); coup(S, D.grosCoup, 'grosCoup'); }
      break;
    case 'reparateurs':
      if (avant < a.prep && a.t >= a.prep) {
        var L2 = S.L;
        S.reps.push({x: L2.solG + 14, y: L2.solBas - 14, tx: L2.W * 0.36, ty: L2.solHaut + 10, ok: false});
        S.reps.push({x: L2.solD - 14, y: L2.solBas - 14, tx: L2.W * 0.64, ty: L2.solHaut + 10, ok: false});
        evt(S, 'reparateurs');
      }
      break;
    case 'chaud': case 'froid':
      if (a.t >= a.fin && !a.fait) {
        a.fait = true;
        if (a.type === 'chaud') { evt(S, 'chaudBoum'); coup(S, D.chaud, 'chaud'); }
        else { evt(S, 'gel'); if (h.mort <= 0 && h.invul <= 0) { coup(S, D.froid, 'froid'); if (h.mort <= 0) { h.gel = REG.att.froid.gel; h.potion = 0; } } }
      }
      break;
    case 'charge':
      if (avant < a.prep && a.t >= a.prep && h.mort <= 0) { h.charge = a.couleur; evt(S, 'charge', {c: a.couleur}); }
      if (avant < a.fin && a.t >= a.fin && h.charge) {
        var bon = (h.charge === 'or') === coteOr(S, a, h.x);
        if (bon) { h.bonus = REG.bonusCharge.duree; evt(S, 'chargeBonne'); }
        else { evt(S, 'chargeMauvaise'); coup(S, D.charge, 'charge'); }
        h.charge = null;
      }
      break;
  }
  if (a && S.att === a && a.t >= a.fin) { S.att = null; S.attente = F.pause; }

  // forme 3 : le bouclier qui renvoie, en même temps que le reste
  if (S.forme === 3) {
    var B = REG.bouclier, b = S.bouc;
    if (b.actif > 0) { b.actif -= d; if (b.actif <= 0) { b.actif = 0; b.avant = B.entre; evt(S, 'bouclierFin'); } }
    else if (b.monte > 0) { b.monte -= d; if (b.monte <= 0) { b.monte = 0; b.actif = B.actif; evt(S, 'bouclier'); } }
    else { b.avant -= d; if (b.avant <= 0) { b.monte = B.monte; evt(S, 'bouclierMonte'); } }
  }

  // les réparateurs
  var R = REG.reparateur;
  for (var i = S.reps.length - 1; i >= 0; i--) {
    var r = S.reps[i];
    if (!r.ok) {
      var dx = r.tx - r.x, dy = r.ty - r.y, dd = Math.hypot(dx, dy), pas = R.vitesse * d;
      if (dd <= pas) { r.x = r.tx; r.y = r.ty; r.ok = true; evt(S, 'repareArrive'); }
      else { r.x += dx / dd * pas; r.y += dy / dd * pas; }
    } else if (S.phase === 'combat') {
      var avantVie = S.vie;
      S.vie = Math.min(hautTier(S.forme), S.vie + R.soin * d);
      S.stats.reparesPV += S.vie - avantVie;
    }
    if (h.mort <= 0 && Math.hypot(r.x - h.x, r.y - h.y) < REG.heros.rayon + R.rayon) { S.reps.splice(i, 1); evt(S, 'repareCasse', {x: r.x, y: r.y}); }
  }
}

/* ---------- la danse des bandes ---------- */
function avancerDanse(S, dt) {
  var D = S.danse; if (!D) return;
  var d = dt * S.reg.vitesse;
  if (D.attente > 0) {
    D.attente -= d;
    if (D.attente <= 0) {
      // (C) la première bande sûre est celle où se trouve le héros
      var b = bandeDe(S, S.h.x); D.pos = D.motif.indexOf(b); D.k = 0; D.t = 0; D.explose = false; D.T = pasDanse(S, 0) + 0.6;
    }
    return;
  }
  D.t += d;
  if (!D.explose && D.t >= D.T * REG.alerte) {
    D.explose = true;
    var sur = D.motif[D.pos % D.motif.length];
    evt(S, 'bandes', {sur: sur});
    if (S.h.mort <= 0 && bandeDe(S, S.h.x) !== sur) coup(S, REG.degats.bande, 'bande');
  }
  if (D.t >= D.T) { D.k++; D.pos++; D.t = 0; D.explose = false; D.T = pasDanse(S, D.k); }
}

function surDanse(S) { var D = S.danse; if (!D || D.attente > 0) return -1; return D.motif[D.pos % D.motif.length]; }

/* ---------- les coups du héros ---------- */
function tirer(S, entree) {
  var h = S.h, f = S.reg.facon;
  if (S.phase !== 'combat' || !libre(S) || h.potion > 0 || h.tirT > 0) return;
  var veut = f === 'immobile' ? h.calme >= REG.immobileApres : f === 'bouton' ? !!entree.tirer : true;
  if (!veut) return;
  h.tirT = REG.tir.cadence;
  var L = S.L, tx = f === 'faible' ? h.x : L.W / 2 + (h.x - L.W / 2) * 0.25;
  S.tirs.push({x: h.x, y: h.y - REG.heros.rayon, x0: h.x, y0: h.y - REG.heros.rayon, tx: tx, ty: L.bossTouche, k: 0, fort: h.bonus > 0});
}

function avancerTirs(S, dt) {
  var L = S.L, V = REG.tir.vitesse;
  for (var i = S.tirs.length - 1; i >= 0; i--) {
    var s = S.tirs[i], dist = Math.hypot(s.tx - s.x0, s.ty - s.y0) || 1;
    s.k += V * dt / dist;
    s.x = s.x0 + (s.tx - s.x0) * Math.min(1, s.k); s.y = s.y0 + (s.ty - s.y0) * Math.min(1, s.k);
    if (s.k < 1) continue;
    S.tirs.splice(i, 1);
    if (S.phase !== 'combat') continue;
    var n = REG.tir.degat * (s.fort ? REG.bonusCharge.fois : 1);
    if (S.reg.facon === 'faible') {
      var p = S.pf;
      if (!(p.ouvert && Math.abs(s.x - p.x) < REG.faible.largeur)) { evt(S, 'ting', {x: s.x, y: s.y}); continue; }
      n *= REG.faible.bonus;
    }
    if (S.forme === 3 && S.bouc.actif > 0) { // (R) le bouclier renvoie : on voit le coup revenir sur nous
      S.renvois.push({x: s.x, y: s.y});
      evt(S, 'renvoi', {x: s.x, y: s.y});
      continue;
    }
    blesser(S, n, {x: s.x, y: s.y});
  }
  for (i = S.renvois.length - 1; i >= 0; i--) {
    var r = S.renvois[i], h = S.h, dx = h.x - r.x, dy = h.y - r.y, dd = Math.hypot(dx, dy), pas = 560 * dt;
    if (dd <= pas + REG.heros.rayon) { S.renvois.splice(i, 1); coup(S, REG.degats.renvoi, 'renvoi'); continue; }
    r.x += dx / dd * pas; r.y += dy / dd * pas;
  }
}

function avancerPointFaible(S, dt) {
  var p = S.pf, F = REG.faible, L = S.L, lo = L.W * 0.3, hi = L.W * 0.7;
  p.t -= dt;
  if (p.t <= 0) {
    p.ouvert = !p.ouvert; p.t = p.ouvert ? F.ouvert : F.ferme;
    if (p.ouvert) { p.x = lo + S.rnd() * (hi - lo); p.dir = S.rnd() < 0.5 ? -1 : 1; evt(S, 'faibleOuvre'); }
  }
  if (p.ouvert) { p.x += p.dir * F.vitesse * dt * S.reg.vitesse; if (p.x < lo) { p.x = lo; p.dir = 1; } if (p.x > hi) { p.x = hi; p.dir = -1; } }
}

/* ---------- un pas de temps ---------- */
// dtReel : le temps vrai ; entree : {tirer: bouton d'attaque gardé}
function pas(S, dtReel, entree) {
  entree = entree || {};
  dtReel = Math.min(0.05, Math.max(0, dtReel));
  S.reel += dtReel;
  var c = S.code;
  if (c.ralenti > 0) c.ralenti = Math.max(0, c.ralenti - dtReel);
  S.lent = c.ralenti > 0 ? REG.ralentiForce : 1;
  var dt = dtReel * S.lent;
  S.t += dt;
  if (c.bloque > 0) c.bloque = Math.max(0, c.bloque - dtReel);
  if (S.couperT > 0) S.couperT = Math.max(0, S.couperT - dt);

  var h = S.h, L = S.L, H = REG.heros;
  // le héros
  if (h.mort > 0) { h.mort -= dt; if (h.mort <= 0) { h.mort = 0; relever(S); } }
  if (h.invul > 0) h.invul = Math.max(0, h.invul - dt);
  if (h.gel > 0) h.gel = Math.max(0, h.gel - dt);
  if (h.bonus > 0) h.bonus = Math.max(0, h.bonus - dt);
  if (h.coupe > 0) h.coupe = Math.max(0, h.coupe - dtReel);
  if (h.tirT > 0) h.tirT -= dt;
  var bouge = false;
  if (libre(S) && S.phase !== 'explose' && S.phase !== 'fini') {
    var cx = Math.max(L.solG + H.rayon, Math.min(L.solD - H.rayon, S.cible.x));
    var cy = Math.max(L.solHaut + H.rayon, Math.min(L.solBas - H.rayon, S.cible.y));
    var dx = cx - h.x, dy = cy - h.y, dd = Math.hypot(dx, dy), max = H.vitesse * dt;
    if (dd > 0.01) {
      if (dd <= max) { h.x = cx; h.y = cy; } else { h.x += dx / dd * max; h.y += dy / dd * max; }
      bouge = Math.min(dd, max) > 0.3;
    }
  }
  h.calme = bouge ? 0 : h.calme + dt;
  if (h.potion > 0) {
    if (Math.hypot(h.x - h.px, h.y - h.py) > REG.potion.bouge) { h.potion = 0; evt(S, 'potionCoupee'); }
    else { h.potion -= dt; if (h.potion <= 0) { h.potion = 0; h.pv = H.pv; S.stats.potions++; evt(S, 'potionBue'); } }
  }

  if (S.phase === 'combat') {
    avancerArmure(S, dt);
    if (S.reg.facon === 'faible') avancerPointFaible(S, dt);
    tirer(S, entree);
  } else if (S.phase === 'bulle') {
    avancerDanse(S, dt);
    if (!S.cri) { S.pisteurT -= dtReel; if (S.pisteurT <= 0) pisteurCrie(S); }
  } else if (S.phase === 'transfo') {
    S.transfoT -= dt; if (S.piece) S.piece.t += dt;
    if (S.transfoT <= 0) {
      S.forme++; S.phase = 'combat'; S.att = null; S.idx = 0; S.attente = 1.5; S.symbole = null; S.cri = null; S.piece = null;
      S.bouc = {avant: REG.bouclier.premier, monte: 0, actif: 0};
      S.stats.debutForme = S.t;
      evt(S, 'forme', {forme: S.forme});
    }
  } else if (S.phase === 'explose') {
    S.transfoT -= dt; if (S.piece) S.piece.t += dt;
    if (S.transfoT <= 0) { S.phase = 'fini'; evt(S, 'fini'); }
  }
  avancerTirs(S, dt);
}

// pour les essais : aller tout de suite à une forme, ou au symbole
function aller(S, forme) {
  S.forme = forme; S.phase = 'combat'; S.vie = hautTier(forme); S.att = null; S.idx = 0; S.attente = 1.5;
  S.symbole = null; S.cri = null; S.danse = null; S.reps = []; S.tirs = []; S.renvois = []; S.piece = null;
  S.code.ouvert = false; S.code.ralenti = 0; S.code.bloque = 0; S.h.pv = REG.heros.pv; S.h.mort = 0; S.h.gel = 0; S.h.charge = null;
  S.bouc = {avant: REG.bouclier.premier, monte: 0, actif: 0}; S.stats.debutForme = S.t;
  evt(S, 'forme', {forme: forme});
}
function symboleTout(S) { if (S.phase === 'combat') { S.vie = seuil(S); symbole(S); return true; } return false; }

G.P2 = {
  REG: REG, SYMS: SYMS, REGLAGES_DEFAUT: REGLAGES_DEFAUT,
  nouvelle: nouvelle, pas: pas,
  potion: potion, couper: couper, remede: remede,
  ouvrirCode: ouvrirCode, fermerCode: fermerCode, taper: taper, effacer: effacer, pisteurCrie: pisteurCrie,
  aller: aller, symboleTout: symboleTout,
  hautTier: hautTier, seuil: seuil, bandeDe: bandeDe, surDanse: surDanse, motif: motif,
  dansPoing: dansPoing, basSouffle: basSouffle, coteOr: coteOr, libre: libre
};
})(typeof window !== 'undefined' ? window : globalThis);
