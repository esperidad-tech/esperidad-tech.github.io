/* ==========================================================
   Mimi en pantin — 2 sur 4 : SES AUTRES VUES (Romain, 16 novembre, 19 h 56 : « quand elle se retourne, tu retournes l'image, on voit
   bien que c'est plat […] il faut vraiment faire des dessins pour chaque étape […] quand elle remonte, il faut qu'elle soit de dos […]
   il y a le profil, le 45 degrés, le 90 degrés de derrière, le 90 degrés de face »).  DESIGN-saison1.md §12.68.

   mimi-dessin.js la dessine de profil. Ici : les quatre autres dessins — de trois-quarts face, de face, de trois-quarts dos, de dos —
   pour les huit directions où elle peut aller (MimiPantin.VUES ; à gauche, le dessin est en miroir) :

         5 ↖  6 ↑  7 ↗            6 : de dos (elle s'éloigne)          5, 7 : de trois-quarts dos
         4 ←       → 0            0, 4 : de profil (mimi-dessin.js)
         3 ↙  2 ↓  1 ↘            2 : de face (elle vient vers nous)   1, 3 : de trois-quarts face

   COMMENT C'EST FAIT
   - Ce sont LES MÊMES réglages (la pose P : les hanches, les épaules, le bout de chaque patte, la queue…) que pour le profil : toutes
     ses poses, sa marche, ses sauts et ses gestes marchent donc dans toutes les vues, sans rien réécrire.
   - On place chaque point de son squelette dans l'espace (x : vers son nez, y : vers le bas, z : vers sa droite), on la tourne dans
     la direction voulue, et on la regarde d'un peu au-dessus, comme la pièce (PENTE : ce qui est loin est plus haut à l'écran).
   - Puis on DESSINE, à plat, avec ces points : le corps (l'enveloppe de trois ronds : les hanches, le milieu, les épaules), chaque os
     d'une patte (une « gélule » entre deux ronds), la queue (six gélules), les rayures en travers du dos, le plastron.
     Aucune image n'est tournée ni écrasée : chaque vue est un vrai dessin, refait à chaque image.
   - L'ordre des morceaux change avec la vue (de dos, la tête est derrière le corps et la queue devant) : trois calques
     (les pattes du fond, la queue, le corps avec les pattes de devant) que le pantin range dans le bon ordre quand la vue change.
   - La tête est celle du profil (vue de face) ; de dos, on cache son visage et on montre sa nuque (mimi-dessin.js).
   ========================================================== */
