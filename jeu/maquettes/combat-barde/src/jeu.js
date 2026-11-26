// ===== LE JEU : le combat du Barde contre Grosbec (version 5 : un style de musique et des sons par acte) =====
{
const $ = id => document.getElementById(id);
const D = Dessin, I = Son.I, TAU = Math.PI * 2;
const cadre = $('cadre'), cv = $('c'), g = cv.getContext('2d');
let W = 420, H = 800, S = 1, DPR = 1, L = {}, fondC = null, ac = null;

const R = {
  PARFAIT: 0.08, BIEN: 0.18, S_PARFAIT: 0.08, S_BIEN: 0.17,   // version 2.1 : plus de marge (Romain, 24 nov. 13 h 36)
  COEURS: 6, PAS: 38, APP: 1.5, CONTACT: 64, R_REPOUSSE: 145, R_VAGUE: 175,
  RECHARGE: { note: 1, repousse: 4, stop: 4, vague: 2 },
  SEUIL: 0.6, SEUIL_FINAL: 0.65,
};
const TOUS = ['note', 'repousse', 'stop', 'vague'];
const ACTES = [
  { chanson: 0, boutons: ['note', 'repousse'], poids: { trotteur: 5, soldat: 3, bouclier: 2 }, nouveaux: ['bouclier'], groupes: 18, taille: [2, 3], max: 6, plumes: 0 },
  { chanson: 1, boutons: ['note', 'repousse', 'vague'], poids: { trotteur: 4, soldat: 3, bouclier: 2, lanceur: 2 }, nouveaux: ['lanceur'], groupes: 20, taille: [2, 3], max: 7, plumes: 0 },
  { chanson: 2, boutons: TOUS, poids: { trotteur: 3, soldat: 2, bouclier: 2, lanceur: 2, fonceur: 2, danseur: 2 }, nouveaux: ['fonceur', 'danseur'], groupes: 21, taille: [2, 3], max: 7, plumes: 8 },
  { chanson: 3, boutons: TOUS, poids: { trotteur: 4, soldat: 2, bouclier: 2, lanceur: 2, fonceur: 2, danseur: 2, gros: 1 }, nouveaux: ['gros'], groupes: 20, taille: [2, 3], max: 8, plumes: 6 },
];
// la ferveur : chaque Parfait la fait monter ; elle fait entrer les instruments, puis le méga refrain
const FER = { N1: 3, N2: 8, N3: 15, MEGA: 26, APRES: 8 };
const INSTRUMENTS = [
  ['', 'Toute la taverne tape des mains !', 'La contrebasse et l\'accordéon !', 'La flûte à bec !'],
  ['', 'Les tambourins !', 'Le luth d\'Orient !', 'La flûte du désert !'],
  ['', 'Les tambours de guerre !', 'Les cors et la contrebasse !', 'Les violons !'],
  ['', 'Les cymbales !', 'La basse acide !', 'La mélodie !'],
];
const sons = () => Musique.CHANSONS[ACTES[G.acte].chanson].sons; // les sons des boutons changent à chaque acte
const ACTIFS = [[1], [1], [1, 2], [0, 1, 2], [0, 1, 2, 3]];
const NOUVEAU = { vague: 'Nouveau bouton : la Vague ! Elle renvoie à l\'envoyeur tout ce qui vole.', stop: 'Nouveau bouton : Stop ! Il fige un golem net.' }; // les couloirs de chaque étape de la relance
const ROMAIN = ['I', 'II', 'III', 'IV'];
const DEG = { trotteur: 1, soldat: 1, bouclier: 1, danseur: 1, lanceur: 1, fonceur: 2, gros: 2 };
const ASTUCE = {
  bouclier: 'Un porte-dalle ! Tes notes rebondissent sur sa dalle. Repousse-le : il la lâchera.',
  lanceur: 'Un frondeur, au fond, hors de portée. Ses éclats de braise ? La Vague les lui renvoie.',
  fonceur: 'Le bélier gratte le sol… il va foncer ! Stop, et il est figé net.',
  danseur: 'Le tourbillon tourne un temps sur deux : ta note passe à côté. Vise l\'autre temps.',
  gros: 'Le colosse ne recule presque pas. Fige-le avant qu\'il cogne.',
};
const COULOIRS = ['#3fbf5f', '#e5484d', '#3b82f6', '#b05cf0'];
const CLAVIER = matchMedia('(hover: hover) and (pointer: fine)').matches;
const MOTIF = [0, 1, 2, 3, 2, 1];
const ACC_SOLO = ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'];
// les phrases du solo : [pas de double-croche, note (ou deux notes), durée] — facile / moyennes / difficile
const PH = {
  Am: [[[[0, 69, 2], [2, 72, 2], [4, 76, 2], [6, 74, 2], [8, 72, 2], [10, 71, 2], [12, 69, 4]]],
       [[[0, 76, 3], [3, 76, 3], [6, 74, 2], [8, 76, 2], [10, 79, 2], [12, 81, 4]],
        [[0, [57, 64], 2], [3, [57, 64], 2], [6, [57, 64], 2], [8, 76, 2], [10, 72, 2], [12, 69, 4]]],
       [[[0, 69, 1], [1, 71, 1], [2, 72, 1], [3, 74, 1], [4, 76, 2], [6, 72, 2], [8, 81, 2], [10, 79, 1], [11, 76, 1], [12, 74, 2], [14, 72, 2]]]],
  G:  [[[[0, 67, 2], [2, 71, 2], [4, 74, 4], [8, 71, 2], [10, 74, 2], [12, 79, 4]]],
       [[[0, 74, 2], [2, 72, 1], [3, 71, 1], [4, 72, 2], [6, 74, 2], [8, 79, 3], [11, 77, 1], [12, 76, 2], [14, 74, 2]],
        [[0, 71, 3], [3, 74, 3], [6, 79, 2], [8, 77, 2], [10, 74, 2], [12, 71, 4]]],
       [[[0, 79, 1], [1, 77, 1], [2, 76, 1], [3, 74, 1], [4, 71, 2], [6, 74, 2], [8, 67, 2], [10, 71, 1], [11, 74, 1], [12, 79, 2], [14, 83, 2]]]],
  F:  [[[[0, 65, 2], [2, 69, 2], [4, 72, 4], [8, 69, 2], [10, 72, 2], [12, 77, 4]]],
       [[[0, 72, 2], [2, 74, 2], [4, 76, 2], [6, 77, 2], [8, 76, 3], [11, 72, 3], [14, 69, 2]],
        [[0, 77, 3], [3, 77, 3], [6, 76, 2], [8, 72, 2], [10, 69, 2], [12, 72, 2], [14, 77, 2]]],
       [[[0, 81, 2], [2, 79, 1], [3, 77, 1], [4, 76, 1], [5, 77, 1], [6, 81, 2], [8, 84, 4], [12, 81, 1], [13, 79, 1], [14, 77, 2]]]],
  E:  [[[[0, 76, 2], [2, 74, 2], [4, 72, 2], [6, 71, 2], [8, 68, 4], [12, 71, 4]]],
       [[[0, 71, 2], [2, 72, 2], [4, 71, 2], [6, 68, 2], [8, 64, 2], [10, 68, 2], [12, 71, 2], [14, 76, 2]],
        [[0, 68, 2], [2, 69, 2], [4, 71, 4], [8, 74, 2], [10, 72, 2], [12, 71, 2], [14, 68, 2]]],
       [[[0, 76, 1], [1, 77, 1], [2, 80, 2], [4, 76, 1], [5, 77, 1], [6, 80, 2], [8, 83, 2], [10, 81, 1], [11, 80, 1], [12, 77, 2], [14, 76, 2]]]],
};
const FINALE = [[0, 71, 2], [2, 74, 2], [4, 76, 2], [6, 80, 2], [8, 83, 8]];
const ETAPES = ['', 'Une seule touche…', 'Deux touches ! Le tambour revient.', 'Trois touches ! Et la basse.', 'Le solo !'];

const G = { robot: null };
function remise() {
  Object.assign(G, {
    etat: 'intro', mode: 'combat', acte: 0, coeurs: R.COEURS, combo: 0, mult: 1,
    sbires: [], proj: [], frappes: [], textes: [], ondes: [], eclats: [], notesVol: [], sols: [], jam: [], jamK: 0, jamFait: false,
    pouss: [], tPorte: [-9, -9], tAnnonce: -9, chocs: [], tGemit: 0, nParle: 0, tGesteG: -9, feteF: 0,
    temps: [], passes: [], beat: null, dejaAgi: -1, recharge: { note: -99, repousse: -99, stop: -99, vague: -99 },
    vague: null, relance: null, relanceIdx: 0, vus: new Set(), neufs: new Set(), boutons: [],
    grosSonneFin: -1, finAstuce: 0, fete: false, tMalTete: 0, ferveur: 0, enMega: false, megaDemande: false, tMega: -9, confettis: [], grosLance: null, tPointe: -9, tFlashCasque: -9, fissures: 0, idS: 0, victoire: false, tChute: 0,
    secoue: 0, tMal: -9, tChante: -9, tRep: -9, tCoeurRouge: -9, tFinEcran: 0, acteDepart: 0,
    st: { notes: 0, parfaits: 0, fausses: 0, meilleur: 0, tues: 0, cales: 0, debut: 0, relances: [], coups: {}, megas: 0 },
  });
}
G.decal = 0;
try { G.decal = +localStorage.getItem('barde-decal') || 0; } catch (e) {}
remise();

// ---------------- la taille ----------------
// La qualité s'adapte toute seule à l'appareil : 3 (tout) → 0 (le plus léger). Elle ne fait que descendre, et on s'en souvient.
const Q = { n: 3, images: 0, t0: 0, calme: 0, bas: 0 };
if ((navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2) Q.n = 1; // un vieil appareil : on part léger
try { // on se souvient du niveau trouvé la dernière fois ; une fois sur quatre, on retente un cran au-dessus (l'appareil était peut-être juste occupé ce jour-là)
  const q0 = localStorage.getItem('barde-qualite');
  if (q0 != null && +q0 >= 0 && +q0 <= 3) { const nb = (+localStorage.getItem('barde-lancers') || 0) + 1; localStorage.setItem('barde-lancers', nb); Q.n = Math.min(Q.n, +q0 + (nb % 4 === 0 ? 1 : 0)); }
} catch (e) {}
if (/[?&]qualite=(\d)/.test(location.search)) { Q.n = Math.min(3, +RegExp.$1); Q.fige = true; } // pour les mesures : une qualité imposée, qui ne bouge plus
const FINESSE = [[1, 0.82], [1.2, 1], [1.5, 1], [2, 1]]; // par qualité : la finesse d'écran utilisée au plus, puis un coefficient
const PLAFOND = [1.3, 1.7, 2.2, 3]; // par qualité : jamais plus de points dessinés que ça par point de la page (une grande tablette lente ne doit pas dessiner une image énorme)
let K = 2;
const SANS = ((location.search.match(/sans=([a-z,]+)/) || [])[1] || '').split(','); // pour les mesures : couper un morceau du dessin
function taille() {
  const vw = innerWidth, vh = innerHeight;
  let fw = vw; if (vw / vh > 0.7) fw = Math.round(vh * 0.62);
  cadre.style.width = fw + 'px'; cadre.style.left = Math.round((vw - fw) / 2) + 'px';
  W = 420; H = Math.round(Math.max(620, Math.min(960, W * vh / fw)));
  S = Math.min(fw / W, vh / H); DPR = Math.min(FINESSE[Q.n][0], window.devicePixelRatio || 1) * FINESSE[Q.n][1];
  K = Math.min(S * DPR, PLAFOND[Q.n]); DPR = K / S;
  cv.width = Math.round(W * K); cv.height = Math.round(H * K);
  cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px';
  cv.style.left = Math.round((fw - W * S) / 2) + 'px'; cv.style.top = Math.round((vh - H * S) / 2) + 'px';
  const cmdH = 104 / S;
  L.W = W; L.H = H;
  L.bardeY = Math.round(H - cmdH - 46); L.bardeX = W / 2;
  L.placeY0 = Math.round(Math.max(244, Math.min(300, H * 0.31)));
  L.toitY = L.placeY0 - 112; L.grosY = L.placeY0 + 6; L.ruelleY = Math.round((L.placeY0 + L.bardeY) / 2 - 20);
  L.gk = Math.max(0.74, Math.min(1.08, (L.grosY - 6) / Gros.HAUT)); L.gs = L.gk; // Grosbec, bien plus grand : il monte jusqu'en haut de l'écran
  L.portee = Math.round((L.bardeY - L.placeY0) * 0.66);
  L.metroX = 50; L.metroY = L.bardeY + 12;
  L.soloY0 = L.placeY0 + 10; L.hitY = H - cmdH + 8;
  fondC = Decor.construire(L, W, H, K).fond; Barde.construire(K);
  Golems.regler(K); Gros.construire(K, L.gk);
}
function baisserQualite() { // l'appareil peine : on allège (moins fin, moins d'effets) et on s'en souvient
  if (Q.n <= 0 || Q.fige) return;
  Q.n--; Q.bas++; Q.calme = -4; Q.lent = 0; try { localStorage.setItem('barde-qualite', Q.n); } catch (e) {}
  taille();
}
function surveiller() { // compte les images pendant le jeu ; quand ça ralentit, on baisse d'un cran
  const t = performance.now(); Q.images++;
  if (t - Q.t0 < 1000) return;
  const ips = Q.images * 1000 / (t - Q.t0); Q.images = 0; Q.t0 = t; Q.ips = Math.round(ips);
  if (G.etat !== 'jeu' || document.hidden) { Q.calme = 0; return; }
  if (++Q.calme < 2) return; // les premières secondes ne comptent pas (on vient de tout préparer)
  if (Golems.file || Barde.reste) { Q.lent = 0; return; } // on est en train de préparer les images des golems d'un acte : un ralenti passager, pas une raison de baisser
  Q.lent = ips < 36 ? (Q.lent || 0) + 1 : 0;
  Q.bon = ips >= 40 ? (Q.bon || 0) + 1 : 0; // trente secondes de jeu bien fluides : ce niveau est le bon, on le retient
  if (Q.bon === 30 && !Q.fige) try { localStorage.setItem('barde-qualite', Q.n); } catch (e) {}
  if (Q.lent >= 2 || ips < 24) { if (ips < 24 && Q.n > 1 && !Q.fige) Q.n--; baisserQualite(); } // deux secondes de suite sous 36 images : on allège d'un cran ; sous 24 : de deux
}
addEventListener('resize', taille);
setTimeout(() => Golems.prevoir(Object.keys(ACTES[0].poids)), 300); // pendant qu'on lit les règles, on prépare les golems du premier acte

// ---------------- le temps qu'on entend ----------------
function entendu() {
  if (!ac) return 0;
  let t = ac.currentTime - (ac.outputLatency || 0) - (ac.baseLatency || 0);
  if (ac.getOutputTimestamp) {
    const ts = ac.getOutputTimestamp();
    if (ts && ts.contextTime > 0 && ts.performanceTime > 0) t = ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
  }
  t = Math.min(t, ac.currentTime);
  if (t < entendu.dernier && entendu.dernier - t < 0.2) t = entendu.dernier;
  entendu.dernier = t; return t;
}
entendu.dernier = 0;
function entenduA(ts) { const now = entendu(), age = (performance.now() - ts) / 1000; return now - (age > 0 && age < 0.25 ? age : 0); }

function sonPret() {
  if (ac) { if (ac.state === 'suspended' && G.etat !== 'pause') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  ac = new AC({ latencyHint: 'interactive' });
  Son.construire(ac); ac.resume();
  try { // iPhone : un silence en boucle pour passer outre le bouton silencieux
    const n = 800, b = new Uint8Array(44 + n), v = new DataView(b.buffer);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    w(36, 'data'); v.setUint32(40, n, true); b.fill(128, 44);
    let s = ''; b.forEach(x => s += String.fromCharCode(x));
    const a = new Audio('data:audio/wav;base64,' + btoa(s)); a.loop = true; a.volume = 0.01; a.play().catch(() => {});
  } catch (e) {}
  setInterval(() => { if (G.etat === 'jeu' || G.etat === 'fin') Musique.planifier(ac); }, 25);
}

// ---------------- la partie ----------------
const RAPPELS = { section: x => surSection(x), temps: b => G.temps.push(b), fin: () => { G.tFinEcran = performance.now() + 2600; } };
function nouvellePartie(k = 0) {
  sonPret(); Musique.arreter(); remise(); $('jam').classList.add('cache');
  G.etat = 'jeu'; G.st.debut = performance.now(); G.acteDepart = k;
  Musique.demarrer(ac.currentTime + 0.3, RAPPELS, ACTES[k].chanson, 0);
  ['intro', 'pause', 'fin', 'calib', 'carte'].forEach(id => $(id).classList.add('cache'));
  debutActe(k, true);
  if (k === 0) {
    texte('Grosbec : « Debout, mes golems ! »', W / 2, L.placeY0 + 40, '#ffb3a0', 17, 3.4);
    texte('« Et écrasez-moi ce chanteur ! »', W / 2, L.placeY0 + 64, '#ffb3a0', 17, 3.4, 1.2);
  }
}
function debutActe(k, depart) {
  G.acte = k; G.mode = 'combat'; G.relance = null; G.enMega = false; G.megaDemande = false;
  if (k === 2) texte('Le Barde empoigne son synthé !', W / 2, L.bardeY - 150, '#a8f0ff', 17, 2.6, 1.2);
  Golems.prevoir(Object.keys(ACTES[k].poids));
  G.vague = { groupes: preparerGroupes(k), i: 0, bars: 0 };
  G.ferveur = depart ? 0 : FER.N1; Musique.M.niveau = niveauDe(G.ferveur);
  if (!depart) { G.coeurs = R.COEURS; onde(L.bardeX, L.bardeY - 40, 'rgba(255,210,63,.95)', H, 0.9); }
  const avant = k > 0 ? ACTES[k - 1].boutons : [];
  majBoutons(k);
  if (!depart) for (const bt of ACTES[k].boutons) if (!avant.includes(bt) && NOUVEAU[bt]) texte(NOUVEAU[bt], W / 2, L.bardeY - 150, '#ffe28a', 16, 4.5, 1.5);
  texte('Acte ' + ROMAIN[k], W / 2, L.placeY0 + 110, '#ffd23f', 38, 2.2, depart ? 0.4 : 0);
  texte('« ' + Musique.CHANSONS[ACTES[k].chanson].nom + ' »', W / 2, L.placeY0 + 146, '#ffffff', 18, 2.2, depart ? 0.4 : 0);
  if (!depart) texte('Tous tes cœurs sont revenus.', W / 2, L.placeY0 + 172, '#ff9fb0', 15, 2.2);
}
function preparerGroupes(k) {
  const A = ACTES[k], gs = [], w = A.poids, tot = Object.values(w).reduce((a, x) => a + x, 0);
  const tirer = () => { let r = Math.random() * tot; for (const t in w) { r -= w[t]; if (r <= 0) return t; } return 'trotteur'; };
  for (let i = 0; i < A.groupes; i++) {
    if (i === 2 && A.nouveaux[0]) { gs.push([A.nouveaux[0], 'trotteur']); continue; }
    if (i === 6 && A.nouveaux[1]) { gs.push([A.nouveaux[1], 'trotteur']); continue; }
    const n = A.taille[0] + (i > A.groupes * 0.5 ? 1 : 0) + (Math.random() < 0.25 ? 1 : 0);
    const grp = []; let lourds = 0;
    for (let j = 0; j < Math.min(n, A.taille[1]); j++) {
      let t = tirer();
      if ((t === 'fonceur' || t === 'gros' || t === 'lanceur') && lourds >= 1) t = 'trotteur';
      if (t === 'fonceur' || t === 'gros' || t === 'lanceur') lourds++;
      grp.push(t);
    }
    gs.push(grp);
  }
  return gs;
}
function majBoutons(k) {
  const av = G.boutons; G.boutons = ACTES[k].boutons;
  const ids = { note: 'bNote', repousse: 'bRep', stop: 'bStop', vague: 'bVague' };
  for (const b of TOUS) {
    const el = $(ids[b]); el.classList.toggle('cache', !G.boutons.includes(b));
    if (G.boutons.includes(b) && !av.includes(b) && av.length) { G.neufs.add(b); el.classList.add('neuf'); }
  }
  $('cmd').classList.remove('cache');
}

function traiterTemps(now) {
  while (G.temps.length && G.temps[0].t <= now) {
    const b = G.temps.shift();
    G.beat = b; G.passes.push(b); if (G.passes.length > 6) G.passes.shift();
    surTemps(b);
  }
}
const relanceSec = sec => sec[0] === 'G';

function surTemps(b) {
  for (const s of G.sbires) s.tCoeur = b.t;
  if (relanceSec(b.sec)) { G.mode = 'relance'; $('cmd').classList.add('cache'); tempsRelance(b); return; }
  if (b.sec === 'V' || b.sec[0] === 'T') { // la victoire : le tube de l'été, puis Grosbec a mal à la tête
    if (b.sec === 'TI' && b.bar === 0 && b.b === 0) victoire();
    if (b.sec === 'TF' && b.b === 0) malDeTete();
    if (b.sec === 'TR' && b.b === 0) { texte('ENCORE UNE FOIS !', W / 2, L.placeY0 + 110, '#ffd23f', 36, 2, 0); G.secoue = 1; }
    return;
  }
  if (G.mode === 'relance') debutActe(G.acte + 1, false);
  if (G.mode !== 'combat' || G.victoire) return;
  if (b.sec === 'U' && b.bar === 0 && b.b === 0) texte('Ça monte…', W / 2, L.placeY0 + 120, '#ffd23f', 24, b.P * 3.5);
  if (b.sec === 'M' && b.bar === 0 && b.b === 0) debutMega(b);
  if (b.sec === 'C' && G.enMega) finMega();
  const n = b.n;
  // les projectiles avancent d'un pas
  for (const p of G.proj) if (p.etat === 'aller') {
    p.px = p.x; p.py = p.y; p.k++; p.tBouge = b.t;
    const f = Math.min(1, p.k / p.pas); p.x = p.x0 + (p.x1 - p.x0) * f; p.y = p.y0 + (p.y1 - p.y0) * f;
    if (p.k === p.pas) { p.etat = 'arrive'; G.frappes.push({ n, t: b.t, deg: 1, proj: p }); }
  }
  // les automates
  for (const s of G.sbires) {
    if (s.mort) continue;
    if (s.type === 'danseur') s.tourne = n % 2 === 0;
    if (s.geleFin > n || s.sonneFin > n) continue;
    s.gele = false; s.sonne = false;
    if (s.type === 'bouclier' && s.sansBouclier && n >= s.sansBouclierFin) { s.sansBouclier = false; G.sols = G.sols.filter(x => x.s !== s); }
    if (s.etat === 'arme' && s.armeN === n - 1) {
      if (s.type === 'lanceur') { lancer(s, b); s.etat = 'recul'; continue; }
      s.etat = 'frappe'; s.frappeN = n; s.tFrappe = b.t;
      G.frappes.push({ n, t: b.t, s, deg: DEG[s.type] }); I.clang(ac.currentTime, s.type === 'gros' ? 0.24 : 0.16);
      continue;
    }
    if (s.etat === 'frappe' || s.etat === 'recul') { s.etat = s.etat === 'frappe' ? 'recul' : 'marche'; if (s.etat === 'recul') continue; }
    const d = Math.hypot(L.bardeX - s.x, L.bardeY - 10 - s.y);
    if (s.type === 'lanceur') {
      if (Math.hypot(s.poste.x - s.x, s.poste.y - s.y) > 6) { aller(s, b.t, s.poste); continue; }
      if ((n - s.n0) % 5 === 0) { s.etat = 'arme'; s.armeN = n; s.tArme = b.t; s.P = b.P; }
      continue;
    }
    if (s.type === 'fonceur') {
      if (s.etat === 'charge') {
        s.px = s.x; s.py = s.y; s.tBouge = b.t;
        const dd = Math.max(0, d - R.CONTACT + 10), pas = Math.min(R.PAS * 3, dd);
        s.x += s.dir.x * pas; s.y += s.dir.y * pas;
        if (pas < R.PAS * 3 - 1) { G.frappes.push({ n, t: b.t, s, deg: 2 }); I.clang(ac.currentTime, 0.3); s.etat = 'marche'; s.sonneFin = n + 3; s.sonne = true; G.secoue = 0.6; }
        continue;
      }
      if (s.etat === 'gratte') {
        if (n - s.gratteN >= 2) { s.etat = 'charge'; const dx = L.bardeX - s.x, dy = L.bardeY - 10 - s.y, dn = Math.hypot(dx, dy) || 1; s.dir = { x: dx / dn, y: dy / dn }; }
        continue;
      }
      if (d <= L.portee * 0.85 && d > R.CONTACT + 30) { s.etat = 'gratte'; s.gratteN = n; continue; }
    }
    s.etat = 'marche';
    if (d <= R.CONTACT + D.TYPES[s.type].r * 0.4) { s.etat = 'arme'; s.armeN = n; s.tArme = b.t; s.P = b.P; continue; }
    const bouge = s.type === 'trotteur' || s.type === 'danseur' || s.type === 'fonceur' ? true : (n + s.par) % 2 === 0;
    if (bouge) avancer(s, b.t);
  }
  // Grosbec et ses plumes de bronze
  if (G.grosLance && n === G.grosLance.n0 + 1) {
    const mg = Gros.point('mainG', W / 2, L.grosY), md = Gros.point('mainD', W / 2, L.grosY);
    const p = { type: 'plume', x0: (mg.x + md.x) / 2, y0: Math.max(mg.y, md.y) + 10, x1: L.bardeX, y1: L.bardeY - 50, pas: 5, k: 0, etat: 'aller', source: 'grosbec', tBouge: b.t };
    p.x = p.px = p.x0; p.y = p.py = p.y0; G.proj.push(p); I.lancer(ac.currentTime); G.grosLance = null;
    if (!G.vus.has('plume')) { G.vus.add('plume'); const t0 = entendu(), ret = Math.max(0.2, (G.finAstuce || 0) - t0); texte('Grosbec lance une décharge de lumière ! La Vague la lui renvoie dans le casque.', W / 2, L.placeY0 + 74, '#ffe28a', 15, 4.5, ret); G.finAstuce = t0 + ret + 4.5; }
  }
  if (b.b === 3) annoncerEnvoi(b);
  if (b.b === 0) {
    G.vague.bars++;
    const A = ACTES[G.acte], sonne = n < G.grosSonneFin;
    if (A.plumes && !sonne && G.vague.bars > 3 && G.vague.bars % A.plumes === 2) { G.grosLance = { n0: n, t0: b.t }; Gros.jouer('decharge', b.t + b.P, 1, b.P); G.tGesteG = b.t + b.P * 0.4; I.grosVoix(ac.currentTime + 0.05, 'grogne', 0.8); I.grosMetal(ac.currentTime + b.P, 0.6); }
    if (G.vague.bars > 1) directeur(b);
  }
}

function directeur(b) {
  const V = G.vague, A = ACTES[G.acte], vivants = G.sbires.filter(s => !s.mort).length;
  if (V.i >= V.groupes.length) {
    if (vivants === 0 && !G.proj.some(p => p.etat !== 'fini')) coupure();
    return;
  }
  if (b.n < G.grosSonneFin) return;
  if (vivants > 0 && V.bars % 2 === 0) return;
  if (vivants >= A.max) return;
  const grp = V.groupes[V.i++];
  // Grosbec tend le doigt : « Allez, allez ! ». Ses golems arrivent par les deux portes de bronze du fond, ou sautent des galeries.
  const F = Decor.F, cote = coteEnvoi(b.n); Gros.jouer('envoi', b.t, cote, b.P); G.tGesteG = b.t; grosParle();
  grp.forEach((type, i) => {
    const ip = type === 'lanceur' ? 0 : (i + b.n) % 3; let p, entree;
    if (ip === 0) { const k = (b.n + i) % 2, d = F.portes[k]; p = [d.x, d.y + 16]; entree = { porte: k }; G.tPorte[k] = b.t; }
    else { const c = F.chutes[ip - 1]; p = [c.x, c.y]; entree = { chute: c }; }
    const s = { id: ++G.idS, type, entree, x: p[0] + (Math.random() * 22 - 11), y: p[1] + (Math.random() * 16 - 4), px: 0, py: 0,
      pv: D.TYPES[type].pv, pvMax: D.TYPES[type].pv, etat: 'marche', armeN: -9, frappeN: -9, sonneFin: -9, geleFin: -9, tBouge: -9,
      tNe: b.t, tFlash: -9, tCoeur: b.t, par: Math.random() < 0.5 ? 0 : 1, zig: 1, mort: false, n0: b.n + i };
    if (type === 'lanceur') { const k = G.sbires.filter(o => o.type === 'lanceur' && !o.mort).length; s.poste = { x: [W * 0.27, W * 0.73, W * 0.5, W * 0.2, W * 0.8][k % 5], y: L.placeY0 + 30 + (k % 2) * 22 }; }
    s.px = s.x; s.py = s.y; G.sbires.push(s);
    if (!G.vus.has(type) && ASTUCE[type]) {
      G.vus.add(type); const now = entendu(), ret = Math.max(0.3, (G.finAstuce || 0) - now);
      texte(ASTUCE[type], W / 2, L.placeY0 + 74, '#ffe28a', 15, 4.5, ret); G.finAstuce = now + ret + 4.5;
    }
  });
  G.tPointe = b.t;
}

// de quel bras Grosbec envoie ce groupe (le côté du premier cercle ; au milieu : un bras puis l'autre)
function coteEnvoi(n) { const ip = n % 3; return ip === 1 ? -1 : ip === 2 ? 1 : (n % 2 ? 1 : -1); }
// un temps avant : s'il va envoyer un groupe au temps suivant, il arme déjà son bras
function annoncerEnvoi(b) {
  const V = G.vague, A = ACTES[G.acte]; if (!V || G.mode !== 'combat' || V.i >= V.groupes.length || V.bars + 1 <= 1) return;
  const vivants = G.sbires.filter(s => !s.mort).length;
  if (b.n + 1 < G.grosSonneFin || (vivants > 0 && (V.bars + 1) % 2 === 0) || vivants >= A.max) return;
  Gros.jouer('envoi', b.t + b.P, coteEnvoi(b.n + 1), b.P); G.tGesteG = b.t;
  G.tAnnonce = b.t; I.grosMetal(ac.currentTime + 0.05, 0.6); I.porte(ac.currentTime + 0.08, 0.8); // les portes s'entrouvrent, son armure grince
}
// ce que dit Grosbec quand il envoie ses golems (sa voix à chaque fois ; les mots, une fois sur deux)
const MOTS_GROS = ['« Allez, allez ! »', '« Écrasez-le ! »', '« Allez ! Plus vite ! »', '« Faites-le taire ! »', '« Allez, allez, allez ! »'];
function grosParle() {
  const t = ac.currentTime + 0.03; I.grosVoix(t, 'allez', 0.85); I.grosMetal(t + 0.12, 0.55);
  if (G.nParle++ % 2 === 0) texte(MOTS_GROS[(G.nParle >> 1) % MOTS_GROS.length], W / 2, L.placeY0 + 36, '#ff9a80', 17, 1.1);
}
// une porte : entrouverte dès que Grosbec arme son geste, grande ouverte quand un golem en sort, puis elle se referme
function ouverture(k, now) {
  const u = now - G.tPorte[k], a = now - G.tAnnonce;
  const grand = u < 0 ? 0 : u < 0.12 ? u / 0.12 : u < 0.9 ? 1 : Math.max(0, 1 - (u - 0.9) / 0.35), peu = a < 0 ? 0 : a < 0.15 ? a / 0.15 * 0.28 : a < 0.75 ? 0.28 : Math.max(0, 0.28 * (1 - (a - 0.75) / 0.3));
  return Math.max(grand, peu);
}
function lancer(s, b) {
  const p = { type: 'boulon', x0: s.x, y0: s.y - 30, x1: L.bardeX, y1: L.bardeY - 50, pas: 4, k: 0, etat: 'aller', source: s, tBouge: b.t };
  p.x = p.px = p.x0; p.y = p.py = p.y0; G.proj.push(p); I.lancer(ac.currentTime); s.tFrappe = b.t;
}
function aller(s, t, cible) {
  s.px = drawX(s, t); s.py = drawY(s, t);
  const dx = cible.x - s.x, dy = cible.y - s.y, d = Math.hypot(dx, dy) || 1, pas = Math.min(R.PAS, d);
  s.x += dx / d * pas; s.y += dy / d * pas; s.tBouge = t;
}
function avancer(s, t, recul = 0) {
  const bx = L.bardeX, by = L.bardeY - 10;
  let dx = bx - s.x, dy = by - s.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  let vx = dx, vy = dy, pas;
  if (recul) { vx = -dx; vy = -dy; pas = recul; }
  else {
    let sx = 0, sy = 0;
    for (const o of G.sbires) if (o !== s && !o.mort) {
      const ex = s.x - o.x, ey = s.y - o.y, e = Math.hypot(ex, ey), min = (D.TYPES[s.type].r + D.TYPES[o.type].r) * 1.6 + 6;
      if (e < min && e > 0.01) { sx += ex / e * (min - e) / min; sy += ey / e * (min - e) / min; }
    }
    vx += sx * 1.4; vy += sy * 1.4;
    if (s.type === 'danseur') { s.zig = -s.zig; vx += -dy * 0.9 * s.zig; vy += dx * 0.9 * s.zig; }
    pas = Math.min(R.PAS, Math.max(8, d - R.CONTACT + 8));
  }
  const v = Math.hypot(vx, vy) || 1;
  s.px = drawX(s, t); s.py = drawY(s, t);
  if (G.pouss.length < 20) G.pouss.push({ x: s.x, y: s.y, t0: t, r: D.TYPES[s.type].r });
  const bd = Decor.bord(s.y); s.x = Math.max(bd, Math.min(W - bd, s.x + vx / v * pas)); // (les murs de la salle se resserrent vers le fond)
  s.y = Math.max(L.placeY0 + 6, Math.min(L.bardeY - 4, s.y + vy / v * pas));
  s.tBouge = t;
}
const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3);
function drawX(s, now) { const u = (now - s.tBouge) / 0.16; return u >= 1 ? s.x : s.px + (s.x - s.px) * ease(u); }
function drawY(s, now) { const u = (now - s.tBouge) / 0.16; return u >= 1 ? s.y : s.py + (s.y - s.py) * ease(u); }
const distB = (x, y) => Math.hypot(x - L.bardeX, y - (L.bardeY - 30));

// ---------------- juger un geste ----------------
function juger(tH) {
  const c = [...G.passes, ...G.temps], last = G.passes[G.passes.length - 1];
  if (last) c.push({ n: last.n + 1, t: last.t + last.P, sec: last.sec });
  let best = null;
  for (const x of c) { const e = tH - x.t; if (!best || Math.abs(e) < Math.abs(best.e)) best = { n: x.n, t: x.t, e, sec: x.sec }; }
  return best;
}
const menace = (s, n) => (s.etat === 'arme' && s.armeN === n - 1 && s.type !== 'lanceur') || (s.etat === 'frappe' && s.frappeN === n);
const dispo = (b, n) => n - G.recharge[b] >= R.RECHARGE[b];
function protege(s, n) { // ce temps-là, une note ne lui fait rien
  if (s.gele || s.sonne) return false;
  if (s.type === 'bouclier' && !s.sansBouclier) return 'Bong !';
  if (s.type === 'fonceur') return 'Bong !';
  if (s.type === 'danseur' && n % 2 === 0) return 'Il tourne !';
  return false;
}

function agir(type, cible, ts, tForce) {
  if (G.etat !== 'jeu' || G.mode !== 'combat' || !G.beat || G.victoire || !G.boutons.includes(type)) return;
  const tH = tForce != null ? tForce : entenduA(ts) - G.decal;
  const j = juger(tH); if (!j || relanceSec(j.sec) || j.sec === 'V') return;
  if (G.dejaAgi === j.n && Math.abs(j.e) <= R.BIEN) return;
  if (Math.abs(j.e) > R.BIEN) { fausseNote(); return; }
  if (!dispo(type, j.n)) { I.non(ac.currentTime); texte('Pas encore', L.bardeX, L.bardeY - 104, '#cbbbe8', 14, 0.5); return; }
  G.dejaAgi = j.n; G.recharge[type] = j.n;
  if (G.neufs.has(type)) { G.neufs.delete(type); document.querySelector('.cmd.neuf[aria-label="' + { note: 'Note', repousse: 'Repousse', stop: 'Stop', vague: 'Vague' }[type] + '"]')?.classList.remove('neuf'); }
  const q = Math.abs(j.e) <= R.PARFAIT ? 2 : 1;
  G.combo++; G.st.notes++; if (q === 2) G.st.parfaits++; G.st.meilleur = Math.max(G.st.meilleur, G.combo); majFerveur(q === 2 ? 1 : 0.35);
  const tJoue = Math.max(ac.currentTime, j.t);
  ({ note: note, repousse: repousse, stop: stop, vague: vagueSort })[type](j, q, cible, tJoue);
}
function niveauDe(f) { return f >= FER.N3 ? 3 : f >= FER.N2 ? 2 : f >= FER.N1 ? 1 : 0; }
function majFerveur(d) {
  const av = niveauDe(G.ferveur);
  G.ferveur = Math.max(0, Math.min(40, G.ferveur + d));
  const nv = niveauDe(G.ferveur); Musique.M.niveau = nv;
  if (nv > av && G.mode === 'combat' && !G.enMega) texte('♪ ' + INSTRUMENTS[ACTES[G.acte].chanson][nv], W / 2, L.bardeY - 140, '#c9b3ff', 16, 1.6);
  if (G.ferveur >= FER.MEGA && !G.enMega && !G.megaDemande && G.mode === 'combat') { G.megaDemande = true; Musique.demanderMega(); }
}
function debutMega(b) {
  G.enMega = true; G.megaDemande = false; G.tMega = entendu(); G.st.megas++; G.secoue = 0.8;
  texte('MÉGA REFRAIN !', W / 2, L.placeY0 + 120, '#ffd23f', 42, 2.4);
  if (G.coeurs < R.COEURS) { G.coeurs++; texte('+1 cœur', L.bardeX, L.bardeY - 120, '#ff9fb0', 20, 1.4); }
  texte('Tes notes cognent deux fois plus fort', W / 2, L.placeY0 + 156, '#ffffff', 15, 2.4);
  onde(L.bardeX, L.bardeY - 40, 'rgba(255,210,63,.95)', H, 1);
}
function finMega() { G.enMega = false; G.ferveur = Math.min(G.ferveur, FER.APRES); Musique.M.niveau = niveauDe(G.ferveur); }
function vivantsVisibles(now) { return G.sbires.filter(o => !o.mort && now - o.tNe > 0.15); }

function note(j, q, cible, tJoue) {
  const now = entendu();
  const tons = Musique.tonsChant(tJoue), m = tons[MOTIF[G.combo % MOTIF.length]];
  sons().note(tJoue, m, q);
  G.tChante = now; Barde.jouer('gratte', now);
  const aPortee = o => distB(o.x, o.y) <= L.portee;
  let s = cible && !cible.mort && aPortee(cible) ? cible : null;
  if (!s) {
    const v = vivantsVisibles(now).filter(aPortee), dist = o => distB(o.x, o.y);
    const ordre = [v.filter(o => menace(o, j.n) && !protege(o, j.n)), v.filter(o => !protege(o, j.n)), v];
    for (const pool of ordre) if (pool.length) { s = pool.sort((a, b) => dist(a) - dist(b))[0]; break; }
  }
  if (!s) { texte(G.sbires.some(o => !o.mort) ? 'Trop loin…' : '♪', L.bardeX + 24, L.bardeY - 96, '#fff', 16, 0.6); return; }
  const tx = drawX(s, now), ty = drawY(s, now) - D.TYPES[s.type].haut * 0.6 * Decor.ech(s.y);
  G.notesVol.push({ x0: L.bardeX - 4, y0: L.bardeY - 62, x1: tx, y1: ty, t0: now, d: 0.11, q });
  const pr = protege(s, j.n);
  if (pr) { if (pr === 'Bong !') I.bong(tJoue + 0.05); texte(pr, tx, ty - 18, '#e8b558', 17, 0.7); s.tFlash = now; return; }
  let deg = q === 2 ? 2 : 1; if (s.gele || s.sonne) deg *= 2; if (G.enMega) deg *= 2;
  s.pv -= deg; s.tFlash = now;
  if (menace(s, j.n) && s.pv > 0) { for (const f of G.frappes) if (f.s === s && f.n >= j.n) f.pare = true; s.etat = 'marche'; s.sonneFin = j.n + 2; s.sonne = true; }
  texte(q === 2 ? 'Parfait !' : 'Bien', tx, ty - 22, q === 2 ? '#9cff9c' : '#ffffff', q === 2 ? 18 : 15, 0.7);
  if (s.pv <= 0) tuer(s, tJoue, m);
}
function repousse(j, q, cible, tJoue) {
  Barde.jouer('repousse', entendu());
  const now = entendu(); G.tRep = now;
  sons().repousse(tJoue, Musique.tonsChant(tJoue));
  onde(L.bardeX, L.bardeY - 30, 'rgba(255,140,80,.95)', R.R_REPOUSSE, 0.35);
  let k = 0;
  for (const s of G.sbires) {
    if (s.mort || distB(drawX(s, now), drawY(s, now)) > R.R_REPOUSSE) continue;
    if (s.type === 'fonceur' && (s.etat === 'charge' || s.etat === 'gratte') && !s.gele) { texte('Trop lourd !', drawX(s, now), drawY(s, now) - 50, '#ffb3a0', 15, 0.8); continue; }
    k++;
    for (const f of G.frappes) if (f.s === s && f.n >= j.n) f.pare = true;
    s.etat = 'marche'; s.sonneFin = Math.max(s.sonneFin, j.n + 2); s.sonne = true;
    avancer(s, now, s.type === 'gros' ? R.PAS * 0.6 : R.PAS * 2);
    if (s.type === 'bouclier' && !s.sansBouclier) {
      s.sansBouclier = true; s.sansBouclierFin = j.n + 10;
      G.sols.push({ s, x: drawX(s, now) + (Math.random() < 0.5 ? -26 : 26), y: s.y + 4 });
      texte('Il lâche sa dalle !', s.x, s.y - 60, '#ffe28a', 15, 1);
    }
  }
  if (!k) texte('Personne à repousser', L.bardeX, L.bardeY - 104, '#cbbbe8', 14, 0.6);
}
function stop(j, q, cible, tJoue) {
  Barde.jouer('stop', entendu());
  const now = entendu(), v = vivantsVisibles(now).filter(o => !o.gele && o.type !== 'lanceur');
  const dist = o => distB(o.x, o.y);
  const ordre = [v.filter(o => o.type === 'fonceur' && (o.etat === 'charge' || o.etat === 'gratte')), v.filter(o => menace(o, j.n)),
    v.filter(o => o.type === 'gros' && dist(o) < L.portee), v.filter(o => dist(o) <= L.portee)];
  let s = cible && !cible.mort && cible.type !== 'lanceur' ? cible : null;
  if (!s) for (const pool of ordre) if (pool.length) { s = pool.sort((a, b) => dist(a) - dist(b))[0]; break; }
  sons().stop(tJoue, Musique.tonsChant(tJoue));
  if (!s) { texte('Personne à figer', L.bardeX, L.bardeY - 104, '#cbbbe8', 14, 0.6); return; }
  s.gele = true; s.geleFin = j.n + 5; s.etat = 'marche';
  for (const f of G.frappes) if (f.s === s && f.n >= j.n) f.pare = true;
  G.notesVol.push({ x0: L.bardeX - 4, y0: L.bardeY - 62, x1: drawX(s, now), y1: drawY(s, now) - 30, t0: now, d: 0.12, q: 4 });
  texte('Figé !', drawX(s, now), drawY(s, now) - 64, '#bff4ff', 18, 0.9);
}
function vagueSort(j, q, cible, tJoue) {
  Barde.jouer('vague', entendu());
  const now = entendu(); sons().vague(tJoue, Musique.tonsChant(tJoue));
  onde(L.bardeX, L.bardeY - 40, 'rgba(90,170,255,.95)', R.R_VAGUE, 0.4);
  let k = 0;
  for (const p of G.proj) {
    if (p.etat !== 'aller' && p.etat !== 'arrive') continue;
    const x = p.etat === 'arrive' ? p.x1 : p.x, y = p.etat === 'arrive' ? p.y1 : p.y;
    if (distB(x, y) > R.R_VAGUE) continue;
    k++; p.etat = 'retour'; p.rx = drawPX(p, now); p.ry = drawPY(p, now); p.tRetour = now;
    for (const fr of G.frappes) if (fr.proj === p) fr.pare = true;
    I.renvoi(tJoue);
  }
  texte(k ? (k > 1 ? 'Renvoyés !' : 'Renvoyé !') : 'Rien à renvoyer', L.bardeX, L.bardeY - 108, k ? '#9fd0ff' : '#cbbbe8', k ? 18 : 14, 0.7);
}
function drawPX(p, now) { if (p.etat === 'arrive') return p.x1; const u = (now - p.tBouge) / 0.16; return u >= 1 ? p.x : p.px + (p.x - p.px) * ease(u); }
function drawPY(p, now) { if (p.etat === 'arrive') return p.y1; const u = (now - p.tBouge) / 0.16; return u >= 1 ? p.y : p.py + (p.y - p.py) * ease(u); }

function tuer(s, t, m, muet) {
  s.mort = true; G.st.tues++;
  if (!muet) sons().tue(t + 0.06, m + 12);
  G.sols = G.sols.filter(x => x.s !== s);
  const x = s.x, y = s.y - D.TYPES[s.type].haut * 0.5, r = D.TYPES[s.type].r;
  for (let i = 0; i < 12 + r; i++) {
    const a = Math.random() * TAU, v = 60 + Math.random() * 160;
    G.eclats.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14,
      t0: entendu(), col: i % 4 === 0 ? '#ff6a2a' : i % 4 === 1 ? '#ffd76a' : i % 2 ? '#4d585e' : D.TYPES[s.type].email, taille: 2 + Math.random() * (r / 5) });
  }
}
function fausseNote() {
  G.combo = 0; majFerveur(-4); G.st.fausses++;
  const t = ac.currentTime; I.couac(t, Musique.tonsChant(t)[0] + 1);
  G.tCoeurRouge = entendu();
  texte('Fausse note !', L.bardeX, L.bardeY - 100, '#ff7a7a', 17, 0.8);
}
function blesser(deg, src) {
  if (G.etat !== 'jeu') return;
  G.st.coups[src || '?'] = (G.st.coups[src || '?'] || 0) + deg;
  G.coeurs = Math.max(0, G.coeurs - deg); G.combo = 0; majFerveur(-4);
  G.secoue = 1; G.tMal = entendu(); I.aie(ac.currentTime); Barde.jouer('coup', G.tMal);
  texte('−' + deg + (deg > 1 ? ' cœurs' : ' cœur'), L.bardeX, L.bardeY - 104, '#ff5a5a', 20, 0.9);
  if (G.coeurs <= 0) defaite();
}
function logiqueCombat(now) {
  for (let i = G.frappes.length - 1; i >= 0; i--) {
    const f = G.frappes[i];
    if (now < f.t + R.BIEN + 0.02) continue;
    G.frappes.splice(i, 1);
    if (f.proj) { if (!f.pare) { f.proj.etat = 'fini'; if (G.mode === 'combat') blesser(1, f.proj.type); } continue; }
    if (f.pare || G.mode !== 'combat' || (f.s && (f.s.mort || f.s.gele))) continue;
    blesser(f.deg, f.s ? f.s.type : '?');
  }
  for (const p of G.proj) if (p.etat === 'retour' && now - p.tRetour > 0.32) {
    p.etat = 'fini';
    if (p.source === 'grosbec') {
      G.tFlashCasque = now; G.fissures = Math.min(5, G.fissures + 1); G.grosSonneFin = (G.beat ? G.beat.n : 0) + 8; G.secoue = 0.8;
      Gros.jouer('touche', now, Math.random() < 0.5 ? -1 : 1); G.tGesteG = now; I.grosMetal(ac.currentTime + 0.01, 1, true); I.grosVoix(ac.currentTime + 0.08, 'mal', 0.9);
      I.clang(ac.currentTime, 0.3); I.bong(ac.currentTime + 0.02);
      texte('En plein dans le casque !', W / 2, L.grosY - 40, '#ffd23f', 18, 1.4);
    } else if (p.source && !p.source.mort) {
      p.source.pv -= 2; p.source.tFlash = now; texte('Renvoyé !', p.source.x, p.source.y - 50, '#9fd0ff', 16, 0.8);
      if (p.source.pv <= 0) tuer(p.source, ac.currentTime, 69);
    }
  }
  G.proj = G.proj.filter(p => p.etat !== 'fini');
}

