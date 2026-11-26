/* Le dessin de la version 2 : la salle vue d'en haut, en biais (comme la phase 2 et le combat du Pisteur), en formes simples.
   Grosbec de lumière au fond ; la fontaine, la lanterne, la statue cassée ; mon héros, mes trois amis, mon villageois et ses bulles. */
(function (G) {
'use strict';
var P3 = G.P3, REG = P3.REG;
var ROLES = {barde: {c: '#ff8fb3', ic: '🎻'}, sage: {c: '#6cb6ff', ic: '📜'}, alchimiste: {c: '#b48cff', ic: '⚗️'}, pisteur: {c: '#5fcf86', ic: '🏹'}};
// (R) un villageois par tablette, toujours le même : Gaspard le boulanger, Margot la tavernière, Silas le garde, Iris l'herboriste
var VILLAGEOIS = {alchimiste: {ic: '🥖', c: '#e8c48a'}, barde: {ic: '🍺', c: '#d9a066'}, pisteur: {ic: '🗡️', c: '#9fb0c8'}, sage: {ic: '🌿', c: '#a8d08d'}};
var ECOUL = {feu: '#ff7a2a', glace: '#9fe3ff', acide: '#8fe03a'};
var EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
var K = 0.62, V = {T: 40, ox: 0, oy: 0};
function X(x) { return V.ox + x * V.T; }
function Y(y, z) { return V.oy + y * V.T * K - (z || 0) * V.T; }
function ell(c, x, y, r, z) { c.beginPath(); c.ellipse(X(x), Y(y, z), r * V.T, r * V.T * K, 0, 0, Math.PI * 2); }
function rond(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function emoji(c, e, x, y, s) { c.font = Math.round(s) + 'px ' + EMO; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y + s * 0.04); }
function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
function bruit(i) { var s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); }

/* ---------- la forme de Grosbec : six parties, en coordonnées d'écran ---------- */
var B = REG.grosbec;
var FORME = {   // en pas : x dans la salle, z la hauteur
  tete: {z: 5.35, r: 0.72},
  torse: {z: 3.55, rx: 1.2, rz: 1.3},
  brasG: {a: [-1.15, 4.45], b: [-2.55, 2.55], e: 0.44}, brasD: {a: [1.15, 4.45], b: [2.55, 2.55], e: 0.44},
  jambeG: {a: [-0.55, 2.4], b: [-0.85, 0.15], e: 0.52}, jambeD: {a: [0.55, 2.4], b: [0.85, 0.15], e: 0.52}
};
var ORDRE = ['tete', 'torse', 'brasG', 'brasD', 'jambeG', 'jambeD'];   // le même ordre que P3.PARTIES
function pt(dx, z, sh) { return [X(B.x + dx) + (sh || 0), Y(B.y, z)]; }
function centrePartie(i, sh) {
  var n = ORDRE[i], f = FORME[n];
  if (n === 'tete' || n === 'torse') return pt(0, f.z, sh);
  var a = pt(f.a[0], f.a[1], sh), b = pt(f.b[0], f.b[1], sh); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
function mainDe(cote, sh) { var f = FORME[cote < 0 ? 'brasG' : 'brasD']; return pt(f.b[0], f.b[1], sh); }
function distSeg(px, py, ax, ay, bx, by) { var vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy, u = l ? ((px - ax) * vx + (py - ay) * vy) / l : 0; u = cl(u, 0, 1); return Math.hypot(px - (ax + u * vx), py - (ay + u * vy)); }
/* quelle partie est sous le doigt (ou -1) ; on prend large, pour des doigts d'enfants */
function partieSous(sx, sy) {
  var T = V.T, best = -1, bd = 1e9;
  ORDRE.forEach(function (n, i) {
    var f = FORME[n], d;
    if (n === 'tete') { var p = pt(0, f.z); d = Math.hypot(sx - p[0], sy - p[1]) - f.r * T; }
    else if (n === 'torse') { var q = pt(0, f.z); d = (Math.hypot((sx - q[0]) / (f.rx * T), (sy - q[1]) / (f.rz * T)) - 1) * f.rx * T; }
    else { var a = pt(f.a[0], f.a[1]), b = pt(f.b[0], f.b[1]); d = distSeg(sx, sy, a[0], a[1], b[0], b[1]) - f.e * T / 2; }
    if (d < bd) { bd = d; best = i; }
  });
  return bd < V.T * 0.45 ? best : -1;
}
function tracePartie(c, i, sh, grossit) {
  var n = ORDRE[i], f = FORME[n], T = V.T, g = grossit || 0;
  if (n === 'tete') { var p = pt(0, f.z, sh); rond(c, p[0], p[1], (f.r + g) * T); return 'fill'; }
  if (n === 'torse') { var q = pt(0, f.z, sh); c.beginPath(); c.ellipse(q[0], q[1], (f.rx + g) * T, (f.rz + g) * T, 0, 0, Math.PI * 2); return 'fill'; }
  var a = pt(f.a[0], f.a[1], sh), b = pt(f.b[0], f.b[1], sh);
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = (f.e + 2 * g) * T; c.lineCap = 'round'; return 'stroke';
}
function remplir(c, quoi, coul) { if (quoi === 'fill') { c.fillStyle = coul; c.fill(); } else { c.strokeStyle = coul; c.stroke(); } }

/* ---------- la salle et le décor ---------- */
function salle(c, S) {
  var L = REG.salle, T = V.T;
  var g = c.createLinearGradient(0, Y(0, 3.2), 0, Y(0));
  g.addColorStop(0, '#0b0e1c'); g.addColorStop(1, '#1d2236');
  c.fillStyle = g; c.fillRect(X(0), Y(0, 3.2), L.L * T, 3.2 * T);
  c.fillStyle = '#141a2b'; for (var i = 0; i < 7; i++) c.fillRect(X(1 + i * 2) - T * 0.25, Y(0, 3.2), T * 0.5, 3.2 * T);
  c.fillStyle = '#242a3c'; c.fillRect(X(0), Y(0), L.L * T, L.P * T * K);
  c.strokeStyle = 'rgba(255,255,255,.045)'; c.lineWidth = 1;
  for (var x = 0; x <= L.L; x++) { c.beginPath(); c.moveTo(X(x), Y(0)); c.lineTo(X(x), Y(L.P)); c.stroke(); }
  for (var y = 0; y <= L.P; y++) { c.beginPath(); c.moveTo(X(0), Y(y)); c.lineTo(X(L.L), Y(y)); c.stroke(); }
  c.strokeStyle = '#3a4560'; c.lineWidth = 3; c.strokeRect(X(0), Y(0), L.L * T, L.P * T * K);
  // la lueur rouge de Grosbec sur le sol
  var gl = c.createRadialGradient(X(B.x), Y(B.y), 0, X(B.x), Y(B.y), 6 * T);
  gl.addColorStop(0, 'rgba(255,60,50,.22)'); gl.addColorStop(1, 'rgba(255,60,50,0)');
  c.fillStyle = gl; c.fillRect(X(0), Y(0), L.L * T, L.P * T * K);
}
function lieu(c, S, i) {
  var l = REG.lieux[i], T = V.T, t = S.reel;
  c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, l.x + 0.1, l.y + 0.1, 0.55); c.fill();
  if (l.n === 'lanterne') {        // un poteau, une grosse lanterne jaune
    c.fillStyle = '#2b3042'; c.fillRect(X(l.x) - T * 0.12, Y(l.y, 1.9), T * 0.24, T * 1.9);
    var g = c.createRadialGradient(X(l.x), Y(l.y, 2.1), 0, X(l.x), Y(l.y, 2.1), T * 1.1);
    g.addColorStop(0, 'rgba(255,210,80,.55)'); g.addColorStop(1, 'rgba(255,210,80,0)'); c.fillStyle = g; rond(c, X(l.x), Y(l.y, 2.1), T * 1.1); c.fill();
    rr(c, X(l.x) - T * 0.28, Y(l.y, 2.45), T * 0.56, T * 0.7, 5); c.fillStyle = '#ffd23a'; c.fill(); c.strokeStyle = '#6b5200'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#fff4bf'; rr(c, X(l.x) - T * 0.14, Y(l.y, 2.32), T * 0.28, T * 0.42, 3); c.fill();
  } else if (l.n === 'statue') {   // un socle, une statue cassée (un bras en moins, la tête tombée à côté)
    c.fillStyle = '#5d6377'; c.fillRect(X(l.x) - T * 0.45, Y(l.y, 0.55), T * 0.9, T * 0.55);
    c.fillStyle = '#7c8296'; c.fillRect(X(l.x) - T * 0.45, Y(l.y, 0.62), T * 0.9, T * 0.1);
    c.fillStyle = '#9aa1b5'; rr(c, X(l.x) - T * 0.24, Y(l.y, 1.75), T * 0.48, T * 1.15, 6); c.fill();
    c.strokeStyle = '#9aa1b5'; c.lineWidth = T * 0.14; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(l.x) - T * 0.2, Y(l.y, 1.55)); c.lineTo(X(l.x) - T * 0.42, Y(l.y, 1.05)); c.stroke(); c.lineCap = 'butt';
    c.strokeStyle = '#3b4050'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(l.x) + T * 0.24, Y(l.y, 1.75)); c.lineTo(X(l.x) + T * 0.05, Y(l.y, 1.45)); c.lineTo(X(l.x) + T * 0.2, Y(l.y, 1.2)); c.stroke();
    c.fillStyle = '#9aa1b5'; rond(c, X(l.x + 0.75), Y(l.y + 0.3, 0.2), T * 0.2); c.fill();
  } else {                          // la fontaine : un bassin rond, de l'eau, un jet
    c.fillStyle = '#5d6377'; ell(c, l.x, l.y, 0.75, 0.35); c.fill(); c.fillRect(X(l.x - 0.75), Y(l.y, 0.35), 1.5 * T, 0.35 * T);
    c.fillStyle = '#4b5063'; ell(c, l.x, l.y, 0.75); c.fill();
    c.fillStyle = '#5fb4ff'; ell(c, l.x, l.y, 0.6, 0.35); c.fill();
    c.fillStyle = '#7c8296'; c.fillRect(X(l.x) - T * 0.08, Y(l.y, 1.1), T * 0.16, T * 0.75);
    c.strokeStyle = 'rgba(160,220,255,.8)'; c.lineWidth = 2;
    for (var k = 0; k < 4; k++) { var a = k / 4 * Math.PI * 2 + t; c.beginPath(); c.moveTo(X(l.x), Y(l.y, 1.1)); c.quadraticCurveTo(X(l.x + Math.cos(a) * 0.35), Y(l.y, 1.45), X(l.x + Math.cos(a) * 0.5), Y(l.y + Math.sin(a) * 0.2, 0.4)); c.stroke(); }
  }
}

