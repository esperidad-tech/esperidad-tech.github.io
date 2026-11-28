/* L'essai « en vraie 3D » (Brumeval, phase 2, 27 novembre) : juger l'image, pas le jeu.
   - La salle de l'armure rendue une fois par Blender, en très grand (deux fois plus fin que le jeu), avec sa profondeur.
   - Le Barde en vrai volume (modèle 3D fait par Higgsfield / Meshy, avec un squelette et des mouvements tout faits),
     éclairé en direct par les mêmes lumières que la salle (brasiers, lanternes, la lueur de l'armure, la fente du plafond).
   - Il passe derrière ce qui est devant lui (les lanternes) grâce à la profondeur de l'image.
   - Un sort : la note de feu (une vraie lumière qui l'éclaire au passage) ; la note glacée. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import NJ from '../site/nuit/nuit.json';
import SJ from '../site/pisteur/salle.json';   // (la salle du Pisteur peinte par Romain, de nuit : la caméra, les cases, les lumières, les portes ; outils/salle-pisteur/generer.py)   // (les 20 cristaux peints par Romain : leur pied, leur taille, leurs découpes ; outils/salle-nuit/cristaux_peints.py…)   // (la place de nuit : la caméra de la peinture, les cases du sol, les repères ; outils/salle-nuit/generer.py)

const PIST = window.QUI === 'pisteur';   // (le héros choisi sur le premier écran : le Barde ou le Pisteur)
const NUIT = !PIST;   // le Barde joue sur la place de nuit peinte par Romain (27 novembre)
const PEINT = true;   // les deux héros jouent sur une peinture de Romain : le Barde sur la place de nuit, le Pisteur dans sa salle de la phase 1 (28 novembre)
const PJ = NUIT ? NJ : SJ;   // (la caméra de la peinture, ses cases)
const T = 40, K = NUIT ? 0.4 : PIST ? 0.57 : 0.62, OX = 70, OY = 250, SW = 860, SH = 556;   // (K : l'écrasement du sol vu par la caméra ; sert au pouce)
const THETA = Math.asin(0.62), ZS = PEINT ? 1 : 1 / Math.cos(THETA);
const L = { L: 18, P: 10.5, coin: 3.4 };
const ARM = NUIT ? { x: 10.62, y: -9.45, z: 2.0, r: 1.6, zc: 4.3, dy: 0 } : { x: 9, y: 1.25, r: 1.6, zc: 2.3, dy: 0.6 };   // (la nuit : l'armure de Grosbec en haut des marches, sur le palier juste devant le seuil de la porte du temple, le dos à la porte : le Pisteur arrive derrière elle ; Romain, 28 nov., 5 h ; un peu avancée à 5 h 30 : sur le seuil même, ses pieds étaient dans la lumière de la porte et elle flottait ; à 5 h 47, 33 cm à gauche : ses pieds sont centrés sur la porte, colonne 2169 de la peinture)
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

/* ---------- la caméra : exactement celle de Blender (decor3d/base.py) ; la nuit : celle de la peinture de Romain ---------- */
const scene = new THREE.Scene();
const cam = PEINT ? new THREE.PerspectiveCamera(40, 1, 0.5, 400) : new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);
const PHI = PEINT ? PJ.phi : THETA;
const d = new THREE.Vector3(0, Math.cos(PHI), -Math.sin(PHI)), up = new THREE.Vector3(0, Math.sin(PHI), Math.cos(PHI));
const vise = new THREE.Vector3((SW / 2 - OX) / T, -(SH / 2 - OY) / (T * K), 0);
if (PEINT) { cam.position.set(PJ.xoff, -PJ.dmax, PJ.camH); cam.up.copy(up); cam.lookAt(cam.position.clone().add(d)); }
else { cam.position.copy(vise).addScaledVector(d, -120); cam.up.copy(up); cam.lookAt(vise); }
function cadrer() {
  cam.left = (camX - SW / 2) / T; cam.right = (camX + Ws - SW / 2) / T;
  cam.top = (SH / 2 - camY) / T; cam.bottom = (SH / 2 - camY - Hs) / T;
  cam.updateProjectionMatrix();
}
/* la nuit : on montre un morceau de la peinture (fen : x0, y0, x1, y1 en pixels de l'image), la caméra 3D voit exactement ce morceau */
const IMW = PEINT ? PJ.image[0] : 1, IMH = PEINT ? PJ.image[1] : 1;
const fen = { x0: 0, y0: 0, x1: IMW, y1: IMH, bouge: 0 };
function cadrerNuit() {
  const n = cam.near, f = PJ.f;
  cam.projectionMatrix.makePerspective((fen.x0 - PJ.cx) / f * n, (fen.x1 - PJ.cx) / f * n, (PJ.cy - fen.y0) / f * n, (PJ.cy - fen.y1) / f * n, n, cam.far);
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
}
/* un point de la peinture (pixels) -> le sol du jeu, à la hauteur z (le calcul de outils/salle-nuit/camera.py) */
function solImg(u, v, z) {
  const s = Math.sin(PHI), c = Math.cos(PHI), Zr = (z || 0) - PJ.camH, k = PJ.cy - v;
  const D = Zr * (PJ.f * c + k * s) / (k * c - PJ.f * s), zc = D * c - Zr * s;
  return { x: (u - PJ.cx) * zc / PJ.f + PJ.xoff, y: PJ.dmax - D };
}
function imgDe(x, y, z) {   // un point du jeu -> la peinture (pixels)
  const s = Math.sin(PHI), c = Math.cos(PHI), X = x - PJ.xoff, D = PJ.dmax - y, Zr = (z || 0) - PJ.camH, zc = D * c - Zr * s, yu = D * s + Zr * c;
  return { u: PJ.cx + PJ.f * X / zc, v: PJ.cy - PJ.f * yu / zc };
}
/* le monde du jeu : x à droite, y vers nous, z en haut ; étiré en hauteur comme la salle de Blender */
const monde = new THREE.Group(); monde.scale.set(1, 1, ZS); scene.add(monde);
const G = (x, y, z) => new THREE.Vector3(x, -y, z || 0);
const px = x => OX + x * T, py = (y, z) => OY + y * T * K - (z || 0) * T;