// ---------------- le silence et la relance ----------------
const CARTES = [
  { titre: 'Silence !', texte: 'Grosbec a coupé la musique. Sans elle, le Barde ne peut rien… et Grosbec en profite pour appeler de nouveaux automates.',
    ennemis: [['lanceur', 'Le lanceur', 'Il reste au fond, hors de portée de ta voix, et lance des boulons.']],
    bouton: ['vague', 'Nouveau : la Vague.', 'Quand un boulon arrive près de toi, elle le renvoie à son lanceur. Sur le temps, bien sûr.'] },
  { titre: 'Encore le silence !', texte: 'Grosbec tape du pied. Il sort ses automates les plus vicieux.',
    ennemis: [['fonceur', 'Le fonceur', 'Il gratte le sol… puis fonce tout droit. Ta voix rebondit sur sa tête de bélier.'],
      ['danseur', 'Le danseur', 'Il tourne sur lui-même un temps sur deux : ta note passe à côté.']],
    bouton: ['stop', 'Nouveau : Stop.', 'Le point d\'orgue fige un golem net. Et un golem figé prend deux fois plus cher.'],
    plus: 'Et Grosbec commence à lancer ses plumes de bronze. La Vague les lui renvoie… dans le casque.' },
  { titre: 'Grosbec est furieux', texte: 'Plus de musique, plus de pitié.',
    ennemis: [['gros', 'Le gros', 'Il cogne pour deux cœurs et ne recule presque pas.']],
    plus: 'La musique va repartir plus vite… et plus haut. Les plumes volent plus souvent.' },
  { titre: 'Le dernier silence', texte: 'Grosbec n\'a plus un seul golem. Il coupe la musique une dernière fois, de toutes ses forces. Si elle repart, son casque n\'y résistera pas.', ennemis: [] },
];
function coupure() {
  if (G.mode !== 'combat') return;
  G.mode = 'silence'; G.enMega = false; G.megaDemande = false; Musique.couper(ac.currentTime); I.scratch(ac.currentTime);
  Gros.jouer('silence', entendu()); G.tGesteG = entendu() + 0.6; I.grosVoix(ac.currentTime + 0.12, 'cri', 1.25); I.grosMetal(ac.currentTime + 0.3, 0.9, true);
  G.frappes = []; G.proj = []; G.grosLance = null; G.temps = [];
  G.textes = []; G.finAstuce = 0; // un conseil encore à l'écran ne doit pas se mêler aux textes de la relance
  setTimeout(() => Son.vider(), 900); // la chanson est coupée : on rend la mémoire de ses cordes pincées
  G.secoue = 1.2; G.tPointe = entendu();
  $('cmd').classList.add('cache');
  texte(G.acte === 3 ? '« SILENCE !!! »' : '« ASSEZ ! SILENCE ! »', W / 2, L.placeY0 + 60, '#ff9a80', 26, 1.8);
  setTimeout(() => { if (G.etat === 'jeu' && G.mode === 'silence') relancer(); }, 1800); // plus de carte : la relance part tout de suite
}
function montrerCarte() {
  if (G.etat !== 'jeu' || G.mode !== 'silence') return;
  const c = CARTES[G.acte];
  $('carteTitre').textContent = c.titre; $('carteTexte').textContent = c.texte;
  const box = $('carteEnnemis'); box.innerHTML = '';
  const ids = { vague: '#3b82f6', stop: '#14708a' };
  for (const [type, nom, txt] of c.ennemis) {
    const d = document.createElement('div'); d.className = 'carte-ennemi';
    d.innerHTML = '<canvas width="236" height="192"></canvas><p><b></b><br></p>';
    d.querySelector('b').textContent = nom; d.querySelector('p').append(txt);
    box.append(d); illuEnnemi(d.querySelector('canvas'), type);
  }
  if (c.bouton) {
    const d = document.createElement('p'); const pu = document.createElement('span'); pu.className = 'puce'; pu.style.background = ids[c.bouton[0]];
    pu.innerHTML = $(c.bouton[0] === 'vague' ? 'bVague' : 'bStop').innerHTML; d.append(pu, ' ', c.bouton[1] + ' ' + c.bouton[2]); box.append(d);
  }
  $('cartePlus').textContent = c.plus || '';
  $('carteRelanceTexte').textContent = G.acte === 3
    ? 'Le grand solo final : d\'abord une touche, puis deux, puis trois… puis le solo. Il faut au moins deux notes sur trois à chaque étape.'
    : 'Pour relancer la musique, joue les notes qui descendent : c\'est l\'air de la prochaine chanson. D\'abord une touche, puis deux, puis trois… puis le solo. Quand la musique repart, le Barde retrouve tous ses cœurs.';
  illustrer($('carteRelance'), 4);
  G.etat = 'carte'; $('carte').classList.remove('cache');
}
function relancer() {
  $('carte').classList.add('cache'); G.etat = 'jeu';
  const final = G.acte === 3;
  G.relanceIdx = G.acte; G.temps = []; G.passes = []; G.beat = null;
  G.relance = { idx: G.acte, chanson: final ? 3 : ACTES[G.acte + 1].chanson, notes: [], k: 0, essai: {}, fautes: {}, repete: 0,
    appuis: [-9, -9, -9, -9], pops: [], final, serie: 0 };
  Musique.relancer(ac.currentTime + 0.4, G.relance.chanson, final);
  if (!final) Golems.prevoir(Object.keys(ACTES[G.acte + 1].poids)); // pendant la relance, on prépare les golems de l'acte suivant
  G.mode = 'relance';
}
function couloirs(ph) {
  const toutes = [];
  ph.forEach(n => (Array.isArray(n[1]) ? n[1] : [n[1]]).forEach(m => toutes.push(m)));
  const dist = [...new Set(toutes)].sort((a, b) => a - b), k = dist.length;
  const lane = m => k === 1 ? 1 : Math.round(dist.indexOf(m) / (k - 1) * 3);
  return ph.map(n => {
    if (!Array.isArray(n[1])) return [lane(n[1])];
    const a = lane(n[1][0]); let b = lane(n[1][1]); if (b === a) b = a < 3 ? a + 1 : a - 1;
    return [a, b];
  });
}
function surSection(x) {
  if (!relanceSec(x.sec) || !G.relance) return;
  const bar = x.P * 4;
  if (x.sec === 'G0') construireEtape(1, x.t0 + bar, x.P);
  else if (x.sec === 'GC') construireEtape(G.relance.repete, x.t0 + bar, x.P);
  else { const k = +x.sec[1]; if (k < 4) construireEtape(k + 1, x.t0 + 4 * bar, x.P); }
}
// les notes d'une étape : la chanson suivante, de plus en plus riche
function construireEtape(k, t0, P) {
  const r = G.relance, c = Musique.CHANSONS[r.chanson], bar = P * 4, q = bar / 16;
  const e = r.essai[k] = (r.essai[k] == null ? 0 : r.essai[k] + 1);
  const ajoute = (t, lane, m, d) => r.notes.push({ t, lane, m, d, k, e, etat: 0, q: 0 });
  if (k === 1) { // une touche : l'accord du refrain, note après note, sur chaque temps
    for (let b = 0; b < 4; b++) { const tri = Musique.acc(c.refrain[b]).tri; [tri[0], tri[1], tri[2], tri[1]].forEach((m, i) => ajoute(t0 + b * bar + i * 4 * q, 1, m, 4 * q)); }
  } else if (k === 2 || k === 3) { // deux puis trois touches : l'air du refrain
    const seq = [];
    (k === 2 ? [0, 1, 2, 3] : [4, 5, 6, 7]).forEach((bi, j) => c.hook[bi].forEach(([st, m, l]) => { if (k === 3 || st % 2 === 0) seq.push({ st: j * 16 + st, m, l }); }));
    const tri = seq.map(n => n.m).sort((a, b) => a - b), med = tri[tri.length >> 1], oct = Math.round((72 - med) / 12) * 12;
    if (k === 2) { let prev = null, lane = 1; for (const n of seq) { lane = prev == null ? (n.m >= med ? 2 : 1) : n.m > prev ? 2 : n.m < prev ? 1 : lane; n.lane = lane; prev = n.m; } }
    else { const ds = [...new Set(seq.map(n => n.m))].sort((a, b) => a - b); for (const n of seq) n.lane = ds.length === 1 ? 1 : Math.round(ds.indexOf(n.m) / (ds.length - 1) * 2); }
    seq.forEach((n, i) => { const nx = seq[i + 1]; ajoute(t0 + n.st * q, n.lane, n.m + oct, Math.min(n.l, nx ? nx.st - n.st : n.l) * q); });
  } else { // le solo
    for (let b = 0; b < 8; b++) {
      let ph;
      if (b === 7) ph = FINALE;
      else {
        const rr = Math.random(), idx = r.idx;
        const tier = idx === 0 ? (rr < 0.75 ? 0 : 1) : idx === 1 ? (rr < 0.3 ? 0 : rr < 0.85 ? 1 : 2) : idx === 3 ? (rr < 0.4 ? 1 : 2) : (rr < 0.55 ? 1 : 2);
        const choix = PH[ACC_SOLO[b]][tier]; ph = choix[Math.floor(Math.random() * choix.length)];
      }
      const ln = couloirs(ph);
      ph.forEach((n, i) => (Array.isArray(n[1]) ? n[1] : [n[1]]).forEach((m, jj) => ajoute(t0 + b * bar + n[0] * q, ln[i][jj], m + c.decale, n[2] * q)));
    }
  }
}
function tempsRelance(b) {
  const r = G.relance; if (!r) return;
  const k = b.sec === 'G0' || b.sec === 'GC' ? 0 : +b.sec[1];
  r.k = k;
  if (b.sec === 'G0') {
    if (b.b === 0) texte('Relance la musique !', W / 2, L.soloY0 + 70, '#ffd23f', 26, b.P * 3.8);
    texte(String(b.b + 1), W / 2, L.soloY0 + 116, '#ffffff', 34, b.P * 0.9); return;
  }
  if (b.sec === 'GC') { if (b.b === 0) texte('La musique cale… On reprend !', W / 2, L.soloY0 + 70, '#ff9a80', 22, b.P * 3.8); return; }
  if (b.bar === 0 && b.b === 0) texte(ETAPES[k], W / 2, L.soloY0 + 70, '#ffd23f', k === 4 ? 40 : 24, b.P * 3.2);
  if (b.bar === b.nBars - 1 && b.b === 3) {
    const e = r.essai[k], lim = b.t - R.S_BIEN;
    const ns = r.notes.filter(n => n.k === k && n.e === e && n.t <= lim), ok = ns.filter(n => n.etat === 1).length;
    const ratio = ns.length ? Math.max(0, ok - 0.5 * (r.fautes[k + '-' + e] || 0)) / ns.length : 1;
    if (ratio < (r.final && k === 4 ? R.SEUIL_FINAL : R.SEUIL)) {
      Musique.cale(k); r.repete = k; r.notes = r.notes.filter(n => n.k !== k + 1);
      I.rire(ac.currentTime + 0.05); G.st.cales++;
      texte('Grosbec : « Ha ha ha ! »', W / 2, L.grosY - 30, '#ffb3a0', 16, 1.6);
    } else {
      texte(k === 4 ? (r.final ? 'La musique est plus forte que tout !' : 'La musique est relancée !') : 'Bien joué !', W / 2, L.hitY - 110, '#9cff9c', 22, 1.6);
      if (k === 4) G.st.relances.push(Math.round(ratio * 100));
    }
  }
}
function laneActive(pad, k) { const a = ACTIFS[k] || ACTIFS[4]; let best = a[0]; for (const l of a) if (Math.abs(l - pad) < Math.abs(best - pad)) best = l; return best; }
function frapperCouloir(pad, ts, tForce) {
  const r = G.relance; if (G.mode !== 'relance' || !r) return;
  const now = entendu(); r.appuis[laneActive(pad, r.k || 1)] = now;
  const tH = tForce != null ? tForce : entenduA(ts) - G.decal;
  let best = null;
  for (const n of r.notes) if (n.etat === 0 && laneActive(pad, n.k) === n.lane) {
    const e = tH - n.t; if (Math.abs(e) <= R.S_BIEN && (!best || Math.abs(e) < Math.abs(best.e))) best = { n, e };
  }
  if (!best) {
    if (r.k >= 1) { const cle = r.k + '-' + r.essai[r.k]; r.fautes[cle] = (r.fautes[cle] || 0) + 1; }
    r.serie = 0; I.tchac(ac.currentTime); r.pops.push({ lane: laneActive(pad, r.k || 1), txt: 'Raté', col: '#ff7a7a', t0: now }); return;
  }
  const n = best.n; n.etat = 1; r.serie++; Barde.jouer('gratte', now);
  n.q = Math.abs(best.e) <= R.S_PARFAIT ? 2 : 1;
  Musique.CHANSONS[r.chanson].sons.solo(Math.max(ac.currentTime, n.t), n.m, Math.max(0.14, n.d * 0.98), 0.2);
  r.pops.push({ lane: n.lane, txt: n.q === 2 ? 'Parfait' : 'Bien', col: n.q === 2 ? '#9cff9c' : '#fff', t0: now });
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8, v = 80 + Math.random() * 120;
    G.eclats.push({ x: soloX(n.lane, L.hitY), y: L.hitY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: 0, vr: 0, t0: now, col: COULOIRS[n.lane], taille: 2.5, etincelle: true });
  }
}
function soloLargeur(y) { const u = (y - L.soloY0) / (L.hitY - L.soloY0); return 36 + (94 - 36) * Math.max(0, Math.min(1.25, u)); }
function soloX(lane, y) { return W / 2 + (lane - 1.5) * soloLargeur(y); }
function soloY(dt) { const u = Math.max(-0.2, dt / R.APP), k = 1.6; return L.hitY - (L.hitY - L.soloY0) * (u * (1 + k)) / (1 + k * Math.max(0, u)); }

