// Combat du Barde en 3D — 2ᵉ essai (28 novembre, après-midi ; go de Romain à 16 h 28 : « Allez, vas-y, tu peux lancer tout le chantier »)
// Le temple de Romain (debout 9:16 ; couché, la salle large 16:9 dont le milieu est exactement l'image debout), Grosbec sur le palier
// devant la porte blanche (son modèle actuel, sans y toucher : l'autre conversation le refait en pièces rigides), quatre portails rouges
// sur le parvis aux distances du jeu, les golems d'Elyra qui en sortent et marchent sur le temps, le Barde de dos qui joue : ses notes
// partent du luth sur le temps et frappent ; les golems touchés, qui frappent, qui meurent ; le refrain (le Barde lève le bras, Grosbec
// subit). Démonstration : le Barde joue tout seul ; rien du vrai jeu n'est encore branché.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const doux = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const $ = id => document.getElementById(id);
let graine = 7;   // (un hasard qu'on peut rejouer : les essais sans écran voient toujours la même partie)
const hasard = () => { graine = (graine + 0x6D2B79F5) | 0; let t = Math.imul(graine ^ (graine >>> 15), 1 | graine); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// ---------- la caméra de la peinture (outils/camera_temple.py) : sur l'image debout 2160 × 3840 ----------
const CAM = { w: 2160, h: 3840, f: 5856, pente: 15.79 * Math.PI / 180, lacet: -1.32 * Math.PI / 180, haut: 9.0 };
// la salle large : l'image debout y est recollée telle quelle, réduite à 1210 / 2160, au milieu, sur toute la hauteur
const IMG = { debout: { src: 'fond.jpg', w: 2160, h: 3840, k: 1 }, large: { src: 'fond-large.jpg', w: 3822, h: 2150, k: 1210 / 2160 } };

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
$('scene').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 200);
camera.position.set(0, CAM.haut, 0); camera.rotation.set(-CAM.pente, CAM.lacet, 0, 'YXZ'); camera.updateMatrixWorld(true);
const ver = { W: 0, H: 0, q: 1, im: null };
// debout (téléphone) : l'image debout couvre l'écran ; plus large (tablette, couché, ordinateur) : la salle large, toute sa hauteur
// (plus large que 16:9 : toute sa largeur). Dans les deux cas, le milieu de l'écran est le milieu de l'image debout : rien ne bouge.
function cadrer() {
  const W = window.innerWidth, H = window.innerHeight, r = W / H;
  let im, s;
  if (r <= CAM.w / CAM.h) { im = IMG.debout; s = Math.max(W / im.w, H / im.h); }
  else { im = IMG.large; s = r <= im.w / im.h ? H / im.h : W / im.w; }
  const f = $('fond');
  if (ver.im !== im) f.style.backgroundImage = `url(${im.src})`;
  f.style.backgroundSize = `${im.w * s}px ${im.h * s}px`;
  ver.W = W; ver.H = H; ver.im = im; ver.q = s * im.k;          // (pixels d'écran par pixel de l'image debout)
  camera.aspect = W / H; camera.fov = 2 * Math.atan((H / 2) / (CAM.f * ver.q)) * 180 / Math.PI; camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}
// un point de la peinture debout (u, v) → le point à la hauteur h qui s'y voit
function sol(u, v, h = 0) {
  const d = new THREE.Vector3((u - CAM.w / 2) / CAM.f, -(v - CAM.h / 2) / CAM.f, -1).applyQuaternion(camera.quaternion);
  const k = (h - CAM.haut) / d.y; return camera.position.clone().addScaledVector(d, k);
}

// ---------- les places : le Barde en bas du parvis, Grosbec sur le palier devant la porte, les portails ----------
const BARDE = sol(1080, 3150);
const PALIER = 1.71;                                               // (16 marches de 10,7 cm)
const GROSBEC = sol(1075, 1400, PALIER).add(new THREE.Vector3(0, 0, 1.3));
// les portes et les chutes du jeu en 2D, ramenées aux pas des golems 3D (à ~10 pas du Barde, comme dans le jeu)
const PORTAILS = [[-2.4, -4.5], [2.4, -4.5], [-2.7, -2.4], [2.7, -2.4]].map(([dx, dz], i) => ({ i, pos: BARDE.clone().add(new THREE.Vector3(dx, 0, dz)), cote: dx < 0 ? -1 : 1 }));
const PORTEE = 3.3, CONTACT = 1.05;

// ---------- la lumière : la lune, la porte de cristal derrière Grosbec, les braseros, les cristaux du parvis ----------
scene.add(new THREE.HemisphereLight(0xb4c0f4, 0x3a3048, 1.35));
const lune = new THREE.DirectionalLight(0xd4dcff, 1.3); lune.position.set(-8, 30, 6); scene.add(lune);
// (les golems sont de marbre clair : vus de face, sans cette lumière douce venue de notre côté, ils sortaient presque noirs)
const face = new THREE.DirectionalLight(0xe8dcff, 0.9); face.position.set(2, 14, 12); face.target.position.copy(BARDE); scene.add(face, face.target);
const lPorte = new THREE.PointLight(0xd8e4ff, 60, 14, 1.6); lPorte.position.copy(GROSBEC).add(new THREE.Vector3(0, 2.4, -1.8)); scene.add(lPorte);
for (const [u, v, h, c, I, d] of [[840, 1950, 1.3, 0xffa860, 14, 9], [1320, 1950, 1.3, 0xffa860, 14, 9], [580, 1960, 0.6, 0xb27bff, 10, 7], [1580, 1960, 0.6, 0xb27bff, 10, 7]]) { const l = new THREE.PointLight(c, I, d, 1.8); l.position.copy(sol(u, v, 0)).setY(h); scene.add(l); }

// ---------- des petites images qui brillent (peintes une fois) ----------
function toile(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const texLueur = coul => toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, coul); g.addColorStop(0.5, coul.replace(/[\d.]+\)$/, '0.35)')); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
const texNote = (coul, dbl) => toile(64, 72, x => { x.translate(32, 40); x.lineCap = 'round'; x.lineJoin = 'round';
  const tige = () => { x.beginPath(); if (dbl) { x.moveTo(-6, 15); x.lineTo(-6, -26); x.lineTo(18, -34); x.lineTo(18, 7); x.moveTo(-6, -16); x.lineTo(18, -24); } else { x.moveTo(7, 13); x.lineTo(7, -29); x.quadraticCurveTo(21, -19, 19, -3); } };
  const tete = () => { x.beginPath(); if (dbl) { x.ellipse(-13, 16, 9, 7, -0.4, 0, 7); x.moveTo(20, 8); x.ellipse(11, 8, 9, 7, -0.4, 0, 7); } else x.ellipse(-2, 16, 10, 8, -0.4, 0, 7); };
  x.strokeStyle = coul; x.lineWidth = 6; tige(); x.stroke(); x.fillStyle = coul; tete(); x.fill(); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 2; tige(); x.stroke(); });
const texNoteBrillante = (coeur, lueur, bord) => toile(128, 128, x => { x.translate(60, 64); x.lineCap = 'round'; x.lineJoin = 'round';
  const forme = () => { x.beginPath(); x.ellipse(-14, 30, 19, 14, -0.45, 0, 7); x.fill(); x.beginPath(); x.moveTo(1, 26); x.lineTo(1, -46); x.stroke();
    x.beginPath(); x.moveTo(1, -46); x.bezierCurveTo(22, -36, 34, -22, 30, -2); x.bezierCurveTo(28, -14, 18, -22, 3, -26); x.fill(); };
  x.shadowColor = lueur; x.shadowBlur = 20; x.fillStyle = lueur; x.strokeStyle = lueur; x.lineWidth = 11; forme();
  x.shadowBlur = 0; x.fillStyle = bord; x.strokeStyle = bord; x.lineWidth = 9; forme();
  x.fillStyle = coeur; x.strokeStyle = coeur; x.lineWidth = 4.5; x.save(); x.scale(0.86, 0.86); forme(); x.restore(); });
const texPortee = coul => { const t = toile(64, 128, x => { x.shadowColor = coul; x.shadowBlur = 10; x.strokeStyle = coul; x.lineWidth = 7;
    for (let k = 0; k < 5; k++) { const y = 14 + k * 25; x.beginPath(); x.moveTo(-10, y); x.lineTo(74, y); x.stroke(); }
    x.shadowBlur = 0; x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 2.5; for (let k = 0; k < 5; k++) { const y = 14 + k * 25; x.beginPath(); x.moveTo(-10, y); x.lineTo(74, y); x.stroke(); } });
  t.wrapS = THREE.RepeatWrapping; return t; };
