# Version 26 [Romain, 26 nov., 19 h 40 : « Trouve-moi 5 autres builds intéressants. Fais la modif, intègre-les et mets en ligne. »]
# Fabrique logic26.js à partir de logic25.js. Cinq builds de plus, tous liés aux runes (rien n'attaque tout seul), chacun avec deux cartes qui n'ouvrent que lui :
#  💎 Prison de cristal (Rune de la cage + Bouclier de cristal) — un cercle loin des amis enferme les golems ;
#  ✍️ Le calligraphe (Plume agile + Tir rapide) — enchaîner des runes de formes différentes ;
#  💣 Champ de mines (Traces de lumière + Rune piège) — les traits laissent des pièges au sol ;
#  🌞 Rayon solaire (Encre pure + Méditation) — garder son encre ; encrier plein = trait surchargé ;
#  🐂 Le dompteur (Collier de lumière + Lasso de lumière) — un gros golem sonné, touché par le trait, passe dans ton camp.
import os
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic25.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)

# ---------- les cartes ----------
rep("bouclierT: [0, 20, 15, 10], sceauDur: [0, 3, 4, 5],", "bouclierT: [0, 20, 15, 10], sceauDur: [0, 3, 4, 5],\n    cageT: [0, 3, 4, 5], plumeW: [0, 3, 4, 5], traceT: [0, 4, 6, 8], mineT: [0, 1, 1.5, 2], pure: [0, 4, 5, 6], medit: [0, 5, 4, 3], collierT: [0, 6, 9, 12], lasso: [0, 2, 3, 4],")
rep("  CARDS.orage.of = ['chaine', 'eblouir'];", """  // version 26 : cinq builds de plus (chacun avec deux cartes qui n'ouvrent que lui)
  Object.assign(CARDS, {
    cage: { fam: 'sort', nom: 'Rune de la cage', ic: '🔒', max: 3, txt: l => `Une nouvelle rune : trace un cercle fermé loin de tes amis. Les golems dedans sont enfermés ${UP.cageT[l]} secondes : ils ne bougent plus et ne frappent plus. 3 d’encre.` },
    plume: { fam: 'rune', nom: 'Plume agile', ic: '🪶', max: 3, txt: l => `Si ta rune n’a pas la même forme que la précédente et que tu la graves moins de ${UP.plumeW[l]} secondes après, elle coûte 1 d’encre de moins.` },
    trace: { fam: 'rune', nom: 'Traces de lumière', ic: '✨', max: 3, txt: l => `Ton trait laisse une trace dorée au sol pendant ${UP.traceT[l]} secondes : les golems qui marchent dessus sont ralentis.` },
    mine: { fam: 'rune', nom: 'Rune piège', ic: '🪤', max: 3, need: 'trace', txt: l => `Un golem qui marche sur une trace est sonné ${String(UP.mineT[l]).replace('.', ',')} seconde${UP.mineT[l] > 1 ? 's' : ''}.` },
    pure: { fam: 'rune', nom: 'Encre pure', ic: '☀️', max: 3, txt: l => `Quand ton encrier est plein, ton trait est surchargé : il traverse toute la salle, deux fois plus large, et fait ${UP.pure[l]} dégâts.` },
    medit: { fam: 'cadeau', nom: 'Méditation', ic: '🕯️', max: 3, txt: l => `Quand tu ne graves pas pendant ${UP.medit[l]} secondes, ton encre remonte toute seule, 1 par seconde.` },
    collier: { fam: 'sort', nom: 'Collier de lumière', ic: '📿', max: 3, txt: l => `Un trait qui touche un bélier ou un colosse sonné le fait passer dans ton camp au lieu de le faire éclater : il se bat pour toi ${UP.collierT[l]} secondes (${l} à la fois).` },
    lasso: { fam: 'rune', nom: 'Lasso de lumière', ic: '➰', max: 3, txt: l => `Un bélier ou un colosse chassé par ton V est sonné ${UP.lasso[l]} secondes.` },
    prison: { fam: 'combo', genre: 'rune', of: ['cage', 'bouclier'], nom: 'Prison de cristal', ic: '💠', max: 3, txt: l => ['', 'Les golems enfermés sont sonnés : un trait à travers la cage les fait tous éclater.', 'La cage dure 2 secondes de plus, et elle attire les golems qui passent tout près.', 'Quand la cage se brise, elle explose : 4 dégâts dedans et autour.'][l] },
    calli: { fam: 'combo', genre: 'rune', of: ['plume', 'rapide'], nom: 'Le calligraphe', ic: '✍️', max: 3, txt: l => ['', 'Trois runes de formes différentes à la suite : la troisième part deux fois.', 'La série continue : à partir de la troisième, chaque rune part deux fois et ne coûte rien.', 'Cinq runes dans la série : une vague de lumière part de tes amis. Tous les golems sonnés de la salle éclatent, les autres sont sonnés.'][l] },
    mines: { fam: 'combo', genre: 'rune', of: ['trace', 'mine'], nom: 'Champ de mines', ic: '💣', max: 3, txt: l => ['', 'Quand un golem marche sur une trace, elle explose : 3 dégâts autour.', 'L’explosion fait éclater les golems sonnés autour.', 'Une trace qui explose fait exploser les traces voisines, et chaque trace peut exploser deux fois.'][l] },
    soleil: { fam: 'combo', genre: 'rune', of: ['pure', 'medit'], nom: 'Rayon solaire', ic: '🌞', max: 3, txt: l => ['', 'Le trait surchargé sonne tous les golems qu’il ne détruit pas.', 'Le trait surchargé part en croix : un deuxième rayon en travers.', 'Après le rayon, la lumière retombe en pluie sur 8 golems : ils sont sonnés, et les sonnés éclatent.'][l] },
    dompteur: { fam: 'combo', genre: 'rune', of: ['collier', 'lasso'], nom: 'Le dompteur', ic: '🐂', max: 3, txt: l => ['', 'Tes golems domptés frappent deux fois plus fort et restent 4 secondes de plus.', 'Quand leur temps est fini, ils explosent : 4 dégâts autour, et les golems autour sont sonnés.', 'Tu peux aussi dompter les petits golems sonnés, et deux de plus à la fois.'][l] }
  });
  CARDS.orage.of = ['chaine', 'eblouir'];""")

