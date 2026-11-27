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
const T_LUEUR = { or: texLueur('rgba(255,200,90,.95)'), feu: texLueur('rgba(255,120,40,.95)'), glace: texLueur('rgba(140,220,255,.95)'), rouge: texLueur('rgba(255,70,40,.95)') };
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
const barde = new THREE.Group(); monde.add(barde);
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
charger('barde.json', g => {
  const m = g.scene; m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; if (o.material) { o.material.metalness = 0; o.material.envMapIntensity = 0.5; } } });
  m.scale.setScalar(1.55 / 1.5);   // (le modèle fait 1,5 m ; un héros fait environ 1,55 pas)
  corps.add(m); melangeur = new THREE.AnimationMixer(m);
  preparerLuth(m);
  if (g.animations.length) actions.garde = melangeur.clipAction(g.animations[0]);
  let reste = Object.keys(ANIMS).length; if (!reste) pret('barde');
  for (const [nom, fichier] of Object.entries(ANIMS)) charger(fichier, a => { if (a.animations[0]) { const act = melangeur.clipAction(a.animations[0]); actions[nom] = act; if (nom === 'feu' || nom === 'glace') { act.setLoop(THREE.LoopOnce); act.clampWhenFinished = true; } } if (--reste === 0) pret('barde'); }, () => { if (--reste === 0) pret('barde'); });
  if (actions.garde) actions.garde.play();
}, e => { $('charge').textContent = '⚠'; console.error(e); });
/* ---------- marcher, courir : le pouce un peu poussé, il marche ; à fond, il court ----------
   Les deux mouvements avancent ensemble, au même « pas » (même moment du pied gauche posé), et à la vitesse
   où il avance vraiment : les pieds ne glissent pas (mesuré sur les mouvements : outils/pas.py). */
const ALLURE = {
  marche: { debut: 1.619, cycle: 1.4, foulee: 0.837 },   // (un cycle = deux pas ; foulée en pas du jeu, le Barde fait 1,55 pas)
  course: { debut: 0.049, cycle: 0.7333, foulee: 2.49 }
};
const loco = { garde: 1, marche: 0, course: 0, phase: 0 };
function locomotion(dt, v) {
  const b = doux((v - 1.0) / 1.0), arret = v < 0.05 ? 1 : 0;
  const cible = { garde: arret, marche: (1 - arret) * (1 - b), course: (1 - arret) * b };
  const k = Math.min(1, dt * 9); let somme = 0;
  for (const n in cible) { loco[n] += (cible[n] - loco[n]) * k; somme += loco[n]; }
  for (const n in cible) loco[n] /= somme || 1;
  const L = ALLURE.marche.foulee + (ALLURE.course.foulee - ALLURE.marche.foulee) * b;
  if (v > 0.05) loco.phase = (loco.phase + dt * v / L) % 1;
  for (const n of ['garde', 'marche', 'course']) {
    const a = actions[n]; if (!a) continue;
    if (!a.__lance) { a.play(); a.__lance = true; }
    a.setEffectiveWeight(loco[n]);
    if (n !== 'garde') { const al = ALLURE[n]; a.timeScale = 0; a.time = (al.debut + loco.phase * al.cycle) % a.getClip().duration; }
  }
}
function jouer(nom, fondu) {
  const a = actions[nom] || actions.garde; if (!a || a === enCours) return;
  a.reset().setEffectiveWeight(1).play(); if (enCours) a.crossFadeFrom(enCours, fondu || 0.25, true); enCours = a;
}

/* ---------- le luth : sur le dos quand il court ; pendant un sort, il l'attrape par-dessus l'épaule, le ramène devant, gratte, et la note part du luth ----------
   Tout se calcule dans le repère du modèle (glTF : y en haut, le Barde regarde vers +z, sa gauche vers +x). */
