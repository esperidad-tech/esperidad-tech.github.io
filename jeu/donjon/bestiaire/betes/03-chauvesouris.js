/* La chauve-souris de la brume : aveugle, ailes déployées, la brume qui traîne derrière elle */
(function(){
var B = window.BT, P = B.P, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE, N = 0;
function f1(v){ return (+v).toFixed(1); }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function lisse(pts, ferme){
  var n = pts.length, s = 'M' + pt(pts[0]), m = ferme ? n : n - 1;
  function q(i){ return ferme ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; }
  for(var i = 0; i < m; i++){
    var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2);
    s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c);
  }
  return s + (ferme ? ' Z' : '');
}
function tube(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2;
    G.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); D.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisse(G.concat([bout(n - 1, n - 2, ws[n - 1])], D.slice().reverse(), [bout(0, 1, ws[0])]), true), g: G, dr: D};
}
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function frange(pts, haut, couleur, seed, recul, trait){
  var R = B.rng(seed), s = 'M' + pt(pts[0]), n = pts.length, nr = [];
  recul = recul == null ? .5 : recul;
  for(var k = 0; k < n - 1; k++){
    var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, h = haut * (.6 + R() * .7);
    nr.push([dy / l, -dx / l]);
    s += ' Q ' + pt([a[0] + dx * .7 + dy / l * h * .4, a[1] + dy * .7 - dx / l * h * .4]) + ' ' + pt([b[0] + dx * recul + dy / l * h, b[1] + dy * recul - dx / l * h]) + ' L ' + pt(b);
  }
  nr.push(nr[n - 2]);
  for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 16, q[1] - nr[k2][1] * 16]); }
  return P(s + ' Z', couleur, ' stroke-width="' + (trait || 2.4) + '"');
}
function poils(cx, cy, rx, ry, n, seed, cH, cB, op, ang){
  var R = B.rng(seed), s = '', ca = Math.cos(ang || 0), sa = Math.sin(ang || 0);
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    var l = 6 + R() * 7, c = y < cy - ry * .1 ? cH : cB, dx = l * .3, dy = l;
    s += L('M' + f1(x) + ' ' + f1(y) + ' q ' + f1((dx * ca - dy * sa) * .5 + 2) + ' ' + f1((dx * sa + dy * ca) * .5) + ' ' + f1(dx * ca - dy * sa) + ' ' + f1(dx * sa + dy * ca), c, 1.4, ' opacity="' + f1((op || .4) + R() * .2) + '"');
  }
  return s;
}

