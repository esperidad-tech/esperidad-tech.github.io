/* ==========================================================
   GROSBEC DE LUMIÈRE (phase 3, version 4) : un géant fait d'énergie, en volume.
   Un pantin décrit dans l'espace, comme l'armure du combat du Pisteur : un squelette en 3D (il se tourne, se penche,
   plie les genoux, tend les bras ; les coudes et les genoux se placent tout seuls), puis, par-dessus, un corps de
   lumière rouge et or : des membres translucides avec leur « os » de lumière blanche, l'énergie qui coule dedans,
   des éclairs qui le parcourent, une crinière de flammes, deux anneaux d'énergie qui tournent autour de lui (devant et
   derrière son corps), une cape de lumière, le cœur qui bat, des braises qui montent.
   Un geste pour chaque chose qu'il fait (les éclairs, la grosse zone, la méga attaque, le tambour) et pour chaque chose
   qu'il reçoit (un coup juste sur chacune des six parties, un sort qui rebondit : il rit).
   Il est peint dans SA toile, 30 fois par seconde au plus, puis recopié à chaque image (la règle des vieilles tablettes).
   Unités : 50 pour un pas ; y vers le haut ; z vers nous.
   ========================================================== */
(function (G) {
'use strict';
var P3 = G.P3, REG = P3.REG, B = REG.grosbec;
var TAU = Math.PI * 2, U = 50, KV = 0.55;
var BOITE = {x0: -260, y0: -345, w: 520, h: 405};
var cv = null, g = null, kc = 1, dpr = 1, k = 1, tDessin = -9, V = {T: 40, ox: 0, oy: 0}, QUAL = 2, IPS = [15, 20, 26];   // la qualité : 2 (belle), 1, 0 (vieille tablette)
var P = null, R = null, J = null, PARTS = null, vuEvt = -1, vuEcl = -1, dernierMaj = 0, braises = [], arcsT = -9, arcs = [];
var file = [], flash = {}, rire = -9, coupT = -9, vict = -9, oubliZone = {};
function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
function mel(a, b, u) { return a + (b - a) * u; }
function doux(u) { u = cl(u, 0, 1); return u * u * (3 - 2 * u); }
function bruit(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function toile(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

/* ---------- les lueurs, peintes une fois ---------- */
var LUEURS = {};
function lueur(rgb, blanc) {
  var cle = rgb + '|' + blanc; if (LUEURS[cle]) return LUEURS[cle];
  var c = toile(128, 128), x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,' + blanc + ')'); gr.addColorStop(0.14, 'rgba(' + rgb + ',' + (0.6 + blanc * 0.35) + ')');
  gr.addColorStop(0.42, 'rgba(' + rgb + ',.22)'); gr.addColorStop(0.75, 'rgba(' + rgb + ',.05)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return (LUEURS[cle] = c);
}
function halo(x, y, r, rgb, a, blanc) { if (a <= 0.01 || r <= 0) return; g.globalAlpha = Math.min(1, a); g.drawImage(lueur(rgb, blanc === undefined ? 0.5 : blanc), x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; }

/* ---------- la pose : tout ce qui bouge ---------- */
var REPOS = {cap: 0, tors: 0, penche: 0.02, roulis: 0, bas: 0, flotte: 0, tete: 0, hoche: 0,
  gx: -84, gy: 22, gz: 26, dx: 84, dy: 22, dz: 26, go: 0.7, do_: 0.7,   // les mains (g : à gauche de l'écran), dans le repère du buste (depuis le bassin)
  piedG: 0, piedD: 0, ecart: 0, lum: 1, yeux: 1, bouche: 0, cape: 0, orbe: 0, poing: 0};
var VIT = {cap: 7, tors: 9, penche: 10, roulis: 9, bas: 11, flotte: 6, tete: 9, hoche: 10, gx: 14, gy: 14, gz: 14, dx: 14, dy: 14, dz: 14, go: 18, do_: 18,
  piedG: 14, piedD: 14, ecart: 10, lum: 12, yeux: 14, bouche: 16, cape: 4, orbe: 10, poing: 10};

/* le repère : le bassin (il se tourne de « cap »), le buste (il se tourne encore de « tors », se penche, roule), la tête */
function reperes(P) {
  var yb = P.cap + P.tors, cb = Math.cos(yb), sb = Math.sin(yb), cp = Math.cos(P.penche), sp = Math.sin(P.penche), cr = Math.cos(P.roulis), sr = Math.sin(P.roulis);
  var py = 112 + P.bas + P.flotte, ch = Math.cos(P.cap), sh = Math.sin(P.cap);
  function bu(x, y, z) { var x1 = x * cb + z * sb, z1 = -x * sb + z * cb, y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp; return [x1 * cr + y2 * sr, py + (-x1 * sr + y2 * cr), z2]; }
  function ha(x, y, z) { var x1 = x * ch + z * sh, z1 = -x * sh + z * ch; return [x1, py + y, z1]; }
  var ct = Math.cos(P.tete), st = Math.sin(P.tete), cn = Math.cos(P.hoche), sn = Math.sin(P.hoche);
  function te(x, y, z) { var x1 = x * ct + z * st, z1 = -x * st + z * ct, y2 = y * cn - z1 * sn, z2 = y * sn + z1 * cn; return bu(x1, 102 + y2, z2); }
  return {bu: bu, ha: ha, te: te, yb: yb, yt: yb + P.tete};
}
/* l'espace → la toile (en unités) : la même vue en biais que la salle */
function pr(q) { var p = 1 + q[2] * 0.0016; return [q[0] * p, (-q[1] + q[2] * KV) * p, p, q[2]]; }
function ik(A, H, a, b, pole) {   // deux os : où est le coude (ou le genou) ?
  var d = [H[0] - A[0], H[1] - A[1], H[2] - A[2]], L = Math.hypot(d[0], d[1], d[2]) || 1, Lc = cl(L, Math.abs(a - b) + 1, a + b - 0.5);
  d = d.map(function (v) { return v / L; });
  var m = (a * a - b * b + Lc * Lc) / (2 * Lc), hh = Math.sqrt(Math.max(0, a * a - m * m)), dp = pole[0] * d[0] + pole[1] * d[1] + pole[2] * d[2];
  var q = [pole[0] - d[0] * dp, pole[1] - d[1] * dp, pole[2] - d[2] * dp], ql = Math.hypot(q[0], q[1], q[2]) || 1; q = q.map(function (v) { return v / ql; });
  return [[A[0] + d[0] * m + q[0] * hh, A[1] + d[1] * m + q[1] * hh, A[2] + d[2] * m + q[2] * hh], [A[0] + d[0] * Lc, A[1] + d[1] * Lc, A[2] + d[2] * Lc]];
}

/* ---------- ses gestes : des images clés [quand, ce qui change] ; entre deux, tout glisse ---------- */
function geste(cles, t) {
  if (t < cles[0][0] || t > cles[cles.length - 1][0]) return null;
  var i = 0; while (i < cles.length - 2 && t > cles[i + 1][0]) i++;
  var a = cles[i], b = cles[i + 1], u = doux((t - a[0]) / Math.max(0.001, b[0] - a[0])), o = {}, kk;
  for (kk in a[1]) o[kk] = mel(a[1][kk], kk in b[1] ? b[1][kk] : REPOS[kk], u);
  for (kk in b[1]) if (!(kk in o)) o[kk] = mel(REPOS[kk], b[1][kk], u);
  return o;
}
function main(sd, x, y, z, o) { return sd < 0 ? {gx: x, gy: y, gz: z, go: o} : {dx: x, dy: y, dz: z, do_: o}; }
function fusion(a, b) { var o = {}, kk; for (kk in a) o[kk] = a[kk]; for (kk in b) o[kk] = b[kk]; return o; }
var GESTES = {
  // un éclair : la main part vers le héros, d'un coup sec, puis revient
  eclair: function (sd) { return [[0, {}], [0.09, fusion(main(sd, sd * 70, 70, 40, 0.2), {tors: -0.12 * sd, lum: 1.25})], [0.2, fusion(main(sd, sd * 46, 62, 108, 1), {tors: 0.06 * sd, penche: 0.07, lum: 1.4})], [0.62, {}]]; },
  // un coup juste, selon la partie touchée
  touche0: function () { return [[0, {hoche: -0.55, penche: -0.22, tete: 0.3, bas: -4, yeux: 0.2, bouche: 0.9, lum: 1.9}], [0.22, {hoche: -0.3, penche: -0.12, tete: -0.15, bouche: 0.6, yeux: 0.6}], [0.7, {}]]; },
  touche1: function () { return [[0, {penche: 0.42, bas: -14, hoche: 0.25, gx: -26, gy: 64, gz: 40, dx: 26, dy: 60, dz: 42, go: 0.2, do_: 0.2, bouche: 0.8, lum: 1.9, flotte: -4}], [0.3, {penche: 0.24, bas: -8, gx: -40, gy: 56, gz: 46, dx: 40, dy: 56, dz: 46}], [0.8, {}]]; },
  touche2: function () { return [[0, fusion(main(-1, -122, 92, -60, 1), {tors: 0.42, cap: 0.12, roulis: 0.08, tete: 0.4, bouche: 0.8, lum: 1.8})], [0.28, fusion(main(-1, -106, 60, -20, 0.5), {tors: 0.2, roulis: 0.04})], [0.75, {}]]; },
  touche3: function () { return [[0, fusion(main(1, 122, 92, -60, 1), {tors: -0.42, cap: -0.12, roulis: -0.08, tete: -0.4, bouche: 0.8, lum: 1.8})], [0.28, fusion(main(1, 106, 60, -20, 0.5), {tors: -0.2, roulis: -0.04})], [0.75, {}]]; },
  touche4: function () { return [[0, {piedG: 1, bas: -20, roulis: 0.16, penche: 0.12, tete: -0.2, hoche: 0.2, bouche: 0.7, lum: 1.8}], [0.34, {piedG: 0.4, bas: -10, roulis: 0.07}], [0.85, {}]]; },
  touche5: function () { return [[0, {piedD: 1, bas: -20, roulis: -0.16, penche: 0.12, tete: 0.2, hoche: 0.2, bouche: 0.7, lum: 1.8}], [0.34, {piedD: 0.4, bas: -10, roulis: -0.07}], [0.85, {}]]; },
  // un sort qui rebondit : il le chasse d'un revers de main, puis il rit (la tête en arrière, les épaules qui sautent)
  rebond: function (sd) { return [[0, fusion(main(sd, sd * 60, 84, 70, 1), {tors: 0.18 * sd})], [0.2, fusion(main(sd, sd * 112, 74, 30, 1), {tors: -0.12 * sd, hoche: -0.32, bouche: 0.7})],
    [0.5, {hoche: -0.38, bas: 3, bouche: 0.9, yeux: 1.6}], [0.65, {hoche: -0.3, bas: -3, bouche: 0.5}], [0.8, {hoche: -0.36, bas: 3, bouche: 0.9}], [0.95, {hoche: -0.28, bas: -2, bouche: 0.4}], [1.3, {}]]; },
  // il prend un coup de trop (le symbole) : il titube
  titube: function () { return [[0, {penche: 0.4, bas: -26, roulis: 0.18, hoche: 0.35, lum: 0.5, yeux: 0.3, gx: -60, gy: 10, gz: 50, dx: 70, dy: 40, dz: 20}], [0.7, {penche: 0.3, bas: -18, roulis: -0.1}], [1.6, {}]]; },
  // la fin : il se cambre, les bras ouverts, la lumière lui sort de partout ; puis il se défait en lumière
  chute: function () { return [[0, {penche: -0.1, bas: 4, hoche: -0.3, bouche: 1, yeux: 2.4, lum: 2.2, gx: -120, gy: 150, gz: 0, dx: 120, dy: 150, dz: 0, go: 1, do_: 1, flotte: 10}],
    [0.7, {penche: -0.3, bas: 10, hoche: -0.55, roulis: 0.05, bouche: 1, yeux: 3, lum: 2.8, gx: -140, gy: 170, gz: -10, dx: 140, dy: 170, dz: -10, go: 1, do_: 1, flotte: 22}],
    [2.4, {penche: 0.25, bas: -24, hoche: 0.4, roulis: -0.06, yeux: 0.4, lum: 1.6, gx: -70, gy: 20, gz: 50, dx: 70, dy: 20, dz: 50, go: 0.3, do_: 0.3, flotte: 6}]]; }
};
function jouer(nom, t0, arg) { file.push({nom: nom, t0: t0, cles: GESTES[nom](arg)}); if (file.length > 8) file.shift(); }

/* ---------- ce qu'il fait, d'après la partie : chaque tablette le calcule elle-même ---------- */
function posture(S, C, now) {
  var T = S.T, su = S.su;
  if (S.etat === 'film' || S.etat === 'go') { C.lum = 0.75; C.yeux = 0.8; return; }
  // (R) le tambour, à la fin du premier combat : accroupi, il frappe le sol des deux poings, l'un après l'autre
  if (S.combat === 1 && T >= REG.combat1.tenir) {
    var ph = (T - REG.combat1.tenir) * 3.2, cote = Math.floor(ph) % 2 ? 1 : -1, u = ph % 1, bas = u < 0.45 ? doux(u / 0.45) : 1 - doux((u - 0.45) / 0.55);
    C.bas = -34; C.penche = 0.42; C.flotte = 0; C.hoche = 0.1; C.yeux = 2; C.bouche = 0.6; C.lum = 1.5 + 0.3 * bas; C.go = 0; C.do_ = 0;
    var hy = 60 - 120 * bas, ho = 70 + 30 * (1 - bas);
    if (cote < 0) { C.gx = -50; C.gy = hy; C.gz = ho; C.dx = 60; C.dy = 70; C.dz = 70; C.roulis = 0.06 * bas; }
    else { C.dx = 50; C.dy = hy; C.dz = ho; C.gx = -60; C.gy = 70; C.gz = 70; C.roulis = -0.06 * bas; }
    return;
  }
  if (S.combat !== 2) return;
  // la grosse zone (tout le monde la voit venir, personne ne sait où) : il s'élève, ouvre les bras, l'énergie du sol monte dans ses mains,
  // il la serre contre lui en une boule, la lève, et l'abat sur le sol
  for (var i = 0; i < su.zones.length; i++) {
    var z = su.zones[i]; if (z.tA > T) break;
    if (T >= z.tI + 1.1 || oubliZone[z.id]) continue;
    var u2 = (T - z.tA) / (z.tI - z.tA);
    if (u2 < 1) {
      var a = doux(u2 / 0.25), b = doux((u2 - 0.62) / 0.24), c = doux((u2 - 0.88) / 0.12);
      C.flotte = 22 * a * (1 - c); C.penche = -0.1 * a + 0.25 * b - 0.05 * c; C.hoche = -0.25 * a + 0.2 * b; C.yeux = 1.3 + 0.9 * u2; C.lum = 1.1 + 0.6 * u2; C.cape = a;
      C.go = C.do_ = 1 - 0.8 * b; C.orbe = b * (1 - c * 0.3) + 0.25 * a * (1 - b);
      C.gx = mel(mel(-84, -150, a), -22, b); C.gy = mel(mel(22, 112, a), 70, b); C.gz = mel(mel(26, 0, a), 70, b);
      C.dx = -C.gx; C.dy = C.gy; C.dz = C.gz;
      if (c > 0) { C.gx = mel(C.gx, -26, c); C.gy = mel(C.gy, 150, c); C.gz = mel(C.gz, 40, c); C.dx = -C.gx; C.dy = C.gy; C.dz = C.gz; C.poing = c; }
    } else {   // l'impact : il s'abat, accroupi, les poings au sol
      var v = (T - z.tI) / 1.1, f = 1 - doux(v);
      C.bas = -40 * f; C.penche = 0.5 * f; C.hoche = 0.15 * f; C.gx = -30; C.gy = mel(30, -70, f); C.gz = mel(30, 90, f); C.dx = 30; C.dy = C.gy; C.dz = C.gz; C.go = C.do_ = 0; C.lum = 1 + 0.9 * f; C.yeux = 1 + f;
    }
    break;
  }
  // la méga attaque, seulement sur la tablette de celui qui prévient (R) : il montre sa cible du doigt, la boule grossit au bout
  var mg = null;
  for (var j = 0; j < su.megas.length; j++) { var m = su.megas[j]; if (m.tA > T) break; if (T < m.tI && m.donneur === S.moi && P3.vivant(S)) mg = m; }
  if (mg) {
    var a2 = S.amis[mg.cible], dxh = a2 ? a2.x - B.x : 0, dzh = a2 ? a2.y - B.y : 3, sd = dxh < 0 ? -1 : 1, w = doux((T - mg.tA) / 0.5), ch = (T - mg.tA) / (mg.tI - mg.tA);
    var vx = dxh * U - sd * 60, vy = -(112 + 92), vz = dzh * U, vl = Math.hypot(vx, vy, vz) || 1;   // de l'épaule vers le visé
    var tx = mel(sd * 84, sd * 60 + vx / vl * 98, w), ty = mel(22, 90 + vy / vl * 98, w), tz = mel(26, vz / vl * 98, w);
    if (sd < 0) { C.gx = tx; C.gy = ty; C.gz = tz; C.go = 1; } else { C.dx = tx; C.dy = ty; C.dz = tz; C.do_ = 1; }
    C.tete = cl(dxh / 6, -0.8, 0.8); C.hoche = 0.3; C.tors = 0; C.cap = 0; C.yeux = 1.6 + ch; C.lum = 1.2 + 0.5 * ch;
    C.mega = sd * ch;
  }
  // mon symbole : ma barre est à zéro ; il continue, mais affaibli
  if (S.boss <= 0) { C.lum *= 0.55; C.yeux *= 0.6; C.bas -= 6; C.penche += 0.08; }
}
function majPose(S, dt) {
  var now = S.reel, C = {}, kk;
  for (kk in REPOS) C[kk] = REPOS[kk];
  C.mega = 0;
  // sa vie au repos : il flotte un peu, il respire, sa tête suit mon héros, ses mains s'ouvrent et se ferment
  C.flotte = 4 + Math.sin(now * 1.3) * 3.5; C.cap = 0.07 * Math.sin(now * 0.37); C.tors = 0.05 * Math.sin(now * 0.61 + 1);
  C.tete = cl((S.h.x - B.x) / 9, -0.6, 0.6) + 0.08 * Math.sin(now * 0.9); C.hoche = 0.12 + 0.04 * Math.sin(now * 0.7);
  C.gy += Math.sin(now * 1.1) * 5; C.dy += Math.sin(now * 1.1 + 2) * 5; C.go = 0.55 + 0.35 * Math.sin(now * 0.8); C.do_ = 0.55 + 0.35 * Math.sin(now * 0.8 + 1.7);
  C.lum = 1 + 0.12 * Math.sin(now * 3);
  posture(S, C, now);
  for (var i = file.length - 1; i >= 0; i--) { var f = file[i], o = geste(f.cles, now - f.t0); if (o) for (kk in o) C[kk] = o[kk]; else if (now - f.t0 > f.cles[f.cles.length - 1][0]) file.splice(i, 1); }
  if (vict > 0) { var o2 = geste(GESTES.chute(), now - vict); if (o2) for (kk in o2) C[kk] = o2[kk]; else { var o3 = GESTES.chute(); for (kk in o3[o3.length - 1][1]) C[kk] = o3[o3.length - 1][1][kk]; } }
  if (!P) { P = {}; for (kk in C) P[kk] = C[kk]; }
  var d = Math.min(0.1, dt);
  for (kk in C) { if (P[kk] === undefined) P[kk] = C[kk]; var vit = VIT[kk] || 12; P[kk] += (C[kk] - P[kk]) * (1 - Math.exp(-vit * d)); }
}
/* les nouveautés de la partie : les coups reçus, les rebonds, les éclairs */
function lireEvts(S) {
  var l = S.evts;
  for (var i = 0; i < l.length; i++) {
    var e = l[i]; if (e._g) continue; e._g = 1;
    if (e.type === 'touche') { jouer('touche' + e.part, e.t); flash[e.part] = e.t; coupT = e.t; }
    else if (e.type === 'rebond') { jouer('rebond', e.t, e.part === 2 || e.part === 4 ? -1 : 1); flash['r' + e.part] = e.t; rire = e.t; }
    else if (e.type === 'symbole') jouer('titube', e.t);
    else if (e.type === 'victoire') vict = e.t;
    else if (e.type === 'reprise' || e.type === 'combat2') { file = []; oubliZone = {}; }
  }
  for (var j = 0; j < S.eclairs.length; j++) { var ec = S.eclairs[j]; if (ec._g || ec.t > S.reel) continue; ec._g = 1; jouer('eclair', ec.t, ec.main); }
}

/* ---------- le squelette en place, et les six parties (pour viser) ---------- */
function construireCorps() {
  R = reperes(P);
  var bu = R.bu, ha = R.ha, te = R.te, j = {};
  j.bassin = ha(0, 0, 0); j.taille = bu(0, 24, 4); j.poitrine = bu(0, 70, 6); j.cou = bu(0, 100, 0); j.tete = te(0, 26, 2);
  j.coeur = bu(0, 70, 26);
  [-1, 1].forEach(function (sd) {
    var m = sd < 0 ? 'G' : 'D', ep = bu(sd * 60, 90, -2), cible = bu(sd < 0 ? P.gx : P.dx, sd < 0 ? P.gy : P.dy, sd < 0 ? P.gz : P.dz);
    var r = ik(ep, cible, 54, 52, (function () { var q = bu(sd * 0.85, -0.25, -0.5), o = bu(0, 0, 0); return [q[0] - o[0], q[1] - o[1], q[2] - o[2]]; })());
    j['epaule' + m] = ep; j['coude' + m] = r[0]; j['main' + m] = r[1];
    var hp = ha(sd * 22, -4, 0), lev = sd < 0 ? P.piedG : P.piedD, pied = [sd * (30 + P.ecart) + Math.sin(R.yb) * 0, 6 + lev * 22, 8 + lev * 26];
    var ch = Math.cos(P.cap), sh = Math.sin(P.cap); pied = [pied[0] * ch + pied[2] * sh, pied[1] + Math.max(0, P.flotte) * 0.6, -pied[0] * sh + pied[2] * ch];
    var rj = ik(hp, pied, 56, 52, [sd * 0.25, 0.1, 1]);
    j['hanche' + m] = hp; j['genou' + m] = rj[0]; j['pied' + m] = rj[1];
  });
  J = {}; for (var n in j) J[n] = pr(j[n]);
  J._monde = j;
  // les parties, en unités de la toile : la tête (un rond), le torse (une forme), les bras et les jambes (des os épais)
  PARTS = [
    {n: 'tete', c: J.tete, r: 28 * J.tete[2]},
    {n: 'torse', c: pr(bu(0, 56, 10)), rx: 50 * J.poitrine[2], ry: 62 * J.poitrine[2]},
    {n: 'brasG', a: J.epauleG, b: J.coudeG, d: J.mainG, e: 15},
    {n: 'brasD', a: J.epauleD, b: J.coudeD, d: J.mainD, e: 15},
    {n: 'jambeG', a: J.hancheG, b: J.genouG, d: J.piedG, e: 17},
    {n: 'jambeD', a: J.hancheD, b: J.genouD, d: J.piedD, e: 17}
  ];
}

/* ---------- le dessin : un membre de lumière ---------- */
function ligne(A, B) { g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); }
function capsule(A, B, rA, rB) {
  var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 0.01, nx = -dy / L, ny = dx / L, a = Math.atan2(dy, dx);
  g.beginPath(); g.moveTo(A[0] + nx * rA, A[1] + ny * rA); g.lineTo(B[0] + nx * rB, B[1] + ny * rB);
  g.arc(B[0], B[1], rB, a + Math.PI / 2, a - Math.PI / 2, true); g.lineTo(A[0] - nx * rA, A[1] - ny * rA);
  g.arc(A[0], A[1], rA, a - Math.PI / 2, a + Math.PI / 2, true); g.closePath();
  return [nx, ny];
}
function membre(A, B, rA, rB, lum, now, graine) {
  rA *= A[2]; rB *= B[2];
  var r = (rA + rB) / 2;
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  g.strokeStyle = 'rgba(255,60,35,' + (0.16 * lum) + ')'; g.lineWidth = r * 3.2; ligne(A, B); g.stroke();
  g.globalCompositeOperation = 'source-over';
  var n = capsule(A, B, rA, rB), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, s = n[0] < 0 ? -1 : 1;
  // un être d'énergie : les bords brillent, le dedans est rouge sombre et transparent (la lumière vient un peu d'en haut à gauche)
  var gr = g.createLinearGradient(mx - n[0] * r * s, my - n[1] * r * s, mx + n[0] * r * s, my + n[1] * r * s);
  gr.addColorStop(0, 'rgba(255,190,130,.92)'); gr.addColorStop(0.16, 'rgba(255,96,58,.7)'); gr.addColorStop(0.5, 'rgba(176,22,36,.5)'); gr.addColorStop(0.84, 'rgba(240,60,44,.62)'); gr.addColorStop(1, 'rgba(255,130,90,.8)');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(255,205,160,' + (0.55 * lum) + ')'; g.lineWidth = 1.4; g.stroke();
  // le cœur du membre : une lumière douce, et l'énergie qui coule dedans
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = 'rgba(255,140,90,' + (0.3 * lum) + ')'; g.lineWidth = r * 0.9; ligne(A, B); g.stroke();
  g.strokeStyle = 'rgba(255,236,200,' + (0.32 * lum) + ')'; g.lineWidth = Math.max(1, r * 0.14); ligne(A, B); g.stroke();
  g.setLineDash([r * 0.5, r * 1.6]); g.lineDashOffset = -now * 70 - graine * 13;
  g.strokeStyle = 'rgba(255,226,160,' + (0.7 * lum) + ')'; g.lineWidth = Math.max(1, r * 0.22); ligne(A, B); g.stroke(); g.setLineDash([]);
  g.globalCompositeOperation = 'source-over';
}
function articulation(Q, r, lum) { r *= Q[2]; g.globalCompositeOperation = 'lighter'; halo(Q[0], Q[1], r * 2.6, '255,120,70', 0.55 * lum, 0.5); g.globalCompositeOperation = 'source-over'; }
function epaule(Q, sd, lum, now) {
  var r = 21 * Q[2], gr = g.createRadialGradient(Q[0] - sd * r * 0.2 - r * 0.25, Q[1] - r * 0.35, 1, Q[0], Q[1], r);
  gr.addColorStop(0, 'rgba(255,200,150,.85)'); gr.addColorStop(0.45, 'rgba(210,40,40,.55)'); gr.addColorStop(0.85, 'rgba(240,70,46,.7)'); gr.addColorStop(1, 'rgba(255,160,110,.9)');
  g.fillStyle = gr; g.beginPath(); g.arc(Q[0], Q[1], r, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,210,170,' + 0.6 * lum + ')'; g.lineWidth = 1.4; g.stroke();
  g.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 4; i++) { var u = (i - 1.5) / 1.5, bx = Q[0] + u * r * 0.7, by = Q[1] - r * 0.6, h = (16 + 10 * Math.sin(now * 7 + i * 1.9 + sd)) * Q[2], tx = bx + sd * h * 0.35 + Math.sin(now * 3 + i) * 3, ty = by - h;
    var fl = g.createLinearGradient(bx, by, tx, ty); fl.addColorStop(0, 'rgba(255,214,140,' + 0.7 * lum + ')'); fl.addColorStop(1, 'rgba(255,40,20,0)');
    g.fillStyle = fl; g.beginPath(); g.moveTo(bx - 5 * Q[2], by); g.quadraticCurveTo(bx, by - h * 0.5, tx, ty); g.quadraticCurveTo(bx + 2, by - h * 0.4, bx + 5 * Q[2], by); g.fill(); }
  halo(Q[0], Q[1], r * 2, '255,90,50', 0.4 * lum, 0.2);
  g.globalCompositeOperation = 'source-over';
}
/* la main : la paume et cinq doigts, ouverte ou en poing (rouge et or, comme le bras brisé de la phase 2) */
function mainDe(Cd, Co, ouvert, lum, now) {
  var ang = Math.atan2(Cd[1] - Co[1], Cd[0] - Co[0]), p = Cd[2], ouv = cl(ouvert, 0, 1);
  g.globalCompositeOperation = 'lighter';
  halo(Cd[0], Cd[1], 30 * p, '255,150,60', 0.7 * lum, 0.6);
  g.lineCap = 'round';
  for (var i = 0; i < 5; i++) {
    var sp = (i - 2) * (0.22 + 0.2 * ouv) + (i === 0 ? -0.5 : 0), L = (i === 0 ? 11 : 15 - Math.abs(i - 2.2) * 1.5) * p * (0.45 + 0.55 * ouv), a = ang + sp;
    var x0 = Cd[0] + Math.cos(ang) * 4 * p, y0 = Cd[1] + Math.sin(ang) * 4 * p, x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L;
    g.strokeStyle = 'rgba(255,90,50,.55)'; g.lineWidth = 6 * p; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = 'rgba(255,224,150,' + (0.85 * lum) + ')'; g.lineWidth = 2.2 * p; g.stroke();
  }
  g.fillStyle = 'rgba(255,120,70,.7)'; g.beginPath(); g.ellipse(Cd[0], Cd[1], 10 * p, 8 * p, ang, 0, TAU); g.fill();
  g.globalCompositeOperation = 'source-over';
}

/* ---------- le torse : un buste de héros, en lumière ; le cœur ; les lignes d'or ---------- */
function torse(now, lum, battement) {
  var bu = R.bu, ha = R.ha, q = function (x, y, z) { return pr(bu(x, y, z)); };
  var NL = q(-19, 104, 2), NR = q(19, 104, 2), SL = J.epauleG, SR = J.epauleD, CL = q(-57, 68, 4), CR = q(57, 68, 4), WL = q(-33, 22, 6), WR = q(33, 22, 6);
  var PL = pr(ha(-31, -2, 4)), PR = pr(ha(31, -2, 4)), PB = pr(ha(0, -14, 8));
  function forme() {
    g.beginPath(); g.moveTo(NL[0], NL[1]); g.quadraticCurveTo(SL[0] * 0.6 + NL[0] * 0.4, SL[1] - 10, SL[0], SL[1]);
    g.quadraticCurveTo(CL[0] - 6, CL[1] - 6, CL[0], CL[1]); g.quadraticCurveTo(WL[0] - 4, WL[1] - 18, WL[0], WL[1]);
    g.lineTo(PL[0], PL[1]); g.quadraticCurveTo(PB[0], PB[1] + 10, PR[0], PR[1]); g.lineTo(WR[0], WR[1]);
    g.quadraticCurveTo(WR[0] + 4, WR[1] - 18, CR[0], CR[1]); g.quadraticCurveTo(CR[0] + 6, CR[1] - 6, SR[0], SR[1]);
    g.quadraticCurveTo(SR[0] * 0.6 + NR[0] * 0.4, SR[1] - 10, NR[0], NR[1]); g.closePath();
  }
  // la lueur autour
  forme(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,50,30,' + 0.16 * lum + ')'; g.lineWidth = 26; g.lineJoin = 'round'; g.stroke();
  g.strokeStyle = 'rgba(255,80,40,' + 0.16 * lum + ')'; g.lineWidth = 12; g.stroke(); g.globalCompositeOperation = 'source-over';
  // le corps : chaud au milieu, sombre sur les bords ; le côté qui tourne s'assombrit
  var C = J.coeur, gr = g.createRadialGradient(C[0], C[1], 4, C[0], C[1] + 10, 92 * C[2]);
  gr.addColorStop(0, 'rgba(255,170,120,.7)'); gr.addColorStop(0.35, 'rgba(190,30,40,.5)'); gr.addColorStop(0.75, 'rgba(170,20,34,.52)'); gr.addColorStop(1, 'rgba(255,110,70,.78)');
  forme(); g.fillStyle = gr; g.fill();
  var gh = g.createLinearGradient(0, SL[1] - 10, 0, PB[1]); gh.addColorStop(0, 'rgba(255,170,120,.35)'); gh.addColorStop(0.4, 'rgba(255,120,80,0)'); g.fillStyle = gh; forme(); g.fill();   // le haut du buste, éclairé
  var sy = Math.sin(R.yb);
  if (Math.abs(sy) > 0.02) { var gx = g.createLinearGradient(SL[0], 0, SR[0], 0); gx.addColorStop(sy > 0 ? 1 : 0, 'rgba(40,0,8,' + Math.min(0.55, Math.abs(sy) * 1.3) + ')'); gx.addColorStop(0.5, 'rgba(40,0,8,0)'); g.fillStyle = gx; forme(); g.fill(); }
  g.strokeStyle = 'rgba(255,200,160,' + 0.75 * lum + ')'; g.lineWidth = 1.8; forme(); g.stroke();
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,110,60,' + 0.35 * lum + ')'; g.lineWidth = 6; forme(); g.stroke(); g.globalCompositeOperation = 'source-over';
  // dedans : l'énergie qui tourbillonne
  g.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 4; i++) { var a0 = now * (1.4 + i * 0.37) + i * 1.7, rr = (16 + i * 9) * C[2];
    g.strokeStyle = 'rgba(255,' + (110 + i * 25) + ',60,' + (0.22 * lum) + ')'; g.lineWidth = 3 - i * 0.4; g.beginPath(); g.ellipse(C[0], C[1] + 6, rr * 1.3, rr * 0.8, 0.4 * i, a0, a0 + 2.2); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  // les lignes d'or : les pectoraux, le ventre, la ligne du milieu (posées sur le devant : elles glissent quand il se tourne)
  var face = Math.cos(R.yb);
  if (face > 0.15) {
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,214,140,' + (0.55 * lum * face) + ')'; g.lineWidth = 1.5; g.lineCap = 'round';
    var Z = 24;
    [[-1], [1]].forEach(function (s) { s = s[0]; var a = q(s * 44, 84, Z - 8), b = q(s * 22, 60, Z), c2 = q(s * 4, 62, Z + 2); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1] + 6, c2[0], c2[1]); g.stroke(); });
    var m1 = q(0, 94, Z - 2), m2 = q(0, 22, Z); g.beginPath(); g.moveTo(m1[0], m1[1]); g.lineTo(m2[0], m2[1]); g.stroke();
    [46, 34, 24].forEach(function (y, k2) { var w = 15 - k2 * 2, a = q(-w, y, Z), b = q(w, y, Z); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 3, b[0], b[1]); g.stroke(); });
    g.globalCompositeOperation = 'source-over';
  }
  // le cœur qui bat (le noyau de puissance qu'il a pris)
  g.globalCompositeOperation = 'lighter';
  var bat = 1 + 0.3 * battement;
  halo(C[0], C[1], 46 * bat * C[2], '255,90,40', 0.7 * lum, 0.3);
  halo(C[0], C[1], 20 * bat * C[2], '255,220,160', 0.95 * lum, 1);
  g.strokeStyle = 'rgba(255,230,180,' + (0.35 * lum) + ')'; g.lineWidth = 1.2;
  for (var r2 = 0; r2 < 8; r2++) { var aa = r2 / 8 * TAU + now * 0.6, l1 = 12 * bat, l2 = (26 + 10 * bruit(r2 + Math.floor(now * 8))) * bat; g.beginPath(); g.moveTo(C[0] + Math.cos(aa) * l1, C[1] + Math.sin(aa) * l1); g.lineTo(C[0] + Math.cos(aa) * l2, C[1] + Math.sin(aa) * l2); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  return forme;
}