/* ---------- Grosbec de lumière : un être d'énergie rouge, translucide, parcouru d'éclairs, le cœur qui bat ---------- */
function grosbec(c, S, ctx) {
  var T = V.T, t = S.reel, sh = 0, mal = P3.dernier(S, 'touche', 0.35), tambour = S.combat === 1 && S.T >= REG.combat1.tenir;
  if (mal) sh = Math.sin(t * 70) * T * 0.08;
  if (tambour) sh += Math.sin(t * 40) * T * 0.05;
  var lueur = 0.75 + 0.25 * Math.sin(t * 3);
  c.save();
  if (S.boss <= 0 && S.combat === 2) c.globalAlpha = 0.55;
  // la lueur : un grand halo derrière lui (pas de flou d'ombre : trop lent sur une vieille tablette)
  var hq = pt(0, 3.3, sh), halo = c.createRadialGradient(hq[0], hq[1], 0, hq[0], hq[1], T * 4.2);
  halo.addColorStop(0, 'rgba(255,60,45,' + (0.3 * lueur) + ')'); halo.addColorStop(1, 'rgba(255,60,45,0)'); c.fillStyle = halo; rond(c, hq[0], hq[1], T * 4.2); c.fill();
  // les jambes, les bras (pendant le tambour, les poings montent et descendent)
  var frappe = tambour ? Math.abs(Math.sin(t * 7)) : 0;
  ORDRE.forEach(function (n, i) {
    if (n === 'tete' || n === 'torse') return;
    var mode = tracePartie(c, i, sh);
    if ((n === 'brasG' || n === 'brasD') && frappe) { var f = FORME[n], a = pt(f.a[0], f.a[1], sh), b = pt(f.b[0], f.b[1] + frappe * 1.2, sh); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    if (mode === 'stroke') { var w0 = c.lineWidth; c.lineWidth = w0 * 1.7; c.strokeStyle = 'rgba(255,70,55,.13)'; c.stroke(); c.lineWidth = w0; }
    remplir(c, mode, 'rgba(255,70,55,' + (0.38 * lueur) + ')');
  });
  var tq = pt(0, FORME.torse.z, sh), g = c.createRadialGradient(tq[0], tq[1], 0, tq[0], tq[1], FORME.torse.rz * T * 1.1);
  g.addColorStop(0, 'rgba(255,140,110,.62)'); g.addColorStop(1, 'rgba(255,50,40,.28)');
  tracePartie(c, 1, sh); c.fillStyle = g; c.fill();
  tracePartie(c, 0, sh); c.fillStyle = 'rgba(255,90,70,' + (0.45 * lueur) + ')'; c.fill();
  // les contours brillants
  ORDRE.forEach(function (n, i) {
    var mode = tracePartie(c, i, sh);
    if (mode === 'stroke') { var w = c.lineWidth; c.lineWidth = w; c.strokeStyle = 'rgba(255,150,120,.25)'; c.stroke(); c.lineWidth = Math.max(2, w * 0.18); c.strokeStyle = 'rgba(255,200,170,.55)'; c.stroke(); }
    else { c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,190,160,.8)'; c.stroke(); }
  });
  // les yeux et le bec (c'est Grosbec, rajeuni)
  var tt = pt(0, FORME.tete.z, sh);
  c.fillStyle = '#fff6c0'; rond(c, tt[0] - T * 0.24, tt[1] - T * 0.1, T * 0.09); c.fill(); rond(c, tt[0] + T * 0.24, tt[1] - T * 0.1, T * 0.09); c.fill();
  c.beginPath(); c.moveTo(tt[0] - T * 0.16, tt[1] + T * 0.05); c.lineTo(tt[0] + T * 0.16, tt[1] + T * 0.05); c.lineTo(tt[0], tt[1] + T * 0.45); c.closePath(); c.fillStyle = 'rgba(255,190,80,.85)'; c.fill();
  // les éclairs qui le parcourent (ils changent tout le temps)
  var bucket = Math.floor(t * 9);
  c.strokeStyle = 'rgba(255,235,220,.75)'; c.lineWidth = 1.5;
  for (var k = 0; k < 5; k++) {
    var x0 = tq[0] + (bruit(bucket * 13 + k) - 0.5) * T * 2, y0 = tq[1] + (bruit(bucket * 7 + k) - 0.5) * T * 2.6;
    c.beginPath(); c.moveTo(x0, y0);
    for (var j = 0; j < 4; j++) { x0 += (bruit(bucket * 31 + k * 5 + j) - 0.5) * T * 0.8; y0 += (bruit(bucket * 17 + k * 3 + j) - 0.5) * T * 0.8; c.lineTo(x0, y0); }
    c.stroke();
  }
  // le cœur qui bat
  var bat = 1 + 0.25 * Math.max(0, Math.sin(t * 6)), cg = c.createRadialGradient(tq[0], tq[1], 0, tq[0], tq[1], T * 0.45 * bat);
  cg.addColorStop(0, '#fff3d0'); cg.addColorStop(0.4, '#ffb060'); cg.addColorStop(1, 'rgba(255,80,40,0)');
  c.fillStyle = cg; rond(c, tq[0], tq[1], T * 0.45 * bat); c.fill();
  // la partie touchée s'éclaire (le bon sort)
  if (mal && mal.part !== undefined) { var u = (S.reel - mal.t) / 0.35; remplir(c, tracePartie(c, mal.part, sh), 'rgba(255,255,255,' + (0.8 * (1 - u)) + ')'); }
  // (R) la partie que MON villageois montre s'allume un instant, seulement sur ma tablette
  ctx.infos.forEach(function (x) {
    if (x.quoi !== 'part' || S.T - x.tA > 1.6) return;
    remplir(c, tracePartie(c, x.val, sh, 0.05), 'rgba(255,214,60,' + (0.45 + 0.35 * Math.sin(t * 14)) + ')');
  });
  // la partie que je vise : un trait blanc tout autour
  if (S.combat === 2 ? S.boss > 0 : true) {
    c.setLineDash([6, 5]); c.lineDashOffset = -t * 30;
    var md = tracePartie(c, S.cible, sh, 0.12);
    if (md === 'stroke') { var w2 = c.lineWidth; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = w2; c.globalAlpha *= 0.25; c.stroke(); c.globalAlpha = S.boss <= 0 && S.combat === 2 ? 0.55 : 1; }
    else { c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); }
    c.setLineDash([]);
  }
  // (R) la méga attaque : la charge ne se voit que sur la tablette du villageois qui prévient (une boule rouge au-dessus de sa tête)
  ctx.infos.forEach(function (x) {
    if (x.quoi !== 'mega') return;
    var k2 = cl((S.T - x.tA) / (x.tFin - x.tA), 0, 1), hp = pt(0, FORME.tete.z + 1.2, sh), R = T * (0.3 + 0.9 * k2) * (1 + 0.08 * Math.sin(t * 30));
    var rg = c.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], R * 1.6); rg.addColorStop(0, 'rgba(255,240,220,.95)'); rg.addColorStop(0.35, 'rgba(255,40,30,.9)'); rg.addColorStop(1, 'rgba(255,40,30,0)');
    c.fillStyle = rg; rond(c, hp[0], hp[1], R * 1.6); c.fill();
  });
  c.restore();
}

