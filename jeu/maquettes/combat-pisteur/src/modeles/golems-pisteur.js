// ===== LE RÉPARATEUR (combat du Pisteur, version 8 — Romain, 25 novembre, 22 h : « excellente idée » ; « il fait pas de dégâts ») =====
// Peint avec les MÊMES outils que le bestiaire du combat du Barde (modeles/golems.js : roche sombre, fer, bronze à liseré d'or, pattes de
// machine à trois griffes), pour qu'il soit de la même famille que les huit autres.
// Ce qui le distingue d'un coup d'œil : pas d'yeux de braise, mais UNE LENTILLE VERTE ; une lampe verte au bout d'une tige ; une caisse à
// outils sur le dos ; une clé à molette et un petit marteau au bout des bras. Toute la garde est rouge : le vert dit « celui-là répare ».
// o : { yaw, etat ('marche', 'arme' : le marteau levé, 'frappe' : le marteau abattu), k, pied } comme les autres.
(() => {
  const { lin, poly, trait, ell } = Ou;
  const O = Golems.O_, P = Golems.PEINTRES, TY = Golems.TYPES;
  const { plaque, roc, bras, allure, pattes, BRONZE, FER, NOIR } = O;
  const VERT = ['#d8ffe6', '#4fe08a', '#0d5a30'];
  TY.reparateur = { r: 15, haut: 90, boite: [164, 160, 82, 136], nom: 'le réparateur' };
  function lampe(x, lx, ly, r, fort) {
    x.save(); x.shadowColor = '#3dff8a'; x.shadowBlur = fort ? 16 : 9; ell(x, lx, ly, r + 1.4, r + 1.4, NOIR); ell(x, lx, ly, r, r, VERT[1]);
    x.shadowBlur = 0; ell(x, lx - r * 0.3, ly - r * 0.3, r * 0.4, r * 0.4, VERT[0]); x.restore();
  }
  P.reparateur = function (x, T, o) {
    const s = o.yaw, al = allure(o, 10), leve = o.etat === 'arme', tape = o.etat === 'frappe';
    const Q = pattes(x, s, al, 14, 31, 29, 0.9), cx = al.bal + s * 2, cy = -43 + al.ecr + (tape ? 3 : 0), cote = s < 0 ? -1 : 1;
    Q.fond();
    // la caisse à outils, sur son dos, et la tige de la lampe
    const bx = cx - s * 6, by = cy - 11;
    x.lineCap = 'round'; x.strokeStyle = NOIR; x.lineWidth = 3.4; trait(x, [[bx + 9, by - 14], [bx + 12, by - 34]]); x.stroke(); x.strokeStyle = BRONZE[0]; x.lineWidth = 1.6; x.stroke(); x.lineCap = 'butt';
    plaque(x, [[bx - 14, by - 16], [bx + 14, by - 16], [bx + 15, by + 3], [bx - 15, by + 3]], BRONZE, { riv: [[bx - 10, by - 3], [bx + 10, by - 3]], grav: [[[bx - 14, by - 8], [bx + 14, by - 8]]] });
    x.strokeStyle = NOIR; x.lineWidth = 3; x.beginPath(); x.arc(bx, by - 17, 5, Math.PI, 0); x.stroke(); x.strokeStyle = BRONZE[0]; x.lineWidth = 1.3; x.stroke();   // la poignée de la caisse
    lampe(x, bx + 12, by - 36, 4.2, leve || tape);
    // le corps : un rocher cerclé de bronze
    roc(x, cx, cy, 20, 15, 211);
    plaque(x, [[cx - 18, cy - 13], [cx + 18, cy - 13], [cx + 20, cy - 7], [cx - 20, cy - 7]], BRONZE, { riv: [[cx - 12, cy - 10], [cx + 12, cy - 10]] });
    Q.devant();
    // le masque : une seule lentille verte, dans un œilleton de bronze
    const fx = cx + s * 8, fy = cy + 2;
    plaque(x, [[fx - 12, fy - 9], [fx + 12, fy - 9], [fx + 10, fy + 8], [fx - 10, fy + 8]], FER, { bord: [[fx - 12, fy - 9], [fx + 12, fy - 9]] });
    ell(x, fx + s * 1.5, fy - 0.5, 7.4, 7.4, NOIR); ell(x, fx + s * 1.5, fy - 0.5, 6, 6, BRONZE[1]); lampe(x, fx + s * 1.5, fy - 0.5, 4, leve || tape);
    // un bras tient la clé à molette (il ne bouge pas)…
    const c1 = -cote, kx = cx + c1 * 27, ky = cy + 14;
    bras(x, cx + c1 * 19, cy - 2, kx, ky, 24, c1, 0.72, FER, false);
    x.save(); x.translate(kx, ky); x.rotate(c1 * 0.5); x.strokeStyle = NOIR; x.lineWidth = 1.2; x.lineJoin = 'round';
    x.fillStyle = lin(x, -2, 0, 2, 0, [FER[0], FER[1]]); x.beginPath(); x.rect(-1.8, -2, 3.6, 16); x.fill(); x.stroke();
    poly(x, [[-5.5, 12], [-5.5, 20], [-2, 20], [-2, 16.5], [2, 16.5], [2, 20], [5.5, 20], [5.5, 12]]); x.fillStyle = FER[0]; x.fill(); x.stroke(); x.restore();
    // … l'autre le marteau : levé, puis abattu
    const c2 = cote, mx = cx + c2 * (leve ? 22 : 29), my = leve ? cy - 30 : tape ? cy + 18 : cy + 12;
    bras(x, cx + c2 * 19, cy - 3, mx, my, 26, c2, 0.72, FER, false);
    x.save(); x.translate(mx, my); x.rotate(leve ? c2 * -0.5 : c2 * 0.9); x.strokeStyle = NOIR; x.lineWidth = 1.2;
    x.fillStyle = '#8a5a2a'; x.beginPath(); x.rect(-1.6, -14, 3.2, 16); x.fill(); x.stroke();
    plaque(x, [[-7, -20], [7, -20], [7, -13], [-7, -13]], FER, { or: 0 }); x.restore();
    if (tape) { x.strokeStyle = 'rgba(160,255,200,.9)'; x.lineWidth = 1.5; x.lineCap = 'round'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; trait(x, [[mx + c2 * 6 + Math.cos(a) * 5, my + 8 + Math.sin(a) * 4], [mx + c2 * 6 + Math.cos(a) * 12, my + 8 + Math.sin(a) * 10]]); x.stroke(); } x.lineCap = 'butt'; }
  };
})();
