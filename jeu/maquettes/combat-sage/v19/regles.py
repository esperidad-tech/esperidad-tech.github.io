# Fabrique logic19.js à partir de logic18.js (version 19, 25 novembre : 10 minutes sans codes, les nouvelles règles des runes, 14 builds).
# python3 v19/regles.py   (relancé à chaque retouche : on repart toujours de logic18.js)
import os, re
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(D + '/logic18.js').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
def entre(debut, fin, neuf):
    global s
    assert s.count(debut) == 1, (debut[:80], s.count(debut))
    i0 = s.index(debut); i1 = s.index(fin, i0); s = s[:i0] + neuf + s[i1:]

s = s.replace('maquette 18', 'maquette 19', 1)
rep("  const SORTS_MAX = 4;", "  const SORTS_MAX = 5;   // il n'y a plus que cinq sorts : plus de limite (une limite pouvait bloquer un build)")

# ---------- les réglages ----------
rep("    shardEvery: 8,", "    shardEvery: 4,")          # l'encre ne vient plus que du bâton : un petit golem sur quatre (réglé au robot)
rep("duree: 480, codeTimes: null, codeBonus: 3,", "duree: 600, rageAt: [450, 540], shatterPart: 0.5, shatterMin: 4, codeTimes: null, codeBonus: 3,")
# la courbe du combat : un début facile au bâton, puis ça monte pour de bon après 5 minutes (réglé au robot)
rep("rate0: 0.35, rateAdd: 0.65, rateRamp: 180, burst0: 5, burstDiv: 35, burstEvery: 28,", "rate0: 0.28, rateAdd: 0.5, rateRamp: 240, burst0: 4, burstDiv: 40, burstEvery: 28, rateLate: 1.1, lateFrom: 300, lateRamp: 240, hpLate: 2, hpLateEvery: 25,")
rep("hpEvery: 90, hpGrosEvery: 60, hpGros: 2, sideEvery: 180, shootersX2At: 600,", "hpEvery: 90, hpGrosEvery: 60, hpGros: 2, sideEvery: 210, shootersX2At: 600,")
rep("    boltEvery: 0.42, boltDmg: 1, boltPierce: 1, boltRange: 340,", "    boltEvery: 0.42, boltDmg: 2, boltPierce: 1, boltRange: 340,")   # l'orbe de base fait 2 dégâts : le début se joue au bâton
rep("txt: l => `Chaque orbe fait ${l + 1} dégâts au lieu de 1.` },", "txt: l => `Chaque orbe fait ${l + 2} dégâts au lieu de 2.` },")
rep("const c = s.cfg, rate = (c.rate0 + c.rateAdd * Math.min(1, s.t / c.rateRamp)) * (1 + 0.6 * s.rage);", "const c = s.cfg, rate = (c.rate0 + c.rateAdd * Math.min(1, s.t / c.rateRamp) + c.rateLate * Math.max(0, Math.min(1, (s.t - c.lateFrom) / c.lateRamp))) * (1 + 0.6 * s.rage);")
rep("const bonusHp = (s, type) => (GROS.includes(type) ? s.cfg.hpGros * Math.floor(s.realT / s.cfg.hpGrosEvery) : Math.floor(s.realT / s.cfg.hpEvery)) + 3 * fury(s);", "const bonusHp = (s, type) => (GROS.includes(type) ? s.cfg.hpGros * Math.floor(s.realT / s.cfg.hpGrosEvery) : Math.floor(s.realT / s.cfg.hpEvery)) + 3 * fury(s) + s.cfg.hpLate * (GROS.includes(type) ? 3 : 1) * Math.floor(Math.max(0, s.realT - s.cfg.lateFrom) / s.cfg.hpLateEvery);")

