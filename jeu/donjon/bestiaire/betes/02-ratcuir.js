/* Le rat cuirassé : un gros rat qui porte des morceaux d'armure de la ville d'avant */
(function(){
var B = window.BT, P = B.P, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE, N = 0;
function f1(v){ return (+v).toFixed(1); }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
/* une courbe lisse qui passe par tous les points */
function lisse(pts, ferme){
  var n = pts.length, s = 'M' + pt(pts[0]), m = ferme ? n : n - 1;
  function q(i){ return ferme ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; }
  for(var i = 0; i < m; i++){
    var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2);
    s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c);
  }
  return s + (ferme ? ' Z' : '');
}
/* un membre effilé qui suit des points, une largeur par point ; renvoie le chemin et ses deux bords */
function tube(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2;
    G.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); D.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisse(G.concat([bout(n - 1, n - 2, ws[n - 1])], D.slice().reverse(), [bout(0, 1, ws[0])]), true), g: G, dr: D};
}
/* un point et sa direction sur une courbe de Bézier cubique */
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
function bezD(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return 3 * u * u * (p[1][i] - p[0][i]) + 6 * u * t * (p[2][i] - p[1][i]) + 3 * t * t * (p[3][i] - p[2][i]); }); }
/* touffes de poil qui dépassent d'un bord (dessinées avant le corps : seules les pointes se voient) */
function frange(pts, haut, couleur, seed, recul){
  var R = B.rng(seed), s = 'M' + pt(pts[0]), n = pts.length, nr = [];
  recul = recul == null ? .5 : recul;
  for(var k = 0; k < n - 1; k++){
    var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, h = haut * (.6 + R() * .7);
    nr.push([dy / l, -dx / l]);
    s += ' Q ' + pt([a[0] + dx * .7 + dy / l * h * .4, a[1] + dy * .7 - dx / l * h * .4]) + ' ' + pt([b[0] + dx * recul + dy / l * h, b[1] + dy * recul - dx / l * h]) + ' L ' + pt(b);
  }
  nr.push(nr[n - 2]);
  for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 16, q[1] - nr[k2][1] * 16]); }
  return P(s + ' Z', couleur, ' stroke-width="2.6"');
}
/* des mèches de poil tirées au hasard dans une ellipse, couchées vers l'arrière */
function poils(cx, cy, rx, ry, n, seed, cH, cB, op){
  var R = B.rng(seed), s = '';
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    var haut = y < cy - ry * .15, l = 8 + R() * 9, c = haut ? cH : cB;
    s += L('M' + f1(x) + ' ' + f1(y) + ' q ' + f1(l * .5) + ' ' + f1(l * .05) + ' ' + f1(l) + ' ' + f1(l * .42), c, 1.5, ' opacity="' + f1((op || .4) + R() * .2) + '"');
  }
  return s;
}

