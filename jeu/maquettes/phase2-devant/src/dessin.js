/* Le dessin, en formes simples : des ronds, des rectangles, des couleurs franches. Rien de travaillé (c'est voulu). */
(function (G) {
'use strict';
var P2 = G.P2, REG = P2.REG;
var ROLES = {
  barde: {c: '#ff8fb3', ic: '🎻'}, sage: {c: '#6cb6ff', ic: '📜'}, alchimiste: {c: '#b48cff', ic: '⚗️'}, pisteur: {c: '#5fcf86', ic: '🏹'}
};
var EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function rond(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
function emoji(c, e, x, y, taille) { c.font = taille + 'px ' + EMO; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y + taille * 0.04); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function dernier(S, type, depuis) { for (var i = S.evts.length - 1; i >= 0; i--) { var e = S.evts[i]; if (S.reel - e.t > depuis) return null; if (e.type === type) return e; } return null; }

/* ---------- l'armure ---------- */
function armure(c, S, L) {
  var a = S.att, k = L.bk, cx = L.W / 2, f = S.forme, t = S.reel;
  var top = L.bossHaut, bodyW = 170 * k, bodyH = 128 * k, bodyY = L.bossY - bodyH / 2;
  var sh = 0, boum = dernier(S, 'boum', 0.35) || dernier(S, 'grosBoum', 0.5) || dernier(S, 'chaudBoum', 0.5);
  if (boum) sh = (Math.random() - 0.5) * 10 * (1 - (S.reel - boum.t) / 0.5);
  c.save(); c.translate(sh, 0);
  var acier = '#7f8aa3', fonce = '#3f475c', bord = '#c9a25a';
  if (S.sonnee > 0) { acier = '#8b8b8b'; fonce = '#4a4a4a'; }
  if (f === 3) { acier = '#5b6278'; }
  // l'aura de la forme 3 : l'énergie lui sert d'armure
  if (f === 3 && S.phase !== 'explose' && S.phase !== 'fini') {
    var g = c.createRadialGradient(cx, L.bossY, 30 * k, cx, L.bossY, 150 * k);
    g.addColorStop(0, 'rgba(255,120,60,.32)'); g.addColorStop(0.6, 'rgba(255,200,80,.12)'); g.addColorStop(1, 'rgba(255,120,60,0)');
    c.fillStyle = g; c.fillRect(cx - 160 * k, L.bossY - 150 * k, 320 * k, 300 * k);
  }
  // les jambes, jusqu'au sol
  var jy = bodyY + bodyH - 6 * k;
  c.fillStyle = fonce; c.strokeStyle = '#11141d'; c.lineWidth = 2;
  [-1, 1].forEach(function (s) {
    var jx = cx + s * 48 * k - 18 * k;
    if (f === 3) { c.strokeStyle = acier; c.lineWidth = 7 * k; c.beginPath(); c.moveTo(jx + 18 * k, jy); c.lineTo(jx + 18 * k, L.solHaut + 4); c.stroke(); c.lineWidth = 2; c.strokeStyle = '#11141d'; }
    else { rr(c, jx, jy, 36 * k, L.solHaut + 6 - jy, 6 * k); c.fill(); c.stroke(); }
    rr(c, jx - 6 * k, L.solHaut - 6, 48 * k, 14, 5); c.fillStyle = '#2a3042'; c.fill(); c.stroke(); c.fillStyle = fonce;
  });
  // les bras : celui du poing se lève pendant l'annonce
  [-1, 1].forEach(function (s) {
    var cote = s < 0 ? 'g' : 'd', lev = 0, frappe = false;
    if (a && a.type === 'poing' && a.cote === cote) { if (a.t < a.prep) lev = clamp(a.t / a.prep, 0, 1); else frappe = true; }
    var ex = cx + s * (bodyW / 2 + 4 * k), ey = bodyY + 18 * k;
    var fx = cx + s * (bodyW / 2 + 34 * k), fy = bodyY + bodyH + 10 * k - lev * (bodyH + 40 * k);
    if (frappe) { fx = cx + s * (L.W * 0.27); fy = L.solHaut + 30; }
    c.strokeStyle = f === 3 ? acier : fonce; c.lineWidth = (f === 3 ? 9 : 22) * k; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(fx, fy); c.stroke();
    c.lineCap = 'butt'; c.lineWidth = 2;
    rond(c, fx, fy, (frappe ? 30 : 22) * k); c.fillStyle = lev > 0.75 ? '#e0574a' : acier; c.fill(); c.strokeStyle = '#11141d'; c.stroke();
  });
  // le corps
  if (f < 3) { rr(c, cx - bodyW / 2, bodyY, bodyW, bodyH, 16 * k); c.fillStyle = acier; c.fill(); c.strokeStyle = bord; c.lineWidth = 3; c.stroke(); c.lineWidth = 2; }
  else { // presque sans armure : juste le cadre
    c.strokeStyle = acier; c.lineWidth = 6 * k; rr(c, cx - bodyW / 2, bodyY, bodyW, bodyH, 16 * k); c.stroke();
    c.beginPath(); c.moveTo(cx - bodyW / 2, bodyY); c.lineTo(cx + bodyW / 2, bodyY + bodyH); c.moveTo(cx + bodyW / 2, bodyY); c.lineTo(cx - bodyW / 2, bodyY + bodyH); c.stroke(); c.lineWidth = 2;
  }
  // le ventre : la plaque (forme 1), les tuyaux du drainage (forme 2)
  var vx = cx - 52 * k, vy = bodyY + 22 * k, vw = 104 * k, vh = 86 * k;
  var coeurR = 16 * k, coeurC = '#5be0e6';
  if (a && a.type === 'grosCoup' && a.t < a.prep) { var p = a.t / a.prep; coeurR = (16 + 14 * p + Math.sin(t * 18) * 2 * p) * k; coeurC = p > 0.7 ? '#ffffff' : '#fff1a0'; }
  if (f === 1) {
    rr(c, vx, vy, vw, vh, 10 * k); c.fillStyle = '#a7b1c8'; c.fill(); c.strokeStyle = fonce; c.stroke();
  } else {
    rr(c, vx, vy, vw, vh, 10 * k); c.fillStyle = '#141824'; c.fill();
    for (var i = 0; i < 3; i++) {
      var tx = vx + vw * (0.22 + i * 0.28), on = 0.55 + 0.45 * Math.sin(t * 4 + i * 2);
      c.strokeStyle = 'rgba(255,' + Math.round(150 + 80 * on) + ',70,' + (0.55 + 0.4 * on) + ')'; c.lineWidth = 6 * k;
      c.beginPath(); c.moveTo(tx, vy + 4); c.bezierCurveTo(tx - 8 * k, vy + vh * 0.4, tx + 8 * k, vy + vh * 0.6, tx, vy + vh - 4); c.stroke();
    }
    c.lineWidth = 2;
  }
  rond(c, cx, vy + vh / 2, coeurR); c.fillStyle = coeurC; c.fill(); c.strokeStyle = '#11141d'; c.stroke();
  // la tête (le cockpit à la forme 3, avec Grosbec dedans, à moitié visible)
  var hw = 70 * k, hh = 46 * k, hy = bodyY - hh + 6 * k;
  if (f < 3) {
    rr(c, cx - hw / 2, hy, hw, hh, 10 * k); c.fillStyle = acier; c.fill(); c.strokeStyle = bord; c.lineWidth = 3; c.stroke(); c.lineWidth = 2;
    c.fillStyle = S.sonnee > 0 ? '#555' : '#ff4b3e';
    rr(c, cx - 24 * k, hy + 16 * k, 16 * k, 7 * k, 3); c.fill(); rr(c, cx + 8 * k, hy + 16 * k, 16 * k, 7 * k, 3); c.fill();
  } else {
    rr(c, cx - hw / 2, hy, hw, hh, 10 * k); c.fillStyle = 'rgba(140,210,255,.18)'; c.fill(); c.strokeStyle = acier; c.lineWidth = 4 * k; c.stroke(); c.lineWidth = 2;
    grosbec(c, cx, hy + hh * 0.62, 15 * k);
  }
  // chaud, froid
  if (a && (a.type === 'chaud' || a.type === 'froid')) {
    var m = clamp(a.t / a.prep, 0, 1), pul = 0.5 + 0.5 * Math.sin(t * (a.type === 'chaud' ? 12 : 5));
    c.globalAlpha = m * (0.4 + 0.3 * pul);
    rr(c, cx - bodyW / 2 - 8 * k, hy - 8 * k, bodyW + 16 * k, bodyY + bodyH - hy + 16 * k, 22 * k);
    c.fillStyle = a.type === 'chaud' ? '#ff5a1f' : '#9fe3ff'; c.fill();
    c.globalAlpha = 1;
    if (a.type === 'froid') { c.fillStyle = '#ffffff'; for (var j = 0; j < 9; j++) { rond(c, cx + Math.sin(j * 7.3) * bodyW * 0.45, bodyY + ((j * 37 + t * 20) % bodyH), 2.5 * k); c.fill(); } }
    else { c.fillStyle = '#ffd23a'; for (j = 0; j < 7; j++) { var yy = bodyY + bodyH - ((j * 29 + t * 90) % (bodyH + 30 * k)); rond(c, cx + Math.sin(j * 5.1) * bodyW * 0.42, yy, 3 * k); c.fill(); } }
    // la jauge qui se vide : le temps qui reste pour trouver le bon remède
    if (a.t >= a.prep) { var rest = 1 - (a.t - a.prep) / (a.fin - a.prep); c.fillStyle = 'rgba(0,0,0,.5)'; rr(c, cx - 50 * k, bodyY + bodyH + 8 * k, 100 * k, 8, 4); c.fill(); c.fillStyle = a.type === 'chaud' ? '#ff7a2a' : '#9fe3ff'; rr(c, cx - 50 * k, bodyY + bodyH + 8 * k, 100 * k * rest, 8, 4); c.fill(); }
  }
  // sonnée : des étoiles qui tournent
  if (S.sonnee > 0) for (j = 0; j < 4; j++) { var an = t * 3 + j * Math.PI / 2; emoji(c, '⭐', cx + Math.cos(an) * 40 * k, hy - 4 + Math.sin(an) * 10 * k, 15 * k); }
  // le point faible
  if (S.reg.facon === 'faible' && S.phase === 'combat') {
    var pf = S.pf;
    if (pf.ouvert) {
      var pr = 1 - Math.max(0, pf.t - (REG.faible.ouvert - 0.25)) / 0.25;
      rond(c, pf.x, L.bossTouche, 22 * k * pr); c.fillStyle = 'rgba(255,210,58,.9)'; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 3; c.stroke();
      rond(c, pf.x, L.bossTouche, 9 * k * pr); c.fillStyle = '#e0574a'; c.fill(); c.lineWidth = 2;
      if (pf.t < 0.8) { c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 30); rond(c, pf.x, L.bossTouche, 26 * k); c.strokeStyle = '#fff'; c.stroke(); c.globalAlpha = 1; }
    }
  }
  // forme 3 : le bouclier qui renvoie (rouge, qui crépite)
  if (f === 3 && (S.bouc.monte > 0 || S.bouc.actif > 0)) {
    var on2 = S.bouc.actif > 0 ? 1 : (Math.random() < 0.5 ? 0.25 : 0.7);
    c.globalAlpha = on2; c.strokeStyle = '#ff3b3b'; c.lineWidth = 4;
    var R = 118 * k; c.beginPath();
    for (var q = 0; q <= 6; q++) { var aa = q / 6 * Math.PI * 2 + Math.PI / 6; var px = cx + Math.cos(aa) * R, py = L.bossY - 10 * k + Math.sin(aa) * R * 0.86; if (q) c.lineTo(px, py); else c.moveTo(px, py); }
    c.stroke(); c.fillStyle = 'rgba(255,40,40,.12)'; c.fill();
    if (S.bouc.actif > 0) { c.lineWidth = 2; c.strokeStyle = '#ffb3b3'; for (q = 0; q < 5; q++) { var a1 = Math.random() * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a1) * R, L.bossY + Math.sin(a1) * R * 0.86); c.lineTo(cx + Math.cos(a1 + 0.2) * R * 0.85, L.bossY + Math.sin(a1 + 0.3) * R * 0.75); c.stroke(); } }
    c.globalAlpha = 1; c.lineWidth = 2;
  }
  // la bulle : dorée et calme
  if (S.phase === 'bulle') {
    var since = S.reel - (dernier(S, 'symbole', 9999) || {t: 0}).t, gr = clamp(since / 0.6, 0, 1);
    var R2 = 140 * k * gr, gg = c.createRadialGradient(cx, L.bossY - 10 * k, R2 * 0.5, cx, L.bossY - 10 * k, R2);
    gg.addColorStop(0, 'rgba(255,214,90,0)'); gg.addColorStop(0.85, 'rgba(255,214,90,.22)'); gg.addColorStop(1, 'rgba(255,230,140,.55)');
    c.fillStyle = gg; rond(c, cx, L.bossY - 10 * k, R2); c.fill();
    c.strokeStyle = 'rgba(255,230,140,' + (0.6 + 0.2 * Math.sin(t * 2)) + ')'; c.lineWidth = 3; c.stroke(); c.lineWidth = 2;
  }
  c.restore();
}