# ---------- l'état ----------
rep("announced: [], entered: [], zones: [], vu: {},", "announced: [], entered: [], zones: [], vu: {}, cages: [], traces: [], allies: [],")

# ---------- le cercle : bouclier près des amis, cage ailleurs ----------
rep("    if (rune.kind === 'ferme') return lv(s, 'dome') ? s.cfg.domeCost : 0;", "    if (rune.kind === 'ferme') return lv(s, 'dome') ? s.cfg.domeCost : lv(s, 'cage') ? s.cfg.cageCost : 0;")
rep("    if (rune.kind === 'ferme') { if (!lv(s, 'dome')) { say(s, 'Un cercle ne fait rien… pour l’instant.'); return { ok: false }; } return castDome(s); }",
    """    if (rune.kind === 'ferme') {
      const P = rune.poly || []; let cx = 450, cy = 445, R = 90;
      if (P.length) { cx = 0; cy = 0; for (const p of P) { cx += p.x; cy += p.y; } cx /= P.length; cy /= P.length; R = 0; for (const p of P) R += Math.hypot(p.x - cx, p.y - cy); R /= P.length; }
      const pres = Math.hypot(cx - 450, cy - 445) < 170;
      if (lv(s, 'cage') && (!lv(s, 'dome') || !pres)) return castCage(s, cx, cy, Math.max(55, Math.min(220, R)));
      if (!lv(s, 'dome')) { say(s, 'Un cercle ne fait rien… pour l’instant.'); return { ok: false }; }
      return castDome(s);
    }""")
rep("  Object.assign(CFG, { slowMax: 1e9 });", "  Object.assign(CFG, { slowMax: 1e9, cageCost: 3 });")

