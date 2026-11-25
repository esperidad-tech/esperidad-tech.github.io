// ----- Grosbec dans son armure, en haut de la salle, devant la grande arche -----
// C'est le modèle du combat du Barde (barde/grosbec.js), vu d'un peu plus haut. Son dessin en volume coûte cher :
// ici il est « cuit » en une quinzaine d'images, une fois, puis recopié (une seule image à poser, à chaque fois).
const GB = { x: 450, y: 80, h: 172, B: { x0: -212, y0: -306, w: 424, h: 342 }, kc: 0, im: {}, pts: {}, file: [], poses: null, etat: '', g: null, flash: 0, rage: 0, mots: null, n: 0 };
function gbPoses() {
  const P = 0.5, E = Gros.G, g = (cles, t) => Gros.geste(cles, t) || {};
  const mal = { gx: -27, gy: -113, gz: 15, dx: 27, dy: -113, dz: 15, go: 1, do_: 1, penche: 0.12, bas: 11, hoche: 0.22, yeux: 0.45, lumG: 0.5, lumD: 0.5, lumC: 0.5 };
  return {
    r0: {}, rg2: { tete: -0.2 }, rg: { tete: -0.42, cap: -0.07 }, rd2: { tete: 0.2 }, rd: { tete: 0.42, cap: 0.07 },                            // au repos : sa tête surveille la salle
    eaG: g(E.envoi(-1, P), -0.3 * P), ebG: g(E.envoi(-1, P), -0.03), ecG: g(E.envoi(-1, P), 0.32 * P),                                        // il envoie ses golems (bras gauche…
    eaD: g(E.envoi(1, P), -0.3 * P), ebD: g(E.envoi(1, P), -0.03), ecD: g(E.envoi(1, P), 0.32 * P),                                           // … ou droit)
    sa: g(E.silence(), 0.4), sb: g(E.silence(), 0.7),                                                                                         // la colère : les poings au ciel, puis il frappe du pied
    ta: g(E.touche(1), 0.02), tb: g(E.touche(1), 0.3),                                                                                        // touché : il part en arrière
    fin: mal                                                                                                                                  // l'armure tombe : il se tient la tête
  };
}
// à quelle finesse le cuire (selon l'écran), et quoi recuire quand son état change (son casque se fend à chaque code, il enrage)
// le casque se fend à chaque ami vainqueur : de 0 à 3 fissures, quel que soit le nombre d'amis (2 depuis la version 17)
const gbFissures = () => Math.round(s.entered.length * 3 / G.ORDER.length);
function gbRegler(kv, etat) {
  const kc = Math.round(Math.min(1, Math.max(0.3, GB.h / 286 * kv * 0.85)) * 20) / 20;
  if (kc === GB.kc && etat === GB.etat) return;
  if (kc !== GB.kc) { Gros.construire(1, kc); for (const n in GB.im) GB.im[n].width = GB.im[n].height = 0; GB.im = {}; GB.pts = {}; }
  GB.kc = kc; GB.etat = etat; GB.poses = GB.poses || gbPoses(); GB.file = Object.keys(GB.poses);
}
function gbCuire(nom) {
  const kc = GB.kc, B = GB.B, c = mk(B.w * kc, B.h * kc), g = c.getContext('2d'), [fis, col] = GB.etat.split('|').map(Number);
  g.scale(kc, kc); g.translate(-B.x0, -B.y0);
  Gros.image(g, GB.poses[nom], { pul: 0.5, fissures: nom === 'fin' ? 5 : fis, colere: nom === 'sa' || nom === 'sb' ? 1 : col }, 1.2 + GB.n++);
  const vieux = GB.im[nom]; GB.im[nom] = c; if (vieux) vieux.width = vieux.height = 0; const q = {}; for (const n of ['tete', 'lanG', 'lanD', 'coeur']) { const p = Gros.point(n, 0, 0); q[n] = [p.x / kc, p.y / kc]; } GB.pts[nom] = q;
}
// un peu de cuisson : une image de Grosbec, sinon quelques golems (à chaque image du jeu, et pendant qu'on lit l'explication)
function cuisson(ms = 3) {
  if (GB.file.length) {   // en plein combat : une image de Grosbec toutes les 0,12 seconde, pas plus ; entre deux, on avance les golems
    const m = performance.now();
    if (!(s && !paused) || m - (GB.tc || 0) >= 120) { GB.tc = m; gbCuire(GB.file.shift()); R8.cuit = 2; return true; }
  }
  return Golems.precuire(ms) > 0 || GB.file.length > 0;
}
function gbGeste(nom, sd, t) { if (GB.g && GB.g.nom === 'silence' && t - GB.g.t0 < 1.2) return; GB.g = { nom, sd, t0: t }; }
function gbImage(t) {
  if (s.over === 'win') return 'fin';
  const g = GB.g;
  if (g) { const u = t - g.t0;
    if (g.nom === 'envoi') { if (u < 0.3) return 'ea' + g.sd; if (u < 0.62) return 'eb' + g.sd; if (u < 0.95) return 'ec' + g.sd; }
    else if (g.nom === 'silence') { if (u < 0.5) return 'sa'; if (u < 1.25) return 'sb'; }
    else if (g.nom === 'touche') { if (u < 0.32) return 'ta'; if (u < 0.8) return 'tb'; }
    GB.g = null; }
  return ['r0', 'rd2', 'rd', 'rd', 'rd2', 'r0', 'rg2', 'rg', 'rg', 'rg2'][Math.floor(t / 0.62) % 10];
}
// où le viser (sa poitrine, son casque), dans la salle
function gbPoint(n) { const P = GB.pts.r0, q = P && P[n], gk = GB.h / 286; return q ? { x: GB.x + q[0] * gk, y: GB.y + q[1] * gk } : { x: GB.x, y: GB.y - GB.h * (n === 'tete' ? 0.86 : 0.62) }; }
function drawGrosbec(t) {
  const nom = gbImage(t), c = GB.im[nom] || GB.im.r0, B = GB.B, gk = GB.h / 286, won = s.over === 'win', bob = won ? 0 : Math.sin(t * 1.6) * 1.2;
  if (!c) { ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(GB.x, GB.y, 60, 16, 0, 0, TAU); ctx.fill(); return; }
  const x = GB.x + B.x0 * gk, y = GB.y + B.y0 * gk + bob, w = B.w * gk, h = B.h * gk;
  ctx.drawImage(c, x, y, w, h);
  if (GB.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, GB.flash * 8) * 0.5; ctx.drawImage(c, x, y, w, h); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  const P = GB.pts[nom] || GB.pts.r0;
  if (P && !won) {   // ses lanternes battent (rouges quand il enrage)
    ctx.globalAlpha = 0.2 + 0.14 * Math.sin(t * 3.2) + (s.rage ? 0.14 : 0);
    for (const n of ['lanG', 'lanD', 'coeur']) { const q = P[n]; ctx.drawImage(s.rage ? R8.spr.glowFire : R8.spr.glowGold, GB.x + q[0] * gk - 27, GB.y + q[1] * gk + bob - 27, 54, 54); }
    ctx.globalAlpha = 1;
  }
  if (won) {         // l'armure tombe : il est pris dans le grand cristal
    const W2 = 96, H2 = GB.h + 16, y0 = GB.y + 8, X = GB.x;
    ctx.beginPath(); ctx.moveTo(X - W2, y0); ctx.lineTo(X - W2 * 1.12, y0 - H2 * 0.5); ctx.lineTo(X - W2 * 0.5, y0 - H2 * 1.02); ctx.lineTo(X + W2 * 0.45, y0 - H2 * 1.06); ctx.lineTo(X + W2 * 1.12, y0 - H2 * 0.55); ctx.lineTo(X + W2, y0); ctx.closePath();
    ctx.fillStyle = 'rgba(150,215,255,.26)'; ctx.fill(); ctx.strokeStyle = 'rgba(225,245,255,.9)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - W2 * 0.62, y0 - H2 * 0.2); ctx.lineTo(X - W2 * 0.25, y0 - H2 * 0.82); ctx.moveTo(X + W2 * 0.5, y0 - H2 * 0.15); ctx.lineTo(X + W2 * 0.72, y0 - H2 * 0.5); ctx.stroke();
    ctx.strokeStyle = '#6fe3ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(X, y0 - 2, W2 * 1.1, 26, 0, 0, TAU); ctx.stroke();
  }
}
// ce que Grosbec fait quand le combat change : il envoie ses golems à chaque grosse vague, il encaisse quand un ami gagne, il enrage
const GBMOTS = ['Allez, allez !', 'Écrasez-les !', 'Allez ! Plus vite !', 'Attrapez-les !'];
function gbSuivre(t, dt) {
  if (R8.jeu !== s) { R8.jeu = s; GB.g = null; GB.rage = 0; GB.flash = 0; GB.mots = null; R8.tirs = []; R8.tir = {}; R8.anim.clear(); }
  if (GB.flash > 0) GB.flash -= dt;
  gbRegler(view().k / (FIN || 1), gbFissures() + '|' + (s.rage ? 1 : 0));   // la même taille que dans ensureSprites : sans la finesse
  if ((s.rage || 0) > GB.rage) { GB.rage = s.rage; GB.g = { nom: 'silence', t0: t }; GB.mots = { t0: t, txt: s.rage === 1 ? 'ASSEZ !' : 'RRAAAH !' }; }
}
function gbFx(e, t) {
  if (e.k === 'side') {
    gbGeste('envoi', e.side === 3 ? 'G' : e.side === 1 ? 'D' : Math.random() < 0.5 ? 'G' : 'D', t);
    if (GB.g && GB.g.nom === 'envoi' && GB.g.t0 === t && (!GB.mots || t - GB.mots.t0 > 1.5)) GB.mots = { t0: t, txt: GBMOTS[Math.floor(Math.random() * GBMOTS.length)] };
  }
  if (e.k === 'free') { GB.g = { nom: 'touche', t0: t }; GB.flash = 0.25; const p = gbPoint('tete'); burst(p.x, p.y, 26, { k: 'spark', col: '#ffd23f', v0: 80, v1: 300, vz0: 40, vz1: 200, s0: 2, s1: 4.5, g: 300 }); }
}