# les pages : vite au début (il faut 1, 1, 2, 2, 3, 3 gros), puis un gros de plus à chaque page (4, 5, 6…)
rep("    pageFirst: 1, pageStep: 1,", "    pageFirst: 1, pageStep: 0.5, pageVite: 6, pageStepTard: 1,")
rep("s.pageNeed = s.cfg.pageFirst + Math.floor(s.cfg.pageStep * s.pageIdx);", "s.pageNeed = s.pageIdx < s.cfg.pageVite ? s.cfg.pageFirst + Math.floor(s.cfg.pageStep * s.pageIdx) : s.cfg.pageFirst + Math.floor(s.cfg.pageStep * (s.cfg.pageVite - 1)) + Math.ceil(s.cfg.pageStepTard * (s.pageIdx - s.cfg.pageVite + 1));")
# les colosses n'arrivent qu'après un moment (réglable)
rep("    if (t > 55 && r < 0.06) return 'costaud';", "    if (t > s.cfg.costaudAt && r < 0.06) return 'costaud';")
rep("    pageFirst: 1, pageStep: 0.5,", "    costaudAt: 120, pageFirst: 1, pageStep: 0.5,")
# ---------- les cartes ----------
entre("    piege: { fam: 'sort', nom: 'Rune piège'", "    chaine: { fam: 'sort'", "")          # la rune piège s'en va (elle servait à l'orage)
entre("    // les 10 combos : une carte dorée", "    soin: { fam: 'cadeau'", """    // les 14 builds : une carte dorée, 3 niveaux ; elle sort quand on a ses deux cartes (l'une au moins au niveau 2)
    // --- dix builds du bâton (genre: 'baton') ---
    etoiles: { fam: 'combo', genre: 'baton', of: ['double', 'rapide'], nom: 'Pluie d’étoiles', ic: '🌠', max: 3, txt: l => ['', 'Toutes les 5 secondes, 12 étoiles partent tout autour du Sage.', 'Toutes les 3 secondes, et les étoiles rebondissent sur les bords.', 'Chaque étoile qui détruit un golem éclate en 3 étoiles.'][l] },
    ricochet: { fam: 'combo', genre: 'baton', of: ['double', 'percant'], nom: 'Ricochet', ic: '🎱', max: 3, txt: l => ['', 'L’orbe rebondit sur 2 golems de plus.', '4 rebonds, et l’orbe frappe plus fort à chaque rebond.', '8 rebonds, et l’orbe se dédouble au premier.'][l] },
    explosif: { fam: 'combo', genre: 'baton', of: ['double', 'lourd'], nom: 'Orbes explosives', ic: '💥', max: 3, txt: l => ['', 'Chaque orbe explose : les golems autour sont touchés aussi.', 'L’explosion est plus grande, plus forte, et souffle les golems.', 'Un golem détruit par une explosion explose à son tour.'][l] },
    rayon: { fam: 'combo', genre: 'baton', of: ['rapide', 'percant'], nom: 'Le rayon', ic: '🔦', max: 3, txt: l => ['', 'Toutes les 3 secondes, un rayon traverse toute la salle : place-toi dans l’axe.', 'Toutes les 2 secondes, plus large et plus fort.', 'Presque sans arrêt, et il part des deux côtés.'][l] },
    braise: { fam: 'combo', genre: 'baton', of: ['lourd', 'rapide'], nom: 'Orbes de braise', ic: '🔥', max: 3, txt: l => ['', 'Chaque orbe met le feu au golem touché.', 'Le feu brûle plus fort et saute de golem en golem.', 'Un golem qui meurt en brûlant explose en boule de feu.'][l] },
    givre: { fam: 'combo', genre: 'baton', of: ['lourd', 'percant'], nom: 'Orbes de givre', ic: '❄️', max: 3, txt: l => ['', 'Chaque orbe ralentit le golem touché.', 'Au troisième coup, il gèle sur place : gelé, il prend double.', 'Un golem gelé qui casse gèle ses voisins.'][l] },
    foudre: { fam: 'combo', genre: 'baton', of: ['chaine', 'rapide'], nom: 'Bâton de foudre', ic: '⚡', max: 3, txt: l => ['', 'Un tir sur quatre est un éclair qui saute sur 4 golems.', 'Un tir sur trois : 6 golems, et le premier est sonné.', 'Un tir sur deux : 8 golems, plus fort.'][l] },
    gardiennes: { fam: 'combo', genre: 'baton', of: ['pages', 'double'], nom: 'Orbes gardiennes', ic: '🛡️', max: 3, txt: l => ['', '3 orbes tournent tout près du Sage : elles frappent et arrêtent les braises.', '5 orbes : elles repoussent les golems qu’elles touchent.', '8 orbes, et toutes les 4 secondes elles partent en étoile.'][l] },
    comete: { fam: 'combo', genre: 'baton', of: ['pas', 'percant'], nom: 'La comète', ic: '🌟', max: 3, txt: l => ['', 'Le Sage court plus vite et laisse une large traînée d’étoiles qui brûle fort les golems et arrête les braises.', 'La traînée sonne les golems qui la touchent et renvoie les braises ; le Sage projette ceux qu’il percute.', 'La traînée explose derrière lui : les golems sont sonnés, les sonnés perdent la moitié de leur vie.'][l] },
    chouettes: { fam: 'combo', genre: 'baton', of: ['chouette', 'lourd'], nom: 'Parlement des chouettes', ic: '🦉', max: 3, txt: l => ['', 'Une deuxième chouette, et chaque coup de bec lance un éclair.', 'Quatre chouettes, et toujours les éclairs !', 'Les chouettes attrapent les golems et les jettent sur les autres.'][l] },
    // --- un build par rune (genre: 'rune') ---
    volcan: { fam: 'combo', genre: 'rune', of: ['brulant', 'large'], nom: 'Volcan (le trait)', ic: '🌋', max: 3, txt: l => ['', 'Le feu du trait brûle deux fois plus fort et saute de golem en golem.', 'Un golem qui meurt en brûlant explose en boule de feu et enflamme ses voisins.', 'Les golems en feu courent partout en paniquant, et le trait laisse une coulée de lave.'][l] },
    bowling: { fam: 'combo', genre: 'rune', of: ['tonnerre', 'encrier'], nom: 'Golems-boulets (le V)', ic: '🎳', max: 3, txt: l => ['', 'Le V ne coûte plus que 1. Les golems chassés deviennent des boulets : ils rebondissent partout et renversent tout ce qu’ils touchent.', 'Les golems renversés deviennent boulets à leur tour : réaction en chaîne !', 'Chaque boulet explose à la fin de sa course.'][l] },
    tornade: { fam: 'combo', genre: 'rune', of: ['pages', 'aimant'], nom: 'Tornade (l’escargot)', ic: '🌀', max: 3, txt: l => ['', 'L’escargot ne coûte plus que 4. Les pages s’envolent en spirale jusqu’au bord de la salle, puis reviennent.', 'L’escargot devient une tornade : elle aspire les golems, puis les recrache sonnés.', 'La tornade dure plus longtemps, se promène vers la foule et déchiquette les golems.'][l] },
    rempart: { fam: 'combo', genre: 'rune', of: ['epines', 'solide'], nom: 'Rempart (l’arc de cercle)', ic: '🏰', max: 3, txt: l => ['', 'Le mur dure 2 secondes de plus et met le feu aux golems qui le touchent.', 'Le mur rejette en arrière les golems qui le touchent : ils sont sonnés.', 'Quand il disparaît, le mur explose.'][l] },
""")