/* ---------- la tête : un visage jeune, des yeux de feu blanc, une crinière de flammes ---------- */
function tete(now, lum) {
  var te = R.te, q = function (x, y, z) { return pr(te(x, y, z)); }, H = J.tete, p = H[2], face = Math.cos(R.yt);
  // la crinière : des langues de feu qui partent du crâne, vers le haut et l'arrière
  g.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 9; i++) {
    var u = i / 8 - 0.5, base = q(u * 34, 44 - Math.abs(u) * 14, -2 - Math.abs(u) * 8), haut = 34 + 18 * Math.sin(now * 3.1 + i * 1.7) + 10 * bruit(i * 3 + Math.floor(now * 6));
    var bout = q(u * 46 + Math.sin(now * 2 + i) * 6, 52 + haut, -26 - haut * 0.4), mi = q(u * 40, 58 + haut * 0.5, -10);
    var gr = g.createLinearGradient(base[0], base[1], bout[0], bout[1]);
    gr.addColorStop(0, 'rgba(255,220,140,' + 0.8 * lum + ')'); gr.addColorStop(0.4, 'rgba(255,90,40,' + 0.6 * lum + ')'); gr.addColorStop(1, 'rgba(200,20,20,0)');
    var w = (9 - Math.abs(u) * 6) * p;
    g.fillStyle = gr; g.beginPath(); g.moveTo(base[0] - w, base[1]); g.quadraticCurveTo(mi[0] - w * 0.6, mi[1], bout[0], bout[1]); g.quadraticCurveTo(mi[0] + w * 0.6, mi[1], base[0] + w, base[1]); g.closePath(); g.fill();
  }
  halo(H[0], H[1], 60 * p, '255,60,40', 0.35 * lum, 0.2);
  g.globalCompositeOperation = 'source-over';
  // le visage : un œuf, la mâchoire carrée
  var mL = q(-16, 6, 8), mR = q(16, 6, 8), men = q(0, -6, 14), tL = q(-21, 30, 0), tR = q(21, 30, 0), haut2 = q(0, 52, -4);
  function forme() { g.beginPath(); g.moveTo(haut2[0], haut2[1]); g.bezierCurveTo(tL[0] - 4 * p, haut2[1], tL[0] - 2 * p, tL[1], tL[0], tL[1]); g.quadraticCurveTo(tL[0] + 1, mL[1] - 4 * p, mL[0], mL[1]); g.quadraticCurveTo(men[0] - 6 * p, men[1] + 2 * p, men[0], men[1]);
    g.quadraticCurveTo(men[0] + 6 * p, men[1] + 2 * p, mR[0], mR[1]); g.quadraticCurveTo(tR[0] - 1, mR[1] - 4 * p, tR[0], tR[1]); g.bezierCurveTo(tR[0] + 2 * p, tR[1], tR[0] + 4 * p, haut2[1], haut2[0], haut2[1]); g.closePath(); }
  var gr2 = g.createRadialGradient(H[0] - 6 * p, H[1] - 8 * p, 2, H[0], H[1], 34 * p);
  gr2.addColorStop(0, 'rgba(255,200,160,.88)'); gr2.addColorStop(0.45, 'rgba(255,92,64,.8)'); gr2.addColorStop(1, 'rgba(120,8,20,.75)');
  forme(); g.fillStyle = gr2; g.fill(); g.strokeStyle = 'rgba(255,170,130,' + 0.75 * lum + ')'; g.lineWidth = 1.5; g.stroke();
  if (face < 0.2) return;
  var a = cl((face - 0.2) / 0.4, 0, 1);
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  // les sourcils, durs ; le nez (un bec fin : c'est Grosbec) ; la bouche (elle s'ouvre et brûle quand il crie ou rit)
  g.strokeStyle = 'rgba(255,200,150,' + 0.6 * a * lum + ')'; g.lineWidth = 2;
  [[-1], [1]].forEach(function (s) { s = s[0]; var b1 = q(s * 3, 33, 18), b2 = q(s * 15, 38, 15); g.beginPath(); g.moveTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]); g.stroke(); });
  var n1 = q(0, 31, 20), n2 = q(0, 18, 24), n3 = q(-3, 16, 20); g.beginPath(); g.moveTo(n1[0], n1[1]); g.lineTo(n2[0], n2[1]); g.lineTo(n3[0], n3[1]); g.stroke();
  var b = P.bouche, bo = q(0, 9, 17);
  if (b > 0.05) { halo(bo[0], bo[1], 12 * p * (0.6 + b), '255,200,120', 0.8 * a * b, 0.9); g.fillStyle = 'rgba(255,240,200,' + (0.8 * a * b) + ')'; g.beginPath(); g.ellipse(bo[0], bo[1], 7 * p, (1.5 + 5 * b) * p, 0, 0, TAU); g.fill(); }
  else { var l1 = q(-7, 10, 16), l2 = q(7, 10, 16); g.beginPath(); g.moveTo(l1[0], l1[1]); g.quadraticCurveTo(bo[0], bo[1] - 1, l2[0], l2[1]); g.stroke(); }
  // les yeux : deux fentes de lumière blanche, et leur traînée quand il bouge
  var y = P.yeux;
  [[-1], [1]].forEach(function (s) { s = s[0]; var e = q(s * 9, 28, 17);
    halo(e[0], e[1], 14 * p * (0.7 + 0.3 * y), '255,230,170', 0.8 * a * Math.min(1.5, y), 0.9);
    g.fillStyle = 'rgba(255,255,240,' + Math.min(1, 0.8 * a * y) + ')'; g.beginPath(); g.ellipse(e[0], e[1], 6 * p, 1.8 * p, s * 0.18, 0, TAU); g.fill(); });
  g.globalCompositeOperation = 'source-over';
  return forme;
}

