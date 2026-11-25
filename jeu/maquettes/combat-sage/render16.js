// ===== Le rendu (version 16) : la grande salle vue de haut, Grosbec dans son armure, ses golems, les amis de dos (deux depuis la version 17 : le Barde et l'Alchimiste) =====
// Les golems et Grosbec sont les modèles du combat du Barde (barde/golems.js, barde/grosbec.js) : chaque image est peinte UNE fois
// (« cuite »), puis recopiée. La salle aussi est peinte une seule fois. Rien n'est redessiné à chaque image : ça ne doit jamais ramer.
const TAU = Math.PI * 2;
const TOP = 132;
// vider une réserve d'images : chaque toile est vidée avant d'être jetée (Safari garde longtemps la mémoire d'une toile jetée)
const vider = M => { for (const v of M.values()) if (v && v.c) v.c.width = v.c.height = 0; M.clear(); };   // la place du mur du fond, au-dessus de la place (en unités du jeu)
const R8 = { anim: new Map(), parts: [], motes: [], sc: 0, spr: {}, wallsPrev: [], sage: { x: 0, y: 0, phase: 0, face: 1, spd: 0 }, hurt: {}, t: 0, lampes: [], tirs: [], tir: {}, q: 1, jeu: null };
function view() { const k = Math.min(cv.width / G.W, cv.height / (G.H + TOP)); return { k, ox: (cv.width - G.W * k) / 2, oy: TOP * k + (cv.height - (G.H + TOP) * k) / 2 }; }
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
function glowSprite(sc, col) {
  const R = 30, c = mk(R * 2 * sc, R * 2 * sc), g = c.getContext('2d'), gr = g.createRadialGradient(R * sc, R * sc, 0, R * sc, R * sc, R * sc);
  gr.addColorStop(0, col.replace('A', '0.95')); gr.addColorStop(0.35, col.replace('A', '0.45')); gr.addColorStop(1, col.replace('A', '0'));
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); return c;
}
// ----- les golems de Grosbec : les mêmes que dans le combat du Barde, en plus petit -----
// m : son modèle chez le Barde ; sc : sa taille ici ; pas : la longueur d'un pas ; lourd : son poids (la poussière, les secousses) ;
// bw, bh, lh, hw, hh : ses mesures (largeur, corps, pattes, tête), pour poser sur lui la boue, les lianes, le feu, les étoiles
const GOLEM = {
  cogneur: { m: 'soldat',   sc: 0.68, pas: 27, lourd: 0.5, bw: 40, bh: 30, lh: 25, hw: 18, hh: 16 },   // le lancier
  coureur: { m: 'trotteur', sc: 0.70, pas: 34, lourd: 0.2, bw: 34, bh: 18, lh: 14, hw: 22, hh: 13 },   // le rôdeur
  brute:   { m: 'fonceur',  sc: 0.76, pas: 30, lourd: 0.8, bw: 52, bh: 30, lh: 18, hw: 30, hh: 13 },   // le bélier
  costaud: { m: 'gros',     sc: 0.62, pas: 38, lourd: 1,   bw: 68, bh: 42, lh: 26, hw: 30, hh: 19 },   // le colosse
  lanceur: { m: 'lanceur',  sc: 0.68, pas: 25, lourd: 0.4, bw: 38, bh: 20, lh: 16, hw: 20, hh: 25 }    // le frondeur
};
for (const k in GOLEM) { const P = GOLEM[k]; P.H = P.lh + P.bh + P.hh; P.F = Math.round(P.H * 0.45); }
const FOOT = type => GOLEM[type].F;   // de son milieu (là où on le touche) à ses pieds
// l'ombre d'un golem, et le rouge qu'il pose sur les dalles
function ombreSprite(sc) {
  const c = mk(96 * sc, 40 * sc), g = c.getContext('2d'); g.scale(sc, sc); g.translate(48, 20);
  g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(0, 0, 30, 10, 0, 0, TAU); g.fill();
  g.scale(1, 0.4); const gr = g.createRadialGradient(0, 0, 2, 0, 0, 46); gr.addColorStop(0, 'rgba(255,60,20,.34)'); gr.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = gr; g.fillRect(-48, -48, 96, 96);
  return c;
}
// la cuirasse des golems de la fureur : une plaque de fer bleu à liseré d'or, rivetée sur la poitrine
function cuirasseSprite(sc) {
  const c = mk(28 * sc, 30 * sc), g = c.getContext('2d'); g.scale(sc, sc); g.translate(14, 3);
  g.beginPath(); g.moveTo(-11, 0); g.lineTo(11, 0); g.lineTo(11, 12); g.quadraticCurveTo(9, 21, 0, 25); g.quadraticCurveTo(-9, 21, -11, 12); g.closePath();
  const gr = g.createLinearGradient(-11, 0, 11, 24); gr.addColorStop(0, '#8fa0b8'); gr.addColorStop(0.5, '#4a586c'); gr.addColorStop(1, '#1d2430'); g.fillStyle = gr; g.fill();
  g.strokeStyle = '#f4d27c'; g.lineWidth = 1.6; g.stroke(); g.strokeStyle = '#05070a'; g.lineWidth = 0.7; g.stroke();
  g.fillStyle = '#fff3c4'; for (const [rx, ry] of [[-7, 4], [7, 4], [0, 19]]) { g.beginPath(); g.arc(rx, ry, 1.4, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-7, 8); g.lineTo(-3, 16); g.stroke();
  return c;
}
function drawGolem(u, a, t) {
  const P = GOLEM[u.type], F = P.F, sc = P.sc, dazed = u.daze > 0, fl = u.flash > 0 ? Math.min(1, u.flash * 9) : 0;
  const dancing = u.dance > 0 && !dazed && !a.flying;
  const moving = (a.spd > 6 && !dazed && !a.flying) || dancing;
  // quelle image : son pas (quatre images : le pied tape, debout, l'autre pied se lève, il est en l'air), ou il arme, ou il frappe
  let etat = 'marche', k = 2, pied = 0;
  if (moving) { const ph = dancing ? t * 3.2 + u.id : a.phase, f = ph - Math.floor(ph); pied = Math.floor(ph) & 1; k = f < 0.24 ? 0 : f < 0.5 ? 2 : f < 0.76 ? 3 : 4; }
  else if (!dazed && !a.flying && a.age > 0.6) { const rate = G.TYPES[u.type].rate; if (rate - u.atk < 0.2) etat = 'frappe'; else if (u.atk < 0.35) etat = 'arme'; }
  const sp = Golems.image(P.m, { yaw: a.yaw, etat, k, pied });
  // il saute de la galerie (ceux qui viennent des côtés et du bas)
  const saut = a.dehors && a.age < 0.45 ? Math.sin(a.age / 0.45 * Math.PI) * 26 : 0;
  const born = Math.min(1, a.age / 0.3);
  ctx.save(); ctx.translate(u.x, u.y + F);
  if (born < 1) ctx.globalAlpha = born;
  const ow = P.bw * (1.5 - saut * 0.012); ctx.drawImage(R8.spr.ombre, -ow / 2, -ow * 0.21 + 1, ow, ow * 0.42);
  if (saut) ctx.translate(0, -saut);
  if (a.rot) { ctx.translate(0, -P.H / 2); ctx.rotate(a.rot); ctx.translate(0, P.H / 2); }        // projeté : il tourne en l'air
  if (dazed && !a.flying) ctx.rotate((u.id % 2 ? 0.2 : -0.2) + Math.sin(t * 7 + u.id) * 0.06);     // sonné : il penche
  if (dancing) { ctx.translate(0, -Math.abs(Math.sin(t * 9 + u.id)) * 7); ctx.rotate(Math.sin(t * 4.5 + u.id) * 0.3); }
  const x = -sp.ox * sc, y = -sp.oy * sc, w = sp.w * sc, h = sp.h * sc;
  ctx.drawImage(sp.c, x, y, w, h);
  if (fl) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fl * born; ctx.drawImage(sp.c, x, y, w, h); ctx.globalCompositeOperation = 'source-over'; }   // touché : il s'éclaire
  if (u.iron) { ctx.globalAlpha = born; const cw = Math.max(15, P.bw * 0.42); ctx.drawImage(R8.spr.cuirasse, -cw / 2, -P.lh - P.bh * 0.82, cw, cw * 1.07); }
  ctx.restore();
  golemStates(u, a, t, P, F);
  // sonné : des étoiles qui tournent
  if (dazed && !a.flying) for (let i = 0; i < 3; i++) {
    const an = t * 5 + i * TAU / 3, sx = u.x + Math.cos(an) * P.hw * 0.7, sy = u.y + F - P.H - 4 + Math.sin(an) * 4;
    star(sx, sy, 4.5, '#ffd23f');
  }
  if (u.hp < u.max && u.max > 2) {
    const w2 = P.bw * 0.8, y2 = u.y + F + 6;
    ctx.fillStyle = 'rgba(11,16,32,.8)'; ctx.fillRect(u.x - w2 / 2, y2, w2, 4); ctx.fillStyle = '#ff6a7a'; ctx.fillRect(u.x - w2 / 2, y2, w2 * u.hp / u.max, 4);
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
  // en feu et en panique (volcan niveau 3)
  if (u.burn > 0 && G.lv(s, 'volcan') >= 3 && u.daze <= 0) { const kk = R8.kv || 1, sp = mot('!!', '#ffdf6b', Math.max(8, Math.round(17 * kk))), w = sp.w / kk, h = sp.h / kk; ctx.drawImage(sp.c, u.x - w / 2, top - 10 + Math.sin(t * 20 + u.id) * 2 - h * 0.7, w, h); }
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
const ETOILES = {};
function star(x, y, r, col) {
  let c = ETOILES[col];
  if (!c) { c = ETOILES[col] = mk(40, 40); const g = c.getContext('2d'); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, q = i % 2 ? 9 : 20; g.lineTo(20 + Math.cos(a) * q, 20 + Math.sin(a) * q); } g.closePath(); g.fill(); }
  ctx.drawImage(c, x - r, y - r, r * 2, r * 2);
}

// ----- les amis, vus de dos : ils font face à Grosbec (peints une fois, puis recopiés). Le Pisteur n'est plus dessiné depuis la version 17 (son dessin est gardé ici au cas où) -----
function heroDos(id, sc) {
  const W = 78, H = 100, OX = 39, OY = 90, c = mk(W * sc, H * sc), x = c.getContext('2d'); x.scale(sc, sc); x.translate(OX, OY); x.lineCap = 'round';
  const E = (cx, cy, rx, ry, col, rot = 0) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, TAU); if (col) { x.fillStyle = col; x.fill(); } };
  const D = (x0, y0, x1, y1, a, b) => { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const RR = (rx, ry, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(rx, ry, w, h, r) : x.rect(rx, ry, w, h); };
  const bottes = col => { for (const sd of [-1, 1]) E(sd * 6, -2, 6, 3.6, col); };
  const robe = (w, h, col, dark, hem) => {
    x.fillStyle = D(-w / 2, -40, w / 2, -40 + h, col, dark); x.beginPath(); x.moveTo(-w * .32, -40); x.lineTo(w * .32, -40); x.quadraticCurveTo(w * .6, -40 + h * .7, w * .52, -40 + h); x.quadraticCurveTo(0, -40 + h * 1.08, -w * .52, -40 + h); x.quadraticCurveTo(-w * .6, -40 + h * .7, -w * .32, -40); x.closePath(); x.fill();
    x.lineWidth = 1.6; x.strokeStyle = 'rgba(10,10,20,.55)'; x.stroke();
    if (hem) { x.strokeStyle = hem; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-w * .5, -40 + h * .97); x.quadraticCurveTo(0, -40 + h * 1.05, w * .5, -40 + h * .97); x.stroke(); }
  };
  const cape = (w, y1, col, dark, hem) => {
    x.fillStyle = D(0, -44, 0, y1, col, dark); x.beginPath(); x.moveTo(-w * .42, -43); x.quadraticCurveTo(0, -47, w * .42, -43); x.quadraticCurveTo(w * .64, (y1 - 43) / 2, w * .52, y1); x.quadraticCurveTo(0, y1 + 5, -w * .52, y1); x.quadraticCurveTo(-w * .64, (y1 - 43) / 2, -w * .42, -43); x.closePath(); x.fill();
    x.lineWidth = 1.4; x.strokeStyle = 'rgba(10,10,20,.5)'; x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.22)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, -43); x.lineTo(0, y1 + 2); x.moveTo(-w * .26, -40); x.lineTo(-w * .3, y1); x.moveTo(w * .26, -40); x.lineTo(w * .3, y1); x.stroke();
    if (hem) { x.strokeStyle = hem; x.lineWidth = 1.8; x.beginPath(); x.moveTo(-w * .5, y1 - 1); x.quadraticCurveTo(0, y1 + 4, w * .5, y1 - 1); x.stroke(); }
  };
  const capuche = (col, dark) => {
    x.fillStyle = D(-12, -66, 12, -42, col, dark); x.beginPath(); x.moveTo(-12.5, -44); x.quadraticCurveTo(-14.5, -66, 0.5, -66.5); x.quadraticCurveTo(14, -66, 12.5, -44); x.quadraticCurveTo(0, -38, -12.5, -44); x.closePath(); x.fill();
    x.lineWidth = 1.4; x.strokeStyle = 'rgba(10,10,20,.5)'; x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, -65); x.quadraticCurveTo(1.5, -54, 0, -42); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.16)'; x.beginPath(); x.moveTo(-8, -60); x.quadraticCurveTo(-10, -52, -9, -47); x.stroke();
  };
  if (id === 'P') {          // le Pisteur : sa cape verte, son carquois en travers du dos, son arc sur le côté
    bottes('#4a3220'); robe(30, 32, '#8a5a34', '#55361e');
    const a0 = Math.PI - 1.15, a1 = Math.PI + 1.15;
    x.strokeStyle = '#6b4424'; x.lineWidth = 3; x.beginPath(); x.arc(-13, -30, 19, a0, a1); x.stroke();
    x.strokeStyle = '#e8e0d0'; x.lineWidth = 1; x.beginPath(); x.moveTo(-13 + Math.cos(a0) * 19, -30 + Math.sin(a0) * 19); x.lineTo(-13 + Math.cos(a1) * 19, -30 + Math.sin(a1) * 19); x.stroke();
    cape(30, -12, '#3f8f4a', '#24572b');
    x.save(); x.translate(3, -31); x.rotate(0.42); x.fillStyle = '#6b4424'; RR(-4.5, -13, 9, 26, 3); x.fill(); x.strokeStyle = '#3a2412'; x.lineWidth = 1.2; x.stroke(); x.fillStyle = '#d9b48c'; x.fillRect(-4.5, -6, 9, 2);
    for (const [fx, col] of [[-2.6, '#f4f0e8'], [0, '#e0584a'], [2.6, '#f4f0e8']]) { x.strokeStyle = '#7a5130'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(fx, -13); x.lineTo(fx, -19); x.stroke(); x.fillStyle = col; x.beginPath(); x.moveTo(fx, -25); x.lineTo(fx + 2.2, -19); x.lineTo(fx - 2.2, -19); x.closePath(); x.fill(); }
    x.restore();
    capuche('#4fa65a', '#24572b');
    E(-17, -31, 3.2, 3.2, SKIN);
  }
  if (id === 'A') {          // l'Alchimiste : sa robe violette, sa sacoche, ses fioles à la ceinture, une fiole levée
    bottes('#3a2a20'); robe(32, 34, '#7b4bc4', '#3f2270');
    x.strokeStyle = '#4a2e18'; x.lineWidth = 3; x.beginPath(); x.moveTo(11, -41); x.lineTo(-12, -18); x.stroke();
    x.fillStyle = '#8a5a33'; RR(-20, -22, 13, 13, 3); x.fill(); x.strokeStyle = '#4a2e18'; x.lineWidth = 1.2; x.stroke(); x.fillStyle = '#c9a15a'; x.fillRect(-15, -17, 3, 3);
    x.fillStyle = '#4a2e18'; x.fillRect(-12, -25, 24, 3.4);
    for (const [i, col] of [[0, '#7ef0a0'], [1, '#ffd23f'], [2, '#ff6a7a']]) { E(-2 + i * 6, -19.5, 2.6, 3.2, col); x.fillStyle = '#c9a15a'; x.fillRect(-3 + i * 6, -24, 2, 2); }
    capuche('#9566dc', '#4a2a85');
    x.strokeStyle = '#c9a15a'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-12.6, -55); x.quadraticCurveTo(0, -51, 12.6, -55); x.stroke(); E(0, -53, 2, 2, '#8a6a2a');
    x.strokeStyle = '#6a3eb0'; x.lineWidth = 6; x.beginPath(); x.moveTo(12, -39); x.lineTo(19, -47); x.stroke(); E(20, -49, 3.2, 3.2, SKIN);
    E(21, -57, 5.8, 5.8, 'rgba(126,240,160,.92)'); x.strokeStyle = '#e8f5ff'; x.lineWidth = 1.4; x.stroke(); x.fillStyle = '#c9a15a'; x.fillRect(19.4, -66.5, 3.2, 4.5); E(19.5, -58.5, 1.6, 1.6, 'rgba(255,255,255,.7)');
  }
  if (id === 'B') {          // le Barde : sa tenue rubis, son luth (on voit la caisse et le manche dépasser), son chapeau à plume blanche
    bottes('#3a2418'); robe(30, 32, '#c8283c', '#7a1424', '#f0c040');
    x.save(); x.translate(-15, -29); x.rotate(-0.5); E(0, 0, 8.5, 11, '#b07a3e'); x.strokeStyle = '#4a2e18'; x.lineWidth = 1.6; x.stroke(); x.fillStyle = '#7a5130'; x.fillRect(-2, -27, 4, 18); x.fillStyle = '#4a2e18'; x.fillRect(-3.5, -31, 7, 5); x.restore();
    cape(27, -18, '#a81f33', '#6e1830', '#f0c040');
    E(0, -50, 11, 10, '#5a3a22');
    E(0, -57.5, 16.5, 5, '#8e1a2e'); E(0, -59, 16, 4.4, '#c8283c'); E(0, -64, 9.5, 7, '#d42c40'); x.strokeStyle = 'rgba(10,10,20,.45)'; x.lineWidth = 1.2; x.stroke();
    x.strokeStyle = '#f0c040'; x.lineWidth = 1.8; x.beginPath(); x.ellipse(0, -60.5, 9.6, 2.6, 0, 0, Math.PI); x.stroke();
    x.fillStyle = '#f7f2e6'; x.beginPath(); x.moveTo(6, -62); x.quadraticCurveTo(22, -88, 26, -68); x.quadraticCurveTo(15, -70, 6, -62); x.fill();
    x.strokeStyle = 'rgba(120,110,90,.6)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(7, -63); x.quadraticCurveTo(18, -77, 24, -70); x.stroke();
  }
  return { c, w: W, h: H, ox: OX, oy: OY };
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
  const isSage = id === 'S', a = isSage ? R8.sage : { face: 1, spd: 0, phase: 0 };
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
  if (!isSage) {
    // un ami, vu de dos : il fait face à Grosbec. Peint une fois, recopié ; un petit sursaut quand il tire sur Grosbec
    const sp = R8.spr.dos[id], T = R8.tir[id], kick = T && T.kick > t ? (T.kick - t) / 0.2 * 4 : 0;
    ctx.drawImage(sp.c, -sp.ox, -sp.oy + by - kick, sp.w, sp.h);
    if (id === 'P' && f.leap) { ctx.strokeStyle = '#d8dde8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(14, by - 30); ctx.lineTo(30, by - 40); ctx.stroke(); }   // la dague en avant
    if (id === 'A') { for (let i = 0; i < 2; i++) { const p = (t * 1.3 + i * 0.5) % 1; ctx.globalAlpha = 1 - p; ctx.fillStyle = '#b8ffd0'; ctx.beginPath(); ctx.arc(21 + Math.sin(p * 9 + i) * 2, by - 68 - p * 12 - kick, 1.8, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }   // sa fiole bouillonne
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

// ----- Grosbec dans son armure, en haut de la salle, devant la grande arche -----
// C'est le modèle du combat du Barde (barde/grosbec.js), vu d'un peu plus haut. Son dessin en volume coûte cher :
// ici il est « cuit » en une quinzaine d'images, une fois, puis recopié (une seule image à poser, à chaque fois).
const GB = { x: 450, y: 80, h: 172, B: { x0: -212, y0: -306, w: 424, h: 342 }, kc: 0, im: {}, pts: {}, file: [], poses: null, etat: '', g: null, flash: 0, rage: 0, mots: null, n: 0 };
function gbPoses() {
  const P = 0.5, E = Gros.G, g = (cles, t) => Gros.geste(cles, t) || {};
  const mal = { gx: -27, gy: -113, gz: 15, dx: 27, dy: -113, dz: 15, go: 1, do_: 1, penche: 0.12, bas: 11, hoche: 0.22, yeux: 0.45, lumG: 0.5, lumD: 0.5, lumC: 0.5 };
  return {
    r0: {}, rg2: { tete: -0.2 }, rg: { tete: -0.42, cap: -0.07 }, rd2: { tete: 0.2 }, rd: { tete: 0.42, cap: 0.07 },                            // au repos : sa tête surveille la salle
    eaG: g(E.envoi(-1, P), -0.3 * P), ebG: g(E.envoi(-1, P), -0.03), ecG: g(E.envoi(-1, P), 0.32 * P),                                        // il envoie ses golems (bras gauche…
    eaD: g(E.envoi(1, P), -0.3 * P), ebD: g(E.envoi(1, P), -0.03), ecD: g(E.envoi(1, P), 0.32 * P),                                           // … ou droit)
    sa: g(E.silence(), 0.4), sb: g(E.silence(), 0.7),                                                                                         // la colère : les poings au ciel, puis il frappe du pied
    ta: g(E.touche(1), 0.02), tb: g(E.touche(1), 0.3),                                                                                        // touché : il part en arrière
    fin: mal                                                                                                                                  // l'armure tombe : il se tient la tête
  };
}
// à quelle finesse le cuire (selon l'écran), et quoi recuire quand son état change (son casque se fend à chaque code, il enrage)
// le casque se fend à chaque ami vainqueur : de 0 à 3 fissures, quel que soit le nombre d'amis (2 depuis la version 17)
const gbFissures = () => Math.round(s.entered.length * 3 / G.ORDER.length);
function gbRegler(kv, etat) {
  const kc = Math.round(Math.min(1, Math.max(0.3, GB.h / 286 * kv * 0.85)) * 20) / 20;
  if (kc === GB.kc && etat === GB.etat) return;
  if (kc !== GB.kc) { Gros.construire(1, kc); for (const n in GB.im) GB.im[n].width = GB.im[n].height = 0; GB.im = {}; GB.pts = {}; }
  GB.kc = kc; GB.etat = etat; GB.poses = GB.poses || gbPoses(); GB.file = Object.keys(GB.poses);
}
function gbCuire(nom) {
  const kc = GB.kc, B = GB.B, c = mk(B.w * kc, B.h * kc), g = c.getContext('2d'), [fis, col] = GB.etat.split('|').map(Number);
  g.scale(kc, kc); g.translate(-B.x0, -B.y0);
  Gros.image(g, GB.poses[nom], { pul: 0.5, fissures: nom === 'fin' ? 5 : fis, colere: nom === 'sa' || nom === 'sb' ? 1 : col }, 1.2 + GB.n++);
  const vieux = GB.im[nom]; GB.im[nom] = c; if (vieux) vieux.width = vieux.height = 0; const q = {}; for (const n of ['tete', 'lanG', 'lanD', 'coeur']) { const p = Gros.point(n, 0, 0); q[n] = [p.x / kc, p.y / kc]; } GB.pts[nom] = q;
}
// un peu de cuisson : une image de Grosbec, sinon quelques golems (à chaque image du jeu, et pendant qu'on lit l'explication)
function cuisson(ms = 3) {
  if (GB.file.length) {   // en plein combat : une image de Grosbec toutes les 0,12 seconde, pas plus ; entre deux, on avance les golems
    const m = performance.now();
    if (!(s && !paused) || m - (GB.tc || 0) >= 120) { GB.tc = m; gbCuire(GB.file.shift()); R8.cuit = 2; return true; }
  }
  return Golems.precuire(ms) > 0 || GB.file.length > 0;
}
function gbGeste(nom, sd, t) { if (GB.g && GB.g.nom === 'silence' && t - GB.g.t0 < 1.2) return; GB.g = { nom, sd, t0: t }; }
function gbImage(t) {
  if (s.over === 'win') return 'fin';
  const g = GB.g;
  if (g) { const u = t - g.t0;
    if (g.nom === 'envoi') { if (u < 0.3) return 'ea' + g.sd; if (u < 0.62) return 'eb' + g.sd; if (u < 0.95) return 'ec' + g.sd; }
    else if (g.nom === 'silence') { if (u < 0.5) return 'sa'; if (u < 1.25) return 'sb'; }
    else if (g.nom === 'touche') { if (u < 0.32) return 'ta'; if (u < 0.8) return 'tb'; }
    GB.g = null; }
  return ['r0', 'rd2', 'rd', 'rd', 'rd2', 'r0', 'rg2', 'rg', 'rg', 'rg2'][Math.floor(t / 0.62) % 10];
}
// où le viser (sa poitrine, son casque), dans la salle
function gbPoint(n) { const P = GB.pts.r0, q = P && P[n], gk = GB.h / 286; return q ? { x: GB.x + q[0] * gk, y: GB.y + q[1] * gk } : { x: GB.x, y: GB.y - GB.h * (n === 'tete' ? 0.86 : 0.62) }; }
function drawGrosbec(t) {
  const nom = gbImage(t), c = GB.im[nom] || GB.im.r0, B = GB.B, gk = GB.h / 286, won = s.over === 'win', bob = won ? 0 : Math.sin(t * 1.6) * 1.2;
  if (!c) { ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(GB.x, GB.y, 60, 16, 0, 0, TAU); ctx.fill(); return; }
  const x = GB.x + B.x0 * gk, y = GB.y + B.y0 * gk + bob, w = B.w * gk, h = B.h * gk;
  ctx.drawImage(c, x, y, w, h);
  if (GB.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, GB.flash * 8) * 0.5; ctx.drawImage(c, x, y, w, h); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  const P = GB.pts[nom] || GB.pts.r0;
  if (P && !won) {   // ses lanternes battent (rouges quand il enrage)
    ctx.globalAlpha = 0.2 + 0.14 * Math.sin(t * 3.2) + (s.rage ? 0.14 : 0);
    for (const n of ['lanG', 'lanD', 'coeur']) { const q = P[n]; ctx.drawImage(s.rage ? R8.spr.glowFire : R8.spr.glowGold, GB.x + q[0] * gk - 27, GB.y + q[1] * gk + bob - 27, 54, 54); }
    ctx.globalAlpha = 1;
  }
  if (won) {         // l'armure tombe : il est pris dans le grand cristal
    const W2 = 96, H2 = GB.h + 16, y0 = GB.y + 8, X = GB.x;
    ctx.beginPath(); ctx.moveTo(X - W2, y0); ctx.lineTo(X - W2 * 1.12, y0 - H2 * 0.5); ctx.lineTo(X - W2 * 0.5, y0 - H2 * 1.02); ctx.lineTo(X + W2 * 0.45, y0 - H2 * 1.06); ctx.lineTo(X + W2 * 1.12, y0 - H2 * 0.55); ctx.lineTo(X + W2, y0); ctx.closePath();
    ctx.fillStyle = 'rgba(150,215,255,.26)'; ctx.fill(); ctx.strokeStyle = 'rgba(225,245,255,.9)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - W2 * 0.62, y0 - H2 * 0.2); ctx.lineTo(X - W2 * 0.25, y0 - H2 * 0.82); ctx.moveTo(X + W2 * 0.5, y0 - H2 * 0.15); ctx.lineTo(X + W2 * 0.72, y0 - H2 * 0.5); ctx.stroke();
    ctx.strokeStyle = '#6fe3ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(X, y0 - 2, W2 * 1.1, 26, 0, 0, TAU); ctx.stroke();
  }
}
// ce que Grosbec fait quand le combat change : il envoie ses golems à chaque grosse vague, il encaisse quand un ami gagne, il enrage
const GBMOTS = ['Allez, allez !', 'Écrasez-les !', 'Allez ! Plus vite !', 'Attrapez-les !'];
function gbSuivre(t, dt) {
  if (R8.jeu !== s) { R8.jeu = s; GB.g = null; GB.rage = 0; GB.flash = 0; GB.mots = null; R8.tirs = []; R8.tir = {}; R8.anim.clear(); }
  if (GB.flash > 0) GB.flash -= dt;
  gbRegler(view().k / (FIN || 1), gbFissures() + '|' + (s.rage ? 1 : 0));   // la même taille que dans ensureSprites : sans la finesse
  if ((s.rage || 0) > GB.rage) { GB.rage = s.rage; GB.g = { nom: 'silence', t0: t }; GB.mots = { t0: t, txt: s.rage === 1 ? 'ASSEZ !' : 'RRAAAH !' }; }
}
function gbFx(e, t) {
  if (e.k === 'side') {
    gbGeste('envoi', e.side === 3 ? 'G' : e.side === 1 ? 'D' : Math.random() < 0.5 ? 'G' : 'D', t);
    if (GB.g && GB.g.nom === 'envoi' && GB.g.t0 === t && (!GB.mots || t - GB.mots.t0 > 1.5)) GB.mots = { t0: t, txt: GBMOTS[Math.floor(Math.random() * GBMOTS.length)] };
  }
  if (e.k === 'free') { GB.g = { nom: 'touche', t0: t }; GB.flash = 0.25; const p = gbPoint('tete'); burst(p.x, p.y, 26, { k: 'spark', col: '#ffd23f', v0: 80, v1: 300, vz0: 40, vz1: 200, s0: 2, s1: 4.5, g: 300 }); }
}

// ----- les amis attaquent Grosbec, de temps en temps : des flèches, des potions, des éclairs (pour le spectacle : ça ne change rien au combat) -----
function tirsAmis(t, dt) {
  if (!s.over) for (const f of s.friends) {
    const T = R8.tir[f.id] || (R8.tir[f.id] = { next: t + 1.2 + Math.random() * 3.5, kick: 0 });
    if (t < T.next || f.leap) continue;
    T.next = t + (f.free ? 5.5 : 3.2) + Math.random() * 2.6; T.kick = t + 0.2;
    const c = gbPoint(f.id === 'P' ? 'tete' : 'coeur');
    R8.tirs.push({ id: f.id, x0: f.x + (f.id === 'A' ? 20 : f.id === 'P' ? -14 : 0), y0: f.y - (f.id === 'A' ? 30 : 8), x1: c.x + rnd(-16, 16), y1: c.y + rnd(-10, 14), t: 0, max: f.id === 'B' ? 0.24 : f.id === 'P' ? 0.42 : 0.8, col: f.id === 'A' ? ['#7ef0a0', '#ffb347', '#c77dff'][Math.floor(Math.random() * 3)] : '' });
  }
  for (const p of R8.tirs) {
    p.t += dt;
    if (p.t >= p.max && !p.fini) { p.fini = true; GB.flash = Math.max(GB.flash, 0.12);
      burst(p.x1, p.y1, p.id === 'A' ? 12 : 7, { k: 'spark', col: p.id === 'P' ? '#fff6c9' : p.id === 'A' ? p.col : '#ffb0f0', v0: 50, v1: 190, vz0: 20, vz1: 120, s0: 2, s1: 3.6, g: 240 }); }
  }
  if (R8.tirs.length) R8.tirs = R8.tirs.filter(p => !p.fini);
}
function drawTirs(t) {
  for (const p of R8.tirs) {
    const u = Math.min(1, p.t / p.max), x = p.x0 + (p.x1 - p.x0) * u, y = p.y0 + (p.y1 - p.y0) * u;
    if (p.id === 'P') {         // une flèche du Pisteur
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.y1 - p.y0, p.x1 - p.x0)); ctx.strokeStyle = '#7a5130'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(8, 0); ctx.stroke(); ctx.fillStyle = '#c8ccd6'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(6, -3.5); ctx.lineTo(6, 3.5); ctx.fill(); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(-17, -3, 5, 6); ctx.restore();
    } else if (p.id === 'A') {  // une fiole de l'Alchimiste, en cloche
      const yy = y - Math.sin(u * Math.PI) * 70;
      ctx.save(); ctx.translate(x, yy); ctx.rotate(u * 9); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(0, 1, 5.5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8f5ff'; ctx.lineWidth = 1.3; ctx.stroke(); ctx.fillStyle = '#c9a15a'; ctx.fillRect(-1.7, -8, 3.4, 4.5); ctx.restore();
    } else {                    // un éclair de musique du Barde
      ctx.globalAlpha = 1 - u * 0.6; const pts = [{ x: p.x0, y: p.y0 }, { x: (p.x0 + p.x1) / 2 + Math.sin(p.x1) * 14, y: (p.y0 + p.y1) / 2 }, { x: p.x1, y: p.y1 }];
      zigzag(pts, 'rgba(255,120,220,.55)', 8, 13); zigzag(pts, '#fff6c9', 3, 13); ctx.globalAlpha = 1;
    }
  }
}

// ----- la grande salle de Grosbec, vue de haut (peinte une seule fois) : la même que devant le Barde -----
// Le mur du fond et sa grande arche ouverte sur la ville d'en bas (floue), les deux portes de bronze et leurs lanternes,
// les dalles polies à losanges de bronze, l'allée et ses rigoles d'or, la rosace, l'estrade ; sur les côtés, les galeries d'où sautent les golems.
function makeBg() {
  const { lin, rad, poly, trait, ell, alea, toile } = Ou;
  const c = mk(cv.width, cv.height), g = c.getContext('2d'), { k, ox, oy } = view(), r = alea(4242);
  const BRZ = ['#b3925c', '#5d4831', '#1f1711'], OR = '#f4d27c', CX = 450, WB = 25, MT = -178, DX = 75, DY = 56.25;
  g.setTransform(k, 0, 0, k, ox, oy);
  g.fillStyle = '#03060a'; g.fillRect(-ox / k - 4, -oy / k - 4, cv.width / k + 8, cv.height / k + 8);
  R8.lampes = [];

  // ---------- le sol : de grandes dalles polies ----------
  g.save(); g.beginPath(); g.rect(0, WB - 2, 900, 902 - WB); g.clip();
  g.fillStyle = lin(g, 0, WB, 0, 900, ['#2a5262', '#1d3d4e', '#132a3a', '#0c1b27']); g.fillRect(0, WB - 2, 900, 902);
  g.save(); g.translate(CX, WB + 20); g.scale(1, 0.8); g.fillStyle = rad(g, 0, 0, 20, 560, ['rgba(150,238,246,.36)', 'rgba(110,210,228,.14)', 'rgba(110,210,228,0)']); g.fillRect(-600, -40, 1200, 760); g.restore();
  for (let j = 0; j < 16; j++) for (let i = 0; i < 12; i++) {
    const xa = i * DX, ya = j * DY, mx = xa + DX / 2, my = ya + DY / 2;
    g.fillStyle = (i + j) % 2 ? `rgba(255,255,255,${0.015 + r() * 0.04})` : `rgba(0,0,0,${0.05 + r() * 0.12})`; g.fillRect(xa, ya, DX, DY);
    g.strokeStyle = 'rgba(2,7,11,.8)'; g.lineWidth = 1.6; g.strokeRect(xa, ya, DX, DY);
    g.strokeStyle = `rgba(175,236,246,${0.06 + 0.22 * Math.max(0, 1 - Math.hypot((mx - CX) / 520, (my - WB) / 640))})`; g.lineWidth = 1.2; trait(g, [[xa + 2, ya + DY - 2], [xa + 2, ya + 2], [xa + DX - 2, ya + 2]]); g.stroke();
    if ((i + j) % 2 === 0) { poly(g, [[mx, my - 6.5], [mx + 9, my], [mx, my + 6.5], [mx - 9, my]]); g.fillStyle = 'rgba(93,72,49,.6)'; g.fill(); g.strokeStyle = 'rgba(244,210,124,.35)'; g.lineWidth = 1; g.stroke(); }   // un losange de bronze incrusté
    else if (r() < 0.3) { g.strokeStyle = 'rgba(2,7,11,.6)'; g.lineWidth = 1.2; const p0 = [mx + (r() - 0.5) * 40, ya + 3]; trait(g, [p0, [p0[0] + (r() - 0.5) * 22, my], [p0[0] + (r() - 0.5) * 30, ya + DY - 3]]); g.stroke(); }   // une fêlure
    for (let n = 0; n < 6; n++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.14)'; g.fillRect(xa + r() * DX, ya + r() * DY, 2.2, 1.4); }   // le grain
  }
  // l'allée de bronze, de l'estrade de Grosbec à la rosace des amis, bordée de deux rigoles d'or
  const AL = 62, yR = 445 - 76;
  g.fillStyle = 'rgba(60,44,28,.24)'; g.fillRect(CX - AL, WB, AL * 2, yR - WB);
  g.strokeStyle = 'rgba(244,210,124,.26)'; g.lineWidth = 1.3; for (let y = 150; y < yR - 10; y += DY / 2) { trait(g, [[CX - AL * 0.8, y + 9], [CX, y - 6], [CX + AL * 0.8, y + 9]]); g.stroke(); }
  g.strokeStyle = 'rgba(244,210,124,.32)'; g.lineWidth = 2; for (const sx of [-1, 1]) { trait(g, [[CX + sx * AL, 118], [CX + sx * AL, yR]]); g.stroke(); }
  // les reflets sur les dalles : la lueur de la ville, tout droit sous l'arche ; le rouge des forges devant les portes
  for (let i = -11; i < 11; i++) { const u = (i + 0.5) / 22, a = 0.24 * Math.exp(-u * u * 22), xa = CX + u * 620; g.fillStyle = lin(g, 0, WB, 0, 480, [`rgba(170,242,248,${a})`, `rgba(170,242,248,${a * 0.35})`, 'rgba(170,242,248,0)']); g.fillRect(xa - 14.5, WB, 29, 455); }
  for (const [pa, pb] of G.PORTES) { const px = (pa + pb) / 2, pw = pb - pa + 12;
    poly(g, [[px - pw / 2, WB], [px + pw / 2, WB], [px + pw / 2 + 55, WB + 170], [px - pw / 2 - 55, WB + 170]]); g.fillStyle = lin(g, 0, WB, 0, WB + 170, ['rgba(255,140,60,.40)', 'rgba(255,90,40,.13)', 'rgba(255,90,40,0)']); g.fill();
    g.save(); g.translate(px, WB + 26); g.scale(1, 0.4); g.fillStyle = rad(g, 0, 0, 3, 110, ['rgba(255,200,110,.30)', 'rgba(255,170,70,0)']); g.fillRect(-112, -112, 224, 224); g.restore(); }
  // la rosace, au milieu, sous les amis : des cercles d'or gravés, des rayons ; une nappe dorée l'éclaire, comme un projecteur
  const RX = 104, RY = 78;
  g.save(); g.translate(CX, 445); g.scale(1, 0.75); g.fillStyle = rad(g, 0, 0, 8, 270, ['rgba(255,222,140,.26)', 'rgba(255,210,120,.09)', 'rgba(255,210,120,0)']); g.fillRect(-280, -280, 560, 560); g.restore();
  ell(g, CX, 445, RX, RY, 'rgba(93,72,49,.5)'); g.strokeStyle = 'rgba(244,210,124,.55)'; g.lineWidth = 1.8; g.stroke(); ell(g, CX, 445, RX * 0.72, RY * 0.72); g.stroke(); ell(g, CX, 445, RX * 0.34, RY * 0.34, 'rgba(20,40,52,.7)'); g.stroke();
  g.lineWidth = 1.2; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; trait(g, [[CX + Math.cos(a) * RX * 0.34, 445 + Math.sin(a) * RY * 0.34], [CX + Math.cos(a) * RX * (i % 2 ? 0.72 : 1), 445 + Math.sin(a) * RY * (i % 2 ? 0.72 : 1)]]); g.stroke(); }
  // l'estrade de Grosbec, au pied de l'arche : trois marches rondes, cerclées d'or
  for (let n = 0; n < 3; n++) { const er = 152 - n * 15, ey = WB + 8 - n * 5;
    g.beginPath(); g.ellipse(CX, ey + 6, er, er * 0.62, 0, 0, Math.PI); g.closePath(); g.fillStyle = '#070b10'; g.fill();
    g.beginPath(); g.ellipse(CX, ey, er, er * 0.62, 0, 0, Math.PI); g.closePath(); g.fillStyle = lin(g, CX - er, 0, CX + er, 0, ['#1a2a36', '#3d5b6c', '#2a4352', '#111d27']); g.fill(); g.strokeStyle = 'rgba(244,210,124,.5)'; g.lineWidth = 1.4; g.stroke(); }
  // la lumière : les rayons qui tombent de l'arche, puis l'ombre qui gagne vers nous et sur les côtés
  for (let i = 0; i < 6; i++) { const a0 = -0.62 + i * 0.25 + (r() - 0.5) * 0.06, la = 0.07 + r() * 0.05, len = 430 * (0.75 + r() * 0.3), sx = CX + Math.sin(a0) * 75, sy = WB; poly(g, [[sx - 8, sy], [sx + 8, sy], [sx + Math.sin(a0 + la) * len, sy + len], [sx + Math.sin(a0 - la) * len, sy + len]]); g.fillStyle = lin(g, 0, sy, 0, sy + len, ['rgba(190,250,250,.11)', 'rgba(170,240,246,.04)', 'rgba(170,240,246,0)']); g.fill(); }
  g.fillStyle = lin(g, 0, 430, 0, 900, ['rgba(2,6,10,0)', 'rgba(2,6,10,.34)']); g.fillRect(0, 430, 900, 470);
  g.fillStyle = lin(g, 0, 0, 900, 0, [[0, 'rgba(2,6,10,.38)'], [0.18, 'rgba(2,6,10,0)'], [0.82, 'rgba(2,6,10,0)'], [1, 'rgba(2,6,10,.38)']]); g.fillRect(0, WB, 900, 900 - WB);
  g.restore();

  // ---------- les galeries des côtés (les golems en sautent) et le bas de la salle, vus d'en haut ----------
  const murs = [(a, d, la, ld) => [-d - ld, a, ld, la], (a, d, la, ld) => [900 + d, a, ld, la], (a, d, la, ld) => [a, 900 + d, la, ld]];
  murs.forEach((M, i) => {
    const a0 = i < 2 ? WB : -76, a1 = i < 2 ? 900 : 976, L = a1 - a0, F = (col, a, d, la, ld) => { g.fillStyle = col; g.fillRect(...M(a, d, la, ld)); };
    F('#070506', a0, 0, L, 58); F('rgba(170,36,12,.30)', a0, 6, L, 16); F('rgba(140,24,8,.16)', a0, 22, L, 16);                      // la galerie, dans l'ombre : le rouge des forges
    F('#0d1a25', a0, 58, L, 18); F('rgba(150,215,235,.07)', a0, 58, L, 1.5); for (let a = a0 + 30; a < a1; a += 46) F('rgba(2,6,10,.7)', a, 58, 1.2, 18);   // le mur, derrière
    F(BRZ[1], a0, 0, L, 6.5); F('rgba(244,210,124,.55)', a0, 0, L, 1.3); F('rgba(2,6,10,.8)', a0, 6.5, L, 1.2);                        // la corniche de bronze
    for (let a = i < 2 ? 150 : 75; a < a1 - 20; a += 150) { F('#1c3040', a - 11, 5, 22, 53); F('#3f6276', a - 11, 5, 4, 53); F('rgba(2,6,10,.7)', a + 10, 5, 1.2, 53); F(BRZ[0], a - 13, 0, 26, 8); F('rgba(244,210,124,.75)', a - 13, 0, 26, 1.3); F('rgba(2,6,10,.8)', a - 13, 8, 26, 1.2); }   // ses piliers
  });

  // ---------- le mur du fond : de grandes pierres bleu nuit ; il est écrasé par la hauteur d'où on regarde, mais c'est le même ----------
  g.fillStyle = lin(g, 0, MT, 0, WB, ['#070f17', '#12222f', '#1b3242']); g.fillRect(-90, MT - 70, 1080, WB - MT + 70);
  for (let yy = WB - 19, n = 0; yy > MT - 70; yy -= 19, n++) for (let xx = -90 + (n % 2) * 23; xx < 990; xx += 46) {
    g.fillStyle = r() < 0.5 ? `rgba(255,255,255,${r() * 0.045})` : `rgba(0,0,0,${r() * 0.16})`; g.fillRect(xx, yy, 46, 19);
    g.strokeStyle = 'rgba(2,6,10,.6)'; g.lineWidth = 1; g.strokeRect(xx, yy, 46, 19); g.strokeStyle = 'rgba(150,215,235,.07)'; trait(g, [[xx + 1, yy + 18], [xx + 1, yy + 1], [xx + 45, yy + 1]]); g.stroke();
  }
  // la ville d'en bas, au loin : peinte petite, puis agrandie → floue (trois rangs de tours dans la brume, leurs fenêtres, le grand cristal)
  function ville(w, h, graine) {
    const q = 0.5, a = toile(w * k * q, h * k * q), x = a.getContext('2d'), rr = alea(graine); x.scale(k * q, k * q);
    x.fillStyle = lin(x, 0, 0, 0, h, ['#051626', '#0b3048', '#1b6a82', '#86dcdc']); x.fillRect(0, 0, w, h);
    x.fillStyle = rad(x, w * 0.5, h * 0.08, 2, h * 0.95, ['rgba(225,255,250,.9)', 'rgba(125,232,236,.4)', 'rgba(60,160,190,0)']); x.fillRect(0, 0, w, h);
    for (let rang = 0; rang < 3; rang++) {
      const base = h * (0.6 + rang * 0.15);
      for (let i = 0; i < 9; i++) {
        const tw = (9 + rr() * 15) * (1 + rang * 0.35), tx = (i + rr() * 0.8) * w / 8 - tw / 2, th = (26 + rr() * 64) * (1 + rang * 0.25);
        x.fillStyle = ['#479aaa', '#1f5c74', '#0c2c42'][rang]; x.fillRect(tx, base - th, tw, th + h);
        if (rr() < 0.6) { poly(x, [[tx - 2, base - th], [tx + tw / 2, base - th - tw * (0.6 + rr())], [tx + tw + 2, base - th]]); x.fill(); } else { x.beginPath(); x.arc(tx + tw / 2, base - th, tw / 2, Math.PI, 0); x.fill(); }
        x.fillStyle = rang === 2 ? 'rgba(255,214,120,.95)' : 'rgba(195,250,255,.8)'; for (let n = 0; n < 7; n++) if (rr() < 0.55) x.fillRect(tx + 2 + rr() * (tw - 5), base - th + 6 + rr() * (th - 8), 1.8, 2.6);
      }
      x.fillStyle = `rgba(115,222,228,${0.18 - rang * 0.05})`; x.fillRect(0, base - 34, w, 68);
    }
    for (let i = 0; i < 4; i++) { const fx = w * (0.1 + 0.26 * i + rr() * 0.08); x.fillStyle = lin(x, 0, h * 0.15, 0, h * 0.8, ['rgba(205,255,250,.75)', 'rgba(120,230,240,0)']); x.fillRect(fx, h * 0.15, 2.4, h * 0.65); }
    for (let i = 0; i < 18; i++) { const bx = rr() * w, by = h * (0.25 + rr() * 0.65), br = 3 + rr() * 7; x.fillStyle = rad(x, bx, by, 0, br, [rr() < 0.5 ? 'rgba(255,222,135,.75)' : 'rgba(175,250,255,.65)', 'rgba(255,255,255,0)']); x.fillRect(bx - br, by - br, br * 2, br * 2); }
    const b = toile(a.width * 0.42, a.height * 0.42); b.getContext('2d').drawImage(a, 0, 0, b.width, b.height);
    const o = toile(w * k, h * k), o2 = o.getContext('2d'); o2.imageSmoothingEnabled = true; o2.drawImage(b, 0, 0, o.width, o.height);
    return o;
  }
  // la grande arche, derrière Grosbec
  const AW = 150, AS = -40, AR = 74, AB = WB - 8, HV = AB - (AS - AR);
  const arche = () => { g.beginPath(); g.moveTo(CX - AW, AB); g.lineTo(CX - AW, AS); g.ellipse(CX, AS, AW, AR, 0, Math.PI, 0); g.lineTo(CX + AW, AB); g.closePath(); };
  const V = ville(AW * 2, 250, 5);
  g.save(); arche(); g.clip(); g.drawImage(V, CX - AW, AS - AR, AW * 2, HV);
  g.fillStyle = lin(g, 0, AB - 40, 0, AB, ['rgba(8,20,30,0)', 'rgba(8,20,30,.55)']); g.fillRect(CX - AW, AB - 40, AW * 2, 40); g.restore();
  g.save(); g.translate(CX, AS); g.scale(1, 0.62); g.fillStyle = rad(g, 0, 0, AW * 0.9, AW * 2.1, ['rgba(140,235,245,.26)', 'rgba(120,220,235,.09)', 'rgba(120,220,235,0)']); g.fillRect(-AW * 2.2, -AW * 2.2, AW * 4.4, AW * 4.4); g.restore();   // la lueur de la ville, sur le mur
  arche(); g.strokeStyle = '#05080b'; g.lineWidth = 16; g.stroke(); g.strokeStyle = lin(g, CX - AW, AS - AR, CX + AW, AB, ['#8a7046', '#4a3a28', '#2a2018']); g.lineWidth = 12; g.stroke();
  g.strokeStyle = 'rgba(244,210,124,.7)'; g.lineWidth = 1.2; for (const d of [5.5, -5.5]) { g.beginPath(); g.ellipse(CX, AS, AW + d, AR + d, 0, Math.PI, 0); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1; for (let i = 0; i <= 16; i++) { const a = Math.PI + i * Math.PI / 16, ca = Math.cos(a), sa = Math.sin(a); trait(g, [[CX + ca * (AW - 5.5), AS + sa * (AR - 5.5)], [CX + ca * (AW + 5.5), AS + sa * (AR + 5.5)]]); g.stroke(); }
  for (let i = 0; i < 5; i++) {   // cinq cristaux sur l'arc
    const a = Math.PI + (i + 0.5) * Math.PI / 5, qx = CX + Math.cos(a) * AW, qy = AS + Math.sin(a) * AR;
    g.save(); g.translate(qx, qy); g.rotate(Math.atan2(Math.sin(a) * AW, Math.cos(a) * AR) + Math.PI / 2); g.shadowColor = 'rgba(150,245,255,1)'; g.shadowBlur = 9 * k; poly(g, [[0, -8], [5, 0], [0, 8], [-5, 0]]); g.fillStyle = lin(g, -4, -6, 4, 6, ['#f2ffff', '#8fe8f2', '#2b8fa8']); g.fill(); g.shadowBlur = 0; g.strokeStyle = '#05080b'; g.lineWidth = 1; g.stroke(); g.restore();
  }
  g.fillStyle = lin(g, 0, AB - 5, 0, WB, ['#3c2f20', '#17110c']); g.fillRect(CX - AW - 8, AB - 5, AW * 2 + 16, WB - AB + 6); g.fillStyle = OR; g.globalAlpha = 0.6; g.fillRect(CX - AW - 8, AB - 5, AW * 2 + 16, 1.4); g.globalAlpha = 1;   // le garde-corps
  for (const c2 of [-1, 1]) {     // deux pilastres, de chaque côté de l'arche
    const px = CX + c2 * (AW + 19);
    g.fillStyle = lin(g, px - 9, 0, px + 9, 0, ['#0b1620', '#2f4a5c', '#3f6276', '#1a2c3a', '#0a131b']); g.fillRect(px - 9, MT - 70, 18, WB - MT + 70);
    g.strokeStyle = 'rgba(2,6,10,.8)'; g.lineWidth = 1.2; g.strokeRect(px - 9, MT - 72, 18, WB - MT + 72);
    for (const yy of [WB - 7, AS, AS - 10]) { g.fillStyle = lin(g, 0, yy - 4, 0, yy + 4, BRZ); g.fillRect(px - 11, yy - 4, 22, 8); g.strokeRect(px - 11, yy - 4, 22, 8); g.fillStyle = OR; g.globalAlpha = 0.7; g.fillRect(px - 11, yy - 4, 22, 1); g.globalAlpha = 1; }
  }
  // un vantail de porte : du bronze sombre, des clous d'or, des ferrures
  function vantail(x, w, h) {
    x.beginPath(); x.moveTo(0, h); x.lineTo(0, w * 0.9); x.quadraticCurveTo(0, 0, w, 0); x.lineTo(w, h); x.closePath();
    x.fillStyle = lin(x, 0, 0, w, h, ['#6d5638', '#3a2c1f', '#17110c']); x.fill(); x.save(); x.clip();
    x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(0, 0, w * 0.35, h); x.fillStyle = 'rgba(255,70,20,.22)'; x.fillRect(w - 3, 0, 3, h);
    x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 1; for (let i = 1; i < 4; i++) { trait(x, [[w * i / 4, 0], [w * i / 4, h]]); x.stroke(); }
    for (const yy of [0.3, 0.58, 0.86]) { x.fillStyle = lin(x, 0, h * yy - 4, 0, h * yy + 4, BRZ); x.fillRect(0, h * yy - 3.5, w, 7); x.strokeStyle = 'rgba(0,0,0,.6)'; x.strokeRect(0, h * yy - 3.5, w, 7); for (let i = 0; i < 4; i++) ell(x, w * (i + 0.5) / 4, h * yy, 1.3, 1.3, OR); }
    x.restore(); x.strokeStyle = '#05070a'; x.lineWidth = 1.4; x.stroke();
  }
  // les deux portes de bronze, grandes ouvertes sur le rouge des forges (les golems du haut sortent par là), leur frise, leur lanterne
  for (const [pa, pb] of G.PORTES) {
    const px = (pa + pb) / 2, pw = pb - pa + 12, ph = 86, py = WB;
    const cadre = d => { g.beginPath(); g.moveTo(px - pw / 2 - d, py); g.lineTo(px - pw / 2 - d, py - ph + 34); g.quadraticCurveTo(px - pw / 2 - d, py - ph - d, px, py - ph - d); g.quadraticCurveTo(px + pw / 2 + d, py - ph - d, px + pw / 2 + d, py - ph + 34); g.lineTo(px + pw / 2 + d, py); g.closePath(); };
    cadre(6); g.fillStyle = '#05080b'; g.fill(); g.strokeStyle = lin(g, px - pw, py - ph, px + pw, py, ['#8a7046', '#3c2f20']); g.lineWidth = 3.5; g.stroke(); g.strokeStyle = 'rgba(244,210,124,.55)'; g.lineWidth = 1; g.stroke();
    cadre(0); g.fillStyle = rad(g, px, py - ph * 0.15, 4, ph * 1.3, ['#fff0c0', '#ff9a3a', '#c8300c', '#3a0804']); g.fill();
    g.save(); cadre(0); g.clip();
    for (const c2 of [-1, 1]) { g.save(); g.translate(px + c2 * pw / 2, py - ph); g.scale(-c2 * 0.3, 1); vantail(g, pw / 2, ph); g.restore(); }   // les deux vantaux, ouverts, vus par la tranche
    g.restore();
    const zy = py - ph - 13, zw = 236;
    g.fillStyle = lin(g, 0, zy - 4, 0, zy + 4, BRZ); g.fillRect(px - zw / 2, zy - 4, zw, 8); g.strokeStyle = 'rgba(2,6,10,.8)'; g.lineWidth = 1; g.strokeRect(px - zw / 2, zy - 4, zw, 8);
    g.strokeStyle = 'rgba(244,210,124,.7)'; g.lineWidth = 0.9; g.beginPath(); for (let zx = px - zw / 2 + 4; zx < px + zw / 2 - 7; zx += 6) { g.moveTo(zx, zy + 2.5); g.lineTo(zx + 3, zy - 2.5); g.lineTo(zx + 6, zy + 2.5); } g.stroke();
    const ly = zy - 27;
    g.strokeStyle = '#05080b'; g.lineWidth = 2; trait(g, [[px, ly - 18], [px, ly - 8]]); g.stroke();
    g.shadowColor = 'rgba(255,200,90,1)'; g.shadowBlur = 12 * k; poly(g, [[px - 7, ly - 7], [px + 7, ly - 7], [px + 5, ly + 9], [px - 5, ly + 9]]); g.fillStyle = lin(g, 0, ly - 7, 0, ly + 9, ['#fff6cf', '#ffc75a', '#e07a1c']); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = '#17110c'; g.lineWidth = 1.2; g.stroke(); poly(g, [[px - 9, ly - 7], [px, ly - 14], [px + 9, ly - 7]]); g.fillStyle = BRZ[1]; g.fill(); g.stroke(); g.fillStyle = BRZ[1]; g.fillRect(px - 7, ly + 9, 14, 3);
    g.fillStyle = rad(g, px, ly, 2, 84, ['rgba(255,200,100,.30)', 'rgba(255,170,70,.08)', 'rgba(255,170,70,0)']); g.fillRect(px - 84, ly - 84, 168, 168);
    R8.lampes.push({ x: px, y: ly });
  }
  // les colonnes des coins, rondes, cerclées de bronze, et leur cristal
  for (const cx of [0, 900]) {
    g.fillStyle = lin(g, cx - 13, 0, cx + 13, 0, ['#070e15', '#243c4c', '#4a7186', '#1c3040', '#070e15']); g.fillRect(cx - 13, MT - 70, 26, WB - MT + 74);
    g.strokeStyle = 'rgba(2,6,10,.85)'; g.lineWidth = 1.3; g.strokeRect(cx - 13, MT - 72, 26, WB - MT + 76);
    for (let yy = WB - 3; yy > MT - 70; yy -= 50) { g.fillStyle = lin(g, cx - 15, 0, cx + 15, 0, [BRZ[2], BRZ[0], BRZ[1], BRZ[2]]); g.fillRect(cx - 15, yy - 5, 30, 9); g.strokeRect(cx - 15, yy - 5, 30, 9); g.fillStyle = OR; g.globalAlpha = 0.7; g.fillRect(cx - 15, yy - 5, 30, 1); g.globalAlpha = 1; }
    const ly = -80; g.shadowColor = 'rgba(150,245,255,1)'; g.shadowBlur = 10 * k; poly(g, [[cx, ly - 9], [cx + 5.5, ly], [cx, ly + 9], [cx - 5.5, ly]]); g.fillStyle = '#c9fbff'; g.fill(); g.shadowBlur = 0; g.strokeStyle = '#05080b'; g.lineWidth = 1; g.stroke();
  }
  g.fillStyle = lin(g, 0, MT - 70, 0, -120, ['rgba(2,5,9,.94)', 'rgba(2,5,9,.9)', 'rgba(2,5,9,0)']); g.fillRect(-90, MT - 70, 1080, -120 - (MT - 70));   // le haut du mur se perd dans l'ombre
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
  if (cv.width < 8 || cv.height < 8) return;
  // kvR : la taille de l'écran SANS la finesse. Les images cuites (golems, Grosbec, lueurs) gardent cette taille :
  // quand la page baisse sa finesse parce que l'appareil rame, rien n'est recuit en plein combat (leçon du jeu du Barde, Bible §16.7).
  const kv = view().k, kvR = kv / (FIN || 1), sc = Math.min(3, Math.max(1, kvR));
  if (R8.sc !== sc || !R8.spr.glowRed) {
    R8.sc = sc;
    R8.spr.glowRed = glowSprite(sc, 'rgba(255,70,80,A)'); R8.spr.glowCyan = glowSprite(sc, 'rgba(140,235,255,A)'); R8.spr.glowGold = glowSprite(sc, 'rgba(255,215,90,A)'); R8.spr.glowFire = glowSprite(sc, 'rgba(255,120,30,A)'); R8.spr.flame = flameSprite(sc * 2); R8.spr.glowPink = glowSprite(sc, 'rgba(255,120,220,A)');
    R8.spr.wall = wallPattern();
    R8.spr.parch = makeParchment();
    R8.spr.ombre = ombreSprite(sc); R8.spr.cuirasse = cuirasseSprite(sc * 1.5);
    { const c = mk(48 * sc, 20 * sc), g = c.getContext('2d'), gr = g.createRadialGradient(24 * sc, 24 * sc, 0, 24 * sc, 24 * sc, 24 * sc); gr.addColorStop(0, 'rgba(201,191,168,.9)'); gr.addColorStop(1, 'rgba(201,191,168,0)'); g.scale(1, 20 / 48); g.fillStyle = gr; g.fillRect(0, 0, 48 * sc, 48 * sc); R8.spr.fumee = c; }   // un nuage de poussière
    R8.spr.dos = { A: heroDos('A', sc * 1.25), B: heroDos('B', sc * 1.25) };   // version 17 : plus de Pisteur
  }
  // les golems et Grosbec sont cuits à la taille de l'écran (on ne les recuit que si elle change vraiment)
  const kg = Math.round(Math.min(1.3, Math.max(0.45, kvR * 0.64)) * 10) / 10;
  if (kg !== R8.kg) { R8.kg = kg; Golems.regler(kg); Golems.prevoir(Object.values(GOLEM).map(P => P.m)); }
  gbRegler(kvR, s ? gbFissures() + '|' + (s.rage ? 1 : 0) : GB.etat || '0|0');
}
// ----- particules (cailloux, poussière, étincelles) -----
function burst(x, y, n, o) {
  const L = R8.parts.length; if (L > 300) return; if (L > 180) n = Math.ceil(n / 3);     // déjà beaucoup d'éclats : on en ajoute moins
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU), v = rnd(o.v0 ?? 60, o.v1 ?? 200), life = rnd(o.l0 ?? 0.5, o.l1 ?? 0.9);
    R8.parts.push({ x, y, z: o.z ?? 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, vz: rnd(o.vz0 ?? 80, o.vz1 ?? 260), life, max: life, k: o.k, col: o.col ?? '#9aa3b5', size: rnd(o.s0 ?? 3, o.s1 ?? 6), g: o.g ?? 700 });
  }
}
function dust(x, y, size) { if (R8.parts.length < 240) R8.parts.push({ x, y, z: 0, vx: rnd(-10, 10), vy: rnd(-4, 4), vz: 0, life: 0.45, max: 0.45, k: 'puff', size, g: 0 }); }
function stepParts(dt) {
  let n = 0; const P = R8.parts;
  for (let i = 0; i < P.length; i++) {
    const p = P[i]; p.life -= dt; if (p.life <= 0) continue;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.g) { p.vz -= p.g * dt; p.z += p.vz * dt; if (p.z < 0) { p.z = 0; p.vz *= -0.35; p.vx *= 0.6; p.vy *= 0.6; } }
    P[n++] = p;
  }
  P.length = n; if (n > 320) P.splice(0, n - 320);
}
function drawParts(front) {
  for (const p of R8.parts) {
    const a = Math.max(0, Math.min(1, p.life / p.max * 1.6));
    if (!front) { if (p.k === 'puff') { const w = p.size * (1.6 - p.life / p.max) * 2.4; ctx.globalAlpha = a * 0.5; ctx.drawImage(R8.spr.fumee, p.x - w / 2, p.y - w * 0.2, w, w * 0.4); } continue; }
    if (p.k === 'spark') { const r = p.size * a; ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.fillRect(p.x - r, p.y - p.z - r, r * 2, r * 2); }
    else if (p.k === 'rock') { const z = p.size; ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.fillRect(p.x - z / 2, p.y - p.z - z / 2, z, z * 0.8); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(p.x - z / 2, p.y - p.z + z * 0.12, z, z * 0.18); }
    else if (p.k === 'shard') { const z = p.size, y = p.y - p.z; ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.beginPath(); ctx.moveTo(p.x, y - z); ctx.lineTo(p.x + z * .5, y); ctx.lineTo(p.x, y + z); ctx.lineTo(p.x - z * .5, y); ctx.fill(); }
    else if (p.k === 'note') { ctx.globalAlpha = a * 0.9; note(p.x, p.y, p.col, 0.8); }
  }
  ctx.globalAlpha = 1;
}
// un mot qui s'envole (« −2 », « sonné ! ») : écrit une fois dans une petite image, puis recopié (écrire du texte à chaque image coûte cher)
const MOTS = new Map();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => MOTS.clear());
function mot(txt, col, px) {
  const cle = txt + '|' + col + '|' + px; let sp = MOTS.get(cle); if (sp) return sp;
  if (MOTS.size > 90) vider(MOTS);
  const f = `800 ${px}px Nunito, sans-serif`, m = mk(4, 4).getContext('2d'); m.font = f;
  const w = Math.ceil(m.measureText(txt).width) + 12, h = Math.ceil(px * 1.5) + 8, c = mk(w, h), g = c.getContext('2d');
  g.font = f; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = Math.max(3, px * 0.2); g.strokeStyle = 'rgba(11,16,32,.85)'; g.strokeText(txt, w / 2, h / 2); g.fillStyle = col; g.fillText(txt, w / 2, h / 2);
  sp = { c, w, h }; MOTS.set(cle, sp); return sp;
}

