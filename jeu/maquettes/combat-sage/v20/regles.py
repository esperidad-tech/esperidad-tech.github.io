# Version 20 [Romain, 25 nov., 19 h 05 : « Vas-y, go, juste mets pas le voleur. […] le tambour, je suis pas sûr […] s'il faut un petit peu éviter des choses, ça peut être déjà intéressant »]
# Fabrique logic20.js à partir de logic19.js :
#  - le chronomètre et tout ce qui durcit suivent le temps du COMBAT (plus la vraie horloge) ; le ralenti dure 2 s au plus par rune ;
#  - les runes comme avant (version 18) : le trait fait éclater les sonnés, une rune qui détruit redonne de l'encre, un petit golem sur huit ;
#  - le rouge : Grosbec attaque le Sage (poing, balayage, braises) ; le rouge blesse les golems, sonne le Sage (il lâche son encre) et touche les amis ;
#  - trois golems nouveaux : le porte-dalle, le mortier, le porteur de bombe ; et le bélier défonce les murs.
import os, re
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic19.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)

# ---------- les réglages ----------
rep("  const GROS = ['brute', 'costaud'];", """  // ----- version 20 -----
  Object.assign(CFG, {
    shardEvery: 8, shatterPart: 1, slowMax: 2, hpLateEvery: 50,
    gbFirst: 50, gbEveryDebut: 24, gbDebutT: 180, gbEvery: 15, gbEveryRage: 10, gbSuit: 0.7, poingR: 95, poingT: 1.6, bandeH: 70, bandeT: 1.8, braiseR: 58, braiseN: 5, braiseT: 1.5,
    sonneT: 2, sonneSpeed: 0.45,
    dalleAt: 70, dalleCoups: 8, bombeAt: 150, bombeR: 95, bombeD: 4, mortierAt: 100, mortierEvery: 22, mortierLoin: 405, obusR: 72, obusT: 1.6, obusSuit: 0.5
  });
  const MOTS = { dalle: 'Un porte-dalle ! Sa dalle arrête tes orbes : prends-le de côté, ou chasse-le.', mortier: 'Un mortier, tout au fond ! Il te vise. Va le chercher.', bombe: 'Un porteur de bombe ! Fais-le sauter loin de tes amis.' };
  const GROS = ['brute', 'costaud'];""")
rep("    lanceur: { r: 16, hp: 2, speed: 60, dmg: 1, rate: 2.4, shards: 1, range: 240 }\n  };", """    lanceur: { r: 16, hp: 2, speed: 60, dmg: 1, rate: 2.4, shards: 1, range: 240 },
    dalle: { r: 20, hp: 6, speed: 46, dmg: 1, rate: 1.0, shards: 1 },
    mortier: { r: 20, hp: 5, speed: 42, dmg: 0, rate: 4.5, shards: 1, encre: true },
    bombe: { r: 15, hp: 3, speed: 88, dmg: 3, rate: 1, shards: 1 }
  };""")

# ---------- le temps : tout suit le temps du combat ----------
rep("    const dt = dtReal * (brush ? s.cfg.slow : 1);\n    s.t += dt; s.realT += dtReal;", """    // le ralenti de la gravure : 2 secondes au plus par rune, puis le temps reprend
    if (brush) s.brushT = (s.brushT || 0) + dtReal; else s.brushT = 0;
    s.lent = brush && s.brushT <= s.cfg.slowMax;
    const dt = dtReal * (s.lent ? s.cfg.slow : 1);
    s.t += dt; s.vraiT = (s.vraiT || 0) + dtReal; s.bombN = 0;""")
s = s.replace('s.realT', 's.t')          # le chronomètre, les vies, les côtés, la colère : le temps du combat
s = s.replace('s.vraiT', 's.realT')      # (la vraie horloge reste comptée, pour les mesures)
rep("s.over = 'win'; s.heart.bare = true; s.soldiers = []; s.stones = []; s.bolts = [];", "s.over = 'win'; s.heart.bare = true; s.soldiers = []; s.stones = []; s.bolts = []; s.zones = [];")
rep("announced: [], entered: [],", "announced: [], entered: [], zones: [], vu: {},")

# ---------- les golems nouveaux ----------
rep("    const t = s.t, r = rng(s);\n", """    const t = s.t, r = rng(s);
    if (t > s.cfg.bombeAt && r > 0.93) return 'bombe';
    if (t > s.cfg.dalleAt && r > 0.83 && r <= 0.93) return 'dalle';
""")
rep("burnTick: 0, held: false, fear: 0, dance: 0, charmCd: 0, iron });", """burnTick: 0, held: false, fear: 0, dance: 0, charmCd: 0, iron, dalle: type === 'dalle' });
    if (MOTS[type] && !s.vu[type]) { s.vu[type] = 1; say(s, MOTS[type], 4); }""")
