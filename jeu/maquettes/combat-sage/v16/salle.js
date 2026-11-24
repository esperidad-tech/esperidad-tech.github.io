// ----- la grande salle de Grosbec, vue de haut (peinte une seule fois) : la même que devant le Barde -----
// Le mur du fond et sa grande arche ouverte sur la ville d'en bas (floue), les deux portes de bronze et leurs lanternes,
// les dalles polies à losanges de bronze, l'allée et ses rigoles d'or, la rosace, l'estrade ; sur les côtés, les galeries d'où sautent les golems.
function makeBg() {
  const { lin, rad, poly, trait, ell, alea, toile } = Ou;
  const c = mk(cv.width, cv.height), g = c.getContext('2d'), { k, ox, oy } = view(), r = alea(4242);
  const BRZ = ['#b3925c', '#5d4831', '#1f1711'], OR = '#f4d27c', CX = 450, WB = 25, MT = -178, DX = 75, DY = 56.25;
  g.setTransform(k, 0, 0, k, ox, oy);
  g.fillStyle = '#03060a'; g.fillRect(-ox / k - 4, -oy / k - 4, cv.width / k + 8, cv.height / k + 8);
  R8.lampes = [];

  // ---------- le sol : de grandes dalles polies ----------
  g.save(); g.beginPath(); g.rect(0, WB - 2, 900, 902 - WB); g.clip();
  g.fillStyle = lin(g, 0, WB, 0, 900, ['#2a5262', '#1d3d4e', '#132a3a', '#0c1b27']); g.fillRect(0, WB - 2, 900, 902);
  g.save(); g.translate(CX, WB + 20); g.scale(1, 0.8); g.fillStyle = rad(g, 0, 0, 20, 560, ['rgba(150,238,246,.36)', 'rgba(110,210,228,.14)', 'rgba(110,210,228,0)']); g.fillRect(-600, -40, 1200, 760); g.restore();
  for (let j = 0; j < 16; j++) for (let i = 0; i < 12; i++) {
    const xa = i * DX, ya = j * DY, mx = xa + DX / 2, my = ya + DY / 2;
    g.fillStyle = (i + j) % 2 ? `rgba(255,255,255,${0.015 + r() * 0.04})` : `rgba(0,0,0,${0.05 + r() * 0.12})`; g.fillRect(xa, ya, DX, DY);
    g.strokeStyle = 'rgba(2,7,11,.8)'; g.lineWidth = 1.6; g.strokeRect(xa, ya, DX, DY);
    g.strokeStyle = `rgba(175,236,246,${0.06 + 0.22 * Math.max(0, 1 - Math.hypot((mx - CX) / 520, (my - WB) / 640))})`; g.lineWidth = 1.2; trait(g, [[xa + 2, ya + DY - 2], [xa + 2, ya + 2], [xa + DX - 2, ya + 2]]); g.stroke();
    if ((i + j) % 2 === 0) { poly(g, [[mx, my - 6.5], [mx + 9, my], [mx, my + 6.5], [mx - 9, my]]); g.fillStyle = 'rgba(93,72,49,.6)'; g.fill(); g.strokeStyle = 'rgba(244,210,124,.35)'; g.lineWidth = 1; g.stroke(); }   // un losange de bronze incrusté
    else if (r() < 0.3) { g.strokeStyle = 'rgba(2,7,11,.6)'; g.lineWidth = 1.2; const p0 = [mx + (r() - 0.5) * 40, ya + 3]; trait(g, [p0, [p0[0] + (r() - 0.5) * 22, my], [p0[0] + (r() - 0.5) * 30, ya + DY - 3]]); g.stroke(); }   // une fêlure
    for (let n = 0; n < 6; n++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.14)'; g.fillRect(xa + r() * DX, ya + r() * DY, 2.2, 1.4); }   // le grain
  }
  // l'allée de bronze, de l'estrade de Grosbec à la rosace des amis, bordée de deux rigoles d'or
  const AL = 62, yR = 445 - 76;
  g.fillStyle = 'rgba(60,44,28,.24)'; g.fillRect(CX - AL, WB, AL * 2, yR - WB);
  g.strokeStyle = 'rgba(244,210,124,.26)'; g.lineWidth = 1.3; for (let y = 150; y < yR - 10; y += DY / 2) { trait(g, [[CX - AL * 0.8, y + 9], [CX, y - 6], [CX + AL * 0.8, y + 9]]); g.stroke(); }
  g.strokeStyle = 'rgba(244,210,124,.32)'; g.lineWidth = 2; for (const sx of [-1, 1]) { trait(g, [[CX + sx * AL, 118], [CX + sx * AL, yR]]); g.stroke(); }
  // les reflets sur les dalles : la lueur de la ville, tout droit sous l'arche ; le rouge des forges devant les portes
  for (let i = -11; i < 11; i++) { const u = (i + 0.5) / 22, a = 0.24 * Math.exp(-u * u * 22), xa = CX + u * 620; g.fillStyle = lin(g, 0, WB, 0, 480, [`rgba(170,242,248,${a})`, `rgba(170,242,248,${a * 0.35})`, 'rgba(170,242,248,0)']); g.fillRect(xa - 14.5, WB, 29, 455); }
  for (const [pa, pb] of G.PORTES) { const px = (pa + pb) / 2, pw = pb - pa + 12;
    poly(g, [[px - pw / 2, WB], [px + pw / 2, WB], [px + pw / 2 + 55, WB + 170], [px - pw / 2 - 55, WB + 170]]); g.fillStyle = lin(g, 0, WB, 0, WB + 170, ['rgba(255,140,60,.40)', 'rgba(255,90,40,.13)', 'rgba(255,90,40,0)']); g.fill();
    g.save(); g.translate(px, WB + 26); g.scale(1, 0.4); g.fillStyle = rad(g, 0, 0, 3, 110, ['rgba(255,200,110,.30)', 'rgba(255,170,70,0)']); g.fillRect(-112, -112, 224, 224); g.restore(); }
  // la rosace, au milieu, sous les amis : des cercles d'or gravés, des rayons ; une nappe dorée l'éclaire, comme un projecteur
  const RX = 104, RY = 78;
  g.save(); g.translate(CX, 445); g.scale(1, 0.75); g.fillStyle = rad(g, 0, 0, 8, 270, ['rgba(255,222,140,.26)', 'rgba(255,210,120,.09)', 'rgba(255,210,120,0)']); g.fillRect(-280, -280, 560, 560); g.restore();
  ell(g, CX, 445, RX, RY, 'rgba(93,72,49,.5)'); g.strokeStyle = 'rgba(244,210,124,.55)'; g.lineWidth = 1.8; g.stroke(); ell(g, CX, 445, RX * 0.72, RY * 0.72); g.stroke(); ell(g, CX, 445, RX * 0.34, RY * 0.34, 'rgba(20,40,52,.7)'); g.stroke();
  g.lineWidth = 1.2; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; trait(g, [[CX + Math.cos(a) * RX * 0.34, 445 + Math.sin(a) * RY * 0.34], [CX + Math.cos(a) * RX * (i % 2 ? 0.72 : 1), 445 + Math.sin(a) * RY * (i % 2 ? 0.72 : 1)]]); g.stroke(); }
  // l'estrade de Grosbec, au pied de l'arche : trois marches rondes, cerclées d'or
  for (let n = 0; n < 3; n++) { const er = 152 - n * 15, ey = WB + 8 - n * 5;
    g.beginPath(); g.ellipse(CX, ey + 6, er, er * 0.62, 0, 0, Math.PI); g.closePath(); g.fillStyle = '#070b10'; g.fill();
    g.beginPath(); g.ellipse(CX, ey, er, er * 0.62, 0, 0, Math.PI); g.closePath(); g.fillStyle = lin(g, CX - er, 0, CX + er, 0, ['#1a2a36', '#3d5b6c', '#2a4352', '#111d27']); g.fill(); g.strokeStyle = 'rgba(244,210,124,.5)'; g.lineWidth = 1.4; g.stroke(); }
  // la lumière : les rayons qui tombent de l'arche, puis l'ombre qui gagne vers nous et sur les côtés
  for (let i = 0; i < 6; i++) { const a0 = -0.62 + i * 0.25 + (r() - 0.5) * 0.06, la = 0.07 + r() * 0.05, len = 430 * (0.75 + r() * 0.3), sx = CX + Math.sin(a0) * 75, sy = WB; poly(g, [[sx - 8, sy], [sx + 8, sy], [sx + Math.sin(a0 + la) * len, sy + len], [sx + Math.sin(a0 - la) * len, sy + len]]); g.fillStyle = lin(g, 0, sy, 0, sy + len, ['rgba(190,250,250,.11)', 'rgba(170,240,246,.04)', 'rgba(170,240,246,0)']); g.fill(); }
  g.fillStyle = lin(g, 0, 430, 0, 900, ['rgba(2,6,10,0)', 'rgba(2,6,10,.34)']); g.fillRect(0, 430, 900, 470);
  g.fillStyle = lin(g, 0, 0, 900, 0, [[0, 'rgba(2,6,10,.38)'], [0.18, 'rgba(2,6,10,0)'], [0.82, 'rgba(2,6,10,0)'], [1, 'rgba(2,6,10,.38)']]); g.fillRect(0, WB, 900, 900 - WB);
  g.restore();

  // ---------- les galeries des côtés (les golems en sautent) et le bas de la salle, vus d'en haut ----------
  const murs = [(a, d, la, ld) => [-d - ld, a, ld, la], (a, d, la, ld) => [900 + d, a, ld, la], (a, d, la, ld) => [a, 900 + d, la, ld]];
  murs.forEach((M, i) => {
    const a0 = i < 2 ? WB : -76, a1 = i < 2 ? 900 : 976, L = a1 - a0, F = (col, a, d, la, ld) => { g.fillStyle = col; g.fillRect(...M(a, d, la, ld)); };
    F('#070506', a0, 0, L, 58); F('rgba(170,36,12,.30)', a0, 6, L, 16); F('rgba(140,24,8,.16)', a0, 22, L, 16);                      // la galerie, dans l'ombre : le rouge des forges
    F('#0d1a25', a0, 58, L, 18); F('rgba(150,215,235,.07)', a0, 58, L, 1.5); for (let a = a0 + 30; a < a1; a += 46) F('rgba(2,6,10,.7)', a, 58, 1.2, 18);   // le mur, derrière
    F(BRZ[1], a0, 0, L, 6.5); F('rgba(244,210,124,.55)', a0, 0, L, 1.3); F('rgba(2,6,10,.8)', a0, 6.5, L, 1.2);                        // la corniche de bronze
    for (let a = i < 2 ? 150 : 75; a < a1 - 20; a += 150) { F('#1c3040', a - 11, 5, 22, 53); F('#3f6276', a - 11, 5, 4, 53); F('rgba(2,6,10,.7)', a + 10, 5, 1.2, 53); F(BRZ[0], a - 13, 0, 26, 8); F('rgba(244,210,124,.75)', a - 13, 0, 26, 1.3); F('rgba(2,6,10,.8)', a - 13, 8, 26, 1.2); }   // ses piliers
  });

  // ---------- le mur du fond : de grandes pierres bleu nuit ; il est écrasé par la hauteur d'où on regarde, mais c'est le même ----------
  g.fillStyle = lin(g, 0, MT, 0, WB, ['#070f17', '#12222f', '#1b3242']); g.fillRect(-90, MT - 70, 1080, WB - MT + 70);
  for (let yy = WB - 19, n = 0; yy > MT - 70; yy -= 19, n++) for (let xx = -90 + (n % 2) * 23; xx < 990; xx += 46) {
    g.fillStyle = r() < 0.5 ? `rgba(255,255,255,${r() * 0.045})` : `rgba(0,0,0,${r() * 0.16})`; g.fillRect(xx, yy, 46, 19);
    g.strokeStyle = 'rgba(2,6,10,.6)'; g.lineWidth = 1; g.strokeRect(xx, yy, 46, 19); g.strokeStyle = 'rgba(150,215,235,.07)'; trait(g, [[xx + 1, yy + 18], [xx + 1, yy + 1], [xx + 45, yy + 1]]); g.stroke();
  }
  // la ville d'en bas, au loin : peinte petite, puis agrandie → floue (trois rangs de tours dans la brume, leurs fenêtres, le grand cristal)
  function ville(w, h, graine) {
    const q = 0.5, a = toile(w * k * q, h * k * q), x = a.getContext('2d'), rr = alea(graine); x.scale(k * q, k * q);
    x.fillStyle = lin(x, 0, 0, 0, h, ['#051626', '#0b3048', '#1b6a82', '#86dcdc']); x.fillRect(0, 0, w, h);
    x.fillStyle = rad(x, w * 0.5, h * 0.08, 2, h * 0.95, ['rgba(225,255,250,.9)', 'rgba(125,232,236,.4)', 'rgba(60,160,190,0)']); x.fillRect(0, 0, w, h);
    for (let rang = 0; rang < 3; rang++) {
      const base = h * (0.6 + rang * 0.15);
      for (let i = 0; i < 9; i++) {
        const tw = (9 + rr() * 15) * (1 + rang * 0.35), tx = (i + rr() * 0.8) * w / 8 - tw / 2, th = (26 + rr() * 64) * (1 + rang * 0.25);
        x.fillStyle = ['#479aaa', '#1f5c74', '#0c2c42'][rang]; x.fillRect(tx, base - th, tw, th + h);
        if (rr() < 0.6) { poly(x, [[tx - 2, base - th], [tx + tw / 2, base - th - tw * (0.6 + rr())], [tx + tw + 2, base - th]]); x.fill(); } else { x.beginPath(); x.arc(tx + tw / 2, base - th, tw / 2, Math.PI, 0); x.fill(); }
        x.fillStyle = rang === 2 ? 'rgba(255,214,120,.95)' : 'rgba(195,250,255,.8)'; for (let n = 0; n < 7; n++) if (rr() < 0.55) x.fillRect(tx + 2 + rr() * (tw - 5), base - th + 6 + rr() * (th - 8), 1.8, 2.6);
      }
      x.fillStyle = `rgba(115,222,228,${0.18 - rang * 0.05})`; x.fillRect(0, base - 34, w, 68);
    }
    for (let i = 0; i < 4; i++) { const fx = w * (0.1 + 0.26 * i + rr() * 0.08); x.fillStyle = lin(x, 0, h * 0.15, 0, h * 0.8, ['rgba(205,255,250,.75)', 'rgba(120,230,240,0)']); x.fillRect(fx, h * 0.15, 2.4, h * 0.65); }
    for (let i = 0; i < 18; i++) { const bx = rr() * w, by = h * (0.25 + rr() * 0.65), br = 3 + rr() * 7; x.fillStyle = rad(x, bx, by, 0, br, [rr() < 0.5 ? 'rgba(255,222,135,.75)' : 'rgba(175,250,255,.65)', 'rgba(255,255,255,0)']); x.fillRect(bx - br, by - br, br * 2, br * 2); }
    const b = toile(a.width * 0.42, a.height * 0.42); b.getContext('2d').drawImage(a, 0, 0, b.width, b.height);
    const o = toile(w * k, h * k), o2 = o.getContext('2d'); o2.imageSmoothingEnabled = true; o2.drawImage(b, 0, 0, o.width, o.height);
    return o;
  }
  // la grande arche, derrière Grosbec
  const AW = 150, AS = -40, AR = 74, AB = WB - 8, HV = AB - (AS - AR);
  const arche = () => { g.beginPath(); g.moveTo(CX - AW, AB); g.lineTo(CX - AW, AS); g.ellipse(CX, AS, AW, AR, 0, Math.PI, 0); g.lineTo(CX + AW, AB); g.closePath(); };
  const V = ville(AW * 2, 250, 5);
  g.save(); arche(); g.clip(); g.drawImage(V, CX - AW, AS - AR, AW * 2, HV);
  g.fillStyle = lin(g, 0, AB - 40, 0, AB, ['rgba(8,20,30,0)', 'rgba(8,20,30,.55)']); g.fillRect(CX - AW, AB - 40, AW * 2, 40); g.restore();
  g.save(); g.translate(CX, AS); g.scale(1, 0.62); g.fillStyle = rad(g, 0, 0, AW * 0.9, AW * 2.1, ['rgba(140,235,245,.26)', 'rgba(120,220,235,.09)', 'rgba(120,220,235,0)']); g.fillRect(-AW * 2.2, -AW * 2.2, AW * 4.4, AW * 4.4); g.restore();   // la lueur de la ville, sur le mur
  arche(); g.strokeStyle = '#05080b'; g.lineWidth = 16; g.stroke(); g.strokeStyle = lin(g, CX - AW, AS - AR, CX + AW, AB, ['#8a7046', '#4a3a28', '#2a2018']); g.lineWidth = 12; g.stroke();
  g.strokeStyle = 'rgba(244,210,124,.7)'; g.lineWidth = 1.2; for (const d of [5.5, -5.5]) { g.beginPath(); g.ellipse(CX, AS, AW + d, AR + d, 0, Math.PI, 0); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1; for (let i = 0; i <= 16; i++) { const a = Math.PI + i * Math.PI / 16, ca = Math.cos(a), sa = Math.sin(a); trait(g, [[CX + ca * (AW - 5.5), AS + sa * (AR - 5.5)], [CX + ca * (AW + 5.5), AS + sa * (AR + 5.5)]]); g.stroke(); }
  for (let i = 0; i < 5; i++) {   // cinq cristaux sur l'arc
    const a = Math.PI + (i + 0.5) * Math.PI / 5, qx = CX + Math.cos(a) * AW, qy = AS + Math.sin(a) * AR;
    g.save(); g.translate(qx, qy); g.rotate(Math.atan2(Math.sin(a) * AW, Math.cos(a) * AR) + Math.PI / 2); g.shadowColor = 'rgba(150,245,255,1)'; g.shadowBlur = 9 * k; poly(g, [[0, -8], [5, 0], [0, 8], [-5, 0]]); g.fillStyle = lin(g, -4, -6, 4, 6, ['#f2ffff', '#8fe8f2', '#2b8fa8']); g.fill(); g.shadowBlur = 0; g.strokeStyle = '#05080b'; g.lineWidth = 1; g.stroke(); g.restore();
  }
  g.fillStyle = lin(g, 0, AB - 5, 0, WB, ['#3c2f20', '#17110c']); g.fillRect(CX - AW - 8, AB - 5, AW * 2 + 16, WB - AB + 6); g.fillStyle = OR; g.globalAlpha = 0.6; g.fillRect(CX - AW - 8, AB - 5, AW * 2 + 16, 1.4); g.globalAlpha = 1;   // le garde-corps
  for (const c2 of [-1, 1]) {     // deux pilastres, de chaque côté de l'arche
    const px = CX + c2 * (AW + 19);
    g.fillStyle = lin(g, px - 9, 0, px + 9, 0, ['#0b1620', '#2f4a5c', '#3f6276', '#1a2c3a', '#0a131b']); g.fillRect(px - 9, MT - 70, 18, WB - MT + 70);
    g.strokeStyle = 'rgba(2,6,10,.8)'; g.lineWidth = 1.2; g.strokeRect(px - 9, MT - 72, 18, WB - MT + 72);
    for (const yy of [WB - 7, AS, AS - 10]) { g.fillStyle = lin(g, 0, yy - 4, 0, yy + 4, BRZ); g.fillRect(px - 11, yy - 4, 22, 8); g.strokeRect(px - 11, yy - 4, 22, 8); g.fillStyle = OR; g.globalAlpha = 0.7; g.fillRect(px - 11, yy - 4, 22, 1); g.globalAlpha = 1; }
  }
  // un vantail de porte : du bronze sombre, des clous d'or, des ferrures
  function vantail(x, w, h) {
    x.beginPath(); x.moveTo(0, h); x.lineTo(0, w * 0.9); x.quadraticCurveTo(0, 0, w, 0); x.lineTo(w, h); x.closePath();
    x.fillStyle = lin(x, 0, 0, w, h, ['#6d5638', '#3a2c1f', '#17110c']); x.fill(); x.save(); x.clip();
    x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(0, 0, w * 0.35, h); x.fillStyle = 'rgba(255,70,20,.22)'; x.fillRect(w - 3, 0, 3, h);
    x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 1; for (let i = 1; i < 4; i++) { trait(x, [[w * i / 4, 0], [w * i / 4, h]]); x.stroke(); }
    for (const yy of [0.3, 0.58, 0.86]) { x.fillStyle = lin(x, 0, h * yy - 4, 0, h * yy + 4, BRZ); x.fillRect(0, h * yy - 3.5, w, 7); x.strokeStyle = 'rgba(0,0,0,.6)'; x.strokeRect(0, h * yy - 3.5, w, 7); for (let i = 0; i < 4; i++) ell(x, w * (i + 0.5) / 4, h * yy, 1.3, 1.3, OR); }
    x.restore(); x.strokeStyle = '#05070a'; x.lineWidth = 1.4; x.stroke();
  }
  // les deux portes de bronze, grandes ouvertes sur le rouge des forges (les golems du haut sortent par là), leur frise, leur lanterne
  for (const [pa, pb] of G.PORTES) {
    const px = (pa + pb) / 2, pw = pb - pa + 12, ph = 86, py = WB;
    const cadre = d => { g.beginPath(); g.moveTo(px - pw / 2 - d, py); g.lineTo(px - pw / 2 - d, py - ph + 34); g.quadraticCurveTo(px - pw / 2 - d, py - ph - d, px, py - ph - d); g.quadraticCurveTo(px + pw / 2 + d, py - ph - d, px + pw / 2 + d, py - ph + 34); g.lineTo(px + pw / 2 + d, py); g.closePath(); };
    cadre(6); g.fillStyle = '#05080b'; g.fill(); g.strokeStyle = lin(g, px - pw, py - ph, px + pw, py, ['#8a7046', '#3c2f20']); g.lineWidth = 3.5; g.stroke(); g.strokeStyle = 'rgba(244,210,124,.55)'; g.lineWidth = 1; g.stroke();
    cadre(0); g.fillStyle = rad(g, px, py - ph * 0.15, 4, ph * 1.3, ['#fff0c0', '#ff9a3a', '#c8300c', '#3a0804']); g.fill();
    g.save(); cadre(0); g.clip();
    for (const c2 of [-1, 1]) { g.save(); g.translate(px + c2 * pw / 2, py - ph); g.scale(-c2 * 0.3, 1); vantail(g, pw / 2, ph); g.restore(); }   // les deux vantaux, ouverts, vus par la tranche
    g.restore();
    const zy = py - ph - 13, zw = 236;
    g.fillStyle = lin(g, 0, zy - 4, 0, zy + 4, BRZ); g.fillRect(px - zw / 2, zy - 4, zw, 8); g.strokeStyle = 'rgba(2,6,10,.8)'; g.lineWidth = 1; g.strokeRect(px - zw / 2, zy - 4, zw, 8);
    g.strokeStyle = 'rgba(244,210,124,.7)'; g.lineWidth = 0.9; g.beginPath(); for (let zx = px - zw / 2 + 4; zx < px + zw / 2 - 7; zx += 6) { g.moveTo(zx, zy + 2.5); g.lineTo(zx + 3, zy - 2.5); g.lineTo(zx + 6, zy + 2.5); } g.stroke();
    const ly = zy - 27;
    g.strokeStyle = '#05080b'; g.lineWidth = 2; trait(g, [[px, ly - 18], [px, ly - 8]]); g.stroke();
    g.shadowColor = 'rgba(255,200,90,1)'; g.shadowBlur = 12 * k; poly(g, [[px - 7, ly - 7], [px + 7, ly - 7], [px + 5, ly + 9], [px - 5, ly + 9]]); g.fillStyle = lin(g, 0, ly - 7, 0, ly + 9, ['#fff6cf', '#ffc75a', '#e07a1c']); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = '#17110c'; g.lineWidth = 1.2; g.stroke(); poly(g, [[px - 9, ly - 7], [px, ly - 14], [px + 9, ly - 7]]); g.fillStyle = BRZ[1]; g.fill(); g.stroke(); g.fillStyle = BRZ[1]; g.fillRect(px - 7, ly + 9, 14, 3);
    g.fillStyle = rad(g, px, ly, 2, 84, ['rgba(255,200,100,.30)', 'rgba(255,170,70,.08)', 'rgba(255,170,70,0)']); g.fillRect(px - 84, ly - 84, 168, 168);
    R8.lampes.push({ x: px, y: ly });
  }
  // les colonnes des coins, rondes, cerclées de bronze, et leur cristal
  for (const cx of [0, 900]) {
    g.fillStyle = lin(g, cx - 13, 0, cx + 13, 0, ['#070e15', '#243c4c', '#4a7186', '#1c3040', '#070e15']); g.fillRect(cx - 13, MT - 70, 26, WB - MT + 74);
    g.strokeStyle = 'rgba(2,6,10,.85)'; g.lineWidth = 1.3; g.strokeRect(cx - 13, MT - 72, 26, WB - MT + 76);
    for (let yy = WB - 3; yy > MT - 70; yy -= 50) { g.fillStyle = lin(g, cx - 15, 0, cx + 15, 0, [BRZ[2], BRZ[0], BRZ[1], BRZ[2]]); g.fillRect(cx - 15, yy - 5, 30, 9); g.strokeRect(cx - 15, yy - 5, 30, 9); g.fillStyle = OR; g.globalAlpha = 0.7; g.fillRect(cx - 15, yy - 5, 30, 1); g.globalAlpha = 1; }
    const ly = -80; g.shadowColor = 'rgba(150,245,255,1)'; g.shadowBlur = 10 * k; poly(g, [[cx, ly - 9], [cx + 5.5, ly], [cx, ly + 9], [cx - 5.5, ly]]); g.fillStyle = '#c9fbff'; g.fill(); g.shadowBlur = 0; g.strokeStyle = '#05080b'; g.lineWidth = 1; g.stroke();
  }
  g.fillStyle = lin(g, 0, MT - 70, 0, -120, ['rgba(2,5,9,.94)', 'rgba(2,5,9,.9)', 'rgba(2,5,9,0)']); g.fillRect(-90, MT - 70, 1080, -120 - (MT - 70));   // le haut du mur se perd dans l'ombre
  return c;
}