function grosbec(c, x, y, r) {
  rond(c, x, y, r); c.fillStyle = '#f2b8a0'; c.fill(); c.strokeStyle = '#11141d'; c.stroke();
  c.beginPath(); c.moveTo(x - r * 0.35, y + r * 0.05); c.lineTo(x + r * 0.35, y + r * 0.05); c.lineTo(x, y + r * 0.95); c.closePath(); c.fillStyle = '#f0a020'; c.fill(); c.stroke();
  c.fillStyle = '#11141d'; rond(c, x - r * 0.38, y - r * 0.3, r * 0.14); c.fill(); rond(c, x + r * 0.38, y - r * 0.3, r * 0.14); c.fill();
  c.fillStyle = '#ececec'; rr(c, x - r * 0.9, y - r * 1.05, r * 1.8, r * 0.45, r * 0.2); c.fill();
}

/* la pièce qui tombe, et la fin */
function piece(c, S, L) {
  var p = S.piece; if (!p) return;
  var k = L.bk, cx = L.W / 2, u = clamp(p.t / 1.6, 0, 1);
  if (S.phase === 'explose') {
    for (var i = 0; i < 10; i++) {
      var an = i / 10 * Math.PI * 2, d = u * 220 * k;
      c.globalAlpha = 1 - u * 0.7;
      rr(c, cx + Math.cos(an) * d - 14 * k, L.bossY + Math.sin(an) * d + u * u * 160 - 10 * k, 28 * k, 20 * k, 4); c.fillStyle = i % 2 ? '#7f8aa3' : '#5b6278'; c.fill();
    }
    c.globalAlpha = clamp(1 - p.t * 1.5, 0, 1) * 0.8; c.fillStyle = '#fff4c0'; c.fillRect(0, 0, L.W, L.H); c.globalAlpha = 1;
    var gy = L.bossY + u * (L.solHaut + (L.solBas - L.solHaut) * 0.5 - L.bossY);
    grosbec(c, cx, gy, 18 * k);
    return;
  }
  c.save(); c.globalAlpha = 1 - u;
  var y = L.bossY - 20 * k + u * u * (L.solBas - L.bossY);
  c.translate(cx, y); c.rotate(u * (p.forme === 1 ? 0.7 : -0.9));
  rr(c, -52 * k, -43 * k, 104 * k, 86 * k, 10 * k); c.fillStyle = p.forme === 1 ? '#a7b1c8' : '#7f8aa3'; c.fill(); c.strokeStyle = '#3f475c'; c.stroke();
  c.restore();
}