// la note du Barde : verte (comme le bouton Note du jeu) ; au refrain, dorée et deux fois plus forte
const NOTES = {
  vert: { note: texNoteBrillante('#f2fff0', 'rgba(110,255,140,1)', 'rgba(20,120,55,1)'), portee: texPortee('rgba(140,255,160,1)'), petites: [texNote('#d6ffdc', false), texNote('#d6ffdc', true)], lueur: texLueur('rgba(120,255,150,.95)'), lum: 0x8dffa0, boum: 0xb0ffb8 },
  or: { note: texNoteBrillante('#fffbe8', 'rgba(255,205,70,1)', 'rgba(150,95,10,1)'), portee: texPortee('rgba(255,215,90,1)'), petites: [texNote('#ffeaa6', false), texNote('#ffeaa6', true)], lueur: texLueur('rgba(255,205,90,.95)'), lum: 0xffd060, boum: 0xffe08a },
};
const T = { rouge: texLueur('rgba(255,60,35,.95)'), braise: texLueur('rgba(255,120,40,.95)'), poussiere: texLueur('rgba(205,190,170,.5)'), blanc: texLueur('rgba(255,250,240,.95)') };
function sprite(tex, s, add) { const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false }); const sp = new THREE.Sprite(m); sp.scale.set(s, s, 1); return sp; }
function aPlat(tex, sx, sz, op) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.renderOrder = -2; scene.add(m); return m; }

// une ombre douce sous chaque personnage (elle colle au sol peint)
const ombreTex = toile(128, 128, x => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(10,6,20,0.75)'); g.addColorStop(0.55, 'rgba(10,6,20,0.38)'); g.addColorStop(1, 'rgba(10,6,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
function ombre(r) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 1.6), new THREE.MeshBasicMaterial({ map: ombreTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = -1; scene.add(m); return m; }

// ---------- charger un modèle (.glb rangé en base64 dans un .json : la page Claude ne sert pas les .glb) ----------
const chargeur = new GLTFLoader();
const charger = nom => fetch(nom + '.json').then(r => { if (!r.ok) throw new Error(nom + ' : ' + r.status); return r.json(); }).then(j => new Promise((ok, ko) => {
  const t = atob(j.glb), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i);
  chargeur.parse(u.buffer, '', ok, ko);
}));
const peutEtre = nom => charger(nom).catch(() => null);

// ---------- dans le repère d'un modèle (R) : bras guidés par la main, mains tournées (repris de l'essai 3D) ----------
const _m = new THREE.Matrix4(), _mi = new THREE.Matrix4(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
const matM = (R, o) => _m.copy(_mi.copy(R.matrixWorld).invert()).multiply(o.matrixWorld).clone();
const posM = (R, o, v) => (v || new THREE.Vector3()).setFromMatrixPosition(o.matrixWorld).applyMatrix4(_mi.copy(R.matrixWorld).invert());
function quatM(R, o) { const q = new THREE.Quaternion(); matM(R, o).decompose(_v, q, _s); return q; }
function poserQuatM(R, os, qm) { os.quaternion.copy(quatM(R, os.parent).invert().multiply(qm)); os.updateMatrixWorld(true); }
function guider(R, haut, bas, main, cible, pole, poids) {
  if (poids <= 0.001) return;
  const S = posM(R, haut), E = posM(R, bas), W = posM(R, main);
  const Tc = W.clone().lerp(cible, poids);
  const a = E.distanceTo(S), b = W.distanceTo(E); let d = Tc.distanceTo(S); d = clamp(d, Math.abs(a - b) + 1e-4, a + b - 1e-4);
  const dir = Tc.clone().sub(S).normalize(); const ca = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), sa = Math.sqrt(1 - ca * ca);
  const p = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))); if (p.lengthSq() < 1e-8) p.set(0, -1, 0); p.normalize();
  const E2 = S.clone().addScaledVector(dir, a * ca).addScaledVector(p, a * sa);
  poserQuatM(R, haut, new THREE.Quaternion().setFromUnitVectors(E.clone().sub(S).normalize(), E2.clone().sub(S).normalize()).multiply(quatM(R, haut)));
  const E3 = posM(R, bas), W3 = posM(R, main), T2 = S.clone().addScaledVector(dir, d);
  poserQuatM(R, bas, new THREE.Quaternion().setFromUnitVectors(W3.clone().sub(E3).normalize(), T2.clone().sub(E3).normalize()).multiply(quatM(R, bas)));
}
function orienter(R, os, F, P, paumeLocale, poids) {
  if (poids <= 0.001) return;
  const fl = new THREE.Vector3(0, 1, 0), pl = paumeLocale, tl = new THREE.Vector3().crossVectors(fl, pl);
  const Tt = new THREE.Vector3().crossVectors(F, P);
  const Mc = new THREE.Matrix4().makeBasis(F, P, Tt), Ml = new THREE.Matrix4().makeBasis(fl, pl, tl);
  const q = new THREE.Quaternion().setFromRotationMatrix(Mc.multiply(Ml.transpose()));
  poserQuatM(R, os, quatM(R, os).slerp(q, poids));
}
// une lueur qu'on ajoute à un matériau (touché, sortie du portail), sans effacer la sienne (les éclats rouges des golems)
function lueurAjoutee(m) {
  m.userData.ajout = { value: new THREE.Color(0, 0, 0) }; const avant = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => { if (avant) avant(sh, r); sh.uniforms.uAjout = m.userData.ajout; sh.fragmentShader = 'uniform vec3 uAjout;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += uAjout;'); };
  m.needsUpdate = true; return m;
}
// tourner un os de plus (après le mouvement), dans son propre repère
const _qa = new THREE.Quaternion(), _e = new THREE.Euler();
function pencher(os, x, y, z) { if (!os) return; _qa.setFromEuler(_e.set(x, y, z)); os.quaternion.multiply(_qa); }

// ---------- la musique : le temps, la batterie, les sons ----------
let ac = null, bpm = 100, t0 = 0, enRoute = false, tmForce = null;
const temps = () => 60 / bpm;
const maintenant = () => tmForce !== null ? tmForce : ac ? ac.currentTime - t0 : 0;   // en secondes depuis le premier temps
// la forme : une mesure d'entrée, puis 8 mesures de combat et 4 de refrain, en boucle (dans le vrai jeu, le refrain se gagne)
const ENTREE = 1, COUPLET = 8, REFRAIN = 4;
function section(mesure) { if (mesure < ENTREE) return 'entree'; return (mesure - ENTREE) % (COUPLET + REFRAIN) < COUPLET ? 'combat' : 'refrain'; }
function bruit(t, dur, vol, type, f0, f1, q) {
  const b = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ac.createBufferSource(), g = ac.createGain(), fi = ac.createBiquadFilter(); fi.type = type; fi.Q.value = q || 1; fi.frequency.setValueAtTime(f0, t); if (f1) fi.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); s.buffer = b; s.connect(fi).connect(g).connect(ac.destination); s.start(t); s.stop(t + dur);
}
function ton(t, freq, dur, vol, type = 'sine', glisse) {
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); g.connect(ac.destination);
  const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq * (glisse || 1), t); if (glisse) o.frequency.exponentialRampToValueAtTime(freq, t + 0.06); o.connect(g); o.start(t); o.stop(t + dur + 0.02);
}
const SON = {
  tambour: (t, fort) => { ton(t, fort ? 55 : 70, 0.22, fort ? 0.6 : 0.35, 'sine', 2.2); if (fort) bruit(t, 0.08, 0.12, 'lowpass', 900); },
  pas: (t, lourd) => { ton(t, lourd ? 42 : 60, 0.25, lourd ? 0.45 : 0.22, 'sine', 1.8); bruit(t, 0.12, lourd ? 0.25 : 0.12, 'lowpass', 500); },
  note: (t, f, or) => { ton(t, f, 0.5, 0.22, 'triangle'); ton(t, f * 2, 0.3, 0.07, 'sine'); if (or) ton(t, f * 1.5, 0.45, 0.08, 'triangle'); },
  touche: t => { bruit(t, 0.18, 0.35, 'bandpass', 2600, 1800, 6); ton(t, 180, 0.15, 0.15, 'square', 1.5); },
  meurt: t => { bruit(t, 0.9, 0.45, 'lowpass', 900, 120); ton(t, 70, 0.6, 0.3, 'sine', 1.6); },
  portail: t => { bruit(t, 0.7, 0.35, 'bandpass', 180, 1400, 3); ton(t, 48, 0.9, 0.35, 'sawtooth', 0.6); },
  coup: t => { ton(t, 50, 0.35, 0.6, 'sine', 2.5); bruit(t, 0.2, 0.4, 'lowpass', 700); },
  accord: (t, fs, dur) => { for (const f of fs) { ton(t, f, dur, 0.05, 'sawtooth'); ton(t, f * 2, dur * 0.7, 0.03, 'triangle'); } },
};
const GAMME = [440, 523.25, 587.33, 659.25, 783.99, 880];
const ACCORDS = [[220, 261.6, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [164.8, 207.7, 246.9]];   // la, sol, fa, mi : le refrain
let prochain = 0;
function programmerTemps() {                                    // la batterie (un temps sur quatre plus fort) ; au refrain, les accords
  while (enRoute && t0 + prochain * temps() < ac.currentTime + 0.25) {
    const t = t0 + prochain * temps(), b = prochain % 4, sec = section(Math.floor(prochain / 4));
    SON.tambour(t, b === 0); if (b === 2) bruit(t, 0.06, 0.08, 'highpass', 5000);
    if (sec === 'refrain') { SON.accord(t, ACCORDS[Math.floor(prochain / 4) % 4], temps() * 0.9); bruit(t + temps() / 2, 0.05, 0.1, 'highpass', 7000); }
    prochain++;
  }
}

// ---------- les particules : étincelles, braises, poussière ----------
const parts = [];
function etincelle(p, tex, s0, v, vie, monte) {
  const sp = sprite(tex, s0, true); sp.position.copy(p); scene.add(sp);
  const a = Math.random() * 6.28, b = Math.random() * 3.14 - 1.57, s = v * (0.3 + Math.random() * 0.7);
  parts.push({ sp, v: new THREE.Vector3(Math.cos(a) * Math.cos(b) * s, Math.sin(b) * s * 0.6 + (monte || 0), Math.sin(a) * Math.cos(b) * s), vie, t: 0, s0, g: monte ? -0.5 : 4 });
}
function avancerParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const e = parts[i]; e.t += dt; const u = e.t / e.vie;
    if (u >= 1) { if (e.lum) rendreL(e.lum); else { scene.remove(e.sp); e.sp.material.dispose(); } parts.splice(i, 1); continue; }
    if (e.lum) { e.lum.intensity = e.I * (1 - u); continue; }
    e.v.y -= e.g * dt; e.sp.position.addScaledVector(e.v, dt); e.sp.material.opacity = 1 - u * u; const k = e.s0 * (1 - 0.5 * u); e.sp.scale.set(k, k, 1);
  }
}
// des lumières toujours là (éteintes) : en ajouter une en plein jeu ferait recalculer tous les dessins (un à-coup)
const reserve = [];
for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffffff, 0, 5, 1.6); l.libre = true; scene.add(l); reserve.push(l); }
function prendre(coul, I, dist) { const l = reserve.find(r => r.libre); if (!l) return null; l.libre = false; l.color.setHex(coul); l.intensity = I; l.distance = dist; return l; }
function rendreL(l) { if (l) { l.intensity = 0; l.libre = true; } }
function eclair(p, coul, I, vie) { const l = prendre(coul, I, 6); if (!l) return; l.position.copy(p); parts.push({ lum: l, I, t: 0, vie }); }

