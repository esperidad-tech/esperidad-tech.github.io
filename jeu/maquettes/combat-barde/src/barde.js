// ===== LE BARDE, DE DOS, EN VOLUME (version 9 — Romain, 24 nov., 21 h : « tu prends le barde de dos avec la fausse 3D qu'on a fait ;
// tu lui mets sa guitare ; acte 1, il a une sorte de clavier dans le dos, il s'en sert pas ; à partir de l'acte 3, il prend le synthé ;
// un peu plus grand » ; 21 h 21 : « son petit chapeau avec une plume, tu le mettras aussi pour sa tenue de combat ») =====
// Le héros est celui du jeu (le moteur des héros en volume, src/heros-vues.js), en tenue de combat, vu de dos. Son dessin coûte cher :
// comme l'Alchimiste de son combat, chaque image de chaque geste est dessinée UNE fois, en arrière-plan, puis recopiée.
// Par-dessus et par-dessous, dessinés ici : l'instrument qu'il joue (devant lui : on en voit le manche et le bout), celui qu'il porte
// dans le dos, sa sangle, et son chapeau à plume. Ils suivent ses os (HV.os : la tête, le bassin, les épaules, le poignet).
const Barde = (() => {
  const { toile, lin, rad, poly, trait, ell, sprite } = Ou;
  const HV = window.HerosVues;
  const CADRE = [30, -30, 240, 460], HAUT = 118, ECH = HAUT / 380;      // le cadre de l'image du héros (ses mesures à lui) ; sa taille dans le jeu
  const HEROS = { role: 'barde', sexe: 'm', peau: 'p2', cheveux: 'chatain', yeux: 'bleu', coiffure: 'courts', combat: true };
  // (x > 0 : vers SA gauche ; y vers le bas ; z vers l'avant. mainD : SON bras gauche, sur le manche ; mainG : SON bras droit, qui gratte)
  const JOUE = { mainD: [90, 186, 30], coudeD: [0.7, 0.6, -0.3], poingD: 0.8, mainG: [8, 232, 46], coudeG: [-1, 0.1, -0.4], poingG: 0.5, piedG: [-23, 386, 2], piedD: [23, 386, -2], hoche: 4 };
  // IL BOUGE EN RYTHME (Romain, 24 nov., 22 h 25 : « le barde, il pourrait taper du pied en rythme et bouger la tête en rythme […] quand
  // il y a un refrain, tu accentues le mouvement […] le barde pourrait même faire une petite danse, mais toujours en rythme »).
  // Ces deux boucles ne suivent pas l'horloge mais LE TEMPS DE LA MUSIQUE : l'image choisie dépend d'où on en est dans le temps.
  const battue = ph => Math.pow(Math.max(0, 1 - ph / 0.35), 2);   // 1 pile sur le temps, 0 un tiers de temps plus tard
  // il bat la mesure (un temps) : la tête hoche, les genoux plient un peu, la pointe de SON pied droit se lève et retombe sur le temps
  const TEMPO = ph => { const p = battue(ph), l = ph > 0.5 ? Math.sin((ph - 0.5) * 2 * Math.PI) : 0; return { hoche: 4 + 10 * p, bas: [0, 4.5 * p, 0], pointeG: -26 * l, dos: [2 * p, 0, 0] }; };
  // sa petite danse du refrain (deux temps) : les hanches passent d'un côté à l'autre, les épaules à l'inverse, la tête penche, le pied
  // libre se lève et retombe pile sur le temps, le manche se lève à chaque temps
  const DANSE = u => { const p = battue(u % 1), c = Math.cos(Math.PI * u), lg = Math.max(0, c) * (1 - p) * 15, ld = Math.max(0, -c) * (1 - p) * 15;
    return { bas: [9 * c, 7 * p, 0], bang: [0, 5 * c, 0], dos: [3 * p, -6 * c, 11 * c], hoche: 4 + 12 * p, pen: 7 * c, piedG: [-23, 386 - lg, 2], pointeG: lg * 1.6, piedD: [23, 386 - ld, -2], pointeD: ld * 1.6, mainD: [90, 186 - 12 * p, 30] }; };
  // LA DANSE FOLLE, aux refrains du dernier acte et à la fête de la fin (Romain, 24 nov., 23 h 23 : « une danse complètement folle, une
  // danse de techno où il balance sa tête de droite à gauche […] il baisse la tête et il lève la main, et il joue de la main au rythme
  // […] c'est pas juste un petit déhanché, ils sont à fond »). Sur deux temps : la tête baissée qui part d'un côté puis de l'autre, le
  // poing droit levé bien haut qui pompe à chaque temps, les genoux qui plient fort, les hanches et les épaules qui se tordent, les
  // pieds qui tapent l'un après l'autre. Sa main gauche garde le manche.
  const FOLIE = u => { const p = battue(u % 1), c = Math.cos(Math.PI * u), lg = Math.max(0, c) * (1 - p) * 24, ld = Math.max(0, -c) * (1 - p) * 24;
    return { bas: [13 * c, 13 * p, 0], bang: [4, 8 * c, 0], dos: [12 + 8 * p, -9 * c, 18 * c], hoche: 16 + 12 * p, pen: 24 * c, tete: 34 * c,
      piedG: [-25, 386 - lg, 2], pointeG: lg * 1.5, piedD: [25, 386 - ld, -2], pointeD: ld * 1.5, mainD: [90, 182 - 16 * p, 30],
      mainG: [-50 + 10 * c, 74 - 50 * p, 8], coudeG: [-1, 0.2, -0.2], poingG: 1, mdirG: [0, -1, 0], brasDessus: 1 }; };
  const GESTES = {
    base: { cles: null },
    tempo: { boucle: 1, n: 6, f: TEMPO },
    danse: { boucle: 2, n: 12, f: DANSE },
    folie: { boucle: 2, n: 16, f: FOLIE },
    gratte: { fps: 16, cles: [[0.06, { mainG: [14, 248, 46], dos: [3, 0, -7], hoche: 9 }], [0.17, { mainG: [-6, 218, 46], dos: [0, 0, 5] }], [0.3, {}]] },                                    // Note : un coup de médiator
    repousse: { fps: 16, cles: [[0.09, { mainD: [86, 140, 26], mainG: [-40, 184, 40], dos: [-7, 0, 0], hoche: -9 }], [0.2, { mainD: [90, 176, 30], mainG: [16, 252, 46], dos: [9, 0, 0], hoche: 11 }], [0.44, {}]] },   // Repousse : le manche levé, le grand accord
    stop: { fps: 14, cles: [[0.1, { mainG: [-46, 64, 4], coudeG: [-1, 0, -0.2], poingG: 0, mdirG: [0, -1, 0], hoche: -7 }], [0.36, { mainG: [-46, 60, 4], coudeG: [-1, 0, -0.2], poingG: 0, mdirG: [0, -1, 0], hoche: -7 }], [0.54, {}]] },   // Stop : la main levée, le point d'orgue
    vague: { fps: 16, cles: [[0.1, { mainG: [-94, 168, 8], coudeG: [-1, 0, -0.5], poingG: 0, dos: [0, 0, -20], tete: -14 }], [0.26, { mainG: [-58, 200, 58], poingG: 0, dos: [0, 0, 12] }], [0.44, {}]] },         // Vague : le bras balaie
    coup: { fps: 12, cles: 'coup', vit: 1.5 },                                                                                                                                                 // il prend un coup (le geste du donjon)
  };
  let k = 0, version = 0, enCours = false, num = 0, base = null, geste = null, t0 = 0, S = null, planche = null, places = 0;   // (toutes ses images dans UNE seule grande toile : Safari supporte mal des dizaines de toiles séparées)
  const file = []; let calme = true;

  // une pose complète, vue de dos
  function pose(P) { const F = HV.melange({}, HV.pose('repos'), 1); for (const c in P) F[c] = P[c]; F.cap = 180; F.qx = 0; F.qz = 0; F.jx = 0; F.rx = 0; F.ry = 0; F.yo = 1; F.souffle = 0.5; F.anneau = 0; F.anneauT = 0; return F; }
  function preparer() {
    base = pose(JOUE);
    for (const nom in GESTES) {
      const G1 = GESTES[nom]; G1.img = []; G1.os = [];
      if (G1.boucle) { G1.pose = i => pose({ ...JOUE, ...G1.f(i / G1.n * G1.boucle) }); continue; }
      if (!G1.cles) { G1.n = 1; G1.pose = () => base; continue; }
      const cles = G1.cles === 'coup' ? HV.DONJON.coup : G1.cles, vit = G1.vit || 1, fin = cles[cles.length - 1][0];
      G1.n = Math.max(1, Math.ceil(fin / vit * G1.fps)); G1.pose = i => pose(HV.gesteImage(base, cles, Math.min(fin, (i + 0.5) / G1.fps * vit)));
    }
  }
  // cuire les images, une par une, sans bloquer le jeu
  function cuire() {
    if (enCours || !file.length) return;
    const [nom, i] = file.shift(), G1 = GESTES[nom], w = Math.round(CADRE[2] * k), h = Math.round(CADRE[3] * k), ver = version;
    let P, svg; try { P = G1.pose(i); svg = HV.svg(HEROS, P, { id: 'bd' + (++num), cadre: CADRE.join(' ') }); } catch (e) { if (window.console) console.error('Barde en volume', e); return void setTimeout(cuire, 30); }
    const im = new Image(); enCours = true;
    // (l'image SVG est lâchée tout de suite : Safari garde longtemps en mémoire une image qu'on ne vide pas — la leçon du donjon, 24 nov., 21 h 58)
    const fini = () => { enCours = false; im.onload = im.onerror = null; try { im.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; } catch (e) {} setTimeout(cuire, calme ? 12 : ['base', 'tempo', 'gratte', 'repousse'].includes(nom) ? 120 : 450); };   // (pendant le combat, on cuit doucement : une image de temps en temps, pour ne pas faire saccader le jeu)
    im.onload = () => { if (ver === version) { try { const n = places++, c = { sx: (n % 10) * w, sy: Math.floor(n / 10) * h }; planche.getContext('2d').drawImage(im, c.sx, c.sy, w, h); const o = HV.os(HEROS, P); G1.img[i] = c; G1.os[i] = { t: o.tete, b: o.bassin, e: [(o.epauleG[0] + o.epauleD[0]) / 2, (o.epauleG[1] + o.epauleD[1]) / 2], m: o.poignetD, pen: P.pen || 0 }; } catch (e) { if (window.console) console.error('Barde en volume', e); } } fini(); };
    im.onerror = fini;
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="' + w + '" height="' + h + '" '));
  }
  // K0 : la finesse de l'écran. On ne recuit que si l'écran devient nettement plus fin (jamais pendant une baisse de qualité).
  function construire(K0) {
    if (!HV || !HV.svg) return;
    const k2 = Math.min(2.2, Math.max(1, K0)) * ECH * 1.15;
    if (k && k2 < k * 1.3) return;
    k = k2; version++; file.length = 0; if (!base) preparer();
    for (const nom of ['base', 'tempo', 'gratte', 'repousse', 'danse', 'vague', 'stop', 'coup', 'folie']) { GESTES[nom].img = []; GESTES[nom].os = []; for (let i = 0; i < GESTES[nom].n; i++) file.push([nom, i]); }
    let total = 0; for (const nom in GESTES) total += GESTES[nom].n;
    if (planche) planche.width = planche.height = 0; planche = toile(10 * Math.round(CADRE[2] * k), Math.ceil(total / 10) * Math.round(CADRE[3] * k)); places = 0;
    S = accessoires(Math.min(2.2, Math.max(1, K0)) * ECH * 1.15); cuire();
  }

  // ---------- ses affaires, dessinées une fois (dans ses mesures à lui) ----------
  const BOIS = ['#d9a25c', '#9a6430', '#4f2e14'], BRONZE = ['#b3925c', '#5d4831', '#1f1711'], OR = '#f4d27c', NOIR = '#0a0806';
  function accessoires(kk) {
    const A = {};
    // LE LUTH, VU DE DERRIÈRE (quand il en joue, dos à nous) : la caisse ronde à côtes de bois, le manche vers la droite du dessin
    A.luthDos = sprite(190, 80, 52, 40, kk, x => {
      x.fillStyle = lin(x, 30, -6, 122, 6, [BOIS[2], '#2c1a0c']); x.fillRect(30, -5.5, 92, 11); x.strokeStyle = NOIR; x.lineWidth = 1.6; x.strokeRect(30, -5.5, 92, 11);
      poly(x, [[120, -7], [134, -13], [137, -3], [122, 7]]); x.fillStyle = BOIS[2]; x.fill(); x.stroke(); for (let i = 0; i < 3; i++) { ell(x, 124 + i * 4.5, -11 + i * 0.6, 2, 2, OR); ell(x, 125 + i * 4.5, 8 - i * 1.2, 2, 2, OR); }
      x.beginPath(); x.moveTo(40, 0); x.bezierCurveTo(30, -34, -44, -40, -46, 0); x.bezierCurveTo(-44, 40, 30, 34, 40, 0); x.closePath(); x.fillStyle = rad(x, -14, -10, 4, 52, BOIS); x.fill(); x.save(); x.clip();
      x.strokeStyle = 'rgba(40,20,6,.55)'; x.lineWidth = 1.2; for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(40, 0); x.quadraticCurveTo(-4, i * 13, -46, i * 3); x.stroke(); } x.strokeStyle = 'rgba(255,236,190,.55)'; x.lineWidth = 3; x.beginPath(); x.moveTo(38, -3); x.bezierCurveTo(29, -32, -40, -37, -43, -3); x.stroke(); x.restore(); x.strokeStyle = NOIR; x.lineWidth = 1.8; x.stroke();
    });
    // LE LUTH, VU DE FACE (quand il le porte dans le dos) : la table claire, la rosace, les cordes
    A.luthFace = sprite(190, 80, 52, 40, kk, x => {
      x.fillStyle = lin(x, 30, -6, 122, 6, ['#5a3a1c', '#2c1a0c']); x.fillRect(30, -5.5, 92, 11); x.strokeStyle = NOIR; x.lineWidth = 1.6; x.strokeRect(30, -5.5, 92, 11);
      x.strokeStyle = 'rgba(244,210,124,.7)'; x.lineWidth = 0.9; for (let i = 0; i < 7; i++) { trait(x, [[44 + i * 11, -5], [44 + i * 11, 5]]); x.stroke(); }
      poly(x, [[120, -7], [134, -13], [137, -3], [122, 7]]); x.fillStyle = BOIS[2]; x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.6; x.stroke(); for (let i = 0; i < 3; i++) { ell(x, 124 + i * 4.5, -11 + i * 0.6, 2, 2, OR); ell(x, 125 + i * 4.5, 8 - i * 1.2, 2, 2, OR); }
      x.beginPath(); x.moveTo(40, 0); x.bezierCurveTo(30, -34, -44, -40, -46, 0); x.bezierCurveTo(-44, 40, 30, 34, 40, 0); x.closePath(); x.fillStyle = rad(x, -10, -8, 4, 54, ['#fbe6b4', '#e7bd76', '#b9843e']); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.8; x.stroke();
      x.strokeStyle = BOIS[1]; x.lineWidth = 2.4; x.beginPath(); x.moveTo(38, 0); x.bezierCurveTo(29, -31, -41, -37, -43, 0); x.bezierCurveTo(-41, 37, 29, 31, 38, 0); x.stroke();
      ell(x, 2, 0, 10, 10, '#2c1a0c'); x.strokeStyle = OR; x.lineWidth = 1.4; x.stroke(); ell(x, 2, 0, 6, 6); x.stroke(); x.fillStyle = BOIS[2]; x.fillRect(-30, -9, 4, 18);
      x.strokeStyle = 'rgba(255,250,230,.85)'; x.lineWidth = 0.7; for (let i = -2; i <= 2; i++) { trait(x, [[-28, i * 3.2], [122, i * 1.8]]); x.stroke(); }
    });
    // LE SYNTHÉ, VU DE FACE (dans le dos, aux actes I et II) : un clavier de bronze, ses touches, ses cristaux de lumière
    const corps = (x, face) => {
      const c = [[-72, -15], [58, -17], [70, -8], [70, 12], [-60, 17], [-74, 6]];
      poly(x, c); x.fillStyle = lin(x, 0, -17, 0, 17, face ? ['#31506a', '#1b3045', '#0d1a28'] : ['#6d5638', '#3a2c1f', '#1b130d']); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.8; x.lineJoin = 'round'; x.stroke();
      x.strokeStyle = OR; x.globalAlpha = 0.8; x.lineWidth = 1; trait(x, [[-70, -13], [57, -15]]); x.stroke(); trait(x, [[-58, 15], [68, 10]]); x.stroke(); x.globalAlpha = 1;
      x.fillStyle = lin(x, 70, -5, 112, 5, face ? ['#3a2c1f', '#1f1711'] : ['#241a12', '#120c08']); x.fillRect(68, -5, 44, 10); x.strokeStyle = NOIR; x.lineWidth = 1.5; x.strokeRect(68, -5, 44, 10); poly(x, [[112, -7], [121, -4], [121, 4], [112, 7]]); x.fillStyle = BRONZE[1]; x.fill(); x.stroke();
    };
    A.synthFace = sprite(214, 60, 84, 30, kk, x => {
      corps(x, true);
      x.fillStyle = '#f7f1e2'; x.fillRect(-58, -6, 112, 17); x.strokeStyle = NOIR; x.lineWidth = 1; x.strokeRect(-58, -6, 112, 17);
      x.strokeStyle = 'rgba(20,14,8,.7)'; x.lineWidth = 0.8; for (let i = 1; i < 14; i++) { trait(x, [[-58 + i * 8, -6], [-58 + i * 8, 11]]); x.stroke(); }
      x.fillStyle = '#17110c'; for (let i = 0; i < 13; i++) if (![2, 6, 9].includes(i)) x.fillRect(-58 + i * 8 + 5.4, -6, 5.2, 10);
      for (let i = 0; i < 4; i++) { x.shadowColor = 'rgba(150,245,255,1)'; x.shadowBlur = 5; ell(x, -50 + i * 9, -11, 2.2, 2.2, '#c9fbff'); } x.shadowBlur = 0;
      for (let i = 0; i < 3; i++) { ell(x, 26 + i * 9, -11, 2.6, 2.6, BRONZE[0]); x.strokeStyle = NOIR; x.lineWidth = 0.8; x.stroke(); ell(x, 78 + i * 10, 0, 2.4, 2.4, i === 1 ? '#ff6a4a' : OR); }
    });
    // LE SYNTHÉ, VU DE DERRIÈRE (quand il en joue) : son dos de bois sombre, et la lumière des touches qui déborde
    A.synthDos = sprite(214, 60, 84, 30, kk, x => {
      x.shadowColor = 'rgba(150,245,255,1)'; x.shadowBlur = 9; x.strokeStyle = 'rgba(170,245,255,.9)'; x.lineWidth = 2.4; trait(x, [[-70, -15], [57, -17]]); x.stroke(); trait(x, [[-58, 16], [68, 11]]); x.stroke(); x.shadowBlur = 0;
      corps(x, false); x.shadowColor = 'rgba(150,245,255,1)'; x.shadowBlur = 6; for (const q of [[80, 0], [92, 0], [104, 0]]) ell(x, q[0], q[1], 2.6, 2.6, '#c9fbff'); x.shadowBlur = 0; for (const q of [[-56, 0], [-20, -1], [18, -2], [52, -3]]) { ell(x, q[0], q[1], 2.2, 2.2, BRONZE[0]); }
      x.strokeStyle = 'rgba(244,210,124,.45)'; x.lineWidth = 0.9; trait(x, [[-40, 6], [-28, -6], [-16, 6], [-4, -6], [8, 6], [20, -6], [32, 6]]); x.stroke();
    });
    // SON CHAPEAU À PLUME, vu de derrière : un bord large, une calotte ronde, un galon d'or, une grande plume blanche
    A.chapeau = sprite(130, 120, 62, 96, kk, x => {
      x.save(); x.rotate(-0.06);
      ell(x, 0, 2, 45, 11, '#3d1226'); x.strokeStyle = NOIR; x.lineWidth = 1.8; x.stroke();
      x.beginPath(); x.moveTo(-29, 0); x.bezierCurveTo(-33, -40, 30, -44, 29, -1); x.closePath(); x.fillStyle = rad(x, -8, -24, 3, 44, ['#b8325a', '#7a2040', '#431024']); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(-29, 0); x.quadraticCurveTo(0, 9, 29, -1); x.lineTo(28, -7); x.quadraticCurveTo(0, 2, -29.5, -6); x.closePath(); x.fillStyle = lin(x, 0, -7, 0, 6, [OR, '#b88a2e']); x.fill(); x.lineWidth = 1.1; x.stroke();
      ell(x, 0, 3, 45, 11); x.fillStyle = lin(x, -45, 0, 45, 0, ['#5a1a36', '#8a2648', '#4a142c']); x.save(); x.beginPath(); x.ellipse(0, 3, 45, 11, 0, 0, Math.PI); x.closePath(); x.fill(); x.restore();
      x.strokeStyle = NOIR; x.lineWidth = 1.6; x.beginPath(); x.ellipse(0, 3, 45, 11, 0, 0, Math.PI); x.stroke();
      // la plume : elle part du galon, monte et retombe vers l'arrière
      x.translate(20, -6); x.rotate(-0.25);
      x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(10, -40, 34, -70, 44, -58); x.bezierCurveTo(40, -40, 22, -14, 0, 0); x.closePath(); x.fillStyle = lin(x, 0, 0, 44, -60, ['#fffdf4', '#f1ead6', '#ffe9a8']); x.fill(); x.strokeStyle = 'rgba(60,40,20,.75)'; x.lineWidth = 1.2; x.stroke();
      x.strokeStyle = 'rgba(150,120,70,.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(16, -40, 42, -58); x.stroke();
      x.strokeStyle = 'rgba(150,120,70,.45)'; x.lineWidth = 0.7; for (let i = 1; i < 8; i++) { const u = i / 8, px = u * u * 42 + 2 * u * (1 - u) * 16, py = u * u * -58 + 2 * u * (1 - u) * -40; trait(x, [[px, py], [px + 6 - u * 2, py + 7]]); x.stroke(); trait(x, [[px, py], [px - 5, py - 5 + u * 2]]); x.stroke(); }
      x.restore();
    });
    // la sangle, en travers du dos
    A.sangle = sprite(110, 130, 55, 65, kk, x => { x.strokeStyle = NOIR; x.lineWidth = 8; x.lineCap = 'round'; trait(x, [[36, -52], [-34, 46]]); x.stroke(); x.strokeStyle = '#6b4526'; x.lineWidth = 5.4; x.stroke(); x.strokeStyle = 'rgba(244,210,124,.55)'; x.lineWidth = 0.8; x.setLineDash([3, 3]); x.stroke(); x.setLineDash([]); ell(x, 14, -22, 4.4, 4.4, OR); x.strokeStyle = NOIR; x.lineWidth = 1; x.stroke(); });
    return A;
  }
  const pose2 = (g, s, x, y, ang, e) => { g.save(); g.translate(x, y); g.rotate(ang); g.drawImage(s.c, -s.ox * e, -s.oy * e, s.w * e, s.h * e); g.restore(); };

  function jouer(nom, now) { const G1 = GESTES[nom]; if (!G1 || !G1.img || !G1.img.length) return; if (geste === 'coup' && nom !== 'coup' && now - t0 < 0.3) return; geste = nom; t0 = now; }
  // LE DESSINER : (x, y) ses pieds ; sc sa taille ; E : { synthe (il joue du synthé), pul (le battement, 0 à 1) }
  function dessiner(g, x, y, sc, now, E) {
    if (!S) return false;
    let G1 = GESTES.base, i = 0;
    if (geste && geste !== 'coup' && (E.danse || E.folie) && !E.fixe) geste = null;   // au refrain, il danse : ses boutons ne coupent pas la danse
    if (geste) { const G2 = GESTES[geste], j = Math.floor((now - t0) * G2.fps); if (j >= 0 && j < G2.n && G2.img[j]) { G1 = G2; i = j; } else if (j >= G2.n || j < 0) geste = null; }
    let boucle = false;
    if (G1 === GESTES.base && !E.fixe && E.phase != null) {   // pas de geste en cours : il bat la mesure, ou il danse (au refrain)
      const deux = E.danse || E.folie, B = E.folie && GESTES.folie.img[0] ? GESTES.folie : E.danse ? GESTES.danse : GESTES.tempo, j = Math.floor((deux ? (((E.n || 0) % 2) + E.phase) / 2 : E.phase) * B.n) % B.n;
      if (B.img[j]) { G1 = B; i = j; boucle = true; }
    }
    const im = G1.img[i] || GESTES.base.img[0], o = G1.img[i] ? G1.os[i] : GESTES.base.os[0];
    if (!im) return false;
    const e = ECH * sc, by = y - (414 + (boucle ? 0 : (E.pul || 0) * 3)) * e, px = v => x - v[0] * e, py = v => by + v[1] * e;   // (de dos : sa gauche est à notre gauche)
    const ventre = [px(o.b) - (E.synthe ? 26 : 30) * e, py(o.b) - 26 * e], main = [px(o.m), py(o.m)], aj = Math.atan2(main[1] - ventre[1], main[0] - ventre[0]);
    // l'instrument qu'il joue : devant lui (donc dessiné AVANT lui) ; le manche passe dans sa main gauche
    const joue = E.synthe ? S.synthDos : S.luthDos, ej = e * (E.synthe ? 1.05 : 0.9), dj = 0;
    g.save(); g.translate(ventre[0] - Math.cos(aj) * dj * e, ventre[1] - Math.sin(aj) * dj * e); g.rotate(aj); g.scale(1, -1); g.drawImage(joue.c, -joue.ox * ej, -joue.oy * ej, joue.w * ej, joue.h * ej); g.restore();
    g.drawImage(planche, im.sx, im.sy, Math.round(CADRE[2] * k), Math.round(CADRE[3] * k), x + (CADRE[0] - 150) * e, by + CADRE[1] * e, CADRE[2] * e, CADRE[3] * e);
    // dans son dos : la sangle, et l'autre instrument (le clavier aux actes I et II, puis le luth), le manche vers SON épaule droite
    const dos = [(px(o.b) + px(o.e)) / 2, (py(o.b) + py(o.e)) / 2 + 4 * e], penche = Math.atan2(px(o.e) - px(o.b), py(o.b) - py(o.e));
    pose2(g, S.sangle, dos[0], dos[1], penche, e);
    const porte = E.synthe ? S.luthFace : S.synthFace; pose2(g, porte, dos[0] + (E.synthe ? -8 : 2) * e, dos[1] + (E.synthe ? 12 : 2) * e, penche - (E.synthe ? 1.02 : 0.98), e * (E.synthe ? 0.82 : 0.8));
    // son chapeau à plume
    pose2(g, S.chapeau, px(o.t), py(o.t) - 58 * e, -o.pen * Math.PI / 180, e * 0.92);
    return true;
  }
  return { construire, jouer, dessiner, HAUT, set calme(v) { calme = !!v; }, get pret() { return !!(GESTES.base.img && GESTES.base.img[0]); }, get reste() { return file.length; } };
})();
