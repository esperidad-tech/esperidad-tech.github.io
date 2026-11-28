// Combat du Barde en 3D — premier essai : la salle peinte (parvis du temple), le Barde de dos, les golems d'Elyra qui sortent
// de la porte de cristal et marchent vers lui. Chaque pied se pose sur un temps de la musique (rien du jeu n'est encore branché).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// ---------- la caméra de la peinture (outils/camera_barde.py : f 5497 px, pente 34,5°, sur l'image debout 1520 × 2688) ----------
const IMG = {
  debout: { src: 'fond.jpg', w: 1520, h: 2688, f: 5497 },
  couche: { src: 'fond-large.jpg', w: 2752, h: 1536, f: 5497 * 1536 / 2688 },   // la même salle, agrandie sur les côtés
};
const PENTE = 34.5 * Math.PI / 180, HAUT_CAM = 20.6;           // 1 unité = 1 m ; le Barde (1,5 m) fait ~300 px de peinture en bas
const PALIER = 0.9;                                           // le palier de la porte : cinq marches au-dessus du parvis
const ver = { w: 0, h: 0, s: 1, im: IMG.debout };

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
document.getElementById('scene').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(27.5, 1, 1, 400);
camera.position.set(0, HAUT_CAM, 0); camera.rotation.set(-PENTE, 0, 0, 'YXZ');

function cadrer() {
  const W = window.innerWidth, H = window.innerHeight, im = W > H ? IMG.couche : IMG.debout;
  if (ver.im !== im) { ver.im = im; document.getElementById('fond').style.backgroundImage = `url(${im.src})`; }
  const s = Math.max(W / im.w, H / im.h);                     // l'image couvre l'écran, centrée (comme le fond CSS)
  ver.w = W; ver.h = H; ver.s = s;
  camera.aspect = W / H; camera.fov = 2 * Math.atan((H / 2) / (im.f * s)) * 180 / Math.PI; camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}
// un point de la peinture debout (u, v) → le point du sol (à la hauteur h) qui s'y voit
function sol(u, v, h = 0) {
  const im = IMG.debout, d = new THREE.Vector3((u - im.w / 2) / im.f, -(v - im.h / 2) / im.f, -1).applyEuler(camera.rotation);
  const k = (h - HAUT_CAM) / d.y; return new THREE.Vector3(d.x * k, h, d.z * k);
}

// ---------- la lumière : la lune d'en haut, la porte de cristal dans le dos des golems, les braseros chauds sur les côtés ----------
scene.add(new THREE.HemisphereLight(0xaab4ee, 0x2c2438, 0.8));
const lune = new THREE.DirectionalLight(0xd4dcff, 0.9); lune.position.set(-6, 30, 10); scene.add(lune);
const porte = new THREE.PointLight(0xc9d8ff, 40, 30, 1.6); porte.position.copy(sol(760, 1000, PALIER + 1.5)); scene.add(porte);
for (const [u, v] of [[120, 2430], [1400, 2430], [90, 1420], [1430, 1420]]) {
  const l = new THREE.PointLight(0xffa860, 18, 12, 1.8); l.position.copy(sol(u, v, 1.2)); scene.add(l);
}

// ---------- charger un modèle (.glb rangé en base64 dans un .json : la page Claude ne sert pas les .glb) ----------
const chargeur = new GLTFLoader();
const charger = nom => fetch(nom + '.json').then(r => r.json()).then(j => new Promise((ok, ko) => {
  const t = atob(j.glb), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i);
  chargeur.parse(u.buffer, '', ok, ko);
}));

