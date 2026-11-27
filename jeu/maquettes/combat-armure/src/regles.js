/* ==========================================================
   Phase 2 de l'enquête 10 — les trois de devant contre l'armure de Grosbec
   LA VRAIE VERSION (chantier 5, Bible § 18.11 et § 18.14), d'après la maquette v2 (§ 18.15) et les retours de Romain du 27 novembre :
   une salle plus grande (la caméra suit le héros, comme chez le Pisteur), des rochers à hauteur d'homme à la place des colonnes,
   l'abri juste derrière chaque rocher, le rayon qui soigne de plus en plus fort, pas de rayon quand le héros est mort,
   la main d'énergie resserrée pendant le rayon et jamais de doigt sur le rayon.
   Les règles seules, sans dessin : ce fichier tourne aussi dans node (tests/).
   Les distances sont en pas, les durées en secondes, comme dans le moteur du Pisteur.
   (R) = décidé par Romain (§ 18.14) ; (C) = point de départ de Claude, à régler en jouant.
   ========================================================== */
(function (G) {
'use strict';

var REG = {
  salle: {L: 18, P: 10.5, coin: 3.4},        // (C, 27 nov.) 18 pas de large, 10,5 de profondeur (la v2 faisait 14 × 10 : « trop petite ») ; l'armure au fond (y = 0) ;
                                             // les deux coins du fond sont coupés en biais (3,4 pas) : c'est là que sont les portes des réparateurs
  armure: {x: 9, y: 1.25, r: 1.6},           // son pied ; on ne peut pas marcher dessus
  heros: {pv: 100, r: 0.35, vit: 3.6, x: 9, y: 8.4},   // (R) la course du Pisteur : 3,6 pas par seconde
  glace: {lance: 1.5, degat: 10},            // (R) le javelot de glace : 1,5 s sur place, 10 points
  feu: {lance: 3, degat: 50},                // (R) la boule de feu : 3 s sur place, 50 points
  soin: {lance: 2, rend: 50},                // (R) 2 s sur place, +50
  saut: {L: 3, dur: 0.32},                   // (R) 3 pas, comme le Pisteur ; la recharge est dans les réglages
  tir: {vit: 10},                            // (C) les sorts volent à 10 pas par seconde
  bouge: 0.25,                               // (C) au-delà de ce petit coup de pouce, on bouge (et le sort est coupé)
  gros: 60,                                  // (R) un gros coup : 60 ; rien ne tue d'un coup
  rythme: 4,                                 // (R) une attaque toutes les 4 s
  crepite: {annonce: 3},                     // (R) une moitié de la salle crépite 3 s, puis explose
  colonnes: {n: [6, 7], ombre: 2, r: 0.6, haut: 1.15, maxi: 14, ecart: 2.3},   // les ROCHERS qui tombent du plafond (R, 27 nov. : « à peu près la taille d'un homme, il faut qu'il se baisse ») ; 6 ou 7, ombre 2 s, 14 au plus ; (C) 1,2 pas de large, 1,15 de haut, un chemin libre
  vague: {annonce: 2, traverse: 1.5, flammes: 3, tic: 30},          // (R)
  rep: {vit: 1.05, portes: [[2.35, 2.35], [15.65, 2.35]], rend: 50, arrive: 2.15},   // les portes dans les murs en biais du fond, à gauche et à droite   // (R) ~5 s jusqu'à l'armure ; un sort rapide le casse
  main: {leve: 1, givre: 10, braise: 6, ralenti: 0.4, braiseParSec: 5},  // (R) givre : 10 s, 60 % plus lent ; pierre brûlante : 6 s, 5 par seconde
  orbe: {zone: [4.5, 13.5, 2.95, 5.0], chute: 0.6, meche: 10, degat: 20, prise: 0.75, depot: 1.15, fois: 2, bonus: 15},  // (R)
  lanternes: {or: [1.2, 5.6], rouge: [16.8, 5.6]},                // (R) la dorée à gauche, la rouge à droite, jamais changées
  socle: 0.55,                               // le socle d'une lanterne : on ne passe pas dessus
  doigts: {n: 5, ecart: 30, ecartRayon: 12, evite: 17, annonce: 2, demi: 0.45},   // (R, 27 nov.) pendant le rayon : la main se resserre (12°) et aucun doigt sur le rayon (17° de marge)
                // (R) cinq lignes, 2 s ; (C) 30° entre deux lignes, 0,9 pas de large
  rayon: {tous: 15, grace: 3, dure: 8, brule: 15, soigne0: 5, monte: 5, soigneMax: 45, demi: 0.5},   // (R) 15 par seconde dedans ; (R, 27 nov.) il soigne peu au début, puis de plus en plus (5, puis +5 par seconde non coupée, jusqu'à 45 par seconde : 200 points s'il n'est jamais coupé) ; (C) dure 8 s
  coque: {tous: [15, 20], pv: 50, dure: 8},                          // (R) 50 points en 8 s ; (C) toutes les 15 à 20 s
  danse: {tous: 60, dure: 20, n: 5, r0: 2.2, w: 1.9, alerte: 0.6, degat: 30, premiere: 40},   // (R) 1 par minute, 20 s, 30 par anneau ; (C) 5 anneaux
  crevasse: {tous: 30, maxi: 3, large: 1.4, long: [5, 8], annonce: 1.5, premiere: 8, entreLanternes: 2},   // (R) 3 au plus ; (C) toutes les 30 s
  mort: {attente: 10, intouchable: 4},       // (R)
  bulle: {de: 4, a: 2},                      // (R) sous la bulle : de 4 s à 2 s entre deux attaques
  ralentiForce: 0.3,                         // (R) le ralenti pour taper le code, devant
  transfo: 2.2, explose: 3.2
};

var SYMS = ['🌙', '⭐', '☀️', '🔑', '🍄', '🐟', '🌳', '🔔', '🎩', '❤️', '🔥', '🐱'];

var DEFAUT = {
  saut: 1.5,      // (R : « mouais ») la recharge du saut : 0,5 | 1,5 | 3 s
  accel: 4,       // (R) minutes pour passer de 4 s à 2 s sous la bulle : 2 | 4
  pisteur: 30,    // le faux Pisteur crie son code N s après le symbole ; 0 = au bouton seulement
  ralenti: 5,     // secondes de ralenti pour taper le code : 3 | 5 | 8
  vie: 1000,      // (R) la vie de chaque tiers ; 400 pour essayer vite
  aides: true,
  role: 'barde'
};

function hasard(graine) {
  var s = (graine >>> 0) || 1;
  return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 1000000) / 1000000; };
}
function d2(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function distSeg(px, py, ax, ay, bx, by) {
  var vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy, u = l ? ((px - ax) * vx + (py - ay) * vy) / l : 0;
  u = Math.max(0, Math.min(1, u));
  return Math.hypot(px - (ax + u * vx), py - (ay + u * vy));
}

function nouvelle(reglages, graine) {
  var reg = {};
  for (var k in DEFAUT) reg[k] = (reglages && reglages[k] !== undefined) ? reglages[k] : DEFAUT[k];
  var H = REG.heros;
  var S = {
    reg: reg, rnd: hasard(graine || 777),
    t: 0, reel: 0, tiers: 1, phase: 'combat',
    vie: reg.vie, vieMax: reg.vie, reserve: 0,
    h: {x: H.x, y: H.y, pv: H.pv, dx: 0, dy: -1, lance: null, saut: null, sautT: 0, mort: 0, intouchable: 0, coupe: 0,
        bonus: 0, orbe: null, flammeT: 0, lent: false, bouge: false},
    cible: null,
    prochaine: 2.5, derniers: [], forcer: null,
    colonnes: [], ombres: [], crepite: null, vague: null, main: null, orbe: null,
    doigts: [], rayon: null, coque: null, danse: null, crevasses: [], fentes: [],
    t3: {rayon: 13, coque: 17, danse: REG.danse.premiere, crev: REG.crevasse.premiere},
    reps: [], tirs: [], taches: [],
    bulleT: 0, symbole: null, cri: null, pisteurT: 0,
    code: {ouvert: false, saisie: [], ralenti: 0},
    transfoT: 0, lent: 1, debutTiers: 0,
    stats: {tiers: [], morts: 0, soins: 0, glaces: 0, feux: 0, coupes: 0, coups: {}, reparesPV: 0, orbesBonnes: 0, orbesRatees: 0, contres: 0, mauvaisCodes: 0},
    evts: []
  };
  return S;
}
function evt(S, type, o) { o = o || {}; o.type = type; o.t = S.reel; S.evts.push(o); if (S.evts.length > 80) S.evts.shift(); }
function dernier(S, type, depuis) { for (var i = S.evts.length - 1; i >= 0; i--) { var e = S.evts[i]; if (S.reel - e.t > depuis) return null; if (e.type === type) return e; } return null; }

/* ============ le héros prend des coups ============ */
function vivant(S) { return S.h.mort <= 0; }
function blesser(S, n, source, gros) {
  var h = S.h;
  if (h.mort > 0 || h.intouchable > 0 || S.phase === 'explose' || S.phase === 'fini' || S.phase === 'transfo') return false;
  h.pv -= n; h.coupe = gros ? 0.45 : Math.max(h.coupe, 0.18);
  S.stats.coups[source] = (S.stats.coups[source] || 0) + n;
  if (gros && h.lance) { h.lance = null; S.stats.coupes++; evt(S, 'sortCoupe', {par: source}); }   // (R) un gros coup interrompt ; les dégâts continus, non
  evt(S, gros ? 'aie' : 'brule', {n: n, source: source});
  if (h.pv <= 0) mourir(S);
  return true;
}
function mourir(S) {
  var h = S.h;
  h.pv = 0; h.mort = REG.mort.attente; h.lance = null; h.saut = null;
  if (h.orbe) { var o = h.orbe; o.porte = false; o.x = h.x; o.y = h.y; h.orbe = null; }
  S.stats.morts++;
  if (S.code.ouvert) fermerCode(S);
  evt(S, 'mort', {x: h.x, y: h.y});
}
function relever(S) {
  var h = S.h, p = placeLibre(S, REG.heros.x, REG.heros.y);
  h.x = p[0]; h.y = p[1]; h.pv = REG.heros.pv; h.intouchable = REG.mort.intouchable;
  evt(S, 'releve');
}
function placeLibre(S, x, y) {
  for (var r = 0; r < 6; r += 0.4) for (var a = 0; a < 12; a++) {
    var px = x + Math.cos(a / 12 * Math.PI * 2) * r, py = y + Math.sin(a / 12 * Math.PI * 2) * r;
    if (libreEn(S, px, py, REG.heros.r)) return [px, py];
  }
  return [x, y];
}

/* ============ les obstacles ============ */
function dansSalle(x, y, r) { var L = REG.salle, c = L.coin + r * Math.SQRT2; return x >= r && x <= L.L - r && y >= r && y <= L.P - r && x + y >= c && L.L - x + y >= c; }
function libreEn(S, x, y, r) {
  if (!dansSalle(x, y, r)) return false;
  var A = REG.armure;
  if (d2(x, y, A.x, A.y) < A.r + r) return false;
  for (var i = 0; i < S.colonnes.length; i++) if (d2(x, y, S.colonnes[i].x, S.colonnes[i].y) < REG.colonnes.r + r) return false;
  if (d2(x, y, REG.lanternes.or[0], REG.lanternes.or[1]) < REG.socle + r || d2(x, y, REG.lanternes.rouge[0], REG.lanternes.rouge[1]) < REG.socle + r) return false;
  for (i = 0; i < S.crevasses.length; i++) { var c = S.crevasses[i]; if (distSeg(x, y, c.ax, c.ay, c.bx, c.by) < REG.crevasse.large / 2 + r) return false; }
  return true;
}
// pousse le héros hors des obstacles (murs, colonnes, armure, crevasses ; sauf les crevasses pendant un saut)
function pousser(S, o, r, enSaut) {
  var L = REG.salle, A = REG.armure;
  for (var pass = 0; pass < 3; pass++) {
    o.x = Math.max(r, Math.min(L.L - r, o.x)); o.y = Math.max(r, Math.min(L.P - r, o.y));
    var g = (o.x + o.y - L.coin) / Math.SQRT2 - r; if (g < 0) { o.x -= g / Math.SQRT2; o.y -= g / Math.SQRT2; }          // les murs en biais
    var dd = (L.L - o.x + o.y - L.coin) / Math.SQRT2 - r; if (dd < 0) { o.x += dd / Math.SQRT2; o.y -= dd / Math.SQRT2; }
    var dx = o.x - A.x, dy = o.y - A.y, d = Math.hypot(dx, dy), m = A.r + r;
    if (d < m) { if (d < 1e-6) { dx = 0; dy = 1; d = 1; } o.x = A.x + dx / d * m; o.y = A.y + dy / d * m; }
    for (var i = 0; i < S.colonnes.length; i++) {
      var c = S.colonnes[i]; dx = o.x - c.x; dy = o.y - c.y; d = Math.hypot(dx, dy); m = REG.colonnes.r + r;
      if (d < m) { if (d < 1e-6) { dx = 0; dy = 1; d = 1; } o.x = c.x + dx / d * m; o.y = c.y + dy / d * m; }
    }
    [REG.lanternes.or, REG.lanternes.rouge].forEach(function (l) {
      var ex = o.x - l[0], ey = o.y - l[1], e = Math.hypot(ex, ey), mm = REG.socle + r;
      if (e < mm) { if (e < 1e-6) { ex = 1; ey = 0; e = 1; } o.x = l[0] + ex / e * mm; o.y = l[1] + ey / e * mm; }
    });
    if (!enSaut) for (i = 0; i < S.crevasses.length; i++) {
      var k = S.crevasses[i], vx = k.bx - k.ax, vy = k.by - k.ay, l = vx * vx + vy * vy;
      var u = Math.max(0, Math.min(1, ((o.x - k.ax) * vx + (o.y - k.ay) * vy) / l)), qx = k.ax + u * vx, qy = k.ay + u * vy;
      dx = o.x - qx; dy = o.y - qy; d = Math.hypot(dx, dy); m = REG.crevasse.large / 2 + r;
      if (d < m) { if (d < 1e-6) { dx = -vy; dy = vx; d = Math.hypot(dx, dy); } o.x = qx + dx / d * m; o.y = qy + dy / d * m; }
    }
  }
}
function dansCrevasse(S, x, y, r) {
  for (var i = 0; i < S.crevasses.length; i++) { var c = S.crevasses[i]; if (distSeg(x, y, c.ax, c.ay, c.bx, c.by) < REG.crevasse.large / 2 + r) return c; }
  return null;
}

/* ============ les quatre boutons ============ */
function peutAgir(S) { var h = S.h; return h.mort <= 0 && !S.code.ouvert && !h.saut && S.phase !== 'explose' && S.phase !== 'fini' && S.phase !== 'transfo'; }
// (R) lancer, c'est rester sur place : on ne commence pas en bougeant, et bouger coupe le sort
function lancer(S, quoi) {
  var h = S.h;
  if (!peutAgir(S)) return false;
  if (h.bouge) { evt(S, 'bougeEncore'); return false; }
  if (quoi === 'soin' && h.pv >= REG.heros.pv) return false;
  if (h.lance && h.lance.quoi === quoi) return false;
  var dur = quoi === 'glace' ? REG.glace.lance : quoi === 'feu' ? REG.feu.lance : REG.soin.lance;
  h.lance = {quoi: quoi, t: 0, dur: dur};
  evt(S, 'lance', {quoi: quoi});
  return true;
}
function sauter(S, dx, dy) {
  var h = S.h;
  if (!peutAgir(S) || h.sautT > 0) return false;
  var n = Math.hypot(dx, dy);
  if (n < 0.1) { dx = h.dx; dy = h.dy; n = Math.hypot(dx, dy) || 1; }
  dx /= n; dy /= n;
  if (h.lance) { h.lance = null; evt(S, 'sortCoupe', {par: 'saut'}); }
  // (R) un saut qui ne peut pas atteindre l'autre côté d'une crevasse s'arrête au bord
  var L = REG.saut.L, r = REG.heros.r, fin = L;
  for (var s = L; s >= 0; s -= 0.05) { if (!dansCrevasse(S, h.x + dx * s, h.y + dy * s, r)) { fin = s; break; } }
  if (fin < L) { // le bout tombe dans une crevasse : on recule jusqu'au bord le plus proche du départ
    for (s = 0; s <= L; s += 0.05) { if (dansCrevasse(S, h.x + dx * (s + 0.05), h.y + dy * (s + 0.05), r)) { fin = s; break; } }
    var finLoin = -1;
    for (s = L; s >= 0; s -= 0.05) { if (!dansCrevasse(S, h.x + dx * s, h.y + dy * s, r)) { finLoin = s; break; } }
    if (finLoin > fin + 0.4 && finLoin <= L) fin = finLoin;
  }
  h.saut = {x0: h.x, y0: h.y, dx: dx, dy: dy, L: fin, t: 0};
  h.sautT = S.reg.saut; h.dx = dx; h.dy = dy;
  evt(S, 'saut');
  return true;
}
function viser(S, x, y) { // on touche un réparateur pour le prendre pour cible ; ailleurs, la cible revient sur l'armure
  var best = null, bd = 1.5;
  S.reps.forEach(function (p) { var d = d2(x, y, p.x, p.y); if (d < bd) { bd = d; best = p; } });
  S.cible = best;
  if (best) evt(S, 'cible');
  return !!best;
}
function finirSort(S) {
  var h = S.h, l = h.lance; h.lance = null;
  if (l.quoi === 'soin') { h.pv = Math.min(REG.heros.pv, h.pv + REG.soin.rend); S.stats.soins++; evt(S, 'soigne'); return; }
  if (l.quoi === 'glace') S.stats.glaces++; else S.stats.feux++;
  var c = S.cible && S.reps.indexOf(S.cible) >= 0 ? S.cible : null;
  S.tirs.push({x: h.x, y: h.y, quoi: l.quoi, cible: c, fort: h.bonus > 0});
  evt(S, 'tir', {quoi: l.quoi});
}

/* ============ les sorts en vol ============ */
function avancerTirs(S, dt) {
  var A = REG.armure, v = REG.tir.vit * dt;
  for (var i = S.tirs.length - 1; i >= 0; i--) {
    var s = S.tirs[i], tx, ty;
    if (s.cible && S.reps.indexOf(s.cible) >= 0) { tx = s.cible.x; ty = s.cible.y; } else { s.cible = null; tx = A.x; ty = A.y; }
    var dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy), nx = s.x + (d > v ? dx / d * v : dx), ny = s.y + (d > v ? dy / d * v : dy);
    // (R) les colonnes bloquent les sorts : le feu ou le givre reste collé sur la pierre
    var bloque = null;
    for (var j = 0; j < S.colonnes.length; j++) { var c = S.colonnes[j]; if (distSeg(c.x, c.y, s.x, s.y, nx, ny) < REG.colonnes.r) { bloque = c; break; } }
    if (bloque) { S.tirs.splice(i, 1); S.taches.push({col: bloque, quoi: s.quoi, t: S.reel}); evt(S, 'surColonne', {x: bloque.x, y: bloque.y, quoi: s.quoi}); continue; }
    s.x = nx; s.y = ny;
    var arrive = s.cible ? d2(s.x, s.y, tx, ty) < 0.3 : d2(s.x, s.y, A.x, A.y) < A.r + 0.1;
    if (!arrive) continue;
    S.tirs.splice(i, 1);
    var n = (s.quoi === 'glace' ? REG.glace.degat : REG.feu.degat) * (s.fort ? REG.orbe.fois : 1);
    if (s.cible) { casserRep(S, s.cible, n); continue; }
    toucherArmure(S, s, n);
  }
}
function toucherArmure(S, s, n) {
  // (R) le bon sort contre la main : la boule de feu fait fondre le givre, le javelot de glace refroidit la pierre
  var m = S.main;
  if (m && !m.fini && ((m.type === 'givre' && s.quoi === 'feu') || (m.type === 'braise' && s.quoi === 'glace'))) {
    m.fini = true; S.main = null; S.stats.contres++; evt(S, 'contre', {main: m.type});
  }
  if (S.phase !== 'combat') { evt(S, 'surBulle', {quoi: s.quoi}); return; }
  if (S.coque) { S.coque.pv -= n; evt(S, 'surCoque', {n: n}); if (S.coque.pv <= 0) { S.coque = null; evt(S, 'coqueCassee'); } return; }
  S.vie = Math.max(0, S.vie - n);
  evt(S, 'touche', {n: n, quoi: s.quoi});
  if (S.vie <= 0) entrerBulle(S);
}