// ---------------- la fête : pendant le tube, des boutons pour faire de la musique (rien à gagner, juste pour le plaisir) ----------------
// chaque son part en éclair, en aura, en rayon ou en notes, et va frapper le casque de Grosbec
const FETE = [
  { nom: 'Hé !', ico: '🙌', c1: '#ffe27a', c2: '#e0a400', col: '#ffd23f', noir: true, fx: 'aura',
    son: (t) => { [52, 57, 61, 64].forEach((m, i) => I.voix(t + i * 0.008, m, 0.12, 0.17, 0, Son.N.sfx)); I.clap(t, 0.5); } },
  { nom: 'Boum !', ico: '💥', c1: '#ff7a6a', c2: '#c0262e', col: '#ff5a5a', fx: 'eclair', gros: true,
    son: (t, tons) => { I.kickDur(t, 1, 0.43); I.b808(t, tons[0] - 36, 0.7, 0.38, { de: tons[0] - 24, glisse: 0.45, grain: 0.9, bus: Son.N.sfx }); I.crash(t, 0.22); } },
  { nom: 'Zap !', ico: '⚡', c1: '#6fe0ff', c2: '#1386b8', col: '#5ad1ff', fx: 'eclair',
    son: (t, tons) => { I.laser(t, 0.17); I.pluck(t + 0.02, tons[2] + 12, 0.17, 0.3, Son.N.sfx); } },
  { nom: 'Accord', ico: '🎹', c1: '#c79cff', c2: '#6d2fc9', col: '#c08bff', fx: 'rayon',
    son: (t, tons) => { I.supersaw(t, tons.slice(0, 3), 0.35, 0.045, 5500, true); I.pluck(t, tons[0] + 12, 0.14, -0.3, Son.N.sfx); } },
  { nom: 'Corne', ico: '📯', c1: '#ffb36a', c2: '#d4600c', col: '#ff9a3c', fx: 'triple',
    son: (t) => { for (const [dt, d] of [[0, 0.1], [0.14, 0.1], [0.28, 0.35]]) I.corne(t + dt, 74, d, 0.09); } },
  { nom: 'Note', ico: '🎵', c1: '#8ff08f', c2: '#23933c', col: '#9cff9c', fx: 'notes',
    son: (t, tons) => { const g6 = [tons[0], tons[1], tons[2], tons[0] + 12, tons[1] + 12, tons[2] + 12]; I.synthlead(t, g6[G.jamK++ % 6], 0.22, 0.09, 0, Son.N.sfx); } },
];
(() => { // les six boutons
  const box = $('jam');
  FETE.forEach((f, i) => {
    const b = document.createElement('button'); b.className = 'jam'; b.setAttribute('aria-label', f.nom.replace(' !', ''));
    b.style.background = `linear-gradient(${f.c1},${f.c2})`; if (f.noir) { b.style.color = '#111'; b.style.textShadow = 'none'; }
    const ic = document.createElement('i'); ic.textContent = f.ico; b.append(ic, f.nom);
    box.append(b);
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('appui'); jouerFete(i); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, () => b.classList.remove('appui')));
  });
})();
function montrerFete() {
  G.jam = []; G.jamK = 0; G.jamFait = false; G.jamDernier = {};
  const box = $('jam'); box.classList.remove('cache');
  for (const b of box.children) b.classList.add('neuf'); // le rond jaune, jusqu'au premier son
}
function jouerFete(i) {
  const f = FETE[i]; if (!f || !ac || $('jam').classList.contains('cache')) return;
  const ms = performance.now(); if (ms - (G.jamDernier[i] || 0) < 90) return; G.jamDernier[i] = ms; // pas plus de 11 fois par seconde
  if (!G.jamFait) { G.jamFait = true; for (const b of $('jam').children) b.classList.remove('neuf'); }
  const t = ac.currentTime + 0.005, now = entendu();
  f.son(t, Musique.tonsChant(t));
  G.tChante = now; Barde.jouer(f.gros ? 'repousse' : 'gratte', now);
  if (G.jam.length > 40) G.jam.splice(0, G.jam.length - 40);
  const dep = (k, d) => ({ fx: f.fx === 'triple' ? 'eclair' : f.fx, col: f.col, gros: !!f.gros, t0: now + d, tImpact: now + d + ({ aura: 0.34, rayon: 0.05, notes: 0.42 }[f.fx] || 0.03), k, fait: false, seed: Math.random() * 1000 });
  if (f.fx === 'triple') [0, 0.14, 0.28].forEach((d, k) => G.jam.push(dep(k, d)));
  else if (f.fx === 'notes') [0, 0.06, 0.12].forEach((d, k) => G.jam.push(dep(k, d)));
  else G.jam.push(dep(0, 0));
  if (f.fx === 'aura') onde(L.bardeX, L.bardeY - 50, 'rgba(255,215,80,.95)', 120, 0.45);
}
function impactFete(e, now) {
  const T0 = Gros.point('tete', W / 2, L.grosY), tx = T0.x, ty = T0.y;
  G.tFlashCasque = now; G.secoue = Math.max(G.secoue, e.gros ? 0.75 : 0.25);
  if (now - (G.tSursaut || -9) > 0.3) { G.tSursaut = now; G.tGesteG = now; Gros.jouer('sursaut', now, Math.random() < 0.5 ? -1 : 1); I.grosMetal(ac.currentTime + 0.01, 0.4); }
  onde(tx, ty, e.col, e.gros ? 130 : 70, e.gros ? 0.55 : 0.4);
  for (let i = 0; i < (e.gros ? 22 : 12); i++) {
    const a = Math.random() * TAU, v = 90 + Math.random() * (e.gros ? 260 : 170);
    G.eclats.push({ x: tx, y: ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: 0, vr: 0, t0: now, col: i % 3 ? e.col : '#ffffff', taille: 2.5, etincelle: true });
  }
}
// un éclair entre deux points : trois traits (la lueur, la couleur, le cœur blanc), sans ombre portée (trop chère sur une tablette)
function foudre(x0, y0, x1, y1, rgb, a, ep = 3, ecart = 30, branches = true) {
  const n = 10, px = -(y1 - y0), py = x1 - x0, pl = Math.hypot(px, py) || 1, pts = [[x0, y0]];
  for (let i = 1; i < n; i++) { const k = i / n, off = (Math.random() - 0.5) * ecart * Math.sin(k * Math.PI); pts.push([x0 + (x1 - x0) * k + px / pl * off, y0 + (y1 - y0) * k + py / pl * off]); }
  pts.push([x1, y1]);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [lw, col] of [[ep * 3.2, `rgba(${rgb},${0.22 * a})`], [ep * 1.5, `rgba(${rgb},${0.9 * a})`], [ep * 0.55, `rgba(255,255,255,${a})`]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
  if (branches) { g.lineWidth = 1.6; g.strokeStyle = `rgba(${rgb},${0.8 * a})`; for (const i of [3, 7]) { const [x, y] = pts[i]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 50, y + 14 + Math.random() * 26); g.stroke(); } }
}
const RGB_FETE = { '#ffd23f': '255,210,63', '#ff5a5a': '255,90,90', '#5ad1ff': '90,209,255', '#c08bff': '192,139,255', '#ff9a3c': '255,154,60', '#9cff9c': '156,255,156' };
function dessinerFete(now) {
  const sx = L.bardeX + 6, sy = L.bardeY - 48, T0 = Gros.point('tete', W / 2, L.grosY), tx = T0.x, ty = T0.y; // ça part du luth, ça arrive sur le casque
  G.jam = G.jam.filter(e => now - e.t0 < 0.8);
  for (const e of G.jam) {
    if (now < e.t0) continue;
    if (!e.fait && now >= e.tImpact) { e.fait = true; impactFete(e, now); }
    const u = (now - e.t0), rgb = RGB_FETE[e.col] || '255,255,255';
    if (e.fx === 'eclair') { const vie = e.gros ? 0.38 : 0.28; if (u <= vie) foudre(sx, sy, tx, ty, rgb, 1 - u / vie, e.gros ? 4.2 : 2.8, e.gros ? 46 : 30); }
    else if (e.fx === 'aura') { // la boule de lumière qui file, avec sa traîne
      const d = 0.34; if (u > d + 0.05) continue;
      const k = Math.min(1, u / d), ek = k * k * (3 - 2 * k), sp = Ou.lueur(26, rgb, 1, 1, 1);
      for (let j = 4; j >= 0; j--) { const kk = Math.max(0, ek - j * 0.07); Ou.poser(g, sp, sx + (tx - sx) * kk, sy + (ty - sy) * kk - Math.sin(kk * Math.PI) * 50, 1 - j * 0.15, (1 - j / 5) * 0.9); }
    } else if (e.fx === 'rayon') { // le grand rayon
      const vie = 0.42; if (u > vie) continue;
      const a = 1 - u / vie, w = 34 * a + 4, dx = tx - sx, dy = ty - sy, dl = Math.hypot(dx, dy), nx = -dy / dl * w / 2, ny = dx / dl * w / 2;
      g.fillStyle = `rgba(${rgb},${a * 0.5})`; g.beginPath(); g.moveTo(sx + nx, sy + ny); g.lineTo(tx + nx * 0.6, ty + ny * 0.6); g.lineTo(tx - nx * 0.6, ty - ny * 0.6); g.lineTo(sx - nx, sy - ny); g.closePath(); g.fill();
      g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy); g.lineTo(tx, ty); g.stroke();
    } else if (e.fx === 'notes') { // trois notes qui volent en arc
      const d = 0.42; if (u > d + 0.05) continue;
      const k = Math.min(1, u / d), cote = (e.k - 1) * 70, x = sx + (tx - sx) * k + Math.sin(k * Math.PI) * cote, y = sy + (ty - sy) * k - Math.sin(k * Math.PI) * 40;
      Ou.poser(g, Ou.lueur(14, rgb, 1, 0.4, 1), x, y, 1, 0.8); D.noteMus(g, x, y, 2.6, e.col);
    }
  }
}

