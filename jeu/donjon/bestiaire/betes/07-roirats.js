/* Le Roi des rats (élite) : dix rats, queues nouées en un seul nœud, le plus gros couronné de bric et de broc */
(function(){
var B = window.BT, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE;
var NN = 0;
function gid(p){ return p + (++NN) + 'r' + Math.floor(Math.random() * 1e6); }
function n1(v){ return (+v).toFixed(1); }
function pt(p){ return n1(p[0]) + ' ' + n1(p[1]); }
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + n1(w) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
/* dégradé éclairé en haut à droite (en haut à gauche si la bête est retournée) */
function grad(d, c, flip, fort){
  fort = fort || 1; var cle = c + (flip ? 'f' : '') + fort;
  d.memo = d.memo || {};
  if(d.memo[cle]) return d.memo[cle];
  var id = gid('rg');
  d.defs.push('<linearGradient id="' + id + '" x1="' + (flip ? 0 : 1) + '" y1="0" x2="' + (flip ? 1 : 0) + '" y2="1"><stop offset="0" stop-color="' + B.clair(c, .28 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + B.sombre(c, .45 * fort) + '"/></linearGradient>');
  return (d.memo[cle] = 'url(#' + id + ')');
}
/* courbe lisse (Catmull-Rom) qui passe par tous les points */
function crs(P){
  var s = '', n = P.length;
  for(var i = 0; i < n - 1; i++){
    var p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, n - 1)];
    s += ' C ' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2);
  }
  return s;
}
/* un membre organique : un tube qui passe par des points, d'épaisseurs différentes */
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
function rotP(p, c, a){ var r = a * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; }
function glob(o, p){ var a = o.rot * Math.PI / 180, x = p[0] * o.s * (o.flip ? -1 : 1), y = p[1] * o.s; return [o.x + x * Math.cos(a) - y * Math.sin(a), o.y + x * Math.sin(a) + y * Math.cos(a)]; }
/* mèches de poil, tirées au hasard dans une ellipse (pointées vers l'arrière) */
function poils(cx, cy, rx, ry, n, seed, w, cH, cB){
  var R = B.rng(seed), h = '', b = '';
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    var haut = y < cy - ry * 0.15, l = 8 + R() * 9, m = 'M' + n1(x) + ' ' + n1(y) + ' q ' + n1(l * 0.5) + ' ' + n1(l * 0.08) + ' ' + n1(l) + ' ' + n1(l * 0.42) + ' ';
    if(haut) h += m; else b += m;
  }
  return (h ? L(h, cH, w, ' opacity=".4"') : '') + (b ? L(b, cB, w, ' opacity=".5"') : '');
}
/* crête de poils hérissés le long d'une courbe */
function crete(pts, t0, t1, n, haut, couleur, w, dos){
  var s = 'M', base = [];
  for(var k = 0; k <= n; k++) base.push(bez(pts, t0 + (t1 - t0) * k / n));
  for(var k2 = 0; k2 < n; k2++){
    var a = base[k2], b = base[k2 + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = dy / l, ny = -dx / l, h = haut * (0.65 + ((k2 * 7) % 5) / 10);
    s += (k2 ? ' L ' : '') + pt(a) + ' L ' + pt([b[0] + nx * h + dx * 0.5, b[1] + ny * h + dy * 0.5]);
  }
  s += ' L ' + pt(base[n]);
  dos = dos || [1, 14];
  for(var k3 = n; k3 >= 0; k3--){ var q = base[k3]; s += ' L ' + pt([q[0] + dos[0], q[1] + dos[1]]); }
  return Pw(s + ' Z', couleur, w);
}
/* une patte : quatre doigts fins en éventail, griffes qui accrochent, paume par-dessus */
function patte(fin, avant, col, w, griffe){
  var a = Math.atan2(fin[1] - avant[1], fin[0] - avant[0]), s = '';
  [-0.48, -0.16, 0.16, 0.48].forEach(function(off, i){
    var b = a + off, l = i === 0 || i === 3 ? 6.5 : 8.5, base = [fin[0] + Math.cos(a) * 2, fin[1] + Math.sin(a) * 2], tip = [base[0] + Math.cos(b) * l, base[1] + Math.sin(b) * l];
    s += Pw(tube([base, tip], [4.4, 3.4]), col, w * .8);
    s += L('M' + pt(tip) + ' q ' + n1(Math.cos(b) * 2.6) + ' ' + n1(Math.sin(b) * 2.6 + .8) + ' ' + n1(Math.cos(b) * 3 + .4) + ' ' + n1(Math.sin(b) * 3 + 2.8), griffe, w * .5);
  });
  s += '<ellipse cx="' + n1(fin[0]) + '" cy="' + n1(fin[1]) + '" rx="6.4" ry="5" transform="rotate(' + n1(a * 180 / Math.PI) + ' ' + pt(fin) + ')" fill="' + col + '" stroke="' + O + '" stroke-width="' + n1(w * .8) + '"/>';
  return s;
}
var POSES = {
  debout: {ff: [[-40, 4], [-30, 30], [-46, 50], [-56, 58]], fn: [[-30, 20], [-18, 38], [-32, 52], [-42, 58]], pa: [[40, 42], [26, 56], [-2, 60]], pl: [[66, 46], [72, 58], [54, 60]]},
  bond:   {ff: [[-42, 4], [-50, 34], [-80, 50], [-100, 58]], fn: [[-30, 20], [-40, 42], [-66, 54], [-84, 62]], pa: [[48, 42], [70, 52], [98, 58]], pl: [[70, 44], [92, 50], [112, 52]]},
  grimpe: {ff: [[-42, 2], [-52, 30], [-86, 30], [-106, 22]], fn: [[-30, 20], [-36, 44], [-72, 46], [-92, 40]], pa: [[40, 42], [30, 56], [4, 60]], pl: [[66, 46], [72, 58], [54, 60]]},
  tire:   {ff: [[-40, 4], [-40, 32], [-74, 50], [-92, 58]], fn: [[-30, 20], [-30, 42], [-58, 54], [-74, 60]], pa: [[48, 42], [70, 52], [94, 58]], pl: [[70, 44], [90, 50], [108, 54]]},
  dresse: {ff: [[-42, 2], [-46, 30], [-70, 40], [-84, 34]], fn: [[-30, 20], [-28, 46], [-56, 52], [-70, 46]], pa: [[40, 42], [26, 56], [-2, 60]], pl: [[66, 46], [72, 58], [54, 60]]}
};
var GE = null;
/* un rat complet, dessiné autour de son ventre (0,0), museau vers la gauche */
function rat(d, o){
  var s = o.s, k = 1 / s, wO = (1.7 + 1.1 * s) * k, dk = o.dk || 0, flip = !!o.flip, sd = o.seed || 3;
  var poil = B.sombre(o.poil || '#7a6878', dk), rose = B.sombre(o.rose || '#e49aaa', dk * .9), clairP = B.clair(poil, .45);
  var fH = B.clair(poil, .55), fB = B.sombre(poil, .5), griffe = '#1a1220';
  var g = function(c, f){ return grad(d, c, flip, f); };
  var pw = function(dd, f, w, x){ return Pw(dd, f, w || wO, x); };
  var po = POSES[o.pose || 'debout'], r = '', jaw = o.bouche === 'ouverte' ? -26 : o.bouche === 'grogne' ? -13 : -2;
  var lune = '<g opacity="' + Math.max(0, 1 - dk * 1.3).toFixed(2) + '">';
  /* patte arrière, au loin */
  r += pw(tube(po.pl, [13, 9, 7]), g(B.sombre(rose, .4))) + patte(po.pl[2], po.pl[1], B.sombre(rose, .4), wO * .7, griffe);
  /* patte avant, au loin */
  r += pw(tube(po.ff, [22, 15, 10, 8]), g(B.sombre(poil, .4)));
  r += patte(po.ff[3], po.ff[2], B.sombre(rose, .35), wO * .7, griffe);
  /* oreille du fond */
  r += pw('M-58 -34 C -76 -60 -64 -78 -46 -76 C -32 -72 -32 -52 -40 -36 Z', g(B.sombre(poil, .3))) + F('M-55 -38 C -68 -58 -60 -70 -48 -68 C -40 -64 -40 -50 -44 -40 Z', B.sombre(rose, .45));
  /* le corps, sa crête, son ventre clair */
  var dos = [[-50, -24], [-20, -60], [50, -60], [92, -24]];
  r += crete(dos, .1, .96, o.roi ? 15 : 12, o.roi ? 24 : 13, g(o.roi ? B.sombre(poil, .2) : poil), wO);
  /* touffes de poil qui dépassent sous le ventre et derrière la cuisse */
  r += crete([[84, 40], [44, 62], [-20, 60], [-50, 32]], 0, 1, o.roi ? 16 : 11, o.roi ? 11 : 8, g(B.sombre(poil, .12)), wO, [0, -18]);
  r += crete([[104, -2], [108, 14], [100, 30], [84, 44]], 0, 1, 5, o.roi ? 9 : 6, g(poil), wO, [-14, 0]);
  r += pw('M-46 -28 C -14 -58 52 -56 86 -26 C 110 -4 104 32 74 46 C 34 60 -26 56 -50 34 C -64 18 -62 -12 -46 -28 Z', g(poil));
  r += F('M-44 34 C -20 52 30 56 70 46 C 40 42 -6 40 -44 34 Z', clairP, ' opacity=".45"');
  r += F('M-50 30 C -60 14 -58 -8 -46 -22 C -50 0 -44 18 -26 34 Z', '#120a1e', ' opacity=".3"');
  r += F('M80 -20 C 96 -2 98 26 76 42 C 88 22 88 0 80 -20 Z', '#120a1e', ' opacity=".25"');
  r += poils(26, 2, 68, 42, o.roi ? 170 : 80, sd, 1.5, fH, fB);
  if(o.roi) r += poils(30, 14, 60, 30, 50, sd + 50, 2.2, B.sombre(poil, .55), B.sombre(poil, .6));
  if(o.roi){
    /* poil grisonnant, pelade, vieilles cicatrices */
    r += poils(14, -30, 54, 14, 34, 91, 1.8, '#e6dcea', '#e6dcea');
    r += F('M2 14 C 10 8 24 10 28 18 C 24 26 10 26 2 14 Z', '#b88a94', ' opacity=".55"') + L('M6 16 l 4 -3 M12 18 l 4 -4 M18 19 l 4 -4', '#7a4a56', 1, ' opacity=".6"');
    r += L('M20 -34 L 56 -12 M28 -36 l -5 8 M38 -30 l -5 8 M48 -24 l -5 8', '#e8b8c4', 2, ' opacity=".8"');
  }
  r += lune + L('M-36 -38 C -10 -56 46 -58 82 -32', LUNE, 2.6 * k * .8, ' opacity=".6"') + L('M86 -20 C 100 -4 102 14 98 26', LUNE, 2 * k * .8, ' opacity=".35"') + '</g>';
  /* patte arrière proche : la cuisse et le long pied */
  r += F('M28 4 C 56 -18 98 2 96 34 C 94 54 72 62 50 58 C 34 44 26 24 28 4 Z', g(B.clair(poil, .06))) + L('M30 6 C 58 -14 96 4 96 34 C 96 50 82 60 62 60', O, wO);
  r += poils(62, 28, 24, 20, 16, sd + 7, 1.4, fH, fB);
  r += lune + L('M42 -4 C 64 -12 86 -2 92 16', LUNE, 2 * k * .8, ' opacity=".45"') + '</g>';
  r += pw(tube(po.pa, [15, 10, 8]), g(rose)) + patte(po.pa[2], po.pa[1], g(rose), wO * .7, griffe);
  /* collerette hérissée du roi */
  if(o.roi) r += poils(-8, -10, 18, 34, 34, 57, 1.6, '#ece2f0', B.sombre(poil, .55));
  /* la tête */
  var gonds = [-60, 16], avJ = rotP([-132, 18], gonds, jaw);
  r += F('M-56 10 L -136 8 L ' + pt(avJ) + ' L -52 26 Z', '#3a0e1c');
  /* mâchoire du bas (tourne autour de la charnière) */
  var mj = '<g transform="rotate(' + jaw + ' ' + gonds[0] + ' ' + gonds[1] + ')">';
  mj += pw('M-50 12 C -80 20 -112 20 -134 17 C -132 28 -110 35 -86 35 C -66 35 -52 28 -50 12 Z', g(B.sombre(poil, .1)));
  if(o.bouche !== 'fermee'){
    mj += F('M-60 18 C -84 22 -108 22 -124 20 C -108 26 -84 27 -62 24 Z', '#c85a72', ' opacity=".9"');
    mj += pw('M-129 17 L -122 17 L -123 3 L -129 5 Z', '#f3e3a0', wO * .7) + pw('M-120 18 L -114 18 L -116 7 Z', '#e4d08a', wO * .6);
  }
  mj += L('M-130 26 C -112 32 -86 34 -64 30', B.clair(poil, .4), 1.4 * k * .8, ' opacity=".45"');
  mj += poils(-90, 28, 26, 4, 8, sd + 31, 1.2, fB, fB);
  r += mj + '</g>';
  /* bave */
  if(o.bouche === 'ouverte'){ var bv = rotP([-100, 30], gonds, jaw); r += pw('M' + pt(bv) + ' c 2 8 -2 14 1 22 c 4 -5 4 -14 2 -22 Z', '#d8f0ff', wO * .5, ' opacity=".85"'); }
  r += pw('M-24 -34 C -48 -46 -84 -40 -106 -26 C -122 -16 -134 -6 -142 0 C -149 6 -147 13 -139 14 C -116 17 -86 19 -62 18 C -38 18 -18 8 -18 -8 C -18 -20 -20 -28 -24 -34 Z', g(poil));
  r += F('M-20 4 L -8 10 L -16 16 L -4 24 L -20 24 L -14 34 L -32 26 Z', g(poil));
  r += poils(-64, -12, 34, 16, o.roi ? 52 : 28, sd + 13, 1.4, fH, fB);
  r += F('M-138 2 C -116 -10 -90 -24 -64 -32 C -84 -20 -108 -6 -126 6 Z', B.clair(poil, .5), ' opacity=".3"');
  r += F('M-136 12 C -110 14 -84 16 -62 16 C -60 10 -66 6 -74 8 C -96 10 -118 10 -136 12 Z', '#120a1e', ' opacity=".25"');
  r += lune + L('M-102 -28 C -80 -42 -50 -46 -28 -36', LUNE, 2.2 * k * .8, ' opacity=".55"') + '</g>';
  /* dents du haut */
  if(o.bouche !== 'fermee'){
    r += pw('M-138 13 L -130 14 L -128 31 L -136 28 Z', '#f3e3a0', wO * .7) + pw('M-129 14 L -122 15 L -121 27 L -127 25 Z', '#e4d08a', wO * .7);
    r += L('M-136 16 L -134 26', '#fffbe0', 1 * k * .8, ' opacity=".8"');
  } else {
    r += pw('M-138 13 L -130 14 L -129 24 L -136 22 Z', '#f3e3a0', wO * .7) + L('M-128 17 C -110 20 -86 22 -64 20', O, wO * .7);
  }
  /* museau, moustaches */
  r += '<ellipse cx="-143" cy="5" rx="7.5" ry="6.5" fill="' + g(rose) + '" stroke="' + O + '" stroke-width="' + n1(wO) + '"/>' + C(-147, 7, 1.8, '#4a1222') + C(-141, 2, 2, '#fff', ' opacity=".75"');
  r += [[-126, 6], [-120, 10], [-114, 6], [-122, 2]].map(function(p){ return C(p[0], p[1], 1.3, '#2a1a26'); }).join('');
  r += L('M-122 4 C -146 -6 -166 -12 -190 -12 M-120 8 C -146 6 -168 10 -192 16 M-118 10 C -138 18 -154 28 -170 40 M-114 2 C -126 -16 -138 -26 -154 -34', B.sombre('#e8e0ec', dk * .6), 1.1 * k * .9, ' opacity=".85"');
  /* l'œil rouge qui brille, le sourcil furieux */
  r += '<circle cx="-84" cy="-12" r="' + (o.roi ? 30 : 24) + '" fill="' + d.halo('#ffb0a0', '#ff2a2a') + '" opacity="' + (o.roi ? .85 : .75) + '"/>';
  r += pw('M-98 -10 C -92 -22 -74 -24 -68 -16 C -72 -6 -88 -2 -98 -10 Z', 'url(#' + GE + ')', wO * .85) + F('M-83 -22 C -81 -18 -81 -8 -83 -4 C -85 -8 -85 -18 -83 -22 Z', '#2a0408') + C(-89, -15, 2.6, '#fff') + C(-75, -10, 1.2, '#fff', ' opacity=".7"');
  r += pw('M-104 -18 C -90 -32 -70 -32 -58 -24 L -62 -18 C -74 -22 -90 -20 -100 -12 Z', g(B.sombre(poil, .5)));
  if(o.roi) r += L('M-100 -42 L -72 4', '#e8b8c4', 2.4 * k, ' opacity=".85"') + L('M-95 -34 l 7 -2 M-89 -24 l 7 -2 M-82 -13 l 7 -2', '#e8b8c4', 1.4 * k, ' opacity=".75"');
  /* la grande oreille : peau fine, veines, bord parfois déchiré */
  var oreille = o.roi ? 'M-44 -34 C -60 -62 -46 -88 -22 -88 C -2 -86 4 -70 -2 -56 L -10 -58 L -8 -48 C -12 -42 -16 -38 -22 -34 Z' : 'M-44 -34 C -60 -62 -46 -88 -22 -88 C 0 -86 6 -60 -12 -38 Z';
  r += pw(oreille, g(poil));
  r += F('M-38 -38 C -50 -60 -40 -78 -24 -78 C -10 -76 -6 -60 -18 -42 Z', d.halo(B.sombre('#ffc8d2', dk), B.sombre('#d47a8e', dk)));
  r += L('M-30 -42 C -28 -54 -26 -64 -22 -72 M-26 -58 C -22 -60 -16 -60 -12 -58', B.sombre('#b8546a', dk), 1.2 * k * .8, ' opacity=".7"');
  r += lune + L('M-40 -66 C -32 -84 -12 -88 -4 -74', LUNE, 2.2 * k * .8, ' opacity=".6"') + '</g>';
  /* patte avant proche, devant le poitrail */
  r += pw(tube(po.fn, o.roi ? [27, 20, 13, 9] : [22, 16, 11, 8]), g(poil)) + poils(po.fn[1][0] - 2, po.fn[1][1] - 6, 7, 12, o.roi ? 14 : 8, sd + 21, 1.3, fH, fB);
  r += F('M' + pt([po.fn[1][0] + 5, po.fn[1][1] - 2]) + ' l 8 4 l -6 3 l 7 5 l -9 0 Z', g(poil));
  r += lune + L('M' + pt([po.fn[0][0] + 6, po.fn[0][1] - 8]) + ' Q ' + pt([po.fn[1][0] + 10, po.fn[1][1] - 6]) + ' ' + pt([po.fn[1][0] + 7, po.fn[1][1] + 4]), LUNE, 1.8 * k * .8, ' opacity=".45"') + '</g>';
  r += patte(po.fn[3], po.fn[2], g(rose), wO * .7, griffe);
  if(o.extra) r += o.extra(k);
  var tr = 'translate(' + n1(o.x) + ' ' + n1(o.y) + ') rotate(' + o.rot + ') scale(' + (flip ? -s : s) + ' ' + s + ')';
  return {svg: '<g transform="' + tr + '">' + r + '</g>', croupe: glob(o, [92, 14])};
}
/* la couronne de bric et de broc : cuillère tordue, capsule, os, clou, éclat de verre, bout de chaîne */
function couronne(d){
  return function(k){
    var w = 2.4 * k, s = '<g transform="rotate(-8 -66 -52)">';
    /* l'arrière de l'anneau, qu'on devine derrière */
    s += Pw('M-96 -50 C -84 -60 -56 -64 -38 -58 L -38 -52 C -58 -56 -82 -54 -94 -46 Z', grad(d, '#6a5428'), w * .8);
    /* clou tordu */
    s += Pw('M-92 -52 L -98 -76 C -99 -82 -94 -86 -90 -90 L -87 -87 C -91 -82 -93 -78 -91 -74 L -87 -53 Z', grad(d, '#8a8e9c'), w) + Pw('M-94 -94 L -84 -88 L -88 -84 L -97 -90 Z', grad(d, '#9aa0ae'), w * .8) + L('M-95 -74 L -91 -56', '#e6ecf6', 1 * k, ' opacity=".6"');
    /* capsule de bouteille, bord cranté */
    var cap = '', cx = -78, cy = -82;
    for(var i = 0; i < 20; i++){ var a = i / 20 * Math.PI * 2, rr = i % 2 ? 9.5 : 12; cap += (i ? ' L ' : 'M') + n1(cx + Math.cos(a) * rr) + ' ' + n1(cy + Math.sin(a) * rr); }
    s += L('M-78 -70 L -77 -56', '#6a6e7c', 2.4 * k);
    s += Pw(cap + ' Z', grad(d, '#d84a3a'), w) + C(cx, cy, 6.5, 'none', ' stroke="#7a1a1a" stroke-width="' + n1(1.2 * k) + '"') + F('M-82 -86 l 4 -4 l 1 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 Z', '#ffe0a0', ' opacity=".85"') + L('M-72 -90 C -68 -86 -67 -80 -68 -76', '#ffe8d8', 1.4 * k, ' opacity=".7"');
    /* la cuillère tordue, la plus haute */
    s += Pw('M-64 -60 C -68 -72 -58 -80 -62 -92 C -65 -100 -58 -106 -56 -112 L -52 -111 C -53 -104 -59 -100 -57 -92 C -53 -80 -62 -72 -59 -60 Z', grad(d, '#b8c0cc'), w);
    s += Pw('M-55 -110 C -64 -116 -66 -130 -58 -138 C -50 -144 -40 -138 -42 -126 C -44 -116 -48 -110 -55 -110 Z', grad(d, '#c8d0dc'), w);
    s += F('M-52 -116 C -58 -120 -58 -130 -53 -134 C -48 -136 -45 -130 -47 -124 Z', '#5a6070', ' opacity=".5"') + L('M-48 -136 C -43 -134 -42 -128 -44 -122', '#ffffff', 1.6 * k, ' opacity=".85"');
    /* l'os */
    s += Pw('M-48 -60 L -42 -90 C -46 -92 -46 -98 -42 -99 C -39 -100 -37 -97 -36 -95 C -34 -98 -30 -98 -29 -95 C -28 -92 -31 -89 -34 -88 L -40 -58 Z', grad(d, '#eadfc4'), w) + L('M-38 -90 L -42 -66', '#fff8e6', 1.4 * k, ' opacity=".7"');
    /* le bandeau de fer-blanc cabossé, rivets, rouille */
    s += Pw('M-100 -44 C -86 -56 -62 -60 -36 -56 C -33 -52 -33 -46 -35 -42 C -58 -46 -82 -42 -98 -32 C -102 -36 -103 -40 -100 -44 Z', grad(d, '#c8a24e'), w);
    s += F('M-92 -42 C -88 -44 -84 -42 -82 -46 C -78 -44 -76 -48 -72 -48 L -74 -44 C -80 -42 -86 -38 -92 -36 Z', '#7a3e1a', ' opacity=".55"') + F('M-48 -54 C -44 -52 -40 -54 -37 -52 L -37 -46 C -40 -48 -44 -47 -48 -50 Z', '#7a3e1a', ' opacity=".5"');
    s += L('M-97 -44 C -84 -54 -60 -58 -38 -55', '#fff0c0', 1.4 * k, ' opacity=".75"') + L('M-70 -58 L -71 -45 M-52 -58 L -53 -45', '#5a4418', 1 * k, ' opacity=".5"');
    s += [[-92, -40], [-84, -45], [-46, -51], [-40, -50]].map(function(p){ return C(p[0], p[1], 1.6, '#5a4418') + C(p[0] + .5, p[1] - .5, .7, '#fff0c0'); }).join('');
    /* l'éclat de verre vert, comme une pierre précieuse */
    s += '<circle cx="-62" cy="-50" r="10" fill="' + d.halo('#e6ffd0', '#6aff8a') + '" opacity=".75"/>' + Pw('M-68 -45 L -64 -57 L -56 -53 L -57 -45 Z', '#7ad89a', w * .7) + F('M-64 -55 L -59 -53 L -61 -49 Z', '#f0fff0', ' opacity=".85"');
    /* bout de chaîne qui pend */
    var ch = '<ellipse cx="-34" cy="-40" rx="3.4" ry="6" transform="rotate(10 -34 -40)"/><path d="M-33 -32 L -32 -22"/><ellipse cx="-31" cy="-16" rx="3.4" ry="6" transform="rotate(-6 -31 -16)"/><path d="M-31 -8 L -30 2"/><ellipse cx="-30" cy="7" rx="3" ry="5.4" transform="rotate(8 -30 7)"/>';
    s += '<g fill="none" stroke="' + O + '" stroke-width="' + n1(4.6 * k) + '">' + ch + '</g><g fill="none" stroke="#a4aab8" stroke-width="' + n1(2 * k) + '">' + ch + '</g>';
    return s + '</g>';
  };
}
/* ---------- les queues et le nœud : des brins qui s'entrecroisent dessus-dessous ---------- */
function echant(segs, pas){   /* points le long d'une suite de courbes de Bézier */
  var P = [];
  segs.forEach(function(sg, i){ var n = 30; for(var j = i ? 1 : 0; j <= n; j++) P.push(bez(sg, j / n)); });
  var Q = [P[0]], acc = 0;
  for(var i = 1; i < P.length; i++){ var dx = P[i][0] - Q[Q.length - 1][0], dy = P[i][1] - Q[Q.length - 1][1]; if(Math.sqrt(dx * dx + dy * dy) >= pas || i === P.length - 1) Q.push(P[i]); }
  return Q;
}
function croise(a, b, c, e){
  var r = [b[0] - a[0], b[1] - a[1]], q = [e[0] - c[0], e[1] - c[1]], den = r[0] * q[1] - r[1] * q[0];
  if(Math.abs(den) < 1e-9) return null;
  var t = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return (t >= 0 && t < 1 && u >= 0 && u < 1) ? [t, u] : null;
}
function morceau(P, i0, i1){ var o = []; for(var i = Math.max(0, i0); i <= Math.min(P.length - 1, i1); i++) o.push(P[i]); return o; }
function chemin(P){ return 'M' + pt(P[0]) + crs(P); }
function ligne(P){ return 'M' + P.map(pt).join(' L '); }
function dessineBrin(b, P, bout){
  var d = bout ? ligne(P) : chemin(P), w = b.w, s = '';
  s += '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="' + n1(w + 4.4) + '" stroke-linejoin="round" stroke-linecap="' + (bout ? 'butt' : 'round') + '"/>';
  s += '<path d="' + d + '" fill="none" stroke="' + b.col + '" stroke-width="' + n1(w) + '" stroke-linejoin="round" stroke-linecap="' + (bout ? 'butt' : 'round') + '"/>';
  s += '<path d="' + d + '" fill="none" stroke="' + B.sombre(b.col, .4) + '" stroke-width="' + n1(w * .42) + '" stroke-linecap="butt" transform="translate(' + n1(-w * .2) + ' ' + n1(w * .22) + ')" opacity=".5"/>';
  /* anneaux de la queue */
  var cc = cote(P, P.map(function(){ return w * .82; })), an = '';
  for(var i = 1; i < P.length - 1; i += 1) an += 'M' + pt(cc.G[i]) + ' Q ' + pt([P[i][0] + (P[i + 1][0] - P[i - 1][0]) * .12, P[i][1] + (P[i + 1][1] - P[i - 1][1]) * .12]) + ' ' + pt(cc.D[i]) + ' ';
  s += '<path d="' + an + '" fill="none" stroke="' + B.sombre(b.col, .4) + '" stroke-width=".9" opacity=".32"/>';
  s += '<path d="' + d + '" fill="none" stroke="' + B.clair(b.col, .62) + '" stroke-width="' + n1(Math.max(1.1, w * .2)) + '" stroke-linecap="butt" transform="translate(' + n1(w * .15) + ' ' + n1(-w * .2) + ')" opacity=".5"/>';
  return s;
}
function tisser(brins, K, rayon){
  var X = [];
  brins.forEach(function(b){ b.X = []; });
  for(var A = 0; A < brins.length; A++) for(var Bb = A; Bb < brins.length; Bb++){
    var P = brins[A].P, Q = brins[Bb].P;
    for(var i = 0; i < P.length - 1; i++) for(var j = (A === Bb ? i + 3 : 0); j < Q.length - 1; j++){
      var r = croise(P[i], P[i + 1], Q[j], Q[j + 1]);
      if(r){
        var cx = P[i][0] + (P[i + 1][0] - P[i][0]) * r[0], cy = P[i][1] + (P[i + 1][1] - P[i][1]) * r[0];
        if((cx - K[0]) * (cx - K[0]) + (cy - K[1]) * (cy - K[1]) > rayon * rayon) continue;
        var x = {a: A, ia: i + r[0], b: Bb, ib: j + r[1], dessus: null}; X.push(x); brins[A].X.push({x: x, s: x.ia}); brins[Bb].X.push({x: x, s: x.ib});
      }
    }
  }
  brins.forEach(function(b, n){
    b.X.sort(function(p, q){ return p.s - q.s; });
    var tour = true;
    b.X.forEach(function(c){
      var moi = c.x.a === n && c.s === c.x.ia ? 'a' : 'b';
      if(c.x.dessus === null) c.x.dessus = tour ? moi : (moi === 'a' ? 'b' : 'a');
      tour = c.x.dessus !== moi;
    });
  });
  var s = '';
  brins.forEach(function(b){ s += dessineBrin(b, b.P, false); });
  X.forEach(function(x){
    var n = x.dessus === 'a' ? x.a : x.b, si = x.dessus === 'a' ? x.ia : x.ib, b = brins[n];
    s += dessineBrin(b, morceau(b.P, Math.floor(si) - 3, Math.ceil(si) + 3), true);
  });
  return s;
}
function dessin(){
  var d = new B.Dessin(), s = '';
  GE = gid('ge');
  d.defs.push('<radialGradient id="' + GE + '" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#fff2a0"/><stop offset=".45" stop-color="#ff4a2a"/><stop offset="1" stop-color="#7a0a14"/></radialGradient>');
  var K = [292, 334];
  /* ombre au sol, os de l'ossuaire */
  s += '<ellipse cx="282" cy="394" rx="256" ry="19" fill="#000" opacity=".55"/>';
  s += Pw('M470 392 L 520 384 C 522 378 530 378 532 383 C 536 382 540 388 535 391 C 538 394 534 400 529 397 C 527 402 520 400 520 395 L 472 402 C 470 407 462 406 462 401 C 457 401 455 394 460 392 C 458 386 466 384 470 392 Z', grad(d, '#d8ccb0'), 2.4);
  s += Pw('M14 398 L 50 392 C 52 387 58 388 58 392 C 62 392 63 398 58 399 C 59 403 53 405 51 401 L 16 405 C 14 410 7 408 8 403 C 3 402 4 396 9 396 C 9 391 15 392 14 398 Z', grad(d, '#cfc2a4'), 2.4);
  /* le tas : des dos de rats tassés dans l'ombre */
  var tas = 'M120 392 C 110 360 130 330 160 322 C 168 296 196 280 222 288 C 236 262 270 256 296 266 C 316 248 350 250 368 268 C 392 258 422 270 428 296 C 452 300 470 322 466 350 C 486 362 488 384 476 392 Z';
  s += Pw(tas, grad(d, '#2e2436', .8), 3);
  s += poils(300, 330, 170, 56, 130, 5, 1.6, '#55465e', '#0e0814');
  s += L('M164 322 C 176 300 200 288 222 290 M226 286 C 244 264 272 260 294 268 M300 264 C 322 250 350 254 366 270 M372 268 C 396 262 420 276 426 296', LUNE, 1.8, ' opacity=".22"');
  /* tous les rats (position, taille, attitude) */
  var roi = {x: 300, y: 184, s: 1.22, rot: 14, pose: 'debout', bouche: 'grogne', poil: '#5a4c64', seed: 3, roi: true};
  roi.extra = couronne(d);
  var rats = {
    r9: {x: 210, y: 262, s: .46, rot: 20, pose: 'dresse', bouche: 'ouverte', poil: '#6a5a6a', dk: .5, seed: 9},
    r10: {x: 414, y: 278, s: .44, rot: 10, flip: true, pose: 'tire', bouche: 'grogne', poil: '#665a5e', dk: .5, seed: 10},
    r6: {x: 462, y: 196, s: .5, rot: -32, flip: true, pose: 'grimpe', bouche: 'grogne', poil: '#7a6a72', dk: .1, seed: 6},
    r8: {x: 404, y: 140, s: .44, rot: 24, pose: 'grimpe', bouche: 'ouverte', poil: '#8a7466', seed: 8},
    r5: {x: 150, y: 270, s: .5, rot: 28, pose: 'dresse', bouche: 'ouverte', poil: '#6e5a52', seed: 17},
    r1: {x: 126, y: 344, s: .64, rot: -4, pose: 'bond', bouche: 'ouverte', poil: '#7a6878', seed: 11},
    r2: {x: 218, y: 374, s: .4, rot: -2, pose: 'debout', bouche: 'ouverte', poil: '#8a7a6a', seed: 2},
    r3: {x: 440, y: 342, s: .62, rot: 6, flip: true, pose: 'tire', bouche: 'ouverte', poil: '#6a6a7a', seed: 4}
  };
  var dr = {};
  for(var id in rats) dr[id] = rat(d, rats[id]);
  dr.roi = rat(d, roi);
  /* chaque queue : de la croupe jusqu'au bord du nœud, puis elle s'enroule dedans */
  function q(id, c1, c2, ang, w, col, tour){
    var a = ang * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], v = [-u[1] * tour, u[0] * tour];
    var rim = [K[0] + u[0] * 46, K[1] + u[1] * 34];
    var p1 = [K[0] + u[0] * 8 + v[0] * 30, K[1] + u[1] * 8 + v[1] * 23], p2 = [K[0] - u[0] * 28 + v[0] * 12, K[1] - u[1] * 21 + v[1] * 9], p3 = [K[0] - u[0] * 34 - v[0] * 16, K[1] - u[1] * 25 - v[1] * 13];
    return {P: echant([[dr[id].croupe, c1, c2, rim], [rim, p1, p2, p3]], 4), w: w, col: col};
  }
  var brins = [
    q('roi', [470, 260], [380, 320], -30, 11, '#e49aaa', 1),
    q('r6', [400, 290], [360, 290], -60, 6.5, '#e09aa6', -1),
    q('r8', [460, 230], [400, 270], -45, 6, '#e8a4b0', 1),
    q('r10', [380, 300], [356, 316], -10, 6, '#b87884', -1),
    q('r3', [380, 350], [350, 344], 8, 8, '#e49aaa', 1),
    q('r9', [250, 300], [252, 316], -140, 6, '#b87884', 1),
    q('r5', [230, 316], [236, 326], -165, 7, '#dc94a2', -1),
    q('r1', [210, 362], [230, 350], 170, 8, '#e49aaa', 1),
    q('r2', [262, 384], [262, 372], 140, 6, '#eaa6b2', -1)
  ];
  /* deux boucles serrées au cœur du nœud */
  [[0, 36, 28], [70, 30, 24]].forEach(function(bq, i){
    var P = [], ang = bq[0] * Math.PI / 180;
    for(var t = 0; t <= 60; t++){ var u = t / 60 * Math.PI * 2, ex = Math.sin(3 * u + .4) * bq[1], ey = Math.sin(2 * u) * bq[2]; P.push([K[0] + ex * Math.cos(ang) - ey * Math.sin(ang), K[1] + 2 + ex * Math.sin(ang) + ey * Math.cos(ang)]); }
    brins.push({P: P, w: 7.5, col: i ? '#dc94a2' : '#e8a0ae'});
  });
  /* lueur pâle sous le nœud (pour qu'on le voie bien), puis les brins */
  s += '<ellipse cx="' + K[0] + '" cy="' + (K[1] + 4) + '" rx="78" ry="58" fill="' + d.halo('#ffd8e0', '#ff8aa8') + '" opacity=".3"/>';
  s += '<ellipse cx="' + K[0] + '" cy="' + (K[1] + 42) + '" rx="56" ry="10" fill="#000" opacity=".45"/>';
  s += tisser(brins, K, 80);
  s += '<ellipse cx="' + (K[0] - 14) + '" cy="' + (K[1] + 20) + '" rx="46" ry="26" fill="' + d.halo('#1a0a20', '#1a0a20') + '" opacity=".45"/>';
  s += L('M' + (K[0] - 34) + ' ' + (K[1] - 22) + ' C ' + (K[0] - 12) + ' ' + (K[1] - 40) + ' ' + (K[0] + 20) + ' ' + (K[1] - 38) + ' ' + (K[0] + 40) + ' ' + (K[1] - 20), LUNE, 2.2, ' opacity=".45"');
  /* des yeux qui brillent dans les trous du tas */
  [[282, 280, .85], [334, 286, .95], [210, 338, .75]].forEach(function(e){
    s += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="15" fill="' + d.halo('#ff9a8a', '#ff2a2a') + '" opacity=".55"/>';
    s += '<path d="M' + (e[0] - 11) + ' ' + (e[1] - 1) + ' q 4 -4 8 0 q -4 3 -8 0 Z M' + (e[0] + 3) + ' ' + (e[1] + 1) + ' q 4 -4 8 0 q -4 3 -8 0 Z" fill="#ff6a3a" stroke="#ffe0b0" stroke-width=".7" opacity="' + e[2] + '"/>';
  });
  /* les rats, du fond vers le devant */
  var fl = d.flou(7);
  function ombre(o){ var c = glob(o, [20, 44]); return '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="' + n1(110 * o.s) + '" ry="' + n1(34 * o.s) + '" transform="rotate(' + (o.flip ? -o.rot : o.rot) + ' ' + pt(c) + ')" fill="#05030a" opacity=".55" filter="' + fl + '"/>'; }
  ['r9', 'r10', 'r6', 'roi', 'r8', 'r5', 'r1', 'r2', 'r3'].forEach(function(id){ var o = id === 'roi' ? roi : rats[id]; if(['roi', 'r5', 'r1', 'r2', 'r3'].indexOf(id) >= 0) s += ombre(o); s += dr[id].svg; });
  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.roirats = {nom:'Le Roi des rats', rang:'elite', pv:220, lieu:'L\'ossuaire',
  livre:'« Dix rats, une seule queue. Qu\'ils paniquent d\'abord… »',
  combo:['+💨🥄 S\'ouvre : le nuage, puis le bruit', ' Sans potion : le bruit juste après leur attaque', '!✨ Piège : la lumière'], dessin:dessin};
})();