/* ============ les réparateurs (le chemin autour des colonnes) ============ */
var GR = 0.5, GW = Math.ceil(REG.salle.L / GR), GH = Math.ceil(REG.salle.P / GR);
function carte(S) { // la distance à l'armure, case par case, en contournant les colonnes
  var D = new Float32Array(GW * GH).fill(1e9), file = [], A = REG.armure;
  function bloque(i, j) { var x = (i + 0.5) * GR, y = (j + 0.5) * GR;
    if (!dansSalle(x, y, 0.2)) return true;
    for (var k = 0; k < S.colonnes.length; k++) if (d2(x, y, S.colonnes[k].x, S.colonnes[k].y) < REG.colonnes.r + 0.3) return true;
    if (d2(x, y, REG.lanternes.or[0], REG.lanternes.or[1]) < REG.socle + 0.3 || d2(x, y, REG.lanternes.rouge[0], REG.lanternes.rouge[1]) < REG.socle + 0.3) return true;
    return false; }
  for (var j = 0; j < GH; j++) for (var i = 0; i < GW; i++) {
    var x = (i + 0.5) * GR, y = (j + 0.5) * GR;
    if (d2(x, y, A.x, A.y) < REG.rep.arrive) { D[j * GW + i] = 0; file.push(j * GW + i); }
  }
  var B = new Uint8Array(GW * GH); for (j = 0; j < GH; j++) for (i = 0; i < GW; i++) B[j * GW + i] = bloque(i, j) ? 1 : 0;
  for (var q = 0; q < file.length; q++) {
    var c = file[q], ci = c % GW, cj = (c / GW) | 0;
    for (var di = -1; di <= 1; di++) for (var dj = -1; dj <= 1; dj++) {
      if (!di && !dj) continue;
      var ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      var n = nj * GW + ni; if (B[n]) continue;
      var nd = D[c] + (di && dj ? 1.414 : 1);
      if (nd < D[n]) { D[n] = nd; file.push(n); }
    }
  }
  S.carte = D; S.carteN = S.colonnes.length + ':' + S.colonnes.map(function (c) { return c.x.toFixed(1); }).join(',');
}
function avancerReps(S, dt) {
  if (!S.reps.length) return;
  var cle = S.colonnes.length + ':' + S.colonnes.map(function (c) { return c.x.toFixed(1); }).join(',');
  if (!S.carte || S.carteN !== cle) carte(S);
  var A = REG.armure, v = REG.rep.vit * dt;
  for (var k = S.reps.length - 1; k >= 0; k--) {
    var p = S.reps[k];
    if (d2(p.x, p.y, A.x, A.y) < REG.rep.arrive + 0.05) {
      // (R) il rend 50 points à l'armure puis s'en va ; sous la bulle, les 50 points attendent le tiers suivant
      if (S.phase === 'combat') { var av = S.vie; S.vie = Math.min(S.vieMax, S.vie + REG.rep.rend); S.stats.reparesPV += S.vie - av; }
      else if (S.phase === 'bulle') { S.reserve += REG.rep.rend; S.stats.reparesPV += REG.rep.rend; }
      S.reps.splice(k, 1); if (S.cible === p) S.cible = null;
      evt(S, 'repare', {x: p.x, y: p.y}); continue;
    }
    var i = Math.max(0, Math.min(GW - 1, Math.floor(p.x / GR))), j = Math.max(0, Math.min(GH - 1, Math.floor(p.y / GR)));
    var best = null, bd = S.carte[j * GW + i];
    for (var di = -1; di <= 1; di++) for (var dj = -1; dj <= 1; dj++) {
      var ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      var dd = S.carte[nj * GW + ni]; if (dd < bd - 0.01) { bd = dd; best = [(ni + 0.5) * GR, (nj + 0.5) * GR]; }
    }
    var tx = best ? best[0] : A.x, ty = best ? best[1] : A.y;
    // quand rien ne gêne, il va tout droit (le chemin des cases ne sert qu'à contourner)
    if (!S.colonnes.some(function (c) { return distSeg(c.x, c.y, p.x, p.y, A.x, A.y) < REG.colonnes.r + 0.4; })) { tx = A.x; ty = A.y; }
    var dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy) || 1;
    p.dx = dx / d; p.dy = dy / d;
    p.x += dx / d * Math.min(v, d); p.y += dy / d * Math.min(v, d);
  }
}
function casserRep(S, p, n) {
  var i = S.reps.indexOf(p); if (i < 0) return;
  S.reps.splice(i, 1); if (S.cible === p) S.cible = null;
  evt(S, 'repCasse', {x: p.x, y: p.y});
}