# ---------- un combo est prêt : pareil ; le grimoire propose d'abord ce qui fait avancer un build commencé ----------
rep("""    while (cards.length < 3 && pool.length) cards.push(pool.splice(Math.floor(rng(s) * pool.length), 1)[0]);
    s.choice = { cards };""", """    // au moins une carte qui fait avancer un build commencé (finir sa paire, ou monter une carte de la paire au niveau 2)
    const av = pool.filter(id => avance(s, id));
    if (av.length && cards.length < 3) { const id = av[Math.floor(rng(s) * av.length)]; cards.push(id); pool.splice(pool.indexOf(id), 1); }
    while (cards.length < 3 && pool.length) cards.push(pool.splice(Math.floor(rng(s) * pool.length), 1)[0]);
    s.choice = { cards };""")
rep("  const combosReady = s =>", """  // les builds pas encore pris dont « id » est une des deux cartes
  const buildsDe = (s, id) => Object.keys(CARDS).filter(k => CARDS[k].fam === 'combo' && !lv(s, k) && CARDS[k].of.includes(id));
  // prendre « id » fait-il avancer un build commencé ? (l'autre carte est déjà là, et le build n'est pas encore prêt)
  const avance = (s, id) => buildsDe(s, id).some(k => { const o = CARDS[k].of.find(x => x !== id); return lv(s, o) > 0 && !comboReady(s, k); });
  // ce qu'on écrit sous une carte : « Avec X : le build Y » (les builds que cette carte prépare)
  const hint = (s, id) => { if (!CARDS[id] || CARDS[id].fam === 'combo' || id === 'soin') return ''; const B = buildsDe(s, id); if (!B.length) return ''; const pret = B.filter(k => lv(s, CARDS[k].of.find(x => x !== id)) > 0); return pret.length ? 'Avec « ' + CARDS[CARDS[pret[0]].of.find(x => x !== id)].nom + ' » : ' + CARDS[pret[0]].nom : 'Prépare : ' + B.slice(0, 2).map(k => CARDS[k].nom).join(', '); };
  const combosReady = s =>""")
rep("if (id === 'solide' || id === 'volcan') c.wallLife = 3 + lv(s, 'solide') + (lv(s, 'volcan') ? 2 : 0);", "if (id === 'solide' || id === 'rempart') c.wallLife = 3 + lv(s, 'solide') + (lv(s, 'rempart') ? 2 : 0);")

# ---------- plus de codes : le Sage tient 10 minutes ----------
rep("  const CODES = { A: ['⭐', '🔥', '💧'], B: ['🔑', '💧', '🍃'] };\n  const ORDER = ['A', 'B'];\n  const POSTE = { A: 'le bras', B: 'le casque' };",
    "  // version 19 [Romain, 25 nov., 16 h 42 : « on laisse tomber l'idée que les autres passent des codes », « le Sage, il doit tenir 10 minutes. À 10 minutes, Grosbec, il dit ça suffit »]\n  const CODES = {}, ORDER = [], POSTE = {};")
