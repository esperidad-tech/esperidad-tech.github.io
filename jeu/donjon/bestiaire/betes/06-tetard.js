/* Le têtard du puits : gros, gluant, la gueule toujours ouverte, dans sa flaque */
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
/* une goutte : ronde en bas, pointue vers « d'où elle vient » */
function goutte(x, y, r, ang, c, op){
  var ca = Math.cos(ang), sa = Math.sin(ang), tip = [x - ca * r * 2.4, y - sa * r * 2.4], nx = -sa, ny = ca;
  var ch = 'M' + pt(tip) + ' C ' + pt([x - ca * r * .8 + nx * r * 1.1, y - sa * r * .8 + ny * r * 1.1]) + ' ' + pt([x + ca * r + nx * r, y + sa * r + ny * r]) + ' ' + pt([x + ca * r, y + sa * r]) +
    ' C ' + pt([x + ca * r - nx * r, y + sa * r - ny * r]) + ' ' + pt([x - ca * r * .8 - nx * r * 1.1, y - sa * r * .8 - ny * r * 1.1]) + ' ' + pt(tip) + ' Z';
  return P(ch, c, ' stroke-width="1.6" opacity="' + (op || 1) + '"') + C(f1(x - nx * r * .35 + ca * r * .1), f1(y - ny * r * .35 + sa * r * .1), f1(r * .35), '#ffffff', ' opacity=".9"');
}

