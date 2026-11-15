/* tissu.js — une cape qui vole pour de vrai : une toile de points reliés par des fils (la « simulation de tissu »).
   La pesanteur, l'air qui freine, un peu de vent ; les points du haut suivent la main qui l'arrache, puis on lâche.
   Calculé pas à pas depuis l'instant t0, et gardé en mémoire : une image ne dépend que de son temps (on peut filmer dans l'ordre
   ou revenir en arrière). Les cases dont on voit l'envers prennent la couleur de la doublure. */
(function(){
'use strict';
var U = window.CU;
var DT = 1 / 240;

window.Tissu = function(o){
  /* o : {nx, ny, haut:[[x, y], [x, y]] (les deux coins du haut), bas:[[x, y], [x, y]], t0, tenir:function(t) -> [x, y] | null
          (où la main tient le milieu du haut ; null = lâché), vent:function(t) -> [vx, vy], g (pesanteur), sol (y du sol)} */
  var nx = o.nx || 11, ny = o.ny || 13, P = [], Q = [], L = [], cache = [];
  for(var j = 0; j < ny; j++) for(var i = 0; i < nx; i++){
    var u = i / (nx - 1), v = j / (ny - 1);
    var hx = U.lerp(o.haut[0][0], o.haut[1][0], u), hy = U.lerp(o.haut[0][1], o.haut[1][1], u);
    var bx = U.lerp(o.bas[0][0], o.bas[1][0], u), by = U.lerp(o.bas[0][1], o.bas[1][1], u);
    var x = U.lerp(hx, bx, v) + Math.sin(u * Math.PI * 5 + v * 2) * 10 * v, y = U.lerp(hy, by, v) + Math.sin(u * Math.PI * 4) * 6 * v;
    P.push([x, y]); Q.push([x, y]);
  }
  function id(i, j){ return j * nx + i; }
  function lien(a, b, k){ L.push([a, b, Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]), k]); }
  for(var j2 = 0; j2 < ny; j2++) for(var i2 = 0; i2 < nx; i2++){
    if(i2 < nx - 1) lien(id(i2, j2), id(i2 + 1, j2), 1);
    if(j2 < ny - 1) lien(id(i2, j2), id(i2, j2 + 1), 1);
    if(i2 < nx - 1 && j2 < ny - 1){ lien(id(i2, j2), id(i2 + 1, j2 + 1), .6); lien(id(i2 + 1, j2), id(i2, j2 + 1), .6); }
    if(i2 < nx - 2) lien(id(i2, j2), id(i2 + 2, j2), .25);
    if(j2 < ny - 2) lien(id(i2, j2), id(i2, j2 + 2), .25);
  }
  var repos = P.map(function(p){ return [p[0], p[1]]; });
  var g = o.g == null ? 1400 : o.g, sol = o.sol == null ? 0 : o.sol, tenus = o.tenus || [Math.floor(nx / 2) - 1, Math.floor(nx / 2), Math.floor(nx / 2) + 1];
  var decal = tenus.map(function(i){ return [P[i][0] - P[Math.floor(nx / 2)][0], P[i][1] - P[Math.floor(nx / 2)][1]]; });
  function pas(t){
    var vent = o.vent ? o.vent(t) : [0, 0];
    for(var k = 0; k < P.length; k++){
      var p = P[k], q = Q[k], vx = (p[0] - q[0]) * .992, vy = (p[1] - q[1]) * .992;
      q[0] = p[0]; q[1] = p[1];
      /* le vent est plus fort sur les bords et le bas (le tissu claque) */
      var jj = Math.floor(k / nx), ii = k % nx, bord = .5 + .5 * (jj / (ny - 1)) + .25 * Math.abs(ii / (nx - 1) - .5);
      var tur = U.bruit(t * 3 + ii * .3, jj * 1.7) * 220 * bord;
      p[0] += vx + (vent[0] * bord + tur) * DT * DT;
      p[1] += vy + (g + vent[1] * bord + U.bruit(t * 2.6 + jj * .4, ii * 2.3) * 160 * bord) * DT * DT;
      if(p[1] > sol){ p[1] = sol; q[0] = U.lerp(q[0], p[0], .5); }
    }
    var main = o.tenir ? o.tenir(t) : null;
    for(var it = 0; it < 5; it++){
      for(var l = 0; l < L.length; l++){
        var c = L[l], a = P[c[0]], b = P[c[1]], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || .001;
        var e = (d - c[2]) / d * .5 * c[3];
        /* (un fil se laisse comprimer, il ne se laisse presque pas étirer) */
        if(d < c[2]) e *= .3;
        a[0] += dx * e; a[1] += dy * e; b[0] -= dx * e; b[1] -= dy * e;
      }
      if(main) tenus.forEach(function(i, k){ P[i][0] = main[0] + decal[k][0]; P[i][1] = main[1] + decal[k][1]; });
    }
  }
  this.etat = function(t){
    var n = Math.max(0, Math.round((t - o.t0) / DT));
    if(!cache.length) cache.push(P.map(function(p){ return [p[0], p[1]]; }));
    while(cache.length <= n){
      pas(o.t0 + cache.length * DT);
      if(cache.length % 2 === 0 || cache.length === n) cache.push(P.map(function(p){ return [p[0], p[1]]; })); else cache.push(null);
    }
    var e = cache[n]; if(!e){ e = cache[n - 1] || cache[n + 1] || cache[n - 2]; }
    return e;
  };
  /* le dessin : chaque case, claire ou sombre selon qu'elle est tendue ou froissée ; l'envers en doublure */
  this.dessin = function(t, coul){
    var E = this.etat(t), s = '', C1 = coul || {dessus:[34, 30, 50], dessous:[78, 28, 44]};
    for(var j = 0; j < ny - 1; j++) for(var i = 0; i < nx - 1; i++){
      var a = E[id(i, j)], b = E[id(i + 1, j)], c = E[id(i + 1, j + 1)], d = E[id(i, j + 1)];
      var aire = ((b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]) + (c[0] - b[0]) * (d[1] - b[1]) - (c[1] - b[1]) * (d[0] - b[0])) / 2;
      var ra = repos[id(i, j)], rb = repos[id(i + 1, j)], rd = repos[id(i, j + 1)];
      var aire0 = Math.abs((rb[0] - ra[0]) * (rd[1] - ra[1]) - (rb[1] - ra[1]) * (rd[0] - ra[0]));
      var envers = aire < 0, k = U.clamp(Math.abs(aire) / (aire0 || 1), 0, 1.2);
      /* les plis : un bord qui penche prend ou perd la lumière (elle vient d'en haut à gauche) */
      var vx = d[0] - a[0], vy = d[1] - a[1], hx = b[0] - a[0], hy = b[1] - a[1], lv = Math.hypot(vx, vy) || 1, lh = Math.hypot(hx, hy) || 1;
      var pente = (vx / lv) * .9 + (hy / lh) * .7;
      var lum = .5 + .42 * k - pente * .55 + U.bruit(i * .7 + j * 1.3, 3) * .06;
      lum = U.clamp(lum, .22, 1.35);
      var base = envers ? C1.dessous : C1.dessus;
      var col = 'rgb(' + base.map(function(v){ return Math.round(U.clamp(v * lum * 1.15, 0, 255)); }).join(',') + ')';
      var pts = [a, b, c, d].map(function(p){ return U.r(p[0]) + ',' + U.r(p[1]); }).join(' ');
      s += '<polygon points="' + pts + '" fill="' + col + '" stroke="' + col + '" stroke-width="1.2" stroke-linejoin="round"/>';
    }
    /* les plis : là où le tissu se ramasse, un creux sombre le long de la colonne */
    for(var i5 = 1; i5 < nx - 1; i5++){
      var pts2 = [], fort = 0;
      for(var j5 = 0; j5 < ny; j5++){
        var g1 = E[id(i5 - 1, j5)], g2 = E[id(i5 + 1, j5)], r1 = repos[id(i5 - 1, j5)], r2 = repos[id(i5 + 1, j5)];
        var serre = 1 - Math.hypot(g2[0] - g1[0], g2[1] - g1[1]) / (Math.hypot(r2[0] - r1[0], r2[1] - r1[1]) || 1);
        fort = Math.max(fort, serre); pts2.push(E[id(i5, j5)]);
      }
      if(fort > .12) s += '<polyline points="' + pts2.map(function(p){ return U.r(p[0]) + ',' + U.r(p[1]); }).join(' ') + '" fill="none" stroke="#0a0610" stroke-width="' + U.r(2 + fort * 7) + '" opacity="' + U.r(U.clamp(fort * 1.6, 0, .7)) + '" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    /* le contour */
    var bord = [];
    for(var i3 = 0; i3 < nx; i3++) bord.push(E[id(i3, 0)]);
    for(var j3 = 1; j3 < ny; j3++) bord.push(E[id(nx - 1, j3)]);
    for(var i4 = nx - 2; i4 >= 0; i4--) bord.push(E[id(i4, ny - 1)]);
    for(var j4 = ny - 2; j4 > 0; j4--) bord.push(E[id(0, j4)]);
    s += '<polygon points="' + bord.map(function(p){ return U.r(p[0]) + ',' + U.r(p[1]); }).join(' ') + '" fill="none" stroke="#120a10" stroke-width="2.6" stroke-linejoin="round"/>';
    return s;
  };
};
})();
