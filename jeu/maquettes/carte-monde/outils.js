/* ==========================================================
   Brumeval — la grande carte (maquette du 12 novembre) : les outils de dessin
   Les mêmes que ceux de jeu/src/carte.js (qui ne les montre pas au dehors) : contours, tracés lissés, eau, chemins, étiquettes.
   ========================================================== */
'use strict';

var CONTOUR = '#24182e';
var W = 3000, H = 2000;      /* le grand monde */
var OX = 1000, OY = 320;     /* où se pose l'ancienne carte (1000 × 1400) : le village ne bouge pas */

function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function f(n){ return Math.round(n * 10) / 10; }

/* Une courbe lisse par des points (ouverte) */
function lisse(pts){
  if(pts.length < 3) return 'M' + pts.map(function(p){ return f(p[0]) + ' ' + f(p[1]); }).join(' L');
  var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  for(var i = 0; i < pts.length - 1; i++){
    var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d;
}
/* Une courbe lisse fermée */
function ferme(pts){
  var n = pts.length, d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  for(var i = 0; i < n; i++){
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d + ' Z';
}
/* Les points d'une tache irrégulière (un étang, un bois, une colline) */
function tachePts(cx, cy, rx, ry, graine, n, bosse){
  var r = rng(graine), pts = []; n = n || 12; bosse = bosse === undefined ? .16 : bosse;
  for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2, k = 1 + (r() - .5) * 2 * bosse; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return pts;
}
function tache(cx, cy, rx, ry, graine, n, bosse){ return ferme(tachePts(cx, cy, rx, ry, graine, n, bosse)); }

/* Des points le long d'une courbe lisse (pour mesurer des distances, poser des lanternes…) */
function echantillons(pts, pas){
  var out = [];
  for(var i = 0; i < pts.length - 1; i++){
    var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    var l = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(1, Math.round(l / (pas || 20)));
    for(var k = 0; k < n; k++){
      var t = k / n, u = 1 - t;
      out.push([u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0], u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]]);
    }
  }
  out.push(pts[pts.length - 1].slice());
  return out;
}
function distSeg(px, py, a, b){
  var dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  var t = l ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l)) : 0;
  return Math.hypot(a[0] + t * dx - px, a[1] + t * dy - py);
}
function distLigne(px, py, pts){ var d = 1e9; for(var i = 0; i < pts.length - 1; i++) d = Math.min(d, distSeg(px, py, pts[i], pts[i + 1])); return d; }
function dansPoly(x, y, poly){
  var dedans = false;
  for(var i = 0, j = poly.length - 1; i < poly.length; j = i++){
    var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
}
function largeurTexte(t, taille){
  var n = 0; for(var i = 0; i < t.length; i++){ var c = t.charCodeAt(i); if(c >= 0xD800 && c <= 0xDBFF){ n += 1.25; i++; } else if(c > 0x2000) n += 1.1; else n += (t[i] === ' ' ? 0.32 : (/[A-ZÉÈ]/.test(t[i]) ? 0.68 : 0.56)); }
  return n * taille;
}

/* L'eau qui coule : la rivière, le ruisseau (comme carte.js) */
function eau(pts, larg, classe){
  var d = lisse(pts);
  return '<path d="' + d + '" fill="none" stroke="#2a4a6a" stroke-width="' + (larg + 10) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + d + '" fill="none" stroke="#3d79b6" stroke-width="' + larg + '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + d + '" fill="none" stroke="#5ea6de" stroke-width="' + f(larg * .55) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>' +
    '<path class="ca-flot ' + (classe || '') + '" d="' + d + '" fill="none" stroke="#dff4ff" stroke-width="' + f(Math.max(2, larg * .07)) + '" stroke-dasharray="10 34" stroke-linecap="round" opacity=".55"/>';
}
function chemin(pts, larg, couleur, bord, tirets){
  var d = lisse(pts);
  return '<path d="' + d + '" fill="none" stroke="' + (bord || '#6b5236') + '" stroke-width="' + (larg + 6) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".85"' + (tirets ? ' stroke-dasharray="' + tirets + '"' : '') + '/>' +
    '<path d="' + d + '" fill="none" stroke="' + couleur + '" stroke-width="' + larg + '" stroke-linecap="round" stroke-linejoin="round"' + (tirets ? ' stroke-dasharray="' + tirets + '"' : '') + '/>';
}
function texte(x, y, t, taille, couleur, opts){
  opts = opts || {};
  return '<text class="ca-t' + (opts.classe ? ' ' + opts.classe : '') + '" x="' + f(x) + '" y="' + f(y) + '" font-size="' + taille + '" text-anchor="' + (opts.anchor || 'middle') + '" fill="' + (couleur || '#35281b') + '"' +
    (opts.contour ? ' stroke="' + opts.contour + '" stroke-width="' + (opts.cw || 5) + '" stroke-linejoin="round" paint-order="stroke"' : '') +
    (opts.opacite ? ' opacity="' + opts.opacite + '"' : '') +
    (opts.rot ? ' transform="rotate(' + opts.rot + ' ' + f(x) + ' ' + f(y) + ')"' : '') + ' dominant-baseline="central">' + esc(t) + '</text>';
}
/* L'étiquette d'un lieu : la même pastille crème que dans le jeu */
function etiquette(x, y, ic, t, opts){
  opts = opts || {};
  var taille = opts.taille || 30;
  var lw = largeurTexte(t, taille) + (ic ? taille * 1.25 : 0) + 26, h = taille + 16;
  var s = '<g class="ca-etiquette' + (opts.classe ? ' ' + opts.classe : '') + '">' +
    '<rect x="' + f(x - lw / 2) + '" y="' + f(y - h / 2) + '" width="' + f(lw) + '" height="' + h + '" rx="' + (h / 2) + '" fill="' + (opts.fond || '#f6ead0') + '" stroke="' + CONTOUR + '" stroke-width="3"/>';
  var tx = x - lw / 2 + 13;
  if(ic){ s += '<text class="ca-ic" x="' + f(tx + taille * .55) + '" y="' + f(y + 1) + '" font-size="' + f(taille * .92) + '" text-anchor="middle" dominant-baseline="central">' + esc(ic) + '</text>'; tx += taille * 1.25; }
  s += '<text class="ca-t" x="' + f(tx) + '" y="' + f(y + 1) + '" font-size="' + taille + '" text-anchor="start" dominant-baseline="central" fill="' + (opts.encre || '#35281b') + '">' + esc(t) + '</text>';
  return {svg: s + '</g>', l: lw, h: h};
}
function ombre(cx, cy, rx, ry, o){ return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="#0b1a10" opacity="' + (o || .3) + '"/>'; }

module.exports = {CONTOUR: CONTOUR, W: W, H: H, OX: OX, OY: OY, rng: rng, esc: esc, f: f, lisse: lisse, ferme: ferme, tache: tache, tachePts: tachePts,
  echantillons: echantillons, distSeg: distSeg, distLigne: distLigne, dansPoly: dansPoly, largeurTexte: largeurTexte, eau: eau, chemin: chemin, texte: texte, etiquette: etiquette, ombre: ombre};