rep("    s.spawnT -= dt;\n", """    s.spawnT -= dt;
    // le mortier : un seul d'abord, deux après 5 minutes, trois quand Grosbec est en colère
    if (s.t > c.mortierAt) { s.mortT = (s.mortT ?? 0) - dt; if (s.mortT <= 0) { s.mortT = c.mortierEvery; const max = 1 + (s.t > 300 ? 1 : 0) + (s.rage > 0 ? 1 : 0); if (s.soldiers.filter(u => u.type === 'mortier' && u.hp > 0).length < max) spawn(s, 'mortier'); } }
""")

# ---------- l'encre et le trait, comme en version 18 ----------
rep("const sansEncre = (s, f) => { const o = s.noInk; s.noInk = true; try { return f(); } finally { s.noInk = o; } };", "const sansEncre = (s, f) => f();   // version 20 : une rune qui détruit redonne de l'encre, comme avant")
rep("if (!gros && s.cfg.shardEvery > 1) {", "if (!gros && !TYPES[u.type].encre && s.cfg.shardEvery > 1) {")
rep("      if (gros) n += lv(s, 'moisson');\n", "      if (gros) n += lv(s, 'moisson');\n      if (s.inRune && s.runeKills >= 3) n += 1;   // une rune sur un gros groupe se rembourse (version 18)\n")
rep("    if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.25);\n", "    if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.25);\n    if (u.type === 'bombe') explose(s, u);\n")
rep("les golems sont sonnés, les sonnés perdent la moitié de leur vie.'", "les golems sont sonnés, les sonnés éclatent.'")
rep("    if (u.iron) return;\n    if (u.daze < 0.5)", "    if (u.iron) return;\n    if (u.dalle) lacher(s, u);\n    if (u.daze < 0.5)")

