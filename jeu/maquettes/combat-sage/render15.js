// ===== Le rendu : l'arène, les golems qui marchent, les héros, les effets =====
const TAU = Math.PI * 2;
const R8 = { anim: new Map(), prev: new Map(), parts: [], motes: [], sc: 0, spr: {}, wallsPrev: [], heartY: -8, sage: { x: 0, y: 0, phase: 0, face: 1, spd: 0 }, hurt: {}, t: 0 };
function view() { const k = Math.min(cv.width, cv.height) / G.W; return { k, ox: (cv.width - G.W * k) / 2, oy: (cv.height - G.H * k) / 2 }; }
const rnd = (a, b) => a + Math.random() * (b - a);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const seeded = seed => { let r = seed % 233280; return () => ((r = (r * 9301 + 49297) % 233280) / 233280); };

// ----- une pierre taillée, ombrée, avec fissures, mousse ou racines -----
function stonePath(g, cx, cy, w, h, seed, jag) {
  const rn = seeded(seed); g.beginPath();
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * TAU, k = 1 - jag + rn() * jag * 2, ca = Math.cos(a), sa = Math.sin(a);
    const x = cx + Math.sign(ca) * Math.pow(Math.abs(ca), 0.55) * w / 2 * k, y = cy + Math.sign(sa) * Math.pow(Math.abs(sa), 0.55) * h / 2 * k;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}
