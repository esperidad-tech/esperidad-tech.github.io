/* Le dessin de la version 2 : la salle vue d'en haut, en biais (comme le combat du Pisteur), en formes simples.
   Pas de zones rouges « style schéma » : des ombres qui grandissent, des fissures dorées, un feu qui couve, des lignes d'énergie. */
(function (G) {
'use strict';
var P2 = G.P2, REG = P2.REG;
var ROLES = {barde: {c: '#ff8fb3', ic: '🎻'}, sage: {c: '#6cb6ff', ic: '📜'}, alchimiste: {c: '#b48cff', ic: '⚗️'}, pisteur: {c: '#5fcf86', ic: '🏹'}};
var EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
var K = 0.62, V = {T: 40, ox: 0, oy: 0};
function X(x) { return V.ox + x * V.T; }
function Y(y, z) { return V.oy + y * V.T * K - (z || 0) * V.T; }
function ell(c, x, y, r, z) { c.beginPath(); c.ellipse(X(x), Y(y, z), r * V.T, r * V.T * K, 0, 0, Math.PI * 2); }
function rond(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function emoji(c, e, x, y, s) { c.font = s + 'px ' + EMO; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y + s * 0.04); }
function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
function solClip(c) { var L = REG.salle; c.beginPath(); c.rect(X(0), Y(0), L.L * V.T, L.P * V.T * K); c.clip(); }
function bruit(i) { var s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); }

/* ---------- la salle ---------- */
function salle(c, S) {
  var L = REG.salle, T = V.T;
  // le mur du fond
  var g = c.createLinearGradient(0, Y(0, 3), 0, Y(0));
  g.addColorStop(0, '#0c1020'); g.addColorStop(1, '#1d2438');
  c.fillStyle = g; c.fillRect(X(0), Y(0, 3), L.L * T, 3 * T);
  c.fillStyle = '#151b2c';
  for (var i = 0; i < 7; i++) c.fillRect(X(1 + i * 2) - T * 0.25, Y(0, 3), T * 0.5, 3 * T);
  // le sol
  c.fillStyle = '#232a3d'; c.fillRect(X(0), Y(0), L.L * T, L.P * T * K);
  c.strokeStyle = 'rgba(255,255,255,.045)'; c.lineWidth = 1;
  for (var x = 0; x <= L.L; x++) { c.beginPath(); c.moveTo(X(x), Y(0)); c.lineTo(X(x), Y(L.P)); c.stroke(); }
  for (var y = 0; y <= L.P; y++) { c.beginPath(); c.moveTo(X(0), Y(y)); c.lineTo(X(L.L), Y(y)); c.stroke(); }
  c.strokeStyle = '#3a4560'; c.lineWidth = 3; c.strokeRect(X(0), Y(0), L.L * T, L.P * T * K);
  // les portes des réparateurs (premier tiers)
  if (S.tiers === 1) REG.rep.portes.forEach(function (p) { c.fillStyle = '#0a0d16'; c.fillRect(X(p[0]) - T * 0.3, Y(p[1] - 0.6), T * 0.6, T * 1.2 * K); });
}

/* ---------- ce qui s'annonce au sol ---------- */
function sol(c, S) {
  var L = REG.salle, T = V.T, t = S.reel;
  c.save(); solClip(c);
  // la main : le givre ou la pierre brûlante, qui grandit depuis nos pieds (un peu transparent : on voit les ombres dessus)
  if (S.main && S.main.cx !== null) {
    var m = S.main, Rm = P2.rayonMain(m);
    c.globalAlpha = 0.42;
    var gr = c.createRadialGradient(X(m.cx), Y(m.cy), 0, X(m.cx), Y(m.cy), Rm * T);
    if (m.type === 'givre') { gr.addColorStop(0, '#e8f8ff'); gr.addColorStop(1, '#8fd3ff'); } else { gr.addColorStop(0, '#ffcf6a'); gr.addColorStop(1, '#ff5a1f'); }
    c.fillStyle = gr; ell(c, m.cx, m.cy, Rm); c.fill();
    c.globalAlpha = 0.8; c.strokeStyle = m.type === 'givre' ? '#ffffff' : '#ffd23a'; c.lineWidth = 2; ell(c, m.cx, m.cy, Rm); c.stroke();
    c.globalAlpha = 1;
  }
  // les crépitements : des fissures dorées qui s'étendent sur une moitié de la salle
  if (S.crepite) {
    var cp = S.crepite, p = cl(cp.t / REG.crepite.annonce, 0, 1), x0 = cp.cote === 'g' ? 0 : L.L / 2;
    c.fillStyle = 'rgba(255,200,80,' + (0.04 + 0.2 * p * p) + ')'; c.fillRect(X(x0), Y(0), L.L / 2 * T, L.P * T * K);
    c.strokeStyle = 'rgba(255,214,110,' + (0.5 + 0.5 * Math.sin(t * (10 + 20 * p))) + ')'; c.lineWidth = 1.5 + 2 * p;
    for (var i = 0; i < 14; i++) {
      var sx = x0 + bruit(i) * L.L / 2, sy = bruit(i + 50) * L.P, n = Math.floor(2 + p * 6);
      c.beginPath(); c.moveTo(X(sx), Y(sy));
      for (var j = 0; j < n; j++) { sx += (bruit(i * 9 + j) - 0.5) * 1.4; sy += (bruit(i * 7 + j + 3) - 0.5) * 1.4; c.lineTo(X(cl(sx, x0, x0 + L.L / 2)), Y(cl(sy, 0, L.P))); }
      c.stroke();
    }
  }
  var e = P2.dernier(S, 'crepiteBoum', 0.45);
  if (e) { var u = (S.reel - e.t) / 0.45; c.fillStyle = 'rgba(255,240,190,' + (0.85 * (1 - u)) + ')'; c.fillRect(X(e.cote === 'g' ? 0 : L.L / 2), Y(0), L.L / 2 * T, L.P * T * K); }
  // la vague de flammes : le feu qui roule depuis l'armure, et les abris derrière les colonnes
  if (S.vague) {
    var v = S.vague, Vg = REG.vague, A = REG.armure;
    if (v.t < Vg.annonce) { // le feu qui couve à ses pieds
      var q = v.t / Vg.annonce;
      for (i = 0; i < 10; i++) emoji(c, '🔥', X(A.x + (bruit(i) - 0.5) * 4), Y(A.y + 1.2 + bruit(i + 5) * 0.8), 10 + 14 * q + Math.sin(t * 9 + i) * 3);
    } else {
      var kf = cl((v.t - Vg.annonce) / Vg.traverse, 0, 1), rF = A.r + (v.rMax - A.r) * kf;
      var kb = cl((v.t - Vg.annonce - Vg.flammes) / Vg.traverse, 0, 1), rB = A.r + (v.rMax - A.r) * kb;
      c.fillStyle = 'rgba(255,80,30,.62)';
      c.beginPath(); c.ellipse(X(A.x), Y(A.y), rF * T, rF * T * K, 0, 0, Math.PI * 2);
      if (rB > A.r) c.ellipse(X(A.x), Y(A.y), rB * T, rB * T * K, 0, 0, Math.PI * 2, true);
      c.fill('evenodd');
      c.strokeStyle = 'rgba(255,220,120,.95)'; c.lineWidth = 5; ell(c, A.x, A.y, rF); if (kf < 1) c.stroke();
      // les abris : le feu se referme derrière chaque colonne
      v.abris.forEach(function (a) { c.fillStyle = 'rgba(30,40,70,.85)'; ell(c, a.x, a.y, REG.colonnes.r); c.fill(); });
    }
  }
  // les ombres des colonnes qui tombent (dessinées par-dessus le givre et la braise)
  S.ombres.forEach(function (o) {
    var k = cl(o.t / REG.colonnes.ombre, 0, 1), r = REG.colonnes.r * (0.3 + 0.7 * k);
    c.fillStyle = 'rgba(0,0,0,' + (0.25 + 0.45 * k) + ')'; ell(c, o.x, o.y, r); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2; ell(c, o.x, o.y, REG.colonnes.r); c.stroke();
  });
  // les doigts d'énergie : cinq lignes qui partent de sa main
  S.doigts.forEach(function (dg) {
    var A = REG.armure, an = cl(dg.t / REG.doigts.annonce, 0, 1);
    dg.lignes.forEach(function (a) {
      var x2 = A.x + Math.cos(a) * 20, y2 = A.y + Math.sin(a) * 20;
      if (!dg.boum) { c.strokeStyle = 'rgba(255,170,90,' + (0.25 + 0.6 * an) + ')'; c.lineWidth = (0.15 + 0.75 * an) * REG.doigts.demi * 2 * T * 0.6; }
      else { c.strokeStyle = 'rgba(255,250,220,.95)'; c.lineWidth = REG.doigts.demi * 2 * T * 0.7; }
      c.beginPath(); c.moveTo(X(A.x), Y(A.y)); c.lineTo(X(x2), Y(y2)); c.stroke();
    });
  });
  // la danse des anneaux
  if (S.danse) {
    var dz = S.danse, D = REG.danse, sur = dz.motif[Math.min(dz.k, dz.motif.length - 1)], T2 = D.dure / dz.motif.length, A2 = REG.armure;
    for (i = D.n - 1; i >= 0; i--) {
      var r0 = D.r0 + i * D.w, r1 = i === D.n - 1 ? 30 : r0 + D.w;
      c.beginPath(); c.ellipse(X(A2.x), Y(A2.y), r1 * T, r1 * T * K, 0, 0, Math.PI * 2); c.ellipse(X(A2.x), Y(A2.y), r0 * T, r0 * T * K, 0, 0, Math.PI * 2, true);
      if (i === sur) { c.fillStyle = 'rgba(0,0,0,0)'; }
      else if (!dz.explose) { var pa = dz.st / (T2 * D.alerte); c.fillStyle = 'rgba(255,190,90,' + (0.06 + 0.4 * pa * pa) + ')'; }
      else { var pe = (dz.st - T2 * D.alerte) / (T2 * (1 - D.alerte)); c.fillStyle = pe < 0.15 ? 'rgba(255,250,230,.9)' : 'rgba(255,200,90,' + (0.75 - 0.5 * pe) + ')'; }
      c.fill('evenodd');
      c.strokeStyle = 'rgba(255,220,150,.25)'; c.lineWidth = 1; ell(c, A2.x, A2.y, r0); c.stroke();
    }
  }
  // les crevasses qui s'annoncent, puis s'ouvrent
  S.fentes.forEach(function (f) {
    var k = cl(f.t / REG.crevasse.annonce, 0, 1);
    c.strokeStyle = 'rgba(255,210,120,' + (0.4 + 0.5 * Math.sin(t * 20)) + ')'; c.lineWidth = 1 + 3 * k;
    c.beginPath(); c.moveTo(X(f.ax), Y(f.ay)); c.lineTo(X(f.bx), Y(f.by)); c.stroke();
  });
  S.crevasses.forEach(function (f) {
    c.strokeStyle = '#05060c'; c.lineCap = 'round'; c.lineWidth = REG.crevasse.large * T * 0.8;
    c.beginPath(); c.moveTo(X(f.ax), Y(f.ay)); c.lineTo(X(f.bx), Y(f.by)); c.stroke();
    c.strokeStyle = 'rgba(255,120,60,.35)'; c.lineWidth = REG.crevasse.large * T * 0.25; c.stroke();
    c.lineCap = 'butt';
  });
  c.restore();
  // le gros coup qui touche toute la salle : un éclair sur le sol
  var g2 = P2.dernier(S, 'givreEclate', 0.5) || P2.dernier(S, 'braiseExplose', 0.5) || P2.dernier(S, 'coqueExplose', 0.5);
  if (g2) { var u2 = (S.reel - g2.t) / 0.5; c.fillStyle = (g2.type === 'givreEclate' ? 'rgba(220,245,255,' : g2.type === 'coqueExplose' ? 'rgba(255,230,150,' : 'rgba(255,140,40,') + 0.75 * (1 - u2) + ')'; c.fillRect(X(0), Y(0), REG.salle.L * V.T, REG.salle.P * V.T * K); }
  var o2 = P2.dernier(S, 'orbeExplose', 0.5);
  if (o2) { var u3 = (S.reel - o2.t) / 0.5; c.strokeStyle = 'rgba(255,240,200,' + (1 - u3) + ')'; c.lineWidth = 4; ell(c, o2.x, o2.y, 0.5 + u3 * 4); c.stroke(); }
}

/* ---------- le rayon d'une lanterne ---------- */
function rayon(c, S) {
  if (!S.rayon) return;
  var ry = S.rayon, Lt = REG.lanternes[ry.couleur], A = REG.armure, R = REG.rayon, t = S.reel;
  var grace = ry.t < R.grace, w = grace ? 2 + 2 * Math.sin(t * 12) : 7 + 2 * Math.sin(t * 20);
  var col = ry.couleur === 'or' ? '255,214,90' : '255,70,60';
  var x1 = X(Lt[0]), y1 = Y(Lt[1], 1.2), x2 = X(A.x), y2 = Y(A.y, 1.6);
  if (ry.coupe) { // coupé : le rayon s'arrête sur le héros
    x2 = X(S.h.x); y2 = Y(S.h.y, 0.8);
  }
  c.strokeStyle = 'rgba(' + col + ',' + (grace ? 0.55 : 0.9) + ')'; c.lineWidth = w; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = w * 0.3; c.stroke(); c.lineCap = 'butt';
  // et sur le sol, sa trace (pour savoir où se mettre)
  c.strokeStyle = 'rgba(' + col + ',.18)'; c.lineWidth = R.demi * 2 * V.T * 0.8;
  c.beginPath(); c.moveTo(X(Lt[0]), Y(Lt[1])); c.lineTo(X(A.x), Y(A.y)); c.stroke();
}

/* ---------- les objets, du fond vers le devant ---------- */
function colonne(c, S, o) {
  var T = V.T, r = REG.colonnes.r, h = 3.2, age = S.reel - (o.nee || -9), ch = cl(age / 0.12, 0, 1);
  var top = Y(o.y, h * ch + (1 - ch) * 6);
  c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, o.x + 0.15, o.y + 0.15, r); c.fill();
  var g = c.createLinearGradient(X(o.x - r), 0, X(o.x + r), 0);
  g.addColorStop(0, '#5d6377'); g.addColorStop(0.5, '#9aa1b5'); g.addColorStop(1, '#4b5063');
  c.fillStyle = g; c.fillRect(X(o.x - r), top, 2 * r * T, Y(o.y) - top);
  c.fillStyle = '#4b5063'; ell(c, o.x, o.y, r); c.fill();
  c.fillStyle = '#b9bfd0'; c.beginPath(); c.ellipse(X(o.x), top, r * T, r * T * K, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#2b3042'; c.lineWidth = 1.5; c.stroke();
  // le feu ou le givre collé sur la pierre
  S.taches.forEach(function (tc) { if (tc.col !== o) return; var a = 1 - (S.reel - tc.t) / 2.5;
    c.fillStyle = (tc.quoi === 'feu' ? 'rgba(255,120,40,' : 'rgba(170,230,255,') + 0.85 * a + ')'; c.beginPath(); c.ellipse(X(o.x), Y(o.y, 1), r * T * 0.9, r * T * 0.9, 0, 0, Math.PI * 2); c.fill(); });
  if (S.vague && S.vague.t > REG.vague.annonce) { c.fillStyle = 'rgba(255,90,30,' + (0.25 + 0.15 * Math.sin(S.reel * 15)) + ')'; c.fillRect(X(o.x - r), top, 2 * r * T, Y(o.y) - top); }
}
function lanterne(c, S, coul) {
  var p = REG.lanternes[coul], T = V.T, col = coul === 'or' ? '#ffd23a' : '#ff4b3e';
  c.fillStyle = '#2b3042'; c.fillRect(X(p[0]) - T * 0.18, Y(p[1], 1.2), T * 0.36, T * 1.2);
  c.fillStyle = '#11141d'; ell(c, p[0], p[1], 0.3); c.fill();
  var on = (S.rayon && S.rayon.couleur === coul) ? 1 : 0.55, g = c.createRadialGradient(X(p[0]), Y(p[1], 1.45), 0, X(p[0]), Y(p[1], 1.45), T * (0.5 + on * 0.5));
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; rond(c, X(p[0]), Y(p[1], 1.45), T * (0.5 + on * 0.5)); c.fill();
  c.fillStyle = col; rond(c, X(p[0]), Y(p[1], 1.45), T * 0.2); c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2; c.stroke();
}
function reparateur(c, S, p) {
  var T = V.T, s = 0.32;
  if (S.cible === p) { c.strokeStyle = '#ffd23a'; c.lineWidth = 3; ell(c, p.x, p.y, 0.55); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, p.x, p.y, 0.3); c.fill();
  c.fillStyle = p.rouge ? '#ff4a3a' : '#9aa0ac'; rr(c, X(p.x) - s * T, Y(p.y, 0.6), 2 * s * T, 0.6 * T, 4); c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 1.5; c.stroke();
  emoji(c, '🔧', X(p.x), Y(p.y, 0.32), T * 0.36);
}
function orbe(c, S) {
  var o = S.orbe; if (!o) return;
  var O = REG.orbe, T = V.T, k = cl((o.t - O.chute) / O.meche, 0, 1), z = o.porte ? 1.55 : (o.t < O.chute ? 2.5 * (1 - o.t / O.chute) + 0.4 : 0.4);
  var col = o.couleur === 'or' ? '255,210,70' : '255,60,50', R = T * (0.22 + 0.25 * k + 0.05 * Math.sin(S.reel * (6 + 20 * k)));
  if (!o.porte) { c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, o.x, o.y, 0.25); c.fill(); }
  var g = c.createRadialGradient(X(o.x), Y(o.y, z), 0, X(o.x), Y(o.y, z), R * 2.2);
  g.addColorStop(0, 'rgba(' + col + ',.9)'); g.addColorStop(1, 'rgba(' + col + ',0)');
  c.fillStyle = g; rond(c, X(o.x), Y(o.y, z), R * 2.2); c.fill();
  c.fillStyle = 'rgb(' + col + ')'; rond(c, X(o.x), Y(o.y, z), T * 0.2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
}
function heros(c, S, sil) {
  var h = S.h, R = ROLES[S.reg.role] || ROLES.barde, T = V.T, r = REG.heros.r, z = 0, t = S.reel;
  if (h.saut) z = Math.sin(Math.min(1, h.saut.t / REG.saut.dur) * Math.PI) * 0.8;
  if (sil) { // la silhouette, toujours visible, même derrière une colonne
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.5; rond(c, X(h.x), Y(h.y, 0.55 + z), r * T * 1.1); c.stroke(); return;
  }
  if (h.intouchable > 0 && Math.floor(t * 10) % 2) return;
  c.fillStyle = 'rgba(0,0,0,.4)'; ell(c, h.x, h.y, r); c.fill();
  if (h.lent) { c.fillStyle = 'rgba(200,240,255,.6)'; ell(c, h.x, h.y, r * 1.5); c.fill(); }
  if (h.bonus > 0) { var g = c.createRadialGradient(X(h.x), Y(h.y, 0.55 + z), 0, X(h.x), Y(h.y, 0.55 + z), T * 0.75); g.addColorStop(0, 'rgba(255,214,90,.55)'); g.addColorStop(1, 'rgba(255,214,90,0)'); c.fillStyle = g; rond(c, X(h.x), Y(h.y, 0.55 + z), T * 0.75); c.fill(); }
  var cx = X(h.x), cy = Y(h.y, 0.55 + z);
  rond(c, cx, cy, r * T * 1.1); c.fillStyle = h.mort > 0 ? '#666' : R.c; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2.5; c.stroke();
  emoji(c, h.mort > 0 ? '💀' : R.ic, cx, cy, T * 0.42);
  // le regard
  if (h.mort <= 0) { c.fillStyle = '#fff'; rond(c, cx + h.dx * r * T * 1.25, cy + h.dy * r * T * K * 1.25, 3); c.fill(); }
  // le sort qu'on lance : un cercle qui se remplit (pour le Sage, c'est la rune qui se dessine)
  if (h.lance) {
    var p = h.lance.t / h.lance.dur, col = h.lance.quoi === 'glace' ? '#9fe3ff' : h.lance.quoi === 'feu' ? '#ff7a2a' : '#5fe07a';
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 6; rond(c, cx, cy, r * T * 1.8); c.stroke();
    c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, r * T * 1.8, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke();
  }
  if (h.coupe > 0) { c.fillStyle = 'rgba(255,40,40,' + h.coupe * 1.4 + ')'; rond(c, cx, cy, r * T * 1.15); c.fill(); }
  if (h.mort > 0) { c.fillStyle = '#fff'; c.font = 'bold ' + Math.round(T * 0.5) + 'px Nunito,sans-serif'; c.textAlign = 'center'; c.fillText(Math.ceil(h.mort), cx, cy - T * 0.75); }
  var e = P2.dernier(S, 'soigne', 0.6); if (e) { var u = (S.reel - e.t) / 0.6; c.strokeStyle = 'rgba(95,224,122,' + (1 - u) + ')'; c.lineWidth = 3; rond(c, cx, cy, r * T * (1.2 + u * 2)); c.stroke(); }
}
function armure(c, S) {
  var A = REG.armure, T = V.T, t = S.reel, tiers = S.tiers, ph = S.phase;
  if (ph === 'fini') { grosbec(c, X(A.x), Y(A.y + 1.5, 0.3), T * 0.45); return; }
  var penche = S.vague && S.vague.t < REG.vague.annonce ? S.vague.t / REG.vague.annonce : 0;
  var bx = X(A.x), by = Y(A.y), sh = 0;
  var boum = P2.dernier(S, 'crepiteBoum', 0.35) || P2.dernier(S, 'colonneTombe', 0.3);
  if (boum) sh = (Math.random() - 0.5) * 6;
  c.save(); c.translate(sh, -penche * T * 0.25);
  c.fillStyle = 'rgba(0,0,0,.4)'; ell(c, A.x, A.y, A.r); c.fill();
  var acier = tiers === 3 ? '#5b6278' : '#7f8aa3', fonce = '#3f475c', bord = '#c9a25a';
  var bw = 2.6 * T, bh = 1.7 * T, by0 = by - 3.0 * T;
  // les jambes
  c.fillStyle = fonce;
  [-1, 1].forEach(function (s) { rr(c, bx + s * 0.75 * T - 0.3 * T, by0 + bh - 4, 0.6 * T, by - (by0 + bh) + 2, 5); if (tiers < 3) c.fill(); else { c.strokeStyle = acier; c.lineWidth = 4; c.stroke(); } });
  // le corps
  if (tiers < 3) { rr(c, bx - bw / 2, by0, bw, bh, 12); c.fillStyle = acier; c.fill(); c.strokeStyle = bord; c.lineWidth = 3; c.stroke(); }
  else { c.strokeStyle = acier; c.lineWidth = 5; rr(c, bx - bw / 2, by0, bw, bh, 12); c.stroke(); c.beginPath(); c.moveTo(bx - bw / 2, by0); c.lineTo(bx + bw / 2, by0 + bh); c.moveTo(bx + bw / 2, by0); c.lineTo(bx - bw / 2, by0 + bh); c.stroke(); }
  // le ventre : la plaque, ou les tuyaux qui fuient
  var vx = bx - 0.75 * T, vy = by0 + 0.25 * T, vw = 1.5 * T, vh = 1.2 * T;
  if (tiers === 1) { rr(c, vx, vy, vw, vh, 8); c.fillStyle = '#a7b1c8'; c.fill(); c.strokeStyle = fonce; c.lineWidth = 2; c.stroke(); }
  else if (tiers === 2) {
    rr(c, vx, vy, vw, vh, 8); c.fillStyle = '#141824'; c.fill();
    for (var i = 0; i < 3; i++) { var on = 0.5 + 0.5 * Math.sin(t * 4 + i * 2); c.strokeStyle = i === 1 ? 'rgba(255,70,60,' + (0.5 + 0.4 * on) + ')' : 'rgba(255,214,90,' + (0.5 + 0.4 * on) + ')'; c.lineWidth = 5; c.beginPath(); c.moveTo(vx + vw * (0.25 + i * 0.25), vy + 4); c.lineTo(vx + vw * (0.25 + i * 0.25), vy + vh - 4); c.stroke(); }
  }
  var rouge = penche; // la poitrine rougit avant la vague
  rond(c, bx, vy + vh / 2, 0.22 * T * (1 + rouge * 0.6)); c.fillStyle = rouge > 0 ? 'rgb(255,' + Math.round(220 - 170 * rouge) + ',' + Math.round(230 - 200 * rouge) + ')' : (tiers === 3 ? '#ffd23a' : '#5be0e6'); c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2; c.stroke();
  // les bras et les mains
  [-1, 1].forEach(function (s) {
    var sx = bx + s * bw / 2, sy = by0 + 0.3 * T, leve = 0, mainCol = acier;
    if (tiers === 2) { mainCol = s < 0 ? '#9fe3ff' : '#ff7a2a'; if (S.main && ((S.main.type === 'givre' && s < 0) || (S.main.type === 'braise' && s > 0))) leve = 1; }   // (R) une main glacée, une main bouillante
    var hx = sx + s * 0.7 * T, hy = sy + (1.4 - leve * 2.4) * T;
    if (tiers === 3 && s > 0) { // (R) un bras brisé ; à partir du coude, une main d'énergie à cinq doigts
      c.strokeStyle = fonce; c.lineWidth = 0.35 * T; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + s * 0.35 * T, sy + 0.6 * T); c.stroke();
      var ex = sx + s * 0.6 * T, ey = sy + 1.2 * T, gl = 0.6 + 0.4 * Math.sin(t * 8);
      c.strokeStyle = 'rgba(255,' + Math.round(150 + 60 * gl) + ',70,.9)'; c.lineWidth = 0.2 * T; c.beginPath(); c.moveTo(sx + s * 0.35 * T, sy + 0.6 * T); c.lineTo(ex, ey); c.stroke();
      for (var f = 0; f < 5; f++) { var a = Math.PI / 2 + (f - 2) * 0.35; c.lineWidth = 0.07 * T; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a) * 0.45 * T, ey + Math.sin(a) * 0.45 * T); c.stroke(); }
      c.lineCap = 'butt'; return;
    }
    c.strokeStyle = tiers === 3 ? acier : fonce; c.lineWidth = (tiers === 3 ? 0.14 : 0.32) * T; c.lineCap = 'round';
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy); c.stroke(); c.lineCap = 'butt';
    rond(c, hx, hy, 0.3 * T * (1 + leve * 0.3)); c.fillStyle = mainCol; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2; c.stroke();
    if (leve) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.3 * Math.sin(t * 12)) + ')'; rond(c, hx, hy, 0.5 * T); c.fill(); }
  });
  // la tête, ou le cockpit avec Grosbec dedans
  var hw = 1.1 * T, hh = 0.7 * T, hy0 = by0 - hh + 4;
  if (tiers < 3) { rr(c, bx - hw / 2, hy0, hw, hh, 8); c.fillStyle = acier; c.fill(); c.strokeStyle = bord; c.lineWidth = 3; c.stroke(); c.fillStyle = '#ff4b3e'; rr(c, bx - 0.35 * T, hy0 + 0.25 * T, 0.25 * T, 0.1 * T, 2); c.fill(); rr(c, bx + 0.1 * T, hy0 + 0.25 * T, 0.25 * T, 0.1 * T, 2); c.fill(); }
  else { rr(c, bx - hw / 2, hy0, hw, hh, 8); c.fillStyle = 'rgba(140,210,255,.2)'; c.fill(); c.strokeStyle = acier; c.lineWidth = 3; c.stroke(); grosbec(c, bx, hy0 + hh * 0.62, 0.22 * T); }
  if (tiers === 3 && ph !== 'explose') { var ga = c.createRadialGradient(bx, by0 + bh / 2, 0.3 * T, bx, by0 + bh / 2, 2.4 * T); ga.addColorStop(0, 'rgba(255,140,60,.25)'); ga.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = ga; rond(c, bx, by0 + bh / 2, 2.4 * T); c.fill(); }
  // la coque d'énergie
  if (S.coque) {
    var k = S.coque.t / REG.coque.dure, Rq = (1.4 + 0.5 * k) * T;
    c.fillStyle = 'rgba(255,214,120,' + (0.18 + 0.25 * k) + ')'; rond(c, bx, by0 + bh * 0.4, Rq); c.fill();
    c.strokeStyle = 'rgba(255,240,180,' + (0.6 + 0.4 * Math.sin(t * (6 + 20 * k))) + ')'; c.lineWidth = 3; c.stroke();
    var pv = Math.max(0, S.coque.pv) / REG.coque.pv;
    c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, bx - 0.8 * T, by0 - 1.1 * T, 1.6 * T, 8, 4); c.fill(); c.fillStyle = '#ffe08a'; rr(c, bx - 0.8 * T, by0 - 1.1 * T, 1.6 * T * pv, 8, 4); c.fill();
  }
  // la bulle (le méga bouclier)
  if (ph === 'bulle') {
    var gb = c.createRadialGradient(bx, by0 + bh * 0.4, T, bx, by0 + bh * 0.4, 2.3 * T);
    gb.addColorStop(0, 'rgba(255,214,90,0)'); gb.addColorStop(0.85, 'rgba(255,214,90,.25)'); gb.addColorStop(1, 'rgba(255,230,140,.6)');
    c.fillStyle = gb; rond(c, bx, by0 + bh * 0.4, 2.3 * T); c.fill(); c.strokeStyle = 'rgba(255,230,140,.8)'; c.lineWidth = 3; c.stroke();
  }
  c.restore();
  if (ph === 'explose' || ph === 'transfo') {
    var u = 1 - S.transfoT / (ph === 'explose' ? REG.explose : REG.transfo);
    for (i = 0; i < 8; i++) { var an = i / 8 * Math.PI * 2, d = u * 3 * T; c.globalAlpha = 1 - u; c.fillStyle = '#7f8aa3'; rr(c, bx + Math.cos(an) * d - 8, by0 + bh / 2 + Math.sin(an) * d + u * u * 2 * T, 16, 12, 3); c.fill(); }
    c.globalAlpha = 1;
    if (ph === 'explose') { c.fillStyle = 'rgba(255,245,200,' + Math.max(0, 0.8 - u * 2) + ')'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); }
  }
}
function grosbec(c, x, y, r) {
  rond(c, x, y, r); c.fillStyle = '#f2b8a0'; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 1.5; c.stroke();
  c.beginPath(); c.moveTo(x - r * 0.35, y + r * 0.05); c.lineTo(x + r * 0.35, y + r * 0.05); c.lineTo(x, y + r * 0.95); c.closePath(); c.fillStyle = '#f0a020'; c.fill(); c.stroke();
  c.fillStyle = '#11141d'; rond(c, x - r * 0.38, y - r * 0.3, r * 0.14); c.fill(); rond(c, x + r * 0.38, y - r * 0.3, r * 0.14); c.fill();
  c.fillStyle = '#ececec'; rr(c, x - r * 0.9, y - r * 1.05, r * 1.8, r * 0.45, r * 0.2); c.fill();
}
function tirs(c, S) {
  S.tirs.forEach(function (s) {
    var z = 0.8, R = s.quoi === 'feu' ? 0.28 : 0.14, col = s.quoi === 'feu' ? '#ff7a2a' : '#9fe3ff';
    if (s.fort) { c.fillStyle = 'rgba(255,214,90,.5)'; rond(c, X(s.x), Y(s.y, z), R * V.T * 1.8); c.fill(); }
    rond(c, X(s.x), Y(s.y, z), R * V.T); c.fillStyle = col; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
  });
  S.evts.forEach(function (e) {
    var u = S.reel - e.t;
    if (e.type === 'touche' && u < 0.3) { c.strokeStyle = 'rgba(255,255,255,' + (1 - u / 0.3) + ')'; c.lineWidth = 3; rond(c, X(REG.armure.x), Y(REG.armure.y, 1.6), (0.3 + u * 3) * V.T); c.stroke(); }
    if ((e.type === 'repCasse' || e.type === 'repEcrase') && u < 0.4) { for (var i = 0; i < 6; i++) { var a = i * 1.05; c.fillStyle = 'rgba(160,165,175,' + (1 - u * 2.5) + ')'; rond(c, X(e.x) + Math.cos(a) * u * 70, Y(e.y, 0.3) + Math.sin(a) * u * 40, 4); c.fill(); } }
    if (e.type === 'contre' && u < 0.7) { c.fillStyle = (e.main === 'givre' ? 'rgba(255,140,50,' : 'rgba(170,230,255,') + 0.5 * (1 - u / 0.7) + ')'; rond(c, X(REG.armure.x), Y(REG.armure.y, 1.6), (1 + u * 3) * V.T); c.fill(); }
    if (e.type === 'orbeBonne' && u < 0.8) { var L = REG.lanternes[e.couleur]; c.strokeStyle = 'rgba(255,230,140,' + (1 - u / 0.8) + ')'; c.lineWidth = 4; rond(c, X(L[0]), Y(L[1], 1.45), (0.3 + u * 2) * V.T); c.stroke(); }
  });
}