// ================= LE BARDE =================
// Le luth, les mains : repris de l'essai 3D (repère du modèle glTF : y en haut, le Barde regarde vers +z, sa gauche vers +x).
// Ici il le tient toujours pour jouer ; il gratte sur le temps ; quand la note part, la main droite se tend vers la cible.
const LU = { centre: new THREE.Vector3(0.035, 0.846, -0.146), axe: new THREE.Vector3(-0.526, 0.85, 0.036).normalize(), face: new THREE.Vector3(-0.066, 0.001, -0.998).normalize() };
LU.cote = new THREE.Vector3().crossVectors(LU.axe, LU.face).normalize();
const MAIN = { paume: 0.075, paumeG: new THREE.Vector3(1, 0, 0), paumeD: new THREE.Vector3(-1, 0, 0) };
const GESTE = { monte: 0.07, tient: 0.2, duree: 0.38 };
const B = { R: null, mx: null, repos: null, OS: {}, luth: null, spineRepos: new THREE.Matrix4(), JEU: new THREE.Matrix4(), LUmat: new THREE.Matrix4(),
  geste: 9, coup: 9, mats: [], groupe: new THREE.Group(), ombre: null, bras: 0 };
B.groupe.position.copy(BARDE); B.groupe.rotation.y = Math.PI; scene.add(B.groupe);   // (de dos : il regarde Grosbec)
function preparerBarde(g) {
  const m = g.scene; B.R = m; m.traverse(o => { if (o.isMesh) { o.frustumCulled = false; if (o.material) { o.material = lueurAjoutee(o.material.clone()); o.material.envMapIntensity = 0.5; B.mats.push(o.material); } } });
  const bb = new THREE.Box3().setFromObject(m); m.scale.multiplyScalar(1.5 / (bb.max.y - bb.min.y)); B.groupe.add(m);
  m.updateMatrixWorld(true);
  for (const n of ['Hips', 'Spine', 'Spine01', 'neck', 'Head', 'RightArm', 'RightForeArm', 'RightHand', 'LeftArm', 'LeftForeArm', 'LeftHand']) B.OS[n] = m.getObjectByName(n);
  B.luth = m.getObjectByName('luth');
  if (B.luth) {
    B.luth.matrixAutoUpdate = false;
    B.spineRepos.copy(matM(m, B.OS.Spine)).invert();
    // la pose pour jouer : la caisse devant le ventre (un peu à droite), le manche vers sa gauche et vers le haut, les cordes vers l'avant
    const u = new THREE.Vector3(0.8, 0.5, 0.25).normalize(), n0 = new THREE.Vector3(0, 0.3, 1);
    const n = n0.sub(u.clone().multiplyScalar(n0.dot(u))).normalize(), w = new THREE.Vector3().crossVectors(u, n);
    const w0 = LU.cote.clone(), f0 = new THREE.Vector3().crossVectors(w0, LU.axe).normalize();
    const A = new THREE.Matrix4().makeBasis(LU.axe, f0, w0), Bm = new THREE.Matrix4().makeBasis(u, n, w);
    const Rm = Bm.multiply(A.transpose()), Pc = new THREE.Vector3(-0.06, 0.86, 0.24);
    B.JEU.copy(new THREE.Matrix4().makeTranslation(Pc.x, Pc.y, Pc.z)).multiply(Rm).multiply(new THREE.Matrix4().makeTranslation(-LU.centre.x, -LU.centre.y, -LU.centre.z));
  }
  if (g.animations[0]) { B.mx = new THREE.AnimationMixer(m); B.repos = B.mx.clipAction(g.animations[0]); B.repos.play(); }
  B.ombre = ombre(0.55); B.ombre.position.set(BARDE.x, 0.02, BARDE.z);
}
// le « repos » de Higgsfield fait tourner tout le corps : on garde le bassin face à Grosbec
const _tw = new THREE.Quaternion();
function redresser(R, act) {
  const hips = R && R.getObjectByName('Hips'); if (!hips || !act) return;
  const q = hips.quaternion; _tw.set(0, q.y, 0, q.w).normalize(); hips.quaternion.copy(q.clone().multiply(_tw.clone().invert()));
}
const _c = new THREE.Vector3();
function surLuth(le, cote, haut) { return LU.centre.clone().addScaledVector(LU.axe, le).addScaledVector(LU.face, haut).addScaledVector(LU.cote, cote).applyMatrix4(B.LUmat); }
function animerBarde(dt, tm) {
  if (!B.R) return;
  const R = B.R, battue = tm / temps(), ph = battue - Math.floor(battue), pouls = Math.exp(-ph * 5), sec = section(Math.floor(battue / 4));
  if (B.mx) B.mx.update(dt);
  redresser(R, B.repos);
  // il bat la mesure : la tête, les épaules ; au refrain, il danse (le bassin d'un côté puis de l'autre, il plie les genoux)
  B.bras += ((sec === 'refrain' ? 1 : 0) - B.bras) * Math.min(1, dt * 6);
  const pair = Math.floor(battue) % 2 ? 1 : -1;
  pencher(B.OS.neck, 0.09 * pouls + 0.05 * B.bras * pouls, 0, 0);
  pencher(B.OS.Spine01, 0.03 * pouls, 0, 0.05 * B.bras * pair * (1 - ph));
  pencher(B.OS.Hips, 0, 0, 0.04 * B.bras * pair * Math.sin(ph * Math.PI));
  B.groupe.position.y = BARDE.y - 0.035 * pouls * (0.4 + B.bras);
  // touché : il recule d'un pas, le buste en arrière, une lueur rouge
  B.coup += dt; const c = B.coup < 0.5 ? Math.sin(Math.min(1, B.coup / 0.12) * Math.PI / 2) * (1 - doux((B.coup - 0.12) / 0.38)) : 0;
  pencher(B.OS.Spine, -0.28 * c, 0, 0.08 * c); B.groupe.position.z = BARDE.z + 0.18 * c;
  for (const m of B.mats) m.userData.ajout.value.setRGB(0.32 * c, 0.03 * c, 0.02 * c);
  R.updateMatrixWorld(true);
  if (!B.luth) return;
  // le luth, tenu pour jouer
  const sp = matM(R, B.OS.Spine); B.LUmat.copy(sp.multiply(B.spineRepos).multiply(B.JEU));
  B.luth.matrix.copy(matM(R, B.luth.parent).invert().multiply(B.LUmat)); B.luth.matrixWorldNeedsUpdate = true; B.luth.updateMatrixWorld(true);
  const u = LU.axe.clone().transformDirection(B.LUmat), f = LU.face.clone().transformDirection(B.LUmat);
  const hautU = new THREE.Vector3(0, 1, 0).sub(u.clone().multiplyScalar(u.y)).normalize();
  // main gauche : derrière le manche, la paume contre lui
  const manche = surLuth(0.31 + 0.012 * Math.sin(tm * 9), 0, 0.0);
  const Fg = hautU.clone().multiplyScalar(0.8).addScaledVector(f, 0.45).normalize();
  const Pg = f.clone().sub(Fg.clone().multiplyScalar(f.dot(Fg))).normalize();
  const poignetG = manche.clone().addScaledVector(Pg, -0.032).addScaledVector(Fg, -MAIN.paume);
  // main droite : elle gratte deux fois par temps, plus fort sur le temps
  const g = Math.sin(battue * 2 * 2 * Math.PI), amp = 0.8 + 0.6 * pouls;
  const cordes = surLuth(0.05 + 0.015 * g * amp, 0.05 * g * amp, 0.05 + 0.014 * Math.abs(g) * amp);
  const Fd = hautU.clone().multiplyScalar(-0.85).addScaledVector(u, -0.35).normalize();
  const Pd = f.clone().negate().sub(Fd.clone().multiplyScalar(-f.dot(Fd))).normalize();
  let cibleR = cordes.clone().addScaledVector(Pd, -0.03).addScaledVector(Fd, -MAIN.paume), FdF = Fd, PdF = Pd;
  const S = posM(R, B.OS.RightArm);
  if (B.bras > 0.01) {   // le refrain : le bras droit en l'air, le poing qui cogne sur chaque temps
    const haut = S.clone().add(new THREE.Vector3(-0.1, 0.6 + 0.07 * pouls, 0.05));
    cibleR = cibleR.lerp(haut, B.bras); FdF = Fd.clone().lerp(new THREE.Vector3(-0.1, 1, 0.1).normalize(), B.bras).normalize();
    PdF = Pd.clone().lerp(new THREE.Vector3(0, 0, 1), B.bras); PdF.sub(FdF.clone().multiplyScalar(PdF.dot(FdF))).normalize();
  }
  B.geste += dt;
  if (B.geste < GESTE.duree) {   // la note part : la main droite quitte les cordes et se tend vers la cible (« et hop »)
    const k = B.geste < GESTE.monte ? doux(B.geste / GESTE.monte) : 1 - doux((B.geste - GESTE.tient) / (GESTE.duree - GESTE.tient));
    cibleR = cibleR.lerp(S.clone().add(new THREE.Vector3(-0.2, 0.17, 0.24)), k * (1 - B.bras));
    FdF = FdF.clone().lerp(new THREE.Vector3(-0.35, 0.75, 0.55).normalize(), k * (1 - B.bras)).normalize();
  }
  guider(R, B.OS.RightArm, B.OS.RightForeArm, B.OS.RightHand, cibleR, new THREE.Vector3(-0.7, -0.6, -0.3), 1);
  orienter(R, B.OS.RightHand, FdF, PdF, MAIN.paumeD, 1);
  guider(R, B.OS.LeftArm, B.OS.LeftForeArm, B.OS.LeftHand, poignetG, new THREE.Vector3(0.7, -0.6, -0.2), 1);
  orienter(R, B.OS.LeftHand, Fg, Pg, MAIN.paumeG, 1);
}
const bouchePos = () => B.luth ? LU.centre.clone().addScaledVector(LU.face, 0.05).applyMatrix4(B.LUmat).applyMatrix4(B.R.matrixWorld) : BARDE.clone().setY(1.0);

