/* Donjon, maquette 3 (Romain, 8 novembre, 11 h 58) : chacun enfile une tenue de combat avant la crypte (capuche :
   seules les couleurs de peau, de cheveux et d'yeux, et fille / garçon, changent d'un joueur à l'autre) ;
   héros et décor plus détaillés (dégradés, grain) ; plus de torche ; gestes « ? » à découvrir ; 2 objets par héros. */
(function(){
var O = '#24182e';
var uid = 0;
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (x2 || '') + '/>'; }
/* un chemin écrit autour d'un centre (cx, cy) : chaque paire « x y » est décalée */
function T(d, cx, cy){ return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function(m, a, b){ return (cx + +a) + ' ' + (cy + +b); }); }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
var LUNE = '#bfe8ff';   /* la lumière de lune qui tombe de la grille du plafond, et les runes */

/* ---------- un dessin : ses dégradés et son grain ---------- */
function Dessin(){ this.defs = []; }
Dessin.prototype.g = function(c, fort){   /* lumière en haut à droite */
  fort = fort || 1;
  var id = 'g' + (++uid);
  this.defs.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>');
  return 'url(#' + id + ')';
};
Dessin.prototype.halo = function(c0, c1){
  var id = 'h' + (++uid);
  this.defs.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>');
  return 'url(#' + id + ')';
};
Dessin.prototype.flou = function(n){
  var id = 'f' + (++uid);
  this.defs.push('<filter id="' + id + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="' + n + '"/></filter>');
  return 'url(#' + id + ')';
};
Dessin.prototype.svg = function(vb, corps){
  var gr = 'gr' + (++uid);
  return '<svg viewBox="' + vb + '" style="width:100%;height:100%;overflow:visible;display:block"><defs>' + this.defs.join('') +
    '<filter id="' + gr + '" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="g"/>' +
    '<feComposite in="g" in2="SourceAlpha" operator="in" result="m"/>' +
    '<feBlend in="m" in2="SourceGraphic" mode="soft-light"/></filter></defs>' +
    '<g filter="url(#' + gr + ')">' + corps + '</g></svg>';
};

/* ---------- le visage, de trois quarts ---------- */
function yeux(n, f, ir, lun, fille){
  var s = '';
  [[n[0], n[1], 6.2, 7.4, -1], [f[0], f[1], 4.3, 7, 1]].forEach(function(e){
    var x = e[0], y = e[1], rx = e[2], ry = e[3];
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff"/>' +
      '<ellipse cx="' + (x + rx * 0.18) + '" cy="' + (y + 0.8) + '" rx="' + (rx * 0.74) + '" ry="' + (ry * 0.82) + '" fill="' + ir[1] + '"/>' +
      '<ellipse cx="' + (x + rx * 0.18) + '" cy="' + (y + 2.6) + '" rx="' + (rx * 0.5) + '" ry="' + (ry * 0.36) + '" fill="' + ir[2] + '" opacity=".75"/>' +
      '<ellipse cx="' + (x + rx * 0.22) + '" cy="' + (y + 0.2) + '" rx="' + (rx * 0.36) + '" ry="' + (ry * 0.48) + '" fill="' + ir[0] + '"/>' +
      C(x - rx * 0.12, y - ry * 0.32, rx * 0.3, '#fff') + C(x + rx * 0.4, y + ry * 0.35, rx * 0.12, '#fff', ' opacity=".8"') +
      L('M' + (x - rx - 1.5) + ' ' + (y - ry * 0.55) + ' Q ' + x + ' ' + (y - ry - 2.2) + ' ' + (x + rx + 1.5) + ' ' + (y - ry * 0.45), O, 2.8);
    if(fille) s += L('M' + (x + e[4] * (rx + 1)) + ' ' + (y - ry * 0.5) + ' l ' + (e[4] * 4.5) + ' -3.5', O, 2.2);
  });
  if(lun) s += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="9.2" fill="#d8f4ff" fill-opacity=".18" stroke="#3a2a1a" stroke-width="2.2"/><circle cx="' + (f[0] + 0.5) + '" cy="' + f[1] + '" r="7.2" fill="#d8f4ff" fill-opacity=".18" stroke="#3a2a1a" stroke-width="2.2"/>' +
    L('M' + (n[0] + 9) + ' ' + (n[1] - 1) + ' L ' + (f[0] - 7) + ' ' + (f[1] - 1), '#3a2a1a', 2) +
    L('M' + (n[0] - 5) + ' ' + (n[1] - 5) + ' l 4 -2', '#fff', 1.6, ' opacity=".7"');
  return s;
}
function visage(d, cx, cy, lk, opt){
  opt = opt || {};
  var pe = lk.pe, g = 'vz' + (++uid);
  d.defs.push('<linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + pe[2] + '"/><stop offset=".38" stop-color="' + pe[1] + '"/><stop offset="1" stop-color="' + pe[0] + '"/></linearGradient>');
  return P(T('M-8 24 L 6 24 L 8 38 L -10 38 Z', cx, cy), pe[2]) +
    P(T('M-24 -2 C -26 -26 -6 -34 8 -32 C 24 -30 32 -16 30 0 C 30 8 28 14 24 18 C 18 27 10 31 3 31 C -9 31 -21 23 -23 11 Z', cx, cy), 'url(#' + g + ')') +
    '<ellipse cx="' + (cx + 4) + '" cy="' + (cy - 24) + '" rx="30" ry="11" fill="#1a0f26" opacity=".35" filter="' + d.flou(4) + '"/>' +
    '<ellipse cx="' + (cx - 9) + '" cy="' + (cy + 14) + '" rx="6" ry="3.4" fill="' + pe[3] + '" opacity=".45"/>' +
    '<ellipse cx="' + (cx + 22) + '" cy="' + (cy + 13) + '" rx="3.4" ry="2.4" fill="' + pe[3] + '" opacity=".35"/>' +
    yeux([cx - 6, cy + 3], [cx + 17, cy + 2], lk.ir, opt.lunettes, lk.fille) +
    L(T('M-15 -8 L -1 -5', cx, cy), O, 3) + L(T('M13 -5 L 23 -9', cx, cy), O, 3) +
    L(T('M25 6 L 30 12 L 25 13', cx, cy), pe[2], 2.2) + L(T('M27 4 L 29 9', cx, cy), '#fff', 1.4, ' opacity=".5"') +
    (opt.sourire ? P(T('M6 19 Q 15 26 23 18 Q 15 21 6 19 Z', cx, cy), '#fff6ee')
      : L(T('M8 21 Q 14 22 20 19', cx, cy), O, 2.6) + L(T('M11 25 Q 14 26 17 25', cx, cy), pe[2], 1.6));
}
/* la mèche qui dépasse de la capuche */
function meche(d, cx, cy, ch){
  return P(T('M-22 -24 C -14 -12 -2 -16 2 -8 C 6 -18 14 -18 18 -10 C 20 -18 28 -20 32 -14 C 26 -30 -4 -36 -22 -24 Z', cx, cy), d.g(ch[1])) +
    L(T('M-14 -24 C -6 -24 0 -20 2 -14', cx, cy), ch[0], 2, ' opacity=".8"') + L(T('M10 -22 C 14 -20 16 -16 17 -12', cx, cy), ch[0], 1.8, ' opacity=".7"');
}
/* la capuche de la tenue : le fond (avant le visage), le dessus (après) */
function capucheFond(d, cx, cy, col){
  return F(T('M38 -14 C 26 -44 -14 -46 -30 -24 L -22 0 C -12 -30 22 -34 40 -6 Z', cx, cy), sombre(col, .78));
}
function capuche(d, cx, cy, col, bord){
  return P(T('M36 -20 C 24 -38 -10 -40 -22 -24 C -29 -12 -29 10 -21 28 C -17 36 -15 42 -13 48 L -50 52 C -60 18 -58 -24 -40 -46 L -36 -58 L -24 -52 C -4 -62 28 -54 36 -20 Z', cx, cy), d.g(col)) +
    F(T('M-46 46 C -54 16 -52 -20 -36 -40 C -40 -14 -40 18 -30 44 Z', cx, cy), sombre(col, .3), ' opacity=".7"') +
    L(T('M36 -20 C 24 -38 -10 -40 -22 -24 C -29 -12 -29 10 -21 28', cx, cy), bord, 3) +
    L(T('M32 -24 C 20 -35 -8 -36 -19 -23 C -25 -12 -25 8 -18 24', cx, cy), bord, 1.2, ' stroke-dasharray="3 3" opacity=".7"') +
    L(T('M-40 36 C -46 10 -42 -18 -26 -40', cx, cy), sombre(col, .45), 2) + L(T('M-30 30 C -34 10 -32 -8 -24 -22', cx, cy), sombre(col, .35), 1.6) +
    L(T('M30 -34 C 24 -44 10 -50 -6 -50', cx, cy), LUNE, 2, ' opacity=".45"');
}
function col(d, cx, cy, c){
  return P(T('M-46 42 Q -4 60 36 40 L 40 52 Q -4 72 -50 56 Z', cx, cy), d.g(c)) + L(T('M-44 50 Q -4 66 38 48', cx, cy), sombre(c, .35), 1.6);
}
function botte(d, dd, c){ return P(dd, d.g(c)); }
function main(d, x, y, r, c){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + d.g(c) + '" stroke="' + O + '" stroke-width="3"/>' + C(x + r * 0.3, y - r * 0.35, r * 0.28, '#fff', ' opacity=".35"'); }
function couture(dd, c){ return L(dd, c, 1.3, ' stroke-dasharray="3 3" opacity=".75"'); }
function rivets(pts, c){ return pts.map(function(p){ return C(p[0], p[1], 1.8, c || '#e8d08a', ' stroke="' + O + '" stroke-width="1"'); }).join(''); }

/* ============ le Pisteur : il bande son arc ============ */
function pisteur(lk){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var vert = '#3b7f54', capu = '#2d6a46', cuir = '#8e5a36', cuirF = '#5a361f', pant = '#4c3c38', bt = '#74482a';
  var s = '';
  /* la cape, derrière */
  s += P('M104 98 C 82 110 60 144 30 200 C 50 192 70 198 86 210 C 92 178 102 140 118 104 Z', d.g(sombre(capu, .15))) +
    L('M98 112 C 80 142 64 170 48 194', sombre(capu, .55), 2) + L('M108 116 C 96 150 88 178 82 204', sombre(capu, .5), 1.6);
  /* le carquois */
  s += P('M70 64 L 92 56 L 116 138 L 94 146 Z', d.g('#7c4a28')) + L('M80 61 L 103 141', cuirF, 2) +
    L('M73 74 L 95 66 M95 128 L 112 122', '#c9a35a', 3) + couture('M76 70 L 98 140', '#d8aa76') +
    P('M70 52 L 64 42 L 76 46 Z', '#e04a3a') + P('M80 48 L 76 36 L 86 42 Z', '#f3e7cb') + P('M90 46 L 88 34 L 97 42 Z', '#e04a3a') +
    L('M72 60 L 72 50 M82 58 L 81 46 M92 56 L 92 44', '#7a5a3a', 2);
  /* la queue de cheval (fille), qui sort de la capuche */
  if(lk.fille) s += P('M96 36 C 76 26 56 38 44 60 C 36 74 24 84 10 86 C 28 96 50 90 64 76 C 76 64 88 58 100 58 Z', d.g(ch[1])) +
    L('M88 40 C 72 40 60 52 50 68', ch[0], 3, ' opacity=".8"') + L('M84 54 C 70 62 56 76 36 84', ch[2], 2, ' opacity=".6"') +
    P('M64 72 L 72 64 L 78 72 L 70 80 Z', '#2f8050');
  /* jambe arrière, tendue */
  s += P('M104 176 L 124 180 L 88 262 L 70 256 Z', d.g(pant)) + L('M110 186 L 82 252', sombre(pant, .4), 1.6) +
    P('M90 216 L 106 220 L 102 236 L 86 232 Z', d.g(cuir)) + rivets([[92, 222], [100, 226]]) +
    botte(d, 'M70 248 L 92 254 L 88 282 L 92 290 L 48 290 Q 44 283 56 279 L 66 275 Z', bt) +
    P('M67 244 L 95 250 L 92 262 L 64 256 Z', d.g(clair(bt, .18))) + L('M48 290 L 92 290', '#2a1a10', 4) + L('M60 280 l 10 -4 M66 284 l 10 -4', clair(bt, .4), 1.4);
  /* bras de l'arc (loin) */
  s += P('M142 96 L 148 112 L 184 112 L 182 98 Z', d.g(vert)) + P('M176 96 L 204 98 L 204 112 L 176 113 Z', d.g(cuir)) +
    L('M184 97 L 184 112 M194 97 L 194 112', cuirF, 2) + L('M178 97 L 202 99', LUNE, 1.4, ' opacity=".5"');
  /* le corps : tunique verte, gilet de cuir cousu, ceinture, dague */
  s += P('M98 98 Q 122 88 148 96 L 154 150 L 96 152 Q 92 124 98 98 Z', d.g(vert)) +
    P('M101 102 Q 124 94 147 100 L 151 148 L 99 150 Q 95 126 101 102 Z', d.g(cuir)) +
    F('M101 102 Q 106 100 112 100 L 108 150 L 99 150 Q 95 126 101 102 Z', sombre(cuir, .35), ' opacity=".8"') +
    P('M116 99 L 128 124 L 140 97 Z', d.g(vert)) + L('M120 106 L 134 110 M122 113 L 132 116 M134 106 L 121 111', '#efe0b8', 1.5) +
    couture('M105 108 Q 102 128 103 146', '#e0b484') + couture('M144 104 L 147 146', '#e0b484') +
    L('M150 101 L 153 148', LUNE, 2, ' opacity=".55"') +
    P('M96 148 L 152 146 L 170 188 Q 132 198 88 190 Z', d.g(vert)) + F('M96 148 L 112 148 L 106 192 L 88 190 Z', sombre(vert, .35), ' opacity=".8"') +
    L('M130 152 L 134 194', sombre(vert, .5), 2) + couture('M92 186 Q 130 196 166 184', clair(vert, .45)) + L('M154 150 L 170 188', LUNE, 1.8, ' opacity=".45"') +
    L('M106 100 L 150 146', O, 8) + L('M106 100 L 150 146', '#5e3a22', 4.5) + rivets([[114, 109], [126, 121], [138, 133]]) +
    L('M96 146 Q 124 154 154 144', O, 9) + L('M96 146 Q 124 154 154 144', '#5a361f', 5.5) + P('M119 144 L 131 144 L 131 155 L 119 155 Z', '#d9b46a') + L('M122 149 L 129 149', O, 2) +
    P('M98 152 L 114 152 L 114 168 Q 106 172 98 168 Z', d.g('#7a4a28')) + C(106, 157, 2, '#d9b46a', ' stroke="' + O + '" stroke-width="1"') +
    P('M150 152 L 168 182 L 174 179 L 156 149 Z', d.g('#4e2e18')) + P('M144 147 L 150 137 L 155 140 L 149 150 Z', '#3a2a1a') + P('M141 148 L 156 146 L 157 151 L 142 153 Z', '#c9a35a');
  /* jambe avant, pliée (la fente) */
  s += P('M128 172 L 152 178 L 190 214 L 172 234 Z', d.g(pant)) + P('M172 222 L 192 216 L 202 262 L 180 266 Z', d.g(pant)) +
    L('M150 184 L 182 214', sombre(pant, .4), 1.6) + L('M152 178 L 190 214', LUNE, 1.8, ' opacity=".4"') +
    P('M168 210 L 188 204 L 196 222 L 176 228 Z', d.g(cuir)) + rivets([[176, 212], [186, 210], [184, 220]]) +
    botte(d, 'M178 254 L 204 252 L 208 280 L 226 286 Q 230 292 218 292 L 176 292 Z', bt) +
    P('M176 249 L 205 247 L 206 260 L 178 262 Z', d.g(clair(bt, .18))) + L('M176 292 L 220 292', '#2a1a10', 4) +
    L('M190 266 l 10 -2 M190 272 l 10 -2 M190 278 l 10 -2', clair(bt, .45), 1.4) + L('M206 262 L 208 280 L 224 286', LUNE, 1.6, ' opacity=".5"');
  /* l'arc */
  s += L('M196 22 Q 238 104 196 188', O, 11) + L('M196 22 Q 238 104 196 188', '#8a5a2e', 6) + L('M200 30 Q 232 104 200 180', '#d29a5a', 1.6) +
    P('M216 90 L 228 90 L 230 118 L 218 118 Z', d.g('#5a361f')) + L('M217 96 L 229 98 M217 104 L 229 106 M218 112 L 229 113', '#c9a35a', 1.3) +
    P('M192 16 L 200 20 L 198 28 L 192 24 Z', '#d9b46a') + P('M192 194 L 200 190 L 198 182 L 192 186 Z', '#d9b46a');
  /* la tête, la capuche */
  s += capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk) + meche(d, 124, 58, ch) + capuche(d, 124, 58, capu, '#c9a35a') + col(d, 124, 58, capu);
  /* la corde, la flèche */
  s += L('M196 22 L 128 90 L 196 188', '#f3e7cb', 1.8) +
    L('M120 90 L 238 100', O, 6) + L('M120 90 L 238 100', '#d9b46a', 2.6) + P('M246 101 L 232 94 L 233 106 Z', '#c8d2e4') + L('M236 97 L 243 100', '#fff', 1.2) +
    P('M122 90 L 110 82 L 114 91 Z', '#e04a3a') + P('M122 91 L 110 98 L 114 90 Z', '#e04a3a');
  /* le bras qui tire la corde (proche), le brassard */
  s += P('M104 102 L 110 116 L 76 108 L 72 94 Z', d.g(vert)) + P('M70 92 L 78 106 L 124 96 L 120 82 Z', d.g(vert)) +
    P('M94 86 L 121 82 L 124 96 L 97 102 Z', d.g(cuir)) + L('M102 85 L 105 100 M112 83 L 115 98', cuirF, 2) + couture('M96 90 L 120 86', '#e0b484') +
    '<ellipse cx="76" cy="100" rx="9" ry="8" fill="' + d.g(cuir) + '" stroke="' + O + '" stroke-width="3"/>' + rivets([[74, 97], [79, 103]]) +
    main(d, 127, 89, 8, pe[1]) + main(d, 207, 105, 8.5, pe[1]);
  return d.svg('0 0 250 300', s);
}

/* ============ l'Alchimiste : il va lancer une fiole de feu ============ */
function alchimiste(lk){
  var d = new Dessin(), ch = lk.ch;
  var pr = '#5e3a96', capu = '#4e2f86', cuir = '#7a5232', gant = '#5a3a26', pant = '#3e3448', bt = '#6e4428';
  var s = '';
  /* les pans de la veste qui volent */
  s += P('M98 146 L 138 148 L 150 224 Q 110 238 54 222 Q 74 186 98 146 Z', d.g(pr)) +
    F('M98 146 L 112 148 L 92 230 Q 70 228 54 222 Q 74 186 98 146 Z', sombre(pr, .4), ' opacity=".85"') +
    couture('M58 218 Q 106 232 146 220', '#d9b46a') + L('M110 160 L 96 226 M126 162 L 128 228', sombre(pr, .45), 1.6);
  /* les jambes */
  s += P('M104 180 L 124 184 L 92 238 L 74 230 Z', d.g(pant)) + P('M74 226 L 94 234 L 82 280 L 64 278 Z', d.g(pant)) +
    botte(d, 'M60 270 L 84 274 L 86 290 L 44 290 Q 42 282 52 280 Z', bt) + P('M60 264 L 86 268 L 84 278 L 59 274 Z', d.g(clair(bt, .18))) + L('M44 290 L 86 290', '#2a1a10', 4) +
    P('M130 182 L 150 180 L 176 236 L 158 242 Z', d.g(pant)) + P('M158 234 L 176 230 L 190 278 L 172 282 Z', d.g(pant)) +
    P('M156 226 L 174 220 L 180 236 L 162 242 Z', d.g(cuir)) + rivets([[164, 230], [172, 228]]) +
    botte(d, 'M168 272 L 192 270 L 196 284 L 214 288 Q 216 293 206 293 L 166 292 Z', bt) + P('M166 266 L 192 264 L 193 274 L 168 276 Z', d.g(clair(bt, .18))) + L('M166 292 L 210 292', '#2a1a10', 4) +
    L('M150 182 L 176 236', LUNE, 1.6, ' opacity=".4"');
  /* bras avant (loin), main gantée ouverte vers les monstres */
  s += P('M142 100 L 150 114 L 194 128 L 196 114 Z', d.g(pr)) + P('M186 112 L 198 114 L 196 128 L 184 126 Z', d.g('#d9b46a')) +
    P('M196 112 L 212 104 L 216 110 L 206 118 L 220 116 L 220 123 L 206 126 L 214 130 L 210 135 L 198 130 Z', d.g(gant)) +
    L('M150 101 L 196 114', LUNE, 1.6, ' opacity=".5"');
  /* le corps : veste matelassée, tablier de cuir roussi, bandoulière de fioles */
  s += P('M100 102 Q 122 90 146 100 L 146 154 L 98 156 Q 92 128 100 102 Z', d.g(pr)) +
    L('M104 112 L 138 140 M102 128 L 122 146 M116 102 L 144 126 M104 146 L 140 112 M102 132 L 128 106', sombre(pr, .35), 1.3, ' opacity=".7"') +
    P('M112 104 Q 128 99 144 104 L 148 152 L 156 214 Q 134 222 110 214 L 112 152 Z', d.g(cuir)) +
    F('M112 104 Q 117 102 122 102 L 120 214 Q 114 215 110 214 L 112 152 Z', sombre(cuir, .3), ' opacity=".8"') +
    couture('M116 108 L 116 210', '#d8b07a') + couture('M141 108 L 151 208', '#d8b07a') +
    '<ellipse cx="136" cy="196" rx="8" ry="5" fill="#2a1a10" opacity=".35"/><ellipse cx="124" cy="128" rx="5" ry="3.5" fill="#2a1a10" opacity=".3"/>' +
    P('M120 166 L 144 166 L 144 184 Q 132 189 120 184 Z', d.g(sombre(cuir, .1))) + couture('M122 169 L 142 169', '#d8b07a') +
    P('M126 156 L 132 156 L 132 160 Q 137 162 136 168 L 122 168 Q 121 162 126 160 Z', '#5fd08a') + P('M125 152 L 133 152 L 133 157 L 125 157 Z', '#8a5a32') +
    L('M146 104 L 154 212', LUNE, 2, ' opacity=".5"') +
    L('M104 100 L 144 160', O, 9) + L('M104 100 L 144 160', '#5a361f', 5.5) +
    [[112, 112, '#ff6a2a'], [121, 125, '#9aa3c8'], [130, 139, '#5fd08a']].map(function(v){
      return P('M' + (v[0] - 4) + ' ' + (v[1] - 2) + ' L ' + (v[0] + 4) + ' ' + (v[1] - 2) + ' L ' + (v[0] + 5) + ' ' + (v[1] + 8) + ' Q ' + v[0] + ' ' + (v[1] + 12) + ' ' + (v[0] - 5) + ' ' + (v[1] + 8) + ' Z', v[2]) +
        P('M' + (v[0] - 3) + ' ' + (v[1] - 6) + ' L ' + (v[0] + 3) + ' ' + (v[1] - 6) + ' L ' + (v[0] + 3) + ' ' + (v[1] - 2) + ' L ' + (v[0] - 3) + ' ' + (v[1] - 2) + ' Z', '#8a5a32') +
        L('M' + (v[0] - 2) + ' ' + (v[1] + 1) + ' L ' + (v[0] - 2) + ' ' + (v[1] + 6), '#fff', 1.4, ' opacity=".7"');
    }).join('') +
    L('M100 152 Q 124 160 148 150', O, 8) + L('M100 152 Q 124 160 148 150', '#5a361f', 4.5) + P('M106 150 L 116 152 L 116 162 L 106 160 Z', '#d9b46a') +
    P('M132 148 L 156 146 L 158 172 L 134 174 Z', d.g('#8a5a32')) + L('M136 156 L 154 155', '#5e3a1e', 2) + C(146, 160, 2, '#d9b46a', ' stroke="' + O + '" stroke-width="1"');
  /* la tête : capuche violette, lunettes d'alchimiste relevées */
  s += capucheFond(d, 124, 60, capu) + visage(d, 124, 60, lk, {sourire:true}) + meche(d, 124, 60, ch) + capuche(d, 124, 60, capu, '#d9b46a') + col(d, 124, 60, pr) +
    L(T('M-26 -22 C -10 -30 20 -32 36 -24', 124, 60), O, 6) + L(T('M-26 -22 C -10 -30 20 -32 36 -24', 124, 60), '#4a2e1c', 3.5) +
    [[2, -30, 8], [21, -30, 7]].map(function(g){
      var x = 124 + g[0], y = 60 + g[1];
      return '<circle cx="' + x + '" cy="' + y + '" r="' + g[2] + '" fill="' + d.g('#3fa8c8') + '" stroke="#c9a040" stroke-width="3.5"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + (g[2] + 2) + '" fill="none" stroke="' + O + '" stroke-width="1.5"/>' +
        L('M' + (x - 3) + ' ' + (y - 2) + ' Q ' + (x - 1) + ' ' + (y - 5) + ' ' + (x + 2) + ' ' + (y - 5), '#e8fdff', 1.8);
    }).join('');
  /* le bras proche, levé en arrière : la fiole de feu */
  s += P('M104 106 L 112 120 L 82 82 L 70 90 Z', d.g(pr)) + P('M70 90 L 82 82 L 94 44 L 80 40 Z', d.g(pr)) +
    P('M78 44 L 95 48 L 93 56 L 76 52 Z', d.g('#d9b46a')) +
    '<circle cx="88" cy="20" r="40" fill="' + d.halo('#fff6b0', '#ff7a1a') + '"/>' +
    P('M82 6 L 94 6 L 94 14 C 106 18 108 34 98 40 C 92 44 84 44 78 40 C 68 34 70 18 82 14 Z', d.g('#ff7a2a', .8)) +
    F('M74 26 C 80 22 96 22 102 26 C 104 34 98 40 88 41 C 78 40 72 34 74 26 Z', '#ffd060', ' opacity=".55"') +
    P('M80 1 L 96 1 L 96 7 L 80 7 Z', '#8a5a32') + L('M78 18 Q 80 12 86 11', '#fff6b0', 2.4) +
    P('M86 0 C 82 -8 90 -12 88 -20 C 96 -12 96 -6 92 0 Z', '#ffc040', ' stroke-width="2"') +
    C(72, -6, 1.8, '#ffe08a') + C(104, -2, 1.5, '#ffe08a') + C(98, -14, 1.2, '#fff6b0') +
    main(d, 88, 44, 8, gant);
  return d.svg('0 0 250 300', s);
}

/* ============ le Sage : le livre ouvert, une rune qui brille ============ */
function sage(lk){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var bleu = '#2f4c9e', capu = '#2a4290', robe = '#d8caa4', or = '#e8c062';
  var s = '';
  function tresse(x0, y0, dx, n){ var t = ''; for(var k = 0; k < n; k++){ var x = x0 + dx * k, y = y0 + k * 15; t += '<ellipse cx="' + x + '" cy="' + y + '" rx="7" ry="9" fill="' + d.g(ch[1]) + '" stroke="' + O + '" stroke-width="2.6"/>' + L('M' + (x - 3) + ' ' + (y - 4) + ' q 3 3 6 0', ch[0], 1.6, ' opacity=".7"'); } return t + '<circle cx="' + (x0 + dx * n) + '" cy="' + (y0 + n * 15 - 1) + '" r="4" fill="' + or + '" stroke="' + O + '" stroke-width="2"/>'; }
  /* le manteau, derrière, qui flotte */
  s += P('M98 98 C 74 132 58 200 34 286 Q 64 294 92 288 L 100 182 Z', d.g(sombre(capu, .2))) + L('M92 130 C 76 176 64 226 52 282', sombre(capu, .55), 1.8);
  if(lk.fille) s += tresse(84, 104, -5, 6);
  /* la robe claire, les pans du manteau brodés */
  s += P('M98 98 Q 122 88 148 98 L 156 196 L 182 284 Q 124 298 62 284 L 92 196 Z', d.g(robe)) +
    L('M126 160 L 120 286 M146 176 L 158 284', sombre(robe, .3), 2.2) + L('M152 120 L 158 196 L 180 280', LUNE, 2, ' opacity=".5"') +
    P('M98 98 Q 106 96 115 98 L 110 200 L 94 288 Q 74 288 62 284 L 92 196 Z', d.g(bleu)) +
    P('M138 96 Q 145 97 148 98 L 156 196 L 182 284 Q 172 288 162 288 L 146 200 Z', d.g(bleu)) +
    L('M112 100 L 107 200 L 92 286', or, 2.4) + L('M140 98 L 148 200 L 164 286', or, 2.4) +
    [0, 1, 2, 3, 4, 5].map(function(k){ var y = 150 + k * 22, x = 108 - k * 2.6; return L('M' + (x - 6) + ' ' + y + ' l 3 -5 l 3 5 l 3 -5', '#8ff3ff', 1.4, ' opacity=".75"'); }).join('') +
    L('M64 282 Q 124 296 180 282', or, 3) + couture('M66 278 Q 124 290 178 278', '#8ff3ff') +
    P('M86 284 L 112 286 L 110 294 L 82 292 Z', '#5e3a1e') + P('M140 286 L 168 284 L 170 292 L 140 293 Z', '#5e3a1e');
  /* l'écharpe-ceinture, la bourse */
  s += L('M96 150 Q 124 158 152 148', O, 10) + L('M96 150 Q 124 158 152 148', bleu, 6) + L('M96 148 Q 124 156 152 146', or, 1.6) +
    P('M100 152 Q 86 172 78 196 Q 92 180 106 160 Z', d.g(bleu)) + C(78, 198, 4, or, ' stroke="' + O + '" stroke-width="2"') +
    P('M132 156 Q 142 154 148 158 Q 150 172 140 174 Q 130 172 132 156 Z', d.g('#7a4a28')) + L('M134 158 Q 140 162 146 158', or, 1.6);
  /* la pèlerine sur les épaules, l'agrafe */
  s += P('M94 96 Q 122 86 152 96 L 158 128 Q 124 140 90 128 Z', d.g(bleu)) + L('M92 126 Q 124 138 156 126', or, 2.4) +
    couture('M96 120 Q 124 130 154 120', '#8ff3ff') + L('M152 98 L 157 126', LUNE, 2, ' opacity=".55"');
  /* le bras tendu (loin) : la rune */
  s += P('M144 104 L 152 122 L 196 104 L 188 88 Z', d.g(bleu)) + P('M186 88 L 196 104 L 190 106 L 180 92 Z', or) +
    main(d, 202, 92, 8, pe[1]) +
    '<circle cx="226" cy="86" r="46" fill="' + d.halo('#e8fdff', '#3fd0ff') + '"/>' +
    '<circle cx="226" cy="86" r="22" fill="none" stroke="#bff8ff" stroke-width="3"/><circle cx="226" cy="86" r="15" fill="none" stroke="#8ff3ff" stroke-width="2" stroke-dasharray="4 4"/>' +
    '<circle cx="226" cy="86" r="28" fill="none" stroke="#8ff3ff" stroke-width="1" opacity=".6" stroke-dasharray="1 5"/>' +
    L('M226 72 L 226 100 M216 78 L 236 94 M236 78 L 216 94', '#e8fdff', 2.4) +
    C(250, 66, 2, '#e8fdff') + C(244, 112, 1.6, '#bff8ff') + C(206, 60, 1.4, '#bff8ff') + C(256, 96, 1.2, '#fff');
  /* la tête : capuche bleue bordée d'or, lunettes */
  s += capucheFond(d, 122, 56, capu) + visage(d, 122, 56, lk, {lunettes:lk.lunettes}) + meche(d, 122, 56, ch) + capuche(d, 122, 56, capu, or);
  if(lk.fille) s += tresse(104, 104, -2, 5);
  /* le bras proche : le livre ouvert, qui luit */
  s += P('M100 106 L 110 122 L 136 152 L 148 138 Z', d.g(bleu)) + P('M130 134 L 142 128 L 150 140 L 138 148 Z', or) +
    '<ellipse cx="152" cy="136" rx="34" ry="20" fill="' + d.halo('#e8fdff', '#3fd0ff') + '" opacity=".8"/>' +
    P('M124 132 L 150 125 L 178 132 L 178 162 L 150 155 L 124 162 Z', d.g('#6a3c2a')) +
    P('M124 132 L 130 132 L 130 138 L 124 138 Z M172 132 L 178 132 L 178 138 L 172 138 Z', or, ' stroke-width="1.5"') +
    P('M129 134 L 150 129 L 150 152 L 129 157 Z', '#f6ecd2') + P('M150 129 L 173 134 L 173 157 L 150 152 Z', '#fff8e6') +
    F('M129 134 L 150 129 L 150 152 L 129 157 Z', '#c8b088', ' opacity=".35"') +
    L('M133 140 L 146 137 M133 145 L 144 142 M133 150 L 146 147 M154 137 L 168 140 M154 142 L 166 145 M154 147 L 168 150', '#2ab0e0', 1.6) +
    C(160, 120, 1.6, '#bff8ff') + C(144, 116, 1.2, '#e8fdff') + L('M154 118 l 3 -5 l 3 5', '#8ff3ff', 1.4) +
    main(d, 144, 152, 8, pe[1]);
  return d.svg('0 0 250 300', s);
}

/* ============ les monstres ============ */
function rat(sombreR){
  var i = 'rt' + (++uid);
  return '<svg viewBox="0 0 200 124" style="width:100%;height:100%;display:block;overflow:visible">' +
    '<defs><linearGradient id="' + i + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (sombreR ? '#6a5c6c' : '#9c8a96') + '"/><stop offset=".5" stop-color="' + (sombreR ? '#463a48' : '#6e5c6a') + '"/><stop offset="1" stop-color="' + (sombreR ? '#221a26' : '#3a2e3a') + '"/></linearGradient>' +
    '<filter id="' + i + 'g" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
    L('M150 86 C 186 82 198 56 184 38 C 176 29 165 36 171 44', O, 10) + L('M150 86 C 186 82 198 56 184 38 C 176 29 165 36 171 44', '#d68d9c', 5) +
    L('M160 84 l 4 -6 M172 78 l 5 -5 M182 68 l 6 -3', '#a8606e', 1.4) +
    '<ellipse cx="78" cy="106" rx="11" ry="7" fill="#3a2f3a" stroke="' + O + '" stroke-width="3"/><ellipse cx="136" cy="106" rx="12" ry="7" fill="#3a2f3a" stroke="' + O + '" stroke-width="3"/>' +
    P('M52 78 C 52 44 86 30 116 36 C 150 42 166 62 162 84 C 158 104 128 108 100 106 C 72 104 52 100 52 78 Z', 'url(#' + i + ')') +
    L('M84 56 l 8 -3 M96 64 l 9 -3 M110 52 l 8 -2 M120 70 l 9 -2 M134 58 l 8 -1 M100 82 l 9 -2 M128 86 l 8 -1 M70 70 l 7 -3', '#2a2030', 1.4, ' opacity=".6"') +
    L('M118 40 C 140 44 156 60 158 78', '#e8d0e8', 2, ' opacity=".35"') +
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
    return L('M' + bx + ' ' + by + ' Q ' + kx + ' ' + ky + ' ' + fx + ' ' + fy, O, 8) + L('M' + bx + ' ' + by + ' Q ' + kx + ' ' + ky + ' ' + fx + ' ' + fy, '#3a2448', 4) +
      L('M' + bx + ' ' + by + ' Q ' + kx + ' ' + (ky - 2) + ' ' + fx + ' ' + fy, '#8a6aa8', 1, ' opacity=".5"'); }).join(''); }).join('');
  return '<svg viewBox="0 0 200 200" style="width:100%;height:100%;display:block;overflow:visible"><defs><filter id="' + i + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2.5"/></filter>' +
    '<linearGradient id="' + i + 'c" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4a88"/><stop offset=".5" stop-color="#3a2448"/><stop offset="1" stop-color="#1c1026"/></linearGradient></defs>' +
    L('M100 -400 L 100 84', '#d8d0e8', 1.4, ' opacity=".7"') + pattes +
    P('M100 70 C 128 70 138 96 132 118 C 126 140 74 140 68 118 C 62 96 72 70 100 70 Z', 'url(#' + i + 'c)') +
    P('M100 84 l 8 12 l -8 12 l -8 -12 Z', '#ff7a2a') + L('M86 80 l -4 6 M114 80 l 4 6 M80 104 l -4 2 M120 104 l 4 2', '#8a6aa8', 1.4, ' opacity=".6"') +
    P('M100 120 C 116 120 122 132 116 142 C 110 150 90 150 84 142 C 78 132 84 120 100 120 Z', '#2c1a38') +
    [[92, 132], [108, 132], [96, 140], [104, 140]].map(function(e){ return '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="4.5" fill="#ff2a3a" filter="url(#' + i + ')"/><circle cx="' + e[0] + '" cy="' + e[1] + '" r="2.4" fill="#ff5a5a"/>'; }).join('') +
    P('M94 148 l -2 10 l 6 -6 Z M106 148 l 2 10 l -6 -6 Z', '#e8e0f0') + '</svg>';
}

