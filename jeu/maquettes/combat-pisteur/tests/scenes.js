// Les combats de la Bible §17.17, rejoués à pas fixes (1/60 s) dans la page : on vérifie les comptes annoncés.
// Chaque scène rend {ok, ...mesures}. Lancé par scenes.py.
window.__S = (function () {
  const pt = __pt, dt = 1 / 60, hyp = Math.hypot;
  const st = () => pt.etat();
  const ang = a => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
  // avance de `sec` secondes ; chaque(t) est appelé avant chaque pas et peut rendre true pour arrêter
  function av(sec, chaque) { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) { if (chaque && chaque(i * dt) === true) return i * dt; if (pt.pas(1, dt) !== 'jeu') return i * dt; } return sec; }
  function scene(p, g, opt) { pt.figer(true); pt.tenir(1, false); pt.tenir(4, false); pt.cmd({ mx: 0, my: 0 }); pt.scene(p, g, opt); }
  function aller(x, y, v) { const s = st().P, d = hyp(x - s.x, y - s.y); if (d < 0.08) { pt.cmd({ mx: 0, my: 0 }); return true; } pt.cmd({ mx: (x - s.x) / d * (v || 1), my: (y - s.y) / d * (v || 1) }); return false; }
  function contourner(x, y) { const p = st().P; if (hyp(x - p.x, y - p.y) < 0.12) { pt.cmd({ mx: 0, my: 0 }); return true; } const q = pt.vue(p.x, p.y, x, y, true) ? [x, y] : pt.chemin(p.x, p.y, x, y); aller(q[0], q[1]); return false; }
  const S = {};

  // 1. La dague : 10, 10, 20 — quarante points en deux secondes, sur le même bouton
  S.dague = function () {
    scene([13, 12, -Math.PI / 2], [{ t: 'colosse', x: 13, y: 10.2, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.ev('G[0].sonne=999'); const coups = []; let hp = 150, t0 = null;
    pt.tenir(1, true);
    av(4.3, t => { const g = st().G[0], r = st().P.rang; if (g.hp < hp) { coups.push([+(t).toFixed(2), hp - g.hp, r]); hp = g.hp; } });
    pt.tenir(1, false);
    const d = coups.map(c => c[1]);
    return { ok: d.slice(0, 6).join() === '10,10,20,10,10,20' && coups[2][0] < 1.6 && coups[3][0] - coups[0][0] > 1.95, coups };
  };

  // 2. Assommer le javelot (0 dégât, 2 s) puis marteler la dague : la série complète (40) et pas un coup de plus ; il se réveille avec 10 points
  S.assommeJavelot = function () {
    scene([13, 12.2, -Math.PI / 2], [{ t: 'javelot', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3);
    const dansOmbre = st().P.ombre;
    pt.appui(2); pt.tenir(1, true);
    let hpReveil = null, tSonne = 0, vu = false, recul = false;
    av(4, t => { const g = st().G[0]; if (!g) return true; if (g.sonne > 0) { vu = true; tSonne += dt; } else if (vu && hpReveil === null) hpReveil = g.hp; if (g.etat === 'recul') recul = true; if (hpReveil !== null && t > 3.2) return true; });
    pt.tenir(1, false);
    return { ok: dansOmbre && hpReveil === 10 && recul, dansOmbre, hpReveil, tSonne: +tSonne.toFixed(2), recul };
  };

  // 3. L'embuscade : 30. Un chien (30) tombe d'un coup, sans un cri ; un javelot (50) reste à 20 et recule
  S.embuscade = function () {
    scene([13, 12, -Math.PI / 2], [{ t: 'chien', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }, { t: 'chien', x: 13, y: 7, fa: -Math.PI / 2, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(1.2);
    const s = st(), reste = s.G.length, autre = s.G[0];
    const a = { reste, autreMode: autre && autre.mode, sortiOmbre: !s.P.ombre };
    scene([13, 12, -Math.PI / 2], [{ t: 'javelot', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.6);
    const j = st().G[0];
    return { ok: reste === 1 && a.autreMode === 'ronde' && a.sortiOmbre && j.hp === 20, chien: a, javelotHp: j.hp, javelotEtat: j.etat };
  };

  // 4. La meute en file, prise discrètement : un par un, par-derrière, sans témoin. Pas de colère, zéro dégât.
  //    (c'est la récompense de la discrétion ; la dague circulaire des versions 5 et 6 est retirée)
  S.meuteDiscrete = function () {
    scene([13, 15.5, -Math.PI / 2], [[13, 9.4], [13, 10.8], [13, 12.2]].map(q => ({ t: 'chien', x: q[0], y: q[1], fa: -Math.PI / 2, immobile: 1 })), { sansObstacles: 1 });
    const J = [];
    for (let k = 0; k < 3; k++) {
      av(5, () => { const s = st(); if (!s.P.ombre && s.nVoient === 0 && s.P.ombreCD <= 0) pt.appui(4); return s.P.ombre; });
      const cible = st().G.reduce((a, g) => g.y > a.y ? g : a);
      av(6, () => aller(13, cible.y + 1.25));
      pt.appui(1); av(0.5);
      J.push([st().G.length, st().P.hp, st().coleres, st().nVoient]);
      av(1.2, () => aller(13, 15.5));
    }
    const s = st();
    return { ok: s.G.length === 0 && s.P.hp === 100 && s.coleres === 0 && s.stats.embuscades === 3, reste: s.G.length, vie: s.P.hp, coleres: s.coleres, journal: J };
  };

  // 6. Chaque rouge s'évite, à pied, pour un joueur qui réagit en une demi-seconde
  //    (les zones qui suivent le Pisteur : la demi-seconde part du moment où elles se figent ; les autres : du moment où elles apparaissent)
  function sortie(z, P) {
    const dx = P.x - z.x, dy = P.y - z.y, d = hyp(dx, dy) || 1e-3;
    if (z.k === 'cercle') return Math.atan2(dy, dx);
    if (z.k === 'cone') return Math.atan2(dy, dx);
    if (z.k === 'anneau') return d < (z.r0 + z.r1) / 2 ? Math.atan2(dy, dx) + Math.PI : Math.atan2(dy, dx);      // tout contre lui, ou très loin
    if (z.k === 'croix') { const b = Math.atan2(dy, dx), da = ang(b - z.a), br = Math.round(da / (Math.PI / 2)) * (Math.PI / 2); return b + (da >= br ? 1 : -1) * Math.PI / 2; }   // en biais
    if (z.k === 'demi') { const da = ang(Math.atan2(dy, dx) - z.a), dehors = (z.R + 0.3 - d), cote = d * (Math.PI / 2 + 0.2 - Math.abs(da)); return cote < dehors ? Math.atan2(dy, dx) + (da >= 0 ? 1 : -1) * Math.PI / 2 : Math.atan2(dy, dx); }
    const v = -dx * Math.sin(z.a) + dy * Math.cos(z.a); return z.a + (v >= 0 ? 1 : -1) * Math.PI / 2;
  }
  function rouge(nom, p, golems, opt) {
    opt = opt || {}; const reaction = opt.reaction == null ? 0.5 : opt.reaction;
    scene(p, golems, { sansObstacles: 1 });
    if (opt.avant) opt.avant();
    let t0 = null, dir = null, vu = false, touche = false, hp0 = st().P.hp, fini = null, zk = null;
    av(opt.duree || 7, t => {
      const s = st(), P = s.P;
      if (P.hp < hp0 || P.etat === 'plaque' || P.etat === 'sonne') { touche = true; return true; }
      let z = null; for (const g of s.G) if (g.zone) { z = g.zone; break; }
      if (!z && s.obus.length) { const o = s.obus[0]; z = { k: 'cercle', x: o.x, y: o.y, r: o.r, fige: true, p: o.t / o.dur }; }
      if (!z && s.javs.length) z = { k: 'fin', x: s.javs[0].x, y: s.javs[0].y, a: s.javs[0].a, fige: true };
      if (z) {
        vu = true; zk = z.k;
        const suit = z.k === 'fleche' || z.k === 'ligne' || z.k === 'fin';
        if (t0 === null && (!suit || z.fige)) t0 = t;
        if (t0 !== null && t - t0 >= reaction) { if (dir === null || z.k === 'demi') dir = sortie(z, P); pt.cmd({ mx: Math.cos(dir), my: Math.sin(dir) }); }
      } else if (vu) { if (fini === null) fini = t; if (t - fini > 0.5) return true; }
    });
    pt.cmd({ mx: 0, my: 0 });
    return { nom, zone: zk, vu, evite: vu && !touche, vie: st().P.hp };
  }
  S.rouges = function (reaction) {
    const R = [], o = { reaction };
    R.push(rouge('plaquage du chien, à 3,2 pas', [13.2, 10, 0], [{ t: 'chien', x: 10, y: 10, fa: 0, immobile: 1 }], o));
    for (const d of [2.6, 4, 6, 8.5]) R.push(rouge('lancer du javelot, à ' + d + ' pas', [8 + d, 10, 0], [{ t: 'javelot', x: 8, y: 10, fa: 0, immobile: 1, cdM: 99 }], o));
    R.push(rouge('dalle : charge puis cercle', [13, 10, 0], [{ t: 'dalle', x: 8, y: 10, fa: 0, immobile: 1 }], o));
    R.push(rouge('grand fauchage, de face à 2,2 pas', [12.2, 10, 0], [{ t: 'faucheur', x: 10, y: 10, fa: 0, immobile: 1 }], o));
    // (de dos, il ne voit plus le Pisteur : il faut un coup de dague pour qu'il fasse sa volte)
    R.push(rouge('volte puis fauchage (un coup de dague dans son dos)', [11.3, 10, Math.PI], [{ t: 'faucheur', x: 10, y: 10, fa: Math.PI, immobile: 1 }], Object.assign({ avant: () => { pt.appui(1); } }, o)));
    R.push(rouge('obus du mortier', [16, 10, 0], [{ t: 'mortier', x: 9, y: 10, fa: 0, immobile: 1 }], o));
    for (const d of [3.4, 5, 6.6]) R.push(rouge('charge du bélier, à ' + d + ' pas', [7 + d, 10, 0], [{ t: 'belier', x: 7, y: 10, fa: 0, immobile: 1, cd: 99 }], o));
    const col = (nom, quoi, d, a) => rouge(nom + ' du colosse, à ' + d + ' pas' + (a ? ', en biais' : ', en face'), [10 + Math.cos(a) * d, 9 + Math.sin(a) * d, 0], [{ t: 'colosse', x: 10, y: 9, fa: 0, immobile: 1 }], Object.assign({ avant: () => pt.ev("G[0].sac=['" + quoi + "']") }, o));
    for (const [d, a] of [[1.8, 0], [2.6, 0], [3.5, 0], [4.5, 0], [2.2, 0.9], [3.5, 1.2]]) R.push(col('onde', 'onde', d, a));
    for (const d of [1.7, 2.4, 2.9]) R.push(col('pilon', 'pilon', d, 0));
    for (const d of [2.8, 4.2, 5.0]) R.push(col('anneau', 'anneau', d, 0.4));
    for (const [d, a] of [[2.2, 0], [4, 0], [5, 0.15], [3, 0.5]]) R.push(col('croix', 'croix', d, a));
    return { ok: R.every(r => r.evite), R };
  };

  // 7. Le faucheur : embuscade (30) et un coup de dague (10) avant qu'il réagisse ; il fait sa volte et fauche
  S.faucheur = function () {
    scene([13, 12, -Math.PI / 2], [{ t: 'faucheur', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); pt.tenir(1, true);
    let hpVolte = null, tVolte = null, fauche = false;
    av(3, t => { const g = st().G[0]; if (!g) return true; if (g.etat === 'volte' && hpVolte === null) { hpVolte = g.hp; tVolte = t; pt.tenir(1, false); } if (g.etat === 'fauche') { fauche = true; return true; } });
    pt.tenir(1, false);
    return { ok: hpVolte === 40 && fauche, vieAuMomentDeLaVolte: hpVolte, tVolte: tVolte && +tVolte.toFixed(2), fauche };
  };

  // 8. Le bélier : embuscade (30) et deux coups de dague pendant son demi-tour (20) : il lui reste 30, le seuil de la tête de mort
  S.belier = function () {
    scene([13, 12.2, -Math.PI / 2], [{ t: 'belier', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); pt.tenir(1, true);
    let hpTete = null, tTete = null;
    av(4, t => { const g = st().G[0]; if (!g) return true; if (g.etat === 'tete' && hpTete === null) { hpTete = g.hp; tTete = t; return true; } });
    pt.tenir(1, false);
    return { ok: hpTete === 30, vieQuandIlSeRetourne: hpTete, t: tTete && +tTete.toFixed(2) };
  };

  // 9. Le colosse : depuis l'ombre, l'embuscade et deux coups de dague avant qu'il bouge
  S.colosse = function () {
    scene([13, 12.8, -Math.PI / 2], [{ t: 'colosse', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); pt.tenir(1, true);
    let hp = null;
    av(4, t => { const g = st().G[0]; if (g.mode === 'chasse' && pt.ev('G[0].reagit') <= 0 && hp === null) { hp = g.hp; return true; } });
    pt.tenir(1, false);
    return { ok: hp === 100, vieQuandIlReagit: hp };
  };

  // 10. Le cuirassé : la dague et la dague circulaire font « ting » ; l'embuscade le blesse ; le javelot d'un autre aussi
  S.cuirasse = function () {
    scene([13, 12, -Math.PI / 2], [{ t: 'cuirasse', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.ev('G[0].sonne=999'); pt.tenir(1, true); av(1.5); pt.tenir(1, false); av(0.6); pt.appui(2); av(0.6);
    const hp1 = st().G[0].hp, tings = st().stats.tings;
    scene([13, 12, -Math.PI / 2], [{ t: 'cuirasse', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.5);
    const hp2 = st().G[0].hp;
    // un javelot qui vise le Pisteur, le cuirassé entre les deux
    scene([16, 10, 0], [{ t: 'cuirasse', x: 12, y: 10, fa: Math.PI, immobile: 1, cd: 99 }, { t: 'javelot', x: 8, y: 10, fa: 0, immobile: 1, cdM: 99, grp: 2 }], { sansObstacles: 1 });
    pt.ev('G[0].sonne=999'); av(3);
    const hp3 = st().G[0].hp;
    return { ok: hp1 === 90 && tings >= 3 && hp2 === 60 && hp3 === 50, apresDagues: hp1, tings, apresEmbuscade: hp2, apresJavelot: hp3 };
  };

  // 11. Le bruit : un golem blessé crie (ses voisins viennent voir), un golem tué d'un coup ne prévient personne, sauf ceux qui le regardaient
  S.bruit = function () {
    // deux chiens qui tournent le dos, à 3 pas l'un de l'autre : on tue le premier d'une embuscade
    scene([13, 12, -Math.PI / 2], [{ t: 'chien', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }, { t: 'chien', x: 13, y: 7.4, fa: -Math.PI / 2, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.6);
    const a = st().G[0].mode;
    // le même, mais le deuxième regarde le premier
    scene([13, 12, -Math.PI / 2], [{ t: 'chien', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }, { t: 'chien', x: 13, y: 6.2, fa: Math.PI / 2, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.6);
    const b = st().G[0].mode;
    // un javelot blessé (il lui reste 20) : le chien d'à côté, qui tourne le dos, est averti
    scene([13, 12, -Math.PI / 2], [{ t: 'javelot', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }, { t: 'chien', x: 13, y: 7.4, fa: -Math.PI / 2, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.25);
    const c = st().G[1].mode;
    // un javelot assommé puis frappé : personne n'est averti tant qu'il dort
    scene([13, 12, -Math.PI / 2], [{ t: 'javelot', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }, { t: 'chien', x: 13, y: 7.4, fa: -Math.PI / 2, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(2); pt.tenir(1, true); av(1.5); pt.tenir(1, false);
    const d = st().G[1].mode; av(1.2); const e = st().G[1].mode;
    return { ok: a === 'ronde' && b === 'chasse' && c === 'chasse' && d === 'ronde' && e === 'chasse', tueSansTemoin: a, tueDevantTemoin: b, blesse: c, pendantQuIlDort: d, auReveil: e };
  };

  // LES COLÈRES (25 novembre au soir, Bible §17.31 et §17.32)
  // 16. L'odeur : une meute en colère remonte la piste du Pisteur, sans courir, même dans l'ombre, et le trouve s'il s'arrête.
  //     Et : un rôdeur tué devant un des siens met la meute en colère ; tué sans témoin, non (scène 4).
  S.flair = function () {
    scene([13, 15, -Math.PI / 2], [{ t: 'chien', x: 8, y: 6, fa: -Math.PI / 2, immobile: 1, cdS: 99 }, { t: 'chien', x: 9.2, y: 6, fa: -Math.PI / 2, immobile: 1, cdS: 99 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); const ombre = st().P.ombre;
    pt.ev('facher(1)');
    av(0.5);                                                                   // (le temps qu'elle se mette en route)
    // sur la piste, elle va aussi vite que la course du Pisteur à découvert (3,6) : en marchant dans l'ombre (2,8), on ne la sème plus
    const g0 = st().G[0]; av(1.5, () => { aller(20, 15); }); const g1 = st().G[0], vitesse = hyp(g1.x - g0.x, g1.y - g0.y) / 1.5;
    let tTrouve = null; av(10, t => { aller(20, 15); if (!st().P.ombre) { tTrouve = t + 2; return true; } });
    const s = st();
    // un rôdeur tué sous les yeux d'un des siens
    scene([13, 12, -Math.PI / 2], [{ t: 'chien', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1 }, { t: 'chien', x: 13, y: 6.2, fa: Math.PI / 2, immobile: 1, cdS: 99 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.6); const temoin = st().coleres, enColere = st().G[0].colere;
    return { ok: ombre && vitesse > 3.45 && vitesse < 3.7 && tTrouve !== null && tTrouve < 6 && s.stats.flaires + s.stats.reperages === 1 && temoin === 1 && enColere,
      ombre, vitesseSurLaPiste: +vitesse.toFixed(2), rattrapeEnMarchantApres: tTrouve && +tTrouve.toFixed(1), flaireOuVu: [s.stats.flaires, s.stats.reperages], tueDevantUnDesSiens: [temoin, enColere] };
  };

  // 17. Le garde : le javelot blessé, son garde se colle dans son dos et pare tout. Il faut d'abord assommer le garde.
  S.garde = function () {
    scene([13, 12.2, -Math.PI / 2], [{ t: 'javelot', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1, cdS: 99, cdM: 99 }, { t: 'dalle', x: 16.5, y: 9, fa: -Math.PI / 2, immobile: 1, cdS: 99, cdM: 99, cd: 99 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.3); const hp0 = st().G[0].hp, col = st().coleres;
    pt.invincible(true); av(4, () => aller(13, 16.8)); av(1.5);
    const s = st(), colle = s.G[1].colle, couvert = s.G[0].couvert, ecart = hyp(s.G[0].x - s.G[1].x, s.G[0].y - s.G[1].y);
    const pare = pt.ev("blesserG(G[0],10,'dague')"), hp1 = st().G[0].hp;
    const rouge = pt.ev("blesserG(G[0],5,'rouge')"), hp2 = st().G[0].hp;                 // le rouge d'un autre golem passe, lui
    pt.ev('sonner(G[1],2)'); const libre = !st().G[0].couvert, touche = pt.ev("blesserG(G[0],10,'dague')"), hp3 = st().G[0].hp;
    pt.invincible(false);
    return { ok: hp0 === 20 && col === 1 && colle === 0 && couvert && ecart < 1.5 && pare === 'pare' && hp1 === 20 && rouge === true && hp2 === 15 && libre && touche === true && hp3 === 5,
      javelotApresEmbuscade: hp0, coleres: col, gardeColleA: colle, couvert, ecart: +ecart.toFixed(2), dagueSurJavelotCouvert: pare, vie: [hp1, hp2, hp3], gardeAssomme: [libre, touche] };
  };

  // 18. Le mortier en colère bombarde à l'aveugle autour de lui, même quand le Pisteur est dans l'ombre ; jamais sur ses amis
  S.mortier = function () {
    // (a) il n'a pas vu le Pisteur : son groupe a beau être en colère, il ne tire pas
    scene([13, 15.5, -Math.PI / 2], [{ t: 'mortier', x: 13, y: 8, fa: -Math.PI / 2, immobile: 1 }, { t: 'cuirasse', x: 9.5, y: 8, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.ev('facher(1)'); let n0 = 0; av(6, () => { n0 = Math.max(n0, st().obus.length); });
    const pasVu = { obus: n0, dechaine: st().G[0].dechaine };
    // (b) il le voit de ses yeux : il se déchaîne et il vise
    scene([13, 13.5, -Math.PI / 2], [{ t: 'mortier', x: 13, y: 8, fa: Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.invincible(true); let vises = 0;
    av(8, () => { const s = st(); for (const o of s.obus) if (o.t <= dt * 1.01 && hyp(o.x - s.P.x, o.y - s.P.y) < 0.6) vises++; });       // (un obus qui vient de partir, droit sur lui)
    const vu = { dechaine: st().G[0].dechaine, obusVises: vises };
    // (c) le Pisteur disparaît : il ne s'arrête plus, il bombarde à l'aveugle, tout autour de lui
    pt.ev('P.x=24;P.y=16.5;P.lx=24;P.ly=16.5;G[0].reg=G[0].fa=G[0].posteA=-Math.PI/2;G[0].voit=false;G[0].rem=0;nVoient=0;P.ombreCD=0'); av(0.05); pt.appui(4); av(0.3);
    const cache = st().P.ombre, pts = new Map();
    av(12, () => { const s = st(); for (const o of s.obus) { const k = o.x.toFixed(2) + ',' + o.y.toFixed(2); if (!pts.has(k)) pts.set(k, [o.x, o.y]); } });
    const d = Array.from(pts.values()).map(q => hyp(q[0] - 13, q[1] - 8)), tard = st().obus.length + st().G[0].etat;
    // (d) ses obus : un golem libre en sort toujours (même le cuirassé, le plus lent) ; un golem assommé le prend
    scene([13, 12.6, -Math.PI / 2], [{ t: 'mortier', x: 13, y: 6.5, fa: Math.PI / 2, immobile: 1 }, { t: 'cuirasse', x: 13.7, y: 12.9, fa: Math.PI, immobile: 1, grp: 2, cd: 99 }, { t: 'dalle', x: 12.2, y: 12.9, fa: 0, immobile: 1, grp: 3, cd: 99, cdS: 99, cdM: 99 }], { sansObstacles: 1 });
    pt.invincible(true); pt.ev('sonner(G[2],60)');
    let impacts = 0, av0 = 0, garde = 80; av(8, () => { const s = st(), n = s.obus.length; if (n < av0) impacts++; av0 = n; const d = s.G.find(g => g.type === 'dalle'); garde = d ? d.hp : 0; });
    const cui = st().G.find(g => g.type === 'cuirasse');
    const ok = pasVu.obus === 0 && !pasVu.dechaine && vu.dechaine && vu.obusVises >= 2 && cache && pts.size >= 5 && Math.min(...d) > 2.2 && Math.max(...d) < 7.3 && impacts >= 2 && cui.hp === 90 && garde <= 50;
    return { ok, pasVuParLui: pasVu, vuParLui: vu, disparu: { dansLOmbre: cache, obusAveugles: pts.size, deA: [+Math.min(...d).toFixed(1), +Math.max(...d).toFixed(1)], encoreApres12s: tard }, impacts, cuirasseLibre: cui.hp, gardeAssomme: garde };
  };

  // 19. Le bélier fou court dans toute la salle
  S.belierFou = function () {
    scene([24, 16.5, -Math.PI / 2], [{ t: 'belier', x: 5, y: 5, fa: 0, immobile: 1 }]);
    pt.appui(4); av(0.3); pt.ev('facher(1)');
    let dist = 0, lx = 5, ly = 5; const coins = new Set();
    av(16, () => { const g = st().G[0]; dist += hyp(g.x - lx, g.y - ly); lx = g.x; ly = g.y; coins.add((g.x > 13 ? 'E' : 'O') + (g.y > 9.5 ? 'S' : 'N')); if (!st().P.ombre) return true; });
    return { ok: dist > 35 && coins.size >= 3, parcouru: +dist.toFixed(0), quartiersVisites: coins.size, vitesse: +(dist / 16).toFixed(2) };
  };

  // 20. Le cuirassé frappé une fois : en boule, il roule sans s'arrêter, rebondit, ne blesse pas les autres golems ; 30 points pour le Pisteur,
  //     même dans l'ombre ; une embuscade au passage lui enlève un tiers de sa vie
  S.boule = function () {
    scene([13, 12, -Math.PI / 2], [{ t: 'cuirasse', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }, { t: 'chien', x: 6, y: 6, fa: 0, immobile: 1, grp: 2, cd: 99, cdS: 99 }, { t: 'chien', x: 20, y: 14, fa: 0, immobile: 1, grp: 2, cd: 99, cdS: 99 }]);
    pt.appui(4); av(0.3); pt.appui(1); av(0.35); const hp1 = st().G[0].hp, e1 = st().G[0].etat;
    pt.invincible(true);
    let tRoule = null; av(3, t => { if (st().G[0].etat === 'roule') { tRoule = t; return true; } });
    let dist = 0, lx = st().G[0].x, ly = st().G[0].y, dehors = 0, immobile = 0; const coins = new Set();
    av(25, () => { const g = st().G[0], pas = hyp(g.x - lx, g.y - ly); dist += pas; if (pas < 0.02) immobile++; lx = g.x; ly = g.y; if (g.x < 0.5 || g.x > 25.5 || g.y < 1.2 || g.y > 17.7) dehors++; coins.add((g.x > 13 ? 'E' : 'O') + (g.y > 9.5 ? 'S' : 'N')); });
    const chiens = st().G.filter(g => g.type === 'chien').map(g => g.hp), vitesse = dist / 25, voit = st().G[0].voit;
    pt.invincible(false);
    // le choc, le Pisteur dans l'ombre sur son chemin
    pt.ev("for(const g of G)if(g.type==='chien')g.etat='mort'"); av(0.1);
    av(6, () => { const s = st(); if (!s.P.ombre && s.nVoient === 0 && s.P.ombreCD <= 0) pt.appui(4); return s.P.ombre; });
    const dansOmbre = st().P.ombre, b0 = st().stats.boules; pt.ev('P.hp=100;G[0].tChoc=-9');
    let choc = false; av(30, () => { const s = st(), g = s.G[0]; if (s.P.hp < 100) { choc = true; return true; } pt.ev('P.x=clamp(G[0].x+Math.cos(G[0].va)*1.6,1,25);P.y=clamp(G[0].y+Math.sin(G[0].va)*1.6,2,17)'); });
    const hpP = st().P.hp, sortiOmbre = !st().P.ombre, boules = st().stats.boules - b0;
    // l'embuscade au vol
    pt.ev('P.hp=100'); pt.invincible(true);
    let vol = false; av(60, () => { const s = st(); if (!s.P.ombre) { if (s.nVoient === 0 && s.P.ombreCD <= 0) pt.appui(4); return; } if (s.P.aPortee === s.G[0].i && s.P.etat === 'libre') { pt.appui(1); vol = true; return true; } aller(13, 12.6); });
    av(0.5); const hp2 = st().G[0] ? st().G[0].hp : 0; pt.invincible(false);
    return { ok: hp1 === 60 && e1 === 'ramasse' && tRoule > 0.5 && tRoule < 1.3 && vitesse > 4.5 && vitesse < 5.3 && dehors === 0 && immobile < 15 && coins.size >= 3 && chiens.join() === '30,30' && !voit && dansOmbre && choc && hpP === 70 && sortiOmbre && boules === 1 && vol && hp2 === 30,
      apresEmbuscade: [hp1, e1], seRamasse: tRoule && +tRoule.toFixed(2), vitesse: +vitesse.toFixed(2), horsDeLaSalle: dehors, imagesSansBouger: immobile, quartiers: coins.size, viesDesRodeurs: chiens, choc: [dansOmbre, choc, hpP, sortiOmbre], embuscadeAuVol: [vol, hp2] };
  };

  // 21. Le faucheur frappé qu'on ne finit pas : un fantôme. Intouchable tant qu'on est caché ; dès qu'on se montre il surgit et fauche ;
  //     ensuite cinq secondes où on peut le frapper ; puis il s'efface de nouveau.
  S.fantome = function () {
    scene([13, 12, -Math.PI / 2], [{ t: 'faucheur', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }]);
    pt.appui(4); av(0.3); pt.appui(1); av(0.3); const hp1 = st().G[0].hp, furie = st().G[0].furie;
    pt.invincible(true);
    // on file se cacher derrière le muret, on repasse dans l'ombre
    let tF = null; av(14, t => { const s = st(); aller(15.6, 16.2); if (!s.P.ombre && s.nVoient === 0 && s.P.ombreCD <= 0) pt.appui(4); if (s.G[0].fantome) { tF = t; return true; } });
    av(6, () => { const s = st(); if (!s.P.ombre && s.nVoient === 0 && s.P.ombreCD <= 0) pt.appui(4); return s.P.ombre; });
    const cache = st().P.ombre, cible = pt.ev('cibleProche(99)===null&&cibleDague(99)===null'), coup = pt.ev("blesserG(G[0],10,'dague')"), hpF = st().G[0].hp;
    pt.invincible(false);
    // on se montre : il fonce, surgit, fauche ; on esquive à pied (une demi-seconde de réaction)
    pt.cmd({ mx: 0, my: 0 }); pt.ev("OBS=OBS.filter(o=>o.fond);majGrille();P.x=G[0].x<13?19:7;P.y=10;sortirOmbre('fin')");
    const dDepart = hyp(st().P.x - st().G[0].x, st().P.y - st().G[0].y);
    let tZone = null, t0 = null, dir = null, surgi = false;
    av(14, t => {
      const s = st(), g = s.G[0], P = s.P;
      if (g.zone) { if (tZone === null) tZone = t; surgi = surgi || !g.fantome; if (t0 === null) t0 = t; if (t0 !== null && t - t0 >= 0.5) { if (dir === null) dir = sortie(g.zone, P); pt.cmd({ mx: Math.cos(dir), my: Math.sin(dir) }); } }
      else if (tZone !== null) return true;
    });
    pt.cmd({ mx: 0, my: 0 });
    const hpP = st().P.hp, visible = !st().G[0].fantome, coup2 = pt.ev("blesserG(G[0],10,'dague')"), hp2 = st().G[0].hp;
    // on repart se cacher (ici : posé loin, dans l'ombre) : cinq secondes après son coup de faux, il s'efface de nouveau
    pt.ev('P.x=G[0].x<13?24:2;P.y=16.5;P.ombre=true;P.ombreCD=0'); let tF2 = null; av(9, t => { if (st().G[0].fantome) { tF2 = t; return true; } });
    return { ok: hp1 === 50 && furie && tF !== null && tF > 3.5 && cache && cible && coup === false && hpF === 50 && tZone !== null && surgi && hpP === 100 && visible && coup2 === true && hp2 === 40 && tF2 !== null && tF2 > 2.5 && tF2 < 6.5 && dDepart > 5,
      apresEmbuscade: hp1, devientFantomeApres: tF && +tF.toFixed(1), intouchable: [cible, coup, hpF], seMontreA: +dDepart.toFixed(1), surgitApres: tZone && +tZone.toFixed(1), fauchageEvite: hpP === 100, puisVisible: [visible, coup2, hp2], sEffaceDeNouveauApres: tF2 && +tF2.toFixed(1) };
  };

  // 22. Le colosse : insensible au coup qui assomme ; blessé, sa chaîne ramène le Pisteur au contact, sans dégât, et l'onde qui suit s'évite à pied ;
  //     plus d'ombre tant qu'il est vivant
  S.chaine = function () {
    scene([13, 12.8, -Math.PI / 2], [{ t: 'colosse', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(2); av(0.5); const s0 = st(), insensible = s0.G[0].sonne <= 0 && s0.stats.insensibles === 1 && !s0.P.ombre && s0.G[0].hp === 150 && !s0.G[0].enrage;
    scene([13, 12.8, -Math.PI / 2], [{ t: 'colosse', x: 13, y: 10.3, fa: -Math.PI / 2, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.3); const enrage = st().G[0].enrage, hpC = st().G[0].hp;
    // on file tout droit vers le bas : à plus de 6,5 pas, la chaîne
    let tCh = null, dMax = 0; av(6, t => { const s = st(); aller(25, 12.8); dMax = Math.max(dMax, hyp(s.P.x - s.G[0].x, s.P.y - s.G[0].y)); if (s.P.etat === 'chaine') { tCh = t; return true; } });
    av(3, () => st().P.etat !== 'chaine');
    const s1 = st(), dApres = hyp(s1.P.x - s1.G[0].x, s1.P.y - s1.G[0].y), hpApres = s1.P.hp;
    pt.appui(4); av(0.05); const ombreRefusee = !st().P.ombre;
    // l'onde qui suit : on l'évite à pied
    let t0 = null, vu = false;
    av(5, t => { const s = st(), g = s.G[0], P = s.P; if (g.zone) { vu = true; if (t0 === null) t0 = t; if (t - t0 >= 0.5) { const d = sortie(g.zone, P); pt.cmd({ mx: Math.cos(d), my: Math.sin(d) }); } } else if (vu) return true; });
    pt.cmd({ mx: 0, my: 0 });
    const s2 = st();
    return { ok: insensible && enrage && hpC === 120 && tCh !== null && dMax > 6.4 && dMax < 8.2 && dApres < 2.6 && hpApres === 100 && ombreRefusee && vu && s2.P.hp === 100 && s2.stats.chaines >= 1,      // (qui sort de l'onde en courant tout droit dépasse le périmètre : une deuxième chaîne)
      insensible, blesse: [enrage, hpC], chaineA: +dMax.toFixed(1), rameneA: +dApres.toFixed(1), vieApresLaChaine: hpApres, ombreRefusee, ondeEvitee: s2.P.hp === 100, chaines: s2.stats.chaines };
  };

  // 12. Le bandage : 20 points au bout de trois secondes sans bouger, dans l'ombre. Coupé par un coup ou par un saut : perdu.
  S.bandage = function () {
    const loin = [{ t: 'chien', x: 13, y: 5, fa: -Math.PI / 2, immobile: 1 }];
    scene([13, 15, -Math.PI / 2], loin, { sansObstacles: 1 }); pt.ev('P.hp=50');
    pt.appui(4); av(0.3); const ombre = st().P.ombre;
    pt.appui(4); av(0.1); const e1 = st().P.etat, b1 = st().P.bandages;
    pt.cmd({ mx: 1, my: 0 }); av(2.8); const x1 = st().P.x, hpAvant = st().P.hp; pt.cmd({ mx: 0, my: 0 });
    av(0.3); const hp1 = st().P.hp, e1b = st().P.etat;
    // coupé par un coup
    pt.appui(4); av(1); pt.ev("blesserP(5,{nom:'essai'})"); av(0.1); const s2 = st().P; const b2 = s2.bandages, hp2 = s2.hp, e2 = s2.etat;
    av(3.2); const hp2b = st().P.hp;
    // coupé par un saut
    pt.appui(4); av(0.3); const reOmbre = st().P.ombre; pt.appui(4); av(1); pt.appui(3); av(0.6); const b3 = st().P.bandages, hp3 = st().P.hp;
    // pas blessé : le bandage ne part pas
    pt.ev('P.hp=100'); pt.appui(4); av(0.2); const b4 = st().P.bandages, e4 = st().P.etat;
    // plus de bandage
    pt.ev('P.hp=30;P.bandages=0'); pt.appui(4); av(0.2); const e5 = st().P.etat;
    return { ok: ombre && e1 === 'bandage' && b1 === 4 && Math.abs(x1 - 13) < 0.01 && hpAvant === 50 && hp1 === 70 && e1b === 'libre' && b2 === 3 && hp2 === 65 && e2 === 'libre' && hp2b === 65 && reOmbre && b3 === 2 && hp3 === 65 && b4 === 2 && e4 === 'libre' && e5 === 'libre',
      ombre, e1, b1, x1, hpAvant, hp1, apresCoup: [b2, hp2, e2, hp2b], apresSaut: [b3, hp3], pasBlesse: [b4, e4], vide: e5 };
  };

  // 13. Le regard à découvert : loin devant (10 pas, tant que le golem est à l'écran), jamais dans le dos, jamais à travers un mur
  S.regard = function () {
    // (un golem immobile balaie la salle du regard : ici on fixe son regard droit devant lui, pour mesurer l'éventail lui-même)
    const vu = (p, g, opt) => { scene(p, [g], opt || { sansObstacles: 1 }); av(0.1); return [pt.ev('G[0].reg=G[0].fa;voitBrut(G[0])') ? 1 : 0, Math.round(st().G[0].marge)]; };
    const face8 = vu([16, 10, 0], { t: 'chien', x: 8, y: 10, fa: 0, immobile: 1 });               // 8 pas devant lui
    const face10 = vu([17.6, 10, 0], { t: 'chien', x: 8, y: 10, fa: 0, immobile: 1 });            // 9,6 pas : hors de l'écran du téléphone
    const dos = vu([5, 10, 0], { t: 'chien', x: 8, y: 10, fa: 0, immobile: 1 });                  // 3 pas dans son dos
    const cote = vu([8, 13.5, 0], { t: 'chien', x: 8, y: 10, fa: 0, immobile: 1 });               // de côté, hors de l'éventail
    const bord = vu([10.5, 13, 0], { t: 'chien', x: 8, y: 10, fa: 0, immobile: 1 });              // à 50° de son regard : dedans
    const haut6 = vu([13, 14, 0], { t: 'chien', x: 13, y: 8, fa: Math.PI / 2, immobile: 1 });     // 6 pas au-dessus, il regarde vers le bas
    const haut8 = vu([13, 15.5, 0], { t: 'chien', x: 13, y: 7.5, fa: Math.PI / 2, immobile: 1 }); // 8 pas au-dessus : hors de l'écran
    const mur = vu([9, 9.8, 0], { t: 'chien', x: 9, y: 6.4, fa: Math.PI / 2, immobile: 1 }, {});  // le pan de mur entre les deux
    const colle = vu([8.75, 10, 0], { t: 'dalle', x: 8, y: 10, fa: Math.PI, immobile: 1, cd: 99, cdS: 99, cdM: 99 });   // collé à son dos : il le sent
    // dans l'ombre, rien n'a changé : 3 pas, pas plus
    scene([12.5, 10, 0], [{ t: 'chien', x: 8, y: 10, fa: 0, immobile: 1 }], { sansObstacles: 1 }); pt.appui(4); av(1.5); const ombre45 = st().P.ombre;
    av(3, () => aller(10.4, 10)); av(6, () => !st().P.ombre); const ombre24 = st().P.ombre;     // (son regard balaie : il finit par passer)
    return { ok: face8[0] === 1 && face10[0] === 0 && dos[0] === 0 && cote[0] === 0 && bord[0] === 1 && haut6[0] === 1 && haut8[0] === 0 && mur[0] === 0 && colle[0] === 1 && ombre45 && !ombre24,
      face8, face10, dos, cote, bord, haut6, haut8, mur, colle, ombreA4pas5: ombre45, ombreA2pas4: ombre24 };
  };

  // 14. Le groupe soudé : un seul des deux voit le Pisteur, les deux rappliquent ; l'autre groupe ne sait rien
  S.groupe = function () {
    scene([14, 12.5, 0], [{ t: 'javelot', x: 8, y: 10, fa: 0.4, immobile: 1, cdS: 99, cdM: 99 }, { t: 'dalle', x: 7, y: 8.6, fa: -Math.PI / 2, immobile: 1, cdS: 99, cdM: 99 },
      { t: 'chien', x: 6.5, y: 12, fa: Math.PI, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    av(5, () => st().G[0].voit); av(0.05); const voient = st().G.map(g => g.voit);      // (le garde, lui, n'a encore rien vu de ses yeux : il tourne le dos)
    av(0.1); const modes1 = st().G.map(g => g.mode);
    // un bruit : le chien du groupe 2 est blessé loin de son copain (qui tourne le dos, à 9 pas) : le copain vient quand même
    scene([13, 12, -Math.PI / 2], [{ t: 'javelot', x: 13, y: 10.4, fa: -Math.PI / 2, immobile: 1, cdS: 99 }, { t: 'dalle', x: 4.5, y: 10.4, fa: Math.PI, immobile: 1, cdS: 99, cdM: 99 },
      { t: 'chien', x: 4.5, y: 14, fa: Math.PI, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.appui(1); av(0.3); const s2 = st(), modes2 = s2.G.map(g => g.mode);
    return { ok: voient.join() === 'true,false,false' && modes1.join() === 'chasse,chasse,ronde' && modes2.join() === 'chasse,chasse,ronde', voient, modes1, modes2 };
  };

  // 15. La vie ne remonte pas entre deux vagues ; les bandages non plus
  S.vie = function () {
    pt.figer(true); pt.cmd({ mx: 0, my: 0 }); pt.demarrer(0); av(3);
    pt.ev('P.hp=37;P.bandages=2'); pt.suivant(); av(6);
    const s = st();
    return { ok: s.vague === 1 && s.P.hp === 37 && s.P.bandages === 2 && s.stats.vieFin[0] === 37, vague: s.vague + 1, vie: s.P.hp, bandages: s.P.bandages };
  };

  // ===== VERSION 8 (25 novembre, 22 h) =====
  // L'ombre revient après trois secondes D'AFFILÉE sans être vu ; si un golem le revoit, le compte repart de zéro
  S.ombre3s = function () {
    // un rôdeur planté devant le grand pan de mur ; le Pisteur est d'abord sous ses yeux, droit devant lui
    scene([17.6, 9.6, Math.PI / 2], [{ t: 'chien', x: 17.6, y: 7.5, fa: Math.PI / 2, immobile: 1, cd: 99, cdS: 99, cdM: 99, vit: 0 }]);
    pt.invincible(true); av(0.8); const vu0 = st().nVoient, cd0 = st().P.ombreCD;
    pt.appui(4); av(0.1); const refuseVu = !st().P.ombre;                                            // sous ses yeux : refusé
    let tVu = 0, t = 0; const suivre = () => { t += dt; if (st().nVoient > 0) tVu = t; };
    av(8, () => { suivre(); return contourner(17.6, 12.5); });                                        // derrière le mur
    av(Math.max(0, tVu + 2.5 - t), suivre); pt.appui(4); av(0.05, suivre); const tropTot = st().P.ombre, cd25 = st().P.ombreCD;   // deux secondes et demie : pas encore
    // il se remontre un instant : tout est à refaire
    av(6, () => { suivre(); if (st().nVoient > 0) return true; contourner(15.0, 11.3); }); av(0.05, suivre); const revu = st().nVoient, cdRevu = st().P.ombreCD;
    av(8, () => { suivre(); return contourner(17.6, 12.5); });
    let tPret = null; av(6, () => { suivre(); if (st().P.ombreCD <= 0) { tPret = t; return true; } });
    pt.appui(4); av(0.2);
    const attente = tPret - tVu;
    return { ok: vu0 === 1 && cd0 === 3 && refuseVu && !tropTot && cd25 > 0.3 && cd25 < 0.6 && revu === 1 && cdRevu === 3 && Math.abs(attente - 3) < 0.1 && st().P.ombre,
      vuAuDebut: vu0, refuseSousSesYeux: refuseVu, apres2s5SansTemoin: [tropTot, +cd25.toFixed(2)], revu: [revu, cdRevu], attenteApresLeDernierRegard: +attente.toFixed(2), dansLOmbre: st().P.ombre };
  };

  // Un rôdeur sur la piste, frappé à découvert sans être tué : toute sa bande se rue sur le Pisteur (elle ne continue pas à renifler) ;
  // l'autre bande, à côté, ne bouge pas
  S.chienFrappe = function () {
    scene([3, 16, 0], [{ t: 'chien', x: 12, y: 9, fa: 0, cd: 99, cdS: 99, cdM: 99 }, { t: 'chien', x: 15.5, y: 9, fa: 0, cd: 99, cdS: 99, cdM: 99 }, { t: 'faucheur', x: 14, y: 6.5, fa: 0, cd: 99, cdS: 99, cdM: 99 }, { t: 'chien', x: 20, y: 15, fa: 0, immobile: 1, grp: 2 }], { sansObstacles: 1 });
    pt.invincible(true);
    // une longue piste, loin du Pisteur : ils la remontent, le nez au sol
    pt.ev('piste=[];pisteBase=0;for(let i=0;i<60;i++)piste.push({x:12+i*0.2,y:9});for(let i=0;i<40;i++)piste.push({x:24,y:9-i*0.15});facher(1);for(const g of G){g.pi=0;g.piT=tReel;}');
    av(1.2); const flairent = st().nFlair, x1 = st().G[0].x;
    // le Pisteur surgit à découvert dans le dos du premier, et le frappe une fois
    pt.ev('const g=G[0];P.x=g.x-Math.cos(g.fa)*1.0;P.y=g.y-Math.sin(g.fa)*1.0;P.lx=P.x;P.ly=P.y;P.fa=g.fa;P.ombre=false');
    pt.appui(1); av(0.2); const s1 = st(), hp = s1.G[0].hp, rue = s1.G.slice(0, 3).map(g => g.rue), autre = s1.G[3].mode;
    let vus = [false, false, false]; av(3, () => { const s = st(); s.G.slice(0, 3).forEach((g, i) => { if (g.voit) vus[i] = true; }); });
    const s2 = st();
    return { ok: flairent === 2 && hp === 20 && rue.every(Boolean) && vus.every(Boolean) && autre === 'ronde' && s2.G[3].mode === 'ronde', flairent, vieDuRodeurFrappe: hp, toutLeGroupeSeRue: rue, puisIlsLeVoientEtSeBattent: vus, lAutreBande: [autre, s2.G[3].mode] };
  };

  // Le réparateur : il va au blessé de son groupe, se penche (trente points toutes les trois secondes), ne voit plus rien ; une embuscade le tue
  S.reparateur = function () {
    scene([13, 16, -Math.PI / 2], [{ t: 'faucheur', x: 13, y: 8, fa: -Math.PI / 2, immobile: 1 }, { t: 'repare', x: 16.5, y: 8, fa: Math.PI, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); pt.ev('G[0].hp=20');
    let tPenche = null, tA = null, tB = null; av(12, t => { const s = st(), f = s.G[0], r = s.G[1]; if (r.penche && tPenche === null) tPenche = t; if (f.hp >= 50 && tA === null) tA = t; if (f.hp >= 80) { tB = t; return true; } });
    const plein = st().G[0].hp; pt.ev('G[0].hp=20'); av(0.5);
    // penché, il ne voit rien : le Pisteur se plante dans l'ombre devant lui, à un pas et demi (hors du regard du faucheur, qui regarde ailleurs)
    const r = st().G[1], a = r.fa - 0.75, fx = r.x + Math.cos(a) * 1.5, fy = r.y + Math.sin(a) * 1.5, dansSonRegard = Math.abs(ang(Math.atan2(fy - r.y, fx - r.x) - r.fa)) < r.cone;
    av(8, () => aller(fx, fy)); av(1.2); const pasVu = st().P.ombre, penche = st().G[1].penche;
    // puis il passe dans son dos : une embuscade, et il n'y a plus de réparateur
    av(6, () => aller(r.x + 0.4, r.y + 1.5)); av(6, () => aller(r.x + 1.25, r.y + 0.1)); pt.appui(1); av(0.8); const s = st();
    // le témoin : un réparateur qui n'a personne à soigner voit comme les autres
    scene([13, 16, -Math.PI / 2], [{ t: 'repare', x: 16.5, y: 8, fa: Math.PI, immobile: 1 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3); av(8, () => aller(15.2, 8.5)); av(3.5); const temoin = !st().P.ombre;
    return { ok: tPenche !== null && tA !== null && Math.abs(tA - tPenche - 3) < 0.25 && Math.abs(tB - tA - 3) < 0.25 && plein === 80 && dansSonRegard && pasVu && penche && s.G.length === 1 && s.G[0].type === 'faucheur' && s.P.hp === 100 && temoin,
      sePencheApres: tPenche && +tPenche.toFixed(1), plus30Apres: tA && +(tA - tPenche).toFixed(2), encore30Apres: tB && +(tB - tA).toFixed(2), vieRendue: plein, penchéIlNeVoitPas: [dansSonRegard, pasVu, penche], tuéDUneEmbuscade: s.G.length === 1 && s.G[0].type === 'faucheur', viePisteur: s.P.hp, deboutIlVoit: temoin };
  };

  // La flèche qui endort : une seule fois, dans l'ombre ; le golem dort pour de bon, son regard ne voit plus ; le premier coup le réveille ;
  // le colosse ne peut pas être visé ; lâchée trop tôt ou sans cible, la carte est gardée
  S.carteFleche = function () {
    scene([13, 15, -Math.PI / 2], [{ t: 'dalle', x: 13, y: 9, fa: -Math.PI / 2, immobile: 1, cd: 99, cdS: 99, cdM: 99 }, { t: 'colosse', x: 4, y: 15, fa: Math.PI, immobile: 1, grp: 2, cd: 99, cdS: 99 }], { sansObstacles: 1 });
    pt.carte('fleche'); av(0.1); const aDecouvert = st().P.cartes.fleche;                                             // à découvert : refusée, gardée
    pt.appui(4); av(0.3);
    pt.ev('P.fa=Math.PI'); av(0.05); const viseColosse = st().P.cibles.fleche; pt.carte('fleche'); av(0.1); const surColosse = st().P.cartes.fleche;      // le colosse : pas de marque, carte gardée
    pt.ev('P.fa=-Math.PI/2'); av(0.05); const vise = st().P.cibles.fleche; pt.carte('fleche'); av(0.2);
    const s1 = st(), dort = s1.G[0].dort;
    pt.carte('fleche'); av(0.2); const deuxieme = st().G.filter(g => g.dort).length;                                  // une seule fois
    av(8, () => aller(14.6, 9)); av(8, () => aller(13, 7.5)); av(1.5); const devantLui = st().P.ombre;                 // en plein dans son regard : il dort
    pt.appui(1); av(0.6); const s2 = st();
    return { ok: aDecouvert === 1 && viseColosse === -1 && surColosse === 1 && vise === 0 && dort && s1.P.cartes.fleche === 0 && s1.P.ombre && deuxieme === 1 && devantLui && !s2.G[0].dort && s2.G[0].hp === 50,
      refuséeÀDécouvert: aDecouvert === 1, leColosseNeSeVisePas: [viseColosse, surColosse], marqueSurLeGarde: vise, ilDort: dort, carteDépensée: s1.P.cartes.fleche === 0, toujoursDansLOmbre: s1.P.ombre, devantSonRegard: devantLui, réveilléParLeCoup: [!s2.G[0].dort, s2.G[0].hp] };
  };

  // Le sifflet : le groupe du golem visé part voir ailleurs ; l'autre groupe, tout contre, ne bouge pas ; puis ils reviennent
  S.carteSifflet = function () {
    scene([13, 15.5, -Math.PI / 2], [{ t: 'chien', x: 12, y: 10, fa: Math.PI, immobile: 1 }, { t: 'chien', x: 13, y: 10, fa: Math.PI, immobile: 1 }, { t: 'javelot', x: 14.5, y: 9.4, fa: 0, immobile: 1, grp: 2 }]);
    pt.appui(4); av(0.3); pt.ev('P.fa=Math.atan2(10-P.y,12.5-P.x)'); av(0.05);
    const vise = st().P.cibles.sifflet; pt.carte('sifflet'); av(0.1);
    const s0 = st(), L = s0.leurres[0];
    let loin = 0, javBouge = 0; av(9, () => { const s = st(); loin = Math.max(loin, Math.min(hyp(s.G[0].x - 12, s.G[0].y - 10), hyp(s.G[1].x - 13, s.G[1].y - 10))); javBouge = Math.max(javBouge, hyp(s.G[2].x - 14.5, s.G[2].y - 9.4)); });
    const s1 = st(), pres = L ? Math.max(hyp(s1.G[0].x - L.x, s1.G[0].y - L.y), hyp(s1.G[1].x - L.x, s1.G[1].y - L.y)) : 99;
    av(16); const s2 = st(), revenus = Math.max(hyp(s2.G[0].x - 12, s2.G[0].y - 10), hyp(s2.G[1].x - 13, s2.G[1].y - 10));
    return { ok: (vise === 0 || vise === 1) && s0.P.cartes.sifflet === 0 && s0.P.ombre && !!L && s0.G[0].leurre && s0.G[1].leurre && !s0.G[2].leurre && loin > 6 && pres < 2.5 && javBouge < 0.6 && !s2.G[0].leurre && revenus < 1.2,
      marqueSur: vise, pointDuSifflet: L && [L.x, L.y], laMeuteSEloigneDe: +loin.toFixed(1), elleChercheLàBas: +pres.toFixed(1), leJavelotNABougéQueDe: +javBouge.toFixed(2), puisElleRevient: +revenus.toFixed(2) };
  };

  // La cape d'ombre : dix secondes où rien ne sort le Pisteur de l'ombre, ni un regard, ni sa propre lame ; ensuite tout redevient normal
  S.carteCape = function () {
    scene([13, 15.5, -Math.PI / 2], [{ t: 'chien', x: 13, y: 10, fa: Math.PI / 2, immobile: 1, cd: 99, cdS: 99, cdM: 99 }, { t: 'chien', x: 16, y: 10, fa: Math.PI / 2, immobile: 1, cd: 99, cdS: 99, cdM: 99, grp: 2 }, { t: 'dalle', x: 19.5, y: 10, fa: Math.PI / 2, immobile: 1, cd: 99, cdS: 99, cdM: 99, grp: 3 }], { sansObstacles: 1 });
    pt.appui(4); av(0.3);
    pt.carte('cape'); av(0.05); const t0 = st().t, cape = st().P.capeT, carte = st().P.cartes.cape;
    av(6, () => aller(13, 11.6)); av(1.0); const devant = st().P.ombre;                                                       // dans son regard, une seconde
    pt.appui(1); av(0.6); const apres1 = [st().G.length, st().P.ombre];
    av(6, () => aller(16, 11.6)); pt.appui(1); av(0.6); const apres2 = [st().G.length, st().P.ombre], tFait = st().t - t0;
    // la cape tombe : devant le garde, son regard finit par passer sur lui, et il est repéré comme d'habitude
    av(6, () => aller(19.5, 12.2)); av(Math.max(0.1, 10.2 - (st().t - t0))); const fin = st().P.capeT, encore = st().P.ombre;
    let repere = null; av(6, t => { if (!st().P.ombre) { repere = t; return true; } });
    return { ok: cape > 9.9 && carte === 0 && devant && apres1[0] === 2 && apres1[1] && apres2[0] === 1 && apres2[1] && tFait < 10 && fin === 0 && encore && repere !== null,
      cape: +cape.toFixed(1), devantUnRegard: devant, apresLaPremiereEmbuscade: apres1, apresLaDeuxieme: apres2, deuxEmbuscadesEn: +tFait.toFixed(1), capeTombée: [fin, encore], puisRepéréAprès: repere && +repere.toFixed(1) };
  };

  // À terre : on repart de la vague qu'on veut, avec la vie, les bandages et les cartes qu'on avait en la commençant
  S.reprise = function () {
    pt.figer(true); pt.cmd({ mx: 0, my: 0 }); pt.demarrer(0); av(2);
    pt.ev('P.hp=64;P.bandages=3;P.cartes.cape=0'); pt.suivant(); av(6);
    pt.ev('P.hp=9;P.bandages=0;P.cartes.fleche=0'); pt.suivant(); av(6);
    const s0 = st(), sv = s0.sauves;
    pt.reprendreVague(1); av(0.5); const a = st();
    pt.reprendreVague(2); av(0.5); const b = st();
    pt.reprendreVague(0); av(0.5); const c = st();
    const ok = s0.vague === 2 && sv.length === 3 && sv[1].hp === 64 && sv[1].bandages === 3 && sv[1].cartes.cape === 0 && sv[1].cartes.fleche === 1 && sv[2].hp === 9 &&
      a.vague === 1 && a.P.hp === 64 && a.P.bandages === 3 && a.P.cartes.cape === 0 && a.P.cartes.fleche === 1 && a.sauves.length === 3 &&
      b.vague === 2 && b.P.hp === 9 && b.P.bandages === 0 && b.P.cartes.fleche === 0 && c.vague === 0 && c.P.hp === 100 && c.P.bandages === 5 && c.P.cartes.cape === 1;
    return { ok, gardé: sv, repartDeLa2: [a.vague + 1, a.P.hp, a.P.bandages, a.P.cartes], repartDeLa3: [b.vague + 1, b.P.hp, b.P.bandages], repartDeLa1: [c.vague + 1, c.P.hp, c.P.bandages] };
  };

  // Les vagues : jamais plus de trois rôdeurs dans une meute ; un réparateur n'est jamais seul ; aucun poste dans un mur
  S.vagues = function () {
    const r = JSON.parse(pt.ev(`JSON.stringify((()=>{majGrille();let meute=0,total=0,seul=0,mur=0,parVague=[];
      for(const V of VAGUES){let n=0;for(const g of V.groupes){const t=g.m.map(m=>m.t||m);n+=t.length;meute=Math.max(meute,t.filter(x=>x==='chien').length);
        if(t.includes('repare')&&t.length<2)seul++;for(const m of g.m)if(m.poste&&bloque[cel(m.poste[0],m.poste[1])])mur++;
        if(g.route)for(const q of ROUTES[g.route])if(bloque[cel(q[0],q[1])])mur++;}parVague.push(n);total+=n;}
      return {meute,total,seul,mur,parVague,n:VAGUES.length};})())`));
    return Object.assign({ ok: r.meute <= 3 && r.seul === 0 && r.mur === 0 && r.n === 8 }, r);
  };

  // 30. Les renforts (version 9, Romain, 26 novembre) : avant chaque bande le cor, l'œil de la porte allumé, la bande deux secondes
  //     après ; dès qu'UNE bande est tombée, la suivante de la réserve arrive (pas besoin que la salle soit vide) ; vague 8 : le
  //     colosse et son mortier entrent quand la première bande est morte ; la vague ne finit que quand tout est tombé.
  S.renforts = function () {
    const E = c => JSON.parse(pt.ev('JSON.stringify(' + c + ')'));
    const etat = () => E("({al:[alerteT[0]>0,alerteT[1]>0],G:G.filter(g=>g.etat!=='mort').map(g=>g.type),file:file.length,faits:groupesFaits,phase,t:+phaseT.toFixed(2)})");
    const tuer = t => pt.ev("for(const g of G)if(g.etat!=='mort'&&(" + t + ")){g.etat='mort';g.t=0;g.zone=null;}");
    pt.figer(true); pt.tenir(1, false); pt.tenir(4, false); pt.cmd({ mx: 0, my: 0 }); pt.demarrer(7); pt.invincible(true); pt.ev('P.x=13;P.y=17.2;P.lx=13;P.ly=17.2');
    av(0.4); const a = etat();                    // rien n'est encore annoncé
    av(0.3); const b = etat();                    // les deux bandes du début sont annoncées : les deux portes allumées, personne dans la salle
    av(1.6); const c = etat();                    // 2,3 s : toujours personne (elles sortent deux secondes après l'annonce)
    av(3.2); const d = etat();                    // tout le monde est sorti : deux béliers, leur réparateur, trois rôdeurs
    av(2.0); const d2 = etat();                   // les portes se sont éteintes
    tuer("g.type==='chien'"); av(0.1); const e = etat();        // la meute est tombée : le colosse (porte 1) et le mortier (porte 2) sont annoncés…
    av(1.7); const f = etat();                    // … mais pas encore là, 1,8 s après
    av(2.0); const g = etat();                    // … ils sont là ; les béliers sont toujours vivants
    tuer("g.type!=='colosse'"); av(3); const h = etat();        // il ne reste que le colosse : la vague n'est pas finie, et plus personne n'arrive
    tuer("true"); av(0.3); const i = etat();      // tout est tombé : la vague est finie
    // vague 1 : un rôdeur seul ; à sa mort, les deux suivants sont annoncés, puis arrivent
    pt.demarrer(0); pt.invincible(true); pt.ev('P.x=13;P.y=17.2;P.lx=13;P.ly=17.2'); av(3.4); const v1 = etat();
    tuer("true"); av(0.1); const v2 = etat(); av(3.2); const v3 = etat();
    const n = (s, t) => s.G.filter(x => x === t).length;
    const ok = !a.al[0] && !a.al[1] && a.file === 0 && b.al[0] && b.al[1] && b.file === 6 && b.G.length === 0 && c.G.length === 0 && c.file === 6 &&
      d.G.length === 6 && d.file === 0 && !d2.al[0] && !d2.al[1] && e.al[0] && e.al[1] && e.file === 3 && e.faits === 4 && n(f, 'colosse') === 0 && n(g, 'colosse') === 1 && n(g, 'belier') === 2 && n(g, 'mortier') === 1 &&
      h.phase === 'vague' && h.G.length === 1 && h.file === 0 && i.phase === 'fin' &&
      v1.G.length === 1 && v2.al[1] && v2.file === 2 && v2.G.length === 0 && v3.G.length === 2;
    return { ok, avant: a, annonce: b, a2s3: c, sortis: d, portesEteintes: d2.al, meuteTombee: e, pasEncore: f.G, puis: g.G, resteLeColosse: [h.phase, h.G, h.file], toutTombe: i.phase, vague1: [v1.G, v2.al, v2.file, v3.G] };
  };

  return S;
})();