entre("    for (const id of s.order) if (!s.announced.includes(id) && s.realT >= s.codeAt[id]) {", "    spawning(s, dt);", """    // à 10 minutes, Grosbec en a assez : le Sage a tenu
    if (s.realT >= s.cfg.duree) { s.over = 'win'; s.heart.bare = true; s.soldiers = []; s.stones = []; s.bolts = []; s.shake = 0.4; say(s, 'Grosbec : « ASSEZ ! Ça suffit ! »', 6); return; }
""")
rep("    const rage = s.realT >= 900 ? 3 + Math.floor((s.realT - 900) / 30) : s.realT >= 840 ? 2 : s.realT >= 720 ? 1 : 0;", "    const rage = s.realT >= s.cfg.rageAt[1] ? 2 : s.realT >= s.cfg.rageAt[0] ? 1 : 0;   // la colère de Grosbec, avant la fin")

# ---------- l'encre ne vient plus que du bâton : un golem détruit par une rune n'en lâche pas ----------
rep("  function hurt(s, u, n) {", """  // ce qui vient d'une rune (le trait, le feu du trait, le mur, les boulets, la tornade) ne fait pas tomber d'encre
  const sansEncre = (s, f) => { const o = s.noInk; s.noInk = true; try { return f(); } finally { s.noInk = o; } };
  function hurt(s, u, n) {""")
entre("    let n = s.cfg.grosShards && GROS.includes(u.type)", "    for (let i = 0; i < n; i++) s.shards.push(", """    let n = 0;
    if (!s.noInk) {   // l'encre se gagne au bâton
      const gros = GROS.includes(u.type);
      n = s.cfg.grosShards && gros ? s.cfg.grosShards[GROS.indexOf(u.type)] : TYPES[u.type].shards;
      if (!gros && s.cfg.shardEvery > 1) { s.shardN = (s.shardN ?? s.cfg.shardEvery - 1) + 1; if (s.shardN % s.cfg.shardEvery) n = 0; }   // un petit golem sur « shardEvery » (le tout premier en lâche un)
      if (gros) n += lv(s, 'moisson');
    }
""")
rep("    if (lv(s, 'volcan') >= 2 && u.burn > 0) {", """    // le givre : un golem gelé qui casse gèle ses voisins
    if (lv(s, 'givre') >= 3 && u.frozen > 0 && (s.gelN = (s.gelN || 0) + 1) <= 10) {
      s.fx.push({ k: 'gel', x: u.x, y: u.y, R: 95, life: 0.4, max: 0.4 });
      for (const v of s.soldiers) if (v !== u && v.hp > 0 && dist(u, v) < 95 + v.r) { if (!v.iron && !(v.frozen > 0)) { v.frozen = 1.6; v.chillN = 0; } hurt(s, v, 2); }
    }
    if ((lv(s, 'volcan') >= 2 || lv(s, 'braise') >= 3) && u.burn > 0) {""")

# ---------- le trait ne tue plus d'office un golem sonné : il lui enlève la moitié de sa vie ----------
entre("  // un soldat sonné, touché par la lumière, éclate", "  // un soldat projeté qui cogne quelque chose est sonné", """  // un golem sonné, touché par la lumière, « éclate » : depuis la version 19 il ne meurt plus d'office,
  // il perd la moitié de sa vie (au moins 4) et n'est plus sonné ; ses éclats touchent les voisins (les sonnés éclatent à leur tour)
  function shatter(s, u, vus) {
    if (u.hp <= 0) return;
    if (u.iron) { hurt(s, u, 3); return; }
    vus = vus || new Set(); if (vus.has(u.id)) return; vus.add(u.id);
    u.daze = 0;
    s.fx.push({ k: 'burst', x: u.x, y: u.y, R: s.cfg.shatterR, life: 0.4, max: 0.4 });
    s.shake = Math.max(s.shake, 0.15);
    hurt(s, u, Math.max(s.cfg.shatterMin, Math.ceil(u.max * s.cfg.shatterPart)));
    for (const v of s.soldiers) {
      if (v === u || v.hp <= 0 || dist(u, v) > s.cfg.shatterR + v.r) continue;
      if (v.daze > 0) shatter(s, v, vus); else hurt(s, v, s.cfg.shatterDmg);
    }
  }
""")
rep("    const hit = castAll(s, rune, false);", "    const hit = sansEncre(s, () => castAll(s, rune, false));")