const LU = { centre: new THREE.Vector3(0.035, 0.846, -0.146), axe: new THREE.Vector3(-0.526, 0.85, 0.036).normalize(), face: new THREE.Vector3(-0.066, 0.001, -0.998).normalize() };
const DUREE = { glace: 1.5, feu: 3.0 };   // (comme dans le jeu : javelot de glace 1,5 s, boule de feu 3 s)
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
  const g = Math.sin(t * 2 * Math.PI * 4.5);
  const cordes = surLuth(0.05 + 0.015 * g * grattage, 0.045 * g * grattage, 0.05 + 0.012 * Math.abs(g) * grattage);   // la main droite va et vient sur les cordes
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
  const cibleR = prise.clone().lerp(poignetD, r.sR);
  const poleR = new THREE.Vector3(-0.6, 0.5, 0.2).lerp(new THREE.Vector3(-0.7, -0.6, -0.3), clamp(r.k * 1.2, 0, 1));
  guider(OS.RightArm, OS.RightForeArm, OS.RightHand, cibleR, poleR, r.wR);
  orienter(OS.RightHand, Fd, Pd, MAIN.paumeD, r.wR * r.sR);
  guider(OS.LeftArm, OS.LeftForeArm, OS.LeftHand, poignetG, new THREE.Vector3(0.7, -0.6, -0.2), r.wL);
  orienter(OS.LeftHand, Fg, Pg, MAIN.paumeG, r.wL);
}
/* tourner la main : ses doigts (l'axe y de l'os) vers F, sa paume vers P (repère du modèle) */
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
function lancer(q) {
  if (h.sort) return;
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
  const feu = q === 'feu', gr = new THREE.Group(), main = d ? G(d.x, d.y, d.z) : G(h.x + Math.cos(h.a) * 0.4, h.y + Math.sin(h.a) * 0.4, 1.1);
  gr.position.copy(main); monde.add(gr);
  const halo = sprite(feu ? T_LUEUR.feu : T_LUEUR.glace, feu ? 1.3 : 0.9, true); gr.add(halo);
  const n = sprite(texNote(feu ? '#ffb04a' : '#bff0ff', feu), feu ? 0.6 : 0.45, false); gr.add(n);
  const l = prendre(feu ? 0xff7a2a : 0x7fd8ff, feu ? 40 : 22, feu ? 7 : 5); if (l) l.position.copy(main);
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: feu ? T_LUEUR.feu : T_LUEUR.glace, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); monde.add(sol);   // (à plat sur le sol)
  tirs.push({ gr, l, sol, feu, x: main.x, y: -main.y, z: d ? d.z : 1.1, t: 0 });
}
function avancerTirs(dt) {
  for (let i = tirs.length - 1; i >= 0; i--) {
    const s = tirs[i]; s.t += dt; const dx = ARM.x - s.x, dy = ARM.y + 0.6 - s.y, dd = Math.hypot(dx, dy), v = s.feu ? 9 : 12;
    if (dd < 0.5) { rendreL(s.l); boum(s); monde.remove(s.gr); monde.remove(s.sol); tirs.splice(i, 1); continue; }
    s.x += dx / dd * v * dt; s.y += dy / dd * v * dt; s.z += (2.3 - s.z) * Math.min(1, dt * 2);
    s.gr.position.copy(G(s.x, s.y, s.z + Math.sin(s.t * 10) * 0.05)); if (s.l) s.l.position.copy(s.gr.position); s.gr.children[1].material.rotation = Math.sin(s.t * 8) * 0.4;
    s.sol.position.copy(G(s.x, s.y, 0.02)); s.sol.scale.set(s.feu ? 2.6 : 1.8, s.feu ? 2.6 : 1.8, 1);
    if (Math.random() < dt * 40) etincelle(s.x, s.y, s.z, s.feu);
  }
}
function etincelle(x, y, z, feu, v) {
  const sp = sprite(feu ? texFlamme : T_LUEUR.glace, feu ? 0.3 : 0.18, true); sp.position.copy(G(x, y, z)); monde.add(sp);
  const a = Math.random() * 6.28, s = (v || 0.6) * Math.random();
  eclats.push({ sp, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: feu ? 1 + Math.random() : Math.random() * 0.5 - 0.2, vie: 0.5 + Math.random() * 0.4, t: 0, s0: feu ? 0.3 : 0.18 });
}
function boum(s) {
  const l = prendre(s.feu ? 0xff8a3a : 0x9fe8ff, s.feu ? 60 : 30, 8); if (l) { l.position.copy(G(s.x, s.y, s.z)); eclats.push({ lum: l, t: 0, vie: 0.45, I: l.intensity }); }
  for (let i = 0; i < (s.feu ? 26 : 16); i++) etincelle(s.x, s.y, s.z, s.feu, 3);
}
function petiteNote(feu) {
  if (!LUTH) return; const d = bouchePosJeu();
  const sp = sprite(texNote(feu ? '#ffc070' : '#d8f6ff', Math.random() < 0.5), 0.2, false); sp.position.copy(G(d.x, d.y, d.z)); monde.add(sp);
  notes.push({ sp, x: d.x, y: d.y, z: d.z, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.3, t: 0 });
}
function avancerNotes(dt) {
  for (let i = notes.length - 1; i >= 0; i--) {
    const n = notes[i]; n.t += dt; if (n.t > 0.9) { monde.remove(n.sp); notes.splice(i, 1); continue; }
    n.x += n.vx * dt; n.y += n.vy * dt; n.z += 0.9 * dt; n.sp.position.copy(G(n.x, n.y, n.z)); n.sp.material.opacity = 1 - n.t / 0.9; n.sp.material.rotation = Math.sin(n.t * 9) * 0.3;
  }
}
function avancerEclats(dt) {
  for (let i = eclats.length - 1; i >= 0; i--) {
    const e = eclats[i]; e.t += dt; const u = e.t / e.vie;
    if (u >= 1) { if (e.sp) monde.remove(e.sp); if (e.lum) rendreL(e.lum); eclats.splice(i, 1); continue; }
    if (e.lum) { e.lum.intensity = e.I * (1 - u) * (1 - u); continue; }
    e.sp.position.x += e.vx * dt; e.sp.position.y -= e.vy * dt; e.sp.position.z += e.vz * dt;
    e.sp.material.opacity = 1 - u; const k = e.s0 * (1 - u * 0.6); e.sp.scale.set(k, k, 1);
  }
}