/* ---------- le fond : l'image et sa profondeur (une seule fois, en très grand) ---------- */
const chargeur = new THREE.TextureLoader();
const tex = (f, nom, srgb) => chargeur.load(f, t => { t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true; pret(nom); });
let fondMat, fondNuit = null, crevTex = null, crevA = null;
if (!PEINT) {
  const fond = chargeur.load('fond.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; pret('fond'); });
  const prof = chargeur.load('prof.png', t => { t.colorSpace = THREE.NoColorSpace; t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; pret('prof'); });
  fondMat = new THREE.ShaderMaterial({
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
} else if (PIST) {
  /* la salle du Pisteur : la peinture de Romain, de nuit (les cristaux l'éclairent). Elle écrit aussi la profondeur des objets
     (prof.png : piliers, pans de mur, murets, tonneaux, caisses…) : le Pisteur passe vraiment derrière eux.
     Les deux portes : elles s'allument en rouge (2 s, les renforts arrivent), puis s'ouvrent sur le noir du couloir. */
  fondNuit = tex('pisteur/fond.jpg', 'fond', true);
  const prof = chargeur.load('pisteur/prof.png', t => { t.colorSpace = THREE.NoColorSpace; t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; pret('prof'); });
  const portes = tex('pisteur/portes.png', 'portes', false);
  const anim = tex('pisteur/anim.png', 'anim', false);
  const P0 = SJ.portes[0], P1 = SJ.portes[1];
  const CRv = [], CRc = [], FLv = [];
  for (let i = 0; i < 6; i++) { const C = SJ.cristaux[i]; CRv.push(new THREE.Vector4(C.u, C.v, C.r, i * 1.7)); CRc.push(new THREE.Color(C.coul)); }
  for (let i = 0; i < 4; i++) { const L = SJ.flammes[i]; FLv.push(new THREE.Vector4(L.u, L.v, L.r, i * 2.3)); }

  fondMat = new THREE.ShaderMaterial({
    uniforms: { fond: { value: fondNuit }, prof: { value: prof }, portes: { value: portes }, fen: { value: new THREE.Vector4(0, 0, IMW, IMH) }, img: { value: new THREE.Vector2(IMW, IMH) },
      prect: { value: new THREE.Vector4(SJ.portesRect[0], SJ.portesRect[1], SJ.portesRect[2] - SJ.portesRect[0], SJ.portesRect[3] - SJ.portesRect[1]) },
      pc: { value: new THREE.Vector4(P0.u, P0.v, P1.u, P1.v) }, etat: { value: new THREE.Vector4(0, 0, 0, 0) }, temps: { value: 0 },
      dp: { value: new THREE.Vector4(SJ.prof.d0, SJ.prof.d1, cam.near, cam.far) }, sc: { value: new THREE.Vector4(SJ.camH, SJ.f, SJ.cy, 0.0) },
      anim: { value: anim }, cr: { value: CRv }, crc: { value: CRc }, fl: { value: FLv } },
    vertexShader: 'varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D fond; uniform sampler2D prof; uniform sampler2D portes; uniform vec4 fen; uniform vec2 img; uniform vec4 prect; uniform vec4 pc; uniform vec4 etat; uniform float temps; uniform vec4 dp; uniform vec4 sc; uniform sampler2D anim; uniform vec4 cr[6]; uniform vec3 crc[6]; uniform vec4 fl[4]; varying vec2 vU;
      void main(){
        vec2 p = vec2(mix(fen.x, fen.z, vU.x), mix(fen.w, fen.y, vU.y));   // (en pixels de la peinture, y vers le bas)
        vec2 uv = clamp(p / img, vec2(0.0005), vec2(0.9995));
        vec3 c = texture2D(fond, vec2(uv.x, 1.0 - uv.y)).rgb;
        vec4 an = texture2D(anim, vec2(uv.x, 1.0 - uv.y));
        // les cristaux des colonnes et des fontaines : une lueur de leur couleur qui respire doucement
        for (int i = 0; i < 6; i++) {
          vec2 d = (p - cr[i].xy) / cr[i].z; float g = exp(-dot(d, d) * 1.2);
          c += crc[i] * g * (0.07 + 0.07 * sin(temps * 1.5 + cr[i].w));
        }
        // les braseros : une lueur orange qui vacille autour de chaque flamme
        for (int i = 0; i < 4; i++) {
          float n = 0.5 + 0.3 * sin(temps * 11.0 + fl[i].w) + 0.2 * sin(temps * 6.7 + fl[i].w * 2.1);
          vec2 d = (p - fl[i].xy) / (fl[i].z * vec2(2.6, 3.0)); float g = exp(-dot(d, d));
          c += vec3(1.0, 0.5, 0.16) * g * (0.05 + 0.10 * n);
        }
        // l'eau des fontaines, calme : de petits reflets qui glissent, une lueur bleutée qui respire
        if (an.g > 0.01) {
          float o = sin(p.x * 0.09 + temps * 1.1 + sin(p.y * 0.23 - temps * 0.7) * 2.2) * sin(p.y * 0.19 - temps * 0.9 + p.x * 0.04);
          c += an.g * (vec3(0.6, 0.92, 1.0) * smoothstep(0.72, 1.0, o) * 0.12 + vec3(0.12, 0.42, 0.62) * (0.05 + 0.04 * sin(temps * 0.8)));
        }
        for (int i = 0; i < 2; i++) {
          vec2 cp = i == 0 ? pc.xy : pc.zw; float ouv = i == 0 ? etat.x : etat.y, al = i == 0 ? etat.z : etat.w;
          if (al > 0.0) {   // l'alerte : la porte et son cristal s'allument en rouge
            vec2 d = (p - (cp - vec2(0.0, 163.0))) / vec2(180.0, 248.0); float g = exp(-dot(d, d) * 1.6);
            vec2 dc = (p - (cp - vec2(0.0, 353.0))) / 29.0; float k = exp(-dot(dc, dc));
            float bat = 0.75 + 0.25 * sin(temps * 9.0);
            c += vec3(0.95, 0.10, 0.05) * al * bat * (0.45 * g * (1.0 - 0.8 * ouv) + 1.4 * k);
          }
          vec2 q = (p - prect.xy) / prect.zw;
          if (ouv > 0.0 && q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0 && abs(p.x - cp.x) < 137.0) {   // ouverte : le noir du couloir, une lueur rouge au fond
            float m = texture2D(portes, vec2(q.x, 1.0 - q.y)).r;
            vec2 fr = (p - vec2(cp.x, cp.y - 128.0)) / vec2(47.0, 77.0); float fondR = exp(-dot(fr, fr));   // (tout au fond du couloir)
            float sol = smoothstep(cp.y - 51.0, cp.y, p.y);                                                     // (le seuil, un peu éclairé)
            vec3 couloir = vec3(0.006, 0.005, 0.014) + vec3(0.30, 0.025, 0.012) * fondR * (0.35 + 0.65 * al) + c * 0.18 * sol;
            c = mix(c, couloir, m * ouv);
          }
        }
        float hors = smoothstep(img.y - 80.0, img.y + 4.0, p.y) + smoothstep(-6.0, -150.0, p.x) + smoothstep(img.x + 6.0, img.x + 150.0, p.x) + smoothstep(6.0, -150.0, p.y);   // (au bord de la peinture : la nuit)
        c *= 1.0 - clamp(hors, 0.0, 1.0);
        vec4 pr = texture2D(prof, vec2(uv.x, 1.0 - uv.y));
        float v = floor(pr.r * 255.0 + 0.5) * 256.0 + floor(pr.g * 255.0 + 0.5);
        // la profondeur : celle de l'objet peint (un peu reculée : son ombre peut s'y poser), celle du sol vu (calculée), sinon le loin (les murs)
        float D = -1.0;
        if (v > 0.5) D = dp.x + (v - 1.0) / 65534.0 * (dp.y - dp.x) + sc.w;
        else if (pr.b > 0.5 && p.y > sc.z + 1.0) D = sc.x * sc.y / (p.y - sc.z) + 0.25;
        gl_FragDepth = D < 0.0 ? 1.0 : dp.w * (D - dp.z) / (D * (dp.w - dp.z));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true, toneMapped: false   // (sans test, WebGL n'écrit pas la profondeur)
  });
} else {
  /* la nuit : la peinture de Romain (les lanternes allumées, le Barde peint effacé), et ses crevasses qui s'ouvrent une fois pour toutes */
  fondNuit = tex('nuit/fond.jpg', 'fond', true); crevTex = tex('nuit/crev.jpg', 'crev', true); crevA = tex('nuit/crev-a.png', 'crevA', false);
  const feuTex = tex('nuit/feu.jpg', 'feu', true);
  var coupTex = tex('nuit/coup-d.jpg', 'coupImgD', false), coupTexG = tex('nuit/coup-g.jpg', 'coupImgG', false);   // (brutes, comme les vidéos : on les compare à leur première image)
  // (la première image de chaque vidéo, recalée et corrigée comme elle : le jeu ne montre de la vidéo que ce qui en diffère ; ailleurs, la peinture)
  var jourTex = tex('nuit/jour.jpg', 'jour', true);   // (la place de jour peinte par Romain, calée au pixel sur la nuit : là où tombe la lumière de son gant, ses vraies couleurs éclairées)
  var refD = tex('nuit/coup-d-ref.jpg', 'refD', false), refG = tex('nuit/coup-g-ref.jpg', 'refG', false), refV = tex('nuit/vague-ref.jpg', 'refV', false);   // (l'image de l'explosion de la vidéo du coup : si sa vidéo ne défile pas)   // (la dernière image de sa vidéo, la place en lave : si la vidéo ne défile pas)
  const arrTex = tex('nuit/arrivee.png', 'arrivee', false); arrTex.minFilter = arrTex.magFilter = THREE.NearestFilter; arrTex.generateMipmaps = false;   // (quand le feu de la vidéo arrive à chaque endroit)
  fondMat = new THREE.ShaderMaterial({
    uniforms: { fond: { value: fondNuit }, crev: { value: crevTex }, crevA: { value: crevA }, fen: { value: new THREE.Vector4(0, 0, IMW, IMH) },
      img: { value: new THREE.Vector2(IMW, IMH) }, rc: { value: new THREE.Vector4(...NJ.crev) }, ouvre: { value: 0 }, lueur: { value: 0 },
      feu: { value: feuTex }, arr: { value: arrTex }, vid: { value: feuTex }, camA: { value: new THREE.Vector4(NJ.f, NJ.cx, NJ.cy, NJ.phi) }, camB: { value: new THREE.Vector3(NJ.camH, NJ.xoff, NJ.dmax) },
      vague: { value: 0 }, tw: { value: 0 }, secours: { value: 0 }, src: { value: new THREE.Vector2(ARM.x, ARM.y) }, temps: { value: 0 }, cri: { value: [0, 1, 2, 3, 4, 5].map(() => new THREE.Vector4()) },
      vidC: { value: feuTex }, coup: { value: 0 }, coupSec: { value: 0 }, coupImg: { value: coupTex }, refC: { value: refD }, refV: { value: refV }, coupO: { value: new THREE.Vector2(2190, 640) }, coupR: { value: 0 }, jour: { value: jourTex }, jourO: { value: new THREE.Vector2(2190, 500) }, jourR: { value: 600 }, jourA: { value: 0 }, jourT: { value: new THREE.Color(1, 0.85, 0.6) } },
    vertexShader: 'varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D fond; uniform sampler2D crev; uniform sampler2D crevA; uniform vec4 fen; uniform vec2 img; uniform vec4 rc; uniform float ouvre; uniform float lueur; varying vec2 vU;
      uniform sampler2D feu; uniform sampler2D arr; uniform sampler2D vid; uniform vec4 camA; uniform vec3 camB; uniform float vague; uniform float tw; uniform float secours; uniform vec2 src; uniform float temps; uniform vec4 cri[6];
      uniform sampler2D vidC; uniform float coup; uniform float coupSec; uniform sampler2D coupImg; uniform sampler2D refC; uniform sampler2D refV; uniform vec2 coupO; uniform float coupR; uniform sampler2D jour; uniform vec2 jourO; uniform float jourR; uniform float jourA; uniform vec3 jourT;
      float change(vec3 a, vec3 b) { vec3 d = abs(a - b); return smoothstep(0.035, 0.11, max(d.r, max(d.g, d.b))); }   // (là où la vidéo diffère de sa première image)
      float bruit(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(bruit(i), bruit(i + vec2(1.0, 0.0)), f.x), mix(bruit(i + vec2(0.0, 1.0)), bruit(i + vec2(1.0, 1.0)), f.x), f.y); }
      vec3 lin(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
      void main(){
        vec2 p = vec2(mix(fen.x, fen.z, vU.x), mix(fen.w, fen.y, vU.y));   // (en pixels de la peinture, y vers le bas)
        vec2 uv = clamp(p / img, vec2(0.0005), vec2(0.9995));
        vec3 c = texture2D(fond, vec2(uv.x, 1.0 - uv.y)).rgb;
        vec2 q = (p - rc.xy) / rc.zw;
        if (ouvre > 0.0 && q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
          float a = texture2D(crevA, vec2(q.x, 1.0 - q.y)).r;
          float front = ouvre * 1.35 - 0.12 * bruit(floor(p / 24.0));   // (elles partent du haut des marches et filent vers nous)
          a *= smoothstep(q.y, q.y + 0.12, front);
          vec3 k = texture2D(crev, vec2(q.x, 1.0 - q.y)).rgb;
          k += k * lueur * smoothstep(0.35, 0.9, max(k.b, k.r) - k.g) * 1.2;   // (le violet et le bleu-vert du fond qui pulsent)
          c = mix(c, k, a);
        }
        if (vague > 0.0) {   // la vague de feu : la vidéo de Romain (recalée au pixel sur sa peinture, lignes 250 à 1870) ; derrière chaque cristal, l'abri
          vec3 f = c; float m = vague;
          if (secours < 0.5) {
            if (p.y > 250.0 && p.y < 1870.0) {
              vec2 uvV = vec2(uv.x, 1.0 - (p.y - 250.0) / 1620.0); vec3 brute = texture2D(vid, uvV).rgb;
              f = lin(brute); m *= change(brute, texture2D(refV, uvV).rgb);   // (seulement ce que la vague change : ailleurs, la peinture)
              if (tw > 5.0) f *= 1.0 + 0.12 * sin(temps * 7.0 + p.x * 0.013 + p.y * 0.021) * smoothstep(0.05, 0.4, max(f.r, f.g));   // (la dernière image : la lave vit encore)
            } else m = 0.0;
          } else {   // (la vidéo ne défile pas : la place en feu peinte par Romain, là où le feu de la vidéo serait déjà arrivé)
            float a = texture2D(arr, vec2(uv.x, 1.0 - uv.y)).r * 255.0;
            float brule = a < 254.0 ? smoothstep(a / 24.0, a / 24.0 + 0.4, tw) : 0.0;
            vec3 lv = texture2D(feu, vec2(uv.x, 1.0 - uv.y)).rgb;
            lv *= 1.0 + 0.12 * sin(temps * 7.0 + p.x * 0.013 + p.y * 0.021) * smoothstep(0.05, 0.4, max(lv.r, lv.g));
            f = lv; m *= brule;
          }
          // l'abri (Romain, 28 nov., après-midi) : une goutte couchée derrière chaque cristal, vu de Grosbec — large contre le cristal, elle
          // s'affine en s'éloignant ; son bord est une flamme vivante (il bouge, il luit) ; il n'apparaît que là où le feu est déjà passé
          float abri = 0.0, bord = 0.0;
          float s = sin(camA.w), co = cos(camA.w), Zr = -camB.x, kk = camA.z - p.y, den = kk * co - camA.x * s;
          float D = Zr * (camA.x * co + kk * s) / den;
          if (den < 0.0 && D > 0.0 && m > 0.002) {
            float zc = D * co - Zr * s; vec2 g = vec2((p.x - camA.y) * zc / camA.x + camB.y, camB.z - D);
            float vit = 0.5 * vn(g * 2.3 + vec2(temps * 0.9, -temps * 1.7)) + 0.35 * vn(g * 5.1 - vec2(temps * 2.2, temps * 0.6)) + 0.15 * vn(g * 11.0 + temps * 3.1);
            for (int i = 0; i < 6; i++) { vec4 C = cri[i]; if (C.w > 0.001) {
              vec2 u = normalize(C.xy - src), v = g - C.xy;
              float al = dot(v, u) - 0.15, pe = abs(v.x * u.y - v.y * u.x), Rh = C.z, Lt = 4.6;
              float d = al < 0.0 ? length(vec2(al, pe)) - Rh : max(pe - Rh * pow(max(0.0, 1.0 - al / Lt), 0.85), al - Lt);
              d += (vit - 0.5) * 0.34;
              abri = max(abri, (1.0 - smoothstep(-0.05, 0.05, d)) * C.w);
              bord = max(bord, exp(-abs(d + 0.03) * 10.0) * C.w);
            } }
          }
          c = mix(c, f, m * (1.0 - abri));
          c += c * vec3(0.7, 0.28, 0.08) * m * abri * 0.7;   // (le sol de l'abri, éclairé par le feu tout autour)
          float fl = 0.72 + 0.28 * sin(temps * 13.0 + p.x * 0.031) * sin(temps * 7.3 - p.y * 0.027);
          c += vec3(1.0, 0.42, 0.1) * bord * m * fl * 1.1;   // (la flamme du bord)
        }
        if (coup > 0.0) {   // le coup de poing de Grosbec : la vidéo de Romain (la zone dorée, puis la lumière qui jaillit du sol), recalée, la place entière
          // (calée au pixel ; seulement là où elle change, et à partir de son poing : l'effet gagne la place en 0,7 s)
          vec2 uvC = vec2(uv.x, 1.0 - uv.y); vec3 brute = coupSec > 0.5 ? texture2D(coupImg, uvC).rgb : texture2D(vidC, uvC).rgb;
          float gagne = 1.0 - smoothstep(coupR - 320.0, coupR, length(p - coupO));
          c = mix(c, lin(brute), coup * change(brute, texture2D(refC, uvC).rgb) * gagne);
        }
        if (jourA > 0.001) {   // la lumière de son gant : la place de jour de Romain apparaît là où elle tombe, teintée de la couleur de la zone
          float dj = length(p - jourO) / jourR, fj = jourA * (1.0 - smoothstep(0.0, 1.0, dj)) * (1.0 - smoothstep(0.0, 1.0, dj));
          vec3 cj = texture2D(jour, vec2(uv.x, 1.0 - uv.y)).rgb * mix(vec3(1.0), jourT, 0.55);
          c = mix(c, max(c, cj), fj);
        }
        float hors = smoothstep(img.y - 110.0, img.y + 4.0, p.y) + smoothstep(-6.0, -150.0, p.x) + smoothstep(img.x + 6.0, img.x + 150.0, p.x);   // (au bord de la peinture : la nuit)
        c *= 1.0 - clamp(hors, 0.0, 1.0);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false, toneMapped: false
  });
}
const fondQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fondMat); fondQuad.frustumCulled = false; fondQuad.renderOrder = -10;
scene.add(fondQuad);
/* salle du Pisteur : les flammes des braseros, redessinées PAR-DESSUS le Pisteur en transparence (quand il passe derrière
   un feu, on voit sa tête à travers les flammes ; la pierre, elle, le cache). Elles vacillent. */
if (PIST && PEINT) {
  const flMat = new THREE.ShaderMaterial({
    uniforms: { fond: fondMat.uniforms.fond, anim: fondMat.uniforms.anim, fen: fondMat.uniforms.fen, img: fondMat.uniforms.img, temps: fondMat.uniforms.temps, fl: fondMat.uniforms.fl },
    vertexShader: 'varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D fond; uniform sampler2D anim; uniform vec4 fen; uniform vec2 img; uniform float temps; uniform vec4 fl[4]; varying vec2 vU;
      void main(){
        vec2 p = vec2(mix(fen.x, fen.z, vU.x), mix(fen.w, fen.y, vU.y)); vec2 uv = clamp(p / img, vec2(0.0005), vec2(0.9995));
        float a = texture2D(anim, vec2(uv.x, 1.0 - uv.y)).r; if (a < 0.02) discard;
        float n = 0.5;
        for (int i = 0; i < 4; i++) { if (distance(p, fl[i].xy) < fl[i].z * 2.0) n = 0.5 + 0.3 * sin(temps * 11.0 + fl[i].w + p.y * 0.08) + 0.2 * sin(temps * 6.7 + fl[i].w * 2.1); }
        vec3 c = texture2D(fond, vec2(uv.x, 1.0 - uv.y)).rgb * (0.88 + 0.22 * n) + vec3(0.06, 0.02, 0.0) * n;
        gl_FragColor = vec4(c, a * 0.78);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false
  });
  const flQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), flMat); flQuad.frustumCulled = false; flQuad.renderOrder = 1000; scene.add(flQuad);
}

/* ---------- les lumières : les mêmes que dans Blender (decor3d/salle.py, REG) ; la nuit : celles de la peinture ---------- */
const lumieres = [];
function lampe(coul, x, y, z, I, dist) { const l = new THREE.PointLight(coul, I, dist, 1.6); l.position.copy(G(x, y, z)); monde.add(l); lumieres.push(l); return l; }
let brasiers = [], lueurArmure = null;
const solOmbre = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.5 }));   // l'ombre du héros sur le sol : un sol invisible qui ne montre que les ombres
solOmbre.receiveShadow = true; monde.add(solOmbre);
const nuit = { lanternes: [], cristaux: [], fissures: [], porte: null };
const salle = { lum: [], ombres: [], portes: [], recepteurs: [] };   // (la salle du Pisteur : ses lumières, celles qui font des ombres, les portes)
if (!PEINT) {
  scene.add(new THREE.HemisphereLight(0x9aaee0, 0x5a3e2c, 1.1));
  { const pm = new THREE.PMREMGenerator(rendu); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35; }
  brasiers = BRAS.map(b => lampe(0xff8a3a, b[0], b[1] + 0.3, b[2] + 0.5, 40, 10));
  lampe(0xffc060, LANT.or[0] + 0.5, LANT.or[1] + 0.35, 2.0, 30, 8);
  lampe(0xff3a24, LANT.rouge[0] - 0.5, LANT.rouge[1] + 0.35, 2.0, 30, 8);
  lueurArmure = lampe(0xffa860, ARM.x, ARM.y + 1.2, 2.8, 45, 11);
  const fente = new THREE.SpotLight(0x8fb0ff, 60, 30, 0.42, 0.6, 1.2);
  fente.position.copy(G(7.0, 3.0, 16)); fente.target.position.copy(G(8.4, 6.6, 0)); monde.add(fente, fente.target);
  fente.castShadow = true; fente.shadow.mapSize.set(1024, 1024); fente.shadow.camera.near = 5; fente.shadow.camera.far = 30; fente.shadow.bias = -0.0005;
  const face = new THREE.DirectionalLight(0xd8dcff, 1.3); face.position.copy(G(9, 26, 9)); face.target.position.copy(G(9, 4, 1)); monde.add(face, face.target);
  solOmbre.geometry = new THREE.PlaneGeometry(30, 20); solOmbre.position.copy(G(9, 5, 0.002));
} else if (PIST) {
  /* la salle du Pisteur, de nuit : presque pas de lumière générale (un bleu-violet sombre) ; la lumière vient des cristaux.
     Chaque cristal des piliers : une lumière qui tombe d'en haut, de sa couleur (elle fait l'ombre du Pisteur sur le dalles quand il
     est près), et une plus douce à mi-hauteur. Les fontaines de cristal, les torches (orange, avec ombre), les appliques, les cristaux des murs. */
  scene.add(new THREE.HemisphereLight(0x5a66c0, 0x1c1430, 0.7));
  { const pm = new THREE.PMREMGenerator(rendu); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.14; }
  const face = new THREE.DirectionalLight(0x8c90ff, 0.35); face.position.copy(G(12.7, 40, 30)); face.target.position.copy(G(12.7, 8, 0)); monde.add(face, face.target);   // (un peu de lumière froide de face : on voit sa forme)
  for (const L of SJ.lumieres) {
    let l, pt = null;
    if (L.type === 'cristal') {
      l = new THREE.SpotLight(L.coul, 110, 17, 0.6, 0.6, 1.4); l.position.copy(G(L.x, L.y + 0.1, L.z)); l.target.position.copy(G(L.x, L.y + 0.1, 0));
      pt = new THREE.PointLight(L.coul, 26, 8, 1.6); pt.position.copy(G(L.x, L.y + 0.7, 2.6)); monde.add(pt);
    } else if (L.ombre) {   // les grandes torches du mur du bas : une lumière orange, qui fait aussi une ombre
      l = new THREE.SpotLight(L.coul, 60, 12, 0.6, 0.6, 1.5); l.position.copy(G(L.x, L.y - 0.3, L.z + 0.4)); l.target.position.copy(G(L.x, L.y - 2.5, 0));
    } else {
      const I = L.nom.startsWith('fontaine') ? 16 : L.nom.startsWith('mur') ? 18 : L.type === 'feu' ? 12 : 9;
      l = new THREE.PointLight(L.coul, I, L.dist, 1.6); l.position.copy(G(L.x, L.y, L.z));
    }
    monde.add(l); if (l.target) monde.add(l.target);
    if (l.isSpotLight) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.camera.near = 0.3; l.shadow.camera.far = 30; l.shadow.bias = -0.0006; l.shadow.normalBias = 0.02; l.shadow.radius = 3; salle.ombres.push({ l, x: L.x, y: L.y, z: L.z }); }
    salle.lum.push({ l, pt, L, I: l.intensity, Ip: pt ? pt.intensity : 0 });
  }
  for (const P of SJ.portes) {   // la lueur rouge des portes quand les renforts arrivent (éteinte au départ)
    const l = new THREE.PointLight(0xff2a12, 0, 9, 1.4); l.position.copy(G(P.x, P.y + 0.9, 1.6)); monde.add(l);
    salle.portes.push({ P, l, t: -1 });
  }
  solOmbre.visible = false;
  /* ce qui reçoit l'ombre du Pisteur : la salle en formes simples, posées exactement sur la peinture (rien ne s'en voit, que
     l'ombre) : le sol (son tour exact), les murs (des pans droits le long du tour du sol), chaque objet (sa forme au sol,
     montée à sa hauteur), le mur du bas. Elles n'écrivent pas la profondeur : elles ne cachent jamais le Pisteur. */
  const ombreMat = new THREE.ShadowMaterial({ opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
  const forme = pts => { const f = new THREE.Shape(); pts.forEach(([x, y], i) => i ? f.lineTo(x, -y) : f.moveTo(x, -y)); return f; };
  const recoit = (geo, z) => { const m = new THREE.Mesh(geo, ombreMat); m.position.z = z || 0; m.receiveShadow = true; monde.add(m); salle.recepteurs.push(m); return m; };
  const SA = SJ.salle, CN = SA.coins;
  recoit(new THREE.ShapeGeometry(forme([[SA.x0, SA.y0], [SA.x1, SA.y0], [SA.x1, CN.y1], [CN.d, CN.y1], [CN.d, SA.y1], [CN.g, SA.y1], [CN.g, CN.y1], [SA.x0, CN.y1]])), 0.002);
  const mursPos = [], pan = (a, b, hh) => mursPos.push(a[0], -a[1], 0, b[0], -b[1], 0, b[0], -b[1], hh, a[0], -a[1], 0, b[0], -b[1], hh, a[0], -a[1], hh);
  pan([SA.x0, SA.y0], [SA.x1, SA.y0], 3.5); pan([SA.x0, SA.y0], [SA.x0, CN.y1], 3); pan([SA.x1, SA.y0], [SA.x1, CN.y1], 3);   // (le fond et les deux côtés)
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(mursPos, 3)); mg.computeVertexNormals(); recoit(mg);
  const boite = ([x0, x1, y0, y1], hh, z0 = 0) => { const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, hh); g.translate((x0 + x1) / 2, -(y0 + y1) / 2, z0 + hh / 2); recoit(g); };
  for (const O of SJ.formes) {
    for (const b of O.boites) boite(b, O.h);
    if (O.rond) { const [x, y, r] = O.rond, g = new THREE.CylinderGeometry(r, r, O.h, 20); g.rotateX(Math.PI / 2); g.translate(x, -y, O.h / 2); recoit(g); }
  }
  for (const n in SJ.contreMur) boite(SJ.contreMur[n], 1.6);
  for (const [x0, x1] of SJ.murBas.x) boite([x0, x1, SJ.murBas.y0, SJ.murBas.y1], 1.0);
} else {
  /* la nuit : un ciel bleu sombre ; la lumière blanche de la porte du temple, dans le dos (elle dessine le bord du héros) ;
     les deux lanternes (chaudes, elles font les vraies ombres) ; les cristaux violets et bleu-vert des massifs */
  scene.add(new THREE.HemisphereLight(0x6c7cc0, 0x2a2436, 0.75));
  { const pm = new THREE.PMREMGenerator(rendu); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22; }
  const porte = new THREE.DirectionalLight(0xdfe8ff, 0.8); porte.position.copy(G(NJ.porte.x, NJ.porte.y, 5)); porte.target.position.copy(G(NJ.porte.x, 12, 0)); monde.add(porte, porte.target); nuit.porte = porte;
  for (const P of NJ.piliers) {
    const x = P.x + NJ.xoff, y = NJ.dmax - P.d;
    const l = new THREE.SpotLight(0xffb468, 70, 13, 1.42, 0.8, 1.5); l.position.copy(G(x, y + 0.05, P.lanterne)); l.target.position.copy(G(x, y + 0.05, 0)); monde.add(l, l.target);
    l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.camera.near = 0.5; l.shadow.camera.far = 30; l.shadow.bias = -0.0008; l.shadow.radius = 3;
    l.shadow.camera.layers.set(1);   // (son ombre ne dessine que le héros : l'armure est trop loin de sa lumière — des images plus légères)
    const pt = new THREE.PointLight(0xffb060, 18, 7, 1.6); pt.position.copy(G(x, y + 0.4, P.lanterne)); monde.add(pt);   // (pour éclairer aussi le dessus de la tête)
    nuit.lanternes.push({ l, pt, x, y, z: P.lanterne });
  }
  for (const [u, v, z, coul, I] of [[1000, 1045, 0.9, 0xa070ff, 14], [1400, 955, 0.8, 0xa070ff, 10], [3640, 1005, 0.9, 0x40e8d0, 14], [2960, 960, 0.8, 0x7a90ff, 8], [420, 1560, 0.7, 0x40e8d0, 16], [3950, 1450, 0.7, 0x40e8d0, 16], [260, 1740, 0.6, 0xa070ff, 14]]) {
    const p = solImg(u, v, z); nuit.cristaux.push(lampe(coul, p.x, p.y, z + 0.6, I, 7));
  }
  solOmbre.position.copy(G(NJ.xoff + 1, 10, 0.002));
  /* (Romain, 28 nov. : l'ombre des lanternes « est coupée à un moment donné ») : l'ombre file vers nous et tombait hors de la peinture,
     coupée net à son bord ; et loin d'une lanterne, la tête du héros sortait de son cône. Le cône est plus large, l'ombre s'efface en
     douceur vers le bord du cône et avant le bas de la place. */
  solOmbre.material.onBeforeCompile = sh => {
    const vieux = 'shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;';
    const neuf = '{ vec2 qo = vSpotLightCoord[ i ].xy / vSpotLightCoord[ i ].w - 0.5; float fo = 1.0 - smoothstep( 0.16, 0.42, length( qo ) ); shadow *= receiveShadow ? mix( 1.0, getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ), fo ) : 1.0; }';
    sh.fragmentShader = sh.fragmentShader.replace('#include <shadowmask_pars_fragment>', THREE.ShaderChunk.shadowmask_pars_fragment.replace(vieux, neuf));
    // (et surtout : la peinture s'arrête au bord de la place, au bas de l'écran ; l'ombre y était tranchée net : elle s'efface avant)
    sh.vertexShader = sh.vertexShader.replace('void main() {', 'varying float vYJeu;\nvoid main() {').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n  vYJeu = -( modelMatrix * vec4( transformed, 1.0 ) ).y;');
    sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'varying float vYJeu;\nvoid main() {').replace('gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );', 'gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) * ( 1.0 - smoothstep( 18.2, 19.6, vYJeu ) ) );');
  };
}

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
if (!PEINT) for (const b of BRAS) {
  const gr = new THREE.Group(); gr.position.copy(G(b[0], b[1], b[2] + 0.02)); monde.add(gr);
  const halo = sprite(T_LUEUR.feu, 1.6, true); halo.position.z = 0.25; halo.material.opacity = 0.55; halo.material.depthTest = false; gr.add(halo);
  for (let i = 0; i < 3; i++) { const f = sprite(texFlamme, 0.45, true); f.center.set(0.5, 0.05); f.material.depthTest = false; gr.add(f); flammes.push({ f, i, b }); }
}
if (!PEINT) for (const n of ['or', 'rouge']) { const s = sprite(T_LUEUR[n], 1.4, true); s.position.copy(G(LANT[n][0], LANT[n][1], 1.95)); s.material.opacity = 0.7; s.material.depthTest = false; monde.add(s); }

