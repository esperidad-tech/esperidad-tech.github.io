/* ==========================================================
   Brumeval — le grand monde : la brume, et l'assemblage du monde que carte.js appelle (Bible chapitre 14)
   Huit bancs de brume autour du village (un par zone), qu'on lève un par un, et le mur de brume du bord de la vallée, qui ne se lève jamais.
   Pas de flou (trop lourd pour une vieille tablette) : des ronds en dégradé, et on n'anime que la place et l'opacité.
   ========================================================== */
(function(){
'use strict';
var Monde = window.Monde, O = Monde.O, T = Monde.T;
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

/* ---------- La teinte du moment ----------
   Dans le jeu, la brume est un dessin posé PAR-DESSUS celui du village (carte.js, « trois dessins ») : le voile de lumière du moment (rose le matin,
   bleu sombre la nuit…), qui est dans le dessin du village, ne la recouvre plus. On la teinte donc à la source : chaque couleur de la brume est
   mélangée à la couleur du voile. Le voile change du haut vers le bas de la carte : la carte est coupée en N_BANDES bandes couchées, chacune avec
   ses dégradés (d'une bande à l'autre l'écart ne se voit pas). C'est le même résultat que le voile posé sur la brume.
   Sans teinte (la page du modèle, où le voile recouvre tout) : une seule série de dégradés. */
var N_BANDES = 6, TEINTE = null;
function hex(c){ c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
function teinter(c, y){   /* la couleur c vue à travers le voile du moment, à la hauteur y */
  if(!TEINTE) return c;
  var t = Math.max(0, Math.min(1, y / H)), h = hex(TEINTE.haut[0]), b = hex(TEINTE.bas[0]), a = TEINTE.haut[1] + (TEINTE.bas[1] - TEINTE.haut[1]) * t, k = hex(c);
  return '#' + [0, 1, 2].map(function(i){ var v = Math.round(k[i] * (1 - a) + (h[i] + (b[i] - h[i]) * t) * a); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
}
function bande(y){ return TEINTE ? Math.max(0, Math.min(N_BANDES - 1, Math.floor(y / H * N_BANDES))) : ''; }
function bandes(){ var l = ['']; if(TEINTE){ l = []; for(var k = 0; k < N_BANDES; k++) l.push(k); } return l; }
var E_MUR = 112;   /* l'épaisseur du mur de brume, au bord du monde */

function defs(p, teinte){
  TEINTE = teinte || null;
  function st(o, c, a){ return '<stop offset="' + o + '" stop-color="' + c + '" stop-opacity="' + a + '"/>'; }
  var s = '';
  bandes().forEach(function(b){
    var y = TEINTE ? (b + .5) * H / N_BANDES : 0, t = function(c){ return teinter(c, y); };
    s += '<radialGradient id="' + p + 'bm' + b + '" cx="50%" cy="50%" r="50%">' + st(0, t('#e6ecf8'), 1) + st(.55, t('#e6ecf8'), .96) + st(.8, t('#e9eefa'), .55) + st(1, t('#eef2ff'), 0) + '</radialGradient>';
    s += '<radialGradient id="' + p + 'bmD' + b + '" cx="50%" cy="50%" r="50%">' + PROFIL.map(function(q){ return st(q[0], t('#e6ecf8'), q[1]); }).join('') + '</radialGradient>';
    s += '<radialGradient id="' + p + 'bmC' + b + '" cx="42%" cy="38%" r="55%">' + st(0, t('#ffffff'), .95) + st(.5, t('#ffffff'), .5) + st(1, t('#ffffff'), 0) + '</radialGradient>';
    s += '<radialGradient id="' + p + 'bmO' + b + '" cx="50%" cy="50%" r="50%">' + st(0, t('#b4bfdc'), .32) + st(1, t('#aab6d6'), 0) + '</radialGradient>';
    s += '<radialGradient id="' + p + 'bmV' + b + '" cx="50%" cy="50%" r="50%">' + st(0, t('#ffffff'), .42) + st(.6, t('#ffffff'), .18) + st(1, t('#ffffff'), 0) + '</radialGradient>';
    ['g', 'd'].forEach(function(c){   /* les murs de gauche et de droite : un morceau par bande */
      s += '<linearGradient id="' + p + 'mur-' + c + b + '" x1="' + (c === 'd' ? 1 : 0) + '" y1="0" x2="' + (c === 'g' ? 1 : 0) + '" y2="0">' + st(0, t('#eef2ff'), 1) + st(.45, t('#eef2ff'), .96) + st(1, t('#eef2ff'), 0) + '</linearGradient>';
    });
  });
  ['h', 'b'].forEach(function(c){   /* les murs du haut et du bas */
    var col = teinter('#eef2ff', c === 'h' ? E_MUR / 2 : H - E_MUR / 2);
    s += '<linearGradient id="' + p + 'mur-' + c + '" x1="0" y1="' + (c === 'b' ? 1 : 0) + '" x2="0" y2="' + (c === 'h' ? 1 : 0) + '">' + st(0, col, 1) + st(.45, col, .96) + st(1, col, 0) + '</linearGradient>';
  });
  /* le cœur plein des bancs : un seul dégradé, posé sur le monde, qui suit le voile du haut en bas */
  if(TEINTE) s += '<linearGradient id="' + p + 'bmFond" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="' + H + '">' + [0, .25, .5, .75, 1].map(function(u){ return st(u, teinter('#e6ecf8', u * H), 1); }).join('') + '</linearGradient>';
  return s;
}

function rond(p, x, y, r, id, extra){ return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="url(#' + p + id + bande(y) + ')"' + (extra || '') + '/>'; }

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
function zone(p, z, i, maquette, levee){
  var r = O.rng(500 + i * 37), x0 = z.r[0], y0 = z.r[1], x1 = z.r[2], y1 = z.r[3], s = '';
  var VERS_Z = 45;   /* de combien le centre des ronds reste en deçà de la limite d'une zone voisine */
  var cotes = [   /* a → b, la direction du dehors, et si ce côté est au bord du monde */
    {a:[x0, y0], b:[x1, y0], n:[0, -1], monde: y0 <= 0},
    {a:[x0, y1], b:[x1, y1], n:[0, 1], monde: y1 >= H},
    {a:[x0, y0], b:[x0, y1], n:[-1, 0], monde: x0 <= 0},
    {a:[x1, y0], b:[x1, y1], n:[1, 0], monde: x1 >= W}
  ];
  /* Le cœur plein : là où la brume est pleine (loin du village). Du côté d'une zone voisine :
     - dans le jeu, si la voisine a encore sa brume, les deux cœurs se recouvrent (c.plein) : aucune bande plus claire entre deux bancs ;
     - si la voisine est levée (ou dans la page du modèle, où l'on lève les zones en les touchant), le cœur reste en retrait et le bord est fait de ronds doux.
     (12 novembre, 11 h : un côté ne compte « le long du village » que s'il le longe vraiment — un coin qui le touche ne suffit pas : avant, les cœurs
     étaient tout petits et leurs bords se voyaient dans la brume, sur une tablette dézoomée.) */
  cotes.forEach(function(c){
    c.village = false; c.plein = false;
    var ouverte = !!maquette;
    for(var t = .05; t <= .951; t += .05){
      var qx = c.a[0] + (c.b[0] - c.a[0]) * t + c.n[0] * 8, qy = c.a[1] + (c.b[1] - c.a[1]) * t + c.n[1] * 8;
      if(touche(qx, qy)) c.village = true;
      else if(levee && levee[zoneDe(qx, qy)]) ouverte = true;
    }
    c.plein = !c.monde && !c.village && !ouverte;
    c.rentre = c.monde ? -24 : (c.village ? D_BRUME + 30 : (c.plein ? -30 : VERS_Z + 30));
  });
  var cx0 = x0 + cotes[2].rentre, cx1 = x1 - cotes[3].rentre, cy0 = y0 + cotes[0].rentre, cy1 = y1 - cotes[1].rentre, coeur = cx1 - cx0 > 60 && cy1 - cy0 > 60;
  /* (le trait à demi transparent adoucit le bord du cœur, là où les ronds ne sont pas tout à fait pleins) */
  var plein = TEINTE ? 'url(#' + p + 'bmFond)' : '#e6ecf8';
  if(coeur) s += '<rect x="' + cx0 + '" y="' + cy0 + '" width="' + (cx1 - cx0) + '" height="' + (cy1 - cy0) + '" rx="50" fill="' + plein + '" stroke="' + plein + '" stroke-opacity=".5" stroke-width="44"/>';
  /* du côté du village, le bord du cœur disparaît sous des ronds doux posés à cheval dessus : jamais de ligne droite dans la brume.
     (Petits, et un peu rentrés : ils ne dépassent pas de la brume déjà pleine, la pente douce vers le village ne change pas.) */
  if(coeur) cotes.forEach(function(c){
    if(!c.village) return;
    var couche = !c.n[0];   /* un côté du haut ou du bas : le bord du cœur court de gauche à droite */
    var bord = c.n[0] > 0 ? cx1 - 10 : (c.n[0] < 0 ? cx0 + 10 : (c.n[1] > 0 ? cy1 - 10 : cy0 + 10));
    var a0 = couche ? Math.max(cx0, x0) : Math.max(cy0, y0), a1 = couche ? Math.min(cx1, x1) : Math.min(cy1, y1), n = Math.max(1, Math.round((a1 - a0) / 60));
    for(var q = 0; q < n; q++){
      var u = a0 + (a1 - a0) * (q + .5) / n + (r() - .5) * 12;
      s += rond(p, couche ? u : bord, couche ? bord : u, 76 + r() * 10, 'bmD');
    }
  });
  /* les ronds : un semis régulier, un peu bousculé, sur toute la zone sauf bien au milieu du cœur */
  function dansZoneRonds(x, y, mini){   /* assez loin des zones voisines ? (le bord du monde, le village et une voisine dont le cœur recouvre le nôtre ne comptent pas) */
    for(var k = 0; k < 4; k++){
      var c = cotes[k]; if(c.monde || c.plein) continue;
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
    if(c.monde || c.plein) return;
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
    if(coeur && x > cx0 + 12 && x < cx1 - 12 && y > cy0 + 12 && y < cy1 - 12) continue;   /* dans le cœur plein : inutile */
    poser(x, y);
  }
  /* le relief, partout où la brume est pleine (jusqu'aux limites des zones voisines : sinon une bande lisse se voit entre deux bancs) :
     des creux d'ombre, puis des bosses claires */
  var aire = 0, pleins = [];
  for(var e0 = 0; e0 < 900; e0++){
    var qx = x0 + r() * (x1 - x0), qy = y0 + r() * (y1 - y0);
    if(distVillage(qx, qy) > D_BRUME - 10 && dansZoneRonds(qx, qy, 70)) pleins.push([qx, qy]);
  }
  aire = (x1 - x0) * (y1 - y0) * pleins.length / 900;
  var n = Math.min(pleins.length, Math.round(aire / 30000)), k1 = 0;
  for(var a = 0; a < n; a++){ var qa = pleins[k1++ % pleins.length]; s += rond(p, qa[0] + 22, qa[1] + 30, 56 + r() * 50, 'bmO'); }
  for(var b = 0; b < n * 1.5; b++){ var qb = pleins[k1++ % pleins.length]; s += rond(p, qb[0], qb[1], 58 + r() * 66, 'bmC'); }
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
    s += '<ellipse class="ca-brume ca-brume' + (v % 2) + '" cx="' + f(vx) + '" cy="' + f(vy) + '" rx="' + f(vrx) + '" ry="' + f(vry) + '" fill="url(#' + p + 'bmV' + bande(vy) + ')" style="animation-delay:-' + (v * 9 + i * 3) + 's"/>';
  }
  return '<g class="bm-zone" data-zone="' + z.id + '" style="transform-origin:' + f((x0 + x1) / 2) + 'px ' + f((y0 + y1) / 2) + 'px">' + s +
    (maquette ? '<rect class="bm-hit" x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" fill="#fff" fill-opacity="0"/>' : '') + '</g>';
}

/* Le mur de brume : le bord de la vallée. Il ne se lève jamais. */
function mur(p){
  var E = E_MUR, r = O.rng(77), s = '<g class="bm-mur" pointer-events="none">';
  s += '<rect x="0" y="0" width="' + W + '" height="' + E + '" fill="url(#' + p + 'mur-h)"/>';
  s += '<rect x="0" y="' + (H - E) + '" width="' + W + '" height="' + E + '" fill="url(#' + p + 'mur-b)"/>';
  bandes().forEach(function(b){   /* à gauche et à droite : un morceau par bande de teinte (ils se recouvrent d'un rien, pour ne laisser aucune fente) */
    var y0 = TEINTE ? b * H / N_BANDES : 0, h = TEINTE ? H / N_BANDES + (b < N_BANDES - 1 ? 1 : 0) : H;
    s += '<rect x="0" y="' + f(y0) + '" width="' + E + '" height="' + f(h) + '" fill="url(#' + p + 'mur-g' + b + ')"/>';
    s += '<rect x="' + (W - E) + '" y="' + f(y0) + '" width="' + E + '" height="' + f(h) + '" fill="url(#' + p + 'mur-d' + b + ')"/>';
  });
  for(var x = 0; x <= W; x += 84){ s += rond(p, x + (r() - .5) * 34, 2 + r() * 18, 58 + r() * 34, 'bm') + rond(p, x + (r() - .5) * 34, H - 2 - r() * 18, 58 + r() * 34, 'bm'); }
  for(var y = 60; y <= H - 60; y += 84){ s += rond(p, 2 + r() * 18, y + (r() - .5) * 34, 58 + r() * 34, 'bm') + rond(p, W - 2 - r() * 18, y + (r() - .5) * 34, 58 + r() * 34, 'bm'); }
  for(var k = 0; k < 26; k++){ var a = r(), t = r(); var px = a < .5 ? t * W : (a < .75 ? 18 : W - 18), py = a < .25 ? 16 : (a < .5 ? H - 16 : t * H); s += rond(p, px, py, 40 + r() * 34, 'bmC'); }
  return s + '</g>';
}

var B = Monde.B = {ZONES: ZONES, VILLAGE: VILLAGE, D_BRUME: D_BRUME, distVillage: distVillage, defs: defs, zone: zone, mur: mur};

/* ==========================================================
   L'assemblage : ce que carte.js pose autour du village
   ========================================================== */
var STYLES = ['foret', 'sombre', 'pre'];
/* les noms des contrées, écrits en grand dans le paysage */
var CONTREES = [
  {zone:'no', x:640, y:488, t:'Le Bois Sombre', rot:-5, c:'#d6f2e0'},
  {zone:'o',  x:668, y:1112, t:'Les Collines', rot:-4, c:'#fbf3d6'},
  {zone:'e',  x:2372, y:1106, t:'L\'Autre Rive', rot:2, c:'#fbf3d6'}
];
/* Près du village, la brume est encore légère : ce qui s'y trouve reste dessiné même sous la brume (on le devine). Plus loin, la brume est pleine :
   tant que la zone n'est pas levée, on ne dessine rien (ça ne se verrait pas, et la tablette n'a pas à le peindre). */
function frange(x, y, marge){ return distVillage(x, y) < D_BRUME + marge; }
function zoneDe(x, y){ var id = null; ZONES.forEach(function(z){ if(x >= z.r[0] && x < z.r[2] && y >= z.r[1] && y < z.r[3]) id = z.id; }); return id; }

Monde.W = W; Monde.H = H; Monde.OX = O.OX; Monde.OY = O.OY;
Monde.frange = frange; Monde.zoneDe = zoneDe; Monde.CONTREES = CONTREES;
Monde.defs = function(p, teinte){ return T.defs(p) + defs(p, teinte); };
/* p : le préfixe des dégradés du monde ; pv : celui de la carte du village.
   o.brume : la liste des zones dont la brume est levée (rien : toute la brume) ; o.riviere === 'rouge' ; o.etiquette : la taille des étiquettes ;
   o.teinte : {haut:[couleur, force], bas:[couleur, force]}, le voile de lumière du moment, pour teinter la brume (le jeu) ;
   o.maquette : la page du modèle (tout est là, rangé par zone, et la page montre ou cache). */
Monde.assembler = function(p, pv, o){
  o = o || {};
  var maq = !!o.maquette, levee = {};
  TEINTE = (!maq && o.teinte) || null;   /* la brume teintée à la source (le jeu) ou pas (la page du modèle) : voir « La teinte du moment » */
  (o.brume || []).forEach(function(id){ levee[id] = true; });
  var L = Monde.lieux(p, pv), groupes = {frange: []};
  ZONES.forEach(function(z){ groupes[z.id] = []; });
  /* ce qui dépasse du sol : les arbres, les lieux, les petites choses */
  (Monde.ARBRES || []).forEach(function(a){
    var z = a[5] < 0 ? 'frange' : ZONES[a[5]].id;
    if(z !== 'frange' && !maq && !levee[z]) return;
    groupes[z].push({y: a[1], svg: T.arbre(p, pv, {x: a[0], y: a[1], r: a[2], v: a[3], style: STYLES[a[4]]})});
  });
  L.lieux.forEach(function(l){
    var z = frange(l.x, l.y, 80) ? 'frange' : l.zone;
    if(z !== 'frange' && !maq && !levee[z]) return;
    groupes[z].push({y: l.y, svg: '<g data-lieu="' + l.id + '">' + l.dessin() + '</g>'});
  });
  L.curieux.forEach(function(c){ groupes.frange.push({y: c.y, svg: c.svg}); });   /* de toutes petites choses : toujours dessinées */
  function couche(l){ return l.sort(function(a, b){ return a.y - b.y; }).map(function(d){ return d.svg; }).join(''); }
  var dessus;
  if(maq) dessus = '<g class="mo-frange">' + couche(groupes.frange) + '</g>' + ZONES.map(function(z){ return '<g class="mo-contenu mo-cache" data-zone="' + z.id + '">' + couche(groupes[z.id]) + '</g>'; }).join('');
  else { var tout = groupes.frange; ZONES.forEach(function(z){ if(levee[z.id]) tout = tout.concat(groupes[z.id]); }); dessus = couche(tout); }
  /* les étiquettes et les noms des contrées : jamais avant que la brume de leur zone soit levée */
  var parZone = {}, taille = o.etiquette || 30;
  ZONES.forEach(function(z){ parZone[z.id] = ''; });
  CONTREES.forEach(function(c){ if(maq || levee[c.zone]) parZone[c.zone] += O.texte(c.x, c.y, c.t, 46, c.c, {classe: 'mo-contree', rot: c.rot, contour: '#24182e', cw: 7, opacite: .82}); });
  L.lieux.forEach(function(l){ if(l.nom && (maq || levee[l.zone])) parZone[l.zone] += O.etiquette(l.etiq[0], l.etiq[1], l.ic, l.nom, {classe: 'ca-etiq-lieu', taille: taille}).svg; });
  var etiq = ZONES.map(function(z){ return maq ? '<g class="mo-etiq-zone" data-zone="' + z.id + '">' + parZone[z.id] + '</g>' : parZone[z.id]; }).join('');
  /* la brume des zones pas encore levées, et le mur du bord */
  var brume = ZONES.map(function(z, i){ return maq || !levee[z.id] ? zone(p, z, i, maq, levee) : ''; }).join('') + mur(p);
  return {
    sol: '<g class="mo-sol">' + T.sol(p, pv, {riviere: o.riviere, sansVives: !maq, voit: function(zi){ return zi < 0 || maq || !!levee[ZONES[zi].id]; }}) + '</g>',
    vives: T.eauxVives(p, pv, {riviere: o.riviere}),   /* le ruisseau et la rivière du village, qui coulent (carte.js les pose dans le dessin du village) */
    dessus: '<g class="mo-dessus">' + dessus + '</g>',
    brume: '<g class="mo-brume"' + (maq ? '' : ' pointer-events="none"') + '>' + brume + '</g>',
    etiquettes: '<g class="mo-etiqs" pointer-events="none">' + etiq + '</g>'
  };
};
})();