/* ---------- les personnages ---------- */
function perso(c, x, y, R, ic, coul, o) {
  o = o || {}; var T = V.T, r = REG.heros.r, z = o.z || 0;
  c.fillStyle = 'rgba(0,0,0,.4)'; ell(c, x, y, r); c.fill();
  var cx = X(x), cy = Y(y, 0.55 + z);
  c.globalAlpha = o.alpha || 1;
  rond(c, cx, cy, r * T * (o.taille || 1.1)); c.fillStyle = coul; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2.5; c.stroke();
  emoji(c, ic, cx, cy, T * 0.42 * (o.taille || 1.1) / 1.1);
  c.globalAlpha = 1;
  return [cx, cy];
}
function heros(c, S) {
  var h = S.h, R = ROLES[S.moi], T = V.T, r = REG.heros.r, z = 0, t = S.reel;
  if (h.saut) z = Math.sin(Math.min(1, h.saut.t / REG.saut.dur) * Math.PI) * 0.8;
  if (h.intouchable > 0 && Math.floor(t * 10) % 2) return;
  var p = perso(c, h.x, h.y, R, R.ic, R.c, {z: z}), cx = p[0], cy = p[1];
  c.fillStyle = '#fff'; rond(c, cx + h.dx * r * T * 1.25, cy + h.dy * r * T * K * 1.25, 3); c.fill();
  if (h.lance) {   // le sort qu'on lance (ou le soin) : un cercle qui se remplit
    var q = h.lance.t / h.lance.dur, col = h.lance.quoi === 'soin' ? '#5fe07a' : ECOUL[h.lance.quoi];
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 6; rond(c, cx, cy, r * T * 1.8); c.stroke();
    c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, r * T * 1.8, -Math.PI / 2, -Math.PI / 2 + q * Math.PI * 2); c.stroke();
  }
  if (h.bouclierFin > S.T) {   // la pierre de protection : une bulle
    var bq = (h.bouclierFin - S.T) / REG.bouclier.dure;
    c.fillStyle = 'rgba(110,190,255,.22)'; rond(c, cx, cy, r * T * 2.1); c.fill();
    c.strokeStyle = 'rgba(160,215,255,' + (0.5 + 0.5 * bq) + ')'; c.lineWidth = 3; c.stroke();
  }
  if (h.coupe > 0) { c.fillStyle = 'rgba(255,40,40,' + h.coupe * 1.6 + ')'; rond(c, cx, cy, r * T * 1.15); c.fill(); }
  var e = P3.dernier(S, 'soigne', 0.6); if (e) { var u = (S.reel - e.t) / 0.6; c.strokeStyle = 'rgba(95,224,122,' + (1 - u) + ')'; c.lineWidth = 3; rond(c, cx, cy, r * T * (1.2 + u * 2)); c.stroke(); }
}
function ami(c, S, a) {
  var R = ROLES[a.role];
  if (S.seul && a.mort > 0) { perso(c, a.x, a.y, R, '👻', '#555', {alpha: 0.35}); return; }   // un robot tombé : un fantôme
  perso(c, a.x, a.y, R, R.ic, R.c, {alpha: 0.92, taille: 1.0});
}
function villageois(c, S) {
  var v = S.villageois, VG = VILLAGEOIS[S.moi], p = perso(c, v.x, v.y, null, VG.ic, VG.c, {taille: 0.85});
  v.sx = p[0]; v.sy = p[1];
}