/* ---------- le sol, et ce qui s'annonce dessus ---------- */
function sol(c, S, L) {
  var x0 = L.solG, y0 = L.solHaut, w = L.solD - L.solG, h = L.solBas - L.solHaut, t = S.reel;
  c.fillStyle = '#1b2131'; c.fillRect(x0, y0, w, h);
  c.strokeStyle = 'rgba(255,255,255,.04)'; c.lineWidth = 1;
  for (var gx = x0; gx <= x0 + w; gx += 42) { c.beginPath(); c.moveTo(gx, y0); c.lineTo(gx, y0 + h); c.stroke(); }
  for (var gy = y0; gy <= y0 + h; gy += 42) { c.beginPath(); c.moveTo(x0, gy); c.lineTo(x0 + w, gy); c.stroke(); }
  c.lineWidth = 2;
  var a = S.att;
  if (S.phase === 'combat' && a) {
    if (a.type === 'poing') {
      var hx = a.cote === 'g' ? x0 : L.W / 2, hw = a.cote === 'g' ? L.W / 2 - x0 : x0 + w - L.W / 2;
      if (a.t < a.prep) {
        var p = a.t / a.prep;
        c.fillStyle = 'rgba(255,60,50,' + (0.1 + 0.35 * p) + ')'; c.fillRect(hx, y0, hw, h);
        c.strokeStyle = 'rgba(255,90,80,' + (0.5 + 0.5 * Math.sin(t * (8 + 14 * p))) + ')'; c.lineWidth = 4; c.strokeRect(hx + 2, y0 + 2, hw - 4, h - 4); c.lineWidth = 2;
        emoji(c, '👊', hx + hw / 2, y0 + h / 2, 44 + 20 * p);
      } else {
        var q = clamp((a.t - a.prep) / 0.12, 0, 1);
        rr(c, hx + 6, y0 + 4, hw - 12, (h - 8) * q, 18); c.fillStyle = 'rgba(160,170,195,.85)'; c.fill(); c.strokeStyle = '#11141d'; c.stroke();
        for (var i = 1; i < 4; i++) { c.fillStyle = 'rgba(80,88,110,.8)'; rr(c, hx + hw * i / 4 - 6, y0 + 12, 12, (h - 30) * q * 0.4, 6); c.fill(); }
      }
    } else if (a.type === 'souffle') {
      var bas = P2.basSouffle(S);
      if (a.t < a.prep) {
        var p2 = a.t / a.prep;
        c.fillStyle = 'rgba(255,140,30,' + (0.08 + 0.3 * p2) + ')'; c.fillRect(x0, y0, w, bas - y0);
        c.strokeStyle = 'rgba(255,170,60,' + (0.4 + 0.5 * Math.sin(t * (7 + 12 * p2))) + ')'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(x0, bas); c.lineTo(x0 + w, bas); c.stroke(); c.lineWidth = 2;
        for (i = 0; i < 6; i++) emoji(c, '🔥', x0 + w * (i + 0.5) / 6, y0 + (bas - y0) * 0.5 + Math.sin(t * 6 + i) * 6, 22 + 10 * p2);
      } else {
        var A = REG.att.souffle, k2 = clamp((a.t - a.prep) / A.balaie, 0, 1), front = y0 + (bas - y0) * k2;
        var g = c.createLinearGradient(0, y0, 0, front + 1);
        g.addColorStop(0, 'rgba(255,90,20,.85)'); g.addColorStop(1, 'rgba(255,220,80,.95)');
        c.fillStyle = g; c.fillRect(x0, y0, w, front - y0);
        for (i = 0; i < 9; i++) emoji(c, '🔥', x0 + w * (i + 0.5) / 9, front - 10 + Math.sin(t * 20 + i) * 5, 30);
      }
    } else if (a.type === 'charge' && a.t >= a.prep) {
      var gauche = a.orGauche, pul = 0.22 + 0.1 * Math.sin(t * 6);
      c.fillStyle = 'rgba(255,205,60,' + pul + ')'; c.fillRect(gauche ? x0 : L.W / 2, y0, w / 2, h);
      c.fillStyle = 'rgba(255,50,60,' + pul + ')'; c.fillRect(gauche ? L.W / 2 : x0, y0, w / 2, h);
      var rest = 1 - (a.t - a.prep) / (a.fin - a.prep);
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x0, y0 + h - 6, w * rest, 6);
    }
  }
  // les bandes de la danse
  if (S.phase === 'bulle' && S.danse && S.danse.attente <= 0) {
    var D = S.danse, n = REG.bandes[S.forme].n, bw = w / n, sur = P2.surDanse(S);
    for (var b = 0; b < n; b++) {
      var bx = x0 + b * bw;
      c.strokeStyle = 'rgba(255,255,255,.08)'; c.strokeRect(bx, y0, bw, h);
      if (b === sur) continue;
      if (!D.explose) { var pa = D.t / (D.T * REG.alerte); c.fillStyle = 'rgba(255,150,40,' + (0.08 + 0.42 * pa * pa) + ')'; c.fillRect(bx + 2, y0, bw - 4, h); }
      else { // l'explosion : un éclair blanc, puis rouge vif
        var pe = (D.t - D.T * REG.alerte) / (D.T * (1 - REG.alerte));
        c.fillStyle = pe < 0.15 ? 'rgba(255,250,230,.95)' : 'rgba(235,40,30,' + (0.9 - 0.5 * pe) + ')'; c.fillRect(bx + 2, y0, bw - 4, h);
        for (var e2 = 0; e2 < 4; e2++) emoji(c, '💥', bx + bw / 2 + Math.sin(e2 * 2.1 + D.k) * bw * 0.25, y0 + h * (e2 + 0.5) / 4, 26 + 10 * (1 - pe));
      }
    }
  }
  c.strokeStyle = '#3a4560'; c.lineWidth = 3; c.strokeRect(x0, y0, w, h); c.lineWidth = 2;
}