// ----- les amis attaquent Grosbec, de temps en temps : des flèches, des potions, des éclairs (pour le spectacle : ça ne change rien au combat) -----
function tirsAmis(t, dt) {
  if (!s.over) for (const f of s.friends) {
    const T = R8.tir[f.id] || (R8.tir[f.id] = { next: t + 1.2 + Math.random() * 3.5, kick: 0 });
    if (t < T.next || f.leap) continue;
    T.next = t + (f.free ? 5.5 : 3.2) + Math.random() * 2.6; T.kick = t + 0.2;
    const c = gbPoint(f.id === 'P' ? 'tete' : 'coeur');
    R8.tirs.push({ id: f.id, x0: f.x + (f.id === 'A' ? 20 : f.id === 'P' ? -14 : 0), y0: f.y - (f.id === 'A' ? 30 : 8), x1: c.x + rnd(-16, 16), y1: c.y + rnd(-10, 14), t: 0, max: f.id === 'B' ? 0.24 : f.id === 'P' ? 0.42 : 0.8, col: f.id === 'A' ? ['#7ef0a0', '#ffb347', '#c77dff'][Math.floor(Math.random() * 3)] : '' });
  }
  for (const p of R8.tirs) {
    p.t += dt;
    if (p.t >= p.max && !p.fini) { p.fini = true; GB.flash = Math.max(GB.flash, 0.12);
      burst(p.x1, p.y1, p.id === 'A' ? 12 : 7, { k: 'spark', col: p.id === 'P' ? '#fff6c9' : p.id === 'A' ? p.col : '#ffb0f0', v0: 50, v1: 190, vz0: 20, vz1: 120, s0: 2, s1: 3.6, g: 240 }); }
  }
  if (R8.tirs.length) R8.tirs = R8.tirs.filter(p => !p.fini);
}
function drawTirs(t) {
  for (const p of R8.tirs) {
    const u = Math.min(1, p.t / p.max), x = p.x0 + (p.x1 - p.x0) * u, y = p.y0 + (p.y1 - p.y0) * u;
    if (p.id === 'P') {         // une flèche du Pisteur
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.y1 - p.y0, p.x1 - p.x0)); ctx.strokeStyle = '#7a5130'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(8, 0); ctx.stroke(); ctx.fillStyle = '#c8ccd6'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(6, -3.5); ctx.lineTo(6, 3.5); ctx.fill(); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(-17, -3, 5, 6); ctx.restore();
    } else if (p.id === 'A') {  // une fiole de l'Alchimiste, en cloche
      const yy = y - Math.sin(u * Math.PI) * 70;
      ctx.save(); ctx.translate(x, yy); ctx.rotate(u * 9); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(0, 1, 5.5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8f5ff'; ctx.lineWidth = 1.3; ctx.stroke(); ctx.fillStyle = '#c9a15a'; ctx.fillRect(-1.7, -8, 3.4, 4.5); ctx.restore();
    } else {                    // un éclair de musique du Barde
      ctx.globalAlpha = 1 - u * 0.6; const pts = [{ x: p.x0, y: p.y0 }, { x: (p.x0 + p.x1) / 2 + Math.sin(p.x1) * 14, y: (p.y0 + p.y1) / 2 }, { x: p.x1, y: p.y1 }];
      zigzag(pts, 'rgba(255,120,220,.55)', 8, 13); zigzag(pts, '#fff6c9', 3, 13); ctx.globalAlpha = 1;
    }
  }
}