# ---------- le calligraphe : la série ----------
rep("  // la rune du bouclier : un cercle fermé ; les amis sont intouchables un moment\n", """  // version 26, le calligraphe : la série de runes de formes différentes (en vraies secondes : le ralenti ne compte pas)
  function serieCalc(s, kind) {
    const P = lv(s, 'plume'); if (!P) return { n: 0, reduc: 0 };
    const suite = s.serieK && s.serieK !== kind && s.realT - s.serieT < UP.plumeW[P], n = suite ? s.serieN + 1 : 1, C = lv(s, 'calli');
    return { kind, n, reduc: suite ? 1 : 0, gratuit: C >= 2 && n >= 3, double: C >= 1 && (n === 3 || (C >= 2 && n >= 3)), vague: C >= 3 && n >= 5 };
  }
  function serieOk(s, sr, rune) {
    if (!sr.n) return;
    s.serieN = sr.n; s.serieK = sr.kind; s.serieT = s.realT;
    if (sr.n >= 2) s.fx.push({ k: 'pop', x: s.sage.x, y: s.sage.y - 62, t: `Série ×${sr.n}`, life: 0.9, max: 0.9, col: '#c9f2ff' });
    if (sr.double && rune && ['trait', 'poussee', 'spirale'].includes(rune.kind)) { s.echoes.push({ rune, t: 0.3 }); s.doubles = (s.doubles || 0) + 1; }
    if (sr.vague) {   // la vague de lumière : les sonnés éclatent, les autres sont sonnés
      s.serieN = 0; s.serieK = null; s.vagues = (s.vagues || 0) + 1;
      const k0 = s.kills; s.inRune = true; s.runeKills = 0;
      for (const u of [...s.soldiers]) if (u.hp > 0) { if (u.daze > 0) shatter(s, u); else stun(s, u); }
      s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
      s.fx.push({ k: 'pulse', R: 640, life: 0.8, max: 0.8 }); s.shake = Math.max(s.shake, 0.3); say(s, 'Vague de lumière !', 2);
    }
  }
  // version 26, la rune de la cage : un cercle loin des amis enferme les golems
  function castCage(s, x, y, R) {
    const c = s.cfg; if (s.sage.sonne > 0) { say(s, 'Le Sage est sonné ! Attends une seconde.'); return { ok: false }; }
    const sr = serieCalc(s, 'ferme'), cost = s.frenzy > 0 || sr.gratuit ? 0 : Math.max(0, c.cageCost - sr.reduc);
    if (s.ink < cost) { say(s, `Pas assez d’encre (il en faut ${cost}). Ramasse des éclats.`); return { ok: false }; }
    s.ink -= cost; s.runes++; s.brushT = 0; runeGravee(s); serieOk(s, sr, null);
    const T = UP.cageT[lv(s, 'cage')] + (lv(s, 'prison') >= 2 ? 2 : 0), cg = { x, y, R, t: T, max: T }; s.cages.push(cg); s.nCages = (s.nCages || 0) + 1;
    let n = 0; for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(u.x - x, u.y - y) < R + u.r * 0.5) { u.cage = cg; u.vx = 0; u.vy = 0; n++; }
    s.fx.push({ k: 'trap', x, y, R, life: 0.5, max: 0.5 }); say(s, n ? `Cage : ${n} golem${n > 1 ? 's' : ''} enfermé${n > 1 ? 's' : ''} !` : 'Une cage… vide pour l’instant.');
    return { ok: true, hit: n, killed: 0 };
  }
  // version 26, le dompteur : un gros golem sonné, touché par le trait, passe dans ton camp
  function dompter(s, u) {
    const C = lv(s, 'collier'), D = lv(s, 'dompteur'); if (!C || u.iron || u.hp <= 0 || u.ally) return false;
    if (!GROS.includes(u.type) && D < 3) return false;
    if (s.allies.length >= C + (D >= 3 ? 2 : 0)) return false;
    s.soldiers = s.soldiers.filter(v => v !== u);
    Object.assign(u, { ally: true, allyT: UP.collierT[C] + (D >= 1 ? 4 : 0), daze: 0, vx: 0, vy: 0, cage: null, burn: 0, atk: 0.3, ball: null });
    s.allies.push(u); s.domptes = (s.domptes || 0) + 1;
    s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 16, t: 'dompté !', life: 1, max: 1, col: '#ffd23f' });
    if (!s.vu.dompte) { s.vu.dompte = 1; say(s, 'Dompté ! Ce golem se bat pour toi.', 2.5); }
    return true;
  }
  // version 26, champ de mines : une trace qui explose
  function mineBoum(s, tr, x, y, prof, deja) {
    deja = deja || new Set(); if (tr.t <= 0 || deja.has(tr)) return; deja.add(tr); tr.n--; if (tr.n <= 0) tr.t = 0;
    const L = lv(s, 'mines'); s.mineBooms = (s.mineBooms || 0) + 1;
    s.fx.push({ k: 'boum', x, y, R: 80, life: 0.4, max: 0.4 });
    for (const v of [...s.soldiers]) if (v.hp > 0 && Math.hypot(v.x - x, v.y - y) < 80 + v.r) { if (L >= 2 && v.daze > 0) shatter(s, v); else hurt(s, v, 3); }
    if (L >= 3 && (prof || 0) < 4) for (const o of s.traces) if (o !== tr && o.t > 0) { const q = nearOnSeg(o.a, o.b, x, y); if (Math.hypot(q.x - x, q.y - y) < 130) mineBoum(s, o, q.x, q.y, (prof || 0) + 1, deja); }
  }
  // la rune du bouclier : un cercle fermé ; les amis sont intouchables un moment
""")
# la série pour les autres runes (le bouclier et les runes ordinaires)
rep("    if (s.domeCd > 0) { say(s, `Le bouclier se recharge (encore ${Math.ceil(s.domeCd)} s).`); return { ok: false }; }\n    if (s.ink < c.domeCost) { say(s, `Pas assez d’encre (il en faut ${c.domeCost}). Ramasse des éclats.`); return { ok: false }; }\n    s.ink -= c.domeCost; s.runes++; s.brushT = 0; runeGravee(s);",
    "    if (s.domeCd > 0) { say(s, `Le bouclier se recharge (encore ${Math.ceil(s.domeCd)} s).`); return { ok: false }; }\n    const sr = serieCalc(s, 'ferme'), dcost = s.frenzy > 0 || sr.gratuit ? 0 : Math.max(0, c.domeCost - sr.reduc);\n    if (s.ink < dcost) { say(s, `Pas assez d’encre (il en faut ${dcost}). Ramasse des éclats.`); return { ok: false }; }\n    s.ink -= dcost; s.runes++; s.brushT = 0; runeGravee(s); serieOk(s, sr, null);")