// ---------- les notes : elles partent du luth, une portée qui ondule derrière, elles frappent le golem visé ----------
const tirs = [], _dirCam = new THREE.Vector3();
function tirer(cible, or) {
  const N = NOTES[or ? 'or' : 'vert'], p0 = bouchePos(), gr = new THREE.Group(); gr.position.copy(p0); scene.add(gr);
  const halo = sprite(N.lueur, 0.5, true); halo.material.opacity = 0.5; halo.renderOrder = 3; gr.add(halo);
  const n = sprite(N.note, or ? 0.62 : 0.5, false); n.center.set(46 / 128, 1 - 94 / 128); n.renderOrder = 4; gr.add(n);
  const NB = 24, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  const uv = new Float32Array(NB * 2 * 2); for (let i = 0; i < NB; i++) { uv[i * 4] = i / (NB - 1) * 3; uv[i * 4 + 1] = 0; uv[i * 4 + 2] = i / (NB - 1) * 3; uv[i * 4 + 3] = 1; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const idx = []; for (let i = 0; i < NB - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } geo.setIndex(idx);
  const ruban = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: N.portee, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  ruban.frustumCulled = false; ruban.visible = false; ruban.renderOrder = 2; scene.add(ruban);
  const l = prendre(N.lum, 14, 4); if (l) l.position.copy(p0);
  tirs.push({ gr, n, l, ruban, N, or, cible, hist: [], NB, t: 0, petite: 0.04, p: p0.clone(), v: new THREE.Vector3(0, 2.2, 0) });
  B.geste = 0; etincelle(p0, N.lueur, 0.3, 1.2, 0.3);
}
const visee = g => g.o.position.clone().setY(g.o.position.y + GOLEMS[g.nom].haut * 0.62);
function avancerTirs(dt) {
  for (let i = tirs.length - 1; i >= 0; i--) {
    const s = tirs[i]; s.t += dt;
    const but = s.cible.o.parent ? visee(s.cible) : s.dernier || s.p, d = but.clone().sub(s.p), dd = d.length(); s.dernier = but;
    if (dd < 0.25 || s.t > 1.5) { finTir(s, i, dd < 0.25); continue; }
    // elle part en l'air (un petit arc), puis file droit sur la cible
    s.v.lerp(d.normalize().multiplyScalar(15), Math.min(1, dt * 9)); s.p.addScaledVector(s.v, dt);
    s.gr.position.copy(s.p); if (s.l) s.l.position.copy(s.p); s.n.material.rotation = Math.sin(s.t * 8) * 0.2;
    ruban(s);
    s.petite -= dt; if (s.petite <= 0 && s.hist.length > 6) { s.petite = 0.05; notePortee(s); }
    if (Math.random() < dt * 30) etincelle(s.p, s.N.lueur, 0.12, 0.6, 0.35);
  }
}
function finTir(s, i, touche) {
  rendreL(s.l); scene.remove(s.gr); s.gr.children.forEach(c => c.material.dispose()); scene.remove(s.ruban); s.ruban.geometry.dispose(); s.ruban.material.dispose(); tirs.splice(i, 1);
  if (!touche) return;
  eclair(s.p, s.N.boum, s.or ? 40 : 26, 0.4);
  for (let k = 0; k < (s.or ? 22 : 14); k++) etincelle(s.p, s.N.lueur, 0.16, 3, 0.45);
  toucher(s.cible, s.or ? 2 : 1);
}
function ruban(s) {
  const p = s.p.clone();
  if (s.hist.length < 2 || s.hist[1].distanceTo(p) > 0.04) { s.hist.unshift(p); if (s.hist.length > s.NB) s.hist.pop(); } else s.hist[0].copy(p);
  const H = s.hist, n = H.length; if (n < 3) return;
  camera.getWorldDirection(_dirCam);
  const pos = s.ruban.geometry.attributes.position, col = s.ruban.geometry.attributes.color, w = 0.22;
  for (let i = 0; i < s.NB; i++) {
    const k = Math.min(i, n - 1), a = H[Math.max(0, k - 1)], b = H[Math.min(n - 1, k + 1)];
    const d = a.clone().sub(b); if (d.lengthSq() < 1e-8) d.set(1, 0, 0); d.normalize();
    const o = new THREE.Vector3().crossVectors(d, _dirCam).normalize();
    const vague = 0.04 * Math.sin(s.t * 10 - i * 0.45) * Math.min(1, i / 5);
    const c = H[k].clone().addScaledVector(o, vague);
    const e = (i >= n - 1 ? 0 : 1) * Math.pow(1 - i / (s.NB - 1), 1.2) * Math.min(1, 0.35 + i / 3);
    pos.setXYZ(i * 2, c.x + o.x * w / 2, c.y + o.y * w / 2, c.z + o.z * w / 2);
    pos.setXYZ(i * 2 + 1, c.x - o.x * w / 2, c.y - o.y * w / 2, c.z - o.z * w / 2);
    col.setXYZ(i * 2, e, e, e); col.setXYZ(i * 2 + 1, e, e, e);
  }
  pos.needsUpdate = true; col.needsUpdate = true; s.ruban.visible = true;
}
function notePortee(s) {   // de petites notes posées sur la portée, qui restent derrière et s'éteignent
  const H = s.hist, k = 2 + Math.floor(Math.random() * Math.min(8, H.length - 3)), a = H[k - 1], b = H[k + 1];
  const d = a.clone().sub(b).normalize(); camera.getWorldDirection(_dirCam); const o = new THREE.Vector3().crossVectors(d, _dirCam).normalize();
  const p = H[k].clone().addScaledVector(o, (Math.floor(Math.random() * 5) - 2) * 0.045);
  const sp = sprite(s.N.petites[Math.random() < 0.5 ? 0 : 1], 0.12 + Math.random() * 0.04, true); sp.position.copy(p); scene.add(sp);
  parts.push({ sp, v: new THREE.Vector3(0, 0.25, 0), vie: 0.6, t: 0, s0: sp.scale.x, g: 0 });
}

// ================= LES GOLEMS D'ELYRA =================
// tous : la marche lente d'orc (Slow_Orc_Walk) ; le rôdeur : la marche de monstre. Comme dans le jeu : le rôdeur et le bélier avancent à
// chaque temps, les autres un temps sur deux. Leurs tailles suivent le jeu en 2D (le Barde 1,5 m). pv : ceux du jeu.
// Les mouvements (Higgsfield, 8 crédits chacun) : coup reçu, attaque (le bélier : sa charge tête baissée), mort.
const GOLEMS = {
  rodeur:        { tous: 1, haut: 1.0,  ombre: 0.4,  pv: 1, poids: 4, lourd: false },
  belier:        { tous: 1, haut: 1.3,  ombre: 0.65, pv: 3, poids: 2, lourd: true, fonce: true },
  faucheur:      { tous: 2, haut: 1.6,  ombre: 0.5,  pv: 2, poids: 2, lourd: true, faux: true },
  'porte-dalle': { tous: 2, haut: 1.45, ombre: 0.55, pv: 2, poids: 2, lourd: true, dalle: true },
  colosse:       { tous: 2, haut: 2.15, ombre: 0.9,  pv: 5, poids: 1, lourd: true },
};
const modeles = {};
// le pas d'une marche : quand chaque pied se pose, et de combien le corps avance par pas (pieds immobiles au sol)
function mesurerPas(base, clip) {
  const o = SkeletonUtils.clone(base), mx = new THREE.AnimationMixer(o), a = mx.clipAction(clip); a.play();
  const Tc = clip.duration, N = 160, pieds = ['LeftFoot', 'RightFoot'].map(n => o.getObjectByName(n)), hanche = o.getObjectByName('Hips');
  const y = [[], []], z = [[], []], p = new THREE.Vector3(), q = new THREE.Vector3();
  for (let i = 0; i < N; i++) { mx.setTime(Tc * i / N); o.updateMatrixWorld(true); hanche.getWorldPosition(q);
    pieds.forEach((f, k) => { f.getWorldPosition(p); y[k].push(p.y); z[k].push(p.z - q.z); }); }
  const poses = [], vit = [];
  for (let k = 0; k < 2; k++) {
    const mn = Math.min(...y[k]), mxh = Math.max(...y[k]), seuil = mn + (mxh - mn) * 0.12, haut = mn + (mxh - mn) * 0.4;
    let i0 = y[k].findIndex(v => v > haut), enl = true;
    for (let j = 1; j <= N; j++) { const i = (i0 + j) % N;
      if (enl && y[k][i] <= seuil) { poses.push({ t: Tc * i / N, k }); enl = false; } else if (!enl && y[k][i] > haut) enl = true; }
    const pts = []; for (let i = 0; i < N; i++) if (y[k][i] <= seuil) pts.push([Tc * i / N, z[k][i]]);
    if (pts.length > 4) { let sl = 0, c = 0; for (let j = 1; j < pts.length; j++) { const dt = pts[j][0] - pts[j - 1][0]; if (dt > 0 && dt < Tc / N * 1.5) { sl += (pts[j][1] - pts[j - 1][1]) / dt; c++; } } if (c) vit.push(Math.abs(sl / c)); }
  }
  poses.sort((a, b) => a.t - b.t);
  for (let i = poses.length - 1; i > 0; i--) if (poses[i].t - poses[i - 1].t < Tc / 12) poses.splice(i, 1);
  const ec = poses.map((p, i) => (i + 1 < poses.length ? poses[i + 1].t : poses[0].t + Tc) - p.t), med = [...ec].sort((a, b) => a - b)[ec.length >> 1];
  for (let i = poses.length - 1; i >= 0; i--) { const n = Math.round(ec[i] / med); for (let j = n - 1; j >= 1; j--) poses.splice(i + 1, 0, { t: (poses[i].t + ec[i] * j / n) % Tc }); }
  poses.sort((a, b) => a.t - b.t);
  const v = vit.length ? vit.reduce((s, x) => s + x, 0) / vit.length : 0.8;
  return { T: Tc, poses: poses.map(x => x.t), pas: v * Tc / Math.max(2, poses.length) };
}
// un objet tenu (la faux, la dalle) : rigide, rattaché à la main ; réglé une fois, dans la pose de départ, le golem de face
function tenir(o, nomOs, M, { haut, prise, devant }) {
  if (!M) return null; const os = o.getObjectByName(nomOs); if (!os) return null;
  const ry = o.rotation.y, pos = o.position.clone(), sc = o.scale.clone(); o.rotation.y = 0; o.position.set(0, 0, 0); o.updateMatrixWorld(true);
  const p = M.base.clone(); const bb = new THREE.Box3().setFromObject(M.base), h = bb.max.y - bb.min.y; p.scale.setScalar(haut / h);
  const m = new THREE.Vector3(); os.getWorldPosition(m);
  p.position.set(m.x - M.manche.x * haut / h, m.y - (M.manche.y0 + prise * h) * haut / h, m.z - M.manche.z * haut / h + devant);
  scene.add(p); p.updateMatrixWorld(true); os.attach(p);
  o.rotation.y = ry; o.position.copy(pos); o.scale.copy(sc); o.updateMatrixWorld(true); return p;
}
function manche(base) {
  base.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(base), h = bb.max.y - bb.min.y, v = new THREE.Vector3(); let sx = 0, sz = 0, n = 0;
  base.traverse(x => { if (!x.isMesh) return; const a = x.geometry.attributes.position; for (let i = 0; i < a.count; i += 3) { v.fromBufferAttribute(a, i).applyMatrix4(x.matrixWorld); if (v.y < bb.min.y + h * 0.3) { sx += v.x; sz += v.z; n++; } } });
  return { x: n ? sx / n : 0, z: n ? sz / n : 0, y0: bb.min.y };
}
// la charge du bélier court vers l'avant dans son film : on garde le rebond, on enlève l'avancée (c'est le jeu qui le déplace)
function surPlace(clip) {
  const k = clip && clip.tracks.find(t => t.name === 'Hips.position'); if (!k) return clip;
  const x0 = k.values[0], z0 = k.values[2]; for (let i = 0; i < k.values.length; i += 3) { k.values[i] = x0; k.values[i + 2] = z0; } return clip;
}

const vivants = [];
let nGolem = 0;
// où il va s'arrêter : un arc devant le Barde, du côté d'où il vient, sans se coller aux autres
function placeLibre(depuis, r) {
  const a0 = Math.atan2(depuis.x - BARDE.x, -(depuis.z - BARDE.z)), pris = vivants.filter(g => g.place && !g.mort).map(g => g.angle);
  let best = a0, bd = 1e9;
  for (let k = -12; k <= 12; k++) { const a = clamp(a0 + k * 0.12, -1.25, 1.25); if (pris.some(p => Math.abs(p - a) < 0.5)) continue; const d = Math.abs(a - a0); if (d < bd) { bd = d; best = a; } }
  const rr = CONTACT + r; return { angle: best, pos: new THREE.Vector3(BARDE.x + Math.sin(best) * rr, 0, BARDE.z - Math.cos(best) * rr) };
}
function sortir(nom, P, decale) {
  const M = modeles[nom]; if (!M) return null;
  const o = SkeletonUtils.clone(M.base), mats = [];
  o.traverse(x => { if (x.isMesh) { x.frustumCulled = false; x.material = lueurAjoutee(x.material.clone()); mats.push(x.material); } });
  o.position.copy(P.pos); if (decale) o.position.x += decale; scene.add(o);
  const mx = new THREE.AnimationMixer(o), A = {};
  for (const n of ['marche', 'repos', 'coup', 'attaque', 'mort']) if (M[n]) { A[n] = mx.clipAction(M[n]); A[n].play(); A[n].setEffectiveWeight(0); }
  A.marche.timeScale = 0; A.marche.setEffectiveWeight(1);
  for (const n of ['coup', 'attaque', 'mort']) if (A[n]) { A[n].setLoop(n === 'attaque' && GOLEMS[nom].fonce ? THREE.LoopRepeat : THREE.LoopOnce, 1); A[n].clampWhenFinished = true; A[n].stop(); }
  const G = GOLEMS[nom], pl = placeLibre(o.position, G.ombre * 1.2);   // (les gros s'arrêtent plus loin : le colosse ne cache pas le Barde)
  const g = { id: ++nGolem, nom, o, mx, A, mats, poids: { marche: 1 }, etat: 'sort', t: 0, pv: G.pv, P, depart: o.position.clone(), place: pl.pos, angle: pl.angle, b0: 0, k: -1,
    sh: ombre(G.ombre), flash: 0, apparu: 0, M, mort: false };
  o.lookAt(BARDE.x, 0, BARDE.z);
  if (G.dalle) g.dalle = tenir(o, 'LeftHand', modeles.dalle, { haut: 1.05, prise: 0.45, devant: 0.16 });
  if (G.faux) g.faux = tenir(o, 'RightHand', modeles.faux, { haut: 1.55, prise: 0.42, devant: 0.02 });
  for (const p of [g.dalle, g.faux]) if (p) p.traverse(x => { if (x.isMesh) { x.material = lueurAjoutee(x.material.clone()); mats.push(x.material); } });
  vivants.push(g); return g;
}
function poids(g, cibles, dt) {   // les mouvements glissent l'un vers l'autre (en 0,15 s)
  for (const n in g.A) { const a = g.A[n], w = a.getEffectiveWeight(), c = cibles[n] || 0; a.setEffectiveWeight(w + (c - w) * Math.min(1, dt * 9)); }
}
function jouerUneFois(g, n, duree) {   // un mouvement joué une fois, ralenti ou accéléré pour durer « duree » secondes
  const a = g.A[n]; if (!a) return 0; const d = a.getClip().duration; a.reset(); a.timeScale = duree ? clamp(d / duree, 0.6, 3) : 1; a.play(); return d / a.timeScale;
}
// touché par une note
function toucher(g, deg) {
  if (!g || g.mort || !g.o.parent) return;
  g.pv -= deg; g.flash = 1; if (ac) SON.touche(ac.currentTime);
  if (g.pv <= 0) { mourir(g); return; }
  if (g.etat === 'charge') return;   // (le bélier lancé ne s'arrête pas : dans le jeu, il faut le figer)
  g.avant = g.etat === 'marche' || g.etat === 'sort' ? 'marche' : 'garde';
  g.etat = 'touche'; g.t = 0; g.duree = jouerUneFois(g, 'coup', temps() * 1.3) || 0.5;
}
function mourir(g) {
  g.mort = true; g.etat = 'meurt'; g.t = 0; g.duree = jouerUneFois(g, 'mort', null) || 0.8; if (g.A.mort) g.A.mort.timeScale = 1.25, g.duree /= 1.25;
  if (ac) SON.meurt(ac.currentTime + 0.05);
}
const _p = new THREE.Vector3();
function majGolem(g, tm, dt) {
  const G = GOLEMS[g.nom], battue = tm / temps(), P = g.M.pas; g.t += dt;
  let cibles = {};
  g.flash = Math.max(0, g.flash - dt * 6);
  if (g.etat === 'sort') {   // il sort du portail : il grandit et s'allume, puis part sur un temps où il a le droit d'avancer
    const u = doux(g.t / 0.45); g.o.scale.setScalar(g.M.base.scale.x * (0.55 + 0.45 * u)); g.apparu = u;
    cibles = { marche: 1 }; g.A.marche.time = P.poses[0];
    if (g.t >= 0.45) { g.etat = 'marche'; g.b0 = Math.ceil(battue / G.tous + 0.01) * G.tous; g.depart.copy(g.o.position); g.k = -1; }
  } else if (g.etat === 'marche') {
    cibles = { marche: 1 };
    const x = (battue - g.b0) / G.tous;
    if (x < 0) g.A.marche.time = P.poses[0];
    else {
      const k = Math.floor(x), u = x - k, n = P.poses.length;
      const ta = P.poses[k % n] + Math.floor(k / n) * P.T, tb = P.poses[(k + 1) % n] + Math.floor((k + 1) / n) * P.T;
      g.A.marche.time = (ta + (tb - ta) * u) % P.T;   // le film de la marche, déformé pour que chaque pied se pose sur un temps
      if (k !== g.k) { g.k = k; if (ac) SON.pas(ac.currentTime, G.lourd); }
      const L = g.depart.distanceTo(g.place), fait = Math.min(L, (k + u) * P.pas);
      g.o.position.copy(g.depart).lerp(g.place, L > 0 ? fait / L : 1);
      if (G.fonce && L - fait < 3.0 && u < 0.2 && !g.fonce) {   // le bélier gratte le sol… et fonce
        g.fonce = true; g.etat = 'charge'; g.t = 0; if (g.A.attaque) { g.A.attaque.reset().play(); g.A.attaque.timeScale = 1.3; }
      } else if (fait >= L - 1e-3) { g.etat = 'garde'; g.t = 0; g.prochaine = Math.ceil(battue + 1); }
    }
  } else if (g.etat === 'charge') {   // tête baissée, à toute vitesse, jusqu'au Barde
    cibles = { attaque: g.A.attaque ? 1 : 0, marche: g.A.attaque ? 0 : 1 };
    const d = g.place.clone().sub(g.o.position); d.y = 0; const L = d.length(), pas = 4.5 * dt;
    if (L <= pas) { g.o.position.copy(g.place); frapperBarde(g); g.etat = 'garde'; g.t = 0; g.prochaine = Math.ceil(battue + 3); if (g.A.attaque) g.A.attaque.stop(); }
    else g.o.position.addScaledVector(d.normalize(), pas);
    if (Math.random() < dt * 25) etincelle(g.o.position.clone().setY(0.1), T.poussiere, 0.35, 0.8, 0.5, 0.6);
  } else if (g.etat === 'garde') {   // contre le Barde : il attend, puis frappe sur un temps
    cibles = { repos: 1 };
    if (battue >= g.prochaine && !G.fonce && g.A.attaque) { g.etat = 'attaque'; g.t = 0; g.duree = jouerUneFois(g, 'attaque', temps() * 2); g.frappe = false; }
    else if (battue >= g.prochaine && G.fonce) { g.prochaine = Math.ceil(battue + 4); frapperBarde(g); g.flash = 0.3; }
  } else if (g.etat === 'attaque') {
    cibles = { attaque: 1 };
    if (!g.frappe && g.t >= g.duree * 0.5) { g.frappe = true; frapperBarde(g); }
    if (g.t >= g.duree) { g.etat = 'garde'; g.t = 0; g.prochaine = Math.ceil(battue + 3); }
  } else if (g.etat === 'touche') {
    cibles = { coup: g.A.coup ? 1 : 0, marche: g.A.coup ? 0 : 1 };
    if (!g.A.coup) { g.o.rotateX(-0.25 * Math.sin(Math.min(1, g.t / g.duree) * Math.PI) * dt * 8); }
    if (g.t >= g.duree) {
      if (g.avant === 'marche') { g.etat = 'marche'; g.depart.copy(g.o.position); g.b0 = Math.ceil(battue / G.tous + 0.01) * G.tous; g.k = -1; }
      else { g.etat = 'garde'; g.t = 0; g.prochaine = Math.ceil(battue + 1); }
      g.o.lookAt(BARDE.x, g.o.position.y, BARDE.z);
    }
  } else if (g.etat === 'meurt') {
    cibles = { mort: g.A.mort ? 1 : 0, marche: g.A.mort ? 0 : 1 };
    if (!g.A.mort) g.o.rotation.x = -doux(g.t / g.duree) * 1.3;
    if (g.t >= g.duree + 0.35) { g.etat = 'fond'; g.t = 0; for (const m of g.mats) { m.transparent = true; m.depthWrite = true; } }
  } else if (g.etat === 'fond') {   // il s'effondre dans le sol, en braises rouges
    cibles = { mort: 1 };
    const u = g.t / 1.3; g.o.position.y = -0.7 * doux(u) * G.haut; for (const m of g.mats) m.opacity = 1 - doux(u);
    if (Math.random() < dt * 40) { _p.copy(g.o.position).setY(0.15 + Math.random() * 0.5 * G.haut * (1 - u)); _p.x += (Math.random() - 0.5) * G.ombre; etincelle(_p, T.braise, 0.18, 0.4, 0.9, 0.9); }
    if (u >= 1) { scene.remove(g.o); scene.remove(g.sh); g.sh.material.dispose(); vivants.splice(vivants.indexOf(g), 1); return; }
  }
  poids(g, cibles, dt);
  g.mx.update(g.etat === 'marche' || g.etat === 'sort' ? 0 : dt);
  // la lueur : rouge sombre en sortant du portail, blanche quand une note le touche
  const e = (1 - g.apparu) * 0.8; for (const m of g.mats) { m.userData.ajout.value.setRGB(e + g.flash * 0.45, g.flash * 0.6, g.flash * 0.4); if (g.etat === 'sort') { m.transparent = true; m.opacity = g.apparu; } else if (g.etat !== 'fond' && m.transparent && !g.mort) { m.transparent = false; m.opacity = 1; } }
  g.sh.position.set(g.o.position.x, 0.02, g.o.position.z); g.sh.material.opacity = g.etat === 'fond' ? 1 - doux(g.t / 1.3) : g.apparu;
}
function frapperBarde(g) {
  B.coup = 0; if (ac) SON.coup(ac.currentTime);
  const p = BARDE.clone().setY(0.9).lerp(g.o.position.clone().setY(0.9), 0.35);
  for (let k = 0; k < 10; k++) etincelle(p, T.rouge, 0.2, 2.2, 0.4);
  eclair(p, 0xff5030, 30, 0.35);
}

// ================= LES PORTAILS ROUGES DE GROSBEC =================
const texPortail = toile(256, 256, x => {
  x.translate(128, 128);
  const g = x.createRadialGradient(0, 0, 10, 0, 0, 125); g.addColorStop(0, 'rgba(40,0,0,.85)'); g.addColorStop(0.55, 'rgba(120,8,4,.55)'); g.addColorStop(0.8, 'rgba(255,60,20,.9)'); g.addColorStop(0.9, 'rgba(255,190,120,1)'); g.addColorStop(1, 'rgba(255,60,20,0)');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, 125, 0, 7); x.fill();
  x.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 9; k++) { x.rotate(Math.PI * 2 / 9); x.strokeStyle = `rgba(255,${80 + k * 12},40,.55)`; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 40 + k * 8, 0, 1.9); x.stroke(); }
});
const PORT = PORTAILS.map(P => {
  const tx = texPortail.clone(); tx.center.set(0.5, 0.5); const sp = sprite(tx, 1, true); sp.material.opacity = 0; sp.position.copy(P.pos).setY(1.25); sp.renderOrder = 1; scene.add(sp);
  const sl = aPlat(T.rouge, 2.4, 1.6, 0); sl.position.copy(P.pos).setY(0.015);
  const l = new THREE.PointLight(0xff3a20, 0, 6, 1.6); l.position.copy(P.pos).setY(1.1); scene.add(l);
  return { ...P, sp, sl, l, ouv: 0, cible: 0, t: 0, eclat: 0 };
});
function avancerPortails(dt, tm, sec) {
  const battue = tm / temps(), pouls = Math.exp(-(battue - Math.floor(battue)) * 4);
  for (const p of PORT) {
    p.ouv += (p.cible - p.ouv) * Math.min(1, dt * (p.cible > p.ouv ? 14 : 3));
    p.eclat = Math.max(0, p.eclat - dt * 2.5);
    const faible = sec === 'refrain' ? 0.35 + 0.25 * Math.random() : 1, o = p.ouv * faible;
    p.sp.scale.set(1.5 * o + 0.3 * p.eclat, 2.5 * o + 0.4 * p.eclat, 1); p.sp.material.opacity = Math.min(1, o * 1.2 + p.eclat); p.sp.material.map.rotation += dt * 2.2;
    p.sl.material.opacity = 0.7 * o + 0.4 * p.eclat; p.l.intensity = (18 + 8 * pouls) * o + 40 * p.eclat;
    if (o > 0.3 && Math.random() < dt * 20) etincelle(p.pos.clone().setY(0.3 + Math.random() * 2), T.rouge, 0.14, 0.5, 0.6, 0.6);
  }
}

