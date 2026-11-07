
/* ==========================================================
   LES DÉCORS DES 7 DIFFÉRENCES (viewBox 400 × 300)
   Chaque thème : bg(id) = fond fixe, slots = emplacements d'objets
   {x, y (base), s (échelle), k (objets possibles), fixe (ni retourné ni déplacé), m (retourné d'office)}
   ========================================================== */
function lg(id, st, vert){
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' +
    st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>';
}
function rg(id, st, cx, cy, r){
  return '<radialGradient id="' + id + '" cx="' + (cx || 0.5) + '" cy="' + (cy || 0.5) + '" r="' + (r || 0.5) + '">' +
    st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>';
}
function gU(i){ return function(n){ return 'url(#' + i + n + ')'; }; }
function briques(x0, y0, x1, y1, bw, bh, op){
  var p = '';
  for(var r = 0, y = y1 - bh; y > y0 - bh; r++, y -= bh){
    for(var x = x0 - (r % 2) * bw / 2; x < x1; x += bw){
      var xa = Math.max(x0, x + 2), xb = Math.min(x1, x + bw - 2), ya = Math.max(y0, y + 2), yb = y + bh - 2;
      if(xb - xa > 6 && yb - ya > 4) p += '<rect x="' + f1(xa) + '" y="' + f1(ya) + '" width="' + f1(xb - xa) + '" height="' + f1(yb - ya) + '" rx="6"/>';
    }
  }
  return '<g fill="rgba(255,255,255,' + (op || 0.04) + ')" stroke="rgba(10,6,20,.32)" stroke-width="1.6">' + p + '</g>';
}
function pierres(rnd, x0, y0, x1, y1, h, fill, op){
  var p = '';
  for(var y = y0, r = 0; y < y1; y += h, r++){
    var x = x0 - rnd() * 20;
    while(x < x1){ var w = h * (1.2 + rnd() * 1.1); p += '<rect x="' + f1(x + 1.5) + '" y="' + f1(y + 1.5) + '" width="' + f1(w - 3) + '" height="' + f1(h - 3) + '" rx="' + f1(h * 0.4) + '" opacity="' + f1(0.7 + rnd() * 0.3) + '"/>'; x += w; }
  }
  return '<g fill="' + fill + '" stroke="rgba(10,6,20,' + (op || 0.45) + ')" stroke-width="1.5">' + p + '</g>';
}
function paves(rnd, y0, y1, fill){
  var p = '', y = y0;
  while(y < y1){
    var h = 9 + (y - y0) * 0.09, x = -rnd() * h * 2;
    while(x < 400){ var w = h * (1.6 + rnd() * 0.8); p += '<rect x="' + f1(x + 1) + '" y="' + f1(y + 1) + '" width="' + f1(w - 2) + '" height="' + f1(h - 2) + '" rx="' + f1(h * 0.42) + '"/>'; x += w; }
    y += h;
  }
  return '<g fill="' + fill + '" stroke="rgba(20,10,30,.35)" stroke-width="1.3">' + p + '</g>';
}
function planche(G, x0, x1, y){
  return Pa('M' + (x0 + 8) + ',' + (y + 7) + ' L' + (x0 + 21) + ',' + (y + 7) + ' L' + (x0 + 8) + ',' + (y + 20) + ' Z', G('bS'), 2) +
    Pa('M' + (x1 - 8) + ',' + (y + 7) + ' L' + (x1 - 21) + ',' + (y + 7) + ' L' + (x1 - 8) + ',' + (y + 20) + ' Z', G('bS'), 2) +
    Re(x0, y, x1 - x0, 8, 2.5, G('bH'), 2.2) + Tr('M' + (x0 + 5) + ',' + (y + 2.5) + ' H' + (x1 - 5), '#ffffff', 1.4, 0.35);
}
function poutre(G){ return Re(-4, -4, 408, 16, 0, G('bS'), 2.4) + Tr('M0,8 H400', '#000000', 2, 0.18); }
/* Fenêtre arrondie : mode 'nuit' (lune, étoiles, brume) ou 'jour' (nuages, collines) */
function fenetreArc(i, G, cx, ty, w, h, mode){
  var x0 = cx - w / 2, x1 = cx + w / 2, r = w / 2, yb = ty + h, ya = ty + r;
  var d = 'M' + f1(x0) + ',' + f1(yb) + ' V' + f1(ya) + ' A' + f1(r) + ',' + f1(r) + ' 0 0 1 ' + f1(x1) + ',' + f1(ya) + ' V' + f1(yb) + ' Z';
  var s = '<clipPath id="' + i + 'fen"><path d="' + d + '"/></clipPath><g clip-path="url(#' + i + 'fen)">' + '<rect x="' + f1(x0) + '" y="' + f1(ty) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + G(mode === 'jour' ? 'cielJ' : 'ciel') + '"/>';
  if(mode === 'jour'){
    s += El(x0 + w * 0.3, ty + h * 0.3, w * 0.22, h * 0.06, '#ffffff', 0, ' opacity=".8"') + El(x0 + w * 0.7, ty + h * 0.42, w * 0.18, h * 0.05, '#ffffff', 0, ' opacity=".7"') +
      Pa('M' + f1(x0) + ',' + f1(yb) + ' L' + f1(x0) + ',' + f1(yb - h * 0.25) + ' C' + f1(x0 + w * 0.3) + ',' + f1(yb - h * 0.38) + ' ' + f1(x0 + w * 0.6) + ',' + f1(yb - h * 0.2) + ' ' + f1(x1) + ',' + f1(yb - h * 0.3) + ' L' + f1(x1) + ',' + f1(yb) + ' Z', '#7fbf6a', 0);
  } else {
    var mx = cx + w * 0.18, my = ty + r * 0.8;
    s += '<circle cx="' + f1(mx) + '" cy="' + f1(my) + '" r="' + f1(w * 0.34) + '" fill="' + G('hl') + '"/>' + Ci(mx, my, w * 0.15, '#fff4cf', 0) + Ci(mx + w * 0.05, my - w * 0.03, w * 0.035, '#f0e2b0', 0);
    [[0.18, 0.3], [0.32, 0.6], [0.8, 0.66], [0.14, 0.75], [0.55, 0.18]].forEach(function(q){ s += Ci(x0 + q[0] * w, ty + q[1] * h, 1.3, '#ffffff', 0); });
    s += Pa('M' + f1(x0) + ',' + f1(yb) + ' L' + f1(x0) + ',' + f1(yb - h * 0.16) + ' C' + f1(x0 + w * 0.2) + ',' + f1(yb - h * 0.26) + ' ' + f1(x0 + w * 0.32) + ',' + f1(yb - h * 0.3) + ' ' + f1(x0 + w * 0.45) + ',' + f1(yb - h * 0.2) + ' C' + f1(x0 + w * 0.6) + ',' + f1(yb - h * 0.3) + ' ' + f1(x0 + w * 0.75) + ',' + f1(yb - h * 0.26) + ' ' + f1(x1) + ',' + f1(yb - h * 0.18) + ' L' + f1(x1) + ',' + f1(yb) + ' Z', '#141a3a', 0) +
      Re(x0 - w * 0.3, yb - h * 0.12, w * 1.6, h * 0.1, h * 0.05, 'rgba(200,210,255,.2)', 0);
  }
  s += '</g><path d="' + d + '" fill="none" stroke="' + K + '" stroke-width="8"/><path d="' + d + '" fill="none" stroke="#8a5a3a" stroke-width="4"/>' +
    Tr('M' + f1(cx) + ',' + f1(ty + 3) + ' V' + f1(yb) + ' M' + f1(x0 + 2) + ',' + f1(ya + h * 0.1) + ' H' + f1(x1 - 2), K, 5.5) +
    Tr('M' + f1(cx) + ',' + f1(ty + 3) + ' V' + f1(yb) + ' M' + f1(x0 + 2) + ',' + f1(ya + h * 0.1) + ' H' + f1(x1 - 2), '#8a5a3a', 2.6) +
    Re(x0 - 9, yb - 3, w + 18, 9, 3, G('bH'));
  return s;
}
var DEFS_BOIS = function(i){ return lg(i + 'bH', [['#f3c991', 0], ['#d29a5e', 1]], 1) + lg(i + 'bS', [['#94603a', 0], ['#62381d', 1]], 1) + lg(i + 'bois', [['#b77a46', 0], ['#7d4626', 1]], 1) +
  lg(i + 'ciel', [['#0d1433', 0], ['#26306a', 0.7], ['#4b3f86', 1]], 1) + lg(i + 'cielJ', [['#7fb8f0', 0], ['#d8ecff', 1]], 1) + rg(i + 'hl', [['#fff6d8', 0, 0.65], ['#fff6d8', 1, 0]]); };