// une ombre douce sous chaque personnage (elle colle au sol peint)
const ombreTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(10,6,20,0.75)'); g.addColorStop(0.55, 'rgba(10,6,20,0.38)'); g.addColorStop(1, 'rgba(10,6,20,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
function ombre(r) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 1.6), new THREE.MeshBasicMaterial({ map: ombreTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = -1; scene.add(m); return m; }

// ---------- les golems : qui marche comment ----------
// tous : la marche lente d'orc (Slow_Orc_Walk, n° 119) ; le rôdeur : la marche de monstre (Monster_Walk, n° 112).
// Comme dans le jeu : le rôdeur et le bélier avancent à chaque temps, les autres un temps sur deux.
// Leurs tailles suivent celles du jeu en 2D (le Barde 1,5 m) : le parvis ne fait qu'environ 6 m de large en bas.
const GOLEMS = {
  rodeur:        { tous: 1, haut: 1.0,  ombre: 0.4 },
  belier:        { tous: 1, haut: 1.3,  ombre: 0.65 },
  faucheur:      { tous: 2, haut: 1.6,  ombre: 0.5, faux: true },
  'porte-dalle': { tous: 2, haut: 1.45, ombre: 0.55, dalle: true },
  colosse:       { tous: 2, haut: 2.15, ombre: 0.9 },
};
const modeles = {};

// le pas d'une marche : quand chaque pied se pose, et de combien le corps avance par pas (pieds immobiles au sol)
function mesurerPas(base, clip) {
  const o = SkeletonUtils.clone(base), mx = new THREE.AnimationMixer(o), a = mx.clipAction(clip); a.play();
  const T = clip.duration, N = 160, pieds = ['LeftFoot', 'RightFoot'].map(n => o.getObjectByName(n)), hanche = o.getObjectByName('Hips');
  const y = [[], []], z = [[], []], p = new THREE.Vector3(), q = new THREE.Vector3();
  for (let i = 0; i < N; i++) { mx.setTime(T * i / N); o.updateMatrixWorld(true); hanche.getWorldPosition(q);
    pieds.forEach((f, k) => { f.getWorldPosition(p); y[k].push(p.y); z[k].push(p.z - q.z); }); }
  const poses = [], vit = [];
  for (let k = 0; k < 2; k++) {
    const mn = Math.min(...y[k]), mxh = Math.max(...y[k]), seuil = mn + (mxh - mn) * 0.12, haut = mn + (mxh - mn) * 0.4;
    let i0 = y[k].findIndex(v => v > haut), enl = true;          // on part d'un moment où ce pied est en l'air
    for (let j = 1; j <= N; j++) { const i = (i0 + j) % N;
      if (enl && y[k][i] <= seuil) { poses.push({ t: T * i / N, k }); enl = false; } else if (!enl && y[k][i] > haut) enl = true; }
    // au sol, le pied recule par rapport au bassin à la vitesse du corps
    const pts = []; for (let i = 0; i < N; i++) if (y[k][i] <= seuil) pts.push([T * i / N, z[k][i]]);
    if (pts.length > 4) { let sl = 0, c = 0; for (let j = 1; j < pts.length; j++) { const dt = pts[j][0] - pts[j - 1][0]; if (dt > 0 && dt < T / N * 1.5) { sl += (pts[j][1] - pts[j - 1][1]) / dt; c++; } } if (c) vit.push(Math.abs(sl / c)); }
  }
  poses.sort((a, b) => a.t - b.t);
  for (let i = poses.length - 1; i > 0; i--) if (poses[i].t - poses[i - 1].t < T / 12) poses.splice(i, 1);
  // une pose manquée (un pied qui remonte peu) : la marche est régulière, on bouche le trou au milieu
  const ec = poses.map((p, i) => (i + 1 < poses.length ? poses[i + 1].t : poses[0].t + T) - p.t), med = [...ec].sort((a, b) => a - b)[ec.length >> 1];
  for (let i = poses.length - 1; i >= 0; i--) { const n = Math.round(ec[i] / med); for (let j = n - 1; j >= 1; j--) poses.splice(i + 1, 0, { t: (poses[i].t + ec[i] * j / n) % T }); }
  poses.sort((a, b) => a.t - b.t);
  const v = vit.length ? vit.reduce((s, x) => s + x, 0) / vit.length : 0.8;
  return { T, poses: poses.map(x => x.t), pas: v * T / Math.max(2, poses.length) };
}

// ---------- la musique : un temps sourd, et le choc des pieds des golems ----------
let ac = null, bpm = 100, t0 = 0, enRoute = false;
const temps = () => 60 / bpm;
function son(t, freq, dur, vol, bruit) {
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); g.connect(ac.destination);
  const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq * 2.2, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.06); o.connect(g); o.start(t); o.stop(t + dur);
  if (bruit) { const b = ac.createBuffer(1, ac.sampleRate * 0.08, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ac.createBufferSource(), gb = ac.createGain(), fi = ac.createBiquadFilter(); fi.type = 'lowpass'; fi.frequency.value = 900; s.buffer = b; gb.gain.value = bruit; s.connect(fi).connect(gb).connect(ac.destination); s.start(t); }
}
let prochain = 0;
function programmerTemps() {                                    // la batterie : un temps sur quatre plus fort
  while (enRoute && t0 + prochain * temps() < ac.currentTime + 0.25) { const t = t0 + prochain * temps(); son(t, prochain % 4 ? 70 : 55, 0.22, prochain % 4 ? 0.35 : 0.6, prochain % 4 ? 0 : 0.12); prochain++; }
}
const maintenant = () => ac ? ac.currentTime - t0 : 0;          // en secondes depuis le premier temps