function paintStone(g, cx, cy, w, h, seed, pal, o = {}) {
  stonePath(g, cx, cy, w, h, seed, o.jag ?? 0.09);
  const gr = g.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 3, cy + h / 2);
  gr.addColorStop(0, pal[0]); gr.addColorStop(0.5, pal[1]); gr.addColorStop(1, pal[2]);
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  const rn = seeded(seed * 7 + 11);
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(0,0,0,${0.06 + rn() * 0.08})`; g.beginPath(); g.arc(cx + (rn() - .5) * w, cy + (rn() - .5) * h, 0.6 + rn() * w * 0.04, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(cx - w * .16, cy - h * .3, w * .34, h * .15, -0.25, 0, TAU); g.fill();
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(cx + w * .1, cy + h * .42, w * .5, h * .18, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(20,16,12,.45)'; g.lineWidth = Math.max(0.8, w * 0.03);
  for (let i = 0; i < (o.cracks ?? 2); i++) { let x = cx + (rn() - .5) * w * .55, y = cy - h * .3 + rn() * h * .3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (rn() - .5) * w * .28; y += h * (0.08 + rn() * .14); g.lineTo(x, y); } g.stroke(); }
  if (o.moss) for (let i = 0; i < 7; i++) { g.fillStyle = ['rgba(92,150,72,.85)', 'rgba(64,118,54,.85)', 'rgba(120,170,80,.7)'][i % 3]; g.beginPath(); g.arc(cx + (rn() - .5) * w * .85, cy - h * .42 + rn() * h * .28, w * (0.05 + rn() * .06), 0, TAU); g.fill(); }
  if (o.roots) { g.strokeStyle = 'rgba(98,66,36,.95)'; g.lineWidth = Math.max(1.4, w * .045); g.lineCap = 'round'; for (let i = 0; i < 4; i++) { let x = cx + (rn() - .5) * w * .8, y = cy - h * .5; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rn() - .5) * w * .14; y += h * .2; g.lineTo(x, y); } g.stroke(); } }
  g.restore();
  stonePath(g, cx, cy, w, h, seed, o.jag ?? 0.09);
  g.lineWidth = Math.max(1.2, w * 0.05); g.strokeStyle = pal[3]; g.stroke();
}
// le dessin d'une pièce dans une petite toile, à la bonne finesse
function piece(w, h, sc, draw) {
  const pad = 4, c = mk((w + pad * 2) * sc, (h + pad * 2) * sc), g = c.getContext('2d');
  g.scale(sc, sc); g.translate(pad, pad); draw(g);
  const white = mk(c.width, c.height), gw = white.getContext('2d');
  gw.drawImage(c, 0, 0); gw.globalCompositeOperation = 'source-in'; gw.fillStyle = '#fff'; gw.fillRect(0, 0, c.width, c.height);
  return { c, white, w: w + pad * 2, h: h + pad * 2, pad };
}

// ----- les golems -----
const GOLEM = {
  cogneur: { bw: 38, bh: 31, hw: 22, hh: 17, lw: 11, lh: 14, aw: 10, al: 23, pal: ['#c3c8d3', '#878d9b', '#545967', '#262a33'], cr: 7, o: {} },
  coureur: { bw: 25, bh: 19, hw: 16, hh: 12, lw: 5, lh: 22, aw: 0, al: 0, pal: ['#9a96a8', '#6a6678', '#423f4e', '#201e28'], cr: 5, o: { cracks: 1 }, crystalLegs: true },
  brute: { bw: 47, bh: 39, hw: 27, hh: 19, lw: 15, lh: 16, aw: 13, al: 29, pal: ['#b1a790', '#80765f', '#50483a', '#262118'], cr: 8, o: { moss: true, cracks: 2 } },
  costaud: { bw: 68, bh: 56, hw: 31, hh: 23, lw: 21, lh: 21, aw: 19, al: 40, pal: ['#f1ede2', '#c3bba7', '#878069', '#3a352a'], cr: 12, o: { roots: true, cracks: 3 } },
  lanceur: { bw: 30, bh: 27, hw: 19, hh: 15, lw: 9, lh: 14, aw: 9, al: 21, pal: ['#e2c493', '#b08e64', '#725839', '#36281a'], cr: 6, o: { cracks: 1 } }
};
function golemSprites(type, sc) {
  const P = GOLEM[type], seed = { cogneur: 11, coureur: 23, brute: 37, costaud: 51, lanceur: 67 }[type];
  return {
    body: piece(P.bw, P.bh, sc, g => paintStone(g, P.bw / 2, P.bh / 2, P.bw, P.bh, seed, P.pal, P.o)),
    head: piece(P.hw, P.hh, sc, g => paintStone(g, P.hw / 2, P.hh / 2, P.hw, P.hh, seed + 5, P.pal, { cracks: 1, moss: P.o.moss, jag: 0.12 })),
    arm: P.aw ? piece(P.aw, P.al, sc, g => paintStone(g, P.aw / 2, P.al / 2, P.aw, P.al, seed + 9, P.pal, { cracks: 0, jag: 0.06 })) : null,
    leg: P.crystalLegs ? null : piece(P.lw, P.lh, sc, g => paintStone(g, P.lw / 2, P.lh / 2, P.lw, P.lh, seed + 13, P.pal, { cracks: 0, jag: 0.05 }))
  };
}
function glowSprite(sc, col) {
  const R = 30, c = mk(R * 2 * sc, R * 2 * sc), g = c.getContext('2d'), gr = g.createRadialGradient(R * sc, R * sc, 0, R * sc, R * sc, R * sc);
  gr.addColorStop(0, col.replace('A', '0.95')); gr.addColorStop(0.35, col.replace('A', '0.45')); gr.addColorStop(1, col.replace('A', '0'));
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); return c;
}
function blit(p, x, y, w, h, white) {
  const kx = w / (p.w - p.pad * 2), ky = h / (p.h - p.pad * 2);
  ctx.drawImage(white ? p.white : p.c, x - p.pad * kx, y - p.pad * ky, p.w * kx, p.h * ky);
}
const FOOT = type => GOLEM[type].lh + GOLEM[type].bh * 0.5 - 2;
function crystal(x, y, size, t, dim) {
  const pulse = dim ? 0.2 : 0.45 + Math.sin(t) * 0.25, ga = ctx.globalAlpha;
  ctx.globalAlpha = ga * pulse; ctx.drawImage(R8.spr.glowRed, x - size * 2.6, y - size * 2.6, size * 5.2, size * 5.2); ctx.globalAlpha = ga;
  ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * .62, y); ctx.lineTo(x, y + size); ctx.lineTo(x - size * .62, y); ctx.closePath();
  ctx.fillStyle = dim ? '#7a2a34' : '#ff4d5e'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#4a0f18'; ctx.stroke();
  ctx.fillStyle = dim ? 'rgba(255,200,200,.25)' : 'rgba(255,230,230,.85)'; ctx.beginPath(); ctx.moveTo(x, y - size * .8); ctx.lineTo(x + size * .25, y - size * .1); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
}
function limb(p, x0, y0, x1, y1, w, flash) {
  const ang = Math.atan2(x1 - x0, y1 - y0), len = Math.hypot(x1 - x0, y1 - y0);
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(-ang); blit(p, -w / 2, 0, w, len); if (flash) { ctx.globalAlpha = flash; blit(p, -w / 2, 0, w, len, true); }
  ctx.restore();
}
function drawGolem(u, a, t) {
  const P = GOLEM[u.type], S = R8.spr[u.type], dazed = u.daze > 0, fl = u.flash > 0 ? Math.min(1, u.flash * 9) : 0;
  const dancing = u.dance > 0 && !dazed && !a.flying;
  const moving = (a.spd > 6 && !dazed && !a.flying) || dancing, ph = dancing ? t * 9 + u.id : a.phase, s1 = Math.sin(ph), c1 = Math.cos(ph);
  const heavy = u.type === 'costaud' ? 1 : u.type === 'brute' ? 0.8 : u.type === 'coureur' ? 0.2 : 0.5;
  const stride = moving ? P.lw * 0.8 + 3 : 0, lift = moving ? P.lh * (0.45 + heavy * 0.15) : 0;
  const bob = moving ? Math.pow(Math.abs(c1), 0.6) * (2 + heavy * 3) : Math.sin(t * 2 + u.id) * 0.7;
  const dX = Math.abs(a.mx), dY = a.my, roll = moving ? s1 * 0.09 * heavy : 0;
  const lean = u.type === 'coureur' && moving ? 0.18 : 0;
  const F = FOOT(u.type);
  ctx.save(); ctx.translate(u.x, u.y + F);
  const born = Math.min(1, a.age / 0.35); if (born < 1) { ctx.globalAlpha = born; }
  ctx.fillStyle = 'rgba(0,0,0,.36)'; ctx.beginPath(); ctx.ellipse(0, 1, P.bw * .56, P.bw * .19, 0, 0, TAU); ctx.fill();
  if (a.rot) { ctx.translate(0, -P.lh - P.bh / 2); ctx.rotate(a.rot); ctx.translate(0, P.lh + P.bh / 2); }
  if (dazed && !a.flying) { ctx.rotate((u.id % 2 ? 0.22 : -0.22) + Math.sin(t * 7 + u.id) * 0.06); }
  if (dancing) { ctx.translate(0, -Math.abs(Math.sin(t * 9 + u.id)) * 7); ctx.rotate(Math.sin(t * 4.5 + u.id) * 0.3); }
  ctx.scale(a.face, 1);
  if (lean) ctx.rotate(lean);
  const hipY = -P.lh - bob, bodyTop = hipY - P.bh + 4;
  // jambes (celle de derrière, puis celle de devant)
  for (const side of [-1, 1]) {
    const k = side < 0 ? s1 : -s1, up = Math.max(0, side < 0 ? c1 : -c1), hx = side * P.bw * 0.2;
    const fx = hx + k * stride * (0.35 + dX * 0.65), fy = k * stride * dY * 0.45 - up * lift;
    if (P.crystalLegs) {
      ctx.strokeStyle = side < 0 ? '#9c2a3a' : '#e0475a'; ctx.lineWidth = P.lw; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hipY + 2); ctx.lineTo((hx + fx) / 2 + 3, (hipY + fy) / 2); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,220,220,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(hx, hipY + 2); ctx.lineTo((hx + fx) / 2 + 3, (hipY + fy) / 2); ctx.stroke();
    } else limb(S.leg, hx, hipY - 3, fx, fy, P.lw, fl);
  }
  // bras de derrière
  const rate = G.TYPES[u.type].rate, fighting = !moving && !dazed && !a.flying && a.age > 0.6;
  const atkWind = fighting ? Math.max(0, 1 - u.atk / 0.35) : 0, strike = fighting ? Math.max(0, 1 - (rate - u.atk) / 0.18) : 0;
  const armAng = side => dancing ? Math.PI * (0.75 + 0.2 * Math.sin(t * 9 + u.id + (side > 0 ? 0 : Math.PI))) : moving ? (side < 0 ? -s1 : s1) * 0.75 : side > 0 ? (strike > 0 ? Math.PI * 0.5 * strike + 0.2 : Math.PI * 0.92 * atkWind) : Math.sin(t * 2 + u.id) * 0.06;
  if (strike > 0 && u.type !== 'lanceur') ctx.rotate(0.12 * strike);
  const shY = bodyTop + P.bh * 0.28;
  ctx.save(); ctx.translate(0, hipY); ctx.rotate(roll); ctx.translate(0, -hipY);
  if (P.aw) { const an = armAng(-1), sx = -P.bw * .44; limb(S.arm, sx, shY, sx + Math.sin(an) * P.al, shY + Math.cos(an) * P.al, P.aw, fl); }
  // corps
  blit(S.body, -P.bw / 2, bodyTop, P.bw, P.bh); if (fl) { ctx.globalAlpha = fl; blit(S.body, -P.bw / 2, bodyTop, P.bw, P.bh, true); ctx.globalAlpha = born; }
  crystal(P.bw * 0.06, bodyTop + P.bh * 0.48, P.cr, t * 4 + u.id, dazed);
  // tête
  const hy = bodyTop - P.hh * 0.72 + (moving ? -Math.abs(s1) * 0.8 : 0), hx = P.bw * 0.06;
  blit(S.head, hx - P.hw / 2, hy, P.hw, P.hh); if (fl) { ctx.globalAlpha = fl; blit(S.head, hx - P.hw / 2, hy, P.hw, P.hh, true); ctx.globalAlpha = born; }
  const ey = hy + P.hh * 0.48, eg = dazed ? '#6b4a4a' : '#ff6a5a';
  for (const ex of [hx + P.hw * 0.02, hx + P.hw * 0.3]) { ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, Math.max(1.6, P.hw * 0.08), 0, TAU); ctx.fill(); }
  if (!dazed) { ctx.globalAlpha = 0.35 * born; ctx.fillStyle = '#ff6a5a'; for (const ex of [hx + P.hw * 0.02, hx + P.hw * 0.3]) { ctx.beginPath(); ctx.arc(ex, ey, P.hw * 0.17, 0, TAU); ctx.fill(); } ctx.globalAlpha = born; }
  // bras de devant (le lanceur lève sa pierre)
  if (P.aw) {
    let an = armAng(1);
    if (u.type === 'lanceur' && fighting) { an = strike > 0 ? Math.PI * 0.35 : Math.PI * (0.55 + atkWind * 0.4); }
    const sx = P.bw * .44, ex = sx + Math.sin(an) * P.al, ey2 = shY + Math.cos(an) * P.al;
    limb(S.arm, sx, shY, ex, ey2, P.aw, fl);
    if (u.type === 'lanceur' && fighting && strike <= 0) { ctx.fillStyle = '#9c7a52'; ctx.beginPath(); ctx.arc(ex, ey2, 6, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  ctx.restore();
  ctx.restore();
  golemStates(u, a, t, P, F);
  // sonné : des étoiles qui tournent
  if (dazed && !a.flying) for (let i = 0; i < 3; i++) {
    const an = t * 5 + i * TAU / 3, sx = u.x + Math.cos(an) * P.hw * 0.7, sy = u.y + F - P.lh - P.bh - P.hh - 4 + Math.sin(an) * 4;
    star(sx, sy, 4.5, '#ffd23f');
  }
  if (u.hp < u.max && u.max > 2) {
    const w = P.bw * 0.8, y = u.y + F + 6;
    ctx.fillStyle = 'rgba(11,16,32,.8)'; ctx.fillRect(u.x - w / 2, y, w, 4); ctx.fillStyle = '#ff6a7a'; ctx.fillRect(u.x - w / 2, y, w * u.hp / u.max, 4);
  }
}
// ce que les amis lui ont fait : boue aux pieds, lianes, feu, danse, demi-tour
function golemStates(u, a, t, P, F) {
  const fy = u.y + F, top = fy - P.lh - P.bh - P.hh;
  if (u.mud) { ctx.fillStyle = 'rgba(92,62,32,.9)'; ctx.beginPath(); ctx.ellipse(u.x, fy - 3, P.bw * 0.5, P.lh * 0.45, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(160,120,70,.6)'; ctx.beginPath(); ctx.ellipse(u.x - P.bw * 0.15, fy - 6, P.bw * 0.16, 2.5, 0, 0, TAU); ctx.fill(); }
  if (u.held) {
    ctx.lineCap = 'round'; ctx.strokeStyle = '#2f7a30'; ctx.lineWidth = 3.2;
    for (let i = 0; i < 3; i++) { const yy = fy - 4 - i * P.lh * 0.38 - (i === 2 ? P.bh * 0.25 : 0), w = P.bw * (i === 2 ? 0.55 : 0.42); ctx.beginPath(); ctx.ellipse(u.x, yy, w, 4.5, Math.sin(t * 2 + i) * 0.08, 0.15, Math.PI - 0.15); ctx.stroke(); }
    ctx.fillStyle = '#5fbf4a'; for (let i = 0; i < 4; i++) { const lx = u.x + (i - 1.5) * P.bw * 0.25, ly = fy - 8 - (i % 2) * P.lh * 0.5; ctx.beginPath(); ctx.ellipse(lx, ly, 4, 2.2, i - 1, 0, TAU); ctx.fill(); }
  }
  if (u.burn > 0) {
    const cx = u.x, cy = fy - P.lh - P.bh * 0.55;
    ctx.globalAlpha = 0.6; ctx.drawImage(R8.spr.glowFire, cx - P.bw, cy - P.bw, P.bw * 2, P.bw * 2); ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const fx = cx + (i - 1) * P.bw * 0.28, h = P.bw * (0.35 + 0.12 * Math.sin(t * 13 + i * 2 + u.id)); flame(fx, cy + P.bh * 0.25 - (i === 1 ? 6 : 0), P.bw * 0.16, h); }
    if (Math.random() < 0.03) R8.parts.push({ x: cx + rnd(-8, 8), y: cy + 30, z: 30, vx: rnd(-10, 10), vy: 0, vz: rnd(40, 90), life: 0.6, max: 0.6, k: 'spark', col: '#ffb347', size: 2, g: -20 });
  }
  if (u.dance > 0 && !a.flying) for (let i = 0; i < 2; i++) { const an = t * 3 + i * Math.PI; note(u.x + Math.cos(an) * P.hw * 0.9, top - 10 + Math.sin(an * 2) * 4, '#ff7ad9', 1); }
  if (u.fear > 0 && !a.flying) note(u.x, top - 12 + Math.sin(t * 6) * 2, '#5ab8ff', 1);
  // cuirassé (la fureur du cœur) : un casque et une plaque de fer
  if (u.iron) {
    const hy = top + P.hh * 0.35, cx = u.x + P.bw * 0.06 * a.face;
    ctx.fillStyle = '#3d4350'; ctx.beginPath(); ctx.ellipse(cx, hy, P.hw * 0.62, P.hh * 0.42, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#9aa3b5'; ctx.fillRect(cx - P.hw * 0.62, hy - 2, P.hw * 1.24, 4);
    ctx.fillStyle = '#c9302c'; ctx.beginPath(); ctx.moveTo(cx - 3, hy - P.hh * 0.4); ctx.lineTo(cx, hy - P.hh * 0.75); ctx.lineTo(cx + 3, hy - P.hh * 0.4); ctx.fill();
    const by = fy - P.lh - P.bh * 0.55; ctx.globalAlpha = 0.85; ctx.fillStyle = '#4b5263'; rr(u.x - P.bw * 0.36, by - P.bh * 0.22, P.bw * 0.72, P.bh * 0.44, 4); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#c8ccd6'; for (const k of [-0.25, 0, 0.25]) { ctx.beginPath(); ctx.arc(u.x + P.bw * k, by - P.bh * 0.12, 1.8, 0, TAU); ctx.fill(); }
  }
  // en feu et en panique (volcan niveau 3)
  if (u.burn > 0 && G.lv(s, 'volcan') >= 3 && u.daze <= 0) { ctx.font = '900 16px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#2a0810'; ctx.strokeText('!!', u.x, top - 10 + Math.sin(t * 20 + u.id) * 2); ctx.fillStyle = '#ffdf6b'; ctx.fillText('!!', u.x, top - 10 + Math.sin(t * 20 + u.id) * 2); }
}
// la traînée d'un golem-boulet
function drawBall(u, t) {
  const sp = Math.hypot(u.vx, u.vy) || 1, nx = u.vx / sp, ny = u.vy / sp, F = FOOT(u.type), cy = u.y + F * 0.3;
  const g = ctx.createLinearGradient(u.x, cy, u.x - nx * 90, cy - ny * 90); g.addColorStop(0, 'rgba(255,200,70,.75)'); g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.strokeStyle = g; ctx.lineWidth = u.r * 1.7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(u.x, cy); ctx.lineTo(u.x - nx * 90, cy - ny * 90); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; for (const o of [-0.6, 0.6]) { ctx.beginPath(); ctx.moveTo(u.x - ny * u.r * o, cy + nx * u.r * o); ctx.lineTo(u.x - nx * 60 - ny * u.r * o, cy - ny * 60 + nx * u.r * o); ctx.stroke(); }
}
// la tornade de pages
function drawTornadoGround(tn, t) {
  ctx.save(); ctx.translate(tn.x, tn.y); ctx.scale(1, 0.6);
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(216,180,255,${0.25 - i * 0.06})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, tn.R * (0.35 + i * 0.3), t * (6 - i) , t * (6 - i) + 4.4); ctx.stroke(); }
  ctx.restore();
}
function drawTornado(tn, t) {
  const H = 150, life = Math.min(1, tn.t / 0.25, (tn.max - tn.t) / 0.15 + 0.3);
  ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, life)) * 0.8;
  for (let i = 0; i < 10; i++) {
    const k = i / 9, y = tn.y - k * H, w = 14 + k * 60, sw = Math.sin(t * 5 + i * 0.7) * 8 * k;
    ctx.strokeStyle = i % 2 ? 'rgba(230,215,255,.7)' : 'rgba(170,130,240,.6)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(tn.x + sw, y, w, w * 0.28, 0, t * 9 + i, t * 9 + i + 4.2); ctx.stroke();
  }
  // des pages qui tournent dedans
  for (let i = 0; i < 6; i++) {
    const k = ((t * 0.7 + i / 6) % 1), an = t * 8 + i * 2.3, w = 14 + k * 60, x = tn.x + Math.cos(an) * w, y = tn.y - k * H + Math.sin(an) * w * 0.28;
    ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.fillStyle = '#f3e6c4'; ctx.fillRect(-6, -8, 12, 16); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 1; ctx.strokeRect(-6, -8, 12, 16); ctx.restore();
  }
  ctx.restore();
}
// la traînée de la comète
function drawTrail(t) {
  for (const p of s.trail) {
    const a = Math.max(0, p.t / 1.8), r = 14 + 10 * a;
    ctx.globalAlpha = a * 0.7; ctx.drawImage(R8.spr.glowGold, p.x - r * 1.6, p.y + 14 - r * 1.6, r * 3.2, r * 3.2); ctx.globalAlpha = a;
    star(p.x, p.y + 14, 4 + 4 * a, p.n % 2 ? '#fff6c9' : '#ffd23f');
  }
  ctx.globalAlpha = 1;
}
// une flamme, dessinée une fois puis recopiée (beaucoup plus rapide)
function flameSprite(sc) {
  const W = 20, H = 44, c = mk(W * sc, H * sc), g = c.getContext('2d'); g.scale(sc, sc);
  const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, 'rgba(255,90,20,.95)'); gr.addColorStop(0.6, 'rgba(255,190,60,.9)'); gr.addColorStop(1, 'rgba(255,240,170,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, H); g.quadraticCurveTo(0, H * 0.5, W / 2, 0); g.quadraticCurveTo(W, H * 0.5, W, H); g.closePath(); g.fill();
  return c;
}
function flame(x, y, w, h) { if (h > 1) ctx.drawImage(R8.spr.flame, x - w, y - h, w * 2, h); }
// une note de musique
function note(x, y, col, k) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.8 * k;
  ctx.beginPath(); ctx.ellipse(x, y, 4 * k, 3 * k, -0.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 3.5 * k, y - 1 * k); ctx.lineTo(x + 3.5 * k, y - 13 * k); ctx.quadraticCurveTo(x + 8 * k, y - 10 * k, x + 8 * k, y - 6 * k); ctx.stroke();
}
// ---------- les flaques, les fioles et les partitions
function drawPuddle(p, t) {
  if (p._seed === undefined) p._seed = Math.floor(Math.random() * 9999);
  const age = p.max - p.life, grow = Math.min(1, age / 0.25), fade = Math.min(1, p.life / 0.6), R = p.R * (0.7 + 0.3 * grow), rn = seeded(p._seed + 1);
  ctx.save(); ctx.globalAlpha = fade;
  const blob = (r, jit) => { ctx.beginPath(); for (let i = 0; i <= 16; i++) { const an = i / 16 * TAU, k = 1 - jit + rn() * jit; const x = p.x + Math.cos(an) * r * k, y = p.y + Math.sin(an) * r * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
  if (p.kind === 'boue') {
    blob(R, 0.14); ctx.fillStyle = 'rgba(120,82,44,.78)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(70,46,20,.9)'; ctx.stroke();
    ctx.fillStyle = 'rgba(150,110,60,.35)'; ctx.beginPath(); ctx.ellipse(p.x - R * 0.25, p.y - R * 0.3, R * 0.3, R * 0.1, -0.3, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i++) { const ph = (t * 0.8 + i * 0.27 + p._seed % 7 * 0.1) % 1, bx = p.x + Math.cos(i * 2.1 + p._seed) * R * 0.55, by = p.y + Math.sin(i * 2.1 + p._seed) * R * 0.45; ctx.strokeStyle = `rgba(170,130,80,${0.7 * (1 - ph)})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(bx, by, 2 + ph * 6, 0, TAU); ctx.stroke(); }
  } else if (p.kind === 'lianes') {
    blob(R, 0.1); ctx.fillStyle = 'rgba(38,78,34,.6)'; ctx.fill();
    ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const an = i / 9 * TAU + rn(), r0 = R * (0.95 - rn() * 0.15), sway = Math.sin(t * 2 + i) * 0.15;
      let x = p.x + Math.cos(an) * r0, y = p.y + Math.sin(an) * r0; ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) { const a2 = an + Math.PI + (k % 2 ? 0.7 : -0.7) + sway; x += Math.cos(a2) * R * 0.18; y += Math.sin(a2) * R * 0.18; ctx.lineTo(x, y); }
      ctx.strokeStyle = '#2f7a30'; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.fillStyle = '#62c24c'; ctx.beginPath(); ctx.ellipse(x, y, 5, 2.6, an, 0, TAU); ctx.fill();
    }
  } else {
    const g = ctx.createRadialGradient(p.x, p.y, R * 0.1, p.x, p.y, R); g.addColorStop(0, 'rgba(255,170,60,.55)'); g.addColorStop(0.7, 'rgba(230,70,20,.4)'); g.addColorStop(1, 'rgba(120,20,0,0)');
    ctx.fillStyle = g; blob(R, 0.12); ctx.fill();
    for (let i = 0; i < 9; i++) { const an = i * 2.39 + p._seed, rr = R * (0.15 + (i % 3) * 0.27), fx = p.x + Math.cos(an) * rr, fy = p.y + Math.sin(an) * rr * 0.85; flame(fx, fy, 6, 16 + 9 * Math.sin(t * 11 + i * 1.7)); }
  }
  ctx.restore();
}
const POTCOL = { boue: '#8a5a2b', lianes: '#4caf50', feu: '#ff7a1a' };
function drawPotion(p) {
  const k = Math.min(1, p.t / p.T), x = p.x0 + (p.x - p.x0) * k, gy = p.y0 + (p.y - p.y0) * k, h = Math.sin(k * Math.PI) * 120 + (1 - k) * 34;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, gy + 10, 7, 3, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(x, gy - h); ctx.rotate(k * 9);
  ctx.globalAlpha = 0.7; ctx.drawImage(R8.spr.glowGold, -14, -14, 28, 28); ctx.globalAlpha = 1;
  ctx.fillStyle = POTCOL[p.kind]; ctx.beginPath(); ctx.arc(0, 2, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8f5ff'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#c9a15a'; ctx.fillRect(-2, -9, 4, 5);
  ctx.restore();
}
function drawPartition(n, t) {
  const col = { danse: '#ff7ad9', demitour: '#5ab8ff', repousse: '#ffb347' }[n.kind], an = Math.atan2(n.vy, n.vx);
  if (Math.random() < 0.35) R8.parts.push({ x: n.x + rnd(-10, 10), y: n.y + rnd(-6, 6), z: 0, vx: -n.vx * 0.15, vy: -n.vy * 0.15 - 20, vz: 0, life: 0.7, max: 0.7, k: 'note', col, size: 1, g: 0 });
  ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(Math.sin(t * 6 + n.x * 0.01) * 0.25 + (Math.abs(an) > Math.PI / 2 ? Math.PI : 0) * 0);
  ctx.globalAlpha = 0.6; ctx.drawImage(n.kind === 'danse' ? R8.spr.glowPink : n.kind === 'repousse' ? R8.spr.glowGold : R8.spr.glowCyan, -30, -30, 60, 60); ctx.globalAlpha = 1;
  ctx.fillStyle = '#f4ead0'; ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-24, -15, 48, 30, 4) : ctx.rect(-24, -15, 48, 30); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(60,40,20,.55)'; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-20, -9 + i * 4.5); ctx.lineTo(20, -9 + i * 4.5); ctx.stroke(); }
  for (let i = 0; i < 3; i++) note(-12 + i * 11, 4 - (i % 2) * 6, col, 0.75);
  ctx.restore();
}
function star(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr2 = i % 2 ? r * 0.45 : r; i ? ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2) : ctx.moveTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fill();
}

