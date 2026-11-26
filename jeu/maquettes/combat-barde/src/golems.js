// ===== LE BESTIAIRE : les golems de Grosbec (version 9 — Romain, 24 nov., 21 h : « plus effrayants, agressifs, un peu mécaniques,
// moitié roche, moitié métal, un peu comme son armure ; des jambes terrifiantes ; un pas après l'autre, en rythme ») =====
// De la roche sombre, du fer et du bronze à liseré d'or (comme l'armure de Grosbec), des griffes, des dents, des pointes, des yeux en
// fente de braise, un fourneau rouge dans la poitrine (le feu de Raban). Chaque golem est peint sous trois angles (yaw -1, 0, 1) et
// chaque image n'est peinte QU'UNE FOIS (« cuite »), puis recopiée : rien ne rame.
const Golems = (() => {
  const { TAU, toile, alea, lin, rad, poly, trait, ell, sprite, mel } = Ou;
  // r : sa place sur le sol ; pv : ses vies ; haut : sa hauteur ; boite : la toile [largeur, hauteur, pied x, pied y]
  const TYPES = {
    trotteur: { r: 15, pv: 1, haut: 64, email: '#8b929c', boite: [124, 112, 62, 94], nom: 'le rôdeur' },
    soldat:   { r: 17, pv: 2, haut: 104, email: '#a88a58', boite: [156, 176, 70, 158], nom: 'le lancier' },
    bouclier: { r: 18, pv: 2, haut: 92, email: '#a88a58', boite: [150, 142, 75, 124], nom: 'le porte-dalle' },
    danseur:  { r: 14, pv: 1, haut: 88, email: '#8b929c', boite: [170, 136, 85, 118], nom: 'le tourbillon' },
    gros:     { r: 27, pv: 5, haut: 140, email: '#6f7a80', boite: [220, 204, 110, 184], nom: 'le colosse' },
    lanceur:  { r: 15, pv: 2, haut: 90, email: '#a88a58', boite: [150, 146, 75, 126], nom: 'le frondeur' },
    fonceur:  { r: 18, pv: 3, haut: 80, email: '#5a5d66', boite: [176, 134, 88, 114], nom: 'le bélier' },
  };
  const BRONZE = ['#b3925c', '#5d4831', '#1f1711'], FER = ['#939aa4', '#444a54', '#15171c'], ROC = ['#737e84', '#373f47', '#11151a'], OS = ['#e3ddcc', '#958e7d', '#3b372f'], OR = '#f4d27c', NOIR = '#06080b';
  const PAL = { gris: ROC, fer: FER, bronze: BRONZE };

  // ---------- les matières ----------
  // une plaque de métal : son dégradé, la lumière d'en haut à gauche, le rouge qui monte du sol, son liseré d'or, ses rivets, ses gravures
  function plaque(x, pts, pal = BRONZE, o = {}) {
    let y0 = 1e9, y1 = -1e9, x0 = 1e9, x1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); }
    poly(x, pts); x.fillStyle = lin(x, x0, y0, x0 * 0.6 + x1 * 0.4, y1, pal); x.fill();
    x.save(); x.clip();
    x.fillStyle = 'rgba(255,255,255,.10)'; x.fillRect(x0, y0, (x1 - x0) * 0.4, y1 - y0);
    x.fillStyle = 'rgba(255,60,20,.15)'; x.fillRect(x0, y1 - (y1 - y0) * 0.3, x1 - x0, (y1 - y0) * 0.3);
    if (o.grav) { x.lineWidth = 0.8; x.strokeStyle = 'rgba(0,0,0,.5)'; for (const l of o.grav) { trait(x, l); x.stroke(); } x.translate(0.6, 0.7); x.strokeStyle = 'rgba(255,220,150,.2)'; for (const l of o.grav) { trait(x, l); x.stroke(); } }
    x.restore();
    poly(x, pts); x.strokeStyle = NOIR; x.lineWidth = o.lw || 1.5; x.lineJoin = 'round'; x.stroke();
    if (o.or !== 0) { x.strokeStyle = OR; x.globalAlpha = o.or || 0.75; x.lineWidth = 1; trait(x, o.bord || pts.slice(0, 2)); x.stroke(); x.globalAlpha = 1; }
    if (o.riv) for (const r of o.riv) { ell(x, r[0], r[1], 1.3, 1.3, '#17110c'); ell(x, r[0] - 0.3, r[1] - 0.3, 0.75, 0.75, OR); }
  }
  // un rocher taillé à facettes, avec son grain
  function roc(x, cx, cy, rx, ry, seed, pal = ROC, n = 9) {
    const r = alea(seed), pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU + (r() - 0.5) * 0.5, k = 0.78 + r() * 0.3; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    poly(x, pts); x.fillStyle = lin(x, cx - rx, cy - ry, cx + rx * 0.4, cy + ry, pal); x.fill();
    x.save(); x.clip();
    for (let i = 0; i < 5; i++) { const a = pts[(r() * n) | 0], b = pts[(r() * n) | 0]; poly(x, [a, b, [cx + (r() - 0.5) * rx, cy + (r() - 0.5) * ry]]); x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.22)'; x.fill(); }
    for (let i = 0; i < rx * ry / 7; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.25)'; x.fillRect(cx + (r() * 2 - 1) * rx, cy + (r() * 2 - 1) * ry, 0.9, 0.9); }
    x.fillStyle = 'rgba(255,60,20,.14)'; x.fillRect(cx - rx, cy + ry * 0.3, rx * 2, ry);
    x.restore();
    poly(x, pts); x.strokeStyle = NOIR; x.lineWidth = 1.5; x.lineJoin = 'round'; x.stroke();
  }
  // les fissures rouges : le feu de Raban qui court dans la roche
  function veines(x, lignes, w = 1.2) {
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = 'rgba(40,0,0,.85)'; x.lineWidth = w + 1.6; for (const l of lignes) { trait(x, l); x.stroke(); }
    x.shadowColor = '#ff2a00'; x.shadowBlur = 5; x.strokeStyle = '#ff5a22'; x.lineWidth = w; for (const l of lignes) { trait(x, l); x.stroke(); }
    x.shadowBlur = 0; x.strokeStyle = '#ffd9a0'; x.lineWidth = w * 0.35; for (const l of lignes) { trait(x, l); x.stroke(); }
    x.restore();
  }
  // un œil : une fente de braise, penchée vers le nez (méchante), au fond d'un trou noir. cote : -1 l'œil de gauche, 1 celui de droite
  function oeil(x, ex, ey, w, cote, k = 1, fort = 1) {
    if (k < 0.15) return;
    x.save(); x.translate(ex, ey); x.rotate(-cote * 0.4); x.scale(k, 1);
    poly(x, [[-w, -w * 0.5], [w, -w * 0.28], [w * 0.9, w * 0.42], [-w * 0.85, w * 0.3]]); x.fillStyle = '#020203'; x.fill();
    x.shadowColor = '#ff1a00'; x.shadowBlur = 7 * fort; poly(x, [[-w * 0.72, -w * 0.2], [w * 0.7, -w * 0.04], [w * 0.55, w * 0.22], [-w * 0.6, w * 0.1]]); x.fillStyle = '#ff3a10'; x.fill();
    x.shadowBlur = 0; ell(x, -cote * w * 0.12, w * 0.02, w * 0.2, w * 0.1, '#fff0c0');
    x.restore();
  }
  // des dents de fer, en scie (h > 0 : elles pendent ; h < 0 : elles montent)
  function dents(x, x0, x1, y, h, n, pal = OS) {
    for (let i = 0; i < n; i++) { const a = x0 + (x1 - x0) * i / n, b = x0 + (x1 - x0) * (i + 1) / n; poly(x, [[a, y], [b, y], [(a + b) / 2, y + h * (i % 2 ? 1 : 0.7)]]); x.fillStyle = lin(x, 0, y, 0, y + h, [pal[0], pal[1]]); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 0.8; x.lineJoin = 'round'; x.stroke(); }
  }
  // une pointe (une corne, une griffe, une lame) : sa base, sa direction, sa longueur, sa largeur
  function pointe(x, bx, by, ang, len, w, pal = FER) {
    const c = Math.cos(ang), s = Math.sin(ang), px = -s * w / 2, py = c * w / 2;
    poly(x, [[bx + px, by + py], [bx + c * len, by + s * len], [bx - px, by - py]]); x.fillStyle = lin(x, bx + px, by + py, bx - px, by - py, pal); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.2; x.lineJoin = 'round'; x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 0.7; trait(x, [[bx + px * 0.45, by + py * 0.45], [bx + c * len * 0.85, by + s * len * 0.85]]); x.stroke();
  }
  // le fourneau : le feu derrière une grille, dans la poitrine. k : écrasé quand le golem tourne
  function fourneau(x, cx, cy, w, h, k = 1, barres = 3) {
    if (k < 0.2) return;
    x.save(); x.translate(cx, cy); x.scale(k, 1);
    const f = [[-w, -h], [w, -h], [w * 0.7, h], [-w * 0.7, h]];
    x.shadowColor = '#ff2a00'; x.shadowBlur = 12; poly(x, f); x.fillStyle = rad(x, 0, h * 0.3, 1, w * 1.4, ['#fff3c4', '#ffa23a', '#e8300c', '#5a0a02']); x.fill(); x.shadowBlur = 0;
    x.strokeStyle = '#0b0806'; x.lineWidth = 2; for (let i = 1; i <= barres; i++) { const u = -1 + 2 * i / (barres + 1); trait(x, [[u * w, -h], [u * w * 0.72, h]]); x.stroke(); }
    poly(x, f); x.lineWidth = 2.2; x.stroke(); x.strokeStyle = OR; x.lineWidth = 0.9; x.globalAlpha = 0.85; trait(x, [[-w - 1, -h - 1.5], [w + 1, -h - 1.5]]); x.stroke();
    x.restore();
  }
  // un segment de membre : large en a, fin en b, rond comme un tuyau
  function membre(x, ax, ay, bx, by, wa, wb, pal) {
    const an = Math.atan2(by - ay, bx - ax), nx = -Math.sin(an), ny = Math.cos(an);
    poly(x, [[ax + nx * wa, ay + ny * wa], [bx + nx * wb, by + ny * wb], [bx - nx * wb, by - ny * wb], [ax - nx * wa, ay - ny * wa]]);
    x.fillStyle = lin(x, ax - nx * wa, ay - ny * wa, ax + nx * wa, ay + ny * wa, [pal[2], pal[1], pal[0], pal[1]]); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.4; x.lineJoin = 'round'; x.stroke();
  }
  const coude = (ax, ay, bx, by, L1, L2, sens) => { // où plie un membre de deux os (le genou, le coude), du côté « sens »
    const dx = bx - ax, dy = by - ay, d = Math.min(L1 + L2 - 0.5, Math.max(3, Math.hypot(dx, dy)));
    const a = Math.atan2(dy, dx), b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    return [ax + Math.cos(a - sens * b) * L1, ay + Math.sin(a - sens * b) * L1];
  };
  // UNE PATTE DE MACHINE : la hanche (hx, hy), où se pose le pied (fx, fy), sa longueur L, le genou vers « sens », sa grosseur t.
  // Une cuisse de bronze et son piston, un gros boulon au genou avec sa pointe, un tibia de fer avec son ergot, un pied à trois griffes.
  function patte(x, hx, hy, fx, fy, L, sens, t, pal = FER) {
    const ay = fy - 5 * t, g = coude(hx, hy, fx, ay, L * 0.6, L * 0.62, sens), gx = g[0], gy = g[1], ext = sens > 0 ? 0 : Math.PI;
    membre(x, gx, gy, fx, ay, 4.2 * t, 2.7 * t, pal);
    pointe(x, mel(gx, fx, 0.42) + sens * 2.4 * t, mel(gy, ay, 0.42), ext - sens * 0.6, 8 * t, 4 * t, pal);
    membre(x, hx, hy, gx, gy, 6 * t, 4.4 * t, BRONZE);
    x.strokeStyle = OR; x.globalAlpha = 0.7; x.lineWidth = 0.9; trait(x, [[hx - sens * 3 * t, hy + 2], [gx - sens * 2 * t, gy - 2]]); x.stroke(); x.globalAlpha = 1;
    x.strokeStyle = '#c3ccd6'; x.lineWidth = 1.3 * t; trait(x, [[hx + sens * 4.6 * t, hy + 3], [gx + sens * 3.5 * t, gy]]); x.stroke();
    pointe(x, gx + sens * 3 * t, gy - 1.5 * t, ext - sens * 0.9, 9 * t, 4.6 * t, pal);
    ell(x, gx, gy, 4.7 * t, 4.7 * t, '#17110c'); ell(x, gx, gy, 3.5 * t, 3.5 * t, BRONZE[0]); ell(x, gx, gy, 1.6 * t, 1.6 * t, '#17110c');
    poly(x, [[fx - 4.6 * t, ay - 1], [fx + 4.6 * t, ay - 1], [fx + 6.6 * t, fy - 1.5 * t], [fx - 6.6 * t, fy - 1.5 * t]]); x.fillStyle = lin(x, 0, ay, 0, fy, [pal[0], pal[2]]); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.3; x.stroke();
    for (const u of [-1, 1, 0]) pointe(x, fx + u * 4.6 * t, fy - 3.4 * t, Math.PI / 2 - u * 0.55, (u ? 6.5 : 7.5) * t, 4.4 * t, OS);
  }
  // UN BRAS : l'épaule, la main, sa longueur, le coude vers « sens » ; au bout : trois griffes, ou rien (il tient quelque chose)
  function bras(x, sx, sy, mx, my, L, sens, t, pal = FER, griffes = true) {
    const c = coude(sx, sy, mx, my, L * 0.55, L * 0.55, sens);
    membre(x, sx, sy, c[0], c[1], 5 * t, 3.7 * t, pal); membre(x, c[0], c[1], mx, my, 4.5 * t, 3.1 * t, BRONZE);
    ell(x, c[0], c[1], 3.7 * t, 3.7 * t, '#17110c'); ell(x, c[0], c[1], 2.5 * t, 2.5 * t, BRONZE[0]);
    const an = Math.atan2(my - c[1], mx - c[0]);
    if (griffes) for (const u of [-1, 1, 0]) pointe(x, mx + Math.cos(an + u * 1.2) * 1.6 * t, my + Math.sin(an + u * 1.2) * 1.6 * t, an + u * 0.42, (u ? 10 : 12.5) * t, 3.6 * t, OS);
    return an;
  }
  function sol(x, r) { // son ombre, et le rouge qu'il pose sur les dalles
    ell(x, 0, 2, r * 1.5, r * 0.5, 'rgba(0,0,0,.5)');
    x.save(); x.translate(0, 2); x.scale(1, 0.36); x.fillStyle = rad(x, 0, 0, 1, r * 1.9, ['rgba(255,60,20,.32)', 'rgba(255,60,20,0)']); x.fillRect(-r * 2, -r * 2, r * 4, r * 4); x.restore();
  }
  function glace(x, T) { // figé par le point d'orgue du Barde : pris dans un cristal bleu
    const [w, h, ox, oy] = T.boite;
    x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(120,200,255,.55)'; x.fillRect(-ox, -oy, w, h); x.restore();
    x.strokeStyle = 'rgba(210,240,255,.9)'; x.lineWidth = 1.2; x.fillStyle = 'rgba(150,215,255,.16)';
    const r = T.r * 1.5, H = T.haut; poly(x, [[-r, 0], [-r * 1.15, -H * 0.5], [-r * 0.5, -H * 1.04], [r * 0.4, -H * 1.1], [r * 1.15, -H * 0.55], [r, 0]]); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.7)'; trait(x, [[-r * 0.6, -H * 0.2], [-r * 0.2, -H * 0.8]]); x.stroke();
  }
  // LE PAS. k : 0 le pied vient de taper (le corps s'écrase), 2 debout, 3 l'autre pied se lève, 4 il est en l'air, prêt à taper.
  // pied : lequel vient de taper (0 celui de gauche à l'écran, 1 celui de droite). Rend : de combien chaque pied est levé, l'écrasement, le balancement.
  function allure(o, H) {
    const k = o.etat === 'marche' ? o.k : 2, a = o.pied ? 1 : 0, lev = [0, 0];
    if (k === 3) lev[1 - a] = H * 0.5; if (k === 4) lev[1 - a] = H;
    return { lev, ecr: k === 0 ? 3 : k === 4 ? -1.5 : 0, bal: k >= 3 ? (a ? 2.5 : -2.5) : 0 };
  }
  // les deux pattes d'un marcheur (écart e, hanches à hh, longueur L) : celle du fond d'abord, celle de devant ensuite
  function pattes(x, s, al, e, hh, L, t, pal) {
    const P = [-1, 1].map((c, i) => { const fond = s && c * s > 0; return { fond, c, hx: c * e * (fond ? 0.45 : s ? 0.85 : 0.8) + al.bal, fx: c * e * (fond ? 0.8 : 1.15) + s * (fond ? 5 : 1), lev: al.lev[i], t: fond ? t * 0.88 : t }; });
    const une = p => patte(x, p.hx, -hh + al.ecr, p.fx, -p.lev, L, p.c, p.t, pal);
    return { fond: () => P.filter(p => p.fond).forEach(une), devant: () => P.filter(p => !p.fond).forEach(une) };
  }

  // ================= les sept golems =================
  // o : { yaw (-1, 0, 1), etat ('marche', 'arme', 'frappe', 'gratte', 'charge', 'tourne'), k, pied, sansBouclier, gele }
  const PEINTRES = {
    // --- le rôdeur : une gueule de piège à loups sur deux longues pattes. Rapide, fragile. Il mord.
    trotteur(x, T, o) {
      const s = o.yaw, al = allure(o, 13), arme = o.etat === 'arme', frappe = o.etat === 'frappe';
      const P = pattes(x, s, al, 13, 30, 27, 0.85), by = -40 + al.ecr - (arme ? 4 : 0) + (frappe ? 5 : 0), bx = al.bal + s * 3;
      sol(x, 15); P.fond();
      for (const u of [-1, 0, 1]) pointe(x, bx - s * 6 + u * 9, by - 9, -Math.PI / 2 + u * 0.35 - s * 0.3, 15 - Math.abs(u) * 3, 6);   // l'échine de pointes
      roc(x, bx, by, 20, 15, 21);
      veines(x, [[[bx - 15, by - 2], [bx - 9, by - 8], [bx - 3, by - 6]], [[bx + 14, by - 3], [bx + 8, by - 9]], [[bx - 12, by + 6], [bx - 17, by + 10]]], 1);
      P.devant();
      const fx = bx + s * 7, ouv = arme ? 13 : frappe ? 2 : 6;                                                                         // la gueule
      plaque(x, [[fx - 17, by - 6], [fx + 17, by - 6], [fx + 19, by + 3], [fx - 19, by + 3]], BRONZE, { riv: [[fx - 14, by - 2], [fx + 14, by - 2]], bord: [[fx - 17, by - 6], [fx + 17, by - 6]] });
      poly(x, [[fx - 17, by + 3], [fx + 17, by + 3], [fx + 14, by + 3 + ouv], [fx - 14, by + 3 + ouv]]); x.fillStyle = rad(x, fx, by + 3 + ouv * 0.5, 1, 18, ['#ff7a2a', '#a01204', '#120202']); x.fill();
      dents(x, fx - 17, fx + 17, by + 3, 6.5, 7);
      plaque(x, [[fx - 15, by + 3 + ouv], [fx + 15, by + 3 + ouv], [fx + 11, by + 10 + ouv], [fx - 11, by + 10 + ouv]], FER, { or: 0 });
      dents(x, fx - 14, fx + 14, by + 3 + ouv, -5.5, 6);
      oeil(x, fx - 8, by - 1, 4.6, -1, s > 0 ? 0.75 : 1); oeil(x, fx + 8, by - 1, 4.6, 1, s < 0 ? 0.75 : 1);
      for (const c of [-1, 1]) pointe(x, fx + c * 18, by + 2, Math.PI / 2 - c * 0.5 + (arme ? c * 0.5 : 0), 13, 5, OS);            // ses deux crocs
      if (o.gele) glace(x, T);
    },
    // --- le lancier : un soldat de roche et de bronze, un heaume à crête, une grande faux de fer. Il avance un temps sur deux.
    soldat(x, T, o) {
      const s = o.yaw, al = allure(o, 14), arme = o.etat === 'arme', frappe = o.etat === 'frappe';
      const P = pattes(x, s, al, 12, 46, 42, 1), cx = al.bal + s * 2, cy = -64 + al.ecr, cote = s < 0 ? -1 : 1;
      sol(x, 17); P.fond();
      bras(x, cx - cote * 17, cy - 12, cx - cote * 24, cy + 22, 36, -cote, 0.9);                                                        // le bras du fond, griffes ouvertes
      plaque(x, [[cx - 13, cy + 12], [cx + 13, cy + 12], [cx + 10, cy + 24], [cx - 10, cy + 24]], FER, { or: 0 });                     // le bassin
      roc(x, cx, cy, 18, 18, 33);
      veines(x, [[[cx - 14, cy + 6], [cx - 9, cy + 12]], [[cx + 13, cy + 4], [cx + 8, cy + 11]]], 1);
      plaque(x, [[cx - 15 + s * 2, cy - 15], [cx + 15 + s * 2, cy - 15], [cx + 11 + s * 3, cy + 5], [cx + s * 4, cy + 11], [cx - 11 + s * 3, cy + 5]], BRONZE, { bord: [[cx - 15 + s * 2, cy - 15], [cx + 15 + s * 2, cy - 15]], riv: [[cx - 11 + s * 2, cy - 11], [cx + 11 + s * 2, cy - 11]], grav: [[[cx - 9, cy - 9], [cx + s * 4, cy + 6], [cx + 9, cy - 9]]] });
      fourneau(x, cx + s * 5, cy - 4, 5.5, 6, s ? 0.8 : 1, 2);
      P.devant();
      for (const c of [-1, 1]) { const ex = cx + c * 19 - s * 2, ey = cy - 15; plaque(x, [[ex - 9, ey - 5], [ex + 9, ey - 5], [ex + 10, ey + 5], [ex - 10, ey + 5]], BRONZE, { riv: [[ex, ey + 1]] }); pointe(x, ex + c * 3, ey - 4, -Math.PI / 2 + c * 0.5, 13, 6); }  // les épaulières à pointe
      const hx = cx + s * 6, hy = cy - 30;                                                                                              // le heaume
      for (const u of [-2, -1, 0, 1, 2]) pointe(x, hx + u * 3.6, hy - 9, -Math.PI / 2 + u * 0.16, 15 - Math.abs(u) * 3, 4.2, BRONZE);
      plaque(x, [[hx - 10, hy - 10], [hx + 10, hy - 10], [hx + 11, hy + 6], [hx + s * 3, hy + 13], [hx - 11, hy + 6]], FER, { bord: [[hx - 10, hy - 10], [hx + 10, hy - 10]] });
      poly(x, [[hx - 9 + s, hy - 4], [hx + 9 + s, hy - 4], [hx + 8 + s, hy + 1], [hx + 1.5 + s * 2, hy + 1], [hx + s * 3, hy + 9], [hx - 1.5 + s * 2, hy + 1], [hx - 8 + s, hy + 1]]); x.fillStyle = '#020203'; x.fill();
      oeil(x, hx - 4.6 + s * 1.5, hy - 1.4, 3.6, -1, s > 0 ? 0.7 : 1); oeil(x, hx + 4.6 + s * 1.5, hy - 1.4, 3.6, 1, s < 0 ? 0.7 : 1);
      // sa faux, dans la main de devant : levée quand il arme, abattue quand il frappe
      const mx = cx + cote * (arme ? 30 : frappe ? 20 : 25), my = cy + (arme ? -18 : frappe ? 10 : 14), an = arme ? -1.2 * cote - Math.PI / 2 : frappe ? Math.PI / 2 - cote * 0.85 : -Math.PI / 2 + cote * 0.12;
      const ca = Math.cos(an), sa = Math.sin(an), tx = mx + ca * 56, ty = my + sa * 56;
      x.strokeStyle = NOIR; x.lineWidth = 5; x.lineCap = 'round'; trait(x, [[mx - ca * 18, my - sa * 18], [tx, ty]]); x.stroke(); x.strokeStyle = '#6b5a45'; x.lineWidth = 2.6; x.stroke(); x.lineCap = 'butt';
      x.save(); x.translate(tx, ty); x.rotate(an);
      poly(x, [[-10, -2], [2, -3], [8, cote * 10], [4, cote * 30], [-3, cote * 38], [-1, cote * 22], [-5, cote * 9]]); x.fillStyle = lin(x, -6, 0, 8, cote * 20, FER); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.3; x.lineJoin = 'round'; x.stroke();
      x.shadowColor = '#ff2a00'; x.shadowBlur = 5; x.strokeStyle = '#ff6a2a'; x.lineWidth = 1.1; trait(x, [[8, cote * 10], [4, cote * 30], [-3, cote * 38]]); x.stroke(); x.shadowBlur = 0;
      x.restore();
      bras(x, cx + cote * 17, cy - 12, mx, my, 38, cote, 1, FER, false); ell(x, mx, my, 4.6, 4.6, BRONZE[1]); x.strokeStyle = NOIR; x.lineWidth = 1.2; x.stroke();
      if (o.gele) glace(x, T);
    },
    // --- le porte-dalle : un golem trapu derrière une grande dalle bardée de bronze et de pointes, où les notes rebondissent.
    bouclier(x, T, o) {
      const s = o.yaw, al = allure(o, 11), arme = o.etat === 'arme', frappe = o.etat === 'frappe', nu = o.sansBouclier;
      const P = pattes(x, s, al, 15, 38, 34, 1.15), cx = al.bal + s * 2, cy = -58 + al.ecr;
      sol(x, 18); P.fond();
      roc(x, cx, cy, 24, 21, 45); veines(x, [[[cx - 19, cy - 4], [cx - 13, cy - 10]], [[cx + 18, cy + 2], [cx + 12, cy + 9], [cx + 15, cy + 14]]], 1.1);
      for (const c of [-1, 1]) { roc(x, cx + c * 24, cy - 12, 10, 9, 46 + c, FER, 7); pointe(x, cx + c * 27, cy - 18, -Math.PI / 2 + c * 0.6, 12, 6); }
      const hx = cx + s * 5, hy = cy - 20;                                                                                              // la tête, enfoncée : un heaume à fente
      for (const c of [-1, 1]) pointe(x, hx + c * 8, hy - 6, -Math.PI / 2 + c * 0.75, 14, 5.5, OS);
      plaque(x, [[hx - 11, hy - 8], [hx + 11, hy - 8], [hx + 12, hy + 7], [hx - 12, hy + 7]], FER, { bord: [[hx - 11, hy - 8], [hx + 11, hy - 8]], riv: [[hx - 8, hy + 4], [hx + 8, hy + 4]] });
      x.fillStyle = '#020203'; x.fillRect(hx - 9 + s, hy - 3.5, 18, 5.5);
      oeil(x, hx - 4.5 + s * 1.5, hy - 0.8, 3.6, -1, s > 0 ? 0.7 : 1); oeil(x, hx + 4.5 + s * 1.5, hy - 0.8, 3.6, 1, s < 0 ? 0.7 : 1);
      P.devant();
      if (nu) {                                                                                                                         // sans sa dalle : le fourneau à nu, les griffes dehors
        fourneau(x, cx + s * 4, cy + 3, 8, 8, s ? 0.8 : 1);
        for (const c of [-1, 1]) bras(x, cx + c * 23, cy - 8, cx + c * (arme && c > 0 ? 34 : 29), cy + (arme && c > 0 ? -22 : frappe && c > 0 ? 34 : 26), 40, c, 1.05);
      } else {
        const dx = cx + s * 9, dy = cy + 4 + (arme ? -8 : frappe ? 9 : 0);
        bras(x, cx - 23, cy - 8, dx - 20, dy - 4, 34, -1, 1, FER, false); bras(x, cx + 23, cy - 8, dx + 20, dy - 4, 34, 1, 1, FER, false);
        roc(x, dx, dy + 6, 25, 34, 47, ROC, 11);
        plaque(x, [[dx - 23, dy - 28], [dx + 23, dy - 28], [dx + 23, dy - 20], [dx - 23, dy - 20]], BRONZE, { riv: [[dx - 18, dy - 24], [dx - 6, dy - 24], [dx + 6, dy - 24], [dx + 18, dy - 24]] });
        plaque(x, [[dx - 25, dy + 14], [dx + 25, dy + 14], [dx + 22, dy + 24], [dx, dy + 46], [dx - 22, dy + 24]], BRONZE, { riv: [[dx - 16, dy + 19], [dx + 16, dy + 19], [dx, dy + 36]] });
        x.shadowColor = 'rgba(255,214,110,1)'; x.shadowBlur = 7; x.strokeStyle = '#ffe08a'; x.lineWidth = 1.8; x.lineCap = 'round'; x.lineJoin = 'round';
        trait(x, [[dx - 9, dy - 6], [dx, dy - 15], [dx + 9, dy - 6]]); x.stroke(); trait(x, [[dx, dy - 15], [dx, dy + 10]]); x.stroke(); trait(x, [[dx - 7, dy + 3], [dx + 7, dy - 2]]); x.stroke(); x.shadowBlur = 0; x.lineCap = 'butt';
        for (const q of [[-17, -9], [17, -9], [-17, 8], [17, 8]]) pointe(x, dx + q[0], dy + q[1], Math.PI / 2 + (q[0] > 0 ? -0.5 : 0.5), 9, 5, FER);
      }
      if (o.gele) glace(x, T);
    },
    // --- le frondeur : une bouche à feu de bronze sur des pattes de crabe. Il reste loin et crache des éclats de braise.
    lanceur(x, T, o) {
      const s = o.yaw, al = allure(o, 10), tire = o.etat === 'frappe';
      const P = pattes(x, s, al, 18, 30, 29, 1.05), cx = al.bal + s * 2, cy = -40 + al.ecr + (tire ? 4 : 0);
      sol(x, 16); P.fond();
      const bx = cx - s * 5, by = cy - 10, bh = tire ? 30 : 36;                                                                         // le canon, sur son dos
      plaque(x, [[bx - 12, by - bh], [bx + 12, by - bh], [bx + 14, by + 4], [bx - 14, by + 4]], BRONZE, { bord: [[bx - 12, by - bh], [bx + 12, by - bh]], riv: [[bx - 9, by - 4], [bx + 9, by - 4]], grav: [[[bx - 13, by - bh * 0.45], [bx + 13, by - bh * 0.45]], [[bx - 13, by - bh * 0.7], [bx + 13, by - bh * 0.7]]] });
      x.shadowColor = '#ff2a00'; x.shadowBlur = tire ? 22 : 9; ell(x, bx, by - bh, 12.5, 5, '#150a06'); ell(x, bx, by - bh, 9.5, 3.4, tire ? '#fff3c4' : '#ff6a22'); x.shadowBlur = 0;
      plaque(x, [[bx - 14, by - bh - 2], [bx + 14, by - bh - 2], [bx + 13, by - bh + 4], [bx - 13, by - bh + 4]], BRONZE, { or: 0.9 }); ell(x, bx, by - bh - 1, 9, 3, tire ? '#fff3c4' : '#ff5a1c');
      for (let i = 0; i < 3; i++) braise(x, bx - 5 + i * 5, by - bh + 1, 9 + (i % 2) * 3, 3.6, (i - 1) * 0.3);
      if (tire) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.3; x.strokeStyle = 'rgba(255,220,150,.9)'; x.lineWidth = 1.6; trait(x, [[bx + Math.cos(a) * 12, by - bh + Math.sin(a) * 6], [bx + Math.cos(a) * 24, by - bh + Math.sin(a) * 18]]); x.stroke(); }
      roc(x, cx, cy, 23, 15, 57); veines(x, [[[cx - 18, cy + 2], [cx - 11, cy + 8]], [[cx + 17, cy], [cx + 11, cy + 7]]], 1);
      plaque(x, [[cx - 20, cy - 13], [cx + 20, cy - 13], [cx + 22, cy - 6], [cx - 22, cy - 6]], BRONZE, { riv: [[cx - 15, cy - 9.5], [cx, cy - 9.5], [cx + 15, cy - 9.5]] });
      P.devant();
      const fx = cx + s * 8, fy = cy + 3;                                                                                               // le masque, à l'avant
      plaque(x, [[fx - 13, fy - 8], [fx + 13, fy - 8], [fx + 10, fy + 8], [fx - 10, fy + 8]], FER, { bord: [[fx - 13, fy - 8], [fx + 13, fy - 8]] });
      x.fillStyle = '#020203'; x.fillRect(fx - 10, fy - 4.5, 20, 5.5);
      oeil(x, fx - 5, fy - 1.8, 3.8, -1, s > 0 ? 0.7 : 1); oeil(x, fx + 5, fy - 1.8, 3.8, 1, s < 0 ? 0.7 : 1);
      dents(x, fx - 8, fx + 8, fy + 3, 5, 5);
      for (const c of [-1, 1]) bras(x, cx + c * 20, cy - 2, cx + c * 27, cy + 20, 26, c, 0.75);
      if (o.gele) glace(x, T);
    },
    // --- le bélier : une bête de roche à tête de fer, deux cornes enroulées, une échine de lames. Il gratte le sol, puis il fonce.
    fonceur(x, T, o) {
      const s = o.yaw, gratte = o.etat === 'gratte', charge = o.etat === 'charge', al = allure(gratte ? { etat: 'marche', k: o.k % 2 ? 4 : 2, pied: 0 } : o, 12);
      const baisse = gratte ? 7 : charge ? 11 : 0, cx = al.bal + s * 2, cy = -50 + al.ecr + (charge ? 4 : 0);
      sol(x, 19);
      for (const c of [-1, 1]) patte(x, cx + c * 9 - s * 8, cy + 8, c * 12 - s * 12, -3, 37, c, 0.85, ROC);                             // les pattes de derrière
      const P = pattes(x, s, al, 16, 36, 31, 1.2); P.fond();
      for (const u of [-2, -1, 0, 1, 2]) pointe(x, cx - s * 7 + u * 7, cy - 15 + Math.abs(u) * 2.5, -Math.PI / 2 + u * 0.22 - s * 0.35, 20 - Math.abs(u) * 4, 7);   // l'échine de lames
      roc(x, cx - s * 3, cy, 26, 21, 68, ['#666a74', '#32353d', '#101116']);
      veines(x, [[[cx - 20, cy - 3], [cx - 13, cy - 10], [cx - 7, cy - 8]], [[cx + 19, cy - 1], [cx + 12, cy - 9]], [[cx - 6, cy + 12], [cx + 4, cy + 16]]], 1.2);
      P.devant();
      const hx = cx + s * 12, hy = cy + 12 + baisse;                                                                                    // la tête, basse
      for (const c of [-1, 1]) {                                                                                                        // les cornes enroulées
        const ox = hx + c * 15, oy = hy - 7;
        x.lineCap = 'round'; x.strokeStyle = NOIR; x.lineWidth = 10.5; x.beginPath(); x.arc(ox, oy, 10, c > 0 ? -2.5 : -0.64, c > 0 ? 1.5 : -4.64, c < 0); x.stroke();
        x.strokeStyle = lin(x, ox - 12, oy - 12, ox + 12, oy + 12, OS); x.lineWidth = 7.5; x.stroke();
        x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1; for (let i = 0; i < 6; i++) { const a = (c > 0 ? -2.5 : -0.64) + (c > 0 ? 1 : -1) * i * 0.62; trait(x, [[ox + Math.cos(a) * 6.5, oy + Math.sin(a) * 6.5], [ox + Math.cos(a) * 13.5, oy + Math.sin(a) * 13.5]]); x.stroke(); }
        x.lineCap = 'butt'; pointe(x, ox + c * 1, oy + 9.5, Math.PI / 2 + c * 1.1, 11, 6, OS);
      }
      plaque(x, [[hx - 13, hy - 14], [hx + 13, hy - 14], [hx + 9, hy + 6], [hx + 5, hy + 15], [hx - 5, hy + 15], [hx - 9, hy + 6]], FER, { bord: [[hx - 13, hy - 14], [hx + 13, hy - 14]], riv: [[hx, hy - 10]], grav: [[[hx, hy - 8], [hx, hy + 5]]] });
      oeil(x, hx - 6.5, hy - 4, 4.4, -1, s > 0 ? 0.75 : 1, 1.3); oeil(x, hx + 6.5, hy - 4, 4.4, 1, s < 0 ? 0.75 : 1, 1.3);
      x.fillStyle = '#020203'; x.fillRect(hx - 4.5, hy + 8, 9, 3.2); dents(x, hx - 4.5, hx + 4.5, hy + 8, 3.6, 4);
      if (gratte || charge) { x.fillStyle = 'rgba(235,240,240,.5)'; ell(x, hx - 9, hy + 13 + (o.k % 2) * 2, 5, 3); ell(x, hx + 10, hy + 14 - (o.k % 2) * 2, 5.6, 3.2); }   // il souffle
      if (charge) { x.strokeStyle = 'rgba(255,200,120,.8)'; x.lineWidth = 1.5; for (const c of [-1, 1]) { trait(x, [[c * 22, -3], [c * 31, -9]]); x.stroke(); trait(x, [[c * 16, -1], [c * 26, -3]]); x.stroke(); } }
      if (o.gele) glace(x, T);
    },
    // --- le tourbillon : un œil de braise dans une cage de bronze, sur deux échasses, quatre grandes lames. Il tourne un temps sur deux.
    danseur(x, T, o) {
      const s = o.yaw, tourne = o.etat === 'tourne', al = allure(o, 15), arme = o.etat === 'arme', frappe = o.etat === 'frappe';
      const P = pattes(x, s, al, 9, 42, 39, 0.72), cx = al.bal + s * 2, cy = -58 + al.ecr;
      sol(x, 14); P.fond();
      const lame = (ang, L) => { x.save(); x.translate(cx, cy); x.rotate(ang); poly(x, [[10, -3], [L * 0.6, -6], [L, 4], [L * 0.55, 3], [12, 4]]); x.fillStyle = lin(x, 10, -5, L * 0.7, 5, FER); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.2; x.lineJoin = 'round'; x.stroke(); x.shadowColor = '#ff2a00'; x.shadowBlur = 4; x.strokeStyle = '#ff6a2a'; x.lineWidth = 0.9; trait(x, [[L * 0.6, -6], [L, 4]]); x.stroke(); x.restore(); };
      if (tourne) {                                                                                                                     // il tourne : les lames à l'horizontale, floues
        x.strokeStyle = 'rgba(210,225,240,.5)'; x.lineWidth = 3; for (const r of [44, 36]) { x.beginPath(); x.ellipse(cx, cy + 2, r, r * 0.3, 0, 0, TAU); x.stroke(); }
        x.save(); x.translate(0, cy * 0.7); x.scale(1, 0.34); x.translate(0, -cy * 0.7); for (let i = 0; i < 2; i++) lame(o.k * 0.8 + i * Math.PI, 46); x.restore();
      } else for (const c of [-1, 1]) { lame(-Math.PI / 2 + c * (arme ? 0.5 : frappe ? 2.2 : 1.0), 40); lame(Math.PI / 2 - c * (frappe ? 0.2 : 0.75), 30); }
      for (const u of [-1, 0, 1]) pointe(x, cx + u * 6, cy - 14, -Math.PI / 2 + u * 0.3, 15 - Math.abs(u) * 4, 5, BRONZE);
      roc(x, cx, cy, 14, 14, 79);
      x.strokeStyle = NOIR; x.lineWidth = 5; x.beginPath(); x.ellipse(cx, cy, 17, 6.5, 0.35, 0, TAU); x.stroke(); x.strokeStyle = BRONZE[0]; x.lineWidth = 2.6; x.stroke();          // la cage de bronze
      x.strokeStyle = NOIR; x.lineWidth = 5; x.beginPath(); x.ellipse(cx, cy, 17, 6.5, -0.35, 0, TAU); x.stroke(); x.strokeStyle = BRONZE[1]; x.lineWidth = 2.6; x.stroke();
      const ex = cx + s * 4, k = tourne ? 0.5 + 0.5 * Math.abs(Math.cos(o.k * 0.8)) : 1;                                                // son œil unique : une pupille en fente
      x.save(); x.translate(ex, cy); x.scale(k, 1); ell(x, 0, 0, 8.6, 7.6, '#020203'); x.shadowColor = '#ff1a00'; x.shadowBlur = 10; ell(x, 0, 0, 6.6, 5.6, '#ff3a10'); x.shadowBlur = 0; ell(x, 0, 0, 3.6, 3, '#ffb060'); poly(x, [[0, -5.2], [1.5, 0], [0, 5.2], [-1.5, 0]]); x.fillStyle = '#120000'; x.fill(); x.restore();
      plaque(x, [[ex - 10, cy - 9], [ex + 10, cy - 9], [ex + 9, cy - 3.5], [ex, cy - 1.5], [ex - 9, cy - 3.5]], FER, { or: 0.8 });   // la paupière de fer, froncée
      P.devant();
      if (o.gele) glace(x, T);
    },
    // --- le colosse : une chaudière de roche et de fer, deux cheminées, des poings à pointes. Lent, il cogne très fort.
    gros(x, T, o) {
      const s = o.yaw, al = allure(o, 12), arme = o.etat === 'arme', frappe = o.etat === 'frappe';
      const P = pattes(x, s, al, 20, 54, 47, 1.6), cx = al.bal + s * 2, cy = -88 + al.ecr, cote = s < 0 ? -1 : 1;
      sol(x, 28); P.fond();
      const poing = (px, py, g) => { roc(x, px, py, 13 * g, 12 * g, 91 + (px > cx ? 1 : 0), ROC, 8); for (const u of [-1, 0, 1]) pointe(x, px + u * 6 * g, py + 7 * g, Math.PI / 2 - u * 0.3, 8 * g, 5 * g); veines(x, [[[px - 7 * g, py - 3 * g], [px + 5 * g, py + 1 * g]]], 1); };
      const fb = [cx - cote * 44, cy + 40]; bras(x, cx - cote * 31, cy - 14, fb[0], fb[1], 62, -cote, 1.6, FER, false); poing(fb[0], fb[1] + 6, 0.92);   // le bras du fond
      for (const c of [-1, 1]) {                                                                                                        // les deux cheminées, sur les épaules
        const qx = cx + c * 24 - s * 3, qy = cy - 30;
        x.fillStyle = 'rgba(120,120,130,.35)'; ell(x, qx + 3, qy - 34, 9, 6); ell(x, qx - 2, qy - 44, 7, 5);
        plaque(x, [[qx - 7, qy - 24], [qx + 7, qy - 24], [qx + 8, qy + 6], [qx - 8, qy + 6]], FER, { bord: [[qx - 7, qy - 24], [qx + 7, qy - 24]], grav: [[[qx - 8, qy - 10], [qx + 8, qy - 10]]] });
        x.shadowColor = '#ff2a00'; x.shadowBlur = 8; ell(x, qx, qy - 24, 6.5, 2.6, '#ff5a1c'); x.shadowBlur = 0;
      }
      plaque(x, [[cx - 22, cy + 26], [cx + 22, cy + 26], [cx + 17, cy + 42], [cx - 17, cy + 42]], FER, { or: 0, riv: [[cx - 12, cy + 33], [cx, cy + 35], [cx + 12, cy + 33]] });
      roc(x, cx, cy, 36, 32, 92, ROC, 12);
      veines(x, [[[cx - 30, cy - 6], [cx - 22, cy - 16], [cx - 14, cy - 12]], [[cx + 29, cy - 2], [cx + 21, cy - 14]], [[cx - 26, cy + 14], [cx - 18, cy + 22]], [[cx + 24, cy + 16], [cx + 15, cy + 24]]], 1.5);
      plaque(x, [[cx - 34, cy - 4], [cx + 34, cy - 4], [cx + 34, cy + 3], [cx - 34, cy + 3]], BRONZE, { riv: [[cx - 27, cy - 0.5], [cx - 14, cy - 0.5], [cx + 14, cy - 0.5], [cx + 27, cy - 0.5]] });   // les cercles de la chaudière
      plaque(x, [[cx - 30, cy + 17], [cx + 30, cy + 17], [cx + 28, cy + 23], [cx - 28, cy + 23]], BRONZE, { riv: [[cx - 20, cy + 20], [cx + 20, cy + 20]] });
      const fx = cx + s * 9; plaque(x, [[fx - 15, cy - 20], [fx + 15, cy - 20], [fx + 12, cy + 12], [fx - 12, cy + 12]], FER, { bord: [[fx - 15, cy - 20], [fx + 15, cy - 20]], riv: [[fx - 11, cy - 16], [fx + 11, cy - 16], [fx - 9, cy + 8], [fx + 9, cy + 8]] });
      fourneau(x, fx, cy - 4, 10, 11, s ? 0.82 : 1, 4);
      P.devant();
      for (const c of [-1, 1]) { const ex = cx + c * 35 - s * 2, ey = cy - 20; roc(x, ex, ey, 15, 13, 93 + c, ROC, 8); for (const u of [-1, 0, 1]) pointe(x, ex + u * 6, ey - 8, -Math.PI / 2 + u * 0.35 + c * 0.25, 13, 6); }
      const hx = cx + s * 7, hy = cy - 34;                                                                                              // la tête : un masque de fer, deux grandes cornes
      for (const c of [-1, 1]) { x.lineCap = 'round'; x.strokeStyle = NOIR; x.lineWidth = 8.5; x.beginPath(); x.moveTo(hx + c * 9, hy - 3); x.quadraticCurveTo(hx + c * 27, hy - 6, hx + c * 25, hy - 27); x.stroke(); x.strokeStyle = lin(x, hx, hy, hx + c * 26, hy - 26, OS); x.lineWidth = 5.6; x.stroke(); x.lineCap = 'butt'; pointe(x, hx + c * 25, hy - 24, -Math.PI / 2 - c * 0.1, 10, 5.6, OS); }
      plaque(x, [[hx - 12, hy - 11], [hx + 12, hy - 11], [hx + 13, hy + 5], [hx + 8, hy + 14], [hx - 8, hy + 14], [hx - 13, hy + 5]], FER, { bord: [[hx - 12, hy - 11], [hx + 12, hy - 11]], riv: [[hx, hy - 7]] });
      x.fillStyle = '#020203'; x.fillRect(hx - 10 + s, hy - 4.5, 20, 6);
      oeil(x, hx - 5 + s * 1.5, hy - 1.6, 4.2, -1, s > 0 ? 0.7 : 1, 1.3); oeil(x, hx + 5 + s * 1.5, hy - 1.6, 4.2, 1, s < 0 ? 0.7 : 1, 1.3);
      x.fillStyle = '#020203'; x.fillRect(hx - 7, hy + 5, 14, 6); dents(x, hx - 7, hx + 7, hy + 5, 4, 5); dents(x, hx - 7, hx + 7, hy + 11, -3.4, 4);
      const fp = arme ? [cx + cote * 46, cy - 46] : frappe ? [cx + cote * 30, cy + 62] : [cx + cote * 46, cy + 42];                      // le bras de devant : levé, puis abattu
      bras(x, cx + cote * 33, cy - 14, fp[0], fp[1], 66, cote, 1.7, FER, false); poing(fp[0], fp[1] + (arme ? -4 : 6), 1.08);
      if (o.gele) glace(x, T);
    },
  };
  function braise(x, cx, cy, h, w, ang) { // un éclat de braise (ce que crache le frondeur)
    x.save(); x.translate(cx, cy); x.rotate(ang);
    x.shadowColor = '#ff3a00'; x.shadowBlur = 8; poly(x, [[0, -h], [w, -h * 0.25], [w * 0.5, 0], [-w * 0.55, 0], [-w, -h * 0.35]]); x.fillStyle = lin(x, 0, -h, 0, 0, ['#fff0b0', '#ff9a30', '#d8300a']); x.fill();
    x.shadowBlur = 0; x.strokeStyle = '#5a1206'; x.lineWidth = 0.9; x.lineJoin = 'round'; x.stroke();
    x.restore();
  }
  function peindre(x, type, o) { PEINTRES[type](x, TYPES[type], o); }

  // ---------- la cuisson : chaque image est peinte une fois, puis gardée ----------
  // (24 nov., 22 h 25 — l'iPhone de Romain ramait à l'acte III : la réserve d'images était trop petite (260) pour six sortes de golems ;
  //  les images étaient jetées puis repeintes sans arrêt, et Safari ne rend pas tout de suite la mémoire d'une toile jetée.
  //  Maintenant : assez de place pour TOUTES les images du jeu (au plus 261), plus d'images à part pour un golem figé, des toiles un peu
  //  moins fines, et une toile jetée est vidée tout de suite.)
  let K = 1.5, cuites = 0; const cuits = new Map(), file = [], glacons = {};
  const cle = (type, o) => type + '/' + o.yaw + '/' + o.etat + '/' + o.k + '/' + (o.pied ? 1 : 0) + '/' + (o.sansBouclier ? 'n' : '');
  const vider = sp => { if (sp && sp.c && (sp.seule || sp.sx == null)) sp.c.width = sp.c.height = 0; };
  // (24 nov., 23 h 23 — ça ramait encore à l'acte IV sur l'iPhone de Romain, comme à l'acte III avant : le souci suit LE NOMBRE d'images
  //  gardées (plus de 200 à l'acte III en version 9, 174 à l'acte IV en version 10). Safari supporte mal des centaines de petites
  //  toiles séparées. Maintenant, toutes les images d'une sorte de golem sont peintes dans UNE SEULE grande toile (une « planche »),
  //  case par case : 7 planches au lieu de 174 toiles.)
  const PLACES = { trotteur: 24, soldat: 24, bouclier: 48, danseur: 30, gros: 24, lanceur: 24, fonceur: 30 }, planches = {};
  function caseLibre(type) {
    const [w, h] = TYPES[type].boite; let A = planches[type];
    if (!A) { const col = 6, lig = Math.ceil(PLACES[type] / col), cw = Math.ceil(w * K), ch = Math.ceil(h * K); A = planches[type] = { c: toile(col * cw, lig * ch), n: 0, col, lig, cw, ch }; A.x = A.c.getContext('2d'); }
    if (A.n >= A.col * A.lig) return null;
    const i = A.n++; return { A, sx: (i % A.col) * A.cw, sy: Math.floor(i / A.col) * A.ch };
  }
  function cuire(type, o) {
    const [w, h, ox, oy] = TYPES[type].boite, q = caseLibre(type); let sp; cuites++;
    if (q) { const x = q.A.x; x.save(); x.beginPath(); x.rect(q.sx, q.sy, q.A.cw, q.A.ch); x.clip(); x.translate(q.sx, q.sy); x.scale(K, K); x.translate(ox, oy); peindre(x, type, o); x.restore(); sp = { c: q.A.c, sx: q.sx, sy: q.sy, sw: q.A.cw, sh: q.A.ch, w, h, ox, oy }; }
    else { sp = sprite(w, h, ox, oy, K, x => peindre(x, type, o)); sp.sx = 0; sp.sy = 0; sp.sw = sp.c.width; sp.sh = sp.c.height; sp.seule = true; }   // (plus de case : ne devrait pas arriver)
    cuits.set(cle(type, o), sp); return sp;
  }
  // le cristal bleu d'un golem figé : une seule image par sorte de golem, posée par-dessus lui
  const glacon = type => glacons[type] || (glacons[type] = (() => { const T = TYPES[type], [w, h, ox, oy] = T.boite; return sprite(w, h, ox, oy, K, x => {
    const r = T.r * 1.7, H = T.haut, c = [[-r, 2], [-r * 1.15, -H * 0.5], [-r * 0.5, -H * 1.04], [r * 0.4, -H * 1.1], [r * 1.15, -H * 0.55], [r, 2]];
    poly(x, c); x.fillStyle = lin(x, -r, -H, r, 0, ['rgba(190,235,255,.5)', 'rgba(110,190,250,.4)', 'rgba(70,150,230,.5)']); x.fill(); x.strokeStyle = 'rgba(225,245,255,.95)'; x.lineWidth = 1.4; x.lineJoin = 'round'; x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1.1; trait(x, [[-r * 0.6, -H * 0.2], [-r * 0.2, -H * 0.8]]); x.stroke(); trait(x, [[r * 0.5, -H * 0.3], [r * 0.2, -H * 0.9]]); x.stroke(); trait(x, [[-r * 1.15, -H * 0.5], [-r * 0.2, -H * 0.55], [r * 0.4, -H * 1.1]]); x.stroke();
  }); })());
  // (le pas n'a que quatre images : 0 il tape, 2 debout, 3 et 4 l'autre pied se lève ; hors de la marche, le pied ne compte pas)
  const normal = o => { const etat = o.etat || 'marche', m = etat === 'marche', k = o.k || 0; return { yaw: o.yaw || 0, etat, k: m && k === 1 ? 2 : k, pied: m && o.pied ? 1 : 0, sansBouclier: !!o.sansBouclier }; };
  function image(type, o) { o = normal(o); return cuits.get(cle(type, o)) || cuire(type, o); }
  // (on ne repeint tout que si la finesse change beaucoup : une simple baisse d'un cran garde les images déjà peintes)
  function regler(k) { k = Math.min(1.5, Math.max(1, k)); if (cuits.size ? (k < K * 0.72 || k > K * 1.3) : Math.abs(k - K) > 0.01) { K = k; cuits.forEach(vider); cuits.clear(); for (const t in planches) { planches[t].c.width = planches[t].c.height = 0; delete planches[t]; } for (const t in glacons) { vider(glacons[t]); delete glacons[t]; } dalle.s = eclat.s = null; } }
  // préparer d'avance la marche des golems d'un acte (un peu à chaque image, quand le jeu a du temps)
  function prevoir(types) {
    for (const type of types) for (const yaw of [0, 1]) {
      for (const pied of [0, 1]) for (const k of [0, 2, 3, 4]) file.push([type, { yaw, etat: 'marche', k, pied }]);
      file.push([type, { yaw, etat: 'arme', k: 0, pied: 0 }], [type, { yaw, etat: 'frappe', k: 0, pied: 0 }]);
      if (type === 'danseur') for (const k of [0, 1, 2, 3]) file.push([type, { yaw, etat: 'tourne', k }]);
      if (type === 'fonceur') file.push([type, { yaw, etat: 'gratte', k: 0 }], [type, { yaw, etat: 'gratte', k: 1 }], [type, { yaw, etat: 'charge', k: 0 }]);
      if (type === 'bouclier') { for (const pied of [0, 1]) for (const k of [0, 2, 3, 4]) file.push([type, { yaw, etat: 'marche', k, pied, sansBouclier: true }]); file.push([type, { yaw, etat: 'arme', k: 0, sansBouclier: true }], [type, { yaw, etat: 'frappe', k: 0, sansBouclier: true }]); }
    }
  }
  function precuire(ms) { const t0 = performance.now(); while (file.length && performance.now() - t0 < ms) { const [type, o] = file.shift(), n = normal(o); if (!cuits.has(cle(type, n))) cuire(type, n); } return file.length; }
  // dessiner un golem : (x, y) ses pieds ; sc sa taille ; leve : il sort du sol (0 à 1) — gardé pour les essais ; le jeu les fait entrer par les portes
  function dessiner(g, type, x, y, sc, o, leve = 1) {
    // (tourné à gauche : c'est le reflet exact du golem tourné à droite — ils sont symétriques, et l'autre pied tape ; un tiers d'images en moins à peindre et à garder)
    const T = TYPES[type];
    if (o.yaw < 0) {
      const sp = image(type, { ...o, yaw: 1, pied: o.pied ? 0 : 1 });
      g.save(); g.translate(x, y); g.scale(-sc, sc); g.drawImage(sp.c, sp.sx, sp.sy, sp.sw, sp.sh, -sp.ox, -sp.oy, sp.w, sp.h); if (o.gele) { const gl = glacon(type); g.drawImage(gl.c, -gl.ox, -gl.oy, gl.w, gl.h); } g.restore();
      return y - T.haut * sc;
    }
    const sp = image(type, o);
    g.drawImage(sp.c, sp.sx, sp.sy, sp.sw, sp.sh, x - sp.ox * sc, y - sp.oy * sc, sp.w * sc, sp.h * sc);
    if (o.gele && leve >= 1) { const gl = glacon(type); g.drawImage(gl.c, x - gl.ox * sc, y - gl.oy * sc, gl.w * sc, gl.h * sc); }
    return y - T.haut * sc * Math.min(1, leve);
  }
  const dalle = () => dalle.s || (dalle.s = sprite(70, 46, 35, 30, K, x => { // la dalle lâchée par terre
    ell(x, 0, 5, 30, 9, 'rgba(0,0,0,.45)'); x.save(); x.scale(1, 0.46); roc(x, 0, -4, 26, 30, 47, ROC, 11); x.restore();
    plaque(x, [[-22, -16], [22, -16], [24, -11], [-24, -11]], BRONZE, { riv: [[-14, -13.5], [14, -13.5]] });
    x.shadowColor = 'rgba(255,214,110,1)'; x.shadowBlur = 5; x.strokeStyle = '#ffe08a'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(0, -1, 9, 3.6, 0, 0, TAU); x.stroke();
  }));
  const eclat = () => eclat.s || (eclat.s = sprite(40, 40, 20, 20, K, x => braise(x, 0, 9, 19, 8, 0)));
  return { TYPES, PAL, peindre, image, dessiner, regler, prevoir, precuire, dalle, eclat, get cuits() { return cuits.size; }, get cuites() { return cuites; }, get planches() { return Object.keys(planches).length; }, get file() { return file.length; } };
})();