// ---------- les golems en marche ----------
const vivants = [];
const CHEMIN = [[760, 1000, PALIER], [760, 1185, PALIER], [760, 1315, 0]];   // la porte, le bord du palier, le bas des marches
const BARDE = sol(760, 2250);
let suivant = 0, ordre = ['rodeur', 'faucheur', 'belier', 'porte-dalle', 'colosse'], kSort = 0;

function sortir(nom) {
  const M = modeles[nom]; if (!M) return;
  const o = SkeletonUtils.clone(M.base); scene.add(o);
  const mx = new THREE.AnimationMixer(o), a = mx.clipAction(M.marche); a.play();
  const ecart = (kSort % 5 - 2) * 0.75 + (Math.random() - 0.5) * 0.5;   // ils se répartissent sur la largeur du parvis (≈ 6 m)
  const pts = CHEMIN.map(([u, v, h]) => sol(u, v, h)), fin = BARDE.clone().add(new THREE.Vector3(ecart * 1.1, 0, -2.6 - Math.abs(ecart) * 0.5));
  const bas = pts[2].clone(); bas.x += ecart * 0.6; pts[2] = bas; pts.push(fin);
  const tous = GOLEMS[nom].tous, b0 = Math.ceil(maintenant() / temps() / tous) * tous;   // il part sur un temps où il a le droit d'avancer
  const g = { nom, o, mx, a, pts, seg: 0, d: 0, tous, b0, k: 0, sh: ombre(GOLEMS[nom].ombre), M, fini: false, dalle: null };
  if (GOLEMS[nom].dalle) g.dalle = tenir(o, 'LeftHand', modeles.dalle, { haut: 1.05, prise: 0.45, devant: 0.16 });
  if (GOLEMS[nom].faux) g.faux = tenir(o, 'RightHand', modeles.faux, { haut: 1.55, prise: 0.42, devant: 0.02 });
  kSort++; vivants.push(g);
}