/* ---------- les bulles : celles de mon villageois (en images), et, en mode seul, celles de mes robots (écrites) ---------- */
function miniGrosbec(c, x, y, s, part) {
  var col = function (i) { return i === part ? '#ffd23a' : 'rgba(255,90,70,.55)'; };
  c.lineCap = 'round';
  [['brasG', -0.35, -0.05, -0.62, 0.32, 2], ['brasD', 0.35, -0.05, 0.62, 0.32, 3], ['jambeG', -0.13, 0.3, -0.2, 0.75, 4], ['jambeD', 0.13, 0.3, 0.2, 0.75, 5]].forEach(function (m) {
    c.strokeStyle = col(m[5]); c.lineWidth = s * 0.16; c.beginPath(); c.moveTo(x + m[1] * s, y + m[2] * s); c.lineTo(x + m[3] * s, y + m[4] * s); c.stroke();
  });
  c.lineCap = 'butt';
  c.fillStyle = col(1); c.beginPath(); c.ellipse(x, y + 0.08 * s, 0.3 * s, 0.32 * s, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = col(0); rond(c, x, y - 0.42 * s, 0.17 * s); c.fill();
}
function potion(c, x, y, s, coul) {
  c.fillStyle = coul; c.beginPath(); c.arc(x, y + s * 0.12, s * 0.32, 0, Math.PI * 2); c.fill();
  c.fillRect(x - s * 0.09, y - s * 0.42, s * 0.18, s * 0.3); c.strokeStyle = '#11141d'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#c9a26a'; c.fillRect(x - s * 0.11, y - s * 0.5, s * 0.22, s * 0.1);
}
function iconeLieu(c, x, y, s, i) {
  var n = REG.lieux[i].n;
  if (n === 'lanterne') { rr(c, x - s * 0.22, y - s * 0.3, s * 0.44, s * 0.6, 3); c.fillStyle = '#ffd23a'; c.fill(); c.fillStyle = '#fff4bf'; rr(c, x - s * 0.1, y - s * 0.18, s * 0.2, s * 0.36, 2); c.fill(); }
  else if (n === 'statue') { c.fillStyle = '#9aa1b5'; c.fillRect(x - s * 0.3, y + s * 0.18, s * 0.6, s * 0.18); rr(c, x - s * 0.15, y - s * 0.32, s * 0.3, s * 0.5, 3); c.fill(); c.fillStyle = '#7c8296'; rond(c, x + s * 0.32, y + s * 0.12, s * 0.1); c.fill(); }
  else { c.fillStyle = '#7c8296'; c.beginPath(); c.ellipse(x, y + s * 0.12, s * 0.38, s * 0.18, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#5fb4ff'; c.beginPath(); c.ellipse(x, y + s * 0.08, s * 0.3, s * 0.12, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#a8dcff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + s * 0.05); c.lineTo(x, y - s * 0.32); c.stroke(); }
}
function teteRonde(c, x, y, s, role) { var R = ROLES[role]; rond(c, x, y, s / 2); c.fillStyle = R.c; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2; c.stroke(); emoji(c, R.ic, x, y, s * 0.6); }
function bullesVillageois(c, S, ctx) {
  var v = S.villageois; if (v.sx === undefined || !ctx.infos.length) return;
  var s = Math.max(22, V.T * 0.85), pad = 5, y = v.sy - V.T * 0.45, t = S.reel;
  ctx.boites = [];
  ctx.infos.slice().sort(function (a, b) { return a.tA - b.tA; }).forEach(function (x, k) {
    var larg = x.quoi === 'zone' ? s + pad * 2 : s * 2 + pad * 3, haut = s + pad * 2, bx = v.sx - larg / 2, by = y - haut - 8 - k * (haut + 5);
    var mega = x.quoi === 'mega', fait = S.seul && S.relais[x.ref + x.quoi];
    c.fillStyle = mega ? 'rgba(70,10,14,.92)' : 'rgba(250,246,235,.95)'; rr(c, bx, by, larg, haut, 10); c.fill();
    c.strokeStyle = mega ? 'rgba(255,70,60,' + (0.6 + 0.4 * Math.sin(t * 18)) + ')' : (fait ? '#5fe07a' : '#11141d'); c.lineWidth = mega ? 3 : 2; c.stroke();
    if (k === 0) { c.beginPath(); c.moveTo(v.sx - 6, by + haut); c.lineTo(v.sx, by + haut + 8); c.lineTo(v.sx + 6, by + haut); c.fillStyle = mega ? 'rgba(70,10,14,.92)' : 'rgba(250,246,235,.95)'; c.fill(); }
    var cy = by + haut / 2, x1 = bx + pad + s / 2, x2 = bx + pad * 2 + s * 1.5;
    if (x.quoi === 'zone') iconeLieu(c, x1, cy, s, x.val);
    else {
      teteRonde(c, x1, cy, s * 0.9, x.cible);
      if (x.quoi === 'elem') potion(c, x2, cy, s, ECOUL[P3.ELEMS[x.val]]);
      else if (x.quoi === 'part') miniGrosbec(c, x2, cy, s * 0.95, x.val);
      else emoji(c, '🛡️', x2, cy, s * 0.8);
    }
    if (fait) emoji(c, '✅', bx + larg - 4, by + 4, 13);
    var tot = x.tFin - x.tA, reste = cl((x.tFin - S.T) / tot, 0, 1);
    c.fillStyle = mega ? '#ff5a4a' : 'rgba(0,0,0,.35)'; c.fillRect(bx + 8, by + haut - 4, (larg - 16) * reste, 2.5);
    ctx.boites.push({x: bx, y: by, w: larg, h: haut, info: x});
  });
}
function crisRobots(c, S) {   // mode seul : ce que mes robots me crient (pour l'essai, c'est écrit)
  var parAmi = {};
  S.cris.forEach(function (cr) { if (S.T >= cr.t) (parAmi[cr.de] = parAmi[cr.de] || []).push(cr); });
  for (var ro in parAmi) {
    var a = S.amis[ro], cx = X(a.x), cy = Y(a.y, 1.25), l = parAmi[ro].slice(-2);
    l.forEach(function (cr, k) {
      var txt = cr.sym ? cr.sym : (cr.x.quoi === 'mega' ? P3.MOTS.mega : cr.x.quoi === 'zone' ? P3.MOTS[REG.lieux[cr.x.val].n] : cr.x.quoi === 'elem' ? P3.MOTS[P3.ELEMS[cr.x.val]] : P3.MOTS[P3.PARTIES[cr.x.val]]);
      var fs = Math.max(13, Math.round(V.T * 0.42)), big = !!cr.sym;
      c.font = '900 ' + (big ? fs * 1.8 : fs) + 'px Nunito,' + EMO;
      var w = c.measureText(txt).width + 18, hh = (big ? fs * 1.8 : fs) + 14, by = cy - hh - 10 - k * (hh + 4);
      c.fillStyle = cr.x && cr.x.quoi === 'mega' ? 'rgba(90,12,16,.94)' : 'rgba(255,255,255,.96)'; rr(c, cx - w / 2, by, w, hh, 10); c.fill();
      c.strokeStyle = ROLES[ro].c; c.lineWidth = 3; c.stroke();
      c.fillStyle = cr.x && cr.x.quoi === 'mega' ? '#fff' : '#111'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, cx, by + hh / 2 + 1);
      if (cr.x && cr.x.quoi === 'part') miniGrosbec(c, cx + w / 2 + 16, by + hh / 2, 26, cr.x.val);
    });
  }
}

/* ---------- les éclairs, les sorts, les frappes ---------- */
function zigzag(c, x0, y0, x1, y1, n, amp, graine) {
  c.beginPath(); c.moveTo(x0, y0);
  for (var i = 1; i < n; i++) { var u = i / n, px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1, d = (bruit(graine + i * 3.7) - 0.5) * amp;
    c.lineTo(px + nx / l * d, py + ny / l * d); }
  c.lineTo(x1, y1);
}
function eclairs(c, S) {
  S.eclairs.forEach(function (e) {
    if (S.reel < e.t) return;
    var main = mainDe(e.main), cible;
    if (e.vers === 'moi') { if (!P3.vivant(S)) return; cible = [X(S.h.x), Y(S.h.y, 0.55)]; }
    else { var a = S.amis[e.vers]; if (!a || (S.seul && a.mort > 0)) return; cible = [X(a.x), Y(a.y, 0.55)]; }
    var u = (S.reel - e.t) / REG.eclair.montre, g = Math.floor(S.reel * 30) * 7 + e.t * 13;
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,60,50,' + (0.5 * (1 - u)) + ')'; c.lineWidth = 9; zigzag(c, main[0], main[1], cible[0], cible[1], 9, V.T * 0.7, g); c.stroke();
    c.strokeStyle = 'rgba(255,235,225,' + (1 - u) + ')'; c.lineWidth = 2.5; c.stroke();
    c.lineCap = 'butt';
  });
}
function sorts(c, S, ctx) {
  var t = S.reel;
  S.tirs.forEach(function (s) {
    var k = cl(s.t / REG.sort.vol, 0, 1), a = [X(s.x), Y(s.y, 0.8)], b = centrePartie(s.part);
    var x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k - Math.sin(k * Math.PI) * V.T * 0.8;
    c.fillStyle = ECOUL[s.quoi]; rond(c, x, y, V.T * 0.18); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
  });
  // les sorts de mes amis (pour l'image)
  for (var ro in S.amis) {
    var a2 = S.amis[ro];
    if (S.etat !== 'combat' || (S.seul && a2.mort > 0)) continue;
    var ph = (t + a2.prochainSort) % 3.4;
    if (ph < 0.35) { var kk = ph / 0.35, from = [X(a2.x), Y(a2.y, 0.8)], to = centrePartie(Math.floor(bruit(Math.floor((t + a2.prochainSort) / 3.4) + ro.length) * 6)), el = P3.ELEMS[Math.floor(bruit(a2.prochainSort * 9 + Math.floor(t / 3.4)) * 3)];
      c.globalAlpha = 0.7; c.fillStyle = ECOUL[el]; rond(c, from[0] + (to[0] - from[0]) * kk, from[1] + (to[1] - from[1]) * kk - Math.sin(kk * Math.PI) * V.T * 0.6, V.T * 0.13); c.fill(); c.globalAlpha = 1; }
  }
  // les rebonds : le sort repart sur le côté, gris
  S.evts.forEach(function (e) {
    var u = S.reel - e.t;
    if (e.type === 'rebond' && u < 0.45) { var p = centrePartie(e.part), d = u / 0.45; c.fillStyle = 'rgba(200,205,215,' + (1 - d) + ')'; rond(c, p[0] + d * V.T * 1.6, p[1] - d * V.T * 1.2 + d * d * V.T * 2, V.T * 0.15); c.fill();
      for (var i = 0; i < 5; i++) { c.fillStyle = 'rgba(220,225,235,' + (1 - d) + ')'; rond(c, p[0] + Math.cos(i * 1.3) * d * 30, p[1] + Math.sin(i * 1.3) * d * 20, 2); c.fill(); } }
    if (e.type === 'touche' && u < 0.4) { var q = centrePartie(e.part); c.strokeStyle = ECOUL[e.quoi]; c.globalAlpha = 1 - u / 0.4; c.lineWidth = 4; rond(c, q[0], q[1], V.T * (0.3 + u * 3)); c.stroke(); c.globalAlpha = 1; }
  });
}
function frappes(c, S) {
  var L = REG.salle, T = V.T;
  // la grosse zone : tout le sol explose, sauf l'endroit sûr (on le voit après coup)
  var z = P3.dernier(S, 'zone', 0.8);
  if (z) {
    var u = (S.reel - z.t) / 0.8, l = REG.lieux[z.lieu];
    c.save(); c.beginPath(); c.rect(X(0), Y(0), L.L * T, L.P * T * K); c.ellipse(X(l.x), Y(l.y), REG.surR * T, REG.surR * T * K, 0, 0, Math.PI * 2, true);
    c.fillStyle = 'rgba(255,' + Math.round(80 + 120 * u) + ',60,' + (0.85 * (1 - u)) + ')'; c.fill('evenodd'); c.restore();
    c.strokeStyle = 'rgba(255,230,140,' + (1 - u) + ')'; c.lineWidth = 4; ell(c, l.x, l.y, REG.surR); c.stroke();
  }
  // la méga attaque : un énorme rayon rouge qui tombe sur le visé
  var m = P3.dernier(S, 'mega', 0.6);
  if (m && (m.moi || m.vuIci)) {
    var u2 = (S.reel - m.t) / 0.6, hp = pt(0, FORME.tete.z + 1.2), cib = m.moi ? [X(S.h.x), Y(S.h.y, 0.55)] : [X(S.amis[m.cible].x), Y(S.amis[m.cible].y, 0.55)];
    c.lineCap = 'round'; c.strokeStyle = 'rgba(255,40,30,' + (0.85 * (1 - u2)) + ')'; c.lineWidth = T * 0.7; c.beginPath(); c.moveTo(hp[0], hp[1]); c.lineTo(cib[0], cib[1]); c.stroke();
    c.strokeStyle = 'rgba(255,240,220,' + (1 - u2) + ')'; c.lineWidth = T * 0.2; c.stroke(); c.lineCap = 'butt';
    if (m.moi && m.ok) for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; c.fillStyle = 'rgba(170,220,255,' + (1 - u2) + ')'; rond(c, cib[0] + Math.cos(a) * u2 * T * 1.6, cib[1] + Math.sin(a) * u2 * T, 3); c.fill(); }
  }
}