// ================= GROSBEC (son modèle actuel, en attendant le nouveau) =================
// Il bat la mesure ; un temps avant qu'un portail s'ouvre, il tend la main de ce côté-là (la main gauche de l'écran pour le portail de
// gauche) ; au refrain, il subit : les mains sur les oreilles, il recule d'un pas, il chancelle.
const GB = { R: null, mx: null, attente: null, OS: {}, groupe: new THREE.Group(), geste: { cote: 0, t: 9, cible: null }, subit: 0, HAUT: 3.6 };
GB.groupe.position.copy(GROSBEC); scene.add(GB.groupe);
function preparerGrosbec(g) {
  const m = g.scene; GB.R = m;
  m.traverse(o => { if (o.isMesh) { o.frustumCulled = false; if (o.material) { o.material.envMapIntensity = 0.5; o.material.color.multiplyScalar(0.8); o.material.emissiveIntensity = 1;
    o.material.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', ['#include <emissivemap_fragment>',
      '  vec3 E0 = totalEmissiveRadiance; float lumE = max(E0.r, E0.g); float verre = smoothstep(0.45, 0.85, lumE);', '  totalEmissiveRadiance = E0 * (0.55 + 2.6 * verre);'].join('\n')); }; } } });
  const bb = new THREE.Box3().setFromObject(m); m.scale.multiplyScalar(GB.HAUT / (bb.max.y - bb.min.y)); GB.groupe.add(m);
  for (const n of ['Hips', 'Spine', 'Spine01', 'neck', 'Head', 'RightArm', 'RightForeArm', 'RightHand', 'LeftArm', 'LeftForeArm', 'LeftHand']) GB.OS[n] = m.getObjectByName(n);
  if (g.animations[0]) {   // son attente, ralentie (il est lourd) ; elle le tourne d'environ 25° : on le remet face au Barde
    GB.mx = new THREE.AnimationMixer(m); GB.attente = GB.mx.clipAction(g.animations[0]); GB.attente.timeScale = 0.7; GB.attente.play();
    const k = g.animations[0].tracks.find(k => k.name === 'Hips.quaternion');
    if (k) { let y = 0, w = 0; for (let i = 0; i < k.values.length; i += 4) { y += k.values[i + 1]; w += k.values[i + 3]; } m.rotation.y = -2 * Math.atan2(y, w); }
  }
  const lueur = aPlat(T.braise, 4.5, 2.8, 0.35); lueur.position.copy(GROSBEC).add(new THREE.Vector3(0, 0.01, 1.2));
  const c = ombre(1.3); c.position.copy(GROSBEC).setY(PALIER + 0.01);
}
function gesteGrosbec(P) { GB.geste = { cote: P.cote, t: 0, cible: P.pos.clone().setY(1.2) }; }
function animerGrosbec(dt, tm, sec) {
  if (!GB.R) return;
  const R = GB.R, battue = tm / temps(), ph = battue - Math.floor(battue), pouls = Math.exp(-ph * 5);
  if (GB.mx) GB.mx.update(dt);
  GB.subit += ((sec === 'refrain' ? 1 : 0) - GB.subit) * Math.min(1, dt * 3);
  const s = GB.subit;
  // il bat la mesure : le buste et la tête plongent sur chaque temps (lourdement)
  pencher(GB.OS.Spine01, 0.05 * pouls * (1 - s), 0, 0);
  pencher(GB.OS.neck, 0.1 * pouls * (1 - s), 0, 0);
  // au refrain : il recule, chancelle, se tord
  pencher(GB.OS.Spine, -0.18 * s, 0, 0.12 * s * Math.sin(tm * 5.5));
  pencher(GB.OS.neck, -0.12 * s, 0.25 * s * Math.sin(tm * 3.1), 0);
  GB.groupe.position.z = GROSBEC.z - 0.6 * s; GB.groupe.position.x = GROSBEC.x + 0.1 * s * Math.sin(tm * 2.7);
  R.updateMatrixWorld(true);
  if (s > 0.02) {   // les mains sur les oreilles (le casque)
    const tete = posM(R, GB.OS.Head);
    for (const [c, a, b, h] of [[1, 'LeftArm', 'LeftForeArm', 'LeftHand'], [-1, 'RightArm', 'RightForeArm', 'RightHand']]) {
      if (!GB.OS[a]) continue; const larg = posM(R, GB.OS.LeftArm).distanceTo(posM(R, GB.OS.RightArm)) * 0.55;
      guider(R, GB.OS[a], GB.OS[b], GB.OS[h], tete.clone().add(new THREE.Vector3(c * larg, 0.02, 0.08)), new THREE.Vector3(c, -0.3, -0.6), s);
    }
  }
  // le portail : il tend le bras vers lui (un temps avant ; il le tient, puis le laisse retomber)
  GB.geste.t += dt; const gt = GB.geste.t, T1 = temps();
  const w = gt < T1 ? doux(gt / (T1 * 0.7)) : 1 - doux((gt - T1 * 1.6) / (T1 * 1.2));
  if (w > 0.01 && GB.geste.cible && s < 0.5) {
    const [a, b, h] = GB.geste.cote < 0 ? ['RightArm', 'RightForeArm', 'RightHand'] : ['LeftArm', 'LeftForeArm', 'LeftHand'];   // (il nous fait face : sa droite est à gauche de l'écran)
    const S = posM(R, GB.OS[a]), vers = R.worldToLocal(GB.geste.cible.clone()).sub(S); vers.y = 0; vers.normalize();
    vers.x *= 3; vers.y = 0.45; vers.normalize();   // (le portail est loin devant : on ouvre le geste vers le côté, la main un peu haute)
    const cible = S.clone().addScaledVector(vers, 3);
    guider(R, GB.OS[a], GB.OS[b], GB.OS[h], cible, new THREE.Vector3(-GB.geste.cote * 0.3, -1, -0.4), w * (1 - s));
  }
}