// ---------------- fin de partie ----------------
function victoire() {
  if (G.victoire) return;
  G.victoire = true; G.mode = 'victoire'; G.fete = true; G.secoue = 1; G.fissures = 5;
  texte('LE TUBE DE L\'ÉTÉ !', W / 2, L.placeY0 + 110, '#ffd23f', 36, 3.5, 0.3);
  texte('Grosbec se bouche les oreilles…', W / 2, L.placeY0 + 146, '#ffffff', 16, 3, 0.6);
  texte('À toi de mettre le feu, Barde : chaque son file droit sur Grosbec !', W / 2, L.bardeY - 160, '#ffe28a', 17, 5, 3);
  $('cmd').classList.add('cache');
  montrerFete();
}
function malDeTete() {
  G.fete = false; G.tMalTete = entendu(); G.secoue = 1.2;
  texte('Grosbec : « Aïe… ma tête… »', W / 2, L.placeY0 + 40, '#ffb3a0', 20, 4, 0.8);
}
function defaite() {
  G.etat = 'fin'; Musique.couper(ac.currentTime); I.rate(ac.currentTime + 0.15);
  $('cmd').classList.add('cache');
  setTimeout(() => ecranFin(false), 2300);
}
function ecranFin(gagne) {
  G.etat = 'fin'; $('jam').classList.add('cache');
  const min = Math.round((performance.now() - G.st.debut) / 60000 * 10) / 10;
  $('finTitre').textContent = gagne ? 'Grosbec a mal à la tête !' : 'Les golems ont eu le dernier mot…';
  $('finTexte').textContent = gagne ? 'La musique a été plus forte que lui : il se tient le casque à deux mains. Le Barde a gagné son combat.'
    : `Acte ${ROMAIN[G.acte]}, ils dansaient mieux que toi. Pas pour longtemps : on reprend au début de l'acte ?`;
  const st = [[G.st.megas, G.st.megas > 1 ? 'méga refrains' : 'méga refrain'], [G.st.tues, 'golems'], [String(min).replace('.', ',') + ' min', 'de combat']];
  $('finStats').innerHTML = st.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
  $('finNote').textContent = '';
  $('finCode').classList.toggle('cache', !gagne); $('fin').classList.toggle('fete', gagne);
  $('finStats').classList.toggle('cache', gagne); $('finTexte').classList.toggle('cache', gagne);
  $('bRejouer').textContent = gagne || G.acte === 0 ? 'Rejouer' : 'Reprendre à l\'acte ' + ROMAIN[G.acte];
  $('bDebut').classList.toggle('cache', gagne || G.acte === 0);
  $('fin').classList.remove('cache');
}