/* la nuit : les deux lanternes de la place sont aussi de vrais obstacles en volume : le héros passe derrière.
   Une plaque debout à leur place (invisible) ; elle montre exactement les pixels de la peinture là où la lanterne est dessinée
   (son contour découpé : pilier-g.png, pilier-d.png), et cache ce qui est derrière. */
const piliers = [];
if (NUIT) for (const P of NJ.piliers) {
  const x = P.x + NJ.xoff, y = NJ.dmax - P.d, larg = (P.droite - P.gauche) + 1.4, haut = P.haut + 0.6;
  const masque = tex('nuit/pilier-' + P.nom + '.png', 'pilier-' + P.nom, false);
  const m = new THREE.ShaderMaterial({
    uniforms: { fond: { value: fondNuit }, masque: { value: masque }, fen: fondMat.uniforms.fen, img: fondMat.uniforms.img, ecran: { value: new THREE.Vector2(1, 1) }, rect: { value: new THREE.Vector4(...P.rect) } },
    vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D fond; uniform sampler2D masque; uniform vec4 fen; uniform vec2 img; uniform vec2 ecran; uniform vec4 rect;
      void main(){
        vec2 e = gl_FragCoord.xy / ecran, p = vec2(mix(fen.x, fen.z, e.x), mix(fen.w, fen.y, e.y)), q = (p - rect.xy) / rect.zw;
        if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) discard;
        float a = texture2D(masque, vec2(q.x, 1.0 - q.y)).r;
        if (a < 0.08) discard;
        gl_FragColor = vec4(texture2D(fond, vec2(p.x / img.x, 1.0 - p.y / img.y)).rgb, smoothstep(0.08, 0.6, a));
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: true, toneMapped: false, side: THREE.DoubleSide
  });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(larg, haut), m); q.frustumCulled = false;
  q.position.copy(G(x, y, haut / 2)); q.up.set(0, 0, 1); q.lookAt(new THREE.Vector3(cam.position.x, cam.position.y, haut / 2)); monde.add(q);   // (debout, tournée vers nous)
  const halo = sprite(T_LUEUR.or, 2.2, true); halo.position.copy(G(x, y + 0.1, P.lanterne)); halo.material.opacity = 0.18; halo.material.depthTest = false; monde.add(halo);   // (la flamme qui vit un peu)
  piliers.push({ q, m, x, y, r: 0.85, halo });
}

/* ---------- le Barde ---------- */
const incline = new THREE.Group(); monde.add(incline);   // (pour pencher tout le corps : le dérapage)
const barde = new THREE.Group(); incline.add(barde);
const corps = new THREE.Group(); corps.rotation.x = Math.PI / 2; barde.add(corps);   // (les modèles glTF ont la hauteur en y)
const ombrePied = sprite(toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), 1, false);
const ombreMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshBasicMaterial({ map: ombrePied.material.map, transparent: true, depthWrite: false, toneMapped: false }));
ombreMesh.position.z = 0.004; barde.add(ombreMesh);
const h = { x: PEINT ? PJ.depart.x : 9, y: PEINT ? PJ.depart.y : 7.6, a: -Math.PI / 2, sort: null, sortT: 0, sortD: 0, luth: 'dos', tl: 0, garde: 0 };
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
charger(PIST ? 'pisteur.json' : 'barde.json', g => {
  const m = g.scene; m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.layers.enable(1); o.receiveShadow = false; o.frustumCulled = false; if (o.material) { o.material.metalness = 0; o.material.envMapIntensity = 0.5; } } });
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
  const ws = poidsSaut(), wc = PIST ? poidsCoup() : 0, wp = poidsProj(), wx = Math.max(ws, wc, wp);
  if (actions.projete) { const a = actions.projete; if (!a.__lance) { a.play(); a.__lance = true;   // (projeté : le film suit son temps ; on garde sa hauteur, pas son glissement de côté)
      const k = a.getClip().tracks.find(k => k.name === 'Hips.position'); if (k && !k.__fixe) { k.__fixe = true; for (let i = 3; i < k.values.length; i += 3) { k.values[i] = k.values[0]; k.values[i + 2] = k.values[2]; } } }
    a.timeScale = 0; a.setEffectiveWeight(wp); a.time = h.proj ? Math.min(PROJ.debut + h.proj.t * PROJ.vitesse, a.getClip().duration - 1e-3) : 0; }
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
  if (PIST || h.sort || h.saut || h.proj) return;
  h.sort = q; h.sortT = 0; h.sortD = DUREE[q];
  if (h.luth === 'dos') { h.luth = 'sort'; h.tl = 0; }
  else if (h.luth === 'range') { const k = reglagesLuth().k; h.luth = 'sort'; h.tl = 0.25 + 0.4 * k; }
}
/* des lumières toujours là (éteintes) : en ajouter une en plein jeu ferait recalculer tous les dessins (un à-coup) */
const reserve = [];
for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffffff, 0, 7, 1.6); l.libre = true; monde.add(l); reserve.push(l); }   // (4 et pas 5 : chaque lumière, même éteinte, coûte à chaque point du héros et de l'armure)
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
    const s = tirs[i], S = SORTS[s.q]; s.t += dt; const dx = ARM.x - s.x, dy = ARM.y + ARM.dy - s.y, dd = Math.hypot(dx, dy), v = S.v * (NUIT ? 1.6 : 1);   // (la nuit, l'armure est plus loin : les notes vont plus vite)
    if (dd < 0.5) { rendreL(s.l); boum(s); monde.remove(s.gr); monde.remove(s.sol); scene.remove(s.ruban); s.ruban.geometry.dispose(); s.ruban.material.dispose(); tirs.splice(i, 1); continue; }
    s.x += dx / dd * v * dt; s.y += dy / dd * v * dt; s.z += (ARM.zc - s.z) * Math.min(1, dt * 2);
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
    n.sp.material.rotation = n.fixe ? 0 : n.tourne ? n.sp.material.rotation + n.tourne * dt : Math.sin(n.t * 9) * 0.3;
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
const MURETS = PIST && !PEINT ? [{ x: 5.4, y: 7.0, lx: 2.6, ly: 0.45 }, { x: 13.0, y: 6.4, lx: 0.45, ly: 2.6 }] : [];   // (dans la salle peinte, les murets sont dans la peinture : leurs cases)
/* l'escalier du mur du bas : le Pisteur descend jusqu'en bas du mur, une marche après l'autre */
function solZ(x, y) {
  if (!(PIST && PEINT)) return 0;
  const E = SJ.salle.escalier; if (x < E.x0 || x > E.x1 || y <= E.haut) return 0;
  const u = clamp((y - E.haut) / (E.bas - E.haut), 0, 1) * E.marches, k = Math.floor(u), f = u - k;
  return E.fond * (k + doux(clamp((f - 0.75) / 0.25, 0, 1))) / E.marches;   // (plat sur chaque marche, puis il descend la suivante)
}
const MANNEQUIN = PIST && PEINT ? { x: SJ.mannequin.x, y: SJ.mannequin.y, r: 0.35 } : { x: 9, y: 4.9, r: 0.35 };   // (sur le médaillon, au milieu de la salle)
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
function dansMuret(x, y, r) { r = r || 0.35; if (PIST && PEINT) return caseDe(GR.muret, x, y) === 1; for (const M of MURETS) if (Math.abs(x - M.x) < M.lx / 2 + r && Math.abs(y - M.y) < M.ly / 2 + r) return true; return false; }
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
function libreSaut(x, y) { return PEINT ? caseDe(GR.libre, x, y) === 1 && !(PIST && Math.hypot(x - MANNEQUIN.x, y - MANNEQUIN.y) < MANNEQUIN.r + 0.3) : libreSans(x, y); }   // (en l'air : on passe par-dessus les murets et les crevasses)
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
  if (h.saut || h.sautR > 0 || !actions.saut || h.proj) return;
  if (h.sort) annulerSort();
  const a = Math.hypot(mx || 0, my || 0) > 0.15 ? Math.atan2(my, mx) : h.a;
  h.saut = { t: 0, a, fait: 0, pose: false, dist: SAUT.dist }; h.a = a;
  if (NUIT && crev.ouvert) h.saut.dist = longueurSaut(a);
  h.sautR = SAUT.recharge; h.derap = null; incline.quaternion.identity();
  if (PIST) { annulerCoup(); poussiere(h.x, h.y, a + Math.PI); }
}
/* la nuit, avec les crevasses (Romain, à la voix, 27 novembre 23 h) : il ne retombe JAMAIS dans une crevasse.
   Assez près du bord : le saut s'allonge (jusqu'à 1,5 pas de plus) et il passe. Trop loin : le saut se raccourcit, il retombe
   au bord, de son côté (un saut raté ; tout contre le bord, il saute sur place). */
/* projeté par l'explosion du coup de poing (Jump_and_Slam_Back_Down, n° 382 : Romain le préfère au « BeHit_FlyUp ») : on prend le film
   à son décollage (0,40 s : sans l'élan, il est projeté malgré lui), on le soulève un peu plus que le film, il retombe lourdement */
