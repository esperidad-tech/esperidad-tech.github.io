/* Le dessin de la version 4 : la salle vue d'en haut, en biais, sur tout l'écran ; Grosbec de lumière en volume (grosbec.js) ;
   la fontaine, la lanterne, la statue cassée ; mon héros, mes trois amis, mon villageois et sa bulle ;
   les attaques des quatre héros (la flèche de lumière du Pisteur, la fiole de l'Alchimiste, les ondes du Barde, la rune du Sage),
   les éclairs de Grosbec, la grosse zone qui fait jaillir le sol, le rayon de la méga attaque ; les étincelles (effets.js). */
(function (G) {
'use strict';
var P3 = G.P3, REG = P3.REG, GB = G.GB, Eff = G.Eff;
var ROLES = {barde: {c: '#ff8fb3', ic: '🎻', rgb: '255,140,190'}, sage: {c: '#6cb6ff', ic: '📜', rgb: '120,190,255'}, alchimiste: {c: '#b48cff', ic: '⚗️', rgb: '190,140,255'}, pisteur: {c: '#5fcf86', ic: '🏹', rgb: '110,255,150'}};
// (R) un villageois par tablette, toujours le même : Gaspard le boulanger, Margot la tavernière, Silas le garde, Iris l'herboriste
var VILLAGEOIS = {alchimiste: {ic: '🥖', c: '#e8c48a'}, barde: {ic: '🍺', c: '#d9a066'}, pisteur: {ic: '🗡️', c: '#9fb0c8'}, sage: {ic: '🌿', c: '#a8d08d'}};
var EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
var K = 0.55, V = {T: 40, ox: 0, oy: 0, W: 800, H: 400};   // (v3) un peu plus à plat : la salle tient sur un téléphone couché
var DESSUS = 5.6;   // (v3) ce qui dépasse au-dessus du mur du fond, en pas : la tête de Grosbec et la barre de sa vie
var TAU = Math.PI * 2;
function X(x) { return V.ox + x * V.T; }
function Y(y, z) { return V.oy + y * V.T * K - (z || 0) * V.T; }
function ell(c, x, y, r, z) { c.beginPath(); c.ellipse(X(x), Y(y, z), r * V.T, r * V.T * K, 0, 0, TAU); }
function rond(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, TAU); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function emoji(c, e, x, y, s) { c.font = Math.round(s) + 'px ' + EMO; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y + s * 0.04); }
function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
function bruit(i) { var s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); }
function toile(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
var B = REG.grosbec;
function piedsHeros(S) { return [X(S.h.x), Y(S.h.y, 0.6)]; }

/* ---------- la salle, peinte une fois (elle ne bouge pas) ---------- */
var fond = null, fondCle = '';
function salleCuite(W, H) {
  var cle = [W, H, V.T, V.ox, V.oy].join('|'); if (fond && fondCle === cle) return fond;
  fondCle = cle; var d = Math.min(2, window.devicePixelRatio || 1); fond = toile(W * d, H * d); var c = fond.getContext('2d'); c.scale(d, d);
  var L = REG.salle, T = V.T;
  var g = c.createLinearGradient(0, 0, 0, Y(0)); g.addColorStop(0, '#05070f'); g.addColorStop(1, '#1a1f33');
  c.fillStyle = g; c.fillRect(0, 0, W, Y(0));
  for (var i = -6; i < L.L + 7; i += 2) {   // les piliers du mur du fond
    var px = X(1 + i), gp = c.createLinearGradient(px - T * 0.3, 0, px + T * 0.3, 0);
    gp.addColorStop(0, '#0c1020'); gp.addColorStop(0.5, '#1c2238'); gp.addColorStop(1, '#0a0d19'); c.fillStyle = gp; c.fillRect(px - T * 0.3, 0, T * 0.6, Y(0));
  }
  c.fillStyle = '#12151f'; c.fillRect(0, Y(0), W, H - Y(0));
  var gs = c.createLinearGradient(0, Y(0), 0, Y(L.P)); gs.addColorStop(0, '#2b3146'); gs.addColorStop(1, '#1f2435');
  c.fillStyle = gs; c.fillRect(X(0), Y(0), L.L * T, L.P * T * K);
  c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1;
  for (var x = 0; x <= L.L; x++) { c.beginPath(); c.moveTo(X(x), Y(0)); c.lineTo(X(x), Y(L.P)); c.stroke(); }
  for (var y = 0; y <= L.P; y++) { c.beginPath(); c.moveTo(X(0), Y(y)); c.lineTo(X(L.L), Y(y)); c.stroke(); }
  c.strokeStyle = '#3a4560'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, Y(0)); c.lineTo(W, Y(0)); c.stroke();
  c.fillStyle = '#3a4560'; c.fillRect(X(0) - T * 0.22, Y(0), T * 0.22, L.P * T * K); c.fillRect(X(L.L), Y(0), T * 0.22, L.P * T * K);
  // la lumière rouge de Grosbec sur le mur et sur le sol (peinte avec la salle : elle coûte cher à peindre à chaque image)
  c.save(); c.globalCompositeOperation = 'lighter';
  Eff.halo(c, X(B.x), Y(B.y, 2.6), T * 7.5, '255,40,30', 0.3, 0);
  c.beginPath(); c.rect(0, Y(0), W, H - Y(0)); c.clip();
  c.translate(X(B.x), Y(B.y)); c.scale(1, K); Eff.halo(c, 0, 0, T * 8, '255,50,30', 0.38, 0.05);
  c.restore();
  return fond;
}
function salle(c, S, W, H) {
  c.drawImage(salleCuite(W, H), 0, 0, W, H);
  // la lueur sous ses pieds bat avec son cœur
  var t = S.reel, T = V.T, pul = Math.max(0, Math.sin(t * 6.2));
  if (pul > 0.05) { c.save(); c.globalCompositeOperation = 'lighter'; c.translate(X(B.x), Y(B.y)); c.scale(1, K); Eff.halo(c, 0, 0, T * 3, '255,80,40', 0.25 * pul, 0.1); c.restore(); }
}
function lieu(c, S, i) {
  var l = REG.lieux[i], T = V.T, t = S.reel;
  c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, l.x + 0.1, l.y + 0.1, 0.55); c.fill();
  if (l.n === 'lanterne') {
    c.fillStyle = '#2b3042'; c.fillRect(X(l.x) - T * 0.12, Y(l.y, 1.9), T * 0.24, T * 1.9);
    c.save(); c.globalCompositeOperation = 'lighter'; Eff.halo(c, X(l.x), Y(l.y, 2.1), T * 1.3, '255,210,80', 0.55 + 0.08 * Math.sin(t * 7), 0.3); c.restore();
    rr(c, X(l.x) - T * 0.28, Y(l.y, 2.45), T * 0.56, T * 0.7, 5); c.fillStyle = '#ffd23a'; c.fill(); c.strokeStyle = '#6b5200'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#fff4bf'; rr(c, X(l.x) - T * 0.14, Y(l.y, 2.32), T * 0.28, T * 0.42, 3); c.fill();
  } else if (l.n === 'statue') {
    c.fillStyle = '#5d6377'; c.fillRect(X(l.x) - T * 0.45, Y(l.y, 0.55), T * 0.9, T * 0.55);
    c.fillStyle = '#7c8296'; c.fillRect(X(l.x) - T * 0.45, Y(l.y, 0.62), T * 0.9, T * 0.1);
    c.fillStyle = '#9aa1b5'; rr(c, X(l.x) - T * 0.24, Y(l.y, 1.75), T * 0.48, T * 1.15, 6); c.fill();
    c.strokeStyle = '#9aa1b5'; c.lineWidth = T * 0.14; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(l.x) - T * 0.2, Y(l.y, 1.55)); c.lineTo(X(l.x) - T * 0.42, Y(l.y, 1.05)); c.stroke(); c.lineCap = 'butt';
    c.strokeStyle = '#3b4050'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(l.x) + T * 0.24, Y(l.y, 1.75)); c.lineTo(X(l.x) + T * 0.05, Y(l.y, 1.45)); c.lineTo(X(l.x) + T * 0.2, Y(l.y, 1.2)); c.stroke();
    c.fillStyle = '#9aa1b5'; rond(c, X(l.x + 0.75), Y(l.y + 0.3, 0.2), T * 0.2); c.fill();
  } else {
    c.fillStyle = '#5d6377'; ell(c, l.x, l.y, 0.75, 0.35); c.fill(); c.fillRect(X(l.x - 0.75), Y(l.y, 0.35), 1.5 * T, 0.35 * T);
    c.fillStyle = '#4b5063'; ell(c, l.x, l.y, 0.75); c.fill();
    c.fillStyle = '#5fb4ff'; ell(c, l.x, l.y, 0.6, 0.35); c.fill();
    c.fillStyle = '#7c8296'; c.fillRect(X(l.x) - T * 0.08, Y(l.y, 1.1), T * 0.16, T * 0.75);
    c.strokeStyle = 'rgba(160,220,255,.8)'; c.lineWidth = 2;
    for (var k = 0; k < 4; k++) { var a = k / 4 * TAU + t; c.beginPath(); c.moveTo(X(l.x), Y(l.y, 1.1)); c.quadraticCurveTo(X(l.x + Math.cos(a) * 0.35), Y(l.y, 1.45), X(l.x + Math.cos(a) * 0.5), Y(l.y + Math.sin(a) * 0.2, 0.4)); c.stroke(); }
  }
}

