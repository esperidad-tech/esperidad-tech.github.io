// Revue de l'armure 3D en haut des marches de la place de nuit (même caméra que l'essai : celle de la peinture)
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import NJ from './nuit.json';
const W = 2192, H = 936, IMW = NJ.image[0], IMH = NJ.image[1];
const can = document.getElementById('c'); can.width = W; can.height = H;
const r = new THREE.WebGLRenderer({ canvas: can, antialias: true, preserveDrawingBuffer: true });
r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.shadowMap.enabled = true;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(40, 1, 0.5, 400), PHI = NJ.phi;
const d = new THREE.Vector3(0, Math.cos(PHI), -Math.sin(PHI)), up = new THREE.Vector3(0, Math.sin(PHI), Math.cos(PHI));
cam.position.set(NJ.xoff, -NJ.dmax, NJ.camH); cam.up.copy(up); cam.lookAt(cam.position.clone().add(d));
window.cadre = (x0, y0, x1, y1) => { const n = cam.near, f = NJ.f;
  cam.projectionMatrix.makePerspective((x0 - NJ.cx) / f * n, (x1 - NJ.cx) / f * n, (NJ.cy - y0) / f * n, (NJ.cy - y1) / f * n, n, cam.far);
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert(); fondM.uniforms.fen.value.set(x0, y0, x1, y1); };
const G = (x, y, z) => new THREE.Vector3(x, -y, z || 0);
const fondT = new THREE.TextureLoader().load('fond.jpg', () => { window.fondPret = true; }); fondT.colorSpace = THREE.SRGBColorSpace;
const fondM = new THREE.ShaderMaterial({ uniforms: { t: { value: fondT }, fen: { value: new THREE.Vector4(0, 0, IMW, IMH) }, img: { value: new THREE.Vector2(IMW, IMH) } }, depthWrite: false, depthTest: false,
  vertexShader: 'varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: 'uniform sampler2D t; uniform vec4 fen; uniform vec2 img; varying vec2 vU; void main(){ vec2 p = vec2(mix(fen.x, fen.z, vU.x), mix(fen.w, fen.y, vU.y)); gl_FragColor = texture2D(t, vec2(p.x / img.x, 1.0 - p.y / img.y));\n#include <colorspace_fragment>\n}' });
const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fondM); q.frustumCulled = false; q.renderOrder = -10; scene.add(q);
// la lumière de la nuit (comme l'essai) : ciel bleu sombre, la porte du temple dans le dos, les lanternes ; le rayon doré d'Elyra
scene.add(new THREE.HemisphereLight(0x6c7cc0, 0x2a2436, 0.75));
{ const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22; }
const porte = new THREE.DirectionalLight(0xdfe8ff, 0.8); porte.position.copy(G(NJ.porte.x, NJ.porte.y, 5)); porte.target.position.copy(G(NJ.porte.x, 12, 0)); scene.add(porte, porte.target);
for (const P of NJ.piliers) { const x = P.x + NJ.xoff, y = NJ.dmax - P.d; const pt = new THREE.PointLight(0xffb060, 30, 14, 1.4); pt.position.copy(G(x, y + 0.4, P.lanterne)); scene.add(pt); }
const contre = new THREE.DirectionalLight(0xe8eeff, 2.2); contre.position.copy(G(NJ.porte.x, NJ.porte.y - 4, 6)); contre.target.position.copy(G(NJ.armure.x, NJ.armure.y + 2, 1.5)); scene.add(contre, contre.target);
const face = new THREE.DirectionalLight(0x9fb0ff, 0.3); face.position.copy(G(NJ.xoff, 30, 12)); face.target.position.copy(G(NJ.armure.x, NJ.armure.y, 2)); scene.add(face, face.target);
const dos = new THREE.PointLight(0xffd070, 25, 8, 1.4); dos.position.copy(G(NJ.armure.x, NJ.armure.y - 1.2, NJ.armure.z + 2.2)); scene.add(dos);
window.charger = (url, haut, tAnim, rot) => new Promise((ok, ko) => new GLTFLoader().load(url, g => {
  const m = g.scene; m.traverse(o => { if (o.isMesh) { o.frustumCulled = false; } });
  const b = new THREE.Box3().setFromObject(m), s = new THREE.Vector3(); b.getSize(s); window.taille = [s.x, s.y, s.z];
  m.scale.setScalar(haut / s.y);
  const piv = new THREE.Group(); piv.rotation.x = Math.PI / 2; piv.add(m); m.rotation.y = rot || 0;
  m.traverse(o => { if (o.isMesh && o.material) { o.material.envMapIntensity = 0.5; if (o.material.color) o.material.color.multiplyScalar(0.85); } });
  const ombre = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(0.6, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })(), transparent: true, depthWrite: false })); ombre.scale.set(haut * 0.42, haut * 0.2, 1); ombre.position.z = 0.02;
  const place = new THREE.Group(); place.add(ombre); place.position.copy(G(NJ.armure.x, NJ.armure.y, NJ.armure.z)); place.add(piv); scene.add(place);
  if (g.animations.length && tAnim >= 0) { const mx = new THREE.AnimationMixer(m); mx.clipAction(g.animations[0]).play(); mx.update(tAnim); }
  window.dur = g.animations.length ? g.animations[0].duration : 0;
  ok(g.animations.length);
}, undefined, ko));
window.dessiner = () => r.render(scene, cam);