# ---------- le rouge ----------
rep("  // ----- dégâts -----\n", """  // ----- version 20 : le rouge (Grosbec, le mortier, la bombe) -----
  const dansZone = (z, p, m = 0) => z.k === 'bande' ? (z.horiz ? Math.abs(p.y - z.y) : Math.abs(p.x - z.x)) < z.half + m : Math.hypot(p.x - z.x, p.y - z.y) < z.r + m;
  function lacher(s, u, mot) { u.dalle = false; s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 22, t: mot || 'dalle tombée !', life: 0.8, max: 0.8, col: '#ffe58a' }); }
  // le Sage touché : sonné 2 secondes (il ne tire plus, ne grave plus, marche au ralenti) et son encre tombe autour de lui
  function sonner(s) {
    const sg = s.sage; if (sg.invul > 0) return;
    sg.sonne = s.cfg.sonneT; sg.invul = s.cfg.sonneT + 1.2; s.sonnes = (s.sonnes || 0) + 1;
    s.fx.push({ k: 'pop', x: sg.x, y: sg.y - 40, t: 'sonné !', life: 0.9, max: 0.9, col: '#ff4d5e' }, { k: 'sonne', x: sg.x, y: sg.y, life: 0.2, max: 0.2 }); s.shake = Math.max(s.shake, 0.25);
    const n = s.ink; s.ink = 0;
    for (let i = 0; i < n; i++) { const a = rng(s) * 6.28, d = 70 + rng(s) * 70; s.shards.push({ x: Math.max(20, Math.min(W - 20, sg.x + Math.cos(a) * d)), y: Math.max(60, Math.min(H - 20, sg.y + Math.sin(a) * d)), t: rng(s) * 6, lock: 0.9 }); }
    if (!s.vu.sonne) { s.vu.sonne = 1; say(s, 'Aïe ! Le Sage est sonné, et son encre est tombée. Ramasse-la !', 3); }
  }
  // le rouge frappe : les golems, le Sage, et les amis s'ils sont dedans
  function frappe(s, z) {
    s.fx.push({ k: 'frappe', z, life: 0.45, max: 0.45 }); s.shake = Math.max(s.shake, z.k === 'poing' ? 0.35 : 0.2);
    for (const u of [...s.soldiers]) if (u.hp > 0 && dansZone(z, u, u.r * 0.5)) { hurt(s, u, z.dmg); s.rougeKills = (s.rougeKills || 0) + (u.hp <= 0 ? 1 : 0); if (z.k === 'poing' && u.hp > 0) stun(s, u); }
    if (dansZone(z, s.sage)) sonner(s);
    const f = targets(s).find(f => dansZone(z, f, f.r * 0.5));
    if (f) { hit(s, f, z.amis); s.rougeAmis = (s.rougeAmis || 0) + z.amis; if (!s.vu.amis) { s.vu.amis = 1; say(s, 'Le rouge a touché tes amis ! Emmène-le loin d’eux.', 3.5); } }
  }
  function zones(s, dt) {
    const sg = s.sage;
    for (const z of s.zones) {
      if (z.suit > 0) { z.suit -= dt; z.x = Math.max(30, Math.min(W - 30, sg.x + (z.ox || 0))); z.y = Math.max(70, Math.min(H - 30, sg.y + (z.oy || 0))); }   // le rouge suit le Sage un instant, puis se fige
      z.t -= dt;
      if (z.t <= 0) { frappe(s, z); if (s.over) return; }
    }
    s.zones = s.zones.filter(z => z.t > 0);
  }
  // Grosbec attaque le Sage : le poing, le balayage, la pluie de braises
  function grosbec(s, dt) {
    if (s.heart.bare) return;
    const c = s.cfg;
    s.gbT = (s.gbT ?? c.gbFirst) - dt;
    if (s.gbT > 0) return;
    s.gbT = (s.rage > 0 ? c.gbEveryRage : s.t < c.gbDebutT ? c.gbEveryDebut : c.gbEvery) * (0.8 + rng(s) * 0.4);   // les trois premières minutes, il frappe moins souvent : le temps d'apprendre
    const k = ['poing', 'bande', 'braises'][Math.floor(rng(s) * 3)], m = Math.floor(minutes(s)), sg = s.sage;
    if (k === 'poing') s.zones.push({ k, x: sg.x, y: sg.y, r: c.poingR, suit: c.gbSuit, t: c.poingT, T: c.poingT, dmg: 6 + Math.floor(1.5 * m), amis: 2 });
    else if (k === 'bande') s.zones.push({ k, x: sg.x, y: sg.y, horiz: rng(s) < 0.5, half: c.bandeH, suit: c.gbSuit, t: c.bandeT, T: c.bandeT, dmg: 5 + m, amis: 2 });
    else for (let i = 0; i < c.braiseN; i++) { const a = rng(s) * 6.28, d = i ? 90 + rng(s) * 130 : 0, T = c.braiseT + 0.18 * i; s.zones.push({ k: 'braise', x: sg.x, y: sg.y, ox: Math.cos(a) * d, oy: Math.sin(a) * d, r: c.braiseR, suit: 0.5, t: T, T, dmg: 4 + m, amis: 1 }); }
    s.fx.push({ k: 'gbcoup', coup: k, life: 1.4, max: 1.4 }); s.coups = (s.coups || 0) + 1;
    if (!s.vu.rouge) { s.vu.rouge = 1; say(s, 'Grosbec frappe ! Sors du rouge… et emmène-le loin de tes amis.', 4); }
  }
  // le porteur de bombe saute : tout ce qui est autour prend (les autres bombes sautent à leur tour)
  function explose(s, u) {
    const c = s.cfg; if ((s.bombN = (s.bombN || 0) + 1) > 14) return;
    s.fx.push({ k: 'boum', x: u.x, y: u.y, R: c.bombeR, life: 0.4, max: 0.4, bombe: true }); s.shake = Math.max(s.shake, 0.25);
    for (const v of [...s.soldiers]) if (v !== u && v.hp > 0 && dist(u, v) < c.bombeR + v.r) hurt(s, v, c.bombeD + Math.floor(minutes(s)));
    if (dist(u, s.sage) < c.bombeR) sonner(s);
    const f = targets(s).find(f => dist(u, f) < c.bombeR + f.r);
    if (f) { hit(s, f, 2); s.bombAmis = (s.bombAmis || 0) + 2; }
  }

  // ----- dégâts -----
""")

