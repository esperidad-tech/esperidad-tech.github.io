/* ==========================================================
   Brumeval — la grande carte (maquette du 12 novembre) : la brume
   Huit bancs de brume autour du village (un par zone), qu'on lève un par un, et le mur de brume du bord de la vallée, qui ne se lève jamais.
   Pas de flou (trop lourd pour une vieille tablette) : des ronds en dégradé, et on n'anime que la place et l'opacité.
   ========================================================== */
'use strict';
var O = require('./outils');
var f = O.f, W = O.W, H = O.H;

/* Les zones : x0, y0, x1, y1 (le village, au milieu, n'a jamais de brume) */
var ZONES = [
  {id:'no', nom:'Le Bois Sombre',        r:[0, 0, 1000, 768]},
  {id:'n',  nom:'Le Nord',               r:[1000, 0, 2040, 318]},
  {id:'ne', nom:'Le lac et le manoir',   r:[2040, 0, 3000, 776]},
  {id:'o',  nom:'Les collines de l\'Ouest', r:[0, 768, 1000, 1480]},
  {id:'e',  nom:'L\'autre rive',         r:[2040, 776, 3000, 1420]},
  {id:'so', nom:'Le Sud-Ouest',          r:[0, 1480, 1000, 2000]},
  {id:'s',  nom:'La route du Sud',       r:[1000, 1724, 2040, 2000]},
  {id:'se', nom:'Le marais',             r:[2040, 1420, 3000, 2000]}
];

function defs(p){
  function st(o, c, a){ return '<stop offset="' + o + '" stop-color="' + c + '" stop-opacity="' + a + '"/>'; }
  var s = '';
  s += '<radialGradient id="' + p + 'bm" cx="50%" cy="50%" r="50%">' + st(0, '#e6ecf8', 1) + st(.55, '#e6ecf8', .96) + st(.8, '#e9eefa', .55) + st(1, '#eef2ff', 0) + '</radialGradient>';
  s += '<radialGradient id="' + p + 'bmC" cx="42%" cy="38%" r="55%">' + st(0, '#ffffff', .95) + st(.5, '#ffffff', .5) + st(1, '#ffffff', 0) + '</radialGradient>';
  s += '<radialGradient id="' + p + 'bmO" cx="50%" cy="50%" r="50%">' + st(0, '#b4bfdc', .32) + st(1, '#aab6d6', 0) + '</radialGradient>';
  s += '<radialGradient id="' + p + 'bmV" cx="50%" cy="50%" r="50%">' + st(0, '#ffffff', .7) + st(.6, '#ffffff', .28) + st(1, '#ffffff', 0) + '</radialGradient>';
  ['h', 'b', 'g', 'd'].forEach(function(c){
    var v = c === 'h' || c === 'b';
    s += '<linearGradient id="' + p + 'mur-' + c + '" x1="' + (c === 'd' ? 1 : 0) + '" y1="' + (c === 'b' ? 1 : 0) + '" x2="' + (c === 'g' ? 1 : 0) + '" y2="' + (c === 'h' ? 1 : 0) + '">' + st(0, '#eef2ff', 1) + st(.45, '#eef2ff', .96) + st(1, '#eef2ff', 0) + '</linearGradient>';
  });
  return s;
}