rep("    const kind = rune.kind, cost = s.frenzy > 0 ? 0 : costOf(s, rune);\n    if (s.ink < cost) { say(s, `Pas assez d’encre (il en faut ${cost}). Ramasse des éclats.`); return { ok: false }; }\n    s.ink -= cost; s.runes++; s.brushT = 0; runeGravee(s);\n",
    """    const kind = rune.kind, sr = serieCalc(s, kind), cost = s.frenzy > 0 || sr.gratuit ? 0 : Math.max(0, costOf(s, rune) - sr.reduc);
    if (s.ink < cost) { say(s, `Pas assez d’encre (il en faut ${cost}). Ramasse des éclats.`); return { ok: false }; }
    // le rayon solaire : encrier plein → le trait est surchargé (toute la salle, deux fois plus large)
    if (kind === 'trait' && lv(s, 'pure') && s.ink >= s.cfg.inkMax) { const mx = (rune.a.x + rune.b.x) / 2, my = (rune.a.y + rune.b.y) / 2, dx = rune.b.x - rune.a.x, dy = rune.b.y - rune.a.y, d = Math.hypot(dx, dy) || 1; rune = { ...rune, a: { x: mx - dx / d * 1300, y: my - dy / d * 1300 }, b: { x: mx + dx / d * 1300, y: my + dy / d * 1300 }, sur: true }; s.surcharges = (s.surcharges || 0) + 1; }
    s.ink -= cost; s.runes++; s.brushT = 0; runeGravee(s);
""")
rep("    if (lv(s, 'scribe') >= 3 && rune.kind !== 'mur') s.echoes.push({ rune, t: 0.55 });", """    if (lv(s, 'scribe') >= 3 && rune.kind !== 'mur') s.echoes.push({ rune, t: 0.55 });
    if (rune.sur) {   // le rayon solaire, en croix et en pluie
      const S = lv(s, 'soleil');
      if (S >= 2) { const mx = (rune.a.x + rune.b.x) / 2, my = (rune.a.y + rune.b.y) / 2, dx = rune.b.x - rune.a.x, dy = rune.b.y - rune.a.y, d = Math.hypot(dx, dy) || 1; castAll(s, { ...rune, a: { x: mx + dy / d * 1300, y: my - dx / d * 1300 }, b: { x: mx - dy / d * 1300, y: my + dx / d * 1300 } }, true); }
      if (S >= 3) { const pool = s.soldiers.filter(u => u.hp > 0); for (let i = 0; i < 8 && pool.length; i++) { const v = pool.splice(Math.floor(rng(s) * pool.length), 1)[0]; s.fx.push({ k: 'sky', x: v.x, y: v.y, life: 0.4, max: 0.4 }); if (v.daze > 0) shatter(s, v); else { stun(s, v); hurt(s, v, 1); } } }
      say(s, 'Rayon solaire !', 2);
    }
    serieOk(s, sr, rune);""")