function plein(c, S, L) { // ce qui touche toute la salle : le gros coup, l'explosion de chaleur, le gel
  var e = dernier(S, 'grosBoum', 0.6) || dernier(S, 'chaudBoum', 0.6);
  if (e) { var u = (S.reel - e.t) / 0.6; c.fillStyle = (e.type === 'grosBoum' ? 'rgba(255,255,230,' : 'rgba(255,110,30,') + (0.75 * (1 - u)) + ')'; c.fillRect(L.solG, L.solHaut, L.solD - L.solG, L.solBas - L.solHaut); }
  var g = dernier(S, 'gel', 0.8);
  if (g) { c.fillStyle = 'rgba(170,230,255,' + 0.6 * (1 - (S.reel - g.t) / 0.8) + ')'; c.fillRect(L.solG, L.solHaut, L.solD - L.solG, L.solBas - L.solHaut); }
}

/* ---------- les réparateurs, les coups ---------- */
function reparateurs(c, S, L) {
  S.reps.forEach(function (r) {
    if (r.ok) { c.strokeStyle = 'rgba(120,255,160,' + (0.5 + 0.5 * Math.sin(S.reel * 20)) + ')'; c.lineWidth = 3; c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x, r.y - 40); c.stroke(); c.lineWidth = 2; }
    rr(c, r.x - 11, r.y - 11, 22, 22, 5); c.fillStyle = '#9aa0ac'; c.fill(); c.strokeStyle = '#11141d'; c.stroke();
    emoji(c, '🔧', r.x, r.y, 14);
  });
}
function tirs(c, S, L, col) {
  S.tirs.forEach(function (s) { rond(c, s.x, s.y, s.fort ? 7 : 5); c.fillStyle = s.fort ? '#ffd23a' : col; c.fill(); });
  S.renvois.forEach(function (r) { rond(c, r.x, r.y, 7); c.fillStyle = '#ff3b3b'; c.fill(); c.strokeStyle = '#ffd0d0'; c.stroke(); });
  S.evts.forEach(function (e) {
    var u = (S.reel - e.t);
    if (e.type === 'touche' && u < 0.25) { rond(c, e.x, e.y, 6 + u * 50); c.strokeStyle = 'rgba(255,255,255,' + (1 - u * 4) + ')'; c.stroke(); }
    if (e.type === 'ting' && u < 0.3) { c.strokeStyle = 'rgba(180,190,210,' + (1 - u * 3.3) + ')'; c.beginPath(); c.moveTo(e.x - 8, e.y + 4); c.lineTo(e.x + 8, e.y - 4); c.moveTo(e.x - 8, e.y - 4); c.lineTo(e.x + 8, e.y + 4); c.stroke(); }
    if (e.type === 'repareCasse' && u < 0.4) { for (var i = 0; i < 6; i++) { var an = i * 1.05; rond(c, e.x + Math.cos(an) * u * 80, e.y + Math.sin(an) * u * 80, 4); c.fillStyle = 'rgba(160,165,175,' + (1 - u * 2.5) + ')'; c.fill(); } }
    if (e.type === 'remedeBon' && u < 0.7) { c.fillStyle = (e.el === 'feu' ? 'rgba(255,140,40,' : 'rgba(150,220,255,') + 0.6 * (1 - u / 0.7) + ')'; rond(c, L.W / 2, L.bossY, 40 + u * 150); c.fill(); }
    if (e.type === 'charge' && u < 0.4) { c.strokeStyle = e.c === 'or' ? '#ffd23a' : '#ff3b3b'; c.lineWidth = 4; c.beginPath(); c.moveTo(L.W / 2, L.bossY); for (var j = 1; j <= 6; j++) c.lineTo(L.W / 2 + (S.h.x - L.W / 2) * j / 6 + (j < 6 ? (Math.random() - 0.5) * 30 : 0), L.bossY + (S.h.y - L.bossY) * j / 6); c.stroke(); c.lineWidth = 2; }
    if (e.type === 'codeFaux' && u < 0.4) { c.strokeStyle = '#ff3b3b'; c.lineWidth = 4; c.beginPath(); c.moveTo(L.W / 2, L.bossY); c.lineTo(S.h.x, S.h.y); c.stroke(); c.lineWidth = 2; }
  });
}

