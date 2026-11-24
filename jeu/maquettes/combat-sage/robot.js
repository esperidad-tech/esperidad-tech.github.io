const G = require('./logic16.js');
const A = Object.fromEntries(process.argv.slice(2).map(a => a.split('=')));
const N = +(A.games || 16), cfg = A.cfg ? JSON.parse(A.cfg) : {}, THINK = +(A.think || 3);
const C = { x: 450, y: 445 };
const circle = (x, y, r) => { const p = []; for (let i = 0; i <= 42; i++) { const a = i / 40 * 6.283; p.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r }); } return p; };
const spiral = (x, y) => { const p = []; for (let i = 0; i <= 100; i++) { const a = i / 40 * 6.283, rr = 8 + i * 0.7; p.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr }); } return p; };
const veeOld = (x, y, dir) => { const nx = -dir[1], ny = dir[0], b = { x: x - dir[0] * 50, y: y - dir[1] * 50 }; const a1 = { x: b.x + nx * 50, y: b.y + ny * 50 }, a2 = { x: b.x - nx * 50, y: b.y - ny * 50 }, tip = { x: x + dir[0] * 30, y: y + dir[1] * 30 }; const p = []; for (let i = 0; i <= 10; i++) p.push({ x: a1.x + (tip.x - a1.x) * i / 10, y: a1.y + (tip.y - a1.y) * i / 10 }); for (let i = 1; i <= 10; i++) p.push({ x: tip.x + (a2.x - tip.x) * i / 10, y: tip.y + (a2.y - tip.y) * i / 10 }); return p; };
const vee = (x, y, dir) => { // pointe côté amis, ouverture vers l'extérieur
  const tip = { x: x - dir[0] * 90, y: y - dir[1] * 90 }, nx = -dir[1], ny = dir[0], L = 260, h = Math.tan(40 * Math.PI / 180) * L;
  const e1 = { x: tip.x + dir[0] * L + nx * h, y: tip.y + dir[1] * L + ny * h }, e2 = { x: tip.x + dir[0] * L - nx * h, y: tip.y + dir[1] * L - ny * h };
  const p = []; for (let i = 0; i <= 12; i++) p.push({ x: e1.x + (tip.x - e1.x) * i / 12, y: e1.y + (tip.y - e1.y) * i / 12 }); for (let i = 1; i <= 12; i++) p.push({ x: tip.x + (e2.x - tip.x) * i / 12, y: tip.y + (e2.y - tip.y) * i / 12 }); return p; };
const zigOld = (cx, cy, dir) => { const nx = -dir[1], ny = dir[0], p = []; for (let i = 0; i <= 6; i++) { const t = (i / 6 - 0.5) * 300, o = i % 2 ? 26 : -26; p.push({ x: cx + nx * t + dir[0] * o, y: cy + ny * t + dir[1] * o }); } let out = []; for (let i = 0; i < p.length - 1; i++) for (let k = 0; k < 8; k++) out.push({ x: p[i].x + (p[i + 1].x - p[i].x) * k / 8, y: p[i].y + (p[i + 1].y - p[i].y) * k / 8 }); out.push(p[p.length - 1]); return out; };
const inTriB = (p, a, b, c, m) => { const side = (p1, p2) => { const ex = p2.x - p1.x, ey = p2.y - p1.y, L = Math.hypot(ex, ey) || 1; return ((p.x - p1.x) * ey - (p.y - p1.y) * ex) / L; }; const d1 = side(a, b), d2 = side(b, c), d3 = side(c, a), sg = Math.sign(d1 + d2 + d3) || 1; return d1 * sg > -m && d2 * sg > -m && d3 * sg > -m; };
const zig = (cx, cy, dir) => { // un arc autour des amis, face au groupe qui arrive
  const base = Math.atan2(dir[1], dir[0]), p = []; for (let i = 0; i <= 30; i++) { const a = base + (-55 + 110 * i / 30) * Math.PI / 180; p.push({ x: C.x + Math.cos(a) * 175, y: C.y + Math.sin(a) * 175 }); } return p; };
