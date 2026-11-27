// ===== GROSBEC : la grande armure de lumière (le modèle de l'enquête 10) =====
// (Copie du combat du Barde, combat-barde/src/grosbec.js ; deux lignes ajoutées pour la phase 2 : E0.pose, E0.teinte.)
// Un pantin décrit EN VOLUME, comme les héros : le buste, les hanches, la tête et les lanternes sont des « tours »
// (des corps ronds) habillés d'une texture déroulée ; quand il se tourne, la texture glisse autour du corps, ce qui
// est derrière disparaît derrière le bord — jamais une image retournée ou écrasée. Les bras et les jambes sont des os
// dans l'espace (on dit où poser la main, le coude se place tout seul) ; le bec et la crête sont de vrais points 3D.
// Tout est peint dans SA toile, une vingtaine de fois par seconde, et recopié à chaque image du jeu.
const Gros = (() => {
  const { TAU, alea, lin, rad, poly, trait, ell, sprite, lueur, toile, borne, mel, doux } = Ou;
  const E = 0.2, Y0 = -132, HAUT = 286;            // la vue d'un peu au-dessus ; la taille (le pivot du buste) ; sa hauteur
  const BOITE = { x0: -212, y0: -306, w: 424, h: 342 };
  let K = 2, gk = 1, kc = 2, T = null, cv = null, g = null, tDessin = -9, S = null, R = null, zone = null, cadre = null;

  // ================= les matières (peintes une fois) =================
  function tex(w, h, peindre) { const c = toile(w * K * 2, h * K), x = c.getContext('2d'); x.scale(K, K); peindre(x); x.translate(w, 0); peindre(x); return { c, pw: w * K, k: K, w, h }; }
  function acier(x, w, h, seed, tons = ['#3d4a5a', '#262e3a', '#141920']) {
    x.fillStyle = lin(x, 0, 0, 0, h, tons); x.fillRect(0, 0, w, h);
    const rnd = alea(seed);
    for (let i = 0; i < w * h / 5; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.055)' : 'rgba(0,0,0,.12)'; x.fillRect(rnd() * w, rnd() * h, 0.5 + rnd() * 0.4, 1 + rnd() * 3.5); } // l'acier brossé
    for (let i = 0; i < w * h / 160; i++) { x.strokeStyle = 'rgba(200,225,255,.10)'; x.lineWidth = 0.35; const sx = rnd() * w, sy = rnd() * h; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + (rnd() - 0.5) * 9, sy + (rnd() - 0.5) * 4); x.stroke(); } // de fines rayures
  }
  const OR = ['#fff6cc', '#eac566', '#a87a22', '#5c3e0c'];
  function or(x, x0, y0, w, h) { x.fillStyle = lin(x, 0, y0, 0, y0 + h, OR); x.fillRect(x0, y0, w, h); }
  function rivet(x, cx, cy, r = 1.15) { ell(x, cx, cy, r, r, '#4a3008'); ell(x, cx - r * 0.25, cy - r * 0.3, r * 0.62, r * 0.62, '#ffeeb0'); }
  function frise(x, x0, x1, y, h) { // la frise des anciens, gravée dans l'or
    x.strokeStyle = 'rgba(64,38,6,.9)'; x.lineWidth = 0.55; x.lineJoin = 'miter';
    for (let px = x0; px < x1 - h; px += h * 1.7) { x.beginPath(); x.moveTo(px, y + h); x.lineTo(px, y); x.lineTo(px + h * 1.1, y); x.lineTo(px + h * 1.1, y + h * 0.68); x.lineTo(px + h * 0.42, y + h * 0.68); x.lineTo(px + h * 0.42, y + h * 0.36); x.stroke(); }
  }
  function veine(x, pts, w = 1) { // un filet d'énergie : la lumière d'or, et le rouge de Raban qui court à côté
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = '#06080b'; x.lineWidth = 2.6 * w; trait(x, pts); x.stroke();
    x.shadowColor = '#ff9a22'; x.shadowBlur = 4; x.strokeStyle = '#ffbe50'; x.lineWidth = 1.3 * w; trait(x, pts); x.stroke(); x.shadowBlur = 0;
    x.strokeStyle = '#fff8dc'; x.lineWidth = 0.45 * w; trait(x, pts); x.stroke();
    x.strokeStyle = 'rgba(255,58,26,.85)'; x.lineWidth = 0.5 * w; trait(x, pts.map(p => [p[0], p[1] + 1.5 * w])); x.stroke();
    x.restore();
  }
  function plaque(x, pts, tons = ['#4a586c', '#2b3442', '#191f28']) { // une plaque d'armure, bombée, avec son biseau
    const ys = pts.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys), xs = pts.map(p => p[0]), xm = (Math.min(...xs) + Math.max(...xs)) / 2;
    poly(x, pts); x.fillStyle = lin(x, 0, y0, 0, y1, tons); x.fill();
    x.strokeStyle = '#06090d'; x.lineWidth = 1.2; x.lineJoin = 'round'; x.stroke();
    x.save(); poly(x, pts); x.clip(); x.strokeStyle = 'rgba(190,215,240,.30)'; x.lineWidth = 1.4; poly(x, pts.map(p => [p[0] + (p[0] < xm ? 1.1 : -1.1), p[1] + 1.1])); x.stroke(); x.restore();
  }
  function lanterneRonde(x, cx, cy, r) { // une Lanterne d'Or sertie dans l'armure
    x.fillStyle = rad(x, cx, cy, r, r * 2.6, ['rgba(255,196,84,.42)', 'rgba(255,196,84,0)']); x.fillRect(cx - r * 2.6, cy - r * 2.6, r * 5.2, r * 5.2);
    ell(x, cx, cy, r + 3.4, r + 3.4, lin(x, cx - r, cy - r - 3, cx + r, cy + r + 3, OR)); ell(x, cx, cy, r + 0.9, r + 0.9, '#2c1c04');
    ell(x, cx, cy, r, r, rad(x, cx - r * 0.2, cy - r * 0.25, 0.5, r * 1.05, ['#ffffff', '#fff3b8', '#ffc24a', '#e07a14']));
    x.strokeStyle = 'rgba(70,40,4,.85)'; x.lineWidth = 0.9; for (const k of [-0.5, 0, 0.5]) { x.beginPath(); x.moveTo(cx + k * r, cy - r * Math.sqrt(1 - k * k)); x.lineTo(cx + k * r, cy + r * Math.sqrt(1 - k * k)); x.stroke(); }
    x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx + r, cy); x.stroke(); ell(x, cx, cy, r * 0.55, r * 0.55); x.stroke();
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.26; rivet(x, cx + Math.cos(a) * (r + 2.1), cy + Math.sin(a) * (r + 2.1), 0.75); }
  }
  function glyphes(x, x0, x1, y, pas, seed, col = 'rgba(120,235,255,.75)') { // des signes de la ville d'en bas, qui luisent
    const rnd = alea(seed); x.strokeStyle = col; x.lineWidth = 0.55; x.lineCap = 'round';
    for (let px = x0; px < x1; px += pas) { x.beginPath(); for (let i = 0; i < 3; i++) { const a = (rnd() * 4 | 0) * Math.PI / 4, l = 1.3 + rnd() * 1.4, qx = px + (rnd() - 0.5) * 2, qy = y + (rnd() - 0.5) * 2; x.moveTo(qx - Math.cos(a) * l, qy - Math.sin(a) * l); x.lineTo(qx + Math.cos(a) * l, qy + Math.sin(a) * l); } x.stroke(); }
  }

  function matieres() {
    T = { ombres: {} };
    // --- le plastron (le haut du buste) : 300 de tour, le devant au milieu ---
    T.plastron = tex(300, 40, x => {
      acier(x, 300, 40, 1);
      for (const [a, b] of [[0, 90], [210, 300]]) for (let yy = 12; yy < 38; yy += 9) { x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(a, yy, b - a, 1.1); x.fillStyle = 'rgba(190,215,240,.20)'; x.fillRect(a, yy + 1.1, b - a, 0.6); for (let px = a + 6; px < b; px += 14) rivet(x, px, yy + 4.6, 0.8); } // les lames des côtés et du dos
      plaque(x, [[92, 5], [208, 5], [216, 26], [198, 38.5], [102, 38.5], [84, 26]]);
      x.strokeStyle = 'rgba(8,10,14,.7)'; x.lineWidth = 0.9; x.beginPath(); x.moveTo(98, 12); x.quadraticCurveTo(124, 30, 150, 33); x.quadraticCurveTo(176, 30, 202, 12); x.stroke(); // le creux des pectoraux
      x.strokeStyle = 'rgba(226,185,85,.8)'; x.lineWidth = 0.6; for (let i = 0; i < 20; i++) { const a = i * TAU / 20, r1 = i % 2 ? 23 : 29; x.beginPath(); x.moveTo(150 + Math.cos(a) * 17.5, 21 + Math.sin(a) * 17.5); x.lineTo(150 + Math.cos(a) * r1, 21 + Math.sin(a) * r1); x.stroke(); } // le soleil gravé autour du cœur
      veine(x, [[133, 20], [120, 14], [108, 20], [92, 15], [70, 21], [46, 16], [22, 21], [0, 18]]); veine(x, [[167, 20], [180, 14], [192, 20], [208, 15], [230, 21], [254, 16], [278, 21], [300, 18]]);
      veine(x, [[142, 32], [134, 36], [128, 40]], 0.8); veine(x, [[158, 32], [166, 36], [172, 40]], 0.8); veine(x, [[150, 34], [150, 40]], 0.9);
      lanterneRonde(x, 150, 21, 12.5);
      glyphes(x, 96, 132, 9, 6, 3); glyphes(x, 170, 206, 9, 6, 4);
      or(x, 0, 0, 300, 4.4); frise(x, 0, 300, 0.8, 2.8); or(x, 0, 37.6, 300, 2.4);
    });
    // --- le bas du buste et le ventre : des lames qui se recouvrent ---
    T.ventre = tex(260, 36, x => {
      acier(x, 260, 36, 2, ['#364250', '#222a34', '#12161c']);
      for (let j = 0; j < 3; j++) { const yy = j * 12; x.fillStyle = lin(x, 0, yy, 0, yy + 12, ['#44526a', '#273040', '#161b23']); x.fillRect(0, yy, 260, 11); x.fillStyle = 'rgba(190,215,240,.26)'; x.fillRect(0, yy, 260, 0.8); x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, yy + 10.6, 260, 1.4);
        for (let px = 8 + j * 5; px < 260; px += 17) rivet(x, px, yy + 8.2, 0.75); glyphes(x, 20 + j * 7, 250, yy + 4.5, 26, 10 + j, 'rgba(120,235,255,.5)'); }
      plaque(x, [[112, 0], [148, 0], [143, 30], [130, 35.5], [117, 30]], ['#55647a', '#2f3948', '#1b212b']); // l'arête du milieu
      veine(x, [[130, 0], [130, 10], [127, 18], [130, 27], [130, 36]], 1); veine(x, [[130, 12], [112, 16], [96, 12], [70, 18]], 0.7); veine(x, [[130, 12], [148, 16], [164, 12], [190, 18]], 0.7);
    });
    // --- la ceinture : la quatrième Lanterne d'Or, et l'écharpe rouge du maire ---
    T.ceinture = tex(250, 16, x => {
      x.fillStyle = lin(x, 0, 0, 0, 16, ['#8a1a22', '#c0303a', '#6a0f18']); x.fillRect(0, 0, 250, 16); // l'écharpe
      const rnd = alea(7); for (let i = 0; i < 60; i++) { x.strokeStyle = rnd() < 0.5 ? 'rgba(255,170,150,.16)' : 'rgba(40,0,6,.28)'; x.lineWidth = 0.6; const px = rnd() * 250; x.beginPath(); x.moveTo(px, 2); x.quadraticCurveTo(px + 3, 8, px - 2 + rnd() * 4, 14); x.stroke(); }
      or(x, 0, 0, 250, 2.2); or(x, 0, 13.8, 250, 2.2);
      for (let px = 12; px < 250; px += 25) if (Math.abs(px - 125) > 20) { plaque(x, [[px - 5.5, 3.4], [px + 5.5, 3.4], [px + 5.5, 12.6], [px - 5.5, 12.6]], OR.slice(1)); rivet(x, px, 8, 1.1); }
      lanterneRonde(x, 125, 8, 5.2);
    });
    // --- les tassettes : la jupe de plaques pointues ---
    T.tassettes = tex(300, 46, x => {
      for (let i = 0; i < 12; i++) {
        const px = i * 25 + 12.5, long = i % 2 ? 38 : 45;
        plaque(x, [[px - 12.4, 0], [px + 12.4, 0], [px + 12.4, long - 12], [px, long], [px - 12.4, long - 12]], i % 2 ? ['#3c4858', '#232b36', '#12161c'] : ['#4a586c', '#2b3442', '#171c24']);
        x.strokeStyle = lin(x, 0, 0, 0, long, OR); x.lineWidth = 1.5; trait(x, [[px - 10.6, 2], [px - 10.6, long - 12.6], [px, long - 2.4], [px + 10.6, long - 12.6], [px + 10.6, 2]]); x.stroke();
        x.strokeStyle = 'rgba(8,10,14,.6)'; x.lineWidth = 0.7; trait(x, [[px, 3], [px, long - 5]]); x.stroke();
        veine(x, [[px, 4], [px - 2, long * 0.4], [px, long - 10]], 0.6); rivet(x, px - 7, 5, 0.8); rivet(x, px + 7, 5, 0.8);
        glyphes(x, px - 5, px + 6, long * 0.56, 5, 20 + i, 'rgba(120,235,255,.6)');
      }
      or(x, 0, 0, 300, 2);
    });
    // --- le gorgerin (le col) et le bas du casque ---
    T.col = tex(130, 14, x => { acier(x, 130, 14, 5, ['#4a586c', '#2a3340', '#161b22']); for (let px = 0; px < 130; px += 13) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(px, 0, 1, 14); x.fillStyle = 'rgba(190,215,240,.22)'; x.fillRect(px + 1, 0, 0.6, 14); rivet(x, px + 7, 10, 0.75); } or(x, 0, 0, 130, 2.6); or(x, 0, 12, 130, 2); });
    T.nuque = tex(140, 12, x => { acier(x, 140, 12, 6, ['#2c3642', '#1a2028', '#0e1116']); for (let px = 0; px < 140; px += 7) { x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(px, 0, 0.8, 12); } for (let px = 3.5; px < 140; px += 14) rivet(x, px, 8, 0.7); or(x, 0, 9.8, 140, 2.2); });
    // --- le verre d'une lanterne d'épaule : six montants de bronze, un treillis, la lumière dedans ---
    T.verre = tex(126, 30, x => {
      x.fillStyle = lin(x, 0, 0, 0, 30, ['#ffb445', '#fff2b4', '#ffe07a', '#ff9a2a']); x.fillRect(0, 0, 126, 30);
      for (let i = 0; i < 6; i++) { const px = i * 21 + 10.5; x.fillStyle = rad(x, px, 15, 0.5, 13, ['rgba(255,255,255,.95)', 'rgba(255,255,255,0)']); x.fillRect(px - 10.5, 0, 21, 30);
        x.strokeStyle = 'rgba(120,58,0,.42)'; x.lineWidth = 0.5; for (let k = -2; k < 4; k++) { x.beginPath(); x.moveTo(px - 10.5, k * 9); x.lineTo(px + 10.5, k * 9 + 12); x.moveTo(px + 10.5, k * 9); x.lineTo(px - 10.5, k * 9 + 12); x.stroke(); }
        x.strokeStyle = 'rgba(120,58,0,.55)'; x.lineWidth = 0.7; ell(x, px, 15, 4.2, 6.5); x.stroke(); }
      for (let i = 0; i <= 6; i++) { const px = i * 21; x.fillStyle = lin(x, px - 2, 0, px + 2, 0, ['#2e1c04', '#c99a3c', '#fff0b0', '#8a6018', '#2e1c04']); x.fillRect(px - 2, 0, 4, 30); rivet(x, px, 3, 0.7); rivet(x, px, 27, 0.7); }
      x.fillStyle = '#3a2406'; x.fillRect(0, 8.6, 126, 1.2); x.fillRect(0, 20.4, 126, 1.2);
      or(x, 0, 0, 126, 2.4); or(x, 0, 27.6, 126, 2.4);
    });
    // --- les membres (dessinés couchés, de gauche à droite) ---
    const membre = (L, ep, f) => sprite(L + 10, ep + 6, 5, ep / 2 + 3, K, x => f(x, L, ep));
    const tube = (x, L, e0, e1, tons) => { // un tronc de cône d'acier, la lumière au-dessus
      const p = [[-3, -e0 / 2], [L + 3, -e1 / 2], [L + 3, e1 / 2], [-3, e0 / 2]];
      poly(x, p); x.fillStyle = lin(x, 0, -e0 / 2, 0, e0 / 2, tons || [[0, '#0b0e12'], [0.14, '#55667c'], [0.34, '#2f3a48'], [0.8, '#171c24'], [0.95, '#2a5a6c'], [1, '#0b0e12']]); x.fill();
      x.strokeStyle = '#06090d'; x.lineWidth = 1.1; x.stroke();
    };
    const anneau = (x, px, e, l = 3) => { x.fillStyle = lin(x, 0, -e / 2, 0, e / 2, ['#5c3e0c', '#fff6cc', '#eac566', '#a87a22', '#5c3e0c']); x.fillRect(px, -e / 2 - 0.4, l, e + 0.8); x.strokeStyle = 'rgba(40,24,2,.8)'; x.lineWidth = 0.5; x.strokeRect(px, -e / 2 - 0.4, l, e + 0.8); };
    T.brassard = membre(46, 25, (x, L, e) => { tube(x, L, e, e * 0.9); anneau(x, 4, e); anneau(x, L - 9, e * 0.9); veine(x, [[8, -2], [18, 1], [28, -2], [38, 1]], 0.7); for (let px = 12; px < 36; px += 8) rivet(x, px, e * 0.3, 0.7); glyphes(x, 12, 36, -e * 0.26, 6, 31, 'rgba(120,235,255,.6)'); });
    T.canon = membre(44, 32, (x, L, e) => { // l'avant-bras : un gantelet à ailettes, et le conduit de lumière vers la main
      for (const px of [6, 16, 26]) { x.fillStyle = lin(x, 0, -e / 2 - 8, 0, -e / 2 + 3, OR); poly(x, [[px, -e / 2 + 3], [px + 4, -e / 2 - 7.5], [px + 12, -e / 2 + 3]]); x.fill(); x.strokeStyle = '#2c1c04'; x.lineWidth = 0.7; x.stroke(); }
      tube(x, L, e, e * 0.66); anneau(x, -1, e, 4); anneau(x, L - 5, e * 0.68, 4);
      plaque(x, [[8, -e * 0.3], [34, -e * 0.24], [36, e * 0.16], [8, e * 0.24]], ['#55647a', '#2f3948', '#1b212b']);
      veine(x, [[10, 0], [20, -2.5], [30, 0], [42, -1]], 0.9);
      ell(x, 22, 0, 4.6, 4.6, lin(x, 18, -4, 26, 4, OR)); ell(x, 22, 0, 3.1, 3.1, rad(x, 21.5, -0.5, 0.2, 3.2, ['#ffffff', '#ffe08a', '#e07a14']));
    });
    T.coude = sprite(30, 30, 15, 15, K, x => { x.fillStyle = lin(x, 0, -14, 0, 0, OR); poly(x, [[-4, -6], [0, -14.5], [4, -6]]); x.fill(); ell(x, 0, 0, 10.5, 10.5, rad(x, -3, -4, 1, 13, ['#6a7c94', '#2a3340', '#0e1116'])); x.strokeStyle = '#06090d'; x.lineWidth = 1.1; x.stroke(); x.strokeStyle = lin(x, -8, -8, 8, 8, OR); x.lineWidth = 1.6; ell(x, 0, 0, 7, 7); x.stroke(); ell(x, 0, 0, 3, 3, rad(x, -0.5, -0.5, 0.2, 3.2, ['#fff', '#ffd76a', '#c9741a'])); });
    const doigt = (x, bx, by, ang, l, w) => { x.save(); x.translate(bx, by); x.rotate(ang); for (let k = 0; k < 3; k++) { const yy = -k * l / 3, ww = w * (1 - k * 0.14); x.fillStyle = lin(x, -ww, 0, ww, 0, ['#0e1116', '#5a6b82', '#2a3340', '#0e1116']); x.beginPath(); x.roundRect ? x.roundRect(-ww / 2, yy - l / 3, ww, l / 3 + 0.6, 1.4) : x.rect(-ww / 2, yy - l / 3, ww, l / 3 + 0.6); x.fill(); x.strokeStyle = '#06090d'; x.lineWidth = 0.7; x.stroke(); } x.fillStyle = lin(x, 0, -l - 4, 0, -l, OR); poly(x, [[-w * 0.36, -l + 0.5], [0, -l - 4.6], [w * 0.36, -l + 0.5]]); x.fill(); x.restore(); };
    T.paume = sprite(52, 60, 26, 48, K, x => { // la main ouverte, la paume vers nous : c'est de là que part la lumière
      for (const [bx, a, l] of [[-9.5, -0.34, 17], [-3.4, -0.11, 20], [3.2, 0.1, 19.5], [9.3, 0.32, 16]]) doigt(x, bx, -17, a, l, 6.2);
      doigt(x, -12.5, -6, -1.15, 13, 6.4);
      plaque(x, [[-12.5, -19], [12.5, -19], [14, -4], [9, 4], [-9, 4], [-14, -4]], ['#55647a', '#2b3442', '#161b22']);
      or(x, -9.5, 2, 19, 3); ell(x, 0, -8, 7.6, 7.6, lin(x, -7, -15, 7, -1, OR)); ell(x, 0, -8, 5.6, 5.6, rad(x, -1, -9, 0.3, 6, ['#ffffff', '#fff2b4', '#ffc24a', '#e07a14']));
    });
    T.poing = sprite(34, 34, 17, 20, K, x => { // le poing fermé
      plaque(x, [[-10, -12], [10, -12], [12.5, 2], [8, 9], [-8, 9], [-12.5, 2]], ['#5a6b82', '#2b3442', '#161b22']);
      for (let i = 0; i < 4; i++) { const px = -8.4 + i * 5.6; x.fillStyle = lin(x, 0, 2, 0, 11, ['#55667c', '#1a2028']); x.beginPath(); x.roundRect ? x.roundRect(px - 2.5, 3, 5, 9, 2) : x.rect(px - 2.5, 3, 5, 9); x.fill(); x.strokeStyle = '#06090d'; x.lineWidth = 0.7; x.stroke(); x.fillStyle = lin(x, 0, 2, 0, 5, OR); poly(x, [[px - 1.6, 4.4], [px, 1], [px + 1.6, 4.4]]); x.fill(); }
      or(x, -10, -13.5, 20, 3); ell(x, 0, -4, 3.6, 3.6, rad(x, -0.5, -4.5, 0.2, 3.8, ['#fff', '#ffd76a', '#c9741a']));
    });
    T.cuisse = membre(50, 34, (x, L, e) => { tube(x, L, e, e * 0.8); anneau(x, L - 7, e * 0.82, 3.4); veine(x, [[6, 2], [20, -2], [34, 2], [44, -1]], 0.8); glyphes(x, 8, 40, -e * 0.26, 7, 41, 'rgba(120,235,255,.55)'); });
    T.greve = membre(52, 32, (x, L, e) => { tube(x, L, e * 0.92, e * 0.62); plaque(x, [[4, -e * 0.34], [40, -e * 0.24], [46, 0], [40, e * 0.2], [4, e * 0.26]], ['#55647a', '#2f3948', '#1b212b']); veine(x, [[6, 0], [18, -2], [30, 0], [44, 0]], 0.8); anneau(x, L - 4, e * 0.64, 3.4); for (let px = 10; px < 40; px += 10) rivet(x, px, e * 0.14, 0.7); });
    T.genou = sprite(34, 36, 17, 18, K, x => { x.fillStyle = lin(x, 0, -17, 0, -4, OR); poly(x, [[-5, -7], [0, -17], [5, -7]]); x.fill(); x.strokeStyle = '#2c1c04'; x.lineWidth = 0.6; x.stroke(); plaque(x, [[-11, -8], [11, -8], [12.5, 4], [0, 13], [-12.5, 4]], ['#6a7c94', '#2f3948', '#151a21']); x.strokeStyle = lin(x, -8, -8, 8, 8, OR); x.lineWidth = 1.4; trait(x, [[-8.4, -5.4], [-9.6, 3], [0, 9.6], [9.6, 3], [8.4, -5.4]]); x.stroke(); ell(x, 0, -0.5, 3.4, 3.4, rad(x, -0.5, -1, 0.2, 3.6, ['#fff', '#aef0ff', '#3fa8c8'])); });
    T.pied = sprite(44, 34, 22, 10, K, x => { // le soleret, vu de devant : la pointe vers nous
      ell(x, 0, 14, 19, 5.5, 'rgba(0,0,0,.45)');
      plaque(x, [[-11, -8], [11, -8], [14.5, 6], [8, 15], [0, 19.5], [-8, 15], [-14.5, 6]], ['#5a6b82', '#2b3442', '#12161c']);
      x.strokeStyle = 'rgba(6,9,13,.8)'; x.lineWidth = 0.8; for (const yy of [-1, 5, 10.5]) { x.beginPath(); x.moveTo(-13 + yy * 0.35, yy); x.quadraticCurveTo(0, yy + 3.4, 13 - yy * 0.35, yy); x.stroke(); }
      x.strokeStyle = lin(x, 0, -8, 0, 19, OR); x.lineWidth = 1.3; trait(x, [[-9, -6], [-12, 6], [0, 17.4], [12, 6], [9, -6]]); x.stroke(); or(x, -11, -9.6, 22, 3);
    });
    T.cape = sprite(220, 206, 110, 6, K, x => {
      const n = 8, bas = []; for (let i = 0; i <= n; i++) bas.push([mel(-96, 96, i / n), 186 + (i % 2 ? 6 : 0) - Math.abs(i - 4) * 1.5]);
      x.beginPath(); x.moveTo(-56, 0); x.bezierCurveTo(-84, 56, -104, 120, bas[0][0], bas[0][1]);
      for (let i = 1; i <= n; i++) x.quadraticCurveTo((bas[i - 1][0] + bas[i][0]) / 2, Math.max(bas[i - 1][1], bas[i][1]) + 6, bas[i][0], bas[i][1]);
      x.bezierCurveTo(104, 120, 84, 56, 56, 0); x.closePath();
      x.fillStyle = lin(x, 0, 0, 0, 192, [[0, '#96182a'], [0.5, '#600d18'], [1, '#2c050c']]); x.fill(); x.strokeStyle = '#12020a'; x.lineWidth = 1.4; x.stroke();
      x.save(); x.clip();
      for (let i = 0; i <= n; i++) { const tx = mel(-52, 52, i / n); x.strokeStyle = i % 2 ? 'rgba(20,0,6,.5)' : 'rgba(255,130,130,.14)'; x.lineWidth = i % 2 ? 6 : 2.6; x.beginPath(); x.moveTo(tx, 8); x.quadraticCurveTo(mel(tx, bas[i][0], 0.45), 90, bas[i][0], bas[i][1]); x.stroke(); } // les plis
      const rnd = alea(91); for (let i = 0; i < 500; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,160,150,.05)' : 'rgba(20,0,4,.10)'; x.fillRect(-100 + rnd() * 200, rnd() * 190, 0.7, 2 + rnd() * 3); } // le velours
      x.fillStyle = lin(x, 0, 150, 0, 196, ['rgba(255,70,30,0)', 'rgba(255,90,40,.30)']); x.fillRect(-110, 150, 220, 50); // la lueur rouge du sol
      x.strokeStyle = lin(x, -96, 0, 96, 0, ['#7a5414', '#eac566', '#fff6cc', '#eac566', '#7a5414']); x.lineWidth = 3.2; x.beginPath(); x.moveTo(bas[0][0], bas[0][1] - 4);
      for (let i = 1; i <= n; i++) x.quadraticCurveTo((bas[i - 1][0] + bas[i][0]) / 2, Math.max(bas[i - 1][1], bas[i][1]) + 2, bas[i][0], bas[i][1] - 4); x.stroke(); // le galon d'or
      x.lineWidth = 0.9; x.strokeStyle = 'rgba(234,197,102,.75)'; x.beginPath(); for (let i = 0; i < n; i++) { const xa = bas[i][0], xb = bas[i + 1][0], ya = Math.min(bas[i][1], bas[i + 1][1]) - 13; x.moveTo(xa + 4, ya); x.lineTo((xa + xb) / 2, ya - 9); x.lineTo(xb - 4, ya); x.moveTo((xa + xb) / 2 - 2.5, ya - 15); x.lineTo((xa + xb) / 2, ya - 19); x.lineTo((xa + xb) / 2 + 2.5, ya - 15); x.lineTo((xa + xb) / 2, ya - 11); x.closePath(); } x.stroke(); // la broderie
      x.restore();
    });
    // --- le casque : la boule d'acier sombre (la lumière ne tourne pas avec lui) ---
    T.dome = sprite(60, 64, 30, 32, K, x => {
      ell(x, 0, 0, 25, 27, rad(x, -9, -12, 2, 36, [[0, '#8496ac'], [0.25, '#46566a'], [0.6, '#1f2832'], [1, '#07090c']]));
      const rnd = alea(77); x.save(); ell(x, 0, 0, 25, 27); x.clip();
      for (let i = 0; i < 260; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)'; x.fillRect((rnd() * 2 - 1) * 25, (rnd() * 2 - 1) * 27, 0.6, 1 + rnd() * 3); }
      x.strokeStyle = 'rgba(130,235,255,.55)'; x.lineWidth = 2.2; ell(x, 0, 0, 24.2, 26.2); x.stroke(); // le liseré de la lumière du portail
      x.restore(); x.strokeStyle = '#05070a'; x.lineWidth = 1.3; ell(x, 0, 0, 25, 27); x.stroke();
    });
    T.toit = sprite(60, 34, 30, 30, K, x => { // le toit d'une lanterne : une petite pagode d'or
      poly(x, [[-25, 0], [-17, -9], [-9, -12], [-6, -21], [0, -29], [6, -21], [9, -12], [17, -9], [25, 0], [0, 4]]); x.fillStyle = lin(x, -25, 0, 25, 0, ['#3a2606', '#b8892c', '#fff3c0', '#d6a544', '#7a5414', '#2c1c04']); x.fill(); x.strokeStyle = '#2c1c04'; x.lineWidth = 0.9; x.stroke();
      x.strokeStyle = 'rgba(60,36,4,.7)'; x.lineWidth = 0.6; for (const k of [-0.62, -0.3, 0, 0.3, 0.62]) { x.beginPath(); x.moveTo(k * 8, -12); x.lineTo(k * 34, 1); x.stroke(); }
      ell(x, 0, -29, 2.6, 2.6, rad(x, -0.5, -29.5, 0.2, 2.8, ['#fff', '#aef0ff', '#3fa8c8']));
    });
  }
  function ombre(rx, rz, h) { // le volume d'un corps rond : sombre sur les bords, un reflet, le liseré froid du portail
    const cle = rx + '/' + rz + '/' + h; if (T.ombres[cle]) return T.ombres[cle];
    return (T.ombres[cle] = sprite(rx * 2 + 2, h + rz * E + 2, rx + 1, 1, K, x => {
      for (let i = -rx; i < rx; i += 0.5) {
        const t = (i + 0.25) / rx, a = Math.abs(t), yo = Math.sqrt(Math.max(0, 1 - t * t)) * rz * E;
        x.fillStyle = `rgba(0,0,0,${0.8 * Math.pow(a, 2.4)})`; x.fillRect(i, yo, 0.56, h);
        const sp = 0.24 * Math.exp(-Math.pow((t + 0.36) / 0.15, 2)); if (sp > 0.01) { x.fillStyle = `rgba(235,245,255,${sp})`; x.fillRect(i, yo, 0.56, h); }
        if (a > 0.82) { x.fillStyle = `rgba(130,235,255,${0.6 * (a - 0.82) / 0.18})`; x.fillRect(i, yo, 0.56, h); }
        if (a > 0.968) { x.fillStyle = 'rgba(5,7,10,.92)'; x.fillRect(i, yo, 0.56, h); }
      }
    }));
  }

  // ================= le squelette =================
  const REPOS = { cap: 0, tors: 0, tete: 0, penche: 0.04, roulis: 0, bas: 0, hoche: 0, cape: 0, pied: 0,
    gx: -76, gy: 26, gz: 6, go: 0, dx: 76, dy: 26, dz: 6, do_: 0,   // les mains (g : à gauche de l'écran), dans le repère du buste ; ouverte ou non
    lumG: 1, lumD: 1, lumC: 1, yeux: 1, orbe: 0 };
  const VIT = { cap: 9, tors: 11, tete: 13, penche: 13, roulis: 9, bas: 13, hoche: 12, cape: 5, pied: 22, gx: 17, gy: 17, gz: 17, dx: 17, dy: 17, dz: 17, go: 30, do_: 30, lumG: 16, lumD: 16, lumC: 16, yeux: 16, orbe: 16 };
  const pr = q => { const p = 1 + q[2] * 0.0025; return [q[0] * p, -150 + (q[1] + q[2] * E + 150) * p, p, q[2]]; };
  function reperes(S) {
    const a = S.cap + S.tors, cc = Math.cos(a), sc = Math.sin(a), cl = Math.cos(S.penche), sl = Math.sin(S.penche), cr = Math.cos(S.roulis), sr = Math.sin(S.roulis);
    const bu = (lx, ly, lz) => { const x1 = lx * cc + lz * sc, z1 = -lx * sc + lz * cc, y2 = ly * cl + z1 * sl, z2 = z1 * cl - ly * sl; return [x1 * cr - y2 * sr, Y0 + S.bas + x1 * sr + y2 * cr, z2]; };
    const hc = Math.cos(S.cap), hs = Math.sin(S.cap), ha = (lx, y, lz) => [lx * hc + lz * hs, y + S.bas, -lx * hs + lz * hc];
    const ct = Math.cos(S.tete), st = Math.sin(S.tete), cn = Math.cos(S.hoche), sn = Math.sin(S.hoche);
    const te = (hx, hy, hz) => { const x1 = hx * ct + hz * st, z1 = -hx * st + hz * ct; return bu(x1, -96 + hy * cn + z1 * sn, z1 * cn - hy * sn); };
    return { bu, ha, te, psiB: a, psiH: S.cap, psiT: a + S.tete };
  }
  function ik(A, H, a, b, pole) { // deux os : où est le coude (ou le genou) ?
    let d = [H[0] - A[0], H[1] - A[1], H[2] - A[2]]; const L = Math.hypot(d[0], d[1], d[2]) || 1, Lc = borne(L, Math.abs(a - b) + 1, a + b - 0.4); d = d.map(v => v / L);
    const m = (a * a - b * b + Lc * Lc) / (2 * Lc), h = Math.sqrt(Math.max(0, a * a - m * m)), dp = pole[0] * d[0] + pole[1] * d[1] + pole[2] * d[2];
    let q = [pole[0] - d[0] * dp, pole[1] - d[1] * dp, pole[2] - d[2] * dp]; const ql = Math.hypot(q[0], q[1], q[2]) || 1; q = q.map(v => v / ql);
    return [[A[0] + d[0] * m + q[0] * h, A[1] + d[1] * m + q[1] * h, A[2] + d[2] * m + q[2] * h], [A[0] + d[0] * Lc, A[1] + d[1] * Lc, A[2] + d[2] * Lc]];
  }

  // ================= le dessin =================
  function bande(tx, sy, sh, C, rx, rz, psi, h, n = 14) { // un corps rond habillé de sa texture, vu sous l'angle psi
    const p = C[2], RX = rx * p; let f0 = -Math.PI / 2, x0 = -RX;
    for (let i = 1; i <= n; i++) {
      const f1 = -Math.PI / 2 + i * Math.PI / n, x1 = Math.sin(f1) * RX; let u0 = ((f0 - psi + Math.PI) / TAU) % 1; if (u0 < 0) u0 += 1;
      g.drawImage(tx.c, u0 * tx.pw, sy * tx.k, tx.pw / (2 * n), sh * tx.k, C[0] + x0 - 0.25, C[1] + Math.cos((f0 + f1) / 2) * rz * E * p, x1 - x0 + 0.5, h * p);
      f0 = f1; x0 = x1;
    }
    const o = ombre(rx, rz, h); g.drawImage(o.c, C[0] - o.ox * p, C[1] - o.oy * p, o.w * p, o.h * p);
  }
  function cercle(C, rx, rz, lw = 2, col) { // le bord roulé d'une pièce : un arc d'or, côté devant
    g.strokeStyle = col || lin(g, C[0] - rx, 0, C[0] + rx, 0, ['#4a300a', '#eac566', '#fff6cc', '#c99a3c', '#3a2606']); g.lineWidth = lw * C[2];
    g.beginPath(); g.ellipse(C[0], C[1], rx * C[2], rz * E * C[2], 0, 0, Math.PI); g.stroke();
  }
  function couvercle(C, rx, rz, tons) { g.fillStyle = lin(g, C[0] - rx, 0, C[0] + rx, 0, tons); g.beginPath(); g.ellipse(C[0], C[1], rx * C[2], rz * E * C[2], 0, 0, TAU); g.fill(); g.strokeStyle = '#05070a'; g.lineWidth = 1; g.stroke(); }
  function os(sp, A, B) { // un membre posé entre deux points
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.max(6, Math.hypot(dx, dy)), pm = (A[2] + B[2]) / 2, L0 = sp.w - 10, sx = len / L0;
    g.save(); g.translate(A[0], A[1]); g.rotate(Math.atan2(dy, dx)); if (dx < 0) g.scale(1, -1);
    g.drawImage(sp.c, -sp.ox * sx, -sp.oy * pm, sp.w * sx, sp.h * pm); g.restore();
  }
  function pose(sp, C, rot = 0, k = 1, miroir = 1) { g.save(); g.translate(C[0], C[1]); g.rotate(rot); g.scale(miroir * k * C[2], k * C[2]); g.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h); g.restore(); }
  function halo(C, r, rgb, a, aplati = 1) { if (a <= 0.01) return; const s = lueur(64, rgb, aplati, 0.6, 1), k = r / 64 * C[2]; g.globalAlpha = Math.min(1, a); g.drawImage(s.c, C[0] - s.ox * k, C[1] - s.oy * k, s.w * k, s.h * k); g.globalAlpha = 1; }

  function cape(S, R, now) { // la cape rouge du maire, derrière lui : peinte une fois, elle suit les épaules, se penche et s'ouvre
    const eG = pr(R.bu(-50, -62, -14)), eD = pr(R.bu(50, -62, -14)), mx = (eG[0] + eD[0]) / 2, my = (eG[1] + eD[1]) / 2;
    const sw = Math.sin(now * 1.3) * 5 + S.cape * -8 - Math.sin(R.psiB) * 30, ouv = 1 + Math.max(0, S.cape) * 0.28 + Math.sin(now * 2.1) * 0.012, lev = Math.max(0, S.cape) * 30 + Math.max(0, -S.cape) * 6, hc = -4 - lev - my;
    g.save(); g.transform(ouv, 0, (sw - mx) / 190, hc / 190, mx, my); g.drawImage(T.cape.c, -T.cape.ox, -T.cape.oy, T.cape.w, T.cape.h); g.restore();
  }
  function jambes(S, R) {
    const l = [];
    for (const sd of [-1, 1]) {
      const H = R.ha(sd * 21, -108, 0), lev = sd < 0 ? S.pied : 0, F = [sd * 30, -15 - lev * 26, 4 + lev * 10], [G] = ik(H, F, 50, 50, [sd * 0.35, 0, 1]);
      l.push({ sd, H: pr(H), G: pr(G), F: pr(F), z: H[2], lev });
    }
    l.sort((a, b) => a.z - b.z);
    for (const j of l) {
      os(T.cuisse, j.H, j.G); os(T.greve, j.G, j.F); pose(T.genou, j.G, 0, 1.15);
      pose(T.pied, [j.F[0], j.F[1] + 13 * j.F[2], j.F[2]], j.sd * 0.16 + Math.sin(R.psiH) * 0.3, 1.25);
    }
  }
  function unBras(S, R, sd) {
    const m = sd < 0 ? 'g' : 'd', ouv = S[sd < 0 ? 'go' : 'do_'] > 0.5, Ep = [sd * 55, -58, 0], Hd = [S[m + 'x'], S[m + 'y'], S[m + 'z']];
    const [Co, Ma] = ik(Ep, Hd, 46, 44, [sd * 0.85, 0.45, -0.5]);
    const A = pr(R.bu(...Ep)), B = pr(R.bu(...Co)), C = pr(R.bu(...Ma));
    return { sd, A, B, C, ouv, z: Math.max(B[3], C[3]), lum: S[sd < 0 ? 'lumG' : 'lumD'] };
  }
  function dessinBras(b) {
    os(T.brassard, b.A, b.B); os(T.canon, b.B, b.C); pose(T.coude, b.B, 0, 1);
    const ang = Math.atan2(b.C[1] - b.B[1], b.C[0] - b.B[0]);
    if (b.ouv) { pose(T.paume, [b.C[0], b.C[1] + 4 * b.C[2], b.C[2]], b.sd * 0.2 + Math.max(-0.7, Math.min(0.7, (ang + Math.PI / 2) * 0.5)), 1.12, b.sd < 0 ? -1 : 1); halo([b.C[0], b.C[1] - 6 * b.C[2], b.C[2]], 26, '255,214,110', 0.5 * b.lum); }
    else pose(T.poing, [b.C[0] + Math.cos(ang) * 7 * b.C[2], b.C[1] + Math.sin(ang) * 7 * b.C[2], b.C[2]], ang - Math.PI / 2, 1.05, b.sd < 0 ? -1 : 1);
  }
  function lanterne(S, R, sd, pul) { // une épaulière-lanterne
    const C0 = R.bu(sd * 68, -65, 0), c = pr(C0), p = c[2], lum = S[sd < 0 ? 'lumG' : 'lumD'];
    halo(c, 58, '255,196,84', 0.34 * lum + pul * 0.12);
    const spa = pr(R.bu(sd * 61, -49, 0)); // la spalière : la plaque qui la porte, sur l'épaule
    g.fillStyle = lin(g, spa[0] - 26, 0, spa[0] + 26, 0, ['#0b0e12', '#55667c', '#2f3a48', '#12161c']); g.beginPath(); g.ellipse(spa[0], spa[1], 27 * p, 11 * p, sd * 0.2, 0, TAU); g.fill(); g.strokeStyle = '#05070a'; g.lineWidth = 1.1; g.stroke();
    g.strokeStyle = lin(g, spa[0] - 26, 0, spa[0] + 26, 0, ['#4a300a', '#eac566', '#fff6cc', '#3a2606']); g.lineWidth = 1.7 * p; g.beginPath(); g.ellipse(spa[0], spa[1], 23 * p, 8.4 * p, sd * 0.2, 0, Math.PI); g.stroke();
    const top = [c[0], c[1] - 15 * p, p];
    bande(T.verre, 0, 30, top, 19, 19, R.psiB, 30, 10);
    cercle([c[0], c[1] + 15 * p, p], 20.5, 20.5, 2.6); cercle([c[0], c[1] + 15 * p, p], 14, 14, 1.4);
    pose(T.toit, [c[0], c[1] - 13.5 * p, p], 0, 0.98);
    halo(c, 30, '255,236,170', (0.34 + pul * 0.22) * lum);
    return c;
  }
  function casque(S, R, pul, E0) {
    const Hc = pr(R.te(0, 0, 0)), p = Hc[2], psi = R.psiT, P = (hx, hy, hz) => pr(R.te(hx, hy, hz));
    const surf = (a, hy) => { const rr = 25 * Math.sqrt(Math.max(0.02, 1 - (hy / 27) * (hy / 27))); return [Math.sin(a) * rr, hy, Math.cos(a) * rr]; };
    const vu = a => Math.cos(a + S.tete + S.cap + S.tors);
    // la crête : un éventail de lames de bronze, d'une oreille à l'autre (de face on la voit en grand, de côté par la tranche)
    const lames = [];
    for (let r = 0; r < 2; r++) for (let i = 0; i < (r ? 10 : 11); i++) {
      const b = (i - (r ? 4.5 : 5)) * 0.2, L = (r ? 20 : 29) - Math.abs(b) * (r ? 5 : 9) + (i % 2 ? 2.5 : 0), z = r ? -9 : -3;
      const A = P(Math.sin(b) * 19, -Math.cos(b) * 21, z), B = P(Math.sin(b) * (26 + L), -Math.cos(b) * (27 + L), z - 5), M = P(Math.sin(b) * (23 + L * 0.5), -Math.cos(b) * (24 + L * 0.5), z - 2);
      lames.push({ A, B, M, r, z: A[3] - r, b, i });
    }
    const lame = l => {
      const dx = l.B[0] - l.A[0], dy = l.B[1] - l.A[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = (l.r ? 4.4 : 5.4) * p * Math.max(0.3, Math.abs(Math.cos(psi)) * 0.8 + 0.2);
      poly(g, [[l.A[0] + nx * w * 0.6, l.A[1] + ny * w * 0.6], [l.M[0] + nx * w, l.M[1] + ny * w], l.B, [l.M[0] - nx * w, l.M[1] - ny * w], [l.A[0] - nx * w * 0.6, l.A[1] - ny * w * 0.6]]);
      g.fillStyle = l.r ? '#8a6018' : (l.i % 2 ? '#e2b955' : '#d0a040'); g.fill(); g.strokeStyle = '#1e1202'; g.lineWidth = 0.9; g.stroke();
      if (!l.r) { g.fillStyle = 'rgba(255,246,204,.75)'; poly(g, [l.M, [l.M[0] + nx * w, l.M[1] + ny * w], l.B]); g.fill(); } // la moitié qui prend la lumière
      g.strokeStyle = l.r ? 'rgba(255,240,190,.3)' : 'rgba(110,64,6,.8)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(l.A[0], l.A[1]); g.lineTo(l.B[0], l.B[1]); g.stroke();
    };
    lames.sort((a, b) => a.z - b.z);
    for (const l of lames) if (l.z < 0) lame(l);
    bande(T.nuque, 0, 12, pr(R.te(0, 14, 0)), 21, 21, psi, 12, 8);
    g.drawImage(T.dome.c, Hc[0] - T.dome.ox * p, Hc[1] - T.dome.oy * p, T.dome.w * p, T.dome.h * p);
    for (const l of lames) if (l.z >= 0) lame(l);
    // le masque : la plaque sombre du visage, cerclée d'or
    const tour = []; for (const [a, hy] of [[-1.25, -10], [-0.7, -13], [0, -9], [0.7, -13], [1.25, -10], [1.3, 2], [1.05, 14], [0.5, 22], [0, 25], [-0.5, 22], [-1.05, 14], [-1.3, 2]]) { const q = surf(a, hy); tour.push(P(q[0], q[1], q[2] * 1.02)); }
    if (Math.cos(psi) > -0.2) {
      poly(g, tour); g.fillStyle = lin(g, Hc[0] - 22, Hc[1] - 12, Hc[0] + 18, Hc[1] + 24, ['#2a333f', '#12161c', '#06080b']); g.fill();
      g.strokeStyle = lin(g, Hc[0] - 24, 0, Hc[0] + 24, 0, ['#4a300a', '#eac566', '#fff6cc', '#c99a3c', '#3a2606']); g.lineWidth = 1.8 * p; g.lineJoin = 'round'; g.stroke();
    }
    // les yeux : deux fentes de braise
    for (const e of [-1, 1]) {
      const a0 = e * 0.2, a1 = e * 0.86, pts = [], bas = [];
      for (let k = 0; k <= 5; k++) { const u = k / 5, a = mel(a0, a1, u), q = surf(a, 0); if (vu(a) < 0.08) continue; const up = P(q[0], -1 - u * 5.5 - Math.sin(u * Math.PI) * 2.2, q[2] * 1.03), dn = P(q[0], 2.2 - u * 4.4 + Math.sin(u * Math.PI) * 1.2, q[2] * 1.03); pts.push(up); bas.unshift(dn); }
      if (pts.length < 2) continue;
      const m = P(...surf(e * 0.5, -1).map((v, i) => i === 2 ? v * 1.03 : v));
      halo(m, 20 + S.yeux * 7, '255,56,20', 0.42 * S.yeux + pul * 0.14);
      poly(g, [...pts, ...bas]); g.fillStyle = '#ff3a14'; g.fill(); g.strokeStyle = '#05070a'; g.lineWidth = 0.9; g.stroke();
      const c0 = pts[Math.floor(pts.length / 2)], c1 = bas[Math.floor(bas.length / 2)]; ell(g, (c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2, 2.6 * p * Math.max(0.3, vu(e * 0.5)), 1.5 * p, '#fff2c4');
    }
    // l'arcade : une barre d'or en V, qui lui fait un regard mauvais ; et ses rivets
    const arc = []; for (let k = -6; k <= 6; k++) { const a = k * 0.21, q = surf(a, -9 + Math.abs(k) * -0.6 + (k === 0 ? 5 : 0)); if (vu(a) > 0.02) arc.push(P(q[0], q[1], q[2] * 1.05)); }
    if (arc.length > 1) { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1e1202'; g.lineWidth = 5.4 * p; trait(g, arc); g.stroke(); g.strokeStyle = lin(g, Hc[0] - 24, 0, Hc[0] + 24, 0, ['#5c3e0c', '#eac566', '#fff6cc', '#d6a544', '#5c3e0c']); g.lineWidth = 3.6 * p; trait(g, arc); g.stroke(); }
    for (let k = -5; k <= 5; k++) { const a = k * 0.27 + 0.13; if (vu(a) > 0.2) { const q = surf(a, -17), c = P(q[0], q[1], q[2]); rivet(g, c[0], c[1], 1.1 * p); } }
    // les fissures du casque (quand ses décharges lui reviennent dessus)
    const nf = Math.min(5, E0.fissures || 0);
    if (nf) { g.lineCap = 'round'; for (let i = 0; i < nf; i++) { const rnd = alea(40 + i * 7); let a = (i - 2) * 0.42 + (rnd() - 0.5) * 0.2, hy = -24 + rnd() * 4; const l = []; for (let k = 0; k < 5; k++) { if (vu(a) > 0.05) { const q = surf(a, hy); l.push(P(q[0], q[1], q[2] * 1.02)); } a += (rnd() - 0.5) * 0.3; hy += 3 + rnd() * 4; }
      if (l.length > 1) { g.strokeStyle = 'rgba(255,120,40,.9)'; g.lineWidth = 2.2 * p; trait(g, l); g.stroke(); g.strokeStyle = '#fff6d8'; g.lineWidth = 0.8 * p; trait(g, l); g.stroke(); } } }
    // LE BEC : un grand bec de bronze, crochu. Ses points sont dans l'espace : de face il plonge vers nous, de côté on voit son profil.
    const AR = [[-3, 23, 13.5], [5, 42, 11.5], [17, 57, 8.2], [31, 63, 4.6], [45, 55, 0.4]], DS = [[13, 20], [19, 38], [28, 51], [38, 55]];
    const cote = sd => { const haut = AR.map(([hy, hz]) => P(0, hy, hz)), bord = AR.map(([hy, hz, w], i) => P(sd * w, hy + w * 0.75, hz - w * 0.42)), bas = DS.map(([hy, hz]) => P(0, hy, hz)); return { haut, bord, bas }; };
    const pres = Math.sin(psi) >= 0 ? -1 : 1; // le côté du bec tourné vers nous
    for (const sd of [-pres, pres]) {
      const c = cote(sd), clair = sd === pres ? (Math.abs(Math.sin(psi)) > 0.12 ? 1 : (sd < 0 ? 1 : 0.55)) : 0.45;
      poly(g, [...c.haut, ...c.bord.slice().reverse()]);
      g.fillStyle = lin(g, c.haut[0][0], c.haut[0][1], c.haut[4][0], c.haut[4][1], clair > 0.8 ? ['#fff3c0', '#eac566', '#b8892c', '#6a4810'] : clair > 0.5 ? ['#d6a544', '#a87a22', '#6a4810', '#3a2606'] : ['#8a6018', '#5c3e0c', '#3a2606', '#1e1202']); g.fill(); g.strokeStyle = '#1e1202'; g.lineWidth = 1.1; g.lineJoin = 'round'; g.stroke();
      poly(g, [...c.bord, ...c.bas.slice().reverse()]); g.fillStyle = clair > 0.8 ? '#7a5414' : '#2e1c04'; g.fill(); g.stroke(); // le dessous
      g.strokeStyle = 'rgba(40,22,2,.6)'; g.lineWidth = 0.7; for (const f of [0.4, 0.72]) { trait(g, c.haut.map((h, i) => [mel(h[0], c.bord[i][0], f), mel(h[1], c.bord[i][1], f)])); g.stroke(); } // les gravures
      const n = P(sd * 5.5, 4, 31); ell(g, n[0], n[1], 1.8 * p * Math.max(0.3, Math.abs(Math.cos(psi))), 1.1 * p, '#120a02'); // la narine
    }
    const ar = AR.map(([hy, hz]) => P(0, hy, hz)); g.strokeStyle = '#fffbe6'; g.lineWidth = 1.5 * p; g.lineCap = 'round'; trait(g, ar); g.stroke(); // l'arête, qui brille
    const men = [P(0, 16, 20), P(0, 24, 37), P(0, 36, 47)], mb = [P(-7, 22, 17), P(7, 22, 17)]; // la mandibule du bas
    poly(g, [mb[0], men[0], mb[1], men[1], men[2], men[1]]); g.fillStyle = '#3a2606'; g.fill(); g.strokeStyle = '#1e1202'; g.lineWidth = 0.9; g.stroke();
    return Hc;
  }

  function dessin(now, E0) {
    const pul = E0.pul || 0, c = g;
    c.setTransform(1, 0, 0, 1, 0, 0); if (zone) c.clearRect(zone[0], zone[1], zone[2], zone[3]); else c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(kc, 0, 0, kc, -BOITE.x0 * kc, -BOITE.y0 * kc);
    R = reperes(S);
    c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.ellipse(0, 6, 96, 13, 0, 0, TAU); c.fill();
    cape(S, R, now);
    jambes(S, R);
    const bras = [unBras(S, R, -1), unBras(S, R, 1)], sB = Math.sin(R.psiB);
    const loin = sB >= 0 ? 1 : -1; // l'épaule qui part derrière quand il tourne
    const derriere = b => b.z < 6 && (b.sd === loin || b.z < -14);
    for (const b of bras) if (derriere(b) && b.sd === loin) dessinBras(b);
    const lumL = lanterne(S, R, loin, pul);
    for (const b of bras) if (derriere(b) && b.sd !== loin) dessinBras(b);
    // les hanches : la jupe de plaques, puis la ceinture
    const hY = y => pr(R.ha(0, y, 0));
    bande(T.tassettes, 0, 24, hY(-112), 41, 28, R.psiH, 24); bande(T.tassettes, 24, 22, hY(-88), 50, 34, R.psiH, 26);
    // le buste, de bas en haut (il penche : chaque étage a son milieu)
    const bY = ly => pr(R.bu(0, ly, 0));
    bande(T.ventre, 12, 24, bY(-8), 32, 23, R.psiB, 22);
    bande(T.ceinture, 0, 16, hY(-126), 36, 25, R.psiH, 16); cercle(hY(-126), 36.6, 25.4, 1.6);
    bande(T.ventre, 0, 12, bY(-22), 40, 27, R.psiB, 14); cercle(bY(-22), 40.6, 27.4, 1.4);
    const Pl = bY(-66);
    bande(T.plastron, 0, 40, Pl, 52, 33, R.psiB, 44);
    { const q = Pl[2], x0 = Pl[0], y0 = Pl[1]; // le joug : les épaules bombées, jusqu'au col
      g.beginPath(); g.moveTo(x0 - 52 * q, y0); g.bezierCurveTo(x0 - 50 * q, y0 - 12 * q, x0 - 30 * q, y0 - 17 * q, x0 - 17 * q, y0 - 18 * q); g.lineTo(x0 + 17 * q, y0 - 18 * q); g.bezierCurveTo(x0 + 30 * q, y0 - 17 * q, x0 + 50 * q, y0 - 12 * q, x0 + 52 * q, y0);
      g.ellipse(x0, y0, 52 * q, 33 * E * q, 0, 0, Math.PI); g.closePath();
      g.fillStyle = lin(g, x0 - 52 * q, 0, x0 + 52 * q, 0, [[0, '#07090c'], [0.1, '#2a5a6c'], [0.2, '#55667c'], [0.36, '#6f829a'], [0.5, '#333e4c'], [0.85, '#161b22'], [0.94, '#2a5a6c'], [1, '#07090c']]); g.fill(); g.strokeStyle = '#05070a'; g.lineWidth = 1.1; g.stroke();
      g.strokeStyle = 'rgba(8,10,14,.55)'; g.lineWidth = 0.9 * q; for (const k of [-1, 1]) { g.beginPath(); g.moveTo(x0 + k * 22 * q, y0 - 17 * q); g.quadraticCurveTo(x0 + k * 30 * q, y0 - 4 * q, x0 + k * 26 * q, y0 + 5 * q); g.stroke(); }
      cercle(Pl, 52, 33, 2.4); }
    // un point posé sur le plastron (angle autour du buste, hauteur sous son bord) : là où la texture l'a mis
    const surP = (a, dy) => [Pl[0] + Math.sin(a + R.psiB) * 52 * Pl[2], Pl[1] + (dy + Math.cos(a + R.psiB) * 33 * E) * Pl[2], Pl[2]];
    const kC = Math.cos(R.psiB), coeurC = surP(0, 23);
    if (kC > 0.1) halo(coeurC, 46, '255,206,96', (0.26 + pul * 0.2) * S.lumC * kC);
    bande(T.col, 0, 14, bY(-78), 20, 16, R.psiB, 14, 8); cercle(bY(-78), 20.4, 16.4, 1.6);
    // l'énergie qui circule : des étincelles qui courent des épaules vers le cœur, le long des veines
    for (let i = 0; i < 6; i++) { const u = (now * 0.9 + i / 6) % 1, sd = i % 2 ? 1 : -1, a = sd * mel(1.5, 0.12, u); if (Math.cos(a + R.psiB) > 0.1) halo(surP(a, 21 + Math.sin(u * 16) * 2.5), 7, '255,240,190', 0.95 * Math.sin(u * Math.PI)); }
    const tete = casque(S, R, pul, E0);
    const lumP = lanterne(S, R, -loin, pul);
    const devant = bras.filter(b => !derriere(b)).sort((a, b) => a.z - b.z);
    for (const b of devant) dessinBras(b);
    // sa colère : le rouge de Raban monte dans l'armure
    S._pts = { mainG: bras[0].C, mainD: bras[1].C, tete, lanG: loin < 0 ? lumL : lumP, lanD: loin < 0 ? lumP : lumL, coeur: coeurC };
    // la partie de la toile où il est vraiment (ses mains, ses coudes, ses lanternes, sa crête, sa cape)
    let x0 = -128, x1 = 128, y0 = tete[1] - 78, y1 = 24;
    for (const b of bras) for (const q of [b.B, b.C]) { x0 = Math.min(x0, q[0] - 42 * q[2]); x1 = Math.max(x1, q[0] + 42 * q[2]); y0 = Math.min(y0, q[1] - 58 * q[2]); y1 = Math.max(y1, q[1] + 30 * q[2]); }
    for (const q of [lumL, lumP]) { x0 = Math.min(x0, q[0] - 62); x1 = Math.max(x1, q[0] + 62); y0 = Math.min(y0, q[1] - 62); }
    x0 = Math.max(BOITE.x0, x0 - Math.abs(S.cape) * 30 - 12); x1 = Math.min(BOITE.x0 + BOITE.w, x1 + Math.abs(S.cape) * 30 + 12); y0 = Math.max(BOITE.y0, y0); y1 = Math.min(BOITE.y0 + BOITE.h, y1);
    cadre = [x0, y0, x1 - x0, y1 - y0];
    zone = [Math.floor((x0 - BOITE.x0) * kc) - 2, Math.floor((y0 - BOITE.y0) * kc) - 2, Math.ceil((x1 - x0) * kc) + 4, Math.ceil((y1 - y0) * kc) + 4];
  }

  // ================= ses gestes =================
  // un geste = des images clés [quand (en secondes depuis son moment), ce qui change] ; entre deux, tout glisse
  function geste(cles, t) {
    if (t < cles[0][0] || t > cles[cles.length - 1][0]) return null;
    let i = 0; while (i < cles.length - 2 && t > cles[i + 1][0]) i++;
    const [t0, a] = cles[i], [t1, b] = cles[i + 1], u = doux((t - t0) / Math.max(0.001, t1 - t0)), o = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = mel(k in a ? a[k] : REPOS[k], k in b ? b[k] : REPOS[k], u);
    return o;
  }
  const main = (sd, x, y, z, o) => sd < 0 ? { gx: x, gy: y, gz: z, go: o } : { dx: x, dy: y, dz: z, do_: o };
  const G = {
    // il ENVOIE ses golems : il arme le bras loin derrière en se tournant, puis il le jette vers la place (la main vient vers nous)
    envoi(sd, P) { const lum = sd < 0 ? 'lumG' : 'lumD'; return [[-0.98 * P, {}],
      [-0.5 * P, { cap: 0.44 * sd, tors: 0.24 * sd, tete: -0.52 * sd, penche: -0.1, bas: 5, cape: -0.5, ...main(sd, sd * 108, -112, -22, 0), [lum]: 1.9, yeux: 1.5 }],
      [-0.14 * P, { cap: 0.52 * sd, tors: 0.3 * sd, tete: -0.6 * sd, penche: -0.15, bas: 9, cape: -0.7, ...main(sd, sd * 114, -124, -26, 0), [lum]: 2.3, yeux: 1.8 }],
      [-0.03, { cap: -0.36 * sd, tors: -0.3 * sd, tete: 0.16 * sd, penche: 0.36, bas: 13, cape: 1, ...main(sd, sd * 14, -28, 108, 1), [lum]: 2.4, yeux: 2.2 }],
      [0.32 * P, { cap: -0.3 * sd, tors: -0.2 * sd, tete: 0.1 * sd, penche: 0.26, bas: 9, cape: 0.6, ...main(sd, sd * 4, -6, 84, 1), yeux: 1.5 }],
      [0.98 * P, {}]]; },
    // la DÉCHARGE : la lumière des deux lanternes descend dans ses mains, il la ramène contre lui, puis il la pousse des deux paumes
    decharge(sd, P) { return [[-1.0 * P, {}],
      [-0.58 * P, { gx: -17, gy: -34, gz: 46, dx: 17, dy: -34, dz: 46, go: 1, do_: 1, bas: 11, penche: 0.16, lumG: 2.1, lumD: 2.1, lumC: 2, orbe: 0.55, cape: -0.3, hoche: 0.14 }],
      [-0.16 * P, { gx: -24, gy: -60, gz: 14, dx: 24, dy: -60, dz: 14, go: 1, do_: 1, bas: 6, penche: -0.14, lumG: 2.4, lumD: 2.4, lumC: 2.3, orbe: 1, yeux: 2, cape: -0.7, hoche: -0.12 }],
      [-0.03, { gx: -19, gy: -42, gz: 110, dx: 19, dy: -42, dz: 110, go: 1, do_: 1, bas: 13, penche: 0.38, cape: 1, yeux: 2.3, orbe: 0, lumC: 2 }],
      [0.36 * P, { gx: -24, gy: -28, gz: 86, dx: 24, dy: -28, dz: 86, go: 1, do_: 1, penche: 0.28, bas: 8, cape: 0.5 }],
      [1.0 * P, {}]]; },
    // sa décharge lui revient dans le casque : il part en arrière, les bras qui battent
    touche(sd) { return [[0, { penche: -0.36, tete: 0.62 * sd, hoche: -0.42, bas: 9, roulis: 0.12 * sd, gx: -108, gy: -62, gz: 4, dx: 108, dy: -70, dz: -4, go: 1, do_: 1, cape: -1, yeux: 2.6 }],
      [0.3, { penche: -0.22, tete: -0.3 * sd, roulis: -0.1 * sd, bas: 12, gx: -96, gy: -30, gz: 16, dx: 92, dy: -22, dz: 12, go: 1, do_: 1, yeux: 0.4 }], [0.75, { penche: 0.16, bas: 9, yeux: 0.5 }]]; },
    // « ASSEZ ! SILENCE ! » : les deux poings au ciel, puis il les abat et frappe du pied
    silence() { return [[0, {}], [0.2, { gx: -64, gy: -152, gz: 12, dx: 64, dy: -152, dz: 12, penche: -0.18, hoche: -0.34, bas: 4, yeux: 2.4, cape: -0.5, pied: 1, lumC: 2.2 }],
      [0.5, { gx: -70, gy: -158, gz: 6, dx: 70, dy: -158, dz: 6, penche: -0.22, hoche: -0.4, bas: 2, yeux: 2.6, pied: 1, lumC: 2.4 }],
      [0.64, { gx: -36, gy: 4, gz: 62, dx: 36, dy: 4, dz: 62, penche: 0.44, hoche: 0.2, bas: 19, yeux: 2.2, cape: 1, pied: 0 }],
      [1.3, { gx: -34, gy: 8, gz: 56, dx: 34, dy: 8, dz: 56, penche: 0.36, bas: 15, yeux: 1.8, cape: 0.3 }], [1.9, {}]]; },
    // un petit sursaut quand la fête lui tombe dessus
    sursaut(sd) { return [[0, { penche: -0.16, tete: 0.3 * sd, bas: 5, yeux: 2.4, roulis: 0.05 * sd }], [0.28, {}]]; },
  };
  const file = []; // les gestes en cours : { cles, t0 }
  function jouer(nom, t0, sd = 1, P = 0.5) { if (file.some(f => f.nom === nom && Math.abs(f.t0 - t0) < 0.06)) return; file.push({ nom, t0, cles: G[nom](sd, P) }); if (file.length > 6) file.shift(); }

  // E0 : { pul, P, mode ('combat', 'silence', 'relance', 'victoire'), oreilles, malTete, sonne, colere, fissures }
  function maj(now, E0, dt) {
    const C = { ...REPOS }, pul = E0.pul || 0;
    // sa vie au repos : il respire, il se balance, sa tête surveille la place
    C.cap = 0.09 * Math.sin(now * 0.47); C.tors = 0.05 * Math.sin(now * 0.71 + 1); C.tete = 0.4 * Math.sin(now * 0.31) + 0.1 * Math.sin(now * 0.87 + 2);
    C.bas = 1.5 + Math.sin(now * 1.5) * 1.2 + pul * 1.6; C.hoche = 0.03 + pul * 0.04; C.gz = 6 + Math.sin(now * 0.9) * 3; C.dz = 6 + Math.sin(now * 0.9 + 2) * 3;
    C.lumG = C.lumD = C.lumC = 1 + pul * 0.35; C.yeux = 1 + (E0.colere || 0) * 0.6;
    // IL BAT LA MESURE (Romain, 24 nov., 22 h 25) : la tête hoche, les genoux plient, les épaules balancent d'un côté puis de l'autre, un
    // pied se lève et retombe pile sur le temps. Au refrain, bien plus fort : il tourne la tête d'un côté à l'autre et pompe des poings.
    if (E0.mode === 'combat' && E0.phase != null) {
      const m = E0.mega || 0, cote = (E0.n || 0) % 2 ? 1 : -1, ph = E0.phase, leve = ph > 0.5 ? Math.sin((ph - 0.5) * 2 * Math.PI) : 0;
      C.hoche += pul * (0.1 + 0.12 * m); C.bas += pul * (3 + 5 * m); C.roulis += cote * (0.025 + 0.055 * m) * Math.cos(ph * Math.PI); C.pied = leve * (0.35 + 0.3 * m);
      if (m > 0.3) { C.tete = cote * 0.34 * m; C.gy -= pul * 20 * m; C.dy -= pul * 20 * m; C.go = 1; C.do_ = 1; C.penche += pul * 0.06 * m; }
      // AU DERNIER ACTE, IL DANSE À FOND, malgré lui (Romain, 23 h 23 : « une danse de techno […] et pareil pour le maire […] ils sont à
      // fond ») : la tête baissée qui part d'un côté puis de l'autre, un poing levé bien haut qui pompe à chaque temps (il change de bras
      // tous les quatre temps), l'autre poing qui cogne en bas, les genoux qui plient fort, les épaules qui roulent, la cape qui claque.
      if (E0.folie) {
        const haut = ((E0.n || 0) >> 2) % 2 ? 'd' : 'g', bas = haut === 'g' ? 'd' : 'g', sg = haut === 'g' ? -1 : 1;
        C.tete = cote * 0.62; C.hoche = 0.2 + pul * 0.24; C.penche = 0.13 + pul * 0.08; C.bas = 3 + pul * 11; C.roulis = cote * 0.1 * Math.cos(ph * Math.PI); C.tors = cote * 0.12; C.pied = leve * 0.75; C.cape = -0.8 * pul;
        C[haut + 'x'] = sg * 70; C[haut + 'y'] = -128 - pul * 34; C[haut + 'z'] = 10; C[bas + 'x'] = -sg * 62; C[bas + 'y'] = -34 - pul * 26; C[bas + 'z'] = 26; C.go = 1; C.do_ = 1; C.lumC = 1.6 + pul;
      }
    }
    if (E0.colere > 0.5) C.roulis += Math.sin(now * 31) * 0.008 * E0.colere;
    if (E0.mode === 'relance' && !E0.oreilles) Object.assign(C, { gx: 20, gy: -30, gz: 38, dx: -18, dy: -20, dz: 44, tete: 0.12 * Math.sin(now * 0.6), hoche: 0.12, pied: pul > 0.5 ? 0.25 : 0, penche: 0.0 }); // les bras croisés, il tape du pied
    if (E0.oreilles) Object.assign(C, { gx: -31, gy: -98, gz: 13, dx: 31, dy: -98, dz: 13, go: 0, do_: 0, penche: 0.15, bas: 6 + pul * 4, tete: 0.26 * Math.sin(now * 8.5), hoche: 0.16, roulis: 0.05 * Math.sin(now * 4.2), yeux: 0.7 }); // il se bouche les oreilles
    if (E0.malTete) Object.assign(C, { gx: -27, gy: -113, gz: 15, dx: 27, dy: -113, dz: 15, go: 1, do_: 1, penche: 0.12, bas: 11, tete: 0.22 * Math.sin(now * 1.1), roulis: 0.11 * Math.sin(now * 1.7), hoche: 0.2 + 0.08 * Math.sin(now * 2.3), yeux: 0.45 + 0.2 * Math.sin(now * 5), lumG: 0.5, lumD: 0.5, lumC: 0.5, cap: 0.1 * Math.sin(now * 0.8) }); // il se tient la tête
    else if (E0.sonne) Object.assign(C, { penche: 0.17, bas: 9, tete: 0.34 * Math.sin(now * 3), roulis: 0.07 * Math.sin(now * 2.2), gx: -78, gy: 34, gz: 12, dx: 78, dy: 34, dz: 12, yeux: 0.4 + 0.2 * Math.sin(now * 9), lumG: 0.6, lumD: 0.6, lumC: 0.6, hoche: 0.22 });
    if (E0.pose) Object.assign(C, E0.pose);   // (combat de l'armure, phase 2 : sa pose du moment, décidée par le jeu)
    for (let i = file.length - 1; i >= 0; i--) { const f = file[i], o = geste(f.cles, now - f.t0); if (o) Object.assign(C, o); else if (now - f.t0 > f.cles[f.cles.length - 1][0]) file.splice(i, 1); }
    if (!S) S = { ...C };
    for (const k in REPOS) S[k] += (C[k] - S[k]) * (1 - Math.exp(-VIT[k] * Math.min(0.1, dt)));
  }

  // ================= pour le jeu =================
  function construire(K0, gk0) { K = Math.min(2, Math.max(1, K0)); gk = gk0; kc = Math.min(2.3, K0 * gk0); matieres(); cv = toile(BOITE.w * kc, BOITE.h * kc); g = cv.getContext('2d'); tDessin = -9; zone = null; cadre = null; }
  let tMaj = 0;
  function rafraichir(now, E0, ips = 20) { // à appeler à chaque image : il ne se redessine que « ips » fois par seconde
    if (!cv) return; const dt = Math.max(0, now - tMaj); tMaj = now; maj(now, E0, dt);
    if (now - tDessin >= 1 / ips || now < tDessin) { tDessin = now; dessin(now, E0); if (E0.teinte) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = E0.teinte; g.fillRect(0, 0, cv.width, cv.height); g.restore(); } }
  }
  function dessiner(c, x, y) { // on ne recopie que la partie utile
    if (!cv || !cadre) return; const [a, b, w, h] = cadre;
    c.drawImage(cv, (a - BOITE.x0) * kc, (b - BOITE.y0) * kc, w * kc, h * kc, x + a * gk, y + b * gk, w * gk, h * gk);
  }
  function point(nom, x, y) { const q = S && S._pts && S._pts[nom]; return q ? { x: x + q[0] * gk, y: y + q[1] * gk, p: q[2] } : { x, y: y - 150 * gk, p: 1 }; }
  // une seule image, pour une planche ou une illustration (o : une pose, E0 : son état)
  function image(c, o, E0 = {}, now = 0) { S = { ...REPOS, ...o }; zone = null; dessin(now, { pul: 0, ...E0 }); c.drawImage(cv, BOITE.x0, BOITE.y0, BOITE.w, BOITE.h); }
  return { construire, rafraichir, dessiner, point, jouer, image, geste, G, REPOS, HAUT, get S() { return S; }, get orbe() { return S ? S.orbe : 0; }, get gk() { return gk; } };
})();
