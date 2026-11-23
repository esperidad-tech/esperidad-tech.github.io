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
