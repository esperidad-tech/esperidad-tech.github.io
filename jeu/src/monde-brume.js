/* ==========================================================
   Brumeval — le grand monde : la brume, et l'assemblage du monde que carte.js appelle (Bible chapitre 14)
   Huit bancs de brume autour du village (un par zone), qu'on lève un par un, et le mur de brume du bord de la vallée, qui ne se lève jamais.
   Pas de flou (trop lourd pour une vieille tablette) : des ronds en dégradé.

   DANS LE JEU, LA BRUME EST UNE IMAGE, PAS UN DESSIN (Romain, 12 novembre, 12 h 20 : sur son iPhone, « dès que je me déplace vers les
   nuages, ça rame à mort »). Un millier de ronds en dégradé qui se recouvrent, à repeindre morceau par morceau chaque fois qu'on glisse :
   c'était trop pour un téléphone. Maintenant la brume est peinte UNE fois, en petit (ECH), sur une toile (un <canvas>) que la tablette étire
   comme une photo — étirer une photo ne lui coûte rien, et une brume un peu floue reste une brume. Une toile par moment de la journée et par
   jeu de zones levées, gardée en mémoire (toileBrume).
   La page du modèle, elle, garde la brume en dessin (un seul grand dessin, où l'on lève les zones en les touchant).
   Les deux sortent de la même liste de morceaux (zone, mur) : ecrire() en fait un dessin, peindre() une image.
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
var E_MUR = 112;   /* l'épaisseur du mur de brume, au bord du monde */

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
var PROFIL = [[0, 1], [.35, .86], [.7, .42], [1, 0]];   /* le dégradé d'un rond, du centre au bord (c'est le dégradé « bmD ») */
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

/* ---------- Les dégradés : une seule table, pour le dessin et pour l'image ----------
   c : le centre et le rayon du dégradé, en parts de la boîte du rond ; s : les arrêts [place, couleur, force]. */
var DEGRADES = {
  bm:  {c: [.5, .5, .5],    s: [[0, '#e6ecf8', 1], [.55, '#e6ecf8', .96], [.8, '#e9eefa', .55], [1, '#eef2ff', 0]]},   /* le mur du bord */
  bmD: {c: [.5, .5, .5],    s: PROFIL.map(function(q){ return [q[0], '#e6ecf8', q[1]]; })},                           /* les ronds d'un banc */
  bmC: {c: [.42, .38, .55], s: [[0, '#ffffff', .95], [.5, '#ffffff', .5], [1, '#ffffff', 0]]},                        /* une bosse claire */
  bmO: {c: [.5, .5, .5],    s: [[0, '#b4bfdc', .32], [1, '#aab6d6', 0]]},                                            /* un creux d'ombre */
  bmV: {c: [.5, .5, .5],    s: [[0, '#ffffff', .42], [.6, '#ffffff', .18], [1, '#ffffff', 0]]}                       /* un voile */
};
var MUR_S = [[0, '#eef2ff', 1], [.45, '#eef2ff', .96], [1, '#eef2ff', 0]];   /* du bord du monde (plein) vers le dedans (rien) */
var PLEIN = '#e6ecf8';

function defs(p){
  function st(q){ return '<stop offset="' + q[0] + '" stop-color="' + q[1] + '" stop-opacity="' + q[2] + '"/>'; }
  var s = '';
  Object.keys(DEGRADES).forEach(function(id){
    var d = DEGRADES[id];
    s += '<radialGradient id="' + p + id + '" cx="' + d.c[0] * 100 + '%" cy="' + d.c[1] * 100 + '%" r="' + d.c[2] * 100 + '%">' + d.s.map(st).join('') + '</radialGradient>';
  });
  ['h', 'b', 'g', 'd'].forEach(function(c){
    s += '<linearGradient id="' + p + 'mur-' + c + '" x1="' + (c === 'd' ? 1 : 0) + '" y1="' + (c === 'b' ? 1 : 0) + '" x2="' + (c === 'g' ? 1 : 0) + '" y2="' + (c === 'h' ? 1 : 0) + '">' + MUR_S.map(st).join('') + '</linearGradient>';
  });
  return s;
}