function dessin(){
  var d = new B.Dessin(), u = 'ratcuir' + (++N) + '_', nid = 0, s = '';
  function id(){ return u + (++nid); }
  function clip(chemin){ var i = id(); d.defs.push('<clipPath id="' + i + '"><path d="' + chemin + '"/></clipPath>'); return ' clip-path="url(#' + i + ')"'; }
  function rad(stops, cx, cy, r){ var i = id(); d.defs.push('<radialGradient id="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</radialGradient>'); return 'url(#' + i + ')'; }
  function lin(stops, x1, y1, x2, y2){ var i = id(); d.defs.push('<linearGradient id="' + i + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</linearGradient>'); return 'url(#' + i + ')'; }
  /* la rouille : des plaques orangées et des piqûres sombres, tirées d'un bruit */
  var ro = id();
  d.defs.push('<filter id="' + ro + '" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="4" seed="9" result="t"/>' +
    '<feColorMatrix in="t" type="matrix" values="0 .8 0 0 .26  0 .45 0 0 .07  0 .16 0 0 .02  5 0 0 0 -2.65" result="r"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".3" numOctaves="2" seed="3" result="t2"/>' +
    '<feColorMatrix in="t2" type="matrix" values="0 0 0 0 .22  0 0 0 0 .1  0 0 0 0 .06  10 0 0 0 -6.8" result="p"/>' +
    '<feMerge result="m"><feMergeNode in="r"/><feMergeNode in="p"/></feMerge>' +
    '<feComposite in="m" in2="SourceAlpha" operator="in"/></filter>');
  var ROUILLE = ' filter="url(#' + ro + ')"';
  var flou2 = d.flou(2.2), flou4 = d.flou(4), flou8 = d.flou(8);
  var poil = '#5c4a57', ventre = '#8f7686', rose = '#d58a9a', fer = '#6c7584', ferS = '#3a3f4c';
  function rivet(x, y, r){ r = r || 4; x = +x; y = +y; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + d.g('#9aa3ad') + '" stroke="' + O + '" stroke-width="1.8"/>' + C(x + r * .3, y - r * .35, r * .35, '#eef6ff', ' opacity=".85"'); }
  /* une plaque de fer : remplissage, rouille, contour, liseré de lune */
  function plaque(chemin, coul, liser, bas){
    var cl = clip(chemin);
    return P(chemin, d.g(coul || fer)) +
      '<g' + cl + '>' + F(chemin, '#000', ROUILLE + ' opacity=".9"') +
      (bas ? L(bas, '#7a3a1a', 9, ' opacity=".75" filter="' + flou4 + '"') + L(bas, '#3a1c12', 3, ' opacity=".5" transform="translate(0 -3)"') : '') +
      (liser ? L(liser, '#ffffff', 7, ' opacity=".14" filter="' + flou4 + '"') : '') + '</g>' +
      L(chemin, O, 3) + (liser ? L(liser, LUNE, 2.2, ' opacity=".75"') : '');
  }
  /* une rune gravée qui luit faiblement (cyan) */
  var RUNES = ['M0 -8 L0 8 M0 -8 L6 -3 M0 0 L6 4', 'M-5 -8 L4 0 L-5 8', 'M0 -8 L0 8 M-5 -4 L5 4', 'M0 -8 L5 0 L0 8 L-5 0 Z', 'M-4 -8 L-4 8 M-4 0 L4 -7 M-4 0 L4 7', 'M-5 -7 L5 -7 L-5 7 L5 7', 'M0 -8 L0 8 M-5 -8 L0 -2 L5 -8'];
  function rune(k, x, y, a, e){
    var g = RUNES[k % RUNES.length], tr = ' transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + (e || 1) + ')"';
    return '<g' + tr + '>' + L(g, '#1a1220', 3.4, ' opacity=".7" transform="translate(-.8 1)"') + L(g, '#5fe8ff', 5, ' opacity=".55" filter="' + flou2 + '"') + L(g, '#bff8ff', 1.7) + '</g>';
  }

  /* ---- le sol ---- */
  s += '<ellipse cx="282" cy="392" rx="236" ry="19" fill="#000" opacity=".55"/>';
  s += '<ellipse cx="300" cy="390" rx="170" ry="10" fill="#000" opacity=".35" filter="' + flou4 + '"/>';

  /* ---- la queue, annelée de fer, qui remonte derrière ---- */
  var qPts = [[452, 330], [494, 326], [522, 296], [530, 252], [518, 210], [494, 186], [470, 184]], qW = [30, 25, 20, 16, 12, 8, 4];
  var qT = tube(qPts, qW);
  s += P(qT.d, d.g(rose));
  s += F(qT.d, '#000', ' opacity=".18"' + clip('M440 300 L 540 300 L 540 340 L 440 340 Z'));
  for(var k = 0; k < 18; k++){ var t = k / 18, i0 = Math.floor(t * 6), tt = t * 6 - i0, a = qPts[i0], b = qPts[i0 + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), w = (qW[i0] * (1 - tt) + qW[i0 + 1] * tt) / 2, x = a[0] + dx * tt, y = a[1] + dy * tt;
    s += L('M' + f1(x - dy / l * w * .9) + ' ' + f1(y + dx / l * w * .9) + ' L ' + f1(x + dy / l * w * .9 + dx / l * 3) + ' ' + f1(y - dx / l * w * .9 + dy / l * 3), '#9a5266', 1.4, ' opacity=".6"'); }
  s += L(lisse(qT.dr.slice(1, 6)), '#ffd2dc', 2, ' opacity=".55"');
  /* les anneaux de fer */
  [[1, .45, 9], [2, .55, 9], [3, .6, 8], [4, .55, 7]].forEach(function(r){
    var a = qPts[r[0]], b = qPts[r[0] + 1], x = a[0] + (b[0] - a[0]) * r[1], y = a[1] + (b[1] - a[1]) * r[1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), w = (qW[r[0]] + qW[r[0] + 1]) / 2 + 7;
    var ux = dx / l, uy = dy / l, h = r[2], ch = 'M' + f1(x - uy * w / 2 - ux * h / 2) + ' ' + f1(y + ux * w / 2 - uy * h / 2) + ' Q ' + f1(x - ux * h * .9) + ' ' + f1(y - uy * h * .9) + ' ' + f1(x + uy * w / 2 - ux * h / 2) + ' ' + f1(y - ux * w / 2 - uy * h / 2) +
      ' L ' + f1(x + uy * w / 2 + ux * h / 2) + ' ' + f1(y - ux * w / 2 + uy * h / 2) + ' Q ' + f1(x + ux * h * .3) + ' ' + f1(y + uy * h * .3) + ' ' + f1(x - uy * w / 2 + ux * h / 2) + ' ' + f1(y + ux * w / 2 + uy * h / 2) + ' Z';
    s += P(ch, d.g('#7d8693')) + F(ch, '#000', ROUILLE) + L(ch, O, 2.6) + rivet(f1(x + uy * w * .18), f1(y - ux * w * .18), 2.4);
    s += L('M' + f1(x + uy * w / 2 - ux * h / 2) + ' ' + f1(y - ux * w / 2 - uy * h / 2) + ' l ' + f1(ux * h) + ' ' + f1(uy * h), LUNE, 2, ' opacity=".8"');
  });

  /* ---- la patte arrière au loin ---- */
  s += P(tube([[410, 320], [432, 352], [420, 380]], [44, 30, 20]).d, d.g(B.sombre(poil, .45)));
  s += P('M424 376 C 408 388 380 392 366 390 C 360 386 372 380 390 378 Z', d.g(B.sombre(rose, .35)));

  /* ---- la patte avant au loin ---- */
  var pa = tube([[200, 296], [178, 336], [150, 364], [136, 378]], [44, 32, 22, 18]);
  s += P(pa.d, d.g(B.sombre(poil, .45)));
  s += P('M146 374 C 130 384 112 390 100 388 C 98 382 110 378 128 374 Z', d.g(B.sombre(rose, .35)));
  s += L('M104 386 q -6 1 -8 6 M114 388 q -6 2 -7 7 M124 387 q -5 2 -6 7', O, 2.4);

  /* ---- le corps : touffes, ventre, fourrure ---- */
  var corps = 'M168 300 C 158 250 186 192 246 160 C 296 132 384 116 444 160 C 486 192 498 262 478 312 C 460 354 404 370 332 370 C 262 370 194 354 168 300 Z';
  var basVentre = [[470, 318], [446, 344], [418, 358], [386, 366], [354, 369], [322, 370], [290, 368], [260, 364], [232, 356], [206, 342]];
  s += frange(basVentre, 13, d.g(B.sombre(poil, .2)), 4);
  s += frange([[478, 230], [484, 262], [482, 292], [474, 318]], 12, d.g(poil), 6);
  s += P(corps, d.g(poil));
  s += F('M196 330 C 236 362 300 372 368 368 C 330 352 262 346 196 330 Z', ventre, ' opacity=".55"');
  s += F(corps, rad([[0, '#000', 0], [.7, '#000', 0], [1, '#0e0814', .55]], .55, .42, .62), '');
  s += F(corps, lin([[0, '#000', 0], [.62, '#000', 0], [1, '#0e0814', .45]], 0, 0, 0, 1));
  s += poils(330, 300, 130, 58, 170, 17, '#c9b6c4', '#271b26', .34);
  s += poils(372, 258, 70, 24, 44, 19, '#eadbe6', '#eadbe6', .28);
  s += L('M472 214 C 490 248 492 290 478 316', LUNE, 2.6, ' opacity=".55"') + L('M474 232 C 484 256 486 280 480 300', '#ffffff', 6, ' opacity=".08" filter="' + flou4 + '"');
  /* une vieille cicatrice sur le flanc */
  s += L('M392 300 C 404 316 410 330 408 346', '#d8b2bf', 2.6, ' opacity=".75"') + L('M396 310 l 8 -3 M402 322 l 8 -2 M405 334 l 8 0', '#d8b2bf', 1.4, ' opacity=".7"');

  /* ---- la sangle de cuir sous le ventre, avec sa boucle ---- */
  var sangle = 'M306 236 C 314 280 320 320 318 366 L 344 368 C 346 320 340 278 332 234 Z';
  s += P(sangle, d.g('#6a4028')) + L('M311 244 C 318 284 322 324 321 362 M327 240 C 335 282 340 322 340 362', '#c99a6a', 1.2, ' stroke-dasharray="3 4" opacity=".7"');
  var boucle = 'M307 306 Q 324 300 341 302 L 343 330 Q 326 336 310 334 Z';
  s += F('M312 312 L 338 309 L 339 328 L 314 330 Z', '#3a2216', ' opacity=".7"');
  s += L(boucle, O, 8.5) + L(boucle, d.g('#c9a35a'), 4) + L('M309 307 Q 325 301 340 303', '#fff1c0', 1.4, ' opacity=".7"');
  s += L('M311 320 L 337 316', O, 4.6) + L('M311 320 L 337 316', '#e8c88a', 2.2) + C(311, 320, 2.6, '#c9a35a', ' stroke="' + O + '" stroke-width="1.6"');

  /* ---- les plaques du dos, comme des écailles de fer rivetées ---- */
  var dosC = [[246, 160], [296, 132], [384, 116], [444, 160]], dosC2 = [[444, 160], [486, 192], [498, 262], [478, 312]];
  function surDos(t){ /* t de 0 à 2 : le long du dos */
    var c = t <= 1 ? dosC : dosC2, tt = t <= 1 ? t : t - 1, p = bez(c, tt), v = bezD(c, tt), l = Math.hypot(v[0], v[1]) || 1;
    return {p: p, n: [v[1] / l, -v[0] / l]};
  }
  var bandes = [[1.36, 1.68], [1.08, 1.4], [.82, 1.12], [.56, .86], [.32, .6]], lesBas = [];
  bandes.forEach(function(bd, j){
    var haut = [], bas = [], prof = 78 - j * 2;
    for(var k = 0; k <= 6; k++){ var t = bd[0] + (bd[1] - bd[0]) * k / 6, q = surDos(t); haut.push([q.p[0] + q.n[0] * 9, q.p[1] + q.n[1] * 9]); bas.push([q.p[0] - q.n[0] * prof * (1 - Math.pow(k / 6 - .5, 2) * .5), q.p[1] - q.n[1] * prof * (1 - Math.pow(k / 6 - .5, 2) * .5)]); }
    var ch = lisse(haut) + ' L' + lisse(bas.slice().reverse()).slice(1) + ' Z';
    lesBas.push(bas);
    /* touffes qui sortent de dessous, ombre portée sur le poil, puis la plaque */
    s += F(ch, '#0c0612', ' opacity=".55" filter="' + flou4 + '" transform="translate(-3 8)"');
    s += frange(bas.slice().reverse().map(function(p, i){ return [p[0] + (i % 2) * 2, p[1] - 3]; }), 9, d.g(B.clair(poil, .04)), 30 + j, .3);
    s += plaque(ch, j % 2 ? '#646d7b' : fer, lisse(haut.slice(1, 6)), lisse(bas));
    /* le bord avant relevé (un pli), les rivets, les rayures */
    var av = bas[6], ah = haut[6], ar = bas[0], arh = haut[0];
    s += L('M' + pt([ah[0] + (av[0] - ah[0]) * .08, ah[1] + (av[1] - ah[1]) * .08]) + ' L ' + pt([ah[0] + (av[0] - ah[0]) * .92, ah[1] + (av[1] - ah[1]) * .92]), '#c3ccd6', 1.6, ' opacity=".5" transform="translate(-6 1)"');
    for(var r = 1; r <= 3; r++){ var tt = r / 4; s += rivet(f1(ah[0] + (av[0] - ah[0]) * tt - 7), f1(ah[1] + (av[1] - ah[1]) * tt), 3.6); }
    for(var r2 = 1; r2 <= 2; r2++){ var t2 = r2 / 3; s += rivet(f1(arh[0] + (ar[0] - arh[0]) * t2 + 7), f1(arh[1] + (ar[1] - arh[1]) * t2), 3); }
    var mi = bas[3], mh = haut[3];
    s += L('M' + pt([mh[0] + (mi[0] - mh[0]) * .3 - 6, mh[1] + (mi[1] - mh[1]) * .3]) + ' l 14 6 M' + pt([mh[0] + (mi[0] - mh[0]) * .55 - 2, mh[1] + (mi[1] - mh[1]) * .55]) + ' l 9 -2', '#dfe8f0', 1.2, ' opacity=".45"');
  });
  /* coulures de rouille qui descendent sur le poil (fines, irrégulières, avec une goutte) */
  function coulure(x, y, lg, lar, seed){
    var R = B.rng(seed), w = lar || 3, x2 = x + (R() - .5) * 6, ch = 'M' + f1(x - w) + ' ' + f1(y) + ' C ' + f1(x - w * .8) + ' ' + f1(y + lg * .4) + ' ' + f1(x2 - 1.2) + ' ' + f1(y + lg * .7) + ' ' + f1(x2 - 1) + ' ' + f1(y + lg) +
      ' C ' + f1(x2 + 1) + ' ' + f1(y + lg + 2) + ' ' + f1(x2 + 1.4) + ' ' + f1(y + lg * .6) + ' ' + f1(x + w * .4) + ' ' + f1(y + lg * .35) + ' C ' + f1(x + w) + ' ' + f1(y + lg * .2) + ' ' + f1(x + w * 1.2) + ' ' + f1(y + 4) + ' ' + f1(x + w * 1.4) + ' ' + f1(y) + ' Z';
    return F('M' + f1(x - w * 2.5) + ' ' + f1(y - 2) + ' q ' + f1(w * 2.5) + ' ' + f1(lg * .5) + ' ' + f1(w * 5) + ' 0 Z', '#6a3018', ' opacity=".35" filter="' + flou2 + '"') +
      F(ch, '#9a4a24', ' opacity=".85"') + L('M' + f1(x - w * .3) + ' ' + f1(y + 2) + ' C ' + f1(x - w * .2) + ' ' + f1(y + lg * .4) + ' ' + f1(x2 - .5) + ' ' + f1(y + lg * .7) + ' ' + f1(x2) + ' ' + f1(y + lg * .9), '#d88a48', 1, ' opacity=".6"') +
      C(f1(x2), f1(y + lg + 3.5), w * .8, '#7e3a1c') + C(f1(x2 + .6), f1(y + lg + 2.6), w * .3, '#f0b070', ' opacity=".7"');
  }
  [[4, 2, 22, 3], [3, 4, 30, 3], [2, 1, 14, 2.2], [2, 4, 24, 2.6], [1, 3, 18, 2.4], [0, 4, 12, 2]].forEach(function(c, m){ var p = lesBas[c[0]][c[1]]; s += coulure(p[0], p[1] - 2, c[2], c[3], m + 1); });

  /* ---- la patte arrière proche : la cuisse, le long pied ---- */
  var cuisse = 'M352 286 C 380 248 446 252 468 300 C 482 334 462 372 420 380 C 392 384 366 374 356 352 C 344 330 342 304 352 286 Z';
  s += F(cuisse, '#0c0612', ' opacity=".45" filter="' + flou4 + '" transform="translate(-6 6)"');
  s += frange([[362, 360], [378, 374], [398, 380], [420, 380]], 9, d.g(poil), 21);
  s += P(cuisse, d.g(B.clair(poil, .05)));
  s += poils(410, 322, 46, 40, 40, 23, '#c9b6c4', '#271b26', .3);
  s += L('M360 280 C 388 254 440 258 462 292', LUNE, 2.2, ' opacity=".5"');
  /* la cuissarde : une petite plaque cabossée sur la hanche */
  var hanche = 'M382 270 C 410 254 448 262 462 290 C 446 300 420 306 392 302 C 380 292 378 280 382 270 Z';
  s += plaque(hanche, '#5e6775', 'M388 266 C 414 254 446 262 458 284') + rivet(396, 284, 3.4) + rivet(446, 286, 3.4);
  s += F('M414 276 C 420 272 428 274 430 280 C 424 284 418 283 414 276 Z', '#1d1a26', ' opacity=".5"') + L('M428 276 C 432 279 432 283 430 285', '#dfe8f0', 1.4, ' opacity=".6"');
  /* le pied rose, les doigts, les griffes */
  var pied = 'M402 366 C 398 384 370 392 334 393 C 316 394 312 384 324 380 C 346 376 374 372 402 366 Z';
  s += P(pied, d.g(rose));
  s += [[318, 390], [326, 393], [335, 394]].map(function(t){ return '<ellipse cx="' + t[0] + '" cy="' + t[1] + '" rx="6" ry="4" fill="' + d.g(rose) + '" stroke="' + O + '" stroke-width="2.4"/>' + P('M' + (t[0] - 5) + ' ' + (t[1] - 1) + ' q -7 0 -11 7 q 6 -3 10 -3 Z', '#2a2230', ' stroke-width="1.6"'); }).join('');
  s += L('M340 384 C 360 382 380 378 396 372', '#ffd6de', 1.6, ' opacity=".6"');

  /* ---- la gorgerette : l'anneau de fer autour du cou, et un bout de chaîne ---- */
  var gorge = 'M214 216 C 238 206 260 222 266 250 C 272 280 264 312 246 334 L 222 328 C 238 304 244 278 238 254 C 234 238 226 228 206 226 Z';
  s += plaque(gorge, '#5e6775', 'M218 214 C 240 208 258 222 264 246', 'M222 328 C 238 304 244 278 238 254');
  [[226, 222], [248, 252], [252, 286], [240, 318]].forEach(function(r){ s += rivet(r[0], r[1], 3.2); });
  /* un bout de chaîne cassée qui pend */
  [[214, 324, 14, 1], [210, 338, -12, 0], [213, 352, 10, 1], [209, 365, -16, 0]].forEach(function(m){
    var e = '<ellipse cx="' + m[0] + '" cy="' + m[1] + '" rx="' + (m[3] ? 5.5 : 2.6) + '" ry="8.5" transform="rotate(' + m[2] + ' ' + m[0] + ' ' + m[1] + ')" fill="none" stroke="';
    s += e + O + '" stroke-width="6.4"/>' + e + '#7a828e" stroke-width="3"/>' + L('M' + (m[0] + 3) + ' ' + (m[1] - 6) + ' q 2.5 3 1.5 7', '#dfe8f0', 1.2, ' opacity=".75"') + L('M' + (m[0] - 4) + ' ' + (m[1] + 2) + ' q 1 4 4 6', '#a4512a', 1.6, ' opacity=".8"');
  });

  /* ---- la patte avant proche : bras puissant, gros doigts, griffes noires ---- */
  var bras = tube([[262, 276], [280, 330], [248, 360], [216, 378]], [64, 52, 36, 28]);
  s += F(bras.d, '#0c0612', ' opacity=".4" filter="' + flou4 + '" transform="translate(-5 4)"');
  s += frange([[262, 352], [278, 350], [294, 340], [302, 326]], 12, d.g(B.clair(poil, .06)), 44, .2);
  s += P(bras.d, d.g(B.clair(poil, .1)));
  s += F('M232 352 C 246 340 262 336 278 338 C 266 346 252 354 236 362 Z', '#1a1220', ' opacity=".35"');
  s += L('M258 338 C 268 346 270 356 262 364', '#1a1220', 1.8, ' opacity=".5"');
  s += poils(262, 334, 20, 30, 26, 41, '#d6c4d2', '#271b26', .34);
  s += L(lisse(bras.dr.slice(1, 4)), LUNE, 2.2, ' opacity=".55"');
  var main = 'M228 368 C 220 386 190 392 166 389 C 160 381 176 372 200 368 Z';
  s += P(main, d.g(rose), ' stroke-width="2.6"');
  [[160, 386, -8], [171, 390, 0], [183, 391, 6], [195, 389, 12]].forEach(function(t){
    s += '<ellipse cx="' + t[0] + '" cy="' + t[1] + '" rx="7" ry="4.6" fill="' + d.g(rose) + '" stroke="' + O + '" stroke-width="2.4"/>';
    s += P('M' + (t[0] - 6) + ' ' + (t[1] - 2) + ' C ' + (t[0] - 13) + ' ' + (t[1] - 1) + ' ' + (t[0] - 17) + ' ' + (t[1] + 3) + ' ' + (t[0] - 18) + ' ' + (t[1] + 9) + ' C ' + (t[0] - 13) + ' ' + (t[1] + 5) + ' ' + (t[0] - 9) + ' ' + (t[1] + 3) + ' ' + (t[0] - 4) + ' ' + (t[1] + 3) + ' Z', '#231a29', ' stroke-width="1.6"');
    s += L('M' + (t[0] - 12) + ' ' + t[1] + ' q -3 2 -4 5', '#9a90a8', 1, ' opacity=".7"');
  });

  /* ---- l'épaulière : trois lames de fer superposées ---- */
  var ep3 = 'M204 300 C 236 286 296 284 330 300 C 334 312 330 322 322 328 C 290 314 238 314 210 324 C 202 318 200 308 204 300 Z';
  var ep2 = 'M200 276 C 236 258 304 258 338 278 C 342 292 338 304 330 310 C 296 294 236 294 204 306 C 196 298 194 286 200 276 Z';
  var ep1 = 'M196 256 C 200 208 240 180 288 184 C 330 188 352 220 346 264 C 340 274 336 282 330 286 C 300 268 236 268 202 286 C 194 278 192 266 196 256 Z';
  s += F(ep1, '#0c0612', ' opacity=".5" filter="' + flou4 + '" transform="translate(-5 30)"');
  s += plaque(ep3, '#5a6371', 'M208 300 C 240 288 296 286 328 302', 'M322 328 C 290 314 238 314 210 324') + plaque(ep2, '#626b79', 'M204 278 C 238 262 302 262 334 280', 'M330 310 C 296 294 236 294 204 306') + plaque(ep1, fer, 'M204 236 C 214 204 248 186 288 188 C 322 192 342 214 344 246', 'M330 286 C 300 268 236 268 202 286');
  s += '<ellipse cx="300" cy="212" rx="26" ry="12" transform="rotate(28 300 212)" fill="#eaf6ff" opacity=".22" filter="' + flou4 + '"/>';
  [[214, 314], [240, 306], [270, 304], [300, 306], [322, 316]].forEach(function(r){ s += rivet(r[0], r[1], 3); });
  [[210, 292], [238, 282], [270, 279], [302, 282], [330, 292]].forEach(function(r){ s += rivet(r[0], r[1], 3.4); });
  /* le bord épais, les bosses et les rayures de l'épaulière */
  s += L('M206 272 C 240 256 300 254 334 270', '#cfd8e2', 1.6, ' opacity=".55"');
  s += F('M262 218 C 274 210 290 214 292 226 C 282 232 268 230 262 218 Z', '#1d1a26', ' opacity=".45"') + L('M288 214 C 294 218 296 224 292 230', '#e6eef6', 1.6, ' opacity=".7"');
  s += L('M226 248 l 18 -10 M232 254 l 12 -6 M300 236 l 16 6', '#e6eef6', 1.2, ' opacity=".5"');
  s += L('M236 210 C 242 230 246 246 244 262', '#2a2234', 1.6, ' opacity=".5"');
  /* l'emblème gravé des Fondateurs : un rouage, un œil au centre */
  var roue = '';
  for(var k = 0; k < 10; k++){ var a0 = k / 10 * Math.PI * 2, a1 = a0 + .2, a2 = a0 + .42, a3 = a0 + .628;
    roue += (k ? ' L ' : 'M') + f1(Math.cos(a0) * 13) + ' ' + f1(Math.sin(a0) * 13) + ' L ' + f1(Math.cos(a1) * 17) + ' ' + f1(Math.sin(a1) * 17) + ' L ' + f1(Math.cos(a2) * 17) + ' ' + f1(Math.sin(a2) * 17) + ' L ' + f1(Math.cos(a3) * 13) + ' ' + f1(Math.sin(a3) * 13); }
  roue += ' Z M-6 0 Q 0 -6 6 0 Q 0 6 -6 0 Z';
  s += '<g transform="translate(294 238) rotate(-8) scale(1 .86)">' + L(roue, '#1a1222', 2.4, ' opacity=".55"') + L(roue, '#e6eef6', .9, ' opacity=".4" transform="translate(.8 -.8)"') + C(0, 0, 2, '#1a1222', ' opacity=".6"') + '</g>';
  /* une coulure de rouille sous l'épaulière */
  s += F('M292 316 C 292 324 294 330 295 334 C 297 330 298 322 297 316 Z', '#a4512a', ' opacity=".85"') + C(295, 336, 2.2, '#8a3e1e');


  /* ---- la tête : joues hérissées, rictus ---- */
  var tete = 'M238 238 C 216 204 176 196 146 206 C 114 218 84 248 58 276 C 46 290 46 302 60 306 C 94 316 134 326 172 324 C 214 322 244 298 248 270 C 249 256 246 246 238 238 Z';
  s += frange([[247, 276], [242, 294], [230, 308], [214, 318], [196, 323], [178, 325]], 9, d.g(B.clair(poil, .08)), 52, .5);
  s += P(tete, d.g(poil));
  s += poils(190, 280, 42, 26, 40, 29, '#c9b6c4', '#271b26', .32);
  s += L('M90 290 q 7 5 5 13 M101 292 q 7 6 4 14 M112 296 q 6 5 3 12', '#1a1220', 1.8, ' opacity=".55"') + L('M93 288 q 7 5 5 12 M104 290 q 7 6 4 13', '#c9b6c4', 1.2, ' opacity=".35"');
  s += F('M60 300 C 96 310 130 316 166 316 C 130 322 92 316 60 300 Z', ventre, ' opacity=".5"');
  /* une vieille cicatrice sur la joue : une bande sans poil */
  s += L('M170 292 C 182 300 198 304 216 300', '#3a2632', 5, ' opacity=".5"') + L('M170 292 C 182 300 198 304 216 300', '#caa0b0', 2.4, ' opacity=".85"') + L('M178 294 C 186 298 194 300 202 300', '#f0d0da', 1, ' opacity=".7"');

  /* la gueule ouverte : mâchoire du bas, langue, dents jaunes, bave */
  var gueule = 'M66 306 C 82 334 116 352 152 346 C 172 342 180 332 178 322 C 146 326 104 318 66 306 Z';
  s += P(gueule, '#3a0f22') + F('M88 322 C 110 338 140 342 162 334 C 140 330 112 328 88 322 Z', '#b8546e');
  var machoire = 'M70 318 C 86 344 118 360 154 354 C 172 350 182 340 180 330 C 176 340 160 346 140 346 C 110 346 88 336 70 318 Z';
  s += P(machoire, d.g(poil));
  var email = lin([[0, '#f6d27a'], [.6, '#e0a24a'], [1, '#a8652a']], 0, 0, 1, 1);
  s += P('M80 340 C 78 332 78 324 80 316 L 88 316 C 86 324 86 332 88 340 Z', email, ' stroke-width="2.2"') + L('M83 320 L 83 336', '#fff2c0', 1.2, ' opacity=".6"');
  s += P('M96 314 L 100 324 L 104 314 Z M112 318 L 116 328 L 120 318 Z M130 320 L 134 329 L 138 321 Z M148 321 L 151 329 L 155 321 Z', '#efe2b0', ' stroke-width="1.6"');
  s += P('M101 340 L 104 332 L 108 341 Z M120 343 L 123 335 L 127 343 Z', '#efe2b0', ' stroke-width="1.6"');
  /* les grandes incisives orangées, l'une ébréchée */
  s += P('M67 293 C 68 304 70 314 73 324 L 79 322 C 77 312 76 303 75 294 Z', lin([[0, '#c98a3a'], [1, '#8a5222']], 0, 0, 1, 1), ' stroke-width="2.2"');
  s += P('M57 291 C 58 304 60 316 63 328 L 67 327 L 69 330 L 71 325 C 69 313 67 302 66 292 Z', email, ' stroke-width="2.4"');
  s += L('M60 296 C 61 307 62 316 64 324', '#fff4c8', 1.4, ' opacity=".8"') + L('M61 311 l 6 -1', '#8a5222', 1.1, ' opacity=".6"');
  s += P('M152 344 C 153 356 149 366 151 376 C 153 380 158 380 158 375 C 158 366 156 356 157 344 Z', '#d8f0ff', ' stroke-width="1.6" opacity=".85"') + C(154, 386, 2.2, '#d8f0ff', ' opacity=".7"') + C(154.5, 373, 1, '#fff');
  /* le museau, les moustaches (certaines cassées) */
  s += '<ellipse cx="54" cy="286" rx="11" ry="9" fill="' + d.g(rose) + '" stroke="' + O + '" stroke-width="3"/>' + F('M48 288 c 2 -3 6 -3 7 0 c -2 2 -5 2 -7 0 Z', '#4a1222') + C(57, 281, 2.6, '#fff', ' opacity=".75"');
  s += [[74, 290], [82, 294], [90, 292], [80, 286], [88, 300]].map(function(p){ return C(p[0], p[1], 1.6, '#2a1a26'); }).join('');
  s += L('M78 290 C 54 276 30 268 6 266 M80 294 C 56 294 34 298 12 306 M86 298 C 70 306 56 314 44 322 M90 288 C 76 270 64 260 50 252', '#e8e0ec', 1.4, ' opacity=".85"');

  /* ---- le casque cabossé, gravé de runes ---- */
  var casque = 'M96 250 C 98 214 128 186 170 180 C 210 176 238 196 246 228 C 248 238 246 248 242 254 C 196 240 140 240 96 250 Z';
  s += F(casque, '#0c0612', ' opacity=".5" filter="' + flou4 + '" transform="translate(-4 8)"');
  s += plaque(casque, '#727b89', 'M104 228 C 116 200 142 186 172 184 C 204 182 232 198 242 226');
  /* la crête du casque */
  var crete = 'M120 204 C 140 184 176 172 214 182 C 228 188 236 196 240 206 C 232 202 218 194 200 192 C 172 190 142 196 120 204 Z';
  s += plaque(crete, '#8a93a0');
  /* le trou par où sort l'oreille (métal arraché, bords retroussés) */
  s += P('M194 200 L 200 188 L 208 192 L 214 184 L 222 190 L 230 186 L 234 198 L 228 208 L 212 210 L 200 208 Z', '#140c1a', ' stroke-width="2.4"');
  /* l'oreille déchirée (deux encoches) qui passe par le trou */
  var oreille = 'M200 204 C 186 172 192 136 218 126 L 226 124 L 230 134 L 236 122 C 256 122 270 146 262 170 L 252 172 L 258 180 C 250 198 234 208 212 208 Z';
  s += '<g transform="rotate(34 214 204)">' + P(oreille, d.g(poil)) +
    F('M206 198 C 198 174 204 148 222 140 C 242 136 254 152 250 170 C 244 190 228 198 206 198 Z', d.halo('#f0aabb', '#b8607a')) +
    L('M220 194 C 224 176 228 162 234 152 M226 174 C 234 170 240 170 246 174', '#9a4660', 1.4, ' opacity=".7"') +
    L('M204 140 C 210 128 220 124 226 124 M238 122 C 254 124 266 140 264 160', LUNE, 2.2, ' opacity=".6"') + '</g>';
  s += P('M192 204 L 197 194 L 203 198 L 206 190 L 212 196 L 206 210 L 196 210 Z', d.g('#8a93a0'), ' stroke-width="2.2"') + L('M194 202 L 198 195 L 203 199', '#e6eef6', 1.2, ' opacity=".8"');
  /* le bord du casque (la visière) et le nasal qui descend sur le museau */
  var bord = 'M92 252 C 140 238 200 238 246 254 L 244 266 C 200 252 142 252 96 264 Z';
  s += plaque(bord, '#5a6371', 'M94 252 C 140 240 200 240 244 254', 'M244 266 C 200 252 142 252 96 264');
  s += '<ellipse cx="206" cy="196" rx="22" ry="9" transform="rotate(20 206 196)" fill="#eaf6ff" opacity=".2" filter="' + flou4 + '"/>';
  var nasal = 'M104 250 L 122 252 C 112 268 98 282 84 292 C 80 290 80 286 82 282 C 92 274 100 262 104 250 Z';
  s += plaque(nasal, '#6c7584', 'M110 252 C 104 266 94 278 84 286');
  [[112, 258], [140, 252], [170, 249], [200, 250], [228, 256]].forEach(function(r){ s += rivet(r[0], r[1], 3); });
  /* bosses et fente */
  s += F('M160 206 C 172 200 186 204 188 214 C 178 220 166 218 160 206 Z', '#1d1a26', ' opacity=".5"') + L('M184 202 C 190 206 192 212 188 218', '#e6eef6', 1.6, ' opacity=".7"');
  s += F('M118 230 C 126 226 134 228 136 234 C 130 238 122 237 118 230 Z', '#1d1a26', ' opacity=".5"') + L('M132 226 C 137 229 138 233 136 236', '#e6eef6', 1.4, ' opacity=".7"');
  s += L('M222 214 L 214 224 L 218 230 L 210 240', '#1a1222', 1.8);
  /* les runes */
  s += rune(0, 134, 220, -18, .8) + rune(3, 154, 212, -10, .7) + rune(1, 172, 226, -4, .8) + rune(4, 194, 222, 6, .75) + rune(2, 214, 232, 14, .7);
  s += '<ellipse cx="174" cy="222" rx="56" ry="18" fill="#5fe8ff" opacity=".12" filter="' + flou8 + '"/>';

  /* ---- l'œil rouge sous la visière, et son reflet ---- */
  s += '<circle cx="146" cy="276" r="30" fill="' + d.halo('#ffb0a0', '#ff2a2a') + '" opacity=".75"/>';
  s += F('M126 268 C 140 262 162 262 172 268 C 166 282 142 288 126 278 Z', '#1a0a14');
  var ge = id();
  d.defs.push('<radialGradient id="' + ge + '" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#fff2a0"/><stop offset=".45" stop-color="#ff4a2a"/><stop offset="1" stop-color="#7a0a14"/></radialGradient>');
  s += P('M132 274 C 140 266 158 266 166 272 C 160 282 142 284 132 274 Z', 'url(#' + ge + ')', ' stroke-width="2.6"') + F('M148 268 C 151 271 151 279 148 282 C 145 279 145 271 148 268 Z', '#2a0408') + C(142, 272, 2.6, '#fff') + C(158, 276, 1.2, '#fff', ' opacity=".7"');
  s += F('M126 266 C 146 260 166 260 176 266 L 172 270 C 160 266 144 266 130 272 Z', '#0c0612', ' opacity=".6"');

  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.ratcuir = {nom:'Rat cuirassé', rang:'monstre', pv:70, lieu:'L\'atelier des Fondateurs · avec le Gardien',
  livre:'« Sa cuirasse rouille depuis mille ans. Il suffit de l\'aider un peu. »',
  combo:['+🧪 S\'ouvre : l\'acide', ' Autre chemin : le givre', '!🔥 Le renforce : le feu'], dessin:dessin};
})();