/* ============ le tirage des attaques ============ */
function intervalle(S) {
  if (S.phase !== 'bulle') return REG.rythme;
  var B = REG.bulle, k = Math.min(1, S.bulleT / (S.reg.accel * 60));
  return B.de - (B.de - B.a) * k;   // (R) 4 s au départ, 3 s à mi-chemin, 2 s au bout
}
function eligibles(S) {
  var t = S.tiers, d = S.derniers, L = [];
  function pas3(x) { return !(d.length >= 2 && d[d.length - 1] === x && d[d.length - 2] === x); }   // (R) jamais trois fois de suite la même
  var debout = S.colonnes.length + S.ombres.length;
  if (t === 1 || t === 2) {
    if (debout <= REG.colonnes.maxi - REG.colonnes.n[0] && !S.ombres.length && pas3('colonnes')) L.push(['colonnes', 3]);
    if (S.colonnes.length && !S.vague && !S.ombres.length && pas3('vague')) L.push(['vague', 2]);   // (R) seulement s'il y a déjà des colonnes
  }
  if (t === 1) {
    if (!S.crepite && pas3('crepite')) L.push(['crepite', 3]);
    if (S.h.mort <= 0 && S.reps.length < 3 && pas3('reparateurs')) L.push(['reparateurs', 2]);   // (R) pas de nouveau réparateur pendant qu'on est mort
  }
  if (t === 2) {
    if (!S.main && pas3('main')) L.push(['main', 3]);          // (R) jamais les deux mains en même temps
    if (!S.orbe && pas3('orbe')) L.push(['orbe', 2]);          // (R) une seule orbe à la fois
  }
  return L;
}
function tirer(S) {
  if (S.tiers === 3) { lancerDoigts(S); return; }
  var L = eligibles(S), choix = null;
  if (S.forcer && L.some(function (e) { return e[0] === S.forcer; })) choix = S.forcer;
  S.forcer = null;
  if (!choix) {
    var tot = 0; L.forEach(function (e) { tot += e[1]; });
    if (!tot) return;
    var r = S.rnd() * tot;
    for (var i = 0; i < L.length; i++) { r -= L[i][1]; if (r <= 0) { choix = L[i][0]; break; } }
    choix = choix || L[L.length - 1][0];
  }
  S.derniers.push(choix); if (S.derniers.length > 4) S.derniers.shift();
  ({colonnes: lancerColonnes, vague: lancerVague, crepite: lancerCrepite, reparateurs: lancerReps, main: lancerMain, orbe: lancerOrbe})[choix](S);
  evt(S, 'attaque', {quoi: choix});
}