/* ---------- les barres (avec des chiffres), le symbole, le cri du Pisteur ---------- */
function barre(c, x, y, w, h, k, col) {
  c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, x - 2, y - 2, w + 4, h + 4, h / 2 + 2); c.fill();
  c.fillStyle = col; rr(c, x, y, Math.max(0, w * k), h, h / 2); c.fill();
}
function hud(c, S, W, H) {
  var R = ROLES[S.reg.role] || ROLES.barde, u = Math.min(W, H * 2) / 900, s = Math.max(0.7, Math.min(1.4, u));
  // la vie du héros, en haut à gauche : verte, orange de 70 à 61, rouge à 60 et moins (R)
  var pv = Math.max(0, Math.round(S.h.pv)), col = pv > 70 ? '#5fe07a' : pv > 60 ? '#ffa23a' : '#ff4a3a';
  var x0 = 14 + 34 * s, y0 = 12, w = 190 * s, hh = 18 * s;
  rond(c, 14 + 15 * s, y0 + hh / 2, 15 * s); c.fillStyle = R.c; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 2; c.stroke(); emoji(c, R.ic, 14 + 15 * s, y0 + hh / 2, 16 * s);
  barre(c, x0, y0, w, hh, pv / 100, col);
  if (S.h.coupe > 0) { c.fillStyle = 'rgba(255,60,60,' + S.h.coupe + ')'; rr(c, x0, y0, w, hh, hh / 2); c.fill(); }
  c.fillStyle = '#fff'; c.font = '900 ' + Math.round(14 * s) + 'px Nunito,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(pv, x0 + 8, y0 + hh / 2 + 1);
  // le bonus de l'orbe
  if (S.h.bonus > 0) { var bx = x0 + w + 22 * s; c.fillStyle = 'rgba(255,214,90,.9)'; c.beginPath(); c.moveTo(bx, y0 + hh / 2); c.arc(bx, y0 + hh / 2, 11 * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * S.h.bonus / REG.orbe.bonus); c.closePath(); c.fill(); emoji(c, '✨', bx, y0 + hh / 2, 12 * s); }
  // la vie de l'armure (le tiers en cours), en haut au milieu
  var aw = Math.min(W * 0.36, 360 * s), ax = W / 2 - aw / 2, ay = 12;
  barre(c, ax, ay, aw, hh, S.vie / S.vieMax, S.phase === 'bulle' ? '#ffd23a' : '#d84a3a');
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(Math.round(S.vie), W / 2, ay + hh / 2 + 1);
  for (var i = 0; i < 3; i++) { rond(c, ax + aw + 16 * s + i * 16 * s, ay + hh / 2, 5 * s); c.fillStyle = i + 1 < S.tiers ? '#333' : i + 1 === S.tiers ? '#d84a3a' : '#777'; c.fill(); }
  // mon symbole : en grand, puis rangé sous ma barre
  if (S.symbole) {
    var e = P2.dernier(S, 'symbole', 1.8);
    if (e) { var k = (S.reel - e.t) / 1.8, gros = k < 0.7, f = gros ? 1 : 1 - (k - 0.7) / 0.3;
      var sx = 40 * s + (W / 2 - 40 * s) * f, sy = 60 * s + (H * 0.45 - 60 * s) * f, sz = 26 * s + 60 * s * f;
      c.fillStyle = 'rgba(0,0,0,' + 0.6 * f + ')'; rond(c, sx, sy, sz * 1.15); c.fill(); c.strokeStyle = R.c; c.lineWidth = 3 + 5 * f; c.stroke();
      emoji(c, S.symbole, sx, sy, sz * 1.25); if (gros) emoji(c, '📣', sx + sz * 1.3, sy - sz * 0.9, 30 * s);
    } else {
      c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, 10, y0 + hh + 10, 76 * s, 34 * s, 17 * s); c.fill(); c.strokeStyle = R.c; c.lineWidth = 2.5; c.stroke();
      rond(c, 10 + 17 * s, y0 + hh + 10 + 17 * s, 11 * s); c.fillStyle = R.c; c.fill(); emoji(c, R.ic, 10 + 17 * s, y0 + hh + 10 + 17 * s, 12 * s);
      emoji(c, S.symbole, 10 + 52 * s, y0 + hh + 10 + 17 * s, 22 * s);
    }
  }
  // le cri du Pisteur
  if (S.cri && S.phase === 'bulle') {
    var P = ROLES.pisteur, cx = 14 + 92 * s, cy = y0 + hh + 10 + 34 * s + (S.symbole ? 40 * s : 0);   // à gauche, sous mon symbole : la fenêtre du code ne le cache pas
    c.fillStyle = 'rgba(10,14,24,.85)'; rr(c, cx - 92 * s, cy - 22 * s, 184 * s, 44 * s, 22 * s); c.fill(); c.strokeStyle = P.c; c.lineWidth = 3; c.stroke();
    rond(c, cx - 70 * s, cy, 15 * s); c.fillStyle = P.c; c.fill(); emoji(c, P.ic, cx - 70 * s, cy, 15 * s);
    for (i = 0; i < 3; i++) emoji(c, S.cri[i], cx - 26 * s + i * 40 * s, cy, 26 * s);
  }
  if (S.lent < 1) { c.fillStyle = 'rgba(90,140,255,.10)'; c.fillRect(0, 0, W, H); }
  if (S.h.coupe > 0.2) { c.strokeStyle = 'rgba(255,40,40,' + S.h.coupe + ')'; c.lineWidth = 14; c.strokeRect(0, 0, W, H); }
}