// ----- suivre chaque soldat d'une image à l'autre (marche, face, chute) -----
function trackUnits(dt) {
  const seen = new Set();
  for (const u of s.soldiers) {
    seen.add(u.id);
    let a = R8.anim.get(u.id);
    if (!a) { const dehors = u.x < 0 || u.x > 900 || u.y > 900; a = { x: u.x, y: u.y, phase: Math.random() * 2, yaw: u.x < 330 ? 1 : u.x > 570 ? -1 : dehors ? (u.id % 2 ? 1 : -1) : 0, face: 1, spd: 0, rot: 0, age: 0, flying: false, mx: 0, my: 0, dehors, pose: false }; R8.anim.set(u.id, a); }
    const dx = u.x - a.x, dy = u.y - a.y, d = Math.hypot(dx, dy);
    a.age += dt;
    a.spd = dt > 0 ? d / dt : 0;
    a.flying = Math.hypot(u.vx || 0, u.vy || 0) > s.cfg.flyMin;
    if (a.flying) a.rot += dt * 9 * Math.sign(u.vx || 1); else a.rot *= Math.max(0, 1 - dt * 10);
    const P = GOLEM[u.type], before = Math.floor(a.phase);
    if (!a.flying && u.daze <= 0) a.phase += d / P.pas;
    if (d > 0.05 && !a.flying) {     // de face quand il descend vers nous, tourné à gauche ou à droite sinon
      a.mx += (dx / d - a.mx) * 0.2; a.my += (dy / d - a.my) * 0.2;
      if (Math.abs(a.mx) > 0.5) a.yaw = a.mx > 0 ? 1 : -1; else if (a.my > 0.62 && Math.abs(a.mx) < 0.3) a.yaw = 0; else if (a.my < -0.6 && !a.yaw) a.yaw = u.x < 450 ? 1 : -1;
      a.face = a.yaw || 1;
    }
    if (Math.floor(a.phase) !== before && a.spd > 8 && P.lourd >= 0.5) {     // son pied tape le sol : un peu de poussière (le colosse fait trembler la salle)
      dust(u.x + (Math.floor(a.phase) & 1 ? 1 : -1) * P.bw * 0.22, u.y + P.F, P.bw * 0.2);
      if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.04);
    }
    if (a.dehors && !a.pose && a.age >= 0.45) { a.pose = true; dust(u.x, u.y + P.F, P.bw * 0.5); }   // il retombe de la galerie
    a.x = u.x; a.y = u.y; a.type = u.type;
  }
  for (const [id, a] of R8.anim) if (!seen.has(id)) {
    // il s'effondre en tas de cailloux (et son éclat s'éteint)
    const P = GOLEM[a.type];
    const F = FOOT(a.type);
    burst(a.x, a.y + F, 7 + Math.round(P.bw / 8), { k: 'rock', col: '#373f47', s0: P.bw * 0.12, s1: P.bw * 0.24, z: F });
    burst(a.x, a.y + F, 4 + Math.round(P.bw / 14), { k: 'rock', col: '#8a6c40', s0: P.bw * 0.08, s1: P.bw * 0.16, z: F });
    burst(a.x, a.y + F, 6, { k: 'shard', col: '#ff7a3a', s0: 3, s1: 5, z: F + 6, v0: 80, v1: 220 });
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
    gbFx(e, R8.t);
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
  gbSuivre(t, gdt); trackUnits(gdt); newFx(); tirsAmis(t, gdt); stepParts(gdt);
  if (!paused) cuisson(2.5);
  const { k, ox, oy } = view(), dpr = R8.dpr || (R8.dpr = cv.width / cv.getBoundingClientRect().width || 1), cw = cv.width / dpr, ch = cv.height / dpr; R8.kv = k;
  const popSize = Math.max(22, 13 * dpr / k);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
  const sh = s.shake > 0 && !reduce ? s.shake * 30 : 0;
  ctx.setTransform(k, 0, 0, k, ox + (Math.random() - .5) * sh * k, oy + (Math.random() - .5) * sh * k);
  lumieres(t);
  // la poussière qui flotte dans la lumière
  if (R8.motes.length < 14) R8.motes.push({ x: rnd(0, 900), y: rnd(30, 900), v: rnd(4, 12), p: rnd(0, TAU) });
  ctx.fillStyle = '#c8f6ff'; for (const m of R8.motes) { m.y -= m.v * gdt; m.x += Math.sin(t * 0.6 + m.p) * 4 * gdt; if (m.y < 30) { m.y = 910; m.x = rnd(0, 900); } ctx.globalAlpha = 0.2 + Math.sin(t + m.p) * 0.1; ctx.fillRect(m.x, m.y, 2.4, 2.4); }
  ctx.globalAlpha = 1;
  // l'alerte de la grosse vague
  for (const e of s.fx) if (e.k === 'side') {
    const a = Math.abs(Math.sin(e.life * 6)) * 0.5, g = e.side === 0 ? ctx.createLinearGradient(0, 0, 0, 90) : e.side === 2 ? ctx.createLinearGradient(0, 900, 0, 810) : e.side === 3 ? ctx.createLinearGradient(0, 0, 90, 0) : ctx.createLinearGradient(900, 0, 810, 0);
    g.addColorStop(0, `rgba(255,60,80,${a})`); g.addColorStop(1, 'rgba(255,60,80,0)'); ctx.fillStyle = g; bande(e.side, 90);
  }
  // la colère de Grosbec : les bords de la salle rougissent et battent
  if (s.rage > 0) { const b = Math.min(1, 0.25 + s.rage * 0.12) * (0.6 + 0.4 * Math.max(0, Math.sin(t * 4.5)) ** 4); for (const side of [0, 1, 2, 3]) { const g = side === 0 ? ctx.createLinearGradient(0, 0, 0, 120) : side === 2 ? ctx.createLinearGradient(0, 900, 0, 780) : side === 3 ? ctx.createLinearGradient(0, 0, 120, 0) : ctx.createLinearGradient(900, 0, 780, 0); g.addColorStop(0, `rgba(170,20,40,${b * 0.6})`); g.addColorStop(1, 'rgba(170,20,40,0)'); ctx.fillStyle = g; bande(side, 120); } }
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
  // tout le monde, du fond vers le devant
  const items = [];
  if (s.sage.tx !== null && !brush) { ctx.strokeStyle = 'rgba(255,210,63,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s.sage.tx, s.sage.ty + 20, 16, 7, 0, 0, TAU); ctx.stroke(); }
  items.push({ y: GB.y, d: () => drawGrosbec(t) });
  for (const f of s.friends) items.push({ y: f.y + 28, d: () => drawHero(f, t) });
  items.push({ y: s.sage.y + 28, d: () => drawHero({ ...s.sage, id: 'S', flash: 0, free: false }, t) });
  for (const u of s.soldiers) { const a = R8.anim.get(u.id); if (a) items.push({ y: u.y + FOOT(u.type), d: () => drawGolem(u, a, t) }); }
  for (const w of s.walls) { let my = 0; for (const p of w.pts) my = Math.max(my, p.y); items.push({ y: my - 10, d: () => drawWall(w, t) }); }
  items.sort((a, b) => a.y - b.y).forEach(i => i.d());
  for (const tn of s.tornados || []) drawTornado(tn, t);
  if (G.lv(s, 'pages')) drawOrbitPages(t);
  for (const o of s.owls) drawOwl(o, t);
  // les projectiles
  drawTirs(t);
  for (const p of s.potions) drawPotion(p);
  for (const n of s.notes) drawPartition(n, t);
  for (const b of s.bolts) {
    if (b.arrow) { const an = Math.atan2(b.vy, b.vx); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(an); ctx.strokeStyle = '#7a5130'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(8, 0); ctx.stroke(); ctx.fillStyle = '#c8ccd6'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(6, -3.5); ctx.lineTo(6, 3.5); ctx.fill(); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(-17, -3, 5, 6); ctx.restore(); continue; }
    const br = 4.5 + ((b.dmg || 1) - 1) * 1.6, tl = b.pierce !== undefined && G.lv(s, 'percant') ? 0.07 : 0.03;
    if (s.bolts.length > 36) { ctx.fillStyle = (b.dmg || 1) > 1 ? 'rgba(255,214,120,.55)' : 'rgba(200,245,255,.5)'; const tx = b.x - b.vx * tl * 0.6, ty = b.y - b.vy * tl * 0.6; ctx.fillRect(tx - br * 0.6, ty - br * 0.6, br * 1.2, br * 1.2); ctx.fillStyle = (b.dmg || 1) > 1 ? '#fff3c4' : '#ffffff'; ctx.fillRect(b.x - br, b.y - br, br * 2, br * 2); continue; }
    ctx.globalAlpha = 0.8; ctx.drawImage(R8.spr.glowCyan, b.x - 15, b.y - 15, 30, 30); ctx.globalAlpha = 1;
    ctx.strokeStyle = (b.dmg || 1) > 1 ? 'rgba(255,214,120,.6)' : 'rgba(200,245,255,.5)'; ctx.lineWidth = br; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * tl, b.y - b.vy * tl); ctx.stroke();
    ctx.fillStyle = (b.dmg || 1) > 1 ? '#fff3c4' : '#ffffff'; ctx.beginPath(); ctx.arc(b.x, b.y, br, 0, TAU); ctx.fill();
  }
  if (s.stones.length) { const sp = Golems.eclat(), w = sp.w * 0.62, h = sp.h * 0.62;
    for (const p of s.stones) {
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 20, 6, 2.5, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.75; ctx.drawImage(p.back ? R8.spr.glowGold : R8.spr.glowFire, p.x - 17, p.y - 17, 34, 34); ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2); ctx.drawImage(sp.c, -w / 2, -h / 2, w, h); ctx.restore();
    }
  }
  // les effets des runes
  let lueurs = 0;
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
    if (e.k === 'burst') { ctx.globalAlpha = a; if (lueurs++ < 10) ctx.drawImage(R8.spr.glowCyan, e.x - e.R, e.y - e.R, e.R * 2, e.R * 2); ctx.fillStyle = `rgba(255,255,255,${a * .7})`; ctx.beginPath(); ctx.arc(e.x, e.y, e.R * 0.35 * (1.3 - a), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    if (e.k === 'splash') { ctx.fillStyle = `rgba(155,93,229,${a * .45})`; ctx.beginPath(); ctx.ellipse(e.x, e.y, 75 * (1.2 - a * .4), 50 * (1.2 - a * .4), 0, 0, TAU); ctx.fill(); }
    if (e.k === 'free') { ctx.strokeStyle = `rgba(255,210,63,${a})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(e.x, e.y, 30 + (1 - a) * 140, (30 + (1 - a) * 140) * 0.5, 0, 0, TAU); ctx.stroke(); }
    if (e.k === 'slash') { ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(-0.6 + (1 - a) * 1.8); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 5 * a + 1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 26, -1.1, 1.1); ctx.stroke(); ctx.restore(); }
    if (e.k === 'fireball') { const R = 85 * (1.15 - a * 0.5); ctx.globalAlpha = a; if (lueurs++ < 10) ctx.drawImage(e.stone ? R8.spr.glowGold : R8.spr.glowFire, e.x - R * 1.4, e.y - R * 1.4, R * 2.8, R * 2.8); ctx.fillStyle = e.stone ? `rgba(255,236,170,${a * .6})` : `rgba(255,200,90,${a * .7})`; ctx.beginPath(); ctx.arc(e.x, e.y, R * 0.45 * (1.4 - a), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    if (e.k === 'sky') { ctx.globalAlpha = a; const pts = [{ x: e.x + 30, y: e.y - 420 }, { x: e.x - 20, y: e.y - 300 }, { x: e.x + 25, y: e.y - 170 }, { x: e.x - 10, y: e.y - 70 }, { x: e.x, y: e.y }]; zigzag(pts, '#ffffff', 4, 14); zigzag(pts, 'rgba(140,200,255,.6)', 12, 14); ctx.globalAlpha = 1; }
    if (e.k === 'pulse') { ctx.save(); ctx.translate(450, 445); ctx.scale(1, 0.75); ctx.strokeStyle = `rgba(255,229,138,${a})`; ctx.lineWidth = 14 * a + 2; ctx.beginPath(); ctx.arc(0, 0, e.R * (1.25 - a * 0.6), 0, TAU); ctx.stroke(); ctx.restore(); }
    if (e.k === 'mirror') { ctx.save(); ctx.translate(450, 445); ctx.strokeStyle = `rgba(199,125,255,${a * 0.6})`; ctx.lineWidth = 3; for (let i = 0; i < Math.max(2, e.n + 1); i++) { ctx.rotate(TAU / Math.max(2, e.n + 1)); ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(80 + (1 - a) * 260, 0); ctx.stroke(); } ctx.restore(); }
    if (e.k === 'echo') { ctx.strokeStyle = `rgba(111,227,255,${a * 0.7})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(s.sage.x, s.sage.y, 30 + (1 - a) * 60, 0, TAU); ctx.stroke(); }
    if (e.k === 'strike') { ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowGold, e.x - 120, e.y - 120, 240, 240); ctx.globalAlpha = 1; }
    if (e.k === 'pop2') { if (lueurs++ < 10) { const R = e.big ? 75 : 50; ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowGold, e.x - R, e.y - R * 0.72, R * 2, R * 2); ctx.globalAlpha = 1; } }
    if (e.k === 'ice') { ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#9fefff'; ctx.beginPath(); e.poly.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
  }
  drawParts(true);
  { const px = Math.max(8, Math.round(popSize * k)); for (const e of s.fx) if (e.k === 'pop') { const a = Math.max(0, e.life / e.max), sp = mot(e.t, e.col, px), w = sp.w / k, h = sp.h / k, x = Math.max(70, Math.min(830, e.x)), y = Math.max(30, e.y - 30 - (1 - a) * 26); ctx.globalAlpha = Math.min(1, a * 2); ctx.drawImage(sp.c, x - w / 2, y - popSize * 0.35 - h / 2, w, h); } ctx.globalAlpha = 1; }
  if (GB.mots) { const u = t - GB.mots.t0; if (u > 1.5) GB.mots = null; else { const p = gbPoint('tete'); ctx.globalAlpha = Math.min(1, (1.5 - u) * 3, u * 8); ctx.font = `900 ${popSize}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(11,16,32,.9)'; const y = Math.max(-TOP + popSize, p.y - 34 - u * 8); ctx.strokeText(GB.mots.txt, GB.x, y); ctx.fillStyle = '#ffd0d6'; ctx.fillText(GB.mots.txt, GB.x, y); ctx.globalAlpha = 1; } }
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
  if (s.rage > 0) { yy += chip + 6; const lab3 = s.rage >= 3 ? '💢 FUREUR de Grosbec' : s.rage === 2 ? '💢 Grosbec est fou de rage' : '💢 Grosbec est en colère'; ctx.font = `800 ${fs}px Nunito, sans-serif`; const w3 = ctx.measureText(lab3).width + 20; rr(8, yy, w3, chip, 8); ctx.fillStyle = 'rgba(110,14,30,.9)'; ctx.fill(); text(lab3, 18, yy + chip / 2 + fs / 2 - 2, fs, '#ffd0d6', 'left', 800); R8.hudBottom = yy + chip; }
}

// une bande au bord de la salle (0 le haut, 1 la droite, 2 le bas, 3 la gauche) : on ne repeint que là où ça se voit
function bande(side, w) { side === 0 ? ctx.fillRect(0, 0, 900, w) : side === 2 ? ctx.fillRect(0, 900 - w, 900, w) : side === 3 ? ctx.fillRect(0, 0, w, 900) : ctx.fillRect(900 - w, 0, w, 900); }
// les lumières calmes de la salle, juste après le fond : les rigoles d'or et le tour de la rosace, les lanternes, le rouge des forges
function lumieres(t) {
  const pul = 0.5 + 0.5 * Math.sin(t * 2.4);
  ctx.fillStyle = `rgba(255,224,138,${0.06 + 0.2 * pul})`; ctx.fillRect(450 - 62 - 1.5, 118, 3, 251); ctx.fillRect(450 + 62 - 1.5, 118, 3, 251);
  ctx.globalAlpha = 0.22 + 0.2 * pul; for (const L of R8.lampes) ctx.drawImage(R8.spr.glowGold, L.x - 30, L.y - 30, 60, 60);
  ctx.globalAlpha = 0.2 + 0.12 * Math.sin(t * 5.1); for (const [a, b] of G.PORTES) ctx.drawImage(R8.spr.glowFire, (a + b) / 2 - 80, -40, 160, 96);
  ctx.globalAlpha = 1;
}
