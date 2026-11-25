// ===== OUTILS : les petites toiles « dessinées une fois, recopiées ensuite » (la règle du donjon pour les vieilles tablettes) =====
const Ou = (() => {
  const TAU = Math.PI * 2;
  const toile = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  function alea(seed) { let s = (seed % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  const lin = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => Array.isArray(c) ? gr.addColorStop(c[0], c[1]) : gr.addColorStop(i / (stops.length - 1), c)); return gr; };
  const rad = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => Array.isArray(c) ? gr.addColorStop(c[0], c[1]) : gr.addColorStop(i / (stops.length - 1), c)); return gr; };
  const poly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  const trait = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
  const ell = (g, x, y, rx, ry, col, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, TAU); if (col) { g.fillStyle = col; g.fill(); } };

  // une petite toile : w × h (en unités du jeu), son point d'attache (ox, oy), dessinée à l'échelle k
  function sprite(w, h, ox, oy, k, dessin) {
    const c = toile(w * k, h * k), x = c.getContext('2d'); x.scale(k, k); x.translate(ox, oy); dessin(x);
    return { c, w, h, ox, oy };
  }
  function poser(g, s, x, y, sc = 1, a = 1) {
    if (a <= 0.004) return;
    if (a < 1) g.globalAlpha = a;
    g.drawImage(s.c, x - s.ox * sc, y - s.oy * sc, s.w * sc, s.h * sc);
    if (a < 1) g.globalAlpha = 1;
  }
  function poserXY(g, s, x, y, sx, sy, a = 1) {
    if (a <= 0.004) return;
    if (a < 1) g.globalAlpha = a;
    g.drawImage(s.c, x - s.ox * sx, y - s.oy * sy, s.w * sx, s.h * sy);
    if (a < 1) g.globalAlpha = 1;
  }
  // une lueur ronde (ou aplatie : ry / rx), d'une couleur « r,g,b » ; cœur blanc si blanc > 0
  const lueurs = {};
  function lueur(r, rgb, aplati = 1, blanc = 0.35, k = 1) {
    const cle = r + '|' + rgb + '|' + aplati + '|' + blanc + '|' + k;
    if (lueurs[cle]) return lueurs[cle];
    return (lueurs[cle] = sprite(r * 2, r * 2 * aplati, r, r * aplati, k, x => {
      x.scale(1, aplati);
      x.fillStyle = rad(x, 0, 0, 0, r, [[0, `rgba(255,255,255,${blanc})`], [0.12, `rgba(${rgb},${0.55 + blanc * 0.4})`], [0.4, `rgba(${rgb},.22)`], [0.75, `rgba(${rgb},.05)`], [1, `rgba(${rgb},0)`]]);
      x.fillRect(-r, -r, r * 2, r * 2);
    }));
  }
  const oublier = () => { for (const k in lueurs) delete lueurs[k]; };
  const mel = (a, b, t) => a + (b - a) * t;
  const borne = (v, a, b) => v < a ? a : v > b ? b : v;
  const doux = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  return { TAU, toile, alea, lin, rad, poly, trait, ell, sprite, poser, poserXY, lueur, oublier, mel, borne, doux };
})();
