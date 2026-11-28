// Revue des golems 3D : quatre vues (face, profil, dos, trois-quarts) d'un .glb, sur fond neutre.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
window.voir = async (url) => {
  const W = 1600, H = 520;
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setSize(W, H); r.setPixelRatio(1); document.body.appendChild(r.domElement);
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x30343e);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404050, 1.7));
  const d = new THREE.DirectionalLight(0xffffff, 2.4); d.position.set(3, 6, 5); scene.add(d);
  const d2 = new THREE.DirectionalLight(0xbfd0ff, 0.8); d2.position.set(-4, 3, -4); scene.add(d2);
  const g = await new GLTFLoader().loadAsync(url); const m = g.scene;
  let tri = 0, os = 0; m.traverse(o => { if (o.isMesh) tri += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; if (o.isBone) os++; });
  const box = new THREE.Box3().setFromObject(m); const size = box.getSize(new THREE.Vector3()); const c = box.getCenter(new THREE.Vector3());
  m.position.sub(c); scene.add(m);
  const cam = new THREE.PerspectiveCamera(28, (W / 4) / H, 0.01, 200);
  const dist = Math.max(size.y, size.x * 1.3, size.z * 1.3) * 2.25;
  r.setScissorTest(true);
  [0, Math.PI / 2, Math.PI, Math.PI / 4].forEach((a, i) => {
    cam.position.set(Math.sin(a) * dist, size.y * 0.12, Math.cos(a) * dist); cam.lookAt(0, 0, 0);
    r.setViewport(i * W / 4, 0, W / 4, H); r.setScissor(i * W / 4, 0, W / 4, H); r.render(scene, cam);
  });
  return { taille: [size.x, size.y, size.z].map(v => +v.toFixed(2)), triangles: Math.round(tri), os, mouvements: g.animations.map(a => a.name + ' ' + a.duration.toFixed(1) + ' s') };
};
window.pret = true;
