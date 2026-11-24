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