/* ---------- la grosse zone : pendant l'annonce, des veines de lumière rouge courent sur TOUT le sol (rien ne dit où se mettre) ;
   à la frappe, le sol jaillit partout sauf à l'endroit sûr ---------- */
var FLAMMES = [];
function flamme(i) {   // trois langues de feu d'énergie, peintes une fois
  if (FLAMMES[i]) return FLAMMES[i];
  var c = toile(64, 192), x = c.getContext('2d'), g = x.createLinearGradient(0, 192, 0, 0);
  g.addColorStop(0, 'rgba(255,250,230,1)'); g.addColorStop(0.12, 'rgba(255,200,130,.95)'); g.addColorStop(0.35, 'rgba(255,80,40,.8)'); g.addColorStop(0.75, 'rgba(200,10,30,.35)'); g.addColorStop(1, 'rgba(160,0,20,0)');
  x.fillStyle = g; var b = [0.3, -0.25, 0.1][i];
  x.beginPath(); x.moveTo(6, 192); x.bezierCurveTo(0, 120, 44 + b * 30, 90, 32 + b * 40, 0); x.bezierCurveTo(58, 70, 66, 130, 58, 192); x.closePath(); x.fill();
  var g2 = x.createRadialGradient(32, 186, 2, 32, 186, 30); g2.addColorStop(0, 'rgba(255,255,240,.9)'); g2.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = g2; x.fillRect(0, 150, 64, 42);
  return (FLAMMES[i] = c);
}
function annonceZone(c, S) {
  if (S.combat !== 2 || S.etat !== 'combat') return;
  var T = S.T, z = null, su = S.su;
  for (var i = 0; i < su.zones.length; i++) { var zz = su.zones[i]; if (zz.tA > T) break; if (T < zz.tI) z = zz; }
  if (!z) return;
  var u = (T - z.tA) / (z.tI - z.tA), L = REG.salle, t = S.reel;
  c.save(); c.beginPath(); c.rect(X(0), Y(0), L.L * V.T, L.P * V.T * K); c.clip(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = 'rgba(255,30,20,' + (0.05 + 0.13 * u * (0.7 + 0.3 * Math.sin(t * 9))) + ')'; c.fillRect(X(0), Y(0), L.L * V.T, L.P * V.T * K);
  // les veines : elles partent de ses pieds et poussent vers les bords
  c.lineCap = 'round';
  for (var v = 0; v < 10; v++) {
    var a = (v / 10) * Math.PI + 0.08 + bruit(z.id * 13 + v) * 0.2, x = B.x, y = B.y + 0.6, lg = (0.4 + u * 0.9) * (4 + bruit(z.id + v * 3) * 5);
    c.beginPath(); c.moveTo(X(x), Y(y));
    for (var s = 0; s < 9; s++) { a += (bruit(z.id * 7 + v * 11 + s) - 0.5) * 0.9; x += Math.cos(a) * lg / 9; y += Math.sin(a) * lg / 9 * 0.7; c.lineTo(X(x), Y(y)); }
    c.strokeStyle = 'rgba(255,60,40,' + (0.15 + 0.3 * u) + ')'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = 'rgba(255,200,150,' + (0.25 + 0.4 * u) + ')'; c.lineWidth = 1.3; c.stroke();
  }
  c.restore();
}
function frappes(c, S) {
  var L = REG.salle, T = V.T, t = S.reel;
  var z = P3.dernier(S, 'zone', 1.1);
  if (z) {
    var u = (t - z.t) / 1.1, l = REG.lieux[z.lieu], id = z.id || 1;
    c.save(); c.globalCompositeOperation = 'lighter';
    // le sol s'embrase (tout, sauf l'endroit sûr), en partant de ses pieds
    c.beginPath(); c.rect(X(0), Y(0), L.L * T, L.P * T * K); c.ellipse(X(l.x), Y(l.y), REG.surR * T, REG.surR * T * K, 0, 0, TAU, true);
    var gf = c.createRadialGradient(X(B.x), Y(B.y), 0, X(B.x), Y(B.y), T * 12 * Math.min(1, u * 3 + 0.2));
    gf.addColorStop(0, 'rgba(255,230,180,' + 0.8 * (1 - u) + ')'); gf.addColorStop(0.5, 'rgba(255,80,40,' + 0.6 * (1 - u) + ')'); gf.addColorStop(1, 'rgba(255,40,20,' + 0.25 * (1 - u) + ')');
    c.fillStyle = gf; c.fill('evenodd');
    // des geysers de lumière, partout, au hasard (les mêmes pour cette frappe), du fond vers l'avant
    var jets = [];
    for (var i = 0; i < 64; i++) { var gx = 0.3 + bruit(id * 31 + i * 1.7) * (L.L - 0.6), gy = 0.2 + bruit(id * 17 + i * 3.1) * (L.P - 0.4);
      if (Math.hypot(gx - l.x, gy - l.y) < REG.surR + 0.25) continue; jets.push([gx, gy, bruit(id + i * 5.3), i]); }
    jets.sort(function (a, b) { return a[1] - b[1]; });
    jets.forEach(function (j) {
      var d = Math.hypot(j[0] - B.x, j[1] - B.y), v = cl((u * 1.1 - d * 0.025) / 0.75, 0, 1); if (v <= 0 || v >= 1) return;   // l'onde part de ses pieds
      var hh = Math.sin(v * Math.PI) * T * (1.3 + 1.6 * j[2]) * (0.9 + 0.1 * Math.sin(t * 40 + j[3])), w = T * (0.45 + 0.35 * j[2]);
      c.globalAlpha = 0.9; c.drawImage(flamme(j[3] % 3), X(j[0]) - w / 2, Y(j[1]) - hh, w, hh);
    });
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,230,140,' + (1 - u) + ')'; c.lineWidth = 5; ell(c, l.x, l.y, REG.surR); c.stroke();
    Eff.halo(c, X(l.x), Y(l.y, 0.3), T * 1.6, '255,220,120', 0.6 * (1 - u), 0.5);
    c.restore();
  }
  // la méga attaque : un énorme rayon rouge qui tombe sur le visé (chez lui, et chez celui qui a prévenu)
  var m = P3.dernier(S, 'mega', 0.65);
  if (m && (m.moi || m.vuIci)) {
    var u2 = (t - m.t) / 0.65, cib = m.moi ? piedsHeros(S) : [X(S.amis[m.cible].x), Y(S.amis[m.cible].y, 0.6)];
    var src = GB.point(cib[0] < X(B.x) ? 'mainG' : 'mainD'), a = 1 - u2, wob = 1 + 0.15 * Math.sin(t * 60);
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[T * 1.1 * wob, 'rgba(255,30,40,' + 0.3 * a + ')'], [T * 0.55 * wob, 'rgba(255,70,60,' + 0.75 * a + ')'], [T * 0.18, 'rgba(255,245,230,' + a + ')']].forEach(function (s) { c.strokeStyle = s[1]; c.lineWidth = s[0]; c.beginPath(); c.moveTo(src[0], src[1]); c.lineTo(cib[0], cib[1]); c.stroke(); });
    Eff.halo(c, cib[0], cib[1], T * 2 * a, m.moi && m.ok ? '140,210,255' : '255,60,40', a, 0.8);
    c.restore();
  }
}