// ---------------- les effets ----------------
function texte(txt, x, y, col, taille, dur, retard = 0) {
  txt = txt.replace(/ ([!?:;»…])/g, '\u202f$1').replace(/« /g, '«\u202f');
  G.textes.push({ txt, x, y, col, taille, dur, t0: (ac ? entendu() : 0) + retard }); }
function onde(x, y, col, rmax, dur) { G.ondes.push({ x, y, col, rmax, dur, t0: entendu() }); }

// ---------------- le robot (pour tester) ----------------
function robot(now) {
  const rb = G.robot; if (!rb || G.etat !== 'jeu') return;
  const jit = () => (Math.random() * 2 - 1) * rb.precision;
  if (G.mode === 'combat') {
    const b = G.temps[0]; if (!b || relanceSec(b.sec) || b.sec === 'V' || rb.dernier === b.n) return;
    if (b.t - now > 0.02) return;
    rb.dernier = b.n;
    if (Math.random() > rb.assiduite) return;
    const n = b.n, ok = x => G.boutons.includes(x) && dispo(x, n);
    const vis = G.sbires.filter(s => !s.mort);
    let type = 'note';
    if (ok('vague') && G.proj.some(p => p.etat === 'aller' && distB(p.x, p.y) < R.R_VAGUE - 20)) type = 'vague';
    else if (ok('stop') && vis.some(s => s.type === 'fonceur' && !s.gele && (s.etat === 'charge' || s.etat === 'gratte'))) type = 'stop';
    else if (ok('repousse') && (vis.filter(s => menace(s, n) && distB(s.x, s.y) < R.R_REPOUSSE).length >= 2 ||
      vis.some(s => s.type === 'bouclier' && !s.sansBouclier && distB(s.x, s.y) < R.R_REPOUSSE - 10))) type = 'repousse';
    else if (ok('stop') && vis.some(s => s.type === 'gros' && menace(s, n))) type = 'stop';
    agir(type, null, 0, b.t + jit());
  } else if (G.mode === 'relance' && G.relance) {
    for (const n of G.relance.notes) if (n.etat === 0 && !n.robot && n.t - now < 0.015 && n.t - now > -0.05) {
      n.robot = true; if (Math.random() < rb.solo) frapperCouloir(n.lane, 0, n.t + jit());
    }
  }
}

