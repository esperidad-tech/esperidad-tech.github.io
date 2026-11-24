  if (!isSage) {
    // un ami, vu de dos : il fait face à Grosbec. Peint une fois, recopié ; un petit sursaut quand il tire sur Grosbec
    const sp = R8.spr.dos[id], T = R8.tir[id], kick = T && T.kick > t ? (T.kick - t) / 0.2 * 4 : 0;
    ctx.drawImage(sp.c, -sp.ox, -sp.oy + by - kick, sp.w, sp.h);
    if (id === 'P' && f.leap) { ctx.strokeStyle = '#d8dde8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(14, by - 30); ctx.lineTo(30, by - 40); ctx.stroke(); }   // la dague en avant
    if (id === 'A') { for (let i = 0; i < 2; i++) { const p = (t * 1.3 + i * 0.5) % 1; ctx.globalAlpha = 1 - p; ctx.fillStyle = '#b8ffd0'; ctx.beginPath(); ctx.arc(21 + Math.sin(p * 9 + i) * 2, by - 68 - p * 12 - kick, 1.8, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }   // sa fiole bouillonne
  }
