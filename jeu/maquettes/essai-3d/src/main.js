/* L'essai « en vraie 3D » (Brumeval, phase 2, 27 novembre) : juger l'image, pas le jeu.
   - La salle de l'armure rendue une fois par Blender, en très grand (deux fois plus fin que le jeu), avec sa profondeur.
   - Le Barde en vrai volume (modèle 3D fait par Higgsfield / Meshy, avec un squelette et des mouvements tout faits),
     éclairé en direct par les mêmes lumières que la salle (brasiers, lanternes, la lueur de l'armure, la fente du plafond).
   - Il passe derrière ce qui est devant lui (les lanternes) grâce à la profondeur de l'image.
   - Un sort : la note de feu (une vraie lumière qui l'éclaire au passage) ; la note glacée. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const T = 40, K = 0.62, OX = 70, OY = 250, SW = 860, SH = 556;
const THETA = Math.asin(K), ZS = 1 / Math.cos(THETA);
const L = { L: 18, P: 10.5, coin: 3.4 }, ARM = { x: 9, y: 1.25, r: 1.6 };
const LANT = { or: [1.2, 5.6], rouge: [16.8, 5.6] };
const BRAS = [[5.15, 0.75, 2.6], [12.85, 0.75, 2.6], [0.42, 3.85, 2.3], [17.58, 3.85, 2.3]];
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

/* ---------- l'écran ---------- */
const can = $('jeu');
const rendu = new THREE.WebGLRenderer({ canvas: can, antialias: true, powerPreference: 'high-performance' });
rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
rendu.outputColorSpace = THREE.SRGBColorSpace;
rendu.toneMapping = THREE.ACESFilmicToneMapping; rendu.toneMappingExposure = 1.0;
rendu.shadowMap.enabled = true; rendu.shadowMap.type = THREE.PCFSoftShadowMap;
rendu.autoClear = true; rendu.setClearColor(0x030406, 1);
let Ws = 860, Hs = 410, camX = 0, camY = 0;
function taille() {
  const vw = innerWidth, vh = innerHeight;
  Hs = Math.max(410, 800 * vh / vw) / (window.__zoom || 1); Ws = Hs * vw / vh;
  rendu.setSize(vw, vh, false);
}
addEventListener('resize', taille); taille();

/* ---------- la caméra : exactement celle de Blender (decor3d/base.py) ---------- */
const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);
const d = new THREE.Vector3(0, Math.cos(THETA), -Math.sin(THETA)), up = new THREE.Vector3(0, Math.sin(THETA), Math.cos(THETA));
const vise = new THREE.Vector3((SW / 2 - OX) / T, -(SH / 2 - OY) / (T * K), 0);
cam.position.copy(vise).addScaledVector(d, -120); cam.up.copy(up); cam.lookAt(vise);
function cadrer() {
  cam.left = (camX - SW / 2) / T; cam.right = (camX + Ws - SW / 2) / T;
  cam.top = (SH / 2 - camY) / T; cam.bottom = (SH / 2 - camY - Hs) / T;
  cam.updateProjectionMatrix();
}
/* le monde du jeu : x à droite, y vers nous, z en haut ; étiré en hauteur comme la salle de Blender */
const monde = new THREE.Group(); monde.scale.set(1, 1, ZS); scene.add(monde);
const G = (x, y, z) => new THREE.Vector3(x, -y, z || 0);
const px = x => OX + x * T, py = (y, z) => OY + y * T * K - (z || 0) * T;