// ----- les héros -----
const SKIN = '#f1c49b';
function hood(x, y, w, h, col, dark, trim) {
  ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(x - w * .55, y + h * .55); ctx.quadraticCurveTo(x - w * .62, y - h * .55, x + w * .05, y - h * .62); ctx.quadraticCurveTo(x + w * .6, y - h * .5, x + w * .55, y + h * .55); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); g.addColorStop(0, col); g.addColorStop(1, dark);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w * .5, y + h * .5); ctx.quadraticCurveTo(x - w * .56, y - h * .5, x + w * .04, y - h * .56); ctx.quadraticCurveTo(x + w * .54, y - h * .44, x + w * .5, y + h * .5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a1a14'; ctx.beginPath(); ctx.ellipse(x + w * .08, y + h * .1, w * .32, h * .33, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(x + w * .1, y + h * .14, w * .26, h * .27, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(200,110,90,.35)'; ctx.beginPath(); ctx.arc(x + w * .24, y + h * .26, w * .06, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1d14'; for (const ex of [x + w * .04, x + w * .2]) { ctx.beginPath(); ctx.arc(ex, y + h * .1, w * .045, 0, TAU); ctx.fill(); }
  if (trim) { ctx.strokeStyle = trim; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x + w * .08, y + h * .1, w * .34, h * .35, 0, 0, TAU); ctx.stroke(); }
}
function robe(x, y, w, h, col, dark, hem) {
  const g = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y + h); g.addColorStop(0, col); g.addColorStop(1, dark);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w * .32, y); ctx.lineTo(x + w * .32, y); ctx.quadraticCurveTo(x + w * .6, y + h * .7, x + w * .52, y + h); ctx.quadraticCurveTo(x, y + h * 1.08, x - w * .52, y + h); ctx.quadraticCurveTo(x - w * .6, y + h * .7, x - w * .32, y); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(10,10,20,.55)'; ctx.stroke();
  if (hem) { ctx.strokeStyle = hem; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - w * .5, y + h * .97); ctx.quadraticCurveTo(x, y + h * 1.05, x + w * .5, y + h * .97); ctx.stroke(); }
}
function boots(x, y, k, col) {
  ctx.fillStyle = col;
  for (const side of [-1, 1]) { const off = side * 6 + (side < 0 ? k : -k) * 5, lift = Math.max(0, side < 0 ? k : -k) * 3; ctx.beginPath(); ctx.ellipse(x + off, y - 2 - lift, 6, 3.6, 0, 0, TAU); ctx.fill(); }
}
function drawHero(f, t) {
  const id = f.id, free = f.free, hit = f.flash > 0 ? Math.min(1, f.flash * 4) : 0;
  const isSage = id === 'S', a = isSage ? R8.sage : { face: id === 'P' ? -1 : 1, spd: 0, phase: 0 };
  const moving = isSage && a.spd > 8, k = moving ? Math.sin(a.phase) : 0, bob = moving ? Math.abs(Math.cos(a.phase)) * 1.6 : Math.sin(t * 2.2 + id.charCodeAt(0)) * 0.6;
  let x = f.x, y = f.y, jump = 0;
  if (f.leap) { const k = 1 - f.leap.t / f.leap.max, g = Math.sin(k * Math.PI); x += (f.leap.x - f.x) * g * 0.8; y += (f.leap.y - f.y) * g * 0.8; jump = g * 34; }
  ctx.save(); ctx.translate(x, y + 28);
  if (hit) ctx.translate(Math.sin(t * 60) * 2 * hit, 0);
  // halo doré d'un ami libéré, cercle de runes du Sage qui grave
  if (free) { ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.2; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 30, 11, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  if (isSage && brush) runeCircle(0, 0, t);
  ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.beginPath(); ctx.ellipse(0, 1, 22, 8, 0, 0, TAU); ctx.fill();
  if (jump) { ctx.translate(0, -jump); if (f.leap) a.face = f.leap.x >= f.x ? 1 : -1; }
  ctx.scale(a.face, 1);
  const by = -bob;
  if (id === 'S') {
    // cape, bottes, robe bleue brodée d'or, pèlerine, capuche, bâton
    ctx.fillStyle = '#16306e'; ctx.beginPath(); ctx.moveTo(-12, by - 40); ctx.quadraticCurveTo(-24 - k * 3, by - 14, -19 + Math.sin(t * 3) * 2, by - 4); ctx.lineTo(8, by - 6); ctx.closePath(); ctx.fill();
    boots(0, 0, k, '#3a2a1c');
    robe(0, by - 40, 34, 36, '#3d6fe0', '#1c3a8a', '#f0c040');
    ctx.fillStyle = '#f0c040'; for (const [rx, ry] of [[-6, -24], [5, -16], [-3, -10], [8, -28]]) { ctx.beginPath(); ctx.arc(rx, by + ry, 1.5, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#5a86ec'; ctx.beginPath(); ctx.ellipse(0, by - 40, 17, 7, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 1.6; ctx.stroke();
    hood(1, by - 52, 26, 24, '#4c7de8', '#1c3a8a', '#f0c040');
    const raise = brush ? 1 : 0, sx = 12, sy = by - 34 - raise * 14;
    ctx.strokeStyle = '#7a5130'; ctx.lineWidth = 3.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx - 2, sy + 34); ctx.lineTo(sx + 4, sy - 16); ctx.stroke();
    ctx.globalAlpha = 0.55 + Math.sin(t * 4) * 0.25 + raise * 0.3; ctx.drawImage(R8.spr.glowCyan, sx + 4 - 16, sy - 20 - 16, 32, 32); ctx.globalAlpha = 1;
    ctx.fillStyle = '#bff3ff'; ctx.beginPath(); ctx.moveTo(sx + 4, sy - 26); ctx.lineTo(sx + 8, sy - 19); ctx.lineTo(sx + 4, sy - 13); ctx.lineTo(sx, sy - 19); ctx.closePath(); ctx.fill();
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(sx, sy + 2, 3.4, 0, TAU); ctx.fill();
  }
  if (id === 'P') {
    ctx.fillStyle = '#2c5e32'; ctx.beginPath(); ctx.moveTo(-10, by - 40); ctx.quadraticCurveTo(-20, by - 14, -16 + Math.sin(t * 2.6) * 2, by - 4); ctx.lineTo(8, by - 6); ctx.closePath(); ctx.fill();
    boots(0, 0, 0, '#4a3220');
    robe(0, by - 40, 30, 32, '#8a5a34', '#55361e', null);
    ctx.strokeStyle = '#d9b48c'; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, by - 36); ctx.lineTo(-10, by - 12); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#3f8f4a'; ctx.beginPath(); ctx.ellipse(0, by - 40, 16, 6.5, 0, 0, TAU); ctx.fill();
    hood(1, by - 52, 25, 23, '#4fa65a', '#24572b', null);
    if (f.leap) { // la dague en avant
      ctx.strokeStyle = '#d8dde8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(14, by - 30); ctx.lineTo(30, by - 40); ctx.stroke();
      ctx.fillStyle = '#6b4424'; ctx.fillRect(10, by - 31, 6, 4);
    }
    // l'arc : il tend la corde, puis lâche (libéré : il lâche à chaque salve)
    const cyc = (t * 0.8) % 1, pull = free ? (f.shoot > 0 ? 0 : 1 - Math.max(0, f.cd) / s.cfg.volleyCd) : cyc < 0.8 ? cyc / 0.8 : 0, bx = 16, byy = by - 30;
    ctx.strokeStyle = '#6b4424'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx - 8, byy, 18, -1.1, 1.1); ctx.stroke();
    ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 8 + Math.cos(-1.1) * 18, byy + Math.sin(-1.1) * 18); ctx.lineTo(bx - 8 - pull * 10, byy); ctx.lineTo(bx - 8 + Math.cos(1.1) * 18, byy + Math.sin(1.1) * 18); ctx.stroke();
    if (pull > 0.05) { ctx.strokeStyle = '#7a5130'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx - 8 - pull * 10, byy); ctx.lineTo(bx + 14, byy); ctx.stroke(); }
    ctx.fillStyle = '#7a4a2a'; ctx.fillRect(bx - 12, byy - 4, 6, 8);
  }
  if (id === 'A') {
    boots(0, 0, 0, '#3a2a20');
    robe(0, by - 40, 32, 34, '#7b4bc4', '#3f2270', null);
    ctx.fillStyle = '#8a5a33'; ctx.beginPath(); ctx.moveTo(-9, by - 34); ctx.lineTo(9, by - 34); ctx.lineTo(12, by - 6); ctx.lineTo(-12, by - 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#4a2e18'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, by - 40); ctx.lineTo(10, by - 20); ctx.stroke();
    for (const [i, c] of [[0, '#7ef0a0'], [1, '#ffd23f'], [2, '#ff6a7a']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(-8 + i * 7, by - 37 + i * 6, 2.4, 0, TAU); ctx.fill(); }
    hood(1, by - 52, 26, 24, '#9566dc', '#4a2a85', null);
    ctx.fillStyle = '#c9a15a'; for (const gx of [-3, 7]) { ctx.beginPath(); ctx.arc(gx, by - 60, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#bfefff'; ctx.beginPath(); ctx.arc(gx, by - 60, 2.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#c9a15a'; }
    // la fiole qui bouillonne
    const sh = Math.sin(t * (free ? 14 : 9)) * 2, fx = 15, fy = by - 30 + sh - (f.shoot > 0 ? 14 * f.shoot / 0.35 : 0);
    ctx.fillStyle = 'rgba(126,240,160,.85)'; ctx.beginPath(); ctx.arc(fx, fy, 5.5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8f5ff'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = '#c9a15a'; ctx.fillRect(fx - 1.6, fy - 9, 3.2, 4);
    for (let i = 0; i < 2; i++) { const p = (t * 1.3 + i * 0.5) % 1; ctx.globalAlpha = 1 - p; ctx.fillStyle = '#b8ffd0'; ctx.beginPath(); ctx.arc(fx + Math.sin(p * 9 + i) * 2, fy - 10 - p * 14, 1.8, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  if (id === 'B') {
    ctx.fillStyle = '#6e1830'; ctx.beginPath(); ctx.moveTo(-11, by - 40); ctx.quadraticCurveTo(-19, by - 22, -15 + Math.sin(t * 2.4) * 2, by - 12); ctx.lineTo(8, by - 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9a6a3a'; ctx.beginPath(); ctx.ellipse(-12, by - 30, 9, 11, -0.4, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a2e18'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, by - 38); ctx.lineTo(4, by - 54); ctx.stroke();
    boots(0, 0, 0, '#3a2418');
    robe(0, by - 40, 30, 32, '#c8283c', '#7a1424', '#f0c040');
    ctx.fillStyle = '#8a5a33'; ctx.fillRect(-7, by - 38, 14, 18); ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-3, by - 34 + i * 5); ctx.lineTo(3, by - 32 + i * 5); ctx.stroke(); }
    ctx.fillStyle = '#f4f0e8'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 4, by - 41, 3.4, 0, TAU); ctx.fill(); }
    // tête, cheveux, chapeau violet à plume
    ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.ellipse(0, by - 50, 11, 10, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(2, by - 50, 8.5, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a1d14'; for (const ex of [0, 5]) { ctx.beginPath(); ctx.arc(ex, by - 52, 1.3, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = '#8a4a3a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(3, by - 48, 2.6, 0.2, 2.6); ctx.stroke();
    ctx.fillStyle = '#6a3aa8'; ctx.beginPath(); ctx.ellipse(1, by - 59, 15, 4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(1, by - 63, 8, 6, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(1, by - 59, 9, 2, 0, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = '#f7f2e6'; ctx.beginPath(); ctx.moveTo(-4, by - 63); ctx.quadraticCurveTo(-18, by - 80 + Math.sin(t * 3) * 2, -22, by - 68); ctx.quadraticCurveTo(-12, by - 70, -4, by - 63); ctx.fill();
    // le tambourin qui tremble
    const sh = Math.sin(t * (free ? 16 : 7)) * (free ? 3 : 1.5) * (f.shoot > 0 ? 2 : 1), tx = 15, ty = by - 30 + sh - (f.shoot > 0 ? 8 : 0);
    ctx.fillStyle = '#e8d8b0'; ctx.beginPath(); ctx.arc(tx, ty, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.fillStyle = '#f0c040'; for (let i = 0; i < 4; i++) { const an = i / 4 * TAU + t; ctx.beginPath(); ctx.arc(tx + Math.cos(an) * 7, ty + Math.sin(an) * 7, 1.6, 0, TAU); ctx.fill(); }
  }
  if (hit) { ctx.globalAlpha = hit * 0.55; ctx.fillStyle = '#ff2a3a'; ctx.beginPath(); ctx.ellipse(0, -34, 20, 32, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  if (f.shield > 0 && !f.free && id !== 'S') {
    ctx.scale(a.face, 1);
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + Math.PI / 6; ctx.lineTo(Math.cos(an) * 30, -34 + Math.sin(an) * 40); } ctx.closePath();
    ctx.fillStyle = 'rgba(160,235,255,.14)'; ctx.fill(); ctx.strokeStyle = `rgba(190,245,255,${0.6 + Math.sin(t * 3) * 0.2})`; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, -60); ctx.lineTo(-22, -44); ctx.stroke();
  }
  ctx.restore();
  // le Barde libéré : deux notes qui tournent autour de lui
  if (id === 'B' && free) for (let i = 0; i < 2; i++) { const an = t * 2 + i * Math.PI; note(x + Math.cos(an) * 26, y - 40 + Math.sin(an) * 8, '#ffe58a', 0.9); }
}
function runeCircle(x, y, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.38);
  ctx.strokeStyle = 'rgba(240,192,64,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 42, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.stroke();
  ctx.rotate(t * 0.8); ctx.fillStyle = 'rgba(255,229,138,.9)';
  for (let i = 0; i < 8; i++) { ctx.rotate(TAU / 8); ctx.fillRect(36, -2, 6, 4); }
  ctx.restore();
}

// ----- le cœur de l'armure -----
function heartPath(x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.95);
  ctx.bezierCurveTo(x - s * 1.25, y + s * 0.15, x - s * 0.95, y - s * 0.95, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.95, y - s * 0.95, x + s * 1.25, y + s * 0.15, x, y + s * 0.95);
  ctx.closePath();
}
function drawHeart(t, dt) {
  const bare = s.heart.bare, ty = bare ? G.HEART.y : -8, won = s.over === 'win';
  R8.heartY += (ty - R8.heartY) * Math.min(1, dt * 1.6);
  const x = 450, y = R8.heartY, beat = won ? 1 : 1 + Math.max(0, Math.sin(t * (bare ? 9 : 4.5))) ** 6 * 0.12, S = (bare ? 48 : 44) * beat;
  // les veines rouges qui partent du cœur
  ctx.lineCap = 'round';
  if (!bare) {
    const rn = seeded(9), glow = 0.25 + Math.max(0, Math.sin(t * 4.5)) ** 3 * 0.45;
    for (let i = 0; i < 7; i++) {
      let a0 = Math.PI * (0.08 + i / 6 * 0.84), px = x + Math.cos(a0) * 40, py = y + Math.sin(a0) * 30;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let k = 0; k < 5; k++) { a0 += (rn() - .5) * 0.6; px += Math.cos(a0) * 22; py += Math.sin(a0) * 16; ctx.lineTo(px, py); }
      ctx.strokeStyle = '#2a0810'; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = `rgba(255,77,94,${glow})`; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  ctx.globalAlpha = 0.55 + (beat - 1) * 3; ctx.drawImage(R8.spr.glowRed, x - S * 2.6, y - S * 2.6, S * 5.2, S * 5.2); ctx.globalAlpha = 1;
  heartPath(x, y, S);
  const g = ctx.createRadialGradient(x - S * .3, y - S * .3, S * .1, x, y, S * 1.2); g.addColorStop(0, '#ffb0ba'); g.addColorStop(0.35, '#e8283e'); g.addColorStop(1, '#5e0b18');
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#3a0610'; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,210,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - S * .3, y - S * .2); ctx.lineTo(x - S * .05, y + S * .3); ctx.lineTo(x + S * .25, y + S * .05); ctx.stroke();
  // le cerclage de fer (il saute quand le cœur est à nu)
  if (!bare) {
    ctx.strokeStyle = '#4a4f5c'; ctx.lineWidth = 7;
    for (const off of [-0.45, 0.2]) { ctx.beginPath(); ctx.moveTo(x - S * 1.15, y + S * off); ctx.quadraticCurveTo(x, y + S * (off + 0.35), x + S * 1.15, y + S * off); ctx.stroke(); }
    ctx.strokeStyle = '#8a909e'; ctx.lineWidth = 2;
    for (const off of [-0.45, 0.2]) { ctx.beginPath(); ctx.moveTo(x - S * 1.15, y + S * off - 2); ctx.quadraticCurveTo(x, y + S * (off + 0.35) - 2, x + S * 1.15, y + S * off - 2); ctx.stroke(); }
    ctx.fillStyle = '#c8ccd6'; for (const rx of [-0.8, -0.3, 0.3, 0.8]) for (const off of [-0.45, 0.2]) { ctx.beginPath(); ctx.arc(x + S * rx, y + S * (off + 0.35 * (1 - rx * rx)) , 2.2, 0, TAU); ctx.fill(); }
  } else if (s.over === 'win') {
    // enfermé dans la grande rune de cristal
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#bff3ff'; ctx.beginPath(); ctx.arc(x, y, 92, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;
    const rn = seeded(31); for (let i = 0; i < 9; i++) { const a0 = i / 9 * TAU, a1 = a0 + 0.7 + rn() * 0.5; ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * 92, y + Math.sin(a0) * 92); ctx.lineTo(x + Math.cos(a0 + 0.3) * 40, y + Math.sin(a0 + 0.3) * 40); ctx.lineTo(x + Math.cos(a1) * 92, y + Math.sin(a1) * 92); ctx.stroke(); }
    ctx.strokeStyle = '#6fe3ff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 92, 0, TAU); ctx.stroke();
  } else {
    ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(111,227,255,.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 105, t * 0.5, t * 0.5 + TAU); ctx.stroke(); ctx.setLineDash([]);
  }
}

// ----- l'arène (dessinée une fois) -----
function makeBg() {
  const c = mk(cv.width, cv.height), g = c.getContext('2d'), { k, ox, oy } = view(), rn = seeded(4242);
  const x0 = -Math.ceil(ox / k) - 70, y0 = -Math.ceil(oy / k) - 70, x1 = G.W - x0, y1 = G.H - y0;
  g.setTransform(k, 0, 0, k, ox, oy);
  g.fillStyle = '#151b2e'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  // les dalles (elles continuent hors de la place quand l'écran est plus large)
  for (let row = 0, y = y0; y < y1; row++) {
    const h = 54 + Math.floor(rn() * 20);
    for (let x = x0 - (row % 2) * 40; x < x1;) {
      const w = 60 + Math.floor(rn() * 46), v = rn();
      const base = [`rgb(${44 + v * 14},${52 + v * 14},${74 + v * 16})`, `rgb(${36 + v * 10},${43 + v * 10},${62 + v * 12})`, `rgb(${26 + v * 8},${31 + v * 8},${46 + v * 10})`];
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, base[0]); gr.addColorStop(0.6, base[1]); gr.addColorStop(1, base[2]);
      g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(x + 2, y + 2, w - 4, h - 4, 6) : g.rect(x + 2, y + 2, w - 4, h - 4); g.fill();
      g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x + 4, y + 3, w - 8, 3);
      if (rn() < 0.28) { g.strokeStyle = 'rgba(8,10,18,.55)'; g.lineWidth = 1.4; let cx = x + rn() * w, cy = y + 4; g.beginPath(); g.moveTo(cx, cy); for (let i = 0; i < 4; i++) { cx += (rn() - .5) * 24; cy += h / 5; g.lineTo(cx, cy); } g.stroke(); }
      if (rn() < 0.18) { g.fillStyle = 'rgba(70,110,60,.45)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + (rn() < .5 ? 4 : w - 4) + (rn() - .5) * 8, y + rn() * h, 2 + rn() * 4, 0, TAU); g.fill(); } }
      x += w;
    }
    y += h;
  }
  // le cercle de runes, au milieu, sous les amis
  g.save(); g.translate(450, 445); g.scale(1, 0.62);
  g.strokeStyle = 'rgba(240,192,64,.22)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 118, 0, TAU); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 100, 0, TAU); g.stroke();
  g.fillStyle = 'rgba(240,192,64,.22)'; for (let i = 0; i < 16; i++) { g.rotate(TAU / 16); g.fillRect(103, -3, 12, 6); }
  g.restore();
  // les tas de gravats sur les bords, d'où sortent les soldats
  const pile = (px, py) => { for (let i = 0; i < 7; i++) { const w = 14 + rn() * 22; paintStone(g, px + (rn() - .5) * 60, py + (rn() - .5) * 34, w, w * 0.7, Math.floor(rn() * 999), ['#5a6070', '#3e4352', '#272b36', '#14171f'], { cracks: 0 }); } };
  for (const [px, py] of [[90, 30], [300, 18], [610, 22], [820, 40], [22, 300], [18, 620], [880, 280], [884, 640], [140, 885], [450, 892], [760, 884]]) pile(px, py);
  // les bords dans l'ombre
  const vg = g.createRadialGradient(450, 470, 200, 450, 470, 680); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.62)');
  g.fillStyle = vg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  // plein écran : hors de la place, c'est l'ombre ; une bordure de pierre marque le bord de la place
  if (ox > 1 || oy > 1) {
    g.fillStyle = 'rgba(3,5,12,.6)'; g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.rect(0, 0, G.W, G.H); g.fill('evenodd');
    const pal = ['#6a7184', '#4a5063', '#2e3342', '#151821'], curb = (horiz, at) => { for (let i = -1, n = 0; i < G.W + 40; i += 46, n++) { const w = 42 + (n % 3) * 3; horiz ? paintStone(g, i + 20, at, w, 18, 700 + n * 13 + at, pal, { cracks: n % 2 }) : paintStone(g, at, i + 20, 18, w, 900 + n * 17 + at, pal, { cracks: n % 2 }); } };
    if (ox > 1) { curb(false, -9); curb(false, G.W + 9); }
    if (oy > 1) { curb(true, -9); curb(true, G.H + 9); }
  }
  return c;
}
function makeParchment() {
  const c = mk(cv.width, cv.height), g = c.getContext('2d'), rn = seeded(77);
  g.fillStyle = '#e9dcb8'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${120 + rn() * 60},${90 + rn() * 50},${50 + rn() * 30},${0.05 + rn() * 0.08})`; g.fillRect(rn() * c.width, rn() * c.height, 1 + rn() * 3, 1 + rn() * 12); }
  const vg = g.createRadialGradient(c.width / 2, c.height / 2, c.width * .3, c.width / 2, c.height / 2, c.width * .75); vg.addColorStop(0, 'rgba(90,60,20,0)'); vg.addColorStop(1, 'rgba(90,60,20,.5)');
  g.fillStyle = vg; g.fillRect(0, 0, c.width, c.height);
  return c;
}
function wallPattern() {
  const sc = R8.sc, c = mk(48 * sc, 32 * sc), g = c.getContext('2d'); g.scale(sc, sc);
  g.fillStyle = '#5c5444'; g.fillRect(0, 0, 48, 32);
  paintStone(g, 12, 8, 22, 14, 3, ['#8e8470', '#6d6250', '#4a4234', '#2a251c'], { cracks: 0 });
  paintStone(g, 36, 8, 22, 14, 9, ['#958a74', '#73685a', '#4a4234', '#2a251c'], { cracks: 0, moss: true });
  paintStone(g, 0, 24, 22, 14, 17, ['#8e8470', '#6d6250', '#4a4234', '#2a251c'], { cracks: 0 });
  paintStone(g, 24, 24, 22, 14, 21, ['#958a74', '#73685a', '#4a4234', '#2a251c'], { cracks: 0 });
  paintStone(g, 48, 24, 22, 14, 29, ['#8e8470', '#6d6250', '#4a4234', '#2a251c'], { cracks: 0 });
  const p = ctx.createPattern(c, 'repeat'); p.setTransform && p.setTransform(new DOMMatrix().scale(1 / sc));
  return p;
}
function ensureSprites() {
  const sc = Math.min(3, Math.max(1, view().k));
  if (R8.sc === sc && R8.spr.cogneur) return;
  R8.sc = sc;
  for (const k in GOLEM) R8.spr[k] = golemSprites(k, sc);
  R8.spr.glowRed = glowSprite(sc, 'rgba(255,70,80,A)'); R8.spr.glowCyan = glowSprite(sc, 'rgba(140,235,255,A)'); R8.spr.glowGold = glowSprite(sc, 'rgba(255,215,90,A)'); R8.spr.glowFire = glowSprite(sc, 'rgba(255,120,30,A)'); R8.spr.flame = flameSprite(sc * 2); R8.spr.glowPink = glowSprite(sc, 'rgba(255,120,220,A)');
  R8.spr.wall = wallPattern();
  R8.spr.parch = makeParchment();
}

// ----- particules (cailloux, poussière, étincelles) -----
function burst(x, y, n, o) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU), v = rnd(o.v0 ?? 60, o.v1 ?? 200);
    R8.parts.push({ x, y, z: o.z ?? 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, vz: rnd(o.vz0 ?? 80, o.vz1 ?? 260), life: rnd(o.l0 ?? 0.5, o.l1 ?? 0.9), max: 1, k: o.k, col: o.col ?? '#9aa3b5', size: rnd(o.s0 ?? 3, o.s1 ?? 6), rot: rnd(0, TAU), vr: rnd(-8, 8), g: o.g ?? 700 });
    const p = R8.parts[R8.parts.length - 1]; p.max = p.life;
  }
}
function dust(x, y, size) { R8.parts.push({ x, y, z: 0, vx: rnd(-10, 10), vy: rnd(-4, 4), vz: 0, life: 0.45, max: 0.45, k: 'puff', size, g: 0 }); }
function stepParts(dt) {
  for (const p of R8.parts) {
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.g) { p.vz -= p.g * dt; p.z += p.vz * dt; if (p.z < 0) { p.z = 0; p.vz *= -0.35; p.vx *= 0.6; p.vy *= 0.6; } }
    p.rot += (p.vr || 0) * dt;
  }
  R8.parts = R8.parts.filter(p => p.life > 0);
  if (R8.parts.length > 700) R8.parts.splice(0, R8.parts.length - 700);
}
function drawParts(front) {
  for (const p of R8.parts) {
    const a = Math.max(0, Math.min(1, p.life / p.max * 1.6));
    if (p.k === 'puff' && !front) { ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#c9bfa8'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * (1.6 - p.life / p.max), p.size * 0.55 * (1.6 - p.life / p.max), 0, 0, TAU); ctx.fill(); }
    if (p.k === 'rock' && front) { ctx.globalAlpha = a; ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1; ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8); ctx.restore(); }
    if (p.k === 'spark' && front) { ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y - p.z, p.size * a, 0, TAU); ctx.fill(); }
    if (p.k === 'note' && front) { ctx.globalAlpha = a * 0.9; note(p.x, p.y, p.col, 0.8); }
    if (p.k === 'shard' && front) { ctx.globalAlpha = a; ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * .5, 0); ctx.lineTo(0, p.size); ctx.lineTo(-p.size * .5, 0); ctx.fill(); ctx.restore(); }
  }
  ctx.globalAlpha = 1;
}

// ----- suivre chaque soldat d'une image à l'autre (marche, face, chute) -----
function trackUnits(dt) {
  const seen = new Set();
  for (const u of s.soldiers) {
    seen.add(u.id);
    let a = R8.anim.get(u.id);
    if (!a) { a = { x: u.x, y: u.y, phase: Math.random() * TAU, face: u.x < 450 ? 1 : -1, spd: 0, rot: 0, age: 0, flying: false, mx: 1, my: 0 }; R8.anim.set(u.id, a); if (u.y > 20 && u.y < 880 && u.x > 20 && u.x < 880) burst(u.x, u.y + FOOT(u.type), 8, { k: 'rock', col: '#5a6070', v0: 30, v1: 110 }); }
    const dx = u.x - a.x, dy = u.y - a.y, d = Math.hypot(dx, dy);
    a.age += dt;
    a.spd = dt > 0 ? d / dt : 0;
    a.flying = Math.hypot(u.vx || 0, u.vy || 0) > s.cfg.flyMin;
    if (a.flying) a.rot += dt * 9 * Math.sign(u.vx || 1); else a.rot *= Math.max(0, 1 - dt * 10);
    if (!a.flying && d > 0.2 && Math.abs(dx) > 0.05) a.face = dx > 0 ? 1 : -1;
    const P = GOLEM[u.type], before = Math.cos(a.phase);
    if (!a.flying && u.daze <= 0) a.phase += d / (P.lw * 1.25 + 4) * 1.7;
    const after = Math.cos(a.phase);
    if (d > 0.05 && !a.flying) { a.mx += (dx / d - a.mx) * 0.2; a.my += (dy / d - a.my) * 0.2; }
    if (before * after < 0 && a.spd > 8 && (u.type === 'brute' || u.type === 'costaud' || u.type === 'cogneur')) {
      dust(u.x + (Math.sin(a.phase) > 0 ? 1 : -1) * P.bw * 0.25 * a.face, u.y + FOOT(u.type), P.bw * 0.22);
      if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.04);
    }
    a.x = u.x; a.y = u.y; a.type = u.type;
  }
  for (const [id, a] of R8.anim) if (!seen.has(id)) {
    // il s'effondre en tas de cailloux (et son éclat s'éteint)
    const P = GOLEM[a.type];
    const F = FOOT(a.type);
    burst(a.x, a.y + F, 10 + Math.round(P.bw / 6), { k: 'rock', col: P.pal[1], s0: P.bw * 0.12, s1: P.bw * 0.24, z: F });
    burst(a.x, a.y + F, 6, { k: 'shard', col: '#ff6a7a', s0: 3, s1: 5, z: F + 6, v0: 80, v1: 220 });
    dust(a.x, a.y + F, P.bw * 0.6);
    R8.anim.delete(id);
  }
  // le Sage
  const sg = s.sage, A = R8.sage, dx = sg.x - A.x, d = Math.hypot(dx, sg.y - A.y);
  A.spd = dt > 0 ? d / dt : 0; if (d > 0.3 && Math.abs(dx) > 0.1) A.face = dx > 0 ? 1 : -1; else if (!d && sg.aim) A.face = sg.aim[0] >= 0 ? 1 : -1;
  A.phase += d / 14; A.x = sg.x; A.y = sg.y;
  // les murs qui disparaissent s'écroulent
  for (const w of R8.wallsPrev) if (!s.walls.includes(w)) for (let i = 0; i < w.pts.length; i += 3) burst(w.pts[i].x, w.pts[i].y, 2, { k: 'rock', col: '#6d6250', s0: 4, s1: 8, z: 10, v0: 20, v1: 80 });
  R8.wallsPrev = [...s.walls];
}
// des effets neufs (venant des règles) : on lance leurs étincelles une fois
function newFx() {
  for (const e of s.fx) {
    if (e._seen) continue; e._seen = true;
    if (e.k === 'beam') { const n = Math.round(Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y) / 18); for (let i = 0; i <= n; i++) { const tt = i / n; burst(e.a.x + (e.b.x - e.a.x) * tt, e.a.y + (e.b.y - e.a.y) * tt, 1, { k: 'spark', col: i % 2 ? '#fff6c9' : '#ffd23f', v0: 20, v1: 90, vz0: 40, vz1: 160, s0: 2, s1: 3.5, g: 120 }); } }
    if (e.k === 'bit') { R8.parts.push({ x: e.x, y: e.y + 16, z: 16, vx: e.vx * 0.6, vy: e.vy * 0.4, vz: rnd(60, 200), life: 0.7, max: 0.7, k: 'rock', col: e.col === '#ffe58a' ? '#c9b98a' : '#8a909e', size: rnd(3, 6), rot: rnd(0, TAU), vr: rnd(-8, 8), g: 700 }); }
    if (e.k === 'burst') burst(e.x, e.y + 10, 14, { k: 'shard', col: '#ffe0e4', s0: 3, s1: 7, z: 10, v0: 120, v1: 320 });
    if (e.k === 'ring') burst(e.x, e.y, 26, { k: 'spark', col: '#d8b4ff', v0: 200, v1: 420, vz0: 10, vz1: 60, s0: 2, s1: 4, g: 60 });
    if (e.k === 'vee') { const mx = (e.a.x + e.b.x) / 2, my = (e.a.y + e.b.y) / 2; for (let i = 0; i < 16; i++) { const tt = Math.random(), x = e.tip.x + (mx - e.tip.x) * tt + (Math.random() - .5) * 60, y = e.tip.y + (my - e.tip.y) * tt + (Math.random() - .5) * 60; R8.parts.push({ x, y, z: 4, vx: e.dir[0] * rnd(300, 520), vy: e.dir[1] * rnd(300, 520), vz: 30, life: 0.5, max: 0.5, k: 'spark', col: '#fff1b8', size: 2.5, g: 40 }); } }
    if (e.k === 'splash') burst(e.x, e.y, 14, { k: 'spark', col: '#c9a2ff', v0: 60, v1: 200, s0: 2, s1: 4 });
    if (e.k === 'trap') burst(e.x, e.y, 22, { k: 'spark', col: '#ffd65a', v0: 120, v1: 300, vz0: 60, vz1: 200, s0: 2, s1: 4, g: 400 });
    if (e.k === 'shieldbreak') burst(e.x, e.y - 30, 14, { k: 'shard', col: '#bff3ff', s0: 3, s1: 6, z: 10, v0: 90, v1: 220 });
    if (e.k === 'chain') for (const p of e.pts.slice(1)) burst(p.x, p.y, 4, { k: 'spark', col: '#e9f6ff', v0: 40, v1: 140, s0: 1.5, s1: 3, g: 200 });
    if (e.k === 'flaque') burst(e.x, e.y, 18, { k: 'spark', col: POTCOL[e.kind], v0: 80, v1: 240, vz0: 120, vz1: 260, s0: 2.5, s1: 4.5, g: 700 });
    if (e.k === 'slash') burst(e.x, e.y, 8, { k: 'spark', col: '#ffffff', v0: 60, v1: 180, s0: 1.5, s1: 3, g: 300 });
    if (e.k === 'free') burst(e.x, e.y - 30, 24, { k: 'spark', col: '#ffd23f', v0: 60, v1: 260, s0: 2, s1: 4, g: 200 });
    if (e.k === 'fireball') { if (e.stone) { burst(e.x, e.y + 10, 16, { k: 'rock', col: '#8a7a60', s0: 4, s1: 9, z: 12, v0: 140, v1: 360 }); burst(e.x, e.y, 14, { k: 'spark', col: '#ffd23f', v0: 120, v1: 320, s0: 2, s1: 4 }); } else burst(e.x, e.y, 26, { k: 'spark', col: Math.random() < 0.5 ? '#ff7a1a' : '#ffd23f', v0: 120, v1: 360, vz0: 60, vz1: 220, s0: 2.5, s1: 5, g: 300 }); }
    if (e.k === 'sky') burst(e.x, e.y, 12, { k: 'spark', col: '#e9f6ff', v0: 60, v1: 220, vz0: 60, vz1: 200, s0: 2, s1: 3.5, g: 400 });
    if (e.k === 'pulse') for (let i = 0; i < 40; i++) { const an = i / 40 * TAU; R8.parts.push({ x: 450 + Math.cos(an) * 60, y: 445 + Math.sin(an) * 45, z: 6, vx: Math.cos(an) * 420, vy: Math.sin(an) * 320, vz: 20, life: 0.5, max: 0.5, k: 'spark', col: '#ffe58a', size: 3, g: 40 }); }
    if (e.k === 'tornado') burst(e.x, e.y, 20, { k: 'spark', col: '#d8b4ff', v0: 100, v1: 260, s0: 2, s1: 4, g: 60 });
    if (e.k === 'strike') burst(e.x, e.y - 20, 40, { k: 'spark', col: Math.random() < 0.5 ? '#ffd23f' : '#ffffff', v0: 160, v1: 420, vz0: 100, vz1: 300, s0: 2.5, s1: 5, g: 400 });
    if (e.k === 'bonk') { dust(e.x, e.y + 14, 14); burst(e.x, e.y - 10, 4, { k: 'spark', col: '#ffe58a', v0: 60, v1: 140, s0: 2, s1: 3, g: 200 }); }
    if (e.k === 'pop2') burst(e.x, e.y + 10, 10, { k: 'spark', col: '#ffd23f', v0: 80, v1: 220, s0: 2, s1: 3.5, g: 200 });
    if (e.k === 'frenzy') burst(s.sage.x, s.sage.y - 20, 40, { k: 'spark', col: Math.random() < 0.5 ? '#c77dff' : '#1a1209', v0: 100, v1: 340, vz0: 80, vz1: 260, s0: 3, s1: 6, g: 300 });
  }
}

// ----- le grand dessin -----
function render(dt = 0) {
  if (!s) return;
  ensureSprites();
  if (!bg) { bg = makeBg(); R8.spr.parch = makeParchment(); }
  const gdt = dt * (brush && !s.over && !paused ? s.cfg.slow : 1) * (paused || s.choice ? 0 : 1);
  R8.t += gdt;
  const t = R8.t;
  trackUnits(gdt); newFx(); stepParts(gdt);
  const { k, ox, oy } = view(), dpr = cv.width / cv.getBoundingClientRect().width || 1, cw = cv.width / dpr, ch = cv.height / dpr;
  const popSize = Math.max(22, 13 * dpr / k);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
  const sh = s.shake > 0 && !reduce ? s.shake * 30 : 0;
  ctx.setTransform(k, 0, 0, k, ox + (Math.random() - .5) * sh * k, oy + (Math.random() - .5) * sh * k);
  // la poussière qui flotte
  if (R8.motes.length < 36) R8.motes.push({ x: rnd(0, 900), y: rnd(0, 900), v: rnd(4, 12), p: rnd(0, TAU) });
  for (const m of R8.motes) { m.y -= m.v * gdt; m.x += Math.sin(t * 0.6 + m.p) * 4 * gdt; if (m.y < -10) { m.y = 910; m.x = rnd(0, 900); } ctx.globalAlpha = 0.18 + Math.sin(t + m.p) * 0.08; ctx.fillStyle = '#ffd9a0'; ctx.beginPath(); ctx.arc(m.x, m.y, 1.4, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  // l'alerte de la grosse vague
  for (const e of s.fx) if (e.k === 'side') {
    const a = Math.abs(Math.sin(e.life * 6)) * 0.5, g = e.side === 0 ? ctx.createLinearGradient(0, 0, 0, 90) : e.side === 2 ? ctx.createLinearGradient(0, 900, 0, 810) : e.side === 3 ? ctx.createLinearGradient(0, 0, 90, 0) : ctx.createLinearGradient(900, 0, 810, 0);
    g.addColorStop(0, `rgba(255,60,80,${a})`); g.addColorStop(1, 'rgba(255,60,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 900, 900);
  }
  // la colère du cœur : les bords de la place rougissent et battent
  if (s.rage > 0) { const b = Math.min(1, 0.25 + s.rage * 0.12) * (0.6 + 0.4 * Math.max(0, Math.sin(t * 4.5)) ** 4); for (const side of [0, 1, 2, 3]) { const g = side === 0 ? ctx.createLinearGradient(0, 0, 0, 120) : side === 2 ? ctx.createLinearGradient(0, 900, 0, 780) : side === 3 ? ctx.createLinearGradient(0, 0, 120, 0) : ctx.createLinearGradient(900, 0, 780, 0); g.addColorStop(0, `rgba(170,20,40,${b * 0.6})`); g.addColorStop(1, 'rgba(170,20,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 900, 900); } }
  if (s.frenzy > 0) { ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 10); ctx.drawImage(R8.spr.glowGold, s.sage.x - 70, s.sage.y - 60, 140, 140); ctx.globalAlpha = 1; }
  // la zone ralentie autour des murs, puis le sol
  for (const w of s.walls) {
    const a = Math.min(1, w.life / 0.5), P = w.pts;
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(111,227,255,.05)'; ctx.lineWidth = 2 * (w.half + s.cfg.wallSlowR); ctx.stroke();
    ctx.setLineDash([3, 22]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = 'rgba(160,240,255,.22)'; ctx.lineWidth = 2 * (w.half + s.cfg.wallSlowR) - 20; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  if (G.lv(s, 'sceau')) drawSeal(t);
  for (const p of s.puddles) drawPuddle(p, t);
  for (const fl of s.firelines) drawFireline(fl, t);
  for (const tr of s.traps) drawTrap(tr, t);
  drawParts(false);
  for (const p of s.shards) {
    const b = Math.sin(p.t * 4) * 3, tw = 0.6 + Math.sin(p.t * 7) * 0.4;
    ctx.globalAlpha = 0.5 * tw; ctx.drawImage(R8.spr.glowCyan, p.x - 16, p.y + b - 16, 32, 32); ctx.globalAlpha = 1;
    ctx.fillStyle = '#6fe3ff'; ctx.beginPath(); ctx.moveTo(p.x, p.y - 9 + b); ctx.lineTo(p.x + 6, p.y + b); ctx.lineTo(p.x, p.y + 9 + b); ctx.lineTo(p.x - 6, p.y + b); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.moveTo(p.x, p.y - 7 + b); ctx.lineTo(p.x + 2.5, p.y - 1 + b); ctx.lineTo(p.x, p.y + b); ctx.closePath(); ctx.fill();
  }
  for (const p of s.pages) drawGrimoirePage(p, t);
  if (s.trail && s.trail.length) drawTrail(t);
  for (const tn of s.tornados || []) drawTornadoGround(tn, t);
  for (const u of s.soldiers) if (u.ball) drawBall(u, t);
  if (!s.heart.bare) drawHeart(t, gdt);
  // tout le monde, du fond vers le devant
  const items = [];
  if (s.sage.tx !== null && !brush) { ctx.strokeStyle = 'rgba(255,210,63,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s.sage.tx, s.sage.ty + 20, 16, 7, 0, 0, TAU); ctx.stroke(); }
  for (const f of s.friends) items.push({ y: f.y + 28, d: () => drawHero(f, t) });
  items.push({ y: s.sage.y + 28, d: () => drawHero({ ...s.sage, id: 'S', flash: 0, free: false }, t) });
  for (const u of s.soldiers) { const a = R8.anim.get(u.id); if (a) items.push({ y: u.y + FOOT(u.type), d: () => drawGolem(u, a, t) }); }
  for (const w of s.walls) { let my = 0; for (const p of w.pts) my = Math.max(my, p.y); items.push({ y: my - 10, d: () => drawWall(w, t) }); }
  items.sort((a, b) => a.y - b.y).forEach(i => i.d());
  if (s.heart.bare) drawHeart(t, gdt);
  for (const tn of s.tornados || []) drawTornado(tn, t);
  if (G.lv(s, 'pages')) drawOrbitPages(t);
  for (const o of s.owls) drawOwl(o, t);
  // les projectiles
  for (const p of s.potions) drawPotion(p);
  for (const n of s.notes) drawPartition(n, t);
  for (const b of s.bolts) {
    if (b.arrow) { const an = Math.atan2(b.vy, b.vx); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(an); ctx.strokeStyle = '#7a5130'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(8, 0); ctx.stroke(); ctx.fillStyle = '#c8ccd6'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(6, -3.5); ctx.lineTo(6, 3.5); ctx.fill(); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(-17, -3, 5, 6); ctx.restore(); continue; }
    ctx.globalAlpha = 0.8; ctx.drawImage(R8.spr.glowCyan, b.x - 15, b.y - 15, 30, 30); ctx.globalAlpha = 1;
    const br = 4.5 + ((b.dmg || 1) - 1) * 1.6, tl = b.pierce !== undefined && G.lv(s, 'percant') ? 0.07 : 0.03;
    ctx.strokeStyle = (b.dmg || 1) > 1 ? 'rgba(255,214,120,.6)' : 'rgba(200,245,255,.5)'; ctx.lineWidth = br; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * tl, b.y - b.vy * tl); ctx.stroke();
    ctx.fillStyle = (b.dmg || 1) > 1 ? '#fff3c4' : '#ffffff'; ctx.beginPath(); ctx.arc(b.x, b.y, br, 0, TAU); ctx.fill();
  }
  for (const p of s.stones) {
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 20, 6, 2.5, 0, 0, TAU); ctx.fill();
    if (p.back) { ctx.globalAlpha = 0.8; ctx.drawImage(R8.spr.glowGold, p.x - 18, p.y - 18, 36, 36); ctx.globalAlpha = 1; }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t * 12); ctx.fillStyle = p.back ? '#ffd23f' : '#b08e64'; ctx.beginPath(); ctx.moveTo(-7, -3); ctx.lineTo(-2, -7); ctx.lineTo(6, -4); ctx.lineTo(7, 4); ctx.lineTo(-3, 7); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  // les effets des runes
  for (const e of s.fx) {
    const a = Math.max(0, e.life / e.max);
    if (e.k === 'beam') {
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(255,200,60,${a * .3})`; ctx.lineWidth = 80; ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      ctx.strokeStyle = `rgba(255,220,110,${a * .7})`; ctx.lineWidth = 30; ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,240,${a})`; ctx.lineWidth = 9; ctx.stroke();
    }
    if (e.k === 'ring') {
      ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1, 0.75);
      const R = e.R * (1.15 - a * .8);
      ctx.strokeStyle = `rgba(199,125,255,${a})`; ctx.lineWidth = 16 * a + 2; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
      ctx.strokeStyle = `rgba(255,235,255,${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
      ctx.rotate(t * 2); ctx.fillStyle = `rgba(230,200,255,${a})`; for (let i = 0; i < 10; i++) { ctx.rotate(TAU / 10); ctx.fillRect(R * 0.7, -3, 10, 6); }
      ctx.restore();
    }
    if (e.k === 'vee') {
      ctx.fillStyle = `rgba(255,241,184,${a * .28})`; ctx.beginPath(); ctx.moveTo(e.tip.x, e.tip.y); ctx.lineTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(255,241,184,${a})`; ctx.lineWidth = 3; ctx.stroke();
      if (e.thunder) { const mx = (e.a.x + e.b.x) / 2, my = (e.a.y + e.b.y) / 2; for (let k = 0; k < 3; k++) zigzag([{ x: e.tip.x, y: e.tip.y }, { x: mx + (k - 1) * (e.b.x - e.a.x) * 0.3, y: my + (k - 1) * (e.b.y - e.a.y) * 0.3 }], `rgba(255,236,120,${a})`, 3, 7); }
    }
    if (e.k === 'chain') { ctx.globalAlpha = a; zigzag(e.pts, e.gold ? '#fff6c9' : '#e9f6ff', 3.5, 12); zigzag(e.pts, e.gold ? 'rgba(255,200,60,.6)' : 'rgba(120,200,255,.6)', 9, 12); ctx.globalAlpha = 1; }
    if (e.k === 'nova') { const R = 30 + (1 - a) * 150; ctx.strokeStyle = `rgba(255,236,150,${a})`; ctx.lineWidth = 6 * a + 1; ctx.beginPath(); ctx.arc(e.x, e.y, R, 0, TAU); ctx.stroke(); }
    if (e.k === 'trap') { ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1, 0.75); const R = e.R * (1.1 - a * 0.3); ctx.strokeStyle = `rgba(255,214,90,${a})`; ctx.lineWidth = 10 * a + 2; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); ctx.restore(); }
    if (e.k === 'seal') { ctx.save(); ctx.translate(450, 445); ctx.scale(1, 0.75); ctx.strokeStyle = `rgba(255,214,90,${a * 0.8})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, G.UP.sceauR[G.lv(s, 'sceau')], 0, TAU); ctx.stroke(); ctx.restore(); }
    if (e.k === 'burst') { ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowCyan, e.x - e.R, e.y - e.R, e.R * 2, e.R * 2); ctx.fillStyle = `rgba(255,255,255,${a * .7})`; ctx.beginPath(); ctx.arc(e.x, e.y, e.R * 0.35 * (1.3 - a), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    if (e.k === 'splash') { ctx.fillStyle = `rgba(155,93,229,${a * .45})`; ctx.beginPath(); ctx.ellipse(e.x, e.y, 75 * (1.2 - a * .4), 50 * (1.2 - a * .4), 0, 0, TAU); ctx.fill(); }
    if (e.k === 'free') { ctx.strokeStyle = `rgba(255,210,63,${a})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(e.x, e.y, 30 + (1 - a) * 140, (30 + (1 - a) * 140) * 0.5, 0, 0, TAU); ctx.stroke(); }
    if (e.k === 'slash') { ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(-0.6 + (1 - a) * 1.8); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 5 * a + 1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 26, -1.1, 1.1); ctx.stroke(); ctx.restore(); }
    if (e.k === 'fireball') { const R = 85 * (1.15 - a * 0.5); ctx.globalAlpha = a; ctx.drawImage(e.stone ? R8.spr.glowGold : R8.spr.glowFire, e.x - R * 1.4, e.y - R * 1.4, R * 2.8, R * 2.8); ctx.fillStyle = e.stone ? `rgba(255,236,170,${a * .6})` : `rgba(255,200,90,${a * .7})`; ctx.beginPath(); ctx.arc(e.x, e.y, R * 0.45 * (1.4 - a), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    if (e.k === 'sky') { ctx.globalAlpha = a; const pts = [{ x: e.x + 30, y: e.y - 420 }, { x: e.x - 20, y: e.y - 300 }, { x: e.x + 25, y: e.y - 170 }, { x: e.x - 10, y: e.y - 70 }, { x: e.x, y: e.y }]; zigzag(pts, '#ffffff', 4, 14); zigzag(pts, 'rgba(140,200,255,.6)', 12, 14); ctx.globalAlpha = 1; }
    if (e.k === 'pulse') { ctx.save(); ctx.translate(450, 445); ctx.scale(1, 0.75); ctx.strokeStyle = `rgba(255,229,138,${a})`; ctx.lineWidth = 14 * a + 2; ctx.beginPath(); ctx.arc(0, 0, e.R * (1.25 - a * 0.6), 0, TAU); ctx.stroke(); ctx.restore(); }
    if (e.k === 'mirror') { ctx.save(); ctx.translate(450, 445); ctx.strokeStyle = `rgba(199,125,255,${a * 0.6})`; ctx.lineWidth = 3; for (let i = 0; i < Math.max(2, e.n + 1); i++) { ctx.rotate(TAU / Math.max(2, e.n + 1)); ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(80 + (1 - a) * 260, 0); ctx.stroke(); } ctx.restore(); }
    if (e.k === 'echo') { ctx.strokeStyle = `rgba(111,227,255,${a * 0.7})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(s.sage.x, s.sage.y, 30 + (1 - a) * 60, 0, TAU); ctx.stroke(); }
    if (e.k === 'strike') { ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowGold, e.x - 120, e.y - 120, 240, 240); ctx.globalAlpha = 1; }
    if (e.k === 'pop2') { const R = e.big ? 75 : 50; ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowGold, e.x - R, e.y - R * 0.72, R * 2, R * 2); ctx.globalAlpha = 1; }
    if (e.k === 'ice') { ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#9fefff'; ctx.beginPath(); e.poly.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
  }
  drawParts(true);
  for (const e of s.fx) if (e.k === 'pop') { const a = Math.max(0, e.life / e.max); ctx.globalAlpha = Math.min(1, a * 2); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(11,16,32,.85)'; ctx.font = `800 ${popSize}px Nunito, sans-serif`; ctx.textAlign = 'center'; const x = Math.max(70, Math.min(830, e.x)), y = Math.max(30, e.y - 30 - (1 - a) * 26); ctx.strokeText(e.t, x, y); ctx.fillStyle = e.col; ctx.fillText(e.t, x, y); ctx.globalAlpha = 1; }
  // le parchemin et l'encre
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (brush) {
    ctx.globalAlpha = 0.62; ctx.drawImage(R8.spr.parch, 0, 0, cv.width, cv.height); ctx.globalAlpha = 1;
    ctx.setTransform(k, 0, 0, k, ox, oy);
    if (stroke && stroke.length > 1) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1a1209';
      for (let i = 1; i < stroke.length; i++) {
        const p0 = stroke[i - 1], p1 = stroke[i], sp = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        ctx.lineWidth = Math.max(6, 17 - sp * 0.35) * (i < 4 ? 0.6 + i * 0.1 : 1);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(26,18,9,.6)'; const p = stroke[0]; ctx.beginPath(); ctx.arc(p.x + 6, p.y - 5, 2.5, 0, TAU); ctx.arc(p.x - 7, p.y + 4, 1.8, 0, TAU); ctx.fill();
    }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  hud(cw, ch);
  hudCards(cw, ch);
}
function drawWall(w, t) {
  const grow = Math.min(1, (w.max - w.life) / 0.2), fade = Math.min(1, w.life / 0.35), P = w.pts, H = 26 * grow;
  ctx.save(); ctx.globalAlpha = fade; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = (dy) => { ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p.x, p.y + dy) : ctx.moveTo(p.x, p.y + dy)); };
  path(4); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 2 * w.half + 8; ctx.stroke();
  // la face du mur (sa hauteur), puis son dessus en pierres
  for (let dy = 0; dy <= H; dy += 3) { path(-dy); ctx.strokeStyle = dy === 0 ? '#2a251c' : '#4a4234'; ctx.lineWidth = 2 * w.half + 2; ctx.stroke(); }
  path(-H); ctx.strokeStyle = '#2a251c'; ctx.lineWidth = 2 * w.half + 5; ctx.stroke();
  path(-H); ctx.strokeStyle = R8.spr.wall; ctx.lineWidth = 2 * w.half; ctx.stroke();
  path(-H); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3; ctx.stroke();
  if (G.lv(s, 'murFeu')) for (let i = 0; i < P.length; i += 2) flame(P[i].x, P[i].y - H + 2, 8, 20 + 8 * Math.sin(t * 11 + i));
  if (G.lv(s, 'epines')) { // des épines des deux côtés
    ctx.fillStyle = '#c8d0b0'; ctx.strokeStyle = '#3a3f2a'; ctx.lineWidth = 1.2;
    for (let i = 1; i < P.length; i += 2) {
      const a0 = P[i - 1], b0 = P[i], L = Math.hypot(b0.x - a0.x, b0.y - a0.y) || 1, nx = -(b0.y - a0.y) / L, ny = (b0.x - a0.x) / L;
      for (const sd of [-1, 1]) { const bx = b0.x + nx * sd * w.half, by = b0.y + ny * sd * w.half - H * 0.5, sl = 11 * grow; ctx.beginPath(); ctx.moveTo(bx - ny * 4, by + nx * 4); ctx.lineTo(bx + nx * sd * sl, by + ny * sd * sl - 3); ctx.lineTo(bx + ny * 4, by - nx * 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    }
  }
  const n = Math.max(2, Math.round(P.length * w.life / w.max)); ctx.beginPath(); P.slice(0, n).forEach((p, i) => i ? ctx.lineTo(p.x, p.y - H - w.half - 6) : ctx.moveTo(p.x, p.y - H - w.half - 6)); ctx.strokeStyle = 'rgba(255,210,63,.9)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

// ===== Les pouvoirs des pages du grimoire =====
function zigzag(pts, col, w, amp) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]; if (!i) { ctx.moveTo(p.x, p.y); continue; }
    const q = pts[i - 1], n = 5;
    for (let k = 1; k <= n; k++) { const tt = k / n, x = q.x + (p.x - q.x) * tt, y = q.y + (p.y - q.y) * tt, j = k < n ? (Math.random() - .5) * amp * 2 : 0; ctx.lineTo(x + j, y + j * 0.6); }
  }
  ctx.stroke();
}
function drawGrimoirePage(p, t) {
  const b = Math.sin(t * 3 + p.x) * 4, x = p.x, y = p.y;
  // la colonne de lumière, qu'on voit de loin
  const g = ctx.createLinearGradient(x, y - 160, x, y); g.addColorStop(0, 'rgba(255,214,90,0)'); g.addColorStop(1, `rgba(255,214,90,${0.45 + Math.sin(t * 4) * 0.1})`);
  ctx.fillStyle = g; ctx.fillRect(x - 16, y - 160, 32, 160);
  ctx.globalAlpha = 0.8; ctx.drawImage(R8.spr.glowGold, x - 36, y - 36 + b - 14, 72, 72); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 10, 16, 5, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(x, y - 14 + b); ctx.rotate(Math.sin(t * 2) * 0.15);
  ctx.fillStyle = '#f6e7b8'; ctx.strokeStyle = '#a8792c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-13, -17, 26, 34, 3) : ctx.rect(-13, -17, 26, 34); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,80,30,.55)'; ctx.lineWidth = 1.2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-8, -9 + i * 6); ctx.lineTo(8, -9 + i * 6); ctx.stroke(); }
  ctx.strokeStyle = '#d9a52f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 11, 4, 0, TAU); ctx.stroke();
  ctx.restore();
  if (Math.random() < 0.15) R8.parts.push({ x: x + rnd(-14, 14), y: y, z: rnd(0, 20), vx: 0, vy: 0, vz: rnd(30, 70), life: 0.8, max: 0.8, k: 'spark', col: '#ffe58a', size: 2, g: -10 });
}
function drawOrbitPages(t) {
  const n = G.UP.pagesN[G.lv(s, 'pages')], R = s.orbitR || G.UP.pagesR[G.lv(s, 'pages')], sg = s.sage;
  ctx.globalAlpha = 0.25; ctx.strokeStyle = '#ffe58a'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.ellipse(sg.x, sg.y, R, R, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  for (let i = 0; i < n; i++) {
    const a = s.orbitA + i * TAU / n, x = sg.x + Math.cos(a) * R, y = sg.y + Math.sin(a) * R;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, y + 14, 9, 3, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(x, y - 6); ctx.rotate(a + Math.PI / 2); ctx.scale(1, 0.75 + 0.25 * Math.sin(t * 9 + i));
    ctx.fillStyle = '#f6e7b8'; ctx.strokeStyle = '#a8792c'; ctx.lineWidth = 1.4; ctx.fillRect(-9, -12, 18, 24); ctx.strokeRect(-9, -12, 18, 24);
    ctx.strokeStyle = 'rgba(120,80,30,.6)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-5, -6 + k * 5); ctx.lineTo(5, -6 + k * 5); ctx.stroke(); }
    ctx.restore();
  }
}
function drawSeal(t) {
  const R = G.UP.sceauR[G.lv(s, 'sceau')];
  ctx.save(); ctx.translate(450, 445); ctx.scale(1, 0.75);
  ctx.fillStyle = 'rgba(255,214,90,.09)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,224,110,.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, R - 12, 0, TAU); ctx.stroke();
  ctx.rotate(t * 0.4); ctx.fillStyle = 'rgba(255,229,138,.7)';
  for (let i = 0; i < 18; i++) { ctx.rotate(TAU / 18); ctx.fillRect(R - 9, -2, 6, 4); }
  ctx.restore();
}
function drawTrap(tr, t) {
  const k = 1 - tr.t / tr.max, R = tr.R * (0.4 + 0.6 * k);
  ctx.save(); ctx.translate(tr.x, tr.y); ctx.scale(1, 0.75); ctx.rotate(t * 3);
  ctx.globalAlpha = 0.3 + 0.6 * k; ctx.strokeStyle = '#ffd65a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < 5; i++) { const an = i * 4 * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(an) * R * 0.8, Math.sin(an) * R * 0.8); } ctx.closePath(); ctx.stroke();
  ctx.restore(); ctx.globalAlpha = 1;
}
function drawFireline(fl, t) {
  const a = Math.min(1, fl.life / 0.5), n = Math.max(3, Math.round(Math.hypot(fl.b.x - fl.a.x, fl.b.y - fl.a.y) / 22));
  if (fl.lava) { ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.strokeStyle = '#3a1208'; ctx.lineWidth = 50; ctx.beginPath(); ctx.moveTo(fl.a.x, fl.a.y + 6); ctx.lineTo(fl.b.x, fl.b.y + 6); ctx.stroke(); ctx.strokeStyle = '#ff4a12'; ctx.lineWidth = 36; ctx.stroke(); ctx.strokeStyle = `rgba(255,214,90,${0.55 + 0.25 * Math.sin(t * 5)})`; ctx.lineWidth = 13; ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.globalAlpha = a * 0.5; ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fl.a.x, fl.a.y); ctx.lineTo(fl.b.x, fl.b.y); ctx.stroke(); ctx.globalAlpha = a;
  for (let i = 0; i <= n; i++) { const tt = i / n, x = fl.a.x + (fl.b.x - fl.a.x) * tt, y = fl.a.y + (fl.b.y - fl.a.y) * tt; flame(x, y + 6, 7, 18 + 8 * Math.sin(t * 12 + i * 1.3)); }
  ctx.globalAlpha = 1;
}
function drawOwl(o, t) {
  const diving = o.mode === 'pique', h = diving ? 10 : 46, flap = Math.sin(t * (diving ? 30 : 14)), dir = o.mode === 'pique' && o.tg ? Math.sign(o.tg.x - o.x0) || 1 : Math.cos(o.a) > 0 ? -1 : 1;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(o.x, o.y + 6, 12, 4, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(o.x, o.y - h); ctx.scale(dir, 1);
  ctx.fillStyle = '#7a5a3a';
  for (const sd of [-1, 1]) { ctx.save(); ctx.scale(sd, 1); ctx.rotate(-0.3 - flap * 0.6); ctx.beginPath(); ctx.ellipse(12, 0, 14, 6, 0.2, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#9a7650'; ctx.beginPath(); ctx.ellipse(0, 2, 10, 13, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e8d8b8'; ctx.beginPath(); ctx.ellipse(0, 6, 6, 7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#efe3c8'; ctx.beginPath(); ctx.arc(-4, -6, 5, 0, TAU); ctx.arc(4, -6, 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffc93c'; ctx.beginPath(); ctx.arc(-4, -6, 3, 0, TAU); ctx.arc(4, -6, 3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a1209'; ctx.beginPath(); ctx.arc(-4, -6, 1.5, 0, TAU); ctx.arc(4, -6, 1.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c98a2a'; ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(2, -2); ctx.lineTo(0, 2); ctx.fill();
  ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(-5, -9); ctx.lineTo(-8, -6); ctx.fill(); ctx.beginPath(); ctx.moveTo(9, -12); ctx.lineTo(5, -9); ctx.lineTo(8, -6); ctx.fill();
  ctx.restore();
}
// la rangée des pouvoirs pris (sous l'encre), et combien de gros avant la prochaine page
function hudCards(cw, ch) {
  const fs = cw < 500 ? 13 : 15, y = 92, ids = Object.keys(s.up).filter(id => s.up[id] > 0);
  let x = 8; const chip = cw < 500 ? 30 : 34;
  const need = s.pageNeed - s.grosKills;
  ctx.font = `800 ${fs - 1}px Nunito, sans-serif`;
  const lab = `📄 encore ${need} gros`, lw = ctx.measureText(lab).width + 16;
  rr(x, y, lw, chip, 8); ctx.fillStyle = 'rgba(15,21,40,.84)'; ctx.fill(); text(lab, x + 8, y + chip / 2 + fs / 2 - 2, fs - 1, '#ffe58a', 'left', 800);
  x += lw + 4;
  let yy = y; const maxX = cw < 700 ? cw * 0.6 : Math.max(cw * 0.35, 260);
  for (const id of ids) {
    if (x + chip > maxX) { x = 8; yy += chip + 4; } // pas de place : on passe à la ligne
    const C = G.CARDS[id], fam = { baton: '#6fe3ff', rune: '#ffd23f', sort: '#c77dff', cadeau: '#7ef0a0', combo: '#ffb000' }[C.fam];
    rr(x, yy, chip, chip, 8); ctx.fillStyle = 'rgba(15,21,40,.84)'; ctx.fill(); ctx.strokeStyle = fam; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `${chip * 0.55}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(C.ic, x + chip / 2, yy + chip * 0.62);
    for (let i = 0; i < s.up[id]; i++) { ctx.fillStyle = fam; ctx.beginPath(); ctx.arc(x + chip / 2 + (i - (s.up[id] - 1) / 2) * 6, yy + chip - 4, 2.2, 0, TAU); ctx.fill(); }
    x += chip + 4;
  }
  ctx.textAlign = 'left';
  R8.hudBottom = yy + chip;
  if (s.frenzy > 0) { yy += chip + 6; const lab2 = `🐙 FRÉNÉSIE ! ${Math.ceil(s.frenzy)}`; ctx.font = `900 ${fs + 3}px Nunito, sans-serif`; const w2 = ctx.measureText(lab2).width + 20; rr(8, yy, w2, chip, 8); ctx.fillStyle = 'rgba(80,30,120,.9)'; ctx.fill(); text(lab2, 18, yy + chip / 2 + fs / 2, fs + 3, '#f0d0ff', 'left', 900); R8.hudBottom = yy + chip; }
  if (s.rage > 0) { yy += chip + 6; const lab3 = s.rage >= 3 ? '💢 FUREUR du cœur' : s.rage === 2 ? '💢 Le cœur est fou de rage' : '💢 Le cœur est en colère'; ctx.font = `800 ${fs}px Nunito, sans-serif`; const w3 = ctx.measureText(lab3).width + 20; rr(8, yy, w3, chip, 8); ctx.fillStyle = 'rgba(110,14,30,.9)'; ctx.fill(); text(lab3, 18, yy + chip / 2 + fs / 2 - 2, fs, '#ffd0d6', 'left', 800); R8.hudBottom = yy + chip; }
}