/* ---------- les éclairs de Grosbec : de sa main jusqu'au héros, en zigzag, avec des branches ---------- */
function zigzag(c, x0, y0, x1, y1, n, amp, graine) {
  c.beginPath(); c.moveTo(x0, y0); var pts = [];
  for (var i = 1; i < n; i++) { var u = i / n, px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1, d = (bruit(graine + i * 3.7) - 0.5) * amp * Math.sin(u * Math.PI) * 1.6;
    var q = [px + nx / l * d, py + ny / l * d]; pts.push(q); c.lineTo(q[0], q[1]); }
  c.lineTo(x1, y1); return pts;
}
function eclairs(c, S) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
  S.eclairs.forEach(function (e) {
    if (S.reel < e.t) return;
    var main = GB.point(e.main < 0 ? 'mainG' : 'mainD'), cible;
    if (e.vers === 'moi') { if (!P3.vivant(S)) return; cible = piedsHeros(S); }
    else { var a = S.amis[e.vers]; if (!a || (S.seul && a.mort > 0)) return; cible = [X(a.x), Y(a.y, 0.6)]; }
    var u = (S.reel - e.t) / REG.eclair.montre, g = Math.floor(S.reel * 30) * 7 + e.t * 13, f = 1 - u;
    var pts = zigzag(c, main[0], main[1], cible[0], cible[1], 11, V.T * 0.9, g);
    c.strokeStyle = 'rgba(255,40,40,' + 0.28 * f + ')'; c.lineWidth = 14; c.stroke();
    c.strokeStyle = 'rgba(255,120,110,' + 0.6 * f + ')'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = 'rgba(255,248,245,' + f + ')'; c.lineWidth = 2; c.stroke();
    [3, 7].forEach(function (k2, ib) { var p0 = pts[k2]; if (!p0) return; var ang = Math.atan2(cible[1] - main[1], cible[0] - main[0]) + (ib ? 0.7 : -0.7), L2 = V.T * (0.8 + bruit(g + ib) * 0.8);
      zigzag(c, p0[0], p0[1], p0[0] + Math.cos(ang) * L2, p0[1] + Math.sin(ang) * L2, 5, V.T * 0.4, g + 50 + ib); c.strokeStyle = 'rgba(255,200,200,' + 0.6 * f + ')'; c.lineWidth = 1.2; c.stroke(); });
    Eff.halo(c, main[0], main[1], V.T * 0.8 * f, '255,200,170', f, 0.8);
    Eff.halo(c, cible[0], cible[1], V.T * 0.9 * f, '255,90,80', f, 0.6);
  });
  c.restore();
}