// ---------------- la boucle ----------------
let dernier = 0;
function boucle() {
  requestAnimationFrame(boucle);
  const now = ac ? entendu() : performance.now() / 1000;
  if (ac && G.etat === 'jeu') {
    Musique.planifier(ac);
    traiterTemps(now);
    robot(now);
    logiqueCombat(now);
    if (G.relance && G.mode === 'relance') for (const n of G.relance.notes) if (n.etat === 0 && now > n.t + R.S_BIEN) { n.etat = -1; G.relance.serie = 0; }
    G.sbires = G.sbires.filter(s => !s.mort);
    if (G.victoire && G.tFinEcran && performance.now() > G.tFinEcran) { G.tFinEcran = 0; ecranFin(true); }
    majRecharges(now);
  } else if (ac && G.etat === 'fin') traiterTemps(now);
  const dt = Math.min(0.05, Math.max(0, now - dernier)); dernier = now;
  G.secoue = Math.max(0, G.secoue - dt * 3);
  dessiner(now);
  surveiller();
  Barde.calme = G.etat !== 'jeu'; // (les images du Barde : vite pendant les règles et la pause, doucement pendant le combat)
  if (Golems.file) Golems.precuire(G.etat === 'jeu' ? (Q.ips > 50 ? 3 : 1) : 8); // on cuit d'avance les golems de l'acte, un peu à chaque image
}
const IDS = { note: 'bNote', repousse: 'bRep', stop: 'bStop', vague: 'bVague' };
function majRecharges(now) {
  const b = G.beat; if (!b) return;
  const pos = b.n + Math.max(0, now - b.t) / b.P;
  for (const k of G.boutons) { const f = Math.max(0, Math.min(1, (pos - G.recharge[k] - 0.5) / (R.RECHARGE[k] - 0.5))); $(IDS[k]).style.setProperty('--cd', R.RECHARGE[k] > 1 ? f.toFixed(3) : 1); }
}

// ---------------- le dessin ----------------
function dessiner(now) {
  const sh = G.secoue * 6;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (fondC) g.drawImage(fondC, sh > 0.1 ? Math.round((Math.random() - 0.5) * sh * K) : 0, sh > 0.1 ? Math.round((Math.random() - 0.5) * sh * K) : 0); // le décor, recopié tel quel
  g.setTransform(K, 0, 0, K, 0, 0);
  if (sh > 0.1) g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
  const b = G.beat, joue = G.etat !== 'intro' && (G.mode === 'combat' || G.mode === 'relance' || G.mode === 'victoire');
  const pul = b && joue ? Math.exp(-(now - b.t) * 9) : 0;
  const nv = G.etat === 'intro' ? 0 : niveauDe(G.ferveur);
  // la fête de lumière : elle monte en une demi-seconde quand le méga refrain (ou le tube) commence
  const eclat = (G.enMega || G.fete) && G.etat !== 'intro', dtF = Math.min(0.1, Math.max(0, now - (dessiner.t || now))); dessiner.t = now;
  G.feteF = Math.max(0, Math.min(1, (G.feteF || 0) + (eclat ? dtF * 2.2 : -dtF * 1.6)));
  if (!SANS.includes('lum')) Decor.lumieres(g, now, pul, G.mode === 'combat' || G.fete ? nv : 0, G.feteF, Q.n);
  for (let k = 0; k < 2; k++) Decor.porte(g, k, ouverture(k, now)); // les portes de bronze : le rouge des forges quand elles s'ouvrent
  G.chocs = G.chocs.filter(c => now - c.t0 < 0.45); for (const c of G.chocs) Decor.cercle(g, c.x, c.y, 1 - (now - c.t0) / 0.45); // là où un golem vient de retomber
  Decor.spots(g, now, pul, G.feteF, Q.n, b ? b.n : 0);
  // la portée de la voix
  if (G.mode === 'combat' && G.etat === 'jeu') {
    g.strokeStyle = `rgba(255,236,170,${0.16 + pul * 0.1})`; g.lineWidth = 2; g.setLineDash([4, 10]);
    g.beginPath(); g.arc(L.bardeX, L.bardeY - 30, L.portee, Math.PI * 1.02, Math.PI * 1.98); g.stroke(); g.setLineDash([]);
  }
  // Grosbec : son état, puis sa toile recopiée
  const V = G.vague, colere = G.victoire ? 1 : V ? Math.min(1, V.i / Math.max(1, V.groupes.length)) * (0.5 + G.acte * 0.17) : 0;
  const phase = b && joue ? Math.max(0, Math.min(0.999, (now - b.t) / b.P)) : 0, nTemps = b ? b.n : 0; // où on en est dans le temps de musique (0 : il vient de tomber)
  const folie = G.acte >= 3 && G.feteF > 0.5; // les refrains du dernier acte, et la fête de la fin : tout le monde danse à fond
  const etatG = { pul, phase, n: nTemps, mega: G.feteF, folie: folie && G.mode === 'combat', P: b ? b.P : 0.5, mode: G.mode, colere: G.mode === 'silence' ? 1 : colere, fissures: G.victoire ? 5 : G.fissures,
    oreilles: (G.mode === 'relance' && G.relance && G.relance.k === 4) || (G.victoire && !G.tMalTete), malTete: !!G.tMalTete, sonne: !!b && b.n < G.grosSonneFin && G.mode === 'combat' };
  const vif = folie || G.mode === 'silence' || etatG.oreilles || now - G.tGesteG < 1.4 || now - G.tFlashCasque < 0.6;
  if (!SANS.includes('gros')) { Gros.rafraichir(now, etatG, (vif ? [10, 12, 15, 20] : [8, 9, 12, 15])[Q.n]); Gros.dessiner(g, W / 2, L.grosY); }
  if (Gros.orbe > 0.03) { // la décharge qui se charge entre ses mains
    const a = Gros.point('mainG', W / 2, L.grosY), c = Gros.point('mainD', W / 2, L.grosY), o = Gros.orbe, ox = (a.x + c.x) / 2, oy = (a.y + c.y) / 2 - 8;
    Ou.poser(g, Ou.lueur(60, '255,214,110', 1, 0.9, 1), ox, oy, (0.35 + o * 0.6) * (1 + 0.12 * Math.sin(now * 40)), 0.9);
    for (let i = 0; i < 5; i++) { const an = now * 9 + i * 1.26, rr = (28 - o * 14) * (1 + 0.3 * Math.sin(now * 13 + i)); Ou.poser(g, Ou.lueur(8, '255,244,200', 1, 1, 1), ox + Math.cos(an) * rr, oy + Math.sin(an) * rr * 0.7, 0.9, 0.9); }
  }
  if (now - G.tFlashCasque < 0.45) { const q = Gros.point('tete', W / 2, L.grosY); Ou.poser(g, Ou.lueur(60, '255,240,200', 1, 0.9, 1), q.x, q.y, 1.1, 1 - (now - G.tFlashCasque) / 0.45); }
  // la poussière sous les grands pieds
  G.pouss = G.pouss.filter(p => now - p.t0 < 0.3);
  if (Q.n >= 1) for (const p of G.pouss) { const u = (now - p.t0) / 0.3; if (u >= 0) Ou.poser(g, Ou.lueur(40, '190,200,200', 0.42, 0.25, 1), p.x, p.y + 2, (0.35 + u * 0.75) * p.r / 16 * Decor.ech(p.y), 0.55 * (1 - u)); }
  for (const sl of G.sols) { const dl = Golems.dalle(), k = Decor.ech(sl.y); g.drawImage(dl.c, sl.x - dl.ox * k, sl.y - dl.oy * k, dl.w * k, dl.h * k); }
  // les personnages, du fond vers le devant (plus de métronome : Romain, 24 nov., 21 h)
  const liste = G.sbires.map(s => ({ y: drawY(s, now), s }));
  liste.push({ y: L.bardeY, barde: true });
  liste.sort((a, c) => a.y - c.y);
  for (const it of liste) {
    if (it.barde) {
      if (G.feteF > 0.02) Ou.poser(g, Ou.lueur(90, '255,215,90', 1, 0.5, 1), L.bardeX, L.bardeY - 40, 1, (0.5 + 0.3 * pul) * G.feteF);
      // le Barde, de dos, en volume ; à partir de l'acte III, il joue du synthé (le luth passe dans son dos)
      const chante = Math.max(0, 1 - (now - G.tChante) / 0.3), mal = Math.max(0, 1 - (now - G.tMal) / 0.5);
      if (chante > 0.02) Ou.poser(g, Ou.lueur(60, '255,220,130', 1, 0.5, 1), L.bardeX, L.bardeY - 60, 0.9 + chante * 0.3, chante * 0.55);
      if (!Barde.dessiner(g, L.bardeX + (mal > 0 ? Math.sin(now * 60) * 2.5 * mal : 0), L.bardeY, 1, now, { synthe: G.acte >= 2, pul, phase, n: nTemps, danse: G.feteF > 0.5, folie, fixe: !b || !joue || G.mode === 'silence' }))
        D.barde(g, L.bardeX, L.bardeY, { bob: pul, chante, spin: 0, joue: G.mode === 'relance' || G.fete, mal, t: now });
      if (mal > 0.05) Ou.poser(g, Ou.lueur(60, '255,70,60', 1, 0.3, 1), L.bardeX, L.bardeY - 60, 1.1, mal * 0.6);
      continue;
    }
    dessinerSbire(it.s, it.y, now, pul);
  }
  // les projectiles : l'éclat de braise du frondeur, la décharge de lumière de Grosbec
  for (const p of G.proj) {
    let x, y; const tete = Gros.point('tete', W / 2, L.grosY);
    if (p.etat === 'retour') {
      const u = Math.min(1, (now - p.tRetour) / 0.32), sx = p.source === 'grosbec' ? tete.x : p.source.x, sy = p.source === 'grosbec' ? tete.y : p.source.y - 30;
      x = p.rx + (sx - p.rx) * u; y = p.ry + (sy - p.ry) * u;
    } else { x = drawPX(p, now); y = drawPY(p, now); }
    const k = Decor.ech(y);
    if (p.etat === 'aller' && distB(x, y) < R.R_VAGUE) { g.strokeStyle = `rgba(120,190,255,${0.4 + 0.4 * pul})`; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 16 * k, 0, TAU); g.stroke(); }
    if (p.type === 'plume') { // une boule de lumière, de plus en plus grosse en approchant, avec sa traîne
      const av = Math.min(1, p.k / p.pas), gr = (0.55 + av * 0.75) * (1 + 0.1 * Math.sin(now * 38));
      if (p.etat !== 'retour') for (let i = 3; i >= 1; i--) Ou.poser(g, Ou.lueur(34, '255,196,84', 1, 0.5, 1), x + (p.px - x) * i * 0.3, y + (p.py - y) * i * 0.3 - 6, gr * (1 - i * 0.2), 0.3);
      Ou.poser(g, Ou.lueur(46, p.etat === 'retour' ? '120,200,255' : '255,206,96', 1, 1, 1), x, y - 6, gr, 1);
      Ou.poser(g, Ou.lueur(40, '255,70,36', 0.42, 0.3, 1), x, y + 22 * k, gr * 0.9, 0.5); // sa lueur sur les dalles
      for (let i = 0; i < 4; i++) { const an = now * 11 + i * 1.57; Ou.poser(g, Ou.lueur(7, '255,250,220', 1, 1, 1), x + Math.cos(an) * 15 * gr, y - 6 + Math.sin(an) * 11 * gr, 1, 0.95); }
    } else {
      const e = Golems.eclat(), rot = now * 9;
      Ou.poser(g, Ou.lueur(26, '255,96,40', 1, 0.5, 1), x, y, k, 0.7);
      g.save(); g.translate(x, y); g.rotate(p.etat === 'retour' ? -rot : rot); g.drawImage(e.c, -e.ox * k, -e.oy * k, e.w * k, e.h * k); g.restore();
    }
  }
  // les notes qui volent
  G.notesVol = G.notesVol.filter(nv => now - nv.t0 < nv.d + 0.05);
  for (const nv of G.notesVol) {
    const u = Math.min(1, (now - nv.t0) / nv.d); const x = nv.x0 + (nv.x1 - nv.x0) * u, y = nv.y0 + (nv.y1 - nv.y0) * u - Math.sin(u * Math.PI) * 26;
    if (nv.q === 4) { g.strokeStyle = '#bff4ff'; g.lineWidth = 3; g.beginPath(); g.arc(x, y + 4, 9, Math.PI, TAU); g.stroke(); D.ell(g, x, y + 2, 2.6, 2.6, '#bff4ff'); }
    else D.noteMus(g, x, y, nv.q === 3 ? 3 : 1.5, nv.q >= 2 ? '#ffe28a' : '#ffffff');
  }
  // les éclats
  G.eclats = G.eclats.filter(e => now - e.t0 < 0.9);
  for (const e of G.eclats) {
    const t = Math.max(0, now - e.t0), x = e.x + e.vx * t, y = e.y + e.vy * t + (e.etincelle ? 200 : 420) * t * t;
    g.globalAlpha = Math.max(0, 1 - t / 0.9); g.fillStyle = e.col;
    g.save(); g.translate(x, y); g.rotate(e.rot + e.vr * t); g.fillRect(-e.taille, -e.taille * 0.6, e.taille * 2, e.taille * 1.2); g.restore();
  }
  g.globalAlpha = 1;
  G.ondes = G.ondes.filter(o => now - o.t0 < o.dur);
  for (const o of G.ondes) { const u = Math.max(0.001, (now - o.t0) / o.dur); g.strokeStyle = o.col; g.globalAlpha = 1 - u; g.lineWidth = 4 * (1 - u) + 1; g.beginPath(); g.ellipse(o.x, o.y, o.rmax * u, o.rmax * u * 0.7, 0, 0, TAU); g.stroke(); }
  g.globalAlpha = 1;
  Decor.faisceaux(g, G.feteF, Q.n);
  confettis(now);
  if (G.jam.length) dessinerFete(now);
  if (G.mode === 'relance' && G.relance) dessinerRelance(now);
  hud(now, pul);
  G.textes = G.textes.filter(t => now - t.t0 < t.dur);
  g.textAlign = 'center';
  for (const t of G.textes) {
    const u = (now - t.t0) / t.dur; if (u < 0) continue;
    g.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1;
    g.font = `700 ${t.taille}px Fredoka`; g.lineWidth = 4; g.strokeStyle = 'rgba(10,6,20,.85)';
    const y = t.y - u * 18;
    for (const [ligne, dy] of couper(t.txt, t.taille)) {
      const lw = g.measureText(ligne).width / 2, x = Math.max(8 + lw, Math.min(W - 8 - lw, t.x)); // jamais hors de l'écran
      g.strokeText(ligne, x, y + dy); g.fillStyle = t.col; g.fillText(ligne, x, y + dy);
    }
  }
  g.globalAlpha = 1;
}
function couper(txt, taille) { // un texte trop long passe sur deux lignes
  if (txt.length * taille * 0.5 < W - 40) return [[txt, 0]];
  const mots = txt.split(' '), m = Math.ceil(mots.length / 2);
  return [[mots.slice(0, m).join(' '), -taille * 0.6], [mots.slice(m).join(' '), taille * 0.6]];
}
const COUL_CONF = ['#ffd23f', '#ff5a8a', '#5ad1ff', '#9cff9c', '#c08bff', '#ff9a3c'];
function confettis(now) {
  const dt = Math.min(0.05, Math.max(0, now - (confettis.t || now))); confettis.t = now;
  if ((G.enMega || G.fete) && G.etat !== 'intro') for (let k = 0; k < dt * [16, 26, 38, 45][Q.n]; k++) if (G.confettis.length < [50, 90, 130, 160][Q.n])
    G.confettis.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 40, vy: 70 + Math.random() * 90, r: Math.random() * 6, vr: (Math.random() - 0.5) * 8, c: COUL_CONF[(Math.random() * 6) | 0], s: 3 + Math.random() * 3 });
  for (const c of G.confettis) { c.x += (c.vx + Math.sin(now * 3 + c.r) * 30) * dt; c.y += c.vy * dt; c.r += c.vr * dt; }
  G.confettis = G.confettis.filter(c => c.y < H + 10);
  for (const c of G.confettis) { const co = Math.cos(c.r), si = Math.sin(c.r); g.setTransform(K * co, K * si, -K * si, K * co, K * c.x, K * c.y); g.fillStyle = c.c; g.fillRect(-c.s, -c.s * 0.5, c.s * 2, c.s); }
  g.setTransform(K, 0, 0, K, 0, 0);
}
function dessinerMetronome(now, b, joue) {
  const A = 0.55;
  let ang = 0, coup = 0, cote = 0;
  if (b && joue && G.etat !== 'intro') {
    const u = Math.max(0, Math.min(1, (now - b.t) / b.P)), sd = b.n % 2 ? 1 : -1;
    ang = A * sd * (1 - 2 * u); coup = Math.exp(-(now - b.t) * 10); cote = sd;
    if (now - G.tCoeurRouge < 0.3) coup = 0;
  }
  g.save(); g.translate(L.metroX, L.metroY); g.scale(1.05, 1.05);
  D.ell(g, 0, 2, 34, 8, 'rgba(0,0,0,.35)');
  D.metronome(g, 0, 0, ang, coup, cote, A);
  if (now - G.tCoeurRouge < 0.3) { g.globalAlpha = 1 - (now - G.tCoeurRouge) / 0.3; D.ell(g, 0, -30, 34, 40, 'rgba(255,60,60,.5)'); g.globalAlpha = 1; }
  g.restore();
}
function dessinerSbire(s, yy, now, pul) {
  const b = G.beat, T = D.TYPES[s.type], sc = Decor.ech(yy) * 1.45, u = (now - s.tBouge) / 0.16;
  let x = drawX(s, now), y = yy - (u > 0 && u < 1 ? Math.sin(u * Math.PI) * 3 : 0);
  // le pas : tout le monde tape du même pied, pile sur le temps (0 : le pied vient de taper… 4 : l'autre pied est levé, prêt pour le temps suivant)
  const phi = b ? Math.max(0, Math.min(0.999, (now - b.t) / b.P)) : 0.4;
  let k = phi < 0.12 ? 0 : phi < 0.3 ? 1 : phi < 0.55 ? 2 : phi < 0.8 ? 3 : 4, etat = 'marche';
  const pied = b ? b.n % 2 : 0;
  if (G.mode !== 'combat' || s.sonne || s.gele) k = 2;
  if (s.etat === 'arme' && !s.sonne && !s.gele) { etat = 'arme'; k = 0; x += Math.sin(now * 46) * 0.8; }
  if (s.etat === 'frappe' && now - s.tFrappe < 0.28) { etat = 'frappe'; k = 0; const kk = 1 - (now - s.tFrappe) / 0.28; const dx = L.bardeX - x, dy = L.bardeY - y, d = Math.hypot(dx, dy) || 1; x += dx / d * 10 * kk; y += dy / d * 10 * kk; }
  if (s.type === 'lanceur' && now - (s.tFrappe || -9) < 0.25) { etat = 'frappe'; k = 0; }
  if (s.type === 'fonceur' && !s.gele) { if (s.etat === 'gratte') { etat = 'gratte'; k = Math.floor(now * 7) % 2; } else if (s.etat === 'charge') { etat = 'charge'; k = 0; } }
  if (s.type === 'danseur' && s.tourne && !s.gele && b && now - b.t < 0.35 && G.mode === 'combat') { etat = 'tourne'; k = Math.floor((now - b.t) / 0.35 * 4) % 4; }
  const versBarde = L.bardeX - x, yaw = versBarde > 64 ? 1 : versBarde < -64 ? -1 : 0; // il se tourne vers le Barde
  const o = { yaw, etat, k, pied, sansBouclier: s.sansBouclier, gele: s.gele };
  if (s.sonne && !s.gele) x += Math.sin(now * 24 + s.id) * 1.4;
  // il arrive : par une porte (il sort du rouge des forges), ou d'en haut (il saute de la galerie et retombe sur les dalles)
  const ne = (now - s.tNe) / 0.42, leve = 1; let voile = 1;
  if (ne < 1 && s.entree) {
    const u = Math.max(0, ne);
    if (s.entree.chute) { const c = s.entree.chute; D.ell(g, x, y + 2, T.r * 1.4 * sc * u, T.r * 0.45 * sc * u, `rgba(0,0,0,${0.5 * u})`); x = c.x0 + (x - c.x0) * u; y = c.y0 + (y - c.y0) * u * u - Math.sin(u * Math.PI) * 46; o.etat = 'arme'; o.k = 0; }
    else { y -= 16 * (1 - u); voile = 0.25 + 0.75 * u; }
  } else if (s.entree) { if (s.entree.chute) { G.chocs.push({ x: s.x, y: s.y, t0: now }); G.secoue = Math.max(G.secoue, 0.35); if (ac) I.choc(ac.currentTime + 0.01, T.r / 18); } s.entree = null; }
  if (voile < 1) g.globalAlpha = voile;
  const haut = SANS.includes('golems') ? y - 40 : Golems.dessiner(g, s.type, x, y, sc, o, leve);
  if (voile < 1) g.globalAlpha = 1;
  const flash = Math.max(0, 1 - (now - s.tFlash) / 0.12);
  if (flash > 0.05) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = flash * 0.8; Golems.dessiner(g, s.type, x, y, sc, o, leve); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } // touché : il s'illumine
  const pos = { tete: haut + 6 * sc };
  const alerte = (s.etat === 'arme' && !s.sonne && !s.gele) || (s.type === 'fonceur' && s.etat === 'gratte' && !s.gele);
  if (alerte && G.mode === 'combat') {
    const k = Math.max(0, Math.min(1, (now - (s.tArme || s.tBouge)) / (s.P || 0.5)));
    const col = s.type === 'lanceur' ? '255,170,60' : '255,60,60';
    g.strokeStyle = `rgba(${col},${0.5 + 0.5 * k})`; g.lineWidth = 2.5;
    const rr = D.TYPES[s.type].r * Decor.ech(y);
    g.beginPath(); g.ellipse(x, y, rr * (2.4 - k * 1.2), rr * (0.9 - k * 0.45), 0, 0, TAU); g.stroke();
    g.fillStyle = `rgb(${col})`; D.rr(g, x - 11, pos.tete - 30, 22, 22, 8); g.fill();
    g.fillStyle = '#fff'; g.font = '700 17px Fredoka'; g.textAlign = 'center'; g.fillText(s.type === 'fonceur' ? '!!' : '!', x, pos.tete - 13);
  }
  if (s.gele) { g.strokeStyle = '#bff4ff'; g.lineWidth = 3; g.beginPath(); g.arc(x, pos.tete - 14, 10, Math.PI, TAU); g.stroke(); D.ell(g, x, pos.tete - 16, 2.6, 2.6, '#bff4ff'); }
  else if (s.sonne && G.mode === 'combat') for (let i = 0; i < 3; i++) {
    const a = now * 5 + i * TAU / 3; g.fillStyle = '#ffe28a'; g.font = '12px Fredoka'; g.textAlign = 'center';
    g.fillText('★', x + Math.cos(a) * 12, pos.tete - 6 + Math.sin(a) * 4);
  }
  if (G.mode !== 'combat') for (let i = 0; i < 2; i++) {
    const a = now * 2.4 + i * Math.PI + s.id; D.noteMus(g, x + Math.cos(a) * 14, pos.tete - 8 + Math.sin(a) * 5, 0.8, 'rgba(200,170,255,.9)');
  }
  if (s.pvMax > 1 && s.pv < s.pvMax) for (let i = 0; i < s.pvMax; i++) D.ell(g, x - (s.pvMax - 1) * 4 + i * 8, pos.tete - 8, 2.6, 2.6, i < s.pv ? '#ffb347' : 'rgba(255,255,255,.25)');
}

