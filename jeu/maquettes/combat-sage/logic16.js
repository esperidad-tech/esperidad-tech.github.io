// Le Sage contre Grosbec — maquette 16 : la grande salle vue de haut, Grosbec et ses golems (ceux du combat du Barde) ; 10 combos à 3 niveaux, la colère de Grosbec
const G = (() => {
  const W = 900, H = 900;
  const CFG = {
    protection: 20, inkMax: 12, inkStart: 8, cost: { trait: 2, poussee: 2, mur: 2, spirale: 'moitie' },
    boltEvery: 0.55, boltDmg: 1, boltRange: 340, boltSpeed: 760, sageSpeed: 300, slow: 0.07,
    magnet: 120, pickup: 30,
    traitDmg: 2, traitWidth: 28, shatterR: 85, shatterDmg: 2,
    daze: 3, flyMin: 240, wallLife: 3, wallMax: 520, wallHalf: 15, wallSlowR: 70, wallSlow: 0.45, reflectDmg: 2, vMax: 95,
    repelR: 270, repelV: 1150, pushV: 1100,
    duree: 480, codeTimes: null, codeBonus: 3, maxAlive: 75, regen: 10,
    rate0: 0.35, rateAdd: 0.65, rateRamp: 180, burst0: 5, burstDiv: 35, burstEvery: 28,
    // ça durcit avec le temps (en minutes vraies, comme les combats des amis)
    pageFirst: 1, pageStep: 1.5,
    hpEvery: 90, hpGrosEvery: 60, hpGros: 2, sideEvery: 180, shootersX2At: 600,
    // les amis libérés
    volleyCd: 2.6, volleyN: 4, arrowDmg: 2, daggerR: 70, daggerCd: 1.2, daggerDmg: 2,
    potionCd: 2, puddleR: 85, puddleLife: 5, mudSlow: 0.2, burnT: 4, burnDmg: 1,
    noteCd: 2.5, noteSpeed: 330, noteRange: 520, charmT: 3
  };
  const GROS = ['brute', 'costaud'];
  // ----- les cartes du grimoire : on en choisit une parmi trois à chaque page ramassée -----
  // l = le niveau qu'on obtient en la prenant (1, 2 ou 3)
  const CARDS = {
    double: { fam: 'baton', nom: 'Double orbe', ic: '✨', max: 3, txt: l => `Le bâton tire ${l + 1} orbes à la fois.` },
    lourd: { fam: 'baton', nom: 'Orbe lourd', ic: '☄️', max: 3, txt: l => `Chaque orbe fait ${l + 1} dégâts au lieu de 1.` },
    rapide: { fam: 'baton', nom: 'Tir rapide', ic: '💨', max: 3, txt: l => ['', 'Le bâton tire plus vite.', 'Le bâton tire encore plus vite.', 'Le bâton tire deux fois plus vite.'][l] },
    percant: { fam: 'baton', nom: 'Orbe perçant', ic: '🎯', max: 3, txt: l => ['', 'L’orbe traverse 2 golems.', 'L’orbe traverse 4 golems.', 'L’orbe traverse toute la file.'][l] },
    encrier: { fam: 'rune', nom: 'Grand encrier', ic: '🖋️', max: 3, txt: l => `${12 + 2 * l} d’encre au lieu de 12, et l’encrier se remplit.` },
    brulant: { fam: 'rune', nom: 'Trait brûlant', ic: '🔥', max: 3, txt: l => `Le trait laisse une ligne de feu pendant ${l + 1} secondes.` },
    epines: { fam: 'rune', nom: 'Mur d’épines', ic: '🌵', max: 3, txt: l => `Le mur blesse les golems collés contre lui (${l} par seconde).` },
    tonnerre: { fam: 'rune', nom: 'V tonnerre', ic: '🌩️', max: 3, txt: l => `Les golems chassés par le V sont sonnés ${['', '1,5', '2,5', '3,5'][l]} secondes.` },
    pages: { fam: 'sort', nom: 'Pages volantes', ic: '📃', max: 3, txt: l => `${l + 1} pages tournent autour du Sage et coupent les golems.` },
    sceau: { fam: 'sort', nom: 'Sceau de garde', ic: '🔆', max: 3, txt: l => l === 1 ? 'Un cercle doré autour des amis blesse les golems qui y entrent.' : 'Le cercle doré grandit et blesse plus souvent.' },
    piege: { fam: 'sort', nom: 'Rune piège', ic: '💫', max: 3, txt: l => `Une rune s’allume sous les golems et les sonne, toutes les ${['', '5', '4', '3'][l]} secondes.` },
    chaine: { fam: 'sort', nom: 'Lumière en chaîne', ic: '⚡', max: 3, txt: l => `Un éclair saute de golem en golem : ${['', '3', '5', '7'][l]} golems.` },
    bouclier: { fam: 'sort', nom: 'Bouclier de cristal', ic: '💎', max: 3, txt: l => `Chaque ami a un bouclier qui encaisse un coup. Il revient en ${['', '20', '15', '10'][l]} secondes.` },
    chouette: { fam: 'sort', nom: 'La chouette du Sage', ic: '🦉', max: 3, txt: l => `Elle fond sur les frondeurs : ${['', '3', '5', '8'][l]} dégâts.` },
    solide: { fam: 'rune', nom: 'Mur solide', ic: '🧱', max: 3, txt: l => `Le mur dure ${3 + l} secondes au lieu de 3.` },
    large: { fam: 'rune', nom: 'Trait large', ic: '🖌️', max: 3, txt: l => ['', 'Le trait touche plus large.', 'Le trait touche encore plus large.', 'Le trait touche très large.'][l] },
    aimant: { fam: 'cadeau', nom: 'Aimant', ic: '🧲', max: 3, txt: l => 'Les éclats d’encre viennent à toi de plus loin.' },
    pas: { fam: 'cadeau', nom: 'Pas léger', ic: '👟', max: 3, txt: l => ['', 'Le Sage court plus vite.', 'Le Sage court encore plus vite.', 'Le Sage court très vite.'][l] },
    moisson: { fam: 'cadeau', nom: 'Moisson d’encre', ic: '🦑', max: 3, txt: l => `Les gros golems lâchent ${l} éclat${l > 1 ? 's' : ''} d’encre de plus.` },
    // les 10 combos : une carte dorée, 3 niveaux ; elle sort quand on a les deux cartes (l'une au moins au niveau 2)
    bowling: { fam: 'combo', of: ['tonnerre', 'solide'], nom: 'Golems-boulets', ic: '🎳', max: 3, txt: l => ['', 'Le V ne coûte plus que 1. Les golems chassés deviennent des boulets : ils rebondissent partout et renversent tout ce qu’ils touchent.', 'Les golems renversés deviennent boulets à leur tour : réaction en chaîne !', 'Chaque boulet explose à la fin de sa course.'][l] },
    orage: { fam: 'combo', of: ['piege', 'chaine'], nom: 'Orage', ic: '⛈️', max: 3, txt: l => ['', 'Un golem qui éclate fait tomber la foudre sur 3 golems autour : ils sont sonnés.', 'La foudre fait éclater les golems déjà sonnés : réaction en chaîne !', 'Toutes les 6 secondes, un orage tombe tout seul sur la place.'][l] },
    volcan: { fam: 'combo', of: ['brulant', 'epines'], nom: 'Volcan', ic: '🌋', max: 3, txt: l => ['', 'Le feu brûle deux fois plus fort et saute de golem en golem. Le mur met le feu aussi.', 'Un golem qui meurt en brûlant explose en boule de feu et enflamme ses voisins.', 'Les golems en feu courent partout en paniquant, et le trait laisse une coulée de lave.'][l] },
    etoiles: { fam: 'combo', of: ['double', 'rapide'], nom: 'Pluie d’étoiles', ic: '🌠', max: 3, txt: l => ['', 'Toutes les 5 secondes, 12 étoiles partent tout autour du Sage.', 'Toutes les 3 secondes, et les étoiles rebondissent sur les bords.', 'Chaque étoile qui détruit un golem éclate en 3 étoiles.'][l] },
    comete: { fam: 'combo', of: ['pas', 'percant'], nom: 'La comète', ic: '🌟', max: 3, txt: l => ['', 'Le Sage court plus vite et laisse une large traînée d’étoiles qui brûle fort les golems et arrête les braises.', 'La traînée sonne les golems qui la touchent et renvoie les braises ; le Sage projette ceux qu’il percute.', 'La traînée explose derrière lui : les golems sonnés éclatent, les autres sont sonnés.'][l] },
    scribe: { fam: 'combo', of: ['encrier', 'moisson'], nom: 'Le scribe fou', ic: '🐙', max: 3, txt: l => ['', 'Les runes coûtent 1 encre de moins, et l’encre remonte toute seule.', 'Combo ×4 avec une rune : FRÉNÉSIE ! 6 secondes d’encre gratuite.', 'Chaque rune a un écho : elle se relance toute seule juste après. La frénésie arrive dès ×3.'][l] },
    tornade: { fam: 'combo', of: ['pages', 'aimant'], nom: 'Tornade de pages', ic: '🌀', max: 3, txt: l => ['', 'L’escargot ne coûte plus que 4. Les pages s’envolent en spirale jusqu’au bord de la place, puis reviennent.', 'L’escargot devient une tornade : elle aspire les golems, puis les recrache sonnés (un trait les fait éclater).', 'La tornade dure plus longtemps, se promène vers la foule et déchiquette les golems.'][l] },
    sanctuaire: { fam: 'combo', of: ['sceau', 'bouclier'], nom: 'Sanctuaire', ic: '🏛️', max: 3, txt: l => ['', 'Quand un bouclier casse, le sceau sonne tous les golems du cercle.', 'Toutes les 8 secondes, le sceau pulse et projette les golems du cercle au loin.', 'L’onde du sceau fait éclater les golems sonnés.'][l] },
    chouettes: { fam: 'combo', of: ['chouette', 'lourd'], nom: 'Parlement des chouettes', ic: '🦉', max: 3, txt: l => ['', 'Une deuxième chouette, et chaque coup de bec lance un éclair.', 'Quatre chouettes, et toujours les éclairs !', 'Les chouettes attrapent les golems et les jettent sur les autres.'][l] },
    miroir: { fam: 'combo', of: ['large', 'encrier'], nom: 'Rune miroir', ic: '🌗', max: 3, txt: l => ['', 'Chaque rune est recopiée gratuitement de l’autre côté des amis.', 'Trois copies : en face, et un quart de tour de chaque côté.', 'Mandala : sept copies tout autour des amis !'][l] },
    soin: { fam: 'cadeau', nom: 'Protection', ic: '💙', max: 99, txt: () => '+5 de protection, tout de suite.' }
  };
  const SORTS_MAX = 4;
  const lv = (s, id) => s.up[id] || 0;
  const UP = { // les valeurs, niveau 0 à 3
    rapide: [1, 0.8, 0.65, 0.5], percant: [0, 1, 3, 99], brulant: [0, 2, 3, 4], epines: [0, 1, 2, 3], tonnerre: [0, 1.5, 2.5, 3.5],
    pagesN: [0, 2, 3, 4], pagesR: [0, 75, 85, 95], sceauR: [0, 130, 160, 190], sceauT: [0, 1, 0.8, 0.6],
    piegeT: [0, 5, 4, 3], piegeR: [0, 75, 90, 105], chaineN: [0, 3, 5, 7], chaineT: [0, 3, 2.6, 2.2],
    bouclierT: [0, 20, 15, 10], chouetteD: [0, 3, 5, 8], chouetteT: [0, 3.2, 2.6, 2], aimant: [120, 220, 320, 450]
  };
  // un combo est prêt quand on a ses deux cartes, l'une au moins au niveau 2 ; ensuite ses niveaux 2 et 3 sortent aussi
  const comboReady = (s, id) => { const [a, b] = CARDS[id].of; const l = lv(s, id); return l > 0 ? l < 3 : lv(s, a) && lv(s, b) && Math.max(lv(s, a), lv(s, b)) >= 2; };
  const combosReady = s => Object.keys(CARDS).filter(id => CARDS[id].fam === 'combo' && comboReady(s, id));
  function cardPool(s) {
    const sorts = Object.keys(CARDS).filter(id => CARDS[id].fam === 'sort' && lv(s, id) > 0).length;
    const pool = Object.keys(CARDS).filter(id => id !== 'soin' && CARDS[id].fam !== 'combo' && lv(s, id) < CARDS[id].max && (CARDS[id].fam !== 'sort' || lv(s, id) > 0 || sorts < SORTS_MAX));
    if (s.protection < s.cfg.protection - 4 || pool.length < 3) pool.push('soin');
    return pool;
  }
  function openChoice(s) {
    const pool = cardPool(s), cards = [], ready = combosReady(s);
    if (ready.length) { // un combo prêt sort à coup sûr (les nouveaux d'abord) ; deux s'il y en a beaucoup
      const fresh = ready.filter(id => !lv(s, id)), from = fresh.length ? fresh : ready;
      cards.push(from.splice(Math.floor(rng(s) * from.length), 1)[0]);
      const rest = ready.filter(id => !cards.includes(id)); if (rest.length >= 2) cards.push(rest[Math.floor(rng(s) * rest.length)]);
    }
    while (cards.length < 3 && pool.length) cards.push(pool.splice(Math.floor(rng(s) * pool.length), 1)[0]);
    s.choice = { cards };
  }
  function choose(s, id) {
    if (!s.choice || !s.choice.cards.includes(id)) return false;
    const c = s.cfg, l = (s.up[id] || 0) + 1;
    if (id !== 'soin') s.up[id] = l;
    if (id === 'soin') s.protection = Math.min(c.protection, s.protection + 5);
    if (id === 'encrier') { c.inkMax = 12 + 2 * l; s.ink = c.inkMax; }
    if (id === 'aimant') c.magnet = UP.aimant[l];
    if (id === 'bouclier') for (const f of s.friends) { f.shield = 1; f.shieldT = 0; }
    if (id === 'chouette' && !s.owls.length) s.owls.push({ x: s.sage.x, y: s.sage.y - 60, mode: 'tour', t: 0, cd: 1.5, a: 0 });
    if (id === 'chouettes') { const want = l >= 2 ? 4 : 2; while (s.owls.length < want) s.owls.push({ x: s.sage.x, y: s.sage.y - 60, mode: 'tour', t: 0, cd: 0.5 + s.owls.length * 0.4, a: s.owls.length * Math.PI / 2 }); }
    if (id === 'large') c.traitWidth = 28 + 12 * l;
    if (id === 'pas' || id === 'comete') c.sageSpeed = 300 + 60 * lv(s, 'pas') + (lv(s, 'comete') ? 70 : 0);
    if (id === 'solide' || id === 'volcan') c.wallLife = 3 + lv(s, 'solide') + (lv(s, 'volcan') ? 2 : 0);
    s.choice = null; s.pagesTaken++;
    const C = CARDS[id];
    say(s, C.fam === 'combo' ? `Combo ! ${C.nom}${l > 1 ? ` niveau ${l}` : ''} : ${C.txt(l)}` : `${C.nom}${id === 'soin' ? '' : ` (niveau ${l})`} : ${C.txt(l)}`, 3.5);
    return true;
  }
  const TYPES = {
    cogneur: { r: 18, hp: 3, speed: 55, dmg: 1, rate: 1.0, shards: 1 },
    coureur: { r: 13, hp: 1, speed: 118, dmg: 1, rate: 0.8, shards: 1 },
    brute: { r: 23, hp: 7, speed: 48, dmg: 1, rate: 0.9, shards: 2 },
    costaud: { r: 30, hp: 16, speed: 34, dmg: 2, rate: 1.2, shards: 3 },
    lanceur: { r: 16, hp: 2, speed: 60, dmg: 1, rate: 2.4, shards: 1, range: 240 }
  };
  const SYMS = ['🔥', '💧', '🌙', '⭐', '🔑', '🍃'];
  const CODES = { P: ['🔥', '🌙', '⭐'], A: ['⭐', '🔥', '💧'], B: ['🔑', '💧', '🍃'] };
  const ORDER = ['P', 'A', 'B'];
  const POSTE = { P: 'les jambes', A: 'le bras', B: 'le casque' };
  const HEART = { x: 450, y: 175 };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  function rng(s) { let t = (s.seed = (s.seed + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }

  function newGame(o = {}) {
    const cfg = { ...CFG, ...(o.cfg || {}) };
    if (o.cfg && o.cfg.cost) cfg.cost = { ...CFG.cost, ...o.cfg.cost };
    const s = {
      cfg, W, H, t: 0, realT: 0, seed: o.seed ?? ((Math.random() * 1e9) | 0),
      friends: [
        { id: 'B', nom: 'le Barde', x: 450, y: 405, r: 27, flash: 0, free: false, cd: 0 },
        { id: 'P', nom: 'le Pisteur', x: 410, y: 468, r: 27, flash: 0, free: false, cd: 0 },
        { id: 'A', nom: "l'Alchimiste", x: 490, y: 468, r: 27, flash: 0, free: false, cd: 0 }],
      sage: { x: 450, y: 600, r: 22, tx: null, ty: null, aim: [0, -1] },
      heart: { bare: false },
      soldiers: [], bolts: [], stones: [], shards: [], walls: [], fx: [], puddles: [], potions: [], notes: [],
      pages: [], choice: null, up: {}, grosKills: 0, pageIdx: 0, pageNeed: cfg.pageFirst, pagesTaken: 0, orbitA: 0, orbitR: 0, tourT: 0, orbitHit: {}, sealT: 0, traps: [], trapT: 2, chainT: 1, firelines: [], owls: [], inkT: 0, novaT: 2, orageLeft: 0, ballChain: 0, strikeN: 0, echoes: [], stormT: 6, trail: [], trailHit: {}, trailD: 0, frenzy: 0, tornados: [], pulseT: 8, rage: 0,
      protection: cfg.protection, ink: cfg.inkStart, boltT: 0, spawnT: 1.5, burstT: 22, regenT: 0,
      announced: [], entered: [], combo: 0, comboT: 0, bestCombo: 0, inRune: false, runeKills: 0,
      kills: 0, runes: 0, nextId: 1, over: null, shake: 0, msg: '', msgT: 0
    };
    // l'ordre où les amis finissent leur combat change à chaque partie
    const order = [...ORDER]; for (let i = 2; i > 0; i--) { const j = Math.floor(rng(s) * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const times = cfg.codeTimes || [0.5, 0.75, 1].map((k, i) => Math.round(cfg.duree * k * (i < 2 ? 0.9 + rng(s) * 0.2 : 1)));
    s.order = order; s.codeAt = Object.fromEntries(order.map((id, i) => [id, times[i]]));
    return s;
  }
  const minutes = s => s.realT / 60;
  // après 15 minutes, la fureur du cœur : +3 vies à tous toutes les 30 secondes
  const fury = s => Math.max(0, (s.rage || 0) - 2);
  const bonusHp = (s, type) => (GROS.includes(type) ? s.cfg.hpGros * Math.floor(s.realT / s.cfg.hpGrosEvery) : Math.floor(s.realT / s.cfg.hpEvery)) + 3 * fury(s);
  const sidesNow = s => Math.min(4, 1 + Math.floor(s.realT / s.cfg.sideEvery));
  function say(s, m, d = 1.8) { s.msg = m; s.msgT = d; }
  const targets = s => s.friends.filter(f => !f.free);

  // ----- les soldats -----
  function pickType(s) {
    const t = s.t, r = rng(s);
    if (t > 55 && r < 0.06) return 'costaud';
    if (t > 40 && r < 0.17) return 'lanceur';
    if (t > 25 && r < 0.33) return 'brute';
    if (t > 12 && r < 0.55) return 'coureur';
    return 'cogneur';
  }
  // les deux portes du mur du fond : [gauche, droite] de chacune ; un golem « du haut » sort par l'une des deux
  const PORTES = [[70, 230], [670, 830]];
  const porte = p => { const u = Math.max(0, Math.min(1, (p - 40) / 820)), P = PORTES[u < 0.5 ? 0 : 1], v = u < 0.5 ? u * 2 : (u - 0.5) * 2; return P[0] + v * (P[1] - P[0]); };
  function spawn(s, type, side, twin) {
    const T = TYPES[type], sd = side ?? Math.floor(rng(s) * 4), p = twin ?? rng(s) * 820 + 40, m = -30;
    const xy = [[porte(p), 30], [W - m, p], [p, H - m], [m, p]][sd], hp = T.hp + bonusHp(s, type);
    // pendant la fureur, de plus en plus de golems sont cuirassés : on ne peut plus les sonner
    const iron = fury(s) > 0 && rng(s) < Math.min(0.9, 0.25 + 0.15 * (fury(s) - 1));
    s.soldiers.push({ id: s.nextId++, type, x: xy[0], y: xy[1], r: T.r, hp, max: hp, vx: 0, vy: 0, atk: 0.5, daze: 0, flash: 0, burn: 0, burnCd: 0, burnTick: 0, held: false, fear: 0, dance: 0, charmCd: 0, iron });
    // après 10 minutes : deux fois plus de lanceurs
    if (type === 'lanceur' && twin === undefined && s.realT >= s.cfg.shootersX2At) spawn(s, 'lanceur', sd, Math.max(40, Math.min(860, p + 44)));
  }
  function spawning(s, dt) {
    if (s.heart.bare) return;
    const c = s.cfg, rate = (c.rate0 + c.rateAdd * Math.min(1, s.t / c.rateRamp)) * (1 + 0.6 * s.rage);
    s.spawnT -= dt;
    const cap = c.maxAlive + 15 * fury(s);
    if (s.spawnT <= 0 && s.soldiers.length < cap) { spawn(s, pickType(s)); s.spawnT = 1 / rate * (0.6 + rng(s) * 0.8); }
    s.burstT -= dt;
    if (s.burstT <= 0) {
      // toutes les 3 minutes, la grosse vague arrive d'un côté de plus
      const n = c.burst0 + Math.floor(s.t / c.burstDiv), k = sidesNow(s), sides = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) { const j = Math.floor(rng(s) * (i + 1)); [sides[i], sides[j]] = [sides[j], sides[i]]; }
      for (const side of sides.slice(0, k)) {
        for (let i = 0; i < n && s.soldiers.length < cap; i++) spawn(s, pickType(s), side);
        s.fx.push({ k: 'side', side, life: 2.4, max: 2.4 });
      }
      const NOMS = ['par le haut', 'par la droite', 'par le bas', 'par la gauche'];
      say(s, k === 1 ? `Grosse vague ${NOMS[sides[0]]} : ${n} golems !` : k === 4 ? `Grosses vagues de tous les côtés : ${n} golems chacune !` : `Grosses vagues ${sides.slice(0, k).map(i => NOMS[i]).join(' et ')} : ${n} golems chacune !`, 2.6);
      s.burstT = c.burstEvery;
    }
  }

  // ----- dégâts -----
  function hurt(s, u, n) {
    if (u.hp <= 0) return 0;
    u.hp -= n; u.flash = 0.12;
    s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 8, t: '−' + n, life: 0.7, max: 0.7, col: '#ff8a9a' });
    if (u.hp <= 0) { die(s, u); return 1; }
    return 0;
  }
  function die(s, u) {
    s.kills++;
    if (s.inRune) { s.runeKills++; s.bestCombo = Math.max(s.bestCombo, s.runeKills); }
    const n = TYPES[u.type].shards + (s.inRune && s.runeKills >= 3 ? 1 : 0) + (GROS.includes(u.type) ? lv(s, 'moisson') : 0);
    for (let i = 0; i < n; i++) s.shards.push({ x: u.x + (rng(s) - .5) * 34, y: u.y + (rng(s) - .5) * 34, t: rng(s) * 6 });
    for (let i = 0; i < 8; i++) { const a = rng(s) * 6.28, v = 80 + rng(s) * 160; s.fx.push({ k: 'bit', x: u.x, y: u.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, max: 0.5, col: u.daze > 0 ? '#ffe58a' : '#9aa3b5' }); }
    if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.25);
    if (lv(s, 'volcan') >= 2 && u.burn > 0) {
      s.fx.push({ k: 'fireball', x: u.x, y: u.y, life: 0.5, max: 0.5 });
      for (const v of s.soldiers) if (v !== u && v.hp > 0 && dist(u, v) < 85 + v.r) { if (v.burn <= 0) { v.burn = s.cfg.burnT; v.burnTick = 0.4; } hurt(s, v, 3); }
    }
    if (lv(s, 'etoiles') >= 3 && u.lastStar && s.bolts.length < 260) {
      for (let i = 0; i < 3; i++) { const a = rng(s) * Math.PI * 2; s.bolts.push({ x: u.x, y: u.y, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, life: 0.7, dmg: 2, pierce: 0, hit: [u.id], star: true, small: true, bounce: 1 }); }
    }
    // une page du grimoire : au 2e gros détruit, puis il en faut un de plus à chaque fois (3, 4, 5…)
    if (GROS.includes(u.type) && ++s.grosKills >= s.pageNeed) {
      s.grosKills = 0; s.pageIdx++; s.pageNeed = s.cfg.pageFirst + Math.floor(s.cfg.pageStep * s.pageIdx);
      s.pages.push({ x: Math.max(40, Math.min(W - 40, u.x)), y: Math.max(60, Math.min(H - 40, u.y)), t: 0 });
      say(s, 'Une page du grimoire est tombée ! Va la toucher.', 2.4);
    }
  }
  // un soldat sonné, touché par la lumière, éclate ; ses éclats touchent les voisins (en chaîne)
  function shatter(s, u) {
    if (u.hp <= 0) return;
    if (u.iron) { hurt(s, u, 3); return; }
    u.hp = 0; die(s, u);
    s.fx.push({ k: 'burst', x: u.x, y: u.y, R: s.cfg.shatterR, life: 0.4, max: 0.4 });
    s.shake = Math.max(s.shake, 0.15);
    for (const v of s.soldiers) {
      if (v === u || v.hp <= 0 || dist(u, v) > s.cfg.shatterR + v.r) continue;
      if (v.daze > 0) shatter(s, v); else hurt(s, v, s.cfg.shatterDmg);
    }
    if (lv(s, 'orage') && s.orageLeft > 0) {
      const near = s.soldiers.filter(v => v.hp > 0 && v !== u && dist(u, v) < 230).sort((a, b) => dist(u, a) - dist(u, b)).slice(0, Math.min(3, s.orageLeft));
      for (const v of near) {
        if (v.hp <= 0) continue;
        s.orageLeft--; s.fx.push({ k: 'chain', pts: [{ x: u.x, y: u.y }, { x: v.x, y: v.y }], life: 0.35, max: 0.35, gold: true });
        if (lv(s, 'orage') >= 2 && v.daze > 0) shatter(s, v); else { stun(s, v); hurt(s, v, 1); }
      }
    }
  }
  // un soldat projeté qui cogne quelque chose est sonné
  const flying = (s, u) => Math.hypot(u.vx, u.vy) > s.cfg.flyMin;
  function stun(s, u) {
    if (u.iron) return;
    if (u.daze < 0.5) s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 10, t: 'sonné !', life: 0.7, max: 0.7, col: '#ffe58a' });
    u.daze = Math.max(u.daze, s.cfg.daze); u.vx *= 0.15; u.vy *= 0.15;
  }

  // ----- les murs : exactement la forme de l'arc tracé, en épais -----
  function nearOnSeg(a, b, x, y) {
    const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
    const k = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L2));
    return { x: a.x + dx * k, y: a.y + dy * k };
  }
  function nearOnWall(w, x, y) {
    let best = null, bd = 1e9;
    for (let i = 1; i < w.pts.length; i++) { const q = nearOnSeg(w.pts[i - 1], w.pts[i], x, y), d = Math.hypot(x - q.x, y - q.y); if (d < bd) { bd = d; best = { x: q.x, y: q.y, d, i }; } }
    return best;
  }
  const wallDist = (w, x, y) => nearOnWall(w, x, y).d;
  function pushOut(w, u) {
    const q = nearOnWall(w, u.x, u.y), m = u.r + w.half;
    if (q.d >= m) return false;
    let nx = (u.x - q.x) / (q.d || 1), ny = (u.y - q.y) / (q.d || 1);
    if (q.d < 0.01) { const a = w.pts[q.i - 1], b = w.pts[q.i], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; nx = -(b.y - a.y) / L; ny = (b.x - a.x) / L; }
    u.x = q.x + nx * m; u.y = q.y + ny * m;
    return true;
  }
  function blocks(w, p, q, r) {
    for (let i = 0; i <= 16; i++) { const t = i / 16; if (wallDist(w, p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t) < r + w.half) return true; }
    return false;
  }
  function waypoint(s, u, tgt) { // contourner le mur : passer par le bout qui raccourcit le chemin
    for (const w of s.walls) {
      if (!blocks(w, u, tgt, u.r)) continue;
      const P = w.pts, n = P.length, m = u.r + w.half + 18;
      const end = (a, b) => { const L = Math.hypot(a.x - b.x, a.y - b.y) || 1; return { x: a.x + (a.x - b.x) / L * m, y: a.y + (a.y - b.y) / L * m }; };
      const ends = [end(P[0], P[Math.min(3, n - 1)]), end(P[n - 1], P[Math.max(0, n - 4)])];
      let best = null, bd = 1e9;
      for (const e of ends) { const d = dist(u, e) + dist(e, tgt); if (d < bd) { bd = d; best = e; } }
      return best;
    }
    return tgt;
  }
  const nearestTarget = (s, u) => targets(s).reduce((b, f) => (!b || dist(u, f) < dist(u, b) ? f : b), null);

  // ----- un pas de jeu -----
  function step(s, dtReal, brush) {
    if (s.over || s.choice) return;
    dtReal = Math.min(dtReal, 0.05);
    const dt = dtReal * (brush ? s.cfg.slow : 1);
    s.t += dt; s.realT += dtReal;
    if (s.msgT > 0) s.msgT -= dtReal;
    if (s.shake > 0) s.shake -= dtReal;
    if (s.comboT > 0) s.comboT -= dtReal;
    s.regenT += dt;
    if (s.regenT >= s.cfg.regen) { s.regenT = 0; if (s.protection < s.cfg.protection) s.protection++; }
    for (const id of s.order) if (!s.announced.includes(id) && s.realT >= s.codeAt[id]) {
      s.announced.push(id);
      say(s, `${cap(s.friends.find(x => x.id === id).nom)} a cassé ${POSTE[id]} ! Il te crie son code : ${CODES[id].join(' ')}`, 7);
    }
    spawning(s, dt);
    for (const w of s.walls) w.life -= dt;
    s.walls = s.walls.filter(w => w.life > 0);
    // le Sage (il passe à travers ses murs)
    const sg = s.sage;
    if (sg.tx !== null) {
      const dx = sg.tx - sg.x, dy = sg.ty - sg.y, d = Math.hypot(dx, dy);
      if (d > 4) { const v = Math.min(d, s.cfg.sageSpeed * dt); sg.x += dx / d * v; sg.y += dy / d * v; }
    }
    sg.x = Math.max(sg.r, Math.min(W - sg.r, sg.x)); sg.y = Math.max(sg.r, Math.min(H - sg.r, sg.y));
    for (const f of s.friends) { const d = dist(sg, f), m = sg.r + f.r; if (d < m && d > 0) { sg.x = f.x + (sg.x - f.x) / d * m; sg.y = f.y + (sg.y - f.y) / d * m; } }
    // le bâton tire tout seul
    s.boltT -= dt;
    if (s.boltT <= 0) {
      const n = 1 + lv(s, 'double'), near = s.soldiers.filter(u => u.hp > 0 && dist(sg, u) < s.cfg.boltRange).sort((a, b) => dist(sg, a) - dist(sg, b));
      if (near.length) {
        for (let i = 0; i < n; i++) {
          const tg = near[i % near.length], off = i >= near.length ? (i % 2 ? 0.18 : -0.18) * Math.ceil(i / near.length) : 0;
          const a = Math.atan2(tg.y - sg.y, tg.x - sg.x) + off;
          if (i === 0) sg.aim = [Math.cos(a), Math.sin(a)];
          s.bolts.push({ x: sg.x, y: sg.y, vx: Math.cos(a) * s.cfg.boltSpeed, vy: Math.sin(a) * s.cfg.boltSpeed, life: s.cfg.boltRange / s.cfg.boltSpeed + 0.1, dmg: s.cfg.boltDmg + lv(s, 'lourd'), pierce: UP.percant[lv(s, 'percant')], hit: [] });
        }
        s.boltT = s.cfg.boltEvery * UP.rapide[lv(s, 'rapide')];
      } else s.boltT = 0.1;
    }
    upgrades(s, dt);
    combos(s, dt);
    // les amis libérés aident, chacun avec son pouvoir
    const c = s.cfg;
    for (const f of s.friends) {
      if (!f.free) continue;
      f.cd -= dt; f.cd2 = (f.cd2 || 0) - dt; if (f.shoot > 0) f.shoot -= dt;
      if (f.leap) { f.leap.t -= dt; if (f.leap.t <= 0) f.leap = null; }
      const nearest = R => { let tg = null, b = R; for (const u of s.soldiers) { const d = dist(f, u); if (u.hp > 0 && d < b && !flying(s, u)) { b = d; tg = u; } } return tg; };
      if (f.id === 'P') {
        // un golem trop près : il lui saute dessus avec sa dague
        if (f.cd2 <= 0 && !f.leap) {
          let tg = null, b = c.daggerR; for (const u of s.soldiers) { const d = dist(f, u) - u.r - f.r; if (u.hp > 0 && d < b) { b = d; tg = u; } }
          if (tg) { f.leap = { x: tg.x, y: tg.y, t: 0.42, max: 0.42 }; s.fx.push({ k: 'slash', x: tg.x, y: tg.y, life: 0.35, max: 0.35 }); hurt(s, tg, c.daggerDmg); f.cd2 = c.daggerCd; }
        }
        // une salve de flèches en éventail
        if (f.cd <= 0) { const tg = nearest(460); if (tg) { const a0 = Math.atan2(tg.y - f.y, tg.x - f.x); for (let i = 0; i < c.volleyN; i++) { const a = a0 + (i - (c.volleyN - 1) / 2) * 0.11; s.bolts.push({ x: f.x, y: f.y, vx: Math.cos(a) * 900, vy: Math.sin(a) * 900, life: 0.62, dmg: c.arrowDmg, arrow: true }); } f.cd = c.volleyCd; f.shoot = 0.35; } }
      }
      if (f.id === 'A' && f.cd <= 0) {
        // une fiole là où les golems sont le plus serrés : boue, lianes ou feu, au hasard
        let best = null, bn = 0;
        for (const u of s.soldiers) { if (u.hp <= 0 || dist(u, f) > 460 || flying(s, u)) continue; let n = dist(u, { x: 450, y: 445 }) < 220 ? 1.5 : 0; for (const v of s.soldiers) if (dist(u, v) < c.puddleR) n++; if (n > bn) { bn = n; best = u; } }
        if (best) { s.potions.push({ x0: f.x, y0: f.y, x: best.x, y: best.y, t: 0, T: 0.55, kind: ['boue', 'lianes', 'feu'][Math.floor(rng(s) * 3)] }); f.cd = c.potionCd; f.shoot = 0.35; }
      }
      if (f.id === 'B' && f.cd <= 0) {
        // une partition : les golems qu'elle touche font demi-tour, ou se mettent à danser
        const tg = nearest(c.noteRange);
        if (tg) { const d = dist(f, tg) || 1; s.notes.push({ x: f.x, y: f.y, vx: (tg.x - f.x) / d * c.noteSpeed, vy: (tg.y - f.y) / d * c.noteSpeed, life: c.noteRange / c.noteSpeed, kind: ['demitour', 'danse', 'repousse'][Math.floor(rng(s) * 3)], hit: [] }); f.cd = c.noteCd; f.shoot = 0.35; }
      }
    }
    for (const p of s.potions) {
      p.t += dt;
      if (p.t >= p.T) { p.done = true; s.puddles.push({ x: p.x, y: p.y, R: c.puddleR, kind: p.kind, life: c.puddleLife, max: c.puddleLife }); s.fx.push({ k: 'flaque', x: p.x, y: p.y, kind: p.kind, life: 0.4, max: 0.4 }); }
    }
    s.potions = s.potions.filter(p => !p.done);
    for (const p of s.puddles) p.life -= dt;
    s.puddles = s.puddles.filter(p => p.life > 0);
    for (const n of s.notes) {
      n.x += n.vx * dt; n.y += n.vy * dt; n.life -= dt;
      for (const u of s.soldiers) {
        if (u.hp <= 0 || u.charmCd > 0 || n.hit.includes(u.id) || flying(s, u) || Math.hypot(u.x - n.x, u.y - n.y) > u.r + 30) continue;
        n.hit.push(u.id);
        if (n.kind === 'danse') { u.dance = c.charmT; u.fear = 0; }
        else if (n.kind === 'demitour') { u.fear = c.charmT; u.dance = 0; }
        else { const dx = u.x - 450, dy = u.y - 445, d = Math.hypot(dx, dy) || 1; u.vx = dx / d * c.pushV * 0.85; u.vy = dy / d * c.pushV * 0.85; u.daze = 0; u.charmCd = 1; }
        s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 12, t: { danse: 'danse !', demitour: 'demi-tour !', repousse: 'repoussé !' }[n.kind], life: 0.7, max: 0.7, col: { danse: '#ffb3e6', demitour: '#9fd8ff', repousse: '#ffcf7a' }[n.kind] });
      }
    }
    s.notes = s.notes.filter(n => n.life > 0);
    for (const b of s.bolts) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.bounce > 0 && (b.x < 8 || b.x > W - 8 || b.y < 8 || b.y > H - 8)) { if (b.x < 8 || b.x > W - 8) b.vx = -b.vx; if (b.y < 8 || b.y > H - 8) b.vy = -b.vy; b.x = Math.max(8, Math.min(W - 8, b.x)); b.y = Math.max(8, Math.min(H - 8, b.y)); b.bounce--; b.life = Math.max(b.life, 0.9); b.hit = []; }
      for (const u of s.soldiers) {
        if (u.hp <= 0 || (b.hit && b.hit.includes(u.id)) || Math.hypot(u.x - b.x, u.y - b.y) >= u.r + 6) continue;
        if (b.star) u.lastStar = true;
        hurt(s, u, b.dmg);
        u.lastStar = false;
        if (false) {
          const near = s.soldiers.filter(v => v !== u && v.hp > 0 && dist(u, v) < 150).sort((a, c) => dist(u, a) - dist(u, c)).slice(0, 2);
          for (const v of near) { hurt(s, v, 2); s.fx.push({ k: 'chain', pts: [{ x: u.x, y: u.y }, { x: v.x, y: v.y }], life: 0.22, max: 0.22 }); }
        }
        if (b.pierce > 0) { b.pierce--; b.hit.push(u.id); } else { b.life = 0; break; }
      }
    }
    s.bolts = s.bolts.filter(b => b.life > 0);
    // les soldats
    for (const u of s.soldiers) {
      if (u.flash > 0) u.flash -= dt;
      if (u.charmCd > 0) u.charmCd -= dt;
      if (u.knockCd > 0) u.knockCd -= dt;
      if (u.spit > 0) u.spit -= dt;
      if (u.burnCd > 0) u.burnCd -= dt;
      if (u.burn > 0) { u.burn -= dt; u.burnTick -= dt; if (u.burnTick <= 0) { u.burnTick = 1; hurt(s, u, c.burnDmg + (lv(s, 'volcan') ? 1 : 0)); if (lv(s, 'volcan')) for (const v of s.soldiers) if (v !== u && v.hp > 0 && v.burn <= 0 && v.burnCd <= 0 && dist(u, v) < u.r + v.r + 30) { v.burn = c.burnT; v.burnTick = 0.5; } } if (u.burn <= 0) u.burnCd = 3; }
      if (u.hp <= 0) continue;
      const fl = flying(s, u);
      u.x += u.vx * dt; u.y += u.vy * dt;
      if (u.ball) {
        const sp = Math.hypot(u.vx, u.vy) || 1; if (sp < 650) { u.vx *= 650 / sp; u.vy *= 650 / sp; }
        let bounced = false;
        if (u.x < u.r || u.x > W - u.r) { u.vx = -u.vx; bounced = true; }
        if (u.y < u.r || u.y > H - u.r) { u.vy = -u.vy; bounced = true; }
        u.x = Math.max(u.r, Math.min(W - u.r, u.x)); u.y = Math.max(u.r, Math.min(H - u.r, u.y));
        if (bounced) { u.ball.left--; s.fx.push({ k: 'bonk', x: u.x, y: u.y, life: 0.2, max: 0.2 }); }
        u.ball.t -= dt;
        if (u.ball.left < 0 || u.ball.t <= 0) endBall(s, u);
        continue;
      }
      const fr = Math.exp(-(fl ? 2.6 : 6) * dt); u.vx *= fr; u.vy *= fr;
      // projeté contre le bord : sonné
      if (u.x < u.r || u.x > W - u.r || u.y < u.r || u.y > H - u.r) {
        u.x = Math.max(u.r, Math.min(W - u.r, u.x)); u.y = Math.max(u.r, Math.min(H - u.r, u.y));
        if (fl && !u.spin) stun(s, u);
      }
      // les flaques de l'Alchimiste
      let slow = 1; u.held = false; u.mud = false;
      for (const p of s.puddles) {
        if (Math.hypot(u.x - p.x, u.y - p.y) > p.R) continue;
        if (p.kind === 'boue') { slow = Math.min(slow, c.mudSlow); u.mud = true; }
        else if (p.kind === 'lianes') u.held = true;
        else if (u.burn <= 0 && u.burnCd <= 0) { u.burn = c.burnT; u.burnTick = 0.5; }
      }
      if (u.daze > 0) { u.daze -= dt; continue; }
      if (fl || u.held || u.spin) continue;
      if (u.dance > 0) { u.dance -= dt; if (u.dance <= 0) u.charmCd = 1.5; continue; }
      const T = TYPES[u.type];
      if (lv(s, 'volcan') >= 3 && u.burn > 0) { // ils courent partout en paniquant (et passent le feu)
        u.panicA = (u.panicA ?? rng(s) * 6.28) + (rng(s) - 0.5) * 6 * dt; const v = T.speed * 1.4 * dt; u.x += Math.cos(u.panicA) * v; u.y += Math.sin(u.panicA) * v;
        if (u.x < u.r + 5 || u.x > W - u.r - 5 || u.y < u.r + 5 || u.y > H - u.r - 5) u.panicA += Math.PI; continue;
      }
      if (u.fear > 0) { // demi-tour : il repart vers le bord
        u.fear -= dt; if (u.fear <= 0) u.charmCd = 1.5;
        const dx = u.x - 450, dy = u.y - 445, d = Math.hypot(dx, dy) || 1, v = T.speed * slow * dt * (1 + 0.15 * s.rage); u.x += dx / d * v; u.y += dy / d * v; continue;
      }
      const f = nearestTarget(s, u);
      if (!f) { const d = dist(u, sg) || 1, v = T.speed * dt; u.x += (sg.x - u.x) / d * v; u.y += (sg.y - u.y) / d * v; continue; }
      const d = dist(u, f);
      if (s.walls.some(w => wallDist(w, u.x, u.y) < u.r + w.half + s.cfg.wallSlowR)) slow = Math.min(slow, s.cfg.wallSlow);
      const reach = T.range ? T.range : u.r + f.r + 4;
      if (d > reach) { const g = waypoint(s, u, f), dg = dist(u, g) || 1, v = T.speed * slow * dt * (1 + 0.15 * s.rage); u.x += (g.x - u.x) / dg * v; u.y += (g.y - u.y) / dg * v; }
      else {
        u.atk -= dt * slow;
        if (u.atk <= 0) {
          u.atk = T.rate;
          if (T.range) { const k = 230 / d; s.stones.push({ x: u.x, y: u.y, vx: (f.x - u.x) * k, vy: (f.y - u.y) * k, life: d / 230 + 0.2 }); }
          else hit(s, f, T.dmg);
          if (s.over) return;
        }
      }
    }
    // les pierres : le corps du Sage les arrête, le mur les renvoie d'où elles viennent
    for (const p of s.stones) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.back) {
        for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(p.x - u.x, p.y - u.y) < u.r + 8) { p.life = 0; hurt(s, u, s.cfg.reflectDmg); break; }
        continue;
      }
      if (Math.hypot(p.x - sg.x, p.y - sg.y) < sg.r + 9) { p.life = 0; s.fx.push({ k: 'pop', x: sg.x, y: sg.y - 34, t: 'paré !', life: 0.6, max: 0.6, col: '#bfefff' }); continue; }
      if (s.trail.length && lv(s, 'comete') && s.trail.some(q => Math.hypot(p.x - q.x, p.y - q.y) < 32)) { // la traînée de la comète arrête les pierres (et les renvoie, au niveau 2)
        if (lv(s, 'comete') >= 2) { p.back = true; p.vx = -p.vx * 1.4; p.vy = -p.vy * 1.4; p.life = Math.max(p.life, 1.6); s.fx.push({ k: 'pop', x: p.x, y: p.y - 20, t: 'renvoyée !', life: 0.6, max: 0.6, col: '#ffe58a' }); }
        else { p.life = 0; s.fx.push({ k: 'pop2', x: p.x, y: p.y, life: 0.25, max: 0.25 }); }
        continue;
      }
      if (s.walls.some(w => wallDist(w, p.x, p.y) < w.half + 8)) {
        p.back = true; p.vx = -p.vx * 1.4; p.vy = -p.vy * 1.4; p.life = Math.max(p.life, 1.6);
        s.fx.push({ k: 'pop', x: p.x, y: p.y - 20, t: 'renvoyée !', life: 0.6, max: 0.6, col: '#ffe58a' });
        continue;
      }
      for (const f of targets(s)) if (Math.hypot(p.x - f.x, p.y - f.y) < f.r + 7) { p.life = 0; hit(s, f, 1); break; }
      if (s.over) return;
    }
    s.stones = s.stones.filter(p => p.life > 0);
    // chocs et places
    const all = s.soldiers;
    for (let i = 0; i < all.length; i++) {
      const a = all[i];
      for (let j = i + 1; j < all.length; j++) {
        const b = all[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
        if (d < m && d > 0.01) {
          if (a.ball || b.ball) { if (a.ball) knock(s, a, b, dx / d, dy / d); if (b.ball) knock(s, b, a, -dx / d, -dy / d); }
          else if ((flying(s, a) || flying(s, b)) && !(a.spit > 0 && b.spit > 0) && !a.spin && !b.spin) { stun(s, a); stun(s, b); }
          if (a.burn > 0 && b.burn <= 0 && b.burnCd <= 0) { b.burn = c.burnT; b.burnTick = 0.5; }
          else if (b.burn > 0 && a.burn <= 0 && a.burnCd <= 0) { a.burn = c.burnT; a.burnTick = 0.5; }
          const o = (m - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
        }
      }
      for (const w of s.walls) {
        if (a.ball) { const q = nearOnWall(w, a.x, a.y); if (q.d < a.r + w.half) { const nx = (a.x - q.x) / (q.d || 1), ny = (a.y - q.y) / (q.d || 1), dot = a.vx * nx + a.vy * ny; if (dot < 0) { a.vx -= 2 * dot * nx; a.vy -= 2 * dot * ny; a.ball.left--; s.fx.push({ k: 'bonk', x: a.x, y: a.y, life: 0.2, max: 0.2 }); } pushOut(w, a); } continue; }
        const fl = flying(s, a); if (pushOut(w, a) && fl) stun(s, a);
      }
      for (const o of s.friends) {
        const dx = a.x - o.x, dy = a.y - o.y, d = Math.hypot(dx, dy), m = a.r + o.r;
        if (d < m && d > 0.01) { if (a.ball) { const nx = dx / d, ny = dy / d, dot = a.vx * nx + a.vy * ny; if (dot < 0) { a.vx -= 2 * dot * nx; a.vy -= 2 * dot * ny; } } else if (flying(s, a) && !a.spin) stun(s, a); a.x = o.x + dx / d * m; a.y = o.y + dy / d * m; }
      }
      { const dx = a.x - sg.x, dy = a.y - sg.y, d = Math.hypot(dx, dy), m = a.r + sg.r; if (d < m && d > 0.01) { a.x = sg.x + dx / d * m; a.y = sg.y + dy / d * m; } }
    }
    s.soldiers = s.soldiers.filter(u => u.hp > 0);
    // les éclats
    for (const p of s.shards) {
      p.t += dt;
      const d = dist(p, sg);
      if (d < s.cfg.magnet) { const v = Math.min(d, 520 * dt); p.x += (sg.x - p.x) / d * v; p.y += (sg.y - p.y) / d * v; }
      if (d < s.cfg.pickup) { p.taken = true; s.ink = Math.min(s.cfg.inkMax, s.ink + 1); }
    }
    s.shards = s.shards.filter(p => !p.taken);
    for (const p of s.pages) p.t += dt;
    if (!brush) { const i = s.pages.findIndex(p => dist(p, sg) < sg.r + 24); if (i >= 0) { s.pages.splice(i, 1); openChoice(s); } }
    for (const f of s.friends) if (f.flash > 0) f.flash -= dt;
    for (const e of s.fx) { e.life -= dtReal; if (e.k === 'bit') { e.x += e.vx * dtReal; e.y += e.vy * dtReal; } }
    s.fx = s.fx.filter(e => e.life > 0);
  }
  // un éclair qui part de « from » et saute de golem en golem
  function chainFrom(s, from, N, R0) {
    const pts = [{ x: from.x, y: from.y }], done = []; let cur = from, R = R0;
    for (let k = 0; k < N; k++) {
      let tg = null, b = R; for (const u of s.soldiers) { const d = dist(u, cur); if (u.hp > 0 && u !== from && !done.includes(u) && d < b) { b = d; tg = u; } }
      if (!tg) break; done.push(tg); pts.push({ x: tg.x, y: tg.y }); cur = tg; R = 200;
    }
    for (const u of done) hurt(s, u, 2);
    if (done.length) s.fx.push({ k: 'chain', pts, life: 0.3, max: 0.3 });
    return done.length;
  }
  // ----- les combos jouissifs, à chaque instant -----
  function combos(s, dt) {
    const sg = s.sage, C = { x: 450, y: 445 }, alive = u => u.hp > 0;
    // l'écho du scribe fou : la rune se relance toute seule
    for (const e of s.echoes) {
      e.t -= dt; if (e.t > 0) continue; e.done = true;
      const k0 = s.kills; s.inRune = true; s.runeKills = 0; s.orageLeft = lv(s, 'orage') >= 2 ? 25 : 6;
      castAll(s, e.rune, true); s.fx.push({ k: 'echo', life: 0.4, max: 0.4 });
      s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
    }
    s.echoes = s.echoes.filter(e => !e.done);
    // la tornade : elle aspire, (elle se promène), puis elle recrache
    for (const tn of s.tornados) {
      tn.t -= dt;
      if (tn.L >= 3) { // vers la foule
        let cx = 0, cy = 0, n = 0; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - tn.x, u.y - tn.y) < 420) { cx += u.x; cy += u.y; n++; }
        if (n) { const dx = cx / n - tn.x, dy = cy / n - tn.y, d = Math.hypot(dx, dy) || 1, v = Math.min(d, 120 * dt); tn.x += dx / d * v; tn.y += dy / d * v; }
        const fx = tn.x - C.x, fy = tn.y - C.y, fd = Math.hypot(fx, fy) || 1; if (fd < 150) { tn.x = C.x + fx / fd * 150; tn.y = C.y + fy / fd * 150; } // elle ne marche pas sur les amis
        tn.tick -= dt; if (tn.tick <= 0) { tn.tick = 0.4; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - tn.x, u.y - tn.y) < 110) hurt(s, u, 2); }
      }
      if (tn.t > 0) {
        for (const u of s.soldiers) {
          if (!alive(u) || u.ball || u.iron) continue;
          const dx = tn.x - u.x, dy = tn.y - u.y, d = Math.hypot(dx, dy) || 1;
          if (d > tn.R) continue;
          const pull = d > 40 ? 330 : 60; u.vx = dx / d * pull - dy / d * 260; u.vy = dy / d * pull + dx / d * 260; u.spin = true;
        }
      } else {
        tn.done = true;
        for (const u of s.soldiers) { if (!alive(u)) continue; const dx = u.x - tn.x, dy = u.y - tn.y, d = Math.hypot(dx, dy) || 1; if (d < tn.R + 40) { const k = s.cfg.repelV * 0.9; u.vx = dx / d * k; u.vy = dy / d * k; u.spin = false; u.spit = 0.3; if (!u.iron) { u.daze = s.cfg.daze; s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 10, t: 'sonné !', life: 0.7, max: 0.7, col: '#ffe58a' }); } } }
        s.fx.push({ k: 'ring', x: tn.x, y: tn.y, R: tn.R, life: 0.6, max: 0.6 }); s.shake = Math.max(s.shake, 0.25);
      }
    }
    s.tornados = s.tornados.filter(t => !t.done);
    if (!s.tornados.length) for (const u of s.soldiers) u.spin = false;
    // la comète : une traînée derrière le Sage, et il fonce dans le tas
    const CO = lv(s, 'comete');
    if (CO) {
      const mv = Math.hypot(sg.x - (sg.px ?? sg.x), sg.y - (sg.py ?? sg.y)); s.trailD += mv;
      if (s.trailD > 22) { s.trailD = 0; s.trail.push({ x: sg.x, y: sg.y, t: 1.8, n: s.trail.length }); }
      for (const id in s.trailHit) { s.trailHit[id] -= dt; if (s.trailHit[id] <= 0) delete s.trailHit[id]; }
      for (const p of s.trail) {
        p.t -= dt;
        for (const u of s.soldiers) if (alive(u) && !s.trailHit[u.id] && Math.hypot(u.x - p.x, u.y - p.y) < u.r + 34) { hurt(s, u, 3); if (CO >= 2 && u.hp > 0) stun(s, u); s.trailHit[u.id] = CO >= 2 ? 1.5 : 0.4; }
        if (p.t <= 0 && CO >= 3 && p.n % 2 === 0) { s.fx.push({ k: 'pop2', x: p.x, y: p.y, life: 0.35, max: 0.35, big: true }); const k0 = s.kills; s.inRune = true; s.runeKills = 0; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - p.x, u.y - p.y) < u.r + 60) { if (u.daze > 0.3) shatter(s, u); else { stun(s, u); hurt(s, u, 3); } } s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; } }
      }
      s.trail = s.trail.filter(p => p.t > 0);
      if (CO >= 2 && mv / Math.max(dt, 1e-3) > 120) for (const u of s.soldiers) {
        if (!alive(u) || u.ball) continue; const dx = u.x - sg.x, dy = u.y - sg.y, d = Math.hypot(dx, dy) || 1;
        if (d < u.r + sg.r + 10) { u.vx = dx / d * 850; u.vy = dy / d * 850; hurt(s, u, 2); stun(s, u); u.vx = dx / d * 850; u.vy = dy / d * 850; s.fx.push({ k: 'bonk', x: u.x, y: u.y, life: 0.2, max: 0.2 }); }
      }
    }
    sg.px = sg.x; sg.py = sg.y;
    // l'orage qui tombe tout seul
    if (lv(s, 'orage') >= 3) {
      s.stormT -= dt;
      if (s.stormT <= 0 && s.soldiers.length) {
        s.stormT = 6; s.orageLeft = 10; const k0 = s.kills; s.inRune = true; s.runeKills = 0;
        const pool = s.soldiers.filter(alive); for (let i = 0; i < 5 && pool.length; i++) { const v = pool.splice(Math.floor(rng(s) * pool.length), 1)[0]; s.fx.push({ k: 'sky', x: v.x, y: v.y, life: 0.4, max: 0.4 }); if (v.daze > 0) shatter(s, v); else { stun(s, v); hurt(s, v, 1); } }
        s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
      }
    }
    // l'onde du sanctuaire
    const SA = lv(s, 'sanctuaire');
    if (SA >= 2 && lv(s, 'sceau')) {
      s.pulseT -= dt;
      if (s.pulseT <= 0) {
        s.pulseT = 8; const R = UP.sceauR[lv(s, 'sceau')]; const k0 = s.kills; s.inRune = true; s.runeKills = 0;
        for (const u of s.soldiers) {
          if (!alive(u) || Math.hypot(u.x - C.x, u.y - C.y) > R + u.r) continue;
          if (SA >= 3 && u.daze > 0) { shatter(s, u); continue; }
          const dx = u.x - C.x, dy = u.y - C.y, d = Math.hypot(dx, dy) || 1; u.vx = dx / d * s.cfg.pushV * 0.9; u.vy = dy / d * s.cfg.pushV * 0.9; u.daze = 0;
        }
        s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
        s.fx.push({ k: 'pulse', R, life: 0.6, max: 0.6 }); s.shake = Math.max(s.shake, 0.18);
      }
    }
    // la colère du cœur : à 12 et à 14 minutes, ils arrivent plus nombreux et plus vite
    const rage = s.realT >= 900 ? 3 + Math.floor((s.realT - 900) / 30) : s.realT >= 840 ? 2 : s.realT >= 720 ? 1 : 0;
    if (rage > s.rage) { const first = s.rage; s.rage = rage; if (rage <= 3) say(s, rage === 1 ? 'Grosbec se met en colère : les golems arrivent plus vite et plus nombreux !' : rage === 2 ? 'Grosbec est fou de rage !' : 'Grosbec devient fou furieux : plus rien ne l’arrête…', 4); if (first >= 3) return; s.fx.push({ k: 'side', side: 0, life: 2.4, max: 2.4 }); s.fx.push({ k: 'side', side: 2, life: 2.4, max: 2.4 }); s.shake = 0.4; }
  }
  // ----- les pouvoirs des cartes, à chaque instant -----
  function upgrades(s, dt) {
    const sg = s.sage, C = { x: 450, y: 445 }, alive = u => u.hp > 0;
    // pages volantes
    const nP = UP.pagesN[lv(s, 'pages')];
    if (nP) {
      s.orbitA += dt * 3.2;
      let R = UP.pagesR[lv(s, 'pages')];
      if (lv(s, 'tornade')) { s.tourT += dt; R += (330 - R) * (0.5 - 0.5 * Math.cos(s.tourT * Math.PI / 2)); }
      s.orbitR = R;
      for (const id in s.orbitHit) { s.orbitHit[id] -= dt; if (s.orbitHit[id] <= 0) delete s.orbitHit[id]; }
      for (let i = 0; i < nP; i++) {
        const a = s.orbitA + i * Math.PI * 2 / nP, px = sg.x + Math.cos(a) * R, py = sg.y + Math.sin(a) * R;
        for (const u of s.soldiers) if (alive(u) && !s.orbitHit[u.id] && Math.hypot(u.x - px, u.y - py) < u.r + 14) { hurt(s, u, 2); s.orbitHit[u.id] = 0.6; }
      }
    }
    // sceau de garde
    if (lv(s, 'sceau')) {
      s.sealT -= dt;
      if (s.sealT <= 0) {
        s.sealT = UP.sceauT[lv(s, 'sceau')]; const R = UP.sceauR[lv(s, 'sceau')]; let n = 0;
        for (const u of s.soldiers) if (alive(u) && dist(u, C) < R) { hurt(s, u, 1); n++; }
        if (n) s.fx.push({ k: 'seal', life: 0.35, max: 0.35 });
      }
    }
    // rune piège
    if (lv(s, 'piege')) {
      s.trapT -= dt;
      if (s.trapT <= 0) {
        let tg = null, b = 360; for (const u of s.soldiers) { const d = dist(u, C); if (alive(u) && !flying(s, u) && d < b) { b = d; tg = u; } }
        if (tg) { s.traps.push({ x: tg.x, y: tg.y, t: 0.7, max: 0.7, R: UP.piegeR[lv(s, 'piege')] }); s.trapT = UP.piegeT[lv(s, 'piege')]; } else s.trapT = 0.5;
      }
      for (const tr of s.traps) {
        tr.t -= dt;
        if (tr.t <= 0 && !tr.done) { tr.done = true; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - tr.x, u.y - tr.y) < tr.R + u.r) stun(s, u); s.fx.push({ k: 'trap', x: tr.x, y: tr.y, R: tr.R, life: 0.45, max: 0.45 }); s.shake = Math.max(s.shake, 0.1); }
      }
      s.traps = s.traps.filter(tr => !tr.done);
    }
    // lumière en chaîne
    if (lv(s, 'chaine')) {
      s.chainT -= dt;
      if (s.chainT <= 0) s.chainT = chainFrom(s, sg, UP.chaineN[lv(s, 'chaine')], 380) ? UP.chaineT[lv(s, 'chaine')] : 0.4;
    }
    // pluie d'étoiles
    if (lv(s, 'etoiles')) {
      s.novaT -= dt;
      if (s.novaT <= 0 && s.soldiers.length) {
        const L = lv(s, 'etoiles'); s.novaT = L >= 2 ? 3 : 5;
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + s.t; s.bolts.push({ x: sg.x, y: sg.y, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, life: 1.3, dmg: s.cfg.boltDmg + lv(s, 'lourd') + 1, pierce: UP.percant[lv(s, 'percant')], hit: [], star: true, bounce: L >= 2 ? 2 : 0 }); }
        s.fx.push({ k: 'nova', x: sg.x, y: sg.y, life: 0.5, max: 0.5 });
      }
    }
    // encre vive
    if (lv(s, 'scribe')) { s.inkT += dt; if (s.inkT >= 2) { s.inkT = 0; s.ink = Math.min(s.cfg.inkMax, s.ink + 1); } }
    if (s.frenzy > 0) { s.frenzy -= dt; if (s.frenzy <= 0) say(s, 'La frénésie est finie.', 1.5); }
    // bouclier de cristal : il revient
    if (lv(s, 'bouclier')) for (const f of s.friends) if (!f.shield) { f.shieldT -= dt; if (f.shieldT <= 0) { f.shield = 1; f.shieldT = 0; } }
    // les chouettes
    for (const o of s.owls) {
      const L = lv(s, 'chouette'); o.a += dt * 1.6;
      const home = { x: sg.x + Math.cos(o.a) * 55, y: sg.y - 20 + Math.sin(o.a) * 30 };
      if (o.mode === 'tour') {
        o.x += (home.x - o.x) * Math.min(1, dt * 8); o.y += (home.y - o.y) * Math.min(1, dt * 8); o.cd -= dt;
        if (o.cd <= 0) {
          let tg = null, b = 560; for (const u of s.soldiers) { const d = dist(u, sg); if (alive(u) && u.type === 'lanceur' && d < b) { b = d; tg = u; } }
          if (!tg) { b = 380; for (const u of s.soldiers) { const d = dist(u, sg); if (alive(u) && d < b) { b = d; tg = u; } } }
          if (tg) { o.mode = 'pique'; o.tg = tg; o.t = 0; o.x0 = o.x; o.y0 = o.y; } else o.cd = 0.4;
        }
      } else if (o.mode === 'pique') {
        o.t += dt; const k = Math.min(1, o.t / 0.35), tg = o.tg;
        o.x = o.x0 + (tg.x - o.x0) * k; o.y = o.y0 + (tg.y - o.y0) * k;
        if (k >= 1) { if (tg.hp > 0) hurt(s, tg, UP.chouetteD[L]); s.fx.push({ k: 'slash', x: tg.x, y: tg.y, life: 0.3, max: 0.3 }); if (lv(s, 'chouettes')) chainFrom(s, tg, 3, 200);
          if (lv(s, 'chouettes') >= 3 && tg.hp > 0) { // elle le jette sur le plus gros groupe
            let best = null, bn = 0; for (const u of s.soldiers) { if (u === tg || u.hp <= 0) continue; let n = 0; for (const v of s.soldiers) if (dist(u, v) < 110) n++; if (n > bn) { bn = n; best = u; } }
            if (best) { const dx = best.x - tg.x, dy = best.y - tg.y, d = Math.hypot(dx, dy) || 1; tg.vx = dx / d * 950; tg.vy = dy / d * 950; tg.daze = 0; }
          }
          o.mode = 'retour'; o.t = 0; o.x0 = o.x; o.y0 = o.y; o.tg = null; }
      } else {
        o.t += dt; const k = Math.min(1, o.t / 0.45);
        o.x = o.x0 + (home.x - o.x0) * k; o.y = o.y0 + (home.y - o.y0) * k;
        if (k >= 1) { o.mode = 'tour'; o.cd = UP.chouetteT[L]; }
      }
    }
    // la ligne de feu du trait brûlant
    for (const fl of s.firelines) {
      fl.life -= dt;
      const { a, b } = fl;
      for (const u of s.soldiers) { if (!alive(u) || u.burn > 0 || u.burnCd > 0) continue; const q = nearOnSeg(a, b, u.x, u.y); if (Math.hypot(u.x - q.x, u.y - q.y) < u.r + (fl.lava ? 34 : 20)) { u.burn = s.cfg.burnT; u.burnTick = 0.3; } }
    }
    s.firelines = s.firelines.filter(fl => fl.life > 0);
    // le mur d'épines
    if (lv(s, 'volcan')) for (const w of s.walls) for (const u of s.soldiers) if (alive(u) && u.burn <= 0 && u.burnCd <= 0 && wallDist(w, u.x, u.y) < w.half + u.r + 14) { u.burn = s.cfg.burnT; u.burnTick = 0.3; }
    const ep = UP.epines[lv(s, 'epines')];
    if (ep) for (const w of s.walls) {
      w.thornT = (w.thornT ?? 0) - dt;
      if (w.thornT > 0) continue;
      w.thornT = 1 / ep;
      for (const u of s.soldiers) if (alive(u) && wallDist(w, u.x, u.y) < w.half + u.r + 12) hurt(s, u, 1);
    }
  }
  // la fin d'un boulet : il s'arrête sonné (au niveau 3, il explose)
  function endBall(s, u) {
    u.ball = null; u.vx *= 0.1; u.vy *= 0.1;
    if (lv(s, 'bowling') >= 3) {
      s.fx.push({ k: 'fireball', x: u.x, y: u.y, life: 0.45, max: 0.45, stone: true }); s.shake = Math.max(s.shake, 0.15);
      for (const v of s.soldiers) if (v.hp > 0 && v !== u && dist(u, v) < 105 + v.r) { stun(s, v); hurt(s, v, 4); }
      hurt(s, u, 4);
    }
    if (u.hp > 0) stun(s, u);
  }
  // un boulet qui en touche un autre : il le renverse (et, au niveau 2, en fait un boulet)
  function knock(s, ball, v, nx, ny) {
    if (v.ball || v.knockCd > 0) return;
    if (v.iron) { v.knockCd = 0.5; hurt(s, v, 1); return; }
    v.knockCd = 0.5; s.strikeN++;
    if (s.strikeN === 5) { s.fx.push({ k: 'pop', x: v.x, y: v.y - 40, t: 'STRIKE !', life: 1.2, max: 1.2, col: '#ffd23f' }); s.fx.push({ k: 'strike', x: v.x, y: v.y, life: 0.5, max: 0.5 }); }
    if (lv(s, 'bowling') >= 2 && s.ballChain > 0) { s.ballChain--; v.ball = { left: 3, t: 2.2 }; v.vx = nx * 720; v.vy = ny * 720; v.daze = 0; }
    else { stun(s, v); v.vx += nx * 350; v.vy += ny * 350; }
    hurt(s, v, 2);
  }
  function hit(s, f, n) {
    if (f.shield > 0) {
      f.shield = 0; f.shieldT = UP.bouclierT[lv(s, 'bouclier')]; s.fx.push({ k: 'shieldbreak', x: f.x, y: f.y, life: 0.5, max: 0.5 });
      if (lv(s, 'sanctuaire')) { const R = UP.sceauR[lv(s, 'sceau')]; for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(u.x - 450, u.y - 445) < R) stun(s, u); s.fx.push({ k: 'trap', x: 450, y: 445, R, life: 0.5, max: 0.5 }); s.shake = Math.max(s.shake, 0.15); }
      return;
    }
    s.protection = Math.max(0, s.protection - n); f.flash = 0.25;
    s.fx.push({ k: 'pop', x: f.x, y: f.y - f.r - 10, t: '−' + n, life: 0.8, max: 0.8, col: '#ff4d5e' });
    if (n > 1) s.shake = Math.max(s.shake, 0.2);
    if (s.protection <= 0) s.over = 'lose';
  }

  // ----- les codes des autres joueurs -----
  function enterCode(s, seq) {
    for (const id of ORDER) {
      if (s.entered.includes(id)) continue;
      if (CODES[id].every((c, i) => c === seq[i])) {
        s.entered.push(id);
        const f = s.friends.find(x => x.id === id); f.free = true; f.cd = 0.3;
        s.protection = Math.min(s.cfg.protection, s.protection + s.cfg.codeBonus);
        s.fx.push({ k: 'free', x: f.x, y: f.y, life: 1, max: 1 });
        if (s.entered.length === 3) { s.over = 'win'; s.heart.bare = true; s.soldiers = []; s.stones = []; s.notes = []; s.potions = []; s.puddles = []; s.shake = 0.4; say(s, 'Tes trois amis ont gagné : l’armure tombe !', 6); }
        else say(s, `${cap(f.nom)} vient t’aider ! Protection +${s.cfg.codeBonus}.`, 3);
        return { ok: true, id };
      }
    }
    say(s, 'Ce code ne marche pas. Vérifie !', 2);
    return { ok: false };
  }

  // ----- reconnaître un tracé -----
  function resample(pts, gap) {
    const out = [pts[0]]; let prev = pts[0], acc = 0;
    for (let i = 1; i < pts.length; i++) {
      let p = pts[i], d = Math.hypot(p.x - prev.x, p.y - prev.y);
      while (acc + d >= gap && d > 0) {
        const k = (gap - acc) / d, q = { x: prev.x + (p.x - prev.x) * k, y: prev.y + (p.y - prev.y) * k };
        out.push(q); prev = q; d = Math.hypot(p.x - prev.x, p.y - prev.y); acc = 0;
      }
      acc += d; prev = p;
    }
    if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1]);
    return out;
  }
  const pathLen = pts => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return l; };
  function straight(a, b, pts) { // assez droit pour un bras de V : peu de bosse par rapport à sa longueur
    const L = pathLen(pts), c = Math.hypot(b.x - a.x, b.y - a.y);
    if (!L || c / L < 0.88) return false;
    let sag = 0; for (const p of pts) sag = Math.max(sag, Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / (c || 1));
    return sag / (c || 1) < 0.11;
  }
  function recognize(pts) {
    if (pts.length < 3) return { kind: null };
    const len = pathLen(pts);
    if (len < 60) return { kind: null, why: 'Trop petit.' };
    const a = pts[0], b = pts[pts.length - 1], chord = Math.hypot(b.x - a.x, b.y - a.y);
    let sag = 0; for (const p of pts) sag = Math.max(sag, Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / (chord || 1));
    if (chord / len > 0.93 || (chord / len > 0.86 && sag / (chord || 1) < 0.12)) return { kind: 'trait', a, b };
    const r = resample(pts, 12);
    let turn = 0;
    for (let i = 2; i < r.length; i++) {
      const a1 = Math.atan2(r[i - 1].y - r[i - 2].y, r[i - 1].x - r[i - 2].x), a2 = Math.atan2(r[i].y - r[i - 1].y, r[i].x - r[i - 1].x);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turn += d;
    }
    const T = Math.abs(turn);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    const diag = Math.hypot(x1 - x0, y1 - y0);
    if (T > 3 * Math.PI) return { kind: 'spirale', x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    if (T > 1.3 * Math.PI && chord < 0.4 * diag) return { kind: 'ferme', poly: pts };
    // on lisse le tracé (le doigt tremble), puis on regarde ses virages
    const f6 = resample(pts, 6), sm = f6.map((p, i) => {
      if (i === 0 || i === f6.length - 1) return p;
      let x = 0, y = 0, n = 0; for (let k = Math.max(0, i - 3); k <= Math.min(f6.length - 1, i + 3); k++) { x += f6[k].x; y += f6[k].y; n++; }
      return { x: x / n, y: y / n };
    });
    const q = resample(sm, 24), turns = [];
    for (let i = 2; i < q.length; i++) {
      const a1 = Math.atan2(q[i - 1].y - q[i - 2].y, q[i - 1].x - q[i - 2].x), a2 = Math.atan2(q[i].y - q[i - 1].y, q[i].x - q[i - 1].x);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turns.push(d);
    }
    let net = 0, abs = 0, corner = 0, ci = 0;
    turns.forEach((d, i) => { net += d; abs += Math.abs(d); const w = Math.abs(d + (turns[i + 1] || 0)); if (w > corner) { corner = w; ci = i + 1; } });
    const deg = x => x * 180 / Math.PI;
    // le V : un seul virage sec
    if (deg(corner) > 45 && corner > 0.6 * Math.abs(net)) {
      // la vraie pointe : le point du tracé d'origine le plus loin de la ligne début-fin, près du virage
      let tip = q[ci], best = -1, k0 = 0, kd = 1e9;
      pts.forEach((p, k) => { const d = Math.hypot(p.x - q[ci].x, p.y - q[ci].y); if (d < kd) { kd = d; k0 = k; } });
      for (let k = Math.max(0, k0 - 12); k <= Math.min(pts.length - 1, k0 + 12); k++) {
        const p = pts[k], d = chord > 20 ? Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / chord : Math.hypot(p.x - a.x, p.y - a.y);
        if (d > best) { best = d; tip = p; }
      }
      const arm1 = q.slice(0, ci + 1), arm2 = q.slice(ci);
      if (arm1.length > 1 && arm2.length > 1 && pathLen(arm1) > 50 && pathLen(arm2) > 50) {
        const u1 = { x: a.x - tip.x, y: a.y - tip.y }, u2 = { x: b.x - tip.x, y: b.y - tip.y };
        const ang = deg(Math.acos(Math.max(-1, Math.min(1, (u1.x * u2.x + u1.y * u2.y) / (Math.hypot(u1.x, u1.y) * Math.hypot(u2.x, u2.y) || 1)))));
        if (ang <= CFG.vMax) {
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = mx - tip.x, dy = my - tip.y, dl = Math.hypot(dx, dy) || 1;
          return { kind: 'poussee', tip, a, b, dir: [dx / dl, dy / dl] };
        }
        if (ang < 160) return { kind: null, why: `V trop ouvert (${Math.round(ang)}°) : 90° au plus, comme un coin de carré.` };
      }
    }
    // l'arc de cercle : un virage doux et régulier, toujours du même côté
    if (corner < 0.6 * Math.abs(net) && deg(Math.abs(net)) > 35 && deg(Math.abs(net)) < 320 && Math.abs(net) > 0.65 * abs && chord > 60) return { kind: 'mur', pts: resample(sm, 16) };
    return { kind: null, why: T > 1.3 * Math.PI ? 'La forme n’est pas fermée.' : 'Rune pas reconnue.' };
  }
  function inside(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c;
    }
    return c;
  }
  const NOM = { trait: 'Lumière', poussee: 'Le V', mur: 'Mur', spirale: 'Repousse' };
  const inTri = (p, a, b, c, m) => { // dans le triangle, avec une marge m
    const side = (p1, p2) => { const ex = p2.x - p1.x, ey = p2.y - p1.y, L = Math.hypot(ex, ey) || 1; return ((p.x - p1.x) * ey - (p.y - p1.y) * ex) / L; };
    const d1 = side(a, b), d2 = side(b, c), d3 = side(c, a), sg = Math.sign(side(a, b) + side(b, c) + side(c, a)) || 1;
    return d1 * sg > -m && d2 * sg > -m && d3 * sg > -m;
  };
  function costOf(s, rune) {
    if (rune.kind === 'ferme') return 0;
    let base = rune.kind === 'spirale' ? (lv(s, 'tornade') ? 4 : s.cfg.inkMax / 2) : s.cfg.cost[rune.kind] ?? 0;
    if (rune.kind === 'poussee' && lv(s, 'bowling')) base = 1;
    return lv(s, 'scribe') ? Math.max(1, base - 1) : base;
  }
  // ----- graver une rune -----
  function cast(s, rune) {
    if (rune.kind === 'ferme') { say(s, 'Un cercle ne fait rien. Trait, V, escargot ou arc de cercle.'); return { ok: false }; }
    const kind = rune.kind, cost = s.frenzy > 0 ? 0 : costOf(s, rune);
    if (s.ink < cost) { say(s, `Pas assez d’encre (il en faut ${cost}). Ramasse des éclats.`); return { ok: false }; }
    s.ink -= cost; s.runes++;
    const k0 = s.kills; s.inRune = true; s.runeKills = 0; s.orageLeft = lv(s, 'orage') >= 2 ? 25 : 6;
    const hit = castAll(s, rune, false);
    if (lv(s, 'scribe') >= 3 && rune.kind !== 'mur') s.echoes.push({ rune, t: 0.55 });
    s.soldiers = s.soldiers.filter(u => u.hp > 0);
    s.inRune = false;
    const killed = s.kills - k0;
    if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
    // le scribe fou : la frénésie
    const SC = lv(s, 'scribe');
    if (SC >= 2 && s.frenzy <= 0 && killed >= (SC >= 3 ? 3 : 4)) { s.frenzy = SC >= 3 ? 10 : 6; s.fx.push({ k: 'frenzy', life: 1, max: 1 }); say(s, `FRÉNÉSIE ! ${s.frenzy} secondes d’encre gratuite !`, 2.5); return { ok: true, hit, killed }; }
    if (kind === 'trait') say(s, killed >= 3 ? `Lumière : ${killed} d’un coup !` : hit ? `Lumière : ${hit} touché${hit > 1 ? 's' : ''}.` : 'Lumière… dans le vide.');
    else if (kind === 'mur') say(s, `Un mur courbe, pour ${s.cfg.wallLife} secondes : il ralentit et renvoie les braises.`);
    else if (kind === 'spirale' && lv(s, 'tornade') >= 2) say(s, hit ? `Tornade ! ${hit} golem${hit > 1 ? 's' : ''} aspiré${hit > 1 ? 's' : ''} !` : 'Tornade… dans le vide.');
    else say(s, hit ? `${NOM[kind]} : ${hit} golem${hit > 1 ? 's' : ''} projeté${hit > 1 ? 's' : ''} !` : `${NOM[kind]}… dans le vide.`);
    return { ok: true, hit, killed };
  }
  // une rune et ses copies (la rune miroir : des copies gratuites, tournées autour des amis)
  function castAll(s, rune, echo) {
    let hit = effect(s, rune, echo);
    const M = lv(s, 'miroir');
    if (M) { const angs = M === 1 ? [Math.PI] : M === 2 ? [Math.PI, Math.PI / 2, -Math.PI / 2] : [1, 2, 3, 4, 5, 6, 7].map(k => k * Math.PI / 4); for (const a of angs) hit += effect(s, turnRune(rune, a), true); s.fx.push({ k: 'mirror', n: angs.length, life: 0.6, max: 0.6 }); }
    return hit;
  }
  // tourner une rune autour des amis (pour la rune miroir)
  function turnRune(r, a) {
    const C = { x: 450, y: 445 }, co = Math.cos(a), si = Math.sin(a);
    const T = p => ({ x: C.x + (p.x - C.x) * co - (p.y - C.y) * si, y: C.y + (p.x - C.x) * si + (p.y - C.y) * co });
    const o = { ...r, copy: true };
    if (r.a) o.a = T(r.a); if (r.b) o.b = T(r.b); if (r.tip) o.tip = T(r.tip);
    if (r.dir) o.dir = [r.dir[0] * co - r.dir[1] * si, r.dir[0] * si + r.dir[1] * co];
    if (r.pts) o.pts = r.pts.map(T);
    if (r.x !== undefined) { const q = T(r); o.x = q.x; o.y = q.y; }
    return o;
  }
  // ce que fait une rune (l'original ou une copie)
  function effect(s, rune, copy) {
    const kind = rune.kind; let hit = 0;
    if (kind === 'trait') {
      const { a, b } = rune, dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
      const near = (x, y, w) => { const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L2)); return Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)) < w; };
      for (const u of [...s.soldiers]) {
        if (u.hp <= 0 || !near(u.x, u.y, u.r + s.cfg.traitWidth)) continue;
        hit++;
        if (u.daze > 0) shatter(s, u); else hurt(s, u, s.cfg.traitDmg);
      }
      for (const p of s.stones) if (near(p.x, p.y, 34)) p.life = 0;
      s.fx.push({ k: 'beam', a, b, life: 0.45, max: 0.45 });
      if (lv(s, 'brulant')) { const lava = lv(s, 'volcan') >= 3, T = UP.brulant[lv(s, 'brulant')] * (lava ? 1.5 : 1); s.firelines.push({ a, b, life: T, max: T, lava }); }
    }
    if (kind === 'mur') {
      let P = rune.pts;
      const L = pathLen(P), M = s.cfg.wallMax;
      if (L > M) { const cut = Math.floor(P.length * (1 - M / L) / 2); P = P.slice(cut, P.length - cut); }
      const w = { pts: P, half: s.cfg.wallHalf, life: s.cfg.wallLife, max: s.cfg.wallLife };
      s.walls.push(w);
      for (const u of s.soldiers) if (pushOut(w, u)) hit++;
    }
    if (kind === 'spirale' && lv(s, 'tornade') >= 2) {
      const L = lv(s, 'tornade'); s.tornados.push({ x: rune.x, y: rune.y, t: L >= 3 ? 3.2 : 1.6, max: L >= 3 ? 3.2 : 1.6, R: s.cfg.repelR, L, tick: 0 });
      s.fx.push({ k: 'tornado', x: rune.x, y: rune.y, life: 0.4, max: 0.4 });
      for (const u of s.soldiers) if (dist(u, rune) < s.cfg.repelR + u.r) hit++;
    }
    else if (kind === 'spirale') {
      const R = s.cfg.repelR;
      for (const u of s.soldiers) {
        const dx = u.x - rune.x, dy = u.y - rune.y, d = Math.hypot(dx, dy);
        if (d < R + u.r) { hit++; const n = d || 1, k = s.cfg.repelV * (0.65 + 0.35 * (1 - Math.min(1, d / R))); u.vx = dx / n * k; u.vy = dy / n * k; u.daze = 0; }
      }
      s.fx.push({ k: 'ring', x: rune.x, y: rune.y, R, life: 0.6, max: 0.6 });
      s.shake = Math.max(s.shake, 0.22);
    }
    if (kind === 'poussee') { // tout ce qui est dans le V est chassé par l'ouverture
      const tn = UP.tonnerre[lv(s, 'tonnerre')];
      const BW = lv(s, 'bowling'); if (BW && !copy) { s.ballChain = 20; s.strikeN = 0; }
      for (const u of s.soldiers) if (inTri(u, rune.tip, rune.a, rune.b, u.r)) { hit++; u.vx = rune.dir[0] * s.cfg.pushV; u.vy = rune.dir[1] * s.cfg.pushV; u.daze = tn; if (BW && !u.iron) u.ball = { left: 4, t: 3 }; }
      s.fx.push({ k: 'vee', tip: rune.tip, a: rune.a, b: rune.b, dir: rune.dir, life: 0.5, max: 0.5, thunder: tn > 0, copy });
    }
    return hit;
  }
  return { W, H, CFG, TYPES, GROS, SYMS, CODES, ORDER, POSTE, HEART, PORTES, CARDS, UP, newGame, step, recognize, cast, costOf, inside, pathLen, enterCode, dist, bonusHp, sidesNow, minutes, choose, openChoice, cardPool, lv, combosReady, turnRune };
})();
if (typeof module !== 'undefined') module.exports = G;