function dessin(){
  var d = new B.Dessin(), u = 'chauvesouris' + (++N) + '_', nid = 0, s = '';
  function id(){ return u + (++nid); }
  function clip(chemin){ var i = id(); d.defs.push('<clipPath id="' + i + '"><path d="' + chemin + '"/></clipPath>'); return ' clip-path="url(#' + i + ')"'; }
  function rad(stops, cx, cy, r){ var i = id(); d.defs.push('<radialGradient id="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</radialGradient>'); return 'url(#' + i + ')'; }
  function lin(stops, x1, y1, x2, y2){ var i = id(); d.defs.push('<linearGradient id="' + i + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</linearGradient>'); return 'url(#' + i + ')'; }
  var flou1 = d.flou(1.2), flou3 = d.flou(3), flou6 = d.flou(6), flou12 = d.flou(12);
  var fourrure = '#6c5a7c', ventre = '#9a88a8', os = '#a493b0', peau = '#3d2a4c', oreilleIn = '#c493a8';

  /* un filet de brume : une longue traînée effilée, floue */
  function brume(pts, ws, c, op, fl){ return F(tube(pts, ws).d, c, ' opacity="' + op + '" filter="' + (fl || flou3) + '"'); }

  /* ---- une aile : membrane, fibres, veines, os des doigts, griffe du pouce ---- */
  function aile(o){
    var S = o.S, E = o.E, W = o.W, t = o.tips, pi = o.pied, fl = o.flanc, s = '', R = B.rng(o.seed);
    var ventreAile = function(a, b, k){ var m = lerp(a, b, .5); return lerp(m, W, k); };
    /* les articulations des doigts : un peu pliées */
    var jt = t.map(function(p, i){ var m = lerp(W, p, .48), dx = p[0] - W[0], dy = p[1] - W[1], l = Math.hypot(dx, dy); return [m[0] - dy / l * o.pli[i], m[1] + dx / l * o.pli[i]]; });
    var memb = 'M' + pt(S) + ' C ' + pt(lerp(S, E, .4).map(function(v, i){ return v - (i ? 16 : 0); })) + ' ' + pt([E[0] - 4, E[1] - 20]) + ' ' + pt(lerp(E, W, .5).map(function(v, i){ return v - (i ? 12 : 0); })) +
      ' S ' + pt([W[0] + 2, W[1] - 10]) + ' ' + pt(W) +
      ' L ' + pt(t[0]) + ' Q ' + pt(ventreAile(t[0], t[1], .12)) + ' ' + pt(t[1]) +
      ' Q ' + pt(ventreAile(t[1], t[2], .3)) + ' ' + pt(t[2]) + ' Q ' + pt(ventreAile(t[2], t[3], .3)) + ' ' + pt(t[3]) + ' Q ' + pt(ventreAile(t[3], pi, .28)) + ' ' + pt(pi) + ' L ' + pt(fl) + ' Z';
    /* un trou déchiré dans la membrane */
    var tr = o.trou, trou = '';
    if(tr){ for(var k = 0; k < 9; k++){ var a = k / 9 * Math.PI * 2, r = tr[2] * (.6 + R() * .6); trou += (k ? ' L ' : ' M') + f1(tr[0] + Math.cos(a) * r * 1.5) + ' ' + f1(tr[1] + Math.sin(a) * r); } trou += ' Z'; }
    s += F(memb + trou, o.ombre ? '#0a0612' : '#140a1c', ' opacity=".35" filter="' + flou6 + '" transform="translate(' + (o.ombre || 0) + ' 10)"');
    s += P(memb + trou, lin([[0, B.clair(o.mb, .12)], [.5, o.mb], [1, B.sombre(o.mb, .35)]], o.sens > 0 ? 1 : 0, 0, o.sens > 0 ? 0 : 1, 1), ' fill-rule="evenodd" fill-opacity=".9"');
    var cm = clip(memb + trou);
    s += '<g' + cm + ' style="clip-rule:evenodd">';
    /* la lune passe à travers : les panneaux s'éclairent au milieu */
    var pans = [[W, t[1], t[2]], [W, t[2], t[3]], [W, t[3], pi], [S, W, pi]];
    pans.forEach(function(p, i){
      var c = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
      s += '<ellipse cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" rx="' + (36 - i * 3) + '" ry="' + (26 - i * 2) + '" fill="' + o.lueur + '" opacity="' + (o.clarte * (1 - i * .15)) + '" filter="' + flou12 + '"/>';
    });
    /* fibres élastiques entre les doigts */
    var bras = [lerp(S, E, .5), E, lerp(E, W, .5), W];
    [[0, 1], [1, 2], [2, 3]].forEach(function(pr){
      var a = t[pr[0]], b = t[pr[1]];
      for(var k = 1; k <= 5; k++){ var q = k / 6, p1 = lerp(W, a, q * .95), p2 = lerp(W, b, q * .95), m = lerp(lerp(p1, p2, .5), W, .1 + q * .05); s += L('M' + pt(p1) + ' Q ' + pt(m) + ' ' + pt(p2), o.fibre, .9, ' opacity=".45"'); }
    });
    for(var k3 = 1; k3 <= 6; k3++){ var q3 = k3 / 7, p1 = lerp(W, t[3], q3), p2 = lerp(lerp(S, W, .1), pi, q3); s += L('M' + pt(p1) + ' Q ' + pt(lerp(lerp(p1, p2, .5), S, .12)) + ' ' + pt(p2), o.fibre, .9, ' opacity=".4"'); }
    /* les veines qui partent du bras */
    for(var v = 0; v < 6; v++){
      var b0 = lerp(S, W, .2 + v * .13), dir = [pi[0] - b0[0], pi[1] - b0[1]], l = Math.hypot(dir[0], dir[1]), lg = 30 + R() * 30;
      var p1 = [b0[0] + dir[0] / l * lg * .5 + (R() - .5) * 14, b0[1] + dir[1] / l * lg * .5], p2 = [b0[0] + dir[0] / l * lg + (R() - .5) * 20, b0[1] + dir[1] / l * lg];
      s += L('M' + pt(b0) + ' Q ' + pt(p1) + ' ' + pt(p2) + ' M' + pt(p1) + ' l ' + f1((R() - .5) * 24) + ' ' + f1(10 + R() * 10), o.veine, 1.2, ' opacity=".55"');
    }
    /* ombre le long du bras (la membrane se plie) */
    s += L('M' + pt(S) + ' L ' + pt(E) + ' L ' + pt(W), '#0a0612', 10, ' opacity=".35" filter="' + flou3 + '" transform="translate(0 8)"');
    s += '</g>';
    /* bord de fuite : un liseré plus clair (la peau fine laisse passer la lune) */
    s += L('M' + pt(t[1]) + ' Q ' + pt(ventreAile(t[1], t[2], .3)) + ' ' + pt(t[2]) + ' Q ' + pt(ventreAile(t[2], t[3], .3)) + ' ' + pt(t[3]) + ' Q ' + pt(ventreAile(t[3], pi, .28)) + ' ' + pt(pi), o.bord, 1.6, ' opacity=".6" transform="translate(' + (o.sens > 0 ? 1 : -1) + ' -2)"');
    if(tr) s += L(trou, o.bord, 1.2, ' opacity=".7"');
    /* les os : bras, avant-bras, doigts articulés */
    var osC = d.g(o.os);
    s += P(tube([S, lerp(S, E, .5), E], [20, 14, 13]).d, d.g(o.chair)) + poils((S[0] + E[0]) / 2, (S[1] + E[1]) / 2, 12, 8, 10, o.seed + 1, '#d8c8e0', '#2a1e30', .35, -.8 * o.sens);
    s += P(tube([E, lerp(E, W, .5).map(function(v, i){ return v + (i ? -4 : 0); }), W], [12, 9, 10]).d, osC);
    t.forEach(function(p, i){
      var j = jt[i], w0 = [7, 6.5, 6, 5.5][i];
      s += P(tube([W, lerp(W, j, .5), j], [w0, w0 - 1.6, w0 - .8]).d, osC, ' stroke-width="2.4"');
      s += P(tube([j, lerp(j, p, .5), p], [w0 - 1.4, w0 - 2.6, 2]).d, osC, ' stroke-width="2.4"');
      s += '<ellipse cx="' + f1(j[0]) + '" cy="' + f1(j[1]) + '" rx="' + f1(w0 * .62) + '" ry="' + f1(w0 * .55) + '" fill="' + d.g(B.clair(o.os, .1)) + '" stroke="' + O + '" stroke-width="2"/>';
      s += L('M' + pt(lerp(W, j, .15)) + ' L ' + pt(lerp(W, j, .85)) + ' M' + pt(lerp(j, p, .1)) + ' L ' + pt(lerp(j, p, .7)), o.reflet, 1.2, ' opacity=".7" transform="translate(' + (o.sens > 0 ? 1.4 : -1) + ' -1.6)"');
    });
    /* le poignet, le pouce et sa griffe crochue */
    var po = o.pouce, pc = [po[0] - 8 * o.sens, po[1] - 4];
    s += P(tube([W, lerp(W, po, .55), po], [9, 7, 6]).d, osC);
    s += P('M' + pt([po[0] - 3, po[1] + 1]) + ' C ' + pt([po[0] - 4 * o.sens, po[1] - 10]) + ' ' + pt([pc[0] - 4 * o.sens, pc[1] - 6]) + ' ' + pt([pc[0] - 6 * o.sens, pc[1] + 4]) + ' C ' + pt([pc[0], pc[1] - 1]) + ' ' + pt([po[0], po[1] - 2]) + ' ' + pt([po[0] + 3, po[1] + 2]) + ' Z', '#231a29', ' stroke-width="2"');
    s += '<ellipse cx="' + W[0] + '" cy="' + W[1] + '" rx="8" ry="7" fill="' + d.g(B.clair(o.os, .1)) + '" stroke="' + O + '" stroke-width="2.4"/>';
    s += L('M' + pt(lerp(E, W, .1)) + ' Q ' + pt(lerp(E, W, .5).map(function(v, i){ return v + (i ? -8 : 2); })) + ' ' + pt(lerp(E, W, .9)), o.reflet, 1.6, ' opacity=".75"');
    return s;
  }

  /* une mèche de fourrure (sans contour) : une flamme de poil courbée, avec un reflet */
  function meche(x, y, ang, lg, lar, coul, courbe, liser, op){
    var ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, k = courbe || 0;
    var tip = [x + ca * lg + nx * k, y + sa * lg + ny * k], m = [x + ca * lg * .5 + nx * k * .6, y + sa * lg * .5 + ny * k * .6];
    var ch = 'M' + pt([x + nx * lar / 2, y + ny * lar / 2]) + ' Q ' + pt([m[0] + nx * lar * .45, m[1] + ny * lar * .45]) + ' ' + pt(tip) + ' Q ' + pt([m[0] - nx * lar * .3, m[1] - ny * lar * .3]) + ' ' + pt([x - nx * lar / 2, y - ny * lar / 2]) + ' Z';
    return F(ch, coul, ' opacity="' + (op || 1) + '"') + (liser ? L('M' + pt([x + nx * lar * .15, y + ny * lar * .15]) + ' Q ' + pt([m[0] + nx * lar * .2, m[1] + ny * lar * .2]) + ' ' + pt([tip[0] - ca * lg * .15, tip[1] - sa * lg * .15]), liser, 1, ' opacity=".5"') : '');
  }
  /* des mèches tirées dans une ellipse, toutes couchées dans le même sens */
  function meches(cx, cy, rx, ry, n, seed, cs, ang, lg){
    var R = B.rng(seed), s = '';
    for(var k = 0; k < n; k++){
      var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, haut = y < cy;
      s += meche(x, y, ang + (R() - .5) * .5, (lg || 14) * (.7 + R() * .6), 5 + R() * 4, haut ? cs[0] : cs[1], (R() - .5) * 6, haut ? cs[2] : null, .55 + R() * .3);
    }
    return s;
  }

  /* un bord de fourrure en mèches courbes et irrégulières ; v pousse les pointes (vers l'arrière, vers le bas) */
  function frange2(pts, haut, couleur, seed, v, trait){
    var R = B.rng(seed), n = pts.length, s = 'M' + pt(pts[0]), nr = [];
    for(var k = 0; k < n - 1; k++){
      var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l, h = haut * (.45 + R() * .9), w = .6 + R() * .8;
      var tip = [(a[0] + b[0]) / 2 + nx * h + v[0] * w, (a[1] + b[1]) / 2 + ny * h + v[1] * w];
      s += ' Q ' + pt([a[0] + nx * h * .55 + v[0] * .2, a[1] + ny * h * .55 + v[1] * .2]) + ' ' + pt(tip) + ' Q ' + pt([b[0] + nx * h * .25 + v[0] * .3, b[1] + ny * h * .25 + v[1] * .3]) + ' ' + pt(b);
      nr.push([nx, ny]);
    }
    nr.push(nr[n - 2]);
    for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 16, q[1] - nr[k2][1] * 16]); }
    return P(s + ' Z', couleur, ' stroke-width="' + (trait || 2.2) + '"');
  }
  /* des points le long d'une courbe lisse (pour poser une frange) */
  function lelong(pts, n){
    var out = [], m = pts.length - 1;
    for(var k = 0; k <= n; k++){ var t = k / n * m, i = Math.min(m - 1, Math.floor(t)), f = t - i; out.push(lerp(pts[i], pts[i + 1], f)); }
    return out;
  }

  /* ---- l'ombre au sol : petite et pâle (elle vole) ---- */
  s += '<ellipse cx="272" cy="396" rx="96" ry="9" fill="#000" opacity=".3" filter="' + flou3 + '"/>';
  s += '<ellipse cx="272" cy="396" rx="54" ry="5" fill="#000" opacity=".25"/>';

  /* ---- la brume derrière : de longues traînées qui partent vers la droite ---- */
  var BR = '#9c94c8';
  s += brume([[300, 250], [360, 280], [440, 290], [528, 276]], [26, 22, 14, 3], BR, .2, flou6);
  s += brume([[150, 236], [230, 276], [330, 306], [430, 322], [516, 318]], [18, 24, 18, 10, 2], BR, .16, flou6);
  s += brume([[430, 214], [476, 232], [516, 230], [534, 212]], [12, 10, 5, 2], BR, .3);
  s += brume([[70, 196], [120, 222], [176, 244]], [6, 12, 4], BR, .24);
  s += L('M470 236 C 492 240 512 236 526 222 C 532 214 530 204 522 202 C 514 202 512 210 518 214', '#c8c0ea', 1.6, ' opacity=".3"');
  s += L('M410 300 C 440 312 476 312 500 300 C 510 294 512 284 504 280 C 496 278 492 286 498 290', '#c8c0ea', 1.6, ' opacity=".26"');

  /* ---- l'aile du fond (son aile gauche) : plus petite, plus sombre ---- */
  s += aile({S: [302, 186], E: [354, 150], W: [404, 92], pouce: [410, 74], tips: [[456, 48], [516, 96], [498, 180], [424, 228]], pli: [-3, -6, 5, 8], pied: [306, 262], flanc: [300, 222], sens: -1, seed: 5,
    trou: [470, 140, 4],
    mb: '#30213f', chair: B.sombre(fourrure, .35), os: B.sombre(os, .25), lueur: '#8a7ab8', clarte: .5, fibre: '#7a6a9a', veine: '#1a0f24', bord: '#a89ad0', reflet: LUNE, ombre: 0});

  /* ---- la queue et sa membrane, les pattes arrière griffues ---- */
  var uro = 'M250 250 Q 278 292 306 246 L 300 236 Q 276 264 256 238 Z';
  s += P(uro, d.g('#3a2a4a'), ' fill-opacity=".92"') + L('M277 248 L 279 280', B.sombre(os, .2), 2.6) + L('M262 256 Q 277 272 294 256 M266 264 Q 278 274 290 264', '#8a7ab0', .9, ' opacity=".5"');
  [[254, 240, 244, 270, -1], [300, 238, 310, 268, 1]].forEach(function(j){
    s += P(tube([[j[0], j[1]], [(j[0] + j[2]) / 2 + j[4] * 2, (j[1] + j[3]) / 2], [j[2], j[3]]], [13, 9, 8]).d, d.g(B.sombre(fourrure, .15)));
  });

  /* ---- le corps : bord hérissé, mèches couchées, ventre plus clair ---- */
  var corps = 'M238 166 C 234 196 238 232 256 250 C 270 262 290 260 300 246 C 314 226 316 190 308 166 C 296 146 250 146 238 166 Z';
  s += frange2(lelong([[308, 168], [314, 190], [314, 212], [308, 232], [300, 246]], 8), 9, d.g(fourrure), 11, [6, 5], 2);
  s += P(corps, d.g(fourrure));
  s += F('M256 196 C 254 222 262 244 276 252 C 290 246 298 222 292 196 C 284 184 264 184 256 196 Z', rad([[0, B.clair(ventre, .15)], [1, ventre, 0]], .5, .45, .55));
  s += meches(276, 214, 28, 36, 26, 13, [B.clair(fourrure, .2), B.sombre(fourrure, .25), '#efe4f6'], 1.45, 16);
  s += poils(274, 214, 30, 40, 50, 13, '#e4d8ec', '#2a1e30', .3, .1);
  s += L('M302 160 C 314 182 316 212 306 236', LUNE, 2.2, ' opacity=".55"');

  /* ---- l'aile de devant (son aile droite), qui s'ouvre vers les héros ---- */
  s += aile({S: [244, 182], E: [184, 152], W: [118, 82], pouce: [114, 62], tips: [[62, 32], [22, 102], [44, 198], [128, 240]], pli: [3, 7, -6, -8], pied: [248, 262], flanc: [244, 222], sens: 1, seed: 9,
    trou: [94, 170, 7],
    mb: '#3d2a50', chair: fourrure, os: os, lueur: '#b8a8e8', clarte: .6, fibre: '#9a8abc', veine: '#20122c', bord: '#c0b0f0', reflet: LUNE, ombre: -4});

  /* ---- les pieds griffus (devant l'ombre de l'aile) ---- */
  [[254, 240, 244, 270, -1], [300, 238, 310, 268, 1]].forEach(function(j){
    s += '<ellipse cx="' + j[2] + '" cy="' + (j[3] + 2) + '" rx="7" ry="4.5" fill="' + d.g('#5a4462') + '" stroke="' + O + '" stroke-width="2"/>';
    for(var k = 0; k < 4; k++){ var bx = j[2] - 6 + k * 4.2, by = j[3] + 4, an = (122 - k * 16) * Math.PI / 180, lg = 15 - Math.abs(k - 1.5) * 2, ux = Math.cos(an), uy = Math.sin(an), nx = -uy, ny = ux;
      var tp = [bx + ux * lg - 3, by + uy * lg], c1 = [bx + ux * lg * .55 - nx * 3, by + uy * lg * .55 - ny * 3], c2 = [bx + ux * lg * .5 + nx * .5, by + uy * lg * .5 + ny * .5];
      s += P('M' + pt([bx - 2.6, by]) + ' Q ' + pt(c1) + ' ' + pt(tp) + ' Q ' + pt(c2) + ' ' + pt([bx + 2.6, by]) + ' Z', d.g('#e2d8dc'), ' stroke-width="1.1"') + L('M' + pt([bx - .8, by + 1]) + ' Q ' + pt([c1[0] + nx * 1.6, c1[1] + ny * 1.6]) + ' ' + pt([tp[0] + 1.5, tp[1] - 1]), '#ffffff', .8, ' opacity=".6"'); }
  });

  /* ---- la crinière autour du cou : des mèches qui retombent sur la poitrine, sans trait dur ---- */
  var crinPts = [[222, 150], [238, 134], [266, 126], [296, 130], [316, 140], [324, 162], [316, 184], [300, 196], [280, 202], [258, 200], [240, 194], [226, 182], [220, 168]];
  var crin = lisse(crinPts, true), crinC = d.g(fourrure);
  s += frange2(lelong(crinPts.slice(4, 13), 13), 19, d.g(B.sombre(fourrure, .04)), 7, [7, 9], 2);
  s += F(crin, crinC);
  s += L(lisse(crinPts.slice(1, 6)), O, 3);
  s += F(lisse([[232, 176], [262, 190], [296, 186], [314, 170], [300, 196], [270, 204], [240, 194]], true), '#140a1c', ' opacity=".25" filter="' + flou3 + '"');
  s += meches(272, 162, 44, 22, 40, 21, [B.clair(fourrure, .22), B.sombre(fourrure, .3), '#f2e8f8'], 1.25, 18);
  s += poils(270, 164, 42, 20, 40, 22, '#eee4f4', '#2a1e30', .3, .5);
  s += L('M296 132 C 312 140 322 156 322 168', LUNE, 2.2, ' opacity=".6"');

  /* ---- l'oreille du fond : immense, déchirée ---- */
  var oF = 'M252 106 C 262 72 284 40 316 10 C 322 32 324 54 320 74 L 312 78 L 319 86 C 314 102 304 114 290 126 C 276 132 260 124 252 106 Z';
  s += P(oF, d.g(B.sombre(fourrure, .15)));
  s += F('M260 108 C 270 80 288 52 312 26 C 316 52 314 86 294 114 C 284 124 268 122 260 108 Z', d.halo('#e8b8cc', '#8a5a7a'));
  s += L('M266 106 C 274 88 288 66 306 42 M272 112 Q 284 106 298 102 M268 100 Q 282 94 296 88 M270 88 Q 284 80 302 74 M280 72 Q 290 64 306 58', '#6a3a5a', 1.2, ' opacity=".6"');
  s += L('M310 36 C 306 54 300 74 288 94 M300 58 C 294 60 288 64 284 70', '#a04870', 1, ' opacity=".5"');
  s += L('M318 14 C 324 42 322 70 314 94', LUNE, 2, ' opacity=".6"');

  /* ---- la grande oreille de devant : plis, tragus, veines, encoches ---- */
  var oD = 'M252 104 C 246 74 232 38 206 2 C 196 20 190 38 188 54 L 196 60 L 187 66 C 186 82 190 98 198 110 C 210 124 240 124 252 104 Z';
  s += P(oD, d.g(fourrure));
  s += F('M244 104 C 238 80 226 50 208 22 C 200 48 196 80 204 100 C 214 114 234 116 244 104 Z', d.halo('#f4c4d8', '#a0607e'));
  s += L('M206 36 Q 216 42 220 54 M202 52 Q 214 58 226 68 M202 68 Q 216 74 232 82 M204 84 Q 218 88 238 94', '#7a4060', 1.4, ' opacity=".6"');
  s += L('M206 44 Q 216 50 221 58 M203 60 Q 215 66 227 74', '#ffe0ee', 1, ' opacity=".5" transform="translate(1 -2)"');
  s += L('M212 102 C 208 84 208 62 206 42 M222 94 C 226 88 228 80 226 72 M206 68 C 212 68 218 70 222 74', '#a04870', 1, ' opacity=".55"');
  s += P('M228 112 C 220 102 220 90 226 82 C 234 92 236 104 232 114 Z', d.g('#b07a94'), ' stroke-width="2"') + L('M227 88 C 231 96 231 104 229 110', '#ffe0ee', 1, ' opacity=".5"');
  s += L('M208 4 C 228 32 244 66 250 98', LUNE, 2, ' opacity=".55"');

  /* ---- la tête de gargouille, tournée vers la gauche ---- */
  var tete = 'M272 124 C 272 100 252 86 230 88 C 206 90 190 102 184 118 C 176 124 170 136 172 148 C 174 158 182 164 192 166 L 244 170 C 262 164 272 146 272 124 Z';
  s += frange([[272, 112], [274, 130], [270, 148], [262, 162]], 8, d.g(fourrure), 31, .4, 2);
  s += P(tete, d.g(fourrure));
  s += meches(244, 124, 24, 18, 16, 25, [B.clair(fourrure, .2), B.sombre(fourrure, .28), '#efe4f6'], .5, 12);
  s += poils(240, 130, 28, 22, 28, 26, '#e4d8ec', '#2a1e30', .3, .4);
  s += L('M232 88 C 254 90 270 104 272 124', LUNE, 2.2, ' opacity=".55"');
  /* le museau court, plissé */
  s += F('M174 132 C 182 122 198 118 210 126 C 214 140 206 156 192 160 C 180 160 172 150 174 132 Z', d.g('#6a4e72'));
  s += L('M178 130 Q 184 136 182 146 M186 124 Q 194 132 192 144 M196 122 Q 204 128 204 140', '#22142c', 1.5, ' opacity=".6"') + L('M188 124 Q 196 132 194 142', '#e0d0ea', 1, ' opacity=".3"');
  s += L('M212 110 Q 220 104 230 106 M214 118 Q 222 112 232 114', '#22142c', 1.3, ' opacity=".45"');

  /* ---- la gueule ouverte en hurlement : babines retroussées, crocs, langue, bave ---- */
  var gueule = 'M182 158 C 194 152 222 156 242 166 C 244 188 232 208 212 212 C 194 212 182 194 182 158 Z';
  s += P(gueule, '#24081a');
  s += F('M196 196 C 204 206 222 206 232 196 C 222 192 206 192 196 196 Z', '#a8506a') + L('M204 200 Q 214 202 226 198', '#d07a94', 1, ' opacity=".6"');
  s += F('M200 176 C 208 172 220 174 226 180 C 220 186 206 186 200 176 Z', '#0a0208', ' opacity=".7"');
  s += F('M182 158 C 194 152 222 156 242 166 C 236 172 210 166 186 168 Z', '#8a405e') + L('M186 165 C 204 162 224 166 238 170', '#c06a88', 1.2, ' opacity=".7"');
  var croc = lin([[0, '#fffaf0'], [1, '#c8bca8']], 0, 0, 1, 1);
  s += P('M186 164 L 195 164 C 195 175 193 186 190 196 C 188 184 187 174 186 164 Z', croc, ' stroke-width="1.8"');
  s += P('M224 168 L 232 170 C 232 180 230 190 227 198 C 226 188 225 178 224 168 Z', croc, ' stroke-width="1.8"');
  s += P('M199 165 L 202 172 L 205 166 Z M206 166 L 209 173 L 212 167 Z M213 167 L 216 173 L 219 168 Z', '#f4eee0', ' stroke-width="1"');
  s += L('M188 166 C 189 174 189 182 189 190', '#ffffff', 1, ' opacity=".8"');
  /* la mâchoire du bas, ses crocs */
  s += P('M244 164 C 248 192 236 218 210 220 C 194 220 182 212 180 198 C 180 193 185 193 187 197 C 191 206 199 212 212 212 C 230 210 240 192 244 164 Z', d.g(fourrure), ' stroke-width="2.6"');
  s += P('M196 210 L 198 194 L 203 210 Z M222 208 L 225 194 L 228 206 Z', croc, ' stroke-width="1.6"');
  s += P('M206 212 C 206 220 204 228 206 236 C 209 238 212 236 211 232 C 210 226 210 218 211 212 Z', '#d8eaff', ' stroke-width="1.2" opacity=".75"') + C(208.5, 242, 1.8, '#d8eaff', ' opacity=".7"');

  /* ---- le nez retroussé et sa feuille en fer de lance (dentelée) ---- */
  var feuille = 'M176 132 C 170 122 168 108 174 96 L 178 99 L 181 88 L 185 94 L 188 84 L 191 94 L 195 90 C 200 104 198 120 192 132 Z';
  s += P(feuille, d.g('#5e4466'), ' stroke-width="2.2"');
  s += F('M180 128 C 176 118 176 106 182 96 C 190 106 192 118 188 128 Z', d.halo('#9a7aa0', '#5e4466'), ' opacity=".5"');
  s += L('M184 92 L 184 130', '#3a1e3a', 1.3, ' opacity=".7"') + L('M175 120 Q 184 115 194 120 M175 110 Q 184 105 194 110 M178 101 Q 184 98 190 101', '#3a1e3a', 1, ' opacity=".55"');
  s += L('M191 94 C 197 106 197 118 193 128', LUNE, 1.1, ' opacity=".45"');
  s += P('M172 133 C 178 128 191 128 197 133 C 195 142 189 147 184.5 149 C 180 147 174 142 172 133 Z', d.g('#4a3250'), ' stroke-width="2.2"');
  s += F('M175 135.5 C 178 135 182 137 182.5 140.5 C 180 140 177 138.5 175 135.5 Z M194 135.5 C 191 135 187 137 186.5 140.5 C 189 140 192 138.5 194 135.5 Z', '#0e040a');
  s += L('M184.5 141 L 184.5 148', '#1a0a14', 1.1, ' opacity=".6"') + L('M188 130 C 193 131 195 133 195 136', LUNE, 1, ' opacity=".4"');
  s += L('M196 134 Q 202 132 204 124 M196 140 Q 206 140 212 134 M172 136 Q 168 142 170 150', '#1a0e20', 1.4, ' opacity=".55"');

  /* ---- les yeux laiteux, enfoncés sous des sourcils froncés, sans pupille ---- */
  var oeil = rad([[0, '#f4f8fa'], [.5, '#cfdae2'], [1, '#7a8a9a']], .4, .4, .7);
  s += '<circle cx="208" cy="124" r="22" fill="' + d.halo('#ffffff', '#bfe8ff') + '" opacity=".42"/>';
  s += '<ellipse cx="208" cy="125" rx="11" ry="8.5" fill="#140a1c" opacity=".8"/>';
  s += '<ellipse cx="208" cy="126" rx="7" ry="5.6" fill="' + oeil + '" stroke="' + O + '" stroke-width="2"/>' + L('M203 127 Q 208 124 213 127 M204 129.5 Q 208 127.5 212 129.5', '#a8b8c6', .9, ' opacity=".7"');
  s += P('M196 126 C 200 116 214 110 224 116 C 216 117 206 120 198 128 Z', d.g(B.sombre(fourrure, .25)), ' stroke-width="1.8"');
  s += '<circle cx="244" cy="114" r="14" fill="' + d.halo('#ffffff', '#bfe8ff') + '" opacity=".28"/>';
  s += '<ellipse cx="244" cy="115" rx="7.5" ry="5.8" fill="#140a1c" opacity=".75"/><ellipse cx="244" cy="116" rx="4.5" ry="3.9" fill="' + oeil + '" stroke="' + O + '" stroke-width="1.8"/>';
  s += P('M234 116 C 238 108 248 104 256 110 C 248 110 242 112 236 118 Z', d.g(B.sombre(fourrure, .25)), ' stroke-width="1.6"');

  /* ---- le cri qui sort de la gueule : des ondes (elle « voit » avec ses oreilles) ---- */
  [[22, .6], [38, .45], [54, .32], [70, .2]].forEach(function(o){
    var c = [184, 186], a0 = 2.5, a1 = 3.5, p0 = [c[0] + Math.cos(a0) * o[0], c[1] + Math.sin(a0) * o[0]], p1 = [c[0] + Math.cos(a1) * o[0], c[1] + Math.sin(a1) * o[0]];
    var arc = 'M' + pt(p0) + ' A ' + o[0] + ' ' + o[0] + ' 0 0 1 ' + pt(p1);
    s += L(arc, '#14202e', 5, ' opacity="' + (o[1] * .6) + '"') + L(arc, '#8fe8ff', 6, ' opacity="' + (o[1] * .55) + '" filter="' + flou3 + '"') + L(arc, '#e0faff', 2, ' opacity="' + o[1] + '"');
  });

  /* ---- la brume devant : quelques volutes qui passent par-dessus ---- */
  s += brume([[34, 222], [72, 236], [124, 240]], [4, 10, 3], '#c8c0ea', .3);
  s += brume([[360, 272], [410, 266], [460, 274], [504, 294]], [4, 12, 8, 2], '#c8c0ea', .3);
  s += L('M92 242 C 108 234 126 238 136 248 C 124 244 114 246 108 254', '#d8d0f4', 1.4, ' opacity=".32"');

  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.chauvesouris = {nom:'Chauve-souris de la brume', rang:'monstre', pv:25, lieu:'Les canaux de la ville d\'avant · vole au fond',
  livre:'« Elles volent sans rien voir, à l\'oreille. »',
  combo:['+🥄 S\'ouvre : le bruit', ' Autre chemin : la colle', '!✨ La renforce : la lumière'], dessin:dessin};
})();