function castPts(s, pts) { const r = G.recognize(pts); if (!r.kind) return null; if (G.costOf(s, r) > s.ink) return null; return G.cast(s, r); }
function bestLine(s) {
  let best = null, bh = 0;
  for (const u of s.soldiers) for (const v of s.soldiers) {
    if (u === v || G.dist(u, v) > 420) continue;
    const dx = v.x - u.x, dy = v.y - u.y, d = Math.hypot(dx, dy) || 1;
    const a = { x: u.x - dx / d * 30, y: u.y - dy / d * 30 }, b = { x: v.x + dx / d * 30, y: v.y + dy / d * 30 }, L = d + 60;
    let h = 0; for (const w of s.soldiers) { const t = Math.max(0, Math.min(1, ((w.x - a.x) * (b.x - a.x) + (w.y - a.y) * (b.y - a.y)) / (L * L))); if (Math.hypot(w.x - (a.x + (b.x - a.x) * t), w.y - (a.y + (b.y - a.y) * t)) < w.r + 28) h += w.daze > 0 ? 3 : (G.dist(w, C) < 200 ? 1.2 : 0.6); }
    if (h > bh) { bh = h; best = [a, b]; }
  }
  return best && { pts: [best[0], { x: (best[0].x + best[1].x) / 2, y: (best[0].y + best[1].y) / 2 }, best[1]], h: bh };
}
function play(seed, mode) {
  const s = G.newGame({ seed, cfg }); let think = 1, typed = {}; s.minP = 99;
  if (A.build) for (const part of A.build.split(',')) { const [id, l] = part.split(':'); const add = cid => { for (let i = G.lv(s, cid); i < +(l || 1); i++) { s.choice = { cards: [cid] }; G.choose(s, cid); } }; if (G.CARDS[id].of) G.CARDS[id].of.forEach(c => { if (G.lv(s, c) < 2) { s.choice = { cards: [c] }; G.choose(s, c); s.choice = { cards: [c] }; G.choose(s, c); } }); add(id); }
  s.msg = '';
  if (A.extra) { // des cartes en plus, au hasard (comme un joueur qui a déjà ramassé des pages)
    for (let i = 0; i < +A.extra; i++) { const pool = G.cardPool(s).filter(id => G.CARDS[id].fam !== 'combo' && id !== 'soin'); if (!pool.length) break; const id = pool[Math.floor(Math.random() * pool.length)]; s.choice = { cards: [id] }; G.choose(s, id); }
  }
  if (A.at) { s.realT = s.t = +A.at; s.pageIdx = 10; s.pageNeed = 16; s.burstT = 5; }
  s.t0 = s.realT; s.k0 = s.kills; s.minP2 = 99; s.msg = '';
  while (!s.over && s.realT < +(A.limit || 960)) {
    const dt = 1 / 60;
    if (mode !== 'passive') {
      const sg = s.sage;
      let tg = null, bd = 1e9; for (const u of s.soldiers) { const d = G.dist(u, C); if (d < bd) { bd = d; tg = u; } }
      let sh = null, sd = 1e9; for (const p of s.shards) { const d = G.dist(p, sg); if (d < sd) { sd = d; sh = p; } }
      let pg = null, pd = 1e9; for (const p of s.pages) { const d = G.dist(p, sg); if (d < pd) { pd = d; pg = p; } }
      if (s.choice) { const c = s.choice.cards, gold = c.filter(id => G.CARDS[id].fam === 'combo'); G.choose(s, gold.length && Math.random() < 0.8 ? gold[0] : c[Math.floor(Math.random() * c.length)]); s.cards = (s.cards || 0) + 1; }
      if (mode === 'cercle' && !pg) { const an = s.realT * 1.9; sg.tx = C.x + Math.cos(an) * 165; sg.ty = C.y + Math.sin(an) * 150; }
      else if (pg && !(tg && bd < 120)) { sg.tx = pg.x; sg.ty = pg.y; } else if (tg && bd < 220) { sg.tx = tg.x; sg.ty = tg.y; } else if (sh && s.ink < s.cfg.inkMax) { sg.tx = sh.x; sg.ty = sh.y; } else if (tg) { sg.tx = (tg.x + C.x) / 2; sg.ty = (tg.y + C.y) / 2; } else sg.tx = sg.ty = null;
      for (const id of s.announced) { typed[id] = typed[id] ?? s.realT + 5; if (s.realT >= typed[id] && !s.entered.includes(id)) G.enterCode(s, G.CODES[id]); }
      think -= dt;
      if (mode !== 'runner' && think <= 0) {
        think = THINK;
        if (s.heart.bare) castPts(s, circle(G.HEART.x, G.HEART.y, 90));
        else {
          const near = s.soldiers.filter(u => G.dist(u, C) < 200);
          const dazed = s.soldiers.filter(u => u.daze > 0.4).length;
          if (mode === 'repousse') { if (near.length >= 3) castPts(s, spiral(C.x, C.y)); }
          else if (mode === 'traits') { const l = bestLine(s); if (l && l.h >= 2.4) castPts(s, l.pts); }
          else { // combos : d'abord projeter (V vers le bord le plus proche, ou repousse), puis couper les sonnés
            const l = bestLine(s);
            if (dazed >= 3 && l && l.h >= 6) castPts(s, l.pts);
            else if (near.length >= 7 && s.ink >= Math.max(4, G.costOf(s, { kind: "spirale" }))) castPts(s, spiral(C.x, C.y));
            else if ((mode === 'combos' || mode === 'cercle') && s.ink >= 4) {
              const far = s.soldiers.filter(u => { const d = G.dist(u, C); return d > 230 && d < 420; });
              let bx = 0, by = 0; for (const u of far) { bx += u.x - C.x; by += u.y - C.y; }
              const bl = Math.hypot(bx, by);
              if (far.length >= 5 && bl > far.length * 150 && !s.walls.length) castPts(s, zig(C.x + bx / bl * 175, C.y + by / bl * 175, [bx / bl, by / bl]));
              else if (near.length >= 2) {
                let bestV = null, bn = 1;
                for (const g of near) { const dx = g.x - C.x, dy = g.y - C.y, d = Math.hypot(dx, dy) || 1, pts = vee(g.x, g.y, [dx / d, dy / d]), r = G.recognize(pts); if (r.kind !== 'poussee') continue; const n = s.soldiers.filter(u => inTriB(u, r.tip, r.a, r.b, u.r)).length; if (n > bn) { bn = n; bestV = pts; } }
                if (bestV) castPts(s, bestV); else if (l && l.h >= 2.4) castPts(s, l.pts);
              }
              else if (l && l.h >= 2.4) castPts(s, l.pts);
            }
            else if (near.length >= 2 && s.ink >= 3) { const g = near[0]; const dx = g.x - C.x, dy = g.y - C.y, d = Math.hypot(dx, dy) || 1; castPts(s, vee(g.x, g.y, [dx / d, dy / d])); }
            else if (l && l.h >= 2.4) castPts(s, l.pts);
          }
        }
      }
    }
    G.step(s, dt, false); s.minP = Math.min(s.minP, s.protection); if (s.realT - s.t0 < 120) s.minP2 = Math.min(s.minP2, s.protection);
  }
  return s;
}
for (const mode of (A.modes ? A.modes.split(',') : ['combos'])) {
  const held = [], kpm = [], mp2 = []; let best = 0;
  for (let g = 0; g < N; g++) { const s = play(10 + g, mode); const dur = s.realT - s.t0; held.push(dur); kpm.push((s.kills - s.k0) / Math.max(dur / 60, 0.1)); mp2.push(s.minP2); best = Math.max(best, s.bestCombo); }
  const mm = x => `${Math.floor(x / 60)}:${String(Math.round(x % 60)).padStart(2, '0')}`, med = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log(JSON.stringify({ label: A.label || mode, held: held.map(Math.round), heldMed: Math.round(med(held)), heldTxt: held.sort((a, b) => a - b).map(mm).join(' '), kpm: Math.round(med(kpm)), best, minP2: med(mp2) }));
}
