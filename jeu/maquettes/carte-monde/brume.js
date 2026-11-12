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
  s += '<radialGradient id="' + p + 'bmD" cx="50%" cy="50%" r="50%">' + PROFIL.map(function(q){ return st(q[0], '#e6ecf8', q[1]); }).join('') + '</radialGradient>';
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

/* ---------- La brume s'épaissit petit à petit en s'éloignant du village (Romain, 12 novembre, 9 h 41 : « une transition un peu plus douce ») ----------
   Au bord du village : rien. À D_BRUME du village : la brume est pleine. Entre les deux, on devine ce qu'il y a dessous (jamais les étiquettes). */
var D_BRUME = 260, D_DEBUT = 30;
function distVillage(x, y){ return Math.hypot(Math.max(VILLAGE[0] - x, 0, x - VILLAGE[2]), Math.max(VILLAGE[1] - y, 0, y - VILLAGE[3])); }
function voulue(d){ var t = Math.max(0, Math.min(1, d / D_BRUME)); return 1 - Math.pow(1 - t, 2); }   /* la part de brume voulue à cette distance */
/* Les ronds se recouvrent : pour obtenir la brume voulue, chacun doit être plus léger. On calcule une fois ce que donnent des ronds d'une
   force donnée (rayon R_ROND, un rond tous les PAS), et on lit la table à l'envers. */
var R_ROND = 104, PAS = 76;
var PROFIL = [[0, 1], [.35, .86], [.7, .42], [1, 0]];   /* le dégradé d'un rond, du centre au bord (c'est le dégradé « bmD » de defs) */
function profil(u){ for(var i = 1; i < PROFIL.length; i++) if(u <= PROFIL[i][0]){ var a = PROFIL[i - 1], b = PROFIL[i]; return a[1] + (b[1] - a[1]) * (u - a[0]) / (b[0] - a[0]); } return 0; }
var TABLE = (function(){
  var t = [], dens = Math.PI * R_ROND * R_ROND / (PAS * PAS);
  for(var k = 0; k <= 100; k++){
    var f0 = k / 100, somme = 0, n = 400;
    for(var i = 0; i < n; i++){ var u = (i + .5) / n; somme += Math.log(1 - Math.min(.999, f0 * profil(u))) * 2 * u / n; }
    t.push(1 - Math.exp(dens * somme));
  }
  return t;
})();
function force(part){   /* la force d'un rond pour que la brume, là, ait cette part */
  if(part >= .985) return 1;
  for(var k = 0; k <= 100; k++) if(TABLE[k] >= part) return k / 100;
  return 1;
}

/* Un banc de brume : un cœur plein (loin du village), des ronds doux partout ailleurs — de plus en plus légers près du village —, des bosses claires
   et des creux d'ombre (le relief), quelques voiles qui dérivent.
   Du côté d'une autre zone, les ronds s'arrêtent un peu avant la limite : deux bancs voisins se recouvrent sans laisser de fente, et quand l'un se lève
   l'autre garde un bord doux. */