const PROJ = { debut: 0.40, vitesse: 1.0, air: [0.05, 0.80], haut: 0.7 };
function projeter() {
  if (PIST || !actions.projete || h.proj) return;
  if (h.sort) annulerSort(); h.saut = null; h.derap = null; incline.quaternion.identity(); loco.v = 0;
  h.proj = { t: 0, pose: false }; toucher();
}
function poidsProj() { if (!h.proj || !actions.projete) return 0; const d = actions.projete.getClip().duration - PROJ.debut; return Math.min(doux(h.proj.t / 0.08), 1 - doux((h.proj.t - (d - 0.35)) / 0.35)); }
function avancerProj(dt) {
  const P = h.proj; P.t += dt; loco.v = 0; loco.allure = 'garde';
  const u = clamp((P.t - PROJ.air[0]) / (PROJ.air[1] - PROJ.air[0]), 0, 1); corps.position.z = PROJ.haut * Math.sin(Math.PI * u);
  if (!P.pose && u >= 1) { P.pose = true; poussiere(h.x, h.y, h.a); poussiere(h.x, h.y, h.a + Math.PI); fen.bouge = Math.max(fen.bouge, 0.35); }
  if (P.t >= actions.projete.getClip().duration - PROJ.debut) { h.proj = null; corps.position.z = 0; }
}
const SAUT_PLUS = 1.5, SAUT_HAUT = 0.75;
function longueurSaut(a) {
  const ok = D => libre(h.x + Math.cos(a) * D, h.y + Math.sin(a) * D);
  if (ok(SAUT.dist)) return SAUT.dist;
  for (let e = 0.1; e <= SAUT_PLUS + 1e-6; e += 0.1) if (ok(SAUT.dist + e)) return SAUT.dist + e + (ok(SAUT.dist + e + 0.2) ? 0.2 : 0);
  for (let D = SAUT.dist - 0.1; D > 0.05; D -= 0.1) if (ok(D)) return D;
  return 0;
}
function avancerSaut(dt) {
  const S = h.saut; S.t += dt; const tc = SAUT.depart + S.t * SAUT.vitesse;
  const p = clamp((tc - SAUT.air[0]) / (SAUT.air[1] - SAUT.air[0]), 0, 1);
  if (SAUT.murets && p > 0.7 && !S.allonge && dansMuret(h.x + Math.cos(S.a) * (S.dist - S.fait), h.y + Math.sin(S.a) * (S.dist - S.fait))) { S.dist += 1.2; S.allonge = true; }   // (il retomberait sur un muret : il saute un peu plus loin, par-dessus)
  if (PIST && PEINT) corps.position.z = SAUT_HAUT * Math.sin(Math.PI * p);   // (le film le fait sauter sur place ; on le monte en plus)
  const voulu = S.dist * p;
  while (S.fait < voulu - 1e-6 && !S.bloque) {   // par petits bouts, pour s'arrêter au bord d'un obstacle
    const pas = Math.min(0.05, voulu - S.fait), nx = h.x + Math.cos(S.a) * pas, ny = h.y + Math.sin(S.a) * pas;
    if (SAUT.murets || NUIT ? libreSaut(nx, ny) : libre(nx, ny)) { h.x = nx; h.y = ny; S.fait += pas; } else S.bloque = true;
  }
  if (!S.pose && tc >= SAUT.air[1]) {   // les pieds touchent le sol : il repart aussitôt (le pouce poussé : il court ; lâché : un petit pas d'élan, puis il s'arrête)
    S.pose = true; atterrir(); if (PEINT && !libre(h.x, h.y)) horsDuTrou();
    loco.v = Math.max(loco.v, SAUT.elan); loco.allure = 'course'; loco.course = 1; loco.marche = 0; loco.garde = 0;
  }
  if (tc >= SAUT.fin) { h.saut = null; if (PIST && PEINT) corps.position.z = 0; }
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
    if (PEINT) sp.material.color.setHex(0x8f8696);   // (la nuit : une poussière grise, pas des boules blanches)
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
if ($('bFissure')) $('bFissure').addEventListener('click', e => { e.preventDefault(); fissurer(); });
if (NUIT) addEventListener('keydown', e => { if (e.key === 'f' || e.key === 'F') fissurer(); if (e.key === 'v' || e.key === 'V') lancerVague(); });
if ($('bVague')) $('bVague').addEventListener('click', e => { e.preventDefault(); lancerVague(); });
if ($('bCoup')) $('bCoup').addEventListener('click', e => { e.preventDefault(); coupDePoing(); });
$('pSaut').addEventListener('pointerdown', e => { e.preventDefault(); sauter(h.mx, h.my); });
$('pDague').addEventListener('pointerdown', e => { e.preventDefault(); frapper('dague'); });
$('pAssomme').addEventListener('pointerdown', e => { e.preventDefault(); frapper('assomme'); });
$('pOmbre').addEventListener('pointerdown', e => { e.preventDefault(); basculerOmbre(); });
if (PIST) addEventListener('keydown', e => { if (e.key === 'j' || e.key === 'J') frapper('dague'); if (e.key === 'k' || e.key === 'K') frapper('assomme'); if (e.key === 'l' || e.key === 'L') basculerOmbre(); });

/* ---------- où on peut marcher (comme les règles du jeu) ---------- */
function libre(x, y) { if (NUIT) return caseDe(GR.libre, x, y) === 1 && !dansCrevasse(x, y, 0.25) && !contreCristal(x, y);
  if (PIST && PEINT) return caseDe(GR.libre, x, y) === 1 && caseDe(GR.muret, x, y) === 0 && Math.hypot(x - MANNEQUIN.x, y - MANNEQUIN.y) >= MANNEQUIN.r + 0.3;   // (les murets et le mannequin bloquent la marche, pas le saut)
  return libreSans(x, y) && !dansMuret(x, y) && !(PIST && Math.hypot(x - MANNEQUIN.x, y - MANNEQUIN.y) < MANNEQUIN.r + 0.3); }   // (les murets et le mannequin bloquent la marche, pas le saut)
function libreSans(x, y) {
  const r = 0.35, c = L.coin + r * Math.SQRT2;
  if (x < r || x > L.L - r || y < r || y > L.P - r || x + y < c || L.L - x + y < c) return false;
  if (Math.hypot(x - ARM.x, y - ARM.y) < ARM.r + r) return false;
  for (const l of Object.values(LANT)) if (Math.hypot(x - l[0], y - l[1]) < 0.55 + r) return false;
  return true;
}

/* ---------- la nuit : les cases du sol (0,2 pas), les crevasses, la caméra qui suit ---------- */
const GR = PEINT ? (() => { const g = PJ.grille, dec = b => { const t = atob(b), u = new Uint8Array(g.nx * g.ny); for (let i = 0; i < u.length; i++) u[i] = (t.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1; return u; };
  return { pas: g.pas, nx: g.nx, ny: g.ny, x0: g.x0 || 0, libre: dec(g.libre), crev: g.crevasse ? dec(g.crevasse) : null, muret: g.muret ? dec(g.muret) : null }; })() : null;   // (x0 : la grille de la nuit commence à x = −3, pour passer à gauche de la lanterne gauche ; muret : la salle du Pisteur)
function caseDe(A, x, y) { const i = Math.floor((x - GR.x0) / GR.pas), j = Math.floor(y / GR.pas); return i >= 0 && j >= 0 && i < GR.nx && j < GR.ny ? A[j * GR.nx + i] : 0; }
const crev = { ouvert: false, t: -1, cases: [], lum: [] };
function dansCrevasse(x, y, r) {
  if (!crev.ouvert) return false; if (caseDe(GR.crev, x, y)) return true;
  if (r) for (const [a, b] of [[r, 0], [-r, 0], [0, r], [0, -r]]) if (caseDe(GR.crev, x + a, y + b)) return true;
  return false;
}
if (NUIT) {   // les cases des crevasses (pour la poussière quand elles s'ouvrent), et quatre lumières tout au fond (violet, bleu-vert)
  const rc = NJ.crev, groupes = [[], [], [], []];
  for (let j = 0; j < GR.ny; j++) for (let i = 0; i < GR.nx; i++) if (GR.crev[j * GR.nx + i]) {
    const x = GR.x0 + (i + 0.5) * GR.pas, y = (j + 0.5) * GR.pas, p = imgDe(x, y, 0);
    crev.cases.push({ x, y, q: (p.v - rc[1]) / rc[3] }); groupes[(x > NJ.xoff + 0.8 ? 2 : 0) + (y > 10 ? 1 : 0)].push({ x, y });
  }
  groupes.forEach((g, k) => { if (!g.length) return; const m = g[Math.floor(g.length / 2)]; const l = new THREE.PointLight(k % 2 ? 0x46e6d2 : 0xa064ff, 0, 3.5, 1.6); l.position.copy(G(m.x, m.y, -0.4)); monde.add(l); crev.lum.push(l); });
}
function fissurer() {   // (pour l'essai : un bouton ; dans le jeu, c'est Grosbec qui frappe le sol, une seule fois)
  if (!NUIT || crev.t >= 0) return; crev.t = 0; crev.ouvert = true;
  if (!libre(h.x, h.y)) horsDuTrou();
  const b = $('bFissure'); if (b) b.classList.add('fait');
}
function horsDuTrou() {   // il était sur la fente : il est poussé vers le bord le plus proche
  let best = null;
  for (let r = 0.2; r < 4 && !best; r += 0.2) for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283, x = h.x + Math.cos(a) * r, y = h.y + Math.sin(a) * r; if (libre(x, y)) { best = { x, y }; break; } }
  if (best) { h.pousse = { x: best.x, y: best.y }; poussiere(h.x, h.y, Math.atan2(best.y - h.y, best.x - h.x)); }
}
function avancerCrevasses(dt, t) {
  if (h.pousse) { const dx = h.pousse.x - h.x, dy = h.pousse.y - h.y, dd = Math.hypot(dx, dy), v = 7 * dt; if (dd <= v) { h.x = h.pousse.x; h.y = h.pousse.y; h.pousse = null; } else { h.x += dx / dd * v; h.y += dy / dd * v; } }
  if (crev.t < 0) return; crev.t += dt;
  const u = clamp(crev.t / 1.3, 0, 1), front = u * 1.35;
  fondMat.uniforms.ouvre.value = u; fondMat.uniforms.lueur.value = 0.3 + 0.3 * Math.sin(t * 2.3);
  if (crev.t < 1.8) fen.bouge = Math.max(fen.bouge, 1 - crev.t / 1.8);   // (le sol tremble)
  if (u < 1) { crev.pouss = (crev.pouss || 0) - dt; if (crev.pouss <= 0) { crev.pouss = 0.07; const c = crev.cases.filter(c => Math.abs(c.q - front + 0.06) < 0.05); for (let k = 0; k < 1 && c.length; k++) { const m = c[Math.floor(Math.random() * c.length)]; poussiere(m.x, m.y, Math.random() * 6.28); } } }
  crev.lum.forEach((l, k) => { l.intensity = u * (6 + 2.5 * Math.sin(t * 2.3 + k * 1.7)); });
}
function cameraNuit(dt) {
  const A = innerWidth / innerHeight, pied = imgDe(h.x, h.y, 0);
  // le cadre : assez serré pour bien voir le héros, mais l'armure (sur le seuil du temple : sa crête à la ligne 320 de la peinture) reste toujours
  // à l'image : plus il descend vers nous, plus on recule un peu
  let Hw = Math.max(1150 / (window.__zoom || 1), (pied.v + 90 - 320) / 0.78), Ww = Hw * A;
  if (Ww > IMW * 1.06) { Ww = IMW * 1.06; Hw = Ww / A; }
  const y1 = Math.min(pied.v + 0.22 * Hw + 90, IMH + 0.12 * Hw), y0 = clamp(y1 - Hw, 0, 320);
  const x0 = Ww >= IMW ? (IMW - Ww) / 2 : clamp(pied.u - Ww / 2, 0, IMW - Ww);
  const k = cameraNuit.vu ? Math.min(1, dt * 4) : 1; cameraNuit.vu = 1;
  fen.cx = (fen.cx === undefined ? x0 : fen.cx + (x0 - fen.cx) * k); fen.cy = (fen.cy === undefined ? y0 : fen.cy + (y0 - fen.cy) * k); fen.H = (fen.H === undefined ? Hw : fen.H + (Hw - fen.H) * k);
  if (fen.bouge > 0) fen.bouge = Math.max(0, fen.bouge - dt * 1.4);
  // (la secousse : une vraie secousse de caméra, souple, qui s'amortit — plus un saut au hasard à chaque image, qui faisait grésiller l'écran ;
  //  un tiers moins forte (Romain, 28 nov. : « juste un peu moins fort ») ; peinture, vidéos et personnages bougent ensemble, puisque c'est la caméra)
  fen.tb = (fen.tb || 0) + dt; const amp = fen.bouge * fen.bouge, tb = fen.tb * 31;
  const W2 = fen.H * A, tx = amp ? 20 * amp * (Math.sin(tb) * 0.6 + Math.sin(tb * 1.73 + 1.3) * 0.4) : 0, ty = amp ? 14 * amp * (Math.sin(tb * 1.31 + 0.7) * 0.6 + Math.sin(tb * 2.11 + 2.1) * 0.4) : 0;
  fen.x0 = fen.cx + tx; fen.y0 = fen.cy + ty; fen.x1 = fen.x0 + W2; fen.y1 = fen.y0 + fen.H;
  cadrerNuit(); fondMat.uniforms.fen.value.set(fen.x0, fen.y0, fen.x1, fen.y1);
  rendu.getDrawingBufferSize(_ecran); for (const P of piliers) P.m.uniforms.ecran.value.copy(_ecran);
}
const _ecran = new THREE.Vector2();
/* ---------- la salle du Pisteur : la caméra qui le suit, les lumières qui vivent, les portes des renforts ---------- */
function cameraSalle(dt) {
  const A = innerWidth / innerHeight, pied = imgDe(h.x, h.y, 0);
  let Hw = 1250 / (window.__zoom || 1), Ww = Hw * A;
  if (Ww < 1500 / (window.__zoom || 1)) { Ww = 1500 / (window.__zoom || 1); Hw = Ww / A; }   // (un écran étroit : assez de largeur pour voir autour de lui)
  if (Ww > IMW) { Ww = IMW; Hw = Ww / A; }
  const x0 = Ww >= IMW ? (IMW - Ww) / 2 : clamp(pied.u - Ww / 2, 0, IMW - Ww);
  const y0 = Hw >= IMH - 120 ? (IMH - 60 - Hw) / 2 + 30 : clamp(pied.v - 0.6 * Hw, 60, IMH - Hw);   // (il est un peu sous le milieu : on voit plus loin devant lui, vers le fond)
  const k = cameraSalle.vu ? Math.min(1, dt * 4) : 1; cameraSalle.vu = 1;
  fen.cx = (fen.cx === undefined ? x0 : fen.cx + (x0 - fen.cx) * k); fen.cy = (fen.cy === undefined ? y0 : fen.cy + (y0 - fen.cy) * k); fen.H = (fen.H === undefined ? Hw : fen.H + (Hw - fen.H) * k);
  fen.x0 = fen.cx; fen.y0 = fen.cy; fen.x1 = fen.x0 + fen.H * A; fen.y1 = fen.y0 + fen.H;
  cadrerNuit(); fondMat.uniforms.fen.value.set(fen.x0, fen.y0, fen.x1, fen.y1);
}
/* les renforts (comme dans le combat du Pisteur, § 17) : la porte s'allume en rouge pendant 2 s, puis s'ouvre ; la bande sortira de là.
   Pour l'essai : le bouton « 🚪 Renforts » (ou la touche P), une porte après l'autre. */
let prochainePorte = 0;
function renforts(i) {
  if (!(PIST && PEINT)) return; const P = salle.portes[i === undefined ? prochainePorte : i]; if (!P || P.t >= 0) return;
  P.t = 0; prochainePorte = 1 - salle.portes.indexOf(P);
}
function particulesSalle() {
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  const src = [];
  for (const L of SJ.flammes) for (let i = 0; i < 9; i++) src.push({ x: L.x, y: L.y, z: L.z + 0.1, l: 0.35, vz: 1.4, vie: 0.9, coul: new THREE.Color(1, 0.55 + Math.random() * 0.25, 0.15), taille: 1 });
  for (const C of SJ.cristaux) { const fort = C.larg > 0.5; for (let i = 0; i < (fort ? 14 : 6); i++) src.push({ x: C.x, y: C.y + (fort ? 0.8 : 0.5), z: C.z - 0.2, l: C.larg * 0.9, vz: 0.45, vie: 2.6, coul: new THREE.Color(C.coul).lerp(new THREE.Color(1, 1, 1), 0.3), taille: 0.8 }); }
  const n = src.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 6, map: new THREE.CanvasTexture(c), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false });   // (en pixels d'écran : la caméra est loin, des points « en pas » seraient minuscules)
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; monde.add(pts);
  src.forEach(P => { P.t = Math.random() * P.vie; P.ox = (Math.random() - 0.5) * P.l; P.oy = (Math.random() - 0.5) * P.l * 0.4; P.dx = (Math.random() - 0.5) * 0.3; });
  salle.part = { src, pos, col, geo };
}
function avancerParticules(dt) {
  if (!salle.part) particulesSalle();
  const { src, pos, col, geo } = salle.part;
  src.forEach((P, i) => {
    P.t += dt; if (P.t > P.vie) { P.t -= P.vie; P.ox = (Math.random() - 0.5) * P.l; P.oy = (Math.random() - 0.5) * P.l * 0.4; P.dx = (Math.random() - 0.5) * 0.3; }
    const u = P.t / P.vie, a = Math.sin(Math.PI * u), w = G(P.x + P.ox + P.dx * u + 0.06 * Math.sin(u * 9 + i), P.y + P.oy, P.z + P.vz * P.t);
    pos[i * 3] = w.x; pos[i * 3 + 1] = w.y; pos[i * 3 + 2] = w.z;
    col[i * 3] = P.coul.r * a; col[i * 3 + 1] = P.coul.g * a; col[i * 3 + 2] = P.coul.b * a;
  });
  geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
}
function avancerSalle(dt, t) {
  avancerParticules(dt);
  if (h.pousse) { const dx = h.pousse.x - h.x, dy = h.pousse.y - h.y, dd = Math.hypot(dx, dy), v = 7 * dt; if (dd <= v) { h.x = h.pousse.x; h.y = h.pousse.y; h.pousse = null; } else { h.x += dx / dd * v; h.y += dy / dd * v; } }
  for (const S of salle.lum) {   // les cristaux respirent un peu, les flammes vacillent
    const n = S.L.nom, feu = n.startsWith('torche') || n.startsWith('bougie') || S.L.type === 'feu';
    const k = feu ? 0.86 + 0.1 * Math.sin(t * 9 + S.L.x) + 0.05 * Math.sin(t * 23 + S.L.y) : 0.93 + 0.07 * Math.sin(t * 1.3 + S.L.x * 0.7);
    S.l.intensity = S.I * k; if (S.pt) S.pt.intensity = S.Ip * k;
  }
  for (const O of salle.ombres) {   // (son ombre ne se voit que près de la lumière ; le cône suit le Pisteur : une ombre nette, jamais coupée)
    const d = Math.hypot(h.x - O.x, h.y - O.y); O.l.shadow.intensity = clamp(1.7 - d / 5.2, 0, 1);
    O.l.target.position.copy(G(h.x, h.y, 0.6)); O.l.target.updateMatrixWorld();
    O.l.angle = clamp(Math.atan2(d + 2.4, Math.max(0.5, O.z - 0.6)) - Math.atan2(Math.max(0, d - 2.4), Math.max(0.5, O.z - 0.6)), 0.35, 1.2) / 2 + 0.08;
  }
  const e = fondMat.uniforms.etat.value; fondMat.uniforms.temps.value = t;
  salle.portes.forEach((P, i) => {
    let ouv = 0, al = 0;
    if (P.t >= 0) {
      P.t += dt; const u = P.t;
      al = u < 2 ? doux(u / 0.3) : u < 5.5 ? 1 - 0.6 * doux((u - 2.5) / 3) : 0.4 * (1 - doux((u - 5.5) / 0.6));
      ouv = u < 2 ? 0 : u < 2.5 ? doux((u - 2) / 0.5) : u < 5.5 ? 1 : 1 - doux((u - 5.5) / 0.6);
      if (u > 6.1) P.t = -1;
    }
    if (i === 0) { e.x = ouv; e.z = al; } else { e.y = ouv; e.w = al; }
    P.l.intensity = 34 * al * (0.8 + 0.2 * Math.sin(t * 9)) + 12 * ouv;
  });
}
if ($('bPortes')) $('bPortes').addEventListener('click', e => { e.preventDefault(); renforts(); });
if (PIST) addEventListener('keydown', e => { if (e.key === 'p' || e.key === 'P') renforts(); });
/* ================= L'ARMURE DE GROSBEC, EN 3D (28 novembre ; Romain : la plus massive, 3,5 m, sur le seuil du temple) =================
   Le modèle Higgsfield (Meshy, d'après sa planche : origine/armure-base.glb), articulé, avec son mouvement d'attente (ralenti : il est lourd).
   - ses trois lanternes (les deux des épaules, celle de la poitrine) : une vraie lampe dans chacune, qui suit ses os, éclaire son armure,
     et un halo autour ; une lueur chaude sur les dalles à ses pieds (la place est peinte : ses lampes ne l'éclairent pas d'elles-mêmes) ;
   - son ombre : portée par la lumière du temple, dans son dos, elle s'étire vers nous sur la place ;
   - (le rayon doré d'Elyra dans son dos : enlevé le 28 novembre à 5 h 47 ; on ne le voyait pas d'ici). */
const armure = { m: null, mix: null, lampes: [], halos: [], os: [], dec: [] };
/* l'attente de Meshy a un genou qui démarre d'un coup (2° d'une image à l'autre, puis presque rien) : on lisse chaque piste dans le
   temps (deux passes d'un petit filtre 1-4-6-4-1), en tournant en rond (c'est une boucle : la dernière image est la première) */
