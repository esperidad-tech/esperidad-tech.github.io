# Version 27 [Romain, 26 nov., 20 h 03 : « Est-ce que tu peux m'intégrer les 3 cartes dorées ? » — le chantier 8 de la Bible (§ 18.11), pour le Sage ;
#  les trois runes dorées du Sage (§ 18.6) : le triangle (repousse tous les ennemis jusqu'au mur), la lune (aveugle tous les ennemis), l'étoile (tue tous les ennemis).
#  Une seule fois par combat ; pour l'essai, toutes offertes (elles seront à trouver dans les enquêtes).]
# Fabrique logic27.js à partir de logic26.js.
import os
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic26.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)

# ---------- l'état : les trois runes dorées, offertes pour l'essai ----------
rep("announced: [], entered: [], zones: [], vu: {}, cages: [], traces: [], allies: [],", "announced: [], entered: [], zones: [], vu: {}, cages: [], traces: [], allies: [], dorees: { triangle: true, lune: true, etoile: true },")

# ---------- reconnaître les trois formes dorées (des tracés fermés) ----------
rep("  function recognize(pts) {", """  // version 27 : un tracé fermé est-il un triangle, une lune ou une étoile ?
  // On compte les coins (les virages secs) et on regarde si le tracé se creuse (la lune a un côté rentrant).
  function formeDoree(pts) {
    const ferme = [...pts, pts[0]], L = pathLen(ferme); if (L < 150) return null;
    const N = 72, P = resample(ferme, L / N).slice(0, N); if (P.length < 30) return null;
    const n = P.length, ang = (u, v) => { let d = Math.atan2(v.y, v.x) - Math.atan2(u.y, u.x); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
    const pas = []; for (let i = 0; i < n; i++) { const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n]; pas.push(ang({ x: b.x - a.x, y: b.y - a.y }, { x: c.x - b.x, y: c.y - b.y })); }
    const tot = pas.reduce((x, y) => x + y, 0), sg = Math.sign(tot) || 1;
    // le côté rentrant : les virages dans l'autre sens, sur un tracé un peu lissé
    let creux = 0; for (let i = 0; i < n; i++) { let m = 0; for (let k = -2; k <= 2; k++) m += pas[(i + k + n) % n]; m /= 5; if (m * sg < 0) creux += -m * sg; }
    const k = 3, vir = []; for (let i = 0; i < n; i++) { const a = P[(i - k + n) % n], b = P[i], c = P[(i + k) % n]; vir.push(ang({ x: b.x - a.x, y: b.y - a.y }, { x: c.x - b.x, y: c.y - b.y })); }
    const coins = []; for (let i = 0; i < n; i++) { const v = Math.abs(vir[i]); if (v < 1.1) continue; let max = true; for (let d = -4; d <= 4; d++) if (d && Math.abs(vir[(i + d + n) % n]) > v) max = false; if (max && !coins.some(j => Math.min(Math.abs(j - i), n - Math.abs(j - i)) < 5)) coins.push(i); }
    const c = coins.length, T = Math.abs(tot);
    if (T > 3 * Math.PI && c >= 4 && c <= 6) return 'etoile';
    if (creux > 1.2 && c >= 1 && c <= 3 && T < 3 * Math.PI) return 'lune';
    if (c === 3 && creux < 0.8 && T < 3 * Math.PI) return 'triangle';
    return null;
  }
  function recognize(pts) {""")
rep("    if (T > 3 * Math.PI) return { kind: 'spirale', x: (x0 + x1) / 2, y: (y0 + y1) / 2 };", """    if (chord < 0.4 * diag) { const f = formeDoree(pts); if (f) return { kind: 'ferme', poly: pts, forme: f }; }
    if (T > 3 * Math.PI) return { kind: 'spirale', x: (x0 + x1) / 2, y: (y0 + y1) / 2 };""")

# ---------- graver une rune dorée ----------
rep("    if (rune.kind === 'ferme') {\n      const P = rune.poly || [];", """    if (rune.kind === 'ferme' && rune.forme) {
      if (s.dorees && s.dorees[rune.forme]) return castDoree(s, rune.forme);
      say(s, `${NOMD[rune.forme]} : déjà utilisée dans ce combat.`); return { ok: false };
    }
    if (rune.kind === 'ferme') {
      const P = rune.poly || [];""")