/* ---------- les anneaux d'énergie qui tournent autour de lui (une moitié derrière, une moitié devant) ---------- */
function anneaux(now, lum, devant) {
  var bu = R.bu;
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  [[86, 0.32, 0.5, 1.1, '255,90,50'], [74, -0.42, -0.3, -0.8, '255,190,90']].forEach(function (a, ia) {
    var Rr = a[0], ti = a[1], tz = a[2], vit = a[3], pts = [];
    for (var i = 0; i <= 40; i++) {
      var f = i / 40 * TAU + now * vit, x = Math.cos(f) * Rr, z = Math.sin(f) * Rr, y = 0;
      var y1 = y * Math.cos(ti) - z * Math.sin(ti), z1 = y * Math.sin(ti) + z * Math.cos(ti), x2 = x * Math.cos(tz) - y1 * Math.sin(tz), y2 = x * Math.sin(tz) + y1 * Math.cos(tz);
      var wq = bu(x2, 58 + y2, z1); pts.push([pr(wq), wq[2] - J._monde.poitrine[2]]);
    }
    g.beginPath(); var dedans = false;
    for (var j = 0; j < 40; j++) {
      var A = pts[j], Bq = pts[j + 1], dv = (A[1] + Bq[1]) / 2 > 0;
      if (dv !== devant) { dedans = false; continue; }
      if (!dedans) g.moveTo(A[0][0], A[0][1]); g.lineTo(Bq[0][0], Bq[0][1]); dedans = true;
    }
    g.strokeStyle = 'rgba(' + a[4] + ',' + (0.2 * lum) + ')'; g.lineWidth = 7; g.stroke();
    g.strokeStyle = 'rgba(255,240,200,' + (0.6 * lum) + ')'; g.lineWidth = 1.6; g.stroke();
    var u = (now * 0.35 * vit) % 1, pj = pts[Math.floor((u < 0 ? u + 1 : u) * 40)];   // une perle de lumière qui court sur l'anneau
    if (pj && (pj[1] > 0) === devant) halo(pj[0][0], pj[0][1], 12, '255,230,180', 0.9 * lum, 0.9);
  });
  g.globalCompositeOperation = 'source-over';
}
/* ---------- la cape de lumière, derrière lui ---------- */
function cape(now, lum) {
  var bu = R.bu, ha = R.ha, L = pr(bu(-52, 96, -14)), Rr = pr(bu(52, 96, -14)), ouv = 1 + P.cape * 0.5;
  var bas = function (s, k2) { var w = Math.sin(now * 1.6 + s * 0.8 + k2) * 14; return pr(ha(s * (70 + 18 * ouv) + w, -96 - P.bas * 0.5 + Math.sin(now * 1.2 + s) * 6, -46 - 20 * P.cape)); };
  var BL = bas(-1, 0), BR = bas(1, 1), BM = pr(ha(Math.sin(now * 1.3) * 16, -110, -50));
  var gr = g.createLinearGradient(0, L[1], 0, BM[1]);
  gr.addColorStop(0, 'rgba(255,70,40,' + 0.5 * lum + ')'); gr.addColorStop(0.5, 'rgba(190,20,30,' + 0.32 * lum + ')'); gr.addColorStop(1, 'rgba(120,0,20,0)');
  g.globalCompositeOperation = 'lighter'; g.fillStyle = gr;
  g.beginPath(); g.moveTo(L[0], L[1]); g.quadraticCurveTo(L[0] - 40, (L[1] + BL[1]) / 2, BL[0], BL[1]); g.quadraticCurveTo((BL[0] + BM[0]) / 2, BM[1] + 14, BM[0], BM[1]);
  g.quadraticCurveTo((BM[0] + BR[0]) / 2, BM[1] + 14, BR[0], BR[1]); g.quadraticCurveTo(Rr[0] + 40, (Rr[1] + BR[1]) / 2, Rr[0], Rr[1]); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,170,110,' + 0.25 * lum + ')'; g.lineWidth = 1;
  for (var i = 1; i < 6; i++) { var u = i / 6, x0 = mel(L[0], Rr[0], u), y0 = mel(L[1], Rr[1], u), x1 = mel(BL[0], BR[0], u) + Math.sin(now * 2 + i) * 8, y1 = BM[1] - 10 + Math.sin(u * Math.PI) * 10; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + Math.sin(now * 1.7 + i) * 12, (y0 + y1) / 2, x1, y1); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
}
/* ---------- les pieds : ils ne touchent pas tout à fait le sol ; des flammes en dessous ---------- */
function pied(F, sd, now, lum) {
  var p = F[2], T2 = [F[0] + sd * 4 * p, F[1] + 9 * p, p];
  membre(F, T2, 10, 8, lum, now, sd + 7);
  g.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 4; i++) { var x = T2[0] + (i - 1.5) * 6 * p, h = (14 + 10 * Math.sin(now * 9 + i * 2 + sd)) * p; var gr = g.createLinearGradient(x, T2[1] + 4, x, T2[1] - h);
    gr.addColorStop(0, 'rgba(255,210,140,' + 0.6 * lum + ')'); gr.addColorStop(1, 'rgba(255,40,20,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 4 * p, T2[1] + 4); g.quadraticCurveTo(x, T2[1] - h * 0.3, x + Math.sin(now * 5 + i) * 3, T2[1] - h); g.quadraticCurveTo(x, T2[1] - h * 0.3, x + 4 * p, T2[1] + 4); g.fill(); }
  g.globalCompositeOperation = 'source-over';
}

/* ---------- les éclairs qui le parcourent, les braises qui montent ---------- */
var CHAINES = [['epauleG', 'coudeG'], ['coudeG', 'mainG'], ['epauleD', 'coudeD'], ['coudeD', 'mainD'], ['hancheG', 'genouG'], ['genouG', 'piedG'], ['hancheD', 'genouD'], ['genouD', 'piedD'],
  ['cou', 'tete'], ['poitrine', 'epauleG'], ['poitrine', 'epauleD'], ['taille', 'hancheG'], ['taille', 'hancheD'], ['coeur', 'tete'], ['coeur', 'taille']];
function eclairsSurLui(now, lum) {
  if (now - arcsT > 0.09) { arcsT = now; arcs = []; for (var i = 0; i < 4; i++) { var c = CHAINES[Math.floor(Math.random() * CHAINES.length)]; arcs.push({a: c[0], b: c[1], s: Math.random() * 1000}); } }
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
  arcs.forEach(function (ar) {
    var A = J[ar.a], Bq = J[ar.b]; if (!A || !Bq) return;
    g.beginPath(); g.moveTo(A[0], A[1]);
    for (var i = 1; i < 7; i++) { var u = i / 7, dx = Bq[0] - A[0], dy = Bq[1] - A[1], L = Math.hypot(dx, dy) || 1, d = (bruit(ar.s + i * 7.3) - 0.5) * 16; g.lineTo(A[0] + dx * u - dy / L * d, A[1] + dy * u + dx / L * d); }
    g.lineTo(Bq[0], Bq[1]);
    g.strokeStyle = 'rgba(255,90,90,' + 0.3 * lum + ')'; g.lineWidth = 5; g.stroke();
    g.strokeStyle = 'rgba(255,245,245,' + 0.85 * lum + ')'; g.lineWidth = 1.3; g.stroke();
  });
  g.globalCompositeOperation = 'source-over';
}
var NOMS_BRAISES = ['epauleG', 'epauleD', 'coudeG', 'coudeD', 'mainG', 'mainD', 'tete', 'tete', 'coeur', 'genouG', 'genouD', 'piedG', 'piedD'];
function majBraises(dt, lum, faible) {
  var n = dt * [8, 14, 20][QUAL] * lum;
  while (n > 0) { if (Math.random() < n) { var nom = NOMS_BRAISES[Math.floor(Math.random() * NOMS_BRAISES.length)], q = J[nom];
    braises.push({x: q[0] + (Math.random() - 0.5) * 14, y: q[1] + (Math.random() - 0.5) * 14, vx: (Math.random() - 0.5) * 12, vy: -24 - Math.random() * 34, vie: 0, max: 0.6 + Math.random() * 0.8, r: 2.5 + Math.random() * 3, or: Math.random() < 0.3}); } n -= 1; }
  if (faible) for (var i = 0; i < dt * 50; i++) { var c = faible; braises.push({x: c[0] + (Math.random() - 0.5) * 26, y: c[1] + (Math.random() - 0.5) * 26, vx: (Math.random() - 0.5) * 90, vy: -40 - Math.random() * 70, vie: 0, max: 0.5 + Math.random() * 0.6, r: 3 + Math.random() * 3, or: true, blanc: true}); }
  braises = braises.filter(function (b) { b.vie += dt; b.x += b.vx * dt + Math.sin(b.vie * 5 + b.r) * 0.6; b.y += b.vy * dt; b.vy *= 0.99; return b.vie < b.max; });
  if (braises.length > 260) braises.splice(0, braises.length - 260);
}
function dessinBraises() {
  g.globalCompositeOperation = 'lighter';
  braises.forEach(function (b) { var u = b.vie / b.max, a = Math.sin(u * Math.PI); halo(b.x, b.y, b.r * 2.2, b.blanc ? '255,240,190' : b.or ? '255,190,90' : '255,80,40', a * 0.9, b.blanc ? 0.9 : 0.5); });
  g.globalCompositeOperation = 'source-over';
}

/* ---------- les boules d'énergie : celle de la grosse zone (entre ses poings), celle de la méga attaque (au bout de son doigt) ---------- */
function boule(x, y, r, now, rgb) {
  g.globalCompositeOperation = 'lighter';
  halo(x, y, r * 3.2, rgb, 0.55, 0.2); halo(x, y, r * 1.6, '255,200,150', 0.8, 0.8); halo(x, y, r * 0.8, '255,255,240', 1, 1);
  g.strokeStyle = 'rgba(255,230,200,.7)'; g.lineWidth = 1.2;
  for (var i = 0; i < 5; i++) { var a = now * 7 + i * 1.3; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); g.lineTo(x + Math.cos(a + 0.4) * r * 1.4, y + Math.sin(a + 0.4) * r * 1.4); g.lineTo(x + Math.cos(a - 0.2) * r * 2.1, y + Math.sin(a - 0.2) * r * 2.1); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
}

/* ---------- la partie faible (seulement sur la tablette qui doit la crier) : elle tremble, se fendille de lumière blanche, crache des étincelles ---------- */
function dessinPartie(i, mode, coul, grossit) {
  var pt = PARTS[i];
  if (pt.n === 'tete') { g.beginPath(); g.arc(pt.c[0], pt.c[1], pt.r * (1 + grossit), 0, TAU); }
  else if (pt.n === 'torse') { g.beginPath(); g.ellipse(pt.c[0], pt.c[1], pt.rx * (1 + grossit), pt.ry * (1 + grossit), 0, 0, TAU); }
  else { g.beginPath(); g.moveTo(pt.a[0], pt.a[1]); g.lineTo(pt.b[0], pt.b[1]); g.lineTo(pt.d[0], pt.d[1]); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = pt.e * 2 * (1 + grossit * 2); if (mode === 'fill') { g.strokeStyle = coul; g.stroke(); return; } }
  if (mode === 'fill') { g.fillStyle = coul; g.fill(); } else { g.strokeStyle = coul; g.stroke(); }
}
function centreU(i) { var pt = PARTS[i]; if (pt.c) return pt.c; return [(pt.a[0] + pt.b[0] * 2 + pt.d[0]) / 4, (pt.a[1] + pt.b[1] * 2 + pt.d[1]) / 4]; }
function faibleVue(i, now) {
  var c = centreU(i), pulse = 0.5 + 0.5 * Math.sin(now * 11), jx = (bruit(Math.floor(now * 24)) - 0.5) * 6, jy = (bruit(Math.floor(now * 24) + 50) - 0.5) * 6;
  g.save(); g.translate(jx, jy);   // elle tremble
  g.globalCompositeOperation = 'lighter';
  var membre2 = PARTS[i].a !== undefined;
  dessinPartie(i, 'fill', membre2 ? 'rgba(255,200,90,' + (0.28 + 0.3 * pulse) + ')' : 'rgba(255,236,170,' + (0.35 + 0.3 * pulse) + ')', 0.05 * pulse);
  if (!membre2) dessinPartie(i, 'stroke', 'rgba(255,250,220,' + (0.6 + 0.4 * pulse) + ')', 0.1);
  halo(c[0], c[1], 70, '255,220,120', 0.5 + 0.4 * pulse, 0.7);
  // les fentes de lumière
  var s = Math.floor(now * 7);
  g.strokeStyle = 'rgba(255,255,240,.95)'; g.lineWidth = 1.8; g.lineCap = 'round';
  var pt2 = PARTS[i];
  for (var f = 0; f < 6; f++) { var a = bruit(s * 3 + f) * TAU, base = pt2.a ? [pt2.a, pt2.b, pt2.d][f % 3] : c, x = (membre2 ? (base[0] + c[0]) / 2 : c[0]) + Math.cos(a) * 6, y = (membre2 ? (base[1] + c[1]) / 2 : c[1]) + Math.sin(a) * 6; g.beginPath(); g.moveTo(x, y);
    for (var j = 0; j < 4; j++) { a += (bruit(s * 7 + f * 5 + j) - 0.5) * 1.6; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); } g.stroke(); }
  // l'onde qui bat
  for (var o = 0; o < 2; o++) { var w = (now * 1.6 + o * 0.5) % 1; g.strokeStyle = 'rgba(255,230,150,' + (0.9 * (1 - w)) + ')'; g.lineWidth = 4 * (1 - w) + 0.5; g.beginPath(); g.arc(c[0], c[1], 24 + w * 70, 0, TAU); g.stroke(); }
  g.globalCompositeOperation = 'source-over'; g.restore();
}