function lisserBoucle(clip) {
  for (const k of clip.tracks) {
    const n = k.times.length - 1, d = k.getValueSize(), v = k.values; if (n < 6) continue;
    for (let passe = 0; passe < 2; passe++) {
      const src = v.slice(0), at = (i, c) => src[(((i % n) + n) % n) * d + c];
      for (let i = 0; i < n; i++) {
        if (d === 4) {   // (un quaternion : on aligne les signes sur le centre avant de moyenner)
          const q = [0, 0, 0, 0];
          [[-2, 1], [-1, 4], [0, 6], [1, 4], [2, 1]].forEach(([o, w]) => { let s = 0; for (let c = 0; c < 4; c++) s += at(i + o, c) * at(i, c); const sg = s < 0 ? -1 : 1; for (let c = 0; c < 4; c++) q[c] += sg * w * at(i + o, c); });
          const l = Math.hypot(...q); for (let c = 0; c < 4; c++) v[i * d + c] = q[c] / l;
        } else for (let c = 0; c < d; c++) v[i * d + c] = (at(i - 2, c) + 4 * at(i - 1, c) + 6 * at(i, c) + 4 * at(i + 1, c) + at(i + 2, c)) / 16;
      }
      for (let c = 0; c < d; c++) v[n * d + c] = v[c];   // (la dernière = la première)
    }
  }
}
if (NUIT) {
  const place = new THREE.Group(); place.position.copy(G(ARM.x, ARM.y, ARM.z)); monde.add(place);
  const HAUT = 3.6;   // (3,5 m ; 1 pas ≈ 0,97 m)
  const piv = new THREE.Group(); piv.rotation.x = Math.PI / 2; place.add(piv);   // (les modèles glTF ont la hauteur en y ; il nous fait face)
  // la lueur de ses lanternes sur les dalles
  const lueurSol = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: toile(128, 128, x => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,190,90,.55)'); g.addColorStop(0.45, 'rgba(255,150,60,.18)'); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  lueurSol.scale.set(5.5, 3.4, 1); lueurSol.position.copy(G(ARM.x, ARM.y + 2.0, ARM.z + 0.02));   // (5 h 50 : poussée devant lui ; centrée à 80 cm, elle éclaircissait le sol juste sous ses pieds, et il avait l'air de flotter)
  lueurSol.renderOrder = -8; monde.add(lueurSol); armure.lueurSol = lueurSol;
  // son ombre : une lumière qui ne sert qu'à ça (aucune clarté), depuis le temple, dans son dos ; elle ne voit que les abords de l'armure
  const lo = new THREE.DirectionalLight(0xffffff, 0); lo.position.copy(G(ARM.x - 0.4, ARM.y - 4, ARM.z + 4.5)); lo.target.position.copy(G(ARM.x, ARM.y + 2.5, ARM.z)); monde.add(lo, lo.target);
  const palier = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.4), new THREE.ShadowMaterial({ opacity: 0.64 })); palier.receiveShadow = true; palier.position.copy(G(ARM.x, -8.1, ARM.z + 0.003)); monde.add(palier);   // (le palier en haut des marches, du seuil de la porte au haut des marches : il reçoit son ombre)
  // (une ombre de contact, sombre et douce, juste sous les pieds : c'est elle qui la pose sur le sol)
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: toile(128, 128, x => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(0.5, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, toneMapped: false }));
  contact.scale.set(2.6, 1.5, 1); contact.position.copy(G(ARM.x, ARM.y + 0.1, ARM.z + 0.006)); contact.renderOrder = -7; monde.add(contact);
  lo.shadow.camera.layers.set(2);   // (elle ne dessine que l'armure : le héros n'approche jamais du palier)
  lo.castShadow = true; lo.shadow.mapSize.set(1024, 1024); Object.assign(lo.shadow.camera, { left: -3.6, right: 3.6, top: 3.6, bottom: -3.6, near: 1, far: 9.3 }); lo.shadow.bias = -0.0006; lo.shadow.radius = 4; lo.shadow.camera.updateProjectionMatrix();   // (far 9,3 : l'ombre s'arrête au bord du palier ; plus loin, elle retombait sur la place, 2 m plus bas, au pied des marches)
  // (le rayon d'Elyra dans son dos : enlevé à 5 h 47, Romain : « de toute façon on ne le voit pas là »)
  charger('armure.json', g => {
    const m = g.scene; armure.m = m;
    m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.layers.enable(2); o.receiveShadow = false; o.frustumCulled = false; if (o.material) { o.material.envMapIntensity = 0.5; o.material.color.multiplyScalar(0.8); o.material.emissiveIntensity = 1;
        // (ses lanternes avaient l'air éteintes : le verre, le plus clair de sa carte de lueurs, brille trois fois plus ; l'or, un peu moins qu'avant)
        // (5 h 47, Romain : « que le jaune des lanternes de ses épaules devienne presque blanc » : sur elles seules — en haut, sur les côtés du
        //  modèle au repos —, le verre est poussé très fort, et le rendu le blanchit ; le reste garde les réglages d'avant)
        o.material.onBeforeCompile = sh => {
          sh.vertexShader = 'varying vec3 vPosM;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vPosM = position;');
          sh.fragmentShader = 'varying vec3 vPosM;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', [
            '#include <emissivemap_fragment>',
            '  vec3 E0 = totalEmissiveRadiance; float lumE = max(E0.r, E0.g);',
            '  float verre = smoothstep(0.45, 0.85, lumE), epaule = smoothstep(2.1, 2.2, vPosM.y) * smoothstep(0.28, 0.34, abs(vPosM.x));',
            '  vec3 Eblanc = vec3(1.0, 0.93, 0.8) * (2.5 + 8.0 * lumE);',   // (6 h : moitié moins fort, Romain : « j'ai un peu exagéré »)
            '  totalEmissiveRadiance = mix(E0 * (0.55 + 2.6 * verre), Eblanc, smoothstep(0.12, 0.45, lumE) * epaule);'].join('\n')); }; } } });
    m.scale.setScalar(HAUT / 3.0); piv.add(m);   // (le modèle fait 3 m ; 1 pas ≈ 0,97 m, comme le Barde)
    // ses lanternes : on les place sur la pose de repos, puis elles suivent les os
    m.updateMatrixWorld(true);
    const os = n => m.getObjectByName(n), buste = os('Spine'), gauche = os('LeftShoulder'), droite = os('RightShoulder');   // (les lanternes suivent l'épaule, qui pivote un peu avec le bras ; le disque de la poitrine, la cuirasse : chez Meshy, « Spine » est le haut du buste)
    const coteG = Math.sign(piv.worldToLocal(os('LeftShoulder').getWorldPosition(new THREE.Vector3())).x) || 1;
    const cibles = [[gauche, new THREE.Vector3(0.58 * coteG, 2.5, -0.05), 0xffe2b0, 8, 4.2], [droite, new THREE.Vector3(-0.58 * coteG, 2.5, -0.05), 0xffe2b0, 8, 4.2], [buste, new THREE.Vector3(0, 2.02, 0.42), 0xffb050, 6, 3.2]];   // (les épaules : lampes presque blanches et plus fortes)
    for (const [o, p, coul, I, dist] of cibles) {
      const monde_ = piv.localToWorld(p.clone().multiplyScalar(HAUT / 3.0)), loc = o.worldToLocal(monde_.clone());
      const l = new THREE.PointLight(coul, I, dist, 1.6); l.userData.I = I; monde.add(l); armure.lampes.push(l); armure.os.push([o, loc]);
      const epaule = armure.halos.length < 2, hl = sprite(texLueur(epaule ? 'rgba(255,236,196,.9)' : 'rgba(255,200,110,.85)'), epaule ? 1.5 : 1.0, true); hl.userData.o = epaule ? 0.5 : 0.85; if (epaule) { hl.material.depthTest = false; hl.renderOrder = 5; } monde.add(hl); armure.halos.push(hl);   // (la lueur des épaules passe devant le verre, comme un éblouissement)
    }
    if (g.animations.length) {   // son attente (Idle_02, choisi par Romain), ralentie : il est lourd ; elle le tourne d'environ 25° : on le remet face aux héros
      lisserBoucle(g.animations[0]);
      armure.mix = new THREE.AnimationMixer(m); const a = armure.mix.clipAction(g.animations[0]); a.timeScale = 0.7; a.play(); armure.attente = a;
      const k = g.animations[0].tracks.find(k => k.name === 'Hips.quaternion');
      if (k) { let y = 0, w = 0; for (let i = 0; i < k.values.length; i += 4) { y += k.values[i + 1]; w += k.values[i + 3]; } m.rotation.y = -2 * Math.atan2(y, w); } armure.lacet0 = m.rotation.y; armure.vise = 0;
    }
    // ses pieds, tenus au sol (Romain, 5 h 47 : « image par image, les pieds flottent un peu ») : les sommets du dessous de chaque pied ;
    // à chaque image, on mesure où ils sont et on remet le pied sur le palier, à la même place
    { const S = []; m.traverse(o => { if (o.isSkinnedMesh) S.push(o); }); const P = S[0];
      if (P) { const pos = P.geometry.attributes.position, sw = P.geometry.attributes.skinWeight, si = P.geometry.attributes.skinIndex, noms = P.skeleton.bones.map(b => b.name), so = { L: [], R: [] };
        let y0 = 1e9, y1 = -1e9; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y < y0) y0 = y; if (y > y1) y1 = y; }
        for (let i = 0; i < pos.count; i++) { if (pos.getY(i) > y0 + (y1 - y0) * 0.03) continue; let w = 0, b = 0; for (let k = 0; k < 4; k++) if (sw.getComponent(i, k) > w) { w = sw.getComponent(i, k); b = si.getComponent(i, k); }
          if (/^(Left|Right)(Foot|ToeBase)$/.test(noms[b])) so[noms[b][0]].push(i); }
        armure.peau = P; armure.pieds = [['L', 'LeftFoot'], ['R', 'RightFoot']].map(([c, n]) => ({ os: m.getObjectByName(n), sommets: so[c], cible: null, brut: null })).filter(p => p.os && p.sommets.length); } }
    armure.bras = [['LeftArm', 'LeftForeArm'], ['RightArm', 'RightForeArm']].map(([a, b]) => [m.getObjectByName(a), m.getObjectByName(b)]).filter(([a, b]) => a && b);
    // il parle (Stand_Talking_Angry, ralenti de moitié : de grands gestes lourds) : le bouton « 🗣 Grosbec » de l'essai
    // son coup de poing au sol (Charged_Ground_Slam, n° 127 ; Romain, 6 h 11 : « Go ») : refait par Higgsfield sur un squelette de 1,70 m,
    // transféré sur le nôtre (recaler.mjs) ; tourné pour qu'il frappe face aux héros, comme son attente
    const aligner = c => {   // (tourné comme son attente : face aux héros)
      const lacet = cl => { const k = cl.tracks.find(k => k.name === 'Hips.quaternion'); let y = 0, w = 0; for (let i = 0; i < k.values.length; i += 4) { y += k.values[i + 1]; w += k.values[i + 3]; } return 2 * Math.atan2(y, w); };
      const d = lacet(g.animations[0]) - lacet(c), qd = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), d), qk = new THREE.Quaternion(), vk = new THREE.Vector3();
      for (const k of c.tracks) { if (k.name === 'Hips.quaternion') for (let i = 0; i < k.values.length; i += 4) { qk.fromArray(k.values, i).premultiply(qd).toArray(k.values, i); }
        if (k.name === 'Hips.position') for (let i = 0; i < k.values.length; i += 3) { vk.fromArray(k.values, i).applyQuaternion(qd).toArray(k.values, i); } } };
    charger('armure-coup.json', p => { if (p.animations[0] && armure.mix) { const c = p.animations[0]; aligner(c);
      armure.coup = armure.mix.clipAction(c); armure.coup.setLoop(THREE.LoopOnce, 1); armure.coup.clampWhenFinished = false; armure.coup.timeScale = 0.85; } }, e => console.error(e));
    // l'appel des cristaux : il lève les deux mains (Charged_Spell_Cast, n° 125, refait par Higgsfield sur son squelette de 1,70 m, transféré
    // sur le nôtre ; Romain, 28 nov., après-midi : « il lève les deux mains, des éclairs dedans »)
    charger('armure-sort.json', p => { if (p.animations[0] && armure.mix) { const c = p.animations[0]; aligner(c);
      armure.sort = armure.mix.clipAction(c); armure.sort.setLoop(THREE.LoopOnce, 1); armure.sort.clampWhenFinished = false; armure.sort.timeScale = 0.8; } }, e => console.error(e));
    charger('armure-parle.json', p => { if (p.animations[0] && armure.mix) { const c = THREE.AnimationUtils.subclip(p.animations[0], 'parle', 0, 180, 30); c.tracks = c.tracks.filter(t => !t.name.startsWith('Hips.position'));   // (son film dure 21 s : on garde les 6 premières, environ 11 s à l'écran)
 armure.parle = armure.mix.clipAction(c); armure.parle.setLoop(THREE.LoopOnce, 1); armure.parle.clampWhenFinished = false; armure.parle.timeScale = 0.55; } }, e => console.error(e));
    pret('armure');
  }, e => { console.error(e); pret('armure'); });
}
const TEX_CONTACT = toile(128, 128, x => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.92)'); g.addColorStop(0.45, 'rgba(0,0,0,.7)'); g.addColorStop(0.75, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
const _vp = new THREE.Vector3(), _vh = new THREE.Vector3(), _dp = new THREE.Vector3(), _va = new THREE.Vector3(), _b1 = new THREE.Vector3(), _b2 = new THREE.Vector3(), _d1 = new THREE.Vector3(), _d2 = new THREE.Vector3(), _bas = new THREE.Vector3(0, 0, -1), _qw = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qp = new THREE.Quaternion();
function parleGrosbec() { if (!armure.parle || CP.t >= 0) return; armure.retourDe = armure.parle; armure.parle.reset().setEffectiveWeight(1).fadeIn(0.4).play(); armure.attente.fadeOut(0.4); armure.retour = armure.parle.getClip().duration / armure.parle.timeScale - 0.6; }   // (le retour à l'attente se compte avec le temps du jeu, plus avec une minuterie à part)
if ($('bParle')) $('bParle').addEventListener('click', e => { e.preventDefault(); parleGrosbec(); });
function avancerArmure(dt, t) {
  if (!armure.m) return;
  // (le mélangeur d'animations ne réécrit un os que si sa valeur a changé : au tour de boucle, l'attente garde la même pose deux ou trois
  //  images, et la correction des bras de l'image d'avant restait, puis se rajoutait : un saut des bras. On remet donc chaque bras comme
  //  le mouvement l'a laissé avant de mettre à jour, et on corrige après.)
  if (armure.bras) for (const B of armure.bras) if (B[2]) B[0].quaternion.copy(B[2]);
  if (armure.pieds) for (const p of armure.pieds) if (p.brut) p.os.position.copy(p.brut);
  if (armure.retour !== undefined && (armure.retour -= dt) <= 0) { armure.retour = undefined; armure.attente.reset().fadeIn(0.6).play(); (armure.retourDe || armure.parle).fadeOut(0.6); }
  if (armure.mix) armure.mix.update(dt);
  armure.m.updateMatrixWorld(true);
  if (armure.bras) for (const B of armure.bras) (B[2] || (B[2] = new THREE.Quaternion())).copy(B[0].quaternion);
  const wA = armure.attente ? armure.attente.getEffectiveWeight() : 0;
  if (armure.pieds) for (const p of armure.pieds) {   // chaque pied : le dessous sur le palier (z du palier), et à la place qu'il avait à la première image
    (p.brut || (p.brut = new THREE.Vector3())).copy(p.os.position);
    let zmin = 1e9, sx = 0, sy = 0; for (const i of p.sommets) { armure.peau.getVertexPosition(i, _vp); armure.peau.localToWorld(_vp); monde.worldToLocal(_vp); if (_vp.z < zmin) zmin = _vp.z; sx += _vp.x; sy += _vp.y; }
    sx /= p.sommets.length; sy /= p.sommets.length;
    if (!p.cible) { p.cible = new THREE.Vector3(sx, sy, ARM.z);   // (et une ombre de contact bien noire sous ce pied : elle le colle au palier)
      p.ombre = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX_CONTACT, transparent: true, depthWrite: false, toneMapped: false })); p.ombre.scale.set(0.95, 0.85, 1); p.ombre.renderOrder = -6; monde.add(p.ombre); }
    const dz = p.cible.z - zmin; _dp.set((p.cible.x - sx) * wA, (p.cible.y - sy) * wA, dz > 0 ? dz : dz * wA);   // (un pied qui se lève dans un autre mouvement n'est pas rabattu)
    if (_dp.length() > 0.25) _dp.setLength(0.25);   // (quand il parle, son animation fait un vrai pas : on le laisse faire, on ne tient que la hauteur)
    p.os.getWorldPosition(_va); monde.worldToLocal(_va).add(_dp); monde.localToWorld(_va); p.os.parent.worldToLocal(_va); p.os.position.copy(_va); p.os.updateMatrixWorld(true);
    p.ombre.position.set(sx + _dp.x, sy + _dp.y - 0.04, ARM.z + 0.008);
  }
  // (la correction suit le poids de l'attente : quand il parle, elle s'efface en douceur, et revient de même ; avant, elle se coupait d'un coup)
  const wC = armure.coup ? armure.coup.getEffectiveWeight() * (armure.coup.isRunning() ? 1 : 0) : 0, wS = armure.sort ? armure.sort.getEffectiveWeight() * (armure.sort.isRunning() ? 1 : 0) : 0, bas = 0.4 * wA + 0.33 * wC + 0.25 * wS;   // (pendant le coup de poing : ses bras montent un tiers moins haut ; levés à la verticale, l'aisselle s'étirait)
  if (armure.bras && bas > 0.001) for (const [bras, avant] of armure.bras) {   // les bras redescendent d'un tiers vers le bas (Romain : « comme s'il tenait quelque chose »)
    bras.getWorldPosition(_b1); avant.getWorldPosition(_b2); _d1.subVectors(_b2, _b1).normalize(); _d2.copy(_d1).lerp(_bas, bas).normalize();
    _qw.setFromUnitVectors(_d1, _d2); bras.getWorldQuaternion(_qb); bras.parent.getWorldQuaternion(_qp);
    bras.quaternion.copy(_qp.invert().multiply(_qw.multiply(_qb))); bras.updateMatrixWorld(true);
  }
  armure.os.forEach(([o, loc], i) => { o.localToWorld(_va.copy(loc)); monde.worldToLocal(_va); armure.lampes[i].position.copy(_va); armure.halos[i].position.copy(_va);
    const f = 0.92 + 0.08 * Math.sin(t * (5.1 + i) + i * 2) * Math.sin(t * 2.3 + i); armure.lampes[i].intensity = armure.lampes[i].userData.I * f; armure.halos[i].material.opacity = armure.halos[i].userData.o * f; });
  armure.lueurSol.material.opacity = 0.85 + 0.15 * Math.sin(t * 2.3);
}

