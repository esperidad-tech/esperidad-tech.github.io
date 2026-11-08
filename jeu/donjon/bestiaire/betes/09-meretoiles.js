/* La Mère des toiles (élite) : une araignée reine pendue à son gros fil, au milieu de sa toile, entourée de ses œufs */
(function(){
var B = window.BT, P = B.P, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE;
var NN = 0;
function gid(p){ return p + (++NN) + 'm' + Math.floor(Math.random() * 1e6); }
function n1(v){ return (+v).toFixed(1); }
function pt(p){ return n1(p[0]) + ' ' + n1(p[1]); }
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
function tube(pts, ws){
  var c = cote(pts, ws), n = pts.length, D = c.D.slice().reverse();
  return 'M' + pt(c.G[0]) + crs(c.G) + ' A ' + n1(ws[n - 1] / 2) + ' ' + n1(ws[n - 1] / 2) + ' 0 0 0 ' + pt(D[0]) + crs(D) + ' A ' + n1(ws[0] / 2) + ' ' + n1(ws[0] / 2) + ' 0 0 0 ' + pt(c.G[0]) + ' Z';
}
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function rot(p, c, a){ var r = a * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; }
var SOIE = '#d8e6ff', NOIRV = '#2e2238', BANDE = '#5e3c66';

function dessin(){
  var d = new B.Dessin(), memo = {}, dg = function(c, f){ var k = c + (f || 1); return memo[k] || (memo[k] = d.g(c, f)); }, s = '', FL2 = d.flou(2), FL5 = d.flou(5), FL10 = d.flou(10), R = B.rng(53);
  var H = [268, 196];   /* le centre de la toile */
  /* ---------- la toile ---------- */
  var NR = 20, rayons = [], ang = [];
  for(var i = 0; i < NR; i++){ ang.push(i / NR * Math.PI * 2 + (R() - .5) * .14); }
  var toile = '', fils = '', gouttes = '';
  ang.forEach(function(a, i){
    var x = H[0] + Math.cos(a) * 520, y = H[1] + Math.sin(a) * 520;
    toile += 'M' + pt(H) + ' L ' + n1(x) + ' ' + n1(y) + ' ';
  });
  /* la spirale : des arcs qui pendent un peu entre deux rayons */
  for(var k = 0; k < 15; k++){
    for(var j = 0; j < NR; j++){
      if(R() < .07) continue;
      var r0 = 34 + k * 27 + (R() - .5) * 6, r1 = 34 + k * 27 + (R() - .5) * 6, a0 = ang[j], a1 = ang[(j + 1) % NR] + (j === NR - 1 ? Math.PI * 2 : 0);
      var p0 = [H[0] + Math.cos(a0) * r0, H[1] + Math.sin(a0) * r0], p1 = [H[0] + Math.cos(a1) * r1, H[1] + Math.sin(a1) * r1], m = lerp(p0, p1, .5), cpt = lerp(H, m, .9);
      fils += 'M' + pt(p0) + ' Q ' + pt(cpt) + ' ' + pt(p1) + ' ';
      if(R() < .18) gouttes += C(n1(p0[0]), n1(p0[1]), n1(1.2 + R() * 1.6), '#f4fbff', ' opacity="' + n1(.5 + R() * .4) + '"');
    }
  }
  /* la toile s'efface vers le bas et vers le haut, pour ne pas déborder sur la fiche */
  var mq = gid('mq'), mg = gid('mg');
  d.defs.push('<linearGradient id="' + mg + '" gradientUnits="userSpaceOnUse" x1="0" y1="-40" x2="0" y2="426"><stop offset="0" stop-color="#000"/><stop offset=".1" stop-color="#fff"/><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>');
  d.defs.push('<mask id="' + mq + '" maskUnits="userSpaceOnUse" x="-20" y="-60" width="580" height="500"><rect x="-20" y="-60" width="580" height="500" fill="url(#' + mg + ')"/></mask>');
  s += '<g mask="url(#' + mq + ')">';
  s += '<g opacity=".8">' + L(toile, SOIE, 1.3, ' opacity=".3"') + L(fils, SOIE, 1, ' opacity=".24"') + '</g>';
  /* fils déchirés qui pendent */
  [[60, 330, 40], [470, 350, 34], [520, 120, 30], [24, 120, 26]].forEach(function(f){ s += L('M' + f[0] + ' ' + f[1] + ' q 6 ' + (f[2] * .5) + ' -2 ' + f[2], SOIE, 1.1, ' opacity=".4"'); });
  /* reflets de lune sur les fils du haut à droite */
  s += L('M' + pt(H) + ' L ' + n1(H[0] + Math.cos(ang[15]) * 520) + ' ' + n1(H[1] + Math.sin(ang[15]) * 520) + ' M' + pt(H) + ' L ' + n1(H[0] + Math.cos(ang[16]) * 520) + ' ' + n1(H[1] + Math.sin(ang[16]) * 520), '#f0f8ff', 1.4, ' opacity=".35"');
  s += gouttes + '</g>';

  /* ---------- les sacs d'œufs, qui luisent faiblement ---------- */
  function sac(x, y, r, a, seed, fil){
    var Rr = B.rng(seed), t = ' transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"', o = '';
    if(fil) o += L('M' + x + ' ' + (y - r * 1.1) + ' L ' + (x + fil[0]) + ' ' + (y - r * 1.1 + fil[1]), SOIE, 1.4, ' opacity=".7"');
    o += '<circle cx="' + x + '" cy="' + y + '" r="' + n1(r * 2.1) + '" fill="' + d.halo('#e8ffd0', '#9aff7a') + '" opacity=".28"/>';
    o += '<g' + t + '>';
    var forme = 'M0 ' + n1(-r * 1.15) + ' C ' + n1(r * .5) + ' ' + n1(-r * 1.05) + ' ' + n1(r) + ' ' + n1(-r * .5) + ' ' + n1(r) + ' ' + n1(r * .1) + ' C ' + n1(r) + ' ' + n1(r * .8) + ' ' + n1(r * .5) + ' ' + n1(r * 1.05) + ' 0 ' + n1(r * 1.05) + ' C ' + n1(-r * .5) + ' ' + n1(r * 1.05) + ' ' + n1(-r) + ' ' + n1(r * .8) + ' ' + n1(-r) + ' ' + n1(r * .1) + ' C ' + n1(-r) + ' ' + n1(-r * .5) + ' ' + n1(-r * .5) + ' ' + n1(-r * 1.05) + ' 0 ' + n1(-r * 1.15) + ' Z';
    o += P(forme, d.halo('#f4ffe8', '#b8d8a0'));
    /* les petits qui attendent dedans */
    for(var q = 0; q < 9; q++){ var aa = Rr() * Math.PI * 2, rr = Math.sqrt(Rr()) * r * .6; o += '<ellipse cx="' + n1(Math.cos(aa) * rr) + '" cy="' + n1(Math.sin(aa) * rr + r * .1) + '" rx="' + n1(r * .14) + '" ry="' + n1(r * .11) + '" fill="#4a5a3a" opacity=".32"/>'; }
    /* la soie entrecroisée */
    var lignes = '';
    for(var w = 0; w < 7; w++){ var y0 = -r + Rr() * r * 2, y1 = -r + Rr() * r * 2; lignes += 'M' + n1(-r * .95) + ' ' + n1(y0) + ' Q 0 ' + n1((y0 + y1) / 2 + (Rr() - .5) * r * .6) + ' ' + n1(r * .95) + ' ' + n1(y1) + ' '; }
    o += L(lignes, '#ffffff', 1, ' opacity=".55"') + L(lignes, '#6a7a5a', .6, ' opacity=".35" transform="translate(.6 .9)"');
    o += L('M' + n1(r * .2) + ' ' + n1(-r * .95) + ' C ' + n1(r * .75) + ' ' + n1(-r * .7) + ' ' + n1(r * .92) + ' ' + n1(-r * .2) + ' ' + n1(r * .9) + ' ' + n1(r * .2), '#ffffff', 1.6, ' opacity=".7"');
    o += F('M0 ' + n1(-r * 1.15) + ' l -3 -6 l 6 0 Z', '#c8d0c0');
    return o + '</g>';
  }
  s += sac(66, 110, 22, -14, 1, [10, -46]) + sac(484, 128, 21, 12, 2, [-6, -44]) + sac(36, 232, 15, -6, 3, [4, -30]) + sac(500, 250, 18, 8, 4, [-4, -36]) + sac(146, 352, 16, -10, 5, [6, -30]) + sac(414, 334, 14, 14, 6, [-4, -26]);

  /* ---------- le gros fil qui la retient ---------- */
  var fil = 'M326 -12 C 327 10 325 34 327 52';
  s += L(fil, '#bfe8ff', 18, ' opacity=".4" filter="' + FL5 + '"') + L(fil, O, 10) + L(fil, '#e2ecff', 6.6) + L('M323.5 -12 C 330 2 321 16 328 30 C 333 40 324 46 327 54', '#8a9cc0', 1.5) + L('M329 -12 C 322 4 331 20 324 36 C 322 42 326 48 327 52', '#ffffff', 1.3, ' opacity=".9"');
  for(var fz = 0; fz < 6; fz++) s += L('M' + n1(324 + (fz % 2) * 5) + ' ' + (-6 + fz * 10) + ' l ' + ((fz % 2) ? 4 : -4) + ' 3', '#f4f8ff', .9, ' opacity=".6"');

  /* ---------- une patte : fémur, rotule, tibia, métatarse, tarse ; poils, articulations, griffes ---------- */
  function patte(pts, ws, seed){
    var Rr = B.rng(seed), o = '', segs = [];
    for(var i = 0; i < pts.length - 1; i++){
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy), nx = -dy / l, ny = dx / l;
      if(ny > 0){ nx = -nx; ny = -ny; }
      var bomb = i === 0 ? .07 : i === 2 ? .04 : .02, m = [(a[0] + b[0]) / 2 + nx * l * bomb, (a[1] + b[1]) / 2 + ny * l * bomb];
      segs.push({p: [a, m, b], w: [ws[i], (ws[i] + ws[i + 1]) / 2 * 1.04, ws[i + 1]], n: [nx, ny], l: l});
    }
    /* du bout vers le corps : chaque segment recouvre un peu le suivant */
    for(var k = segs.length - 1; k >= 0; k--){
      var sg = segs[k], forme = tube(sg.p, sg.w);
      /* poils : le long des deux bords, couchés vers le bout de la patte */
      var c = cote([sg.p[0], lerp(sg.p[0], sg.p[1], .5), sg.p[1], lerp(sg.p[1], sg.p[2], .5), sg.p[2]], [sg.w[0], (sg.w[0] + sg.w[1]) / 2, sg.w[1], (sg.w[1] + sg.w[2]) / 2, sg.w[2]]);
      var tx = (sg.p[2][0] - sg.p[0][0]) / sg.l, ty = (sg.p[2][1] - sg.p[0][1]) / sg.l, poilsH = '', poilsB = '', nb = Math.round(sg.l / 2.2);
      for(var h = 0; h < nb; h++){
        var t = (h + Rr()) / nb, side = h % 2 ? c.G : c.D, idx = Math.min(3, Math.floor(t * 4)), f = t * 4 - idx, e = lerp(side[idx], side[idx + 1], f);
        var cx2 = (c.G[idx][0] + c.D[idx][0]) / 2, cy2 = (c.G[idx][1] + c.D[idx][1]) / 2, ox = e[0] - cx2, oy = e[1] - cy2, ol = Math.sqrt(ox * ox + oy * oy) || 1;
        var len = (4 + Rr() * 6) * (k === 0 ? 1.25 : k === 3 ? .7 : 1), hx = ox / ol * .7 + tx * .75, hy = oy / ol * .7 + ty * .75;
        var dd = 'M' + n1(e[0] - ox / ol) + ' ' + n1(e[1] - oy / ol) + ' q ' + n1(hx * len * .5) + ' ' + n1(hy * len * .5) + ' ' + n1(hx * len + tx * 1.5) + ' ' + n1(hy * len + ty * 1.5) + ' ';
        if(ox / ol * sg.n[0] + oy / ol * sg.n[1] > 0) poilsH += dd; else poilsB += dd;
      }
      o += L(poilsB, '#5a4a6e', 1.2, ' opacity=".85"') + L(poilsH, '#a898c4', 1.1, ' opacity=".8"');
      o += P(forme, dg(k % 2 ? B.clair(NOIRV, .04) : NOIRV));
      /* la bague claire au bout du segment */
      var b0 = lerp(sg.p[1], sg.p[2], .62);
      o += P(tube([b0, sg.p[2]], [sg.w[1] * .98, sg.w[2]]), dg(BANDE), ' stroke-width="2.2"');
      /* liseré de lune sur le bord du haut */
      var hl = cote(sg.p, sg.w.map(function(w){ return w * .62; })), up = (hl.G[1][1] - sg.p[1][1]) < 0 ? hl.G : hl.D;
      o += L('M' + pt(up[0]) + crs(up), LUNE, 1.6, ' opacity=".55"');
      o += L('M' + pt(lerp(sg.p[0], sg.p[1], .3)) + ' Q ' + pt(sg.p[1]) + ' ' + pt(lerp(sg.p[1], sg.p[2], .5)), '#ffffff', .9, ' opacity=".18"');
    }
    /* articulations bombées */
    for(var j = 1; j < pts.length - 1; j++) o += '<circle cx="' + n1(pts[j][0]) + '" cy="' + n1(pts[j][1]) + '" r="' + n1(ws[j] * .52) + '" fill="' + dg(B.clair(NOIRV, .08)) + '" stroke="' + O + '" stroke-width="2.4"/>' + C(n1(pts[j][0] + ws[j] * .15), n1(pts[j][1] - ws[j] * .2), n1(ws[j] * .14), '#d8ccf0', ' opacity=".6"');
    /* les griffes au bout */
    var z = pts[pts.length - 1], y2 = pts[pts.length - 2], za = Math.atan2(z[1] - y2[1], z[0] - y2[0]);
    [-.5, .5].forEach(function(dv){ var g = za + dv; o += L('M' + pt(z) + ' q ' + n1(Math.cos(g) * 5) + ' ' + n1(Math.sin(g) * 5) + ' ' + n1(Math.cos(g + dv * 1.6) * 7 + Math.cos(g) * 2) + ' ' + n1(Math.sin(g + dv * 1.6) * 7 + Math.sin(g) * 2), O, 2.4) + L('M' + pt(z) + ' q ' + n1(Math.cos(g) * 5) + ' ' + n1(Math.sin(g) * 5) + ' ' + n1(Math.cos(g + dv * 1.6) * 7 + Math.cos(g) * 2) + ' ' + n1(Math.sin(g + dv * 1.6) * 7 + Math.sin(g) * 2), '#c8b8d8', 1); });
    return o;
  }
  var W = [16, 14, 12, 9, 5.5];
  var PATTES = {
    L4: [[232, 214], [180, 124], [166, 112], [108, 84], [62, 62]],
    R4: [[300, 210], [376, 112], [390, 100], [446, 66], [490, 36]],
    L3: [[222, 230], [138, 166], [122, 160], [62, 172], [20, 190]],
    R3: [[310, 226], [398, 166], [414, 162], [474, 176], [520, 194]],
    L2: [[220, 248], [136, 236], [120, 240], [68, 300], [38, 338]],
    R2: [[312, 244], [398, 240], [414, 246], [462, 304], [492, 340]],
    L1: [[230, 266], [166, 296], [150, 306], [108, 350], [88, 372]],
    R1: [[300, 264], [356, 298], [368, 310], [404, 360], [426, 388]]
  };

  /* ---------- ombre au sol (la toile descend jusqu'au sol) ---------- */
  s += '<ellipse cx="240" cy="398" rx="210" ry="12" fill="#000" opacity=".45"/>';

  /* elle se balance au bout de son fil, la tête tournée vers les héros */
  s += '<g transform="rotate(7 326 42)">';
  /* ---------- l'abdomen, énorme, et son sablier rouge ---------- */
  var A = [304, 134], Aa = 12;
  s += '<g transform="rotate(' + Aa + ' ' + A[0] + ' ' + A[1] + ')">';
  var ventre = 'M' + A[0] + ' ' + (A[1] - 96) + ' C ' + (A[0] + 52) + ' ' + (A[1] - 96) + ' ' + (A[0] + 86) + ' ' + (A[1] - 50) + ' ' + (A[0] + 86) + ' ' + (A[1] + 4) + ' C ' + (A[0] + 86) + ' ' + (A[1] + 60) + ' ' + (A[0] + 50) + ' ' + (A[1] + 96) + ' ' + A[0] + ' ' + (A[1] + 96) + ' C ' + (A[0] - 50) + ' ' + (A[1] + 96) + ' ' + (A[0] - 86) + ' ' + (A[1] + 60) + ' ' + (A[0] - 86) + ' ' + (A[1] + 4) + ' C ' + (A[0] - 86) + ' ' + (A[1] - 50) + ' ' + (A[0] - 52) + ' ' + (A[1] - 96) + ' ' + A[0] + ' ' + (A[1] - 96) + ' Z';
  var gv = gid('gv');
  d.defs.push('<radialGradient id="' + gv + '" cx=".64" cy=".3" r=".8"><stop offset="0" stop-color="#5a4672"/><stop offset=".35" stop-color="#2e2240"/><stop offset=".85" stop-color="#140c1e"/><stop offset="1" stop-color="#0c0614"/></radialGradient>');
  s += P(ventre, 'url(#' + gv + ')');
  var cl = gid('cv'); d.defs.push('<clipPath id="' + cl + '"><path d="' + ventre + '"/></clipPath>');
  var dedans = '';
  /* duvet : de courts poils serrés */
  var Rv = B.rng(7), duvet = '', duvetC = '';
  for(var v = 0; v < 260; v++){
    var va = Rv() * Math.PI * 2, vr = Math.sqrt(Rv()), vx = A[0] + Math.cos(va) * 84 * vr, vy = A[1] + Math.sin(va) * 94 * vr, vl = 4 + Rv() * 5, dir = Math.atan2(vy - A[1] + 60, vx - A[0]);
    var seg = 'M' + n1(vx) + ' ' + n1(vy) + ' l ' + n1(Math.cos(dir) * vl) + ' ' + n1(Math.sin(dir) * vl) + ' ';
    if(vx - A[0] - (vy - A[1]) > 20) duvetC += seg; else duvet += seg;
  }
  dedans += L(duvet, '#0a0410', 1.1, ' opacity=".55"') + L(duvetC, '#9a88b8', 1, ' opacity=".35"');
  /* chevrons pâles sur les flancs */
  [[-58, -34], [-64, 4], [-56, 40], [58, -34], [64, 4], [56, 40]].forEach(function(c2, i){ var sx = c2[0] < 0 ? -1 : 1; dedans += F('M' + (A[0] + c2[0]) + ' ' + (A[1] + c2[1]) + ' l ' + (sx * 10) + ' -6 l ' + (sx * 2) + ' 6 l ' + (sx * -10) + ' 8 Z', '#8a6aa0', ' opacity="' + (sx > 0 ? .5 : .3) + '"'); });
  /* reflet brillant et liseré de lune */
  dedans += '<ellipse cx="' + (A[0] + 34) + '" cy="' + (A[1] - 50) + '" rx="26" ry="14" transform="rotate(38 ' + (A[0] + 34) + ' ' + (A[1] - 50) + ')" fill="#d8ccff" opacity=".22" filter="' + FL5 + '"/>';
  dedans += '<ellipse cx="' + (A[0] + 40) + '" cy="' + (A[1] - 56) + '" rx="9" ry="4.5" transform="rotate(38 ' + (A[0] + 40) + ' ' + (A[1] - 56) + ')" fill="#ffffff" opacity=".7"/>';
  dedans += '<path d="' + ventre + '" fill="none" stroke="' + LUNE + '" stroke-width="3" opacity=".55" transform="translate(-2.4 3)"/>';
  dedans += '<path d="' + ventre + '" fill="none" stroke="#05020a" stroke-width="18" opacity=".55" transform="translate(9 -10)" filter="' + FL5 + '"/>';
  s += '<g clip-path="url(#' + cl + ')">' + dedans + '</g>';
  /* soies qui dépassent tout autour du ventre */
  var bord = '', bordC = '', Rb = B.rng(61);
  for(var bi = 0; bi < 110; bi++){
    var ba = bi / 110 * Math.PI * 2 + Rb() * .03, bx2 = A[0] + Math.cos(ba) * 85, by2 = A[1] + Math.sin(ba) * 95, bl = 4 + Rb() * 6, bdir = ba + (Rb() - .5) * .5;
    var sgm = 'M' + n1(bx2 - Math.cos(ba) * 2) + ' ' + n1(by2 - Math.sin(ba) * 2) + ' l ' + n1(Math.cos(bdir) * bl) + ' ' + n1(Math.sin(bdir) * bl) + ' ';
    if(Math.cos(ba) - Math.sin(ba) > .5) bordC += sgm; else bord += sgm;
  }
  s += L(bord, '#4a3a5e', 1.2, ' opacity=".9"') + L(bordC, '#b8a8d8', 1.1, ' opacity=".8"');
  /* les filières, en haut, d'où sort le fil */
  s += P('M' + (A[0] - 14) + ' ' + (A[1] - 92) + ' C ' + (A[0] - 12) + ' ' + (A[1] - 106) + ' ' + (A[0] + 12) + ' ' + (A[1] - 108) + ' ' + (A[0] + 16) + ' ' + (A[1] - 94) + ' Z', dg('#4a3a58'));
  s += P('M' + (A[0] - 6) + ' ' + (A[1] - 100) + ' L ' + (A[0] - 4) + ' ' + (A[1] - 110) + ' L ' + (A[0] + 4) + ' ' + (A[1] - 110) + ' L ' + (A[0] + 6) + ' ' + (A[1] - 100) + ' Z', dg('#6a5a7a'), ' stroke-width="2"');
  /* LE SABLIER ROUGE : son point faible */
  var S = [A[0] - 4, A[1] - 8];
  s += '<circle cx="' + S[0] + '" cy="' + S[1] + '" r="58" fill="' + d.halo('#ff9a8a', '#ff1a3a') + '" opacity=".5"/>';
  var sab = 'M' + (S[0] - 20) + ' ' + (S[1] - 34) + ' C ' + (S[0] - 8) + ' ' + (S[1] - 37) + ' ' + (S[0] + 8) + ' ' + (S[1] - 37) + ' ' + (S[0] + 20) + ' ' + (S[1] - 34) + ' C ' + (S[0] + 16) + ' ' + (S[1] - 16) + ' ' + (S[0] + 6) + ' ' + (S[1] - 6) + ' ' + (S[0] + 4) + ' ' + S[1] + ' C ' + (S[0] + 6) + ' ' + (S[1] + 6) + ' ' + (S[0] + 16) + ' ' + (S[1] + 16) + ' ' + (S[0] + 20) + ' ' + (S[1] + 34) + ' C ' + (S[0] + 8) + ' ' + (S[1] + 37) + ' ' + (S[0] - 8) + ' ' + (S[1] + 37) + ' ' + (S[0] - 20) + ' ' + (S[1] + 34) + ' C ' + (S[0] - 16) + ' ' + (S[1] + 16) + ' ' + (S[0] - 6) + ' ' + (S[1] + 6) + ' ' + (S[0] - 4) + ' ' + S[1] + ' C ' + (S[0] - 6) + ' ' + (S[1] - 6) + ' ' + (S[0] - 16) + ' ' + (S[1] - 16) + ' ' + (S[0] - 20) + ' ' + (S[1] - 34) + ' Z';
  var gs = gid('gs');
  d.defs.push('<linearGradient id="' + gs + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a7a"/><stop offset=".4" stop-color="#ff2a3a"/><stop offset="1" stop-color="#b80a24"/></linearGradient>');
  s += L(sab, '#ff2a3a', 8, ' opacity=".7" filter="' + FL5 + '"');
  s += P(sab, 'url(#' + gs + ')');
  s += L('M' + (S[0] + 10) + ' ' + (S[1] - 31) + ' C ' + (S[0] + 12) + ' ' + (S[1] - 22) + ' ' + (S[0] + 8) + ' ' + (S[1] - 12) + ' ' + (S[0] + 4) + ' ' + (S[1] - 6), '#ffe0d0', 2, ' opacity=".8"') + L('M' + (S[0] + 12) + ' ' + (S[1] + 14) + ' C ' + (S[0] + 15) + ' ' + (S[1] + 20) + ' ' + (S[0] + 16) + ' ' + (S[1] + 26) + ' ' + (S[0] + 16) + ' ' + (S[1] + 30), '#ffe0d0', 1.6, ' opacity=".6"');
  s += '</g>';

  /* ---------- les pattes (du fond vers le devant) ---------- */
  ['R4', 'L4', 'R3', 'L3', 'R2', 'L2'].forEach(function(id, i){ s += patte(PATTES[id], W, 10 + i); });

  /* ---------- le céphalothorax, la couronne d'épines, le visage ---------- */
  var T = [264, 236];
  s += '<g transform="rotate(8 ' + T[0] + ' ' + T[1] + ')">';
  /* la couronne d'épines, tout autour du haut de la tête */
  var epines = '';
  for(var e = 0; e < 11; e++){
    var ea = Math.PI * (1.02 + e * .096), l2 = 22 + (e % 2 ? 0 : 12) + (e > 2 && e < 8 ? 10 : 0), bx = T[0] + Math.cos(ea) * 52, by = T[1] + Math.sin(ea) * 42;
    var px = -Math.sin(ea), py = Math.cos(ea), tip = [bx + Math.cos(ea) * l2 + px * 4, by + Math.sin(ea) * l2 + py * 4];
    epines += P('M' + n1(bx - px * 6) + ' ' + n1(by - py * 6) + ' Q ' + n1(bx + Math.cos(ea) * l2 * .6 - px * 3) + ' ' + n1(by + Math.sin(ea) * l2 * .6 - py * 3) + ' ' + pt(tip) + ' Q ' + n1(bx + Math.cos(ea) * l2 * .5 + px * 3) + ' ' + n1(by + Math.sin(ea) * l2 * .5 + py * 3) + ' ' + n1(bx + px * 6) + ' ' + n1(by + py * 6) + ' Z', dg('#d8c8e0'), ' stroke-width="2.4"');
    epines += F('M' + n1(bx - px * 5) + ' ' + n1(by - py * 5) + ' Q ' + n1(bx + Math.cos(ea) * l2 * .3) + ' ' + n1(by + Math.sin(ea) * l2 * .3) + ' ' + n1(bx + px * 5) + ' ' + n1(by + py * 5) + ' Z', '#3a2440', ' opacity=".8"');
  }
  s += epines;
  var tete = 'M' + (T[0] - 56) + ' ' + T[1] + ' C ' + (T[0] - 56) + ' ' + (T[1] - 30) + ' ' + (T[0] - 30) + ' ' + (T[1] - 48) + ' ' + T[0] + ' ' + (T[1] - 48) + ' C ' + (T[0] + 30) + ' ' + (T[1] - 48) + ' ' + (T[0] + 56) + ' ' + (T[1] - 30) + ' ' + (T[0] + 56) + ' ' + T[1] + ' C ' + (T[0] + 56) + ' ' + (T[1] + 30) + ' ' + (T[0] + 32) + ' ' + (T[1] + 50) + ' ' + T[0] + ' ' + (T[1] + 50) + ' C ' + (T[0] - 32) + ' ' + (T[1] + 50) + ' ' + (T[0] - 56) + ' ' + (T[1] + 30) + ' ' + (T[0] - 56) + ' ' + T[1] + ' Z';
  var gt = gid('gt');
  d.defs.push('<radialGradient id="' + gt + '" cx=".62" cy=".32" r=".8"><stop offset="0" stop-color="#5a4672"/><stop offset=".4" stop-color="#2e2240"/><stop offset="1" stop-color="#0e0816"/></radialGradient>');
  var bordT = '', Rq = B.rng(71);
  for(var qi = 0; qi < 70; qi++){ var qa = qi / 70 * Math.PI * 2, qx = T[0] + Math.cos(qa) * 55, qy = T[1] + Math.sin(qa) * 49, ql = 4 + Rq() * 5, qd = qa + (Rq() - .5) * .6; bordT += 'M' + n1(qx - Math.cos(qa) * 2) + ' ' + n1(qy - Math.sin(qa) * 2) + ' l ' + n1(Math.cos(qd) * ql) + ' ' + n1(Math.sin(qd) * ql) + ' '; }
  s += L(bordT, '#6a5a80', 1.2, ' opacity=".9"');
  s += P(tete, 'url(#' + gt + ')');
  var ct = gid('ct'); d.defs.push('<clipPath id="' + ct + '"><path d="' + tete + '"/></clipPath>');
  var dt = '';
  /* sillons qui rayonnent sur la carapace */
  for(var g2 = 0; g2 < 8; g2++){ var ga = Math.PI * (1.1 + g2 * .11); dt += L('M' + n1(T[0] + Math.cos(ga) * 14) + ' ' + n1(T[1] - 10 + Math.sin(ga) * 10) + ' L ' + n1(T[0] + Math.cos(ga) * 50) + ' ' + n1(T[1] - 10 + Math.sin(ga) * 40), '#0a0410', 1.6, ' opacity=".5"'); }
  dt += '<path d="' + tete + '" fill="none" stroke="' + LUNE + '" stroke-width="3" opacity=".55" transform="translate(-2.2 2.8)"/>';
  dt += '<ellipse cx="' + (T[0] + 22) + '" cy="' + (T[1] - 28) + '" rx="14" ry="6" transform="rotate(30 ' + (T[0] + 22) + ' ' + (T[1] - 28) + ')" fill="#ffffff" opacity=".35" filter="' + FL2 + '"/>';
  /* duvet de la tête */
  var Rt = B.rng(17), dv = '';
  for(var t2 = 0; t2 < 90; t2++){ var ta = Rt() * Math.PI * 2, tr = Math.sqrt(Rt()), tx = T[0] + Math.cos(ta) * 54 * tr, ty = T[1] + Math.sin(ta) * 46 * tr, tl = 3 + Rt() * 4, td = Math.atan2(ty - T[1], tx - T[0]); dv += 'M' + n1(tx) + ' ' + n1(ty) + ' l ' + n1(Math.cos(td) * tl) + ' ' + n1(Math.sin(td) * tl) + ' '; }
  dt += L(dv, '#0a0410', 1, ' opacity=".5"');
  s += '<g clip-path="url(#' + ct + ')">' + dt + '</g>';
  /* les huit yeux */
  var Y = [T[0] - 6, T[1] + 4];
  s += '<ellipse cx="' + Y[0] + '" cy="' + Y[1] + '" rx="46" ry="30" fill="' + d.halo('#f4ffb0', '#b8ff3a') + '" opacity=".38"/>';
  var gy = gid('gy');
  d.defs.push('<radialGradient id="' + gy + '" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#ffffe0"/><stop offset=".35" stop-color="#e8ff6a"/><stop offset=".8" stop-color="#6aa81a"/><stop offset="1" stop-color="#2a4a0a"/></radialGradient>');
  [[-11, 6, 10], [11, 6, 10], [-30, 0, 6.4], [30, 0, 6.4], [-12, -14, 4.4], [12, -14, 4.4], [-27, -16, 3.6], [27, -16, 3.6]].forEach(function(e2){
    var ex = Y[0] + e2[0], ey = Y[1] + e2[1], er = e2[2];
    s += '<circle cx="' + n1(ex) + '" cy="' + n1(ey) + '" r="' + n1(er + 2.6) + '" fill="#0a0410"/>';
    s += '<circle cx="' + n1(ex) + '" cy="' + n1(ey) + '" r="' + n1(er) + '" fill="url(#' + gy + ')" stroke="' + O + '" stroke-width="1.6"/>';
    s += C(n1(ex - er * .32), n1(ey - er * .36), n1(er * .3), '#ffffff', ' opacity=".9"') + C(n1(ex + er * .35), n1(ey + er * .3), n1(er * .12), '#ffffff', ' opacity=".6"');
  });
  /* sourcil cruel au-dessus des grands yeux */
  s += P('M' + (Y[0] - 26) + ' ' + (Y[1] - 6) + ' C ' + (Y[0] - 16) + ' ' + (Y[1] - 6) + ' ' + (Y[0] - 6) + ' ' + (Y[1] - 2) + ' ' + Y[0] + ' ' + (Y[1] + 4) + ' C ' + (Y[0] + 6) + ' ' + (Y[1] - 2) + ' ' + (Y[0] + 16) + ' ' + (Y[1] - 6) + ' ' + (Y[0] + 26) + ' ' + (Y[1] - 6) + ' L ' + (Y[0] + 24) + ' ' + (Y[1] - 1) + ' C ' + (Y[0] + 14) + ' ' + (Y[1] - 1) + ' ' + (Y[0] + 6) + ' ' + (Y[1] + 3) + ' ' + Y[0] + ' ' + (Y[1] + 9) + ' C ' + (Y[0] - 6) + ' ' + (Y[1] + 3) + ' ' + (Y[0] - 14) + ' ' + (Y[1] - 1) + ' ' + (Y[0] - 24) + ' ' + (Y[1] - 1) + ' Z', '#0a0410', ' stroke-width="1.6" opacity=".92"');
  s += '</g>';
  /* les pédipalpes, de chaque côté de la bouche */
  s += patte([[236, 262], [214, 280], [210, 300], [222, 314]], [12, 10, 9, 10], 31) + patte([[292, 268], [314, 286], [316, 306], [304, 318]], [12, 10, 9, 10], 32);
  s += '<ellipse cx="222" cy="316" rx="8" ry="7" fill="' + dg('#3a2c48') + '" stroke="' + O + '" stroke-width="2.4"/><ellipse cx="304" cy="320" rx="8" ry="7" fill="' + dg('#3a2c48') + '" stroke="' + O + '" stroke-width="2.4"/>';
  /* les chélicères, gonflées, et leurs crochets */
  [[246, 286, -1], [276, 290, 1]].forEach(function(c3){
    var x = c3[0], y = c3[1], sg = c3[2];
    s += P('M' + (x - 14) + ' ' + (y - 14) + ' C ' + (x - 16) + ' ' + (y + 4) + ' ' + (x - 8) + ' ' + (y + 20) + ' ' + x + ' ' + (y + 22) + ' C ' + (x + 8) + ' ' + (y + 20) + ' ' + (x + 16) + ' ' + (y + 4) + ' ' + (x + 14) + ' ' + (y - 14) + ' Z', dg('#3a2a4a'));
    s += L('M' + (x + 6) + ' ' + (y - 10) + ' C ' + (x + 10) + ' ' + (y - 2) + ' ' + (x + 8) + ' ' + (y + 10) + ' ' + (x + 4) + ' ' + (y + 16), LUNE, 1.6, ' opacity=".5"');
    s += L('M' + (x - 10) + ' ' + (y - 4) + ' l -5 2 M' + (x - 10) + ' ' + (y + 4) + ' l -5 3 M' + (x - 6) + ' ' + (y + 12) + ' l -4 4 M' + (x + 10) + ' ' + (y - 4) + ' l 5 2 M' + (x + 10) + ' ' + (y + 4) + ' l 5 3', '#120a18', 1.3);
    var cro = 'M' + (x - 5) + ' ' + (y + 18) + ' C ' + (x - 6) + ' ' + (y + 30) + ' ' + (x - sg * 2) + ' ' + (y + 38) + ' ' + (x - sg * 12) + ' ' + (y + 42) + ' C ' + (x - sg * 4) + ' ' + (y + 34) + ' ' + (x + 2) + ' ' + (y + 28) + ' ' + (x + 5) + ' ' + (y + 18) + ' Z';
    s += P(cro, dg('#e8dcc8'), ' stroke-width="2.4"') + L('M' + (x + 1) + ' ' + (y + 22) + ' C ' + (x + 1) + ' ' + (y + 28) + ' ' + (x - sg * 2) + ' ' + (y + 34) + ' ' + (x - sg * 8) + ' ' + (y + 38), '#ffffff', 1, ' opacity=".7"');
  });
  /* une goutte de venin qui perle */
  s += '<circle cx="290" cy="337" r="9" fill="' + d.halo('#f0ffc0', '#a8ff4a') + '" opacity=".6"/>' + P('M288 332 C 292 336 293 340 290 342 C 287 343 285 340 286 337 Z', '#c8ff6a', ' stroke-width="1.6"') + C(288.6, 337.4, .9, '#ffffff');

  /* ---------- les pattes de devant, par-dessus ---------- */
  s += patte(PATTES.R1, W, 21) + patte(PATTES.L1, W, 22);
  s += '</g>';
  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.meretoiles = {nom:'La Mère des toiles', rang:'elite', pv:300, lieu:'Au bout du chemin court',
  livre:'« Coupe son fil, mais épargne ses œufs. »',
  combo:['+🔥✨ S\'ouvre : le feu sur le fil, puis la lumière', ' Autre chemin : l\'huile sur le fil', '!🔥 Piège : le feu sur les œufs'], dessin:dessin};
})();
