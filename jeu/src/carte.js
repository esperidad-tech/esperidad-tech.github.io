/* ==========================================================
   Brumeval v2 — la carte du village vue du dessus
   Carte.LIEUX, Carte.MAISONS, Carte.svg(opts)
   Options ajoutées le 5 novembre (DESIGN 12.19) : visages {id: image ronde}, habitants {maison: id | {id, nom}} (le rond du visage
   sur le toit), marqueurs avec visage (la présence d'un villageois ; chez lui : une pastille sur son rond), aides:false (dès l'enquête 2 :
   plus d'anneau jaune ni d'étiquette dorée, tous les lieux se touchent).
   ========================================================== */
(function(){
'use strict';

var CONTOUR = '#24182e';
var W = 1000, H = 1400;

/* ---------- Lieux (positions finales) ---------- */
var LIEUX = {
  place:        {nom:'La place des Lanternes', court:'Place des Lanternes', ic:'⛲', x:500, y:745, zone:'village'},
  mairie:       {nom:'La mairie', court:'Mairie', ic:'🏛️', x:385, y:610, zone:'village'},
  clocher:      {nom:'Le clocher', court:'Clocher', ic:'🔔', x:660, y:590, zone:'village'},
  taverne:      {nom:'La taverne du Chaudron fêlé', court:'Taverne', ic:'🍲', x:285, y:745, zone:'village'},
  boulangerie:  {nom:'La boulangerie', court:'Boulangerie', ic:'🥖', x:742, y:672, zone:'village', maison:'F1'},
  poste:        {nom:'La poste', court:'Poste', ic:'✉️', x:575, y:1100, zone:'village', maison:'L6'},
  atelier:      {nom:'L\'atelier de couture', court:'Couture', ic:'✂️', x:575, y:975, zone:'village', maison:'L4'},
  herboristerie:{nom:'L\'herboristerie d\'Iris', court:'Herboriste', ic:'🌿', x:830, y:893, zone:'village', maison:'F4'},
  ruelle:       {nom:'La ruelle des Brumes', court:'Ruelle des Brumes', ic:'🌫️', x:322, y:960, zone:'village'},
  lavoir:       {nom:'Le lavoir', court:'Lavoir', ic:'🧺', x:185, y:1165, zone:'village'},
  potager:      {nom:'Le potager de Basile', court:'Potager', ic:'🥕', x:270, y:1312, zone:'village'},
  foret:        {nom:'Le carrefour de la forêt', court:'Carrefour', ic:'🌲', x:500, y:270, zone:'dehors'},
  chene:        {nom:'Le Vieux Chêne', court:'Vieux Chêne', ic:'🌳', x:270, y:128, zone:'dehors'},
  clairiere:    {nom:'La clairière aux lièvres', court:'Clairière', ic:'🐇', x:730, y:140, zone:'dehors'},
  puits:        {nom:'Le puits', court:'Puits', ic:'💧', x:112, y:345, zone:'dehors'},
  moulin:       {nom:'Le moulin', court:'Moulin', ic:'🌾', x:850, y:388, zone:'dehors'},
  pont:         {nom:'Le pont', court:'Pont', ic:'🌉', x:925, y:745, zone:'dehors'},
  lisiere:      {nom:'La lisière aux baies', court:'Lisière', ic:'🍒', x:720, y:440, zone:'dehors'},
  salle_coeur:  {nom:'La salle du Cœur', court:'Salle du Cœur', ic:'💠', x:500, y:745, zone:'dessous'},
  tunnel_chene: {nom:'Le tunnel du Vieux Chêne', court:'Tunnel du Chêne', ic:'🕳️', x:300, y:205, zone:'dessous'},
  tunnel_moulin:{nom:'Le tunnel du moulin', court:'Tunnel du moulin', ic:'🕳️', x:835, y:420, zone:'dessous'},
  crypte:       {nom:'La crypte du clocher', court:'Crypte', ic:'🕯️', x:665, y:600, zone:'dessous'},
  tunnel_puits: {nom:'Le tunnel du puits', court:'Tunnel du puits', ic:'🕳️', x:135, y:370, zone:'dessous'}
};

/* ---------- Maisons numérotées ---------- */
function m(rue, num, x, y, enseigne, toit){ return {adresse: num + ', ' + rue, rue: rue, num: num, x: x, y: y, enseigne: enseigne || null, toit: toit}; }
var MAISONS = {
  L1: m('rue des Lanternes', 1, 420, 495, null, 'terre'),
  L2: m('rue des Lanternes', 2, 580, 495, null, 'ardoise'),
  L3: m('rue des Lanternes', 3, 425, 975, null, 'ocre'),
  L4: m('rue des Lanternes', 4, 575, 975, 'aiguille', 'prune'),
  L5: m('rue des Lanternes', 5, 425, 1100, null, 'mousse'),
  L6: m('rue des Lanternes', 6, 575, 1100, 'enveloppe', 'ardoise'),
  L7: m('rue des Lanternes', 7, 425, 1225, null, 'prune'),
  L8: m('rue des Lanternes', 8, 575, 1225, null, 'terre'),
  F1: m('rue du Four', 1, 742, 672, 'pain', 'terre'),
  F2: m('rue du Four', 2, 742, 815, null, 'mousse'),
  F3: m('rue du Four', 3, 840, 672, null, 'ocre'),
  F4: m('rue du Four', 4, 840, 815, 'feuille', 'mousse'),
  B1: m('ruelle des Brumes', 1, 300, 855, null, 'ardoise'),
  B2: m('ruelle des Brumes', 2, 240, 945, null, 'terre'),
  B3: m('ruelle des Brumes', 3, 180, 1035, null, 'prune')
};
var ENSEIGNES = {pain:'🥖', aiguille:'🧵', enveloppe:'✉️', feuille:'🌿'};
var LIEU_DE_MAISON = {}; Object.keys(LIEUX).forEach(function(id){ if(LIEUX[id].maison) LIEU_DE_MAISON[LIEUX[id].maison] = id; });
var HW = 45, ROOF = 52, WALL = 28;   // demi-largeur, hauteur toit, hauteur mur

/* ---------- Tracés ---------- */
var RIVIERE = [[955,-20],[925,180],[945,330],[915,500],[925,700],[950,900],[925,1120],[955,1420]];
var RUISSEAU = [[30,420],[48,600],[62,760],[82,950],[112,1090],[150,1165],[170,1290],[180,1420]];
var CHEMINS = {
  chene:    [[500,270],[430,236],[360,206],[320,190]],
  clairiere:[[500,270],[580,228],[650,190],[690,170]],
  puits:    [[500,270],[400,298],[280,328],[160,345]],
  moulin:   [[500,270],[610,296],[720,336],[800,372]]
};
var RUELLE = [[425,818],[375,880],[330,950],[290,1025],[245,1095],[205,1140]];
var ROUTE_NS = [[500,295],[500,1420]];
var RUE_FOUR = [[600,745],[900,745]];
var VERS_POTAGER = [[474,1312],[368,1312]];
var VERS_TAVERNE = [[350,748],[392,748]];

/* ---------- Outils ---------- */
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function f(n){ return Math.round(n * 10) / 10; }
function lisse(pts){
  if(pts.length < 3) return 'M' + pts.map(function(p){ return f(p[0]) + ' ' + f(p[1]); }).join(' L');
  var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  for(var i = 0; i < pts.length - 1; i++){
    var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C' + f(c1x) + ' ' + f(c1y) + ' ' + f(c2x) + ' ' + f(c2y) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d;
}
function distSeg(px, py, a, b){
  var dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  var t = l ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l)) : 0;
  var x = a[0] + t * dx - px, y = a[1] + t * dy - py;
  return Math.sqrt(x * x + y * y);
}
function distLigne(px, py, pts){ var d = 1e9; for(var i = 0; i < pts.length - 1; i++) d = Math.min(d, distSeg(px, py, pts[i], pts[i + 1])); return d; }
function largeurTexte(t, taille){
  var n = 0; for(var i = 0; i < t.length; i++){ var c = t.charCodeAt(i); if(c >= 0xD800 && c <= 0xDBFF){ n += 1.25; i++; } else if(c > 0x2000) n += 1.1; else n += (t[i] === ' ' ? 0.32 : (/[A-ZÉÈ]/.test(t[i]) ? 0.68 : 0.56)); }
  return n * taille;
}
function estSvg(ic){ return typeof ic === 'string' && /^\s*<svg/i.test(ic); }
function svgImbrique(ic, x, y, s){ return ic.replace(/^\s*<svg/i, '<svg x="' + f(x) + '" y="' + f(y) + '" width="' + s + '" height="' + s + '"'); }

/* ---------- Bâtiments (rectangles d'emprise) ---------- */
var EMPRISES = [];
Object.keys(MAISONS).forEach(function(k){ var h = MAISONS[k]; EMPRISES.push([h.x - HW - 8, h.y - 42, h.x + HW + 8, h.y + 42]); });
EMPRISES.push([306, 560, 464, 658]);   // mairie
EMPRISES.push([620, 465, 700, 655]);   // clocher
EMPRISES.push([215, 696, 355, 795]);   // taverne
EMPRISES.push([110, 1118, 258, 1212]); // lavoir
EMPRISES.push([170, 1265, 372, 1368]); // potager
EMPRISES.push([768, 858, 896, 930]);   // jardin de lavande
EMPRISES.push([795, 340, 905, 432]);   // moulin
EMPRISES.push([655, 1000, 885, 1190]); // champ de blé
function dansEmprise(x, y, marge){ for(var i = 0; i < EMPRISES.length; i++){ var e = EMPRISES[i]; if(x > e[0] - marge && x < e[2] + marge && y > e[1] - marge && y < e[3] + marge) return true; } return false; }

/* ---------- Arbres (générés une fois, toujours identiques) ---------- */
var ARBRES = (function(){
  var r = rng(4242), liste = [];
  function lisiereY(x){ return 432 + 14 * Math.sin(x / 47) + 8 * Math.sin(x / 13); }
  function libre(x, y, rad, foret){
    if(distLigne(x, y, RIVIERE) < 34 + rad * 0.75) return false;
    if(distLigne(x, y, RUISSEAU) < 14 + rad * 0.8) return false;
    for(var k in CHEMINS) if(distLigne(x, y, CHEMINS[k]) < 14 + rad * 0.78) return false;
    if(Math.abs(x - 500) < 30 + rad * 0.8 && y > 280) return false;
    var trous = [[500,270,78],[270,128,150],[730,140,118],[112,345,72],[850,388,96],[720,440,62],[500,745,132]];
    for(var i = 0; i < trous.length; i++){ var t = trous[i]; var dx = x - t[0], dy = y - t[1]; if(Math.sqrt(dx * dx + dy * dy) < t[2] + rad * 0.5) return false; }
    if(foret){ if(y + rad * 0.7 > lisiereY(x)) return false; }
    else {
      if(dansEmprise(x, y, rad * 0.9)) return false;
      if(distLigne(x, y, RUELLE) < 16 + rad) return false;
      if(distLigne(x, y, RUE_FOUR) < 26 + rad) return false;
      if(distLigne(x, y, VERS_POTAGER) < 16 + rad) return false;
    }
    for(var j = 0; j < liste.length; j++){ var a = liste[j]; var ddx = x - a.x, ddy = y - a.y; if(Math.sqrt(ddx * ddx + ddy * ddy) < (rad + a.r) * (foret ? 0.74 : 1.15)) return false; }
    return true;
  }
  for(var i = 0; i < 6000 && liste.length < 175; i++){
    var x = r() * 1060 - 30, y = r() * 470 - 40, rad = 25 + r() * 22;
    if(libre(x, y, rad, true)) liste.push({x:x, y:y, r:rad, v:Math.floor(r() * 3), foret:true});
  }
  var n = liste.length;
  for(var k = 0; k < 4000 && liste.length < n + 46; k++){
    var vx = r() * 1040 - 20, vy = 470 + r() * 950, vr = 17 + r() * 14;
    if(libre(vx, vy, vr, false)) liste.push({x:vx, y:vy, r:vr, v:Math.floor(r() * 3), foret:false});
  }
  liste.sort(function(a, b){ return a.y - b.y; });
  return liste;
})();

/* Fleurs, cailloux, détails (fixes) */
var FLEURS = (function(){
  var r = rng(77), l = [], cols = ['#ffe9a8','#ff9fc0','#cdb6ff','#ffffff','#ffd27a'];
  for(var i = 0; i < 900 && l.length < 120; i++){
    var x = r() * 1000, y = 470 + r() * 930;
    if(dansEmprise(x, y, 6) || Math.abs(x - 500) < 36 || distLigne(x, y, RIVIERE) < 40 || distLigne(x, y, RUISSEAU) < 16 || distLigne(x, y, RUELLE) < 20 || distLigne(x, y, RUE_FOUR) < 30) continue;
    var dx = x - 500, dy = y - 745; if(Math.sqrt(dx * dx + dy * dy) < 125) continue;
    l.push({x:x, y:y, c:cols[Math.floor(r() * cols.length)], s:3 + r() * 3});
  }
  return l;
})();

/* ---------- Définitions (dégradés, motifs) ---------- */
function defs(p){
  function rad(id, stops, cx, cy, rr){ return '<radialGradient id="' + p + id + '" cx="' + (cx || '35%') + '" cy="' + (cy || '30%') + '" r="' + (rr || '75%') + '">' + stops + '</radialGradient>'; }
  function lin(id, stops, vert){ return '<linearGradient id="' + p + id + '" x1="0" y1="0" x2="' + (vert === false ? 1 : 0) + '" y2="' + (vert === false ? 0 : 1) + '">' + stops + '</linearGradient>'; }
  function st(o, c, a){ return '<stop offset="' + o + '" stop-color="' + c + '"' + (a !== undefined ? ' stop-opacity="' + a + '"' : '') + '/>'; }
  var toits = {
    terre:  ['#e0805f','#c4583f','#93392b'],
    ardoise:['#8a9bd0','#5f6fa6','#414c7c'],
    prune:  ['#c07aa2','#985078','#6c3556'],
    ocre:   ['#e6b866','#c48f3c','#8f6526'],
    mousse: ['#8fc27a','#649a55','#45703e'],
    chaume: ['#e2be7a','#bf9452','#8d6a37']
  };
  var s = '<defs>';
  s += lin('herbe', st(0,'#78b469') + st(.5,'#64a15e') + st(1,'#4f8c55'));
  s += lin('foret', st(0,'#24533c') + st(1,'#2f6447'));
  s += rad('a0', st(0,'#9ad67c') + st(.55,'#4f9a52') + st(1,'#2c6a3c'));
  s += rad('a1', st(0,'#7cc977') + st(.55,'#38875a') + st(1,'#215c3e'));
  s += rad('a2', st(0,'#b5d97a') + st(.55,'#6a9e48') + st(1,'#3d6b31'));
  s += rad('chene', st(0,'#8fd27c') + st(.5,'#3f8a4c') + st(1,'#1b4d31'));
  s += lin('eau', st(0,'#5aa3dc') + st(1,'#3b76b4'), false);
  s += rad('eauR', st(0,'#7cc0ec') + st(1,'#3a74b0'), '45%', '40%', '70%');
  s += lin('mur', st(0,'#fbf0d6') + st(1,'#d9c39a'));
  s += lin('pierre', st(0,'#cfc8da') + st(1,'#8f88a6'));
  s += lin('bois', st(0,'#b07b4c') + st(1,'#7a5131'));
  s += rad('pave', st(0,'#e3d3ad') + st(.7,'#c9b48a') + st(1,'#ab956c'), '50%', '45%', '60%');
  s += lin('route', st(0,'#d8c7a2') + st(1,'#c1ad84'), false);
  s += lin('terre', st(0,'#a98257') + st(1,'#8d6a45'));
  Object.keys(toits).forEach(function(k){ var c = toits[k]; s += lin('t-' + k, st(0, c[0]) + st(.55, c[1]) + st(1, c[2])); });
  s += rad('brume', st(0,'#ffffff',.75) + st(.6,'#ffffff',.3) + st(1,'#ffffff',0), '50%', '50%', '50%');
  s += rad('vignette', st(.55,'#ffffff',0) + st(.85,'#eef2ff',.35) + st(1,'#eef2ff',.75), '50%', '50%', '72%');
  s += rad('lueur', st(0,'#fff3c4',1) + st(.35,'#ffc457',.65) + st(1,'#ff9a2e',0), '50%', '50%', '50%');
  s += rad('cyan', st(0,'#e8feff',1) + st(.35,'#8ff3ff',.7) + st(1,'#3fd0ff',0), '50%', '50%', '50%');
  s += rad('baie', st(0,'#ff8a8a') + st(1,'#b8202f'));
  s += lin('dessous', st(0,'#1d1626') + st(1,'#120d18'));
  s += lin('galerie', st(0,'#6e4f38') + st(1,'#4a3424'));
  s += '<pattern id="' + p + 'paves" width="26" height="22" patternUnits="userSpaceOnUse">' +
       '<rect x="1" y="1" width="11" height="9" rx="3" fill="#000" opacity=".07"/><rect x="14" y="1" width="11" height="9" rx="3" fill="#fff" opacity=".1"/>' +
       '<rect x="7" y="12" width="11" height="9" rx="3" fill="#000" opacity=".06"/><rect x="20" y="12" width="6" height="9" rx="3" fill="#fff" opacity=".08"/></pattern>';
  s += '<pattern id="' + p + 'herbeT" width="60" height="60" patternUnits="userSpaceOnUse">' +
       '<path d="M8 14l3-7 3 7M38 44l3-7 3 7M44 10l2-6 2 6" stroke="#3f7a45" stroke-width="2" fill="none" opacity=".35"/></pattern>';
  s += '</defs>';
  return s;
}

/* ---------- Dessins de base ---------- */
function arbre(p, a){
  var c = 'url(#' + p + 'a' + a.v + ')';
  return '<ellipse cx="' + f(a.x + 7) + '" cy="' + f(a.y + 9) + '" rx="' + f(a.r) + '" ry="' + f(a.r * .9) + '" fill="#0a1a12" opacity=".28"/>' +
    '<circle cx="' + f(a.x) + '" cy="' + f(a.y) + '" r="' + f(a.r) + '" fill="' + c + '" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<circle cx="' + f(a.x - a.r * .3) + '" cy="' + f(a.y - a.r * .34) + '" r="' + f(a.r * .36) + '" fill="#fff" opacity=".13"/>';
}

function eau(p, pts, larg, classe){
  var d = lisse(pts);
  return '<path d="' + d + '" fill="none" stroke="#2a4a6a" stroke-width="' + (larg + 10) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + d + '" fill="none" stroke="#3d79b6" stroke-width="' + larg + '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + d + '" fill="none" stroke="#5ea6de" stroke-width="' + (larg * .55) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>' +
    '<path class="ca-flot ' + (classe || '') + '" d="' + d + '" fill="none" stroke="#dff4ff" stroke-width="' + Math.max(2, larg * .07) + '" stroke-dasharray="10 34" stroke-linecap="round" opacity=".55"/>';
}

/* La rivière rouge (enquête 2) : la même rivière, en rouge, avec une lueur qui respire doucement (carte.css, .ca-riv-lueur ;
   immobile si l'appareil demande moins de mouvement) */
function eauRouge(p, pts, larg){
  var d = lisse(pts), bout = ' fill="none" stroke-linecap="round" stroke-linejoin="round"';
  return '<g class="ca-riv-lueur" opacity=".6"><path d="' + d + '"' + bout + ' stroke="#ff2d2d" stroke-width="' + (larg + 84) + '" opacity=".3"/>' +
      '<path d="' + d + '"' + bout + ' stroke="#ff6a55" stroke-width="' + (larg + 40) + '" opacity=".55"/></g>' +
    '<path d="' + d + '"' + bout + ' stroke="#5c1420" stroke-width="' + (larg + 10) + '"/>' +
    '<path d="' + d + '"' + bout + ' stroke="#b3202c" stroke-width="' + larg + '"/>' +
    '<path class="ca-riv-coeur" d="' + d + '"' + bout + ' stroke="#ff5a5f" stroke-width="' + (larg * .55) + '" opacity=".85"/>' +
    '<path class="ca-flot" d="' + d + '" fill="none" stroke="#ffd9d2" stroke-width="' + Math.max(2, larg * .07) + '" stroke-dasharray="10 34" stroke-linecap="round" opacity=".55"/>';
}

function chemin(pts, larg, couleur, bord){
  var d = lisse(pts);
  return '<path d="' + d + '" fill="none" stroke="' + (bord || '#6b5236') + '" stroke-width="' + (larg + 6) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>' +
    '<path d="' + d + '" fill="none" stroke="' + couleur + '" stroke-width="' + larg + '" stroke-linecap="round" stroke-linejoin="round"/>';
}

function texte(x, y, t, taille, couleur, opts){
  opts = opts || {};
  return '<text class="ca-t" x="' + f(x) + '" y="' + f(y) + '" font-size="' + taille + '" text-anchor="' + (opts.anchor || 'middle') + '" fill="' + (couleur || '#35281b') + '"' +
    (opts.contour ? ' stroke="' + opts.contour + '" stroke-width="' + (opts.cw || 5) + '" stroke-linejoin="round"' : '') +
    (opts.rot ? ' transform="rotate(' + opts.rot + ' ' + f(x) + ' ' + f(y) + ')"' : '') + ' dominant-baseline="central">' + esc(t) + '</text>';
}

function etiquette(x, y, ic, t, opts){
  opts = opts || {};
  var taille = opts.taille || 26;
  var lw = largeurTexte(t, taille) + (ic ? taille * 1.25 : 0) + 26;
  var h = taille + 16;
  var s = '<g class="ca-etiquette' + (opts.classe ? ' ' + opts.classe : '') + '">' +
    '<rect x="' + f(x - lw / 2) + '" y="' + f(y - h / 2) + '" width="' + f(lw) + '" height="' + h + '" rx="' + (h / 2) + '" fill="' + (opts.fond || '#f6ead0') + '" stroke="' + CONTOUR + '" stroke-width="3"/>';
  var tx = x - lw / 2 + 13;
  if(ic){ s += '<text class="ca-ic" x="' + f(tx + taille * .55) + '" y="' + f(y + 1) + '" font-size="' + f(taille * .92) + '" text-anchor="middle" dominant-baseline="central">' + esc(ic) + '</text>'; tx += taille * 1.25; }
  s += '<text class="ca-t" x="' + f(tx) + '" y="' + f(y + 1) + '" font-size="' + taille + '" text-anchor="start" dominant-baseline="central" fill="' + (opts.encre || '#35281b') + '">' + esc(t) + '</text>';
  return s + '</g>';
}

/* Une plaque de rue. P = {x, y, t, rot, taille, h, marge} (taille du texte, épaisseur, place aux deux bouts) */
function plaqueDims(P){ var taille = P.taille || 23; return {taille: taille, lw: largeurTexte(P.t, taille) + (P.marge === undefined ? 30 : P.marge), h: P.h || 36}; }
function plaque(P){
  var x = P.x, y = P.y, t = P.t, rot = P.rot, d = plaqueDims(P), taille = d.taille, lw = d.lw, h = d.h;
  return '<g class="ca-plaque" transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + rot + ')' : '') + '">' +
    '<rect x="' + f(-lw / 2 - 3) + '" y="' + f(-h / 2 - 3) + '" width="' + f(lw + 6) + '" height="' + (h + 6) + '" rx="10" fill="' + CONTOUR + '"/>' +
    '<rect x="' + f(-lw / 2) + '" y="' + f(-h / 2) + '" width="' + f(lw) + '" height="' + h + '" rx="8" fill="#2f5fa8" stroke="#f3e7cb" stroke-width="2.5"/>' +
    '<text class="ca-t" x="0" y="1" font-size="' + taille + '" text-anchor="middle" dominant-baseline="central" fill="#ffffff">' + esc(t) + '</text></g>';
}