/* ---------- Les morceaux de la brume ----------
   Une liste de morceaux tout simples :
     ['coeur', x, y, l, h]            un grand rectangle plein, aux coins ronds, au bord adouci
     ['rond', x, y, r, dégradé, force] un rond en dégradé (force : de 0 à 1)
     ['voile', x, y, rx, ry, n, retard] un voile ovale (dans la page du modèle, il dérive)
     ['mur', côté]                    une bande du mur du bord : 'h', 'b', 'g' ou 'd' */

/* Un banc de brume : un cœur plein (loin du village), des ronds doux partout ailleurs — de plus en plus légers près du village —, des bosses claires
   et des creux d'ombre (le relief), quelques voiles.
   Du côté d'une autre zone, les ronds s'arrêtent un peu avant la limite : deux bancs voisins se recouvrent sans laisser de fente, et quand l'un se lève
   l'autre garde un bord doux. */
function zone(z, i, maquette, levee){
  var r = O.rng(500 + i * 37), x0 = z.r[0], y0 = z.r[1], x1 = z.r[2], y1 = z.r[3], L = [];
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
  if(coeur) L.push(['coeur', cx0, cy0, cx1 - cx0, cy1 - cy0]);
  /* du côté du village, le bord du cœur disparaît sous des ronds doux posés à cheval dessus : jamais de ligne droite dans la brume.
     (Petits, et un peu rentrés : ils ne dépassent pas de la brume déjà pleine, la pente douce vers le village ne change pas.) */
  if(coeur) cotes.forEach(function(c){
    if(!c.village) return;
    var couche = !c.n[0];   /* un côté du haut ou du bas : le bord du cœur court de gauche à droite */
    var bord = c.n[0] > 0 ? cx1 - 10 : (c.n[0] < 0 ? cx0 + 10 : (c.n[1] > 0 ? cy1 - 10 : cy0 + 10));
    var a0 = couche ? Math.max(cx0, x0) : Math.max(cy0, y0), a1 = couche ? Math.min(cx1, x1) : Math.min(cy1, y1), n = Math.max(1, Math.round((a1 - a0) / 60));
    for(var q = 0; q < n; q++){
      var u = a0 + (a1 - a0) * (q + .5) / n + (r() - .5) * 12;
      L.push(['rond', couche ? u : bord, couche ? bord : u, 76 + r() * 10, 'bmD', 1]);
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
    L.push(['rond', x, y, R_ROND * (.92 + r() * .2), 'bmD', fo < 1 ? +fo.toFixed(2) : 1]);
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
  for(var a = 0; a < n; a++){ var qa = pleins[k1++ % pleins.length]; L.push(['rond', qa[0] + 22, qa[1] + 30, 56 + r() * 50, 'bmO', 1]); }
  for(var b = 0; b < n * 1.5; b++){ var qb = pleins[k1++ % pleins.length]; L.push(['rond', qb[0], qb[1], 58 + r() * 66, 'bmC', 1]); }
  /* le relief de la bande douce : quelques bosses claires, d'autant plus légères qu'on est près du village */
  for(var e = 0, fait = 0; e < 4000 && fait < nBande / 3; e++){
    var ex = x0 + r() * (x1 - x0), ey = y0 + r() * (y1 - y0), ed = distVillage(ex, ey);
    if(ed < D_DEBUT + 50 || ed > D_BRUME + 40 || !dansZoneRonds(ex, ey, VERS_Z)) continue;
    L.push(['rond', ex, ey, 54 + r() * 62, 'bmC', +(voulue(ed) * .85).toFixed(2)]); fait++;
  }
  /* les voiles : ils restent dans le cœur du banc (dans la page du modèle, ils glissent de 70 de chaque côté) */
  if(coeur) for(var v = 0; v < 3; v++){
    var vrx = Math.min(190 + r() * 110, (cx1 - cx0) / 2 - 80), vry = 50 + r() * 28;
    if(vrx < 60) continue;
    var vx = cx0 + vrx + 70 + r() * Math.max(0, cx1 - cx0 - 2 * vrx - 140), vy = cy0 + vry + r() * Math.max(0, cy1 - cy0 - 2 * vry);
    L.push(['voile', vx, vy, vrx, vry, v % 2, v * 9 + i * 3]);
  }
  return L;
}

/* Le mur de brume : le bord de la vallée. Il ne se lève jamais. */
function mur(){
  var r = O.rng(77), L = [['mur', 'h'], ['mur', 'b'], ['mur', 'g'], ['mur', 'd']];
  for(var x = 0; x <= W; x += 84){ L.push(['rond', x + (r() - .5) * 34, 2 + r() * 18, 58 + r() * 34, 'bm', 1]); L.push(['rond', x + (r() - .5) * 34, H - 2 - r() * 18, 58 + r() * 34, 'bm', 1]); }
  for(var y = 60; y <= H - 60; y += 84){ L.push(['rond', 2 + r() * 18, y + (r() - .5) * 34, 58 + r() * 34, 'bm', 1]); L.push(['rond', W - 2 - r() * 18, y + (r() - .5) * 34, 58 + r() * 34, 'bm', 1]); }
  for(var k = 0; k < 26; k++){ var a = r(), t = r(); var px = a < .5 ? t * W : (a < .75 ? 18 : W - 18), py = a < .25 ? 16 : (a < .5 ? H - 16 : t * H); L.push(['rond', px, py, 40 + r() * 34, 'bmC', 1]); }
  return L;
}
function rectMur(c){ return c === 'h' ? [0, 0, W, E_MUR] : c === 'b' ? [0, H - E_MUR, W, E_MUR] : c === 'g' ? [0, 0, E_MUR, H] : [W - E_MUR, 0, E_MUR, H]; }

/* ---------- La liste en dessin (la page du modèle) ---------- */
function ecrire(p, L){
  return L.map(function(m){
    if(m[0] === 'coeur') return '<rect x="' + m[1] + '" y="' + m[2] + '" width="' + m[3] + '" height="' + m[4] + '" rx="50" fill="' + PLEIN + '" stroke="' + PLEIN + '" stroke-opacity=".5" stroke-width="44"/>';
    if(m[0] === 'rond') return '<circle cx="' + f(m[1]) + '" cy="' + f(m[2]) + '" r="' + f(m[3]) + '" fill="url(#' + p + m[4] + ')"' + (m[5] < 1 ? ' opacity="' + m[5] + '"' : '') + '/>';
    if(m[0] === 'voile') return '<ellipse class="ca-brume ca-brume' + m[5] + '" cx="' + f(m[1]) + '" cy="' + f(m[2]) + '" rx="' + f(m[3]) + '" ry="' + f(m[4]) + '" fill="url(#' + p + 'bmV)" style="animation-delay:-' + m[6] + 's"/>';
    var q = rectMur(m[1]);
    return '<rect x="' + q[0] + '" y="' + q[1] + '" width="' + q[2] + '" height="' + q[3] + '" fill="url(#' + p + 'mur-' + m[1] + ')"/>';
  }).join('');
}

/* ---------- La liste en image (le jeu) ---------- */
function rvb(c, a){ c = c.replace('#', ''); return 'rgba(' + parseInt(c.slice(0, 2), 16) + ',' + parseInt(c.slice(2, 4), 16) + ',' + parseInt(c.slice(4, 6), 16) + ',' + a + ')'; }
function peindre(ctx, L){
  L.forEach(function(m){
    var g, d;
    ctx.globalAlpha = 1;
    if(m[0] === 'coeur'){
      var x = m[1], y = m[2], l = m[3], h = m[4], c = Math.min(50, l / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + c, y); ctx.lineTo(x + l - c, y); ctx.arcTo(x + l, y, x + l, y + c, c); ctx.lineTo(x + l, y + h - c); ctx.arcTo(x + l, y + h, x + l - c, y + h, c);
      ctx.lineTo(x + c, y + h); ctx.arcTo(x, y + h, x, y + h - c, c); ctx.lineTo(x, y + c); ctx.arcTo(x, y, x + c, y, c); ctx.closePath();
      ctx.fillStyle = PLEIN; ctx.fill();
      ctx.globalAlpha = .5; ctx.strokeStyle = PLEIN; ctx.lineWidth = 44; ctx.stroke();
    } else if(m[0] === 'rond'){
      d = DEGRADES[m[4]];
      var gx = m[1] - m[3] + d.c[0] * 2 * m[3], gy = m[2] - m[3] + d.c[1] * 2 * m[3];
      g = ctx.createRadialGradient(gx, gy, 0, gx, gy, d.c[2] * 2 * m[3]);
      d.s.forEach(function(q){ g.addColorStop(q[0], rvb(q[1], q[2])); });
      ctx.globalAlpha = m[5]; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(m[1], m[2], m[3], 0, Math.PI * 2); ctx.fill();
    } else if(m[0] === 'voile'){
      d = DEGRADES.bmV;
      ctx.save(); ctx.translate(m[1], m[2]); ctx.scale(m[3], m[4]);
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      d.s.forEach(function(q){ g.addColorStop(q[0], rvb(q[1], q[2])); });
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else {
      var q0 = rectMur(m[1]), k = m[1];
      g = k === 'h' ? ctx.createLinearGradient(0, 0, 0, E_MUR) : k === 'b' ? ctx.createLinearGradient(0, H, 0, H - E_MUR) : k === 'g' ? ctx.createLinearGradient(0, 0, E_MUR, 0) : ctx.createLinearGradient(W, 0, W - E_MUR, 0);
      MUR_S.forEach(function(q){ g.addColorStop(q[0], rvb(q[1], q[2])); });
      ctx.fillStyle = g; ctx.fillRect(q0[0], q0[1], q0[2], q0[3]);
    }
  });
  ctx.globalAlpha = 1;
}
/* La toile de la brume, pour ces zones levées et ce voile de lumière ({haut:[couleur, force], bas:[couleur, force]} : le moment de la journée).
   Peinte une seule fois, puis gardée : c'est toujours le même <canvas> qu'on repose dans la carte (carte.js, poserBrume) — on n'en fabrique pas
   un à chaque affichage (un téléphone finit par refuser d'en créer).
   ECH : la toile fait 1200 × 800 pour un monde de 3000 × 2000. Le voile de lumière est posé sur la brume seulement (« source-atop ») : le dessin
   du village, dessous, a déjà le sien. */
var ECH = .4, TOILES = [], MAX_TOILES = 5;
function toileBrume(levees, voile){
  if(typeof document === 'undefined') return null;
  var levee = {}; (levees || []).forEach(function(id){ levee[id] = true; });
  var cle = ZONES.map(function(z){ return levee[z.id] ? z.id : ''; }).join(',') + '|' + (voile ? voile.haut.join(',') + ',' + voile.bas.join(',') : '');
  for(var i = 0; i < TOILES.length; i++) if(TOILES[i].cle === cle){ var t = TOILES.splice(i, 1)[0]; TOILES.push(t); return t.toile; }
  var c = document.createElement('canvas'), ctx;
  c.width = Math.round(W * ECH); c.height = Math.round(H * ECH);
  try{ ctx = c.getContext('2d'); }catch(e){ ctx = null; }
  if(!ctx) return null;
  ctx.setTransform(ECH, 0, 0, ECH, 0, 0);
  ZONES.forEach(function(z, k){ if(!levee[z.id]) peindre(ctx, zone(z, k, false, levee)); });
  peindre(ctx, mur());
  if(voile){
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    var g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, rvb(voile.haut[0], voile.haut[1])); g.addColorStop(1, rvb(voile.bas[0], voile.bas[1]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';
  }
  c.className = 'ca-fond ca-nuages';
  c.setAttribute('aria-hidden', 'true');
  TOILES.push({cle: cle, toile: c});
  while(TOILES.length > MAX_TOILES){ var vieux = TOILES.shift().toile; if(vieux.parentNode) vieux.parentNode.removeChild(vieux); vieux.width = vieux.height = 0; }
  return c;
}

var B = Monde.B = {ZONES: ZONES, VILLAGE: VILLAGE, D_BRUME: D_BRUME, distVillage: distVillage, defs: defs, zone: zone, mur: mur, ecrire: ecrire, peindre: peindre};
Monde.toileBrume = toileBrume;

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
Monde.defs = function(p){ return T.defs(p) + defs(p); };
/* p : le préfixe des dégradés du monde ; pv : celui de la carte du village.
   o.brume : la liste des zones dont la brume est levée (rien : toute la brume) ; o.riviere === 'rouge' ; o.etiquette : la taille des étiquettes ;
   o.maquette : la page du modèle (tout est là, rangé par zone, et la page montre ou cache ; la brume y est un dessin).
   Rend aussi « vu » : les rectangles du monde où l'on voit quelque chose (le village et ses abords, jusqu'où la brume devient pleine, et les
   zones levées). Ailleurs, sous la brume pleine, carte.js ne fait rien peindre du tout. */
Monde.assembler = function(p, pv, o){
  o = o || {};
  var maq = !!o.maquette, levee = {}, part = {}, avant = {};
  (o.brume || []).forEach(function(id){ levee[id] = true; });
  /* o.part (12 novembre, Bible §13.25) : les zones qu'on vient de lever, dont la brume s'en va sous les yeux du joueur. Elles comptent comme
     levées (leurs lieux et leurs noms sont dessinés, la toile de la brume ne les a plus) ; « partAvant » dit quelles zones étaient levées juste
     avant : carte.js pose par-dessus la toile de la brume d'avant, qui s'efface (carte.css, .ca-brume-part). */
  (o.part || []).forEach(function(id){ if(levee[id]) part[id] = true; });
  Object.keys(levee).forEach(function(id){ if(!part[id]) avant[id] = true; });
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
  /* la brume en dessin : pour la page du modèle seulement (dans le jeu, c'est une image : toileBrume) */
  var brume = '';
  if(maq) brume = ZONES.map(function(z, i){
    return '<g class="bm-zone" data-zone="' + z.id + '" style="transform-origin:' + f((z.r[0] + z.r[2]) / 2) + 'px ' + f((z.r[1] + z.r[3]) / 2) + 'px">' + ecrire(p, zone(z, i, true, levee)) +
      '<rect class="bm-hit" x="' + z.r[0] + '" y="' + z.r[1] + '" width="' + (z.r[2] - z.r[0]) + '" height="' + (z.r[3] - z.r[1]) + '" fill="#fff" fill-opacity="0"/></g>';
  }).join('') + '<g class="bm-mur" pointer-events="none">' + ecrire(p, mur()) + '</g>';
  /* là où l'on voit quelque chose : autour du village, jusqu'où la brume est pleine ; et les zones levées, un peu élargies (le bord doux des voisines) */
  var D = D_BRUME + 40, vu = [[VILLAGE[0] - D, VILLAGE[1] - D, VILLAGE[2] + D, VILLAGE[3] + D]];
  ZONES.forEach(function(z){ if(levee[z.id]) vu.push([z.r[0] - 150, z.r[1] - 150, z.r[2] + 150, z.r[3] + 150]); });
  vu = vu.map(function(q){ return [Math.max(0, q[0]), Math.max(0, q[1]), Math.min(W, q[2]), Math.min(H, q[3])]; });
  return {
    partAvant: (!maq && Object.keys(part).length) ? ZONES.filter(function(z){ return avant[z.id]; }).map(function(z){ return z.id; }) : null,
    sol: '<g class="mo-sol">' + T.sol(p, pv, {riviere: o.riviere, sansVives: !maq, voit: function(zi){ return zi < 0 || maq || !!levee[ZONES[zi].id]; }}) + '</g>',
    vives: T.eauxVives(p, pv, {riviere: o.riviere}),   /* le ruisseau et la rivière du village, qui coulent (carte.js les pose dans le dessin du village) */
    dessus: '<g class="mo-dessus">' + dessus + '</g>',
    brume: '<g class="mo-brume">' + brume + '</g>',
    etiquettes: '<g class="mo-etiqs" pointer-events="none">' + etiq + '</g>',
    vu: vu,
    levees: ZONES.filter(function(z){ return levee[z.id]; }).map(function(z){ return z.id; })
  };
};
})();