/* ---------- le pouce gauche, les deux boutons ---------- */
const joy = { id: null, bx: 0, by: 0, mx: 0, my: 0 };
can.addEventListener('pointerdown', e => { if (e.clientX < innerWidth * 0.5 && joy.id === null) { joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; try { can.setPointerCapture(e.pointerId); } catch (_) {} } });
can.addEventListener('pointermove', e => { if (e.pointerId !== joy.id) return; const R = Math.max(40, innerHeight * 0.13); let dx = e.clientX - joy.bx, dy = e.clientY - joy.by, dd = Math.hypot(dx, dy); const m = Math.min(1, dd / R); const wx = dx, wy = dy / K, n = Math.hypot(wx, wy) || 1; joy.mx = wx / n * m; joy.my = wy / n * m; const pt = $('pouce'); pt.style.transform = `translate(${dx / dd * Math.min(dd, R) || 0}px,${dy / dd * Math.min(dd, R) || 0}px)`; });
const fin = e => { if (e.pointerId === joy.id) { joy.id = null; joy.mx = joy.my = 0; $('pouce').style.transform = ''; } };
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => can.addEventListener(n, fin));
const touches = {}; addEventListener('keydown', e => { touches[e.key.toLowerCase()] = 1; if (e.key === '1') lancer('glace'); if (e.key === '2') lancer('feu'); }); addEventListener('keyup', e => { touches[e.key.toLowerCase()] = 0; });
$('bGlace').addEventListener('pointerdown', e => { e.preventDefault(); lancer('glace'); });
$('bFeu').addEventListener('pointerdown', e => { e.preventDefault(); lancer('feu'); });

/* ---------- où on peut marcher (comme les règles du jeu) ---------- */
function libre(x, y) {
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
  const bouge = !h.sort && Math.hypot(mx, my) > 0.15;
  let vit = 0;
  if (bouge) { const v = 3.6 * Math.min(1, Math.hypot(mx, my)); vit = v; const nx = h.x + mx * v * dt, ny = h.y + my * v * dt; if (libre(nx, h.y)) h.x = nx; if (libre(h.x, ny)) h.y = ny; h.a = Math.atan2(my, mx); }
  h.tl += dt;
  if (h.luth === 'sort' && h.tl >= 0.85) { h.luth = 'main'; h.tl = 0; }
  if (h.luth === 'range' && h.tl >= 0.8) { h.luth = 'dos'; h.tl = 0; }
  if (h.sort) {
    h.sortT += dt; h.a = window.__face !== undefined && window.__face !== false ? (typeof window.__face === 'number' ? window.__face : Math.PI / 2) : Math.atan2(ARM.y - h.y, ARM.x - h.x);
    const joue = h.luth === 'main' || (h.luth === 'sort' && h.tl > 0.6);
    if (joue && LUTH) {   // il gratte : des petites notes, et une lueur qui monte dans le luth
      h.petite = (h.petite || 0) - dt; if (h.petite <= 0) { petiteNote(h.sort === 'feu'); h.petite = 0.22; }
      if (!lumCharge) lumCharge = prendre(h.sort === 'feu' ? 0xff8a3a : 0x8fe0ff, 0, 2.5);
      if (lumCharge) { const d = bouchePosJeu(0.3); lumCharge.position.copy(G(d.x, d.y, d.z)); lumCharge.intensity = 9 * doux(h.sortT / h.sortD); }
    }
    if (h.sortT >= h.sortD) { partir(h.sort, LUTH ? bouchePosJeu() : null); h.sort = null; h.garde = 0.9; rendreL(lumCharge); lumCharge = null; }
  } else {
    if (h.luth === 'main') { h.garde -= dt; if (bouge || h.garde <= 0) { h.luth = 'range'; h.tl = 0; } }

  }
  /* le Barde tourne doucement vers où il va */
  const cible = Math.PI / 2 - h.a; let da = cible - barde.rotation.z; da = Math.atan2(Math.sin(da), Math.cos(da)); barde.rotation.z += da * Math.min(1, dt * 12);
  barde.position.copy(G(h.x, h.y, 0));
  if (melangeur) { locomotion(dt, vit); melangeur.update(dt); }
  redresser();
  barde.updateMatrixWorld(true); animerLuth(dt, t);
  avancerTirs(dt); avancerEclats(dt); avancerNotes(dt);
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
window.__essai = { avancer, taille, joy, loco, h, get ips() { return ips; }, lancer, OS: () => OS, LUTH: () => LUTH, get pret() { return demarre; }, get vue() { return { camX, camY, Ws, Hs, hx: px(h.x), hy: py(h.y) }; } };
