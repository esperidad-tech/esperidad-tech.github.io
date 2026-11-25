// (version 8 : il vise d'abord le réparateur, il ne se méfie pas d'un golem endormi. Il ne joue PAS les cartes dorées et il ne connaît pas
//  les nouvelles combinaisons : ses mesures disent si une vague se finit sans carte, pas si elle est bien réglée.)
// Un joueur automatique pour le combat (version 7 : les colères) : « frapper, disparaître, revenir », et compter sa vie.
// Les colères : il guette la boule dans l'ombre et la cueille au passage ; il sert d'appât au fantôme, esquive sa faux, le frappe ;
// il assomme rien du tout (il laisse le javelot couvert et s'occupe du garde) ; face au colosse blessé il reste et se bat.
// Une partie = un seul essai : à terre, tout est à refaire (la règle du 25 novembre au soir). Il pose ses bandages dans l'ombre, au calme.
// Il joue par les mêmes entrées qu'un joueur (le pouce gauche, les quatre boutons), à pas fixes, sans attendre l'écran.
//   __sim({reaction:0.5})                 une partie entière d'un joueur appliqué (il réagit au rouge en une demi-seconde)
//   __sim({moyen:true})                   un joueur moyen (il réagit en 0,7 s, rate un rouge sur sept, s'attarde au corps à corps)
//   __sim({maladroit:true})               un joueur maladroit (il réagit tard, rate un rouge sur trois, se bat à découvert)
// Dans l'ombre : il choisit une proie, la contourne sans passer devant les regards, ouvre (embuscade, ou assommer pour le javelot).
// À découvert : quelques coups tant que c'est sûr, puis il file derrière un mur, repasse dans l'ombre, et revient.
window.__robot5 = function (o) {
  o = o || {};
  const pt = __pt, hyp = Math.hypot, REG = pt.reg(), TAU = Math.PI * 2;
  const ang = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
  const reaction = o.reaction == null ? (o.maladroit ? 0.8 : o.moyen ? 0.7 : 0.5) : o.reaction, rate = o.rate == null ? (o.maladroit ? 0.35 : o.moyen ? 0.15 : 0) : o.rate, traine = o.moyen ? 1.7 : 1;
  const BUDGET = { repare: 0.6, chien: 0.45, javelot: 2.7, mortier: 0.3, faucheur: 0.8, belier: 1.7, dalle: 0.9, cuirasse: 0.35, colosse: 1.4 };
  const BASE = { repare: -4, chien: 0, mortier: -1.5, javelot: 1, faucheur: 3, belier: 3, dalle: 4.5, colosse: 5, cuirasse: 6 };
  const DUREE = { fleche: REG.chien.plaqT, fin: REG.javelot.armeT, cercle: REG.dalle.leveT, cone: REG.faucheur.faucheT, ligne: REG.belier.gratteT, demi: REG.colosse.ondeT, anneau: REG.colosse.anneau.T, croix: REG.colosse.croix.T };
  let R;
  const B = { blocs: [], fuites: [], ouvertures: 0, duels: 0, bloque: 0, esquivesAuSaut: 0, bandagesDemandes: 0, tModes: { chasse: 0, frappe: 0, fuite: 0, duel: 0, attente: 0 } };
  const seuilBandage = o.maladroit ? 45 : 80;
  function reset() { R = { t: R ? R.t : 0, mode: 'chasse', cible: null, tMode: 0, tCible: -9, cache: null, tCache: -9, zt: new Map(), ignore: new Map(), lx: 0, ly: 0, tBouge: 0, devie: 0, devieS: 1, typeCible: '', dist: null, tDist: -9 }; for (let n = 1; n <= 4; n++) pt.tenir(n, false); pt.cmd({ mx: 0, my: 0 }); }
  reset();
  const cmd = (a, v) => pt.cmd({ mx: Math.cos(a) * (v == null ? 1 : v), my: Math.sin(a) * (v == null ? 1 : v) });
  const stop = () => pt.cmd({ mx: 0, my: 0 });
  function mode(m) { if (R.mode !== m) { R.mode = m; R.tMode = R.t; } }
  // est-ce que ce point est dans le regard d'un golem (quand le Pisteur est dans l'ombre) ?
  function dansRegard(G, x, y, marge) {
    for (const g of G) { if (g.sonne > 0 || g.dort || g.penche || g.etat === 'entre') continue; const dx = x - g.x, dy = y - g.y, d = hyp(dx, dy); if (d < REG.ombre.portee + marge && Math.abs(ang(Math.atan2(dy, dx) - g.reg)) < REG.ombre.cone + marge * 0.5 + 0.12 && pt.vue(g.x, g.y, x, y)) return true; }
    return false;
  }
  function versPoint(P, x, y, G, prudence) {
    const [nx, ny] = pt.chemin(P.x, P.y, x, y); let a = Math.atan2(ny - P.y, nx - P.x);
    if (hyp(x - P.x, y - P.y) < 0.7) a = Math.atan2(y - P.y, x - P.x);
    if (R.devie > 0) { R.devie--; a += R.devieS * 1.4; }
    if (prudence) { let ok = null; for (const da of [0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6, 2.3, -2.3]) { const qx = P.x + Math.cos(a + da) * 0.7, qy = P.y + Math.sin(a + da) * 0.7; if (!dansRegard(G, qx, qy, 0.25) && !pt.obsEn(qx, qy, 0.3, false)) { ok = a + da; break; } } if (ok === null) { stop(); return; } a = ok; }
    cmd(a);
  }
  function danger(s) {
    const P = s.P, zs = [];
    s.G.forEach(g => { if (g.zone) zs.push(['g' + g.i + g.zone.k, g.zone, (1 - g.zone.p) * (DUREE[g.zone.k] || 1)]); if (g.etat === 'charge') zs.push(['c' + g.i, { k: 'ligne', x: g.x, y: g.y, a: g.fa, L: 5, l: 1.5, fige: true }, hyp(P.x - g.x, P.y - g.y) / 12]); if (g.etat === 'plaque') zs.push(['p' + g.i, { k: 'cercle', x: g.x, y: g.y, r: 1.2, fige: true }, 0.1]);
      if (g.etat === 'roule') zs.push(['b' + g.i, { k: 'ligne', x: g.x, y: g.y, a: g.va, L: 7, l: 1.5, fige: true }, hyp(P.x - g.x, P.y - g.y) / REG.cuirasse.vRoule]); });      // la boule qui arrive (on la voit venir de loin)
    s.obus.forEach((ob, i) => zs.push(['o' + Math.round(ob.x * 10) + '_' + Math.round(ob.y * 10), { k: 'cercle', x: ob.x, y: ob.y, r: ob.r, fige: true }, ob.dur - ob.t]));
    s.javs.forEach((j, i) => zs.push(['j' + i, { k: 'fin', x: j.x, y: j.y, a: j.a, L: 6, l: 0.9, fige: true }, hyp(P.x - j.x, P.y - j.y) / j.v]));
    let pire = null;
    const vus = new Set();
    for (const [cle, z, reste] of zs) {
      const zz = z.k === 'fin' ? Object.assign({}, z, { l: 1.0 }) : z;
      if (!pt.dansZone(zz, P.x, P.y, 0.35)) continue;
      vus.add(cle);
      if (!R.ignore.has(cle)) R.ignore.set(cle, Math.random() < rate);
      if (R.ignore.get(cle)) continue;
      const suit = z.k === 'fleche' || z.k === 'ligne' || z.k === 'fin';
      if (!R.zt.has(cle)) { if (suit && !z.fige) continue; R.zt.set(cle, R.t); }
      if (R.t - R.zt.get(cle) < reaction) continue;
      if (!pire || reste < pire[2]) pire = [cle, zz, reste];
    }
    for (const k of Array.from(R.zt.keys())) if (!vus.has(k) && R.t - R.zt.get(k) > 2.5) { R.zt.delete(k); R.ignore.delete(k); }
    if (!pire) return false;
    const z = pire[1], dx = P.x - z.x, dy = P.y - z.y, d = hyp(dx, dy) || 1e-3;
    let dirs;
    if (z.k === 'cercle' || z.k === 'cone') dirs = [Math.atan2(dy, dx)];
    else if (z.k === 'anneau') dirs = [Math.atan2(dy, dx) + Math.PI, Math.atan2(dy, dx)];
    else if (z.k === 'croix') { const b = Math.atan2(dy, dx); dirs = [b + Math.PI / 2, b - Math.PI / 2, b]; }
    else if (z.k === 'demi') { const da = ang(Math.atan2(dy, dx) - z.a); dirs = [Math.atan2(dy, dx), Math.atan2(dy, dx) + (da >= 0 ? 1 : -1) * Math.PI / 2]; }
    else { const v = -dx * Math.sin(z.a) + dy * Math.cos(z.a), sg = v >= 0 ? 1 : -1; dirs = [z.a + sg * Math.PI / 2, z.a - sg * Math.PI / 2]; }
    // la sortie la plus courte, sans rentrer dans un mur
    let best = null;
    for (const a of dirs) { let L = 0, x = P.x, y = P.y, bloque = false; while (L < 6 && pt.dansZone(z, x, y, 0.35)) { L += 0.2; x = P.x + Math.cos(a) * L; y = P.y + Math.sin(a) * L; if (pt.obsEn(x, y, 0.3, true) || x < 0.6 || x > 25.4 || y < 1.7 || y > 17.4 || (z.k === 'anneau' && hyp(x - z.x, y - z.y) < 1.5)) { bloque = true; break; } } if (z.k === 'demi' && a !== dirs[0]) L = d * (Math.PI / 2 + 0.25 - Math.abs(ang(Math.atan2(dy, dx) - z.a))); if (bloque) L += 4; if (!best || L < best[1]) best = [a, L]; }
    const vit = (P.ombre ? REG.vitOmbre : REG.vit) * (P.lentT > 0 ? 0.1 : 1) * (P.etat === 'dague' ? 0.35 : 1);
    for (let n = 1; n <= 4; n++) if (n !== 3) pt.tenir(n, false);
    cmd(best[0]);
    if (!o.sansSaut && best[1] / vit > pire[2] - 0.08 && P.sautCD <= 0 && P.peutBouger) { pt.appui(3); B.esquivesAuSaut++; }
    return true;
  }
  function choisirCible(s) {
    const P = s.P, D = pt.distances(P.x, P.y); let best = null, bs = 1e9;
    for (const g of s.G) { if (g.etat === 'entre' || g.fantome) continue; let sc = (g.couvert ? 40 : 0) + (g.colle >= 0 ? -5 : 0) + (g.etat === 'roule' ? 2 : 0) + (BASE[g.type] || 0) + Math.min(40, D(g.x, g.y)) * 0.35 - (g.hp <= REG.embuscade.dmg ? 6 : 0); if (g.type === 'dalle' && s.G.some(q => q.type === 'javelot' && q.grp === g.grp)) sc += 3; if (sc < bs) { bs = sc; best = g; } }
    return best;
  }
  function choisirCache(s) {
    const P = s.P, voient = s.G.filter(g => g.voit || g.mode === 'chasse'), D = pt.distances(P.x, P.y); let best = null, bs = 1e9;
    for (const [x, y] of pt.caches()) {
      if (voient.some(g => pt.vue(g.x, g.y, x, y))) continue;
      const dg = Math.min(99, ...s.G.map(g => hyp(g.x - x, g.y - y))); if (dg < 2.2) continue;
      const sc = D(x, y) - Math.min(dg, 8) * 0.35; if (sc < bs) { bs = sc; best = [x, y]; }
    }
    return best;
  }
  function choisirCalme(s) {   // le coin le plus loin de tout le monde, pour se soigner
    const P = s.P; let best = null, bs = -1e9;
    for (const [x, y] of pt.caches()) { const dg = Math.min(99, ...s.G.map(g => hyp(g.x - x, g.y - y))); const sc = Math.min(dg, 9) - hyp(x - P.x, y - P.y) * 0.25; if (dg > 5 && sc > bs) { bs = sc; best = [x, y]; } }
    return best;
  }
  function murBasDevant(P, a) {   // un mur bas à sauter dans cette direction ?
    let mur = false; for (let L = 0.5; L <= 2.4; L += 0.3) { const x = P.x + Math.cos(a) * L, y = P.y + Math.sin(a) * L; if (pt.obsEn(x, y, 0.2, true)) return false; if (pt.obsEn(x, y, 0.2, false)) mur = true; }
    const x = P.x + Math.cos(a) * 3.1, y = P.y + Math.sin(a) * 3.1; return mur && x > 0.8 && x < 25.2 && y > 1.9 && y < 17.2 && !pt.obsEn(x, y, 0.35, true);
  }
  function pas(dtR) {
    R.t += dtR;
    const s = pt.etat(), P = s.P; if (s.etatJeu !== 'jeu') return;
    B.tModes[R.mode] = (B.tModes[R.mode] || 0) + dtR;
    if (!P.peutBouger && P.lentT <= 0) { stop(); return; }
    // un bandage en cours : on ne bouge plus ; un rouge qui arrive ? tant pis pour le bandage, on saute
    if (P.etat === 'bandage') { stop(); for (let n = 1; n <= 4; n++) pt.tenir(n, false); danger(s); return; }
    // coincé ? un petit écart
    const bouge = hyp(P.x - R.lx, P.y - R.ly); R.lx = P.x; R.ly = P.y; if (bouge > 0.02) R.tBouge = R.t; else if (R.t - R.tBouge > 2.5 && R.mode !== 'attente' && P.etat === 'libre') { R.devie = 14; R.devieS = Math.random() < .5 ? 1 : -1; R.tBouge = R.t; B.bloque++; if (B.blocs.length < 12) B.blocs.push([R.mode, +P.x.toFixed(1), +P.y.toFixed(1), P.etat, s.vague + 1, s.nVoient, s.G.map(g => g.type[0] + ':' + g.x.toFixed(0) + ',' + g.y.toFixed(0) + ':' + g.etat).join(' ')]); }
    if (danger(s)) return;
    const G = s.G.filter(g => g.etat !== 'entre');
    if (!G.length) { stop(); pt.tenir(1, false); if (!P.ombre && s.nVoient === 0 && P.ombreCD <= 0 && s.phase === 'vague' && s.G.length) pt.appui(4); return; }
    const cible = R.cible != null ? G.find(g => g.i === R.cible) : null;
    // LES COLÈRES
    const fantomes = G.filter(g => g.fantome), touchables = G.filter(g => !g.fantome), furieux = G.find(g => g.enrage);
    if (furieux && R.mode !== 'duel') { mode('duel'); B.duels++; }                    // le colosse blessé : on ne quitte plus ce combat
    if (!touchables.length && fantomes.length) {
      // il ne reste qu'un fantôme : il faut se montrer. Dans l'ombre, pas d'autre moyen que de passer devant ses yeux ; puis on attend sa faux.
      pt.tenir(1, false); const f = fantomes[0];
      if (P.ombre) versPoint(P, f.x + Math.cos(f.reg) * 1.8, f.y + Math.sin(f.reg) * 1.8, [], false); else stop();
      if (R.mode !== 'duel') mode('duel'); R.tMode = R.t;
      return;
    }
    switch (R.mode) {
      case 'chasse': {
        pt.tenir(1, false);
        if (!P.ombre) {
          if (s.nVoient > 0) { mode('fuite'); R.tFuite = R.t; break; }
          if (P.ombreCD <= 0) { pt.appui(4); break; }
          // en attendant l'ombre : rester à l'abri
          if (!R.cache || R.t - R.tCache > 1) { R.cache = choisirCache(s); R.tCache = R.t; }
          if (R.cache) versPoint(P, R.cache[0], R.cache[1], G, false); else stop();
          break;
        }
        // blessé, dans l'ombre, au calme (personne à moins de 4,5 pas, aucun regard à côté) : un bandage
        if (P.hp <= Math.min(seuilBandage, P.max - REG.bandage.soin) && P.bandages > 0 && P.etat === 'libre') {
          const pres = G.some(g => hyp(g.x - P.x, g.y - P.y) < 4.5 && g.sonne <= 0), cherche = G.some(g => (g.mode !== 'ronde' || g.colere || g.etat === 'roule') && hyp(g.x - P.x, g.y - P.y) < 9);
          if (!pres && !cherche && !dansRegard(G, P.x, P.y, 1.2)) { stop(); pt.appui(4); B.bandagesDemandes++; R.tMode = R.t; break; }
          if (P.hp <= 45) {   // vraiment mal en point : d'abord un coin tranquille
            if (!R.cache || R.t - R.tCache > 1.5) { R.cache = choisirCalme(s); R.tCache = R.t; }
            if (R.cache) { if (hyp(R.cache[0] - P.x, R.cache[1] - P.y) > 0.5) versPoint(P, R.cache[0], R.cache[1], G, true); else stop(); R.tMode = R.t; break; }
          }
        }
        // rien à faire depuis longtemps (deux golems qui se couvrent, une proie dos au mur) : un saut d'ombre, ou la bagarre
        if (R.t - R.tMode > 14) { if (P.sautOmbreCD <= 0 && cible && hyp(cible.x - P.x, cible.y - P.y) < REG.sautOmbre.portee) { pt.appui(3); R.tMode = R.t - 11; break; } pt.appui(1); mode('duel'); B.duels++; break; }
        if (!cible || R.t - R.tCible > 1.2) { const c = choisirCible(s); R.cible = c ? c.i : null; R.tCible = R.t; if (!c) { stop(); break; } }
        const g = G.find(q => q.i === R.cible); if (!g) { R.cible = null; break; }
        if (g.etat === 'roule' || g.etat === 'ramasse') {
          // la boule : on la guette dans l'ombre, et on la cueille au passage
          R.tMode = R.t; stop();
          if (P.aPortee === g.i && P.etat === 'libre') { R.typeCible = 'boule'; B.ouvertures++; pt.appui(1); mode('frappe'); }
          break;
        }
        const dx = P.x - g.x, dy = P.y - g.y, d = hyp(dx, dy), bord = d - g.r, cote = ang(Math.atan2(dy, dx) - g.reg);
        const enVue = pt.vue(P.x, P.y, g.x, g.y);
        if (bord < 2.6 && !enVue) { R.sansVue = (R.sansVue || 0) + dtR; if (R.sansVue > 2.5) { R.sansVue = 0; R.tour = ((R.tour || 0) + 1) % 5; } } else if (enVue) R.sansVue = 0;
        const decal = [0, 1.3, -1.3, 2.1, -2.1][R.tour || 0];      // un obstacle entre eux (une dalle plantée) : il essaie par un autre côté
        if (bord < 1.9 && Math.abs(cote) > 1.0 && enVue) {
          // l'ouverture : assommer le javelot (puis la série de dague), l'embuscade pour les autres
          R.typeCible = g.type; B.ouvertures++;
          if (g.type === 'dalle' && g.colle >= 0 && !o.maladroit) { pt.appui(2); R.cible = g.colle; R.typeCible = 'javelot'; R.tCible = R.t + 3; mode('frappe'); break; }   // le garde collé : on l'assomme, et on finit son javelot
          if (g.type === 'javelot' && g.hp > REG.embuscade.dmg && !o.maladroit) pt.appui(2); else pt.appui(1);
          mode('frappe'); break;
        }
        // le contourner : jamais devant ses yeux
        if (Math.abs(cote) < 1.35) { const sg = cote >= 0 ? 1 : -1, a = g.reg + sg * 2.0; versPoint(P, g.x + Math.cos(a) * 3.3, g.y + Math.sin(a) * 3.3, G, true); }
        else { const a = g.reg + Math.PI + decal; versPoint(P, g.x + Math.cos(a) * (g.r + 0.9), g.y + Math.sin(a) * (g.r + 0.9), G, true); }
        break;
      }
      case 'frappe': {
        const dT = R.t - R.tMode;
        const g = cible && cible.hp > 0 && !cible.fantome ? cible : null;
        const seul = G.length === 1 && g && (g.type === 'chien' || g.type === 'javelot' || g.type === 'mortier');
        const derriere = g && Math.abs(ang(Math.atan2(P.y - g.y, P.x - g.x) - g.fa)) > 1.9 && (g.type === 'belier' || g.type === 'colosse');
        const malEnPoint = !o.maladroit && P.hp <= 35 && P.bandages > 0 && !(g && g.sonne > 0.3);      // il compte sa vie : il file se soigner
        const continuer = g && !g.armure && !malEnPoint && (g.sonne > 0.15 || dT < (o.maladroit ? 3 : (BUDGET[R.typeCible] || 0.5) * traine) || seul || derriere);
        if (g && continuer) {
          const a = Math.atan2(g.y - P.y, g.x - P.x), bord = hyp(g.x - P.x, g.y - P.y) - g.r;
          if (bord > 1.2) { cmd(a); if (bord > 2.4 && bord < 4 && P.sautCD <= 0 && !o.sansSaut && g.type === 'javelot') pt.appui(3); } else cmd(a, 0.25);
          pt.tenir(1, true);
        } else {
          pt.tenir(1, false);
          if (G.length === 0) { mode('chasse'); break; }
          if (o.maladroit && P.hp > 40 && G.length <= 3) { mode('duel'); B.duels++; break; }
          mode('fuite'); R.tFuite = R.t; R.cache = null;
        }
        break;
      }
      case 'fuite': {
        pt.tenir(1, false);
        if (s.nVoient === 0 && !P.ombre && P.ombreCD <= 0) { pt.appui(4); }
        if (P.ombre) { B.fuites.push(+(R.t - R.tFuite).toFixed(1)); mode('chasse'); R.cible = null; break; }
        if (!R.cache || R.t - R.tCache > 0.7) { R.cache = choisirCache(s); R.tCache = R.t; }
        if (R.t - R.tFuite > 9 && s.nVoient > 0 && (P.hp > 30 || R.t - R.tFuite > 14)) { mode('duel'); B.duels++; R.force = R.t + 8; break; }      // impossible de les semer : on se bat
        if (!R.cache) { // personne ne peut se cacher : s'éloigner de ceux qui le voient
          const v = G.filter(g => g.voit); if (v.length) { const cx = v.reduce((a, g) => a + g.x, 0) / v.length, cy = v.reduce((a, g) => a + g.y, 0) / v.length; cmd(Math.atan2(P.y - cy, P.x - cx)); } else stop();
          break;
        }
        const a = Math.atan2(R.cache[1] - P.y, R.cache[0] - P.x), dC = hyp(R.cache[0] - P.x, R.cache[1] - P.y);
        if (!o.sansSaut && !o.maladroit && P.sautCD <= 0 && s.nVoient > 0 && P.etat !== 'saut') {
          if (dC > 1.5 && murBasDevant(P, a)) { cmd(a); pt.appui(3); break; }
          const colle = G.some(g => g.voit && g.type === 'chien' && hyp(g.x - P.x, g.y - P.y) < 1.3);
          if (colle) { const [nx, ny] = pt.chemin(P.x, P.y, R.cache[0], R.cache[1]); cmd(Math.atan2(ny - P.y, nx - P.x)); pt.appui(3); break; }
        }
        if (dC < 0.35) stop(); else versPoint(P, R.cache[0], R.cache[1], G, false);
        break;
      }
      case 'duel': {
        // à découvert, la dague au poing (ce que fait un joueur qui ne se cache pas)
        if (P.hp < 30 && !o.maladroit && !(R.force > R.t) && !furieux) { pt.tenir(1, false); mode('fuite'); R.tFuite = R.t; R.cache = null; break; }
        let g = furieux || null, bd = 1e9; if (!g) for (const q of touchables) { const d = hyp(q.x - P.x, q.y - P.y) + (q.armure ? 30 : 0) + (q.couvert ? 20 : 0); if (d < bd) { bd = d; g = q; } }
        if (!g) { pt.tenir(1, false); stop(); break; }                       // (un fantôme rôde : on l'attend)
        if (g.armure && !o.maladroit) { pt.tenir(1, false); mode('fuite'); R.tFuite = R.t; R.cache = null; break; }
        const a = Math.atan2(g.y - P.y, g.x - P.x), bord = hyp(g.x - P.x, g.y - P.y) - g.r;
        if (bord > 1.2) { const [nx, ny] = pt.chemin(P.x, P.y, g.x, g.y); cmd(pt.vue(P.x, P.y, g.x, g.y) ? a : Math.atan2(ny - P.y, nx - P.x)); pt.tenir(1, false); } else { cmd(a, 0.25); pt.tenir(1, true); }
        if (R.t - R.tMode > 6 && !o.maladroit && G.length > 1 && !furieux && !fantomes.length) { pt.tenir(1, false); mode('fuite'); R.tFuite = R.t; R.cache = null; }
        break;
      }
    }
  }
  return { pas, reset, bilan: () => B, etat: () => R };
};
window.__sim = function (o) {
  o = o || {}; const pt = __pt, dt = 1 / 60;
  pt.figer(true); pt.demarrer(o.vague || 0); if (o.invincible) pt.invincible(true);
  if (o.vie != null) pt.ev('P.hp=' + o.vie); if (o.bandages != null) pt.ev('P.bandages=' + o.bandages);
  const rb = __robot5(o), max = o.secondes || 1800, parVague = [];
  let t = 0, n = 0, v0 = pt.etat().vague, tv = 0, fin = 'temps', recusAv = 0;
  while (t < max) {
    if (n % 3 === 0) rb.pas(dt * 3);
    const e = pt.pas(1, dt); t += dt; n++;
    if (e === 'aterre') { fin = 'à terre'; break; }
    if (e === 'gagne') { fin = 'gagné'; break; }
    if (n % 30 === 0) { const s = pt.etat(); if (s.vague !== v0) { parVague.push({ vague: v0 + 1, s: Math.round(t - tv), perdus: Math.round(s.stats.recus - recusAv), vie: s.stats.vieFin[s.stats.vieFin.length - 1], bandages: s.P.bandages }); recusAv = s.stats.recus; v0 = s.vague; tv = t; if (o.uneVague) { fin = 'vague finie'; break; } } }
  }
  const s = pt.etat(), st = s.stats, b = rb.bilan();
  if (fin !== 'temps' && fin !== 'vague finie') parVague.push({ vague: v0 + 1, s: Math.round(t - tv), perdus: Math.round(st.recus - recusAv), vie: Math.ceil(s.P.hp), bandages: s.P.bandages });
  const med = a => { if (!a.length) return null; const c = a.slice().sort((x, y) => x - y); return c[Math.floor(c.length / 2)]; };
  return { fin, duree: Math.round(t), min: +(t / 60).toFixed(1), vagueAtteinte: s.vague + 1, vieFin: Math.ceil(s.P.hp), bandagesRestants: s.P.bandages, parVague,
    partDansLOmbre: +(st.tOmbre / t).toFixed(2), partVu: +(st.tVu / t).toFixed(2), tempsPourDisparaitre: { mediane: med(b.fuites), pire: b.fuites.length ? Math.max(...b.fuites) : null, n: b.fuites.length },
    blocs: b.blocs, robot: { ouvertures: b.ouvertures, duels: b.duels, bloque: b.bloque, esquivesAuSaut: b.esquivesAuSaut, tModes: Object.fromEntries(Object.entries(b.tModes).map(([k, v]) => [k, Math.round(v)])) },
    stats: Object.fromEntries(Object.entries(st).map(([k, v]) => [k, typeof v === 'number' ? Math.round(v) : v])), resteVivants: s.G.map(g => g.type + ':' + g.hp),
    bloqueA: fin === 'temps' ? { robot: rb.etat(), P: s.P, phase: s.phase, G: s.G.map(g => ({ t: g.type, x: +g.x.toFixed(1), y: +g.y.toFixed(1), hp: g.hp, etat: g.etat, mode: g.mode, voit: g.voit, fa: +g.fa.toFixed(2), reg: +g.reg.toFixed(2), sonne: g.sonne, su: [+g.su.x.toFixed(1), +g.su.y.toFixed(1)] })) } : null };
};
0; // (pour que Playwright ne prenne pas ce fichier pour une fonction à lancer)
// La même partie, par petits bouts : entre deux bouts, la page dessine pour de vrai (partie-vue.py prend des captures).
window.__simDebut = function (o) { o = o || {}; __pt.figer(true); __pt.demarrer(o.vague || 0); if (o.invincible) __pt.invincible(true); window.__sv = { rb: __robot5(o), n: 0, t: 0, chutes: 0, o }; return true; };
window.__simSuite = function (sec) {
  const V = window.__sv, dt = 1 / 60, N = Math.round(sec / dt); let e = 'jeu';
  for (let i = 0; i < N; i++) { if (V.n % 3 === 0) V.rb.pas(dt * 3); e = __pt.pas(1, dt); V.t += dt; V.n++; if (e === 'aterre') { V.chutes++; V.rb.reset(); __pt.demarrer(0); if (V.o.invincible) __pt.invincible(true); } if (e === 'gagne') break; }
  __pt.ev('majRecharges()');
  const s = __pt.etat(); return { e, t: Math.round(V.t), vague: s.vague + 1, chutes: V.chutes, hp: s.P.hp, bandages: s.P.bandages, ombre: s.P.ombre, etatP: s.P.etat, mode: V.rb.etat().mode, G: s.G.map(g => g.type + ':' + g.etat), zones: s.G.filter(g => g.zone).map(g => g.type + '/' + g.zone.k), obus: s.obus.length };
};
0;
