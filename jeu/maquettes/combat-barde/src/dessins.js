// ===== DESSINS : le Barde, le métronome, les petites icônes (le décor, Grosbec et les golems ont leurs fichiers) =====
const Dessin = (() => {
  const TAU = Math.PI * 2;
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    if (g.roundRect) { g.roundRect(x, y, w, h, r); return; }
    r = Math.min(r, w / 2, h / 2);
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function ell(g, x, y, rx, ry, col, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, TAU); g.fillStyle = col; g.fill(); }
  function alea(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function lin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; }
  function rad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; }

  function barde(g, x, y, o) {
    g.save(); g.translate(x, y);
    ell(g, 0, 2, 24, 7, 'rgba(0,0,0,.4)');
    g.scale(1 + o.bob * 0.05, 1 - o.bob * 0.07);
    if (o.spin > 0 && o.spin < 1) { const c = Math.cos(o.spin * TAU); g.scale(Math.abs(c) < 0.1 ? (c < 0 ? -0.1 : 0.1) : c, 1); }
    const violet = lin(g, -18, 0, 18, 0, ['#4a1f70', '#9150cc', '#5b2a86']);
    // les jambes
    g.fillStyle = '#2e1b46'; rr(g, -10, -28, 8, 26, 3); g.fill(); rr(g, 2, -28, 8, 26, 3); g.fill();
    g.fillStyle = '#6b4424'; ell(g, -8, -2, 7, 4, '#6b4424'); ell(g, 8, -2, 7, 4, '#6b4424');
    // le pourpoint
    g.fillStyle = violet; g.beginPath(); g.moveTo(-15, -57); g.quadraticCurveTo(-21, -40, -15, -24); g.lineTo(15, -24); g.quadraticCurveTo(21, -40, 15, -57); g.closePath(); g.fill();
    g.fillStyle = '#d9a83c'; g.fillRect(-15, -31, 30, 4);
    g.strokeStyle = '#e8c070'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -56); g.lineTo(0, -31); g.stroke();
    ell(g, -16, -52, 7, 6, '#a868e6'); ell(g, 16, -52, 7, 6, '#a868e6');
    // le bras gauche tient le manche
    g.fillStyle = '#7d3fb5'; g.save(); g.translate(-15, -52); g.rotate(0.9); rr(g, -3.5, 0, 7, 20, 3); g.fill(); g.restore();
    // le luth
    g.save(); g.translate(-2, -38); g.rotate(-0.85 + (o.joue ? Math.sin(o.t * 18) * 0.04 : 0));
    g.fillStyle = '#5a3416'; rr(g, -3, -38, 6, 30, 2); g.fill();
    g.fillStyle = '#3d220d'; g.save(); g.translate(0, -38); g.rotate(-0.5); rr(g, -3.5, -9, 7, 10, 2); g.fill(); g.restore();
    ell(g, 0, 2, 11, 14, lin(g, -11, 0, 11, 0, ['#8a4e1c', '#d0893e', '#9a5a22']));
    ell(g, 0, -2, 3.6, 3.6, '#2a160a');
    g.strokeStyle = 'rgba(255,240,210,.6)'; g.lineWidth = 0.6; g.beginPath(); for (const dx of [-1.5, 0, 1.5]) { g.moveTo(dx, -36); g.lineTo(dx, 9); } g.stroke();
    g.fillStyle = '#3d220d'; g.fillRect(-4, 8, 8, 2.4);
    g.restore();
    // le bras droit qui gratte
    const gr = o.joue ? Math.sin(o.t * 18) * 5 : o.chante * 4;
    g.fillStyle = '#7d3fb5'; g.save(); g.translate(15, -52); g.rotate(1.9 + gr * 0.03); rr(g, -3.5, 0, 7, 20, 3); g.fill(); g.restore();
    ell(g, 4, -36 + gr, 4, 4, '#f1c9a5');
    // la fraise blanche
    for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; ell(g, Math.cos(a) * 12, -59 - Math.sin(a) * -3, 4.5, 3.6, i % 2 ? '#ffffff' : '#e8e4dc'); }
    // la tête
    ell(g, 0, -72, 11.5, 12, '#f1c9a5');
    ell(g, -6.5, -68, 3, 2, 'rgba(230,120,120,.45)'); ell(g, 6.5, -68, 3, 2, 'rgba(230,120,120,.45)');
    g.fillStyle = '#2b1a12';
    if (o.mal > 0.3) { g.strokeStyle = '#2b1a12'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-6, -75); g.lineTo(-2, -72); g.moveTo(-6, -71); g.lineTo(-2, -74); g.moveTo(6, -75); g.lineTo(2, -72); g.moveTo(6, -71); g.lineTo(2, -74); g.stroke(); }
    else { ell(g, -4, -73, 1.6, 2, '#2b1a12'); ell(g, 4, -73, 1.6, 2, '#2b1a12'); }
    if (o.chante > 0.05) ell(g, 0, -66, 2.6, 2 + o.chante * 2.6, '#7a2226');
    else { g.strokeStyle = '#7a2226'; g.lineWidth = 1.4; g.beginPath(); g.arc(0, -68, 3.4, 0.25, Math.PI - 0.25); g.stroke(); }
    // le chapeau et sa plume
    g.save(); g.translate(1, -82); g.rotate(-0.14);
    g.strokeStyle = '#f7f2e6'; g.lineWidth = 3.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(6, -3); g.quadraticCurveTo(24, -12 + o.bob * 2, 30, -30 + o.bob * 3); g.stroke();
    g.strokeStyle = '#e0b04a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(27, -22 + o.bob * 2); g.quadraticCurveTo(29.5, -27, 30, -30 + o.bob * 3); g.stroke();
    ell(g, 0, 0, 17, 5, '#5b2a86');
    g.fillStyle = lin(g, -10, 0, 10, 0, ['#5b2a86', '#a35fe0', '#6a33a0']); g.beginPath(); g.ellipse(-1, -3, 11, 9, 0, Math.PI, TAU); g.fill();
    g.fillStyle = '#d9a83c'; g.fillRect(-11, -3.5, 21, 2.4);
    g.restore();
    if (o.mal > 0) { g.globalAlpha = o.mal * 0.5; g.fillStyle = '#ff2a2a'; ell(g, 0, -45, 22, 42, '#ff2a2a'); g.globalAlpha = 1; }
    g.restore();
  }

  // ---------------- les automates de Grosbec ----------------
  // les golems (pour les petites images d'explication) : on passe par leurs images cuites
  const TYPES = Golems.TYPES;
  function automate(g, type, x, y, o = {}) {
    const etat = o.bras === 1 ? 'arme' : o.bras === 2 ? 'frappe' : o.gratte ? 'gratte' : o.tourne ? 'tourne' : 'marche';
    return { tete: Golems.dessiner(g, type, x, y - (o.hop ? 2 : 0), 1, { yaw: 0, etat, k: o.hop ? 4 : etat === 'marche' ? 2 : 1, pied: 0, sansBouclier: o.sansBouclier, gele: o.gele }) };
  }
  function boulon(g, x, y, rot) { const e = Golems.eclat(); g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(e.c, -e.ox, -e.oy, e.w, e.h); g.restore(); }
  function bouclierSol(g, x, y) { const d = Golems.dalle(); g.drawImage(d.c, x - d.ox, y - d.oy, d.w, d.h); }
  function metronome(g, x, y, ang, coup, cote, A) {
    g.save(); g.translate(x, y);
    const L = 56, piv = -12;
    // les deux clochettes, au bout de la course du balancier
    for (const sd of [-1, 1]) {
      const bx = Math.sin(sd * A) * (L + 4), by = piv - Math.cos(A) * (L + 4), lit = cote === sd ? coup : 0;
      if (lit > 0) { g.fillStyle = rad(g, bx, by, 1, 26, [`rgba(255,226,138,${0.9 * lit})`, 'rgba(255,226,138,0)']); g.fillRect(bx - 26, by - 26, 52, 52); }
      ell(g, bx, by, 6 + lit * 2, 6 + lit * 2, lit > 0.3 ? '#fff1b0' : '#c99a3a');
      ell(g, bx - 1.5, by - 1.5, 2, 2, 'rgba(255,255,255,.6)');
    }
    g.fillStyle = lin(g, -26, 0, 26, 0, ['#5a3416', '#b0703a', '#6b3d18']);
    g.beginPath(); g.moveTo(-25, 0); g.lineTo(-10, -60); g.lineTo(10, -60); g.lineTo(25, 0); g.closePath(); g.fill();
    g.fillStyle = '#2b1a0e'; g.beginPath(); g.moveTo(-15, -8); g.lineTo(-6, -54); g.lineTo(6, -54); g.lineTo(15, -8); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,226,138,.5)'; g.lineWidth = 1;
    for (let k = 0; k < 6; k++) { const yy = -18 - k * 6; g.beginPath(); g.moveTo(-3, yy); g.lineTo(3, yy); g.stroke(); }
    g.fillStyle = '#3d220d'; rr(g, -30, -6, 60, 9, 3); g.fill();
    g.save(); g.translate(0, piv); g.rotate(ang);
    g.strokeStyle = '#e3c27a'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -L); g.stroke();
    g.fillStyle = lin(g, -7, 0, 7, 0, ['#8a5c25', '#f0c868', '#8a5c25']); rr(g, -7, -40, 14, 11, 3); g.fill();
    ell(g, 0, -L, 3.5, 3.5, '#f0c868');
    g.restore();
    ell(g, 0, piv, 4, 4, '#f0c868');
    g.restore();
  }

  // ---------------- petites choses ----------------
  function coeur(g, x, y, s, col) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = col; g.beginPath(); g.moveTo(0, 6);
    g.bezierCurveTo(-10, -1, -7, -9, 0, -4); g.bezierCurveTo(7, -9, 10, -1, 0, 6); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-3.4, -3.6, 2, 1.3, -0.6, 0, TAU); g.fill();
    g.restore();
  }
  function guitareIcone(g, x, y, s, col) {
    g.save(); g.translate(x, y); g.rotate(-0.7); g.scale(s, s);
    g.fillStyle = col; ell(g, 0, 6, 7, 8, col); ell(g, 0, -3, 5, 6, col);
    g.fillRect(-1.6, -22, 3.2, 18); g.fillRect(-3, -26, 6, 5);
    ell(g, 0, 3, 2.2, 2.2, 'rgba(0,0,0,.45)');
    g.restore();
  }
  function noteMus(g, x, y, s, col) {
    g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = col;
    ell(g, -3, 4, 4.2, 3.2, col, -0.4); g.lineWidth = 2; g.beginPath(); g.moveTo(0.6, 3); g.lineTo(0.6, -10); g.quadraticCurveTo(5, -8, 7, -4); g.stroke();
    g.restore();
  }

  return { barde, automate, boulon, bouclierSol, metronome, coeur, guitareIcone, noteMus, rr, ell, lin, rad, TYPES, TAU };
})();