/* --- premier tiers --- */
function lancerCrepite(S) {
  var d = S.derniers.filter(function (x) { return x === 'crepite'; }).length;
  var c = S.rnd() < 0.5 ? 'g' : 'd', h = S.cotes || [];
  if (h.length >= 2 && h[h.length - 1] === h[h.length - 2]) c = h[h.length - 1] === 'g' ? 'd' : 'g';   // (C, accepté) jamais trois fois le même côté
  h.push(c); if (h.length > 4) h.shift(); S.cotes = h;
  S.crepite = {cote: c, t: 0};
}
function lancerColonnes(S) {
  var C = REG.colonnes, n = C.n[0] + (S.rnd() < 0.5 ? 1 : 0), place = REG.colonnes.maxi - S.colonnes.length;
  n = Math.min(n, place);
  var A = REG.armure, Lt = REG.lanternes, faites = 0;
  for (var essai = 0; essai < 400 && faites < n; essai++) {
    var x = 1.2 + S.rnd() * (REG.salle.L - 2.4), y = 2.7 + S.rnd() * (REG.salle.P - 3.5), ok = true;
    if (d2(x, y, A.x, A.y) < 3.4 || !dansSalle(x, y, C.r + 0.45)) ok = false;
    if (ok && (d2(x, y, Lt.or[0], Lt.or[1]) < 1.9 || d2(x, y, Lt.rouge[0], Lt.rouge[1]) < 1.9)) ok = false;
    if (ok && REG.rep.portes.some(function (q) { return d2(x, y, q[0], q[1]) < 1.6; })) ok = false;
    var tous = S.colonnes.concat(S.ombres);
    for (var i = 0; ok && i < tous.length; i++) if (d2(x, y, tous[i].x, tous[i].y) < C.ecart) ok = false;   // (R) toujours un chemin libre
    if (ok) { S.ombres.push({x: x, y: y, t: 0}); faites++; }
  }
}
function lancerVague(S) {
  var A = REG.armure, r = REG.colonnes.r;
  // (R) le feu contourne chaque colonne et se referme derrière : un abri de la taille d'une colonne, juste derrière elle
  var abris = S.colonnes.map(function (c) { var dx = c.x - A.x, dy = c.y - A.y, d = Math.hypot(dx, dy) || 1; return {x: c.x, y: c.y, ux: dx / d, uy: dy / d}; });
  var L = REG.salle, rMax = Math.max(d2(A.x, A.y, 0, L.P), d2(A.x, A.y, L.L, L.P));
  S.vague = {t: 0, abris: abris, rMax: rMax};
}
function lancerReps(S) {
  var n = S.rnd() < 0.5 ? 1 : 2, P = REG.rep.portes, k = S.rnd() < 0.5 ? 0 : 1;
  for (var i = 0; i < n; i++) { var p = P[(k + i) % 2]; S.reps.push({x: p[0], y: p[1], rouge: 0}); }
}
/* --- deuxième tiers --- */
function lancerMain(S) {
  var type = S.rnd() < 0.5 ? 'givre' : 'braise';
  if (S.derniereMain === type && S.rnd() < 0.6) type = type === 'givre' ? 'braise' : 'givre';
  S.derniereMain = type;
  S.main = {type: type, t: 0, cx: null, cy: null};
}
function lancerOrbe(S) {
  var Z = REG.orbe.zone, x, y;
  for (var e = 0; e < 50; e++) { x = Z[0] + S.rnd() * (Z[1] - Z[0]); y = Z[2] + S.rnd() * (Z[3] - Z[2]); if (libreEn(S, x, y, 0.3)) break; }
  S.orbe = {x: x, y: y, couleur: S.rnd() < 0.5 ? 'or' : 'rouge', t: 0, porte: false};   // (R) la couleur au hasard
}
/* --- troisième tiers --- */
function angleRayon(S) { var A = REG.armure, l = REG.lanternes[S.rayon.couleur]; return Math.atan2(l[1] - A.y, l[0] - A.x) * 180 / Math.PI; }
function lancerDoigts(S) {
  var D = REG.doigts, a0 = 15 + S.rnd() * 30, lignes = [], ec = D.ecart;
  if (S.rayon) {   // (R, 27 nov.) « quand il y a le rayon, tu resserres la main » ; « sur le rayon, il n'y a pas de doigt »
    ec = D.ecartRayon;
    var b = angleRayon(S), h = S.h, A = REG.armure, vise = Math.atan2(h.y - A.y, h.x - A.x) * 180 / Math.PI, ok = [];
    for (var a = 8; a + 4 * ec <= 172; a += 1) {
      var bon = true; for (var j = 0; j < D.n; j++) if (Math.abs(a + j * ec - b) < D.evite) bon = false;
      if (bon) ok.push(a);
    }
    // le milieu de l'éventail vers le héros, à peu près (sauf s'il est dans le rayon : là, il est à l'abri des doigts)
    ok.sort(function (p, q) { return Math.abs(p + 2 * ec - vise) - Math.abs(q + 2 * ec - vise); });
    a0 = ok.length ? ok[Math.floor(S.rnd() * Math.min(ok.length, 22))] : 30;
  }
  for (var i = 0; i < D.n; i++) lignes.push((a0 + i * ec) * Math.PI / 180);
  S.doigts.push({lignes: lignes, t: 0});
  evt(S, 'attaque', {quoi: 'doigts'});
}
function lancerRayon(S) {
  if (S.h.mort > 0) return false;   // (R, 27 nov.) « quand on est mort, il n'y a plus de rayon » (sinon : double peine)
  var c = S.rnd() < 0.5 ? 'or' : 'rouge';   // (R) une seule lanterne, au hasard
  S.rayon = {couleur: c, t: 0, coupe: false, chauffe: 0, soigne: 0};
  evt(S, 'attaque', {quoi: 'rayon'});
  return true;
}
function forceRayon(ry) { var RY = REG.rayon; return Math.min(RY.soigneMax, RY.soigne0 + RY.monte * ry.chauffe); }
function lancerCoque(S) { S.coque = {pv: REG.coque.pv, t: 0}; evt(S, 'attaque', {quoi: 'coque'}); }
function lancerDanse(S) {
  S.danse = {t: 0, k: 0, st: 0, motif: [0, 1, 2, 3, 4, 3, 2, 1, 0], explose: false};
  S.doigts = []; S.coque = null; S.rayon = null;   // (R) la danse arrive toute seule
  evt(S, 'attaque', {quoi: 'danse'});
}
function lancerCrevasse(S) {
  var C = REG.crevasse, A = REG.armure, Lt = REG.lanternes;
  if (S.crevasses.length + S.fentes.length >= C.maxi) return;
  for (var e = 0; e < 200; e++) {
    var cx = 1.8 + S.rnd() * (REG.salle.L - 3.6), cy = 3 + S.rnd() * (REG.salle.P - 4.2), a = S.rnd() * Math.PI, l = C.long[0] + S.rnd() * (C.long[1] - C.long[0]);
    var k = {ax: cx - Math.cos(a) * l / 2, ay: cy - Math.sin(a) * l / 2, bx: cx + Math.cos(a) * l / 2, by: cy + Math.sin(a) * l / 2, t: 0};
    if (!dansSalle(k.ax, k.ay, 0.6) || !dansSalle(k.bx, k.by, 0.6)) continue;
    if (distSeg(A.x, A.y, k.ax, k.ay, k.bx, k.by) < A.r + 1.4) continue;
    if (distSeg(Lt.or[0], Lt.or[1], k.ax, k.ay, k.bx, k.by) < 1.6 || distSeg(Lt.rouge[0], Lt.rouge[1], k.ax, k.ay, k.bx, k.by) < 1.6) continue;
    var gene = false, toutes = S.crevasses.concat(S.fentes);
    for (var i = 0; i < toutes.length && !gene; i++) {
      var o = toutes[i];
      if (Math.min(distSeg(o.ax, o.ay, k.ax, k.ay, k.bx, k.by), distSeg(o.bx, o.by, k.ax, k.ay, k.bx, k.by), distSeg(k.ax, k.ay, o.ax, o.ay, o.bx, o.by), distSeg(k.bx, k.by, o.ax, o.ay, o.bx, o.by)) < 2.2) gene = true;
    }
    if (gene) continue;
    // (C, accepté) jamais plus de deux crevasses à sauter pour aller d'une lanterne à l'autre
    var n = 0; toutes.concat([k]).forEach(function (o) { if (coupe(o, Lt.or[0], Lt.or[1], Lt.rouge[0], Lt.rouge[1])) n++; });
    if (n > C.entreLanternes) continue;
    S.fentes.push(k); evt(S, 'fente'); return;
  }
}
function coupe(o, x1, y1, x2, y2) { // le segment o croise-t-il le segment (x1,y1)-(x2,y2) ?
  function cote(ax, ay, bx, by, px, py) { return (bx - ax) * (py - ay) - (by - ay) * (px - ax); }
  var a = cote(x1, y1, x2, y2, o.ax, o.ay), b = cote(x1, y1, x2, y2, o.bx, o.by), c = cote(o.ax, o.ay, o.bx, o.by, x1, y1), d = cote(o.ax, o.ay, o.bx, o.by, x2, y2);
  return a * b < 0 && c * d < 0;
}

