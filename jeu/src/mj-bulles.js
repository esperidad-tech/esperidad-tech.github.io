/* ==========================================================
   Brumeval v2 — LES BULLES MAGIQUES (Alchimiste), version 2.
   Ce fichier est chargé APRÈS mj-pisteur-alchi.js et ré-enregistre
   MJ.enregistrer('bulles', …) : il remplace l'ancienne version.

   D'après les essais de Romain dans la salle d'entraînement :
   - les bulles ne changent JAMAIS de place d'un coup. Elles dérivent
     très lentement en ligne droite, rebondissent doucement sur les bords
     et les unes sur les autres. Pas de boucle, pas de téléportation.
     La dérive fait la difficulté : qui répond vite les retrouve presque
     au même endroit, qui réfléchit longtemps les voit se mélanger ;
   - 4 manches façon « Simon » : la même suite s'allonge d'une bulle à
     chaque manche (3, 4, 5 puis 6 bulles au niveau de référence 10) ;
   - 3 vies pour toute la partie. Une erreur coûte une vie, sans montrer
     la réponse et sans recommencer : on reste sur la même bulle et on
     réessaie. Plus de vies : raté ;
   - chaque manche réussie fait tomber de petits ingrédients des bulles
     dans le chaudron, qui change de couleur ; après la 4e manche il
     devient arc-en-ciel.
   Niveau de référence : n = 10 (MJ.CALIBRAGE ramène les enquêtes à 10).
   n = 1…9 : versions plus douces pour régler (moins de bulles, dérive plus
   lente, suite montrée plus lentement, une ou deux vies de plus au début).
   Mods : erreurs (+N vies), zone (bulles plus grosses), lent (dérive plus
   lente, ex. 0.8), temps (+N : dérive un peu plus lente aussi), eclate (N
   bulles inutiles éclatent, une au début des manches 2, 3 et 4), aide (N
   indices : le bouton 💡 fait briller la prochaine bulle à toucher),
   revele (la prochaine bulle brille toujours), facile (géré par le cœur).
   Aucune lecture à voix haute ici ; seulement de petits sons MJ.util.son.
   Crochet de test : window.__bulles (phase, suite, positions…).
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.util){ console.error('mj-bulles : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util;
var NS = 'http://www.w3.org/2000/svg';
var CONTOUR = '#24182e';
var uid = 0;
function nid(p){ uid++; return (p || 'mjbu') + uid; }

/* ---------- Petits outils ---------- */
function fixe(v, a, b){ return Math.max(a, Math.min(b, v)); }
function lisse(t){ t = fixe(t, 0, 1); return t * t * (3 - 2 * t); }
function f2(v){ return String(Math.round(v * 100) / 100); }
/* Courbe par points d'appui : courbe(n, {1:a, 6:b, 10:c}) — interpolation linéaire, bornée aux extrémités. */
function courbe(n, pts){
  var ks = Object.keys(pts).map(Number).sort(function(a, b){ return a - b; });
  if(n <= ks[0]) return pts[ks[0]];
  for(var i = 1; i < ks.length; i++){
    if(n <= ks[i]){ var a = ks[i - 1], b = ks[i]; return pts[a] + (pts[b] - pts[a]) * (n - a) / (b - a); }
  }
  return pts[ks[ks.length - 1]];
}
function svgNoeud(tag, attrs, parent){
  var n = document.createElementNS(NS, tag);
  if(attrs) for(var k in attrs) n.setAttribute(k, attrs[k]);
  if(parent) parent.appendChild(n);
  return n;
}
function ptSVG(svg, e){
  var m = svg.getScreenCTM(); if(!m) return {x:0, y:0};
  var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  var r = pt.matrixTransform(m.inverse());
  return {x:r.x, y:r.y};
}
function versEcran(svg, x, y){
  var m = svg.getScreenCTM(); if(!m) return {x:0, y:0};
  var pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
  var r = pt.matrixTransform(m);
  return {x:r.x, y:r.y};
}
function hexRgb(h){ h = String(h).replace('#', ''); if(h.length === 3) h = h.replace(/./g, '$&$&'); var v = parseInt(h, 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
function mixRgb(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function rgbTxt(c){ return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
function teinte(hex, vers, t){ return rgbTxt(mixRgb(hexRgb(hex), hexRgb(vers), t)); }
/* Relance une animation CSS portée par une classe. */
function relancer(n, cls){ n.classList.remove(cls); void n.getBoundingClientRect(); n.classList.add(cls); }

/* Gestion d'une partie : une boucle, des minuteurs et des écouteurs nettoyés d'un coup. */
function Partie(fin){
  var p = {fini:false, fermeture:false, stops:[], timers:[]};
  p.boucle = function(fn){ var s = U.boucle(function(dt, t){ if(p.fini) return false; return fn(dt, t); }); p.stops.push(s); return s; };
  p.apres = function(ms, fn){ var t = setTimeout(function(){ if(!p.fini) fn(); }, ms); p.timers.push(t); return t; };
  p.ecoute = function(cible, type, fn, opt){ cible.addEventListener(type, fn, opt); p.stops.push(function(){ cible.removeEventListener(type, fn, opt); }); };
  p.nettoyer = function(){ p.stops.forEach(function(f){ try{ f(); }catch(e){} }); p.stops = []; p.timers.forEach(clearTimeout); p.timers = []; };
  p.terminer = function(res){ if(p.fini) return; p.fini = true; p.nettoyer(); fin(res); };
  /* Termine après une petite pause (le temps de voir l'animation finale). */
  p.finir = function(res, ms){ if(p.fini || p.fermeture) return; p.fermeture = true; p.apres(ms, function(){ p.terminer(res); }); };
  p.arreter = function(){ p.fini = true; p.nettoyer(); };
  return p;
}

/* ---------- Dessins ---------- */
var BULLES = [
  {c:'#e5484d', s:'<path d="M0,9 C-10,2 -12,-4 -8,-8 C-5,-11 -1,-10 0,-6 C1,-10 5,-11 8,-8 C12,-4 10,2 0,9 Z"/>'},
  {c:'#3f7fe0', s:'<path d="M0,-12 C6,-4 9,1 9,4 C9,9 5,12 0,12 C-5,12 -9,9 -9,4 C-9,1 -6,-4 0,-12 Z"/>'},
  {c:'#f6d23a', s:'<path d="M0,-11 L3,-3 L11,-3 L5,2 L7,10 L0,5 L-7,10 L-5,2 L-11,-3 L-3,-3 Z"/>'},
  {c:'#4fbf6a', s:'<path d="M-9,9 C-11,-4 -2,-11 10,-10 C11,2 4,10 -9,9 Z M-9,9 L4,-4"/>'},
  {c:'#9d6ee3', s:'<path d="M4,-11 C-6,-10 -11,-2 -9,5 C-7,11 2,13 8,9 C1,8 -4,2 -2,-5 C-1,-8 1,-10 4,-11 Z"/>'},
  {c:'#f08a3c', s:'<path d="M0,12 C-8,10 -10,2 -6,-4 C-6,0 -3,1 -2,0 C-4,-6 0,-10 3,-12 C3,-6 9,-3 8,4 C8,9 4,12 0,12 Z"/>'},
  {c:'#ef7fa8', s:'<path d="M0,-11 L3,-4 L10,-6 L5,0 L10,6 L3,4 L0,11 L-3,4 L-10,6 L-5,0 L-10,-6 L-3,-4 Z"/>'},
  {c:'#8ff3ff', s:'<path d="M0,-11 L9,0 L0,11 L-9,0 Z"/>'}
];
var LIQ0 = '#6d6394';                                  /* potion de départ : grise-mauve */
var LIQ_MANCHES = ['#3fd6c0', '#ff7fbf', '#ffc94a'];   /* après les manches 1, 2, 3 ; la 4e : arc-en-ciel */
var ARC = ['#ff5b6e', '#ffa43a', '#ffe14d', '#5fdc7a', '#4fb6ff', '#9d7bff'];
var COEUR = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 C5 15 1.5 11.2 1.5 7 C1.5 3.8 4 1.5 7 1.5 C9.1 1.5 10.9 2.7 12 4.5 C13.1 2.7 14.9 1.5 17 1.5 C20 1.5 22.5 3.8 22.5 7 C22.5 11.2 19 15 12 20.5 Z"/></svg>';
var MAIN = '<g class="mjbu-main"><circle class="mjbu-onde" r="13" cx="0" cy="0"/>' +
  '<g transform="scale(.62) rotate(-12)"><path d="M-5,4 C-5,-4 5,-4 5,4 L5,24 C9,21 15,22 16,27 C19,25 24,27 24,32 C27,31 31,34 30,40 L28,54 C27,60 21,64 13,64 L1,64 C-7,64 -11,59 -13,52 L-20,34 C-22,28 -16,25 -12,30 L-5,39 Z" fill="#ffe0c2" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
  '<path d="M5,30 L5,40 M16,31 L16,41" stroke="' + CONTOUR + '" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g></g>';

function gradBulle(id, c){
  return '<radialGradient id="' + id + '" cx=".38" cy=".32" r=".78">' +
    '<stop offset="0" stop-color="' + teinte(c, '#ffffff', 0.55) + '"/>' +
    '<stop offset=".5" stop-color="' + c + '"/>' +
    '<stop offset="1" stop-color="' + teinte(c, '#000000', 0.32) + '"/></radialGradient>';
}
function bulleSVG(def, r, grad){
  var k = r / 34 * 1.3, hx = -r * 0.34, hy = -r * 0.4;
  return '<g class="mjbu-sq"><g class="mjbu-tr"><g class="mjbu-corps">' +
    '<circle class="mjbu-halo" r="' + f2(r + 12) + '" fill="' + def.c + '"/>' +
    '<circle class="mjbu-anneau" r="' + f2(r + 7) + '"/>' +
    '<circle class="mjbu-disque" r="' + f2(r) + '" fill="url(#' + grad + ')" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<ellipse cx="' + f2(hx) + '" cy="' + f2(hy) + '" rx="' + f2(r * 0.27) + '" ry="' + f2(r * 0.16) + '" fill="#fff" opacity=".62" transform="rotate(-28 ' + f2(hx) + ' ' + f2(hy) + ')"/>' +
    '<circle cx="' + f2(r * 0.42) + '" cy="' + f2(r * 0.38) + '" r="' + f2(r * 0.07) + '" fill="#fff" opacity=".4"/>' +
    '<g transform="scale(' + f2(k) + ')" fill="#fff" stroke="' + CONTOUR + '" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' + def.s + '</g>' +
    '<circle class="mjbu-ombre" r="' + f2(r + 2) + '"/>' +
    '<circle class="mjbu-flash" r="' + f2(r) + '"/>' +
  '</g></g></g>';
}
function chaudronDefs(id){
  return '<linearGradient id="' + id + 'c" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#4a4166"/><stop offset=".55" stop-color="#2b2540"/><stop offset="1" stop-color="#17131f"/></linearGradient>' +
    '<radialGradient id="' + id + 'l" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + id + 'g" cx=".5" cy=".62" r=".5"><stop class="mjbu-lueur-c" offset="0" stop-color="' + LIQ0 + '" stop-opacity=".55"/><stop class="mjbu-lueur-c" offset="1" stop-color="' + LIQ0 + '" stop-opacity="0"/></radialGradient>' +
    '<clipPath id="' + id + 'k"><ellipse cx="0" cy="-15" rx="72" ry="14"/></clipPath>';
}
/* Chaudron vu de face, centré sur le bord (y = -16), bas des braises vers y = 73. */
function chaudronSVG(id){
  var arcs = '', nb = 12, R = 96;
  for(var i = 0; i < nb; i++){
    var a0 = i / nb * Math.PI * 2, a1 = (i + 1) / nb * Math.PI * 2;
    arcs += '<path d="M0,0 L' + f2(Math.cos(a0) * R) + ',' + f2(Math.sin(a0) * R) + ' A' + R + ',' + R + ' 0 0 1 ' + f2(Math.cos(a1) * R) + ',' + f2(Math.sin(a1) * R) + ' Z" fill="' + ARC[i % ARC.length] + '"/>';
  }
  return '<g class="mjbu-chaudron">' +
    '<ellipse class="mjbu-lueur" cx="0" cy="-34" rx="130" ry="78" fill="url(#' + id + 'g)"/>' +
    '<g class="mjbu-vapeur"><path d="M-26,-40 C-42,-66 -12,-84 -28,-112"/><path d="M28,-40 C44,-66 14,-84 30,-112"/></g>' +
    '<g class="mjbu-feu"><path class="mjbu-flamme f1" d="M-46,62 C-56,40 -38,30 -40,12 C-28,26 -22,36 -24,62 Z"/><path class="mjbu-flamme f2" d="M-14,62 C-26,34 -4,22 -6,0 C10,20 14,38 8,62 Z"/><path class="mjbu-flamme f3" d="M24,62 C16,40 34,30 30,14 C44,28 50,44 40,62 Z"/><ellipse class="mjbu-braises" cx="0" cy="64" rx="62" ry="9"/></g>' +
    '<path d="M-58,40 L-66,58 M58,40 L66,58" stroke="' + CONTOUR + '" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M-78,-14 C-84,30 -50,56 0,56 C50,56 84,30 78,-14 Z" fill="url(#' + id + 'c)" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M-62,4 C-60,26 -40,40 -18,44" stroke="#8a7fb8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>' +
    '<ellipse cx="0" cy="-16" rx="84" ry="20" fill="#3a3352" stroke="' + CONTOUR + '" stroke-width="5"/>' +
    '<g clip-path="url(#' + id + 'k)">' +
      '<ellipse class="mjbu-liquide" cx="0" cy="-15" rx="72" ry="14" fill="' + LIQ0 + '"/>' +
      '<g class="mjbu-arc" opacity="0"><g transform="translate(0,-15) scale(1,.19)"><g class="mjbu-arc-rot">' + arcs + '</g></g></g>' +
      '<g transform="translate(0,-15) scale(1,.19)"><g class="mjbu-remous"><path d="M-58,-12 C-42,-52 30,-62 52,-26 M-30,32 C0,58 52,42 64,4 M-14,-6 C-2,-22 22,-16 22,2" stroke="#fff" stroke-opacity=".42" stroke-width="8" fill="none" stroke-linecap="round"/></g></g>' +
      '<ellipse cx="0" cy="-15" rx="72" ry="14" fill="url(#' + id + 'l)"/>' +
    '</g>' +
    '<g class="mjbu-ch-bulles"></g>' +
  '</g>';
}

/* ---------- Habillage : le petit labo de l'Alchimiste (même style que l'atelier) ----------
   Un SVG fixe, DERRIÈRE le calque des bulles (il ne se redessine qu'au changement de taille). */
function dR(x, y, w, h, rx, f, sw){ return '<rect x="' + f2(x) + '" y="' + f2(y) + '" width="' + f2(w) + '" height="' + f2(h) + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + CONTOUR + '" stroke-width="' + (sw || 2.5) + '"/>'; }
function dP(d, f, sw){ return '<path d="' + d + '" fill="' + f + '" stroke="' + CONTOUR + '" stroke-width="' + (sw || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"/>'; }
function dT(d, c, w, op){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op ? ' opacity="' + op + '"' : '') + '/>'; }
function dLin(id, st, vert){
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' +
    st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>';
}
/* Petit hasard reproductible : le décor reste le même quand on le redessine. */
function alea(graine){ var s = Math.abs(Math.round(graine)) % 2147483646 + 1; return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
var POTS = ['#5fdc7a', '#ff7f9e', '#7cc4ff', '#ffd36a', '#b48cff', '#ff9a4a', '#8ff3ff'];
var LIVRES = ['#7a2a3a', '#2f6b5a', '#3f4f9a', '#9a6a2a', '#6b3f8a', '#2a5a7a'];
function bocal(G, cx, b, c){
  return '<rect x="' + f2(cx - 7) + '" y="' + f2(b - 15) + '" width="14" height="13" rx="4" fill="' + c + '" opacity=".85"/>' +
    dR(cx - 9, b - 24, 18, 24, 6, G('verre')) + dR(cx - 8, b - 29, 16, 6, 2, G('cu'), 2) + dT('M' + f2(cx - 4) + ',' + f2(b - 19) + ' V' + f2(b - 6), '#fff', 2, 0.55);
}
function fiole(G, cx, b, c){
  return '<circle cx="' + f2(cx) + '" cy="' + f2(b - 8) + '" r="6.5" fill="' + c + '" opacity=".85"/>' +
    dP('M' + f2(cx - 3) + ',' + f2(b - 26) + ' L' + f2(cx + 3) + ',' + f2(b - 26) + ' L' + f2(cx + 3) + ',' + f2(b - 16) + ' C' + f2(cx + 11) + ',' + f2(b - 13) + ' ' + f2(cx + 11) + ',' + f2(b) + ' ' + f2(cx) + ',' + f2(b) +
      ' C' + f2(cx - 11) + ',' + f2(b) + ' ' + f2(cx - 11) + ',' + f2(b - 13) + ' ' + f2(cx - 3) + ',' + f2(b - 16) + ' Z', G('verre')) +
    dR(cx - 3, b - 31, 6, 6, 1.5, '#c58a4a', 2);
}
function livres(rnd, x, b){
  var s = '', cx = x;
  for(var i = 0; i < 3; i++){ var w = 5 + Math.round(rnd() * 2), h = 17 + Math.round(rnd() * 8); s += dR(cx, b - h, w, h, 1.5, LIVRES[Math.floor(rnd() * LIVRES.length)], 2) + dT('M' + f2(cx + 1.5) + ',' + f2(b - h + 4) + ' H' + f2(cx + w - 1.5), '#ffe3a3', 1.2, 0.7); cx += w + 0.5; }
  return {s:s, w:cx - x};
}
function bougie(G, cx, b){
  return '<circle cx="' + f2(cx) + '" cy="' + f2(b - 18) + '" r="14" fill="url(#' + G.id + 'hl)"/>' +
    dR(cx - 3.5, b - 12, 7, 12, 2, '#f6ecd2', 2) +
    '<path class="mjbu-bougie" d="M' + f2(cx) + ',' + f2(b - 12) + ' c-3,-4 -2,-8 0,-11 c2,3 3,7 0,11 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="1.2"/>';
}
/* Une planche avec ses bocaux, fioles, livres et bougies ; b = dessus de la planche. */
function etagere(G, rnd, x, b, w){
  var s = '', cx = x + 7;
  while(cx < x + w - 20){
    var r = rnd(), larg;
    if(r < 0.42){ larg = 18; s += bocal(G, cx + 9, b, POTS[Math.floor(rnd() * POTS.length)]); }
    else if(r < 0.64){ larg = 18; s += fiole(G, cx + 9, b, POTS[Math.floor(rnd() * POTS.length)]); }
    else if(r < 0.9){ var l = livres(rnd, cx, b); larg = l.w; s += l.s; }
    else { larg = 10; s += bougie(G, cx + 5, b); }
    cx += larg + 3 + rnd() * 5;
  }
  return s + dP('M' + f2(x + 8) + ',' + f2(b + 7) + ' L' + f2(x + 22) + ',' + f2(b + 7) + ' L' + f2(x + 8) + ',' + f2(b + 20) + ' Z', G('bS'), 2) +
    dP('M' + f2(x + w - 8) + ',' + f2(b + 7) + ' L' + f2(x + w - 22) + ',' + f2(b + 7) + ' L' + f2(x + w - 8) + ',' + f2(b + 20) + ' Z', G('bS'), 2) +
    dR(x, b, w, 8, 2.5, G('bH')) + dT('M' + f2(x + 5) + ',' + f2(b + 2.5) + ' H' + f2(x + w - 5), '#fff', 1.6, 0.38);
}
function fenetre(G, cx, ty, w, h){
  var x0 = cx - w / 2, x1 = cx + w / 2, r = w / 2, yb = ty + h, ya = ty + r;
  var d = 'M' + f2(x0) + ',' + f2(yb) + ' V' + f2(ya) + ' A' + f2(r) + ',' + f2(r) + ' 0 0 1 ' + f2(x1) + ',' + f2(ya) + ' V' + f2(yb) + ' Z';
  var mx = cx + w * 0.2, my = ty + r * 0.75, s = '<clipPath id="' + G.id + 'fen"><path d="' + d + '"/></clipPath>';
  s += '<g clip-path="url(#' + G.id + 'fen)"><rect x="' + f2(x0) + '" y="' + f2(ty) + '" width="' + f2(w) + '" height="' + f2(h) + '" fill="' + G('ciel') + '"/>' +
    '<circle cx="' + f2(mx) + '" cy="' + f2(my) + '" r="' + f2(w * 0.32) + '" fill="url(#' + G.id + 'hl)"/><circle cx="' + f2(mx) + '" cy="' + f2(my) + '" r="' + f2(w * 0.14) + '" fill="#fff4cf"/>' +
    '<circle cx="' + f2(mx + w * 0.05) + '" cy="' + f2(my - w * 0.03) + '" r="' + f2(w * 0.035) + '" fill="#f0e2b0"/>';
  [[0.18, 0.32], [0.3, 0.62], [0.78, 0.66], [0.14, 0.78], [0.55, 0.2]].forEach(function(q, i){ s += '<circle class="mjbu-etoile-f" cx="' + f2(x0 + q[0] * w) + '" cy="' + f2(ty + q[1] * h) + '" r="1.4" fill="#fff" style="animation-delay:-' + i * 0.7 + 's"/>'; });
  s += '<path d="M' + f2(x0) + ',' + f2(yb) + ' L' + f2(x0) + ',' + f2(yb - h * 0.16) + ' C' + f2(x0 + w * 0.15) + ',' + f2(yb - h * 0.22) + ' ' + f2(x0 + w * 0.25) + ',' + f2(yb - h * 0.3) + ' ' + f2(x0 + w * 0.38) + ',' + f2(yb - h * 0.22) +
    ' C' + f2(x0 + w * 0.5) + ',' + f2(yb - h * 0.3) + ' ' + f2(x0 + w * 0.68) + ',' + f2(yb - h * 0.27) + ' ' + f2(x0 + w * 0.8) + ',' + f2(yb - h * 0.19) + ' L' + f2(x1) + ',' + f2(yb - h * 0.21) + ' L' + f2(x1) + ',' + f2(yb) + ' Z" fill="#141a3a"/>' +
    '<rect class="mjbu-brume-f" x="' + f2(x0 - w * 0.4) + '" y="' + f2(yb - h * 0.13) + '" width="' + f2(w * 1.8) + '" height="' + f2(h * 0.14) + '" rx="' + f2(h * 0.07) + '" fill="rgba(200,210,255,.2)"/></g>';
  s += '<path d="' + d + '" fill="none" stroke="' + CONTOUR + '" stroke-width="9"/><path d="' + d + '" fill="none" stroke="#8a5a3a" stroke-width="4.5"/>' +
    dT('M' + f2(cx) + ',' + f2(ty + 3) + ' V' + f2(yb) + ' M' + f2(x0 + 2) + ',' + f2(ya + h * 0.12) + ' H' + f2(x1 - 2), CONTOUR, 6) +
    dT('M' + f2(cx) + ',' + f2(ty + 3) + ' V' + f2(yb) + ' M' + f2(x0 + 2) + ',' + f2(ya + h * 0.12) + ' H' + f2(x1 - 2), '#8a5a3a', 3) +
    dR(x0 - 9, yb - 3, w + 18, 9, 3, G('bH'));
  return s;
}
function herbes(G, x, y0, long){
  var y = y0 + long;
  return dT('M' + f2(x) + ',' + f2(y0) + ' V' + f2(y), '#c9a874', 1.6) +
    dP('M' + f2(x) + ',' + f2(y) + ' C' + f2(x - 13) + ',' + f2(y + 10) + ' ' + f2(x - 11) + ',' + f2(y + 26) + ' ' + f2(x - 4) + ',' + f2(y + 32) + ' C' + f2(x - 4) + ',' + f2(y + 20) + ' ' + f2(x - 3) + ',' + f2(y + 10) + ' ' + f2(x) + ',' + f2(y) + ' Z', '#4f9a5c', 2) +
    dP('M' + f2(x) + ',' + f2(y) + ' C' + f2(x + 13) + ',' + f2(y + 10) + ' ' + f2(x + 11) + ',' + f2(y + 26) + ' ' + f2(x + 4) + ',' + f2(y + 32) + ' C' + f2(x + 4) + ',' + f2(y + 20) + ' ' + f2(x + 3) + ',' + f2(y + 10) + ' ' + f2(x) + ',' + f2(y) + ' Z', '#6dbb6a', 2) +
    dP('M' + f2(x) + ',' + f2(y) + ' C' + f2(x - 5) + ',' + f2(y + 14) + ' ' + f2(x + 5) + ',' + f2(y + 28) + ' ' + f2(x) + ',' + f2(y + 36) + ' C' + f2(x - 5) + ',' + f2(y + 28) + ' ' + f2(x + 5) + ',' + f2(y + 14) + ' ' + f2(x) + ',' + f2(y) + ' Z', '#8fd27a', 2) +
    dR(x - 5, y - 1, 10, 5, 2, '#c94a3a', 1.8);
}
/* Le décor complet pour la vue vb, l'arène A (où flottent les bulles), le sol à y = F
   et le chaudron (cx, base des braises). o.simple : version légère pour la démo. */
function decorSVG(id, vb, A, F, ch, o){
  o = o || {};
  var G = function(n){ return 'url(#' + id + n + ')'; }; G.id = id;
  var x0 = vb.x, x1 = vb.x + vb.w, y0 = vb.y, y1 = vb.y + vb.h, k = o.k || 1, C = o.cx || 180;
  var rnd = alea(Math.round(vb.w * 7 + vb.h * 13));
  var s = '<defs>' +
    dLin(id + 'mur', [['#2b2148', 0], ['#3e2f5f', 0.6], ['#4a3868', 1]], 1) +
    dLin(id + 'sol', [['#6b3f24', 0], ['#8a5634', 0.45], ['#5c341d', 1]], 1) +
    dLin(id + 'solO', [['#140c18', 0, 0.6], ['#140c18', 1, 0]], 1) +
    dLin(id + 'bS', [['#94603a', 0], ['#62381d', 1]]) +
    dLin(id + 'bH', [['#f3c991', 0], ['#d29a5e', 1]], 1) +
    dLin(id + 'ciel', [['#0d1433', 0], ['#26306a', 0.7], ['#4b3f86', 1]], 1) +
    dLin(id + 'verre', [['#ffffff', 0, 0.55], ['#bff3ff', 0.45, 0.16], ['#ffffff', 1, 0.32]]) +
    dLin(id + 'cu', [['#ffcf9a', 0], ['#e08a4a', 0.5], ['#94481f', 1]]) +
    dLin(id + 'pierre', [['#a9a5c6', 0], ['#77729c', 0.6], ['#524d75', 1]]) +
    '<radialGradient id="' + id + 'hl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d8" stop-opacity=".6"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>' +
  '</defs>';
  /* le mur de briques arrondies */
  s += '<rect x="' + f2(x0) + '" y="' + f2(y0) + '" width="' + f2(vb.w) + '" height="' + f2(F - y0) + '" fill="' + G('mur') + '"/>';
  var bw = 62 * k, bh = 32 * k, br = '';
  for(var r = 0, y = F - bh; y > y0 - bh; r++, y -= bh){
    for(var x = C - bw * 10 - (r % 2) * bw / 2; x < x1; x += bw){ if(x + bw < x0) continue; br += '<rect x="' + f2(x + 2) + '" y="' + f2(y + 2) + '" width="' + f2(bw - 4) + '" height="' + f2(bh - 4) + '" rx="' + f2(9 * k) + '"/>'; }
  }
  s += '<g fill="rgba(255,255,255,.035)" stroke="rgba(10,6,20,.32)" stroke-width="' + f2(2 * k) + '">' + br + '</g>';
  /* la fenêtre de nuit, au fond */
  var aH = A.y1 - A.y0, fw = Math.min(o.simple ? 52 : 104, (A.x1 - A.x0) * 0.32), fh = Math.min(o.simple ? 62 : 158, aH * 0.46);
  s += fenetre(G, C, A.y0 + (o.simple ? 6 : 16), fw, Math.max(fh, fw * 0.9));
  if(!o.simple){
    /* étagères : grandes bibliothèques sur les côtés s'il y a la place (paysage), sinon deux planches au mur */
    var sw = (vb.w - (A.x1 - A.x0)) / 2;
    if(sw >= 70){
      [[x0 + 6, sw - 12], [x1 - sw + 6, sw - 12]].forEach(function(c){
        s += dR(c[0], y0 + 26, 8, F - y0 - 26, 2, G('bS')) + dR(c[0] + c[1] - 8, y0 + 26, 8, F - y0 - 26, 2, G('bS'));
        for(var yy = F - 64; yy > y0 + 70; yy -= 92) s += etagere(G, rnd, c[0], yy, c[1]);
      });
    } else {
      var ew = Math.min(118, vb.w * 0.32);
      s += etagere(G, rnd, x0 + 4, A.y0 + aH * 0.36, ew);
      s += etagere(G, rnd, x1 - 4 - ew, A.y0 + aH * 0.68, ew);
    }
    /* la poutre du plafond et les herbes qui sèchent */
    s += herbes(G, C - Math.min(150, vb.w * 0.36), y0 + 16, 18) + herbes(G, C + Math.min(130, vb.w * 0.3), y0 + 16, 30);
    s += dR(x0 - 4, y0 - 4, vb.w + 8, 20, 0, G('bS'), 3);
    for(var px = C - 360; px < x1; px += 120) if(px > x0 - 30) s += dR(px - 9, y0 + 14, 18, 12, 2, G('bS'), 2.5);
  }
  /* le plancher */
  s += '<rect x="' + f2(x0) + '" y="' + f2(F) + '" width="' + f2(vb.w) + '" height="' + f2(y1 - F + 2) + '" fill="' + G('sol') + '"/>';
  var pl = '';
  for(var i = -16; i <= 16; i++){ var xa = C + i * 40 * k, xb = C + i * 58 * k; if(Math.max(xa, xb) > x0 - 60 && Math.min(xa, xb) < x1 + 60) pl += 'M' + f2(xa) + ',' + f2(F) + ' L' + f2(xb) + ',' + f2(y1 + 2) + ' '; }
  for(i = -8; i <= 8; i++){ var yj = F + (y1 - F) * (0.35 + 0.3 * ((i + 8) % 3) / 2), xj = C + i * 50 * k + (i % 2) * 14; pl += 'M' + f2(xj) + ',' + f2(yj) + ' h' + f2(30 * k) + ' '; }
  s += dT(pl, 'rgba(40,20,10,.45)', 2 * k) + '<rect x="' + f2(x0) + '" y="' + f2(F) + '" width="' + f2(vb.w) + '" height="' + f2(Math.min(18 * k, y1 - F)) + '" fill="' + G('solO') + '"/>';
  s += dR(x0 - 4, F - 6 * k, vb.w + 8, 8 * k, 0, G('bS'), 2);
  /* le foyer de pierres sous le chaudron */
  if(ch){
    var hy = ch.y, hr = 52 * ch.k;
    s += '<ellipse cx="' + f2(ch.x) + '" cy="' + f2(hy) + '" rx="' + f2(hr + 8) + '" ry="' + f2(hr * 0.2 + 4) + '" fill="#1b0e0a" opacity=".75"/>';
    for(var j = 0; j < 7; j++){ var a = Math.PI * (0.05 + 0.9 * j / 6); s += '<ellipse cx="' + f2(ch.x - Math.cos(a) * hr) + '" cy="' + f2(hy + Math.sin(a) * hr * 0.2) + '" rx="' + f2(9 * ch.k + 3) + '" ry="' + f2(5 * ch.k + 2) + '" fill="#625b80" stroke="' + CONTOUR + '" stroke-width="2"/>'; }
  }
  return s;
}

/* ---------- Physique : lignes droites, rebonds doux ---------- */
function ecraser(b, ang, force){ b.sqT = 0; b.sqA = ang; b.sqF = force || 1; }
function remettreVitesse(b, fx, fy){
  var v = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if(v < b.s * 0.15){ b.vx = fx * b.s; b.vy = fy * b.s; return; }
  b.vx *= b.s / v; b.vy *= b.s / v;
}
/* Fait avancer les bulles de dt secondes dans l'arène A = {x0, y0, x1, y1}.
   Vitesse constante (b.s) : seules les directions changent aux rebonds. */
function bouger(liste, A, dt){
  var i, j, b, o, pen, pousse = 50 * dt;
  for(i = 0; i < liste.length; i++){
    b = liste[i]; if(!b.vivant) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.sqT += dt;
    /* bords : on renvoie la bulle ; si l'arène a rapetissé (écran tourné), elle rentre doucement */
    if((pen = A.x0 - (b.x - b.r)) > 0){ if(b.vx < 0){ b.vx = -b.vx; ecraser(b, 0); } if(pen > 1.5) b.x += Math.min(pen, pousse); }
    if((pen = (b.x + b.r) - A.x1) > 0){ if(b.vx > 0){ b.vx = -b.vx; ecraser(b, 0); } if(pen > 1.5) b.x -= Math.min(pen, pousse); }
    if((pen = A.y0 - (b.y - b.r)) > 0){ if(b.vy < 0){ b.vy = -b.vy; ecraser(b, 90); } if(pen > 1.5) b.y += Math.min(pen, pousse); }
    if((pen = (b.y + b.r) - A.y1) > 0){ if(b.vy > 0){ b.vy = -b.vy; ecraser(b, 90); } if(pen > 1.5) b.y -= Math.min(pen, pousse); }
  }
  for(i = 0; i < liste.length; i++){
    b = liste[i]; if(!b.vivant || b.etat !== 'ok') continue;
    for(j = i + 1; j < liste.length; j++){
      o = liste[j]; if(!o.vivant || o.etat !== 'ok') continue;
      var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy), mini = b.r + o.r + 3;
      if(d >= mini || d < 0.001) continue;
      var nx = dx / d, ny = dy / d;
      var vb = b.vx * nx + b.vy * ny, vo = o.vx * nx + o.vy * ny;
      if(vb - vo > 0){
        /* choc élastique entre bulles de même masse : on échange les vitesses le long du choc */
        b.vx += (vo - vb) * nx; b.vy += (vo - vb) * ny;
        o.vx += (vb - vo) * nx; o.vy += (vb - vo) * ny;
        remettreVitesse(b, -nx, -ny); remettreVitesse(o, nx, ny);
        /* sécurité : après le choc, elles doivent s'éloigner */
        vb = b.vx * nx + b.vy * ny; vo = o.vx * nx + o.vy * ny;
        if(vb > 0){ b.vx -= 2 * vb * nx; b.vy -= 2 * vb * ny; }
        if(vo < 0){ o.vx -= 2 * vo * nx; o.vy -= 2 * vo * ny; }
        var ang = Math.atan2(ny, nx) * 180 / Math.PI;
        ecraser(b, ang, 0.75); ecraser(o, ang, 0.75);
      }
      var corr = Math.min((mini - d) / 2, 20 * dt);
      b.x -= nx * corr; b.y -= ny * corr; o.x += nx * corr; o.y += ny * corr;
    }
  }
}
/* Position + petit écrasement « boing » juste après un rebond (pas de déplacement). */
function dessinerBulle(b){
  b.el.setAttribute('transform', 'translate(' + f2(b.x) + ',' + f2(b.y) + ')');
  var D = 0.5;
  if(b.sqT < D){
    var u = b.sqT / D, amt = 0.07 * b.sqF * Math.sin(Math.PI * u) * (1 - u * 0.5);
    b.sq.setAttribute('transform', 'rotate(' + f2(b.sqA) + ') scale(' + f2(1 - amt) + ',' + f2(1 + amt * 0.6) + ') rotate(' + f2(-b.sqA) + ')');
    b.sqOn = true;
  } else if(b.sqOn){ b.sq.removeAttribute('transform'); b.sqOn = false; }
}
function nouvelleBulle(i, def, g, r, s){
  var a = (Math.floor(Math.random() * 4) * 90 + U.rand(25, 65)) * Math.PI / 180;
  return {i:i, d:def, el:g, sq:g.querySelector('.mjbu-sq'), x:0, y:0, vx:Math.cos(a) * s, vy:Math.sin(a) * s, s:s, r:r, etat:'ok', vivant:true, sqT:9, sqA:0, sqF:1, sqOn:false};
}
/* Place les bulles sans qu'elles se touchent. */
function placer(liste, A){
  var ecart = 18;
  for(var essai = 0; essai < 60; essai++){
    var ok = true;
    for(var i = 0; i < liste.length && ok; i++){
      var b = liste[i], bon = false;
      for(var k = 0; k < 250 && !bon; k++){
        b.x = U.rand(A.x0 + b.r + 6, Math.max(A.x0 + b.r + 7, A.x1 - b.r - 6));
        b.y = U.rand(A.y0 + b.r + 6, Math.max(A.y0 + b.r + 7, A.y1 - b.r - 6));
        bon = true;
        for(var j = 0; j < i; j++){ var o = liste[j]; if(Math.hypot(o.x - b.x, o.y - b.y) < o.r + b.r + ecart){ bon = false; break; } }
      }
      if(!bon) ok = false;
    }
    if(ok) return;
    ecart = Math.max(3, ecart - 3);
  }
}

/* ---------- Ingrédients qui tombent dans le chaudron ---------- */
function Ingredients(calque, plouf){
  var liste = [];
  return {
    lancer: function(b, x1, y1, fini){
      var g = svgNoeud('g', {'class':'mjbu-ingr'}, calque);
      g.innerHTML = '<g fill="' + b.d.c + '" stroke="' + CONTOUR + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">' + b.d.s + '</g>';
      liste.push({el:g, c:b.d.c, x0:b.x, y0:b.y, x1:x1, y1:y1, cx:(b.x + x1) / 2 + U.rand(-25, 25), cy:Math.min(b.y, y1) - U.rand(35, 70),
        t:0, dur:U.rand(0.8, 0.95), rot:U.rand(0, 360), vr:U.rand(-280, 280), fini:fini});
      g.setAttribute('transform', 'translate(' + f2(b.x) + ',' + f2(b.y) + ') scale(.4)');
    },
    maj: function(dt){
      for(var i = liste.length - 1; i >= 0; i--){
        var it = liste[i]; it.t += dt;
        /* courbe de Bézier quadratique parcourue à vitesse constante = vraie parabole (gravité) */
        var u = Math.min(1, it.t / it.dur), m = 1 - u;
        var x = m * m * it.x0 + 2 * m * u * it.cx + u * u * it.x1, y = m * m * it.y0 + 2 * m * u * it.cy + u * u * it.y1;
        var s = u < 0.15 ? 0.4 + 1.3 * (u / 0.15) : 1.7 - 0.8 * Math.pow((u - 0.15) / 0.85, 2);
        it.el.setAttribute('transform', 'translate(' + f2(x) + ',' + f2(y) + ') rotate(' + f2((it.rot + it.vr * it.t) % 360) + ') scale(' + f2(s) + ')');
        if(u >= 1){
          liste.splice(i, 1);
          if(it.el.parentNode) it.el.parentNode.removeChild(it.el);
          plouf(it.x1, it.y1, it.c);
          if(it.fini) it.fini();
        }
      }
    },
    nombre: function(){ return liste.length; }
  };
}
/* Couleur du liquide (et de sa lueur) qui change en douceur. */
function Liquide(svg){
  var eLiq = svg.querySelector('.mjbu-liquide'), stops = Array.prototype.slice.call(svg.querySelectorAll('.mjbu-lueur-c'));
  var L = {c:hexRgb(LIQ0), de:hexRgb(LIQ0), vers:hexRgb(LIQ0), t:1, dur:1};
  function poser(txt){ eLiq.setAttribute('fill', txt); stops.forEach(function(s){ s.setAttribute('stop-color', txt); }); }
  return {
    teinter: function(hex, dur){ L.de = L.c.slice(); L.vers = hexRgb(hex); L.t = 0; L.dur = dur || 0.9; },
    maj: function(dt){ if(L.t >= 1) return; L.t = Math.min(1, L.t + dt / L.dur); L.c = mixRgb(L.de, L.vers, lisse(L.t)); poser(rgbTxt(L.c)); },
    lueur: function(txt){ stops.forEach(function(s){ s.setAttribute('stop-color', txt); }); },
    couleur: function(){ return rgbTxt(L.c); },
    clair: function(){ return rgbTxt(mixRgb(L.c, [255, 255, 255], 0.45)); }
  };
}
function eclaboussure(calque, x, y, c){
  var g = svgNoeud('g', {transform:'translate(' + f2(x) + ',' + f2(y) + ')'}, calque);
  var s = '<ellipse class="mjbu-rond" rx="16" ry="4" stroke="' + c + '"/>';
  for(var k = 0; k < 6; k++){
    var a = -Math.PI * (0.12 + 0.76 * k / 5), d = U.rand(14, 26);
    s += '<circle class="mjbu-goutte" r="' + f2(U.rand(2.2, 3.8)) + '" fill="' + c + '" style="--dx:' + f2(Math.cos(a) * d) + 'px;--dy:' + f2(Math.sin(a) * d) + 'px"/>';
  }
  g.innerHTML = s;
  return g;
}

/* ---------- Réglages ---------- */
function reglages(n, mods){
  mods = mods || {};
  var p = {};
  p.bulles = Math.round(courbe(n, {1:4, 3:5, 6:6, 10:7, 12:8}));
  p.manches = 4;
  p.depart = n <= 2 ? 2 : (n >= 12 ? 4 : 3);
  p.longueurs = [0, 1, 2, 3].map(function(k){ return p.depart + k; });
  var tps = fixe(mods.temps || 0, 0, 5);
  p.lent = mods.lent || 1;
  /* dérive en unités de jeu par seconde (l'aire de jeu fait 360 unités de large au téléphone) */
  p.vitesse = courbe(n, {1:3.2, 3:4.6, 6:6.4, 10:9, 12:10.8}) * p.lent / (1 + 0.05 * tps); /* un peu plus vite (demande de Romain) */
  /* temps entre deux bulles qui s'allument */
  p.intervalle = courbe(n, {1:0.95, 3:0.8, 6:0.6, 10:0.38, 12:0.34}); /* niveau 10 : le rythme que Romain avait validé */
  p.rayon = courbe(n, {1:40, 3:38, 6:36, 10:34, 12:32}) * (mods.zone || 1);
  p.vies = (n <= 2 ? 5 : (n <= 4 ? 4 : 3)) + Math.max(0, Math.round(mods.erreurs || 0));
  p.erreurs = p.vies - 1;
  p.eclate = fixe(Math.round(mods.eclate || 0), 0, Math.min(3, p.bulles - 3));
  p.aide = Math.max(0, Math.round(mods.aide || 0));
  p.revele = !!mods.revele;
  p.repetitions = n >= 7;   /* la suite peut repasser par une bulle déjà vue (jamais deux fois de suite) */
  var v = p.vitesse;
  var bouge = v < 3 ? 'tout, tout doucement 🐌' : (v < 4.6 ? 'très doucement 🐌' : (v < 7.6 ? 'doucement' : 'un peu plus vite'));
  var iv = p.intervalle;
  var allume = iv >= 0.85 ? 'lentement' : (iv >= 0.7 ? 'tranquillement' : (iv >= 0.58 ? 'normalement' : 'assez vite'));
  p.lignes = [
    {nom:'Les bulles', val:p.bulles + ' bulles'},
    {nom:'À retenir', val:p.longueurs.slice(0, 3).join(', puis ') + ', puis ' + p.longueurs[3] + ' bulles'},
    {nom:'Elles bougent', val:bouge},
    {nom:'Elles s\'allument', val:allume},
    {nom:'Taille des bulles', val:p.rayon >= 39 ? 'grosses' : (p.rayon >= 33 ? 'moyennes' : 'petites')},
    {nom:'Cœurs (erreurs permises)', val:p.erreurs + ' ❤️'}
  ];
  if(p.eclate) p.lignes.push({nom:'Une bulle éclate 🫧', val:['', 'à la manche 2', 'aux manches 2 et 3', 'aux manches 2, 3 et 4'][p.eclate]});
  if(p.aide) p.lignes.push({nom:'Indices 💡', val:String(p.aide)});
  if(p.revele) p.lignes.push({nom:'La bonne bulle brille', val:'oui ✨'});
  return p;
}

MJ.enregistrer('bulles', {
  nom:'Les bulles magiques', role:'alchimiste', ic:'🫧',
  consigne:'Regarde les bulles s\'allumer, puis touche-les dans le même ordre. Attention, elles bougent tout doucement !',
  minuteur:false,
  reglages: reglages,

  /* ---------- Démo de l'écran de consigne ---------- */
  demo: function(el){
    var id = nid('bud'), defs = BULLES.slice(0, 3);
    el.innerHTML = '<svg class="mjbu-demo-svg" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs>' + defs.map(function(d, i){ return gradBulle(id + 'b' + i, d.c); }).join('') + chaudronDefs(id) + '</defs>' +
      '<g class="mjbu-decor-demo">' + decorSVG(id + 'd', {x:-330, y:0, w:960, h:170}, {x0:8, y0:6, x1:292, y1:118}, 150, {x:150, y:166, k:0.36}, {simple:true, k:0.6, cx:150}) + '</g>' +
      '<rect class="mjbu-voile" x="8" y="6" width="284" height="112" rx="22"/>' +
      '<rect class="mjbu-arene" x="8" y="6" width="284" height="112" rx="22" fill="rgba(180,140,255,.07)"/>' +
      '<g transform="translate(150,143) scale(.36)">' + chaudronSVG(id) + '</g>' +
      '<g class="d-b"></g><g class="d-i"></g><g class="d-fx"></g>' + MAIN + '</svg>';
    var svg = el.querySelector('svg'), gB = svg.querySelector('.d-b'), gFx = svg.querySelector('.d-fx');
    var main = svg.querySelector('.mjbu-main');
    var A = {x0:8, y0:6, x1:292, y1:118};
    var bs = defs.map(function(d, i){
      var g = svgNoeud('g', {'class':'mjbu-bulle'}, gB);
      g.innerHTML = bulleSVG(d, 19, id + 'b' + i);
      return nouvelleBulle(i, d, g, 19, 7);
    });
    bs[0].x = 62; bs[0].y = 52; bs[1].x = 150; bs[1].y = 74; bs[2].x = 238; bs[2].y = 46;
    var liquide = Liquide(svg), jetables = [];
    var ingr = Ingredients(svg.querySelector('.d-i'), function(x, y, c){ jetables.push({el:eclaboussure(gFx, x, y, c), fin:T + 0.7}); });
    var ORDRE = [1, 2, 0], LUM = [0.7, 1.35, 2.0], TAPE = [3.3, 4.15, 5.0], CYCLE = 8.6;
    var hx = 262, hy = 150, tPrec = 0, T = 0, tapeJusqua = [0, 0, 0];
    var actif = true;
    var stop = U.boucle(function(dt, tt){
      if(!actif) return false;
      if(!svg.isConnected){ actif = false; return false; }
      T = tt;
      var t = tt % CYCLE;
      if(t < tPrec){ liquide.teinter(LIQ0, 0.5); tapeJusqua = [0, 0, 0]; }
      bouger(bs, A, dt);
      bs.forEach(dessinerBulle);
      svg.classList.toggle('mjbu-montre', t > 0.4 && t < 2.6);
      ORDRE.forEach(function(bi, k){
        var lum = (t >= LUM[k] && t < LUM[k] + 0.45) || t < tapeJusqua[k];
        bs[bi].el.classList.toggle('allume', lum);
        if(tPrec < TAPE[k] && t >= TAPE[k]){ relancer(main, 'tape'); relancer(bs[bi].el, 'tape'); tapeJusqua[k] = t + 0.25; }
        var tI = 5.5 + k * 0.15;
        if(tPrec < tI && t >= tI) ingr.lancer(bs[bi], 150 + U.rand(-10, 10), 143 - 15 * 0.36, k === 2 ? function(){ liquide.teinter(LIQ_MANCHES[0], 0.6); } : null);
      });
      /* la main suit la bulle à toucher (elle bouge !) */
      var tx = 262, ty = 150;
      if(t > 2.7 && t < 5.25){ var k2 = t < TAPE[0] + 0.1 ? 0 : (t < TAPE[1] + 0.1 ? 1 : 2), b = bs[ORDRE[k2]]; tx = b.x + 2; ty = b.y + 4; }
      var kk = Math.min(1, dt * 7);
      hx += (tx - hx) * kk; hy += (ty - hy) * kk;
      main.setAttribute('transform', 'translate(' + f2(hx) + ',' + f2(hy) + ')');
      ingr.maj(dt); liquide.maj(dt);
      for(var i = jetables.length - 1; i >= 0; i--) if(T > jetables[i].fin){ var e = jetables[i].el; if(e.parentNode) e.parentNode.removeChild(e); jetables.splice(i, 1); }
      tPrec = t;
    });
    return {arreter: function(){ actif = false; stop(); }};
  },

  /* ---------- La partie ---------- */
  jouer: function(el, p, fin){
    if(!p || !p.longueurs) p = Object.assign(reglages(10, (p && p.mods) || {}), p || {});
    var P = Partie(fin);
    var id = nid('bu'), N = p.bulles;
    var vies = p.vies, maxVies = p.vies, fautes = 0, aides = p.aide;
    var manche = 0, pas = 0, montres = 0, phase = 'attente', indiceActif = false, mancheAff = 0;
    var journal = [];
    function noter(type, extra){ var e = {type:type, t:Math.round(performance.now())}; if(extra) for(var k in extra) e[k] = extra[k]; journal.push(e); if(journal.length > 400) journal.shift(); }

    /* --- bandeau : vies (cœurs) et manches --- */
    var hud = U.html('<div class="mjbu-hud"><div class="mjbu-vies" aria-label="Vies"></div><div class="mjbu-manches" aria-label="Manches"></div></div>');
    el.appendChild(hud);
    var hVies = hud.querySelector('.mjbu-vies'), hMan = hud.querySelector('.mjbu-manches');
    /* la règle des cœurs (mj-core.js) : cœurs = erreurs encore permises (vies − 1) ; plus de cœur → on prévient */
    var gemmes = [];
    hVies.innerHTML = U.coeurs(vies - 1, maxVies - 1);
    for(var g0 = 0; g0 < p.manches; g0++){ var sg = U.html('<span class="mjbu-manche' + (g0 === p.manches - 1 ? ' der' : '') + '" style="--c:' + (LIQ_MANCHES[g0] || '#fff') + '">' + (g0 + 1) + '</span>'); hMan.appendChild(sg); gemmes.push(sg); }
    function majManches(){ gemmes.forEach(function(gm, i){ gm.classList.toggle('ici', i === manche && phase !== 'perdu'); if(i < manche && !gm.classList.contains('fait')) gm.classList.add('fait'); }); }
    function perdreCoeur(){ if(vies < 1) return; hVies.innerHTML = U.coeurs(vies - 1, maxVies - 1, vies - 1); if(vies === 1) U.plusDeCoeur(el); }
    majManches();

    /* --- terrain --- */
    var terrain = U.html('<div class="mjbu-terrain"></div>');
    el.appendChild(terrain);
    var defs = BULLES.slice(0, N);
    terrain.innerHTML = '<svg class="mjbu-decor" viewBox="0 0 360 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true"></svg>' +
    '<div class="mjbu-chaleur" aria-hidden="true"></div>' +
    '<svg class="mjbu-svg" viewBox="0 0 360 520" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' + defs.map(function(d, i){ return gradBulle(id + 'b' + i, d.c); }).join('') + chaudronDefs(id) +
        '<radialGradient id="' + id + 'ar" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#b48cff" stop-opacity=".16"/><stop offset="1" stop-color="#b48cff" stop-opacity=".02"/></radialGradient></defs>' +
      '<rect class="mjbu-voile" rx="34"/>' +
      '<rect class="mjbu-arene" rx="34" fill="url(#' + id + 'ar)"/>' +
      '<g class="mjbu-etoiles"></g>' +
      '<g class="mjbu-ch-pos">' + chaudronSVG(id) + '</g>' +
      '<g class="mjbu-calque-b"></g><g class="mjbu-calque-i"></g><g class="mjbu-calque-fx"></g>' +
    '</svg>' +
    '<div class="mjbu-etat"><span class="mjbu-etat-ic">👀</span><span class="mjbu-pas"></span></div>' +
    (p.aide > 0 ? '<button class="mjbu-indice" type="button" aria-label="Indice"><span>💡</span><small>Indice</small><b>' + p.aide + '</b></button>' : '');
    var svg = terrain.querySelector('.mjbu-svg'), decor = terrain.querySelector('.mjbu-decor'), chaleur = terrain.querySelector('.mjbu-chaleur'), cleDecor = '';
    var gVoile = svg.querySelector('.mjbu-voile');
    var gArene = svg.querySelector('.mjbu-arene'), gEtoiles = svg.querySelector('.mjbu-etoiles'), gChPos = svg.querySelector('.mjbu-ch-pos');
    var gB = svg.querySelector('.mjbu-calque-b'), gFx = svg.querySelector('.mjbu-calque-fx'), gChB = svg.querySelector('.mjbu-ch-bulles');
    var eArc = svg.querySelector('.mjbu-arc'), eArcRot = svg.querySelector('.mjbu-arc-rot'), eRemous = svg.querySelector('.mjbu-remous');
    var eEtat = terrain.querySelector('.mjbu-etat'), eEtatIc = terrain.querySelector('.mjbu-etat-ic'), ePas = terrain.querySelector('.mjbu-pas');
    var btnI = terrain.querySelector('.mjbu-indice');

    /* --- cadrage : la scène fait au moins 360 × 520 unités et s'étend selon l'écran ;
           les bulles flottent dans l'arène, au-dessus du petit chaudron --- */
    var W0 = 360, H0 = 520, vb = {x:0, y:0, w:W0, h:H0}, echelle = 1;
    var arene = {x0:12, y0:56, x1:348, y1:H0 - 120};
    var CH = {x:180, y:H0 - 66, k:0.75};
    var etoiles = [];
    for(var e0 = 0; e0 < 16; e0++){
      var et = svgNoeud('circle', {'class':'mjbu-etoile', r:f2(U.rand(0.8, 1.9))}, gEtoiles);
      et.style.animationDelay = (-U.rand(0, 3)).toFixed(2) + 's';
      etoiles.push({el:et, fx:Math.random(), fy:Math.random()});
    }
    function cadrer(){
      var r = svg.getBoundingClientRect();
      if(r.width > 0 && r.height > 0){
        var a = r.width / r.height, w = W0, h = H0;
        if(a > W0 / H0) w = Math.min(980, H0 * a); else h = Math.min(1100, W0 / a);
        vb = {x:(W0 - w) / 2, y:H0 - h, w:w, h:h};
        echelle = Math.min(r.width / w, r.height / h);
      }
      var vbTxt = [vb.x, vb.y, vb.w, vb.h].map(f2).join(' ');
      svg.setAttribute('viewBox', vbTxt); decor.setAttribute('viewBox', vbTxt);
      var aw = Math.min(vb.w - 16, 580);
      arene = {x0:180 - aw / 2, x1:180 + aw / 2, y0:vb.y + 10 + 50 / echelle, y1:H0 - 120};
      [gVoile, gArene].forEach(function(n){
        n.setAttribute('x', f2(arene.x0)); n.setAttribute('y', f2(arene.y0));
        n.setAttribute('width', f2(arene.x1 - arene.x0)); n.setAttribute('height', f2(arene.y1 - arene.y0));
      });
      /* le décor ne se redessine que si la vue change vraiment */
      if(vbTxt !== cleDecor){ cleDecor = vbTxt; decor.innerHTML = decorSVG(id + 'd', vb, arene, H0 - 48, {x:CH.x, y:CH.y + 68 * CH.k, k:CH.k}); }
      /* la lueur chaude du feu (en HTML : le navigateur l'anime sans repeindre le décor) */
      chaleur.style.left = f2((CH.x - vb.x) / vb.w * 100) + '%'; chaleur.style.top = f2((CH.y - vb.y) / vb.h * 100) + '%';
      chaleur.style.width = f2(380 / vb.w * 100) + '%'; chaleur.style.height = f2(300 / vb.h * 100) + '%';
      etoiles.forEach(function(s){ s.el.setAttribute('cx', f2(arene.x0 + 14 + s.fx * (aw - 28))); s.el.setAttribute('cy', f2(arene.y0 + 14 + s.fy * (arene.y1 - arene.y0 - 28))); });
      gChPos.setAttribute('transform', 'translate(' + CH.x + ',' + CH.y + ') scale(' + CH.k + ')');
    }
    cadrer();
    if(window.ResizeObserver){ var ro = new ResizeObserver(cadrer); ro.observe(svg); P.stops.push(function(){ ro.disconnect(); }); }
    else P.ecoute(window, 'resize', cadrer);

    /* --- les bulles --- */
    var aireA = (arene.x1 - arene.x0) * (arene.y1 - arene.y0);
    var R = Math.max(24, Math.min(p.rayon, Math.sqrt(0.3 * aireA / (N * Math.PI))));
    var bulles = defs.map(function(d, i){
      var g = svgNoeud('g', {'class':'mjbu-bulle', 'data-i':i}, gB);
      g.innerHTML = bulleSVG(d, R, id + 'b' + i);
      return nouvelleBulle(i, d, g, R, p.vitesse * U.rand(0.85, 1.15));
    });
    placer(bulles, arene);
    bulles.forEach(dessinerBulle);

    /* --- la suite à retenir : des bulles qui n'éclateront pas --- */
    var indices = bulles.map(function(b){ return b.i; });
    var aEclater = U.melanger(indices).slice(0, p.eclate);
    var dispo = indices.filter(function(i){ return aEclater.indexOf(i) < 0; });
    var suite = [];
    for(var k0 = 0; k0 < p.longueurs[p.manches - 1]; k0++){
      var cand = dispo.filter(function(i){ return i !== suite[suite.length - 1]; });
      if(!p.repetitions){ var neufs = cand.filter(function(i){ return suite.indexOf(i) < 0; }); if(neufs.length) cand = neufs; }
      suite.push(U.choix(cand));
    }
    function longueur(m){ return p.longueurs[Math.min(m === undefined ? manche : m, p.manches - 1)]; }

    /* --- effets --- */
    var tJeu = 0, jetables = [], remousA = 0, arcA = 0, arcO = 0, arcOn = false, pbAcc = 0, dernierPlouf = -1;
    var liquide = Liquide(svg);
    function jeter(n, duree){ jetables.push({el:n, fin:tJeu + duree}); }
    var ingr = Ingredients(svg.querySelector('.mjbu-calque-i'), function(x, y, c){
      jeter(eclaboussure(gFx, x, y, c), 0.7);
      if(tJeu - dernierPlouf > 0.12){ dernierPlouf = tJeu; U.son('plouf'); }
    });
    function petiteBulle(){
      var cl = arcOn ? ARC[Math.floor(Math.random() * ARC.length)] : liquide.clair();
      var n = svgNoeud('circle', {'class':'mjbu-pb', cx:f2(U.rand(-55, 55)), cy:'-16', r:f2(U.rand(2.5, 5.5)), fill:cl}, gChB);
      jeter(n, 1.3);
    }
    function etincelles(nb){
      for(var i = 0; i < nb; i++){
        var a = -Math.PI / 2 + U.rand(-0.9, 0.9), d = U.rand(70, 170), x = CH.x + U.rand(-40, 40) * CH.k, y = CH.y - 16 * CH.k;
        var n = svgNoeud('path', {'class':'mjbu-etincelle', d:'M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z', fill:ARC[Math.floor(Math.random() * ARC.length)],
          transform:'translate(' + f2(x) + ',' + f2(y) + ')', style:'--dx:' + f2(Math.cos(a) * d) + 'px;--dy:' + f2(Math.sin(a) * d) + 'px'}, gFx);
        n.style.animationDelay = U.rand(0, 0.25).toFixed(2) + 's';
        jeter(n, 1.6);
      }
    }
    function fumee(){
      for(var i = 0; i < 7; i++){
        var n = svgNoeud('circle', {'class':'mjbu-fumee', cx:f2(CH.x + U.rand(-45, 45) * CH.k), cy:f2(CH.y - 18 * CH.k), r:f2(U.rand(9, 16))}, gFx);
        n.style.animationDelay = (i * 0.08).toFixed(2) + 's';
        jeter(n, 2);
      }
    }
    function annonce(txt, ms){
      var s = document.createElement('div'); s.className = 'mjbu-annonce'; s.textContent = txt;
      terrain.appendChild(s);
      P.apres(ms || 1150, function(){ if(s.parentNode) s.parentNode.removeChild(s); });
    }
    function flotter(b, txt){
      var e = versEcran(svg, b.x, b.y - b.r), r = terrain.getBoundingClientRect();
      var s = document.createElement('span'); s.className = 'mjbu-flotte'; s.textContent = txt;
      s.style.left = f2(e.x - r.left) + 'px'; s.style.top = f2(e.y - r.top) + 'px';
      terrain.appendChild(s);
      P.apres(1000, function(){ if(s.parentNode) s.parentNode.removeChild(s); });
    }
    function allumer(b, ms, muet){
      b.el.classList.add('allume');
      if(!muet) U.son('bulle');
      clearTimeout(b.tAllume);
      b.tAllume = P.apres(ms, function(){ b.el.classList.remove('allume'); });
    }
    function eclair(b, cls, ms){ relancer(b.el, cls); P.apres(ms || 500, function(){ b.el.classList.remove(cls); }); }

    /* --- pastille d'état (👀 / 👆) et points de la suite --- */
    function majEtat(){
      eEtatIc.textContent = phase === 'montre' || phase === 'attente' ? '👀' : (phase === 'joue' ? '👆' : (phase === 'perdu' ? '💨' : (phase === 'gagne' ? '🌈' : '✨')));
      var L = longueur(mancheAff), s = '';
      for(var k = 0; k < L; k++){
        var fait = (phase === 'montre' && k < montres) || (phase === 'joue' && k < pas) || phase === 'entre' || phase === 'gagne';
        var cl = phase === 'montre' ? '#ffffff' : BULLES[suite[k]].c;
        s += '<i' + (fait ? ' class="fait" style="--c:' + cl + '"' : '') + '></i>';
      }
      ePas.innerHTML = s;
    }
    function majIndice(){
      var cible = (phase === 'joue' && (indiceActif || p.revele)) ? suite[pas] : -1;
      bulles.forEach(function(b){ b.el.classList.toggle('indice', b.i === cible); });
      if(btnI){ btnI.disabled = !(phase === 'joue' && aides > 0 && !indiceActif); btnI.querySelector('b').textContent = aides; }
    }

    /* --- déroulement --- */
    function montrer(){
      phase = 'montre'; pas = 0; montres = 0; indiceActif = false; mancheAff = manche;
      terrain.classList.add('mjbu-montre');
      majEtat(); majIndice(); majManches();
      noter('montre', {manche:manche, suite:suite.slice(0, longueur())});
      annonce('👀 Regarde !');
      var L = longueur(), iv = p.intervalle * 1000, on = Math.min(500, iv * 0.72), t0 = 950;
      for(var i = 0; i < L; i++) (function(i){ P.apres(t0 + i * iv, function(){ montres = i + 1; allumer(bulles[suite[i]], on); majEtat(); }); })(i);
      P.apres(t0 + (L - 1) * iv + on + 300, function(){
        phase = 'joue'; terrain.classList.remove('mjbu-montre');
        majEtat(); majIndice(); noter('joue', {manche:manche});
        annonce('👆 À toi !', 900);
      });
    }
    function eclater(b){
      b.etat = 'eclate'; noter('eclate', {i:b.i});
      b.el.classList.remove('allume', 'indice');
      b.el.classList.add('eclate');
      U.son('plouf'); U.vibrer(20);
      var g = svgNoeud('g', {transform:'translate(' + f2(b.x) + ',' + f2(b.y) + ')'}, gFx), s = '<circle class="mjbu-pop-rond" r="' + f2(b.r) + '" stroke="' + b.d.c + '"/>';
      for(var k = 0; k < 10; k++){ var a = k / 10 * Math.PI * 2 + U.rand(-0.2, 0.2), d = b.r + U.rand(10, 30); s += '<circle class="mjbu-goutte" cx="' + f2(Math.cos(a) * b.r * 0.6) + '" cy="' + f2(Math.sin(a) * b.r * 0.6) + '" r="' + f2(U.rand(2.5, 5)) + '" fill="' + b.d.c + '" style="--dx:' + f2(Math.cos(a) * d * 0.7) + 'px;--dy:' + f2(Math.sin(a) * d * 0.7) + 'px"/>'; }
      g.innerHTML = s; jeter(g, 0.9);
      annonce('🫧 Pop !', 1000);
      P.apres(450, function(){ b.vivant = false; b.el.style.display = 'none'; });
    }
    function mancheFinie(){
      phase = 'entre';
      var L = longueur();
      manche++; noter('manche', {manche:manche});
      majManches(); majEtat(); majIndice();
      U.son('ok');
      var liste = suite.slice(0, L), restants = liste.length;
      P.apres(300, function(){
        noter('ingredients', {n:liste.length});
        liste.forEach(function(i, k){
          P.apres(k * 150, function(){
            var b = bulles[i];
            relancer(b.el, 'donne');
            ingr.lancer(b, CH.x + U.rand(-34, 34) * CH.k, CH.y - 15 * CH.k, function(){ restants--; if(restants === 0) apresIngredients(); });
          });
        });
      });
    }
    function apresIngredients(){
      if(manche >= p.manches){ gagne(); return; }
      liquide.teinter(LIQ_MANCHES[manche - 1], 0.9);
      U.son('magie'); noter('teinte', {manche:manche});
      etincelles(5);
      annonce(U.choix(['✨ Bravo !', '✨ Super !', '✨ Bien joué !']), 1000);
      var b = manche - 1 < aEclater.length ? bulles[aEclater[manche - 1]] : null;
      if(b) P.apres(1150, function(){ eclater(b); P.apres(1150, montrer); });
      else P.apres(1300, montrer);
    }
    function gagne(){
      phase = 'gagne'; majEtat(); majManches(); noter('arc');
      arcOn = true; liquide.teinter('#fff4d0', 1.2);
      terrain.classList.add('mjbu-gagne');
      U.son('magie');
      annonce('🌈 Potion réussie !', 1900);
      etincelles(14);
      bulles.forEach(function(b, k){ if(b.vivant && b.etat === 'ok') P.apres(250 + k * 130, function(){ allumer(b, 320, true); }); });
      P.finir({reussi:true, score:1, erreurs:fautes, detail:fautes ? 'La potion arc-en-ciel est prête !' : 'Potion arc-en-ciel parfaite, sans aucune erreur !'}, 2800);
    }
    function perdu(){
      phase = 'perdu'; majEtat(); majIndice(); majManches(); noter('perdu');
      terrain.classList.add('mjbu-rate');
      liquide.teinter('#4a4458', 0.8); fumee();
      var det = manche ? 'Plus de cœur : c\'était l\'erreur de trop… ' + manche + ' manche' + (manche > 1 ? 's' : '') + ' réussie' + (manche > 1 ? 's' : '') + ' sur 4.' : 'Plus de cœur : c\'était l\'erreur de trop… Réessaie, tu vas y arriver !';
      P.finir({reussi:false, score:manche / p.manches, erreurs:fautes, detail:det}, 1400);
    }
    function bon(b, maintenant){
      dernierBon = {i:b.i, t:maintenant};
      pas++; indiceActif = false;
      eclair(b, 'tape', 450); allumer(b, 230); U.vibrer(12);
      noter('bon', {i:b.i, pas:pas});
      majEtat(); majIndice();
      if(pas >= longueur()) mancheFinie();
    }
    function faux(b){
      fautes++; vies--; noter('faux', {i:b.i, attendu:suite[pas], vies:vies});
      perdreCoeur();
      eclair(b, 'faux', 520); U.son('ko'); U.vibrer(40);
      flotter(b, '💔');
      if(vies <= 0) perdu();
    }

    /* --- toucher : la bulle la plus proche du doigt (cible large) --- */
    var dernierBon = {i:-1, t:0};
    P.ecoute(svg, 'pointerdown', function(e){
      if(e.isPrimary === false || P.fini) return;
      if(phase === 'montre' || phase === 'attente'){ relancer(eEtat, 'attends'); return; }
      if(phase !== 'joue') return;
      var q = ptSVG(svg, e), best = null, bd = 1e9;
      for(var k = 0; k < bulles.length; k++){
        var b = bulles[k]; if(!b.vivant || b.etat !== 'ok') continue;
        var d = Math.hypot(b.x - q.x, b.y - q.y) - b.r;
        if(d < bd){ bd = d; best = b; }
      }
      if(!best || bd > 16 / Math.max(0.3, echelle)) return;
      e.preventDefault();
      var maintenant = performance.now();
      /* double toucher accidentel sur la bulle qu'on vient de réussir (la suite ne répète jamais deux fois de suite) */
      if(best.i === dernierBon.i && maintenant - dernierBon.t < 300) return;
      if(best.i === suite[pas]) bon(best, maintenant); else faux(best);
    });
    if(btnI) P.ecoute(btnI, 'click', function(){
      if(phase !== 'joue' || aides <= 0 || indiceActif || P.fini) return;
      aides--; indiceActif = true; U.son('magie'); noter('indice', {i:suite[pas]});
      majIndice();
    });

    /* --- la seule boucle d'animation : dérive, ingrédients, potion --- */
    P.boucle(function(dt){
      if(!terrain.isConnected){ arreter(); return false; }
      tJeu += dt;
      bouger(bulles, arene, dt);
      for(var i = 0; i < bulles.length; i++) if(bulles[i].vivant) dessinerBulle(bulles[i]);
      ingr.maj(dt);
      liquide.maj(dt);
      remousA += dt * (arcOn ? 150 : 32);
      eRemous.setAttribute('transform', 'rotate(' + f2(remousA % 360) + ')');
      if(arcOn){
        arcO = Math.min(1, arcO + dt / 1.1); arcA += dt * 120;
        eArc.setAttribute('opacity', f2(lisse(arcO)));
        eArcRot.setAttribute('transform', 'rotate(' + f2(arcA % 360) + ')');
        liquide.lueur('hsl(' + Math.round((tJeu * 140) % 360) + ',90%,66%)');
      }
      pbAcc += dt;
      if(pbAcc > (arcOn ? 0.08 : 0.55)){ pbAcc = 0; petiteBulle(); if(arcOn && Math.random() < 0.35) etincelles(1); }
      for(var j = jetables.length - 1; j >= 0; j--) if(tJeu > jetables[j].fin){ var n = jetables[j].el; if(n.parentNode) n.parentNode.removeChild(n); jetables.splice(j, 1); }
    });

    /* --- crochet de test --- */
    var crochet = {
      get phase(){ return phase; }, get manche(){ return manche; }, get pas(){ return pas; }, get vies(){ return vies; },
      get fautes(){ return fautes; }, get aides(){ return aides; }, get echelle(){ return echelle; },
      params: p, journal: journal,
      suite: function(){ return suite.slice(0, longueur()); },
      suiteComplete: function(){ return suite.slice(); },
      eclatees: function(){ return aEclater.slice(); },
      attendu: function(){ return phase === 'joue' ? suite[pas] : -1; },
      bulles: function(){ return bulles.map(function(b){ return {i:b.i, x:b.x, y:b.y, r:b.r, vx:b.vx, vy:b.vy, etat:b.vivant ? b.etat : 'partie', c:b.d.c}; }); },
      ecran: function(i){ var b = bulles[i], e = versEcran(svg, b.x, b.y); return {x:e.x, y:e.y, r:b.r * echelle}; },
      arene: function(){ return {x0:arene.x0, y0:arene.y0, x1:arene.x1, y1:arene.y1}; }
    };
    window.__bulles = crochet; terrain.mjbuEtat = crochet;
    function arreter(){
      P.arreter();
      if(window.__bulles === crochet){ try{ delete window.__bulles; }catch(e){ window.__bulles = null; } }
    }

    majEtat(); majIndice();
    P.apres(500, montrer);
    return {arreter: arreter};
  }
});
})();