function rond(p, x, y, r, id, extra){ return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="url(#' + p + id + ')"' + (extra || '') + '/>'; }

/* Le village : jamais de brume ici */
var VILLAGE = [1000, 318, 2040, 1724];
function touche(x, y){ return x > VILLAGE[0] - 3 && x < VILLAGE[2] + 3 && y > VILLAGE[1] - 3 && y < VILLAGE[3] + 3; }

/* Un banc de brume : un cœur plein, des ronds doux tout autour (le bord), des bosses claires et des creux d'ombre (le relief), quelques voiles qui dérivent.
   Du côté du village, le bord est bien rentré dans la zone : la brume ne mord pas sur le village.
   Du côté d'une autre zone, il va jusqu'à la limite : deux bancs voisins se recouvrent sans laisser de fente, et quand l'un se lève l'autre garde un bord doux. */
function zone(p, z, i){
  var r = O.rng(500 + i * 37), x0 = z.r[0], y0 = z.r[1], x1 = z.r[2], y1 = z.r[3], s = '';
  var R = 100, VERS_V = 88, VERS_Z = 58;   /* rayon des ronds du bord ; de combien leur centre est rentré, côté village et côté zone voisine */
  var cotes = [   /* a → b, la direction du dehors, et si ce côté est au bord du monde */
    {a:[x0, y0], b:[x1, y0], n:[0, -1], monde: y0 <= 0},
    {a:[x0, y1], b:[x1, y1], n:[0, 1], monde: y1 >= H},
    {a:[x0, y0], b:[x0, y1], n:[-1, 0], monde: x0 <= 0},
    {a:[x1, y0], b:[x1, y1], n:[1, 0], monde: x1 >= W}
  ];
  cotes.forEach(function(c){   /* un côté qui longe le village, même en partie, rentre davantage */
    c.village = false;
    for(var t = 0; t <= 1.001; t += .05) if(touche(c.a[0] + (c.b[0] - c.a[0]) * t + c.n[0] * 8, c.a[1] + (c.b[1] - c.a[1]) * t + c.n[1] * 8)) c.village = true;
    c.rentre = c.monde ? -24 : (c.village ? VERS_V : VERS_Z) + 44;
  });
  var cx0 = x0 + cotes[2].rentre, cx1 = x1 - cotes[3].rentre, cy0 = y0 + cotes[0].rentre, cy1 = y1 - cotes[1].rentre;
  s += '<rect x="' + cx0 + '" y="' + cy0 + '" width="' + (cx1 - cx0) + '" height="' + (cy1 - cy0) + '" rx="50" fill="#e6ecf8"/>';
  /* le bord : un rang de ronds le long de chaque côté ; aux deux bouts, le rang s'arrête avant le côté voisin (pour ne pas déborder sur le village par le coin) */
  function recul(c, bout){   /* de combien le rang s'arrête avant ce bout du côté */
    var pt = bout ? c.b : c.a, horizontal = c.n[0] === 0;
    var voisin = horizontal ? (bout ? cotes[3] : cotes[2]) : (bout ? cotes[1] : cotes[0]);
    if(voisin.monde) return -20;
    return touche(pt[0] + voisin.n[0] * 8 - c.n[0] * 30, pt[1] + voisin.n[1] * 8 - c.n[1] * 30) ? VERS_V : VERS_Z;
  }
  cotes.forEach(function(c){
    if(c.monde) return;
    var l = Math.hypot(c.b[0] - c.a[0], c.b[1] - c.a[1]), ux = (c.b[0] - c.a[0]) / l, uy = (c.b[1] - c.a[1]) / l;
    var d0 = recul(c, 0), d1 = l - recul(c, 1), n = Math.max(2, Math.round((d1 - d0) / 56));
    for(var k = 0; k <= n; k++){
      var u = d0 + (d1 - d0) * k / n, x = c.a[0] + ux * u, y = c.a[1] + uy * u;
      var v = touche(x + c.n[0] * 8, y + c.n[1] * 8), d = v ? VERS_V : VERS_Z;
      s += rond(p, x - c.n[0] * d + (r() - .5) * 18, y - c.n[1] * d + (r() - .5) * 18, R * (.92 + r() * .22), 'bm');
      if(!v && c.village) s += rond(p, x - c.n[0] * (d + 62) + (r() - .5) * 18, y - c.n[1] * (d + 62) + (r() - .5) * 18, R * (.92 + r() * .22), 'bm');   /* là où le cœur est plus loin : un deuxième rang */
    }
  });
  /* le relief : des creux d'ombre, puis des bosses claires */
  var aire = (x1 - x0) * (y1 - y0), n = Math.round(aire / 26000);
  for(var a = 0; a < n; a++){ var ox = cx0 + 30 + r() * (cx1 - cx0 - 60), oy = cy0 + 30 + r() * (cy1 - cy0 - 60); s += rond(p, ox + 22, oy + 30, 60 + r() * 60, 'bmO'); }
  for(var b = 0; b < n * 1.5; b++){ var bx = cx0 + 10 + r() * (cx1 - cx0 - 20), bby = cy0 + 10 + r() * (cy1 - cy0 - 20); s += rond(p, bx, bby, 62 + r() * 78, 'bmC'); }
  /* les voiles qui dérivent */
  for(var v = 0; v < 3; v++){
    /* ils restent dans le cœur du banc (ils glissent de 70 de chaque côté) : jamais un voile sur une étiquette du village ou d'une zone levée */
    var vrx = Math.min(190 + r() * 110, (cx1 - cx0) / 2 - 80), vry = 50 + r() * 28;
    var vx = cx0 + vrx + 70 + r() * Math.max(0, cx1 - cx0 - 2 * vrx - 140), vy = cy0 + vry + r() * Math.max(0, cy1 - cy0 - 2 * vry);
    s += '<ellipse class="ca-brume ca-brume' + (v % 2) + '" cx="' + f(vx) + '" cy="' + f(vy) + '" rx="' + f(vrx) + '" ry="' + f(vry) + '" fill="url(#' + p + 'bmV)" style="animation-delay:-' + (v * 9 + i * 3) + 's"/>';
  }
  return '<g class="bm-zone" data-zone="' + z.id + '" style="transform-origin:' + f((x0 + x1) / 2) + 'px ' + f((y0 + y1) / 2) + 'px">' + s +
    '<rect class="bm-hit" x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" fill="#fff" fill-opacity="0"/></g>';
}

/* Le mur de brume : le bord de la vallée. Il ne se lève jamais. */
function mur(p){
  var E = 112, r = O.rng(77), s = '<g class="bm-mur" pointer-events="none">';
  s += '<rect x="0" y="0" width="' + W + '" height="' + E + '" fill="url(#' + p + 'mur-h)"/>';
  s += '<rect x="0" y="' + (H - E) + '" width="' + W + '" height="' + E + '" fill="url(#' + p + 'mur-b)"/>';
  s += '<rect x="0" y="0" width="' + E + '" height="' + H + '" fill="url(#' + p + 'mur-g)"/>';
  s += '<rect x="' + (W - E) + '" y="0" width="' + E + '" height="' + H + '" fill="url(#' + p + 'mur-d)"/>';
  for(var x = 0; x <= W; x += 84){ s += rond(p, x + (r() - .5) * 34, 2 + r() * 18, 58 + r() * 34, 'bm') + rond(p, x + (r() - .5) * 34, H - 2 - r() * 18, 58 + r() * 34, 'bm'); }
  for(var y = 60; y <= H - 60; y += 84){ s += rond(p, 2 + r() * 18, y + (r() - .5) * 34, 58 + r() * 34, 'bm') + rond(p, W - 2 - r() * 18, y + (r() - .5) * 34, 58 + r() * 34, 'bm'); }
  for(var k = 0; k < 26; k++){ var a = r(), t = r(); var px = a < .5 ? t * W : (a < .75 ? 18 : W - 18), py = a < .25 ? 16 : (a < .5 ? H - 16 : t * H); s += rond(p, px, py, 40 + r() * 34, 'bmC'); }
  return s + '</g>';
}

module.exports = {ZONES: ZONES, VILLAGE: VILLAGE, defs: defs, zone: zone, mur: mur};