/* ============ chaque attaque avance ============ */
function avancerAttaques(S, dt) {
  var h = S.h, A = REG.armure;
  // les crépitements : une moitié de la salle
  if (S.crepite) {
    var c = S.crepite; c.t += dt;
    if (c.t >= REG.crepite.annonce) {
      evt(S, 'crepiteBoum', {cote: c.cote});
      if (h.mort <= 0 && (c.cote === 'g' ? h.x < REG.salle.L / 2 : h.x >= REG.salle.L / 2)) blesser(S, REG.gros, 'crepite', true);
      S.crepite = null;
    }
  }
  // les colonnes qui tombent
  for (var i = S.ombres.length - 1; i >= 0; i--) {
    var o = S.ombres[i]; o.t += dt;
    if (o.t < REG.colonnes.ombre) continue;
    S.ombres.splice(i, 1);
    var R = REG.colonnes.r;
    if (h.mort <= 0 && d2(h.x, h.y, o.x, o.y) < R + REG.heros.r * 0.6) blesser(S, REG.gros, 'colonne', true);
    for (var k = S.reps.length - 1; k >= 0; k--) if (d2(S.reps[k].x, S.reps[k].y, o.x, o.y) < R + 0.2) { evt(S, 'repEcrase', {x: S.reps[k].x, y: S.reps[k].y}); if (S.cible === S.reps[k]) S.cible = null; S.reps.splice(k, 1); }
    if (S.orbe && !S.orbe.porte && d2(S.orbe.x, S.orbe.y, o.x, o.y) < R + 0.35) {   // (R) l'orbe est projetée sur le côté
      var dx = S.orbe.x - o.x, dy = S.orbe.y - o.y, dd = Math.hypot(dx, dy);
      if (dd < 1e-3) { var an = S.rnd() * Math.PI * 2; dx = Math.cos(an); dy = Math.sin(an); dd = 1; } S.orbe.x = o.x + dx / dd * 1.9; S.orbe.y = o.y + dy / dd * 1.9;
      var p = {x: S.orbe.x, y: S.orbe.y}; pousser(S, p, 0.3); S.orbe.x = p.x; S.orbe.y = p.y; evt(S, 'orbeProjetee');
    }
    S.colonnes.push({x: o.x, y: o.y, nee: S.reel});
    var hp = {x: h.x, y: h.y}; pousser(S, hp, REG.heros.r); h.x = hp.x; h.y = hp.y;
    evt(S, 'colonneTombe', {x: o.x, y: o.y});
  }
  // la vague de flammes
  if (S.vague) {
    var v = S.vague, V = REG.vague; v.t += dt;
    S.reps.forEach(function (p) { if (brule(S, p.x, p.y)) p.rouge = 1; });   // (R) rouge vif, sans mourir
    if (h.mort <= 0 && brule(S, h.x, h.y) && !abrite(S, h.x, h.y)) {
      if (h.flammeT <= 0) { blesser(S, V.tic, 'flammes', false); h.flammeT = 1; }   // (R) 30 par seconde ; ça ne coupe pas les sorts
    }
    if (v.t >= V.annonce + V.traverse + V.flammes) {
      S.vague = null; S.colonnes = []; S.taches = [];   // (R) la vague détruit toutes les colonnes
      evt(S, 'colonnesDetruites');
      if (S.tiers <= 2) { S.forcer = 'colonnes'; S.prochaine = Math.min(S.prochaine, 0.3); }   // (R) à peine les flammes éteintes, les ombres arrivent
    }
  }
  if (h.flammeT > 0) h.flammeT -= dt;
  // les mains
  if (S.main) {
    var m = S.main, M = REG.main; m.t += dt;
    if (m.t >= M.leve && m.cx === null) { m.cx = h.x; m.cy = h.y; }   // (R) depuis nos pieds
    if (m.cx !== null) {
      var full = m.type === 'givre' ? M.givre : M.braise, Rm = rayonMain(m);
      var dedans = d2(h.x, h.y, m.cx, m.cy) < Rm;
      if (m.type === 'braise' && dedans && h.mort <= 0) { h.braise = (h.braise || 0) + M.braiseParSec * dt; if (h.braise >= 1) { var nb = Math.floor(h.braise); h.braise -= nb; blesser(S, nb, 'braise', false); } }
      if (m.t - M.leve >= full) {
        evt(S, m.type === 'givre' ? 'givreEclate' : 'braiseExplose');
        if (h.mort <= 0) blesser(S, REG.gros, m.type, true);
        S.main = null;
      }
    }
  }
  // l'orbe
  if (S.orbe) {
    var ob = S.orbe, O = REG.orbe, Lt = REG.lanternes; ob.t += dt;
    if (ob.porte) { ob.x = h.x; ob.y = h.y; }
    else if (ob.t > O.chute && h.mort <= 0 && d2(h.x, h.y, ob.x, ob.y) < O.prise) { ob.porte = true; h.orbe = ob; evt(S, 'orbePrise'); }
    if (ob.porte) {
      var bonne = Lt[ob.couleur], mauvaise = Lt[ob.couleur === 'or' ? 'rouge' : 'or'];
      if (d2(h.x, h.y, bonne[0], bonne[1]) < O.depot) { S.orbe = null; h.orbe = null; h.bonus = O.bonus; S.stats.orbesBonnes++; evt(S, 'orbeBonne', {couleur: ob.couleur}); }
      else if (d2(h.x, h.y, mauvaise[0], mauvaise[1]) < O.depot) { S.orbe = null; h.orbe = null; S.stats.orbesRatees++; evt(S, 'orbeExplose', {x: h.x, y: h.y}); blesser(S, O.degat, 'orbe', true); }
    }
    if (S.orbe && ob.t >= O.chute + O.meche) {   // (R) 10 s : elle explose, à travers les colonnes, 20 points
      S.orbe = null; h.orbe = null; S.stats.orbesRatees++; evt(S, 'orbeExplose', {x: ob.x, y: ob.y});
      blesser(S, O.degat, 'orbe', true);
    }
  }
  // les doigts
  for (i = S.doigts.length - 1; i >= 0; i--) {
    var dg = S.doigts[i]; dg.t += dt;
    if (!dg.boum && dg.t >= REG.doigts.annonce) {
      dg.boum = true; evt(S, 'doigtsBoum');
      if (h.mort <= 0 && surLigne(S, dg, h.x, h.y)) blesser(S, REG.gros, 'doigts', true);
    }
    if (dg.t >= REG.doigts.annonce + 0.45) S.doigts.splice(i, 1);
  }
  // le rayon d'une lanterne
  if (S.rayon) {
    var ry = S.rayon, RY = REG.rayon; ry.t += dt;
    var lx = REG.lanternes[ry.couleur];
    ry.coupe = h.mort <= 0 && distSeg(h.x, h.y, lx[0], lx[1], A.x, A.y) < RY.demi;
    if (ry.t >= RY.grace) {
      if (ry.coupe) { h.rayonAcc = (h.rayonAcc || 0) + RY.brule * dt; if (h.rayonAcc >= 1) { var nr = Math.floor(h.rayonAcc); h.rayonAcc -= nr; blesser(S, nr, 'rayon', false); } }
      else if (S.phase === 'combat') { var av = S.vie; S.vie = Math.min(S.vieMax, S.vie + forceRayon(ry) * dt); ry.chauffe += dt; ry.soigne += S.vie - av; }
    }
    if (h.mort > 0) { S.rayon = null; evt(S, 'rayonFin', {pourquoi: 'mort'}); }
    else if (ry.t >= RY.grace + RY.dure) { S.rayon = null; evt(S, 'rayonFin', {soigne: ry.soigne}); }
  }
  // la coque
  if (S.coque) {
    S.coque.t += dt;
    if (S.coque.t >= REG.coque.dure) { S.coque = null; evt(S, 'coqueExplose'); if (h.mort <= 0) blesser(S, REG.gros, 'coque', true); }
  }
  // la danse des anneaux
  if (S.danse) {
    var dz = S.danse, DZ = REG.danse; dz.t += dt; dz.st += dt;
    var T = DZ.dure / dz.motif.length;
    if (!dz.explose && dz.st >= T * DZ.alerte) {
      dz.explose = true; evt(S, 'anneauxBoum');
      if (h.mort <= 0 && anneau(h.x, h.y) !== dz.motif[dz.k]) blesser(S, DZ.degat, 'anneaux', true);
    }
    if (dz.st >= T) { dz.k++; dz.st = 0; dz.explose = false; if (dz.k >= dz.motif.length) { S.danse = null; S.prochaine = 1.5; evt(S, 'danseFin'); } }
  }
  // les crevasses qui s'ouvrent
  for (i = S.fentes.length - 1; i >= 0; i--) {
    var f = S.fentes[i]; f.t += dt;
    if (f.t >= REG.crevasse.annonce) {
      S.fentes.splice(i, 1); S.crevasses.push(f);
      var hp2 = {x: h.x, y: h.y}; pousser(S, hp2, REG.heros.r); h.x = hp2.x; h.y = hp2.y;   // on ne tombe pas : poussé au bord
      evt(S, 'crevasse');
    }
  }
}
function rayonMain(m) {
  if (m.cx === null) return 0;
  var M = REG.main, full = m.type === 'givre' ? M.givre : M.braise, L = REG.salle;
  var rMax = Math.max(d2(m.cx, m.cy, 0, 0), d2(m.cx, m.cy, L.L, 0), d2(m.cx, m.cy, 0, L.P), d2(m.cx, m.cy, L.L, L.P));
  return rMax * Math.min(1, (m.t - M.leve) / full);
}
function brule(S, x, y) { // la vague : ce point est-il en flammes maintenant ?
  var v = S.vague; if (!v) return false;
  var V = REG.vague, A = REG.armure, d = d2(x, y, A.x, A.y), k = Math.max(0, (d - A.r) / (v.rMax - A.r));
  var arrive = V.annonce + V.traverse * k;
  return v.t >= arrive && v.t < arrive + V.flammes;
}
// (R) « le feu contourne chaque colonne et se referme derrière elle : seule une zone de la taille d'une colonne reste à l'abri,
// juste derrière » : l'ombre du rocher vu depuis l'armure, collée à lui, qui se referme en pointe. Le dessin du feu se sert de la même
// fonction : ce qu'on voit à l'abri est exactement ce qui est à l'abri (la v2 avait des abris « un petit peu décalés »).
function dansAbri(ab, x, y, marge) {
  var r = REG.colonnes.r, dx = x - ab.x, dy = y - ab.y, le = dx * ab.ux + dy * ab.uy, tr = Math.abs(dx * ab.uy - dy * ab.ux);
  if (le < 0 || le > r * 2.7) return false;
  var w = le < r ? r : r * (1 - 0.5 * (le - r) / (r * 1.7));
  return tr < w + (marge || 0);
}
function abrite(S, x, y) {
  var v = S.vague; if (!v) return false;
  for (var i = 0; i < v.abris.length; i++) if (dansAbri(v.abris[i], x, y, REG.heros.r * 0.4)) return true;
  return false;
}
function surLigne(S, dg, x, y) {
  var A = REG.armure, L = 20;
  for (var i = 0; i < dg.lignes.length; i++) { var a = dg.lignes[i];
    if (distSeg(x, y, A.x, A.y, A.x + Math.cos(a) * L, A.y + Math.sin(a) * L) < REG.doigts.demi + REG.heros.r * 0.5) return true; }
  return false;
}
function anneau(x, y) {
  var D = REG.danse, A = REG.armure, d = d2(x, y, A.x, A.y);
  return Math.max(0, Math.min(D.n - 1, Math.floor((d - D.r0) / D.w)));
}