# ---------- dans la boucle ----------
rep("    spawning(s, dt);\n", "    spawning(s, dt);\n    grosbec(s, dt);\n")
rep("const v = Math.min(d, s.cfg.sageSpeed * dt);", "const v = Math.min(d, s.cfg.sageSpeed * dt * (sg.sonne > 0 ? s.cfg.sonneSpeed : 1));")
rep("    // le bâton tire tout seul\n", "    if (sg.sonne > 0) sg.sonne -= dt;\n    if (sg.invul > 0) sg.invul -= dt;\n    zones(s, dt); if (s.over) return;\n    // le bâton tire tout seul (pas quand le Sage est sonné)\n")
rep("    if (s.boltT <= 0) {\n", "    if (s.boltT <= 0 && !(sg.sonne > 0)) {\n")
rep("Math.hypot(u.x - b.x, u.y - b.y) >= u.r + 6) continue;\n", """Math.hypot(u.x - b.x, u.y - b.y) >= u.r + 6) continue;
        // le porte-dalle : sa dalle arrête l'orbe qui arrive de face
        if (u.dalle && !(u.daze > 0)) { const f = nearestTarget(s, u) || sg, hd = dist(u, f) || 1, bv = Math.hypot(b.vx, b.vy) || 1; if ((b.vx * (f.x - u.x) + b.vy * (f.y - u.y)) / (bv * hd) < -0.25) { b.life = 0; s.blocs = (s.blocs || 0) + 1; if ((u.dalleN = (u.dalleN || 0) + 1) >= c.dalleCoups) lacher(s, u, 'dalle cassée !'); s.fx.push({ k: 'bloc', x: u.x + (f.x - u.x) / hd * u.r, y: u.y + (f.y - u.y) / hd * u.r, life: 0.25, max: 0.25 }); break; } }
""")
rep("      const fl = flying(s, u);\n      u.x += u.vx * dt; u.y += u.vy * dt;", "      const fl = flying(s, u);\n      if (fl && u.dalle) lacher(s, u);   // chassé par une rune : la dalle tombe\n      u.x += u.vx * dt; u.y += u.vy * dt;")
rep("      const f = nearestTarget(s, u);\n      if (!f) {", """      if (u.type === 'mortier') {   // il s'installe loin (hors de portée du bâton depuis le centre) et vise le Sage
        const dc = Math.hypot(u.x - 450, u.y - 445);
        if (dc > c.mortierLoin) { const v = T.speed * slow * dt; u.x += (450 - u.x) / dc * v; u.y += (445 - u.y) / dc * v; }
        else { u.atk -= dt * slow; if (u.atk <= 0) { u.atk = T.rate; s.zones.push({ k: 'obus', x: sg.x, y: sg.y, r: c.obusR, suit: c.obusSuit, t: c.obusT, T: c.obusT, dmg: 5 + Math.floor(minutes(s)), amis: 1, de: { x: u.x, y: u.y } }); s.fx.push({ k: 'tir', x: u.x, y: u.y, life: 0.3, max: 0.3 }); } }
        continue;
      }
      const f = nearestTarget(s, u);
      if (!f) {""")
rep("      if (s.walls.some(w => wallDist(w, u.x, u.y) < u.r + w.half + s.cfg.wallSlowR)) slow = Math.min(slow, s.cfg.wallSlow);", """      // le bélier défonce les murs
      if (u.type === 'brute') for (const w of s.walls) if (w.life > 0 && wallDist(w, u.x, u.y) < u.r + w.half + 8) { w.life = 0; const q = nearOnWall(w, u.x, u.y); s.fx.push({ k: 'casse', x: q.x, y: q.y, life: 0.4, max: 0.4 }); s.shake = Math.max(s.shake, 0.15); s.casses = (s.casses || 0) + 1; if (!s.vu.casse) { s.vu.casse = 1; say(s, 'Le bélier a défoncé ton mur !', 2.5); } }
      if (s.walls.some(w => wallDist(w, u.x, u.y) < u.r + w.half + s.cfg.wallSlowR)) slow = Math.min(slow, s.cfg.wallSlow);""")
rep("const g = waypoint(s, u, f), dg = dist(u, g) || 1,", "const g = u.type === 'brute' ? f : waypoint(s, u, f), dg = dist(u, g) || 1,")
rep("          else hit(s, f, T.dmg);\n", "          else if (u.type === 'bombe') { u.hp = 0; die(s, u); }   // il saute sur l'ami\n          else hit(s, f, T.dmg);\n")
rep("      p.t += dt;\n      const d = dist(p, sg);", "      p.t += dt; if (p.lock > 0) { p.lock -= dt; continue; }\n      const d = dist(p, sg);")

# ---------- graver ----------
rep("    const kind = rune.kind, cost = s.frenzy > 0 ? 0 : costOf(s, rune);", "    if (s.sage.sonne > 0) { say(s, 'Le Sage est sonné ! Attends une seconde.'); return { ok: false }; }\n    const kind = rune.kind, cost = s.frenzy > 0 ? 0 : costOf(s, rune);")
rep("    s.ink -= cost; s.runes++;\n", "    s.ink -= cost; s.runes++; s.brushT = 0;\n")
rep("    s.protection = Math.max(0, s.protection - n); f.flash = 0.25;", "    s.protection = Math.max(0, s.protection - n); f.flash = 0.25; s.perdu = (s.perdu || 0) + n;")
rep("turnRune, hint, avance };", "turnRune, hint, avance, dansZone };")

open(os.path.join(base, 'logic20.js'), 'w').write(s)
print('logic20.js écrit :', len(s), 'caractères')
