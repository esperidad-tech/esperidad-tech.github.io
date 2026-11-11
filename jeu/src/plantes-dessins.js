/* ==========================================================
   Brumeval — les dessins de l'établi des plantes (enquête 3 ; plantes.js ; E3-atelier-des-plantes.md).

   · Les sept plantes, dessinées entières (un dessin de 260 × 320), chacune avec TROIS parties qu'on peut toucher :
     <g class="pl-pa" data-pa="feuilles">. Les vraies plantes : l'oseille (ses feuilles en fer de flèche, sa tige de petites fleurs
     rouges), le souci (ses fleurs orange), la mélisse (sa tige carrée, ses feuilles dentelées deux par deux), le lin (ses fleurs
     bleues, ses capsules rondes pleines de graines), le pied-de-loup (un lycopode : il rampe, et porte des épis jaunes),
     la vesse-de-loup (blanche quand elle est jeune, brune et trouée quand elle est mûre), le gui (ses feuilles deux par deux,
     ses baies blanches, sur une branche de pommier).
   · Les onze outils (un dessin de 100 × 100 chacun), toujours les mêmes, aux mêmes places : la planche et son couteau, le tamis,
     le mortier, la presse, le linge, la marmite sur son réchaud, les allumettes, l'alambic, la coupelle à la fenêtre, la cruche
     d'eau, les fioles vides. .pl-mat : ce qu'on y a mis (sa couleur : --mat) ; .pl-flammes : le feu, quand ça chauffe.
   · PLD.fiole(couleur) : une fiole pleine (l'étagère des sept potions).
   Rien que des dessins : pas de règles ici.
   ========================================================== */