/* ---------- le héros ---------- */
function heros(c, S, L) {
  var h = S.h, R = ROLES[S.reg.role] || ROLES.barde, r = REG.heros.rayon, t = S.reel;
  if (h.invul > 0 && Math.floor(t * 12) % 2) return;
  c.save();
  if (h.mort > 0) c.globalAlpha = 0.45;
  rond(c, h.x, h.y + r * 0.85, r * 0.9); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill();
  if (h.bonus > 0) { rond(c, h.x, h.y, r + 8 + Math.sin(t * 10) * 2); c.fillStyle = 'rgba(255,210,58,.35)'; c.fill(); }
  if (h.charge) { rond(c, h.x, h.y, r + 6); c.strokeStyle = h.charge === 'or' ? '#ffd23a' : '#ff3b3b'; c.lineWidth = 5; c.stroke(); c.lineWidth = 2; }
  rond(c, h.x, h.y, r); c.fillStyle = h.mort > 0 ? '#777' : R.c; c.fill(); c.strokeStyle = '#11141d'; c.lineWidth = 3; c.stroke(); c.lineWidth = 2;
  emoji(c, h.mort > 0 ? '💀' : R.ic, h.x, h.y, 19);
  if (h.potion > 0) {
    var p = 1 - h.potion / REG.potion.duree;
    c.strokeStyle = '#5fe07a'; c.lineWidth = 5; c.beginPath(); c.arc(h.x, h.y, r + 9, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke(); c.lineWidth = 2;
    emoji(c, '🧪', h.x + r + 6, h.y - r - 6, 16);
  }
  if (h.gel > 0) { rr(c, h.x - r - 5, h.y - r - 5, (r + 5) * 2, (r + 5) * 2, 6); c.fillStyle = 'rgba(170,230,255,.6)'; c.fill(); c.strokeStyle = '#e6f8ff'; c.stroke(); }
  if (h.coupe > 0) { rond(c, h.x, h.y, r + 2); c.fillStyle = 'rgba(255,40,40,' + h.coupe * 1.6 + ')'; c.fill(); }
  c.restore();
  var e = dernier(S, 'potionBue', 0.6);
  if (e) { var u = (S.reel - e.t) / 0.6; rond(c, h.x, h.y, r + u * 30); c.strokeStyle = 'rgba(95,224,122,' + (1 - u) + ')'; c.lineWidth = 4; c.stroke(); c.lineWidth = 2; }
}

/* ---------- les barres, le symbole, le cri du Pisteur ---------- */
function barres(c, S, L) {
  var x0 = 16, w = L.W - 32 - 54, y = 14, hh = 14;
  // la vie de l'armure, en trois tiers
  c.fillStyle = 'rgba(0,0,0,.5)'; rr(c, x0 - 2, y - 2, w + 4, hh + 4, 6); c.fill();
  var part = S.vie / REG.vie;
  c.fillStyle = '#d84a3a'; rr(c, x0, y, w * part, hh, 4); c.fill();
  for (var i = 1; i < 3; i++) { c.fillStyle = '#0b0d18'; c.fillRect(x0 + w * i / 3 - 1.5, y - 2, 3, hh + 4); }
  if (S.phase === 'combat') { // la marque du symbole
    var sx = x0 + w * P2.seuil(S) / REG.vie;
    c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(sx, y + hh + 1); c.lineTo(sx - 6, y + hh + 9); c.lineTo(sx + 6, y + hh + 9); c.closePath(); c.fill();
  }
  if (S.phase === 'bulle') { c.fillStyle = 'rgba(255,214,90,.45)'; rr(c, x0, y, w * part, hh, 4); c.fill(); }
  // la barre du gros coup
  var a = S.att;
  if (a && a.type === 'grosCoup' && a.t < a.prep && S.phase === 'combat') {
    var p = a.t / a.prep, by = y + hh + 12;
    c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, L.W / 2 - 100, by, 200, 12, 6); c.fill();
    c.fillStyle = p > 0.75 ? '#ffffff' : '#fff1a0'; rr(c, L.W / 2 - 100, by, 200 * p, 12, 6); c.fill();
    c.strokeStyle = '#ffd23a'; rr(c, L.W / 2 - 100, by, 200, 12, 6); c.stroke();
  }
  // la vie du héros
  var R = ROLES[S.reg.role] || ROLES.barde, hy = L.solBas + 14, hx = 46, hw2 = L.W - hx - 18;
  rond(c, 26, hy + 7, 13); c.fillStyle = R.c; c.fill(); c.strokeStyle = '#11141d'; c.stroke(); emoji(c, R.ic, 26, hy + 7, 14);
  c.fillStyle = 'rgba(0,0,0,.55)'; rr(c, hx, hy, hw2, 14, 7); c.fill();
  var pv = Math.max(0, S.h.pv) / REG.heros.pv;
  c.fillStyle = pv < 0.35 ? '#ff6a4a' : '#5fe07a'; rr(c, hx, hy, hw2 * pv, 14, 7); c.fill();
  if (S.h.coupe > 0) { c.fillStyle = 'rgba(255,60,60,' + S.h.coupe * 2 + ')'; rr(c, hx, hy, hw2, 14, 7); c.fill(); }
}

