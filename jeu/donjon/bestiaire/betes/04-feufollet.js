/* Le feu follet : un esprit-flamme bleu, à moitié transparent, qui appelle les héros du bout du doigt */
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
/* une flamme : un bulbe rond en bas, des langues qui montent et se couchent vers l'arrière (la droite) */
function flamme(cx, cy, r, h, lean, seed, nl){
  var R = B.rng(seed), pts = [];
  for(var i = 0; i <= 9; i++){ var a = Math.PI + .5 - i * (Math.PI + 1) / 9, rr = r * (.94 + R() * .1); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .92]); }
  nl = nl || 5;
  for(var k = 0; k < nl; k++){
    var t = k / (nl - 1), x0 = cx + r * (.85 - t * 1.7), mid = 1 - Math.pow((t - .35) * 1.5, 2), hh = h * (.35 + .65 * Math.max(.15, mid)) * (.8 + R() * .35);
    var tip = [x0 + lean * hh / h * (1.1 + R() * .3), cy - r * .5 - hh];
    pts.push([x0 + 4, cy - r * .55 - hh * .45]);
    pts.push([tip[0] - 3, tip[1] + 6]); pts.push(tip); pts.push([tip[0] - 8, tip[1] + 14]);
    if(k < nl - 1) pts.push([x0 - r * .17, cy - r * .62 - hh * .15]);
  }
  return lisse(pts, true);
}

