/* Le rat d'égout : maigre, hargneux, poil hirsute et sale, ramassé, prêt à bondir */
(function(){
var B = window.BT, P = B.P, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE, N = 0;
function f1(v){ return (+v).toFixed(1); }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
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
/* un membre effilé qui suit des points, une largeur par point */
function tube(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2;
    G.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); D.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisse(G.concat([bout(n - 1, n - 2, ws[n - 1])], D.slice().reverse(), [bout(0, 1, ws[0])]), true), g: G, dr: D};
}
/* des points régulièrement posés le long d'une ligne brisée */
function lelong(pts, n){
  var out = [], m = pts.length - 1;
  for(var k = 0; k <= n; k++){ var t = k / n * m, i = Math.min(m - 1, Math.floor(t)); out.push(lerp(pts[i], pts[i + 1], t - i)); }
  return out;
}
/* un bord de poil hirsute : des mèches courbes et inégales ; v pousse les pointes (vers l'arrière) */
function hirsute(pts, haut, couleur, seed, v, trait){
  var R = B.rng(seed), n = pts.length, s = 'M' + pt(pts[0]), nr = [];
  for(var k = 0; k < n - 1; k++){
    var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l, h = haut * (.35 + R() * 1.05), w = .5 + R() * .9;
    var tip = [(a[0] + b[0]) / 2 + nx * h + v[0] * w, (a[1] + b[1]) / 2 + ny * h + v[1] * w];
    s += ' Q ' + pt([a[0] + nx * h * .5 + v[0] * .2, a[1] + ny * h * .5 + v[1] * .2]) + ' ' + pt(tip) + ' Q ' + pt([b[0] + nx * h * .2 + v[0] * .3, b[1] + ny * h * .2 + v[1] * .3]) + ' ' + pt(b);
    nr.push([nx, ny]);
  }
  nr.push(nr[n - 2]);
  for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 18, q[1] - nr[k2][1] * 18]); }
  return P(s + ' Z', couleur, ' stroke-width="' + (trait || 2.4) + '"');
}
/* des mèches de poil tirées au hasard dans une ellipse, couchées vers l'arrière */
function poils(cx, cy, rx, ry, n, seed, cH, cB, op, ang){
  var R = B.rng(seed), s = '', ca = Math.cos(ang || .35), sa = Math.sin(ang || .35);
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, l = 7 + R() * 9, c = y < cy - ry * .15 ? cH : cB;
    s += L('M' + f1(x) + ' ' + f1(y) + ' q ' + f1(ca * l * .5 - sa * 2) + ' ' + f1(sa * l * .5 + ca * 2) + ' ' + f1(ca * l) + ' ' + f1(sa * l), c, 1.4, ' opacity="' + f1((op || .4) + R() * .2) + '"');
  }
  return s;
}
/* une touffe emmêlée (sans contour) */
function meche(x, y, ang, lg, lar, coul, courbe, op){
  var ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, k = courbe || 0;
  var tip = [x + ca * lg + nx * k, y + sa * lg + ny * k], m = [x + ca * lg * .5 + nx * k * .6, y + sa * lg * .5 + ny * k * .6];
  return F('M' + pt([x + nx * lar / 2, y + ny * lar / 2]) + ' Q ' + pt([m[0] + nx * lar * .45, m[1] + ny * lar * .45]) + ' ' + pt(tip) + ' Q ' + pt([m[0] - nx * lar * .3, m[1] - ny * lar * .3]) + ' ' + pt([x - nx * lar / 2, y - ny * lar / 2]) + ' Z', coul, ' opacity="' + (op || 1) + '"');
}
function meches(cx, cy, rx, ry, n, seed, cs, ang, lg){
  var R = B.rng(seed), s = '';
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    s += meche(x, y, ang + (R() - .5) * .6, (lg || 14) * (.6 + R() * .7), 5 + R() * 5, y < cy ? cs[0] : cs[1], (R() - .5) * 8, .45 + R() * .35);
  }
  return s;
}

