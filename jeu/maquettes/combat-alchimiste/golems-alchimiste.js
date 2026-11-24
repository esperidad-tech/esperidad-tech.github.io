// ===== LES GOLEMS DU COMBAT DE L'ALCHIMISTE (version 15 — Romain, 24 nov., 22 h 28 : « il y a les modèles qui sont prêts de Grosbec
// et de tous les golems… il y a plus de variétés de golems pour ce mini-jeu : tu peux créer d'autres modèles, dans la même veine…
// Accentue bien le côté métallique pour qu'on comprenne qu'il faut les électrocuter… une adaptation pour que ça soit toujours clair ») =====
// Le bestiaire du combat du Barde (modeles/golems.js, repris tel quel) sert pour cinq de nos golems. Ici : les huit modèles qui
// manquaient, peints avec les MÊMES outils (roche sombre, fer, bronze à liseré d'or, pattes de machine à trois griffes, yeux en fente
// de braise, fourneau rouge), et la règle de lecture de ce combat :
//   • de la ROCHE et du bronze                       → un golem ordinaire ;
//   • TOUT EN ACIER POLI, froid, qui brille, avec un PARATONNERRE DE CUIVRE sur la tête → il faut l'électrocuter
//     (le soldat en armure, le Colosse ; quand ça a marché : l'acier noircit, la tige est tordue, ou l'armure tombe) ;
//   • les quatre gros boss : ce dont ils ont envie se lit sur eux (une gueule de four affamée, du givre, de longs bras, des ressorts).
// Chaque image est peinte UNE FOIS (« cuite »), à la taille où on la voit, puis recopiée ; les teintes (trempé, enfariné, boue,
// terre cuite, en feu, grillé) sont des copies teintées de l'image cuite, pas de nouvelles peintures.
const GolemsA = (() => {
  const { TAU, lin, rad, poly, trait, ell, sprite, toile, mel } = Ou;
  const O = Golems.O_, P = Golems.PEINTRES, TY = Golems.TYPES;
  const { plaque, roc, veines, oeil, dents, pointe, fourneau, membre, coude, patte, bras, allure, pattes, BRONZE, FER, ROC, OS, OR, NOIR } = O;
  O.sol.off = true;   // l'ombre et la lueur au sol sont dessinées par le jeu (un golem qui vole ne doit pas emporter son ombre)
  const ACIER = ['#f6fafc', '#9db0c3', '#2a3542'], SUIE = ['#7d838b', '#3f444c', '#141619'], CUIVRE = ['#f6b488', '#b5653c', '#4a2414'], CUIR = ['#7a5236', '#4a2e1c', '#1f120a'], GIVRE = ['#f2fbff', '#9cc4dc', '#3a5a72'];

  // ---------- les outils de plus ----------
  // une patte tout en acier (la cuisse aussi), une genouillère ronde et polie
  function patteM(x, hx, hy, fx, fy, L, sens, t, pal, palC) {
    const ay = fy - 5 * t, g = coude(hx, hy, fx, ay, L * 0.6, L * 0.62, sens), gx = g[0], gy = g[1];
    membre(x, gx, gy, fx, ay, 4.4 * t, 3 * t, pal); membre(x, hx, hy, gx, gy, 6.2 * t, 4.6 * t, palC);
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1; trait(x, [[hx - sens * 3 * t, hy + 2], [gx - sens * 2 * t, gy - 2]]); x.stroke();
    ell(x, gx, gy, 5.2 * t, 5.2 * t, NOIR); ell(x, gx, gy, 4 * t, 4 * t, pal[1]); ell(x, gx - t, gy - t, 2 * t, 2 * t, pal[0]);
    poly(x, [[fx - 4.6 * t, ay - 1], [fx + 4.6 * t, ay - 1], [fx + 6.6 * t, fy - 1.5 * t], [fx - 6.6 * t, fy - 1.5 * t]]); x.fillStyle = lin(x, 0, ay, 0, fy, [pal[0], pal[2]]); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.3; x.stroke();
    for (const u of [-1, 1, 0]) pointe(x, fx + u * 4.6 * t, fy - 3.4 * t, Math.PI / 2 - u * 0.55, (u ? 6.5 : 7.5) * t, 4.4 * t, pal);
  }
  function pattesM(x, s, al, e, hh, L, t, pal, palC) {
    const Q = [-1, 1].map((c, i) => { const fond = s && c * s > 0; return { fond, c, hx: c * e * (fond ? 0.45 : s ? 0.85 : 0.8) + al.bal, fx: c * e * (fond ? 0.8 : 1.15) + s * (fond ? 5 : 1), lev: al.lev[i], t: fond ? t * 0.88 : t }; });
    const une = p => patteM(x, p.hx, -hh + al.ecr, p.fx, -p.lev, L, p.c, p.t, pal, palC);
    return { fond: () => Q.filter(p => p.fond).forEach(une), devant: () => Q.filter(p => !p.fond).forEach(une) };
  }
  function brasM(x, sx, sy, mx, my, L, sens, t, pal, griffes) {   // un bras tout en acier ; au bout : un gantelet, ou trois griffes
    const c = coude(sx, sy, mx, my, L * 0.55, L * 0.55, sens);
    membre(x, sx, sy, c[0], c[1], 5.2 * t, 3.9 * t, pal); membre(x, c[0], c[1], mx, my, 4.7 * t, 3.4 * t, pal);
    ell(x, c[0], c[1], 3.9 * t, 3.9 * t, NOIR); ell(x, c[0], c[1], 2.8 * t, 2.8 * t, pal[0]);
    const an = Math.atan2(my - c[1], mx - c[0]);
    if (griffes) for (const u of [-1, 1, 0]) pointe(x, mx + Math.cos(an + u * 1.2) * 1.6 * t, my + Math.sin(an + u * 1.2) * 1.6 * t, an + u * 0.42, (u ? 10 : 12.5) * t, 3.6 * t, pal);
    else { ell(x, mx, my, 5 * t, 5 * t, NOIR); ell(x, mx, my, 3.9 * t, 3.9 * t, pal[1]); ell(x, mx - t, my - t, 1.6 * t, 1.6 * t, pal[0]); }
    return an;
  }
  // l'éclat de l'acier poli : une petite étoile blanche
  function eclat(x, cx, cy, r) {
    x.save(); x.translate(cx, cy); x.shadowColor = '#bfe6ff'; x.shadowBlur = 5; x.fillStyle = '#ffffff';
    poly(x, [[0, -r], [r * 0.2, -r * 0.2], [r, 0], [r * 0.2, r * 0.2], [0, r], [-r * 0.2, r * 0.2], [-r, 0], [-r * 0.2, -r * 0.2]]); x.fill(); x.restore();
  }
  // LE PARATONNERRE : une tige de cuivre, une boule, des spires au pied. C'est lui qui dit « l'électricité passe par ici ».
  function tige(x, bx, by, h, tordue) {
    const tx = bx + (tordue ? h * 0.45 : 0), ty = by - h * (tordue ? 0.7 : 1), mxx = bx + (tordue ? -h * 0.1 : 0), my = by - h * 0.55;
    x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = NOIR; x.lineWidth = 4; trait(x, [[bx, by], [mxx, my], [tx, ty]]); x.stroke();
    x.strokeStyle = tordue ? SUIE[0] : CUIVRE[0]; x.lineWidth = 2.1; x.stroke(); x.strokeStyle = tordue ? SUIE[1] : CUIVRE[1]; x.lineWidth = 0.8; trait(x, [[bx + 0.8, by], [mxx + 0.8, my], [tx + 0.8, ty]]); x.stroke(); x.lineCap = 'butt';
    for (let i = 0; i < 3; i++) { x.strokeStyle = NOIR; x.lineWidth = 2.6; x.beginPath(); x.ellipse(bx, by - 2 - i * 3.2, 4.4 - i * 0.6, 1.7, 0, 0, TAU); x.stroke(); x.strokeStyle = tordue ? SUIE[0] : CUIVRE[0]; x.lineWidth = 1.2; x.stroke(); }
    ell(x, tx, ty, 3.6, 3.6, NOIR); ell(x, tx, ty, 2.6, 2.6, tordue ? SUIE[1] : CUIVRE[0]); if (!tordue) ell(x, tx - 0.8, ty - 0.8, 1, 1, '#fff6ea');
  }
  function fumee(x, cx, cy, n) { for (let i = 0; i < n; i++) ell(x, cx + Math.sin(i * 2.3) * 5, cy - i * 7, 5 + i * 1.6, 3.6 + i, `rgba(40,40,46,${0.5 - i * 0.1})`); }
  const fente = (x, hx, hy, w, s) => { x.fillStyle = '#020203'; x.fillRect(hx - w + s, hy - 2.6, w * 2, 5); };

  // ================= les huit modèles de plus =================
  // o : { yaw, etat, k, pied } comme au Barde, et : grille (le soldat grillé), denude (le Colosse sans armure), porte (les pieux),
  //     bouche, dort, gonfle (le Glouton), chaud (le Frileux, 0 à 1), ressort (le Sauteur : 1 écrasé, 0 détendu)
  Object.assign(TY, {
    cuirasse:  { r: 17, haut: 112, boite: [164, 186, 78, 166], nom: 'le soldat en armure' },
    colosseA:  { r: 30, haut: 164, boite: [250, 240, 125, 214], nom: 'le Colosse' },
    soufflet:  { r: 16, haut: 86, boite: [150, 150, 75, 130], nom: 'le souffleur' },
    porteur:   { r: 16, haut: 100, boite: [160, 186, 80, 166], nom: 'le porte-barricade' },
    glouton:   { r: 30, haut: 126, boite: [236, 196, 118, 174], nom: 'le Glouton' },
    frileux:   { r: 17, haut: 132, boite: [156, 204, 78, 182], nom: 'le Frileux' },
    singe:     { r: 17, haut: 98, boite: [200, 160, 100, 138], nom: 'le Singe' },
    sauteur:   { r: 18, haut: 136, boite: [160, 204, 80, 182], nom: 'le Sauteur' },
  });
  Object.assign(P, {
    // --- le soldat en armure : pas un caillou en vue. De l'acier poli de la tête aux griffes, un heaume fermé, une épée large,
    //     et sur le heaume un paratonnerre de cuivre. Rien ne l'entame… sauf l'électricité (mouillé, c'est le court-circuit).
    cuirasse(x, T, o) {
      const s = o.yaw, al = allure(o, 14), arme = o.etat === 'arme', frappe = o.etat === 'frappe', g = o.grille, A = g ? SUIE : ACIER;
      const Q = pattesM(x, s, al, 13, 47, 43, 1.05, A, A), cx = al.bal + s * 2, cy = -67 + al.ecr, cote = s < 0 ? -1 : 1;
      Q.fond();
      brasM(x, cx - cote * 19, cy - 12, cx - cote * 26, cy + 21, 37, -cote, 0.95, A, false);
      plaque(x, [[cx - 15, cy + 10], [cx + 15, cy + 10], [cx + 13, cy + 27], [cx - 13, cy + 27]], A, { or: 0, grav: [[[cx - 15, cy + 16], [cx + 15, cy + 16]], [[cx - 14, cy + 21.5], [cx + 14, cy + 21.5]]] });   // les tassettes
      plaque(x, [[cx - 19 + s * 2, cy - 19], [cx + 19 + s * 2, cy - 19], [cx + 18 + s * 2, cy + 3], [cx + 9 + s * 3, cy + 13], [cx - 9 + s * 3, cy + 13], [cx - 18 + s * 2, cy + 3]], A,
        { or: 0.55, bord: [[cx - 19 + s * 2, cy - 19], [cx + 19 + s * 2, cy - 19]], riv: [[cx - 14 + s * 2, cy - 14], [cx + 14 + s * 2, cy - 14], [cx - 12 + s * 3, cy + 3], [cx + 12 + s * 3, cy + 3]], grav: [[[cx + s * 4, cy - 18], [cx + s * 4, cy + 12]], [[cx - 17 + s * 2, cy - 5], [cx + 17 + s * 2, cy - 5]]] });
      fourneau(x, cx + s * 4, cy + 4, 4.2, 3.6, s ? 0.8 : 1, 2);                                                                        // son feu : une toute petite grille, bien protégée
      Q.devant();
      for (const c of [-1, 1]) { const ex = cx + c * 20 - s * 2, ey = cy - 16; plaque(x, [[ex - 10, ey + 6], [ex - 9, ey - 3], [ex - 4, ey - 8], [ex + 4, ey - 8], [ex + 9, ey - 3], [ex + 10, ey + 6]], A, { or: 0, riv: [[ex, ey + 2]] }); }   // les spalières rondes
      const hx = cx + s * 6, hy = cy - 34;                                                                                              // le heaume fermé, et son paratonnerre
      tige(x, hx - s * 1.5, hy - 12, 22, g);
      plaque(x, [[hx - 10, hy - 6], [hx - 7, hy - 13], [hx + 7, hy - 13], [hx + 10, hy - 6], [hx + 10, hy + 8], [hx + s * 3, hy + 15], [hx - 10, hy + 8]], A, { or: 0.55, bord: [[hx - 7, hy - 13], [hx + 7, hy - 13]], riv: [[hx - 7, hy + 6], [hx + 7, hy + 6]], grav: [[[hx + s * 2, hy - 12], [hx + s * 3, hy + 14]]] });
      fente(x, hx, hy - 1, 8, s);
      oeil(x, hx - 4.2 + s * 1.5, hy - 1.2, 3.3, -1, s > 0 ? 0.7 : 1, g ? 0.4 : 1); oeil(x, hx + 4.2 + s * 1.5, hy - 1.2, 3.3, 1, s < 0 ? 0.7 : 1, g ? 0.4 : 1);
      for (let i = -1; i <= 1; i++) { x.fillStyle = '#020203'; x.fillRect(hx + s * 2.5 + i * 3 - 0.6, hy + 5, 1.2, 5); }                // les trous du ventail
      // son épée, dans la main de devant : levée quand il arme, abattue quand il frappe
      const mx = cx + cote * (arme ? 30 : frappe ? 21 : 26), my = cy + (arme ? -18 : frappe ? 11 : 15), an = arme ? -Math.PI / 2 - cote * 0.55 : frappe ? Math.PI / 2 - cote * 1.0 : -Math.PI / 2 + cote * 0.2;
      x.save(); x.translate(mx, my); x.rotate(an);
      poly(x, [[4, -3.6], [42, -3.6], [51, 0], [42, 3.6], [4, 3.6]]); x.fillStyle = lin(x, 0, -4, 0, 4, A); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.3; x.lineJoin = 'round'; x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 0.9; trait(x, [[6, -0.6], [46, -0.4]]); x.stroke();
      plaque(x, [[0, -8], [4.5, -8], [4.5, 8], [0, 8]], BRONZE, { or: 0.8 }); ell(x, -9, 0, 3, 3, BRONZE[1]); x.strokeStyle = NOIR; x.lineWidth = 1; x.stroke();
      x.restore();
      brasM(x, cx + cote * 19, cy - 12, mx, my, 39, cote, 1.05, A, false);
      if (g) { fumee(x, hx, hy - 22, 3); fumee(x, cx - 12, cy - 26, 2); x.strokeStyle = 'rgba(10,10,12,.7)'; x.lineWidth = 1; for (const q of [[-9, -8, -3, 4], [8, -12, 12, 2], [-4, 6, 5, 11]]) { trait(x, [[cx + q[0], cy + q[1]], [cx + q[2], cy + q[3]]]); x.stroke(); } }
      else { eclat(x, cx - 10 + s * 2, cy - 12, 4.2); eclat(x, hx + 5.5, hy - 9, 3); eclat(x, cx + cote * 22, cy - 19, 2.6); }
    },
    // --- le Colosse : le petit chef. Une tour d'acier riveté, une couronne de bronze, deux paratonnerres. Rien ne passe…
    //     Mouillé puis électrocuté, son armure tombe : dessous, la roche et son fourneau à nu.
    colosseA(x, T, o) {
      const s = o.yaw, al = allure(o, 12), arme = o.etat === 'arme', frappe = o.etat === 'frappe', cote = s < 0 ? -1 : 1;
      if (o.denude) {
        // sans armure : le colosse de roche du bestiaire, et les morceaux d'acier par terre
        for (const q of [[-52, -3, 0.5], [44, -1, -0.3], [-30, 4, -0.9], [58, 5, 0.7]]) { x.save(); x.translate(q[0], q[1]); x.rotate(q[2]); x.scale(1, 0.55); plaque(x, [[-13, -9], [11, -11], [14, 6], [-10, 9]], ACIER, { or: 0, riv: [[-6, -3], [6, 2]] }); x.restore(); }
        x.save(); x.scale(1.12, 1.12); P.gros(x, TY.gros, o); x.restore();
        const cx = al.bal + s * 2, cy = (-88 + al.ecr) * 1.12;
        x.shadowColor = '#ffd27a'; x.shadowBlur = 16; ell(x, cx + s * 10, cy - 4, 7, 7, 'rgba(255,240,190,.85)'); x.shadowBlur = 0;      // son fourneau à nu, chauffé à blanc : c'est là qu'il faut taper
        plaque(x, [[cx - 44, cy - 34], [cx - 30, cy - 38], [cx - 27, cy - 24], [cx - 42, cy - 20]], ACIER, { or: 0, riv: [[cx - 36, cy - 29]] });   // un reste de spalière, de travers
        return;
      }
      const Q = pattesM(x, s, al, 22, 58, 50, 1.75, ACIER, ACIER), cx = al.bal + s * 2, cy = -96 + al.ecr;
      const poing = (px, py, g) => { plaque(x, [[px - 12 * g, py - 9 * g], [px + 12 * g, py - 9 * g], [px + 14 * g, py + 5 * g], [px + 7 * g, py + 12 * g], [px - 7 * g, py + 12 * g], [px - 14 * g, py + 5 * g]], ACIER, { or: 0, riv: [[px - 6 * g, py - 3 * g], [px + 6 * g, py - 3 * g]] }); for (const u of [-1, 0, 1]) pointe(x, px + u * 7 * g, py + 9 * g, Math.PI / 2 - u * 0.3, 9 * g, 5.4 * g, ACIER); };
      Q.fond();
      const fb = [cx - cote * 47, cy + 42]; brasM(x, cx - cote * 34, cy - 16, fb[0], fb[1], 66, -cote, 1.7, ACIER, false); poing(fb[0], fb[1] + 6, 0.95);
      plaque(x, [[cx - 24, cy + 28], [cx + 24, cy + 28], [cx + 19, cy + 46], [cx - 19, cy + 46]], ACIER, { or: 0, grav: [[[cx - 22, cy + 34], [cx + 22, cy + 34]], [[cx - 21, cy + 40], [cx + 21, cy + 40]]], riv: [[cx - 13, cy + 31], [cx + 13, cy + 31]] });
      // le tonneau d'acier : huit pans, des cercles, des rangées de rivets
      const pans = [[cx - 30, cy - 34], [cx + 30, cy - 34], [cx + 40, cy - 14], [cx + 38, cy + 16], [cx + 26, cy + 32], [cx - 26, cy + 32], [cx - 38, cy + 16], [cx - 40, cy - 14]], riv = [];
      for (let i = -3; i <= 3; i++) { riv.push([cx + i * 10.5, cy - 29]); riv.push([cx + i * 10.5, cy + 12]); }
      plaque(x, pans, ACIER, { or: 0.6, bord: [[cx - 30, cy - 34], [cx + 30, cy - 34]], riv, grav: [[[cx - 40, cy - 14], [cx + 40, cy - 14]], [[cx - 38, cy + 16], [cx + 38, cy + 16]], [[cx - 13 + s * 4, cy - 34], [cx - 13 + s * 4, cy + 32]], [[cx + 13 + s * 4, cy - 34], [cx + 13 + s * 4, cy + 32]]] });
      plaque(x, [[cx - 39, cy - 2], [cx + 39, cy - 2], [cx + 39, cy + 5], [cx - 39, cy + 5]], BRONZE, { riv: [[cx - 30, cy + 1.5], [cx - 15, cy + 1.5], [cx + 15, cy + 1.5], [cx + 30, cy + 1.5]] });   // sa ceinture de bronze (le chef)
      const fx = cx + s * 9; fourneau(x, fx, cy - 15, 7.5, 6.5, s ? 0.82 : 1, 4);                                                       // son feu, derrière quatre barreaux
      Q.devant();
      for (const c of [-1, 1]) {                                                                                                        // les spalières : deux dômes d'acier, un paratonnerre sur chacune
        const ex = cx + c * 38 - s * 2, ey = cy - 24;
        tige(x, ex + c * 2, ey - 12, 24, false);
        plaque(x, [[ex - 16, ey + 9], [ex - 15, ey - 4], [ex - 8, ey - 13], [ex + 8, ey - 13], [ex + 15, ey - 4], [ex + 16, ey + 9]], ACIER, { or: 0.5, bord: [[ex - 8, ey - 13], [ex + 8, ey - 13]], riv: [[ex - 9, ey + 4], [ex, ey + 5], [ex + 9, ey + 4]] });
      }
      const hx = cx + s * 7, hy = cy - 40;                                                                                              // le heaume, et sa couronne
      plaque(x, [[hx - 13, hy - 8], [hx - 9, hy - 15], [hx + 9, hy - 15], [hx + 13, hy - 8], [hx + 13, hy + 8], [hx + 7, hy + 16], [hx - 7, hy + 16], [hx - 13, hy + 8]], ACIER, { or: 0, riv: [[hx - 9, hy + 9], [hx + 9, hy + 9]], grav: [[[hx + s * 2, hy - 14], [hx + s * 3, hy + 15]]] });
      fente(x, hx, hy - 1, 10.5, s);
      oeil(x, hx - 5.2 + s * 1.5, hy - 1.4, 4.2, -1, s > 0 ? 0.7 : 1, 1.3); oeil(x, hx + 5.2 + s * 1.5, hy - 1.4, 4.2, 1, s < 0 ? 0.7 : 1, 1.3);
      for (let i = -2; i <= 2; i++) { x.fillStyle = '#020203'; x.fillRect(hx + s * 2.5 + i * 3.4 - 0.7, hy + 6, 1.4, 6); }
      for (const u of [-2, -1, 0, 1, 2]) pointe(x, hx + u * 5, hy - 16, -Math.PI / 2 + u * 0.12, u % 2 ? 9 : 13, 5, BRONZE);          // la couronne
      plaque(x, [[hx - 13, hy - 19], [hx + 13, hy - 19], [hx + 12, hy - 13], [hx - 12, hy - 13]], BRONZE, { or: 1, riv: [[hx - 8, hy - 16], [hx, hy - 16], [hx + 8, hy - 16]] });
      const fp = arme ? [cx + cote * 50, cy - 48] : frappe ? [cx + cote * 32, cy + 64] : [cx + cote * 49, cy + 44];
      brasM(x, cx + cote * 36, cy - 16, fp[0], fp[1], 70, cote, 1.8, ACIER, false); poing(fp[0], fp[1] + (arme ? -4 : 6), 1.1);
      eclat(x, cx - 20 + s * 3, cy - 24, 5.5); eclat(x, hx + 7, hy - 10, 3.6); eclat(x, cx + cote * 40, cy - 30, 3.6); eclat(x, cx + 22, cy + 22, 3);
    },
    // --- le souffleur : un soufflet de forge sur pattes. Du cuir et du bronze sur le dos, un grand pavillon de bronze à l'avant.
    //     Il aspire (le soufflet se gonfle), puis il souffle tes nuages vers toi.
    soufflet(x, T, o) {
      const s = o.yaw, al = allure(o, 11), aspire = o.etat === 'arme', souffle = o.etat === 'frappe';
      const Q = pattes(x, s, al, 14, 32, 30, 0.95), cx = al.bal + s * 2, cy = -45 + al.ecr, g = aspire ? 1.4 : souffle ? 0.55 : 1;
      Q.fond();
      const sx = cx - s * 6, y1 = cy - 10, pli = 5.4 * g, n = 5;                                                                        // le soufflet, sur son dos
      for (let i = 0; i < n; i++) { const ya = y1 - i * pli, yb = ya - pli, w = 17 - i * 1.2; poly(x, [[sx - w, ya], [sx + w, ya], [sx + w - 4, (ya + yb) / 2], [sx + w - 1.2, yb], [sx - w + 1.2, yb], [sx - w + 4, (ya + yb) / 2]]); x.fillStyle = lin(x, sx - w, 0, sx + w, 0, [CUIR[2], CUIR[0], CUIR[1], CUIR[2]]); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.2; x.lineJoin = 'round'; x.stroke(); }
      const yt = y1 - n * pli; plaque(x, [[sx - 13, yt - 5], [sx + 13, yt - 5], [sx + 12, yt + 1], [sx - 12, yt + 1]], BRONZE, { riv: [[sx - 8, yt - 2], [sx + 8, yt - 2]] });
      x.strokeStyle = NOIR; x.lineWidth = 3; x.beginPath(); x.arc(sx, yt - 7, 4, Math.PI, 0); x.stroke(); x.strokeStyle = BRONZE[0]; x.lineWidth = 1.4; x.stroke();   // la poignée
      roc(x, cx, cy, 21, 16, 131); veines(x, [[[cx - 16, cy - 2], [cx - 10, cy - 8]], [[cx + 15, cy + 2], [cx + 9, cy + 8]]], 1);
      plaque(x, [[cx - 19, cy - 13], [cx + 19, cy - 13], [cx + 21, cy - 7], [cx - 21, cy - 7]], BRONZE, { riv: [[cx - 13, cy - 10], [cx + 13, cy - 10]] });
      Q.devant();
      const tx = cx + s * 9, ty = cy + 4, hy = cy - 16 + (aspire ? -2 : 0);
      plaque(x, [[tx - 12, hy - 7], [tx + 12, hy - 7], [tx + 11, hy + 6], [tx - 11, hy + 6]], FER, { bord: [[tx - 12, hy - 7], [tx + 12, hy - 7]] });   // le masque, au-dessus du pavillon
      fente(x, tx, hy, 9, 0); oeil(x, tx - 4.6, hy - 0.4, 3.5, -1, s > 0 ? 0.7 : 1); oeil(x, tx + 4.6, hy - 0.4, 3.5, 1, s < 0 ? 0.7 : 1);
      for (const c of [-1, 1]) bras(x, cx + c * 19, cy - 3, tx + c * 13, ty + 7, 22, c, 0.7, FER, false);
      plaque(x, [[tx - 8, ty - 9], [tx + 8, ty - 9], [tx + 17, ty + 9], [tx - 17, ty + 9]], BRONZE, { or: 0.9, bord: [[tx - 17, ty + 9], [tx + 17, ty + 9]], grav: [[[tx - 11, ty - 2], [tx + 11, ty - 2]], [[tx - 14, ty + 4], [tx + 14, ty + 4]]] });   // le pavillon
      ell(x, tx, ty + 9, 17, 6.5, NOIR); ell(x, tx, ty + 9, 14.5, 4.8, souffle ? '#d8f0f6' : aspire ? '#2a1208' : '#120806');
      x.strokeStyle = OR; x.globalAlpha = 0.8; x.lineWidth = 1; x.beginPath(); x.ellipse(tx, ty + 9, 16, 5.7, 0, 0, TAU); x.stroke(); x.globalAlpha = 1;
      if (souffle) { x.strokeStyle = 'rgba(235,248,255,.85)'; x.lineWidth = 1.6; x.lineCap = 'round'; for (let i = -2; i <= 2; i++) { trait(x, [[tx + i * 5, ty + 14], [tx + i * 9, ty + 28 + (i % 2 ? 0 : 5)]]); x.stroke(); } x.lineCap = 'butt'; }
    },
    // --- le porte-barricade : un terrassier de roche et de bronze, une lampe de mineur au front, un maillet, et sur le dos
    //     une hotte de pieux de fer (il les plante pour arrêter tes vagues).
    porteur(x, T, o) {
      const s = o.yaw, al = allure(o, 13), arme = o.etat === 'arme', frappe = o.etat === 'frappe', cote = s < 0 ? -1 : 1;
      const Q = pattes(x, s, al, 12, 40, 37, 0.95), cx = al.bal + s * 2, cy = -56 + al.ecr, dx = cx - s * 5;
      Q.fond();
      if (o.porte) for (const u of [-2, 2, -1, 1, 0]) {                                                                                 // les pieux, en éventail
        const a = -Math.PI / 2 + u * 0.27, bx = dx + u * 5, by = cy + 8, len = 60 - Math.abs(u) * 4, ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
        x.lineCap = 'round'; x.strokeStyle = NOIR; x.lineWidth = 5.6; trait(x, [[bx, by], [ex, ey]]); x.stroke(); x.strokeStyle = lin(x, bx - 3, 0, bx + 3, 0, ['#8a6a48', '#4a3422']); x.lineWidth = 3.2; x.stroke(); x.lineCap = 'butt';
        pointe(x, ex, ey, a, 11, 5.6, FER);
      }
      plaque(x, [[dx - 15, cy - 16], [dx + 15, cy - 16], [dx + 12, cy + 14], [dx - 12, cy + 14]], FER, { or: 0, grav: [[[dx - 14, cy - 6], [dx + 14, cy - 6]], [[dx - 13, cy + 4], [dx + 13, cy + 4]]] });   // la hotte
      bras(x, cx - cote * 16, cy - 10, cx - cote * 23, cy + 20, 32, -cote, 0.85);
      plaque(x, [[cx - 11, cy + 10], [cx + 11, cy + 10], [cx + 9, cy + 20], [cx - 9, cy + 20]], FER, { or: 0 });
      roc(x, cx, cy, 16, 16, 141); veines(x, [[[cx - 12, cy + 5], [cx - 7, cy + 11]], [[cx + 12, cy + 3], [cx + 7, cy + 10]]], 1);
      x.strokeStyle = NOIR; x.lineWidth = 4.4; for (const c of [-1, 1]) { trait(x, [[cx + c * 12, cy - 14], [cx - c * 9, cy + 9]]); x.stroke(); } x.strokeStyle = CUIR[0]; x.lineWidth = 2.6; for (const c of [-1, 1]) { trait(x, [[cx + c * 12, cy - 14], [cx - c * 9, cy + 9]]); x.stroke(); }   // les sangles de la hotte
      ell(x, cx + s * 3, cy - 2, 3.4, 3.4, NOIR); ell(x, cx + s * 3, cy - 2, 2.4, 2.4, BRONZE[0]);
      fourneau(x, cx + s * 4, cy + 6, 4.5, 3.4, s ? 0.8 : 1, 2);
      Q.devant();
      const hx = cx + s * 5, hy = cy - 26;                                                                                              // la tête : un casque rond, une lampe au front
      plaque(x, [[hx - 10, hy + 7], [hx - 10, hy - 4], [hx - 6, hy - 10], [hx + 6, hy - 10], [hx + 10, hy - 4], [hx + 10, hy + 7], [hx + s * 2, hy + 11]], FER, { bord: [[hx - 6, hy - 10], [hx + 6, hy - 10]] });
      plaque(x, [[hx - 12, hy - 4], [hx + 12, hy - 4], [hx + 12, hy - 1], [hx - 12, hy - 1]], BRONZE, { or: 0.9 });
      fente(x, hx, hy + 2.6, 7.5, s); oeil(x, hx - 4 + s * 1.5, hy + 2.4, 3.2, -1, s > 0 ? 0.7 : 1); oeil(x, hx + 4 + s * 1.5, hy + 2.4, 3.2, 1, s < 0 ? 0.7 : 1);
      x.shadowColor = 'rgba(255,214,110,1)'; x.shadowBlur = 8; ell(x, hx + s * 3, hy - 8, 3.4, 3.4, '#fff3c4'); x.shadowBlur = 0; x.strokeStyle = BRONZE[2]; x.lineWidth = 1.2; x.stroke();
      // son maillet, dans la main de devant : levé quand il arme (ou qu'il plante), abattu quand il frappe
      const mx = cx + cote * (arme ? 24 : frappe ? 19 : 23), my = cy + (arme ? -16 : frappe ? 14 : 16), an = arme ? -Math.PI / 2 - cote * 0.4 : frappe ? Math.PI / 2 - cote * 0.9 : -Math.PI / 2 + cote * 0.5;
      x.save(); x.translate(mx, my); x.rotate(an); x.lineCap = 'round'; x.strokeStyle = NOIR; x.lineWidth = 4.6; trait(x, [[-6, 0], [26, 0]]); x.stroke(); x.strokeStyle = '#7a5a3a'; x.lineWidth = 2.4; x.stroke(); x.lineCap = 'butt';
      plaque(x, [[22, -10], [34, -10], [34, 10], [22, 10]], FER, { or: 0, grav: [[[22, -5], [34, -5]], [[22, 5], [34, 5]]] }); x.restore();
      bras(x, cx + cote * 16, cy - 10, mx, my, 34, cote, 0.9, FER, false); ell(x, mx, my, 4, 4, BRONZE[1]); x.strokeStyle = NOIR; x.lineWidth = 1.1; x.stroke();
    },
    // --- LE GLOUTON : une marmite de roche sur pattes. Son fourneau lui sert de bouche : une gueule de four pleine de dents de fer,
    //     ouverte, qui réclame. Une fourchette de fer à la main, un bavoir de bronze. Repu : la gueule fermée, les yeux clos.
    glouton(x, T, o) {
      const s = o.yaw, al = allure(o, 10), dort = o.dort, ouv = o.bouche ? 1 : dort ? 0 : 0.5, gf = o.gonfle ? 1.1 : 1, cote = s < 0 ? -1 : 1;
      const Q = pattes(x, s, al, 22, 38, 35, 1.5), cx = al.bal + s * 2, cy = -70 + al.ecr;
      Q.fond();
      bras(x, cx - cote * 36 * gf, cy - 6, cx - cote * 47 * gf, cy + 24, 36, -cote, 1.1);
      roc(x, cx, cy + 4, 42 * gf, 37 * gf, 151, ROC, 13);
      veines(x, [[[cx - 35, cy - 8], [cx - 27, cy - 17]], [[cx + 34, cy - 4], [cx + 27, cy - 15]], [[cx - 30, cy + 22], [cx - 22, cy + 30]], [[cx + 29, cy + 23], [cx + 21, cy + 31]]], 1.4);
      plaque(x, [[cx - 36 * gf, cy - 24], [cx + 36 * gf, cy - 24], [cx + 39 * gf, cy - 16], [cx - 39 * gf, cy - 16]], BRONZE, { riv: [[cx - 28, cy - 20], [cx - 14, cy - 20], [cx + 14, cy - 20], [cx + 28, cy - 20]] });
      const mx = cx + s * 8, my = cy + 9, mw = 28 * gf, mh = 3 + 13 * ouv;                                                              // LA GUEULE
      plaque(x, [[mx - mw - 3, my - mh - 6], [mx + mw + 3, my - mh - 6], [mx + mw + 1, my - mh + 1], [mx - mw - 1, my - mh + 1]], FER, { or: 0.9 });
      if (ouv > 0.1) { x.shadowColor = '#ff2a00'; x.shadowBlur = 14; poly(x, [[mx - mw, my - mh], [mx + mw, my - mh], [mx + mw * 0.86, my + mh], [mx - mw * 0.86, my + mh]]); x.fillStyle = rad(x, mx, my + mh * 0.4, 2, mw * 1.1, ['#fff3c4', '#ffa23a', '#e8300c', '#3a0602']); x.fill(); x.shadowBlur = 0; }
      else { poly(x, [[mx - mw, my - mh], [mx + mw, my - mh], [mx + mw * 0.86, my + mh], [mx - mw * 0.86, my + mh]]); x.fillStyle = '#140604'; x.fill(); }
      dents(x, mx - mw, mx + mw, my - mh, 4 + 5 * ouv + (dort ? 2 : 0), 8); dents(x, mx - mw * 0.86, mx + mw * 0.86, my + mh, -(4 + 4 * ouv + (dort ? 2 : 0)), 7);
      plaque(x, [[mx - mw * 0.86 - 2, my + mh - 1], [mx + mw * 0.86 + 2, my + mh - 1], [mx + mw * 0.7, my + mh + 7], [mx - mw * 0.7, my + mh + 7]], FER, { or: 0 });
      Q.devant();
      const hx = cx + s * 6, hy = cy - 40 * gf;                                                                                         // sa petite tête, enfoncée dans la marmite
      for (const c of [-1, 1]) pointe(x, hx + c * 9, hy - 5, -Math.PI / 2 + c * 0.8, 11, 5, OS);
      plaque(x, [[hx - 12, hy - 8], [hx + 12, hy - 8], [hx + 13, hy + 8], [hx - 13, hy + 8]], FER, { bord: [[hx - 12, hy - 8], [hx + 12, hy - 8]], riv: [[hx - 9, hy + 5], [hx + 9, hy + 5]] });
      if (dort) { x.strokeStyle = '#020203'; x.lineWidth = 2.2; x.lineCap = 'round'; for (const c of [-1, 1]) { x.beginPath(); x.arc(hx + c * 5 + s * 1.5, hy - 1.5, 3.2, 0.2, Math.PI - 0.2); x.stroke(); } x.lineCap = 'butt'; }
      else { fente(x, hx, hy - 1, 10, s); oeil(x, hx - 5 + s * 1.5, hy - 1.2, 3.9, -1, s > 0 ? 0.7 : 1, 1.2); oeil(x, hx + 5 + s * 1.5, hy - 1.2, 3.9, 1, s < 0 ? 0.7 : 1, 1.2); }
      plaque(x, [[hx - 15, hy + 9], [hx + 15, hy + 9], [hx + s * 2, hy + 27]], BRONZE, { or: 0.9, riv: [[hx - 8, hy + 12], [hx + 8, hy + 12], [hx + s, hy + 21]] });   // le bavoir
      // sa fourchette de fer, plantée droit : trois dents
      const fmx = cx + cote * 47 * gf, fmy = cy + 22;
      x.lineCap = 'round'; x.strokeStyle = NOIR; x.lineWidth = 5; trait(x, [[fmx, fmy + 12], [fmx, fmy - 52]]); x.stroke(); x.strokeStyle = FER[0]; x.lineWidth = 2.6; x.stroke(); x.lineCap = 'butt';
      plaque(x, [[fmx - 9, fmy - 56], [fmx + 9, fmy - 56], [fmx + 8, fmy - 50], [fmx - 8, fmy - 50]], FER, { or: 0 });
      for (const u of [-1, 0, 1]) pointe(x, fmx + u * 6.5, fmy - 55, -Math.PI / 2, 17, 4.4, FER);
      bras(x, cx + cote * 36 * gf, cy - 6, fmx, fmy, 34, cote, 1.15, FER, false); ell(x, fmx, fmy, 5, 5, BRONZE[1]); x.strokeStyle = NOIR; x.lineWidth = 1.2; x.stroke();
    },
    // --- LE FRILEUX : un grand golem maigre, bleui par le froid. Son fourneau est ÉTEINT (une petite flamme bleue), sa roche est
    //     couverte de givre, des glaçons pendent de ses épaules, il se serre dans ses bras. chaud : 0 gelé … 1 brûlant (le feu
    //     revient, la roche rougit, les glaçons fondent, il ouvre les bras).
    frileux(x, T, o) {
      const s = o.yaw, al = allure(o, 12), ch = o.chaud || 0, froid = ch < 0.5, r = Ou.alea(77);
      const pal = [0, 1, 2].map(i => melc(['#a9c3d6', '#4a6a84', '#16283a'][i], ROC[i], ch)), palF = [0, 1, 2].map(i => melc(GIVRE[i], FER[i], ch));
      const Q = pattes(x, s, al, 11, 50, 46, 0.9, palF), cx = al.bal + s * 2, cy = -72 + al.ecr;
      if (ch >= 1) { x.save(); x.translate(cx, cy); x.fillStyle = rad(x, 0, 0, 6, 64, ['rgba(255,110,40,.5)', 'rgba(255,80,30,.16)', 'rgba(255,80,30,0)']); x.fillRect(-66, -66, 132, 132); x.restore(); }
      Q.fond();
      roc(x, cx, cy, 17, 25, 161, pal, 10);
      if (ch > 0.2) veines(x, [[[cx - 13, cy - 8], [cx - 7, cy - 15], [cx - 2, cy - 12]], [[cx + 12, cy - 2], [cx + 6, cy + 6]], [[cx - 10, cy + 12], [cx - 4, cy + 19]]].slice(0, 1 + Math.round(ch * 2)), 0.9 + ch * 0.9);
      const fx = cx + s * 4, fy = cy + 1;                                                                                               // le fourneau : éteint, puis rallumé
      if (froid) {
        x.save(); x.translate(fx, fy); x.scale(s ? 0.8 : 1, 1); poly(x, [[-7, -8], [7, -8], [5, 8], [-5, 8]]); x.fillStyle = '#05080d'; x.fill();
        x.shadowColor = '#5ac8ff'; x.shadowBlur = 7; poly(x, [[0, -1 - ch * 6], [2.6, 4], [0, 6.5], [-2.6, 4]]); x.fillStyle = '#9fe2ff'; x.fill(); x.shadowBlur = 0;
        x.strokeStyle = '#0b0806'; x.lineWidth = 2; for (const u of [-0.5, 0, 0.5]) { trait(x, [[u * 7, -8], [u * 5, 8]]); x.stroke(); } poly(x, [[-7, -8], [7, -8], [5, 8], [-5, 8]]); x.lineWidth = 2.2; x.stroke(); x.restore();
      } else fourneau(x, fx, fy, 7 + ch * 2, 8 + ch * 2, s ? 0.8 : 1, 3);
      Q.devant();
      if (froid) { bras(x, cx - 17, cy - 15, cx + 9, cy + 3, 30, -1, 0.85, palF); bras(x, cx + 17, cy - 15, cx - 9, cy + 9, 30, 1, 0.85, palF); }   // il se serre dans ses bras
      else { bras(x, cx - 17, cy - 15, cx - 30, cy + 12 - ch * 10, 34, -1, 0.85, palF); bras(x, cx + 17, cy - 15, cx + 30, cy + 12 - ch * 10, 34, 1, 0.85, palF); }
      for (const c of [-1, 1]) {                                                                                                        // les épaules de fer, et leurs glaçons
        const ex = cx + c * 18 - s * 2, ey = cy - 19; plaque(x, [[ex - 9, ey - 5], [ex + 9, ey - 5], [ex + 10, ey + 5], [ex - 10, ey + 5]], palF, { or: 0.4, riv: [[ex, ey]] });
        if (ch < 0.8) for (const u of [-1, 0, 1]) pointe(x, ex + u * 6, ey + 4.5, Math.PI / 2, (13 - Math.abs(u) * 4) * (1 - ch), 3.6, GIVRE);
      }
      const hx = cx + s * 5, hy = cy - 38;                                                                                              // la tête : un heaume de fer givré
      plaque(x, [[hx - 10, hy - 11], [hx + 10, hy - 11], [hx + 11, hy + 7], [hx + s * 3, hy + 13], [hx - 11, hy + 7]], palF, { or: 0.4, bord: [[hx - 10, hy - 11], [hx + 10, hy - 11]] });
      fente(x, hx, hy - 1, 8.5, s);
      if (froid) for (const c of [-1, 1]) { x.shadowColor = '#5ac8ff'; x.shadowBlur = 5; ell(x, hx + c * 4.4 + s * 1.5, hy - 1, 2.6 * (c * s > 0 ? 0.7 : 1), 1.1, '#bfeaff'); x.shadowBlur = 0; }   // des yeux pâles, presque éteints
      else { oeil(x, hx - 4.4 + s * 1.5, hy - 1.2, 3.5, -1, s > 0 ? 0.7 : 1, 0.6 + ch); oeil(x, hx + 4.4 + s * 1.5, hy - 1.2, 3.5, 1, s < 0 ? 0.7 : 1, 0.6 + ch); }
      if (ch < 0.8) { for (const u of [-1, 1]) pointe(x, hx + u * 6, hy + 8, Math.PI / 2, 9 * (1 - ch), 3, GIVRE); pointe(x, hx - 9, hy - 10, -Math.PI / 2 - 0.4, 8, 3.4, GIVRE); pointe(x, hx + 9, hy - 10, -Math.PI / 2 + 0.4, 8, 3.4, GIVRE); }
      // le givre : des cristaux blancs sur la roche et le fer
      x.fillStyle = 'rgba(245,252,255,.9)'; for (let i = 0; i < 46 * (1 - ch); i++) { const gx = cx + (r() * 2 - 1) * 16, gy = cy + (r() * 2 - 1) * 24; x.fillRect(gx, gy, 1.3, 1.3); }
      if (ch < 0.3) { x.strokeStyle = 'rgba(245,252,255,.9)'; x.lineWidth = 0.9; for (const q of [[-9, -10], [8, 10], [-5, 14]]) for (let a = 0; a < 3; a++) { const an = a * Math.PI / 3; trait(x, [[cx + q[0] - Math.cos(an) * 3.4, cy + q[1] - Math.sin(an) * 3.4], [cx + q[0] + Math.cos(an) * 3.4, cy + q[1] + Math.sin(an) * 3.4]]); x.stroke(); } }
    },
    // --- LE SINGE : un petit torse de roche, une tête de fer au museau avancé, deux oreilles en boulons, une queue en chaîne,
    //     et surtout deux bras immenses, faits pour se suspendre, aux longues griffes.
    singe(x, T, o) {
      const s = o.yaw, al = allure(o, 12), arme = o.etat === 'arme', frappe = o.etat === 'frappe', cote = s < 0 ? -1 : 1;
      const Q = pattes(x, s, al, 13, 28, 27, 0.9), cx = al.bal + s * 2, cy = -54 + al.ecr;
      x.strokeStyle = NOIR; x.lineWidth = 1.4;                                                                                          // la queue : une chaîne
      for (let i = 0; i < 11; i++) { const u = i / 10, a = u * 4.4 - 0.6, rr = 20 - u * 12, qx = cx - cote * (18 + 16 * u) - cote * Math.cos(a) * rr * 0.5, qy = cy + 14 - u * 26 + Math.sin(a) * rr * 0.5; x.beginPath(); x.ellipse(qx, qy, 3.2, 2.2, a + (i % 2 ? 1.2 : 0), 0, TAU); x.fillStyle = i % 2 ? FER[0] : FER[1]; x.fill(); x.stroke(); }
      Q.fond();
      bras(x, cx - cote * 18, cy - 15, cx - cote * 38, -9 + al.ecr, 80, -cote, 1.0);                                                    // le bras du fond : il traîne presque par terre
      plaque(x, [[cx - 11, cy + 12], [cx + 11, cy + 12], [cx + 9, cy + 22], [cx - 9, cy + 22]], FER, { or: 0 });
      roc(x, cx, cy - 2, 18, 19, 171); veines(x, [[[cx - 14, cy + 2], [cx - 8, cy + 9]], [[cx + 13, cy - 2], [cx + 8, cy + 6]]], 1);
      plaque(x, [[cx - 13 + s * 2, cy - 16], [cx + 13 + s * 2, cy - 16], [cx + 9 + s * 3, cy - 2], [cx - 9 + s * 3, cy - 2]], BRONZE, { riv: [[cx - 9 + s * 2, cy - 12], [cx + 9 + s * 2, cy - 12]] });
      fourneau(x, cx + s * 4, cy + 6, 5, 4.6, s ? 0.8 : 1, 2);
      Q.devant();
      for (const c of [-1, 1]) roc(x, cx + c * 19 - s * 2, cy - 15, 9, 8, 172 + c, FER, 7);
      const hx = cx + s * 6, hy = cy - 30;                                                                                              // la tête
      for (const c of [-1, 1]) { const ox = hx + c * 13 - s * 2, oy = hy - 3; ell(x, ox, oy, 7, 7, NOIR); ell(x, ox, oy, 5.6, 5.6, BRONZE[0]); ell(x, ox, oy, 2.6, 2.6, NOIR); ell(x, ox - 1.6, oy - 1.8, 1.2, 1.2, OR); }   // les oreilles : deux gros boulons
      for (const u of [-1, 0, 1]) pointe(x, hx + u * 4, hy - 10, -Math.PI / 2 + u * 0.3, 9 - Math.abs(u) * 3, 4, FER);
      plaque(x, [[hx - 11, hy - 10], [hx + 11, hy - 10], [hx + 12, hy + 3], [hx - 12, hy + 3]], FER, { bord: [[hx - 11, hy - 10], [hx + 11, hy - 10]] });
      fente(x, hx, hy - 3, 9, s); oeil(x, hx - 4.6 + s * 1.5, hy - 3.2, 3.6, -1, s > 0 ? 0.7 : 1); oeil(x, hx + 4.6 + s * 1.5, hy - 3.2, 3.6, 1, s < 0 ? 0.7 : 1);
      const ux = hx + s * 3;                                                                                                            // le museau de bronze, et ses dents
      plaque(x, [[ux - 8, hy + 1], [ux + 8, hy + 1], [ux + 11, hy + 13], [ux - 11, hy + 13]], BRONZE, { or: 0.8, riv: [[ux - 3, hy + 4], [ux + 3, hy + 4]] });
      x.fillStyle = '#020203'; x.fillRect(ux - 8, hy + 7.5, 16, 3.6); dents(x, ux - 8, ux + 8, hy + 7.5, 3.4, 6);
      const mx = cx + cote * (arme ? 30 : frappe ? 24 : 40), my = arme ? cy - 44 : frappe ? cy + 30 : -8 + al.ecr;                       // le bras de devant : immense
      bras(x, cx + cote * 18, cy - 15, mx, my, 80, cote, 1.1);
    },
    // --- LE SAUTEUR : un golem monté sur deux énormes ressorts d'acier. ressort : 1 écrasés (il va bondir), 0 détendus (il est en l'air).
    sauteur(x, T, o) {
      const s = o.yaw, c = o.ressort == null ? 1 : o.ressort, hS = 15 + (1 - c) * 30, al = allure(o, 8), cx = al.bal + s * 2, cy = -hS - 46 + al.ecr, haut = c < 0.3;
      for (const k of [-1, 1]) {                                                                                                        // les deux ressorts, leur piston, leur grand pied à griffes
        const fx = k * 15 + s * 2, fy = -al.lev[k < 0 ? 0 : 1], top = -hS - 8 + al.ecr, n = 7, y0 = fy - 8;
        x.strokeStyle = NOIR; x.lineWidth = 3.4; trait(x, [[fx, y0], [cx + k * 13, top]]); x.stroke(); x.strokeStyle = BRONZE[0]; x.lineWidth = 1.6; x.stroke();
        x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); x.moveTo(fx, y0); for (let i = 1; i <= n; i++) { const u = i / (n + 0.5); x.lineTo(mel(fx, cx + k * 13, u) + (i % 2 ? 9 : -9), mel(y0, top, u)); } x.lineTo(cx + k * 13, top);
        x.strokeStyle = NOIR; x.lineWidth = 5.6; x.stroke(); x.strokeStyle = ACIER[1]; x.lineWidth = 3; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 0.9; x.stroke(); x.lineCap = 'butt';
        poly(x, [[fx - 9, fy - 9], [fx + 9, fy - 9], [fx + 13, fy - 1.5], [fx - 13, fy - 1.5]]); x.fillStyle = lin(x, 0, fy - 9, 0, fy, [FER[0], FER[2]]); x.fill(); x.strokeStyle = NOIR; x.lineWidth = 1.3; x.stroke();
        for (const u of [-1, 1, 0]) pointe(x, fx + u * 8, fy - 3.6, Math.PI / 2 - u * 0.55, u ? 7 : 8, 5, OS);
      }
      plaque(x, [[cx - 22, cy + 30], [cx + 22, cy + 30], [cx + 18, cy + 40], [cx - 18, cy + 40]], BRONZE, { riv: [[cx - 13, cy + 35], [cx + 13, cy + 35]] });   // le bassin : la traverse des ressorts
      for (const k of [-1, 1]) {                                                                                                        // deux tuyaux d'échappement, dans le dos
        const qx = cx + k * 17 - s * 3, qy = cy - 14; plaque(x, [[qx - 5, qy - 18], [qx + 5, qy - 18], [qx + 6, qy + 6], [qx - 6, qy + 6]], FER, { or: 0.5, bord: [[qx - 5, qy - 18], [qx + 5, qy - 18]] });
        if (haut) { x.fillStyle = 'rgba(200,205,210,.45)'; ell(x, qx + 2, qy - 26, 7, 5); ell(x, qx - 2, qy - 35, 5.4, 4); }
      }
      roc(x, cx, cy + 8, 21, 22, 181); veines(x, [[[cx - 16, cy + 2], [cx - 10, cy - 5]], [[cx + 16, cy + 12], [cx + 10, cy + 19]]], 1.1);
      plaque(x, [[cx - 15 + s * 2, cy - 8], [cx + 15 + s * 2, cy - 8], [cx + 11 + s * 3, cy + 8], [cx - 11 + s * 3, cy + 8]], BRONZE, { riv: [[cx - 11 + s * 2, cy - 4], [cx + 11 + s * 2, cy - 4]] });
      fourneau(x, cx + s * 4, cy + 16, 6, 5.4, s ? 0.8 : 1, 3);
      for (const k of [-1, 1]) bras(x, cx + k * 20, cy - 2, cx + k * (haut ? 34 : 27), cy + (haut ? -22 : 24), 30, k, 0.85);            // les bras : en l'air quand il bondit
      const hx = cx + s * 5, hy = cy - 24;                                                                                              // la tête
      for (const k of [-1, 1]) { x.strokeStyle = NOIR; x.lineWidth = 2.6; x.beginPath(); x.moveTo(hx + k * 6, hy - 9); for (let i = 1; i <= 5; i++) x.lineTo(hx + k * (6 + i * 1.4) + (i % 2 ? 3 : -3), hy - 9 - i * 3.4); x.stroke(); x.strokeStyle = ACIER[1]; x.lineWidth = 1.2; x.stroke(); x.shadowColor = '#ff3a10'; x.shadowBlur = 6; ell(x, hx + k * 13, hy - 28, 3, 3, '#ff6a2a'); x.shadowBlur = 0; }   // deux antennes à ressort
      plaque(x, [[hx - 11, hy - 10], [hx + 11, hy - 10], [hx + 12, hy + 6], [hx + s * 3, hy + 12], [hx - 12, hy + 6]], FER, { bord: [[hx - 11, hy - 10], [hx + 11, hy - 10]], riv: [[hx - 8, hy + 3], [hx + 8, hy + 3]] });
      fente(x, hx, hy - 2, 9, s); oeil(x, hx - 4.6 + s * 1.5, hy - 2.2, 3.7, -1, s > 0 ? 0.7 : 1); oeil(x, hx + 4.6 + s * 1.5, hy - 2.2, 3.7, 1, s < 0 ? 0.7 : 1);
    },
  });
  function melc(a, b, t) { const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(mel(v, B[i], Math.max(0, Math.min(1, t)))).toString(16).padStart(2, '0')).join(''); }

  // ================= du jeu au modèle =================
  // m : le modèle ; sc : sa taille dans le jeu (le bestiaire est peint grand : ici, la place est petite et il y a foule)
  const MODELE = {
    rapide:    { m: 'trotteur', sc: 0.5 },    // le rôdeur
    bouclier:  { m: 'bouclier', sc: 0.47 },   // le porte-dalle
    lourd:     { m: 'gros', sc: 0.42 },       // le colosse de roche du bestiaire (ici : « le gros »)
    cracheur:  { m: 'lanceur', sc: 0.47 },    // le frondeur
    berserker: { m: 'fonceur', sc: 0.52 },    // le bélier
    souffleur: { m: 'soufflet', sc: 0.5 },
    chevalier: { m: 'cuirasse', sc: 0.46 },
    porteur:   { m: 'porteur', sc: 0.46 },
    colosse:   { m: 'colosseA', sc: 0.53 },
    glouton:   { m: 'glouton', sc: 0.62 },
    frileux:   { m: 'frileux', sc: 0.6 },
    singe:     { m: 'singe', sc: 0.68 },
    sauteur:   { m: 'sauteur', sc: 0.6 },
  };
  const TEINTES = { mouille: 'rgba(40,95,170,.26)', farine: 'rgba(248,244,236,.55)', statue: 'rgba(184,104,60,.84)', feu: 'rgba(255,120,40,.3)', grille: 'rgba(12,12,14,.5)', elec: 'rgba(200,240,255,.5)', rouge: 'rgba(255,70,20,.3)', poison: 'rgba(120,200,70,.3)' };
  let dens = 2; const cuits = new Map(), file = [], MAXI = 300;
  const variante = o => (o.sansBouclier ? 'n' : '') + (o.grille ? 'g' : '') + (o.denude ? 'd' : '') + (o.porte ? 'p' : '') + (o.dort ? 'z' : '') + (o.bouche ? 'b' : '') + (o.gonfle ? 'G' : '') + (o.chaud ? 'c' + o.chaud : '') + (o.ressort != null ? 'r' + o.ressort : '');
  const normal = o => { const etat = o.etat || 'marche', mm = etat === 'marche', k = o.k || 0; return Object.assign({}, o, { yaw: o.yaw || 0, etat, k: mm && k === 1 ? 2 : k, pied: mm && o.pied ? 1 : 0 }); };
  const cle = (m, o) => m + '/' + o.yaw + '/' + o.etat + '/' + o.k + '/' + o.pied + '/' + variante(o);
  // (une toile qu'on jette est vidée tout de suite : sur iPhone, sinon, sa mémoire n'est rendue que bien plus tard)
  const vider = c => { if (c) c.width = c.height = 0; };
  function garder(k, sp) { if (cuits.size >= MAXI) { let n = 0; for (const [q, v] of cuits) { vider(v.c); cuits.delete(q); if (++n >= 40) break; } } cuits.set(k, sp); return sp; }
  function base(type, o) {
    const M = MODELE[type], k = cle(M.m, o); let sp = cuits.get(k);
    if (sp) { cuits.delete(k); cuits.set(k, sp); return sp; }
    const [w, h, ox, oy] = TY[M.m].boite, K = Math.max(0.9, Math.min(2, M.sc * dens * 1.06));
    return garder(k, rogner(sprite(w, h, ox, oy, K, x => Golems.peindre(x, M.m, o)), K));
  }
  // la toile est peinte large (pour que rien ne dépasse) : on ne garde que le rectangle où il y a vraiment le golem — une image
  // deux à trois fois plus petite, donc deux à trois fois plus vite recopiée (et moins de mémoire)
  function rogner(sp, K) {
    const c = sp.c, w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data; let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let y = 0; y < h; y += 2) for (let x = 0, i = y * w * 4 + 3; x < w; x += 2, i += 8) if (d[i] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return sp;
    x0 = Math.max(0, x0 - 3); y0 = Math.max(0, y0 - 3); x1 = Math.min(w - 1, x1 + 4); y1 = Math.min(h - 1, y1 + 4);
    const c2 = toile(x1 - x0 + 1, y1 - y0 + 1); c2.getContext('2d').drawImage(c, -x0, -y0); vider(c);
    return { c: c2, w: c2.width / K, h: c2.height / K, ox: sp.ox - x0 / K, oy: sp.oy - y0 / K };
  }
  function image(type, o, teinte) {
    o = normal(o); const b = base(type, o); if (!teinte) return b;
    const k = cle(MODELE[type].m, o) + '#' + teinte; let sp = cuits.get(k);
    if (sp) { cuits.delete(k); cuits.set(k, sp); return sp; }
    const c = toile(b.c.width, b.c.height), x = c.getContext('2d'); x.drawImage(b.c, 0, 0); x.globalCompositeOperation = 'source-atop';
    if (teinte === 'boue') { const gr = x.createLinearGradient(0, c.height * 0.45, 0, c.height); gr.addColorStop(0, 'rgba(112,78,48,0)'); gr.addColorStop(0.45, 'rgba(112,78,48,.8)'); gr.addColorStop(1, 'rgba(84,56,34,.95)'); x.fillStyle = gr; }
    else x.fillStyle = TEINTES[teinte];
    x.fillRect(0, 0, c.width, c.height);
    if (teinte === 'statue') { x.strokeStyle = 'rgba(70,30,12,.7)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(c.width * 0.36, c.height * 0.2); x.lineTo(c.width * 0.5, c.height * 0.48); x.lineTo(c.width * 0.44, c.height * 0.78); x.moveTo(c.width * 0.66, c.height * 0.34); x.lineTo(c.width * 0.54, c.height * 0.56); x.stroke(); }
    return garder(k, { c, w: b.w, h: b.h, ox: b.ox, oy: b.oy });
  }
  // dessiner un golem du jeu : (x, y) ses pieds ; k : sa taille en plus (la profondeur) ; o : sa pose ; teinte : son état
  function dessiner(g, type, x, y, k, o, teinte) {
    const sp = image(type, o, teinte), sc = MODELE[type].sc * k;
    g.drawImage(sp.c, x - sp.ox * sc, y - sp.oy * sc, sp.w * sc, sp.h * sc);
  }
  const haut = type => TY[MODELE[type].m].haut * MODELE[type].sc;
  function regler(d) { if (Math.abs(d - dens) > 0.05) { dens = d; for (const v of cuits.values()) vider(v.c); cuits.clear(); } }
  // préparer d'avance la marche d'une sorte de golem (un peu à chaque image, quand le jeu a du temps) : de face d'abord
  function prevoir(types, o0) {
    for (const yaw of [0, -1, 1]) for (const type of types) { for (const pied of [0, 1]) for (const k of [0, 2, 3, 4]) file.push([type, Object.assign({ yaw, etat: 'marche', k, pied }, o0 && o0[type])]); if (!yaw) file.push([type, Object.assign({ yaw, etat: 'arme', k: 0, pied: 0 }, o0 && o0[type])], [type, Object.assign({ yaw, etat: 'frappe', k: 0, pied: 0 }, o0 && o0[type])]); }
  }
  function precuire(ms) { const t0 = performance.now(); while (file.length && performance.now() - t0 < ms) { const [type, o] = file.shift(); base(type, normal(o)); } return file.length; }
  return { MODELE, dessiner, image, haut, regler, prevoir, precuire, get cuits() { return cuits.size; }, get file() { return file.length; } };
})();
