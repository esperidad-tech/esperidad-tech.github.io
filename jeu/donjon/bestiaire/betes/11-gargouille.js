/* La Gargouille-corbeau : le signe du Corbeau, accroupie sur un socle brisé (pierre fissurée, ailes sculptées, yeux de verre) */
(function(){
var B = window.BT, O = B.O, LUNE = B.LUNE, C = B.C, F = B.F, L = B.L, T2 = B.T, clair = B.clair, sombre = B.sombre, mix = B.mix;
var PFX = 'ga' + Math.floor(Math.random() * 1e6) + '_', U = 0;
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
/* une plume sculptée : feuille allongée, tige creusée, barbes gravées */
function plume(d, a, b, w, bend, couleur, opt){
  opt = opt || {};
  var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  function P(t, off){ var be = bend * Math.sin(Math.PI * t); return [a[0] + ux * l * t + nx * (off + be), a[1] + uy * l * t + ny * (off + be)]; }
  var pts = [P(0, w * .3), P(.2, w * .5), P(.48, w * .5), P(.76, w * .4), P(.93, w * .2), P(1, 0)];
  if(opt.pointe) pts.push(P(1, 0));
  pts = pts.concat([P(.93, -w * .2), P(.76, -w * .4), P(.48, -w * .5), P(.2, -w * .5), P(0, -w * .3)]);
  var dd = lisse(pts, true), s = Pw(dd, couleur, opt.trait || 2.4);
  var sh = function(t0, t1, off){ var q = [], k; for(k = 0; k <= 6; k++) q.push(P(t0 + (t1 - t0) * k / 6, off)); return 'M' + q.map(function(z){ return f1(z[0]) + ' ' + f1(z[1]); }).join(' L '); };
  s += L(sh(.06, .9, w * .06), '#1a1424', 1.6, ' opacity=".55"') + L(sh(.06, .88, -w * .06), opt.lune ? LUNE : '#e8e8f0', 1, ' opacity="' + (opt.lune ? .55 : .3) + '"');
  for(var t = .3; t < .85; t += .17){ var p0 = P(t, w * .06), p1 = P(t + .12, w * .4), q0 = P(t, -w * .06), q1 = P(t + .12, -w * .4);
    s += L('M' + f1(p0[0]) + ' ' + f1(p0[1]) + ' L ' + f1(p1[0]) + ' ' + f1(p1[1]) + ' M' + f1(q0[0]) + ' ' + f1(q0[1]) + ' L ' + f1(q1[0]) + ' ' + f1(q1[1]), '#1a1424', .9, ' opacity=".35"'); }
  if(opt.casse){
    var pz = function(q){ return f1(q[0]) + ' ' + f1(q[1]); };
    var bord = [P(.8, w * .7), P(.86, w * .2), P(.8, -w * .05), P(.87, -w * .35), P(.82, -w * .7)];
    var masque = 'M' + pz(P(-.2, w)) + ' L ' + bord.map(pz).join(' L ') + ' L ' + pz(P(-.2, -w)) + ' Z';
    s = G(clip(d, [masque]), s);
    var bord2 = bord.map(function(q){ return [q[0] - ux * 4, q[1] - uy * 4]; });
    s += G(clip(d, [dd]), F('M' + bord.map(pz).join(' L ') + ' L ' + bord2.slice().reverse().map(pz).join(' L ') + ' Z', clair(opt.base || '#888', .45)));
    s += G(clip(d, [dd]), L('M' + bord.map(pz).join(' L '), O, 2.4));
  }
  return {s:s, d:dd};
}
/* une griffe de pierre recourbée */
function griffe(x, y, ang, lg, ep, c){
  var a = ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, cb = .35 * lg;
  var tip = [x + ux * lg + nx * cb, y + uy * lg + ny * cb];
  var d = 'M' + f1(x + nx * ep) + ' ' + f1(y + ny * ep) + ' Q ' + f1(x + ux * lg * .7 + nx * (ep * .6 + cb * .2)) + ' ' + f1(y + uy * lg * .7 + ny * (ep * .6 + cb * .2)) + ' ' + f1(tip[0]) + ' ' + f1(tip[1]) + ' Q ' + f1(x + ux * lg * .55 - nx * ep * .2) + ' ' + f1(y + uy * lg * .55 - ny * ep * .2) + ' ' + f1(x - nx * ep) + ' ' + f1(y - ny * ep) + ' Z';
  return Pw(d, c, 2.2) + L('M' + f1(x + nx * ep * .4 + ux * 3) + ' ' + f1(y + ny * ep * .4 + uy * 3) + ' Q ' + f1(x + ux * lg * .6 + nx * (ep * .3 + cb * .2)) + ' ' + f1(y + uy * lg * .6 + ny * (ep * .3 + cb * .2)) + ' ' + f1(tip[0] - ux * 2) + ' ' + f1(tip[1] - uy * 2), '#e8e8f0', 1, ' opacity=".45"');
}
function eclat(x, y, r, ang, c, R){
  var p = []; for(var i = 0; i < 5; i++){ var a = ang + i / 5 * Math.PI * 2 + R() * .5, rr = r * (.6 + R() * .6); p.push(f1(x + Math.cos(a) * rr) + ' ' + f1(y + Math.sin(a) * rr)); }
  return Pw('M' + p.join(' L ') + ' Z', c, 1.6) + L('M' + p[0] + ' L ' + p[1], '#f0f0f8', 1, ' opacity=".5"');
}

function linBox(d, s){ var i = nid(); d.defs.push('<linearGradient id="' + i + '" x1="1" y1="0" x2="0" y2="1">' + stops(s) + '</linearGradient>'); return 'url(#' + i + ')'; }
/* plumes sculptées en écailles (rangées du bas d'abord : celles du haut recouvrent) */
function ecailles(x0, y0, cols, rows, dx, dy, w, h, fill, garder){
  var s = '';
  for(var r = rows - 1; r >= 0; r--) for(var c = 0; c < cols; c++){
    var x = x0 + c * dx + (r % 2) * dx / 2, y = y0 + r * dy;
    if(garder && !garder(x, y)) continue;
    var dd = 'M' + f1(x - w / 2) + ' ' + f1(y - h * .4) + ' C ' + f1(x - w / 2) + ' ' + f1(y + h * .55) + ' ' + f1(x + w / 2) + ' ' + f1(y + h * .55) + ' ' + f1(x + w / 2) + ' ' + f1(y - h * .4);
    s += F(dd + ' Z', fill) + L(dd, '#1a1424', 1.4, ' opacity=".6"') + L('M' + f1(x + w * .1) + ' ' + f1(y + h * .3) + ' C ' + f1(x + w * .32) + ' ' + f1(y + h * .22) + ' ' + f1(x + w * .4) + ' ' + f1(y) + ' ' + f1(x + w * .4) + ' ' + f1(y - h * .2), '#eef0ff', .9, ' opacity=".35"');
  }
  return s;
}
function coulure(x, y, lg, ep, op){ return L('M' + f1(x) + ' ' + f1(y) + ' C ' + f1(x + ep * .6) + ' ' + f1(y + lg * .3) + ' ' + f1(x - ep * .6) + ' ' + f1(y + lg * .6) + ' ' + f1(x + ep * .3) + ' ' + f1(y + lg), '#14101c', ep, ' opacity="' + (op || .3) + '" style="filter:blur(1.4px)"') + C(f1(x + ep * .3), f1(y + lg), f1(ep * .45), '#14101c', ' opacity="' + (op || .3) + '"'); }

function dessin(){
  var d = new B.Dessin(), s = '', R = B.rng(11);
  var pierre = '#6f717e', aileC = '#646678', socleC = '#746d63', violet = '#b46cff';
  var gCorps = lin(d, 430, 110, 230, 330, [[0, clair(pierre, .32)], [.45, pierre], [1, sombre(pierre, .62)]]);
  var gTete = lin(d, 250, 84, 40, 200, [[0, clair(pierre, .34)], [.45, pierre], [1, sombre(pierre, .55)]]);
  var gGriffe = lin(d, 0, 320, 0, 362, [[0, '#56546a'], [1, '#221e2a']]);
  var gEcaille = linBox(d, [[0, clair(pierre, .28)], [.5, pierre], [1, sombre(pierre, .45)]]);
  var haloV = d.halo('#f4e0ff', '#a24cff');
  var flou2 = d.flou(2), flou4 = d.flou(4), flou8 = d.flou(8), flou12 = d.flou(12);

  /* ===== ombre au sol, une lueur violette qui monte du socle ===== */
  s += '<ellipse cx="282" cy="398" rx="236" ry="14" fill="#000" opacity=".55"/>';
  s += '<ellipse cx="300" cy="200" rx="200" ry="150" fill="#6a2aa8" opacity=".12" filter="' + flou12 + '"/>';

  /* ===== l'aile du fond, levée derrière la tête, dans l'ombre ===== */
  var gAileF = lin(d, 270, 10, 90, 140, [[0, sombre(aileC, .22)], [1, sombre(aileC, .7)]]);
  var bras2 = [[318, 132], [300, 80], [278, 36], [250, 24]], ptsB2 = [];
  for(var i = 0; i <= 10; i++) ptsB2.push(bez(bras2, i / 10));
  [[[250, 28], [150, 8], 22], [[244, 40], [122, 26], 24], [[238, 52], [104, 52], 25], [[234, 66], [94, 84], 25], [[234, 80], [98, 116], 24]].forEach(function(f, i){
    s += plume(d, f[0], f[1], f[2], -4, gAileF, {pointe:true, lune:i < 2, casse:i === 2, base:aileC}).s;
  });
  [[[270, 50], [200, 40], 18], [[264, 66], [190, 70], 19], [[264, 82], [194, 100], 18]].forEach(function(f){ s += plume(d, f[0], f[1], f[2], -2, sombre(aileC, .45), {}).s; });
  s += Pw(ruban(ptsB2, 20, 13), lin(d, 300, 30, 240, 150, [[0, sombre(aileC, .25)], [1, sombre(aileC, .65)]]), 2.6);
  for(var kb = 2; kb <= 8; kb++){ var pb = bez(bras2, kb / 10); s += plume(d, [pb[0] - 2, pb[1] + 2], [pb[0] - 24, pb[1] + 18], 16, -1.5, sombre(aileC, .4), {}).s; }
  s += L(lisse(ptsB2.map(function(p){ return [p[0] + 4, p[1] - 5]; }), false), LUNE, 2, ' opacity=".45"');

  /* ===== l'aile proche, levée vers la lune ===== */
  var gAile = lin(d, 540, 30, 360, 290, [[0, clair(aileC, .32)], [.5, aileC], [1, sombre(aileC, .55)]]);
  var gAile2 = lin(d, 540, 30, 360, 290, [[0, clair(aileC, .18)], [.5, sombre(aileC, .12)], [1, sombre(aileC, .62)]]);
  [[[454, 32], [534, 42], 24], [[458, 44], [540, 82], 26], [[460, 58], [540, 122], 26], [[460, 72], [532, 160], 26], [[458, 86], [518, 196], 25], [[454, 98], [500, 226], 24], [[448, 108], [480, 250], 23]].forEach(function(f, i){
    s += plume(d, f[0], f[1], f[2], 3, i % 2 ? gAile2 : gAile, {pointe:true, lune:i < 2, casse:i === 4, base:aileC}).s;
  });
  [[[440, 116], [462, 264], 24], [[424, 122], [440, 276], 24], [[408, 128], [418, 284], 24], [[392, 132], [396, 288], 23], [[376, 136], [374, 286], 22]].forEach(function(f, i){ s += plume(d, f[0], f[1], f[2], 2, i % 2 ? gAile2 : gAile, {}).s; });
  /* grandes couvertures (avec leur ombre portée), puis petites, en écailles */
  for(var k = 6; k >= 0; k--){ var t = k / 6, rx = 376 + 86 * t, ry = 124 - 56 * t;
    s += F('M' + f1(rx + 4) + ' ' + f1(ry + 6) + ' L ' + f1(rx + 22 + 20 * t) + ' ' + f1(ry + 56 - 4 * t) + ' L ' + f1(rx + 34 + 20 * t) + ' ' + f1(ry + 50 - 4 * t) + ' Z', '#0a0810', ' opacity=".35" filter="' + flou2 + '"');
    s += plume(d, [rx, ry], [rx + 14 + 20 * t, ry + 48 - 4 * t], 22, 2, k % 2 ? gAile2 : gAile, {}).s; }
  var bras1 = [[352, 140], [370, 88], [410, 36], [456, 28]], ptsB1 = [];
  for(var i2 = 0; i2 <= 12; i2++) ptsB1.push(bez(bras1, i2 / 12));
  for(var k2 = 9; k2 >= 1; k2--){ var p = bez(bras1, k2 / 10); s += plume(d, [p[0] + 2, p[1] + 4], [p[0] + 16, p[1] + 30], 18, 1.5, k2 % 2 ? gAile2 : gAile, {}).s; }
  var arete = ruban(ptsB1, 26, 16);
  s += Pw(arete, lin(d, 456, 28, 350, 150, [[0, clair(aileC, .35)], [.5, aileC], [1, sombre(aileC, .45)]]), 2.8);
  s += G(clip(d, [arete]), grainPierre(340, 20, 130, 130, 70, R, aileC) + L(lisse(ptsB1.map(function(p){ return [p[0] - 4, p[1] + 6]; }), false), '#1a1424', 2, ' opacity=".35"'));
  s += L(lisse(ptsB1.map(function(p){ return [p[0] + 3, p[1] - 7]; }), false), LUNE, 2.6, ' opacity=".7"');
  s += mousse(400, 44, 12, 3, 9, 41);
  s += plume(d, [454, 26], [490, 16], 14, -2, gAile, {lune:true}).s;
  s += fissure(478, 120, 9, 1.2, 9, R, 1.8) + fissure(408, 58, 7, 2.1, 6, R, 1.6) + fissure(420, 170, 8, 1.5, 7, R, 1.6);
  s += lichen(428, 158, 7, R, '#c8c890') + lichen(508, 110, 5, R, '#d8a848') + lichen(396, 214, 6, R, '#b8c880') + lichen(470, 200, 4, R, '#c8c890');

  /* ===== la queue en éventail ===== */
  [[[392, 296], [500, 318], 18], [[392, 302], [504, 332], 18], [[390, 308], [490, 344], 17]].forEach(function(f, i){ s += plume(d, f[0], f[1], f[2], 2, i % 2 ? gAile2 : gAile, {pointe:true, lune:i === 0}).s; });

  /* ===== le socle brisé ===== */
  var gFace = lin(d, 404, 330, 150, 400, [[0, clair(socleC, .2)], [.5, socleC], [1, sombre(socleC, .55)]]);
  var gCote = lin(d, 428, 330, 392, 392, [[0, sombre(socleC, .3)], [1, sombre(socleC, .7)]]);
  var gDessus = lin(d, 428, 318, 146, 330, [[0, clair(socleC, .4)], [1, clair(socleC, .05)]]);
  s += Pw('M130 384 L 412 384 L 436 374 L 436 386 L 412 398 L 130 398 Z', gFace, 2.6) + L('M412 384 L 412 398', O, 2) + L('M132 386 L 410 386', clair(socleC, .4), 1.2, ' opacity=".5"');
  s += Pw('M392 344 L 416 332 L 416 374 L 392 384 Z', gCote, 2.6);
  var face = 'M160 344 L 392 344 L 392 354 L 380 362 L 387 372 L 376 384 L 160 384 Z';
  s += Pw(face, gFace, 2.8);
  s += Pw('M392 354 L 380 362 L 387 372 L 376 384 L 392 384 Z', lin(d, 392, 354, 376, 384, [[0, clair(socleC, .5)], [1, clair(socleC, .15)]]), 2);
  var tf = grainPierre(160, 344, 232, 40, 80, R, socleC) + F('M160 344 L 392 344 L 392 352 L 160 352 Z', '#000', ' opacity=".3"');
  [176, 206, 236, 318, 346, 366].forEach(function(x, i){ tf += coulure(x, 350, 16 + (i * 7) % 18, 3 + i % 2, .28); });
  s += G(clip(d, [face]), tf);
  /* le signe du Corbeau gravé dans la pierre, qui luit faiblement */
  var sg = T2('M-12 -6 C -6 -13 6 -13 12 -6 L 24 -3 L 12 0 C 12 8 5 12 -2 12 C -9 12 -16 8 -17 3 L -8 1 L -13 -2 Z', 340, 364);
  s += C(340, 364, 17, 'none', ' stroke="' + violet + '" stroke-width="5" opacity=".35" filter="' + flou4 + '"');
  s += C(340, 364, 17, 'none', ' stroke="#1a1418" stroke-width="3"') + C(341, 365, 17, 'none', ' stroke="' + clair(socleC, .5) + '" stroke-width="1" opacity=".5"') + C(340, 364, 17, 'none', ' stroke="' + violet + '" stroke-width="1.2" opacity=".6"');
  s += F(sg, '#1a1418', ' opacity=".85"') + L(sg, violet, 1.5, ' opacity=".8"') + L(sg, violet, 4, ' opacity=".4" filter="' + flou2 + '"') + C(336, 359, 1.5, '#f0d8ff');
  /* la corniche moulurée et le dessus */
  s += Pw('M146 330 L 404 330 L 428 318 L 428 326 L 404 338 L 400 344 L 154 344 L 146 338 Z', gFace, 2.6);
  s += L('M148 338 L 402 338', sombre(socleC, .55), 2, ' opacity=".75"') + L('M150 333 L 402 333', clair(socleC, .45), 1.4, ' opacity=".6"');
  s += Pw('M146 330 L 404 330 L 428 318 L 172 318 Z', gDessus, 2.4);
  s += L('M172 318 L 428 318', LUNE, 1.6, ' opacity=".5"') + L('M404 330 L 428 318', LUNE, 1.6, ' opacity=".5"');
  s += fissure(258, 344, 7, 1.3, 6, R, 2.2) + fissure(196, 384, 5, -1.7, 5, R, 1.8) + fissure(410, 340, 6, 1.8, 5, R, 1.6);
  s += lichen(190, 370, 6, R, '#c8c890') + lichen(300, 372, 5, R, '#d8a848') + lichen(232, 378, 4, R, '#c8c890') + lichen(406, 356, 5, R, '#b8c880');
  s += mousse(166, 328, 18, 3, 14, 3) + mousse(394, 384, 22, 3, 14, 5) + mousse(146, 383, 14, 3, 10, 7) + mousse(424, 320, 8, 2, 6, 9);

  /* ===== le corps voûté ===== */
  var corps = 'M236 200 C 244 160 292 120 344 120 C 404 120 436 178 430 244 C 426 288 400 316 360 322 C 310 328 264 308 246 276 C 230 250 228 224 236 200 Z';
  s += Pw(corps, gCorps, 3);
  var tc = '<rect x="220" y="110" width="220" height="220" fill="' + rad(d, 380, 160, 190, [[0, '#ffffff', .1], [.5, '#ffffff', 0], [1, '#0a0612', .6]]) + '"/>';
  tc += grainPierre(230, 118, 200, 205, 140, R, pierre);
  tc += ecailles(244, 196, 6, 7, 16, 14, 18, 16, gEcaille, function(x, y){ return x < 330 - (y - 196) * .1 && y < 300; });
  tc += coulure(370, 150, 60, 5, .25) + coulure(392, 190, 50, 4, .2) + coulure(350, 240, 40, 4, .2);
  tc += F('M352 134 C 396 146 424 190 426 236 C 414 204 390 168 352 146 Z', '#ffffff', ' opacity=".12"');
  s += G(clip(d, [corps]), tc);
  [[[392, 150], [428, 190], 20], [[376, 140], [414, 176], 21], [[360, 134], [398, 164], 21], [[344, 130], [380, 156], 20], [[384, 168], [420, 214], 19], [[368, 158], [404, 198], 20], [[352, 150], [386, 184], 19]].forEach(function(f, i){
    s += plume(d, f[0], f[1], f[2], 2, i % 2 ? gEcaille : gCorps, {pointe:false, lune:i < 4}).s;
  });
  s += L('M300 126 C 330 120 352 124 366 132', LUNE, 2.6, ' opacity=".6"');
  /* la fissure qui luit (quelque chose dort dans la pierre) */
  var fl = 'M318 176 L 330 190 L 324 204 L 340 218 L 334 236 L 350 252 L 346 266';
  s += L(fl, violet, 7, ' opacity=".4" filter="' + flou4 + '"') + L(fl, '#120c18', 2.8) + L(fl, '#e6c4ff', 1.1, ' opacity=".9"');
  s += L('M330 190 L 342 186 M340 218 L 352 222', '#120c18', 1.6);
  s += mousse(360, 314, 18, 3, 10, 13) + mousse(232, 196, 10, 3, 8, 17) + mousse(330, 132, 12, 3, 8, 19);

  /* ===== la cuisse emplumée, la patte d'oiseau, les serres ===== */
  var cuisse = 'M304 252 C 340 232 398 246 410 284 C 418 312 396 328 364 326 C 328 324 298 300 290 276 C 286 264 292 256 304 252 Z';
  s += Pw(cuisse, lin(d, 412, 236, 290, 326, [[0, clair(pierre, .28)], [.5, pierre], [1, sombre(pierre, .55)]]), 3);
  var tq = grainPierre(288, 236, 126, 92, 50, R, pierre) + ecailles(300, 262, 7, 3, 16, 14, 18, 16, gEcaille) + '<rect x="286" y="230" width="130" height="100" fill="' + rad(d, 380, 250, 120, [[0, '#ffffff', 0], [.6, '#ffffff', 0], [1, '#0a0612', .55]]) + '"/>';
  s += G(clip(d, [cuisse]), tq);
  s += L('M314 248 C 350 236 396 252 408 280', LUNE, 2.2, ' opacity=".6"');
  [[398, 296], [384, 304], [368, 308], [352, 308], [336, 304], [320, 296], [306, 286]].forEach(function(p, i){ s += plume(d, [p[0] - 6, p[1] - 12], [p[0] + 10, p[1] + 16], 14, 1.5, i % 2 ? sombre(pierre, .3) : gEcaille, {pointe:true, trait:1.8}).s; });
  s += Pw('M360 316 C 334 322 304 322 276 320 C 270 326 270 334 276 338 C 304 338 334 336 362 328 Z', lin(d, 0, 316, 0, 338, [[0, clair(pierre, .22)], [1, sombre(pierre, .5)]]), 2.6);
  for(var k3 = 0; k3 < 7; k3++){ var sx = 286 + k3 * 10; s += L('M' + sx + ' 322 q 3 7 0 14', '#1a1424', 1.3, ' opacity=".55"'); }
  var gDoigt = lin(d, 290, 322, 230, 350, [[0, clair(pierre, .22)], [1, sombre(pierre, .45)]]);
  s += Pw(ruban([[290, 330], [304, 334], [312, 336]], 12, 9), gDoigt, 2.2) + griffe(312, 336, 12, 20, 4, gGriffe);
  [[[278, 328], [256, 329], [240, 334]], [[280, 333], [264, 339], [254, 346]], [[284, 335], [278, 344], [276, 352]]].forEach(function(f){
    var z = f[2]; s += Pw(ruban(f, 15, 11), gDoigt, 2.4);
    for(var j = 0; j < 2; j++){ var m = f[j + 1]; s += L('M' + (m[0] - 4) + ' ' + (m[1] - 5) + ' q 3 4 1 9', '#1a1424', 1.2, ' opacity=".55"'); }
    var a = Math.atan2(z[1] - f[1][1], z[0] - f[1][0]) * 180 / Math.PI;
    s += griffe(z[0], z[1], a + 50, 24, 5, gGriffe);
  });

  /* ===== le cou ===== */
  s += Pw('M212 130 C 246 116 292 122 322 146 L 302 214 C 268 214 236 204 212 188 Z', gCorps, 2.8);
  s += G(clip(d, ['M212 130 C 246 116 292 122 322 146 L 302 214 C 268 214 236 204 212 188 Z']), ecailles(220, 140, 6, 5, 16, 14, 18, 16, gEcaille));

  /* ===== la tête de corbeau ===== */
  var tete = 'M248 160 C 254 120 232 86 194 84 C 164 84 144 100 136 122 C 130 142 132 162 142 174 C 160 192 204 198 232 190 C 246 184 248 172 248 160 Z';
  s += Pw(tete, gTete, 3);
  var th = '<rect x="128" y="80" width="124" height="120" fill="' + rad(d, 222, 104, 100, [[0, '#ffffff', .12], [.5, '#ffffff', 0], [1, '#0a0612', .55]]) + '"/>' + grainPierre(132, 84, 118, 110, 70, R, pierre);
  th += ecailles(176, 146, 5, 4, 15, 12, 16, 14, gEcaille, function(x, y){ return x > 170 + (y - 146) * .3; });
  th += coulure(176, 140, 44, 4, .35) + coulure(190, 142, 30, 3, .25);
  s += G(clip(d, [tete]), th);
  s += L('M176 88 C 210 82 240 102 246 146', LUNE, 2.6, ' opacity=".65"');
  /* la crête : deux plumes en cornes, rejetées en arrière */
  s += plume(d, [228, 108], [292, 82], 16, -4, gTete, {pointe:true, lune:true, trait:2.6}).s + plume(d, [212, 96], [276, 52], 19, -5, gTete, {pointe:true, lune:true, trait:2.6}).s;
  /* le bec : lourd, crochu, entrouvert, une lueur au fond */
  var gBec = lin(d, 150, 116, 36, 196, [[0, clair('#666676', .38)], [.5, '#5c5c6c'], [1, sombre('#5c5c6c', .55)]]);
  s += Pw('M150 170 C 120 170 88 176 60 184 C 52 186 50 192 54 195 C 86 196 120 192 152 184 Z', gBec, 2.6);
  s += L('M148 178 C 120 182 90 186 62 190', '#1a1424', 1.2, ' opacity=".5"');
  s += F('M60 172 C 92 163 122 161 150 165 L 150 171 C 120 171 88 177 58 185 Z', '#140a1c');
  s += '<ellipse cx="112" cy="171" rx="30" ry="4.5" fill="' + violet + '" opacity=".6" filter="' + flou2 + '"/><ellipse cx="128" cy="168" rx="10" ry="2" fill="#f0d8ff" opacity=".6" filter="' + flou2 + '"/>';
  var becH = 'M150 120 C 116 118 76 130 50 156 C 38 168 32 180 38 190 C 44 180 52 174 62 171 C 92 163 122 161 152 166 Z';
  s += Pw(becH, gBec, 2.8);
  s += G(clip(d, [becH]), grainPierre(36, 116, 116, 76, 40, R, '#5c5c6c') + L('M140 140 C 116 142 90 150 66 166', '#1a1424', 1.4, ' opacity=".45"'));
  s += L('M144 124 C 116 124 82 136 58 158', LUNE, 2.2, ' opacity=".65"');
  s += fissure(100, 132, 5, 1.9, 4, R, 1.4);
  s += F('M116 138 C 122 135 128 135 132 137 C 128 139 122 140 116 138 Z', '#120a18');
  /* éclat du bout du bec : un morceau manque */
  s += Pw('M72 146 L 80 141 L 86 146 L 80 150 Z', clair('#5c5c6c', .4), 1.6);
  /* les soies qui couvrent la base du bec */
  [[162, 150, 134, 156], [160, 140, 128, 144], [162, 130, 130, 132], [164, 120, 134, 120]].forEach(function(b, i){ s += plume(d, [b[0], b[1]], [b[2], b[3]], 11, i % 2 ? 1.5 : -1.5, i % 2 ? sombre(pierre, .2) : gTete, {trait:1.6}).s; });
  /* l'orbite creuse, l'œil de verre, l'arcade mauvaise */
  s += '<ellipse cx="188" cy="134" rx="18" ry="13" fill="#120a18" transform="rotate(-8 188 134)"/>';
  s += '<circle cx="188" cy="134" r="48" fill="' + haloV + '" opacity=".75"/>';
  s += Pw('M175 134 C 175 125 181 121 189 121 C 197 121 202 127 201 135 C 200 142 194 146 188 146 C 180 146 175 141 175 134 Z', rad(d, 192, 130, 14, [[0, '#ffffff'], [.25, '#f2d6ff'], [.6, '#b462ff'], [1, '#4a1478']]), 2);
  s += F('M183 128 L 192 128 L 191 132 L 184 132 Z', '#fff', ' opacity=".9"') + C(196, 139, 1.4, '#fff', ' opacity=".7"');
  s += Pw('M152 128 C 168 110 206 106 230 118 C 216 120 202 122 192 125 C 178 130 164 134 152 128 Z', lin(d, 230, 106, 152, 134, [[0, clair(pierre, .25)], [1, sombre(pierre, .55)]]), 2.6);
  s += L('M162 120 C 178 112 204 110 226 116', LUNE, 1.6, ' opacity=".6"');
  /* plumes de gorge, larges et pointues, en jabot */
  [[238, 186, 254, 222], [222, 190, 236, 232], [204, 192, 216, 238], [186, 190, 196, 238], [168, 186, 176, 232], [152, 180, 158, 224]].forEach(function(h, i){
    s += plume(d, [h[0], h[1]], [h[2], h[3]], 20, i % 2 ? 2 : -2, i % 2 ? gCorps : sombre(pierre, .15), {pointe:true, trait:2.2}).s;
  });

  /* ===== le bras : épaule, coude, main griffue agrippée au bord ===== */
  var gBras = lin(d, 330, 170, 190, 330, [[0, clair(pierre, .3)], [.5, pierre], [1, sombre(pierre, .55)]]);
  var bras = 'M278 168 C 258 186 248 210 246 234 C 244 248 236 262 226 278 C 216 292 206 300 196 308 L 222 324 C 236 312 252 300 264 290 C 274 282 286 276 294 274 C 292 266 290 262 288 258 C 306 246 324 226 328 202 C 332 180 316 164 300 162 C 290 162 284 164 278 168 Z';
  s += Pw(bras, gBras, 3);
  var tbr = grainPierre(196, 160, 136, 166, 60, R, pierre) + '<rect x="190" y="150" width="150" height="180" fill="' + rad(d, 312, 186, 120, [[0, '#ffffff', .14], [.45, '#ffffff', 0], [1, '#0a0612', .6]]) + '"/>';
  /* l'épaule couverte de petites plumes, le biceps, le coude, les muscles de l'avant-bras */
  tbr += G(clip(d, ['M276 166 C 296 156 330 168 328 200 C 320 216 300 222 284 216 C 270 208 262 186 276 166 Z']), ecailles(272, 170, 5, 4, 13, 11, 14, 13, gEcaille));
  tbr += F('M246 234 C 244 248 236 262 226 278 C 216 292 206 300 196 308 L 206 314 C 220 300 238 280 250 262 C 258 248 262 230 262 210 Z', '#0a0612', ' opacity=".28"');
  tbr += L('M262 236 C 268 246 276 254 288 258', '#1a1424', 1.8, ' opacity=".55"') + L('M288 260 L 294 274', '#eef0ff', 1.2, ' opacity=".4"');
  tbr += L('M276 266 C 262 280 246 296 228 312', '#1a1424', 1.6, ' opacity=".45"') + L('M240 262 C 232 276 222 288 210 298', '#eef0ff', 1, ' opacity=".25"');
  s += G(clip(d, [bras]), tbr);
  s += L('M306 166 C 326 176 330 206 318 228 C 308 244 296 254 288 258', LUNE, 2.2, ' opacity=".6"') + fissure(300, 230, 5, 2.3, 4, R, 1.5) + lichen(304, 240, 4, R, '#c8c890');
  /* la main */
  var gMain = lin(d, 230, 300, 160, 350, [[0, clair(pierre, .22)], [1, sombre(pierre, .48)]]);
  [[[214, 322], [218, 332], [216, 341]], [[206, 322], [198, 333], [192, 341]], [[198, 318], [184, 326], [172, 336]], [[192, 312], [176, 316], [160, 326]]].forEach(function(f){
    var z = f[2]; s += Pw(ruban(f, 13, 10), gMain, 2.4);
    s += L('M' + (f[1][0] - 3) + ' ' + (f[1][1] - 4) + ' q 3 3 1 8', '#1a1424', 1.2, ' opacity=".55"');
    var a = Math.atan2(z[1] - f[1][1], z[0] - f[1][0]) * 180 / Math.PI;
    s += griffe(z[0], z[1], a + 45, 22, 4.5, gGriffe);
  });
  s += Pw('M190 306 C 204 298 224 304 226 318 C 226 328 212 332 198 328 C 186 324 182 314 190 306 Z', gMain, 2.4);
  s += L('M196 304 C 206 300 218 304 222 312', LUNE, 1.4, ' opacity=".5"');

  /* ===== éclats qui se détachent, poussière ===== */
  var cE = lin(d, 0, 320, 0, 400, [[0, clair(socleC, .3)], [1, sombre(socleC, .3)]]);
  s += eclat(400, 360, 5, .3, cE, R) + eclat(408, 380, 3.5, 1, cE, R) + eclat(108, 390, 7, .2, cE, R) + eclat(124, 394, 4, 2, cE, R) + eclat(456, 390, 8, .7, cE, R) + eclat(474, 394, 4, 1.4, cE, R);
  s += eclat(512, 216, 4, .5, gAile, R) + eclat(522, 240, 2.8, 1.2, gAile, R) + eclat(112, 70, 3.4, .8, gAileF, R) + eclat(100, 92, 2.4, .2, gAileF, R);
  for(var k4 = 0; k4 < 30; k4++){ s += C(f1(384 + R() * 64), f1(352 + R() * 44), f1(.5 + R() * 1.2), '#c8c0d0', ' opacity="' + f1(.2 + R() * .4) + '"'); }
  s += L('M400 350 l 0 -8 M408 370 l 0 -6 M512 206 l 0 -8 M112 60 l 0 -7', '#c8c0d0', 1, ' opacity=".45"');
  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.gargouille = {nom:'La Gargouille-corbeau', rang:'tard', pv:1000, lieu:'Le clocher · enquête 4 ou après',
  livre:'« La pierre ne sent rien. Il faudra un pouvoir qu\'on n\'a pas encore. »',
  combo:['+❄️🥄✨ Le givre, le bruit, puis la lumière', '!✨ Piège : la lumière en premier'], dessin:dessin};
})();