/* ---------- la toile de Grosbec : tout, dans l'ordre de la profondeur ---------- */
function peindre(S, now) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.setTransform(kc, 0, 0, kc, -BOITE.x0 * kc, -BOITE.y0 * kc);
  var lum = P.lum, bat = Math.max(0, Math.sin(now * 6.2)) * Math.max(0, Math.sin(now * 6.2 + 0.9));
  if (vict > 0) { var dv = now - vict; lum *= 1 + Math.max(0, 1.5 - dv); }
  // derrière lui : une lueur (la grande est peinte avec la salle), la cape, la moitié arrière des anneaux
  g.globalCompositeOperation = 'lighter';
  halo(J.poitrine[0], J.poitrine[1] + 10, 130 * (1 + 0.04 * Math.sin(now * 2)), '255,50,30', 0.38 * lum, 0.05);
  g.globalCompositeOperation = 'source-over';
  cape(now, lum);
  anneaux(now, lum, false);
  // les membres, du plus loin au plus près ; le torse et la tête au milieu
  var el = [];
  [['G', -1], ['D', 1]].forEach(function (m) {
    var s = m[0], sd = m[1];
    el.push({z: (J['hanche' + s][3] + J['pied' + s][3]) / 2 - 30, f: function () { membre(J['hanche' + s], J['genou' + s], 24, 17, lum, now, sd); membre(J['genou' + s], J['pied' + s], 17, 11, lum, now, sd + 2); articulation(J['genou' + s], 9, lum); pied(J['pied' + s], sd, now, lum); }});
    el.push({z: (J['epaule' + s][3] + J['coude' + s][3] + J['main' + s][3]) / 3, f: function () { membre(J['epaule' + s], J['coude' + s], 19, 14, lum, now, sd + 4); membre(J['coude' + s], J['main' + s], 15, 10, lum, now, sd + 5); articulation(J['coude' + s], 9, lum); epaule(J['epaule' + s], sd, lum, now); mainDe(J['main' + s], J['coude' + s], s === 'G' ? P.go : P.do_, lum, now); }});
  });
  var formeTorse = null, formeTete = null;
  el.push({z: J.poitrine[3] - 4, f: function () { formeTorse = torse(now, lum, bat); }});
  el.push({z: J.tete[3] - 3, f: function () { membre(J.cou, pr(R.te(0, 4, 0)), 15, 13, lum, now, 9); formeTete = tete(now, lum); }});
  el.sort(function (a, b) { return a.z - b.z; }).forEach(function (e) { e.f(); });
  anneaux(now, lum, true);
  eclairsSurLui(now, lum);
  // les boules
  if (P.orbe > 0.03) { var mG = J.mainG, mD = J.mainD; boule((mG[0] + mD[0]) / 2, (mG[1] + mD[1]) / 2 - 6, 8 + 26 * P.orbe, now, '255,50,30'); }
  if (Math.abs(P.mega || 0) > 0.02) { var mm = P.mega < 0 ? J.mainG : J.mainD, ang = Math.atan2(mm[1] - (P.mega < 0 ? J.coudeG : J.coudeD)[1], mm[0] - (P.mega < 0 ? J.coudeG : J.coudeD)[0]);
    boule(mm[0] + Math.cos(ang) * 18, mm[1] + Math.sin(ang) * 18, 8 + 34 * Math.abs(P.mega), now, '255,20,40'); }
  // les coups reçus : la partie touchée s'éclaire en blanc ; un rebond : un éclat d'or
  for (var i = 0; i < 6; i++) {
    var tf = flash[i]; if (tf !== undefined && now - tf < 0.45) { var u = (now - tf) / 0.45; g.globalCompositeOperation = 'lighter'; dessinPartie(i, 'fill', 'rgba(255,255,255,' + (0.6 * (1 - u)) + ')', 0.06 * (1 - u)); var cc = centreU(i); halo(cc[0], cc[1], 60 * (1 - u * 0.5), '255,240,210', 0.8 * (1 - u), 1); g.globalCompositeOperation = 'source-over'; }
    var tr = flash['r' + i]; if (tr !== undefined && now - tr < 0.4) { var v = (now - tr) / 0.4; g.globalCompositeOperation = 'lighter'; dessinPartie(i, 'stroke', 'rgba(255,214,90,' + (0.9 * (1 - v)) + ')', 0.1 + v * 0.3); g.globalCompositeOperation = 'source-over'; }
  }
  // la partie faible, sur la tablette qui doit la crier
  var pm = S.combat === 2 && S.etat === 'combat' ? P3.partMontree(S) : null;
  if (pm) faibleVue(pm.val, now);
  dessinBraises();
}