function dessin(){
  var d = new B.Dessin(), u = 'ratdegout' + (++N) + '_', nid = 0, s = '';
  function id(){ return u + (++nid); }
  function clip(chemin){ var i = id(); d.defs.push('<clipPath id="' + i + '"><path d="' + chemin + '"/></clipPath>'); return ' clip-path="url(#' + i + ')"'; }
  function rad(stops, cx, cy, r){ var i = id(); d.defs.push('<radialGradient id="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</radialGradient>'); return 'url(#' + i + ')'; }
  function lin(stops, x1, y1, x2, y2){ var i = id(); d.defs.push('<linearGradient id="' + i + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</linearGradient>'); return 'url(#' + i + ')'; }
  /* la crasse : des taches tirées d'un bruit, collées au pelage */
  var cr = id();
  d.defs.push('<filter id="' + cr + '" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="21" result="t"/>' +
    '<feColorMatrix in="t" type="matrix" values="0 0 0 0 .16  0 0 0 0 .14  0 0 0 0 .1  5 0 0 0 -2.9"/><feComposite in2="SourceAlpha" operator="in"/></filter>');
  var CRASSE = ' filter="url(#' + cr + ')"';
  var flou2 = d.flou(2), flou4 = d.flou(4), flou8 = d.flou(8);
  var poil = '#74626a', clairP = '#a8949c', sombreP = '#2a1e26', rose = '#dc94a4', vase = '#4e5a34';
  var ge = id();
  d.defs.push('<radialGradient id="' + ge + '" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#fff2a0"/><stop offset=".45" stop-color="#ff4a2a"/><stop offset="1" stop-color="#7a0a14"/></radialGradient>');
  /* une griffe noire et courbe, avec son reflet */
  function griffe(x, y, lg, ang){
    var ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, tp = [x + ca * lg - nx * lg * .35, y + sa * lg - ny * lg * .35];
    return P('M' + pt([x + nx * 2.4, y + ny * 2.4]) + ' Q ' + pt([x + ca * lg * .6 + nx * 1.4, y + sa * lg * .6 + ny * 1.4]) + ' ' + pt(tp) + ' Q ' + pt([x + ca * lg * .5 - nx * 1.6, y + sa * lg * .5 - ny * 1.6]) + ' ' + pt([x - nx * 2.4, y - ny * 2.4]) + ' Z', '#1e1620', ' stroke-width="1.3"') +
      L('M' + pt([x + nx * .6, y + ny * .6]) + ' Q ' + pt([x + ca * lg * .55 + nx * .8, y + sa * lg * .55 + ny * .8]) + ' ' + pt(lerp([x, y], tp, .85)), '#a8a0b8', .9, ' opacity=".7"');
  }
  /* un doigt rose et maigre, avec sa griffe au bout */
  function doigt(base, ang, lg, w){
    var ca = Math.cos(ang), sa = Math.sin(ang), j = [base[0] + ca * lg * .55, base[1] + sa * lg * .55 - 1.5], tp = [base[0] + ca * lg, base[1] + sa * lg];
    return P(tube([base, j, tp], [w, w * .85, w * .7]).d, d.g(rose), ' stroke-width="2"') + C(f1(j[0]), f1(j[1]), w * .25, '#f8c8d4', ' opacity=".6"') + griffe(tp[0] + ca * 1.5, tp[1] + sa * 1.5, 9, ang + .5);
  }

  /* ---- le sol : l'ombre, une flaque d'eau sale qui reflète l'œil ---- */
  s += '<ellipse cx="278" cy="393" rx="236" ry="18" fill="#000" opacity=".5"/>';
  s += '<ellipse cx="300" cy="391" rx="160" ry="9" fill="#000" opacity=".35" filter="' + flou4 + '"/>';
  var flaque = 'M40 396 C 50 386 110 382 170 384 C 220 386 236 392 226 398 C 210 404 120 406 70 404 C 46 403 32 400 40 396 Z';
  s += F(flaque, lin([[0, '#3a4660'], [1, '#121626']], 0, 0, 0, 1), ' opacity=".9"') + L('M56 394 C 90 390 140 388 190 390', '#bfe8ff', 1.4, ' opacity=".4"') + L('M80 400 L 120 400 M146 398 L 168 398', '#9ac4ff', 1, ' opacity=".3"');
  s += '<ellipse cx="128" cy="396" rx="16" ry="3" fill="#ff4a2a" opacity=".35" filter="' + flou2 + '"/>';

  /* ---- la longue queue annelée, écailleuse, qui fait le tour derrière lui ---- */
  var qc = [[436, 254], [476, 236], [512, 244], [530, 278], [528, 322], [508, 356], [476, 378], [440, 390], [400, 395], [372, 394]];
  var qw = [28, 24, 21, 18, 15, 12, 9, 7, 5, 2.5], qt = tube(qc, qw);
  s += P(qt.d, d.g(B.sombre(rose, .12)));
  s += '<g' + clip(qt.d) + '>';
  var anneaux = '', ecailles = '';
  for(var k = 0; k < 60; k++){ var t = k / 60 * (qc.length - 1.05), i = Math.floor(t), f = t - i, c = lerp(qc[i], qc[i + 1], f), g = lerp(qt.g[i], qt.g[i + 1], f), dr = lerp(qt.dr[i], qt.dr[i + 1], f), m = lerp(c, qc[Math.min(qc.length - 1, i + 1)], .08);
    anneaux += 'M' + pt(g) + ' Q ' + pt(m) + ' ' + pt(dr) + ' ';
    if(k % 2) ecailles += 'M' + pt(lerp(g, dr, .3)) + ' l 1.5 1.5 M' + pt(lerp(g, dr, .65)) + ' l 1.5 1.5 '; }
  s += L(anneaux, '#8a4a5c', 1.2, ' opacity=".7"') + L(ecailles, '#f8d0da', 1, ' opacity=".4"');
  s += F(qt.d, '#000', CRASSE + ' opacity=".55"');
  s += L(lisse(qt.dr.slice(1, 6)), '#ffe0e8', 3, ' opacity=".35"');
  s += '</g>';
  s += L(lisse(qt.dr.slice(1, 6)), LUNE, 1.8, ' opacity=".6"');
  /* quelques poils raides sur la queue */
  var R = B.rng(77), pq = '';
  for(var k2 = 0; k2 < 26; k2++){ var t2 = R() * (qc.length - 2), i2 = Math.floor(t2), p2 = lerp(qt.dr[i2], qt.dr[i2 + 1], t2 - i2), c2 = lerp(qc[i2], qc[i2 + 1], t2 - i2), ox = p2[0] - c2[0], oy = p2[1] - c2[1], ol = Math.hypot(ox, oy) || 1; pq += 'M' + pt(p2) + ' l ' + f1(ox / ol * 5 + 2) + ' ' + f1(oy / ol * 5 + 1) + ' '; }
  s += L(pq, '#d8c0c8', .9, ' opacity=".6"');

  /* ---- les pattes du fond : avant et arrière, plus sombres ---- */
  var paF = tube([[206, 292], [196, 330], [166, 362], [148, 378]], [30, 22, 15, 12]);
  s += P(paF.d, d.g(B.sombre(poil, .45)));
  s += P('M156 372 C 146 382 130 388 118 388 C 116 382 128 376 144 372 Z', d.g(B.sombre(rose, .4)), ' stroke-width="2.4"');
  [[118, 386, 3.3], [126, 389, 3.1], [136, 389, 2.9]].forEach(function(g){ s += griffe(g[0], g[1], 8, g[2]); });
  s += P('M330 384 C 320 390 302 393 290 392 C 288 386 300 382 318 380 Z', d.g(B.sombre(rose, .45)), ' stroke-width="2.4"') + griffe(290, 391, 7, 3.2) + griffe(298, 392, 7, 3.1);

  /* ---- le corps maigre : échine hérissée, flanc creusé, côtes, crasse ---- */
  var cp = [[190, 300], [194, 256], [212, 226], [238, 210], [276, 210], [312, 196], [350, 178], [392, 178], [426, 196], [446, 230], [448, 266], [438, 300], [416, 324], [376, 318], [334, 300], [290, 304], [246, 322], [208, 324]];
  var corps = lisse(cp, true);
  /* l'échine : une crête de poils raides et sales */
  s += hirsute(lelong([[244, 208], [270, 206], [296, 202], [322, 190], [356, 172], [394, 172], [426, 190], [444, 220], [450, 254]], 27), 22, d.g(B.sombre(poil, .08)), 5, [9, -3]);
  /* le ventre : des touffes qui pendent, mouillées */
  s += hirsute(lelong([[436, 302], [414, 326], [376, 320], [334, 302], [290, 306], [246, 324], [208, 326]], 13), 11, d.g(B.sombre(poil, .2)), 9, [7, 4]);
  s += P(corps, d.g(poil));
  s += '<g' + clip(corps) + '>';
  s += F('M204 316 C 240 326 290 306 334 300 C 370 310 400 322 430 306 C 420 330 370 330 330 314 C 290 312 240 334 204 316 Z', '#b8a4ac', ' opacity=".45"');
  s += F(corps, '#000', CRASSE + ' opacity=".75"');
  /* les côtes qui saillent derrière l'épaule, la hanche pointue */
  s += L('M258 240 C 270 264 272 290 262 314 M280 234 C 294 260 296 286 286 308 M302 228 C 316 254 318 280 308 302 M324 222 C 336 246 338 270 330 292', sombreP, 3, ' opacity=".5"');
  s += L('M264 238 C 276 262 278 288 269 310 M286 232 C 300 258 302 284 293 304 M308 226 C 322 252 324 278 315 298 M330 220 C 342 244 344 268 336 288', clairP, 1.6, ' opacity=".4"');
  s += '<ellipse cx="360" cy="214" rx="22" ry="12" transform="rotate(-20 360 214)" fill="' + clairP + '" opacity=".3" filter="' + flou4 + '"/>';
  s += meches(320, 270, 110, 48, 60, 13, [B.clair(poil, .25), B.sombre(poil, .35)], .45, 18);
  s += poils(320, 268, 120, 56, 170, 17, '#d8c6d0', sombreP, .32);
  /* des taches de vase verdâtre, une plaque pelée */
  s += '<ellipse cx="396" cy="300" rx="24" ry="12" fill="' + vase + '" opacity=".45" filter="' + flou4 + '"/><ellipse cx="236" cy="314" rx="16" ry="8" fill="' + vase + '" opacity=".4" filter="' + flou4 + '"/>';
  s += F('M334 214 C 342 206 356 206 362 214 C 358 224 342 226 334 214 Z', '#c4909c', ' opacity=".6"') + L('M336 214 C 344 208 354 208 360 214', '#f0c0cc', 1, ' opacity=".55"');
  /* le bas du corps dans l'ombre */
  s += F(corps, lin([[0, '#000', 0], [.6, '#000', 0], [1, '#0e0814', .5]], 0, 0, 0, 1));
  s += '</g>';
  /* une vieille cicatrice, et le liseré de lune sur l'échine */
  s += L('M380 230 C 392 244 398 260 396 278', '#e0b4c2', 2.6, ' opacity=".8"') + L('M384 240 l 8 -3 M390 252 l 8 -2 M394 264 l 8 0', '#e0b4c2', 1.3, ' opacity=".7"');
  s += L(lisse([[214, 224], [244, 208], [280, 206], [316, 192], [352, 174], [394, 174], [428, 192], [446, 226]]), LUNE, 2.8, ' opacity=".6"');
  /* des gouttes d'eau sale qui tombent des poils du ventre */
  s += P('M300 318 C 299 326 302 332 300 338 C 303 342 307 340 306 336 C 305 330 305 324 306 318 Z', '#bcd8f0', ' stroke-width="1.2" opacity=".75"') + C(301.5, 346, 1.8, '#bcd8f0', ' opacity=".7"');
  s += C(372, 352, 2.2, '#bcd8f0', ' stroke="' + O + '" stroke-width="1" opacity=".8"') + C(371.3, 351.3, .7, '#ffffff');

  /* ---- la patte arrière proche, ramassée sous lui comme un ressort ---- */
  var tibia = tube([[356, 330], [396, 350], [430, 366], [438, 372]], [30, 22, 15, 13]);
  s += F(tibia.d, '#0c0612', ' opacity=".4" filter="' + flou4 + '" transform="translate(-4 4)"');
  s += hirsute(lelong([[366, 350], [396, 362], [426, 374]], 5), 9, d.g(poil), 25, [5, 4]);
  s += P(tibia.d, d.g(B.sombre(poil, .08))) + '<g' + clip(tibia.d) + '>' + F(tibia.d, '#000', CRASSE + ' opacity=".5"') + poils(398, 354, 34, 10, 16, 27, '#d8c6d0', sombreP, .3, .45) + '</g>' + L(lisse(tibia.dr.slice(0, 3)), LUNE, 1.6, ' opacity=".45"');
  var cuisse = lisse([[338, 262], [370, 238], [412, 244], [438, 276], [434, 312], [408, 336], [376, 344], [350, 332], [336, 300]], true);
  s += F(cuisse, '#0c0612', ' opacity=".45" filter="' + flou4 + '" transform="translate(-6 6)"');
  s += hirsute(lelong([[352, 330], [378, 344], [408, 338], [434, 314]], 8), 10, d.g(poil), 21, [6, 3]);
  s += P(cuisse, d.g(B.clair(poil, .05)));
  s += '<g' + clip(cuisse) + '>' + F(cuisse, '#000', CRASSE + ' opacity=".6"') + meches(392, 292, 40, 36, 16, 23, [B.clair(poil, .25), B.sombre(poil, .35)], .7, 14) + poils(392, 292, 42, 40, 40, 23, '#d8c6d0', sombreP, .3, .8) + '</g>';
  s += L('M346 256 C 372 236 414 240 434 268', LUNE, 2.2, ' opacity=".55"');
  /* le jarret et le long pied rose, talon levé, prêt à pousser */
  var pied = 'M440 364 C 446 382 418 391 364 393 C 348 394 342 386 354 382 C 380 378 410 372 430 360 Z';
  s += P(pied, d.g(rose));
  s += L('M370 386 C 390 384 410 380 428 370', '#ffd6de', 1.6, ' opacity=".6"') + L('M380 390 q 4 -4 2 -8 M396 388 q 4 -4 2 -8', '#a85a6c', 1, ' opacity=".5"');
  s += doigt([358, 388], Math.PI + .12, 18, 6.4) + doigt([362, 384], Math.PI - .12, 20, 6.4) + doigt([366, 382], Math.PI - .4, 17, 6);

  /* ---- l'oreille du fond ---- */
  s += P('M170 226 C 160 202 166 182 182 178 C 196 176 200 196 194 220 Z', d.g(B.sombre(poil, .3))) + F('M174 220 C 168 202 172 188 182 186 C 190 188 192 202 188 216 Z', B.sombre(rose, .35));

  /* ---- la grande oreille : peau fine et translucide, la lune passe au travers ---- */
  s += '<g transform="translate(196 232) rotate(30) scale(.78) translate(-196 -232)">';
  var oreille = 'M184 232 C 170 200 174 150 204 132 L 211 130 L 214 141 L 221 130 C 248 136 262 168 256 200 C 250 224 228 238 198 238 Z';
  s += P(oreille, d.g(B.clair(poil, .05)));
  var oin = 'M192 228 C 182 200 186 160 208 146 C 234 142 250 170 246 198 C 240 218 220 230 192 228 Z';
  s += F(oin, rad([[0, '#f8c8d4'], [.5, '#d88498'], [1, '#8a3a52']], .6, .42, .7));
  s += '<ellipse cx="226" cy="178" rx="12" ry="22" transform="rotate(15 226 178)" fill="#ffe8ee" opacity=".35" filter="' + flou4 + '"/>';
  s += L('M208 222 C 212 200 218 178 224 156 M216 196 C 224 190 232 188 238 190 M220 176 C 214 172 206 172 200 176', '#9a3452', 1.1, ' opacity=".6"');
  s += L('M186 196 C 188 164 200 140 210 132 M222 132 C 246 138 262 166 258 196', LUNE, 2.4, ' opacity=".7"');
  s += '</g>';

  /* ---- la tête : basse, tendue vers l'avant, le museau plissé ---- */
  var tete = lisse([[28, 296], [52, 278], [96, 252], [140, 232], [180, 224], [212, 234], [230, 260], [224, 292], [198, 312], [150, 318], [100, 314], [56, 308], [32, 304]], true);
  s += hirsute(lelong([[228, 258], [226, 284], [212, 302], [190, 314], [164, 318]], 7), 10, d.g(B.clair(poil, .04)), 31, [6, 3]);
  s += P(tete, d.g(poil));
  s += '<g' + clip(tete) + '>' + F(tete, '#000', CRASSE + ' opacity=".55"') + meches(170, 272, 50, 34, 18, 37, [B.clair(poil, .25), B.sombre(poil, .35)], .3, 12) + poils(160, 272, 64, 36, 60, 29, '#d8c6d0', sombreP, .32, .2);
  s += F('M40 300 C 80 306 130 310 180 308 C 140 316 80 314 40 300 Z', '#c8b4bc', ' opacity=".5"');
  s += '</g>';
  s += L(lisse([[52, 276], [96, 250], [140, 230], [180, 222], [210, 232]]), LUNE, 2.4, ' opacity=".6"');
  /* les rides du rictus, une cicatrice sur le museau */
  s += L('M62 284 q 6 6 4 14 M74 278 q 7 6 5 15 M86 272 q 6 6 4 14', sombreP, 1.8, ' opacity=".6"') + L('M65 282 q 6 6 4 12 M77 276 q 6 6 4 13', '#d8c6d0', 1.1, ' opacity=".35"');
  s += L('M150 232 L 166 254', '#e0b4c2', 2.2, ' opacity=".75"') + L('M154 240 l 6 -3 M159 247 l 6 -3', '#e0b4c2', 1.2, ' opacity=".6"');

  /* ---- la gueule ouverte : mâchoire du bas, langue, crocs jaunes, bave ---- */
  s += P('M38 306 C 70 312 112 316 152 318 C 142 334 112 344 80 340 C 60 336 46 324 38 306 Z', '#3a0f22') + F('M64 326 C 86 336 116 338 138 330 C 114 326 88 324 64 326 Z', '#b8546e') + F('M48 312 C 80 318 120 320 150 318 C 120 324 80 322 48 312 Z', '#120408', ' opacity=".6"');
  var email = lin([[0, '#f6d27a'], [.6, '#e0a24a'], [1, '#a8652a']], 0, 0, 1, 1);
  s += P('M51 331 C 50 325 50 319 52 313 L 57 313 C 56 319 56 325 57 331 Z', email, ' stroke-width="1.8"');
  s += P('M44 314 C 70 330 102 346 136 344 C 152 343 160 336 160 326 C 150 336 132 340 110 338 C 82 336 60 326 44 314 Z', d.g(poil), ' stroke-width="2.6"');
  s += P('M66 312 L 70 321 L 74 313 Z M82 314 L 86 324 L 90 315 Z M98 315 L 102 325 L 106 316 Z M116 316 L 119 325 L 123 317 Z M132 317 L 135 325 L 139 317 Z', '#efe2b0', ' stroke-width="1.4"');
  s += P('M76 338 L 79 330 L 83 339 Z M96 340 L 99 332 L 103 340 Z', '#e8d8a0', ' stroke-width="1.4"');
  /* les deux grandes incisives orangées, l'une ébréchée */
  s += P('M40 299 C 41 309 43 318 46 327 L 51 325.5 C 49 316 48 307 47.5 300 Z', lin([[0, '#c98a3a'], [1, '#8a5222']], 0, 0, 1, 1), ' stroke-width="2"');
  s += P('M31 297 C 32 309 34 320 37 331 L 40 330.5 L 42 333 L 44 328.5 C 42 318 41 307 40 298 Z', email, ' stroke-width="2.2"');
  s += L('M33.5 302 C 34.5 312 35.5 320 37.5 327', '#fff4c8', 1.2, ' opacity=".8"') + L('M34 314 l 6 -1', '#8a5222', 1, ' opacity=".6"');
  s += P('M140 340 C 141 352 137 362 139 372 C 142 376 147 375 146 370 C 145 362 144 352 145 340 Z', '#d8f0ff', ' stroke-width="1.4" opacity=".85"') + C(142.5, 382, 2, '#d8f0ff', ' opacity=".7"');

  /* ---- le museau rose et mouillé, les moustaches ---- */
  s += '<ellipse cx="25" cy="292" rx="10" ry="8" fill="' + d.g(rose) + '" stroke="' + O + '" stroke-width="3"/>' + F('M19 295 c 2 -3 6 -3 7 0 c -2 2 -5 2 -7 0 Z', '#4a1222') + C(27, 288, 2.4, '#fff', ' opacity=".85"') + C(31, 293, 1, '#fff', ' opacity=".6"');
  s += [[46, 290], [54, 294], [62, 292], [52, 286], [60, 298], [70, 296]].map(function(p){ return C(p[0], p[1], 1.6, sombreP); }).join('');
  s += L('M50 290 C 30 278 14 272 2 270 M52 294 C 32 294 16 298 4 304 M58 298 C 44 306 32 314 22 322 M62 288 C 50 270 40 260 30 252 M66 286 C 60 266 56 254 54 244', '#ece4f0', 1.3, ' opacity=".85"');

  /* ---- l'œil rouge qui brille, le sourcil furieux ---- */
  s += '<circle cx="128" cy="262" r="32" fill="' + d.halo('#ffb0a0', '#ff2a2a') + '" opacity=".75"/>';
  s += F('M108 264 C 116 252 140 248 152 258 C 148 272 124 278 108 264 Z', '#1a0a14', ' opacity=".7"');
  s += P('M112 264 C 118 254 140 252 148 260 C 144 270 124 274 112 264 Z', 'url(#' + ge + ')', ' stroke-width="2.6"') + F('M130 255 C 133 258 133 268 130 271 C 127 268 127 258 130 255 Z', '#2a0408') + C(123, 259, 2.8, '#fff') + C(140, 265, 1.2, '#fff', ' opacity=".7"');
  s += P('M104 256 C 120 240 146 236 164 244 L 160 252 C 144 248 124 250 108 262 Z', d.g(B.sombre(poil, .45)));

  /* ---- la patte avant proche : bras maigre, poignet tendu, doigts écartés, griffes ---- */
  var bras = tube([[238, 266], [258, 316], [232, 352], [212, 372]], [42, 30, 20, 16]);
  s += F(bras.d, '#0c0612', ' opacity=".4" filter="' + flou4 + '" transform="translate(-5 4)"');
  s += hirsute(lelong([[248, 300], [262, 318], [258, 336]], 4), 12, d.g(poil), 51, [8, 3]);
  s += P(bras.d, d.g(poil));
  s += '<g' + clip(bras.d) + '>' + F(bras.d, '#000', CRASSE + ' opacity=".5"') + poils(240, 310, 22, 50, 34, 53, '#d8c6d0', sombreP, .34, 1.2) + '</g>';
  s += L(lisse(bras.dr.slice(0, 3)), LUNE, 2, ' opacity=".55"');
  var main = 'M222 362 C 216 380 196 390 176 389 C 170 382 184 374 202 368 Z';
  s += P(main, d.g(rose), ' stroke-width="2.6"');
  s += doigt([180, 386], Math.PI + .2, 18, 6.2) + doigt([186, 388], Math.PI + .02, 20, 6.2) + doigt([194, 388], Math.PI - .15, 19, 6) + doigt([202, 386], Math.PI - .35, 15, 5.6);
  s += L('M184 380 C 196 376 208 372 216 366', '#ffd6de', 1.4, ' opacity=".55"');

  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.rat = {nom:'Rat d\'égout', rang:'monstre', pv:40, lieu:'Le fond du puits · par bandes de 2 ou 3',
  livre:'« Les rats vivent dans le noir. Ce qui brille leur fait peur : ils se dressent, le ventre à l\'air. »',
  combo:['+✨ S\'ouvre : la lumière', ' Autre chemin : l\'huile', '!🥄 Le renforce : le bruit'], dessin:dessin};
})();