/* ============ la bulle, le symbole, le code ============ */
function entrerBulle(S) {
  S.phase = 'bulle'; S.bulleT = 0;
  S.symbole = SYMS[Math.floor(S.rnd() * SYMS.length)];
  S.cri = null; S.pisteurT = S.reg.pisteur > 0 ? S.reg.pisteur : Infinity;
  S.coque = null; S.rayon = null;   // (C) sous la bulle du troisième tiers : ni rayon ni coque (Grosbec ne peut plus perdre de vie)
  S.stats.tiers.push({symbole: S.t - S.debutTiers});
  evt(S, 'symbole', {sym: S.symbole});
}
function pisteurCrie(S) {
  if (S.phase !== 'bulle' || S.cri) return false;
  var c; do { c = [0, 0, 0].map(function () { return SYMS[Math.floor(S.rnd() * SYMS.length)]; }); } while (c[0] === c[1] && c[1] === c[2]);
  S.cri = c; evt(S, 'cri'); return true;
}
function ouvrirCode(S) {
  if (S.phase !== 'bulle' || S.h.mort > 0 || S.code.ouvert) return false;
  S.code.ouvert = true; S.code.saisie = []; S.code.ralenti = S.reg.ralenti;
  if (S.h.lance) S.h.lance = null;
  evt(S, 'codeOuvert'); return true;
}
function fermerCode(S) { if (!S.code.ouvert) return false; S.code.ouvert = false; S.code.saisie = []; S.code.ralenti = 0; return true; }
function effacer(S) { if (!S.code.ouvert || !S.code.saisie.length) return false; S.code.saisie.pop(); return true; }
function taper(S, sym) {
  var c = S.code; if (!c.ouvert || c.saisie.length >= 3) return false;
  c.saisie.push(sym);
  if (c.saisie.length === 3) {
    if (S.cri && c.saisie.join('') === S.cri.join('')) reussir(S);
    else { S.stats.mauvaisCodes++; c.ouvert = false; c.ralenti = 0; c.saisie = []; evt(S, 'codeFaux'); }
  }
  return true;
}
function reussir(S) {
  var c = S.code; c.ouvert = false; c.saisie = []; c.ralenti = 0.8;
  var st = S.stats.tiers[S.stats.tiers.length - 1]; if (st) st.code = S.t - S.debutTiers;
  S.crepite = null; S.ombres = []; S.vague = null; S.main = null; S.reps = []; S.tirs = []; S.doigts = []; S.danse = null; S.fentes = [];
  if (S.orbe && S.orbe.porte) S.h.orbe = null; S.orbe = null; S.cible = null;
  evt(S, 'codeBon', {tiers: S.tiers});
  if (S.tiers >= 3) { S.phase = 'explose'; S.transfoT = REG.explose; evt(S, 'explose'); }
  else { S.phase = 'transfo'; S.transfoT = REG.transfo; }
}
function tiersSuivant(S) {
  S.tiers++; S.phase = 'combat';
  S.vieMax = S.reg.vie + S.reserve; S.vie = S.vieMax; S.reserve = 0;   // (C, accepté) les réparateurs arrivés sous la bulle comptent maintenant
  S.symbole = null; S.cri = null; S.derniers = []; S.forcer = null; S.prochaine = 2;
  if (S.tiers === 3) { S.colonnes = []; S.taches = []; S.t3 = {rayon: 13, coque: 17, danse: REG.danse.premiere, crev: REG.crevasse.premiere}; }   // (R) rien ne reste des deux premiers tiers
  S.debutTiers = S.t;
  evt(S, 'tiers', {tiers: S.tiers});
}