/* ============ le décor : la crypte sous le clocher ============ */
function decor(W, H, sol){
  var R = rng(17);
  var s = '<svg class="mq-abs" style="inset:0" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<linearGradient id="d-mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17132a"/><stop offset=".6" stop-color="#2a2340"/><stop offset="1" stop-color="#231c34"/></linearGradient>' +
    '<pattern id="d-pierre" width="64" height="34" patternUnits="userSpaceOnUse"><path d="M0 0 h64 M0 17 h64 M0 0 v17 M32 0 v17 M16 17 v17 M48 17 v17" stroke="#100c1a" stroke-width="3" fill="none"/><path d="M3 3 h20 M36 21 h9 M19 3 l4 3" stroke="#4a3e60" stroke-width="1.6" opacity=".55"/><path d="M28 14 h-12 M60 31 h-10" stroke="#0c0814" stroke-width="1.6" opacity=".5"/></pattern>' +
    '<linearGradient id="d-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3e3550"/><stop offset="1" stop-color="#120e1c"/></linearGradient>' +
    '<radialGradient id="d-trou" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="#1c1830"/><stop offset=".5" stop-color="#08060e"/><stop offset="1" stop-color="#0c0814"/></radialGradient>' +
    '<linearGradient id="d-brume" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a90c0" stop-opacity="0"/><stop offset="1" stop-color="#8a90c0" stop-opacity=".22"/></linearGradient>' +
    '<linearGradient id="d-lune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe8ff" stop-opacity=".34"/><stop offset=".7" stop-color="#a8c8ff" stop-opacity=".1"/><stop offset="1" stop-color="#a8c8ff" stop-opacity=".04"/></linearGradient>' +
    '<radialGradient id="d-bleu" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7ff0ff" stop-opacity=".55"/><stop offset="1" stop-color="#7ff0ff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="d-chaud" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc070" stop-opacity=".6"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="d-pil" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#40365a"/><stop offset=".6" stop-color="#2c2440"/><stop offset="1" stop-color="#1a1428"/></linearGradient>' +
    '<filter id="d-flou"><feGaussianBlur stdDeviation="3"/></filter><filter id="d-flou2" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="8"/></filter>' +
    '<filter id="d-flou3" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="14"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#d-mur)"/><rect width="' + W + '" height="' + sol + '" fill="url(#d-pierre)"/>';
  /* des pierres plus claires, plus sombres, quelques trous */
  for(var r = 0; r * 17 < sol; r++) for(var c = -1; c * 32 < W; c++){
    var x = c * 32 + (r % 2 ? 16 : 0), y = r * 17, k = R();
    if(k < 0.2) s += '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="29" height="14" fill="#4a3f62" opacity="' + (0.25 + R() * 0.3).toFixed(2) + '"/>';
    else if(k < 0.38) s += '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="29" height="14" fill="#0e0a18" opacity="' + (0.25 + R() * 0.35).toFixed(2) + '"/>';
  }
  /* des fissures */
  [[30, 20], [612, 210], [700, 30], [900, 120], [360, 30], [880, 250]].forEach(function(f){
    var x = f[0], y = f[1];
    s += L('M' + x + ' ' + y + ' l 6 10 l -4 8 l 7 9 l -2 12 M' + (x + 6) + ' ' + (y + 10) + ' l 9 3', '#0a0612', 1.8);
  });
  /* de la mousse, en bas des murs et dans les creux */
  [[20, 300, 50], [700, 312, 40], [930, 280, 40], [600, 90, 22], [880, 70, 26], [360, 120, 20]].forEach(function(m){
    s += '<ellipse cx="' + m[0] + '" cy="' + m[1] + '" rx="' + m[2] + '" ry="' + (m[2] * 0.35) + '" fill="#3a6a40" opacity=".35" filter="url(#d-flou)"/>';
    for(var k = 0; k < 9; k++) s += C((m[0] + (R() - 0.5) * m[2] * 1.4).toFixed(1), (m[1] + (R() - 0.5) * m[2] * 0.5).toFixed(1), (1 + R() * 2).toFixed(1), R() < 0.5 ? '#5a9a50' : '#2f5a34', ' opacity=".7"');
  });
  /* la grille du plafond : la lune tombe dans la crypte */
  s += '<path d="M526 0 L 574 0 L 664 ' + sol + ' L 444 ' + sol + ' Z" fill="url(#d-lune)"/>' +
    '<path d="M538 0 L 562 0 L 600 ' + sol + ' L 500 ' + sol + ' Z" fill="url(#d-lune)" opacity=".7"/>' +
    '<rect x="520" y="-4" width="60" height="14" fill="#0c0a14" stroke="#4a4060" stroke-width="3"/>' + L('M532 -2 L 532 10 M544 -2 L 544 10 M556 -2 L 556 10 M568 -2 L 568 10', '#5a5070', 3);
  for(var p = 0; p < 34; p++){ var py = R() * sol, pw = 22 + py * 0.32; s += C((550 + (R() - 0.5) * pw * 2).toFixed(1), py.toFixed(1), (0.6 + R() * 1.4).toFixed(1), '#e8f4ff', ' opacity="' + (0.25 + R() * 0.5).toFixed(2) + '"'); }
  /* les grandes arches, et ce qu'on voit derrière */
  [[150, 120], [470, 150], [820, 130]].forEach(function(a, n){
    var x = a[0], w = a[1], l = x - w / 2, rr = x + w / 2;
    var arc = 'M' + l + ' ' + sol + ' V 150 C ' + l + ' 60 ' + rr + ' 60 ' + rr + ' 150 V ' + sol;
    s += '<path d="' + arc + ' Z" fill="url(#d-trou)"/>';
    for(var k = 1; k <= 3; k++){ var ww = w * (1 - k * 0.22), ll = x - ww / 2, r2 = x + ww / 2, top = 150 + k * 26;
      s += '<path d="M' + ll + ' ' + sol + ' V ' + top + ' C ' + ll + ' ' + (top - 76 * (1 - k * 0.22)) + ' ' + r2 + ' ' + (top - 76 * (1 - k * 0.22)) + ' ' + r2 + ' ' + top + ' V ' + sol + '" fill="none" stroke="#3a3256" stroke-width="' + (4 - k) + '" opacity="' + (0.6 - k * 0.14) + '"/>'; }
    s += '<ellipse cx="' + x + '" cy="' + (sol - 10) + '" rx="' + (w * 0.4) + '" ry="22" fill="#8a90c0" opacity=".12" filter="url(#d-flou)"/>';
    s += '<path d="' + arc + '" fill="none" stroke="#120e1c" stroke-width="16"/><path d="' + arc + '" fill="none" stroke="#4a3e62" stroke-width="11"/>';
    for(var v = 0; v <= 10; v++){ var t = v / 10, ang = Math.PI * (1 - t), cx = x + Math.cos(ang) * (w / 2), cy = 150 - Math.sin(ang) * 66;
      s += L('M' + (cx - Math.cos(ang) * 6).toFixed(1) + ' ' + (cy + Math.sin(ang) * 6).toFixed(1) + ' L ' + (cx + Math.cos(ang) * 6).toFixed(1) + ' ' + (cy - Math.sin(ang) * 6).toFixed(1), '#120e1c', 2); }
    s += P('M' + (x - 9) + ' 78 L ' + (x + 9) + ' 78 L ' + (x + 6) + ' 96 L ' + (x - 6) + ' 96 Z', '#5a4e72') +
      L('M' + (rr + 4) + ' 150 C ' + (rr + 4) + ' 100 ' + (x + 20) + ' 82 ' + x + ' 80', LUNE, 1.6, ' opacity=".25"');
  });
  /* au fond de l'arche de droite : deux yeux qui brillent */
  s += '<ellipse cx="826" cy="196" rx="14" ry="6" fill="#ff2a3a" opacity=".35" filter="url(#d-flou)"/>' + C(820, 196, 2.4, '#ff5a5a') + C(832, 196, 2.4, '#ff5a5a');
  /* l'escalier qui s'enfonce, dans l'arche du milieu */
  for(var e = 0; e < 7; e++) s += '<rect x="' + (416 + e * 5) + '" y="' + (sol - 16 - e * 14) + '" width="' + (108 - e * 10) + '" height="9" fill="#2a2240" stroke="#120e1c" stroke-width="1.5" opacity="' + (0.95 - e * 0.12) + '"/>';
  /* la pierre des quatre signes, au-dessus de l'arche du milieu (l'œil, le chaudron, la lyre, l'étoile) */
  s += '<circle cx="470" cy="40" r="30" fill="#7ff0ff" opacity=".12" filter="url(#d-flou2)"/>' +
    '<circle cx="470" cy="40" r="25" fill="#3a3050" stroke="' + O + '" stroke-width="3"/><circle cx="470" cy="40" r="20" fill="#2a2240" stroke="#5a4e72" stroke-width="2"/>' +
    L('M456 30 Q 461 25 466 30 Q 461 35 456 30 Z', '#8ff3ff', 1.5, ' opacity=".8"') + C(461, 30, 1.4, '#8ff3ff') +
    L('M474 27 Q 474 35 480 35 Q 486 35 486 27 Z M473 27 L 487 27', '#8ff3ff', 1.5, ' opacity=".8"') +
    L('M457 45 Q 457 54 462 54 Q 467 54 467 45 M459 47 L 459 53 M462 47 L 462 53 M465 47 L 465 53', '#8ff3ff', 1.5, ' opacity=".8"') +
    L('M480 43 L 482 48 L 487 48 L 483 51 L 485 56 L 480 53 L 475 56 L 477 51 L 473 48 L 478 48 Z', '#8ff3ff', 1.5, ' opacity=".8"');
  /* deux piliers gravés de runes (la ville d'avant), des champignons qui luisent à leur pied */
  [[300, 46], [640, 46]].forEach(function(pl){
    var x = pl[0], w = pl[1];
    s += '<rect x="' + (x - w / 2) + '" y="0" width="' + w + '" height="' + sol + '" fill="url(#d-pil)" stroke="' + O + '" stroke-width="3"/>' +
      L('M' + (x - w / 2 + 14) + ' 70 L ' + (x - w / 2 + 14) + ' ' + (sol - 30), '#1a1428', 2) + L('M' + (x + w / 2 - 6) + ' 70 L ' + (x + w / 2 - 6) + ' ' + (sol - 30), '#4e4468', 2) +
      P('M' + (x - w / 2 - 8) + ' ' + (sol - 26) + ' L ' + (x + w / 2 + 8) + ' ' + (sol - 26) + ' L ' + (x + w / 2 + 8) + ' ' + sol + ' L ' + (x - w / 2 - 8) + ' ' + sol + ' Z', '#3a3050') +
      P('M' + (x - w / 2 - 10) + ' 40 L ' + (x + w / 2 + 10) + ' 40 L ' + (x + w / 2 + 6) + ' 58 L ' + (x - w / 2 - 6) + ' 58 Z', '#3e3456') +
      L('M' + (x - w / 2 - 6) + ' 50 L ' + (x + w / 2 + 6) + ' 50', '#1a1428', 2) +
      (x < 400 ? [150, 200] : [100, 150, 200]).map(function(y){ return '<path d="M' + (x - 8) + ' ' + y + ' l 8 -12 l 8 12 M' + x + ' ' + (y - 12) + ' v 22 M' + (x - 8) + ' ' + (y + 6) + ' h 16" stroke="#6fe8ff" stroke-width="2.2" fill="none" opacity=".6"/>'; }).join('') +
      '<rect x="' + (x - 14) + '" y="86" width="28" height="130" fill="#6fe8ff" opacity=".08" filter="url(#d-flou2)"/>' +
      L('M' + (x + 6) + ' 230 l 4 10 l -3 9 l 5 8', '#120e1c', 1.6);
  });
  /* la vieille bannière des Fondateurs, déchirée */
  s += L('M222 8 L 290 8', '#5a4a3a', 4) + P('M228 8 L 284 8 L 284 70 L 276 78 L 270 66 L 262 84 L 254 70 L 246 80 L 240 68 L 228 74 Z', '#5a2a3a') +
    F('M228 8 L 240 8 L 240 68 L 228 74 Z', '#2a1020', ' opacity=".5"') + L('M232 12 L 280 12 M232 64 L 280 62', '#a08040', 1.6, ' opacity=".6"') +
    L('M256 26 L 259 35 L 268 35 L 261 40 L 264 49 L 256 44 L 248 49 L 251 40 L 244 35 L 253 35 Z', '#c8a860', 1.6, ' opacity=".7"');
  /* la niche : une urne, des bougies, un vieux crâne */
  s += '<path d="M680 202 V 150 C 680 116 744 116 744 150 V 202 Z" fill="#0a0812" stroke="#4a3e62" stroke-width="5"/><path d="M680 202 V 150 C 680 116 744 116 744 150 V 202" fill="none" stroke="#120e1c" stroke-width="1.6"/>' +
    '<rect x="674" y="200" width="76" height="9" fill="#3e3456" stroke="' + O + '" stroke-width="2.5"/>' +
    '<ellipse cx="712" cy="170" rx="44" ry="34" fill="url(#d-chaud)"/>' +
    P('M700 200 C 694 186 698 168 706 166 L 704 160 L 720 160 L 718 166 C 728 168 732 186 724 200 Z', '#6a4e5a') + L('M698 182 L 726 182', '#a08060', 1.6) +
    [[688, 200, 18], [692, 200, 12], [734, 200, 14]].map(function(b){ return '<rect x="' + (b[0] - 3) + '" y="' + (b[1] - b[2]) + '" width="6" height="' + b[2] + '" fill="#efe2c4" stroke="' + O + '" stroke-width="1.5"/>' +
      '<path d="M' + b[0] + ' ' + (b[1] - b[2] - 9) + ' C ' + (b[0] + 3) + ' ' + (b[1] - b[2] - 4) + ' ' + (b[0] + 2) + ' ' + (b[1] - b[2] - 1) + ' ' + b[0] + ' ' + (b[1] - b[2] - 1) + ' C ' + (b[0] - 2) + ' ' + (b[1] - b[2] - 1) + ' ' + (b[0] - 3) + ' ' + (b[1] - b[2] - 4) + ' ' + b[0] + ' ' + (b[1] - b[2] - 9) + ' Z" fill="#ffd060"/>'; }).join('') +
    P('M736 186 C 736 176 752 176 752 186 C 752 192 750 194 748 196 L 740 196 C 738 194 736 192 736 186 Z', '#d8ccb4', ' stroke-width="2"') +
    C(741, 186, 2.4, '#1a1020') + C(748, 186, 2, '#1a1020') + L('M741 196 L 741 199 M744 196 L 744 199 M747 196 L 747 199', O, 1.2);
  /* des racines qui percent la voûte (le Vieux Chêne n'est pas loin), des chaînes, des toiles */
  s += L('M60 0 C 70 30 54 50 66 80 C 72 96 64 110 70 124', '#3e2a1c', 8) + L('M60 0 C 70 30 54 50 66 80 C 72 96 64 110 70 124', '#5a4030', 3) + L('M66 60 C 80 70 82 82 92 88', '#4a3424', 4) + L('M66 96 C 54 104 50 116 52 126', '#4a3424', 3) +
    L('M612 0 C 606 24 618 40 610 66', '#3e2a1c', 6) + L('M780 0 C 790 20 782 34 792 52 C 798 62 794 74 800 82', '#3e2a1c', 5) + L('M786 30 C 774 38 772 48 766 54', '#3e2a1c', 3);
  for(var c1 = 0; c1 < 9; c1++) s += '<ellipse cx="' + (430 + (c1 % 2) * 2) + '" cy="' + (10 + c1 * 12) + '" rx="4" ry="7" fill="none" stroke="#5a5470" stroke-width="3"/>';
  for(var c2 = 0; c2 < 6; c2++) s += '<ellipse cx="' + (918 + (c2 % 2) * 2) + '" cy="' + (8 + c2 * 12) + '" rx="4" ry="7" fill="none" stroke="#4a4460" stroke-width="3"/>';
  s += '<path d="M914 78 l 8 0 l 6 12 l -10 4 Z" fill="#4a4460" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M' + W + ' 0 L ' + (W - 90) + ' 0 Q ' + (W - 50) + ' 30 ' + W + ' 70 Z" fill="none" stroke="#bfb8d8" stroke-width="1.2" opacity=".35"/>' +
    '<path d="M' + (W - 70) + ' 0 Q ' + (W - 40) + ' 22 ' + W + ' 40 M' + (W - 40) + ' 0 Q ' + (W - 22) + ' 14 ' + W + ' 18 M' + (W - 80) + ' 8 L ' + (W - 6) + ' 60" stroke="#bfb8d8" stroke-width="1" fill="none" opacity=".3"/>' +
    '<path d="M0 0 L 80 0 Q 40 28 0 64 Z" fill="none" stroke="#bfb8d8" stroke-width="1.2" opacity=".3"/><path d="M0 30 Q 30 18 56 0 M0 48 L 70 0" stroke="#bfb8d8" stroke-width="1" fill="none" opacity=".25"/>' +
    '<path d="M744 120 Q 760 128 770 150 M744 132 Q 756 140 760 156 M752 124 L 744 150" stroke="#bfb8d8" stroke-width="1" fill="none" opacity=".3"/>';
  /* des champignons qui luisent */
  [[24, sol - 2, 1], [936, sol - 2, 1.2], [910, 238, 0.8], [672, 206, 0.7], [364, sol - 4, 0.7]].forEach(function(m){
    var x = m[0], y = m[1], k = m[2];
    s += '<ellipse cx="' + x + '" cy="' + (y - 8 * k) + '" rx="' + (22 * k) + '" ry="' + (16 * k) + '" fill="url(#d-bleu)"/>';
    [[-8, 12, 7], [0, 18, 9], [9, 10, 6]].forEach(function(c){
      var cx = x + c[0] * k, h = c[1] * k, r = c[2] * k;
      s += L('M' + cx + ' ' + y + ' L ' + cx + ' ' + (y - h), '#bfe8e8', 2.4 * k) + '<path d="M' + (cx - r) + ' ' + (y - h) + ' Q ' + cx + ' ' + (y - h - r * 1.3) + ' ' + (cx + r) + ' ' + (y - h) + ' Z" fill="#5fe0f0" stroke="' + O + '" stroke-width="' + (1.8 * k) + '"/>' + C(cx - r * 0.3, y - h - r * 0.4, r * 0.18, '#e8ffff');
    });
  });
  /* le sol : dalles, flaque de lune, os, pièces */
  s += '<path d="M0 ' + sol + ' H ' + W + ' V ' + H + ' H 0 Z" fill="url(#d-sol)"/>' +
    '<path d="M0 ' + (sol + 26) + ' H ' + W + ' M0 ' + (sol + 58) + ' H ' + W + ' M90 ' + sol + ' L 50 ' + H + ' M280 ' + sol + ' L 262 ' + H + ' M480 ' + sol + ' L 486 ' + H + ' M680 ' + sol + ' L 708 ' + H + ' M860 ' + sol + ' L 910 ' + H + '" stroke="#120e1c" stroke-width="3"/>' +
    '<ellipse cx="554" cy="' + (sol + 6) + '" rx="110" ry="9" fill="#cfe8ff" opacity=".14"/>' +
    '<ellipse cx="540" cy="' + (sol + 22) + '" rx="40" ry="5" fill="#6a7aaa" opacity=".4"/><ellipse cx="532" cy="' + (sol + 21) + '" rx="18" ry="1.6" fill="#e8f4ff" opacity=".5"/>' +
    [[240, sol + 8, 9], [258, sol + 12, 6], [620, sol + 26, 7], [40, sol + 24, 8]].map(function(p){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + (p[2] * 0.6) + '" fill="#4a3e5a" stroke="' + O + '" stroke-width="2.5"/>'; }).join('') +
    L('M902 ' + (sol + 8) + ' L 926 ' + (sol + 4), '#d8ccb4', 4) + C(901, sol + 8, 3, '#d8ccb4') + C(927, sol + 4, 3, '#d8ccb4') +
    [[700, sol + 22], [708, sol + 25], [694, sol + 26]].map(function(p){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="4" ry="2" fill="#e8c062" stroke="#8a6a20" stroke-width="1"/>'; }).join('') +
    '<rect x="0" y="' + (sol - 60) + '" width="' + W + '" height="90" fill="url(#d-brume)"/>' +
    '<ellipse cx="120" cy="' + (sol - 30) + '" rx="140" ry="18" fill="#9aa0d0" opacity=".08" filter="url(#d-flou2)"/><ellipse cx="760" cy="' + (sol - 50) + '" rx="160" ry="20" fill="#9aa0d0" opacity=".07" filter="url(#d-flou2)"/>' +
    '</svg>';
  return s;
}
/* la lumière de lune passe aussi devant les héros */
function lumiere(W, H, sol){
  return '<svg class="mq-abs" style="inset:0;pointer-events:none;mix-blend-mode:screen" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
    '<path d="M526 0 L 574 0 L 664 ' + sol + ' L 444 ' + sol + ' Z" fill="#8ab0e0" opacity=".1"/></svg>';
}
function avantPlan(W, H, sol){
  return '<svg class="mq-abs" style="inset:0;pointer-events:none" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
    '<path d="M0 ' + (H - 30) + ' C 20 ' + (H - 44) + ' 46 ' + (H - 40) + ' 60 ' + (H - 26) + ' L 70 ' + H + ' L 0 ' + H + ' Z" fill="#07050c"/>' +
    '<path d="M' + W + ' ' + (H - 36) + ' C ' + (W - 24) + ' ' + (H - 46) + ' ' + (W - 50) + ' ' + (H - 34) + ' ' + (W - 66) + ' ' + (H - 20) + ' L ' + (W - 72) + ' ' + H + ' L ' + W + ' ' + H + ' Z" fill="#07050c"/>' +
    '<path d="M' + (W - 30) + ' 0 C ' + (W - 26) + ' 40 ' + (W - 40) + ' 70 ' + (W - 30) + ' 110" stroke="#0a070e" stroke-width="10" fill="none" stroke-linecap="round"/></svg>';
}
function vignette(W, H){
  return '<svg class="mq-abs" style="inset:0;pointer-events:none" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<radialGradient id="v-v" cx="' + (W * 0.47) + '" cy="' + (H * 0.55) + '" r="' + (W * 0.62) + '" gradientUnits="userSpaceOnUse"><stop offset=".42" stop-color="#05030a" stop-opacity="0"/><stop offset=".8" stop-color="#05030a" stop-opacity=".72"/><stop offset="1" stop-color="#05030a" stop-opacity=".96"/></radialGradient>' +
    '<linearGradient id="v-h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05030a" stop-opacity=".8"/><stop offset=".2" stop-color="#05030a" stop-opacity="0"/></linearGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#v-v)"/><rect width="' + W + '" height="' + H + '" fill="url(#v-h)"/></svg>';
}

/* ============ les objets (2 par héros au début ; proposition) ============ */
function fiole(c){
  return '<svg viewBox="0 0 40 48" style="width:100%;height:100%;display:block;overflow:visible">' +
    '<circle cx="20" cy="30" r="18" fill="' + c + '" opacity=".25"/>' +
    P('M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z', c) + P('M13 2 L 27 2 L 27 8 L 13 8 Z', '#8a5a32') +
    F('M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z', 'rgba(0,0,0,.2)') +
    L('M14 22 Q 15 18 19 17', '#fff', 2.4, ' opacity=".8"') + C(26, 34, 1.6, '#fff', ' opacity=".6"') + '</svg>';
}
function fleches(){
  var f = '<circle cx="27" cy="14" r="15" fill="#ff8a2a" opacity=".4"/>';
  [[4, 46, 24, 18], [12, 47, 31, 22]].forEach(function(a){
    f += L('M' + a[0] + ' ' + a[1] + ' L ' + a[2] + ' ' + a[3], O, 7) + L('M' + a[0] + ' ' + a[1] + ' L ' + a[2] + ' ' + a[3], '#d9b46a', 3.4) +
      P('M' + (a[0] + 1) + ' ' + (a[1] - 2) + ' L ' + (a[0] - 4) + ' ' + (a[1] - 9) + ' L ' + (a[0] + 4) + ' ' + (a[1] - 6) + ' Z', '#e04a3a', ' stroke-width="1.6"');
  });
  f += P('M20 24 C 13 15 19 6 24 1 C 24 7 28 8 30 3 C 38 9 40 20 33 26 C 29 29 24 28 20 24 Z', '#ff8a2a', ' stroke-width="2"') +
    F('M23 22 C 20 16 23 11 26 8 C 27 12 30 13 31 10 C 35 15 34 21 30 24 C 28 25 25 25 23 22 Z', '#ffd84a') +
    [[24, 18], [31, 22]].map(function(h){ return P('M' + (h[0] + 6) + ' ' + (h[1] - 7) + ' L ' + (h[0] - 3) + ' ' + (h[1] - 1) + ' L ' + (h[0] + 2) + ' ' + (h[1] + 3) + ' Z', '#d8e0ee', ' stroke-width="1.8"'); }).join('');
  return '<svg viewBox="0 0 40 48" style="width:100%;height:100%;display:block;overflow:visible">' + f + '</svg>';
}
var OBJETS = {
  pisteur:[{ic:fleches(), nom:'Flèches de feu', d:'brûlent un monstre', n:2}, {ic:fiole('#5fd08a'), nom:'Baume', d:'rend un cœur', n:1}],
  alchimiste:[{ic:fiole('#ff6a2a'), nom:'Fiole de feu', d:'brûle un monstre', n:2}, {ic:fiole('#9aa3c8'), nom:'Fumigène', d:'les monstres ratent', n:1}],
  sage:[{ic:fiole('#5fd08a'), nom:'Baume', d:'rend un cœur', n:1}, {ic:fiole('#ff5a7a'), nom:'Cœur vaillant', d:'relève un ami sonné', n:1}]
};
var GESTES = {
  pisteur:[['🏹', 'Flèche', 'un monstre, où qu\'il soit'], ['🗡️', 'Coup de dague', 'plus fort, celui de devant']],
  alchimiste:[['🌿', 'Herbes', 'soigne un peu un ami'], ['🥄', 'Coup de louche', 'frappe celui de devant']],
  sage:[['✨', 'Rune de lumière', 'éblouit les monstres'], ['🛡️', 'Bouclier de runes', 'protège un ami']]
};
var CHOIX = {pisteur:'g0', alchimiste:'o0', sage:'g0'};
var NOMS = {pisteur:'Pisteur', alchimiste:'Alchimiste', sage:'Sage'};
var PLACE = {pisteur:'devant', alchimiste:'au milieu', sage:'derrière'};

/* ============ la bande du bas ============ */
function bande(role, W, y, H, portrait){
  var s = '<div class="mq-abs mq-bande" style="left:0;top:' + y + 'px;width:' + W + 'px;height:' + (H - y) + 'px">';
  s += '<div class="mq-abs mq-portrait" style="left:14px;top:14px;width:122px;height:122px">' + portrait + '</div>' +
    '<div class="mq-abs" style="left:146px;top:16px;width:126px"><div class="mq-titre" style="font-size:23px;line-height:1">' + NOMS[role] + '</div>' +
    '<div style="font-size:13px;opacity:.75;margin-top:6px">Niveau 2</div>' +
    '<div style="margin-top:8px">' + coeurs(role === 'sage' ? 2 : 3, 3) + '</div>' +
    '<div style="font-size:12.5px;opacity:.75;margin-top:10px">Place : ' + PLACE[role] + '</div></div>';
  s += '<div class="mq-abs mq-sep" style="left:276px"></div><div class="mq-abs mq-lbl" style="left:290px;top:10px">Ses gestes</div>' +
    GESTES[role].map(function(g, k){
      return '<div class="mq-abs mq-geste' + (CHOIX[role] === 'g' + k ? ' choisi' : '') + '" style="left:' + (290 + k * 102) + 'px;top:32px;width:96px"><div class="mq-g-ic">' + g[0] + '</div><b>' + g[1] + '</b><small>' + g[2] + '</small></div>';
    }).join('') +
    [0, 1].map(function(k){ return '<div class="mq-abs mq-geste mq-inconnu" style="left:' + (494 + k * 60) + 'px;top:32px;width:54px"><div class="mq-q">?</div><small>bientôt</small></div>'; }).join('');
  s += '<div class="mq-abs mq-sep" style="left:620px"></div><div class="mq-abs mq-lbl" style="left:634px;top:10px">Son sac</div>' +
    OBJETS[role].map(function(o, k){
      return '<div class="mq-abs mq-geste mq-objet' + (CHOIX[role] === 'o' + k ? ' choisi' : '') + '" style="left:' + (634 + k * 128) + 'px;top:32px;width:122px">' +
        '<div class="mq-o-ic">' + o.ic + '</div><b>' + o.nom + '</b><small>' + o.d + '</small><span class="mq-o-n">×' + o.n + '</span></div>';
    }).join('') +
    '<div class="mq-abs mq-geste mq-inconnu" style="left:890px;top:32px;width:54px"><div class="mq-q" style="font-size:22px">🔒</div><small>plus tard</small></div>';
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
  '.mq-geste{height:110px;border-radius:12px;border:3px solid #4a3a2a;background:linear-gradient(#2a2036,#18121f);display:flex;flex-direction:column;align-items:center;padding:6px 4px;text-align:center}' +
  '.mq-geste.choisi{border-color:#ffd36a;box-shadow:0 0 0 2px ' + O + ', 0 0 16px rgba(255,200,90,.6);background:linear-gradient(#3a2e20,#1e1610)}' +
  '.mq-g-ic{font-size:32px;line-height:1.1}.mq-geste b{font-size:12.5px;line-height:1.1;margin-top:4px}.mq-geste small{font-size:10.5px;line-height:1.15;opacity:.7;margin-top:3px}' +
  '.mq-inconnu{border-style:dashed;border-color:#3a3040;background:rgba(20,14,28,.6);justify-content:center}.mq-inconnu small{opacity:.5;font-size:9.5px}' +
  '.mq-q{font-family:var(--f-titre);font-size:34px;line-height:1;color:#6a5a7a}' +
  '.mq-o-ic{width:34px;height:40px;margin-top:2px}.mq-objet b{margin-top:5px}' +
  '.mq-o-n{position:absolute;right:6px;top:5px;min-width:24px;height:22px;border-radius:11px;background:#120c18;border:2px solid #5a4630;font-size:12px;font-weight:800;color:#ffd36a;line-height:18px}' +
  '.mq-c{color:#ff5a6e;font-size:18px;text-shadow:0 1px 0 ' + O + '}.mq-c.vide{color:#3a2a36}' +
  '.mq-barre{display:flex;gap:2px;height:7px}.mq-barre i{flex:1;background:#3a1a22;border:1.5px solid ' + O + '}.mq-barre i.on{background:#d8303e}' +
  '.mq-anneau{position:absolute;height:22px;border-radius:50%;border:3px solid #ffd36a;box-shadow:0 0 16px #ffb040, inset 0 0 10px #ffb040}' +
  '.mq-fleche{position:absolute;width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:15px solid #ffd36a;filter:drop-shadow(0 0 6px #ffb040)}' +
  '.mq-bulle{display:flex;align-items:center;gap:10px;padding:6px 8px 6px 14px;border-radius:14px;background:rgba(243,231,203,.94);color:#35281b;border:3px solid ' + O + ';box-shadow:0 4px 0 rgba(0,0,0,.4);font-weight:700;font-size:14px;line-height:1.25}' +
  '.mq-lire{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(36,24,46,.12);font-size:15px;flex:none}' +
  '.mq-dim{filter:brightness(.7) saturate(.85)}' +
  '</style>';

var TEXTES = {
  pisteur:'Les rats ont flairé l\'odeur des héros… Pisteur, ta flèche est prête.',
  alchimiste:'Deux rats, une araignée… et un sac qui cliquette. À toi, Alchimiste !',
  sage:'L\'araignée descend sur son fil. Sage, tes runes brillent déjà.'
};
/* les héros par défaut du jeu (Persos.defaut) ; d'autres joueurs ont d'autres couleurs */
var PE = {p1:['#fff1e6', '#f7caa6', '#e8ad89', '#ff8f8f'], p2:['#ffe7d2', '#efb88e', '#d9976d', '#ff877a'], p3:['#f8d8b0', '#dea575', '#c48652', '#f2786a'],
  p4:['#eec899', '#c7935c', '#a77441', '#e4685a'], p5:['#d29d6f', '#a06840', '#80502d', '#d65a50'], p6:['#ad774e', '#6f4428', '#55331c', '#c84c4a']};
var CH = {brun:['#d39654', '#7c4624', '#3a1e0e'], noir:['#6b7096', '#272840', '#0e0e1a'], blond:['#fff4c2', '#f0c95a', '#a8781c'], roux:['#ffb886', '#dc622a', '#7a2a0e'], rose:['#ffd6ea', '#f07aab', '#932659'], chatain:['#e6bb85', '#a06f40', '#4c2d14']};
var YX = {vert:['#0a3a22', '#1f9150', '#86ffbd'], bleu:['#0a1f4a', '#2f6fd0', '#a6dcff'], marron:['#2a1206', '#7a4420', '#e0a876'], ambre:['#3a1a02', '#c47a10', '#ffd98a'], gris:['#1e2430', '#5f6f86', '#d6e2f0']};
var DEFAUT = {pisteur:{fille:true, pe:PE.p1, ch:CH.roux, ir:YX.vert}, alchimiste:{fille:false, pe:PE.p4, ch:CH.noir, ir:YX.ambre}, sage:{fille:true, pe:PE.p5, ch:CH.noir, ir:YX.ambre, lunettes:true}};
var AUTRES = {pisteur:{fille:false, pe:PE.p6, ch:CH.noir, ir:YX.marron}, alchimiste:{fille:true, pe:PE.p2, ch:CH.blond, ir:YX.bleu}, sage:{fille:false, pe:PE.p3, ch:CH.chatain, ir:YX.gris}};

function scene(actif, autres){
  var W = 960, H = 540, Y = 372, sol = 340, lk = autres ? AUTRES : DEFAUT;
  var heros = {sage:[40, sage(lk.sage)], alchimiste:[190, alchimiste(lk.alchimiste)], pisteur:[340, pisteur(lk.pisteur)]};
  var s = CSS + '<div class="mq" style="width:' + W + 'px;height:' + H + 'px">' + decor(W, Y, sol);
  ['sage', 'alchimiste', 'pisteur'].forEach(function(r){
    var x = heros[r][0];
    s += '<div class="mq-abs" style="left:' + (x + 40) + 'px;top:' + (sol - 14) + 'px;width:120px;height:20px;border-radius:50%;background:radial-gradient(#000a,#0000 70%)"></div>' +
      '<div class="mq-abs' + (r === actif ? '' : ' mq-dim') + '" style="left:' + x + 'px;top:' + (sol - 236) + 'px;width:200px;height:240px">' + heros[r][1] + '</div>';
  });
  s += '<div class="mq-abs" style="left:540px;top:' + (sol - 112) + 'px;width:180px;height:112px">' + rat(false) + '</div>' +
    '<div class="mq-abs" style="left:720px;top:' + (sol - 100) + 'px;width:162px;height:100px">' + rat(true) + '</div>' +
    '<div class="mq-abs" style="left:500px;top:84px;width:120px;height:120px">' + araignee() + '</div>';
  s += lumiere(W, Y, sol) + avantPlan(W, Y, sol) + vignette(W, Y);
  var cx = {sage:40, alchimiste:190, pisteur:340}[actif];
  s += '<div class="mq-anneau" style="left:' + (cx + 30) + 'px;top:' + (sol - 10) + 'px;width:140px"></div>' +
    '<div class="mq-fleche" style="left:' + (cx + 89) + 'px;top:' + (sol - 262) + 'px"></div>';
  [['sage', 2], ['alchimiste', 3], ['pisteur', 3]].forEach(function(h){
    s += '<div class="mq-abs" style="left:' + (heros[h[0]][0] + 60) + 'px;top:' + (sol + 16) + 'px;width:80px;text-align:center;line-height:1">' + coeurs(h[1], 3).replace(/font-size:18px/g, '') + '</div>';
  });
  s += '<div class="mq-abs" style="left:580px;top:' + (sol + 18) + 'px">' + barre(3, 3, 90) + '</div><div class="mq-abs" style="left:760px;top:' + (sol + 18) + 'px">' + barre(2, 3, 80) + '</div>' +
    '<div class="mq-abs" style="left:525px;top:212px">' + barre(2, 2, 70) + '</div>';
  s += '<div class="mq-abs" style="left:16px;top:12px" ><span class="mq-titre" style="font-size:20px">La crypte</span> <span style="font-size:13px;opacity:.7">· salle 2 sur 3</span></div>' +
    '<div class="mq-abs" style="right:16px;top:12px;font-size:13px;opacity:.8">🗺️ Le plan : chez le Sage</div>' +
    '<div class="mq-abs" style="left:600px;right:16px;top:42px"><div class="mq-bulle">' + TEXTES[actif] + '<span class="mq-lire">🔊</span></div></div>';
  var portrait = heros[actif][1].replace('viewBox="0 0 250 300"', 'viewBox="70 0 124 124"');
  s += bande(actif, W, Y, H, portrait);
  return s + '</div>';
}
/* ===== Ajouts pour le prototype « La salle des rats » (copie de combat2.js ; l'original ne change pas) ===== */
/* les six recettes du sac : la fiole colorée, et un petit signe pour les reconnaître sans la couleur */
var RECETTES = {feu:'#ff6a2a', fumigene:'#9aa3c8', huile:'#f2b630', colle:'#ece4d0', baume:'#5fd08a', coeur:'#ff5a7a'};
function potion(t){
  var c = RECETTES[t], s = '';
  s += '<circle cx="20" cy="30" r="19" fill="' + c + '" opacity=".22"/>';
  /* ce qui sort du bouchon */
  if(t === 'feu') s += P('M20 1 C 15 -5 21 -9 19 -15 C 27 -10 28 -3 24 1 Z', '#ffc040', ' stroke-width="2"') + F('M20.5 0 C 18.5 -3 21.5 -5 21 -8 C 24.5 -5 24.5 -2 22.5 0 Z', '#fff2a0');
  if(t === 'fumigene') s += '<circle cx="14" cy="-2" r="5" fill="#dfe2f2" stroke="' + O + '" stroke-width="2"/><circle cx="22" cy="-7" r="6.5" fill="#eceef8" stroke="' + O + '" stroke-width="2"/><circle cx="29" cy="-1" r="4.5" fill="#d2d6ec" stroke="' + O + '" stroke-width="2"/>';
  s += P('M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z', c);
  s += F('M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z', 'rgba(0,0,0,.18)');
  s += P('M13 2 L 27 2 L 27 8 L 13 8 Z', '#8a5a32');
  /* le signe, sur le ventre de la fiole */
  if(t === 'feu') s += P('M20 24 C 14 30 15 38 20 40 C 25 38 26 30 20 24 Z', '#ffd84a', ' stroke-width="1.8"');
  if(t === 'fumigene') s += L('M13 33 Q 17 29 21 33 T 29 33 M13 38 Q 17 34 21 38 T 29 38', '#4a4e6a', 2.2);
  if(t === 'huile') s += P('M20 24 C 15 31 14 35 20 39 C 26 35 25 31 20 24 Z', '#fff4c0', ' stroke-width="1.8"') + P('M25 8 C 26 12 27 14 27 17 C 27 20 24 20 24 17 C 24 14 25 12 25 8 Z', '#f2b630', ' stroke-width="1.5"');
  if(t === 'colle') s += P('M12 14 L 28 14 C 28 18 27 21 25 21 C 23 21 23 18 22 18 C 21 18 21 24 18 24 C 15 24 16 18 14 18 C 13 18 13 20 12 20 Z', '#fffaf0', ' stroke-width="1.6"') + P('M13 31 C 15 28 18 29 20 31 C 22 29 25 28 27 31 C 27 35 25 37 24 40 L 23 34 C 22 36 21 37 20 41 C 19 37 18 36 17 34 L 16 40 C 15 37 13 35 13 31 Z', '#fffaf0', ' stroke-width="1.6"');
  if(t === 'baume') s += P('M13 38 C 13 30 21 25 28 27 C 28 35 21 40 13 38 Z', '#c8ffd8', ' stroke-width="1.8"') + L('M14 37 L 25 29', '#2f8050', 1.4);
  if(t === 'coeur') s += P('M20 40 C 11 34 11 27 15.5 25.5 C 17.5 25 19.3 26.5 20 28.5 C 20.7 26.5 22.5 25 24.5 25.5 C 29 27 29 34 20 40 Z', '#fff0f4', ' stroke-width="1.8"');
  s += L('M14 22 Q 15 18 19 17', '#fff', 2.4, ' opacity=".8"') + C(27, 33, 1.6, '#fff', ' opacity=".6"');
  return '<svg viewBox="-4 -18 48 66" style="width:100%;height:100%;display:block;overflow:visible">' + s + '</svg>';
}
window.COMBAT = {scene:scene, pisteur:pisteur, alchimiste:alchimiste, sage:sage, decor:decor, lumiere:lumiere, avantPlan:avantPlan,
  vignette:vignette, fiole:fiole, fleches:fleches, potion:potion, RECETTES:RECETTES, DEFAUT:DEFAUT, CSS:CSS};
})();
