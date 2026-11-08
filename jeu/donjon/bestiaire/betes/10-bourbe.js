/* Bourbe, le crapaud du puits : boss du grand bassin (à moitié dans l'eau noire, très gros, très content de lui) */
(function(){
var B = window.BT, O = B.O, LUNE = B.LUNE, C = B.C, F = B.F, L = B.L, T2 = B.T, clair = B.clair, sombre = B.sombre, mix = B.mix;
var PFX = 'bo' + Math.floor(Math.random() * 1e6) + '_', U = 0;
function nid(){ return PFX + (++U); }
function f1(v){ return (+v).toFixed(1); }
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
/* chemin avec contour d'épaisseur choisie (un chemin ouvert n'est pas contouré sur sa base) */
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function stops(s){ return s.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2] != null ? ' stop-opacity="' + t[2] + '"' : '') + '/>'; }).join(''); }
/* dégradés posés dans l'espace du dessin : plusieurs morceaux partagent la même lumière, sans couture */
function lin(d, x1, y1, x2, y2, s){ var i = nid(); d.defs.push('<linearGradient id="' + i + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops(s) + '</linearGradient>'); return 'url(#' + i + ')'; }
function rad(d, cx, cy, r, s, fx, fy){ var i = nid(); d.defs.push('<radialGradient id="' + i + '" gradientUnits="userSpaceOnUse" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (fx != null ? ' fx="' + fx + '" fy="' + fy + '"' : '') + '>' + stops(s) + '</radialGradient>'); return 'url(#' + i + ')'; }
/* dégradé relatif à chaque forme (réutilisable par beaucoup de petites formes) */
function radBox(d, s, fx, fy){ var i = nid(); d.defs.push('<radialGradient id="' + i + '" cx=".5" cy=".5" r=".55" fx="' + fx + '" fy="' + fy + '">' + stops(s) + '</radialGradient>'); return 'url(#' + i + ')'; }
function linBox(d, x1, y1, x2, y2, s){ var i = nid(); d.defs.push('<linearGradient id="' + i + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops(s) + '</linearGradient>'); return 'url(#' + i + ')'; }
function clip(d, chemins){ var i = nid(); d.defs.push('<clipPath id="' + i + '">' + chemins.map(function(c){ return '<path d="' + c + '"/>'; }).join('') + '</clipPath>'); return ' clip-path="url(#' + i + ')"'; }
function G(a, s){ return '<g' + a + '>' + s + '</g>'; }
/* un bord bosselé le long d'une courbe (les bosses sortent à gauche du sens de marche) */
function bosses(p, t0, t1, n, h, R){
  var s = '', a = bez(p, t0);
  for(var k = 1; k <= n; k++){
    var b = bez(p, t0 + (t1 - t0) * k / n), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, hh = h * (0.4 + R() * 1.2);
    s += ' Q ' + f1((a[0] + b[0]) / 2 + dy / l * hh * 2) + ' ' + f1((a[1] + b[1]) / 2 - dx / l * hh * 2) + ' ' + f1(b[0]) + ' ' + f1(b[1]);
    a = b;
  }
  return s;
}
/* une courbe douce qui passe par des points (milieux en relais) */
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
/* un ruban qui s'affine (algue, doigt, queue de têtard) le long d'une ligne de points */
function ruban(pts, w0, w1){
  var g = [], dr = [], n = pts.length;
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
    g.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); dr.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]);
  }
  return lisse(g.concat(dr.reverse()), true);
}
function onde(x0, y0, dx, dy, amp, freq, ph, n){
  var p = []; for(var i = 0; i < n; i++){ var t = i / (n - 1), l = Math.sqrt(dx * dx + dy * dy), w = Math.sin(t * freq + ph) * amp * (0.3 + t); p.push([x0 + dx * t - dy / l * w, y0 + dy * t + dx / l * w]); } return p;
}
function tache(cx, cy, rx, ry, R, k){ var p = []; k = k || 7; for(var i = 0; i < k; i++){ var a = i / k * Math.PI * 2 + R() * .4, r = .65 + R() * .5; p.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } return lisse(p, true); }
/* reflet mouillé : un fin croissant, posé et tourné */
function reflet(x, y, lg, ang, ep, op){ return '<path transform="translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + ang + ')" d="M' + (-lg / 2) + ' 0 Q 0 ' + (-ep) + ' ' + (lg / 2) + ' 0 Q 0 ' + f1(-ep * .3) + ' ' + (-lg / 2) + ' 0 Z" fill="#fbfff4" opacity="' + (op || .75) + '"/>'; }
function ell(cx, cy, rx, ry){ var k = .5523; return 'M' + f1(cx - rx) + ' ' + f1(cy) + ' C ' + f1(cx - rx) + ' ' + f1(cy - ry * k) + ' ' + f1(cx - rx * k) + ' ' + f1(cy - ry) + ' ' + f1(cx) + ' ' + f1(cy - ry) + ' C ' + f1(cx + rx * k) + ' ' + f1(cy - ry) + ' ' + f1(cx + rx) + ' ' + f1(cy - ry * k) + ' ' + f1(cx + rx) + ' ' + f1(cy) + ' C ' + f1(cx + rx) + ' ' + f1(cy + ry * k) + ' ' + f1(cx + rx * k) + ' ' + f1(cy + ry) + ' ' + f1(cx) + ' ' + f1(cy + ry) + ' C ' + f1(cx - rx * k) + ' ' + f1(cy + ry) + ' ' + f1(cx - rx) + ' ' + f1(cy + ry * k) + ' ' + f1(cx - rx) + ' ' + f1(cy) + ' Z'; }
function goutte(x, y, r, fill){
  return Pw('M' + f1(x) + ' ' + f1(y - r * 2.6) + ' C ' + f1(x + r * .3) + ' ' + f1(y - r * 1.5) + ' ' + f1(x + r) + ' ' + f1(y - r * .8) + ' ' + f1(x + r) + ' ' + f1(y) + ' A ' + r + ' ' + r + ' 0 0 1 ' + f1(x - r) + ' ' + f1(y) + ' C ' + f1(x - r) + ' ' + f1(y - r * .8) + ' ' + f1(x - r * .3) + ' ' + f1(y - r * 1.5) + ' ' + f1(x) + ' ' + f1(y - r * 2.6) + ' Z', fill, 1.5, ' opacity=".95"') + C(f1(x + r * .35), f1(y - r * .25), f1(r * .32), '#fff', ' opacity=".95"');
}
/* ronds dans l'eau : des arcs d'ellipse coupés, comme une vraie onde */
function ronds(x, y, rx, ry, n, op){
  var s = '';
  for(var i = 0; i < n; i++){ var k = 1 + i * .6, a = rx * k, b = ry * k; s += '<path d="M' + f1(x - a) + ' ' + y + ' A ' + f1(a) + ' ' + f1(b) + ' 0 0 0 ' + f1(x + a * .7) + ' ' + f1(y + b * .7) + ' M' + f1(x + a * .92) + ' ' + f1(y + b * .4) + ' A ' + f1(a) + ' ' + f1(b) + ' 0 0 0 ' + f1(x + a * .5) + ' ' + f1(y - b * .86) + '" fill="none" stroke="' + LUNE + '" stroke-width="' + f1(1.8 - i * .4) + '" opacity="' + f1(op * (1 - i * .3)) + '" stroke-linecap="round"/>'; }
  return s;
}