// un objet tenu (la faux, la dalle) : rigide, rattaché à la main ; réglé une fois, dans la pose de départ, le golem de face
function tenir(o, nomOs, M, { haut, prise, devant }) {
  if (!M) return null; const os = o.getObjectByName(nomOs); if (!os) return null;
  const ry = o.rotation.y, pos = o.position.clone(); o.rotation.y = 0; o.position.set(0, 0, 0); o.updateMatrixWorld(true);
  const p = M.base.clone(); const bb = new THREE.Box3().setFromObject(M.base), h = bb.max.y - bb.min.y; p.scale.setScalar(haut / h);
  const m = new THREE.Vector3(); os.getWorldPosition(m);
  // la prise : le milieu des sommets du bas de l'objet (le manche), à « prise » de sa hauteur
  p.position.set(m.x - M.manche.x * haut / h, m.y - (M.manche.y0 + prise * h) * haut / h, m.z - M.manche.z * haut / h + devant);
  scene.add(p); p.updateMatrixWorld(true); os.attach(p);
  o.rotation.y = ry; o.position.copy(pos); o.updateMatrixWorld(true); return p;
}
function manche(base) {                                         // où est le manche (x, z) et le bas (y) de l'objet, dans ses mesures
  base.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(base), h = bb.max.y - bb.min.y, v = new THREE.Vector3(); let sx = 0, sz = 0, n = 0;
  base.traverse(x => { if (!x.isMesh) return; const a = x.geometry.attributes.position; for (let i = 0; i < a.count; i += 3) { v.fromBufferAttribute(a, i).applyMatrix4(x.matrixWorld); if (v.y < bb.min.y + h * 0.3) { sx += v.x; sz += v.z; n++; } } });
  return { x: n ? sx / n : 0, z: n ? sz / n : 0, y0: bb.min.y };
}

// où il en est au temps « t » (en temps de musique) : pas n° k entre deux poses de pied, et sa place sur le chemin
function animer(g, tm) {
  const P = g.M.pas, per = temps() * g.tous;                  // un pas dure 1 ou 2 temps ; le pied se pose sur le temps
  const x = tm / per - g.b0 / g.tous; if (x < 0) { g.o.visible = false; return; } g.o.visible = true;
  const k = Math.floor(x), u = x - k, n = P.poses.length;
  const ta = P.poses[k % n] + Math.floor(k / n) * P.T, tb = P.poses[(k + 1) % n] + Math.floor((k + 1) / n) * P.T;
  g.mx.setTime(ta + (tb - ta) * u);                           // le film de la marche, déformé pour tomber juste sur les temps
  if (k !== g.k) { g.k = k; if (!g.fini && ac) son(ac.currentTime, g.nom === 'colosse' ? 42 : g.nom === 'rodeur' ? 90 : 55, 0.3, g.nom === 'colosse' ? 0.55 : 0.3, 0.25); }
  // la distance parcourue : un pas entier par pas, au fil du pas (le pied au sol ne glisse pas)
  let rest = (k + u) * P.pas;
  let p = g.pts[0], dir = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < g.pts.length - 1; i++) {
    const A = g.pts[i], B = g.pts[i + 1], L = A.distanceTo(B);
    dir = B.clone().sub(A).setY(0).normalize();
    if (rest <= L) { p = A.clone().lerp(B, rest / L); break; }
    rest -= L; p = B.clone();
    if (i === g.pts.length - 2) g.fini = true;
  }
  if (g.fini && !g.arrive) { g.arrive = tm; g.a.fadeOut(0.4); const id = g.mx.clipAction(g.M.repos); id.reset().fadeIn(0.4).play(); }
  g.o.position.copy(p); g.o.rotation.y = Math.atan2(dir.x, dir.z);
  g.sh.position.set(p.x, p.y + 0.02, p.z);
}

// ---------- le Barde, de dos, qui attend ----------
let barde = null, bardeMx = null;

// ---------- la boucle ----------
const horloge = new THREE.Clock();
function image() {
  requestAnimationFrame(image);
  if (window.essai && window.essai.fige) return;            // (essais sans écran : on place tout à la main)
  const dt = horloge.getDelta(), tm = maintenant();
  if (enRoute) {
    programmerTemps();
    const per = temps() * 4;                                    // un golem sort toutes les quatre mesures… non : tous les 4 temps
    if (tm >= suivant * per) { sortir(ordre[suivant % ordre.length]); suivant++; }
  }
  for (const g of vivants) {
    if (g.arrive) { g.mx.update(dt); if (tm - g.arrive > 6) { g.part = (g.part || 0) + dt; g.o.position.y -= dt * 0.0; } }
    else animer(g, tm);
  }
  // les arrivés repartent (ils s'effacent) pour laisser la place : la démonstration tourne en boucle
  for (let i = vivants.length - 1; i >= 0; i--) { const g = vivants[i]; if (g.arrive && tm - g.arrive > 6) { scene.remove(g.o); scene.remove(g.sh); vivants.splice(i, 1); } }
  if (bardeMx) bardeMx.update(dt);
  renderer.render(scene, camera);
}

