/* Donjon, maquette 2 (Romain, 8 novembre, 11 h 32) : héros de trois quarts en position d'attaque, vrai décor, vignettage,
   grande bande noire en bas qui change selon le héros qui joue. Images fixes. */
(function(){
var O = '#24182e';
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
var uid = 0;

/* ---------- les yeux, de trois quarts (le proche plus grand, le lointain plus étroit) ---------- */
function yeux(n, f, ir, lun){
  var s = '';
  [[n[0], n[1], 6.2, 7.4, 1], [f[0], f[1], 4.3, 7, 0.8]].forEach(function(e){
    var x = e[0], y = e[1], rx = e[2], ry = e[3];
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff"/>' +
      '<ellipse cx="' + (x + rx * 0.18) + '" cy="' + (y + 0.8) + '" rx="' + (rx * 0.74) + '" ry="' + (ry * 0.82) + '" fill="' + ir[1] + '"/>' +
      '<ellipse cx="' + (x + rx * 0.18) + '" cy="' + (y + 2.6) + '" rx="' + (rx * 0.5) + '" ry="' + (ry * 0.36) + '" fill="' + ir[2] + '" opacity=".75"/>' +
      '<ellipse cx="' + (x + rx * 0.22) + '" cy="' + (y + 0.2) + '" rx="' + (rx * 0.36) + '" ry="' + (ry * 0.48) + '" fill="' + ir[0] + '"/>' +
      '<circle cx="' + (x - rx * 0.12) + '" cy="' + (y - ry * 0.32) + '" r="' + (rx * 0.3) + '" fill="#fff"/>' +
      L('M' + (x - rx - 1.5) + ' ' + (y - ry * 0.55) + ' Q ' + x + ' ' + (y - ry - 2.2) + ' ' + (x + rx + 1.5) + ' ' + (y - ry * 0.45), O, 2.8);
  });
  if(lun) s += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="9.2" fill="#d8f4ff" fill-opacity=".18" stroke="#3a2a1a" stroke-width="2.2"/><circle cx="' + (f[0] + 0.5) + '" cy="' + f[1] + '" r="7.2" fill="#d8f4ff" fill-opacity=".18" stroke="#3a2a1a" stroke-width="2.2"/>' +
    L('M' + (n[0] + 9) + ' ' + (n[1] - 1) + ' L ' + (f[0] - 7) + ' ' + (f[1] - 1), '#3a2a1a', 2);
  return s;
}
/* tête de trois quarts tournée vers la droite, centre (cx, cy) */
function visage(cx, cy, peau, ir, opt){
  opt = opt || {};
  var g = 'vz' + (++uid);
  return '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + peau[2] + '"/><stop offset=".35" stop-color="' + peau[1] + '"/><stop offset="1" stop-color="' + peau[0] + '"/></linearGradient></defs>' +
    P('M' + (cx - 8) + ' ' + (cy + 24) + ' L ' + (cx + 6) + ' ' + (cy + 24) + ' L ' + (cx + 8) + ' ' + (cy + 38) + ' L ' + (cx - 10) + ' ' + (cy + 38) + ' Z', peau[2]) +
    P('M' + (cx - 24) + ' ' + (cy - 2) + ' C ' + (cx - 26) + ' ' + (cy - 26) + ' ' + (cx - 6) + ' ' + (cy - 34) + ' ' + (cx + 8) + ' ' + (cy - 32) +
      ' C ' + (cx + 24) + ' ' + (cy - 30) + ' ' + (cx + 32) + ' ' + (cy - 16) + ' ' + (cx + 30) + ' ' + cy +
      ' C ' + (cx + 30) + ' ' + (cy + 8) + ' ' + (cx + 28) + ' ' + (cy + 14) + ' ' + (cx + 24) + ' ' + (cy + 18) +
      ' C ' + (cx + 18) + ' ' + (cy + 27) + ' ' + (cx + 10) + ' ' + (cy + 31) + ' ' + (cx + 3) + ' ' + (cy + 31) +
      ' C ' + (cx - 9) + ' ' + (cy + 31) + ' ' + (cx - 21) + ' ' + (cy + 23) + ' ' + (cx - 23) + ' ' + (cy + 11) + ' Z', 'url(#' + g + ')') +
    P('M' + (cx - 20) + ' ' + (cy - 2) + ' C ' + (cx - 30) + ' ' + (cy - 4) + ' ' + (cx - 31) + ' ' + (cy + 9) + ' ' + (cx - 21) + ' ' + (cy + 12) + ' Z', peau[1]) +
    '<ellipse cx="' + (cx - 9) + '" cy="' + (cy + 14) + '" rx="6" ry="3.4" fill="' + peau[3] + '" opacity=".45"/>' +
    yeux([cx - 6, cy + 3], [cx + 17, cy + 2], ir, opt.lunettes) +
    L('M' + (cx - 15) + ' ' + (cy - 8) + ' L ' + (cx - 1) + ' ' + (cy - 5), O, 3) + L('M' + (cx + 13) + ' ' + (cy - 5) + ' L ' + (cx + 23) + ' ' + (cy - 9), O, 3) +
    L('M' + (cx + 25) + ' ' + (cy + 6) + ' L ' + (cx + 30) + ' ' + (cy + 12) + ' L ' + (cx + 25) + ' ' + (cy + 13), peau[2], 2.2) +
    (opt.sourire ? P('M' + (cx + 6) + ' ' + (cy + 19) + ' Q ' + (cx + 15) + ' ' + (cy + 26) + ' ' + (cx + 23) + ' ' + (cy + 18) + ' Q ' + (cx + 15) + ' ' + (cy + 21) + ' ' + (cx + 6) + ' ' + (cy + 19) + ' Z', '#fff6ee')
      : L('M' + (cx + 8) + ' ' + (cy + 21) + ' Q ' + (cx + 14) + ' ' + (cy + 22) + ' ' + (cx + 20) + ' ' + (cy + 19), O, 2.6));
}
function botte(d){ return P(d, '#8a5a32') ; }

/* ============ le Pisteur : il bande son arc ============ */
function pisteur(){
  var pe = ['#fff1e6', '#f7caa6', '#e8ad89', '#ff8f8f'], ch = ['#ffb886', '#dc622a', '#7a2a0e'], ir = ['#0a3a22', '#1f9150', '#86ffbd'];
  var t = '#efe2c4', ts = '#c7b088';
  return '<svg viewBox="0 0 250 300" style="width:100%;height:100%;overflow:visible;display:block">' +
    /* carquois dans le dos */
    P('M70 64 L 92 56 L 116 138 L 94 146 Z', '#7a4e2c') + L('M78 62 L 100 142', '#5e3a1e', 2) +
    P('M70 52 l -6 -10 l 12 4 Z', '#e04a3a') + P('M80 48 l -4 -12 l 10 6 Z', '#f3e7cb') + P('M90 46 l -2 -12 l 9 8 Z', '#e04a3a') +
    /* queue de cheval qui vole */
    P('M104 32 C 80 22 58 34 46 56 C 38 70 26 80 12 82 C 30 92 50 86 64 72 C 76 60 88 54 104 54 Z', ch[1]) + L('M96 36 C 76 34 62 48 52 64', ch[0], 3, ' opacity=".8"') +
    /* jambe arrière, tendue */
    P('M104 176 L 124 180 L 88 262 L 70 256 Z', '#5a3e2c') + botte('M70 248 L 92 254 L 88 282 L 92 290 L 48 290 Q 44 283 56 279 L 66 275 Z') +
    /* bras de l'arc (loin), tendu vers les monstres */
    P('M142 96 L 148 112 L 204 112 L 204 98 Z', ts) + P('M180 98 L 204 98 L 204 112 L 180 112 Z', '#7a4e2c') +
    /* corps */
    P('M98 98 Q 122 88 148 96 L 154 150 L 96 152 Q 92 124 98 98 Z', t) + P('M98 98 Q 106 96 112 98 L 108 152 L 96 152 Q 92 124 98 98 Z', ts) +
    P('M96 148 L 152 146 L 170 188 Q 132 198 88 190 Z', t) + P('M96 148 L 112 148 L 106 192 L 88 190 Z', ts) +
    L('M96 146 Q 124 154 154 144', O, 7) + L('M96 146 Q 124 154 154 144', '#d9b46a', 3.5) +
    /* jambe avant, pliée (la fente) */
    P('M128 172 L 152 178 L 190 214 L 172 234 Z', '#5a3e2c') + P('M172 222 L 192 216 L 202 262 L 180 266 Z', '#5a3e2c') +
    botte('M178 254 L 204 252 L 208 280 L 226 286 Q 230 292 218 292 L 176 292 Z') +
    /* écharpe verte qui flotte */
    P('M106 90 Q 124 100 144 90 L 146 100 Q 124 110 104 100 Z', '#2f8050') + P('M106 96 Q 84 96 66 112 Q 82 108 104 106 Z', '#2f8050') +
    /* l'arc et la corde */
    L('M196 22 Q 238 104 196 188', O, 11) + L('M196 22 Q 238 104 196 188', '#a06a3a', 6) + L('M199 30 Q 232 104 199 180', '#d29a5a', 1.6) +
    /* la tête */
    visage(124, 58, pe, ir) +
    P('M96 52 C 92 26 112 14 134 16 C 154 18 162 32 158 48 C 152 40 146 38 141 45 C 137 35 128 34 124 43 C 118 34 109 38 107 49 C 103 44 99 46 96 52 Z', ch[1]) +
    L('M110 22 C 124 18 140 20 150 28', ch[0], 3) + P('M96 40 l 8 -6 l 4 10 Z', '#2f8050') +
    L('M196 22 L 128 90 L 196 188', '#f3e7cb', 1.8) +
    /* la flèche */
    L('M120 90 L 238 100', O, 6) + L('M120 90 L 238 100', '#d9b46a', 2.6) + P('M246 101 L 232 94 L 233 106 Z', '#b8c2d4') +
    P('M122 90 l -12 -8 l 4 9 Z', '#e04a3a') + P('M122 91 l -12 7 l 4 -8 Z', '#e04a3a') +
    /* bras qui tire la corde (proche) */
    P('M104 102 L 110 116 L 76 108 L 72 94 Z', t) + P('M70 92 L 78 106 L 124 96 L 120 82 Z', ts) + P('M96 86 L 122 82 L 124 96 L 98 102 Z', '#7a4e2c') +
    '<circle cx="127" cy="89" r="8" fill="' + pe[1] + '" stroke="' + O + '" stroke-width="3"/>' +
    '<circle cx="207" cy="105" r="8.5" fill="' + pe[1] + '" stroke="' + O + '" stroke-width="3"/>' +
    '</svg>';
}

/* ============ l'Alchimiste : il va lancer une fiole ============ */
function alchimiste(){
  var pe = ['#eec899', '#c7935c', '#a77441', '#e4685a'], ch = ['#6b7096', '#272840', '#0e0e1a'], ir = ['#3a1a02', '#c47a10', '#ffd98a'];
  var c = '#f4eee2', cs = '#cfc3aa', g = 'fl' + (++uid);
  var boucles = [[100, 40, 13], [110, 26, 14], [126, 20, 14], [142, 24, 13], [152, 36, 11], [96, 56, 11], [104, 64, 9]].map(function(b){ return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + ch[1] + '" stroke="' + O + '" stroke-width="3"/>'; }).join('') +
    [[106, 34], [122, 24], [140, 28]].map(function(b){ return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="4" fill="' + ch[0] + '" opacity=".7"/>'; }).join('');
  return '<svg viewBox="0 0 250 300" style="width:100%;height:100%;overflow:visible;display:block"><defs>' +
    '<radialGradient id="' + g + '"><stop offset="0" stop-color="#fff6b0"/><stop offset=".5" stop-color="#ff9a2a" stop-opacity=".7"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient></defs>' +
    /* pans de la blouse qui volent */
    P('M98 146 L 138 148 L 150 224 Q 110 238 54 222 Q 74 186 98 146 Z', c) + P('M98 146 L 112 148 L 92 230 Q 70 228 54 222 Q 74 186 98 146 Z', cs) +
    /* jambes : arrière pliée, avant tendue */
    P('M104 180 L 124 184 L 92 238 L 74 230 Z', '#4a3a4e') + P('M74 226 L 94 234 L 82 280 L 64 278 Z', '#4a3a4e') + botte('M60 270 L 84 274 L 86 290 L 44 290 Q 42 282 52 280 Z') +
    P('M130 182 L 150 180 L 176 236 L 158 242 Z', '#4a3a4e') + P('M158 234 L 176 230 L 190 278 L 172 282 Z', '#4a3a4e') + botte('M168 272 L 192 270 L 196 284 L 214 288 Q 216 293 206 293 L 166 292 Z') +
    /* bras avant (loin), main ouverte vers les monstres */
    P('M142 100 L 150 114 L 196 128 L 198 114 Z', cs) +
    P('M196 112 L 212 104 L 216 110 L 206 118 L 220 116 L 220 123 L 206 126 L 214 130 L 210 135 L 198 130 Z', pe[1]) +
    /* corps, penché en arrière pour prendre l'élan */
    P('M100 102 Q 122 90 146 100 L 146 154 L 98 156 Q 92 128 100 102 Z', c) + P('M100 102 Q 108 98 114 100 L 110 156 L 98 156 Q 92 128 100 102 Z', cs) +
    L('M104 100 L 144 160', '#7a4e2c', 5) + P('M132 148 L 156 146 L 158 172 L 134 174 Z', '#8a5a32') + L('M136 156 L 154 155', '#5e3a1e', 2) +
    P('M106 92 Q 124 102 144 92 L 146 102 Q 124 112 104 102 Z', '#7a4ab0') + P('M106 98 Q 90 104 82 120 Q 94 112 106 108 Z', '#7a4ab0') +
    /* la tête */
    boucles + visage(124, 60, pe, ir, {sourire:true}) +
    [[108, 34, 10], [122, 28, 11], [138, 30, 10], [150, 40, 8]].map(function(b){ return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + ch[1] + '" stroke="' + O + '" stroke-width="3"/>'; }).join('') +
    /* bras proche, levé en arrière : la fiole de feu */
    P('M104 106 L 112 120 L 82 82 L 70 90 Z', c) + P('M70 90 L 82 82 L 94 44 L 80 40 Z', cs) +
    '<circle cx="88" cy="22" r="34" fill="url(#' + g + ')"/>' +
    P('M82 6 L 94 6 L 94 14 C 106 18 108 34 98 40 C 92 44 84 44 78 40 C 68 34 70 18 82 14 Z', '#ff7a2a') + P('M80 2 h16 v6 h-16 Z', '#8a5a32') +
    L('M84 22 q 4 -4 8 0', '#fff6b0', 2.4) +
    '<circle cx="88" cy="44" r="8" fill="' + pe[1] + '" stroke="' + O + '" stroke-width="3"/>' +
    '</svg>';
}

/* ============ le Sage : le livre ouvert, une rune qui brille ============ */
function sage(){
  var pe = ['#d29d6f', '#a06840', '#80502d', '#d65a50'], ch = ['#6b7096', '#272840', '#0e0e1a'], ir = ['#3a1a02', '#c47a10', '#ffd98a'];
  var r = '#c9b48e', rs = '#9a8460', g = 'ru' + (++uid);
  function tresse(x0, y0, dx){ var s = ''; for(var k = 0; k < 7; k++){ var x = x0 + dx * k, y = y0 + k * 15; s += '<ellipse cx="' + x + '" cy="' + y + '" rx="7" ry="9" fill="' + ch[1] + '" stroke="' + O + '" stroke-width="2.6"/>'; } return s + '<circle cx="' + (x0 + dx * 7) + '" cy="' + (y0 + 104) + '" r="4" fill="#3f6fd0" stroke="' + O + '" stroke-width="2"/>'; }
  return '<svg viewBox="0 0 250 300" style="width:100%;height:100%;overflow:visible;display:block"><defs>' +
    '<radialGradient id="' + g + '"><stop offset="0" stop-color="#e8fdff"/><stop offset=".4" stop-color="#8ff3ff" stop-opacity=".75"/><stop offset="1" stop-color="#3fd0ff" stop-opacity="0"/></radialGradient></defs>' +
    tresse(96, 66, -6) +
    /* la robe longue, qui s'évase */
    P('M98 98 Q 122 88 148 98 L 156 196 L 182 284 Q 124 298 62 284 L 92 196 Z', r) + P('M98 98 Q 106 96 112 98 L 104 200 L 84 288 Q 70 287 62 284 L 92 196 Z', rs) +
    L('M126 160 L 120 286 M146 176 L 158 284', rs, 2.5) +
    P('M86 284 l 26 2 l -2 8 l -28 -2 Z', '#5e3a1e') + P('M140 286 l 28 -2 l 2 8 l -30 1 Z', '#5e3a1e') +
    L('M96 150 Q 124 158 152 148', O, 9) + L('M96 150 Q 124 158 152 148', '#3f6fd0', 5) + P('M100 152 Q 86 172 78 196 Q 92 180 106 160 Z', '#3f6fd0') +
    /* bras tendu (loin) : la rune */
    P('M144 104 L 150 118 L 200 98 L 194 86 Z', rs) + '<circle cx="202" cy="92" r="8" fill="' + pe[1] + '" stroke="' + O + '" stroke-width="3"/>' +
    '<circle cx="226" cy="86" r="40" fill="url(#' + g + ')"/>' +
    '<circle cx="226" cy="86" r="21" fill="none" stroke="#bff8ff" stroke-width="3"/><circle cx="226" cy="86" r="14" fill="none" stroke="#8ff3ff" stroke-width="2" stroke-dasharray="4 4"/>' +
    L('M226 72 L 226 100 M216 78 L 236 94 M236 78 L 216 94', '#e8fdff', 2.4) +
    /* la tête */
    tresse(100, 70, -3) + visage(122, 56, pe, ir, {lunettes:true}) +
    P('M94 54 C 90 26 112 14 132 16 C 152 18 160 32 156 50 C 150 40 140 36 128 38 C 116 38 104 44 100 56 Z', ch[1]) + L('M108 22 C 122 18 138 20 148 28', ch[0], 3) +
    L('M98 30 C 112 22 140 22 154 32', '#3f6fd0', 3.5) +
    /* bras proche : le livre ouvert, qui luit */
    P('M102 106 L 110 120 L 138 150 L 146 138 Z', r) +
    P('M126 132 L 150 126 L 176 132 L 176 160 L 150 154 L 126 160 Z', '#6a3fa0') +
    P('M130 134 L 150 129 L 150 152 L 130 157 Z', '#f6ecd2') + P('M150 129 L 172 134 L 172 157 L 150 152 Z', '#efe2c4') +
    L('M134 140 h 12 M134 146 h 10 M154 140 h 12 M154 146 h 10', '#3fb8e0', 1.6) +
    '<circle cx="144" cy="152" r="8" fill="' + pe[1] + '" stroke="' + O + '" stroke-width="3"/>' +
    '</svg>';
}

/* ============ les monstres ============ */
function rat(sombre){
  var i = 'rt' + (++uid);
  return '<svg viewBox="0 0 200 124" style="width:100%;height:100%;display:block;overflow:visible">' +
    '<defs><linearGradient id="' + i + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (sombre ? '#5d4f5e' : '#8c7a86') + '"/><stop offset="1" stop-color="' + (sombre ? '#2e2530' : '#4d3e4b') + '"/></linearGradient>' +
    '<filter id="' + i + 'g" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
    L('M150 86 C 186 82 198 56 184 38 C 176 29 165 36 171 44', O, 10) + L('M150 86 C 186 82 198 56 184 38 C 176 29 165 36 171 44', '#d68d9c', 5) +
    '<ellipse cx="78" cy="106" rx="11" ry="7" fill="#3a2f3a" stroke="' + O + '" stroke-width="3"/><ellipse cx="136" cy="106" rx="12" ry="7" fill="#3a2f3a" stroke="' + O + '" stroke-width="3"/>' +
    P('M52 78 C 52 44 86 30 116 36 C 150 42 166 62 162 84 C 158 104 128 108 100 106 C 72 104 52 100 52 78 Z', 'url(#' + i + ')') +
    L('M70 42 l6 -12 l5 10 l6 -13 l5 11 l7 -12 l4 12 l7 -10 l3 11', O, 3) +
    P('M66 58 C 44 50 18 58 4 72 C 16 86 42 92 66 88 Z', 'url(#' + i + ')') +
    '<ellipse cx="66" cy="48" rx="13" ry="15" fill="#c98896" stroke="' + O + '" stroke-width="3.5"/><ellipse cx="66" cy="50" rx="6" ry="8" fill="#9a5f6c"/>' +
    '<circle cx="36" cy="66" r="10" fill="#ff2a3a" filter="url(#' + i + 'g)"/><circle cx="36" cy="66" r="5.5" fill="#ff4a4a" stroke="' + O + '" stroke-width="2"/><circle cx="34.5" cy="64.5" r="1.8" fill="#fff"/>' +
    L('M24 60 L 46 64', O, 3) +
    '<circle cx="5" cy="72" r="4.5" fill="#f07a8a" stroke="' + O + '" stroke-width="2.5"/>' +
    P('M14 82 l3 10 l4 -9 Z M22 84 l3 9 l3 -9 Z', '#fff6e0') +
    L('M14 68 l-14 -6 M14 72 l-15 1 M16 76 l-13 7', '#d8d0d8', 1.4) + '</svg>';
}
function araignee(){
  var i = 'ar' + (++uid);
  var pattes = [[-1, 0], [1, 0]].map(function(sg){ var s = sg[0]; return [[-14, -10], [-8, 2], [-2, 12], [4, 20]].map(function(p, k){
    var bx = 100 + s * 22, by = 110 + p[0] * 0.5 + k * 8, kx = 100 + s * (58 + k * 6), ky = by - 34 + k * 10, fx = 100 + s * (76 + k * 4), fy = by + 30 + k * 10;
    return L('M' + bx + ' ' + by + ' Q ' + kx + ' ' + ky + ' ' + fx + ' ' + fy, O, 8) + L('M' + bx + ' ' + by + ' Q ' + kx + ' ' + ky + ' ' + fx + ' ' + fy, '#3a2448', 4); }).join(''); }).join('');
  return '<svg viewBox="0 0 200 200" style="width:100%;height:100%;display:block;overflow:visible"><defs><filter id="' + i + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2.5"/></filter></defs>' +
    L('M100 -400 L 100 84', '#d8d0e8', 1.4, ' opacity=".7"') + pattes +
    P('M100 70 C 128 70 138 96 132 118 C 126 140 74 140 68 118 C 62 96 72 70 100 70 Z', '#3a2448') +
    P('M100 84 l 8 12 l -8 12 l -8 -12 Z', '#ff7a2a') +
    P('M100 120 C 116 120 122 132 116 142 C 110 150 90 150 84 142 C 78 132 84 120 100 120 Z', '#2c1a38') +
    [[92, 132], [108, 132], [96, 140], [104, 140]].map(function(e){ return '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="4.5" fill="#ff2a3a" filter="url(#' + i + ')"/><circle cx="' + e[0] + '" cy="' + e[1] + '" r="2.4" fill="#ff5a5a"/>'; }).join('') +
    P('M94 148 l -2 10 l 6 -6 Z M106 148 l 2 10 l -6 -6 Z', '#e8e0f0') + '</svg>';
}

/* ============ le décor : la crypte sous le clocher ============ */
function decor(W, H, sol){
  var s = '<svg class="mq-abs" style="inset:0" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<linearGradient id="d-mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1528"/><stop offset="1" stop-color="#2e2540"/></linearGradient>' +
    '<pattern id="d-pierre" width="64" height="34" patternUnits="userSpaceOnUse"><path d="M0 0 h64 M0 17 h64 M0 0 v17 M32 0 v17 M16 17 v17 M48 17 v17" stroke="#120e1c" stroke-width="3" fill="none"/><path d="M3 3 h20 M36 21 h9" stroke="#463a5a" stroke-width="2" opacity=".6"/></pattern>' +
    '<linearGradient id="d-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3e3350"/><stop offset="1" stop-color="#140f1e"/></linearGradient>' +
    '<radialGradient id="d-feu" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#ffc070" stop-opacity=".75"/><stop offset=".4" stop-color="#ff8a30" stop-opacity=".22"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="d-lum" cx="640" cy="140" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb860" stop-opacity=".5"/><stop offset=".45" stop-color="#ff8a30" stop-opacity=".12"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="d-trou" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0c0814"/></radialGradient>' +
    '<linearGradient id="d-brume" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a90c0" stop-opacity="0"/><stop offset="1" stop-color="#8a90c0" stop-opacity=".22"/></linearGradient>' +
    '<filter id="d-flou"><feGaussianBlur stdDeviation="3"/></filter><filter id="d-flou2"><feGaussianBlur stdDeviation="8"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#d-mur)"/><rect width="' + W + '" height="' + sol + '" fill="url(#d-pierre)"/>';
  /* les grandes arches du fond, et ce qu'on voit derrière */
  [[150, 120], [470, 150], [820, 130]].forEach(function(a){
    var x = a[0], w = a[1];
    s += '<path d="M' + (x - w / 2) + ' ' + sol + ' V 150 C ' + (x - w / 2) + ' 60 ' + (x + w / 2) + ' 60 ' + (x + w / 2) + ' 150 V ' + sol + ' Z" fill="url(#d-trou)"/>' +
      '<path d="M' + (x - w / 2) + ' ' + sol + ' V 150 C ' + (x - w / 2) + ' 60 ' + (x + w / 2) + ' 60 ' + (x + w / 2) + ' 150 V ' + sol + '" fill="none" stroke="#4a3e60" stroke-width="10"/>' +
      '<path d="M' + (x - w / 2) + ' ' + sol + ' V 150 C ' + (x - w / 2) + ' 60 ' + (x + w / 2) + ' 60 ' + (x + w / 2) + ' 150 V ' + sol + '" fill="none" stroke="#120e1c" stroke-width="3"/>';
  });
  /* l'escalier qui s'enfonce, dans l'arche du milieu */
  for(var k = 0; k < 6; k++) s += '<rect x="' + (420 + k * 4) + '" y="' + (sol - 18 - k * 14) + '" width="' + (100 - k * 8) + '" height="8" fill="#241c34" opacity="' + (0.9 - k * 0.13) + '"/>';
  /* deux piliers gravés de runes (la ville d'avant) */
  [[300, 46], [640, 46]].forEach(function(p){
    var x = p[0], w = p[1];
    s += '<rect x="' + (x - w / 2) + '" y="0" width="' + w + '" height="' + sol + '" fill="#2c2440" stroke="' + O + '" stroke-width="3"/>' +
      '<rect x="' + (x - w / 2) + '" y="0" width="12" height="' + sol + '" fill="#211a32"/>' +
      '<rect x="' + (x - w / 2 - 8) + '" y="' + (sol - 26) + '" width="' + (w + 16) + '" height="26" fill="#3a3050" stroke="' + O + '" stroke-width="3"/>' +
      '<rect x="' + (x - w / 2 - 8) + '" y="40" width="' + (w + 16) + '" height="18" fill="#3a3050" stroke="' + O + '" stroke-width="3"/>' +
      (x < 400 ? [150, 200] : [100, 150, 200]).map(function(y){ return '<path d="M' + (x - 8) + ' ' + y + ' l 8 -12 l 8 12 M' + x + ' ' + (y - 12) + ' v 22 M' + (x - 8) + ' ' + (y + 6) + ' h 16" stroke="#6fe8ff" stroke-width="2.2" fill="none" opacity=".55"/>'; }).join('') +
      '<rect x="' + (x - 14) + '" y="86" width="28" height="130" fill="#6fe8ff" opacity=".07" filter="url(#d-flou2)"/>';
  });
  /* la torche murale, sur le pilier de gauche */
  s += '<circle cx="470" cy="150" r="1" fill="none"/>' +
    '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#d-lum)"/>' +
    '<g transform="translate(276 46)"><path d="M352 118 h 24 l -4 10 h -16 Z" fill="#5a4a40" stroke="' + O + '" stroke-width="3"/><rect x="360" y="96" width="8" height="24" fill="#7a4e2c" stroke="' + O + '" stroke-width="2.5"/>' +
    '<circle cx="364" cy="84" r="34" fill="#ffb040" opacity=".35" filter="url(#d-flou2)"/>' +
    '<path d="M364 62 C 372 74 378 80 375 90 C 373 97 368 99 364 99 C 359 99 354 97 352 90 C 350 82 358 76 360 68 C 362 74 365 76 364 62 Z" fill="#ffc040" stroke="' + O + '" stroke-width="2.5"/><path d="M364 80 C 368 85 368 91 365 95 C 361 95 360 91 361 86 Z" fill="#fff6c8"/></g>';
  /* des racines qui percent la voûte (le Vieux Chêne n'est pas loin), des chaînes, des toiles */
  s += '<path d="M60 0 C 70 30 54 50 66 80 C 72 96 64 110 70 124" stroke="#4a3424" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M66 60 C 80 70 82 82 92 88" stroke="#4a3424" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M600 0 C 594 24 606 40 598 66" stroke="#4a3424" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M780 0 C 790 20 782 34 792 52 C 798 62 794 74 800 82" stroke="#4a3424" stroke-width="5" fill="none" stroke-linecap="round"/>';
  for(var c = 0; c < 9; c++) s += '<ellipse cx="' + (430 + (c % 2) * 2) + '" cy="' + (10 + c * 12) + '" rx="4" ry="7" fill="none" stroke="#5a5470" stroke-width="3"/>';
  for(var c2 = 0; c2 < 6; c2++) s += '<ellipse cx="' + (918 + (c2 % 2) * 2) + '" cy="' + (8 + c2 * 12) + '" rx="4" ry="7" fill="none" stroke="#4a4460" stroke-width="3"/>';
  s += '<path d="M' + W + ' 0 L ' + (W - 90) + ' 0 Q ' + (W - 50) + ' 30 ' + W + ' 70 Z" fill="none" stroke="#bfb8d8" stroke-width="1.2" opacity=".35"/>' +
    '<path d="M' + (W - 70) + ' 0 Q ' + (W - 40) + ' 22 ' + W + ' 40 M' + (W - 40) + ' 0 Q ' + (W - 22) + ' 14 ' + W + ' 18 M' + (W - 80) + ' 8 L ' + (W - 6) + ' 60" stroke="#bfb8d8" stroke-width="1" fill="none" opacity=".3"/>' +
    '<path d="M0 0 L 80 0 Q 40 28 0 64 Z" fill="none" stroke="#bfb8d8" stroke-width="1.2" opacity=".3"/>';
  /* le sol : dalles, flaque, gravats */
  s += '<path d="M0 ' + sol + ' H ' + W + ' V ' + H + ' H 0 Z" fill="url(#d-sol)"/>' +
    '<path d="M0 ' + (sol + 26) + ' H ' + W + ' M0 ' + (sol + 58) + ' H ' + W + ' M90 ' + sol + ' L 50 ' + H + ' M280 ' + sol + ' L 262 ' + H + ' M480 ' + sol + ' L 486 ' + H + ' M680 ' + sol + ' L 708 ' + H + ' M860 ' + sol + ' L 910 ' + H + '" stroke="#120e1c" stroke-width="3"/>' +
    '<ellipse cx="520" cy="' + (sol + 40) + '" rx="70" ry="10" fill="#4a5a8a" opacity=".35"/><ellipse cx="510" cy="' + (sol + 38) + '" rx="30" ry="3" fill="#ffd090" opacity=".35"/>' +
    [[240, sol + 8, 9], [258, sol + 12, 6], [900, sol + 14, 10], [620, sol + 50, 7], [40, sol + 44, 8]].map(function(p){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + (p[2] * 0.6) + '" fill="#4a3e5a" stroke="' + O + '" stroke-width="2.5"/>'; }).join('') +
    '<path d="M800 ' + (sol - 30) + ' C 790 ' + (sol - 10) + ' 796 ' + sol + ' 820 ' + sol + ' C 846 ' + sol + ' 850 ' + (sol - 12) + ' 840 ' + (sol - 30) + ' Z" fill="#6a4a3a" stroke="' + O + '" stroke-width="3"/><path d="M806 ' + (sol - 30) + ' h 30" stroke="' + O + '" stroke-width="5"/><path d="M826 ' + (sol - 24) + ' l -6 14 l 8 -4" stroke="' + O + '" stroke-width="2" fill="none"/>' +
    '<rect x="0" y="' + (sol - 60) + '" width="' + W + '" height="90" fill="url(#d-brume)"/>' +
    '</svg>';
  return s;
}
function vignette(W, H){
  return '<svg class="mq-abs" style="inset:0;pointer-events:none" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<radialGradient id="v-v" cx="' + (W * 0.45) + '" cy="' + (H * 0.52) + '" r="' + (W * 0.62) + '" gradientUnits="userSpaceOnUse"><stop offset=".42" stop-color="#05030a" stop-opacity="0"/><stop offset=".78" stop-color="#05030a" stop-opacity=".7"/><stop offset="1" stop-color="#05030a" stop-opacity=".95"/></radialGradient>' +
    '<linearGradient id="v-h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05030a" stop-opacity=".85"/><stop offset=".22" stop-color="#05030a" stop-opacity="0"/></linearGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#v-v)"/><rect width="' + W + '" height="' + H + '" fill="url(#v-h)"/></svg>';
}

/* ============ les potions (proposition pour le donjon) ============ */
var POTIONS = [
  {id:'feu', nom:'Fiole de feu', c:'#ff6a2a', n:2, lancer:true, d:'brûle un monstre'},
  {id:'fumi', nom:'Fumigène', c:'#9aa3c8', n:1, lancer:true, d:'les monstres ratent'},
  {id:'acide', nom:'Acide', c:'#b8e04a', n:1, lancer:true, d:'ronge la rouille'},
  {id:'lum', nom:'Lumière', c:'#fff3a0', n:2, d:'ravive la torche'},
  {id:'baume', nom:'Baume', c:'#5fd08a', n:2, d:'rend un cœur'},
  {id:'coeur', nom:'Cœur vaillant', c:'#ff5a7a', n:0, d:'relève un ami'},
  {id:'vite', nom:'Rapidité', c:'#8ff3ff', n:1, d:'rejoue aussitôt'},
  {id:'invi', nom:'Invisibilité', c:'#c9d3ff', n:1, d:'plus visé un tour'}
];
function fiole(c){
  return '<svg viewBox="0 0 40 48" style="width:100%;height:100%;display:block;overflow:visible">' +
    '<circle cx="20" cy="30" r="17" fill="' + c + '" opacity=".25"/>' +
    P('M15 6 h10 v8 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z', c) + P('M13 2 h14 v6 h-14 Z', '#8a5a32') +
    P('M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z', 'rgba(0,0,0,.18)', ' stroke="none"') +
    L('M14 22 q 2 -4 5 -4', '#fff', 2.4, ' opacity=".8"') + '</svg>';
}

/* ============ la bande du bas ============ */
var GESTES = {
  pisteur:[['🏹', 'Flèche', 'un monstre, où il soit'], ['🎯', 'Tir visé', 'plus fort, au premier rang'], ['🔄', 'Changer de place', 'avec un équipier']],
  alchimiste:[['🧪', 'Lancer une fiole', 'une potion du sac'], ['🌿', 'Herbes', 'soigne un peu, sans fiole'], ['🔄', 'Changer de place', 'avec un équipier']],
  sage:[['✨', 'Rune de lumière', 'éblouit les monstres'], ['🛡️', 'Bouclier de runes', 'protège un équipier'], ['🔄', 'Changer de place', 'avec un équipier']]
};
var NOMS = {pisteur:'Pisteur', alchimiste:'Alchimiste', sage:'Sage'};
var PLACE = {pisteur:'devant', alchimiste:'au milieu', sage:'derrière'};
function bande(role, W, y, H, portrait){
  var s = '<div class="mq-abs mq-bande" style="left:0;top:' + y + 'px;width:' + W + 'px;height:' + (H - y) + 'px">';
  s += '<div class="mq-abs mq-portrait" style="left:14px;top:14px;width:122px;height:122px">' + portrait + '</div>' +
    '<div class="mq-abs" style="left:146px;top:16px;width:126px"><div class="mq-titre" style="font-size:23px;line-height:1">' + NOMS[role] + '</div>' +
    '<div style="font-size:13px;opacity:.75;margin-top:6px">Niveau 2</div>' +
    '<div style="margin-top:8px">' + coeurs(role === 'sage' ? 2 : 3, 3) + '</div>' +
    '<div style="font-size:12.5px;opacity:.75;margin-top:10px">Place : ' + PLACE[role] + '</div></div>';
  s += '<div class="mq-abs mq-sep" style="left:276px"></div>' +
    '<div class="mq-abs mq-lbl" style="left:290px;top:10px">Ses gestes</div>' +
    GESTES[role].map(function(g, k){
      return '<div class="mq-abs mq-geste' + (k === 0 ? ' choisi' : '') + '" style="left:' + (290 + k * 94) + 'px;top:32px"><div class="mq-g-ic">' + g[0] + '</div><b>' + g[1] + '</b><small>' + g[2] + '</small></div>';
    }).join('');
  var x0 = 578;
  s += '<div class="mq-abs mq-sep" style="left:' + (x0 - 12) + 'px"></div>' +
    '<div class="mq-abs mq-lbl" style="left:' + x0 + 'px;top:10px">Le sac de l\'Alchimiste' + (role === 'alchimiste' ? '' : ' · 🔒 lui seul sait lancer') + '</div>' +
    POTIONS.map(function(p, k){
      var off = (role !== 'alchimiste' && p.lancer) || !p.n;
      return '<div class="mq-abs mq-pot' + (off ? ' off' : '') + '" style="left:' + (x0 + (k % 4) * 92) + 'px;top:' + (32 + Math.floor(k / 4) * 66) + 'px">' +
        '<div class="mq-pot-f">' + fiole(p.c) + '</div><div class="mq-pot-t"><b>' + p.nom + '</b><small>' + p.d + '</small></div>' +
        '<span class="mq-pot-n">' + (off && p.n && role !== 'alchimiste' ? '🔒' : '×' + p.n) + '</span></div>';
    }).join('');
  return s + '</div>';
}
function coeurs(n, t){ var s = ''; for(var k = 0; k < t; k++) s += '<span class="mq-c' + (k < n ? '' : ' vide') + '">❤</span>'; return s; }
function barre(n, t, w){ var s = ''; for(var k = 0; k < t; k++) s += '<i class="' + (k < n ? 'on' : '') + '"></i>'; return '<div class="mq-barre" style="width:' + w + 'px">' + s + '</div>'; }

var CSS = '<style>' +
  '.mq{position:relative;overflow:hidden;font-family:var(--f-texte);color:#fff4e0;background:#0b0810}.mq *{box-sizing:border-box}.mq-abs{position:absolute}' +
  '.mq-titre{font-family:var(--f-titre);color:#ffe3a3;text-shadow:0 2px 0 ' + O + '}' +
  '.mq-bande{background:linear-gradient(#0d0a14,#07050b);border-top:3px solid #5a4630;box-shadow:0 -6px 18px rgba(0,0,0,.8), inset 0 2px 0 #2a2030}' +
  '.mq-portrait{border-radius:14px;border:3px solid #8a6a3a;background:radial-gradient(circle at 50% 35%,#4a3a5a,#140f1e);overflow:hidden;box-shadow:0 0 0 3px ' + O + ', 0 0 18px rgba(255,180,80,.25)}' +
  '.mq-sep{top:14px;bottom:14px;width:2px;background:linear-gradient(transparent,#5a4630,transparent)}' +
  '.mq-lbl{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#bfa77a}' +
  '.mq-geste{width:86px;height:110px;border-radius:12px;border:3px solid #4a3a2a;background:linear-gradient(#2a2036,#18121f);display:flex;flex-direction:column;align-items:center;padding:6px 4px;text-align:center}' +
  '.mq-geste.choisi{border-color:#ffd36a;box-shadow:0 0 0 2px ' + O + ', 0 0 16px rgba(255,200,90,.6);background:linear-gradient(#3a2e20,#1e1610)}' +
  '.mq-g-ic{font-size:32px;line-height:1.1}.mq-geste b{font-size:12.5px;line-height:1.1;margin-top:4px}.mq-geste small{font-size:10.5px;line-height:1.15;opacity:.7;margin-top:3px}' +
  '.mq-pot{width:88px;height:60px;border-radius:10px;border:2px solid #3a2e40;background:#16101e;display:flex;align-items:center;gap:3px;padding:3px 3px 3px 3px}' +
  '.mq-pot-f{width:22px;height:32px;flex:none;margin-top:-8px}.mq-pot-t{display:flex;flex-direction:column;min-width:0}.mq-pot-t b{font-size:11px;line-height:1.05}.mq-pot-t small{font-size:9.5px;line-height:1.1;opacity:.7;margin-top:2px}' +
  '.mq-pot-n{position:absolute;left:4px;bottom:2px;text-shadow:0 1px 0 #000,0 0 3px #000;font-size:10px;font-weight:800;color:#ffd36a}' +
  '.mq-pot.off{opacity:.33;filter:grayscale(.8)}' +
  '.mq-c{color:#ff5a6e;font-size:18px;text-shadow:0 1px 0 ' + O + '}.mq-c.vide{color:#3a2a36}' +
  '.mq-barre{display:flex;gap:2px;height:7px}.mq-barre i{flex:1;background:#3a1a22;border:1.5px solid ' + O + '}.mq-barre i.on{background:#d8303e}' +
  '.mq-anneau{position:absolute;height:22px;border-radius:50%;border:3px solid #ffd36a;box-shadow:0 0 16px #ffb040, inset 0 0 10px #ffb040}' +
  '.mq-fleche{position:absolute;width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:15px solid #ffd36a;filter:drop-shadow(0 0 6px #ffb040)}' +
  '.mq-torche{display:flex;align-items:center;gap:6px;font-size:20px}.mq-torche i{flex:1;height:13px;border-radius:99px;background:#2a2036;border:3px solid ' + O + ';overflow:hidden;box-shadow:0 0 0 2px #5a4a2a}.mq-torche b{display:block;height:100%;background:linear-gradient(90deg,#ff6a1a,#ffc040,#fff2a0)}' +
  '.mq-bulle{display:flex;align-items:center;gap:10px;padding:6px 8px 6px 14px;border-radius:14px;background:rgba(243,231,203,.94);color:#35281b;border:3px solid ' + O + ';box-shadow:0 4px 0 rgba(0,0,0,.4);font-weight:700;font-size:14px;line-height:1.25}' +
  '.mq-lire{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(36,24,46,.12);font-size:15px;flex:none}' +
  '.mq-dim{filter:brightness(.72) saturate(.85)}' +
  '</style>';

var TEXTES = {
  pisteur:'Les rats ont senti la torche… Pisteur, ta flèche est prête.',
  alchimiste:'Deux rats, une araignée… et un sac qui cliquette. À toi, Alchimiste !',
  sage:'L\'araignée descend sur son fil. Sage, tes runes brillent déjà.'
};
function scene(actif){
  var W = 960, H = 540, Y = 372, sol = 340;
  var heros = {sage:[40, sage()], alchimiste:[190, alchimiste()], pisteur:[340, pisteur()]};
  var s = CSS + '<div class="mq" style="width:' + W + 'px;height:' + H + 'px">' + decor(W, Y, sol);
  ['sage', 'alchimiste', 'pisteur'].forEach(function(r){
    var x = heros[r][0];
    s += '<div class="mq-abs' + (r === actif ? '' : ' mq-dim') + '" style="left:' + x + 'px;top:' + (sol - 236) + 'px;width:200px;height:240px">' + heros[r][1] + '</div>';
  });
  s += '<div class="mq-abs" style="left:540px;top:' + (sol - 112) + 'px;width:180px;height:112px">' + rat(false) + '</div>' +
    '<div class="mq-abs" style="left:720px;top:' + (sol - 100) + 'px;width:162px;height:100px">' + rat(true) + '</div>' +
    '<div class="mq-abs" style="left:500px;top:84px;width:120px;height:120px">' + araignee() + '</div>';
  s += vignette(W, Y);
  var cx = {sage:40, alchimiste:190, pisteur:340}[actif];
  s += '<div class="mq-anneau" style="left:' + (cx + 30) + 'px;top:' + (sol - 10) + 'px;width:140px"></div>' +
    '<div class="mq-fleche" style="left:' + (cx + 89) + 'px;top:' + (sol - 254) + 'px"></div>';
  [['sage', 2], ['alchimiste', 3], ['pisteur', 3]].forEach(function(h){
    s += '<div class="mq-abs" style="left:' + (heros[h[0]][0] + 60) + 'px;top:' + (sol + 16) + 'px;width:80px;text-align:center;line-height:1">' + coeurs(h[1], 3).replace(/font-size:18px/g, '') + '</div>';
  });
  s += '<div class="mq-abs" style="left:580px;top:' + (sol + 18) + 'px">' + barre(3, 3, 90) + '</div><div class="mq-abs" style="left:760px;top:' + (sol + 18) + 'px">' + barre(2, 3, 80) + '</div>' +
    '<div class="mq-abs" style="left:525px;top:212px">' + barre(2, 2, 70) + '</div>';
  s += '<div class="mq-abs" style="left:16px;top:12px" ><span class="mq-titre" style="font-size:20px">La crypte</span> <span style="font-size:13px;opacity:.7">· salle 2 sur 3</span></div>' +
    '<div class="mq-abs" style="left:380px;top:12px;width:210px"><div class="mq-torche"><span>🔥</span><i><b style="width:62%"></b></i></div></div>' +
    '<div class="mq-abs" style="right:16px;top:12px;font-size:13px;opacity:.8">🗺️ Le plan : chez le Sage</div>' +
    '<div class="mq-abs" style="left:600px;right:16px;top:42px"><div class="mq-bulle">' + TEXTES[actif] + '<span class="mq-lire">🔊</span></div></div>';
  var portrait = heros[actif][1].replace('viewBox="0 0 250 300"', 'viewBox="74 6 120 120"');
  s += bande(actif, W, Y, H, portrait);
  return s + '</div>';
}
window.COMBAT = {scene:scene};
})();
