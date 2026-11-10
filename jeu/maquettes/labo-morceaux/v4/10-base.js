(function(){
'use strict';
var $ = function(s){ return document.querySelector(s); };
var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
var reduit = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
function rng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hexRgb(h){ h = String(h).replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
function rgbHex(r){ return '#' + r.map(function(v){ v = Math.round(Math.max(0, Math.min(255, v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
function melange(a, b, t){ var x = hexRgb(a), y = hexRgb(b); return rgbHex([0,1,2].map(function(i){ return x[i] + (y[i]-x[i])*t; })); }
function clair(c, t){ return melange(c, '#ffffff', t); }
function sombre(c, t){ return melange(c, '#1c1230', t); }
function ease(p){ return p < .5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2)/2; }
function tween(dur, f, fin){ var t0 = performance.now(); if(reduit) dur = 1; (function pas(now){ var p = Math.min(1, (now - t0)/dur); f(ease(p), p); if(p < 1) requestAnimationFrame(pas); else if(fin) fin(); })(t0); }
function attendre(ms, f){ return setTimeout(f, reduit ? 0 : ms); }
function prep(cv){ var dpr = Math.min(window.devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); var w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
  if(cv.width !== w*dpr || cv.height !== h*dpr){ cv.width = w*dpr; cv.height = h*dpr; } var ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return {ctx:ctx, w:w, h:h}; }
function f1(v){ return (Math.round(v*10)/10); }

/* ============ Les outils de dessin du jeu (contour épais, dégradés « jouet ») ============ */
var K = '#24182e', SW = 4;
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function R(x, y, w, h, rx, f, xx){ return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>'; }
function Ell(cx, cy, rx, ry, f, xx){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>'; }
function Cir(cx, cy, r, f, xx){ return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + r + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (r < 8 ? 2.5 : SW) + '"' + (xx || '') + '/>'; }
function T(d, c, w, xx){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (xx || '') + '/>'; }
function F(d, f, xx){ return '<path d="' + d + '" fill="' + f + '"' + (xx || '') + '/>'; }
function reflet(d, w, a){ return T(d, '#fff', w || 4, ' opacity="' + (a || .38) + '"'); }
function sansTrait(svg){ return svg.split(' stroke="' + K + '" stroke-width="' + SW + '"').join(''); }
function G(id){ return 'url(#g-' + id + ')'; }
function ombre(cx, cy, rx, ry, a){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="rgba(8,4,16,' + (a || .5) + ')" filter="url(#flou)"/>'; }
function txt(x, y, s, t, xx){ return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + s + '" text-anchor="middle" dominant-baseline="central" font-family="Caveat, \'Segoe Script\', cursive" font-weight="700" fill="#35281b"' + (xx || '') + '>' + t + '</text>'; }
function lin(id, st, vert){ return '<linearGradient id="g-' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' + st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>'; }
function rad(id, st, cx, cy, r){ return '<radialGradient id="g-' + id + '" cx="' + (cx || .5) + '" cy="' + (cy || .5) + '" r="' + (r || .5) + '">' + st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>'; }

/* ============ La perspective : une seule caméra pour toute la pièce ============
   L'œil est à 2,30 m du sol, face au mur du fond (à 4 m). Tout ce qui est dessiné passe par pr(X, Y, Z) :
   X = à gauche (−) ou à droite (+) du milieu, Y = hauteur au-dessus du sol, Z = distance à l'œil, en mètres.
   Toutes les lignes qui s'éloignent fuient donc vers le même point (500, 110). */
var CAM = {x:500, y:110, f:640, h:2.3};
function kz(Z){ return CAM.f/Z; }
function pr(X, Y, Z){ var k = CAM.f/Z; return [CAM.x + k*X, CAM.y + k*(CAM.h - Y)]; }
function d3(a, ouvert){ return 'M' + a.map(function(p){ var q = pr(p[0], p[1], p[2]); return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + (ouvert ? '' : ' Z'); }
function Q3(a, f, xx){ return P(d3(a), f, xx); }
function disque(X, Y, Z, r){ var k = kz(Z), c = pr(X, Y, Z); return {cx:c[0], cy:c[1], rx:k*r, ry:k*r*(CAM.h - Y)/Z, k:k}; }

function defs(){
  return '<defs><filter id="flou" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><filter id="flou2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>' +
    '<filter id="flou9" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>' +
    lin('bois', [['#d99a5e',0],['#b06f3e',.55],['#7d4626',1]]) + lin('boisV', [['#c98450',0],['#a5653a',.5],['#7d4626',1]], 1) + lin('boisC', [['#ecb882',0],['#c98450',.6],['#9a5c31',1]], 1) +
    lin('boisH', [['#e9bb80',0],['#d9a066',.45],['#c48850',1]], 1) + lin('boisS', [['#94603a',0],['#62381d',1]], 1) + lin('boisF', [['#8a5530',0],['#6b3d1f',.6],['#4f2a14',1]], 1) +
    lin('laiton', [['#9a6516',0],['#f5c45a',.32],['#fff1b8',.45],['#e0a23a',.62],['#8a5a12',1]]) + lin('laitonV', [['#fff1b8',0],['#f5b945',.5],['#b07a1c',1]], 1) +
    lin('cuivre', [['#7a3418',0],['#e08a52',.3],['#ffd2a6',.44],['#c96a36',.64],['#6a2810',1]]) +
    lin('fer', [['#2a2538',0],['#5f5872',.35],['#3a3450',.6],['#1c1828',1]]) + rad('fonte', [['#6d6688',0],['#3c3654',.45],['#1a1626',1]], .32, .3, .8) +
    lin('pierre', [['#8f86ad',0],['#756c96',.55],['#5b5379',1]], 1) + lin('pierreS', [['#655c84',0],['#453d60',1]], 1) + lin('pierreL', [['#a9a6cf',0],['#7f7aa8',1]], 1) +
    lin('verre', [['#ffffff',0,.35],['#bff3ff',.45,.12],['#ffffff',1,.25]]) + lin('ciel', [['#070b24',0],['#172258',.6],['#3b3f80',1]], 1) +
    lin('ardoise', [['#39414c',0],['#252b34',1]], 1) + lin('tapis', [['#a9b4c8',0],['#8c98ae',1]], 1) + lin('feutre', [['#35584f',0],['#24403a',1]], 1) +
    lin('cire', [['#fffaf0',0],['#f1e6c8',.6],['#d9c89c',1]]) + lin('parchemin', [['#f6ecd2',0],['#e4d2a6',1]], 1) +
    lin('murOmbre', [['#0a0614',0,.5],['#0a0614',.25,0],['#0a0614',.78,0],['#0a0614',1,.42]], 1) + lin('piedMur', [['#0a0614',0,.55],['#0a0614',1,0]], 1) +
    rad('lueur', [['#ffd88a',0,.34],['#ffb85a',.5,.1],['#ffd88a',1,0]]) + rad('feu', [['#ffb050',0,.55],['#ff7a2a',.45,.2],['#ff7a2a',1,0]]) +
    rad('atre', [['#ff9a3a',0,.75],['#c8421a',.45,.35],['#1a0e14',1,0]]) + rad('lunaire', [['#bcd0ff',0,.2],['#9ab4ff',1,0]]) +
    rad('flamme', [['#fff7c2',0],['#ffc24a',.5],['#ff7a2a',1]], .5, .7, .6) + rad('halo', [['#ffe9a3',0,.6],['#ffd36a',1,0]]) + rad('lune', [['#fff8d0',0,.9],['#fff3b0',.3,.35],['#fff3b0',1,0]]) +
    '<radialGradient id="g-vignette" gradientUnits="userSpaceOnUse" cx="500" cy="330" r="780" gradientTransform="translate(500 330) scale(1 .72) translate(-500 -330)"><stop offset="0" stop-color="#0a0614" stop-opacity="0"/><stop offset=".55" stop-color="#0a0614" stop-opacity="0"/><stop offset=".86" stop-color="#0a0614" stop-opacity=".42"/><stop offset="1" stop-color="#0a0614" stop-opacity=".8"/></radialGradient>' +
    '<pattern id="g-briques" patternUnits="userSpaceOnUse" x="0" y="-2" width="200" height="80">' +
      '<rect x="2" y="2" width="96" height="36" rx="7" fill="#4a3d66"/><rect x="102" y="2" width="96" height="36" rx="7" fill="#51446e"/>' +
      '<rect x="-48" y="42" width="96" height="36" rx="7" fill="#483b63"/><rect x="52" y="42" width="96" height="36" rx="7" fill="#453960"/><rect x="152" y="42" width="96" height="36" rx="7" fill="#483b63"/>' +
      '<path d="M9,6 H91 M109,6 H191 M59,46 H141" stroke="rgba(255,255,255,.08)" stroke-width="2.5" stroke-linecap="round"/><path d="M9,36 H91 M109,36 H191 M59,76 H141" stroke="rgba(0,0,0,.28)" stroke-width="2.5" stroke-linecap="round"/></pattern>' +
    '</defs>';
}
/* Les veines du bois : des lignes un peu tremblées */
function grainBois(x, y, w, h, n, seed, col, a){
  var R0 = rng(seed), s = '', pas = w > 1500 ? 40 : 20;
  for(var i=0;i<n;i++){ var yy = y + (i + .5)*h/n + (R0()-.5)*h/n*.5, ph = R0()*6, am = .8 + R0()*2.2, d = 'M' + f1(x) + ',' + f1(yy);
    for(var xx = x + pas; xx <= x + w; xx += pas) d += ' L' + f1(xx) + ',' + f1(yy + Math.sin(xx/41 + ph)*am);
    s += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (.8 + R0()*1.2).toFixed(1) + '" opacity="' + (a || .3) + '"/>'; }
  return s;
}
function noeud(x, y, r, ap){ ap = ap || .42; return '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + r + '" ry="' + f1(r*ap) + '" fill="none" stroke="#7d4626" stroke-width="1.6" opacity=".55"/><ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + f1(r*.42) + '" ry="' + f1(r*ap*.42) + '" fill="#7d4626" opacity=".45"/>'; }
/* Les veines sur une surface posée à plat (le plateau) : elles suivent la perspective */
function veines3(X0, X1, Y, Z0, Z1, n, seed, col, a){
  var R0 = rng(seed), s = '';
  for(var i=0;i<n;i++){ var z = Z0 + (i + .2 + R0()*.6)*(Z1 - Z0)/n, ph = R0()*6, am = .004 + R0()*.01, pts = [];
    for(var X = X0; X <= X1 + .001; X += .09) pts.push([X, Y, z + Math.sin(X*4.3 + ph)*am]);
    s += '<path d="' + d3(pts, true) + '" fill="none" stroke="' + col + '" stroke-width="' + (.8 + R0()*1).toFixed(1) + '" opacity="' + (a || .3) + '"/>'; }
  return s;
}
/* Petits pictogrammes des six sortes d'échantillons (plaques des tiroirs) */
function picto(k, x, y, t){
  var s = '<g transform="translate(' + f1(x) + ',' + f1(y) + ') scale(' + (t/40) + ')">';
  if(k === 'fils') s += '<circle cx="0" cy="0" r="15" fill="#e8dfca" stroke="' + K + '" stroke-width="3"/>' + T('M-12,-6 C-4,-12 6,-12 13,-5 M-14,2 C-4,-6 6,-6 14,3 M-11,9 C-3,2 6,3 11,10', '#b9a67c', 2.4) + T('M10,11 C18,16 20,8 24,14', K, 5) + T('M10,11 C18,16 20,8 24,14', '#e8dfca', 2.5);
  else if(k === 'poils') s += '<ellipse cx="0" cy="6" rx="9" ry="8" fill="#6b4a2a" stroke="' + K + '" stroke-width="2.5"/>' + [[-11,-5],[-4,-11],[4,-11],[11,-5]].map(function(q){ return '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="4" ry="5" fill="#6b4a2a" stroke="' + K + '" stroke-width="2.5"/>'; }).join('');
  else if(k === 'plumes') s += P('M-13,15 C-16,0 -6,-14 12,-17 C14,-2 4,12 -13,15 Z', '#4a6aa8', ' stroke-width="3"') + T('M-16,18 L10,-14', '#fff', 2) + T('M-7,6 l7,-2 M-3,0 l8,-2 M1,-6 l7,-2', '#1b1d2b', 1.4);
  else if(k === 'petales') s += [0,72,144,216,288].map(function(a){ return '<ellipse cx="0" cy="-10" rx="6.5" ry="9" fill="#e8343c" stroke="' + K + '" stroke-width="2.5" transform="rotate(' + a + ')"/>'; }).join('') + '<circle cx="0" cy="0" r="4.5" fill="#f5c842" stroke="' + K + '" stroke-width="2"/>';
  else if(k === 'feuilles') s += P('M-15,12 C-14,-8 2,-18 16,-14 C18,2 6,16 -15,12 Z', '#6fae5a', ' stroke-width="3"') + T('M-15,13 L12,-11 M-5,4 l1,-9 M1,-2 l1,-8 M-4,4 l9,1 M2,-2 l8,1', '#2f6a3a', 1.5);
  else s += P('M-16,8 L-10,-4 L0,-6 L4,6 L-6,13 Z', '#8a84a0', ' stroke-width="3"') + P('M2,-2 L10,-12 L18,-4 L15,8 L5,8 Z', '#b08a5a', ' stroke-width="3"') + '<circle cx="-2" cy="-13" r="4" fill="#1a1514" stroke="' + K + '" stroke-width="2"/>';
  return s + '</g>';
}