/* ---------- le fond : l'image et sa profondeur (une seule fois, en très grand) ---------- */
const chargeur = new THREE.TextureLoader();
const fond = chargeur.load('fond.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; pret('fond'); });
const prof = chargeur.load('prof.png', t => { t.colorSpace = THREE.NoColorSpace; t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; pret('prof'); });
const fondMat = new THREE.ShaderMaterial({
  uniforms: { fond: { value: fond }, prof: { value: prof }, fen: { value: new THREE.Vector4(0, 0, 1, 1) } },
  vertexShader: 'varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `uniform sampler2D fond; uniform sampler2D prof; uniform vec4 fen; varying vec2 vU;
    void main(){
      vec2 uv = vec2(mix(fen.x, fen.z, vU.x), 1.0 - mix(fen.w, fen.y, vU.y));
      vec4 c = texture2D(fond, uv);
      vec4 p = texture2D(prof, uv);
      float z = 90.0 + (p.r * 255.0 * 256.0 + p.g * 255.0) / 65535.0 * 60.0 + 0.12;
      gl_FragDepth = (z - 1.0) / 399.0;
      gl_FragColor = c;
      #include <colorspace_fragment>
    }`,
  depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true, toneMapped: false   // (sans test, WebGL n'écrit pas la profondeur)
});
const fondQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fondMat); fondQuad.frustumCulled = false; fondQuad.renderOrder = -10;
scene.add(fondQuad);

/* ---------- les lumières : les mêmes que dans Blender (decor3d/salle.py, REG) ---------- */
scene.add(new THREE.HemisphereLight(0x9aaee0, 0x5a3e2c, 1.1));
{ const pm = new THREE.PMREMGenerator(rendu); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35; }
const lumieres = [];
function lampe(coul, x, y, z, I, dist) { const l = new THREE.PointLight(coul, I, dist, 1.6); l.position.copy(G(x, y, z)); monde.add(l); lumieres.push(l); return l; }
const brasiers = BRAS.map(b => lampe(0xff8a3a, b[0], b[1] + 0.3, b[2] + 0.5, 40, 10));
const lanOr = lampe(0xffc060, LANT.or[0] + 0.5, LANT.or[1] + 0.35, 2.0, 30, 8);
const lanRouge = lampe(0xff3a24, LANT.rouge[0] - 0.5, LANT.rouge[1] + 0.35, 2.0, 30, 8);
const lueurArmure = lampe(0xffa860, ARM.x, ARM.y + 1.2, 2.8, 45, 11);
const fente = new THREE.SpotLight(0x8fb0ff, 60, 30, 0.42, 0.6, 1.2);
fente.position.copy(G(7.0, 3.0, 16)); fente.target.position.copy(G(8.4, 6.6, 0)); monde.add(fente, fente.target);
fente.castShadow = true; fente.shadow.mapSize.set(1024, 1024); fente.shadow.camera.near = 5; fente.shadow.camera.far = 30; fente.shadow.bias = -0.0005;
const face = new THREE.DirectionalLight(0xd8dcff, 1.3); face.position.copy(G(9, 26, 9)); face.target.position.copy(G(9, 4, 1)); monde.add(face, face.target);
/* l'ombre du héros sur le sol : un sol invisible qui ne montre que les ombres */
const solOmbre = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.ShadowMaterial({ opacity: 0.5 }));
solOmbre.position.copy(G(9, 5, 0.002)); solOmbre.receiveShadow = true; monde.add(solOmbre);

/* ---------- des petites images qui brillent (peintes une fois) ---------- */
function toile(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const texLueur = coul => toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, coul); g.addColorStop(0.5, coul.replace(/[\d.]+\)$/, '0.35)')); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
const texFlamme = toile(32, 48, x => { x.beginPath(); x.moveTo(16, 2); x.bezierCurveTo(22, 14, 30, 24, 28, 34); x.bezierCurveTo(26, 44, 6, 44, 4, 34); x.bezierCurveTo(2, 24, 10, 14, 16, 2); const g = x.createLinearGradient(0, 44, 0, 2); g.addColorStop(0, 'rgba(255,250,210,1)'); g.addColorStop(0.3, 'rgba(255,190,60,.95)'); g.addColorStop(0.65, 'rgba(255,90,20,.7)'); g.addColorStop(1, 'rgba(180,20,10,0)'); x.fillStyle = g; x.fill(); });
const texNote = (coul, dbl) => toile(64, 72, x => { x.translate(32, 40); x.lineCap = 'round'; x.lineJoin = 'round';
  const tige = () => { x.beginPath(); if (dbl) { x.moveTo(-6, 15); x.lineTo(-6, -26); x.lineTo(18, -34); x.lineTo(18, 7); x.moveTo(-6, -16); x.lineTo(18, -24); } else { x.moveTo(7, 13); x.lineTo(7, -29); x.quadraticCurveTo(21, -19, 19, -3); } };
  const tete = () => { x.beginPath(); if (dbl) { x.ellipse(-13, 16, 9, 7, -0.4, 0, 7); x.moveTo(20, 8); x.ellipse(11, 8, 9, 7, -0.4, 0, 7); } else x.ellipse(-2, 16, 10, 8, -0.4, 0, 7); };
  x.strokeStyle = coul; x.lineWidth = 6; tige(); x.stroke(); x.fillStyle = coul; tete(); x.fill(); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 2; tige(); x.stroke(); });
const texNoteBrillante = (coeur, lueur, bord) => toile(128, 128, x => { x.translate(60, 64); x.lineCap = 'round'; x.lineJoin = 'round';
  const forme = () => { x.beginPath(); x.ellipse(-14, 30, 19, 14, -0.45, 0, 7); x.fill(); x.beginPath(); x.moveTo(1, 26); x.lineTo(1, -46); x.stroke();
    x.beginPath(); x.moveTo(1, -46); x.bezierCurveTo(22, -36, 34, -22, 30, -2); x.bezierCurveTo(28, -14, 18, -22, 3, -26); x.fill(); };
  x.shadowColor = lueur; x.shadowBlur = 20; x.fillStyle = lueur; x.strokeStyle = lueur; x.lineWidth = 11; forme();
  x.shadowBlur = 0; x.fillStyle = bord; x.strokeStyle = bord; x.lineWidth = 9; forme();   // (un bord foncé : on reconnaît la forme de la note)
  x.fillStyle = coeur; x.strokeStyle = coeur; x.lineWidth = 4.5; x.save(); x.scale(0.86, 0.86); forme(); x.restore(); });
const texPortee = coul => { const t = toile(64, 128, x => { x.shadowColor = coul; x.shadowBlur = 10; x.strokeStyle = coul; x.lineWidth = 7;
    for (let k = 0; k < 5; k++) { const y = 14 + k * 25; x.beginPath(); x.moveTo(-10, y); x.lineTo(74, y); x.stroke(); }
    x.shadowBlur = 0; x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 2.5; for (let k = 0; k < 5; k++) { const y = 14 + k * 25; x.beginPath(); x.moveTo(-10, y); x.lineTo(74, y); x.stroke(); } });
  t.wrapS = THREE.RepeatWrapping; return t; };
const texFlocon = toile(48, 48, x => { x.translate(24, 24); x.strokeStyle = 'rgba(235,250,255,1)'; x.shadowColor = 'rgba(140,220,255,1)'; x.shadowBlur = 6; x.lineWidth = 2.5; x.lineCap = 'round';
  for (let k = 0; k < 6; k++) { x.save(); x.rotate(k * Math.PI / 3); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -18); x.moveTo(0, -10); x.lineTo(-5, -15); x.moveTo(0, -10); x.lineTo(5, -15); x.stroke(); x.restore(); } });
/* la goutte d'acide (une larme jaune-vert qui brille) */
const texGoutte = toile(32, 48, x => { x.beginPath(); x.moveTo(16, 3); x.bezierCurveTo(20, 14, 27, 22, 27, 31); x.arc(16, 31, 11, 0, Math.PI); x.bezierCurveTo(5, 22, 12, 14, 16, 3);
  x.shadowColor = 'rgba(190,255,40,1)'; x.shadowBlur = 8; const g = x.createLinearGradient(0, 4, 0, 44); g.addColorStop(0, 'rgba(240,255,170,1)'); g.addColorStop(1, 'rgba(150,215,10,1)'); x.fillStyle = g; x.fill();
  x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.ellipse(12, 30, 2.5, 4, 0.3, 0, 7); x.fill(); });
/* chaque sort a sa couleur : la glace (bleu), le feu (orange), l'acide (jaune-vert qui pique), le soin (vert doux) */
const NOTE_SORT = { glace: texNoteBrillante('#eefbff', 'rgba(120,210,255,1)', 'rgba(25,90,170,1)'), feu: texNoteBrillante('#fff3d6', 'rgba(255,140,40,1)', 'rgba(150,50,10,1)'),
  acide: texNoteBrillante('#f6ffc4', 'rgba(195,255,20,1)', 'rgba(70,105,0,1)'), soin: texNoteBrillante('#effff2', 'rgba(120,235,160,1)', 'rgba(35,130,75,1)') };
const PORTEE = { glace: texPortee('rgba(150,225,255,1)'), feu: texPortee('rgba(255,170,70,1)'), acide: texPortee('rgba(200,255,50,1)') };
const PETITES = { glace: [texNote('#e6f8ff', false), texNote('#e6f8ff', true)], feu: [texNote('#ffd9a0', false), texNote('#ffd9a0', true)], acide: [texNote('#eaff8a', false), texNote('#eaff8a', true)], soin: [texNote('#d2ffdc', false), texNote('#d2ffdc', true)], or: [texNote('#ffe7a6', false), texNote('#ffe7a6', true)] };
const T_LUEUR = { or: texLueur('rgba(255,200,90,.95)'), feu: texLueur('rgba(255,120,40,.95)'), glace: texLueur('rgba(140,220,255,.95)'), rouge: texLueur('rgba(255,70,40,.95)'), poussiere: texLueur('rgba(225,205,175,.55)'),
  acide: texLueur('rgba(190,255,40,.95)'), fumee: texLueur('rgba(215,240,150,.5)'), soin: texLueur('rgba(130,240,165,.95)'),
  violet: texLueur('rgba(175,110,255,.95)'), fumeeOmbre: texLueur('rgba(70,30,120,.55)') };
const SORTS = {
  glace: { lum: 0x7fd8ff, I: 22, dist: 5, v: 12, taille: 1.2, sol: 1.8, petite: '#d8f6ff', charge: 0x8fe0ff, boum: 0x9fe8ff, main: 0xa8e8ff },
  feu: { lum: 0xff7a2a, I: 40, dist: 7, v: 9, taille: 1.45, sol: 2.6, petite: '#ffc070', charge: 0xff8a3a, boum: 0xff8a3a, main: 0xffa050 },   // (la note de feu plus grosse : c'est le gros sort)
  acide: { lum: 0xb8ff30, I: 26, dist: 5.5, v: 11, taille: 1.2, sol: 2.0, petite: '#e2ff7a', charge: 0xc4ff40, boum: 0xc8ff40, main: 0xd0ff60 },
  soin: { petite: '#c8ffd6', charge: 0x8dffb0, main: 0xa0ffc0 },
};
function sprite(tex, s, add) { const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false }); const sp = new THREE.Sprite(m); sp.scale.set(s, s, 1); return sp; }
/* les flammes des brasiers, la lumière des lanternes */
const flammes = [];
for (const b of BRAS) {
  const gr = new THREE.Group(); gr.position.copy(G(b[0], b[1], b[2] + 0.02)); monde.add(gr);
  const halo = sprite(T_LUEUR.feu, 1.6, true); halo.position.z = 0.25; halo.material.opacity = 0.55; halo.material.depthTest = false; gr.add(halo);
  for (let i = 0; i < 3; i++) { const f = sprite(texFlamme, 0.45, true); f.center.set(0.5, 0.05); f.material.depthTest = false; gr.add(f); flammes.push({ f, i, b }); }
}
for (const n of ['or', 'rouge']) { const s = sprite(T_LUEUR[n], 1.4, true); s.position.copy(G(LANT[n][0], LANT[n][1], 1.95)); s.material.opacity = 0.7; s.material.depthTest = false; monde.add(s); }

/* ---------- le Barde ---------- */
const incline = new THREE.Group(); monde.add(incline);   // (pour pencher tout le corps : le dérapage)
const barde = new THREE.Group(); incline.add(barde);
const corps = new THREE.Group(); corps.rotation.x = Math.PI / 2; barde.add(corps);   // (les modèles glTF ont la hauteur en y)
const ombrePied = sprite(toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), 1, false);
const ombreMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshBasicMaterial({ map: ombrePied.material.map, transparent: true, depthWrite: false, toneMapped: false }));
ombreMesh.position.z = 0.004; barde.add(ombreMesh);
const h = { x: 9, y: 7.6, a: -Math.PI / 2, sort: null, sortT: 0, sortD: 0, luth: 'dos', tl: 0, garde: 0 };
let melangeur = null, actions = {}, enCours = null;
/* La page Claude interdit de « télécharger » une adresse data: : le modèle est donc rangé en base64 dans un
   .json de la page (lu avec fetch, permis), décodé ici, puis lu d'un bloc ; les images passent par <img> (permis). */
const gl = new GLTFLoader();
gl.register(p => { p.textureLoader = new THREE.TextureLoader(p.options.manager); return { name: 'images_par_img' }; });
function charger(fichier, ok, ko) {
  fetch(fichier).then(r => { if (!r.ok) throw new Error(fichier + ' : ' + r.status); return r.json(); }).then(j => {
    const t = atob(j.glb), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i);
    gl.parse(u.buffer, '', ok, ko);
  }).catch(ko);
}
const ANIMS = window.ANIMS || {};
const PIST = window.QUI === 'pisteur';   // (le héros choisi sur le premier écran : le Barde ou le Pisteur)
charger(PIST ? 'pisteur.json' : 'barde.json', g => {
  const m = g.scene; m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; if (o.material) { o.material.metalness = 0; o.material.envMapIntensity = 0.5; } } });
  m.scale.setScalar(1.55 / 1.5);   // (le modèle fait 1,5 m ; un héros fait environ 1,55 pas)
  corps.add(m); melangeur = new THREE.AnimationMixer(m);
  if (PIST) preparerPisteur(m); else preparerLuth(m);
  if (g.animations.length) actions.garde = melangeur.clipAction(g.animations[0]);
  let reste = Object.keys(ANIMS).length; if (!reste) pret('barde');
  for (const [nom, fichier] of Object.entries(ANIMS)) charger(fichier, a => { if (a.animations[0]) { const act = melangeur.clipAction(a.animations[0]); if (actions[nom] && actions[nom] !== act) actions[nom].stop(); actions[nom] = act; /* (sinon l'ancien mouvement continue en douce, à plein poids : il « flottait ») */ if (nom === 'feu' || nom === 'glace') { act.setLoop(THREE.LoopOnce); act.clampWhenFinished = true; } } if (--reste === 0) pret('barde'); }, () => { if (--reste === 0) pret('barde'); });
  if (actions.garde) actions.garde.play();
}, e => { $('charge').textContent = '⚠'; console.error(e); });
/* ---------- marcher, courir, le demi-tour ----------
   Le pouce un peu poussé : il marche (de son rythme à 1,6 fois plus vite) ; le pouce au bord : il court (la charge, à son vrai rythme).
   Jamais de jambes au ralenti (c'est ce qui donnait l'impression de flotter). En pleine course, si le pouce part d'un coup à
   l'opposé : il repart tout de suite dans l'autre sens, le corps dérape un quart de seconde (fait par programme, sans film).
   Les vitesses sont mesurées sur les pieds des mouvements (outils/pas.py), en pas du jeu (le Barde fait 1,55 pas). */
const ALLURE = PIST ? {
  marche: { vitesse: 0.60, max: 1.0 },       // Casual_Walk (le même que le Barde)
  course: { vitesse: 4.4 },                   // RunFast : ses pieds reculent de 4,2 m/s (outils/coups.py) : 4,4 pas/s
  furtif: { vitesse: 1.26, min: 1.0, max: 1.8 },   // Cautious_Crouch_Walk_Forward : 1,22 m/s, accroupi, dans l'ombre
} : {
  marche: { vitesse: 0.60, max: 1.0 },       // Casual_Walk : 0,58 m/s
  course: { vitesse: 4.0 },                   // Standard_Forward_Charge : 3,95 m/s (on court à 4 pas/s, au rythme du film)
};
const LOCO = PIST ? ['garde', 'marche', 'course', 'furtif', 'guet'] : ['garde', 'marche', 'course'];
const loco = { garde: 1, marche: 0, course: 0, furtif: 0, guet: 0, v: 0, allure: 'garde', tm: 1.619, tc: 0, tf: 0 };
/* déplacer le héros et choisir son allure ; mx, my : le pouce (ou le clavier) */
function avancerHeros(dt, mx, my) {
  const m = Math.min(1, Math.hypot(mx, my)), dirA = Math.atan2(my, mx);
  let veut = 'garde';
  if (!h.sort && m > 0.15) veut = (m >= 0.85 || (loco.allure === 'course' && m >= 0.75)) ? 'course' : 'marche';
  if (PIST && h.ombre) {   // dans l'ombre : accroupi, à pas de loup (jamais de course)
    const vf = m > 0.15 ? ALLURE.furtif.min + (ALLURE.furtif.max - ALLURE.furtif.min) * clamp((m - 0.15) / 0.7, 0, 1) : 0;
    loco.v += clamp(vf - loco.v, -10 * dt, 8 * dt); if (m > 0.15) h.a = dirA;
    loco.allure = m > 0.15 || loco.v > 0.1 ? 'furtif' : 'guet';
    if (loco.v > 0.001) { const nx = h.x + Math.cos(h.a) * loco.v * dt, ny = h.y + Math.sin(h.a) * loco.v * dt; if (libre(nx, h.y)) h.x = nx; if (libre(h.x, ny)) h.y = ny; }
    return;
  }
  if (PIST && (loco.allure === 'furtif' || loco.allure === 'guet')) loco.allure = loco.v > 0.05 ? 'marche' : 'garde';
  // le demi-tour : seulement en pleine course, quand le pouce part à l'opposé
  if (!h.derap && veut === 'course' && loco.allure === 'course' && loco.v > 3.2) {
    const ecart = Math.abs(Math.atan2(Math.sin(dirA - h.a), Math.cos(dirA - h.a)));
    if (ecart > 140 * Math.PI / 180) {   // il repart tout de suite dans l'autre sens ; le corps dérape un quart de seconde (pour faire joli)
      const rz1 = Math.PI / 2 - dirA; let da = rz1 - barde.rotation.z; da = Math.atan2(Math.sin(da), Math.cos(da));
      h.derap = { t: 0, rz0: barde.rotation.z, da, a1: dirA, aOld: h.a }; loco.v *= 0.65; poussiere(h.x, h.y, h.a);
    }
  }
  const vc = veut === 'garde' ? 0 : veut === 'marche' ? ALLURE.marche.vitesse + (ALLURE.marche.max - ALLURE.marche.vitesse) * clamp((m - 0.15) / 0.7, 0, 1) : ALLURE.course.vitesse;
  loco.v += clamp(vc - loco.v, -14 * dt, 10 * dt);
  if (veut !== 'garde') h.a = dirA;
  loco.allure = veut === 'course' ? 'course' : veut === 'marche' ? (loco.allure === 'course' && loco.v > 1.6 ? 'course' : 'marche') : (loco.v > 1.6 && loco.allure === 'course' ? 'course' : loco.v > 0.05 ? (loco.allure === 'garde' ? 'marche' : loco.allure) : 'garde');
  if (loco.v > 0.001 && !window.__surplace) { const nx = h.x + Math.cos(h.a) * loco.v * dt, ny = h.y + Math.sin(h.a) * loco.v * dt; if (libre(nx, h.y)) h.x = nx; if (libre(h.x, ny)) h.y = ny; }
}
function locomotion(dt) {
  const k = Math.min(1, dt * 10); let somme = 0;
  for (const n of LOCO) { loco[n] += ((loco.allure === n ? 1 : 0) - loco[n]) * k; somme += loco[n]; }
  for (const n of LOCO) loco[n] /= somme || 1;
  loco.tm += dt * clamp(loco.v / ALLURE.marche.vitesse, 0.8, 1.7);
  loco.tc += dt * Math.max(0.85, loco.v / ALLURE.course.vitesse);
  if (ALLURE.furtif) loco.tf += dt * clamp(loco.v / ALLURE.furtif.vitesse, 0.8, 1.7);
  const ws = poidsSaut(), wc = PIST ? poidsCoup() : 0, wx = Math.max(ws, wc);
  if (actions.saut) { const a = actions.saut; if (!a.__lance) { a.play(); a.__lance = true; } a.timeScale = 0; a.setEffectiveWeight(ws); a.time = h.saut ? Math.min(SAUT.depart + h.saut.t * SAUT.vitesse, a.getClip().duration - 1e-3) : 0; }
  if (PIST) animerCoups(wc);
  for (const n of LOCO) {
    const a = actions[n]; if (!a) continue;
    if (!a.__lance) { a.play(); a.__lance = true; }
    a.setEffectiveWeight(loco[n] * (1 - wx));
    if (n === 'garde' || n === 'guet') continue;
    a.timeScale = 0; const d = a.getClip().duration;
    if (n === 'marche') a.time = loco.tm % d;
    else if (n === 'course') a.time = loco.tc % d;
    else if (n === 'furtif') a.time = loco.tf % d;
  }
}
function jouer(nom, fondu) {
  const a = actions[nom] || actions.garde; if (!a || a === enCours) return;
  a.reset().setEffectiveWeight(1).play(); if (enCours) a.crossFadeFrom(enCours, fondu || 0.25, true); enCours = a;
}

/* ---------- le luth : sur le dos quand il court ; pendant un sort, il l'attrape par-dessus l'épaule, le ramène devant, gratte, et la note part du luth ----------
   Tout se calcule dans le repère du modèle (glTF : y en haut, le Barde regarde vers +z, sa gauche vers +x). */
const LU = { centre: new THREE.Vector3(0.035, 0.846, -0.146), axe: new THREE.Vector3(-0.526, 0.85, 0.036).normalize(), face: new THREE.Vector3(-0.066, 0.001, -0.998).normalize() };
const DUREE = { glace: 1.5, feu: 3.0, soin: 2.0, acide: 1.5 };   // (comme dans le jeu : javelot de glace 1,5 s, boule de feu 3 s, soin 2 s ; l'acide : 1,5 s en attendant que Romain décide)
let MOD = null, LUTH = null, OS = {}, spineRepos = new THREE.Matrix4(), JEU = new THREE.Matrix4();
const _m = new THREE.Matrix4(), _mi = new THREE.Matrix4(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
function preparerLuth(m) {
  MOD = m; m.updateMatrixWorld(true);
  for (const n of ['Spine', 'RightArm', 'RightForeArm', 'RightHand', 'LeftArm', 'LeftForeArm', 'LeftHand']) OS[n] = m.getObjectByName(n);
  LUTH = m.getObjectByName('luth'); if (!LUTH) return;
  LUTH.matrixAutoUpdate = false;
  spineRepos.copy(matM(OS.Spine)).invert();   // (au repos, le luth est déjà à sa place sur le dos)
  // la pose pour jouer : la caisse devant le ventre (un peu à droite), le manche vers sa gauche et vers le haut, les cordes vers l'avant
  const u = new THREE.Vector3(0.8, 0.5, 0.25).normalize(), n0 = new THREE.Vector3(0, 0.3, 1);
  const n = n0.sub(u.clone().multiplyScalar(n0.dot(u))).normalize(), w = new THREE.Vector3().crossVectors(u, n);
  const w0 = new THREE.Vector3().crossVectors(LU.axe, LU.face).normalize(), f0 = new THREE.Vector3().crossVectors(w0, LU.axe).normalize();
  const A = new THREE.Matrix4().makeBasis(LU.axe, f0, w0), B = new THREE.Matrix4().makeBasis(u, n, w);
  const Rm = B.multiply(A.transpose());
  const Pc = new THREE.Vector3(-0.06, 0.86, 0.24);
  JEU.copy(new THREE.Matrix4().makeTranslation(Pc.x, Pc.y, Pc.z)).multiply(Rm).multiply(new THREE.Matrix4().makeTranslation(-LU.centre.x, -LU.centre.y, -LU.centre.z));
}
function matM(o) { return _m.copy(_mi.copy(MOD.matrixWorld).invert()).multiply(o.matrixWorld).clone(); }   // (la place d'un objet dans le repère du modèle)
function posM(o, v) { return (v || new THREE.Vector3()).setFromMatrixPosition(o.matrixWorld).applyMatrix4(_mi.copy(MOD.matrixWorld).invert()); }
function quatM(o) { const q = new THREE.Quaternion(); matM(o).decompose(_v, q, _s); return q; }
function poserQuatM(os, qm) { os.quaternion.copy(quatM(os.parent).invert().multiply(qm)); os.updateMatrixWorld(true); }
/* le bras guidé par la main (deux os : bras et avant-bras), le coude tiré vers « pole » */
function guider(haut, bas, main, cible, pole, poids) {
  if (poids <= 0.001) return;
  const S = posM(haut), E = posM(bas), W = posM(main);
  const T = W.clone().lerp(cible, poids);
  const a = E.distanceTo(S), b = W.distanceTo(E); let d = T.distanceTo(S); d = clamp(d, Math.abs(a - b) + 1e-4, a + b - 1e-4);
  const dir = T.clone().sub(S).normalize(); const ca = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), sa = Math.sqrt(1 - ca * ca);
  const p = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))); if (p.lengthSq() < 1e-8) p.set(0, -1, 0); p.normalize();
  const E2 = S.clone().addScaledVector(dir, a * ca).addScaledVector(p, a * sa);
  poserQuatM(haut, new THREE.Quaternion().setFromUnitVectors(E.clone().sub(S).normalize(), E2.clone().sub(S).normalize()).multiply(quatM(haut)));
  const E3 = posM(bas), W3 = posM(main), T2 = S.clone().addScaledVector(dir, d);
  poserQuatM(bas, new THREE.Quaternion().setFromUnitVectors(W3.clone().sub(E3).normalize(), T2.clone().sub(E3).normalize()).multiply(quatM(bas)));
}
/* le « repos » de Higgsfield fait tourner tout le corps (jusqu'à 80°) : on garde le bassin face à où le jeu le tourne */
const _tw = new THREE.Quaternion();
function redresser() {
  const hips = MOD && MOD.getObjectByName('Hips'); if (!hips || !actions.garde) return;
  const w = actions.garde.getEffectiveWeight(); if (w <= 0) return;
  const q = hips.quaternion; _tw.set(0, q.y, 0, q.w).normalize();
  const sans = _tw.clone().invert().premultiply(q.clone());   // q × (torsion)⁻¹ : sans la rotation autour de la verticale
  sans.copy(q.clone().multiply(_tw.clone().invert()));
  hips.quaternion.slerp(sans, w);
}
const doux = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
/* l'état du luth : quatre réglages qui glissent (main droite, luth, main gauche, main droite sur les cordes) */
function reglagesLuth() {
  const t = h.tl;
  if (h.luth === 'dos') return { wR: 0, k: 0, wL: 0, sR: 0 };
  if (h.luth === 'main') return { wR: 1, k: 1, wL: 1, sR: 1 };
  if (h.luth === 'sort') return { wR: doux(t / 0.25), k: doux((t - 0.25) / 0.4), wL: doux((t - 0.5) / 0.2), sR: doux((t - 0.55) / 0.25) };
  /* 'range' */ return { wR: 1 - doux((t - 0.55) / 0.2), k: 1 - doux((t - 0.15) / 0.4), wL: 1 - doux(t / 0.2), sR: 1 - doux(t / 0.2) };
}
const ARC = new THREE.Vector3(-0.34, 1.12, 0.02);   // (en passant par-dessus son épaule droite)
const LUmat = new THREE.Matrix4(), _p0 = new THREE.Vector3(), _p1 = new THREE.Vector3(), _q0 = new THREE.Quaternion(), _q1 = new THREE.Quaternion();
let grattage = 0;
function animerLuth(dt, t) {
  if (!LUTH || !MOD) return;
  MOD.updateMatrixWorld(true);
  const r = reglagesLuth(), sp = matM(OS.Spine);
  const Mdos = sp.clone().multiply(spineRepos), Mjeu = sp.clone().multiply(spineRepos).multiply(JEU);
  Mdos.decompose(_p0, _q0, _s); Mjeu.decompose(_p1, _q1, _s);
  // le centre de la caisse suit une courbe par-dessus l'épaule, le luth tourne en même temps
  const c0 = LU.centre.clone().applyMatrix4(Mdos), c1 = LU.centre.clone().applyMatrix4(Mjeu), k = r.k;
  const cc = c0.clone().multiplyScalar((1 - k) * (1 - k)).addScaledVector(ARC.clone().applyMatrix4(sp.clone().multiply(spineRepos)), 2 * k * (1 - k)).addScaledVector(c1, k * k);
  const q = _q0.clone().slerp(_q1, k);
  LUmat.makeRotationFromQuaternion(q).scale(_s); const decal = LU.centre.clone().applyMatrix4(LUmat);
  LUmat.setPosition(cc.clone().sub(decal));
  LUTH.matrix.copy(LUmat); LUTH.matrixWorldNeedsUpdate = true; LUTH.updateMatrixWorld(true);
  if (r.wR <= 0.001 && r.wL <= 0.001) return;
  // les points de prise, sur le luth tel qu'il est maintenant
  const surLuth = (le, cote, haut) => LU.centre.clone().addScaledVector(LU.axe, le).addScaledVector(LU.face, haut).addScaledVector(new THREE.Vector3().crossVectors(LU.axe, LU.face).normalize(), cote).applyMatrix4(LUmat);
  const prise = surLuth(0.36, 0, 0.0);                              // le manche, côté tête
  grattage += dt * (h.sort && h.luth === 'main' || (h.luth === 'sort' && h.sort) ? 1 : -1) * 4; grattage = clamp(grattage, 0, 1);
  // il gratte, puis juste avant que la note parte : « ta ta tan », très vite et plus fort (façon flamenco)
  const reste = h.sort ? h.sortD - h.sortT : 9, rasg = h.sort ? doux((0.42 - reste) / 0.12) : 0;
  h.phaseG = (h.phaseG || 0) + dt * (4.5 + 8 * rasg);
  const g = Math.sin(h.phaseG * 2 * Math.PI), amp = grattage * (1 + 0.7 * rasg);
  const cordes = surLuth(0.05 + 0.015 * g * amp, 0.05 * g * amp, 0.05 + 0.014 * Math.abs(g) * amp);   // la main droite va et vient sur les cordes
  // le repère du luth tel qu'il est maintenant : le long du manche (u), la face des cordes (f), « vers le haut » autour du manche (hautU)
  const u = LU.axe.clone().transformDirection(LUmat), f = LU.face.clone().transformDirection(LUmat);
  const hautU = new THREE.Vector3(0, 1, 0).sub(u.clone().multiplyScalar(u.y)).normalize();
  // main gauche : derrière le manche, la paume contre lui, les doigts qui passent par-dessus (la paume sur le manche, pas le poignet)
  const manche = surLuth(0.31 + 0.012 * Math.sin(t * 9) * grattage, 0, 0.0);
  const Fg = hautU.clone().multiplyScalar(0.8).addScaledVector(f, 0.45).normalize();
  const Pg = f.clone().sub(Fg.clone().multiplyScalar(f.dot(Fg))).normalize();
  const poignetG = manche.clone().addScaledVector(Pg, -0.032).addScaledVector(Fg, -MAIN.paume);
  // main droite : devant les cordes, la paume vers elles, les doigts vers le bas
  const Fd = hautU.clone().multiplyScalar(-0.85).addScaledVector(u, -0.35).normalize();
  const Pd = f.clone().negate().sub(Fd.clone().multiplyScalar(-f.dot(Fd))).normalize();
  const poignetD = cordes.clone().addScaledVector(Pd, -0.03).addScaledVector(Fd, -MAIN.paume);
  let cibleR = prise.clone().lerp(poignetD, r.sR), FdF = Fd, PdF = Pd;
  if (h.geste !== undefined && h.geste < GESTE.duree) {   // la note part : la main droite quitte les cordes et se tend vers la cible
    const g = h.geste < GESTE.monte ? doux(h.geste / GESTE.monte) : 1 - doux((h.geste - GESTE.tient) / (GESTE.duree - GESTE.tient));
    const soin = h.dernier === 'soin', S = posM(OS.RightArm), tendu = S.clone().add(soin ? new THREE.Vector3(-0.12, 0.44, 0.08) : new THREE.Vector3(-0.2, 0.17, 0.24));   // le bras part grand : sur le côté, vers le haut et vers la cible (le soin : la main vers le ciel)
    cibleR = cibleR.lerp(tendu, g);
    FdF = Fd.clone().lerp(soin ? new THREE.Vector3(-0.15, 1, 0.12).normalize() : new THREE.Vector3(-0.35, 0.75, 0.55).normalize(), g).normalize();
    PdF = Pd.clone().lerp(new THREE.Vector3(-0.15, -0.25, 1).normalize(), g); PdF.sub(FdF.clone().multiplyScalar(PdF.dot(FdF))).normalize();
    if (h.geste > 0.05 && !h.eclair) { h.eclair = true; eclairMain(); }
  }
  const poleR = new THREE.Vector3(-0.6, 0.5, 0.2).lerp(new THREE.Vector3(-0.7, -0.6, -0.3), clamp(r.k * 1.2, 0, 1));
  guider(OS.RightArm, OS.RightForeArm, OS.RightHand, cibleR, poleR, r.wR);
  orienter(OS.RightHand, FdF, PdF, MAIN.paumeD, r.wR * r.sR);
  guider(OS.LeftArm, OS.LeftForeArm, OS.LeftHand, poignetG, new THREE.Vector3(0.7, -0.6, -0.2), r.wL);
  orienter(OS.LeftHand, Fg, Pg, MAIN.paumeG, r.wL);
}
/* tourner la main : ses doigts (l'axe y de l'os) vers F, sa paume vers P (repère du modèle) */
const GESTE = { monte: 0.07, tient: 0.2, duree: 0.38 };   // (« et hop » : très vite)
/* l'éclair sur la main quand elle claque vers la cible */
const eclairs = [];
function eclairMain() {
  const q = h.dernier || 'glace', v = new THREE.Vector3(); OS.RightHand.getWorldPosition(v);
  const jeu = { x: v.x, y: -v.y, z: v.z / ZS };
  const sp = sprite(T_LUEUR[q], 0.3, true); sp.position.copy(G(jeu.x, jeu.y, jeu.z)); monde.add(sp);
  const l = prendre(SORTS[q].main, 22, 4); if (l) l.position.copy(G(jeu.x, jeu.y, jeu.z));
  eclairs.push({ sp, l, t: 0 });
}
function avancerEclairs(dt) {
  for (let i = eclairs.length - 1; i >= 0; i--) {
    const e = eclairs[i]; e.t += dt; const u = e.t / 0.28;
    if (u >= 1) { monde.remove(e.sp); e.sp.material.dispose(); rendreL(e.l); eclairs.splice(i, 1); continue; }
    const k = 0.3 + 1.1 * Math.sin(Math.min(1, u * 2.2) * Math.PI / 2); e.sp.scale.set(k, k, 1); e.sp.material.opacity = 1 - u * u; if (e.l) e.l.intensity = 22 * (1 - u);
  }
}
const MAIN = { paume: 0.075, paumeG: new THREE.Vector3(1, 0, 0), paumeD: new THREE.Vector3(-1, 0, 0) };   // (au repos les paumes regardent les cuisses : +x de l'os à gauche, -x à droite)
function orienter(os, F, P, paumeLocale, poids) {
  if (poids <= 0.001) return;
  const fl = new THREE.Vector3(0, 1, 0), pl = paumeLocale, tl = new THREE.Vector3().crossVectors(fl, pl);
  const T = new THREE.Vector3().crossVectors(F, P);
  const Mc = new THREE.Matrix4().makeBasis(F, P, T), Ml = new THREE.Matrix4().makeBasis(fl, pl, tl);
  const q = new THREE.Quaternion().setFromRotationMatrix(Mc.multiply(Ml.transpose()));
  poserQuatM(os, quatM(os).slerp(q, poids));
}
function bouchePosJeu(devant) {   // le trou de la caisse (ou un peu devant), en coordonnées du jeu (x, y, z)
  const v = LU.centre.clone().addScaledVector(LU.face, 0.03 + (devant || 0)).applyMatrix4(LUTH.matrixWorld);
  return { x: v.x, y: -v.y, z: v.z / ZS };
}

/* ---------- le sort : une note qui vole vers l'armure, une vraie lumière qui éclaire au passage ---------- */
const tirs = [], eclats = [], notes = [];
let lumCharge = null;
function annulerSort() {
  h.sort = null; h.sortT = 0; rendreL(lumCharge); lumCharge = null; h.garde = 0; h.geste = undefined;
  if (h.luth === 'main') { h.luth = 'range'; h.tl = 0; }
  else if (h.luth === 'sort') { const k = reglagesLuth().k; h.luth = 'range'; h.tl = clamp(0.15 + 0.4 * (1 - k), 0, 0.55); }
}
function lancer(q) {
  if (PIST || h.sort || h.saut) return;
  h.sort = q; h.sortT = 0; h.sortD = DUREE[q];
  if (h.luth === 'dos') { h.luth = 'sort'; h.tl = 0; }
  else if (h.luth === 'range') { const k = reglagesLuth().k; h.luth = 'sort'; h.tl = 0.25 + 0.4 * k; }
}
/* des lumières toujours là (éteintes) : en ajouter une en plein jeu ferait recalculer tous les dessins (un à-coup) */
const reserve = [];
for (let i = 0; i < 5; i++) { const l = new THREE.PointLight(0xffffff, 0, 7, 1.6); l.libre = true; monde.add(l); reserve.push(l); }
function prendre(coul, I, dist) { const l = reserve.find(r => r.libre); if (!l) return null; l.libre = false; l.color.setHex(coul); l.intensity = I; l.distance = dist; return l; }
function rendreL(l) { if (l) { l.intensity = 0; l.libre = true; } }
function partir(q, d) {
  const S = SORTS[q], feu = q === 'feu', gr = new THREE.Group(), main = d ? G(d.x, d.y, d.z) : G(h.x + Math.cos(h.a) * 0.4, h.y + Math.sin(h.a) * 0.4, 1.1);
  gr.position.copy(main); monde.add(gr);
  const halo = sprite(T_LUEUR[q], 1.1, true); halo.material.opacity = 0.45; halo.renderOrder = 3; gr.add(halo);
  /* la note : sa tête ronde posée pile sur la ligne du milieu de la portée (le centre du dessin, c'est la tête) ; toujours dessinée par-dessus les lignes */
  const n = sprite(NOTE_SORT[q], S.taille, false); n.center.set(46 / 128, 1 - 94 / 128); n.renderOrder = 4; gr.add(n);
  // la traînée : cinq lignes de partition qui ondulent derrière la note, toujours tournées vers la caméra
  const N = 30, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  const uv = new Float32Array(N * 2 * 2); for (let i = 0; i < N; i++) { uv[i * 4] = i / (N - 1) * 3; uv[i * 4 + 1] = 0; uv[i * 4 + 2] = i / (N - 1) * 3; uv[i * 4 + 3] = 1; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const idx = []; for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } geo.setIndex(idx);
  const ruban = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: PORTEE[q], vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  ruban.frustumCulled = false; ruban.visible = false; ruban.renderOrder = 2; scene.add(ruban);
  const l = prendre(S.lum, S.I, S.dist); if (l) l.position.copy(main);
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T_LUEUR[q], transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); monde.add(sol);   // (à plat sur le sol)
  tirs.push({ gr, n, l, sol, feu, q, ruban, hist: [], N, x: main.x, y: -main.y, z: d ? d.z : 1.1, t: 0, petite: 0, goutte: 0.05 });
}
function avancerTirs(dt) {
  for (let i = tirs.length - 1; i >= 0; i--) {
    const s = tirs[i], S = SORTS[s.q]; s.t += dt; const dx = ARM.x - s.x, dy = ARM.y + 0.6 - s.y, dd = Math.hypot(dx, dy), v = S.v;
    if (dd < 0.5) { rendreL(s.l); boum(s); monde.remove(s.gr); monde.remove(s.sol); scene.remove(s.ruban); s.ruban.geometry.dispose(); s.ruban.material.dispose(); tirs.splice(i, 1); continue; }
    s.x += dx / dd * v * dt; s.y += dy / dd * v * dt; s.z += (2.3 - s.z) * Math.min(1, dt * 2);
    s.gr.position.copy(G(s.x, s.y, s.z)); if (s.l) s.l.position.copy(s.gr.position); s.n.material.rotation = Math.sin(s.t * 8) * 0.2;
    ruban(s);
    s.petite -= dt; if (s.petite <= 0 && s.hist.length > 6) { s.petite = 0.06; notePortee(s); }
    if (s.q === 'acide') { s.goutte -= dt; if (s.goutte <= 0) { s.goutte = 0.05 + Math.random() * 0.05; goutte(s.x + (Math.random() - 0.5) * 0.2, s.y + (Math.random() - 0.5) * 0.15, s.z - 0.15); } }
    s.sol.position.copy(G(s.x, s.y, 0.02)); s.sol.scale.set(S.sol, S.sol, 1);
    if (Math.random() < dt * 40) etincelle(s.x, s.y, s.z, s.q);
  }
}
/* la traînée de portée : les dernières positions de la note, un ruban de 5 lignes, penché vers la caméra ; elle part pile de la tête de la note */
const _dirCam = new THREE.Vector3();
function ruban(s) {
  const p = new THREE.Vector3(); s.gr.getWorldPosition(p);
  if (s.hist.length < 2 || s.hist[1].distanceTo(p) > 0.04) { s.hist.unshift(p); if (s.hist.length > s.N) s.hist.pop(); } else s.hist[0].copy(p);   // (le premier point suit toujours la note)
  const H = s.hist, n = H.length; if (n < 3) return;
  cam.getWorldDirection(_dirCam);
  const pos = s.ruban.geometry.attributes.position, col = s.ruban.geometry.attributes.color, w = 0.5;
  for (let i = 0; i < s.N; i++) {
    const k = Math.min(i, n - 1), a = H[Math.max(0, k - 1)], b = H[Math.min(n - 1, k + 1)];
    const d = a.clone().sub(b); if (d.lengthSq() < 1e-8) d.set(1, 0, 0); d.normalize();
    const o = new THREE.Vector3().crossVectors(d, _dirCam).normalize();
    const vague = 0.09 * Math.sin(s.t * 10 - i * 0.45) * Math.min(1, i / 5);   // (pas de vague contre la note : elle reste dans l'axe)
    const c = H[k].clone().addScaledVector(o, vague);
    const e = (i >= n - 1 ? 0 : 1) * Math.pow(1 - i / (s.N - 1), 1.2) * Math.min(1, 0.35 + i / 3);
    pos.setXYZ(i * 2, c.x + o.x * w / 2, c.y + o.y * w / 2, c.z + o.z * w / 2);
    pos.setXYZ(i * 2 + 1, c.x - o.x * w / 2, c.y - o.y * w / 2, c.z - o.z * w / 2);
    col.setXYZ(i * 2, e, e, e); col.setXYZ(i * 2 + 1, e, e, e);
  }
  pos.needsUpdate = true; col.needsUpdate = true; s.ruban.visible = true;
}
/* des petites notes posées sur la portée, qui restent derrière et s'éteignent (et des flocons pour la glace) */
function notePortee(s) {
  const H = s.hist, k = 2 + Math.floor(Math.random() * Math.min(8, H.length - 3)); const a = H[k - 1], b = H[k + 1];
  const d = a.clone().sub(b).normalize(); cam.getWorldDirection(_dirCam); const o = new THREE.Vector3().crossVectors(d, _dirCam).normalize();
  const ligne = (Math.floor(Math.random() * 5) - 2) * 0.1, w = H[k].clone().addScaledVector(o, ligne);
  const jeu = { x: w.x, y: -w.y, z: w.z / ZS };
  const sp = sprite(PETITES[s.q][Math.random() < 0.5 ? 0 : 1], 0.2 + Math.random() * 0.06, true); sp.position.copy(G(jeu.x, jeu.y, jeu.z)); monde.add(sp);
  notes.push({ sp, x: jeu.x, y: jeu.y, z: jeu.z, vx: 0, vy: 0, vz: 0.15, t: 0, vie: 0.6 });
  if (s.q === 'glace' && Math.random() < 0.6) {
    const f = sprite(texFlocon, 0.13 + Math.random() * 0.08, true); const j2 = { x: jeu.x + (Math.random() - 0.5) * 0.4, y: jeu.y + (Math.random() - 0.5) * 0.3, z: jeu.z + (Math.random() - 0.5) * 0.3 };
    f.position.copy(G(j2.x, j2.y, j2.z)); monde.add(f); notes.push({ sp: f, ...j2, vx: 0, vy: 0, vz: -0.2, t: 0, vie: 0.7, tourne: (Math.random() - 0.5) * 4 });
  }
}
function etincelle(x, y, z, q, v) {
  const feu = q === 'feu', s0 = feu ? 0.3 : q === 'acide' ? 0.16 : 0.18;
  const sp = sprite(feu ? texFlamme : T_LUEUR[q], s0, true); sp.position.copy(G(x, y, z)); monde.add(sp);
  const a = Math.random() * 6.28, s = (v || 0.6) * Math.random();
  eclats.push({ sp, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: feu ? 1 + Math.random() : Math.random() * 0.5 - 0.2, vie: 0.5 + Math.random() * 0.4, t: 0, s0 });
}
function boum(s) {
  const S = SORTS[s.q], l = prendre(S.boum, s.feu ? 60 : 30, 8); if (l) { l.position.copy(G(s.x, s.y, s.z)); eclats.push({ lum: l, t: 0, vie: 0.45, I: l.intensity }); }
  for (let i = 0; i < (s.feu ? 26 : 16); i++) etincelle(s.x, s.y, s.z, s.q, 3);
  if (s.q === 'acide') for (let i = 0; i < 14; i++) { const a = Math.random() * 6.28, r = 1 + Math.random() * 2; goutte(s.x, s.y, s.z, Math.cos(a) * r, Math.sin(a) * r, 1 + Math.random() * 2); }   // (l'acide éclabousse)
}
/* l'acide : des gouttes qui tombent de la note, et qui gresillent en touchant le sol (une petite fumée, une flaque qui s'éteint) */
const gouttes = [];
function goutte(x, y, z, vx, vy, vz) {
  const sp = sprite(texGoutte, 0.13 + Math.random() * 0.05, false); sp.renderOrder = 3; sp.position.copy(G(x, y, z)); monde.add(sp);
  gouttes.push({ sp, x, y, z, vx: vx || 0, vy: vy || 0, vz: vz || -0.5, t: 0 });
}
function avancerGouttes(dt) {
  for (let i = gouttes.length - 1; i >= 0; i--) {
    const g = gouttes[i]; g.t += dt;
    if (g.sp) {
      g.vz -= 9 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.z += g.vz * dt; g.sp.position.copy(G(g.x, g.y, g.z));
      if (g.z <= 0.03) { monde.remove(g.sp); g.sp.material.dispose(); g.sp = null; g.t = 0; gresille(g); }
      continue;
    }
    const u = g.t / g.vie; if (u >= 1) { if (g.flaque) { monde.remove(g.flaque); g.flaque.material.dispose(); } gouttes.splice(i, 1); continue; }
    if (g.flaque) { g.flaque.material.opacity = 0.75 * (1 - u); const k = g.r0 * (1 + 0.3 * u); g.flaque.scale.set(k, k * 0.8, 1); }
  }
}
function gresille(g) {
  const f = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T_LUEUR.acide, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  f.position.copy(G(g.x, g.y, 0.015)); monde.add(f); g.flaque = f; g.r0 = 0.22 + Math.random() * 0.12; g.vie = 0.9; gouttes.push(g);
  for (let k = 0; k < 2; k++) {   // la fumée qui monte en tournant, et de toutes petites bulles qui sautent
    const sp = sprite(T_LUEUR.fumee, 0.18, false); sp.position.copy(G(g.x, g.y, 0.08)); monde.add(sp);
    eclats.push({ sp, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2, vz: 0.6 + Math.random() * 0.5, vie: 0.55 + Math.random() * 0.3, t: 0, s0: 0.22, grossit: 1 });
  }
  for (let k = 0; k < 3; k++) { const sp = sprite(T_LUEUR.acide, 0.06, true); sp.position.copy(G(g.x, g.y, 0.05)); monde.add(sp); const a = Math.random() * 6.28; eclats.push({ sp, vx: Math.cos(a) * 0.7, vy: Math.sin(a) * 0.5, vz: 0.8 + Math.random(), vie: 0.25 + Math.random() * 0.15, t: 0, s0: 0.07 }); }
}
function petiteNote(q) {
  if (!LUTH) return; const d = bouchePosJeu();
  const sp = sprite(texNote(SORTS[q].petite, Math.random() < 0.5), 0.2, false); sp.position.copy(G(d.x, d.y, d.z)); monde.add(sp);
  notes.push({ sp, x: d.x, y: d.y, z: d.z, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.3, t: 0 });
}
function avancerNotes(dt) {
  for (let i = notes.length - 1; i >= 0; i--) {
    const n = notes[i], vie = n.vie || 0.9; n.t += dt;
    if (n.t > vie) { monde.remove(n.sp); n.sp.material.dispose(); if (n.halo) { monde.remove(n.halo); n.halo.material.dispose(); } notes.splice(i, 1); continue; }
    if (n.g) n.vz -= n.g * dt;
    if (n.suit) { n.ox += n.vx * dt; n.oy += n.vy * dt; n.z += n.vz * dt; n.x = h.x + n.ox; n.y = h.y + n.oy; }
    else { n.x += n.vx * dt; n.y += n.vy * dt; n.z += (n.vz !== undefined ? n.vz : 0.9) * dt; }
    n.sp.position.copy(G(n.x, n.y, n.z));
    if (n.halo) {   // elles s'allument, scintillent, puis s'éteignent
      const u = n.t / vie, a = Math.sin(Math.PI * u), k = n.s0 * (0.85 + 0.2 * Math.sin(n.t * 13 + n.ph));
      n.sp.material.opacity = Math.min(1, a * 1.6); n.sp.scale.set(k, k, 1); n.halo.position.copy(n.sp.position); n.halo.material.opacity = 0.9 * a * (0.7 + 0.3 * Math.sin(n.t * 17 + n.ph)); n.halo.scale.set(k * 2.1, k * 2.1, 1);
      n.sp.material.rotation = Math.sin(n.t * 4 + n.ph) * 0.25; continue;
    }
    n.sp.material.opacity = 1 - n.t / vie;
    n.sp.material.rotation = n.tourne ? n.sp.material.rotation + n.tourne * dt : Math.sin(n.t * 9) * 0.3;
  }
}
/* ---------- le soin : il gratte 2 s, puis des notes vert doux s'allument tout autour de lui et montent en brillant ---------- */
const soins = [];
function soigner() {
  const l = prendre(0x8dffb0, 0, 4.5);
  const anneau = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T_LUEUR.soin, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); monde.add(anneau);
  const aura = sprite(T_LUEUR.soin, 2.4, true); aura.material.opacity = 0; monde.add(aura);   // (une lueur verte tout autour de lui)
  soins.push({ l, anneau, aura, t: 0, nb: 0 });
}
function noteSoin() {
  const a = Math.random() * 6.28, r = 0.4 + Math.random() * 0.6, ox = Math.cos(a) * r, oy = Math.sin(a) * r * 0.8, z = 0.1 + Math.random() * 1.7;
  const s0 = 0.3 + Math.random() * 0.16, sp = sprite(NOTE_SORT.soin, s0, false), halo = sprite(T_LUEUR.soin, s0 * 1.6, true);
  sp.renderOrder = 4; halo.renderOrder = 3; monde.add(halo, sp);
  notes.push({ sp, halo, s0, suit: true, ox, oy, z, vx: -Math.sin(a) * 0.25, vy: Math.cos(a) * 0.2, vz: 0.35 + Math.random() * 0.2, t: 0, vie: 1.1 + Math.random() * 0.4, ph: Math.random() * 6 });
}
function avancerSoins(dt) {
  for (let i = soins.length - 1; i >= 0; i--) {
    const s = soins[i]; s.t += dt;
    while (s.nb < 24 && s.t > s.nb * 0.04) { s.nb++; noteSoin(); }
    const u = Math.min(1, s.t / 0.9);
    s.anneau.position.copy(G(h.x, h.y, 0.02)); const k = 0.8 + 2.2 * Math.sqrt(u); s.anneau.scale.set(k, k * 0.85, 1); s.anneau.material.opacity = 0.7 * (1 - u);
    if (s.l) { s.l.position.copy(G(h.x, h.y, 1.1)); s.l.intensity = 20 * Math.sin(Math.PI * Math.min(1, s.t / 1.5)); }
    s.aura.position.copy(G(h.x, h.y, 0.9)); s.aura.material.opacity = 0.55 * Math.sin(Math.PI * Math.min(1, s.t / 1.5));
    if (s.t > 1.5) { rendreL(s.l); monde.remove(s.anneau, s.aura); s.anneau.material.dispose(); s.aura.material.dispose(); soins.splice(i, 1); }
  }
}
/* ================= LE PISTEUR =================
   Ses gestes viennent du combat du Pisteur (phase 1, Bible § 17) : la dague en trois temps (le coup suivant ne vient que si
   le précédent a touché ; le troisième est plus fort), le coup qui assomme, le saut (par-dessus les murets), l'ombre façon
   Valeera (accroupi, sombre et violet ; dans l'ombre, la dague devient l'embuscade, et frapper fait sortir de l'ombre).
   Un mannequin d'entraînement et deux murets pour essayer. Les moments des films (début, coup, fin) sont mesurés sur les
   mouvements Higgsfield (outils/coups.py). */
const PISTEUR_SAUT = { dist: 3, recharge: 3, vitesse: 1.2, depart: 0.05, air: [0.08, 0.65], sortie: 0.66, fin: 0.8, elan: 2.5, murets: true };   // (Unarmed_Vault : il décolle à 0,08 s du film, retombe à 0,65 ; les pieds montent à 0,86 : il passe un muret)
const COUPS = {   // anim : le mouvement ; a, b : le morceau joué ; impact : le moment du coup (temps du film) ; v : sa vitesse
  d1: { anim: 'd1', a: 0.15, b: 1.05, impact: 0.57, v: 1.5, portee: 1.35 },                          // Right_Hand_Sword_Slash : un revers (la main la plus rapide à 0,57 s)
  d2: { anim: 'd2', a: 0.30, b: 1.25, impact: 0.82, v: 1.5, portee: 1.45 },                          // Thrust_Slash, le début : un grand pas et un coup d'estoc
  d3: { anim: 'd3', a: 0.35, b: 1.55, impact: 1.07, v: 1.4, portee: 1.5, fort: true },               // Charged_Upward_Slash : l'élan, puis un grand coup de bas en haut
  embuscade: { anim: 'd3', a: 0.45, b: 1.55, impact: 1.07, v: 1.7, portee: 1.6, fort: true, ombre: true },
  assomme: { anim: 'assomme', a: 0.10, b: 1.25, impact: 0.58, v: 1.4, portee: 1.5, assomme: true }, // Spartan_Kick : un coup de pied haut (le pied monte à 1,07 m)
};
const OMBRE_RECHARGE = 3;   // (Romain : 3 s avant de pouvoir redisparaître)
const MURETS = PIST ? [{ x: 5.4, y: 7.0, lx: 2.6, ly: 0.45 }, { x: 13.0, y: 6.4, lx: 0.45, ly: 2.6 }] : [];
const MANNEQUIN = { x: 9, y: 4.9, r: 0.35 };
let dagueMain = null, traineeLame = null;
const matsOmbre = [];
function preparerPisteur(m) {
  MOD = m; m.updateMatrixWorld(true);
  for (const n of ['Spine', 'RightArm', 'RightForeArm', 'RightHand', 'LeftArm', 'LeftForeArm', 'LeftHand', 'Head']) OS[n] = m.getObjectByName(n);
  // la dague tirée, dans SA main droite (en centimètres : les os du modèle sont en centimètres)
  const g = new THREE.Group(), acier = new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 0.85, roughness: 0.25, emissive: 0x223344, emissiveIntensity: 0.3 }), cuir = new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.8 }), laiton = new THREE.MeshStandardMaterial({ color: 0xc9a040, metalness: 0.7, roughness: 0.35 });
  const lame = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 2.1, 26, 4, 1), acier); lame.scale.set(1, 1, 0.28); lame.rotation.x = Math.PI / 2; lame.position.z = 17;   // (une lame plate qui s'affine vers la pointe)
  const garde = new THREE.Mesh(new THREE.BoxGeometry(7, 1.4, 1.4), laiton); garde.position.z = 3.8; garde.rotation.z = Math.PI / 2;
  const poignee = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 8, 8), cuir); poignee.rotation.x = Math.PI / 2;
  const pommeau = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), laiton); pommeau.position.z = -4.3;
  g.add(lame, garde, poignee, pommeau); g.position.set(-1.5, 8, 0); g.visible = false;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  if (OS.RightHand) OS.RightHand.add(g);
  dagueMain = g; g.userData.pointe = new THREE.Vector3(0, 0, 30); g.userData.base = new THREE.Vector3(0, 0, 5);
  // l'ombre : chaque matière a sa jumelle sombre et violette, à moitié transparente
  m.traverse(o => { if (o.isMesh && o.material) { const a = o.material, b = a.clone(); b.color = (b.color || new THREE.Color(1, 1, 1)).clone().multiplyScalar(0.28); b.emissive = new THREE.Color(0x5a2aa8); b.emissiveIntensity = 0.55; b.transparent = true; b.opacity = 0.62; matsOmbre.push({ o, a, b }); } });
}
/* les murets (de vrais volumes 3D : la lumière des brasiers les éclaire, ils cachent le héros) */
function texPierre() {
  return toile(256, 128, x => {
    x.fillStyle = '#7d7468'; x.fillRect(0, 0, 256, 128);
    for (let r = 0; r < 4; r++) for (let c = -1; c < 5; c++) {
      const w = 64, ox = (r % 2) * 32 + c * w, y = r * 32, v = 95 + Math.random() * 40;
      const g = x.createLinearGradient(0, y, 0, y + 32); g.addColorStop(0, `rgb(${v + 22},${v + 18},${v + 10})`); g.addColorStop(1, `rgb(${v - 4},${v - 7},${v - 12})`);
      x.fillStyle = g; x.fillRect(ox + 2, y + 2, w - 4, 28);
      for (let k = 0; k < 18; k++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; x.fillRect(ox + 2 + Math.random() * (w - 6), y + 3 + Math.random() * 24, 3, 2); }
    }
  });
}
if (PIST) {
  const tex = texPierre(); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  for (const M of MURETS) {
    const hM = 0.62, mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 }), dessus = new THREE.MeshStandardMaterial({ map: tex, color: 0xcfc3ae, roughness: 0.9 });
    const geo = new THREE.BoxGeometry(M.lx, M.ly, hM), mesh = new THREE.Mesh(geo, [mat, mat, mat, mat, dessus, mat]);
    mesh.position.copy(G(M.x, M.y, hM / 2)); mesh.castShadow = true; mesh.receiveShadow = true; monde.add(mesh);
    const uv = geo.attributes.uv, dims = [[M.ly, hM], [M.ly, hM], [M.lx, hM], [M.lx, hM], [M.lx, M.ly], [M.lx, M.ly]];   // (chaque face : sa largeur, sa hauteur ; des pierres de 1,3 × 0,65 pas)
    for (let i = 0; i < uv.count; i++) { const f = dims[Math.floor(i / 4)]; uv.setXY(i, uv.getX(i) * f[0] / 1.3, uv.getY(i) * f[1] / 0.65); }
  }
}
function dansMuret(x, y, r) { r = r || 0.35; for (const M of MURETS) if (Math.abs(x - M.x) < M.lx / 2 + r && Math.abs(y - M.y) < M.ly / 2 + r) return true; return false; }
/* le mannequin d'entraînement : un poteau, un corps de paille, une tête de toile, une barre pour les bras */
let mannequin = null;
const mq = { ax: 0, ay: 0, vx: 0, vy: 0, sonne: 0, etoiles: [], eclair: 0 };
if (PIST) {
  const gr = new THREE.Group(), pivot = new THREE.Group(), bois = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.85 }), paille = new THREE.MeshStandardMaterial({ color: 0xc9a55a, roughness: 0.95, emissive: 0xffffff, emissiveIntensity: 0 }), toileM = new THREE.MeshStandardMaterial({ color: 0xb89a6a, roughness: 0.95, emissive: 0xffffff, emissiveIntensity: 0 }), corde = new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 0.9 });
  const cyl = (r1, r2, h, mat, z) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 14), mat); m.rotation.x = Math.PI / 2; m.position.z = z; m.castShadow = true; return m; };
  gr.add(cyl(0.32, 0.36, 0.08, bois, 0.04));
  pivot.add(cyl(0.05, 0.06, 0.7, bois, 0.4), cyl(0.2, 0.24, 0.66, paille, 0.98), cyl(0.205, 0.205, 0.04, corde, 0.8), cyl(0.205, 0.205, 0.04, corde, 1.16));
  const bras = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), bois); bras.rotation.z = Math.PI / 2; bras.position.z = 1.18; bras.castShadow = true; pivot.add(bras);
  const tete = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), toileM); tete.position.z = 1.45; tete.castShadow = true; pivot.add(tete);
  gr.add(pivot); gr.position.copy(G(MANNEQUIN.x, MANNEQUIN.y, 0)); monde.add(gr);
  mannequin = { gr, pivot, mats: [paille, toileM] };
}
function libreSaut(x, y) { return libreSans(x, y); }
/* frapper : la dague (trois temps), l'embuscade dans l'ombre, le coup qui assomme */
h.rang = 1; h.coup = null; h.tampon = null; h.ombre = false; h.ombreR = 0;
function versMannequin() { const dx = MANNEQUIN.x - h.x, dy = MANNEQUIN.y - h.y; return { d: Math.hypot(dx, dy), a: Math.atan2(dy, dx) }; }
function frapper(quoi) {
  if (!PIST || h.saut) return;
  if (h.coup) { if (h.coup.tc > (h.coup.C.a + h.coup.C.impact) / 2) h.tampon = quoi; return; }   // (un seul appui d'avance, comme Valeera)
  let nom = quoi === 'assomme' ? 'assomme' : h.ombre ? 'embuscade' : 'd' + h.rang;
  const C = COUPS[nom]; if (!actions[C.anim]) return;
  const vm = versMannequin(); if (vm.d < 2.4) h.a = vm.a;   // (tout près du mannequin : il se tourne vers lui)
  h.coup = { nom, C, t: 0, tc: C.a, touche: false, fait: false, elan: vm.d < 2.4 ? Math.max(0, Math.min(0.7, vm.d - 0.95)) : 0, avance: 0 };
  if (dagueMain) dagueMain.visible = nom !== 'assomme';
  if (C.ombre || (h.ombre && nom === 'assomme')) sortirOmbre();   // (frapper fait sortir de l'ombre)
  traineeDebut(nom === 'embuscade' ? 0xb27bff : 0xdff3ff);
}
function annulerCoup() { h.coup = null; h.tampon = null; traineeFin(); }
function poidsCoup() {
  const c = h.coup; if (!c) return 0; const C = c.C;
  return Math.min(doux((c.tc - C.a) / (0.06 * C.v)), 1 - doux((c.tc - (C.b - 0.16 * C.v)) / (0.16 * C.v)));
}
function animerCoups(w) {
  for (const n of ['d1', 'd2', 'd3', 'assomme']) {
    const a = actions[n]; if (!a) continue; if (!a.__lance) { a.play(); a.__lance = true; } a.timeScale = 0;
    const actif = h.coup && h.coup.C.anim === n; a.setEffectiveWeight(actif ? w : 0); if (actif) a.time = Math.min(h.coup.tc, a.getClip().duration - 1e-3);
  }
}
function avancerCoup(dt) {
  const c = h.coup; if (!c) return; const C = c.C;
  c.t += dt; c.tc = C.a + c.t * C.v;
  if (c.elan > c.avance && c.tc < C.impact) { const pas = Math.min(c.elan - c.avance, dt * 4.5), nx = h.x + Math.cos(h.a) * pas, ny = h.y + Math.sin(h.a) * pas; if (libre(nx, ny)) { h.x = nx; h.y = ny; } c.avance += pas; }   // (le bras entraîne le corps : un pas vers lui)
  if (!c.fait && c.tc >= C.impact) {
    c.fait = true; const vm = versMannequin(), ecart = Math.abs(Math.atan2(Math.sin(vm.a - h.a), Math.cos(vm.a - h.a)));
    c.touche = vm.d <= C.portee && ecart < 1.2;
    if (c.touche) toucherMannequin(C, vm.a);
    if (c.nom.startsWith('d')) h.rang = c.touche ? (h.rang % 3) + 1 : 1;   // (le coup suivant ne vient que si celui-ci a touché)
    if (c.nom === 'embuscade') h.rang = 1;
    majRang();
  }
  if (c.tc >= C.b) { h.coup = null; traineeFin(); h.cacheDague = 0.5; const t = h.tampon; h.tampon = null; if (t) frapper(t); }
}
function majRang() { const r = $('pRang'); if (r) r.textContent = h.ombre ? '' : String(h.rang); const ic = $('pDagueIc'); if (ic) ic.textContent = h.ombre ? '💀' : h.rang === 3 ? '⚔️' : '🗡️'; }
/* le mannequin touché : il bascule, la paille s'éclaire, des éclats ; assommé : des étoiles qui tournent au-dessus de sa tête */
const texEtoile = toile(48, 48, x => { x.translate(24, 24); x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 8 : 20, a = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.shadowColor = 'rgba(255,220,80,1)'; x.shadowBlur = 8; x.fillStyle = '#ffe27a'; x.fill(); x.lineWidth = 2; x.strokeStyle = '#a06a10'; x.stroke(); });
function toucherMannequin(C, a) {
  const f = C.fort ? 1.9 : C.assomme ? 1.4 : 1; mq.vx += Math.cos(a) * 2.4 * f; mq.vy += Math.sin(a) * 2.4 * f; mq.eclair = 1;
  const z = 1.05, cx = MANNEQUIN.x - Math.cos(a) * 0.18, cy = MANNEQUIN.y - Math.sin(a) * 0.18;
  for (let i = 0; i < (C.fort ? 22 : 12); i++) { const sp = sprite(C.ombre ? T_LUEUR.violet : T_LUEUR.or, 0.12, true); sp.position.copy(G(cx, cy, z)); monde.add(sp); const b = a + Math.PI + (Math.random() - 0.5) * 2.2, v = 1.5 + Math.random() * 2.5 * f; eclats.push({ sp, vx: Math.cos(b) * v, vy: Math.sin(b) * v, vz: Math.random() * 2 - 0.3, vie: 0.3 + Math.random() * 0.25, t: 0, s0: 0.12 }); }
  const l = prendre(C.ombre ? 0xb070ff : 0xffe0a0, C.fort ? 30 : 16, 4); if (l) { l.position.copy(G(cx, cy, z)); eclats.push({ lum: l, t: 0, vie: 0.25, I: l.intensity }); }
  if (C.assomme) { mq.sonne = 2; if (!mq.etoiles.length) for (let i = 0; i < 3; i++) { const sp = sprite(texEtoile, 0.2, false); sp.renderOrder = 5; monde.add(sp); mq.etoiles.push(sp); } }
  if (C.ombre) for (let i = 0; i < 10; i++) { const sp = sprite(T_LUEUR.violet, 0.4, true); sp.position.copy(G(cx, cy, 0.9 + Math.random() * 0.5)); monde.add(sp); eclats.push({ sp, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, vz: 0.6 + Math.random(), vie: 0.6, t: 0, s0: 0.4, grossit: 1 }); }
}
function avancerMannequin(dt, t) {
  if (!mannequin) return;
  // un ressort amorti : il bascule sous le coup puis revient
  mq.vx += (-mq.ax * 60 - mq.vx * 7) * dt; mq.vy += (-mq.ay * 60 - mq.vy * 7) * dt; mq.ax += mq.vx * dt; mq.ay += mq.vy * dt;
  const ang = Math.hypot(mq.ax, mq.ay), axe = new THREE.Vector3(-mq.ay, -mq.ax, 0);   // (le monde a y inversé)
  if (ang > 1e-5) mannequin.pivot.quaternion.setFromAxisAngle(axe.normalize(), Math.min(0.6, ang)); else mannequin.pivot.quaternion.identity();
  mq.eclair = Math.max(0, mq.eclair - dt * 5); for (const m of mannequin.mats) m.emissiveIntensity = 0.45 * mq.eclair;
  if (mq.sonne > 0) {
    mq.sonne -= dt; const tete = new THREE.Vector3(0, 0, 1.45).applyQuaternion(mannequin.pivot.quaternion);
    mq.etoiles.forEach((sp, i) => { const a = t * 4 + i * 2.09; sp.position.copy(G(MANNEQUIN.x + tete.x + Math.cos(a) * 0.26, MANNEQUIN.y - tete.y + Math.sin(a) * 0.14, (tete.z + 0.28) )); sp.material.opacity = Math.min(1, mq.sonne * 2); sp.material.rotation = a; });
    if (mq.sonne <= 0) { mq.etoiles.forEach(sp => { monde.remove(sp); sp.material.dispose(); }); mq.etoiles = []; }
  }
}
/* la traînée de la lame : un ruban entre la base et la pointe de la dague, image après image */
const _pb = new THREE.Vector3(), _pp = new THREE.Vector3();
function traineeDebut(coul) {
  traineeFin(); const N = 16, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3)); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  const idx = []; for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: coul, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  m.frustumCulled = false; m.renderOrder = 4; scene.add(m); traineeLame = { m, N, hist: [] };
}
const traineesFinies = [];
function traineeFin() { if (traineeLame) { const T = traineeLame; T.fin = true; T.vie = 0.18; traineesFinies.push(T); traineeLame = null; } }   // (elle s'efface en 0,18 s)
function avancerTrainee(dt) {
  for (let i = traineesFinies.length - 1; i >= 0; i--) { const T = traineesFinies[i]; T.vie -= dt; if (T.vie <= 0) { scene.remove(T.m); T.m.geometry.dispose(); T.m.material.dispose(); traineesFinies.splice(i, 1); } else dessinerTrainee(T); }
  const T = traineeLame; if (!T) return;
  if (dagueMain && dagueMain.visible && h.coup && h.coup.nom !== 'assomme') {
    dagueMain.updateMatrixWorld(true); _pb.copy(dagueMain.userData.base).applyMatrix4(dagueMain.matrixWorld); _pp.copy(dagueMain.userData.pointe).applyMatrix4(dagueMain.matrixWorld);
    T.hist.unshift([_pb.clone(), _pp.clone()]); if (T.hist.length > T.N) T.hist.pop();
  }
  dessinerTrainee(T);
}
function dessinerTrainee(T) {
  const H = T.hist, pos = T.m.geometry.attributes.position, col = T.m.geometry.attributes.color, kf = T.fin ? Math.max(0, T.vie / 0.18) : 1;
  for (let i = 0; i < T.N; i++) {
    const e = H[Math.min(i, H.length - 1)]; if (!e) continue; const v = (1 - i / (T.N - 1)) * kf * (i < H.length ? 1 : 0);
    pos.setXYZ(i * 2, e[0].x, e[0].y, e[0].z); pos.setXYZ(i * 2 + 1, e[1].x, e[1].y, e[1].z); col.setXYZ(i * 2, v * 0.3, v * 0.3, v * 0.3); col.setXYZ(i * 2 + 1, v, v, v);
  }
  pos.needsUpdate = true; col.needsUpdate = true;
}
/* l'ombre : il devient une silhouette sombre et violette, accroupi ; l'écran se teinte (comme Valeera) */
function entrerOmbre() {
  if (h.ombre || h.ombreR > 0 || h.coup) return;
  h.ombre = true; fumeeOmbre(); for (const e of matsOmbre) e.o.material = e.b; document.body.classList.add('ombre'); majRang();
}
function sortirOmbre() {
  if (!h.ombre) return;
  h.ombre = false; h.ombreR = OMBRE_RECHARGE; fumeeOmbre(); for (const e of matsOmbre) e.o.material = e.a; document.body.classList.remove('ombre'); majRang();
}
function basculerOmbre() { if (h.ombre) sortirOmbre(); else entrerOmbre(); }
function fumeeOmbre() {
  for (let i = 0; i < 14; i++) { const sp = sprite(T_LUEUR.fumeeOmbre, 0.5, false); const a = Math.random() * 6.28, r = Math.random() * 0.4, z = 0.2 + Math.random() * 1.2; sp.position.copy(G(h.x + Math.cos(a) * r, h.y + Math.sin(a) * r * 0.8, z)); monde.add(sp); eclats.push({ sp, vx: Math.cos(a) * 0.8, vy: Math.sin(a) * 0.6, vz: 0.3 + Math.random() * 0.5, vie: 0.6 + Math.random() * 0.3, t: 0, s0: 0.5, grossit: 1 }); }
}
function avancerPisteur(dt, t) {
  h.ombreR = Math.max(0, h.ombreR - dt);
  avancerCoup(dt); avancerTrainee(dt); avancerMannequin(dt, t);
  if (dagueMain && !h.coup) { h.cacheDague = (h.cacheDague || 0) - dt; if (h.cacheDague <= 0) dagueMain.visible = false; }
  const r = h.ombreR / OMBRE_RECHARGE; if (r !== avancerPisteur.r) { avancerPisteur.r = r; $('pOmbre').style.setProperty('--r', r.toFixed(3)); }
  const rs = h.sautR / SAUT.recharge; if (rs !== avancerPisteur.rs) { avancerPisteur.rs = rs; $('pSaut').style.setProperty('--r', rs.toFixed(3)); }
}
/* ---------- le saut : un vrai saut (Higgsfield, Jump_Over_Obstacle_2, sur place) ; le jeu le fait avancer de 3 pas ----------
   Le film dure 0,9 s : il quitte le sol vers 0,08 s, retombe vers 0,70 s. On le joue un peu plus vite (×1,2). Il avance dès l’appel et, dès que ses pieds touchent le sol, il repart (la réception sur place est fondue dans la course en 0,1 s).
   On ne passe pas à travers les murs, l'armure, les lanternes : le saut s'arrête au bord (comme les colonnes du vrai jeu). */
const SAUT = PIST ? PISTEUR_SAUT : { dist: 3, recharge: 1.5, vitesse: 1.2, depart: 0, air: [0, 0.70],   // (il avance dès l'appel du saut : pas d'arrêt au départ non plus)
   sortie: 0.70, fin: 0.82, elan: 2.5 };   // (à l'atterrissage, il enchaîne tout de suite : le reste du film, la réception sur place, est fondu dans la course en 0,1 s)
function sauter(mx, my) {
  if (h.saut || h.sautR > 0 || !actions.saut) return;
  if (h.sort) annulerSort();
  const a = Math.hypot(mx || 0, my || 0) > 0.15 ? Math.atan2(my, mx) : h.a;
  h.saut = { t: 0, a, fait: 0, pose: false, dist: SAUT.dist }; h.a = a; h.sautR = SAUT.recharge; h.derap = null; incline.quaternion.identity();
  if (PIST) { annulerCoup(); poussiere(h.x, h.y, a + Math.PI); }
}
function avancerSaut(dt) {
  const S = h.saut; S.t += dt; const tc = SAUT.depart + S.t * SAUT.vitesse;
  const p = clamp((tc - SAUT.air[0]) / (SAUT.air[1] - SAUT.air[0]), 0, 1);
  if (SAUT.murets && p > 0.7 && !S.allonge && dansMuret(h.x + Math.cos(S.a) * (S.dist - S.fait), h.y + Math.sin(S.a) * (S.dist - S.fait))) { S.dist += 1.2; S.allonge = true; }   // (il retomberait sur un muret : il saute un peu plus loin, par-dessus)
  const voulu = S.dist * p;
  while (S.fait < voulu - 1e-6 && !S.bloque) {   // par petits bouts, pour s'arrêter au bord d'un obstacle
    const pas = Math.min(0.05, voulu - S.fait), nx = h.x + Math.cos(S.a) * pas, ny = h.y + Math.sin(S.a) * pas;
    if (SAUT.murets ? libreSaut(nx, ny) : libre(nx, ny)) { h.x = nx; h.y = ny; S.fait += pas; } else S.bloque = true;
  }
  if (!S.pose && tc >= SAUT.air[1]) {   // les pieds touchent le sol : il repart aussitôt (le pouce poussé : il court ; lâché : un petit pas d'élan, puis il s'arrête)
    S.pose = true; atterrir();
    loco.v = Math.max(loco.v, SAUT.elan); loco.allure = 'course'; loco.course = 1; loco.marche = 0; loco.garde = 0;
  }
  if (tc >= SAUT.fin) h.saut = null;
  return !S.pose;   // (vrai tant qu'il est en l'air)
}
function poidsSaut() {
  if (!h.saut) return 0; const tc = SAUT.depart + h.saut.t * SAUT.vitesse;
  return Math.min(doux((tc - SAUT.depart) / 0.07), 1 - doux((tc - SAUT.sortie) / (SAUT.fin - SAUT.sortie)));
}
/* à l'atterrissage : un peu de poussière, et des petites notes dorées qui rebondissent autour des pieds */
function atterrir() {
  poussiere(h.x, h.y, h.a + Math.PI);
  if (PIST) return;   // (le Pisteur retombe sans bruit : juste un peu de poussière)
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * 6.28 + Math.random() * 0.4, sp = sprite(PETITES.or[i % 2], 0.2 + Math.random() * 0.06, true); const x = h.x + Math.cos(a) * 0.2, y = h.y + Math.sin(a) * 0.15;
    sp.position.copy(G(x, y, 0.15)); monde.add(sp); notes.push({ sp, x, y, z: 0.15, vx: Math.cos(a) * 1.3, vy: Math.sin(a) * 1.0, vz: 1.1 + Math.random() * 0.5, g: 4, t: 0, vie: 0.55 });
  }
  const l = prendre(0xffd890, 14, 3.5); if (l) { l.position.copy(G(h.x, h.y, 0.4)); eclats.push({ lum: l, t: 0, vie: 0.35, I: 14 }); }
}
/* la poussière du dérapage */
const poussieres = [];
function poussiere(x, y, a) {
  for (let i = 0; i < 7; i++) {
    const sp = sprite(T_LUEUR.poussiere, 0.25, false); const ox = (Math.random() - 0.5) * 0.5, oy = (Math.random() - 0.5) * 0.4;
    sp.position.copy(G(x + ox, y + oy, 0.12)); monde.add(sp);
    poussieres.push({ sp, x: x + ox, y: y + oy, vx: Math.cos(a) * (0.8 + Math.random()) + (Math.random() - 0.5), vy: Math.sin(a) * (0.8 + Math.random()) + (Math.random() - 0.5), t: 0 });
  }
}
function avancerPoussiere(dt) {
  for (let i = poussieres.length - 1; i >= 0; i--) {
    const p = poussieres[i]; p.t += dt; const u = p.t / 0.5;
    if (u >= 1) { monde.remove(p.sp); p.sp.material.dispose(); poussieres.splice(i, 1); continue; }
    p.x += p.vx * dt * (1 - u); p.y += p.vy * dt * (1 - u); p.sp.position.copy(G(p.x, p.y, 0.12 + 0.25 * u)); const k = 0.25 + 0.6 * u; p.sp.scale.set(k, k, 1); p.sp.material.opacity = 0.7 * (1 - u);
  }
}
function avancerEclats(dt) {
  for (let i = eclats.length - 1; i >= 0; i--) {
    const e = eclats[i]; e.t += dt; const u = e.t / e.vie;
    if (u >= 1) { if (e.sp) monde.remove(e.sp); if (e.lum) rendreL(e.lum); eclats.splice(i, 1); continue; }
    if (e.lum) { e.lum.intensity = e.I * (1 - u) * (1 - u); continue; }
    e.sp.position.x += e.vx * dt; e.sp.position.y -= e.vy * dt; e.sp.position.z += e.vz * dt;
    e.sp.material.opacity = 1 - u; const k = e.s0 * (e.grossit ? 1 + 1.8 * u : 1 - u * 0.6); e.sp.scale.set(k, k, 1);
  }
}

/* ---------- le pouce gauche, les deux boutons ---------- */
const joy = { id: null, bx: 0, by: 0, mx: 0, my: 0 };
can.addEventListener('pointerdown', e => { if (e.clientX < innerWidth * 0.5 && joy.id === null) { joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; try { can.setPointerCapture(e.pointerId); } catch (_) {} } });
can.addEventListener('pointermove', e => { if (e.pointerId !== joy.id) return; const R = Math.max(40, innerHeight * 0.13); let dx = e.clientX - joy.bx, dy = e.clientY - joy.by, dd = Math.hypot(dx, dy); const m = Math.min(1, dd / R); const wx = dx, wy = dy / K, n = Math.hypot(wx, wy) || 1; joy.mx = wx / n * m; joy.my = wy / n * m; const pt = $('pouce'); pt.style.transform = `translate(${dx / dd * Math.min(dd, R) || 0}px,${dy / dd * Math.min(dd, R) || 0}px)`; });
const fin = e => { if (e.pointerId === joy.id) { joy.id = null; joy.mx = joy.my = 0; $('pouce').style.transform = ''; } };
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => can.addEventListener(n, fin));
const touches = {}; addEventListener('keydown', e => { touches[e.key.toLowerCase()] = 1; const q = { 1: 'glace', 2: 'feu', 3: 'acide', 4: 'soin' }[e.key]; if (q) lancer(q); if (e.key === ' ') sauter(h.mx, h.my); }); addEventListener('keyup', e => { touches[e.key.toLowerCase()] = 0; });
for (const [id, q] of [['bGlace', 'glace'], ['bFeu', 'feu'], ['bAcide', 'acide'], ['bSoin', 'soin']]) $(id).addEventListener('pointerdown', e => { e.preventDefault(); lancer(q); });
$('bSaut').addEventListener('pointerdown', e => { e.preventDefault(); sauter(h.mx, h.my); });
$('pSaut').addEventListener('pointerdown', e => { e.preventDefault(); sauter(h.mx, h.my); });
$('pDague').addEventListener('pointerdown', e => { e.preventDefault(); frapper('dague'); });
$('pAssomme').addEventListener('pointerdown', e => { e.preventDefault(); frapper('assomme'); });
$('pOmbre').addEventListener('pointerdown', e => { e.preventDefault(); basculerOmbre(); });
if (PIST) addEventListener('keydown', e => { if (e.key === 'j' || e.key === 'J') frapper('dague'); if (e.key === 'k' || e.key === 'K') frapper('assomme'); if (e.key === 'l' || e.key === 'L') basculerOmbre(); });

/* ---------- où on peut marcher (comme les règles du jeu) ---------- */
function libre(x, y) { return libreSans(x, y) && !dansMuret(x, y) && !(PIST && Math.hypot(x - MANNEQUIN.x, y - MANNEQUIN.y) < MANNEQUIN.r + 0.3); }   // (les murets et le mannequin bloquent la marche, pas le saut)
function libreSans(x, y) {
  const r = 0.35, c = L.coin + r * Math.SQRT2;
  if (x < r || x > L.L - r || y < r || y > L.P - r || x + y < c || L.L - x + y < c) return false;
  if (Math.hypot(x - ARM.x, y - ARM.y) < ARM.r + r) return false;
  for (const l of Object.values(LANT)) if (Math.hypot(x - l[0], y - l[1]) < 0.55 + r) return false;
  return true;
}

/* ---------- la boucle ---------- */
const attendu = new Set(['fond', 'prof', 'barde']); let demarre = false;
function pret(n) { attendu.delete(n); if (!attendu.size && !demarre) { demarre = true; $('charge').style.display = 'none'; } }
let avant = performance.now(), ips = 60, nImg = 0, t0 = avant;
let tSim = 0;
function boucle(maint) {
  requestAnimationFrame(boucle);
  const dt = Math.min(0.05, (maint - avant) / 1000); avant = maint;
  nImg++; if (maint - t0 > 1000) { ips = Math.round(nImg * 1000 / (maint - t0)); nImg = 0; t0 = maint; $('ips').textContent = ips; }
  if (!window.__pilote) { tSim += dt; etape(dt, tSim); }
  rendu.render(scene, cam);
}
function avancer(sec) { for (let k = 0; k < Math.round(sec * 60); k++) { tSim += 1 / 60; etape(1 / 60, tSim); } }   // (pour les essais : le temps du jeu pas à pas)
function etape(dt, t) {
  /* déplacer le héros */
  let mx = joy.mx, my = joy.my; const kx = (touches.arrowright || touches.d ? 1 : 0) - (touches.arrowleft || touches.q || touches.a ? 1 : 0), ky = (touches.arrowdown || touches.s ? 1 : 0) - (touches.arrowup || touches.z || touches.w ? 1 : 0);
  if (kx || ky) { const n = Math.hypot(kx, ky), lent = touches.shift ? 0.25 : 1; mx = kx / n * lent; my = ky / n * lent; }
  if (h.sort && Math.hypot(mx, my) > 0.15) annulerSort();   // pousser le pouce pendant le sort le coupe : il range son luth en courant
  const bouge = !h.sort && Math.hypot(mx, my) > 0.15;
  h.sautR = Math.max(0, (h.sautR || 0) - dt); h.mx = mx; h.my = my;
  if (PIST && h.coup) { loco.v = Math.max(0, loco.v - 20 * dt); if (loco.v < 0.05) loco.allure = h.ombre ? 'guet' : 'garde'; }   // (il frappe sur place)
  else if (!h.saut || !avancerSaut(dt)) avancerHeros(dt, mx, my);   // (en l'air, c'est le saut qui le fait avancer ; dès qu'il touche le sol, le pouce reprend la main)
  h.tl += dt; if (h.geste !== undefined) h.geste += dt;
  if (h.luth === 'sort' && h.tl >= 0.85) { h.luth = 'main'; h.tl = 0; }
  if (h.luth === 'range' && h.tl >= 0.8) { h.luth = 'dos'; h.tl = 0; }
  if (h.sort) {
    h.sortT += dt; if (h.sort !== 'soin') h.a = window.__face !== undefined && window.__face !== false ? (typeof window.__face === 'number' ? window.__face : Math.PI / 2) : Math.atan2(ARM.y - h.y, ARM.x - h.x);
    const joue = h.luth === 'main' || (h.luth === 'sort' && h.tl > 0.6);
    if (joue && LUTH) {   // il gratte : des petites notes, et une lueur qui monte dans le luth
      h.petite = (h.petite || 0) - dt; if (h.petite <= 0) { petiteNote(h.sort); h.petite = h.sort === 'soin' ? 0.16 : 0.22; }
      if (!lumCharge) lumCharge = prendre(SORTS[h.sort].charge, 0, 2.5);
      if (lumCharge) { const d = bouchePosJeu(0.3); lumCharge.position.copy(G(d.x, d.y, d.z)); lumCharge.intensity = 9 * doux(h.sortT / h.sortD); }
    }
    if (h.sortT >= h.sortD) { if (h.sort === 'soin') soigner(); else partir(h.sort, LUTH ? bouchePosJeu() : null); h.dernier = h.sort; h.sort = null; h.garde = 0.9; h.geste = 0; h.eclair = false; rendreL(lumCharge); lumCharge = null; }
  } else {
    if (h.luth === 'main') { h.garde -= dt; if (bouge || h.garde <= 0) { h.luth = 'range'; h.tl = 0; } }

  }
  /* le Barde tourne doucement vers où il va */
  if (h.derap) {   // le dérapage : le corps pivote vite, penché vers où il repart, puis se redresse
    const D = h.derap; D.t += dt; const u = Math.min(1, D.t / 0.22), e = 1 - Math.pow(1 - u, 3);
    barde.rotation.z = D.rz0 + D.da * e;
    const pen = 0.38 * Math.sin(Math.min(1, D.t / 0.3) * Math.PI), dw = new THREE.Vector3(Math.cos(D.a1), -Math.sin(D.a1), 0);
    incline.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1).cross(dw).normalize(), pen);
    if (D.t >= 0.3) { h.derap = null; incline.quaternion.identity(); }
  } else { const cible = Math.PI / 2 - h.a; let da = cible - barde.rotation.z; da = Math.atan2(Math.sin(da), Math.cos(da)); barde.rotation.z += da * Math.min(1, dt * (h.saut || h.coup ? 30 : 12)); }
  incline.position.copy(G(h.x, h.y, 0));
  const r = h.sautR / SAUT.recharge; if (r !== etape.r) { etape.r = r; $('bSaut').style.setProperty('--r', r.toFixed(3)); }
  if (melangeur) { locomotion(dt); melangeur.update(dt); }
  redresser();
  barde.updateMatrixWorld(true); animerLuth(dt, t);
  avancerTirs(dt); avancerEclats(dt); avancerNotes(dt); avancerEclairs(dt); avancerPoussiere(dt); avancerGouttes(dt); avancerSoins(dt); if (PIST) avancerPisteur(dt, t);
  /* les flammes, les lumières qui vacillent */
  for (const f of flammes) { const k = 0.85 + 0.15 * Math.sin(t * 11 + f.b[0] + f.i * 2) + 0.08 * Math.sin(t * 27 + f.i); const w = (0.42 - f.i * 0.09) * k; f.f.scale.set(w, w * 1.6, 1); f.f.position.x = Math.sin(t * 7 + f.i * 2.1) * 0.04 + (f.i - 1) * 0.06; }
  brasiers.forEach((l, i) => { l.intensity = 40 * (0.85 + 0.12 * Math.sin(t * 9 + i * 3) + 0.06 * Math.sin(t * 23 + i)); });
  lueurArmure.intensity = 45 * (0.9 + 0.1 * Math.sin(t * 2.1));
  /* la caméra suit le héros (comme dans le jeu) */
  const hx = px(h.x), hy = py(h.y, 0);
  const cxT = SW <= Ws ? (SW - Ws) / 2 : clamp(hx - Ws / 2, 0, SW - Ws), haut = py(ARM.y, 4.9) - 10;
  let cyT = Math.max(haut - 30, hy + 50 - Hs); cyT = SH <= Hs ? (SH - Hs) / 2 : clamp(cyT, 0, SH - Hs);
  if (!boucle.vu) { camX = cxT; camY = cyT; boucle.vu = 1; } const kc = Math.min(1, dt * 5); camX += (cxT - camX) * kc; camY += (cyT - camY) * kc;
  cadrer(); fondMat.uniforms.fen.value.set(camX / SW, camY / SH, (camX + Ws) / SW, (camY + Hs) / SH);
}
requestAnimationFrame(boucle);
function pieds() {   // (pour les essais) les orteils, en coordonnées du jeu
  const r = {}; if (!MOD) return r;
  for (const n of ['LeftToeBase', 'RightToeBase']) { const o = MOD.getObjectByName(n); if (!o) continue; o.updateWorldMatrix(true, false); const v = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); r[n] = [v.x, -v.y, v.z / ZS]; }
  return r;
}
function piedsModele() { const r = {}; for (const n of ['LeftToeBase', 'Hips']) { const o = MOD.getObjectByName(n); o.updateWorldMatrix(true, false); const v = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); MOD.worldToLocal(v); r[n] = [v.x, v.y, v.z]; } r.t = actions.marche ? actions.marche.time : 0; r.ts = actions.marche ? actions.marche.getEffectiveTimeScale() : 0; return r; }
function poser(nom, t) {   // (essai) un seul mouvement, à un instant donné
  for (const n in actions) { actions[n].play(); actions[n].setEffectiveWeight(n === nom ? 1 : 0); actions[n].timeScale = 0; }
  actions[nom].time = t; melangeur.update(0); MOD.updateMatrixWorld(true); const r = piedsModele(); for (const n of ['LeftUpLeg', 'LeftLeg', 'Hips']) { const o = MOD.getObjectByName(n); r[n + '_q'] = o.quaternion.toArray(); r[n + '_p'] = o.position.toArray(); } r.pistes = actions[nom].getClip().tracks.slice(0, 6).map(k => k.name); r.nbPistes = actions[nom].getClip().tracks.length; r.duree = actions[nom].getClip().duration; return r;
}
window.__essai = { osM: noms => { const r = {}; for (const n of noms) { const o = MOD.getObjectByName(n); if (!o) continue; o.updateWorldMatrix(true, false); const v = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); MOD.worldToLocal(v); r[n] = [v.x, v.y, v.z]; } return r; }, frapper, basculerOmbre, mq, MURETS, COUPS, sauter, SAUT, get tirs() { return tirs.map(s => ({ x: s.x, y: s.y, z: s.z, q: s.q })); }, ecran: (x, y, z) => ({ x: (px(x) - camX) * innerWidth / Ws, y: (py(y, z) - camY) * innerHeight / Hs }), poser, piedsModele, pieds, avancer, taille, joy, loco, h, get ips() { return ips; }, lancer, OS: () => OS, LUTH: () => LUTH, get pret() { return demarre; }, get vue() { return { camX, camY, Ws, Hs, hx: px(h.x), hy: py(h.y) }; } };
