// ===== LES HÉROS EN VOLUME (moteur du jeu : jeu/heros-vues/src, repris tel quel de la maquette du combat de l'Alchimiste) =====
/* moteur des héros en volume (jeu/heros-vues/src/hv-base.js) */
/* ==========================================================
   Les héros « en volume » — 1 sur 5 : LES OUTILS (Romain, 23 novembre : « comme avec Mimi le chat, mais plus joli,
   avec plus de transition entre le moment où elle est tournée à 90 degrés et le moment où elle est de face »).

   L'IDÉE (la même que pour Mimi, mimi-vues.js) : le héros n'est pas une image qu'on retourne ni des dessins faits à part.
   C'est UN SEUL pantin, décrit en volume, et son dessin est RECALCULÉ pour l'angle voulu. Donc autant de vues qu'on veut
   entre la face et le profil, et toutes se tiennent entre elles.

   COMMENT UN VOLUME EST DÉCRIT
   - Un volume (la tête, la chevelure, le buste…) est une pile de « coupes » : à chaque hauteur y, sa tranche vue de dessus.
     Une coupe = {a : la demi-largeur, zm : là où elle est la plus large (z : vers le nez), cf : l'épaisseur vers l'avant,
     cb : vers l'arrière, pf / pb : sa rondeur (2 : un ovale ; plus grand : plus carrée)}.
   - On regarde toujours à l'horizontale ; le héros tourne sur lui-même d'un angle psi (0 : de face ; 90 : de profil, il regarde
     à droite ; -90 : à gauche ; 180 : de dos). Un point (x, z) du héros tombe à l'écran en X = x·cos(psi) + z·sin(psi).
   - Le contour d'un volume : à chaque hauteur, son bord gauche et son bord droit (bords()). C'est exact, pas une image écrasée.
   - Ce qui est dessiné SUR un volume (les yeux, la frange, la boucle de ceinture…) est donné comme on le voit de face, puis
     « posé » sur le volume (leve()) : en tournant, il glisse, se resserre, puis passe derrière le bord.
   Les mesures sont celles des héros d'aujourd'hui (persos.js) : cadre 300 × 440, le sol à y = 414, le trait #24182e.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues = {};
var O = HV.O = '#24182e', RAD = HV.RAD = Math.PI / 180;

function f1(v){ return Math.round(v * 10) / 10; }
function borne(x, a, b){ return x < a ? a : x > b ? b : x; }
function vers(a, b, t){ return a + (b - a) * t; }
function doux(a, b, x){ x = borne((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
function h2r(h){ h = String(h).replace('#', ''); if(h.length === 3) h = h.split('').map(function(x){ return x + x; }).join(''); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function r2h(r){ return '#' + r.map(function(v){ return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(''); }
function mix(a, b, t){ var x = h2r(a), y = h2r(b); return r2h([0, 1, 2].map(function(i){ return x[i] + (y[i] - x[i]) * t; })); }
function clair(h, t){ return mix(h, '#ffffff', t); }
function sombre(h, t){ return mix(h, '#0b0614', t); }
function c(w){ return ' stroke="' + O + '" stroke-width="' + (w || 2.2) + '" stroke-linejoin="round" stroke-linecap="round"'; }

/* ---------- Les coupes ---------- */
function N(u, v, q){ u = Math.abs(u); v = Math.abs(v); if(q === 2) return Math.sqrt(u * u + v * v); return Math.pow(Math.pow(u, q) + Math.pow(v, q), 1 / q); }
function coupe(a, zm, cf, cb, pf, pb){
  pf = pf || 2; pb = pb || 2;
  return {a:Math.max(a, 0.02), zm:zm, cf:Math.max(cf, 0.02), cb:Math.max(cb, 0.02), pf:pf, pb:pb, qf:pf / (pf - 1), qb:pb / (pb - 1)};
}
/* jusqu'où va la coupe dans la direction (dx, dz) */
function appui(S, dx, dz){ return S.zm * dz + (dz >= 0 ? N(S.a * dx, S.cf * dz, S.qf) : N(S.a * dx, S.cb * dz, S.qb)); }
/* une vue : l'angle psi (degrés) */
function vue(psi){
  var r = psi * RAD, V = {psi:psi, c:Math.cos(r), s:Math.sin(r)};
  /* w : de face et de trois quarts (1), la tête est « carrée » (le visage est large et plat, les yeux ont de la place) ;
     de profil (0), elle redevient ronde (l'œil s'enroule sur le côté). On passe de l'un à l'autre en douceur : c'est la triche
     des dessinateurs, et elle ne se voit ni de face ni de profil (le contour y est le même). */
  V.w = 1 - doux(0.707, 1, Math.abs(V.s));
  return V;
}
/* le bord gauche et le bord droit d'une coupe, à l'écran */
function bords(S, V){ return [-appui(S, -V.c, -V.s), appui(S, V.c, V.s)]; }
/* un point du tour de la coupe : az (radians), l'angle autour de son milieu — 0 : devant ; +90° : son côté x > 0 ; 180° : derrière → [x, z] */
function point(S, az){
  var sn = Math.sin(az), cs = Math.cos(az), av = cs >= 0, cc = av ? S.cf : S.cb, p = av ? S.pf : S.pb;
  var r = Math.pow(Math.pow(Math.abs(sn) / S.a, p) + Math.pow(Math.abs(cs) / cc, p), -1 / p);
  return [r * sn, S.zm + r * cs];
}
function ecranX(p, V){ return p[0] * V.c + p[1] * V.s; }
function fond(p, V){ return -p[0] * V.s + p[1] * V.c; }           /* la profondeur : plus grand = plus près de nous */
/* ce point du tour est-il tourné vers nous ? */
function visible(S, az, V){
  var q = point(S, az), x = q[0], zr = q[1] - S.zm, av = zr >= 0, cc = av ? S.cf : S.cb, p = av ? S.pf : S.pb;
  var nx = (x < 0 ? -1 : 1) * Math.pow(Math.abs(x) / S.a, p - 1) / S.a, nz = (av ? 1 : -1) * Math.pow(Math.abs(zr) / cc, p - 1) / cc;
  return -V.s * nx + V.c * nz > 0;
}
/* le point du tour qui va le plus loin dans la direction (dx, dz) : son angle */
function tAppui(S, dx, dz){
  var av = dz >= 0, cc = av ? S.cf : S.cb, q = av ? S.qf : S.qb;
  var u = S.a * Math.abs(dx), v = cc * Math.abs(dz), h0 = N(u, v, q) || 1e-9;
  return Math.atan2((dx >= 0 ? 1 : -1) * S.a * Math.pow(u / h0, q - 1), (av ? 1 : -1) * cc * Math.pow(v / h0, q - 1));
}
/* l'arc du tour qu'on voit : [aG, aD] (aG < aD ; le bord gauche et le bord droit à l'écran), et l'angle qui nous fait face */
function horizons(S, V){
  var tD = tAppui(S, V.c, V.s), tG = tAppui(S, -V.c, -V.s), tv = tAppui(S, -V.s, V.c);
  while(tD < tv) tD += 2 * Math.PI; while(tD > tv + Math.PI * 2) tD -= 2 * Math.PI;
  while(tG > tv) tG -= 2 * Math.PI; while(tG < tv - Math.PI * 2) tG += 2 * Math.PI;
  return [tG, tD, tv];
}
/* le x (vu de face) du bord, sur l'avant de la coupe, du côté où elle regarde */
function xBord(S, V){ return S.a * Math.pow(Math.abs(S.a * V.c) / (N(S.a * V.c, S.cf * V.s, S.qf) || 1e-9), S.qf - 1) * (V.c >= 0 ? 1 : -1); }
/* Poser sur l'avant d'une coupe un point donné « comme on le voit de face » (x) → son X à l'écran.
   Passé le bord (de l'autre côté), il reste collé au bord : ce qui est dessiné dessus se replie et disparaît.
   vrai : la pose exacte, même sur le côté (les cheveux) ; sinon un trait du visage ne s'étire jamais plus que de face. */
function leve(S, x, V, vrai){
  var a = S.a, p = S.pf, xh = xBord(S, V), sg = V.s > 0 ? 1 : V.s < 0 ? -1 : 0, cs = Math.abs(V.s);
  if(sg > 0){ if(x > xh) x = xh; } else if(sg < 0){ if(x < -xh) x = -xh; }
  function Z(u){ return S.zm + S.cf * Math.pow(Math.max(0, 1 - Math.pow(u / a, p)), 1 / p); }
  /* du côté tourné vers nous, le côté de la tête se déplie : un trait dessiné là ne doit pas s'étirer plus que de face.
     Passé l'endroit où il s'étirerait (xl), il continue tout droit. */
  var u = Math.abs(x);
  if(!vrai && sg * x <= 0 && u > 0.5){
    var xl = a * 0.9995;
    if(V.c < 0.9999){
      var lo = 0, hi = a * 0.9995, i, m, pente;
      for(i = 0; i < 13; i++){
        m = (lo + hi) / 2;
        pente = V.c + cs * S.cf * Math.pow(m / a, p - 1) / a * Math.pow(Math.max(1e-9, 1 - Math.pow(m / a, p)), 1 / p - 1);
        if(pente > 1) hi = m; else lo = m;
      }
      xl = lo;
    }
    if(u > xl){ var sx = x < 0 ? -1 : 1; return sx * xl * V.c + Z(xl) * V.s + (x - sx * xl); }
  }
  x = borne(x, -a, a);
  return x * V.c + Z(Math.abs(x)) * V.s;
}
/* Un tracé fermé donné de face → la partie qu'on voit, coupée proprement au bord du volume (puis à poser avec leve()) */
function coupeBord(P, vol, V, marge){
  var sg = V.s > 0 ? 1 : V.s < 0 ? -1 : 0, n = P.length, i;
  if(!sg) return P;
  function xb(y){ return xBord(vol.a(y, V.w), V); }
  marge = marge || 0;
  function dehors(q){ return sg * q[0] - xb(q[1]) - marge; }
  var F = P.map(dehors), i0 = -1;
  for(i = 0; i < n; i++) if(F[i] <= 0){ i0 = i; break; }
  if(i0 < 0) return [];
  var out = [], sortie = null;
  for(i = 0; i < n; i++){
    var ia = (i0 + i) % n, ib = (i0 + i + 1) % n, A = P[ia], B = P[ib], fa = F[ia], fb = F[ib];
    if(fa <= 0) out.push(A);
    if((fa <= 0) !== (fb <= 0)){
      var t = fa / (fa - fb), my = A[1] + (B[1] - A[1]) * t, M = [sg * (xb(my) + marge), my];
      if(fa <= 0){ out.push(M); sortie = my; }
      else {
        if(sortie !== null){ var k = Math.max(1, Math.round(Math.abs(my - sortie) / 2.5)), j; for(j = 1; j < k; j++){ var yy = sortie + (my - sortie) * j / k; out.push([sg * (xb(yy) + marge), yy]); } }
        out.push(M); sortie = null;
      }
    }
  }
  return out;
}
/* Un trait ouvert donné de face → les morceaux qu'on voit */
function morceaux(P, vol, V){
  var R = [], run = [], i;
  for(i = 0; i < P.length; i++){
    if(cache(vol.a(P[i][1], V.w), P[i][0], V)){ if(run.length > 1) R.push(run); run = []; }
    else run.push(P[i]);
  }
  if(run.length > 1) R.push(run);
  return R;
}
/* ce point est-il caché (passé le bord) ? */
function cache(S, x, V){
  var xh = xBord(S, V);
  return V.s > 0 ? x > xh + 0.01 : V.s < 0 ? x < -xh - 0.01 : V.c < 0;
}

/* ---------- Un volume : des coupes de y0 à y1, une par unité de hauteur ---------- */
function volume(y0, y1, f){
  var L = [], y;
  for(y = y0; y <= y1; y++) L.push(f(y));
  var vol = {y0:y0, y1:y1, L:L};
  /* la coupe à la hauteur y ; w (0 … 1, V.w) : la part de « carrure » gardée (1 : celle du volume ; 0 : toute ronde) */
  vol.a = function(y, w){
    var k = borne(y - y0, 0, y1 - y0), i = Math.min(L.length - 2, Math.floor(k)), t = k - i, A = L[i], B = L[i + 1] || A;
    if(w === undefined) w = 1;
    return coupe(vers(A.a, B.a, t), vers(A.zm, B.zm, t), vers(A.cf, B.cf, t), vers(A.cb, B.cb, t), 2 + (vers(A.pf, B.pf, t) - 2) * w, vers(A.pb, B.pb, t));
  };
  return vol;
}
/* le contour d'un volume vu sous l'angle V, de ya à yb : {G:[[x, y]…] de haut en bas, D:[…] de haut en bas} ;
   plus(y) → [dG, dD] : ce qui dépasse en plus (le nez, de profil) */
function contour(vol, V, ya, yb, pas, plus){
  var G2 = [], D = [], y, b, n = Math.max(2, Math.round((yb - ya) / (pas || 3))), i;
  for(i = 0; i <= n; i++){
    y = ya + (yb - ya) * i / n; b = bords(vol.a(y, V.w), V);
    if(plus){ var q = plus(y, b); b = [Math.min(b[0], q[0]), Math.max(b[1], q[1])]; }
    G2.push([b[0], y]); D.push([b[1], y]);
  }
  return {G:G2, D:D};
}
/* un tableau [y, valeur]… → une fonction lisse de y */
function table(T){
  return function(y){
    var n = T.length, i;
    if(y <= T[0][0]) return T[0][1];
    if(y >= T[n - 1][0]) return T[n - 1][1];
    for(i = 0; i < n - 1; i++) if(y <= T[i + 1][0]) break;
    var p0 = T[Math.max(i - 1, 0)], p1 = T[i], p2 = T[i + 1], p3 = T[Math.min(i + 2, n - 1)], t = (y - p1[0]) / (p2[0] - p1[0]);
    /* (une courbe de Hermite : la pente en chaque point vient de ses deux voisins) */
    var m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * (p2[0] - p1[0]);
    var t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
  };
}

/* ---------- Les tracés ---------- */
function pp(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function poly(P, ferme){ return P.length ? 'M' + P.map(pp).join(' L ') + (ferme === false ? '' : ' Z') : ''; }
/* une courbe fermée, douce, qui passe par tous les points */
function lisse(p){
  var n = p.length, s = 'M' + pp(p[0]), i, a, b, c2, d;
  for(i = 0; i < n; i++){
    a = p[(i + n - 1) % n]; b = p[i]; c2 = p[(i + 1) % n]; d = p[(i + 2) % n];
    s += ' C ' + f1(b[0] + (c2[0] - a[0]) / 6) + ' ' + f1(b[1] + (c2[1] - a[1]) / 6) + ' ' + f1(c2[0] - (d[0] - b[0]) / 6) + ' ' + f1(c2[1] - (d[1] - b[1]) / 6) + ' ' + pp(c2);
  }
  return s + ' Z';
}
/* la même, ouverte (suite : sans le « M » du début) */
function courbe(p, suite){
  var n = p.length, s = suite ? '' : 'M' + pp(p[0]), i, a, b, c2, d;
  for(i = 0; i < n - 1; i++){
    a = p[Math.max(i - 1, 0)]; b = p[i]; c2 = p[i + 1]; d = p[Math.min(i + 2, n - 1)];
    s += ' C ' + f1(b[0] + (c2[0] - a[0]) / 6) + ' ' + f1(b[1] + (c2[1] - a[1]) / 6) + ' ' + f1(c2[0] - (d[0] - b[0]) / 6) + ' ' + f1(c2[1] - (d[1] - b[1]) / 6) + ' ' + pp(c2);
  }
  return s;
}
/* un contour {G, D} → un tracé fermé (on descend à droite, on remonte à gauche) */
function ferme(ct){ return lisse(ct.D.concat(ct.G.slice().reverse())); }
/* des points le long d'une courbe de Bézier (2, 3 ou 4 points) */
function bez(P, t){
  if(P.length === 2) return [vers(P[0][0], P[1][0], t), vers(P[0][1], P[1][1], t)];
  if(P.length === 3){ var a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c2 = t * t; return [a * P[0][0] + b * P[1][0] + c2 * P[2][0], a * P[0][1] + b * P[1][1] + c2 * P[2][1]]; }
  var u = 1 - t, k0 = u * u * u, k1 = 3 * u * u * t, k2 = 3 * u * t * t, k3 = t * t * t;
  return [k0 * P[0][0] + k1 * P[1][0] + k2 * P[2][0] + k3 * P[3][0], k0 * P[0][1] + k1 * P[1][1] + k2 * P[2][1] + k3 * P[3][1]];
}
function ech(P, n){ var r = [], i; for(i = 0; i <= n; i++) r.push(bez(P, i / n)); return r; }
/* Un tracé SVG simple (M, L, C, Q, Z et leurs minuscules, H, V) → des suites de points [[x, y]…] ; n : points par courbe */
function points(d, n){
  n = n || 8;
  var re = /([MLCQZHVmlcqzhv])|(-?\d*\.?\d+(?:e-?\d+)?)/g, m, cmd = null, nb = [], R = [], cur = null, x = 0, y = 0, x0 = 0, y0 = 0;
  function finir(){
    var need = {M:2, L:2, C:6, Q:4, H:1, V:1}[cmd.toUpperCase()], rel = cmd !== cmd.toUpperCase(), i, j;
    while(need && nb.length >= need){
      var v = nb.splice(0, need), C = cmd.toUpperCase();
      if(rel){ if(C === 'H') v[0] += x; else if(C === 'V') v[0] += y; else for(i = 0; i < v.length; i += 2){ v[i] += x; v[i + 1] += y; } }
      if(C === 'M'){ cur = [[v[0], v[1]]]; R.push(cur); x = x0 = v[0]; y = y0 = v[1]; cmd = rel ? 'l' : 'L'; }
      else if(C === 'L'){ cur.push([v[0], v[1]]); x = v[0]; y = v[1]; }
      else if(C === 'H'){ cur.push([v[0], y]); x = v[0]; }
      else if(C === 'V'){ cur.push([x, v[0]]); y = v[0]; }
      else if(C === 'C'){ for(j = 1; j <= n; j++) cur.push(bez([[x, y], [v[0], v[1]], [v[2], v[3]], [v[4], v[5]]], j / n)); x = v[4]; y = v[5]; }
      else if(C === 'Q'){ for(j = 1; j <= n; j++) cur.push(bez([[x, y], [v[0], v[1]], [v[2], v[3]]], j / n)); x = v[2]; y = v[3]; }
    }
  }
  while((m = re.exec(d))){
    if(m[1]){ if(cmd) finir(); cmd = m[1]; nb = []; if(cmd === 'Z' || cmd === 'z'){ x = x0; y = y0; if(cur) cur.ferme = true; cmd = null; } }
    else nb.push(parseFloat(m[2]));
  }
  if(cmd) finir();
  return R;
}
/* un ruban le long d'une suite de points ; larg(t) : sa demi-largeur de 0 (le début) à 1 (le bout) */
function ruban(Cn, larg){
  var n = Cn.length - 1, L = [], R = [], i;
  for(i = 0; i <= n; i++){
    var a = Cn[Math.max(i - 1, 0)], z = Cn[Math.min(i + 1, n)], dx = z[0] - a[0], dy = z[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = larg(i / n);
    L.push([Cn[i][0] - dy / l * w, Cn[i][1] + dx / l * w]); R.push([Cn[i][0] + dy / l * w, Cn[i][1] - dx / l * w]);
  }
  R.reverse();
  return 'M' + pp(L[0]) + courbe(L, true) + ' L ' + pp(R[0]) + courbe(R, true) + ' Z';
}
/* une mèche effilée (comme brin() de persos.js) : large au début, en pointe au bout */
function meche(Cn, w, ex, b){
  ex = ex == null ? 0.9 : ex; b = b == null ? 0.3 : b;
  return ruban(Cn, function(t){ return w / 2 * Math.pow(1 - t, ex) * (1 + b * Math.sin(Math.PI * t)) + 0.05; });
}
/* un trait fin effilé aux deux bouts */
function filet(Cn, w){ return ruban(Cn, function(t){ return w / 2 * Math.sin(Math.PI * (0.06 + 0.9 * t)); }); }
/* une « gélule » : l'enveloppe de deux ronds (mimi-vues.js) */
function gelule(x0, y0, r0, x1, y1, r1){
  var dx = x1 - x0, dy = y1 - y0, d = Math.sqrt(dx * dx + dy * dy);
  if(d < 0.05 || d <= Math.abs(r0 - r1) + 0.02){
    var r = Math.max(r0, r1), cx = r0 >= r1 ? x0 : x1, cy = r0 >= r1 ? y0 : y1, rs = f1(r);
    return 'M' + f1(cx - r) + ' ' + f1(cy) + ' a' + rs + ' ' + rs + ' 0 1 0 ' + f1(2 * r) + ' 0 a' + rs + ' ' + rs + ' 0 1 0 ' + f1(-2 * r) + ' 0 Z';
  }
  var a = Math.atan2(dy, dx), b = Math.acos((r0 - r1) / d), c1 = Math.cos(a + b), s1 = Math.sin(a + b), c2 = Math.cos(a - b), s2 = Math.sin(a - b);
  return 'M' + f1(x0 + r0 * c1) + ' ' + f1(y0 + r0 * s1) + ' L' + f1(x1 + r1 * c1) + ' ' + f1(y1 + r1 * s1) +
    ' A' + f1(r1) + ' ' + f1(r1) + ' 0 ' + (b > Math.PI / 2 ? 1 : 0) + ' 0 ' + f1(x1 + r1 * c2) + ' ' + f1(y1 + r1 * s2) +
    ' L' + f1(x0 + r0 * c2) + ' ' + f1(y0 + r0 * s2) +
    ' A' + f1(r0) + ' ' + f1(r0) + ' 0 ' + (b < Math.PI / 2 ? 1 : 0) + ' 0 ' + f1(x0 + r0 * c1) + ' ' + f1(y0 + r0 * s1) + ' Z';
}
/* Une masse : UN contour épais autour de l'ensemble, puis le remplissage (les morceaux se fondent : persos.js, masse()) */
function masse(L, fill, sw){
  L = L.filter(function(d){ return !!d; });
  if(!L.length) return '';
  sw = sw || 2.2;
  return '<path d="' + L.join(' ') + '" fill="none" stroke="' + O + '" stroke-width="' + (sw * 2) + '" stroke-linejoin="round"/>' +
    '<g fill="' + fill + '">' + L.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g>';
}
function PF(d, fill, x){ return d ? '<path d="' + d + '" fill="' + fill + '"' + (x || '') + '/>' : ''; }
function PT(d, coul, w, x){ return d ? '<path d="' + d + '" fill="none" stroke="' + coul + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>' : ''; }
function PC(d, fill, w, x){ return d ? '<path d="' + d + '" fill="' + fill + '"' + c(w) + (x || '') + '/>' : ''; }

/* ---------- Les couleurs (les mêmes choix que persos.js) ---------- */
HV.PEAUX = [
  {id:'p1', c:['#fff1e6', '#f7caa6'], ombre:'#e8ad89', trait:'#c98a66', joue:'#ff8f8f'},
  {id:'p2', c:['#ffe7d2', '#efb88e'], ombre:'#d9976d', trait:'#b8764f', joue:'#ff877a'},
  {id:'p3', c:['#f8d8b0', '#dea575'], ombre:'#c48652', trait:'#9c663a', joue:'#f2786a'},
  {id:'p4', c:['#eec899', '#c7935c'], ombre:'#a77441', trait:'#80552c', joue:'#e4685a'},
  {id:'p5', c:['#d29d6f', '#a06840'], ombre:'#80502d', trait:'#5e381c', joue:'#d65a50'},
  {id:'p6', c:['#ad774e', '#6f4428'], ombre:'#55331c', trait:'#3a2010', joue:'#c84c4a'}
];
HV.CHEVEUX = [
  {id:'brun', c:['#d39654', '#7c4624', '#3a1e0e'], hl:'#f6cf98'}, {id:'chatain', c:['#e6bb85', '#a06f40', '#4c2d14'], hl:'#fbe0b4'},
  {id:'noir', c:['#6b7096', '#272840', '#0e0e1a'], hl:'#a9b4e6'}, {id:'blond', c:['#fff4c2', '#f0c95a', '#a8781c'], hl:'#fffbe6'},
  {id:'roux', c:['#ffb886', '#dc622a', '#7a2a0e'], hl:'#ffe0bc'}, {id:'gris', c:['#f2f2f6', '#a9aab8', '#5c5d6e'], hl:'#ffffff'},
  {id:'blanc', c:['#ffffff', '#e4e7f0', '#a3a7bf'], hl:'#ffffff'}, {id:'nuit', c:['#9fbaff', '#3c50b4', '#141c50'], hl:'#d6e4ff'},
  {id:'rose', c:['#ffd6ea', '#f07aab', '#932659'], hl:'#fff0f7'}
];
HV.YEUX = [
  {id:'vert', c:['#0a3a22', '#1f9150', '#86ffbd']}, {id:'bleu', c:['#0a1f4a', '#2f6fd0', '#a6dcff']}, {id:'marron', c:['#2a1206', '#7a4420', '#e0a876']},
  {id:'noisette', c:['#2e2208', '#8a6a1c', '#ecd07a']}, {id:'gris', c:['#1e2430', '#5f6f86', '#d6e2f0']}, {id:'violet', c:['#2a0a4a', '#7a3fd0', '#dcb6ff']},
  {id:'ambre', c:['#3a1a02', '#c47a10', '#ffd98a']}
];
HV.TENUES = [
  {id:'foret', c:'#2f8050'}, {id:'pourpre', c:'#6b3fb4'}, {id:'rubis', c:'#b8325a'}, {id:'azur', c:'#2f60b4'}, {id:'emeraude', c:'#1d8c84'},
  {id:'ocre', c:'#b4782a'}, {id:'rose', c:'#cf5f92'}, {id:'nuit', c:'#2b305f'}, {id:'ardoise', c:'#4b5772'}, {id:'brun', c:'#7a4a2a'}
];
HV.ROLES = {pisteur:{c:'#5fcf86', lueur:'#7dffb0', tenue:'foret'}, alchimiste:{c:'#b48cff', lueur:'#dcc0ff', tenue:'pourpre'}, barde:{c:'#ff8fb3', lueur:'#ffc4da', tenue:'rubis'}, sage:{c:'#6cb6ff', lueur:'#a8e2ff', tenue:'azur'}};
function trouve(l, id){ for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i]; return l[0]; }

/* le contexte d'un dessin : ses couleurs, et les noms de ses dégradés (propres à chaque <svg>) */
HV.contexte = function(id, h){
  var K = {id:id, u:function(n){ return 'url(#' + id + '-' + n + ')'; }, n:function(n){ return id + '-' + n; }};
  K.peau = trouve(HV.PEAUX, h.peau); K.chev = trouve(HV.CHEVEUX, h.cheveux); K.yeux = trouve(HV.YEUX, h.yeux);
  K.role = HV.ROLES[h.role] || HV.ROLES.pisteur;
  K.tenue = trouve(HV.TENUES, h.tenue || K.role.tenue).c;
  /* les couleurs de la garde-robe (h.couleurs = {habit, pantalon, bottes, cuir}, des noms de HV.PALETTE, comme dans le jeu) */
  var cl = h.couleurs || {};
  function pal(id){ for(var i = 0; i < HV.PALETTE.length; i++) if(HV.PALETTE[i].id === id) return HV.PALETTE[i].c; return null; }
  if(pal(cl.habit)) K.tenue = pal(cl.habit);
  K.tissu = [clair(K.tenue, 0.3), K.tenue, sombre(K.tenue, 0.45)];
  var cp = pal(cl.pantalon), cb = pal(cl.bottes), cc = pal(cl.cuir);
  /* h.combat : la tenue de combat du donjon (des brassards et des genouillères de cuir, des jambières brunes, comme le Pisteur du
     donjon d'aujourd'hui) */
  K.combat = !!h.combat;
  /* (le gabarit du corps — hv-corps.js, GABARITS : « femme », « homme » ; Romain, 23 novembre, 23 h 53 : « tu peux passer aux hommes,
     aux enfants, aux papys. Commence par les hommes ») ; h.corps pour en forcer un */
  /* (h.age, comme dans le jeu : « adulte », « enfant », « age » — l'enfant et les anciens ont leur gabarit, hv-corps.js) */
  K.corps = h.corps || (h.age === 'enfant' ? (h.sexe === 'm' ? 'garcon' : 'fille') : h.age === 'age' ? (h.sexe === 'm' ? 'papy' : 'mamie') : (h.sexe === 'm' ? 'homme' : 'femme'));
  var gb = HV.GABARITS && HV.GABARITS[K.corps];
  K.echelle = (gb && gb.echelle) || 1; K.teteK = (gb && gb.tete) || 1; K.voute = (gb && gb.voute) || 0;
  /* (ce que chaque rôle porte — Romain, 23 novembre, 20 h 05 : « tu peux lancer l'alchimiste, le sage » : l'arc, le carquois et le
     baudrier sont au Pisteur ; l'Alchimiste a son tablier de cuir et sa fiole sur la poitrine ; le Sage, son bâton) */
  var rl = h.role || 'pisteur';
  K.arme = h.arme !== undefined ? h.arme : rl === 'pisteur' ? 'arc' : null;
  K.baudrier = rl === 'pisteur' || rl === 'alchimiste';
  K.tablier = rl === 'alchimiste';
  /* LE SAGE (Romain, 23 novembre, 22 h 21 : « tu peux passer au sage ») : la longue robe crème sous le manteau bleu ouvert, bordé d'or
     (K.robe : hv-corps.js), son bâton à cristal dans SA main droite (K.baton) ; K.lunettes : des lunettes rondes (hv-tete.js) */
  K.robe = rl === 'sage';
  K.baton = h.baton !== undefined ? h.baton : rl === 'sage';
  /* (les lunettes : enlevées du Sage — Romain, 23 novembre, 22 h 53 : « tu les as fait en texture collée sur le visage et ça fait
     moche […] enlève-les » ; le dessin reste, coupé : h.lunettes = true pour le remettre) */
  K.lunettes = !!h.lunettes;
  /* (la couleur de la potion dans sa main : l'adaptateur du donjon la change avant de préparer — HV.monter(…).K.potion) */
  K.potion = h.potion || '#ff8a2a';
  K.pant = cp ? [sombre(cp, 0.1), sombre(cp, 0.55)] : K.combat ? ['#5a4232', '#241811'] : ['#4a4062', '#221d33'];
  K.botte = cb ? [clair(cb, 0.3), sombre(cb, 0.2), sombre(cb, 0.6)] : ['#b77b45', '#6e4223', '#3b2211'];
  K.cuir = cc ? [clair(cc, 0.3), sombre(cc, 0.2), sombre(cc, 0.6)] : ['#b77b45', '#6e4223', '#3b2211'];
  return K;
};
/* les couleurs de la garde-robe du jeu (jeu/src/garderobe.js : PALETTE) */
HV.PALETTE = [
  {id:'rouge', c:'#d33a3a'}, {id:'orange', c:'#ec8526'}, {id:'jaune', c:'#f1c232'}, {id:'vert', c:'#4aa64e'}, {id:'foret', c:'#2e6a3c'},
  {id:'turquoise', c:'#1fa39b'}, {id:'bleu', c:'#2f6ed0'}, {id:'nuit', c:'#2c3572'}, {id:'violet', c:'#7b4ac9'}, {id:'rose', c:'#e467a5'},
  {id:'marron', c:'#875230'}, {id:'noir', c:'#36313f'}, {id:'gris', c:'#8b91a2'}, {id:'blanc', c:'#ece8df'}
];
function stops(st){ return st.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join(''); }
function lin(id, st, x1, y1, x2, y2){ return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 1 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stops(st) + '</linearGradient>'; }
function linU(id, st, x1, y1, x2, y2){ return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops(st) + '</linearGradient>'; }
function rad(id, st, cx, cy, r){ return '<radialGradient id="' + id + '" cx="' + (cx || 0.5) + '" cy="' + (cy || 0.5) + '" r="' + (r || 0.5) + '">' + stops(st) + '</radialGradient>'; }
HV.defs = function(K){
  var P = K.peau, Ch = K.chev, Y = K.yeux, T = K.tissu, n = K.n;
  return '<defs>' +
    linU(n('peauU'), [[0, P.c[0]], [1, P.c[1]]], -26, -27, 26, 36) +
    lin(n('peau'), [[0, P.c[0]], [1, P.c[1]]]) +
    linU(n('chevU'), [[0, Ch.c[0]], [0.5, Ch.c[1]], [1, Ch.c[2]]], -30, -66, 24, 30) +
    linU(n('chevB'), [[0, mix(Ch.c[0], Ch.c[1], 0.6)], [0.55, mix(Ch.c[1], Ch.c[2], 0.45)], [1, Ch.c[2]]], -40, -66, 30, 30) +
    linU(n('chevQ'), [[0, mix(Ch.c[0], Ch.c[1], 0.45)], [0.5, mix(Ch.c[1], Ch.c[2], 0.3)], [1, Ch.c[2]]], -30, -70, 20, 80) +
    linU(n('chevL'), [[0, Ch.hl, 0.95], [0.55, Ch.hl, 0.7], [1, Ch.hl, 0.1]], 0, -54, 0, -30) +
    lin(n('iris'), [[0, Y.c[0]], [0.55, Y.c[1]], [1, Y.c[2]]], 0, 0, 0, 1) +
    /* la tunique : le même dégradé pour le buste et les manches (dans les mesures du corps), pour qu'ils se fondent */
    linU(n('tun'), [[0, T[0]], [0.55, T[1]], [1, T[2]]], -46, 136, 46, 276) +
    /* les matières : la trame du tissu (deux fils croisés), le grain du cuir */
    '<pattern id="' + n('trame') + '" patternUnits="userSpaceOnUse" width="3.4" height="3.4" patternTransform="rotate(-32)"><path d="M0 .9 H3.4" stroke="' + sombre(T[2], 0.25) + '" stroke-width=".55" opacity=".7"/><path d="M0 2.5 H3.4" stroke="' + clair(T[0], 0.35) + '" stroke-width=".45" opacity=".5"/></pattern>' +
    '<pattern id="' + n('grain') + '" patternUnits="userSpaceOnUse" width="9" height="8"><path d="M1 2 l1.6 .5 M5.5 5.4 l1.6 -.4" stroke="#2a160a" stroke-width=".6" stroke-linecap="round" opacity=".5"/><path d="M6 1.4 l1.4 .3" stroke="#f0c090" stroke-width=".5" stroke-linecap="round" opacity=".45"/></pattern>' +
    lin(n('tunO'), [[0, mix(T[1], T[2], 0.5)], [1, sombre(T[2], 0.3)]]) +
    lin(n('acc'), [[0, clair(K.tenue, 0.35)], [1, sombre(K.tenue, 0.35)]]) +
    lin(n('pant'), [[0, K.pant[0]], [1, K.pant[1]]]) +
    lin(n('cuir'), [[0, K.cuir[0]], [0.5, K.cuir[1]], [1, K.cuir[2]]]) +
    lin(n('botte'), [[0, K.botte[0]], [0.5, K.botte[1]], [1, K.botte[2]]]) +
    lin(n('cuirH'), [[0, K.cuir[2]], [0.3, mix(K.cuir[0], K.cuir[1], 0.55)], [0.55, mix(K.cuir[1], K.cuir[0], 0.25)], [1, K.cuir[2]]], 0, 0, 1, 0) +
    lin(n('or'), [[0, '#fff4b8'], [0.45, '#eab43c'], [1, '#94620e']]) +
    lin(n('bois'), [[0, '#5a3214'], [0.5, '#c48a50'], [1, '#5a3214']], 0, 0, 1, 0) +
    /* le relief : d'un bord à l'autre de la forme (la lumière vient d'en haut à gauche) */
    lin(n('relH'), [[0, '#000', 0.14], [0.16, '#fff', 0.2], [0.42, '#fff', 0.02], [0.66, '#000', 0.08], [0.86, '#000', 0.26], [1, '#000', 0.46]], 0, 0, 1, 0) +
    lin(n('relM'), [[0, '#000', 0.2], [0.26, '#fff', 0.16], [0.6, '#000', 0.03], [1, '#000', 0.4]], 0, 0, 1, 0) +
    lin(n('relV'), [[0, '#fff', 0.12], [0.3, '#fff', 0], [0.62, '#000', 0], [1, '#000', 0.26]], 0, 0, 0, 1) +
    rad(n('ombre'), [[0, '#000', 0.45], [1, '#000', 0]]) +
  '</defs>';
};

HV.outils = {f1:f1, borne:borne, vers:vers, doux:doux, mix:mix, clair:clair, sombre:sombre, c:c, N:N, coupe:coupe, appui:appui, vue:vue, bords:bords, point:point,
  ecranX:ecranX, fond:fond, visible:visible, tAppui:tAppui, horizons:horizons, xBord:xBord, leve:leve, coupeBord:coupeBord, morceaux:morceaux, cache:cache, volume:volume, contour:contour, table:table,
  pp:pp, poly:poly, lisse:lisse, courbe:courbe, ferme:ferme, bez:bez, ech:ech, points:points, ruban:ruban, meche:meche, filet:filet, gelule:gelule,
  masse:masse, PF:PF, PT:PT, PC:PC, trouve:trouve};
})(window);


/* moteur des héros en volume (jeu/heros-vues/src/hv-tete.js) */
/* ==========================================================
   Les héros « en volume » — 2 sur 5 : LA TÊTE (la peau, le visage, les oreilles).
   Les mesures sont celles de la tête de persos.js : le point (0, 0) est entre les yeux, y descend, le menton est à y = 34.
   z va vers le nez ; l'axe du cou est à z = -3.

   - HV.TETE : le volume de la tête (les coupes), le nez en plus (une bosse sur la ligne du milieu).
   - Le visage (yeux, sourcils, nez, bouche, joues) est donné comme on le voit de face, puis posé sur le volume :
     quand elle tourne la tête, les traits glissent du côté où elle regarde, l'œil du fond se resserre puis passe derrière
     la joue, le nez sort du contour, l'oreille et le côté de la tête apparaissent.
   - HV.tete(K, h, V, P) → les morceaux du dessin, dans les mesures de la tête.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, O = HV.O, RAD = HV.RAD;
var f1 = U.f1, borne = U.borne, vers = U.vers, doux = U.doux, coupe = U.coupe, table = U.table, leve = U.leve, PF = U.PF, PT = U.PT, PC = U.PC;

/* ---------- Le volume de la tête ---------- */
var T_A = table([[5, 26], [10, 25.4], [15.3, 24.1], [20, 21.6], [23.6, 18.8], [27, 14.8], [29.9, 10.6], [32, 6.6], [33.5, 2.8], [34, 0.02]]);
var T_ZM = table([[12, -3], [15, -1.6], [18, 1.2], [21, 4.8], [24, 8.4], [27, 11.4], [30, 13.5], [33, 14.8], [34, 15]]);
var T_ZF = table([[-8, 22.5], [-2, 22.4], [4, 21.5], [9, 21.7], [14, 22.3], [19, 22.6], [22, 22.2], [25, 21.9], [28, 20.6], [31, 19.9], [33, 17.6], [34, 15.1]]);
var T_ZB = table([[-16, -31.5], [-8, -31], [0, -29], [6, -26], [10, -23], [14, -18.5], [17, -13], [20, -8.5], [23, -4], [26, 0.5], [29, 5.5], [31.5, 10], [33.5, 14], [34, 14.9]]);
var T_PF = HV.carrure = table([[-57, 2], [-49, 2.1], [-30, 2.7], [-12, 3.6], [4, 4], [16, 3.6], [26, 2.6], [34, 2]]);
function rond(y, y0, h){ var k = (y - y0) / h; return Math.sqrt(Math.max(0, 1 - k * k)); }
function coupeTete(y){
  var a = y <= -12 ? 26 * rond(y, -12, 37) : y <= 5 ? 26 : T_A(y);
  var zm = y <= 12 ? -3 : T_ZM(y);
  var zf = y <= -8 ? -3 + 25.5 * rond(y, -8, 41) : T_ZF(y);
  var zb = y <= -16 ? -3 - 28.5 * rond(y, -16, 33) : T_ZB(y);
  return coupe(a, zm, zf - zm, zm - zb, T_PF(y), 2);
}
var TETE = HV.TETE = U.volume(-49, 34, coupeTete);
/* la ligne du milieu du visage, vue de profil : le front, le creux entre les yeux, le nez, les lèvres, le menton.
   Elle passe un peu devant le reste du visage (les yeux sont en retrait) ; c'est elle qui dessine le profil. */
var T_MIL = table([[-34, 19.6], [-26, 22.6], [-18, 24.6], [-10, 25.5], [-3, 25.3], [3, 24.3], [8, 25], [12.5, 26.9], [15.6, 28.9], [17.4, 26.6], [19, 23.6], [21.2, 23.9], [22.6, 22.9], [24.6, 23.4], [27.4, 21.5], [30.4, 21.5], [32.6, 19.4], [34, 15.4]]);
function zMilieu(y){ var S = TETE.a(y, 0); return Math.max(S.zm + S.cf, y < -34 ? -99 : T_MIL(y)); }
HV.zMilieu = zMilieu;

/* poser un point du visage (x, y vus de face) → [X, y].
   HO : quand elle baisse la tête (vue de face), les traits du visage descendent de HO vers le menton (hv-pantin.js : P.hocheF) ;
   quand elle lève le nez, ils remontent. Le contour de la tête, lui, ne change pas : ce n'est pas une image écrasée. */
var HO = 0;
function glisse(y){ return HO * (y > 4 ? 1 - 0.5 * Math.min(1, (y - 4) / 30) : 1); }
function pose(x, y, V){ var y2 = y + glisse(y); return [leve(TETE.a(y2, V.w), x, V), y2]; }
function poseL(L, V){ return L.map(function(p){ return pose(p[0], p[1], V); }); }
function ovale(cx, cy, rx, ry, n){ var r = [], i; n = n || 20; for(i = 0; i < n; i++){ var a = 2 * Math.PI * i / n; r.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return r; }

/* ---------- Un œil (d : -1 celui de gauche à l'écran quand elle est de face, 1 celui de droite) ---------- */
function oeil(K, d, V, P, f){
  var ex = 12 * d, ey = 6, yo = borne(P.yo == null ? 1 : P.yo, 0, 1), s = '', garcon = f.sexe === 'm';
  var rgx = borne((P.rx || 0) + (P.regX || 0), -1, 1), rgy = borne((P.ry || 0) + (P.regY || 0), -1, 1), ox = rgx * 2.6, oy = rgy * 1.6;
  /* L'EXPRESSION (Romain, 23 novembre, 13 h 36 : « pour chaque position, il faut qu'elle ait une expression de visage qui
     corresponde »). plisse > 0 : elle plisse les yeux (la paupière du bas remonte, celle du haut descend un peu : elle vise, elle
     rit) ; < 0 : les yeux grands ouverts (la surprise). Quand elle regarde en bas, la paupière du haut descend aussi. */
  var pl = borne(P.plisse || 0, -0.5, 1), bas = Math.max(0, rgy);
  function sq(w){ return w < 0 ? w * (1 - 0.32 * Math.max(pl, 0) + 0.25 * Math.max(-pl, 0) - 0.22 * bas) : w * (1 - 0.68 * Math.max(pl, 0)); }
  var B7 = sq(7);
  function Qw(w){ return B7 - (B7 - sq(w)) * (0.12 + 0.88 * yo); }
  /* un point de l'œil (v : vers l'extérieur du visage, w : vers le bas) ; la paupière qui se ferme le ramène vers le bas de l'œil */
  function Q(v, w){ return pose(ex + v * d, ey + Qw(w), V); }
  function L(pts){ return pts.map(function(p){ return Q(p[0], p[1]); }); }
  if(yo < 0.14){
    s += PT(U.poly(L(U.ech([[-8.5, 4.6], [0, 8.6], [9.2, 4.2]], 8)), false), O, 2.4);
    if(!garcon) s += PT(U.poly(L(U.ech([[9, 4.4], [12.6, 4.4], [14.4, 2.4]], 4)), false), O, 1.7);
    return s;
  }
  var blanc = L(U.ech([[-8.5, -4], [0, -7.5], [9, -4.5]], 8).concat(U.ech([[9, -4.5], [9.2, 6], [0, 7]], 8).slice(1), U.ech([[0, 7], [-8.5, 6], [-8.5, -4]], 8).slice(1)));
  var dB = U.poly(blanc), cid = K.n('o' + (d < 0 ? 'g' : 'd'));
  s += '<clipPath id="' + cid + '"><path d="' + dB + '"/></clipPath>' + PF(dB, '#fff');
  /* l'iris, la pupille : posés eux aussi (ils se resserrent avec l'œil) */
  function I(cx, cy, rx, ry, n){ return U.poly(ovale(ex + cx, ey + cy, rx, ry, n).map(function(p){ return pose(p[0], 7 + ey - (7 + ey - p[1]) * (0.12 + 0.88 * yo), V); })); }
  s += '<g clip-path="url(#' + cid + ')">' +
    PF(I(ox, 0.5 + oy, 5.9, 7.3, 22), K.u('iris')) +
    PT(I(ox, 0.5 + oy, 5.9, 7.3, 22), O, 1.1, ' opacity=".5"') +
    PF(I(ox, 1 + oy, 2.6, 3.5, 14), '#0a0612') +
    PT(U.poly(L(U.ech([[ox * d - 3.6, 5.6 + oy], [ox * d, 8 + oy], [ox * d + 3.6, 5.6 + oy]], 6)), false), '#fff', 1.5, ' opacity=".45"') +
    PF(I(0, -7.6, 12, 4.8, 16), '#2a1d48', ' opacity=".26"') + '</g>';
  /* les reflets : toujours du même côté (la lumière ne tourne pas avec elle) */
  s += PF(I(ox + 2.2, -2.4 + oy, 2.1, 2.7, 10), '#fff') + PF(I(ox - 2, 4 + oy, 1, 1, 8), '#fff');
  /* la paupière du haut : un trait épais */
  var paup = L(U.ech([[-9.5, -2.5], [-2, -10.5], [9.5, -6]], 10).concat([[10.5, -3]], U.ech([[10.5, -3], [0, -8], [-9.5, -2]], 10).slice(1)));
  s += PF(U.poly(paup), O);
  if(!garcon){
    var cils = '';
    [[[9, -5], [13, -6.5], [14.5, -9.5]], [[9.6, -2.5], [13.2, -2.1], [14.8, -4.3]]].forEach(function(cl){
      U.morceaux(U.ech(cl, 5).map(function(q){ return [ex + q[0] * d, ey + Qw(q[1])]; }), TETE, V).forEach(function(run){ cils += U.poly(run.map(function(q){ return pose(q[0], q[1], V); }), false) + ' '; });
    });
    s += PT(cils, O, 1.8);
  }
  s += PT(U.poly(L(U.ech([[-6, 8], [0, 9.5], [6, 8]], 6)), false), K.peau.trait, 1);
  return s;
}

/* ---------- Une oreille : un petit pavillon accroché sur le côté de la tête, qui part vers l'arrière ---------- */
var OREILLE = [[0, -7], [3, -9.2], [7, -8.6], [9.2, -4], [8.6, 2], [6, 6.4], [2.8, 7.4], [0, 4.6]];
var OREILLE_PLI = [[2.8, -5], [5.8, -4.8], [6.6, 0.4], [4.2, 3.8]];
function oreille(K, d, V){
  var S = TETE.a(3, V.w), bx = d * (S.a - 0.6), bz = -3.4, ux = d * 0.52, uz = -0.855;      /* (l'attache ; la direction du pavillon : vers l'extérieur et l'arrière) */
  function Q(p){ var x = bx + ux * p[0], z = bz + uz * p[0]; return [x * V.c + z * V.s, 4 + p[1] - HO * 0.45]; }      /* (elle baisse la tête : les oreilles remontent) */
  var d1 = U.lisse(OREILLE.map(Q));
  /* (devant la peau si son attache est de notre côté ; sinon derrière la tête : elle n'en dépasse que si la tête est de face) */
  return {devant:U.visible(S, Math.atan2(bx, bz - S.zm), V),
    svg:PC(d1, K.u('peauU'), 1.8) + PT(U.courbe(OREILLE_PLI.map(Q)), K.peau.trait, 1.2)};
}

/* ==========================================================
   La tête. V : la vue de la tête ; P : {rx, ry : le regard ; yo : les yeux ouverts (1) ou fermés (0) ; bouche ; sourcils}
   → {peau : le tracé du contour (pour l'ombre sur le cou), svg(avantCheveux) : le visage complet}
   ========================================================== */
HV.tete = function(K, h, V, P, CH){
  var f = {sexe:h.sexe === 'm' ? 'm' : 'f'}, s = '', sg = V.s >= 0 ? 1 : -1, face = V.c > -0.3;
  HO = borne((P.hocheF || 0) * 0.27, -6, 8);
  /* le contour : la tête, et le nez qui dépasse du côté où elle regarde */
  var ct = U.contour(TETE, V, -49, 34, 2.4, function(y, b){ var X = zMilieu(y) * V.s; return [X, X]; });
  function Sv(y){ return TETE.a(y, V.w); }
  var dPeau = U.ferme(ct), cid = K.n('vis');
  var av = '', ar = '';
  /* les oreilles : devant la peau du côté qu'on voit, derrière de l'autre */
  [-1, 1].forEach(function(d){ var o = oreille(K, d, V); if(o.devant) av += o.svg; else ar += o.svg; });
  s += ar + '<clipPath id="' + cid + '"><path d="' + dPeau + '"/></clipPath>' + PC(dPeau, K.u('peauU'), 2.3);
  var dans = '';
  /* l'ombre : la joue et la mâchoire du côté opposé à la lumière (elle vient de la gauche de l'écran) */
  var om = [], i, n = 14;
  for(i = 0; i <= n; i++){ var y = -2 + 36 * i / n, b = U.bords(Sv(Math.min(y, 34)), V), X = Math.max(b[1], zMilieu(Math.min(y, 34)) * V.s); om.push([X + 1, y]); }
  for(i = n; i >= 0; i--){ var y2 = -2 + 36 * i / n, b2 = U.bords(Sv(Math.min(y2, 34)), V), X2 = Math.max(b2[1], zMilieu(Math.min(y2, 34)) * V.s), w = 2.5 + 8.5 * Math.pow(Math.sin(Math.PI * Math.min(1, (i / n) * 0.92)), 0.8); om.push([X2 - w, y2 + (i === 0 ? 0 : 1.5)]); }
  dans += PF(U.lisse(om), K.peau.ombre, ' opacity=".5"');
  /* l'ombre de la frange sur le front */
  if(CH && CH.ombre) dans += '<path d="' + CH.ombre + '" transform="translate(1.4 4.4)" fill="' + K.peau.ombre + '" opacity=".6"/>';
  if(face){
    /* les joues */
    /* (rougit : l'effort, la joie — les joues plus rouges) */
    var rj = borne(P.rougit || 0, 0, 1);
    [-1, 1].forEach(function(d){ dans += PF(U.poly(poseL(ovale(19 * d, 16, 6 + rj, 3.2 + rj * 0.8, 14), V)), K.peau.joue, ' opacity="' + f1(0.34 + 0.34 * rj) + '"'); });
    /* (les anciens — le papy, la mamie : quelques rides, posées sur le visage comme le reste : les pattes d'oie au coin des yeux, un
       petit pli sous les yeux, les plis du sourire, deux lignes sur le front) */
    if(K.corps === 'papy' || K.corps === 'mamie'){
      var rid = function(pts){ var q = poseL(pts, V); return 'M' + q.map(function(p){ return f1(p[0]) + ' ' + f1(p[1]); }).join(' L'); };
      var rd = '';
      [-1, 1].forEach(function(d){
        rd += rid([[21 * d, 4], [25.5 * d, 1.8]]) + rid([[21.5 * d, 7.2], [25.5 * d, 8.8]]);
        rd += rid([[7 * d, 13.4], [10 * d, 14.8], [14 * d, 15], [17 * d, 13.8]]);
        rd += rid([[6.5 * d, 17.5], [8.5 * d, 21], [10.5 * d, 25]]);
      });
      rd += rid([[-10, -13], [-4, -14.2], [4, -14.2], [10, -13]]) + rid([[-8, -9], [-3, -9.8], [3, -9.8], [8, -9]]);
      dans += PT(rd, K.peau.trait, 0.95, ' opacity=".5"');
    }
    /* les yeux */
    dans += oeil(K, -1, V, P, f) + oeil(K, 1, V, P, f);
    /* LES LUNETTES RONDES (le Sage : K.lunettes) : deux cercles de laiton posés sur le visage autour des yeux, comme les yeux (elles
       glissent et se resserrent quand elle tourne la tête), le pont sur le nez, les branches vers les oreilles, un reflet */
    if(K.lunettes){
      var LC = '#c9973a', LS = '#4a2e10';
      [-1, 1].forEach(function(d){
        var R = poseL(ovale(12.5 * d, 6.5, 9.6, 8.4, 26), V), Rf = U.poly(R);
        dans += PF(Rf, '#e6f6ff', ' opacity=".16"') + PT(Rf, LS, 3.6) + PT(Rf, LC, 1.9);
        var br = poseL([[21.9 * d, 5], [25.5 * d, 5.5], [28 * d, 7]], V);
        dans += PT(U.poly(br, false), LS, 3) + PT(U.poly(br, false), LC, 1.4);
        var re = poseL([[12.5 * d - 5.5, 2.5], [12.5 * d - 3.5, 0.2], [12.5 * d - 0.5, -0.6]], V);
        dans += PT(U.poly(re, false), '#ffffff', 1.5, ' opacity=".75"');
      });
      var pont = poseL([[-3, 5.2], [0, 3.6], [3, 5.2]], V);
      dans += PT(U.poly(pont, false), LS, 3.2) + PT(U.poly(pont, false), LC, 1.6);
    }
    /* le nez : un petit trait qui pointe du côté où elle regarde ; de profil, c'est le contour qui le dessine */
    var S15 = Sv(15.6);
    var gn = glisse(15);
    var N1 = [(T_MIL(12) - 0.4) * V.s, 12 + gn], N2 = [-1.6 * V.c + (T_MIL(15.8) - 0.3) * V.s, 16.4 + gn], N3 = [0.8 * V.c + (T_MIL(18) - 1.6) * V.s, 17.2 + gn];
    var bord = U.bords(S15, V), sort = sg > 0 ? N2[0] - bord[1] : bord[0] - N2[0], opN = 1 - doux(-2.4, 0.4, sort);
    if(opN > 0.03) dans += PT(U.poly([N1, N2, N3], false), K.peau.trait, 1.5, ' opacity="' + f1(opN) + '"');
    /* la bouche : un sourire, sur le bombé des lèvres (elle s'enroule plus que le reste du visage : de profil il en reste le coin) */
    function levre(q){ return [q[0] * V.c + (T_MIL(q[1]) - 0.3 - q[0] * q[0] / 12) * V.s, q[1] + glisse(q[1])]; }
    function vuL(q){ return V.c - V.s * q[0] / 6 > 0.02; }
    /* LA BOUCHE selon l'expression : sourire (1 : le sourire de toujours ; 0 : neutre ; -1 : les coins tombent), ouvre (0 … 1 : la
       bouche s'ouvre), largeB (sa largeur : 0,45 les lèvres pincées en « o », 1 normale), bouchex (une moue de côté) */
    var sr = borne(P.sourire == null ? 1 : P.sourire, -1, 1), ov = borne(P.ouvre || 0, 0, 1), kb = borne(P.largeB == null ? 1 : P.largeB, 0.3, 1.4), bx = borne(P.bouchex || 0, -1, 1) * 2.4;
    var wb = 6 * kb * (1 + 0.2 * ov), yc = 23.4 - 1.4 * sr, ym = 23.4 + 2.8 * sr - ov * 3 * (1 - Math.max(sr, 0));
    var cG = [-wb + bx, yc + bx * 0.5], cD = [wb + bx, yc - bx * 0.5], haut = U.ech([cG, [bx * 0.6, ym], cD], 12);
    if(ov < 0.06){
      var bo = haut.filter(vuL).map(levre);
      if(bo.length > 1) dans += PT(U.poly(bo, false), '#9e4c38', 1.8);
      if(f.sexe === 'f' && sr > 0.2){
        /* (la lèvre du bas, sous le trait : le même dessin qu'avant pour le sourire de toujours) */
        var Ym = (cG[1] + cD[1] + 2 * ym) / 4 - 24.1;
        var lv = U.ech([[-3.5, 23.6], [0, 25.8], [3.5, 23.6]], 6).concat(U.ech([[3.5, 23.6], [0, 24.5], [-3.5, 23.6]], 6).slice(1))
          .map(function(q){ return [q[0] * kb + bx * 0.6, q[1] + Ym]; }).filter(vuL).map(levre);
        if(lv.length > 2) dans += PF(U.poly(lv), '#e0707a', ' opacity="' + f1(0.7 * Math.min(1, sr * 1.5)) + '"');
      }
    } else {
      /* la bouche ouverte : le dedans sombre, les dents en haut quand elle sourit, la langue en bas */
      var yb = ym + 2 + 12 * ov, bas2 =U.ech([cD, [bx * 0.6, yb + (sr > 0 ? 2 * sr : 0)], cG], 12).slice(1, -1);
      var tout = haut.concat(bas2), vus = tout.filter(vuL);
      if(vus.length > tout.length * 0.6){
        var dB2 = U.poly(vus.map(levre)), bid = K.n('bch');
        dans += '<clipPath id="' + bid + '"><path d="' + dB2 + '"/></clipPath>' + PF(dB2, '#5a1a2a') + '<g clip-path="url(#' + bid + ')">' +
          PF(U.poly(U.ech([[-wb * 0.7 + bx, yb + 3], [bx * 0.6, yb - 3.2 * ov - 1], [wb * 0.7 + bx, yb + 3]], 8).filter(vuL).map(levre)), '#d9606e') +
          (sr > 0.2 ? PT(U.poly(haut.map(function(q){ return [q[0], q[1] + 1.1]; }).filter(vuL).map(levre), false), '#fffaf2', 1.6 + 1.6 * ov) : '') + '</g>' +
          PT(dB2, '#9e4c38', 1.5);
      } else {
        var bo2 = haut.filter(vuL).map(levre);
        if(bo2.length > 1) dans += PT(U.poly(bo2, false), '#9e4c38', 1.8);
      }
    }
  }
  s += '<g clip-path="url(#' + cid + ')">' + dans + '</g>' + av;
  /* les sourcils : par-dessus la frange (on les voit à travers, comme dans persos.js) */
  var sc = '';
  if(face){
    /* sourcils : -1 froncés (le bout près du nez descend : la colère, la concentration), 1 levés ; sourcilsIn : le bout près du
       nez remonte (l'inquiétude, la fatigue) ; sourcilsAsym : un sourcil plus haut que l'autre (elle réfléchit, elle doute) */
    var sb0 = P.sourcils || 0, si = borne(P.sourcilsIn || 0, -1, 1), sa = borne(P.sourcilsAsym || 0, -1, 1);
    [-1, 1].forEach(function(d){
      var sb = borne(sb0 + sa * d * 0.8, -1.4, 1.4), fr = Math.max(0, -sb);
      U.morceaux(U.ech([[20 * d, -8 - sb * 2], [12 * d, -12 - sb * 3.2 - si * 0.8], [4 * d, -9 - sb * 1 + fr * 3.4 - si * 4]], 8), TETE, V).forEach(function(run){
        var pts = run.map(function(p){ return pose(p[0], p[1], V); });
        if(Math.abs(pts[0][0] - pts[pts.length - 1][0]) > 1.6) sc += PT(U.poly(pts, false), K.chev.c[2], (f.sexe === 'm' ? 3 : 2.4) + 0.5 * Math.min(1, Math.abs(sb) + si));
      });
    });
  }
  return {peau:dPeau, svg:s, oreille:'', sourcils:sc, contour:ct};
};
})(window);


/* moteur des héros en volume (jeu/heros-vues/src/hv-cheveux.js) */
/* ==========================================================
   Les héros « en volume » — 3 sur 5 : LES CHEVEUX.
   La chevelure est un volume posé autour de la tête (HV.COIFFE), un peu plus gros qu'elle. Une coiffure dit :
   - zone : jusqu'où les cheveux descendent sur le tour de la tête, à chaque hauteur (la ligne des cheveux : le front, la tempe,
     le tour de l'oreille, la nuque) ;
   - frange : le bord de la frange, comme on le voit de face (le même tracé que dans persos.js), posé sur le volume ;
   - meches : des mèches libres, données dans l'espace (devant l'oreille, sur l'épaule…) ;
   - queue : une queue de cheval, une chaîne de points dans l'espace (elle suit la tête avec un peu de retard) ;
   - fils : les séparations des mèches (de face, et sur le côté et l'arrière de la tête).
   À chaque vue on dessine deux masses : celle de derrière (tout le volume des cheveux, avant le visage) et celle de devant
   (la calotte qu'on voit + la frange + les mèches, après le visage).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, O = HV.O, RAD = HV.RAD;
var f1 = U.f1, borne = U.borne, vers = U.vers, coupe = U.coupe, table = U.table, leve = U.leve, PF = U.PF, PT = U.PT, PC = U.PC;

function rond(y, y0, h){ var k = (y - y0) / h; return Math.sqrt(Math.max(0, 1 - k * k)); }
/* (la clarté des cheveux : sur des cheveux très sombres, les traits sombres ne se voient pas — on les trace en clair) */
function lum2(K){ var hx = K.chev.c[1].replace('#', ''); return (parseInt(hx.substr(0, 2), 16) * 0.3 + parseInt(hx.substr(2, 2), 16) * 0.59 + parseInt(hx.substr(4, 2), 16) * 0.11) / 255; }
var T_AH = table([[4, 31.5], [8, 29.6], [12, 25.2], [15, 18.4], [17, 9.4], [18, 0.02]]);
var T_CBH = table([[0, 35.5], [6, 33], [10, 29.6], [14, 23.2], [17, 13], [18, 0.02]]);
function coupeCoiffe(y){
  var a = y <= -12 ? 31.5 * rond(y, -12, 45) : y <= 4 ? 31.5 : T_AH(y);
  var cf = y <= -8 ? 30 * rond(y, -8, 49) : 30;
  var cb = y <= -16 ? 35.5 * rond(y, -16, 41) : y <= 0 ? 35.5 : T_CBH(y);
  return coupe(a, -3, cf, cb, HV.carrure(y), 2);
}
var COIFFE = HV.COIFFE = U.volume(-57, 18, coupeCoiffe);

function lineaire(T){
  return function(y){
    var n = T.length, i;
    if(y <= T[0][0]) return T[0][1];
    if(y >= T[n - 1][0]) return T[n - 1][1];
    for(i = 0; i < n - 1; i++) if(y <= T[i + 1][0]) break;
    return vers(T[i][1], T[i + 1][1], (y - T[i][0]) / (T[i + 1][0] - T[i][0]));
  };
}
/* poser un point de la frange. Passé le bord, la mèche ne s'aplatit pas en un trait : elle garde un peu d'épaisseur et fait le
   tour du bord (une mèche vue par la tranche) */
var HO = 0;      /* (elle baisse la tête, vue de face : la frange descend sur le front — hv-tete.js fait glisser le visage) */
function poseC(x, y, V){
  if(HO) y += HO * U.doux(-42, -28, y);
  var S = COIFFE.a(y, V.w), sg = V.s > 0 ? 1 : V.s < 0 ? -1 : 0, xh = U.xBord(S, V), d = sg * x - xh;
  if(sg && d > 0) return [leve(S, sg * xh, V, true) + sg * 2.6 * Math.sin(Math.PI * Math.min(1, d / 6)) * U.doux(-41, -27, y), y];
  return [leve(S, x, V, true), y];
}
/* un point de la surface de la chevelure : t (degrés autour de la tête, 0 devant), y, r : de combien il s'en écarte → {p : [X, y], vu} */
function surC(td, y, V, r){
  var S = COIFFE.a(y, V.w), t = td * RAD, q = U.point(S, t);
  if(r){ q = [q[0] + r * Math.sin(t), q[1] + r * Math.cos(t)]; }
  return {p:[U.ecranX(q, V), y], vu:U.visible(S, t, V), f:U.fond(q, V)};
}

/* ---------- La calotte : ce qu'on voit des cheveux sur la tête (devant le visage : rien, c'est la « fenêtre » du visage) ---------- */
function calotte(V, zone, y0, y1){
  var rows = [], n = Math.round((y1 - y0) / 2.5), i, y;
  for(i = 0; i <= n; i++){
    y = y0 + (y1 - y0) * i / n;
    var S = COIFFE.a(y, V.w), b = U.bords(S, V), H = U.horizons(S, V), th = zone(y) * RAD, r = {y:y, g:b[0], d:b[1], ig:null, id:null};
    if(th > 0.02){
      var t0 = 0;
      while(t0 - H[2] > Math.PI) t0 -= 2 * Math.PI;
      while(t0 - H[2] < -Math.PI) t0 += 2 * Math.PI;
      var wa = Math.max(H[0], t0 - th), wb = Math.min(H[1], t0 + th);
      if(wb > wa + 1e-4){ r.ig = borne(U.ecranX(U.point(S, wa), V), b[0], b[1]); r.id = borne(U.ecranX(U.point(S, wb), V), b[0], b[1]); }
    }
    rows.push(r);
  }
  var iw = -1;
  for(i = 0; i <= n; i++) if(rows[i].ig !== null){ iw = i; break; }
  var ext = [], k;
  if(iw < 0){
    for(k = n; k >= 0; k--) ext.push([rows[k].g, rows[k].y]);
    for(k = 1; k <= n; k++) ext.push([rows[k].d, rows[k].y]);
    return {d:U.lisse(ext), rows:rows};
  }
  /* de chaque côté de la fenêtre, une « jambe » de cheveux, tant qu'elle a de la largeur */
  var jg = iw - 1, jd = iw - 1;
  for(k = iw; k <= n && rows[k].ig !== null && rows[k].ig - rows[k].g > 0.5; k++) jg = k;
  for(k = iw; k <= n && rows[k].id !== null && rows[k].d - rows[k].id > 0.5; k++) jd = k;
  jg = Math.max(jg, 0); jd = Math.max(jd, 0);
  for(k = jg; k >= 0; k--) ext.push([rows[k].g, rows[k].y]);
  for(k = 1; k <= jd; k++) ext.push([rows[k].d, rows[k].y]);
  var inte = [];
  for(k = jd; k >= iw; k--) inte.push([rows[k].id, rows[k].y]);
  for(k = iw; k <= jg; k++) inte.push([rows[k].ig, rows[k].y]);
  if(inte.length < 2) return {d:U.lisse(ext), rows:rows};
  return {d:'M' + U.pp(ext[0]) + U.courbe(ext, true) + ' L ' + U.pp(inte[0]) + U.courbe(inte, true) + ' Z', rows:rows};
}
/* ---------- La masse de derrière : tout le volume des cheveux (même ce qui est tourné de l'autre côté) ---------- */
function masseDos(V, zone, y0, y1){
  var Gp = [], D = [], n = Math.round((y1 - y0) / 2.5), i, y, t;
  for(i = 0; i <= n; i++){
    y = y0 + (y1 - y0) * i / n;
    var S = COIFFE.a(y, V.w), th = zone(y) * RAD, b = U.bords(S, V), lo, hi;
    if(th < 0.02){ lo = b[0]; hi = b[1]; }
    else {
      lo = 1e9; hi = -1e9;
      for(t = th; t <= 2 * Math.PI - th + 1e-6; t += 0.105){ var X = U.ecranX(U.point(S, t), V); if(X < lo) lo = X; if(X > hi) hi = X; }
      var Xf = U.ecranX(U.point(S, 2 * Math.PI - th), V); if(Xf < lo) lo = Xf; if(Xf > hi) hi = Xf;
      var H = U.horizons(S, V), tD = ((H[1] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), tG = ((H[0] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if(tD >= th && tD <= 2 * Math.PI - th) hi = b[1];
      if(tG >= th && tG <= 2 * Math.PI - th) lo = b[0];
      if(lo > hi){ lo = hi = (b[0] + b[1]) / 2; }
    }
    Gp.push([lo, y]); D.push([hi, y]);
  }
  return U.ferme({G:Gp, D:D});
}

/* ---------- Une chaîne dans l'espace → des points à l'écran ---------- */
function cr3(P, n){
  var r = [], i, j, m = P.length;
  for(i = 0; i < m - 1; i++){
    var a = P[Math.max(i - 1, 0)], b = P[i], c2 = P[i + 1], d = P[Math.min(i + 2, m - 1)];
    for(j = 0; j < n; j++){
      var t = j / n, t2 = t * t, t3 = t2 * t, q = [];
      for(var k = 0; k < 3; k++) q.push(0.5 * (2 * b[k] + (-a[k] + c2[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c2[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c2[k] + d[k]) * t3));
      r.push(q);
    }
  }
  r.push(P[m - 1].slice());
  return r;
}
function ecran3(L, V){ return L.map(function(q){ return [q[0] * V.c + q[2] * V.s, q[1], -q[0] * V.s + q[2] * V.c]; }); }

/* le nœud de la queue de cheval (persos.js, ruban()) */
function noeud(K, x, y, k){
  k = k || 1;
  return '<g transform="translate(' + f1(x) + ' ' + f1(y) + ') scale(' + k + ')"><path d="M0 0 l-9 -5 l1 10 Z M0 0 l9 -5 l-1 10 Z" fill="' + K.u('acc') + '"' + U.c(1.4) + '/><circle r="3" fill="' + K.u('acc') + '"' + U.c(1.2) + '/></g>';
}
/* la bande de lumière sur le crâne (persos.js, eclat() ; elle s'éteint vers le bas) */
function anneau(K, cx, cy, rx, ry, a0, a1, n, h){
  var i, m = 2 * n;
  function Pn(a, d){ return [cx + Math.cos(a * RAD) * (rx - d), cy + Math.sin(a * RAD) * (ry - d)]; }
  var d = 'M' + U.pp(Pn(a0, 0)) + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + U.pp(Pn(a1, 0));
  for(i = m; i >= 0; i--){
    var a = a0 + (a1 - a0) * i / m, t = Math.sin(Math.PI * i / m);
    d += ' L ' + U.pp(Pn(a, (i % 2 ? h * (i % 4 === 1 ? 1 : 0.72) : h * 0.28) * (0.35 + 0.65 * t) + 1.4 * t));
  }
  return '<path d="' + d + ' Z" fill="' + K.u('chevL') + '" opacity=".75"/>';
}

/* ==========================================================
   Les coiffures
   ========================================================== */
var COIFFURES = HV.COIFFURES = {};
COIFFURES.queue = {
  /* (les cheveux passent au-dessus de l'oreille puis derrière elle : elle est dégagée) */
  zone:lineaire([[-57, 0], [-31, 0], [-29, 28], [-26, 46], [-20, 62], [-12, 72], [-7.5, 80], [-5.5, 112], [6, 116], [10, 130], [14, 158], [16.5, 180]]),
  /* la frange, vue de face : son bord du bas (le tracé de persos.js), fermée par le haut du crâne */
  frange:'M44 -42 L 44 -12 L 31 -3 C 28 -12 25 -18 20 -23 C 18 -14 14 -8 8 -4 C 10 -14 8 -22 2 -29 C -4 -19 -12 -13 -22 -10 C -18 -16 -16 -22 -16 -28 C -20 -19 -25 -11 -30 -2 L -44 -12 L -44 -42 Z',
  /* le creux sombre sous la grande mèche */
  creux:['M20 -23 C 18 -14 14 -8 8 -4 C 10 -14 8 -22 2 -29 C 10 -30 16 -28 20 -23 Z'],
  filsFace:[[[-25, -12], [-22, -26], [-12, -40]], [[-14, -13], [-8, -26], [0, -38]], [[9, -8], [13, -22], [10, -36]], [[24, -20], [26, -32], [20, -44]], [[-8, -54], [-18, -46], [-26, -34]], [[16, -53], [25, -46], [30, -36]]],
  /* sur le côté et l'arrière : les cheveux tirés vers la queue de cheval ([degrés autour de la tête, y] ; l'autre côté est en miroir) */
  filsCote:[[[70, -8], [105, -24], [152, -42]], [[60, -23], [100, -37], [146, -49]], [[82, 1], [118, -11], [162, -33]], [[110, 8], [136, -3], [170, -25]], [[36, -41], [88, -48], [140, -53]]],
  /* les deux mèches devant les oreilles : [points dans l'espace x, y, z], largeur */
  meches:[{p:[[-28.5, -12, 6], [-33, 4, 3], [-32.2, 18, 3], [-27, 31, 5.5]], w:8}, {p:[[28.5, -12, 6], [33, 4, 3], [32.2, 18, 3], [27, 31, 5.5]], w:8},
    /* deux petites mèches folles qui cassent le contour du crâne */
    {p:[[-13, -52, 8], [-17.5, -57, 6], [-22.5, -56.6, 4]], w:3.4}, {p:[[11, -55, 2], [10.5, -60, 0], [7, -62, -2]], w:3.2}],
  /* la queue de cheval : attachée haut derrière la tête */
  queue:{p:[[3, -51, -21], [9, -65, -33], [13, -51, -47], [13, -16, -50], [10, 22, -44], [13, 66, -38]],
    larg:table([[0, 4.4], [0.1, 6.4], [0.28, 7.4], [0.6, 6.4], [0.85, 3.9], [1, 0.3]]),
    brin:{de:0.34, p:[[19, 8, -48], [23, 46, -41]], w:4.2}}
};

/* LES CHEVEUX COURTS EN BOUCLES (l'Alchimiste du donjon, garçon, cheveux noirs : Romain, 23 novembre, 20 h 05 : « tu peux lancer
   l'alchimiste ») : la nuque dégagée, une frange courte en mèches pointues, des boucles qui cassent le tour du crâne. Première
   version, à faire valider. */
COIFFURES.courts = {
  zone:lineaire([[-57, 0], [-33, 0], [-30, 30], [-26, 50], [-18, 64], [-10, 72], [-6, 84], [-3, 108], [2, 128], [6, 150], [9, 180]]),
  frange:'M44 -42 L 44 -16 L 34 -12 C 30 -18 27 -21 24 -23 C 22 -17 19 -14 15 -12 C 15 -18 13 -23 9 -26 C 6 -20 2 -17 -3 -15 C -2 -21 -4 -25 -7 -28 C -10 -22 -14 -18 -19 -16 C -18 -21 -19 -25 -22 -27 C -25 -21 -29 -16 -34 -13 L -44 -16 L -44 -42 Z',
  filsFace:[[[-24, -16], [-22, -28], [-14, -40]], [[-6, -18], [-4, -30], [2, -42]], [[12, -15], [14, -28], [10, -40]], [[26, -18], [26, -30], [20, -42]]],
  /* (Romain, 20 h 32 : les petites boucles dessinées sur le crâne, « très très très moche » — enlevées. À la place : des mèches
     ondulées sur les côtés et l'arrière de la tête (on ne dessine que la partie tournée vers nous : elles glissent quand il tourne),
     et quelques grosses ondulations douces sur le contour) */
  /* (les mèches tirées vers le chignon : elles partent du front et des tempes et finissent toutes à l'arrière, là où il est) */
  filsCote:[[[30, -54], [80, -56], [130, -52], [168, -46]], [[50, -40], [92, -48], [136, -48], [170, -43]], [[72, -24], [108, -34], [144, -40], [172, -40]],
    [[92, -8], [124, -20], [152, -32], [174, -37]], [[112, 4], [140, -10], [162, -26], [176, -34]]],
  /* LE CHIGNON (Romain, 20 h 36) : une boule de cheveux roulés à l'arrière du crâne ([x, y, z] de son milieu, son rayon) */
  chignon:{c:[0, -36, -39], r:16}
};

/* LA LONGUE TRESSE À PERLES (le Sage du donjon, fille, cheveux noirs : Romain, 23 novembre, 22 h 21 : « tu peux passer au sage ») :
   la raie au milieu, les cheveux tirés en arrière, une longue tresse attachée à la nuque qui descend dans le dos jusqu'à la taille,
   des perles dorées enfilées dedans (queue.tresse, queue.perles) */
COIFFURES.tresse = {
  zone:lineaire([[-57, 0], [-31, 0], [-29, 28], [-26, 46], [-20, 62], [-12, 72], [-7.5, 80], [-5.5, 112], [6, 116], [10, 130], [14, 158], [16.5, 180]]),
  /* (la raie au milieu : deux bandeaux qui partent du sommet du front et descendent vers les tempes) */
  frange:'M44 -42 L 44 -8 L 33 -1 C 30 -12 24 -22 8 -29 C 5 -30 2 -31 0 -33 C -2 -31 -5 -30 -8 -29 C -24 -22 -30 -12 -33 -1 L -44 -8 L -44 -42 Z',
  filsFace:[[[-1, -34], [-14, -29], [-27, -14]], [[1, -34], [14, -29], [27, -14]], [[-3, -42], [-17, -37], [-31, -22]], [[3, -42], [17, -37], [31, -22]], [[0, -50], [-12, -48], [-24, -40]], [[0, -50], [12, -48], [24, -40]]],
  filsCote:[[[70, -8], [105, -14], [160, -18]], [[60, -23], [100, -27], [150, -24]], [[82, 1], [118, -2], [166, -10]], [[110, 8], [136, 4], [172, -4]], [[36, -41], [88, -38], [140, -30]]],
  /* (deux petites mèches folles sur le front, de chaque côté de la raie) */
  meches:[{p:[[-6, -32, 22], [-11, -26, 22], [-14, -18, 21]], w:2.6}, {p:[[6, -32, 22], [11, -26, 22], [14, -18, 21]], w:2.6}],
  queue:{p:[[0, -12, -38], [2, 8, -44], [4, 40, -45], [5, 74, -43], [6, 108, -41], [6, 140, -39], [5, 158, -38]],
    larg:table([[0, 5.6], [0.08, 7.4], [0.5, 6.8], [0.88, 5.4], [0.94, 4.6], [1, 1.4]]),
    tresse:true, perles:[0.28, 0.46, 0.64, 0.82]}
};

/* ==========================================================
   HV.cheveux(K, coif, V, P) → {dos, devant, ombre}  (P : {qx, qz : le balancement du bout de la queue de cheval})
   ========================================================== */
HV.cheveux = function(K, coif, V, P){
  P = P || {};
  var dos = '', L = [], fils = '', i, sg = V.s >= 0 ? 1 : -1, face = V.c > -0.3;
  HO = borne((P.hocheF || 0) * 0.16, -3, 5);
  /* --- la queue de cheval --- */
  var Q = coif.queue, queue = '';
  if(Q){
    var C3 = cr3(Q.p, 7), nq = C3.length - 1, qx = P.qx || 0, qz = P.qz || 0;
    C3.forEach(function(q, j){ var k = Math.pow(j / nq, 1.6); q[0] += qx * k; q[2] += qz * k; q[1] -= (Math.abs(qx) + Math.abs(qz)) * 0.12 * k; });
    /* (allongée sur le dos, P.couche : la queue de cheval ne pend plus, elle s'étale au sol au-dessus de sa tête) */
    var cq = Math.max(0, Math.min(1, P.couche || 0));
    if(cq) C3.forEach(function(q, j){ var a = C3[0][1], k = Math.min(1, j / nq * 1.6); q[1] += (2 * a - 2 * q[1]) * cq * k * 0.85; q[2] -= 10 * cq * k; });
    /* (une chaîne de gélules, comme la queue de Mimi : vue par le bout, elle reste ronde) */
    var E = ecran3(C3, V), Lq = [U.ruban(E, function(t){ return Q.larg(t); })], jq;
    for(jq = 0; jq < nq - 1; jq++) Lq.push(U.gelule(E[jq][0], E[jq][1], Q.larg(jq / nq) - 0.25, E[jq + 1][0], E[jq + 1][1], Q.larg((jq + 1) / nq) - 0.25));
    if(Q.brin){
      var i0 = Math.round(Q.brin.de * nq), B3 = cr3([C3[i0]].concat(Q.brin.p.map(function(q){ return [q[0] + qx * 0.8, q[1], q[2] + qz * 0.8]; })), 5);
      Lq.push(U.meche(ecran3(B3, V), Q.brin.w * 2, 0.8, 0.3));
    }
    queue += U.masse(Lq, K.u('chevQ'));
    /* ses fils, sa lumière */
    var nrm = function(j, k){ var a = E[Math.max(j - 1, 0)], z = E[Math.min(j + 1, nq)], dx = z[0] - a[0], dy = z[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = Q.larg(j / nq) * k; return [E[j][0] - dy / l * w, E[j][1] + dx / l * w]; };
    var f1q = [], f2q = [], lum = [];
    for(i = 2; i < nq - 1; i++){ f1q.push(nrm(i, 0.42)); if(i > 4) f2q.push(nrm(i, -0.38)); if(i > 2 && i < nq - 5) lum.push(nrm(i, sg * 0.62 * (E[i][0] > E[0][0] ? 1 : 1))); }
    /* (vue par le bout, la queue est trop courte à l'écran pour ses fils) */
    var longQ = Math.abs(E[nq][0] - E[0][0]) + Math.abs(E[nq][1] - E[Math.round(nq * 0.2)][1]), opQ = U.doux(70, 110, longQ);
    if(Q.tresse){
      /* LA TRESSE : des mèches croisées, en biais d'un bord à l'autre, une fois d'un côté, une fois de l'autre ; un reflet sur chaque
         maille ; (sur des cheveux noirs, les traits sont clairs, sinon on ne les voit pas) */
      var trT = lum2(K) < 0.25 ? K.chev.c[0] : K.chev.c[2], mailles = '', reflets = '';
      for(i = 1; i < nq - 1; i++){
        var sgm = i % 2 ? 1 : -1, a0 = nrm(i, -0.92 * sgm), a1 = nrm(i + 1, 0.92 * sgm), mm = nrm(i, 0.1 * sgm);
        mailles += 'M' + f1(a0[0]) + ' ' + f1(a0[1]) + ' Q' + f1(mm[0]) + ' ' + f1(mm[1]) + ' ' + f1(a1[0]) + ' ' + f1(a1[1]) + ' ';
        var h0 = nrm(i, 0.35 * sgm), h1 = nrm(i + 1, -0.05 * sgm);
        reflets += 'M' + f1(h0[0]) + ' ' + f1(h0[1]) + ' L' + f1((h0[0] + h1[0]) / 2) + ' ' + f1((h0[1] + h1[1]) / 2) + ' ';
      }
      queue += '<path d="' + mailles + '" fill="none" stroke="' + trT + '" stroke-width="1.7" stroke-linecap="round" opacity="' + f1(0.75 * Math.max(0.3, opQ)) + '"/>' +
        '<path d="' + reflets + '" fill="none" stroke="' + K.chev.hl + '" stroke-width="1.6" stroke-linecap="round" opacity="' + f1(0.5 * Math.max(0.3, opQ)) + '"/>';
      /* les perles dorées enfilées dans la tresse */
      (Q.perles || []).forEach(function(t){ var j2 = Math.round(t * nq), pq = E[j2], rr = Math.max(3.2, Q.larg(t) * 0.62);
        queue += '<circle cx="' + f1(pq[0]) + '" cy="' + f1(pq[1]) + '" r="' + f1(rr) + '" fill="#e8b84a" stroke="' + O + '" stroke-width="1.6"/><circle cx="' + f1(pq[0] - rr * 0.35) + '" cy="' + f1(pq[1] - rr * 0.35) + '" r="' + f1(rr * 0.3) + '" fill="#fff3c8"/>'; });
      queue += noeud(K, E[nq - 1][0], E[nq - 1][1], 0.7);
    } else if(opQ > 0.02){
      queue += '<g fill="' + K.chev.c[2] + '" opacity="' + f1(0.42 * opQ) + '">' + PF(U.filet(f1q, 1.6), K.chev.c[2]) + PF(U.filet(f2q, 1.5), K.chev.c[2]) + '</g>';
      queue += PF(U.filet(lum, 2), K.chev.hl, ' opacity="' + f1(0.4 * opQ) + '"');
    }
    queue += noeud(K, E[0][0], E[0][1] + 1, 0.92);
  }
  var zq = Q ? -Q.p[2][0] * V.s + Q.p[2][2] * V.c : -1;
  /* --- LE CHIGNON (Romain, 23 novembre, 20 h 36 : « elle a fait un chignon. Donc le chignon, il est à l'arrière. Donc quand on se
     retourne, on le voit, il est toujours à l'arrière. Et quand on est de dos, on l'a au premier plan ») : une boule de cheveux
     roulés, posée à l'arrière du crâne, dans l'espace ; comme la queue de cheval, elle passe devant la tête quand on la voit de dos,
     derrière elle sinon (de face, la tête la cache ; de profil, elle dépasse derrière la tête) --- */
  var CHG = coif.chignon;
  if(CHG){
    var cc = CHG.c, cx = cc[0] * V.c + cc[2] * V.s + (P.qx || 0) * 0.15, cy = cc[1], R = CHG.r, ri = R * 0.62;
    queue += U.masse(['M' + f1(cx - R) + ' ' + f1(cy) + ' a' + f1(R) + ' ' + f1(R * 0.94) + ' 0 1 0 ' + f1(2 * R) + ' 0 a' + f1(R) + ' ' + f1(R * 0.94) + ' 0 1 0 ' + f1(-2 * R) + ' 0 Z'], K.u('chevQ'));
    /* (les cheveux enroulés : une spirale, et un reflet en haut à gauche) */
    var tr = lum2(K) < 0.25 ? K.chev.c[0] : K.chev.c[2];
    queue += '<path d="M' + f1(cx + ri) + ' ' + f1(cy + 1) + ' A' + f1(ri) + ' ' + f1(ri * 0.94) + ' 0 1 0 ' + f1(cx - 1) + ' ' + f1(cy - ri) + ' M' + f1(cx + ri * 0.45) + ' ' + f1(cy + ri * 0.3) + ' A' + f1(ri * 0.5) + ' ' + f1(ri * 0.48) + ' 0 1 0 ' + f1(cx + 1) + ' ' + f1(cy - ri * 0.55) +
      ' M' + f1(cx - R * 0.9) + ' ' + f1(cy + R * 0.25) + ' Q' + f1(cx - R * 0.4) + ' ' + f1(cy + R * 1.05) + ' ' + f1(cx + R * 0.55) + ' ' + f1(cy + R * 0.75) + '" fill="none" stroke="' + tr + '" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M' + f1(cx - R * 0.7) + ' ' + f1(cy - R * 0.25) + ' Q' + f1(cx - R * 0.55) + ' ' + f1(cy - R * 0.8) + ' ' + f1(cx - R * 0.05) + ' ' + f1(cy - R * 0.85) + '" fill="none" stroke="' + K.chev.hl + '" stroke-width="2" stroke-linecap="round" opacity=".55"/>';
    zq = -cc[0] * V.s + cc[2] * V.c;
  }
  /* --- la masse de derrière --- */
  var bcl = (coif.boucles || []).map(function(b){ var q = ecran3([b], V)[0]; return U.gelule(q[0], q[1], b[3], q[0], q[1], b[3]); });
  var masse = U.masse([masseDos(V, coif.zone, -57, 18)].concat(bcl), K.u('chevB'));
  /* --- les mèches libres : devant si elles sont de notre côté, sinon derrière le visage --- */
  var mDos = [], mDev = [];
  (coif.meches || []).forEach(function(m){
    var C3m = cr3(m.p.map(function(q, j){ var k = Math.pow(j / (m.p.length - 1), 1.5) * 0.22; return [q[0] + (P.qx || 0) * k, q[1], q[2] + (P.qz || 0) * k]; }), 5), Em = ecran3(C3m, V), mil = Em[Math.floor(Em.length / 2)], d = U.meche(Em, m.w, 0.9, 0.3);
    var trait = PF(U.filet(Em.slice(2, Em.length - 3).map(function(p){ return [p[0] + 0.6, p[1]]; }), 1.2), K.chev.c[2], ' opacity=".4"');
    if(mil[2] > -1){ mDev.push(d); fils += trait; } else mDos.push(d);
  });
  dos += masse + (mDos.length ? U.masse(mDos, K.u('chevU')) : '');
  /* --- la masse de devant : la calotte, la frange, les mèches --- */
  var cal = calotte(V, coif.zone, -57, 18);
  L.push(cal.d);
  var ombre = '';
  if(coif.frange && face){
    var fr = U.points(coif.frange, 9).map(function(sp){ return U.poly(U.coupeBord(sp, COIFFE, V, 6).map(function(p){ return poseC(p[0], p[1], V); })); }).join(' ');
    L.push(fr); ombre = fr;
  }
  L = L.concat(mDev);
  if(mDev.length) ombre += ' ' + mDev.join(' ');
  var cid = K.n('chv'), dev = U.masse(L, K.u('chevU'));
  dev += '<clipPath id="' + cid + '">' + L.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</clipPath>';
  var dans = '';
  if(face){
    (coif.creux || []).forEach(function(d){ dans += PF(U.points(d, 8).map(function(sp){ return U.poly(U.coupeBord(sp, COIFFE, V).map(function(p){ return poseC(p[0], p[1], V); })); }).join(' '), K.chev.c[2], ' opacity=".3"'); });
    var ff = '';
    (coif.filsFace || []).forEach(function(t){
      var pts = U.ech(t, 7), vus = pts.filter(function(p){ return !U.cache(COIFFE.a(p[1], V.w), p[0], V); });
      if(vus.length >= 5) ff += '<path d="' + U.filet(vus.map(function(p){ return poseC(p[0], p[1], V); }), 1.5) + '"/>';
    });
    dans += '<g fill="' + K.chev.c[2] + '" opacity=".45">' + ff + '</g>';
  }
  /* les fils du côté et de l'arrière : seulement la partie tournée vers nous */
  var fc = '';
  (coif.filsCote || []).forEach(function(t){
    [1, -1].forEach(function(d){
      var pts = U.ech(t, 10), run = [];
      function vider(){ if(run.length >= 4) fc += '<path d="' + U.filet(run, 1.5) + '"/>'; run = []; }
      pts.forEach(function(p){ var q = surC(p[0] * d, p[1], V); if(q.vu) run.push(q.p); else vider(); });
      vider();
    });
  });
  /* (sur des cheveux très sombres — noirs —, un trait sombre ne se voit pas : les mèches sont alors tracées en clair) */
  dans += lum2(K) < 0.25 ? '<g fill="' + K.chev.c[0] + '" opacity=".55">' + fc + '</g>' : '<g fill="' + K.chev.c[2] + '" opacity=".4">' + fc + '</g>';
  /* LES BOUCLES VUES SUR LE CRÂNE (Romain, 23 novembre, 20 h 24 : « quand on tourne, l'arrière de sa coiffure, elle bouge pas. Ça,
     c'est pas normal ») : chaque boucle tournée vers nous est dessinée là où elle est sur la tête (un petit « c » sombre et un reflet) ;
     elles glissent quand la tête tourne, passent derrière le bord, et celles de l'autre côté arrivent */
  if(coif.boucles && coif.bouclesVues){
    coif.boucles.forEach(function(b){
      var ny = b[1] + 26, nl = Math.sqrt(b[0] * b[0] + ny * ny + b[2] * b[2]) || 1, f = (-b[0] * V.s + b[2] * V.c) / nl;
      if(f < 0.08) return;
      var q = ecran3([b], V)[0], r = b[3] * 0.72, sx = r * (0.5 + 0.5 * f);
      dans += '<path d="M' + f1(q[0] - sx) + ' ' + f1(q[1] + r * 0.15) + ' A' + f1(sx) + ' ' + f1(r) + ' 0 1 1 ' + f1(q[0] + sx * 0.75) + ' ' + f1(q[1] + r * 0.65) + '" fill="none" stroke="' + K.chev.c[2] + '" stroke-width="1.5" stroke-linecap="round" opacity="' + f1(0.3 + 0.35 * f) + '"/>' +
        '<path d="M' + f1(q[0] - sx * 0.55) + ' ' + f1(q[1] - r * 0.25) + ' Q' + f1(q[0] - sx * 0.1) + ' ' + f1(q[1] - r * 0.85) + ' ' + f1(q[0] + sx * 0.5) + ' ' + f1(q[1] - r * 0.45) + '" fill="none" stroke="' + K.chev.hl + '" stroke-width="1.5" stroke-linecap="round" opacity="' + f1(0.4 * f) + '"/>';
    });
  }
  /* la lumière : elle ne tourne pas avec la tête (elle reste en haut à gauche) ; elle suit seulement le milieu du crâne */
  var bm = U.bords(COIFFE.a(-26, V.w), V), cx = (bm[0] + bm[1]) / 2, kx = (bm[1] - bm[0]) / 63;
  dans += '<g transform="translate(' + f1(cx + 1) + ' 0) scale(' + f1(kx) + ' 1)">' + anneau(K, 0, -26, 26, 25, 208, 332, 6, 5.5) + '</g>';
  dev += '<g clip-path="url(#' + cid + ')">' + dans + '</g>' + fils;
  /* un liseré de lumière sur le haut du crâne, à gauche */
  var lis = [];
  cal.rows.forEach(function(r){ if(r.y > -52 && r.y < -22) lis.push([r.g + 2.6, r.y]); });
  if(lis.length > 3) dev += PT(U.courbe(lis.reverse()), K.chev.hl, 1.6, ' opacity=".5"');
  /* La queue de cheval est attachée derrière la tête : elle ne passe devant (la tête, le dos, les bras) que si on la voit de dos.
     De face et de profil, elle est derrière tout le reste (Romain, 23 novembre, 13 h 36 : « on voit un bout de sa tresse devant
     le bras, alors que normalement la tresse est censée être derrière »). */
  return {queue:queue, queueDevant:zq > 6 && V.c < -0.3, dos:dos, devant:dev, ombre:ombre};
};
})(window);


/* moteur des héros en volume (jeu/heros-vues/src/hv-corps.js) */
/* ==========================================================
   Les héros « en volume » — 4 sur 5 : LE CORPS (le buste et la tunique, les bras, les mains, les jambes, la ceinture, le baudrier,
   le carquois, l'arc). Les mesures sont celles de persos.js : le cadre 300 × 440, le milieu à x = 150, le sol à y = 414.
   Ici x est compté depuis le milieu du héros (x > 0 : SA gauche, donc la droite de l'écran quand il est de face), z vers l'avant.

   LE CORPS SE PLIE (Romain, 23 novembre, 11 h 22 et 12 h 39 : « des poses accroupies, les deux mains posées au sol, avec la
   pliure du corps logique » ; « go pour le corps qui se plie et les mains »).
   - LE TRONC est une chaîne, comme le corps de Mimi : le bassin (où il est, comment il penche), puis le dos qui se courbe peu à
     peu jusqu'aux épaules (en avant, sur le côté, en vrille). À chaque hauteur du buste « au repos » (y de 137 à 272), on sait où
     est passée sa coupe et comment elle est tournée (tronc().fr). Le bas de la tunique suit les cuisses : il se drape dessus.
   - Le contour du buste : la réunion des coupes vues sous l'angle voulu (des « coques » qui se chevauchent, coques()). C'est
     exact debout, penché, accroupi, vu de face comme de profil — aucune image n'est tournée ni écrasée.
   - Tout ce qui est SUR le buste (la ceinture, le baudrier, le col, les plis, les coutures) est posé sur ces coupes (T.pt, T.face,
     T.anneau) : il suit donc la pliure. Les épaules, les hanches, le cou, le carquois sont accrochés au tronc.
   - Les bras et les jambes : des os dans l'espace (épaule, coude, poignet ; hanche, genou, cheville). On dit où poser la main
     ou le pied, le coude et le genou se placent tout seuls (ik3). Le bassin descend, les pieds restent au sol.
   - Ce qui est près du sol est vu d'un peu au-dessus (ksol) : une main posée devant les pieds est plus bas à l'écran.
   - LA TUNIQUE EST D'UN SEUL TENANT (Romain, 23 novembre, 11 h : « que le bras soit intégré dans l'épaule […] un tout petit peu
     moins pantin ») : le buste et les manches ont UN seul contour et la même couleur.
   - Ce qui est d'un seul côté (l'arc dans SA main droite, le carquois sur SON épaule gauche, le baudrier en travers) reste de
     son côté quand le héros se tourne.
   - LES CACHES (<mask>) couvrent x -260 … 260, y -120 … 480 (le héros, l'arc, les bras tendus, couchée par terre) et pas plus :
     plus grands, chaque image coûte beaucoup plus cher à peindre (l'essai dans le donjon, 23 novembre : 10 → 16 images par seconde
     sur la machine d'essai) ; plus petits, ils couperaient un bras. Vérifié sur tous les films : pas un pixel ne change.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, O = HV.O, RAD = HV.RAD;
var f1 = U.f1, borne = U.borne, vers = U.vers, doux = U.doux, coupe = U.coupe, table = U.table, PF = U.PF, PT = U.PT, PC = U.PC, gelule = U.gelule;
var ANNEAU = 0.2;      /* ce qui est 10 plus près de nous est 2 plus bas à l'écran (les anneaux du buste) */
var PSOL = 0.13;       /* près du sol : ce qui est 10 plus près de nous est 1,3 plus bas (les pieds, les mains posées, un genou à terre) */
var SOL = 414, TAU = Math.PI * 2, Z3 = [0, 0, 0];

/* ---------- Le buste et la tunique (fille) : ses coupes, debout ---------- */
var T_A = table([[137, 12], [139, 22.5], [142, 29.5], [146, 33.5], [152, 34], [165, 32.5], [180, 30], [200, 28.5], [208, 29], [222, 32.5], [246, 40], [272, 47.5]]);
var T_F = table([[137, 9.5], [139, 11.5], [142, 13.5], [146, 15.5], [152, 18], [165, 20], [180, 18.5], [200, 16.5], [208, 17], [222, 19.5], [246, 24.5], [272, 30]]);
var T_B = table([[137, 9.5], [139, 11], [142, 13], [146, 14.5], [152, 15.5], [165, 16], [180, 15.5], [200, 14.5], [208, 15], [222, 18.5], [246, 23.5], [272, 28.5]]);
var BUSTE_F = HV.BUSTE = U.volume(137, 272, function(y){ return coupe(T_A(y), 0, T_F(y), T_B(y), 2.3, 2.3); });
/* ---------- LE CORPS D'HOMME (Romain, 23 novembre, 22 h 21 : « pour les hommes j'aimerais avoir un peu qu'on ait l'impression qu'ils
   soient plus costauds et une poitrine un peu plus large » ; 23 h 53 : « tu peux passer aux hommes, aux enfants, aux papys. Commence
   par les hommes. Tu peux reprendre tout ce que tu as fait, mais simplement la modélisation, il faut que le corps, il soit un peu
   différent pour les hommes ») ----------
   Le même squelette (les mêmes hauteurs : toutes les poses et tous les gestes marchent tels quels), mais un autre GABARIT : un buste en
   V — les épaules et la poitrine bien plus larges, une poitrine plus épaisse (les pectoraux), le dos plus large, la taille à peine
   marquée, les hanches pas plus larges que la poitrine ; les épaules plus écartées ; des bras, des jambes, un cou plus épais ; des
   mains un peu plus grandes. Le bas de la tunique (sous la ceinture) reste presque le même. */
var T_AH = table([[137, 15.5], [139, 29.5], [142, 38.5], [146, 43], [152, 44], [165, 42], [180, 37.5], [200, 34], [208, 33.5], [222, 34.5], [246, 41], [272, 47.5]]);
var T_FH = table([[137, 11.5], [139, 14], [142, 17], [146, 20], [152, 23.5], [165, 25], [180, 22.5], [200, 19.5], [208, 19], [222, 20.5], [246, 25], [272, 30]]);
var T_BH = table([[137, 11.5], [139, 14], [142, 17], [146, 19], [152, 20], [165, 20], [180, 18.5], [200, 16.5], [208, 16.5], [222, 18.5], [246, 23.5], [272, 28.5]]);
var BUSTE_H = HV.BUSTE_H = U.volume(137, 272, function(y){ return coupe(T_AH(y), 0, T_FH(y), T_BH(y), 2.4, 2.3); });
/* ---------- LES ENFANTS ET LES ANCIENS (Romain, 23 novembre, 23 h 53 : « aux enfants, aux papys » ; l'âge vient du jeu : adulte,
   enfant, âgé) ----------
   - L'ENFANT : le même squelette, dessiné plus petit (echelle : 0,84, posé sur le sol), avec une tête un peu plus grosse pour son corps
     (tete : 1,16) ; un buste mince, sans poitrine, un petit ventre rond ; les épaules étroites, des bras et des jambes plus fins, de
     petites mains. Garçon et fille : presque le même corps (le garçon, les épaules un peu plus larges).
   - LES ANCIENS (le papy, la mamie) : le corps d'homme ou de femme, avec un ventre (la tunique bombe devant, sous la poitrine), la
     taille plus large ; le dos un peu voûté (voute, en degrés : le haut du dos penche en avant), un tout petit peu plus petits.
   Comme pour l'homme : toutes les poses et tous les gestes marchent tels quels. */
var T_AE = table([[137, 10], [139, 18.5], [142, 24.5], [146, 27.5], [152, 28], [165, 27.5], [180, 27], [200, 27], [208, 27.5], [222, 30], [246, 36], [272, 42]]);
var T_FE = table([[137, 8.5], [139, 10], [142, 12], [146, 13.5], [152, 15], [165, 16], [180, 16.5], [200, 17], [208, 17], [222, 18], [246, 22], [272, 26.5]]);
var T_BE = table([[137, 8.5], [139, 10], [142, 11.5], [146, 13], [152, 14], [165, 14.5], [180, 14], [200, 13.5], [208, 14], [222, 17], [246, 21.5], [272, 26]]);
var BUSTE_E = HV.BUSTE_E = U.volume(137, 272, function(y){ return coupe(T_AE(y), 0, T_FE(y), T_BE(y), 2.2, 2.3); });
var T_AP = table([[137, 15.5], [139, 29], [142, 37.5], [146, 42], [152, 43], [165, 42], [180, 40], [200, 40], [208, 40.5], [222, 41], [246, 44], [272, 48.5]]);
var T_FP = table([[137, 11.5], [139, 14], [142, 17], [146, 20], [152, 23], [165, 26], [180, 30], [200, 35], [208, 35.5], [222, 32], [246, 27], [272, 30]]);
var BUSTE_P = HV.BUSTE_P = U.volume(137, 272, function(y){ return coupe(T_AP(y), 0, T_FP(y), T_BH(y), 2.3, 2.3); });
var T_AM = table([[137, 12], [139, 22], [142, 29], [146, 33], [152, 34], [165, 33.5], [180, 33], [200, 33.5], [208, 34], [222, 36], [246, 41.5], [272, 48]]);
var T_FM = table([[137, 9.5], [139, 11.5], [142, 13.5], [146, 15.5], [152, 18], [165, 20.5], [180, 21.5], [200, 24], [208, 24.5], [222, 24], [246, 25], [272, 30]]);
var BUSTE_M = HV.BUSTE_M = U.volume(137, 272, function(y){ return coupe(T_AM(y), 0, T_FM(y), T_B(y), 2.3, 2.3); });
/* les gabarits : le buste, où sont les épaules (ep) et les hanches (ha), l'épaisseur des bras (au haut du bras, au coude, au poignet),
   des jambes (jb : en plus), du cou (co : en plus), la taille des mains (ma) ; echelle : tout le héros, posé sur le sol ; tete : la
   tête en plus ; voute : le haut du dos penché en avant (degrés) */
var GABARITS = HV.GABARITS = {
  femme:{buste:BUSTE_F, ep:31.5, ha:13, rEp:10.6, rCo:9.3, rPo:8.3, jb:1, co:1, ma:1},
  homme:{buste:BUSTE_H, ep:38.5, ha:15, rEp:13.2, rCo:11.4, rPo:9.8, jb:1.12, co:1.28, ma:1.12},
  fille:{buste:BUSTE_E, ep:27, ha:11.5, rEp:9, rCo:8, rPo:7.2, jb:0.88, co:0.86, ma:0.92, echelle:0.84, tete:1.16},
  garcon:{buste:BUSTE_E, ep:28.5, ha:11.5, rEp:9.4, rCo:8.3, rPo:7.4, jb:0.9, co:0.9, ma:0.94, echelle:0.84, tete:1.16},
  mamie:{buste:BUSTE_M, ep:31, ha:13.5, rEp:10.4, rCo:9.1, rPo:8.1, jb:0.98, co:1, ma:1, echelle:0.96, voute:9},
  papy:{buste:BUSTE_P, ep:37.5, ha:15.5, rEp:12.6, rCo:11, rPo:9.6, jb:1.08, co:1.22, ma:1.1, echelle:0.96, voute:11}
};
var BUSTE = BUSTE_F, GAB = GABARITS.femme;
/* (le gabarit de ce dessin : posé au début de HV.corps — tout le dessin d'un héros se fait d'un seul coup, sans rien d'autre au milieu) */
function gabarit(K){
  GAB = GABARITS[K && K.corps] || GABARITS.femme;
  BUSTE = GAB.buste; R_EP = GAB.rEp; R_CO = GAB.rCo; R_PO = GAB.rPo;
  return GAB;
}

/* ---------- Les vecteurs, les rotations ---------- */
function add(a, b, k){ k = k == null ? 1 : k; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
function sub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function mul(a, k){ return [a[0] * k, a[1] * k, a[2] * k]; }
function lon(a){ return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
function uni(a){ var l = lon(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function dot(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function croix(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function mixv(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function mv(M, v){ return [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]]; }
function mm(A, B){ var R = [], i, j; for(i = 0; i < 3; i++) for(j = 0; j < 3; j++) R.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]); return R; }
var ID = [1, 0, 0, 0, 1, 0, 0, 0, 1];
/* se pencher en avant (a > 0 : le haut part vers l'avant) ; sur le côté (a > 0 : vers SA gauche) ; se tourner (comme cap) */
function RX(d){ if(!d) return ID; var a = d * RAD, c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, s, 0, -s, c]; }
function RZ(d){ if(!d) return ID; var a = d * RAD, c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
function RY(d){ if(!d) return ID; var a = d * RAD, c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
/* tourner d'un angle (radians) autour d'un axe */
function rotAxe(k, a){
  var c = Math.cos(a), s = Math.sin(a), t = 1 - c, x = k[0], y = k[1], z = k[2];
  return [c + t * x * x, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, c + t * y * y, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, c + t * z * z];
}
/* deux os (l1, l2) de l'attache A à la cible T ; pole : de quel côté va l'articulation → [l'articulation, le bout] */
function ik3(A, T, l1, l2, pole){
  var d = sub(T, A), dist = borne(lon(d), Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.3), u = uni(d);
  var a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  var n = sub(pole, [u[0] * dot(pole, u), u[1] * dot(pole, u), u[2] * dot(pole, u)]);
  n = uni(lon(n) < 0.001 ? [0, 0, 1] : n);
  return [add(add(A, u, a), n, h), add(A, u, dist)];
}
HV.ik3 = ik3;

/* Un point du héros → l'écran : [X, Y, sa profondeur (plus grand : plus près de nous)].
   Ce qui est haut est vu à l'horizontale ; ce qui est près du sol, d'un peu au-dessus (comme les pieds depuis le début). */
function ksol(y){ return PSOL * doux(250, 400, y); }
function pj(q, V){ var d = -q[0] * V.s + q[2] * V.c; return [q[0] * V.c + q[2] * V.s, q[1] + ksol(q[1]) * d, d]; }
function d2(a, b){ var x = b[0] - a[0], y = b[1] - a[1]; return Math.sqrt(x * x + y * y); }

/* l'enveloppe d'un nuage de points (un polygone bombé) */
function enveloppe(P){
  P = P.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
  var n = P.length, H = [], i, k = 0, t;
  function cr(o, a, b){ return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  for(i = 0; i < n; i++){ while(k >= 2 && cr(H[k - 2], H[k - 1], P[i]) <= 0) k--; H[k++] = P[i]; }
  for(i = n - 2, t = k + 1; i >= 0; i--){ while(k >= t && cr(H[k - 2], H[k - 1], P[i]) <= 0) k--; H[k++] = P[i]; }
  H.length = k - 1;
  return H;
}
/* vers où est tournée la surface d'une coupe en ce point de son tour ([x, z]) */
function normale(S, q){
  var x = q[0], zr = q[1] - S.zm, av = zr >= 0, cc = av ? S.cf : S.cb, p = av ? S.pf : S.pb;
  return [(x < 0 ? -1 : 1) * Math.pow(Math.abs(x) / S.a, p - 1) / S.a, (av ? 1 : -1) * Math.pow(Math.abs(zr) / cc, p - 1) / cc];
}

/* ==========================================================
   LE TRONC : où est passée chaque coupe du buste, et comment elle est tournée.
   P.bas [x, y, z] : le bassin se déplace (y > 0 : il descend) ; P.bang [avant, côté, vrille] : il penche (degrés) ;
   P.dos [avant, côté, vrille] : le dos se courbe, de la taille aux épaules.
   Les coupes sont gardées tous les 3 de hauteur : y = 137 + 3 i (i = 0 : la base du cou ; 36 : le bassin ; 45 : le bas de la tunique).
   ========================================================== */
var PAS = 3, Y0 = 137, NF = 45, IP = 36;
function tronc(V, P){
  var bas = P.bas || Z3, ba = P.bang || Z3, ds = P.dos || Z3, so = (P.souffle || 0) * 1.3;
  var Mp = mm(RY(ba[2]), mm(RX(ba[0]), RZ(ba[1])));
  var T = {V:V, Mp:Mp, Pc:[bas[0] + (P.bx || 0), 245 + bas[1], bas[2]], C:[], M:[], jx:P.jx || 0};
  var droit = !ds[0] && !ds[1] && !ds[2], i, y;
  function Ms(yy){ var f = 1 - doux(160, 232, yy); return droit || f <= 0 ? Mp : mm(Mp, mm(RY(ds[2] * f), mm(RX(ds[0] * f), RZ(ds[1] * f)))); }
  T.C[IP] = T.Pc; T.M[IP] = Mp;
  for(i = IP - 1; i >= 0; i--){
    y = Y0 + PAS * i;
    T.M[i] = Ms(y);
    T.C[i] = add(T.C[i + 1], mv(Ms(y + PAS / 2), [0, -PAS, 0]));
  }
  /* elle respire : la poitrine monte un peu, le bassin ne bouge pas */
  if(so) for(i = 0; i < IP; i++) T.C[i] = [T.C[i][0], T.C[i][1] - so * (1 - doux(150, 240, Y0 + PAS * i)), T.C[i][2]];
  /* (en attendant les cuisses : le bas de la tunique tombe droit sous le bassin) */
  for(i = IP + 1; i <= NF; i++){ T.M[i] = Mp; T.C[i] = add(T.C[i - 1], mv(Mp, [0, PAS, 0])); }
  /* LE BAS DE LA TUNIQUE EN QUATRE PANS (draper()) : le devant de SON côté droit, le devant de SON côté gauche, le dos à droite,
     le dos à gauche. Chaque pan suit la cuisse qui est dessous ; un point du bas de la tunique est le mélange des quatre, selon
     où il est sur le tour (devant / derrière, à droite / à gauche). Au repos les quatre sont les mêmes. */
  T.pans = {fG:{C:T.C, M:T.M}, fD:{C:T.C, M:T.M}, bG:{C:T.C, M:T.M}, bD:{C:T.C, M:T.M}, g:{C:T.C, M:T.M}};
  function cadre(C, Mx, yy){
    var u = borne((yy - Y0) / PAS, 0, NF), k = Math.min(NF - 1, Math.floor(u)), t = u - k, A = C[k], B = C[k + 1], Ma = Mx[k], Mb = Mx[k + 1];
    if(t < 1e-6) return {C:A, M:Ma};
    return {C:mixv(A, B, t), M:Ma === Mb ? Ma : Ma.map(function(v, j){ return v + (Mb[j] - v) * t; })};
  }
  /* la coupe à la hauteur y : {C : son milieu, M : comment elle est tournée} (sous le bassin : la moyenne des quatre pans) */
  T.fr = function(yy){
    if(yy <= 245 || !T.drape) return cadre(T.C, T.M, yy);
    var R = {C:[0, 0, 0], M:[0, 0, 0, 0, 0, 0, 0, 0, 0]};
    ['fG', 'fD', 'bG', 'bD', 'g'].forEach(function(v){ var f = cadre(T.pans[v].C, T.pans[v].M, yy), j; for(j = 0; j < 3; j++) R.C[j] += f.C[j] / 5; for(j = 0; j < 9; j++) R.M[j] += f.M[j] / 5; });
    return R;
  };
  T.frPan = function(v, yy){ return cadre(T.pans[v].C, T.pans[v].M, yy); };
  /* un point donné dans les mesures du héros debout → où il est passé (il suit la coupe de sa hauteur) */
  T.lieu = function(q){ var yy = borne(q[1], Y0, Y0 + PAS * NF), fr = T.fr(yy); return add(fr.C, mv(fr.M, [q[0], q[1] - yy, q[2]])); };
  /* le même, accroché à la poitrine d'un seul bloc (les épaules, le carquois, les mains « qui suivent ») */
  T.Mb = T.M[5]; T.Cb = T.C[5];
  T.buste = function(q){ return add(T.Cb, mv(T.Mb, [q[0], q[1] - 152, q[2]])); };
  T.dB = -T.Cb[0] * V.s + T.Cb[2] * V.c;       /* la profondeur de la poitrine */
  /* un point de la surface : y, q = [x, z] dans sa coupe ; nrm : pour savoir s'il est tourné vers nous → {p : [X, Y], f, vu} */
  T.sur = function(yy, q, nrm, fr){
    var w, n = null, Cc;
    if(yy > 245 && T.drape){
      /* sous le bassin : le mélange des quatre pans, selon où est le point (devant / derrière, SA droite / SA gauche) */
      var S = BUSTE.a(yy, 1), zr = q[1] - S.zm, l = Math.sqrt(q[0] * q[0] + zr * zr) || 1;
      var wf = doux(-0.35, 0.35, zr / l), wd = doux(-0.45 * S.a, 0.45 * S.a, q[0]), wc = 1 - doux(0.12 * S.a, 0.5 * S.a, Math.abs(q[0]));
      /* (le milieu du devant tombe entre les cuisses : il prend le pan « g ») */
      var P4 = {fG:wf * (1 - wc) * (1 - wd), fD:wf * (1 - wc) * wd, g:wf * wc, bG:(1 - wf) * (1 - wd), bD:(1 - wf) * wd};
      w = [0, 0, 0]; Cc = [0, 0, 0]; if(nrm) n = [0, 0, 0];
      for(var v in P4){
        if(P4[v] < 1e-4) continue;
        var f = T.frPan(v, yy), pw = add(f.C, mv(f.M, [q[0], 0, q[1]]));
        w = add(w, pw, P4[v]); Cc = add(Cc, f.C, P4[v]);
        if(nrm) n = add(n, mv(f.M, [nrm[0], 0, nrm[1]]), P4[v]);
      }
    } else {
      fr = fr || T.fr(yy);
      w = add(fr.C, mv(fr.M, [q[0], 0, q[1]])); Cc = fr.C;
      if(nrm) n = mv(fr.M, [nrm[0], 0, nrm[1]]);
    }
    var p = pj(w, V), dc = -Cc[0] * V.s + Cc[2] * V.c, k = (yy - 214) / 58;
    var o = {p:[p[0] + (k > 0 ? T.jx * k * k : 0), p[1] + ANNEAU * (p[2] - dc)], f:p[2], w:w};
    /* (vu : tourné vers nous ; fa : de combien, de 0 au bord à 1 en face) */
    if(n){ var fa = (-n[0] * V.s + n[2] * V.c) - ANNEAU * n[1]; o.vu = fa > 0; o.fa = fa / (lon(n) || 1); o.n = n; }
    return o;
  };
  /* un point du tour du buste : az (radians ; 0 : devant, +90° : SA gauche), y */
  T.pt = function(az, yy){ var S = BUSTE.a(yy, 1), q = U.point(S, az); return T.sur(yy, q, normale(S, q)); };
  /* un point donné de face (x compté depuis le milieu, y), devant ou derrière (dos) */
  T.face = function(x, yy, dos){
    var S = BUSTE.a(yy, 1), a = S.a, xx = borne(x, -a * 0.999, a * 0.999), p = dos ? S.pb : S.pf;
    var q = [xx, S.zm + (dos ? -S.cb : S.cf) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(xx) / a, p)), 1 / p)];
    return T.sur(yy, q, normale(S, q));
  };
  /* un trait donné de face → les morceaux qu'on en voit, posés */
  T.traits = function(pts, dos){
    var R = [], run = [];
    pts.forEach(function(q){ var o = T.face(q[0], q[1], dos); if(o.vu) run.push(o.p); else { if(run.length > 1) R.push(run); run = []; } });
    if(run.length > 1) R.push(run);
    return R;
  };
  /* tout le tour d'une coupe, à l'écran (n points) */
  T.cercle = function(yy, n, prof){
    var S = BUSTE.a(yy, 1), fr = yy > 245 && T.drape ? null : T.fr(yy), r = [], j;
    /* (r.f : la profondeur de chaque point de l'anneau) */
    r.f = [];
    for(j = 0; j < n; j++){ var o = T.sur(yy, U.point(S, TAU * j / n), null, fr); r.push(o.p); r.f.push(o.f); if(prof) prof.push([o.p[0], o.p[1], o.f]); }
    /* (pour savoir ce qui est devant ou derrière : aussi des points à l'intérieur de la coupe, à mi-chemin et au milieu) */
    if(prof){
      for(j = 0; j < 8; j++){ var q = U.point(S, TAU * j / 8), o2 = T.sur(yy, [q[0] * 0.5, S.zm + (q[1] - S.zm) * 0.5], null, fr); prof.push([o2.p[0], o2.p[1], o2.f]); }
      var o3 = T.sur(yy, [0, S.zm], null, fr); prof.push([o3.p[0], o3.p[1], o3.f]);
    }
    return r;
  };
  /* un anneau autour du buste à la hauteur y : la partie tournée vers nous, de SA droite à SA gauche → [[X, Y]…] */
  T.anneau = function(yy, n){
    var S = BUSTE.a(yy, 1), fr = yy > 245 && T.drape ? null : T.fr(yy), NK = 24, vis = [], a0 = null, a1 = null, j, r = [];
    function vu(a){ var q = U.point(S, a); return T.sur(yy, q, normale(S, q), fr).vu; }
    function ang(k){ return -Math.PI + TAU * k / NK; }
    function bord(k){ var lo = ang(k), hi = lo + TAU / NK, va = vis[k], m, it; for(it = 0; it < 8; it++){ m = (lo + hi) / 2; if(vu(m) === va) lo = m; else hi = m; } return (lo + hi) / 2; }
    var nv = 0;
    for(j = 0; j < NK; j++){ vis.push(vu(ang(j))); if(vis[j]) nv++; }
    if(!nv) return r;
    if(nv === NK){ a0 = -Math.PI; a1 = Math.PI; }
    else {
      for(j = 0; j < NK; j++){ var j2 = (j + 1) % NK; if(!vis[j] && vis[j2]) a0 = bord(j); if(vis[j] && !vis[j2]) a1 = bord(j); }
      if(a0 === null || a1 === null) return r;
      while(a1 < a0) a1 += TAU;
    }
    n = n || 12;
    for(j = 0; j <= n; j++) r.push(T.sur(yy, U.point(S, a0 + (a1 - a0) * j / n), null, fr).p);
    return r;
  };
  /* le contour : dix « coques » qui se chevauchent, du cou au bas de la tunique → [{d, y0, y1}…] */
  T.coques = function(){
    if(T._cq) return T._cq;
    var NS = 40, R = [], L = [], k, j;
    /* (T.prof : des points de la surface, avec leur profondeur, pour la poitrine (jusqu'à la ceinture) et pour la jupe) */
    T.prof = {haut:[], jupe:[]};
    for(j = 0; j <= NS; j++){ var yy = 137 + 135 * j / NS, ring = T.cercle(yy, 24, yy <= YJ + 0.1 ? T.prof.haut : T.prof.jupe); ring.y = yy; R.push(ring); }
    for(k = 0; k < NS; k += 4){ var pts = []; for(j = k; j <= k + 4; j++) pts = pts.concat(R[j]); L.push({d:U.poly(enveloppe(pts)), y0:R[k].y, y1:R[k + 4].y}); }
    T.tours = R;
    return (T._cq = L);
  };
  /* Ce point (X, Y à l'écran, sa profondeur d, l'épaisseur r du membre) est-il devant (1) ou derrière (-1) cette partie du buste
     ('haut' : la poitrine ; 'jupe' : le bas de la tunique) ? 0 : ils ne se recouvrent pas à l'écran. */
  T.devant = function(X, Y, d, r, part){
    T.coques();
    var L = T.prof[part], best = -1e9, i, R2 = 64;
    for(i = 0; i < L.length; i++){ var dx = L[i][0] - X, dy = L[i][1] - Y; if(dx * dx + dy * dy < R2 && L[i][2] > best) best = L[i][2]; }
    if(best < -1e8) return 0;
    return d + r >= best - 1 ? 1 : -1;
  };
  return T;
}
var YJ = 204.5;      /* où la poitrine s'arrête et où commence la jupe (sous la ceinture, qui cache la jointure) */
/* Un membre (une suite de points dans l'espace et son épaisseur) : devant ou derrière la poitrine, et la jupe ?
   → {haut, jupe} : 1 devant, -1 derrière, 0 ils ne se recouvrent pas. On vote sur plusieurs points du membre. */
function cote3(T, pts, r){
  var R = {haut:0, jupe:0};
  ['haut', 'jupe'].forEach(function(part){
    var s = 0;
    pts.forEach(function(q){ var p = pj(q, T.V); s += T.devant(p[0], p[1], p[2], r, part); });
    R[part] = s > 0 ? 1 : s < 0 ? -1 : 0;
  });
  return R;
}
/* LE BAS DE LA TUNIQUE SE POSE SUR LES CUISSES (Romain, 23 novembre, 13 h 36 : « on est censé la voir, la jambe droite »).
   Chaque pan suit la cuisse qui est dessous : le devant de SON côté droit se pose sur SA cuisse droite levée (et la cuisse
   ressort au bas de la tunique), le dos suit une cuisse qui part en arrière ; sinon le pan tombe. dc : la direction de la cuisse. */
function draper(T, dcG, dcD){
  var M = T.Mp, i;
  function angles(dc){
    /* (la cuisse vue depuis le bassin : vers SON côté, vers le bas, vers l'avant) */
    var s = M[0] * dc[0] + M[3] * dc[1] + M[6] * dc[2], d = M[1] * dc[0] + M[4] * dc[1] + M[7] * dc[2], f = M[2] * dc[0] + M[5] * dc[1] + M[8] * dc[2];
    var al = Math.atan2(f, d) / RAD;
    if(al < -120) al += 360;           /* (un genou levé plus haut que la hanche : c'est encore « vers l'avant ») */
    return {al:al, be:Math.asin(borne(s, -1, 1)) / RAD};
  }
  var A = {G:angles(dcG), D:angles(dcD)}, Gr = angles([0, 1, 0]);      /* (Gr : le bas du monde, vu depuis le bassin : la pesanteur) */
  Gr.al *= 0.85; Gr.be *= 0.6;
  function pan(al, be){
    var C = T.C.slice(0, IP + 1), Mx = T.M.slice(0, IP + 1);
    function Mj(y){ var t = doux(245, 272, y); return mm(M, mm(RX(-al * t), RZ(-be * t))); }
    for(i = IP + 1; i <= NF; i++){ var y = Y0 + PAS * i; Mx[i] = Mj(y); C[i] = add(C[i - 1], mv(Mj(y - PAS / 2), [0, PAS, 0])); }
    return {C:C, M:Mx};
  }
  /* Devant : le pan se pose sur la cuisse si elle est plus en avant que la pesanteur (jusqu'à 150° : accroupie, la cuisse
     remonte) ; sinon il tombe. Derrière : il suit une cuisse qui part plus en arrière que la pesanteur ; sinon il tombe (Romain :
     « la logique » — une tunique ne reste pas raide en l'air quand elle se penche). Sur le côté, le pan s'écarte avec la cuisse.
     g : le tissu qui tombe, tout simplement (le milieu du devant, entre les cuisses). */
  function be(s){ return borne(A[s].be * 0.75 + Gr.be * 0.4, -40, 40); }
  T.pans = {
    fG:pan(borne(Math.max(A.G.al * 0.94, Gr.al), -60, 150), be('G')),
    fD:pan(borne(Math.max(A.D.al * 0.94, Gr.al), -60, 150), be('D')),
    bG:pan(borne(Math.min(A.G.al * 0.85, Gr.al), -70, 90), be('G')),
    bD:pan(borne(Math.min(A.D.al * 0.85, Gr.al), -70, 90), be('D')),
    g:pan(borne(Gr.al, -70, 90), borne(Gr.be, -40, 40))
  };
  T.drape = true; T._cq = null;
}
function couture(d, op){ return d ? '<path d="' + d + '" stroke="#f3d6a4" stroke-width=".9" fill="none" stroke-dasharray="2.6 2.4" stroke-linecap="round" opacity="' + (op || 0.55) + '"/>' : ''; }
function st(o, c1, a){ return '<stop offset="' + o + '" stop-color="' + c1 + '"' + (a == null ? '' : ' stop-opacity="' + a + '"') + '/>'; }
function degU(id, x1, y1, x2, y2, stops){ return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '">' + stops + '</linearGradient>'; }

/* le relief d'un os : un dégradé en travers de lui (la lumière vient d'en haut à gauche), quel que soit son sens */
function relief(K, nom, x0, y0, x1, y1, r){
  var nx = -(y1 - y0), ny = x1 - x0, l = Math.sqrt(nx * nx + ny * ny) || 1, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  nx /= l; ny /= l;
  if(nx + 0.35 * ny < 0){ nx = -nx; ny = -ny; }
  return degU(K.n(nom), mx - nx * r, my - ny * r, mx + nx * r, my + ny * r, st(0, '#000', 0.2) + st(0.26, '#fff', 0.16) + st(0.6, '#000', 0.03) + st(1, '#000', 0.4));
}

/* ---------- Un bras (cote : -1, SON bras droit, celui de l'arc ; 1 : SON bras gauche) : sa forme ----------
   P.mainG / mainD : où est le poignet ; P.relG / relD : 1, la main suit le buste quand il se penche (les mesures sont celles du
   héros debout) ; 0, elle est là où on le dit (posée au sol, sur un genou). P.mdirG / mdirD : vers où pointent les doigts
   ([0, 0, 0] : dans le prolongement de l'avant-bras). */
var R_EP = 10.6, R_CO = 9.3, R_PO = 8.3, LIBRE = 0.36;
/* (la main en visière : où est le poignet par rapport au centre de la tête, tête droite — à gauche du front, devant, au-dessus des
   sourcils) */
HV.VISIERE = [22, -46, 32];
function bras(V, cote, P, T){
  var cle = cote < 0 ? 'G' : 'D', EPX = GAB.ep, Ep = T.buste([cote * EPX, 151, 0]);
  var rel = P['rel' + cle]; if(rel == null) rel = 1;
  var Wa = P['main' + cle] || [cote * 50.5, 243, 4], pa = P['coude' + cle] || [cote * 0.7, -0.1, -0.7], mdL = P['mdir' + cle], pcL = P['pouce' + cle];
  /* LA MAIN EN VISIÈRE (P.visiere, de 0 à 1, SA main gauche) : la main à plat au-dessus des yeux, comme une casquette, et elle suit
     la tête quand elle tourne (Romain, 16 h 39 : « elle passe derrière la tête, elle passe devant la tête […] la main, elle doit être
     placée plate […] comme une casquette devant les yeux ») */
  var vi = cle === 'D' ? borne(P.visiere || 0, 0, 1) : 0;
  if(vi > 0){
    var ty = (P.tete || 0) * RAD, cy = Math.cos(ty), sy = Math.sin(ty);
    var ry = function(v){ return [v[0] * cy + v[2] * sy, v[1], -v[0] * sy + v[2] * cy]; };
    Wa = mixv(Wa, add([0, 116, -2], ry(HV.VISIERE)), vi); pa = mixv(pa, ry([1, 0.4, -0.1]), vi); rel = rel + (1 - rel) * vi;
    mdL = mixv(mdL || [0, 0, 0], ry([-1, 0.04, 0.18]), vi); pcL = mixv(pcL || [-0.25, 0.1, 1], ry([0, 0.5, -1]), vi);
  }
  var Wc = rel > 0 ? mixv(Wa, T.buste(Wa), rel) : Wa, pole = rel > 0 ? mixv(pa, mv(T.Mb, pa), rel) : pa;
  /* (le bras levé au-dessus de la tête : l'épaule monte avec lui, comme en vrai — Romain, 17 h 44 : « qu'elle lève bien le bras très
     haut pour sortir la flèche du carquois ») */
  /* (et, comme en dessin animé, le bras s'étire un peu — 12 % au plus : la tête de nos héros est grande, sans ça le poing ne
     dépasserait pas d'elle) */
  var lev = 0, eti = 1;
  if(rel > 0.5){ lev = borne((151 - Wa[1] - 45) / 40, 0, 1); if(lev > 0){ Ep = T.buste([cote * (EPX - lev * 4), 151 - lev * 22, 0]); eti = 1 + 0.12 * lev; } }
  var J = ik3(Ep, Wc, 50 * eti, 43 * eti, pole), El = J[0], W = J[1], da = uni(sub(W, El));
  /* (une main qui suit le buste tourne AVEC lui : vers où pointent ses doigts, son pouce, l'arc qu'elle tient — Romain, 23 novembre,
     16 h 39 : « l'arc est à l'envers » quand elle s'était tournée pour viser) */
  function tourne(v){ return rel > 0 && v ? mixv(v, mv(T.Mb, v), rel) : v; }
  var md = tourne(mdL || Z3), lm = lon(md), dir = lm < 0.02 ? da : uni(add(mul(da, Math.max(0, 1 - lm)), md)), M = add(W, dir, 17);
  var e = pj(Ep, V), c2 = pj(El, V), w = pj(W, V), m = pj(M, V);
  var a = [vers(e[0], c2[0], LIBRE), vers(e[1], c2[1], LIBRE)], ra = vers(R_EP, R_CO, LIBRE);
  var bas = gelule(c2[0], c2[1], R_CO, w[0], w[1], R_PO);
  return {cote:cote, cle:cle, e:e, c2:c2, w:w, m:m, W:W, El:El, Ep:Ep, dir:dir, da:da, a:a, ra:ra, tourne:tourne, pouce:pcL, fond:(e[2] - T.dB) + (c2[2] - T.dB) * 0.5,
    manche:[gelule(e[0], e[1], R_EP, c2[0], c2[1], R_CO), bas],                 /* toute la manche */
    libre:[gelule(a[0], a[1], ra, c2[0], c2[1], R_CO), bas],                     /* ce qui se détache du buste : de l'aisselle au poignet */
    epaule:gelule(e[0], e[1], R_EP + 0.4, vers(e[0], c2[0], 0.3), vers(e[1], c2[1], 0.3), vers(R_EP, R_CO, 0.3) + 0.2)};
}

/* ---------- Une main : la paume, quatre doigts (deux phalanges chacun), le pouce ----------
   (Romain, 23 novembre : « des mains moins moufles ».) W : le poignet ; d : vers où pointent les doigts ; P.pouceG / pouceD :
   de quel côté est le pouce ; P.poingG / poingD : 0, la main ouverte ; 1, le poing fermé (elle tient l'arc, la dague). */
var DG_OFF = [4.5, 1.55, -1.5, -4.4], DG_LON = [9.7, 10.9, 10.1, 8.2], DG_RAY = [2.3, 2.35, 2.3, 2.05];
function mainSVG(K, V, B, P){
  var cote = B.cote, cle = B.cle, W = B.W, d = B.dir, pc = (B.tourne || function(v){ return v; })(B.pouce || P['pouce' + cle] || [-cote * 0.25, 0.1, 1]), pg = P['poing' + cle];
  if(pg == null) pg = cote < 0 ? 0.75 : 0.15;
  var w = sub(pc, mul(d, dot(pc, d)));
  if(lon(w) < 0.08) w = sub([0, -1, 0.2], mul(d, dot([0, -1, 0.2], d)));
  w = uni(w);
  var n = mul(croix(d, w), -cote);                               /* (vers où regarde la paume) */
  function Q(a, b, c2){ return pj(add(add(add(W, d, a), w, b), n, c2 || 0), V); }
  var L = [], objet = '', objetPts = [], morceaux = [], i, louche = '';
  /* la dague, dans SA main gauche : le manche est dans le poing, la lame sort du côté du pouce */
  if(cote > 0 && (P.dague || 0) > 0.3){
    var g0 = Q(7.6, -7.4, 2.4), g1 = Q(7.6, 8, 2.4), ga = Q(3.6, 8.6, 2.4), gb = Q(11.6, 8.6, 2.4);
    /* (la lame : effilée, et jamais un simple trait, même vue par la tranche) */
    var l0 = Q(7.6, 9.4, 2.4), l1 = Q(7.7, 30, 2.4), l2 = Q(7.7, 39, 2.4), lame = [gelule(l0[0], l0[1], 2.9, l1[0], l1[1], 2.3), gelule(l1[0], l1[1], 2.3, l2[0], l2[1], 0.5)], fil = [Q(7.6, 11, 2.4), Q(7.7, 35.5, 2.4)];
    objet = '<g opacity="' + f1(doux(0.3, 0.7, P.dague)) + '">' + PT(U.poly([g0, g1], false), O, 7.4) + PT(U.poly([g0, g1], false), '#6e4223', 4.6) +
      U.masse(lame, '#d5dbe6', 1.6) + PT(U.poly(fil, false), '#ffffff', 1.2, ' opacity=".8"') + PT(U.poly([ga, gb], false), O, 5.6) + PT(U.poly([ga, gb], false), '#c9b07a', 3) + '</g>';
  }
  /* une flèche tenue dans la même main (P.flecheD : elle la sort du carquois, la remet) : la tige passe dans le poing, la pointe
     sort du côté du pouce, l'empennage de l'autre */
  if(cote > 0 && (P.flecheD || 0) > 0.05){
    /* (P.flecheP : 0, tenue au milieu ; 1, tenue par son bout, l'encoche — pour la tirer du carquois) */
    var sf = 22 * (P.flecheP || 0);
    var fa = Q(7.6, -26 + sf, 2.4), fb = Q(7.6, 40 + sf, 2.4), fp = Q(7.6, 48 + sf, 2.4), fq = Q(7.6, 40 + sf, 5.2), fr = Q(7.6, 40 + sf, -0.4), e1 = Q(7.6, -26 + sf, 2.4), e2 = Q(7.6, -14 + sf, 2.4), e3 = Q(7.6, -24 + sf, 7.4), e4 = Q(7.6, -16 + sf, 7.4);
    objet += '<g opacity="' + f1(doux(0.05, 0.6, P.flecheD)) + '">' + PT(U.poly([fa, fb], false), O, 3.6) + PT(U.poly([fa, fb], false), '#e6d8b8', 1.8) +
      PC(U.poly([fp, fq, fr]), '#b8bcc8', 1.3) + PC(U.poly([e1, e2, e4, e3]), '#c0392b', 1.1) + '</g>';
    /* (ses points, loin du poing : pour savoir ce qui passe devant la flèche — un bras, le buste) */
    [-24, -14, 18, 28, 38, 46].forEach(function(b){ objetPts.push(Q(7.6, b + sf, 2.4)); });
  }
  /* CE QUE L'ALCHIMISTE TIENT (hv-alchimiste.js). Une fiole (P.fioleG / P.fioleD, de la couleur K.potion) : son col passe dans le
     poing, son ventre de verre sort du côté du petit doigt — elle tourne avec la main, en vrai, dans l'espace ; la potion reste à
     plat (la pesanteur). La louche (P.louche, SA main droite) : le manche dans le poing, le cuilleron au bout, côté pouce. La
     petite marmite (P.marmite, SA main gauche) : pendue par son anse sous le poing. Les herbes (P.herbes, SA main gauche). */
  var fv = cote < 0 ? (P.fioleG || 0) : (P.fioleD || 0);
  if(fv > 0.05){
    /* (grosse, pour qu'on la voie bien au donjon, où le héros est petit) */
    /* (la fiole de SA main gauche a sa couleur à elle, K.potion2 : il la verse dans celle de sa main droite) */
    var fc0 = Q(7.6, -18.5, 2.4), fn0 = Q(7.6, -7, 2.4), fn1 = Q(7.6, 6.5, 2.4), fn2 = Q(7.6, 11, 2.4), FR = 12.5, pot = (cote > 0 && K.potion2) || K.potion || '#ff8a2a';
    objet += '<g opacity="' + f1(doux(0.05, 0.5, fv)) + '">' + PT(U.poly([fn0, fn1], false), O, 10.4) + PT(U.poly([fn0, fn1], false), '#e9e2f6', 6.8) +
      PT(U.poly([fn1, fn2], false), O, 11) + PT(U.poly([fn1, fn2], false), '#a7743f', 7.4) +
      '<circle cx="' + f1(fc0[0]) + '" cy="' + f1(fc0[1]) + '" r="' + FR + '" fill="#efe9fb" opacity=".92"' + U.c(2.2) + '/>' +
      '<path d="M' + f1(fc0[0] - FR * 0.94) + ' ' + f1(fc0[1] + 1) + ' A' + FR + ' ' + FR + ' 0 0 0 ' + f1(fc0[0] + FR * 0.94) + ' ' + f1(fc0[1] + 1) + ' Z" fill="' + pot + '"/>' +
      '<path d="M' + f1(fc0[0] - 8) + ' ' + f1(fc0[1] + 6) + ' A8.5 8.5 0 0 0 ' + f1(fc0[0] + 8) + ' ' + f1(fc0[1] + 6) + '" fill="none" stroke="#fff" stroke-width="1.8" opacity=".45"/>' +
      '<path d="M' + f1(fc0[0] - 7.2) + ' ' + f1(fc0[1] - 6.5) + ' Q' + f1(fc0[0] - 8.6) + ' ' + f1(fc0[1] - 1.5) + ' ' + f1(fc0[0] - 6.6) + ' ' + f1(fc0[1] + 2.5) + '" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/></g>';
    objetPts.push(fc0, Q(7.6, -28, 2.4), fn1);
  }
  if(cote < 0 && (P.louche || 0) > 0.05){
    /* (loucheR : elle tournoie dans la main comme le pistolet d'un cow-boy autour de son doigt — dans le plan de l'avant-bras :
       le cuilleron passe devant le poing, en bas, derrière, en haut) */
    var lr = (P.loucheR || 0) * RAD, lco = Math.cos(lr), lsi = Math.sin(lr);
    function QL(b){ return Q(7.6 + b * lsi, b * lco, 2.4); }
    var lh0 = QL(-12), lh1 = QL(44), lb = QL(52), o0 = objet.length;
    objet += '<g opacity="' + f1(doux(0.05, 0.5, P.louche)) + '">' + PT(U.poly([lh0, lh1], false), O, 7.4) + PT(U.poly([lh0, lh1], false), '#8a8f9c', 4.4) +
      '<circle cx="' + f1(lb[0]) + '" cy="' + f1(lb[1]) + '" r="10" fill="#6a6f7c"' + U.c(2.2) + '/><ellipse cx="' + f1(lb[0] - 1) + '" cy="' + f1(lb[1] - 1.5) + '" rx="6.5" ry="5" fill="#2e3038"/>' +
      '<path d="M' + f1(lb[0] - 7) + ' ' + f1(lb[1] + 3) + ' A8 8 0 0 0 ' + f1(lb[0] + 6) + ' ' + f1(lb[1] + 5) + '" fill="none" stroke="#d5dbe6" stroke-width="1.6" opacity=".8"/></g>';
    objetPts.push(QL(20), QL(36), lb);
    louche = objet.slice(o0);          /* (le pantin cuit en fait un morceau à part) */
  }
  if(cote > 0 && (P.marmite || 0) > 0.05){
    var mf = Q(7.6, 0, 2.4), mx = mf[0], my = mf[1] + 25;
    objet += '<g opacity="' + f1(doux(0.05, 0.5, P.marmite)) + '"><path d="M' + f1(mx - 14) + ' ' + f1(my - 8) + ' Q' + f1(mx) + ' ' + f1(my - 40) + ' ' + f1(mx + 14) + ' ' + f1(my - 8) + '" fill="none" stroke="' + O + '" stroke-width="3.6"/>' +
      '<path d="M' + f1(mx - 14) + ' ' + f1(my - 8) + ' Q' + f1(mx) + ' ' + f1(my - 40) + ' ' + f1(mx + 14) + ' ' + f1(my - 8) + '" fill="none" stroke="#8a8f9c" stroke-width="1.6"/>' +
      '<path d="M' + f1(mx - 16) + ' ' + f1(my - 8) + ' Q' + f1(mx - 18) + ' ' + f1(my + 14) + ' ' + f1(mx) + ' ' + f1(my + 15) + ' Q' + f1(mx + 18) + ' ' + f1(my + 14) + ' ' + f1(mx + 16) + ' ' + f1(my - 8) + ' Z" fill="#3a3442"' + U.c(2) + '/>' +
      '<ellipse cx="' + f1(mx) + '" cy="' + f1(my - 8) + '" rx="16.5" ry="4.6" fill="#1a1620"' + U.c(1.8) + '/><path d="M' + f1(mx - 11) + ' ' + f1(my - 2) + ' Q' + f1(mx - 12) + ' ' + f1(my + 8) + ' ' + f1(mx - 4) + ' ' + f1(my + 11) + '" fill="none" stroke="#8a8098" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>';
    objetPts.push([mx, my, mf[2]], [mx - 12, my, mf[2]], [mx + 12, my, mf[2]]);
  }
  if(cote > 0 && (P.herbes || 0) > 0.05){
    var hb = '';
    /* (grandes, pour qu'on les voie au donjon) */
    [-40, -15, 10, 35, 58].forEach(function(a, i){ var b0 = Q(7.6, 4, 2.4), b1 = Q(7.6 + 9 * Math.sin(a * RAD), 26 + (i % 2) * 6, 2.4 + 12 * Math.cos(a * RAD));
      hb += '<path d="M' + f1(b0[0]) + ' ' + f1(b0[1]) + ' Q' + f1((b0[0] + b1[0]) / 2 + 7) + ' ' + f1((b0[1] + b1[1]) / 2 - 6) + ' ' + f1(b1[0]) + ' ' + f1(b1[1]) + ' Q' + f1((b0[0] + b1[0]) / 2 - 7) + ' ' + f1((b0[1] + b1[1]) / 2 + 6) + ' ' + f1(b0[0]) + ' ' + f1(b0[1]) + ' Z" fill="' + (i % 2 ? '#7ef08a' : '#5fd06a') + '" stroke="#1e5a2a" stroke-width="1.5"/>'; });
    objet += '<g opacity="' + f1(doux(0.05, 0.5, P.herbes)) + '">' + hb + '</g>';
  }
  /* LE BÂTON À CRISTAL DU SAGE (K.baton, dans SA main droite ; P.sansBaton : posé) : un long bâton de bois qui passe dans le poing, du
     sol jusqu'au-dessus de sa tête ; en haut, deux griffes dorées tiennent un cristal bleu qui luit (P.cristal : il brille plus fort) */
  if(cote < 0 && K.baton && !(P.sansBaton > 0.5)){
    var b0 = Q(7.6, -176, 2.4), b1 = Q(7.6, 120, 2.4), bc = Q(7.6, 142, 2.4), bh = Q(7.6, 165, 2.4), ux = bh[0] - bc[0], uy = bh[1] - bc[1], ul = Math.sqrt(ux * ux + uy * uy) || 1;
    var px = -uy / ul * 11.5, py = ux / ul * 11.5, cri = borne(P.cristal || 0, 0, 1), cb2 = Q(7.6, 120, 2.4);
    var g0 = Q(7.6, 116, 2.4), g1 = Q(7.6, 106, 2.4), bm0 = Q(7.6, 4, 2.4), bm1 = Q(7.6, -4, 2.4);
    /* LE BÂTON EN DEUX MORCEAUX (Romain, 23 novembre, 23 h 09 : « le bâton, il est censé être dans sa main et pas derrière son bras »,
       « quand il jette le bâton en avant […] il rentre à moitié dans sa robe ») : le bas (sous le poing) et le haut (au-dessus, avec le
       cristal), chacun caché seulement là où quelque chose est vraiment devant LUI — avant, tout le bâton était caché d'un coup dès
       que la plupart de ses points étaient derrière le buste ou derrière l'avant-bras qui le tient. Et l'avant-bras qui le tient ne le
       cache jamais : le bâton est dans le poing, devant le poignet (masquesObjets). La jonction est dans le poing, sous les doigts. */
    morceaux.push({nom:'bb', svg:PT(U.poly([b0, bm0], false), O, 9.6) + PT(U.poly([b0, bm0], false), '#7a5230', 6.2) + PT(U.poly([Q(7.6, -170, 2.4), Q(7.6, 0, 2.4)], false), '#a87a4a', 2, ' opacity=".7"'),
      pts:[-170, -140, -110, -80, -50, -20].map(function(b){ return Q(7.6, b, 2.4); })});
    morceaux.push({nom:'bh', svg:PT(U.poly([bm1, b1], false), O, 9.6) + PT(U.poly([bm1, b1], false), '#7a5230', 6.2) + PT(U.poly([Q(7.6, 0, 2.4), Q(7.6, 112, 2.4)], false), '#a87a4a', 2, ' opacity=".7"') +
      /* (les bagues dorées sous le cristal) */
      PT(U.poly([g0, g1], false), O, 11) + PT(U.poly([g0, g1], false), '#e8c062', 7.4) +
      /* (la lueur, les griffes, le cristal : un losange taillé) */
      '<circle cx="' + f1(bc[0]) + '" cy="' + f1(bc[1]) + '" r="' + f1(26 + 12 * cri) + '" fill="#3fd0ff" opacity="' + f1(0.16 + 0.22 * cri) + '"/>' +
      '<circle cx="' + f1(bc[0]) + '" cy="' + f1(bc[1]) + '" r="' + f1(15 + 6 * cri) + '" fill="#8ff3ff" opacity="' + f1(0.22 + 0.3 * cri) + '"/>' +
      PT('M' + f1(cb2[0] - px * 0.9) + ' ' + f1(cb2[1] - py * 0.9) + ' Q' + f1(bc[0] - px * 1.25) + ' ' + f1(bc[1] - py * 1.25) + ' ' + f1(bc[0] - px * 0.7 + ux / ul * 8) + ' ' + f1(bc[1] - py * 0.7 + uy / ul * 8) +
        ' M' + f1(cb2[0] + px * 0.9) + ' ' + f1(cb2[1] + py * 0.9) + ' Q' + f1(bc[0] + px * 1.25) + ' ' + f1(bc[1] + py * 1.25) + ' ' + f1(bc[0] + px * 0.7 + ux / ul * 8) + ' ' + f1(bc[1] + py * 0.7 + uy / ul * 8), O, 5.6) +
      PT('M' + f1(cb2[0] - px * 0.9) + ' ' + f1(cb2[1] - py * 0.9) + ' Q' + f1(bc[0] - px * 1.25) + ' ' + f1(bc[1] - py * 1.25) + ' ' + f1(bc[0] - px * 0.7 + ux / ul * 8) + ' ' + f1(bc[1] - py * 0.7 + uy / ul * 8) +
        ' M' + f1(cb2[0] + px * 0.9) + ' ' + f1(cb2[1] + py * 0.9) + ' Q' + f1(bc[0] + px * 1.25) + ' ' + f1(bc[1] + py * 1.25) + ' ' + f1(bc[0] + px * 0.7 + ux / ul * 8) + ' ' + f1(bc[1] + py * 0.7 + uy / ul * 8), '#e8c062', 2.6) +
      '<path d="M' + f1(bh[0]) + ' ' + f1(bh[1]) + ' L' + f1(bc[0] + px) + ' ' + f1(bc[1] + py) + ' L' + f1(2 * bc[0] - bh[0]) + ' ' + f1(2 * bc[1] - bh[1]) + ' L' + f1(bc[0] - px) + ' ' + f1(bc[1] - py) + ' Z" fill="#8ff3ff"' + U.c(2.2) + '/>' +
      '<path d="M' + f1(bh[0]) + ' ' + f1(bh[1]) + ' L' + f1(bc[0] - px) + ' ' + f1(bc[1] - py) + ' L' + f1(bc[0]) + ' ' + f1(bc[1]) + ' Z" fill="#e8fdff" opacity=".9"/>' +
      '<path d="M' + f1(bc[0]) + ' ' + f1(bc[1]) + ' L' + f1(bc[0] + px) + ' ' + f1(bc[1] + py) + ' L' + f1(2 * bc[0] - bh[0]) + ' ' + f1(2 * bc[1] - bh[1]) + ' Z" fill="#3fb8e8" opacity=".55"/>',
      pts:[20, 50, 80, 110, 142].map(function(b){ return Q(7.6, b, 2.4); })});
    /* (où sont le cristal et le pied du bâton : l'adaptateur du donjon y fait partir les sorts) */
    K.rep = K.rep || {}; K.rep.cristal = bc; K.rep.batonBas = b0;
  }
  /* LE LIVRE DU SAGE (P.livre, dans SA main gauche ; P.livreO : ouvert ; P.livreP : une page qui tourne) — REFAIT (Romain, 23 novembre,
     23 h 09 : « si tu veux vraiment qu'il sorte un livre, il faudrait que ça soit un peu mieux fait, quoi, qu'on voit mieux que c'est un
     livre ») : avant, une plaque bleue vue par la tranche. Maintenant un gros livre épais, en volume, tenu par-derrière (la main est
     derrière lui : il est dessiné APRÈS elle — « apres »), ses pages tournées vers nous : la couverture bleu nuit à coins dorés et un
     médaillon d'or ; la tranche crème des pages ; il s'ouvre en tournant autour de son dos (la couverture de devant passe de l'autre
     côté) ; ouvert, deux pages crème bombées, des lignes d'écriture, une rune dessinée sur la page de droite (elle luit avec le cristal),
     un signet rouge qui pend ; une page qui tourne (livreP).
     Le dos du livre est le long des doigts (d), les pages s'étalent le long du pouce (w), elles regardent comme la paume (n). */
  var apres = '';
  if(cote > 0 && (P.livre || 0) > 0.05){
    var lo = borne(P.livreO || 0, 0, 1), lp = borne(P.livreP || 0, 0, 1), LH = 30, LW = 40, EP = 10, cri2 = borne(P.cristal || 0, 0, 1);
    var BLEU = '#23366e', BLEU2 = '#30489a', OR2 = '#e8c062', CREME = '#f7eccd', CREME2 = '#e9d9ae';
    /* (x : en travers, le long du pouce ; y : le long du dos, du haut (-) au bas (+) ; z : vers nous, hors de la paume) */
    function QB(x, y, z){ return Q(6 + y, x, 4 + z); }
    function pl(L){ return U.poly(L); }
    /* une moitié du livre : du dos jusqu'au bord, dans la direction (cx, cz) ; z0 : sa hauteur au dos ; bombe : les pages bombées */
    function moitie(cx, cz, z0, bombe){
      var f = function(t, y, dz){ return QB(cx * LW * t, y, z0 + cz * LW * t + (dz || 0) + bombe * Math.sin(Math.PI * Math.min(1, t * 1.25)) * (1 - Math.abs(y) / LH * 0.25)); };
      return f;
    }
    function quad(f, t0, t1, y0, y1, dz, n){
      var A = [], B2 = [], k;
      for(k = 0; k <= n; k++){ var t = t0 + (t1 - t0) * k / n; A.push(f(t, y0, dz)); B2.unshift(f(t, y1, dz)); }
      return A.concat(B2);
    }
    function lignes(f, t0, t1, dz, saute){
      var s2 = '';
      for(var k = 0; k < 7; k++){ if(saute && k >= 2 && k <= 4) continue; var y = -LH + 8 + k * 6.4, a1 = f(t0, y, dz), a2 = f(t1 - (k % 3 === 2 ? 0.18 : 0), y, dz);
        s2 += 'M' + f1(a1[0]) + ' ' + f1(a1[1]) + ' L' + f1(a2[0]) + ' ' + f1(a2[1]) + ' '; }
      return PT(s2, '#8a7350', 1.25, ' opacity=".85"');
    }
    /* la couverture de dos (à droite) et ses pages : toujours là */
    var bA = 14 * lo * RAD, fD = moitie(Math.cos(bA), Math.sin(bA), 0, 0), pD = moitie(Math.cos(bA), Math.sin(bA), EP * (1 - lo * 0.55), 2.2 * lo);
    var lb = '<g opacity="' + f1(doux(0.05, 0.5, P.livre)) + '">';
    lb += PC(pl(quad(fD, 0, 1.04, -LH - 1.5, LH + 1.5, 0, 1)), BLEU, 2.2);
    /* (la tranche des pages : le bloc crème entre les deux couvertures) */
    var tr2 = [fD(1, -LH + 1, 1), pD(0.98, -LH + 1, 0), pD(0.98, LH - 1, 0), fD(1, LH - 1, 1)];
    lb += PC(pl(tr2), CREME2, 1.6) + PT('M' + f1(vers(tr2[0][0], tr2[1][0], 0.5)) + ' ' + f1(vers(tr2[0][1], tr2[1][1], 0.5)) + ' L' + f1(vers(tr2[3][0], tr2[2][0], 0.5)) + ' ' + f1(vers(tr2[3][1], tr2[2][1], 0.5)), '#b9a273', 1, ' opacity=".8"');
    lb += PC(pl(quad(pD, 0, 0.98, -LH + 1, LH - 1, 0, 6)), CREME, 1.8);
    if(lo > 0.35){ lb += '<g opacity="' + f1(doux(0.35, 0.7, lo)) + '">' + lignes(pD, 0.14, 0.88, 0.3, true);
      /* (la rune dessinée sur la page de droite : un cercle et une étoile ; elle luit avec le cristal) */
      var rc = pD(0.5, -LH + 8 + 3 * 6.4, 0.4), rr = 7.5;
      lb += '<circle cx="' + f1(rc[0]) + '" cy="' + f1(rc[1]) + '" r="' + f1(rr + 4 + 6 * cri2) + '" fill="#8ff3ff" opacity="' + f1(0.12 + 0.4 * cri2) + '"/>' +
        '<circle cx="' + f1(rc[0]) + '" cy="' + f1(rc[1]) + '" r="' + f1(rr) + '" fill="none" stroke="' + (cri2 > 0.5 ? '#2fa8d8' : '#7a5a3a') + '" stroke-width="1.5"/>' +
        PT('M' + f1(rc[0]) + ' ' + f1(rc[1] - rr * 0.75) + ' L' + f1(rc[0]) + ' ' + f1(rc[1] + rr * 0.75) + ' M' + f1(rc[0] - rr * 0.65) + ' ' + f1(rc[1] - rr * 0.38) + ' L' + f1(rc[0] + rr * 0.65) + ' ' + f1(rc[1] + rr * 0.38) +
          ' M' + f1(rc[0] - rr * 0.65) + ' ' + f1(rc[1] + rr * 0.38) + ' L' + f1(rc[0] + rr * 0.65) + ' ' + f1(rc[1] - rr * 0.38), cri2 > 0.5 ? '#2fa8d8' : '#7a5a3a', 1.4) + '</g>'; }
    /* la couverture de devant et ses pages : elle tourne autour du dos, de « posée dessus » (fermé) à « de l'autre côté » (ouvert) */
    var th = (180 - 14) * lo * RAD, cxG = Math.cos(th), czG = Math.sin(th), zG = EP * (1 - lo), fG = moitie(cxG, czG, zG, 0), pG = moitie(cxG, czG, zG + (lo > 0.5 ? EP * 0.45 : -1.5), lo > 0.5 ? 2.2 * lo : 0);
    if(lo <= 0.5){
      /* (fermé ou presque : on voit la couverture de devant, ses coins dorés et son médaillon) */
      var cv = quad(fG, 0, 1.04, -LH - 1.5, LH + 1.5, 0, 1), cvc = fG(0.55, 0, 0);
      lb += PC(pl(cv), BLEU2, 2.2) + PT(pl(quad(fG, 0.08, 0.96, -LH + 2.5, LH - 2.5, 0, 1)), OR2, 1.3, ' opacity=".9"');
      [[1.04, -LH - 1.5, 0.78, -LH + 0.5], [1.04, LH + 1.5, 0.78, LH - 0.5]].forEach(function(c){ var a1 = fG(c[0], c[1], 0), a2 = fG(c[2], c[1], 0), a3 = fG(c[0], c[3] + (c[1] > 0 ? -6 : 6), 0); lb += PC(pl([a1, a2, a3]), OR2, 1.2); });
      lb += '<circle cx="' + f1(cvc[0]) + '" cy="' + f1(cvc[1]) + '" r="6.2" fill="' + OR2 + '"' + U.c(1.4) + '/><path d="M' + f1(cvc[0]) + ' ' + f1(cvc[1] - 3.6) + ' L' + f1(cvc[0] + 1.1) + ' ' + f1(cvc[1] - 1.1) + ' L' + f1(cvc[0] + 3.6) + ' ' + f1(cvc[1]) + ' L' + f1(cvc[0] + 1.1) + ' ' + f1(cvc[1] + 1.1) + ' L' + f1(cvc[0]) + ' ' + f1(cvc[1] + 3.6) + ' L' + f1(cvc[0] - 1.1) + ' ' + f1(cvc[1] + 1.1) + ' L' + f1(cvc[0] - 3.6) + ' ' + f1(cvc[1]) + ' L' + f1(cvc[0] - 1.1) + ' ' + f1(cvc[1] - 1.1) + ' Z" fill="#fff6c8"/>';
    } else {
      /* (ouvert : la couverture dépasse sous la page de gauche, puis la page) */
      lb += PC(pl(quad(fG, 0, 1.04, -LH - 1.5, LH + 1.5, 0, 1)), BLEU, 2.2) + PC(pl(quad(pG, 0, 0.98, -LH + 1, LH - 1, 0, 6)), '#fbf2d6', 1.8);
      lb += '<g opacity="' + f1(doux(0.5, 0.8, lo)) + '">' + lignes(pG, 0.12, 0.86, 0.3, false) + '</g>';
      /* (le creux du dos, au milieu) */
      lb += PT('M' + f1(QB(0, -LH + 1, EP * 0.45)[0]) + ' ' + f1(QB(0, -LH + 1, EP * 0.45)[1]) + ' L' + f1(QB(0, LH - 1, EP * 0.45)[0]) + ' ' + f1(QB(0, LH - 1, EP * 0.45)[1]), '#b39a68', 2.2, ' opacity=".9"');
      /* (le signet rouge, qui pend du bas du dos) */
      var s0 = QB(1, LH - 2, EP * 0.5), s1 = QB(4, LH + 13, EP * 0.5), s2b = QB(7.5, LH + 12, EP * 0.5), s3 = QB(4.5, LH - 2, EP * 0.5);
      lb += PC(pl([s0, s1, QB(5.2, LH + 9, EP * 0.5), s2b, s3]), '#c0392b', 1.3);
    }
    /* (une page qui tourne : elle se lève de la droite, passe en l'air vers nous, se pose à gauche) */
    if(lo > 0.8 && lp > 0.02 && lp < 0.98){
      var tp = (14 + (180 - 28) * lp) * RAD, pT = moitie(Math.cos(tp), Math.sin(tp), EP * 0.48, 1.5);
      lb += PC(pl(quad(pT, 0, 0.97, -LH + 1.5, LH - 1.5, 0, 6)), lp < 0.5 ? '#fffaf0' : '#f3e6c2', 1.6);
    }
    lb += '</g>';
    apres += lb;
    var lc0 = QB(0, 0, EP);
    K.rep = K.rep || {}; K.rep.livre = lc0;
  }
  /* la paume (MA : la main d'un homme est un peu plus grande — GAB ; ce qu'elle tient ne bouge pas) */
  var MA = GAB.ma;
  function QM(a, b, c2){ return Q(a * MA, b * MA, (c2 || 0) * MA); }
  var p1 = QM(1.5, 3.4), p2 = QM(1.5, -3.4), p3 = QM(9.6, 4.7), p4 = QM(9.6, -4.7), Lp = [];
  Lp.push(gelule(p1[0], p1[1], 4.5 * MA, p3[0], p3[1], 3.9 * MA), gelule(p2[0], p2[1], 4.5 * MA, p4[0], p4[1], 3.9 * MA), gelule(p3[0], p3[1], 3.9 * MA, p4[0], p4[1], 3.9 * MA), gelule(p1[0], p1[1], 4.5 * MA, p2[0], p2[1], 4.5 * MA));
  /* les doigts : ils se plient vers la paume (deux phalanges) ; ouverts, ils s'écartent un peu */
  var ec = (1 - pg) * 0.07, D = [], idx = P['index' + cle] || 0;
  for(i = 0; i < 4; i++){
    /* (l'index peut rester tendu : elle montre du doigt, « chut ! ») */
    var pli = i === 0 ? pg * (1 - idx) : pg, c1 = 0.1 + 1.3 * pli, c2a = c1 * 2.15;
    var l1 = DG_LON[i] * 0.55, l2 = DG_LON[i] * 0.47, ev = DG_OFF[i] * ec, r = DG_RAY[i] * MA;
    var b0 = [9.6, DG_OFF[i], 0], b1 = [b0[0] + l1 * Math.cos(c1), b0[1] + ev * l1, l1 * Math.sin(c1)], b2 = [b1[0] + l2 * Math.cos(c2a), b1[1] + ev * l2, b1[2] + l2 * Math.sin(c2a)];
    var q0 = QM(b0[0], b0[1], b0[2]), q1 = QM(b1[0], b1[1], b1[2]), q2 = QM(b2[0], b2[1], b2[2]);
    L.push(gelule(q0[0], q0[1], r + 0.2, q1[0], q1[1], r), gelule(q1[0], q1[1], r, q2[0], q2[1], r * 0.88));
    D.push([b0, b1, b2]);
  }
  /* le pouce */
  var t0 = [3.2, 5.2, 0.6], u1 = uni([0.62 - 0.3 * pg, 0.75, 0.2 + 0.7 * pg]), t1 = add(t0, u1, 5.6), u2 = uni([0.85 - 0.9 * pg, 0.42 - 0.6 * pg, 0.25 + 0.9 * pg]), t2 = add(t1, u2, 4.7);
  var k0 = QM(t0[0], t0[1], t0[2]), k1 = QM(t1[0], t1[1], t1[2]), k2 = QM(t2[0], t2[1], t2[2]);
  Lp.push(gelule(k0[0], k0[1], 3.1 * MA, k1[0], k1[1], 2.75 * MA), gelule(k1[0], k1[1], 2.75 * MA, k2[0], k2[1], 2.35 * MA));
  /* la peau : un dégradé en travers de la main */
  var mc = QM(8, 0), gid = K.n('pm' + cle), s = degU(gid, mc[0] - 9, mc[1] - 10, mc[0] + 9, mc[1] + 10, st(0, K.peau.c[0]) + st(0.62, K.peau.c[1]) + st(1, U.mix(K.peau.c[1], K.peau.ombre, 0.7)));
  var defs = s, paume = U.masse(Lp, 'url(#' + gid + ')', 1.9);
  s += U.masse(Lp.concat(L), 'url(#' + gid + ')', 1.9);
  /* un trait entre deux doigts voisins */
  var tr = '';
  for(i = 0; i < 3; i++){
    var A = D[i], Bq = D[i + 1], pts = [0, 1, 2].map(function(j){ var x = j === 0 ? 1.6 : 0, qq = QM((A[j][0] + Bq[j][0]) / 2 + x, (A[j][1] + Bq[j][1]) / 2, (A[j][2] + Bq[j][2]) / 2 + 0.6); return [qq[0], qq[1]]; });
    if(d2(pts[0], pts[2]) > 2.2) tr += U.poly(pts, false) + ' ';
  }
  s += PT(tr, K.peau.trait, 1.05, ' opacity=".8"');
  /* (pour tenir l'arc : la paume seule, et les doigts seuls avec leurs traits ; vers : la paume est tournée vers nous) */
  return {objet:objet, louche:louche, objetPts:objetPts, morceaux:morceaux, apres:apres, main:s, paume:defs + paume, doigts:U.masse(L, 'url(#' + gid + ')', 1.9) + PT(tr, K.peau.trait, 1.05, ' opacity=".8"'), n:n, vers:-n[0] * V.s + n[2] * V.c};
}

/* le dessin d'un bras. plein : avec tout son contour (le bras du fond, dessiné avant le buste) ; sinon son trait ne commence qu'à l'aisselle */
/* les deux côtés d'une gélule, sans ses bouts arrondis */
function cotes(x0, y0, r0, x1, y1, r1){
  var dx = x1 - x0, dy = y1 - y0, d = Math.sqrt(dx * dx + dy * dy);
  if(d < 0.5 || d <= Math.abs(r0 - r1) + 0.02) return '';
  var a = Math.atan2(dy, dx), b = Math.acos((r0 - r1) / d), c1 = Math.cos(a + b), s1 = Math.sin(a + b), c2 = Math.cos(a - b), s2 = Math.sin(a - b);
  return 'M' + f1(x0 + r0 * c1) + ' ' + f1(y0 + r0 * s1) + ' L' + f1(x1 + r1 * c1) + ' ' + f1(y1 + r1 * s1) + ' M' + f1(x0 + r0 * c2) + ' ' + f1(y0 + r0 * s2) + ' L' + f1(x1 + r1 * c2) + ' ' + f1(y1 + r1 * s2);
}
function brasSVG(K, V, B, P, plein){
  var s = '', c2 = B.c2, w = B.w, cote = B.cote, L = plein ? B.manche : B.libre;
  /* LE HAUT DU BRAS SANS TRAIT (Romain, 23 novembre, 14 h 11 : « j'aurais bien aimé qu'on ne voie pas la liaison entre les bras et
     les épaules […] le trait noir en haut du bras ») : pour un bras de devant, on ne trace que les deux côtés du haut du bras, pas
     son bout arrondi (c'était lui, le trait en travers du haut du bras) ; l'avant-bras garde tout son contour. */
  /* (et le haut du bras apparaît en fondu : son relief et ses côtés naissent doucement sur l'épaule, sans bord net) */
  var fondu = '';
  if(!plein){
    var fx = c2[0] - B.a[0], fy = c2[1] - B.a[1], fl = Math.sqrt(fx * fx + fy * fy) || 1, lf = Math.min(16, fl * 0.45), fid = K.n('fb' + B.cle);
    fx /= fl; fy /= fl;
    s += '<linearGradient id="' + fid + 'g" gradientUnits="userSpaceOnUse" x1="' + f1(B.a[0]) + '" y1="' + f1(B.a[1]) + '" x2="' + f1(B.a[0] + fx * lf) + '" y2="' + f1(B.a[1] + fy * lf) + '"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
      '<mask id="' + fid + '" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="url(#' + fid + 'g)"/></mask>';
    fondu = ' mask="url(#' + fid + ')"';
  }
  s += (plein ? '<path d="' + L.join(' ') + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linejoin="round"/>' :
      '<path d="' + cotes(B.a[0], B.a[1], B.ra, c2[0], c2[1], R_CO) + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linecap="round"' + fondu + '/>' +
      '<path d="' + L[1] + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linejoin="round"/>') +
    '<path d="' + L.join(' ') + '" fill="' + K.u('tunP') + '"/><path d="' + L.join(' ') + '" fill="' + K.u('trame') + '" opacity=".34"/>' +
    /* le relief de chaque os, en travers de lui ; celui de l'avant-bras s'arrête au coude (pas deux couches l'une sur l'autre) */
    relief(K, 'rb' + B.cle + '0', B.e[0], B.e[1], c2[0], c2[1], R_EP) + relief(K, 'rb' + B.cle + '1', c2[0], c2[1], w[0], w[1], R_CO) +
    '<clipPath id="' + K.n('xb' + B.cle) + '"><path clip-rule="evenodd" d="M-400 -200 H400 V700 H-400 Z ' + L[0] + '"/></clipPath>' +
    PF(L[0], K.u('rb' + B.cle + '0'), fondu) + PF(L[1], K.u('rb' + B.cle + '1'), ' clip-path="url(#' + K.n('xb' + B.cle) + ')"');
  /* les plis du coude */
  var nx = -(w[1] - c2[1]), ny = w[0] - c2[0], nl = Math.sqrt(nx * nx + ny * ny) || 1, ux = (w[0] - c2[0]) / nl, uy = (w[1] - c2[1]) / nl; nx /= nl; ny /= nl;
  function Q(al, k){ return f1(c2[0] + ux * al + nx * k) + ' ' + f1(c2[1] + uy * al + ny * k); }
  if(nl > 12) s += PT('M' + Q(-1, -6.4) + ' Q ' + Q(3, 0) + ' ' + Q(0, 5.4) + ' M' + Q(6, -5.6) + ' Q ' + Q(9.4, -1) + ' ' + Q(7.4, 3.4), U.sombre(K.tissu[2], 0.2), 1.5, ' opacity=".34"');
  /* le poignet de cuir, piqué — EN TENUE DE COMBAT (h.tenue = 'combat', K.combat : Romain, 23 novembre, 18 h 51 : « il faut qu'il ait
     sa tenue de combat ») un long brassard de cuir, du milieu de l'avant-bras au poignet, avec deux sangles et leurs boucles */
  var lgB = K.combat ? 0.38 : 0.8, q1 = [vers(c2[0], w[0], lgB), vers(c2[1], w[1], lgB)], dq = gelule(q1[0], q1[1], (K.combat ? R_CO : R_PO) + 1.2, w[0], w[1], R_PO + 0.9);
  s += PC(dq, K.u('cuir'), 1.6) + PF(dq, K.u('grain'), ' opacity=".4"') + couture('M' + f1(q1[0] - nx * 6.4) + ' ' + f1(q1[1] - ny * 6.4) + ' L ' + f1(q1[0] + nx * 6.4) + ' ' + f1(q1[1] + ny * 6.4), 0.5);
  if(K.combat && nl > 14){
    [0.55, 0.8].forEach(function(t){ var x = vers(c2[0], w[0], t), y = vers(c2[1], w[1], t), r = vers(R_CO, R_PO, t) + 1.4;
      s += PT('M' + f1(x - nx * r) + ' ' + f1(y - ny * r) + ' L ' + f1(x + nx * r) + ' ' + f1(y + ny * r), O, 4.6) + PT('M' + f1(x - nx * r) + ' ' + f1(y - ny * r) + ' L ' + f1(x + nx * r) + ' ' + f1(y + ny * r), '#3b2211', 2.6) +
        PC(gelule(x + nx * r * 0.35 - ux * 1.6, y + ny * r * 0.35 - uy * 1.6, 2.2, x + nx * r * 0.35 + ux * 1.6, y + ny * r * 0.35 + uy * 1.6, 2.2), '#d9b46a', 1.2); });
  }
  /* Trois couches, que le corps range : les manches, PUIS ce qu'elle tient (l'arc, la dague : jamais sous une manche), PUIS les mains */
  var mn = mainSVG(K, V, B, P);
  if(cote < 0 && P.arc !== false && K.arme === 'arc'){
    /* L'ARC DANS LE POING (Romain, 23 novembre, 13 h 36 : « l'arc, il est censé être devant la main ») : la poignée passe dans la
       paume, les doigts se referment par-dessus. Quand on voit l'intérieur de la main, on voit donc la paume, puis l'arc, puis les
       doigts ; quand on voit le dos de la main, le poing cache la poignée. L'arc est rendu en morceaux (ses deux branches, la
       poignée) : HV.corps cache chaque branche là où le buste ou une jambe est devant elle. */
    /* (l'arc tourne avec la main quand elle suit le buste) */
    var Pa = P;
    if(B.tourne){ Pa = Object.create(P); Pa.arcAxe = B.tourne(P.arcAxe || [0, 1, 0]); Pa.arcDir = B.tourne(P.arcDir || [-0.82, 0, 0.57]); }
    var arc = arcSVG(K, V, add(add(B.W, B.dir, 8), mn.n, 3.5), Pa);
    if(mn.vers > 0.15) return {manche:s, paume:mn.paume, arc:arc, objet:mn.objet, objetPts:mn.objetPts, morceaux:mn.morceaux, main:mn.doigts, apres:mn.apres};
    return {manche:s, paume:'', arc:arc, objet:mn.objet, objetPts:mn.objetPts, morceaux:mn.morceaux, main:mn.main, apres:mn.apres};
  }
  return {manche:s, paume:'', arc:null, objet:mn.objet, louche:mn.louche, objetPts:mn.objetPts, morceaux:mn.morceaux, main:mn.main, apres:mn.apres};
}
/* un bras en une seule chaîne de dessin (la manche, la paume, l'arc, ce qu'il tient, la main) ; m : pour chaque morceau de l'arc
   (cH, cB, bH, bB), le masque qui le cache là où quelque chose est devant lui */
function brasTout(o, m){
  m = m || {};
  /* (apres : ce qui est devant la main — le livre, tenu par-derrière) */
  return o.manche + o.paume + objetsTout(o, m) + o.main + (o.apres || '');
}
/* ce qu'une main tient (l'arc en morceaux, la flèche ou la dague), chaque morceau sous son masque s'il en a un */
function objetsTout(o, m){
  m = m || {};
  function sous(id, s){ return id ? '<g mask="url(#' + id + ')">' + s + '</g>' : s; }
  var a = o.arc ? o.arc.morceaux.map(function(x){ return sous(m[x.nom], x.svg); }).join('') + o.arc.poignee : '';
  /* (les morceaux du bâton du Sage, chacun sous son masque) */
  var mo = o.morceaux ? o.morceaux.map(function(x){ return sous(m[x.nom], x.svg); }).join('') : '';
  return a + mo + sous(m.objet, o.objet);
}

/* ---------- Le buste : un seul contour avec les manches de devant ----------
   jb.devant : les jambes qui passent devant le haut du corps (un genou levé devant la poitrine) ; jb.ouv : les jambes vues par
   l'ouverture de la tunique (accroupie de face, on regarde dans le bas de la tunique : les cuisses en sortent). */
/* ==========================================================
   LA LONGUE ROBE DU SAGE (K.robe — Romain, 23 novembre, 22 h 21 : « tu peux passer au sage ») : une robe crème qui tombe de la taille
   jusqu'aux chevilles, sous un manteau bleu ouvert devant, bordé d'or. Elle cache les jambes : on la dessine comme ce qui
   enveloppe la taille, les deux genoux et les deux chevilles (l'enveloppe de ces points, à l'écran) — quand elle marche, court,
   s'agenouille ou tombe, la robe suit les jambes. Les jambes sont dessinées dessous (on ne voit que le bout des bottes). Le manteau :
   la même enveloppe, arrêtée à mi-mollet, ouverte devant (une fente le long du milieu du corps, qui tourne avec lui ; vue de dos,
   il est fermé), un liseré doré le long de l'ouverture et un ourlet doré en bas de la robe.
   ========================================================== */
function robeSVG(K, V, T, jg, jd){
  var i, a, ROBE = ['#f7eed6', '#ead9b2', '#c9b285'], MANT = [U.clair(K.tenue, 0.25), K.tenue, U.sombre(K.tenue, 0.45)], OR = '#e8c062';
  function rond3(c, r, n, dy){ var L = []; for(var k = 0; k < n; k++){ var t = k / n * 2 * Math.PI; L.push(pj([c[0] + r * Math.cos(t), c[1] + (dy || 0), c[2] + r * Math.sin(t)], V)); } return L; }
  var taille = [];
  for(i = 0; i < 24; i++){ a = i / 24 * 2 * Math.PI; taille.push(T.pt(a, 228).p); }
  var genoux = rond3(jg.Kn, 21, 10).concat(rond3(jd.Kn, 21, 10));
  /* (l'ourlet : autour de chaque cheville, un peu au-dessus du pied ; marqué pour tracer le bord doré) */
  var ourlet = rond3(jg.An, 24, 16, 2).concat(rond3(jd.An, 24, 16, 2)).map(function(p){ return [p[0], p[1], p[2], 1]; });
  var mollets = rond3(mixv(jg.Kn, jg.An, 0.62), 25, 12).concat(rond3(mixv(jd.Kn, jd.An, 0.62), 25, 12));
  var H = enveloppe(taille.concat(genoux, ourlet).map(function(p){ return [p[0], p[1], p[3] || 0]; }));
  var dR = U.lisse(H), xa = 1e9, xb = -1e9, ya = 1e9, yb = -1e9;
  H.forEach(function(p){ xa = Math.min(xa, p[0]); xb = Math.max(xb, p[0]); ya = Math.min(ya, p[1]); yb = Math.max(yb, p[1]); });
  var id = K.n('robe'), s = '<defs>' + degU(id + 'G', xa, 0, xb, 0, st(0, ROBE[0]) + st(0.55, ROBE[1]) + st(1, ROBE[2])) +
    degU(id + 'M', xa, 0, xb, 0, st(0, MANT[0]) + st(0.5, MANT[1]) + st(1, MANT[2])) + '<clipPath id="' + id + 'C"><path d="' + dR + '"/></clipPath>';
  /* (les plis : du devant de la taille vers l'ourlet) */
  var plis = '';
  [-0.7, -0.25, 0.25, 0.7].forEach(function(az, k){
    var t0 = T.pt(az, 236); if(!t0.vu) return;
    var b = pj(add(mixv(jg.An, jd.An, 0.2 + 0.2 * k), [0, -6, 0]), V);
    plis += 'M' + f1(t0.p[0]) + ' ' + f1(t0.p[1]) + ' Q' + f1((t0.p[0] + b[0]) / 2 + (k - 1.5) * 4) + ' ' + f1((t0.p[1] + b[1]) / 2) + ' ' + f1(b[0]) + ' ' + f1(b[1]) + ' ';
  });
  /* (le bord du bas : les points de l'enveloppe qui viennent des chevilles, à la suite) */
  var bord = [], cur = [];
  H.concat([H[0]]).forEach(function(p){ if(p[2]) cur.push(p); else { if(cur.length > 1) bord.push(cur); cur = []; } });
  if(cur.length > 1) bord.push(cur);
  var dBord = bord.map(function(L){ return U.poly(L, false); }).join(' ');
  /* LE MANTEAU : l'enveloppe de la taille, des genoux, des mollets ; ouvert devant */
  var HM = enveloppe(taille.concat(genoux, mollets).map(function(p){ return [p[0], p[1]]; })), dM = U.lisse(HM);
  var avant = T.pt(0, 236), ouvre = '', bordsOr = '';
  if(avant.vu){
    var fz = sub(T.pt(0, 250).w, T.pt(Math.PI, 250).w), sx = sub(T.pt(Math.PI / 2, 250).w, T.pt(-Math.PI / 2, 250).w);
    fz = uni(fz); sx = uni(sx);
    var m0 = mixv(mixv(jg.Kn, jg.An, 0.62), mixv(jd.Kn, jd.An, 0.62), 0.5), B0 = add(m0, fz, 30);
    var TL = T.pt(-0.36, 230).w, TR = T.pt(0.36, 230).w, BL = add(B0, sx, -15), BR = add(B0, sx, 15), BL2 = add(BL, [0, 90, 0]), BR2 = add(BR, [0, 90, 0]);
    var O4 = [TL, TR, BR, BR2, BL2, BL].map(function(q){ return pj(q, V); });
    ouvre = '<mask id="' + id + 'O" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="#fff"/><path d="' + U.poly(O4) + '" fill="#000"/></mask>';
    bordsOr = 'M' + f1(O4[0][0]) + ' ' + f1(O4[0][1]) + ' L' + f1(O4[5][0]) + ' ' + f1(O4[5][1]) + ' L' + f1(O4[4][0]) + ' ' + f1(O4[4][1]) +
      ' M' + f1(O4[1][0]) + ' ' + f1(O4[1][1]) + ' L' + f1(O4[2][0]) + ' ' + f1(O4[2][1]) + ' L' + f1(O4[3][0]) + ' ' + f1(O4[3][1]);
  }
  s += '<clipPath id="' + id + 'MC"><path d="' + dM + '"/></clipPath>' + ouvre + '</defs>';
  /* la robe */
  s += PF(dR, 'url(#' + id + 'G)') + '<g clip-path="url(#' + id + 'C)">' + (plis ? PT(plis, ROBE[2], 1.6, ' opacity=".7"') : '') +
    (dBord ? PT(dBord, O, 7) + PT(dBord, OR, 3.6) : '') + '</g>' + PT(dR, O, 2.4);
  /* le manteau, par-dessus */
  s += '<g' + (ouvre ? ' mask="url(#' + id + 'O)"' : '') + '>' + PF(dM, 'url(#' + id + 'M)') + PT(dM, O, 2.4) + '</g>';
  if(bordsOr) s += '<g clip-path="url(#' + id + 'MC)">' + PT(bordsOr, O, 6) + PT(bordsOr, OR, 3) + '</g>';
  return s;
}
function torse(K, h, T, P, avant, fond, jb){
  var V = T.V, cq = T.coques(), s = '', i, cid = K.n('tun');
  var pH = pj(T.C[0], V), pB = pj(T.C[NF], V), pM = pj(T.fr(204).C, V);
  /* la couleur de la tunique suit le corps (le même dégradé pour le buste et les manches : ils se fondent) */
  var T3 = K.tissu, defs = degU(K.n('tunP'), -46 + pM[0], 136 + pM[1] - 204, 46 + pM[0], 276 + pM[1] - 204, st(0, T3[0]) + st(0.55, T3[1]) + st(1, T3[2]));
  /* le relief : en travers du buste et le long de lui, même penché */
  var ax = pB[0] - pH[0], ay = pB[1] - pH[1], al = Math.sqrt(ax * ax + ay * ay), nx = 1, ny = 0, mx = (pH[0] + pB[0]) / 2, my = (pH[1] + pB[1]) / 2;
  if(al > 30){ ax /= al; ay /= al; nx = ay; ny = -ax; if(nx + 0.35 * ny < 0){ nx = -nx; ny = -ny; } } else { ax = 0; ay = 1; al = 135; mx = pM[0]; my = pM[1]; }
  defs += degU(K.n('rtH'), mx - nx * 47.5, my - ny * 47.5, mx + nx * 47.5, my + ny * 47.5, st(0, '#000', 0.14) + st(0.16, '#fff', 0.2) + st(0.42, '#fff', 0.02) + st(0.66, '#000', 0.08) + st(0.86, '#000', 0.26) + st(1, '#000', 0.46)) +
    degU(K.n('rtV'), mx - ax * al / 2, my - ay * al / 2, mx + ax * al / 2, my + ay * al / 2, st(0, '#fff', 0.12) + st(0.3, '#fff', 0) + st(0.62, '#000', 0) + st(1, '#000', 0.26));
  var dTout = cq.map(function(c1){ return c1.d; }).join(' ');
  /* LES CACHES (Romain, 23 novembre, 13 h 36 : « les membres ne peuvent pas traverser le corps […] avoir la logique en 3D ») :
     une jambe est dessinée APRÈS le buste, mais cachée là où la poitrine ou la jupe est devant elle. Le cache prend aussi le
     trait du contour : la jambe s'arrête net au bord du buste, elle passe derrière. */
  /* (chaque forme est un tracé à part : deux formes mises dans un seul tracé peuvent, là où elles se chevauchent, s'annuler et
     laisser un trou dans le cache) */
  function cache(id, L){ return '<mask id="' + K.n(id) + '" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="4.6" stroke-linejoin="round">' + L.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g></mask>'; }
  /* (le haut des bras de devant fait partie de la poitrine : une jambe derrière la poitrine est aussi derrière les épaules) */
  var hautBras = avant.map(function(B){ return B.manche[0]; }), lH = cq.filter(function(c1){ return c1.y1 <= YJ + 0.1; }).map(function(c1){ return c1.d; }),
    lJ = cq.filter(function(c1){ return c1.y0 >= YJ - 0.1; }).map(function(c1){ return c1.d; });
  s += '<defs>' + defs + '<path id="' + K.n('tc') + '" d="' + dTout + '"/><clipPath id="' + cid + '"><use href="#' + K.n('tc') + '"/></clipPath>' +
    cache('mH', lH.concat(hautBras)) + cache('mJ', lJ) + cache('mHJ', lH.concat(lJ, hautBras)) + '</defs>';
  function plein(d, c1){ return '<path d="' + d + '" fill="' + c1 + '"/>'; }
  function tout(c1, x){ return '<use href="#' + K.n('tc') + '" fill="' + c1 + '"' + (x || '') + '/>'; }

  /* --- ce qui est dessiné sur la tunique --- */
  var dans = tout(K.u('trame'), ' opacity=".34"') + tout(K.u('rtH')) + tout(K.u('rtV'));
  /* les plis de la jupe : ils tournent avec elle */
  var plis = '', lums = '';
  [-150, -112, -74, -40, -12, 22, 52, 86, 124, 160].forEach(function(az, j){
    var run = [], y;
    for(y = 222 + (j % 3) * 5; y <= 268; y += 6){ var q = T.pt((az + (y - 222) * 0.05 * (j % 2 ? 1 : -1)) * RAD, y); if(q.vu) run.push(q.p); }
    if(run.length >= 4){ if(j % 2) lums += '<path d="' + U.filet(run, 2.6) + '"/>'; else plis += '<path d="' + U.filet(run, 3.2) + '"/>'; }
  });
  /* les plis du haut : à la taille, sous les bras */
  [[[-23, 199], [-24.5, 187], [-21, 173]], [[23, 199], [24.5, 187], [21, 173]], [[-30, 159], [-25, 166], [-18, 168]], [[30, 159], [25, 166], [18, 168]]].forEach(function(t, j){
    T.traits(U.ech(t, 6)).forEach(function(run){ if(run.length >= 4) plis += '<path d="' + U.filet(run, j < 2 ? 2.8 : 2.4) + '"/>'; });
  });
  T.traits(U.ech([[-27, 151], [-29, 171], [-27, 193]], 6)).forEach(function(run){ if(run.length >= 4) lums += '<path d="' + U.filet(run, 2.4) + '"/>'; });
  /* quand elle se penche : les plis du ventre, en travers */
  var pli = borne(((P.dos || Z3)[0] + (P.bang || Z3)[0] * 0.3) / 40, 0, 1);
  if(pli > 0.08){
    var ventre = '';
    [[196, 21], [188, 16]].forEach(function(t){ T.traits(U.ech([[-t[1], t[0] + 2], [0, t[0] - 2.5], [t[1], t[0] + 2]], 8)).forEach(function(run){ if(run.length >= 4) ventre += '<path d="' + U.filet(run, 2.8) + '"/>'; }); });
    dans += '<g fill="' + U.sombre(K.tissu[2], 0.2) + '" opacity="' + f1(0.3 * pli) + '">' + ventre + '</g>';
  }
  dans += '<g fill="' + U.sombre(K.tissu[2], 0.2) + '" opacity=".32">' + plis + '</g><g fill="' + U.clair(K.tissu[0], 0.3) + '" opacity=".34">' + lums + '</g>';
  /* les coutures des côtés */
  [-1, 1].forEach(function(c1){ T.traits(U.ech([[c1 * 30, 151], [c1 * 32, 167], [c1 * 30, 187], [c1 * 27, 199]], 8)).forEach(function(run){ dans += couture(U.poly(run, false), 0.4); }); });
  /* l'ombre de la tête et du cou sur les épaules ; l'ombre des bras de devant sur le corps */
  var e1 = pj(T.fr(146).C, V), la = d2(T.sur(146, [-33.5, 0]).p, T.sur(146, [33.5, 0]).p), lz = d2(T.sur(146, [0, -14.5]).p, T.sur(146, [0, 15.5]).p);
  dans += '<ellipse cx="' + f1(e1[0]) + '" cy="' + f1(e1[1]) + '" rx="' + f1(Math.max(la, lz * 1.1) * 0.36) + '" ry="12" fill="#000" opacity=".2"/>';
  avant.forEach(function(B){ dans += '<path d="' + B.libre.join(' ') + '" transform="translate(2.8 2.4)" fill="#000" opacity=".17"/>'; });
  /* le bord du bas : une bande plus sombre et sa couture */
  var bas = T.anneau(272, 14), b2 = T.anneau(264.5, 14);
  if(bas.length && b2.length) dans += PF(U.poly(b2.concat(bas.slice().reverse())), U.sombre(K.tissu[2], 0.25), ' opacity=".34"') + couture(U.courbe(T.anneau(263, 14)), 0.55);
  /* un liseré de lumière froide du côté de l'ombre */
  if(al > 60 && T.tours){
    var lis = [];
    T.tours.forEach(function(ring){
      if(ring.y < 153 || ring.y > 261) return;
      var best = -1e9, bp = null;
      ring.forEach(function(q){ var v = q[0] * nx + q[1] * ny; if(v > best){ best = v; bp = q; } });
      lis.push([bp[0] - nx * 1.9, bp[1] - ny * 1.9]);
    });
    dans += PT(U.courbe(lis), '#cfe9ff', 1.5, ' opacity="' + f1(0.36 * doux(60, 100, al)) + '"');
  }

  /* --- ce qui passe par-dessus : le col, le baudrier (le haut) ; la ceinture et sa boucle --- */
  var dessusHaut = '', ceinture = '';
  /* le haut des bras de devant fait partie du buste : le baudrier et la ceinture passent PAR-DESSUS l'épaule
     (Romain, 23 novembre, 11 h 22 : « c'est le vêtement le plus au-dessus ») */
  avant.forEach(function(B){ dessusHaut += PF(B.manche[0], K.u('tunP')) + PF(B.manche[0], K.u('trame'), ' opacity=".34"'); });
  /* le col en V */
  var colO = [[-10, 138.5], [-5, 148], [0, 158], [5, 148], [10, 138.5]].map(function(q){ return T.face(q[0], q[1]); }), col = colO.map(function(o){ return o.p; });
  if(d2(col[0], col[4]) > 3 && colO[2].vu) dessusHaut += PC(U.poly(col), K.u('tunO'), 1.6);
  /* le baudrier : UNE boucle de cuir autour du buste, de SON épaule droite (en haut) à SA hanche gauche (en bas), devant et
     derrière d'un seul tenant (Romain, 23 novembre, 15 h 04 : « elle se coupe […] il faut qu'elle arrête de disparaître dès que
     ça tourne ») : on suit la boucle tout autour et on dessine les morceaux qu'on voit, chacun prolongé exactement jusqu'au bord
     du buste (là où il passe derrière), et passé par-dessus l'épaule quand on la voit de côté. */
  /* LE TABLIER DE CUIR DE L'ALCHIMISTE (K.tablier) : posé sur le devant du buste, de la poitrine jusque sous la ceinture, une poche
     cousue ; il suit le buste quand il se tourne ou se penche (T.face), et ne dépasse jamais de son contour */
  if(K.tablier){
    var tO = [[-12, 150], [-6, 148], [6, 148], [12, 150], [17, 180], [20, 204], [24, 222], [22, 236], [0, 241], [-22, 236], [-24, 222], [-20, 204], [-17, 180]].map(function(q){ return T.face(q[0], q[1]); });
    if(tO.filter(function(o){ return o.vu; }).length >= 9){
      var dT = U.poly(tO.map(function(o){ return o.p; })), pO = [[-12, 214], [12, 214], [12, 231], [-12, 231]].map(function(q){ return T.face(q[0], q[1]).p; });
      var sT = PC(dT, K.u('cuirH'), 1.8) + PF(dT, K.u('grain'), ' opacity=".45"') +
        couture(U.poly([[-9, 154], [-14, 182], [-17, 206], [-20, 224]].map(function(q){ return T.face(q[0], q[1]).p; }), false)) +
        couture(U.poly([[9, 154], [14, 182], [17, 206], [20, 224]].map(function(q){ return T.face(q[0], q[1]).p; }), false)) +
        PC(U.poly(pO), K.u('cuir'), 1.4) + couture(U.poly([pO[0], pO[1]].map(function(q){ return [q[0], q[1] + 2.4]; }), false));
      var tc2 = K.n('tbc');
      dessusHaut += '<clipPath id="' + tc2 + '"><use href="#' + K.n('tc') + '"/></clipPath><g clip-path="url(#' + tc2 + ')">' + sT + '</g>';
    }
  }
  if(K.baudrier) (function(){
    var NB = 96, Y0b = 172.25, Ab = 30.25;
    function bq(az){ return T.pt(az, Y0b + Ab * Math.sin(az)); }
    function bord(a0, a1, v0){ var m, it, o; for(it = 0; it < 9; it++){ m = (a0 + a1) / 2; o = bq(m); if(o.vu === v0) a0 = m; else a1 = m; } var p = bq((a0 + a1) / 2).p; return [p[0], p[1], 0]; }
    function pt3(o){ return [o.p[0], o.p[1], o.fa]; }
    var S = [], k, runs = [], run = null, k0 = -1, pas = TAU / NB;
    for(k = 0; k < NB; k++){ S.push(bq(-Math.PI + pas * k)); if(k0 < 0 && !S[k].vu) k0 = k; }
    /* (on part d'un point caché : un morceau vu n'est jamais coupé en deux par le début de la boucle) */
    if(k0 < 0) runs.push(S.map(pt3).concat([pt3(S[0])]));
    else for(k = k0 + 1; k <= k0 + NB; k++){
      var o0 = S[k % NB], av = S[(k - 1) % NB], az0 = -Math.PI + pas * k;
      if(o0.vu && !av.vu) run = [bord(az0 - pas, az0, false)];
      if(o0.vu) run.push(pt3(o0));
      if(o0.vu && !S[(k + 1) % NB].vu){ run.push(bord(az0, az0 + pas, true)); runs.push(run); run = null; }
    }
    /* (le cuir ne dépasse jamais du contour du buste et du haut des bras ; vu par la tranche, près du bord, il s'amincit : il
       tourne autour du corps au lieu de s'arrêter net) */
    var bc = K.n('bdc'), s2 = '';
    runs.forEach(function(r2){
      if(r2.length < 2) return;
      var rb = U.ruban(r2, function(u){ var q = r2[Math.round(u * (r2.length - 1))]; return 4.7 * (0.12 + 0.88 * doux(0, 0.45, q[2])); });
      s2 += PC(rb, K.u('cuir'), 1.8) + PF(rb, K.u('grain'), ' opacity=".4"') + couture(U.poly(r2.map(function(q2){ return [q2[0] - 2, q2[1] - 2.2]; }), false));
    });
    if(s2) dessusHaut += '<clipPath id="' + bc + '"><use href="#' + K.n('tc') + '"/>' + avant.map(function(B){ return '<path d="' + B.manche[0] + '"/>'; }).join('') + '</clipPath><g clip-path="url(#' + bc + ')">' + s2 + '</g>';
  })();
  /* LES POTIONS DE L'ALCHIMISTE (Romain, 20 h 24 : « plus de potions attachées sur lui ») : une grosse fiole orange sur la poitrine,
     et des fioles de toutes les couleurs glissées dans sa sangle, de l'épaule à la hanche ; chacune n'est dessinée que si on voit
     l'endroit de la sangle où elle est (elle tourne avec lui), un peu moins large quand on la voit par la tranche */
  if(K.tablier){
    /* (une fiole est une petite boule de verre posée SUR la poitrine : son milieu est à un rayon de la surface, vers l'extérieur — de
       profil, à 90° et 270°, elles dépassent bien du corps : Romain, 20 h 39) */
    var fiole = function(o, r, coul, clair){
      var p = o.p, nl = o.n ? lon(o.n) || 1 : 1;
      if(o.n){ var a3 = pj(o.w, V), b3 = pj(add(o.w, o.n, r * 0.95 / nl), V); p = [p[0] + b3[0] - a3[0], p[1] + b3[1] - a3[1]]; }
      return '<g transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ') scale(' + f1(r / 10) + ')">' +
        '<rect x="-3.2" y="-17" width="6.4" height="8" rx="1.5" fill="#e9e2f6"' + U.c(1.6) + '/><rect x="-3.8" y="-21" width="7.6" height="5" rx="1.6" fill="#a7743f"' + U.c(1.4) + '/>' +
        '<circle cx="0" cy="0" r="10" fill="#efe9fb" opacity=".9"' + U.c(2) + '/>' +
        '<path d="M-9.4 1.5 A 9.6 9.6 0 0 0 9.4 1.5 Q 4 -1.2 0 1 Q -4 3 -9.4 1.5 Z" fill="' + coul + '"/><path d="M-6 4 A 7 7 0 0 0 6 4" fill="none" stroke="' + clair + '" stroke-width="2" opacity=".8"/>' +
        '<path d="M-6 -5 Q -7 -1 -5.5 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/></g>';
    };
    [[-1.05, 6.2, '#5fd06a', '#c8ffb0'], [-0.62, 6.4, '#4aa8ff', '#bfe6ff'], [-0.12, 10, '#ff8a2a', '#ffd27a'], [0.42, 6.4, '#b46cff', '#e6ccff'], [0.86, 6.2, '#ff5f7a', '#ffc4cf']].forEach(function(f){
      var o = T.pt(f[0], 172.25 + 30.25 * Math.sin(f[0]));
      if(o.fa > -0.2) dessusHaut += fiole(o, f[1], f[2], f[3]);
    });
  }
  /* la ceinture : un anneau de cuir, et sa boucle devant */
  var mc = pj(T.fr(208).C, V);
  function large(q){ return [mc[0] + (q[0] - mc[0]) * 1.02, q[1]]; }
  var c1 = T.anneau(202, 10).map(large), c2 = T.anneau(214, 10).map(large);
  if(c1.length && c2.length){
    var dc = U.poly(c1.concat(c2.slice().reverse()));
    ceinture += PC(dc, K.u('cuirH'), 2) + PF(dc, K.u('grain'), ' opacity=".4"') + couture(U.poly(c1.map(function(q){ return [q[0], q[1] + 2.3]; }), false), 0.6) + couture(U.poly(c2.map(function(q){ return [q[0], q[1] - 2.3]; }), false), 0.45) +
      PF(U.poly(c2.concat(c2.slice().reverse().map(function(q){ return [q[0], q[1] + 5]; }))), '#000', ' opacity=".2" clip-path="url(#' + cid + ')"');
  }
  var boO = [[-9, 198], [9, 198], [9, 218], [-9, 218], [0, 208]].map(function(q){ return T.face(q[0], q[1]); }), bo = boO.map(function(o){ return o.p; }), lb = d2(bo[0], bo[1]);
  if(lb > 2.5 && boO[4].vu){
    /* (la boucle : un rectangle posé sur le ventre ; il se resserre quand elle se tourne, il penche quand elle se penche) */
    var ux = (bo[1][0] - bo[0][0]) / 18, uy = (bo[1][1] - bo[0][1]) / 18, vx = (bo[3][0] - bo[0][0]) / 20, vy = (bo[3][1] - bo[0][1]) / 20;
    ceinture += '<g transform="matrix(' + [ux, uy, vx, vy, (bo[0][0] + bo[2][0]) / 2, (bo[0][1] + bo[2][1]) / 2].map(function(v){ return Math.round(v * 1000) / 1000; }).join(' ') + ')"><rect x="-9" y="-10" width="18" height="20" rx="3" fill="#c9b07a"' + U.c(1.8) + '/><rect x="-4" y="-5" width="8" height="10" rx="1.5" fill="none" stroke="' + O + '" stroke-width="1.4"/><path d="M-6.6 -7.4 h4 M-6.6 -7.4 v5" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></g>';
  }

  /* LES SACOCHES DE L'ALCHIMISTE (Romain, 20 h 24 : « plus de sacoches qui pendent sur sa robe ») : pendues à la ceinture tout
     autour des hanches, sur la tunique ([où autour de lui, largeur, longueur]) ; chacune tourne avec lui et suit la pente du corps */
  if(K.tablier){
    [[0.78, 19, 24], [-0.92, 16, 20], [1.7, 18, 25], [-1.85, 15, 19], [2.65, 17, 22]].forEach(function(s3){
      var h0 = T.pt(s3[0], 211), h1 = T.pt(s3[0], 211 + s3[2]);
      if(!h0.vu || h0.fa < 0.12) return;
      var a = h0.p, b = h1.p, k = 0.45 + 0.55 * Math.min(1, h0.fa), w = s3[1] * k / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.max(6, Math.sqrt(dx * dx + dy * dy)), th = Math.atan2(-dx, dy) * 180 / Math.PI;
      ceinture += '<g transform="translate(' + f1(a[0]) + ' ' + f1(a[1]) + ') rotate(' + f1(th) + ')">' +
        '<path d="M' + f1(-w) + ' 0 L' + f1(w) + ' 0 L' + f1(w + 1) + ' ' + f1(L * 0.78) + ' Q' + f1(w) + ' ' + f1(L) + ' 0 ' + f1(L + 1.2) + ' Q' + f1(-w) + ' ' + f1(L) + ' ' + f1(-w - 1) + ' ' + f1(L * 0.78) + ' Z" fill="' + K.u('cuir') + '"' + U.c(1.6) + '/>' +
        '<path d="M' + f1(-w - 0.6) + ' -1 L' + f1(w + 0.6) + ' -1 L' + f1(w + 0.2) + ' ' + f1(L * 0.42) + ' Q0 ' + f1(L * 0.58) + ' ' + f1(-w - 0.2) + ' ' + f1(L * 0.42) + ' Z" fill="' + K.u('cuirH') + '"' + U.c(1.4) + '/>' +
        '<rect x="-1.7" y="' + f1(L * 0.4) + '" width="3.4" height="3.2" rx=".6" fill="#c9b07a" stroke="' + O + '" stroke-width=".9"/>' +
        couture('M' + f1(-w + 1.2) + ' ' + f1(L * 0.62) + ' Q0 ' + f1(L * 0.7) + ' ' + f1(w - 1.2) + ' ' + f1(L * 0.62), 0.5) + '</g>';
    });
  }

  /* --- l'ouverture du bas de la tunique : quand on regarde dedans (accroupie, de face), on voit l'intérieur et les cuisses --- */
  var axS = mv(T.fr(272).M, [0, 1, 0]), vuO = (-axS[0] * V.s + axS[2] * V.c) - ANNEAU * axS[1], ouv = '';
  if(vuO > 0.03 && jb && jb.ouv){
    var dO = U.poly(T.tours[T.tours.length - 1]), oid = K.n('ouv');
    ouv = '<clipPath id="' + oid + '"><path d="' + dO + '"/></clipPath><g opacity="' + f1(doux(0.03, 0.16, vuO)) + '">' + PF(dO, U.sombre(K.tissu[2], 0.3)) + '<g clip-path="url(#' + oid + ')">' + jb.ouv() + '</g>' + PT(dO, O, 2) + '</g>';
  }

  /* --- l'assemblage : un seul contour pour le buste et les manches de devant ; l'épaule du bras du fond se fond dans le buste --- */
  var manches = '';
  avant.forEach(function(B){ manches += ' ' + B.manche.join(' '); });
  function trait(d){ return '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="4.6" stroke-linejoin="round"/>'; }
  /* (l'épaule d'un bras du fond : une pièce de tunique posée sur le haut du bras, qui s'efface en fondu — Romain, 23 novembre,
     14 h 11 : « qu'on ne voie pas la liaison entre les bras et les épaules ») */
  var epaules = '';
  fond.forEach(function(B){
    var ux = B.c2[0] - B.e[0], uy = B.c2[1] - B.e[1], ul = Math.sqrt(ux * ux + uy * uy) || 1, fid = K.n('fe' + B.cle), p0 = 0.1 * ul, p1 = 0.3 * ul + R_CO;
    ux /= ul; uy /= ul;
    epaules += '<linearGradient id="' + fid + 'g" gradientUnits="userSpaceOnUse" x1="' + f1(B.e[0] + ux * p0) + '" y1="' + f1(B.e[1] + uy * p0) + '" x2="' + f1(B.e[0] + ux * p1) + '" y2="' + f1(B.e[1] + uy * p1) + '"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<mask id="' + fid + '" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="url(#' + fid + 'g)"/></mask>' +
      PF(B.epaule, K.u('tunP'), ' mask="url(#' + fid + ')"');
  });
  s += trait(dTout + manches) + epaules + tout(K.u('tunP')) + '<g clip-path="url(#' + cid + ')">' + dans + '</g>' + ouv + dessusHaut + ceinture;
  return s;
}

/* ---------- Le cou : de la base de la tête au haut du buste ---------- */
function cou(K, V, a, b, r, ombre){
  var d = gelule(a[0], a[1], r, b[0], b[1], r), cid = K.n('cou');
  return '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>' + PC(d, K.u('peau'), 2) + (ombre ? '<g clip-path="url(#' + cid + ')">' + ombre + '</g>' : '');
}

/* ---------- L'arc : tenu par la poignée ; P.arcAxe : dans quel sens il est tenu (debout par défaut), P.arcDir : de quel côté est sa corde ---------- */
function arcSVG(K, V, Hd, P){
  var axe = uni(P.arcAxe || [0, 1, 0]), e0 = P.arcDir || [-0.82, 0, 0.57], e = sub(e0, mul(axe, dot(e0, axe))), L = P.arcLong || 101, i, pts = [], n = 16, td = P.tendu || 0;
  e = uni(lon(e) < 0.05 ? [-0.82, 0, 0.57] : e);
  function Q(u, v){ return pj(add(add(Hd, e, u), axe, v), V); }
  /* (tendu : les branches plient un peu vers la corde) */
  var bx = -16.5 - 9 * td, by = L - 5 * td;
  for(i = 0; i <= n; i++){ var b = U.bez([[bx, -by], [5.5, -L * 0.52], [5.5, L * 0.52], [bx, by]], i / n), q = Q(b[0], b[1]); pts.push(q); }
  var t1 = Q(bx, -by), t2 = Q(bx, by), g1 = Q(1.6, -11), g2 = Q(1.6, 11), s = '', mid = [(t1[0] + t2[0]) / 2, (t1[1] + t2[1]) / 2, (t1[2] + t2[2]) / 2];
  /* (une branche : le bois ; une demi-corde : du bout de la branche jusqu'au milieu de la corde) */
  function branche(P2){ var d = U.poly(P2.map(function(q){ return [q[0], q[1]]; }), false); return PT(d, O, 9) + PT(d, K.u('bois'), 5); }
  function corde(tip){ return PT('M' + f1(tip[0]) + ' ' + f1(tip[1]) + ' L ' + f1(mid[0]) + ' ' + f1(mid[1]), '#efe6cc', 1.3, ' opacity=".9"'); }
  function ptsCorde(tip){ var r = [], k; for(k = 1; k <= 5; k++) r.push([vers(tip[0], mid[0], k / 6), vers(tip[1], mid[1], k / 6), vers(tip[2], mid[2], k / 6)]); return r; }
  if(td > 0.02 && P._encoche){
    /* la corde passe par les doigts ; la flèche va des doigts à l'arc */
    var nk = pj(P._encoche, V), nk2 = [vers((t1[0] + t2[0]) / 2, nk[0], td), vers((t1[1] + t2[1]) / 2, nk[1], td), vers((t1[2] + t2[2]) / 2, nk[2], td)], pt = Q(20, 0);
    mid = nk2;
    var ax = pt[0] - nk2[0], ay = pt[1] - nk2[1], al = Math.sqrt(ax * ax + ay * ay) || 1; ax /= al; ay /= al;
    s += PT('M' + f1(nk2[0]) + ' ' + f1(nk2[1]) + ' L ' + f1(pt[0]) + ' ' + f1(pt[1]), O, 3.6) + PT('M' + f1(nk2[0]) + ' ' + f1(nk2[1]) + ' L ' + f1(pt[0]) + ' ' + f1(pt[1]), '#e6d8b8', 1.8) +
      PC('M' + f1(pt[0] + ax * 9) + ' ' + f1(pt[1] + ay * 9) + ' L ' + f1(pt[0] - ay * 4.2) + ' ' + f1(pt[1] + ax * 4.2) + ' L ' + f1(pt[0] + ay * 4.2) + ' ' + f1(pt[1] - ax * 4.2) + ' Z', '#b8bcc8', 1.3) +
      PC('M' + f1(nk2[0] + ax * 3) + ' ' + f1(nk2[1] + ay * 3) + ' l ' + f1(-ay * 4 + ax * 2) + ' ' + f1(ax * 4 + ay * 2) + ' l ' + f1(ax * 8) + ' ' + f1(ay * 8) + ' l ' + f1(ay * 4 + ax * 2) + ' ' + f1(-ax * 4 + ay * 2) + ' l ' + f1(ay * 4 - ax * 2) + ' ' + f1(-ax * 4 - ay * 2) + ' l ' + f1(-ax * 8) + ' ' + f1(-ay * 8) + ' Z', '#c8faff', 1);
  }
  /* l'arc en quatre morceaux, chacun avec ses points à l'écran (et leur profondeur), pour savoir ce qui passe devant lui :
     haut, bas : les deux branches ; cordeH, cordeB : les deux moitiés de la corde ; poignee : la poignée et la flèche */
  var M = [
      {nom:'cH', svg:corde(t1), pts:ptsCorde(t1)}, {nom:'cB', svg:corde(t2), pts:ptsCorde(t2)},
      {nom:'bH', svg:branche(pts.slice(0, n / 2 + 1)), pts:pts.slice(1, n / 2)}, {nom:'bB', svg:branche(pts.slice(n / 2)), pts:pts.slice(n / 2 + 1, n)}];
  /* (la flèche encochée est un morceau à part : un bras peut passer devant elle — Romain, 16 h 39 : « la flèche elle est censée être
     derrière le bras ») */
  if(s){ var fp = []; for(i = 0; i <= 6; i++) fp.push([vers(mid[0], pt[0], i / 7), vers(mid[1], pt[1], i / 7), vers(mid[2], pt[2], i / 7)]); M.push({nom:'fl', svg:s, pts:fp}); }
  return {morceaux:M, poignee:PT('M' + f1(g1[0]) + ' ' + f1(g1[1]) + ' L ' + f1(g2[0]) + ' ' + f1(g2[1]), '#6e4223', 6.4)};
}

/* ---------- Une jambe : où sont ses os ----------
   P.piedG / piedD : la cheville ; P.genouG / genouD : de quel côté va le genou ; P.ouvG / ouvD : le pied tourné vers l'extérieur ;
   P.pointeG / pointeD (degrés) : 0, le pied à plat ; 50, sur la pointe (le talon levé) ; 90, les orteils repliés sous un genou à terre.
   Un pied ne passe jamais sous le sol : sa cheville remonte s'il le faut. */
function jambe(V, cote, P, T){
  var cle = cote < 0 ? 'G' : 'D', Ha = add(T.Pc, mv(T.Mp, [cote * GAB.ha, 1, 0]));
  var A = (P['pied' + cle] || [cote * 19.5, 386, cote * -5]).slice(), pole = P['genou' + cle] || [cote * 0.25, 0, 1];
  var ouv = P['ouv' + cle] == null ? 0.3 : P['ouv' + cle], pt = (P['pointe' + cle] || 0) * RAD, cp = Math.cos(pt), sp = Math.sin(pt);
  /* (le pied tourne en dehors — ou en dedans si ouv < 0 — sans changer de longueur) */
  /* (P.lacetG / lacetD : le pied pivote sur place — Romain, 16 h 39 : « quand on est debout et qu'on se retourne comme ça, les jambes
     elles se tournent sans qu'on ait besoin de lever la jambe ») */
  var la = (P['lacet' + cle] || 0) * RAD, h1 = [cote * 20 * ouv, 0, 19];
  var h0 = [h1[0] * Math.cos(la) + h1[2] * Math.sin(la), 0, -h1[0] * Math.sin(la) + h1[2] * Math.cos(la)], Lt = 19.92, e = uni(h0), sd = [e[0] * cp, sp, e[2] * cp], m = [-e[0] * sp, cp, -e[2] * sp];
  /* le pied au sol : le talon ou la pointe ne descend pas plus bas que le sol */
  var bas = Math.max(A[1] + 21 * m[1] - 7.07 * sd[1] + 9, A[1] + 22 * m[1] + Lt * sd[1] + 7.8) - (SOL + 2);
  if(bas > 0) A[1] -= bas;
  var J = ik3(Ha, A, 72, 70, pole), Kn = J[0], An = J[1], dj = uni(sub(An, Kn));
  return {cote:cote, cle:cle, Ha:Ha, Kn:Kn, An:An, dj:dj, dc:uni(sub(Kn, Ha)), m:m, sd:sd, pt:pt,
    Ta:add(add(An, m, 21), sd, -7.07), Po:add(add(An, m, 22), sd, Lt), fond:(pj(Ha, V)[2] + pj(Kn, V)[2] * 2 + pj(An, V)[2]) / 4, kn:pj(Kn, V)};
}
/* son dessin : la cuisse, puis la botte d'un seul tenant (le genou, le mollet, la cheville, le talon, le pied) */
function jambeSVG(K, V, J, P, suf){
  /* LE HAUT DE LA BOTTE (Romain, 23 novembre, 14 h 11 : accroupie, « il y a vraiment un problème avec ses jambes par rapport à la
     botte ») : jambe droite, la botte monte jusqu'au genou et le couvre (comme avant) ; jambe pliée, elle s'arrête sous le genou,
     qui ressort par-dessus — sinon le haut de la botte « avalait » le genou. */
  var plie = Math.min(1, Math.max(0, 1 - dot(J.dc, J.dj))), dh = 8 * plie;
  var cote = J.cote, cle = J.cle + (suf || ''), ha = pj(J.Ha, V), kn = J.kn, an = pj(J.An, V), bt = pj(add(J.Kn, J.dj, -3 + dh), V);
  var ta = pj(J.Ta, V), po = pj(J.Po, V), a2 = pj(add(J.An, J.m, 4), V), t2 = pj(add(J.Ta, J.m, -1), V);
  /* (jb : les jambes plus épaisses d'un homme — GAB, plus haut) */
  var jb = GAB.jb, s = '', dcu = gelule(ha[0], ha[1], 13.2 * jb, kn[0], kn[1], 10.6 * jb), cu = K.n('cu' + cle);
  /* la cuisse, et l'ombre de la tunique dessus */
  var lc = d2(ha, kn) || 1, ox = ha[0] + (kn[0] - ha[0]) * Math.min(1, 32 / lc), oy = ha[1] + (kn[1] - ha[1]) * Math.min(1, 32 / lc);
  s += PC(dcu, K.u('pant'), 2.2) + '<clipPath id="' + cu + '"><path d="' + dcu + '"/></clipPath><ellipse cx="' + f1(ox) + '" cy="' + f1(oy) + '" rx="22" ry="13" fill="#000" opacity=".3" clip-path="url(#' + cu + ')"/>';
  /* (la cuisse et la botte sont deux morceaux : chacun sait s'il est devant ou derrière le buste) */
  var cuisse = s; s = '';
  /* le mollet : un peu en arrière du tibia, au premier tiers ; la cheville est plus fine */
  var hk = sub(J.Ha, J.Kn), ar = sub(hk, mul(J.dj, dot(hk, J.dj))), Mo = add(add(J.Kn, J.dj, 24), uni(lon(ar) < 0.5 ? [0, 0, -1] : ar), 2.4), mo = pj(Mo, V);
  var botte = [gelule(bt[0], bt[1], 13 * jb, mo[0], mo[1], 12.5 * jb), gelule(mo[0], mo[1], 12.5 * jb, an[0], an[1], 10.9 * jb), gelule(ta[0], ta[1], 9 * jb, po[0], po[1], 7.8 * jb), gelule(a2[0], a2[1], 10.6 * jb, t2[0], t2[1], 8.8 * jb)];
  var cid = K.n('bt' + cle), ysol = SOL + 0.6 + PSOL * Math.max(ta[2], po[2]);
  s += '<clipPath id="' + cid + '"><rect x="-300" y="-100" width="600" height="' + f1(ysol + 100) + '"/></clipPath>';
  s += '<g clip-path="url(#' + cid + ')">' + U.masse(botte, K.u('botte'), 2.2) + botte.map(function(d){ return PF(d, K.u('grain'), ' opacity=".42"') + PF(d, K.u('relM'), ' opacity=".55"'); }).join('') + '</g>';
  /* le long de la tige : un reflet, les plis de la cheville, une sangle et sa boucle */
  var bq = pj(add(J.Kn, J.dj, 3 + dh), V), ux = an[0] - bq[0], uy = an[1] - bq[1], ul = Math.sqrt(ux * ux + uy * uy) || 1; ux /= ul; uy /= ul;
  function Q(t, k){ return f1(bq[0] + ux * ul * t - uy * k) + ' ' + f1(bq[1] + uy * ul * t + ux * k); }
  if(ul > 26){
    s += PT('M' + Q(0.1, 8.6) + ' L ' + Q(0.66, 7.6), '#f6c896', 2, ' opacity=".38"') +
      PT('M' + Q(0.93, 9.2) + ' Q ' + Q(0.99, 0) + ' ' + Q(0.94, -8.6) + ' M' + Q(1.03, 7.6) + ' Q ' + Q(1.08, 0) + ' ' + Q(1.04, -6.6), '#1c0e06', 1.7, ' opacity=".4"') +
      PC('M' + Q(0.74, 12.2) + ' L ' + Q(0.74, -12.2) + ' L ' + Q(0.84, -11.8) + ' L ' + Q(0.84, 11.8) + ' Z', '#4a2a14', 1.3);
    if(Math.abs(V.c) > 0.25) s += '<rect x="-3.8" y="-4.4" width="7.6" height="8.8" rx="1.6" fill="' + K.u('or') + '" stroke="' + O + '" stroke-width="1.1" transform="translate(' + Q(0.79, -cote * 3.5 * V.c) + ') rotate(' + f1(Math.atan2(uy, ux) / RAD - 90) + ')"/>';
  }
  /* la semelle et sa piqûre : à plat sur le sol, ou le long du pied quand le talon est levé */
  var sy = SOL + PSOL * (ta[2] + po[2]) / 2, x1 = Math.min(ta[0], po[0]) - 6, x2 = Math.max(ta[0], po[0]) + 5.6;
  var leve = doux(4, 22, Math.abs(J.pt) / RAD) + doux(1.5, 6, sy - Math.max(ta[1] + 9, po[1] + 7.8));
  if(leve < 0.02) s += PT('M' + f1(x1) + ' ' + f1(sy) + ' L ' + f1(x2) + ' ' + f1(sy), '#2a1c26', 2.6) + couture('M' + f1(x1 + 3) + ' ' + f1(sy - 5.4) + ' L ' + f1(x2 - 3) + ' ' + f1(sy - 5.4), 0.6);
  else {
    var s1 = pj(add(add(J.Ta, J.m, 8.6), J.sd, -4), V), s2 = pj(add(add(J.Po, J.m, 7.4), J.sd, 3.4), V), c1 = pj(add(add(J.Ta, J.m, 3.4), J.sd, -1), V), c2 = pj(add(add(J.Po, J.m, 2.2), J.sd, 1), V);
    if(d2(s1, s2) > 6) s += '<g clip-path="url(#' + cid + ')">' + PT(U.poly([s1, s2], false), '#2a1c26', 2.6) + couture(U.poly([c1, c2], false), 0.6) + '</g>';
  }
  /* le revers de la botte, et son ombre sur la tige : il suit le tibia */
  var pl = 3.2 * V.c, rw = 14.2 * jb, rw2 = 13.8 * jb, dr = 'M' + f1(-rw) + ' 0 Q 0 ' + f1(pl) + ' ' + f1(rw) + ' 0 L ' + f1(rw2) + ' 9.5 Q 0 ' + f1(9.5 + pl * 1.6) + ' ' + f1(-rw2) + ' 9.5 Z';
  var rev = ul > 8 ? f1(Math.atan2(uy, ux) / RAD - 90) : 0;
  s += '<g transform="translate(' + f1(bq[0] - ux * 9) + ' ' + f1(bq[1] - uy * 9) + ') rotate(' + rev + ')"><path d="' + dr + '" transform="translate(0 4.5)" fill="#000" opacity=".22"/>' + PC(dr, '#8a5a30', 1.6) + PF(dr, K.u('grain'), ' opacity=".4"') + couture('M-12 2.6 Q 0 ' + f1(2.6 + pl) + ' 12 2.6', 0.6) + '</g>';
  /* EN TENUE DE COMBAT : la genouillère de cuir, posée sur le devant du genou (là où il pointe), avec sa sangle */
  if(K.combat){
    var kd = sub(J.Kn, mixv(J.Ha, J.An, 0.5)), pole = P['genou' + J.cle] || [cote * 0.25, 0, 1], kf = lon(kd) > 3 ? uni(kd) : uni(pole);
    var kc = pj(add(J.Kn, kf, 7), V), ka = pj(add(add(J.Kn, kf, 7), J.dj, -9), V), kb = pj(add(add(J.Kn, kf, 6), J.dj, 9), V), vis = 0.45 + 0.55 * Math.abs(dot(kf, [V.s, 0, V.c]));
    var gk = gelule(ka[0], ka[1], 8 + 3.5 * vis, kb[0], kb[1], 7 + 3 * vis);
    s += PC(gk, K.u('cuir'), 2) + PF(gk, K.u('grain'), ' opacity=".45"') + PT('M' + f1(ka[0]) + ' ' + f1(ka[1] + 2) + ' Q ' + f1(kc[0] + 2) + ' ' + f1(kc[1]) + ' ' + f1(kb[0]) + ' ' + f1(kb[1] - 2), '#f0c090', 1.4, ' opacity=".35"') +
      couture('M' + f1(kc[0] - 9) + ' ' + f1(kc[1] + 6) + ' Q ' + f1(kc[0]) + ' ' + f1(kc[1] + 9) + ' ' + f1(kc[0] + 9) + ' ' + f1(kc[1] + 6), 0.5);
  }
  return {cuisse:cuisse, botte:s, svg:cuisse + s, dCuisse:dcu, dBotte:botte};
}

/* ---------- Le carquois : en travers du dos, il dépasse derrière SON épaule gauche ; il suit la poitrine ---------- */
function carquois(K, V, T){
  var B = pj(T.buste([8, 198, -21]), V), Tp = pj(T.buste([40, 116, -19]), V), ux = Tp[0] - B[0], uy = Tp[1] - B[1], l = Math.sqrt(ux * ux + uy * uy) || 1;
  ux /= l; uy /= l;
  var nx = -uy, ny = ux, s = '';
  function Q(a, n){ return [B[0] + ux * a + nx * n, B[1] + uy * a + ny * n]; }
  /* les flèches */
  [[-5, 15], [0.5, 20], [5.4, 13]].forEach(function(f){
    var a = Q(l - 2, f[0]), b = Q(l + f[1], f[0] * 1.15), c1 = Q(l + f[1] - 7.5, f[0] * 1.15 - 3.2), c2 = Q(l + f[1] - 7.5, f[0] * 1.15 + 3.2), d1 = Q(l + f[1] + 1.5, f[0] * 1.15);
    s += PT(U.poly([a, b], false), '#d9cbb0', 2.2) + PC(U.poly([c1, d1, c2, Q(l + f[1] - 5.5, f[0] * 1.15)]), '#b8bcc8', 1.2);
  });
  var corps = U.poly([Q(l, -10.6), Q(l, 10.6), Q(5, 9.4), Q(0, 5), Q(0, -5), Q(5, -9.4)]);
  s += PC(corps, K.u('cuir'), 2.2) + PF(corps, K.u('grain'), ' opacity=".42"') + PF(corps, K.u('relM'), ' opacity=".5"') +
    PC(U.poly([Q(l - 12, -10.9), Q(l - 12, 10.9), Q(l - 6, 10.9), Q(l - 6, -10.9)]), '#c9b07a', 1.3) +
    couture(U.poly([Q(l - 16, -8.6), Q(8, -7.6)], false), 0.45) + PT(U.poly([Q(l * 0.5, -6), Q(l * 0.22, -5)], false), '#f0c090', 1.6, ' opacity=".4"');
  return {svg:s};
}

/* ==========================================================
   HV.corps(K, h, V, P) → les morceaux, à ranger par le pantin : {derriere, jambes, cou(…), torse, devant, tete…}
   P : la pose (hv-pantin.js, HV.POSES.repos en donne toutes les clés).
   ========================================================== */
HV.corps = function(K, h, V, P){
  P = P || {};
  gabarit(K);
  var T = tronc(V, P), ba = P.bang || Z3, ds = P.dos || Z3;
  var jg = jambe(V, -1, P, T), jd = jambe(V, 1, P, T);
  draper(T, jg.dc, jd.dc);
  var bG = bras(V, -1, P, T), bD = bras(V, 1, P, T);
  /* (quand elle tend l'arc, la corde passe par les doigts de l'autre main) */
  if(P.tendu > 0.02) P._encoche = add(bD.W, bD.da, 12);
  var av = mv(T.Mb, [0, 0, 1]), dos = -av[0] * V.s + av[2] * V.c < -0.15;      /* (de dos : le carquois passe devant) */
  var cq = h.role === 'pisteur' || !h.role ? carquois(K, V, T) : null;
  var avant = [], fond = [], SEUIL = -8;
  /* (une main près de la tête et plus près de nous qu'elle : son bras passe devant, même si l'épaule est derrière — vue de dos, la
     main qui va chercher une flèche dans le carquois, derrière sa tête ; Romain, 16 h 39 : « le mouvement du bras qui se relève, il y
     est pas toujours ») */
  var tH = pj(T.lieu([0, 118, -2]), V);
  [bG, bD].forEach(function(b){ var w = pj(b.W, V); b.prTete = (w[2] > tH[2] + 6 && w[1] < tH[1] + 12 && Math.abs(w[0] - tH[0]) < 62) || (b.cle === 'D' && P.mainSurTete > 0.5 && dos && w[1] < tH[1] + 60);
    /* (le bâton du Sage : son cristal, à la hauteur de la tête, plus près de nous qu'elle, passe devant elle) */
    if(!b.prTete && b.cle === 'G' && K.baton && !(P.sansBaton > 0.5)){ var cr = pj(add(b.W, [0, -138, 0]), V); b.prTete = cr[2] > tH[2] + 4 && Math.abs(cr[0] - tH[0]) < 70 && Math.abs(cr[1] - tH[1]) < 80; } });
  /* (une main cachée par le buste — de dos, la main qui tire la corde vers son menton, de l'autre côté — : tout son bras passe
     derrière le buste, même si son coude, tiré en arrière, est de notre côté : on voit le coude dépasser, pas la main par-dessus
     l'épaule — Romain, 17 h 44 : « elle passe par-dessus les textures ») */
  /* (une main derrière le cou ou le menton — celle qui tire la corde, vue de dos — : son bras reste devant le dos (on voit le coude
     tiré en arrière par-dessus l'épaule), mais le cou et le haut des épaules cachent la main : sousCou, plus bas ; derrière la tête,
     ce sont les cheveux qui la cachent) */
  var tN = pj(T.lieu([0, 130, 0]), V);
  /* (la tête, vue comme une ellipse : où elle est à l'écran et sa profondeur — le même calcul que plus bas pour la poser au bout du
     cou ; son dessin va de 57 au-dessus à 34 au-dessous du point où elle est posée, moins 28) */
  var co0 = borne(P.couche || 0, 0, 1), yaw0 = ba[2] + ds[2] + (P.tete || 0), ho0 = P.hoche || 0;
  var nd0 = uni(add(mul(mv(T.M[0], [0, -1, 0]), 0.5 + 0.5 * co0), mv(mm(RY(yaw0), RX(ho0 * 0.5)), [0, -1, 0]), 0.5 - 0.5 * co0));
  var pH0 = pj(add(T.lieu([0, 139, -2]), nd0, 19), V), tEl = {x:pH0[0], y:pH0[1] - 36, rx:40, ry:46, d:pH0[2]};
  function dansTete(q){ var a = (q[0] - tEl.x) / tEl.rx, c = (q[1] - tEl.y) / tEl.ry; return a * a + c * c < 1; }
  [bG, bD].forEach(function(b){ b.sousBuste = T.devant(b.w[0], b.w[1], b.w[2], 4, 'haut') + T.devant(b.m[0], b.m[1], b.m[2], 4, 'haut') < 0;
    b.sousCou = !b.prTete && ((b.w[2] < tN[2] - 3 && d2(b.w, tN) < 40) || (b.w[2] < tEl.d - 4 && dansTete(b.w))); });
  [bG, bD].sort(function(a, b){ return a.fond - b.fond; }).forEach(function(b){ ((b.fond < SEUIL || b.sousBuste) && !b.prTete ? fond : avant).push(b); });
  var pf = fond.map(function(b){ return brasSVG(K, V, b, P, true); });
  /* (un bras derrière elle est aussi caché par le cou, le haut des épaules et la tête : sinon la main qui tire la corde, vue de dos,
     apparaissait dans le creux à côté du cou — Romain, 17 h 44 : « elle passe par-dessus les textures ») */
  var ptsCou = [];
  [[-38, 152, 14], [-38, 152, -14], [-16, 110, 12], [-16, 110, -10], [16, 110, 12], [16, 110, -10], [38, 152, 14], [38, 152, -14]].forEach(function(q){ ptsCou.push(pj(T.buste(q), V)); });
  var dCou = U.poly(enveloppe(ptsCou)), dTete = 'M' + f1(tEl.x - tEl.rx) + ' ' + f1(tEl.y) + ' a' + tEl.rx + ' ' + tEl.ry + ' 0 1 0 ' + 2 * tEl.rx + ' 0 a' + tEl.rx + ' ' + tEl.ry + ' 0 1 0 ' + -2 * tEl.rx + ' 0 Z';
  var idCou = K.n('mCou'), masqueCou = '<defs><mask id="' + idCou + '" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="#fff"/><path d="' + dCou + '" fill="#000"/><path d="' + dTete + '" fill="#000"/></mask></defs>';
  var der = (cq && !dos ? cq.svg : '') + (pf.length ? masqueCou + '<g mask="url(#' + idCou + ')">' + pf.map(function(o){ return brasTout(o); }).join('') + '</g>' : '');
  var pa = avant.map(function(b){ return brasSVG(K, V, b, P, false); });
  /* LES JAMBES : celle du fond d'abord. Elles sont dessinées après le buste ; chaque morceau (la cuisse, la botte) est caché là
     où la poitrine ou la jupe est devant lui (on regarde, en plusieurs points du morceau, ce qui est le plus près de nous). */
  var J2 = [jg, jd].sort(function(a, b){ return a.fond - b.fond; }), jb = '', dbg = [], membres = [], jambesInfo = [], sousRobe = [];
  function prof(){ var s = 0, i; for(i = 0; i < arguments.length; i++) s += pj(arguments[i], V)[2]; return s / arguments.length; }
  function morceau(svg, pts, r, nom){
    var R = cote3(T, pts, r), id = R.haut < 0 && R.jupe < 0 ? 'mHJ' : R.haut < 0 ? 'mH' : R.jupe < 0 ? 'mJ' : '';
    dbg.push([nom, R.haut, R.jupe]);
    return id ? '<g mask="url(#' + K.n(id) + ')">' + svg + '</g>' : svg;
  }
  /* LA CUISSE ET LA JUPE (Romain, 23 novembre, 13 h 36 et 14 h 11 : « il faut faire très attention aux superpositions ») : la
     cuisse est à moitié dans la tunique. On regarde la jupe par petits carreaux : la cuisse est cachée exactement là où un carreau
     de la jupe est devant elle (près du bassin, elle est dedans, donc toujours cachée ; plus loin, la jupe posée sur la cuisse la
     cache jusqu'à l'ourlet ; le pan de derrière, lui, est derrière elle). Et l'ourlet passe par-dessus la cuisse, avec son trait. */
  var Rj = T.coques() && T.tours, lHautC = T.coques().filter(function(c1){ return c1.y1 <= YJ + 0.1; }).map(function(c1){ return c1.d; });
  function jupeSurCuisse(j){
    var a = pj(j.Ha, V), b = pj(j.Kn, V), vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1, d = '', ourlet = '', k, i, n = 24, der = Rj.length - 2;
    /* (de combien ce point de la jupe est devant la cuisse : > 0, devant ; < 0, derrière ; loin : la distance à la cuisse) */
    function ecart(x, y, f){
      var t = borne(((x - a[0]) * vx + (y - a[1]) * vy) / l2, 0, 1), cx = a[0] + vx * t - x, cy = a[1] + vy * t - y, r = vers(13.2, 10.6, t), u2 = cx * cx + cy * cy;
      return {g:f - (vers(a[2], b[2], t) + Math.sqrt(Math.max(0, r * r - u2)) - 1), loin:Math.sqrt(u2) - r};
    }
    function coupe(pl, gs){
      /* (la partie d'un triangle où la jupe est devant : on coupe là où l'écart passe par zéro ; ce bord-là est le bord de la jupe
         posée sur la cuisse : il a son trait) */
      var out = [], m, X = [];
      for(m = 0; m < pl.length; m++){
        var p1 = pl[m], p2 = pl[(m + 1) % pl.length], g1 = gs[m], g2 = gs[(m + 1) % pl.length];
        if(g1 >= 0) out.push(p1);
        if((g1 >= 0) !== (g2 >= 0)){ var u = g1 / (g1 - g2), c = [vers(p1[0], p2[0], u), vers(p1[1], p2[1], u)]; out.push(c); X.push(c); }
      }
      if(X.length === 2) ourlet += 'M' + f1(X[0][0]) + ' ' + f1(X[0][1]) + ' L ' + f1(X[1][0]) + ' ' + f1(X[1][1]) + ' ';
      return out;
    }
    function ajoute(pl){
      if(pl.length < 3) return;
      /* (tous les morceaux tournés dans le même sens : ils s'ajoutent sans s'annuler) */
      var ar = 0, m; for(m = 0; m < pl.length; m++){ var p1 = pl[m], p2 = pl[(m + 1) % pl.length]; ar += p1[0] * p2[1] - p2[0] * p1[1]; }
      d += U.poly(ar < 0 ? pl.slice().reverse() : pl) + ' ';
    }
    var E = [];
    for(k = 20; k <= der + 1; k++){ E[k] = []; for(i = 0; i < n; i++) E[k][i] = ecart(Rj[k][i][0], Rj[k][i][1], Rj[k].f[i]); }
    for(k = 20; k <= der; k++) for(i = 0; i < n; i++){
      var i2 = (i + 1) % n, Q4 = [Rj[k][i], Rj[k][i2], Rj[k + 1][i2], Rj[k + 1][i]], e4 = [E[k][i], E[k][i2], E[k + 1][i2], E[k + 1][i]];
      if(Math.min(e4[0].loin, e4[1].loin, e4[2].loin, e4[3].loin) > 10) continue;
      var g4 = e4.map(function(e){ return e.g; });
      if(g4[0] < 0 && g4[1] < 0 && g4[2] < 0 && g4[3] < 0) continue;
      if(g4[0] >= 0 && g4[1] >= 0 && g4[2] >= 0 && g4[3] >= 0) ajoute(Q4.slice());
      else { ajoute(coupe([Q4[0], Q4[1], Q4[2]], [g4[0], g4[1], g4[2]])); ajoute(coupe([Q4[0], Q4[2], Q4[3]], [g4[0], g4[2], g4[3]])); }
      /* l'ourlet : le bord du bas, là où la jupe est devant la cuisse */
      if(k === der && (g4[2] >= 0 || g4[3] >= 0)){
        var A0 = Q4[3], A1 = Q4[2], h0 = g4[3], h1 = g4[2];
        if(h0 < 0){ var u0 = h0 / (h0 - h1); A0 = [vers(A0[0], A1[0], u0), vers(A0[1], A1[1], u0)]; }
        else if(h1 < 0){ var u1 = h0 / (h0 - h1); A1 = [vers(A0[0], A1[0], u1), vers(A0[1], A1[1], u1)]; }
        ourlet += 'M' + f1(A0[0]) + ' ' + f1(A0[1]) + ' L ' + f1(A1[0]) + ' ' + f1(A1[1]) + ' ';
      }
    }
    return {d:d, ourlet:ourlet};
  }
  J2.forEach(function(j){
    var sv = jambeSVG(K, V, j, P);
    var dehors = cote3(T, [0.5, 0.65, 0.8, 0.95].map(function(t){ return mixv(j.Ha, j.Kn, t); }), 12), js = jupeSurCuisse(j), mid = K.n('mc' + j.cle);
    dbg.push(['cuisse' + j.cle, dehors.haut, dehors.jupe]);
    /* (la poitrine, quand elle est devant la cuisse : penchée en avant, vue de dos…) */
    var autres = dehors.haut < 0 ? lHautC.concat(avant.map(function(B){ return B.manche[0]; })) : [];
    jb = '<mask id="' + mid + '" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="#fff"/>' +
      (js.d ? '<path d="' + js.d + '" fill="#000" stroke="#000" stroke-width="1" stroke-linejoin="round"/>' : '') +
      (autres.length ? '<g fill="#000" stroke="#000" stroke-width="4.6" stroke-linejoin="round">' + autres.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g>' : '') + '</mask>' +
      '<g mask="url(#' + mid + ')">' + sv.cuisse + '</g>';
    /* (le trait du bord de la jupe : caché par le même cache, il ne reste que sa moitié posée sur la cuisse ; un bord qui tombe
       au milieu de la jupe disparaît entièrement) */
    if(js.ourlet){
      var oc = K.n('oc' + j.cle);
      jb += '<clipPath id="' + oc + '"><path d="' + sv.dCuisse + '"/></clipPath><g mask="url(#' + mid + ')"><path d="' + js.ourlet + '" fill="none" stroke="' + O + '" stroke-width="5" stroke-linecap="round" clip-path="url(#' + oc + ')"/></g>';
    }
    var sBotte = morceau(sv.botte, [j.Kn, add(j.Kn, j.dj, 24), j.An, mixv(j.An, j.Po, 0.5), j.Po], 10, 'botte' + j.cle);
    /* UNE JAMBE EST D'UN SEUL TENANT (Romain, 23 novembre, 14 h 11 : « il y a le genou qui est par-dessus la botte, alors que
       l'autre jambe, la botte est bien par-dessus le genou, et c'est comme ça que ça doit être ») : la botte passe par-dessus la
       cuisse, sauf quand, au genou, la cuisse est nettement plus près de nous que le tibia (un genou à terre vu de face : le
       tibia part en arrière). */
    var cuisseDevant = prof(add(j.Kn, j.dc, -10)) > prof(add(j.Kn, j.dj, 10)) + 5;
    var dj = (prof(mixv(j.Ha, j.Kn, 0.6)) + prof(j.Kn, j.An)) / 2;
    /* (sous une longue robe — le Sage —, les jambes sont dessinées d'abord, toutes les deux, et la robe les recouvre : voir plus bas) */
    if(K.robe) sousRobe.push({d:dj, s:cuisseDevant ? sBotte + jb : jb + sBotte});
    else membres.push({d:dj, s:cuisseDevant ? sBotte + jb : jb + sBotte});
    jambesInfo.push({j:j, dCuisse:sv.dCuisse, dBotte:sv.dBotte, d:dj});
  });
  /* LES BRAS DE DEVANT ET LES JAMBES SE RANGENT ENTRE EUX selon la profondeur (le plus loin d'abord) : une main posée au sol devant
     elle passe derrière la botte du genou à terre quand on la voit de dos. Un bras est d'un seul tenant : la manche, puis ce qu'il
     tient (l'arc n'est jamais sous sa propre manche — Romain, 23 novembre, 11 h 22 et 14 h 11), puis la main. Quand les bras passent
     devant la tête (brasDessus, vue de face), ils restent à part, dessinés après elle ; vus de dos, ils restent avec les autres. */
  /* (les bras passent aussi par-dessus la tête quand une main est près d'elle et plus près de nous qu'elle) */
  var dessus = (P.brasDessus > 0.5 && !dos) || avant.some(function(b){ return b.prTete; });
  var cqs = T.coques(), lHaut = cqs.filter(function(c1){ return c1.y1 <= YJ + 0.1; }).map(function(c1){ return c1.d; }),
    lJupe = cqs.filter(function(c1){ return c1.y0 >= YJ - 0.1; }).map(function(c1){ return c1.d; }), defsArc = '';
  /* L'ARC : chaque branche est cachée là où la poitrine, la jupe ou une jambe est devant elle (on compare les profondeurs en
     plusieurs points de la branche) */
  function masqueBranche(pts, nom, avecBras, sauf){
    var occ = [], s1;
    ['haut', 'jupe'].forEach(function(part){ s1 = 0; pts.forEach(function(q){ s1 += T.devant(q[0], q[1], q[2], 2, part); }); if(s1 < 0) occ = occ.concat(part === 'haut' ? lHaut : lJupe); });
    /* un os (de A à B, d'épaisseur r) cache le morceau si, là où il le croise à l'écran, il est plus près de nous que lui */
    function os(a3, b3, r, d){
      var A = pj(a3, V), Bp = pj(b3, V), vx = Bp[0] - A[0], vy = Bp[1] - A[1], l2 = vx * vx + vy * vy || 1, vote = 0;
      pts.forEach(function(q){
        var t = borne(((q[0] - A[0]) * vx + (q[1] - A[1]) * vy) / l2, 0, 1), cx = A[0] + vx * t - q[0], cy = A[1] + vy * t - q[1];
        if(cx * cx + cy * cy > r * r) return;
        vote += vers(A[2], Bp[2], t) + r * 0.6 > q[2] + 1 ? 1 : -1;
      });
      if(vote > 0) occ = occ.concat(d);
    }
    /* (la cuisse : seulement la partie qui sort de la tunique ; dedans, c'est la tunique qui compte) */
    jambesInfo.forEach(function(ji){
      var c0 = mixv(ji.j.Ha, ji.j.Kn, 0.37), p0 = pj(c0, V), p1 = pj(ji.j.Kn, V);
      os(c0, ji.j.Kn, 12, gelule(p0[0], p0[1], 12.2, p1[0], p1[1], 10.6));
      os(ji.j.Kn, ji.j.An, 11, ji.dBotte);
    });
    /* (la corde et les flèches passent DERRIÈRE un bras qui est devant elles — Romain, 16 h 39 : « le fil de l'arc, lui aussi, il est
       censé être derrière le bras ») */
    if(avecBras) [bG, bD].forEach(function(B){ os(B.Ep, B.El, R_EP, B.manche[0]); if(B !== sauf) os(B.El, B.W, R_CO, B.manche[1]); });
    /* (et derrière la tête ou le cou : vue de dos, l'encoche de la flèche et le bout de la corde sont dans la main cachée derrière la
       tête) */
    if(avecBras){
      var vt = 0;
      pts.forEach(function(q){ var dt = dansTete(q), dc = d2(q, tN) < 30; if(!dt && !dc) return; vt += (dt ? q[2] < tEl.d - 4 : q[2] < tN[2] - 3) ? 1 : -1; });
      if(vt > 0) occ = occ.concat([dCou, dTete]);
    }
    if(!occ.length) return '';
    var id = K.n('am' + nom);
    defsArc += '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="4.4" stroke-linejoin="round">' + occ.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g></mask>';
    return id;
  }
  function masquesObjets(B, o, suffixe){
    var m = {};
    if(o.arc) o.arc.morceaux.forEach(function(x){ m[x.nom] = masqueBranche(x.pts, B.cle + suffixe + x.nom, /^(cH|cB|fl)$/.test(x.nom)); });
    if(o.objetPts && o.objetPts.length) m.objet = masqueBranche(o.objetPts, B.cle + suffixe + 'ob', true);
    /* (le bâton : son propre avant-bras ne le cache pas — il est dans le poing, devant le poignet) */
    if(o.morceaux) o.morceaux.forEach(function(x){ m[x.nom] = masqueBranche(x.pts, B.cle + suffixe + x.nom, true, B); });
    return m;
  }
  var mPa = avant.map(function(B, i){ return masquesObjets(B, pa[i], ''); });
  if(!dessus) avant.forEach(function(B, i){ var s0 = brasTout(pa[i], mPa[i]); membres.push({d:prof(B.W), s:B.sousCou ? masqueCou + '<g mask="url(#' + idCou + ')">' + s0 + '</g>' : s0}); });
  /* UN BRAS DU FOND DEVANT UNE JAMBE (elle ramasse un indice, vue de trois quarts : le bras qui descend vers le sol passe devant le
     genou levé) : il est dessiné derrière le buste, puis une deuxième fois avec les jambes, caché là où le buste est (il reste
     donc derrière le buste, mais il passe devant la jambe qui est derrière lui). */
  fond.forEach(function(B, i){
    var dw = prof(B.W);
    /* (seulement si la main ou l'avant-bras passe vraiment sur cette jambe, à l'écran : sinon, au tir vu de dos, la main qui recule
       vers le menton était redessinée par-dessus le bras de l'arc) */
    function prés(ji){
      var pts = [B.w, B.m, B.c2], seg = [[pj(ji.j.Ha, V), ji.j.kn], [ji.j.kn, pj(ji.j.An, V)]];
      return pts.some(function(q){ return seg.some(function(s){ var A = s[0], C2 = s[1], vx = C2[0] - A[0], vy = C2[1] - A[1], l2 = vx * vx + vy * vy || 1,
        t = borne(((q[0] - A[0]) * vx + (q[1] - A[1]) * vy) / l2, 0, 1), dx = A[0] + vx * t - q[0], dy = A[1] + vy * t - q[1]; return dx * dx + dy * dy < 30 * 30; }); });
    }
    if(!jambesInfo.some(function(ji){ return ji.d < dw && prés(ji); })) return;
    membres.push({d:dw, s:'<g mask="url(#' + K.n('mHJ') + ')">' + brasTout(pf[i], masquesObjets(B, pf[i], 'f')) + '</g>'});
  });
  /* LA LONGUE ROBE (K.robe) : les jambes, puis la robe et le manteau par-dessus, avant tous les bras de devant */
  if(K.robe){ sousRobe.sort(function(a, b){ return a.d - b.d; }); membres.push({d:-1e9, s:sousRobe.map(function(m){ return m.s; }).join('') + robeSVG(K, V, T, jg, jd)}); }
  membres.sort(function(a, b){ return a.d - b.d; });
  jb = (defsArc ? '<defs>' + defsArc + '</defs>' : '') + membres.map(function(m){ return m.s; }).join('');
  var tor = torse(K, h, T, P, avant, fond, {ouv:function(){ return J2.map(function(j){ return jambeSVG(K, V, j, P, 'o').svg; }).join(''); }});
  /* la tête : au bout du cou, qui part du haut du buste. Elle reste droite quand le dos se penche (elle regarde devant elle) ;
     P.hoche la fait baisser (> 0) ou lever le nez. */
  var yawT = ba[2] + ds[2] + (P.tete || 0), Vt = U.vue((HV.capDe ? HV.capDe(P) : P.cap || 0) + yawT), ho = P.hoche || 0;
  /* (P.couche, de 0 à 1 : allongée, la tête ne reste plus droite, elle se pose dans le prolongement du cou — Romain, 16 h 39 : au sol,
     « la tête, elle est toute bizarre ») */
  var co = borne(P.couche || 0, 0, 1);
  var upC = mv(T.M[0], [0, -1, 0]), upT = mv(mm(RY(yawT), RX(ho * 0.5)), [0, -1, 0]), N0 = T.lieu([0, 139, -2]), nd = uni(add(mul(upC, 0.5 + 0.5 * co), upT, 0.5 - 0.5 * co)), Hp = add(N0, nd, 19);
  var pN0 = pj(N0, V), pN1 = pj(add(N0, nd, 30), V), lN = d2(pN0, pN1), angN = lN < 1 ? 0 : Math.atan2(pN1[0] - pN0[0], pN0[1] - pN1[1]) / RAD * Math.min(1, lN / 16);
  var pHp = pj(Hp, V), rc = Math.sqrt(77.4 * V.c * V.c + 59.3 * V.s * V.s) * GAB.co, bc = pj(T.lieu([0, 146, -2]), V);
  /* l'ombre au sol : sous les pieds (et sous une main ou un genou posé) */
  var xs = [pj(jg.An, V), pj(jd.An, V)], ys = 0;
  [jg.Kn, jd.Kn, bG.W, bD.W].forEach(function(q){ if(q[1] > SOL - 26) xs.push(pj(q, V)); });
  var xa = 1e9, xb = -1e9; xs.forEach(function(q){ xa = Math.min(xa, q[0]); xb = Math.max(xb, q[0]); ys += q[2] / xs.length; });
  return {T:T, dbg:dbg, dbgBras:[bG, bD].map(function(b){ return {cle:b.cle, fond:b.fond, sousBuste:b.sousBuste, prTete:b.prTete, avant:avant.indexOf(b) >= 0, w:b.w, cou:tN}; }), derriere:der, jambes:'', jambesApres:jb, torse:tor, carquoisDevant:cq && dos ? cq.svg : '',
    devant:dessus ? pa.map(function(o){ return o.manche; }).join('') + pa.map(function(o, i){ return o.paume + objetsTout(o, mPa[i]); }).join('') + pa.map(function(o){ return o.main + (o.apres || ''); }).join('') : '', dos:dos, dessus:dessus,
    cou:function(tDos, ombre){ return cou(K, V, pj(add(Hp, nd, tDos ? 13 : 20), V), bc, rc, ombre); },
    tete:{V:Vt, tx:pHp[0] + 3 * Vt.s, ty:pHp[1] - 28, px:-3 * Vt.s, rot:(P.pen || 0) + ho * Vt.s + co * angN, hocheF:ho * Vt.c, fond:pHp[2] - T.dB},
    ombre:{cx:(xa + xb) / 2, rx:Math.max(50 + 8 * Math.abs(V.s), (xb - xa) / 2 + 32), cy:SOL + 1 + PSOL * ys},
    os:{bassin:T.Pc, hancheG:jg.Ha, hancheD:jd.Ha, genouG:jg.Kn, genouD:jd.Kn, chevilleG:jg.An, chevilleD:jd.An, talonG:jg.Ta, talonD:jd.Ta, orteilG:jg.Po, orteilD:jd.Po,
      epauleG:T.buste([-GAB.ep, 151, 0]), epauleD:T.buste([GAB.ep, 151, 0]), coudeG:bG.El, coudeD:bD.El, poignetG:bG.W, poignetD:bD.W, cou:N0, tete:Hp}};
};

/* ==========================================================
   LE PANTIN CUIT (24 novembre, nuit — Romain, 4 h 14 : « les nouveaux personnages, ils font ramer même mon iPhone […] 24 images
   minimum pour toutes les tablettes, même celles qui sont très lentes »). Redessiner tout le héros à chaque image coûte trop :
   hv-cuit.js le découpe en MORCEAUX dessinés une seule fois (des images), que la carte graphique déplace. Ici, les deux outils
   dont il a besoin, faits avec les mêmes calculs que HV.corps :
   - HV.squelette(K, h, V, P) : seulement où sont les os, à l'écran — presque rien à calculer (pas de dessin) ;
   - HV.morceaux(K, h, V, P) : le dessin de chaque morceau, séparé des autres (sans les caches qui les coupent les uns par les autres :
     c'est l'ordre des morceaux, devant / derrière, qui fera ce travail).
   Les points sont « à l'écran », dans les mesures du dessin (avant le décalage de 150 du pantin), [x, y, profondeur].
   ========================================================== */
function teteDe(T, V, P){
  var ba = P.bang || Z3, ds = P.dos || Z3;
  var yawT = ba[2] + ds[2] + (P.tete || 0), Vt = U.vue((HV.capDe ? HV.capDe(P) : P.cap || 0) + yawT), ho = P.hoche || 0, co = borne(P.couche || 0, 0, 1);
  var upC = mv(T.M[0], [0, -1, 0]), upT = mv(mm(RY(yawT), RX(ho * 0.5)), [0, -1, 0]), N0 = T.lieu([0, 139, -2]), nd = uni(add(mul(upC, 0.5 + 0.5 * co), upT, 0.5 - 0.5 * co)), Hp = add(N0, nd, 19);
  var pN0 = pj(N0, V), pN1 = pj(add(N0, nd, 30), V), lN = d2(pN0, pN1), angN = lN < 1 ? 0 : Math.atan2(pN1[0] - pN0[0], pN0[1] - pN1[1]) / RAD * Math.min(1, lN / 16);
  var pHp = pj(Hp, V);
  return {V:Vt, yaw:yawT, tx:pHp[0] + 3 * Vt.s, ty:pHp[1] - 28, px:-3 * Vt.s, rot:(P.pen || 0) + ho * Vt.s + co * angN, hocheF:ho * Vt.c, fond:pHp[2] - T.dB,
    N0:N0, nd:nd, Hp:Hp, cou0:pN0, bc:pj(T.lieu([0, 146, -2]), V)};
}
/* L'ARC, à l'écran (les mêmes calculs que arcSVG et le début de mainSVG) : ses deux bouts, le milieu de la corde (ou l'encoche, quand
   elle tire), la pointe de la flèche encochée — le pantin cuit fait de l'arc, de chaque moitié de corde et de la flèche des morceaux
   à part, chacun tendu entre deux de ces points */
/* le repère d'une main (comme mainSVG) : Q(a, b, c) → le point (à l'écran) à a le long des doigts, b du côté du pouce, c vers la paume */
function repereMain(V, B, P){
  var cote = B.cote, d = B.dir, pc = (B.tourne || function(v){ return v; })(B.pouce || P['pouce' + B.cle] || [-cote * 0.25, 0.1, 1]);
  var w = sub(pc, mul(d, dot(pc, d))); if(lon(w) < 0.08) w = sub([0, -1, 0.2], mul(d, dot([0, -1, 0.2], d)));
  w = uni(w);
  var n = mul(croix(d, w), -cote);
  return {d:d, w:w, n:n, Q:function(a, b, c){ return pj(add(add(add(B.W, d, a), w, b), n, c || 0), V); }};
}
/* le bâton du Sage, la louche de l'Alchimiste (SA main droite : bG) : deux points le long de chacun (comme mainSVG) */
function objetsOs(V, B, P, K){
  var R = {}, M = repereMain(V, B, P);
  if(K.baton && !(P.sansBaton > 0.5)) R.baton = {a:M.Q(7.6, -176, 2.4), b:M.Q(7.6, 165, 2.4), cristal:M.Q(7.6, 142, 2.4), cri:borne(P.cristal || 0, 0, 1)};
  if((P.louche || 0) > 0.05){ var lr = (P.loucheR || 0) * RAD, lco = Math.cos(lr), lsi = Math.sin(lr);
    R.louche = {a:M.Q(7.6 - 12 * lsi, -12 * lco, 2.4), b:M.Q(7.6 + 52 * lsi, 52 * lco, 2.4), o:doux(0.05, 0.5, P.louche)}; }
  return R;
}
function arcOs(V, B, P){
  var M = repereMain(V, B, P), d = M.d, n = M.n, Hd = add(add(B.W, d, 8), n, 3.5);
  var Pa = P; if(B.tourne){ Pa = {arcAxe:B.tourne(P.arcAxe || [0, 1, 0]), arcDir:B.tourne(P.arcDir || [-0.82, 0, 0.57]), arcLong:P.arcLong, tendu:P.tendu}; }
  var axe = uni(Pa.arcAxe || [0, 1, 0]), e0 = Pa.arcDir || [-0.82, 0, 0.57], e = sub(e0, mul(axe, dot(e0, axe))), L = Pa.arcLong || 101, td = Pa.tendu || 0;
  e = uni(lon(e) < 0.05 ? [-0.82, 0, 0.57] : e);
  function Q(u, v){ return pj(add(add(Hd, e, u), axe, v), V); }
  var bx = -16.5 - 9 * td, by = L - 5 * td, t1 = Q(bx, -by), t2 = Q(bx, by), mid = [(t1[0] + t2[0]) / 2, (t1[1] + t2[1]) / 2, (t1[2] + t2[2]) / 2], pt = null;
  if(td > 0.02 && P._encoche){ var nk = pj(P._encoche, V); mid = [vers(mid[0], nk[0], td), vers(mid[1], nk[1], td), vers(mid[2], nk[2], td)]; pt = Q(20, 0); }
  /* (le ventre de l'arc : de quel côté de la ligne des bouts il se courbe, à l'écran) */
  var ve = Q(5.5, 0), sens = (t2[0] - t1[0]) * (ve[1] - t1[1]) - (t2[1] - t1[1]) * (ve[0] - t1[0]);
  return {t1:t1, t2:t2, mid:mid, pt:pt, td:td, sens:sens < 0 ? -1 : 1};
}
function osDe(T, V, P, jg, jd, bG, bD, K){
  /* (sous : la main est derrière le buste, là où on le voit — comme sousBuste de HV.corps, en plus simple : tout le bras passe derrière) */
  var cb = pj(T.Cb, V), tN = pj(T.lieu([0, 130, 0]), V);
  function b2(B){ var sous = B.w[2] < T.dB - 6 && Math.abs(B.w[0] - cb[0]) < 34 && B.w[1] > cb[1] - 50 && B.w[1] < cb[1] + 95;
    /* (et la main derrière le cou ou la tête — celle qui tire la corde, vue de dos : comme sousCou) */
    if(!sous && B.w[2] < tN[2] - 3 && d2(B.w, tN) < 46) sous = true;
    return {e:B.e, c2:B.c2, w:B.w, m:B.m, fond:B.fond, sous:sous}; }
  function j2(j){ return {ha:pj(j.Ha, V), kn:j.kn, an:pj(j.An, V), ta:pj(j.Ta, V), po:pj(j.Po, V), fond:j.fond}; }
  var av = mv(T.Mb, [0, 0, 1]);
  var S = {bras:{G:b2(bG), D:b2(bD)}, jambes:{G:j2(jg), D:j2(jd)}, bassin:pj(T.Pc, V), haut:pj(T.lieu([0, 139, -2]), V), taille:pj(T.lieu([0, 204, 0]), V),
    dos:-av[0] * V.s + av[2] * V.c < -0.15, tete:teteDe(T, V, P)};
  if(K && P.arc !== false && K.arme === 'arc') S.arc = arcOs(V, bG, P);
  if(K){ var ob = objetsOs(V, bG, P, K); if(ob.baton) S.baton = ob.baton; if(ob.louche) S.louche = ob.louche; }
  return S;
}
/* les os d'une pose, en 3D (les mêmes que HV.corps(…).os), sans rien dessiner : HV.os (hv-pantin.js) s'en sert — avant, il faisait
   tout le dessin pour les avoir (4 ms à chaque fois, et les effets du donjon les demandent à chaque image) */
HV.corpsOs = function(K, h, V, P){
  P = P || {};
  gabarit(K);
  var T = tronc(V, P), jg = jambe(V, -1, P, T), jd = jambe(V, 1, P, T), bG = bras(V, -1, P, T), bD = bras(V, 1, P, T), tt = teteDe(T, V, P);
  return {bassin:T.Pc, hancheG:jg.Ha, hancheD:jd.Ha, genouG:jg.Kn, genouD:jd.Kn, chevilleG:jg.An, chevilleD:jd.An, talonG:jg.Ta, talonD:jd.Ta, orteilG:jg.Po, orteilD:jd.Po,
    epauleG:T.buste([-GAB.ep, 151, 0]), epauleD:T.buste([GAB.ep, 151, 0]), coudeG:bG.El, coudeD:bD.El, poignetG:bG.W, poignetD:bD.W, cou:tt.N0, tete:tt.Hp};
};
HV.squelette = function(K, h, V, P){
  P = P || {};
  gabarit(K);
  var T = tronc(V, P), jg = jambe(V, -1, P, T), jd = jambe(V, 1, P, T), bG = bras(V, -1, P, T), bD = bras(V, 1, P, T);
  if(P.tendu > 0.02) P._encoche = add(bD.W, bD.da, 12);
  return osDe(T, V, P, jg, jd, bG, bD, K);
};
/* un bras en trois morceaux : le haut (sans le trait du bout du coude : c'est l'avant-bras, dessous, qui fait le contour du coude),
   l'avant-bras (tout son contour, son brassard, les plis du coude), la main et ce qu'elle tient */
function brasEnMorceaux(K, V, B, P){
  var c2 = B.c2, w = B.w, L = B.manche;
  var haut = PT(cotes(B.e[0], B.e[1], R_EP, c2[0], c2[1], R_CO), O, 4.4) +
    '<path d="' + L[0] + '" fill="' + K.u('tunP') + '"/><path d="' + L[0] + '" fill="' + K.u('trame') + '" opacity=".34"/>' +
    relief(K, 'rb' + B.cle + '0', B.e[0], B.e[1], c2[0], c2[1], R_EP) + PF(L[0], K.u('rb' + B.cle + '0'));
  /* (un bras DEVANT le buste : comme brasSVG, son trait et son relief naissent en fondu sous l'aisselle — il se fond dans la
     poitrine ; la manche part bien de l'épaule, de la couleur de la tunique : le buste cuit n'a pas le haut des bras) */
  var fx = c2[0] - B.a[0], fy = c2[1] - B.a[1], fl = Math.sqrt(fx * fx + fy * fy) || 1, lf = Math.min(16, fl * 0.45), fid = K.n('fc' + B.cle);
  fx /= fl; fy /= fl;
  var fondu = ' mask="url(#' + fid + ')"';
  var hautDevant = '<linearGradient id="' + fid + 'g" gradientUnits="userSpaceOnUse" x1="' + f1(B.a[0]) + '" y1="' + f1(B.a[1]) + '" x2="' + f1(B.a[0] + fx * lf) + '" y2="' + f1(B.a[1] + fy * lf) + '"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
    '<mask id="' + fid + '" maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="600"><rect x="-260" y="-120" width="520" height="600" fill="url(#' + fid + 'g)"/></mask>' +
    '<path d="' + cotes(B.a[0], B.a[1], B.ra, c2[0], c2[1], R_CO) + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linecap="round"' + fondu + '/>' +
    '<path d="' + L[0] + '" fill="' + K.u('tunP') + '"/><path d="' + L[0] + '" fill="' + K.u('trame') + '" opacity=".34"/>' +
    relief(K, 'rb' + B.cle + '0', B.e[0], B.e[1], c2[0], c2[1], R_EP) + PF(L[0], K.u('rb' + B.cle + '0'), fondu);
  var o = brasSVG(K, V, B, P, true);
  /* (l'avant-bras : la manche entière moins le haut du bras — on la redessine à part, avec son contour à elle) */
  var bas = PC(L[1], K.u('tunP'), 4.4) + '<path d="' + L[1] + '" fill="' + K.u('trame') + '" opacity=".34"/>' +
    relief(K, 'rb' + B.cle + '1', c2[0], c2[1], w[0], w[1], R_CO) + PF(L[1], K.u('rb' + B.cle + '1'));
  /* (le brassard, les plis : la fin de o.manche, après les reliefs — on la reprend telle quelle) */
  var i = o.manche.lastIndexOf('clip-path="url(#' + K.n('xb' + B.cle) + ')"/>');
  if(i >= 0) bas += o.manche.slice(i + ('clip-path="url(#' + K.n('xb' + B.cle) + ')"/>').length);
  /* (l'arc n'est pas dans la main : ses morceaux sont à part — arcOs) */
  /* (le bâton du Sage — ses morceaux — et la louche de l'Alchimiste ne sont pas dans la main non plus : objetsOs) */
  var objet = o.louche ? o.objet.replace(o.louche, '') : o.objet;
  var R = {haut:haut, hautDevant:hautDevant, bas:bas, main:o.paume + objetsTout({objet:objet}) + o.main + (o.apres || ''), o:o,
    baton:(o.morceaux || []).map(function(x){ return x.svg; }).join(''), louche:o.louche || ''};
  if(o.arc){
    var A = {}; o.arc.morceaux.forEach(function(x){ A[x.nom] = x.svg; });
    R.arc = (A.bH || '') + (A.bB || '') + o.arc.poignee; R.cordeH = A.cH || ''; R.cordeB = A.cB || ''; R.fleche = A.fl || '';
  }
  return R;
}
HV.morceaux = function(K, h, V, P){
  P = P || {};
  gabarit(K);
  var T = tronc(V, P), jg = jambe(V, -1, P, T), jd = jambe(V, 1, P, T);
  draper(T, jg.dc, jd.dc);
  var bG = bras(V, -1, P, T), bD = bras(V, 1, P, T);
  if(P.tendu > 0.02) P._encoche = add(bD.W, bD.da, 12);
  var os = osDe(T, V, P, jg, jd, bG, bD, K), M = {os:os, bras:{}, jambes:{}};
  [bG, bD].forEach(function(B){ M.bras[B.cle] = brasEnMorceaux(K, V, B, P); });
  [jg, jd].forEach(function(j){ var sv = jambeSVG(K, V, j, P); M.jambes[j.cle] = {cuisse:sv.cuisse, botte:sv.botte}; });
  var cq = h.role === 'pisteur' || !h.role ? carquois(K, V, T) : null;
  M.carquois = cq ? cq.svg : '';
  M.buste = torse(K, h, T, P, [], [], {ouv:function(){ return ''; }});
  if(K.robe) M.robe = robeSVG(K, V, T, jg, jd);
  var tt = os.tete, rc = Math.sqrt(77.4 * V.c * V.c + 59.3 * V.s * V.s) * GAB.co;
  M.cou = function(tDos, ombre){ return cou(K, V, pj(add(tt.Hp, tt.nd, tDos ? 13 : 20), V), tt.bc, rc, ombre); };
  /* (l'ombre au sol, comme HV.corps : sous les pieds — l'anneau doré de son tour s'y pose) */
  var xs = [pj(jg.An, V), pj(jd.An, V)], ys = 0, xa = 1e9, xb = -1e9;
  [jg.Kn, jd.Kn, bG.W, bD.W].forEach(function(q){ if(q[1] > SOL - 26) xs.push(pj(q, V)); });
  xs.forEach(function(q){ xa = Math.min(xa, q[0]); xb = Math.max(xb, q[0]); ys += q[2] / xs.length; });
  M.ombre = {cx:(xa + xb) / 2, rx:Math.max(50 + 8 * Math.abs(V.s), (xb - xa) / 2 + 32), cy:SOL + 1 + PSOL * ys};
  return M;
};
HV.SOL = SOL;
})(window);


/* moteur des héros en volume (jeu/heros-vues/src/hv-pantin.js) */
/* ==========================================================
   Les héros « en volume » — 5 sur 5 : LE PANTIN (ce qui assemble le dessin, et ce qui le fait vivre).
   HV.dessin(h, P, o) → le dessin (du SVG) du héros h dans la pose P, pour un cadre 300 × 440 :
     P.cap : vers où le corps est tourné (0 de face, 90 à droite, -90 à gauche) ; P.tete : la tête en plus, par rapport au buste ;
     P.pen : elle penche la tête ; P.hoche : elle la baisse ; P.rx, P.ry : le regard ; P.yo : les yeux ouverts ; P.souffle ;
     P.qx, P.qz : la queue de cheval ; et tout ce que dit une pose (HV.POSES, plus bas).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, RAD = HV.RAD, f1 = U.f1;

HV.dessin = function(h, P, o){
  o = o || {}; P = P || {};
  var B0 = HV.POSES.repos, P2 = {}, kk;
  for(kk in B0) P2[kk] = B0[kk];
  for(kk in P) P2[kk] = P[kk];
  P = P2;
  /* (P.tourne : elle se tourne d'elle-même, en plus de l'angle où on la regarde — un geste « elle regarde à droite ») */
  var K = o.K || HV.contexte(o.id || 'hv', h), Vb = U.vue(HV.capDe(P));
  /* (les anciens : le haut du dos un peu voûté, en plus de la pose — K.voute, hv-corps.js GABARITS) */
  if(K.voute){ var d0 = P.dos || [0, 0, 0]; P.dos = [d0[0] + K.voute, d0[1], d0[2]]; }
  var C = HV.corps(K, h, Vb, P), tp = C.tete, Vt = tp.V;
  /* la tête : au bout du cou (hv-corps.js). Quand elle baisse la tête, vue de profil la tête penche vers l'avant ; vue de face,
     ce sont les traits du visage et la frange qui descendent. La queue de cheval, elle, continue de pendre vers le bas. */
  var rot = tp.rot, pend = Math.tan(Math.max(-0.9, Math.min(0.9, rot * RAD))) * 100 * (1 - Math.max(0, Math.min(1, P.couche || 0)));
  P.hocheF = tp.hocheF; P.qx = (P.qx || 0) + pend * Vt.c; P.qz = (P.qz || 0) + pend * Vt.s;
  var coif = HV.COIFFURES[h.coiffure] || HV.COIFFURES.queue;
  var CH = HV.cheveux(K, coif, Vt, P), T = HV.tete(K, h, Vt, P, CH);
  var tT = 'translate(' + f1(tp.tx + (P.tx || 0)) + ' ' + f1(tp.ty + (P.ty || 0)) + ')' + (rot ? ' rotate(' + f1(rot) + ' ' + f1(tp.px) + ' 28)' : '') +
    /* (l'enfant : la tête un peu plus grosse pour son corps, grandie depuis le cou — K.teteK) */
    (K.teteK !== 1 ? ' translate(' + f1(tp.px) + ' 28) scale(' + K.teteK + ') translate(' + f1(-tp.px) + ' -28)' : '');
  var ombreCou = '<path d="' + T.peau + '" transform="translate(1.2 7.5) ' + tT + '" fill="' + K.peau.ombre + '" opacity=".8"/>';
  var om = C.ombre, lv = Math.max(0, P.leve || 0), ko = 1 / (1 + lv / 90);
  var s = '<ellipse cx="' + f1(150 + om.cx) + '" cy="' + f1(om.cy) + '" rx="' + f1(om.rx * ko) + '" ry="' + f1(7 * ko) + '" fill="' + K.u('ombre') + '"' + (lv ? ' opacity="' + f1(ko) + '"' : '') + '/>';
  /* (la moitié de devant est dessinée dans le groupe du corps, décalé de 150 et levé de lv : on la décale d'autant) */
  var rxA = Math.max(86, om.rx * 1.35), AN = {der:anneau(P, 150 + om.cx, om.cy, rxA).der, dev:anneau(P, om.cx, om.cy + lv, rxA).dev};
  s += AN.der;
  /* l'ordre des morceaux : la tête vue de face (les cheveux de derrière d'abord, le visage à la fin) ou de dos (le visage d'abord,
     puis le cou, puis les cheveux par-dessus) ; la queue de cheval passe devant tout quand elle est de notre côté */
  var tDos = Vt.c < -0.15, G1 = '<g transform="' + tT + '">', dessus = C.dessus, bras = dessus ? '' : C.devant;
  var nuque = '<g transform="' + tT + '"><rect x="-30" y="12" width="60" height="13" fill="' + K.peau.ombre + '" opacity=".75"/></g>';
  var visage = G1 + (tDos ? CH.dos + CH.devant : T.svg + CH.devant + T.sourcils) + (CH.queueDevant ? CH.queue : '') + '</g>';
  /* (penchée loin de nous, vue de dos : la tête est derrière les épaules) */
  var loin = tp.fond < -22;
  s += '<g transform="translate(150 ' + f1(-lv) + ')">' + G1 + (CH.queueDevant ? '' : CH.queue) + (tDos ? '' : CH.dos) + '</g>' + C.derriere + C.jambes +
    (tDos ? G1 + T.svg + '</g>' : '') + (loin ? visage : '') + C.cou(tDos, tDos ? nuque : ombreCou) + C.torse + C.carquoisDevant + C.jambesApres + AN.dev + bras +
    (loin ? '' : visage) + (dessus ? C.devant : '') + '</g>';
  /* (l'enfant, les anciens : tout le héros plus petit, posé sur le sol au milieu — K.echelle ; HV.os en tient compte) */
  if(K.echelle !== 1) s = '<g transform="translate(150 ' + HV.SOL + ') scale(' + K.echelle + ') translate(-150 ' + (-HV.SOL) + ')">' + s + '</g>';
  return s;
};
/* L'ANNEAU DE CELUI DONT C'EST LE TOUR (Romain, 23 novembre, 18 h 51 : « le cercle est censé passer derrière les jambes […] le devant,
   il passe devant les bottes et l'arrière du cercle, il passe derrière les bottes […] un joli effet ») : un anneau doré posé au sol,
   en deux moitiés — celle du fond est dessinée avant elle, celle de devant après ses bottes — avec sa lueur, un reflet qui tourne,
   et de petites étincelles qui montent (celles du fond derrière elle, celles de devant devant).
   P.anneau : de 0 à 1 (il apparaît) ; P.anneauT : le temps (pour qu'il vive). → {der, dev} */
function anneau(P, cx, cy, rx){
  var a = Math.max(0, Math.min(1, P.anneau || 0)), t = P.anneauT || 0;
  if(a < 0.01) return {der:'', dev:''};
  var ry = rx * 0.24, k = 0.86 + 0.14 * a, R = rx * k, Ry = ry * k, pul = 0.85 + 0.15 * Math.sin(t * 3.2);
  function arc(haut){ return 'M' + f1(cx - R) + ' ' + f1(cy) + ' A' + f1(R) + ' ' + f1(Ry) + ' 0 0 ' + (haut ? 1 : 0) + ' ' + f1(cx + R) + ' ' + f1(cy); }
  function moitie(haut){
    var d = arc(haut), o = a * (haut ? 0.75 : 1), s = '';
    /* (la lueur, l'anneau, son bord clair, le reflet qui tourne) */
    s += '<path d="' + d + '" fill="none" stroke="#ffcf3a" stroke-width="16" stroke-linecap="round" opacity="' + f1(0.18 * o * pul) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#ffd84a" stroke-width="8" stroke-linecap="round" opacity="' + f1(0.35 * o * pul) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#7a4a10" stroke-width="6.4" stroke-linecap="round" opacity="' + f1(0.9 * o) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#ffd23f" stroke-width="3.6" stroke-linecap="round" opacity="' + f1(o) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#fff6c8" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="14 26" stroke-dashoffset="' + f1((haut ? 1 : -1) * t * 40) + '" opacity="' + f1(0.9 * o) + '"/>';
    /* (les étincelles qui montent) */
    for(var i = 0; i < 8; i++){
      var th = i / 8 * Math.PI * 2 + t * 0.6, sy = Math.sin(th);
      if((sy < 0) !== haut) continue;
      var u = (t * 0.7 + i * 0.37) % 1, x = cx + R * Math.cos(th), y = cy + Ry * sy - 46 * u, r = 3.4 * (1 - u * 0.6), op = a * Math.sin(Math.PI * u) * (haut ? 0.7 : 1);
      s += '<path d="M' + f1(x) + ' ' + f1(y - r * 1.8) + ' L' + f1(x + r * 0.5) + ' ' + f1(y - r * 0.5) + ' L' + f1(x + r * 1.8) + ' ' + f1(y) + ' L' + f1(x + r * 0.5) + ' ' + f1(y + r * 0.5) +
        ' L' + f1(x) + ' ' + f1(y + r * 1.8) + ' L' + f1(x - r * 0.5) + ' ' + f1(y + r * 0.5) + ' L' + f1(x - r * 1.8) + ' ' + f1(y) + ' L' + f1(x - r * 0.5) + ' ' + f1(y - r * 0.5) + ' Z" fill="#fff2a8" opacity="' + f1(op) + '"/>';
    }
    return s;
  }
  return {der:moitie(true), dev:moitie(false)};
}
HV._anneau = anneau;      /* (le pantin cuit le dessine une fois, en deux moitiés : hv-cuit.js) */
/* les os d'une pose (où sont le bassin, les genoux, les mains…), dans les mesures du héros : pour vérifier une pose, poser un objet */
HV.os = function(h, P){
  var B0 = HV.POSES.repos, P2 = {}, kk;
  for(kk in B0) P2[kk] = B0[kk];
  for(kk in P) P2[kk] = P[kk];
  var K = HV.contexte('os', h);
  if(K.voute){ var d0 = P2.dos || [0, 0, 0]; P2.dos = [d0[0] + K.voute, d0[1], d0[2]]; }
  /* (24 novembre, la vitesse : les os seuls, sans faire tout le dessin — HV.corpsOs, hv-corps.js) */
  var os = HV.corpsOs(K, h, U.vue(HV.capDe(P2)), P2), e = K.echelle;
  /* (l'enfant, les anciens : le héros est dessiné plus petit, posé sur le sol — ses os aussi : x et z depuis le milieu, y depuis le sol) */
  if(e !== 1) for(kk in os) os[kk] = [os[kk][0] * e, HV.SOL + (os[kk][1] - HV.SOL) * e, os[kk][2] * e];
  return os;
};
/* vers où le corps est vraiment tourné : l'angle où on la regarde (cap), sauf pendant un geste qui la tourne vers un angle précis
   (capA, avec le poids capW : pour tirer, elle se met de côté par rapport à sa cible), plus ce qu'elle tourne d'elle-même (tourne) */
HV.capDe = function(P){
  var c = P.cap || 0, w = P.capW || 0;
  if(w > 0){ var d = ((P.capA || 0) - c) % 360; d = (d + 540) % 360 - 180; c += d * w; }
  return c + (P.tourne || 0);
};

/* ==========================================================
   LES POSES. Une pose ne dit que ce qui change par rapport à « repos » ; « repos » donne TOUTES les clés (on glisse de l'une
   à l'autre en mélangeant les nombres). Les mesures : x > 0 vers SA gauche, y vers le bas (le sol : 414), z vers l'avant.
   - mainG : SON bras droit (à gauche de l'écran quand elle est de face), celui qui tient l'arc ; mainD : SON bras gauche.
     Le poignet. relG / relD : 1, la main suit le buste (mesures du héros debout) ; 0, elle est exactement là (au sol, sur un genou).
     coudeG / coudeD : de quel côté va le coude. mdirG / mdirD : vers où pointent les doigts ([0, 0, 0] : comme l'avant-bras).
     pouceG / pouceD : de quel côté est le pouce. poingG / poingD : 0 ouverte … 1 fermée. indexG / indexD : 1, l'index reste tendu.
   - piedG / piedD : la cheville. genouG / genouD : de quel côté va le genou. ouvG / ouvD : le pied tourné en dehors.
     pointeG / pointeD (degrés) : 0 à plat, 50 sur la pointe, 90 les orteils repliés (un genou à terre).
     lacetG / lacetD (degrés) : le pied pivote sur place (> 0 : vers SA gauche), comme quand on se tourne sans lever le pied.
   - bas [x, y, z] : le bassin se déplace (y > 0 : il descend). bang [avant, côté, vrille] : le bassin penche (degrés).
     dos [avant, côté, vrille] : le dos se courbe de la taille aux épaules.
   - tete : elle tourne la tête ; pen : elle la penche sur le côté ; hoche : elle la baisse (> 0) ou lève le nez.
   - arcAxe : dans quel sens est tenu l'arc (debout : [0, 1, 0]) ; arcDir : de quel côté est son ventre (la corde est à l'opposé) ;
     tendu ; dague : 1, elle a sa dague dans SA main gauche ; brasDessus : 1, les bras passent devant la tête.
   ========================================================== */
HV.POSES = {
  /* (la main de l'arc un peu écartée du corps : quand elle se tournait, l'arc rentrait dans la tunique — Romain, 16 h 39 : « l'arc qui
     a un petit bug là, qui passe sous les textures ») */
  repos:{mainG:[-56, 243, 6], coudeG:[-0.7, -0.1, -0.7], mainD:[50.5, 243, 4], coudeD:[0.7, -0.1, -0.7], relG:1, relD:1, mdirG:[0, 0, 0], mdirD:[0, 0, 0],
    pouceG:[0.25, 0.1, 1], pouceD:[-0.25, 0.1, 1], poingG:0.75, poingD:0.15, indexG:0, indexD:0,
    piedG:[-19.5, 386, 5], piedD:[19.5, 386, -5], genouG:[-0.25, 0, 1], genouD:[0.25, 0, 1], ouvG:0.3, ouvD:0.3, pointeG:0, pointeD:0, lacetG:0, lacetD:0,
    bas:[0, 0, 0], bang:[0, 0, 0], dos:[0, 0, 0], tete:0, pen:0, hoche:0, bx:0, ty:0, couche:0, visiere:0, mainSurTete:0,
    /* l'expression (hv-tete.js) : le sourire de toujours, les sourcils au repos, le regard droit devant */
    sourcils:0, sourcilsIn:0, sourcilsAsym:0, plisse:0, sourire:1, ouvre:0, largeB:1, bouchex:0, rougit:0, regX:0, regY:0,
    /* (l'arc tenu le long du corps : son ventre vers l'avant, la corde derrière — avant, la corde passait DANS la jupe : Romain,
       23 novembre, 15 h 04 : « au repos, il y a un bug avec son arc ») */
    arcDir:[-0.2, 0, 1], arcAxe:[-0.1, 1, 0], tendu:0, dague:0, brasDessus:0,
    /* tourne : elle se tourne d'elle-même (degrés) ; flecheD : une flèche dans SA main (celle qui tire la corde) */
    tourne:0, flecheD:0, flecheP:0, capA:0, capW:0,
    /* L'ALCHIMISTE (hv-alchimiste.js) : fioleG / fioleD, une fiole dans SA main droite / gauche (0 … 1) ; fioleV, elle penche (degrés,
       pour verser) ; louche, la grande louche dans SA main droite (loucheR : il la fait tournoyer, en degrés) ; marmite, la petite
       marmite dans SA main gauche ; herbes, une poignée d'herbes dans SA main gauche */
    fioleG:0, fioleD:0, fioleV:0, louche:0, loucheR:0, marmite:0, herbes:0,
    /* LE SAGE (hv-sage.js) : cristal, son cristal brille (0 … 1) ; sansBaton, le bâton est posé (1) ; livre, le livre dans SA main
       gauche (0 … 1) ; livreO, il est ouvert (0 … 1) */
    cristal:0, sansBaton:0, livre:0, livreO:0, livreP:0,
    /* leve : elle est en l'air (un saut), de tant ; son ombre reste au sol et rapetisse */
    leve:0},
  /* une main sur la hanche, la tête un peu penchée */
  hanche:{mainD:[33, 211, 10], coudeD:[1, -0.1, -0.5], mdirD:[-0.45, 0.75, 0.45], pouceD:[0.3, 0.3, -1], poingD:0.35, pen:-5, bx:2.5, piedD:[24, 386, -4]},
  /* elle fait coucou de sa main libre (la paume vers nous) */
  coucou:{mainD:[73, 103, 12], coudeD:[0.5, 1, -0.1], mdirD:[0.05, -1, 0], pouceD:[-1, 0, 0], poingD:0, pen:4, sourcils:0.6, brasDessus:1},
  /* elle vise : le bras de l'arc tendu sur le côté, la corde à la joue, la tête tournée vers la cible */
  tir:{mainG:[-116, 151, 5], coudeG:[0, 0.7, -0.6], pouceG:[0, -1, 0.1], mainD:[17, 128, 12], coudeD:[1, -0.35, -0.3], poingD:0.8, tete:-84, arcDir:[-1, 0, 0.04], tendu:1, brasDessus:1,
    sourcils:-0.8, plisse:0.5, sourire:-0.1, largeB:0.75,
    piedG:[-26, 386, 3], piedD:[22.5, 386, -3]}
};
/* les poses, dans l'ordre où on les montre : [nom, ce qu'on dit à l'écran] (HV.LISTE est complétée par hv-poses.js) */
HV.LISTE = [['repos', 'Au repos'], ['hanche', 'La main sur la hanche'], ['coucou', 'Coucou !'], ['tir', 'Elle vise']];
HV.pose = function(nom){
  var B = HV.POSES.repos, Q = HV.POSES[nom] || {}, R = {}, k;
  for(k in B) R[k] = Q[k] !== undefined ? Q[k] : B[k];
  return R;
};
function melange(a, b, t){
  var R = {}, k;
  for(k in b){
    var x = a[k], y = b[k];
    if(x === undefined) x = y;
    R[k] = y instanceof Array ? y.map(function(v, i){ return x[i] + (v - x[i]) * t; }) : typeof y === 'number' ? x + (y - x) * t : y;
  }
  return R;
}
HV.melange = melange;
function eio(u){ return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

/* ==========================================================
   LE PANTIN : HV.monter(hote, h, o) pose le dessin dans « hote » et le fait vivre.
     .vers(angle)   : elle se tourne (la tête part la première, le corps suit, la queue de cheval traîne) ;
     .pose(nom)     : elle prend une pose, en glissant ;
     .regard(x, y)  : où elle regarde (-1 … 1) ;
     .fige(P)       : une image fixe (pour les planches et les films : plus de hasard) ;
   Une seule boucle pour tous les pantins, à 30 dessins par seconde au plus ; elle s'arrête quand il n'y en a plus à l'écran.
   ========================================================== */
var PANTINS = [], RAF = 0, NP = 0;
/* (24 novembre — le mode léger : un pantin qui n'a plus rien à dessiner répond « false » ; quand AUCUN n'a plus rien à faire, la boucle
   s'arrête : le fil principal dort, comme le veut le donjon — RAPIDITE.md, R3. HV.reveiller() la relance, dès qu'un geste commence.) */
function boucle(now){ RAF = 0; var encore = false; for(var i = PANTINS.length - 1; i >= 0; i--) if(PANTINS[i].image(now) !== false) encore = true; if(PANTINS.length && encore) RAF = requestAnimationFrame(boucle); }
function lancer(){ if(!RAF && PANTINS.length && typeof requestAnimationFrame === 'function') RAF = requestAnimationFrame(boucle); }
HV.reveiller = lancer;

function Pantin(hote, h, o){
  o = o || {};
  this.h = h; this.hote = hote; this.K = HV.contexte(o.id || ('hv' + (++NP)), h);
  hote.innerHTML = '<svg class="hv" viewBox="' + (o.cadre || '0 0 300 440') + '" xmlns="http://www.w3.org/2000/svg">' + HV.defs(this.K) + '<g class="hv-fig"></g></svg>';
  this.fig = hote.querySelector('.hv-fig');
  this.cap = o.cap || 0; this.capV = this.cap; this.vc = 0;          /* le corps : où il est tourné, où il veut l'être, sa vitesse */
  this.tt = 0; this.vt = 0;                                           /* la tête, en plus du corps */
  this.q = {x:0, z:0, vx:0, vz:0};                                    /* le bout de la queue de cheval */
  this.jupe = {x:0, v:0};
  this.A = HV.pose('repos'); this.B = this.A; this.tw = 1; this.dur = 0.4; this.nom = 'repos';
  this.t = 0; this.t0 = 0; this.cli = {t:1.2 + Math.random() * 2, d:0}; this.reg = {x:0, y:0, cx:0, cy:0, jusqu:0}; this.oe = {t:2, x:0, y:0};
  this.auto = o.vie !== false; this.mort = false; this.hors = 0;
  this.dessiner(0);
  PANTINS.push(this); lancer();
}
var PP = Pantin.prototype;
PP.detruire = function(){ this.mort = true; var i = PANTINS.indexOf(this); if(i >= 0) PANTINS.splice(i, 1); };
PP.vers = function(angle, net){ this.capV = angle; if(net){ this.cap = angle; this.vc = 0; } lancer(); };
/* elle prend une pose. dur (secondes) : sinon, d'autant plus longtemps que le bassin a de chemin à faire (se relever, s'accroupir) */
PP.pose = function(nom, dur){
  if(!this.enPosition){ this.posi = null; this.gest = null; }
  if(nom === this.nom) return;
  this.A = this.courante(); this.B = HV.pose(nom);
  var dy = Math.abs(this.B.bas[1] - this.A.bas[1]), dz = Math.abs(this.B.bas[2] - this.A.bas[2]);
  this.tw = 0; this.dur = dur || 0.45 + Math.min(0.45, (dy + dz) / 200); this.nom = nom; this.tPose = this.t;
  lancer();
};
PP.courante = function(){ return this.tw >= 1 ? this.B : melange(this.A, this.B, eio(this.tw)); };
/* LES POSITIONS (hv-positions.js) : elle prend la pose de base de la position et y reste ; de temps en temps, elle fait un des
   gestes de cette position (elle regarde à droite, se baisse, sort une flèche…), puis revient. .joue(geste) : ce geste-là, tout
   de suite (les films, les boutons). */
PP.position = function(nom){
  var Po = HV.POSITIONS && HV.POSITIONS[nom];
  if(!Po) return;
  if(this.posi === nom) return;
  var cur = this.F ? this.courante() : null;
  this.enPosition = true; this.pose(Po.base); this.enPosition = false;
  /* (sortir d'un geste en cours : on repart de là où elle en est) */
  if(this.gest && cur){ this.A = this.gestCourant || cur; this.tw = 0; }
  this.posi = nom; this.gest = null; this.prochain = null; this.gestForce = null;
  lancer();
};
PP.joue = function(g){ this.gestForce = g; lancer(); };
PP.choisi = function(on){ this.anC = on ? 1 : 0; lancer(); };
/* changer ses habits (h.couleurs, h.tenue…) sans rien interrompre : la pose, le geste en cours continuent */
PP.habiller = function(h){
  this.h = h; this.K = HV.contexte(this.K.id, h);
  var d = this.hote.querySelector('svg > defs'); if(d) d.outerHTML = HV.defs(this.K);
  this._force = true; this.dessiner(0);
};
PP.regard = function(x, y, ms){ this.reg.cx = x; this.reg.cy = y; this.reg.jusqu = this.t + (ms || 1500) / 1000; };
PP.image = function(now){
  if(this.mort) return;
  if(!this.hote.isConnected){ if(++this.hors > 200) this.detruire(); return; }
  this.hors = 0;
  var ecart = this.t0 ? now - this.t0 : 33;
  if(ecart < 30) return;
  this.t0 = now;
  this.dessiner(Math.min(0.06, ecart / 1000));
};
/* faire avancer le pantin de dt secondes, et le redessiner */
PP.dessiner = function(dt){
  var t = (this.t += dt), TAU = Math.PI * 2;
  if(this.tw < 1) this.tw = Math.min(1, this.tw + dt / this.dur);
  var base = this.courante();
  if(this.posi && HV.positionImage && this.tw >= 1){ base = HV.positionImage(this, base, t); this.gestCourant = base; }
  var F = melange({}, base, 1), nom = this.nom;
  /* --- elle se tourne : un ressort bien amorti ; la tête prend de l'avance, les yeux encore plus --- */
  var ec = this.capV - this.cap;
  this.vc += (62 * ec - 15.5 * this.vc) * dt; this.cap += this.vc * dt;
  if(Math.abs(ec) < 0.05 && Math.abs(this.vc) < 0.5){ this.cap = this.capV; this.vc = 0; }
  var avance = Math.max(-46, Math.min(46, ec * 0.62)), tv = F.tete + avance;
  this.vt += (150 * (tv - this.tt) - 22 * this.vt) * dt; this.tt += this.vt * dt;
  F.cap = this.cap; F.tete = this.tt;
  /* --- la queue de cheval et la jupe : elles traînent derrière le mouvement, puis se balancent --- */
  var om = this.vc + this.vt, q = this.q, cx = Math.max(-17, Math.min(17, om * 0.075));
  q.vx += (95 * (cx - q.x) - 7.5 * q.vx) * dt; q.x += q.vx * dt;
  q.vz += (95 * (-Math.abs(cx) * 0.3 - q.z) - 9 * q.vz) * dt; q.z += q.vz * dt;
  var j = this.jupe, cj = Math.max(-5, Math.min(5, this.vc * 0.022));
  j.v += (120 * (cj - j.x) - 9 * j.v) * dt; j.x += j.v * dt;
  F.qx = q.x; F.qz = q.z; F.jx = j.x;
  F.rx = Math.max(-1, Math.min(1, ec / 34)); F.ry = 0; F.yo = 1; F.souffle = 0;
  /* (l'anneau doré de celui dont c'est le tour : p.choisi(true) le fait apparaître en douceur) */
  this.anV = (this.anV || 0) + ((this.anC || 0) - (this.anV || 0)) * Math.min(1, dt * 5);
  F.anneau = this.anV; F.anneauT = t;
  if(this.auto){
    /* --- sa petite vie : elle respire, cligne des yeux, bouge un peu la tête, jette un coup d'œil --- */
    var re = Math.sin(TAU * t / 3.6);
    F.souffle = 0.5 + 0.5 * re;
    F.pen += 1.1 * Math.sin(TAU * t / 7.3 + 1); F.tete += 2.6 * Math.sin(TAU * t / 9.1);
    /* (elle passe doucement son poids d'un pied sur l'autre, les hanches suivent un peu : elle n'est jamais figée) */
    var ps = Math.sin(TAU * t / 6.7);
    F.bas = [F.bas[0] + 2.2 * ps, F.bas[1] + 0.6 * Math.abs(ps), F.bas[2]]; F.bang = [F.bang[0], F.bang[1] - 1.6 * ps, F.bang[2] + 1.4 * ps];
    F.qx += 1.5 * Math.sin(TAU * t / 4.2); F.qz += 0.8 * Math.sin(TAU * t / 5.7 + 2);
    /* (une main posée au sol ou sur un genou ne bouge pas) */
    F.mainG = [F.mainG[0] - 0.7 * re * F.relG, F.mainG[1] + 0.3 * re * F.relG, F.mainG[2] + 1.2 * Math.sin(TAU * t / 5.1) * F.relG];
    F.mainD = [F.mainD[0] + 0.7 * re * F.relD, F.mainD[1] + 0.3 * re * F.relD, F.mainD[2] - 1.2 * Math.sin(TAU * t / 5.1) * F.relD];
    var cl = this.cli;
    if(cl.d > 0){ cl.d -= dt; F.yo = 1 - Math.sin(Math.PI * Math.max(0, Math.min(1, 1 - cl.d / 0.17))); if(cl.d <= 0) cl.t = t + 2.2 + Math.random() * 3.6; }
    else if(t > cl.t){ cl.d = 0.17; if(Math.random() < 0.2) cl.t = t + 0.32; }
    var oe = this.oe;
    if(t > oe.t){ oe.t = t + 1.6 + Math.random() * 3; oe.x = Math.random() < 0.45 ? 0 : (Math.random() * 2 - 1) * 0.8; oe.y = Math.random() < 0.6 ? 0 : (Math.random() - 0.5) * 0.7; }
    oe.cx = (oe.cx || 0) + (oe.x - (oe.cx || 0)) * Math.min(1, dt * 9); oe.cy = (oe.cy || 0) + (oe.y - (oe.cy || 0)) * Math.min(1, dt * 9);
    if(Math.abs(ec) < 3){ F.rx += oe.cx; F.ry += oe.cy; }
  }
  if(t < this.reg.jusqu){ F.rx = this.reg.cx; F.ry = this.reg.cy; }
  /* --- les gestes des poses --- */
  /* (dans une position, ce sont les gestes de la position qui jouent, pas ceux des poses) */
  var w = eio(this.tw), tp = t - (this.tPose || 0), g = !this.posi && HV.GESTES && HV.GESTES[nom];
  if(nom === 'coucou'){ var a = Math.sin(TAU * tp * 2.3); F.mainD = [F.mainD[0] + 9 * a * w, F.mainD[1] + 3 * Math.abs(a) * w, F.mainD[2]]; }
  if(nom.slice(0, 3) === 'tir'){ F.rx = -0.5 * w; F.souffle *= 0.4; }
  if(g) g(F, w, tp, this);
  /* (24 novembre — LE MODE LÉGER des vieilles tablettes, hv-adaptateur.js : sans sa petite vie, quand rien n'a bougé depuis la
     dernière image, on ne refait pas le dessin — c'est lui qui coûte : le calcul, puis la peinture. L'anneau ne scintille plus.) */
  if(this.leger){
    F.anneauT = 0;
    if(!this._force && this.F && memeF(this.F, F)) return false;
  }
  this._force = false;
  this.F = F;
  this.fig.innerHTML = HV.dessin(this.h, F, {K:this.K});
  return true;
};
/* deux poses identiques, à un rien près (le léger : on ne redessine pas pour rien) */
function memeF(a, b){
  for(var k in b){
    var x = a[k], y = b[k];
    if(typeof y === 'number'){ if(typeof x !== 'number' || Math.abs(x - y) > 0.004) return false; }
    else if(y instanceof Array){ if(!(x instanceof Array) || x.length !== y.length) return false; for(var i = 0; i < y.length; i++) if(Math.abs(x[i] - y[i]) > 0.004) return false; }
    else if(x !== y) return false;
  }
  return true;
}
/* une image fixe, sans hasard : P (une pose complète ou ses seuls changements), dt facultatif */
PP.fige = function(P){ this.auto = false; var F = melange({}, HV.pose('repos'), 1), k; for(k in P) F[k] = P[k]; this.F = F; this.fig.innerHTML = HV.dessin(this.h, F, {K:this.K}); };
HV.monter = function(hote, h, o){ return new Pantin(hote, h, o); };
HV.pantins = function(){ return PANTINS.slice(); };

HV.svg = function(h, P, o){
  o = o || {};
  var K = HV.contexte(o.id || 'hv', h);
  return '<svg class="hv" viewBox="' + (o.cadre || '0 0 300 440') + '" xmlns="http://www.w3.org/2000/svg">' + HV.defs(K) + '<g class="hv-fig">' + HV.dessin(h, P, {K:K}) + '</g></svg>';
};
})(window);


/* moteur des héros en volume (jeu/heros-vues/src/hv-poses.js) */
/* ==========================================================
   Les héros « en volume » — LES POSES DU PISTEUR (Romain, 23 novembre : « au moins une vingtaine de poses pour le Pisteur »,
   « des poses accroupies, les deux mains posées au sol », « le Pisteur qui piste », « le mode furtif »).
   Une pose n'est que des nombres (voir HV.POSES dans hv-pantin.js : ce que veut dire chaque clé). Elles marchent pour toute
   tenue construite en volume. HV.LISTE : l'ordre où on les montre, [nom, ce qu'on dit à l'écran, famille] ; HV.FAMILLES.
   Pour vérifier une pose : essai/poses.html#nom:* (huit angles) et HV.os(h, HV.pose(nom)) (où sont les os : un bras « au bout »
   mesure 92,7 ; un genou à terre est à y = 403 ; un poignet posé au sol vers y = 398).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES;
HV.FAMILLES = [['calme', 'Tranquille'], ['piste', 'Sur la piste'], ['furtif', 'Furtive'], ['chasse', 'À la chasse'], ['combat', 'Au combat']];
HV.LISTE = [['repos', 'Au repos', 'calme'], ['hanche', 'La main sur la hanche', 'calme'], ['coucou', 'Coucou !', 'calme']];
function ajoute(famille, nom, titre, pose){ if(pose) P[nom] = pose; HV.LISTE.push([nom, titre, famille]); }
/* un genou à terre (le sien gauche), l'autre pied à plat devant : la base de plusieurs poses */
var GENOU = {bas:[0, 86, -12], piedD:[15, 394, -72], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1], ouvG:0.2};
function avec(base, plus){ var R = {}, k; for(k in base) R[k] = base[k]; for(k in plus) R[k] = plus[k]; return R; }

/* ---------- Tranquille ---------- */
/* elle réfléchit : un doigt sur la joue */
ajoute('calme', 'reflechit', 'Elle réfléchit', {mainD:[14, 135, 23], coudeD:[0.5, 0.9, 0.3], mdirD:[-0.3, -1, 0], poingD:0.85, indexD:1, pouceD:[-1, -0.1, 0.3],
  pen:6, tete:-10, hoche:4, sourcils:-0.3, brasDessus:1, bx:-2});
/* elle regarde par-dessus son épaule : le dos se vrille, la tête finit le mouvement */
ajoute('calme', 'derriere', 'Par-dessus son épaule', {bang:[0, 0, 6], dos:[0, 0, 38], tete:48, sourcils:0.3, mainD:[46, 238, -6]});
/* une révérence : le dos se plie, une main sur le ventre */
ajoute('calme', 'reverence', 'Une révérence', {bas:[0, 8, -16], bang:[20, 0, 0], dos:[36, 0, 0], hoche:26, mainD:[-4, 206, 24], coudeD:[1, 0.3, -0.2], mdirD:[-1, 0.1, 0],
  mainG:[-78, 222, -10], coudeG:[-0.8, -0.3, -0.6], piedD:[22, 386, -30], pointeD:30, genouD:[0.3, 0, 1], sourcils:0.3});
/* à bout de souffle : pliée en deux, les mains sur les genoux */
ajoute('calme', 'essouffle', 'À bout de souffle', {bas:[0, 34, -16], bang:[28, 0, 0], dos:[44, 0, 0], piedG:[-24, 386, 4], piedD:[24, 386, 4], genouG:[-0.3, 0, 1], genouD:[0.3, 0, 1],
  mainG:[-29, 310, 36], relG:0, coudeG:[-1, 0, -0.3], mdirG:[0.1, 0.9, 0.3], mainD:[29, 310, 36], relD:0, coudeD:[1, 0, -0.3], mdirD:[-0.1, 0.9, 0.3], poingD:0.3,
  arcAxe:[-0.5, 0.8, 0.3], arcDir:[-0.8, -0.5, 0.2], hoche:22, sourcils:0.5});

/* ---------- Sur la piste ---------- */
/* elle guette au loin, la main en visière */
ajoute('piste', 'guet', 'Elle guette au loin', {bas:[0, 2, 0], dos:[5, 0, 10], mainD:[27, 83, 23], coudeD:[1, 0.2, -0.2], mdirD:[-1, 0.05, 0.1], pouceD:[0, 1, 0.4], poingD:0,
  tete:14, sourcils:0.4, brasDessus:1});
/* elle montre du doigt */
ajoute('piste', 'montre', 'Elle montre du doigt', {dos:[2, 0, 14], mainD:[78, 147, 58], coudeD:[0.5, 0.8, -0.2], poingD:0.9, indexD:1, pouceD:[0, -1, 0.2], tete:26, sourcils:0.3});
/* elle tend l'oreille, la main derrière */
ajoute('piste', 'ecoute', "Elle tend l'oreille", {dos:[4, 6, 0], mainD:[41, 108, -3], coudeD:[1, 0.5, 0.2], mdirD:[0, -1, 0.1], pouceD:[-1, 0, 0], poingD:0.25, pen:-8, tete:-14, hoche:2, sourcils:0.5});
/* accroupie, sur la pointe des pieds, les avant-bras sur les genoux, l'arc en travers */
ajoute('piste', 'accroupie', 'Accroupie', {bas:[0, 94, -10], bang:[16, 0, 0], dos:[22, 0, 0],
  piedG:[-25, 386, 4], piedD:[25, 386, 4], pointeG:44, pointeD:44, ouvG:0.7, ouvD:0.7, genouG:[-0.55, -0.2, 1], genouD:[0.55, -0.2, 1],
  mainG:[-38, 326, 74], relG:0, coudeG:[-1, 0.2, -0.3], mdirG:[0.2, 0.6, 0.6], mainD:[38, 326, 74], relD:0, coudeD:[1, 0.2, -0.3], mdirD:[-0.2, 0.9, 0.3],
  arcAxe:[1, 0, 0.05], arcDir:[0, -0.25, 1], hoche:4});
/* un genou à terre, assise sur son talon, une main sur la trace, l'arc planté à côté d'elle */
ajoute('piste', 'piste', 'Elle lit une trace', {bas:[0, 105, -30], bang:[42, 0, 6], dos:[46, 0, 6],
  piedD:[15, 394, -50], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 40], genouG:[-0.3, -0.5, 1], ouvG:0.2,
  mainD:[32, 395, 66], relD:0, coudeD:[1, -0.2, -0.4], mdirD:[-0.1, 0.5, 0.85], pouceD:[-1, 0, 0.2], poingD:0.05,
  /* (le bras de l'arc : tendu sur le côté, la main en haut de l'arc planté — avant, il était replié contre l'épaule, ce qui est
     impossible : Romain, 23 novembre, 14 h 11) */
  mainG:[-86, 300, 76], relG:0, coudeG:[-1, 0.3, -0.2], hoche:26, tete:6});
/* accroupie très bas, les deux mains posées au sol, l'arc couché par terre sous sa main */
ajoute('piste', 'mainsAuSol', 'Les deux mains au sol', {bas:[0, 116, -24], bang:[38, 0, 0], dos:[42, 0, 0],
  piedG:[-30, 386, -8], piedD:[30, 386, -8], pointeG:50, pointeD:50, ouvG:1, ouvD:1, genouG:[-0.8, -0.3, 1], genouD:[0.8, -0.3, 1],
  mainG:[-22, 398, 70], relG:0, coudeG:[-1, -0.3, -0.2], mdirG:[0.1, 0.3, 1], pouceG:[1, 0, 0.2], poingG:0.3,
  mainD:[22, 398, 70], relD:0, coudeD:[1, -0.3, -0.2], mdirD:[-0.1, 0.3, 1], pouceD:[-1, 0, 0.2], poingD:0.05,
  arcAxe:[0.25, 0, 1], arcDir:[-1, -0.1, 0], hoche:16});
/* elle ramasse quelque chose : les genoux pliés, une main tendue vers le sol, l'autre sur le genou */
ajoute('piste', 'ramasse', 'Elle ramasse un indice', {bas:[0, 100, -22], bang:[40, 0, 0], dos:[40, 0, 8],
  piedG:[-22, 386, 24], genouG:[-0.4, -0.3, 1], piedD:[22, 386, -30], pointeD:46, genouD:[0.4, 0, 1],
  mainD:[24, 388, 76], relD:0, coudeD:[1, -0.2, -0.3], mdirD:[0, 0.9, 0.4], pouceD:[-1, 0, 0], poingD:0.4,
  mainG:[-42, 368, 62], relG:0, coudeG:[-1, 0.2, -0.3], arcAxe:[0.3, 0.1, 1], arcDir:[-1, -0.2, 0], hoche:22});

/* ---------- Furtive ---------- */
/* aux aguets : les genoux fléchis, l'arc devant elle */
ajoute('furtif', 'aguets', 'Aux aguets', {bas:[0, 16, -4], bang:[6, 0, 0], dos:[12, 0, -8],
  piedG:[-27, 386, 14], piedD:[25, 386, -14], mainG:[-56, 212, 30], coudeG:[-0.8, 0.3, -0.5], mainD:[42, 216, 22], coudeD:[0.8, 0.2, -0.6], hoche:3, sourcils:-0.3});
/* à pas de loup : penchée, un pied devant, l'autre sur la pointe */
ajoute('furtif', 'furtif', 'À pas de loup', {bas:[0, 36, 0], bang:[14, 0, -6], dos:[24, 0, 12],
  piedG:[-18, 386, 40], piedD:[18, 386, -44], pointeD:38, genouD:[0.3, 0.2, 1],
  mainG:[-48, 236, 22], coudeG:[-0.8, 0.2, -0.5], arcAxe:[0, 0.45, 0.9], arcDir:[-0.9, 0.3, -0.15],
  mainD:[40, 214, 34], coudeD:[0.8, 0.3, -0.5], mdirD:[0, 0.3, 0.7], hoche:-4, sourcils:-0.4});
/* … et le pas suivant */
ajoute('furtif', 'furtif2', 'Le pas suivant', {bas:[0, 36, 0], bang:[14, 0, 6], dos:[24, 0, -12],
  piedD:[18, 386, 40], piedG:[-18, 386, -44], pointeG:38, genouG:[-0.3, 0.2, 1],
  mainG:[-46, 226, 30], coudeG:[-0.8, 0.2, -0.5], arcAxe:[0, 0.45, 0.9], arcDir:[-0.9, 0.3, -0.15],
  mainD:[42, 228, 14], coudeD:[0.8, 0.3, -0.5], mdirD:[0, 0.3, 0.7], hoche:-4, sourcils:-0.4});
/* « chut ! » : un doigt sur les lèvres */
ajoute('furtif', 'chut', 'Chut !', {bas:[0, 10, 0], dos:[8, 0, 0], mainD:[9, 129, 25], coudeD:[0.5, 0.9, 0.3], mdirD:[-0.1, -1, 0], poingD:0.95, indexD:1, pouceD:[-1, 0, 0.3],
  sourcils:0.4, brasDessus:1});
/* à l'affût : un genou à terre, l'arc prêt devant elle */
ajoute('furtif', 'affut', "À l'affût", avec(GENOU, {bang:[8, 0, 0], dos:[14, 0, -10], mainG:[-50, 214, 40], coudeG:[-0.8, 0.4, -0.4], arcAxe:[0.45, 0.6, 0.66], arcDir:[-0.6, -0.3, 0.7],
  mainD:[22, 208, 34], coudeD:[0.9, 0.3, -0.4], poingD:0.5, tete:-12, hoche:-2, sourcils:-0.5}));

/* ---------- À la chasse ---------- */
ajoute('chasse', 'tir', 'Elle vise');
/* elle vise, un genou à terre. Comme les archers : de côté par rapport à la cible, le pied du côté de l'arc devant (le tibia
   droit), l'autre genou à terre ; le bassin est tourné vers la cible, les épaules restent dans l'axe de la flèche */
ajoute('chasse', 'tirGenou', 'Elle vise, un genou à terre', {bas:[8, 86, 0], bang:[0, 0, -50], dos:[0, 0, 50],
  piedG:[-74, 386, 12], genouG:[-0.6, -0.6, 0.5], ouvG:3, piedD:[84, 394, -16], pointeD:88, ouvD:-3, genouD:[0.2, 1, 0.3],
  mainG:[-116, 151, 5], coudeG:[0, 0.7, -0.6], mainD:[17, 128, 12], coudeD:[1, -0.35, -0.3], poingD:0.8,
  tete:-84, sourcils:-0.6, arcDir:[-1, 0, 0.04], tendu:1, brasDessus:1});
/* elle vise en l'air (ce qui vole) */
ajoute('chasse', 'tirHaut', 'Elle vise en l\'air', {dos:[-4, 8, 0], mainG:[-100, 97, 5], coudeG:[0, 0.7, -0.6], mainD:[24, 141, 12], coudeD:[1, 0.1, -0.3], poingD:0.8,
  tete:-84, hoche:-15, sourcils:-0.6, arcAxe:[-0.5, 0.87, 0], arcDir:[-0.87, -0.5, 0.04], tendu:1, brasDessus:1, piedG:[-28, 386, 3], piedD:[24, 386, -3]});
/* elle prend une flèche dans son carquois */
ajoute('chasse', 'fleche', 'Elle prend une flèche', {mainD:[38, 106, -15], coudeD:[0.5, -1, 0.5], mdirD:[0, -0.4, -0.9], poingD:0.7, tete:16, pen:3,
  mainG:[-54, 214, 26], coudeG:[-0.8, 0.3, -0.5]});
/* elle court : penchée, un genou levé, l'arc à la main */
ajoute('chasse', 'course', 'Elle court', {bas:[0, 10, 0], bang:[14, 0, -8], dos:[10, 0, 18],
  piedG:[-15, 350, 40], pointeG:-15, genouG:[-0.1, -0.4, 1], piedD:[15, 378, -52], pointeD:55, genouD:[0.1, 0.3, 1],
  mainD:[40, 196, 38], coudeD:[0.9, 0.5, -0.5], poingD:0.8, mainG:[-48, 226, -34], coudeG:[-0.8, -0.2, -0.7], arcAxe:[0, 0.5, 0.87], arcDir:[-0.9, 0.3, -0.2],
  hoche:-6, sourcils:-0.2});
/* victoire : l'arc brandi au-dessus de la tête */
ajoute('chasse', 'victoire', 'Victoire !', {bas:[0, -2, 0], mainG:[-74, 70, 4], coudeG:[-1, 0.3, 0], arcAxe:[1, 0.1, 0], arcDir:[0, -1, 0.1],
  mainD:[60, 84, 8], coudeD:[1, 0.4, 0], poingD:1, sourcils:0.8, hoche:-6, brasDessus:1});

/* ---------- Au combat ---------- */
/* en garde : la dague au poing, l'arc en retrait */
ajoute('combat', 'combat', 'En garde', {bas:[0, 24, 0], bang:[4, 0, 12], dos:[12, 0, -22], piedG:[-32, 386, 16], piedD:[30, 386, -20], ouvD:0.8,
  mainD:[36, 190, 56], coudeD:[0.9, 0.5, -0.3], poingD:1, pouceD:[0, -1, 0.3], dague:1, mainG:[-66, 214, -8], coudeG:[-0.8, 0.2, -0.6], sourcils:-0.8, hoche:4});
/* elle frappe : une grande fente, la dague en avant */
ajoute('combat', 'fente', 'Elle frappe', {bas:[0, 44, 26], bang:[16, 0, -10], dos:[10, 0, -16], piedD:[22, 386, 84], genouD:[0.2, -0.3, 1], piedG:[-22, 386, -58], pointeG:42, genouG:[-0.3, 0.4, 1],
  mainD:[34, 168, 88], coudeD:[1, 0.4, -0.2], mdirD:[0, 1, 0.3], poingD:1, pouceD:[0, -0.2, 1], dague:1, mainG:[-68, 200, -28], coudeG:[-0.8, -0.2, -0.6], sourcils:-0.9, hoche:2});
/* elle esquive : tout le corps part sur le côté */
ajoute('combat', 'esquive', 'Elle esquive', {bas:[-18, 30, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-50, 386, 2], genouG:[-0.5, 0, 1], piedD:[14, 386, -4],
  mainG:[-76, 200, 10], coudeG:[-0.9, 0.3, -0.4], mainD:[66, 176, 20], coudeD:[1, 0.4, -0.2], sourcils:0.7, hoche:-4, tete:20});

/* ==========================================================
   LES PETITS GESTES : ce qui bouge une fois la pose prise. g(F, w, t) : F, la pose de cette image (on y ajoute le geste) ;
   w : 0 → 1 pendant qu'elle prend la pose ; t : les secondes depuis qu'elle l'a prise.
   ========================================================== */
/* ==========================================================
   LES VISAGES : une expression par pose (Romain, 23 novembre, 13 h 36 : « il n'y a aucune expression de visage […] pour chaque
   position, il faut qu'elle ait une expression de visage qui corresponde »). Les nombres (hv-tete.js) :
   sourire (1 sourit, 0 neutre, -1 les coins tombent), ouvre (la bouche s'ouvre), largeB (0,45 lèvres pincées … 1,2 grande),
   bouchex (une moue de côté), sourcils (-1 froncés … 1 levés), sourcilsIn (le bout près du nez remonte : inquiète, fatiguée),
   sourcilsAsym (un sourcil plus haut), plisse (> 0 elle plisse les yeux ; < 0 grands ouverts), rougit, regX / regY (le regard).
   Le pouce (pouceG) : pour tenir l'arc devant elle, le pouce en haut — la paume face à nous, l'arc passe devant (hv-corps.js).
   ========================================================== */
var VISAGES = {
  repos:{},
  hanche:{sourire:1, sourcilsAsym:0.35, plisse:0.15},                                          /* sûre d'elle */
  coucou:{sourire:1, ouvre:0.35, sourcils:0.6, plisse:0.2},                                    /* toute contente */
  reflechit:{sourire:0.1, largeB:0.7, bouchex:0.6, sourcilsAsym:0.8, regX:0.6, regY:-0.6},    /* hmm… */
  derriere:{sourire:0.3, sourcils:0.4, regX:0.4},                                              /* curieuse */
  reverence:{sourire:1, plisse:0.3, regY:0.7},                                                 /* polie, les yeux baissés */
  essouffle:{sourire:-0.1, ouvre:0.65, sourcilsIn:0.8, plisse:0.3, rougit:0.9},              /* épuisée */
  guet:{sourire:0, largeB:0.8, sourcils:-0.2, plisse:0.55},                                   /* elle plisse les yeux au soleil */
  montre:{sourire:0.6, ouvre:0.35, sourcils:0.7, plisse:-0.15},                                /* « là ! » */
  ecoute:{sourire:0, largeB:0.7, sourcils:0.5, sourcilsAsym:0.3, regX:-0.7},                  /* elle tend l'oreille */
  accroupie:{sourire:0.1, sourcils:-0.25, regY:0.35},                                          /* attentive */
  piste:{sourire:0, largeB:0.65, sourcils:-0.45, plisse:0.2, regY:1},                          /* concentrée sur la trace */
  mainsAuSol:{sourire:-0.1, largeB:0.8, sourcils:-0.35, plisse:0.15},                          /* sérieuse, prête à bondir */
  ramasse:{sourire:0.5, ouvre:0.15, sourcils:0.6, regY:1},                                     /* elle a trouvé quelque chose */
  aguets:{sourire:-0.3, largeB:0.8, sourcils:-0.5, plisse:0.2},                                /* méfiante */
  furtif:{sourire:-0.15, largeB:0.65, sourcils:-0.6, plisse:0.25},                            /* lèvres pincées, pas un bruit */
  furtif2:{sourire:-0.15, largeB:0.65, sourcils:-0.6, plisse:0.25},
  chut:{sourire:0, ouvre:0.3, largeB:0.45, sourcils:0.5, plisse:0.25},                         /* « chhh » */
  affut:{sourire:-0.25, largeB:0.75, sourcils:-0.7, plisse:0.35},                              /* elle guette sa proie */
  tir:{sourire:-0.1, largeB:0.75, sourcils:-0.8, plisse:0.5},                                  /* elle vise : un œil plissé */
  tirGenou:{sourire:-0.1, largeB:0.75, sourcils:-0.8, plisse:0.5, pouceG:[0, -1, 0.1]},
  tirHaut:{sourire:-0.1, largeB:0.75, sourcils:-0.8, plisse:0.5, pouceG:[0, -1, 0.1]},
  fleche:{sourire:0.2, sourcils:-0.3, plisse:0.1},                                             /* calme, elle se prépare */
  course:{sourire:0, ouvre:0.45, sourcils:-0.4, sourcilsIn:0.3, rougit:0.5},                   /* l'effort */
  victoire:{sourire:1, ouvre:0.7, sourcils:0.9, plisse:0.45, rougit:0.6},                      /* elle rit */
  combat:{sourire:-0.6, largeB:1, sourcils:-1, plisse:0.3},                                    /* les dents serrées */
  fente:{sourire:-0.5, ouvre:0.55, largeB:0.9, sourcils:-1, plisse:0.2},                       /* elle crie en frappant */
  esquive:{sourire:-0.3, ouvre:0.45, largeB:0.7, sourcils:0.8, sourcilsIn:0.7, plisse:-0.4}    /* surprise, alarmée */
};
Object.keys(VISAGES).forEach(function(nom){ var v = VISAGES[nom], k; if(P[nom]) for(k in v) P[nom][k] = v[k]; });
HV.VISAGES = VISAGES;

var TAU = Math.PI * 2;
HV.GESTES = {
  /* ses doigts suivent le bord de la trace ; elle relève un instant les yeux */
  piste:function(F, w, t){ var a = Math.sin(TAU * t / 2.6); F.mainD = [F.mainD[0] + 5 * a * w, F.mainD[1], F.mainD[2] + 3 * Math.cos(TAU * t / 2.6) * w]; F.hoche -= 5 * Math.max(0, Math.sin(TAU * t / 7)) * w; },
  /* elle balaie l'horizon */
  guet:function(F, w, t){ F.tete += 16 * Math.sin(TAU * t / 5.2) * w; F.dos = [F.dos[0], F.dos[1], F.dos[2] + 6 * Math.sin(TAU * t / 5.2) * w]; },
  /* la tête un peu plus penchée, par à-coups */
  ecoute:function(F, w, t){ F.pen -= 3 * Math.max(0, Math.sin(TAU * t / 3.4)) * w; },
  /* elle regarde à droite, à gauche, sans bouger les mains */
  mainsAuSol:function(F, w, t){ F.tete += 22 * Math.sin(TAU * t / 4.4) * w; },
  accroupie:function(F, w, t){ F.tete += 14 * Math.sin(TAU * t / 5) * w; },
  /* elle reprend son souffle : le dos monte et descend */
  essouffle:function(F, w, t){ var a = Math.sin(TAU * t / 1.5); F.dos = [F.dos[0] - 3.2 * a * w, F.dos[1], F.dos[2]]; F.hoche += 3 * a * w; F.bas = [F.bas[0], F.bas[1] + 1.5 * a * w, F.bas[2]]; },
  /* elle secoue son arc au-dessus de sa tête */
  victoire:function(F, w, t){ var a = Math.sin(TAU * t * 1.6); F.mainG = [F.mainG[0], F.mainG[1] + 6 * a * w, F.mainG[2]]; F.mainD = [F.mainD[0], F.mainD[1] - 5 * a * w, F.mainD[2]]; F.bas = [F.bas[0], F.bas[1] + 2 * Math.abs(a) * w, F.bas[2]]; },
  /* en garde : elle se balance d'un pied sur l'autre, la dague bouge */
  combat:function(F, w, t){ var a = Math.sin(TAU * t / 1.3); F.bas = [F.bas[0] + 3 * a * w, F.bas[1] + 2 * Math.abs(a) * w, F.bas[2]]; F.mainD = [F.mainD[0], F.mainD[1] + 3 * a * w, F.mainD[2] + 3 * Math.cos(TAU * t / 1.3) * w]; },
  /* aux aguets : elle tourne la tête d'un côté, de l'autre */
  aguets:function(F, w, t){ F.tete += 24 * Math.sin(TAU * t / 4) * w; }
};
})(window);


/* moteur des héros en volume (jeu/heros-vues/src/hv-positions.js) */
/* ==========================================================
   Les héros « en volume » — LES POSITIONS DU PISTEUR (Romain, 23 novembre, 15 h 04 et 15 h 54).
   « Quand le pisteur appuie sur accroupi, on voit le personnage qui est debout […] qui s'accroupit. Et là, quand il est accroupi,
   je veux qu'il reste comme ça […] et dans cette position, je veux qu'il fasse des mouvements un peu naturels […] Il faut que le
   personnage ait de la vie. » ; « c'est jamais tout le corps qui bouge d'un coup, ça fait un peu robot ».
   Une position = une pose de base (où elle reste) + des GESTES : de petites animations, image clé par image clé, qu'elle fait de
   temps en temps (au hasard, avec un temps d'attente), puis elle revient à la pose de base.
   Un geste = [[quand (secondes depuis le début du geste), ce qui change par rapport à la pose de base], …] ; le dernier est {}
   (le retour). Entre deux images clés, une courbe douce ; deux images clés égales = elle tient la pose.
   Le pantin (hv-pantin.js) : p.position(nom) ; p.joue(geste) (ce geste-là, tout de suite).
   Chargé après hv-poses.js. Ce fichier sert aussi aux mouvements du donjon (hv-donjon.js) : HV.gesteImage, HV.tour,
   HV.regardeEtRevient, HV.flecheSortie.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES;
function avec(base, plus){ var R = {}, k; for(k in base) R[k] = base[k]; for(k in plus) R[k] = plus[k]; return R; }
HV.avec = avec;

/* ==========================================================
   LA POSE D'UN GESTE au temps u (secondes depuis son début), à partir de la pose de base.
   (Romain, 23 novembre, 15 h 54 : « c'est un peu robotique, il y a tout le corps qui bouge d'un coup […] quand on regarde à droite,
   à gauche, il y a la tête qui bouge, après les épaules, des fois il y a un pied qui part […] c'est jamais tout le corps qui bouge
   d'un coup ».) Deux choses :
   1. Entre les images clés, une COURBE DOUCE qui passe par toutes (Fritsch-Carlson : elle ne dépasse jamais, et deux images clés
      égales font un arrêt net) : le mouvement ne s'arrête plus à chaque image clé.
   2. Chaque partie du corps a son avance ou son retard (DECALE, en secondes) : la tête et le regard partent les premiers, puis les
      épaules, les mains, les hanches, et les pieds suivent. (Au début et à la fin du geste, le décalage s'efface : pas de saut.)
   ========================================================== */
var DECALE = {regX:0.12, regY:0.12, tete:0.09, hoche:0.07, pen:0.07, dos:0.03, mainG:-0.01, mainD:-0.01, coudeG:-0.01, coudeD:-0.01,
  bang:-0.04, bas:-0.04, leve:-0.05, piedG:-0.08, piedD:-0.08, genouG:-0.08, genouD:-0.08, pointeG:-0.08, pointeD:-0.08, ouvG:-0.08, ouvD:-0.08, lacetG:-0.08, lacetD:-0.08};
function pentes(T, V){
  var n = T.length, d = [], m = [], i;
  for(i = 0; i < n - 1; i++) d.push((V[i + 1] - V[i]) / ((T[i + 1] - T[i]) || 1e-6));
  m[0] = 0; m[n - 1] = 0;
  for(i = 1; i < n - 1; i++){
    if(d[i - 1] * d[i] <= 0) m[i] = 0;
    else { var h0 = T[i] - T[i - 1], h1 = T[i + 1] - T[i], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
  }
  return m;
}
function courbe(T, V, M, u){
  var n = T.length, k = 0;
  if(u <= T[0]) return V[0];
  if(u >= T[n - 1]) return V[n - 1];
  while(k < n - 2 && u > T[k + 1]) k++;
  var h = T[k + 1] - T[k] || 1e-6, s = (u - T[k]) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * V[k] + (s3 - 2 * s2 + s) * h * M[k] + (-2 * s3 + 3 * s2) * V[k + 1] + (s3 - s2) * h * M[k + 1];
}
HV.courbes = {pentes:pentes, courbe:courbe};
/* (les images clés d'un geste, complétées par la pose de base, une fois pour toutes par base) */
function cles(base, Gst){
  if(Gst._base === base && Gst._K) return Gst._K;
  var T = [0], Ps = [base], i;
  for(i = 0; i < Gst.length; i++){ T.push(Gst[i][0]); Ps.push(avec(base, Gst[i][1])); }
  var C = {};
  Object.keys(base).forEach(function(k){
    var b = base[k];
    if(typeof b === 'number') C[k] = {T:T, V:Ps.map(function(p){ return typeof p[k] === 'number' ? p[k] : b; })};
    else if(b instanceof Array) C[k] = b.map(function(_, j){ return {T:T, V:Ps.map(function(p){ return p[k] instanceof Array ? p[k][j] : b[j]; })}; });
  });
  Object.keys(C).forEach(function(k){ (C[k] instanceof Array ? C[k] : [C[k]]).forEach(function(c){ c.M = pentes(c.T, c.V); }); });
  Gst._base = base; Gst._K = {T:T, C:C};
  return Gst._K;
}
HV.gesteImage = function(base, Gst, u){
  var K = cles(base, Gst), fin = K.T[K.T.length - 1], R = {}, k;
  var bord = Math.max(0, Math.min(1, u / 0.3, (fin - u) / 0.3));
  for(k in base){
    var c = K.C[k];
    if(!c){ R[k] = base[k]; continue; }
    var uc = Math.max(0, Math.min(fin, u + (DECALE[k] || 0) * bord));
    R[k] = c instanceof Array ? c.map(function(cj){ return courbe(cj.T, cj.V, cj.M, uc); }) : courbe(c.T, c.V, c.M, uc);
  }
  return R;
};
HV.dureeGeste = function(Gst){ return Gst[Gst.length - 1][0]; };

/* ==========================================================
   ELLE SE TOURNE SANS ÊTRE SUR UN SOCLE (Romain, 15 h 54 : « on a l'impression qu'elle est sur un socle qui tourne ») : un tour de
   A degrés (> 0 : vers SA gauche), par étapes — 0 : la tête ; 1 : + les épaules ; 2 : + les hanches ; 3 : un pied fait un pas (celui
   du côté où elle tourne) ; 4 : l'autre pied suit, le bassin finit de tourner. pas : le pied est en l'air, à mi-chemin. Les pieds
   tournent autour du bassin ; le genou suit son pied.
   ========================================================== */
function rot(q, phi, c){ var a = phi * Math.PI / 180, x = q[0] - c[0], z = q[2] - c[2], co = Math.cos(a), si = Math.sin(a); return [c[0] + x * co + z * si, q[1], c[2] - x * si + z * co]; }
function rotV(v, phi){ return rot(v, phi, [0, 0, 0]); }
HV.rot = rot;
HV.tour = function(base, A, etape, pas){
  var b = base, R = {}, e = Math.max(0, Math.min(4, etape)), centre = [b.bas[0], 0, b.bas[2]];
  var fH = [0.75, 0.55, 0.4, 0.35, 0.25][e], fD = [0, 0.32, 0.3, 0.3, 0.22][e], fB = [0, 0, 0.28, 0.3, 0.53][e];
  R.tete = b.tete + A * fH;
  R.dos = [b.dos[0], b.dos[1], b.dos[2] + A * fD];
  R.bang = [b.bang[0], b.bang[1], b.bang[2] + A * fB];
  var un = A > 0 ? 'D' : 'G', deux = un === 'D' ? 'G' : 'D', phi = A * 0.55;
  function pose(c, part){
    var p = rot(b['pied' + c], phi * part, centre);
    /* (le pied ne se lève pas : il pivote sur sa pointe, le talon à peine décollé — Romain, 16 h 39) */
    R['pied' + c] = p; R['lacet' + c] = (b['lacet' + c] || 0) + phi * part;
    R['genou' + c] = rotV(b['genou' + c], phi * part);
    if(part < 1) R['pointe' + c] = 12;
  }
  if(e === 3) pose(un, pas ? 0.5 : 1);
  if(e === 4){ pose(un, 1); pose(deux, pas ? 0.5 : 1); }
  return R;
};
/* un aller-retour du regard : elle se tourne de A degrés (la tête, les épaules, les hanches, un pas si c'est loin), reste « tenir »
   secondes, puis revient dans l'autre ordre (la tête d'abord, le pied en dernier) → des images clés, à partir de t0.
   o.sansPas : jamais de pas (accroupie) ; o.vite : la tête part d'un coup ; o.visage : son expression pendant qu'elle regarde
   (Romain, 16 h 39 : « un peu plus d'expression de visage […] toujours un peu pareil ») ; o.lent : plus lent (1,3 par défaut —
   Romain, 16 h 39 : « on prend beaucoup plus de temps entre les animations ») */
HV.regardeEtRevient = function(b, A, tenir, t0, o){
  o = o || {};
  var T = HV.tour, L = [], t = t0 || 0, pas = Math.abs(A) > 32 && !o.sansPas, k = o.lent || 1.3, V = o.visage || {};
  L.push([t += (o.vite ? 0.12 : 0.26 * k), T(b, A, 0)]);
  L.push([t += 0.28 * k, avec(T(b, A, 1), V)]);
  if(pas){ L.push([t += 0.26 * k, avec(T(b, A, 2), V)]); L.push([t += 0.2 * k, avec(T(b, A, 3, true), V)]); L.push([t += 0.18 * k, avec(T(b, A, 3), V)]); }
  else L.push([t += 0.3 * k, avec(T(b, A, 2), V)]);
  var fin = L[L.length - 1][1];
  L.push([t += tenir, fin]);
  var r1 = avec(fin, {tete:b.tete + (fin.tete - b.tete) * 0.2});
  L.push([t += 0.3 * k, r1]);
  var r2 = avec(r1, {dos:b.dos.slice(), bang:[b.bang[0], b.bang[1], b.bang[2] + (fin.bang[2] - b.bang[2]) * 0.35]});
  L.push([t += 0.28 * k, r2]);
  if(pas){
    var un = A > 0 ? 'D' : 'G', mi = {}, c = [b.bas[0], 0, b.bas[2]], p = rot(b['pied' + un], A * 0.55 * 0.5, c);
    mi['pied' + un] = p; mi['lacet' + un] = (b['lacet' + un] || 0) + A * 0.55 * 0.5; mi['pointe' + un] = 12; mi.bang = [b.bang[0], b.bang[1], b.bang[2] + (fin.bang[2] - b.bang[2]) * 0.15];
    L.push([t += 0.22 * k, avec(r2, mi)]);
  }
  L.push([t += 0.3 * k, {}]);
  return L;
};
/* deux gestes l'un après l'autre (sans revenir tout à fait entre les deux), avec une pause */
HV.puis = function(A, B, pause){
  var fin = A[A.length - 2][0] + (pause || 0);
  return A.slice(0, -1).concat(B.map(function(x){ return [x[0] + fin, x[1]]; }));
};

/* ==========================================================
   PRENDRE UNE FLÈCHE, L'ENCOCHER, BANDER (Romain, 15 h 54 : « quand on prend une flèche, on met la main en arrière, on attrape le
   bout de la flèche et on relève très haut la main pour que la flèche elle puisse sortir du carquois […] une fois que la flèche avec
   le bras levé est sortie, hop, on vient la placer dans l'arc et là on bande l'arc en arrière […] ça fait un grand mouvement […] le
   temps qu'il fait pour lancer une flèche dans le donjon, il faut le garder ») → des images clés.
   Les temps sont ceux du tir du donjon d'aujourd'hui (heros-anime.js, H.tirer : la main au carquois 0,33 s, la flèche encochée
   0,61 s, l'arc bandé 1,01 s, il tremble, il lâche à 1,38 s, en garde à 2,24 s).
   o.tourne : de combien elle se tourne pour viser (au donjon, sa cible est à droite : elle se met de profil, en deux pas) ;
   o.lache : elle tire (sinon : elle vise, relâche doucement la corde, et range la flèche dans le carquois) ; o.base : la pose de
   départ (pour les pas) ; o.vise : ce qui change pour viser (les jambes d'une pose à genou, par exemple).
   ========================================================== */
/* (la main, dans les mesures du buste : le carquois est sur SON épaule gauche, son haut vers [46, 98, -19]) */
/* (la main va chercher la flèche PAR-DESSUS l'épaule : le coude monte, la main redescend sur les encoches, au-dessus de l'ouverture
   du carquois — avant, l'avant-bras passait à travers le carquois : Romain, 17 h 44 : « le bras, quand il prend la flèche, il passe à
   moitié à travers le carquois ». La flèche tenue part du côté du pouce : le pouce est tourné vers le fond du carquois.) */
var Q_CHERCHE = {mainD:[46, 86, -24], relD:1, coudeD:[0.5, -1, 0.2], mdirD:[0.1, 0.2, -1], pouceD:[-0.36, 0.93, 0], poingD:0.2, flecheP:1, poingG:0.8};
var Q_TIENT = avec(Q_CHERCHE, {poingD:0.95, flecheD:1});
/* (puis le bras monte TRÈS haut, presque tendu, l'épaule monte avec lui (hv-corps.js), le poing au-dessus de la tête, la flèche qui
   pend dessous : elle sort du carquois — Romain, 16 h 39 et 17 h 44 : « qu'elle lève bien le bras très haut pour sortir la flèche du
   carquois ». Le poing est tourné le pouce en bas, pour que la flèche pende.) */
var Q_HAUT = {mainD:[30, 24, -2], relD:1, coudeD:[0.9, -0.2, 0.3], mdirD:[0, -0.2, 1], pouceD:[0, 1, 0], poingD:0.95, flecheD:1, flecheP:1, hoche:-6, brasDessus:1};
/* (au donjon, vue de dos : la main monte derrière sa tête, de notre côté) */
/* (mainSurTete : son bras passe devant sa tête et sa queue de cheval, même si la main est un peu derrière — sinon, de trois quarts
   dos, le bras levé disparaît derrière la queue de cheval) */
var Q_HAUT_DOS = avec(Q_HAUT, {mainSurTete:1, mainD:[24, 22, -26], coudeD:[0.9, -0.3, -0.2], mdirD:[0.1, -0.2, -1], pouceD:[-0.2, 1, 0]});
var VISE = {mainG:[-116, 151, 5], relG:1, coudeG:[0, 0.7, -0.6], pouceG:[0, -1, 0.1], arcAxe:[0, 1, 0], arcDir:[-1, 0, 0.04], poingG:0.75,
  tete:-84, brasDessus:1, sourcils:-0.8, plisse:0.5, sourire:-0.1, largeB:0.75};
var A_ARC = avec(VISE, {mainD:[-30, 148, 34], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[-0.3, 0.1, 1], pouceD:[-1, 0, 0.1], poingD:0.95, flecheD:1, flecheP:1});
/* (la main qui encoche reste juste derrière le bras de l'arc, un peu plus bas : vue de dos, elle ne dépasse plus au-dessus de
   l'épaule — Romain, 17 h 44) */
var ENCOCHE = avec(VISE, {mainD:[-74, 160, 16], relD:1, coudeD:[1, -0.2, -0.4], mdirD:[0, 0, 0], pouceD:[-1, 0, 0.1], poingD:0.9, flecheD:0, tendu:0.05});
/* (la main qui tire la corde s'ancre sous la pommette : vue de dos, elle est cachée par la tête, plus rien ne dépasse à côté du cou) */
var BANDE = avec(VISE, {mainD:[16, 120, 14], relD:1, coudeD:[1, -0.35, -0.3], mdirD:[0, 0, 0], pouceD:[-1, 0, 0.1], poingD:0.8, tendu:1, sourcils:-0.9, plisse:0.6});
var LACHE = avec(VISE, {mainD:[36, 120, -12], relD:1, coudeD:[1, -0.35, -0.3], mdirD:[0, 0, 0], pouceD:[-1, 0, 0.1], poingD:0.05, tendu:0, mainG:[-114, 146, 4], plisse:0.25, ouvre:0.2});
HV.flecheSortie = function(o){
  o = o || {};
  var b = o.base || P.repos, A = o.tourne || 0, V = o.vise || {}, c = [b.bas[0], 0, b.bas[2]];
  /* (les pas pour se mettre de profil : d'abord les épaules, puis un pied, les hanches, l'autre pied) */
  function corps(part, pieds, sur){
    /* (les épaules partent devant les hanches ; quand les pieds ont fini leurs pas, tout le corps est tourné ; sur : elle se tourne
       un peu plus que pour viser, le temps de prendre la flèche — le dos vers nous, on voit la main au carquois) */
    var As = A * (sur || 1);
    var R = {dos:[b.dos[0], b.dos[1], b.dos[2] + As * 0.45 * part * (1 - pieds)], bang:[b.bang[0], b.bang[1], b.bang[2] + As * part * (0.55 + 0.45 * pieds)]};
    if(A && pieds > 0){
      var un = A > 0 ? 'D' : 'G', deux = un === 'D' ? 'G' : 'D';
      [[un, Math.min(1, pieds * 2)], [deux, Math.max(0, pieds * 2 - 1)]].forEach(function(x){
        var p = rot(b['pied' + x[0]], A * x[1], c), leve = x[1] > 0.05 && x[1] < 0.95;
        R['pied' + x[0]] = leve ? [p[0], p[1] - 8, p[2]] : p; R['genou' + x[0]] = rotV(b['genou' + x[0]], A * x[1]);
        R['lacet' + x[0]] = (b['lacet' + x[0]] || 0) + A * x[1] * 0.9;
        if(leve) R['pointe' + x[0]] = 25;
      });
    }
    return R;
  }
  var t = o.t0 || 0, L = [];
  function k(dt, pose){ L.push([t += dt, pose]); }
  /* (quand elle doit se tourner, elle se tourne d'abord : la main qui va au carquois est alors de notre côté, on la voit) */
  /* (au donjon, elle a presque fini de se tourner quand sa main arrive au carquois : son dos est vers nous, on voit la main prendre
     la flèche et monter au-dessus de sa tête — Romain, 16 h 39 : « le mouvement du bras qui se relève, il y est pas toujours ») */
  var c1 = A ? corps(0.95, 0.55, 1.15) : corps(0.3, 0), c2 = A ? corps(1, 0.85, 1.16) : corps(0.4, 0), c3 = A ? corps(1, 1, 1.1) : corps(0.7, 0.25), c4 = A ? corps(1, 1) : corps(0.9, 0.5);
  var QH = A ? Q_HAUT_DOS : Q_HAUT;
  /* (de dos, le bras qui va au carquois passe devant la queue de cheval et le carquois : on le voit monter, ce n'est pas un poing qui
     flotte à côté de la tête) */
  var sur = A ? {mainSurTete:1} : {};
  k(0.18, avec(avec(Q_CHERCHE, sur), avec(c1, {tete:b.tete + 10})));
  k(0.15, avec(avec(Q_TIENT, sur), c2));
  /* (le bras monte, et reste un instant tout en haut : on le voit bien) */
  /* (le buste se penche un peu de l'autre côté : l'épaule gauche monte encore) */
  var ch = {dos:[c3.dos[0], c3.dos[1] - 10, c3.dos[2]]};
  k(0.13, avec(avec(avec(QH, c3), ch), V));
  k(0.05, avec(avec(avec(QH, c3), ch), avec(V, {mainD:[QH.mainD[0], QH.mainD[1] - 3, QH.mainD[2]]})));
  k(0.10, avec(avec(A_ARC, c4), V));
  k(0.05, avec(avec(ENCOCHE, corps(1, 1)), V));
  k(0.35, avec(avec(BANDE, corps(1, 1)), V));
  var VB = avec(avec(BANDE, corps(1, 1)), V);
  if(o.lache !== false){
    k(0.31, avec(VB, {mainD:[15, 121, 14]}));
    k(0.06, avec(avec(LACHE, corps(1, 1)), V));
    k(0.12, avec(avec(LACHE, corps(1, 1)), avec(V, {mainD:[40, 124, -16], sourire:0.3})));
    k(0.32, avec(avec(LACHE, corps(1, 1)), avec(V, {mainD:[40, 126, -16], sourire:0.3, poingD:0.2})));
    if(A) k(0.22, avec(avec(LACHE, corps(0.6, 0.5)), {tete:b.tete - 30, brasDessus:0}));
    k(A ? 0.2 : 0.42, {});
  } else {
    /* elle ne tire pas : elle tient la visée, puis laisse revenir la corde, reprend la flèche et la range */
    k(1.2, VB);
    k(0.5, avec(ENCOCHE, avec(corps(1, 1), avec(V, {sourcils:0.1, plisse:0.1}))));
    k(0.15, avec(A_ARC, avec(corps(1, 1), avec(V, {mainD:[-70, 150, 14], flecheD:1, sourcils:0.1, plisse:0.1}))));
    /* (pour ranger la flèche, la main ne passe plus devant son visage — Romain, 17 h 44 : « des petits bugs quand elle fait sa
       flèche » : elle redescend devant sa poitrine, la flèche debout, pendant que l'arc s'abaisse ; puis elle remonte par SON côté
       gauche, au-dessus de l'épaule, et la flèche replonge dans le carquois) */
    k(0.35, avec(corps(0.6, 0.6), {mainD:[20, 200, 50], relD:1, coudeD:[0.6, 0.6, 0.5], mdirD:[0, -1, 0.1], pouceD:[0, -1, 0.2], poingD:0.95, flecheD:1, flecheP:0.4,
      mainG:[-80, 214, 30], relG:1, tete:b.tete + 6, hoche:6, brasDessus:0}));
    k(0.35, avec(corps(0.4, 0.3), {mainD:[56, 76, 6], relD:1, coudeD:[1, 0.2, 0.2], mdirD:[0, -0.2, 1], pouceD:[0, 1, 0], poingD:0.95, flecheD:1, flecheP:1,
      tete:b.tete + 16, hoche:-4, brasDessus:0}));
    k(0.3, avec(Q_TIENT, corps(0.3, 0)));
    k(0.15, avec(Q_CHERCHE, corps(0.3, 0)));
    k(0.55, {});
  }
  return L;
};

/* ==========================================================
   LES POSES DE BASE DES POSITIONS
   ========================================================== */
/* aux aguets, prête à bondir (Romain : « plus penchée, comme s'il était prêt à partir en courant ») : les pieds écartés, les
   genoux pliés, le poids en avant, les mains prêtes ; l'arc tenu bas sur le côté, le haut un peu vers l'avant (avant, il était
   presque à plat et passait dans les jambes : Romain, 15 h 54) */
P.posAguets = avec(P.repos, {bas:[0, 48, 6], bang:[24, 0, 0], dos:[24, 0, -6], piedG:[-36, 386, 12], piedD:[34, 386, -10], ouvG:0.5, ouvD:0.5,
  genouG:[-0.5, 0, 1], genouD:[0.5, 0, 1], pointeD:10,
  mainG:[-60, 236, 30], coudeG:[-0.8, 0.3, -0.5], arcAxe:[-0.12, 0.92, -0.38], arcDir:[-0.85, 0, 0.5], poingG:0.8,
  mainD:[44, 226, 40], coudeD:[0.8, 0.3, -0.5], mdirD:[-0.2, 0.2, 1], poingD:0.35, hoche:-12,
  sourire:-0.3, largeB:0.8, sourcils:-0.5, plisse:0.2});
/* accroupie : sur la pointe des pieds, les genoux bien ouverts, l'avant-bras droit sur le genou ; l'arc debout à côté de son genou
   droit, un bout au sol */
P.posAccroupi = avec(P.accroupie, {genouG:[-0.8, -0.2, 0.7], genouD:[0.8, -0.2, 0.7], ouvG:0.9, ouvD:0.9,
  mainG:[-64, 312, 60], coudeG:[-1, 0.3, -0.2], arcAxe:[-0.06, 1, 0.06], arcDir:[-0.3, 0, 1], poingG:0.85, pouceG:[0.2, -1, 0.2]});
/* un genou à terre, au repos (Romain, 15 h 54 : « il y a un problème de perspective avec sa jambe gauche ») : les jambes de face,
   comme à l'affût (SON genou gauche au sol, SON pied droit à plat devant) ; l'arc debout à SA droite, un bout au sol, la main
   dessus ; la main gauche posée sur le genou levé */
P.posGenou = avec(P.repos, {bas:[0, 86, -12], bang:[4, 0, 0], dos:[6, 0, 0], piedD:[15, 394, -72], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1], ouvG:0.2,
  mainG:[-62, 296, 34], relG:0, coudeG:[-1, 0.3, -0.2], poingG:0.85, arcAxe:[-0.05, 1, 0.05], arcDir:[-0.4, 0, 1],
  mainD:[-6, 308, 42], relD:0, coudeD:[1, 0.2, -0.3], mdirD:[-1, 0.4, 0.3], poingD:0.25,
  sourire:0.2, sourcils:-0.1});
/* en garde : la dague au poing (la pose « En garde ») */
P.posGarde = avec(P.combat, {});

/* ==========================================================
   LES GESTES DES POSITIONS
   ========================================================== */
var T = HV.tour, b;
/* accroupie, penchée pour toucher le sol : la main droite passe entre les genoux ouverts (avant, la cuisse rentrait dans le corps :
   Romain, 15 h 54) */
/* (Romain, 16 h 39 : « quand elle touche le sol, il y a encore un petit bug avec la jambe » — penchée trop fort, sa cuisse gauche
   passait sous le buste et la botte semblait sortir de la manche. Maintenant elle se penche moins, les genoux bien ouverts, et la
   main descend entre ses pieds, devant elle.) */
var PENCHE = {bas:[0, 116, -16], bang:[32, 0, 0], dos:[36, 0, 0], hoche:24, regY:1, relD:0, mdirD:[0, 1, 0.5], poingD:0.1, mainG:[-72, 346, 74], relG:0,
  genouG:[-1, 0, 0.2], genouD:[1, 0, 0.2], ouvG:1.3, ouvD:1.3};
/* les grands coups de dague (Romain, 15 h 54 : « il faut vraiment que le bras il parte loin du corps comme pour attaquer et faire
   des grands mouvements droite-gauche […] et de haut vers le bas aussi […] comme s'il y avait quelqu'un devant elle et qu'elle
   frappait fort »). La dague est dans SA main gauche ; la lame sort du côté du pouce. */
var ARME_D = {coudeD:[0.9, 0.4, -0.3], poingD:1, dague:1};
function coup(main, pouce, plus2){ return avec(avec(ARME_D, {mainD:main, pouceD:pouce}), plus2 || {}); }
var FENTE = {bas:[0, 34, 18], piedG:[-30, 386, 44], genouG:[-0.4, -0.2, 1]};
/* (toute une pose tournée de A degrés autour du bassin, vers SA gauche si A > 0 : les pieds, les genoux, le bassin) */
function orienter(o, A){
  var R = avec(o, {}), c = [0, 0, 0], bg = o.bang || [0, 0, 0];
  ['G', 'D'].forEach(function(k){
    if(o['pied' + k]) R['pied' + k] = rot(o['pied' + k], A, c);
    if(o['genou' + k]) R['genou' + k] = rotV(o['genou' + k], A);
    R['lacet' + k] = (o['lacet' + k] || 0) + A;
  });
  if(o.bas) R.bas = rot(o.bas, A, c);
  R.bang = [bg[0], bg[1], bg[2] + A];
  return R;
}
HV.POSITIONS = {
  /* AU REPOS : debout, elle vit ; de temps en temps elle regarde à sa droite, à sa gauche (la tête, puis les épaules, les hanches,
     un petit pas), derrière elle, ou son arc */
  /* (les attentes entre deux gestes : à peu près deux fois plus longues — Romain, 16 h 39 : « faire durer un petit peu plus de temps
     entre les mouvements. C'est valable pour toutes les positions ») */
  repos:{titre:'Au repos', base:'repos', attente:[4.5, 8], gestes:{
    /* (à droite : curieuse ; à gauche : elle voit quelque chose qui lui plaît ; derrière : un bruit, elle s'inquiète) */
    /* (quand elle se tourne vers SA droite, la main de l'arc s'écarte un peu et l'arc penche vers l'extérieur : sinon il passait derrière
       son corps — Romain, 17 h 44 : « quand elle regarde derrière elle, là, l'arc il disparaît un petit peu ») */
    droite:HV.regardeEtRevient(P.repos, -50, 1.8, 0, {visage:{sourcils:0.3, sourcilsAsym:0.5, sourire:0.6, regX:-0.3, mainG:[-62, 238, 14], arcAxe:[-0.3, 1, 0.05]}}),
    gauche:HV.regardeEtRevient(P.repos, 50, 1.8, 0, {visage:{sourire:1.2, sourcils:0.35, plisse:0.25, rougit:0.25, regX:0.3}}),
    derriere:HV.regardeEtRevient(P.repos, -95, 1.5, 0, {visage:{sourcilsIn:0.6, sourcils:0.25, ouvre:0.12, sourire:-0.1, largeB:0.7, mainG:[-62, 238, 14], arcAxe:[-0.3, 1, 0.05]}}),
    /* (son arc : elle le lève devant elle et le tourne pour voir sa courbe, pince la corde du bout des doigts, contente) */
    arc:[[0.8, {mainG:[-46, 206, 36], arcAxe:[-0.15, 1, 0.15], arcDir:[-1, 0, 0.25], hoche:14, regY:0.6, regX:-0.5, tete:-14, sourcils:0.15}],
      [1.6, {mainG:[-44, 204, 38], arcAxe:[-0.1, 1, 0.1], arcDir:[-1, 0, 0.35], hoche:12, regY:0.5, regX:-0.6, tete:-16, sourcils:0.2, sourcilsAsym:0.4}],
      [2.2, {mainG:[-44, 204, 38], arcAxe:[-0.1, 1, 0.1], arcDir:[-1, 0, 0.35], mainD:[-18, 196, 34], relD:1, coudeD:[0.9, 0.2, -0.4], mdirD:[-1, 0, 0.3], poingD:0.5, indexD:1,
        hoche:12, regY:0.4, regX:-0.6, tete:-16, sourcilsAsym:0.4}],
      [2.5, {mainG:[-44, 204, 38], arcAxe:[-0.1, 1, 0.1], arcDir:[-1, 0, 0.35], mainD:[-12, 200, 30], relD:1, coudeD:[0.9, 0.2, -0.4], mdirD:[-1, 0, 0.3], poingD:0.5, indexD:1,
        hoche:12, regY:0.4, regX:-0.6, tete:-16, sourire:1.3, sourcils:0.3}],
      [3.4, {mainG:[-46, 206, 36], arcAxe:[-0.15, 1, 0.15], arcDir:[-1, 0, 0.25], hoche:8, regY:0.2, regX:-0.3, tete:-10, sourire:1.3, sourcils:0.3, rougit:0.3}], [4.3, {}]]
  }},
  /* AUX AGUETS : prête à bondir ; elle scrute ; d'un coup la tête part (elle a vu quelque chose), les épaules suivent, les mains se
     préparent, le poids part de ce côté… puis non, elle reste */
  aguets:{titre:'Aux aguets', base:'posAguets', attente:[3.5, 6.5], gestes:{
    scrute:HV.puis(HV.regardeEtRevient(P.posAguets, -45, 1.0, 0, {visage:{plisse:0.5, sourcils:-0.75, sourcilsIn:0.2}}),
      HV.regardeEtRevient(P.posAguets, 45, 1.0, 0, {visage:{plisse:0.35, sourcils:-0.5, sourcilsAsym:0.4, bouchex:0.4}}), 0.5),
    alerteD:(b = P.posAguets, [
      [0.12, avec(T(b, -55, 0), {sourcils:0.4, plisse:-0.3, ouvre:0.15})],
      [0.34, avec(T(b, -55, 1), {sourcils:0.3, plisse:-0.3, mainD:[40, 206, 52], mainG:[-56, 220, 44]})],
      [0.55, avec(T(b, -55, 2), {bas:[-10, 54, 8], sourcils:0.1, mainD:[36, 200, 56], mainG:[-62, 214, 46]})],
      [1.4, avec(T(b, -55, 2), {bas:[-10, 54, 8], sourcils:-0.6, mainD:[36, 200, 56], mainG:[-62, 214, 46]})],
      [1.8, avec(T(b, -40, 1), {bas:[-4, 50, 6], sourcils:-0.5})],
      [2.2, avec(T(b, -20, 0), {sourcils:-0.5})], [2.7, {}]]),
    alerteG:(b = P.posAguets, [
      [0.12, avec(T(b, 55, 0), {sourcils:0.4, plisse:-0.3, ouvre:0.15})],
      [0.34, avec(T(b, 55, 1), {sourcils:0.3, plisse:-0.3, mainD:[46, 206, 52], mainG:[-50, 220, 44]})],
      [0.55, avec(T(b, 55, 2), {bas:[10, 54, 8], sourcils:0.1, mainD:[50, 200, 54], mainG:[-46, 214, 46]})],
      [1.4, avec(T(b, 55, 2), {bas:[10, 54, 8], sourcils:-0.6, mainD:[50, 200, 54], mainG:[-46, 214, 46]})],
      [1.8, avec(T(b, 40, 1), {bas:[4, 50, 6], sourcils:-0.5})],
      [2.2, avec(T(b, 20, 0), {sourcils:-0.5})], [2.7, {}]])
  }},
  /* ACCROUPI : elle s'accroupit et y reste ; elle regarde autour d'elle, pose la main au sol, lit une trace, enlève une poussière,
     se tourne pour regarder derrière elle (le haut du corps tourne, les pieds restent), bouge son arc, tire sur son baudrier */
  accroupi:{titre:'Accroupi', base:'posAccroupi', attente:[4.5, 8], gestes:{
    regarde:HV.puis(HV.regardeEtRevient(P.posAccroupi, -45, 1.3, 0, {sansPas:true, visage:{plisse:0.35, sourcils:-0.4}}),
      HV.regardeEtRevient(P.posAccroupi, 45, 1.3, 0, {sansPas:true, visage:{sourcils:0.2, sourcilsAsym:-0.4, ouvre:0.1}}), 0.6),
    /* (la main au sol : elle tâte la terre, la regarde, réfléchit — sans se presser) */
    sol:[[0.8, avec(PENCHE, {hoche:20, mainD:[8, 372, 62], poingD:0.1, sourcils:-0.2})], [1.4, avec(PENCHE, {mainD:[8, 384, 60], sourcils:-0.35, plisse:0.25})],
      [2.6, avec(PENCHE, {mainD:[8, 384, 60], sourcils:-0.4, plisse:0.3, sourire:-0.1})],
      [3.3, avec(PENCHE, {mainD:[8, 384, 60], tete:-24, regY:0.4, sourcils:0.1, sourcilsAsym:0.5, bouchex:0.4})],
      [4.3, avec(PENCHE, {mainD:[8, 384, 60], tete:-24, regY:0.4, sourcils:0.1, sourcilsAsym:0.5, bouchex:0.4})], [5.1, {}]],
    trace:[[0.9, avec(PENCHE, {mainD:[8, 384, 62], indexD:1, poingD:0.2, sourcils:-0.45, largeB:0.65})],
      [1.8, avec(PENCHE, {mainD:[-4, 384, 64], indexD:1, poingD:0.2, sourcils:-0.5, largeB:0.65, plisse:0.3})],
      [2.7, avec(PENCHE, {mainD:[10, 384, 58], indexD:1, poingD:0.2, sourcils:-0.45, largeB:0.65, plisse:0.3})],
      [3.4, avec(PENCHE, {mainD:[10, 384, 58], indexD:1, poingD:0.2, hoche:14, regY:0.1, sourcils:0.4, ouvre:0.25, sourire:0.4})],
      [4.2, avec(PENCHE, {mainD:[10, 384, 58], indexD:1, poingD:0.2, hoche:12, regY:0, regX:0.4, sourcils:0.2, sourire:0.7})], [5.0, {}]],
    /* (une poussière sur son genou : agacée, elle la chasse d'une pichenette, puis vérifie) */
    /* (la poussière est sur le dessus de SON genou gauche : la main passe dessus, bien au-dessus du genou — avant, elle frottait entre
       les cuisses et passait tantôt devant, tantôt derrière : Romain, 17 h 44 : « la main elle bug, elle passe devant derrière ») */
    poussiere:(b = {relD:0, mdirD:[-0.3, 0.5, 1], pouceD:[-1, 0, 0.2], poingD:0.1, hoche:14, regY:0.6, regX:0.4, tete:10, sourire:-0.3, sourcilsIn:0.3, bouchex:-0.4},
      [[0.7, avec(b, {mainD:[58, 314, 50]})],
      [0.95, avec(b, {mainD:[74, 316, 44]})],
      [1.2, avec(b, {mainD:[58, 314, 50]})],
      [1.45, avec(b, {mainD:[74, 316, 44], sourire:-0.2})],
      [2.3, avec(b, {mainD:[64, 308, 50], poingD:0.3, hoche:12, regY:0.5, regX:0.3, sourire:0.6, sourcils:0.2, sourcilsIn:0, bouchex:0})], [3.0, {}]]),
    derriere:HV.regardeEtRevient(P.posAccroupi, -85, 1.6, 0, {sansPas:true, visage:{sourcils:0.35, sourcilsIn:0.4, ouvre:0.15, largeB:0.7}}),
    arc:[[0.9, {mainG:[-70, 300, 72], arcAxe:[-0.4, 0.85, 0.3], hoche:10, regX:-0.5, regY:0.3, tete:-10, sourcils:0.15}],
      [1.9, {mainG:[-66, 304, 70], arcAxe:[0.05, 0.9, 0.4], hoche:10, regX:-0.5, regY:0.3, tete:-10, sourcilsAsym:0.4, sourire:0.5}],
      [2.6, {mainG:[-66, 304, 70], arcAxe:[0.05, 0.9, 0.4], hoche:8, regX:-0.4, regY:0.2, tete:-8, sourire:0.9}], [3.4, {}]],
    /* (elle remonte son baudrier : un petit effort, les lèvres pincées) */
    baudrier:[[0.8, {mainD:[-8, 172, 30], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:8, regY:0.5, largeB:0.5, sourire:-0.2}],
      [1.2, {mainD:[-8, 182, 32], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:8, regY:0.5, largeB:0.4, sourire:-0.3, plisse:0.3, pen:-4}],
      [1.6, {mainD:[-8, 172, 30], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:6, regY:0.4, sourire:0.5, sourcils:0.2}], [2.4, {}]]
  }},
  /* UN GENOU À TERRE : au repos ; elle sort une flèche (la main derrière l'épaule, le bras levé haut, la flèche sur l'arc), bande l'arc,
     ne tire pas, relâche, range la flèche ; elle met son arc à l'horizontale et l'inspecte, le nettoie ; la main en visière */
  genou:{titre:'Un genou à terre', base:'posGenou', attente:[4.5, 8], gestes:{
    fleche:HV.flecheSortie({base:P.posGenou, lache:false, vise:{bang:[0, 0, 0], dos:[0, 0, 0]}}),
    /* (elle inspecte son arc : tenu à l'horizontale, plus haut et plus loin devant elle qu'avant — il passait derrière son genou levé :
       Romain, 16 h 39 : « il y a un petit bug là quand elle inspecte son arc avec le genou » ; la main gauche glisse sur le bois, le
       nettoie ; elle fronce les sourcils, souffle dessus, puis sourit, contente) */
    inspecte:(b = {mainG:[-24, 178, 80], relG:1, coudeG:[-0.8, 0.5, -0.4], arcAxe:[1, 0.02, 0.1], arcDir:[0, -1, 0.15], pouceG:[0, -1, 0.3], relD:1, coudeD:[0.8, 0.5, -0.4], mdirD:[1, 0, 0.1], poingD:0.2, hoche:14, regY:0.7},
      [[1.0, avec(b, {mainD:[18, 176, 84], sourcils:-0.2})],
      [1.8, avec(b, {mainD:[54, 174, 84], regX:0.5, sourcils:-0.4, plisse:0.3})],
      [2.5, avec(b, {mainD:[20, 176, 84], sourcils:-0.4, plisse:0.3, sourcilsIn:0.3})],
      [3.2, avec(b, {mainD:[56, 174, 84], regX:0.5, sourcils:-0.45, plisse:0.35, sourcilsIn:0.3})],
      /* (elle souffle sur le bois) */
      [3.6, avec(b, {mainD:[40, 180, 78], hoche:18, sourcils:0, ouvre:0.35, largeB:0.4, sourire:-0.2})],
      [4.1, avec(b, {mainD:[40, 180, 78], hoche:18, sourcils:0, ouvre:0.35, largeB:0.4, sourire:-0.2})],
      [4.8, avec(b, {mainD:[30, 316, 26], relD:0, hoche:10, regY:0.5, sourire:1.1, sourcils:0.3, rougit:0.2})], [5.8, {}]]),
    /* (la main en visière : à plat au-dessus des yeux, elle suit la tête — P.visiere, hv-corps.js ; elle scrute loin à droite, puis à
       gauche, lentement ; seuls la tête et un peu les épaules tournent) */
    visiere:(b = {visiere:1, poingD:0, brasDessus:1, plisse:0.6, sourire:-0.1, largeB:0.8, sourcils:-0.35, hoche:-4},
      [[0.8, avec(b, {tete:-8})], [1.7, avec(b, {tete:-38, dos:[6, 0, -8], regX:-0.4})], [3.2, avec(b, {tete:-40, dos:[6, 0, -8], regX:-0.5, sourcilsIn:0.3})],
        [4.2, avec(b, {tete:30, dos:[6, 0, 7], regX:0.4})], [5.6, avec(b, {tete:33, dos:[6, 0, 7], regX:0.5, plisse:0.7, sourcils:-0.5})],
        [6.3, avec(b, {tete:0, sourcils:0.1, plisse:0.3, sourire:0.2})], [7.0, {visiere:0.3, sourire:0.3}], [7.5, {}]])
  }},
  /* EN GARDE : la plupart du temps elle attend ; de temps en temps, une attaque : un grand revers de droite à gauche, un coup de
     gauche à droite, un coup de haut en bas, le bras loin du corps, un pas en avant ; une esquive ; elle range sa dague, se redresse,
     la ressort */
  garde:{titre:'En garde', base:'posGarde', attente:[4.5, 8], gestes:{
    coups:[
      /* l'élan : le bras part en travers, haut, de l'autre côté ; le corps se tord */
      [0.28, coup([-36, 150, 30], [0, -0.4, 1], {dos:[10, 0, -40], bang:[4, 0, -14], bas:[0, 28, -6], sourcils:-1, ouvre:0.1})],
      /* le revers : le bras fend l'air, tendu, devant elle, jusqu'à son côté gauche ; un pas en avant */
      [0.4, coup([20, 158, 96], [0, -0.3, 1], avec(FENTE, {dos:[14, 0, 0], bang:[8, 0, 2], ouvre:0.55}))],
      [0.5, coup([88, 172, 46], [0, -0.3, 1], avec(FENTE, {dos:[14, 0, 28], bang:[8, 0, 10], ouvre:0.5}))],
      /* le coup retour, de gauche à droite */
      [0.72, coup([92, 140, 30], [0, -0.5, 0.9], avec(FENTE, {dos:[12, 0, 30], bang:[8, 0, 10], ouvre:0.1}))],
      [0.84, coup([10, 150, 98], [0, -0.4, 1], avec(FENTE, {dos:[16, 0, 0], bang:[10, 0, 0], ouvre:0.55}))],
      [0.94, coup([-38, 176, 52], [0, -0.4, 1], avec(FENTE, {dos:[16, 0, -30], bang:[10, 0, -10], ouvre:0.5}))],
      /* le coup de haut en bas : la dague au-dessus de la tête, puis elle l'abat devant elle */
      [1.24, coup([34, 56, 16], [0, -1, 0.2], avec(FENTE, {dos:[-6, 0, 6], bang:[0, 0, 0], bas:[0, 26, 14], hoche:-8, ouvre:0.15, brasDessus:1}))],
      [1.38, coup([18, 240, 90], [0, 0.2, 1], avec(FENTE, {dos:[26, 0, 4], bang:[14, 0, 0], bas:[0, 40, 20], hoche:8, ouvre:0.7}))],
      [1.62, coup([20, 236, 86], [0, 0.2, 1], avec(FENTE, {dos:[24, 0, 4], bang:[12, 0, 0], bas:[0, 40, 20], hoche:6, ouvre:0.2}))],
      [2.3, {}]],
    /* LA FENTE (Romain, 16 h 39 : « essayer d'en faire un autre encore plus loin, comme si vraiment elle essayait d'attaquer quelqu'un
       plus loin ») : elle se ramasse, la dague en arrière ; puis un très grand pas en avant du pied gauche, la jambe de derrière
       tendue, le corps penché, le bras tendu au bout, l'épaule gauche devant ; elle crie ; elle tient, puis revient en garde. */
    /* (la fente part un peu sur SA gauche : vue de trois quarts, on la voit mieux s'allonger) */
    fente:[[0.4, coup([44, 204, -22], [0, -0.3, 1], {bas:[-4, 40, -14], bang:[4, 0, 10], dos:[6, 0, 14], piedD:[30, 386, -26], sourcils:-1, plisse:0.5, sourire:-0.4, largeB:0.6})],
      [0.62, orienter(coup([18, 150, 90], [0, -0.3, 1], {bas:[8, 62, 48], bang:[18, 0, -18], dos:[12, 0, -14], hoche:-10, piedD:[26, 386, 124], genouD:[0.2, -0.1, 1], pointeD:-10,
        piedG:[-30, 386, -44], pointeG:40, genouG:[-0.3, 0.2, 1], mainG:[-74, 196, -46], relG:1, coudeG:[-1, 0.3, 0.2], sourcils:-1, ouvre:0.7, plisse:0.3}), 36)],
      [1.0, orienter(coup([16, 152, 92], [0, -0.3, 1], {bas:[8, 64, 50], bang:[18, 0, -18], dos:[12, 0, -14], hoche:-10, piedD:[26, 386, 124], genouD:[0.2, -0.1, 1], pointeD:-10,
        piedG:[-30, 386, -44], pointeG:40, genouG:[-0.3, 0.2, 1], mainG:[-74, 196, -46], relG:1, coudeG:[-1, 0.3, 0.2], sourcils:-0.9, ouvre:0.3, plisse:0.4}), 36)],
      /* (elle se repousse sur le pied de devant et revient) */
      [1.5, orienter(coup([38, 196, 40], [0, -0.3, 1], {bas:[2, 40, 18], bang:[8, 0, -6], dos:[8, 0, -4], piedD:[28, 386, 40], pointeD:20, sourcils:-0.7, ouvre:0.1}), 16)],
      [2.2, {}]],
    esquive:[[0.3, {bas:[-20, 32, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-54, 386, 6], genouG:[-0.5, 0, 1], piedD:[12, 386, -10], mainG:[-76, 206, 10], mainD:[56, 178, 30], sourcils:0.7, sourcilsIn:0.6, ouvre:0.4, tete:18}],
      [0.8, {bas:[-20, 32, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-54, 386, 6], genouG:[-0.5, 0, 1], piedD:[12, 386, -10], mainG:[-76, 206, 10], mainD:[56, 178, 30], sourcils:0.7, sourcilsIn:0.6, ouvre:0.4, tete:18}],
      [1.1, {bas:[18, 30, -6], bang:[-4, 10, 0], dos:[-6, 12, 0], piedD:[52, 386, -14], genouD:[0.5, 0, 1], piedG:[-12, 386, 10], mainD:[60, 182, 40], sourcils:0.5, tete:-14}],
      [1.5, {bas:[18, 30, -6], bang:[-4, 10, 0], dos:[-6, 12, 0], piedD:[52, 386, -14], genouD:[0.5, 0, 1], piedG:[-12, 386, 10], mainD:[60, 182, 40], sourcils:0.5, tete:-14}], [2.1, {}]],
    range:[[0.6, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], hoche:10, regY:0.6}], [0.8, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:0, hoche:10, regY:0.6}],
      [1.6, {bas:[0, 6, 0], bang:[0, 0, 0], dos:[4, 0, -6], mainD:[48, 240, 4], coudeD:[0.7, -0.1, -0.7], mdirD:[0, 0, 0], poingD:0.3, dague:0, sourcils:0, sourire:0.3, largeB:1, plisse:0}],
      [3.2, {bas:[0, 6, 0], bang:[0, 0, 0], dos:[4, 0, -6], mainD:[48, 240, 4], coudeD:[0.7, -0.1, -0.7], mdirD:[0, 0, 0], poingD:0.3, dague:0, sourcils:0, sourire:0.3, largeB:1, plisse:0, tete:20}],
      [3.7, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:0, hoche:6}], [3.85, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:1, hoche:6}],
      [4.3, {}]]
  }}
};
HV.LISTE_POSITIONS = ['repos', 'aguets', 'accroupi', 'genou', 'garde'];
HV.NOMS_GESTES = {droite:'À droite', gauche:'À gauche', derriere:'Derrière elle', arc:'Son arc', scrute:'Elle scrute', alerteD:'Alerte !', alerteG:'Alerte, à gauche !',
  regarde:'Elle regarde', sol:'Main au sol', trace:'Elle lit une trace', poussiere:'Une poussière', baudrier:'Son baudrier',
  fleche:'Une flèche', inspecte:'Elle inspecte son arc', visiere:'La main en visière', coups:'Elle attaque', fente:'Elle attaque loin', esquive:'Esquive', range:'Range sa dague'};

/* ---------- Jouer : où elle en est à l'instant t (appelé par le pantin à chaque image) ---------- */
function attente(Po){ return Po.attente[0] + Math.random() * (Po.attente[1] - Po.attente[0]); }
function choisir(Po, dernier){ var n = Object.keys(Po.gestes).filter(function(g){ return g !== dernier; }); return n[Math.floor(Math.random() * n.length)]; }
HV.positionImage = function(p, base, t){
  var Po = HV.POSITIONS[p.posi];
  if(!Po) return base;
  if(!p.gest){
    if(p.prochain == null) p.prochain = t + attente(Po) * 0.6;
    var force = p.gestForce && Po.gestes[p.gestForce] ? p.gestForce : null;
    /* (p.sansHasard : elle ne fait que les gestes qu'on lui demande — les films) */
    if(force || (t >= p.prochain && !p.sansHasard)){ var nom = force || choisir(Po, p.dernier); p.gestForce = null; p.gest = {nom:nom, t0:t}; p.dernier = nom; }
  }
  if(p.gest){
    var Gst = Po.gestes[p.gest.nom], u = t - p.gest.t0;
    if(u >= Gst[Gst.length - 1][0]){ p.gest = null; p.prochain = t + attente(Po); return base; }
    return HV.gesteImage(base, Gst, u);
  }
  return base;
};
})(window);


/* moteur des héros en volume (jeu/heros-vues/src/hv-donjon.js) */
/* ==========================================================
   Les héros « en volume » — LES MOUVEMENTS DU DONJON, propositions (Romain, 23 novembre, 15 h 04 ; refaites après ses retours de
   15 h 54). Rien n'est branché dans le donjon : ce sont des essais à valider.
   - L'arc est dans SA main droite (Romain, 15 h 54 : « l'arc, il faut le mettre sur la main droite pour qu'on voie mieux l'arc ») :
     tournée vers la droite de trois quarts, c'est la main de notre côté. Pour tirer à droite, elle se met de profil, le dos un peu
     vers nous (comme une archère qui tient l'arc de la main droite).
   - HV.course(t) : la course ; HV.POSES.dGarde : en garde ; HV.DONJON : les gestes (mêmes images clés que hv-positions.js).
   Chargé après hv-positions.js.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES, TAU = Math.PI * 2, avec = HV.avec, C = HV.courbes;

/* ---------- LA COURSE (troisième version — Romain, 16 h 39 : « le mouvement de la course, il est encore un peu bizarre. Regarde sur
   internet des mouvements naturels de course »). Ce que disent les guides d'animation et de course à pied :
   - un pas = 4 images clés : le pied se pose (un peu devant elle, le genou à peine plié) → elle « s'enfonce » (le genou d'appui plie,
     c'est le point le plus bas) → elle pousse (la jambe d'appui s'étend derrière, sur la pointe) → elle est EN L'AIR (le point le plus
     haut, les jambes les plus écartées) ;
   - la jambe libre : le talon remonte derrière, vers les fesses ; le genou passe devant (pas trop haut : elle court, elle ne sprinte
     pas) ; la jambe se déplie et le pied revient se poser SOUS elle, pas loin devant ;
   - le corps penche un peu en avant d'un seul bloc (depuis les chevilles), la tête reste droite et regarde devant ;
   - les bras, pliés à angle droit, balancent à l'opposé des jambes, et c'est EN L'AIR qu'ils sont le plus loin (pas au moment où le
     pied se pose) ; devant, la main monte vers la poitrine et rentre un peu vers le milieu ; derrière, elle passe la hanche ;
   - les hanches et les épaules tournent un peu, en sens contraire. ---------- */
var CYCLE = 0.64, APPUI = 0.32, AV = 30, AR = -48;
/* (le pied en l'air : [phase, avant/arrière, hauteur de la cheville, pointe] ; 0 : il se pose ; APPUI : il quitte le sol) */
var VOL = [[APPUI, AR, 386, 45], [0.42, -56, 352, 70], [0.55, -40, 318, 72], [0.7, -6, 350, 30], [0.85, 36, 368, 0], [0.95, 38, 382, -10], [1, AV, 386, -8]];
var VT = VOL.map(function(v){ return v[0]; }), VZ = VOL.map(function(v){ return v[1]; }), VY = VOL.map(function(v){ return v[2]; }), VP = VOL.map(function(v){ return v[3]; });
var MZ = C.pentes(VT, VZ), MY = C.pentes(VT, VY), MP = C.pentes(VT, VP);
function pied(u, cote){
  var z, y, pt;
  /* (au sol, le pied ne glisse pas : il recule à la vitesse où elle avance) */
  if(u < APPUI){ var a = u / APPUI; z = AV + (AR - AV) * a; y = 386; pt = a < 0.2 ? -8 + 8 * a / 0.2 : a < 0.55 ? 0 : 45 * Math.pow((a - 0.55) / 0.45, 1.4); }
  else { z = C.courbe(VT, VZ, MZ, u); y = C.courbe(VT, VY, MY, u); pt = C.courbe(VT, VP, MP, u); }
  return {p:[cote * 15, y, z], pt:pt};
}
/* un bras plié qui balance (dans les mesures du buste) : phi > 0 (degrés), il part devant. Devant, le coude plie plus et la main rentre
   vers le milieu ; derrière, il s'ouvre un peu. */
function bras(cote, phi){
  var a = phi * Math.PI / 180, av = Math.max(0, phi) / 45, ar = Math.max(0, -phi) / 45, b2 = a + 1.4 + 0.35 * av - 0.2 * ar, S = [cote * 31.5, 151, 0];
  return [S[0] + cote * (8 - 16 * av), S[1] + 50 * Math.cos(a) + 41 * Math.cos(b2), S[2] + 50 * Math.sin(a) + 41 * Math.sin(b2)];
}
HV.COURSE = {cycle:CYCLE, avance:(AV - AR) / APPUI};      /* (de combien elle avance par cycle, dans ses mesures) */
HV.course = function(t){
  var f = ((t / CYCLE) % 1 + 1) % 1, g = pied(f, -1), d = pied((f + 0.5) % 1, 1);
  /* (le bassin : au plus bas au milieu de l'appui, au plus haut en l'air) */
  var hc = (f % 0.5) / 0.5, bob = Math.cos(TAU * (hc - APPUI));
  /* (les bras et les hanches : au plus loin quand elle est en l'air, juste avant que SON pied droit se pose) */
  var w = Math.cos(TAU * (f - 0.9)), yH = 7 * w;
  return avec(P.repos, {bas:[0, 7 + 6 * bob, 6], bang:[9, 0, yH], dos:[3, 0, -2.2 * yH], tete:1.2 * yH, hoche:-9,
    piedG:g.p, pointeG:g.pt, genouG:[-0.1, -0.2, 1], piedD:d.p, pointeD:d.pt, genouD:[0.1, -0.2, 1], ouvG:0.1, ouvD:0.1,
    mainD:bras(1, 44 * w), relD:1, coudeD:[0.25, 0, -1], poingD:0.7, mdirD:[0, -0.3, 1],
    mainG:bras(-1, -26 * w), relG:1, coudeG:[-0.25, 0, -1], arcAxe:[-0.05, 0.95, -0.3], arcDir:[-0.85, 0, 0.5], poingG:0.85,
    sourire:0.1, ouvre:0.3, sourcils:-0.35, plisse:0.1, rougit:0.2});
};
/* ---------- ELLE S'ARRÊTE NET (Romain, 16 h 39 : « quand ils arrivent tous, il faudrait qu'ils se stoppent net, avec peut-être même un
   petit dérapage, parce qu'il y a les bestioles qui arrivent en phase 2 […] qu'ils soient sur leur garde ») : le dernier pied se pose
   loin devant, sur le talon, le corps part en arrière pour freiner, les genoux plient, elle glisse un peu (de la poussière), l'autre
   pied revient, et elle tombe en garde, les yeux sur les ennemis.
   HV.arret(depart) : les images clés, à partir de la pose de course où elle commence à freiner (pour HV.gesteImage(depart, …)) ;
   HV.ARRET.glisse(u) : de combien elle avance encore pendant qu'elle freine (dans ses mesures) ; HV.ARRET.poussiere : quand. */
var V0 = (AV - AR) / (APPUI * CYCLE), FREIN = 0.42;
HV.ARRET = {duree:1.25, vitesse:V0, poussiere:[0.07, 0.4],
  glisse:function(u){ u = Math.max(0, Math.min(FREIN, u)); return V0 * (u - u * u / (2 * FREIN)); }};
HV.arret = function(){
  var g = P.dGarde;
  return [
    /* (le pied droit se pose loin devant, sur le talon ; le corps part en arrière ; les bras s'écartent pour l'équilibre) */
    [0.08, {bas:[0, 30, -18], bang:[-17, 0, 4], dos:[-6, 0, -6], hoche:-2, tete:-6, piedG:[-18, 386, 72], pointeG:-26, genouG:[-0.15, -0.3, 1],
      piedD:[18, 380, -46], pointeD:42, genouD:[0.15, -0.3, 1], mainD:[66, 196, 36], relD:1, coudeD:[1, 0.3, -0.4], poingD:0.4,
      mainG:[-70, 206, 34], relG:1, coudeG:[-1, 0.3, -0.4], sourcils:0.35, ouvre:0.45, plisse:0.35, sourire:-0.2}],
    /* (elle glisse sur ce pied, les genoux pliés ; l'autre pied revient) */
    [0.26, {bas:[0, 54, -20], bang:[-10, 0, 4], dos:[0, 0, -4], hoche:-6, tete:-4, piedG:[-24, 386, 58], pointeG:-16, genouG:[-0.3, -0.3, 1],
      piedD:[24, 378, -12], pointeD:30, genouD:[0.3, -0.3, 1], mainD:[60, 204, 34], relD:1, coudeD:[1, 0.3, -0.4], poingD:0.4,
      mainG:[-66, 212, 34], relG:1, coudeG:[-1, 0.3, -0.4], sourcils:0.1, ouvre:0.3, plisse:0.4, sourire:-0.3}],
    /* (arrêtée : basse, les pieds écartés) */
    [0.44, avec(g, {bas:[0, 44, -2], bang:[2, 0, 0], dos:[6, 0, -4], piedG:[-30, 386, 24], piedD:[30, 386, -12], sourcils:-0.5, ouvre:0.15, plisse:0.3, sourire:-0.3})],
    /* (elle se redresse en garde, un petit rebond, le regard sur les ennemis) */
    [0.7, avec(g, {bas:[0, 22, 2], sourcils:-0.7, plisse:0.3, sourire:-0.35, regX:0.4})],
    [0.95, avec(g, {regX:0.3})],
    [HV.ARRET.duree, g]];
};

/* ---------- EN GARDE, au donjon : DEBOUT, les deux pieds bien posés au sol, les genoux à peine pliés (Romain, 23 novembre, 21 h 32 :
   « les héros, ils flottent dans les airs […] il faut qu'ils soient posés au sol avec une ombre » — les genoux très pliés, le pied de
   derrière plus haut à l'écran, donnaient l'air d'être en plein saut), l'arc prêt de notre côté, la main libre près du carquois ---------- */
P.dGarde = avec(P.repos, {bas:[0, 7, 1], bang:[5, 0, 0], dos:[8, 0, -4], piedG:[-25, 386, 12], piedD:[25, 386, -10], ouvG:0.35, ouvD:0.35,
  genouG:[-0.3, 0, 1], genouD:[0.3, 0, 1],
  mainG:[-58, 226, 30], coudeG:[-0.8, 0.3, -0.5], arcAxe:[-0.1, 0.92, -0.35], arcDir:[-0.85, 0, 0.5], poingG:0.8,
  mainD:[40, 206, 30], coudeD:[0.8, 0.3, -0.5], mdirD:[-0.2, 0.2, 1], poingD:0.45, hoche:-4,
  sourire:-0.2, largeB:0.85, sourcils:-0.55, plisse:0.15});
var b = P.dGarde;
var AIE = {plisse:1, sourcilsIn:1, sourcils:0.2, ouvre:0.55, largeB:0.9, sourire:-0.9, rougit:0.3};
var KO = {plisse:0.95, sourcilsIn:0.85, sourcils:0.1, ouvre:0.25, largeB:0.7, sourire:-0.5, bouchex:0.5};
/* (le pied de derrière recule pour encaisser : SON pied gauche, piedD) */
function recule(z, leve){ return {piedD:[32, 386 - (leve ? 16 : 0), z], pointeD:leve ? 25 : 0}; }

HV.DONJON = {
  /* EN GARDE : elle surveille — les ennemis arrivent à droite, donc son corps reste tourné vers eux ; seuls les yeux et la tête
     bougent (Romain, 16 h 39 : « ça fait bizarre que dans le en garde, il regarde comme ça face à nous ») : les yeux partent d'abord,
     la tête suit, les épaules à peine. En haut à droite (méfiante), en bas à droite, un coup d'œil rapide de l'autre côté, puis de
     nouveau sur les ennemis. Lentement, en tenant chaque regard. */
  regard:[[0.35, {regX:0.8, regY:-0.3}],
    [0.8, {tete:24, hoche:-7, dos:[10, 0, 1], regX:0.5, regY:-0.4, plisse:0.45, sourcils:-0.8, sourcilsIn:0.3}],
    [2.0, {tete:28, hoche:-8, dos:[10, 0, 1.5], regX:0.6, regY:-0.4, plisse:0.5, sourcils:-0.8, sourcilsIn:0.35}],
    [2.35, {tete:20, hoche:2, regX:0.7, regY:0.5, plisse:0.4, sourcils:-0.7}],
    [2.7, {tete:16, hoche:9, dos:[12, 0, 0], regX:0.5, regY:0.6, plisse:0.35, sourcils:-0.6}],
    [3.8, {tete:14, hoche:10, dos:[12, 0, 0], regX:0.4, regY:0.6, plisse:0.35, sourcils:-0.6, sourire:-0.4}],
    /* (un bruit derrière elle : les yeux d'abord, les sourcils montent, la tête tourne un peu — pas jusqu'à nous) */
    [4.05, {tete:6, hoche:0, regX:-0.9, regY:0, sourcils:0.3, ouvre:0.15, plisse:0}],
    [4.4, {tete:-16, hoche:-2, dos:[10, 0, -6], regX:-0.7, sourcils:0.35, ouvre:0.15, largeB:0.7, plisse:0}],
    [5.2, {tete:-18, hoche:-2, dos:[10, 0, -6], regX:-0.6, sourcils:0.25, ouvre:0.1, largeB:0.7, plisse:0.1}],
    /* (rien : elle revient vers les ennemis, plus décidée) */
    [5.6, {tete:4, regX:0.5, sourcils:-0.8, plisse:0.35, sourire:-0.3}],
    [6.4, {regX:0.3, sourcils:-0.7, plisse:0.25}], [6.9, {}]],
  /* ELLE TIRE : la main derrière l'épaule, le bras levé haut, la flèche sur l'arc, deux pas pour se mettre de profil, elle bande,
     lâche (à 1,38 s, comme aujourd'hui au donjon), puis revient en garde */
  tir:HV.flecheSortie({base:b, tourne:105, lache:true}),
  /* ELLE PREND UN COUP : la tête et le buste partent en arrière, le pied de derrière recule pour encaisser, elle grimace ; puis elle
     revient */
  coup:[[0.08, avec(AIE, {bas:[0, 32, -8], bang:[-8, 0, 0], dos:[-16, 0, 8], hoche:-16, pen:-8, mainD:[52, 196, 6], mainG:[-64, 216, 14]})],
    [0.2, avec(AIE, avec(recule(-30, true), {bas:[0, 34, -16], bang:[-8, 0, 0], dos:[-14, 0, 8], hoche:-12, pen:-8, mainD:[52, 200, 6], mainG:[-64, 220, 14]}))],
    [0.32, avec(AIE, avec(recule(-42), {bas:[0, 38, -22], bang:[-2, 0, 0], dos:[-6, 0, 4], hoche:-8, pen:-4}))],
    [0.7, avec(recule(-42), {bas:[0, 36, -18], bang:[4, 0, 0], dos:[6, 0, 0], plisse:0.6, ouvre:0.2, sourcils:-0.6, sourcilsIn:0.4})],
    [1.0, avec(recule(-30, true), {bas:[0, 30, -6]})], [1.25, {}]],
  /* ELLE TOMBE SUR LE DOS (Romain, 16 h 39 : « il faut qu'elle tombe direct sur le dos », et au sol « c'est pas naturel […] le corps
     est penché comme si elle était assise »). Comment on tombe en arrière sans se faire mal (la chute arrière des judokas) : on
     s'accroupit pour tomber de moins haut, on rentre le menton, on arrondit le dos, on s'assoit près des talons, on roule sur le dos
     rond, et les deux bras frappent le sol à plat, écartés, pour amortir ; la tête ne touche pas. Ici : touchée, elle recule d'un pas,
     les genoux lâchent, elle s'assoit, roule sur le dos (les jambes remontent), les bras claquent au sol ; puis elle reste allongée
     à plat, sonnée, la tête posée, l'arc à plat par terre à côté de sa main. Elle se redresse en se tournant sur le côté, sur sa
     main, un genou à terre, et se relève en secouant la tête (le relevé d'avant, que Romain trouvait correct). */
  chute:[[0.08, avec(AIE, {bas:[0, 32, -8], bang:[-8, 0, 0], dos:[-16, 0, 8], hoche:-16, mainD:[52, 196, 6], mainG:[-64, 216, 14]})],
    [0.22, avec(AIE, avec(recule(-36, true), {bas:[0, 40, -18], bang:[-12, -4, 0], dos:[-14, -4, 0], hoche:-12, mainD:[60, 170, 10], mainG:[-72, 180, 10], coudeG:[-0.8, -0.3, -0.5]}))],
    /* (les genoux lâchent : elle descend, le dos rond, le menton rentré, les bras devant pour l'équilibre) */
    [0.38, avec(AIE, {bas:[0, 98, -36], bang:[-18, 0, 0], dos:[18, 0, 0], hoche:16, piedG:[-24, 386, 8], piedD:[26, 386, -26], pointeD:10, genouG:[-0.3, -0.4, 1], genouD:[0.3, -0.4, 1],
      mainD:[44, 226, 52], relD:1, coudeD:[1, 0, -0.3], mainG:[-50, 226, 52], relG:1, coudeG:[-1, 0, -0.3], poingD:0.3, arcAxe:[0, 0.6, 0.8], arcDir:[-1, 0, 0.1]})],
    /* (elle s'assoit par terre, près des talons ; les bras s'écartent) */
    [0.5, avec(AIE, {bas:[0, 148, -56], bang:[-48, 0, 0], dos:[22, 0, 0], hoche:18, piedG:[-24, 392, 26], piedD:[26, 392, 12], pointeG:-20, pointeD:-20, genouG:[-0.3, -1, 0.4], genouD:[0.3, -1, 0.4],
      mainD:[72, 236, 10], relD:1, coudeD:[1, 0.2, -0.2], mainG:[-74, 330, -40], relG:0, coudeG:[-1, 0.2, -0.2], poingD:0.2,
      /* (l'arc se couche avec elle : il ne passe jamais sous le plancher) */
      arcAxe:[0, 0.45, 1], arcDir:[-1, 0, 0]})],
    /* (elle roule sur le dos rond : les jambes remontent, les bras claquent au sol, à plat, écartés ; la tête ne touche pas) */
    [0.64, avec(AIE, {bas:[0, 150, -64], bang:[-96, 0, 0], dos:[16, 0, 0], hoche:20, couche:0.4, piedG:[-24, 326, 18], piedD:[26, 316, -2], pointeG:-10, pointeD:-10, genouG:[-0.3, -1, 0.2], genouD:[0.3, -1, 0.2],
      mainG:[-96, 404, -110], relG:0, coudeG:[-1, -0.4, 0], mdirG:[-0.6, 0, -1], pouceG:[0, -1, 0], mainD:[98, 404, -104], relD:0, coudeD:[1, -0.4, 0], mdirD:[0.6, 0, -1], poingD:0.1,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.5})],
    /* (allongée à plat : la tête se pose, les jambes redescendent, genoux pliés ; l'arc à plat par terre) */
    [0.84, avec(KO, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:4, couche:1, piedG:[-26, 392, 4], piedD:[32, 396, 34], pointeG:-20, pointeD:-34, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[96, 404, -100], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.2,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.4})],
    /* (sonnée : la tête roule un peu d'un côté, elle grogne, ouvre un œil) */
    [1.3, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:4, couche:1, tete:14, piedG:[-26, 392, 4], piedD:[32, 396, 34], pointeG:-20, pointeD:-34, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[96, 404, -100], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.2,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.4, plisse:1, sourcilsIn:0.9, sourcils:0.1, ouvre:0.1, largeB:0.6, sourire:-0.6}],
    [1.9, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:2, couche:1, tete:-6, piedG:[-26, 392, 4], piedD:[30, 396, 26], pointeG:-20, pointeD:-30, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[90, 404, -96], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.4,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.6, plisse:0.6, sourcilsIn:0.8, sourcils:0.2, ouvre:0.35, largeB:0.7, sourire:-0.7, bouchex:0.4}],
    [2.25, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:-2, couche:1, tete:-4, piedG:[-26, 392, 4], piedD:[30, 396, 20], pointeG:-20, pointeD:-26, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-88, 404, -104], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[80, 404, -92], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.5,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.8, plisse:0.45, sourcilsIn:0.7, sourcils:-0.2, ouvre:0.1, sourire:-0.5}],
    /* (elle se redresse en se tournant sur SON côté droit, la main droite à plat par terre, l'arc repris) */
    [2.75, avec(KO, {bas:[-8, 140, -48], bang:[-38, -10, -22], dos:[18, -8, -10], hoche:8, couche:0, piedG:[-26, 392, 20], piedD:[28, 392, 14], pointeG:-15, pointeD:-15, genouG:[-0.2, -1, 0.4], genouD:[0.5, -1, 0.4],
      mainG:[-62, 396, -86], relG:0, coudeG:[-1, 0.1, -0.2], mdirG:[0, 0.3, 1], mainD:[18, 330, -12], relD:0, coudeD:[1, 0, -0.3], poingD:0.3, plisse:0.7, sourcilsIn:0.8,
      arcAxe:[0, 0.12, 1], arcDir:[-1, 0, 0]})],
    /* (elle se redresse sur sa main, ramène les jambes sous elle) */
    [3.25, avec(KO, {bas:[-4, 118, -18], bang:[30, -6, 0], dos:[20, -4, 0], hoche:10, pen:4, piedG:[-28, 386, 26], piedD:[26, 394, -10], pointeD:80, genouG:[-0.4, -0.5, 1], genouD:[0.2, 0.9, 1],
      mainG:[-58, 392, 34], relG:0, mainD:[22, 330, 40], relD:0, plisse:0.6, sourcilsIn:0.7, arcAxe:[0, 0.25, 1], arcDir:[-1, 0, 0.1]})],
    /* (un genou à terre, la main sur le genou) */
    [3.75, {bas:[0, 86, -12], bang:[16, 0, 0], dos:[16, 0, 0], piedD:[15, 394, -60], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1],
      mainD:[-18, 316, 50], relD:0, mdirD:[-1, 0.4, 0.3], poingD:0.2, mainG:[-62, 330, 50], relG:0, hoche:10, plisse:0.4, sourcilsIn:0.6, sourire:-0.4,
      arcAxe:[0, 0.45, 0.9], arcDir:[-1, 0, 0.2]}],
    /* (elle se relève, encore penchée ; puis secoue la tête) */
    [4.35, {bas:[0, 40, -4], bang:[18, 0, 0], dos:[16, 0, 0], piedD:[28, 386, -20], mainD:[-8, 290, 44], relD:0, mdirD:[-1, 0.4, 0.3], hoche:6, sourcilsIn:0.4, plisse:0.2}],
    [4.6, {pen:10, sourcils:-0.4, plisse:0.3}], [4.8, {pen:-10, sourcils:-0.4, plisse:0.3}], [5.0, {pen:6, sourcils:-0.6}], [5.6, {}]],
  /* VICTOIRE : elle se ramasse, saute (le corps monte, les jambes se replient un peu, l'ombre reste au sol), lève l'arc et le poing,
     retombe en pliant les genoux */
  joie:[[0.18, {bas:[0, 50, 4], bang:[12, 0, 0], mainD:[42, 236, -16], mainG:[-60, 232, -8], hoche:6, sourire:1, ouvre:0.3, sourcils:0.6}],
    [0.32, {bas:[0, 6, 0], bang:[2, 0, 0], mainG:[-64, 130, 16], relG:1, mainD:[56, 126, 16], relD:1, poingD:1, sourire:1, ouvre:0.6, sourcils:0.9, pointeG:40, pointeD:40}],
    [0.5, {leve:64, bas:[0, 22, 0], piedG:[-20, 372, 6], piedD:[20, 372, -2], pointeG:30, pointeD:30,
      mainG:[-60, 70, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 76, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.85, sourcils:0.9, plisse:0.5, rougit:0.6, hoche:-8}],
    [0.68, {leve:0, bas:[0, 46, 2], mainG:[-60, 76, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 82, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.7, sourcils:0.9, plisse:0.5, rougit:0.6, hoche:-4}],
    [0.95, {bas:[0, 8, 0], mainG:[-60, 70, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 76, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.7, sourcils:0.9, plisse:0.45, rougit:0.6, hoche:-6}],
    [1.7, {bas:[0, 8, 0], mainG:[-60, 74, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 70, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.5, sourcils:0.9, plisse:0.45, rougit:0.6, hoche:-6}],
    /* (les bras redescendent par les côtés, pas devant elle) */
    [2.05, {bas:[0, 14, 0], mainG:[-86, 176, -4], relG:1, coudeG:[-1, 0.2, -0.2], arcAxe:[-0.2, 1, 0], arcDir:[-0.3, 0, 1], mainD:[84, 176, -4], relD:1, coudeD:[1, 0.2, -0.2], poingD:0.6, sourire:1, ouvre:0.2, sourcils:0.5}],
    [2.5, {}]]
};
/* L'AUTRE VICTOIRE : il saute en tournant sur lui-même, les deux bras en l'air, fou de joie (Romain, 23 novembre, 21 h 32 : la pirouette
   de l'Alchimiste n'allait pas pour préparer une potion, « à la limite, le tourner comme on t'a fait, ça peut être pour la victoire
   […] tu peux garder la victoire que t'as fait et tu fais aléatoirement […] tu peux l'appliquer sur d'autres persos ») ; l'adaptateur
   tire au sort entre joie et joieTour. Un tour complet (tourne : -360, gardé jusqu'à la fin : sinon il retournerait en arrière). */
(function(){
  var BRAS = {mainG:[-56, 78, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 78, 10], relD:1, coudeD:[1, 0.4, 0], poingG:1, poingD:1, brasDessus:1};
  var RIT = {sourire:1, ouvre:0.8, sourcils:0.9, plisse:0.5, rougit:0.6, hoche:-8};
  function enLair(leve, tr){ return avec(avec(BRAS, RIT), {leve:leve, tourne:tr, bas:[0, 18, 0], piedG:[-18, 374, 6], piedD:[18, 374, -2], pointeG:30, pointeD:30}); }
  HV.DONJON.joieTour = [
    [0.18, {bas:[0, 44, 2], bang:[10, 0, 0], mainD:[42, 236, -12], mainG:[-58, 232, -6], hoche:6, sourire:1, ouvre:0.3, sourcils:0.6}],
    [0.3, avec(avec(BRAS, RIT), {bas:[0, 6, 0], pointeG:40, pointeD:40, mainG:[-60, 120, 14], mainD:[58, 118, 14]})],
    [0.4, enLair(30, -60)], [0.52, enLair(44, -170)], [0.64, enLair(38, -280)], [0.76, enLair(12, -350)],
    [0.84, avec(avec(BRAS, RIT), {tourne:-360, bas:[0, 40, 2], ouvre:0.6})],
    [1.1, avec(avec(BRAS, RIT), {tourne:-360, bas:[0, 8, 0], ouvre:0.7, mainG:[-60, 70, 10], mainD:[58, 72, 10]})],
    [1.5, avec(avec(BRAS, RIT), {tourne:-360, bas:[0, 8, 0], ouvre:0.5, mainG:[-58, 76, 10], mainD:[56, 68, 10]})],
    [1.85, {tourne:-360, bas:[0, 12, 0], mainG:[-86, 176, -4], relG:1, coudeG:[-1, 0.2, -0.2], arcAxe:[-0.2, 1, 0], arcDir:[-0.3, 0, 1], mainD:[84, 176, -4], relD:1, coudeD:[1, 0.2, -0.2], poingD:0.6, sourire:1, ouvre:0.2, sourcils:0.5}],
    [2.25, {tourne:-360}]];
})();

/* ==========================================================
   LES AUTRES MOUVEMENTS DU DONJON (Romain, 23 novembre, 17 h 44 : « tu peux continuer un petit peu toutes les animations qu'il y a
   dans le donjon ») — d'après l'inventaire de LISEZ-MOI.md (ce que le donjon appelle aujourd'hui dans heros-anime.js). Les effets
   (la toile, le givre, les rats, la langue du crapaud, la main de Léo, la lueur de l'amulette) sont dessinés par le film
   (essai/film-donjon.html), pas par le héros.
   ========================================================== */
/* allongée sur le dos, à plat (la fin de la chute) */
var ALLONGEE = {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:4, couche:1, piedG:[-26, 392, 4], piedD:[32, 396, 34], pointeG:-20, pointeD:-34, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
  mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[96, 404, -100], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.2,
  arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.4};
HV.ALLONGEE = avec(P.dGarde, ALLONGEE);
/* (le relevé de la chute, que Romain a validé : à partir de 2,75 s, remis à zéro) */
var RELEVE = HV.DONJON.chute.filter(function(k){ return k[0] >= 2.75; }).map(function(k){ return [k[0] - 2.75, k[1]]; });
/* (pour l'essai dans le donjon, donjon/hv-adaptateur.js : allongée sonnée, le relevé, la toile) */
HV.SONNEE = avec(KO, ALLONGEE); HV.RELEVE = RELEVE;
function decale(L, dt){ return L.map(function(k){ return [k[0] + dt, k[1]]; }); }
/* un frisson : de petits allers-retours rapides de A, de t0 à t1, autour d'une pose */
function frissons(pose, t0, t1, pas, f){
  var L = [], t, i = 0;
  for(t = t0; t < t1 - 1e-6; t += pas, i++) L.push([t, avec(pose, f(i % 2 ? 1 : -1, (t - t0) / (t1 - t0)))]);
  return L;
}

/* C'EST SON TOUR : elle se redresse, inspire, serre son arc, un petit signe de tête décidé */
/* (elle ne monte plus sur ses jambes : Romain, 20 h 05, « les héros, ils flottent […] se soulever, et puis rebaisser » — les
   pieds et le bassin restent où ils sont, seuls le buste, la tête et les poings bougent) */
HV.DONJON.choisi = [[0.25, {dos:[2, 0, -4], bang:[4, 0, 0], hoche:-8, sourcils:0.4, ouvre:0.15, plisse:-0.2, regX:0.2}],
  [0.55, {dos:[0, 0, -4], bang:[4, 0, 0], hoche:8, sourcils:-0.6, sourire:0.4, plisse:0.2, poingG:0.95, poingD:0.7}],
  [0.85, {dos:[2, 0, -4], bang:[4, 0, 0], hoche:-4, sourcils:-0.8, sourire:0.5, plisse:0.3, poingG:0.95, poingD:0.7, regX:0.4}],
  [1.8, {dos:[2, 0, -4], bang:[4, 0, 0], hoche:-4, sourcils:-0.8, sourire:0.5, plisse:0.3, poingG:0.95, poingD:0.7, regX:0.3}], [2.3, {}]];

/* (la première version du coup de dague, gardée pour mémoire — remplacée plus bas : Romain, 18 h 51, « plus violent ») */
var DAGUE_V1 = [[0.18, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, hoche:8, regY:0.4}],
  [0.3, {mainD:[42, 222, 10], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:2}],
  [0.48, {mainD:[60, 140, -26], coudeD:[1, -0.3, -0.3], pouceD:[0, -0.5, 1], poingD:1, dague:1, dos:[-4, 0, 14], bang:[0, 0, 6], bas:[0, 30, -6], sourcils:-1, plisse:0.4, sourire:-0.3}],
  [0.62, {piedD:[30, 386, 92], genouD:[0.3, -0.1, 1], pointeD:-6, piedG:[-30, 386, -36], pointeG:30, bas:[4, 50, 40], bang:[16, 0, 6], dos:[14, 0, 8],
    mainD:[24, 150, 86], coudeD:[0.6, 0.3, -0.3], pouceD:[0, -0.6, 1], poingD:1, dague:1, ouvre:0.65, sourcils:-1, plisse:0.3, largeB:0.8}],
  [0.74, {piedD:[30, 386, 92], genouD:[0.3, -0.1, 1], pointeD:-6, piedG:[-30, 386, -36], pointeG:30, bas:[4, 52, 42], bang:[16, 0, 4], dos:[16, 0, -2],
    mainD:[8, 206, 76], coudeD:[0.6, 0.6, -0.3], pouceD:[0, 0.3, 1], poingD:1, dague:1, ouvre:0.4, sourcils:-1, plisse:0.4}],
  [1.15, {piedD:[30, 386, 92], genouD:[0.3, -0.1, 1], pointeD:-6, piedG:[-30, 386, -36], pointeG:30, bas:[4, 50, 40], bang:[14, 0, 4], dos:[14, 0, 0],
    mainD:[10, 204, 74], coudeD:[0.6, 0.6, -0.3], pouceD:[0, 0.3, 1], poingD:1, dague:1, ouvre:0.1, sourcils:-0.8, plisse:0.3}],
  /* (elle se repousse sur le pied de devant et revient) */
  [1.5, {piedD:[30, 376, 20], pointeD:20, bas:[0, 34, 10], mainD:[46, 200, 40], coudeD:[0.9, 0.3, -0.4], pouceD:[0, -0.5, 1], poingD:1, dague:1, sourcils:-0.7}],
  [1.85, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:6, regY:0.3}],
  [1.95, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, dague:0, hoche:6, regY:0.3}], [2.4, {}]];

/* LE COUP DE DAGUE, DEUXIÈME VERSION (Romain, 23 novembre, 18 h 51 : « il faut que ça soit un peu plus violent et un peu plus vers
   devant […] un mouvement plus ample […] que le bras entraîne un peu le corps et que quand il donne un grand coup à gauche, t'as le
   corps qui se tourne un petit peu à gauche et quand il donne un grand coup à droite, t'as le corps qui tourne un petit peu vers la
   droite aussi ») : elle tire la dague, s'élance d'un grand pas, et frappe deux fois : un grand revers qui part de haut, de SON côté
   gauche, et traverse devant elle jusqu'à SA droite (tout le haut du corps tourne avec), puis le retour, de SA droite à SA gauche (le
   corps repart dans l'autre sens). Les bras bien loin du corps, devant elle. */
var FENTE_D = {piedD:[30, 386, 104], genouD:[0.3, -0.1, 1], pointeD:-6, piedG:[-30, 386, -40], pointeG:34, genouG:[-0.3, 0.2, 1], bas:[4, 54, 44]};
function frappe(main, pouce, lacet, plus2){ return avec(avec(FENTE_D, {mainD:main, coudeD:[0.8, 0.3, -0.3], pouceD:pouce, poingD:1, dague:1, bang:[18, 0, lacet * 0.45], dos:[14, 0, lacet]}), plus2 || {}); }
HV.DONJON.dague = [[0.16, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, hoche:8, regY:0.4, sourcils:-0.6}],
  [0.28, {mainD:[42, 222, 10], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:2, sourcils:-0.8}],
  /* (l'élan : la dague haut, de SON côté gauche, en arrière ; le corps tourné vers elle) */
  [0.44, {mainD:[70, 118, -30], coudeD:[1, -0.4, -0.2], pouceD:[0, -0.6, 1], poingD:1, dague:1, dos:[-2, 0, 26], bang:[2, 0, 12], bas:[0, 34, -8], hoche:-4,
    sourcils:-1, plisse:0.5, sourire:-0.4, largeB:0.6}],
  /* (le grand revers : elle s'élance, la lame passe devant elle, loin, et finit à SA droite ; le corps suit) */
  [0.54, frappe([22, 156, 86], [0, -0.6, 1], 4, {ouvre:0.7, sourcils:-1, plisse:0.3, largeB:0.85})],
  [0.62, frappe([-30, 192, 48], [0, 0.2, 1], -30, {ouvre:0.6, sourcils:-1, plisse:0.4})],
  [0.78, frappe([-26, 186, 50], [0, 0.2, 1], -32, {ouvre:0.2, sourcils:-1, plisse:0.5})],
  /* (le retour : de SA droite à SA gauche, le corps repart dans l'autre sens) */
  [0.9, frappe([24, 150, 86], [0, -0.3, -1], 4, {ouvre:0.75, sourcils:-1, plisse:0.3})],
  [0.98, frappe([84, 168, 22], [0, -0.3, -1], 30, {ouvre:0.5, sourcils:-1, plisse:0.4})],
  [1.3, frappe([80, 172, 24], [0, -0.3, -1], 26, {ouvre:0.1, sourcils:-0.8, plisse:0.4, sourire:-0.2})],
  /* (elle se repousse sur le pied de devant et revient) */
  [1.62, {piedD:[30, 376, 20], pointeD:20, bas:[0, 34, 10], mainD:[46, 200, 40], coudeD:[0.9, 0.3, -0.4], pouceD:[0, -0.5, 1], poingD:1, dague:1, sourcils:-0.7}],
  [1.95, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:6, regY:0.3}],
  [2.05, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, dague:0, hoche:6, regY:0.3}], [2.5, {}]];

/* LE SAUT À LA DAGUE (Romain, 18 h 51 : « quand le dernier ennemi est sur le 3e rang, il faut qu'il saute jusqu'au dernier rang […]
   il faut que ça soit un joli saut ») : elle tire la dague, se ramasse, bondit (les bras qui montent, les genoux repliés en l'air, la
   dague levée au-dessus de la tête), retombe en abattant la dague, puis rebondit en arrière jusqu'à sa place.
   HV.SAUT : quand elle décolle, retombe, repart, revient — pour le film (et le donjon : elle avance pendant le saut). */
HV.SAUT = {decolle:0.55, haut:0.8, frappe:1.05, repart:1.62, revient:1.98};
HV.DONJON.dagueSaut = [[0.16, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, hoche:8, regY:0.4, sourcils:-0.6}],
  [0.28, {mainD:[42, 222, 10], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:2, sourcils:-0.8}],
  /* (elle se ramasse, les bras en arrière) */
  [0.46, {bas:[0, 72, -6], bang:[22, 0, 0], dos:[14, 0, 0], hoche:-6, genouG:[-0.4, -0.1, 1], genouD:[0.4, -0.1, 1], mainD:[46, 214, -46], coudeD:[1, 0, -0.2], poingD:1, dague:1,
    mainG:[-58, 214, -40], relG:1, coudeG:[-1, 0, -0.2], sourcils:-1, plisse:0.5, sourire:-0.3}],
  /* (elle décolle : les jambes poussent, les bras montent) */
  [HV.SAUT.decolle, {leve:30, bas:[0, 6, 10], bang:[10, 0, 0], dos:[4, 0, 0], hoche:-10, piedG:[-24, 392, -30], pointeG:60, piedD:[24, 388, -10], pointeD:50,
    mainD:[36, 90, 30], coudeD:[1, -0.3, 0], pouceD:[0, -1, 0.2], poingD:1, dague:1, mainG:[-62, 120, 20], relG:1, coudeG:[-1, -0.3, 0], ouvre:0.6, sourcils:-1, plisse:0.3}],
  /* (tout en haut : les genoux repliés, la dague levée au-dessus de la tête) */
  [HV.SAUT.haut, {leve:96, bas:[0, 40, 0], bang:[4, 0, 0], hoche:-6, piedG:[-24, 330, 30], pointeG:30, piedD:[24, 320, 10], pointeD:30, genouG:[-0.3, -0.6, 1], genouD:[0.3, -0.6, 1],
    mainD:[30, 46, 4], coudeD:[1, -0.2, -0.2], pouceD:[0, -1, 0.3], poingD:1, dague:1, brasDessus:1, mainG:[-66, 140, 30], relG:1, coudeG:[-1, -0.2, 0], ouvre:0.5, sourcils:-1, plisse:0.4}],
  [HV.SAUT.frappe - 0.1, {leve:46, bas:[0, 20, 10], bang:[14, 0, 0], hoche:-2, piedG:[-28, 380, -10], pointeG:20, piedD:[28, 380, 30], pointeD:10,
    mainD:[28, 110, 60], coudeD:[1, -0.2, -0.2], pouceD:[0, -0.8, 0.6], poingD:1, dague:1, mainG:[-66, 160, 30], relG:1, coudeG:[-1, -0.2, 0], ouvre:0.8, sourcils:-1, plisse:0.3}],
  /* (elle retombe en abattant la dague, un genou presque à terre) */
  [HV.SAUT.frappe, avec(FENTE_D, {leve:0, bas:[4, 70, 40], bang:[26, 0, 0], dos:[18, 0, 0], hoche:4, mainD:[14, 212, 74], coudeD:[0.7, 0.4, -0.3], pouceD:[0, 0.4, 1], poingD:1, dague:1,
    mainG:[-74, 200, -10], relG:1, coudeG:[-1, 0, -0.2], ouvre:0.7, sourcils:-1, plisse:0.5})],
  [1.4, avec(FENTE_D, {bas:[4, 64, 38], bang:[22, 0, 0], dos:[14, 0, 0], hoche:2, mainD:[16, 208, 72], coudeD:[0.7, 0.4, -0.3], pouceD:[0, 0.4, 1], poingD:1, dague:1,
    mainG:[-74, 204, -6], relG:1, coudeG:[-1, 0, -0.2], ouvre:0.1, sourcils:-0.9, plisse:0.4, sourire:-0.2})],
  /* (elle rebondit en arrière jusqu'à sa place) */
  [HV.SAUT.repart, {leve:0, bas:[0, 56, 0], bang:[10, 0, 0], mainD:[44, 200, 30], coudeD:[0.9, 0.3, -0.4], poingD:1, dague:1, sourcils:-0.7}],
  [HV.SAUT.repart + 0.18, {leve:64, bas:[0, 30, -6], bang:[-8, 0, 0], dos:[-6, 0, 0], piedG:[-24, 350, 20], pointeG:30, piedD:[24, 346, 0], pointeD:30, genouG:[-0.3, -0.5, 1], genouD:[0.3, -0.5, 1],
    mainD:[60, 180, 10], coudeD:[1, 0, -0.3], poingD:1, dague:1, mainG:[-70, 180, 0], relG:1, sourcils:-0.6}],
  [HV.SAUT.revient, {leve:0, bas:[0, 44, -6], bang:[8, 0, 0], mainD:[46, 204, 34], coudeD:[0.9, 0.3, -0.4], poingD:1, dague:1, sourcils:-0.7}],
  [2.3, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:6, regY:0.3}],
  [2.4, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, dague:0, hoche:6, regY:0.3}], [2.9, {}]];

/* LE GIVRE : touchée par le froid, elle se recroqueville, les bras serrés contre elle, les genoux l'un contre l'autre ; elle grelotte
   (des frissons rapides), puis s'ébroue d'un coup et revient en garde */
var GELEE = {bas:[0, 40, -4], bang:[10, 0, 0], dos:[24, 0, 0], hoche:14, mainD:[-14, 190, 40], relD:1, coudeD:[0.6, 0.5, -0.2], mdirD:[-1, 0, 0.3], poingD:0.6,
  mainG:[-22, 204, 42], relG:1, coudeG:[-0.6, 0.5, -0.2], arcAxe:[-0.35, 1, 0.3], arcDir:[-0.6, 0, 0.8], piedG:[-14, 386, 8], piedD:[14, 386, -4], genouG:[0.2, 0, 1], genouD:[-0.2, 0, 1],
  ouvG:-0.1, ouvD:-0.1, plisse:0.8, sourcilsIn:1, sourcils:0.2, ouvre:0.12, largeB:1.25, sourire:-0.5};
HV.DONJON.froid = [[0.08, avec(AIE, {bas:[0, 30, -6], dos:[-10, 0, 4], hoche:-10})], [0.35, GELEE]]
  .concat(frissons(GELEE, 0.45, 2.0, 0.07, function(s, a){ return {bas:[s * 2.2, 40, -4], pen:s * 3, sourcilsAsym:s * 0.2}; }))
  .concat([[2.1, GELEE],
    /* (elle s'ébroue : les bras s'ouvrent, la tête secoue) */
    [2.28, {bas:[0, 30, 0], pen:-10, mainD:[64, 210, 20], relD:1, mainG:[-66, 214, 22], relG:1, sourcils:0.2, plisse:0.9, ouvre:0.3, largeB:0.8}],
    [2.42, {bas:[0, 30, 0], pen:10, mainD:[64, 210, 20], relD:1, mainG:[-66, 214, 22], relG:1, sourcils:0.2, plisse:0.9, ouvre:0.3, largeB:0.8}],
    [2.56, {bas:[0, 30, 0], pen:-6, mainD:[60, 212, 20], relD:1, mainG:[-64, 216, 22], relG:1, sourcils:-0.4, plisse:0.5}],
    [3.1, {sourcils:-0.7, plisse:0.3, sourire:-0.2}], [3.5, {}]]);

/* LES RATS (le grouillement) : ils lui grimpent dessus — elle sursaute, regarde ses pieds, dégoûtée, tape des pieds l'un après
   l'autre, chasse les rats de sa hanche du revers de la main, puis frissonne de dégoût */
var RATS_V = {hoche:20, regY:1, sourire:-0.9, bouchex:0.6, sourcilsIn:0.7, ouvre:0.3, plisse:0.4};
function tape(cote, haut){
  var R = avec(RATS_V, {bas:[cote === 'D' ? -4 : 4, 26, 2], mainD:[62, 204, 18], relD:1, coudeD:[1, 0.2, -0.3], poingD:0.2});
  /* (24 novembre — Romain, 13 h 14 : « avant, ils tapaient des pieds, et là, ils font plus rien ») : au donjon, on la voit de loin —
     le pied monte bien plus haut (330 au lieu de 352), et à chaque pied levé elle sautille (leve), comme l'ancien héros qui sautait */
  if(cote === 'D') R.piedD = [30, haut ? 330 : 386, -10]; else R.piedG = [-32, haut ? 330 : 386, 18];
  R['pointe' + cote] = haut ? 30 : 0; R['genou' + cote] = cote === 'D' ? [0.5, -0.2, 1] : [-0.5, -0.2, 1];
  if(haut) R.leve = 12;
  return R;
}
HV.DONJON.rats = [[0.12, {hoche:16, regY:0.9, sourcils:0.7, ouvre:0.5, plisse:-0.3, bas:[0, 20, -4]}],
  [0.35, tape('D', true)], [0.5, tape('D', false)], [0.68, tape('G', true)], [0.83, tape('G', false)],
  [1.0, tape('D', true)], [1.15, tape('D', false)], [1.33, tape('G', true)], [1.48, tape('G', false)],
  /* (le revers de la main sur la hanche, deux fois) */
  [1.7, avec(RATS_V, {bas:[0, 30, 0], mainD:[40, 232, 30], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0, 1, 0.4], poingD:0.1})],
  [1.85, avec(RATS_V, {bas:[0, 30, 0], mainD:[50, 222, 40], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0.3, 1, 0.6], poingD:0.1})],
  [2.0, avec(RATS_V, {bas:[0, 30, 0], mainD:[40, 232, 30], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0, 1, 0.4], poingD:0.1})],
  [2.15, avec(RATS_V, {bas:[0, 30, 0], mainD:[50, 222, 40], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0.3, 1, 0.6], poingD:0.1})],
  /* (un frisson de dégoût) */
  [2.4, {bas:[0, 20, 0], pen:-6, hoche:-6, sourire:-1, bouchex:0.7, plisse:0.9, sourcilsIn:0.8, ouvre:0.25, largeB:0.6}],
  [2.52, {bas:[0, 20, 0], pen:6, hoche:-6, sourire:-1, bouchex:0.7, plisse:0.9, sourcilsIn:0.8, ouvre:0.25, largeB:0.6}],
  [2.64, {bas:[0, 20, 0], pen:-3, hoche:-4, sourire:-0.8, bouchex:0.5, plisse:0.6, sourcilsIn:0.6}],
  [3.2, {sourire:-0.3, sourcils:-0.6}], [3.6, {}]];

/* LE GRAND COUP DE POING : bien plus fort que le coup — la tête part en arrière, elle recule de deux pas, sonnée ; elle secoue la
   tête, s'essuie la bouche du dos de la main, furieuse, et revient en garde */
/* (Romain, 18 h 51 : « tu peux le faire un petit peu se tourner quand il prend un coup […] on a plus l'effet que c'est en 3D » : le coup
   lui fait tourner la tête et les épaules vers nous, puis les hanches suivent, et elle revient face aux ennemis) */
/* (Romain, 20 h 05 : « trop repoussé en arrière […] on a l'impression qu'il flotte […] c'est juste le torse qui se fait
   propulser en arrière et il y a le pied gauche qui retient pour éviter qu'elle tombe » : elle ne glisse plus ; le pied de devant
   reste planté, le buste part en arrière en tournant, et SON pied gauche part loin derrière pour la retenir) */
var BRACE = {piedD:[36, 386, -118], pointeD:0, genouD:[0.45, 0.1, 1]};
HV.DONJON.poing = [[0.06, avec(AIE, {bas:[0, 30, -16], bang:[-14, 0, -16], dos:[-30, 0, -34], tete:-24, hoche:-24, pen:-12, mainD:[62, 186, 0], mainG:[-72, 204, 6]})],
  /* (le pied gauche part en arrière, en l'air) */
  [0.2, avec(AIE, {piedD:[34, 368, -72], pointeD:25, bas:[0, 36, -32], bang:[-18, -4, -30], dos:[-28, -6, -30], tete:-20, lacetD:-14, hoche:-18, pen:-10, mainD:[66, 176, -6], mainG:[-76, 192, 0]})],
  /* (il se plante loin derrière : elle est retenue, le buste encore en arrière, les genoux pliés) */
  [0.34, avec(AIE, avec(BRACE, {bas:[0, 46, -46], bang:[-12, -4, -34], dos:[-18, -4, -16], tete:-10, lacetD:-18, hoche:-10, pen:-6}))],
  [0.55, avec(KO, avec(BRACE, {bas:[0, 48, -46], bang:[4, 0, -16], dos:[8, 0, 6], hoche:6, pen:4, lacetD:-10}))],
  [0.85, avec(KO, avec(BRACE, {bas:[0, 48, -44], bang:[6, 0, 0], dos:[10, 0, 0], hoche:4, pen:10}))],
  [1.0, avec(KO, avec(BRACE, {bas:[0, 48, -44], bang:[6, 0, 0], dos:[10, 0, 0], hoche:4, pen:-10}))],
  [1.15, avec(BRACE, {bas:[0, 46, -42], bang:[6, 0, 0], dos:[10, 0, 0], hoche:4, pen:4, plisse:0.5, sourcilsIn:0.6})],
  /* (elle s'essuie la bouche du dos de la main, furieuse) */
  [1.5, avec(BRACE, {bas:[0, 44, -40], bang:[6, 0, 0], dos:[8, 0, 0], hoche:6, mainD:[10, 122, 40], relD:1, coudeD:[1, 0.5, -0.2], mdirD:[-1, 0, 0.2], poingD:0.7,
    sourcils:-1, plisse:0.5, sourire:-0.6})],
  [1.7, avec(BRACE, {bas:[0, 44, -40], bang:[6, 0, 0], dos:[8, 0, 0], hoche:6, mainD:[-14, 124, 44], relD:1, coudeD:[1, 0.5, -0.2], mdirD:[-1, 0, 0.2], poingD:0.7,
    sourcils:-1, plisse:0.5, sourire:-0.6})],
  /* (le pied gauche revient sous elle) */
  [2.05, avec(recule(-40, true), {bas:[0, 34, -14], sourcils:-1, plisse:0.4, sourire:-0.5})],
  [2.35, {sourcils:-0.9, plisse:0.3, sourire:-0.4}], [2.8, {}]];

/* LA TOILE : la toile la colle — les bras plaqués contre le corps, les genoux serrés ; elle se débat (elle se tord à droite, à
   gauche, de plus en plus fort), se ramasse… et la déchire en ouvrant les bras d'un coup ; fière d'elle */
var COLLEE = HV.COLLEE = {bas:[0, 30, -4], dos:[0, 0, 0], bang:[4, 0, 0], mainG:[-38, 232, 14], relG:1, coudeG:[-0.3, 0, -1], arcAxe:[-0.05, 1, 0.05], arcDir:[-0.6, 0, 0.8],
  mainD:[38, 232, 14], relD:1, coudeD:[0.3, 0, -1], poingD:0.8, piedG:[-16, 386, 6], piedD:[16, 386, -6], genouG:[-0.1, 0, 1], genouD:[0.1, 0, 1], ouvG:0.1, ouvD:0.1,
  sourcils:-0.6, sourcilsIn:0.4, bouchex:0.5, sourire:-0.4};
HV.DONJON.toile = [[0.1, {sourcils:0.6, ouvre:0.45, bas:[0, 30, -4], plisse:-0.2}], [0.35, COLLEE],
  [0.65, avec(COLLEE, {dos:[0, 0, 14], bas:[-3, 30, -4], hoche:6, plisse:0.4})], [0.9, avec(COLLEE, {dos:[0, 0, -14], bas:[3, 30, -4], hoche:6, plisse:0.4})],
  [1.15, avec(COLLEE, {dos:[6, 0, 18], bas:[-4, 32, -4], hoche:10, plisse:0.7, largeB:0.5, sourire:-0.6})], [1.4, avec(COLLEE, {dos:[6, 0, -18], bas:[4, 32, -4], hoche:10, plisse:0.7, largeB:0.5, sourire:-0.6})],
  /* (elle se ramasse, rassemble ses forces) */
  [1.75, avec(COLLEE, {bas:[0, 46, -2], dos:[14, 0, 0], hoche:14, mainD:[30, 218, 26], mainG:[-30, 218, 26], plisse:0.95, sourire:-0.7, largeB:0.4, sourcils:-1})],
  /* (et déchire la toile : les bras s'ouvrent d'un coup, elle crie) */
  [1.92, {bas:[0, 10, 0], dos:[-6, 0, 0], bang:[0, 0, 0], hoche:-10, mainD:[88, 168, 10], relD:1, coudeD:[1, -0.2, -0.3], poingD:0.9, mainG:[-88, 170, 10], relG:1, coudeG:[-1, -0.2, -0.3],
    arcAxe:[-0.3, 1, 0], arcDir:[-0.3, 0, 1], ouvre:0.75, sourcils:-1, plisse:0.3, largeB:0.9}],
  [2.15, {bas:[0, 12, 0], dos:[-4, 0, 0], hoche:-8, mainD:[84, 172, 10], relD:1, coudeD:[1, -0.2, -0.3], mainG:[-84, 174, 10], relG:1, coudeG:[-1, -0.2, -0.3], arcAxe:[-0.3, 1, 0], arcDir:[-0.3, 0, 1],
    ouvre:0.3, sourcils:-0.6, sourire:0.4}],
  [2.6, {sourire:0.7, sourcils:-0.3, plisse:0.2}], [3.1, {}]];

/* LE CRAPAUD : sa langue la colle — elle est tirée en avant, les pieds décollent, et elle disparaît (le film la tire hors de
   l'image) ; puis il la recrache : elle revient en volant, roulée en boule, retombe assise, couverte de bave ; elle s'ébroue comme
   un chien, dégoûtée, se relève et s'essuie la figure.
   HV.CRAPAUD : quand elle part (avalee), quand elle revient (recrachee), quand elle touche le sol (pose) — pour le film. */
HV.CRAPAUD = {colle:0.5, avalee:1.05, recrachee:2.2, pose:2.62, ebroue:2.9, debout:3.95};
/* (24 novembre — Romain, 13 h 19 : « pas assez rapide […] on attend trop ». Après la chute : assise 0,28 s au lieu de 0,5, quatre
   secousses de chien en 0,34 s au lieu de 0,5, debout à 3,95 s au lieu de 4,6 ; ebroue, debout : pour le film et les sons.) */
var BOULE = {leve:40, bas:[0, 96, -10], bang:[-30, 0, 0], dos:[30, 0, 0], hoche:24, piedG:[-20, 330, 40], piedD:[20, 330, 40], pointeG:20, pointeD:20, genouG:[-0.2, -1, 0.6], genouD:[0.2, -1, 0.6],
  mainD:[24, 230, 60], relD:1, coudeD:[0.8, 0.4, -0.2], mainG:[-28, 232, 60], relG:1, coudeG:[-0.8, 0.4, -0.2], arcAxe:[-0.6, 0.8, 0.2], arcDir:[-0.4, 0, 1],
  plisse:1, sourcilsIn:0.9, ouvre:0.3, largeB:0.6, sourire:-0.6};
var ASSISE = {bas:[0, 148, -56], bang:[-40, 0, 0], dos:[18, 0, 0], hoche:10, piedG:[-24, 392, 30], piedD:[26, 392, 16], pointeG:-20, pointeD:-20, genouG:[-0.3, -1, 0.4], genouD:[0.3, -1, 0.4],
  mainD:[40, 388, -70], relD:0, coudeD:[1, 0, -0.3], mdirD:[0, 0.3, -1], poingD:0.1, mainG:[-48, 388, -74], relG:0, coudeG:[-1, 0, -0.3], arcAxe:[0, 0.3, 1], arcDir:[-1, 0, 0.1]};
var BAVE = {sourire:-1, bouchex:0.7, plisse:0.9, sourcilsIn:0.8, ouvre:0.3, largeB:0.5};
HV.DONJON.crapaud = [[0.45, {sourcils:-0.6}],
  /* (la langue la colle : surprise, elle est tirée vers l'avant, les bras partent en arrière) */
  [0.6, avec(AIE, {bas:[0, 30, 10], bang:[14, 0, 0], dos:[10, 0, 0], hoche:-6, mainD:[50, 200, -40], mainG:[-60, 206, -40], sourcils:0.7, plisse:0.2, ouvre:0.7})],
  [0.8, avec(AIE, {bas:[0, 24, 24], bang:[22, 0, 0], dos:[14, 0, 0], hoche:-10, piedG:[-30, 380, -40], pointeG:50, mainD:[54, 196, -50], mainG:[-64, 200, -50], sourcils:0.8, ouvre:0.8})],
  [1.0, avec(AIE, {leve:40, bas:[0, 20, 20], bang:[30, 0, 0], dos:[14, 0, 0], hoche:-12, piedG:[-24, 372, -40], piedD:[24, 372, -30], pointeG:60, pointeD:60, mainD:[54, 190, -56], mainG:[-64, 194, -56], sourcils:0.9, ouvre:0.9})],
  [HV.CRAPAUD.avalee, avec(AIE, {leve:50, bas:[0, 20, 20], bang:[32, 0, 0], dos:[14, 0, 0], hoche:-12, piedG:[-24, 372, -40], piedD:[24, 372, -30], pointeG:60, pointeD:60, mainD:[54, 190, -56], mainG:[-64, 194, -56], sourcils:0.9, ouvre:0.9})],
  /* (recrachée : en boule, elle vole) */
  [HV.CRAPAUD.recrachee, BOULE], [HV.CRAPAUD.pose - 0.08, avec(BOULE, {leve:6})],
  /* (elle retombe assise, couverte de bave) */
  [HV.CRAPAUD.pose, avec(BAVE, ASSISE)], [HV.CRAPAUD.ebroue - 0.08, avec(BAVE, ASSISE)],
  /* (elle s'ébroue comme un chien : la tête et les épaules de droite à gauche) */
  [2.9, avec(BAVE, avec(ASSISE, {pen:-12, dos:[18, 0, -14]}))], [2.98, avec(BAVE, avec(ASSISE, {pen:12, dos:[18, 0, 14]}))],
  [3.06, avec(BAVE, avec(ASSISE, {pen:-12, dos:[18, 0, -14]}))], [3.14, avec(BAVE, avec(ASSISE, {pen:12, dos:[18, 0, 14]}))], [3.24, avec(BAVE, ASSISE)],
  /* (elle se relève : un genou, puis debout) */
  [3.6, avec(BAVE, {bas:[0, 86, -12], bang:[16, 0, 0], dos:[16, 0, 0], piedD:[15, 394, -60], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1],
    mainD:[-18, 316, 50], relD:0, mdirD:[-1, 0.4, 0.3], poingD:0.2, mainG:[-62, 330, 50], relG:0, hoche:8, arcAxe:[0, 0.45, 0.9], arcDir:[-1, 0, 0.2]})],
  [HV.CRAPAUD.debout, avec(BAVE, {bas:[0, 34, -4], bang:[12, 0, 0], dos:[12, 0, 0], hoche:4})],
  /* (elle s'essuie la figure avec sa manche) */
  [4.35, avec(BAVE, {mainD:[-6, 112, 44], relD:1, coudeD:[1, 0.6, -0.1], mdirD:[-1, 0.2, 0.1], poingD:0.6, hoche:6})],
  [4.6, avec(BAVE, {mainD:[-26, 118, 40], relD:1, coudeD:[1, 0.6, -0.1], mdirD:[-1, 0.2, 0.1], poingD:0.6, hoche:6})],
  [5.05, {sourire:-0.5, bouchex:0.4, sourcils:-0.6, plisse:0.3}], [5.55, {}]];

/* LÉO L'ATTRAPE ET LA JETTE (phase 3) : sa grande main la saisit par la taille et la soulève ; elle se débat, les jambes dans le
   vide, pousse sur ses doigts ; il la secoue, prend son élan… et la jette au loin : elle vole, retombe sur le dos, et se relève
   comme après une chute.
   HV.LEO : quand la main la prend, la soulève, la lance, quand elle touche le sol — pour le film. */
HV.LEO = {prise:0.5, haut:1.2, elan:2.5, lance:2.75, sol:3.3};
var TENUE = {leve:60, bas:[0, 20, -4], bang:[6, 0, 0], dos:[6, 0, 0], hoche:-4, mainD:[30, 228, 34], relD:1, coudeD:[0.9, 0.3, -0.3], mdirD:[-0.6, 0, 1], poingD:0.2,
  mainG:[-34, 226, 34], relG:1, coudeG:[-0.9, 0.3, -0.3], mdirG:[0.6, 0, 1], arcAxe:[-0.6, 0.8, 0], arcDir:[-0.4, 0, 1], piedG:[-20, 400, 0], piedD:[20, 400, 4], pointeG:50, pointeD:50,
  genouG:[-0.1, 0, 1], genouD:[0.1, 0, 1], sourcils:0.3, sourcilsIn:0.7, ouvre:0.45, plisse:0.3, sourire:-0.5};
function gigote(i){ var s = i % 2 ? 1 : -1; return avec(TENUE, {piedG:[-20, 392 - 10 * s, 14 * s], piedD:[20, 392 + 10 * s, -14 * s], pointeG:40 + 15 * s, pointeD:40 - 15 * s, dos:[6, 0, 6 * s], sourcils:-0.2 * s, ouvre:0.3 + 0.2 * s}); }
HV.DONJON.leo = [[0.4, {sourcils:0.6, ouvre:0.3, hoche:-8, regY:-0.5}],
  [HV.LEO.prise, avec(AIE, {bas:[0, 26, 0], mainD:[36, 222, 30], relD:1, mainG:[-40, 220, 30], relG:1, sourcils:0.7, ouvre:0.6})],
  [HV.LEO.haut, avec(TENUE, {ouvre:0.7, sourcils:0.8})]]
  .concat([1.45, 1.65, 1.85, 2.05, 2.25].map(function(t, i){ return [t, gigote(i)]; }))
  .concat([[HV.LEO.elan, avec(TENUE, {leve:76, bang:[-10, 0, 0], sourcils:0.8, ouvre:0.6, plisse:0.6})],
    /* (lancée : elle vole en se tordant, les bras et les jambes en l'air) */
    [HV.LEO.lance, avec(AIE, {leve:84, bas:[0, 40, -20], bang:[-40, 0, 0], dos:[-10, 0, 0], hoche:-14, mainD:[60, 150, -30], relD:1, coudeD:[1, -0.3, -0.3], mainG:[-66, 150, -30], relG:1, coudeG:[-1, -0.3, -0.3],
      piedG:[-22, 360, 40], piedD:[22, 340, 30], pointeG:30, pointeD:30, genouG:[-0.2, -1, 0.5], genouD:[0.2, -1, 0.5], ouvre:0.8})],
    [HV.LEO.sol - 0.1, avec(AIE, {leve:30, bas:[0, 120, -50], bang:[-70, 0, 0], dos:[6, 0, 0], hoche:14, couche:0.5, piedG:[-24, 340, 18], piedD:[26, 330, -2], pointeG:-10, pointeD:-10,
      genouG:[-0.3, -1, 0.2], genouD:[0.3, -1, 0.2], mainG:[-90, 390, -100], relG:0, coudeG:[-1, -0.4, 0], mainD:[94, 390, -96], relD:0, coudeD:[1, -0.4, 0], arcAxe:[0, 0.2, 1], arcDir:[-1, 0, 0]})],
    [HV.LEO.sol, avec(KO, ALLONGEE)], [HV.LEO.sol + 1.0, avec(KO, avec(ALLONGEE, {tete:12}))], [HV.LEO.sol + 1.5, avec(KO, avec(ALLONGEE, {tete:-4, ouvre:0.3}))]])
  .concat(decale(RELEVE, HV.LEO.sol + 2.0));

/* L'AMULETTE (la relève dorée) : elle est à terre ; l'amulette sur sa poitrine s'allume, une lumière dorée la soulève d'un seul
   mouvement, les bras qui s'ouvrent ; elle est debout, étonnée ; l'amulette se brise (le film) ; elle se remet en garde, décidée.
   C'est un geste qui part d'ELLE ALLONGÉE (HV.ALLONGEE) : le film la pose à terre avant. HV.AMULETTE : quand l'amulette s'allume,
   quand elle se brise. */
HV.AMULETTE = {lueur:0.3, debout:1.5, brise:1.9};
HV.DONJON.amulette = [[0.01, avec(KO, ALLONGEE)], [0.3, avec(KO, ALLONGEE)], [0.7, avec(ALLONGEE, {hoche:-6, sourcils:0.5, ouvre:0.2, plisse:-0.2, sourire:0})],
  /* (la lumière la soulève : le dos se redresse, elle passe à genoux, les bras s'ouvrent) */
  [1.0, {leve:14, bas:[0, 90, -20], bang:[-10, 0, 0], dos:[-6, 0, 0], hoche:-12, piedG:[-24, 392, 20], piedD:[24, 392, 0], pointeG:20, pointeD:20, genouG:[-0.4, -0.4, 1], genouD:[0.4, -0.4, 1],
    mainD:[74, 220, 30], relD:1, coudeD:[1, 0.2, -0.3], poingD:0.1, mainG:[-74, 222, 30], relG:1, coudeG:[-1, 0.2, -0.3], arcAxe:[-0.4, 1, 0.1], arcDir:[-0.3, 0, 1],
    sourcils:0.9, ouvre:0.6, plisse:-0.3, sourire:0.3}],
  [HV.AMULETTE.debout, {leve:6, bas:[0, 6, 0], hoche:-14, mainD:[80, 190, 20], relD:1, coudeD:[1, 0.2, -0.3], poingD:0.1, mainG:[-80, 192, 20], relG:1, coudeG:[-1, 0.2, -0.3],
    arcAxe:[-0.4, 1, 0.1], arcDir:[-0.3, 0, 1], sourcils:1, ouvre:0.5, plisse:-0.4, sourire:0.6}],
  [HV.AMULETTE.brise + 0.1, {bas:[0, 14, 0], hoche:10, regY:0.8, mainD:[20, 190, 40], relD:1, coudeD:[0.8, 0.5, -0.3], mdirD:[-0.6, -0.2, 0.6], poingD:0.2, sourcils:0.6, ouvre:0.3, sourire:0}],
  [2.6, {bas:[0, 14, 0], hoche:8, regY:0.6, mainD:[20, 192, 40], relD:1, coudeD:[0.8, 0.5, -0.3], mdirD:[-0.6, -0.2, 0.6], poingD:0.4, sourcilsIn:0.6, sourcils:0.2, sourire:-0.2}],
  [3.1, {sourcils:-0.8, plisse:0.3, sourire:0.3, regX:0.4}], [3.6, {}]];

/* (le donjon comme une position : pour les pages d'essai, gestes.html#donjon:tir) */
HV.POSITIONS.donjon = {titre:'En garde', base:'dGarde', attente:[99, 99], gestes:HV.DONJON};
HV.NOMS_DONJON = {course:'Elle arrive en courant', regard:'En garde, elle regarde autour', tir:'Elle tire', coup:'Elle prend un coup', chute:'Elle tombe… et se relève', joie:'Victoire !',
  choisi:'C\'est son tour', dague:'Coup de dague', dagueSaut:'Elle saute avec sa dague', froid:'Le givre', rats:'Les rats !', poing:'Un grand coup de poing', toile:'Prise dans la toile', crapaud:'Avalée… et recrachée',
  leo:'Léo l\'attrape et la jette', amulette:'L\'amulette la relève'};
})(window);