function symboles(c, S, L) {
  var R = ROLES[S.reg.role] || ROLES.barde;
  if (S.symbole) {
    var e = dernier(S, 'symbole', 1.9);
    if (e) { // le symbole s'affiche en grand, puis va se ranger en haut à gauche
      var u = (S.reel - e.t) / 1.9, gros = u < 0.75, k2 = gros ? 1 : 1 - (u - 0.75) / 0.25;
      var x = 32 + (L.W / 2 - 32) * k2, y = 52 + (L.solHaut + 60 - 52) * k2, s = 26 + 54 * k2;
      c.fillStyle = 'rgba(0,0,0,' + 0.55 * k2 + ')'; rond(c, x, y, s * 1.15); c.fill();
      c.strokeStyle = R.c; c.lineWidth = 6 * k2 + 2; rond(c, x, y, s * 1.15); c.stroke(); c.lineWidth = 2;
      emoji(c, S.symbole, x, y, s * 1.3);
      if (gros) emoji(c, '📣', x + s * 1.3, y - s * 0.9, 34);
    } else {
      c.fillStyle = 'rgba(0,0,0,.55)'; rr(c, 10, 34, 78, 36, 18); c.fill();
      c.strokeStyle = R.c; c.lineWidth = 3; rr(c, 10, 34, 78, 36, 18); c.stroke(); c.lineWidth = 2;
      rond(c, 28, 52, 12); c.fillStyle = R.c; c.fill(); emoji(c, R.ic, 28, 52, 13);
      emoji(c, S.symbole, 64, 52, 24);
    }
  }
  if (S.cri && S.phase === 'bulle') { // le Pisteur a crié son code
    var P = ROLES.pisteur, e2 = dernier(S, 'cri', 0.5), z = e2 ? 1 + 0.25 * (1 - (S.reel - e2.t) / 0.5) : 1;
    var cx = L.W / 2, cy = L.solHaut - 34;
    c.save(); c.translate(cx, cy); c.scale(z, z);
    c.fillStyle = 'rgba(10,14,24,.85)'; rr(c, -96, -24, 192, 48, 24); c.fill(); c.strokeStyle = P.c; c.lineWidth = 3; rr(c, -96, -24, 192, 48, 24); c.stroke(); c.lineWidth = 2;
    rond(c, -72, 0, 17); c.fillStyle = P.c; c.fill(); c.strokeStyle = '#11141d'; c.stroke(); emoji(c, P.ic, -72, 0, 18);
    for (var i = 0; i < 3; i++) emoji(c, S.cri[i], -24 + i * 44, 0, 28);
    c.restore();
  }
}

