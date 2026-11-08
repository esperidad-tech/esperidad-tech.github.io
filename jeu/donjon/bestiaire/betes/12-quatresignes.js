/* Le Gardien des quatre signes : la grande statue des Fondateurs qui s'éveille (l'œil, le chaudron, l'étoile s'allument ; la lyre attend le Barde) */
(function(){
var B = window.BT, O = B.O, LUNE = B.LUNE, C = B.C, F = B.F, L = B.L, T2 = B.T, clair = B.clair, sombre = B.sombre, mix = B.mix;
var PFX = 'qs' + Math.floor(Math.random() * 1e6) + '_', U = 0;
function nid(){ return PFX + (++U); }
function f1(v){ return (+v).toFixed(1); }
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function stops(s){ return s.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2] != null ? ' stop-opacity="' + t[2] + '"' : '') + '/>'; }).join(''); }
function lin(d, x1, y1, x2, y2, s){ var i = nid(); d.defs.push('<linearGradient id="' + i + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops(s) + '</linearGradient>'); return 'url(#' + i + ')'; }
function rad(d, cx, cy, r, s){ var i = nid(); d.defs.push('<radialGradient id="' + i + '" gradientUnits="userSpaceOnUse" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops(s) + '</radialGradient>'); return 'url(#' + i + ')'; }
function clip(d, chemins){ var i = nid(); d.defs.push('<clipPath id="' + i + '">' + chemins.map(function(c){ return '<path d="' + c + '"/>'; }).join('') + '</clipPath>'); return ' clip-path="url(#' + i + ')"'; }
function G(a, s){ return '<g' + a + '>' + s + '</g>'; }
function lisse(pts, ferme){
  var m = function(a, b){ return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }, s;
  if(ferme){
    var n = pts.length, d0 = m(pts[n - 1], pts[0]); s = 'M' + f1(d0[0]) + ' ' + f1(d0[1]);
    for(var i = 0; i < n; i++){ var q = m(pts[i], pts[(i + 1) % n]); s += ' Q ' + f1(pts[i][0]) + ' ' + f1(pts[i][1]) + ' ' + f1(q[0]) + ' ' + f1(q[1]); }
    return s + ' Z';
  }
  s = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]);
  for(var j = 1; j < pts.length - 1; j++){ var q2 = m(pts[j], pts[j + 1]); s += ' Q ' + f1(pts[j][0]) + ' ' + f1(pts[j][1]) + ' ' + f1(q2[0]) + ' ' + f1(q2[1]); }
  var z = pts[pts.length - 1]; return s + ' L ' + f1(z[0]) + ' ' + f1(z[1]);
}
function ruban(pts, w0, w1){
  var g = [], dr = [], n = pts.length;
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
    g.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); dr.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]);
  }
  return lisse(g.concat(dr.reverse()), true);
}
function tache(cx, cy, rx, ry, R, k){ var p = []; k = k || 7; for(var i = 0; i < k; i++){ var a = i / k * Math.PI * 2 + R() * .4, r = .65 + R() * .5; p.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } return lisse(p, true); }
/* une fissure : ligne brisée sombre, lèvre claire du côté de la lune, petites branches */
function fissure(x, y, pas, ang, n, R, larg){
  var p = [[x, y]], a = ang, s = '', br = '';
  for(var i = 0; i < n; i++){ a += (R() - .5) * .9; x += Math.cos(a) * pas * (.6 + R() * .8); y += Math.sin(a) * pas * (.6 + R() * .8); p.push([x, y]);
    if(R() < .3){ var b = a + (R() < .5 ? 1 : -1) * (.6 + R() * .6), bx = x + Math.cos(b) * pas * 1.4, by = y + Math.sin(b) * pas * 1.4; br += 'M' + f1(x) + ' ' + f1(y) + ' L ' + f1(bx) + ' ' + f1(by) + ' '; } }
  var d = 'M' + p.map(function(q){ return f1(q[0]) + ' ' + f1(q[1]); }).join(' L ');
  s += L(T2(d, 1.2, -1.2), '#e8e8f0', (larg || 2) * .7, ' opacity=".35"') + L(d, '#120c18', larg || 2) + (br ? L(br, '#120c18', (larg || 2) * .6, ' opacity=".85"') : '');
  return s;
}
/* grain de la pierre : piqûres, éclats clairs, coups de ciseau */
function grainPierre(x0, y0, w, h, n, R, c){
  var s = '';
  for(var i = 0; i < n; i++){ var x = x0 + R() * w, y = y0 + R() * h, r = .5 + R() * 1.5, k = R(); s += C(f1(x), f1(y), f1(r), k < .5 ? sombre(c, .55) : clair(c, .5), ' opacity="' + f1(.25 + R() * .4) + '"'); }
  for(var j = 0; j < n / 12; j++){ var cx = x0 + R() * w, cy = y0 + R() * h, a = -.6 + R() * .3; for(var k2 = 0; k2 < 3; k2++) s += L('M' + f1(cx + k2 * 3) + ' ' + f1(cy) + ' l ' + f1(Math.cos(a) * 7) + ' ' + f1(Math.sin(a) * 7), sombre(c, .4), .9, ' opacity=".35"'); }
  for(var k = 0; k < n / 16; k++){ var px = x0 + R() * w, py = y0 + R() * h, pr = 1.5 + R() * 2.5; s += C(f1(px), f1(py), f1(pr), sombre(c, .5), ' opacity=".45"') + L('M' + f1(px - pr * .7) + ' ' + f1(py + pr * .5) + ' A ' + f1(pr) + ' ' + f1(pr) + ' 0 0 0 ' + f1(px + pr * .7) + ' ' + f1(py + pr * .5), clair(c, .5), .9, ' opacity=".5"'); }
  return s;
}
/* lichen : petites rosettes pâles ou orangées */
function lichen(cx, cy, r, R, c){
  var s = '';
  for(var i = 0; i < 9; i++){ var a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r; s += C(f1(cx + Math.cos(a) * rr), f1(cy + Math.sin(a) * rr * .8), f1(1 + R() * r * .3), mix(c, '#fff8d0', R() * .4), ' opacity=".85"'); }
  return s + C(cx, cy, f1(r * .3), sombre(c, .3), ' opacity=".6"');
}
function mousse(cx, cy, rx, ry, n, seed){
  var Rm = B.rng(seed), m = Pw(tache(cx, cy + ry * .3, rx * 1.05, ry * 1.1 + 2, Rm, 9), '#24401c', 1.3, ' stroke-opacity=".7"');
  for(var i = 0; i < n * 3; i++){ var a = Rm() * Math.PI * 2, r = Math.sqrt(Rm()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, hh = (cy - y) / (ry || 1), c = mix('#365e24', '#b8dc70', Math.max(0, Math.min(1, .3 + hh * .45 + Rm() * .3)));
    m += C(f1(x), f1(y), f1(.9 + Rm() * 1.6), c); if(Rm() < .3) m += L('M' + f1(x) + ' ' + f1(y) + ' l ' + f1(Rm() * 3 - 1.5) + ' ' + f1(-2 - Rm() * 3), c, 1); }
  for(var j = 0; j < n / 2; j++){ var a2 = Rm() * Math.PI * 2, r2 = Math.sqrt(Rm()) * .7; m += C(f1(cx + Math.cos(a2) * rx * r2), f1(cy + Math.sin(a2) * ry * r2 - ry * .3), .8, '#e4f6b0', ' opacity=".85"'); }
  return m;
}
function eclat(x, y, r, ang, c, R){
  var p = []; for(var i = 0; i < 5; i++){ var a = ang + i / 5 * Math.PI * 2 + R() * .5, rr = r * (.6 + R() * .6); p.push(f1(x + Math.cos(a) * rr) + ' ' + f1(y + Math.sin(a) * rr)); }
  return Pw('M' + p.join(' L ') + ' Z', c, 1.6) + L('M' + p[0] + ' L ' + p[1], '#f0f0f8', 1, ' opacity=".5"');
}

function linBox(d, s){ var i = nid(); d.defs.push('<linearGradient id="' + i + '" x1="1" y1="0" x2="0" y2="1">' + stops(s) + '</linearGradient>'); return 'url(#' + i + ')'; }
function coulure(x, y, lg, ep, op){ return L('M' + f1(x) + ' ' + f1(y) + ' C ' + f1(x + ep * .6) + ' ' + f1(y + lg * .3) + ' ' + f1(x - ep * .6) + ' ' + f1(y + lg * .6) + ' ' + f1(x + ep * .3) + ' ' + f1(y + lg), '#14101c', ep, ' opacity="' + (op || .3) + '" style="filter:blur(1.4px)"') + C(f1(x + ep * .3), f1(y + lg), f1(ep * .45), '#14101c', ' opacity="' + (op || .3) + '"'); }
/* le reflet d'un chemin autour de l'axe du géant (x = 265) : sans arcs, seulement M L C Q */
function miroir(d){ return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function(m, a, b){ return f1(530 - a) + ' ' + b; }); }
/* une rune : un bâton et des branches, six formes */
function rune(x, y, h, k){
  var w = h * .45, a = function(dx, dy){ return f1(x + dx * w) + ' ' + f1(y + dy * h / 2); };
  var formes = [
    'M' + a(0, -1) + ' L ' + a(0, 1) + ' M' + a(0, -1) + ' L ' + a(1, -.4) + ' L ' + a(0, .2),
    'M' + a(0, -1) + ' L ' + a(0, 1) + ' M' + a(0, -.5) + ' L ' + a(1, -1) + ' M' + a(0, 0) + ' L ' + a(1, -.5),
    'M' + a(-.6, -1) + ' L ' + a(.6, 1) + ' M' + a(.6, -1) + ' L ' + a(-.6, 1),
    'M' + a(-.5, 1) + ' L ' + a(-.5, -1) + ' L ' + a(.5, -.3) + ' L ' + a(.5, 1),
    'M' + a(0, -1) + ' L ' + a(0, 1) + ' M' + a(-.7, -.2) + ' L ' + a(0, .3) + ' L ' + a(.7, -.2),
    'M' + a(-.6, -1) + ' L ' + a(.6, -.2) + ' L ' + a(-.6, .5) + ' M' + a(0, -1) + ' L ' + a(0, 1)
  ];
  return formes[k % formes.length];
}
function runeAllumee(dd, cyan, flou, f){ return L(dd, cyan, 5 * (f || 1), ' opacity=".45" filter="' + flou + '"') + L(dd, '#0c2a2e', 2.2 * (f || 1)) + L(dd, cyan, 1.3 * (f || 1)); }
function runeEteinte(dd, pierre){ return L(T2(dd, .8, .8), clair(pierre, .45), 1, ' opacity=".5"') + L(dd, sombre(pierre, .6), 1.6, ' opacity=".8"'); }

