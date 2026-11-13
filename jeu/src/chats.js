/* ==========================================================
   Brumeval — les sept chats d'Odette, et leurs traces de pattes (enquête 3 ; Romain, 13 novembre)

   « Pour le Sage, quand il reçoit le carnet avec les sept chats, il faut qu'il y ait, écrit avec l'écriture d'Odette, la description
   avec un petit dessin des sept chats, et avec aussi leurs traces de pas. Et il ne faut pas de code pour le Pisteur : juste un carnet
   avec les trucs d'Odette, et c'est tout. Pour qu'ils le disent à l'oral au Pisteur, que c'est les pattes à six doigts. »

   UNE SEULE SOURCE pour deux endroits :
   · le Grand Livre du Sage (livre.js, la page « Le carnet d'Odette », type 'carnet') : chaque chat, son portrait, ce qu'Odette en
     dit, et le dessin de sa trace ;
   · le mini-jeu du Pisteur « Suivre les traces de Moustache » (mj-pistage.js) : les mêmes traces, par terre, en tout petit.
   Le Pisteur ne sait pas laquelle est celle de Moustache : c'est le Sage qui le lui dit, à voix haute.

   Chaque trace doit se reconnaître MÊME TOUTE PETITE (Romain : « même en petit, on arrive à reconnaître les traces des chats ; s'il
   faut, tu éloignes un peu les coussinets ») : ce qui change d'un chat à l'autre, c'est le NOMBRE de doigts (3, 4, 5 ou 6), la taille,
   les griffes, la forme du gros coussinet (rond, en cœur) et l'écart des doigts. Les doigts sont de petits ronds bien séparés.

   CHATS.liste : [{id, nom, robe, dit (les mots d'Odette), trace:{doigts, k (taille), griffes, coussin, ecart}}]
   CHATS.dessiner(ctx, id, x, y, angle, taille, couleur, alpha)   une trace sur un canevas (le mini-jeu)
   CHATS.traceSVG(id, taille, couleur)                             la même, en dessin (le carnet)
   CHATS.portraitSVG(id, taille)                                   le petit portrait du chat, au crayon de couleur (le carnet)
   ========================================================== */