function fond(c, S, L) {
  c.fillStyle = '#0b0d18'; c.fillRect(0, 0, L.W, L.H);
  c.fillStyle = '#121626'; c.fillRect(0, 0, L.W, L.solHaut);
  c.fillStyle = '#171c2e';
  for (var i = 0; i < 5; i++) c.fillRect(20 + i * 95, 40, 22, L.solHaut - 40);
}

function tout(c, S, L) {
  fond(c, S, L);
  sol(c, S, L);
  armure(c, S, L);
  piece(c, S, L);
  reparateurs(c, S, L);
  tirs(c, S, L, (ROLES[S.reg.role] || ROLES.barde).c);
  heros(c, S, L);
  plein(c, S, L);
  barres(c, S, L);
  symboles(c, S, L);
  if (S.lent < 1) { c.fillStyle = 'rgba(90,140,255,.10)'; c.fillRect(0, 0, L.W, L.H); }
  // un coup reçu : le bord de l'écran rougit
  if (S.h.coupe > 0) { c.strokeStyle = 'rgba(255,40,40,' + S.h.coupe * 1.8 + ')'; c.lineWidth = 16; c.strokeRect(0, 0, L.W, L.H); c.lineWidth = 2; }
}

G.Dessin = {tout: tout, ROLES: ROLES, grosbec: grosbec, emoji: emoji};
})(typeof window !== 'undefined' ? window : globalThis);