function dessin(){
  var d = new B.Dessin(), s = '', R = B.rng(17);
  var peau = '#66703a', brun = '#4e3a1e', ventre = '#ecdfae', langue = '#d98aa4', pierre = '#5d566e', algue = '#4a7a30', mousseC = '#6f9a3a';
  var gPeau = lin(d, 470, 70, 80, 400, [[0, clair(peau, .32)], [.42, peau], [1, sombre(peau, .58)]]);
  var gVerrue = radBox(d, [[0, clair(peau, .5)], [.5, clair(peau, .12)], [1, sombre(peau, .3)]], .7, .25);
  var gVerrueB = radBox(d, [[0, '#d6a868'], [.5, mix(peau, '#9a6a34', .6)], [1, sombre(mix(peau, brun, .5), .25)]], .7, .25);
  var gPointe = linBox(d, .2, 1, .45, 0, [[0, sombre(peau, .15)], [.35, '#9a7a2a'], [.75, '#e0a83a'], [1, '#ffe08a']]);
  var gPointe2 = linBox(d, .2, 1, .45, 0, [[0, sombre(peau, .55)], [.5, '#6a5222'], [1, '#a8823c']]);
  var haloOr = d.halo('#fff6b0', '#ffb31a');
  var gEau = lin(d, 0, 314, 0, 420, [[0, '#2a4c58'], [.45, '#152d36'], [1, '#081218']]);
  var gPierre = lin(d, 540, 380, 0, 430, [[0, clair(pierre, .25)], [.5, pierre], [1, sombre(pierre, .5)]]);
  var flou2 = d.flou(2), flou3 = d.flou(3), flou6 = d.flou(6), flou10 = d.flou(10);
  var ombreV = sombre(peau, .6);
  function verrue(x, y, r, Rv, brune){
    var rx = r * (.88 + Rv() * .28), ry = r * (.74 + Rv() * .22), a = Math.round(Rv() * 60 - 30), tr = ' transform="rotate(' + a + ' ' + f1(x) + ' ' + f1(y) + ')"', v = '';
    v += '<ellipse cx="' + f1(x - r * .2) + '" cy="' + f1(y + r * .25) + '" rx="' + f1(rx * 1.06) + '" ry="' + f1(ry * 1.04) + '" fill="' + ombreV + '" opacity=".6"' + tr + '/>';
    v += '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + (brune ? gVerrueB : gVerrue) + '"' + tr + (r > 4.5 ? ' stroke="' + O + '" stroke-width="1.3" stroke-opacity=".5"' : '') + '/>';
    if(r > 6) v += '<ellipse cx="' + f1(x - r * .08) + '" cy="' + f1(y + r * .05) + '" rx="' + f1(r * .34) + '" ry="' + f1(r * .26) + '" fill="' + sombre(brun, .3) + '" opacity=".7"/>';
    v += C(f1(x + rx * .38), f1(y - ry * .42), f1(Math.max(.7, r * .2)), '#fffff0', ' opacity="' + (r > 3 ? .9 : .6) + '"');
    return v;
  }

  /* ===== le bassin : bord du fond, eau noire, brume lointaine ===== */
  s += Pw('M-10 322 Q 270 298 550 322 L 550 338 Q 270 316 -10 338 Z', gPierre, 2.5);
  s += L('M-10 322 Q 270 298 550 322', LUNE, 1.6, ' opacity=".35"');
  s += Pw('M-10 334 Q 270 312 550 334 L 550 404 Q 270 436 -10 404 Z', gEau, 0);
  s += '<ellipse cx="420" cy="356" rx="130" ry="14" fill="' + LUNE + '" opacity=".16" filter="' + flou6 + '"/>';
  s += '<ellipse cx="40" cy="334" rx="90" ry="9" fill="#cfe6f0" opacity=".3" filter="' + flou6 + '"/><ellipse cx="530" cy="332" rx="70" ry="8" fill="#cfe6f0" opacity=".3" filter="' + flou6 + '"/>';
  /* ce qui brille au fond de l'eau (ce que Bourbe craint) */
  s += '<ellipse cx="182" cy="388" rx="26" ry="7" fill="#fff0b0" opacity=".5" filter="' + flou3 + '"/>' + C(182, 388, 2.6, '#fffbe0') + L('M173 388 h 18 M182 383 v 10', '#fffbe0', 1.2, ' opacity=".8"') + C(195, 384, 1.2, '#fffbe0', ' opacity=".7"');

  /* ===== la patte avant du fond : l'avant-bras, derrière le ventre ===== */
  var gLoin = lin(d, 140, 320, 60, 410, [[0, sombre(peau, .45)], [1, sombre(peau, .74)]]);
  s += Pw('M118 326 C 104 346 94 368 92 392 C 100 400 120 402 130 398 C 132 380 138 360 146 342 Z', lin(d, 150, 330, 90, 400, [[0, sombre(peau, .38)], [.6, sombre(peau, .6)], [1, sombre(peau, .76)]]), 2.8);
  s += L('M140 346 C 134 362 130 380 128 394', LUNE, 1.4, ' opacity=".22"') + L('M104 356 C 108 362 108 368 104 374', sombre(peau, .75), 1.4, ' opacity=".7"');
  s += verrue(122, 350, 3, R) + verrue(112, 372, 2.6, R) + verrue(126, 384, 2.2, R);

  /* ===== les pointes de couronne du côté loin ===== */
  [[268, 110, 22], [289, 104, 32], [310, 97, 32], [330, 90, 22]].forEach(function(p){
    s += Pw('M' + (p[0] - 7) + ' ' + (p[1] + 8) + ' C ' + (p[0] - 7) + ' ' + (p[1] - p[2] * .5) + ' ' + (p[0] - 2) + ' ' + (p[1] - p[2]) + ' ' + (p[0] + 1) + ' ' + (p[1] - p[2]) + ' C ' + (p[0] + 5) + ' ' + (p[1] - p[2]) + ' ' + (p[0] + 7) + ' ' + (p[1] - p[2] * .45) + ' ' + (p[0] + 7) + ' ' + (p[1] + 8), gPointe2, 2.4);
  });

  /* ===== l'œil du fond : à moitié caché derrière la bosse du crâne ===== */
  s += '<circle cx="134" cy="140" r="28" fill="' + haloOr + '" opacity=".4"/>';
  s += Pw(ell(136, 142, 18, 17), gPeau, 2.8);
  var globeF = ell(131, 140, 12.5, 11.5);
  s += Pw(globeF, rad(d, 127, 134, 14, [[0, '#fff2b0'], [.4, '#f0bc32'], [.85, '#a8600e'], [1, '#5a2a06']]), 2.2);
  s += G(clip(d, [globeF]), F('M121 139 C 126 136 136 136 141 139 C 136 141.5 126 141.5 121 139 Z', '#120810') + F('M116 124 L 146 124 L 146 131 C 138 128 124 128 116 131 Z', gPeau));
  s += L('M119 131 C 125 128 136 128 143 131', O, 1.8) + C(126, 135, 1.8, '#fff', ' opacity=".9"');
  s += L('M124 126 C 130 123 140 124 146 128', LUNE, 1.4, ' opacity=".45"');

  /* ===== le corps : grosse masse bosselée, dégradé partagé ===== */
  var dos = [[288, 106], [352, 78], [458, 94], [498, 180]], croupe = [[498, 180], [524, 236], [532, 300], [514, 398]];
  var corps = 'M34 212 C 40 180 80 150 124 140 C 146 135 156 122 180 120 C 210 118 240 116 288 106' + bosses(dos, 0, 1, 12, 4.5, R) + bosses(croupe, 0, 1, 8, 3.5, R) +
    ' L 140 398 C 120 354 98 308 102 276 C 64 268 32 244 34 212 Z';
  var cuisse = 'M376 338 C 372 296 408 254 456 250 C 496 248 520 278 520 318 C 520 352 512 380 508 400 L 384 400 C 378 380 376 360 376 338 Z';
  var jambe = 'M382 352 C 404 336 474 340 508 354 C 518 362 516 374 504 380 L 394 384 C 380 378 376 362 382 352 Z';
  var clipCorps = clip(d, [corps]), clipTout = clip(d, [corps, cuisse, jambe]);
  s += Pw(corps, gPeau, 3.4);
  var t = '';
  t += '<rect x="0" y="60" width="540" height="350" fill="' + rad(d, 400, 140, 340, [[0, '#ffffff', .14], [.45, '#ffffff', 0], [.75, '#0a0612', .2], [1, '#0a0612', .65]]) + '"/>';
  /* marbrures brunes et taches sombres du dos (la vase), bordées d'un peu de clair */
  var R2 = B.rng(5);
  [[330, 128, 34, 16], [420, 146, 30, 22], [380, 196, 28, 16], [474, 226, 20, 26], [262, 146, 18, 10], [196, 170, 26, 11], [452, 300, 18, 14], [330, 240, 26, 14], [110, 176, 18, 9], [400, 260, 16, 10], [300, 200, 14, 9]].forEach(function(q, i){
    var p = tache(q[0], q[1], q[2], q[3], R2, 8), c = i % 3 ? sombre(peau, .5) : mix(peau, brun, .75);
    t += F(p, c, ' opacity=".6"') + L(p, clair(peau, .4), 1.4, ' opacity=".3"');
  });
  t += '<ellipse cx="420" cy="180" rx="90" ry="60" fill="' + brun + '" opacity=".22" filter="' + flou10 + '"/><ellipse cx="160" cy="190" rx="70" ry="26" fill="' + brun + '" opacity=".2" filter="' + flou10 + '"/>';
  /* grain fin */
  var R3 = B.rng(23);
  for(var k = 0; k < 320; k++){ var x = 40 + R3() * 480, y = 90 + R3() * 300; t += C(f1(x), f1(y), f1(.6 + R3() * 1.4), R3() < .55 ? sombre(peau, .55) : clair(peau, .45), ' opacity="' + f1(.2 + R3() * .35) + '"'); }
  /* le pli de peau qui court le long du flanc */
  t += F('M352 150 C 404 160 450 186 486 236 C 452 200 410 178 352 164 Z', clair(peau, .25), ' opacity=".5"') + L('M352 164 C 410 178 452 202 486 238', sombre(peau, .6), 2.2, ' opacity=".7"');
  /* verrues : en grappes sur le dos, petites sur la tête, jamais sur la ligne de la gueule */
  var vv = [], R9 = B.rng(29);
  function boucheY(x){ return 222 + (x - 36) * .12; }
  for(var g = 0; g < 26; g++){
    var gx = 120 + R9() * 400, gy = 96 + R9() * 250, n = 2 + Math.floor(R9() * 4), big = gx > 300;
    for(var j = 0; j < n; j++){ var vx = gx + (R9() - .5) * 26, vy = gy + (R9() - .5) * 20, vr = (big ? 3 : 2) + R9() * (big ? 6 : 3.5); if(Math.abs(vy - boucheY(vx)) < 9 && vx < 270) continue; if(vx < 150 && vy > 220) continue; vv.push([vx, vy, vr]); }
  }
  for(var k2 = 0; k2 < 70; k2++){ var x2 = 50 + R9() * 470, y2 = 100 + R9() * 260, rr = 1.4 + R9() * 2.6; if(Math.abs(y2 - boucheY(x2)) < 8 && x2 < 270) continue; if(x2 < 150 && y2 > 220) continue; vv.push([x2, y2, rr]); }
  [[356, 110, 9], [392, 116, 11], [432, 130, 10], [466, 166, 9], [408, 158, 8], [342, 156, 7.5], [480, 212, 10], [438, 196, 7], [494, 262, 8], [304, 126, 7], [362, 206, 7], [420, 236, 8], [76, 190, 4.5], [96, 172, 5], [128, 160, 4]].forEach(function(v){ vv.push(v); });
  vv.forEach(function(v, i){ t += verrue(v[0], v[1], v[2], R9, i % 4 === 0); });
  s += G(clipCorps, t);
  /* le dos mouillé : grands reflets nets */
  s += '<ellipse cx="420" cy="132" rx="60" ry="22" fill="#fff" opacity=".14" filter="' + flou6 + '" transform="rotate(18 420 132)"/>';
  s += reflet(404, 100, 64, 12, 6, .6) + reflet(478, 148, 44, 58, 5, .5) + reflet(336, 92, 30, -14, 4, .55) + reflet(512, 250, 40, 84, 4, .45);
  s += reflet(150, 196, 26, -10, 3, .5) + reflet(196, 214, 18, -6, 2.6, .45) + reflet(300, 214, 30, 14, 3.5, .45) + reflet(232, 194, 12, 0, 2.4, .5) + reflet(470, 300, 24, 70, 3, .4) + reflet(380, 230, 22, 20, 3, .4);
  s += L('M300 100 C 340 82 410 82 452 100 C 476 112 494 140 504 180', LUNE, 2.6, ' opacity=".55"') + L('M508 196 C 520 230 526 270 524 300', LUNE, 2, ' opacity=".4"');

  /* ===== le ventre pâle et mou (le point faible), ses bourrelets ===== */
  var gVentre = rad(d, 236, 300, 176, [[0, '#fbf5d8'], [.45, ventre], [.82, '#c4b27c'], [1, '#8a7a4e']]);
  var tv = '<ellipse cx="210" cy="366" rx="156" ry="96" fill="' + gVentre + '"/>';
  var R4 = B.rng(41);
  for(var k3 = 0; k3 < 34; k3++){ var a = Math.PI * (1.0 + R4() * 1.0), rk = .92 + R4() * .14, ex = 210 + Math.cos(a) * 156 * rk, ey = 366 + Math.sin(a) * 96 * rk; tv += F(tache(ex, ey, 5 + R4() * 8, 3 + R4() * 5, R4, 6), R4() < .5 ? sombre(peau, .25) : mix(peau, brun, .5), ' opacity="' + f1(.55 + R4() * .4) + '"'); }
  for(var k4 = 0; k4 < 140; k4++){ var gx2 = 70 + R4() * 290, gy2 = 274 + R4() * 120; tv += C(f1(gx2), f1(gy2), f1(.7 + R4() * 1.3), R4() < .5 ? '#fffbe8' : '#b8a670', ' opacity=".5"'); }
  /* l'ombre de la mâchoire sur la gorge, les plis de la gorge */
  tv += F('M60 262 C 120 280 200 284 270 262 L 290 300 C 220 296 130 292 60 290 Z', lin(d, 0, 268, 0, 300, [[0, '#3a2a14', .45], [1, '#3a2a14', 0]]));
  tv += L('M96 292 Q 160 304 232 294', '#a8925c', 2.2, ' opacity=".6"') + L('M96 302 Q 152 318 220 312', '#a8925c', 1.6, ' opacity=".45"');
  /* deux gros bourrelets */
  [[318, 0], [352, 1]].forEach(function(b){
    var y = b[0];
    tv += F('M96 ' + (y - 2) + ' Q 196 ' + (y + 30) + ' 310 ' + (y - 4) + ' L 310 ' + (y + 14) + ' Q 200 ' + (y + 40) + ' 96 ' + (y + 12) + ' Z', '#6e5e36', ' opacity=".4" filter="' + flou3 + '"');
    tv += F('M96 ' + (y - 34) + ' Q 196 ' + (y - 2) + ' 310 ' + (y - 36) + ' L 310 ' + (y - 14) + ' Q 196 ' + (y + 16) + ' 96 ' + (y - 12) + ' Z', '#fffbe8', ' opacity=".28" filter="' + flou3 + '"');
    tv += L('M100 ' + y + ' Q 196 ' + (y + 30) + ' 306 ' + (y - 4), '#7a6838', 2.6, ' opacity=".75"') + L('M104 ' + (y - 5) + ' Q 196 ' + (y + 24) + ' 300 ' + (y - 9), '#fffbe8', 2, ' opacity=".6"');
  });
  tv += '<ellipse cx="244" cy="306" rx="50" ry="18" fill="#fff" opacity=".4" filter="' + flou6 + '"/>' + reflet(256, 300, 44, -8, 5, .6) + reflet(218, 292, 14, -12, 3, .5) + reflet(276, 336, 22, -4, 3, .45);
  /* une lueur dorée venue du fond éclaire le dessous du ventre */
  tv += '<ellipse cx="190" cy="392" rx="90" ry="30" fill="#ffd27a" opacity=".22" filter="' + flou10 + '"/>';
  s += G(clipCorps, tv);
  s += L('M102 276 C 64 268 32 244 34 212', O, 3.4);

  /* ===== la grosse cuisse arrière, repliée, la jambe dessous ===== */
  s += F(cuisse, gPeau) + L('M376 338 C 372 296 408 254 456 250 C 478 249 494 256 504 266', O, 3.2) + L('M504 266 C 512 274 516 282 518 292', O, 2, ' opacity=".35"');
  s += L('M384 346 C 380 352 380 360 384 366', O, 2.4, ' opacity=".7"');
  var tc = '<rect x="360" y="240" width="170" height="170" fill="' + rad(d, 470, 268, 160, [[0, '#ffffff', .12], [.5, '#ffffff', 0], [1, '#0a0612', .6]]) + '"/>';
  var R5 = B.rng(61);
  [[420, 282, 16, 10], [482, 304, 14, 18], [446, 330, 12, 8]].forEach(function(q){ tc += F(tache(q[0], q[1], q[2], q[3], R5, 7), mix(peau, brun, .7), ' opacity=".55"'); });
  for(var k5 = 0; k5 < 30; k5++){ tc += verrue(386 + R5() * 126, 262 + R5() * 90, 1.6 + R5() * R5() * 6.5, R5, k5 % 5 === 0); }
  s += G(clip(d, [cuisse]), tc);
  s += L('M400 268 C 428 252 470 248 500 266 C 512 276 518 292 520 306', LUNE, 2.4, ' opacity=".6"') + reflet(462, 262, 36, 8, 5, .6);
  s += Pw(jambe, lin(d, 500, 340, 390, 384, [[0, clair(peau, .1)], [1, sombre(peau, .45)]]), 2.8);
  s += G(clip(d, [jambe]), verrue(420, 356, 4, R5) + verrue(452, 352, 5, R5, true) + verrue(486, 360, 4, R5) + verrue(404, 364, 3, R5));
  s += L('M392 352 C 420 342 470 344 502 354', LUNE, 1.6, ' opacity=".45"');

  /* ===== mousse, algues accrochées au dos ===== */
  /* mousse : une touffe sombre, puis des centaines de petits brins de plus en plus clairs vers le haut */
  function mousse(cx, cy, rx, ry, n, seed){
    var Rm = B.rng(seed), m = '';
    m += Pw(tache(cx, cy + ry * .3, rx * 1.05, ry * 1.1 + 2, Rm, 9), '#2a4a1e', 1.4, ' stroke-opacity=".7"');
    for(var i = 0; i < n * 3; i++){
      var a = Rm() * Math.PI * 2, r = Math.sqrt(Rm()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, hh = (cy - y) / (ry || 1), c = mix('#3f6a28', '#c4e47a', Math.max(0, Math.min(1, .35 + hh * .45 + Rm() * .3)));
      m += C(f1(x), f1(y), f1(1 + Rm() * 1.8), c);
      if(Rm() < .3) m += L('M' + f1(x) + ' ' + f1(y) + ' l ' + f1(Rm() * 3 - 1.5) + ' ' + f1(-2 - Rm() * 3), c, 1);
    }
    for(var j = 0; j < n / 2; j++){ var a2 = Rm() * Math.PI * 2, r2 = Math.sqrt(Rm()) * .7; m += C(f1(cx + Math.cos(a2) * rx * r2 + 1), f1(cy + Math.sin(a2) * ry * r2 - ry * .3), .9, '#ecfab8', ' opacity=".85"'); }
    return m;
  }
  var gAlgue = lin(d, 0, 80, 0, 330, [[0, '#8cbc54'], [.5, algue], [1, '#1e3c1a']]);
  var gAlgue2 = lin(d, 0, 80, 0, 330, [[0, '#5f8a3c'], [.5, '#2f5424'], [1, '#14281a']]);
  s += mousse(86, 160, 10, 3, 8, 9) + mousse(376, 92, 18, 5, 14, 3);
  /* paquet d'algues posé sur le dos, qui retombe sur le flanc */
  var brinsLoin = [[446, 120, 0, 84, 4, 2.6], [470, 130, 10, 110, 5, .8]];
  brinsLoin.forEach(function(b){ var pts = onde(b[0], b[1], b[2], b[3], b[4], 7, b[5], 16); s += Pw(ruban(pts, 8, 1.2), gAlgue2, 1.6); });
  s += Pw('M392 96 C 410 82 446 86 468 106 C 484 120 494 140 496 160 C 480 144 462 132 446 126 C 424 118 404 112 392 96 Z', gAlgue, 2.4);
  s += L('M404 100 C 420 98 440 104 452 114 M420 92 C 440 94 458 104 470 118', '#2c5222', 1.4, ' opacity=".7"');
  var brins = [[482, 140, 18, 124, 6, 1.2], [468, 128, 8, 150, 7, 2.4], [454, 122, 4, 96, 5, .3], [494, 160, 18, 96, 5, 3.6], [440, 118, -2, 70, 4, 1.9], [498, 172, 14, 60, 4, 5]];
  brins.forEach(function(b, i){
    var pts = onde(b[0], b[1], b[2], b[3], b[4], 7, b[5], 16);
    s += Pw(ruban(pts, 10 - i * .6, 1.5), gAlgue, 1.8);
    s += L(lisse(pts.slice(0, 11), false), '#b4e07a', 1.1, ' opacity=".55"');
    var z = pts[pts.length - 1]; if(i % 2 === 0) s += goutte(z[0], z[1] + 10, 2.8, '#cdeeff');
  });
  s += L('M398 94 C 416 84 448 88 466 104', LUNE, 2.2, ' opacity=".65"');
  s += mousse(426, 98, 16, 6, 12, 14);

  /* ===== la couronne : un bourrelet de corne, des pointes de verrue qui s'évasent, des perles d'or ===== */
  var bandeau = 'M246 134 C 258 116 290 102 322 94 C 336 90 348 86 358 86 C 362 92 362 100 356 104 C 334 110 306 120 282 130 C 268 136 258 142 250 144 C 244 142 242 138 246 134 Z';
  s += F(T2(bandeau, -2, 7), sombre(peau, .6), ' opacity=".5" filter="' + flou2 + '"');
  s += Pw(bandeau, lin(d, 352, 84, 260, 140, [[0, '#d6a84c'], [.45, '#946e2a'], [1, '#4a3a18']]), 2.6);
  s += G(clip(d, [bandeau]), L('M248 140 C 262 130 290 120 320 108 C 334 102 346 98 358 98', '#3a2a0c', 3, ' opacity=".45"') + [256, 270, 284, 298, 312, 326, 340].map(function(x, i){ return C(x, 132 - (x - 250) * .36 + (i % 2) * 2, 1.4, '#3a2a0c', ' opacity=".5"'); }).join(''));
  s += L('M250 132 C 264 116 294 104 324 96 C 338 92 350 88 356 88', LUNE, 1.6, ' opacity=".5"');
  [[256, 128, 24, -24], [276, 118, 35, -16], [298, 108, 44, -8], [320, 100, 35, 2], [341, 92, 25, 10]].forEach(function(p){
    var x = p[0], y = p[1], h = p[2], w = 9 + h * .16;
    var dd = 'M' + f1(-w) + ' 6 C ' + f1(-w * .9) + ' ' + f1(-h * .35) + ' ' + f1(-w * .35) + ' ' + f1(-h * .78) + ' 0 ' + (-h) + ' C ' + f1(w * .35) + ' ' + f1(-h * .78) + ' ' + f1(w * .9) + ' ' + f1(-h * .35) + ' ' + f1(w) + ' 6';
    var q = Pw(dd, gPointe, 2.6);
    q += F('M' + f1(-w * .1) + ' 4 C ' + f1(-w * .1) + ' ' + f1(-h * .4) + ' ' + f1(-w * .05) + ' ' + f1(-h * .7) + ' 0 ' + f1(-h * .9) + ' C ' + f1(w * .3) + ' ' + f1(-h * .6) + ' ' + f1(w * .7) + ' ' + f1(-h * .3) + ' ' + f1(w * .8) + ' 4 Z', '#fff2b8', ' opacity=".28"');
    q += L('M' + f1(-w * .45) + ' 2 C ' + f1(-w * .4) + ' ' + f1(-h * .3) + ' ' + f1(-w * .2) + ' ' + f1(-h * .6) + ' ' + f1(-w * .05) + ' ' + f1(-h * .78), '#5a4012', 1.3, ' opacity=".6"');
    q += L('M' + f1(w * .3) + ' ' + f1(-h * .78) + ' C ' + f1(w * .75) + ' ' + f1(-h * .45) + ' ' + f1(w * .92) + ' ' + f1(-h * .1) + ' ' + f1(w * .95) + ' 3', LUNE, 1.6, ' opacity=".6"');
    q += C(f1(-w * .35), f1(-h * .25), 1.8, '#5a4012', ' opacity=".5"') + C(f1(w * .3), f1(-h * .45), 1.4, '#5a4012', ' opacity=".45"');
    q += C(0, f1(-h + 1), 1.6, '#fffbe0');
    s += '<g transform="translate(' + x + ' ' + y + ') rotate(' + p[3] + ')">' + q + '</g>';
  });
  /* perles d'or entre les pointes, sur le bourrelet */
  [[266, 126, 3.6], [287, 116, 4], [309, 108, 4.2], [331, 100, 3.8], [352, 94, 3]].forEach(function(b){
    s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + rad(d, b[0] + 1.4, b[1] - 1.4, b[2] * 1.6, [[0, '#fff6c8'], [.45, '#f0b838'], [1, '#7a4a10']]) + '" stroke="' + O + '" stroke-width="1.4"/>' + C(f1(b[0] + 1.2), f1(b[1] - 1.3), 1, '#fff');
  });

  /* ===== la grosse glande en relief derrière l'œil (comme les vrais crapauds), le tympan ===== */
  var glande = 'M200 168 C 198 152 222 142 252 144 C 284 146 300 158 298 174 C 296 190 270 196 244 194 C 218 192 202 184 200 168 Z';
  s += '<g transform="rotate(16 250 170)">' + F(T2(glande, -4, 8), sombre(peau, .65), ' opacity=".6" filter="' + flou2 + '"');
  s += Pw(glande, rad(d, 262, 154, 60, [[0, clair(peau, .5)], [.45, clair(peau, .12)], [1, sombre(peau, .4)]]), 2.6);
  var R6 = B.rng(77), tg = '';
  for(var k6 = 0; k6 < 26; k6++){ var px = 210 + R6() * 84, py = 150 + R6() * 40; tg += '<ellipse cx="' + f1(px) + '" cy="' + f1(py) + '" rx="2.4" ry="1.7" fill="' + sombre(brun, .45) + '" opacity=".85"/>' + C(f1(px + .9), f1(py - .9), .7, '#fff', ' opacity=".55"'); }
  tg += F('M206 176 C 222 190 262 194 292 182 C 270 198 226 198 206 176 Z', '#0a0612', ' opacity=".3"');
  s += G(clip(d, [glande]), tg) + reflet(264, 152, 46, 2, 5.5, .7) + reflet(232, 150, 14, -6, 2.6, .55) + L('M208 158 C 224 146 262 142 290 156', LUNE, 1.8, ' opacity=".55"') + '</g>';
  s += C(218, 212, 11, sombre(peau, .55), ' opacity=".45"') + '<circle cx="216" cy="209" r="9.5" fill="' + rad(d, 219, 206, 11, [[0, clair(peau, .3)], [.7, sombre(peau, .2)], [1, sombre(peau, .45)]]) + '" stroke="' + O + '" stroke-width="1.8" stroke-opacity=".85"/>';
  s += '<circle cx="216" cy="209" r="5.5" fill="none" stroke="' + sombre(peau, .5) + '" stroke-width="1.1" opacity=".6"/>' + C(219, 205, 1.4, '#fff', ' opacity=".8"');

  /* ===== l'œil proche : gros, globuleux, sur le côté de la tête, grand ouvert ===== */
  var ex = 174, ey = 176;
  s += '<ellipse cx="' + (ex - 4) + '" cy="' + (ey + 8) + '" rx="36" ry="30" fill="' + sombre(peau, .65) + '" opacity=".55" filter="' + flou3 + '"/>';
  /* la crête osseuse au-dessus de l'œil, qui file vers la glande ; la crête du museau vers les narines */
  s += F('M140 152 C 152 138 184 132 212 140 C 222 143 228 148 230 154 C 214 150 190 148 170 152 C 158 154 146 157 140 152 Z', clair(peau, .3), ' opacity=".6"');
  s += L('M142 156 C 156 152 190 150 228 156', sombre(peau, .6), 1.8, ' opacity=".55"') + L('M146 146 C 166 136 196 134 220 143', LUNE, 1.4, ' opacity=".45"') + L('M136 158 C 112 162 86 170 64 184', sombre(peau, .6), 2, ' opacity=".55"') + L('M134 154 C 110 158 86 166 62 180', clair(peau, .4), 1.2, ' opacity=".4"');
  /* le bourrelet de l'orbite */
  s += '<circle cx="' + ex + '" cy="' + ey + '" r="58" fill="' + haloOr + '" opacity=".5"/>';
  var orbite = ell(ex + 1, ey + 2, 34, 31);
  s += Pw(orbite, rad(d, ex + 16, ey - 16, 50, [[0, clair(peau, .5)], [.5, clair(peau, .08)], [1, sombre(peau, .5)]]), 3);
  s += L('M' + (ex - 22) + ' ' + (ey - 24) + ' C ' + (ex - 6) + ' ' + (ey - 32) + ' ' + (ex + 20) + ' ' + (ey - 30) + ' ' + (ex + 32) + ' ' + (ey - 12), LUNE, 2, ' opacity=".55"');
  /* le globe d'or, pupille horizontale */
  var globe = ell(ex, ey, 25.5, 24);
  s += Pw(globe, rad(d, ex + 7, ey - 8, 30, [[0, '#fffbd0'], [.28, '#ffd84a'], [.72, '#e08a12'], [1, '#6a3006']]), 2.6);
  var gi = '';
  for(var i = 0; i < 26; i++){ var a = i / 26 * Math.PI * 2; gi += L('M' + f1(ex + Math.cos(a) * 9) + ' ' + f1(ey + 1 + Math.sin(a) * 6) + ' L ' + f1(ex + Math.cos(a) * 23) + ' ' + f1(ey + Math.sin(a) * 22), '#9a5208', .9, ' opacity=".45"'); }
  gi += '<ellipse cx="' + ex + '" cy="' + ey + '" rx="24.5" ry="23" fill="none" stroke="#5a2a06" stroke-width="3" opacity=".4"/>';
  gi += C(ex - 13, ey + 11, 2.4, '#9a5208', ' opacity=".4"') + C(ex + 12, ey + 12, 1.6, '#fff6c0', ' opacity=".5"') + C(ex - 6, ey - 12, 1.4, '#fff6c0', ' opacity=".5"');
  gi += Pw('M' + (ex - 15) + ' ' + (ey + 1) + ' C ' + (ex - 7) + ' ' + (ey - 5) + ' ' + (ex + 7) + ' ' + (ey - 5) + ' ' + (ex + 15) + ' ' + (ey + 1) + ' C ' + (ex + 7) + ' ' + (ey + 6) + ' ' + (ex - 7) + ' ' + (ey + 6) + ' ' + (ex - 15) + ' ' + (ey + 1) + ' Z', '#120810', 1.4) + '<ellipse cx="' + ex + '" cy="' + (ey + 1) + '" rx="19" ry="8.5" fill="none" stroke="#7a3a08" stroke-width="2" opacity=".45"/>';
  /* fine paupière du haut (juste un liseré : l'œil reste grand ouvert) et son ombre sur le globe */
  var bordH = 'M' + (ex - 24) + ' ' + (ey - 9) + ' C ' + (ex - 14) + ' ' + (ey - 19) + ' ' + (ex + 12) + ' ' + (ey - 20) + ' ' + (ex + 24) + ' ' + (ey - 9);
  gi += F(bordH + ' L ' + (ex + 30) + ' ' + (ey - 30) + ' L ' + (ex - 30) + ' ' + (ey - 30) + ' Z', rad(d, ex + 8, ey - 26, 30, [[0, clair(peau, .35)], [1, sombre(peau, .2)]])) + L('M' + (ex - 23) + ' ' + (ey - 6) + ' C ' + (ex - 12) + ' ' + (ey - 15) + ' ' + (ex + 12) + ' ' + (ey - 16) + ' ' + (ex + 23) + ' ' + (ey - 6), '#3a1a04', 4, ' opacity=".3"');
  s += G(clip(d, [globe]), gi) + L(bordH, O, 2.4);
  s += '<ellipse cx="' + (ex + 6) + '" cy="' + (ey - 10) + '" rx="14" ry="7" fill="#fffbe8" opacity=".28" transform="rotate(20 ' + (ex + 6) + ' ' + (ey - 10) + ')"/>' + C(ex + 10, ey - 10, 4.6, '#fff') + C(ex + 15, ey - 3, 1.6, '#fff', ' opacity=".85"') + C(ex - 12, ey + 11, 2, '#fff', ' opacity=".75"');
  s += L('M' + (ex + 6) + ' ' + (ey - 21) + ' C ' + (ex + 18) + ' ' + (ey - 18) + ' ' + (ex + 24) + ' ' + (ey - 8) + ' ' + (ex + 24) + ' ' + (ey + 2), '#fffbe0', 1.6, ' opacity=".55"');
  /* paupière du bas, épaisse et verruqueuse */
  var paupB = 'M' + (ex - 27) + ' ' + (ey + 8) + ' C ' + (ex - 22) + ' ' + (ey + 23) + ' ' + (ex + 20) + ' ' + (ey + 26) + ' ' + (ex + 27) + ' ' + (ey + 8) + ' C ' + (ex + 34) + ' ' + (ey + 34) + ' ' + (ex - 30) + ' ' + (ey + 38) + ' ' + (ex - 27) + ' ' + (ey + 8) + ' Z';
  s += Pw(paupB, lin(d, ex + 30, ey + 6, ex - 28, ey + 32, [[0, clair(peau, .35)], [1, sombre(peau, .35)]]), 2.4);
  [[-22, 21, 3], [-13, 27, 3.8], [-2, 30, 3.4], [9, 29, 4], [19, 25, 3.2], [26, 17, 2.8]].forEach(function(v){ s += verrue(ex + v[0], ey + v[1], v[2], R, v[2] > 3.3); });
  [[150, 150, 3], [206, 154, 3.4], [140, 196, 3.6], [204, 196, 3], [120, 176, 2.6]].forEach(function(v){ s += verrue(v[0], v[1], v[2], R); });

  /* ===== la gueule immense : une longue fente épaisse aux coins tombants, la langue qui pend ===== */
  s += L('M44 188 C 58 170 86 152 118 144', LUNE, 2.2, ' opacity=".5"') + reflet(80, 164, 36, -30, 4.5, .7) + reflet(104, 152, 14, -20, 2.6, .55);
  s += '<ellipse cx="48" cy="194" rx="3.6" ry="2.1" transform="rotate(-30 48 194)" fill="#1a0e18"/><ellipse cx="61" cy="186" rx="3.2" ry="1.9" transform="rotate(-30 61 186)" fill="#1a0e18"/>';
  s += L('M44 190 q 4 -6 10 -6 M58 182 q 4 -5 9 -5', clair(peau, .4), 1.2, ' opacity=".6"');
  s += Pw('M38 222 C 62 242 102 256 142 258 C 108 270 64 262 46 240 Z', '#2c0b24', 2.4);
  s += F('M52 236 C 74 250 104 256 128 258 C 102 264 70 256 52 236 Z', '#6a2048', ' opacity=".8"');
  s += L('M58 238 C 58 246 60 252 58 258 M118 258 C 116 262 118 266 116 270', '#e8f4ff', 1.2, ' opacity=".55"');
  s += L('M42 216 C 90 242 170 252 230 250 C 246 250 258 256 266 266', clair(peau, .4), 1.6, ' opacity=".45"');
  s += L('M36 222 C 84 250 168 262 230 257 C 248 256 260 263 268 274', O, 6);
  s += L('M46 232 C 96 256 170 266 230 263 C 244 263 254 268 260 276', sombre(peau, .55), 2, ' opacity=".6"');
  s += L('M268 274 C 274 282 274 292 270 300', O, 2.2, ' opacity=".7"') + L('M262 280 C 266 288 266 296 262 302', sombre(peau, .6), 1.6, ' opacity=".5"');
  /* la langue, gluante, avec son bout collant */
  var gLangue = lin(d, 112, 244, 50, 352, [[0, '#f4bccb'], [.45, langue], [1, '#86365c']]);
  s += Pw('M66 240 C 58 262 50 292 52 314 C 50 334 58 350 76 352 C 98 354 106 338 100 320 C 96 298 98 270 110 250 Z', gLangue, 2.8);
  s += L('M86 250 C 78 274 74 302 78 330', '#9a4a6c', 2, ' opacity=".7"');
  s += F('M56 330 C 60 346 72 352 86 350 C 76 346 64 340 56 330 Z', '#6a2448', ' opacity=".5"');
  s += reflet(98, 276, 30, 74, 3.8, .75) + reflet(94, 332, 14, 50, 3, .75) + C(64, 336, 2.2, '#fff', ' opacity=".7"') + C(70, 300, 1.4, '#fff', ' opacity=".6"');
  s += F('M150 254 C 156 262 154 272 150 280 C 160 276 172 268 176 258 Z', '#dff2ff', ' opacity=".22"') + L('M152 256 C 156 264 154 272 150 280', '#e8f6ff', 1, ' opacity=".6"');
  s += L('M70 352 C 68 360 70 366 68 372', '#d8f0ff', 1.6, ' opacity=".75"') + goutte(68, 380, 3.4, '#ead8f2');

  /* ===== l'eau qui le recouvre, sa ligne d'eau, les ronds ===== */
  var ligne = 'M116 358 Q 320 392 534 352';
  var eauSur = G(clipTout, Pw(ligne + ' L 540 430 L 100 430 Z', lin(d, 0, 358, 0, 404, [[0, '#2a4a54', .62], [.35, '#152c34', .86], [1, '#0a151c', .97]]), 0) +
    L('M116 366 Q 320 400 534 360', LUNE, 1.2, ' opacity=".22"') + L('M116 376 Q 320 410 534 370', LUNE, 1, ' opacity=".14"') +
    L(ligne, '#0a1218', 5, ' opacity=".55"') + L('M116 354 Q 320 388 534 348', clair(peau, .35), 2, ' opacity=".4"'));
  s += eauSur;
  s += L('M112 360 Q 320 394 538 354', LUNE, 2.2, ' opacity=".6"');
  s += L('M96 368 Q 210 392 300 394', LUNE, 1.4, ' opacity=".3"') + L('M380 386 Q 470 374 548 360', LUNE, 1.4, ' opacity=".35"') + L('M372 398 Q 470 386 556 370', LUNE, 1, ' opacity=".2"');
  /* écume et petites bulles collées le long de la ligne d'eau */
  var Rf = B.rng(71);
  for(var kf = 0; kf < 70; kf++){ var tf = Rf(), xf = (1 - tf) * (1 - tf) * 116 + 2 * tf * (1 - tf) * 320 + tf * tf * 534, yf = (1 - tf) * (1 - tf) * 360 + 2 * tf * (1 - tf) * 394 + tf * tf * 354 + Rf() * 4 - 1; s += C(f1(xf), f1(yf), f1(.6 + Rf() * 1.6), Rf() < .6 ? '#cfe6ee' : '#8fb0b8', ' opacity="' + f1(.35 + Rf() * .4) + '"'); }
  /* bulles qui remontent le long du ventre */
  [[150, 362, 3.2], [162, 366, 2], [508, 356, 2.6], [372, 380, 2.2]].forEach(function(b){ s += C(b[0], b[1], b[2], 'none', ' stroke="' + LUNE + '" stroke-width="1.2" opacity=".7"') + C(b[0] + b[2] * .35, b[1] - b[2] * .4, b[2] * .3, '#fff', ' opacity=".8"'); });
  /* reflet de lune sur l'eau, bris de lumière */
  for(var k8 = 0; k8 < 14; k8++){ var wx = 350 + R() * 190, wy = 366 + R() * 30; s += L('M' + f1(wx) + ' ' + f1(wy) + ' h ' + f1(6 + R() * 16), LUNE, 1.4, ' opacity="' + f1(.25 + R() * .4) + '"'); }

  /* ===== nénuphars, fleur, têtards ===== */
  function nenuphar(cx, cy, rx, ry, a0, fill){
    var a1 = a0 + .45, x0 = cx + Math.cos(a0) * rx, y0 = cy + Math.sin(a0) * ry, x1 = cx + Math.cos(a1) * rx, y1 = cy + Math.sin(a1) * ry, n = '';
    n += '<ellipse cx="' + cx + '" cy="' + (cy + 3) + '" rx="' + rx + '" ry="' + ry + '" fill="#06120c" opacity=".7"/>';
    n += Pw('M' + cx + ' ' + cy + ' L ' + f1(x1) + ' ' + f1(y1) + ' A ' + rx + ' ' + ry + ' 0 1 1 ' + f1(x0) + ' ' + f1(y0) + ' Z', fill, 2.4);
    for(var i = 0; i < 11; i++){ var a = a1 + .18 + i * (Math.PI * 2 - .8) / 10; n += L('M' + cx + ' ' + cy + ' L ' + f1(cx + Math.cos(a) * rx * .9) + ' ' + f1(cy + Math.sin(a) * ry * .9), '#2c5a24', 1.1, ' opacity=".6"'); }
    n += L('M' + f1(cx - rx * .7) + ' ' + f1(cy - ry * .72) + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + f1(cx + rx * .95) + ' ' + f1(cy - ry * .2), LUNE, 1.6, ' opacity=".55"');
    n += C(cx + rx * .3, cy - ry * .1, 1.6, '#e8faff', ' opacity=".8"') + C(cx - rx * .4, cy + ry * .2, 1.2, '#e8faff', ' opacity=".6"');
    return n;
  }
  var gFeuille = lin(d, 540, 360, 400, 400, [[0, '#84b24c'], [.5, '#4a7a2e'], [1, '#22441a']]);
  s += nenuphar(488, 384, 50, 12, 2.2, gFeuille) + nenuphar(20, 352, 32, 8, .4, gFeuille) + nenuphar(424, 396, 20, 5, 3.6, gFeuille);
  /* la fleur de nénuphar */
  var gPetale = linBox(d, 0, 1, .2, 0, [[0, '#c87aa8'], [.6, '#f2d4e6'], [1, '#fff8fc']]);
  [[-24, -4, -62], [24, -4, 62], [-16, -4, -34], [16, -4, 34], [-7, -3, -12], [7, -3, 12], [0, -2, 0]].forEach(function(p){
    s += '<path transform="translate(' + (496 + p[0] * .55) + ' ' + (378 + p[1]) + ') rotate(' + p[2] + ')" d="M0 4 C -8 -6 -7 -18 0 -27 C 7 -18 8 -6 0 4 Z" fill="' + gPetale + '" stroke="' + O + '" stroke-width="2"/>';
  });
  s += '<ellipse cx="496" cy="374" rx="7.5" ry="3.6" fill="#ffd23a" stroke="' + O + '" stroke-width="1.6"/>' + C(498, 373, 1.4, '#fff');
  s += L('M500 352 C 504 348 508 350 510 355', LUNE, 1.4, ' opacity=".6"');
  /* deux têtards, petits yeux d'or comme papa */
  function tetard(x, y, sc, ph){
    var q = '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')">';
    var pts = onde(10, 0, 36, 3, 4, 9, ph, 12);
    q += F(ruban(pts, 15, 1), '#7fa0a0', ' opacity=".35"') + Pw(ruban(pts, 6, .5), '#4a6a3a', 1.4);
    q += Pw('M-15 0 C -15 -9 -6 -12 3 -11 C 11 -10 15 -5 15 0 C 15 7 6 10 -2 10 C -11 10 -15 7 -15 0 Z', lin(d, x + 15, y - 11, x - 15, y + 10, [[0, '#8aa25a'], [.5, '#55703a'], [1, '#26381c']]), 2);
    q += '<circle cx="-6" cy="-3" r="9" fill="' + haloOr + '" opacity=".6"/>' + C(-6, -3, 3.4, '#ffd23a', ' stroke="' + O + '" stroke-width="1.2"') + L('M-8.8 -3 h 5.6', '#140a10', 1.6) + C(-4.8, -4.6, 1, '#fff');
    q += L('M-13 3 q 3 3 7 1', '#1a1a12', 1.3) + L('M-6 -10 C 0 -12 8 -10 13 -4', LUNE, 1.3, ' opacity=".65"');
    return q + '</g>' + ronds(x + 2, y + 6, 20 * sc, 4.5 * sc, 2, .4);
  }
  s += tetard(398, 370, 1, 0) + tetard(446, 388, .8, 2.2);

  /* ===== brume qui traîne sur l'eau ===== */
  s += '<ellipse cx="206" cy="378" rx="120" ry="12" fill="#d8ecf5" opacity=".34" filter="' + flou6 + '"/><ellipse cx="430" cy="360" rx="140" ry="13" fill="#d8ecf5" opacity=".3" filter="' + flou6 + '"/>';
  s += '<ellipse cx="330" cy="350" rx="70" ry="16" fill="#d8ecf5" opacity=".16" filter="' + flou10 + '"/><ellipse cx="60" cy="372" rx="70" ry="10" fill="#d8ecf5" opacity=".24" filter="' + flou6 + '"/>';
  s += L('M380 344 C 400 330 396 316 412 304 C 424 296 420 284 432 276', '#e8f4fa', 8, ' opacity=".1" filter="' + flou6 + '"') + L('M150 366 C 166 350 160 336 176 324', '#e8f4fa', 8, ' opacity=".1" filter="' + flou6 + '"');
  s += L('M290 376 C 320 362 350 368 372 354 C 390 344 416 348 428 336', '#e8f4fa', 7, ' opacity=".16" filter="' + flou3 + '"');
  s += L('M10 364 C 40 352 66 358 92 346', '#e8f4fa', 7, ' opacity=".2" filter="' + flou3 + '"') + L('M470 350 C 500 340 512 326 540 322', '#e8f4fa', 6, ' opacity=".18" filter="' + flou3 + '"');

  /* ===== la patte avant proche : bras charnu, coude, poignet ===== */
  var bras = 'M282 262 C 292 292 302 318 312 334 C 296 350 276 366 262 382 C 262 396 270 404 282 404 C 308 394 336 380 358 364 C 374 350 370 314 354 288 C 350 278 348 272 346 268';
  s += Pw(bras, gPeau, 3.4);
  var tb = '<rect x="240" y="250" width="140" height="160" fill="' + rad(d, 346, 300, 120, [[0, '#ffffff', .12], [.5, '#ffffff', 0], [1, '#0a0612', .6]]) + '"/>';
  var R7 = B.rng(91);
  tb += F(tache(326, 330, 16, 10, R7, 7), mix(peau, brun, .7), ' opacity=".5"') + F(tache(300, 380, 12, 7, R7, 7), mix(peau, brun, .7), ' opacity=".5"');
  for(var k9 = 0; k9 < 26; k9++){ tb += verrue(276 + R7() * 80, 280 + R7() * 110, 1.5 + R7() * R7() * 5, R7, k9 % 5 === 0); }
  s += G(clip(d, [bras + ' Z']), tb);
  s += L('M306 332 C 310 338 310 344 306 350 M298 340 C 302 344 302 350 298 354', sombre(peau, .6), 1.6, ' opacity=".6"');
  s += L('M350 284 C 366 306 370 336 358 360', LUNE, 2.4, ' opacity=".6"') + reflet(336, 300, 32, 62, 4.5, .6) + reflet(318, 372, 26, -32, 3.5, .5);
  /* algue qui pend du coude, gouttes */
  var pc = onde(358, 362, 4, 30, 3, 6, .5, 10);
  s += Pw(ruban(pc, 7, 1.2), gAlgue, 1.6) + goutte(363, 401, 2.8, '#cdeeff') + ronds(364, 408, 9, 2.4, 2, .5);

  /* ===== la margelle de pierre du premier plan ===== */
  var dessus = 'M-10 390 Q 270 422 550 390', face = 'M-10 400 Q 270 434 550 400';
  function yM(x){ var tt = (x + 10) / 560; return 390 + 64 * tt * (1 - tt); }
  s += Pw(dessus + ' L 550 440 L -10 440 Z', gPierre, 3);
  s += F(face + ' L 550 440 L -10 440 Z', lin(d, 0, 400, 0, 432, [[0, sombre(pierre, .3)], [1, sombre(pierre, .6)]]));
  s += L(face, O, 2.4) + L('M-10 389 Q 270 420 550 389', LUNE, 1.8, ' opacity=".5"');
  var R8 = B.rng(13);
  [36, 120, 200, 296, 386, 470].forEach(function(x){ var y = yM(x); s += L('M' + x + ' ' + f1(y + 1) + ' l ' + f1(-2 + (x - 270) * .02) + ' 9 l 0 30', O, 2, ' opacity=".8"'); });
  for(var k10 = 0; k10 < 46; k10++){ var sx = R8() * 540, sy = yM(sx) + 3 + R8() * 26; s += C(f1(sx), f1(sy), f1(.8 + R8() * 1.5), R8() < .5 ? '#2a2236' : '#8a84a0', ' opacity=".5"'); }
  s += L('M150 420 l 8 6 l -2 8 M420 416 l -6 7 l 4 8 M330 418 l 5 5', '#1a1424', 1.6, ' opacity=".7"');
  s += mousse(150, 406, 26, 3, 16, 31) + mousse(420, 404, 34, 3, 18, 33) + mousse(10, 394, 22, 3, 10, 35) + mousse(526, 394, 16, 3, 10, 37);
  [[134, 408, 14], [444, 406, 10], [12, 398, 8], [170, 409, 9]].forEach(function(m){ s += Pw(ruban(onde(m[0], m[1], 2, m[2], 1.5, 5, 1, 6), 4, 1), mousseC, 1.2); });

  /* ===== les mains : doigts boudinés à bout rond, posés sur la margelle ===== */
  /* un doigt : tube qui s'affine, bout arrondi, bout de corne sombre, tubercules aux jointures */
  function doigt(pts, w){
    var g = [], dr = [], n = pts.length;
    for(var i = 0; i < n; i++){
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ww = w * (1 - .24 * i / (n - 1)) * (1 + .07 * Math.sin(Math.PI * i / (n - 1) * 2)) / 2;
      g.push([pts[i][0] + dy / l * ww, pts[i][1] - dx / l * ww]); dr.push([pts[i][0] - dy / l * ww, pts[i][1] + dx / l * ww]);
    }
    var re = w * .39, retour = lisse(dr.slice().reverse(), false).replace(/^M[^Q]*/, ' ');
    return lisse(g, false) + ' A ' + f1(re) + ' ' + f1(re) + ' 0 0 1 ' + f1(dr[n - 1][0]) + ' ' + f1(dr[n - 1][1]) + retour + ' Z';
  }
  function doigts(dg, ombre){
    var m = '';
    dg.forEach(function(f){
      var q0 = f[0], w = f[1], pts = [];
      for(var kq = 0; kq <= 7; kq++){ var tq = kq / 7, uq = 1 - tq; pts.push([uq * uq * q0[0][0] + 2 * uq * tq * q0[1][0] + tq * tq * q0[2][0], uq * uq * q0[0][1] + 2 * uq * tq * q0[1][1] + tq * tq * q0[2][1]]); }
      var z = pts[pts.length - 1], y = pts[pts.length - 2], mi = pts[4], a = pts[0];
      var gd = ombre ? lin(d, a[0] + 10, a[1] - 6, z[0] - 6, z[1] + 6, [[0, sombre(peau, .45)], [1, sombre(peau, .74)]]) : lin(d, a[0] + 10, a[1] - 8, z[0] - 8, z[1] + 8, [[0, clair(peau, .3)], [.5, peau], [1, sombre(peau, .45)]]);
      m += Pw(doigt(pts, w), gd, 2.3);
      var dx = z[0] - y[0], dy = z[1] - y[1], l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l, r = w * .36;
      m += L('M' + f1(z[0] - uy * r * 1.1 + ux * r * .3) + ' ' + f1(z[1] + ux * r * 1.1 + uy * r * .3) + ' A ' + f1(r * 1.15) + ' ' + f1(r * 1.15) + ' 0 0 0 ' + f1(z[0] + uy * r * 1.1 + ux * r * .3) + ' ' + f1(z[1] - ux * r * 1.1 + uy * r * .3), '#2a1a10', w * .26, ' opacity="' + (ombre ? .7 : .85) + '"');
      m += L('M' + f1(mi[0] - w * .32) + ' ' + f1(mi[1] - 1) + ' q ' + f1(w * .32) + ' 2.5 ' + f1(w * .64) + ' 0', sombre(peau, .7), 1.2, ' opacity=".6"');
      if(!ombre) m += verrue(mi[0] + 1, mi[1] - w * .25, w * .2, R) + verrue((a[0] + mi[0]) / 2, (a[1] + mi[1]) / 2 - w * .2, w * .17, R) + C(f1(z[0] - ux * w * .3 + uy * w * .2), f1(z[1] - uy * w * .3 - ux * w * .2), f1(w * .14), '#fff', ' opacity=".8"');
    });
    return m;
  }
  /* main du fond, dans l'ombre */
  s += Pw('M84 384 C 98 374 126 378 132 394 C 132 406 110 410 94 404 C 82 398 78 390 84 384 Z', gLoin, 2.6);
  s += doigts([[[[124, 400], [131, 414], [124, 426]], 10], [[[110, 402], [107, 421], [94, 428]], 11], [[[98, 398], [87, 413], [68, 419]], 11.5], [[[92, 390], [72, 386], [56, 398]], 11]], true);
  /* main proche : la paume, quatre gros doigts boudinés qui débordent de la margelle */
  var paume = 'M232 386 C 250 372 288 378 296 396 C 298 410 280 416 260 416 C 240 416 224 402 232 386 Z';
  s += doigts([[[[282, 408], [291, 420], [286, 432]], 13.5]], false);
  s += Pw(paume, lin(d, 300, 376, 222, 418, [[0, clair(peau, .25)], [.5, peau], [1, sombre(peau, .4)]]), 2.8);
  s += G(clip(d, [paume]), verrue(262, 386, 4, R) + verrue(280, 392, 3.4, R, true) + verrue(246, 392, 3, R) + verrue(270, 404, 2.4, R));
  s += doigts([[[[266, 408], [265, 425], [251, 432]], 15], [[[250, 404], [239, 423], [218, 427]], 15.5], [[[240, 394], [215, 390], [196, 404]], 15]], false);
  s += L('M244 380 C 262 374 286 382 296 394', LUNE, 2, ' opacity=".6"') + reflet(270, 386, 26, 8, 3.5, .65);

  /* ===== gouttes qui tombent, brume de devant ===== */
  s += goutte(150, 272, 3, '#cdeeff') + goutte(156, 300, 2.4, '#cdeeff') + L('M150 262 L 150 266', '#d8f0ff', 1.2, ' opacity=".6"');
  s += goutte(520, 330, 2.8, '#cdeeff') + ronds(522, 352, 10, 2.6, 2, .5);
  s += goutte(226, 262, 2.2, '#cdeeff');
  s += '<ellipse cx="300" cy="424" rx="220" ry="9" fill="#d8ecf5" opacity=".14" filter="' + flou10 + '"/>';
  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.bourbe = {nom:'Bourbe, le crapaud du puits', rang:'boss', pv:1000, lieu:'Le grand bassin, sous la ville d\'avant',
  livre:'« Dans l\'eau, rien ne l\'atteint. Mais il craint ce qui brille au fond. »',
  combo:['+✨🔥💨 La lumière, le feu, puis le fumigène', ' Autre chemin : le givre', '!🥄 Piège : le bruit'], dessin:dessin};
})();