/* ============ un pas de temps ============ */
// entree : {mx, my} la direction du pouce gauche dans la salle (longueur 0 à 1)
function pas(S, dtReel, entree) {
  entree = entree || {};
  dtReel = Math.min(0.05, Math.max(0, dtReel));
  S.reel += dtReel;
  var c = S.code; if (c.ralenti > 0) c.ralenti = Math.max(0, c.ralenti - dtReel);
  S.lent = c.ralenti > 0 ? REG.ralentiForce : 1;
  var dt = dtReel * S.lent; S.t += dt;
  var h = S.h, H = REG.heros;

  if (h.mort > 0) { h.mort -= dt; if (h.mort <= 0) { h.mort = 0; relever(S); } }
  if (h.intouchable > 0) h.intouchable = Math.max(0, h.intouchable - dt);
  if (h.coupe > 0) h.coupe = Math.max(0, h.coupe - dtReel);
  if (h.sautT > 0) h.sautT = Math.max(0, h.sautT - dt);
  if (h.bonus > 0) h.bonus = Math.max(0, h.bonus - dt);

  // le déplacement
  var mx = entree.mx || 0, my = entree.my || 0, m = Math.hypot(mx, my);
  if (m > 1) { mx /= m; my /= m; m = 1; }
  var vivantLibre = h.mort <= 0 && !c.ouvert && S.phase !== 'explose' && S.phase !== 'fini';
  h.bouge = vivantLibre && m > REG.bouge;
  if (h.bouge && h.lance) { h.lance = null; S.stats.coupes++; evt(S, 'sortCoupe', {par: 'bouge'}); }   // (R) bouger interrompt
  h.lent = !!(S.main && S.main.type === 'givre' && S.main.cx !== null && d2(h.x, h.y, S.main.cx, S.main.cy) < rayonMain(S.main));
  if (h.saut) {
    var sj = h.saut; sj.t += dt; var k = Math.min(1, sj.t / REG.saut.dur);
    var o = {x: sj.x0 + sj.dx * sj.L * k, y: sj.y0 + sj.dy * sj.L * k}; pousser(S, o, H.r, k < 1);
    h.x = o.x; h.y = o.y; if (k >= 1) h.saut = null;
  } else if (h.bouge) {
    var v = H.vit * (h.lent ? REG.main.ralenti : 1) * Math.min(1, (m - REG.bouge * 0.5) / 0.6);
    h.dx = mx / m; h.dy = my / m;
    var p = {x: h.x + h.dx * v * dt, y: h.y + h.dy * v * dt}; pousser(S, p, H.r); h.x = p.x; h.y = p.y;
  }
  // les sorts qu'on lance
  if (h.lance && h.mort <= 0) { h.lance.t += dt; if (h.lance.t >= h.lance.dur) finirSort(S); }

  if (S.phase === 'combat' || S.phase === 'bulle') {
    if (S.phase === 'bulle') {
      S.bulleT += dt;
      if (!S.cri) { S.pisteurT -= dtReel; if (S.pisteurT <= 0) pisteurCrie(S); }
    }
    // le tirage : une attaque toutes les 4 s (la vague et la danse prennent toute la place)
    if (!S.vague && !S.danse) {
      S.prochaine -= dt;
      if (S.prochaine <= 0) { tirer(S); S.prochaine = intervalle(S); }
    }
    if (S.tiers === 3 && !S.danse) {   // le troisième tiers : chaque chose à son heure
      var t3 = S.t3;
      t3.rayon -= dt; t3.coque -= dt; t3.danse -= dt; t3.crev -= dt;
      if (t3.danse <= 0) { lancerDanse(S); t3.danse = REG.danse.tous; }
      else {
        if (t3.rayon <= 0) {
          if (S.phase === 'combat' && !S.rayon && h.mort > 0) t3.rayon = 1;   // (R) pas de rayon pendant la mort : il attend qu'on soit revenu
          else { if (S.phase === 'combat' && !S.rayon) lancerRayon(S); t3.rayon = REG.rayon.tous - 2 + S.rnd() * 4; }
        }
        if (t3.coque <= 0) { if (S.phase === 'combat' && !S.coque) lancerCoque(S); var C = REG.coque.tous; t3.coque = C[0] + S.rnd() * (C[1] - C[0]); }
        if (t3.crev <= 0) { lancerCrevasse(S); t3.crev = REG.crevasse.tous; }
      }
    }
    avancerAttaques(S, dt);
    avancerReps(S, dt);
  } else if (S.phase === 'transfo') {
    S.transfoT -= dt; if (S.transfoT <= 0) tiersSuivant(S);
  } else if (S.phase === 'explose') {
    S.transfoT -= dt; if (S.transfoT <= 0) { S.phase = 'fini'; S.stats.total = S.t; evt(S, 'fini'); }
  }
  avancerTirs(S, dt);
  for (var i = S.taches.length - 1; i >= 0; i--) if (S.reel - S.taches[i].t > 2.5) S.taches.splice(i, 1);
}