# ---------- le bâton : les builds ----------
rep("          s.bolts.push({ x: sg.x, y: sg.y, vx: Math.cos(a) * s.cfg.boltSpeed, vy: Math.sin(a) * s.cfg.boltSpeed, life: s.cfg.boltRange / s.cfg.boltSpeed + 0.1, dmg: s.cfg.boltDmg + lv(s, 'lourd'), pierce: UP.percant[lv(s, 'percant')] + s.cfg.boltPierce, hit: [] });\n        }",
    """          s.bolts.push({ x: sg.x, y: sg.y, vx: Math.cos(a) * s.cfg.boltSpeed, vy: Math.sin(a) * s.cfg.boltSpeed, life: s.cfg.boltRange / s.cfg.boltSpeed + 0.1, dmg: s.cfg.boltDmg + lv(s, 'lourd'), pierce: UP.percant[lv(s, 'percant')] + s.cfg.boltPierce, hit: [], staff: true, rico: UP.ricoN[lv(s, 'ricochet')] });
        }
        // le bâton de foudre : un tir sur quatre (puis trois, puis deux) est un éclair qui saute de golem en golem
        const FO = lv(s, 'foudre');
        if (FO && (s.shotN = (s.shotN || 0) + 1) % UP.foudreK[FO] === 0) { chainFrom(s, sg, UP.foudreN[FO], s.cfg.boltRange, UP.foudreD[FO] + lv(s, 'lourd')); if (FO >= 2) stun(s, near[0]); }""")
rep("  function chainFrom(s, from, N, R0) {", "  function chainFrom(s, from, N, R0, dmg = 2) {")
rep("    for (const u of done) hurt(s, u, 2);\n    if (done.length) s.fx.push({ k: 'chain', pts, life: 0.3, max: 0.3 });", "    for (const u of done) hurt(s, u, dmg);\n    if (done.length) s.fx.push({ k: 'chain', pts, life: 0.3, max: 0.3 });")
rep("        if (b.star) u.lastStar = true;\n        hurt(s, u, b.dmg);\n        u.lastStar = false;", """        if (b.star) u.lastStar = true;
        const GI = b.staff ? lv(s, 'givre') : 0, BR = b.staff ? lv(s, 'braise') : 0, EX = b.staff ? lv(s, 'explosif') : 0;
        hurt(s, u, b.dmg * (GI >= 2 && u.frozen > 0 ? 2 : 1));
        u.lastStar = false;
        if (u.hp > 0) {
          if (GI) { u.chill = 2.5; u.chillN = (u.chillN || 0) + 1; if (GI >= 2 && u.chillN >= 3 && !u.iron && !(u.frozen > 0) && !(u.gelCd > 0)) { u.frozen = 2; u.chillN = 0; s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 10, t: 'gelé !', life: 0.7, max: 0.7, col: '#bfefff' }); } }
          if (BR && u.burnCd <= 0) { if (u.burn <= 0) u.burnTick = 0.5; u.burn = c.burnT; u.burnRune = false; }
        }
        if (EX) boum(s, u, EX, 0);""")
rep("        if (b.pierce > 0) { b.pierce--; b.hit.push(u.id); } else { b.life = 0; break; }", """        if (b.pierce > 0) { b.pierce--; b.hit.push(u.id); }
        else if (b.rico > 0) {   // le ricochet : l'orbe repart vers le golem le plus proche qu'elle n'a pas encore touché
          b.hit.push(u.id);
          const libres = s.soldiers.filter(v => v.hp > 0 && !b.hit.includes(v.id) && dist(u, v) < 260).sort((p, q) => dist(u, p) - dist(u, q));
          if (!libres.length) { b.life = 0; break; }
          const RI = lv(s, 'ricochet'), vers = (o, v) => { const d = dist(u, v) || 1; o.x = u.x; o.y = u.y; o.vx = (v.x - u.x) / d * s.cfg.boltSpeed; o.vy = (v.y - u.y) / d * s.cfg.boltSpeed; o.life = 0.5; };
          b.rico--; if (RI >= 2) b.dmg++; vers(b, libres[0]);
          if (RI >= 3 && !b.dedouble && libres[1] && s.bolts.length < 220) { b.dedouble = true; const o = { ...b, hit: [...b.hit] }; vers(o, libres[1]); s.neufs = s.neufs || []; s.neufs.push(o); }
          break;
        }
        else { b.life = 0; break; }""")