/* ---------- le haut de l'écran : la vie de Grosbec, mon symbole ---------- */
function barre(c, x, y, w, h, k, col) { c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, x - 2, y - 2, w + 4, h + 4, h / 2 + 2); c.fill(); c.fillStyle = col; rr(c, x, y, Math.max(0, w * k), h, h / 2); c.fill(); }
function haut(c, S, W, H) {
  var s = Math.max(0.7, Math.min(1.3, Math.min(W, H * 2) / 900)), aw = Math.min(W * 0.32, 320 * s), ax = W / 2 - aw / 2, ay = 12, hh = 16 * s;
  barre(c, ax, ay, aw, hh, S.boss / S.bossMax, S.combat === 2 && S.boss <= 0 ? '#ffd23a' : '#e2483c');
  // mon symbole : en grand au-dessus de Grosbec, puis il reste petit au bout de la barre
  if (S.combat === 2 && S.boss <= 0) {
    var e = P3.dernier(S, 'symbole', 3), R = ROLES[S.moi], sym = S.symboles[S.moi];
    if (e) { var k = (S.reel - e.t) / 3, f = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25, sx = W / 2, sy = ay + hh + 20 + (H * 0.22) * f, sz = 22 * s + 60 * s * f;
      c.fillStyle = 'rgba(0,0,0,' + 0.6 * f + ')'; rond(c, sx, sy, sz * 1.15); c.fill(); c.strokeStyle = R.c; c.lineWidth = 3 + 5 * f; c.stroke(); emoji(c, sym, sx, sy, sz * 1.25); if (k < 0.75) emoji(c, '📣', sx + sz * 1.3, sy - sz * 0.9, 30 * s); }
    else emoji(c, sym, ax + aw + 18 * s, ay + hh / 2, 20 * s);
  }
  if (S.h.coupe > 0.15) { c.strokeStyle = 'rgba(255,40,40,' + S.h.coupe + ')'; c.lineWidth = 12; c.strokeRect(0, 0, W, H); }
}