function zone(p, z, i){
  var r = O.rng(500 + i * 37), x0 = z.r[0], y0 = z.r[1], x1 = z.r[2], y1 = z.r[3], s = '';
  var VERS_Z = 45;   /* de combien le centre des ronds reste en deçà de la limite d'une zone voisine */
  var cotes = [   /* a → b, la direction du dehors, et si ce côté est au bord du monde */
    {a:[x0, y0], b:[x1, y0], n:[0, -1], monde: y0 <= 0},
    {a:[x0, y1], b:[x1, y1], n:[0, 1], monde: y1 >= H},
    {a:[x0, y0], b:[x0, y1], n:[-1, 0], monde: x0 <= 0},
    {a:[x1, y0], b:[x1, y1], n:[1, 0], monde: x1 >= W}
  ];
  cotes.forEach(function(c){   /* le cœur plein : loin du village (là où la brume est pleine), un peu rentré du côté d'une zone voisine */
    c.village = false;
    for(var t = 0; t <= 1.001; t += .05) if(touche(c.a[0] + (c.b[0] - c.a[0]) * t + c.n[0] * 8, c.a[1] + (c.b[1] - c.a[1]) * t + c.n[1] * 8)) c.village = true;
    c.rentre = c.monde ? -24 : (c.village ? D_BRUME + 30 : VERS_Z + 30);
  });
  var cx0 = x0 + cotes[2].rentre, cx1 = x1 - cotes[3].rentre, cy0 = y0 + cotes[0].rentre, cy1 = y1 - cotes[1].rentre, coeur = cx1 - cx0 > 60 && cy1 - cy0 > 60;
  if(coeur) s += '<rect x="' + cx0 + '" y="' + cy0 + '" width="' + (cx1 - cx0) + '" height="' + (cy1 - cy0) + '" rx="50" fill="#e6ecf8"/>';
  /* les ronds : un semis régulier, un peu bousculé, sur toute la zone sauf bien au milieu du cœur */
  function dansZoneRonds(x, y, mini){   /* assez loin des zones voisines ? (le bord du monde et le village ne comptent pas) */
    for(var k = 0; k < 4; k++){
      var c = cotes[k]; if(c.monde) continue;
      var d = c.n[0] ? (c.n[0] > 0 ? x1 - x : x - x0) : (c.n[1] > 0 ? y1 - y : y - y0);   /* distance à ce côté, vers l'intérieur */
      if(d < mini && !touche(x + c.n[0] * (d + 8), y + c.n[1] * (d + 8))) return false;
    }
    return true;
  }
  var nBande = 0;
  function poser(x, y){
    var fo = force(voulue(distVillage(x, y)));
    if(fo < .02) return;
    if(fo < 1) nBande++;
    s += rond(p, x, y, R_ROND * (.92 + r() * .2), 'bmD', fo < 1 ? ' fill-opacity="' + fo.toFixed(2) + '"' : '');
  }
  /* un rang de ronds le long de chaque limite avec une zone voisine, toujours à la même distance de la limite : jamais de fente entre deux bancs */
  cotes.forEach(function(c){
    if(c.monde) return;
    var l = Math.hypot(c.b[0] - c.a[0], c.b[1] - c.a[1]), ux = (c.b[0] - c.a[0]) / l, uy = (c.b[1] - c.a[1]) / l, n = Math.round(l / PAS);
    for(var k = 0; k <= n; k++){
      var u = l * k / n, x = c.a[0] + ux * u, y = c.a[1] + uy * u;
      if(touche(x + c.n[0] * 8, y + c.n[1] * 8)) continue;   /* le long du village : pas de rang, le semis fait la pente douce */
      var px = x - c.n[0] * VERS_Z + ux * (r() - .5) * 20, py = y - c.n[1] * VERS_Z + uy * (r() - .5) * 20;
      if(distVillage(px, py) < D_DEBUT || !dansZoneRonds(px, py, VERS_Z - 2)) continue;
      poser(px, py);
    }
  });
  for(var gy = y0 - 20 + (i % 2) * 20; gy <= y1 + 20; gy += PAS) for(var gx = x0 - 20 + ((Math.round(gy / PAS)) % 2) * PAS / 2; gx <= x1 + 20; gx += PAS){
    var x = gx + (r() - .5) * 26, y = gy + (r() - .5) * 26, d = distVillage(x, y);
    if(x < x0 - 30 || x > x1 + 30 || y < y0 - 30 || y > y1 + 30 || d < D_DEBUT || !dansZoneRonds(x, y, VERS_Z + PAS / 2)) continue;
    if(coeur && x > cx0 + 70 && x < cx1 - 70 && y > cy0 + 70 && y < cy1 - 70) continue;
    poser(x, y);
  }
  /* le relief du cœur : des creux d'ombre, puis des bosses claires */
  if(coeur){
    var aire = (cx1 - cx0) * (cy1 - cy0), n = Math.round(aire / 24000);
    for(var a = 0; a < n; a++){ var ox = cx0 + 30 + r() * (cx1 - cx0 - 60), oy = cy0 + 30 + r() * (cy1 - cy0 - 60); s += rond(p, ox + 22, oy + 30, 60 + r() * 60, 'bmO'); }
    for(var b = 0; b < n * 1.5; b++){ var bx = cx0 + 10 + r() * (cx1 - cx0 - 20), bby = cy0 + 10 + r() * (cy1 - cy0 - 20); s += rond(p, bx, bby, 62 + r() * 78, 'bmC'); }
  }
  /* le relief de la bande douce : quelques bosses claires, d'autant plus légères qu'on est près du village */
  for(var e = 0, fait = 0; e < 4000 && fait < nBande / 3; e++){
    var ex = x0 + r() * (x1 - x0), ey = y0 + r() * (y1 - y0), ed = distVillage(ex, ey);
    if(ed < D_DEBUT + 50 || ed > D_BRUME + 40 || !dansZoneRonds(ex, ey, VERS_Z)) continue;
    s += rond(p, ex, ey, 54 + r() * 62, 'bmC', ' opacity="' + (voulue(ed) * .85).toFixed(2) + '"'); fait++;
  }
  /* les voiles qui dérivent : ils restent dans le cœur du banc (ils glissent de 70 de chaque côté) */
  if(coeur) for(var v = 0; v < 3; v++){
    var vrx = Math.min(190 + r() * 110, (cx1 - cx0) / 2 - 80), vry = 50 + r() * 28;
    if(vrx < 60) continue;
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

module.exports = {ZONES: ZONES, VILLAGE: VILLAGE, D_BRUME: D_BRUME, distVillage: distVillage, defs: defs, zone: zone, mur: mur};