rep("    s.bolts = s.bolts.filter(b => b.life > 0);\n    // les soldats", "    if (s.neufs && s.neufs.length) { s.bolts.push(...s.neufs); s.neufs = []; }\n    s.bolts = s.bolts.filter(b => b.life > 0);\n    s.boumN = 0; s.gelN = 0;\n    // les soldats")
# l'explosion d'une orbe
rep("  // un éclair qui part de « from » et saute de golem en golem", """  // une orbe explosive : les golems autour sont touchés (niveau 2 : soufflés ; niveau 3 : un golem détruit explose à son tour)
  function boum(s, u, L, prof) {
    if ((s.boumN = (s.boumN || 0) + 1) > 14) return;
    const R = UP.boumR[L], d0 = UP.boumD[L];
    s.fx.push({ k: 'boum', x: u.x, y: u.y, R, life: 0.28, max: 0.28 });
    for (const v of [...s.soldiers]) {
      if (v === u || v.hp <= 0) continue; const dx = v.x - u.x, dy = v.y - u.y, d = Math.hypot(dx, dy) || 1; if (d > R + v.r) continue;
      if (L >= 2 && !v.iron && !v.ball) { v.vx += dx / d * 300; v.vy += dy / d * 300; }
      if (hurt(s, v, d0) && L >= 3 && prof < 3) boum(s, v, L, prof + 1);
    }
  }
  // un éclair qui part de « from » et saute de golem en golem""")
rep("    rapide: [1, 0.8, 0.65, 0.5], percant: [0, 1, 3, 99],", "    rapide: [1, 0.8, 0.65, 0.5], percant: [0, 1, 3, 99], ricoN: [0, 2, 4, 8], boumR: [0, 60, 85, 110], boumD: [0, 1, 2, 3],\n    foudreK: [0, 4, 3, 2], foudreN: [0, 4, 6, 8], foudreD: [0, 2, 3, 4], rayonT: [0, 3, 2, 1.2], rayonD: [0, 3, 4, 5], rayonW: [0, 18, 28, 28], gardN: [0, 3, 5, 8], gardR: [0, 62, 70, 80], gardD: [0, 2, 3, 3],")

# le feu : qui l'a allumé (une rune ou le bâton), plus fort avec la braise, il saute avec la braise 2
rep("if (u.burn > 0) { u.burn -= dt; u.burnTick -= dt; if (u.burnTick <= 0) { u.burnTick = 1; hurt(s, u, c.burnDmg + (lv(s, 'volcan') ? 1 : 0)); if (lv(s, 'volcan')) for (const v of s.soldiers) if (v !== u && v.hp > 0 && v.burn <= 0 && v.burnCd <= 0 && dist(u, v) < u.r + v.r + 30) { v.burn = c.burnT; v.burnTick = 0.5; } } if (u.burn <= 0) u.burnCd = 3; }",
    "if (u.burn > 0) { u.burn -= dt; u.burnTick -= dt; if (u.burnTick <= 0) { u.burnTick = 1; const BR = lv(s, 'braise'), dg = c.burnDmg + (lv(s, 'volcan') ? 1 : 0) + (BR >= 2 ? BR - 1 : 0); if (u.burnRune) sansEncre(s, () => hurt(s, u, dg)); else hurt(s, u, dg); if (lv(s, 'volcan') || BR >= 2) for (const v of s.soldiers) if (v !== u && v.hp > 0 && v.burn <= 0 && v.burnCd <= 0 && dist(u, v) < u.r + v.r + 30) { v.burn = c.burnT; v.burnTick = 0.5; v.burnRune = u.burnRune; } } if (u.burn <= 0) u.burnCd = 3; }\n      if (u.chill > 0) { u.chill -= dt; if (u.chill <= 0) u.chillN = 0; }\n      if (u.gelCd > 0) u.gelCd -= dt;\n      if (u.wallCd > 0) u.wallCd -= dt;")
rep("          if (a.burn > 0 && b.burn <= 0 && b.burnCd <= 0) { b.burn = c.burnT; b.burnTick = 0.5; }\n          else if (b.burn > 0 && a.burn <= 0 && a.burnCd <= 0) { a.burn = c.burnT; a.burnTick = 0.5; }",
    "          if (a.burn > 0 && b.burn <= 0 && b.burnCd <= 0) { b.burn = c.burnT; b.burnTick = 0.5; b.burnRune = a.burnRune; }\n          else if (b.burn > 0 && a.burn <= 0 && a.burnCd <= 0) { a.burn = c.burnT; a.burnTick = 0.5; a.burnRune = b.burnRune; }")
rep("if (Math.hypot(u.x - q.x, u.y - q.y) < u.r + (fl.lava ? 34 : 20)) { u.burn = s.cfg.burnT; u.burnTick = 0.3; } }", "if (Math.hypot(u.x - q.x, u.y - q.y) < u.r + (fl.lava ? 34 : 20)) { u.burn = s.cfg.burnT; u.burnTick = 0.3; u.burnRune = true; } }")
# le givre : ralenti, puis gelé
rep("      if (u.daze > 0) { u.daze -= dt; continue; }\n      if (fl || u.held || u.spin) continue;", "      if (u.frozen > 0) { u.frozen -= dt; if (u.frozen <= 0) u.gelCd = 3; continue; }\n      if (u.chill > 0) slow = Math.min(slow, 0.55);\n      if (u.daze > 0) { u.daze -= dt; continue; }\n      if (fl || u.held || u.spin) continue;")