/* ---------- le film d'Odette (formes simples, sans un mot) ---------- */
function film(c, S, W, H) {
  var u = cl(1 - S.attente / REG.film, 0, 1), T = V.T, t = S.reel;
  salle(c, S); for (var i = 0; i < 3; i++) lieu(c, S, i);
  grosbec(c, S, {infos: []});
  c.fillStyle = 'rgba(0,0,10,' + (0.45 - 0.25 * u) + ')'; c.fillRect(0, 0, W, H);
  var heros = [S.moi].concat(Object.keys(S.amis)), places = [[6, 6], [8, 6], [5.6, 7.1], [8.4, 7.1]];
  var VGS = ['🥖', '🍺', '🗡️', '🌿'];
  heros.forEach(function (ro, k) {   // les héros à terre, qui se relèvent
    var p = places[k], debout = cl((u - 0.62) / 0.12, 0, 1), R = ROLES[ro];
    perso(c, p[0], p[1], R, debout > 0.5 ? R.ic : '💤', debout > 0.5 ? R.c : '#555', {alpha: 0.5 + 0.5 * debout});
    // les villageois arrivent depuis la gauche, chacun vers un héros, avec une pierre qui brille
    var arr = cl((u - 0.08 - k * 0.04) / 0.4, 0, 1), vx = -1 + (p[0] - 1.2 - (-1)) * arr, vy = p[1] + 0.9;
    perso(c, vx, vy, null, VGS[k], '#d9b98a', {taille: 0.85});
    if (u > 0.5) { var g = c.createRadialGradient(X(p[0]), Y(p[1], 0.55), 0, X(p[0]), Y(p[1], 0.55), T * 0.9); g.addColorStop(0, 'rgba(120,200,255,' + (0.6 * cl((u - 0.5) / 0.1, 0, 1)) + ')'); g.addColorStop(1, 'rgba(120,200,255,0)'); c.fillStyle = g; rond(c, X(p[0]), Y(p[1], 0.55), T * 0.9); c.fill(); }
    if (u > 0.8) potion(c, X(p[0]) + T * 0.5, Y(p[1], 1.35), T * 0.55, ECOUL.acide);
  });
  // Odette en tête, avec sa canne
  var ao = cl((u - 0.02) / 0.4, 0, 1), ox = -1 + 5.4 * ao;
  perso(c, ox, 5.2, null, '👵', '#c7a6e8', {taille: 1.05});
  c.strokeStyle = '#8b6b3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(ox) + T * 0.35, Y(5.2, 1)); c.lineTo(X(ox) + T * 0.45, Y(5.2, 0)); c.stroke();
}