// pour les essais
function aller(S, tiers) {
  S.tiers = tiers - 1; S.reserve = 0;
  S.crepite = null; S.ombres = []; S.vague = null; S.main = null; S.reps = []; S.tirs = []; S.doigts = []; S.danse = null; S.fentes = [];
  S.orbe = null; S.h.orbe = null; S.coque = null; S.rayon = null; S.crevasses = []; S.colonnes = []; S.cible = null;
  S.code.ouvert = false; S.code.ralenti = 0; S.h.mort = 0; S.h.pv = REG.heros.pv;
  tiersSuivant(S);
}
function symboleTout(S) { if (S.phase !== 'combat') return false; S.vie = 0; entrerBulle(S); return true; }

G.P2 = {
  REG: REG, SYMS: SYMS, DEFAUT: DEFAUT,
  nouvelle: nouvelle, pas: pas,
  lancer: lancer, sauter: sauter, viser: viser,
  ouvrirCode: ouvrirCode, fermerCode: fermerCode, taper: taper, effacer: effacer, pisteurCrie: pisteurCrie,
  aller: aller, symboleTout: symboleTout,
  brule: brule, abrite: abrite, dansAbri: dansAbri, forceRayon: forceRayon, surLigne: surLigne, anneau: anneau, rayonMain: rayonMain, dansCrevasse: dansCrevasse,
  libreEn: libreEn, intervalle: intervalle, d2: d2, distSeg: distSeg, dernier: dernier
};
})(typeof window !== 'undefined' ? window : globalThis);