(function(G){
'use strict';
var M = G.MimiPantin, LG = M.LG, f1 = M.outils.f1, f2 = M.outils.f2, borne = M.outils.borne;
var K = '#24182e', RAD = Math.PI / 180, TAU = Math.PI * 2, EP = 2.3;
var PENTE = M.PENTE = 0.36;       /* ce qui est 10 plus loin est 3,6 plus haut à l'écran (le plancher de l'atelier, vu d'un peu au-dessus) */
var ZH = 5.2, ZA = 4.4;           /* l'écart des pattes de derrière, de devant, de chaque côté de son milieu */

M.VUES = [
  {nom:'profil', co:1}, {nom:'tqf', co:1, psi:45}, {nom:'face', co:1, psi:90}, {nom:'tqf', co:-1, psi:45},
  {nom:'profil', co:-1}, {nom:'tqd', co:-1, psi:-45}, {nom:'dos', co:1, psi:-90}, {nom:'tqd', co:1, psi:-45}
];
/* la direction (0 … 7) d'un déplacement : dx vers la droite de l'écran, dp vers nous (en vraie profondeur) */
M.direction = function(dx, dp){ return ((Math.round(Math.atan2(dp, dx) / RAD / 45) % 8) + 8) % 8; };
/* d'une direction à une autre, par le plus court ; à égalité, en passant par la vue de face (c'est la plus jolie) */
M.pasDeVue = function(de, vers){
  var d = ((vers - de) % 8 + 8) % 8;
  if(!d) return 0;
  if(d === 4) return de < 2 || de > 5 ? 1 : -1;
  return d < 4 ? 1 : -1;
};

function pt(q){ return f1(q[0]) + ',' + f1(q[1]); }
/* une « gélule » : l'enveloppe de deux ronds (x0, y0, r0) et (x1, y1, r1) */
function gelule(x0, y0, r0, x1, y1, r1){
  var dx = x1 - x0, dy = y1 - y0, d = Math.sqrt(dx * dx + dy * dy);
  if(d < 0.05 || d <= Math.abs(r0 - r1) + 0.02){        /* l'un contient l'autre : un seul rond */
    var r = Math.max(r0, r1), cx = r0 >= r1 ? x0 : x1, cy = r0 >= r1 ? y0 : y1, rs = f1(r);
    return 'M' + f1(cx - r) + ',' + f1(cy) + ' a' + rs + ',' + rs + ' 0 1 0 ' + f1(2 * r) + ',0 a' + rs + ',' + rs + ' 0 1 0 ' + f1(-2 * r) + ',0 Z';
  }
  var a = Math.atan2(dy, dx), b = Math.acos((r0 - r1) / d), c1 = Math.cos(a + b), s1 = Math.sin(a + b), c2 = Math.cos(a - b), s2 = Math.sin(a - b);
  return 'M' + f1(x0 + r0 * c1) + ',' + f1(y0 + r0 * s1) + ' L' + f1(x1 + r1 * c1) + ',' + f1(y1 + r1 * s1) +
    ' A' + f1(r1) + ',' + f1(r1) + ' 0 ' + (b > Math.PI / 2 ? 1 : 0) + ' 0 ' + f1(x1 + r1 * c2) + ',' + f1(y1 + r1 * s2) +
    ' L' + f1(x0 + r0 * c2) + ',' + f1(y0 + r0 * s2) +
    ' A' + f1(r0) + ',' + f1(r0) + ' 0 ' + (b < Math.PI / 2 ? 1 : 0) + ' 0 ' + f1(x0 + r0 * c1) + ',' + f1(y0 + r0 * s1) + ' Z';
}
/* l'enveloppe de plusieurs ronds [[x, y, r], …] : une courbe fermée */
var COS = [], SIN = [], NC = 22;
(function(){ for(var i = 0; i < NC; i++){ COS[i] = Math.cos(TAU * i / NC); SIN[i] = Math.sin(TAU * i / NC); } })();
function coque(cs){
  var pts = [], i, j, v, best, bx, by;
  for(i = 0; i < NC; i++){
    best = -1e9;
    for(j = 0; j < cs.length; j++){ v = cs[j][0] * COS[i] + cs[j][1] * SIN[i] + cs[j][2]; if(v > best){ best = v; bx = cs[j][0] + cs[j][2] * COS[i]; by = cs[j][1] + cs[j][2] * SIN[i]; } }
    pts.push([bx, by]);
  }
  return M.lisse(pts);
}
/* le plastron, de face (autour de son milieu) */
var PLASTRON = [[-6, -5], [-3.6, -3.2], [-2, -6.2], [0, -3.4], [2, -6.2], [3.6, -3.2], [6, -5], [6.8, 1], [4.2, 6.4], [1.6, 7.6], [0, 9.4], [-1.6, 7.6], [-4.2, 6.4], [-6.8, 1]];

/* ==========================================================
   Résoudre une pose dans une vue : P (les mêmes réglages que le profil), V (une des MimiPantin.VUES, pas le profil) → R
   Les morceaux : vT (le corps), vR (les rayures), vP (le pli de la croupe ou du poitrail), vB (le plastron), vN (le cou),
   vA…, vB… : les deux pattes du fond ; vC…, vD… : les deux pattes de devant (0, 1, 2 : les os ; p : le bout) ; vq0 … vq5 : la queue ; vqr : ses anneaux.
   ========================================================== */
M.resoudreVue = function(P, V, R){
  R = R || {};
  var psi = V.psi * RAD, c = Math.cos(psi), s = Math.sin(psi), nom = V.nom, dos = nom === 'dos' || nom === 'tqd';
  var hx = P.hx, hy = P.hy, sx = P.sx, sy = P.sy, bcx = (hx + sx) / 2, bcy = (hy + sy) / 2;
  var rr = P.rr * RAD, cr = Math.cos(rr), sr = Math.sin(rr), rx = P.rx, ry = P.ry;
  /* un point d'elle (x vers son nez, y vers le bas, z vers sa droite) → [à l'écran x, y, sa profondeur (plus grand : plus près de nous)] */
  function pj(x, y, z){
    if(rr){ var ax = x - bcx, ay = y - bcy; x = bcx + ax * cr - ay * sr; y = bcy + ax * sr + ay * cr; }
    x += rx; y += ry;
    var D = x * s + z * c;
    return [x * c - z * s, y + D * PENTE, D];
  }
  var dx = sx - hx, dy = sy - hy, len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len, nx = uy, ny = -ux;   /* (n : du côté du dos) */
  var i, j, q, a;

  /* ---- le corps : les hanches, le milieu, les épaules ---- */
  var rmil = (P.rh + P.rs) / 2 + (P.rm + P.vent) / 2, dec = P.arc - (P.vent - P.rm) / 2;
  var hz = P.hz || 0, sz = P.sz || 0;                                  /* (le déhanché : les hanches et les épaules vont un peu d'un côté, de l'autre) */
  var cH = pj(hx, hy, hz), cM = pj(bcx + nx * dec, bcy + ny * dec, (hz + sz) / 2), cS = pj(sx, sy, sz);
  var ronds = [[cH[0], cH[1], P.rh, cH[2]], [cM[0], cM[1], rmil, cM[2]], [cS[0], cS[1], P.rs, cS[2]]];
  R['vT:d'] = coque(ronds);
  /* le pli : le haut du rond le plus près de nous (la croupe vue de dos, le poitrail vu de face) */
  var pres = cH[2] > cS[2] ? ronds[0] : ronds[2], loin = cH[2] > cS[2] ? ronds[2] : ronds[0], ecart = Math.abs(pres[1] - loin[1]) + Math.abs(pres[0] - loin[0]);
  R['vP:d'] = ecart > 5 ? 'M' + f1(pres[0] + pres[2] * Math.cos(-158 * RAD)) + ',' + f1(pres[1] + pres[2] * Math.sin(-158 * RAD)) + ' A' + f1(pres[2]) + ',' + f1(pres[2]) + ' 0 0 1 ' +
    f1(pres[0] + pres[2] * Math.cos(-22 * RAD)) + ',' + f1(pres[1] + pres[2] * Math.sin(-22 * RAD)) : 'M0,0';
  /* les rayures : en travers du dos, là où on le voit (pas derrière un rond plus proche) */
  var st = '', vf = s * 0.933, vz = c * 0.933, vy = PENTE;           /* (d'où on la regarde, dans ses mesures à elle) */
  [0.12, 0.28, 0.44, 0.6, 0.76, 0.9].forEach(function(t, k){
    var bosse = 4 * t * (1 - t), px = hx + dx * t + nx * P.arc * bosse, py = hy + dy * t + ny * P.arc * bosse, r = P.rh + (P.rs - P.rh) * t + P.rm * Math.sin(Math.PI * t) - 0.5;
    var D0 = (px + rx) * s, lim = k % 2 ? 62 : 78, trace = false;
    for(a = -lim; a <= lim + 0.1; a += 13){
      var ca = Math.cos(a * RAD), sa = Math.sin(a * RAD);
      var vis = ca * (nx * vf - ny * vy) + sa * vz > 0.06;
      if(vis){
        q = pj(px + nx * r * ca, py + ny * r * ca, r * sa + hz + (sz - hz) * t);
        for(j = 0; j < 3 && vis; j++) if(ronds[j][3] > D0 + 2 && Math.hypot(q[0] - ronds[j][0], q[1] - ronds[j][1]) < ronds[j][2] - 0.8) vis = false;
      }
      if(vis){ st += (trace ? ' L' : ' M') + pt(q); trace = true; } else trace = false;
    }
  });
  R['vR:d'] = st || 'M0,0';
  /* le plastron clair, quand on voit son poitrail */
  if(s > 0.3){
    var pc = pj(sx + ux * P.rs * 0.55 - nx * 2.5, sy + uy * P.rs * 0.55 - ny * 2.5, 0), kx = 0.5 + 0.5 * s, bx = pc[0] + c * 3.4;
    R['vB:d'] = 'M' + PLASTRON.map(function(w){ return f1(bx + w[0] * kx) + ',' + f1(pc[1] + w[1]); }).join(' L') + ' Z';
  } else R['vB:d'] = 'M0,0';

  /* ---- les pattes ---- */
  var av = [c, s * PENTE];                                             /* « vers l'avant », à l'écran */
  function arriere(pre, cz){
    var phi = P[pre + 'p'] * RAD, cp = Math.cos(phi), sp = Math.sin(phi), jx = hx - ux - nx * 2.5, jy = hy - uy - ny * 2.5;
    var o = M.ik(jx, jy, P[pre + 'x'] - LG.pied * cp, P[pre + 'y'] - LG.pied * sp, LG.cui, LG.jam, -1);
    var J = pj(jx, jy, cz * ZH + hz), Kn = pj(o[2], o[3], cz * (ZH + 1.4) + hz * 0.5), A = pj(o[4], o[5], cz * (ZH + 0.9)), T = pj(o[4] + LG.pied * cp, o[5] + LG.pied * sp, cz * (ZH + 0.9));
    R['_' + pre] = T;
    T[3] = -1.8 - P[pre + 'y'];                                     /* (de combien elle est levée) */
    return [gelule(J[0], J[1], 8.4, Kn[0], Kn[1], 4.7), gelule(Kn[0], Kn[1], 4.7, A[0], A[1], 3.4), gelule(A[0], A[1], 3.4, T[0], T[1], 3),
      gelule(T[0] - av[0] * 3.2, T[1] - av[1] * 3.2 - 0.3, 3.2, T[0] + av[0] * 1.4, T[1] + av[1] * 1.4 - 0.3, 3.3), T];
  }
  function avant(pre, cz){
    var jx = sx + ux * 4 - nx * 2.5, jy = sy + uy * 4 - ny * 2.5, o = M.ik(jx, jy, P[pre + 'x'], P[pre + 'y'], LG.bras, LG.avb, 1);
    var J = pj(jx, jy, cz * ZA + sz), E = pj(o[2], o[3], cz * (ZA + 0.7) + sz * 0.5), W = pj(o[4], o[5], cz * ZA);
    R['_' + pre] = W;
    return [gelule(J[0], J[1], 6.4, E[0], E[1], 4.5), gelule(E[0], E[1], 4.5, W[0], W[1], 3.6), 'M0,0',
      gelule(W[0] - av[0] * 1.4, W[1] - av[1] * 1.4 + 0.5, 3.5, W[0] + av[0] * 4.4, W[1] + av[1] * 4.4 + 0.7, 3.5), W];
  }
  var j1 = arriere('j1', 1), j2 = arriere('j2', -1), a1 = avant('a1', 1), a2 = avant('a2', -1);
  var qui = nom === 'face' ? [j1, j2, a1, a2] : nom === 'dos' ? [a1, a2, j1, j2] : [j2, a2, j1, a1];   /* (les deux du fond, puis les deux de devant) */
  ['A', 'B', 'C', 'D'].forEach(function(L, k){ var g = qui[k]; R['v' + L + '0:d'] = g[0]; R['v' + L + '1:d'] = g[1]; R['v' + L + '2:d'] = g[2]; R['v' + L + 'p:d'] = g[3]; });
  /* les doigts des pattes de devant, quand elles viennent vers nous : deux petits traits au bout */
  var dg = '';
  if(s > 0.3) (nom === 'face' ? [a1, a2] : [a1]).forEach(function(g){
    var W = g[4], bx2 = W[0] + av[0] * 4.4, by2 = W[1] + av[1] * 4.4 + 1.6, px2 = -av[1] / (Math.abs(av[0]) + Math.abs(av[1]) + 0.01), py2 = av[0] / (Math.abs(av[0]) + Math.abs(av[1]) + 0.01);
    [-1.15, 1.15].forEach(function(e){ dg += 'M' + f1(bx2 + px2 * e - av[0] * 0.3) + ',' + f1(by2 + py2 * e - 0.4) + ' l' + f1(av[0] * 1.2) + ',' + f1(1.9 - Math.abs(av[0]) * 0.9) + ' '; });
  });
  R['vG:d'] = dg || 'M0,0';
  /* de dos, une patte de derrière qui se lève montre ses coussinets roses */
  var cs = '';
  if(s < -0.3) (nom === 'dos' ? [j1, j2] : [j1]).forEach(function(g){
    var T = g[4], lv = borne((T[3] - 0.8) / 2.2, 0, 1);
    if(lv > 0.05) cs += 'M' + f1(T[0] - 2.1 * lv) + ',' + f1(T[1] + 0.5) + ' a' + f1(2.1 * lv) + ',' + f1(1.6 * lv) + ' 0 1 0 ' + f1(4.2 * lv) + ',0 a' + f1(2.1 * lv) + ',' + f1(1.6 * lv) + ' 0 1 0 ' + f1(-4.2 * lv) + ',0 Z ';
  });
  R['vK:d'] = cs || 'M0,0';

  /* ---- la queue : six morceaux, qui se balancent aussi sur le côté ---- */
  var qx = hx - ux * P.rh * 0.8 + nx * P.rh * 0.32, qy = hy - uy * P.rh * 0.8 + ny * P.rh * 0.32, qz = hz, ang = P.q0, lat = 0, rq = M.RQ, pq = [pj(qx, qy, qz)], an = '';
  for(i = 0; i < 6; i++){
    if(i) ang += P['q' + i];
    lat += (P.ql || 0) * (i ? 0.26 : 0.1) + (i > 1 ? 9 * Math.abs(s) : 0);
    var cl = Math.cos(lat * RAD), x1 = qx + LG.q * Math.cos(ang * RAD) * cl, y1 = qy + LG.q * Math.sin(ang * RAD) * cl, z1 = qz + LG.q * Math.sin(lat * RAD);
    var p0 = pq[i], p1 = pj(x1, y1, z1);
    R['vq' + i + ':d'] = gelule(p0[0], p0[1], rq[i], p1[0], p1[1], rq[i + 1]);
    if(i < 5){      /* un anneau, en travers */
      var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.sqrt(tx * tx + ty * ty);
      if(tl > 2.4){ var hw = (rq[i] + rq[i + 1]) / 2 - 1.3; an += 'M' + f1(mx - ty / tl * hw) + ',' + f1(my + tx / tl * hw) + ' L' + f1(mx + ty / tl * hw) + ',' + f1(my - tx / tl * hw) + ' '; }
    }
    pq.push(p1); qx = x1; qy = y1; qz = z1;
  }
  R['vqr:d'] = an || 'M0,0';
  R._q = pq;

  /* ---- le cou, la tête ---- */
  var tc = pj(sx + P.tx, sy + P.ty, sz * 0.5), cou = pj(sx + ux * 2 + nx * 3, sy + uy * 2 + ny * 3, sz);
  if(s > 0) tc[1] -= 7 * s;                                            /* (quand elle vient vers nous, elle lève la tête pour nous regarder : on voit son poitrail) */
  R['vN:d'] = 'M' + pt(cou) + ' L' + f1(tc[0]) + ',' + f1(tc[1] + 6);
  /* où elle regarde : de trois-quarts face, un peu devant elle ; de face, droit vers nous ; de dos, sa nuque (qui tourne un peu aussi) */
  var lx = nom === 'tqf' ? 0.42 + P.lx * 0.6 : nom === 'face' ? (P.lx - 0.3) * 0.9 : nom === 'tqd' ? 0.75 : (P.lx - 0.3) * 0.6;
  M.resoudreTete(P, R, tc[0], tc[1], P.ta * Math.abs(c) * (dos ? -1 : 1), lx, dos ? 0 : P.ly, dos, nom === 'tqd');

  /* ---- tout le pantin ---- */
  R.rac = 'translate(' + M.X0 + ',' + M.Y0 + ') scale(' + f2(M.ECH * V.co) + ',' + M.ECH + ')';
  var haut = Math.max(0, -ry), ko = Math.max(0.35, 1 - haut / 110), mil = pj(bcx, 0, 0);
  R.ombre = 'translate(' + f1(M.X0 + M.ECH * V.co * mil[0]) + ',' + f1(M.Y0 + 1.5) + ') scale(' + f2((0.62 + len * Math.abs(c) / 105) * ko * M.ECH) + ',' + f2(ko * M.ECH * (1 + 1.5 * Math.abs(s))) + ')';
  R['ombre:o'] = f2(0.3 * ko);
  R['zzz:v'] = P.zz > 0.5 ? 'inline' : 'none';
  R._h = cH; R._s = cS; R._ventre = 1; R._qd = 0;
  return R;
};

/* ==========================================================
   Le dessin des trois calques (c : ses couleurs ; at : écrit un morceau avec sa valeur du moment)
   ========================================================== */
M.RQ = [4.1, 4.05, 3.9, 3.7, 3.4, 3.1, 2.5];           /* l'épaisseur de la queue, de l'attache au bout */
M.vuesSVG = function(c, at){
  var ctr = ' fill="' + K + '" stroke="' + K + '" stroke-width="' + (2 * EP) + '" stroke-linejoin="round"';
  function cont(slot){ return '<path' + at(slot) + ctr + '/>'; }
  function rempl(slot, f, x){ return '<path' + at(slot) + ' fill="' + f + '"' + (x || '') + '/>'; }
  function patte(L, f, fp){ var n = 'v' + L; return [cont(n + '0:d') + cont(n + '1:d') + cont(n + '2:d') + cont(n + 'p:d'), rempl(n + '0:d', f) + rempl(n + '1:d', f) + rempl(n + '2:d', f) + rempl(n + 'p:d', fp)]; }
  var A = patte('A', c.S, c.patS), B = patte('B', c.S, c.patS), C = patte('C', c.U, c.pat), D = patte('D', c.U, c.pat), i, qc = '', qr = '';
  for(i = 0; i < 6; i++){ qc += cont('vq' + i + ':d'); qr += rempl('vq' + i + ':d', i === 5 ? (c.tig ? c.R : c.Vu) : c.U); }
  return {
    vl:'<g class="mi-vl"' + at('vu:v') + '>' + A[0] + B[0] + A[1] + B[1] + '</g>',
    vq:'<g class="mi-vq"' + at('vu:v') + '>' + qc + qr + '<path' + at('vqr:d') + ' fill="none" stroke="' + c.R + '" stroke-width="2.3" stroke-linecap="butt"' + (c.tig ? '' : ' opacity=".5"') + '/></g>',
    vc:'<g class="mi-vc"' + at('vu:v') + '>' + cont('vT:d') + '<path' + at('vN:d') + ' fill="none" stroke="' + K + '" stroke-width="' + f1(15 + 2 * EP) + '" stroke-linecap="round"/>' + C[0] + D[0] +
      rempl('vT:d', c.F) +
      '<path' + at('vR:d') + ' fill="none" stroke="' + c.R + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"' + (c.tig ? '' : ' opacity=".5"') + '/>' +
      '<path' + at('vP:d') + ' fill="none" stroke="' + K + '" stroke-width="1.5" stroke-linecap="round" opacity=".38"/>' +
      '<path' + at('vN:d') + ' fill="none" stroke="' + c.U + '" stroke-width="15" stroke-linecap="round"/>' +
      '<path' + at('vB:d') + ' fill="' + c.V + '" stroke="' + c.Vu + '" stroke-width="1.2" stroke-linejoin="round"/>' +
      C[1] + D[1] + '<path' + at('vK:d') + ' fill="#ff9fb6"/><path' + at('vG:d') + ' fill="none" stroke="' + K + '" stroke-width="1" stroke-linecap="round" opacity=".6"/></g>'
  };
};
})(window);
