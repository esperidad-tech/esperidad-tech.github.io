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

/* ============ La vue : on est penché sur la paillasse, comme dans l'atelier du jeu (l'œil est haut : on voit le dessus des pots) ============
   Le plateau va du bord avant (y = YF, à l'échelle 1) au fond (y = YB). Tout ce qui s'éloigne fuit vers le même point (600, VY),
   très haut au-dessus de l'image. Un objet posé à la hauteur d'écran y est dessiné à l'échelle kY(y). */
var VW = 1200, VH = 640, VY = -620, YF = 478, YB = 236, EL = .485;
var LARG = 690;    /* la demi-largeur du plateau, au bord avant : la paillasse est longue, comme dans l'atelier (elle peut sortir de l'écran) */
var YBOC = 188;   /* la hauteur d'écran où sont posés les bocaux, sur leur petite étagère surélevée */
function kY(y){ return (y - VY)/(YF - VY); }
function xP(X, y){ return 600 + X*kY(y); }
function yT(t){ return VY + (YF - VY)/(1 + t*.2827); }

/* ============ Les styles de l'atelier : ce que le joueur a choisi dans le jeu (ici, deux boutons 🎨 pour essayer) ============
   La paillasse : 5 formes × 8 couleurs, comme dans le jeu. Le mur du fond : 5 motifs × 8 couleurs, comme dans le jeu. */
var THEMES = [{nom:'naturel', c:'#c98450'}, {nom:'violet', c:'#8d5cf0'}, {nom:'jaune', c:'#f2c230'}, {nom:'rose', c:'#f06eaa'}, {nom:'vert', c:'#4cbb5c'}, {nom:'bleu', c:'#3d8ef0'}, {nom:'rouge', c:'#e0443a'}, {nom:'orange', c:'#f58a2a'}];
var FORMES_PA = ['établi de bois', 'comptoir de pierre', 'marbre et or', 'meuble à tiroirs', 'tréteaux'], FORMES_MUR = ['pierres', 'rayures', 'étoiles', 'boiseries', 'fleurs'];
var ST = {paF:0, paT:0, murF:0, murT:0};
try { var stS = JSON.parse(localStorage.getItem('brumeval-labo-style') || 'null'); if(stS) for(var cleS in ST) if(typeof stS[cleS] === 'number') ST[cleS] = stS[cleS]; } catch(e){}
function gardeStyle(){ try { localStorage.setItem('brumeval-labo-style', JSON.stringify(ST)); } catch(e){} }
function paletteBois(){
  var c = THEMES[ST.paT].c;
  if(!ST.paT) return {H:['#e9bb80','#d9a066','#c48850'], C:['#ecb882','#c98450','#9a5c31'], V:['#c98450','#a5653a','#7d4626'], S:['#94603a','#62381d'], F:['#8a5530','#6b3d1f','#4f2a14'], veine:'#8a5530', joint:'#a5653a'};
  return {H:[clair(c,.5), clair(c,.3), clair(c,.12)], C:[clair(c,.42), clair(c,.05), sombre(c,.22)], V:[clair(c,.08), sombre(c,.12), sombre(c,.32)], S:[sombre(c,.22), sombre(c,.5)], F:[sombre(c,.28), sombre(c,.42), sombre(c,.58)], veine:sombre(c,.38), joint:sombre(c,.25)};
}
function palettePlateau(){
  var c = THEMES[ST.paT].c, b = paletteBois(), t = ST.paT;
  if(ST.paF === 1) return {g:[t ? melange('#c9c4dc', c, .3) : '#c4bfd8', t ? melange('#a6a0bd', c, .3) : '#a6a0bd', t ? melange('#8d87a6', c, .3) : '#8d87a6'], sorte:'pierre', joint:'rgba(40,30,70,.35)'};
  /* le marbre prend la couleur choisie : un marbre rose, vert, bleu… avec ses veines plus foncées (blanc veiné de gris en « naturel ») */
  if(ST.paF === 2) return {g:[t ? melange('#fbf9fd', c, .3) : '#fbf9fd', t ? melange('#efeaf6', c, .42) : '#efeaf6', t ? melange('#d9d3ea', c, .52) : '#d9d3ea'], sorte:'marbre', joint:t ? sombre(c, .18) : '#8f88b0', veine2:t ? clair(c, .7) : '#ffffff'};
  return {g:b.H, sorte:ST.paF === 4 ? 'planches' : 'bois', joint:b.joint};
}
function couleursMur(){ var c = THEMES[ST.murT].c; return ST.murT ? [melange(c, '#3a2c5a', .2), melange(c, '#3a2c5a', .34), melange(c, '#3a2c5a', .48)] : ['#5a4c7c', '#4a3d68', '#3d3158']; }

