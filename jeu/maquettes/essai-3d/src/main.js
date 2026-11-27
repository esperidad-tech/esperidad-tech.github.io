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
  Hs = Math.max(410, 800 * vh / vw); Ws = Hs * vw / vh;
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
const h = { x: 9, y: 7.6, a: -Math.PI / 2, vx: 0, vy: 0, etat: 'garde', tSort: 0 };
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
  if (g.animations.length) actions.garde = melangeur.clipAction(g.animations[0]);
  let reste = Object.keys(ANIMS).length; if (!reste) pret('barde');
  for (const [nom, fichier] of Object.entries(ANIMS)) charger(fichier, a => { if (a.animations[0]) { const act = melangeur.clipAction(a.animations[0]); actions[nom] = act; if (nom === 'feu' || nom === 'glace') { act.setLoop(THREE.LoopOnce); act.clampWhenFinished = true; } } if (--reste === 0) pret('barde'); }, () => { if (--reste === 0) pret('barde'); });
  jouer('garde');
}, e => { $('charge').textContent = '⚠'; console.error(e); });
function jouer(nom, fondu) {
  const a = actions[nom] || actions.garde; if (!a || a === enCours) return;
  a.reset().setEffectiveWeight(1).play(); if (enCours) a.crossFadeFrom(enCours, fondu || 0.25, true); enCours = a;
}

/* ---------- le sort : une note qui vole vers l'armure, une vraie lumière qui éclaire au passage ---------- */
const tirs = [], eclats = [];
function lancer(q) {
  if (h.tSort > 0) return; h.tSort = q === 'feu' ? 1.5 : 0.9; h.sort = q; h.lanceA = 0;
  jouer(q, 0.15); h.etat = q;
}
/* des lumières toujours là (éteintes) : en ajouter une en plein jeu ferait recalculer tous les dessins (un à-coup) */
const reserve = [];
for (let i = 0; i < 5; i++) { const l = new THREE.PointLight(0xffffff, 0, 7, 1.6); l.libre = true; monde.add(l); reserve.push(l); }
function prendre(coul, I, dist) { const l = reserve.find(r => r.libre); if (!l) return null; l.libre = false; l.color.setHex(coul); l.intensity = I; l.distance = dist; return l; }
function rendreL(l) { if (l) { l.intensity = 0; l.libre = true; } }
function partir(q) {
  const feu = q === 'feu', gr = new THREE.Group(), main = G(h.x + Math.cos(h.a) * 0.4, h.y + Math.sin(h.a) * 0.4, 1.1);
  gr.position.copy(main); monde.add(gr);
  const halo = sprite(feu ? T_LUEUR.feu : T_LUEUR.glace, feu ? 1.3 : 0.9, true); gr.add(halo);
  const n = sprite(texNote(feu ? '#ffb04a' : '#bff0ff', feu), feu ? 0.6 : 0.45, false); gr.add(n);
  const l = prendre(feu ? 0xff7a2a : 0x7fd8ff, feu ? 40 : 22, feu ? 7 : 5); if (l) l.position.copy(main);
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: feu ? T_LUEUR.feu : T_LUEUR.glace, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); monde.add(sol);   // (à plat sur le sol)
  tirs.push({ gr, l, sol, feu, x: main.x, y: -main.y, z: 1.1, t: 0 });
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
function boucle(maint) {
  requestAnimationFrame(boucle);
  const dt = Math.min(0.05, (maint - avant) / 1000); avant = maint; const t = maint / 1000;
  nImg++; if (maint - t0 > 1000) { ips = Math.round(nImg * 1000 / (maint - t0)); nImg = 0; t0 = maint; $('ips').textContent = ips; }
  /* déplacer le héros */
  let mx = joy.mx, my = joy.my; const kx = (touches.arrowright || touches.d ? 1 : 0) - (touches.arrowleft || touches.q || touches.a ? 1 : 0), ky = (touches.arrowdown || touches.s ? 1 : 0) - (touches.arrowup || touches.z || touches.w ? 1 : 0);
  if (kx || ky) { const n = Math.hypot(kx, ky); mx = kx / n; my = ky / n; }
  const bouge = h.tSort <= 0 && Math.hypot(mx, my) > 0.15;
  if (bouge) { const v = 3.6 * Math.min(1, Math.hypot(mx, my)); const nx = h.x + mx * v * dt, ny = h.y + my * v * dt; if (libre(nx, h.y)) h.x = nx; if (libre(h.x, ny)) h.y = ny; h.a = Math.atan2(my, mx); }
  if (h.tSort > 0) { const avantT = h.tSort; h.tSort -= dt; h.a = Math.atan2(ARM.y - h.y, ARM.x - h.x); const depart = h.sort === 'feu' ? 0.55 : 0.45; if (avantT > depart && h.tSort <= depart) partir(h.sort); if (h.tSort <= 0) h.etat = ''; }
  else jouer(bouge ? 'course' : 'garde', 0.2);
  /* le Barde tourne doucement vers où il va */
  const cible = Math.PI / 2 - h.a; let da = cible - barde.rotation.z; da = Math.atan2(Math.sin(da), Math.cos(da)); barde.rotation.z += da * Math.min(1, dt * 12);
  barde.position.copy(G(h.x, h.y, 0));
  if (melangeur) melangeur.update(dt);
  avancerTirs(dt); avancerEclats(dt);
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
  rendu.render(scene, cam);
}
requestAnimationFrame(boucle);
window.__essai = { h, get ips() { return ips; }, lancer, get pret() { return demarre; }, get vue() { return { camX, camY, Ws, Hs, hx: px(h.x), hy: py(h.y) }; } };
