
/* ==========================================================
   LE GRAND MÉNAGE DU LABO (Alchimiste)
   Des insectes se promènent dans le labo. Les MAUVAIS (bocal rouge ☠)
   s'écrasent d'une touche : grosse tache de jus, « splotch » bien juteux.
   Les GENTILS (bocal vert ✔) ne s'écrasent pas : les toucher coûte un
   cœur (« oh non »). On peut les glisser dans leur bocal (bonus ; obligatoire
   dès le niveau 7). On les reconnaît à leur FORME : certains ont marché
   dans les ingrédients et sont teintés rouge, vert, bleu ou jaune.
   params.ensuite = 'differences' : une fois le labo propre, on enchaîne sur
   les 7 différences de l'étagère du labo, dans le même mini-jeu ; fin n'est
   appelée qu'une fois, à la toute fin.
   Mods : zone (insectes plus faciles à toucher), temps (+N s), lent (insectes
   plus lents, ex. 0.85), erreurs (+N cœurs), aide (N indices 💡 : un mauvais
   insecte est montré), revele (les mauvais ont un petit rond rouge), facile (cœur).
   ========================================================== */
function jambes(xb, ys, l, ep){
  var dirs = [[-0.75, -0.66], [-1, 0.05], [-0.8, 0.62]], A = '', B = '';
  for(var i = 0; i < 3; i++){
    var y = ys[i], dx = dirs[i][0], dy = dirs[i][1];
    var kx = -xb + dx * l * 0.55, ky = y + dy * l * 0.55 - 3, ex = -xb + dx * l, ey = y + dy * l + (i === 0 ? -2 : 4);
    var g = 'M' + f1(-xb) + ',' + f1(y) + ' L' + f1(kx) + ',' + f1(ky) + ' L' + f1(ex) + ',' + f1(ey) + ' ';
    var d = 'M' + f1(xb) + ',' + f1(y) + ' L' + f1(-kx) + ',' + f1(ky) + ' L' + f1(-ex) + ',' + f1(ey) + ' ';
    if(i === 1){ A += d; B += g; } else { A += g; B += d; }
  }
  return '<g class="mjo-pa">' + Tr(A, K, ep || 2.4) + '</g><g class="mjo-pb">' + Tr(B, K, ep || 2.4) + '</g>';
}
var NOIR = '#2a1a20';
var ESPECES = {
  cafard:{bon:false, nom:'cafard', c:'#8a4b2a', goo:'#c9e05a', art:function(c){
    return jambes(7, [-6, 3, 11], 20, 2.2) + Tr('M-3,-20 C-10,-34 -20,-38 -30,-46 M3,-20 C10,-34 20,-38 30,-46', K, 1.7) + Tr('M-3,21 l-4,7 M3,21 l4,7', K, 1.6) +
      El(0, 4, 11, 19, c) + Pa('M-10,-8 C-10,-19 10,-19 10,-8 C6,-5 -6,-5 -10,-8 Z', clair(c, 0.3), 1.8) + Tr('M0,-5 V22', fonce(c, 0.45), 1.4) +
      El(0, -19, 5, 3.5, fonce(c, 0.35), 1.6) + Br('M-6,0 C-7,6 -6,12 -4,16', 1.8, 0.4);
  }},
  chenille:{bon:false, nom:'chenille', c:'#6dbb4a', goo:'#b6f05a', art:function(c){
    var ys = [23, 16, 8, 0, -8, -16], A = '', B = '', s = '';
    ys.forEach(function(y, k){ var x = Math.sin(k * 0.9) * 2, st = 'M' + f1(x - 6) + ',' + y + ' l-4,1 M' + f1(x + 6) + ',' + y + ' l4,1 '; if(k % 2) A += st; else B += st; });
    s += '<g class="mjo-pa">' + Tr(A, K, 2.6) + '</g><g class="mjo-pb">' + Tr(B, K, 2.6) + '</g>';
    ys.forEach(function(y, k){ var x = Math.sin(k * 0.9) * 2; s += Ci(x, y, k === 0 ? 5.5 : 7, k % 2 ? c : clair(c, 0.14), 2) + Ci(x - 2.6, y - 1, 1.3, fonce(c, 0.45), 0) + Ci(x + 2.6, y - 1, 1.3, fonce(c, 0.45), 0); });
    return s + Ci(0, -23, 6.5, fonce(c, 0.25), 2) + Ci(-2.4, -25, 1.4, '#ffffff', 0) + Ci(2.4, -25, 1.4, '#ffffff', 0) + Tr('M-3,-29 l-2,-5 M3,-29 l2,-5', K, 1.6);
  }},
  charancon:{bon:false, nom:'charançon', c:'#7a6a5a', goo:'#e0c45a', art:function(c){
    return jambes(8, [-6, 4, 12], 15, 2.4) + Tr('M-2,-25 L-9,-29 L-11,-37 M2,-25 L9,-29 L11,-37', K, 1.5) + Ci(-11, -38, 2, K, 0) + Ci(11, -38, 2, K, 0) +
      Pa('M-2.5,-12 L-2,-31 C-2,-33 2,-33 2,-31 L2.5,-12 Z', fonce(c, 0.2), 1.8) + El(0, -10, 7, 6, c, 2) +
      Pa('M0,23 C-13,23 -15,8 -11,-2 C-8,-7 8,-7 11,-2 C15,8 13,23 0,23 Z', c) + Tr('M0,-4 V22', fonce(c, 0.4), 1.4) +
      Ci(-6, 4, 1.5, clair(c, 0.5), 0) + Ci(5, 9, 1.5, clair(c, 0.5), 0) + Ci(-4, 14, 1.5, clair(c, 0.5), 0) + Ci(6, 16, 1.3, clair(c, 0.5), 0) + Br('M-8,2 C-9,8 -8,13 -6,17', 1.6, 0.4);
  }},
  mite:{bon:false, nom:'mite des grimoires', c:'#c8b890', goo:'#efe6b0', art:function(c){
    return jambes(5, [-10, -7, -3], 10, 2) +
      Pa('M0,-14 L-18,19 C-11,23 -3,21 0,17 C3,21 11,23 18,19 Z', c) + Tr('M-5,-2 L-12,14 M5,-2 L12,14 M0,-6 V16', fonce(c, 0.28), 1.3) + Ci(-8, 8, 2.2, fonce(c, 0.35), 0) + Ci(8, 8, 2.2, fonce(c, 0.35), 0) +
      El(0, -13, 5, 6, fonce(c, 0.12), 1.8) + Ci(0, -19, 4, fonce(c, 0.2), 1.8) +
      Tr('M-2,-22 C-6,-28 -10,-30 -15,-30 M2,-22 C6,-28 10,-30 15,-30', K, 1.6) + Tr('M-6,-27 l-1,-3.5 M-9,-29 l-1,-3.5 M-12,-30 l0,-3.5 M6,-27 l1,-3.5 M9,-29 l1,-3.5 M12,-30 l0,-3.5', K, 1.2);
  }},
  doryphore:{bon:false, nom:'doryphore', c:'#f2d36b', goo:'#f0a040', art:function(c){
    return jambes(10, [-6, 3, 11], 14, 2.4) + Tr('M-3,-19 C-6,-25 -8,-27 -10,-30 M3,-19 C6,-25 8,-27 10,-30', K, 1.5) +
      El(0, 5, 13.5, 17, c) + Tr('M0,-11 V22', K, 1.6) +
      Tr('M-10,-4 C-11,4 -10,12 -7,18 M-5,-9 C-5,3 -5,12 -3,20 M10,-4 C11,4 10,12 7,18 M5,-9 C5,3 5,12 3,20', NOIR, 2.6) +
      El(0, -12, 9, 5, mel(c, '#f08a3c', 0.55), 2) + Ci(-3, -12, 1.3, NOIR, 0) + Ci(3, -12, 1.3, NOIR, 0) + Ci(0, -14, 1.1, NOIR, 0) +
      El(0, -18, 4.5, 3, fonce(c, 0.4), 1.6) + Br('M-11,0 C-12,-4 -10,-7 -8,-9', 1.6, 0.5);
  }},
  punaise:{bon:false, nom:'punaise', c:'#6a8a3a', goo:'#a8d84a', art:function(c){
    return jambes(9, [-6, 2, 9], 15, 2.3) + Tr('M-2,-20 L-8,-27 L-10,-36 M2,-20 L8,-27 L10,-36', K, 1.5) +
      Pa('M-15,-9 L15,-9 L13,6 L0,23 L-13,6 Z', c) + Pa('M-15,-9 C-13,-16 13,-16 15,-9 Z', clair(c, 0.18), 2) + Pa('M-7,-8 L7,-8 L0,11 Z', fonce(c, 0.2), 1.4) +
      Pa('M-6,14 L0,23 L6,14 Z', fonce(c, 0.35), 1.2) + Pa('M-4,-14 L4,-14 L3,-20 L-3,-20 Z', fonce(c, 0.3), 1.6) + Br('M-12,-6 L-10,4', 1.6, 0.45);
  }},
  coccinelle:{bon:true, nom:'coccinelle', c:'#e5484d', art:function(c){
    return jambes(10, [-4, 4, 11], 11, 2.4) + Tr('M-3,-15 l-4,-6 M3,-15 l4,-6', K, 1.5) +
      Ci(0, 3, 15.5, c) + Tr('M0,-12 V18', K, 1.6) + Ci(-7, -2, 3.4, NOIR, 0) + Ci(7, -2, 3.4, NOIR, 0) + Ci(-8, 9, 3, NOIR, 0) + Ci(8, 9, 3, NOIR, 0) + Ci(-3.5, 14, 2.2, NOIR, 0) + Ci(3.5, 14, 2.2, NOIR, 0) +
      Pa('M-9,-10 C-9,-18 9,-18 9,-10 C5,-8 -5,-8 -9,-10 Z', NOIR, 2) + Ci(-4, -13, 1.8, '#ffffff', 0) + Ci(4, -13, 1.8, '#ffffff', 0) + Br('M-11,-2 C-11,-6 -9,-9 -6,-10', 2, 0.6);
  }},
  abeille:{bon:true, nom:'abeille', c:'#f6c23a', art:function(c){
    return jambes(5, [-8, -3, 2], 10, 2) +
      El(0, 8, 9.5, 14, c) + Tr('M-9,4 H9 M-9.5,10 H9.5 M-7.5,16 H7.5', NOIR, 3) + El(0, 8, 9.5, 14, 'none') + Pa('M-2,21 L0,27 L2,21 Z', NOIR, 1.2) +
      Ci(0, -8, 7.5, mel(c, NOIR, 0.3), 2) + Ci(0, -17, 5.5, NOIR, 1.8) + Ci(-2, -18, 1.2, '#ffffff', 0) + Ci(2, -18, 1.2, '#ffffff', 0) +
      Tr('M-2,-21 C-4,-26 -7,-27 -9,-27 M2,-21 C4,-26 7,-27 9,-27', K, 1.4) +
      El(-11, -5, 10, 5.5, 'rgba(225,245,255,.62)', 1.6, ' transform="rotate(-25 -11 -5)"') + El(11, -5, 10, 5.5, 'rgba(225,245,255,.62)', 1.6, ' transform="rotate(25 11 -5)"');
  }},
  luciole:{bon:true, nom:'luciole', c:'#5a4a3a', art:function(c){
    return Halo(0, 15, 16, 14, '#d8ff6a', 0.55) + jambes(6, [-6, 0, 6], 12, 2) + Tr('M-2,-18 C-6,-26 -9,-28 -12,-30 M2,-18 C6,-26 9,-28 12,-30', K, 1.4) +
      Ci(0, 16, 6.5, '#e8ff9a', 2) + El(0, 1, 7.5, 15, c) + Tr('M0,-10 V14', fonce(c, 0.4), 1.4) + Tr('M-6,0 C-6,8 -5,12 -3,14 M6,0 C6,8 5,12 3,14', clair(c, 0.35), 1.4) +
      El(0, -12, 7, 4.5, '#f08a3c', 1.8) + Ci(0, -12, 1.8, NOIR, 0) + Ci(0, -17, 3.5, fonce(c, 0.3), 1.6);
  }},
  chrysope:{bon:true, nom:'chrysope', c:'#7ed06a', art:function(c){
    var aile = 'rgba(225,255,230,.42)';
    return jambes(4, [-8, -4, 0], 11, 1.8) + Tr('M-1,-17 C-6,-30 -10,-38 -14,-46 M1,-17 C6,-30 10,-38 14,-46', K, 1.1) +
      El(0, 4, 3.8, 17, c, 1.8) + Ci(0, -14, 4.2, c, 1.6) + Ci(-3, -15, 1.9, '#f6d23a', 0.8) + Ci(3, -15, 1.9, '#f6d23a', 0.8) +
      Pa('M-1,-8 C-15,-4 -19,12 -11,26 C-6,26 -2,14 -1,-4 Z', aile, 1.6) + Pa('M1,-8 C15,-4 19,12 11,26 C6,26 2,14 1,-4 Z', aile, 1.6) +
      Tr('M-3,-4 C-10,2 -13,12 -11,22 M-5,4 L-14,8 M-6,12 L-14,16 M-4,18 L-11,22 M3,-4 C10,2 13,12 11,22 M5,4 L14,8 M6,12 L14,16 M4,18 L11,22', '#2a5a3a', 0.9, 0.7);
  }}
};
var LOTS = {
  1:{mauvais:['cafard', 'chenille'], bons:['coccinelle', 'abeille']},
  2:{mauvais:['cafard', 'chenille', 'charancon'], bons:['coccinelle', 'abeille', 'luciole']},
  3:{mauvais:['doryphore', 'charancon', 'mite', 'cafard'], bons:['coccinelle', 'chrysope', 'abeille', 'luciole']},
  4:{mauvais:['doryphore', 'punaise', 'mite', 'charancon'], bons:['coccinelle', 'chrysope', 'luciole', 'abeille']}
};
var TEINTES = ['#e5484d', '#4fbf6a', '#3f7fe0', '#f6d23a'];
function insecteSVG(esp, c){ return '<g class="mjo-ins-c">' + El(2, 5, 13, 19, '#0a0612', 0, ' opacity=".22"') + ESPECES[esp].art(c || ESPECES[esp].c) + '</g>'; }
function blob(n, R, var1){
  var pts = [], i, d;
  for(i = 0; i < n; i++){ var a = i / n * Math.PI * 2 + U.rand(-0.12, 0.12), r = R * U.rand(1 - var1, 1 + var1 * 0.4) * (i % 2 ? 1.16 : 0.84); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  function mid(a, b){ return f1((a[0] + b[0]) / 2) + ',' + f1((a[1] + b[1]) / 2); }
  d = 'M' + mid(pts[n - 1], pts[0]);
  for(i = 0; i < n; i++) d += ' Q' + f1(pts[i][0]) + ',' + f1(pts[i][1]) + ' ' + mid(pts[i], pts[(i + 1) % n]);
  return d + ' Z';
}
function splatSVG(c){
  var d = blob(14, 27, 0.3), s = '<g class="mjo-splat-c">', i;
  for(i = 0; i < 4; i++){ var a = U.rand(0, Math.PI * 2), r = U.rand(26, 36); s += Pa('M' + f1(Math.cos(a) * 18) + ',' + f1(Math.sin(a) * 18) + ' L' + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r), 'none', 0) + Ci(Math.cos(a) * r, Math.sin(a) * r, U.rand(4.5, 7.5), c, 2.2) + Tr('M' + f1(Math.cos(a) * 16) + ',' + f1(Math.sin(a) * 16) + ' L' + f1(Math.cos(a) * (r - 3)) + ',' + f1(Math.sin(a) * (r - 3)), c, 6); }
  s += Pa(d, c, 2.8) + '<path d="' + d + '" fill="' + fonce(c, 0.32) + '" opacity=".3" transform="translate(3,4) scale(.74)"/>' + '<path d="' + blob(9, 12, 0.25) + '" fill="' + clair(c, 0.35) + '" opacity=".55" transform="translate(-4,-5)"/>';
  for(i = 0; i < 6; i++){ var b = U.rand(0, Math.PI * 2), l = U.rand(10, 16); s += Tr('M' + f1(Math.cos(b) * 7) + ',' + f1(Math.sin(b) * 7) + ' l' + f1(Math.cos(b) * l) + ',' + f1(Math.sin(b) * l) + ' l' + f1(Math.cos(b + 0.8) * 4) + ',' + f1(Math.sin(b + 0.8) * 4), K, 2.2, 0.8); }
  for(i = 0; i < 10; i++){ var g = U.rand(0, Math.PI * 2), dd = U.rand(36, 62); s += '<circle class="mjo-goutte" r="' + f1(U.rand(2.4, 5.5)) + '" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" style="--dx:' + f1(Math.cos(g) * dd) + 'px;--dy:' + f1(Math.sin(g) * dd) + 'px"/>'; }
  return s + El(-8, -9, 9, 4.4, '#ffffff', 0, ' opacity=".6" transform="rotate(-30 -8 -9)"') + Ci(8, -11, 2.4, '#ffffff', 0, ' opacity=".65"') + Ci(-12, 6, 1.6, '#ffffff', 0, ' opacity=".5"') + '</g>';
}
/* Le labo vu de face, pour une scène de W × H unités (les insectes s'y promènent partout). */
function decorLabo(i, W, H){
  var G = gU(i), F = Math.round(H * 0.7), rnd = alea(Math.round(W * 3 + H));
  var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#2b2148', 0], ['#3e2f5f', 0.6], ['#4a3868', 1]], 1) + lg(i + 'sol', [['#6b3f24', 0], ['#8a5634', 0.45], ['#5c341d', 1]], 1) +
    rg(i + 'feu', [['#ff9a4a', 0, 0.4], ['#ff7a3c', 1, 0]]) + '</defs>';
  s += '<rect x="-2" y="-2" width="' + (W + 4) + '" height="' + (F + 2) + '" fill="' + G('mur') + '"/>' + briques(0, 14, W, F, 56, 28);
  var fw = Math.min(104, W * 0.26), fh = Math.min(160, F * 0.46), fx = W * 0.52, fy = 26;
  s += fenetreArc(i, G, fx, fy, fw, fh, 'nuit') + rayon('M' + f1(fx - fw / 2) + ',' + f1(fy + fh) + ' L' + f1(fx + fw / 2) + ',' + f1(fy + fh) + ' L' + f1(fx + fw * 0.2) + ',' + F + ' L' + f1(fx - fw * 1.6) + ',' + F + ' Z', '#bff9ff', 0.07);
  s += '<ellipse cx="' + W + '" cy="' + F + '" rx="' + f1(W * 0.6) + '" ry="' + f1(H * 0.55) + '" fill="' + G('feu') + '"/>';
  s += Re(-4, -4, W + 8, 16, 0, G('bS'), 2.4);
  var sw = Math.min(150, W * 0.3), y1 = Math.round(F * 0.4), y2 = Math.round(F * 0.66);
  s += planche(G, 6, 6 + sw, y1) + planche(G, W - 6 - sw, W - 6, y2);
  var deco = [['fiole', '#8ff3ff'], ['livres', '#7a2a3a'], ['bocal', '#ffd36a'], ['fiole', '#ff7f9e'], ['bocal', '#5fdc7a']], x = 22;
  deco.forEach(function(q, k){ if(x < 6 + sw - 16){ s += dessinerObjet({t:q[0], x:x, y:y1, s:0.66, c:q[1], d:true, n:3, v:k, sl:{}}); x += q[0] === 'livres' ? 34 : 26; } });
  x = W - sw + 10;
  [['bocal', '#b48cff'], ['cristal', '#8ff3ff'], ['fiole', '#ffd36a'], ['champignon', '#e5484d'], ['bocal', '#ff9a4a']].forEach(function(q, k){ if(x < W - 20){ s += dessinerObjet({t:q[0], x:x, y:y2, s:0.66, c:q[1], d:true, n:2, v:k, sl:{}}); x += 26; } });
  s += dessinerObjet({t:'herbes', x:W * 0.2, y:12, s:0.7, c:'#4f9a5c', d:true, sl:{}}) + dessinerObjet({t:'herbes', x:W * 0.82, y:12, s:0.7, c:'#8fd27a', d:false, sl:{}});
  /* le plancher */
  s += '<rect x="-2" y="' + F + '" width="' + (W + 4) + '" height="' + (H - F + 2) + '" fill="' + G('sol') + '"/>';
  var pl = '';
  for(var k = -12; k <= 12; k++){ var xa = W / 2 + k * 44, xb = W / 2 + k * 62; pl += 'M' + f1(xa) + ',' + F + ' L' + f1(xb) + ',' + (H + 2) + ' '; }
  for(k = 0; k < 9; k++){ var yj = F + (H - F) * (0.25 + rnd() * 0.7), xj = rnd() * W; pl += 'M' + f1(xj) + ',' + f1(yj) + ' h' + f1(26 + rnd() * 20) + ' '; }
  s += Tr(pl, 'rgba(40,20,10,.45)', 2) + Re(-4, F - 6, W + 8, 8, 0, G('bS'), 2);
  /* l'établi et le chaudron */
  var ex = W * 0.08, ew = Math.min(W * 0.36, 200), ey = F + (H - F) * 0.12;
  s += Re(ex + 10, ey + 6, 9, (H - F) * 0.5, 2, G('bS')) + Re(ex + ew - 19, ey + 6, 9, (H - F) * 0.5, 2, G('bS')) + Re(ex, ey - 4, ew, 12, 3, G('bH')) +
    dessinerObjet({t:'mortier', x:ex + ew * 0.25, y:ey - 4, s:0.7, c:'#8fd27a', d:true, sl:{}}) + dessinerObjet({t:'livres', x:ex + ew * 0.62, y:ey - 4, s:0.7, c:'#3f4f9a', d:true, n:3, v:1, sl:{}}) +
    dessinerObjet({t:'bougie', x:ex + ew * 0.88, y:ey - 4, s:0.62, c:'#f6ecd2', d:true, sl:{}});
  var cx = W * 0.8, cy = F + (H - F) * 0.62;
  s += El(cx, cy + 4, 46, 9, '#1b0e0a', 0, ' opacity=".6"') + dessinerObjet({t:'chaudronMini', x:cx, y:cy, s:1.5, c:'#6fd3a8', d:true, sl:{}});
  /* trous d'où sortent les insectes */
  s += El(W * 0.05, F + (H - F) * 0.5, 13, 8, '#0a0612', 2) + El(W * 0.47, H - 5, 15, 7, '#0a0612', 2) + Tr('M' + f1(W * 0.9) + ',' + f1(F * 0.42) + ' l-6,8 l5,6 l-4,9', '#0a0612', 3) + El(W * 0.9, F * 0.52, 8, 5, '#0a0612', 1.6);
  return s;
}
function trous(W, H){ var F = H * 0.7; return [{x:W * 0.05, y:F + (H - F) * 0.5}, {x:W * 0.47, y:H - 6}, {x:W * 0.9, y:F * 0.52}, {x:W * 0.05 + 4, y:F * 0.3}]; }
function bocalSVG(i, especes, bon){
  var s = '<svg class="mjo-bocal-svg" viewBox="0 0 200 170" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>' + lg(i + 'v', [['#ffffff', 0, 0.45], ['#bff3ff', 0.45, 0.1], ['#ffffff', 1, 0.26]]) + '</defs>' +
    El(100, 165, 86, 5, '#000000', 0, ' opacity=".3"') + Re(8, 30, 184, 132, 30, bon ? 'rgba(120,220,140,.16)' : 'rgba(240,90,90,.16)', 0) +
    '<g class="mjo-bocal-especes">';
  var pos = especes.length <= 2 ? [[58, 104, -20, 1.25], [142, 102, 25, 1.25]] : [[56, 74, -20, 1], [144, 72, 25, 1], [58, 132, 160, 1], [142, 134, -150, 1]];
  especes.forEach(function(e, k){ var q = pos[k % pos.length]; s += '<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ') scale(' + q[3] + ')">' + ESPECES[e].art(ESPECES[e].c) + '</g>'; });
  s += '</g><g class="mjo-bocal-dedans"></g>' + Re(8, 30, 184, 132, 30, 'url(#' + i + 'v)', 3) + Re(30, 18, 140, 15, 6, '#c98450', 3) + Re(22, 5, 156, 16, 6, '#e0a060', 3) +
    Br('M22,50 V144', 3.4, 0.45) + Br('M180,58 V86', 2.4, 0.3) + '</svg>';
  return s;
}
function reglagesInsectes(n, mods){
  mods = mods || {};
  var p = {};
  p.mauvais = entier(n, {1:6, 3:8, 6:11, 10:14});
  p.ecran = entier(n, {1:3, 3:4, 6:6, 10:8});
  p.bons = entier(n, {1:2, 3:3, 6:4, 10:6});
  p.vitesse = courbe(n, {1:24, 3:32, 6:44, 10:60, 12:68}) * (mods.lent || 1);
  p.duree = Math.round(courbe(n, {1:80, 3:75, 6:70, 10:65}) + (mods.temps || 0) + (mods.lent && mods.lent < 1 ? 5 : 0));
  p.vies = Math.max(1, entier(n, {1:5, 3:4, 6:3, 10:2}) + Math.round(mods.erreurs || 0));
  p.erreurs = p.vies - 1;
  p.ressemblance = n <= 2 ? 1 : (n <= 5 ? 2 : (n <= 8 ? 3 : 4));
  p.teintes = courbe(n, {1:0.1, 3:0.25, 6:0.45, 10:0.6});
  p.pauses = courbe(n, {1:0.5, 10:0.25});
  p.ranger = n >= 7;
  p.zone = mods.zone || 1;
  p.indices = Math.max(0, Math.round(mods.aide || 0));
  p.revele = !!mods.revele;
  var v = p.vitesse;
  p.lignes = [
    {nom:'Mauvais insectes à écraser', val:String(p.mauvais)},
    {nom:'Gentils insectes', val:p.bons + ' (ne pas écraser !)'},
    {nom:'Ils courent', val:v < 28 ? 'tout doucement 🐌' : (v < 38 ? 'doucement' : (v < 52 ? 'vite' : 'très vite 💨'))},
    {nom:'Ils se ressemblent', val:['pas du tout', 'un peu', 'beaucoup', 'énormément'][p.ressemblance - 1]},
    {nom:'Couleurs trompeuses', val:p.teintes < 0.2 ? 'quelques-unes' : (p.teintes < 0.4 ? 'pas mal' : 'beaucoup 🎨')},
    {nom:'Le sablier', val:txtDuree(p.duree)},
    {nom:'Tes cœurs', val:p.vies + ' ❤️'},
    {nom:'Ranger les gentils dans le bocal vert', val:p.ranger ? 'obligatoire' : 'en bonus ⭐'}
  ];
  if(p.zone > 1) p.lignes.push({nom:'Insectes', val:'plus faciles à toucher'});
  if(p.indices) p.lignes.push({nom:'Indices 💡', val:String(p.indices)});
  if(p.revele) p.lignes.push({nom:'Les mauvais ont un rond rouge', val:'oui'});
  return p;
}

MJ.enregistrer('insectes', {
  nom:'Le grand ménage du labo', role:'alchimiste', ic:'🪲',
  consigne:function(p){
    return 'Écrase les mauvais insectes (bocal rouge) mais pas les gentils (bocal vert) ! Regarde bien leur FORME : leur couleur peut tromper.' +
      (p && p.ranger ? ' Glisse les gentils dans le bocal vert.' : ' Bonus : glisse les gentils dans le bocal vert.') + (p && p.ensuite === 'differences' ? ' Ensuite : les différences de l\'étagère du labo !' : '');
  },
  minuteur:true,
  reglages: reglagesInsectes,
  especes: ESPECES,
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#3e2f5f"/><rect y="118" width="300" height="52" fill="#8a5634"/>');
    function bocalMini(x, esp, bon){
      return '<g transform="translate(' + (x - 4) + ',70) scale(.3)">' + bocalSVG(nid('dj'), [esp], bon).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</g>' +
        Re(x + 3, 100, 48, 14, 4, bon ? '#2f9e44' : '#c0392b', 1.6) + '<text x="' + (x + 27) + '" y="111" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">' + (bon ? '✔' : '☠') + '</text>';
    }
    var j1 = bocalMini(192, 'cafard', false), j2 = bocalMini(244, 'coccinelle', true);
    d.contenu.innerHTML = j1 + j2 + '<g class="mjo-demo-splat" opacity="0" transform="translate(60,112)">' + splatSVG('#c9e05a') + '</g>' +
      '<g class="mjo-demo-caf" transform="translate(60,112) rotate(70) scale(.8)">' + insecteSVG('cafard') + '</g>' +
      '<g transform="translate(140,134)"><g class="mjo-demo-cocci" style="transition:transform .8s cubic-bezier(.4,.1,.3,1)"><g transform="rotate(-60) scale(.8)">' + insecteSVG('coccinelle') + '</g></g></g>';
    var caf = d.contenu.querySelector('.mjo-demo-caf'), spl = d.contenu.querySelector('.mjo-demo-splat'), co = d.contenu.querySelector('.mjo-demo-cocci');
    return scenario(d.svg, [
      [10, function(){ caf.setAttribute('opacity', '1'); spl.setAttribute('opacity', '0'); co.style.transition = 'none'; co.style.transform = ''; co.setAttribute('opacity', '1'); d.vers(150, 160, 0); }],
      [400, function(){ co.style.transition = 'transform .8s cubic-bezier(.4,.1,.3,1)'; d.vers(64, 118, 700); }],
      [800, function(){ d.tape(); caf.setAttribute('opacity', '0'); spl.setAttribute('opacity', '1'); relancer(spl.querySelector('.mjo-splat-c'), 'pop'); }],
      [700, function(){ d.vers(144, 140, 600); }],
      [700, function(){ co.style.transform = 'translate(131px,-30px) scale(.7)'; d.vers(276, 110, 800); }],
      [900, function(){ co.setAttribute('opacity', '0'); U.son('ok'); }],
      [600, function(){}]
    ], 700);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var n = p.niveauEffectif || 3, lot = LOTS[p.ressemblance || 2], zone = p.zone || 1;
    var id = nid('mjoi');
    var racine = U.html('<div class="mjo-jeu mjo-insectes"></div>');
    el.appendChild(racine);
    var hud = creerHud(racine);
    var totalM = p.mauvais || 8, totalB = p.bons || 3, vies = p.vies || 3, viesMax = vies;
    var tues = 0, ranges = 0, erreurs = 0, sortis = 0, restant = p.duree || 70, fini = false, indices = p.indices || 0, annonceRanger = false;
    hud.vies(vies, viesMax); hud.prog(0, totalM, '💥', 9); hud.temps(1);
    var aire = U.html('<div class="mjo-in-aire">' +
      '<div class="mjo-in-scene"><svg class="mjo-in-svg" preserveAspectRatio="none"><g class="mjo-in-decor"></g><g class="mjo-in-taches"></g><g class="mjo-in-bestioles"></g><g class="mjo-in-fx"></g></svg></div>' +
      '<div class="mjo-bocaux">' +
        '<div class="mjo-bocal mauvais">' + bocalSVG(id + 'm', lot.mauvais, false) + '<div class="mjo-etiquette"><b>☠</b> Mauvais insectes</div></div>' +
        '<div class="mjo-bocal bons">' + bocalSVG(id + 'b', lot.bons, true) + '<div class="mjo-etiquette"><b>✔</b> Bons insectes</div><span class="mjo-compte">0/' + totalB + '</span></div>' +
      '</div></div>');
    racine.appendChild(aire);
    var bas = null;
    if(indices){ bas = U.html('<div class="mjo-bas"><button class="btn magie mjo-indice" type="button">💡 × ' + indices + '</button></div>'); racine.appendChild(bas); }
    var scene = aire.querySelector('.mjo-in-scene'), svg = aire.querySelector('svg'), gDecor = svg.querySelector('.mjo-in-decor'), gTaches = svg.querySelector('.mjo-in-taches'), gBest = svg.querySelector('.mjo-in-bestioles'), gFx = svg.querySelector('.mjo-in-fx');
    var jarBon = aire.querySelector('.mjo-bocal.bons'), jarMal = aire.querySelector('.mjo-bocal.mauvais'), compte = jarBon.querySelector('.mjo-compte'), dedansBon = jarBon.querySelector('.mjo-bocal-dedans');
    var W = 400, H = 500, kpx = 1, bestioles = [], seq = 0;
    function disposer(){
      var r0 = aire.getBoundingClientRect();
      aire.classList.toggle('large', r0.width > r0.height * 1.05);
      var r = scene.getBoundingClientRect();
      if(!r.width || !r.height) return;
      kpx = fixe(Math.min(r.width, r.height * 1.2) / 400, 0.9, 1.4);
      var W2 = r.width / kpx, H2 = r.height / kpx;
      if(Math.abs(W2 - W) < 1 && Math.abs(H2 - H) < 1 && gDecor.firstChild) return;
      W = W2; H = H2;
      svg.setAttribute('viewBox', '0 0 ' + f1(W) + ' ' + f1(H));
      gDecor.innerHTML = decorLabo(id + 'd' + (seq++), W, H);
      bestioles.forEach(function(b){ b.x = fixe(b.x, 12, W - 12); b.y = fixe(b.y, 12, H - 12); });
    }
    disposer();
    P.observe(aire, disposer);
    function teinte(){ return Math.random() < (p.teintes || 0) ? U.choix(TEINTES) : null; }
    function creerBestiole(esp, bon, x, y, a, sortie){
      var t = teinte(), b = {id:++seq, esp:esp, bon:bon, x:x, y:y, a:a, v:(p.vitesse || 30) * U.rand(0.8, 1.2), vire:0, etat:sortie ? 'apparait' : 'marche', tEtat:sortie ? 0.5 : U.rand(0.5, 2.5), teinte:t, arret:false};
      b.el = svgNoeud('g', {'class':'mjo-ins' + (bon ? ' bon' : ' mauvais') + (sortie ? ' sort' : '')}, gBest);
      b.el.innerHTML = (p.revele && !bon ? '<circle class="mjo-revele" r="27"/>' : '') + insecteSVG(esp, t);
      bestioles.push(b); dessiner(b);
      return b;
    }
    function placeLibreIns(){
      for(var k = 0; k < 40; k++){
        var x = U.rand(30, W - 30), y = U.rand(30, H - 30);
        if(bestioles.every(function(b){ return Math.hypot(b.x - x, b.y - y) > 70; })) return {x:x, y:y};
      }
      return {x:U.rand(30, W - 30), y:U.rand(30, H - 30)};
    }
    for(var k = 0; k < totalB; k++){ var q = placeLibreIns(); creerBestiole(lot.bons[k % lot.bons.length], true, q.x, q.y, U.rand(0, 6.28), false); }
    var debut = Math.min(p.ecran || 4, totalM);
    for(k = 0; k < debut; k++){ q = placeLibreIns(); creerBestiole(U.choix(lot.mauvais), false, q.x, q.y, U.rand(0, 6.28), false); sortis++; }
    var tSortie = 1.5;
    function sortir(){
      var h = U.choix(trous(W, H)), a = Math.atan2(W / 2 - h.x, -(H / 2 - h.y));
      creerBestiole(U.choix(lot.mauvais), false, h.x, h.y, a, true); sortis++;
    }
    function dessiner(b){
      b.el.setAttribute('transform', 'translate(' + f1(b.x) + ',' + f1(b.y) + ') rotate(' + f1(b.a * 57.2958) + ')');
      var arret = b.etat === 'pause' || b.etat === 'etourdi';
      if(arret !== b.arret){ b.arret = arret; b.el.classList.toggle('arret', arret); }
    }
    function bouger(b, dt){
      if(b.etat === 'mort' || b.etat === 'traine' || b.etat === 'bocal') return;
      b.tEtat -= dt;
      if(b.etat === 'apparait'){ if(b.tEtat <= 0){ b.etat = 'marche'; b.tEtat = U.rand(1, 2.5); b.el.classList.remove('sort'); } }
      else if(b.etat === 'pause' || b.etat === 'etourdi'){
        if(b.tEtat <= 0){ b.etat = b.etat === 'etourdi' ? 'fuite' : 'marche'; b.tEtat = U.rand(1.2, 3); b.a += U.rand(-1.6, 1.6); }
        return;
      }
      var marge = 34, cx = W / 2 - b.x, cy = H / 2 - b.y;
      if(b.x < marge || b.x > W - marge || b.y < marge || b.y > H - marge){
        var voulu = Math.atan2(cx, -cy), dA = voulu - b.a;
        while(dA > Math.PI) dA -= 2 * Math.PI; while(dA < -Math.PI) dA += 2 * Math.PI;
        b.a += fixe(dA, -4 * dt, 4 * dt);
      } else {
        b.vire = fixe(b.vire + U.rand(-1, 1) * dt * 7, -2.4, 2.4);
        b.a += b.vire * dt;
      }
      var v = b.v * (b.etat === 'fuite' ? 2.2 : (b.etat === 'apparait' ? 0.6 : 1));
      b.x = fixe(b.x + Math.sin(b.a) * v * dt, 8, W - 8); b.y = fixe(b.y - Math.cos(b.a) * v * dt, 8, H - 8);
      if(b.tEtat <= 0){
        if(b.etat === 'fuite'){ b.etat = 'marche'; b.tEtat = U.rand(1, 2.5); }
        else if(Math.random() < (p.pauses || 0.35)){ b.etat = 'pause'; b.tEtat = U.rand(0.35, 1.3); }
        else { b.tEtat = U.rand(0.8, 2.6); b.vire = U.rand(-2, 2); }
      }
    }
    function pctScene(x, y){ var e = versEcran(svg, x, y), r = racine.getBoundingClientRect(); return {x:(e.x - r.left) / r.width * 100, y:(e.y - r.top) / r.height * 100}; }
    function ecraser(b){
      b.etat = 'mort'; tues++;
      P.sons.ecrase(); U.vibrer(22);
      var goo = b.teinte ? mel(b.teinte, '#ffffff', 0.15) : ESPECES[b.esp].goo;
      var sp = svgNoeud('g', {'class':'mjo-splat', transform:'translate(' + f1(b.x) + ',' + f1(b.y) + ') rotate(' + f1(U.rand(0, 360)) + ') scale(' + e2(U.rand(1, 1.25)) + ')'}, gTaches);
      sp.innerHTML = splatSVG(goo);
      b.el.classList.add('ecrase');
      P.apres(300, function(){ retirer(b.el); });
      P.apres(2200, function(){ sp.classList.add('sec'); });
      var taches = gTaches.querySelectorAll('.mjo-splat'); if(taches.length > 16) retirer(taches[0]);
      var q2 = pctScene(b.x, b.y); flotter(racine, q2.x, q2.y - 6, U.choix(['SPLAT !', 'SPLOTCH !', 'Beurk !', 'Pof !', 'SCHPLOUF !']), 'splat');
      hud.prog(tues, totalM, '💥', 9);
      verifier();
    }
    function erreurGentil(b){
      erreurs++; vies--;
      hud.perdVie(vies, viesMax);
      P.sons.ohNon(); U.vibrer(60);
      b.etat = 'etourdi'; b.tEtat = 0.9;
      relancer(b.el, 'aie');
      var et = svgNoeud('g', {'class':'mjo-etoiles'}, b.el); et.innerHTML = etincelle(-14, -26, 6, '#ffe36a') + etincelle(14, -24, 5, '#ffffff') + etincelle(0, -32, 4, '#ffe36a');
      P.apres(1000, function(){ retirer(et); });
      var q2 = pctScene(b.x, b.y); flotter(racine, q2.x, q2.y - 6, 'Oh non !', 'ko');
      relancer(jarBon, 'montre');
      if(vies <= 0){ fini = true; perdre('Oh non… trop de gentils insectes touchés.'); }
    }
    function verifier(){
      if(fini || tues < totalM) return;
      var libres = bestioles.filter(function(b){ return b.bon && b.etat !== 'bocal'; }).length;
      if(p.ranger && libres > 0){
        if(!annonceRanger){ annonceRanger = true; annonce(racine, 'Range les gentils ! ✔', 1600); relancer(jarBon, 'montre'); }
        return;
      }
      gagner();
    }
    function perdre(txt){
      fini = true;
      bestioles.forEach(function(b){ if(!b.bon && b.etat !== 'mort') b.el.classList.add('montre'); });
      P.finir({reussi:false, score:tues / totalM, erreurs:erreurs, detail:txt}, 1600);
    }
    function gagner(){
      fini = true;
      var resIns = {reussi:true, score:1, erreurs:erreurs, bonus:ranges, detail:'Les ' + totalM + ' mauvais insectes sont écrasés' + (ranges ? ' et ' + ranges + ' gentil' + (ranges > 1 ? 's' : '') + ' rangé' + (ranges > 1 ? 's' : '') + ' dans le bocal ⭐' : '') + ' !'};
      annonce(racine, 'Le labo est tout propre ! ✨', 1500);
      P.sons.pop();
      if(p.ensuite === 'differences') P.apres(1100, function(){ enchainer(resIns); });
      else P.finir(resIns, 1500);
    }
    function enchainer(resIns){
      var pd = MJ.reglages('differences', p.niveau || n, Object.assign({}, p.mods || {}));
      pd.theme = 'labo'; pd._theme = 'labo';
      if(p.ingredient) pd.ingredient = p.ingredient;
      var voile = U.html('<div class="mjo-transition"><div class="mjo-trans-txt"><span>✨🔎✨</span><b>Le labo est propre !</b><i>Maintenant : trouve les ' + pd.differences + ' différences de l\'étagère</i></div></div>');
      el.appendChild(voile);
      P.apres(1400, function(){
        retirer(racine);
        partieDiff(el, pd, P, function(resD){
          var res = {reussi:!!resD.reussi, score:(1 + (resD.score || 0)) / 2, erreurs:resIns.erreurs + (resD.erreurs || 0),
            detail:'Labo nettoyé, puis : ' + resD.detail, etapes:{insectes:resIns, differences:resD}};
          if(resD.message) res.message = resD.message;
          P.finir(res, resD.reussi ? 1100 : 1600);
        });
        P.apres(1500, function(){ retirer(voile); });
      });
    }
    /* ---------- Toucher, glisser ---------- */
    var prise = null, fantome = null;
    function sous(pt){
      var best = null, bd = 28 * zone;
      bestioles.forEach(function(b){ if(b.etat === 'mort' || b.etat === 'bocal' || b.etat === 'traine') return; var d = Math.hypot(b.x - pt.x, b.y - pt.y); if(d < bd){ bd = d; best = b; } });
      return best;
    }
    function dans(el2, e){ var r = el2.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    function poserFantome(e){
      var r = racine.getBoundingClientRect();
      fantome.style.transform = 'translate(' + f1(e.clientX - r.left) + 'px,' + f1(e.clientY - r.top) + 'px)';
    }
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini || prise) return;
      e.preventDefault();
      var pt = ptSVG(svg, e), b = sous(pt);
      if(!b) return;
      if(!b.bon){ ecraser(b); return; }
      prise = {b:b, x:e.clientX, y:e.clientY, id:e.pointerId, glisse:false};
      try{ svg.setPointerCapture(e.pointerId); }catch(er){}
    });
    P.ecoute(svg, 'pointermove', function(e){
      if(!prise || e.pointerId !== prise.id || fini) return;
      if(!prise.glisse && Math.hypot(e.clientX - prise.x, e.clientY - prise.y) > 10){
        prise.glisse = true; var b = prise.b;
        b.etatAvant = b.etat; b.etat = 'traine'; b.el.classList.add('cache');
        fantome = U.html('<div class="mjo-fantome"><svg viewBox="-34 -34 68 68" style="width:' + Math.round(68 * kpx * 1.15) + 'px;height:' + Math.round(68 * kpx * 1.15) + 'px">' + insecteSVG(b.esp, b.teinte) + '</svg></div>');
        racine.appendChild(fantome);
        P.sons.pop();
      }
      if(prise.glisse){
        poserFantome(e);
        jarBon.classList.toggle('vise', dans(jarBon, e)); jarMal.classList.toggle('vise', dans(jarMal, e));
      }
    });
    function lacher(e){
      if(!prise || e.pointerId !== prise.id) return;
      var pr = prise; prise = null;
      try{ svg.releasePointerCapture(e.pointerId); }catch(er){}
      jarBon.classList.remove('vise'); jarMal.classList.remove('vise');
      var b = pr.b;
      if(!pr.glisse){ if(!fini) erreurGentil(b); return; }
      retirer(fantome); fantome = null;
      if(fini){ b.etat = 'marche'; b.el.classList.remove('cache'); return; }
      if(dans(jarBon, e)){
        b.etat = 'bocal'; retirer(b.el); ranges++;
        P.sons.bocal(); U.vibrer(15);
        var g = svgNoeud('g', {transform:'translate(' + f1(U.rand(36, 164)) + ',' + f1(U.rand(112, 146)) + ') rotate(' + f1(U.rand(0, 360)) + ') scale(.55)', 'class':'mjo-range'}, dedansBon);
        g.innerHTML = ESPECES[b.esp].art(b.teinte || ESPECES[b.esp].c);
        compte.textContent = ranges + '/' + totalB; relancer(jarBon, 'gagne');
        var r = jarBon.getBoundingClientRect(), rr = racine.getBoundingClientRect();
        flotter(racine, (r.left + r.width / 2 - rr.left) / rr.width * 100, (r.top + r.height * 0.3 - rr.top) / rr.height * 100, '+1 ⭐', 'ok');
        verifier();
        return;
      }
      if(dans(jarMal, e)) flotter(racine, 50, 40, 'Pas ce bocal !', 'ko');
      var pt = ptSVG(svg, e);
      if(pt.x > 8 && pt.x < W - 8 && pt.y > 8 && pt.y < H - 8){ b.x = pt.x; b.y = pt.y; }
      b.etat = 'pause'; b.tEtat = 0.5; b.el.classList.remove('cache'); dessiner(b);
    }
    P.ecoute(svg, 'pointerup', lacher);
    P.ecoute(svg, 'pointercancel', function(e){ if(prise && e.pointerId === prise.id){ var b = prise.b; prise = null; retirer(fantome); fantome = null; if(b.etat === 'traine'){ b.etat = 'marche'; b.el.classList.remove('cache'); } } });
    var bi = bas && bas.querySelector('.mjo-indice');
    if(bi) P.ecoute(bi, 'click', function(){
      if(fini || indices <= 0) return;
      var m = bestioles.filter(function(b){ return !b.bon && b.etat !== 'mort'; });
      if(!m.length) return;
      indices--; bi.textContent = '💡 × ' + indices; if(!indices) bi.disabled = true;
      P.sons.pop();
      var b = U.choix(m), c = svgNoeud('circle', {'class':'mjo-indice-ins', r:'30'}, b.el);
      b.el.insertBefore(c, b.el.firstChild);
      P.apres(3200, function(){ retirer(c); });
    });
    racine.mjoEtat = function(){
      return {jeu:'insectes', tues:tues, totalMauvais:totalM, ranges:ranges, totalBons:totalB, vies:vies, restant:restant, ranger:!!p.ranger, ensuite:p.ensuite || null,
        bocalBon:(function(){ var r = jarBon.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height * 0.6}; })(),
        insectes:bestioles.filter(function(b){ return b.etat !== 'mort' && b.etat !== 'bocal'; }).map(function(b){ var e = versEcran(svg, b.x, b.y); return {id:b.id, esp:b.esp, bon:b.bon, teinte:b.teinte, etat:b.etat, x:e.x, y:e.y}; })};
    };
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / (p.duree || 70));
      tSortie -= dt;
      var vivantsM = bestioles.filter(function(b){ return !b.bon && b.etat !== 'mort'; }).length;
      if(tSortie <= 0 && sortis < totalM && vivantsM < (p.ecran || 4)){ sortir(); tSortie = U.rand(0.8, 1.8); }
      for(var i = 0; i < bestioles.length; i++){ var b = bestioles[i]; if(b.etat === 'mort' || b.etat === 'bocal') continue; bouger(b, dt); if(b.etat !== 'traine') dessiner(b); }
      if(bestioles.length > 40) bestioles = bestioles.filter(function(b){ return b.etat !== 'mort'; });
      if(restant <= 0){ perdre(tues >= totalM ? 'Le sablier est vide… les gentils ne sont pas tous rangés.' : 'Le sablier est vide… il reste ' + (totalM - tues) + ' mauvais insecte' + (totalM - tues > 1 ? 's' : '') + '.'); return false; }
    });
    return {arreter: function(){ P.arreter(); retirer(fantome); }};
  }
});

})();
