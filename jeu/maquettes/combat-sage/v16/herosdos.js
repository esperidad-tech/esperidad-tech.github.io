// ----- les amis, vus de dos : ils font face à Grosbec (peints une fois, puis recopiés). Le Pisteur n'est plus dessiné depuis la version 17 (son dessin est gardé ici au cas où) -----
function heroDos(id, sc) {
  const W = 78, H = 100, OX = 39, OY = 90, c = mk(W * sc, H * sc), x = c.getContext('2d'); x.scale(sc, sc); x.translate(OX, OY); x.lineCap = 'round';
  const E = (cx, cy, rx, ry, col, rot = 0) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, TAU); if (col) { x.fillStyle = col; x.fill(); } };
  const D = (x0, y0, x1, y1, a, b) => { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const RR = (rx, ry, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(rx, ry, w, h, r) : x.rect(rx, ry, w, h); };
  const bottes = col => { for (const sd of [-1, 1]) E(sd * 6, -2, 6, 3.6, col); };
  const robe = (w, h, col, dark, hem) => {
    x.fillStyle = D(-w / 2, -40, w / 2, -40 + h, col, dark); x.beginPath(); x.moveTo(-w * .32, -40); x.lineTo(w * .32, -40); x.quadraticCurveTo(w * .6, -40 + h * .7, w * .52, -40 + h); x.quadraticCurveTo(0, -40 + h * 1.08, -w * .52, -40 + h); x.quadraticCurveTo(-w * .6, -40 + h * .7, -w * .32, -40); x.closePath(); x.fill();
    x.lineWidth = 1.6; x.strokeStyle = 'rgba(10,10,20,.55)'; x.stroke();
    if (hem) { x.strokeStyle = hem; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-w * .5, -40 + h * .97); x.quadraticCurveTo(0, -40 + h * 1.05, w * .5, -40 + h * .97); x.stroke(); }
  };
  const cape = (w, y1, col, dark, hem) => {
    x.fillStyle = D(0, -44, 0, y1, col, dark); x.beginPath(); x.moveTo(-w * .42, -43); x.quadraticCurveTo(0, -47, w * .42, -43); x.quadraticCurveTo(w * .64, (y1 - 43) / 2, w * .52, y1); x.quadraticCurveTo(0, y1 + 5, -w * .52, y1); x.quadraticCurveTo(-w * .64, (y1 - 43) / 2, -w * .42, -43); x.closePath(); x.fill();
    x.lineWidth = 1.4; x.strokeStyle = 'rgba(10,10,20,.5)'; x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.22)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, -43); x.lineTo(0, y1 + 2); x.moveTo(-w * .26, -40); x.lineTo(-w * .3, y1); x.moveTo(w * .26, -40); x.lineTo(w * .3, y1); x.stroke();
    if (hem) { x.strokeStyle = hem; x.lineWidth = 1.8; x.beginPath(); x.moveTo(-w * .5, y1 - 1); x.quadraticCurveTo(0, y1 + 4, w * .5, y1 - 1); x.stroke(); }
  };
  const capuche = (col, dark) => {
    x.fillStyle = D(-12, -66, 12, -42, col, dark); x.beginPath(); x.moveTo(-12.5, -44); x.quadraticCurveTo(-14.5, -66, 0.5, -66.5); x.quadraticCurveTo(14, -66, 12.5, -44); x.quadraticCurveTo(0, -38, -12.5, -44); x.closePath(); x.fill();
    x.lineWidth = 1.4; x.strokeStyle = 'rgba(10,10,20,.5)'; x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, -65); x.quadraticCurveTo(1.5, -54, 0, -42); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.16)'; x.beginPath(); x.moveTo(-8, -60); x.quadraticCurveTo(-10, -52, -9, -47); x.stroke();
  };
  if (id === 'P') {          // le Pisteur : sa cape verte, son carquois en travers du dos, son arc sur le côté
    bottes('#4a3220'); robe(30, 32, '#8a5a34', '#55361e');
    const a0 = Math.PI - 1.15, a1 = Math.PI + 1.15;
    x.strokeStyle = '#6b4424'; x.lineWidth = 3; x.beginPath(); x.arc(-13, -30, 19, a0, a1); x.stroke();
    x.strokeStyle = '#e8e0d0'; x.lineWidth = 1; x.beginPath(); x.moveTo(-13 + Math.cos(a0) * 19, -30 + Math.sin(a0) * 19); x.lineTo(-13 + Math.cos(a1) * 19, -30 + Math.sin(a1) * 19); x.stroke();
    cape(30, -12, '#3f8f4a', '#24572b');
    x.save(); x.translate(3, -31); x.rotate(0.42); x.fillStyle = '#6b4424'; RR(-4.5, -13, 9, 26, 3); x.fill(); x.strokeStyle = '#3a2412'; x.lineWidth = 1.2; x.stroke(); x.fillStyle = '#d9b48c'; x.fillRect(-4.5, -6, 9, 2);
    for (const [fx, col] of [[-2.6, '#f4f0e8'], [0, '#e0584a'], [2.6, '#f4f0e8']]) { x.strokeStyle = '#7a5130'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(fx, -13); x.lineTo(fx, -19); x.stroke(); x.fillStyle = col; x.beginPath(); x.moveTo(fx, -25); x.lineTo(fx + 2.2, -19); x.lineTo(fx - 2.2, -19); x.closePath(); x.fill(); }
    x.restore();
    capuche('#4fa65a', '#24572b');
    E(-17, -31, 3.2, 3.2, SKIN);
  }
  if (id === 'A') {          // l'Alchimiste : sa robe violette, sa sacoche, ses fioles à la ceinture, une fiole levée
    bottes('#3a2a20'); robe(32, 34, '#7b4bc4', '#3f2270');
    x.strokeStyle = '#4a2e18'; x.lineWidth = 3; x.beginPath(); x.moveTo(11, -41); x.lineTo(-12, -18); x.stroke();
    x.fillStyle = '#8a5a33'; RR(-20, -22, 13, 13, 3); x.fill(); x.strokeStyle = '#4a2e18'; x.lineWidth = 1.2; x.stroke(); x.fillStyle = '#c9a15a'; x.fillRect(-15, -17, 3, 3);
    x.fillStyle = '#4a2e18'; x.fillRect(-12, -25, 24, 3.4);
    for (const [i, col] of [[0, '#7ef0a0'], [1, '#ffd23f'], [2, '#ff6a7a']]) { E(-2 + i * 6, -19.5, 2.6, 3.2, col); x.fillStyle = '#c9a15a'; x.fillRect(-3 + i * 6, -24, 2, 2); }
    capuche('#9566dc', '#4a2a85');
    x.strokeStyle = '#c9a15a'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-12.6, -55); x.quadraticCurveTo(0, -51, 12.6, -55); x.stroke(); E(0, -53, 2, 2, '#8a6a2a');
    x.strokeStyle = '#6a3eb0'; x.lineWidth = 6; x.beginPath(); x.moveTo(12, -39); x.lineTo(19, -47); x.stroke(); E(20, -49, 3.2, 3.2, SKIN);
    E(21, -57, 5.8, 5.8, 'rgba(126,240,160,.92)'); x.strokeStyle = '#e8f5ff'; x.lineWidth = 1.4; x.stroke(); x.fillStyle = '#c9a15a'; x.fillRect(19.4, -66.5, 3.2, 4.5); E(19.5, -58.5, 1.6, 1.6, 'rgba(255,255,255,.7)');
  }
  if (id === 'B') {          // le Barde : sa tenue rubis, son luth (on voit la caisse et le manche dépasser), son chapeau à plume blanche
    bottes('#3a2418'); robe(30, 32, '#c8283c', '#7a1424', '#f0c040');
    x.save(); x.translate(-15, -29); x.rotate(-0.5); E(0, 0, 8.5, 11, '#b07a3e'); x.strokeStyle = '#4a2e18'; x.lineWidth = 1.6; x.stroke(); x.fillStyle = '#7a5130'; x.fillRect(-2, -27, 4, 18); x.fillStyle = '#4a2e18'; x.fillRect(-3.5, -31, 7, 5); x.restore();
    cape(27, -18, '#a81f33', '#6e1830', '#f0c040');
    E(0, -50, 11, 10, '#5a3a22');
    E(0, -57.5, 16.5, 5, '#8e1a2e'); E(0, -59, 16, 4.4, '#c8283c'); E(0, -64, 9.5, 7, '#d42c40'); x.strokeStyle = 'rgba(10,10,20,.45)'; x.lineWidth = 1.2; x.stroke();
    x.strokeStyle = '#f0c040'; x.lineWidth = 1.8; x.beginPath(); x.ellipse(0, -60.5, 9.6, 2.6, 0, 0, Math.PI); x.stroke();
    x.fillStyle = '#f7f2e6'; x.beginPath(); x.moveTo(6, -62); x.quadraticCurveTo(22, -88, 26, -68); x.quadraticCurveTo(15, -70, 6, -62); x.fill();
    x.strokeStyle = 'rgba(120,110,90,.6)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(7, -63); x.quadraticCurveTo(18, -77, 24, -70); x.stroke();
  }
  return { c, w: W, h: H, ox: OX, oy: OY };
}