(function(){
'use strict';
var K = '#24182e';
function f1(x){ return Math.round(x * 10) / 10; }
function st(sw){ return ' stroke="' + K + '" stroke-width="' + (sw || 3) + '" stroke-linejoin="round" stroke-linecap="round"'; }
function P(d, f, sw, x){ return '<path d="' + d + '" fill="' + (f || 'none') + '"' + st(sw) + (x || '') + '/>'; }
function L(d, c, sw, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
function LL(d, c, sw){ return L(d, K, sw + 3.5) + L(d, c, sw); }      /* un trait de couleur cerné de noir (une tige) */
function C(cx, cy, r, f, sw){ return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + r + '" fill="' + f + '"' + (sw === 0 ? '' : st(sw || 2.5)) + '/>'; }
function E(cx, cy, rx, ry, f, sw, x){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (sw === 0 ? '' : st(sw || 2.5)) + (x || '') + '/>'; }
function R(x, y, w, h, r, f, sw){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r || 0) + '" fill="' + f + '"' + (sw === 0 ? '' : st(sw || 2.5)) + '/>'; }
function G(t, s){ return '<g transform="' + t + '">' + s + '</g>'; }
/* une zone qu'on touche (invisible), pour que le doigt trouve la partie sans viser */
function Z(x, y, w, h){ return '<rect class="pl-z" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14"/>'; }
function ZC(cx, cy, r){ return '<circle class="pl-z" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; }
function partie(id, nom, s){ return '<g class="pl-pa" data-pa="' + id + '" role="button" tabindex="0" aria-label="' + nom + '">' + s + '</g>'; }
/* un point sur une courbe (4 points) */
function bez(a, t){
  var u = 1 - t;
  return [u * u * u * a[0] + 3 * u * u * t * a[2] + 3 * u * t * t * a[4] + t * t * t * a[6], u * u * u * a[1] + 3 * u * u * t * a[3] + 3 * u * t * t * a[5] + t * t * t * a[7]];
}
function courbe(a){ return 'M' + a[0] + ',' + a[1] + ' C' + a[2] + ',' + a[3] + ' ' + a[4] + ',' + a[5] + ' ' + a[6] + ',' + a[7]; }
function sol(y, x0, x1){
  var s = L('M' + x0 + ',' + y + ' H' + x1, '#8a6a44', 4), i;
  for(i = x0 + 14; i < x1 - 6; i += 34) s += L('M' + i + ',' + y + ' l-4,-9 M' + (i + 3) + ',' + y + ' l1,-11 M' + (i + 6) + ',' + y + ' l5,-8', '#6aa84f', 2.2);
  return s;
}

/* ---------------------------------------------------------- L'oseille ---------------------------------------------------------- */
function oseille(){
  var feuille = L('M0,0 L0,-46', '#3f8f4f', 5) +
    P('M0,-122 C16,-100 21,-72 15,-52 L23,-34 L7,-44 L0,-41 L-7,-44 L-23,-34 L-15,-52 C-21,-72 -16,-100 0,-122 Z', '#62b24c', 3) +
    L('M0,-44 L0,-108 M0,-62 l-9,-9 M0,-62 l9,-9 M0,-80 l-8,-8 M0,-80 l8,-8 M0,-96 l-5,-6 M0,-96 l5,-6', '#3f8f4f', 1.8);
  var fe = '';
  [[-68, 0.86], [-38, 1.04], [38, 1.04], [68, 0.86], [-12, 0.62]].forEach(function(a){ fe += G('translate(130 258) rotate(' + a[0] + ') scale(' + a[1] + ')', feuille); });
  /* la tige de fleurs : toute rouge, avec de petites grappes */
  /* (le bas de la tige passe entre les feuilles : il ne se touche pas, pour ne pas prendre les fleurs en visant une feuille) */
  var pied = '<g class="pl-decor">' + LL('M130,258 C128,226 129,196 130,168', '#b0563e', 4) + '</g>';
  var ha = LL('M130,168 C131,120 131,70 130,34', '#b0563e', 4), br = [[150, -1, 26], [124, 1, 28], [98, -1, 24], [76, 1, 22], [56, -1, 16], [44, 1, 12]];
  br.forEach(function(b){
    var y = b[0], s = b[1], n = b[2], x1 = 130 + s * n, y1 = y - n * 0.9;
    ha += L('M130,' + y + ' Q' + (130 + s * n * 0.5) + ',' + (y - 2) + ' ' + x1 + ',' + y1, '#b0563e', 2.6);
    for(var t = 0.35; t <= 1.01; t += 0.22){
      var px = 130 + s * n * t, py = y - n * 0.9 * t * t - 1;
      ha += C(px, py - 3, 4.4, t > 0.7 ? '#e0705a' : '#c9483f', 1.5) + C(px + s * 4, py + 3, 3.6, '#d95a48', 1.5);
    }
  });
  ha += C(130, 30, 4.6, '#e0705a', 1.5) + C(125, 38, 3.8, '#c9483f', 1.5) + C(135, 40, 3.8, '#d95a48', 1.5);
  var ra = P('M121,258 C119,286 126,304 130,318 C134,304 141,286 139,258 Z', '#d2a878', 3) + L('M123,278 q-13,4 -19,13 M137,284 q11,4 17,12 M127,300 q-9,5 -11,12', '#a57c50', 2.2);
  return sol(258, 22, 238) +
    partie('racine', 'La racine', Z(96, 262, 68, 58) + ra) +
    partie('feuilles', 'Les feuilles', fe) + pied +
    partie('hampe', 'La tige de petites fleurs rouges', Z(98, 22, 64, 140) + ha);
}

/* ---------------------------------------------------------- Le souci ---------------------------------------------------------- */
function fleurSouci(cx, cy, r){
  var s = '', i;
  for(i = 0; i < 16; i++) s += '<ellipse cx="' + cx + '" cy="' + f1(cy - r * 0.62) + '" rx="' + f1(r * 0.16) + '" ry="' + f1(r * 0.4) + '" fill="#ff9a1f" stroke="' + K + '" stroke-width="1.8" transform="rotate(' + f1(i * 22.5) + ' ' + cx + ' ' + cy + ')"/>';
  for(i = 0; i < 12; i++) s += '<ellipse cx="' + cx + '" cy="' + f1(cy - r * 0.42) + '" rx="' + f1(r * 0.13) + '" ry="' + f1(r * 0.28) + '" fill="#ffb93a" stroke="' + K + '" stroke-width="1.4" transform="rotate(' + (i * 30 + 15) + ' ' + cx + ' ' + cy + ')"/>';
  return s + C(cx, cy, f1(r * 0.27), '#c9641a', 2) + C(cx - r * 0.08, cy - r * 0.06, 1.6, '#7a3a10', 0) + C(cx + r * 0.1, cy + r * 0.04, 1.6, '#7a3a10', 0) + C(cx, cy + r * 0.12, 1.4, '#7a3a10', 0);
}
function souci(){
  var feuille = P('M0,0 C-13,-14 -14,-46 0,-62 C14,-46 13,-14 0,0 Z', '#6cba55', 2.6) + L('M0,-4 L0,-52', '#3f8f4f', 1.8);
  var tiges = LL('M130,258 C128,220 124,170 120,116', '#4f9a4a', 5) + LL('M126,198 C150,186 176,170 188,150', '#4f9a4a', 4);
  var fe = '';
  [[128, 240, -74, 1], [128, 226, 70, 0.95], [125, 186, -62, 0.92], [123, 150, 58, 0.8], [156, 182, 118, 0.78], [121, 138, -50, 0.66]].forEach(function(a){
    fe += G('translate(' + a[0] + ' ' + a[1] + ') rotate(' + a[2] + ') scale(' + a[3] + ')', feuille);
  });
  var ra = L('M130,258 C128,274 120,290 112,304 M130,258 C132,278 138,294 148,308 M130,258 C130,280 129,296 131,316 M130,262 C120,270 108,274 98,284 M131,262 C142,270 152,276 162,288', '#b88a58', 3);
  return sol(258, 22, 238) +
    partie('racine', 'Les racines', Z(92, 262, 76, 58) + ra) +
    '<g class="pl-decor">' + tiges + '</g>' +
    partie('feuilles', 'Les feuilles', fe) +
    partie('fleurs', 'Les fleurs orange', ZC(118, 82, 46) + ZC(192, 128, 34) + fleurSouci(118, 82, 44) + fleurSouci(192, 128, 31));
}

/* ---------------------------------------------------------- La mélisse ---------------------------------------------------------- */
function feuilleMelisse(){
  /* une feuille ovale au bord en petites dents rondes, la pointe à droite */
  var haut = [], bas = [], n = 22, i;
  for(i = 0; i <= n; i++){
    var t = i / n, x = 64 * t, w = 25 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.85) * (1 - 0.18 * t);
    var d = (i > 0 && i < n) ? 2.6 * Math.abs(Math.sin(t * Math.PI * 8)) : 0;
    haut.push(f1(x) + ',' + f1(-(w + d))); bas.unshift(f1(x) + ',' + f1(w + d));
  }
  return P('M' + haut.join(' L') + ' L' + bas.join(' L') + ' Z', '#7cc46a', 2.4) +
    L('M2,0 H58 M14,0 l8,-12 M14,0 l8,12 M28,0 l8,-13 M28,0 l8,13 M42,0 l6,-9 M42,0 l6,9', '#3f8f4f', 1.6);
}
function melisse(){
  var fe = '', fl = '', F = feuilleMelisse();
  [[228, 1.16], [182, 1.02], [138, 0.86], [98, 0.7]].forEach(function(a){
    fe += G('translate(133 ' + a[0] + ') rotate(-16) scale(' + a[1] + ')', F) + G('translate(127 ' + a[0] + ') scale(-1 1) rotate(-16) scale(' + a[1] + ')', F);
  });
  /* de toutes petites fleurs blanches, en bouquets serrés, à la base des feuilles du haut */
  [[138, 1], [98, 0.9], [62, 0.8]].forEach(function(a){
    [-1, 1].forEach(function(s){
      fl += C(130 + s * 11, a[0] - 9, 5.2, '#fffdf2', 1.6) + C(130 + s * 19, a[0] - 16, 4.6, '#fffdf2', 1.6) + C(130 + s * 9, a[0] - 20, 4.4, '#fff6dc', 1.6) + C(130 + s * 11, a[0] - 9, 1.4, '#f2d86a', 0) + C(130 + s * 19, a[0] - 16, 1.3, '#f2d86a', 0);
    });
  });
  fl += G('translate(131 60) rotate(-62) scale(.42)', F) + G('translate(129 60) scale(-1 1) rotate(-62) scale(.42)', F);
  /* la tige : carrée (on voit son arête), et sa petite touffe de racines */
  var ti = L('M130,258 V46', K, 11) + L('M130,258 V46', '#8fcf7a', 7.5) + L('M131.5,256 V48', '#5aa652', 2.2) +
    L('M130,258 C126,274 118,286 110,296 M130,258 C133,276 140,288 150,298 M130,258 C130,276 129,290 131,304', '#b88a58', 3);
  return sol(258, 22, 238) +
    partie('tige', 'La tige', Z(108, 40, 44, 268) + ti) +
    partie('feuilles', 'Les feuilles', fe) +
    partie('fleurs', 'Les petites fleurs blanches', ZC(130, 122, 30) + ZC(130, 82, 28) + ZC(130, 46, 24) + fl);
}

/* ---------------------------------------------------------- Le lin ---------------------------------------------------------- */
function lin(){
  var T = [[130, 258, 112, 190, 80, 120, 66, 62], [130, 258, 124, 180, 116, 100, 112, 42], [130, 258, 138, 180, 148, 110, 152, 56], [130, 258, 152, 196, 182, 130, 198, 78]];
  var ti = '', fl = '', gr = '';
  T.forEach(function(a, k){
    ti += L(courbe(a), K, 6) + L(courbe(a), '#6aa84f', 3.2);
    for(var t = 0.14; t < 0.9; t += 0.115){
      var p = bez(a, t), q = bez(a, t + 0.02), ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI, s = (Math.round(t * 100) % 2) ? 1 : -1;
      ti += '<ellipse cx="9" cy="0" rx="10" ry="2.8" fill="#7cbf5c" stroke="' + K + '" stroke-width="1.3" transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ') rotate(' + f1(ang + s * 42) + ')"/>';
    }
  });
  ti += LL('M146,128 C158,120 166,116 172,108', '#6aa84f', 2.6);
  function fleur(cx, cy, r){
    var s = '', i;
    for(i = 0; i < 5; i++) s += '<path d="M0,0 C' + f1(-r * 0.62) + ',' + f1(-r * 0.5) + ' ' + f1(-r * 0.5) + ',' + f1(-r * 1.1) + ' 0,' + f1(-r * 1.08) + ' C' + f1(r * 0.5) + ',' + f1(-r * 1.1) + ' ' + f1(r * 0.62) + ',' + f1(-r * 0.5) + ' 0,0 Z" fill="#6ea8ff" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round" transform="translate(' + cx + ' ' + cy + ') rotate(' + (i * 72) + ')"/>' +
      '<path d="M0,-3 L0,' + f1(-r * 0.8) + '" stroke="#3f72d0" stroke-width="1.3" stroke-linecap="round" transform="translate(' + cx + ' ' + cy + ') rotate(' + (i * 72) + ')"/>';
    return s + C(cx, cy, f1(r * 0.24), '#ffe07a', 1.6);
  }
  function capsule(cx, cy){
    return P('M' + (cx - 11) + ',' + (cy + 7) + ' l-3,7 l8,-3 l6,6 l6,-6 l8,3 l-3,-7 Z', '#6aa84f', 1.8) + C(cx, cy, 11.5, '#d8b25e', 2.4) +
      P('M' + (cx - 3) + ',' + (cy - 10) + ' L' + cx + ',' + (cy - 17) + ' L' + (cx + 3) + ',' + (cy - 10) + ' Z', '#d8b25e', 1.8) +
      L('M' + cx + ',' + (cy - 10) + ' V' + (cy + 10) + ' M' + (cx - 5) + ',' + (cy - 9) + ' Q' + (cx - 8) + ',' + cy + ' ' + (cx - 5) + ',' + (cy + 9) + ' M' + (cx + 5) + ',' + (cy - 9) + ' Q' + (cx + 8) + ',' + cy + ' ' + (cx + 5) + ',' + (cy + 9), '#a57c34', 1.5);
  }
  fl = fleur(66, 60, 19) + fleur(152, 52, 17);
  gr = capsule(112, 36) + capsule(198, 70) + capsule(174, 100);
  return sol(258, 22, 238) +
    partie('tiges', 'Les tiges', Z(92, 128, 84, 130) + ti) +
    partie('fleurs', 'Les fleurs bleues', ZC(66, 60, 28) + ZC(152, 52, 25) + fl) +
    partie('graines', 'Les capsules rondes', ZC(112, 36, 22) + ZC(198, 70, 22) + ZC(174, 100, 20) + gr);
}

/* ---------------------------------------------------------- Le pied-de-loup (lycopode) ---------------------------------------------------------- */
function lycopode(){
  /* une tige toute hérissée de petites feuilles, comme une branche de sapin */
  function herisse(pts){
    var d = 'M' + pts.map(function(p){ return p[0] + ',' + p[1]; }).join(' L'), s = L(d, K, 14) + L(d, '#4f9a4a', 10), pic = '', i, k;
    for(i = 0; i < pts.length - 1; i++){
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n, pas = Math.max(2, Math.round(n / 6));
      for(k = 0; k <= pas; k++){
        var x = a[0] + dx * k / pas, y = a[1] + dy * k / pas, c = (k % 2) ? 1 : -1;
        pic += 'M' + f1(x) + ',' + f1(y) + ' l' + f1(ux * 5 - uy * c * 9) + ',' + f1(uy * 5 + ux * c * 9) + ' ';
      }
    }
    return L(pic, K, 3.4) + s + L(pic, '#7cc46a', 1.8);
  }
  var ti = herisse([[26, 252], [70, 246], [118, 252], [168, 244], [234, 250]]) + herisse([[80, 248], [74, 196], [70, 152]]) + herisse([[70, 152], [50, 118]]) + herisse([[70, 152], [90, 112]]) +
    herisse([[156, 246], [160, 190], [158, 144]]) + herisse([[158, 144], [138, 108]]) + herisse([[158, 144], [180, 104]]) + herisse([[208, 247], [216, 200]]);
  function epis(x, y, pen){
    var s = L('M' + x + ',' + y + ' l' + pen + ',-34', K, 5) + L('M' + x + ',' + y + ' l' + pen + ',-34', '#cfc66a', 2.4), bx = x + pen, by = y - 34;
    [-1, 1].forEach(function(c){
      s += L('M' + bx + ',' + by + ' l' + (c * 9) + ',-12', K, 4.4) + L('M' + bx + ',' + by + ' l' + (c * 9) + ',-12', '#cfc66a', 2);
      var cx = bx + c * 11, cy = by - 31;
      s += '<g transform="rotate(' + (c * 9) + ' ' + cx + ' ' + (cy + 18) + ')">' + E(cx, cy, 6.6, 20, '#f0dc7a', 2.2) +
        L('M' + (cx - 5) + ',' + (cy - 10) + ' l10,6 M' + (cx - 6) + ',' + (cy - 2) + ' l12,6 M' + (cx - 5) + ',' + (cy + 6) + ' l10,6 M' + (cx + 5) + ',' + (cy - 10) + ' l-10,6 M' + (cx + 6) + ',' + (cy - 2) + ' l-12,6 M' + (cx + 5) + ',' + (cy + 6) + ' l-10,6', '#c9a93a', 1.2) + '</g>';
    });
    return s;
  }
  var ep = epis(90, 112, 4) + epis(180, 104, -3);
  var ra = L('M52,254 q-3,14 -10,22 M52,254 q5,12 3,24 M104,254 q-2,16 -9,24 M104,254 q7,12 6,24 M150,252 q-4,14 -2,26 M196,252 q-3,14 -9,22 M196,252 q7,10 6,24 M226,254 q2,12 -2,20', '#b88a58', 2.6);
  return L('M14,256 H246', '#8a6a44', 4) +
    partie('racines', 'Les petites racines', Z(34, 258, 200, 34) + ra) +
    partie('tiges', 'Les tiges vertes', ti) +
    partie('epis', 'Les épis jaunes', Z(68, 26, 50, 90) + Z(152, 20, 52, 90) + ep);
}

/* ---------------------------------------------------------- La vesse-de-loup ---------------------------------------------------------- */
function vesse(){
  var terre = P('M26,236 H234 C236,272 204,304 130,308 C56,304 24,272 26,236 Z', '#7a5636', 3) + L('M52,262 h10 M188,268 h12 M96,290 h9 M160,292 h8 M74,246 h6 M206,248 h7', '#5e4028', 2.4);
  var fils = L('M104,238 C100,254 84,262 70,276 M104,238 C108,256 120,268 128,286 M104,238 C104,258 100,272 96,292 M190,238 C186,252 176,262 168,274 M190,238 C194,254 204,262 210,274 M128,286 q14,-6 26,2 M84,262 q-12,-2 -20,-10', K, 5) +
    L('M104,238 C100,254 84,262 70,276 M104,238 C108,256 120,268 128,286 M104,238 C104,258 100,272 96,292 M190,238 C186,252 176,262 168,274 M190,238 C194,254 204,262 210,274 M128,286 q14,-6 26,2 M84,262 q-12,-2 -20,-10', '#f6eedb', 2.4);
  /* la grosse, bien mûre : brune, un peu fripée, avec un trou tout en haut ; un brin de poussière s'en échappe déjà */
  var mure = P('M44,206 C28,150 62,112 104,112 C146,112 180,150 164,206 C156,232 128,238 104,238 C80,238 52,232 44,206 Z', '#b08a5c', 3) +
    '<path d="M58,214 C76,232 132,234 152,212 C148,228 128,235 104,235 C82,235 64,230 58,214 Z" fill="#8a6742" opacity=".7"/>' +
    L('M70,150 q8,10 4,22 M132,146 q-6,12 2,24 M98,176 q8,6 6,18 M56,186 q8,4 10,14 M146,184 q-8,6 -8,16', '#8a6742', 2) +
    E(104, 118, 12, 5.5, '#4a321e', 2.2) + L('M96,112 l-5,-8 M104,110 l0,-10 M112,112 l5,-8', '#4a321e', 1.8) +
    '<g fill="#7a5a3a" opacity=".55"><circle cx="100" cy="92" r="3"/><circle cx="112" cy="84" r="2.4"/><circle cx="96" cy="76" r="2"/><circle cx="108" cy="68" r="1.6"/></g>';
  /* la petite, toute jeune : blanche, couverte de petits picots */
  var jeune = P('M162,214 C156,186 172,172 190,172 C208,172 224,186 218,214 C214,232 204,238 190,238 C176,238 166,232 162,214 Z', '#f8f3e6', 3) +
    '<g fill="#d6cbb2"><circle cx="178" cy="188" r="2"/><circle cx="190" cy="182" r="2"/><circle cx="202" cy="188" r="2"/><circle cx="172" cy="202" r="2"/><circle cx="184" cy="198" r="2"/><circle cx="196" cy="198" r="2"/><circle cx="208" cy="202" r="2"/><circle cx="178" cy="214" r="2"/><circle cx="190" cy="212" r="2"/><circle cx="202" cy="214" r="2"/></g>';
  var herbe = L('M30,236 l-5,-12 M36,236 l2,-15 M42,236 l7,-11 M222,236 l-6,-11 M228,236 l1,-14 M234,236 l6,-10 M150,236 l-3,-9 M156,236 l4,-10', '#6aa84f', 2.6);
  return partie('fils', 'Les fils blancs, sous la terre', terre + fils) + herbe +
    partie('mure', 'La grosse boule brune', mure) +
    partie('jeune', 'La petite boule blanche', ZC(190, 206, 38) + jeune);
}

/* ---------------------------------------------------------- Le gui ---------------------------------------------------------- */
function gui(){
  var br = P('M10,262 C78,250 170,240 250,226 L254,258 C178,272 84,284 14,296 Z', '#8a5a36', 3) + L('M34,270 q30,-6 54,-6 M110,262 q28,-6 50,-6 M180,252 q24,-6 44,-6 M60,284 q22,-4 40,-4 M150,270 q20,-4 36,-4', '#6a4226', 2.2) +
    E(204, 244, 9, 6, '#6a4226', 2);
  /* ses rameaux se partagent toujours en deux, et portent leurs feuilles deux par deux */
  var N = {a:[130, 252], b:[102, 204], c:[158, 204], d:[72, 166], e:[110, 154], f:[150, 152], g:[190, 164], h:[52, 134], i:[78, 116], j:[100, 104], k:[126, 110], l:[146, 100], m:[170, 104], n:[188, 116], o:[212, 134]};
  var liens = [['a', 'b'], ['a', 'c'], ['b', 'd'], ['b', 'e'], ['c', 'f'], ['c', 'g'], ['d', 'h'], ['d', 'i'], ['e', 'j'], ['e', 'k'], ['f', 'l'], ['f', 'm'], ['g', 'n'], ['g', 'o']];
  var d = liens.map(function(l){ return 'M' + N[l[0]].join(',') + ' L' + N[l[1]].join(','); }).join(' ');
  var ram = L(d, K, 9) + L(d, '#a9c05a', 5.5);
  var feuille = P('M0,0 C-9,-11 -10,-34 0,-43 C10,-34 9,-11 0,0 Z', '#8fbf4a', 2.4) + L('M0,-6 V-36', '#6a9a34', 1.6);
  var fe = '';
  liens.slice(6).forEach(function(l){
    var p = N[l[0]], q = N[l[1]], ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI + 90;
    fe += G('translate(' + q[0] + ' ' + q[1] + ') rotate(' + f1(ang - 24) + ')', feuille) + G('translate(' + q[0] + ' ' + q[1] + ') rotate(' + f1(ang + 24) + ')', feuille);
  });
  function baies(x, y, n){
    var s = '', pos = [[-7, -3], [7, -2], [0, 8]];
    for(var i = 0; i < n; i++) s += C(x + pos[i][0], y + pos[i][1], 7.6, '#fbfaf0', 2.2) + C(x + pos[i][0] + 2, y + pos[i][1] + 2, 1.3, '#8a8a7a', 0);
    return s;
  }
  var ba = '', zo = '';
  [['b', 3], ['c', 3], ['d', 2], ['e', 3], ['f', 2], ['g', 3]].forEach(function(b){ ba += baies(N[b[0]][0], N[b[0]][1], b[1]); zo += ZC(N[b[0]][0], N[b[0]][1], 19); });
  return partie('branche', 'La branche de pommier', br) +
    '<g class="pl-decor">' + ram + '</g>' +
    partie('feuilles', 'Les feuilles', fe) +
    partie('baies', 'Les baies blanches', zo + ba);
}

/* ---------------------------------------------------------- Les onze outils ---------------------------------------------------------- */
function mat(s){ return '<g class="pl-mat">' + s + '</g>'; }
function tas(cx, cy, rx, ry){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="var(--mat,#8fbf4a)" stroke="' + K + '" stroke-width="2.2"/>' +
  '<ellipse cx="' + (cx - rx * 0.3) + '" cy="' + (cy - ry * 0.3) + '" rx="' + f1(rx * 0.3) + '" ry="' + f1(ry * 0.3) + '" fill="#fff" opacity=".35"/>'; }
function flammes(x, y, l){
  var s = '<g class="pl-flammes">', n = Math.max(2, Math.round(l / 12)), i;
  for(i = 0; i < n; i++){
    var fx = x + (i + 0.5) * l / n, h = (i % 2) ? 15 : 12;
    s += '<path d="M' + f1(fx - 5) + ',' + y + ' c-3,-' + f1(h * 0.5) + ' 1,-' + f1(h * 0.8) + ' 5,-' + h + ' c2,' + f1(h * 0.4) + ' 8,' + f1(h * 0.5) + ' 5,' + h + ' Z" fill="#ffc24a" stroke="#e8693c" stroke-width="1.8" stroke-linejoin="round"/>';
  }
  return s + '</g>';
}
var OUTILS = {
  couteau:function(){
    return R(5, 70, 88, 16, 6, '#d9a86a', 3) + C(84, 78, 2.6, '#9a6c3a', 0) + L('M16,78 h50', '#c4925a', 1.6) + mat(tas(58, 68, 18, 6)) +
      P('M32,60 L76,36 L82,45 L37,67 Z', '#e4ebf2', 2.6) + L('M40,60 L74,42', '#fff', 1.6) + P('M12,66 L30,57 L37,67 L19,77 Z', '#7a4a28', 2.6) + C(21, 69, 1.6, '#e8c98a', 0) + C(28, 65, 1.6, '#e8c98a', 0);
  },
  tamis:function(){
    return P('M10,56 V72 A40,14 0 0 0 90,72 V56 Z', '#b9773a', 3) + E(50, 56, 40, 14, '#d99a5a', 3) + E(50, 56, 33, 10.5, '#efe3c2', 2) +
      '<g clip-path="url(#pl-clip-tamis)">' + L('M20,50 l60,12 M20,56 l60,12 M20,44 l60,12 M20,62 l60,-12 M20,68 l60,-12 M20,56 l60,-12 M36,40 v32 M50,40 v32 M64,40 v32', '#b8a476', 1.2) + '</g>' +
      mat(tas(50, 55, 20, 6)) + L('M10,64 A40,14 0 0 0 90,64', '#8a5426', 1.8);
  },
  mortier:function(){
    return R(38, 82, 24, 6, 3, '#a8a0b8', 2.6) + P('M20,48 H80 C80,72 68,84 50,84 C32,84 20,72 20,48 Z', '#cfc8d8', 3) + E(50, 48, 30, 8, '#8f879f', 2.6) + mat(tas(50, 49, 20, 5)) +
      '<g transform="rotate(26 64 40)">' + R(59, 8, 11, 44, 5.5, '#e8dfca', 2.6) + '</g>' + L('M28,60 q4,12 12,18', '#fff', 2, ' opacity=".5"');
  },
  presse:function(){
    return R(12, 80, 76, 9, 3, '#94603a', 2.6) + R(19, 20, 9, 60, 2, '#7a4a28', 2.4) + R(72, 20, 9, 60, 2, '#7a4a28', 2.4) + R(12, 14, 76, 10, 3, '#94603a', 2.6) +
      R(45, 4, 10, 46, 2, '#b8b4c8', 2.2) + L('M45,22 h10 M45,29 h10 M45,36 h10 M45,43 h10', '#7a7690', 1.4) + R(30, 0, 40, 7, 3.5, '#5a5078', 2.2) +
      R(30, 50, 40, 8, 2, '#c98450', 2.6) + mat(tas(50, 63, 17, 5)) + P('M28,62 H72 L68,78 H32 Z', '#d9c9a8', 2.6) + L('M72,72 h10 v6', K, 5) + L('M72,72 h10 v6', '#d9c9a8', 2.4) +
      '<path class="pl-goutte" d="M82,82 c-3,4 -3,7 0,8 c3,-1 3,-4 0,-8 Z" fill="#f2b630" stroke="' + K + '" stroke-width="1.2"/>';
  },
  linge:function(){
    return P('M10,60 L66,42 L92,66 L36,86 Z', '#f6f1e4', 3) + P('M66,42 L92,66 L72,63 Z', '#ddd6c2', 2.4) + L('M20,62 L44,82 M27,60 L51,80', '#d0544a', 2.4) + L('M58,47 L82,69', '#d0544a', 2.4) + mat(tas(52, 64, 15, 6));
  },
  marmite:function(){
    return R(24, 80, 52, 8, 3, '#3a3450', 2.6) + L('M30,80 v-8 M70,80 v-8', K, 4) + flammes(32, 80, 36) +
      L('M16,36 q-9,3 -5,13 M84,36 q9,3 5,13', K, 4.5) + P('M16,28 H84 L78,60 Q50,70 22,60 Z', '#5f5582', 3) + E(50, 28, 34, 8, '#3a3352', 2.6) + mat(tas(50, 28, 25, 5)) +
      L('M26,40 q2,12 8,18', '#fff', 2.2, ' opacity=".35"') + '<g class="pl-vapeur"><path d="M40,16 c-6,-7 6,-10 0,-18"/><path d="M58,16 c-6,-7 6,-10 0,-18"/></g>';
  },
  feu:function(){
    return P('M16,62 L58,52 L84,62 L42,74 Z', '#efe2b4', 2.6) + P('M42,74 L84,62 V76 L42,88 Z', '#c8443c', 2.6) + P('M16,62 L42,74 V88 L16,76 Z', '#a2332e', 2.6) + L('M48,79 L78,70', '#7a2420', 4) +
      L('M54,54 L74,24', K, 6) + L('M54,54 L74,24', '#e8c98a', 3) + C(75, 22, 5, '#c0392b', 2.2) +
      '<path class="pl-etincelle" d="M75,17 c-9,-8 -2,-14 1,-19 c2,6 11,9 5,19 Z" fill="#ffc24a" stroke="#e8693c" stroke-width="2" stroke-linejoin="round"/>';
  },
  alambic:function(){
    var col = 'M30,36 C30,12 62,12 66,36 L72,58';
    return R(8, 82, 44, 7, 3, '#3a3450', 2.6) + flammes(12, 82, 34) + P('M10,70 C-2,36 62,36 50,70 C44,76 16,76 10,70 Z', '#d98a4a', 3) + L('M18,60 C16,50 22,44 30,42', '#fff', 2.6, ' opacity=".45"') +
      mat('<circle cx="30" cy="60" r="9" fill="var(--mat,#8fbf4a)" stroke="' + K + '" stroke-width="2"/>') +
      R(22, 28, 16, 11, 3, '#e0a070', 2.6) + L(col, K, 9) + L(col, '#e0a070', 5) +
      P('M64,58 h16 v7 l5,17 q1,6 -5,6 h-16 q-6,0 -5,-6 l5,-17 Z', 'rgba(220,245,255,.5)', 2.6) + '<path class="pl-goutte" d="M72,62 c-3,4 -3,7 0,8 c3,-1 3,-4 0,-8 Z" fill="#9fe0c0" stroke="' + K + '" stroke-width="1.2"/>';
  },
  coupelle:function(){
    return R(18, 2, 64, 52, 4, '#bfe6ff', 3) + C(64, 18, 8, '#ffe07a', 0) + L('M64,4 v4 M64,28 v4 M50,18 h4 M74,18 h4 M54,8 l3,3 M71,25 l3,3 M74,8 l-3,3 M57,25 l-3,3', '#ffd24a', 1.8) +
      L('M50,2 V54 M18,28 H82', K, 3) + R(8, 54, 84, 9, 3, '#c98a4a', 2.6) +
      P('M24,70 H76 C74,82 64,88 50,88 C36,88 26,82 24,70 Z', '#f4efe2', 3) + E(50, 70, 26, 6, '#fffaf0', 2.6) + mat(tas(50, 70, 17, 3.6));
  },
  eau:function(){
    var anse = 'M68,38 C94,38 94,72 70,74';
    return L(anse, K, 10) + L(anse, '#8fb8d8', 5) + P('M34,30 H66 C82,46 82,74 66,88 H34 C18,74 18,46 34,30 Z', '#8fb8d8', 3) + P('M36,18 H64 V32 H36 Z', '#a8cbe6', 2.6) + P('M36,18 L24,13 L30,27 Z', '#a8cbe6', 2.6) +
      E(50, 19, 13, 3.4, '#4f9be0', 2) + L('M30,48 q-2,14 4,26', '#fff', 2.6, ' opacity=".5"') + P('M50,48 c-8,10 -8,18 0,20 c8,-2 8,-10 0,-20 Z', '#4f9be0', 2);
  },
  fiole:function(){
    function v(x, y, k){ return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' + R(-6, -8, 12, 10, 2, '#c98a4a', 2.4) + P('M-7,0 h14 v14 l11,30 q3,12 -9,12 h-18 q-12,0 -9,-12 l11,-30 Z', 'rgba(220,245,255,.38)', 2.8) + L('M-8,36 q-4,10 2,14', '#fff', 2.4, ' opacity=".6"') + '</g>'; }
    return v(66, 36, 0.86) + v(34, 30, 1);
  }
};
var ORDRE_OUTILS = ['couteau', 'tamis', 'mortier', 'presse', 'linge', 'marmite', 'feu', 'alambic', 'coupelle', 'eau', 'fiole'];
var NOMS_OUTILS = {couteau:'La planche et le couteau', tamis:'Le tamis', mortier:'Le mortier', presse:'La presse', linge:'Le linge', marmite:'La marmite', feu:'Les allumettes', alambic:'L\'alambic',
  coupelle:'La coupelle, à la fenêtre', eau:'La cruche d\'eau', fiole:'Les fioles vides'};
var PLANTES = {oseille:oseille, souci:souci, melisse:melisse, lin:lin, lycopode:lycopode, vesse:vesse, gui:gui};

/* une fiole de potion (pleine si on donne sa couleur) : l'étagère des sept potions, les pages du grimoire */
function fiole(coul){
  return '<svg viewBox="0 0 40 60" aria-hidden="true">' + R(15, 2, 10, 9, 2, '#c98a4a', 2.2) +
    (coul ? '<path d="M11,34 L7,48 q-1,8 7,8 h12 q8,0 7,-8 L29,34 Z" fill="' + coul + '"/>' : '') +
    P('M14,10 h12 v12 l8,26 q2,9 -7,9 h-14 q-9,0 -7,-9 l8,-26 Z', coul ? 'rgba(255,255,255,.16)' : 'rgba(220,245,255,.14)', 2.6) +
    (coul ? L('M12,40 q-2,8 2,11', '#fff', 2.2, ' opacity=".7"') : '') + '</svg>';
}
function svgOutil(id){ return '<svg viewBox="0 -4 100 100" aria-hidden="true">' + OUTILS[id]() + '</svg>'; }
function svgPlante(id){ return '<svg viewBox="0 0 260 322" class="pl-dessin" data-plante="' + id + '">' + PLANTES[id]() + '</svg>'; }
/* (une seule fois dans la page : la toile du tamis ne dépasse pas de son cercle) */
var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><clipPath id="pl-clip-tamis"><ellipse cx="50" cy="56" rx="32" ry="9.6"/></clipPath></defs></svg>';

window.PLD = {outil:svgOutil, plante:svgPlante, fiole:fiole, OUTILS:ORDRE_OUTILS, NOMS:NOMS_OUTILS, DEFS:DEFS};
})();
