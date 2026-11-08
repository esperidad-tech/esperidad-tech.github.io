/* Le Gardien de rouille (élite) : un vieil automate des Fondateurs, en fer rouillé, un cœur de runes derrière la plaque */
(function(){
var B = window.BT, P = B.P, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE;
var NN = 0;
function gid(p){ return p + (++NN) + 'g' + Math.floor(Math.random() * 1e6); }
function n1(v){ return (+v).toFixed(1); }
function pt(p){ return n1(p[0]) + ' ' + n1(p[1]); }
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
function crs(P){
  var s = '', n = P.length;
  for(var i = 0; i < n - 1; i++){
    var p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, n - 1)];
    s += ' C ' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2);
  }
  return s;
}
function cote(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, n - 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / l, ny = dx / l, w = ws[i] / 2;
    G.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); D.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return {G:G, D:D};
}
function tube(pts, ws, plat){
  var c = cote(pts, ws), n = pts.length, D = c.D.slice().reverse(), k = plat || .8;
  return 'M' + pt(c.G[0]) + crs(c.G) + ' A ' + n1(ws[n - 1] / 2) + ' ' + n1(ws[n - 1] / 2 * k) + ' 0 0 0 ' + pt(D[0]) + crs(D) + ' A ' + n1(ws[0] / 2) + ' ' + n1(ws[0] / 2 * k) + ' 0 0 0 ' + pt(c.G[0]) + ' Z';
}
function ell(cx, cy, rx, ry){ return 'M' + n1(cx - rx) + ' ' + n1(cy) + ' A ' + rx + ' ' + ry + ' 0 1 0 ' + n1(cx + rx) + ' ' + n1(cy) + ' A ' + rx + ' ' + ry + ' 0 1 0 ' + n1(cx - rx) + ' ' + n1(cy) + ' Z'; }
var ROUILLE = ['#b8642e', '#d07a3a', '#7a3a1e', '#e0904a', '#8a4422'];
var CYAN = '#9ffaff', CYANF = '#1ec8ff';
/* glyphes de runes (dans une boîte de 6 x 10) */
var GLY = ['M3 0 L3 10 M3 3 L0 6 M3 5 L6 8', 'M0 1 Q 6 2 3 5 Q 0 8 6 9', 'M0 10 L0 3 Q 3 -1 6 3 L6 10', 'M3 0 L3 10 M0 6 L6 6 M1 2 L5 2', 'M1 0 L5 5 L1 10 M5 0 L5 2',
  'M3 0 L3 4 M0 4 Q 3 9 6 4 M3 7 L3 10', 'M0 0 L6 3 L0 6 L6 9', 'M3 0 L3 10 M3 2 L6 0 M3 6 L0 4 M3 9 L6 7', 'M0 5 A 3 3 0 1 0 6 5 A 3 3 0 1 0 0 5 M3 0 L3 10', 'M0 0 L0 10 L6 7 M0 4 L5 2', 'M6 0 Q 0 5 6 10 M2 5 L4 5 M2 2 L2 8'];

