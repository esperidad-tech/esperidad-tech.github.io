
/* ==========================================================
   UNE SEULE PERSPECTIVE pour toute la pièce et tout ce qui s'y trouve (Romain : « il faut suivre la perspective de la pièce »).
   Le monde en 3D : X le long du mur du fond (de gauche à droite), Y la hauteur au-dessus du plancher, Z la distance au mur du fond
   (vers nous). L'œil est loin devant la pièce et au-dessus de tout : on voit le dessus des meubles, des pots, des bocaux.
   Projection (point de fuite (VPX, VPY), mur du fond à Z = 0, son bas à l'écran en y = SOL_Y) :
     s = D_OEIL / (D_OEIL - Z) ;  écran = (VPX + (X - VPX)·s , VPY + (SOL_Y - Y - VPY)·s)
   Le mur du fond est donc vu de face ; les lignes du plancher et des murs de côté vont toutes vers le point de fuite.
   Un objet a son repère : son origine (le milieu du bas de sa face avant), ses axes (de face, ou tourné contre un mur de côté).
   Il se dessine en unités « locales » (1 unité = 1/S_REF unité du monde) avec de petites formes 3D : boîtes, cylindres, disques,
   et ses décorations collées sur une face (une transformation affine les pose sur la face, même de biais).
   ========================================================== */
var VPX = 600, VPY = -300, SOL_Y = 520;
var PROF = 900;                                              /* l'avant du cœur de la pièce (à l'écran : y 860) */
var D_OEIL = PROF / (1 - (SOL_Y - VPY) / (860 - VPY));       /* la distance de l'œil au mur du fond */
var S_REF = 1.22;                                            /* au milieu du plancher, un objet est dessiné à sa taille */
var OEIL = [VPX, SOL_Y - VPY, D_OEIL];                       /* l'œil, dans le monde */
function sZ(Z){ return D_OEIL / (D_OEIL - Z); }
function zS(s){ return D_OEIL * (1 - 1 / s); }
function proj(X, Y, Z){ var s = sZ(Z); return [VPX + (X - VPX) * s, VPY + (SOL_Y - Y - VPY) * s]; }
/* Un point de l'écran sur le plancher, sur le mur du fond, sur un mur de côté (plan X = xm) */
function surSol(x, y){ var s = (y - VPY) / (SOL_Y - VPY); return {X:VPX + (x - VPX) / s, Z:zS(s), s:s}; }
function surCote(x, y, xm){ var s = (x - VPX) / (xm - VPX); s = Math.max(1, s); return {Z:zS(s), Y:SOL_Y - VPY - (y - VPY) / s, s:s}; }
function echelleProf(Z){ return sZ(Z) / S_REF; }
function echelleSol(y){ return (y - VPY) / (SOL_Y - VPY) / S_REF; }

/* ---------- Le repère d'un objet ----------
   o : origine (monde) ; ax : [ex, ey, ez] (monde par unité locale) ; w, h : sa boîte locale (l'origine est en (w/2, h)) */
var AXES_FACE = [[1 / S_REF, 0, 0], [0, -1 / S_REF, 0], [0, 0, -1 / S_REF]];
var AXES_G = [[0, 0, -1 / S_REF], [0, -1 / S_REF, 0], [-1 / S_REF, 0, 0]];   /* contre le mur de gauche : il regarde vers la droite */
var AXES_D = [[0, 0, 1 / S_REF], [0, -1 / S_REF, 0], [1 / S_REF, 0, 0]];     /* contre le mur de droite : il regarde vers la gauche */
function axesDe(cote){ return cote === 'g' ? AXES_G : cote === 'd' ? AXES_D : AXES_FACE; }
function repere(o, ax, w, h){
  var a = proj(o[0], o[1], o[2]);
  return {o:o, ax:ax, w:w, h:h, A:a, k:echelleProf(o[2])};
}
function mondeDe(R, x, y, z){
  var dx = x - R.w / 2, dy = y - R.h, ax = R.ax;
  return [R.o[0] + dx * ax[0][0] + dy * ax[1][0] + z * ax[2][0], R.o[1] + dx * ax[0][1] + dy * ax[1][1] + z * ax[2][1], R.o[2] + dx * ax[0][2] + dy * ax[1][2] + z * ax[2][2]];
}