/* ---------- les attaques des héros : chacun la sienne ---------- */
function trajet(S, s, role, depart) {   // où est l'attaque en ce moment, et dans quelle direction elle va
  var arrivee = GB.centrePartie(s.part), k, a, b, haut;
  if (s.retour) { a = arrivee; b = piedsHeros(S); k = cl(s.t / REG.sort.retour, 0, 1); haut = V.T * 0.6; }
  else { a = depart || [X(s.x), Y(s.y, 0.8)]; b = arrivee; k = cl(s.t / REG.sort.vol, 0, 1); haut = role === 'pisteur' ? V.T * 0.3 : role === 'alchimiste' ? V.T * 1.6 : V.T * 0.8; }
  var kk = role === 'pisteur' && !s.retour ? 1 - Math.pow(1 - k, 1.6) : k;
  var x = a[0] + (b[0] - a[0]) * kk, y = a[1] + (b[1] - a[1]) * kk - Math.sin(kk * Math.PI) * haut;
  var k2 = Math.min(1, kk + 0.03), x2 = a[0] + (b[0] - a[0]) * k2, y2 = a[1] + (b[1] - a[1]) * k2 - Math.sin(k2 * Math.PI) * haut;
  return {x: x, y: y, ang: Math.atan2(y2 - y, x2 - x), k: k};
}
function attaque(c, S, role, s, p, gris) {
  var R = ROLES[role], rgb = gris ? '255,214,120' : R.rgb, t = S.reel, T = V.T;
  c.save(); c.globalCompositeOperation = 'lighter';
  if (role === 'pisteur') {   // une flèche de lumière, rapide, avec une longue traînée
    var dx = Math.cos(p.ang), dy = Math.sin(p.ang), L = T * 1.4;
    var gr = c.createLinearGradient(p.x - dx * L * 1.6, p.y - dy * L * 1.6, p.x, p.y); gr.addColorStop(0, 'rgba(' + rgb + ',0)'); gr.addColorStop(1, 'rgba(' + rgb + ',.9)');
    c.strokeStyle = gr; c.lineWidth = T * 0.22; c.lineCap = 'round'; c.beginPath(); c.moveTo(p.x - dx * L * 1.6, p.y - dy * L * 1.6); c.lineTo(p.x, p.y); c.stroke();
    c.strokeStyle = 'rgba(255,255,250,.95)'; c.lineWidth = T * 0.07; c.beginPath(); c.moveTo(p.x - dx * L * 0.6, p.y - dy * L * 0.6); c.lineTo(p.x, p.y); c.stroke();
    c.fillStyle = 'rgba(255,255,240,.95)'; c.beginPath(); c.moveTo(p.x + dx * T * 0.32, p.y + dy * T * 0.32); c.lineTo(p.x - dy * T * 0.14, p.y + dx * T * 0.14); c.lineTo(p.x + dy * T * 0.14, p.y - dx * T * 0.14); c.closePath(); c.fill();
    Eff.halo(c, p.x, p.y, T * 0.7, rgb, 0.9, 0.7);
    if (Math.random() < 0.7) Eff.ajouter({x: p.x, y: p.y, vx: -dx * 60 + (Math.random() - 0.5) * 50, vy: -dy * 60 + (Math.random() - 0.5) * 50, max: 0.35, r: 2.2, rgb: rgb, sorte: 't'});
  } else if (role === 'alchimiste') {   // une fiole qui tourne en l'air ; des bulles derrière
    c.save(); c.translate(p.x, p.y); c.rotate(t * 14 * (gris ? -1 : 1)); c.globalCompositeOperation = 'source-over';
    var r = T * 0.2;
    c.fillStyle = 'rgba(210,190,255,.9)'; c.beginPath(); c.arc(0, r * 0.4, r, 0, TAU); c.fill();
    c.fillStyle = gris ? 'rgba(255,214,120,.95)' : 'rgba(150,255,120,.95)'; c.beginPath(); c.arc(0, r * 0.4, r * 0.8, 0.1, Math.PI - 0.1); c.fill();
    c.fillStyle = 'rgba(210,190,255,.9)'; c.fillRect(-r * 0.3, -r * 1.1, r * 0.6, r * 0.9); c.fillStyle = '#c9a26a'; c.fillRect(-r * 0.38, -r * 1.35, r * 0.76, r * 0.35);
    c.restore();
    Eff.halo(c, p.x, p.y, T * 0.7, gris ? rgb : '170,255,140', 0.7, 0.4);
    if (Math.random() < 0.6) Eff.ajouter({x: p.x + (Math.random() - 0.5) * 8, y: p.y, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, max: 0.5, r: 2.5, rgb: Math.random() < 0.5 ? '150,255,120' : '200,150,255'});
  } else if (role === 'barde') {   // des ondes de son, et des notes
    for (var i = 0; i < 3; i++) {
      var off = i * T * 0.28, ox = p.x - Math.cos(p.ang) * off, oy = p.y - Math.sin(p.ang) * off, rr2 = T * (0.35 + i * 0.12);
      c.strokeStyle = 'rgba(' + rgb + ',' + (0.9 - i * 0.25) + ')'; c.lineWidth = 3 - i * 0.6; c.beginPath(); c.arc(ox, oy, rr2, p.ang - 0.9, p.ang + 0.9); c.stroke();
    }
    Eff.halo(c, p.x, p.y, T * 0.6, rgb, 0.8, 0.6);
    if (Math.random() < 0.35) Eff.ajouter({x: p.x, y: p.y, vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 40, max: 0.7, r: 4, rgb: rgb, sorte: 'n', note: Math.random() < 0.5 ? '♪' : '♫'});
  } else {   // le Sage : une rune qui tourne, des éclats bleus
    c.save(); c.translate(p.x, p.y); c.rotate(t * 6);
    var r2 = T * 0.3;
    c.strokeStyle = 'rgba(' + rgb + ',.95)'; c.lineWidth = 2.2; c.beginPath(); c.arc(0, 0, r2, 0, TAU); c.stroke();
    c.beginPath(); for (var j = 0; j < 3; j++) { var an = j / 3 * TAU - Math.PI / 2; if (j) c.lineTo(Math.cos(an) * r2 * 0.8, Math.sin(an) * r2 * 0.8); else c.moveTo(Math.cos(an) * r2 * 0.8, Math.sin(an) * r2 * 0.8); } c.closePath(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, -r2 * 0.5); c.lineTo(0, r2 * 0.5); c.moveTo(-r2 * 0.4, 0); c.lineTo(r2 * 0.4, 0); c.stroke();
    c.restore();
    Eff.halo(c, p.x, p.y, T * 0.75, rgb, 0.85, 0.6);
    if (Math.random() < 0.5) Eff.ajouter({x: p.x, y: p.y, vx: (Math.random() - 0.5) * 70, vy: (Math.random() - 0.5) * 70, max: 0.4, r: 2.6, rgb: rgb, sorte: 'e'});
  }
  c.restore();
}
function mesAttaques(c, S) { S.tirs.forEach(function (s) { attaque(c, S, S.moi, s, trajet(S, s, S.moi), !!s.retour); }); }
/* les attaques de mes amis : pour l'image seulement (elles tapent au hasard : elles ne disent rien de la partie faible) */
var vuAmi = {};
function attaquesAmis(c, S) {
  if (S.etat !== 'combat' || S.attente > 0) return;
  var i = 0;
  for (var ro in S.amis) {
    var a = S.amis[ro], per = 3.6 + i * 0.55, ph = (S.reel + i * 1.3) % per, cyc = Math.floor((S.reel + i * 1.3) / per); i++;
    if (S.seul && a.mort > 0) continue;
    if (S.combat === 2 && S.seul && a.boss <= 0) continue;
    var part = Math.floor(bruit(cyc * 3 + i * 17) * 6), dep = [X(a.x), Y(a.y, 0.8)];
    if (ph < 0.5) attaque(c, S, ro, {t: ph, part: part, x: a.x, y: a.y}, trajet(S, {t: ph, part: part}, ro, dep), false);
    else if (vuAmi[ro] !== cyc && ph < 0.7) { vuAmi[ro] = cyc; var q = GB.centrePartie(part); Eff.gerbe(q[0], q[1], 7, {rgb: ROLES[ro].rgb, vit: 90, vie: 0.35, r: 2.4}); }
  }
}