# ---------- le trait : surchargé, traces, dompteur ----------
rep("        if (u.hp <= 0 || !near(u.x, u.y, u.r + s.cfg.traitWidth)) continue;\n        hit++; dernier = u;\n        if (u.daze > 0) shatter(s, u); else { hurt(s, u, s.cfg.traitDmg);",
    "        if (u.hp <= 0 || !near(u.x, u.y, u.r + s.cfg.traitWidth * (rune.sur ? 2.2 : 1))) continue;\n        hit++; dernier = u;\n        if (u.daze > 0) { if (!dompter(s, u)) shatter(s, u); } else { hurt(s, u, rune.sur ? UP.pure[lv(s, 'pure')] : s.cfg.traitDmg); if (rune.sur && lv(s, 'soleil') && u.hp > 0) stun(s, u);")
rep("      s.fx.push({ k: 'beam', a, b, life: 0.45, max: 0.45 });", "      s.fx.push({ k: 'beam', a, b, life: rune.sur ? 0.7 : 0.45, max: rune.sur ? 0.7 : 0.45, sur: !!rune.sur });\n      if (lv(s, 'trace') && s.traces.length < 14) { const T = UP.traceT[lv(s, 'trace')]; s.traces.push({ a, b, t: T, max: T, n: lv(s, 'mines') >= 3 ? 2 : 1, vus: {} }); }")

# ---------- le V : le lasso ----------
rep("u.daze = tn; if (BW && !u.iron) u.ball = { left: 4, t: 3 }; }", "u.daze = tn; if (lv(s, 'lasso') && GROS.includes(u.type) && !u.iron) u.daze = Math.max(u.daze, UP.lasso[lv(s, 'lasso')]); if (BW && !u.iron) u.ball = { left: 4, t: 3 }; }")

# ---------- les golems : la cage, les traces ----------
rep("      if (u.frozen > 0) { u.frozen -= dt;", """      // version 26 : la cage les tient (sonnés avec la Prison de cristal) ; les traces les ralentissent, les sonnent, explosent
      if (u.cage) { if (u.cage.t <= 0) u.cage = null; else { const cg = u.cage, dx = u.x - cg.x, dy = u.y - cg.y, d = Math.hypot(dx, dy), m = Math.max(10, cg.R - u.r * 0.5); if (d > m) { u.x = cg.x + dx / d * m; u.y = cg.y + dy / d * m; } u.vx = 0; u.vy = 0; if (lv(s, 'prison')) u.daze = Math.max(u.daze, 0.25); continue; } }
      if (s.traces.length && !fl) for (const tr of s.traces) {
        if (tr.t <= 0) continue;
        const q = nearOnSeg(tr.a, tr.b, u.x, u.y); if (Math.hypot(u.x - q.x, u.y - q.y) > u.r + 8) continue;
        slow = Math.min(slow, 0.5);
        if (!tr.vus[u.id]) { tr.vus[u.id] = 1; if (lv(s, 'mine') && !u.iron) u.daze = Math.max(u.daze, UP.mineT[lv(s, 'mine')]); if (lv(s, 'mines')) mineBoum(s, tr, q.x, q.y, 0); }
        if (u.hp <= 0) break;
      }
      if (u.hp <= 0) continue;
      if (u.frozen > 0) { u.frozen -= dt;""")