// ================= LE CHEF D'ORCHESTRE : qui sort, d'où, quand ; le Barde qui joue tout seul =================
let derniere = -1, kPortail = 0, prevu = null;
const ORDRE = () => { const tot = Object.entries(GOLEMS).filter(([n]) => modeles[n]).reduce((s, [, G]) => s + G.poids, 0); let r = hasard() * tot;
  for (const [n, G] of Object.entries(GOLEMS)) { if (!modeles[n]) continue; r -= G.poids; if (r <= 0) return n; } return 'rodeur'; };
function surLeTemps(n) {   // à chaque temps (n : le numéro du temps)
  const b = n % 4, mesure = Math.floor(n / 4), sec = section(mesure), suiv = section(Math.floor((n + 1) / 4));
  const debout = vivants.filter(g => !g.mort);
  // un temps avant le temps fort : Grosbec tend le bras, le portail s'entrouvre
  if (b === 3 && suiv === 'combat' && debout.length < 5 && mesure % 2 === 0) {
    const P = PORT[[0, 3, 1, 2][kPortail++ % 4]]; prevu = { P, nb: debout.length < 2 ? 2 : 1 }; P.cible = 0.25; gesteGrosbec(P);
    if (ac) { SON.portail(ac.currentTime + temps() * 0.6); }
  }
  // le temps fort : le portail s'ouvre, un golem en sort (un deuxième, le temps d'après)
  if (b === 0 && prevu) { const { P, nb } = prevu; P.cible = 1; P.eclat = 1; sortir(ORDRE(), P); if (nb > 1) prevu = { P, nb: nb - 1, encore: true }; else { P.ferme = n + 2; prevu = null; } }
  else if (b === 1 && prevu && prevu.encore) { sortir(ORDRE(), prevu.P, -prevu.P.cote * 0.8); prevu.P.ferme = n + 2; prevu = null; }
  for (const P of PORT) if (P.ferme === n) { P.cible = 0; P.ferme = null; }
  if (sec === 'refrain' && b === 0 && section(mesure - 1) !== 'refrain') {   // le refrain commence : une onde dorée part du Barde
    for (let k = 0; k < 40; k++) etincelle(BARDE.clone().setY(1.0), NOTES.or.lueur, 0.3, 5, 0.7);
    eclair(BARDE.clone().setY(1.5), 0xffd060, 60, 0.8);
  }
  // le Barde joue : sur les temps (pas tous : il rate parfois, pour qu'on voie les golems frapper), deux fois plus fort au refrain
  const vise = debout.filter(g => g.etat !== 'sort' && g.o.position.distanceTo(BARDE) <= PORTEE).sort((a, c) => a.o.position.distanceTo(BARDE) - c.o.position.distanceTo(BARDE));
  const joue = sec === 'refrain' || (sec === 'combat' && b !== 3 && hasard() > 0.2);
  if (vise.length && joue) {
    const deja = tirs.filter(s => s.cible === vise[0]).length, c = deja && vise[1] ? vise[1] : vise[0];
    tirer(c, sec === 'refrain');
    if (ac) SON.note(ac.currentTime, GAMME[(n * 3 + b) % GAMME.length] * (sec === 'refrain' ? 2 : 1), sec === 'refrain');
  }
}