/* ---------- les personnages ---------- */
var BOUCLIER = null;
function spriteBouclier() {
  if (BOUCLIER) return BOUCLIER;
  BOUCLIER = toile(160, 160); var x = BOUCLIER.getContext('2d'), s = 13;
  x.translate(80, 80); x.strokeStyle = 'rgba(170,225,255,.75)'; x.lineWidth = 1.6;
  for (var i = -6; i <= 6; i++) for (var j = -6; j <= 6; j++) {
    var hx = (i + (j % 2 ? 0.5 : 0)) * s * 1.73, hy = j * s * 1.5; if (Math.hypot(hx, hy) > 70) continue;
    x.beginPath(); for (var k = 0; k < 6; k++) { var an = k / 6 * TAU + Math.PI / 6; if (k) x.lineTo(hx + Math.cos(an) * s * 0.92, hy + Math.sin(an) * s * 0.92); else x.moveTo(hx + Math.cos(an) * s * 0.92, hy + Math.sin(an) * s * 0.92); } x.closePath(); x.stroke();
  }
  return BOUCLIER;
}
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
  // l'anneau de mon héros, au sol (pour me retrouver)
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(' + R.rgb + ',.55)'; c.lineWidth = 2; ell(c, h.x, h.y, r * 1.7); c.stroke(); c.restore();
  // la charge : un cercle de runes au sol, la lumière qui vient dans les mains (l'attaque) ; des étincelles vertes qui montent (le soin)
  if (h.lance) {
    var q = h.lance.t / h.lance.dur, soin = h.lance.quoi === 'soin', rgb = soin ? '110,240,140' : R.rgb, px = X(h.x), py = Y(h.y, 0.55 + z);
    c.save(); c.globalCompositeOperation = 'lighter';
    c.translate(X(h.x), Y(h.y)); c.scale(1, K); c.rotate(t * (soin ? 1.5 : 2.6));
    c.strokeStyle = 'rgba(' + rgb + ',' + (0.35 + 0.5 * q) + ')'; c.lineWidth = 2.5; c.setLineDash([T * 0.18, T * 0.1]); c.beginPath(); c.arc(0, 0, r * T * 2.6, 0, TAU); c.stroke(); c.setLineDash([]);
    c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, r * T * 1.9, 0, TAU * q); c.stroke();
    for (var i = 0; i < 6; i++) { var an = i / 6 * TAU; c.beginPath(); c.moveTo(Math.cos(an) * r * T * 1.9, Math.sin(an) * r * T * 1.9); c.lineTo(Math.cos(an) * r * T * 2.6, Math.sin(an) * r * T * 2.6); c.stroke(); }
    c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; Eff.halo(c, px, py - T * 0.2, T * (0.5 + 0.7 * q), rgb, 0.5 + 0.5 * q, 0.6); c.restore();
    if (Math.random() < 0.9) {
      if (soin) Eff.ajouter({x: px + (Math.random() - 0.5) * T, y: py + T * 0.3, vx: (Math.random() - 0.5) * 10, vy: -40 - Math.random() * 40, max: 0.7, r: 3, rgb: rgb, sorte: Math.random() < 0.3 ? 'n' : 'g', note: '✚'});
      else { var a2 = Math.random() * TAU, d = T * (1.1 + Math.random() * 0.5); Eff.ajouter({x: px + Math.cos(a2) * d, y: py + Math.sin(a2) * d * 0.7, vx: -Math.cos(a2) * d / 0.3, vy: -Math.sin(a2) * d * 0.7 / 0.3, frein: 1, max: 0.3, r: 2.4, rgb: rgb, sorte: 't'}); }
    }
  }
  var p = perso(c, h.x, h.y, R, R.ic, R.c, {z: z}), cx = p[0], cy = p[1];
  c.fillStyle = '#fff'; rond(c, cx + h.dx * r * T * 1.25, cy + h.dy * r * T * K * 1.25, 3); c.fill();
  if (h.lance) {   // le cercle qui se remplit
    var q2 = h.lance.t / h.lance.dur, col = h.lance.quoi === 'soin' ? '#5fe07a' : R.c;
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 6; rond(c, cx, cy, r * T * 1.8); c.stroke();
    c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, r * T * 1.8, -Math.PI / 2, -Math.PI / 2 + q2 * TAU); c.stroke();
  }
  if (h.bouclierFin > S.T) {   // la pierre de protection : une bulle d'hexagones qui tourne
    var bq = (h.bouclierFin - S.T) / REG.bouclier.dure, Rb = r * T * 2.3;
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(90,170,255,' + (0.14 + 0.08 * Math.sin(t * 9)) + ')'; rond(c, cx, cy, Rb); c.fill();
    c.save(); c.beginPath(); c.arc(cx, cy, Rb, 0, TAU); c.clip(); c.translate(cx, cy); c.rotate(t * 0.6); c.globalAlpha = 0.45 + 0.4 * bq; var sb = spriteBouclier(); c.drawImage(sb, -Rb * 1.15, -Rb * 1.15, Rb * 2.3, Rb * 2.3); c.restore();
    c.strokeStyle = 'rgba(190,230,255,' + (0.6 + 0.4 * bq) + ')'; c.lineWidth = 3; rond(c, cx, cy, Rb); c.stroke();
    Eff.halo(c, cx, cy, Rb * 1.5, '120,190,255', 0.35, 0.2);
    c.restore();
  }
  if (h.coupe > 0) { c.fillStyle = 'rgba(255,40,40,' + h.coupe * 1.6 + ')'; rond(c, cx, cy, r * T * 1.15); c.fill(); }
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

/* ---------- la bulle (une seule à la fois) : celle de mon villageois en images (l'endroit sûr, le bouclier pour un ami) ;
   en mode seul, ce que me crie un robot, écrit ---------- */