/* Une maison vue de haut et un peu de face. Renvoie le dessin, note fenêtres et cheminée. */
function maisonArt(p, cx, cy, toit, ctx, opts){
  opts = opts || {};
  var x0 = cx - HW, top = cy - 40, wy = top + ROOF - 4, w = HW * 2;
  var s = '<rect x="' + f(x0 + 7) + '" y="' + f(top + 9) + '" width="' + w + '" height="' + (ROOF + WALL) + '" rx="8" fill="#0b1a10" opacity=".3"/>';
  // mur de façade
  s += '<rect x="' + f(x0 + 2) + '" y="' + f(wy) + '" width="' + (w - 4) + '" height="' + (WALL + 4) + '" rx="3" fill="url(#' + p + 'mur)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  s += '<rect x="' + f(cx - 8) + '" y="' + f(wy + 9) + '" width="16" height="' + (WALL - 5) + '" rx="7" fill="#8a5a36" stroke="' + CONTOUR + '" stroke-width="2"/>';
  var fen = [[x0 + 14, wy + 10], [x0 + w - 30, wy + 10]];
  fen.forEach(function(q){ s += '<rect x="' + f(q[0]) + '" y="' + f(q[1]) + '" width="16" height="13" rx="2" fill="#86b9dd" stroke="' + CONTOUR + '" stroke-width="2"/>'; ctx.fenetres.push(q); });
  // cheminée
  var chx = x0 + w - 30, chy = top - 4;
  s += '<rect x="' + f(chx) + '" y="' + f(chy) + '" width="15" height="22" rx="2" fill="#b4644a" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  ctx.cheminees.push([chx + 7.5, chy - 3]);
  // toit (pan avant)
  s += '<path d="M' + f(x0 - 6) + ' ' + f(top + ROOF) + ' L' + f(x0 + 9) + ' ' + f(top) + ' L' + f(x0 + w - 9) + ' ' + f(top) + ' L' + f(x0 + w + 6) + ' ' + f(top + ROOF) + ' Z" fill="url(#' + p + 't-' + toit + ')" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/>';
  s += '<path d="M' + f(x0 + 2) + ' ' + f(top + 18) + ' H' + f(x0 + w - 2) + ' M' + f(x0 - 2) + ' ' + f(top + 35) + ' H' + f(x0 + w + 2) + '" stroke="#000" stroke-width="2" opacity=".14"/>';
  s += '<path d="M' + f(x0 + 12) + ' ' + f(top + 5) + ' H' + f(x0 + w - 12) + '" stroke="#fff" stroke-width="3" opacity=".28" stroke-linecap="round"/>';
  // la cheminée repasse devant le toit
  s += '<rect x="' + f(chx) + '" y="' + f(chy) + '" width="15" height="14" rx="2" fill="#b4644a" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  if(opts.enseigne){
    var ex = x0 + w + 2, ey = wy + 4;
    s += '<path d="M' + f(ex - 6) + ' ' + f(ey - 4) + ' h16" stroke="' + CONTOUR + '" stroke-width="3"/>' +
         '<circle cx="' + f(ex + 10) + '" cy="' + f(ey + 14) + '" r="17" fill="url(#' + p + 'bois)" stroke="' + CONTOUR + '" stroke-width="2.5"/>' +
         '<text x="' + f(ex + 10) + '" y="' + f(ey + 15) + '" font-size="20" text-anchor="middle" dominant-baseline="central">' + ENSEIGNES[opts.enseigne] + '</text>';
  }
  return s;
}

function numero(cx, cy, n){
  var x = cx - HW + 4, y = cy + 26;
  return '<g class="ca-num"><circle cx="' + f(x) + '" cy="' + f(y) + '" r="21" fill="#fff6dc" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<text class="ca-t" x="' + f(x) + '" y="' + f(y + 1) + '" font-size="27" text-anchor="middle" dominant-baseline="central" fill="#35281b">' + n + '</text></g>';
}

/* ---------- Lieux remarquables ---------- */
function dessinMairie(p, ctx){
  var cx = 385, top = 562, w = 150, x0 = cx - w / 2;
  var s = '<rect x="' + (x0 + 8) + '" y="' + (top + 10) + '" width="' + w + '" height="92" rx="8" fill="#0b1a10" opacity=".3"/>';
  s += '<rect x="' + (x0 + 3) + '" y="' + (top + 52) + '" width="' + (w - 6) + '" height="40" rx="3" fill="url(#' + p + 'mur)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  for(var i = 0; i < 4; i++){ var wx = x0 + 14 + i * 34; if(i === 2) continue; s += '<path d="M' + wx + ' ' + (top + 84) + ' v-16 a8 8 0 0 1 16 0 v16 z" fill="#86b9dd" stroke="' + CONTOUR + '" stroke-width="2"/>'; ctx.fenetres.push([wx, top + 68, 16, 16]); }
  s += '<path d="M' + (cx + 2) + ' ' + (top + 92) + ' v-24 a12 12 0 0 1 24 0 v24 z" fill="#6f4529" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  s += '<rect x="' + (x0 + 30) + '" y="' + (top + 92) + '" width="' + (w - 60) + '" height="7" rx="2" fill="#cfc8da" stroke="' + CONTOUR + '" stroke-width="2"/>';
  s += '<path d="M' + (x0 - 7) + ' ' + (top + 56) + ' L' + (x0 + 14) + ' ' + top + ' L' + (x0 + w - 14) + ' ' + top + ' L' + (x0 + w + 7) + ' ' + (top + 56) + ' Z" fill="url(#' + p + 't-ardoise)" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/>';
  s += '<path d="M' + (x0 + 16) + ' ' + (top + 6) + ' H' + (x0 + w - 16) + '" stroke="#fff" stroke-width="3" opacity=".28" stroke-linecap="round"/>';
  // horloge et drapeau
  s += '<circle cx="' + cx + '" cy="' + (top + 24) + '" r="17" fill="#fff6dc" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M' + cx + ' ' + (top + 24) + ' v-10 M' + cx + ' ' + (top + 24) + ' h7" stroke="' + CONTOUR + '" stroke-width="2.5" stroke-linecap="round"/>';
  s += '<path d="M' + (x0 + w - 22) + ' ' + (top + 4) + ' v-44" stroke="' + CONTOUR + '" stroke-width="3"/><path class="ca-drapeau" d="M' + (x0 + w - 22) + ' ' + (top - 40) + ' h30 l-7 9 l7 9 h-30 z" fill="#9d6ee3" stroke="' + CONTOUR + '" stroke-width="2.5"/><circle cx="' + (x0 + w - 8) + '" cy="' + (top - 31) + '" r="4" fill="#f5b945"/>';
  return s;
}

function dessinClocher(p, ctx){
  var cx = 660, s = '';
  s += '<ellipse cx="' + (cx + 10) + '" cy="652" rx="44" ry="14" fill="#0b1a10" opacity=".3"/>';
  s += '<rect x="' + (cx - 32) + '" y="560" width="64" height="90" rx="3" fill="url(#' + p + 'pierre)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  s += '<path d="M' + (cx - 32) + ' 590 h64 M' + (cx - 32) + ' 620 h64" stroke="' + CONTOUR + '" stroke-width="1.5" opacity=".35"/>';
  s += '<path d="M' + (cx - 14) + ' 588 v-12 a14 14 0 0 1 28 0 v12 z" fill="#2c2440" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  s += '<path d="M' + (cx - 8) + ' 586 q8 -16 16 0 z" fill="#f5b945" stroke="' + CONTOUR + '" stroke-width="2"/>';
  s += '<path d="M' + (cx - 10) + ' 650 v-20 a10 10 0 0 1 20 0 v20 z" fill="#6f4529" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  ctx.fenetres.push([cx - 5, 600, 10, 14]);
  s += '<rect x="' + (cx - 5) + '" y="600" width="10" height="14" rx="5" fill="#86b9dd" stroke="' + CONTOUR + '" stroke-width="2"/>';
  s += '<path d="M' + (cx - 40) + ' 563 L' + cx + ' 470 L' + (cx + 40) + ' 563 Z" fill="url(#' + p + 't-ardoise)" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/>';
  s += '<path d="M' + cx + ' 478 L' + (cx + 34) + ' 560" stroke="#000" stroke-width="3" opacity=".18"/><path d="M' + (cx - 4) + ' 484 L' + (cx - 30) + ' 552" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round"/>';
  // girouette au corbeau
  s += '<path d="M' + cx + ' 470 v-20" stroke="' + CONTOUR + '" stroke-width="3"/>' +
       '<path d="M' + (cx - 14) + ' 448 q6 -9 14 -5 q5 -6 12 -2 l-5 3 q4 2 6 6 q-10 -1 -15 2 q-7 1 -12 -4 z" fill="#1b1424" stroke="' + CONTOUR + '" stroke-width="1.5"/>';
  return s;
}

function dessinTaverne(p, ctx){
  var cx = 285, top = 700, w = 132, x0 = cx - w / 2;
  var s = '<rect x="' + (x0 + 8) + '" y="' + (top + 10) + '" width="' + w + '" height="90" rx="8" fill="#0b1a10" opacity=".3"/>';
  s += '<rect x="' + (x0 + 2) + '" y="' + (top + 52) + '" width="' + (w - 4) + '" height="38" rx="3" fill="url(#' + p + 'mur)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  s += '<path d="M' + (x0 + 2) + ' ' + (top + 66) + ' H' + (x0 + w - 2) + ' M' + (x0 + 34) + ' ' + (top + 52) + ' v38 M' + (x0 + w - 34) + ' ' + (top + 52) + ' v38" stroke="#7a5131" stroke-width="4"/>';
  s += '<path d="M' + (cx - 10) + ' ' + (top + 90) + ' v-20 a10 10 0 0 1 20 0 v20 z" fill="#6f4529" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  [[x0 + 10, top + 70], [x0 + w - 28, top + 70]].forEach(function(q){ s += '<rect x="' + q[0] + '" y="' + q[1] + '" width="18" height="14" rx="2" fill="#86b9dd" stroke="' + CONTOUR + '" stroke-width="2"/>'; ctx.fenetres.push([q[0], q[1], 18, 14]); });
  s += '<path d="M' + (x0 - 8) + ' ' + (top + 56) + ' L' + (x0 + 12) + ' ' + top + ' L' + (x0 + w - 12) + ' ' + top + ' L' + (x0 + w + 8) + ' ' + (top + 56) + ' Z" fill="url(#' + p + 't-chaume)" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/>';
  for(var i = 1; i < 9; i++) s += '<path d="M' + (x0 + i * 15) + ' ' + (top + 6) + ' l-4 46" stroke="#7d5a2c" stroke-width="2" opacity=".35"/>';
  s += '<rect x="' + (x0 + w - 40) + '" y="' + (top - 6) + '" width="15" height="20" rx="2" fill="#b4644a" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  ctx.cheminees.push([x0 + w - 32.5, top - 9]);
  // enseigne : chaudron
  s += '<path d="M' + (x0 + w) + ' ' + (top + 56) + ' h18" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="' + (x0 + w + 16) + '" cy="' + (top + 76) + '" r="17" fill="url(#' + p + 'bois)" stroke="' + CONTOUR + '" stroke-width="2.5"/>' +
       '<text x="' + (x0 + w + 16) + '" y="' + (top + 77) + '" font-size="19" text-anchor="middle" dominant-baseline="central">🍲</text>';
  // table et bancs
  s += '<rect x="' + (x0 + 6) + '" y="' + (top + 100) + '" width="34" height="14" rx="3" fill="url(#' + p + 'bois)" stroke="' + CONTOUR + '" stroke-width="2"/>';
  return s;
}