function dessin(){
  var d = new B.Dessin(), s = '', R = B.rng(19);
  var pierre = '#918a79', manteauC = '#7a7466', porteC = '#5c586a', cyan = '#6ff4ff';
  var gPierre = lin(d, 400, 30, 140, 380, [[0, clair(pierre, .32)], [.45, pierre], [1, sombre(pierre, .55)]]);
  var gManteau = lin(d, 440, 110, 90, 370, [[0, clair(manteauC, .15)], [.5, sombre(manteauC, .15)], [1, sombre(manteauC, .65)]]);
  var haloC = d.halo('#eaffff', '#2ad8ff');
  var flou2 = d.flou(2), flou3 = d.flou(3), flou6 = d.flou(6), flou12 = d.flou(12);

  /* ===== la porte des Fondateurs : l'arc, les montants, le noir derrière ===== */
  var ouverture = 'M143 372 L 143 150 C 143 80 198 28 265 28 C 332 28 387 80 387 150 L 387 372 Z';
  s += Pw('M110 380 L 110 150 C 110 62 180 -6 265 -6 C 350 -6 420 62 420 150 L 420 380 Z', lin(d, 420, 0, 110, 380, [[0, clair(porteC, .2)], [.5, porteC], [1, sombre(porteC, .55)]]), 3);
  s += Pw(ouverture, rad(d, 265, 200, 220, [[0, '#123a40'], [.45, '#0a1c22'], [1, '#04080c']]), 3);
  s += '<ellipse cx="265" cy="230" rx="100" ry="120" fill="' + cyan + '" opacity=".08" filter="' + flou12 + '"/>';
  /* les claveaux de l'arc, les blocs des montants, les runes gravées */
  var tP = '';
  for(var k = 0; k <= 10; k++){ var a = Math.PI + k / 10 * Math.PI, c1 = [265 + Math.cos(a) * 122, 150 + Math.sin(a) * 122 * 1.0], c2 = [265 + Math.cos(a) * 155, 150 + Math.sin(a) * 156];
    if(k > 0 && k < 10) tP += L('M' + f1(c1[0]) + ' ' + f1(c1[1]) + ' L ' + f1(c2[0]) + ' ' + f1(c2[1]), '#1a1622', 2, ' opacity=".8"'); }
  [190, 232, 274, 316, 356].forEach(function(y){ tP += L('M110 ' + y + ' L 143 ' + y + ' M387 ' + y + ' L 420 ' + y, '#1a1622', 2, ' opacity=".8"'); });
  tP += grainPierre(108, -6, 316, 386, 160, R, porteC);
  s += G(clip(d, ['M110 380 L 110 150 C 110 62 180 -6 265 -6 C 350 -6 420 62 420 150 L 420 380 Z M143 372 L 387 372 L 387 150 C 387 80 332 28 265 28 C 198 28 143 80 143 150 Z']), tP);
  s += L('M420 380 L 420 150 C 420 62 350 -6 265 -6', LUNE, 2.2, ' opacity=".45"');
  var kr = 0;
  [[126, 206], [126, 248], [126, 290], [126, 332], [404, 206], [404, 248], [404, 290], [404, 332], [124, 120], [406, 120], [160, 54], [370, 54]].forEach(function(p, i){
    var dd = rune(p[0], p[1], 16, kr++); s += i % 3 === 1 ? runeEteinte(dd, porteC) : runeAllumee(dd, cyan, flou2, .9);
  });
  s += mousse(118, 376, 14, 3, 10, 3) + mousse(414, 376, 12, 3, 8, 5);

  /* ===== le manteau, qui tombe derrière en lourds plis ===== */
  var manteau = 'M156 118 C 124 160 104 260 92 368 L 438 368 C 426 260 406 160 374 118 Z';
  s += Pw(manteau, gManteau, 3);
  var tm = '';
  [[118, 200, 104, 366], [132, 180, 124, 366], [404, 190, 414, 366], [392, 170, 400, 366]].forEach(function(p, i){
    tm += L('M' + p[0] + ' ' + p[1] + ' C ' + (p[0] - 4) + ' ' + (p[1] + 60) + ' ' + (p[2] + 6) + ' ' + (p[3] - 80) + ' ' + p[2] + ' ' + p[3], '#14101c', 2.2, ' opacity=".5"');
    tm += L('M' + (p[0] + 5) + ' ' + p[1] + ' C ' + (p[0] + 1) + ' ' + (p[1] + 60) + ' ' + (p[2] + 11) + ' ' + (p[3] - 80) + ' ' + (p[2] + 5) + ' ' + p[3], clair(manteauC, .4), 1.2, ' opacity=".35"');
  });
  tm += grainPierre(90, 110, 350, 260, 90, R, manteauC);
  s += G(clip(d, [manteau]), tm);
  s += L('M376 122 C 404 164 424 260 436 364', LUNE, 2, ' opacity=".45"');

  /* ===== la robe : plis droits jusqu'au socle, bordure gravée de runes ===== */
  var robe = 'M190 246 C 176 290 164 330 152 368 L 378 368 C 366 330 354 290 340 246 Z';
  s += Pw(robe, gPierre, 3);
  var tr = grainPierre(150, 246, 230, 122, 70, R, pierre);
  [[204, 158], [222, 182], [244, 210], [292, 304], [314, 340], [334, 370]].forEach(function(p, i){
    var x0 = p[0] + (i < 3 ? 0 : 0), xb = p[1];
    tr += F('M' + x0 + ' 256 C ' + (x0 - 2) + ' 300 ' + (xb + 4) + ' 330 ' + xb + ' 368 L ' + (xb + 10) + ' 368 C ' + (xb + 12) + ' 330 ' + (x0 + 6) + ' 300 ' + (x0 + 8) + ' 256 Z', '#14101c', ' opacity=".28"');
    tr += L('M' + (x0 + 9) + ' 258 C ' + (x0 + 8) + ' 300 ' + (xb + 14) + ' 330 ' + (xb + 12) + ' 368', clair(pierre, .45), 1.4, ' opacity=".45"');
  });
  [[214, 176], [230, 196], [300, 334], [316, 354]].forEach(function(p){ tr += L('M' + p[0] + ' 262 C ' + (p[0] - 2) + ' 300 ' + (p[1] + 2) + ' 330 ' + p[1] + ' 352', '#14101c', 1.6, ' opacity=".35"'); });
  tr += '<rect x="150" y="240" width="230" height="130" fill="' + lin(d, 380, 0, 150, 0, [[0, '#ffffff', .1], [.5, '#ffffff', 0], [1, '#0a0612', .45]]) + '"/>';
  s += G(clip(d, [robe]), tr);
  /* la bordure du bas de la robe */
  s += Pw('M156 352 C 220 358 310 358 374 352 L 378 368 L 152 368 Z', lin(d, 0, 352, 0, 368, [[0, clair(pierre, .2)], [1, sombre(pierre, .35)]]), 2.4);
  for(var k2 = 0; k2 < 12; k2++){ var rx = 166 + k2 * 17.5, dd = rune(rx, 361, 9, k2 * 2 + 1); s += (k2 % 4 === 2 ? runeEteinte(dd, pierre) : runeAllumee(dd, cyan, flou2, .7)); }
  s += L('M340 248 C 354 290 366 330 376 366', LUNE, 2, ' opacity=".45"');

  /* ===== le socle, sa fente où l'épée est plantée ===== */
  s += Pw('M100 368 L 430 368 L 440 376 L 90 376 Z', lin(d, 440, 368, 90, 376, [[0, clair(pierre, .4)], [1, clair(pierre, .05)]]), 2.4);
  s += Pw('M90 376 L 440 376 L 440 400 L 90 400 Z', lin(d, 440, 376, 90, 400, [[0, sombre(pierre, .1)], [1, sombre(pierre, .55)]]), 2.6);
  s += G(clip(d, ['M90 376 L 440 376 L 440 400 L 90 400 Z']), grainPierre(90, 376, 350, 24, 60, R, pierre) + [150, 220, 310, 380].map(function(x){ return L('M' + x + ' 377 L ' + (x + 2) + ' 400', '#1a1622', 2, ' opacity=".7"'); }).join(''));
  [[118, 388], [186, 388], [262, 388], [344, 388], [412, 388]].forEach(function(p, i){ var dd = rune(p[0], p[1], 12, i + 3); s += i === 3 ? runeEteinte(dd, pierre) : runeAllumee(dd, cyan, flou2, .8); });
  s += L('M100 368 L 430 368', LUNE, 1.4, ' opacity=".4"') + fissure(196, 376, 5, 1.4, 5, R, 1.8) + fissure(372, 376, 5, 1.7, 4, R, 1.6);
  s += mousse(104, 372, 14, 3, 10, 7) + mousse(424, 372, 16, 3, 10, 9);

  /* ===== le torse : plastron, épaulières, ceinture ===== */
  var torse = 'M178 120 C 202 110 232 108 265 108 C 298 108 328 110 352 120 C 362 160 354 210 342 250 L 188 250 C 176 210 168 160 178 120 Z';
  s += Pw(torse, gPierre, 3);
  var tt = grainPierre(170, 106, 190, 146, 80, R, pierre);
  tt += L('M265 112 L 265 140 M265 228 L 265 248', sombre(pierre, .5), 2, ' opacity=".55"');
  tt += L('M204 150 C 214 180 214 214 206 246 M326 150 C 316 180 316 214 324 246', sombre(pierre, .5), 1.6, ' opacity=".35"') + F('M178 120 C 170 160 176 210 188 250 L 200 250 C 192 210 188 160 194 122 Z', '#0a0612', ' opacity=".25"');
  for(var kr2 = 0; kr2 < 20; kr2++){ var ar = -Math.PI / 2 + (kr2 - 9.5) / 20 * Math.PI * 2; tt += L('M' + f1(265 + Math.cos(ar) * 50) + ' ' + f1(192 + Math.sin(ar) * 50) + ' L ' + f1(265 + Math.cos(ar) * (kr2 % 2 ? 62 : 72)) + ' ' + f1(192 + Math.sin(ar) * (kr2 % 2 ? 62 : 72)), sombre(pierre, .5), 1.6, ' opacity=".5"') + L('M' + f1(266 + Math.cos(ar) * 50) + ' ' + f1(191 + Math.sin(ar) * 50) + ' L ' + f1(266 + Math.cos(ar) * (kr2 % 2 ? 62 : 72)) + ' ' + f1(191 + Math.sin(ar) * (kr2 % 2 ? 62 : 72)), clair(pierre, .45), .8, ' opacity=".35"'); }
  tt += '<rect x="170" y="100" width="190" height="160" fill="' + rad(d, 300, 150, 140, [[0, '#ffffff', .12], [.5, '#ffffff', 0], [1, '#0a0612', .45]]) + '"/>';
  tt += '<ellipse cx="262" cy="150" rx="44" ry="14" fill="#0a0612" opacity=".4" filter="' + flou6 + '"/>' + '<ellipse cx="190" cy="150" rx="20" ry="40" fill="#0a0612" opacity=".35" filter="' + flou6 + '"/>' + '<ellipse cx="340" cy="150" rx="16" ry="36" fill="#0a0612" opacity=".25" filter="' + flou6 + '"/>';
  tt += '<circle cx="265" cy="192" r="80" fill="' + cyan + '" opacity=".12" filter="' + flou12 + '"/>';
  s += G(clip(d, [torse]), tt);
  s += L('M330 116 C 350 122 360 160 350 210', LUNE, 2, ' opacity=".5"');
  /* la chaîne du manteau, tendue entre deux fermoirs */
  for(var kc = 0; kc <= 12; kc++){ var tc2 = kc / 12, cx2 = 204 + 122 * tc2, cy2 = 140 + Math.sin(tc2 * Math.PI) * 16; s += '<ellipse cx="' + f1(cx2) + '" cy="' + f1(cy2) + '" rx="' + (kc % 2 ? 4 : 5) + '" ry="' + (kc % 2 ? 2.4 : 3.4) + '" fill="none" stroke="' + O + '" stroke-width="3.4"/><ellipse cx="' + f1(cx2) + '" cy="' + f1(cy2) + '" rx="' + (kc % 2 ? 4 : 5) + '" ry="' + (kc % 2 ? 2.4 : 3.4) + '" fill="none" stroke="' + clair(pierre, .25) + '" stroke-width="1.6"/>'; }
  [[200, 138], [330, 138]].forEach(function(p, i){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="10" fill="' + lin(d, p[0] + 10, p[1] - 10, p[0] - 10, p[1] + 10, [[0, clair(pierre, .45)], [1, sombre(pierre, .4)]]) + '" stroke="' + O + '" stroke-width="2.4"/>' + runeAllumee(rune(p[0], p[1], 9, i + 2), cyan, flou2, .7); });
  /* la ceinture */
  s += Pw('M186 240 C 230 248 300 248 344 240 L 346 256 C 300 264 230 264 184 256 Z', lin(d, 0, 240, 0, 262, [[0, clair(pierre, .15)], [1, sombre(pierre, .4)]]), 2.4);
  for(var k3 = 0; k3 < 7; k3++){ s += C(198 + k3 * 22, 251 + Math.abs(3 - k3) * -.6, 2.2, sombre(pierre, .5), ' opacity=".7"') + C(198.6 + k3 * 22, 250.4 + Math.abs(3 - k3) * -.6, .9, clair(pierre, .5), ' opacity=".7"'); }

  /* ===== le disque des quatre signes ===== */
  var dx0 = 265, dy0 = 192, dr = 40;
  s += C(dx0 + 2, dy0 + 4, dr + 6, '#14101c', ' opacity=".45" filter="' + flou3 + '"');
  s += '<circle cx="' + dx0 + '" cy="' + dy0 + '" r="' + (dr + 5) + '" fill="' + lin(d, dx0 + 40, dy0 - 40, dx0 - 40, dy0 + 40, [[0, clair(pierre, .45)], [.5, clair(pierre, .1)], [1, sombre(pierre, .45)]]) + '" stroke="' + O + '" stroke-width="3"/>';
  s += '<circle cx="' + dx0 + '" cy="' + dy0 + '" r="' + (dr - 3) + '" fill="' + rad(d, dx0 - 8, dy0 + 8, 50, [[0, sombre(pierre, .15)], [1, sombre(pierre, .45)]]) + '" stroke="' + O + '" stroke-width="2.2"/>';
  s += L('M' + (dx0 - 30) + ' ' + (dy0 - 30) + ' L ' + (dx0 - 12) + ' ' + (dy0 - 12) + ' M' + (dx0 + 30) + ' ' + (dy0 - 30) + ' L ' + (dx0 + 12) + ' ' + (dy0 - 12) + ' M' + (dx0 - 30) + ' ' + (dy0 + 30) + ' L ' + (dx0 - 12) + ' ' + (dy0 + 12) + ' M' + (dx0 + 30) + ' ' + (dy0 + 30) + ' L ' + (dx0 + 12) + ' ' + (dy0 + 12), sombre(pierre, .6), 1.6, ' opacity=".8"');
  s += C(dx0, dy0, 6, sombre(pierre, .3), ' stroke="' + O + '" stroke-width="1.6"');
  for(var k4 = 0; k4 < 24; k4++){ var aa = k4 / 24 * Math.PI * 2; s += L('M' + f1(dx0 + Math.cos(aa) * (dr - 1)) + ' ' + f1(dy0 + Math.sin(aa) * (dr - 1)) + ' L ' + f1(dx0 + Math.cos(aa) * (dr + 3)) + ' ' + f1(dy0 + Math.sin(aa) * (dr + 3)), sombre(pierre, .5), 1.2, ' opacity=".6"'); }
  s += L('M' + (dx0 + 8) + ' ' + (dy0 - dr - 4) + ' A ' + (dr + 4) + ' ' + (dr + 4) + ' 0 0 1 ' + (dx0 + dr + 4) + ' ' + (dy0 - 8), LUNE, 1.8, ' opacity=".6"');
  /* l'œil (en haut), le chaudron (à droite), la lyre (en bas, éteinte), l'étoile (à gauche) */
  var oeilS = T2('M-11 0 C -6 -7 6 -7 11 0 C 6 7 -6 7 -11 0 Z M-4 0 C -4 -4 4 -4 4 0 C 4 4 -4 4 -4 0 Z M-8 -6 L -10 -9 M0 -7 L 0 -10 M8 -6 L 10 -9', dx0, dy0 - 23);
  var chaudron = T2('M-10 -4 L 10 -4 M-9 -4 C -10 6 -4 10 0 10 C 4 10 10 6 9 -4 M-6 9 L -8 12 M6 9 L 8 12 M-3 -8 C -5 -11 -1 -12 -3 -15 M3 -8 C 1 -11 5 -12 3 -15', dx0 + 23, dy0 + 1);
  var lyre = T2('M-7 -10 C -12 -6 -10 4 -4 8 L 4 8 C 10 4 12 -6 7 -10 M-9 -7 L 9 -7 M-3 -7 L -3 8 M0 -7 L 0 8 M3 -7 L 3 8', dx0, dy0 + 23);
  var etoile = T2('M0 -11 L 3 -3.5 L 11 -3.5 L 4.6 1.4 L 7 9 L 0 4.4 L -7 9 L -4.6 1.4 L -11 -3.5 L -3 -3.5 Z', dx0 - 23, dy0);
  [[dx0, dy0 - 23], [dx0 + 23, dy0 + 1], [dx0 - 23, dy0]].forEach(function(p){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="18" fill="' + haloC + '" opacity=".55"/>'; });
  s += runeAllumee(oeilS, cyan, flou2, 1.15) + runeAllumee(chaudron, cyan, flou2, 1.15) + runeAllumee(etoile, cyan, flou2, 1.15) + F(etoile, cyan, ' opacity=".35"');
  s += L(T2(lyre, .9, .9), clair(pierre, .4), 1.2, ' opacity=".55"') + L(lyre, '#1c1820', 2.2, ' opacity=".85"');
  s += fissure(dx0 + 30, dy0 + 30, 5, .9, 3, R, 1.4);

  /* ===== l'étole gravée qui descend des épaules, par-dessus la robe ===== */
  var etole = 'M214 256 L 230 256 C 232 290 234 320 236 350 L 227 360 L 220 350 C 218 320 216 290 214 256 Z';
  [false, true].forEach(function(dr2){
    var m = dr2 ? miroir : function(x){ return x; };
    s += Pw(m(etole), lin(d, dr2 ? 318 : 238, 116, dr2 ? 292 : 212, 360, [[0, clair(pierre, dr2 ? .35 : .15)], [1, sombre(pierre, .45)]]), 2.4);
    s += L(m('M217 260 C 219 290 221 320 223 348 M227 260 C 229 290 231 320 232 348'), sombre(pierre, .5), 1, ' opacity=".55"');
    [312, 334].forEach(function(y, i){ var dd = rune(dr2 ? 530 - (222 + (y - 256) * .1) : 222 + (y - 256) * .1, y, 10, i + (dr2 ? 2 : 0)); s += (i + (dr2 ? 1 : 0)) % 3 === 2 ? runeEteinte(dd, pierre) : runeAllumee(dd, cyan, flou2, .75); });
  });
  /* ===== les pieds, sous l'ourlet ===== */
  [false, true].forEach(function(dr2){ var m = dr2 ? miroir : function(x){ return x; };
    s += Pw(m('M208 368 C 208 358 236 354 248 362 C 252 370 248 376 232 377 C 216 377 208 374 208 368 Z'), lin(d, 250, 356, 208, 378, [[0, clair(pierre, dr2 ? .4 : .2)], [1, sombre(pierre, .4)]]), 2.4) + L(m('M214 364 C 222 358 238 358 246 364'), dr2 ? LUNE : clair(pierre, .4), 1.2, ' opacity=".5"') + L(m('M222 360 C 222 366 224 372 226 376 M234 359 C 236 366 238 370 240 374'), '#1a1622', 1.4, ' opacity=".55"'); });

  /* ===== les épaulières et le haut des bras ===== */
  var epaul = 'M134 156 C 128 124 152 102 192 102 C 214 104 228 116 226 134 C 206 128 178 136 160 156 C 152 164 140 164 134 156 Z';
  var bras = 'M142 150 C 134 186 134 222 142 258 L 196 256 C 194 222 198 186 206 146 Z';
  function gCote(dr2, f){ return dr2 ? lin(d, 400, 100, 280, 340, [[0, clair(pierre, .38 * (f || 1))], [.5, pierre], [1, sombre(pierre, .45)]]) : lin(d, 240, 100, 130, 340, [[0, clair(pierre, .1)], [.5, sombre(pierre, .12)], [1, sombre(pierre, .6)]]); }
  [false, true].forEach(function(dr2){
    var m = dr2 ? miroir : function(x){ return x; }, g = gCote(dr2);
    s += Pw(m(bras), g, 3);
    s += G(clip(d, [m(bras)]), grainPierre(dr2 ? 324 : 130, 140, 80, 120, 30, R, pierre) + L(m('M162 160 C 156 190 158 220 164 246 M184 156 C 180 186 182 216 186 244'), '#14101c', 2, ' opacity=".4"') + L(m('M166 160 C 160 190 162 220 168 246 M188 156 C 184 186 186 216 190 244'), clair(pierre, .45), 1, ' opacity=".35"') + F(m('M190 146 C 186 190 188 230 196 256 L 206 146 Z'), '#0a0612', ' opacity=".25"') + F(m('M142 150 C 134 186 134 222 142 258 L 156 258 C 150 222 150 186 156 150 Z'), '#0a0612', ' opacity=".3"'));
    s += Pw(m(epaul), g, 3);
    s += G(clip(d, [m(epaul)]), L(m('M140 148 C 154 130 180 122 206 124'), sombre(pierre, .5), 2, ' opacity=".6"') + L(m('M146 140 C 160 122 186 114 214 118'), sombre(pierre, .5), 1.6, ' opacity=".45"') + grainPierre(dr2 ? 300 : 128, 100, 100, 66, 30, R, pierre));
    [[150, 132], [170, 118], [194, 112]].forEach(function(p){ var q = dr2 ? [530 - p[0], p[1]] : p; s += C(q[0], q[1], 2.6, sombre(pierre, .4), ' stroke="' + O + '" stroke-width="1.2"') + C(q[0] + .8, q[1] - .8, .9, clair(pierre, .6)); });
    if(dr2) s += L('M338 108 C 368 106 394 122 396 150', LUNE, 2.4, ' opacity=".6"') + L('M390 160 C 396 190 396 226 390 254', LUNE, 1.8, ' opacity=".45"');
  });
  s += fissure(160, 112, 6, 1.1, 6, R, 1.8) + mousse(370, 106, 18, 4, 14, 11) + mousse(176, 104, 14, 3, 10, 13);

  /* ===== les avant-bras dans leurs manches larges, les poings sur la poignée ===== */
  var avb = 'M142 236 C 172 234 212 246 244 256 L 246 292 C 214 290 178 284 146 288 C 134 274 134 252 142 236 Z';
  var drape = 'M146 284 C 178 284 214 290 244 292 C 236 306 222 318 206 328 C 194 336 182 340 172 338 C 158 328 146 314 142 300 C 142 294 144 288 146 284 Z';
  var poing = 'M242 256 C 250 250 262 252 266 258 L 266 290 C 262 296 250 296 242 292 Z';
  [false, true].forEach(function(dr2){
    var m = dr2 ? miroir : function(x){ return x; }, g = gCote(dr2);
    s += Pw(m(drape), g, 3);
    s += G(clip(d, [m(drape)]), L(m('M170 290 C 168 306 168 320 172 336 M194 292 C 192 306 188 320 182 334 M220 294 C 214 306 206 316 196 326'), '#14101c', 1.8, ' opacity=".45"') + L(m('M174 290 C 172 306 172 320 176 334 M198 292 C 196 306 192 318 186 330'), clair(pierre, .4), 1, ' opacity=".3"') + L(m('M142 302 C 150 320 160 332 172 338'), '#0a0612', 4, ' opacity=".25"') + '<rect x="' + (dr2 ? 280 : 136) + '" y="280" width="114" height="66" fill="' + lin(d, 0, 284, 0, 340, [[0, '#0a0612', .35], [1, '#0a0612', 0]]) + '"/>');
    s += Pw(m(avb), g, 3);
    s += G(clip(d, [m(avb)]), grainPierre(dr2 ? 284 : 134, 232, 112, 60, 26, R, pierre) + L(m('M150 262 C 180 262 214 270 240 276'), '#14101c', 1.6, ' opacity=".4"') + L(m('M148 244 C 176 242 210 252 240 262'), clair(pierre, .4), 1.2, ' opacity=".4"') + L(m('M176 240 C 182 252 184 266 180 286 M204 246 C 210 258 210 272 206 288 M226 252 C 230 262 230 276 226 290'), '#14101c', 1.6, ' opacity=".35"') + L(m('M230 254 L 234 292'), sombre(pierre, .5), 6, ' opacity=".35"'));
  });
  /* ===== l'épée de pierre plantée dans le socle ===== */
  var lame = 'M247 312 L 283 312 L 280 362 L 265 376 L 250 362 Z';
  s += Pw(lame, lin(d, 284, 312, 246, 372, [[0, clair(pierre, .4)], [.5, clair(pierre, .08)], [1, sombre(pierre, .45)]]), 2.8);
  s += F('M265 314 L 283 312 L 280 362 L 265 376 Z', '#0a0612', ' opacity=".18"') + L('M265 316 L 265 368', sombre(pierre, .5), 2, ' opacity=".6"');
  [[265, 326], [265, 344]].forEach(function(p, i){ s += runeAllumee(rune(p[0] - 8, p[1], 11, i + 1), cyan, flou2, .8) + runeAllumee(rune(p[0] + 8, p[1], 11, i + 4), cyan, flou2, .8); });
  s += fissure(276, 340, 4, 2.2, 4, R, 1.4);
  s += F('M240 370 L 290 370 L 284 378 L 246 378 Z', '#0a0810', ' opacity=".7"') + L('M246 374 L 236 382 M284 374 L 296 384', '#1a1622', 1.8);
  var garde = 'M204 298 C 220 292 244 294 265 294 C 286 294 310 292 326 298 C 332 306 326 314 318 312 C 300 308 284 310 265 310 C 246 310 230 308 212 312 C 204 314 198 306 204 298 Z';
  s += Pw(garde, lin(d, 326, 292, 204, 314, [[0, clair(pierre, .4)], [.5, pierre], [1, sombre(pierre, .45)]]), 2.8);
  s += C(202, 306, 7, sombre(pierre, .2), ' stroke="' + O + '" stroke-width="2.2"') + C(328, 306, 7, clair(pierre, .2), ' stroke="' + O + '" stroke-width="2.2"');
  s += Pw('M253 292 L 277 292 L 280 312 L 265 320 L 250 312 Z', lin(d, 280, 292, 250, 320, [[0, clair(pierre, .35)], [1, sombre(pierre, .35)]]), 2.4);
  s += '<circle cx="265" cy="305" r="12" fill="' + haloC + '" opacity=".6"/>' + Pw('M265 299 L 270 305 L 265 312 L 260 305 Z', cyan, 1.6) + C(266.5, 303, 1.2, '#fff');
  s += L('M218 296 C 240 294 296 294 322 298', LUNE, 1.4, ' opacity=".55"') + mousse(312, 296, 8, 2, 6, 15);

  s += Pw('M254 250 L 276 250 L 276 294 L 254 294 Z', sombre(pierre, .3), 2.4);
  s += '<circle cx="265" cy="246" r="10" fill="' + lin(d, 276, 236, 254, 256, [[0, clair(pierre, .4)], [1, sombre(pierre, .35)]]) + '" stroke="' + O + '" stroke-width="2.4"/>' + '<circle cx="265" cy="246" r="13" fill="' + haloC + '" opacity=".45"/>' + C(265, 246, 3.6, cyan);
  [false, true].forEach(function(dr2){
    var m = dr2 ? miroir : function(x){ return x; };
    s += '<ellipse cx="' + (dr2 ? 287 : 243) + '" cy="274" rx="6" ry="18" fill="' + sombre(pierre, .5) + '" stroke="' + O + '" stroke-width="2.4"/>';
    s += Pw(m(poing), lin(d, dr2 ? 290 : 266, 252, dr2 ? 264 : 240, 296, [[0, clair(pierre, dr2 ? .4 : .2)], [1, sombre(pierre, .4)]]), 2.6);
    s += L(m('M244 264 C 252 262 260 263 266 266 M244 272 C 252 270 260 271 266 274 M244 280 C 252 278 260 279 266 282'), '#1a1622', 1.6, ' opacity=".6"');
    s += L(m('M262 260 C 266 262 266 266 264 268 M262 268 C 266 270 266 274 264 276 M262 276 C 266 278 266 282 264 284'), clair(pierre, .45), 1.1, ' opacity=".55"');
    s += Pw(m('M246 258 C 248 248 258 244 266 248 C 266 254 262 258 256 260 Z'), lin(d, 266, 244, 246, 260, [[0, clair(pierre, .4)], [1, sombre(pierre, .25)]]), 2.2);
    if(dr2) s += L('M384 240 C 392 256 394 274 386 290', LUNE, 1.8, ' opacity=".5"');
  });
  s += lichen(160, 312, 6, R, '#c8c890') + lichen(380, 306, 5, R, '#d8b050') + mousse(178, 236, 10, 2.5, 7, 21);
  s += fissure(338, 300, 5, 1.7, 5, R, 1.5);

  /* ===== la barbe, les cheveux, la tête couronnée (un peu agrandie, pivot au cou) ===== */
  var sTete = s.length;
  var cheveux = 'M222 44 C 208 70 204 104 206 132 C 216 140 230 138 236 128 L 294 128 C 300 138 314 140 324 132 C 326 104 322 70 308 44 Z';
  s += Pw(cheveux, lin(d, 330, 40, 200, 140, [[0, clair(pierre, .15)], [1, sombre(pierre, .5)]]), 2.8);
  [212, 220, 228, 302, 310, 318].forEach(function(x, i){ s += L('M' + x + ' 56 C ' + (x - 6 + (i > 2 ? 12 : 0)) + ' 80 ' + (x + 4 - (i > 2 ? 8 : 0)) + ' 104 ' + (x - 2 + (i > 2 ? 4 : 0)) + ' 132', sombre(pierre, .55), 1.6, ' opacity=".6"'); });
  var tete = 'M232 62 C 230 40 246 28 265 28 C 284 28 300 40 298 62 C 298 80 296 94 290 104 C 284 114 274 118 265 118 C 256 118 246 114 240 104 C 234 94 232 80 232 62 Z';
  s += Pw(tete, lin(d, 300, 30, 230, 118, [[0, clair(pierre, .35)], [.5, pierre], [1, sombre(pierre, .45)]]), 3);
  var tv = grainPierre(230, 28, 70, 92, 30, R, pierre);
  tv += F('M232 62 C 234 84 238 100 248 110 C 240 96 238 80 240 62 Z', '#0a0612', ' opacity=".25"');
  s += G(clip(d, [tete]), tv);
  /* le visage, tourné un peu vers la gauche : arcades, nez, yeux qui s'allument */
  s += L('M236 62 C 242 57 251 57 257 60 M266 60 C 273 57 282 58 288 62', sombre(pierre, .6), 2.6);
  s += F('M236 64 C 242 60 251 60 256 63 L 253 70 C 247 68 241 68 236 70 Z', '#0a0612', ' opacity=".4"') + F('M267 63 C 273 60 281 60 287 64 L 287 70 C 282 68 276 68 270 70 Z', '#0a0612', ' opacity=".4"');
  [[245, 70, 8], [277, 70, 6.5]].forEach(function(e){ s += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="' + (e[2] * 2.2) + '" fill="' + haloC + '" opacity=".7"/>'; });
  s += Pw('M237 70 C 241 66 249 66 253 70 C 249 73 241 73 237 70 Z', '#e8ffff', 1.4) + Pw('M271 70 C 274 66 281 66 284 70 C 281 73 274 73 271 70 Z', '#e8ffff', 1.4);
  s += C(242.5, 70, 2.2, cyan) + C(275.5, 70, 1.8, cyan) + C(242, 69, .8, '#fff') + C(275, 69, .7, '#fff');
  s += L('M237 70 L 224 68 M284 70 L 296 68', cyan, 1, ' opacity=".5"');
  s += L('M241 80 C 244 84 248 86 252 86 M282 80 C 280 84 278 86 274 86', sombre(pierre, .5), 1.2, ' opacity=".5"');
  s += F('M234 74 C 238 84 242 92 248 98 L 236 98 C 234 90 232 82 234 74 Z', '#0a0612', ' opacity=".22"') + F('M296 74 C 292 84 288 92 284 98 L 294 98 C 296 90 298 82 296 74 Z', '#0a0612', ' opacity=".12"');
  s += F('M258 66 C 258 74 254 82 251 86 C 251 90 256 92 261 91 C 266 92 270 90 270 87 C 267 82 264 74 263 66 Z', lin(d, 270, 66, 250, 92, [[0, clair(pierre, .42)], [1, sombre(pierre, .3)]]));
  s += L('M258 66 C 258 74 254 82 251 86', sombre(pierre, .6), 1.8) + L('M251 87 C 253 91 258 92 261 90 C 264 92 268 91 270 88', O, 1.8) + L('M254 88 q 2 -2 4 0 M264 88 q 2 -2 4 0', '#14101c', 1.2, ' opacity=".7"') + L('M264 68 C 264 76 266 82 268 86', LUNE, 1.2, ' opacity=".5"');
  s += L('M248 52 C 256 50 268 50 278 52', sombre(pierre, .5), 1.2, ' opacity=".5"');
  s += fissure(286, 78, 4, 1.6, 4, R, 1.3);
  /* la barbe tressée de mèches gravées */
  var barbe = 'M236 92 C 242 100 252 100 262 98 C 272 100 284 100 292 92 C 298 106 298 122 290 134 C 282 142 272 146 261 150 C 252 146 242 140 236 132 C 228 120 228 106 236 92 Z';
  s += Pw(barbe, lin(d, 300, 92, 232, 160, [[0, clair(pierre, .3)], [.5, pierre], [1, sombre(pierre, .5)]]), 2.8);
  var tb = '';
  for(var k5 = 0; k5 < 7; k5++){ var bx = 238 + k5 * 8.5; tb += L('M' + f1(bx) + ' 100 C ' + f1(bx + 4) + ' 112 ' + f1(bx - 3) + ' 124 ' + f1(bx + (261 - bx) * .3) + ' 148', sombre(pierre, .55), 1.6, ' opacity=".6"') + L('M' + f1(bx + 2) + ' 100 C ' + f1(bx + 6) + ' 112 ' + f1(bx - 1) + ' 124 ' + f1(bx + 2 + (261 - bx) * .3) + ' 146', clair(pierre, .45), .9, ' opacity=".45"'); }
  s += G(clip(d, [barbe]), tb);
  s += Pw('M234 96 C 242 90 254 92 261 96 C 268 92 280 90 290 96 C 284 102 272 104 261 101 C 250 104 240 102 234 96 Z', lin(d, 290, 90, 240, 102, [[0, clair(pierre, .35)], [1, sombre(pierre, .35)]]), 2.2);
  s += L('M292 96 C 298 110 296 124 288 136', LUNE, 1.6, ' opacity=".5"');
  /* la couronne : un bandeau, cinq fleurons, une pierre qui luit */
  var bandeau = 'M228 44 C 246 38 284 38 302 44 L 300 56 C 284 51 246 51 230 56 Z';
  [[234, 46, 12], [249, 42, 16], [265, 40, 22], [281, 42, 16], [296, 46, 12]].forEach(function(p){
    var x = p[0], y = p[1], h = p[2];
    s += Pw('M' + (x - 6) + ' ' + y + ' L ' + (x - 3) + ' ' + (y - h + 5) + ' C ' + (x - 3) + ' ' + (y - h) + ' ' + (x + 3) + ' ' + (y - h) + ' ' + (x + 3) + ' ' + (y - h + 5) + ' L ' + (x + 6) + ' ' + y + ' Z', lin(d, x + 6, y - h, x - 6, y, [[0, clair(pierre, .45)], [1, sombre(pierre, .3)]]), 2.2);
    s += C(x, y - h + 2, 3, clair(pierre, .3), ' stroke="' + O + '" stroke-width="1.8"');
  });
  s += Pw(bandeau, lin(d, 302, 38, 228, 56, [[0, clair(pierre, .45)], [.5, pierre], [1, sombre(pierre, .4)]]), 2.6);
  s += '<circle cx="262" cy="48" r="13" fill="' + haloC + '" opacity=".7"/>' + Pw('M262 42 L 268 48 L 262 54 L 256 48 Z', cyan, 1.6) + C(264, 46, 1.2, '#fff');
  s += L('M284 40 C 292 40 298 42 302 44', LUNE, 1.6, ' opacity=".6"') + mousse(292, 40, 6, 2, 5, 17);

  s = s.slice(0, sTete) + '<g transform="translate(262 126) scale(1.13) translate(-262 -126)">' + s.slice(sTete) + '</g>';
  /* ===== le réveil : poussière qui tombe des épaules, éclats, lueurs qui montent ===== */
  var cE = lin(d, 0, 100, 0, 400, [[0, clair(pierre, .3)], [1, sombre(pierre, .3)]]);
  s += eclat(140, 176, 4, .4, cE, R) + eclat(132, 200, 2.6, 1.1, cE, R) + eclat(398, 164, 3.4, .9, cE, R) + eclat(404, 190, 2.4, .2, cE, R) + eclat(112, 392, 6, .3, cE, R) + eclat(452, 394, 5, 1.2, cE, R);
  for(var k6 = 0; k6 < 30; k6++){ var px = 130 + R() * 280, py = 160 + R() * 200; s += C(f1(px), f1(py), f1(.4 + R() * 1), '#d8d0c0', ' opacity="' + f1(.15 + R() * .35) + '"'); }
  for(var k7 = 0; k7 < 22; k7++){ var qx = 120 + R() * 300, qy = 30 + R() * 330, qr = .8 + R() * 1.6; s += C(f1(qx), f1(qy), f1(qr * 3), cyan, ' opacity=".18" filter="' + flou2 + '"') + C(f1(qx), f1(qy), f1(qr), '#dffcff', ' opacity="' + f1(.5 + R() * .4) + '"'); }
  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.quatresignes = {nom:'Le Gardien des quatre signes', rang:'tard', pv:1000, lieu:'Derrière la porte des Fondateurs',
  livre:'« L\'œil, le chaudron, la lyre, l\'étoile. Dans cet ordre, et à quatre. »',
  combo:['+ Il faut allumer les quatre signes', '!🎵 Sans le Barde, impossible'], dessin:dessin};
})();