function miniGrosbec(c, x, y, s, part) {
  var col = function (i) { return i === part ? '#ffd23a' : 'rgba(255,90,70,.55)'; };
  c.lineCap = 'round';
  [['brasG', -0.35, -0.05, -0.62, 0.32, 2], ['brasD', 0.35, -0.05, 0.62, 0.32, 3], ['jambeG', -0.13, 0.3, -0.2, 0.75, 4], ['jambeD', 0.13, 0.3, 0.2, 0.75, 5]].forEach(function (m) {
    c.strokeStyle = col(m[5]); c.lineWidth = s * 0.16; c.beginPath(); c.moveTo(x + m[1] * s, y + m[2] * s); c.lineTo(x + m[3] * s, y + m[4] * s); c.stroke();
  });
  c.lineCap = 'butt';
  c.fillStyle = col(1); c.beginPath(); c.ellipse(x, y + 0.08 * s, 0.3 * s, 0.32 * s, 0, 0, TAU); c.fill();
  c.fillStyle = col(0); rond(c, x, y - 0.42 * s, 0.17 * s); c.fill();
}
function iconeLieu(c, x, y, s, i) {
  var n = REG.lieux[i].n;
  if (n === 'lanterne') { rr(c, x - s * 0.22, y - s * 0.3, s * 0.44, s * 0.6, 3); c.fillStyle = '#ffd23a'; c.fill(); c.fillStyle = '#fff4bf'; rr(c, x - s * 0.1, y - s * 0.18, s * 0.2, s * 0.36, 2); c.fill(); }
  else if (n === 'statue') { c.fillStyle = '#9aa1b5'; c.fillRect(x - s * 0.3, y + s * 0.18, s * 0.6, s * 0.18); rr(c, x - s * 0.15, y - s * 0.32, s * 0.3, s * 0.5, 3); c.fill(); c.fillStyle = '#7c8296'; rond(c, x + s * 0.32, y + s * 0.12, s * 0.1); c.fill(); }
  else { c.fillStyle = '#7c8296'; c.beginPath(); c.ellipse(x, y + s * 0.12, s * 0.38, s * 0.18, 0, 0, TAU); c.fill(); c.fillStyle = '#5fb4ff'; c.beginPath(); c.ellipse(x, y + s * 0.08, s * 0.3, s * 0.12, 0, 0, TAU); c.fill(); c.strokeStyle = '#a8dcff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + s * 0.05); c.lineTo(x, y - s * 0.32); c.stroke(); }
}
function teteRonde(c, x, y, s, role) { var R = ROLES[role]; rond(c, x, y, s / 2); c.fillStyle = R.c; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2; c.stroke(); emoji(c, R.ic, x, y, s * 0.6); }
function texteCri(bu) {
  if (bu.sym) return bu.sym;
  var x = bu.x;
  return x.quoi === 'mega' ? P3.MOTS.mega : x.quoi === 'zone' ? P3.MOTS[REG.lieux[x.val].n] : P3.MOTS[P3.PARTIES[x.val]];
}
function bulle(c, S, ctx) {
  var bu = S.bulle; ctx.boites = [];
  if (!bu) return;
  var t = S.reel, x = bu.x, pop = cl((S.T - bu.debut) / 0.16, 0, 1), sc = 0.6 + 0.4 * pop;
  var cx, cy, larg, haut, s, pad, mega = !!(x && x.quoi === 'mega'), fs = 16;
  if (bu.type === 'villageois') {
    var v = S.villageois; if (v.sx === undefined) return;
    s = Math.max(28, V.T * 1.0); pad = 7;
    larg = x.quoi === 'zone' ? s + pad * 2 : s * 2 + pad * 3; haut = s + pad * 2;
    cx = v.sx; cy = v.sy - V.T * 0.5;
  } else {
    var a = S.amis[bu.de], txt = texteCri(bu), big = !!bu.sym; fs = Math.max(15, Math.round(V.T * 0.46));
    c.font = '900 ' + (big ? fs * 1.8 : fs) + 'px Nunito,' + EMO;
    larg = c.measureText(txt).width + 22 + (x && x.quoi === 'part' ? fs * 1.9 : 0); haut = (big ? fs * 1.8 : fs) + 16;
    cx = X(a.x); cy = Y(a.y, 1.3);
  }
  var bx = cl(cx - larg / 2, 6, V.W - larg - 6), by = Math.max(6, cy - haut - 10);
  (ctx.evite || []).forEach(function (o) {   // (v3) jamais sous un bouton : on la pousse vers le milieu de l'écran
    var px = cl(o.x, bx, bx + larg), py = cl(o.y, by, by + haut);
    if (Math.hypot(px - o.x, py - o.y) >= o.r + 4) return;
    if (o.x < V.W / 2) bx = Math.max(bx, o.x + o.r + 6); else bx = Math.min(bx, o.x - o.r - 6 - larg);
  });
  c.save(); c.translate(cx, by + haut); c.scale(sc, sc); c.translate(-cx, -(by + haut));
  var fond2 = mega ? 'rgba(70,10,14,.94)' : 'rgba(250,246,235,.97)';
  c.fillStyle = fond2; rr(c, bx, by, larg, haut, 11); c.fill();
  c.strokeStyle = mega ? 'rgba(255,70,60,' + (0.6 + 0.4 * Math.sin(t * 18)) + ')' : bu.type === 'ami' ? ROLES[bu.de].c : '#11141d'; c.lineWidth = mega || bu.type === 'ami' ? 3 : 2; c.stroke();
  var qx = cl(cx, bx + 12, bx + larg - 12);
  c.beginPath(); c.moveTo(qx - 7, by + haut - 1); c.lineTo(cx, by + haut + 9); c.lineTo(qx + 7, by + haut - 1); c.fillStyle = fond2; c.fill();
  var my = by + haut / 2;
  if (bu.type === 'villageois') {
    var x1 = bx + pad + s / 2, x2 = bx + pad * 2 + s * 1.5;
    if (x.quoi === 'zone') iconeLieu(c, x1, my, s, x.val);
    else { teteRonde(c, x1, my, s * 0.9, x.cible); emoji(c, '🛡️', x2, my, s * 0.8); }
    var reste = cl((x.tFin - S.T) / (x.tFin - x.tA), 0, 1);
    c.fillStyle = mega ? '#ff5a4a' : 'rgba(0,0,0,.35)'; c.fillRect(bx + 9, by + haut - 4.5, (larg - 18) * reste, 2.5);
    ctx.boites.push({x: bx, y: by, w: larg, h: haut, info: x});
  } else {
    c.fillStyle = mega ? '#fff' : '#111'; c.textAlign = 'center'; c.textBaseline = 'middle';
    var tx = x && x.quoi === 'part' ? bx + (larg - fs * 1.9) / 2 : bx + larg / 2;
    c.fillText(texteCri(bu), tx, my + 1);
    if (x && x.quoi === 'part') miniGrosbec(c, bx + larg - fs * 1.05, my, fs * 1.45, x.val);
  }
  c.restore();
}

/* ---------- le haut de l'écran : la vie de Grosbec (elle tremble quand on le touche), mon symbole ---------- */
function barre(c, x, y, w, h, k, col) { c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, x - 2, y - 2, w + 4, h + 4, h / 2 + 2); c.fill(); c.fillStyle = col; rr(c, x, y, Math.max(0, w * k), h, h / 2); c.fill(); }
function haut(c, S, W, H) {
  var s = Math.max(0.7, Math.min(1.3, Math.min(W, H * 2) / 900)), aw = Math.min(W * 0.32, 320 * s), ax = W / 2 - aw / 2, ay = 12, hh = 16 * s;
  var e0 = P3.dernier(S, 'touche', 0.35);
  if (e0) { var u0 = (S.reel - e0.t) / 0.35; ax += Math.sin(S.reel * 80) * 4 * (1 - u0); }
  barre(c, ax, ay, aw, hh, S.boss / S.bossMax, S.combat === 2 && S.boss <= 0 ? '#ffd23a' : '#e2483c');
  if (e0) { var u1 = (S.reel - e0.t) / 0.35, xk = ax + aw * S.boss / S.bossMax; c.fillStyle = 'rgba(255,255,255,' + (1 - u1) + ')'; rr(c, xk - 2, ay - 2, aw / S.bossMax + 4, hh + 4, 4); c.fill(); }
  if (S.combat === 2 && S.boss <= 0) {
    var e = P3.dernier(S, 'symbole', 3), R = ROLES[S.moi], sym = S.symboles[S.moi];
    if (e) { var k = (S.reel - e.t) / 3, f = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25, sx = W / 2, sy = ay + hh + 20 + (H * 0.22) * f, sz = 22 * s + 60 * s * f;
      c.fillStyle = 'rgba(0,0,0,' + 0.6 * f + ')'; rond(c, sx, sy, sz * 1.15); c.fill(); c.strokeStyle = R.c; c.lineWidth = 3 + 5 * f; c.stroke(); emoji(c, sym, sx, sy, sz * 1.25); if (k < 0.75) emoji(c, '📣', sx + sz * 1.3, sy - sz * 0.9, 30 * s); }
    else emoji(c, sym, ax + aw + 18 * s, ay + hh / 2, 20 * s);
  }
  if (S.h.coupe > 0.15) { c.strokeStyle = 'rgba(255,40,40,' + S.h.coupe + ')'; c.lineWidth = 12; c.strokeRect(0, 0, W, H); }
}