# ---------- à chaque instant : cages, traces, méditation, golems domptés ----------
rep("    // les chouettes\n", """    // version 26 : les cages, les traces, la méditation, les golems domptés
    for (const cg of s.cages) {
      cg.t -= dt;
      if (lv(s, 'prison') >= 2 && cg.t > 0) for (const v of s.soldiers) { if (v.hp <= 0 || v.cage) continue; const dx = cg.x - v.x, dy = cg.y - v.y, d = Math.hypot(dx, dy); if (d < cg.R + 70) { if (d < cg.R) { v.cage = cg; v.vx = v.vy = 0; } else { v.x += dx / d * 150 * dt; v.y += dy / d * 150 * dt; } } }
      if (cg.t <= 0 && !cg.done) {
        cg.done = true;
        for (const v of s.soldiers) if (v.cage === cg) v.cage = null;
        if (lv(s, 'prison') >= 3) { s.fx.push({ k: 'boum', x: cg.x, y: cg.y, R: cg.R + 40, life: 0.45, max: 0.45 }); s.shake = Math.max(s.shake, 0.2); for (const v of [...s.soldiers]) if (v.hp > 0 && Math.hypot(v.x - cg.x, v.y - cg.y) < cg.R + 40 + v.r) hurt(s, v, 4); }
      }
    }
    s.cages = s.cages.filter(cg => !cg.done);
    for (const tr of s.traces) tr.t -= dt;
    s.traces = s.traces.filter(tr => tr.t > 0);
    if (lv(s, 'medit') && s.t - (s.derniereRune ?? -99) >= UP.medit[lv(s, 'medit')]) { s.meditT = (s.meditT || 0) + dt; if (s.meditT >= 1) { s.meditT = 0; s.ink = Math.min(s.cfg.inkMax, s.ink + 1); } } else s.meditT = 0;
    for (const a of s.allies) {
      a.allyT -= dt; if (a.flash > 0) a.flash -= dt;
      if (a.allyT <= 0) {
        a.done = true; s.fx.push({ k: 'pop', x: a.x, y: a.y - a.r - 12, t: 'libéré', life: 0.7, max: 0.7, col: '#ffd23f' });
        if (lv(s, 'dompteur') >= 2) { s.fx.push({ k: 'boum', x: a.x, y: a.y, R: 100, life: 0.45, max: 0.45 }); s.shake = Math.max(s.shake, 0.2); for (const v of [...s.soldiers]) if (v.hp > 0 && dist(a, v) < 100 + v.r) { hurt(s, v, 4); if (v.hp > 0) stun(s, v); } }
        continue;
      }
      let tg = null, b = 1e9; for (const v of s.soldiers) if (v.hp > 0) { const d = dist(a, v); if (d < b) { b = d; tg = v; } }
      if (!tg) continue;
      const T = TYPES[a.type], reach = a.r + tg.r + 6;
      if (b > reach) { const v = T.speed * 1.3 * dt; a.x += (tg.x - a.x) / b * v; a.y += (tg.y - a.y) / b * v; }
      else { a.atk -= dt; if (a.atk <= 0) { a.atk = 0.8; const dmg = (a.type === 'costaud' ? 5 : GROS.includes(a.type) ? 3 : 2) * (lv(s, 'dompteur') >= 1 ? 2 : 1); hurt(s, tg, dmg); s.fx.push({ k: 'slash', x: tg.x, y: tg.y, life: 0.3, max: 0.3 }); } }
    }
    s.allies = s.allies.filter(a => !a.done);
    // les chouettes
""")
open(os.path.join(base, 'logic26.js'), 'w').write(s)
print('logic26.js écrit :', len(s), 'caractères')