# ---------- le rempart : le mur met le feu (c'était le volcan), rejette, puis explose ----------
rep("    if (lv(s, 'volcan')) for (const w of s.walls) for (const u of s.soldiers) if (alive(u) && u.burn <= 0 && u.burnCd <= 0 && wallDist(w, u.x, u.y) < w.half + u.r + 14) { u.burn = s.cfg.burnT; u.burnTick = 0.3; }",
    "    if (lv(s, 'rempart')) for (const w of s.walls) for (const u of s.soldiers) if (alive(u) && u.burn <= 0 && u.burnCd <= 0 && wallDist(w, u.x, u.y) < w.half + u.r + 14) { u.burn = s.cfg.burnT; u.burnTick = 0.3; u.burnRune = true; }")
rep("      for (const u of s.soldiers) if (alive(u) && wallDist(w, u.x, u.y) < w.half + u.r + 12) hurt(s, u, 1);", "      for (const u of s.soldiers) if (alive(u) && wallDist(w, u.x, u.y) < w.half + u.r + 12) sansEncre(s, () => hurt(s, u, 1));")
rep("        const fl = flying(s, a); if (pushOut(w, a) && fl) stun(s, a);", """        const fl = flying(s, a), pousse = pushOut(w, a);
        if (pousse && fl) stun(s, a);
        else if (pousse && lv(s, 'rempart') >= 2 && !a.iron && !(a.wallCd > 0)) {   // le rempart rejette en arrière : sonné
          const q = nearOnWall(w, a.x, a.y), nx = (a.x - q.x) / (q.d || 1), ny = (a.y - q.y) / (q.d || 1);
          stun(s, a); a.vx = nx * 560; a.vy = ny * 560; a.wallCd = 1.5; s.fx.push({ k: 'bonk', x: a.x, y: a.y, life: 0.2, max: 0.2 });
        }""")
rep("    for (const w of s.walls) w.life -= dt;\n    s.walls = s.walls.filter(w => w.life > 0);", """    for (const w of s.walls) w.life -= dt;
    if (lv(s, 'rempart') >= 3) for (const w of s.walls) if (w.life <= 0) {   // le rempart explose en disparaissant
      const m = w.pts[Math.floor(w.pts.length / 2)]; s.fx.push({ k: 'fireball', x: m.x, y: m.y, life: 0.45, max: 0.45, stone: true }); s.shake = Math.max(s.shake, 0.2);
      sansEncre(s, () => { for (const u of [...s.soldiers]) if (u.hp > 0 && wallDist(w, u.x, u.y) < w.half + u.r + 75) { stun(s, u); hurt(s, u, 5); } });
    }
    s.walls = s.walls.filter(w => w.life > 0);""")
# les boulets et la tornade viennent d'une rune : pas d'encre
rep("    hurt(s, v, 2);\n  }\n  function hit(s, f, n) {", "    sansEncre(s, () => hurt(s, v, 2));\n  }\n  function hit(s, f, n) {")
rep("      for (const v of s.soldiers) if (v.hp > 0 && v !== u && dist(u, v) < 105 + v.r) { stun(s, v); hurt(s, v, 4); }\n      hurt(s, u, 4);", "      sansEncre(s, () => { for (const v of [...s.soldiers]) if (v.hp > 0 && v !== u && dist(u, v) < 105 + v.r) { stun(s, v); hurt(s, v, 4); } hurt(s, u, 4); });")
rep("if (alive(u) && Math.hypot(u.x - tn.x, u.y - tn.y) < 110) hurt(s, u, 2); }", "if (alive(u) && Math.hypot(u.x - tn.x, u.y - tn.y) < 110) sansEncre(s, () => hurt(s, u, 2)); }")
rep("        for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(p.x - u.x, p.y - u.y) < u.r + 8) { p.life = 0; hurt(s, u, s.cfg.reflectDmg); break; }", "        for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(p.x - u.x, p.y - u.y) < u.r + 8) { p.life = 0; if (p.mur) sansEncre(s, () => hurt(s, u, s.cfg.reflectDmg)); else hurt(s, u, s.cfg.reflectDmg); break; }")
rep("        p.back = true; p.vx = -p.vx * 1.4; p.vy = -p.vy * 1.4; p.life = Math.max(p.life, 1.6);\n        s.fx.push({ k: 'pop', x: p.x, y: p.y - 20, t: 'renvoyée !', life: 0.6, max: 0.6, col: '#ffe58a' });\n        continue;\n      }\n      for (const f of targets(s))", "        p.back = true; p.mur = true; p.vx = -p.vx * 1.4; p.vy = -p.vy * 1.4; p.life = Math.max(p.life, 1.6);\n        s.fx.push({ k: 'pop', x: p.x, y: p.y - 20, t: 'renvoyée !', life: 0.6, max: 0.6, col: '#ffe58a' });\n        continue;\n      }\n      for (const f of targets(s))")