/* ---------- le film d'Odette (formes simples, sans un mot) ---------- */
function potion(c, x, y, s, coul) {
  c.fillStyle = coul; c.beginPath(); c.arc(x, y + s * 0.12, s * 0.32, 0, TAU); c.fill();
  c.fillRect(x - s * 0.09, y - s * 0.42, s * 0.18, s * 0.3); c.strokeStyle = '#11141d'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#c9a26a'; c.fillRect(x - s * 0.11, y - s * 0.5, s * 0.22, s * 0.1);
}
function film(c, S, W, H) {
  var u = cl(1 - S.attente / REG.film, 0, 1), T = V.T, t = S.reel;
  salle(c, S, W, H); for (var i = 0; i < 3; i++) lieu(c, S, i);
  GB.dessiner(c, S);
  c.fillStyle = 'rgba(0,0,10,' + (0.45 - 0.25 * u) + ')'; c.fillRect(0, 0, W, H);
  var heros = [S.moi].concat(Object.keys(S.amis)), places = [[6.8, 4.2], [9.2, 4.2], [5.8, 5.6], [10.2, 5.6]];
  var VGS = ['🥖', '🍺', '🗡️', '🌿'];
  heros.forEach(function (ro, k) {
    var p = places[k], debout = cl((u - 0.62) / 0.12, 0, 1), R = ROLES[ro];
    perso(c, p[0], p[1], R, debout > 0.5 ? R.ic : '💤', debout > 0.5 ? R.c : '#555', {alpha: 0.5 + 0.5 * debout});
    var arr = cl((u - 0.08 - k * 0.04) / 0.4, 0, 1), vx = -1 + (p[0] - 1.2 - (-1)) * arr, vy = p[1] + 0.9;
    perso(c, vx, vy, null, VGS[k], '#d9b98a', {taille: 0.85});
    if (u > 0.5) { c.save(); c.globalCompositeOperation = 'lighter'; Eff.halo(c, X(p[0]), Y(p[1], 0.55), T * 0.9, '120,200,255', 0.6 * cl((u - 0.5) / 0.1, 0, 1), 0.5); c.restore(); }
    if (u > 0.8) potion(c, X(p[0]) + T * 0.5, Y(p[1], 1.35), T * 0.55, '#8fe03a');
  });
  var ao = cl((u - 0.02) / 0.4, 0, 1), ox = -1 + 5.4 * ao;
  perso(c, ox, 4.9, null, '👵', '#c7a6e8', {taille: 1.05});
  c.strokeStyle = '#8b6b3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(ox) + T * 0.35, Y(4.9, 1)); c.lineTo(X(ox) + T * 0.45, Y(4.9, 0)); c.stroke();
}

/* ---------- les nouveautés de la partie : les étincelles qui vont avec ---------- */
var vuEvt = -1, vuEcl = -1;
function nouveautes(S) {
  var T = V.T;
  S.evts.forEach(function (e) {
    if (e._d) return; e._d = 1;
    var R = ROLES[S.moi], hp = piedsHeros(S);
    if (e.type === 'touche') {
      var q = GB.centrePartie(e.part);
      Eff.gerbe(q[0], q[1], 26, {rgb: R.rgb, vit: 320, vie: 0.5, r: 3, sorte: 't', blanc: 0.8});
      Eff.gerbe(q[0], q[1], 14, {rgb: '255,90,60', vit: 220, vie: 0.8, r: 4, sorte: 'e', g: 300});
      Eff.gerbe(q[0], q[1], 10, {rgb: '255,230,200', vit: 120, vie: 0.5, r: 6});
      Eff.onde(q[0], q[1], T * 0.3, T * 1.9, 0.45, '255,240,220', 4); Eff.onde(q[0], q[1], T * 0.2, T * 1.2, 0.35, R.rgb, 3);
      Eff.secouer(7);
    } else if (e.type === 'rebond') {
      var q2 = GB.centrePartie(e.part);
      Eff.hexa(q2[0], q2[1], T * 0.9, 0.45);
      Eff.gerbe(q2[0], q2[1], 12, {rgb: '255,214,110', vit: 200, vie: 0.4, r: 2.5, sorte: 't'});
    } else if (e.type === 'retour') {
      Eff.gerbe(hp[0], hp[1], 22, {rgb: '255,80,60', vit: 240, vie: 0.5, r: 3, sorte: 't'}); Eff.onde(hp[0], hp[1], 4, T * 1.4, 0.4, '255,120,90', 4, K); Eff.secouer(5);
    } else if (e.type === 'part') {
      Eff.gerbe(hp[0], hp[1] - T * 0.3, 12, {rgb: R.rgb, vit: 160, vie: 0.35, r: 2.5, sorte: 't'}); Eff.onde(hp[0], hp[1] - T * 0.3, 4, T * 0.9, 0.3, R.rgb, 3);
    } else if (e.type === 'zone') {
      var L = REG.salle;
      Eff.secouer(14); Eff.onde(X(B.x), Y(B.y), T, T * 14, 0.8, '255,120,80', 6, K);
      for (var i = 0; i < 70; i++) { var gx = Math.random() * L.L, gy = Math.random() * L.P, l = REG.lieux[e.lieu]; if (Math.hypot(gx - l.x, gy - l.y) < REG.surR) continue;
        Eff.ajouter({x: X(gx), y: Y(gy), vx: (Math.random() - 0.5) * 40, vy: -120 - Math.random() * 160, g: 220, max: 0.9, r: 3, rgb: Math.random() < 0.5 ? '255,120,60' : '255,220,150'}); }
      var lu = REG.lieux[e.lieu]; Eff.gerbe(X(lu.x), Y(lu.y), 20, {rgb: '255,220,120', vit: 90, vie: 0.8, r: 3, monte: 60});
    } else if (e.type === 'mega' && (e.moi || e.vuIci)) {
      var cib = e.moi ? hp : [X(S.amis[e.cible].x), Y(S.amis[e.cible].y, 0.6)];
      if (e.moi && e.ok) { Eff.gerbe(cib[0], cib[1] - T * 0.3, 40, {rgb: '150,210,255', vit: 300, vie: 0.6, r: 3, sorte: 't'}); Eff.onde(cib[0], cib[1] - T * 0.3, T * 0.5, T * 2.2, 0.5, '160,220,255', 5); }
      else { Eff.gerbe(cib[0], cib[1], 50, {rgb: '255,60,40', vit: 340, vie: 0.7, r: 4, sorte: 't'}); Eff.onde(cib[0], cib[1], 4, T * 2.6, 0.6, '255,80,60', 6, K); }
      Eff.secouer(e.moi ? 11 : 5);
    } else if (e.type === 'saut') { Eff.onde(hp[0], hp[1] + T * 0.3, 2, T * 0.9, 0.35, '200,200,220', 2, K); Eff.gerbe(hp[0], hp[1] + T * 0.3, 8, {rgb: '180,180,200', vit: 60, vie: 0.4, r: 4, sorte: 'f'}); }
    else if (e.type === 'soigne') { Eff.gerbe(hp[0], hp[1], 24, {rgb: '110,240,140', vit: 80, vie: 0.8, r: 3, monte: 80}); Eff.onde(hp[0], hp[1], 4, T * 1.3, 0.5, '110,240,140', 3, K); }
    else if (e.type === 'bouclier') Eff.onde(hp[0], hp[1] - T * 0.3, T * 0.3, T * 1.4, 0.4, '150,210,255', 4);
    else if (e.type === 'mort') { Eff.gerbe(hp[0], hp[1], 30, {rgb: '255,100,80', vit: 200, vie: 0.7, r: 3, sorte: 't'}); Eff.secouer(9); }
    else if (e.type === 'relais') Eff.onde(hp[0], hp[1] - T * 0.4, T * 0.3, T * 2.2, 0.5, '255,214,90', 3);
    else if (e.type === 'symbole') { Eff.gerbe(V.W / 2, 60, 40, {rgb: '255,214,90', vit: 260, vie: 0.9, r: 3, sorte: 't'}); }
    else if (e.type === 'victoire') { var cc = GB.point('coeur'); Eff.gerbe(cc[0], cc[1], 120, {rgb: '255,220,160', vit: 420, vie: 1.4, r: 4, sorte: 't'}); Eff.onde(cc[0], cc[1], 10, V.W * 0.8, 1.4, '255,230,200', 8); Eff.secouer(16); }
    else if (e.type === 'tambour') Eff.secouer(8);
  });
  // les éclairs : des étincelles là où ils frappent
  S.eclairs.forEach(function (e) {
    if (e._d || e.t > S.reel) return; e._d = 1;
    var cible;
    if (e.vers === 'moi') { if (!P3.vivant(S)) return; cible = piedsHeros(S); } else { var a = S.amis[e.vers]; if (!a) return; cible = [X(a.x), Y(a.y, 0.6)]; }
    Eff.gerbe(cible[0], cible[1], 10, {rgb: '255,220,220', vit: 180, vie: 0.3, r: 2, sorte: 't'});
  });
  // le tambour : la salle tremble à chaque coup de poing
  if (S.combat === 1 && S.T >= REG.combat1.tenir && S.etat === 'combat') { var ph = (S.T - REG.combat1.tenir) * 3.2; if (ph % 1 < 0.08) { Eff.secouer(6); var pn = GB.point(Math.floor(ph) % 2 ? 'mainD' : 'mainG'); Eff.onde(pn[0], pn[1], 4, V.T * 3, 0.4, '255,90,60', 4, K); } }
}