rep("  // version 26, la rune de la cage : un cercle loin des amis enferme les golems\n", """  // version 27, les runes dorées du Sage : une fois par combat chacune, gratuites
  const NOMD = { triangle: 'Le triangle d’or', lune: 'La lune d’or', etoile: 'L’étoile d’or' };
  function castDoree(s, f) {
    if (s.sage.sonne > 0) { say(s, 'Le Sage est sonné ! Attends une seconde.'); return { ok: false }; }
    s.dorees[f] = false; s.runes++; s.brushT = 0; runeGravee(s); s.doreesUsees = (s.doreesUsees || 0) + 1;
    const C = { x: 450, y: 445 }, vivants = s.soldiers.filter(u => u.hp > 0); let n = 0;
    if (f === 'triangle') {   // tous contre les murs : ils prennent des dégâts en heurtant le mur
      for (const u of vivants) { const dx = u.x - C.x, dy = u.y - C.y, d = Math.hypot(dx, dy) || 1; u.vx = dx / d * 1500; u.vy = dy / d * 1500; u.daze = 0; u.cage = null; u.mur = 5; n++; }
      s.shake = Math.max(s.shake, 0.5); say(s, 'Le triangle d’or ! Tous contre les murs !', 2.5);
    } else if (f === 'lune') {   // aveuglés : ils errent sans frapper
      for (const u of vivants) { u.aveugle = s.cfg.luneT; u.blindA = rng(s) * 6.28; n++; }
      say(s, 'La lune d’or ! Les golems ne voient plus rien.', 2.5);
    } else {   // l'étoile : plus un seul golem
      const k0 = s.kills, o = s.noInk; s.noInk = true;
      for (const u of vivants) { u.hp = 0; die(s, u); n++; }
      s.noInk = o; s.soldiers = s.soldiers.filter(u => u.hp > 0); s.stones = [];
      s.shake = Math.max(s.shake, 0.6); say(s, 'L’étoile d’or ! Plus un seul golem !', 2.5);
    }
    s.fx.push({ k: 'doree', f, life: 1.2, max: 1.2 });
    return { ok: true, hit: n, killed: f === 'etoile' ? n : 0 };
  }
  // version 26, la rune de la cage : un cercle loin des amis enferme les golems
""")
rep("  Object.assign(CFG, { slowMax: 1e9, cageCost: 3 });", "  Object.assign(CFG, { slowMax: 1e9, cageCost: 3, luneT: 6 });")

# ---------- les golems : le mur qui fait mal (triangle), l'aveuglement (lune) ----------
rep("        if (fl && !u.spin) stun(s, u);", "        if (fl && !u.spin) stun(s, u);\n        if (u.mur) { hurt(s, u, u.mur); u.mur = 0; }")
rep("      if (fl || u.held || u.spin) continue;", """      if (!fl) u.mur = 0;
      if (fl || u.held || u.spin) continue;
      if (u.aveugle > 0) {   // la lune d'or : il erre au hasard, sans frapper
        u.aveugle -= dt; u.blindA += (rng(s) - 0.5) * 5 * dt; const v = TYPES[u.type].speed * 0.45 * dt; u.x += Math.cos(u.blindA) * v; u.y += Math.sin(u.blindA) * v;
        if (u.x < u.r + 5 || u.x > W - u.r - 5 || u.y < u.r + 5 || u.y > H - u.r - 5) { u.blindA += Math.PI; u.x = Math.max(u.r + 5, Math.min(W - u.r - 5, u.x)); u.y = Math.max(u.r + 5, Math.min(H - u.r - 5, u.y)); }
        continue;
      }""")
rep("turnRune, hint, avance, dansZone };", "turnRune, hint, avance, dansZone, formeDoree, NOMD };")
open(os.path.join(base, 'logic27.js'), 'w').write(s)
print('logic27.js écrit :', len(s), 'caractères')