function hud(now, pul) { // tout dans les deux coins du haut : le milieu est à Grosbec
  if (G.etat === 'intro' || (G.etat === 'fin' && G.victoire)) return;
  const ecrit = (txt, x, y, col) => { g.strokeStyle = 'rgba(4,8,14,.8)'; g.lineWidth = 3; g.strokeText(txt, x, y); g.fillStyle = col; g.fillText(txt, x, y); };
  g.fillStyle = 'rgba(4,8,14,.5)'; D.rr(g, 6, 6, 92, 82, 14); g.fill(); D.rr(g, W - 100, 60, 94, 48, 14); g.fill();
  for (let i = 0; i < R.COEURS; i++) { // les cœurs : deux rangées de trois
    const plein = i < G.coeurs, sz = 1.2 + (plein ? pul * 0.18 : 0);
    D.coeur(g, 24 + (i % 3) * 27, 24 + Math.floor(i / 3) * 22, sz, plein ? '#ff4d6d' : 'rgba(255,255,255,.2)');
  }
  for (let k = 0; k < 4; k++) { // les quatre actes
    const x = 19 + k * 22, y = 71, fait = k < G.acte || G.victoire, ici = k === G.acte && !G.victoire;
    D.ell(g, x, y, ici ? 10 : 8.5, ici ? 10 : 8.5, fait ? '#c99a3a' : ici ? '#ffd23f' : 'rgba(255,255,255,.14)');
    g.fillStyle = ici || fait ? '#1a1030' : '#cbbbe8'; g.font = '700 10px Fredoka'; g.textAlign = 'center'; g.fillText(ROMAIN[k], x, y + 3.6);
  }
  // les instruments qui jouent : un, deux, trois, quatre… puis le méga refrain
  const nv = G.mode === 'combat' ? niveauDe(G.ferveur) : -1, x0 = W - 86;
  for (let i = 0; i < 4; i++) {
    const x = x0 + i * 22, y = 76, on = G.enMega || i <= nv;
    D.ell(g, x, y, 9.5 + (on ? pul * 1.4 : 0), 9.5 + (on ? pul * 1.4 : 0), G.enMega ? '#ffd23f' : on ? '#8b5cf6' : 'rgba(255,255,255,.12)');
    g.fillStyle = G.enMega ? '#1a1030' : on ? '#fff' : 'rgba(255,255,255,.3)'; g.font = '700 12px Fredoka'; g.textAlign = 'center';
    g.fillText(['♩', '♪', '♫', '♬'][i], x, y + 4.5);
  }
  g.font = '600 11px Fredoka'; g.textAlign = 'center';
  if (G.enMega) ecrit('MÉGA REFRAIN', x0 + 33, 101, '#ffd23f');
  else if (G.megaDemande) ecrit('ça monte…', x0 + 33, 101, `rgba(255,210,63,${0.5 + 0.5 * pul})`);
  else if (G.mode === 'combat') ecrit('série ' + G.combo, x0 + 33, 101, '#e6dcff');
}
function dessinerRelance(now) {
  const r = G.relance, y0 = L.soloY0, y1 = L.hitY + 50, k = r.k || 0, actifs = ACTIFS[Math.max(1, k)];
  const debut = r.notes.length ? r.notes[0].t - R.APP - 1 : now, entree = Math.min(1, Math.max(0, (now - debut) / 0.6));
  g.globalAlpha = entree;
  g.fillStyle = 'rgba(8,4,18,.72)'; g.fillRect(0, y0 - 30, W, H - y0 + 30);
  g.fillStyle = 'rgba(30,18,52,.92)'; g.beginPath();
  g.moveTo(soloX(-0.5, y0), y0); g.lineTo(soloX(3.5, y0), y0); g.lineTo(soloX(3.5, y1), y1); g.lineTo(soloX(-0.5, y1), y1); g.closePath(); g.fill();
  for (let l = 0; l < 4; l++) if (actifs.includes(l)) { g.fillStyle = 'rgba(255,255,255,.035)'; g.beginPath(); g.moveTo(soloX(l - 0.5, y0), y0); g.lineTo(soloX(l + 0.5, y0), y0); g.lineTo(soloX(l + 0.5, y1), y1); g.lineTo(soloX(l - 0.5, y1), y1); g.closePath(); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.5;
  for (let l = 0; l <= 4; l++) { g.beginPath(); g.moveTo(soloX(l - 0.5, y0), y0); g.lineTo(soloX(l - 0.5, y1), y1); g.stroke(); }
  // les temps qui défilent
  const bt = G.beat;
  if (bt) for (let i = 0; i < 8; i++) {
    const t = bt.t + i * bt.P, dtt = t - now; if (dtt < -0.1 || dtt > R.APP) continue;
    const y = soloY(dtt); g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(soloX(-0.5, y), y); g.lineTo(soloX(3.5, y), y); g.stroke();
  }
  for (const n of r.notes) {
    const dtt = n.t - now; if (dtt > R.APP || n.etat === 1 && dtt < -0.15) continue;
    if (n.etat === -1 && dtt < -0.4) continue;
    if (dtt + n.d < -0.3) continue;
    const y = soloY(dtt), x = soloX(n.lane, y), rr = soloLargeur(y) * 0.32;
    const yq = soloY(dtt + n.d);
    if (n.d > R.APP / 6) { const ya = dtt < 0 ? L.hitY : y; g.strokeStyle = COULOIRS[n.lane]; g.globalAlpha = entree * (n.etat === -1 ? 0.25 : 0.5); g.lineWidth = rr * 0.42; g.lineCap = 'round'; g.beginPath(); g.moveTo(soloX(n.lane, ya), ya); g.lineTo(soloX(n.lane, yq), yq); g.stroke(); g.globalAlpha = entree; }
    if (n.etat === 1) continue;
    const col = n.etat === -1 ? '#555' : COULOIRS[n.lane];
    D.ell(g, x, y + rr * 0.25, rr * 1.05, rr * 0.55, 'rgba(0,0,0,.4)');
    D.ell(g, x, y, rr, rr * 0.62, col);
    D.ell(g, x, y - rr * 0.12, rr * 0.62, rr * 0.3, 'rgba(255,255,255,.55)');
  }
  for (let l = 0; l < 4; l++) {
    const x = soloX(l, L.hitY), rr = 30, app = now - r.appuis[l] < 0.12, actif = actifs.includes(l);
    g.globalAlpha = entree * (actif ? 1 : 0.22);
    D.ell(g, x, L.hitY + 4, rr + 3, rr * 0.62 + 3, 'rgba(0,0,0,.5)');
    g.lineWidth = 5; g.strokeStyle = COULOIRS[l]; g.fillStyle = app && actif ? COULOIRS[l] : 'rgba(20,12,36,.95)';
    g.beginPath(); g.ellipse(x, L.hitY, rr, rr * 0.62, 0, 0, TAU); g.fill(); g.stroke();
    if (app && actif) D.ell(g, x, L.hitY, rr * 1.4, rr * 0.9, 'rgba(255,255,255,.18)');
    if (CLAVIER && actif) { g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '600 13px Fredoka'; g.textAlign = 'center'; g.fillText('DFJK'[l], x, L.hitY + 46); }
  }
  g.globalAlpha = entree;
  r.pops = r.pops.filter(p => now - p.t0 < 0.5);
  for (const p of r.pops) { const u = (now - p.t0) / 0.5; g.globalAlpha = entree * (1 - u); g.font = '700 15px Fredoka'; g.fillStyle = p.col; g.textAlign = 'center'; g.fillText(p.txt, soloX(p.lane, L.hitY), L.hitY - 40 - u * 20); }
  g.globalAlpha = entree;
  for (let i = 1; i <= 4; i++) { const x = W / 2 + (i - 2.5) * 26, ici = i === k; D.ell(g, x, y0 - 34, ici ? 8 : 6, ici ? 8 : 6, i < k ? '#c99a3a' : ici ? '#ffd23f' : 'rgba(255,255,255,.18)'); }
  if (k >= 1) {
    const ns = r.notes.filter(n => n.k === k && n.e === r.essai[k]), ok = ns.filter(n => n.etat === 1).length, faites = ns.filter(n => n.etat !== 0).length;
    g.font = '600 14px Fredoka'; g.fillStyle = '#fff'; g.textAlign = 'center';
    g.fillText(`${ok} / ${ns.length} notes` + (r.serie > 4 ? `  ·  série ${r.serie}` : ''), W / 2, y0 - 10);
    g.fillStyle = 'rgba(255,255,255,.15)'; D.rr(g, 40, y0 - 4, W - 80, 5, 2.5); g.fill();
    g.fillStyle = '#ffd23f'; D.rr(g, 40, y0 - 4, (W - 80) * faites / Math.max(1, ns.length), 5, 2.5); g.fill();
  }
  g.globalAlpha = 1;
}
// ---------------- les illustrations ----------------
function fondIllu(x) {
  x.setTransform(2, 0, 0, 2, 0, 0); x.fillStyle = '#2a2140'; x.fillRect(0, 0, 118, 96);
  for (let j = 0; j < 7; j++) for (let i = 0; i < 6; i++) { x.fillStyle = (i + j) % 2 ? '#3a3046' : '#433850'; D.rr(x, i * 21 - (j % 2) * 10, j * 14, 19, 12, 4); x.fill(); }
}
const tO = { hop: 0, bras: 0, flash: 0, coeur: 1, t: 1, bouclierHaut: true };
function bardeIllu(x, px, py, o) { x.save(); x.translate(px, py); x.scale(0.72, 0.72); D.barde(x, 0, 0, { bob: 0, chante: 0, spin: 0, joue: false, mal: 0, t: 0, ...o }); x.restore(); }
function illustrer(c, k) {
  const x = c.getContext('2d'); fondIllu(x);
  if (k === 1) {
    x.save(); x.translate(76, 62); x.scale(0.8, 0.8); x.globalAlpha = 0.35; D.automate(x, 'trotteur', 0, 0, tO); x.globalAlpha = 1; x.restore();
    x.save(); x.translate(100, 76); x.scale(0.8, 0.8); D.automate(x, 'trotteur', 0, 0, { ...tO, hop: 6 }); x.restore();
    x.strokeStyle = '#ffe28a'; x.lineWidth = 2; x.beginPath(); x.moveTo(80, 30); x.quadraticCurveTo(90, 20, 98, 34); x.stroke();
  } else if (k === 2) {
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.setLineDash([3, 6]); x.lineWidth = 1.5; x.beginPath(); x.arc(28, 70, 72, Math.PI * 1.1, Math.PI * 1.95); x.stroke(); x.setLineDash([]);
    bardeIllu(x, 28, 92, { chante: 1 });
    D.automate(x, 'soldat', 92, 62, { ...tO, flash: 0.6 });
    D.noteMus(x, 60, 26, 1.5, '#ffe28a');
    x.font = '700 12px Fredoka'; x.fillStyle = '#9cff9c'; x.textAlign = 'center'; x.fillText('Parfait !', 90, 14);
  } else if (k === 3) {
    bardeIllu(x, 30, 92, {});
    x.strokeStyle = 'rgba(255,140,80,.9)'; x.lineWidth = 2.5; x.beginPath(); x.ellipse(30, 62, 40, 26, 0, 0, TAU); x.stroke();
    D.automate(x, 'bouclier', 88, 50, { ...tO, sansBouclier: true, sonne: true });
    D.bouclierSol(x, 100, 84);
    x.font = '700 15px Fredoka'; x.fillStyle = '#ffe28a'; x.textAlign = 'center'; x.fillText('★', 82, 14);
  } else {
    const lx = l => 59 + (l - 1.5) * 24;
    x.fillStyle = '#1c1230'; x.beginPath(); x.moveTo(40, 0); x.lineTo(78, 0); x.lineTo(110, 96); x.lineTo(8, 96); x.fill();
    [[0, 30], [2, 46], [1, 62], [3, 18], [2, 8]].forEach(([l, y]) => { const w = 0.6 + y / 96; D.ell(x, 59 + (lx(l) - 59) * w, y, 7 * w, 4.4 * w, COULOIRS[l]); });
    for (let l = 0; l < 4; l++) { x.strokeStyle = COULOIRS[l]; x.lineWidth = 3; x.beginPath(); x.ellipse(59 + (lx(l) - 59) * 1.6, 84, 11, 7, 0, 0, TAU); x.stroke(); }
    D.guitareIcone(x, 16, 26, 0.9, '#ffd23f');
  }
}
function illuEnnemi(c, type) {
  const x = c.getContext('2d'); fondIllu(x);
  if (type === 'lanceur') {
    D.automate(x, 'lanceur', 34, 46, { ...tO, bras: 2 });
    D.boulon(x, 70, 56, 0.4, false); D.boulon(x, 92, 76, 1.2, true);
    x.strokeStyle = 'rgba(90,170,255,.9)'; x.lineWidth = 2.5; x.beginPath(); x.arc(104, 96, 30, Math.PI * 1.1, Math.PI * 1.6); x.stroke();
  } else if (type === 'fonceur') {
    D.automate(x, 'fonceur', 40, 60, { ...tO, gratte: true, t: 3 });
    D.automate(x, 'fonceur', 88, 82, { ...tO, gele: true });
    x.strokeStyle = '#bff4ff'; x.lineWidth = 2.5; x.beginPath(); x.arc(88, 26, 8, Math.PI, TAU); x.stroke(); D.ell(x, 88, 24, 2, 2, '#bff4ff');
  } else if (type === 'danseur') {
    D.automate(x, 'danseur', 40, 70, { ...tO, tourne: 0.2 });
    D.automate(x, 'danseur', 86, 70, tO);
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(40, 50, 20, 6, 0, 0, TAU); x.stroke();
  } else if (type === 'gros') {
    x.save(); x.translate(59, 90); x.scale(0.78, 0.78); D.automate(x, 'gros', 0, 0, { ...tO, bras: 1 }); x.restore();
  }
}

// ---------------- les commandes ----------------
function pointLogique(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / S, y: (e.clientY - r.top) / S }; }
function laneDepuisX(x) { return Math.max(0, Math.min(3, Math.round((x - W / 2) / 94 + 1.5))); }
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (G.etat !== 'jeu') return;
  const p = pointLogique(e), now = entendu();
  if (G.mode === 'relance') { if (p.y > L.soloY0 - 40) frapperCouloir(laneDepuisX(p.x), e.timeStamp); return; }
  let best = null, bd = 44;
  for (const s of G.sbires) { if (s.mort) continue; const d = Math.hypot(p.x - drawX(s, now), p.y - (drawY(s, now) - D.TYPES[s.type].haut * 0.5 * Decor.ech(s.y))); if (d < bd) { bd = d; best = s; } }
  agir('note', best, e.timeStamp);
});
function bouton(id, f) {
  const el = $(id);
  el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('appui'); f(e); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => el.addEventListener(t, () => el.classList.remove('appui')));
}
bouton('bNote', e => agir('note', null, e.timeStamp));
bouton('bRep', e => agir('repousse', null, e.timeStamp));
bouton('bStop', e => agir('stop', null, e.timeStamp));
bouton('bVague', e => agir('vague', null, e.timeStamp));
addEventListener('keydown', e => {
  if (e.repeat) return;
  const k = e.key;
  if (G.etat !== 'jeu' && !(G.etat === 'fin' && G.victoire && !$('jam').classList.contains('cache'))) return;
  if (G.mode === 'victoire' && !$('jam').classList.contains('cache')) {
    const i = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, a: 0, z: 1, e: 2, r: 3, t: 4, y: 5, ' ': 5 }[k.length === 1 ? k.toLowerCase() : k];
    if (i != null) { e.preventDefault(); jouerFete(i); }
    return;
  }
  if (k === 'Escape' || k === 'p' || k === 'P') { pause(); return; }
  if (G.mode === 'relance' && G.relance) {
    const i = { d: 0, f: 1, j: 2, k: 3, ' ': 1, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }[k.length === 1 ? k.toLowerCase() : k];
    if (i == null) return;
    e.preventDefault(); frapperCouloir(i, e.timeStamp); return;
  }
  const t = { ' ': 'note', Enter: 'note', a: 'vague', z: 'stop', e: 'repousse', q: 'vague', w: 'stop' }[k.length === 1 ? k.toLowerCase() : k];
  if (t) { e.preventDefault(); agir(t, null, e.timeStamp); }
});