/* ================= LE PREMIER TIERS DE LA PHASE 2 : LES CRISTAUX ET LA VAGUE DE FEU =================
   (refait le 28 novembre, après-midi ; Romain, 15 h 47 : « Allez, vas-y, lance tout ce chantier. ») Ce qu'il a demandé, à la voix :
   - Grosbec lève les deux mains, des éclairs y crépitent, tout tremble un peu ;
   - six ombres grandissent sur la place, n'importe où ; six cristaux y tombent : sa vidéo de chute sur fond vert (Higgsfield, en gros plan),
     détourée finement et vérifiée image par image (outils/cristaux/) : un vrai impact, des rochers qui volent, de la poussière ; au sol,
     un cratère vu du dessus, posé en perspective ;
   - la vague : un départ de fournaise devant Grosbec (sa vidéo sur fond noir, posée en lumière ; Grosbec éclairé en orange par en dessous,
     au même rythme ; des flammes devant ses jambes, d'autres derrière lui), et la vidéo de la vague de Romain, calée au pixel ;
   - derrière chaque cristal, vu de Grosbec, l'abri : une goutte couchée, large contre le cristal, qui s'affine en s'éloignant ; son bord
     est une flamme vivante (une lueur, des braises) qui se forme à mesure que le feu passe (dans le fond : « l'abri ») ;
   - le feu s'éteint complètement ; puis chaque cristal se brise (sa vidéo, détourée de même) : ses morceaux tombent et disparaissent
     (ni fumée, ni évaporation). */
const CR = { N: 6, haut: 3.0, rayon: 0.55, abri: 1.0 };
const CR_W = CR.haut * 432 / 340, CR_H = CR.haut * 768 / 340, CR_AU = 209 / 432, CR_AV = 1 - 663 / 768;   // (ses vidéos : 432 × 768 ; du sommet du cristal au sol, 340 px ; son pied en (209, 663))
const T_OMBRE = 2.15, T_CHUTE = [2.3, 2.7], IMPACT = 48 / 24, CHUTE_FIN = 84 / 24, BRISE_FIN = 69 / 24, BRISE_CASSE = 40 / 24;   // (dans les vidéos : l'impact à l'image 48 ; le cristal planté à la 84 ; il casse à la 40 de l'autre)
const DEPART_VAGUE = 6.6, FIN = 6.4, ETEINT = 1.0, BRISE_T0 = FIN + ETEINT + 0.25;   // (tw : depuis le départ de la vidéo de la vague ; la place brûle jusqu'à FIN, puis s'éteint)
const SORT = { debut: 0.6, haut: 2.2, bas: 2.95 };   // (son mouvement : il ramasse l'énergie devant sa poitrine de 0,8 à 1,9 s, puis lance les deux mains au-dessus de sa tête à 2,1 s ; les éclairs grandissent jusque-là)
const vg = { t: -1, actifs: [], touche: 0, pret: false, tw: -1, braises: [] };
let aCharger = 1;
const charge = () => { if (--aCharger === 0) { vg.pret = true; const b = $('bVague'); if (b) b.classList.remove('fait'); } };
function videoJeu(chemin, boucle) {   // (lue d'un bloc, passée au lecteur par une adresse blob: : l'iPhone exige sinon un serveur qui sert les vidéos par morceaux)
  const el = document.createElement('video'); el.muted = true; el.loop = !!boucle; el.playsInline = true; el.setAttribute('playsinline', ''); el.preload = 'auto';
  aCharger++; fetch(el.canPlayType('video/mp4') ? chemin + '.mp4' : chemin + '.webm').then(r => r.blob()).then(b => { el.src = URL.createObjectURL(b); charge(); }).catch(e => { console.error(e); charge(); });
  const tex = new THREE.VideoTexture(el); tex.colorSpace = THREE.NoColorSpace; return { el, tex, parti: false };
}
const VID = NUIT ? { chute: [videoJeu('nuit/cristaux/chute'), videoJeu('nuit/cristaux/chute')], brise: [videoJeu('nuit/cristaux/brise'), videoJeu('nuit/cristaux/brise')], four: videoJeu('nuit/fournaise') } : null;
const texPlante = NUIT ? (aCharger++, chargeur.load('nuit/cristaux/cristal-plante.jpg', t => { t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; charge(); }, undefined, charge)) : null;
const texCratere = NUIT ? (aCharger++, chargeur.load('nuit/cristaux/cratere.png', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; charge(); }, undefined, charge)) : null;
let LUM_FOUR = null; if (NUIT) fetch('nuit/fournaise.json').then(r => r.json()).then(j => { LUM_FOUR = j.lumiere; }).catch(() => {});
charge();
function jouerV(V, t, debut) {   // une vidéo du jeu, à l'instant t (en s) de son film ; debut : la lancer
  if (debut && !V.parti) { V.parti = true; try { V.el.currentTime = 0; if (!window.__pilote) V.el.play().catch(() => {}); } catch (_) {} }
  if (window.__pilote) { try { const d = (V.el.duration || 9) - 0.04; if (Math.abs(V.el.currentTime - Math.min(t, d)) > 0.03) V.el.currentTime = Math.min(t, d); } catch (_) {} }
  return (V.el.readyState >= 2 || V.el.seeking) && (V.el.currentTime > 0.02 || t < 0.1);
}
function arreter(V) { V.parti = false; try { V.el.pause(); } catch (_) {} }
/* un panneau debout, tourné vers nous, de la profondeur de son pied : il cache ce qui est derrière lui, le héros devant le cache */
const VS_PANNEAU = 'uniform vec3 ancre; varying vec2 vU; void main(){ vU = uv; vec4 cp = projectionMatrix * modelViewMatrix * vec4(position, 1.0); vec4 ca = projectionMatrix * viewMatrix * vec4(ancre, 1.0); gl_Position = vec4(cp.xy, clamp(ca.z / ca.w, -1.0, 1.0) * cp.w, cp.w); }';
const GLSL_LIN = 'vec3 lin(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }\n';
const GEO_CR = [false, true].map(m => new THREE.PlaneGeometry(CR_W, CR_H).translate(((m ? 1 - CR_AU : CR_AU) - 0.5) * -CR_W, (CR_AV - 0.5) * -CR_H, 0));
function matCristal(miroir) {   // (ses vidéos : la couleur à gauche, l'opacité à droite)
  return new THREE.ShaderMaterial({
    uniforms: { t: { value: texPlante }, ancre: { value: new THREE.Vector3() }, op: { value: 0 }, rouge: { value: 0 }, miroir: { value: miroir ? 1 : 0 }, sombre: { value: 0.9 } },
    vertexShader: VS_PANNEAU,
    fragmentShader: GLSL_LIN + `uniform sampler2D t; uniform float op; uniform float rouge; uniform float miroir; uniform float sombre; varying vec2 vU;
      void main(){
        float x = clamp(miroir > 0.5 ? 1.0 - vU.x : vU.x, 0.003, 0.997); vec2 a = vec2(x * 0.5, vU.y);
        float al = texture2D(t, a + vec2(0.5, 0.0)).g * op; if (al < 0.004) discard;
        vec3 c = lin(texture2D(t, a).rgb) * sombre;   // (un peu plus sombre : la place est de nuit)
        float br = max(c.r, max(c.g, c.b)), bas = 1.0 - smoothstep(0.12, 0.62, vU.y);   // (le feu autour : il l'éclaire par en dessous, orange ; le haut reste violet)
        c += vec3(1.0, 0.3, 0.06) * rouge * (0.35 + 0.65 * bas) * (0.06 + 0.55 * br);
        gl_FragColor = vec4(c, al);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, depthTest: true, toneMapped: false
  });
}
function matDecal(map, coul) {   // (posé sur le sol, juste après la peinture : le héros marche dessus)
  return new THREE.MeshBasicMaterial({ map, color: coul, opacity: 0, transparent: false, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, depthTest: false, depthWrite: false, toneMapped: false });
}
const ombreChute = toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(0.6, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
/* la fournaise : deux panneaux de sa vidéo, l'un devant Grosbec (plus petit : les flammes cachent ses jambes), l'autre derrière lui (plus grand, retourné) */
function matFournaise(miroir, cache) {
  return new THREE.ShaderMaterial({
    uniforms: { t: { value: VID.four.tex }, ancre: { value: new THREE.Vector3() }, force: { value: 0 }, miroir: { value: miroir ? 1 : 0 }, cache: { value: cache } },
    vertexShader: VS_PANNEAU,
    fragmentShader: GLSL_LIN + `uniform sampler2D t; uniform float force; uniform float miroir; uniform float cache; varying vec2 vU;
      void main(){
        vec3 f = lin(texture2D(t, vec2(miroir > 0.5 ? 1.0 - vU.x : vU.x, vU.y)).rgb) * force; float L = max(f.r, max(f.g, f.b));
        if (L < 0.002) discard;
        gl_FragColor = vec4(f * 1.5, clamp(L * cache, 0.0, 0.92));   // (de la lumière qui s'ajoute ; le plus vif cache aussi ce qui est derrière)
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, depthTest: true, toneMapped: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor
  });
}
const FOUR = { devant: null, derriere: null };
if (NUIT) {
  for (const [nom, W, H, dy, mi, cache] of [['devant', 6.2, 3.5, 1.35, false, 0.55], ['derriere', 8.6, 4.85, -1.1, true, 0.25]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H).translate(0, (0.5 - 0.22) * H, 0), matFournaise(mi, cache)); m.frustumCulled = false; m.visible = false;
    m.position.copy(G(ARM.x, ARM.y + dy, ARM.z)); m.material.uniforms.ancre.value.copy(G(ARM.x, ARM.y + dy, ARM.z)); monde.add(m); FOUR[nom] = m;
  }
}
/* « quand le feu arrive ici » (la carte tirée de sa vidéo), lue une fois pour savoir quand le héros et les cristaux sont touchés */
let arrivee = null;
if (NUIT) { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); arrivee = { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }; }; im.src = 'nuit/arrivee.png'; }
function arriveFeu(x, y) {   // (en secondes depuis le début de la vidéo ; Infinity : jamais)
  if (!arrivee) return Infinity; const p = imgDe(x, y, 0), u = clamp(Math.floor(p.u / IMW * arrivee.w), 0, arrivee.w - 1), v = clamp(Math.floor(p.v / IMH * arrivee.h), 0, arrivee.h - 1);
  const a = arrivee.d[(v * arrivee.w + u) * 4]; return a >= 254 ? Infinity : a / 24;
}
const debout = c => c.etat === 'plante' || (c.etat === 'chute' && c.vt >= IMPACT) || (c.etat === 'brise' && c.tb < BRISE_CASSE);
function contreCristal(x, y) { for (const c of vg.actifs) if (debout(c) && Math.hypot(x - c.x, y - c.y) < CR.rayon + 0.2) return true; return false; }
function formeAbri(c, x, y) {   // l'abri derrière ce cristal (la même forme que dans le fond, sans la flamme qui bouge) : < 0 dedans
  let ux = c.x - ARM.x, uy = c.y - ARM.y; const L = Math.hypot(ux, uy); ux /= L; uy /= L;
  const vx = x - c.x, vy = y - c.y, al = vx * ux + vy * uy - 0.15, pe = Math.abs(vx * uy - vy * ux), Rh = CR.abri, Lt = 4.6;
  return al < 0 ? Math.hypot(al, pe) - Rh : Math.max(pe - Rh * Math.pow(Math.max(0, 1 - al / Lt), 0.85), al - Lt);
}
function abrite(x, y) { for (const c of vg.actifs) if (debout(c) && formeAbri(c, x, y) < -0.08) return true; return false; }
function tirerPlaces() {   // six places au hasard sur la place : sur le sol libre, écartées, pas sur le héros
  if (window.__tirage) return window.__tirage;   // (pour les essais : [[x, y], …])
  const pris = [];
  for (let essai = 0; essai < 4000 && pris.length < CR.N; essai++) {
    const x = 0.6 + Math.random() * 19.8, y = 2.0 + Math.random() * 16.0, sep = essai < 2500 ? 3.6 : 2.8;
    if (caseDe(GR.libre, x, y) !== 1 || caseDe(GR.libre, x + 0.6, y) !== 1 || caseDe(GR.libre, x - 0.6, y) !== 1 || (crev.ouvert && dansCrevasse(x, y, 0.9))) continue;
    if (Math.hypot(x - h.x, y - h.y) < 2.4 || pris.some(p => Math.hypot(x - p[0], y - p[1]) < sep)) continue;
    pris.push([x, y]);
  }
  return pris;
}
function lancerVague() {
  if (!NUIT || vg.t >= 0 || !vg.pret || CP.t >= 0) return;
  for (const c of vg.actifs) nettoyer(c); vg.actifs = [];
  vg.t = 0; vg.tw = -1; vg.touche = 0; vg.passe = false; vg.secours = false; vg.tv = -1; vg.tvT = 0; vg.secoue = [false, false];
  for (const V of [...VID.chute, ...VID.brise, VID.four]) arreter(V);
  tirerPlaces().forEach(([x, y], k) => {
    const grp = k % 2, miroir = (k >> 1) % 2 === grp;   // (deux vidéos décalées, trois cristaux chacune ; un sur deux retourné)
    const mesh = new THREE.Mesh(GEO_CR[miroir ? 1 : 0], matCristal(miroir)); mesh.frustumCulled = false; mesh.visible = false; mesh.position.copy(G(x, y, 0)); monde.add(mesh);
    const ombre = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matDecal(ombreChute, 0xffffff)); ombre.renderOrder = -8; ombre.position.copy(G(x, y, 0.01)); monde.add(ombre);
    const cratere = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), matDecal(texCratere, 0xa8a3b4)); cratere.renderOrder = -7; cratere.rotation.z = Math.random() * 6.283; cratere.position.copy(G(x, y + 0.08, 0.012)); monde.add(cratere);
    vg.actifs.push({ k, x, y, grp, miroir, mesh, ombre, cratere, etat: 'attente', vt: -9, tb: -9, rouge: 0, ta: Infinity, braiseT: 0 });
  });
  // il lève les deux mains
  if (armure.sort) { armure.retourDe = armure.sort; armure.sort.reset().setEffectiveWeight(1).fadeIn(0.35).play(); armure.attente.fadeOut(0.35); if (armure.parle && armure.parle.isRunning()) armure.parle.fadeOut(0.3);
    armure.retour = armure.sort.getClip().duration / armure.sort.timeScale - 0.45; }
  vg.mains = prendre(0xb487ff, 0, 9);
  try { CP.ecl.el.currentTime = 0; if (!window.__pilote) CP.ecl.el.play().catch(() => {}); } catch (_) {}
  const b = $('bVague'); if (b) b.classList.add('fait');
  if (videoEl) { try { videoEl.pause(); videoEl.currentTime = 0; } catch (_) {} }
}
/* la vidéo de la vague de Romain */
let videoEl = null, videoTex = null;
if (NUIT) {
  videoEl = document.createElement('video'); videoEl.muted = true; videoEl.loop = false; videoEl.playsInline = true; videoEl.setAttribute('playsinline', ''); videoEl.preload = 'auto';
  const fic = videoEl.canPlayType('video/mp4') ? 'nuit/vague.mp4' : 'nuit/vague.webm';
  fetch(fic).then(r => r.blob()).then(b => { videoEl.src = URL.createObjectURL(b); }).catch(e => console.error(e));
  videoTex = new THREE.VideoTexture(videoEl); videoTex.colorSpace = THREE.NoColorSpace;   // (décodée dans le shader : sinon, selon le navigateur, elle sort délavée)
  fondMat.uniforms.vid.value = videoTex;
  vg.feuL = new THREE.PointLight(0xff7a2a, 0, 6, 1.4); monde.add(vg.feuL);   // (le feu sous le héros l'éclaire par en dessous)
  vg.charge = new THREE.PointLight(0xff7428, 0, 13, 1.3); vg.charge.position.copy(G(ARM.x, ARM.y + 1.7, ARM.z + 0.45)); monde.add(vg.charge);   // (la fournaise éclaire Grosbec par en dessous)
}
/* LE COUP DE POING DE GROSBEC (Romain, 28 nov., 6 h 11 : « Go » ; sa vidéo de la zone dorée, faite à 1 h 11, envoyée à 6 h 19) :
   il frappe le palier ; sur la place, sa vidéo recalée : les fissures dorées s'ouvrent dans la moitié droite, puis la lumière jaillit
   du sol ; le Barde encore dans la zone à ce moment-là est projeté en l'air. (outils/salle-nuit/coup.py : recalage, zone, temps) */
const COUP_IMPACT = 1.82;   // (dans son film : son poing droit touche le palier ; mesuré sur la main, essai_coup.py)
// (deux zones, deux vidéos de Romain : à droite les fissures dorées et les colonnes de lumière, à gauche les fissures et l'explosion de roche ;
//  à chaque coup, Grosbec en tire une au hasard — Romain, 6 h 45 : « il en choisit qu'une seule, bien sûr » ; il se tourne vers elle, et les
//  éclairs de son gant ont la couleur de la zone : dorés à droite, orange feu à gauche)
const CP = { t: -1, zones: null, Z: null, lance: false, frappe: false, touche: false, eclat: null, cote: null };
function videoCoup(nom) { const el = document.createElement('video'); el.muted = true; el.loop = false; el.playsInline = true; el.setAttribute('playsinline', ''); el.preload = 'auto';
  fetch(el.canPlayType('video/mp4') ? 'nuit/' + nom + '.mp4' : 'nuit/' + nom + '.webm').then(r => r.blob()).then(b => { el.src = URL.createObjectURL(b); }).catch(e => console.error(e));
  const tx = new THREE.VideoTexture(el); tx.colorSpace = THREE.NoColorSpace; return { el, tex: tx }; }