/* ---------- tout ---------- */
var dernierReel = null;
function tout(c, S, vue, W, H, joy, ctx) {
  V.T = vue.T; V.ox = vue.ox; V.oy = vue.oy; V.W = W; V.H = H;
  GB.cadre(vue, K);
  var dt = dernierReel === null ? 0 : cl(S.reel - dernierReel, 0, 0.1); dernierReel = S.reel;
  GB.maj(S, dt); Eff.maj(dt);
  c.fillStyle = '#070912'; c.fillRect(0, 0, W, H);
  var sec = Eff.decalage(); c.save(); c.translate(sec[0], sec[1]);
  if (S.etat === 'film' || S.etat === 'go') { film(c, S, W, H); c.restore(); return; }
  ctx.boites = [];
  var mort = !P3.vivant(S);
  salle(c, S, W, H);
  annonceZone(c, S);
  if (!mort) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.16; c.beginPath(); c.rect(0, Y(0), W, H - Y(0)); c.clip(); GB.reflet(c); c.restore(); }
  var objets = [];
  REG.lieux.forEach(function (l, i) { objets.push([l.y, function () { lieu(c, S, i); }]); });
  if (!mort) {   // (R) mort : on ne voit plus que le décor
    objets.push([B.y + 0.01, function () { GB.dessiner(c, S); if (S.combat === 2 ? S.boss > 0 : true) GB.traceVisee(c, S.cible, S.reel); }]);
    for (var ro in S.amis) (function (a) { objets.push([Math.min(a.y, S.h.y - 0.001), function () { ami(c, S, a); }]); })(S.amis[ro]);   // (v3) un ami ne passe jamais devant mon héros
    objets.push([S.villageois.y, function () { villageois(c, S); }]);
    objets.push([S.h.y + 0.01, function () { heros(c, S); }]);
  }
  objets.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (o) { o[1](); });
  if (!mort) {
    nouveautes(S);
    frappes(c, S);
    eclairs(c, S);
    attaquesAmis(c, S);
    mesAttaques(c, S);
    Eff.dessiner(c);
    bulle(c, S, ctx);
    haut(c, S, W, H);
  } else { var z = P3.dernier(S, 'zone', 1.1); if (z) frappes(c, S); nouveautes(S); }
  c.restore();
  if (joy && joy.id === null && !mort && joy.rx) {   // (v3) le pouce gauche au repos : un rond pâle, pour savoir où le poser
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 2; rond(c, joy.rx, joy.ry, joy.R); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.1)'; rond(c, joy.rx, joy.ry, joy.R * 0.42); c.fill();
  }
  if (joy && joy.id !== null && !mort) {
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; rond(c, joy.bx, joy.by, joy.R); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; rond(c, joy.bx + joy.vx * joy.R, joy.by + joy.vy * joy.R, joy.R * 0.42); c.fill();
  }
  if (S.attente > 0 && S.etat === 'combat') { c.fillStyle = 'rgba(0,0,0,' + (0.35 * S.attente / REG.lancement) + ')'; c.fillRect(0, 0, W, H); }
}
function nouvellePartie() { vuEvt = -1; vuEcl = -1; vuAmi = {}; dernierReel = null; Eff.vider(); GB.reset(); }
function versSalle(sx, sy) { return [(sx - V.ox) / V.T, (sy - V.oy) / (V.T * K)]; }
G.Dessin = {tout: tout, ROLES: ROLES, VILLAGEOIS: VILLAGEOIS, K: K, DESSUS: DESSUS, versSalle: versSalle, X: X, Y: Y, partieSous: function (x, y) { return GB.partieSous(x, y); },
  centrePartie: function (i) { return GB.centrePartie(i); }, V: V, nouvellePartie: nouvellePartie};
})(typeof window !== 'undefined' ? window : globalThis);