(function(G){
'use strict';
var K = '#24182e';
var LISTE = [
  /* le gros gris à six doigts : celui qu'on cherche */
  {id:'moustache', nom:'Moustache', robe:{c:'#8d93a6', c2:'#b9bece', yeux:'#e8c24a', gros:1.18},
    dit:'Mon gros gris, mon malin. Six doigts à chaque patte : il ouvre toutes les portes !',
    trace:{doigts:6, k:1.12, coussin:'rond', ecart:1}},
  {id:'biscotte', nom:'Biscotte', robe:{c:'#e9d3a6', c2:'#f6e9c9', yeux:'#6fae5a', gros:.8},
    dit:'La plus petite de tous. Des pattes de souris : on les voit à peine !',
    trace:{doigts:4, k:.62, coussin:'rond', ecart:1}},
  {id:'pompon', nom:'Pompon', robe:{c:'#f4f1ea', c2:'#ffffff', yeux:'#5aa0d8', gros:1.08, poilu:true},
    dit:'Tout blanc, tout rond. Il a perdu un doigt dans une bagarre : il lui en reste trois.',
    trace:{doigts:3, k:1, coussin:'rond', ecart:1.15}},
  {id:'caramel', nom:'Caramel', robe:{c:'#d98a3d', c2:'#f0b66e', yeux:'#7cc06a', gros:1, raies:'#b0652a'},
    dit:'Mon rouquin. Il ne rentre jamais ses griffes : gare aux rideaux !',
    trace:{doigts:4, k:1, coussin:'rond', ecart:1, griffes:true}},
  {id:'mistigri', nom:'Mistigri', robe:{c:'#2f2a3a', c2:'#4a4458', yeux:'#f0d048', gros:1},
    dit:'Noir comme la suie. Regarde sous sa patte : son coussinet a la forme d\'un cœur.',
    trace:{doigts:4, k:1, coussin:'coeur', ecart:1}},
  /* presque Moustache : il faut bien compter */
  {id:'noisette', nom:'Noisette', robe:{c:'#8a5a3a', c2:'#b98458', yeux:'#d8b04a', gros:1.02},
    dit:'Ma brune. Cinq doigts : presque comme Moustache… presque !',
    trace:{doigts:5, k:1.06, coussin:'rond', ecart:1}},
  {id:'grisette', nom:'Grisette', robe:{c:'#9aa0b0', c2:'#c4c8d4', yeux:'#7cc06a', gros:.9, fine:true},
    dit:'Grise comme Moustache, mais fine comme un fil. Ses doigts sont tout écartés, en éventail.',
    trace:{doigts:4, k:.9, coussin:'rond', ecart:1.55}}
];
var PAR = {}; LISTE.forEach(function(c){ PAR[c.id] = c; });

/* ---------- la géométrie d'une trace, dans un carré de −1 à 1 (la patte pointe vers le haut : −y) ----------
   Le gros coussinet en bas, les doigts en arc au-dessus, bien détachés (un vide net entre deux doigts, pour qu'on puisse les compter
   même quand la trace fait 25 points d'écran). */
function geometrie(id){
  var T = (PAR[id] || LISTE[0]).trace, n = T.doigts, e = T.ecart || 1, l = [];
  /* l'arc des doigts : d'autant plus large qu'il y a de doigts */
  var ouvert = (n >= 6 ? 150 : n === 5 ? 132 : n === 4 ? 112 : 92) * Math.min(1.25, e) * Math.PI / 180;
  var rayon = (n >= 6 ? .78 : n === 5 ? .74 : .7) * (e > 1.3 ? 1.12 : 1);
  var rd = n >= 6 ? .165 : n === 5 ? .185 : n === 3 ? .23 : .21;
  for(var i = 0; i < n; i++){
    var a = n === 1 ? 0 : -ouvert / 2 + ouvert * i / (n - 1);
    /* les doigts du milieu sont un peu plus hauts (une vraie patte) */
    var r = rayon * (1 + .06 * Math.cos(a * 1.4));
    l.push({x:Math.sin(a) * r, y:.22 - Math.cos(a) * r, r:rd, a:a});
  }
  return {doigts:l, coussin:T.coussin, griffes:!!T.griffes, k:T.k || 1};
}
var GEO = {}; LISTE.forEach(function(c){ GEO[c.id] = geometrie(c.id); });

/* ---------- sur un canevas (le mini-jeu) : (x, y) le centre, angle : où va le chat (0 = vers le haut), taille : la demi-largeur ---------- */
function dessiner(ctx, id, x, y, angle, taille, couleur, alpha){
  var g = GEO[id] || GEO.moustache, s = taille * g.k, i, d;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle); ctx.scale(s, s);
  if(alpha != null) ctx.globalAlpha = alpha;
  ctx.fillStyle = couleur || '#fffdf4';
  /* le gros coussinet */
  ctx.beginPath();
  if(g.coussin === 'coeur'){
    ctx.moveTo(0, .78); ctx.bezierCurveTo(-.62, .5, -.62, .02, -.3, .02); ctx.bezierCurveTo(-.12, .02, 0, .16, 0, .26);
    ctx.bezierCurveTo(0, .16, .12, .02, .3, .02); ctx.bezierCurveTo(.62, .02, .62, .5, 0, .78);
  } else {
    ctx.moveTo(0, .12); ctx.bezierCurveTo(.3, .1, .5, .34, .44, .58); ctx.bezierCurveTo(.4, .76, .16, .74, 0, .68);
    ctx.bezierCurveTo(-.16, .74, -.4, .76, -.44, .58); ctx.bezierCurveTo(-.5, .34, -.3, .1, 0, .12);
  }
  ctx.fill();
  for(i = 0; i < g.doigts.length; i++){
    d = g.doigts[i];
    ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r * .86, d.r * 1.12, d.a, 0, 6.2832); ctx.fill();
    if(g.griffes){   /* une petite pointe détachée, devant chaque doigt */
      var gx = d.x + Math.sin(d.a) * d.r * 2.1, gy = d.y - Math.cos(d.a) * d.r * 2.1;
      ctx.beginPath(); ctx.moveTo(gx + Math.sin(d.a) * .15, gy - Math.cos(d.a) * .15);
      ctx.lineTo(gx - Math.cos(d.a) * .06, gy - Math.sin(d.a) * .06); ctx.lineTo(gx + Math.cos(d.a) * .06, gy + Math.sin(d.a) * .06); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}
function f(n){ return (Math.round(n * 100) / 100).toString(); }
/* ---------- la même trace, en dessin (le carnet du Sage) ---------- */
function traceSVG(id, taille, couleur){
  var g = GEO[id] || GEO.moustache, c = couleur || '#3a2c1c', s = '', t = taille || 64;
  if(g.coussin === 'coeur') s += '<path d="M0,.78 C-.62,.5 -.62,.02 -.3,.02 C-.12,.02 0,.16 0,.26 C0,.16 .12,.02 .3,.02 C.62,.02 .62,.5 0,.78 Z"/>';
  else s += '<path d="M0,.12 C.3,.1 .5,.34 .44,.58 C.4,.76 .16,.74 0,.68 C-.16,.74 -.4,.76 -.44,.58 C-.5,.34 -.3,.1 0,.12 Z"/>';
  g.doigts.forEach(function(d){
    s += '<ellipse cx="' + f(d.x) + '" cy="' + f(d.y) + '" rx="' + f(d.r * .86) + '" ry="' + f(d.r * 1.12) + '" transform="rotate(' + f(d.a * 180 / Math.PI) + ' ' + f(d.x) + ' ' + f(d.y) + ')"/>';
    if(g.griffes){
      var gx = d.x + Math.sin(d.a) * d.r * 2.1, gy = d.y - Math.cos(d.a) * d.r * 2.1;
      s += '<path d="M' + f(gx + Math.sin(d.a) * .15) + ',' + f(gy - Math.cos(d.a) * .15) + ' L' + f(gx - Math.cos(d.a) * .06) + ',' + f(gy - Math.sin(d.a) * .06) + ' L' + f(gx + Math.cos(d.a) * .06) + ',' + f(gy + Math.sin(d.a) * .06) + ' Z"/>';
    }
  });
  /* (la taille du dessin suit celle de la patte : Biscotte est toute petite, Moustache un peu plus gros) */
  return '<svg class="ch-trace" viewBox="-1.25 -1.25 2.5 2.5" width="' + t + '" height="' + t + '" aria-hidden="true"><g fill="' + c + '" transform="scale(' + f(g.k) + ')">' + s + '</g></svg>';
}
/* ---------- le petit portrait d'un chat, assis, de face (le carnet) ---------- */
function portraitSVG(id, taille){
  var C = PAR[id] || LISTE[0], R = C.robe, t = taille || 72, g = R.gros || 1, s = '';
  var w = (R.fine ? 13 : 17) * g, h = 20 * g, cy = 30 - h * .1;
  /* la queue, le corps, la tête, les oreilles */
  s += '<path d="M' + f(w * .7) + ',40 C' + f(w + 12) + ',40 ' + f(w + 13) + ',26 ' + f(w + 6) + ',24" fill="none" stroke="' + K + '" stroke-width="6.4" stroke-linecap="round"/><path d="M' + f(w * .7) + ',40 C' + f(w + 12) + ',40 ' + f(w + 13) + ',26 ' + f(w + 6) + ',24" fill="none" stroke="' + R.c + '" stroke-width="4" stroke-linecap="round"/>';
  s += '<ellipse cx="0" cy="' + f(cy + 4) + '" rx="' + f(w) + '" ry="' + f(h * .78) + '" fill="' + R.c + '" stroke="' + K + '" stroke-width="2.2"/>';
  s += '<ellipse cx="0" cy="' + f(cy + 9) + '" rx="' + f(w * .55) + '" ry="' + f(h * .5) + '" fill="' + R.c2 + '" opacity=".85"/>';
  if(R.raies) s += '<path d="M' + f(-w * .8) + ',' + f(cy) + ' l5,2 M' + f(-w * .9) + ',' + f(cy + 6) + ' l5,1.4 M' + f(w * .8) + ',' + f(cy) + ' l-5,2 M' + f(w * .9) + ',' + f(cy + 6) + ' l-5,1.4" stroke="' + R.raies + '" stroke-width="2" stroke-linecap="round"/>';
  var ty = cy - h * .78, tr = 11.5 * (R.fine ? .9 : 1) * Math.min(1.1, g);
  s += '<path d="M' + f(-tr * .95) + ',' + f(ty - 2) + ' L' + f(-tr * .9) + ',' + f(ty - tr * 1.5) + ' L' + f(-tr * .2) + ',' + f(ty - tr * .75) + ' Z M' + f(tr * .95) + ',' + f(ty - 2) + ' L' + f(tr * .9) + ',' + f(ty - tr * 1.5) + ' L' + f(tr * .2) + ',' + f(ty - tr * .75) + ' Z" fill="' + R.c + '" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/>';
  s += '<path d="M' + f(-tr * .74) + ',' + f(ty - tr * .98) + ' L' + f(-tr * .72) + ',' + f(ty - tr * 1.22) + ' L' + f(-tr * .42) + ',' + f(ty - tr * .82) + ' Z M' + f(tr * .74) + ',' + f(ty - tr * .98) + ' L' + f(tr * .72) + ',' + f(ty - tr * 1.22) + ' L' + f(tr * .42) + ',' + f(ty - tr * .82) + ' Z" fill="#f4a9b4"/>';
  s += '<ellipse cx="0" cy="' + f(ty) + '" rx="' + f(tr * (R.poilu ? 1.14 : 1.04)) + '" ry="' + f(tr * .9) + '" fill="' + R.c + '" stroke="' + K + '" stroke-width="2.2"/>';
  if(R.raies) s += '<path d="M-2.4,' + f(ty - tr * .84) + ' v3.4 M0,' + f(ty - tr * .88) + ' v4 M2.4,' + f(ty - tr * .84) + ' v3.4" stroke="' + R.raies + '" stroke-width="1.5" stroke-linecap="round"/>';
  s += '<ellipse cx="0" cy="' + f(ty + tr * .34) + '" rx="' + f(tr * .5) + '" ry="' + f(tr * .36) + '" fill="' + R.c2 + '" opacity=".9"/>';
  /* les yeux, le nez, les moustaches */
  s += '<ellipse cx="' + f(-tr * .42) + '" cy="' + f(ty - tr * .08) + '" rx="2.5" ry="3" fill="' + R.yeux + '" stroke="' + K + '" stroke-width="1"/><ellipse cx="' + f(tr * .42) + '" cy="' + f(ty - tr * .08) + '" rx="2.5" ry="3" fill="' + R.yeux + '" stroke="' + K + '" stroke-width="1"/>';
  s += '<ellipse cx="' + f(-tr * .42) + '" cy="' + f(ty - tr * .08) + '" rx=".8" ry="2.3" fill="' + K + '"/><ellipse cx="' + f(tr * .42) + '" cy="' + f(ty - tr * .08) + '" rx=".8" ry="2.3" fill="' + K + '"/>';
  s += '<path d="M-1.6,' + f(ty + tr * .22) + ' h3.2 l-1.6,1.9 Z" fill="#e0788a" stroke="' + K + '" stroke-width=".7" stroke-linejoin="round"/>';
  var my = ty + tr * .4, ml = id === 'moustache' ? 1.5 : 1;   /* (Moustache porte bien son nom) */
  s += '<path d="M-3,' + f(my) + ' l' + f(-9 * ml) + ',-2 M-3,' + f(my + 1.6) + ' l' + f(-9 * ml) + ',1.4 M3,' + f(my) + ' l' + f(9 * ml) + ',-2 M3,' + f(my + 1.6) + ' l' + f(9 * ml) + ',1.4" stroke="' + (id === 'mistigri' ? '#d8d2e6' : K) + '" stroke-width=".9" stroke-linecap="round" opacity=".85"/>';
  /* les pattes de devant */
  s += '<ellipse cx="' + f(-w * .34) + '" cy="' + f(cy + h * .78) + '" rx="4.4" ry="3.2" fill="' + R.c2 + '" stroke="' + K + '" stroke-width="1.8"/><ellipse cx="' + f(w * .34) + '" cy="' + f(cy + h * .78) + '" rx="4.4" ry="3.2" fill="' + R.c2 + '" stroke="' + K + '" stroke-width="1.8"/>';
  return '<svg class="ch-portrait" viewBox="-34 -22 68 72" width="' + t + '" height="' + Math.round(t * 72 / 68) + '" aria-hidden="true">' + s + '</svg>';
}
G.CHATS = {liste:LISTE, par:PAR, geometrie:geometrie, dessiner:dessiner, traceSVG:traceSVG, portraitSVG:portraitSVG};
})(window);