if (NUIT) {
  fetch('nuit/coup.json').then(r => r.json()).then(j => { const Z = {};
    for (const [cote, z] of Object.entries(j.zones)) { const t = atob(z.zone), u = new Uint8Array(GR.nx * GR.ny); for (let i = 0; i < u.length; i++) u[i] = (t.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
      Z[cote] = Object.assign({}, z, { cases: u, img: cote === 'gauche' ? coupTexG : coupTex, ref: cote === 'gauche' ? refG : refD, teinteC: new THREE.Color(...z.teinte) }, videoCoup(z.video)); }
    CP.zones = Z; }).catch(e => console.error(e));
  CP.lum = new THREE.PointLight(0xffc860, 0, 18, 1.2); monde.add(CP.lum);
  CP.eclat = sprite(texLueur('rgba(255,214,120,.95)'), 2.4, true); CP.eclat.material.opacity = 0; monde.add(CP.eclat);
  CP.lumPoing = new THREE.PointLight(0xffd080, 0, 7, 1.5); monde.add(CP.lumPoing);
  // les éclairs de son gant : une vidéo d'éclairs sur fond noir (Higgsfield, Seedance 2.5), en gris ; le noir s'efface, la teinte vient de la zone
  const ev = document.createElement('video'); ev.muted = true; ev.loop = true; ev.playsInline = true; ev.setAttribute('playsinline', ''); ev.preload = 'auto';
  fetch(ev.canPlayType('video/mp4') ? 'nuit/eclairs.mp4' : 'nuit/eclairs.webm').then(r => r.blob()).then(b => { ev.src = URL.createObjectURL(b); }).catch(e => console.error(e));
  const et = new THREE.VideoTexture(ev); et.colorSpace = THREE.NoColorSpace;
  const em = new THREE.ShaderMaterial({ uniforms: { t: { value: et }, teinte: { value: new THREE.Color(1, 0.82, 0.45) }, force: { value: 0 } }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D t; uniform vec3 teinte; uniform float force; varying vec2 vU; void main(){ float l = texture2D(t, vU).r; l = max(0.0, l - 0.06) / 0.94; l *= 1.0 - smoothstep(0.55, 0.98, length(vU - 0.5) * 2.0); vec3 c = teinte * l + vec3(1.0) * l * l * 0.8; gl_FragColor = vec4(c * force * 1.7, 1.0); }' });
  CP.ecl = { el: ev, mesh: new THREE.Mesh(new THREE.PlaneGeometry(1, 1), em), tourne: 0, quand: 0 }; CP.ecl.mesh.visible = false; CP.ecl.mesh.frustumCulled = false; CP.ecl.mesh.renderOrder = 6; scene.add(CP.ecl.mesh);
  CP.lumGant = new THREE.PointLight(0xffd080, 0, 7, 1.4); scene.add(CP.lumGant);
  // (la boule de lumière qui englobe son gant — Romain : « que ça fasse un peu cache-misère, que la lumière dépasse son gant » — : un cœur presque blanc,
  //  un grand halo de la couleur de la zone ; les éclairs en partent)
  CP.coeur = sprite(texLueur('rgba(255,255,250,1)'), 1, true); CP.halo = sprite(texLueur('rgba(255,255,255,.85)'), 1, true);
  for (const S of [CP.halo, CP.coeur]) { S.material.depthTest = false; S.renderOrder = 7; S.material.opacity = 0; scene.add(S); }
}
const dansZoneCoup = (x, y) => !!(CP.Z && caseDe(CP.Z.cases, x, y));
function coupDePoing(cote) {
  if (!NUIT || CP.t >= 0 || vg.t >= 0 || !armure.coup || !CP.zones) return;
  CP.cote = cote === 'gauche' || cote === 'droite' ? cote : (Math.random() < 0.5 ? 'gauche' : 'droite'); const Z = CP.Z = CP.zones[CP.cote];
  CP.halo.material.color.copy(Z.teinteC); fondMat.uniforms.jourT.value.copy(Z.teinteC);
  fondMat.uniforms.vidC.value = Z.tex; fondMat.uniforms.coupImg.value = Z.img; fondMat.uniforms.refC.value = Z.ref; fondMat.uniforms.coupR.value = 0; CP.ecl.mesh.material.uniforms.teinte.value.copy(Z.teinteC); CP.lumGant.color.copy(Z.teinteC);
  CP.t = 0; CP.lance = false; CP.frappe = false; CP.touche = false; CP.tf = undefined; armure.retourDe = armure.coup;
  // il vise la zone : tourné vers son milieu (un peu plus qu'en vrai, pour qu'on le voie bien)
  armure.vise = 1.6 * Math.atan2(Z.centre[0] - ARM.x, Z.centre[1] - ARM.y);
  armure.coup.reset().setEffectiveWeight(1).fadeIn(0.3).play(); armure.attente.fadeOut(0.3); if (armure.parle && armure.parle.isRunning()) armure.parle.fadeOut(0.3);
  armure.retour = armure.coup.getClip().duration / armure.coup.timeScale - 0.5;
  try { CP.ecl.el.currentTime = 0; if (!window.__pilote) CP.ecl.el.play().catch(() => {}); } catch (_) {}
  const b = $('bCoup'); if (b) b.classList.add('fait');
}
function avancerPoing(dt) {
  if (armure.m && armure.lacet0 !== undefined) {   // (il se tourne vers la zone pendant son coup, puis revient face aux héros)
    const cible = CP.t >= 0 && !(armure.retour !== undefined && armure.retour < 0.3) ? armure.vise : 0; armure.viseC = (armure.viseC || 0) + (cible - (armure.viseC || 0)) * Math.min(1, dt * 3);
    armure.m.rotation.y = armure.lacet0 + armure.viseC;
  }
  if (CP.t < 0) return; CP.t += dt;
  const I = CP.Z, imp = COUP_IMPACT / armure.coup.timeScale, vt = CP.t - (imp - I.fissures);   // (sa vidéo part pour que ses fissures s'ouvrent quand le poing touche)
  // les éclairs : ils crépitent sur son gant pendant qu'il arme, de plus en plus fort ; à l'impact, ils partent dans le sol
  const E = CP.ecl, main = armure.m.getObjectByName('RightHand');
  if (main) {
    main.getWorldPosition(_vh); E.mesh.position.copy(_vh); E.mesh.quaternion.copy(cam.quaternion);
    E.quand -= dt; if (E.quand <= 0) { E.quand = 0.12 + Math.random() * 0.12; E.tourne = Math.random() * 6.283; E.taille = 0.9 + Math.random() * 0.3; }
    E.mesh.rotateZ(E.tourne);
    const u = clamp(CP.t / imp, 0, 1), apres = CP.t - imp, f = apres < 0 ? (0.25 + 0.75 * u * u) * (0.8 + 0.2 * Math.random()) : Math.max(0, 1.4 * Math.exp(-apres * 7));
    E.mesh.scale.setScalar((2.2 + 2.6 * u) * E.taille * (apres > 0 ? 1 + apres * 2 : 1)); E.mesh.material.uniforms.force.value = f * 1.3; E.mesh.visible = f > 0.01;
    CP.lumGant.position.copy(_vh); CP.lumGant.intensity = 30 * f;
    const vac = 0.85 + 0.15 * Math.random(), fb = apres < 0 ? (0.45 + 0.55 * u) * vac : Math.max(0, Math.exp(-apres * 9));
    CP.coeur.position.copy(_vh); CP.coeur.scale.setScalar(0.8 + 1.1 * u); CP.coeur.material.opacity = fb;
    CP.halo.position.copy(_vh); CP.halo.scale.setScalar(1.8 + 2.8 * u); CP.halo.material.opacity = 0.9 * fb;
    if (apres < 0) { monde.worldToLocal(_va.copy(_vh)); const q = imgDe(_va.x, -_va.y, _va.z); fondMat.uniforms.jourO.value.set(q.u, q.v); fondMat.uniforms.jourR.value = 420 + 700 * u; fondMat.uniforms.jourA.value = (0.12 + 0.6 * u * u) * vac; }
    else { fondMat.uniforms.jourO.value.copy(fondMat.uniforms.coupO.value); fondMat.uniforms.jourR.value = 1000 + 900 * Math.min(1, apres * 3); fondMat.uniforms.jourA.value = 0.9 * Math.exp(-apres * 2.6); }   // (à l'impact : elle éclate au sol)
    if (window.__pilote && E.el.readyState >= 2) { try { const d = E.el.duration || 4; const c = CP.t % (d - 0.1); if (Math.abs(E.el.currentTime - c) > 0.05) E.el.currentTime = c; } catch (_) {} }
  }
  if (!CP.frappe && CP.t >= imp) {   // l'impact : le sol tremble, un éclat doré sous ses poings
    CP.frappe = true; fen.bouge = Math.max(fen.bouge, 1);
    const m = armure.m, a = m.getObjectByName('LeftHand'), b = m.getObjectByName('RightHand'); a.getWorldPosition(_vh); b.getWorldPosition(_va); _vh.add(_va).multiplyScalar(0.5); monde.worldToLocal(_vh);
    { const q = imgDe(_vh.x, -_vh.y, ARM.z); fondMat.uniforms.coupO.value.set(q.u, q.v); }   // (l'effet part de là où son poing touche le palier)
    CP.eclat.position.set(_vh.x, _vh.y, ARM.z + 0.3); CP.eclat.material.color.copy(I.teinteC); CP.lumPoing.position.set(_vh.x, _vh.y - 0.6, ARM.z + 0.8); CP.lumPoing.color.copy(I.teinteC); CP.tf = 0;
  }
  if (CP.frappe) fondMat.uniforms.coupR.value = 3200 * clamp((CP.t - imp) / 0.7, 0, 1) + 320;
  if (CP.tf !== undefined) { CP.tf += dt; const f = Math.exp(-CP.tf * 4); CP.eclat.material.opacity = f; CP.eclat.scale.setScalar(2.4 + CP.tf * 3); CP.lumPoing.intensity = 40 * f; }
  if (vt >= 0) {
    if (!CP.lance) { CP.lance = true; try { I.el.currentTime = 0; if (!window.__pilote) I.el.play().catch(() => {}); } catch (_) {} }
    if (window.__pilote) { try { const c = Math.min(vt, I.fin - 0.05); if (Math.abs(I.el.currentTime - c) > 0.03) I.el.currentTime = c; } catch (_) {} }
  }
  const ok = (I.el.readyState >= 2 || I.el.seeking) && I.el.currentTime > 0.03, env = vt < 0 ? 0 : Math.min(1, vt / 0.25) * (1 - doux((vt - (I.fin - 0.5)) / 0.5));
  fondMat.uniforms.coupSec.value = ok ? 0 : 1;   // (sans vidéo : la place au moment de l'explosion, en fondu autour de l'explosion)
  fondMat.uniforms.coup.value = ok ? env : env * clamp(1 - Math.abs(vt - I.pic) / 0.9, 0, 1);
  const ex = vt - I.explosion;   // (la lumière qui jaillit éclaire les héros et l'armure)
  CP.lum.color.copy(I.teinteC); CP.lum.position.copy(G(I.centre[0], I.centre[1], 1.6)); CP.lum.intensity = ex > 0 ? 90 * Math.exp(-ex * 1.5) * Math.min(1, ex / 0.25) : vt > 0 ? 10 * Math.min(1, vt / 0.6) : 0;
  if (ex > 0 && ex < 0.5) fen.bouge = Math.max(fen.bouge, 0.45);
  if (!CP.touche && ex >= 0 && ex < 0.6 && dansZoneCoup(h.x, h.y)) { CP.touche = true; projeter(); }   // (encore dans la zone quand ça jaillit : projeté)
  if (vt >= I.fin) { CP.t = -1; CP.tf = undefined; CP.eclat.material.opacity = 0; CP.lumPoing.intensity = 0; fondMat.uniforms.coup.value = 0; CP.lum.intensity = 0; CP.ecl.mesh.visible = false; CP.lumGant.intensity = 0; CP.coeur.material.opacity = 0; CP.halo.material.opacity = 0; fondMat.uniforms.jourA.value = 0;
    try { I.el.pause(); CP.ecl.el.pause(); } catch (_) {} const b = $('bCoup'); if (b) b.classList.remove('fait'); }
}
const MSG = {};
function bulle(texte, coul) {   // un petit mot au-dessus du héros (« Touché ! », « À l'abri ! »)
  if (!MSG[texte]) MSG[texte] = toile(256, 64, x => { x.font = 'bold 40px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 7; x.strokeStyle = 'rgba(0,0,0,.85)'; x.strokeText(texte, 128, 34); x.fillStyle = coul; x.fillText(texte, 128, 34); });
  const sp = sprite(MSG[texte], 1.6, false); sp.scale.set(1.9, 0.48, 1); sp.material.depthTest = false; sp.renderOrder = 10; monde.add(sp);
  notes.push({ sp, x: h.x, y: h.y, z: 2.2, vx: 0, vy: 0, vz: 0.5, t: 0, vie: 1.3, fixe: true });
}
function toucher() {
  if (vg.touche > 0) return; vg.touche = 1.0; bulle('Touché !', '#ff6a4a');
  const v = $('rouge'); if (v) { v.style.transition = 'none'; v.style.opacity = '1'; requestAnimationFrame(() => { v.style.transition = 'opacity .6s'; v.style.opacity = '0'; }); }
}
function nettoyer(c) { monde.remove(c.mesh, c.ombre, c.cratere); c.mesh.material.dispose(); c.ombre.material.dispose(); c.cratere.material.dispose(); c.ombre.geometry.dispose(); c.cratere.geometry.dispose(); }
const _rougeL = new THREE.Color(0xff3a12), _violet = new THREE.Color(0.72, 0.5, 1.0);
function braise(c, tw) {   // une braise qui part du bord de l'abri, là où le feu est déjà passé
  let ux = c.x - ARM.x, uy = c.y - ARM.y; const L = Math.hypot(ux, uy); ux /= L; uy /= L;
  const s = Math.random() * 2 - 1, cote = Math.random() < 0.5 ? -1 : 1;
  let al, pe; if (s < -0.35) { const a = (s + 1) / 0.65 * Math.PI * 0.5 + Math.PI * 0.5; al = Math.cos(a) * CR.abri; pe = Math.sin(a) * CR.abri; } else { al = (s + 0.35) / 1.35 * 4.4; pe = CR.abri * Math.pow(Math.max(0, 1 - al / 4.6), 0.85); }
  al += 0.15; const x = c.x + ux * al - uy * pe * cote, y = c.y + uy * al + ux * pe * cote;
  if (arriveFeu(x, y) > tw) return;
  const sp = sprite(Math.random() < 0.3 ? T_LUEUR.or : T_LUEUR.feu, 0.1 + Math.random() * 0.08, true); sp.material.depthTest = true;
  sp.position.copy(G(x, y, 0.05)); monde.add(sp);
  vg.braises.push({ sp, x, y, z: 0.05, vx: (Math.random() - 0.5) * 0.5 + ux * 0.3, vy: (Math.random() - 0.5) * 0.5 + uy * 0.3, vz: 0.7 + Math.random() * 0.9, t: 0, vie: 0.7 + Math.random() * 0.6, s0: sp.scale.x });
}
function avancerBraises(dt) {
  for (let i = vg.braises.length - 1; i >= 0; i--) {
    const b = vg.braises[i]; b.t += dt; const u = b.t / b.vie;
    if (u >= 1) { monde.remove(b.sp); b.sp.material.dispose(); vg.braises.splice(i, 1); continue; }
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vx += Math.sin(b.t * 9 + i) * dt * 0.8;
    b.sp.position.copy(G(b.x, b.y, b.z)); b.sp.material.opacity = (u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85) * (0.75 + 0.25 * Math.sin(b.t * 30 + i));
    const k = b.s0 * (1 - 0.5 * u); b.sp.scale.set(k, k, 1);
  }
}
function avancerVague(dt, t) {
  fondMat.uniforms.temps.value = t;
  if (vg.touche > 0) vg.touche -= dt;
  avancerBraises(dt);
  if (vg.t < 0) return; vg.t += dt; const T = vg.t;
  /* 1. il lève les deux mains : des éclairs violets y crépitent, tout tremble un peu */
  const E = CP.ecl, main = armure.m;
  if (main) {
    if (!vg.eclM) {   // (deux éclairs, un par main, comme celui du coup de poing ; la même vidéo)
      vg.eclM = [0, 1].map(() => { const m = new THREE.Mesh(E.mesh.geometry, E.mesh.material.clone()); m.material.uniforms.t.value = E.mesh.material.uniforms.t.value; m.material.uniforms.teinte.value.copy(_violet); m.frustumCulled = false; m.renderOrder = 6; m.visible = false; scene.add(m); return { m, tourne: 0, quand: 0, taille: 1 }; });
      vg.halosM = [0, 1].map(() => { const s = sprite(texLueur('rgba(220,200,255,.9)'), 1, true); s.material.depthTest = false; s.renderOrder = 7; s.material.opacity = 0; scene.add(s); return s; });
    }
    const u = clamp((T - SORT.debut) / (SORT.haut - SORT.debut), 0, 1), fin = clamp((T - SORT.bas) / 0.45, 0, 1), f = (0.2 + 0.8 * u * u) * (1 - fin);
    ['LeftHand', 'RightHand'].forEach((n, i) => {
      const os = main.getObjectByName(n), M = vg.eclM[i]; if (!os) return; os.getWorldPosition(_vh);
      M.m.position.copy(_vh); M.m.quaternion.copy(cam.quaternion);
      M.quand -= dt; if (M.quand <= 0) { M.quand = 0.1 + Math.random() * 0.12; M.tourne = Math.random() * 6.283; M.taille = 0.85 + Math.random() * 0.35; }
      M.m.rotateZ(M.tourne); M.m.scale.setScalar((1.6 + 1.6 * u) * M.taille); M.m.material.uniforms.force.value = f * (0.8 + 0.4 * Math.random()) * 1.2; M.m.visible = f > 0.01;
      const H = vg.halosM[i]; H.position.copy(_vh); H.scale.setScalar(1.2 + 1.4 * u); H.material.opacity = 0.7 * f;
      if (i === 0) _va.copy(_vh); else _va.add(_vh).multiplyScalar(0.5);
    });
    if (vg.mains) { monde.worldToLocal(_va); vg.mains.position.copy(_va); vg.mains.intensity = 26 * f; }
    if (f <= 0.001 && T > SORT.bas) { vg.eclM.forEach(M => { M.m.visible = false; }); vg.halosM.forEach(H => { H.material.opacity = 0; }); if (vg.mains) { rendreL(vg.mains); vg.mains = null; } }
    if (window.__pilote && E.el.readyState >= 2 && T < SORT.bas + 0.5) { try { const d = E.el.duration || 4; const c = T % (d - 0.1); if (Math.abs(E.el.currentTime - c) > 0.05) E.el.currentTime = c; } catch (_) {} }
    if (T > SORT.haut - 0.1 && T < SORT.haut + 0.7) fen.bouge = Math.max(fen.bouge, 0.3);
  }
  /* 2. les cristaux tombent, se plantent ; le feu les fait rougir ; éteint, ils se brisent */
  const tw = T - DEPART_VAGUE; vg.tw = tw;
  const ok = [0, 1].map(g => { const vt = T - T_CHUTE[g]; return vt >= 0 && vt < CHUTE_FIN + 0.1 ? jouerV(VID.chute[g], vt, true) : false; });
  const tbG = [0, 1].map(g => tw - (BRISE_T0 + g * 0.35)), okB = tbG.map((tb, g) => tb >= 0 && tb < BRISE_FIN + 0.1 ? jouerV(VID.brise[g], tb, true) : false);
  const cri = fondMat.uniforms.cri.value;
  vg.actifs.forEach((c, k) => {
    const m = c.mesh.material.uniforms, g = c.grp; c.vt = T - T_CHUTE[g]; c.tb = tbG[g];
    m.ancre.value.copy(G(c.x, c.y + 0.6, 0));   // (sa profondeur : celle de son pied, un peu vers nous — la poussière devant lui reste visible)
    c.mesh.up.set(0, 0, 1); c.mesh.lookAt(cam.position.x, cam.position.y, 0);
    if (c.etat === 'attente' || c.etat === 'chute') {   // son ombre grandit, de plus en plus noire, jusqu'à l'impact
      const u = clamp((T - T_OMBRE) / (T_CHUTE[g] + IMPACT - T_OMBRE), 0, 1), r = 0.5 + 1.9 * u * u;
      c.ombre.scale.set(r, r * 0.85, 1); c.ombre.material.opacity = 0.75 * Math.sqrt(u);
    }
    if (c.etat === 'attente' && c.vt >= 0) { c.etat = 'chute'; c.mesh.visible = true; }
    if (c.etat === 'chute') {
      if (ok[g]) { m.t.value = VID.chute[g].tex; m.op.value = 1; } else { m.t.value = texPlante; m.op.value = c.vt >= IMPACT ? Math.min(1, (c.vt - IMPACT) / 0.12) : 0; }   // (sans sa vidéo : il apparaît planté)
      if (!c.impact && c.vt >= IMPACT) {   // l'impact : le sol tremble, le cratère, un éclair de sa couleur ; le héros trop près est repoussé
        c.impact = true; c.ti = 0;
        if (!vg.secoue[g]) { vg.secoue[g] = true; fen.bouge = Math.max(fen.bouge, 0.55); }
        const l = prendre(0xb98cff, 45, 8); if (l) { l.position.copy(G(c.x, c.y + 0.5, 1.2)); eclats.push({ lum: l, t: 0, vie: 0.45, I: 45 }); }
        const d = Math.hypot(h.x - c.x, h.y - c.y); if (d < 1.15) { toucher(); const a = Math.atan2(h.y - c.y, h.x - c.x); h.pousse = { x: c.x + Math.cos(a) * 1.5, y: c.y + Math.sin(a) * 1.5 }; }
      }
      if (c.impact) { c.ti += dt; c.ombre.material.opacity *= Math.max(0, 1 - c.ti / 0.25); c.cratere.material.opacity = Math.min(1, c.ti / 0.1); c.cratere.scale.setScalar(0.75 + 0.25 * doux(c.ti / 0.25)); }
      if (c.vt >= CHUTE_FIN) { c.etat = 'plante'; m.t.value = texPlante; m.op.value = 1; c.ombre.visible = false; }
    }
    if (debout(c) && c.etat !== 'brise') cri[k].set(c.x, c.y, CR.abri, 1); else cri[k].w = 0;
    // le feu : il rougit quand le feu l'atteint (côté Grosbec), reste rouge tant que la place brûle, refroidit quand elle s'éteint
    if (c.etat === 'plante' || c.etat === 'brise') {
      if (c.ta === Infinity && tw >= Math.min(arriveFeu(c.x, c.y - 0.8), FIN - 1.5)) c.ta = tw;
      const r = tw < FIN ? clamp((tw - c.ta) / 1.0, 0, 1) : Math.max(0, 1 - (tw - FIN) / (ETEINT + 1.2)) ; c.rouge += (r - c.rouge) * Math.min(1, dt * 5); m.rouge.value = c.rouge;
      if (c.etat === 'plante') c.cratere.material.opacity = 1 - 0.85 * c.rouge;   // (la lave le recouvre, puis il réapparaît quand elle s'éteint)
      if (tw > c.ta && tw < FIN + 0.3 && vg.braises.length < 70) { c.braiseT -= dt; if (c.braiseT <= 0) { c.braiseT = 0.06 + Math.random() * 0.08; braise(c, tw); } }
    }
    if (c.etat === 'plante' && c.tb >= 0) c.etat = 'brise';
    if (c.etat === 'brise') {   // il se brise : ses morceaux tombent, restent un instant, disparaissent ; le cratère s'efface avec eux
      m.sombre.value = 0.74;   // (ses morceaux sortent très éclairés de leur vidéo : ramenés à la nuit)
      if (okB[g]) { m.t.value = VID.brise[g].tex; m.op.value = 1; } else { m.t.value = texPlante; m.op.value = Math.max(0, 1 - c.tb / 0.5); }
      c.cratere.material.opacity = 1 - doux((c.tb - (BRISE_FIN - 0.55)) / 0.55);
      if (!c.casse && c.tb >= BRISE_CASSE - 0.35) { c.casse = true; const l = prendre(0xd0b0ff, 25, 6); if (l) { l.position.copy(G(c.x, c.y + 0.5, 1.0)); eclats.push({ lum: l, t: 0, vie: 0.35, I: 25 }); } }
      if (c.tb >= BRISE_FIN) { c.etat = 'fini'; nettoyer(c); }
    }
  });
  /* 3. la vague : la fournaise devant Grosbec, puis sa vidéo ; elle brûle jusqu'à FIN, puis s'éteint complètement */
  const tf = tw + 0.25;   // (la fournaise part un quart de seconde avant la vague)
  if (tf >= 0 && tf < 5.05) {
    const okF = jouerV(VID.four, tf, true), i = LUM_FOUR ? clamp(Math.round(tf * 24), 0, LUM_FOUR.length - 1) : 0, L = LUM_FOUR ? LUM_FOUR[i] : Math.max(0, Math.sin(Math.PI * tf / 4.5));
    FOUR.devant.visible = FOUR.derriere.visible = okF; FOUR.devant.material.uniforms.force.value = 1; FOUR.derriere.material.uniforms.force.value = 0.8;
    for (const P of [FOUR.devant, FOUR.derriere]) { P.up.set(0, 0, 1); P.lookAt(cam.position.x, cam.position.y, P.position.z); }
    vg.charge.intensity = 150 * L;   // (Grosbec éclairé en orange par en dessous, au rythme du feu)
    if (tf > 0.3 && tf < 1.3) fen.bouge = Math.max(fen.bouge, 0.25);
  } else if (FOUR.devant && FOUR.devant.visible) { FOUR.devant.visible = FOUR.derriere.visible = false; vg.charge.intensity = 0; arreter(VID.four); }
  fondMat.uniforms.tw.value = Math.max(0, tw);
  if (tw >= 0 && videoEl) {
    if (!vg.lance) { vg.lance = true; try { videoEl.currentTime = 0; if (!window.__pilote) videoEl.play().catch(() => {}); } catch (_) {} }
    if (window.__pilote) { try { if (Math.abs(videoEl.currentTime - Math.min(tw, 5.1)) > 0.03) videoEl.currentTime = Math.min(tw, 5.1); } catch (_) {} }
    else if (tw < 4.8) { if (videoEl.currentTime !== vg.tv) { vg.tv = videoEl.currentTime; vg.tvT = tw; } if (tw - vg.tvT > 0.7) vg.secours = true; }   // (la vidéo ne défile pas : la place en feu peinte prend le relais)
  }
  const vidOK = videoEl && videoEl.readyState >= 2 && videoEl.currentTime > 0.03;
  fondMat.uniforms.secours.value = vg.secours || !vidOK ? 1 : 0;
  fondMat.uniforms.vague.value = tw < 0 ? 0 : tw < 0.3 ? tw / 0.3 : tw < FIN ? 1 : Math.max(0, 1 - (tw - FIN) / ETEINT);
  // le héros : le feu arrive sous lui (la carte de sa vidéo) ; à l'abri derrière un cristal, rien
  const ta = arriveFeu(h.x, h.y), brule = tw >= ta && tw < FIN, abri = abrite(h.x, h.y);
  if (brule && !vg.passe) { vg.passe = true; if (abri) bulle('À l’abri !', '#8dffb0'); }
  if (brule && !abri && !h.saut) toucher();
  vg.feuL.position.copy(G(h.x, h.y + 0.3, 0.3)); vg.feuL.intensity += ((brule && !abri ? 30 : tw > 0 && tw < FIN && Math.min(arriveFeu(h.x + 1.2, h.y), arriveFeu(h.x - 1.2, h.y), arriveFeu(h.x, h.y - 1.2)) <= tw ? 12 : 0) - vg.feuL.intensity) * Math.min(1, dt * 6);
  if (tw > BRISE_T0 + 0.35 + BRISE_FIN + 0.3 && vg.actifs.every(c => c.etat === 'fini')) {   // fini : on peut relancer
    vg.t = -1; vg.lance = false; fondMat.uniforms.vague.value = 0; vg.actifs = []; cri.forEach(v => v.set(0, 0, 0, 0)); vg.feuL.intensity = 0;
    for (const V of [...VID.chute, ...VID.brise, VID.four]) arreter(V);
    const b = $('bVague'); if (b) b.classList.remove('fait'); if (videoEl) videoEl.pause();
  }
}

/* ---------- la boucle ---------- */
const attendu = new Set(NUIT ? ['fond', 'crev', 'crevA', 'feu', 'arrivee', 'pilier-g', 'pilier-d', 'barde', 'armure'] : PIST && PEINT ? ['fond', 'prof', 'portes', 'anim', 'barde'] : ['fond', 'prof', 'barde']); let demarre = false;
function pret(n) { attendu.delete(n); if (!attendu.size && !demarre) { demarre = true; $('charge').style.display = 'none'; } }
let avant = performance.now(), ips = 60, nImg = 0, t0 = avant;
/* la finesse de l'image s'adapte à la tablette (Romain, 28 nov. : « il faut être à plus de 24 images par seconde sur des tablettes anciennes ») :
   chaque seconde, on compte les images ; deux secondes de suite sous 27 → l'image est calculée un peu moins fine (×2 → ×1,75 → … → ×1) ;
   déjà à ×1 → des ombres moins fines (512 au lieu de 1024, sans recalculer les dessins) ; huit secondes de suite au-dessus de 52 → un cran plus fin.
   Le chiffre en haut à gauche : les images par seconde (et le réglage, s'il a baissé). */
const QUAL = { max: Math.min(devicePixelRatio || 1, 2), pr: Math.min(devicePixelRatio || 1, 2), bas: 0, haut: 0, ombres: 1024, depuis: 0 };
function regler() {
  if (window.__pilote || !demarre || document.visibilityState !== 'visible') return;
  if (++QUAL.depuis < 4) return;   // (les premières secondes : le chargement fausse le compte)
  if (ips < 27) { QUAL.bas++; QUAL.haut = 0; } else if (ips > 52) { QUAL.haut++; QUAL.bas = 0; } else { QUAL.bas = 0; QUAL.haut = 0; }
  if (QUAL.bas >= 2) {
    QUAL.bas = 0;
    if (QUAL.pr > 1.001) { QUAL.pr = Math.max(1, QUAL.pr - 0.25); rendu.setPixelRatio(QUAL.pr); }
    else if (QUAL.ombres > 512) { QUAL.ombres = 512; scene.traverse(o => { if (o.isLight && o.castShadow && o.shadow) { o.shadow.mapSize.set(512, 512); if (o.shadow.map) { o.shadow.map.dispose(); o.shadow.map = null; } } }); }
  } else if (QUAL.haut >= 8 && QUAL.pr < QUAL.max - 0.001) { QUAL.haut = 0; QUAL.pr = Math.min(QUAL.max, QUAL.pr + 0.25); rendu.setPixelRatio(QUAL.pr); }
}
let tSim = 0;
function boucle(maint) {
  requestAnimationFrame(boucle);
  const dt = Math.min(0.05, (maint - avant) / 1000); avant = maint;
  nImg++; if (maint - t0 > 1000) { ips = Math.round(nImg * 1000 / (maint - t0)); nImg = 0; t0 = maint; regler(); $('ips').textContent = ips + (QUAL.pr < QUAL.max ? ' · ' + QUAL.pr.toFixed(2).replace(/0$/, '') : '') + (QUAL.ombres < 1024 ? ' · o' : ''); }
  if (!window.__pilote && demarre) { tSim += dt; etape(dt, tSim); }
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
  if (h.proj) avancerProj(dt);   // (projeté : on ne le dirige plus jusqu'à ce qu'il se relève)
  else if (PIST && h.coup) { loco.v = Math.max(0, loco.v - 20 * dt); if (loco.v < 0.05) loco.allure = h.ombre ? 'guet' : 'garde'; }   // (il frappe sur place)
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
  incline.position.copy(G(h.x, h.y, solZ(h.x, h.y)));
  const r = h.sautR / SAUT.recharge; if (r !== etape.r) { etape.r = r; $('bSaut').style.setProperty('--r', r.toFixed(3)); }
  if (melangeur) { locomotion(dt); melangeur.update(dt); }
  if (NUIT) avancerArmure(dt, t);
  redresser();
  barde.updateMatrixWorld(true); animerLuth(dt, t);
  if (NUIT) { avancerCrevasses(dt, t); avancerVague(dt, t); avancerPoing(dt); }
  avancerTirs(dt); avancerEclats(dt); avancerNotes(dt); avancerEclairs(dt); avancerPoussiere(dt); avancerGouttes(dt); avancerSoins(dt); if (PIST) avancerPisteur(dt, t);
  /* les flammes, les lumières qui vacillent */
  for (const f of flammes) { const k = 0.85 + 0.15 * Math.sin(t * 11 + f.b[0] + f.i * 2) + 0.08 * Math.sin(t * 27 + f.i); const w = (0.42 - f.i * 0.09) * k; f.f.scale.set(w, w * 1.6, 1); f.f.position.x = Math.sin(t * 7 + f.i * 2.1) * 0.04 + (f.i - 1) * 0.06; }
  brasiers.forEach((l, i) => { l.intensity = 40 * (0.85 + 0.12 * Math.sin(t * 9 + i * 3) + 0.06 * Math.sin(t * 23 + i)); });
  if (lueurArmure) lueurArmure.intensity = 45 * (0.9 + 0.1 * Math.sin(t * 2.1));
  for (const L of nuit.lanternes) {   // les lanternes vacillent un peu ; leur ombre ne se voit que près d'elles
    const k = 0.9 + 0.07 * Math.sin(t * 9 + L.x) + 0.04 * Math.sin(t * 23 + L.y); L.l.intensity = 70 * k; L.pt.intensity = 18 * k;
    L.l.shadow.intensity = clamp(1.5 - Math.hypot(h.x - L.x, h.y - L.y) / 5, 0, 1);
    L.l.shadow.autoUpdate = false; L.l.shadow.needsUpdate = L.l.shadow.intensity > 0;   // (loin d'elle, son ombre ne se voit pas : on ne la recalcule pas — une image plus légère)
  }
  for (const P of piliers) P.halo.material.opacity = 0.16 + 0.05 * Math.sin(t * 9 + P.x) + 0.03 * Math.sin(t * 21);
  if (PIST && PEINT) { avancerSalle(dt, t); cameraSalle(dt); return; }
  if (NUIT) { cameraNuit(dt); return; }
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
window.__essai = { THREE, rendu, scene, etape, QUAL, regler, armure, parleGrosbec, coupDePoing, projeter, dansZoneCoup, get CP() { return CP; }, cam, get fondU() { return fondMat.uniforms; }, get proj() { return h.proj; }, solOmbre, osM: noms => { const r = {}; for (const n of noms) { const o = MOD.getObjectByName(n); if (!o) continue; o.updateWorldMatrix(true, false); const v = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); MOD.worldToLocal(v); r[n] = [v.x, v.y, v.z]; } return r; }, frapper, basculerOmbre, mq, MURETS, COUPS, sauter, SAUT, get tirs() { return tirs.map(s => ({ x: s.x, y: s.y, z: s.z, q: s.q })); }, ecran: (x, y, z) => { if (NUIT || PEINT) { cam.updateMatrixWorld(); const v = G(x, y, z).project(cam); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; } return { x: (px(x) - camX) * innerWidth / Ws, y: (py(y, z) - camY) * innerHeight / Hs }; }, fissurer, lancerVague, renforts, salle, SJ, fondMat, get vague() { return vg; }, video: () => videoEl ? [videoEl.currentSrc.split('/').pop(), videoEl.readyState, videoEl.paused, videoEl.currentTime] : null, cristaux: () => vg.actifs.map(c => ({ x: c.x, y: c.y, etat: c.etat, vt: c.vt, tb: c.tb, rouge: c.rouge })), arriveFeu, abrite: () => abrite(h.x, h.y), imgDe, solImg, fen, crev, NJ, libre, dansCrevasse, nuit, piliers, poser, piedsModele, pieds, avancer, taille, joy, loco, h, get ips() { return ips; }, lancer, OS: () => OS, LUTH: () => LUTH, get pret() { return demarre; }, get vue() { return { camX, camY, Ws, Hs, hx: px(h.x), hy: py(h.y) }; } };