function defs(){
  var b = paletteBois(), p = palettePlateau(), m = couleursMur(), or = ST.paF === 2;
  function v3(id, a){ return lin(id, [[a[0],0],[a[1],.5],[a[2] || a[1],1]], 1); }
  return '<defs><filter id="flou" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><filter id="flou2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>' +
    '<filter id="flou9" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>' +
    /* le bois (des outils : toujours naturel) */
    lin('bois', [['#d99a5e',0],['#b06f3e',.55],['#7d4626',1]]) + lin('boisV', [['#c98450',0],['#a5653a',.5],['#7d4626',1]], 1) + lin('boisC', [['#ecb882',0],['#c98450',.6],['#9a5c31',1]], 1) +
    lin('boisH', [['#e9bb80',0],['#d9a066',.45],['#c48850',1]], 1) + lin('boisS', [['#94603a',0],['#62381d',1]], 1) +
    /* la paillasse choisie : son plateau, son chant, son tablier, ses tiroirs */
    v3('pPlateau', p.g) + (p.sorte === 'bois' || p.sorte === 'planches' ? lin('pChant', [[b.S[0],0],[b.S[1],1]], 1) : lin('pChant', [[sombre(p.g[2], .08),0],[sombre(p.g[2], .3),1]], 1)) +
    (or ? lin('pTablier', [['#fff1b8',0],['#f5b945',.5],['#b07a1c',1]], 1) : v3('pTablier', b.V)) + (or ? lin('pTiroir', [[melange('#fdfbff', THEMES[ST.paT].c, ST.paT ? .2 : 0),0],[melange('#efeaf6', THEMES[ST.paT].c, ST.paT ? .34 : 0),.6],[melange('#d6d0e8', THEMES[ST.paT].c, ST.paT ? .46 : 0),1]], 1) : v3('pTiroir', b.C)) + v3('pFonce', b.F) + v3('pInterieur', [b.F[0], b.F[1], b.F[2]]) +
    lin('laiton', [['#9a6516',0],['#f5c45a',.32],['#fff1b8',.45],['#e0a23a',.62],['#8a5a12',1]]) + lin('laitonV', [['#fff1b8',0],['#f5b945',.5],['#b07a1c',1]], 1) +
    lin('fer', [['#2a2538',0],['#5f5872',.35],['#3a3450',.6],['#1c1828',1]]) + lin('cuir', [['#dcbb92',0],['#cda77a',.55],['#b98d5e',1]], 1) +
    lin('ardoise', [['#39414c',0],['#252b34',1]], 1) + lin('feutre', [['#35584f',0],['#24403a',1]], 1) + lin('cire', [['#fffaf0',0],['#f1e6c8',.6],['#d9c89c',1]]) + lin('parchemin', [['#f6ecd2',0],['#e4d2a6',1]], 1) +
    '<linearGradient id="g-mur" gradientUnits="userSpaceOnUse" x1="0" y1="-200" x2="0" y2="470"><stop offset="0" stop-color="' + m[0] + '"/><stop offset=".6" stop-color="' + m[1] + '"/><stop offset="1" stop-color="' + m[2] + '"/></linearGradient>' +
    lin('piedMur', [['#0a0614',0,.5],['#0a0614',1,0]], 1) + lin('dessous', [['#0a0614',0,.55],['#0a0614',1,0]], 1) +
    rad('lueur', [['#ffd88a',0,.3],['#ffb85a',.5,.1],['#ffd88a',1,0]]) + rad('flamme', [['#fff7c2',0],['#ffc24a',.5],['#ff7a2a',1]], .5, .7, .6) + rad('halo', [['#ffe9a3',0,.6],['#ffd36a',1,0]]) +
    '<radialGradient id="g-vignette" gradientUnits="userSpaceOnUse" cx="600" cy="330" r="900" gradientTransform="translate(600 330) scale(1 .66) translate(-600 -330)"><stop offset="0" stop-color="#0a0614" stop-opacity="0"/><stop offset=".6" stop-color="#0a0614" stop-opacity="0"/><stop offset="1" stop-color="#0a0614" stop-opacity=".5"/></radialGradient>' +
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
function noeud(x, y, r, ap){ ap = ap || .42; return '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + r + '" ry="' + f1(r*ap) + '" fill="none" stroke="rgba(60,30,10,.5)" stroke-width="1.6"/><ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + f1(r*.42) + '" ry="' + f1(r*ap*.42) + '" fill="rgba(60,30,10,.4)"/>'; }
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
