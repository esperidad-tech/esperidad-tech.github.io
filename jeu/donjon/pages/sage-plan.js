/* sage-plan.js — le dessin du PLAN DES FONDATEURS (tablette du Sage), d'après carte.js (CARTE_DONJON).
   Repris de la maquette validée (maquettes/explo/plan.js), en SVG SANS AUCUN FILTRE (le papier est une petite image
   faite une fois ; le trait « à la main » est un léger tremblement des contours, calculé une fois).
   Repère : les unités de la carte (le parchemin va de PLAN.cadre.x à …). Rend window.PLAN_SAGE :
     PLAN_SAGE.svg({coin})   → {principal, coin, boiteCoin} : le SVG du plan (sans le coin déchiré), et celui du coin seul
     PLAN_SAGE.encre(ctx, note, res)  peint l'encre invisible d'une note dans un canvas (à révéler par la rune)
     PLAN_SAGE.glyphes(lignes, t, couleur) → le SVG d'une note en « grilles des fondateurs » (pour la loupe)
     PLAN_SAGE.cle()          → le SVG de la grille de l'alphabet secret (comme le mini-jeu « L'alphabet secret »)
     PLAN_SAGE.bord / bordCoin  les contours (points) du parchemin et du morceau déchiré */
(function(global){
'use strict';
var C = global.CARTE_DONJON, U = C.util, P = C.PLAN, f = U.f, rng = U.rng;
var ENC = '#3b2414', ENC2 = '#5a3a1e', PAR = '#e8d4a6', SOLC = '#f2e4c0', ROUGE = '#8e2e1c', INV = '#05607c', CRAYON = '#4a4652';
var K1 = 1 / .556;              /* un pixel de la maquette du plan, en unités de la carte */
var MUR = C.MUR, SOL = C.SOL, J = C.J, PV = P.vue;
var POLICE = 'Macondo, Georgia, serif';

/* ---------- le tremblement de la main (une seule fois) ---------- */
function trembler(poly, amp, graine){
  var R = rng(graine), n = poly.length, ph = [R() * 6.28, R() * 6.28], fr = [3 + Math.floor(R() * 3), 7 + Math.floor(R() * 4)];
  return poly.map(function(p, i){
    var a = poly[(i + 1) % n], b = poly[(i - 1 + n) % n], tx = a[0] - b[0], ty = a[1] - b[1], l = Math.hypot(tx, ty) || 1, t = i / n * 6.283;
    var o = amp * (.65 * Math.sin(t * fr[0] + ph[0]) + .35 * Math.sin(t * fr[1] + ph[1]));
    return [p[0] + ty / l * o, p[1] - tx / l * o];
  });
}
function tremblePts(pts, amp, graine){ var R = rng(graine); return pts.map(function(p, i){ return (i === 0 || i === pts.length - 1) ? p : [p[0] + (R() - .5) * amp, p[1] + (R() - .5) * amp]; }); }
var GEO = (function(){
  var salles = [], cous = {};
  C.ORDRE.forEach(function(k, i){ var L = C.LIEUX[k]; if(!L.couloir) salles.push({id:k, d:U.polyD(trembler(L.poly, 1.3, 31 + i))}); });
  C.LIENS.forEach(function(c, i){ if(c.secret || c.id === 'vieux') return; var w = c.l; (cous[w] = cous[w] || []).push(U.lisse(tremblePts(c.pts, 2.2, 71 + i))); });
  (cous[SOL] = cous[SOL] || []).push(U.lisse(tremblePts(C.VIEUX, 2.2, 97)));
  return {salles:salles.map(function(r){ return r.d; }).join(' '), cous:cous};
})();
/* l'union de toutes les salles et de tous les couloirs, élargie de « plus » */
function union(plus, c, extra){
  var s = '<path d="' + GEO.salles + '" fill="' + c + '"' + (plus ? ' stroke="' + c + '" stroke-width="' + f(2 * plus) + '" stroke-linejoin="round"' : '') + (extra || '') + '/>';
  Object.keys(GEO.cous).forEach(function(w){ s += '<path d="' + GEO.cous[w].join(' ') + '" fill="none" stroke="' + c + '" stroke-width="' + f(+w + 2 * plus) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>'; });
  return s + '<circle cx="' + J.x + '" cy="' + J.y + '" r="' + f(J.r + plus) + '" fill="' + c + '"/>';
}

/* ---------- petits dessins à la plume ---------- */
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
function Ci(x, y, r, fl, x2){ return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fl + '"' + (x2 || '') + '/>'; }
function G(x, y, a, s, c){ return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (a ? ' rotate(' + f(a) + ')' : '') + (s && s !== 1 ? ' scale(' + f(s * 1000) / 1000 + ')' : '') + '">' + c + '</g>'; }
function signe(type, x, y, t, c){ return G(x, y, 0, t / 18, '<path d="' + C.SIGNES[type] + '" fill="none" stroke="' + (c || ENC) + '" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/>'); }
function colonne(x, y, r, w){ var t = Ci(x, y, r, '#d9c294', ' stroke="' + ENC + '" stroke-width="' + w + '"'); for(var k = -r + 1.5; k < r; k += r / 3.2){ var h = Math.sqrt(Math.max(0, r * r - k * k)); t += L('M' + f(x + k) + ' ' + f(y - h * .2) + ' L' + f(x + k) + ' ' + f(y + h * .9), ENC2, w * .45, ' opacity=".7"'); } return t; }
function engr(x, y, r, n, w){ var pts = []; for(var i = 0; i < n * 4; i++){ var t = i / (n * 4) * Math.PI * 2, rr = (i % 4 < 2) ? r : r * .78; pts.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr]); }
  return '<path d="' + U.polyD(pts) + '" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/>' + Ci(x, y, r * .3, 'none', ' stroke="' + ENC + '" stroke-width="' + w + '"'); }
function toile(x, y, R0, a0, a1, w){ var s = '', n = 5; for(var i = 0; i < n; i++){ var a = a0 + (a1 - a0) * i / (n - 1); s += 'M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * R0) + ' ' + f(y + Math.sin(a) * R0) + ' '; }
  for(var r = R0 * .3; r < R0; r += R0 * .24){ for(var i2 = 0; i2 < n - 1; i2++){ var aa = a0 + (a1 - a0) * i2 / (n - 1), bb = a0 + (a1 - a0) * (i2 + 1) / (n - 1), am = (aa + bb) / 2;
    s += 'M' + f(x + Math.cos(aa) * r) + ' ' + f(y + Math.sin(aa) * r) + ' Q' + f(x + Math.cos(am) * r * .85) + ' ' + f(y + Math.sin(am) * r * .85) + ' ' + f(x + Math.cos(bb) * r) + ' ' + f(y + Math.sin(bb) * r) + ' '; } }
  return L(s, ENC2, w); }
function cailloux(x, y, r, seed, w){ var R = rng(seed), s = ''; for(var i = 0; i < r * .9; i++){ var a = R() * 6.28, d = Math.sqrt(R()) * r, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .8, t = 1.8 + R() * 3, pts = [];
  for(var k = 0; k < 5; k++){ var b = k / 5 * 6.28 + R(); pts.push([px + Math.cos(b) * t, py + Math.sin(b) * t]); } s += '<path d="' + U.polyD(pts) + '" fill="#cbb185" stroke="' + ENC + '" stroke-width="' + w + '"/>'; } return s; }
function crane(x, y, t, c){ return G(x, y, 0, t / 10, '<path d="M-5 -1 C -5 -7 5 -7 5 -1 L 4 3 L 2 3 L 2 5 L -2 5 L -2 3 L -4 3 Z" fill="none" stroke="' + (c || ENC) + '" stroke-width="1.3" stroke-linejoin="round"/>' + Ci(-2, -1, 1.3, c || ENC) + Ci(2, -1, 1.3, c || ENC)); }

/* le décor des salles de la version 1 : dessiné dans leurs anciennes coordonnées, puis posé et agrandi comme dans le donjon */
function detailsV1(id){
  var w = 1.9, s = '';
  switch(id){
  case 'puits': s += '<circle cx="72" cy="160" r="20" fill="#9fb8c0" opacity=".25"/><circle cx="72" cy="160" r="20" fill="none" stroke="' + ENC + '" stroke-width="' + w + '" stroke-dasharray="4 3"/>' +
    L('M72 160 C 74 175 76 188 72 198', ENC, w) + '<ellipse cx="66" cy="201" rx="8" ry="5" fill="none" stroke="' + ENC + '" stroke-width="' + w * .8 + '"/>' + cailloux(118, 146, 7, 4, w * .7); break;
  case 'reserve': [[250, 58, 7], [264, 52, 6], [248, 76, 5.5]].forEach(function(t){ s += Ci(t[0], t[1], t[2], 'none', ' stroke="' + ENC + '" stroke-width="' + w + '"'); });
    s += '<rect x="313" y="50" width="14" height="12" fill="none" stroke="' + ENC + '" stroke-width="' + w + '" transform="rotate(8 320 56)"/>'; break;
  case 'canaux': s += '<rect x="288" y="270" width="24" height="136" fill="#6f9fa0" opacity=".45"/>' + L('M288 270 V406 M312 270 V406', ENC, w);
    for(var k = 0; k < 9; k++) s += L('M' + (293 + (k % 2) * 3) + ' ' + (282 + k * 13) + ' q3 -2 6 0 t6 0', '#2e5a6a', w * .7);
    s += '<rect x="281" y="343" width="38" height="19" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width="' + w + '"/>' + L('M287 343 V362 M293 343 V362 M299 343 V362 M305 343 V362 M311 343 V362', ENC2, w * .6) + colonne(218, 302, 5.5, w) + colonne(218, 374, 5.5, w); break;
  case 'givre': s += '<path d="' + C.LIEUX.givre.d + '" fill="#a8c4d0" opacity=".38" transform="translate(' + f(90 - 1000 / 1.2) + ' ' + f(342 - 1010 / 1.2) + ') scale(' + f(1000 / 1.2) / 1000 + ')"/>';
    [[40, 320, 30], [60, 300, 70], [128, 312, 140], [118, 385, 250], [52, 382, 300]].forEach(function(c){ for(var k3 = 0; k3 < 3; k3++){ var a = (c[2] + (k3 - 1) * 24) * Math.PI / 180; s += L('M' + c[0] + ' ' + c[1] + ' l' + f(-Math.cos(a) * 10) + ' ' + f(-Math.sin(a) * 10), ENC, w); } }); break;
  case 'toiles': s += toile(412, 286, 28, 0, Math.PI / 2, w * .6) + toile(528, 286, 24, Math.PI / 2, Math.PI, w * .6) + toile(412, 378, 20, -Math.PI / 2, 0, w * .6) + toile(528, 378, 20, Math.PI, Math.PI * 1.5, w * .6); break;
  case 'eboulis': s += cailloux(598, 446, 13, 81, w * .7) + cailloux(536, 468, 8, 83, w * .7); break;
  case 'atelier': s += engr(604, 186, 12, 9, w) + engr(621, 201, 7, 7, w) + engr(686, 212, 9, 8, w) + colonne(584, 152, 5, w) + colonne(696, 152, 5, w) + colonne(584, 228, 5, w) + colonne(696, 228, 5, w) +
    '<rect x="636" y="149" width="32" height="10" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/><rect x="655" y="221" width="26" height="9" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/>'; break;
  case 'bibliotheque': s += '<path d="M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80 L 704 104 L 576 104 Z" fill="#6f9fa0" opacity=".4"/>';
    for(var x = 582; x < 698; x += 7) s += L('M' + x + ' 41 V48', ENC, w * .7);
    s += L('M580 40 H700 M580 49 H700', ENC, w); break;
  case 'ossuaire': [[806, 140], [870, 140], [806, 220], [870, 220]].forEach(function(p){ s += '<path d="M' + (p[0] - 7) + ' ' + (p[1] + (p[1] < 180 ? 4 : -4)) + ' v' + (p[1] < 180 ? -6 : 6) + ' a7 5 0 0 1 14 0 v' + (p[1] < 180 ? 6 : -6) + '" fill="none" stroke="' + ENC + '" stroke-width="' + w + '" transform="' + (p[1] < 180 ? '' : 'rotate(180 ' + p[0] + ' ' + p[1] + ')') + '"/>'; });
    s += '<rect x="818" y="171" width="40" height="18" rx="2" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/>'; break;
  case 'camp': for(var k4 = 0; k4 < 9; k4++){ var a4 = k4 / 9 * 6.283; s += Ci(765 + Math.cos(a4) * 10, 300 + Math.sin(a4) * 8, 2, 'none', ' stroke="' + ENC + '" stroke-width="' + w * .8 + '"'); }
    s += '<path d="M765 306 C 760 300 763 296 765 291 C 767 296 770 300 765 306 Z" fill="#b8562a" opacity=".7" stroke="' + ENC + '" stroke-width="' + w * .6 + '"/>'; break;
  /* le coin déchiré : le grand bassin, la porte, la dernière salle */
  case 'bassin': s += '<path d="' + U.rrD(760, 448, 128, 64, 30) + '" fill="#6f9fa0" opacity=".45"/>' + '<path d="' + U.rrD(760, 448, 128, 64, 30) + '" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/>';
    [[714, 436], [770, 462], [736, 470], [790, 434]].forEach(function(q, i){ s += L('M' + q[0] + ' ' + q[1] + ' q5 -2 10 0 t10 0', '#2e5a6a', w * .7); });
    [[722, 436, 6], [796, 462, 5], [776, 428, 4.5]].forEach(function(q){ s += '<path d="M' + q[0] + ' ' + q[1] + ' l' + q[2] + ' -1.5 a' + q[2] + ' ' + q[2] + ' 0 1 1 0 3 Z" fill="#9fb48a" stroke="' + ENC + '" stroke-width="' + w * .6 + '"/>'; });
    /* deux yeux qui dépassent de l'eau */
    s += '<g transform="translate(-6 15)"><ellipse cx="752" cy="452" rx="9" ry="5" fill="none" stroke="' + ENC + '" stroke-width="' + w * .8 + '"/>' + Ci(748, 450, 2.2, 'none', ' stroke="' + ENC + '" stroke-width="' + w * .7 + '"') + Ci(756, 450, 2.2, 'none', ' stroke="' + ENC + '" stroke-width="' + w * .7 + '"') + Ci(748, 450, .9, ENC) + Ci(756, 450, .9, ENC) + '</g>';
    break;
  case 'porte4': s += Ci(905, 410, 20, 'none', ' stroke="' + ENC + '" stroke-width="' + w + '"') + Ci(905, 410, 15.5, 'none', ' stroke="' + ENC2 + '" stroke-width="' + w * .6 + '"') + L('M889 410 H921 M905 394 V426', ENC2, w * .5);
    s += '<g transform="translate(897 402) scale(.42)"><path d="' + C.SIGNES.oeil + '" fill="none" stroke="' + ENC + '" stroke-width="2.2"/></g>' +
      L('M909 400 H917 Q 917 405 913 405 Q 909 405 909 400 Z M911 398 q1 -1.5 0 -3', ENC, w * .55) +
      L('M894 414 Q 893 420 897 421 Q 901 420 900 414 M896 415 V419 M898 415 V419', ENC, w * .55) +
      '<g transform="translate(913 418) scale(.4)"><path d="' + C.SIGNES.etoile + '" fill="none" stroke="' + ENC + '" stroke-width="2.2"/></g>';
    break;
  case 'leo': s += '<rect x="884" y="324" width="24" height="12" rx="5" fill="none" stroke="' + ENC + '" stroke-width="' + w * .8 + '"/>'; break;
  }
  return s;
}
var V1C = {puits:[88, 180], reserve:[285, 76], canaux:[285, 338], givre:[90, 342], toiles:[470, 332], eboulis:[566, 452], atelier:[640, 190], bibliotheque:[640, 72], ossuaire:[838, 180], camp:[765, 300], rats:[285, 190], bassin:[760, 445], porte4:[905, 445], leo:[905, 322]};
function details(coin){
  var s = '', w = 1.7, K = U.K;
  Object.keys(V1C).forEach(function(k){ var o = C.LIEUX[k], v = V1C[k]; s += '<g transform="translate(' + o.x + ' ' + o.y + ') scale(' + K + ') translate(' + (-v[0]) + ' ' + (-v[1]) + ')">' + detailsV1(k) + '</g>'; });
  if(coin) return s;
  /* la grande galerie (le plan est vieux : il la montre intacte) */
  s += colonne(1050, 736, 6, w) + colonne(1050, 774, 6, w) + colonne(990, 736, 6, w) + colonne(990, 774, 6, w) + colonne(930, 736, 6, w) + colonne(930, 774, 6, w);
  s += '<rect x="1180" y="534" width="40" height="40" fill="#9fb8c0" opacity=".25"/>';
  for(var g = 0; g <= 40; g += 8) s += L('M' + (1180 + g) + ' 534 V574 M1180 ' + (534 + g) + ' H1220', ENC, w * .7);
  s += Ci(2135, 700, 28, 'none', ' stroke="' + ENC + '" stroke-width="' + w + '"') + Ci(2135, 700, 20, 'none', ' stroke="' + ENC2 + '" stroke-width="' + w * .6 + '" stroke-dasharray="4 4"');
  [[2135, 641, 0], [2199, 700, 90], [2135, 759, 0]].forEach(function(p){ s += G(p[0], p[1], p[2], 1, '<rect x="-17" y="-4" width="34" height="8" fill="#a0784a" stroke="' + ENC + '" stroke-width="' + w + '"/>'); });
  s += '<rect x="2272" y="689" width="48" height="22" rx="3" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/><path d="M2278 700 H2314" stroke="' + ENC + '" stroke-width="' + w * .6 + '"/>';
  s += L(C.LIEUX.egouts.d, '#6f9fa0', 9, ' opacity=".5"') + L(C.LIEUX.egouts.d, '#2e5a6a', 1.4, ' stroke-dasharray="6 7"');
  return s;
}

/* ---------- les textes à la plume ---------- */
function texte(x, y, lignes, taille, c, extra){
  var s = '';
  lignes.forEach(function(t, k){
    var yy = y + (k - (lignes.length - 1) / 2) * taille * 1.04;
    s += '<text x="' + f(x) + '" y="' + f(yy) + '" text-anchor="middle" dominant-baseline="central" font-size="' + f(taille) + '" font-family="' + POLICE + '" paint-order="stroke" stroke="' + SOLC + '" stroke-width="' + f(taille * .22) + '" stroke-linejoin="round" fill="' + (c || ENC) + '"' + (extra || '') + '>' + t + '</text>';
  });
  return s;
}
function rose(x, y, r){
  var s = Ci(x, y, r, 'none', ' stroke="' + ENC + '" stroke-width="1.8"') + Ci(x, y, r * .82, 'none', ' stroke="' + ENC + '" stroke-width=".9"');
  for(var k = 0; k < 32; k++){ var a = k / 32 * 6.283; s += L('M' + f(x + Math.cos(a) * r * .82) + ' ' + f(y + Math.sin(a) * r * .82) + ' L' + f(x + Math.cos(a) * r * (k % 4 ? .9 : .98)) + ' ' + f(y + Math.sin(a) * r * (k % 4 ? .9 : .98)), ENC, 1.1); }
  for(var k2 = 0; k2 < 8; k2++){
    var a2 = k2 / 8 * 6.283 - Math.PI / 2, lg = k2 % 2 ? r * .55 : r, la = k2 % 2 ? r * .09 : r * .14;
    var px = x + Math.cos(a2) * lg, py = y + Math.sin(a2) * lg, gx = x + Math.cos(a2 - Math.PI / 2) * la, gy = y + Math.sin(a2 - Math.PI / 2) * la, dx = x + Math.cos(a2 + Math.PI / 2) * la, dy = y + Math.sin(a2 + Math.PI / 2) * la;
    s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(gx) + ' ' + f(gy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="' + (k2 === 0 ? ROUGE : ENC) + '"/><path d="M' + f(x) + ' ' + f(y) + ' L' + f(dx) + ' ' + f(dy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width="1.2"/>';
  }
  return s + Ci(x, y, 3.5, ENC) + '<text x="' + f(x) + '" y="' + f(y - r - 15) + '" text-anchor="middle" dominant-baseline="central" font-size="27" font-family="' + POLICE + '" fill="' + ROUGE + '">N</text>';
}

/* ---------- « Les grilles des fondateurs » : une note codée, centrée en (x, y) ; t = la taille d'un signe ---------- */
function largeurCode(mot, t){ var lw = 0; mot.split('').forEach(function(ch){ lw += ch === ' ' ? t * .7 : t * 1.18; }); return lw - t * .18; }
function code(x, y, lignes, t, c, ep){
  var s = '', g = t / 30;
  lignes.forEach(function(mot, k){
    var lw = largeurCode(mot, t), xx = x - lw / 2, yy = y + (k - (lignes.length - 1) / 2) * t * 1.45 - t / 2;
    mot.split('').forEach(function(ch){
      if(ch === ' '){ xx += t * .7; return; }
      var q = C.PIGPEN(ch.charCodeAt(0) - 65);
      s += '<g transform="translate(' + f(xx) + ' ' + f(yy) + ') scale(' + f(g * 1000) / 1000 + ')"><path d="' + q.d + '" fill="none" stroke="' + (c || ENC) + '" stroke-width="' + (ep || 3.3) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        (q.p ? '<circle cx="' + q.p[0] + '" cy="' + q.p[1] + '" r="4" fill="' + (c || ENC) + '"/>' : '') + '</g>';
      xx += t * 1.18;
    });
  });
  return s;
}
function glyphes(lignes, t, c){
  var lw = Math.max.apply(null, lignes.map(function(m){ return largeurCode(m, t); })), h = (lignes.length - 1) * t * 1.45 + t;
  return '<svg class="glyphes" viewBox="' + f(-lw / 2 - 6) + ' ' + f(-h / 2 - 6) + ' ' + f(lw + 12) + ' ' + f(h + 12) + '" width="' + f(lw + 12) + '" height="' + f(h + 12) + '" aria-hidden="true">' + code(0, 0, lignes, t, c || ENC, 3.6) + '</svg>';
}
/* la clé : deux grilles (avec et sans point) et deux croix, A … Z dans l'ordre (comme schemaPig du mini-jeu) */
function cle(){
  var s = '<svg class="cle-svg" viewBox="0 0 430 112" role="img" aria-label="La clé de l’alphabet secret">';
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function lettre(x, y, cell, point){ return '<text x="' + x + '" y="' + y + '">' + ABC[cell] + '</text>' + (point ? '<circle cx="' + f(x + 10) + '" cy="' + f(y - 14) + '" r="2.6"/>' : ''); }
  function grille(ox, debut, point){
    var g = '<path d="M' + (ox + 33.3) + ' 6V106M' + (ox + 66.6) + ' 6V106M' + ox + ' 39.3H' + (ox + 100) + 'M' + ox + ' 72.6H' + (ox + 100) + '"/>';
    for(var k = 0; k < 9; k++){ var r = Math.floor(k / 3), c = k % 3; g += lettre(f(ox + 16.6 + c * 33.3), f(6 + 22.6 + r * 33.3), debut + k, point); }
    return g;
  }
  function croix(ox, debut, point){
    var g = '<path d="M' + (ox + 10) + ' 12L' + (ox + 90) + ' 100M' + (ox + 90) + ' 12L' + (ox + 10) + ' 100"/>', pos = [[50, 38], [24, 63], [76, 63], [50, 92]];
    for(var k = 0; k < 4; k++) g += lettre(ox + pos[k][0], pos[k][1], debut + k, point);
    return g;
  }
  return s + grille(4, 0, false) + grille(112, 9, true) + croix(220, 18, false) + croix(326, 22, true) + '</svg>';
}

/* ---------- le parchemin : bords irréguliers, et le coin déchiré (une seule déchirure pour les deux morceaux) ---------- */
var BORDS = (function(){
  var R = rng(77), c = P.cadre, x0 = c.x, y0 = c.y, x1 = c.x + c.w, y1 = c.y + c.h, A = 2.4 * K1, D = P.dechire;
  function bord(pts, xa, ya, xb, yb, n, amp){ for(var i = 0; i < n; i++){ var t = i / n; pts.push([xa + (xb - xa) * t + (R() - .5) * (amp || A), ya + (yb - ya) * t + (R() - .5) * (amp || A)]); } }
  function borne(p){ return [Math.min(x1 + 2.7, Math.max(x0 - 2.7, p[0])), Math.min(y1 + 2.7, Math.max(y0 - 2.7, p[1]))]; }
  /* la déchirure, de bas en haut */
  var tear = [];
  for(var i = 1; i < D.length - 2; i++){ var a = D[i], b = D[i + 1]; bord(tear, Math.min(a[0], x1), a[1], Math.min(b[0], x1), b[1], Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (5 * K1))), 5 * K1); }
  tear.push([x1, D[D.length - 2][1]]);
  var haut = [], droite = [], bas = [], gauche = [], droiteCoin = [], basCoin = [];
  bord(haut, x0, y0 + 2, x1, y0, 60);
  var yd = D[D.length - 2][1];
  bord(droite, x1, y0, x1, yd, 16);
  bord(bas, D[1][0], y1, x0, y1, 50);
  bord(gauche, x0, y1, x0, y0 + 2, 30);
  bord(droiteCoin, x1, yd, x1, y1, 12);
  bord(basCoin, x1, y1, D[1][0], y1, 14);
  var principal = haut.concat(droite).concat(tear.slice().reverse()).concat(bas).concat(gauche).map(borne);
  var coin = tear.concat(droiteCoin).concat(basCoin).map(borne);
  var entier = haut.concat(droite).concat(droiteCoin).concat(basCoin).concat(bas).concat(gauche).map(borne);
  return {principal:principal, coin:coin, entier:entier, dechirure:tear.map(borne)};
})();

/* ---------- le papier : une petite image de bruit, faite une fois (au lieu des filtres de la maquette) ---------- */
var PAPIER = null;
function papier(){
  if(PAPIER) return PAPIER;
  var N = 192, c = document.createElement('canvas'); c.width = c.height = N;
  var x = c.getContext('2d'), d = x.createImageData(N, N), R = rng(8);
  function grille(g){ var t = []; for(var i = 0; i < g * g; i++) t.push(R()); return t; }
  var oct = [[3, .45, grille(3)], [6, .3, grille(6)], [12, .15, grille(12)], [48, .1, grille(48)]];
  for(var y = 0; y < N; y++) for(var xx = 0; xx < N; xx++){
    var v = 0;
    oct.forEach(function(o){ var g = o[0], gx = xx / N * g, gy = y / N * g, x0 = Math.floor(gx), y0 = Math.floor(gy), tx = gx - x0, ty = gy - y0, G2 = o[2];
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      var a = G2[(y0 % g) * g + x0 % g], b = G2[(y0 % g) * g + (x0 + 1) % g], cc = G2[((y0 + 1) % g) * g + x0 % g], dd = G2[((y0 + 1) % g) * g + (x0 + 1) % g];
      v += o[1] * (a + (b - a) * tx + (cc - a) * ty + (a - b - cc + dd) * tx * ty); });
    var fib = R(), i = (y * N + xx) * 4, tache = Math.max(0, (v - .52) * 2.4);
    d.data[i] = 115; d.data[i + 1] = 76; d.data[i + 2] = 36;
    d.data[i + 3] = Math.round(Math.min(1, tache * .9 + (fib > .82 ? .12 : 0) + (1 - v) * .06) * 255);
  }
  x.putImageData(d, 0, 0);
  return (PAPIER = c.toDataURL('image/png'));
}

/* ======================================================================
   Le SVG du plan
   ====================================================================== */
function defs(id){
  var hs = '', R = rng(5), d = [];
  for(var i = -4; i < 8; i++) hs += '<path d="M' + f((i * 4 + R()) * K1) + ' 0 l ' + f(24 * K1) + ' ' + f(24 * K1) + '" stroke="' + ENC2 + '" stroke-width="' + f((.55 + R() * .35) * K1) + '" opacity="' + f(.55 + R() * .35) + '"/>';
  d.push('<pattern id="' + id + 'hach" width="' + f(24 * K1) + '" height="' + f(24 * K1) + '" patternUnits="userSpaceOnUse">' + hs + '</pattern>');
  d.push('<pattern id="' + id + 'murH" width="' + f(4 * K1) + '" height="' + f(4 * K1) + '" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="' + f(4 * K1) + '" height="' + f(4 * K1) + '" fill="#a27a48"/><path d="M0 ' + f(2 * K1) + ' H' + f(4 * K1) + '" stroke="#5a3a1e" stroke-width="' + f(.8 * K1) + '" opacity=".75"/></pattern>');
  d.push('<pattern id="' + id + 'quad" width="' + f(9 * K1) + '" height="' + f(9 * K1) + '" patternUnits="userSpaceOnUse"><path d="M' + f(9 * K1) + ' 0 V' + f(9 * K1) + ' H0" fill="none" stroke="' + ENC2 + '" stroke-width="' + f(.4 * K1) + '" opacity=".45"/></pattern>');
  d.push('<pattern id="' + id + 'quad2" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="22" height="22" fill="' + SOLC + '"/><rect x="11" y="0" width="11" height="11" fill="#7a5a36" opacity=".8"/><rect x="0" y="11" width="11" height="11" fill="#7a5a36" opacity=".8"/><path d="M0 0 H22 V22 H0 Z M11 0 V22 M0 11 H22" fill="none" stroke="' + ENC + '" stroke-width="1.4"/></pattern>');
  d.push('<pattern id="' + id + 'pap" width="340" height="340" patternUnits="userSpaceOnUse"><image href="' + papier() + '" width="340" height="340" preserveAspectRatio="none"/></pattern>');
  d.push('<mask id="' + id + 'mHach" maskUnits="userSpaceOnUse" x="' + f(PV.x) + '" y="' + f(PV.y) + '" width="' + f(PV.w) + '" height="' + f(PV.h) + '">' + union(MUR + 13, '#fff') + union(MUR + 26, '#fff', ' stroke-dasharray="14 22"') + '</mask>');
  d.push('<radialGradient id="' + id + 'brule" cx="' + f(PV.x + PV.w / 2) + '" cy="' + f(PV.y + PV.h / 2) + '" r="' + f(560 * K1) + '" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#7a4a1e" stop-opacity="0"/><stop offset=".9" stop-color="#7a4a1e" stop-opacity=".3"/><stop offset="1" stop-color="#4a2a10" stop-opacity=".55"/></radialGradient>');
  return d.join('');
}
/* le donjon à l'encre (le même pour les deux morceaux) */
function donjon(id, coin){
  var dj = '';
  dj += '<g mask="url(#' + id + 'mHach)"><rect x="' + f(PV.x) + '" y="' + f(PV.y) + '" width="' + f(PV.w) + '" height="' + f(PV.h) + '" fill="url(#' + id + 'hach)"/></g>';
  dj += union(MUR + 2 * K1, ENC) + union(MUR, 'url(#' + id + 'murH)') + union(2.4 * K1, ENC) + union(0, SOLC) + union(0, 'url(#' + id + 'quad)');
  var dl = C.LIEUX.dalles; dj += '<path d="' + dl.d + '" fill="none" stroke="url(#' + id + 'quad2)" stroke-width="' + (dl.l - 3) + '"/>';
  dj += details(coin);
  return dj;
}
function pli(){ var cx = PV.x + PV.w / 2, cy = PV.y + PV.h / 2;
  return L('M' + f(cx) + ' ' + f(PV.y) + ' V' + f(PV.y + PV.h), '#fff8e8', 3.6, ' opacity=".35"') + L('M' + f(cx + 3.6) + ' ' + f(PV.y) + ' V' + f(PV.y + PV.h), '#8a6438', 2.2, ' opacity=".22"') +
    L('M' + f(PV.x) + ' ' + f(cy) + ' H' + f(PV.x + PV.w), '#fff8e8', 3.6, ' opacity=".3"') + L('M' + f(PV.x) + ' ' + f(cy + 3.6) + ' H' + f(PV.x + PV.w), '#8a6438', 2.2, ' opacity=".2"'); }
function bordBrule(pts){ var d = U.polyD(pts), s = ''; [[30, .07], [20, .09], [11, .12], [5, .16]].forEach(function(q){ s += '<path d="' + d + '" fill="none" stroke="#5a3414" stroke-width="' + q[0] + '" opacity="' + q[1] + '"/>'; });
  return s + '<path d="' + d + '" fill="none" stroke="#3a1e0a" stroke-width="4" opacity=".55"/>'; }

function svg(){
  var x0 = PV.x, y0 = PV.y, w = PV.w, h = PV.h;
  var bord = U.polyD(BORDS.principal), bordC = U.polyD(BORDS.coin);
  /* ======== LE PRINCIPAL ======== */
  var s = '<defs>' + defs('p') + '<clipPath id="pparch"><path d="' + bord + '"/></clipPath></defs>';
  /* l'ombre du parchemin sur la table (sans flou : deux ombres décalées) */
  s += '<path d="' + bord + '" fill="#000" opacity=".28" transform="translate(9 16)"/><path d="' + bord + '" fill="#000" opacity=".35" transform="translate(4 8)"/>';
  var p = '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + PAR + '"/><rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h) + '" fill="url(#ppap)" opacity=".85"/>';
  p += pli();
  /* une tache de tasse, une goutte d'encre */
  p += Ci(1706, 1235, 47, 'none', ' stroke="#8a5a28" stroke-width="5.8" opacity=".18"') + Ci(1706, 1235, 41, '#a87a3a', ' opacity=".06"') + '<ellipse cx="872" cy="1235" rx="83" ry="47" fill="#9a7038" opacity=".07"/>';
  p += '<path d="M1512 555 c7 -5 16 -2 16 7 c0 9 -11 13 -16 7 c-5 4 -11 -4 -5 -7 z" fill="' + ENC + '" opacity=".7"/>' + Ci(1534, 544, 2.3, ENC, ' opacity=".7"');
  var cad = P.cadre;
  p += '<rect x="' + f(cad.x + 16) + '" y="' + f(cad.y + 15) + '" width="' + f(cad.w - 32) + '" height="' + f(cad.h - 30) + '" fill="none" stroke="' + ENC2 + '" stroke-width="2.7" opacity=".7"/>' +
    '<rect x="' + f(cad.x + 25) + '" y="' + f(cad.y + 24) + '" width="' + f(cad.w - 50) + '" height="' + f(cad.h - 48) + '" fill="none" stroke="' + ENC2 + '" stroke-width="1.3" opacity=".55"/>';
  p += '<g class="encre-plan">' + donjon('p', false) + '</g>';
  /* les signes au lieu des noms (et les mêmes sur les trois portes) */
  P.signes.forEach(function(sg){ p += signe(sg.s, sg.x, sg.y, sg.t); });
  /* les noms à la plume */
  P.noms.forEach(function(n){ if(!n.coin) p += texte(n.x, n.y, n.l, n.t); });
  /* les notes codées, le piège noté */
  P.notes.forEach(function(n){
    if(n.type === 'code'){
      var t = 12 * K1, lw = Math.max.apply(null, n.lignes.map(function(m){ return largeurCode(m, t); })) + 24, hh = (n.lignes.length - 1) * t * 1.45 + t + 22;
      p += '<g data-note="' + n.id + '"><path d="M' + f(n.x - lw / 2) + ' ' + f(n.y - hh / 2) + ' h' + f(lw) + ' v' + f(hh) + ' h' + f(-lw) + ' z" fill="#efdcae" opacity=".55"/>' +
        L('M' + f(n.x - lw / 2 + 5) + ' ' + f(n.y + hh / 2 + 5) + ' q' + f(lw / 2) + ' 7 ' + f(lw - 10) + ' 0', ENC2, 1.4, ' opacity=".7"') + code(n.x, n.y, n.lignes, t, ROUGE) + '</g>';
      /* la traduction au crayon (apparaît quand le Sage l'a déchiffrée) */
      p += '<g class="traduction" data-trad="' + n.id + '" style="display:none">' + texte(n.x, n.y + hh / 2 + 22, [n.dit], 22, CRAYON, ' font-style="italic"') + '</g>';
      if(n.crane) p += crane(n.crane.x, n.crane.y, 11 * K1, ROUGE);          /* un danger : le petit crâne rouge à côté de la note */
    }
  });
  /* la rose des vents, le titre */
  p += rose(P.rose.x, P.rose.y, P.rose.r);
  var tc = [[40, 30], [246, 30], [238, 46], [246, 62], [40, 62], [48, 46]].map(function(q){ return [(q[0] - 36.5) * K1 + 765, (q[1] - 22) * K1 + 429]; });
  p += '<path d="' + U.polyD(tc) + '" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width="2.2"/>' +
    L('M' + f(tc[5][0]) + ' ' + f(tc[0][1] + 7) + ' H' + f(tc[2][0]) + ' M' + f(tc[5][0]) + ' ' + f(tc[4][1] - 7) + ' H' + f(tc[2][0]), ENC2, 1.1, ' opacity=".7"') +
    '<text x="' + f(P.titre.x) + '" y="' + f(P.titre.y) + '" text-anchor="middle" dominant-baseline="central" font-size="' + f(19 * K1) + '" font-family="' + POLICE + '" fill="' + ENC + '">' + P.titre.t + '</text>' +
    texte(P.titre.x, P.titre.sy, [P.titre.sous], 11.5 * K1, ENC2);
  p += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h) + '" fill="url(#pbrule)"/>' + bordBrule(BORDS.principal);
  s += '<g clip-path="url(#pparch)">' + p + '</g>';
  /* la place du morceau perdu (sur la table) */
  var D = P.dechire, ins = BORDS.dechirure.map(function(q){ return [q[0] + 20, q[1] + 20]; }), xr = P.cadre.x + P.cadre.w - 18, yb = P.cadre.y + P.cadre.h - 14;
  var mx = (D[1][0] + xr) / 2 + 40, my = (D[D.length - 2][1] + yb) / 2 + 30;
  s += '<g class="place-coin"><path d="' + U.polyD([[ins[0][0], yb]].concat(ins).concat([[xr, ins[ins.length - 1][1]], [xr, yb]])) + '" fill="none" stroke="#e8d4a6" stroke-width="2.5" stroke-dasharray="11 11" opacity=".35"/>' +
    '<text x="' + f(mx) + '" y="' + f(my - 30) + '" text-anchor="middle" dominant-baseline="central" font-size="46">📜</text>' +
    '<text x="' + f(mx) + '" y="' + f(my + 28) + '" text-anchor="middle" dominant-baseline="central" font-size="25" font-weight="700" fill="#e8d4a6" opacity=".8" font-family="Andika, Trebuchet MS, sans-serif">Morceau perdu</text></g>';
  var principal = '<svg xmlns="http://www.w3.org/2000/svg" class="plan-svg" viewBox="' + [x0, y0, w, h].map(f).join(' ') + '" width="' + f(w) + '" height="' + f(h) + '">' + s + '</svg>';

  /* ======== LE COIN (le morceau déchiré, rangé dans la bibliothèque engloutie) ======== */
  var bc = U.boite(BORDS.coin, 30);
  var c = '<defs>' + defs('c') + '<clipPath id="cparch"><path d="' + bordC + '"/></clipPath></defs>';
  c += '<path d="' + bordC + '" fill="#000" opacity=".3" transform="translate(9 16)"/>';
  var q = '<rect x="' + f(bc.x) + '" y="' + f(bc.y) + '" width="' + f(bc.w) + '" height="' + f(bc.h) + '" fill="' + PAR + '"/><rect x="' + f(bc.x) + '" y="' + f(bc.y) + '" width="' + f(bc.w) + '" height="' + f(bc.h) + '" fill="url(#cpap)" opacity=".85"/>';
  q += pli();
  q += '<rect x="' + f(cad.x + 16) + '" y="' + f(cad.y + 15) + '" width="' + f(cad.w - 32) + '" height="' + f(cad.h - 30) + '" fill="none" stroke="' + ENC2 + '" stroke-width="2.7" opacity=".7"/>' +
    '<rect x="' + f(cad.x + 25) + '" y="' + f(cad.y + 24) + '" width="' + f(cad.w - 50) + '" height="' + f(cad.h - 48) + '" fill="none" stroke="' + ENC2 + '" stroke-width="1.3" opacity=".55"/>';
  q += '<g class="encre-plan">' + donjon('c', true) + '</g>';
  P.noms.forEach(function(n){ if(n.coin) q += texte(n.x, n.y, n.l, n.t); });
  P.notes.forEach(function(n){ if(n.type === 'coin') q += texte(n.x, n.y, n.lignes, 19, ROUGE); });
  /* le petit cœur à la porte (quand le Sage a entendu la voix derrière). Romain, 11 novembre (19 h 21) : « sur le plan du
     Sage, pas marqué Odette » — le cœur reste, le nom n'y est plus */
  q += '<g class="coeur-odette" style="display:none">' + G(2352, 1196, -8, 1, '<path d="M0 6 C -10 -2 -8 -10 -2 -9 C 0 -9 0 -7 0 -6 C 0 -7 0 -9 2 -9 C 8 -10 10 -2 0 6 Z" fill="#c0392b" opacity=".85" stroke="' + ENC + '" stroke-width="1.2"/>') + '</g>';
  q += '<rect x="' + f(bc.x) + '" y="' + f(bc.y) + '" width="' + f(bc.w) + '" height="' + f(bc.h) + '" fill="url(#cbrule)"/>' + bordBrule(BORDS.coin);
  c += '<g clip-path="url(#cparch)">' + q + '</g>';
  /* les fibres du papier arraché */
  c += L(U.polyD(BORDS.dechirure, false), '#f6ead0', 3.5, ' opacity=".6"');
  var coin = '<svg xmlns="http://www.w3.org/2000/svg" class="coin-svg" viewBox="' + [bc.x, bc.y, bc.w, bc.h].map(f).join(' ') + '" width="' + f(bc.w) + '" height="' + f(bc.h) + '">' + c + '</svg>';
  return {principal:principal, coin:coin, boiteCoin:bc};
}

/* ======================================================================
   L'encre invisible : ce qu'une note révèle (peint dans un canvas, à la résolution res px par unité)
   ====================================================================== */
function encre(ctx, n, res){
  var b = n.boite;
  ctx.save(); ctx.setTransform(res, 0, 0, res, -b.x * res, -b.y * res);
  ctx.clearRect(b.x, b.y, b.w, b.h);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  function ecrire(lignes, x, y, t){
    ctx.font = t + 'px ' + POLICE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lignes.forEach(function(l, k){ var yy = y + (k - (lignes.length - 1) / 2) * t * 1.04;
      ctx.lineWidth = t * .5; ctx.strokeStyle = 'rgba(159,246,255,.55)'; ctx.strokeText(l, x, yy);
      ctx.lineWidth = t * .2; ctx.strokeStyle = 'rgba(242,228,192,.9)'; ctx.strokeText(l, x, yy);
      ctx.fillStyle = INV; ctx.fillText(l, x, yy); });
  }
  if(n.passage){
    /* le passage secret, en pointillés (n.passage : l'id du couloir dans la carte) */
    var pts = C.LIEN[n.passage].pts, d = new Path2D(U.lisse(pts));
    ctx.strokeStyle = 'rgba(127,240,255,.45)'; ctx.lineWidth = 9; ctx.stroke(d);
    ctx.setLineDash([.1, 11]); ctx.strokeStyle = INV; ctx.lineWidth = 4; ctx.stroke(d); ctx.setLineDash([]);
    if(n.id === 'roue'){
      /* la roue des canaux, au départ du passage : un cercle, ses rayons, et un trait qui la relie à sa note */
      var r0 = pts[0], rx = r0[0] - 6, ry = r0[1] - 46;
      ctx.save(); ctx.translate(rx, ry);
      [[4.6, 'rgba(159,246,255,.6)'], [2, INV]].forEach(function(q){
        ctx.lineWidth = q[0]; ctx.strokeStyle = q[1];
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, 6.29); ctx.stroke();
        ctx.beginPath(); for(var k = 0; k < 4; k++){ var a = k * Math.PI / 4; ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15); ctx.lineTo(-Math.cos(a) * 15, -Math.sin(a) * 15); } ctx.stroke();
      });
      ctx.restore();
      ctx.strokeStyle = INV; ctx.lineWidth = 1.8; ctx.setLineDash([5, 6]);
      ctx.beginPath(); ctx.moveTo(rx + 6, ry + 18); ctx.quadraticCurveTo(rx + 20, n.y - 60, n.x - 40, n.y - 30); ctx.stroke(); ctx.setLineDash([]);
    }
    /* une petite flèche au bout */
    var fin = pts[pts.length - 1], av = pts[pts.length - 2], ang = Math.atan2(fin[1] - av[1], fin[0] - av[0]);
    ctx.save(); ctx.translate(fin[0], fin[1]); ctx.rotate(ang);
    ctx.strokeStyle = INV; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -9); ctx.lineTo(0, 0); ctx.lineTo(-14, 9); ctx.stroke();
    ctx.restore();
  }
  if(n.id === 'fleur'){
    /* une petite fleur de givre, dessinée à côté */
    ctx.save(); ctx.translate(b.x + 28, n.y); ctx.strokeStyle = INV; ctx.lineWidth = 2.4;
    for(var k = 0; k < 6; k++){ ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -15); ctx.moveTo(0, -9); ctx.lineTo(-5, -13); ctx.moveTo(0, -9); ctx.lineTo(5, -13); ctx.stroke(); }
    ctx.restore();
  }
  ecrire(n.lignes, n.x, n.y, 22);
  ctx.restore();
}

global.PLAN_SAGE = {svg:svg, encre:encre, glyphes:glyphes, cle:cle, bord:BORDS.principal, bordCoin:BORDS.coin, entier:BORDS.entier, K1:K1, largeurCode:largeurCode};
})(window);