function rayon(d, c, op){ return '<path d="' + d + '" fill="' + c + '" opacity="' + (op || 0.08) + '"/>'; }

var THEMES = {};
function TH(id, o){ o.id = id; THEMES[id] = o; }

/* --- L'étagère du labo --- */
TH('labo', {nom:'L\'étagère du labo', ic:'⚗️', fondCss:'#2b2148',
  bg:function(i){ var G = gU(i);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#2b2148', 0], ['#3e2f5f', 0.55], ['#4a3868', 1]], 1) + rg(i + 'feu', [['#ff9a4a', 0, 0.38], ['#ff7a3c', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>' + briques(0, 12, 400, 262, 52, 26) + '<ellipse cx="-30" cy="250" rx="200" ry="170" fill="' + G('feu') + '"/>';
    s += fenetreArc(i, G, 328, 20, 86, 110, 'nuit') + rayon('M287,130 L371,130 L330,262 L170,262 Z', '#bff9ff', 0.07);
    s += poutre(G) + planche(G, 6, 262, 98) + planche(G, 6, 394, 184);
    s += Re(-4, 262, 408, 11, 3, G('bH')) + '<rect x="-4" y="273" width="408" height="32" fill="' + G('bois') + '" stroke="' + K + '" stroke-width="2.4"/>' +
      Tr('M0,280 H400 M100,273 V300 M300,273 V300', '#000000', 1.6, 0.2) + Re(186, 282, 28, 6, 3, '#d6a24a', 1.6);
    return s;
  },
  slots:[
    {x:30, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier', 'bougie']},
    {x:78, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier', 'bougie']},
    {x:126, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'chat', 'encrier', 'bougie']},
    {x:174, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier', 'bougie']},
    {x:222, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'bougie']},
    {x:306, y:127, s:0.72, k:['fiole', 'bougie', 'cristal', 'champignon']},
    {x:350, y:127, s:0.72, k:['fiole', 'bougie', 'cristal', 'bocal']},
    {x:30, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier']},
    {x:86, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'chat']},
    {x:142, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'bougie']},
    {x:198, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'mortier', 'cristal', 'champignon']},
    {x:254, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'encrier', 'bougie']},
    {x:310, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'cristal', 'champignon', 'chat']},
    {x:366, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'bougie']},
    {x:42, y:262, s:1.02, k:['chaudronMini', 'mortier', 'livres', 'bocal', 'bougie', 'chat']},
    {x:118, y:262, s:1.02, k:['chaudronMini', 'mortier', 'livres', 'bocal', 'sablier', 'fiole']},
    {x:196, y:262, s:1.02, k:['chaudronMini', 'mortier', 'livres', 'chat', 'encrier', 'fiole']},
    {x:276, y:262, s:1.02, k:['chaudronMini', 'mortier', 'bocal', 'bougie', 'sablier']},
    {x:356, y:262, s:1.02, k:['chaudronMini', 'chat', 'livres', 'bocal', 'fiole']}
  ]});

/* --- La place de Brumeval --- */
TH('place', {nom:'La place de Brumeval', ic:'⛲', fondCss:'#3a3060',
  bg:function(i){ var G = gU(i), rnd = alea(77);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'soir', [['#1c2450', 0], ['#4a3a78', 0.45], ['#e08a6a', 1]], 1) + lg(i + 'm1', [['#f3e4c4', 0], ['#d9c49a', 1]], 1) + lg(i + 'm2', [['#ecc8b8', 0], ['#c99a8a', 1]], 1) +
      lg(i + 'pi', [['#b9b5d6', 0], ['#77729c', 1]], 1) + lg(i + 'pav', [['#8a84a4', 0], ['#5a5474', 1]], 1) + lg(i + 'eau', [['#9fe0ff', 0], ['#3f8fd0', 1]], 1) + '</defs>';
    s += '<rect width="400" height="240" fill="' + G('soir') + '"/>' + Ci(258, 30, 9, '#fff4cf', 0);
    [[30, 20], [120, 12], [290, 14], [380, 26], [340, 50]].forEach(function(q){ s += Ci(q[0], q[1], 1.2, '#ffffff', 0); });
    /* maison de gauche */
    s += Re(-8, 72, 142, 166, 0, G('m1')) + Tr('M-8,94 H134 M-8,164 H134 M-8,234 H134 M20,94 L64,164 M108,94 L64,164', '#6b3f24', 3.4) +
      Pa('M-16,76 L62,8 L142,76 Z', '#a84a3a') + Tr('M-4,64 L62,14 L128,64', '#7a2f2a', 2, 0.6) + Re(78, 182, 40, 56, 18, '#6b3f24') + Ci(110, 212, 2, '#f6d23a', 1);
    /* la mairie */
    s += Re(146, 50, 108, 190, 0, G('pi')) + Pa('M160,52 L200,-4 L240,52 Z', '#4a4a6a') + Ci(200, 30, 14, '#f3e7cb') + Tr('M200,30 L200,21 M200,30 L207,33', K, 2) +
      Pa('M180,240 L180,210 C180,190 220,190 220,210 L220,240 Z', '#6b3f24') + Tr('M200,194 V240', K, 1.6) + Tr('M150,86 H250', '#5a5474', 2, 0.6) + Re(178, 160, 44, 12, 3, '#f5b945', 2) + Tr('M186,166 h28', '#7a2a3a', 1.6);
    /* maison de droite */
    s += Re(266, 78, 142, 160, 0, G('m2')) + Tr('M266,100 H408 M266,170 H408 M266,236 H408 M300,100 L340,170 M380,100 L340,170', '#6b3f24', 3.4) +
      Pa('M258,82 L336,16 L416,82 Z', '#5a4a8a') + Tr('M272,70 L336,22 L402,70', '#3a3060', 2, 0.6) + Re(282, 186, 38, 52, 17, '#7a3a5a') + Ci(312, 214, 2, '#f6d23a', 1);
    /* le sol pavé et la fontaine */
    s += '<rect x="0" y="236" width="400" height="64" fill="' + G('pav') + '"/>' + paves(rnd, 236, 300, 'rgba(255,255,255,.07)');
    s += El(200, 274, 64, 15, '#8a86a8') + El(200, 268, 56, 10, G('eau'), 2) + Re(193, 222, 14, 46, 3, G('pi')) + El(200, 222, 22, 6, '#9a96b8') +
      Tr('M190,218 C176,222 170,240 166,262 M210,218 C224,222 230,240 234,262', '#bff0ff', 2.4, 0.8) + Ci(200, 210, 5, '#bff0ff', 1.6) +
      Pa('M136,274 C136,290 264,290 264,274', 'none') + Tr('M140,280 C170,292 230,292 260,280', '#ffffff', 1.4, 0.2);
    return s;
  },
  slots:[
    {x:30, y:130, s:0.85, k:['fenetre']}, {x:92, y:130, s:0.85, k:['fenetre']}, {x:30, y:204, s:0.85, k:['fenetre']},
    {x:200, y:132, s:0.85, k:['fenetre']},
    {x:306, y:134, s:0.85, k:['fenetre']}, {x:368, y:134, s:0.85, k:['fenetre']}, {x:370, y:206, s:0.85, k:['fenetre']},
    {x:140, y:62, s:0.72, k:['fanions'], fixe:1}, {x:262, y:66, s:0.72, k:['fanions'], fixe:1},
    {x:142, y:294, s:0.92, k:['lampadaire', 'panneau']}, {x:262, y:294, s:0.92, k:['lampadaire', 'panneau']},
    {x:236, y:262, s:0.85, k:['oiseau']},
    {x:28, y:298, s:1, k:['tonneau', 'caisse', 'fleursPot']}, {x:84, y:298, s:1, k:['chat', 'fleursPot', 'panier', 'oiseau']},
    {x:322, y:298, s:1, k:['chat', 'fleursPot', 'panier', 'pommes']}, {x:374, y:298, s:1, k:['tonneau', 'caisse', 'fleursPot']}
  ]});