function pause() {
  if (G.etat !== 'jeu' || G.mode === 'silence') return;
  G.etat = 'pause'; if (ac) ac.suspend();
  $('infoDecal').textContent = 'Décalage du son : ' + Math.round(G.decal * 1000) + ' ms.';
  // des chiffres à lire à Claude si le jeu rame (Romain, 24 nov., 22 h 25 : son iPhone ramait à l'acte III)
  $('infoMesures').textContent = 'Si ça rame, lis-moi ça : niveau ' + Q.n + ' · ' + (Q.ips || '?') + ' images par seconde · ' + Q.bas + ' baisse(s) · ' + Golems.cuits + ' images de golems (' + Golems.cuites + ' peintes) · acte ' + (G.acte + 1) + ' · écran ' + Math.round(K * 100) / 100 + '.';
  $('pause').classList.remove('cache');
}
function reprendre() { $('pause').classList.add('cache'); if (ac) ac.resume().then(() => { G.etat = 'jeu'; }); else G.etat = 'jeu'; }
$('bPause').addEventListener('click', () => { if (G.etat === 'jeu') pause(); });
$('bReprendre').addEventListener('click', reprendre);
/* (26 nov.) ouvert depuis la salle des jeux du site : un bouton pour y revenir */
if (/[?&]depuis=salle/.test(location.search)) { const bs = $('bSalle'); bs.hidden = false; bs.onclick = () => { location.href = 'salle.html'; }; }
$('bRecommencer').addEventListener('click', () => { $('pause').classList.add('cache'); nouvellePartie(0); });
$('bCouper').addEventListener('click', () => {
  $('pause').classList.add('cache');
  ac.resume().then(() => { G.etat = 'jeu'; if (G.mode === 'combat') { for (const s of G.sbires) tuer(s, ac.currentTime, 69, true); G.vague.i = G.vague.groupes.length; coupure(); } });
});
$('bMega').addEventListener('click', () => { G.ferveur = FER.MEGA - 1; reprendre(); setTimeout(() => majFerveur(1), 400); });
$('bActe').addEventListener('click', () => { $('pause').classList.add('cache'); nouvellePartie(Math.min(3, G.acte + 1)); });
$('bGo').addEventListener('click', () => nouvellePartie(0));
$('bRelancer').addEventListener('click', relancer);
$('bRejouer').addEventListener('click', () => nouvellePartie(G.victoire ? 0 : G.acte));
$('bDebut').addEventListener('click', () => nouvellePartie(0));
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

// le réglage du décalage (casque sans fil)
let calib = null;
function ouvrirCalib(depuis) {
  sonPret();
  calib = { depuis, t0: ac.currentTime, ecarts: [], clics: [] };
  $(depuis).classList.add('cache'); $('calib').classList.remove('cache');
  $('resCalib').textContent = 'Réglage actuel : ' + Math.round(G.decal * 1000) + ' ms.';
  $('pointsCalib').innerHTML = '<i></i>'.repeat(8);
  if (ac.state === 'suspended') ac.resume();
}
$('bReglerIntro').addEventListener('click', () => ouvrirCalib('intro'));
$('bRegler').addEventListener('click', () => ouvrirCalib('pause'));
$('bCalibGo').addEventListener('click', () => {
  if (!calib) return;
  const t = ac.currentTime + 0.5; calib.clics = []; calib.ecarts = [];
  for (let i = 0; i < 12; i++) { const ti = t + i * 0.5; I.tic(ti, true); I.kick(ti, 0.7, 0.5); calib.clics.push(ti); }
  $('pointsCalib').innerHTML = '<i></i>'.repeat(8);
  $('zoneCalib').textContent = 'Tape à chaque toc !';
  setTimeout(finCalib, (0.5 + 12 * 0.5 + 0.4) * 1000);
});
$('zoneCalib').addEventListener('pointerdown', e => {
  e.preventDefault(); if (!calib || !calib.clics.length) return;
  const tH = entenduA(e.timeStamp); let best = null;
  for (const c of calib.clics) { const d = tH - c; if (best == null || Math.abs(d) < Math.abs(best)) best = d; }
  $('zoneCalib').classList.add('toc'); setTimeout(() => $('zoneCalib').classList.remove('toc'), 90);
  if (best != null && Math.abs(best) < 0.3) {
    calib.ecarts.push(best);
    const pts = $('pointsCalib').children; if (pts[calib.ecarts.length - 1]) pts[calib.ecarts.length - 1].classList.add('ok');
  }
});
function finCalib() {
  if (!calib) return;
  const e = calib.ecarts.slice(2).sort((a, b) => a - b);
  calib.clics = [];
  if (e.length < 4) { $('zoneCalib').textContent = 'Pas assez de tapes. On recommence ?'; return; }
  G.decal = Math.max(-0.1, Math.min(0.35, e[Math.floor(e.length / 2)]));
  try { localStorage.setItem('barde-decal', String(G.decal)); } catch (x) {}
  $('zoneCalib').textContent = 'C\'est réglé !';
  $('resCalib').textContent = 'Décalage mesuré : ' + Math.round(G.decal * 1000) + ' ms.';
}
$('bCalibFin').addEventListener('click', () => {
  $('calib').classList.add('cache');
  if (!calib) return;
  if (calib.depuis === 'pause') { // le jeu n'a pas bougé pendant le réglage : on décale toutes ses heures
    const dt = ac.currentTime - calib.t0 + 0.05;
    Musique.M.nextT += dt; Musique.M.bars.forEach(x => x.t0 += dt);
    [...G.temps, ...G.passes].forEach(x => x.t += dt); if (G.beat && !G.passes.includes(G.beat)) G.beat.t += dt;
    G.frappes.forEach(f => f.t += dt); G.proj.forEach(p => { p.tBouge += dt; });
    G.sbires.forEach(s => { s.tBouge += dt; s.tArme = (s.tArme || 0) + dt; s.tFrappe = (s.tFrappe || 0) + dt; s.tNe += dt; s.tCoeur += dt; });
    if (G.relance) { G.relance.t0 += dt; G.relance.notes.forEach(n => n.t += dt); }
    ac.suspend();
    $('pause').classList.remove('cache');
    $('infoDecal').textContent = 'Décalage du son : ' + Math.round(G.decal * 1000) + ' ms.';
  } else $('intro').classList.remove('cache');
  calib = null;
});

// ---------------- c'est parti ----------------
taille();
const illuTout = () => document.querySelectorAll('canvas[data-illu]').forEach(c => illustrer(c, +c.dataset.illu));
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { taille(); illuTout(); });
illuTout();
requestAnimationFrame(boucle);
window.__barde = {
  G, L, R, ACTES,
  robot(on, precision = 0.03, assiduite = 0.95, solo = 0.95) { G.robot = on ? { precision, assiduite, solo, dernier: -1 } : null; },
  nouvellePartie, pause, reprendre, relancer, coupure,
  qualite() { return { n: Q.n, ips: Q.ips, baisses: Q.bas, finesse: Math.round(K * 100) / 100, cuits: Golems.cuits, cuites: Golems.cuites }; },
  etat() { return { etat: G.etat, mode: G.mode, acte: G.acte, coeurs: G.coeurs, combo: G.combo, mult: G.mult, sbires: G.sbires.length,
    groupe: G.vague ? G.vague.i + '/' + G.vague.groupes.length : '', proj: G.proj.length, bpm: Musique.M.bpm, sec: Musique.M.sec,
    relance: G.relance ? { k: G.relance.k, essai: G.relance.essai[G.relance.k], notes: G.relance.notes.length } : null,
    ferveur: G.ferveur, niveau: niveauDe(G.ferveur), mega: G.enMega, st: G.st, victoire: G.victoire, temps: Math.round((performance.now() - G.st.debut) / 1000) }; },
};
}
