/* Le rat d'égout : la fiche modèle (niveau de détail attendu pour toutes les bêtes) */
(function(){
var B = window.BT, P = B.P, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE;
/* un point sur une courbe de Bézier cubique */
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
/* une crête de poils hérissés le long d'une courbe (pointes vers l'arrière) */
function crete(d, pts, t0, t1, n, haut, couleur){
  var s = 'M', base = [];
  for(var k = 0; k <= n; k++) base.push(bez(pts, t0 + (t1 - t0) * k / n));
  for(var k2 = 0; k2 < n; k2++){
    var a = base[k2], b = base[k2 + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = dy / l, ny = -dx / l, h = haut * (0.7 + ((k2 * 7) % 5) / 10);
    s += (k2 ? ' L ' : '') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' L ' + (b[0] + nx * h + dx * 0.4).toFixed(1) + ' ' + (b[1] + ny * h + dy * 0.4).toFixed(1);
  }
  var z = base[n]; s += ' L ' + z[0].toFixed(1) + ' ' + z[1].toFixed(1);
  for(var k3 = n; k3 >= 0; k3--){ var q = base[k3]; s += ' L ' + (q[0] + 2).toFixed(1) + ' ' + (q[1] + 16).toFixed(1); }
  return P(s + ' Z', couleur);
}
/* des mèches de poil, tirées au hasard dans une ellipse */
function poils(cx, cy, rx, ry, n, seed){
  var R = B.rng(seed), s = '';
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    var haut = y < cy - ry * 0.2, c = haut ? '#d4c2d0' : '#2a1e2c', op = haut ? 0.35 : 0.45, l = 9 + R() * 8;
    s += L('M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' q ' + (l * 0.5).toFixed(1) + ' ' + (l * 0.1).toFixed(1) + ' ' + l.toFixed(1) + ' ' + (l * 0.45).toFixed(1), c, 1.6, ' opacity="' + op + '"');
  }
  return s;
}
function dessin(){
  var d = new B.Dessin(), poil = '#7a6878', rose = '#e49aaa', s = '';
  var dos = [[175, 300], [160, 240], [200, 180], [280, 168]], dos2 = [[280, 168], [360, 156], [440, 200], [452, 268]];
  s += '<ellipse cx="270" cy="394" rx="215" ry="17" fill="#000" opacity=".5"/>';
  /* la queue, annelée, qui s'enroule derrière */
  s += P('M430 336 C 505 336 535 292 518 244 C 508 214 482 204 462 220 C 480 214 497 226 500 250 C 506 284 480 314 434 314 Z', d.g(rose));
  for(var k = 0; k < 9; k++){ var t = k / 9, p = bez([[434, 325], [505, 325], [520, 260], [480, 214]], t); s += L('M' + (p[0] - 6 + t * 3) + ' ' + (p[1] - 7 + t * 4) + ' l ' + (10 - t * 5) + ' ' + (11 - t * 5), '#a85a6c', 1.6, ' opacity=".7"'); }
  s += L('M440 318 C 492 316 512 286 506 252', '#ffd6de', 2, ' opacity=".6"');
  /* patte arrière, au loin */
  s += P('M378 328 C 400 350 404 372 392 386 L 360 388 C 356 370 360 348 378 328 Z', d.g(B.sombre(poil, .35))) + P('M362 384 C 350 392 334 394 326 392 C 322 388 330 384 340 382 Z', d.g(B.sombre(rose, .2)));
  /* le corps : crête hérissée, ventre plus clair, mèches de poil, cicatrice */
  s += crete(d, dos, 0.4, 1, 8, 20, d.g(poil)) + crete(d, dos2, 0, 0.86, 13, 26, d.g(poil));
  s += P('M175 300 C 160 240 200 180 280 168 C 360 156 440 200 452 268 C 462 322 430 368 370 376 C 300 384 210 372 175 300 Z', d.g(poil));
  s += F('M190 318 C 222 360 300 372 362 366 C 322 350 252 342 190 318 Z', '#c4adbd', ' opacity=".5"');
  s += F('M175 300 C 168 276 170 250 182 228 C 180 262 190 292 214 318 C 198 316 184 310 175 300 Z', '#1a1220', ' opacity=".35"');
  s += poils(320, 265, 115, 80, 110, 7);
  s += L('M298 226 L 344 250', '#e8b8c4', 3, ' opacity=".8"') + L('M306 222 l -4 10 M318 228 l -4 10 M330 235 l -4 10', '#e8b8c4', 1.6, ' opacity=".7"');
  s += '<ellipse cx="392" cy="300" rx="10" ry="6" fill="#2a1e2c" opacity=".4"/><ellipse cx="250" cy="330" rx="8" ry="5" fill="#2a1e2c" opacity=".35"/>';
  s += L('M200 200 C 240 172 300 160 360 166 C 400 172 432 196 446 232', LUNE, 3, ' opacity=".55"');
  /* patte arrière proche : la cuisse, le long pied rose */
  s += F('M336 300 C 376 276 422 296 422 338 C 422 368 392 384 360 380 C 344 360 334 330 336 300 Z', d.g(B.clair(poil, .08))) + L('M342 300 C 380 280 422 300 422 338 C 422 360 406 376 382 380', O, 3) + L('M352 296 C 380 286 404 292 414 312', LUNE, 2, ' opacity=".45"');
  s += poils(382, 336, 32, 32, 22, 11);
  s += P('M352 370 C 364 384 336 394 300 394 C 288 394 288 384 300 381 C 320 378 338 374 352 370 Z', d.g(rose));
  s += L('M300 390 q -6 2 -10 -2 M308 392 q -5 4 -10 1 M316 392 q -4 4 -9 2', O, 2) + L('M310 380 C 326 380 340 376 348 372', '#ffd6de', 1.6, ' opacity=".6"');
  /* patte avant, au loin */
  s += P('M246 322 C 256 340 250 356 240 368 L 230 386 L 212 388 C 218 372 224 358 228 346 C 230 334 236 326 246 322 Z', d.g(B.sombre(poil, .4))) + P('M220 384 C 210 392 196 394 190 391 C 192 386 202 384 212 382 Z', d.g(B.sombre(rose, .25)));
  /* oreille du fond */
  s += P('M186 214 C 168 184 176 156 200 152 C 218 152 224 176 214 204 Z', d.g(B.sombre(poil, .3))) + F('M192 204 C 180 184 186 166 200 164 C 210 166 212 182 206 198 Z', B.sombre(rose, .35));
  /* la tête */
  s += P('M245 210 C 220 196 180 198 150 214 C 120 230 92 250 70 262 C 58 268 56 280 66 284 C 96 292 130 300 168 302 C 210 304 246 288 256 260 C 262 240 258 222 245 210 Z', d.g(poil));
  s += F('M244 262 L 262 270 L 250 278 L 264 290 L 246 292 L 252 304 L 232 296 Z', d.g(poil));
  s += poils(200, 252, 40, 30, 30, 23);
  s += F('M70 262 C 100 248 130 232 160 220 C 140 236 110 254 84 270 Z', '#d4c2d0', ' opacity=".35"');
  s += L('M150 214 C 180 198 220 196 245 210', LUNE, 2.4, ' opacity=".55"');
  /* la gueule ouverte : mâchoire, langue, incisives jaunes, bave */
  s += P('M76 288 C 100 314 140 324 172 312 C 162 302 120 298 76 288 Z', '#4a1222') + F('M96 300 C 116 312 140 314 158 308 C 140 304 118 302 96 300 Z', '#c85a72');
  s += P('M68 279 L 78 280 L 81 302 L 72 299 Z', '#f3e3a0', ' stroke-width="2.4"') + P('M80 282 L 89 283 L 90 300 L 82 298 Z', '#e4d08a', ' stroke-width="2.4"');
  s += P('M86 296 L 92 290 L 96 300 Z M104 302 L 109 296 L 112 306 Z M122 306 L 127 300 L 130 309 Z', '#f3e3a0', ' stroke-width="1.6"');
  s += P('M130 314 C 132 326 127 336 131 344 C 138 338 136 326 134 314 Z', '#d8f0ff', ' stroke-width="1.6" opacity=".85"');
  /* le museau, les moustaches */
  s += '<ellipse cx="62" cy="272" rx="10" ry="8" fill="' + d.g(rose) + '" stroke="' + O + '" stroke-width="3"/>' + C(58, 274, 2.2, '#4a1222') + C(64, 268, 2.4, '#fff', ' opacity=".8"');
  s += [[80, 276], [88, 280], [96, 278], [86, 272], [94, 286]].map(function(p){ return C(p[0], p[1], 1.6, '#3a2632'); }).join('');
  s += L('M84 278 C 60 266 36 258 10 256 M86 282 C 60 280 34 284 8 290 M90 286 C 70 292 50 304 30 316 M98 276 C 84 258 70 246 50 236', '#e8e0ec', 1.4, ' opacity=".85"');
  /* l'œil rouge qui brille, le sourcil furieux */
  s += '<circle cx="162" cy="244" r="30" fill="' + d.halo('#ffb0a0', '#ff2a2a') + '" opacity=".75"/>';
  var ge = 'ge' + Math.floor(Math.random() * 1e6);
  d.defs.push('<radialGradient id="' + ge + '" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#fff2a0"/><stop offset=".45" stop-color="#ff4a2a"/><stop offset="1" stop-color="#7a0a14"/></radialGradient>');
  s += P('M144 247 C 150 234 172 231 182 240 C 178 253 156 258 144 247 Z', 'url(#' + ge + ')') + F('M161 236 C 164 240 164 250 161 254 C 158 250 158 240 161 236 Z', '#2a0408') + C(155, 241, 3, '#fff') + C(171, 248, 1.4, '#fff', ' opacity=".7"');
  s += P('M136 238 C 156 222 182 220 198 228 L 194 236 C 178 231 158 234 140 244 Z', d.g(B.sombre(poil, .45)));
  /* la grande oreille : peau fine et rose, veines, bord déchiré */
  s += '<g transform="translate(-42 10)">';
  s += P('M212 214 C 194 170 212 128 248 124 C 284 122 300 160 284 194 C 272 216 242 226 212 214 Z', d.g(poil));
  s += F('M222 206 C 212 176 226 144 250 140 C 276 140 284 168 272 192 C 262 208 242 212 222 206 Z', d.halo('#ffc8d2', '#d47a8e'));
  s += L('M240 200 C 244 180 248 164 256 150 M248 176 C 256 172 264 172 270 176 M236 190 C 230 178 230 166 234 156', '#b8546a', 1.4, ' opacity=".7"');
  s += P('M262 124 L 270 136 L 276 126 Z', '#1b1528', ' stroke-width="2"');
  s += L('M224 134 C 240 122 268 120 284 136', LUNE, 2.4, ' opacity=".6"') + '</g>';
  /* patte avant proche : doigts roses, griffes noires */
  s += P('M222 282 C 236 300 232 320 216 336 C 208 346 200 360 194 374 L 172 380 C 178 362 186 346 194 332 C 200 320 200 302 196 288 Z', d.g(poil)) + poils(208, 316, 12, 24, 10, 41);
  s += F('M214 336 L 226 346 L 214 348 L 222 358 L 208 354 Z', d.g(poil)) + L('M200 296 C 206 312 204 326 196 338', LUNE, 1.8, ' opacity=".45"');
  s += [[148, 386], [158, 389], [169, 390], [180, 387]].map(function(t){ return '<ellipse cx="' + t[0] + '" cy="' + t[1] + '" rx="6" ry="4" fill="' + d.g(rose) + '" stroke="' + O + '" stroke-width="2.4"/>' + L('M' + (t[0] - 6) + ' ' + (t[1] + 1) + ' q -5 1 -7 6', O, 2.4); }).join('');
  s += P('M194 370 C 190 382 172 386 160 384 C 168 378 180 372 194 370 Z', d.g(rose), ' stroke-width="2.4"');
  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.rat = {nom:'Rat d\'égout', rang:'monstre', pv:40, lieu:'Le fond du puits · par bandes de 2 ou 3',
  livre:'« Les rats vivent dans le noir. Ce qui brille leur fait peur : ils se dressent, le ventre à l\'air. »',
  combo:['+✨ S\'ouvre : la lumière', ' Autre chemin : l\'huile', '!🥄 Le renforce : le bruit'], dessin:dessin};
})();