/* ---------- Le contexte de dessin : les points 3D locaux deviennent des points du SVG ----------
   sortie : 'local' (le SVG de l'objet, de taille w × h à l'échelle k) ou 'monde' (le fond de la pièce, en unités du monde) */
function ctx3d(R, monde){
  var c = {R:R, bb:[1e9, 1e9, -1e9, -1e9]};
  c.Q = function(x, y, z){
    var W = mondeDe(R, x, y, z || 0), p = proj(W[0], W[1], W[2]), u, v;
    if(monde){ u = p[0]; v = p[1]; }
    else { u = R.w / 2 + (p[0] - R.A[0]) / R.k; v = R.h + (p[1] - R.A[1]) / R.k; }
    if(u < c.bb[0]) c.bb[0] = u; if(v < c.bb[1]) c.bb[1] = v; if(u > c.bb[2]) c.bb[2] = u; if(v > c.bb[3]) c.bb[3] = v;
    return [u, v];
  };
  c.pt = function(x, y, z){ var q = c.Q(x, y, z); return f1(q[0]) + ',' + f1(q[1]); };
  /* une face est-elle tournée vers l'œil ? (n : normale locale [nx, ny, nz] ; p : un point de la face) */
  c.voit = function(n, p){
    var ax = R.ax, nw = [n[0] * ax[0][0] + n[1] * ax[1][0] + n[2] * ax[2][0], n[0] * ax[0][1] + n[1] * ax[1][1] + n[2] * ax[2][1], n[0] * ax[0][2] + n[1] * ax[1][2] + n[2] * ax[2][2]];
    var W = mondeDe(R, p[0], p[1], p[2]);
    return (OEIL[0] - W[0]) * nw[0] + (OEIL[1] - W[1]) * nw[1] + (OEIL[2] - W[2]) * nw[2] > 0;
  };
  c.dist = function(p){ var W = mondeDe(R, p[0], p[1], p[2]); return Math.hypot(OEIL[0] - W[0], OEIL[1] - W[1], OEIL[2] - W[2]); };
  /* un polygone de points 3D locaux */
  c.poly = function(pts, f, xx){ return P('M' + pts.map(function(q){ return c.pt(q[0], q[1], q[2]); }).join(' L') + ' Z', f, xx); };
  c.ligne = function(pts, col, w, xx){ return T('M' + pts.map(function(q){ return c.pt(q[0], q[1], q[2]); }).join(' L'), col, w, xx); };
  /* une boîte : x0..x1 (largeur), y0..y1 (y0 en haut), z0..z1 (z0 devant) ; f : {face, dessus, cote, arriere} (couleurs) ; deco : {face, dessus} (SVG en plus) */
  c.boite = function(x0, y0, x1, y1, z0, z1, f, xx){
    var faces = [
      {n:[0, 0, -1], p:[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], f:f.face},
      {n:[0, -1, 0], p:[[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], f:f.dessus || f.face},
      {n:[-1, 0, 0], p:[[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], f:f.cote || f.face},
      {n:[1, 0, 0], p:[[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], f:f.cote || f.face}
    ];
    var vus = faces.filter(function(F){ var m = F.p[0], q = F.p[2]; return F.f && c.voit(F.n, [(m[0] + q[0]) / 2, (m[1] + q[1]) / 2, (m[2] + q[2]) / 2]); });
    vus.sort(function(a, b){ return c.dist(b.p[2]) + c.dist(b.p[0]) - c.dist(a.p[2]) - c.dist(a.p[0]); });
    return vus.map(function(F){ return c.poly(F.p, F.f, xx); }).join('');
  };
  /* des points sur un cercle horizontal (centre cx, cz ; hauteur y) */
  c.cercle = function(cx, cz, r, y, n){
    var l = [];
    n = n || 28;
    for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2; l.push(c.Q(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r)); }
    return l;
  };
  /* un disque horizontal (le dessus d'un pot, un tapis rond, l'eau du chaudron) */
  c.disque = function(cx, cz, r, y, f, xx, rz){
    var l = [];
    for(var i = 0; i < 32; i++){ var a = i / 32 * Math.PI * 2; l.push(c.Q(cx + Math.cos(a) * r, y, cz + Math.sin(a) * (rz || r))); }
    return P(lisse(l, true), f, xx);
  };
  /* un cylindre debout : son corps (l'enveloppe des deux cercles) puis son dessus */
  c.cylindre = function(cx, cz, r, yh, yb, f, fh, xx, rb){
    var h = c.cercle(cx, cz, r, yh), b = c.cercle(cx, cz, rb === undefined ? r : rb, yb), env = enveloppe(h.concat(b));
    return P(lisse(env, true, 0.5), f, xx) + (fh === null ? '' : P(lisse(h, true), fh || f, xx));
  };
  /* un SVG dessiné sur la face avant (z) : de face, il ne bouge pas ; de biais, une transformation affine le pose sur la face */
  c.sur = function(svg, z, cx, cy){
    z = z || 0;
    var x = cx === undefined ? R.w / 2 : cx, y = cy === undefined ? R.h / 2 : cy;
    var o = c.Q(x, y, z), ax = c.Q(x + 10, y, z), ay = c.Q(x, y + 10, z);
    var a = (ax[0] - o[0]) / 10, b = (ax[1] - o[1]) / 10, cc = (ay[0] - o[0]) / 10, d = (ay[1] - o[1]) / 10;
    if(Math.abs(a - 1) < 1e-3 && Math.abs(b) < 1e-3 && Math.abs(cc) < 1e-3 && Math.abs(d - 1) < 1e-3 && Math.abs(o[0] - x) < 0.05 && Math.abs(o[1] - y) < 0.05) return svg;
    var e = o[0] - (a * x + cc * y), ff = o[1] - (b * x + d * y);
    return '<g transform="matrix(' + [a, b, cc, d, e, ff].map(function(v){ return v.toFixed(4); }).join(',') + ')">' + svg + '</g>';
  };
  /* la pente d'une face (pour savoir si on la voit beaucoup, un peu…) : de face = 1 */
  c.largeurFace = function(){ var p = c.Q(0, R.h, 0), q = c.Q(R.w, R.h, 0); return Math.abs(q[0] - p[0]) / R.w; };
  return c;
}
/* Une courbe douce qui passe par des points (Catmull-Rom → Bézier) */
function lisse(l, ferme, t){
  t = t === undefined ? 1 : t;
  var n = l.length;
  if(n < 3) return 'M' + l.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L');
  var s = 'M' + f1(l[0][0]) + ',' + f1(l[0][1]);
  var fin = ferme ? n : n - 1;
  for(var i = 0; i < fin; i++){
    var p0 = l[(i - 1 + n) % n], p1 = l[i], p2 = l[(i + 1) % n], p3 = l[(i + 2) % n];
    if(!ferme){ if(i === 0) p0 = p1; if(i + 2 >= n) p3 = p2; }
    s += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6 * t) + ',' + f1(p1[1] + (p2[1] - p0[1]) / 6 * t) + ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6 * t) + ',' + f1(p2[1] - (p3[1] - p1[1]) / 6 * t) + ' ' + f1(p2[0]) + ',' + f1(p2[1]);
  }
  return s + (ferme ? ' Z' : '');
}
/* L'enveloppe convexe d'un nuage de points (le contour d'un cylindre vu d'en haut) */
function enveloppe(pts){
  var p = pts.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
  function cr(o, a, b){ return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  var bas = [], haut = [];
  p.forEach(function(q){ while(bas.length >= 2 && cr(bas[bas.length - 2], bas[bas.length - 1], q) <= 0) bas.pop(); bas.push(q); });
  p.slice().reverse().forEach(function(q){ while(haut.length >= 2 && cr(haut[haut.length - 2], haut[haut.length - 1], q) <= 0) haut.pop(); haut.push(q); });
  return bas.slice(0, -1).concat(haut.slice(0, -1));
}
