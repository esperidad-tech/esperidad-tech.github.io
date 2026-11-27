/* ==========================================================
   Phase 3 de l'enquête 10 — contre Grosbec de lumière
   MAQUETTE RAPIDE, VERSION 2 (Bible § 18.16) : la vue World of Warcraft, en formes simples.
   Les règles seules, sans dessin : ce fichier tourne aussi dans node (tests/).
   Distances en pas, durées en secondes (comme la phase 2 et le combat du Pisteur).
   (R) = décidé par Romain (§ 18.16) ; (C) = point de départ de Claude, à régler en jouant.

   Les quatre tablettes ne sont pas reliées. Chacune calcule LA MÊME suite des coups de Grosbec
   à partir du numéro de partie (aucun Math.random dans la suite), et ne simule que SON héros.
   En mode seul, la tablette simule aussi trois robots (les amis), pour essayer sans quatre tablettes.
   ========================================================== */
(function (G) {
'use strict';

var ROLES = ['pisteur', 'alchimiste', 'barde', 'sage'];
var REG = {
  salle: {L: 16, P: 6.5},                     // (C, v3) plus large que profonde, pour remplir l'écran d'un téléphone couché ; Grosbec au fond (y = 0)
  grosbec: {x: 8, y: 0.7, r: 1.5},            // (C) son pied ; on ne marche pas dessus
  heros: {pv: 100, r: 0.35, vit: 3.6, x: 8, y: 4.1},   // (R) la course de la phase 2 : 3,6 pas par seconde
  sort: {lance: 3, vol: 0.35},                // (R) trois sorts lents, environ 3 s sur place
  soin: {lance: 2, rend: 50},                 // (R) le soin de la phase 2
  saut: {L: 3, dur: 0.32, recharge: 1.5},     // (R) le saut de la phase 2
  bouclier: {dure: 3},                        // (R) 3 s ; la recharge est dans les réglages (10 s de base)
  bouge: 0.25,                                // (C) au-delà de ce petit coup de pouce, on bouge (et le sort est coupé)
  mort: {attente: 10, intouchable: 3},        // (R) on revient tout seul après 10 s ; (C) 3 s intouchable
  eclair: {tous: 2, montre: 0.55, tambour: 0.45},   // (R) des éclairs en permanence ; (C) un toutes les 2 s, 0,45 s pendant le tambour
  combat1: {tenir: 60, tambour: 10},          // (R) une minute, puis 10 s de tambour, et tout le monde tombe
  film: 8,                                    // (C) le film d'Odette, avant le bouton jaune
  lancement: 2,                               // (C) après le bouton jaune : deux secondes de calme
  // les trois endroits sûrs (R : la fontaine, la lanterne, la statue cassée) ; (C) leur place et leur taille
  lieux: [{n: 'lanterne', x: 3.6, y: 2.6}, {n: 'statue', x: 12.4, y: 2.6}, {n: 'fontaine', x: 8, y: 5.2}],
  lieuR: 0.45, surR: 1.4,                    // l'objet (on ne marche pas dessus) ; l'endroit sûr autour de lui
  zone: {annonce: 4},                         // (R) environ 4 s entre l'annonce et la frappe
  mega: {annonce: 2.8},                       // (R) moins de 3 s
  infoMontree: 6,                             // (C) la bulle du villageois reste 6 s pour un élément ou une partie
  // la montée (R) : tranquille au début, puis ça se resserre en 3 ou 4 minutes, puis ça accélère doucement
  montee: {fin: 210, ajoutZones: 30, ajoutMega: 60,
    faible: {de: [22, 27], a: [15, 20]},      // (R) 15 à 20 s ; (C) 22 à 27 s au départ
    zones: {de: [9, 12], a: [6, 9], mini: 4.8},   // (R)
    mega: {de: [18, 22], a: [13, 17], mini: 8},   // (R) 13 à 17 s ; (C) 18 à 22 s au départ
    apres: 0.065, plancher: 0.6},             // (C) ensuite, 6,5 % plus serré chaque minute, jusqu'à 60 %
  reprise: 30,                                // (R) un point de reprise toutes les 30 s environ
  coups: {court: 15, normal: 30, long: 45}    // (C) la vie de Grosbec, en sorts justes (6 min pour « normal », d'après les robots)
};
var DEFAUT = {
  mode: 'seul',       // 'seul' (trois robots) | 'quatre' (quatre tablettes)
  eclairs2: 10,       // (R : à régler en jouant) dégâts d'un éclair, deuxième combat : 0 | 5 | 10 | 15 | 20
  eclairs1: 30,       // (R : « 30 points toutes les deux secondes ») premier combat : 20 | 30 | 40
  recharge: 10,       // (R) la recharge du bouclier : 10 | 15 | 20 s
  vie: 'normal',      // court | normal | long
  robots: 0.95,       // en mode seul, la chance qu'un robot voie et crie une info : 0,95 | 0,9 | 0,75 | 0,6
  debut: 1,           // 1 : le premier combat ; 2 : le deuxième ; 3 : le deuxième, au plus dur (3 min 30)
  sons: true,
  role: 'barde',
  partie: 1
};
var ELEMS = ['feu', 'glace', 'acide'];
var PARTIES = ['tete', 'torse', 'brasG', 'brasD', 'jambeG', 'jambeD'];   // (R) six parties ; gauche et droite vues de l'écran
var MOTS = {feu: 'Feu !', glace: 'Glace !', acide: 'Acide !', tete: 'La tête !', torse: 'Le torse !', brasG: 'Bras gauche !', brasD: 'Bras droit !',
  jambeG: 'Jambe gauche !', jambeD: 'Jambe droite !', lanterne: 'La lanterne !', statue: 'La statue !', fontaine: 'La fontaine !', mega: 'Bouclier, vite !'};
var SYMS = ['🌙', '⭐', '☀️', '🔑', '🍄', '🐟', '🌳', '🔔', '🎩', '❤️', '🐱'];   // les symboles du jeu, sans 🔥 (c'est le sort de feu)

/* ---------- le hasard partagé (le même sur les quatre tablettes) ---------- */
function hash(s) { var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rngDe(s) {
  var a = hash(String(s));
  return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function entre(r, a, b) { return a + (b - a) * r(); }
function entier(r, n) { return Math.floor(r() * n); }
function arr(x) { return Math.round(x * 100) / 100; }
function lerp(a, b, k) { return a + (b - a) * k; }
function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* l'écart entre deux coups d'une même sorte, au temps T du deuxième combat */
function ecart(r, sorte, T) {
  var M = REG.montee, s = M[sorte], t0 = sorte === 'zones' ? M.ajoutZones : sorte === 'mega' ? M.ajoutMega : 0;
  var k = cl((T - t0) / (M.fin - t0), 0, 1);
  var a = lerp(s.de[0], s.a[0], k), b = lerp(s.de[1], s.a[1], k);
  var f = T <= M.fin ? 1 : Math.max(M.plancher, 1 - M.apres * (T - M.fin) / 60);
  return Math.max(s.mini || 0, entre(r, a, b) * f);
}

/* ---------- la suite des coups du deuxième combat (20 minutes, calculée une fois) ----------
   infos : {k:'info', quoi:'elem'|'part'|'zone'|'mega', donneur, cible (null pour la zone), tA, tFin, val, ref}
   coups : {k:'faible', h, t, elem, part, id} ; {k:'zone', id, tA, tI, lieu, donneur} ; {k:'mega', id, cible, tA, tI, donneur} */
var CACHE = {};
function suite(partie) {
  if (CACHE[partie]) return CACHE[partie];
  var r = rngDe('phase3-v2|' + partie), FIN = 20 * 60, id = 0;
  var faibles = [], zones = [], megas = [], infos = [], cris = {pisteur: 0, alchimiste: 0, barde: 0, sage: 0};
  // la faiblesse de chaque héros (R : élément + partie, change toutes les 15 à 20 s)
  ROLES.forEach(function (h, i) {
    var t = 2 + 1.5 * i, av = null;
    while (t < FIN) {
      var e, p;
      do { e = entier(r, 3); p = entier(r, 6); } while (av && av.elem === e && av.part === p);
      av = {k: 'faible', id: ++id, h: h, t: arr(t), elem: e, part: p};
      faibles.push(av);
      t += ecart(r, 'faible', t);
    }
  });
  // les grosses zones (R : un seul endroit sûr pour toute l'équipe)
  var t = REG.montee.ajoutZones;
  while (t < FIN) { zones.push({k: 'zone', id: ++id, tA: arr(t), tI: arr(t + REG.zone.annonce), lieu: entier(r, 3)}); t += ecart(r, 'zones', t); }
  // les méga attaques (R : jamais deux fois de suite sur le même ; pas en même temps qu'une zone)
  t = REG.montee.ajoutMega; var avant = null;
  while (t < FIN) {
    var tI = t + REG.mega.annonce;
    for (var z = 0; z < zones.length; z++) if (Math.abs(zones[z].tI - tI) < 0.9) { t += 1; tI += 1; z = -1; }
    var cand = ROLES.filter(function (x) { return x !== avant; }), c = cand[entier(r, cand.length)];
    megas.push({k: 'mega', id: ++id, tA: arr(t), tI: arr(tI), cible: c}); avant = c;
    t += ecart(r, 'mega', t);
  }
  // qui montre quoi : au hasard, jamais à soi-même, en équilibrant (R : pas de rôle fixe ; chacun crie à peu près autant)
  var tout = [];
  faibles.forEach(function (f) { tout.push({quoi: 'elem', ref: f, t: f.t}); tout.push({quoi: 'part', ref: f, t: f.t}); });
  zones.forEach(function (z) { tout.push({quoi: 'zone', ref: z, t: z.tA}); });
  megas.forEach(function (m) { tout.push({quoi: 'mega', ref: m, t: m.tA}); });
  tout.sort(function (a, b) { return a.t - b.t || a.ref.id - b.ref.id || (a.quoi < b.quoi ? -1 : 1); });
  var dejaElem = {};
  tout.forEach(function (x) {
    var cible = x.quoi === 'zone' ? null : (x.ref.h || x.ref.cible);
    var ok = ROLES.filter(function (g) { return g !== cible && !(x.quoi === 'part' && dejaElem[x.ref.id] === g); });   // (R) l'élément et la partie viennent de deux joueurs différents
    var mini = Math.min.apply(null, ok.map(function (g) { return cris[g]; }));
    ok = ok.filter(function (g) { return cris[g] === mini; });
    var g = ok[entier(r, ok.length)];
    cris[g]++;
    if (x.quoi === 'elem') dejaElem[x.ref.id] = g;
    var inf = {k: 'info', quoi: x.quoi, donneur: g, cible: cible, ref: x.ref.id, tA: x.t};
    if (x.quoi === 'elem') { inf.val = x.ref.elem; inf.tFin = arr(x.t + REG.infoMontree); }
    else if (x.quoi === 'part') { inf.val = x.ref.part; inf.tFin = arr(x.t + REG.infoMontree); }
    else if (x.quoi === 'zone') { inf.val = x.ref.lieu; inf.tFin = x.ref.tI; x.ref.donneur = g; }
    else { inf.val = null; inf.tFin = x.ref.tI; x.ref.donneur = g; }
    infos.push(inf);
  });
  var S = {partie: partie, faibles: faibles, zones: zones, megas: megas, infos: infos, cris: cris};
  CACHE[partie] = S;
  return S;
}
/* la faiblesse d'un héros au temps T */
function faibleA(su, h, T) {
  var f = null;
  for (var i = 0; i < su.faibles.length; i++) { var x = su.faibles[i]; if (x.h === h && x.t <= T) f = x; }
  return f;
}
/* les symboles de victoire (quatre différents) */
function symboles(partie) {
  var r = rngDe('symboles3|' + partie), l = SYMS.slice(), o = {};
  for (var i = l.length - 1; i > 0; i--) { var j = entier(r, i + 1), x = l[i]; l[i] = l[j]; l[j] = x; }
  ROLES.forEach(function (ro, i) { o[ro] = l[i]; });
  return o;
}

/* ---------- une partie sur une tablette ---------- */
function nouvelle(reglages, graine) {
  var reg = {};
  for (var k in DEFAUT) reg[k] = (reglages && reglages[k] !== undefined) ? reglages[k] : DEFAUT[k];
  var H = REG.heros, moi = reg.role;
  var S = {
    reg: reg, moi: moi, seul: reg.mode === 'seul',
    partie: reg.mode === 'seul' ? (graine || 1) : reg.partie,
    rnd: rngDe('local|' + (graine || 1) + '|' + Date.now()),   // le hasard local (les éclairs, les robots) : pas besoin d'être partagé
    combat: 1, etat: 'combat', T: 0, reel: 0, attente: 0,
    h: {x: H.x, y: H.y, pv: H.pv, dx: 0, dy: -1, lance: null, saut: null, sautT: 0, mort: 0, intouchable: 0, coupe: 0,
        bouclierFin: -1, bouclierPret: 0, bouge: false},
    cible: 1,                                    // la partie visée : le torse au départ
    boss: 0, bossMax: 0, faible: null,
    vus: {}, tirs: [], prochainEclair: 1.5, eclairs: [],
    code: {}, symboles: null, symboleT: -1,
    amis: {}, cris: [], relais: {},              // mode seul : les robots, leurs cris pour moi, ce que j'ai crié
    villageois: {x: H.x - 0.85, y: H.y + 1.0, court: null}, bulle: null, dit: {},
    stats: {morts: 0, sorts: 0, justes: 0, rebonds: 0, soins: 0, zones: 0, zonesRatees: 0, megas: 0, megasRatees: 0, reprises: 0, relaisFaits: 0, relaisRates: 0, symboleT: null},
    evts: []
  };
  S.symboles = symboles(S.partie);
  S.su = suite(S.partie);
  S.bossMax = REG.coups[reg.vie] || REG.coups.normal; S.boss = S.bossMax;   // (au premier combat, la barre ne bouge presque pas : on ne sait rien)
  ROLES.forEach(function (ro) {
    if (ro === moi) return;
    S.amis[ro] = {role: ro, x: H.x, y: H.y + 0.8, hist: [], delai: ro === 'pisteur' ? 0.15 : 0.3 + 0.25 * S.rnd(), prochainSort: 1 + 3 * S.rnd(),
      // le robot (mode seul)
      mort: 0, bouclierFin: -1, bouclierPret: 0, boss: 0, sait: {}, prochainCoup: 0, voix: 0, symboleCrie: -99, symbole: S.symboles[ro]};
  });
  if (reg.debut >= 2) allerC2(S, reg.debut === 3 ? REG.montee.fin : 0);
  return S;
}
function evt(S, type, o) { o = o || {}; o.type = type; o.t = S.reel; S.evts.push(o); if (S.evts.length > 120) S.evts.shift(); if (S.surEvt) S.surEvt(o); }
function dernier(S, type, depuis) { for (var i = S.evts.length - 1; i >= 0; i--) { var e = S.evts[i]; if (S.reel - e.t > depuis) return null; if (e.type === type) return e; } return null; }
function vivant(S) { return S.h.mort <= 0; }
function protege(S) { return S.h.bouclierFin > S.T || S.h.intouchable > 0; }

/* le deuxième combat (après le film d'Odette, ou tout de suite pour les essais) */
function allerC2(S, T0) {
  var H = REG.heros, h = S.h;
  S.combat = 2; S.etat = 'combat'; S.T = T0 || 0; S.attente = REG.lancement;
  S.bossMax = REG.coups[S.reg.vie] || REG.coups.normal; S.boss = S.bossMax;
  h.pv = H.pv; h.mort = 0; h.intouchable = 0; h.lance = null; h.saut = null; h.x = H.x; h.y = H.y; h.bouclierFin = -1; h.bouclierPret = 0;
  S.vus = {}; marquerPasse(S); S.prochainEclair = S.T + 1.5;
  for (var ro in S.amis) { var a = S.amis[ro]; a.boss = S.bossMax; a.mort = 0; a.sait = {}; a.bouclierFin = -1; a.bouclierPret = 0; a.prochainCoup = 0; a.voix = 0; }
  S.cris = [];
  evt(S, 'combat2');
}
function marquerPasse(S) {   // tout ce qui a commencé avant S.T est considéré comme passé (après « On reprend »)
  var su = S.su;
  su.infos.forEach(function (x) { if (x.tA < S.T) S.vus['i' + x.ref + x.quoi] = 1; });
  su.zones.forEach(function (z) { if (z.tA < S.T) { S.vus['z' + z.id] = 1; S.vus['zi' + z.id] = 1; } });
  su.megas.forEach(function (m) { if (m.tA < S.T) { S.vus['m' + m.id] = 1; S.vus['mi' + m.id] = 1; } });
  su.faibles.forEach(function (f) { if (f.t < S.T) S.vus['f' + f.id] = 1; });
  S.faible = faibleA(su, S.moi, S.T);
  for (var ro in S.amis) S.amis[ro].faible = faibleA(su, ro, S.T);
}

/* ---------- le héros prend des coups ---------- */
function blesser(S, n, source) {
  var h = S.h;
  if (!vivant(S) || protege(S) || S.etat !== 'combat') return false;
  h.pv -= n; h.coupe = 0.35;
  evt(S, 'aie', {n: n, source: source});
  if (h.pv <= 0) mourir(S, source);
  return true;
}
function mourir(S, source) {
  var h = S.h;
  if (h.mort > 0) return;
  h.pv = 0; h.mort = REG.mort.attente; h.lance = null; h.saut = null; S.bulle = null;
  S.stats.morts++;
  evt(S, 'mort', {source: source, x: h.x, y: h.y});
}

/* ---------- les obstacles ---------- */
function libreEn(x, y, r) {
  var L = REG.salle, B = REG.grosbec;
  if (x < r || x > L.L - r || y < r || y > L.P - r) return false;
  if (Math.hypot(x - B.x, y - B.y) < B.r + r) return false;
  for (var i = 0; i < REG.lieux.length; i++) if (Math.hypot(x - REG.lieux[i].x, y - REG.lieux[i].y) < REG.lieuR + r) return false;
  return true;
}
function pousser(o, r) {
  var L = REG.salle, B = REG.grosbec;
  for (var pass = 0; pass < 3; pass++) {
    o.x = cl(o.x, r, L.L - r); o.y = cl(o.y, r, L.P - r);
    [{x: B.x, y: B.y, m: B.r + r}].concat(REG.lieux.map(function (l) { return {x: l.x, y: l.y, m: REG.lieuR + r}; })).forEach(function (c) {
      var dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy);
      if (d < c.m) { if (d < 1e-6) { dx = 0; dy = 1; d = 1; } o.x = c.x + dx / d * c.m; o.y = c.y + dy / d * c.m; }
    });
  }
}
function aLAbri(x, y, lieu) { var l = REG.lieux[lieu]; return Math.hypot(x - l.x, y - l.y) <= REG.surR; }

/* ---------- les gestes ---------- */
function lancer(S, quoi) {
  var h = S.h;
  if (S.etat !== 'combat' || S.attente > 0 || !vivant(S) || h.lance || h.saut) return false;
  if (h.bouge) return false;                                         // (R) on ne lance pas en courant
  if (quoi !== 'soin') {
    if (S.boss <= 0 && S.combat === 2) return false;                 // (R) en soutien, les sorts sont gris
    if (S.combat === 1 && quoi === 'acide') return false;            // (C) l'acide arrive avec le village
  }
  if (quoi === 'soin' && h.pv >= REG.heros.pv) return false;
  h.lance = {quoi: quoi, t: 0, dur: quoi === 'soin' ? REG.soin.lance : REG.sort.lance};
  evt(S, 'lance', {quoi: quoi});
  return true;
}
function sauter(S, mx, my) {
  var h = S.h;
  if (S.etat !== 'combat' || S.attente > 0 || !vivant(S) || h.saut || h.sautT > 0) return false;
  var n = Math.hypot(mx || 0, my || 0), dx = n > 0.2 ? mx / n : h.dx, dy = n > 0.2 ? my / n : h.dy;
  h.saut = {t: 0, dx: dx, dy: dy}; h.sautT = REG.saut.recharge;
  if (h.lance) { h.lance = null; evt(S, 'sortCoupe', {par: 'saut'}); }
  evt(S, 'saut');
  return true;
}
function bouclier(S) {
  var h = S.h;
  if (S.etat !== 'combat' || S.combat !== 2 || !vivant(S) || S.T < h.bouclierPret) return false;
  h.bouclierFin = S.T + REG.bouclier.dure; h.bouclierPret = S.T + S.reg.recharge;   // (R) 3 s, puis la recharge (10 s)
  evt(S, 'bouclier');
  return true;
}
function viser(S, p) { if (p >= 0 && p < 6) { S.cible = p; evt(S, 'vise', {p: p}); return true; } return false; }

/* ---------- le code de la fin ---------- */
function taper(S, ami, sym) {
  if (!vivant(S) || S.combat !== 2 || ami === S.moi) return false;   // (R) on ne tape pas le code quand on est mort
  if (S.symboles[ami] !== sym) { evt(S, 'codeFaux', {ami: ami}); return false; }
  S.code[ami] = sym; evt(S, 'codeBon', {ami: ami});
  if (victoire(S)) { S.etat = 'fini'; evt(S, 'victoire'); }
  return true;
}
function victoire(S) {
  return S.combat === 2 && S.boss <= 0 && ROLES.every(function (ro) { return ro === S.moi || S.code[ro] === S.symboles[ro]; });
}

/* ---------- « On reprend » : le dernier point de reprise (toutes les 30 s), sans rien afficher ---------- */
function pointDeReprise(T) { return Math.floor(T / REG.reprise) * REG.reprise; }
function reprendre(S) {
  if (S.combat !== 2) return false;
  var h = S.h, H = REG.heros;
  S.T = pointDeReprise(S.T); S.attente = REG.lancement;
  h.pv = H.pv; h.mort = 0; h.intouchable = 0; h.lance = null; h.saut = null; h.bouclierFin = -1; h.bouclierPret = 0;   // (R) chacun garde la vie de Grosbec
  S.vus = {}; marquerPasse(S); S.prochainEclair = S.T + 1.5; S.tirs = []; S.cris = []; S.bulle = null;
  for (var ro in S.amis) { var a = S.amis[ro]; a.mort = 0; a.bouclierFin = -1; a.bouclierPret = 0; a.voix = 0; a.prochainCoup = S.T + 2 + 2 * S.rnd(); }
  S.stats.reprises++;
  evt(S, 'reprise');
  return true;
}

/* ---------- mode seul : je « crie » une info en touchant le portrait d'un ami (ou la bulle du villageois pour l'endroit sûr) ---------- */
function mesInfos(S) {   // les bulles de mon villageois : les infos dont MA tablette est le donneur, en ce moment
  if (S.combat !== 2 || !vivant(S) || S.etat !== 'combat') return [];
  return S.su.infos.filter(function (x) { return x.donneur === S.moi && x.tA <= S.T && S.T < x.tFin; });
}
function relayer(S, ami) {
  if (!S.seul) return false;
  var bu = S.bulle;
  if (!bu || bu.type !== 'villageois' || bu.x.cible !== ami || S.relais[bu.x.ref + bu.x.quoi]) return false;   // (v3) seulement ce que montre la bulle
  S.relais[bu.x.ref + bu.x.quoi] = 1; entendre(S, S.amis[ami], bu.x, S.T + 0.2); S.stats.relaisFaits++;
  evt(S, 'relais', {ami: ami});
  return true;
}
function relayerZone(S) {
  if (!S.seul) return false;
  var bu = S.bulle;
  if (!bu || bu.type !== 'villageois' || bu.x.quoi !== 'zone' || S.relais[bu.x.ref + 'zone']) return false;
  S.relais[bu.x.ref + 'zone'] = 1; for (var ro in S.amis) entendre(S, S.amis[ro], bu.x, S.T + 0.2); S.stats.relaisFaits++;
  evt(S, 'relais', {ami: 'tous'});
  return true;
}
function aRelayer(S, ami) { var bu = S.bulle; return !!(S.seul && bu && bu.type === 'villageois' && bu.x.cible === ami && !S.relais[bu.x.ref + bu.x.quoi]); }

/* ---------- (v3, Romain : « une seule bulle à la fois ») : ce que montre l'écran, une chose à la fois ----------
   Les candidats : ce que montre mon villageois (à crier aux autres), et, en mode seul, ce que mes robots me crient.
   L'endroit sûr passe avant tout (il coupe la bulle en cours), puis le bouclier, puis le reste, du plus ancien au plus récent.
   Une bulle reste au moins 1,8 s (2,2 s pour un cri), puis laisse la place s'il y a autre chose à montrer ;
   l'endroit sûr et le bouclier disparaissent à la frappe ; en mode seul, une info relayée disparaît. */
function prioBulle(c) { var q = c.x ? c.x.quoi : 'sym'; return q === 'zone' ? 0 : q === 'mega' ? 1 : c.type === 'villageois' ? 2 : q === 'sym' ? 4 : 3; }
function candidatsBulle(S) {
  var l = [], T = S.T;
  mesInfos(S).forEach(function (x) {
    var cle = 'v' + x.ref + x.quoi;
    if (S.dit[cle] || (S.seul && S.relais[x.ref + x.quoi])) return;
    l.push({cle: cle, type: 'villageois', x: x, age: x.tA, fin: x.tFin, mini: 1.8});
  });
  S.cris.forEach(function (c, i) {
    var cle = 'c' + (c.x ? c.x.ref + c.x.quoi : 's' + c.de + Math.round(c.t));
    if (T < c.t || T >= c.fin || S.dit[cle]) return;
    l.push({cle: cle, type: 'ami', de: c.de, x: c.x || null, sym: c.sym || null, age: c.t, fin: c.fin, mini: 2.2});
  });
  l.forEach(function (c) { c.prio = prioBulle(c); });
  l.sort(function (a, b) { return a.prio - b.prio || a.age - b.age; });
  return l;
}
function choisirBulle(S) {
  if (!vivant(S) || S.combat !== 2 || S.etat !== 'combat') { S.bulle = null; return; }
  var T = S.T, cur = S.bulle, l = candidatsBulle(S);
  if (cur) {
    var fini = T >= cur.fin || (cur.type === 'villageois' && S.seul && S.relais[cur.x.ref + cur.x.quoi]);
    if (!fini && !l.some(function (c) { return c.cle === cur.cle; })) fini = true;
    if (fini) { S.dit[cur.cle] = 1; cur = S.bulle = null; }
  }
  var autres = l.filter(function (c) { return !cur || c.cle !== cur.cle; });
  if (cur && autres.length) {
    var mieux = autres[0];
    if (mieux.prio <= 1 && mieux.prio < cur.prio) cur = S.bulle = null;                        // l'endroit sûr ou le bouclier coupe la bulle (elle reviendra)
    else if (T - cur.debut >= cur.mini) { S.dit[cur.cle] = 1; cur = S.bulle = null; }          // assez montrée : au suivant
  }
  if (!cur && l.length) {
    var n = l.filter(function (c) { return !S.dit[c.cle]; })[0];
    if (n) { n.debut = T; S.bulle = n; if (n.type === 'villageois') evt(S, 'bulle', {x: n.x}); }
  }
}

/* ---------- les robots (mode seul) ---------- */
function entendre(S, a, x, quand) {
  if (!a) return;
  a.sait[x.ref + x.quoi] = quand;
}
// un robot crie ce que son villageois lui montre (s'il est vivant), un cri à la fois ; on l'entend avec la chance « robots »
function finFaiblesse(su, x, debut) {   // (v3) un cri d'élément ou de partie reste valable jusqu'à la faiblesse suivante (12 s au plus)
  var f = null; su.faibles.forEach(function (y) { if (y.h === x.cible && y.t > x.tA && (!f || y.t < f.t)) f = y; });
  return Math.min(f ? f.t : debut + 12, debut + 12);
}
function robotsCrient(S) {
  var su = S.su, T = S.T;
  su.infos.forEach(function (x) {
    if (x.donneur === S.moi || x.tA > T || S.vus['c' + x.ref + x.quoi]) return;
    var g = S.amis[x.donneur];
    if (T < x.tA + 0.3) return;
    S.vus['c' + x.ref + x.quoi] = 1;
    if (g.mort > 0) return;                                          // sa tablette ne montre plus rien
    if (x.quoi === 'zone') entendre(S, g, x, x.tA + 0.3);            // son villageois court : lui, il sait
    if (S.rnd() > S.reg.robots) return;                              // il ne l'a pas vue, ou pas criée
    var urgent = x.quoi === 'zone' || x.quoi === 'mega';            // l'endroit sûr et le bouclier : on les crie tout de suite, avant le reste
    var debut = urgent ? T + 0.2 + 0.5 * S.rnd() : Math.max(T + 0.3 + 0.7 * S.rnd(), g.voix), fin = debut + (x.quoi === 'mega' ? 0.6 : 1.0);
    g.voix = fin;
    var pour = x.quoi === 'zone' ? ROLES.filter(function (ro) { return ro !== x.donneur; }) : [x.cible];
    pour.forEach(function (ro) {
      if (ro === S.moi) S.cris.push({de: x.donneur, x: x, t: debut, fin: urgent ? x.tFin : finFaiblesse(su, x, debut)});   // (v3) l'endroit sûr et le bouclier : jamais après la frappe ; l'élément et la partie attendent leur tour tant qu'ils sont vrais
      else if (S.rnd() < 0.95) entendre(S, S.amis[ro], x, fin + 0.2 + 0.4 * S.rnd());
    });
  });
}
function robotsJouent(S, dt) {
  var su = S.su, T = S.T;
  for (var ro in S.amis) {
    var a = S.amis[ro];
    if (a.mort > 0) { a.mort -= dt; continue; }
    if (S.combat !== 2) continue;
    var f = faibleA(su, ro, T);
    // il tape quand il connaît l'élément ET la partie de sa faiblesse
    if (f && a.boss > 0 && T >= a.prochainCoup) {
      var se = a.sait[f.id + 'elem'], sp = a.sait[f.id + 'part'];
      if (se !== undefined && sp !== undefined && se <= T && sp <= T) {
        a.boss -= 1; a.prochainCoup = T + 4.5 + 2.5 * S.rnd();
        if (a.boss <= 0) { a.symboleCrie = -99; evt(S, 'robotSymbole', {ami: ro}); }
      } else a.prochainCoup = T + 0.5;
    }
  }
}
function robotZone(S, a, z) {
  if (a.mort > 0) return;
  if (a.bouclierFin > z.tI) return;                                  // déjà sous le bouclier
  var su = a.sait[z.id + 'zone'], course = 1.4 + 0.8 * S.rnd();
  if (su !== undefined && su <= z.tI - course) return;               // il a su à temps : il court à l'abri
  if (z.tI >= a.bouclierPret && S.rnd() < 0.8) { a.bouclierFin = z.tI + 1; a.bouclierPret = z.tI + S.reg.recharge; return; }   // le joker
  if (S.rnd() < 1 / 3) return;                                       // au bon endroit par chance
  robotMeurt(S, a, 'zone');
}
function robotMega(S, a, m) {
  if (a.mort > 0) return;
  if (a.bouclierFin > m.tI) return;
  var su = a.sait[m.id + 'mega'];
  if (su !== undefined && su <= m.tI - 0.25 && su >= a.bouclierPret) { a.bouclierFin = su + REG.bouclier.dure; a.bouclierPret = su + S.reg.recharge; return; }
  robotMeurt(S, a, 'mega');
}
function robotMeurt(S, a, source) { a.mort = REG.mort.attente; evt(S, 'robotMort', {ami: a.role, source: source}); }

/* ---------- un pas de temps ---------- */
function pas(S, dt, entree) {
  S.reel += dt;
  var h = S.h;
  if (h.coupe > 0) h.coupe = Math.max(0, h.coupe - dt);
  if (S.etat === 'film') { S.attente -= dt; if (S.attente <= 0) { S.etat = 'go'; evt(S, 'go'); } return; }
  if (S.etat !== 'combat') return;
  if (S.attente > 0) { S.attente -= dt; suivre(S, dt); return; }      // les deux secondes de calme après le bouton jaune
  S.T += dt;
  var T = S.T;
  // le héros : la mort, le retour
  if (h.mort > 0) { h.mort -= dt; if (h.mort <= 0) { h.mort = 0; h.pv = REG.heros.pv; h.intouchable = REG.mort.intouchable; evt(S, 'releve'); } }
  if (h.intouchable > 0) h.intouchable = Math.max(0, h.intouchable - dt);
  if (h.sautT > 0) h.sautT = Math.max(0, h.sautT - dt);
  // se déplacer
  var mx = entree ? entree.mx || 0 : 0, my = entree ? entree.my || 0 : 0, m = Math.hypot(mx, my);
  h.bouge = vivant(S) && m > REG.bouge;
  if (vivant(S)) {
    if (h.saut) {
      var v = REG.saut.L / REG.saut.dur;
      h.x += h.saut.dx * v * dt; h.y += h.saut.dy * v * dt; h.saut.t += dt;
      if (h.saut.t >= REG.saut.dur) h.saut = null;
    } else if (h.bouge) {
      var k = Math.min(1, m);
      h.x += mx / m * k * REG.heros.vit * dt; h.y += my / m * k * REG.heros.vit * dt; h.dx = mx / m; h.dy = my / m;
      if (h.lance) { h.lance = null; evt(S, 'sortCoupe', {par: 'bouge'}); }   // (R) seul le fait de bouger coupe un sort ou un soin
    }
    pousser(h, REG.heros.r);
  }
  // lancer
  if (h.lance && vivant(S)) {
    h.lance.t += dt;
    if (h.lance.t >= h.lance.dur) {
      var q = h.lance.quoi; h.lance = null;
      if (q === 'soin') { h.pv = Math.min(REG.heros.pv, h.pv + REG.soin.rend); S.stats.soins++; evt(S, 'soigne'); }
      else { S.tirs.push({quoi: q, x: h.x, y: h.y, t: 0, part: S.cible}); S.stats.sorts++; evt(S, 'part', {quoi: q}); }
    }
  }
  // les sorts qui volent jusqu'à Grosbec : le bon élément sur la bonne partie fait mal, sinon ça rebondit
  S.tirs = S.tirs.filter(function (s) {
    s.t += dt;
    if (s.t < REG.sort.vol) return true;
    var f = S.combat === 2 ? S.faible : faibleA(suiteC1(S), S.moi, T);
    var bon = f && ELEMS[f.elem] === s.quoi && f.part === s.part;
    if (bon && S.boss > 0) {
      S.boss = Math.max(0, S.boss - 1); S.stats.justes++; evt(S, 'touche', {part: s.part, quoi: s.quoi});
      if (S.boss <= 0 && S.combat === 2) { S.symboleT = S.reel; S.stats.symboleT = T; evt(S, 'symbole'); if (victoire(S)) { S.etat = 'fini'; evt(S, 'victoire'); } }   // les trois autres déjà tapés : c'est gagné
    } else { S.stats.rebonds++; evt(S, 'rebond', {part: s.part, quoi: s.quoi}); }
    return false;
  });
  // les éclairs : en permanence, de sa main jusqu'au héros, impossibles à éviter (le bouclier les arrête)
  var tambour = S.combat === 1 && T >= REG.combat1.tenir;
  if (T >= S.prochainEclair) {
    S.prochainEclair = T + (tambour ? REG.eclair.tambour : REG.eclair.tous);
    if (vivant(S)) {
      var deg = S.combat === 1 ? S.reg.eclairs1 : S.reg.eclairs2;
      S.eclairs.push({t: S.reel, main: S.rnd() < 0.5 ? -1 : 1, vers: 'moi'});
      if (deg > 0) blesser(S, tambour ? Math.max(deg, 25) : deg, 'eclair');
    }
    // et sur les amis, pour l'image
    var ros = Object.keys(S.amis); S.eclairs.push({t: S.reel + 0.25, main: S.rnd() < 0.5 ? -1 : 1, vers: ros[Math.floor(S.rnd() * ros.length)]});
  }
  S.eclairs = S.eclairs.filter(function (e) { return S.reel - e.t < REG.eclair.montre; });
  // le premier combat : au bout d'une minute il tambourine, et en 10 s tout le monde tombe ; puis le film d'Odette
  if (S.combat === 1) {
    if (tambour && !S.vus.tambour) { S.vus.tambour = 1; evt(S, 'tambour'); }
    if (T >= REG.combat1.tenir + REG.combat1.tambour) {
      if (vivant(S)) mourir(S, 'tambour');
      for (var r1 in S.amis) S.amis[r1].mort = 99;
      if (!S.vus.finC1) { S.vus.finC1 = 1; S.finC1 = S.reel; }
      if (S.reel - S.finC1 > 1.5) { S.etat = 'film'; S.attente = REG.film; evt(S, 'film'); }
    }
    suivre(S, dt);
    return;
  }
  // le deuxième combat : la suite des coups
  var su = S.su;
  su.faibles.forEach(function (f) {
    if (f.t > T || S.vus['f' + f.id]) return; S.vus['f' + f.id] = 1;
    if (f.h === S.moi) S.faible = f;                                  // (R) pas de signe : on le comprend quand le sort rebondit
  });
  su.infos.forEach(function (x) {
    if (x.tA > T || S.vus['i' + x.ref + x.quoi]) return; S.vus['i' + x.ref + x.quoi] = 1;
    if (x.donneur !== S.moi || !vivant(S)) return;
    evt(S, 'info', {x: x});
    if (x.quoi === 'zone') S.villageois.court = {lieu: x.val, fin: su.zones.filter(function (z) { return z.id === x.ref; })[0].tI + 0.6};
  });
  su.zones.forEach(function (z) {
    if (z.tI > T || S.vus['zi' + z.id]) return; S.vus['zi' + z.id] = 1;
    S.stats.zones++;
    var ok = !vivant(S) || protege(S) || aLAbri(h.x, h.y, z.lieu);
    evt(S, 'zone', {lieu: z.lieu, ok: ok});
    if (!ok) { S.stats.zonesRatees++; mourir(S, 'zone'); }           // (R) rater une zone, c'est tomber d'un coup
    if (S.seul) for (var ro in S.amis) robotZone(S, S.amis[ro], z);
  });
  su.megas.forEach(function (mg) {
    if (mg.tI > T || S.vus['mi' + mg.id]) return; S.vus['mi' + mg.id] = 1;
    if (mg.cible === S.moi) {
      S.stats.megas++;
      var ok2 = !vivant(S) || protege(S);
      evt(S, 'mega', {moi: true, ok: ok2});
      if (!ok2) { S.stats.megasRatees++; mourir(S, 'mega'); }        // (C) sans bouclier, on tombe
    } else {
      evt(S, 'mega', {moi: false, cible: mg.cible, vuIci: mg.donneur === S.moi && vivant(S)});   // le rayon ne se voit que chez celui qui a prévenu
      if (S.seul) robotMega(S, S.amis[mg.cible], mg);
    }
  });
  if (S.seul) { robotsCrient(S); robotsJouent(S, dt); }
  S.cris = S.cris.filter(function (c) { return S.T < c.fin; });
  choisirBulle(S);
  // les robots qui ont fini crient leur symbole (et le redisent de temps en temps tant que je ne l'ai pas tapé)
  if (S.seul) for (var r2 in S.amis) {
    var a = S.amis[r2];
    if (a.boss <= 0 && a.mort <= 0 && !S.code[r2] && S.T - a.symboleCrie > 12) { a.symboleCrie = S.T; S.cris.push({de: r2, sym: a.symbole, t: S.T + 0.5, fin: S.T + 5}); }
  }
  // les relais que je n'ai pas faits à temps (pour les mesures)
  suivre(S, dt);
}
/* les coéquipiers et le villageois suivent mon héros, chacun avec son temps de réaction (R) */
var PLACES = [[-1.25, 0.15], [1.25, 0.15], [0, -0.95]];   // (C) à côté et derrière moi, pour ne jamais cacher mon héros
function suivre(S, dt) {
  var h = S.h, i = 0;
  for (var ro in S.amis) {
    var a = S.amis[ro], pl = PLACES[i++];
    a.hist.push([S.reel, h.x, h.y]); while (a.hist.length > 2 && S.reel - a.hist[1][0] > a.delai) a.hist.shift();
    var cible = a.hist[0], tx = cible[1] + pl[0], ty = cible[2] + pl[1];
    var dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), v = REG.heros.vit * 1.05 * dt;
    if (d > 0.05) { var k = Math.min(1, v / d); a.x += dx * k; a.y += dy * k; }
    pousser(a, REG.heros.r);
    if (Math.random() < dt / 4) a.delai = ro === 'pisteur' ? 0.1 + 0.1 * Math.random() : 0.28 + 0.35 * Math.random();
  }
  var vg = S.villageois, cx, cy;
  if (vg.court && S.T < vg.court.fin && vivant(S)) { var l = REG.lieux[vg.court.lieu]; cx = l.x + 0.7; cy = l.y + 0.7; }
  else { vg.court = null; cx = h.x - 0.85; cy = h.y + 1.0; }
  var ddx = cx - vg.x, ddy = cy - vg.y, dd = Math.hypot(ddx, ddy), vv = (vg.court ? 4.5 : 3.4) * dt;
  if (dd > 0.05) { var kk = Math.min(1, vv / dd); vg.x += ddx * kk; vg.y += ddy * kk; }
  pousser(vg, 0.3);
}
/* au premier combat, la faiblesse change aussi (on ne le sait pas) : une suite à part, partagée elle aussi */
function suiteC1(S) {
  if (S._c1) return S._c1;
  var r = rngDe('c1|' + S.partie), f = [], id = 0;
  ROLES.forEach(function (h) { var t = 0; while (t < 80) { f.push({id: ++id, h: h, t: t, elem: entier(r, 3), part: entier(r, 6)}); t += entre(r, 15, 20); } });
  S._c1 = {faibles: f};
  return S._c1;
}
function demarrerC2(S) { if (S.etat === 'go') { allerC2(S, 0); return true; } return false; }

G.P3 = {REG: REG, DEFAUT: DEFAUT, ROLES: ROLES, ELEMS: ELEMS, PARTIES: PARTIES, MOTS: MOTS, SYMS: SYMS,
  hash: hash, rngDe: rngDe, suite: suite, faibleA: faibleA, symboles: symboles, ecart: ecart,
  nouvelle: nouvelle, pas: pas, lancer: lancer, sauter: sauter, bouclier: bouclier, viser: viser, taper: taper, victoire: victoire,
  reprendre: reprendre, pointDeReprise: pointDeReprise, mesInfos: mesInfos, choisirBulle: choisirBulle, candidatsBulle: candidatsBulle, relayer: relayer, relayerZone: relayerZone, aRelayer: aRelayer,
  allerC2: allerC2, demarrerC2: demarrerC2, dernier: dernier, vivant: vivant, protege: protege, aLAbri: aLAbri, libreEn: libreEn};
if (typeof module !== 'undefined') module.exports = G.P3;
})(typeof window !== 'undefined' ? window : globalThis);
