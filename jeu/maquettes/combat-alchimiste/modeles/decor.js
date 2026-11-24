// ===== LE DÉCOR : la grande salle de la ville d'en bas (version 9 — Romain, 24 nov., 21 h : « plus d'effets de lumière, le fond un peu
// flou, de la perspective, des jolis éclairages ; une salle et un sol dans le style des textures de Grosbec et du Barde ») =====
// Une salle vue en perspective (tout fuit vers le même point, loin au-dessus) : le mur du fond, sa grande arche ouverte sur la ville
// (peinte petite puis agrandie : elle est FLOUE, comme en photo), deux portes de bronze par où sortent les golems, les murs de côté,
// un sol de dalles polies qui reflète les lumières. Tout est peint UNE FOIS dans une grande toile ; ensuite on la recopie.
const Decor = (() => {
  const { TAU, toile, alea, lin, rad, poly, trait, ell, sprite, poser, lueur, mel, borne } = Ou;
  const COUL = ['255,90,140', '90,210,255', '255,210,63', '170,125,255', '120,255,170', '255,150,60'];
  const BRONZE = ['#b3925c', '#5d4831', '#1f1711'], OR = '#f4d27c';
  let F = null;
  const ech = y => F ? borne(0.72 + 0.32 * (y - F.y0) / F.D, 0.62, 1.16) : 1; // la taille de ce qui est posé sur le sol, selon sa profondeur

  // un vantail de porte (la moitié gauche ; l'autre est son reflet) : du bronze sombre, des clous d'or, des ferrures
  function vantail(x, w, h) {
    x.beginPath(); x.moveTo(0, h); x.lineTo(0, w * 0.9); x.quadraticCurveTo(0, 0, w, 0); x.lineTo(w, h); x.closePath();
    x.fillStyle = lin(x, 0, 0, w, h, ['#6d5638', '#3a2c1f', '#17110c']); x.fill(); x.save(); x.clip();
    x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(0, 0, w * 0.35, h); x.fillStyle = 'rgba(255,70,20,.22)'; x.fillRect(w - 3, 0, 3, h);
    x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 1; for (let i = 1; i < 4; i++) { trait(x, [[w * i / 4, 0], [w * i / 4, h]]); x.stroke(); }
    for (const yy of [0.3, 0.58, 0.86]) { x.fillStyle = lin(x, 0, h * yy - 4, 0, h * yy + 4, BRONZE); x.fillRect(0, h * yy - 3.5, w, 7); x.strokeStyle = 'rgba(0,0,0,.6)'; x.strokeRect(0, h * yy - 3.5, w, 7); for (let i = 0; i < 4; i++) ell(x, w * (i + 0.5) / 4, h * yy, 1.3, 1.3, OR); }
    x.restore(); x.strokeStyle = '#05070a'; x.lineWidth = 1.4; x.stroke();
  }

  function construire(L, W, H, K) {
    const c = toile(W * K, H * K), g = c.getContext('2d'); g.scale(K, K);
    const r = alea(11), cx = W / 2, y0 = L.placeY0 - 10, D = L.bardeY - y0, yv = y0 - 2.25 * D, hw0 = W * 0.425;
    const S = y => (y - yv) / (y0 - yv), X = (u, y) => cx + u * hw0 * S(y);            // la perspective : tout fuit vers (cx, yv)
    const gk = L.gk, aw = 90 * gk, as = y0 - 150 * gk, ab = y0 - 18, mur = cx - hw0;   // l'arche : demi-largeur, naissance, bas ; le coin du mur
    const yCote = y0 + (cx / hw0 - 1) * 2.25 * D;                                                     // où le mur de côté sort de l'écran
    const arche = () => { g.beginPath(); g.moveTo(cx - aw, ab); g.lineTo(cx - aw, as); g.arc(cx, as, aw, Math.PI, 0); g.lineTo(cx + aw, ab); g.closePath(); };

    // ---------- la ville, au loin : peinte petite, puis agrandie → floue ----------
    function ville(w, h, graine) {
      const q = 0.5, a = toile(w * K * q, h * K * q), x = a.getContext('2d'), rr = alea(graine); x.scale(K * q, K * q);
      x.fillStyle = lin(x, 0, 0, 0, h, ['#051626', '#0b3048', '#1b6a82', '#86dcdc']); x.fillRect(0, 0, w, h);
      x.fillStyle = rad(x, w * 0.5, h * 0.08, 2, h * 0.95, ['rgba(225,255,250,.9)', 'rgba(125,232,236,.4)', 'rgba(60,160,190,0)']); x.fillRect(0, 0, w, h); // le grand cristal du plafond
      for (let rang = 0; rang < 3; rang++) {                                           // trois rangs de tours, du plus loin (dans la brume) au plus près
        const base = h * (0.6 + rang * 0.15);
        for (let i = 0; i < 9; i++) {
          const tw = (9 + rr() * 15) * (1 + rang * 0.35), tx = (i + rr() * 0.8) * w / 8 - tw / 2, th = (26 + rr() * 64) * (1 + rang * 0.25);
          x.fillStyle = ['#479aaa', '#1f5c74', '#0c2c42'][rang]; x.fillRect(tx, base - th, tw, th + h);
          if (rr() < 0.6) { poly(x, [[tx - 2, base - th], [tx + tw / 2, base - th - tw * (0.6 + rr())], [tx + tw + 2, base - th]]); x.fill(); } else { x.beginPath(); x.arc(tx + tw / 2, base - th, tw / 2, Math.PI, 0); x.fill(); }
          x.fillStyle = rang === 2 ? 'rgba(255,214,120,.95)' : 'rgba(195,250,255,.8)'; for (let k = 0; k < 7; k++) if (rr() < 0.55) x.fillRect(tx + 2 + rr() * (tw - 5), base - th + 6 + rr() * (th - 8), 1.8, 2.6);
        }
        x.fillStyle = `rgba(115,222,228,${0.18 - rang * 0.05})`; x.fillRect(0, base - 34, w, 68);
      }
      for (let i = 0; i < 4; i++) { const fx = w * (0.1 + 0.26 * i + rr() * 0.08); x.fillStyle = lin(x, 0, h * 0.15, 0, h * 0.8, ['rgba(205,255,250,.75)', 'rgba(120,230,240,0)']); x.fillRect(fx, h * 0.15, 2.4, h * 0.65); } // les cascades de lumière
      for (let i = 0; i < 18; i++) { const bx = rr() * w, by = h * (0.25 + rr() * 0.65), br = 3 + rr() * 7; x.fillStyle = rad(x, bx, by, 0, br, [rr() < 0.5 ? 'rgba(255,222,135,.75)' : 'rgba(175,250,255,.65)', 'rgba(255,255,255,0)']); x.fillRect(bx - br, by - br, br * 2, br * 2); }
      const b = toile(a.width * 0.42, a.height * 0.42); b.getContext('2d').drawImage(a, 0, 0, b.width, b.height);
      const o = toile(w * K, h * K), ox = o.getContext('2d'); ox.imageSmoothingEnabled = true; ox.drawImage(b, 0, 0, o.width, o.height);
      return o;
    }

    // ---------- le mur du fond : de grandes pierres bleu nuit, des bandeaux de bronze ----------
    g.fillStyle = lin(g, 0, 0, 0, y0, ['#070f17', '#12222f', '#1b3242']); g.fillRect(0, 0, W, y0 + 2);
    for (let yy = y0 - 22, k = 0; yy > -22; yy -= 22, k++) for (let xx = mur - 30 + (k % 2) * 23; xx < W - mur + 30; xx += 46) {
      g.fillStyle = r() < 0.5 ? `rgba(255,255,255,${r() * 0.045})` : `rgba(0,0,0,${r() * 0.16})`; g.fillRect(xx, yy, 46, 22);
      g.strokeStyle = 'rgba(2,6,10,.6)'; g.lineWidth = 1; g.strokeRect(xx, yy, 46, 22); g.strokeStyle = 'rgba(150,215,235,.07)'; trait(g, [[xx + 1, yy + 21], [xx + 1, yy + 1], [xx + 45, yy + 1]]); g.stroke();
    }
    const hv = ab - (as - aw), V = ville(aw * 2, hv, 5);
    g.save(); arche(); g.clip(); g.drawImage(V, cx - aw, as - aw, aw * 2, hv);
    g.fillStyle = lin(g, 0, ab - 60, 0, ab, ['rgba(8,20,30,0)', 'rgba(8,20,30,.55)']); g.fillRect(cx - aw, ab - 60, aw * 2, 60); g.restore();
    g.save(); g.translate(cx, as); g.scale(1, 1.25); g.fillStyle = rad(g, 0, 0, aw * 0.9, aw * 2.1, ['rgba(140,235,245,.30)', 'rgba(120,220,235,.10)', 'rgba(120,220,235,0)']); g.fillRect(-W, -aw * 2.2, W * 2, aw * 4.4); g.restore();   // la lueur de la ville, sur le mur
    // l'encadrement de l'arche : un grand arc de bronze, ses claveaux, ses cristaux
    arche(); g.strokeStyle = '#05080b'; g.lineWidth = 15; g.stroke(); g.strokeStyle = lin(g, cx - aw, as - aw, cx + aw, ab, ['#8a7046', '#4a3a28', '#2a2018']); g.lineWidth = 11.5; g.stroke();
    g.strokeStyle = 'rgba(244,210,124,.7)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, as, aw + 5, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(cx, as, aw - 5, Math.PI, 0); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.55)'; for (let i = 0; i <= 16; i++) { const a = Math.PI + i * Math.PI / 16; trait(g, [[cx + Math.cos(a) * (aw - 5), as + Math.sin(a) * (aw - 5)], [cx + Math.cos(a) * (aw + 5), as + Math.sin(a) * (aw + 5)]]); g.stroke(); }
    const sources = [];
    for (let i = 0; i < 5; i++) {                                                      // cinq cristaux sur l'arc : de là partent les spots des refrains
      const a = Math.PI + (i + 0.5) * Math.PI / 5, qx = cx + Math.cos(a) * aw, qy = as + Math.sin(a) * aw;
      g.save(); g.translate(qx, qy); g.rotate(a + Math.PI / 2); g.shadowColor = 'rgba(150,245,255,1)'; g.shadowBlur = 9; poly(g, [[0, -7], [4.5, 0], [0, 7], [-4.5, 0]]); g.fillStyle = lin(g, -4, -6, 4, 6, ['#f2ffff', '#8fe8f2', '#2b8fa8']); g.fill(); g.shadowBlur = 0; g.strokeStyle = '#05080b'; g.lineWidth = 1; g.stroke(); g.restore();
      sources.push({ x: qx, y: qy, r: 22, rgb: '170,245,255', a: 0.8 });
    }
    // le garde-corps, au pied de l'arche
    g.fillStyle = lin(g, 0, ab - 4, 0, y0, ['#3c2f20', '#17110c']); g.fillRect(cx - aw - 7, ab - 4, aw * 2 + 14, y0 - ab + 6); g.fillStyle = OR; g.globalAlpha = 0.6; g.fillRect(cx - aw - 7, ab - 4, aw * 2 + 14, 1.2); g.globalAlpha = 1;
    // deux pilastres, de chaque côté de l'arche
    for (const c2 of [-1, 1]) {
      const px = cx + c2 * (aw + 17);
      g.fillStyle = lin(g, px - 8, 0, px + 8, 0, ['#0b1620', '#2f4a5c', '#3f6276', '#1a2c3a', '#0a131b']); g.fillRect(px - 8, 0, 16, y0);
      g.strokeStyle = 'rgba(2,6,10,.8)'; g.lineWidth = 1.2; g.strokeRect(px - 8, -2, 16, y0 + 2);
      for (const yy of [y0 - 12, y0 - 150 * gk, y0 - 150 * gk - 9]) { g.fillStyle = lin(g, 0, yy - 4, 0, yy + 4, BRONZE); g.fillRect(px - 10, yy - 4, 20, 8); g.strokeRect(px - 10, yy - 4, 20, 8); g.fillStyle = OR; g.globalAlpha = 0.7; g.fillRect(px - 10, yy - 4, 20, 1); g.globalAlpha = 1; }
    }
    // ---------- les deux portes de bronze (les golems sortent par là) et leur lanterne ----------
    const bande = cx - aw - 27 - mur, pw = Math.min(54, bande - 8), ph = pw * 2.05, portes = [];
    for (const c2 of [-1, 1]) {
      const px = cx + c2 * (aw + 27 + bande / 2), py = y0;
      g.fillStyle = '#05080b'; g.beginPath(); g.moveTo(px - pw / 2 - 5, py); g.lineTo(px - pw / 2 - 5, py - ph + pw * 0.4); g.quadraticCurveTo(px - pw / 2 - 5, py - ph - 6, px, py - ph - 6); g.quadraticCurveTo(px + pw / 2 + 5, py - ph - 6, px + pw / 2 + 5, py - ph + pw * 0.4); g.lineTo(px + pw / 2 + 5, py); g.closePath(); g.fill();
      g.strokeStyle = lin(g, px - pw, py - ph, px + pw, py, ['#8a7046', '#3c2f20']); g.lineWidth = 3; g.stroke(); g.strokeStyle = 'rgba(244,210,124,.55)'; g.lineWidth = 0.9; g.stroke();
      g.save(); g.translate(px - pw / 2, py - ph); vantail(g, pw / 2, ph); g.restore(); g.save(); g.translate(px + pw / 2, py - ph); g.scale(-1, 1); vantail(g, pw / 2, ph); g.restore();
      g.shadowColor = '#ff3a10'; g.shadowBlur = 6; g.strokeStyle = 'rgba(255,90,40,.75)'; g.lineWidth = 1.2; trait(g, [[px, py - ph + 6], [px, py]]); g.stroke(); g.shadowBlur = 0;           // le rouge qui filtre entre les vantaux
      const ly = py - ph - 22;                                                         // la lanterne, au-dessus
      g.strokeStyle = '#05080b'; g.lineWidth = 2; trait(g, [[px, ly - 16], [px, ly - 7]]); g.stroke();
      g.shadowColor = 'rgba(255,200,90,1)'; g.shadowBlur = 12; poly(g, [[px - 6, ly - 6], [px + 6, ly - 6], [px + 4.5, ly + 8], [px - 4.5, ly + 8]]); g.fillStyle = lin(g, 0, ly - 6, 0, ly + 8, ['#fff6cf', '#ffc75a', '#e07a1c']); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = '#17110c'; g.lineWidth = 1.2; g.stroke(); poly(g, [[px - 8, ly - 6], [px, ly - 12], [px + 8, ly - 6]]); g.fillStyle = BRONZE[1]; g.fill(); g.stroke(); g.fillStyle = BRONZE[1]; g.fillRect(px - 6, ly + 8, 12, 2.5);
      g.fillStyle = rad(g, px, ly, 2, 70, ['rgba(255,200,100,.30)', 'rgba(255,170,70,.08)', 'rgba(255,170,70,0)']); g.fillRect(px - 70, ly - 70, 140, 140);
      const fy = ly - 26, fw = pw * 0.38, fh = Math.min(74, fy - 8);                    // au-dessus : une fenêtre haute, ouverte sur la ville floue
      if (fh > 30) {
        const fen = () => { g.beginPath(); g.moveTo(px - fw, fy); g.lineTo(px - fw, fy - fh + fw); g.arc(px, fy - fh + fw, fw, Math.PI, 0); g.lineTo(px + fw, fy); g.closePath(); };
        g.save(); fen(); g.clip(); g.drawImage(V, V.width * (c2 < 0 ? 0.05 : 0.6), 0, V.width * 0.35, V.height * 0.8, px - fw, fy - fh, fw * 2, fh); g.restore();
        fen(); g.strokeStyle = '#05080b'; g.lineWidth = 5; g.stroke(); g.strokeStyle = BRONZE[1]; g.lineWidth = 3; g.stroke(); g.strokeStyle = 'rgba(244,210,124,.6)'; g.lineWidth = 0.8; g.stroke();
        g.fillStyle = rad(g, px, fy - fh / 2, 4, 60, ['rgba(140,235,245,.20)', 'rgba(140,235,245,0)']); g.fillRect(px - 60, fy - fh / 2 - 60, 120, 120);
      }
      const zy = py - ph - 10; g.fillStyle = lin(g, 0, zy - 4, 0, zy + 4, BRONZE); g.fillRect(px - bande / 2, zy - 4, bande, 8); g.strokeStyle = 'rgba(2,6,10,.8)'; g.lineWidth = 1; g.strokeRect(px - bande / 2, zy - 4, bande, 8);   // la frise de bronze
      g.strokeStyle = 'rgba(244,210,124,.7)'; g.lineWidth = 0.9; g.beginPath(); for (let zx = px - bande / 2 + 3; zx < px + bande / 2 - 3; zx += 6) { g.moveTo(zx, zy + 2.5); g.lineTo(zx + 3, zy - 2.5); g.lineTo(zx + 6, zy + 2.5); } g.stroke();
      portes.push({ x: px, y: py, w: pw, h: ph }); sources.push({ x: px, y: ly, r: 24, rgb: '255,200,100', a: 1 });
    }

    // ---------- les murs de côté, qui viennent vers nous (le droit est le reflet du gauche) ----------
    const cote = () => {
      poly(g, [[-2, -2], [mur, -2], [mur, y0], [-2, yCote]]); g.fillStyle = lin(g, 0, 0, mur, 0, ['#04090e', '#0c1822', '#142736']); g.fill(); g.save(); g.clip();
      g.strokeStyle = 'rgba(2,6,10,.7)'; g.lineWidth = 1.1; for (let yc = y0 - 26; yc > -700; yc -= 26) { trait(g, [[mur, yc], [0, yv + 1.25 * (yc - yv)]]); g.stroke(); }        // les rangs de pierres fuient vers nous
      const ya = y0 - 96, yb = y0 - 86;                                                // la galerie : un trou sombre et rouge, sa corniche de bronze
      poly(g, [[mur - 4, y0 - 170], [0, yv + 1.25 * (y0 - 170 - yv)], [0, yv + 1.25 * (ya - yv)], [mur - 4, ya]]); g.fillStyle = lin(g, 0, 0, mur, 0, ['#1a0806', '#070406']); g.fill();
      poly(g, [[mur, ya], [0, yv + 1.25 * (ya - yv)], [0, yv + 1.25 * (yb - yv)], [mur, yb]]); g.fillStyle = lin(g, 0, 0, mur, 0, [BRONZE[2], BRONZE[1], BRONZE[0]]); g.fill(); g.strokeStyle = '#05080b'; g.stroke();
      g.restore();
      // la colonne du coin, ronde, cerclée de bronze, et sa lanterne
      g.fillStyle = lin(g, mur - 11, 0, mur + 11, 0, ['#070e15', '#243c4c', '#4a7186', '#1c3040', '#070e15']); g.fillRect(mur - 11, -2, 22, y0 + 4);
      g.strokeStyle = 'rgba(2,6,10,.85)'; g.lineWidth = 1.3; g.strokeRect(mur - 11, -2, 22, y0 + 4);
      for (let yy = y0 - 6; yy > 0; yy -= 58) { g.fillStyle = lin(g, mur - 13, 0, mur + 13, 0, [BRONZE[2], BRONZE[0], BRONZE[1], BRONZE[2]]); g.fillRect(mur - 13, yy - 5, 26, 9); g.strokeRect(mur - 13, yy - 5, 26, 9); g.fillStyle = OR; g.globalAlpha = 0.7; g.fillRect(mur - 13, yy - 5, 26, 1); g.globalAlpha = 1; }
    };
    cote(); g.save(); g.translate(W, 0); g.scale(-1, 1); cote(); g.restore();
    for (const c2 of [-1, 1]) { const lx = cx + c2 * (hw0 - 1), ly = y0 - 128; g.shadowColor = 'rgba(150,245,255,1)'; g.shadowBlur = 10; poly(g, [[lx, ly - 8], [lx + 5, ly], [lx, ly + 8], [lx - 5, ly]]); g.fillStyle = '#c9fbff'; g.fill(); g.shadowBlur = 0; g.strokeStyle = '#05080b'; g.lineWidth = 1; g.stroke(); sources.push({ x: lx, y: ly, r: 22, rgb: '170,245,255', a: 0.8 }); }

    // ---------- le sol : de grandes dalles polies, en perspective ----------
    g.save(); poly(g, [[mur, y0], [W - mur, y0], [W + 2, yCote], [W + 2, H + 2], [-2, H + 2], [-2, yCote]]); g.clip();
    g.fillStyle = lin(g, 0, y0, 0, H, ['#2a5262', '#1a3646', '#0e1f2b', '#070f17']); g.fillRect(0, y0, W, H - y0);
    g.save(); g.translate(cx, y0 + 10); g.scale(1, 0.8); g.fillStyle = rad(g, 0, 0, 10, D * 0.95, ['rgba(150,238,246,.42)', 'rgba(110,210,228,.16)', 'rgba(110,210,228,0)']); g.fillRect(-W, -20, W * 2, D * 1.3); g.restore();
    const rangs = []; for (let y = y0; y < H + 40; y += 30 * S(y)) rangs.push(y);
    for (let i = 0; i < rangs.length - 1; i++) for (let j = -9; j < 9; j++) {
      const ya = rangs[i], yb = rangs[i + 1], q = [[X(j / 5, ya), ya], [X((j + 1) / 5, ya), ya], [X((j + 1) / 5, yb), yb], [X(j / 5, yb), yb]];
      if (q[1][0] < -10 || q[0][0] > W + 10) continue;
      const s = S(ya), mx = (q[0][0] + q[2][0]) / 2, my = (ya + yb) / 2;
      poly(g, q); g.fillStyle = (i + j) % 2 ? `rgba(255,255,255,${0.015 + r() * 0.04})` : `rgba(0,0,0,${0.05 + r() * 0.12})`; g.fill();
      g.strokeStyle = 'rgba(2,7,11,.8)'; g.lineWidth = 1.1 * s; g.stroke(); g.strokeStyle = `rgba(175,236,246,${0.08 + 0.3 * Math.max(0, 1 - Math.hypot((mx - cx) / (W * 0.55), (my - y0) / (D * 0.8)))})`; g.lineWidth = 0.9; trait(g, [[q[3][0] + 1.2, q[3][1] - 1], [q[0][0] + 1.2, q[0][1] + 1.2], [q[1][0] - 1, q[1][1] + 1.2]]); g.stroke();
      if ((i + j) % 2 === 0) { const w = 7 * s, h = 3.2 * s; poly(g, [[mx, my - h], [mx + w, my], [mx, my + h], [mx - w, my]]); g.fillStyle = 'rgba(93,72,49,.6)'; g.fill(); g.strokeStyle = 'rgba(244,210,124,.35)'; g.lineWidth = 0.8; g.stroke(); }   // un losange de bronze incrusté
      else if (r() < 0.3) { g.strokeStyle = 'rgba(2,7,11,.6)'; g.lineWidth = 0.9; const p0 = [mx + (r() - 0.5) * 20 * s, ya + 2]; trait(g, [p0, [p0[0] + (r() - 0.5) * 12, my], [p0[0] + (r() - 0.5) * 18, yb - 2]]); g.stroke(); }   // une fêlure
      for (let k = 0; k < 6; k++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.14)'; g.fillRect(mel(q[3][0], q[2][0], r()), mel(ya, yb, r()), 1.4 * s, 0.9); }   // le grain
    }
    // l'allée de bronze, du trône au Barde, bordée d'or (ses bords sont les « rigoles » qui battent avec la musique)
    const yR = L.bardeY - 30, ua = 0.2;
    poly(g, [[X(-ua, y0), y0], [X(ua, y0), y0], [X(ua, yR), yR], [X(-ua, yR), yR]]); g.fillStyle = 'rgba(60,44,28,.22)'; g.fill();
    g.strokeStyle = 'rgba(244,210,124,.28)'; g.lineWidth = 1; for (let i = 1; i < rangs.length && rangs[i] < yR; i++) { const y = rangs[i], s = S(y); trait(g, [[X(-ua * 0.8, y + 6 * s), y + 6 * s], [cx, y - 4 * s], [X(ua * 0.8, y + 6 * s), y + 6 * s]]); g.stroke(); }
    // les reflets : la lueur de la ville, tout droit sous l'arche ; les deux lanternes des portes
    for (let i = -11; i < 11; i++) { const u = (i + 0.5) / 22, a = 0.26 * Math.exp(-u * u * 22), yb = y0 + D * 0.9; poly(g, [[X(u - 0.03, y0), y0], [X(u + 0.03, y0), y0], [X(u + 0.03, yb), yb], [X(u - 0.03, yb), yb]]); g.fillStyle = lin(g, 0, y0, 0, yb, [`rgba(170,242,248,${a})`, `rgba(170,242,248,${a * 0.35})`, 'rgba(170,242,248,0)']); g.fill(); }
    for (const p of portes) { g.fillStyle = lin(g, 0, y0, 0, y0 + D * 0.36, ['rgba(255,190,95,.24)', 'rgba(255,190,95,0)']); g.fillRect(p.x - p.w * 0.42, y0, p.w * 0.84, D * 0.36); g.save(); g.translate(p.x, y0 + 18); g.scale(1, 0.38); g.fillStyle = rad(g, 0, 0, 2, 62, ['rgba(255,200,110,.30)', 'rgba(255,170,70,0)']); g.fillRect(-64, -64, 128, 128); g.restore(); }
    // la rosace du Barde : des cercles d'or gravés, des rayons ; une nappe de lumière dorée l'éclaire, comme un projecteur
    const bx = L.bardeX, by = L.bardeY + 4, rx = 70, ry = 29;
    g.save(); g.translate(bx, by); g.scale(1, 0.5); g.fillStyle = rad(g, 0, 0, 6, 190, ['rgba(255,222,140,.30)', 'rgba(255,210,120,.10)', 'rgba(255,210,120,0)']); g.fillRect(-200, -200, 400, 400); g.restore();
    ell(g, bx, by, rx, ry, 'rgba(93,72,49,.5)'); g.strokeStyle = 'rgba(244,210,124,.55)'; g.lineWidth = 1.3; g.stroke(); ell(g, bx, by, rx * 0.72, ry * 0.72); g.stroke(); ell(g, bx, by, rx * 0.34, ry * 0.34, 'rgba(20,40,52,.7)'); g.stroke();
    g.lineWidth = 0.9; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; trait(g, [[bx + Math.cos(a) * rx * 0.34, by + Math.sin(a) * ry * 0.34], [bx + Math.cos(a) * rx * (i % 2 ? 0.72 : 1), by + Math.sin(a) * ry * (i % 2 ? 0.72 : 1)]]); g.stroke(); }
    // l'estrade de Grosbec : trois marches rondes, cerclées d'or
    for (let k = 0; k < 3; k++) { const ey = L.grosY + 10 - k * 5, er = (128 - k * 12) * gk; ell(g, cx, ey + 4, er, er * 0.2, '#070b10'); ell(g, cx, ey, er, er * 0.2); g.fillStyle = lin(g, cx - er, 0, cx + er, 0, ['#1a2a36', '#3d5b6c', '#2a4352', '#111d27']); g.fill(); g.strokeStyle = 'rgba(244,210,124,.5)'; g.lineWidth = 1.1; g.stroke(); }
    // la lumière : les rayons qui tombent de l'arche, puis l'ombre qui gagne vers nous et sur les côtés
    g.restore();
    for (let i = 0; i < 6; i++) { const a0 = -0.62 + i * 0.25 + (r() - 0.5) * 0.06, la = 0.07 + r() * 0.05, len = D * (0.75 + r() * 0.3), sx = cx + Math.sin(a0) * aw * 0.5, sy = as - aw * 0.2; poly(g, [[sx - 5, sy], [sx + 5, sy], [sx + Math.sin(a0 + la) * len, sy + len], [sx + Math.sin(a0 - la) * len, sy + len]]); g.fillStyle = lin(g, 0, sy, 0, sy + len, ['rgba(190,250,250,.13)', 'rgba(170,240,246,.05)', 'rgba(170,240,246,0)']); g.fill(); }
    g.fillStyle = lin(g, 0, y0 + D * 0.35, 0, H, ['rgba(2,6,10,0)', 'rgba(2,6,10,.36)']); g.fillRect(0, y0 + D * 0.35, W, H - y0);
    g.fillStyle = lin(g, 0, 0, W, 0, [[0, 'rgba(2,6,10,.42)'], [0.2, 'rgba(2,6,10,0)'], [0.8, 'rgba(2,6,10,0)'], [1, 'rgba(2,6,10,.42)']]); g.fillRect(0, 0, W, H);
    g.fillStyle = lin(g, 0, 0, 0, 70, ['rgba(2,5,9,.75)', 'rgba(2,5,9,0)']); g.fillRect(0, 0, W, 70);

    // ---------- ce qui bouge par-dessus, préparé une fois ----------
    const p0 = portes[0];
    const Vt = sprite(p0.w / 2, p0.h, 0, 0, K, x => vantail(x, p0.w / 2, p0.h));
    const dedans = sprite(p0.w, p0.h, p0.w / 2, p0.h, K, x => {                        // l'intérieur de la porte ouverte : le rouge des forges
      x.beginPath(); x.moveTo(-p0.w / 2, 0); x.lineTo(-p0.w / 2, -p0.h + p0.w * 0.45); x.quadraticCurveTo(-p0.w / 2, -p0.h, 0, -p0.h); x.quadraticCurveTo(p0.w / 2, -p0.h, p0.w / 2, -p0.h + p0.w * 0.45); x.lineTo(p0.w / 2, 0); x.closePath();
      x.fillStyle = rad(x, 0, -p0.h * 0.25, 2, p0.h * 0.9, ['#fff0c0', '#ff9a3a', '#c8300c', '#3a0804']); x.fill();
    });
    const nappe = sprite(150, 120, 75, 6, K, x => {                                     // la lumière rouge qui sort par la porte et s'étale sur le sol
      poly(x, [[-p0.w * 0.45, 0], [p0.w * 0.45, 0], [70, 110], [-70, 110]]); x.fillStyle = lin(x, 0, 0, 0, 110, ['rgba(255,150,70,.55)', 'rgba(255,90,40,.18)', 'rgba(255,90,40,0)']); x.fill();
    });
    const flaque = COUL.map(rgb => sprite(190, 80, 95, 40, Math.min(K, 1.2), x => { x.scale(1, 0.42); x.fillStyle = rad(x, 0, 0, 2, 92, [`rgba(${rgb},.55)`, `rgba(${rgb},.22)`, `rgba(${rgb},0)`]); x.fillRect(-95, -95, 190, 190); }));
    const chemin = c2 => {                                                              // les rigoles d'or : les bords de l'allée, le tour de la rosace
      c2.beginPath(); for (const u of [-ua, ua]) { c2.moveTo(X(u, y0 + 20), y0 + 20); c2.lineTo(X(u, yR), yR); }
      c2.moveTo(bx + rx, by); c2.ellipse(bx, by, rx, ry, 0, 0, TAU);
    };
    const bord = y => Math.max(16, cx - hw0 * S(y) + 14);                               // jusqu'où un golem peut aller vers la gauche, à cette profondeur (le mur)
    const chutes = [-1, 1].map(c2 => ({ x: cx + c2 * (cx - bord(L.ruelleY) - 12), y: L.ruelleY, x0: cx + c2 * (cx + 30), y0: y0 - 120 }));   // où retombent ceux qui sautent des galeries
    F = { fond: c, L, W, H, y0, D, portes, sources, chutes, Vt, dedans, nappe, flaque, chemin, bord, cibles: [0, 1, 2, 3].map(() => ({ x: 0, y: 0, col: 0 })), cercles: portes, as, aw };
    return F;
  }

  // les lueurs calmes, juste après le fond : les cristaux, les lanternes, les rigoles d'or, la rosace du Barde
  // niv : 0 à 3 (les instruments) ; mega : 0 à 1 ; q : la qualité (0 à 3)
  function lumieres(g, now, pul, niv, mega, q) {
    const L = F.L, a = 0.3 + niv * 0.08 + pul * (0.2 + niv * 0.06) + mega * 0.3;
    for (const s of F.sources) poser(g, lueur(s.r, s.rgb, 1, 0.7, 1), s.x, s.y, 0.85 + pul * 0.25 + mega * 0.3, Math.min(1, a * s.a));
    g.lineCap = 'round'; F.chemin(g); g.strokeStyle = `rgba(255,214,120,${0.08 + pul * 0.13 + mega * 0.2})`; g.lineWidth = 4; g.stroke();
    g.strokeStyle = `rgba(255,244,200,${0.22 + pul * 0.36 + mega * 0.3})`; g.lineWidth = 1.2; g.stroke(); g.lineCap = 'butt';
    poser(g, lueur(70, '255,214,120', 0.42, 0.3, 1), L.bardeX, L.bardeY + 4, 1 + pul * 0.12, 0.3 + pul * 0.3 + mega * 0.3);
    if (q >= 2) for (let i = 0; i < 9; i++) {                                           // des poussières d'or qui montent dans les rayons
      const u = (now * (0.05 + i * 0.006) + i * 0.37) % 1, x = F.W / 2 + Math.sin(i * 2.4 + now * 0.3) * (30 + u * 110), y = F.y0 + F.D * 0.75 * (1 - u) - 40;
      poser(g, lueur(5, '230,255,250', 1, 1, 1), x, y, 0.8, Math.sin(u * Math.PI) * 0.75);
    }
  }
  // UNE PORTE QUI S'OUVRE (i : 0 à gauche, 1 à droite ; ouv : 0 fermée … 1 grande ouverte) : le rouge des forges, les vantaux qui
  // s'écartent, la lumière qui s'étale sur le sol
  function porte(g, i, ouv) {
    if (ouv <= 0.01) return;
    const p = F.portes[i], w = p.w / 2, k = 1 - 0.8 * ouv;
    poser(g, F.dedans, p.x, p.y, 1, Math.min(1, ouv * 1.6));
    g.drawImage(F.Vt.c, p.x - w, p.y - p.h, w * k, p.h);
    g.save(); g.translate(p.x + w, p.y - p.h); g.scale(-1, 1); g.drawImage(F.Vt.c, 0, 0, w * k, p.h); g.restore();
    poser(g, F.nappe, p.x, p.y, 1, ouv * 0.9); poser(g, lueur(46, '255,120,50', 1, 0.5, 1), p.x, p.y - p.h * 0.45, 1.2, ouv * 0.7);
  }
  // l'endroit où un golem retombe : un éclat sur les dalles
  function cercle(g, x, y, f) { if (f > 0.01) poser(g, lueur(60, '255,120,60', 0.4, 0.5, 1), x, y, (1.4 - f * 0.6) * ech(y), f * 0.9); }

  // LES SPOTS DES REFRAINS, dans l'image : chaque spot pose une flaque de couleur sur les dalles (AVANT les personnages)…
  function spots(g, now, pul, f, q, n) {
    if (f <= 0) return;
    const L = F.L, W = F.W, cx = W / 2, nb = q >= 2 ? 4 : 2;
    for (let i = 0; i < nb; i++) {
      const c = F.cibles[i];
      c.x = cx + Math.sin(now * (0.9 + i * 0.23) + i * 1.7) * W * 0.36; c.y = mel(F.y0 + 60, L.bardeY - 6, 0.5 + 0.5 * Math.sin(now * (0.7 + i * 0.17) + i * 2.3));
      c.col = (i + (n >> 1)) % 6;
      poser(g, F.flaque[c.col], c.x, c.y, ech(c.y) * (0.95 + pul * 0.2), 0.9 * f);
    }
  }
  // … et son faisceau, qui descend d'un cristal du décor (APRÈS les personnages) : deux triangles pleins, presque rien à dessiner
  function faisceaux(g, f, q) {
    if (f <= 0) return;
    const nb = q >= 2 ? 4 : 2;
    for (let i = 0; i < nb; i++) {
      const c = F.cibles[i], s = F.sources[(i * 2 + 1) % 5], w = 46 * ech(c.y);
      for (const [k, a] of [[1, 0.07], [0.5, 0.09]]) { g.fillStyle = `rgba(${COUL[c.col]},${a * f})`; g.beginPath(); g.moveTo(s.x - 2, s.y); g.lineTo(s.x + 2, s.y); g.lineTo(c.x + w * k, c.y); g.lineTo(c.x - w * k, c.y); g.closePath(); g.fill(); }
    }
  }
  return { construire, lumieres, porte, cercle, spots, faisceaux, ech, COUL, bord: y => F ? F.bord(y) : 16, get F() { return F; } };
})();