// ---------- départ ----------
window.addEventListener('resize', cadrer); cadrer();
const noms = Object.keys(GOLEMS);
Promise.all([...noms.map(n => Promise.all([charger(n), charger(n + '-marche')])), charger('barde'), charger('dalle'), charger('faux')]).then(res => {
  noms.forEach((n, i) => {
    const [g, m] = res[i], base = g.scene;
    base.traverse(x => { if (x.isMesh) { x.frustumCulled = false; if (x.material) x.material.envMapIntensity = 0.6; } });
    const bb = new THREE.Box3().setFromObject(base); base.scale.multiplyScalar(GOLEMS[n].haut / (bb.max.y - bb.min.y));
    const marche = m.animations[0], repos = g.animations[0];
    modeles[n] = { base, marche, repos, pas: mesurerPas(base, marche) };
  });
  const b = res[noms.length]; barde = b.scene; const bb = new THREE.Box3().setFromObject(barde); barde.scale.multiplyScalar(1.5 / (bb.max.y - bb.min.y)); barde.position.copy(BARDE); barde.rotation.y = Math.PI; scene.add(barde);
  if (b.animations[0]) { bardeMx = new THREE.AnimationMixer(barde); bardeMx.clipAction(b.animations[0]).play(); }
  const sb = ombre(0.55); sb.position.set(BARDE.x, 0.02, BARDE.z);
  for (const [k, nom] of [[1, 'dalle'], [2, 'faux']]) { const b = res[noms.length + k].scene; modeles[nom] = { base: b, manche: manche(b) }; }
  window.PAS = Object.fromEntries(noms.map(n => [n, modeles[n].pas]));
  document.getElementById('attente').hidden = true; document.getElementById('lancer').hidden = false;
  window.PRET = true;
}).catch(e => { console.error(e); document.getElementById('attente').textContent = '⚠ ' + e.message; });

function lancer() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume();
  t0 = ac.currentTime + 0.3; prochain = 0; suivant = 0; kSort = 0; enRoute = true;
  for (const g of vivants.splice(0)) { scene.remove(g.o); scene.remove(g.sh); }
  document.getElementById('lancer').hidden = true; document.getElementById('tempos').hidden = false;
}
document.getElementById('lancer').onclick = lancer;
document.querySelectorAll('#tempos button').forEach(b => b.onclick = () => {
  bpm = +b.dataset.bpm; document.querySelectorAll('#tempos button').forEach(x => x.classList.toggle('choisi', x === b)); lancer();
});
// pour les essais sans écran : sortir un golem et le placer à un instant donné
window.essai = { tailles: () => { const r = {}; const h = o => { o.updateMatrixWorld(true); const b = new THREE.Box3(); o.traverse(x => { if (x.isSkinnedMesh) { x.skeleton.update(); x.computeBoundingBox(); b.union(x.boundingBox.clone().applyMatrix4(x.matrixWorld)); } else if (x.isMesh) b.expandByObject(x); }); const p = new THREE.Vector3(); o.getObjectByName('Head')?.getWorldPosition(p); return [+(b.max.y - b.min.y).toFixed(2), +p.y.toFixed(2)]; }; for (const n of Object.keys(modeles)) if (modeles[n].base) r[n] = h(modeles[n].base); if (barde) r.barde = h(barde); return r; }, sortir, animer: (i, t) => animer(vivants[i], t), vivants, regler: b => { bpm = b; }, rendre: () => renderer.render(scene, camera), sol, camera };
image();