/* ---------- tout ---------- */
function tout(c, S, vue, W, H, joy, ctx) {
  V.T = vue.T; V.ox = vue.ox; V.oy = vue.oy;
  c.fillStyle = '#070912'; c.fillRect(0, 0, W, H);
  if (S.etat === 'film' || S.etat === 'go') { film(c, S, W, H); return; }
  ctx.infos = P3.mesInfos(S); ctx.boites = [];
  var mort = !P3.vivant(S);
  salle(c, S);
  var objets = [];
  REG.lieux.forEach(function (l, i) { objets.push([l.y, function () { lieu(c, S, i); }]); });
  if (!mort) {   // (R) mort : on ne voit plus que le décor
    objets.push([B.y + 0.01, function () { grosbec(c, S, ctx); }]);
    for (var ro in S.amis) (function (a) { objets.push([a.y, function () { ami(c, S, a); }]); })(S.amis[ro]);
    objets.push([S.villageois.y, function () { villageois(c, S); }]);
    objets.push([S.h.y + 0.01, function () { heros(c, S); }]);
  }
  objets.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (o) { o[1](); });
  if (!mort) {
    frappes(c, S);
    eclairs(c, S);
    sorts(c, S, ctx);
    bullesVillageois(c, S, ctx);
    if (S.seul) crisRobots(c, S);
    haut(c, S, W, H);
  } else { var z = P3.dernier(S, 'zone', 0.8); if (z) frappes(c, S); }
  if (joy && joy.id !== null && !mort) {
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; rond(c, joy.bx, joy.by, joy.R); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; rond(c, joy.bx + joy.vx * joy.R, joy.by + joy.vy * joy.R, joy.R * 0.42); c.fill();
  }
  if (S.attente > 0 && S.etat === 'combat') { c.fillStyle = 'rgba(0,0,0,' + (0.35 * S.attente / REG.lancement) + ')'; c.fillRect(0, 0, W, H); }
}
function versSalle(sx, sy) { return [(sx - V.ox) / V.T, (sy - V.oy) / (V.T * K)]; }
G.Dessin = {tout: tout, ROLES: ROLES, VILLAGEOIS: VILLAGEOIS, K: K, versSalle: versSalle, X: X, Y: Y, partieSous: partieSous, centrePartie: centrePartie, V: V};
})(typeof window !== 'undefined' ? window : globalThis);