function dessin(){
  var d = new B.Dessin(), u = 'tetard' + (++N) + '_', nid = 0, s = '';
  function id(){ return u + (++nid); }
  function clip(chemin){ var i = id(); d.defs.push('<clipPath id="' + i + '"><path d="' + chemin + '"/></clipPath>'); return ' clip-path="url(#' + i + ')"'; }
  function rad(stops, cx, cy, r){ var i = id(); d.defs.push('<radialGradient id="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</radialGradient>'); return 'url(#' + i + ')'; }
  function lin(stops, x1, y1, x2, y2){ var i = id(); d.defs.push('<linearGradient id="' + i + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</linearGradient>'); return 'url(#' + i + ')'; }
  var flou1 = d.flou(1), flou2 = d.flou(2), flou3 = d.flou(3), flou6 = d.flou(6);
  var peau = '#56683e', dos = '#33402a', tache = '#232d1a', ventre = '#cfc88e', eau = '#2a3a52', glu = '#d8f4c0';
  /* la peau tachetée : un bruit qui fait des marbrures */
  var mb = id();
  d.defs.push('<filter id="' + mb + '" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="12" result="t"/>' +
    '<feColorMatrix in="t" type="matrix" values="0 0 0 0 .1  0 0 0 0 .14  0 0 0 0 .08  6 0 0 0 -3.5"/><feComposite in2="SourceAlpha" operator="in"/></filter>');
  var MARBRE = ' filter="url(#' + mb + ')"';

  /* ---- la flaque : eau sombre, bord mouillé, reflets de lune ---- */
  var flaque = 'M18 380 C 30 360 120 352 270 352 C 420 352 520 362 530 380 C 538 398 440 410 270 410 C 100 410 8 398 18 380 Z';
  s += F('M8 382 C 20 356 120 346 270 346 C 430 346 534 358 540 382 C 546 404 440 418 270 418 C 96 418 -2 404 8 382 Z', '#0c0a14', ' opacity=".6"');
  s += P(flaque, lin([[0, '#3e5070'], [.5, eau], [1, '#141c2c']], 0, 0, 0, 1), ' stroke-width="2.4"');
  s += '<g' + clip(flaque) + '>';
  s += F('M60 372 C 140 362 220 360 300 362 C 220 368 140 372 60 372 Z', '#9ac4ff', ' opacity=".25"');
  s += L('M300 390 L 380 390 M396 386 L 452 386 M90 394 L 150 394 M170 398 L 196 398 M420 398 L 470 398', '#bfe8ff', 1.6, ' opacity=".4"');
  /* le reflet du têtard dans l'eau, renversé et flou */
  s += '<ellipse cx="200" cy="384" rx="140" ry="14" fill="' + dos + '" opacity=".5" filter="' + flou3 + '"/>';
  s += '<ellipse cx="160" cy="386" rx="22" ry="5" fill="#e8f060" opacity=".2" filter="' + flou2 + '"/>';
  s += '</g>';

  /* ---- la queue : un muscle annelé, une grande nageoire translucide qui fouette l'air ---- */
  var qc = [[300, 288], [358, 298], [410, 286], [452, 258], [482, 220], [496, 182], [494, 150], [484, 130]];
  var qn = qc.map(function(p, i){ var k = Math.sin(i / (qc.length - 1) * Math.PI) * 12; return [p[0] - k * .9, p[1] - k]; });
  var nag = tube(qn, [146, 154, 146, 124, 96, 66, 36, 8]), mus = tube(qc, [84, 60, 44, 32, 22, 13, 6, 2]);
  s += F(nag.d, '#000', ' opacity=".25" filter="' + flou6 + '" transform="translate(-4 10)"');
  /* le bord de la nageoire, frisé */
  var R = B.rng(4), bordN = '';
  [nag.g, nag.dr].forEach(function(bd){ for(var k = 1; k < bd.length - 1; k++){ var a = bd[k], b = bd[k + 1], m = lerp(a, b, .5); bordN += 'M' + pt(a) + ' Q ' + pt([m[0] + (R() - .5) * 8, m[1] + (R() - .5) * 8]) + ' ' + pt(b) + ' '; } });
  s += P(nag.d, lin([[0, '#e8f8d0', .42], [.5, '#a8c890', .3], [1, '#5a7a58', .45]], 1, 0, 0, 1));
  s += '<g' + clip(nag.d) + '>';
  /* nervures de la nageoire, perpendiculaires au muscle */
  var nerv = '';
  for(var k2 = 0; k2 < qc.length - 1; k2++){ for(var z = 0; z < 5; z++){ var t = z / 5, c = lerp(qc[k2], qc[k2 + 1], t), g = lerp(nag.g[k2], nag.g[k2 + 1], t), dr = lerp(nag.dr[k2], nag.dr[k2 + 1], t);
    nerv += 'M' + pt(c) + ' Q ' + pt(lerp(lerp(c, g, .6), qc[Math.min(qc.length - 1, k2 + 1)], .1)) + ' ' + pt(g) + ' M' + pt(c) + ' Q ' + pt(lerp(lerp(c, dr, .6), qc[Math.min(qc.length - 1, k2 + 1)], .1)) + ' ' + pt(dr) + ' '; } }
  s += L(nerv, '#2a3a22', 1.1, ' opacity=".45"') + L(nerv, '#e8ffd8', .6, ' opacity=".25" transform="translate(1 -1)"');
  R = B.rng(9);
  for(var k3 = 0; k3 < 28; k3++){ var t3 = R() * (qc.length - 1.5), i3 = Math.floor(t3), f3 = t3 - i3, side = R() < .5 ? nag.g : nag.dr, p3 = lerp(lerp(qc[i3], qc[i3 + 1], f3), lerp(side[i3], side[i3 + 1], f3), .45 + R() * .45); s += C(f1(p3[0]), f1(p3[1]), f1(1.5 + R() * 3), tache, ' opacity=".45"'); }
  /* la lune passe à travers la nageoire */
  s += '<ellipse cx="460" cy="170" rx="40" ry="60" transform="rotate(30 460 170)" fill="#e8ffd8" opacity=".22" filter="' + flou6 + '"/>';
  s += '</g>';
  s += L(bordN, '#f0ffe0', 1.6, ' opacity=".7"');
  /* le muscle de la queue, avec ses chevrons */
  s += P(mus.d, d.g(B.sombre(peau, .12)));
  s += '<g' + clip(mus.d) + '>';
  var chev = '';
  for(var k4 = 1; k4 < 14; k4++){ var t4 = k4 / 14 * (qc.length - 1.4), i4 = Math.floor(t4), f4 = t4 - i4, c4 = lerp(qc[i4], qc[i4 + 1], f4), g4 = lerp(mus.g[i4], mus.g[i4 + 1], f4), d4 = lerp(mus.dr[i4], mus.dr[i4 + 1], f4), back = lerp(qc[i4], qc[i4 + 1], Math.max(0, f4 - .35));
    chev += 'M' + pt(g4) + ' L ' + pt(back) + ' L ' + pt(d4) + ' '; }
  s += L(chev, dos, 1.6, ' opacity=".55"');
  s += F(mus.d, '#000', MARBRE + ' opacity=".7"');
  s += L(lisse(mus.dr.slice(0, 6)), '#f4ffe8', 3, ' opacity=".35"');
  s += '</g>';
  s += L(lisse(mus.dr.slice(1, 6)), LUNE, 1.8, ' opacity=".6"');
  s += L(lisse(nag.dr.slice(2, 7)), LUNE, 1.6, ' opacity=".5"');

  /* ---- les éclaboussures que la queue envoie en fouettant ---- */
  [[506, 76, 4.2, -2.2], [526, 104, 3.2, -1.9], [470, 62, 3.4, -2.6], [444, 90, 2.4, -2.9], [528, 150, 2.6, -1.4], [490, 40, 2.2, -2.4], [454, 46, 2, -2.7]].forEach(function(g){ s += goutte(g[0], g[1], g[2], g[3], '#bfe0ff', .85); });
  s += L('M478 74 Q 490 62 506 64 M496 96 Q 510 88 524 92', '#d8f0ff', 1.2, ' opacity=".5"');

  /* ---- la petite patte arrière du fond, qui pousse ---- */
  s += P(tube([[300, 330], [326, 344], [318, 364]], [16, 11, 8]).d, d.g(B.sombre(peau, .35)));
  s += P('M318 360 C 330 366 344 370 356 372 C 346 376 330 374 314 368 Z', d.g(B.sombre(peau, .3)), ' stroke-width="2"');

  /* ---- le corps : gros, luisant, tacheté, le ventre clair ---- */
  var corps = 'M40 226 C 56 198 104 184 160 180 C 220 174 276 186 310 218 C 336 244 342 292 322 328 C 302 360 250 374 194 372 C 148 370 104 364 78 358 C 64 356 54 356 48 356 C 90 346 126 322 152 290 C 120 252 76 234 40 226 Z';
  s += F(corps, '#000', ' opacity=".3" filter="' + flou6 + '" transform="translate(-4 8)"');
  /* l'intérieur de la gueule (derrière) */
  var gueule = 'M38 226 C 78 234 124 254 156 290 C 126 324 90 348 46 358 C 26 330 24 260 38 226 Z';
  s += P(gueule, rad([[0, '#0a0208'], [.5, '#2a0a1e'], [1, '#5a1a36']], .85, .5, .8));
  s += F('M40 336 C 70 306 110 294 146 294 C 120 318 86 342 50 352 Z', '#a8506a') + L('M58 330 C 86 310 114 300 136 298', '#d07890', 1.2, ' opacity=".6"') + F('M64 252 C 96 260 126 274 146 290 C 118 282 90 274 64 266 Z', '#000', ' opacity=".4"');
  s += P(corps, d.g(peau));
  s += '<g' + clip(corps) + '>';
  s += F('M60 322 C 110 352 180 372 260 360 C 300 352 324 330 330 300 C 320 340 270 372 196 374 C 130 372 84 352 60 322 Z', ventre, ' opacity=".9"');
  s += F('M70 320 C 120 346 200 360 270 348 C 230 350 140 348 70 320 Z', '#fff8c8', ' opacity=".35"');
  s += F(corps, '#000', MARBRE + ' opacity=".5"');
  R = B.rng(31);
  for(var k5 = 0; k5 < 34; k5++){ var x5 = 80 + R() * 240, y5 = 196 + R() * 120; if(y5 > 330 - (x5 - 80) * .05) continue; s += '<ellipse cx="' + f1(x5) + '" cy="' + f1(y5) + '" rx="' + f1(2 + R() * 5) + '" ry="' + f1(1.5 + R() * 3.5) + '" fill="' + tache + '" opacity=".55"/>'; }
  /* petites verrues claires */
  for(var k6 = 0; k6 < 30; k6++){ var x6 = 90 + R() * 220, y6 = 200 + R() * 110; s += C(f1(x6), f1(y6), f1(1 + R() * 1.4), '#c8d8a0', ' opacity=".4"'); }
  /* la ligne de points sur le flanc */
  for(var k7 = 0; k7 < 9; k7++){ var x7 = 150 + k7 * 18, y7 = 290 - Math.sin(k7 / 8 * Math.PI) * 10 + k7 * 1.5; s += C(x7, f1(y7), 2.2, '#e8f0c0', ' opacity=".7"') + C(x7 + .6, f1(y7 + .8), 1, tache, ' opacity=".5"'); }
  /* l'ombre sous le corps, le bombé */
  s += F(corps, rad([[0, '#000', 0], [.7, '#000', 0], [1, '#000', .45]], .52, .4, .62));
  /* les reflets gluants : de longues taches blanches, nettes */
  s += F('M120 202 C 160 190 220 188 262 200 C 220 196 168 198 124 210 Z', '#f8fff0', ' opacity=".75"');
  s += F('M282 214 C 300 226 314 246 318 268 C 308 250 296 234 280 222 Z', '#f8fff0', ' opacity=".6"');
  s += '<ellipse cx="236" cy="214" rx="46" ry="14" transform="rotate(-6 236 214)" fill="#ffffff" opacity=".18" filter="' + flou3 + '"/>';
  s += C(210, 236, 3, '#ffffff', ' opacity=".7"') + C(258, 258, 2.2, '#ffffff', ' opacity=".6"') + C(176, 248, 1.8, '#ffffff', ' opacity=".6"') + C(294, 290, 2, '#ffffff', ' opacity=".55"');
  s += '</g>';
  s += L('M164 182 C 222 176 276 190 308 220 C 330 244 338 272 334 300', LUNE, 2.6, ' opacity=".6"');
  s += P('M206 370 C 204 376 208 380 205 386 C 209 390 214 388 213 383 C 211 378 212 374 214 370 Z', glu, ' stroke-width="1.2" opacity=".6"');
  [[118, 236, 3], [196, 206, 2.4], [300, 252, 2.6], [232, 330, 2.2]].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + glu + '" fill-opacity=".25" stroke="#f4ffe8" stroke-width="1" opacity=".8"/>' + C(b[0] - b[2] * .35, b[1] - b[2] * .35, b[2] * .3, '#ffffff'); });
  /* le spiracle, un petit trou par où il respire */
  s += '<ellipse cx="268" cy="304" rx="5" ry="3.6" fill="#141a0e" stroke="' + O + '" stroke-width="1.6"/>' + L('M263 302 Q 268 299 273 302', '#e8f0c0', 1, ' opacity=".6"');

  /* ---- les babines : bourrelets autour de la gueule, rangées de petites dents ---- */
  var lH = [[34, 230], [62, 234], [96, 246], [128, 264], [154, 290]], lB = [[46, 356], [76, 350], [108, 334], [134, 314], [154, 292]];
  var levreH = tube(lH, [13, 11, 9, 7, 5]).d, levreB = tube(lB, [13, 11, 9, 7, 5]).d;
  s += P(levreH, d.g('#8a9a62'), ' stroke-width="2.4"') + P(levreB, d.g('#8a9a62'), ' stroke-width="2.4"');
  s += L(lisse(lH.map(function(p){ return [p[0], p[1] - 3]; }).slice(0, 4)), '#f0ffd8', 1.6, ' opacity=".6"') + L(lisse(lB.map(function(p){ return [p[0], p[1] - 2]; }).slice(0, 4)), '#f0ffd8', 1, ' opacity=".35"');
  var dents = '', dents2 = '';
  function surCourbe(c, tt){ var x = tt * (c.length - 1), i = Math.min(c.length - 2, Math.floor(x)); return lerp(c[i], c[i + 1], x - i); }
  for(var k8 = 0; k8 < 15; k8++){ var t8 = k8 / 15 * .92, a8 = surCourbe(lH, t8), b8 = surCourbe(lB, t8), h8 = 7.5 - t8 * 4.5;
    a8 = [a8[0] + 2, a8[1] + 5 - t8 * 2]; b8 = [b8[0] + 2, b8[1] - 5 + t8 * 2];
    dents += 'M' + f1(a8[0] - 2.4) + ' ' + f1(a8[1]) + ' L ' + f1(a8[0] + .6) + ' ' + f1(a8[1] + h8) + ' L ' + f1(a8[0] + 3) + ' ' + f1(a8[1] + .8) + ' Z ';
    dents += 'M' + f1(b8[0] - 2.4) + ' ' + f1(b8[1]) + ' L ' + f1(b8[0] + .2) + ' ' + f1(b8[1] - h8) + ' L ' + f1(b8[0] + 3) + ' ' + f1(b8[1] - .8) + ' Z ';
    if(k8 % 2 === 0 && k8 < 12){ var a9 = [a8[0] + 6, a8[1] + 10], b9 = [b8[0] + 7, b8[1] - 10]; dents2 += 'M' + f1(a9[0] - 1.6) + ' ' + f1(a9[1]) + ' L ' + f1(a9[0]) + ' ' + f1(a9[1] + h8 * .6) + ' L ' + f1(a9[0] + 1.8) + ' ' + f1(a9[1]) + ' Z M' + f1(b9[0] - 1.6) + ' ' + f1(b9[1]) + ' L ' + f1(b9[0]) + ' ' + f1(b9[1] - h8 * .6) + ' L ' + f1(b9[0] + 1.8) + ' ' + f1(b9[1]) + ' Z '; } }
  s += P(dents2, '#cfc6a4', ' stroke-width="1"') + P(dents, '#f6f2dc', ' stroke-width="1.2"');
  /* les filets de bave entre les mâchoires, la bave qui pend */
  s += L('M58 242 C 62 280 56 316 62 346 M92 254 C 96 284 94 312 98 334 M122 272 C 124 288 123 302 126 314', glu, 1.6, ' opacity=".55"');
  s += C(59, 296, 2.8, glu, ' opacity=".6"') + C(95, 294, 2.2, glu, ' opacity=".55"');
  s += P('M66 358 C 64 364 68 368 64 374 C 68 380 74 378 74 372 C 72 366 72 362 74 356 Z', glu, ' stroke-width="1.4" opacity=".7"') + C(67, 374, 1.4, '#ffffff', ' opacity=".9"');

  /* ---- les yeux globuleux, sur le dessus de la tête ---- */
  function oeil(cx, cy, r, loin){
    var s = '';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 2.1) + '" fill="' + d.halo('#f8ff9a', '#c8e020') + '" opacity="' + (loin ? .3 : .45) + '"/>';
    s += P('M' + (cx - r * 1.35) + ' ' + (cy + r * .9) + ' C ' + (cx - r * 1.4) + ' ' + (cy - r * 1.1) + ' ' + (cx + r * 1.3) + ' ' + (cy - r * 1.3) + ' ' + (cx + r * 1.35) + ' ' + (cy + r * .8) + ' Z', d.g(loin ? B.sombre(peau, .2) : peau));
    var ir = rad([[0, '#fffbc0'], [.45, '#e8d030'], [.85, '#c87018'], [1, '#6a3008']], .42, .4, .62);
    s += '<circle cx="' + cx + '" cy="' + (cy - r * .1) + '" r="' + r + '" fill="' + ir + '" stroke="' + O + '" stroke-width="2.6"/>';
    s += '<ellipse cx="' + (cx - r * .2) + '" cy="' + (cy - r * .05) + '" rx="' + (r * .62) + '" ry="' + (r * .2) + '" fill="#0a0806"/>';
    s += L('M' + (cx - r * .7) + ' ' + (cy + r * .35) + ' Q ' + cx + ' ' + (cy + r * .55) + ' ' + (cx + r * .7) + ' ' + (cy + r * .3), '#8a4a10', 1.2, ' opacity=".6"');
    s += C(cx - r * .38, cy - r * .48, r * .26, '#ffffff') + C(cx + r * .36, cy + r * .22, r * .1, '#ffffff', ' opacity=".7"');
    /* la paupière du haut, gluante */
    s += P('M' + (cx - r * 1.2) + ' ' + (cy - r * .2) + ' C ' + (cx - r * .9) + ' ' + (cy - r * 1.35) + ' ' + (cx + r * 1.1) + ' ' + (cy - r * 1.4) + ' ' + (cx + r * 1.25) + ' ' + (cy - r * .15) + ' C ' + (cx + r * .6) + ' ' + (cy - r * .7) + ' ' + (cx - r * .6) + ' ' + (cy - r * .75) + ' ' + (cx - r * 1.2) + ' ' + (cy - r * .2) + ' Z', d.g(loin ? B.sombre(peau, .25) : B.clair(peau, .05)), ' stroke-width="2.4"');
    s += L('M' + (cx - r * .6) + ' ' + (cy - r * 1.1) + ' Q ' + cx + ' ' + (cy - r * 1.32) + ' ' + (cx + r * .7) + ' ' + (cy - r * 1.05), '#f4ffe8', 1.6, ' opacity=".7"');
    return s;
  }
  s += oeil(214, 176, 15, true) + oeil(146, 190, 20, false);

  /* ---- la petite patte arrière proche, qui pousse à la base de la queue : cuisse, jambe repliée, pied palmé ---- */
  var cuisse = tube([[318, 314], [348, 334], [338, 358]], [26, 18, 11]).d;
  s += P(cuisse, d.g(peau)) + L('M322 310 C 336 314 350 324 354 338', LUNE, 1.6, ' opacity=".5"');
  s += C(346, 334, 3, '#c8d8a0', ' opacity=".35"');
  var pied = 'M334 354 C 346 356 360 360 378 362 L 374 366 L 384 368 L 374 372 L 382 378 L 368 376 L 370 384 L 358 376 C 348 372 338 366 330 362 Z';
  s += P(pied, lin([[0, '#c0d098', .92], [1, '#5a6a40', .92]], 1, 0, 0, 1), ' stroke-width="2.2"') + L('M336 360 L 380 366 M336 362 L 380 375 M336 364 L 366 382', '#3a4a2a', 1, ' opacity=".5"');
  [[379, 365], [383, 373], [369, 383]].forEach(function(o){ s += C(o[0], o[1], 2.2, '#d8e8b0', ' stroke="' + O + '" stroke-width="1.2"'); });
  /* et deux bourgeons de pattes avant, sous la gorge */
  s += P('M168 352 C 164 362 160 370 152 374 C 162 376 172 370 176 360 Z', d.g(B.clair(peau, .1)), ' stroke-width="2.2"');

  /* ---- l'eau devant : le corps trempe, les rides, la couronne d'éclaboussures ---- */
  var devant = 'M18 380 C 40 370 120 366 270 366 C 420 366 520 372 530 380 C 538 398 440 410 270 410 C 100 410 8 398 18 380 Z';
  s += F(devant, lin([[0, '#6a84a8', .7], [.4, '#2a3a52', .85], [1, '#141c2c', .95]], 0, 0, 0, 1));
  s += L('M30 382 C 80 372 200 368 330 370 C 420 372 500 376 526 382', '#bfe8ff', 1.8, ' opacity=".55"');
  s += L('M60 386 C 120 380 220 378 300 380 M80 394 C 140 390 240 388 320 392 M340 386 C 400 384 460 386 500 390', '#9ac4ff', 1.2, ' opacity=".35"');
  /* la ligne où l'eau touche le corps, les rides qui s'éloignent */
  s += L('M58 370 C 120 366 220 368 330 370', '#e8f6ff', 2.2, ' opacity=".7"');
  s += L('M30 376 C 40 368 70 364 100 364 M360 368 C 400 368 430 372 446 378 M14 384 C 20 374 50 368 80 366 M410 374 C 450 374 486 378 500 384', '#bfe8ff', 1.4, ' opacity=".45"');
  /* la couronne d'éclaboussures sous la gueule : un voile d'eau translucide qui se casse en perles */
  var couronne = 'M18 378 C 16 366 20 354 26 348 C 28 358 32 364 36 368 C 36 356 42 346 48 342 C 50 354 52 362 56 366 C 58 356 64 350 72 348 C 70 358 70 366 72 374 C 56 380 34 382 18 378 Z';
  s += P(couronne, lin([[0, '#e8f6ff', .75], [1, '#5a8ac0', .3]], 0, 0, 0, 1), ' stroke-width="1.4"') + L('M22 360 C 26 354 28 352 26 348 M40 356 C 44 348 46 344 48 342 M60 360 C 64 352 68 350 72 348', '#ffffff', 1.2, ' opacity=".8"');
  [[24, 340, 2.6], [48, 333, 2.8], [74, 340, 2.2], [36, 326, 1.8], [62, 324, 1.6]].forEach(function(g){ s += C(g[0], g[1], g[2], '#d8f0ff', ' stroke="' + O + '" stroke-width="1.2"') + C(g[0] - g[2] * .35, g[1] - g[2] * .35, g[2] * .35, '#ffffff'); });
  s += goutte(30, 330, 2.4, -1.9, '#bfe0ff', .85) + goutte(100, 340, 2, -1.2, '#bfe0ff', .85);
  /* des bulles qui remontent */
  [[220, 392, 4], [236, 386, 2.6], [330, 394, 3.4], [120, 396, 2.4], [404, 390, 2]].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="none" stroke="#d8f0ff" stroke-width="1.2" opacity=".7"/>' + C(b[0] - b[2] * .35, b[1] - b[2] * .35, b[2] * .3, '#ffffff', ' opacity=".8"'); });

  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.tetard = {nom:'Têtard du puits', rang:'monstre', pv:15, lieu:'Le grand bassin · avec Bourbe',
  livre:'« Petit, gluant et toujours affamé. Un seul coup suffit. »',
  combo:['+ Un seul coup suffit', '! Arrive quand Bourbe plonge'], dessin:dessin};
})();