function dessin(){
  var d = new B.Dessin(), u = 'feufollet' + (++N) + '_', nid = 0, s = '';
  function id(){ return u + (++nid); }
  function rad(stops, cx, cy, r, extra){ var i = id(); d.defs.push('<radialGradient id="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (extra || '') + '>' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</radialGradient>'); return 'url(#' + i + ')'; }
  function lin(stops, x1, y1, x2, y2, extra){ var i = id(); d.defs.push('<linearGradient id="' + i + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (extra || '') + '>' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</linearGradient>'); return 'url(#' + i + ')'; }
  var flou1 = d.flou(1), flou2 = d.flou(2), flou4 = d.flou(4), flou8 = d.flou(8), flou16 = d.flou(16);
  /* le masque « à moitié visible » : la moitié droite se dissout */
  var mq = id();
  d.defs.push('<linearGradient id="' + mq + 'g" gradientUnits="userSpaceOnUse" x1="250" y1="0" x2="420" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<mask id="' + mq + '" maskUnits="userSpaceOnUse" x="0" y="0" width="540" height="430"><rect width="540" height="430" fill="url(#' + mq + 'g)"/></mask>');
  var MASQUE = ' mask="url(#' + mq + ')"';
  /* une flamme qui ondule : un bruit qui déforme les bords */
  var on = id();
  d.defs.push('<filter id="' + on + '" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".03 .06" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>');
  var ONDE = 'url(#' + on + ')';
  var c1 = '#0e4a78', c2 = '#1f9ee0', c3 = '#4fdcff', c4 = '#a8f4ff', c5 = '#e8fdff';
  function etoile(x, y, r, c, op){ return F('M' + f1(x) + ' ' + f1(y - r) + ' Q ' + f1(x + r * .16) + ' ' + f1(y - r * .16) + ' ' + f1(x + r) + ' ' + f1(y) + ' Q ' + f1(x + r * .16) + ' ' + f1(y + r * .16) + ' ' + f1(x) + ' ' + f1(y + r) + ' Q ' + f1(x - r * .16) + ' ' + f1(y + r * .16) + ' ' + f1(x - r) + ' ' + f1(y) + ' Q ' + f1(x - r * .16) + ' ' + f1(y - r * .16) + ' ' + f1(x) + ' ' + f1(y - r) + ' Z', c, ' opacity="' + op + '"'); }

  /* ---- la lumière qu'il jette : sur le mur, sur le sol ---- */
  s += '<circle cx="250" cy="200" r="230" fill="' + rad([[0, c3, .28], [.4, c2, .12], [1, c1, 0]], .5, .5, .5) + '"/>';
  s += '<ellipse cx="256" cy="392" rx="190" ry="22" fill="' + rad([[0, c4, .55], [.5, c3, .2], [1, c2, 0]], .5, .5, .5) + '"/>';
  s += '<ellipse cx="262" cy="394" rx="60" ry="6" fill="#000" opacity=".22" filter="' + flou4 + '"/>';
  /* reflets sur le sol mouillé */
  s += L('M150 398 L 196 398 M214 402 L 268 402 M290 398 L 352 398 M196 408 L 222 408 M300 408 L 330 408', c4, 1.6, ' opacity=".35"');

  /* ---- la traînée derrière lui : volutes et poussière d'étincelles qui s'efface ---- */
  var R = B.rng(17);
  s += F(tube([[300, 260], [350, 300], [410, 312], [470, 296], [510, 270]], [40, 34, 24, 12, 3]).d, c2, ' opacity=".18" filter="' + flou8 + '"');
  s += L('M300 286 C 340 320 400 330 450 312 C 480 300 492 280 482 268 C 472 258 456 264 460 276 C 462 284 472 286 476 280', c3, 2.4, ' opacity=".35" filter="' + flou1 + '"');
  s += L('M318 150 C 360 140 400 150 430 176 C 450 194 446 214 430 214 C 418 214 414 200 424 196', c3, 2, ' opacity=".3" filter="' + flou1 + '"');
  for(var k = 0; k < 70; k++){
    var t = R(), x = 290 + t * 230 + (R() - .5) * 30, y = 80 + R() * 260 + t * 20, r = (1 - t) * 3 + R() * 1.6;
    s += C(f1(x), f1(y), f1(r), R() < .3 ? c5 : c3, ' opacity="' + f1((1 - t) * .7 + .1) + '"');
  }

  /* ---- la queue qui s'enroule sous lui ---- */
  var queue = tube([[236, 270], [250, 312], [290, 336], [334, 330], [352, 304], [336, 286], [318, 296], [324, 312]], [60, 44, 30, 22, 14, 9, 5, 2]).d;
  s += '<g' + MASQUE + ' filter="' + ONDE + '">';
  s += F(queue, c2, ' opacity=".35"') + F(queue, c3, ' opacity=".25" transform="translate(-3 -3) scale(1)"');
  s += L('M244 300 C 262 326 300 340 334 328 C 350 318 352 300 338 292 C 326 288 318 298 324 308', c4, 2.4, ' opacity=".55"');
  s += '</g>';

  /* ---- le corps : une silhouette de flamme à quatre langues couchées vers l'arrière, en couches ---- */
  var FL = [[168, 232], [178, 272], [208, 300], [248, 308], [290, 298], [318, 268], [328, 232], [342, 200], [368, 166], [400, 126], [370, 142], [334, 154],
    [342, 118], [354, 80], [368, 46], [338, 70], [302, 114], [298, 76], [302, 36], [310, 6], [282, 34], [256, 82], [242, 112], [230, 98], [228, 78], [236, 56], [210, 82], [188, 126], [174, 180]];
  function couche(k, ky, dy){ return lisse(FL.map(function(p){ var up = p[1] < 230; return [248 + (p[0] - 248) * k, 236 + (p[1] - 236) * (up ? ky : k) + dy]; }), true); }
  var fA = couche(1, 1, 0), fB = couche(.8, .72, 8), fC = couche(.58, .46, 16);
  s += F(couche(1.12, 1.06, 0), c2, ' opacity=".4" filter="' + flou8 + '"');
  s += '<g' + MASQUE + '>';
  s += '<g filter="' + ONDE + '">';
  s += F(fA, lin([[0, c3, .6], [.6, c2, .55], [1, c1, .6]], 0, 0, 0, 1));
  s += F(fA, rad([[0, c1, 0], [.75, c1, 0], [1, '#041a2c', .5]], .48, .62, .6));
  s += L(fA, c4, 1.8, ' opacity=".75"');
  s += F(fB, lin([[0, c4, .6], [.6, c3, .55], [1, c2, .5]], 0, 0, 0, 1));
  s += L(fB, c5, 1.2, ' opacity=".45"');
  s += F(fC, lin([[0, c5, .75], [1, c4, .55]], 0, 0, 0, 1));
  s += '</g>';
  /* les flammèches qui s'échappent par le haut */
  [[322, 0, 6, .7], [384, 40, 5, .8], [262, 30, 4, .5], [414, 104, 5, .8]].forEach(function(m){
    s += F('M' + f1(m[0]) + ' ' + f1(m[1] + m[2] * 3) + ' C ' + f1(m[0] - m[2]) + ' ' + f1(m[1] + m[2]) + ' ' + f1(m[0] + m[3] * 10) + ' ' + f1(m[1] - m[2]) + ' ' + f1(m[0] + 2 + m[3] * 12) + ' ' + f1(m[1] - m[2] * 2) + ' C ' + f1(m[0] + m[2]) + ' ' + f1(m[1]) + ' ' + f1(m[0] + m[2]) + ' ' + f1(m[1] + m[2] * 2) + ' ' + f1(m[0]) + ' ' + f1(m[1] + m[2] * 3) + ' Z', c4, ' opacity=".75"');
  });
  /* les volutes qui tournent dans la flamme */
  s += L('M300 200 C 312 176 306 150 288 140 C 274 134 262 142 266 154 C 270 162 280 160 280 154', c5, 1.8, ' opacity=".4"');
  s += L('M310 232 C 324 200 322 160 306 126 C 298 108 300 88 312 78', c5, 1.8, ' opacity=".4"');
  s += L('M186 262 C 200 290 236 302 272 294', c4, 2, ' opacity=".45"');
  s += L('M302 20 C 292 48 280 76 264 104 M358 60 C 346 84 332 104 316 122 M232 66 C 222 84 210 104 200 128', c5, 1.4, ' opacity=".5"');
  s += '</g>';

  /* ---- le cœur : une braise blanche qui bat, au fond de la flamme ---- */
  s += '<circle cx="250" cy="266" r="52" fill="' + rad([[0, '#ffffff', .95], [.25, c5, .7], [.6, c3, .25], [1, c2, 0]], .5, .5, .5) + '"/>';
  s += '<circle cx="250" cy="266" r="20" fill="none" stroke="' + c5 + '" stroke-width="1.6" opacity=".45"/><circle cx="250" cy="266" r="30" fill="none" stroke="' + c4 + '" stroke-width="1" opacity=".3" stroke-dasharray="3 6"/>';
  s += F('M250 254 C 255 260 260 266 250 280 C 240 266 245 260 250 254 Z', '#ffffff', ' opacity=".95"');
  s += etoile(250, 268, 14, '#ffffff', .8);

  /* ---- le bras qui appelle : « viens par ici… » ---- */
  var bras = tube([[204, 236], [176, 238], [148, 228], [126, 210]], [26, 18, 13, 11]).d;
  s += F(bras, c2, ' opacity=".25" filter="' + flou4 + '"');
  s += '<g filter="' + ONDE + '" opacity=".95">';
  s += F(bras, lin([[0, c4, .75], [1, c3, .55]], 0, 0, 1, 1)) + L(bras, c5, 1.6, ' opacity=".6"');
  s += '</g>';
  /* la petite main : paume, doigts de flamme, l'index qui se replie (« viens… ») */
  var main = 'M114 216 C 108 204 116 192 128 194 C 140 196 144 208 138 218 C 132 224 120 224 114 216 Z';
  var doigts = [tube([[134, 200], [142, 186], [144, 172], [140, 162]], [8.5, 7.5, 6, 4]).d, tube([[126, 196], [126, 180], [130, 168], [127, 158]], [9, 8, 6.5, 4]).d,
    tube([[118, 200], [108, 190], [104, 178], [110, 172], [116, 176], [113, 182]], [9, 8, 7, 6, 5, 3.4]).d, tube([[118, 214], [104, 214], [96, 207]], [9, 7, 4.4]).d];
  s += '<g opacity=".93">' + F(main, c5) + doigts.map(function(dd){ return F(dd, c5); }).join('') + '</g>';
  s += L(main.replace(/ Z$/, ''), '#ffffff', 1, ' opacity=".5"');
  s += L('M127 192 C 127 180 129 170 128 162 M135 198 C 141 186 143 176 141 166 M118 200 C 110 192 106 182 109 175', '#ffffff', 1.4, ' opacity=".8"');
  s += L('M112 208 C 112 216 120 222 130 220', c3, 1.4, ' opacity=".45"');
  s += C(122, 190, 22, c3, ' opacity=".2" filter="' + flou4 + '"');

  /* ---- le visage malicieux ---- */
  var nuit = '#05223a';
  /* les sourcils de flamme : l'un levé, l'autre froncé */
  s += F('M196 166 C 204 154 222 150 236 160 C 222 158 208 162 198 170 Z', nuit, ' opacity=".85"');
  s += F('M252 152 C 262 140 280 136 292 146 C 280 146 266 150 254 158 Z', nuit, ' opacity=".85"');
  s += L('M200 166 C 208 158 220 156 230 160', c5, 1, ' opacity=".6"');
  /* les yeux en amande, plissés, qui regardent en coin vers les héros ; des pupilles qui brûlent */
  var o1 = 'M198 188 C 204 172 228 166 240 180 C 232 192 210 196 198 188 Z', o2 = 'M252 176 C 258 160 282 156 292 170 C 284 182 262 186 252 176 Z';
  s += F(o1, nuit) + F(o2, nuit);
  s += '<circle cx="208" cy="182" r="11" fill="' + rad([[0, '#ffffff'], [.4, c4, .7], [1, c3, 0]], .5, .5, .5) + '"/>' + '<circle cx="261" cy="171" r="11" fill="' + rad([[0, '#ffffff'], [.4, c4, .7], [1, c3, 0]], .5, .5, .5) + '"/>';
  s += '<ellipse cx="208" cy="182" rx="2.8" ry="5.4" fill="#ffffff"/><ellipse cx="261" cy="171" rx="2.8" ry="5.4" fill="#ffffff"/>';
  s += L('M200 190 C 212 196 228 194 238 184', c5, 1.4, ' opacity=".7"') + L('M254 178 C 264 184 280 182 290 174', c5, 1.4, ' opacity=".7"');
  /* le sourire en coin, plein de petites dents pointues, une langue de flamme */
  var bouche = 'M198 210 C 212 222 236 228 258 220 C 270 216 278 206 282 196 C 280 214 268 232 248 238 C 226 242 208 230 198 210 Z';
  s += F(bouche, nuit);
  s += F('M222 232 C 230 222 246 224 252 232 C 244 240 230 240 222 232 Z', c3) + L('M228 232 C 234 228 242 228 248 232', c5, 1, ' opacity=".8"');
  var dents = '', dx = [206, 214, 223, 232, 241, 250, 259, 268];
  dx.forEach(function(x, i){ var y = 214 + Math.sin((x - 198) / 84 * Math.PI) * 8 - (x > 250 ? (x - 250) * .5 : 0); dents += 'M' + (x - 3.4) + ' ' + f1(y) + ' L ' + x + ' ' + f1(y + 6 - Math.abs(i - 3.5) * .5) + ' L ' + (x + 3.4) + ' ' + f1(y + .6) + ' Z '; });
  s += F(dents, '#f0feff');
  s += L('M196 206 C 198 210 200 212 202 212', nuit, 2.4) + L('M280 192 C 284 192 286 194 286 198', nuit, 2.4);

  /* ---- étincelles autour ---- */
  [[150, 120, 9, .9], [340, 70, 7, .7], [110, 270, 6, .7], [380, 220, 8, .45], [200, 60, 5, .8], [430, 130, 6, .35], [170, 330, 5, .6], [92, 160, 4, .7]].forEach(function(e){
    s += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="' + (e[2] * 2.2) + '" fill="' + c3 + '" opacity="' + (e[3] * .25) + '" filter="' + flou2 + '"/>' + etoile(e[0], e[1], e[2], c5, e[3]);
  });
  R = B.rng(5);
  for(var k2 = 0; k2 < 26; k2++){ var a = R() * Math.PI * 2, rr = 110 + R() * 70; s += C(f1(250 + Math.cos(a) * rr * 1.1), f1(200 + Math.sin(a) * rr * .9), f1(.8 + R() * 1.8), R() < .5 ? c5 : c4, ' opacity="' + f1(.3 + R() * .5) + '"'); }

  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.feufollet = {nom:'Feu follet', rang:'monstre', pv:30, lieu:'La cave aux toiles, l\'ossuaire · change de place',
  livre:'« On ne le voit qu\'à moitié. Dans un nuage, tout prend forme. »',
  combo:['+💨 S\'ouvre : le nuage', ' Sans potion : le bouclier de runes', '!✨ Le renforce : la lumière'], dessin:dessin};
})();