/* ---------- pour le jeu ---------- */
function cadre(vue, K) { V = vue; KV = K; }
function construire(T, dpr0, q) {
  if (q !== undefined) QUAL = q;
  dpr = Math.min(2, dpr0 || 1); k = T / U; kc = Math.min([1.0, 1.3, 2.0][QUAL], k * dpr);
  cv = toile(BOITE.w * kc, BOITE.h * kc); g = cv.getContext('2d'); tDessin = -9;
}
function reset() { P = null; file = []; flash = {}; braises = []; vuEvt = -1; vuEcl = -1; vict = -9; oubliZone = {}; }
function maj(S, dt) {
  if (!S) return;
  lireEvts(S); majPose(S, dt); construireCorps();
}
function dessiner(c, S) {
  if (!cv || !P) return;
  var now = S.reel;
  if (now - tDessin >= 1 / IPS[QUAL] - 0.002 || now < tDessin) {
    var dtB = cl(now - tDessin, 0, 0.1); tDessin = now;
    var pm = S.combat === 2 && S.etat === 'combat' ? P3.partMontree(S) : null;
    majBraises(dtB, P.lum * (vict > 0 ? 4 : 1), pm ? centreU(pm.val) : null);
    peindre(S, now);
  }
  var x0 = V.ox + B.x * V.T + BOITE.x0 * k, y0 = V.oy + B.y * V.T * KV + BOITE.y0 * k, a = 1;
  if (vict > 0) a = 1 - cl((now - vict - 0.9) / 1.3, 0, 1);   // la fin : il se défait en lumière
  if (a <= 0) return;
  c.globalAlpha = a; c.drawImage(cv, x0, y0, BOITE.w * k, BOITE.h * k); c.globalAlpha = 1;
}
/* son reflet dans le sol (renversé, écrasé) */
function reflet(c) {
  if (!cv || !P || QUAL < 2) return;
  var x0 = V.ox + B.x * V.T + BOITE.x0 * k, y0 = V.oy + B.y * V.T * KV + BOITE.y0 * k, base = V.oy + B.y * V.T * KV;
  c.save(); c.translate(0, base); c.scale(1, -0.42); c.translate(0, -base); c.drawImage(cv, x0, y0, BOITE.w * k, BOITE.h * k); c.restore();
}
/* d'un point de la toile (en unités) à l'écran */
function ecran(q) { return [V.ox + B.x * V.T + q[0] * k, V.oy + B.y * V.T * KV + q[1] * k]; }
function point(nom) { var q = J && J[nom]; return q ? ecran(q) : [V.ox + B.x * V.T, V.oy + B.y * V.T * KV - 150 * k]; }
function centrePartie(i) { return PARTS ? ecran(centreU(i)) : point('poitrine'); }
function distSeg(px, py, ax, ay, bx, by) { var vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy, u = l ? ((px - ax) * vx + (py - ay) * vy) / l : 0; u = cl(u, 0, 1); return Math.hypot(px - (ax + u * vx), py - (ay + u * vy)); }
/* quelle partie est sous le doigt (ou -1) ; on prend large, pour des doigts d'enfants */
function partieSous(sx, sy) {
  if (!PARTS) return -1;
  var x = (sx - (V.ox + B.x * V.T)) / k, y = (sy - (V.oy + B.y * V.T * KV)) / k, best = -1, bd = 1e9;
  PARTS.forEach(function (pt, i) {
    var d;
    if (pt.n === 'tete') d = Math.hypot(x - pt.c[0], y - pt.c[1]) - pt.r;
    else if (pt.n === 'torse') d = (Math.hypot((x - pt.c[0]) / pt.rx, (y - pt.c[1]) / pt.ry) - 1) * pt.rx;
    else d = Math.min(distSeg(x, y, pt.a[0], pt.a[1], pt.b[0], pt.b[1]), distSeg(x, y, pt.b[0], pt.b[1], pt.d[0], pt.d[1])) - pt.e;
    if (d < bd) { bd = d; best = i; }
  });
  return bd < 22 ? best : -1;
}
/* la partie visée : un réticule blanc qui tourne autour d'elle */
function traceVisee(c, i, t) {
  if (!PARTS) return;
  var pt = PARTS[i], q = ecran(centreU(i)), r = (pt.n === 'tete' ? pt.r + 8 : pt.n === 'torse' ? Math.min(pt.rx, pt.ry) + 4 : 30) * k;
  c.save(); c.translate(q[0], q[1]); c.rotate(t * 1.6);
  c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = 2.4; c.lineCap = 'round';
  for (var j = 0; j < 4; j++) { c.beginPath(); c.arc(0, 0, r, j * Math.PI / 2 + 0.25, j * Math.PI / 2 + Math.PI / 2 - 0.25); c.stroke(); c.beginPath(); c.moveTo(Math.cos(j * Math.PI / 2) * (r - 6), Math.sin(j * Math.PI / 2) * (r - 6)); c.lineTo(Math.cos(j * Math.PI / 2) * (r + 6), Math.sin(j * Math.PI / 2) * (r + 6)); c.stroke(); }
  c.restore();
}
G.GB = {cadre: cadre, construire: construire, reset: reset, maj: maj, dessiner: dessiner, reflet: reflet, point: point, centrePartie: centrePartie, partieSous: partieSous, traceVisee: traceVisee,
  get pose() { return P; }, get pts() { return J; }, BOITE: BOITE};
})(typeof window !== 'undefined' ? window : globalThis);