function dessin(){
  var d = new B.Dessin(), memo = {}, dg = function(c, f){ var k = c + (f || 1); return memo[k] || (memo[k] = d.g(c, f)); }, s = '', FL2 = d.flou(2.2), FL4 = d.flou(4), FL8 = d.flou(9), OMB = gid('om');
  d.defs.push('<filter id="' + OMB + '" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="-3" dy="5" stdDeviation="3" flood-color="#06030a" flood-opacity=".6"/></filter>');
  OMB = 'url(#' + OMB + ')';
  /* une plaque de fer : dégradé, rouille, coulures, rayures, ombre intérieure, liseré de lune */
  function plaque(dd, col, bb, o){
    o = o || {}; var R = B.rng(o.seed || 7), id = gid('cl'), eo = o.eo ? ' fill-rule="evenodd"' : '';
    d.defs.push('<clipPath id="' + id + '"><path d="' + dd + '"' + (o.eo ? ' clip-rule="evenodd"' : '') + '/></clipPath>');
    var s = P(dd, dg(col, o.fort || 1), eo + (o.ombre === false ? '' : ' filter="' + OMB + '"'));
    var c = '<g clip-path="url(#' + id + ')">', w = bb[2] - bb[0], h = bb[3] - bb[1], i, x, y;
    if(o.rainure !== false && w > 40 && h > 30) c += '<path d="' + dd + '" fill="none" stroke="#1a0e14" stroke-width="15" opacity=".45"/><path d="' + dd + '" fill="none" stroke="' + dg(col, o.fort || 1) + '" stroke-width="11.4"/><path d="' + dd + '" fill="none" stroke="' + B.clair(col, .5) + '" stroke-width="16.6" opacity=".18" transform="translate(-.8 1.2)"/>';
    var nr = o.r === undefined ? Math.round(w * h / 700) : o.r, taches = '';
    for(i = 0; i < nr; i++){ x = bb[0] + R() * w; y = bb[1] + R() * h; taches += '<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + n1(4 + R() * 14) + '" ry="' + n1(3 + R() * 9) + '" fill="' + ROUILLE[Math.floor(R() * 5)] + '" opacity="' + n1(.25 + R() * .4) + '"/>'; }
    if(taches) c += '<g filter="' + FL2 + '">' + taches + '</g>';
    /* piqûres de rouille : de petits points ronds, en deux chemins */
    var pts = [['', ''], ['', '']];
    for(i = 0; i < w * h / 160; i++){ x = bb[0] + R() * w; y = bb[1] + R() * h; var gros = R() < .45 ? 1 : 0; pts[R() < .55 ? 0 : 1][gros] += 'M' + n1(x) + ' ' + n1(y) + ' h .01 '; }
    [['#4a1e0e', .5], ['#f0a868', .45]].forEach(function(cc, j){ [1.4, 2.8].forEach(function(lw, k2){ if(pts[j][k2]) c += '<path d="' + pts[j][k2] + '" stroke="' + cc[0] + '" stroke-width="' + lw + '" stroke-linecap="round" opacity="' + cc[1] + '"/>'; }); });
    var nc = o.c === undefined ? Math.max(2, Math.round(w / 22)) : o.c, coul = ['', ''];
    for(i = 0; i < nc; i++){
      x = bb[0] + R() * w; y = bb[1] + R() * h * .55; var l = 16 + R() * 44, ww = 1.4 + R() * 3.2;
      coul[R() < .5 ? 0 : 1] += 'M' + n1(x - ww) + ' ' + n1(y) + ' C ' + n1(x - ww * .6) + ' ' + n1(y + l * .5) + ' ' + n1(x - ww * .3) + ' ' + n1(y + l * .8) + ' ' + n1(x) + ' ' + n1(y + l) + ' C ' + n1(x + ww * .3) + ' ' + n1(y + l * .8) + ' ' + n1(x + ww * .6) + ' ' + n1(y + l * .5) + ' ' + n1(x + ww) + ' ' + n1(y) + ' Z ';
    }
    if(coul[0]) c += F(coul[0], '#a8501f', ' opacity=".6"');
    if(coul[1]) c += F(coul[1], '#5e2412', ' opacity=".6"');
    var ray = '';
    for(i = 0; i < w / 30; i++){ x = bb[0] + R() * w; y = bb[1] + R() * h; ray += 'M' + n1(x) + ' ' + n1(y) + ' l ' + n1(6 + R() * 14) + ' ' + n1(-2 - R() * 5) + ' '; }
    if(ray) c += L(ray, '#f4e6d0', .9, ' opacity=".3"');
    if(o.extra) c += o.extra;
    c += '<path d="' + dd + '" fill="none" stroke="#0e0716" stroke-width="24" opacity=".16" transform="translate(9 -12)"/><path d="' + dd + '" fill="none" stroke="#0e0716" stroke-width="14" opacity=".2" transform="translate(6 -8)"/><path d="' + dd + '" fill="none" stroke="#0e0716" stroke-width="7" opacity=".2" transform="translate(3 -4)"/>';
    c += '<path d="' + dd + '" fill="none" stroke="' + LUNE + '" stroke-width="3" opacity="' + (o.lune || .55) + '" transform="translate(-1.8 2.6)"/>';
    if(o.lueur) c += '<path d="' + dd + '" fill="none" stroke="' + CYANF + '" stroke-width="12" opacity="' + o.lueur + '" transform="translate(5 -3)" filter="' + FL4 + '"/>';
    return s + c + '</g>';
  }
  function rivet(x, y, r){ r = r || 3.2; return C(n1(x), n1(y), n1(r + 1.6), '#7a3414', ' opacity=".45"') + '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" fill="' + dg('#8a7a74') + '" stroke="' + O + '" stroke-width="1.6"/>' + C(n1(x + r * .3), n1(y - r * .35), n1(r * .38), '#fff4e8', ' opacity=".75"'); }
  function rivets(pts, r){ return pts.map(function(p){ return rivet(p[0], p[1], r); }).join(''); }
  function rangee(a, b, n, r){ var o = []; for(var i = 0; i < n; i++){ var t = n === 1 ? .5 : i / (n - 1); o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } return rivets(o, r); }
  /* un engrenage */
  function engrenage(cx, cy, r, n, col, rot){
    var p = '', da = Math.PI / n;
    for(var i = 0; i < n; i++){
      var a = (rot || 0) + i / n * Math.PI * 2;
      [[a - da, r * .8], [a - da * .55, r], [a + da * .45, r], [a + da * .9, r * .8]].forEach(function(q, j){ p += (i || j ? ' L ' : 'M') + n1(cx + Math.cos(q[0]) * q[1]) + ' ' + n1(cy + Math.sin(q[0]) * q[1]); });
    }
    var s = P(p + ' Z', dg(col));
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(r * .62) + '" fill="' + dg(B.sombre(col, .15)) + '" stroke="' + O + '" stroke-width="2"/>';
    for(var k = 0; k < 4; k++){ var a2 = (rot || 0) + k * Math.PI / 2 + .4; s += C(n1(cx + Math.cos(a2) * r * .4), n1(cy + Math.sin(a2) * r * .4), n1(r * .1), '#1a1020'); }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(r * .22) + '" fill="' + dg('#9a8a84') + '" stroke="' + O + '" stroke-width="2"/>';
    s += L('M' + n1(cx + r * .2) + ' ' + n1(cy - r * .78) + ' A ' + n1(r * .8) + ' ' + n1(r * .8) + ' 0 0 1 ' + n1(cx + r * .78) + ' ' + n1(cy - r * .2), LUNE, 1.6, ' opacity=".55"');
    return s;
  }
  /* une rune lumineuse */
  function rune(x, y, sc, k, rot){
    var g = GLY[k % GLY.length], tr = ' transform="translate(' + n1(x) + ' ' + n1(y) + ') rotate(' + (rot || 0) + ') scale(' + sc + ')"';
    return '<path d="' + g + '" fill="none" stroke="' + CYANF + '" stroke-width="' + n1(4.4 / sc) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".9" filter="' + FL2 + '"' + tr + '/>' +
      '<path d="' + g + '" fill="none" stroke="#06202c" stroke-width="' + n1(3 / sc) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".55"' + tr + '/>' +
      '<path d="' + g + '" fill="none" stroke="' + CYAN + '" stroke-width="' + n1(1.5 / sc) + '" stroke-linecap="round" stroke-linejoin="round"' + tr + '/>';
  }
  function runes(pts, sc, k0, rot){ return pts.map(function(p, i){ return rune(p[0], p[1], sc, k0 + i * 3, rot); }).join(''); }
  /* une fente qui laisse passer la lueur */
  function lueur(dd, w){ return L(dd, CYANF, w * 3, ' opacity=".8" filter="' + FL4 + '"') + L(dd, CYAN, w) + L(dd, '#ffffff', w * .4, ' opacity=".8"'); }
  /* un coussin de mousse, posé le long d'un bord */
  function mousse(a, b, ep, seed){
    var R = B.rng(seed), n = 5 + Math.floor(R() * 4), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy), nx = dy / l, ny = -dx / l, p = 'M' + pt(a), dots = '';
    for(var i = 0; i < n; i++){
      var t1 = (i + 1) / n, h = ep * (.6 + R() * .7), tm = (i + .5) / n;
      p += ' Q ' + n1(a[0] + dx * tm + nx * h * 1.5) + ' ' + n1(a[1] + dy * tm + ny * h * 1.5) + ' ' + n1(a[0] + dx * t1 + nx * (i === n - 1 ? 0 : h * .45)) + ' ' + n1(a[1] + dy * t1 + ny * (i === n - 1 ? 0 : h * .45));
    }
    p += ' Q ' + n1(a[0] + dx * .5 - nx * ep * .5) + ' ' + n1(a[1] + dy * .5 - ny * ep * .5) + ' ' + pt(a) + ' Z';
    for(var j = 0; j < n * 5; j++){ var t = R(), e = R() * ep * .9; dots += C(n1(a[0] + dx * t + nx * e), n1(a[1] + dy * t + ny * e), n1(.8 + R() * 1.4), R() < .6 ? '#c8e87a' : '#2e4a1a', ' opacity=".7"'); }
    var brins = '';
    for(var k = 0; k < 4; k++){ var t2 = .15 + R() * .7, bx = a[0] + dx * t2 + nx * ep, by = a[1] + dy * t2 + ny * ep; brins += L('M' + n1(bx) + ' ' + n1(by) + ' q ' + n1(-2 + R() * 4) + ' ' + n1(-5 - R() * 4) + ' ' + n1(-1 + R() * 6) + ' ' + n1(-8 - R() * 6), '#9ac84a', 1.4); }
    /* quelques filaments qui pendent du bord */
    var pend = '';
    for(var m = 0; m < 3; m++){ var t3 = .1 + R() * .8, px = a[0] + dx * t3 - nx * ep * .3, py = a[1] + dy * t3 - ny * ep * .3, ln = 6 + R() * 12; pend += L('M' + n1(px) + ' ' + n1(py) + ' q ' + n1(-2 + R() * 4) + ' ' + n1(ln * .5) + ' ' + n1(-1 + R() * 2) + ' ' + n1(ln), '#6a9a3a', 1.3, ' opacity=".9"'); }
    return brins + pend + P(p, dg('#5e8a32')) + dots;
  }
  /* des racines qui pendent */
  function racine(x, y, l, seed){
    var R = B.rng(seed), p = [[x, y]], cx = x, cy = y;
    for(var i = 0; i < 6; i++){ cx += (R() - .5) * 8; cy += l / 6; p.push([cx, cy]); }
    var dd = 'M' + pt(p[0]) + crs(p), br = '';
    for(var j = 1; j < 5; j += 2){ var q = p[j], sg = R() < .5 ? -1 : 1; br += 'M' + pt(q) + ' q ' + n1(sg * 6) + ' ' + n1(4) + ' ' + n1(sg * 8) + ' ' + n1(12 + R() * 8) + ' '; }
    return L(dd + ' ' + br, O, 4.4) + L(dd, '#7a5a3a', 2.4) + L(br, '#7a5a3a', 1.8) + L(dd, '#c8a27a', .9, ' opacity=".5" transform="translate(.8 -.4)"');
  }
  /* un tuyau souple, annelé */
  function tuyau(segs, w, col){
    var pts = []; segs.forEach(function(sg, i){ for(var j = i ? 1 : 0; j <= 24; j++) pts.push(bez(sg, j / 24)); });
    var ws = pts.map(function(){ return w; }), c = cote(pts, ws.map(function(v){ return v * .96; })), s = P(tube(pts, ws), dg(col)), an = '';
    for(var i = 1; i < pts.length - 1; i += 1) an += 'M' + pt(c.G[i]) + ' L ' + pt(c.D[i]) + ' ';
    s += L(an, '#120a18', 1.5, ' opacity=".55"');
    var hl = cote(pts, ws.map(function(v){ return v * .45; }));
    s += L('M' + pt(hl.G[1]) + crs(hl.G.slice(1, -1)), LUNE, 1.8, ' opacity=".4"');
    return s;
  }
  /* un poing de fer, poing fermé vu de profil : quatre doigts repliés, le pouce couché dessus */
  function poing(cx, cy, sc, col, seed, nuit){
    var s = '<g transform="translate(' + cx + ' ' + cy + ') scale(' + sc + ')">';
    /* dos de la main, côté poignet */
    s += plaque('M-14 -42 C 8 -52 36 -48 48 -32 C 56 -16 56 18 48 34 C 40 46 16 50 -8 46 Z', col, [-16, -52, 56, 50], {seed: seed, r: 5, c: 2});
    s += rangee([40, -30], [44, 30], 4, 2.4);
    /* les doigts, de l'auriculaire (en bas) à l'index (en haut) */
    [[30, 15, -30], [13, 18, -40], [-5, 19, -44], [-24, 19, -40]].forEach(function(f, i){
      var yc = f[0], h = f[1], xl = f[2], r = h / 2, y0 = yc - r, y1 = yc + r;
      var dd = 'M14 ' + n1(y0) + ' L ' + n1(xl + r) + ' ' + n1(y0) + ' A ' + n1(r) + ' ' + n1(r) + ' 0 0 0 ' + n1(xl + r) + ' ' + n1(y1) + ' L 14 ' + n1(y1) + ' Z';
      s += plaque(dd, B.clair(col, .04 * (3 - i)), [xl, y0, 16, y1], {seed: seed + i * 3, r: 2, c: 1, lune: .45});
      /* la jointure (deux phalanges) et le gros boulon de l'articulation */
      s += L('M' + n1(xl + h * 1.25) + ' ' + n1(y0 + 1.5) + ' Q ' + n1(xl + h * 1.25 - 4) + ' ' + n1(yc) + ' ' + n1(xl + h * 1.25) + ' ' + n1(y1 - 1.5), O, 2.2);
      s += rivet(xl + r + 1, yc, 2.6);
      s += L('M' + n1(xl + r) + ' ' + n1(y0 + 2.5) + ' L 10 ' + n1(y0 + 2.5), LUNE, 1.3, ' opacity=".45"');
    });
    /* le pouce couché sur l'index */
    s += plaque('M44 -28 C 34 -46 4 -50 -22 -42 C -32 -38 -32 -26 -22 -24 C -4 -28 16 -26 32 -16 Z', B.clair(col, .06), [-34, -52, 46, -14], {seed: seed + 20, r: 3, c: 1});
    s += P('M-22 -42 C -30 -38 -30 -28 -22 -25 L -16 -26 C -20 -30 -20 -38 -16 -42 Z', dg('#8a8690'), ' stroke-width="2"') + rivet(8, -36, 2.6) + L('M18 -44 C 14 -36 14 -28 18 -22', O, 2);
    if(nuit) s += F('M-50 -56 L 60 -56 L 60 56 L -50 56 Z', '#0a0612', ' opacity="' + nuit + '"');
    return s + '</g>';
  }
  /* une bague (manchette) autour d'un membre : c = centre, ang = sens du membre */
  function bague(c, ang, larg, ep, col, seed){
    var w = larg / 2, e = ep / 2, dd = 'M' + (-e) + ' ' + (-w) + ' L ' + e + ' ' + (-w) + ' Q ' + (e + 7) + ' 0 ' + e + ' ' + w + ' L ' + (-e) + ' ' + w + ' Q ' + (-e + 7) + ' 0 ' + (-e) + ' ' + (-w) + ' Z';
    var r = '<g transform="translate(' + n1(c[0]) + ' ' + n1(c[1]) + ') rotate(' + n1(ang) + ')">' + plaque(dd, col, [-e, -w, e + 7, w], {seed: seed, r: 3, c: 0, rainure: false});
    r += L('M' + n1(e - 3) + ' ' + n1(-w + 3) + ' Q ' + n1(e + 3.5) + ' 0 ' + n1(e - 3) + ' ' + n1(w - 3), '#1a0e14', 2, ' opacity=".5"');
    for(var i = 0; i < 4; i++){ var y = -w + 8 + i * (larg - 16) / 3; r += rivet(1 + 3.5 * (1 - Math.pow(y / w, 2)), y, 2.4); }
    return r + '</g>';
  }
  /* un gros pied de fer : talon à droite, orteils en calottes à gauche, griffes de métal */
  function pied(cx, cy, sc, col, seed){
    var s = '<g transform="translate(' + cx + ' ' + cy + ') scale(' + sc + ')">';
    s += P('M-60 4 L 50 4 C 54 6 54 12 50 14 L -60 14 C -64 12 -64 6 -60 4 Z', dg(NOIR));
    s += plaque('M-16 -26 C 10 -34 40 -28 50 -10 C 56 0 54 8 50 8 L -18 8 Z', col, [-20, -34, 56, 10], {seed: seed, c: 2});
    s += plaque('M-8 -22 C -28 -26 -46 -16 -48 -2 L -46 6 L -10 6 Z', B.sombre(col, .15), [-50, -28, -6, 8], {seed: seed + 1, r: 2, c: 1, rainure: false});
    s += P('M-46 -6 L -58 -2 L -46 2 Z', dg('#a8a4b0'), ' stroke-width="2"');
    s += plaque('M-14 -6 C -38 -12 -60 -4 -64 8 C -64 12 -60 14 -56 14 L -12 14 Z', col, [-66, -14, -10, 14], {seed: seed + 2, r: 2, c: 1, rainure: false});
    s += P('M-62 4 L -76 10 L -62 13 Z', dg('#b8b4c0'), ' stroke-width="2"') + L('M-64 6 L -72 9.5', '#ffffff', 1, ' opacity=".7"');
    s += rangee([-2, -16], [-4, 2], 2, 2.4) + rangee([4, 0], [44, 0], 5, 2.4);
    return s + '</g>';
  }
  /* du lierre qui grimpe, avec ses feuilles */
  function lierre(pts, seed){
    var R = B.rng(seed), dd = 'M' + pt(pts[0]) + crs(pts), s = L(dd, O, 4.4) + L(dd, '#4a6a2a', 2.2);
    for(var i = 0; i < pts.length - 1; i++){
      for(var k = 0; k < 2; k++){
        var t = .25 + k * .5, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t, a = (k ? 1 : -1) * (40 + R() * 50) + (R() - .5) * 30, sc = .7 + R() * .45;
        s += '<g transform="translate(' + n1(x) + ' ' + n1(y) + ') rotate(' + n1(a) + ') scale(' + n1(sc) + ')">' + P('M0 0 C -4 -2 -9 -4 -10 -8 L -6 -9 L -8 -14 L -3 -13 L 0 -19 L 3 -13 L 8 -14 L 6 -9 L 10 -8 C 9 -4 4 -2 0 0 Z', dg(R() < .5 ? '#3e7a34' : '#4a8a3a'), ' stroke-width="1.8"') + L('M0 -1 L 0 -15 M0 -7 L -5 -10 M0 -7 L 5 -10', '#a8d870', .8, ' opacity=".6"') + '</g>';
      }
    }
    return s;
  }
  /* des bagues de tôle en travers d'un membre */
  function anneaux(pts, ws, ids){
    var c = cote(pts, ws.map(function(w){ return w * .99; })), s = '';
    ids.forEach(function(i){
      var a = c.G[i], b = c.D[i], m = [(a[0] + b[0]) / 2 + (pts[Math.min(i + 1, pts.length - 1)][0] - pts[Math.max(i - 1, 0)][0]) * .12, (a[1] + b[1]) / 2 + (pts[Math.min(i + 1, pts.length - 1)][1] - pts[Math.max(i - 1, 0)][1]) * .12];
      s += L('M' + pt(a) + ' Q ' + pt(m) + ' ' + pt(b), O, 2.4) + L('M' + n1(a[0] - 1) + ' ' + n1(a[1] + 2) + ' Q ' + n1(m[0] - 1) + ' ' + n1(m[1] + 2) + ' ' + n1(b[0] - 1) + ' ' + n1(b[1] + 2), LUNE, 1.2, ' opacity=".35"');
    });
    return s;
  }
  var FER = '#6e6878', ROUX = '#8a5638', BRONZE = '#9a7040', NOIR = '#3a3444';

  /* ---------- ombre au sol, cheminées et vapeur ---------- */
  s += '<ellipse cx="272" cy="394" rx="240" ry="18" fill="#000" opacity=".6"/>';
  s += '<ellipse cx="236" cy="394" rx="130" ry="14" fill="' + d.halo('#bff8ff', CYANF) + '" opacity=".22"/>';
  /* débris par terre : un engrenage tombé, des boulons */
  s += '<g transform="translate(30 388) scale(1 .42)">' + engrenage(0, 0, 22, 10, B.sombre(FER, .2), .3) + '</g>' + F('M8 384 L 20 386 L 18 390 Z', '#0e0716', ' opacity=".5"');
  [[124, 392, 0], [482, 390, 30], [500, 394, 70], [254, 396, 15]].forEach(function(b){ s += '<g transform="translate(' + b[0] + ' ' + b[1] + ') rotate(' + b[2] + ')">' + P('M-4 -2.4 L 0 -4.6 L 4 -2.4 L 4 2.4 L 0 4.6 L -4 2.4 Z', dg('#7a6a6a'), ' stroke-width="1.6"') + C(0, 0, 1.4, '#2a1a1a') + '</g>'; });
  s += P('M398 128 L 402 58 L 416 58 L 418 128 Z', dg(NOIR)) + P('M396 52 L 422 52 L 420 64 L 398 64 Z', dg(FER)) + L('M413 64 L 414 124', LUNE, 1.6, ' opacity=".4"');
  s += P('M422 138 L 430 84 L 442 86 L 438 140 Z', dg(NOIR)) + P('M426 78 L 448 82 L 444 92 L 426 88 Z', dg(FER));
  [[410, 34, 14, .3], [422, 16, 18, .22], [436, 60, 12, .25], [450, 36, 16, .18], [402, 4, 20, .12]].forEach(function(v){ s += '<ellipse cx="' + v[0] + '" cy="' + v[1] + '" rx="' + v[2] + '" ry="' + n1(v[2] * .7) + '" fill="#dfe8f0" opacity="' + v[3] + '" filter="' + FL8 + '"/>'; });

  /* ---------- bassin (bloc sombre derrière), jambe du fond ---------- */
  s += P('M200 256 L 356 256 L 362 300 C 344 328 304 336 278 336 C 252 336 214 328 196 300 Z', dg(NOIR, .6));
  s += engrenage(232, 314, 20, 9, B.sombre(FER, .35), .2);
  s += plaque(tube([[230, 318], [216, 336], [206, 350]], [50, 50, 46]), B.sombre(ROUX, .3), [178, 292, 256, 372], {seed: 11});
  s += engrenage(204, 354, 18, 9, B.sombre(FER, .35), .3);
  s += plaque(tube([[204, 358], [202, 366], [200, 372]], [44, 50, 56]), B.sombre(FER, .3), [170, 334, 232, 392], {seed: 12, r: 4});
  s += pied(196, 382, .9, B.sombre(FER, .28), 13);
  s += plaque('M182 346 C 184 332 210 326 222 338 C 228 348 224 362 212 366 C 198 366 184 358 182 346 Z', B.sombre(FER, .25), [180, 326, 230, 368], {seed: 14, r: 2});
  s += mousse([146, 388], [168, 380], 4, 3);

  /* ---------- bras du fond (il avance le poing vers les héros) ---------- */
  s += plaque('M136 106 C 144 78 186 68 212 84 C 226 94 226 116 218 132 C 194 122 162 124 140 136 C 132 126 130 116 136 106 Z', B.sombre(FER, .25), [128, 66, 228, 138], {seed: 21});
  s += plaque('M140 132 C 162 120 194 120 216 130 L 212 146 C 192 138 164 138 146 148 Z', B.sombre(ROUX, .3), [138, 118, 218, 150], {seed: 26, c: 1, rainure: false});
  s += rangee([146, 104], [204, 86], 4, 2.4) + mousse([150, 84], [196, 72], 6, 27) + rune(176, 96, .9, 6, -14);
  s += plaque(tube([[172, 136], [152, 176], [136, 206]], [48, 46, 44]), B.sombre(ROUX, .3), [108, 110, 198, 230], {seed: 22});
  s += L('M150 152 C 162 160 174 162 186 160 M140 176 C 152 184 164 186 176 184', O, 2.2) + rangee([146, 158], [180, 164], 3, 2.2);
  s += engrenage(130, 216, 23, 10, B.sombre(FER, .3), .1);
  s += plaque(tube([[128, 226], [110, 254], [96, 280]], [48, 58, 66]), B.sombre(ROUX, .18), [58, 196, 156, 314], {seed: 23});
  s += plaque('M150 206 C 152 222 146 236 134 242 C 128 232 124 220 126 208 C 132 200 144 200 150 206 Z', B.sombre(FER, .2), [122, 198, 154, 244], {seed: 24, r: 2});
  s += anneaux([[128, 226], [119, 240], [110, 254], [103, 267], [96, 280]], [48, 53, 58, 62, 66], [1, 3]);
  s += runes([[124, 244], [116, 256], [108, 268]], .85, 2, 30);
  s += bague([92, 286], 146, 74, 18, B.sombre(FER, .2), 25);
  /* une manille cassée et sa chaîne qui pend */
  var ch = '<ellipse cx="96" cy="326" rx="4" ry="7" transform="rotate(14 96 326)"/><path d="M98 334 L 100 342"/><ellipse cx="101" cy="348" rx="4" ry="7" transform="rotate(-8 101 348)"/><path d="M102 356 L 102 362"/><ellipse cx="102" cy="368" rx="4" ry="6" transform="rotate(20 102 368)"/><path d="M104 374 L 108 378 M102 375 L 98 380"/>';
  s += '<g fill="none" stroke="' + O + '" stroke-width="5.4">' + ch + '</g><g fill="none" stroke="#8a7a74" stroke-width="2.6">' + ch + '</g>';
  s += poing(66, 300, .98, B.sombre(ROUX, .12), 31);
  s += racine(118, 286, 28, 5) + racine(132, 244, 22, 6);

  /* ---------- le torse ---------- */
  var torse = 'M196 106 C 166 112 148 132 144 164 C 140 200 152 232 180 254 C 198 268 222 276 248 278 L 318 278 C 344 274 362 260 374 236 C 390 204 398 162 392 128 C 386 108 368 96 344 94 C 296 88 236 96 196 106 Z';
  s += P(torse, dg(NOIR), ' filter="' + OMB + '"');
  /* les pistons de la taille, dans le creux sombre */
  s += P('M216 266 L 336 266 L 334 296 L 218 296 Z', '#140c1c');
  [[236, 1], [272, .8], [310, 1]].forEach(function(p){ s += P('M' + (p[0] - 7) + ' 268 L ' + (p[0] + 7) + ' 268 L ' + (p[0] + 7) + ' 280 L ' + (p[0] - 7) + ' 280 Z', dg(FER)) + P('M' + (p[0] - 3) + ' 278 L ' + (p[0] + 3) + ' 278 L ' + (p[0] + 3) + ' 294 L ' + (p[0] - 3) + ' 294 Z', dg('#c8ccd8')) + L('M' + (p[0] + 1.5) + ' 279 L ' + (p[0] + 1.5) + ' 293', '#ffffff', 1, ' opacity=".7"'); });
  s += '<ellipse cx="276" cy="284" rx="50" ry="10" fill="' + d.halo('#bff8ff', CYANF) + '" opacity=".35"/>';
  /* plaque du dos (côté éclairé) */
  s += plaque('M330 96 C 358 96 382 106 390 124 C 398 156 394 200 380 232 C 372 252 360 266 344 274 C 344 230 342 160 330 96 Z', ROUX, [328, 92, 398, 278], {seed: 41});
  s += rangee([344, 114], [366, 252], 6, 2.8);
  /* le plastron, ses lignes de tôle */
  var plastron = 'M198 108 C 170 114 152 134 148 164 C 144 198 156 230 182 250 C 198 262 222 270 248 272 L 338 270 C 338 226 336 158 324 98 C 290 94 236 100 198 108 Z';
  s += plaque(plastron, FER, [144, 92, 340, 274], {seed: 42});
  s += L('M156 214 C 180 222 200 226 214 226 M300 230 C 314 232 326 232 336 230', O, 2.4) + L('M157 218 C 180 226 200 229 214 229', LUNE, 1.2, ' opacity=".35"');
  s += lueur('M328 104 C 336 150 340 220 340 262', 1.1);
  /* lames du ventre */
  s += plaque('M168 240 C 210 258 290 262 346 252 L 348 268 C 296 280 214 276 164 256 Z', B.sombre(ROUX, .1), [162, 236, 350, 280], {seed: 43, c: 3});
  s += rangee([180, 254], [336, 264], 7, 2.4);
  /* le col */
  s += plaque('M184 104 C 224 86 302 82 346 94 C 354 106 348 120 336 124 C 292 110 234 114 196 130 C 184 124 180 112 184 104 Z', B.sombre(FER, .1), [180, 82, 356, 132], {seed: 45});
  s += rangee([200, 118], [334, 110], 7, 2.4);
  s += lueur('M200 132 C 236 120 290 116 334 126', 1.1);

  /* ---------- LA PLAQUE RONDE dans sa couronne boulonnée, et le cœur de runes derrière ---------- */
  var hx = 244, hy = 184;
  s += '<circle cx="' + hx + '" cy="' + hy + '" r="100" fill="' + d.halo('#c8ffff', CYANF) + '" opacity=".28"/>';
  /* la couronne de fer autour */
  s += plaque(ell(hx, hy, 70, 74) + ' ' + ell(hx, hy, 55, 59), B.sombre(FER, .05), [hx - 72, hy - 76, hx + 72, hy + 76], {seed: 50, eo: true, r: 8, c: 4});
  var cr = [];
  for(var i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2 + .2; cr.push([hx + Math.cos(a) * 63, hy + Math.sin(a) * 67]); }
  s += rivets(cr, 3.6);
  /* le creux lumineux */
  s += '<path d="' + ell(hx, hy, 55, 59) + '" fill="' + d.halo('#ffffff', '#2ad8ff') + '" stroke="' + O + '" stroke-width="3"/>';
  s += '<g opacity=".95">' + runes([[hx + 34, hy - 36], [hx + 42, hy - 12], [hx + 40, hy + 14], [hx + 30, hy + 36]], 1.15, 4, 0) + '</g>';
  /* la plaque, en bronze, entrouverte à droite */
  s += '<g transform="translate(-6 0) rotate(-5 ' + hx + ' ' + hy + ')">';
  var trappe = ell(hx - 2, hy, 49, 56);
  s += plaque(trappe, BRONZE, [hx - 52, hy - 58, hx + 48, hy + 58], {seed: 51, r: 10, c: 4,
    extra: [[hx - 30, hy + 30, 14, 8], [hx + 20, hy - 40, 10, 6], [hx - 36, hy - 20, 8, 12], [hx + 24, hy + 34, 12, 7], [hx - 6, hy + 44, 9, 5]].map(function(v){ return '<ellipse cx="' + v[0] + '" cy="' + v[1] + '" rx="' + v[2] + '" ry="' + v[3] + '" fill="#4ab89a" opacity=".5" filter="' + FL2 + '"/>'; }).join('')});
  s += '<ellipse cx="' + (hx - 3) + '" cy="' + hy + '" rx="38" ry="44" fill="none" stroke="' + O + '" stroke-width="2.4"/><ellipse cx="' + (hx - 4) + '" cy="' + (hy + 1.5) + '" rx="36" ry="42" fill="none" stroke="#f0c890" stroke-width="1.4" opacity=".4"/>';
  var rv = [];
  for(var j = 0; j < 14; j++){ var a2 = j / 14 * Math.PI * 2; rv.push([hx - 2 + Math.cos(a2) * 44, hy + Math.sin(a2) * 51]); }
  s += rivets(rv, 2.6);
  s += '<circle cx="' + (hx - 4) + '" cy="' + hy + '" r="17" fill="' + dg(B.clair(BRONZE, .12)) + '" stroke="' + O + '" stroke-width="3"/><circle cx="' + (hx - 4) + '" cy="' + hy + '" r="12" fill="none" stroke="#5a3a1a" stroke-width="1.4" opacity=".6"/>';
  s += rune(hx - 7.5, hy - 8, 1.5, 8, 0);
  s += lueur('M' + (hx + 12) + ' ' + (hy - 54) + ' l -4 12 l 6 6 l -8 14', 1.2) + lueur('M' + (hx - 44) + ' ' + (hy + 20) + ' l 10 4 l 4 10', 1);
  /* charnières à gauche, loquet à droite */
  s += P('M' + (hx - 60) + ' ' + (hy - 36) + ' l 16 -2 l 2 20 l -16 2 Z', dg(FER)) + P('M' + (hx - 60) + ' ' + (hy + 16) + ' l 16 -2 l 2 20 l -16 2 Z', dg(FER));
  s += L('M' + (hx - 53) + ' ' + (hy - 37) + ' l 1 20 M' + (hx - 53) + ' ' + (hy + 15) + ' l 1 20', '#120a18', 1.6, ' opacity=".6"') + L('M' + (hx - 48) + ' ' + (hy - 37) + ' l 1 20 M' + (hx - 48) + ' ' + (hy + 15) + ' l 1 20', LUNE, 1.2, ' opacity=".5"');
  s += P('M' + (hx + 36) + ' ' + (hy - 8) + ' L ' + (hx + 66) + ' ' + (hy - 13) + ' L ' + (hx + 68) + ' ' + (hy - 2) + ' L ' + (hx + 38) + ' ' + (hy + 4) + ' Z', dg(FER)) + rivet(hx + 41, hy - 2, 3) + rivet(hx + 62, hy - 7, 2.4);
  s += '</g>';
  /* la lumière qui fuit par la jointure, plus forte du côté entrouvert */
  var fente = 'M' + (hx + 26) + ' ' + (hy - 54) + ' C ' + (hx + 46) + ' ' + (hy - 40) + ' ' + (hx + 52) + ' ' + (hy - 10) + ' ' + (hx + 48) + ' ' + (hy + 20) + ' C ' + (hx + 46) + ' ' + (hy + 38) + ' ' + (hx + 38) + ' ' + (hy + 50) + ' ' + (hx + 26) + ' ' + (hy + 56);
  s += L(fente, CYANF, 12, ' opacity=".75" filter="' + FL4 + '"') + L(fente, '#e8ffff', 2.2, ' opacity=".95"');
  /* rais de lumière */
  [[-40, 120], [-12, 140], [18, 120]].forEach(function(r){ var a3 = r[0] * Math.PI / 180, x0 = hx + 48, y0 = hy + r[0] * .3; s += F('M' + n1(x0) + ' ' + n1(y0 - 3) + ' L ' + n1(x0 + Math.cos(a3) * r[1]) + ' ' + n1(y0 + Math.sin(a3) * r[1] - 9) + ' L ' + n1(x0 + Math.cos(a3) * r[1]) + ' ' + n1(y0 + Math.sin(a3) * r[1] + 9) + ' L ' + n1(x0) + ' ' + n1(y0 + 3) + ' Z', '#bff8ff', ' opacity=".09"'); });
  /* runes gravées en arc autour */
  var ra = [];
  for(var q = 0; q < 7; q++){ var a4 = Math.PI * (1.1 + q * .125); ra.push([hx + Math.cos(a4) * 86 - 3, hy + Math.sin(a4) * 88 - 5]); }
  s += runes(ra, .95, 1, 0);

  /* ---------- la tête, enfoncée entre les épaules ---------- */
  s += '<g transform="translate(230 104) scale(1.1) translate(-230 -104)">';
  s += P('M206 100 L 262 98 L 262 128 L 210 130 Z', dg(NOIR)) + engrenage(236, 116, 14, 8, FER, .2);
  s += L('M212 104 C 206 116 210 126 216 132 M258 102 C 264 114 260 124 254 130', '#2a2232', 3.6);
  var casque = 'M182 82 C 178 56 192 34 218 28 C 246 22 274 34 282 58 C 288 78 284 98 274 110 L 190 110 C 184 102 180 92 182 82 Z';
  s += plaque(casque, FER, [178, 22, 290, 112], {seed: 61, c: 4});
  /* la corne cassée */
  s += plaque('M264 38 C 272 26 284 18 296 14 L 294 22 L 300 24 L 292 30 L 296 36 L 286 36 C 280 40 276 44 274 48 Z', B.sombre(FER, .1), [260, 12, 302, 50], {seed: 62, r: 2, c: 1});
  s += F('M286 24 L 294 22 L 292 30 Z', '#2a2232', ' opacity=".6"');
  /* la crête et ses rivets */
  s += plaque('M208 34 C 226 16 258 18 274 40 L 266 46 C 252 30 230 28 214 40 Z', B.sombre(FER, .15), [206, 16, 276, 48], {seed: 64, r: 2, c: 0});
  s += rivets([[220, 30], [236, 24], [254, 26]], 2.2);
  /* la mâchoire, lourde, en avant */
  s += plaque('M184 94 C 200 98 232 100 264 98 L 272 106 C 270 122 254 134 228 136 C 204 136 186 130 178 118 C 174 108 176 100 184 94 Z', ROUX, [174, 92, 274, 138], {seed: 63, c: 3});
  s += L('M198 106 L 198 126 M208 107 L 208 130 M218 107 L 218 132 M228 107 L 228 132 M238 106 L 238 131 M248 105 L 248 128', '#120a18', 2.8) + L('M199 108 L 199 124 M209 109 L 209 128 M219 109 L 219 130 M229 109 L 229 130 M239 108 L 239 129', '#e0a878', .9, ' opacity=".4"');
  s += rivets([[186, 104], [262, 104]], 2.4);
  /* l'arcade sourcilière en V, la fente des yeux */
  s += P('M184 78 C 192 72 206 72 222 80 C 236 72 256 68 270 70 L 272 80 C 258 80 240 84 226 92 C 210 86 196 84 186 88 Z', '#08040e');
  s += '<ellipse cx="230" cy="84" rx="52" ry="20" fill="' + d.halo('#e8ffff', '#3ab8ff') + '" opacity=".7" filter="' + FL2 + '"/>';
  s += F('M194 82 C 200 80 208 81 214 85 C 208 87 200 86 194 82 Z', '#5fd8ff') + F('M236 84 C 244 78 254 76 262 76 C 256 82 246 86 236 84 Z', '#5fd8ff');
  s += F('M198 82.6 C 202 82 207 82.4 211 84.4 C 207 85 202 84.4 198 82.6 Z', '#f4feff') + F('M240 83.4 C 246 80 252 78.6 258 78 C 253 81.4 246 84 240 83.4 Z', '#f4feff');
  s += L('M170 84 L 216 85 M234 82 L 292 74', '#bff4ff', .9, ' opacity=".55"');
  s += plaque('M178 74 C 190 62 208 62 224 72 C 240 60 264 56 282 60 L 282 70 C 266 68 246 72 226 84 C 208 74 192 74 180 82 Z', B.sombre(FER, .2), [176, 56, 284, 86], {seed: 65, r: 2, c: 1});
  s += rune(222, 46, 1.2, 0, 0) + rune(236, 50, 1, 9, 0);
  s += engrenage(272, 88, 11, 8, B.sombre(FER, .1), .4) + rivet(272, 88, 3.4);
  s += mousse([204, 30], [252, 24], 8, 9);
  s += racine(262, 112, 20, 8) + racine(190, 124, 14, 18);
  s += '</g>';

  /* ---------- tuyau du dos vers l'avant-bras ---------- */
  s += tuyau([[[388, 176], [456, 156], [482, 222], [450, 264]]], 15, B.sombre(NOIR, .1));
  s += P('M380 168 L 396 166 L 398 188 L 382 190 Z', dg(FER)) + rivet(389, 178, 2.4);

  /* ---------- ceinture, jambe proche ---------- */
  s += engrenage(330, 316, 22, 10, FER, .1);
  s += plaque(tube([[330, 320], [340, 336], [346, 350]], [58, 54, 50]), ROUX, [300, 292, 372, 374], {seed: 71});
  s += plaque('M190 286 C 236 300 316 302 366 288 L 368 308 C 316 322 236 320 188 306 Z', B.sombre(FER, .12), [186, 284, 370, 324], {seed: 69});
  s += rangee([202, 300], [356, 302], 8, 2.6);
  s += plaque('M262 294 L 294 295 L 292 322 L 264 321 Z', BRONZE, [260, 292, 296, 324], {seed: 68, r: 2, c: 0, rainure: false}) + rune(275, 301, 1.1, 10, 0);
  s += plaque('M196 304 C 216 312 238 316 256 316 L 252 338 C 238 350 212 348 200 336 Z', B.sombre(ROUX, .15), [194, 302, 258, 350], {seed: 70});
  s += rangee([206, 316], [246, 322], 3, 2.4);
  s += engrenage(348, 356, 20, 10, FER, .2);
  s += plaque(tube([[348, 360], [350, 368], [352, 374]], [48, 54, 60]), FER, [318, 336, 384, 392], {seed: 72, r: 5});
  s += pied(342, 381, 1.02, FER, 74);
  s += plaque('M330 350 C 332 334 360 328 372 340 C 378 352 372 366 360 370 C 344 370 330 362 330 350 Z', B.sombre(FER, .05), [328, 328, 380, 372], {seed: 73, r: 3});
  s += rune(349, 344, .9, 5, 0);
  s += plaque('M292 316 C 316 316 346 310 366 302 L 372 332 C 356 348 322 354 298 344 Z', ROUX, [290, 300, 374, 356], {seed: 75});
  s += rangee([302, 324], [358, 316], 4, 2.6);
  s += lierre([[300, 392], [310, 378], [330, 372], [352, 378], [370, 366], [374, 348], [366, 334], [372, 318]], 41);
  s += mousse([290, 380], [316, 372], 5, 13);

  /* ---------- le bras proche ---------- */
  s += engrenage(388, 150, 24, 11, FER, 0);
  s += plaque(tube([[394, 154], [404, 196], [410, 226]], [56, 54, 50]), ROUX, [362, 124, 440, 252], {seed: 81});
  s += L('M382 196 C 394 202 410 204 428 200 M384 214 C 396 220 412 222 430 218', O, 2.2) + rangee([388, 204], [424, 206], 3, 2.2);
  s += engrenage(412, 238, 27, 11, FER, .15);
  s += plaque(tube([[410, 248], [422, 282], [434, 314]], [54, 66, 76]), ROUX, [378, 218, 476, 352], {seed: 82});
  s += plaque('M436 252 C 452 268 464 290 468 310 L 454 314 C 448 292 438 272 424 258 Z', B.sombre(FER, .05), [420, 248, 470, 316], {seed: 88, r: 2, c: 1});
  s += anneaux([[410, 248], [416, 265], [422, 282], [428, 298], [434, 314]], [54, 60, 66, 71, 76], [1, 3]);
  s += runes([[410, 270], [414, 286], [419, 302]], 1, 0, -14);
  s += L('M398 256 C 404 282 412 302 420 320', '#120a18', 2, ' opacity=".45"');
  s += plaque('M408 220 C 426 212 452 220 456 240 C 460 258 448 270 432 272 C 438 254 432 234 408 220 Z', B.sombre(FER, .1), [404, 210, 462, 274], {seed: 89, r: 2, c: 1});
  s += rivet(444, 246, 3);
  s += bague([440, 318], 110, 88, 20, B.sombre(FER, .1), 83);
  s += poing(440, 350, 1.12, ROUX, 84);
  s += mousse([418, 304], [460, 314], 6, 17);
  /* l'épaulière, avec un morceau arraché qui montre les rouages */
  var ep = 'M330 108 C 340 80 372 68 404 76 C 418 80 428 86 434 94 L 424 100 L 432 108 L 422 112 L 440 122 C 442 140 432 156 418 164 C 400 150 370 140 340 140 C 330 132 326 120 330 108 Z';
  s += F('M434 94 L 424 100 L 432 108 L 422 112 L 440 122 C 446 110 442 100 434 94 Z', '#120a18');
  s += engrenage(436, 110, 10, 7, '#a08a6a', .5);
  s += L('M432 116 C 444 130 450 146 446 160', O, 4.4) + L('M432 116 C 444 130 450 146 446 160', '#c8452a', 2.2);
  s += '<circle cx="446" cy="161" r="10" fill="' + d.halo('#fff6c0', '#ffb030') + '" opacity=".85"/>' + C(446, 161, 3, '#fffbe0') + L('M446 161 l 7 -5 M446 161 l 8 4 M446 161 l 2 8 M446 161 l -6 5', '#fff0a0', 1.2);
  s += plaque(ep, FER, [326, 66, 444, 166], {seed: 85, c: 5});
  s += plaque('M336 140 C 372 142 404 152 422 166 L 416 182 C 398 170 370 162 340 160 Z', B.sombre(ROUX, .05), [334, 138, 424, 184], {seed: 86, c: 2});
  s += plaque('M342 160 C 370 162 396 170 414 182 L 408 196 C 392 186 368 180 346 178 Z', B.sombre(ROUX, .15), [340, 158, 416, 198], {seed: 87, c: 2});
  s += rangee([344, 112], [420, 140], 5, 2.8) + rangee([346, 150], [410, 170], 4, 2.2);
  s += rune(370, 96, 1, 7, -10) + rune(384, 96, 1, 1, -10);
  s += mousse([340, 96], [398, 74], 9, 21) + mousse([300, 92], [328, 90], 5, 22);
  s += racine(342, 140, 34, 31) + racine(356, 146, 50, 32) + racine(400, 162, 26, 33) + racine(334, 128, 22, 34);
  /* petits champignons pâles dans la mousse */
  [[358, 80, 1], [367, 76, .8], [308, 86, .7]].forEach(function(m){
    var x = m[0], y = m[1], k = m[2];
    s += P('M' + n1(x - 1.6 * k) + ' ' + y + ' L ' + n1(x - 1.2 * k) + ' ' + n1(y - 9 * k) + ' L ' + n1(x + 1.2 * k) + ' ' + n1(y - 9 * k) + ' L ' + n1(x + 1.6 * k) + ' ' + y + ' Z', '#efe4cc', ' stroke-width="1.6"');
    s += P('M' + n1(x - 7 * k) + ' ' + n1(y - 8 * k) + ' C ' + n1(x - 6 * k) + ' ' + n1(y - 16 * k) + ' ' + n1(x + 6 * k) + ' ' + n1(y - 16 * k) + ' ' + n1(x + 7 * k) + ' ' + n1(y - 8 * k) + ' Z', dg('#d8b88a'), ' stroke-width="1.8"') + C(n1(x + 2 * k), n1(y - 12 * k), n1(1.2 * k), '#fff8e8');
  });
  s += lueur('M332 120 C 350 118 380 124 404 138', .9);
  s += L('M218 28 C 246 22 272 32 282 56', LUNE, 2.4, ' opacity=".7"') + L('M372 70 C 400 70 426 84 436 96', LUNE, 2.4, ' opacity=".7"');
  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.gardien = {nom:'Le Gardien de rouille', rang:'elite', pv:280, lieu:'L\'atelier des Fondateurs',
  livre:'« D\'abord la plaque, ensuite le cœur. »',
  combo:['+🧪✨ S\'ouvre : l\'acide, puis la lumière', ' Sans potion : le bouclier de runes', '!✨ Piège : la lumière en premier'], dessin:dessin};
})();