/* --- La lisière de la forêt --- */
TH('lisiere', {nom:'La lisière de la forêt', ic:'🌳', fondCss:'#3f6a3a',
  bg:function(i){ var G = gU(i), rnd = alea(31);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'ciel2', [['#7fb8f0', 0], ['#cfe6ff', 0.6], ['#ffe6b8', 1]], 1) + lg(i + 'pre', [['#a8d86a', 0], ['#5fa84a', 1]], 1) + lg(i + 'tr', [['#9a6a42', 0], ['#5a3820', 1]]) + rg(i + 'sol', [['#fff6c8', 0, 0.8], ['#fff6c8', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="200" fill="' + G('ciel2') + '"/>' + '<circle cx="330" cy="40" r="60" fill="' + G('sol') + '"/>' + Ci(330, 40, 16, '#fff8d8', 0);
    s += El(150, 40, 30, 8, '#ffffff', 0, ' opacity=".75"') + El(176, 34, 20, 9, '#ffffff', 0, ' opacity=".75"') + El(260, 70, 26, 6, '#ffffff', 0, ' opacity=".6"');
    s += Pa('M0,172 C60,140 120,150 180,160 C240,140 320,130 400,152 L400,200 L0,200 Z', '#9cc98a', 0);
    s += Pa('M120,166 L120,150 L128,142 L136,150 L136,166 Z M140,166 L140,138 L146,128 L152,138 L152,166 Z M156,166 L156,152 L166,144 L176,152 L176,166 Z', '#7a86b8', 0, ' opacity=".7"');
    for(var k = 0; k < 9; k++){ var x = 196 + k * 26, y = 140 + (k % 3) * 8; s += Ci(x, y, 22 + (k % 2) * 6, k % 2 ? '#2f6b4a' : '#3f7a4a', 2) + Ci(x - 6, y - 8, 7, '#4f8a5a', 0); }
    s += '<rect x="0" y="182" width="400" height="118" fill="' + G('pre') + '"/>' + Tr('M0,184 C100,178 300,190 400,182', '#4f8a3a', 2, 0.5);
    s += Pa('M176,300 C192,262 234,244 226,214 C222,200 240,190 250,184 L260,184 C252,194 240,204 246,218 C256,246 236,274 248,300 Z', '#dcc08e', 0) + Tr('M176,300 C192,262 234,244 226,214 C222,200 240,190 250,184 M260,184 C252,194 240,204 246,218 C256,246 236,274 248,300', '#b8986a', 1.6);
    for(k = 0; k < 14; k++){ var gx = rnd() * 400, gy = 196 + rnd() * 100; s += Tr('M' + f1(gx) + ',' + f1(gy) + ' l-2,-7 M' + f1(gx + 3) + ',' + f1(gy) + ' l1,-8 M' + f1(gx + 6) + ',' + f1(gy) + ' l3,-6', '#3f7a3a', 1.6, 0.8); }
    s += Pa('M4,262 C12,200 16,140 20,70 L46,70 C48,140 54,200 66,262 C50,256 22,256 4,262 Z', G('tr')) + Tr('M28,90 C30,140 30,190 26,240', '#4a2a14', 1.6, 0.6);
    s += Tr('M42,98 C76,90 108,84 146,88', K, 8) + Tr('M42,98 C76,90 108,84 146,88', '#7a5030', 4.4);
    s += Ci(-6, 30, 52, '#3f8a4a') + Ci(46, 12, 44, '#4f9a5a') + Ci(88, 44, 30, '#3f8a4a') + Ci(20, 62, 30, '#2f7a42') + Ci(36, 0, 18, '#6fbf6a', 0) + Ci(78, 36, 10, '#6fbf6a', 0);
    return s;
  },
  slots:[
    {x:118, y:88, s:0.82, k:['oiseau']},
    {x:196, y:128, s:0.85, k:['papillon']}, {x:304, y:100, s:0.85, k:['papillon']},
    {x:112, y:226, s:0.8, k:['lapin', 'champignon', 'fleurs', 'rocher']}, {x:300, y:214, s:0.75, k:['rocher', 'souche', 'fleurs', 'baies']},
    {x:362, y:226, s:0.82, k:['baies', 'fougere', 'lapin']}, {x:160, y:248, s:0.8, k:['fleurs', 'escargot', 'champignon']},
    {x:262, y:240, s:0.62, k:['panneau'], fixe:1},
    {x:40, y:294, s:1, k:['souche', 'rocher', 'fougere']}, {x:112, y:296, s:1, k:['champignon', 'fleurs', 'escargot', 'lapin']},
    {x:198, y:296, s:0.95, k:['fleurs', 'champignon', 'escargot']}, {x:288, y:294, s:1, k:['baies', 'lapin', 'souche', 'fougere']},
    {x:362, y:292, s:1, k:['fougere', 'rocher', 'fleurs']}
  ]});

/* --- La taverne --- */
TH('taverne', {nom:'La taverne', ic:'🍺', fondCss:'#4a2a18',
  bg:function(i){ var G = gU(i);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#6a3e24', 0], ['#4a2a18', 1]], 1) + rg(i + 'lamp', [['#ffbf6a', 0, 0.45], ['#ff9a4a', 1, 0]]) + lg(i + 'comp', [['#9a6a42', 0], ['#5a3820', 1]], 1) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>';
    var l = ''; for(var x = 14; x < 400; x += 30) l += 'M' + x + ',0 V230 ';
    s += Tr(l, '#2a160c', 2, 0.55) + Ci(64, 120, 2, '#2a160c', 0, ' opacity=".5"') + Ci(254, 74, 2, '#2a160c', 0, ' opacity=".5"') + Ci(334, 180, 2, '#2a160c', 0, ' opacity=".5"');
    s += '<ellipse cx="110" cy="70" rx="110" ry="90" fill="' + G('lamp') + '"/><ellipse cx="290" cy="70" rx="110" ry="90" fill="' + G('lamp') + '"/><ellipse cx="420" cy="250" rx="120" ry="110" fill="' + G('lamp') + '"/>';
    s += poutre(G) + planche(G, 20, 380, 150);
    s += Pa('M40,108 C40,96 58,96 58,108 C58,116 52,118 49,118 C46,118 40,116 40,108 Z', 'none', 3.4) + Tr('M43,108 C43,100 55,100 55,108', '#b8b0c8', 2.2);
    s += Re(-4, 222, 408, 11, 3, G('bH')) + '<rect x="-4" y="233" width="408" height="70" fill="' + G('comp') + '" stroke="' + K + '" stroke-width="2.4"/>';
    for(x = 10; x < 400; x += 78) s += Re(x, 244, 64, 46, 4, 'none', 1.6) + Tr('M' + (x + 4) + ',248 h56', '#ffffff', 1.2, 0.18);
    return s;
  },
  slots:[
    {x:110, y:12, s:0.88, k:['lanterne']}, {x:290, y:12, s:0.88, k:['lanterne']},
    {x:36, y:24, s:0.85, k:['chapeau']}, {x:366, y:24, s:0.85, k:['chapeau'], m:1},
    {x:172, y:98, s:0.9, k:['tableau', 'horloge']}, {x:240, y:98, s:0.9, k:['horloge', 'tableau']},
    {x:44, y:150, s:0.82, k:['bouteille', 'chope', 'bocal']}, {x:94, y:150, s:0.82, k:['bouteille', 'assiette', 'bougie']},
    {x:144, y:150, s:0.82, k:['chope', 'bouteille', 'bocal']}, {x:194, y:150, s:0.82, k:['bouteille', 'bougie', 'assiette']},
    {x:244, y:150, s:0.82, k:['bocal', 'bouteille', 'chope']}, {x:294, y:150, s:0.82, k:['bouteille', 'assiette', 'bougie']},
    {x:344, y:150, s:0.82, k:['chope', 'bouteille', 'bocal']},
    {x:56, y:224, s:0.92, k:['chope', 'assiette', 'pain']}, {x:128, y:224, s:0.92, k:['bougie', 'chope', 'bouteille']},
    {x:200, y:224, s:0.92, k:['assiette', 'pain', 'chope']}, {x:272, y:224, s:0.92, k:['chope', 'bouteille', 'bougie']},
    {x:344, y:224, s:0.92, k:['pain', 'assiette', 'chope']},
    {x:28, y:302, s:1.05, k:['tonneau']}, {x:372, y:302, s:1.05, k:['tonneau']}
  ]});

/* --- L'étal de potions --- */
TH('marche', {nom:'L\'étal de potions', ic:'🧪', fondCss:'#5a7aa8',
  bg:function(i){ var G = gU(i), rnd = alea(52);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'jour', [['#8cc8ff', 0], ['#e8f6ff', 1]], 1) + lg(i + 'pav', [['#b8b0c8', 0], ['#8a84a4', 1]], 1) + lg(i + 'fond', [['#a8743f', 0], ['#7d4626', 1]], 1) +
      lg(i + 'nappe', [['#4f7fc0', 0], ['#2f4f90', 1]], 1) + '<clipPath id="' + i + 'auv"><path d="M14,14 L386,14 L396,62 L4,62 Z"/></clipPath></defs>';
    s += '<rect width="400" height="220" fill="' + G('jour') + '"/>';
    [[20, 120, 70, '#f0c8a8', '#a84a3a'], [96, 100, 60, '#c9b8e8', '#5a4a8a'], [260, 110, 70, '#f3e4c4', '#a84a3a'], [336, 96, 70, '#d8e8c8', '#4a6a8a']].forEach(function(m){
      s += Re(m[0], m[1], m[2], 120, 0, m[3], 1.6, ' opacity=".75"') + Pa('M' + (m[0] - 6) + ',' + (m[1] + 2) + ' L' + (m[0] + m[2] / 2) + ',' + (m[1] - 30) + ' L' + (m[0] + m[2] + 6) + ',' + (m[1] + 2) + ' Z', m[4], 1.6, ' opacity=".75"') +
        Re(m[0] + 12, m[1] + 20, 14, 18, 2, '#ffe9a0', 1.2, ' opacity=".8"');
    });
    s += '<rect x="0" y="212" width="400" height="88" fill="' + G('pav') + '"/>' + paves(rnd, 212, 300, 'rgba(255,255,255,.12)');
    s += Re(38, 64, 324, 146, 0, G('fond')) + Tr('M70,64 V210 M110,64 V210 M150,64 V210 M190,64 V210 M230,64 V210 M270,64 V210 M310,64 V210 M350,64 V210', '#5a3820', 1.4, 0.5);
    s += Re(24, 30, 14, 272, 2, G('bois')) + Re(362, 30, 14, 272, 2, G('bois'));
    s += planche(G, 40, 360, 140);
    var raies = ''; for(var x = 0; x < 400; x += 32) raies += '<rect x="' + x + '" y="10" width="16" height="56" fill="#fff4dc"/>';
    s += '<g clip-path="url(#' + i + 'auv)"><rect x="0" y="10" width="400" height="56" fill="#e5484d"/>' + raies + '</g>' + Pa('M14,14 L386,14 L396,62 L4,62 Z', 'none');
    var fest = ''; for(x = 4; x < 396; x += 24) fest += Pa('M' + x + ',62 C' + x + ',74 ' + (x + 24) + ',74 ' + (x + 24) + ',62 Z', (x / 24) % 2 < 1 ? '#e5484d' : '#fff4dc', 1.8);
    s += fest + Re(156, 72, 88, 22, 5, '#f3e7cb', 2.2) + '<text x="200" y="88" text-anchor="middle" font-family="Macondo, Georgia, serif" font-size="14" fill="#7a2a3a">Potions</text>';
    s += Re(20, 208, 360, 10, 3, G('bH')) + Pa('M24,218 L376,218 L376,302 L24,302 Z', G('nappe'));
    var fr = ''; for(x = 24; x < 376; x += 16) fr += Pa('M' + x + ',218 L' + (x + 16) + ',218 L' + (x + 8) + ',230 Z', '#f5b945', 1.4);
    s += fr + etincelle(110, 262, 9, '#f5b945') + etincelle(290, 262, 9, '#f5b945') + etincelle(200, 276, 6, '#ffe3a3');
    return s;
  },
  slots:[
    {x:90, y:64, s:0.78, k:['herbes', 'lanterne']}, {x:310, y:64, s:0.78, k:['lanterne', 'herbes']},
    {x:66, y:140, s:0.82, k:['fiole', 'bocal', 'bouteille', 'miel']}, {x:114, y:140, s:0.82, k:['bocal', 'fiole', 'bouteille']},
    {x:162, y:140, s:0.82, k:['fiole', 'miel', 'bocal']}, {x:238, y:140, s:0.82, k:['bouteille', 'fiole', 'bocal']},
    {x:286, y:140, s:0.82, k:['miel', 'fiole', 'bouteille']}, {x:334, y:140, s:0.82, k:['bocal', 'fiole', 'bouteille']},
    {x:66, y:208, s:0.95, k:['pommes', 'panier', 'citrouille']}, {x:128, y:208, s:0.95, k:['fiole', 'bocal', 'bouquet']},
    {x:190, y:208, s:0.95, k:['panier', 'pommes', 'miel']}, {x:252, y:208, s:0.95, k:['bocal', 'fiole', 'bouquet']},
    {x:314, y:208, s:0.95, k:['citrouille', 'pommes', 'panier']},
    {x:82, y:302, s:0.95, k:['caisse', 'citrouille', 'sac']}, {x:318, y:302, s:0.95, k:['caisse', 'sac', 'citrouille']}
  ]});

/* --- Les bouquets d'Iris (herboristerie) --- */
TH('herboristerie', {nom:'Les bouquets d\'Iris', ic:'💐', fondCss:'#2f4a3a',
  bg:function(i){ var G = gU(i);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#4f7a5c', 0], ['#2f4a3a', 1]], 1) + rg(i + 'jourR', [['#fff6d0', 0, 0.35], ['#fff6d0', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>';
    var m = ''; for(var y = 24, r = 0; y < 290; y += 26, r++) for(var x = (r % 2) * 18; x < 400; x += 36) m += 'M' + x + ',' + y + ' c3,-6 8,-6 8,0 c-3,4 -6,4 -8,0 Z ';
    s += '<path d="' + m + '" fill="#ffffff" opacity=".06"/>';
    s += '<ellipse cx="200" cy="120" rx="160" ry="140" fill="' + G('jourR') + '"/>';
    s += '<clipPath id="' + i + 'rond"><circle cx="200" cy="40" r="25"/></clipPath><g clip-path="url(#' + i + 'rond)"><rect x="170" y="10" width="60" height="60" fill="' + G('cielJ') + '"/>' + Ci(186, 58, 14, '#7fbf6a', 0) + Ci(214, 62, 16, '#6aaf5a', 0) + '</g>' +
      Ci(200, 40, 25, 'none', 6) + Ci(200, 40, 25, 'none', 0, ' stroke="#8a5a3a" stroke-width="3"') + Tr('M200,16 V64 M176,40 H224', '#8a5a3a', 2.6);
    s += rayon('M184,60 L216,60 L160,300 L60,300 Z', '#fff6d0', 0.07);
    s += poutre(G) + planche(G, 8, 392, 118) + planche(G, 8, 392, 206);
    s += Re(-4, 284, 408, 22, 3, G('bH')) + Tr('M0,292 H400', '#8a5634', 1.4, 0.5);
    return s;
  },
  slots:[
    {x:40, y:12, s:0.82, k:['herbes']}, {x:112, y:12, s:0.82, k:['herbes']}, {x:288, y:12, s:0.82, k:['herbes']}, {x:360, y:12, s:0.82, k:['herbes']},
    {x:40, y:118, s:0.88, k:['bouquet', 'bocal', 'fleursPot']}, {x:102, y:118, s:0.88, k:['bouquet', 'lavande', 'miel']},
    {x:164, y:118, s:0.88, k:['bouquet', 'bocal', 'fleursPot']}, {x:236, y:118, s:0.88, k:['bouquet', 'lavande', 'bocal']},
    {x:298, y:118, s:0.88, k:['bouquet', 'fleursPot', 'miel']}, {x:360, y:118, s:0.88, k:['bouquet', 'bocal', 'lavande']},
    {x:40, y:206, s:0.88, k:['bouquet', 'panier', 'bocal']}, {x:102, y:206, s:0.88, k:['bouquet', 'lavande', 'fleursPot']},
    {x:164, y:206, s:0.88, k:['bouquet', 'miel', 'bocal']}, {x:236, y:206, s:0.88, k:['bouquet', 'panier', 'fleursPot']},
    {x:298, y:206, s:0.88, k:['bouquet', 'bocal', 'lavande']}, {x:360, y:206, s:0.88, k:['bouquet', 'miel', 'fleursPot']},
    {x:60, y:286, s:0.95, k:['bouquet', 'panier', 'livres']}, {x:156, y:286, s:0.95, k:['bouquet', 'fleursPot', 'panier']},
    {x:248, y:286, s:0.95, k:['bouquet', 'livres', 'miel']}, {x:342, y:286, s:0.95, k:['bouquet', 'panier', 'fleursPot']}
  ]});

/* --- La cave aux champignons --- */
TH('cave', {nom:'La cave aux champignons', ic:'🍄', fondCss:'#1a1430',
  bg:function(i){ var G = gU(i), rnd = alea(19);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#1a1430', 0], ['#2c2444', 1]], 1) + lg(i + 'sol', [['#3a2a22', 0], ['#1e1410', 1]], 1) +
      rg(i + 'lant', [['#ffbf6a', 0, 0.5], ['#ff9a4a', 1, 0]]) + rg(i + 'cyan', [['#8ff3ff', 0, 0.3], ['#8ff3ff', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>' + pierres(rnd, 0, 0, 400, 240, 26, '#4a4068');
    s += Tr('M-20,300 L-20,130 C-20,30 100,-10 200,-10 C300,-10 420,30 420,130 L420,300', K, 14) + Tr('M-20,300 L-20,130 C-20,30 100,-10 200,-10 C300,-10 420,30 420,130 L420,300', '#4a4266', 9);
    s += '<ellipse cx="100" cy="60" rx="150" ry="120" fill="' + G('lant') + '"/><ellipse cx="300" cy="270" rx="140" ry="70" fill="' + G('cyan') + '"/><ellipse cx="160" cy="250" rx="80" ry="40" fill="' + G('cyan') + '"/>';
    [[0, 150, 80], [0, 168, 64], [0, 186, 48], [0, 204, 32], [0, 222, 16]].forEach(function(m){ s += Re(m[0] - 4, m[1], m[2] + 4, 18, 3, '#4a4266', 2) + Tr('M2,' + (m[1] + 3) + ' h' + (m[2] - 6), '#ffffff', 1.2, 0.15); });
    s += planche(G, 236, 396, 130);
    s += Pa('M0,236 L400,236 L400,300 L0,300 Z', G('sol'), 0) + Tr('M0,236 H400', K, 2.4);
    for(var k = 0; k < 16; k++){ var x = rnd() * 400, y = 244 + rnd() * 52; s += El(x, y, 3 + rnd() * 4, 1.6 + rnd() * 1.4, '#5a4a40', 1, ' opacity=".7"'); }
    s += Tr('M330,40 C336,60 326,80 334,100 M60,180 C66,196 58,210 64,226', '#0a0612', 2, 0.6);
    return s;
  },
  slots:[
    {x:26, y:0, s:1, k:['toile'], fixe:1}, {x:374, y:0, s:1, k:['toile'], fixe:1, m:1},
    {x:100, y:4, s:1, k:['lanterne']}, {x:198, y:0, s:0.9, k:['araignee']}, {x:292, y:4, s:0.9, k:['lanterne', 'araignee']},
    {x:262, y:130, s:0.82, k:['bouteille', 'bocal', 'bougie']}, {x:312, y:130, s:0.82, k:['bocal', 'champignon', 'bouteille']},
    {x:362, y:130, s:0.82, k:['bouteille', 'bougie', 'bocal']},
    {x:34, y:150, s:0.78, k:['bougie', 'bouteille', 'souris']},
    {x:150, y:246, s:0.75, k:['champiLum', 'bouteille', 'seau']}, {x:236, y:244, s:0.78, k:['caisse', 'seau', 'bouteille']},
    {x:40, y:298, s:1, k:['caisse', 'tonneau', 'seau']},
    {x:108, y:294, s:1.05, k:['tonneau', 'caisse']}, {x:180, y:292, s:1, k:['champiLum', 'champignon', 'souris']},
    {x:250, y:296, s:1, k:['caisse', 'tonneau']}, {x:318, y:292, s:0.95, k:['champiLum', 'bouteille', 'souris']},
    {x:372, y:294, s:0.95, k:['tonneau', 'champiLum']}
  ]});

/* --- La forêt aux baies --- */
TH('baies', {nom:'La forêt aux baies', ic:'🫐', fondCss:'#1f3a2a',
  bg:function(i){ var G = gU(i), rnd = alea(64);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'fond', [['#16301f', 0], ['#24452c', 0.6], ['#356a3e', 1]], 1) + lg(i + 'sol', [['#5a8a3e', 0], ['#2f5228', 1]], 1) + lg(i + 'tr', [['#8a5a3a', 0], ['#4a2e1a', 1]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('fond') + '"/>';
    [[86, 16], [176, 20], [248, 14], [296, 12]].forEach(function(t){ s += '<rect x="' + t[0] + '" y="0" width="' + t[1] + '" height="215" fill="#13261a" opacity=".85"/>'; });
    s += rayon('M250,-10 L300,-10 L200,300 L110,300 Z', '#fff6c0', 0.09) + rayon('M330,-10 L360,-10 L320,300 L250,300 Z', '#fff6c0', 0.07) + rayon('M140,-10 L160,-10 L90,300 L50,300 Z', '#fff6c0', 0.05);
    s += Pa('M0,204 C80,192 160,208 240,198 C300,192 360,202 400,196 L400,300 L0,300 Z', G('sol'), 0) + Tr('M0,204 C80,192 160,208 240,198 C300,192 360,202 400,196', '#6a9a4a', 2, 0.7);
    for(var k = 0; k < 10; k++){ s += El(rnd() * 400, 214 + rnd() * 84, 16 + rnd() * 18, 4 + rnd() * 3, '#e8f6a0', 0, ' opacity=".13"'); }
    for(k = 0; k < 12; k++){ var gx = rnd() * 400, gy = 210 + rnd() * 86; s += Tr('M' + f1(gx) + ',' + f1(gy) + ' l-2,-7 M' + f1(gx + 3) + ',' + f1(gy) + ' l1,-8 M' + f1(gx + 6) + ',' + f1(gy) + ' l3,-6', '#7aaa4a', 1.6, 0.8); }
    s += Pa('M14,302 C18,220 20,120 22,-6 L50,-6 C52,120 54,220 60,302 Z', G('tr')) + Pa('M336,302 C338,220 340,120 342,-6 L370,-6 C372,120 374,220 380,302 Z', G('tr'));
    s += Tr('M48,78 C70,74 92,70 118,74', K, 7) + Tr('M48,78 C70,74 92,70 118,74', '#6a4428', 3.6) + Tr('M340,66 C318,62 298,60 276,64', K, 7) + Tr('M340,66 C318,62 298,60 276,64', '#6a4428', 3.6);
    for(k = 0; k < 12; k++){ var cx = k * 36 - 10, cy = 4 + (k % 3) * 8; s += Ci(cx, cy, 24 + (k % 2) * 6, k % 2 ? '#1f4a2a' : '#2a5a32', 2) + Ci(cx - 6, cy + 6, 6, '#4f8a4a', 0, ' opacity=".7"'); }
    s += Pa('M60,300 C70,270 90,262 110,266 C126,258 140,270 136,300 Z', '#2f6a32', 1.6, ' opacity=".9"');
    return s;
  },
  slots:[
    {x:100, y:74, s:0.82, k:['oiseau']}, {x:300, y:62, s:0.82, k:['oiseau'], m:1},
    {x:176, y:134, s:0.85, k:['papillon']}, {x:244, y:106, s:0.8, k:['papillon']},
    {x:112, y:214, s:0.8, k:['baies', 'fougere', 'rocher']}, {x:200, y:208, s:0.75, k:['baies', 'souche', 'champignon']},
    {x:282, y:212, s:0.8, k:['fougere', 'baies', 'rocher']},
    {x:150, y:254, s:0.85, k:['champignon', 'escargot', 'fleurs']}, {x:316, y:254, s:0.85, k:['escargot', 'fleurs', 'champignon']},
    {x:40, y:294, s:1, k:['fougere', 'rocher', 'souche']}, {x:112, y:296, s:1, k:['baies', 'champignon', 'escargot', 'fleurs']},
    {x:196, y:292, s:1, k:['rocher', 'baies', 'fleurs']}, {x:268, y:296, s:1, k:['champignon', 'escargot', 'fleurs', 'baies']},
    {x:356, y:294, s:1, k:['baies', 'fougere', 'souche']}
  ]});

/* --- Le moulin --- */
TH('moulin', {nom:'Le moulin', ic:'🌾', fondCss:'#5a3a22',
  bg:function(i){ var G = gU(i), rnd = alea(43);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#7a5232', 0], ['#4a2e1a', 1]], 1) + lg(i + 'sol', [['#a07e56', 0], ['#6a4a2a', 1]], 1) + lg(i + 'rai', [['#fff2c8', 0, 0.3], ['#fff2c8', 1, 0]], 1) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>';
    var l = ''; for(var y = 22; y < 240; y += 22) l += 'M0,' + y + ' H400 ';
    s += Tr(l, '#2a160c', 1.8, 0.5);
    s += '<g transform="translate(64,62)" opacity=".55">' + Pa(engrenagePath(12, 54, 44), '#5a3a22', 3) + Ci(0, 0, 18, '#4a2e1a', 3) + Ci(0, 0, 6, '#2a160c', 2) + '</g>';
    s += Re(116, -4, 14, 246, 2, G('bS')) + Re(292, -4, 14, 246, 2, G('bS')) + Tr('M130,40 L292,180', K, 9) + Tr('M130,40 L292,180', '#6a4428', 5.5);
    s += Re(306, 14, 72, 52, 3, '#ffe9b0') + Tr('M342,14 V66 M306,40 H378', '#6a4428', 3.4) + Re(306, 14, 72, 52, 3, 'none', 3);
    s += '<path d="M306,66 L378,66 L250,246 L110,246 Z" fill="' + G('rai') + '"/>';
    for(var k = 0; k < 18; k++){ var t = rnd(), u = rnd(); s += Ci(306 + 72 * u - (196 * t) * (0.9 + u * 0.2), 66 + 180 * t, 0.8 + rnd() * 1.2, '#fff8e0', 0, ' opacity="' + f1(0.4 + rnd() * 0.5) + '"'); }
    s += planche(G, 8, 204, 130);
    s += Pa('M0,242 L400,242 L400,300 L0,300 Z', G('sol'), 0) + Tr('M0,242 H400', K, 2.4);
    var p = ''; for(var x = -40; x < 440; x += 44) p += 'M' + (200 + (x - 200) * 0.8) + ',242 L' + x + ',300 ';
    s += Tr(p, '#4a2e1a', 1.6, 0.6);
    for(k = 0; k < 6; k++) s += El(30 + rnd() * 340, 252 + rnd() * 42, 10 + rnd() * 12, 2.4, '#fff8e8', 0, ' opacity=".3"');
    return s;
  },
  slots:[
    {x:34, y:130, s:0.8, k:['pain', 'bocal', 'bougie']}, {x:82, y:130, s:0.8, k:['sac', 'bocal', 'seau']},
    {x:130, y:130, s:0.8, k:['bougie', 'pain', 'bocal']}, {x:178, y:130, s:0.8, k:['seau', 'sac', 'pain']},
    {x:250, y:178, s:1, k:['engrenage']}, {x:340, y:216, s:0.82, k:['engrenage']},
    {x:212, y:4, s:0.85, k:['lanterne']},
    {x:150, y:252, s:0.75, k:['souris', 'seau', 'pain']},
    {x:40, y:294, s:1, k:['sac', 'gerbe', 'caisse']}, {x:108, y:296, s:1, k:['sac', 'seau', 'souris']},
    {x:180, y:292, s:1, k:['gerbe', 'sac', 'caisse']}, {x:250, y:296, s:1, k:['souris', 'pain', 'seau']},
    {x:318, y:292, s:1, k:['sac', 'gerbe', 'caisse']}, {x:378, y:294, s:0.95, k:['gerbe', 'seau', 'souris']}
  ]});

/* --- Le puits --- */
TH('puits', {nom:'Le puits', ic:'🪣', fondCss:'#1a2a4a',
  bg:function(i){ var G = gU(i), rnd = alea(88);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'nuit', [['#0f1c38', 0], ['#26405a', 0.7], ['#3a5a6a', 1]], 1) + lg(i + 'sol', [['#4a5a64', 0], ['#2a3440', 1]], 1) +
      lg(i + 'pu', [['#9aa6b0', 0], ['#6a7680', 1]]) + rg(i + 'mou', [['#b6ff7a', 0, 0.25], ['#b6ff7a', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="230" fill="' + G('nuit') + '"/>' + Ci(60, 30, 12, '#fff4cf', 0) + '<circle cx="60" cy="30" r="30" fill="' + G('hl') + '"/>';
    [[120, 16], [180, 34], [300, 20], [360, 44], [240, 10]].forEach(function(q){ s += Ci(q[0], q[1], 1.2, '#ffffff', 0); });
    s += pierres(rnd, 0, 66, 400, 224, 24, '#5a6a74');
    s += Pa('M0,66 C40,58 70,70 110,62 C150,56 190,68 230,60 C280,54 330,68 400,60 L400,72 L0,74 Z', '#4f8a5a', 1.6);
    for(var k = 0; k < 7; k++) s += El(rnd() * 400, 90 + rnd() * 120, 10 + rnd() * 10, 4, '#4f8a5a', 0, ' opacity=".6"');
    s += '<ellipse cx="200" cy="260" rx="220" ry="60" fill="' + G('mou') + '"/>';
    s += '<rect x="0" y="222" width="400" height="78" fill="' + G('sol') + '"/>' + paves(rnd, 222, 300, 'rgba(255,255,255,.06)') + El(320, 280, 30, 5, '#8ab0c8', 0, ' opacity=".35"') + El(70, 262, 22, 4, '#8ab0c8', 0, ' opacity=".3"');
    s += Re(146, 92, 10, 96, 2, G('bS')) + Re(244, 92, 10, 96, 2, G('bS'));
    s += Pa('M140,186 L140,262 C140,278 260,278 260,262 L260,186 Z', G('pu'));
    var pi = ''; for(var r = 0; r < 4; r++) for(var x = 140 + (r % 2) * 14; x < 260; x += 28) pi += 'M' + x + ',' + (198 + r * 18) + ' h24 ';
    s += Tr(pi, '#4a5660', 2.4, 0.6) + El(200, 186, 62, 12, '#aab6c0') + El(200, 186, 50, 8, '#0a0e18', 2) + Pa('M150,200 C160,206 172,204 180,210 C170,214 158,212 150,206 Z', '#4f8a5a', 1.4);
    s += Re(150, 104, 100, 8, 2, G('bH')) + Tr('M250,108 h12 v12', K, 3) + Re(258, 118, 10, 5, 2, '#d29a5e', 1.6);
    s += Pa('M128,98 L200,54 L272,98 L262,103 L200,66 L138,103 Z', '#7a4a2a') + Tr('M150,92 L200,62 M250,92 L200,62', '#a86a3a', 2, 0.6);
    s += Tr('M200,112 V176', '#c9a874', 2.2) + Tr('M196,176 h8', '#6a6a7a', 2.4);
    return s;
  },
  slots:[
    {x:226, y:112, s:0.72, k:['lanterne']},
    {x:168, y:184, s:0.78, k:['seau']}, {x:234, y:184, s:0.72, k:['grenouille', 'escargot', 'mousse']},
    {x:40, y:132, s:0.75, k:['mousse', 'fougere', 'champignon']}, {x:362, y:122, s:0.75, k:['mousse', 'champignon', 'escargot']},
    {x:62, y:224, s:0.88, k:['fougere', 'rocher']}, {x:338, y:224, s:0.88, k:['fougere', 'mousse', 'rocher']},
    {x:112, y:242, s:0.8, k:['champignon', 'escargot', 'mousse']}, {x:292, y:242, s:0.8, k:['mousse', 'grenouille', 'champignon']},
    {x:36, y:296, s:1, k:['seau', 'rocher', 'grenouille']}, {x:106, y:296, s:1, k:['grenouille', 'mousse', 'champignon', 'escargot']},
    {x:200, y:298, s:0.95, k:['mousse', 'escargot', 'grenouille']}, {x:294, y:296, s:1, k:['rocher', 'fougere', 'champignon']},
    {x:364, y:296, s:1, k:['seau', 'grenouille', 'escargot']}
  ]});

/* ---------- Ingrédients rares à cueillir ---------- */
var INGR_DESSIN = {
  champignon:{t:'champiLum', c:'#8ff3ff', art:'des champignons lumineux', ic:'🍄', theme:'cave'},
  baies:{t:'baies', c:'#7d3aa8', art:'des baies de sureau', ic:'🫐', theme:'baies'},
  lune:{t:'lune', c:'#eef0ff', art:'de la poussière de lune', ic:'✨', theme:'puits'},
  lavande:{t:'lavande', c:'#a77bf0', art:'de la lavande', ic:'🪻', theme:'herboristerie'},
  menthe:{t:'feuillage', v:0, c:'#3fa88a', art:'de la menthe poivrée', ic:'🌿', theme:'baies'},
  ortie:{t:'feuillage', v:1, c:'#2f7a4a', art:'de l\'ortie piquante', ic:'🌱', theme:'lisiere'},
  trefle:{t:'trefle', c:'#4f9a5c', art:'du trèfle des lièvres', ic:'☘️', theme:'lisiere'},
  pensee:{t:'pensee', c:'#ffd84a', art:'des pensées sauvages', ic:'🌼', theme:'lisiere'},
  racine:{t:'racine', c:'#9b6a3c', art:'une racine du Vieux Chêne', ic:'🪵', theme:'baies'},
  miel:{t:'miel', c:'#f3c13e', art:'du miel des ruches', ic:'🍯', theme:'marche'},
  eau:{t:'fiole', c:'#3f7fe0', art:'de l\'eau de la fontaine', ic:'💧', theme:'place'},
  brume:{t:'bocal', c:'#c9d3ff', art:'de la brume du lavoir', ic:'🌫️', theme:'puits'},
  rare:{t:'fleurRare', c:'#8ff3ff', art:'une plante rare', ic:'🌸', theme:'baies'}
};
var THEME_MOTS = [[/champi|cave|cellier/, 'cave'], [/baie|myrtille|sureau/, 'baies'], [/moulin|farine|ble/, 'moulin'], [/puits/, 'puits'], [/taverne|auberge/, 'taverne'],
  [/marche|etal|stand/, 'marche'], [/herbo|iris|bouquet/, 'herboristerie'], [/lisiere|foret|bois/, 'lisiere'], [/place|village|fontaine/, 'place'], [/labo|atelier|etagere/, 'labo']];
var INGR_MOTS = [[/champi/, 'champignon'], [/baie|myrtille|sureau|mure/, 'baies'], [/lune|etoile|astre/, 'lune'], [/lavand/, 'lavande'], [/menth/, 'menthe'], [/orti/, 'ortie'],
  [/trefl/, 'trefle'], [/pense/, 'pensee'], [/racin/, 'racine'], [/miel/, 'miel'], [/brume/, 'brume'], [/eau|rosee/, 'eau']];
function themeDe(t){
  if(!t) return null;
  if(THEMES[t]) return THEMES[t];
  var s = sansAccents(t);
  for(var k = 0; k < THEME_MOTS.length; k++) if(THEME_MOTS[k][0].test(s)) return THEMES[THEME_MOTS[k][1]];
  return null;
}
function ingredientDe(x){
  if(!x) return null;
  var id = typeof x === 'string' ? x : (x.id || x.nom || '');
  if(INGR_DESSIN[id]) return Object.assign({id:id}, INGR_DESSIN[id]);
  var s = sansAccents(id), k = 'rare';
  for(var j = 0; j < INGR_MOTS.length; j++) if(INGR_MOTS[j][0].test(s)){ k = INGR_MOTS[j][1]; break; }
  return Object.assign({id:k}, INGR_DESSIN[k], {libre:String(typeof x === 'string' ? x : (x.nom || x.id))});
}
/* Thème d'une partie : params.theme, sinon celui de l'ingrédient, sinon au hasard (mémorisé dans p._theme). */
function choisirTheme(p){
  p = p || {};
  if(p._theme && THEMES[p._theme]) return THEMES[p._theme];
  var th = themeDe(p.theme), ing = ingredientDe(p.ingredient);
  if(!th && ing) th = THEMES[ing.theme];
  if(!th) th = THEMES[U.choix(Object.keys(THEMES))];
  try{ p._theme = th.id; }catch(e){}
  return th;
}

/* ---------- Génération d'une scène et de ses différences ---------- */
var NON_INGR = {fenetre:1, lampadaire:1, tableau:1, horloge:1, engrenage:1, papillon:1, oiseau:1, fanions:1, panneau:1, toile:1};
function choisirType(k, used){
  var poids = k.map(function(t){ return 1 / (1 + 1.6 * (used[t] || 0)); }), tot = poids.reduce(function(a, b){ return a + b; }, 0), r = Math.random() * tot;
  for(var i = 0; i < k.length; i++){ r -= poids[i]; if(r <= 0) return k[i]; }
  return k[k.length - 1];
}
function nouvelObjet(t, sl){
  var def = DES[t];
  var o = {t:t, x:sl.x, y:sl.y, s:sl.s || 1, sl:sl, c:U.choix(def.pal || VIF), d:Math.random() < 0.6, n:def.n ? U.randInt(def.n[0], def.n[1]) : 1, v:U.randInt(0, 3), m:!!sl.m};
  if(def.asym && !sl.fixe && !sl.m) o.m = Math.random() < 0.35;
  if(t === 'lanterne' || t === 'lampadaire') o.d = Math.random() < 0.85;
  return o;
}
function boite(o, dx){
  var def = DES[o.t], w = def.w * o.s, h = def.h * o.s, x = o.x + (dx || 0);
  return def.pend ? {x0:x - w, y0:o.y, x1:x + w, y1:o.y + h} : {x0:x - w, y0:o.y - h, x1:x + w, y1:o.y};
}
function aire(o){ var b = boite(o); return (b.x1 - b.x0) * (b.y1 - b.y0); }
function chevauche(a, b, m){ return a.x0 < b.x1 + m && a.x1 > b.x0 - m && a.y0 < b.y1 + m && a.y1 > b.y0 - m; }
function poserIngredient(objs, ingr){
  var ok = objs.filter(function(o){ return !DES[o.t].pend && !NON_INGR[o.t] && !o.sl.fixe && o.s >= 0.74; });
  ok.sort(function(a, b){ return (b.y + Math.random() * 60) - (a.y + Math.random() * 60); });
  var choisis = [];
  ok.forEach(function(o){ if(choisis.length < 3 && choisis.every(function(c){ return Math.abs(c.x - o.x) > 70 || Math.abs(c.y - o.y) > 60; })) choisis.push(o); });
  choisis.forEach(function(o){
    var def = DES[ingr.t];
    o.t = ingr.t; o.c = ingr.c; o.v = ingr.v || 0; o.ingr = true; o.m = false;
    o.n = def.n ? Math.max(def.n[0], def.n[1] - 1) : 1; o.d = true;
  });
}
function autreCouleur(pal, c, pres){
  var autres = pal.filter(function(x){ return x !== c; }).map(function(x){ return {x:x, e:ecart(x, c)}; });
  if(pres){ autres = autres.filter(function(a){ return a.e > 110; }).sort(function(a, b){ return a.e - b.e; }); return autres.length ? autres[0].x : null; }
  autres.sort(function(a, b){ return b.e - a.e; });
  return autres.length ? U.choix(autres.slice(0, 2)).x : null;
}
function placeLibre(o, amp, objs){
  var dirs = U.melanger([-1, 1]);
  for(var k = 0; k < 2; k++){
    var bx = boite(o, dirs[k] * amp);
    if(bx.x0 < 2 || bx.x1 > 398) continue;
    var libre = objs.every(function(p){
      if(p === o) return true;
      var q = boite(p);
      return !(bx.x0 < q.x1 - 7 && bx.x1 > q.x0 + 7 && bx.y0 < q.y1 - 7 && bx.y1 > q.y0 + 7);
    });
    if(libre) return dirs[k];
  }
  return 0;
}
var SORTES = {
  facile:['absent', 'absent', 'couleur', 'couleur', 'nombre', 'detail'],
  moyen:['absent', 'couleur', 'nombre', 'detail', 'miroir', 'deplace'],
  fin:['couleur', 'teinte', 'nombre', 'detail', 'miroir', 'deplace', 'absent'],
  expert:['teinte', 'detail', 'miroir', 'deplace', 'nombre', 'teinte', 'deplace']
};
function appliquer(o, sorte, n, objs){
  var def = DES[o.t], b = Object.assign({}, o);
  if(sorte === 'absent'){ b.absent = true; return b; }
  if(sorte === 'couleur' || sorte === 'teinte'){
    if(def.pal === null || (def.couleurSi && !def.couleurSi(o))) return null;
    b.c = autreCouleur(def.pal || VIF, o.c, sorte === 'teinte'); return b.c ? b : null;
  }
  if(sorte === 'nombre'){
    if(!def.n || (def.nSubtil && n < 6)) return null;
    var lo = def.n[0], hi = def.n[1], dn = (n <= 2 || def.nSubtil) && hi - lo >= 2 ? 2 : 1, up = o.n + dn <= hi, down = o.n - dn >= lo;
    if(!up && !down) return null;
    b.n = up && (!down || Math.random() < 0.5) ? o.n + dn : o.n - dn; return b;
  }
  if(sorte === 'detail'){ if(!def.d || (n <= 3 && def.d !== 'gros')) return null; b.d = !o.d; return b; }
  if(sorte === 'miroir'){ if(!def.asym || o.sl.fixe || (def.asymSi && !def.asymSi(o))) return null; b.m = !o.m; return b; }
  if(sorte === 'deplace'){
    if(o.sl.fixe || DES[o.t].h * o.s > 80) return null;
    var amp = n <= 5 ? 30 : (n <= 8 ? 24 : 18), dir = placeLibre(o, amp, objs);
    if(!dir) return null;
    b.x = o.x + dir * amp; return b;
  }
  return null;
}
function choisirDiffs(objs, n, nDiff){
  var pool = n <= 2 ? SORTES.facile : (n <= 5 ? SORTES.moyen : (n <= 8 ? SORTES.fin : SORTES.expert));
  var cand = U.melanger(objs.map(function(o, i){ return i; }));
  if(n <= 2) cand.sort(function(a, b){ return aire(objs[b]) * U.rand(0.7, 1.3) - aire(objs[a]) * U.rand(0.7, 1.3); });
  var diffs = [];
  for(var pass = 0; pass < 3 && diffs.length < nDiff; pass++){
    var marge = pass === 0 ? 8 : (pass === 1 ? 2 : -6), sortes = pass === 2 ? SORTES.moyen.concat(SORTES.fin) : pool;
    cand.forEach(function(i){
      if(diffs.length >= nDiff || diffs.some(function(d){ return d.i === i; })) return;
      var o = objs[i];
      if(n <= 2 && pass === 0 && aire(o) < 900) return;
      var bo = boite(o);
      if(diffs.some(function(d){ return chevauche(bo, d.box, marge); })) return;
      var ss = U.melanger(sortes);
      for(var k = 0; k < ss.length; k++){
        var b = appliquer(o, ss[k], n, objs);
        if(!b) continue;
        var bb = b.absent ? bo : boite(b), bx = {x0:Math.min(bo.x0, bb.x0), y0:Math.min(bo.y0, bb.y0), x1:Math.max(bo.x1, bb.x1), y1:Math.max(bo.y1, bb.y1)};
        if(diffs.some(function(d){ return chevauche(bx, d.box, marge); })) continue;
        diffs.push({i:i, sorte:ss[k], b:b, cote:Math.random() < 0.5 ? 0 : 1, box:bx});
        break;
      }
    });
  }
  diffs.forEach(function(d){
    var bx = d.box;
    d.x = (bx.x0 + bx.x1) / 2; d.y = (bx.y0 + bx.y1) / 2;
    d.rx = Math.max(22, (bx.x1 - bx.x0) / 2 + 6); d.ry = Math.max(22, (bx.y1 - bx.y0) / 2 + 6);
  });
  return diffs;
}
function genererScene(th, n, nDiff, ingr){
  var objs = [], used = {};
  th.slots.forEach(function(sl){ var t = choisirType(sl.k, used); used[t] = (used[t] || 0) + 1; objs.push(nouvelObjet(t, sl)); });
  if(ingr) poserIngredient(objs, ingr);
  return {th:th, objs:objs, diffs:choisirDiffs(objs, n, nDiff)};
}
function e2(v){ return String(Math.round(v * 100) / 100); }
function dessinerObjet(o){
  if(o.absent) return '';
  var def = DES[o.t];
  return '<g transform="translate(' + f1(o.x) + ',' + f1(o.y) + ') scale(' + e2((o.m ? -1 : 1) * o.s) + ',' + e2(o.s) + ')">' +
    (o.ingr ? Halo(0, def.pend ? def.h / 2 : -def.h / 2, def.w + 14, def.h / 2 + 10, '#fff2b0', 0.16) : '') + def.art(o) + '</g>';
}
function imageSVG(scene, k, pref){
  var mods = {};
  scene.diffs.forEach(function(d){ if(d.cote === k) mods[d.i] = d.b; });
  return '<svg class="mjo-d-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" data-img="' + k + '">' + scene.th.bg(pref) +
    '<g class="mjo-d-objets">' + scene.objs.map(function(o, i){ return dessinerObjet(mods[i] || o); }).join('') + '</g>' +
    '<g class="mjo-d-marques"></g></svg>';
}