/* ---------- tout ---------- */
function tout(c, S, vue, W, H, joy) {
  V.T = vue.T; V.ox = vue.ox; V.oy = vue.oy;
  c.fillStyle = '#070912'; c.fillRect(0, 0, W, H);
  salle(c, S);
  sol(c, S);
  // du fond vers le devant
  var objets = [];
  S.colonnes.forEach(function (o) { objets.push([o.y, function () { colonne(c, S, o); }]); });
  if (S.tiers >= 2) ['or', 'rouge'].forEach(function (k) { objets.push([REG.lanternes[k][1], function () { lanterne(c, S, k); }]); });
  S.reps.forEach(function (p) { objets.push([p.y, function () { reparateur(c, S, p); }]); });
  if (S.orbe && !S.orbe.porte) objets.push([S.orbe.y, function () { orbe(c, S); }]);
  objets.push([REG.armure.y, function () { armure(c, S); }]);
  objets.push([S.h.y + 0.01, function () { heros(c, S); if (S.orbe && S.orbe.porte) orbe(c, S); }]);
  objets.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (o) { o[1](); });
  rayon(c, S);
  tirs(c, S);
  if (S.h.mort <= 0) heros(c, S, true);
  // le pouce gauche
  if (joy && joy.id !== null) {
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; rond(c, joy.bx, joy.by, joy.R); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; rond(c, joy.bx + joy.vx * joy.R, joy.by + joy.vy * joy.R, joy.R * 0.42); c.fill();
  }
  hud(c, S, W, H);
}
function versSalle(sx, sy) { return [(sx - V.ox) / V.T, (sy - V.oy) / (V.T * K)]; }
G.Dessin = {tout: tout, ROLES: ROLES, grosbec: grosbec, K: K, versSalle: versSalle, X: X, Y: Y};
})(typeof window !== 'undefined' ? window : globalThis);