// ---------- la boucle ----------
const horloge = new THREE.Clock();
function image() {
  requestAnimationFrame(image);
  if (window.essai && window.essai.fige) return;
  pas(Math.min(0.05, horloge.getDelta()));
  renderer.render(scene, camera);
}
function pas(dt) {
  const tm = maintenant(), sec = section(Math.floor(tm / temps() / 4));
  if (enRoute) {
    if (ac && tmForce === null) programmerTemps();
    const n = Math.floor(tm / temps()); while (derniere < n) { derniere++; if (derniere >= 0) surLeTemps(derniere); }
  }
  for (let i = vivants.length - 1; i >= 0; i--) majGolem(vivants[i], tm, dt);
  avancerPortails(dt, tm, enRoute ? sec : 'entree');
  animerGrosbec(dt, tm, enRoute ? sec : 'entree');
  animerBarde(dt, tm);
  avancerTirs(dt); avancerParts(dt);
}

// ---------- départ ----------
window.addEventListener('resize', cadrer); cadrer();
const noms = Object.keys(GOLEMS);
const MOUV = { coup: 'coup', attaque: 'attaque', mort: 'mort' };
Promise.all([
  Promise.all(noms.map(n => Promise.all([charger(n), charger(n + '-marche'), peutEtre(n + '-coup'), peutEtre(n + (GOLEMS[n].fonce ? '-charge' : '-attaque')), peutEtre(n + '-mort')]))),
  charger('barde'), peutEtre('grosbec'), charger('dalle'), charger('faux'),
]).then(([gs, barde, grosbec, dalle, faux]) => {
  noms.forEach((n, i) => {
    const [g, m, coup, att, mort] = gs[i], base = g.scene;
    base.traverse(x => { if (x.isMesh) { x.frustumCulled = false; if (x.material) x.material.envMapIntensity = 0.6; } });
    const bb = new THREE.Box3().setFromObject(base); base.scale.multiplyScalar(GOLEMS[n].haut / (bb.max.y - bb.min.y));
    modeles[n] = { base, marche: m.animations[0], repos: g.animations[0], coup: coup && coup.animations[0], attaque: att && (GOLEMS[n].fonce ? surPlace(att.animations[0]) : att.animations[0]), mort: mort && mort.animations[0] };
    modeles[n].pas = mesurerPas(base, modeles[n].marche);
  });
  modeles.dalle = { base: dalle.scene, manche: manche(dalle.scene) }; modeles.faux = { base: faux.scene, manche: manche(faux.scene) };
  preparerBarde(barde); if (grosbec) preparerGrosbec(grosbec);
  window.PAS = Object.fromEntries(noms.map(n => [n, modeles[n].pas]));
  $('attente').hidden = true; $('lancer').hidden = false; window.PRET = true;
}).catch(e => { console.error(e); $('attente').textContent = '⚠ ' + e.message; });