# ---------- le rayon et les orbes gardiennes (à chaque instant, avec les autres pouvoirs) ----------
rep("    // encre vive\n", """    // le rayon : il part du Sage vers le golem le plus proche et traverse toute la salle
    const RA = lv(s, 'rayon');
    if (RA) {
      s.rayT = (s.rayT ?? 1) - dt;
      if (s.rayT <= 0) {
        let tg = null, bd = 560; for (const u of s.soldiers) { const d = dist(u, sg); if (alive(u) && d < bd) { bd = d; tg = u; } }
        if (!tg) s.rayT = 0.3;
        else {
          s.rayT = UP.rayonT[RA]; const dx = (tg.x - sg.x) / (bd || 1), dy = (tg.y - sg.y) / (bd || 1), W2 = UP.rayonW[RA], dg = UP.rayonD[RA] + lv(s, 'lourd');
          for (const sens of RA >= 3 ? [1, -1] : [1]) {
            const b = { x: sg.x + dx * 1300 * sens, y: sg.y + dy * 1300 * sens };
            for (const u of [...s.soldiers]) { if (!alive(u)) continue; const q = nearOnSeg(sg, b, u.x, u.y); if (Math.hypot(u.x - q.x, u.y - q.y) < u.r + W2) hurt(s, u, dg); }
            s.fx.push({ k: 'beam', a: { x: sg.x, y: sg.y }, b: { x: Math.max(-40, Math.min(W + 40, b.x)), y: Math.max(-40, Math.min(H + 40, b.y)) }, life: 0.3, max: 0.3, ray: true });
          }
        }
      }
    }
    // les orbes gardiennes : elles tournent tout près du Sage
    const GA = lv(s, 'gardiennes');
    if (GA) {
      s.gardA = (s.gardA || 0) + dt * 4.2; s.gardHit = s.gardHit || {};
      for (const id in s.gardHit) { s.gardHit[id] -= dt; if (s.gardHit[id] <= 0) delete s.gardHit[id]; }
      const n = UP.gardN[GA], R = UP.gardR[GA];
      for (let i = 0; i < n; i++) {
        const a = s.gardA + i * Math.PI * 2 / n, px = sg.x + Math.cos(a) * R, py = sg.y + Math.sin(a) * R;
        for (const u of s.soldiers) if (alive(u) && !s.gardHit[u.id] && Math.hypot(u.x - px, u.y - py) < u.r + 15) {
          s.gardHit[u.id] = 0.5;
          if (GA >= 2 && !u.iron && !u.ball) { const dx = u.x - sg.x, dy = u.y - sg.y, d = Math.hypot(dx, dy) || 1; u.vx = dx / d * 430; u.vy = dy / d * 430; }
          hurt(s, u, UP.gardD[GA] + lv(s, 'lourd'));
        }
        for (const p of s.stones) if (!p.back && Math.hypot(p.x - px, p.y - py) < 20) p.life = 0;
      }
      if (GA >= 3) { s.gardT = (s.gardT ?? 4) - dt; if (s.gardT <= 0 && s.soldiers.length) { s.gardT = 4; for (let i = 0; i < n; i++) { const a = s.gardA + i * Math.PI * 2 / n; s.bolts.push({ x: sg.x + Math.cos(a) * R, y: sg.y + Math.sin(a) * R, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, life: 0.9, dmg: s.cfg.boltDmg + lv(s, 'lourd') + 1, pierce: 2 + UP.percant[lv(s, 'percant')], hit: [], staff: true, star: true, rico: UP.ricoN[lv(s, 'ricochet')] }); } s.fx.push({ k: 'nova', x: sg.x, y: sg.y, life: 0.5, max: 0.5 }); } }
    }
    // encre vive
""")
# les étoiles de la pluie d'étoiles sont des orbes du bâton (elles portent le givre, la braise, les explosions)
rep("pierce: UP.percant[lv(s, 'percant')], hit: [], star: true, bounce: L >= 2 ? 2 : 0 }); }", "pierce: UP.percant[lv(s, 'percant')], hit: [], star: true, staff: true, bounce: L >= 2 ? 2 : 0 }); }")

rep("choose, openChoice, cardPool, lv, combosReady, turnRune };", "choose, openChoice, cardPool, lv, combosReady, turnRune, hint, avance };")
rep("say(s, 'Une page du grimoire est tombée ! Va la toucher.', 2.4);", "say(s, 'Une page du grimoire est tombée ! Passe dessus.', 2.4);")
open(D + '/logic19.js', 'w').write(s)
print('logic19.js écrit :', len(s), 'caractères')