function dessinPlace(p, ctx, mo){
  var cx = 500, cy = 745, R = 112, s = '';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R + 6) + '" fill="#8f7a58" stroke="' + CONTOUR + '" stroke-width="3"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#' + p + 'pave)"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#' + p + 'paves)"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R - 26) + '" fill="none" stroke="#8f7a58" stroke-width="3" stroke-dasharray="4 8" opacity=".6"/>';
  // étals du marché le jour
  if(mo === 'matin' || mo === 'apresmidi'){
    [[566,690,'#e8693c'],[434,800,'#4b84e6'],[574,806,'#7cc493']].forEach(function(e){
      s += '<rect x="' + (e[0] - 24) + '" y="' + (e[1] - 14) + '" width="48" height="30" rx="4" fill="' + e[2] + '" stroke="' + CONTOUR + '" stroke-width="2.5"/>' +
           '<path d="M' + (e[0] - 24) + ' ' + (e[1] - 2) + ' h48 M' + (e[0] - 12) + ' ' + (e[1] - 14) + ' v30 M' + e[0] + ' ' + (e[1] - 14) + ' v30 M' + (e[0] + 12) + ' ' + (e[1] - 14) + ' v30" stroke="#fff" stroke-width="3" opacity=".55"/>';
    });
  }
  // fontaine
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="46" fill="url(#' + p + 'pierre)" stroke="' + CONTOUR + '" stroke-width="3.5"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="35" fill="url(#' + p + 'eauR)" stroke="#2a4a6a" stroke-width="2"/>';
  s += '<circle class="ca-onde" cx="' + cx + '" cy="' + cy + '" r="18" fill="none" stroke="#e6f6ff" stroke-width="2.5"/>';
  s += '<circle class="ca-onde ca-onde2" cx="' + cx + '" cy="' + cy + '" r="18" fill="none" stroke="#e6f6ff" stroke-width="2.5"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="url(#' + p + 'pierre)" stroke="' + CONTOUR + '" stroke-width="2.5"/><circle cx="' + cx + '" cy="' + (cy - 2) + '" r="4" fill="#dff4ff"/>';
  // guirlandes et lanternes
  var lant = [];
  for(var i = 0; i < 10; i++){ var a = (i / 10) * Math.PI * 2 - Math.PI / 2 + .3; lant.push([cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12)]); }
  var g = '';
  for(var j = 0; j < lant.length; j++){ var q = lant[j], r2 = lant[(j + 1) % lant.length]; var mx = (q[0] + r2[0]) / 2, my = (q[1] + r2[1]) / 2; var vx = cx - mx, vy = cy - my, l = Math.sqrt(vx * vx + vy * vy); g += 'M' + f(q[0]) + ' ' + f(q[1]) + ' Q' + f(mx + vx / l * 14) + ' ' + f(my + vy / l * 14) + ' ' + f(r2[0]) + ' ' + f(r2[1]) + ' '; }
  s += '<path d="' + g + '" fill="none" stroke="' + CONTOUR + '" stroke-width="1.5" opacity=".55"/>';
  lant.forEach(function(q){ s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="7" fill="#f5b945" stroke="' + CONTOUR + '" stroke-width="2"/>'; ctx.lanternes.push(q); });
  return s;
}

function dessinChene(p){
  var cx = 270, cy = 128, s = '';
  s += '<ellipse cx="' + cx + '" cy="' + (cy + 10) + '" rx="150" ry="130" fill="#3d7a4c" opacity=".55"/>';
  // racines qui dépassent
  s += '<path d="M' + (cx - 70) + ' ' + (cy + 78) + ' q-30 30 -60 34 M' + (cx - 25) + ' ' + (cy + 92) + ' q-8 30 -26 50 M' + (cx + 30) + ' ' + (cy + 90) + ' q14 28 40 40 M' + (cx + 75) + ' ' + (cy + 70) + ' q34 18 62 16" stroke="' + CONTOUR + '" stroke-width="15" fill="none" stroke-linecap="round"/>';
  s += '<path d="M' + (cx - 70) + ' ' + (cy + 78) + ' q-30 30 -60 34 M' + (cx - 25) + ' ' + (cy + 92) + ' q-8 30 -26 50 M' + (cx + 30) + ' ' + (cy + 90) + ' q14 28 40 40 M' + (cx + 75) + ' ' + (cy + 70) + ' q34 18 62 16" stroke="#8a5f3c" stroke-width="9" fill="none" stroke-linecap="round"/>';
  var bl = [[0,0,70],[-58,-8,52],[58,-4,54],[-30,-52,46],[34,-50,47],[-44,40,47],[44,38,48],[0,56,46],[0,-62,40]];
  s += '<ellipse cx="' + (cx + 10) + '" cy="' + (cy + 14) + '" rx="112" ry="104" fill="#0a1a12" opacity=".35"/>';
  bl.forEach(function(b){ s += '<circle cx="' + (cx + b[0]) + '" cy="' + (cy + b[1]) + '" r="' + b[2] + '" fill="' + CONTOUR + '" stroke="' + CONTOUR + '" stroke-width="8"/>'; });
  bl.forEach(function(b){ s += '<circle cx="' + (cx + b[0]) + '" cy="' + (cy + b[1]) + '" r="' + b[2] + '" fill="url(#' + p + 'chene)"/>'; });
  bl.forEach(function(b){ s += '<circle cx="' + (cx + b[0] - b[2] * .28) + '" cy="' + (cy + b[1] - b[2] * .3) + '" r="' + (b[2] * .34) + '" fill="#fff" opacity=".1"/>'; });
  var r = rng(9);
  for(var i = 0; i < 18; i++){ var a = r() * Math.PI * 2, d = r() * 90; s += '<circle cx="' + f(cx + Math.cos(a) * d) + '" cy="' + f(cy + Math.sin(a) * d * .9) + '" r="4" fill="#e3b24a" stroke="' + CONTOUR + '" stroke-width="1.5"/>'; }
  return s;
}

function dessinClairiere(p){
  var cx = 730, cy = 140, s = '';
  s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="112" ry="88" fill="#8cc977" stroke="#3f7a45" stroke-width="3"/>';
  s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="112" ry="88" fill="url(#' + p + 'herbeT)"/>';
  var r = rng(31);
  for(var i = 0; i < 26; i++){ var a = r() * Math.PI * 2, d = r() * 80; s += '<circle cx="' + f(cx + Math.cos(a) * d) + '" cy="' + f(cy + Math.sin(a) * d * .75) + '" r="' + f(3 + r() * 2) + '" fill="' + ['#ffffff','#ffe9a8','#ff9fc0'][i % 3] + '"/>'; }
  [[cx - 40, cy + 6, 1], [cx + 28, cy - 20, -1], [cx + 50, cy + 30, 1]].forEach(function(l){
    var x = l[0], y = l[1], d = l[2];
    s += '<g class="ca-lievre" transform="translate(' + x + ' ' + y + ') scale(' + d + ' 1)">' +
      '<ellipse cx="0" cy="0" rx="17" ry="11" fill="#b08a64" stroke="' + CONTOUR + '" stroke-width="2.5"/>' +
      '<circle cx="14" cy="-7" r="8" fill="#b08a64" stroke="' + CONTOUR + '" stroke-width="2.5"/>' +
      '<path d="M12 -13 q-4 -16 2 -20 q4 6 2 20 M18 -13 q2 -16 9 -18 q1 8 -5 19" fill="#c79f78" stroke="' + CONTOUR + '" stroke-width="2"/>' +
      '<circle cx="-17" cy="-2" r="5" fill="#fff" stroke="' + CONTOUR + '" stroke-width="2"/></g>';
  });
  return s;
}

function dessinCarrefour(p){
  var cx = 500, cy = 270, s = '';
  s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="66" ry="50" fill="#b99a6a" stroke="#6b5236" stroke-width="3"/>';
  s += '<ellipse cx="' + (cx + 4) + '" cy="' + (cy + 30) + '" rx="10" ry="4" fill="#000" opacity=".25"/>';
  s += '<rect x="' + (cx - 4) + '" y="' + (cy - 38) + '" width="8" height="68" rx="3" fill="url(#' + p + 'bois)" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  s += '<path d="M' + (cx + 4) + ' ' + (cy - 34) + ' h40 l10 9 l-10 9 h-40 z" fill="#c9a06a" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  s += '<path d="M' + (cx - 4) + ' ' + (cy - 18) + ' h-40 l-10 9 l10 9 h40 z" fill="#c9a06a" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  s += '<path d="M' + (cx + 4) + ' ' + (cy - 2) + ' h34 l9 8 l-9 8 h-34 z" fill="#c9a06a" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  return s;
}

function dessinPuits(p){
  var cx = 112, cy = 345, s = '';
  s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="56" ry="46" fill="#a5c98a" opacity=".7"/>';
  s += '<ellipse cx="' + (cx + 6) + '" cy="' + (cy + 8) + '" rx="34" ry="30" fill="#000" opacity=".25"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="30" fill="url(#' + p + 'pierre)" stroke="' + CONTOUR + '" stroke-width="3.5"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="19" fill="#1d3550" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  s += '<circle cx="' + (cx - 5) + '" cy="' + (cy - 5) + '" r="5" fill="#7cc0ec" opacity=".7"/>';
  s += '<path d="M' + (cx - 40) + ' ' + (cy - 16) + ' h80 v12 h-80 z" fill="url(#' + p + 't-terre)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  s += '<rect x="' + (cx + 22) + '" y="' + (cy + 6) + '" width="14" height="14" rx="3" fill="url(#' + p + 'bois)" stroke="' + CONTOUR + '" stroke-width="2"/>';
  return s;
}

function dessinMoulin(p, ctx){
  var cx = 850, cy = 388, s = '';
  s += '<rect x="' + (cx - 48) + '" y="' + (cy - 30) + '" width="96" height="78" rx="8" fill="#0b1a10" opacity=".3"/>';
  s += '<rect x="' + (cx - 46) + '" y="' + (cy + 8) + '" width="92" height="34" rx="3" fill="url(#' + p + 'pierre)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  s += '<path d="M' + (cx - 10) + ' ' + (cy + 42) + ' v-20 a10 10 0 0 1 20 0 v20 z" fill="#6f4529" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
  s += '<rect x="' + (cx - 34) + '" y="' + (cy + 18) + '" width="16" height="13" rx="2" fill="#86b9dd" stroke="' + CONTOUR + '" stroke-width="2"/>';
  ctx.fenetres.push([cx - 34, cy + 18]);
  s += '<path d="M' + (cx - 54) + ' ' + (cy + 12) + ' L' + (cx - 38) + ' ' + (cy - 40) + ' L' + (cx + 38) + ' ' + (cy - 40) + ' L' + (cx + 54) + ' ' + (cy + 12) + ' Z" fill="url(#' + p + 't-chaume)" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/>';
  for(var i = 1; i < 7; i++) s += '<path d="M' + (cx - 46 + i * 14) + ' ' + (cy - 36) + ' l-3 46" stroke="#7d5a2c" stroke-width="2" opacity=".35"/>';
  // roue à aubes
  var wx = cx + 66, wy = cy + 10, sp = '';
  for(var k = 0; k < 8; k++){ var a = k * Math.PI / 4; sp += 'M' + wx + ' ' + wy + ' L' + f(wx + Math.cos(a) * 34) + ' ' + f(wy + Math.sin(a) * 34) + ' '; }
  s += '<g class="ca-roue"><circle cx="' + wx + '" cy="' + wy + '" r="36" fill="none" stroke="' + CONTOUR + '" stroke-width="9"/><circle cx="' + wx + '" cy="' + wy + '" r="36" fill="none" stroke="#9a6a40" stroke-width="5"/>' +
       '<path d="' + sp + '" stroke="#9a6a40" stroke-width="5" stroke-linecap="round"/><circle cx="' + wx + '" cy="' + wy + '" r="8" fill="#6f4529" stroke="' + CONTOUR + '" stroke-width="2.5"/></g>';
  return s;
}

function dessinLisiere(p){
  var s = '';
  [[690,438,24],[724,452,27],[758,436,22],[716,420,18]].forEach(function(b){
    s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="url(#' + p + 'a1)" stroke="' + CONTOUR + '" stroke-width="3"/>';
    var r = rng(b[0]);
    for(var i = 0; i < 6; i++){ var a = r() * Math.PI * 2, d = r() * b[2] * .65; s += '<circle cx="' + f(b[0] + Math.cos(a) * d) + '" cy="' + f(b[1] + Math.sin(a) * d) + '" r="4.5" fill="url(#' + p + 'baie)" stroke="' + CONTOUR + '" stroke-width="1.2"/>'; }
  });
  return s;
}

function dessinLavoir(p, rose){   /* rose : l'enquête 2, l'eau du lavoir rose (le tissu de Mélusine qui déteint), qui luit doucement */
  var x0 = 118, y0 = 1125, w = 134, h = 80, s = '';
  s += '<rect x="' + (x0 + 8) + '" y="' + (y0 + 8) + '" width="' + w + '" height="' + h + '" rx="10" fill="#0b1a10" opacity=".3"/>';
  if(rose) s += '<rect class="ca-riv-lueur" x="' + (x0 - 14) + '" y="' + (y0 - 14) + '" width="' + (w + 28) + '" height="' + (h + 28) + '" rx="22" fill="#ff6fb4" opacity=".45"/>';
  s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" rx="10" fill="url(#' + p + 'pierre)" stroke="' + CONTOUR + '" stroke-width="3.5"/>';
  s += rose ? '<rect x="' + (x0 + 12) + '" y="' + (y0 + 12) + '" width="' + (w - 24) + '" height="' + (h - 24) + '" rx="6" fill="#ff8cc6" stroke="#a03a6e" stroke-width="2"/>' +
      '<rect class="ca-riv-coeur" x="' + (x0 + 18) + '" y="' + (y0 + 18) + '" width="' + (w - 36) + '" height="' + (h - 36) + '" rx="5" fill="#ffc2e0" opacity=".7"/>' :
    '<rect x="' + (x0 + 12) + '" y="' + (y0 + 12) + '" width="' + (w - 24) + '" height="' + (h - 24) + '" rx="6" fill="url(#' + p + 'eau)" stroke="#2a4a6a" stroke-width="2"/>';
  s += '<path class="ca-flot" d="M' + (x0 + 20) + ' ' + (y0 + 34) + ' h90 M' + (x0 + 26) + ' ' + (y0 + 50) + ' h80" stroke="#dff4ff" stroke-width="2.5" stroke-dasharray="8 14" opacity=".6"/>';
  // toit sur poteaux (demi-toit)
  s += '<path d="M' + (x0 - 8) + ' ' + (y0 + 10) + ' L' + (x0 + 6) + ' ' + (y0 - 22) + ' H' + (x0 + w - 6) + ' L' + (x0 + w + 8) + ' ' + (y0 + 10) + ' Z" fill="url(#' + p + 't-terre)" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/>';
  s += '<path d="M' + (x0 + 4) + ' ' + (y0 + 10) + ' v14 M' + (x0 + w - 4) + ' ' + (y0 + 10) + ' v14" stroke="#7a5131" stroke-width="6"/>';
  // linge
  s += '<path d="M' + (x0 + 20) + ' ' + (y0 + 96) + ' Q' + (x0 + 67) + ' ' + (y0 + 108) + ' ' + (x0 + 114) + ' ' + (y0 + 96) + '" stroke="' + CONTOUR + '" stroke-width="2" fill="none"/>';
  [['#ff9fc0', 34], ['#ffffff', 60], ['#7cc0ec', 86]].forEach(function(l){ s += '<rect x="' + (x0 + l[1]) + '" y="' + (y0 + 100) + '" width="14" height="16" rx="2" fill="' + l[0] + '" stroke="' + CONTOUR + '" stroke-width="2"/>'; });
  return s;
}

function dessinPotager(p){
  var x0 = 175, y0 = 1270, w = 194, h = 92, s = '';
  s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" rx="8" fill="url(#' + p + 'terre)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  for(var i = 0; i < 4; i++){
    var ry = y0 + 16 + i * 20;
    s += '<path d="M' + (x0 + 12) + ' ' + ry + ' H' + (x0 + 130) + '" stroke="#6e5235" stroke-width="8" stroke-linecap="round"/>';
    for(var j = 0; j < 7; j++) s += '<circle cx="' + (x0 + 18 + j * 18) + '" cy="' + ry + '" r="6" fill="' + (i % 2 ? '#7cc493' : '#5aa45f') + '" stroke="' + CONTOUR + '" stroke-width="1.5"/>';
  }
  for(var k = 0; k < 3; k++){ var bx = x0 + 152, by = y0 + 18 + k * 28; s += '<path d="M' + (bx - 13) + ' ' + (by + 10) + ' q13 -26 26 0 z" fill="#f2c84b" stroke="' + CONTOUR + '" stroke-width="2.5"/><path d="M' + (bx - 9) + ' ' + (by + 3) + ' h18" stroke="#b07a1c" stroke-width="2"/>'; }
  // clôture
  s += '<rect x="' + (x0 - 6) + '" y="' + (y0 - 6) + '" width="' + (w + 12) + '" height="' + (h + 12) + '" rx="10" fill="none" stroke="#8a5f3c" stroke-width="4" stroke-dasharray="14 6"/>';
  return s;
}

function dessinJardinLavande(p){
  var s = '<rect x="772" y="862" width="122" height="64" rx="8" fill="#8a6a45" stroke="' + CONTOUR + '" stroke-width="3"/>';
  for(var i = 0; i < 3; i++){ var y = 876 + i * 18; s += '<path d="M782 ' + y + ' H884" stroke="#8f6fd6" stroke-width="12" stroke-linecap="round"/><path d="M782 ' + y + ' H884" stroke="#c7aaff" stroke-width="4" stroke-dasharray="3 6" stroke-linecap="round"/>'; }
  return s;
}

function dessinChamp(p){
  var s = '<path d="M660 1006 L880 996 L888 1186 L668 1192 Z" fill="#e7c766" stroke="' + CONTOUR + '" stroke-width="3"/>';
  for(var i = 0; i < 9; i++){ var x = 682 + i * 23; s += '<path d="M' + x + ' 1010 L' + (x + 4) + ' 1184" stroke="#c7a144" stroke-width="5" stroke-linecap="round"/>'; }
  // épouvantail
  s += '<path d="M770 1080 v40 M752 1094 h36" stroke="#7a5131" stroke-width="5" stroke-linecap="round"/><circle cx="770" cy="1076" r="9" fill="#f3e7cb" stroke="' + CONTOUR + '" stroke-width="2"/><path d="M758 1070 h24 l-4 -8 h-16 z" fill="#c9884a" stroke="' + CONTOUR + '" stroke-width="2"/>';
  return s;
}

function dessinPont(p){
  var s = '<rect x="878" y="722" width="96" height="46" rx="5" fill="#0b1a10" opacity=".3"/>';
  s += '<rect x="872" y="716" width="96" height="46" rx="5" fill="url(#' + p + 'bois)" stroke="' + CONTOUR + '" stroke-width="3"/>';
  for(var i = 1; i < 8; i++) s += '<path d="M' + (872 + i * 12) + ' 718 v42" stroke="#5a3a22" stroke-width="2" opacity=".5"/>';
  s += '<path d="M872 718 h96 M872 760 h96" stroke="#5a3a22" stroke-width="5"/>';
  return s;
}

function rose(){
  var cx = 870, cy = 1330;
  return '<g class="ca-rose" opacity=".9"><circle cx="' + cx + '" cy="' + cy + '" r="34" fill="#f6ead0" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<path d="M' + cx + ' ' + (cy - 30) + ' L' + (cx + 8) + ' ' + cy + ' L' + cx + ' ' + (cy + 30) + ' L' + (cx - 8) + ' ' + cy + ' Z" fill="#9d6ee3" stroke="' + CONTOUR + '" stroke-width="2"/>' +
    '<path d="M' + (cx - 30) + ' ' + cy + ' L' + cx + ' ' + (cy - 8) + ' L' + (cx + 30) + ' ' + cy + ' L' + cx + ' ' + (cy + 8) + ' Z" fill="#f5b945" stroke="' + CONTOUR + '" stroke-width="2"/>' +
    texte(cx, cy - 46, 'N', 24, '#f6ead0', {contour:CONTOUR, cw:5}) + '</g>';
}

/* ---------- Ambiances des moments ---------- */
var MOMENTS = {
  matin:    {haut:['#ffb3a8', .30], bas:['#ffd9c2', .14], brume:.5, teinte:'#ffffff', fen:0,  lum:false},
  apresmidi:{haut:['#fff2c8', .10], bas:['#fff2c8', .02], brume:.22, teinte:'#ffffff', fen:0,  lum:false},
  soir:     {haut:['#ff8a3d', .34], bas:['#6d3b8c', .30], brume:.35, teinte:'#ffd2b8', fen:.55, lum:true},
  nuit:     {haut:['#050b2e', .70], bas:['#0b1640', .64], brume:.30, teinte:'#b9c8ff', fen:1,  lum:true}
};

/* ---------- Les plaques de rue ----------
   La rue des Lanternes va du nord au sud : ses deux plaques sont tournées le long de la rue, posées sur la chaussée
   (Romain, 5 novembre, 00 h 14), comme « Ruelle des Brumes » : une à l'entrée du village (entre le carrefour et le clocher),
   une plus bas, entre les maisons 5-6 et 7-8. Un peu plus petites et plus fines que les autres : entre les toits de l'ouest
   (x 476) et les numéros de l'est (x 512), et entre les étiquettes « Carrefour », « Clocher » et « Poste », il n'y a pas plus de place. */
var PLAQUES = [
  {x:495, y:453, t:'Rue des Lanternes', rot:-90, taille:19.5, h:28, marge:10},
  {x:494.5, y:1177, t:'Rue des Lanternes', rot:-90, taille:19.5, h:28, marge:10},
  {x:800, y:745, t:'Rue du Four'},
  {x:312, y:990, t:'Ruelle des Brumes', rot:-58}
];
/* La place qu'occupe une plaque (pour ne pas y poser de marqueur) : quelques carrés le long de la plaque */
function plaqueRects(P){
  var d = plaqueDims(P), a = (P.rot || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), n = Math.max(1, Math.ceil(d.lw / d.h)), l = [];
  for(var i = 0; i < n; i++){
    var u = -d.lw / 2 + (i + .5) * d.lw / n, x = P.x + u * ca, y = P.y + u * sa, r = (d.h + 6) / 2;
    l.push([x - r, y - r, x + r, y + r]);
  }
  return l;
}

/* ---------- Le dessin complet ---------- */
var compteur = 0;

/* Le voile de lumière du moment (rose le matin, bleu nuit…) : sur toute la carte, large de w et haute de h */
function voile(p, mo, w, h){
  var M = MOMENTS[mo];
  return '<linearGradient id="' + p + 'voile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + M.haut[0] + '" stop-opacity="' + M.haut[1] + '"/><stop offset="1" stop-color="' + M.bas[0] + '" stop-opacity="' + M.bas[1] + '"/></linearGradient>' +
    '<rect class="ca-voile" x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#' + p + 'voile)" pointer-events="none"/>';
}
/* Le numéro des arbres de l'ancienne carte qu'on ne dessine plus dans le grand monde : un nouveau chemin ou une nouvelle eau y passe (monde-arbres.js) */
var ARBRES_OTES = null;
function arbreOte(i){
  if(!ARBRES_OTES){ ARBRES_OTES = {}; ((window.Monde && window.Monde.OTES) || []).forEach(function(k){ ARBRES_OTES[k] = true; }); }
  return !!ARBRES_OTES[i];
}

/* Le dessin du village. Il rend deux morceaux : [le sol, les maisons, les arbres ; les lumières du moment].
   monde : le village est posé au milieu du grand monde (monde-*.js, Bible chapitre 14), qui dessine lui-même l'herbe, le sol de la forêt, le ruisseau
   et la rivière, d'un seul tenant, et pose le voile de lumière sur toute la carte ; plus de rose des vents ni de bord blanc. */
function svgSurface(p, o, ctx, monde){
  var mo = MOMENTS[o.moment] ? o.moment : 'apresmidi';
  var M = MOMENTS[mo];
  var s = '';
  if(!monde){
    // sol
    s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + p + 'herbe)"/>';
    s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + p + 'herbeT)"/>';
    // sol de forêt
    var bord = 'M0 0 H1000';
    for(var x = 1000; x >= 0; x -= 25){ var y = 452 + 14 * Math.sin(x / 47) + 8 * Math.sin(x / 13); bord += ' L' + x + ' ' + f(y); }
    s += '<path d="' + bord + ' Z" fill="url(#' + p + 'foret)" stroke="#1b3a2a" stroke-width="4"/>';
    // eaux (o.riviere === 'rouge' : l'enquête 2, la rivière rouge qui luit)
    s += eau(p, RUISSEAU, 22);
    s += o.riviere === 'rouge' ? eauRouge(p, RIVIERE, 62) : eau(p, RIVIERE, 62);
  }
  // chemins de forêt
  Object.keys(CHEMINS).forEach(function(k){ s += chemin(CHEMINS[k], 24, '#b99a6a', '#6b5236'); });
  // clairières
  s += dessinClairiere(p);
  s += dessinPuits(p);
  // routes du village
  s += chemin(ROUTE_NS, 52, 'url(#' + p + 'route)', '#7d6a4c');
  s += '<path d="M500 300 V1420" stroke="#000" stroke-width="2" stroke-dasharray="3 22" opacity=".18"/>';
  s += dessinCarrefour(p);   /* après la grande rue : les panneaux du carrefour restent par-dessus le chemin */
  s += chemin(RUE_FOUR, 46, 'url(#' + p + 'route)', '#7d6a4c');
  s += chemin(RUELLE, 26, '#a596a8', '#5a4b62');
  s += chemin(VERS_TAVERNE, 30, '#c9b48a', '#7d6a4c');
  s += chemin(VERS_POTAGER, 22, '#b99a6a', '#6b5236');
  s += chemin([[205,1140],[150,1180]], 18, '#a596a8', '#5a4b62');
  // fleurs
  FLEURS.forEach(function(fl){ s += '<circle cx="' + f(fl.x) + '" cy="' + f(fl.y) + '" r="' + f(fl.s) + '" fill="' + fl.c + '" opacity=".85"/>'; });
  // lieux au sol
  s += dessinChamp(p);
  s += dessinJardinLavande(p);
  s += dessinPotager(p);
  s += dessinLavoir(p, o.lavoir === 'rose');
  s += dessinPlace(p, ctx, mo);
  s += dessinPont(p);
  // arbres de forêt + chêne + lisière + moulin
  s += dessinChene(p);
  ARBRES.forEach(function(a, i){ if(a.foret && !(monde && arbreOte(i))) s += arbre(p, a); });
  s += dessinLisiere(p);
  s += dessinMoulin(p, ctx);
  // bâtiments du village, du haut vers le bas
  var bat = [];
  Object.keys(MAISONS).forEach(function(k){ bat.push({y: MAISONS[k].y, k: k}); });
  bat.push({y:610, k:'mairie'}); bat.push({y:600, k:'clocher'}); bat.push({y:745, k:'taverne'});
  ARBRES.forEach(function(a, i){ if(!a.foret && !(monde && arbreOte(i))) bat.push({y:a.y, arbre:a}); });
  bat.sort(function(a, b){ return a.y - b.y; });
  bat.forEach(function(b){
    if(b.arbre){ s += arbre(p, b.arbre); return; }
    if(b.k === 'mairie'){ s += '<g data-bat="mairie">' + dessinMairie(p, ctx) + '</g>'; return; }
    if(b.k === 'clocher'){ s += '<g data-bat="clocher">' + dessinClocher(p, ctx) + '</g>'; return; }
    if(b.k === 'taverne'){ s += '<g data-bat="taverne">' + dessinTaverne(p, ctx) + '</g>'; return; }
    var h = MAISONS[b.k];
    s += '<g data-bat="' + b.k + '">' + maisonArt(p, h.x, h.y, h.toit, ctx, {enseigne: h.enseigne}) + '</g>';
  });
  // fumées
  ctx.cheminees.forEach(function(c, i){
    var d1 = -(i * 0.73 % 4).toFixed(2), d2 = -((i * 0.73 + 2) % 4).toFixed(2);
    s += '<circle class="ca-fumee" cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="7" fill="#f2f2f7" style="animation-delay:' + d1 + 's"/>' +
         '<circle class="ca-fumee" cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="7" fill="#f2f2f7" style="animation-delay:' + d2 + 's"/>';
  });
  // plaques de rue (PLAQUES, plus bas)
  PLAQUES.forEach(function(P){ s += plaque(P); });
  if(!monde) s += rose();

  /* --- lumière du moment --- (dans le grand monde, le voile est posé par svg(), sur toute la carte, entre les deux morceaux) */
  var bas = s; s = '';
  if(!monde) s += voile(p, mo, W, H);
  if(mo === 'nuit'){
    // reflets de lune sur la rivière
    [[930,240],[925,620],[940,1010]].forEach(function(q){ s += '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="9" ry="30" fill="#dfe8ff" opacity=".45"/>'; });
  }
  if(M.fen){
    var r = rng(5);
    ctx.fenetres.forEach(function(q){
      if(r() > M.fen) return;
      var w = q[2] || 16, h = q[3] || 13;
      s += '<circle cx="' + f(q[0] + w / 2) + '" cy="' + f(q[1] + h / 2) + '" r="' + (mo === 'nuit' ? 22 : 16) + '" fill="url(#' + p + 'lueur)" opacity="' + (mo === 'nuit' ? .75 : .5) + '"/>' +
           '<rect x="' + f(q[0]) + '" y="' + f(q[1]) + '" width="' + w + '" height="' + h + '" rx="2" fill="#ffd77a" stroke="' + CONTOUR + '" stroke-width="2"/>';
    });
  }
  if(M.lum){
    ctx.lanternes.forEach(function(q, i){
      s += '<circle class="ca-vacille" cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="26" fill="url(#' + p + 'lueur)" style="animation-delay:-' + (i * .37).toFixed(2) + 's"/>' +
           '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="7" fill="#fff0b0" stroke="' + CONTOUR + '" stroke-width="2"/>';
    });
    s += '<circle class="ca-vacille" cx="500" cy="745" r="60" fill="url(#' + p + 'cyan)" opacity=".35"/>';
  }
  if(mo === 'nuit' || mo === 'soir'){
    var rf = rng(12), nb = mo === 'nuit' ? 12 : 5;
    for(var i = 0; i < nb; i++){
      var fx = 60 + rf() * 880, fy = 40 + rf() * 360;
      if(distLigne(fx, fy, RIVIERE) < 40) continue;
      s += '<g class="ca-follet ca-follet' + (i % 3) + '" style="animation-delay:-' + (rf() * 9).toFixed(2) + 's"><circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="16" fill="url(#' + p + 'cyan)"/><circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="3.5" fill="#f0ffff"/></g>';
    }
  }
  // brume qui dérive + bord brumeux de la vallée
  var bandes = [[180,470,330,60],[760,500,300,55],[300,1060,340,55],[820,1240,300,60],[520,230,380,50]];
  s += '<g class="ca-brumes" opacity="' + M.brume + '">';
  bandes.forEach(function(b, i){ s += '<ellipse class="ca-brume ca-brume' + (i % 2) + '" cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" fill="url(#' + p + 'brume)" style="animation-delay:-' + (i * 7) + 's"/>'; });
  s += '</g>';
  if(!monde) s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + p + 'vignette)" opacity="' + (mo === 'nuit' ? .35 : .55) + '" pointer-events="none" style="mix-blend-mode:normal"/>';
  return [bas, s];
}

/* La roche, et le village en fantôme au-dessus (pour s'y retrouver) */
function fondDessous(p){
  var s = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + p + 'dessous)"/>';
  var r = rng(55);
  for(var i = 0; i < 70; i++){ s += '<circle cx="' + f(r() * 1000) + '" cy="' + f(r() * 1400) + '" r="' + f(4 + r() * 14) + '" fill="#2a2032" opacity="' + f(.4 + r() * .4) + '"/>'; }
  var g = 'stroke="#8ff3ff" fill="none" opacity=".16"';
  s += '<path d="' + lisse(RIVIERE) + '" stroke-width="54" ' + g.replace('.16', '.08') + '/>';
  s += '<path d="M500 295 V1420 M600 745 H900" stroke-width="40" ' + g.replace('.16', '.07') + '/>';
  s += '<path d="' + lisse(RUELLE) + '" stroke-width="20" ' + g.replace('.16', '.07') + '/>';
  s += '<circle cx="500" cy="745" r="112" stroke-width="3" stroke-dasharray="8 8" ' + g + '/>';
  Object.keys(MAISONS).forEach(function(k){ var h = MAISONS[k]; s += '<rect x="' + (h.x - HW) + '" y="' + (h.y - 40) + '" width="' + (HW * 2) + '" height="80" rx="6" stroke-width="2.5" ' + g + '/>'; });
  [[306,562,158,96],[628,470,64,180],[219,700,132,90],[795,350,110,80]].forEach(function(b){ s += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="8" stroke-width="2.5" ' + g + '/>'; });
  s += '<circle cx="270" cy="128" r="100" stroke-width="3" stroke-dasharray="10 8" ' + g + '/>';
  s += '<circle cx="112" cy="345" r="30" stroke-width="3" ' + g + '/>';
  /* les chemins de la forêt, depuis le carrefour (pour situer les chemins secrets en surface du tableau du Pisteur) */
  Object.keys(CHEMINS).forEach(function(k){ s += '<path d="' + lisse(CHEMINS[k]) + '" stroke-width="16" stroke-linecap="round" ' + g.replace('.16', '.08') + '/>'; });
  return s;
}
function galerie(p, pts, o){
  o = o || {};
  var d = lisse(pts), s = '';
  var l = o.escalier ? 30 : 38;
  s += '<path d="' + d + '" fill="none" stroke="#0b0710" stroke-width="' + (l + 12) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
       '<path d="' + d + '" fill="none" stroke="url(#' + p + 'galerie)" stroke-width="' + l + '" stroke-linecap="round" stroke-linejoin="round"' + (o.bouche ? ' stroke-dasharray="30 10"' : '') + '/>';
  if(o.escalier){
    for(var j = 0; j < pts.length - 1; j++){
      var a = pts[j], b = pts[j + 1], n = 3;
      for(var k = 1; k <= n; k++){ var t = k / (n + 1), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, an = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + 90;
        s += '<rect x="' + f(x - 14) + '" y="' + f(y - 2.5) + '" width="28" height="5" rx="2" fill="#c9b48a" opacity=".8" transform="rotate(' + f(an) + ' ' + f(x) + ' ' + f(y) + ')"/>'; }
    }
  } else {
    s += '<path d="' + d + '" fill="none" stroke="#8a6a4c" stroke-width="12" stroke-linecap="round" opacity=".5"/>';
    if(!o.bouche) s += '<path class="ca-flot" d="' + d + '" fill="none" stroke="#8ff3ff" stroke-width="3" stroke-dasharray="4 26" stroke-linecap="round" opacity=".7"/>';
    for(var i = 1; i < pts.length - 1; i++){ var q = pts[i]; s += '<rect x="' + (q[0] - 22) + '" y="' + (q[1] - 5) + '" width="44" height="10" rx="3" fill="#7a5131" stroke="' + CONTOUR + '" stroke-width="2.5" transform="rotate(' + f(Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]) * 180 / Math.PI + 90) + ' ' + q[0] + ' ' + q[1] + ')"/>'; }
  }
  if(o.bouche){
    var e = pts[pts.length - 1];
    s += '<g class="ca-eboulis"><circle cx="' + e[0] + '" cy="' + e[1] + '" r="12" fill="#5b4a3c" stroke="' + CONTOUR + '" stroke-width="2.5"/><circle cx="' + (e[0] + 16) + '" cy="' + (e[1] + 6) + '" r="9" fill="#6e5a48" stroke="' + CONTOUR + '" stroke-width="2.5"/><circle cx="' + (e[0] - 12) + '" cy="' + (e[1] + 10) + '" r="8" fill="#4a3c30" stroke="' + CONTOUR + '" stroke-width="2.5"/></g>';
  }
  return s;
}
/* ---------- Le tableau « Les chemins secrets » du Pisteur (sa cabane) : seulement ce qu'il a trouvé ----------
   o.sousSols = {elements:[…souterrains.js], apparus:[ids]} : les passages sous terre ;
   o.chemins = {liste:[{id, nom, ic, pts, neuf, pris, guide}]} : les chemins secrets en surface (E.chemins, carte-jeu.js) */
function svgSousSols(p, o){
  var S = o.sousSols || {}, l = S.elements || [], ap = S.apparus || [], s = fondDessous(p);
  var lch = (o.chemins && o.chemins.liste) || [];
  /* les noms du village, en fantôme */
  Object.keys(LIEUX).forEach(function(id){ var e = ETIQ[id]; if(LIEUX[id].zone === 'dessous' || !e) return; s += texte(e[0], e[1], LIEUX[id].court, 22, '#8ff3ff', {}).replace('<text', '<text opacity=".3"'); });
  l.forEach(function(x){
    if(x.type !== 'passage' || !x.pts) return;
    s += '<g class="ca-passage' + (ap.indexOf(x.id) >= 0 ? ' ca-apparait' : '') + '" data-ss="' + esc(x.id) + '">' + galerie(p, x.pts, {bouche: x.bouche, escalier: x.escalier}) + '</g>';
  });
  l.forEach(function(x){
    if(x.type !== 'entree') return;
    s += '<g class="ca-ss-entree' + (ap.indexOf(x.id) >= 0 ? ' ca-apparait' : '') + '" data-ss="' + esc(x.id) + '"><circle cx="' + x.x + '" cy="' + x.y + '" r="26" fill="#3b2a1e" stroke="#8ff3ff" stroke-width="3" stroke-dasharray="6 5"/>' +
      '<text x="' + x.x + '" y="' + (x.y + 1) + '" font-size="24" text-anchor="middle" dominant-baseline="central">' + esc(x.ic || '⬆️') + '</text></g>';
  });
  s += cheminsTraces(lch);
  if(!l.length && !lch.length){
    s += texte(500, 640, 'Rien pour l\'instant…', 40, '#c9f8ff', {}) + texte(500, 700, 'Explore bien : il y a peut-être', 28, '#8ff3ff', {}).replace('<text', '<text opacity=".8"') +
      texte(500, 740, 'des chemins secrets à Brumeval !', 28, '#8ff3ff', {}).replace('<text', '<text opacity=".8"');
  }
  return s;
}
/* Les chemins secrets en surface (Romain, 5 novembre, 01 h 30) : un sentier doré, des petits pas dessus, un rond au bout.
   Un chemin neuf (c.neuf) se trace d'un bout à l'autre (carte.css : ca-chemin-neuf), puis ses pas et son nom apparaissent.
   (Sans animation, prefers-reduced-motion : il est là tout de suite, en entier.) */
function cheminsTraces(l){
  var s = '';
  (l || []).forEach(function(c){
    if(!c || !c.pts || c.pts.length < 2) return;
    var d = lisse(c.pts), z = c.pts[c.pts.length - 1];
    s += '<g class="ca-chemin' + (c.neuf ? ' ca-chemin-neuf' : '') + '" data-chemin="' + esc(c.id) + '" pointer-events="none">' +
      '<path class="ca-chemin-halo" d="' + d + '" pathLength="1" fill="none" stroke="#ffd23f" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" opacity=".16"/>' +
      '<path class="ca-chemin-bord" d="' + d + '" pathLength="1" fill="none" stroke="#0b0710" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>' +
      '<path class="ca-chemin-trait" d="' + d + '" pathLength="1" fill="none" stroke="#e9c77e" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="ca-chemin-pas" d="' + d + '" fill="none" stroke="#7a4e22" stroke-width="5" stroke-dasharray="1 16" stroke-linecap="round"/>' +
      '<g class="ca-chemin-bout"><circle cx="' + z[0] + '" cy="' + z[1] + '" r="15" fill="#e9c77e" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="' + z[0] + '" cy="' + z[1] + '" r="5" fill="' + CONTOUR + '"/></g>' +
      '</g>';
  });
  return s;
}
/* Ce qu'on touche sur un chemin secret : le chemin lui-même (une large zone invisible) et, à son départ, le rond jaune qui palpite tant
   qu'il n'a pas été pris ; son nom au milieu de la boucle ; « 👆 Touche ici ! » sous le rond, la première fois (c.guide). */
function cheminsInteractifs(p, o){
  var l = (o.chemins && o.chemins.liste) || [], taille = o.etiquette || 25, tmin = o.toucheMin || 0, ks = taille / 25;
  var fond = '', s = '';
  l.forEach(function(c){
    if(!c || !c.pts || c.pts.length < 2) return;
    var a = c.pts[0], d = lisse(c.pts), R = 28 * ks, act = ' data-act="chemin" data-id="' + esc(c.id) + '"';
    var xs = c.pts.map(function(q){ return q[0]; }), ys = c.pts.map(function(q){ return q[1]; });
    var mx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, my = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2 + 10 * ks;
    if(c.etiquette && c.etiquette.length === 2){ mx = c.etiquette[0]; my = c.etiquette[1]; }   /* (E.chemins : où poser son nom) */
    fond += '<g class="ca-zone ca-clic ca-chemin-zone"' + act + '>' +
      '<path class="ca-hit ca-chemin-ligne" d="' + d + '" fill="none" stroke="#fff" stroke-width="' + f(Math.max(46, tmin)) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>' +
      '<circle class="ca-hit" cx="' + a[0] + '" cy="' + a[1] + '" r="' + f(Math.max(R + 16, tmin / 2)) + '" fill="#fff" opacity="0"/></g>';
    /* le nom, au milieu de la boucle du chemin */
    var nom = String(c.nom || '').replace(/^(Le|La|Les|L') ?/, ''); nom = nom.charAt(0).toUpperCase() + nom.slice(1);
    s += '<g class="ca-chemin-nom' + (c.neuf ? ' ca-chemin-neuf' : '') + '" pointer-events="none">' + etiquette(mx, my, c.ic || '', nom, {taille: Math.round(taille * .84), fond: '#2c2238', encre: '#ffe3a3', classe: 'ca-etiq-chemin'}) + '</g>';
    var g = '<g class="ca-chemin-depart ca-clic' + (c.pris ? ' ca-chemin-pris' : '') + (c.neuf ? ' ca-chemin-neuf' : '') + '"' + act + '>';
    if(!c.pris) g += '<circle class="ca-pulse ca-chemin-onde" cx="' + a[0] + '" cy="' + a[1] + '" r="' + f(R + 12) + '" fill="none" stroke="#ffd23f" stroke-width="' + f(7 * ks) + '" pointer-events="none"/>';
    g += '<circle class="ca-chemin-rond" cx="' + a[0] + '" cy="' + a[1] + '" r="' + f(R) + '" fill="#ffd23f" fill-opacity="' + (c.pris ? '.22' : '.4') + '" stroke="#ffd23f" stroke-width="' + f(6 * ks) + '"/>';
    g += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="' + f(R + 3 * ks) + '" fill="none" stroke="' + CONTOUR + '" stroke-width="' + f(2.5 * ks) + '" pointer-events="none"/>';
    g += '<text class="ca-ic" x="' + a[0] + '" y="' + f(a[1] + 1) + '" font-size="' + f(R * 1.05) + '" text-anchor="middle" dominant-baseline="central" pointer-events="none">👣</text>';
    s += g + '</g>';
    /* (plus d'écriteau « 👆 Touche ici ! », Romain, 5 novembre, 19 h 39 : le rond jaune qui pulse suffit, comme partout) */
  });
  return {fond: fond, dessus: s};
}
/* Les salles et les mystères des sous-sols : on les touche (deux couches, comme les lieux) */
function sousSolsInteractifs(p, o){
  var S = o.sousSols || {}, l = S.elements || [], ap = S.apparus || [];
  var actifs = o.actifs || [], verrous = o.verrous || [];
  var taille = o.etiquette || 25, tmin = o.toucheMin || 0, ks = taille / 25;
  var fond = '', s = '';
  l.forEach(function(x){
    if(x.type !== 'salle' && x.type !== 'mystere') return;
    var salle = x.type === 'salle', neuf = ap.indexOf(x.id) >= 0;
    var act = salle ? (x.lieu ? ' data-act="lieu" data-id="' + esc(x.lieu) + '"' : '') : ' data-act="sous-sol" data-id="' + esc(x.id) + '"';
    var actif = salle && actifs.indexOf(x.lieu) >= 0, verrou = salle && verrous.indexOf(x.lieu) >= 0;
    var R = (salle ? 40 : 30) * ks, nom = x.nom || '', lw = largeurEtiquette(nom, taille, ''), lh = taille + 16;
    var ey = x.y + R + 8 + lh / 2;
    var rh = Math.max(R + 6, tmin / 2);
    fond += '<g class="ca-zone ca-clic' + (neuf ? ' ca-apparait' : '') + '" data-zone="' + esc(x.lieu || x.id) + '"' + act + '>' +
      '<circle class="ca-hit" cx="' + x.x + '" cy="' + x.y + '" r="' + f(rh) + '" fill="#fff" opacity="0"/>' +
      '<rect class="ca-hit ca-hit-etiq" x="' + f(x.x - Math.max(lw + 16, tmin) / 2) + '" y="' + f(ey - Math.max(lh + 14, tmin) / 2) + '" width="' + f(Math.max(lw + 16, tmin)) + '" height="' + f(Math.max(lh + 14, tmin)) + '" rx="' + f(lh / 2) + '" fill="#fff" opacity="0"/>' +
      (actif ? '<circle class="ca-pulse" cx="' + x.x + '" cy="' + x.y + '" r="' + f(R + 14) + '" fill="none" stroke="#8ff3ff" stroke-width="6" pointer-events="none"/>' : '') + '</g>';
    var g = '<g class="ca-lieu ca-clic ca-ss-' + x.type + (actif ? ' ca-actif' : '') + (verrou ? ' ca-verrouille' : '') + (neuf ? ' ca-apparait' : '') + '" data-lieu="' + esc(x.lieu || x.id) + '" data-ss="' + esc(x.id) + '"' + act + '>';
    g += '<circle class="ca-bat" cx="' + x.x + '" cy="' + x.y + '" r="' + f(R + 18) + '" fill="url(#' + p + 'cyan)" opacity=".55" pointer-events="none"/>';
    g += '<circle cx="' + x.x + '" cy="' + x.y + '" r="' + f(R) + '" fill="' + (salle ? '#2c2238' : '#1d1626') + '" stroke="#8ff3ff" stroke-width="' + (salle ? 4 : 3) + '"' + (salle ? '' : ' stroke-dasharray="7 6"') + '/>';
    g += '<text class="ca-ic" x="' + x.x + '" y="' + (x.y + 2) + '" font-size="' + f(R * 1.05) + '" text-anchor="middle" dominant-baseline="central">' + esc(x.ic || (salle ? '🕳️' : '❔')) + '</text>';
    if(nom) g += etiquette(x.x, ey, '', nom, {taille: taille, classe: 'ca-etiq-lieu ca-etiq-dessous', fond: '#2c2238', encre: '#c9f8ff'});
    if(verrou){ var vx = x.x + R * .8, vy = x.y - R * .8; g += '<g class="ca-cadenas"><circle cx="' + f(vx) + '" cy="' + f(vy) + '" r="' + f(20 * ks) + '" fill="#2c2440" stroke="' + CONTOUR + '" stroke-width="3"/><text x="' + f(vx) + '" y="' + f(vy + 1) + '" font-size="' + f(22 * ks) + '" text-anchor="middle" dominant-baseline="central">🔒</text></g>'; }
    if(neuf){
      var et = '';
      for(var i = 0; i < 8; i++){ var a = i * Math.PI / 4 + .3; et += '<circle class="ca-etincelle" cx="' + f(x.x + Math.cos(a) * (R + 22)) + '" cy="' + f(x.y + Math.sin(a) * (R + 22)) + '" r="' + (i % 2 ? 6 : 9) + '" fill="' + (i % 2 ? '#8ff3ff' : '#ffe38a') + '" style="animation-delay:' + (0.45 + (i % 4) * 0.08).toFixed(2) + 's"/>'; }
      g += '<g class="ca-etincelles" pointer-events="none">' + et + '</g>';
      g += '<g class="ca-nouveau" pointer-events="none">' + etiquette(x.x, x.y - R - 24 * ks, '✨', 'Nouveau !', {taille: Math.round(20 * ks), fond: '#ffd23f'}) + '</g>';
    }
    s += g + '</g>';
  });
  return {fond: fond, dessus: s};
}
function sousSolsPos(o, id){ var l = (o && o.sousSols && o.sousSols.elements) || []; for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i]; return null; }

function svgDessous(p, o){
  var caches = o.caches || [];
  var s = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + p + 'dessous)"/>';
  var r = rng(55);
  for(var i = 0; i < 70; i++){ s += '<circle cx="' + f(r() * 1000) + '" cy="' + f(r() * 1400) + '" r="' + f(4 + r() * 14) + '" fill="#2a2032" opacity="' + f(.4 + r() * .4) + '"/>'; }
  // fantôme de la surface
  var g = 'stroke="#8ff3ff" fill="none" opacity=".16"';
  s += '<path d="' + lisse(RIVIERE) + '" stroke-width="54" ' + g.replace('.16', '.08') + '/>';
  s += '<path d="M500 295 V1420 M600 745 H900" stroke-width="40" ' + g.replace('.16', '.07') + '/>';
  s += '<path d="' + lisse(RUELLE) + '" stroke-width="20" ' + g.replace('.16', '.07') + '/>';
  s += '<circle cx="500" cy="745" r="112" stroke-width="3" stroke-dasharray="8 8" ' + g + '/>';
  Object.keys(MAISONS).forEach(function(k){ var h = MAISONS[k]; s += '<rect x="' + (h.x - HW) + '" y="' + (h.y - 40) + '" width="' + (HW * 2) + '" height="80" rx="6" stroke-width="2.5" ' + g + '/>' + texte(h.x - HW + 4, h.y + 26, String(h.num), 22, '#8ff3ff', {}).replace('<text', '<text opacity=".35"'); });
  [[306,562,158,96],[628,470,64,180],[219,700,132,90],[795,350,110,80]].forEach(function(b){ s += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="8" stroke-width="2.5" ' + g + '/>'; });
  s += '<circle cx="270" cy="128" r="100" stroke-width="3" stroke-dasharray="10 8" ' + g + '/>';
  s += '<circle cx="112" cy="345" r="30" stroke-width="3" ' + g + '/>';
  // galeries
  var TUN = {
    tunnel_chene: [[500,745],[470,560],[400,380],[330,250],[300,205]],
    tunnel_moulin:[[500,745],[640,660],[760,520],[835,420]],
    crypte:       [[500,745],[600,660],[665,600]],
    tunnel_puits: [[500,745],[360,600],[230,470],[135,370]]
  };
  Object.keys(TUN).forEach(function(k){
    if(caches.indexOf(k) >= 0) return;
    var d = lisse(TUN[k]);
    s += '<path d="' + d + '" fill="none" stroke="#0b0710" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/>' +
         '<path d="' + d + '" fill="none" stroke="url(#' + p + 'galerie)" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>' +
         '<path d="' + d + '" fill="none" stroke="#8a6a4c" stroke-width="14" stroke-linecap="round" opacity=".55"/>' +
         '<path class="ca-flot" d="' + d + '" fill="none" stroke="#8ff3ff" stroke-width="3" stroke-dasharray="4 26" stroke-linecap="round" opacity=".7"/>';
    // poutres
    var pts = TUN[k];
    for(var j = 1; j < pts.length - 1; j++){ var a = pts[j]; s += '<rect x="' + (a[0] - 22) + '" y="' + (a[1] - 5) + '" width="44" height="10" rx="3" fill="#7a5131" stroke="' + CONTOUR + '" stroke-width="2.5" transform="rotate(' + f(Math.atan2(pts[j + 1][1] - pts[j - 1][1], pts[j + 1][0] - pts[j - 1][0]) * 180 / Math.PI + 90) + ' ' + a[0] + ' ' + a[1] + ')"/>'; }
    var e = pts[pts.length - 1];
    s += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="36" fill="#3b2a1e" stroke="' + CONTOUR + '" stroke-width="4"/>';
    if(k === 'tunnel_chene') s += '<path d="M' + (e[0] - 30) + ' ' + (e[1] - 10) + ' q20 10 28 -16 q4 22 26 14 M' + (e[0] - 24) + ' ' + (e[1] + 16) + ' q18 -8 30 6" stroke="#9a6a40" stroke-width="7" fill="none" stroke-linecap="round"/>';
    if(k === 'tunnel_moulin') s += '<rect x="' + (e[0] - 18) + '" y="' + (e[1] - 18) + '" width="36" height="36" rx="3" fill="url(#' + p + 'bois)" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M' + (e[0] - 18) + ' ' + e[1] + ' h36" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="' + (e[0] + 10) + '" cy="' + (e[1] + 8) + '" r="3" fill="#f5b945"/>';
    if(k === 'tunnel_puits') s += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="20" fill="url(#' + p + 'eauR)" stroke="' + CONTOUR + '" stroke-width="3"/>';
    if(k === 'crypte') s += '<circle class="ca-vacille" cx="' + e[0] + '" cy="' + e[1] + '" r="40" fill="url(#' + p + 'lueur)"/><rect x="' + (e[0] - 5) + '" y="' + (e[1] - 12) + '" width="10" height="20" rx="3" fill="#f3e7cb" stroke="' + CONTOUR + '" stroke-width="2"/><path d="M' + e[0] + ' ' + (e[1] - 22) + ' q6 6 0 10 q-6 -4 0 -10" fill="#ffb84a"/>';
  });
  // salle du Cœur
  if(caches.indexOf('salle_coeur') < 0){
    s += '<circle cx="500" cy="745" r="96" fill="#0b0710"/><circle cx="500" cy="745" r="88" fill="#2c2238" stroke="' + CONTOUR + '" stroke-width="4"/>';
    s += '<circle class="ca-bat" cx="500" cy="745" r="90" fill="url(#' + p + 'cyan)"/>';
    s += '<circle cx="500" cy="745" r="56" fill="url(#' + p + 'pierre)" stroke="' + CONTOUR + '" stroke-width="5"/>';
    s += '<circle cx="500" cy="745" r="46" fill="none" stroke="#6c6684" stroke-width="3"/>';
    for(var k2 = 0; k2 < 5; k2++){
      var a2 = -Math.PI / 2 + k2 * Math.PI * 2 / 5, hx = 500 + Math.cos(a2) * 30, hy = 745 + Math.sin(a2) * 30;
      if(k2 === 0) s += '<path d="M' + f(hx) + ' ' + f(hy - 11) + ' q9 9 0 22 q-9 -9 0 -22 z" fill="#1b1424" stroke="#8ff3ff" stroke-width="1.5"/>';
      else s += '<circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="9" fill="#1b1424" stroke="' + CONTOUR + '" stroke-width="2"/>';
    }
    s += '<circle cx="500" cy="745" r="6" fill="#8ff3ff"/>';
  }
  return s;
}

/* Zones cliquables, étiquettes, verrous */
var HIT = {
  place:[0,0,112], foret:[0,0,70], chene:[0,0,112], clairiere:[0,0,96], puits:[0,0,62], moulin:[10,0,78], lisiere:[0,0,62],
  pont:[0,0,58], lavoir:[0,0,80], potager:[0,0,86], herboristerie:[0,0,64], ruelle:[0,0,56],
  salle_coeur:[0,0,96], tunnel_chene:[0,0,60], tunnel_moulin:[0,0,60], crypte:[0,0,60], tunnel_puits:[0,0,60]
};
var RECTS = {mairie:[306,520,158,140], clocher:[618,440,84,215], taverne:[212,690,150,106]};
var ETIQ = {
  place:[500,842], foret:[500,328], chene:[270,258],   /* (foret un peu remontée : la plaque de la rue des Lanternes tient dessous) */ clairiere:[730,240], puits:[112,404], moulin:[850,452], lisiere:[720,392],
  pont:[930,690], lavoir:[108,1238], potager:[292,1252], herboristerie:[830,945], ruelle:null,
  mairie:[345,668], clocher:[566,578], taverne:[140,745], boulangerie:[742,616], atelier:[575,928], poste:[575,1045],
  salle_coeur:[500,862], tunnel_chene:[300,275], tunnel_moulin:[835,486], crypte:[700,548], tunnel_puits:[150,440]
};

/* Les souterrains vus de la surface : une petite entrée, seulement quand ce rôle doit y aller (actif ou fermé à clé) */
var ENTREES = {salle_coeur:[500,668], tunnel_chene:[300,192], tunnel_moulin:[888,800], crypte:[762,515], tunnel_puits:[150,290]};
var COURT_ENTREE = {tunnel_moulin:'Tunnel'};
function largeurEtiquette(t, taille, ic){ return largeurTexte(t, taille) + (ic ? taille * 1.25 : 0) + 26; }
function entreeVisible(id, o){
  return !!ENTREES[id] && Array.isArray(o.actifs) && (o.actifs.indexOf(id) >= 0 || (o.verrous || []).indexOf(id) >= 0) && (o.caches || []).indexOf(id) < 0;
}
/* Où est l'étiquette d'un lieu (en unités de la carte) : sert aux marqueurs posés au-dessus, et à la vue qui glisse jusqu'au lieu */
function posEtiquette(id, o){
  var L = LIEUX[id]; if(!L) return null;
  if(L.zone === 'dessous') return (o && (o.niveau === 'dessous')) ? (ETIQ[id] || [L.x, L.y]) : (ENTREES[id] || [L.x, L.y]);
  return ETIQ[id] || [L.x, L.y];
}

/* Les lieux dessinés et leurs étiquettes (rectangle occupé, cadenas compris) */
function geoLieux(o, niveau){
  var caches = o.caches || [], verrous = o.verrous || [], taille = o.etiquette || 25, ks = taille / 25;
  var liste = [], parId = {};
  Object.keys(LIEUX).forEach(function(id){
    var L = LIEUX[id], entree = false;
    if((niveau === 'dessous') !== (L.zone === 'dessous')){
      if(niveau === 'dessous' || !entreeVisible(id, o)) return;
      entree = true;   /* une entrée de souterrain, dessinée à la surface */
    }
    if(caches.indexOf(id) >= 0) return;
    var e = entree ? ENTREES[id] : ETIQ[id], nom = (entree && COURT_ENTREE[id]) || L.court;
    var g = {id:id, entree:entree, e:e, nom:nom, lw:largeurEtiquette(nom, taille, L.ic), lh:taille + 16, rect:null};
    if(e && o.etiquettes !== false) g.rect = [e[0] - g.lw / 2, e[1] - g.lh / 2, e[0] + g.lw / 2 + (verrous.indexOf(id) >= 0 ? 32 * ks : 0), e[1] + g.lh / 2];
    /* un lieu qui vient d'apparaître porte « ✨ Nouveau ! » au-dessus de son nom : ses marqueurs (une mission bonus…) ne vont pas se cacher dessous
       (Romain, 10 novembre : le Sage ne voyait pas son bonus, caché sous le « Nouveau ! » de la mairie) */
    if(g.rect && !entree && (o.apparus || []).indexOf(id) >= 0){
      var tn = Math.round(20 * ks), wn = largeurEtiquette('Nouveau !', tn, '✨'), yn = e[1] - g.lh / 2 - 22 * ks, hn = tn + 16;
      g.rect = [Math.min(g.rect[0], e[0] - wn / 2), Math.min(g.rect[1], yn - hn / 2), Math.max(g.rect[2], e[0] + wn / 2), g.rect[3]];
    }
    liste.push(g); parId[id] = g;
  });
  return {liste:liste, parId:parId};
}

/* Deux couches : dessous, les zones à toucher invisibles et les anneaux ; dessus, les étiquettes.
   Ainsi une étiquette qu'on voit n'est jamais recouverte par la zone invisible d'un voisin. Renvoie {fond, dessus}. */
function lieuxInteractifs(p, o, niveau, geo){
  var actifs = Array.isArray(o.actifs) ? o.actifs : null;
  var verrous = o.verrous || [];
  var apparus = o.apparus || [], ouverts = o.ouverts || [];
  var taille = o.etiquette || 25, tmin = o.toucheMin || 0, ks = taille / 25;
  /* o.aides === false (dès l'enquête 2, Romain, 5 novembre, 00 h 14) : plus de rond jaune ni d'étiquette dorée sur les lieux où il y a
     quelque chose à faire ; tous les lieux gardent leur air normal et se touchent tous. Les entrées des souterrains (qui n'apparaissent
     que pour le rôle qui doit y aller) et les cadenas ne changent pas. */
  var sansAides = o.aides === false;
  var fond = '', s = '';
  (geo || geoLieux(o, niveau)).liste.forEach(function(G){
    var id = G.id, L = LIEUX[id], entree = G.entree;
    var verrou = verrous.indexOf(id) >= 0;
    var clic = verrou || !actifs || actifs.indexOf(id) >= 0 || (sansAides && !entree);
    var actif = actifs && actifs.indexOf(id) >= 0 && !(sansAides && !entree);
    var calme = actif && ouverts.indexOf(id) >= 0;   /* déjà ouvert à ce moment-ci (classe ca-calme) ; son rond palpite quand même, comme partout (Romain, 5 novembre, 23 h 06 : plus de rond jaune immobile) */
    var neuf = apparus.indexOf(id) >= 0;
    var act = clic ? ' data-act="lieu" data-id="' + id + '"' : '';
    var g = '<g class="ca-lieu' + (clic ? ' ca-clic' : ' ca-inactif') + (actif ? ' ca-actif' : '') + (calme ? ' ca-calme' : '') + (verrou ? ' ca-verrouille' : '') + (entree ? ' ca-entree' : '') + (neuf ? ' ca-apparait' : '') + '" data-lieu="' + id + '"' + act + '>';
    var z = '<g class="ca-zone' + (clic ? ' ca-clic' : '') + (neuf ? ' ca-apparait' : '') + '" data-zone="' + id + '"' + act + '>';
    var cx = L.x, cy = L.y, rr = 70;
    var e = entree ? ENTREES[id] : ETIQ[id];
    // zone de clic
    if(entree){
      cx = e[0]; cy = e[1]; rr = 0;
    } else if(L.maison){
      var h = MAISONS[L.maison];
      z += '<rect class="ca-hit" x="' + (h.x - HW - 10) + '" y="' + (h.y - 48) + '" width="' + (HW * 2 + 40) + '" height="96" rx="14" fill="#fff" opacity="0"/>';
      cx = h.x; cy = h.y; rr = 62;
    } else if(RECTS[id]){
      var R = RECTS[id];
      z += '<rect class="ca-hit" x="' + R[0] + '" y="' + R[1] + '" width="' + R[2] + '" height="' + R[3] + '" rx="16" fill="#fff" opacity="0"/>';
      cx = R[0] + R[2] / 2; cy = R[1] + R[3] / 2; rr = Math.max(R[2], R[3]) / 2 + 6;
    } else {
      var hz = HIT[id] || [0,0,60];
      cx = L.x + hz[0]; cy = L.y + hz[1]; rr = Math.max(hz[2], tmin / 2);
      if(id === 'ruelle') z += '<path class="ca-hit" d="' + lisse(RUELLE) + '" stroke="#fff" stroke-width="70" fill="none" opacity="0" stroke-linecap="round"/>';
      z += '<circle class="ca-hit" cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="#fff" opacity="0"/>';
    }
    if(actif && !entree) z += '<circle class="' + 'ca-pulse' + '" cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(Math.min(rr, 92)) + '" fill="none" stroke="#ffd27a" stroke-width="7" pointer-events="none"/>';
    var nom = G.nom, lw = G.lw, lh = G.lh;
    if(e && o.etiquettes !== false){
      /* l'étiquette se touche aussi : une zone invisible d'au moins toucheMin autour (≥ 48 px à l'écran) */
      if(clic){
        var hw = Math.max(lw + 16, tmin), hh = Math.max(lh + 14, tmin);
        z += '<rect class="ca-hit ca-hit-etiq" x="' + f(e[0] - hw / 2) + '" y="' + f(e[1] - hh / 2) + '" width="' + f(hw) + '" height="' + f(hh) + '" rx="' + f(hh / 2) + '" fill="#fff" opacity="0"/>';
      }
      if(actif && entree) z += '<rect class="' + 'ca-pulse' + '" x="' + f(e[0] - lw / 2 - 9) + '" y="' + f(e[1] - lh / 2 - 9) + '" width="' + f(lw + 18) + '" height="' + f(lh + 18) + '" rx="' + f(lh / 2 + 9) + '" fill="none" stroke="#8ff3ff" stroke-width="6" pointer-events="none"/>';
      g += etiquette(e[0], e[1], L.ic, nom, entree ? {taille: taille, classe: 'ca-etiq-lieu ca-etiq-dessous' + (actif ? ' ca-etiq-actif' : ''), fond: '#2c2238', encre: '#c9f8ff'} : {taille: taille, classe: 'ca-etiq-lieu' + (actif ? ' ca-etiq-actif' : '')});
    }
    if(verrou){
      var vx = e ? e[0] + lw / 2 + 8 * ks : cx + 40, vy = e ? e[1] - 4 * ks : cy - 40;
      g += '<g class="ca-cadenas"><circle cx="' + f(vx) + '" cy="' + f(vy) + '" r="' + f(22 * ks) + '" fill="#2c2440" stroke="' + CONTOUR + '" stroke-width="3"/><text x="' + f(vx) + '" y="' + f(vy + 1) + '" font-size="' + f(24 * ks) + '" text-anchor="middle" dominant-baseline="central">🔒</text></g>';
    }
    if(neuf && e && clic){
      /* il vient d'apparaître : des étincelles et une petite pancarte « Nouveau ! » */
      var ex = e[0], ey = e[1], et = '';
      for(var i = 0; i < 8; i++){ var a = i * Math.PI / 4 + .3; et += '<circle class="ca-etincelle" cx="' + f(ex + Math.cos(a) * (lw / 2 + 10)) + '" cy="' + f(ey + Math.sin(a) * (lh / 2 + 22)) + '" r="' + (i % 2 ? 6 : 9) + '" fill="' + (i % 2 ? '#8ff3ff' : '#ffe38a') + '" style="animation-delay:' + (0.45 + (i % 4) * 0.08).toFixed(2) + 's"/>'; }
      g += '<g class="ca-etincelles" pointer-events="none">' + et + '</g>';
      g += '<g class="ca-nouveau" pointer-events="none">' + etiquette(ex, ey - lh / 2 - 22 * ks, '✨', 'Nouveau !', {taille: Math.round(20 * ks), fond: '#ffd23f'}) + '</g>';
    }
    if(!entree) z += '<circle class="ca-tap" cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(Math.min(rr, 100)) + '" fill="#fff"/>';
    if(clic) fond += z + '</g>';   /* un lieu sans rien à faire n'a pas de zone : on peut toucher la maison qui est dessous */
    s += g + '</g>';
  });
  return {fond: fond, dessus: s};
}

/* ---------- Les visages des villageois (Romain, 5 novembre, 00 h 14) ----------
   o.visages = {id: image ronde (data:URI, préparée par carte-jeu.js)} : chaque visage est mis une seule fois dans <defs>, puis réutilisé (<use>).
   o.habitants = {maison: id | {id, nom}} : un petit rond avec le visage de l'habitant, posé sur le toit de sa maison (toutes les enquêtes). */
var MED = {dx:-8, dy:-10, r:25};   /* le rond sur le toit : à gauche de la cheminée, au-dessus de la porte et des fenêtres */
/* la boulangerie, la couture, la poste : leur étiquette est juste au-dessus du toit, le rond descend un peu (sans toucher le numéro ni la cheminée) */
var MED_POS = {F1:[-4, -5], L4:[0, 3], L6:[-3, -4]};
/* La présence d'un villageois chez lui : une pastille sur le rond de son visage (en haut à droite ; à droite pour les boutiques) */
var PASTILLE = {r:18, '*':[22, -21], F1:[27, 9], L4:[27, 7], L6:[27, 8]};
function pastille(p, mq, x, y){
  var r = PASTILLE.r, act = mq.act ? ' data-act="' + esc(mq.act) + '" data-id="' + esc(mq.id || '') + '"' : '';
  return '<g class="ca-marqueur ca-pastille' + (mq.act ? ' ca-clic' : '') + (mq.classe ? ' ' + esc(mq.classe) : '') + (mq.grise ? ' ingr-fait' : '') + '" data-lieu="' + esc(mq.maison || '') + '"' + (mq.visage ? ' data-pnj="' + esc(mq.visage) + '"' : '') +
    ' transform="translate(' + f(x) + ' ' + f(y) + ')"' + act + '>' + (mq.titre ? '<title>' + esc(mq.titre) + '</title>' : '') +
    '<circle cx="2" cy="3" r="' + (r + 1) + '" fill="#0b1a10" opacity=".3"/>' +
    '<circle r="' + r + '" fill="var(--ca-m, #9fd8ff)" stroke="' + CONTOUR + '" stroke-width="2.5"/><circle r="' + (r - 4) + '" fill="#fffaf0"/>' +
    (mq.inconnu ? inconnuSvg(0, 0, r - 4) : mq.visage ? visageUse(p, mq.visage, 0, 0, (r - 4) * 2) : '') + '</g>';
}
function defsVisages(p, o){
  var V = o.visages || {}, l = Object.keys(V).filter(function(id){ return V[id]; });
  return l.length ? '<defs>' + l.map(function(id){ return '<image id="' + p + 'v-' + esc(id) + '" width="100" height="100" href="' + V[id] + '"/>'; }).join('') + '</defs>' : '';
}
function visageUse(p, id, x, y, d){ return '<use href="#' + p + 'v-' + esc(id) + '" transform="translate(' + f(x - d / 2) + ' ' + f(y - d / 2) + ') scale(' + f(d / 100) + ')"/>'; }
/* o.habitants[k] = {inconnu:true} : quelqu'un habite là, mais on ne le connaît pas encore (pas dans le registre) : un « ? » */
function habitantDe(o, k){
  var hb = (o.habitants || {})[k], id = hb && (typeof hb === 'string' ? hb : hb.id);
  if(hb && hb.inconnu) return {inconnu:true, nom:''};
  return id && (o.visages || {})[id] ? {id:id, nom:(hb && hb.nom) || '', elle:!!(hb && hb.elle)} : null;
}
/* Le « ? » d'un villageois qu'on ne connaît pas (rond foncé, point d'interrogation clair) */
function inconnuSvg(x, y, r){
  return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#4a4262"/>' +
    '<text class="ca-t" x="' + f(x) + '" y="' + f(y + r * .06) + '" font-size="' + f(r * 1.45) + '" text-anchor="middle" dominant-baseline="central" fill="#fff3d6">?</text>';
}
function posMedaillon(k){ var h = MAISONS[k], d = MED_POS[k] || [MED.dx, MED.dy]; return {x:h.x + d[0], y:h.y + d[1], r:MED.r}; }
/* Où est chacun (Romain, 5 novembre, 8 h 59 ; DESIGN 12.20), pareil pour tous les rôles et toutes les enquêtes :
   o.presents = {maison: 1} : l'habitant est chez lui → le petit triangle jaune qui flotte au-dessus du rond de sa maison (pas d'autre icône) ;
   o.absents = {maison: 1} : il est ailleurs → le rond de sa maison est grisé, et son visage (cerclé de jaune, avec le triangle) est là où il est. */
function fleche(x, y, i, rouge){   /* rouge : un villageois fâché (le Barde, carte-jeu.js) */
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ')" pointer-events="none"><g class="ca-fleche" style="animation-delay:-' + (((i || 0) * .37) % 1.2).toFixed(2) + 's">' +
    '<path d="M-13 -19 L 13 -19 L 0 0 Z" fill="' + (rouge ? '#ff5a4a' : '#ffd23f') + '" stroke="' + CONTOUR + '" stroke-width="3.2" stroke-linejoin="round"/>' +
    '<path d="M-6 -15 L 3 -15" stroke="' + (rouge ? '#ffd2cb' : '#fff6c8') + '" stroke-width="2.6" stroke-linecap="round"/></g></g>';
}
var FLECHE_H = 26;   /* la place du triangle au-dessus d'un rond (avec son balancement) */
function medaillon(p, o, k){
  var hb = habitantDe(o, k); if(!hb) return '';
  var m = posMedaillon(k), x = m.x, y = m.y, r = m.r, absent = !!(o.absents || {})[k];
  return '<g class="ca-habitant' + (hb.inconnu ? ' ca-inconnu' : '') + (absent ? ' ca-absent' : '') + '" data-pnj="' + esc(hb.id || '?') + '">' + (hb.nom ? '<title>' + esc(hb.nom) + (absent ? ' (pas chez ' + (hb.elle ? 'elle' : 'lui') + ')' : '') + '</title>' : '') +
    '<circle cx="' + f(x + 3) + '" cy="' + f(y + 4) + '" r="' + r + '" fill="#0b1a10" opacity=".3"/>' +
    '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + (hb.inconnu ? '#cfc6b0' : (o.presents || {})[k] === 'fache' ? '#ff5a4a' : '#f3d27a') + '" stroke="' + CONTOUR + '" stroke-width="3"/>' +   /* (rouge : fâché, chez lui) */
    (hb.inconnu ? inconnuSvg(x, y, r - 4) : visageUse(p, hb.id, x, y, (r - 4) * 2)) +
    '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (r - 4) + '" fill="none" stroke="' + CONTOUR + '" stroke-width="1.6"/></g>';
}

function maisonsInteractives(o, p){
  var actifs = Array.isArray(o.actifs) ? o.actifs : null, caches = o.caches || [];
  var s = '';
  Object.keys(MAISONS).forEach(function(k){
    var h = MAISONS[k];
    var lieu = LIEU_DE_MAISON[k];
    var lieuClic = lieu && caches.indexOf(lieu) < 0 && (!actifs || o.aides === false || actifs.indexOf(lieu) >= 0 || (o.verrous || []).indexOf(lieu) >= 0);
    var med = medaillon(p, o, k);
    if(Array.isArray(o.maisons) && o.maisons.indexOf(k) < 0){ s += '<g class="ca-maison ca-maison-off" data-id="' + k + '">' + numero(h.x, h.y, h.num) + med + '</g>'; return; }   /* o.maisons (tutoriel) : seules ces maisons se touchent */
    if(lieuClic){
      // la maison appartient au lieu (la boulangerie…) : c'est le lieu qui se touche ; le numéro reste à part
      s += '<g class="ca-maison ca-clic" data-act="maison" data-id="' + k + '"><circle cx="' + (h.x - HW + 4) + '" cy="' + (h.y + 26) + '" r="32" fill="#fff" opacity="0"/>' + numero(h.x, h.y, h.num) + med + '</g>';
    } else {
      s += '<g class="ca-maison ca-clic" data-act="maison" data-id="' + k + '"><rect class="ca-hit" x="' + (h.x - HW - 8) + '" y="' + (h.y - 46) + '" width="' + (HW * 2 + 16) + '" height="92" rx="12" fill="#fff" opacity="0"/>' +
        '<rect class="ca-tap" x="' + (h.x - HW - 4) + '" y="' + (h.y - 42) + '" width="' + (HW * 2 + 8) + '" height="84" rx="12" fill="#fff"/>' + numero(h.x, h.y, h.num) + med + '</g>';
    }
  });
  return s;
}

function notes(o){
  var n = o.notes || {}, s = '';
  Object.keys(n).forEach(function(k){
    var h = MAISONS[k]; if(!h || !n[k]) return;
    var t = n[k].texte || '', ic = n[k].ic || '';
    var taille = 24;
    var svgIc = estSvg(ic);
    var lw = largeurTexte(t, taille) + (ic ? 40 : 0) + 22, hh = 40;
    var x = h.x, y = h.y - 68;
    s += '<g class="ca-note"' + (Array.isArray(o.maisons) && o.maisons.indexOf(k) < 0 ? ' pointer-events="none"' : ' data-act="maison"') + ' data-id="' + k + '">' +
      '<path d="M' + x + ' ' + (y + hh / 2) + ' v12" stroke="' + CONTOUR + '" stroke-width="3"/>' +
      '<rect x="' + f(x - lw / 2) + '" y="' + f(y - hh / 2) + '" width="' + f(lw) + '" height="' + hh + '" rx="9" fill="#f3e7cb" stroke="' + CONTOUR + '" stroke-width="3"/>';
    var tx = x - lw / 2 + 11;
    if(ic){
      if(svgIc) s += svgImbrique(ic, tx - 2, y - 17, 34);
      else s += '<text x="' + f(tx + 16) + '" y="' + f(y + 1) + '" font-size="24" text-anchor="middle" dominant-baseline="central">' + esc(ic) + '</text>';
      tx += 38;
    }
    s += '<text class="ca-t" x="' + f(tx) + '" y="' + f(y + 1) + '" font-size="' + taille + '" dominant-baseline="central" fill="#35281b">' + esc(t) + '</text></g>';
  });
  return s;
}

/* Un marqueur posé à côté de l'étiquette de son lieu : une tête dans un rond, une petite pointe vers l'étiquette,
   et le nom au-dessus quand il y a la place. (fx, fy) = centre du rond ; dir = où est l'étiquette : 'b' en dessous, 'g' à gauche, 'd' à droite. */
var MQ_R = 30, MQ_POINTE = 14, MQ_NOM = 21;
function marqueurPose(p, mq, i, fx, fy, dir, avecNom, ks, rHit){
  var R = MQ_R, act = mq.act ? ' data-act="' + esc(mq.act) + '" data-id="' + esc(mq.id || '') + '"' : '';
  var pointe = dir === 'g' ? 'M' + (-R + 8) + ' -12 L' + (-R - MQ_POINTE) + ' 0 L' + (-R + 8) + ' 12 Z' :
               dir === 'd' ? 'M' + (R - 8) + ' -12 L' + (R + MQ_POINTE) + ' 0 L' + (R - 8) + ' 12 Z' :
               dir === 'h' ? 'M-12 ' + (-R + 8) + ' L0 ' + (-R - MQ_POINTE) + ' L12 ' + (-R + 8) + ' Z' :
               'M-12 ' + (R - 8) + ' L0 ' + (R + MQ_POINTE) + ' L12 ' + (R - 8) + ' Z';
  var cid = p + 'clip' + i, r2 = R - 6;
  /* la position d'un villageois : comme le rond de sa maison (cerclé de jaune), sans pointe, avec le petit triangle qui flotte au-dessus */
  var presence = mq.classe === 'presence';
  var s = '<g class="ca-marqueur ca-pose' + (mq.act ? ' ca-clic' : '') + (mq.classe ? ' ' + esc(mq.classe) : '') + (mq.grise ? ' ingr-fait' : '') + (mq.fache ? ' ca-fache' : '') + '" data-lieu="' + esc(mq.lieu || mq.maison || '') + '"' + (mq.visage ? ' data-pnj="' + esc(mq.visage) + '"' : '') + ' transform="translate(' + f(fx) + ' ' + f(fy) + ') scale(' + f(ks) + ')"' + act + '>' +
    (mq.titre ? '<title>' + esc(mq.titre) + '</title>' : '') +
    '<g class="ca-flotte" style="animation-delay:-' + ((i * .41) % 2.4).toFixed(2) + 's">' +
    (presence ? '<circle cx="3" cy="4" r="' + R + '" fill="#0b1a10" opacity=".3"/>' : '<path d="' + pointe + '" fill="var(--ca-m, #f5b945)" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/>') +
    '<circle r="' + R + '" fill="var(--ca-m, #f5b945)" stroke="' + CONTOUR + '" stroke-width="3"/><circle r="' + r2 + '" fill="#fffaf0"/>';
  if(mq.inconnu) s += inconnuSvg(0, 0, r2);   /* quelqu'un qu'on ne connaît pas encore : un « ? » */
  else if(mq.visage) s += visageUse(p, mq.visage, 0, 0, r2 * 2);   /* le visage d'un villageois (o.visages) */
  else if(estSvg(mq.ic)) s += '<clipPath id="' + cid + '"><circle r="' + r2 + '"/></clipPath><g clip-path="url(#' + cid + ')">' + svgImbrique(mq.ic, -r2, -r2, r2 * 2) + '</g>';
  else if(mq.ic){ var nIc = nbEmojis(String(mq.ic)); s += '<text x="0" y="1" font-size="' + (nIc <= 1 ? 29 : nIc === 2 ? 20 : 15) + '" text-anchor="middle" dominant-baseline="central">' + esc(mq.ic) + '</text>'; }
  if(presence) s += '<circle r="' + r2 + '" fill="none" stroke="' + CONTOUR + '" stroke-width="1.6"/>';
  /* mq.bulle (enquête 3, le marché aux fleurs du Barde) : une petite bulle blanche avec un dessin, en haut à droite du visage (🌸 : il vend des fleurs) */
  if(mq.bulle) s += '<g class="ca-bulle-mq" transform="translate(' + f(R * .82) + ' ' + f(-R * .78) + ')"><circle r="15" fill="#fffaf0" stroke="' + CONTOUR + '" stroke-width="2.6"/><text x="0" y="1" font-size="17" text-anchor="middle" dominant-baseline="central">' + esc(mq.bulle) + '</text></g>';
  s += '</g>';
  if(presence && !mq.foule) s += fleche(0, -R - 5, i, mq.fache);
  if(avecNom && mq.label) s += etiquette(0, -R - 4 - (MQ_NOM + 16) / 2, '', mq.label, {taille: MQ_NOM, classe: 'ca-nom'});
  /* sa zone à toucher, plus grande que le rond, va dans la couche du dessous (sous les étiquettes) */
  var z = '<g class="ca-zone ca-zone-mq' + (mq.act ? ' ca-clic' : '') + '" data-zone-mq="' + esc(mq.lieu || '') + '" transform="translate(' + f(fx) + ' ' + f(fy) + ') scale(' + f(ks) + ')"' + act + '><circle class="ca-hit" r="' + f(rHit) + '" fill="#fff" opacity="0"/></g>';
  return {fond: z, dessus: s + '</g>'};
}
function nbEmojis(t){
  try{ if(window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter('fr', {granularity:'grapheme'}).segment(t)).length; }catch(e){}
  return Array.from(t.replace(/️/g, '').replace(/‍[\s\S]/gu, '')).length;
}
function seCroisent(a, b){ return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; }
/* Choisit où poser les marqueurs d'un lieu sans cacher aucune étiquette : au-dessus (avec les noms), au-dessus (têtes seules), à droite, à gauche */
function poserMarqueurs(p, o, G, items, occupes, ks, tmin, sortie){
  var r = G.rect, n = items.length, ignore = G.ignore || [];
  ks = ks * Math.min.apply(null, items.map(function(it){ return it.mq.echelle || 1; }));   /* mq.echelle : un marqueur plus petit (la présence d'un villageois) */
  var R = MQ_R * ks, rHit = Math.max(40 * ks, tmin / 2), bord = R + 6 * ks;
  var fl = items.some(function(it){ return it.mq.classe === 'presence'; }) ? (FLECHE_H + 5) * ks : 0;   /* le triangle au-dessus des villageois */
  var pasNom = Math.max(2 * R + 8 * ks, Math.max.apply(null, items.map(function(it){ return it.mq.label ? (largeurTexte(it.mq.label, MQ_NOM) + 34) * ks : 0; })));
  var pas = 2 * R + 8 * ks;
  var cx = G.e[0], cy = G.e[1];   /* centre de l'étiquette (sans le cadenas) */
  var haut = r[1] - 1 - (MQ_POINTE + MQ_R) * ks, bas = r[3] + 1 + (MQ_POINTE + MQ_R) * ks;
  var essais = [
    {dir:'b', nom:true, pas:pasNom, x0:cx - (n - 1) / 2 * pasNom, y:haut, dx:pasNom, rect:[cx - n * pasNom / 2, haut - R - (MQ_NOM + 20) * ks, cx + n * pasNom / 2, r[1] - 1]},
    {dir:'b', nom:false, x0:cx - (n - 1) / 2 * pas, y:haut, dx:pas, rect:[cx - n * pas / 2 - (bord - R), haut - bord - fl, cx + n * pas / 2 + (bord - R), r[1] - 1]},
    {dir:'g', nom:false, x0:r[2] + 2 + (MQ_POINTE + MQ_R) * ks, y:cy, dx:pas, rect:[r[2] + 2, cy - bord - fl, r[2] + 2 + (MQ_POINTE + MQ_R) * ks + (n - 1) * pas + bord, cy + bord]},
    {dir:'d', nom:false, x0:r[0] - 2 - (MQ_POINTE + MQ_R) * ks, y:cy, dx:-pas, rect:[r[0] - 2 - (MQ_POINTE + MQ_R) * ks - (n - 1) * pas - bord, cy - bord - fl, r[0] - 2, cy + bord]},
    {dir:'h', nom:false, x0:cx - (n - 1) / 2 * pas, y:bas + fl, dx:pas, rect:[cx - n * pas / 2 - (bord - R), r[3] + 1, cx + n * pas / 2 + (bord - R), bas + bord + fl]}
  ];
  /* le premier essai qui ne touche rien ; sinon celui qui recouvre le moins */
  var choix = null, moins = 1e9;
  for(var k = 0; k < essais.length; k++){
    var e = essais[k], q = e.rect, gene = 0;
    gene += Math.max(0, -q[0]) + Math.max(0, q[2] - W) + Math.max(0, -q[1]) + Math.max(0, q[3] - H);
    occupes.forEach(function(o2){ if(o2 !== r && ignore.indexOf(o2) < 0 && seCroisent(q, o2)) gene +=(Math.min(q[2], o2[2]) - Math.max(q[0], o2[0])) * (Math.min(q[3], o2[3]) - Math.max(q[1], o2[1])) + 1; });
    if(gene === 0){ choix = e; break; }
    if(gene < moins){ moins = gene; choix = e; }
  }
  occupes.push(choix.rect);
  items.forEach(function(it, j){
    var m = marqueurPose(p, it.mq, it.i, choix.x0 + j * choix.dx, choix.y, choix.dir, choix.nom, ks, rHit / ks);
    sortie.fond += m.fond; sortie.dessus += m.dessus;
  });
}

/* (enquête 3, la nuit : la fête ; Romain, 13 novembre : « tu les répartis dans la place, il ne faut pas que ça dépasse la place, de
   sorte qu'ils ne se chevauchent pas ») Une foule : tous les visages d'un lieu, rangés en rangées décalées DANS le rond du lieu
   (HIT[lieu] : son rayon), serrés au besoin. Pas de triangle jaune au-dessus de chacun (ils se cacheraient les uns les autres). */
function poserFoule(p, lieu, items, ks, tmin, sortie, G){
  var L = LIEUX[lieu], hit = HIT[lieu] || [0, 0, 90], cx = L.x + hit[0], cy = L.y + hit[1], RL = hit[2], n = items.length;
  /* l'étiquette du lieu mord sur le bas de son rond (« Place des Lanternes ») : la foule tient dans le plus grand rond au-dessus d'elle */
  if(G && G.rect && G.rect[1] > cy && G.rect[1] - 4 < cy + RL){ var hautL = cy - RL, basL = G.rect[1] - 4; RL = (basL - hautL) / 2; cy = hautL + RL; }
  var k = ks * Math.min.apply(null, items.map(function(it){ return it.mq.echelle || 1; })), essai = 0, places = null, R, pas;
  /* on essaie des rangées de plus en plus fournies, puis des visages de plus en plus petits, jusqu'à ce que tout tienne dans le rond */
  for(; essai < 12 && !places; essai++){
    R = MQ_R * k; pas = 2 * R + 5 * k;
    var dy = pas * .9;
    for(var rangs = 1; rangs <= 6 && !places; rangs++){
      var hauteur = (rangs - 1) * dy, l = [], reste = n, ok = true;
      for(var j = 0; j < rangs; j++){
        var y = cy - hauteur / 2 + j * dy, demi = Math.sqrt(Math.max(0, RL * RL - Math.pow(Math.abs(y - cy) + R, 2))) - R;   /* la demi-largeur libre à cette hauteur */
        if(demi < 0){ ok = false; break; }
        var cap = Math.floor(2 * demi / pas) + 1; l.push({y: y, cap: cap});
      }
      if(!ok) continue;
      if(l.reduce(function(a, x){ return a + x.cap; }, 0) < n) continue;
      /* répartir : autant que possible le même nombre par rangée, les rangées du milieu d'abord (elles sont plus larges) */
      var nb = l.map(function(){ return 0; }), ordreR = l.map(function(x, i2){ return i2; }).sort(function(a, b){ return l[b].cap - l[a].cap; });
      while(reste > 0){ var pose = false; ordreR.forEach(function(i2){ if(reste > 0 && nb[i2] < l[i2].cap){ nb[i2]++; reste--; pose = true; } }); if(!pose) break; }
      if(reste > 0) continue;
      places = []; l.forEach(function(x, i2){ for(var q = 0; q < nb[i2]; q++) places.push([cx + (q - (nb[i2] - 1) / 2) * pas, x.y]); });
    }
    if(!places) k *= .93;
  }
  if(!places){ places = items.map(function(it, j2){ var a = j2 / n * Math.PI * 2; return [cx + Math.cos(a) * RL * .6, cy + Math.sin(a) * RL * .6]; }); }
  var rHit = Math.max(R + 2, Math.min(40 * k, tmin / 2));
  items.forEach(function(it, j3){
    var mq = Object.assign({}, it.mq, {foule: true});
    var m = marqueurPose(p, mq, it.i, places[j3][0], places[j3][1], 'b', false, k, rHit / k);
    sortie.fond += m.fond; sortie.dessus += m.dessus;
  });
}
function marqueurs(p, o, geo){
  var liste = o.marqueurs || [], s = '';
  var groupes = {}, parLieu = {}, ordre = [], chezEux = {}, geoCache = {}, foules = {}, poses = [];
  var ks = (o.etiquette || 25) / 25, tmin = o.toucheMin || 0;
  geo = geo || {liste:[], parId:{}};
  liste.forEach(function(mq, i){
    var x, y;
    if(mq.maison && MAISONS[mq.maison]){
      /* chez lui (la présence d'un villageois) : une pastille posée sur le rond de son visage, sur le toit (plus bas) */
      if((mq.visage || mq.inconnu) && o.marqueursPoses !== false){ (chezEux[mq.maison] = chezEux[mq.maison] || []).push({mq: mq, i: i}); return; }
      x = MAISONS[mq.maison].x; y = MAISONS[mq.maison].y - 30;
    }
    else if(mq.lieu && LIEUX[mq.lieu]){
      /* (enquête 3) posé à un endroit précis (mq.pose : Anselme sur le toit du clocher, la nuit) ; ou dans la foule d'un lieu
         (o.foules : la fête sur la place) — plus bas, poserFoule */
      if(mq.classe === 'presence' && mq.pose && o.marqueursPoses !== false){ poses.push({mq: mq, i: i}); return; }
      if(mq.classe === 'presence' && o.foules && o.foules[mq.lieu] && o.marqueursPoses !== false){ (foules[mq.lieu] = foules[mq.lieu] || []).push({mq: mq, i: i}); return; }
      /* lieu caché : son marqueur aussi… sauf la position d'un villageois (on sait toujours où est chacun) : posée sur le lieu, sans étiquette */
      if((o.caches || []).indexOf(mq.lieu) >= 0){
        if(mq.classe !== 'presence' || LIEUX[mq.lieu].zone === 'dessous') return;
        if(!geoCache[mq.lieu]){ var pe = ETIQ[mq.lieu] || [LIEUX[mq.lieu].x, LIEUX[mq.lieu].y]; geoCache[mq.lieu] = {id:mq.lieu, e:pe, rect:[pe[0] - 2, pe[1] - 2, pe[0] + 2, pe[1] + 2]}; }
      }
      var G = geoCache[mq.lieu] || geo.parId[mq.lieu];
      /* un lieu sans étiquette (la ruelle, dont le nom est sur la plaque de rue) : le villageois est posé sur le lieu lui-même */
      if(mq.classe === 'presence' && !(G && G.rect) && o.marqueursPoses !== false){ var pl = [LIEUX[mq.lieu].x, LIEUX[mq.lieu].y]; G = geoCache[mq.lieu] = {id:mq.lieu, e:pl, rect:[pl[0] - 2, pl[1] - 2, pl[0] + 2, pl[1] + 2]}; }
      /* posé à côté de l'étiquette du lieu, pour ne jamais la cacher */
      if(G && G.rect && o.marqueursPoses !== false){ if(!parLieu[mq.lieu]){ parLieu[mq.lieu] = []; ordre.push(mq.lieu); } parLieu[mq.lieu].push({mq: mq, i: i}); return; }
      x = LIEUX[mq.lieu].x; y = LIEUX[mq.lieu].y;
    }
    else { x = mq.x || 0; y = mq.y || 0; }
    var cle = Math.round(x) + ':' + Math.round(y);
    (groupes[cle] = groupes[cle] || []).push({mq: mq, x: x, y: y, i: i});
  });
  var sortie = {fond:'', dessus:''};
  Object.keys(foules).forEach(function(id){ poserFoule(p, id, foules[id], ks, tmin, sortie, geo.parId[id]); });
  poses.forEach(function(it){
    var kp = ks * (it.mq.echelle || 1), mp = marqueurPose(p, it.mq, it.i, it.mq.pose[0], it.mq.pose[1], 'b', false, kp, Math.max(40 * kp, tmin / 2) / kp);
    sortie.fond += mp.fond; sortie.dessus += mp.dessus;
  });
  /* chez eux : la pastille (le même petit visage cerclé de bleu que la présence ailleurs), en haut à droite du rond de l'habitant ;
     elle ne sort pas de sa maison, et ne gêne donc ni les voisins ni la rue */
  var pastilles = [];
  Object.keys(chezEux).forEach(function(k){
    var m = posMedaillon(k), d = PASTILLE[k] || PASTILLE['*'];
    chezEux[k].forEach(function(it, j){
      var x = m.x + d[0] - j * 2 * d[0], y = m.y + d[1];   /* (un deuxième habitant chez lui : de l'autre côté) */
      pastilles.push([x - PASTILLE.r - 2, y - PASTILLE.r - 2, x + PASTILLE.r + 2, y + PASTILLE.r + 2]);
      sortie.dessus += pastille(p, it.mq, x, y);
    });
  });
  /* chez eux (Romain, 5 novembre, 8 h 59) : seulement le petit triangle qui flotte au-dessus du rond de leur maison */
  Object.keys(o.presents || {}).forEach(function(k, j){
    if(!MAISONS[k] || !habitantDe(o, k)) return;
    var m = posMedaillon(k);
    pastilles.push([m.x - 15, m.y - m.r - FLECHE_H - 4, m.x + 15, m.y - m.r]);
    sortie.dessus += fleche(m.x, m.y - m.r - 5, j, o.presents[k] === 'fache');
    /* (13 novembre) o.bullesChez = {maison:'🌸'} : la petite bulle d'un villageois qui est chez lui (Iris vend des fleurs dans sa boutique) */
    var buC = (o.bullesChez || {})[k];
    if(buC) sortie.dessus += '<g class="ca-bulle-mq" pointer-events="none" transform="translate(' + f(m.x + m.r * .82) + ' ' + f(m.y - m.r * .78) + ')"><circle r="15" fill="#fffaf0" stroke="' + CONTOUR + '" stroke-width="2.6"/><text x="0" y="1" font-size="17" text-anchor="middle" dominant-baseline="central">' + esc(buC) + '</text></g>';
  });
  /* (13 novembre) o.bullesMaison = {maison:'🐾'} : il reste quelque chose à faire dans cette maison, que son habitant soit là ou non
     (les traces de Moustache, devant chez Odette) : la même petite bulle, sur le rond de la maison */
  Object.keys(o.bullesMaison || {}).forEach(function(k){
    if(!MAISONS[k] || ((o.bullesChez || {})[k] && (o.presents || {})[k])) return;
    var m = posMedaillon(k);
    sortie.dessus += '<g class="ca-bulle-mq" pointer-events="none" transform="translate(' + f(m.x + m.r * .82) + ' ' + f(m.y - m.r * .78) + ')"><circle r="15" fill="#fffaf0" stroke="' + CONTOUR + '" stroke-width="2.6"/><text x="0" y="1" font-size="17" text-anchor="middle" dominant-baseline="central">' + esc(o.bullesMaison[k]) + '</text></g>';
  });
  if(ordre.length){
    /* tout ce qui est déjà écrit sur la carte : les étiquettes des lieux et les notes des maisons */
    var occupes = geo.liste.filter(function(G){ return G.rect; }).map(function(G){ return G.rect; });
    Object.keys(o.notes || {}).forEach(function(k){ var h = MAISONS[k], t = (o.notes[k] || {}).texte || ''; if(h) { var lw = largeurTexte(t, 24) + 62; occupes.push([h.x - lw / 2, h.y - 88, h.x + lw / 2, h.y - 36]); } });
    /* et aussi les maisons, les ronds des habitants, leurs pastilles et les plaques de rue : on ne les cache pas */
    Object.keys(MAISONS).forEach(function(k){
      var h = MAISONS[k]; occupes.push([h.x - HW - 6, h.y - 44, h.x + HW + 6, h.y + 46]);
      if(habitantDe(o, k)){ var m = posMedaillon(k); occupes.push([m.x - m.r - 3, m.y - m.r - 3, m.x + m.r + 3, m.y + m.r + 3]); }
    });
    pastilles.forEach(function(R){ occupes.push(R); });
    PLAQUES.forEach(function(P){ plaqueRects(P).forEach(function(R){ occupes.push(R); }); });
    ordre.forEach(function(id){ poserMarqueurs(p, o, geoCache[id] || geo.parId[id], parLieu[id], occupes, ks, tmin, sortie); });
  }
  Object.keys(groupes).forEach(function(cle){
    var g = groupes[cle], n = g.length;
    var pas = 68;
    g.forEach(function(it){ if(it.mq.label) pas = Math.max(pas, largeurTexte(it.mq.label, 21) + 34); });
    g.forEach(function(it, j){
      var mq = it.mq;
      var dx = (j - (n - 1) / 2) * pas, x = it.x + dx, y = it.y - (n > 1 ? Math.abs(dx) * .15 : 0);
      var act = mq.act ? ' data-act="' + esc(mq.act) + '" data-id="' + esc(mq.id || '') + '"' : '';
      var cid = p + 'clip' + it.i;
      var m2 = '<g class="ca-marqueur' + (mq.act ? ' ca-clic' : '') + (mq.classe ? ' ' + esc(mq.classe) : '') + (mq.grise ? ' ingr-fait' : '') + '" transform="translate(' + f(x) + ' ' + f(y) + ')"' + act + '>' +
        '<g class="ca-flotte" style="animation-delay:-' + ((it.i * .41) % 2.4).toFixed(2) + 's">' +
        '<ellipse cx="0" cy="4" rx="12" ry="5" fill="#000" opacity=".3"/>' +
        '<path d="M-13 -30 L0 0 L13 -30 Z" fill="var(--ca-m, #f5b945)" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="0" cy="-46" r="31" fill="var(--ca-m, #f5b945)" stroke="' + CONTOUR + '" stroke-width="3"/>' +
        '<circle cx="0" cy="-46" r="25" fill="#fffaf0"/>';
      if(estSvg(mq.ic)){
        m2 += '<clipPath id="' + cid + '"><circle cx="0" cy="-46" r="25"/></clipPath><g clip-path="url(#' + cid + ')">' + svgImbrique(mq.ic, -25, -71, 50) + '</g>';
      } else if(mq.ic){
        m2 += '<text x="0" y="-45" font-size="30" text-anchor="middle" dominant-baseline="central">' + esc(mq.ic) + '</text>';
      }
      m2 += '<circle class="ca-hit" cx="0" cy="-46" r="40" fill="#fff" opacity="0"/>';
      m2 += '</g>';
      if(mq.label) m2 += etiquette(0, 26, '', mq.label, {taille: 21, classe: 'ca-nom'});
      s += m2 + '</g>';
    });
  });
  return {fond: sortie.fond, dessus: sortie.dessus + s};
}

function surbrillance(o){
  var id = o.surbrillance; if(!id) return '';
  var x, y, r = 80;
  if(MAISONS[id]){ x = MAISONS[id].x; y = MAISONS[id].y; r = 70; }
  else if(LIEUX[id]){
    var L = LIEUX[id];
    if(L.maison){ x = MAISONS[L.maison].x; y = MAISONS[L.maison].y; r = 72; }
    else return '';   /* un lieu a déjà son rond doré qui pulse (et le rond du tutoriel) : plus de grand rond bleu par-dessus son dessin (Romain, 17 h 08) */
  } else return '';
  return '<g class="ca-surbrillance" pointer-events="none"><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r + 8) + '" fill="none" stroke="#8ff3ff" stroke-width="16" opacity=".25"/>' +
    '<circle class="ca-tourne" cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="none" stroke="#8ff3ff" stroke-width="6" stroke-dasharray="18 12" stroke-linecap="round"/></g>';
}

var ROLES = {pisteur:['var(--c-pisteur)','🏹'], alchimiste:['var(--c-alchimiste)','⚗️'], barde:['var(--c-barde)','🎻'], sage:['var(--c-sage)','📜']};
function calque(o){
  var c = ROLES[o.calque]; if(!c) return '';
  return '<g class="ca-calque" pointer-events="none"><rect x="7" y="7" width="986" height="1386" rx="30" fill="none" stroke="' + c[0] + '" stroke-width="12" opacity=".85"/>' +
    '<circle cx="62" cy="62" r="40" fill="#1c2447" stroke="' + c[0] + '" stroke-width="6"/><text x="62" y="64" font-size="38" text-anchor="middle" dominant-baseline="central">' + c[1] + '</text></g>';
}

/* ---------- Les endroits cachés où poussent les plantes (Romain, 12 novembre, 12 h 52 ; cueillette.js ; Bible §13.26) ----------
   o.cachettes = [{id, x, y, ic, connu, grise}], dans les mesures du village (une plante d'au-delà de la brume a des mesures qui en sortent :
   le groupe du village n'est pas découpé, elle tombe à sa place dans le grand monde).
   Tant que l'endroit n'est pas trouvé, RIEN ne se voit : seulement un rond invisible, qu'il faut toucher exactement (R_CACHETTE, en mesures
   de la carte : il ne grossit pas quand on recule, il faut zoomer pour viser). Trouvé : une petite pastille avec la plante (grise : plus rien
   à y cueillir pour l'instant). Le rond passe par-dessus les zones des lieux (le souci est dans la lavande de l'herboriste) mais sous les visages et les noms.
   La pastille est toujours dans le dessin (cachée tant que l'endroit n'est pas connu) : quand on le trouve, seule sa classe change, et la
   carte n'a pas à se redessiner (carte-jeu.js, patcherCarte).
   ⚠️ L'ENDROIT À TOUCHER EST EXACTEMENT LE ROND QUI S'AFFICHE (Romain, 12 novembre, 15 h 37 : « que la hitbox soit exactement le rond qui
   s'affiche. Qu'on ne puisse pas cliquer à côté […] beaucoup plus resserré […] ça évitera les accidents »). R_CACHETTE est le bord extérieur
   de la pastille (son trait compris) ET le rayon du rond invisible : ne jamais donner à l'un un rayon que l'autre n'a pas. (Avant : 38 pour
   toucher, 24 pour la pastille.) c.n : le rang de l'endroit, quand une plante en a plusieurs (cueillette.js, pl.aussi). */
var R_CACHETTE = 24, TRAIT_CACHETTE = 3;   /* (le rond de la pastille : rayon 22,5 + la moitié de son trait = 24, tout rond) */
function cachettes(o){
  var fond = '', dessus = '';
  (o.cachettes || []).forEach(function(c){
    var n = c.n ? ' data-n="' + (+c.n) + '"' : '';
    fond += '<circle class="ca-cachette" data-act="cachette" data-id="' + esc(c.id) + '"' + n + ' cx="' + f(c.x) + '" cy="' + f(c.y) + '" r="' + R_CACHETTE + '" fill="#fff" opacity="0"/>';
    dessus += '<g class="ca-cach-pastille' + (c.connu ? '' : ' ca-cach-inconnue') + (c.grise ? ' ca-cach-grise' : '') + '" data-cachette="' + esc(c.id) + '"' + n + ' transform="translate(' + f(c.x) + ' ' + f(c.y) + ')" pointer-events="none">' +
      '<g class="ca-cach-rond"><circle r="' + f(R_CACHETTE - TRAIT_CACHETTE / 2) + '" fill="#fffaf0" stroke="' + CONTOUR + '" stroke-width="' + TRAIT_CACHETTE + '"/><text x="0" y="1" font-size="25" text-anchor="middle" dominant-baseline="central">' + esc(c.ic || '🌿') + '</text></g></g>';
  });
  return {fond: fond, dessus: dessus};
}

function svg(opts){
  var o = opts || {};
  var p = 'ca' + (o.id ? String(o.id).replace(/[^\w-]/g, '') : '') + (++compteur) + '-';
  var niveau = o.niveau === 'dessous' ? 'dessous' : 'surface';
  if(!o.caches && o['cachés']) o.caches = o['cachés'];
  var ctx = {fenetres: [], cheminees: [], lanternes: []};
  var ss = niveau === 'dessous' && o.sousSols;   /* les sous-sols du Pisteur : seulement ce qu'il a découvert */
  /* la surface : le village posé au milieu du grand monde (monde-*.js, Bible chapitre 14) ; sans ces fichiers, l'ancienne carte du village seul */
  var Monde = window.Monde;
  var grand = niveau === 'surface' && o.monde !== false && !!(Monde && Monde.assembler);
  var corps = ss ? svgSousSols(p, o) : niveau === 'dessous' ? svgDessous(p, o) : svgSurface(p, o, ctx, grand);
  var cls = 'ca-carte ca-' + niveau + ' ca-m-' + (o.moment || 'apresmidi') + (o.anime === false ? ' ca-fixe' : '') + (o.calque ? ' ca-calque-' + o.calque : '');
  if(ss) o = Object.assign({}, o, {caches: Object.keys(LIEUX)});
  var geo = geoLieux(o, niveau), li = lieuxInteractifs(p, o, niveau, geo), mq = marqueurs(p, o, geo);
  if(ss){ var si = sousSolsInteractifs(p, o), ci = cheminsInteractifs(p, o); li = {fond: li.fond + si.fond + ci.fond, dessus: li.dessus + si.dessus + ci.dessus}; }
  /* de bas en haut : le dessin, la surbrillance du tutoriel (sous la maison), les maisons, les zones invisibles à toucher, les notes,
     les marqueurs, et TOUT EN HAUT les écritures — le nom des lieux, « ✨ Nouveau ! » — : rien ne passe plus dessus
     (Romain, 5 novembre, 17 h 08 : « il faut toujours que les écritures soient au-dessus, pour qu'on ne soit pas gêné pour lire ») */
  var ch = niveau === 'surface' && !ss ? cachettes(o) : {fond: '', dessus: ''};   /* les plantes cachées de l'Alchimiste */
  var parDessus = surbrillance(o) +
    (niveau === 'surface' ? maisonsInteractives(o, p) : '') +
    li.fond + ch.fond + mq.fond +
    (niveau === 'surface' ? notes(o) : '') +
    mq.dessus + ch.dessus + li.dessus + calque(o);
  if(grand){
    /* LE GRAND MONDE (Bible chapitre 14). Le village est à sa place de toujours : tout ce qui est du village reste dans ses anciennes mesures, dans
       un groupe décalé de (OX, OY). o.brume : les zones dont la brume est levée (rien : toute la brume). */
    var mo = MOMENTS[o.moment] ? o.moment : 'apresmidi', pm = p + 'm-';
    /* o.brumePart (12 novembre, cueillette.js ; Bible §13.26) : les zones qu'on vient de lever (elles sont aussi dans o.brume). La brume d'avant
       est posée une dernière fois par-dessus, sur une toile à elle, qui s'efface en entier : seule son opacité bouge (carte.css, .ca-brume-part). */
    var G = Monde.assembler(pm, p, {riviere: o.riviere, brume: o.brume, part: o.brumePart, etiquette: o.etiquette, maquette: o.maquette});
    var village = '<g class="ca-village" transform="translate(' + Monde.OX + ' ' + Monde.OY + ')">';
    var tete = ' viewBox="0 0 ' + Monde.W + ' ' + Monde.H + '" xmlns="http://www.w3.org/2000/svg"';
    if(o.maquette)   /* la page du modèle : un seul dessin (sol, village, arbres et lieux d'autour, brume, voile du moment, lumières, écritures) */
      return '<svg class="' + cls + ' ca-grand"' + tete + ' data-ox="' + Monde.OX + '" data-oy="' + Monde.OY + '" role="img" aria-label="Carte de Brumeval">' +
        defs(p) + '<defs>' + Monde.defs(pm) + '</defs>' + defsVisages(p, o) +
        G.sol + village + corps[0] + '</g>' + G.dessus + G.brume + voile(p, mo, Monde.W, Monde.H) +
        village + corps[1] + parDessus + '</g>' + G.etiquettes +
        '</svg>';
    /* Dans le jeu : TROIS COUCHES posées l'une sur l'autre, de la même taille.
       (12 novembre, 12 h — mesuré : dans un seul dessin, tout ce qui bouge dans le village — fumées, roue, rivière — obligeait la tablette à
       repeindre à chaque image le monde et la brume, et la carte tournait trois fois moins vite que l'ancienne.)
       1. dessous (ca-fond) : le sol du monde, ses arbres, ses lieux. RIEN N'Y BOUGE (ca-fixe coupe ses animations). Il n'est dessiné que là où
          l'on voit quelque chose (G.vu : autour du village, et les zones levées) : sous la brume pleine, la tablette n'a rien à peindre.
       2. au milieu, LE DESSIN DE TOUJOURS (le premier dans la page, celui que le jeu connaît) : le ruisseau et la rivière qui coulent, le village,
          le voile de lumière du moment (sur tout ce qui est dessous), les lumières, ce qui se touche, les écritures. Son fond est transparent ;
          il compte à peu près autant de morceaux que l'ancienne carte.
       3. dessus (ca-fond ca-nuages) : LA BRUME, UNE IMAGE (12 novembre, 12 h 20 : en dessin, elle faisait ramer le téléphone de Romain dès qu'on
          glissait vers elle). Ici ce n'est qu'une petite toile vide : Carte.monter (poserBrume) la remplace par la toile peinte une fois pour
          toutes (monde-brume.js, toileBrume), teintée selon le moment. On ne la touche pas (les touchers passent au travers).
       Les dégradés sont tous rangés dans le dessin du milieu : celui du dessous s'en sert aussi (ils sont dans la même page). Sa découpe
       (« vu »), elle, est rangée chez lui. */
    var VM = MOMENTS[mo];
    return '<svg class="' + cls + ' ca-grand"' + tete + ' data-ox="' + Monde.OX + '" data-oy="' + Monde.OY + '" role="img" aria-label="Carte de Brumeval">' +
      defs(p) + '<defs>' + Monde.defs(pm) + '</defs>' + defsVisages(p, o) +
      '<g class="mo-vives">' + G.vives + '</g>' +
      village + corps[0] + '</g>' + voile(p, mo, Monde.W, Monde.H) +
      village + corps[1] + parDessus + '</g>' + G.etiquettes +
      '</svg>' +
      '<svg class="ca-fond ca-fixe"' + tete + ' aria-hidden="true"><defs><clipPath id="' + pm + 'vu">' + G.vu.map(function(q){ return '<rect x="' + q[0] + '" y="' + q[1] + '" width="' + (q[2] - q[0]) + '" height="' + (q[3] - q[1]) + '"/>'; }).join('') + '</clipPath></defs>' +
        '<g clip-path="url(#' + pm + 'vu)">' + G.sol + G.dessus + '</g></svg>' +
      '<canvas class="ca-fond ca-nuages" width="1" height="1" aria-hidden="true" data-levees="' + G.levees.join(',') + '" data-voile="' + [VM.haut[0], VM.haut[1], VM.bas[0], VM.bas[1]].join(',') + '"></canvas>' +
      /* (12 novembre) la brume qui s'en va : la toile de la brume d'AVANT (G.partAvant : les zones qui étaient déjà levées), posée par-dessus, et qui s'efface */
      (G.partAvant ? '<canvas class="ca-fond ca-nuages ca-brume-part" width="1" height="1" aria-hidden="true" data-levees="' + G.partAvant.join(',') + '" data-voile="' + [VM.haut[0], VM.haut[1], VM.bas[0], VM.bas[1]].join(',') + '"></canvas>' : '');
  }
  if(niveau === 'surface' && !ss) corps = corps[0] + corps[1];
  return '<svg class="' + cls + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte de Brumeval">' +
    defs(p) + defsVisages(p, o) + corps + parDessus +
    '</svg>';
}

/* ==========================================================
   La carte en plein écran (onglet Carte du jeu)
   À l'ouverture, toute la carte tient dans l'écran (opts.zoom = 0, carte-jeu.js) ; on zoome en pinçant à deux doigts ou à la molette (12 novembre ; avant : des boutons ＋ / −), jusqu'au plus gros
   (téléphone : la carte devient bien plus grande que l'écran, on la fait glisser au doigt, avec l'élan, ou à la souris).
   Plus de zoom à deux doigts (Romain, 3 novembre) : sur iPhone, on pouvait tirer la carte hors de l'écran. Deux doigts ne font rien de plus qu'un.
   Tablette : la carte prend toute la largeur (couchée, on la fait glisser de haut en bas).
   HTML attendu : <div class="ca-plein"><div class="ca-vue"><div class="ca-monde">svg</div></div></div>
   ========================================================== */
var K_TEL = 0.75;   /* téléphone : 1 unité de carte = 0,75 px (étiquettes ~19 px, la carte fait 2 écrans de large) */
function telephone(){ var w = window.innerWidth || 800, h = window.innerHeight || 800; return Math.min(w, h) < 600; }
/* Taille de la carte (px par unité) pour une zone de w × h px.
   murale : la carte accrochée au mur de la cabane (un cadre plus petit) : sur tablette aussi elle reste lisible et on la fait glisser. */
var K_MURALE = 0.6, K_MAX = 1.4;
function echelle(w, h, murale){
  var fit = Math.min(w / W, h / H);
  if(telephone()) return Math.max(fit, K_TEL, w / W);
  /* tablette : la carte prend toute la largeur du cadre (en hauteur, elle tient presque entière ; couchée, on la fait glisser de haut en bas) ;
     dans un petit cadre (carte murale), jamais moins de K_MURALE pour rester lisible */
  return Math.max(fit, Math.min(w / W, K_MAX), K_MURALE);
}
/* Réglages des étiquettes pour cette taille : texte d'au moins ~15 px, zones à toucher d'au moins 50 px */
function reglagesEcran(w, h, murale){
  var k = echelle(w, h, murale);
  return {k: k, etiquette: Math.max(25, Math.min(34, Math.round(15 / k))), toucheMin: Math.round(50 / k)};
}
function position(id){
  if(MAISONS[id]) return {x: MAISONS[id].x, y: MAISONS[id].y};
  var e = posEtiquette(id); return e ? {x: e[0], y: e[1]} : null;
}

/* La brume du grand monde est une image (monde-brume.js, toileBrume). Le dessin de la carte ne contient qu'une petite toile vide, qui dit quelles
   zones sont levées (data-levees) et quel est le voile de lumière du moment (data-voile) ; ici on la remplace par la vraie toile, peinte une
   fois et gardée (toujours le même <canvas> pour un même moment : on n'en fabrique pas un à chaque affichage).
   Appelé par Carte.monter, et par carte-jeu.js quand il retouche la carte affichée sans la remonter (M.carteInchangee) : le moment qui change
   se contente alors de changer data-voile sur la toile en place — c'est le signe qu'il faut poser l'autre toile.
   (Si la bonne toile est déjà posée dans une autre carte encore affichée, on en pose une copie.) */
function poserBrume(racine){
  var Monde = window.Monde;
  if(!racine || !Monde || !Monde.toileBrume) return;
  [].forEach.call(racine.querySelectorAll('canvas.ca-nuages[data-voile]'), function(c){
    var v = (c.getAttribute('data-voile') || '').split(','), lev = (c.getAttribute('data-levees') || '').split(',').filter(function(x){ return x; });
    c.removeAttribute('data-voile'); c.removeAttribute('data-levees');   /* une toile posée ne porte plus ces deux marques */
    var toile = Monde.toileBrume(lev, v.length === 4 ? {haut: [v[0], +v[1]], bas: [v[2], +v[3]]} : null);
    if(!toile || !c.parentNode || toile === c) return;
    /* (12 novembre) la brume qui s'en va (carte.css, .ca-brume-part) : la toile de la brume d'avant porte cette classe le temps de s'effacer ;
       reposée plus tard comme brume ordinaire (c'est la même toile, gardée par toileBrume), elle la perd */
    toile.className = 'ca-fond ca-nuages' + (c.classList.contains('ca-brume-part') ? ' ca-brume-part' : '');
    if(toile.parentNode && toile.parentNode !== c.parentNode && document.documentElement.contains(toile)){
      var copie = document.createElement('canvas');
      copie.className = toile.className; copie.setAttribute('aria-hidden', 'true'); copie.width = toile.width; copie.height = toile.height;
      try{ copie.getContext('2d').drawImage(toile, 0, 0); }catch(e){}
      toile = copie;
    }
    c.parentNode.replaceChild(toile, c);
  });
}

function monter(ici, opts){
  opts = opts || {};
  var vue = ici && ici.querySelector('.ca-vue'), monde = ici && ici.querySelector('.ca-monde');
  if(!vue || !monde) return null;
  poserBrume(monde);
  /* k : px par unité de carte ; kMax = le plus gros zoom, kMin = toute la carte dans l'écran ; z = k / kMax.
     opts.zoom === 0 : on part de toute la carte dans l'écran (l'ouverture de la carte, Romain, 4 novembre, 21 h 12) */
  var V = {k: 0, kMin: 0, kMax: 0, z: opts.zoom === 0 ? 0 : Math.max(0.05, Math.min(1, opts.zoom || 1)), bloque: false, fins: []};
  var raf = 0;
  /* Le grand monde (Bible chapitre 14) : le dessin est plus grand que le village (MW × MH), et le village y est posé en (OX, OY).
     Dehors, rien ne change : les places qu'on donne ou qu'on reçoit (centre, allerVers, surVue) restent dans les mesures du village.
     - le plus petit zoom : la carte couvre tout le cadre (jamais de bande vide) ;
     - à l'ouverture (zoom 0) : le village tient dans le cadre, comme avant, avec le paysage autour ;
     - le plus gros zoom : le même qu'avant. */
  var dessin0 = monde.querySelector('svg'), vb0 = dessin0 && dessin0.viewBox && dessin0.viewBox.baseVal;
  var MW = vb0 && vb0.width ? vb0.width : W, MH = vb0 && vb0.height ? vb0.height : H;
  var OX = dessin0 ? +dessin0.getAttribute('data-ox') || 0 : 0, OY = dessin0 ? +dessin0.getAttribute('data-oy') || 0 : 0;
  var grand = MW > W + 1 || MH > H + 1;
  function kPetit(w, h){ return grand ? Math.max(w / MW, h / MH) : Math.min(w / W, h / H); }
  /* les dessins posés sous le premier (le grand monde et sa brume, où rien ne bouge) : ils suivent ses étirements pendant un zoom */
  function fonds(){ return [].slice.call(monde.children, 1).filter(function(d){ return d.classList && d.classList.contains('ca-fond'); }); }
  function centreVue(){
    if(!V.k) return null;
    return {x: (vue.scrollLeft + vue.clientWidth / 2 - monde.offsetLeft) / V.k - OX, y: (vue.scrollTop + vue.clientHeight / 2 - monde.offsetTop) / V.k - OY};
  }
  function centrer(x, y, doux){
    var l = (x + OX) * V.k + monde.offsetLeft - vue.clientWidth / 2, t = (y + OY) * V.k + monde.offsetTop - vue.clientHeight / 2;
    l = Math.max(0, Math.min(vue.scrollWidth - vue.clientWidth, l)); t = Math.max(0, Math.min(vue.scrollHeight - vue.clientHeight, t));
    if(doux && vue.scrollTo) vue.scrollTo({left: l, top: t, behavior: 'smooth'});
    else { vue.scrollLeft = l; vue.scrollTop = t; }
  }
  function bords(){
    var mx = vue.scrollWidth - vue.clientWidth, my = vue.scrollHeight - vue.clientHeight;
    ici.classList.toggle('ca-plus-g', vue.scrollLeft > 2);
    ici.classList.toggle('ca-plus-d', vue.scrollLeft < mx - 2);
    ici.classList.toggle('ca-plus-h', vue.scrollTop > 2);
    ici.classList.toggle('ca-plus-b', vue.scrollTop < my - 2);
    ici.classList.toggle('ca-glissable', mx > 2 || my > 2);
  }
  var depart = opts.centre || {x: W / 2, y: H * 0.53};
  function ajuster(c){
    var w = vue.clientWidth, h = vue.clientHeight;
    if(!w || !h) return;
    /* Seule la hauteur du cadre a changé (le bandeau du haut qui grandit, la barre du navigateur qui paraît ou s'en va) :
       on garde le même zoom, et on décale le défilement pour que la carte ne bouge pas d'un pixel à l'écran
       (Romain, 5 novembre, 19 h 39 : « la carte se déplace derrière, elle se réinitialise ») */
    var rv = vue.getBoundingClientRect();
    if(!c && V.k && V.w === w && V.h && V.h !== h){
      var kMin2 = Math.min(V.kMax, kPetit(w, h));
      if(V.k >= kMin2 - 1e-6){
        var dTop = rv.top - V.top, off0 = monde.offsetTop, st0 = vue.scrollTop;
        V.taille = w + 'x' + h; V.h = h; V.top = rv.top; V.kMin = kMin2;
        taille();
        vue.scrollTop = st0 + dTop + (monde.offsetTop - off0);
        bords();
        return;
      }
    }
    var centre = c || centreVue() || depart;   /* pas encore de taille au montage (cadre posé plus tard) : on centre au départ prévu */
    V.w = w; V.h = h; V.top = rv.top;
    V.taille = w + 'x' + h;
    V.kMax = echelle(w, h, opts.murale);
    V.kMin = Math.min(V.kMax, kPetit(w, h));
    V.kDepart = Math.max(V.kMin, Math.min(V.kMax, Math.min(w / W, h / H)));   /* l'ouverture : le village entier dans le cadre */
    V.k = V.z ? Math.max(V.kMin, Math.min(V.kMax, V.kMax * V.z)) : V.kDepart;
    taille();
    if(centre) centrer(centre.x, centre.y);
    bords();
  }
  function taille(){
    monde.style.width = (MW * V.k).toFixed(1) + 'px';
    monde.style.height = (MH * V.k).toFixed(1) + 'px';
    ici.style.setProperty('--ca-k', V.k.toFixed(4));
    ici.classList.toggle('ca-zoome', V.k < V.kMax - 1e-4);
    majBoutons();
  }
  function signaler(){ var c = centreVue(); if(c && opts.surVue){ c.z = V.z; opts.surVue(c); } }
  function surDefile(){
    if(raf) return;
    raf = requestAnimationFrame(function(){ raf = 0; bords(); signaler(); });
  }
  vue.addEventListener('scroll', surDefile, {passive: true});

  /* ---------- Gestes : un doigt (ou la souris) fait glisser, deux doigts zooment (entre « toute la carte » et la taille de départ) ----------
     Le navigateur ne fait rien lui-même ici (touch-action:none) : pas de zoom de la page, pas de défilement parasite. */
  function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function pointVue(cx, cy){ var r = vue.getBoundingClientRect(); return {x: cx - r.left - vue.clientLeft, y: cy - r.top - vue.clientTop}; }
  function sousPoint(p){ return {x: (vue.scrollLeft + p.x - monde.offsetLeft) / V.k, y: (vue.scrollTop + p.y - monde.offsetTop) / V.k}; }
  /* change la taille pour de bon, en gardant le point m de la carte sous le point p de l'écran */
  function zoomerA(k, m, p){
    V.k = borne(k, V.kMin, V.kMax); V.z = V.k / V.kMax;
    taille();
    vue.scrollLeft = m.x * V.k + monde.offsetLeft - p.x;
    vue.scrollTop = m.y * V.k + monde.offsetTop - p.y;
    bords(); signaler();
  }
  var doigts = {}, G = null, elan = 0;
  function liste(){ return Object.keys(doigts).map(function(id){ return doigts[id]; }); }
  function arreterElan(){ if(elan){ cancelAnimationFrame(elan); elan = 0; } }
  function debutGlisse(bouge){
    var p = liste()[0];
    G = {type: 'glisse', id: p.id, x0: p.x, y0: p.y, l0: vue.scrollLeft, t0: vue.scrollTop, bouge: !!bouge, souris: p.souris, hist: [{t: Date.now(), x: p.x, y: p.y}]};
  }
  function debutPince(){
    var l = liste(), a = l[0], b = l[1], pv = pointVue((a.x + b.x) / 2, (a.y + b.y) / 2);
    G = {type: 'pince', a: a.id, b: b.id, d0: Math.max(24, Math.hypot(a.x - b.x, a.y - b.y)), k0: V.k, k: V.k, s0: {x: vue.scrollLeft, y: vue.scrollTop},
      o0: {x: monde.offsetLeft, y: monde.offsetTop}, m: sousPoint(pv), p: pv, bouge: true, svg: monde.firstElementChild, fonds: fonds()};
    if(G.svg){ G.svg.style.transformOrigin = '0 0'; G.svg.style.willChange = 'transform'; }
    G.fonds.forEach(function(d){ d.style.transformOrigin = '0 0'; d.style.willChange = 'transform'; });
    ici.classList.add('ca-pince');
  }
  function majPince(){
    var a = doigts[G.a], b = doigts[G.b]; if(!a || !b) return;
    var p = pointVue((a.x + b.x) / 2, (a.y + b.y) / 2);
    var k = borne(G.k0 * Math.hypot(a.x - b.x, a.y - b.y) / G.d0, V.kMin, V.kMax), f = k / G.k0;
    /* pendant le geste, on étire l'image (rapide) ; la vraie taille est posée à la fin */
    var tx = p.x + G.s0.x - G.o0.x - f * G.m.x * G.k0, ty = p.y + G.s0.y - G.o0.y - f * G.m.y * G.k0;
    var tr = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + f.toFixed(4) + ')';
    if(G.svg) G.svg.style.transform = tr;
    G.fonds.forEach(function(d){ d.style.transform = tr; });
    G.k = k; G.p = p;
  }
  function finPince(){
    if(G.svg){ G.svg.style.transform = ''; G.svg.style.willChange = ''; }
    (G.fonds || []).forEach(function(d){ d.style.transform = ''; d.style.willChange = ''; });
    ici.classList.remove('ca-pince');
    zoomerA(G.k, G.m, G.p);
  }
  function lancerElan(){
    var h = G.hist, n = h.length; if(n < 2) return;
    var a = h[0], b = h[n - 1], dt = Math.max(16, b.t - a.t);
    var vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt, t0 = Date.now(), dernier = t0;
    if(Date.now() - b.t > 80 || Math.hypot(vx, vy) < 0.25) return;
    function pas(){
      var t = Date.now(), d = t - dernier; dernier = t;
      var fr = Math.pow(0.9, d / 16); vx *= fr; vy *= fr;
      vue.scrollLeft -= vx * d; vue.scrollTop -= vy * d;
      elan = (Math.hypot(vx, vy) > 0.03 && t - t0 < 700) ? requestAnimationFrame(pas) : 0;
    }
    elan = requestAnimationFrame(pas);
  }
  function surBas(e){
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    arreterElan(); V.bloque = false;
    doigts[e.pointerId] = {id: e.pointerId, x: e.clientX, y: e.clientY, souris: e.pointerType === 'mouse'};
    var n = liste().length;
    if(n === 1) debutGlisse(false);
    else if(n === 2) debutPince();   /* deux doigts : on pince pour zoomer (Romain, 12 novembre, 12 h 20 ; du 3 au 12 novembre, il y avait des boutons ＋ / −) */
  }
  function surMouv(e){
    var d = doigts[e.pointerId]; if(!d || !G) return;
    d.x = e.clientX; d.y = e.clientY;
    if(G.type === 'pince'){ majPince(); return; }
    if(G.id !== e.pointerId) return;
    var dx = d.x - G.x0, dy = d.y - G.y0, seuil = G.souris ? 6 : 9;
    if(!G.bouge && dx * dx + dy * dy > seuil * seuil){ G.bouge = true; ici.classList.add('ca-tire'); G.x0 = d.x; G.y0 = d.y; dx = dy = 0; G.l0 = vue.scrollLeft; G.t0 = vue.scrollTop; }
    if(G.bouge){
      vue.scrollLeft = G.l0 - dx; vue.scrollTop = G.t0 - dy;
      var t = Date.now(); G.hist.push({t: t, x: d.x, y: d.y}); while(G.hist.length > 2 && t - G.hist[0].t > 90) G.hist.shift();
      if(e.cancelable) e.preventDefault();
    }
  }
  function surHaut(e){
    if(!doigts[e.pointerId]) return;
    delete doigts[e.pointerId];
    if(!G) return;
    var reste = liste().length, bouge = G.bouge;
    if(G.type === 'pince'){ finPince(); if(reste >= 1){ debutGlisse(true); return; } }
    else if(G.type === 'glisse' && G.id === e.pointerId && reste >= 1){ debutGlisse(true); return; }
    if(reste) return;
    if(G.type === 'glisse' && G.bouge && !G.souris && e.type !== 'pointercancel') lancerElan();
    ici.classList.remove('ca-tire');
    G = null;
    /* après un glisser ou un pincement, le clic qui suit n'ouvre rien */
    if(bouge){ V.bloque = true; setTimeout(function(){ V.bloque = false; }, 700); }
  }
  vue.addEventListener('pointerdown', surBas);
  window.addEventListener('pointermove', surMouv, {passive: false});
  window.addEventListener('pointerup', surHaut);
  window.addEventListener('pointercancel', surHaut);
  V.fins.push(function(){ window.removeEventListener('pointermove', surMouv); window.removeEventListener('pointerup', surHaut); window.removeEventListener('pointercancel', surHaut); arreterElan(); });
  /* ordinateur : la molette zoome la carte, là où est la souris (Romain, 12 novembre, 12 h 20) ; pincer sur le pavé tactile aussi (le navigateur
     l'envoie comme une molette avec Ctrl). La page, elle, ne zoome jamais (sans-zoom.js). */
  vue.addEventListener('wheel', function(e){
    e.preventDefault();
    arreterElan();
    var p = pointVue(e.clientX, e.clientY), pas = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;   /* (certaines souris comptent en lignes) */
    zoomerA(V.k * Math.exp(-Math.max(-240, Math.min(240, pas)) * 0.0025), sousPoint(p), p);
  }, {passive: false});
  ici.addEventListener('click', function(e){ if(V.bloque){ V.bloque = false; e.stopPropagation(); e.preventDefault(); } }, true);
  vue.addEventListener('dragstart', function(e){ e.preventDefault(); });
  /* ---------- Plus de boutons ＋ / − (Romain, 12 novembre, 12 h 20) : on pince à deux doigts, ou on tourne la molette ----------
     Il reste un zoom « d'un cran » autour du milieu de l'écran, pour les robots d'essai : la poignée rendue par Carte.monter a zoomer(+1 ou -1). */
  var anim = 0;
  function majBoutons(){}
  function cran(){ return Math.max(1.3, Math.pow(V.kMax / Math.max(1e-4, V.kMin), 1 / 3)); }
  var animFonds = [];
  function zoomBouton(sens){
    if(!V.k) return;
    var k1 = sens > 0 ? V.k * cran() : V.k / cran();
    if(k1 > V.kMax * 0.97) k1 = V.kMax;
    if(k1 < V.kMin * 1.03) k1 = V.kMin;
    if(Math.abs(k1 - V.k) < 1e-4) return;
    arreterElan();
    var svgEl = monde.firstElementChild, p = {x: vue.clientWidth / 2, y: vue.clientHeight / 2}, m = sousPoint(p);
    var k0 = V.k, o0 = {x: monde.offsetLeft, y: monde.offsetTop}, s0 = {x: vue.scrollLeft, y: vue.scrollTop};
    zoomerA(k1, m, p);
    if(!svgEl || !svgEl.animate || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    /* la vraie taille est posée tout de suite ; l'image part de l'ancienne vue et glisse jusqu'à la nouvelle (jamais hors du cadre) */
    var f = k0 / V.k, tx = o0.x - s0.x - monde.offsetLeft + vue.scrollLeft, ty = o0.y - s0.y - monde.offsetTop + vue.scrollTop;
    if(anim){ try{ anim.cancel(); }catch(e){} }
    animFonds.forEach(function(a){ try{ a.cancel(); }catch(e){} });
    var images = [{transform: 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + f.toFixed(4) + ')'}, {transform: 'none'}], duree = {duration: 240, easing: 'ease-out'};
    svgEl.style.transformOrigin = '0 0';
    anim = svgEl.animate(images, duree);
    anim.onfinish = function(){ anim = 0; };
    animFonds = fonds().map(function(d){ d.style.transformOrigin = '0 0'; return d.animate(images, duree); });   /* le grand monde, dessous, fait le même trajet */
  }
  ajuster(depart);
  /* le cadre change de taille sans nouveau rendu (tablette qu'on tourne, cabane qui se réarrange) */
  var ro = null;
  if(window.ResizeObserver){
    ro = new ResizeObserver(function(){ if(vue.clientWidth + 'x' + vue.clientHeight !== V.taille){ ajuster(); if(opts.surTaille) opts.surTaille(vue.clientWidth, vue.clientHeight); } });
    ro.observe(vue);
  }
  return {
    ajuster: function(){ ajuster(); },
    centre: centreVue,
    get k(){ return V.k; },
    etat: function(){ return {k: V.k, kMin: V.kMin, kMax: V.kMax, z: V.z}; },
    zoomer: function(sens){ zoomBouton(sens); },   /* un cran de zoom (+1) ou de recul (-1), autour du milieu : pour les robots d'essai */
    /* glisse doucement jusqu'à un lieu (id) ou un point {x, y} */
    allerVers: function(cible, doux){
      var p = typeof cible === 'string' ? position(cible) : cible;
      if(p) centrer(p.x, p.y, doux !== false);
    },
    arreter: function(){ V.fins.slice().forEach(function(fn){ fn(); }); if(raf) cancelAnimationFrame(raf); if(ro) ro.disconnect(); }
  };
}

window.Carte = {LIEUX: LIEUX, MAISONS: MAISONS, ARBRES: ARBRES, svg: svg, W: W, H: H, echelle: echelle, reglagesEcran: reglagesEcran, position: position, monter: monter, poserBrume: poserBrume, telephone: telephone, R_CACHETTE: R_CACHETTE};
})();