function lancer() {
  graine = 7;
  ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume();
  t0 = ac.currentTime + 0.3; prochain = 0; derniere = -1; kPortail = 0; prevu = null; enRoute = true;
  for (const g of vivants.splice(0)) { scene.remove(g.o); scene.remove(g.sh); }
  for (const P of PORT) { P.cible = 0; P.ouv = 0; P.ferme = null; }
  $('lancer').hidden = true; $('tempos').hidden = false;
}
$('lancer').onclick = lancer;
document.querySelectorAll('#tempos button').forEach(b => b.onclick = () => {
  bpm = +b.dataset.bpm; document.querySelectorAll('#tempos button').forEach(x => x.classList.toggle('choisi', x === b)); lancer();
});
// pour les essais sans écran : avancer le temps à la main, sortir et placer des golems, photographier
window.essai = {
  fige: false, sortir: (nom, i) => sortir(nom, PORT[i]), vivants, PORT, BARDE, GROSBEC, sol, camera,
  avancer: (secondes, pasDt = 1 / 30) => { for (let t = 0; t < secondes - 1e-6; t += pasDt) { tmForce = (tmForce || 0) + pasDt; pas(pasDt); } },
  demarrer: () => { tmForce = 0; enRoute = true; derniere = -1; graine = 7; },
  temps: t => { tmForce = t; }, tirer: i => tirer(vivants[i], false), toucher: (i, d) => toucher(vivants[i], d || 1), coupBarde: () => { B.coup = 0; },
  rendre: () => renderer.render(scene, camera), cadrer,
};
image();
