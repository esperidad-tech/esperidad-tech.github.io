/* scenes.js — les salles SANS COMBAT du donjon du puits (Les Enquêteurs de Brumeval, enquête 3).
   Salles d'objets, curiosités, pièges et scènes, vues de côté comme le combat (les trois héros à gauche, x de 0 à ~476).

   Deux choses par salle :
     1. le FOND : un grand SVG de 960 × 372 (sol à y = 340, comme le décor de combat de la salle des rats),
        photographié UNE fois en PNG opaque à 2× par rendre.py (scenes/png/<id>.png). Le jeu n'affiche que le PNG :
        aucun filtre, aucun SVG lourd en direct (règle de Romain du 9 novembre : fluide même sur une vieille tablette).
     2. ses ÉLÉMENTS : chaque chose à toucher (ou petit détail d'ambiance) est dessinée À PART, pour que le moteur la pose
        par-dessus le fond avec OBJETS.creer(conteneur, def) (objets.js). Les dessins des éléments n'ont aucun filtre :
        des dégradés seulement.

   API
     SCENES.W, SCENES.H, SCENES.SOL         960, 372, 340 (le repère de la scène)
     SCENES.HEROS                           {x0: 0, x1: 476} : la zone des héros (gardée sombre et vide)
     SCENES.ordre                           les identifiants des salles, dans l'ordre du chemin
     SCENES.salle(id)                       {id, nom, type, png, ambiance, elements: [def, …]} (une copie neuve à chaque appel)
     SCENES.fond(id)                        le SVG du fond (texte), pour rendre.py
     SCENES.base                            préfixe des chemins d'images (défaut '' : les PNG sont dans 'png/…', relatifs à scenes/)

   Le format d'un élément (def) — toutes les mesures sont dans le repère de la scène (960 × 372) :
     {id, type, nom,
      x, y, w, h,              la boîte du dessin (coin haut-gauche, taille) ; le dessin la remplit
      svg,                     le dessin (SVG autonome, viewBox 0 0 w h), pour les éléments d'une seule pièce
      pieces: [{id, svg, x, y, w, h, ox, oy, cache}]   pour les éléments articulés (chat, Léo, feu, porte…) :
                               x, y, w, h dans la boîte de l'élément ; ox, oy = le pivot, dans la pièce ; cache = invisible au départ
      zone: {x, y, w, h},      la zone de toucher (≥ 44 × 44), dans le repère de la scène ; absente = pas touchable
      lueur: '#rrggbb',        la couleur de sa brillance (objet à remarquer)
      pour, code,              à qui va l'objet ('alchimiste', 'sage', 'pisteur', 'tous') et le nom de son code (§9), s'il passe par code
      options: [def, def]      (type 'choix') les deux objets dont on n'en prend qu'un
      …                        et ce qui est propre à chaque type (voir objets.js)}
   Les types : objet, choix, tas, crane, dalle, porte, sarcophage, feu, chat, leo, deco (détail animé), particules (ambiance). */
(function(global){
'use strict';
var W = 960, H = 372, SOL = 340;
var O = '#24182e';

/* ================= la boîte à outils ================= */
function r1(v){ return Math.round(v * 10) / 10; }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); r = Math.max(0, Math.min(255, r)); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
/* les attributs : ceux d'origine, remplacés par ceux qu'on ajoute (x) — jamais deux fois le même (le SVG d'une <img> est lu en XML strict) */
function at(base, x){
  if(x){ var re = /([\w:-]+)="([^"]*)"/g, m; while((m = re.exec(x))) base[m[1]] = m[2]; }
  var s = ''; for(var k in base) if(base[k] != null) s += ' ' + k + '="' + base[k] + '"'; return s;
}
function P(d, f, x){ return '<path' + at({d: d, fill: f, stroke: O, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}, x) + '/>'; }
function L(d, c, w, x){ return '<path' + at({d: d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}, x) + '/>'; }
function F(d, f, x){ return '<path' + at({d: d, fill: f}, x) + '/>'; }
function C(x, y, r, f, x2){ return '<circle' + at({cx: r1(x), cy: r1(y), r: r1(r), fill: f}, x2) + '/>'; }
function E(x, y, rx, ry, f, x2){ return '<ellipse' + at({cx: r1(x), cy: r1(y), rx: r1(rx), ry: r1(ry), fill: f}, x2) + '/>'; }
function Rc(x, y, w, h, f, x2){ return '<rect' + at({x: r1(x), y: r1(y), width: r1(w), height: r1(h), fill: f}, x2) + '/>'; }
function op(v){ return ' opacity="' + r1(v * 100) / 100 + '"'; }
/* un chemin écrit autour d'un centre (cx, cy) : chaque paire « x y » est décalée */
function T(d, cx, cy){ return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function(m, a, b){ return r1(cx + +a) + ' ' + r1(cy + +b); }); }
/* un polygone à partir d'une liste de points */
function poly(pts){ return 'M' + pts.map(function(p){ return r1(p[0]) + ' ' + r1(p[1]); }).join(' L ') + ' Z'; }

/* les dégradés et les flous d'un dessin (identifiants uniques par dessin) */
var NUM = 0;
function Defs(p){ this.p = (p || 'd') + (++NUM) + '-'; this.n = 0; this.l = []; this.k = {}; }
function stops(st){ return st.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] == null ? '' : ' stop-opacity="' + s[2] + '"') + '/>'; }).join(''); }
Defs.prototype.lin = function(st, x1, y1, x2, y2, u){
  var k = 'l' + JSON.stringify([st, x1, y1, x2, y2, u]); if(this.k[k]) return this.k[k];
  var id = this.p + (++this.n);
  this.l.push('<linearGradient id="' + id + '" x1="' + (x1 == null ? 0 : x1) + '" y1="' + (y1 == null ? 0 : y1) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"' + (u ? ' gradientUnits="userSpaceOnUse"' : '') + '>' + stops(st) + '</linearGradient>');
  return (this.k[k] = 'url(#' + id + ')');
};
Defs.prototype.rad = function(st, cx, cy, r, u, fx, fy){
  var k = 'r' + JSON.stringify([st, cx, cy, r, u, fx, fy]); if(this.k[k]) return this.k[k];
  var id = this.p + (++this.n);
  this.l.push('<radialGradient id="' + id + '"' + (cx != null ? ' cx="' + cx + '" cy="' + cy + '" r="' + r + '"' : '') + (fx != null ? ' fx="' + fx + '" fy="' + fy + '"' : '') + (u ? ' gradientUnits="userSpaceOnUse"' : '') + '>' + stops(st) + '</radialGradient>');
  return (this.k[k] = 'url(#' + id + ')');
};
/* une lueur ronde : la couleur au centre, transparente au bord */
Defs.prototype.halo = function(c, o){ o = o == null ? 0.6 : o; return this.rad([[0, c, o], [0.42, c, o * 0.42], [0.75, c, o * 0.1], [1, c, 0]]); };
/* l'ombrage des objets du jeu : lumière en haut à droite (comme les héros) */
Defs.prototype.g = function(c, fort){ fort = fort || 1; return this.lin([[0, clair(c, 0.26 * fort)], [0.45, c], [1, sombre(c, 0.42 * fort)]], 1, 0, 0, 1); };
Defs.prototype.flou = function(s){
  var k = 'f' + s; if(this.k[k]) return this.k[k];
  var id = this.p + (++this.n);
  this.l.push('<filter id="' + id + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="' + s + '"/></filter>');
  return (this.k[k] = 'url(#' + id + ')');
};
function svgTexte(d, w, h, corps, vb){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (vb || ('0 0 ' + w + ' ' + h)) + '" width="' + w + '" height="' + h + '" overflow="hidden"><defs>' + d.l.join('') + '</defs>' + corps + '</svg>';
}
function lueurRonde(d, x, y, rx, ry, c, o){ return E(x, y, rx, ry, d.halo(c, o)); }
function ecran(s){ return '<g style="mix-blend-mode:screen">' + s + '</g>'; }
function multiplie(s){ return '<g style="mix-blend-mode:multiply">' + s + '</g>'; }

/* ================= les morceaux de décor ================= */
/* un mur de pierres taillées. o : {x0, y0, x1, y1, bw, bh, c (pierre), j (joint), cl (pierre claire), fo (pierre foncée),
   map(x, y) -> [x, y, échelle] (pour courber le mur), mousse (0..1), seed} */
function murBriques(d, o){
  var R = rng(o.seed || 7), s = Rc(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0, o.j);
  var rows = Math.ceil((o.y1 - o.y0) / o.bh);
  for(var r = 0; r < rows; r++){
    var y = o.y0 + r * o.bh, dec = (r % 2) ? o.bw * 0.5 : (r % 4 === 2 ? o.bw * 0.25 : 0);
    for(var x = o.x0 - o.bw + dec; x < o.x1 + o.bw; x += o.bw * (0.85 + R() * 0.35)){
      var w = o.bw * (0.8 + R() * 0.3) - 3, h = o.bh - 3, k = R();
      var col = k < 0.18 ? o.cl : (k < 0.36 ? o.fo : mix(o.c, k < 0.6 ? o.cl : o.fo, R() * 0.35));
      var p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      if(o.map) p = p.map(function(q){ return o.map(q[0], q[1]); });
      var bord = R() * 2.5;
      s += F(poly(p), col) +
        L('M' + r1(p[0][0] + 2) + ' ' + r1(p[0][1] + 1.5) + ' L ' + r1(p[1][0] - 3) + ' ' + r1(p[1][1] + 1.5), o.hl || clair(col, 0.18), 1.4, op(0.35 + bord * 0.1)) +
        L('M' + r1(p[3][0] + 1) + ' ' + r1(p[3][1] - 1) + ' L ' + r1(p[2][0] - 1) + ' ' + r1(p[2][1] - 1), sombre(col, 0.5), 1.6, op(0.5));
      if(R() < 0.1) s += L('M' + r1(p[0][0] + w * (0.2 + R() * 0.5)) + ' ' + r1(p[0][1] + 1) + ' l 1.5 3 l -1 2.5 l 2 3', sombre(col, 0.6), 1, op(0.6));
      if(o.mousse && R() < o.mousse * (0.25 + 0.75 * ((y - o.y0) / (o.y1 - o.y0)))){ var mx = p[3][0] + w * R(), my = p[3][1] - 1;
        for(var q = 0; q < 5; q++) s += C(mx + (R() - 0.5) * 14, my + (R() - 0.5) * 3, 0.8 + R() * 1.8, R() < 0.5 ? '#4a7a48' : '#2f5a36', op(0.5 + R() * 0.35)); }
    }
  }
  return s;
}
/* un mur de roche brute : des blocs irréguliers. o : {x0, y0, x1, y1, t (taille), c, cl, fo, j, seed} */
function murRoche(d, o){
  var R = rng(o.seed || 3), s = Rc(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0, o.j);
  var t = o.t || 46;
  for(var y = o.y0 - t * 0.3; y < o.y1 + t * 0.3; y += t * 0.62){
    for(var x = o.x0 - t * 0.5 + (R() * t * 0.5); x < o.x1 + t * 0.5; x += t * (0.7 + R() * 0.4)){
      var rx = t * (0.42 + R() * 0.2), ry = t * (0.3 + R() * 0.14), n = 6 + Math.floor(R() * 3), pts = [];
      for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2 + R() * 0.4; pts.push([x + Math.cos(a) * rx * (0.8 + R() * 0.3), y + Math.sin(a) * ry * (0.8 + R() * 0.3)]); }
      var k = R(), col = k < 0.2 ? o.cl : (k < 0.4 ? o.fo : mix(o.c, k < 0.7 ? o.cl : o.fo, R() * 0.4));
      if(o.teinte) col = o.teinte(x, y, col);
      s += F(poly(pts), col, ' stroke="' + o.j + '" stroke-width="2.4" stroke-linejoin="round"') +
        L('M' + r1(pts[n - 1][0]) + ' ' + r1(pts[n - 1][1]) + ' L ' + r1(pts[0][0]) + ' ' + r1(pts[0][1]) + ' L ' + r1(pts[1][0]) + ' ' + r1(pts[1][1]), clair(col, 0.22), 1.4, op(0.45)) +
        L('M' + r1(pts[Math.floor(n / 2)][0]) + ' ' + r1(pts[Math.floor(n / 2)][1]) + ' L ' + r1(pts[Math.floor(n / 2) + 1][0]) + ' ' + r1(pts[Math.floor(n / 2) + 1][1]), sombre(col, 0.5), 1.6, op(0.5));
    }
  }
  return s;
}
/* le sol : une bande de dalles vues un peu d'en haut. o : {y (bord du fond), c1 (haut), c2 (bas), joint, fuite (x du point de fuite), n} */
function solDalles(d, o){
  var y = o.y == null ? SOL : o.y, s = F('M0 ' + y + ' H ' + W + ' V ' + H + ' H 0 Z', d.lin([[0, o.c1], [1, o.c2]]));
  var j = o.joint || '#120e1c', fu = o.fuite == null ? 480 : o.fuite;
  s += L('M0 ' + (y + (H - y) * 0.42) + ' H ' + W + ' M0 ' + (y + (H - y) * 0.82) + ' H ' + W, j, 2.4, op(0.9));
  for(var x = -400; x < W + 400; x += o.pas || 150){ var xb = fu + (x - fu) * 1.5; s += L('M' + x + ' ' + y + ' L ' + r1(xb) + ' ' + H, j, 2.6); }
  s += L('M0 ' + (y + 1) + ' H ' + W, o.bord || clair(o.c1, 0.2), 2, op(0.5));
  return s;
}
/* une arche (un départ de couloir, une niche) : le trou, sa profondeur, ses claveaux */
function arche(d, x, w, top, bas, o){
  o = o || {};
  var l = x - w / 2, rr = x + w / 2, hb = top + w * 0.42, arc = 'M' + l + ' ' + bas + ' V ' + hb + ' C ' + l + ' ' + (top - w * 0.12) + ' ' + rr + ' ' + (top - w * 0.12) + ' ' + rr + ' ' + hb + ' V ' + bas;
  var s = F(arc + ' Z', o.trou || d.rad([[0, '#1c1830'], [0.55, '#08060e'], [1, '#0c0814']], 0.5, 0.78, 0.75));
  for(var k = 1; k <= 3; k++){ var ww = w * (1 - k * 0.2), ll = x - ww / 2, r2 = x + ww / 2, t2 = hb + k * 18, tt = top + k * 22;
    s += L('M' + ll + ' ' + bas + ' V ' + t2 + ' C ' + ll + ' ' + (tt - ww * 0.12) + ' ' + r2 + ' ' + (tt - ww * 0.12) + ' ' + r2 + ' ' + t2 + ' V ' + bas, o.cerne || '#3a3256', 4 - k, op(0.6 - k * 0.14)); }
  if(o.fond) s += o.fond;
  s += L(arc, '#0e0a16', (o.ep || 12) + 5) + L(arc, o.pierre || '#4a3e62', o.ep || 12);
  for(var v = 0; v <= 10; v++){ var t = v / 10, a = Math.PI * (1 - t), cx = x + Math.cos(a) * (w / 2), cy = hb - Math.sin(a) * (hb - top + w * 0.02);
    if(v > 0 && v < 10) s += L('M' + r1(cx - Math.cos(a) * 6) + ' ' + r1(cy + Math.sin(a) * 6) + ' L ' + r1(cx + Math.cos(a) * 6) + ' ' + r1(cy - Math.sin(a) * 6), '#0e0a16', 2); }
  s += L('M' + (rr + 3) + ' ' + hb + ' C ' + (rr + 3) + ' ' + (top + 10) + ' ' + (x + w * 0.2) + ' ' + (top - 4) + ' ' + x + ' ' + (top - 4), o.reflet || '#bfe8ff', 1.6, op(0.22));
  return s;
}
/* des champignons qui luisent (k : la taille) */
function champis(d, x, y, k, c, ch){
  c = c || '#5fe0f0'; ch = ch || '#bfe8e8';
  var s = lueurRonde(d, x, y - 8 * k, 26 * k, 18 * k, c, 0.5);
  [[-8, 12, 7], [0, 18, 9], [9, 10, 6]].forEach(function(m){
    var cx = x + m[0] * k, h = m[1] * k, r = m[2] * k;
    s += L('M' + r1(cx) + ' ' + y + ' L ' + r1(cx) + ' ' + r1(y - h), ch, 2.4 * k) +
      '<path d="M' + r1(cx - r) + ' ' + r1(y - h) + ' Q ' + r1(cx) + ' ' + r1(y - h - r * 1.3) + ' ' + r1(cx + r) + ' ' + r1(y - h) + ' Z" fill="' + c + '" stroke="' + O + '" stroke-width="' + r1(1.8 * k) + '"/>' +
      C(cx - r * 0.3, y - h - r * 0.4, r * 0.18, '#ffffff', op(0.85));
  });
  return s;
}
/* un cristal (un prisme pointu) : base (x, y), hauteur h, largeur w, angle a (degrés), couleur c */
function cristal(d, x, y, h, w, a, c){
  var g = d.lin([[0, clair(c, 0.55)], [0.5, c], [1, sombre(c, 0.45)]], 1, 0, 0, 1);
  return '<g transform="translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + r1(a) + ')">' +
    P('M' + r1(-w / 2) + ' 0 L ' + r1(-w / 2) + ' ' + r1(-h * 0.72) + ' L 0 ' + r1(-h) + ' L ' + r1(w / 2) + ' ' + r1(-h * 0.72) + ' L ' + r1(w / 2) + ' 0 Z', g, ' stroke-width="2.4"') +
    F('M0 ' + r1(-h) + ' L ' + r1(w / 2) + ' ' + r1(-h * 0.72) + ' L ' + r1(w / 2) + ' 0 L 0 0 Z', clair(c, 0.35), op(0.4)) +
    L('M' + r1(-w * 0.2) + ' ' + r1(-h * 0.2) + ' L ' + r1(-w * 0.2) + ' ' + r1(-h * 0.7), '#ffffff', 1.6, op(0.7)) + '</g>';
}
function cristaux(d, x, y, k, c, R){
  var s = lueurRonde(d, x, y - 14 * k, 44 * k, 30 * k, c, 0.55);
  [[-14, 22, 9, -24], [12, 26, 10, 20], [-4, 40, 13, -4], [6, 30, 10, 8], [-22, 16, 7, -40]].forEach(function(q){ s += cristal(d, x + q[0] * k, y, q[1] * k * (0.85 + R() * 0.3), q[2] * k, q[3], c); });
  return s;
}
/* une toile d'araignée dans un coin (sens : 1 = coin gauche, -1 = coin droit) */
function toile(x, y, t, sens, c){
  c = c || '#bfb8d8';
  var s = '', n = 5;
  for(var i = 0; i <= n; i++){ var a = (i / n) * Math.PI / 2; s += 'M' + x + ' ' + y + ' L ' + r1(x + sens * Math.cos(a) * t) + ' ' + r1(y + Math.sin(a) * t) + ' '; }
  for(var k = 1; k <= 4; k++){ var rr = t * k / 4.4; s += 'M' + r1(x + sens * rr) + ' ' + y; for(var j = 1; j <= n; j++){ var b = (j / n) * Math.PI / 2, bp = ((j - 0.5) / n) * Math.PI / 2;
    s += ' Q ' + r1(x + sens * Math.cos(bp) * rr * 0.86) + ' ' + r1(y + Math.sin(bp) * rr * 0.86) + ' ' + r1(x + sens * Math.cos(b) * rr) + ' ' + r1(y + Math.sin(b) * rr); } }
  return '<path d="' + s + '" fill="none" stroke="' + c + '" stroke-width="1" opacity=".32"/>';
}
/* des grains de poussière immobiles dans un rayon */
function grains(R, n, x0, x1, y0, y1, c, oMax){
  var s = '';
  for(var i = 0; i < n; i++){ var t = R(), y = y0 + (y1 - y0) * t, l = x0[0] + (x0[1] - x0[0]) * t, r = x1[0] + (x1[1] - x1[0]) * t;
    s += C(l + (r - l) * R(), y, 0.6 + R() * 1.4, c, op(0.2 + R() * (oMax || 0.5))); }
  return s;
}
/* des racines qui descendent de la voûte */
function racine(x, y, l, c, ep, R){
  var s = 'M' + x + ' ' + y, cx = x, cy = y;
  for(var i = 0; i < 4; i++){ var nx = cx + (R() - 0.5) * 22, ny = cy + l / 4; s += ' Q ' + r1(cx + (R() - 0.5) * 26) + ' ' + r1(cy + l / 8) + ' ' + r1(nx) + ' ' + r1(ny); cx = nx; cy = ny; }
  return L(s, sombre(c, 0.4), ep + 3) + L(s, c, ep) + L(s, clair(c, 0.25), Math.max(1, ep * 0.3), op(0.5));
}
/* un croissant de lune (centre x, y ; rayon r), ouvert à droite */
function croissant(x, y, r){ return 'M' + r1(x + r * 0.4) + ' ' + r1(y - r) + ' A ' + r + ' ' + r + ' 0 1 0 ' + r1(x + r * 0.4) + ' ' + r1(y + r) + ' A ' + r1(r * 0.72) + ' ' + r1(r * 0.72) + ' 0 1 1 ' + r1(x + r * 0.4) + ' ' + r1(y - r) + ' Z'; }
function fissure(x, y, c){ return L('M' + x + ' ' + y + ' l 6 10 l -4 8 l 7 9 l -2 12 M' + (x + 6) + ' ' + (y + 10) + ' l 9 3', c || '#0a0612', 1.8); }
/* des cailloux par terre */
function cailloux(R, n, x0, x1, y0, y1, c){
  var s = '';
  for(var i = 0; i < n; i++){ var x = x0 + (x1 - x0) * R(), y = y0 + (y1 - y0) * R(), r = 2 + R() * 6;
    s += E(x, y, r, r * 0.6, mix(c, '#0c0814', R() * 0.4), ' stroke="' + O + '" stroke-width="1.8"') + E(x + r * 0.25, y - r * 0.25, r * 0.4, r * 0.2, clair(c, 0.3), op(0.5)); }
  return s;
}
/* la brume au ras du sol */
function brumeSol(d, y, c, o){ return Rc(0, y - 60, W, 92, d.lin([[0, c, 0], [1, c, o == null ? 0.2 : o]])); }
/* la vignette : les bords dans le noir, comme le combat */
function vignette(d, cx, cy, force){
  force = force || 1;
  return Rc(0, 0, W, H, d.rad([[0.4, '#05030a', 0], [0.78, '#05030a', 0.7 * force], [1, '#05030a', Math.min(1, 0.96 * force)]], cx || W * 0.5, cy || H * 0.55, W * 0.64, true)) +
    Rc(0, 0, W, H, d.lin([[0, '#05030a', 0.8], [0.22, '#05030a', 0]])) +
    /* la zone des héros reste un peu plus sombre (ils se détachent) */
    Rc(0, 0, 470, H, d.lin([[0, '#05030a', 0.4], [1, '#05030a', 0]], 0, 0, 1, 0));
}
/* la nuit : un voile sombre sur tout le décor, percé autour des sources de lumière.
   lum : [[x, y, rx, ry, force (0..1)], …] ; force : l'opacité du voile loin des lumières */
function nuit(d, force, lum, c){
  var id = d.p + 'm' + (++d.n), m = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
  lum.forEach(function(l){ m += E(l[0], l[1], l[2], l[3], d.rad([[0, '#000', l[4] == null ? 1 : l[4]], [0.55, '#000', (l[4] == null ? 1 : l[4]) * 0.55], [1, '#000', 0]])); });
  d.l.push('<mask id="' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '">' + m + '</mask>');
  return '<rect width="' + W + '" height="' + H + '" fill="' + (c || '#05030c') + '" opacity="' + force + '" mask="url(#' + id + ')"/>';
}
/* les rochers noirs du premier plan, dans les coins du bas */
function avantPlan(){
  return '<path d="M0 ' + (H - 30) + ' C 20 ' + (H - 44) + ' 46 ' + (H - 40) + ' 60 ' + (H - 26) + ' L 70 ' + H + ' L 0 ' + H + ' Z" fill="#07050c"/>' +
    '<path d="M' + W + ' ' + (H - 36) + ' C ' + (W - 24) + ' ' + (H - 46) + ' ' + (W - 50) + ' ' + (H - 34) + ' ' + (W - 66) + ' ' + (H - 20) + ' L ' + (W - 72) + ' ' + H + ' L ' + W + ' ' + H + ' Z" fill="#07050c"/>';
}
/* une trace de patte de chat à SIX doigts (Moustache) : (x, y) le coussinet, a l'angle */
function patte6(x, y, a, c){
  var s = E(0, 0, 4.2, 3.4, c);
  [[-6.2, -3.4], [-4.6, -6.6], [-1.6, -8.4], [1.8, -8.4], [4.8, -6.6], [6.4, -3.4]].forEach(function(t){ s += E(t[0] * 0.95, t[1] * 0.9, 1.5, 1.8, c); });
  return '<g transform="translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + a + ') scale(1 .55)">' + s + '</g>';
}


/* ======================================================================
   LES FONDS (960 × 372, sol à 340) — un par salle
   ====================================================================== */
var FONDS = {};

/* ---------- 0. Le fond du puits (départ) : on vient de descendre ; la lune tout en haut ; trois départs de couloir ---------- */
FONDS.puits = function(){
  var d = new Defs('pu'), R = rng(41), s = '';
  var CX = 600, RC = 760, OEIL = 236;
  /* le mur rond du puits : les assises se courbent (on est au fond d'un cylindre) */
  function map(x, y){ var t = Math.max(-1.2, Math.min(1.2, (x - CX) / RC)), th = Math.asin(Math.max(-0.99, Math.min(0.99, t))), cz = Math.cos(th);
    return [CX + RC * Math.sin(th), OEIL + (y - OEIL) / Math.pow(cz, 0.55)]; }
  s += Rc(0, 0, W, H, '#0c0a16');
  s += murBriques(d, {x0: -40, y0: -30, x1: W + 40, y1: SOL + 10, bw: 40, bh: 21, c: '#2a2a46', j: '#0b0916', cl: '#3a3c60', fo: '#1a1830', map: map, mousse: 0.16, seed: 11});
  /* l'eau qui suinte sur les pierres */
  [[500, 20, 120], [712, 40, 150], [860, 10, 110], [380, 60, 90]].forEach(function(t){
    s += F('M' + t[0] + ' ' + t[1] + ' q 4 ' + t[2] * 0.5 + ' -2 ' + t[2] + ' q 8 -' + t[2] * 0.4 + ' 6 -' + t[2] + ' Z', '#05040c', op(0.35)) + L('M' + (t[0] + 2) + ' ' + (t[1] + 6) + ' q 3 ' + t[2] * 0.4 + ' 0 ' + t[2] * 0.8, '#9ab8e8', 1, op(0.25));
  });
  /* le départ nord : une grande arche au fond, derrière le rayon de lune */
  s += arche(d, 600, 150, 150, SOL, {pierre: '#454866', cerne: '#2e3050',
    fond: F('M560 ' + SOL + ' L 640 ' + SOL + ' L 624 252 L 576 252 Z', '#1a1a2e', op(0.8))});
  /* le départ ouest : une ouverture basse, à gauche (derrière les héros, dans le noir) */
  s += arche(d, 46, 120, 168, SOL, {pierre: '#2e2e48', cerne: '#22223a', reflet: '#5a6a8a'});
  /* le départ est : à droite, un couloir qui file */
  s += arche(d, 858, 128, 162, SOL, {pierre: '#3e4060', cerne: '#2a2c48'});
  /* des racines du Vieux Chêne, au plafond */
  s += racine(240, -4, 110, '#4a3424', 5, R) + racine(930, -4, 90, '#4a3424', 4, R) + racine(780, -4, 70, '#3e2a1c', 3, R);
  s += toile(W, 0, 96, -1) + toile(0, 0, 80, 1);
  /* le sol : de vieilles dalles, une flaque de lune, la corde enroulée, un seau cassé */
  s += solDalles(d, {c1: '#36384e', c2: '#100e1a', fuite: 600, pas: 130});
  s += E(CX - 6, SOL + 20, 64, 6, '#7a8ab8', op(0.5)) + E(CX - 14, SOL + 19, 30, 2, '#eef4ff', op(0.6));
  /* la corde enroulée par terre (la partie qui pend est un élément qui se balance) */
  for(var k = 0; k < 4; k++) s += E(CX + 34, SOL + 14 - k * 3.2, 34 - k * 3, 8 - k * 0.8, 'none', ' stroke="' + O + '" stroke-width="7"') + E(CX + 34, SOL + 14 - k * 3.2, 34 - k * 3, 8 - k * 0.8, 'none', ' stroke="#b0905a" stroke-width="4"');
  s += L('M' + (CX + 2) + ' ' + (SOL + 10) + ' q 10 -4 18 -2', '#e8d0a0', 1.4, op(0.7)) + L('M' + (CX + 60) + ' ' + (SOL + 12) + ' q 12 6 30 4', O, 7) + L('M' + (CX + 60) + ' ' + (SOL + 12) + ' q 12 6 30 4', '#b0905a', 4);
  /* le seau, cassé, sur le côté */
  s += '<g transform="translate(796 ' + (SOL + 8) + ') rotate(-78)">' + P('M-16 -18 L 16 -18 L 12 14 L -12 14 Z', d.g('#6a4a30')) + L('M-15 -8 L 15 -8 M-13 6 L 13 6', '#3a3a44', 3) + L('M-6 -18 L -5 14 M5 -18 L 4 14', '#4a3020', 1.4) + '</g>' +
    P('M826 ' + (SOL + 18) + ' l 14 -3 l 2 5 l -14 3 Z', '#5a3a22') + P('M760 ' + (SOL + 22) + ' l 10 -6 l 3 4 l -10 6 Z', '#5a3a22');
  /* les traces de Moustache (six doigts !) qui filent vers l'est */
  [[690, 362, 84], [712, 352, 96], [736, 362, 84], [760, 352, 96], [884, 362, 86], [908, 352, 94]].forEach(function(t){ s += patte6(t[0], t[1], t[2], '#100c1c'); });
  s += cailloux(R, 16, 420, 940, SOL + 6, H - 6, '#3a3a52');
  /* la nuit, percée par la lune et les cristaux */
  s += nuit(d, 0.6, [[CX, 110, 230, 300, 1], [CX + 10, 330, 230, 80, 1], [742, 320, 80, 60, 0.7], [952, 310, 80, 70, 0.7], [858, 300, 60, 50, 0.5]]);
  /* le rayon de lune */
  s += ecran(E(CX, 150, 240, 230, d.halo('#7f9ccc', 0.32)) + E(CX, 330, 200, 50, d.halo('#9ab8e8', 0.3)) + E(858, 300, 40, 26, d.halo('#5fe0d0', 0.3)) + E(600, 250, 30, 10, d.halo('#6a80b0', 0.35)));
  var ray = d.lin([[0, '#dfeaff', 0.42], [0.55, '#b0c8ff', 0.16], [1, '#a0b8f0', 0.06]]);
  s += ecran(F('M' + (CX - 70) + ' 0 L ' + (CX + 90) + ' 0 L ' + (CX + 150) + ' ' + SOL + ' L ' + (CX - 120) + ' ' + SOL + ' Z', ray) +
    F('M' + (CX - 34) + ' 0 L ' + (CX + 50) + ' 0 L ' + (CX + 76) + ' ' + SOL + ' L ' + (CX - 58) + ' ' + SOL + ' Z', ray, op(0.8)));
  s += E(CX + 14, SOL + 10, 150, 14, '#cfe0ff', op(0.14));
  s += grains(R, 46, [CX - 60, CX - 110], [CX + 80, CX + 140], 10, SOL - 6, '#eef4ff', 0.6);
  /* des cristaux bleu-vert au pied des murs */
  s += cristaux(d, 742, SOL - 2, 0.9, '#4fd8c8', R) + cristaux(d, 952, SOL - 4, 1.1, '#4fd8c8', R) + cristaux(d, 404, SOL - 2, 0.55, '#3fb8b0', R);
  s += champis(d, 500, SOL - 1, 0.6, '#5fe0f0');
  s += brumeSol(d, SOL, '#8aa0d0', 0.18);
  s += vignette(d, 610, 200, 1);
  /* l'ouverture du puits, tout en haut (après la vignette : c'est la lumière) : le ciel de nuit, la lune, les étoiles */
  s += E(CX + 8, -2, 92, 30, '#05030a') + E(CX + 8, -4, 76, 21, d.rad([[0, '#a8bce8'], [0.5, '#4a5c94'], [1, '#141a34']])) +
    C(CX + 36, -8, 9, '#f4f8ff') + C(CX + 32, -10, 8, '#c8dcff', op(0.35)) +
    [[560, 4], [578, 10], [640, 10], [656, 4], [598, 12]].map(function(p){ return C(p[0], p[1], 1.1, '#ffffff', op(0.9)); }).join('') +
    L('M' + (CX - 86) + ' 0 Q ' + (CX + 8) + ' 36 ' + (CX + 102) + ' 0', '#0b0916', 9) + L('M' + (CX - 80) + ' 5 Q ' + (CX + 8) + ' 33 ' + (CX + 96) + ' 5', '#3a3c60', 2.4, op(0.7)) +
    ecran(E(CX + 8, 6, 150, 50, d.halo('#9ab8ff', 0.22)));
  s += avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La galerie effondrée (cul-de-sac) : des poutres cassées, un éboulis qui ferme tout ; des lichens ambrés ---------- */
FONDS.galerie = function(){
  var d = new Defs('ga'), R = rng(23), s = '';
  s += Rc(0, 0, W, H, '#120c10');
  s += murRoche(d, {x0: -20, y0: -20, x1: W + 20, y1: SOL + 8, t: 40, c: '#352828', cl: '#463430', fo: '#20161a', j: '#0c070a', seed: 5});
  /* le fond de la galerie qui s'enfonce (au milieu) : un trou sombre, puis bouché par l'éboulis */
  s += F('M478 ' + SOL + ' L 482 150 Q 570 110 668 146 L 676 ' + SOL + ' Z', d.rad([[0, '#05030a', 0.95], [0.7, '#05030a', 0.8], [1, '#05030a', 0.3]], 0.5, 0.65, 0.7));
  /* les cadres de boisage de la vieille mine (les Fondateurs creusaient ici) */
  function poteau(x, y0, y1, a){ return '<g transform="rotate(' + (a || 0) + ' ' + x + ' ' + y1 + ')">' + P('M' + (x - 9) + ' ' + y0 + ' L ' + (x + 9) + ' ' + y0 + ' L ' + (x + 10) + ' ' + y1 + ' L ' + (x - 10) + ' ' + y1 + ' Z', d.lin([[0, '#7a5434'], [0.5, '#5a3a22'], [1, '#2e1c12']], 1, 0, 0, 0)) +
    L('M' + (x - 3) + ' ' + (y0 + 10) + ' L ' + (x - 4) + ' ' + (y1 - 10), '#3a2414', 1.6) + L('M' + (x + 4) + ' ' + (y0 + 30) + ' L ' + (x + 4) + ' ' + (y0 + 80), '#8a6440', 1.2, op(0.6)) + '</g>'; }
  function chapeau(x0, x1, y, a, cx){ return '<g transform="rotate(' + (a || 0) + ' ' + (cx || x0) + ' ' + y + ')">' + P('M' + x0 + ' ' + (y - 9) + ' L ' + x1 + ' ' + (y - 9) + ' L ' + x1 + ' ' + (y + 9) + ' L ' + x0 + ' ' + (y + 9) + ' Z', d.lin([[0, '#7a5434'], [1, '#3a2414']])) +
    L('M' + (x0 + 8) + ' ' + (y - 2) + ' L ' + (x1 - 8) + ' ' + (y - 3), '#3a2414', 1.4) + '</g>'; }
  /* les cadres du fond (petits, loin) */
  s += '<g opacity=".4">' + poteau(512, 176, SOL - 6) + poteau(640, 176, SOL - 6) + chapeau(500, 652, 174) + '</g>';
  s += '<g opacity=".6">' + poteau(494, 150, SOL - 2) + poteau(660, 150, SOL - 2) + chapeau(480, 674, 148) + '</g>';
  /* la voûte : de la roche brute, sombre, qui pend */
  s += F('M0 0 H ' + W + ' V 26 C 900 40 860 22 800 36 C 740 50 700 30 640 44 C 580 58 520 40 460 52 C 380 66 320 40 240 50 C 160 60 80 36 0 46 Z', '#0a0608') +
    L('M0 46 C 80 36 160 60 240 50 C 320 40 380 66 460 52 C 520 40 580 58 640 44 C 700 30 740 50 800 36 C 860 22 900 40 ' + W + ' 26', '#3a2c2c', 2, op(0.7));
  /* le cadre de gauche, intact (derrière les héros) */
  s += poteau(150, 46, SOL + 6) + poteau(420, 46, SOL + 6) + chapeau(120, 450, 50);
  /* le cadre de droite, cassé : le chapeau pend */
  s += poteau(720, 60, SOL + 6) + chapeau(706, 820, 64, 24, 712) + P('M818 110 l 10 -6 l 6 10 l -8 4 Z', '#5a3a22');
  /* l'éboulis : il ferme la galerie, à droite (de gros blocs, des pierres, de la poussière) */
  var bl = [[960, 300, 120, 90], [870, 310, 70, 44], [930, 210, 80, 70], [820, 330, 50, 26], [990, 120, 90, 110], [900, 130, 56, 46], [960, 40, 80, 60], [840, 230, 40, 34], [780, 330, 30, 18], [880, 60, 40, 40]];
  bl.forEach(function(b, i){ var pts = [], n = 7;
    for(var k = 0; k < n; k++){ var a = k / n * Math.PI * 2 + R() * 0.5; pts.push([b[0] + Math.cos(a) * b[2] * (0.75 + R() * 0.3), b[1] + Math.sin(a) * b[3] * (0.75 + R() * 0.3)]); }
    var col = mix('#4a3830', '#2a1e1c', R() * 0.6);
    s += F(poly(pts), d.lin([[0, clair(col, 0.2)], [0.5, col], [1, sombre(col, 0.5)]], 1, 0, 0, 1), ' stroke="' + O + '" stroke-width="3" stroke-linejoin="round"') +
      L('M' + r1(pts[5][0]) + ' ' + r1(pts[5][1]) + ' L ' + r1(pts[6][0]) + ' ' + r1(pts[6][1]) + ' L ' + r1(pts[0][0]) + ' ' + r1(pts[0][1]), clair(col, 0.35), 2, op(0.6));
    if(i % 2) s += L('M' + r1(b[0] - b[2] * 0.4) + ' ' + r1(b[1] - b[3] * 0.1) + ' l 10 3 l 6 9 l 12 2', '#120a0c', 1.4);
  });
  s += cailloux(R, 40, 700, 960, SOL - 30, SOL + 6, '#4a3830');
  /* le poteau tombé en travers, devant l'éboulis */
  s += '<g transform="rotate(-24 760 ' + (SOL - 6) + ')">' + P('M610 ' + (SOL - 16) + ' L 860 ' + (SOL - 16) + ' L 862 ' + (SOL + 2) + ' L 610 ' + (SOL + 2) + ' Z', d.lin([[0, '#7a5434'], [1, '#2e1c12']])) +
    P('M860 ' + (SOL - 16) + ' l 10 4 l -6 4 l 8 6 l -10 4 Z', '#c8a070', ' stroke-width="2"') + L('M630 ' + (SOL - 9) + ' L 840 ' + (SOL - 10), '#3a2414', 1.4) + '</g>';
  /* une vieille brouette renversée, une pioche (au fond) */
  s += '<g opacity=".8">' + P('M540 ' + (SOL - 2) + ' L 600 ' + (SOL - 30) + ' L 616 ' + (SOL - 8) + ' L 560 ' + (SOL + 4) + ' Z', d.g('#5a3a26')) + C(612, SOL - 2, 9, '#2a1a12', ' stroke="' + O + '" stroke-width="2.5"') +
    L('M520 ' + (SOL - 30) + ' L 584 ' + (SOL - 6), '#5a3a22', 4) + '</g>' +
    L('M470 ' + (SOL - 4) + ' L 504 ' + (SOL - 62), O, 7) + L('M470 ' + (SOL - 4) + ' L 504 ' + (SOL - 62), '#7a5434', 4) + P('M488 ' + (SOL - 66) + ' Q 506 ' + (SOL - 76) + ' 526 ' + (SOL - 62) + ' L 520 ' + (SOL - 58) + ' Q 506 ' + (SOL - 66) + ' 494 ' + (SOL - 60) + ' Z', '#5a5a6a');
  /* le sol : de la terre, des cailloux, de la poussière */
  s += F('M0 ' + SOL + ' H ' + W + ' V ' + H + ' H 0 Z', d.lin([[0, '#3e3030'], [1, '#120a0c']]));
  s += L('M0 ' + (SOL + 1) + ' H ' + W, '#5a4640', 2, op(0.5));
  s += cailloux(R, 26, 40, 940, SOL + 6, H - 6, '#4a3a36');
  s += toile(0, 0, 90, 1, '#d8c8b8') + toile(W, 0, 70, -1, '#d8c8b8');
  var lich = [[548, 196, 1], [300, 130, 0.8], [690, 250, 0.9], [610, 90, 0.7], [856, 180, 0.8], [380, 260, 0.6], [80, 200, 0.6], [760, 140, 0.6]];
  s += nuit(d, 0.62, lich.map(function(l){ return [l[0], l[1], 120 * l[2], 90 * l[2], 0.8]; }).concat([[720, 200, 110, 260, 0.7], [640, SOL, 160, 60, 0.6]]));
  /* une lumière froide qui passe par une fente de la voûte effondrée (à droite) */
  var ray = d.lin([[0, '#c8dcff', 0.42], [1, '#a0b8f0', 0.05]]);
  s += ecran(F('M780 30 L 806 30 L 700 ' + SOL + ' L 640 ' + SOL + ' Z', ray) + F('M812 30 L 822 30 L 752 ' + SOL + ' L 730 ' + SOL + ' Z', ray, op(0.6)));
  s += grains(R, 30, [776, 640], [810, 700], 36, SOL - 10, '#eef4ff', 0.5) + E(690, SOL + 10, 80, 7, '#c8dcff', op(0.12));
  /* des lichens ambrés qui luisent (la lumière chaude de la galerie) */
  lich.forEach(function(l){
    s += ecran(E(l[0], l[1], 70 * l[2], 50 * l[2], d.halo('#ffaa40', 0.5)));
    for(var k = 0; k < 12; k++) s += C(l[0] + (R() - 0.5) * 40 * l[2], l[1] + (R() - 0.5) * 24 * l[2], 1.2 + R() * 2.6, R() < 0.5 ? '#ffd890' : '#ffa040', op(0.7 + R() * 0.3));
  });
  s += champis(d, 446, SOL - 1, 0.55, '#ffb050', '#e8c8a0') + champis(d, 930, SOL - 40, 0.5, '#ffb050', '#e8c8a0');
  s += grains(R, 40, [480, 480], [960, 960], 60, SOL, '#ffd8a0', 0.3);
  s += brumeSol(d, SOL, '#c8a080', 0.14);
  s += vignette(d, 640, 210, 1.05) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- Le puits d'aération (cul-de-sac) : un rai de lumière verte et dorée par une cheminée ; des plantes qui poussent ---------- */
FONDS.aeration = function(){
  var d = new Defs('ae'), R = rng(57), s = '';
  s += Rc(0, 0, W, H, '#0c120e');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: SOL + 8, bw: 34, bh: 19, c: '#2a3430', j: '#0a100c', cl: '#3a4a40', fo: '#18201c', mousse: 0.5, seed: 31, hl: '#6a8a70'});
  /* la cheminée d'aération, dans la voûte (en haut, à droite du milieu) : un carré de jour, vu d'en dessous */
  s += F('M610 0 L 770 0 L 744 46 L 640 46 Z', '#0e1810') + F('M626 0 L 754 0 L 734 34 L 648 34 Z', d.lin([[0, '#f4ffd8'], [1, '#a8d890']])) +
    L('M610 0 L 640 46 L 744 46 L 770 0', '#2a3a2c', 6) + L('M640 46 L 744 46', '#5a7a5a', 2, op(0.7));
  /* les grandes feuilles et le lierre qui tombent de la cheminée */
  function feuille(x, y, a, t, c){ return '<g transform="translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + r1(a) + ') scale(' + t + ')">' +
    P('M0 0 C 6 -8 18 -10 26 -2 C 18 6 6 6 0 0 Z', d.lin([[0, clair(c, 0.25)], [1, sombre(c, 0.3)]], 1, 0, 0, 1), ' stroke-width="2"') + L('M2 0 L 22 -2', sombre(c, 0.45), 1.2) + '</g>'; }
  [[640, 40, 150], [664, 44, 110], [700, 46, 180], [736, 42, 120], [752, 30, 90]].forEach(function(v, i){
    var y = v[1], x = v[0], sv = 'M' + x + ' ' + y;
    for(var k = 0; k < 6 && y < v[1] + v[2]; k++){ var nx = x + (R() - 0.5) * 16, ny = y + v[2] / 6; sv += ' Q ' + r1(x + (R() - 0.5) * 20) + ' ' + r1(y + v[2] / 12) + ' ' + r1(nx) + ' ' + r1(ny); x = nx; y = ny; }
    s += L(sv, '#1e3a20', 4) + L(sv, '#3e6a34', 2);
    for(var f = 0; f < 7; f++){ var t = (f + 0.5) / 7; s += feuille(v[0] + (R() - 0.5) * 16, v[1] + v[2] * t, (f % 2 ? 30 : 150) + (R() - 0.5) * 40, 0.55 + R() * 0.35, f % 3 ? '#4a8a40' : '#6aa850'); }
  });
  /* un filet d'eau qui coule le long du mur, une petite vasque */
  s += F('M896 0 C 890 80 902 160 892 240 C 888 290 896 320 890 ' + (SOL - 8) + ' L 916 ' + (SOL - 8) + ' C 920 300 912 250 918 180 C 922 110 914 50 918 0 Z', d.lin([[0, '#05080a', 0.7], [0.5, '#0a1418', 0.5], [1, '#05080a', 0.7]], 0, 0, 1, 0)) +
    L('M906 0 C 902 60 912 120 904 190 C 900 240 908 280 902 ' + (SOL - 12), '#7ac8d0', 2.4, op(0.35)) +
    L('M907 10 C 904 50 910 90 908 110 M905 150 C 903 175 905 190 904 205 M903 250 C 902 270 904 290 902 300', '#dff8ff', 1.2, op(0.7)) + E(900, SOL - 2, 40, 9, '#0c1a1c', ' stroke="' + O + '" stroke-width="2.5"') + E(900, SOL - 4, 32, 5, '#3a7a80', op(0.6)) + E(894, SOL - 5, 12, 1.5, '#dff8ff', op(0.6));
  /* une vieille grille d'égout dans le mur (à gauche, derrière les héros) et des tuyaux de terre cuite */
  s += Rc(250, 150, 80, 70, '#060a08', ' stroke="#2a3430" stroke-width="6"') + L('M266 150 V 220 M282 150 V 220 M298 150 V 220 M314 150 V 220', '#3a3430', 4) +
    '';
  /* la butte de mousse et d'herbe, dans la lumière (les herbes lumineuses sont un élément posé dessus) */
  s += F('M560 ' + (SOL + 4) + ' C 590 ' + (SOL - 34) + ' 650 ' + (SOL - 50) + ' 710 ' + (SOL - 46) + ' C 770 ' + (SOL - 42) + ' 820 ' + (SOL - 24) + ' 850 ' + (SOL + 4) + ' Z',
    d.lin([[0, '#6a9a4a'], [0.45, '#3e6a34'], [1, '#1c2e1a']]), ' stroke="' + O + '" stroke-width="3"');
  for(var g = 0; g < 70; g++){ var gx = 570 + R() * 270, top = SOL + 2 - Math.max(0, 46 - Math.abs(gx - 708) * 0.34) * (0.6 + R() * 0.5);
    s += L('M' + r1(gx) + ' ' + r1(top + 12) + ' q ' + r1((R() - 0.5) * 8) + ' -8 ' + r1((R() - 0.5) * 10) + ' -' + r1(10 + R() * 12), R() < 0.5 ? '#8ac860' : '#5a9a44', 1.6, op(0.85)); }
  [[600, SOL - 14], [790, SOL - 18], [646, SOL - 36], [750, SOL - 34]].forEach(function(f){ [0, 72, 144, 216, 288].forEach(function(a){ s += E(f[0] + Math.cos(a * Math.PI / 180) * 3, f[1] + Math.sin(a * Math.PI / 180) * 3, 2.6, 2.6, '#f8f4e0'); }); s += C(f[0], f[1], 1.6, '#ffd060'); });
  /* des fougères au pied des murs */
  function fougere(x, y, t, a){ var o = '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + t + ')">' + L('M0 0 Q -6 -40 -2 -80', '#1e3a1c', 4) + L('M0 0 Q -6 -40 -2 -80', '#4a7a3a', 1.8);
    for(var k = 1; k < 9; k++){ var yy = -k * 9, l = 18 - k * 1.6; o += F('M' + r1(-k * 0.3) + ' ' + yy + ' q ' + r1(-l * 0.6) + ' -7 ' + r1(-l) + ' -3 q ' + r1(l * 0.5) + ' 5 ' + r1(l) + ' 3 Z', '#5a9a44') + F('M' + r1(-k * 0.3) + ' ' + yy + ' q ' + r1(l * 0.6) + ' -7 ' + r1(l) + ' -3 q ' + r1(-l * 0.5) + ' 5 ' + r1(-l) + ' 3 Z', '#467e38'); }
    return o + '</g>'; }
  s += fougere(870, SOL, 1.1, 14) + fougere(842, SOL, 0.8, -10) + fougere(520, SOL, 0.7, -16) + fougere(946, SOL, 0.9, -6) + fougere(430, SOL, 0.6, 8);
  /* le rebord de pierre où la sacoche est posée (à droite) */
  s += P('M782 ' + (SOL - 60) + ' C 800 ' + (SOL - 68) + ' 900 ' + (SOL - 70) + ' 938 ' + (SOL - 62) + ' C 944 ' + (SOL - 50) + ' 930 ' + (SOL - 36) + ' 906 ' + (SOL - 30) + ' C 870 ' + (SOL - 22) + ' 820 ' + (SOL - 30) + ' 792 ' + (SOL - 40) + ' C 780 ' + (SOL - 46) + ' 776 ' + (SOL - 54) + ' 782 ' + (SOL - 60) + ' Z', d.lin([[0, '#5a6a5c'], [0.5, '#3a463c'], [1, '#1a221c']])) +
    F('M786 ' + (SOL - 60) + ' C 820 ' + (SOL - 70) + ' 900 ' + (SOL - 72) + ' 936 ' + (SOL - 62) + ' C 900 ' + (SOL - 64) + ' 820 ' + (SOL - 62) + ' 786 ' + (SOL - 56) + ' Z', '#5a8a44', op(0.9)) +
    L('M800 ' + (SOL - 44) + ' l 14 6 l 10 -2 M880 ' + (SOL - 40) + ' l 12 4', '#0e140e', 1.4);
  s += champis(d, 470, SOL - 1, 0.6, '#8ae070', '#d8f0c0');
  s += racine(160, -4, 120, '#3a2a1c', 5, R) + racine(380, -4, 80, '#3a2a1c', 3, R) + racine(960, 10, 60, '#3a2a1c', 4, R);
  s += solDalles(d, {c1: '#2e3a30', c2: '#0c120e', fuite: 700, pas: 140, bord: '#6a8a6a'});
  s += nuit(d, 0.6, [[700, 160, 200, 260, 1], [708, SOL - 20, 200, 80, 1], [860, SOL - 60, 110, 70, 0.6]]);
  s += ecran(E(700, 140, 200, 160, d.halo('#c8e890', 0.16)));
  /* le rai de lumière, en diagonale, qui tombe sur la butte de mousse */
  var ray = d.lin([[0, '#f8ffd0', 0.55], [0.5, '#d8f0a0', 0.22], [1, '#c0e090', 0.06]]);
  s += ecran(E(700, 180, 260, 200, d.halo('#a8d070', 0.3)) +
    F('M626 0 L 754 0 L 822 ' + SOL + ' L 596 ' + SOL + ' Z', ray) + F('M660 0 L 724 0 L 772 ' + SOL + ' L 650 ' + SOL + ' Z', ray, op(0.7)));
  s += grains(R, 50, [628, 600], [752, 818], 50, SOL - 10, '#fbffe0', 0.7);

  s += E(708, SOL + 12, 150, 12, '#e8ffc0', op(0.13));
  s += cailloux(R, 14, 480, 940, SOL + 8, H - 6, '#3a4a40');
  [[480, SOL + 20], [540, SOL + 26], [860, SOL + 22]].forEach(function(f){ s += L('M' + f[0] + ' ' + f[1] + ' q 3 -8 1 -14 M' + (f[0] + 4) + ' ' + f[1] + ' q 5 -6 8 -10', '#4a7a3a', 1.6); });
  s += brumeSol(d, SOL, '#a0d080', 0.12);
  s += vignette(d, 700, 210, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La réserve : des étagères, des tonneaux, des sacs ; des bocaux de lucioles qui éclairent ; le coffre (élément) ---------- */
FONDS.reserve = function(){
  var d = new Defs('re'), R = rng(77), s = '';
  s += Rc(0, 0, W, H, '#120c14');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: SOL + 8, bw: 44, bh: 22, c: '#2e2434', j: '#0c0810', cl: '#3e3044', fo: '#1a1420', mousse: 0.05, seed: 5});
  /* les poutres du plafond */
  s += Rc(0, 0, W, 16, d.lin([[0, '#3a2414'], [1, '#1a0e08']])) + [90, 330, 570, 810].map(function(x){ return P('M' + (x - 14) + ' 0 L ' + (x + 14) + ' 0 L ' + (x + 14) + ' 22 L ' + (x - 14) + ' 22 Z', d.lin([[0, '#5a3a22'], [1, '#2a1a10']])); }).join('');
  /* une étagère : montants, planches, et ce qu'il y a dessus */
  function etagere(x0, x1, y0, y1, nb, seed){
    var Rr = rng(seed), o = '', bois = d.lin([[0, '#6a4628'], [1, '#3a2414']]);
    o += Rc(x0, y0, x1 - x0, y1 - y0, '#0e0a10', op(0.6));
    for(var k = 0; k < nb; k++){
      var yp = y0 + (y1 - y0) * (k + 1) / nb;
      /* les choses posées sur la planche */
      for(var x = x0 + 8; x < x1 - 16;){
        var t = Rr(), w;
        if(t < 0.32){ w = 16 + Rr() * 8; var hh = 20 + Rr() * 14, c = ['#5a7a8a', '#7a5a8a', '#8a7a5a', '#4a6a5a'][Math.floor(Rr() * 4)];
          o += P('M' + r1(x) + ' ' + yp + ' L ' + r1(x) + ' ' + r1(yp - hh) + ' Q ' + r1(x + w / 2) + ' ' + r1(yp - hh - 6) + ' ' + r1(x + w) + ' ' + r1(yp - hh) + ' L ' + r1(x + w) + ' ' + yp + ' Z', d.g(c), ' stroke-width="2"') +
            L('M' + r1(x + 3) + ' ' + r1(yp - hh + 4) + ' L ' + r1(x + 3) + ' ' + r1(yp - 4), '#ffffff', 1.4, op(0.35)); }
        else if(t < 0.55){ w = 26 + Rr() * 10; var hs = 24 + Rr() * 10;
          o += P('M' + r1(x) + ' ' + yp + ' C ' + r1(x - 2) + ' ' + r1(yp - hs * 0.6) + ' ' + r1(x + 4) + ' ' + r1(yp - hs) + ' ' + r1(x + w / 2) + ' ' + r1(yp - hs) + ' C ' + r1(x + w - 4) + ' ' + r1(yp - hs) + ' ' + r1(x + w + 2) + ' ' + r1(yp - hs * 0.6) + ' ' + r1(x + w) + ' ' + yp + ' Z', d.g('#8a7a5a'), ' stroke-width="2"') +
            L('M' + r1(x + w * 0.3) + ' ' + r1(yp - hs + 3) + ' l 4 4 l 4 -4', '#4a3a2a', 1.4); }
        else if(t < 0.72){ w = 30 + Rr() * 14; var hc = 18 + Rr() * 8;
          o += P('M' + r1(x) + ' ' + yp + ' L ' + r1(x) + ' ' + r1(yp - hc) + ' L ' + r1(x + w) + ' ' + r1(yp - hc) + ' L ' + r1(x + w) + ' ' + yp + ' Z', d.g('#7a5432'), ' stroke-width="2"') + L('M' + r1(x + 2) + ' ' + r1(yp - hc / 2) + ' L ' + r1(x + w - 2) + ' ' + r1(yp - hc / 2), '#3a2414', 1.4); }
        else if(t < 0.86){ w = 22; o += P('M' + r1(x) + ' ' + yp + ' L ' + r1(x + 3) + ' ' + r1(yp - 16) + ' L ' + r1(x + w - 3) + ' ' + r1(yp - 16) + ' L ' + r1(x + w) + ' ' + yp + ' Z', d.g('#9a6a4a'), ' stroke-width="2"') + E(x + w / 2, yp - 16, w / 2 - 3, 3, '#3a2010'); }
        else { w = 18; }
        x += w + 4 + Rr() * 6;
      }
      o += P('M' + (x0 - 6) + ' ' + (yp - 2) + ' L ' + (x1 + 6) + ' ' + (yp - 2) + ' L ' + (x1 + 6) + ' ' + (yp + 7) + ' L ' + (x0 - 6) + ' ' + (yp + 7) + ' Z', bois, ' stroke-width="2.4"');
    }
    o += P('M' + (x0 - 10) + ' ' + y0 + ' L ' + x0 + ' ' + y0 + ' L ' + x0 + ' ' + SOL + ' L ' + (x0 - 10) + ' ' + SOL + ' Z', bois, ' stroke-width="2.4"') +
      P('M' + x1 + ' ' + y0 + ' L ' + (x1 + 10) + ' ' + y0 + ' L ' + (x1 + 10) + ' ' + SOL + ' L ' + x1 + ' ' + SOL + ' Z', bois, ' stroke-width="2.4"');
    return o;
  }
  s += '<g opacity=".55">' + etagere(40, 250, 40, 300, 3, 3) + '</g>';
  s += etagere(500, 700, 30, 250, 3, 9) + etagere(740, 900, 40, 250, 3, 17);
  /* des bocaux de lucioles (la lumière de la réserve) : sur les étagères et pendus */
  function bocal(x, y, t){ var o = ecran(E(x, y, 46 * t, 40 * t, d.halo('#d8ff70', 0.5)) + E(x, y, 90 * t, 70 * t, d.halo('#a8e050', 0.18)));
    o += P(T('M-9 -14 L 9 -14 L 11 -10 C 14 -6 14 10 10 13 L -10 13 C -14 10 -14 -6 -11 -10 Z', x, y).replace(/(\d) /g, '$1 '), d.rad([[0, '#fbffd0'], [0.5, '#d0f070', 0.8], [1, '#6a9a3a', 0.6]]), ' stroke-width="2.4"') +
      P(T('M-8 -19 L 8 -19 L 8 -13 L -8 -13 Z', x, y), '#7a5432', ' stroke-width="2"');
    for(var k = 0; k < 5; k++) o += C(x + (R() - 0.5) * 16 * t, y + (R() - 0.5) * 18 * t, 1.6, '#ffffe0');
    return o; }
  /* la lumière douce des lucioles sur le sol, autour du coffre */
  s += ecran(E(690, SOL - 40, 280, 120, d.halo('#c8f070', 0.16)));
  /* des tonneaux empilés (à droite) et un tonneau couché */
  function tonneau(x, y, w, h){ return P('M' + (x - w / 2) + ' ' + (y - h) + ' Q ' + (x - w / 2 - 8) + ' ' + (y - h / 2) + ' ' + (x - w / 2) + ' ' + y + ' L ' + (x + w / 2) + ' ' + y + ' Q ' + (x + w / 2 + 8) + ' ' + (y - h / 2) + ' ' + (x + w / 2) + ' ' + (y - h) + ' Z', d.lin([[0, '#3a2414'], [0.6, '#7a5232'], [1, '#4a2e1a']], 0, 0, 1, 0)) +
    L('M' + (x - w / 2 - 3) + ' ' + (y - h * 0.22) + ' L ' + (x + w / 2 + 3) + ' ' + (y - h * 0.22) + ' M' + (x - w / 2 - 3) + ' ' + (y - h * 0.78) + ' L ' + (x + w / 2 + 3) + ' ' + (y - h * 0.78), '#2a2a34', 4) +
    L('M' + (x - w * 0.15) + ' ' + (y - h + 3) + ' L ' + (x - w * 0.15) + ' ' + (y - 3) + ' M' + (x + w * 0.2) + ' ' + (y - h + 3) + ' L ' + (x + w * 0.2) + ' ' + (y - 3), '#2a1a10', 1.4); }
  s += tonneau(930, SOL, 64, 84) + tonneau(866, SOL, 60, 78) + tonneau(900, SOL - 82, 58, 70);
  s += '<g opacity=".6">' + tonneau(330, SOL, 56, 74) + tonneau(388, SOL, 52, 70) + '</g>';
  /* des sacs de farine (marqués de la roue du moulin… quelqu'un vient ici), une caisse */
  function sac(x, y, w, h){ return P('M' + (x - w / 2) + ' ' + y + ' C ' + (x - w / 2 - 4) + ' ' + (y - h * 0.7) + ' ' + (x - w * 0.3) + ' ' + (y - h) + ' ' + x + ' ' + (y - h) + ' C ' + (x + w * 0.3) + ' ' + (y - h) + ' ' + (x + w / 2 + 4) + ' ' + (y - h * 0.7) + ' ' + (x + w / 2) + ' ' + y + ' Z', d.g('#a89c80', 1.4)) +
    L('M' + (x - 6) + ' ' + (y - h + 4) + ' l 6 6 l 6 -6', '#6a5a3a', 1.6) + C(x, y - h * 0.45, 8, 'none', ' stroke="#8a6a3a" stroke-width="1.6"') + L('M' + (x - 8) + ' ' + (y - h * 0.45) + ' h 16 M' + x + ' ' + (y - h * 0.45 - 8) + ' v 16', '#8a6a3a', 1.2); }
  s += sac(528, SOL, 42, 46) + sac(564, SOL, 36, 38) + E(548, SOL + 6, 40, 4, '#e8e0d0', op(0.25));
  s += P('M792 ' + SOL + ' L 792 ' + (SOL - 44) + ' L 846 ' + (SOL - 44) + ' L 846 ' + SOL + ' Z', d.g('#6a4a2a')) + L('M792 ' + (SOL - 44) + ' L 846 ' + SOL + ' M846 ' + (SOL - 44) + ' L 792 ' + SOL, '#3a2414', 2.4);
  s += toile(W, 0, 110, -1, '#d8d0c0') + toile(0, 0, 90, 1, '#d8d0c0') + toile(500, 30, 40, 1, '#d8d0c0');
  s += solDalles(d, {c1: '#3a3038', c2: '#100a10', fuite: 680, pas: 120});
  s += nuit(d, 0.6, [[560, 104, 110, 100, 0.9], [842, 118, 110, 100, 0.9], [640, 190, 100, 90, 0.8], [780, 190, 100, 90, 0.8], [700, 70, 120, 110, 0.9], [690, SOL - 20, 240, 90, 0.8]]);
  s += E(680, SOL + 8, 160, 12, '#e0ff90', op(0.08));
  s += bocal(560, 104, 1) + bocal(842, 118, 1) + bocal(640, 190, 0.9) + bocal(780, 190, 0.9) + bocal(140, 120, 0.7);
  s += L('M700 0 L 700 50', '#3a2a1a', 2) + bocal(700, 70, 1.15);
  s += cailloux(R, 8, 600, 940, SOL + 8, H - 6, '#3a3038');
  s += C(612, SOL + 22, 2, '#e8e0d0', op(0.5)) + C(618, SOL + 26, 1.5, '#e8e0d0', op(0.4)) + E(600, SOL + 18, 14, 2, '#e8e0d0', op(0.25));
  s += brumeSol(d, SOL, '#b0a080', 0.1);
  s += vignette(d, 690, 200, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La grotte de la fleur de givre : glace, stalactites, froid bleu ---------- */
FONDS.givre = function(){
  var d = new Defs('gi'), R = rng(91), s = '';
  s += Rc(0, 0, W, H, '#050a18');
  s += murRoche(d, {x0: -20, y0: -20, x1: W + 20, y1: SOL + 8, t: 40, c: '#16243e', cl: '#22365a', fo: '#0c1428', j: '#040814', seed: 13});
  var glace = function(o){ return d.lin([[0, '#e8fbff', 0.85 * o], [0.35, '#8ac8f0', 0.6 * o], [1, '#3a6ab0', 0.45 * o]], 0, 0, 0, 1); };
  /* des draperies de glace qui coulent du plafond le long de la roche (au fond : plus pâles) */
  function draperie(x0, x1, y1, o, seed){
    var Rr = rng(seed), n = Math.round((x1 - x0) / 18), bas = 'M' + x0 + ' 0 L ' + x0 + ' ' + r1(y1 * 0.4), raies = '';
    for(var i = 0; i <= n; i++){ var x = x0 + (x1 - x0) * i / n, yy = y1 * (0.55 + Rr() * 0.45); bas += ' Q ' + r1(x - (x1 - x0) / n / 2) + ' ' + r1(yy + 14) + ' ' + r1(x) + ' ' + r1(yy - Rr() * 10);
      if(i > 0 && i < n) raies += L('M' + r1(x) + ' 10 L ' + r1(x + (Rr() - 0.5) * 6) + ' ' + r1(yy - 8), Rr() < 0.5 ? '#ffffff' : '#bfe8ff', 1 + Rr() * 1.4, op(0.25 + Rr() * 0.35)); }
    bas += ' L ' + x1 + ' 0 Z';
    return F(bas, glace(o), ' stroke="#bfe8ff" stroke-width="1.6" stroke-opacity="' + (0.6 * o) + '"') + raies;
  }
  s += '<g opacity=".55">' + draperie(500, 640, 190, 0.8, 3) + draperie(760, 860, 150, 0.8, 5) + '</g>';
  s += draperie(250, 380, 120, 0.7, 7) + draperie(600, 720, 120, 1, 9) + draperie(840, 960, 230, 1, 11);
  /* une cascade gelée (à droite), et deux colonnes de glace */
  s += F('M856 60 C 850 120 870 200 846 ' + SOL + ' L 930 ' + SOL + ' C 916 220 940 140 922 60 Z', d.lin([[0, '#bfe8ff', 0.5], [0.5, '#6aa8e0', 0.32], [1, '#3a7ac8', 0.4]], 0, 0, 1, 0), ' stroke="#bfe8ff" stroke-width="2" stroke-opacity=".7"');
  for(var c = 0; c < 9; c++){ var cx = 860 + c * 8 + R() * 4; s += L('M' + r1(cx) + ' ' + r1(70 + R() * 40) + ' C ' + r1(cx - 4) + ' 160 ' + r1(cx + 6) + ' 240 ' + r1(cx - 2) + ' ' + (SOL - 6), c % 2 ? '#ffffff' : '#6aa8e0', c % 2 ? 1.2 : 2, op(0.45)); }
  function colonne(x, w){ return P('M' + (x - w) + ' 0 C ' + (x - w * 0.3) + ' 90 ' + (x - w * 0.18) + ' 140 ' + (x - w * 0.22) + ' 180 C ' + (x - w * 0.3) + ' 250 ' + (x - w * 0.9) + ' 300 ' + (x - w * 1.2) + ' ' + SOL + ' L ' + (x + w * 1.2) + ' ' + SOL + ' C ' + (x + w * 0.9) + ' 300 ' + (x + w * 0.3) + ' 250 ' + (x + w * 0.22) + ' 180 C ' + (x + w * 0.18) + ' 140 ' + (x + w * 0.3) + ' 90 ' + (x + w) + ' 0 Z',
    d.lin([[0, '#4a7ab8', 0.7], [0.35, '#a8d8ff', 0.62], [0.7, '#5a90d0', 0.55], [1, '#2a5a98', 0.7]], 0, 0, 1, 0), ' stroke-width="2.4"') + L('M' + (x - w * 0.1) + ' 20 C ' + (x - w * 0.05) + ' 100 ' + (x - w * 0.08) + ' 200 ' + (x - w * 0.4) + ' ' + (SOL - 10), '#ffffff', 2, op(0.5)); }
  s += colonne(540, 26) + '<g opacity=".7">' + colonne(780, 18) + '</g>';
  /* des cristaux de glace, qui luisent */
  s += cristaux(d, 600, SOL - 2, 1.3, '#7ad8ff', R) + cristaux(d, 812, SOL - 2, 1.6, '#8ae0ff', R) + cristaux(d, 948, SOL - 2, 1.2, '#7ad8ff', R) + cristaux(d, 430, SOL - 2, 0.8, '#5ab8e8', R);
  s += '<g transform="translate(690 40) rotate(180)">' + cristaux(d, 0, 0, 0.8, '#8ae0ff', R) + '</g>';
  /* le sol gelé : une glace qui reflète */
  s += F('M0 ' + SOL + ' H ' + W + ' V ' + H + ' H 0 Z', d.lin([[0, '#4a7ab0'], [0.4, '#22406a'], [1, '#081226']]));
  s += '<g opacity=".22" transform="translate(0 ' + (SOL * 2 + 4) + ') scale(1 -1)">' + cristaux(d, 600, SOL - 2, 1.3, '#7ad8ff', rng(4)) + cristaux(d, 812, SOL - 2, 1.6, '#8ae0ff', rng(5)) + colonne(540, 26) + '</g>';
  s += L('M380 ' + (SOL + 12) + ' L 980 ' + (SOL + 14) + ' M420 ' + (SOL + 22) + ' L 900 ' + (SOL + 26), '#e8fbff', 1.6, op(0.3)) + E(700, SOL + 10, 120, 6, '#e8fbff', op(0.25));
  /* des congères de neige, contre les murs */
  function congere(x0, x1, h){ return P('M' + x0 + ' ' + (SOL + 6) + ' C ' + (x0 + (x1 - x0) * 0.2) + ' ' + (SOL - h) + ' ' + (x0 + (x1 - x0) * 0.7) + ' ' + (SOL - h * 1.1) + ' ' + x1 + ' ' + (SOL + 6) + ' Z', d.lin([[0, '#ffffff'], [0.5, '#c8e8ff'], [1, '#6a9ad0']]), ' stroke-width="2.4"') +
    L('M' + (x0 + 10) + ' ' + (SOL - 2) + ' C ' + (x0 + (x1 - x0) * 0.3) + ' ' + (SOL - h * 0.8) + ' ' + (x0 + (x1 - x0) * 0.6) + ' ' + (SOL - h * 0.9) + ' ' + (x1 - 20) + ' ' + (SOL - h * 0.3), '#ffffff', 2, op(0.8)); }
  s += '<g opacity=".7">' + congere(-10, 300, 20) + '</g>' + congere(860, 970, 24) + congere(470, 560, 12);
  /* le rocher gelé où pousse la fleur (la fleur est un élément), avec de petits glaçons */
  s += P('M640 ' + (SOL + 6) + ' C 642 ' + (SOL - 22) + ' 668 ' + (SOL - 38) + ' 704 ' + (SOL - 38) + ' C 740 ' + (SOL - 38) + ' 764 ' + (SOL - 22) + ' 768 ' + (SOL + 6) + ' Z', d.lin([[0, '#3a5a8a'], [1, '#14223e']]));
  s += P('M646 ' + (SOL - 14) + ' C 660 ' + (SOL - 40) + ' 748 ' + (SOL - 44) + ' 762 ' + (SOL - 14) + ' C 740 ' + (SOL - 22) + ' 720 ' + (SOL - 18) + ' 704 ' + (SOL - 22) + ' C 686 ' + (SOL - 18) + ' 666 ' + (SOL - 24) + ' 646 ' + (SOL - 14) + ' Z', d.lin([[0, '#ffffff'], [1, '#b8e0ff']]), ' stroke-width="2.4"');
  [[662, SOL - 18, 8], [684, SOL - 20, 12], [728, SOL - 21, 10], [748, SOL - 17, 7]].forEach(function(g){ s += P('M' + (g[0] - 3) + ' ' + g[1] + ' L ' + (g[0] + 3) + ' ' + g[1] + ' L ' + g[0] + ' ' + (g[1] + g[2]) + ' Z', '#dff6ff', ' stroke-width="1.6"'); });
  /* les stalactites de glace, au plafond */
  for(var k = 0; k < 34; k++){ var x = 20 + k * 28 + (R() - 0.5) * 14, l = 20 + R() * (k > 14 && k < 30 ? 70 : 40), w = 6 + R() * 10, y0 = 4 + R() * 12;
    s += P('M' + r1(x - w) + ' ' + r1(y0) + ' L ' + r1(x + w) + ' ' + r1(y0) + ' L ' + r1(x + 1) + ' ' + r1(y0 + l) + ' Z', d.lin([[0, '#bfe8ff'], [0.6, '#6aa8e0'], [1, '#e8fbff']], 1, 0, 0, 0), ' stroke-width="2"') +
      L('M' + r1(x - w * 0.4) + ' ' + r1(y0 + 3) + ' L ' + r1(x) + ' ' + r1(y0 + l * 0.7), '#ffffff', 1.2, op(0.7)); }
  s += F('M0 0 H ' + W + ' V 14 C 800 24 600 10 480 22 C 300 30 120 12 0 20 Z', '#dff4ff', op(0.75)) + L('M0 20 C 120 12 300 30 480 22 C 600 10 800 24 ' + W + ' 14', '#9ad0ff', 2);
  /* la nuit, percée par la glace qui luit */
  s += nuit(d, 0.52, [[704, 230, 300, 200, 0.9], [600, 300, 110, 80, 0.8], [812, 290, 130, 90, 0.8], [948, 300, 90, 80, 0.7], [690, 50, 120, 80, 0.7]], '#020614');
  s += ecran(E(704, SOL - 30, 170, 80, d.halo('#bff0ff', 0.4)) + E(812, SOL - 30, 120, 90, d.halo('#5ac8ff', 0.35)) + E(600, SOL - 24, 90, 70, d.halo('#5ac8ff', 0.3)) + E(704, 160, 320, 200, d.halo('#3a80e0', 0.2)));
  s += brumeSol(d, SOL, '#bfe8ff', 0.28);
  s += grains(R, 50, [360, 360], [960, 960], 30, SOL, '#ffffff', 0.6);
  s += vignette(d, 700, 210, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La bibliothèque engloutie : des rayonnages à moitié dans l'eau qui luit, des livres qui flottent ---------- */
FONDS.bibliotheque = function(){
  var d = new Defs('bi'), R = rng(63), s = '';
  var EAU = 256, BORD = 330;
  s += Rc(0, 0, W, H, '#07100f');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: EAU + 10, bw: 46, bh: 23, c: '#1e2c30', j: '#060c0e', cl: '#2c3e42', fo: '#121c20', mousse: 0.15, seed: 19, hl: '#5a8a88'});
  /* une haute fenêtre cassée, tout en haut : un peu de lune passe */
  s += P('M572 66 L 572 18 Q 600 -6 628 18 L 628 66 Z', '#0a1418', ' stroke="#3a5054" stroke-width="5"') + F('M578 62 L 578 20 Q 600 2 622 20 L 622 62 Z', d.lin([[0, '#9ac8d8', 0.5], [1, '#2a4a58', 0.4]])) +
    L('M600 6 V 64 M578 38 H 622', '#3a5054', 3) + L('M604 26 L 614 40 L 608 50', '#0a1418', 1.6) +
    ecran(F('M584 64 L 616 64 L 700 ' + EAU + ' L 530 ' + EAU + ' Z', d.lin([[0, '#bfe8f0', 0.26], [1, '#8ad0e0', 0.03]])));
  /* une travée de rayonnages : le bois, les livres serrés, le bas dans l'eau */
  function rayon(x0, x1, y0, nb, seed, fonce){
    var Rr = rng(seed), o = '', bois = d.lin([[0, fonce ? '#3a2a1c' : '#5a3e26'], [1, '#1e140c']]), haut = (EAU + 60 - y0) / nb;
    o += Rc(x0, y0, x1 - x0, EAU + 60 - y0, '#0a0c0c');
    for(var k = 0; k < nb; k++){
      var yp = y0 + haut * (k + 1);
      for(var x = x0 + 4; x < x1 - 8;){
        var w = 7 + Rr() * 8, h = haut * (0.55 + Rr() * 0.35), c = ['#7a2a2a', '#2a4a7a', '#3a6a3a', '#7a5a2a', '#5a2a5a', '#8a7a5a', '#2a5a5a'][Math.floor(Rr() * 7)];
        if(fonce) c = sombre(c, 0.35);
        if(Rr() < 0.12){ o += P('M' + r1(x) + ' ' + r1(yp - 3) + ' L ' + r1(x + h * 0.6) + ' ' + r1(yp - h * 0.8) + ' L ' + r1(x + h * 0.6 + w) + ' ' + r1(yp - h * 0.8 + 4) + ' L ' + r1(x + w) + ' ' + r1(yp) + ' Z', d.g(c), ' stroke-width="1.6"'); x += w + h * 0.5; continue; }
        o += P('M' + r1(x) + ' ' + yp + ' L ' + r1(x) + ' ' + r1(yp - h) + ' L ' + r1(x + w) + ' ' + r1(yp - h) + ' L ' + r1(x + w) + ' ' + yp + ' Z', d.g(c), ' stroke-width="1.6"') +
          L('M' + r1(x + 1.5) + ' ' + r1(yp - h + 4) + ' L ' + r1(x + w - 1.5) + ' ' + r1(yp - h + 4) + ' M' + r1(x + 1.5) + ' ' + r1(yp - 5) + ' L ' + r1(x + w - 1.5) + ' ' + r1(yp - 5), '#e8c062', 1, op(0.6));
        x += w + 0.5 + (Rr() < 0.1 ? 8 : 0);
      }
      o += P('M' + (x0 - 4) + ' ' + (yp - 1) + ' L ' + (x1 + 4) + ' ' + (yp - 1) + ' L ' + (x1 + 4) + ' ' + (yp + 6) + ' L ' + (x0 - 4) + ' ' + (yp + 6) + ' Z', bois, ' stroke-width="2"');
    }
    o += P('M' + (x0 - 12) + ' ' + (y0 - 14) + ' L ' + (x1 + 12) + ' ' + (y0 - 14) + ' L ' + (x1 + 8) + ' ' + y0 + ' L ' + (x0 - 8) + ' ' + y0 + ' Z', bois, ' stroke-width="2.4"') +
      P('M' + (x0 - 10) + ' ' + y0 + ' L ' + x0 + ' ' + y0 + ' L ' + x0 + ' ' + (EAU + 60) + ' L ' + (x0 - 10) + ' ' + (EAU + 60) + ' Z', bois, ' stroke-width="2.4"') +
      P('M' + x1 + ' ' + y0 + ' L ' + (x1 + 10) + ' ' + y0 + ' L ' + (x1 + 10) + ' ' + (EAU + 60) + ' L ' + x1 + ' ' + (EAU + 60) + ' Z', bois, ' stroke-width="2.4"');
    return o;
  }
  s += rayon(30, 230, 70, 4, 2, true) + rayon(250, 420, 90, 4, 6, true);
  s += rayon(500, 700, 80, 4, 11) + rayon(740, 900, 60, 4, 15);
  /* un rayonnage tombé, en biais, à moitié noyé */
  s += '<g transform="rotate(-16 930 ' + EAU + ')">' + rayon(900, 1000, 120, 3, 21) + '</g>';
  /* l'eau : elle luit de dessous (des algues lumineuses), elle reflète les rayonnages */
  s += F('M0 ' + EAU + ' H ' + W + ' V ' + BORD + ' H 0 Z', d.lin([[0, '#0a2a2c', 0.94], [0.5, '#071c20', 0.97], [1, '#04100f']]));
  s += '<g opacity=".18" transform="translate(0 ' + (EAU * 2) + ') scale(1 -1)">' + rayon(500, 700, 80, 4, 11) + rayon(740, 900, 60, 4, 15) + '</g>';
  s += ecran(E(640, EAU + 46, 300, 50, d.halo('#2ac0a8', 0.22)) + E(860, EAU + 40, 140, 40, d.halo('#2ac0a8', 0.18)));
  for(var w = 0; w < 34; w++){ var wx = 420 + R() * 540, wy = EAU + 6 + R() * (BORD - EAU - 14), wl = 10 + R() * 50 * (1 - (wy - EAU) / (BORD - EAU) * 0.5); s += L('M' + r1(wx) + ' ' + r1(wy) + ' q ' + r1(wl / 2) + ' -2 ' + r1(wl) + ' 0', R() < 0.3 ? '#dffff8' : '#6ae0d0', 1.2, op(0.15 + R() * 0.4)); }
  /* des reflets brisés de la lune sur l'eau, des nénuphars d'algues qui luisent */
  [[612, EAU + 18, 40], [640, EAU + 34, 26], [598, EAU + 50, 18]].forEach(function(r){ s += L('M' + (r[0] - r[2] / 2) + ' ' + r[1] + ' h ' + r[2], '#e8fbff', 2, op(0.5)); });
  [[520, EAU + 40], [760, EAU + 30], [880, EAU + 56], [690, EAU + 62]].forEach(function(a){ s += E(a[0], a[1], 14, 4, '#1a5a4a', ' stroke="#0a2a24" stroke-width="1.5"') + C(a[0] + 4, a[1] - 1, 2.4, '#8affe0', op(0.8)); });
  s += L('M0 ' + EAU + ' H ' + W, '#8af0e0', 1.6, op(0.5));
  /* des algues qui luisent dans l'eau, des feuillets qui flottent */
  [[540, 310], [620, 300], [780, 316], [880, 304], [300, 312]].forEach(function(a){ for(var k = 0; k < 4; k++) s += C(a[0] + (R() - 0.5) * 30, a[1] + (R() - 0.5) * 10, 1.5 + R() * 2, '#8affe0', op(0.5 + R() * 0.4)); });
  [[586, 262, -12], [820, 276, 20], [700, 296, 6]].forEach(function(f){ s += '<g transform="translate(' + f[0] + ' ' + f[1] + ') rotate(' + f[2] + ') scale(1 .45)">' + Rc(-10, -12, 20, 24, '#d8d0b8', op(0.5)) + '</g>'; });
  /* le quai de pierre où l'on marche (devant) */
  s += F('M0 ' + BORD + ' H ' + W + ' V ' + H + ' H 0 Z', d.lin([[0, '#3a4a48'], [1, '#0c1414']]));
  s += Rc(0, BORD - 4, W, 8, d.lin([[0, '#6a8a86'], [1, '#2a3a3a']]), ' stroke="' + O + '" stroke-width="2"');
  for(var q = -40; q < W; q += 72) s += L('M' + q + ' ' + (BORD + 4) + ' L ' + (q - 20) + ' ' + H, '#0c1414', 2.4);
  s += L('M0 ' + (BORD + 20) + ' H ' + W, '#0c1414', 2, op(0.8));
  /* le lutrin de pierre (à droite), où sont posés le cristal et le bâton (ce sont des éléments) */
  s += P('M790 ' + SOL + ' L 800 ' + (SOL - 70) + ' L 880 ' + (SOL - 70) + ' L 890 ' + SOL + ' Z', d.lin([[0, '#5a6a68'], [1, '#2a3434']], 1, 0, 0, 0)) +
    P('M776 ' + (SOL - 70) + ' L 904 ' + (SOL - 70) + ' L 898 ' + (SOL - 82) + ' L 782 ' + (SOL - 82) + ' Z', d.lin([[0, '#7a8a88'], [1, '#3a4848']])) +
    L('M812 ' + (SOL - 56) + ' L 868 ' + (SOL - 56) + ' M812 ' + (SOL - 20) + ' L 868 ' + (SOL - 20), '#8af0e0', 1.6, op(0.5)) +
    P('M826 ' + (SOL - 46) + ' Q 840 ' + (SOL - 52) + ' 840 ' + (SOL - 34) + ' Q 840 ' + (SOL - 52) + ' 854 ' + (SOL - 46) + ' L 854 ' + (SOL - 30) + ' Q 840 ' + (SOL - 36) + ' 826 ' + (SOL - 30) + ' Z', 'none', ' stroke="#8af0e0" stroke-width="1.6" opacity=".55"');
  /* une pile de livres mouillés (la page blanche est posée dessus : élément) */
  s += P('M640 ' + SOL + ' L 640 ' + (SOL - 12) + ' L 700 ' + (SOL - 14) + ' L 702 ' + SOL + ' Z', d.g('#5a2a3a')) + P('M644 ' + (SOL - 12) + ' L 646 ' + (SOL - 24) + ' L 698 ' + (SOL - 26) + ' L 698 ' + (SOL - 14) + ' Z', d.g('#2a4a5a')) +
    P('M638 ' + (SOL - 24) + ' L 642 ' + (SOL - 34) + ' L 702 ' + (SOL - 34) + ' L 700 ' + (SOL - 26) + ' Z', d.g('#6a5a2a')) + L('M646 ' + (SOL - 6) + ' L 696 ' + (SOL - 7), '#e8c062', 1, op(0.6));
  /* des runes sur les piliers, qui luisent vert d'eau */
  [[470, 150], [470, 190], [728, 120], [728, 160]].forEach(function(r){ s += L('M' + (r[0] - 6) + ' ' + r[1] + ' l 6 -10 l 6 10 M' + r[0] + ' ' + (r[1] - 10) + ' v 18', '#6af0d0', 2, op(0.55)) + ecran(E(r[0], r[1] - 2, 14, 16, d.halo('#6af0d0', 0.3))); });
  s += Rc(456, 60, 28, EAU - 60, d.lin([[0, '#2c3e42'], [1, '#1a2628']], 1, 0, 0, 0), ' stroke="' + O + '" stroke-width="2.5"') + Rc(714, 50, 28, EAU - 50, d.lin([[0, '#2c3e42'], [1, '#1a2628']], 1, 0, 0, 0), ' stroke="' + O + '" stroke-width="2.5"');
  s += toile(0, 0, 100, 1, '#c8e0d8') + toile(W, 0, 80, -1, '#c8e0d8');
  s += nuit(d, 0.58, [[620, EAU + 40, 300, 120, 0.9], [860, EAU + 30, 150, 90, 0.8], [600, 120, 120, 160, 0.7], [840, SOL - 50, 100, 80, 0.7]]);
  s += ecran(E(620, EAU + 44, 260, 40, d.halo('#3ae0c0', 0.14)));
  s += cailloux(R, 8, 500, 940, BORD + 10, H - 6, '#3a4a48');
  s += E(560, SOL + 14, 20, 3, '#8af0e0', op(0.25)) + E(760, SOL + 22, 34, 3, '#8af0e0', op(0.2));
  s += brumeSol(d, BORD, '#6ae0c8', 0.12);
  s += vignette(d, 680, 200, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- Le cul-de-sac éboulé : un tas d'os ; un crâne gravé dans la paroi (le passage secret) ; des champignons verdâtres ---------- */
FONDS.eboulis = function(){
  var d = new Defs('eb'), R = rng(29), s = '';
  s += Rc(0, 0, W, H, '#0a0e0c');
  /* la paroi de droite : de grosses pierres taillées (le passage secret y est caché) */
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: SOL + 8, bw: 52, bh: 26, c: '#2a302c', j: '#080c0a', cl: '#38403a', fo: '#181e1a', mousse: 0.28, seed: 47, hl: '#7a8a7a'});
  /* l'ancien couloir, au milieu : son arche est bouchée par un éboulement (de gros blocs jusqu'en haut) */
  s += arche(d, 640, 190, 112, SOL, {pierre: '#3e463e', cerne: '#2a302a', reflet: '#a0c0a0'});
  var bl = [[640, 300, 90, 46], [580, 250, 50, 40], [700, 240, 60, 44], [640, 190, 56, 38], [600, 150, 40, 30], [688, 160, 40, 32], [560, 316, 40, 24], [724, 318, 44, 24], [640, 130, 30, 22]];
  bl.forEach(function(b, i){ var pts = [], n = 7;
    for(var k = 0; k < n; k++){ var a = k / n * Math.PI * 2 + R() * 0.5; pts.push([b[0] + Math.cos(a) * b[2] * (0.75 + R() * 0.3), b[1] + Math.sin(a) * b[3] * (0.75 + R() * 0.3)]); }
    var col = mix('#4a524a', '#262c26', R() * 0.6);
    s += F(poly(pts), d.lin([[0, clair(col, 0.2)], [0.5, col], [1, sombre(col, 0.5)]], 1, 0, 0, 1), ' stroke="' + O + '" stroke-width="3" stroke-linejoin="round"') +
      L('M' + r1(pts[5][0]) + ' ' + r1(pts[5][1]) + ' L ' + r1(pts[6][0]) + ' ' + r1(pts[6][1]) + ' L ' + r1(pts[0][0]) + ' ' + r1(pts[0][1]), clair(col, 0.35), 2, op(0.5)); });
  s += cailloux(R, 30, 520, 780, SOL - 20, SOL + 6, '#4a524a');
  /* la lumière : des champignons verdâtres, et un filet de lune par une fissure */
  s += ecran(F('M760 0 L 774 0 L 750 ' + SOL + ' L 716 ' + SOL + ' Z', d.lin([[0, '#d0e8d0', 0.3], [1, '#a0c0a0', 0.03]])));
  s += ecran(E(680, 280, 280, 130, d.halo('#8af070', 0.18)) + E(860, 200, 140, 140, d.halo('#7ae070', 0.14)));
  /* le crâne gravé : à peine visible (il faut l'encre invisible du Sage pour le voir) — les traits en creux, très discrets */
  var CX = 852, CY = 196;
  s += '<g opacity=".13">' + L(T('M-30 -6 C -30 -40 30 -40 30 -6 C 30 8 22 14 18 18 L 18 30 L -18 30 L -18 18 C -22 14 -30 8 -30 -6 Z', CX, CY), '#0c100e', 3) +
    L(T('M-29 -5 C -29 -38 29 -38 29 -5', CX, CY + 1.5), '#5a6a5c', 1.4) +
    L(T('M-16 -2 C -16 -10 -4 -10 -4 -2 C -4 4 -16 4 -16 -2 Z M4 -2 C 4 -10 16 -10 16 -2 C 16 4 4 4 4 -2 Z M-3 10 L 0 4 L 3 10 Z M-10 22 L -10 30 M-3 22 L -3 30 M4 22 L 4 30 M11 22 L 11 30', CX, CY), '#0c100e', 2.4) + '</g>';
  s += L(T('M-46 -50 L 46 -50 L 46 144 L -46 144 Z', CX, CY), '#0a0e0c', 1.2, op(0.12));
  /* des niches avec de vieux os, des toiles */
  s += F('M420 150 V 126 C 420 104 470 104 470 126 V 150 Z', '#05080a', ' stroke="#3a443c" stroke-width="4"') + L('M430 146 L 460 142', '#d8d0b8', 3) + C(428, 146, 3, '#d8d0b8') + C(462, 142, 3, '#d8d0b8');
  s += toile(W, 0, 120, -1, '#c8d8c8') + toile(0, 0, 110, 1, '#c8d8c8') + toile(548, 70, 40, 1, '#c8d8c8');
  s += racine(760, -4, 90, '#3a2a1c', 4, R) + racine(300, -4, 110, '#3a2a1c', 5, R);
  /* les champignons et la mousse */
  s += champis(d, 940, SOL - 1, 1.1, '#9af070', '#e0f0c0') + champis(d, 770, SOL - 1, 0.8, '#9af070', '#e0f0c0') + champis(d, 470, SOL - 1, 0.6, '#9af070', '#e0f0c0') +
    champis(d, 560, 210, 0.5, '#9af070', '#e0f0c0') + champis(d, 712, 196, 0.45, '#9af070', '#e0f0c0');
  /* le sol : des os éparpillés, de la poussière (le tas d'os est un élément) */
  s += solDalles(d, {c1: '#323a34', c2: '#0c100e', fuite: 640, pas: 140});
  function os(x, y, a, l){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')">' + L('M' + (-l / 2) + ' 0 L ' + (l / 2) + ' 0', O, 7) + L('M' + (-l / 2) + ' 0 L ' + (l / 2) + ' 0', '#d8ccb0', 4) +
    C(-l / 2, -2, 3.4, '#e0d4b8', ' stroke="' + O + '" stroke-width="1.5"') + C(-l / 2, 2, 3.4, '#e0d4b8', ' stroke="' + O + '" stroke-width="1.5"') + C(l / 2, -2, 3.4, '#e0d4b8', ' stroke="' + O + '" stroke-width="1.5"') + C(l / 2, 2, 3.4, '#e0d4b8', ' stroke="' + O + '" stroke-width="1.5"') + '</g>'; }
  s += os(520, SOL + 14, 12, 30) + os(760, SOL + 22, -20, 26) + os(880, SOL + 10, 4, 24) + os(560, SOL + 26, -40, 20) + os(920, SOL + 24, 30, 22);
  /* un vieux casque rouillé */
  s += P('M800 ' + (SOL + 4) + ' C 800 ' + (SOL - 16) + ' 836 ' + (SOL - 16) + ' 836 ' + (SOL + 4) + ' Z', d.g('#6a4a3a')) + L('M796 ' + (SOL + 4) + ' L 840 ' + (SOL + 4), O, 5) + L('M796 ' + (SOL + 4) + ' L 840 ' + (SOL + 4), '#8a6a4a', 2.4) + C(812, SOL - 6, 1.5, '#c89060');
  s += cailloux(R, 20, 480, 940, SOL + 6, H - 6, '#3a443c');
  s += nuit(d, 0.62, [[940, 300, 130, 100, 0.8], [770, 310, 100, 70, 0.7], [640, 260, 170, 140, 0.7], [852, 196, 110, 110, 0.5], [560, 210, 60, 50, 0.6], [712, 196, 60, 50, 0.6]]);
  s += ecran(E(940, 310, 110, 60, d.halo('#9af070', 0.25)) + E(770, 320, 80, 40, d.halo('#9af070', 0.2)));
  s += brumeSol(d, SOL, '#a0d090', 0.14);
  s += vignette(d, 690, 200, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- Le couloir aux dalles : un damier de dalles claires et sombres (les sombres sont piégées) ---------- */
/* la géométrie du damier : partagée avec les éléments (chaque dalle touchable) */
var DAMIER = {y0: 262, y1: H, ym: 306, fuite: 480, col: 80, x0: 0};
function dalleCoins(c, r){
  /* c : colonne (0 à 11, de gauche à droite), r : rangée (0 = au fond, 1 = devant) ; renvoie les 4 coins dans la scène */
  var D = DAMIER, ys = [D.y0, D.ym, D.y1], k = function(y){ return 0.72 + 0.28 * (y - D.y0) / (D.y1 - D.y0); };
  function px(xf, y){ return D.fuite + (xf - D.fuite) * k(y); }
  var xa = c * D.col, xb = xa + D.col, ya = ys[r], yb = ys[r + 1];
  return [[px(xa, ya), ya], [px(xb, ya), ya], [px(xb, yb), yb], [px(xa, yb), yb]];
}
function dalleClaire(c, r){ return (c + r) % 2 === 0; }
FONDS.dalles = function(){
  var d = new Defs('da'), R = rng(83), s = '', Y0 = DAMIER.y0;
  s += Rc(0, 0, W, H, '#0a0a14');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: Y0 + 6, bw: 40, bh: 20, c: '#262640', j: '#08081a', cl: '#34365a', fo: '#16162c', mousse: 0.06, seed: 59});
  /* la sortie du couloir, au bout (à droite) : une porte où il fait jour… pâle */
  s += F('M884 ' + Y0 + ' L 884 124 Q 922 100 960 122 L 960 ' + Y0 + ' Z', d.lin([[0, '#3a4470'], [0.6, '#2a3258'], [1, '#141a30']], 0, 0, 1, 0));
  for(var m = 0; m < 4; m++) s += Rc(900 + m * 6, Y0 - 12 - m * 12, 70 - m * 6, 8, '#4a5480', ' stroke="#141a30" stroke-width="1.5" opacity="' + (0.9 - m * 0.18) + '"');
  s += L('M880 ' + Y0 + ' L 880 120 Q 920 96 960 120', '#4a4a70', 8);
  /* les pilastres gravés de runes (bleues) et la frise */
  s += Rc(0, 0, W, 34, d.lin([[0, '#1a1a30'], [1, '#2e2e4c']])) + L('M0 34 H ' + W, '#0a0a18', 3);
  for(var f = 0; f < 24; f++) s += L('M' + (f * 40 + 8) + ' 22 l 8 -10 l 8 10 l 8 -10', '#4a4a78', 2, op(0.7));
  [120, 300, 520, 720].forEach(function(x){
    s += Rc(x - 22, 34, 44, Y0 - 34, d.lin([[0, '#3a3a5e'], [0.6, '#262640'], [1, '#16162c']], 1, 0, 0, 0), ' stroke="' + O + '" stroke-width="3"') +
      Rc(x - 28, 34, 56, 18, '#3e3e64', ' stroke="' + O + '" stroke-width="2.5"') + Rc(x - 28, Y0 - 18, 56, 18, '#3e3e64', ' stroke="' + O + '" stroke-width="2.5"');
    [100, 150, 200].forEach(function(y){ s += L('M' + (x - 8) + ' ' + y + ' l 8 -12 l 8 12 M' + x + ' ' + (y - 12) + ' v 22 M' + (x - 8) + ' ' + (y + 6) + ' h 16', '#7ad0ff', 2.2, op(0.65)); });
    s += ecran(Rc(x - 16, 84, 32, 140, d.lin([[0, '#7ad0ff', 0], [0.5, '#7ad0ff', 0.12], [1, '#7ad0ff', 0]])));
  });
  /* des bas-reliefs entre les pilastres : le soleil et l'arbre des Fondateurs */
  [[410, 150], [620, 140]].forEach(function(b, i){ s += Rc(b[0] - 50, b[1] - 50, 100, 90, '#1e1e36', ' stroke="#3a3a5e" stroke-width="4"');
    if(i === 0){ s += C(b[0], b[1] - 5, 16, 'none', ' stroke="#4a4a78" stroke-width="2.4"'); for(var k = 0; k < 8; k++){ var a = k * Math.PI / 4; s += L('M' + r1(b[0] + Math.cos(a) * 22) + ' ' + r1(b[1] - 5 + Math.sin(a) * 22) + ' L ' + r1(b[0] + Math.cos(a) * 32) + ' ' + r1(b[1] - 5 + Math.sin(a) * 32), '#4a4a78', 2.4); } }
    else s += L(T('M0 30 L 0 -2 M0 8 L -14 -6 M0 2 L 14 -12 M0 -2 L -6 -16 M0 -2 L 8 -22', b[0], b[1]), '#4a4a78', 2.4) + C(b[0], b[1] - 14, 26, 'none', ' stroke="#4a4a78" stroke-width="2" stroke-dasharray="4 5"'); });
  /* le damier, en perspective */
  for(var r = 0; r < 2; r++) for(var c = 0; c < 12; c++){
    var p = dalleCoins(c, r), cl = dalleClaire(c, r);
    var g = cl ? d.lin([[0, '#7a7a9c'], [1, '#4a4a6a']]) : d.lin([[0, '#262034'], [1, '#100c18']]);
    s += F(poly(p), g, ' stroke="#08060e" stroke-width="3" stroke-linejoin="round"');
    s += L('M' + r1(p[0][0] + 3) + ' ' + r1(p[0][1] + 2) + ' L ' + r1(p[1][0] - 3) + ' ' + r1(p[1][1] + 2), cl ? '#c8c8e8' : '#4a4060', 1.6, op(0.5));
    var mx = (p[0][0] + p[1][0] + p[2][0] + p[3][0]) / 4, my = (p[0][1] + p[2][1]) / 2;
    if(!cl){ /* de tout petits trous (pour les pointes) : un œil attentif les voit */
      for(var t = 0; t < 5; t++) s += E(mx + (t - 2) * 11 * (0.8 + 0.2 * r), my + (t % 2 ? -4 : 4), 1.8, 1.1, '#05030a'); }
  }
  /* la poussière, des dalles fendues, un vieux casque troué par les pointes */
  s += L('M' + r1(dalleCoins(7, 1)[0][0] + 10) + ' ' + (DAMIER.ym + 6) + ' l 12 14 l -4 12', '#05030a', 1.6);
  s += P('M850 ' + (SOL + 12) + ' C 850 ' + (SOL - 6) + ' 884 ' + (SOL - 6) + ' 884 ' + (SOL + 12) + ' Z', d.g('#5a5a6a')) + C(862, SOL + 2, 2, '#05030a') + C(872, SOL - 1, 2, '#05030a');
  s += Rc(0, Y0 - 2, W, 6, '#05030a', op(0.6));
  s += E(930, Y0 + 30, 120, 20, '#cfe0ff', op(0.08));
  s += nuit(d, 0.55, [[120, 150, 60, 150, 0.6], [300, 150, 70, 150, 0.7], [520, 150, 80, 160, 0.8], [720, 150, 80, 160, 0.8], [930, 200, 150, 160, 0.9], [700, 320, 280, 80, 0.6]]);
  s += ecran(E(940, 200, 120, 110, d.halo('#9ab8ff', 0.2)));
  s += brumeSol(d, H - 20, '#8a90c0', 0.12);
  s += vignette(d, 640, 190, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La salle aux trois portes : un ŒIL, une GUEULE, une LUNE (les battants sont des éléments) ---------- */
var PORTES = [{id: 'oeil', x: 566, c: '#6ad8ff'}, {id: 'gueule', x: 722, c: '#ff7a4a'}, {id: 'lune', x: 878, c: '#dcdcff'}];
var PORTE = {w: 112, haut: 118, rayon: 56};   /* l'ouverture : 112 de large, le haut de l'arc à y = 118, posée sur le sol */
function porteChemin(x){ var l = x - PORTE.w / 2, r = x + PORTE.w / 2, yb = PORTE.haut + PORTE.rayon; return 'M' + l + ' ' + SOL + ' V ' + yb + ' A ' + PORTE.rayon + ' ' + PORTE.rayon + ' 0 0 1 ' + r + ' ' + yb + ' V ' + SOL + ' Z'; }
FONDS.portes = function(){
  var d = new Defs('po'), R = rng(17), s = '';
  s += Rc(0, 0, W, H, '#0e0a14');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: SOL + 8, bw: 58, bh: 28, c: '#2e2838', j: '#0a0810', cl: '#3c3448', fo: '#1c1824', mousse: 0.04, seed: 71});
  /* la frise du haut et la voûte */
  s += Rc(0, 0, W, 30, '#16121e') + L('M0 30 H ' + W, '#3a3248', 3);
  for(var f = 0; f < 32; f++) s += C(f * 30 + 15, 15, 5, 'none', ' stroke="#4a4058" stroke-width="2"');
  /* le lustre de cristaux, pendu au milieu (la lumière de la salle) */
  s += L('M722 0 V 40', '#4a4058', 3);
  s += '<g transform="translate(722 58) rotate(180)">' + cristaux(d, 0, 0, 0.62, '#c8a8ff', R) + '</g>';
  /* les trois portes : le cadre sculpté, le noir derrière (avec une lueur de ce qu'il y a au bout) */
  PORTES.forEach(function(p, i){
    var x = p.x, l = x - PORTE.w / 2, r = x + PORTE.w / 2, yb = PORTE.haut + PORTE.rayon;
    s += F(porteChemin(x), d.rad([[0, sombre(p.c, 0.8)], [0.6, '#08060c'], [1, '#05030a']], 0.5, 0.75, 0.8));
    /* le cadre : deux montants, l'arc de claveaux, le seuil */
    var arc = 'M' + (l - 12) + ' ' + SOL + ' V ' + yb + ' A ' + (PORTE.rayon + 12) + ' ' + (PORTE.rayon + 12) + ' 0 0 1 ' + (r + 12) + ' ' + yb + ' V ' + SOL;
    s += L(arc, '#0a0810', 30) + L(arc, d.lin([[0, '#5a5068'], [1, '#2e2838']], 1, 0, 0, 0), 22) + L(arc, '#6a6078', 1.6, op(0.5));
    for(var v = 1; v < 9; v++){ var a = Math.PI * (1 - v / 9), cx = x + Math.cos(a) * (PORTE.rayon + 12), cy = yb - Math.sin(a) * (PORTE.rayon + 12);
      s += L('M' + r1(cx - Math.cos(a) * 11) + ' ' + r1(cy + Math.sin(a) * 11) + ' L ' + r1(cx + Math.cos(a) * 11) + ' ' + r1(cy - Math.sin(a) * 11), '#0a0810', 2.4); }
    [210, 260, 310].forEach(function(y){ s += L('M' + (l - 23) + ' ' + y + ' H ' + (l - 1) + ' M' + (r + 1) + ' ' + y + ' H ' + (r + 23), '#0a0810', 2.4); });
    /* la clé de voûte, avec le même signe en petit, qui luit */
    s += P(T('M-14 -16 L 14 -16 L 10 10 L -10 10 Z', x, PORTE.haut - 12), d.lin([[0, '#6a6078'], [1, '#3a3248']]));
    s += ecran(E(x, PORTE.haut - 14, 26, 22, d.halo(p.c, 0.45)));
    var sg = {oeil: 'M-8 0 Q 0 -7 8 0 Q 0 7 -8 0 Z M0 -2 v 4', gueule: 'M-8 -3 Q 0 7 8 -3 M-5 -1 L -3 3 L -1 0 L 1 3 L 3 -1', lune: null}[p.id];
    s += L(sg ? T(sg, x, PORTE.haut - 14) : croissant(x - 2, PORTE.haut - 14, 7), p.c, 2, op(0.9));
    /* des runes autour du cadre, couleur de la porte */
    for(var k = 0; k < 4; k++){ var ry = 200 + k * 34; s += L(T('M-4 6 L 0 -6 L 4 6 M-3 1 L 3 1', l - 12, ry), p.c, 1.6, op(0.4)) + L(T('M-4 -6 L 4 6 M4 -6 L -4 6', r + 12, ry), p.c, 1.6, op(0.4)); }
    /* le seuil, et la lumière qui filtre en dessous */
    s += P('M' + (l - 26) + ' ' + (SOL - 4) + ' L ' + (r + 26) + ' ' + (SOL - 4) + ' L ' + (r + 30) + ' ' + (SOL + 6) + ' L ' + (l - 30) + ' ' + (SOL + 6) + ' Z', d.lin([[0, '#5a5068'], [1, '#2a2434']]));
  });
  /* un banc de pierre et une statue usée entre les portes ? non : des colonnes engagées */
  [490, 644, 800, 948].forEach(function(x){ s += Rc(x - 9, 40, 18, SOL - 40, d.lin([[0, '#3e3650'], [1, '#1c1824']], 1, 0, 0, 0), ' stroke="' + O + '" stroke-width="2"') + Rc(x - 13, 40, 26, 10, '#463e58', ' stroke="' + O + '" stroke-width="2"'); });
  /* la mosaïque du sol : un grand cercle (la boussole des Fondateurs) */
  s += solDalles(d, {c1: '#3a3444', c2: '#0e0a12', fuite: 722, pas: 156});
  s += E(722, SOL + 18, 240, 20, 'none', ' stroke="#8a7a50" stroke-width="2.4" opacity=".6"') + E(722, SOL + 18, 180, 14, 'none', ' stroke="#8a7a50" stroke-width="1.6" opacity=".5"') +
    L('M722 ' + (SOL + 4) + ' L 722 ' + (SOL + 32) + ' M482 ' + (SOL + 18) + ' L 962 ' + (SOL + 18), '#8a7a50', 1.4, op(0.4));
  s += toile(0, 30, 80, 1, '#c8c0d8') + toile(W, 30, 70, -1, '#c8c0d8');
  s += nuit(d, 0.55, [[722, 60, 180, 120, 0.9]].concat(PORTES.map(function(p){ return [p.x, 220, 110, 170, 0.75]; })));
  s += ecran(E(722, 70, 160, 110, d.halo('#c8a8ff', 0.35)) + E(722, SOL + 14, 260, 40, d.halo('#c8a8ff', 0.16)));
  PORTES.forEach(function(p){ s += ecran(E(p.x, SOL - 4, 70, 14, d.halo(p.c, 0.3))); });
  s += brumeSol(d, SOL, '#a898c8', 0.12);
  s += vignette(d, 700, 200, 0.95) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La fausse crypte, côté objet : un fond simple (le moteur peut poser le sarcophage sur le décor de combat de la crypte) ---------- */
FONDS['crypte-sarco'] = function(){
  var d = new Defs('cs'), R = rng(5), s = '';
  s += Rc(0, 0, W, H, '#0c0a12');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: SOL + 8, bw: 48, bh: 24, c: '#28243a', j: '#09070f', cl: '#363050', fo: '#181428', mousse: 0.08, seed: 13});
  /* des niches funéraires dans le mur, avec des urnes */
  [[560, 110], [880, 110], [560, 220], [880, 220]].forEach(function(n){ s += F(T('M-30 34 L -30 -10 C -30 -40 30 -40 30 -10 L 30 34 Z', n[0], n[1]), '#06050a', ' stroke="#3e3654" stroke-width="5"') +
    P(T('M-9 32 C -14 20 -10 6 -4 4 L -5 -1 L 5 -1 L 4 4 C 10 6 14 20 9 32 Z', n[0], n[1]), d.g('#5a4a5a')); });
  /* la grande dalle gravée au fond (un corbeau ? non : une lune qui veille) */
  s += Rc(660, 70, 120, 150, '#1e1a2c', ' stroke="#3e3654" stroke-width="5"') + L(croissant(716, 140, 30), '#8a80c0', 2.4, op(0.6));
  s += solDalles(d, {c1: '#34304a', c2: '#0e0c16', fuite: 720, pas: 140});
  s += toile(W, 0, 110, -1) + toile(0, 0, 90, 1) + racine(820, -4, 70, '#3a2a1c', 4, R);
  s += champis(d, 940, SOL - 1, 0.9, '#b08aff', '#e0d0ff') + champis(d, 492, SOL - 1, 0.6, '#b08aff', '#e0d0ff');
  s += nuit(d, 0.6, [[720, 240, 260, 160, 0.8], [940, 320, 80, 60, 0.7]]);
  s += ecran(F('M700 0 L 740 0 L 800 ' + SOL + ' L 640 ' + SOL + ' Z', d.lin([[0, '#c8c0ff', 0.25], [1, '#a8a0e0', 0.04]])) + E(720, 260, 220, 100, d.halo('#9a8ad8', 0.2)));
  s += brumeSol(d, SOL, '#9a8ad8', 0.16);
  s += vignette(d, 720, 210, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- Le feu de camp : un coin abrité sous un rocher, de quoi s'asseoir ; chaud et rassurant (le feu est un élément) ---------- */
var FEU = {x: 660, y: SOL};
FONDS.camp = function(){
  var d = new Defs('ca'), R = rng(37), s = '';
  s += Rc(0, 0, W, H, '#120a08');
  s += murRoche(d, {x0: -20, y0: -20, x1: W + 20, y1: SOL + 8, t: 50, c: '#3a2a26', cl: '#4e3830', fo: '#22181a', j: '#0e0808', seed: 21,
    teinte: function(x, y, c){ var k = Math.max(0, 1 - Math.hypot((x - FEU.x) / 260, (y - 280) / 170)); return mix(c, '#a0583a', k * k * 0.55); }});
  /* le rocher en surplomb qui fait un abri (en haut à droite) */
  s += P('M440 -10 L ' + (W + 10) + ' -10 L ' + (W + 10) + ' 120 C 920 110 880 90 820 92 C 740 96 660 70 600 58 C 540 46 490 30 440 30 Z', d.lin([[0, '#1a1010'], [1, '#3a2620']]));
  s += L('M440 30 C 490 30 540 46 600 58 C 660 70 740 96 820 92 C 880 90 920 110 ' + W + ' 120', '#c86a3a', 2.4, op(0.5));
  /* une toile tendue sous le rocher (contre les courants d'air) et des herbes qui sèchent */
  s += P('M780 84 C 820 120 870 128 932 108 L 940 190 C 920 210 900 236 904 262 C 870 230 830 220 796 226 C 806 190 800 130 780 84 Z', d.lin([[0, '#7a3a34'], [1, '#3a1a18']], 1, 0, 0, 1)) +
    L('M790 100 C 812 150 818 190 806 222 M850 118 C 866 170 870 200 866 232', '#2a1010', 1.6, op(0.7)) + L('M934 112 L 940 186', '#c86a4a', 1.4, op(0.6)) +
    C(780, 84, 4, '#8a8a9a', ' stroke="' + O + '" stroke-width="2"') + C(932, 106, 4, '#8a8a9a', ' stroke="' + O + '" stroke-width="2"');
  s += L('M520 150 Q 620 172 740 150', '#5a4030', 2);
  [548, 588, 628, 668, 708].forEach(function(x, i){ var y = 152 + Math.sin((x - 520) / 220 * Math.PI) * 14; s += L('M' + x + ' ' + y + ' l 0 14', '#5a4030', 1.4) +
    P(T('M0 0 C -8 10 -8 26 -2 34 L 2 34 C 8 26 8 10 0 0 Z', x, y + 12), d.g(['#5a8a3a', '#8a7a3a', '#6a9a4a', '#9a6a3a', '#5a8a5a'][i]), ' stroke-width="2"'); });
  /* les couchages : trois rouleaux de couverture */
  function couche(x, y, w, c){ return P('M' + (x - w / 2) + ' ' + y + ' C ' + (x - w / 2) + ' ' + (y - 22) + ' ' + (x + w / 2) + ' ' + (y - 24) + ' ' + (x + w / 2) + ' ' + y + ' Z', d.g(c)) +
    L('M' + (x - w / 2 + 10) + ' ' + (y - 8) + ' Q ' + x + ' ' + (y - 16) + ' ' + (x + w / 2 - 10) + ' ' + (y - 10), sombre(c, 0.4), 1.6) + E(x + w / 2 - 6, y - 10, 8, 10, sombre(c, 0.2), ' stroke="' + O + '" stroke-width="2"'); }
  s += couche(840, SOL - 2, 120, '#7a3a3a') + couche(910, SOL - 30, 90, '#3a5a7a');
  /* le tronc pour s'asseoir, la pierre plate, les sacs */
  s += P('M500 ' + (SOL - 2) + ' L 506 ' + (SOL - 30) + ' L 600 ' + (SOL - 34) + ' L 604 ' + (SOL - 4) + ' Z', d.lin([[0, '#8a5a34'], [1, '#3a2414']])) + E(602, SOL - 18, 8, 15, '#c8905a', ' stroke="' + O + '" stroke-width="2.5"') +
    C(602, SOL - 18, 4, 'none', ' stroke="#8a5a34" stroke-width="1.2"') + L('M512 ' + (SOL - 22) + ' L 590 ' + (SOL - 24), '#4a2e18', 1.4);
  s += P('M752 ' + (SOL + 2) + ' C 750 ' + (SOL - 18) + ' 800 ' + (SOL - 22) + ' 808 ' + (SOL + 2) + ' Z', d.g('#6a5a5a'));
  s += P('M880 ' + SOL + ' L 884 ' + (SOL - 46) + ' Q 904 ' + (SOL - 56) + ' 924 ' + (SOL - 46) + ' L 928 ' + SOL + ' Z', d.g('#6a4a2a')) + L('M884 ' + (SOL - 34) + ' L 926 ' + (SOL - 34), '#3a2414', 3);
  /* le petit tas de bois, la marmite sur ses pierres */
  [[548, SOL + 8, 6], [566, SOL + 6, -4], [556, SOL - 2, 2]].forEach(function(b){ s += '<g transform="rotate(' + b[2] + ' ' + b[0] + ' ' + b[1] + ')">' + P('M' + (b[0] - 26) + ' ' + (b[1] - 6) + ' L ' + (b[0] + 26) + ' ' + (b[1] - 6) + ' L ' + (b[0] + 26) + ' ' + (b[1] + 4) + ' L ' + (b[0] - 26) + ' ' + (b[1] + 4) + ' Z', d.lin([[0, '#8a5a34'], [1, '#3a2414']])) + E(b[0] + 26, b[1] - 1, 3, 5, '#c8905a') + '</g>'; });
  s += P('M720 ' + (SOL - 2) + ' C 718 ' + (SOL - 26) + ' 764 ' + (SOL - 26) + ' 762 ' + (SOL - 2) + ' Z', d.g('#3a3a44')) + L('M716 ' + (SOL - 22) + ' L 766 ' + (SOL - 22), O, 5) + L('M716 ' + (SOL - 22) + ' L 766 ' + (SOL - 22), '#5a5a6a', 2.4);
  /* le cercle de pierres du foyer (le feu, les bûches, les flammes : un élément) */
  s += E(FEU.x, SOL + 6, 66, 12, '#1a0c08');
  for(var k = 0; k < 9; k++){ var a = Math.PI * (0.05 + k / 8 * 0.9), px = FEU.x + Math.cos(a) * 64, py = SOL + 4 + Math.sin(a) * 9; s += E(px, py, 10, 7, d.g('#5a4a48'), ' stroke="' + O + '" stroke-width="2"'); }
  s += solDalles(d, {c1: '#3a2620', c2: '#100808', fuite: FEU.x, pas: 150}).replace(/<path d="M0 340 H 960 V 372 H 0 Z"/, '<path d="M0 340 H 960 V 372 H 0 Z"');
  s += cailloux(R, 14, 480, 940, SOL + 10, H - 6, '#4a3430');
  s += nuit(d, 0.62, [[FEU.x, 260, 380, 220, 1], [FEU.x, SOL, 300, 60, 1]], '#06030a');
  /* la chaleur du feu sur tout le coin (le feu lui-même est un élément qui ondule) */
  s += ecran(E(FEU.x, 240, 360, 220, d.halo('#ff8a3a', 0.32)) + E(FEU.x, SOL - 20, 220, 90, d.halo('#ffb050', 0.35)) + E(FEU.x, SOL + 10, 200, 24, d.halo('#ffc070', 0.3)));
  /* un peu de bleu froid dans les coins (le reste du donjon) */
  s += ecran(E(140, 120, 200, 140, d.halo('#4a5aa0', 0.18)));
  s += champis(d, 470, SOL - 1, 0.5, '#5fe0f0');
  s += vignette(d, FEU.x, 230, 0.9) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La porte aux quatre signes : la grande porte scellée des Fondateurs ; Moustache gratte ; le ruban d'Odette ---------- */
var GRANDE = {x: 712, l: 572, r: 852, haut: 34, sceau: [712, 160, 64], trappe: [688, 300, 46, 38]};
function signes(cx, cy, k, c, w){
  /* les quatre signes (comme sur la pierre de la salle des rats) : l'œil, le chaudron, la lyre, l'étoile */
  return L(T('M-26 -16 Q -17 -25 -8 -16 Q -17 -7 -26 -16 Z', cx, cy).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function(m, a, b){ return r1(cx + (+a - cx) * k) + ' ' + r1(cy + (+b - cy) * k); }), c, w) +
    C(cx - 17 * k, cy - 16 * k, 2.6 * k, c) +
    L(T('M8 -22 Q 8 -8 18 -8 Q 28 -8 28 -22 Z M6 -22 L 30 -22 M12 -6 L 10 -2 M24 -6 L 26 -2', cx, cy).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function(m, a, b){ return r1(cx + (+a - cx) * k) + ' ' + r1(cy + (+b - cy) * k); }), c, w) +
    L(T('M-26 8 Q -26 26 -17 26 Q -8 26 -8 8 M-22 12 L -22 24 M-17 12 L -17 24 M-12 12 L -12 24 M-28 8 L -24 6 M-6 8 L -10 6', cx, cy).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function(m, a, b){ return r1(cx + (+a - cx) * k) + ' ' + r1(cy + (+b - cy) * k); }), c, w) +
    L(T('M18 4 L 21 12 L 29 12 L 23 17 L 25 25 L 18 20 L 11 25 L 13 17 L 7 12 L 15 12 Z', cx, cy).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function(m, a, b){ return r1(cx + (+a - cx) * k) + ' ' + r1(cy + (+b - cy) * k); }), c, w);
}
FONDS.porte4 = function(){
  var d = new Defs('p4'), R = rng(99), s = '', G = GRANDE;
  s += Rc(0, 0, W, H, '#0a0a14');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: SOL + 8, bw: 62, bh: 30, c: '#262a40', j: '#08080f', cl: '#343a58', fo: '#171a2a', mousse: 0.1, seed: 23});
  /* le grand cadre de pierre des Fondateurs, gravé */
  var rr = (G.r - G.l) / 2, yb = G.haut + rr;
  var arcOut = 'M' + (G.l - 22) + ' ' + SOL + ' V ' + yb + ' A ' + (rr + 22) + ' ' + (rr + 22) + ' 0 0 1 ' + (G.r + 22) + ' ' + yb + ' V ' + SOL;
  s += L(arcOut, '#08080f', 50) + L(arcOut, d.lin([[0, '#5a6080'], [1, '#2a2e44']], 1, 0, 0, 0), 40) + L(arcOut, '#7a80a0', 1.6, op(0.4));
  for(var v = 1; v < 13; v++){ var a = Math.PI * (1 - v / 13), cx = G.x + Math.cos(a) * (rr + 22), cy = yb - Math.sin(a) * (rr + 22);
    s += L('M' + r1(cx - Math.cos(a) * 20) + ' ' + r1(cy + Math.sin(a) * 20) + ' L ' + r1(cx + Math.cos(a) * 20) + ' ' + r1(cy - Math.sin(a) * 20), '#08080f', 2.4); }
  /* des runes des Fondateurs dans le cadre */
  for(var k = 0; k < 6; k++){ var ry = 170 + k * 28; s += L(T('M-5 7 L 0 -7 L 5 7 M-3 2 L 3 2', G.l - 22, ry), '#7ff0ff', 1.8, op(0.45)) + L(T('M-5 -7 L 5 7 M5 -7 L -5 7', G.r + 22, ry), '#7ff0ff', 1.8, op(0.45)); }
  /* le battant : la pierre, les bandes de fer, les rivets */
  var porte = 'M' + G.l + ' ' + SOL + ' V ' + yb + ' A ' + rr + ' ' + rr + ' 0 0 1 ' + G.r + ' ' + yb + ' V ' + SOL + ' Z';
  s += F(porte, d.lin([[0, '#3e4462'], [0.5, '#2c3048'], [1, '#1a1c2c']], 1, 0, 0, 1), ' stroke="' + O + '" stroke-width="3"');
  s += L('M' + G.x + ' ' + G.haut + ' V ' + SOL, '#0e0e18', 3) + L('M' + (G.x + 2) + ' ' + (G.haut + 4) + ' V ' + SOL, '#5a6080', 1, op(0.5));
  [118, 250].forEach(function(y){ s += Rc(G.l + 2, y - 9, G.r - G.l - 4, 18, d.lin([[0, '#4a4a58'], [1, '#22222c']]), ' stroke="' + O + '" stroke-width="2.4"');
    for(var x = G.l + 16; x < G.r - 8; x += 26) s += C(x, y, 3, '#6a6a7a', ' stroke="' + O + '" stroke-width="1.4"'); });
  /* le sceau rond et ses quatre signes, qui luisent */
  var sc = G.sceau;
  s += ecran(C(sc[0], sc[1], sc[2] + 30, d.halo('#7ff0ff', 0.35)));
  s += C(sc[0], sc[1], sc[2], d.rad([[0, '#3a4060'], [1, '#22263a']]), ' stroke="' + O + '" stroke-width="4"') + C(sc[0], sc[1], sc[2] - 8, 'none', ' stroke="#5a6080" stroke-width="3"') +
    C(sc[0], sc[1], sc[2] - 14, 'none', ' stroke="#7ff0ff" stroke-width="1.2" stroke-dasharray="2 6" opacity=".6"') + L('M' + (sc[0] - sc[2] + 10) + ' ' + sc[1] + ' H ' + (sc[0] + sc[2] - 10) + ' M' + sc[0] + ' ' + (sc[1] - sc[2] + 10) + ' V ' + (sc[1] + sc[2] - 10), '#5a6080', 2);
  s += signes(sc[0], sc[1], 1.45, '#9ff6ff', 3);
  /* la petite trappe en bas (Léo y passe le pain et la soupe), et la lumière chaude qui filtre sous la porte */
  var tp = G.trappe;
  s += Rc(tp[0], tp[1], tp[2], tp[3], d.lin([[0, '#6a4a2e'], [1, '#3a2614']]), ' stroke="' + O + '" stroke-width="3"') + L('M' + (tp[0] + tp[2] / 2) + ' ' + tp[1] + ' V ' + (tp[1] + tp[3]), '#2a1a0c', 2) +
    Rc(tp[0] - 3, tp[1] - 3, tp[2] + 6, 6, '#4a4a58', ' stroke="' + O + '" stroke-width="2"') + C(tp[0] + tp[2] - 9, tp[1] + tp[3] / 2, 3, '#8a8a9a', ' stroke="' + O + '" stroke-width="1.5"');
  s += ecran(Rc(G.l + 4, SOL - 4, G.r - G.l - 8, 5, '#ffc070', op(0.9)) + E(G.x, SOL, 160, 12, d.halo('#ffb050', 0.6)) + E(tp[0] + tp[2] / 2, tp[1] + tp[3], 40, 8, d.halo('#ffc070', 0.6)));
  /* des griffures sur la pierre, à côté de la trappe : six griffes (Moustache revient souvent) */
  [[650, 280], [744, 286]].forEach(function(g){ for(var k = 0; k < 6; k++) s += L('M' + (g[0] + k * 4) + ' ' + g[1] + ' l ' + (1 + k * 0.3) + ' 22', '#0a0a14', 1.6, op(0.8)) + L('M' + (g[0] + k * 4 + 1) + ' ' + g[1] + ' l ' + (1 + k * 0.3) + ' 22', '#7a80a0', 0.8, op(0.5)); });
  /* le clou où pend le ruban d'Odette (le ruban est un élément) */
  s += C(522, 192, 4, '#8a8a9a', ' stroke="' + O + '" stroke-width="2"');
  s += solDalles(d, {c1: '#34364e', c2: '#0c0c16', fuite: G.x, pas: 150});
  s += E(G.x, SOL + 8, 150, 8, '#ffb050', op(0.12));
  s += toile(0, 0, 90, 1) + toile(W, 0, 100, -1) + racine(940, -4, 120, '#3a2a1c', 4, R) + racine(470, -4, 80, '#3a2a1c', 3, R);
  s += champis(d, 940, SOL - 1, 0.9, '#5fe0f0') + champis(d, 490, SOL - 1, 0.6, '#5fe0f0');
  s += cailloux(R, 10, 500, 940, SOL + 8, H - 6, '#3a3a52');
  s += nuit(d, 0.58, [[sc[0], sc[1], 200, 180, 0.9], [G.x, SOL, 220, 60, 0.8], [940, 320, 80, 60, 0.6]]);
  s += ecran(E(G.x, 180, 260, 200, d.halo('#5ac0ff', 0.14)));
  s += brumeSol(d, SOL, '#8a9ad0', 0.16);
  s += vignette(d, 700, 200, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ---------- La dernière salle : un cul-de-sac bas ; Léo est coincé contre le mur du fond avec sa lanterne (Léo est un élément) ---------- */
FONDS.leo = function(){
  var d = new Defs('le'), R = rng(61), s = '';
  var LX = 820;
  s += Rc(0, 0, W, H, '#0c0a10');
  s += murBriques(d, {x0: -20, y0: -10, x1: W + 20, y1: SOL + 8, bw: 36, bh: 18, c: '#2a2630', j: '#09070c', cl: '#38323e', fo: '#18141c', mousse: 0.12, seed: 3});
  /* le mur du fond, en coin (à droite) : la salle s'arrête là */
  s += P('M900 -10 L ' + (W + 10) + ' -10 L ' + (W + 10) + ' ' + (H + 10) + ' L 900 ' + SOL + ' Z', d.lin([[0, '#1a1620'], [1, '#2a2430']], 0, 0, 1, 0));
  for(var b = 0; b < 18; b++){ var y = b * 20; s += L('M900 ' + (y + 4) + ' L ' + W + ' ' + (y - 6 + b * 1.2), '#09070c', 2.4); }
  /* le plafond bas : des poutres */
  s += Rc(0, 0, W, 28, '#120c0c') + [110, 330, 560, 780].map(function(x){ return P('M' + (x - 16) + ' 0 L ' + (x + 16) + ' 0 L ' + (x + 16) + ' 30 L ' + (x - 16) + ' 30 Z', d.lin([[0, '#4a3020'], [1, '#22140c']])); }).join('') + L('M0 28 H ' + W, '#2a1a10', 6);
  /* les affaires de Léo : une couverture par terre, une caisse, un bol, des miettes, un sac de farine qui fuit */
  s += P('M600 ' + (SOL + 4) + ' C 620 ' + (SOL - 14) + ' 700 ' + (SOL - 16) + ' 740 ' + (SOL - 4) + ' L 744 ' + (SOL + 10) + ' L 596 ' + (SOL + 12) + ' Z', d.g('#6a4a6a')) + L('M610 ' + (SOL + 2) + ' Q 670 ' + (SOL - 10) + ' 736 ' + (SOL + 2), '#3a2a3a', 1.6) +
    L('M612 ' + (SOL + 6) + ' L 734 ' + (SOL + 6), '#c8a86a', 1.4, ' stroke-dasharray="4 4"');
  s += P('M520 ' + SOL + ' L 520 ' + (SOL - 50) + ' L 584 ' + (SOL - 50) + ' L 584 ' + SOL + ' Z', d.g('#6a4a2a')) + L('M520 ' + (SOL - 25) + ' H 584', '#3a2414', 2) + L('M534 ' + (SOL - 50) + ' V ' + SOL, '#3a2414', 1.4);
  s += P('M546 ' + (SOL - 50) + ' L 550 ' + (SOL - 64) + ' L 562 ' + (SOL - 64) + ' L 566 ' + (SOL - 50) + ' Z', '#efe2c4', ' stroke-width="2"') + L('M556 ' + (SOL - 64) + ' v -5', O, 1.6);
  s += P('M640 ' + (SOL + 18) + ' C 640 ' + (SOL + 8) + ' 664 ' + (SOL + 8) + ' 664 ' + (SOL + 18) + ' Z', d.g('#8a6a4a')) + E(652, SOL + 10, 12, 2.4, '#5a3a22');
  s += P('M466 ' + SOL + ' C 462 ' + (SOL - 34) + ' 474 ' + (SOL - 46) + ' 492 ' + (SOL - 46) + ' C 510 ' + (SOL - 46) + ' 520 ' + (SOL - 34) + ' 516 ' + SOL + ' Z', d.g('#d8ccb0'));
  s += E(500, SOL + 10, 44, 6, '#e8e0d0', op(0.45)) + E(520, SOL + 18, 20, 3, '#e8e0d0', op(0.3));
  /* des traces de farine sur le sol, qui vont jusqu'à Léo (le Pisteur les reconnaît) */
  [[540, 362], [590, 352], [700, 362], [760, 350]].forEach(function(t, i){ s += '<g transform="translate(' + t[0] + ' ' + t[1] + ') scale(1 .5)">' + E(0, 0, 8, 12, '#e8e0d0', op(0.35 - i * 0.04)) + E(0, -14, 6, 5, '#e8e0d0', op(0.3 - i * 0.04)) + '</g>'; });
  /* une fissure dans le mur, par où passe un peu de bleu ; des toiles ; des racines */
  s += L('M680 40 l 8 30 l -6 30 l 10 40 l -4 30', '#05030a', 4) + ecran(L('M680 40 l 8 30 l -6 30 l 10 40 l -4 30', '#4a6ab0', 1, op(0.5)) + E(686, 130, 30, 80, d.halo('#6a8ad0', 0.16)));
  /* une vieille arche murée, une étagère avec des bouts de chandelle, des marques au charbon sur le mur (Léo compte les soirs) */
  s += F('M560 ' + SOL + ' V 200 C 560 150 660 150 660 200 V ' + SOL + ' Z', '#1a1620', op(0.85)) + L('M560 ' + SOL + ' V 200 C 560 150 660 150 660 200 V ' + SOL, '#3e3648', 10) + L('M560 ' + SOL + ' V 200 C 560 150 660 150 660 200 V ' + SOL, '#09070c', 2);
  for(var m = 0; m < 7; m++) s += L('M' + (566 + (m % 2) * 20) + ' ' + (210 + m * 18) + ' h 70', '#09070c', 2, op(0.7));
  s += P('M720 150 L 800 150 L 800 158 L 720 158 Z', d.lin([[0, '#5a3a22'], [1, '#2a1a10']])) + L('M726 158 l 6 10 M794 158 l -6 10', '#2a1a10', 3) +
    [[734, 6], [752, 10], [770, 4], [786, 8]].map(function(b){ return Rc(b[0] - 3, 150 - b[1], 6, b[1], '#e8dcc0', ' stroke="' + O + '" stroke-width="1.4"'); }).join('');
  [[744, 196], [752, 196], [760, 196], [768, 196], [744, 214], [752, 214], [760, 214]].forEach(function(t){ s += L('M' + t[0] + ' ' + (t[1] - 8) + ' l 1 14', '#0c0a10', 2, op(0.7)); });
  s += L('M740 192 l 32 6', '#0c0a10', 2, op(0.7));
  /* des caisses empilées et une chaîne pendue */
  s += P('M640 ' + SOL + ' L 640 ' + (SOL - 34) + ' L 690 ' + (SOL - 34) + ' L 690 ' + SOL + ' Z', d.g('#5a3e24')) + L('M640 ' + (SOL - 34) + ' L 690 ' + SOL, '#2a1a10', 2);
  for(var ch = 0; ch < 6; ch++) s += E(470 + (ch % 2), 34 + ch * 12, 4, 7, 'none', ' stroke="#4a4458" stroke-width="3"');
  s += toile(900, 28, 60, -1) + toile(0, 28, 70, 1) + racine(620, 24, 60, '#3a2a1c', 3, R);
  s += solDalles(d, {c1: '#34303a', c2: '#0c0a10', fuite: LX, pas: 130});
  s += cailloux(R, 10, 480, 900, SOL + 8, H - 6, '#3a3442');
  /* la nuit, percée par la lanterne de Léo (son halo bouge avec lui : élément) */
  s += nuit(d, 0.66, [[LX, 220, 260, 200, 1], [LX, SOL, 220, 50, 0.8]]);
  s += ecran(E(LX, 220, 300, 200, d.halo('#ffa040', 0.26)) + E(LX, SOL + 4, 180, 24, d.halo('#ffc070', 0.22)));
  s += brumeSol(d, SOL, '#a090b0', 0.1);
  s += vignette(d, 720, 200, 1) + avantPlan();
  return svgTexte(d, W, H, s);
};

/* ======================================================================
   LES DESSINS DES ÉLÉMENTS (sans aucun filtre : des dégradés seulement)
   ====================================================================== */
function art(p, w, h, f){ var d = new Defs(p); return svgTexte(d, w, h, f(d)); }
var A = {};
/* le carquois de tous les jours du Pisteur : cuir clair, trois flèches à empennage rouge et crème (comme sur son dos) */
A.carquoisNormal = function(){ return art('cn', 56, 116, function(d){
  var s = '';
  [[16, 8, -8, '#e04a3a'], [28, 3, 0, '#f3e7cb'], [40, 8, 9, '#e04a3a']].forEach(function(f){
    var x = f[0], y = f[1], a = f[2];
    s += '<g transform="rotate(' + a + ' ' + x + ' 60)">' + L('M' + x + ' 60 L ' + x + ' ' + (y + 16), O, 5.4) + L('M' + x + ' 60 L ' + x + ' ' + (y + 16), '#a07a48', 2.8) +
      P('M' + x + ' ' + (y + 2) + ' L ' + (x + 7) + ' ' + (y + 8) + ' L ' + (x + 7) + ' ' + (y + 22) + ' L ' + x + ' ' + (y + 17) + ' L ' + (x - 7) + ' ' + (y + 22) + ' L ' + (x - 7) + ' ' + (y + 8) + ' Z', f[3], ' stroke-width="2.2"') +
      L('M' + x + ' ' + (y + 4) + ' L ' + x + ' ' + (y + 17), O, 1.4) + '</g>';
  });
  s += P('M10 46 L 46 46 L 43 110 Q 28 115 13 110 Z', d.g('#8a5a32')) + F('M10 46 L 20 46 L 18 112 Q 15 111 13 110 Z', '#000', op(0.22)) +
    P('M8 42 L 48 42 L 47 52 L 9 52 Z', d.g('#c89a5a'), ' stroke-width="2.4"') + P('M12 92 L 45 92 L 44 100 L 13 100 Z', d.g('#c89a5a'), ' stroke-width="2.4"') +
    L('M15 56 L 14 88 M41 56 L 42 88', '#d8b070', 1.2, ' stroke-dasharray="3 3"');
  return s + L('M42 50 Q 46 76 41 104', '#ffffff', 2, op(0.22)); }); };
/* la corde qui pend du haut du puits (24 de large) */
A.corde = function(h){ return art('co', 24, h, function(d){
  var c = 'M12 0 C 10 ' + r1(h * 0.33) + ' 15 ' + r1(h * 0.66) + ' 12 ' + h, s = L(c, O, 8) + L(c, '#a8864e', 5);
  for(var y = 4; y < h - 4; y += 9) s += L('M9.5 ' + y + ' l 5 4', '#6a4a26', 1.4);
  return s + L('M14 0 C 12 ' + r1(h * 0.33) + ' 17 ' + r1(h * 0.66) + ' 14 ' + h, '#e8d0a0', 1.1, op(0.55)); }); };
/* la bourse de pièces */
A.bourse = function(){ return art('bo', 72, 58, function(d){
  return E(36, 53, 30, 4, '#000', op(0.35)) +
    [[56, 50, 0], [64, 53, 0], [47, 55, 0]].map(function(p){ return E(p[0], p[1], 6.5, 3.2, d.g('#f2c650'), ' stroke="' + O + '" stroke-width="2"') + E(p[0] - 1, p[1] - 0.8, 3, 1.2, '#fff4c0', op(0.8)); }).join('') +
    '<g transform="rotate(-18 66 42)">' + E(66, 42, 4, 7, d.g('#f2c650'), ' stroke="' + O + '" stroke-width="2"') + L('M66 37 v 10', '#b8862e', 1.2) + '</g>' +
    P('M14 52 C 2 46 4 24 18 19 C 22 17 26 17 30 18 C 28 13 30 8 34 8 C 38 8 42 12 40 18 C 46 19 54 23 56 33 C 58 45 50 53 38 54 Z', d.g('#8e5a32')) +
    F('M14 52 C 6 46 6 30 16 22 C 14 32 16 44 24 53 Z', '#4a2a14', op(0.45)) +
    L('M16 42 Q 34 50 52 42', '#c89060', 1.3, ' stroke-dasharray="3 3"') +
    L('M26 19 Q 35 24 44 18', O, 5.5) + L('M26 19 Q 35 24 44 18', '#e8c062', 2.6) +
    L('M43 18 q 8 -3 10 -12 M43 18 q 2 -8 -2 -14', '#e8c062', 2) + C(53, 6, 2.2, '#e8c062', ' stroke="' + O + '" stroke-width="1.2"') +
    L('M42 27 q 8 5 8 14', '#ffffff', 2, op(0.35)) + C(31, 34, 5, 'none', ' stroke="#e8c062" stroke-width="1.6" opacity=".8"') + L('M29 34 h 4 M31 32 v 4', '#e8c062', 1.4); }); };
/* la pierre de rune du Sage, au fond du puits : une pierre parmi les pierres, à peine gravée (rien ne la signale) */
A.pierreRune = function(){ return art('pr', 60, 40, function(d){
  return E(30, 37, 26, 3.4, '#000', op(0.4)) +
    P('M6 34 C 2 24 8 10 22 7 C 36 3 52 9 55 21 C 57 30 52 35 44 36 L 14 36 Z', d.g('#4e5274')) +
    F('M6 34 C 4 26 8 16 16 11 C 13 20 14 30 20 36 L 14 36 Z', '#15132a', op(0.5)) +
    L('M24 14 L 30 26 L 37 13 M30 26 L 30 31 M23 31 q 7 3 14 0', '#9fe6f2', 1.7, op(0.42)) +
    L('M40 12 q 8 2 10 9', '#ffffff', 1.3, op(0.2)); }); };
/* les canaux : la vieille roue du mur (elle recouvre pile celle du décor) et la grille de l'arche de droite */
var ROUE = {x: 688, y: 28, w: 72, h: 72}, GRILLE = {x: 770, y: 82, w: 152, h: 256};
A.roueCanaux = function(){ return art('rc', ROUE.w, ROUE.h, function(d){
  var c = 36, s = C(c, c, 34, '#0b1716') + C(c, c, 28, 'none', ' stroke="#060d0d" stroke-width="11"') + C(c, c, 28, 'none', ' stroke="' + d.g('#55766e') + '" stroke-width="7"');
  for(var k = 0; k < 4; k++){ var a = k * Math.PI / 4, x = Math.cos(a) * 25, y = Math.sin(a) * 25;
    s += L('M' + r1(c - x) + ' ' + r1(c - y) + ' L ' + r1(c + x) + ' ' + r1(c + y), '#060d0d', 6) + L('M' + r1(c - x) + ' ' + r1(c - y) + ' L ' + r1(c + x) + ' ' + r1(c + y), '#46625c', 3.2); }
  /* une poignée sur la jante : c'est elle qui montre de combien la roue a tourné */
  return s + C(c, c, 7.5, d.g('#3a5450'), ' stroke="#060d0d" stroke-width="2.4"') + C(c, c, 2.6, '#0b1716') +
    C(c, c - 28, 6.6, d.g('#9cc8b6'), ' stroke="#060d0d" stroke-width="2.4"') + C(c - 1.6, c - 29.6, 2, '#eafff6', op(0.8)); }); };
A.grilleCanaux = function(){ return art('gc', GRILLE.w, GRILLE.h + 8, function(d){
  var s = '', fer = d.lin([[0, '#31494a'], [0.5, '#1a2a2c'], [1, '#0c1516']], 0, 0, 1, 0);
  for(var k = 0; k < 8; k++){ var x = 9.5 + k * 19; s += Rc(x - 3.4, -4, 6.8, GRILLE.h + 2, fer, ' stroke="#050a0a" stroke-width="1.6"') + P('M' + r1(x - 4.4) + ' ' + (GRILLE.h - 3) + ' L ' + r1(x) + ' ' + (GRILLE.h + 7) + ' L ' + r1(x + 4.4) + ' ' + (GRILLE.h - 3) + ' Z', '#22393a', ' stroke-width="1.6"') +
    L('M' + r1(x - 1.6) + ' 2 V ' + (GRILLE.h - 6), '#5f8582', 1, op(0.35)); }
  [96, 176].forEach(function(y){ s += Rc(-2, y, GRILLE.w + 4, 8, fer, ' stroke="#050a0a" stroke-width="1.6"');
    for(var k = 0; k < 8; k++) s += C(9.5 + k * 19, y + 4, 2.4, '#6f9792', ' stroke="#050a0a" stroke-width="1"'); });
  return s; }); };
/* ce qu'on voit derrière la grille levée : le noir d'un couloir, et une lueur au fond */
A.passageCanaux = function(){ return art('pc', GRILLE.w, GRILLE.h, function(d){
  return Rc(0, 0, GRILLE.w, GRILLE.h, d.lin([[0, '#020607'], [1, '#07171a']])) + E(GRILLE.w / 2, GRILLE.h - 56, 40, 70, d.halo('#7fe0ff', 0.7)) +
    P('M' + (GRILLE.w / 2 - 34) + ' ' + GRILLE.h + ' L ' + (GRILLE.w / 2 - 14) + ' ' + (GRILLE.h - 120) + ' L ' + (GRILLE.w / 2 + 14) + ' ' + (GRILLE.h - 120) + ' L ' + (GRILLE.w / 2 + 34) + ' ' + GRILLE.h + ' Z', '#0d2a30', ' stroke-width="1.4" opacity=".7"'); }); };
/* la sacoche de l'Alchimiste (une place de recette en plus) */
A.sacoche = function(){ return art('sa', 88, 72, function(d){
  return E(44, 68, 36, 4, '#000', op(0.35)) +
    L('M16 26 C 12 0 76 0 72 26', O, 9) + L('M16 26 C 12 0 76 0 72 26', '#6a4426', 5.5) + L('M18 22 C 16 6 72 6 70 22', '#a87a4a', 1.4, op(0.6)) +
    P('M58 22 L 66 8 L 72 10 L 64 26 Z', d.g('#5fd08a')) + P('M64 4 L 72 6 L 71 11 L 63 9 Z', '#8a5a32', ' stroke-width="2"') +
    P('M8 26 L 80 26 L 77 64 Q 44 70 11 64 Z', d.g('#7a4a2a')) +
    F('M8 26 L 20 26 L 20 66 Q 14 66 11 64 Z', '#3a2010', op(0.4)) +
    P('M6 24 L 82 24 L 77 46 Q 44 54 11 46 Z', d.g('#93603a')) +
    L('M11 30 L 77 30 M13 43 Q 44 50 75 43', '#d8a070', 1.3, ' stroke-dasharray="3 3"') +
    L('M44 47 L 44 58', O, 6) + L('M44 47 L 44 58', '#5a3a1e', 3.5) + Rc(38, 52, 12, 11, d.g('#e8c062'), ' stroke="' + O + '" stroke-width="2.2" rx="2"') + Rc(41.5, 55.5, 5, 4, '#5a3a1e') +
    /* l'emblème de l'Alchimiste : un petit alambic doré */
    C(44, 35, 6.5, 'none', ' stroke="#e8c062" stroke-width="2"') + L('M44 28.5 L 44 24 M44 24 L 52 22', '#e8c062', 2) + L('M40 33 q 4 -3 8 0', '#e8c062', 1.2, op(0.7)) +
    L('M70 30 Q 74 38 72 46', '#ffffff', 2, op(0.3)); }); };
/* les herbes lumineuses (plante rare : pour l'Alchimiste) */
A.herbes = function(){ return art('he', 76, 78, function(d){
  var s = E(38, 72, 24, 6, '#1a2a14', ' stroke="' + O + '" stroke-width="2"') + E(38, 70, 18, 3, '#3a5a2a');
  var g = d.lin([[0, '#c8fff0'], [0.5, '#4ad0a0'], [1, '#1a6a4a']]);
  [[-40, 46, -1], [-22, 56, 1], [-6, 62, -1], [8, 60, 1], [24, 54, -1], [40, 44, 1], [-30, 34, 1], [32, 36, -1]].forEach(function(f){
    var a = f[0] * Math.PI / 180, l = f[1], x2 = 38 + Math.sin(a) * l, y2 = 70 - Math.cos(a) * l, cx = 38 + Math.sin(a) * l * 0.4 + f[2] * 6, cy = 70 - Math.cos(a) * l * 0.55;
    s += L('M38 70 Q ' + r1(cx) + ' ' + r1(cy) + ' ' + r1(x2) + ' ' + r1(y2), '#2a6a4a', 2.4);
    s += '<g transform="translate(' + r1(x2) + ' ' + r1(y2) + ') rotate(' + r1(f[0]) + ')">' + P('M0 6 C -7 0 -6 -12 0 -18 C 6 -12 7 0 0 6 Z', g, ' stroke-width="2"') + L('M0 4 L 0 -14', '#2a8a6a', 1.2) + '</g>';
    s += C(x2 + Math.sin(a) * 18, y2 - Math.cos(a) * 18, 5, d.halo('#ffffff', 0.9)) + C(x2 + Math.sin(a) * 18, y2 - Math.cos(a) * 18, 2, '#ffffff');
  });
  return s; }); };
/* les deux carquois de la réserve */
A.carquois = function(sorte){ if(sorte === 'normal') return A.carquoisNormal(); return art('cq', 56, 116, function(d){
  var arg = sorte === 'argent', s = '';
  var fut = arg ? '#d8c8a8' : '#5a3a22', tete = arg ? d.lin([[0, '#ffffff'], [0.5, '#c8d8f0'], [1, '#7a8aa8']], 1, 0, 0, 1) : d.lin([[0, '#6a6a78'], [0.5, '#2e2e38'], [1, '#121218']], 1, 0, 0, 1);
  var fl = arg ? [[13, 6, -10], [22, 2, -3], [32, 4, 6], [41, 8, 12]] : [[16, 6, -8], [28, 1, 0], [40, 6, 9]];
  fl.forEach(function(f){
    var x = f[0], y = f[1], a = f[2];
    s += '<g transform="rotate(' + a + ' ' + x + ' 60)">' + L('M' + x + ' 60 L ' + x + ' ' + (y + 14), O, arg ? 5 : 7) + L('M' + x + ' 60 L ' + x + ' ' + (y + 14), fut, arg ? 2.4 : 4) +
      (arg ? P('M' + x + ' ' + y + ' L ' + (x + 5) + ' ' + (y + 15) + ' L ' + x + ' ' + (y + 12) + ' L ' + (x - 5) + ' ' + (y + 15) + ' Z', tete, ' stroke-width="2"') + L('M' + (x - 1) + ' ' + (y + 4) + ' L ' + (x - 2.5) + ' ' + (y + 11), '#ffffff', 1.2)
        : P('M' + x + ' ' + (y - 2) + ' L ' + (x + 9) + ' ' + (y + 12) + ' L ' + (x + 4) + ' ' + (y + 18) + ' L ' + x + ' ' + (y + 14) + ' L ' + (x - 4) + ' ' + (y + 18) + ' L ' + (x - 9) + ' ' + (y + 12) + ' Z', tete, ' stroke-width="2.4"') + L('M' + (x - 3) + ' ' + (y + 6) + ' L ' + (x - 5) + ' ' + (y + 11), '#9a9aa8', 1.4)) + '</g>';
  });
  var cq = arg ? '#5a6c94' : '#4a2e1a', bande = arg ? d.g('#d8e4f8') : d.g('#3a3a44');
  s += P('M10 46 L 46 46 L 43 110 Q 28 115 13 110 Z', d.g(cq)) + F('M10 46 L 20 46 L 18 112 Q 15 111 13 110 Z', '#000', op(0.25)) +
    P('M8 42 L 48 42 L 47 52 L 9 52 Z', bande, ' stroke-width="2.4"') + P('M12 92 L 45 92 L 44 100 L 13 100 Z', bande, ' stroke-width="2.4"') +
    L('M15 56 L 14 88 M41 56 L 42 88', arg ? '#c8d8f0' : '#a0703a', 1.2, ' stroke-dasharray="3 3"');
  if(arg) s += L(croissant(28, 72, 8), '#e8f0ff', 2) + C(24, 66, 1.4, '#ffffff');
  else s += [[18, 60], [38, 60], [18, 84], [38, 84], [28, 72]].map(function(p){ return C(p[0], p[1], 2.6, '#6a6a78', ' stroke="' + O + '" stroke-width="1.4"'); }).join('');
  return s + L('M42 50 Q 46 76 41 104', '#ffffff', 2, op(arg ? 0.4 : 0.18)); }); };
/* le coffre de la réserve : le fond (avec l'intérieur), le couvercle fermé, le couvercle ouvert, le devant */
var COFFRE = {x: 590, y: SOL + 8 - 150, w: 180, h: 150};
A.coffreFond = function(){ return art('cf', 180, 150, function(d){
  return P('M14 82 L 166 82 L 158 66 L 22 66 Z', '#120a08') + F('M24 68 L 156 68 L 162 80 L 18 80 Z', d.lin([[0, '#000000'], [1, '#2a160c']])); }); };
A.coffreOuvert = function(){ return art('co', 180, 150, function(d){
  return P('M22 66 L 158 66 L 166 4 L 14 4 Z', d.lin([[0, '#4a2c16'], [1, '#2a180c']])) + P('M26 62 L 154 62 L 160 10 L 20 10 Z', d.lin([[0, '#6a4024'], [1, '#3a2212']])) +
    L('M36 62 L 32 10 M90 62 L 90 10 M144 62 L 148 10', '#2a1a0c', 2) + Rc(60, 30, 60, 20, d.g('#3a3a44'), ' stroke="' + O + '" stroke-width="2"'); }); };
A.coffreFerme = function(){ return art('cl', 180, 150, function(d){
  return P('M12 84 L 12 62 C 12 36 168 36 168 62 L 168 84 Z', d.g('#7a4a26')) + L('M18 56 C 30 42 150 42 162 56', '#a87040', 1.6, op(0.6)) +
    P('M38 84 L 38 46 L 50 43 L 50 84 Z', d.g('#4a4a58'), ' stroke-width="2.4"') + P('M130 84 L 130 43 L 142 46 L 142 84 Z', d.g('#4a4a58'), ' stroke-width="2.4"') +
    [[44, 52], [44, 74], [136, 52], [136, 74]].map(function(p){ return C(p[0], p[1], 2.4, '#8a8a9a', ' stroke="' + O + '" stroke-width="1.2"'); }).join(''); }); };
A.coffreDevant = function(){ return art('cd', 180, 72, function(d){
  return P('M10 0 L 170 0 L 166 64 L 14 64 Z', d.g('#8a5430')) + F('M10 0 L 30 0 L 30 64 L 14 64 Z', '#2a140a', op(0.4)) +
    L('M14 22 L 166 22 M14 44 L 166 44', '#4a2a14', 2) +
    P('M38 0 L 50 0 L 50 64 L 38 64 Z', d.g('#4a4a58'), ' stroke-width="2.4"') + P('M130 0 L 142 0 L 142 64 L 130 64 Z', d.g('#4a4a58'), ' stroke-width="2.4"') +
    P('M78 4 L 102 4 L 102 28 L 90 34 L 78 28 Z', d.g('#e8c062'), ' stroke-width="2.4"') + C(90, 16, 3.4, '#2a1a0c') + L('M90 18 L 90 25', '#2a1a0c', 2.4) +
    [[44, 10], [44, 54], [136, 10], [136, 54]].map(function(p){ return C(p[0], p[1], 2.4, '#8a8a9a', ' stroke="' + O + '" stroke-width="1.2"'); }).join('') +
    L('M160 6 L 157 58', '#ffffff', 2, op(0.18)); }); };
/* la fleur de givre (plante rare : pour l'Alchimiste) */
A.fleurGivre = function(){ return art('fg', 74, 104, function(d){
  var s = L('M37 102 C 34 86 40 70 37 46', O, 5) + L('M37 102 C 34 86 40 70 37 46', '#8ac8e8', 2.6);
  var gf = d.lin([[0, '#ffffff', 0.95], [0.6, '#a8e0ff', 0.9], [1, '#5aa0e0', 0.9]], 0, 0, 1, 1);
  s += P('M36 84 C 24 80 16 70 12 60 C 24 62 32 70 36 80 Z', gf, ' stroke-width="2"') + P('M38 72 C 50 68 58 58 62 48 C 50 50 42 58 38 68 Z', gf, ' stroke-width="2"');
  var g = d.lin([[0, '#ffffff'], [0.55, '#c8f0ff'], [1, '#6ab8f0']], 0, 0, 0, 1);
  for(var k = 0; k < 6; k++){ var a = k * 60; s += '<g transform="translate(37 34) rotate(' + a + ')">' + P('M0 0 L -7 -12 L 0 -26 L 7 -12 Z', g, ' stroke-width="2"') + L('M0 -4 L 0 -22', '#ffffff', 1.2, op(0.9)) + '</g>'; }
  for(var j = 0; j < 6; j++){ var b = j * 60 + 30; s += '<g transform="translate(37 34) rotate(' + b + ')">' + P('M0 -6 L -4 -12 L 0 -19 L 4 -12 Z', '#e8fbff', ' stroke-width="1.6"') + '</g>'; }
  s += C(37, 34, 7, d.rad([[0, '#ffffff'], [1, '#9ae8ff']]), ' stroke="' + O + '" stroke-width="2"') + C(35, 32, 2.4, '#ffffff');
  [[10, 18], [64, 24], [8, 44], [66, 66]].forEach(function(p){ s += L('M' + p[0] + ' ' + (p[1] - 4) + ' v 8 M' + (p[0] - 4) + ' ' + p[1] + ' h 8', '#e8fbff', 1.4); });
  return s; }); };
/* la page déchirée (pour le Sage : le coin du bassin, une note sur Bourbe) */
A.pageDechiree = function(){ return art('pd', 68, 76, function(d){
  var bord = 'M8 8 L 50 4 L 47 14 L 53 20 L 48 28 L 55 36 L 49 44 L 56 52 L 50 60 L 54 68 L 12 72 Z';
  return '<g transform="rotate(-7 34 38)">' + P(bord, d.lin([[0, '#f6ead0'], [1, '#d8c49a']], 1, 0, 0, 1), ' stroke-width="2.4"') +
    F('M8 8 L 20 7 L 22 72 L 12 72 Z', '#b89a6a', op(0.25)) +
    L('M14 16 L 40 14 M14 22 L 36 20 M14 28 L 42 26', '#6a4a2a', 1.4, op(0.8)) +
    E(30, 48, 14, 9, 'none', ' stroke="#2a6a8a" stroke-width="1.8"') + L('M20 47 q 3 -2 6 0 t 6 0 t 6 0', '#2a6a8a', 1.2) +
    E(25, 51, 3, 2, '#3a8a4a') + E(36, 45, 2.6, 1.8, '#3a8a4a') + C(30, 49, 1.6, '#8a3a2a') +
    L('M46 46 L 52 44 M46 50 L 51 50', '#8a3a2a', 1.2) + E(42, 64, 6, 3, '#a87a4a', op(0.3)) + '</g>'; }); };
/* une page blanche (pour le Sage : une sauvegarde de plus) */
A.pageBlanche = function(){ return art('pb', 62, 74, function(d){
  return '<g transform="rotate(5 31 37)">' + P('M10 6 L 52 6 L 52 60 Q 52 68 44 68 L 10 68 Z', d.lin([[0, '#ffffff'], [1, '#e8e0cc']], 1, 0, 0, 1), ' stroke-width="2.4"') +
    P('M52 58 Q 44 58 44 68 Q 52 68 52 58 Z', '#d8ccb0', ' stroke-width="2"') +
    L('M14 10 L 48 10', '#e8c062', 1.4, op(0.8)) + L('M14 64 L 42 64', '#e8c062', 1.4, op(0.8)) +
    L('M30 30 l 4 -6 l 4 6 M34 24 v 14', '#8ad8ff', 1.4, op(0.35)) + '</g>'; }); };
/* le cristal de lune et le bâton de chêne (le choix du Sage) */
A.cristalLune = function(){ return art('cl', 50, 88, function(d){
  var g = d.lin([[0, '#ffffff'], [0.4, '#d0d4ff'], [1, '#7a7ad8']], 1, 0, 0, 1);
  return P('M12 86 L 38 86 L 34 76 L 16 76 Z', d.g('#a8aec8'), ' stroke-width="2.4"') + L('M16 78 L 10 66 M34 78 L 40 66 M25 78 L 25 68', '#c8ccdc', 3) + L('M16 78 L 10 66 M34 78 L 40 66', O, 1, op(0.6)) +
    P('M25 4 L 38 20 L 36 64 L 25 72 L 14 64 L 12 20 Z', g, ' stroke-width="2.4"') + F('M25 4 L 38 20 L 36 64 L 25 72 Z', '#ffffff', op(0.2)) +
    L('M25 4 L 25 72 M12 20 L 25 28 L 38 20', '#ffffff', 1.2, op(0.5)) +
    F(croissant(24, 42, 8), '#ffffff', op(0.95)) + L('M17 16 L 16 50', '#ffffff', 1.6, op(0.7)); }); };
A.baton = function(){ return art('bc', 46, 178, function(d){
  var s = L('M24 176 C 22 140 27 100 23 60 C 21 40 25 26 24 16', O, 11) + L('M24 176 C 22 140 27 100 23 60 C 21 40 25 26 24 16', d.lin([[0, '#9a6a3e'], [0.5, '#7a4e2a'], [1, '#4a2e16']], 1, 0, 0, 0), 6.5);
  s += E(25, 120, 5, 3, '#4a2e16', ' stroke="' + O + '" stroke-width="1.5"') + E(23, 78, 4, 2.6, '#4a2e16', ' stroke="' + O + '" stroke-width="1.5"') + L('M26 150 l 3 -10 M22 100 l -2 -8', '#c8905a', 1.2, op(0.6));
  s += L('M24 18 C 14 12 10 4 14 0 M24 18 C 32 10 36 6 34 0 M24 18 C 22 10 24 4 26 0', O, 7) + L('M24 18 C 14 12 10 4 14 0 M24 18 C 32 10 36 6 34 0 M24 18 C 22 10 24 4 26 0', '#7a4e2a', 3.6);
  [[10, 14, -40], [38, 14, 40], [24, 8, 0]].forEach(function(f){ s += '<g transform="translate(' + f[0] + ' ' + f[1] + ') rotate(' + f[2] + ')">' + P('M0 0 C -6 -2 -8 -8 -4 -12 C -6 -16 -2 -20 0 -18 C 2 -20 6 -16 4 -12 C 8 -8 6 -2 0 0 Z', d.g('#5aa040'), ' stroke-width="1.8"') + L('M0 -1 L 0 -15', '#3a7a2a', 1) + '</g>'; });
  s += E(30, 22, 4, 5, d.g('#b8803a'), ' stroke="' + O + '" stroke-width="1.6"') + P('M26 19 Q 30 15 34 19 Z', '#6a4a2a', ' stroke-width="1.4"');
  return s; }); };
/* le tas d'os, un os qui vole, le rat caché dedans (sa tête, sa mâchoire) */
A.os = function(){ return art('os', 30, 30, function(d){ return '<g transform="rotate(-35 15 15)">' + L('M3 15 L 27 15', O, 6) + L('M3 15 L 27 15', '#e0d4b8', 3.4) +
  [[3, 12.5], [3, 17.5], [27, 12.5], [27, 17.5]].map(function(p){ return C(p[0], p[1], 3, '#e8dcc0', ' stroke="' + O + '" stroke-width="1.4"'); }).join('') + '</g>'; }); };
A.tasOs = function(){ return art('to', 180, 90, function(d){
  var s = E(90, 84, 84, 8, '#000', op(0.35)) + P('M8 86 C 20 60 50 44 90 40 C 130 44 162 60 172 86 Z', d.lin([[0, '#5a5a48'], [1, '#2a2a20']]));
  function os(x, y, a, l, c){ c = c || '#d8ccb0'; return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')">' + L('M' + (-l / 2) + ' 0 L ' + (l / 2) + ' 0', O, 7) + L('M' + (-l / 2) + ' 0 L ' + (l / 2) + ' 0', c, 4) +
    [[-l / 2, -2.4], [-l / 2, 2.4], [l / 2, -2.4], [l / 2, 2.4]].map(function(p){ return C(p[0], p[1], 3.6, clair(c, 0.1), ' stroke="' + O + '" stroke-width="1.5"'); }).join('') + '</g>'; }
  function crane(x, y, k, a){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + k + ')">' + P('M-16 4 C -18 -14 -2 -20 10 -14 C 20 -10 24 -2 22 6 L 14 8 L 12 14 L -6 14 L -8 8 Z', d.g('#e0d4b8')) +
    E(-4, -2, 4.4, 4, '#2a2420') + E(8, -2, 3.6, 3.6, '#2a2420') + L('M-2 14 L -2 10 M3 14 L 3 10 M8 14 L 8 10', O, 1.6) + '</g>'; }
  s += os(60, 64, -18, 56) + os(118, 66, 22, 60) + os(90, 52, 4, 48, '#c8bca0') + os(40, 76, 8, 40) + os(140, 78, -10, 40);
  [[72, 58], [80, 54], [88, 52], [96, 53]].forEach(function(r){ s += L('M' + r[0] + ' ' + r[1] + ' q -8 12 -2 24', O, 5) + L('M' + r[0] + ' ' + r[1] + ' q -8 12 -2 24', '#d8ccb0', 2.6); });
  s += crane(54, 50, 0.9, -12) + crane(124, 52, 0.8, 14) + crane(96, 72, 0.75, 0);
  s += os(106, 44, 60, 34) + L('M18 80 l 8 -4 M160 80 l -8 -3', '#d8ccb0', 3);
  return s; }); };
A.ratTete = function(){ return art('rt', 70, 50, function(d){
  return P('M68 40 C 66 18 52 8 36 10 C 22 12 10 20 4 28 C 12 32 22 34 32 34 C 40 40 56 46 68 40 Z', d.lin([[0, '#9c8a96'], [0.5, '#6e5c6a'], [1, '#3a2e3a']], 1, 0, 0, 1)) +
    E(46, 10, 9, 10, '#c98896', ' stroke="' + O + '" stroke-width="2.6"') + E(46, 11, 4, 6, '#9a5f6c') +
    C(26, 20, 5, '#ff2a3a', op(0.4)) + C(26, 20, 3.4, '#ff4a4a', ' stroke="' + O + '" stroke-width="1.6"') + C(25, 19, 1.2, '#ffffff') + L('M18 16 L 32 18', O, 2.2) +
    C(5, 28, 3.6, '#f07a8a', ' stroke="' + O + '" stroke-width="2"') + L('M10 24 l -10 -4 M10 27 l -11 1', '#d8d0d8', 1.2) + P('M12 32 l 3 7 l 3 -6 Z', '#fff6e0', ' stroke-width="1.4"'); }); };
A.ratMachoire = function(){ return art('rm', 40, 20, function(d){ return P('M36 4 C 26 4 14 4 4 2 C 6 10 16 14 30 12 Z', d.g('#6e5c6a'), ' stroke-width="2.4"') + P('M8 4 l 3 6 l 3 -5 Z', '#fff6e0', ' stroke-width="1.2"') + F('M10 5 C 18 8 26 8 32 7', '#c84a5a', op(0.7)); }); };
/* le crâne du passage secret : son contour lumineux (l'encre invisible), le passage derrière, les fissures */
var CRANE = {x: 806, y: 146, w: 92, h: 194, cx: 46, cy: 50};
A.craneContour = function(){ return art('cc', 92, 194, function(d){
  var cx = CRANE.cx, cy = CRANE.cy, tete = T('M-30 -6 C -30 -40 30 -40 30 -6 C 30 8 22 14 18 18 L 18 30 L -18 30 L -18 18 C -22 14 -30 8 -30 -6 Z', cx, cy),
    traits = T('M-16 -2 C -16 -10 -4 -10 -4 -2 C -4 4 -16 4 -16 -2 Z M4 -2 C 4 -10 16 -10 16 -2 C 16 4 4 4 4 -2 Z M-3 10 L 0 4 L 3 10 Z M-10 22 L -10 30 M-3 22 L -3 30 M4 22 L 4 30 M11 22 L 11 30', cx, cy);
  return E(cx, cy, 50, 52, d.halo('#7ff0ff', 0.35)) + L(tete, '#7ff0ff', 9, op(0.3)) + L(tete, '#bff8ff', 3) + L(traits, '#7ff0ff', 6, op(0.3)) + L(traits, '#dffcff', 2.2) +
    L('M2 4 L 2 190 L 90 190 L 90 4 Z', '#7ff0ff', 2, op(0.35)) +
    [[cx - 30, cy - 36], [cx + 32, cy - 24], [cx + 26, cy + 30]].map(function(p){ return L('M' + p[0] + ' ' + (p[1] - 5) + ' v 10 M' + (p[0] - 5) + ' ' + p[1] + ' h 10', '#ffffff', 1.4); }).join(''); }); };
A.cranePassage = function(){ return art('cp', 92, 194, function(d){
  return Rc(0, 0, 92, 194, '#05030a') + E(46, 176, 50, 40, d.halo('#ff9a40', 0.6)) + F('M14 194 L 26 40 L 66 40 L 78 194 Z', d.lin([[0, '#1a0e0a'], [1, '#5a2a14']])) +
    [0, 1, 2, 3].map(function(k){ return Rc(20 + k * 3, 150 + k * 12, 52 - k * 6, 8, '#2a160c', ' stroke="#05030a" stroke-width="1.5"'); }).join('') +
    E(46, 60, 16, 10, d.halo('#ffb050', 0.5)); }); };
A.craneFissures = function(){ return art('cf', 92, 194, function(d){
  return L('M2 2 L 2 192 L 90 192 L 90 2 Z', '#05030a', 4) + L('M2 40 l 8 4 l -3 8 M90 90 l -7 5 l 2 9 M30 2 l 4 10 l -4 6 M60 192 l -3 -10 l 5 -6', '#05030a', 2.4) +
    L('M4 4 L 4 190 M88 4 L 88 190', '#a0b8a0', 1, op(0.4)); }); };
A.craneDalle = function(){ return art('cd', 92, 194, function(d){ var s = Rc(0, 0, 92, 194, '#1e241f'); for(var y = 0; y < 194; y += 26) s += L('M0 ' + y + ' H 92', '#080c0a', 3) + L('M' + ((y / 26) % 2 ? 46 : 20) + ' ' + y + ' v 26', '#080c0a', 3); return s; }); };
/* une dalle piégée : le trou noir dessous, les pointes */
A.dalleTrou = function(pts, w, h){ return art('dt', w, h, function(d){ return F(poly(pts), d.lin([[0, '#000000'], [1, '#1a1420']])) + L('M' + r1(pts[0][0]) + ' ' + r1(pts[0][1]) + ' L ' + r1(pts[1][0]) + ' ' + r1(pts[1][1]), '#3a3048', 2); }); };
A.pointes = function(w){ return art('pt', w, 48, function(d){
  var s = '', n = 5, g = d.lin([[0, '#ffffff'], [0.4, '#b8c0d8'], [1, '#4a5068']], 1, 0, 0, 0);
  for(var k = 0; k < n; k++){ var x = w * (0.16 + 0.68 * k / (n - 1)), hh = 38 + (k % 2) * 8; s += P('M' + r1(x - 5) + ' 48 L ' + r1(x) + ' ' + (48 - hh) + ' L ' + r1(x + 5) + ' 48 Z', g, ' stroke-width="2"') + L('M' + r1(x - 1) + ' ' + (48 - hh + 6) + ' L ' + r1(x - 2.5) + ' 44', '#ffffff', 1, op(0.8)); }
  return s; }); };
/* une porte gravée : le battant (en arc), son signe lumineux, la lueur derrière */
function signePorte(id, cx, cy, k, c, w){
  if(id === 'oeil') return L(T('M-26 0 Q 0 -24 26 0 Q 0 24 -26 0 Z', cx, cy), c, w) + C(cx, cy, 9 * k, 'none', ' stroke="' + c + '" stroke-width="' + w + '"') + C(cx, cy, 3.5 * k, c) + L(T('M-30 -16 L -22 -10 M30 -16 L 22 -10 M0 -26 L 0 -18', cx, cy), c, w * 0.7);
  if(id === 'gueule') return L(T('M-26 -12 Q 0 30 26 -12 Q 0 0 -26 -12 Z', cx, cy), c, w) + L(T('M-18 -6 L -14 4 L -10 -3 M-4 -1 L 0 10 L 4 -1 M10 -3 L 14 4 L 18 -6 M-12 8 L -8 0 M8 0 L 12 8', cx, cy), c, w * 0.8) + L(T('M-24 -22 L -12 -16 M24 -22 L 12 -16', cx, cy), c, w);
  return L(croissant(cx - 4, cy, 22), c, w) + [[12, -16], [20, 4], [8, 18]].map(function(p){ return L(T('M0 -4 L 0 4 M-4 0 L 4 0', cx + p[0], cy + p[1]), c, w * 0.6); }).join('');
}
A.porteBattant = function(id){ return art('pb', PORTE.w, SOL - PORTE.haut + 4, function(d){
  var w = PORTE.w, h = SOL - PORTE.haut + 4, r = PORTE.rayon, yb = r, ch = 'M0 ' + h + ' V ' + yb + ' A ' + r + ' ' + r + ' 0 0 1 ' + w + ' ' + yb + ' V ' + h + ' Z';
  var s = F(ch, d.lin([[0, '#5a5068'], [0.5, '#433a52'], [1, '#2a2434']], 1, 0, 0, 1), ' stroke="' + O + '" stroke-width="3"');
  s += L('M8 ' + h + ' V ' + (yb + 4) + ' A ' + (r - 8) + ' ' + (r - 8) + ' 0 0 1 ' + (w - 8) + ' ' + (yb + 4) + ' V ' + h, '#2a2434', 2.4) + L('M10 ' + (h - 2) + ' V ' + (yb + 4) + ' A ' + (r - 10) + ' ' + (r - 10) + ' 0 0 1 ' + (w - 10) + ' ' + (yb + 2), '#7a7090', 1.2, op(0.5));
  s += [70, 150].map(function(y){ return L('M10 ' + y + ' H ' + (w - 10), '#2a2434', 2); }).join('');
  s += signePorte(id, w / 2, 100, 1, '#1a1424', 6) + signePorte(id, w / 2 + 1, 101, 1, '#6a6080', 1.6);
  s += C(w / 2, 172, 9, 'none', ' stroke="' + O + '" stroke-width="5"') + C(w / 2, 172, 9, 'none', ' stroke="#a0804a" stroke-width="2.6"');
  return s; }); };
A.porteSigne = function(id, c){ return art('ps', PORTE.w, 200, function(d){ return E(PORTE.w / 2, 100, 50, 46, d.halo(c, 0.55)) + signePorte(id, PORTE.w / 2, 100, 1, c, 7).replace(/stroke-width="7"/g, 'stroke-width="7" opacity=".35"') + signePorte(id, PORTE.w / 2, 100, 1, '#ffffff', 2.4); }); };
A.porteAudela = function(c){ return art('pa', PORTE.w, SOL - PORTE.haut + 4, function(d){ var w = PORTE.w, h = SOL - PORTE.haut + 4; return E(w / 2, h * 0.7, w * 0.5, h * 0.4, d.halo(c, 0.6)) + E(w / 2, h - 6, w * 0.45, 10, d.halo(c, 0.7)); }); };
/* le sarcophage de la fausse crypte : la cuve, le couvercle, la lumière dorée dedans ; l'amulette de vie */
var SARCO = {x: 566, y: SOL - 168, w: 300, h: 176};
A.sarcoCuve = function(){ return art('sc', 300, 176, function(d){
  var s = E(150, 170, 150, 8, '#000', op(0.45));
  s += P('M20 168 L 22 70 L 278 70 L 280 168 Z', d.lin([[0, '#6a6480'], [0.5, '#4a445c'], [1, '#2a2638']], 1, 0, 0, 0));
  s += P('M22 70 L 34 56 L 266 56 L 278 70 Z', '#1a1624') + F('M40 60 L 260 60 L 270 68 L 30 68 Z', '#05030a');
  s += Rc(52, 86, 196, 66, 'none', ' stroke="#2a2638" stroke-width="3" rx="6"') + Rc(56, 90, 188, 58, 'none', ' stroke="#8a84a0" stroke-width="1.2" opacity=".5" rx="5"');
  s += L(croissant(146, 119, 18), '#a8a0d8', 2.4) + [[110, 108], [186, 108], [110, 132], [186, 132]].map(function(p){ return L(T('M-5 6 L 0 -6 L 5 6 M-3 1 L 3 1', p[0], p[1]), '#a8a0d8', 1.6, op(0.7)); }).join('');
  s += P('M14 168 L 14 158 L 286 158 L 286 168 Z', d.lin([[0, '#5a5470'], [1, '#2a2638']]));
  s += L('M274 76 L 276 156', '#ffffff', 2, op(0.15));
  return s; }); };
A.sarcoCouvercle = function(){ return art('sv', 300, 76, function(d){
  return P('M16 70 L 24 52 C 60 40 240 40 276 52 L 284 70 Z', d.lin([[0, '#7a7490'], [0.5, '#5a546e'], [1, '#3a3450']])) + L('M30 52 C 70 44 230 44 270 52', '#a8a0c0', 1.6, op(0.6)) +
    /* un gisant sculpté (une silhouette paisible, les mains jointes) */
    P('M70 56 C 70 46 96 44 110 46 C 150 42 200 42 236 48 C 244 50 244 58 236 60 C 200 62 150 62 110 60 C 96 62 70 64 70 56 Z', d.lin([[0, '#8a84a0'], [1, '#4a4460']]), ' stroke-width="2.2"') +
    E(84, 53, 12, 8, d.g('#8a84a0'), ' stroke="' + O + '" stroke-width="2"') + L('M150 46 C 150 52 160 54 166 50', '#3a3450', 1.6) + L('M110 50 L 230 50', '#a8a0c0', 1, op(0.5)); }); };
A.sarcoLumiere = function(){ return art('sl', 300, 176, function(d){
  return F('M36 66 L 190 66 L 166 -6 L 60 -6 Z', d.lin([[0, '#ffd070', 0], [1, '#ffd070', 0.45]])) + E(112, 64, 84, 13, d.halo('#ffe8a0', 0.9)) + E(112, 48, 60, 40, d.halo('#ffd060', 0.5)); }); };
A.amulette = function(){ return art('am', 52, 66, function(d){
  return L('M12 4 Q 26 26 40 4', O, 4.4) + L('M12 4 Q 26 26 40 4', '#e8c062', 2.2) + C(26, 20, 3, '#e8c062', ' stroke="' + O + '" stroke-width="1.6"') +
    P('M10 34 C 2 30 2 22 8 24 C 12 26 14 30 16 32 Z', d.g('#ffe08a'), ' stroke-width="1.8"') + P('M42 34 C 50 30 50 22 44 24 C 40 26 38 30 36 32 Z', d.g('#ffe08a'), ' stroke-width="1.8"') +
    P('M26 62 C 10 50 8 38 14 32 C 18 28 24 28 26 34 C 28 28 34 28 38 32 C 44 38 42 50 26 62 Z', d.g('#e8b840'), ' stroke-width="2.4"') +
    P('M26 55 C 15 46 14 39 18 36 C 21 34 24 35 26 39 C 28 35 31 34 34 36 C 38 39 37 46 26 55 Z', d.lin([[0, '#ff8a9a'], [0.5, '#e02a4a'], [1, '#8a0a2a']], 1, 0, 0, 1), ' stroke-width="1.6"') +
    E(21, 40, 3, 2, '#ffffff', op(0.8)) + C(26, 30, 2, '#ffffff', op(0.7)); }); };
/* le feu de camp : les bûches, trois flammes et un cœur (chacun ondule à son rythme) */
A.buches = function(){ return art('bu', 124, 40, function(d){
  var b = function(x1, y1, x2, y2){ return L('M' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2, O, 13) + L('M' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2, d.lin([[0, '#7a4a28'], [1, '#3a2010']]), 9) + L('M' + x1 + ' ' + (y1 - 2.5) + ' L ' + x2 + ' ' + (y2 - 2.5), '#a06a3a', 1.6, op(0.6)); };
  return E(62, 32, 54, 8, '#ff7a20', op(0.4)) + b(14, 34, 104, 20) + b(20, 18, 110, 34) +
    E(14, 34, 5, 6, '#ffa040', ' stroke="' + O + '" stroke-width="2"') + E(110, 34, 5, 6, '#ff8a30', ' stroke="' + O + '" stroke-width="2"') +
    [[40, 30], [62, 27], [84, 30], [52, 24], [74, 24]].map(function(p){ return C(p[0], p[1], 3, '#ffd060', op(0.9)); }).join(''); }); };
A.flamme = function(w, h, c1, c2, c3, o){ return art('fl', w, h, function(d){
  var g = d.lin([[0, c3, 0.85], [0.35, c2], [1, c1]]);
  var f = 'M' + r1(w / 2) + ' ' + h + ' C ' + r1(w * 0.08) + ' ' + r1(h * 0.95) + ' 0 ' + r1(h * 0.62) + ' ' + r1(w * 0.18) + ' ' + r1(h * 0.46) + ' C ' + r1(w * 0.26) + ' ' + r1(h * 0.36) + ' ' + r1(w * 0.24) + ' ' + r1(h * 0.24) + ' ' + r1(w * 0.32) + ' ' + r1(h * 0.12) +
    ' C ' + r1(w * 0.36) + ' ' + r1(h * 0.28) + ' ' + r1(w * 0.42) + ' ' + r1(h * 0.32) + ' ' + r1(w * 0.46) + ' ' + r1(h * 0.24) + ' C ' + r1(w * 0.5) + ' ' + r1(h * 0.14) + ' ' + r1(w * 0.54) + ' ' + r1(h * 0.06) + ' ' + r1(w * 0.6) + ' 0' +
    ' C ' + r1(w * 0.62) + ' ' + r1(h * 0.16) + ' ' + r1(w * 0.72) + ' ' + r1(h * 0.24) + ' ' + r1(w * 0.7) + ' ' + r1(h * 0.4) + ' C ' + r1(w * 0.76) + ' ' + r1(h * 0.36) + ' ' + r1(w * 0.8) + ' ' + r1(h * 0.28) + ' ' + r1(w * 0.8) + ' ' + r1(h * 0.22) +
    ' C ' + r1(w * 0.96) + ' ' + r1(h * 0.42) + ' ' + w + ' ' + r1(h * 0.7) + ' ' + r1(w * 0.88) + ' ' + r1(h * 0.86) + ' C ' + r1(w * 0.8) + ' ' + r1(h * 0.96) + ' ' + r1(w * 0.66) + ' ' + h + ' ' + r1(w / 2) + ' ' + h + ' Z';
  return F(f, g, o ? ' stroke="#c83a10" stroke-width="2" stroke-opacity=".6"' : ''); }); };
/* le ruban d'Odette, noué au clou */
A.ruban = function(){ return art('ru', 60, 112, function(d){
  var g = d.lin([[0, '#ff6a6a'], [0.5, '#d03a3a'], [1, '#8a1a1a']], 1, 0, 0, 1);
  return P('M28 14 C 36 40 26 70 38 104 L 30 98 L 24 106 C 16 72 26 42 24 16 Z', g, ' stroke-width="2.4"') + P('M27 14 C 18 36 16 60 6 86 L 14 84 L 16 92 C 26 64 30 38 31 16 Z', g, ' stroke-width="2.4"') +
    P('M28 14 C 14 -2 2 4 6 16 C 10 26 22 22 28 16 Z', g, ' stroke-width="2.4"') + P('M30 14 C 44 -2 58 4 54 16 C 50 26 38 22 30 16 Z', g, ' stroke-width="2.4"') +
    E(29, 15, 6, 5, '#b02a2a', ' stroke="' + O + '" stroke-width="2.4"') + L('M12 10 Q 18 8 22 14 M48 10 Q 42 8 38 14', '#ffb0b0', 1.4, op(0.7)) +
    L('M30 28 C 30 52 28 74 32 96 M24 30 C 22 50 18 66 12 82', '#ffb0b0', 1.2, op(0.55)); }); };
/* des livres qui flottent */
A.livre = function(c, ouvert){ return art('li', 60, 30, function(d){
  if(ouvert) return E(30, 24, 28, 5, '#0a2a2a', op(0.5)) + P('M4 20 Q 16 12 30 18 Q 44 12 56 20 L 56 24 Q 44 18 30 24 Q 16 18 4 24 Z', d.g(c), ' stroke-width="2"') + P('M8 18 Q 18 10 30 16 L 30 20 Q 18 14 8 22 Z', '#efe4c8', ' stroke-width="1.6"') + P('M52 18 Q 42 10 30 16 L 30 20 Q 42 14 52 22 Z', '#f6ecd6', ' stroke-width="1.6"');
  return E(30, 24, 28, 5, '#0a2a2a', op(0.5)) + P('M6 14 L 50 10 L 56 18 L 12 22 Z', d.g(c), ' stroke-width="2"') + P('M12 22 L 56 18 L 56 22 L 12 26 Z', '#e8dcc0', ' stroke-width="1.6"') + L('M10 16 L 50 12', '#e8c062', 1.2); }); };
/* une feuille qui tombe (le puits d'aération) */
A.feuille = function(){ return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2 18 C 2 8 8 2 18 2 C 18 12 12 18 2 18 Z" fill="#7ab850" stroke="#24182e" stroke-width="1.4"/><path d="M3 17 L 15 5" stroke="#3a6a2a" stroke-width="1"/></svg>'; };

/* ---------- Moustache, le gros chat gris d'Odette (SIX doigts) : vu de dos, il gratte la porte ; il se retourne et miaule ---------- */
var CHAT = {x: 636, y: SOL - 112, w: 124, h: 120};
var GRIS = {f: '#8c8c9e', c: '#b4b4c4', s: '#4e4e60', r: '#6a6a7c'};
A.chatQueue = function(){ return art('cq', 124, 120, function(d){
  var q = 'M44 108 C 24 114 6 108 8 92 C 9 84 16 82 20 86';
  return L(q, O, 15) + L(q, d.lin([[0, GRIS.c], [1, GRIS.f]], 0, 0, 1, 0), 10) + L('M30 110 l 3 -8 M18 106 l 6 -6 M11 96 l 8 -2', GRIS.s, 2.4); }); };
A.chatCorps = function(){ return art('cb', 124, 120, function(d){
  var g = d.lin([[0, GRIS.c], [0.5, GRIS.f], [1, sombre(GRIS.f, 0.4)]], 1, 0, 0, 1);
  return E(64, 114, 48, 6, '#000', op(0.4)) +
    /* les pattes arrière, assises */
    P('M24 112 C 18 96 24 80 36 78 C 44 80 46 96 42 112 Z', g) + P('M98 112 C 104 96 98 80 86 78 C 78 80 76 96 80 112 Z', g) +
    E(30, 112, 9, 5, GRIS.c, ' stroke="' + O + '" stroke-width="2.4"') + E(92, 112, 9, 5, GRIS.c, ' stroke="' + O + '" stroke-width="2.4"') +
    /* le dos, rond comme une poire */
    P('M30 108 C 22 82 28 56 44 44 C 52 38 72 38 80 44 C 96 56 102 82 92 108 Z', g) +
    /* les rayures du chat tigré */
    [54, 68, 82, 96].map(function(y, i){ var l = 22 + i * 3; return L('M58 ' + y + ' Q ' + (58 - l * 0.5) + ' ' + (y - 1) + ' ' + (58 - l) + ' ' + (y + 9), GRIS.s, 3.2, op(0.75)) + L('M66 ' + y + ' Q ' + (66 + l * 0.5) + ' ' + (y - 1) + ' ' + (66 + l) + ' ' + (y + 9), GRIS.s, 3.2, op(0.75)); }).join('') +
    L('M62 44 L 62 106', GRIS.s, 4, op(0.5)) + L('M58 50 Q 46 62 40 84', clair(GRIS.c, 0.3), 2, op(0.35)) +
    /* la patte avant gauche, posée par terre (on la voit dépasser) */
    P('M36 92 C 30 100 30 108 34 112 L 46 112 C 46 104 44 98 40 92 Z', g, ' stroke-width="2.4"'); }); };
A.chatPatte = function(){ return art('cp', 124, 120, function(d){
  var g = d.lin([[0, GRIS.c], [1, GRIS.f]], 1, 0, 0, 1);
  /* la patte droite levée contre la porte : une grosse « mitaine » à SIX doigts */
  return P('M72 54 C 74 40 80 26 88 16 L 98 20 C 94 32 88 46 84 58 Z', g) + L('M80 44 L 92 26', GRIS.s, 2.4, op(0.6)) +
    P('M84 22 C 82 12 88 4 96 4 C 104 4 108 12 104 22 Z', g) +
    [[84.5, 9], [88, 4.5], [92.5, 2.2], [97.5, 2.2], [102, 4.5], [105.5, 9]].map(function(t){ return E(t[0], t[1], 3.2, 3.4, GRIS.c, ' stroke="' + O + '" stroke-width="2"'); }).join(''); }); };
A.chatTeteDos = function(){ return art('cd', 124, 120, function(d){
  var g = d.lin([[0, GRIS.c], [1, GRIS.f]], 1, 0, 0, 1);
  return P('M38 22 L 36 2 L 52 12 Z', g) + P('M78 12 L 92 0 L 90 22 Z', g) + L('M38 6 l 4 6 M88 4 l -3 6', '#e8e8f0', 1.2, op(0.7)) +
    '<ellipse cx="63" cy="28" rx="27" ry="23" fill="' + g + '" stroke="' + O + '" stroke-width="3"/>' +
    L('M50 12 Q 63 8 76 12 M44 22 Q 63 16 82 22 M48 36 Q 63 32 78 36', GRIS.s, 2.6, op(0.6)) +
    L('M36 32 l -10 2 M36 36 l -10 4 M90 32 l 10 2 M90 36 l 10 4', '#e8e8f0', 1.2, op(0.8)); }); };
function teteChatFace(d, bouche){
  var g = d.lin([[0, GRIS.c], [1, GRIS.f]], 1, 0, 0, 1), s = '';
  s += P('M34 20 L 30 -2 L 50 10 Z', g) + P('M72 10 L 90 -2 L 88 20 Z', g) + P('M35 16 L 33 3 L 46 11 Z', '#ff9db4', ' stroke-width="0"') + P('M75 11 L 87 3 L 85 16 Z', '#ff9db4', ' stroke-width="0"');
  s += '<ellipse cx="60" cy="28" rx="30" ry="25" fill="' + g + '" stroke="' + O + '" stroke-width="3"/>';
  s += L('M52 6 L 56 14 M60 4 L 60 13 M68 6 L 64 14', GRIS.s, 2.4, op(0.7)) + L('M32 30 L 40 30 M80 30 L 88 30', GRIS.s, 2.2, op(0.6));
  s += P('M44 40 C 48 30 72 30 76 40 C 74 50 46 50 44 40 Z', '#eeeef6', ' stroke-width="0"');
  if(bouche){
    s += L('M40 24 Q 46 19 52 24 M68 24 Q 74 19 80 24', O, 3);
    s += P('M52 40 C 52 52 68 52 68 40 C 64 44 56 44 52 40 Z', '#c8506a', ' stroke-width="2.4"') + P('M54 41 l 2 5 l 2 -4 Z M66 41 l -2 5 l -2 -4 Z', '#ffffff', ' stroke-width="1"');
  } else {
    [[46, 24], [74, 24]].forEach(function(e){ s += E(e[0], e[1], 7.5, 8.5, '#c8e050', ' stroke="' + O + '" stroke-width="2.4"') + E(e[0] + 0.5, e[1] + 0.5, 2.6, 6.5, '#151020') + C(e[0] - 2.5, e[1] - 3.5, 2.4, '#ffffff') + C(e[0] + 2.5, e[1] + 3, 1, '#ffffff', op(0.8)); });
    s += L('M54 44 Q 57 47 60 43 Q 63 47 66 44', O, 1.8);
  }
  s += P('M56 36 L 64 36 L 60 40 Z', '#ff8fa8', ' stroke-width="1.8"');
  s += L('M42 38 l -18 -4 M42 41 l -18 2 M42 44 l -16 7 M78 38 l 18 -4 M78 41 l 18 2 M78 44 l 16 7', '#ffffff', 1.2, op(0.85));
  return s;
}
A.chatTeteFace = function(){ return art('cf', 124, 120, function(d){ return '<g transform="translate(-2 4)">' + teteChatFace(d, false) + '</g>'; }); };
A.chatTeteMiaou = function(){ return art('cm', 124, 120, function(d){ return '<g transform="translate(-2 4)">' + teteChatFace(d, true) + '</g>'; }); };
A.chatOndes = function(){ return art('co', 40, 50, function(d){ return L('M30 10 Q 22 25 30 40', '#fff4c0', 3) + L('M20 4 Q 8 25 20 46', '#fff4c0', 3, op(0.75)) + L('M10 0 Q -4 25 10 50', '#fff4c0', 3, op(0.5)); }); };

/* ---------- Léo Mouture, l'apprenti du meunier : coincé contre le mur, sa lanterne, terrifié ; de la farine sur sa cape ---------- */
var LEO = {x: 768, y: SOL - 232, w: 160, h: 244};
var PEAU = ['#ffe7d2', '#efb88e', '#d9976d', '#ff877a'];
function teteLeo(d, peur){
  var s = '', pe = PEAU;
  /* la capuche baissée, derrière le cou */
  s += P('M70 70 C 82 82 104 82 116 66 C 120 78 112 92 92 94 C 80 94 72 86 70 70 Z', d.g('#5a4636'));
  /* le visage, de trois quarts (il regarde à gauche, vers les héros) */
  var gz = d.lin([[0, pe[0]], [0.6, pe[1]], [1, pe[2]]], 1, 0, 0, 0);
  s += P('M60 40 C 58 18 76 8 94 10 C 112 12 120 28 118 44 C 116 62 104 74 88 76 C 72 76 62 66 60 52 Z', gz);
  s += E(70, 56, 6, 3.4, pe[3], op(0.45)) + E(102, 58, 4, 2.6, pe[3], op(0.35));
  /* des taches de rousseur */
  [[66, 52], [70, 50], [74, 53], [100, 54], [104, 52]].forEach(function(t){ s += C(t[0], t[1], 1.1, '#b8704a', op(0.8)); });
  if(peur){
    s += L('M64 40 l 10 4 l -10 4 M90 40 l -10 4 l 10 4', O, 3) + L('M62 30 L 76 34 M92 34 L 104 28', O, 3);
    s += P('M74 62 Q 81 58 88 62 Q 81 66 74 62 Z', '#7a2a2a', ' stroke-width="2"') + L('M75 62 L 87 62', '#ffffff', 1.6);
  } else {
    /* de grands yeux affolés, les pupilles toutes petites */
    [[68, 42, 7.5, 9], [94, 42, 6, 8.5]].forEach(function(e){ s += E(e[0], e[1], e[2], e[3], '#ffffff', ' stroke="' + O + '" stroke-width="2.4"') + C(e[0] - 2.5, e[1] + 1, 2.2, '#3a2a1a') + C(e[0] - 3.2, e[1] + 0.2, 0.8, '#ffffff'); });
    s += L('M60 28 Q 66 24 76 30 M88 30 Q 96 22 104 26', O, 3);
    s += P('M74 64 Q 78 58 84 62 Q 86 68 80 69 Q 75 69 74 64 Z', '#7a2a2a', ' stroke-width="2"') + L('M76 62 L 84 62', '#ffffff', 1.4);
    s += P('M116 30 C 120 34 120 40 116 40 C 112 40 112 34 116 30 Z', '#bfe8ff', ' stroke-width="1.6"');
  }
  s += L('M58 46 C 56 50 58 54 61 54', pe[2], 2);
  /* les cheveux de paille, en bataille, poudrés de farine */
  s += P('M58 34 C 52 18 64 2 82 2 C 96 -2 114 4 120 18 C 124 28 122 38 118 42 C 116 32 110 26 104 24 C 100 30 92 30 88 24 C 84 30 76 32 70 28 C 66 34 62 36 58 34 Z', d.g('#e8b858'));
  s += L('M66 14 Q 76 6 88 8 M94 8 Q 106 10 112 20', '#fff0c0', 2, op(0.7)) + L('M58 34 l -6 4 M120 18 l 6 -4 M70 4 l -4 -4', '#c8902a', 2.4);
  [[74, 10], [96, 8], [108, 16], [64, 22], [86, 18]].forEach(function(t){ s += C(t[0], t[1], 2.2, '#ffffff', op(0.7)); });
  return s;
}
A.leoCorps = function(){ return art('lc', 160, 244, function(d){
  var cape = d.lin([[0, '#6a5444'], [0.5, '#4e3c30'], [1, '#2e221a']], 1, 0, 0, 1), s = '';
  /* la cape, derrière (elle touche le mur à droite) */
  s += P('M74 84 C 60 120 52 170 44 222 C 70 230 120 232 150 222 C 140 170 130 120 116 84 Z', cape);
  /* les jambes, un peu pliées (il a peur), les bottes */
  s += P('M70 160 L 90 160 L 86 196 L 70 214 L 58 208 L 72 192 Z', d.g('#6a4a32')) + P('M94 160 L 112 160 L 114 214 L 98 214 Z', d.g('#5a3e2a'));
  s += P('M52 206 L 74 210 L 74 232 L 44 232 Q 40 226 50 222 Z', d.g('#4a2e1a')) + P('M96 210 L 118 210 L 120 232 L 92 232 Z', d.g('#4a2e1a'));
  s += L('M44 232 L 74 232 M92 232 L 120 232', '#1a0e08', 3.4);
  /* la chemise, le gilet, la ceinture */
  s += P('M74 88 C 86 82 104 82 114 88 L 116 164 L 70 164 Z', d.g('#e8dcc0'));
  s += P('M74 90 L 84 92 L 86 164 L 70 164 Z', d.g('#7a5a3a')) + P('M114 90 L 104 92 L 102 164 L 116 164 Z', d.g('#7a5a3a'));
  s += L('M70 150 L 116 150', O, 8) + L('M70 150 L 116 150', '#4a2e1a', 5) + Rc(88, 145, 10, 10, '#d9b46a', ' stroke="' + O + '" stroke-width="1.6"');
  /* les pans de la cape devant, et la farine dessus */
  s += P('M74 84 C 66 120 62 170 58 214 L 72 212 C 74 170 78 120 82 88 Z', cape) + P('M116 84 C 126 120 132 170 136 216 L 120 214 C 118 170 114 120 110 88 Z', cape);
  [[66, 140, 7, 4], [62, 186, 9, 5], [128, 160, 8, 5], [124, 196, 6, 4], [100, 118, 6, 3], [82, 176, 5, 3], [108, 190, 7, 4]].forEach(function(f){ s += E(f[0], f[1], f[2], f[3], '#ffffff', op(0.55)) + C(f[0] + f[2] * 0.6, f[1] - f[3], 1.4, '#ffffff', op(0.6)); });
  s += E(92, 200, 10, 3, '#ffffff', op(0.35));
  return s; }); };
A.leoBras2 = function(){ return art('lb', 160, 244, function(d){
  /* l'autre bras : la main serre la cape contre sa poitrine (elle se lève devant son visage quand il se recroqueville) */
  return P('M108 92 C 118 100 120 116 112 126 L 98 120 C 102 112 100 104 96 98 Z', d.g('#5a4636')) + P('M112 124 C 104 130 94 128 88 120 L 96 112 C 100 116 104 118 108 116 Z', d.g('#5a4636')) +
    '<circle cx="88" cy="116" r="7.5" fill="' + d.g(PEAU[1]) + '" stroke="' + O + '" stroke-width="3"/>' + E(110, 106, 5, 3, '#ffffff', op(0.5)); }); };
A.leoTete = function(){ return art('lt', 160, 244, function(d){ return teteLeo(d, false); }); };
A.leoTetePeur = function(){ return art('lp', 160, 244, function(d){ return teteLeo(d, true); }); };
A.leoBras = function(){ return art('la', 160, 244, function(d){
  /* le bras qui tient la lanterne (vers les héros) : l'épaule à (78, 92) */
  var s = P('M84 90 C 70 96 62 110 58 124 L 70 128 C 74 116 80 106 88 100 Z', d.g('#5a4636')) + P('M58 122 C 50 128 42 130 34 128 L 34 116 C 42 118 50 116 58 112 Z', d.g('#5a4636'));
  s += '<circle cx="32" cy="122" r="8" fill="' + d.g(PEAU[1]) + '" stroke="' + O + '" stroke-width="3"/>';
  return s; }); };
/* la lanterne (elle pend de la main, à (32, 120) : elle reste droite quand il lève le bras) */
A.leoLanterne = function(){ return art('ll', 160, 244, function(d){
  var s = '';
  s += L('M24 122 Q 32 112 40 122', O, 4.4) + L('M24 122 Q 32 112 40 122', '#b8862e', 2.2);
  s += P('M20 132 L 44 132 L 40 124 L 24 124 Z', d.g('#c8962e')) + C(32, 122, 3, '#c8962e', ' stroke="' + O + '" stroke-width="1.6"');
  s += Rc(21, 132, 22, 28, d.rad([[0, '#fffbe0'], [0.5, '#ffd070', 0.9], [1, '#ff9a30', 0.7]]), ' stroke="' + O + '" stroke-width="2.4"');
  s += L('M28 133 V 159 M36 133 V 159', '#8a6420', 1.6);
  s += P('M18 160 L 46 160 L 44 168 L 20 168 Z', d.g('#c8962e'));
  return s; }); };
A.leoFlamme = function(){ return art('lf', 12, 18, function(d){ return F('M6 18 C 0 16 0 10 3 6 C 4 9 5 9 6 0 C 8 6 12 10 10 15 C 9 17 8 18 6 18 Z', d.lin([[0, '#fffbe0'], [1, '#ff9a30']])); }); };
A.panier = function(){ return art('pa', 70, 50, function(d){
  return E(35, 46, 32, 4, '#000', op(0.4)) + P('M10 24 C 10 40 18 46 35 46 C 52 46 60 40 60 24 Z', d.g('#b88a4a')) +
    L('M12 30 L 58 30 M14 37 L 56 37 M20 24 L 22 44 M30 24 L 30 46 M40 24 L 40 46 M50 24 L 48 44', '#7a5226', 1.4) +
    L('M14 24 C 14 2 56 2 56 24', O, 6) + L('M14 24 C 14 2 56 2 56 24', '#b88a4a', 3.4) +
    P('M16 24 C 18 14 34 12 42 18 C 46 22 44 26 40 26 L 18 26 Z', d.g('#d8a05a')) + L('M24 18 l 4 2 M32 16 l 4 2', '#8a5a2a', 1.4) +
    P('M38 26 L 58 22 L 56 28 L 40 30 Z', '#e8e0d0', ' stroke-width="2"') + L('M44 25 l 8 -1', '#c84a4a', 1.4); }); };

/* @@FONDS@@ */

/* ======================================================================
   L'EXPORT
   ====================================================================== */
var ORDRE = ['puits', 'galerie', 'aeration', 'reserve', 'givre', 'bibliotheque', 'eboulis', 'dalles', 'portes', 'crypte-sarco', 'camp', 'porte4', 'leo'];
var SALLES = {};
/* une zone de toucher d'au moins 44 × 44, centrée sur la boîte */
function zoneDe(x, y, w, h, m){ m = m || 6; var zw = Math.max(44, w + m * 2), zh = Math.max(44, h + m * 2); return {x: Math.round(x + w / 2 - zw / 2), y: Math.round(y + h / 2 - zh / 2), w: Math.round(zw), h: Math.round(zh)}; }
function objet(o){ o.type = o.type || 'objet'; o.zone = o.zone || zoneDe(o.x, o.y, o.w, o.h); return o; }
function poussiere(x, y, w, h, n, c, effet){ return {id: 'ambiance-' + (effet || 'poussiere') + '-' + x, type: 'particules', effet: effet || 'poussiere', zone: {x: x, y: y, w: w, h: h}, n: n, couleur: c, x: x, y: y, w: 0, h: 0, z: 9}; }
function halo(id, x, y, w, h, c, force, duree){ return {id: id, type: 'deco', anim: 'pulse', lueur: c, force: force, x: x, y: y, w: w, h: h, duree: duree || 3000, z: 1}; }

SALLES.puits = function(){ return {nom: 'Le fond du puits', type: 'depart', ambiance: 'la lune tout en haut, la corde, trois couloirs (ouest, nord, est)',
  sorties: {ouest: {x: 46, y: 250}, nord: {x: 600, y: 250}, est: {x: 858, y: 250}},
  elements: [
    {id: 'corde', type: 'deco', anim: 'balance', amplitude: 1.1, duree: 4600, svg: A.corde(SOL + 4), x: 598, y: -2, w: 24, h: SOL + 4, pivot: [12, 0], z: 3},
    /* la pierre de rune du Sage : posée là comme une pierre ordinaire, sans lueur ni étoiles (il faut chercher) */
    /* le carnet de l'aventurier (Romain, 11 novembre : « un livre à l'entrée du puits ») : posé par terre, bien visible */
    objet({id: 'carnet', nom: 'Un vieux carnet', svg: A.livre('#6b4a2a'), x: 468, y: SOL - 30, w: 60, h: 30, sol: true, lueur: '#ffe8a8', pour: 'sage', code: 'carnet'}),
    objet({id: 'rune', nom: 'Une pierre gravée', svg: A.pierreRune(), x: 846, y: SOL - 31, w: 60, h: 40, sol: true, brille: false, discret: true, lueur: '#9ff6ff', pour: 'sage', code: 'rune'}),
    poussiere(530, 40, 170, 250, 8, '#eef4ff'),
    poussiere(700, 30, 220, 300, 3, '#bfe0ff', 'gouttes')
  ]}; };
SALLES.galerie = function(){ return {nom: 'La galerie effondrée', type: 'cul-de-sac', ambiance: 'des poutres cassées, un éboulis ; des lichens ambrés',
  elements: [
    objet({id: 'bourse', nom: 'Une bourse de pièces', svg: A.bourse(), x: 636, y: SOL - 44, w: 72, h: 58, sol: true, lueur: '#ffd36a', pour: null, effet: 'or'}),
    poussiere(640, 40, 170, 280, 7, '#eef4ff')
  ]}; };
SALLES.aeration = function(){ return {nom: 'Le puits d\'aération', type: 'cul-de-sac', ambiance: 'un rai de lumière verte et dorée, des plantes qui poussent',
  elements: [
    objet({id: 'herbes', nom: 'Des herbes lumineuses', svg: A.herbes(), x: 670, y: SOL - 118, w: 76, h: 78, lueur: '#7affc0', pour: 'alchimiste', code: 'herbes-lumineuses', flotte: false}),
    objet({id: 'sacoche', nom: 'La sacoche', svg: A.sacoche(), x: 812, y: SOL - 132, w: 88, h: 72, sol: true, lueur: '#ffd36a', pour: 'alchimiste'}),
    {id: 'ambiance-feuilles', type: 'particules', effet: 'feuilles', svg: A.feuille(), zone: {x: 640, y: 40, w: 140, h: 270}, n: 4, x: 640, y: 40, w: 0, h: 0, z: 9},
    poussiere(620, 50, 190, 260, 6, '#fbffd0'),
    poussiere(898, 20, 10, 300, 2, '#dff8ff', 'gouttes')
  ]}; };
SALLES.reserve = function(){
  var C0 = COFFRE, qy = C0.y - 14;
  var opt = [
    objet({id: 'fleches-argent', nom: 'Les flèches de lune', svg: A.carquois('argent'), x: C0.x + 30, y: qy, w: 56, h: 116, lueur: '#cfe4ff', pour: 'pisteur', zone: {x: C0.x + 24, y: qy - 4, w: 68, h: 104}}),
    objet({id: 'fleches-lourdes', nom: 'Les flèches transperçantes', svg: A.carquois('lourd'), x: C0.x + 98, y: qy, w: 56, h: 116, lueur: '#ff9a50', pour: 'pisteur', zone: {x: C0.x + 92, y: qy - 4, w: 68, h: 104}})
  ];
  return {nom: 'La réserve', type: 'objets-choix', ambiance: 'des étagères, des tonneaux ; des bocaux de lucioles',
  elements: [
    halo('lueur-bocal', 650, 22, 100, 96, '#d8ff70', 0.35, 2600), halo('lueur-bocal2', 792, 70, 100, 96, '#d8ff70', 0.3, 3100),
    {id: 'coffre', type: 'choix', nom: 'Le coffre', ferme: true, x: C0.x, y: C0.y, w: C0.w, h: C0.h, lueur: '#ffd36a', z: 4,
      pieces: [{id: 'fond', svg: A.coffreFond(), x: 0, y: 0, w: 180, h: 150}, {id: 'lueur', lueur: '#ffd36a', force: 0.6, x: 10, y: -10, w: 160, h: 110, cache: true},
        {id: 'ouvert', svg: A.coffreOuvert(), x: 0, y: 0, w: 180, h: 150, ox: 90, oy: 66, cache: true}, {id: 'ferme', svg: A.coffreFerme(), x: 0, y: 0, w: 180, h: 150}],
      devant: {x: C0.x, y: C0.y + 82, w: 180, h: 72, svg: A.coffreDevant()},
      zone: {x: C0.x + 6, y: C0.y + 30, w: 168, h: 122}, options: opt},
    poussiere(520, 60, 380, 180, 7, '#e8ff80', 'lucioles')
  ]}; };
SALLES.givre = function(){ return {nom: 'La grotte de la fleur de givre', type: 'objets', ambiance: 'glace, stalactites, froid bleu',
  elements: [
    halo('lueur-cristaux', 742, SOL - 96, 140, 110, '#8ae0ff', 0.35, 3200), halo('lueur-cristaux2', 540, SOL - 80, 120, 90, '#8ae0ff', 0.3, 2700),
    objet({id: 'fleur-givre', nom: 'La fleur de givre', svg: A.fleurGivre(), x: 667, y: SOL - 136, w: 74, h: 104, lueur: '#bff4ff', pour: 'alchimiste', code: 'fleur-de-givre', zone: {x: 660, y: SOL - 140, w: 88, h: 108}}),
    poussiere(480, 20, 480, 320, 9, '#ffffff', 'flocons')
  ]}; };
SALLES.bibliotheque = function(){
  var opt = [
    objet({id: 'cristal-lune', nom: 'Le cristal de lune', svg: A.cristalLune(), x: 792, y: SOL - 168, w: 50, h: 88, lueur: '#c8c8ff', pour: 'sage', zone: {x: 784, y: SOL - 172, w: 66, h: 96}}),
    objet({id: 'baton-chene', nom: 'Le bâton de chêne', svg: A.baton(), x: 862, y: SOL - 176, w: 46, h: 178, lueur: '#b8f070', pour: 'sage', zone: {x: 852, y: SOL - 176, w: 64, h: 180}})
  ];
  return {nom: 'La bibliothèque engloutie', type: 'objets-choix', ambiance: 'des rayonnages à moitié dans l\'eau qui luit, des livres qui flottent',
  elements: [
    {id: 'livre-1', type: 'deco', anim: 'flotte', amplitude: 3, duree: 3600, svg: A.livre('#7a2a2a', true), x: 556, y: 262, w: 60, h: 30, z: 2},
    {id: 'livre-2', type: 'deco', anim: 'flotte', amplitude: 2.5, duree: 4200, svg: A.livre('#2a4a7a'), x: 740, y: 290, w: 60, h: 30, z: 2},
    {id: 'livre-3', type: 'deco', anim: 'flotte', amplitude: 3, duree: 3900, svg: A.livre('#3a6a3a', true), x: 900, y: 270, w: 60, h: 30, z: 2},
    objet({id: 'page-dechiree', nom: 'La page déchirée', svg: A.pageDechiree(), x: 530, y: SOL - 82, w: 68, h: 76, lueur: '#ffe8a8', pour: 'sage', code: 'page-dechiree', flotte: 3}),
    objet({id: 'page-blanche', nom: 'Une page blanche', svg: A.pageBlanche(), x: 640, y: SOL - 104, w: 62, h: 74, lueur: '#fff6d8', pour: 'sage', code: 'page-blanche'}),
    {id: 'lutrin', type: 'choix', nom: 'Le lutrin', x: 780, y: SOL - 180, w: 140, h: 184, z: 4, pieces: [], options: opt},
    poussiere(480, 246, 460, 70, 6, '#8affe0', 'lucioles')
  ]}; };
SALLES.eboulis = function(){ return {nom: 'Le cul-de-sac éboulé', type: 'curiosite', ambiance: 'un tas d\'os, un éboulement ; un crâne gravé dans la paroi (le passage secret)',
  elements: [
    {id: 'tas-os', type: 'tas', nom: 'Le tas d\'os', svg: A.tasOs(), os: A.os(), x: 540, y: SOL - 74, w: 180, h: 90, lueur: '#e8f0c8', z: 5,
      pieces: [{id: 'rat', svg: A.ratTete(), x: 30, y: 2, w: 70, h: 50, cache: true}, {id: 'machoire', dans: 'rat', svg: A.ratMachoire(), x: 4, y: 28, w: 40, h: 20, ox: 36, oy: 4}],
      zone: {x: 548, y: SOL - 62, w: 164, h: 78},
      trouvaille: objet({id: 'page-blanche-os', nom: 'Une page blanche', svg: A.pageBlanche(), x: 600, y: SOL - 136, w: 62, h: 74, lueur: '#fff6d8', pour: 'sage', code: 'page-blanche'})},
    {id: 'crane', type: 'crane', nom: 'Le crâne gravé', x: CRANE.x, y: CRANE.y, w: CRANE.w, h: CRANE.h, decoupe: true, centre: [CRANE.cx, CRANE.cy], rayon: 40, lueur: '#9ff6ff', z: 3, vers: 'camp',
      secours: A.craneDalle(),
      pieces: [{id: 'passage', svg: A.cranePassage(), x: 0, y: 0, w: CRANE.w, h: CRANE.h}, {id: 'dalle', x: 0, y: 0, w: CRANE.w, h: CRANE.h},
        {id: 'fissures', dans: 'dalle', svg: A.craneFissures(), x: 0, y: 0, w: CRANE.w, h: CRANE.h, cache: true},
        {id: 'lueur', dans: 'dalle', lueur: '#7ff0ff', force: 0.45, x: -6, y: -4, w: 104, h: 108, cache: true},
        {id: 'contour', dans: 'dalle', svg: A.craneContour(), x: 0, y: 0, w: CRANE.w, h: CRANE.h, cache: true}],
      zone: {x: CRANE.x - 4, y: CRANE.y + 2, w: 100, h: 104}},
    poussiere(520, 120, 420, 220, 8, '#b8ff90', 'spores')
  ]}; };
SALLES.dalles = function(){
  var el = [];
  for(var r = 0; r < 2; r++) for(var c = 6; c < 12; c++){
    var co = dalleCoins(c, r), x0 = Math.floor(Math.min(co[0][0], co[3][0])), x1 = Math.ceil(Math.max(co[1][0], co[2][0])), y0 = Math.floor(co[0][1]), y1 = Math.ceil(co[2][1]);
    var w = x1 - x0, h = y1 - y0, loc = co.map(function(q){ return [q[0] - x0, q[1] - y0]; }), cl = dalleClaire(c, r), cy = (loc[0][1] + loc[2][1]) / 2;
    var pc = [{id: 'trou', svg: A.dalleTrou(loc, w, h), x: 0, y: 0, w: w, h: h}];
    pc.push({id: 'pointes', svg: A.pointes(Math.round(w * 0.7)), x: Math.round(w * 0.15), y: Math.round(cy - 44), w: Math.round(w * 0.7), h: 48, ox: Math.round(w * 0.35), oy: 48, cache: true});
    el.push({id: 'dalle-' + c + '-' + r, type: 'dalle', nom: cl ? 'Une dalle claire' : 'Une dalle sombre', clair: cl, piege: !cl, colonne: c - 6, rangee: r === 0 ? 'fond' : 'devant',
      coins: co, x: x0, y: y0, w: w, h: h, decoupe: true, pieces: pc, zone: {x: x0 + 2, y: y0, w: w - 4, h: Math.max(44, h)}, z: 2 + r});
  }
  el.push(poussiere(820, 120, 140, 140, 5, '#cfe0ff'));
  return {nom: 'Le couloir aux dalles', type: 'piege', ambiance: 'un damier : à chaque pas une dalle claire et une sombre, une seule est sûre (le code du plan du Sage : N B B, N B N)', elements: el}; };
SALLES.portes = function(){
  var noms = {oeil: 'La porte de l\'œil', gueule: 'La porte de la gueule', lune: 'La porte de la lune'}, vers = {oeil: 'ossuaire', gueule: 'fausse-crypte', lune: 'cave-aux-toiles'};
  var el = PORTES.map(function(p){ var h = SOL - PORTE.haut + 4;
    return {id: 'porte-' + p.id, type: 'porte', nom: noms[p.id], symbole: p.id, couleur: p.c, vers: vers[p.id], x: p.x - PORTE.w / 2, y: PORTE.haut, w: PORTE.w, h: h, z: 3,
      pieces: [{id: 'audela', svg: A.porteAudela(p.c), x: 0, y: 0, w: PORTE.w, h: h, cache: true}, {id: 'battant', svg: A.porteBattant(p.id), x: 0, y: 0, w: PORTE.w, h: h},
        {id: 'signe', dans: 'battant', svg: A.porteSigne(p.id, p.c), x: 0, y: 0, w: PORTE.w, h: 200}],
      zone: {x: p.x - PORTE.w / 2, y: PORTE.haut + 10, w: PORTE.w, h: SOL - PORTE.haut - 10}}; });
  el.push(halo('lueur-lustre', 632, 14, 180, 110, '#c8a8ff', 0.4, 3400));
  el.push(poussiere(600, 40, 240, 200, 5, '#e0d8ff'));
  return {nom: 'La salle aux trois portes', type: 'enigme', ambiance: 'un œil, une gueule, une lune', elements: el}; };
SALLES['crypte-sarco'] = function(){ var S = SARCO; return {nom: 'La fausse crypte (le sarcophage)', type: 'objet-pose', ambiance: 'le sarcophage, à poser sur le décor de combat de la fausse crypte',
  elements: [
    {id: 'sarcophage', type: 'sarcophage', nom: 'Le sarcophage', x: S.x, y: S.y, w: S.w, h: S.h, glisse: 84, z: 4,
      pieces: [{id: 'cuve', svg: A.sarcoCuve(), x: 0, y: 0, w: S.w, h: S.h}, {id: 'interieur', svg: A.sarcoLumiere(), x: 0, y: -10, w: S.w, h: S.h, cache: true},
        {id: 'couvercle', svg: A.sarcoCouvercle(), x: 0, y: 6, w: S.w, h: 76, ox: 150, oy: 64}],
      amulette: objet({id: 'amulette', nom: 'L\'amulette de vie', svg: A.amulette(), x: S.x + 86, y: S.y - 10, w: 52, h: 66, lueur: '#ffd06a', pour: 'tous'}),
      zone: {x: S.x + 10, y: S.y + 40, w: S.w - 20, h: S.h - 34}},
    poussiere(540, 100, 380, 220, 6, '#c8b0ff', 'spores')
  ]}; };
SALLES.camp = function(){ var x = FEU.x - 62; return {nom: 'Le feu de camp', type: 'repos', ambiance: 'un coin abrité sous un rocher, un feu qui crépite ; on se repose',
  elements: [
    {id: 'feu', type: 'feu', nom: 'Le feu', x: x, y: SOL - 128, w: 124, h: 146, z: 3,
      pieces: [{id: 'lueur', lueur: '#ffa040', force: 0.5, x: -118, y: -40, w: 360, h: 240},
        {id: 'flamme1', svg: A.flamme(90, 112, '#d8300c', '#ff7a20', '#ffb040'), x: 17, y: 4, w: 90, h: 112, ox: 45, oy: 112},
        {id: 'flamme2', svg: A.flamme(66, 88, '#ff6a1a', '#ffa830', '#ffe070'), x: 29, y: 30, w: 66, h: 88, ox: 33, oy: 88},
        {id: 'flamme3', svg: A.flamme(44, 62, '#ffa830', '#ffe070', '#fffbe0'), x: 40, y: 56, w: 44, h: 62, ox: 22, oy: 62},
        {id: 'coeur', svg: A.flamme(24, 36, '#ffe070', '#fff6c0', '#ffffff'), x: 50, y: 82, w: 24, h: 36, ox: 12, oy: 36},
        {id: 'buches', svg: A.buches(), x: 0, y: 106, w: 124, h: 40}],
      zone: {x: x + 4, y: SOL - 120, w: 116, h: 136}}
  ]}; };
SALLES.porte4 = function(){ var C0 = CHAT; return {nom: 'La porte aux quatre signes', type: 'scene', ambiance: 'la grande porte scellée des Fondateurs ; Moustache gratte ; le ruban d\'Odette ; une lumière chaude sous la porte',
  elements: [
    halo('lueur-sceau', 612, 60, 200, 200, '#7ff0ff', 0.3, 3200),
    halo('lueur-dessous', 600, SOL - 16, 224, 30, '#ffc070', 0.55, 1700),
    {id: 'ruban', type: 'deco', nom: 'Le ruban d\'Odette', anim: 'balance', amplitude: 4, duree: 3800, svg: A.ruban(), x: 493, y: 178, w: 60, h: 112, pivot: [29, 14], z: 3},
    {id: 'moustache', type: 'chat', nom: 'Moustache', x: C0.x, y: C0.y, w: C0.w, h: C0.h, griffe: [0.78, 0.06], z: 5,
      pieces: [{id: 'queue', svg: A.chatQueue(), x: 0, y: 0, w: 124, h: 120, ox: 44, oy: 108}, {id: 'corps', svg: A.chatCorps(), x: 0, y: 0, w: 124, h: 120, ox: 62, oy: 114},
        {id: 'patte', svg: A.chatPatte(), x: 0, y: 0, w: 124, h: 120, ox: 78, oy: 56}, {id: 'tete-dos', svg: A.chatTeteDos(), x: 0, y: 0, w: 124, h: 120, ox: 62, oy: 48},
        {id: 'tete-face', svg: A.chatTeteFace(), x: 0, y: 0, w: 124, h: 120, ox: 60, oy: 50, cache: true}, {id: 'tete-miaou', svg: A.chatTeteMiaou(), x: 0, y: 0, w: 124, h: 120, ox: 60, oy: 50, cache: true},
        {id: 'ondes', svg: A.chatOndes(), x: -14, y: -6, w: 40, h: 50, ox: 40, oy: 25, cache: true}],
      zone: {x: C0.x + 14, y: C0.y, w: 106, h: 120}},
    poussiere(560, 40, 300, 260, 5, '#cfe0ff')
  ]}; };
SALLES.leo = function(){ var L0 = LEO; return {nom: 'La dernière salle', type: 'fin', ambiance: 'un cul-de-sac bas ; Léo, coincé, avec sa lanterne',
  elements: [
    {id: 'leo', type: 'leo', nom: 'Léo', x: L0.x, y: L0.y, w: L0.w, h: L0.h, z: 5,
      pieces: [{id: 'halo', lueur: '#ffb050', force: 0.5, x: -68, y: 46, w: 200, h: 200},
        {id: 'leo', x: 0, y: 0, w: 160, h: 244, ox: 90, oy: 234}, {id: 'tremble', dans: 'leo', x: 0, y: 0, w: 160, h: 244, ox: 90, oy: 234},
        {id: 'corps', dans: 'tremble', svg: A.leoCorps(), x: 0, y: 0, w: 160, h: 244}, {id: 'bras2', dans: 'tremble', svg: A.leoBras2(), x: 0, y: 0, w: 160, h: 244, ox: 104, oy: 94},
        {id: 'tete', dans: 'tremble', svg: A.leoTete(), x: 0, y: 0, w: 160, h: 244, ox: 88, oy: 76}, {id: 'tete-peur', dans: 'tete', svg: A.leoTetePeur(), x: 0, y: 0, w: 160, h: 244, cache: true},
        {id: 'bras', dans: 'tremble', svg: A.leoBras(), x: 0, y: 0, w: 160, h: 244, ox: 80, oy: 94}, {id: 'lanterne', dans: 'bras', svg: A.leoLanterne(), x: 0, y: 0, w: 160, h: 244, ox: 32, oy: 120},
        {id: 'flamme', dans: 'lanterne', svg: A.leoFlamme(), x: 26, y: 138, w: 12, h: 18, ox: 6, oy: 18},
        {id: 'panier', svg: A.panier(), x: -8, y: 196, w: 70, h: 50}],
      zone: {x: L0.x + 4, y: L0.y + 8, w: 150, h: 232}},
    poussiere(700, 120, 220, 200, 5, '#ffd8a0')
  ]}; };

/* Les objets qu'un héros porte (2 places par héros) : leur dessin, pour les reposer au sol de n'importe quelle salle
   (Romain, 10 novembre : on repose un objet pour en prendre un autre). */
var PORTABLES = {
  'fleches-normales': function(){ return {nom: 'Les flèches normales', svg: A.carquois('normal'), w: 56, h: 116, lueur: '#ffe08a', pour: 'pisteur'}; },
  'fleches-argent': function(){ return {nom: 'Les flèches de lune', svg: A.carquois('argent'), w: 56, h: 116, lueur: '#cfe4ff', pour: 'pisteur'}; },
  'fleches-lourdes': function(){ return {nom: 'Les flèches transperçantes', svg: A.carquois('lourd'), w: 56, h: 116, lueur: '#ff9a50', pour: 'pisteur'}; },
  'cristal-lune': function(){ return {nom: 'Le cristal de lune', svg: A.cristalLune(), w: 50, h: 88, lueur: '#c8c8ff', pour: 'sage'}; },
  'baton-chene': function(){ return {nom: 'Le bâton de chêne', svg: A.baton(), w: 46, h: 178, lueur: '#b8f070', pour: 'sage'}; },
  'sacoche': function(){ return {nom: 'La sacoche', svg: A.sacoche(), w: 88, h: 72, lueur: '#ffd36a', pour: 'alchimiste'}; },
  'amulette': function(){ return {nom: 'L\'amulette de vie', svg: A.amulette(), w: 52, h: 66, lueur: '#ffd06a', pour: 'tous'}; }
};
var SCENES = {
  /* le dessin d'un objet porté (pour une case d'équipement), ou sa fiche posée au sol en x (le bas de l'objet sur le sol) */
  portable: function(id, x){
    var f = PORTABLES[id]; if(!f) return null;
    var d = f(); d.id = id; d.type = 'objet'; d.sol = true;
    if(x == null) return d;
    d.x = Math.round(x - d.w / 2); d.y = SOL - d.h + 2; d.z = 6; d.zone = zoneDe(d.x, d.y, d.w, d.h);
    return d;
  },
  W: W, H: H, SOL: SOL, HEROS: {x0: 0, x1: 476}, base: '',
  ordre: ORDRE.slice(),
  fond: function(id){ return FONDS[id] ? FONDS[id]() : ''; },
  salle: function(id){
    var f = SALLES[id]; if(!f) return null;
    var s = f();
    s.id = id; s.png = SCENES.base + 'png/' + id + '.png';
    (s.elements || []).forEach(function(e){ if(e.decoupe) e.fond = s.png; });
    return s;
  },
  /* les canaux, une fois les monstres partis : la roue du mur et la grille de l'arche de droite, posées sur le décor de
     combat (decors/png/canaux.png). ouvert : la grille est déjà levée. */
  surCanaux: function(ouvert){
    return [
      {id: 'grille', type: 'grille', nom: 'La grille', x: GRILLE.x, y: GRILLE.y, w: GRILLE.w, h: GRILLE.h, z: 2, ouvert: !!ouvert,
        arche: 'M0 ' + GRILLE.h + ' V 78 A 76 78 0 0 1 ' + GRILLE.w + ' 78 V ' + GRILLE.h + ' Z',
        pieces: [{id: 'passage', svg: A.passageCanaux(), x: 0, y: 0, w: GRILLE.w, h: GRILLE.h, cache: true}, {id: 'barres', svg: A.grilleCanaux(), x: 0, y: 0, w: GRILLE.w, h: GRILLE.h + 8}],
        zone: {x: GRILLE.x + 8, y: GRILLE.y + 70, w: GRILLE.w - 16, h: GRILLE.h - 76}},
      {id: 'roue', type: 'roue', nom: 'La vieille roue', x: ROUE.x, y: ROUE.y, w: ROUE.w, h: ROUE.h, z: 3,
        pieces: [{id: 'roue', svg: A.roueCanaux(), x: 0, y: 0, w: ROUE.w, h: ROUE.h}],
        zone: {x: ROUE.x - 6, y: ROUE.y - 6, w: ROUE.w + 12, h: ROUE.h + 12}}
    ];
  },
  /* ce qu'il faut poser par-dessus un décor de combat (la grille des canaux, tant qu'elle est fermée) : [{svg, x, y, w, h}] */
  surDecor: function(salle, o){
    if(salle === 'canaux' && !(o && o.ouvert)) return [{svg: A.grilleCanaux(), x: GRILLE.x, y: GRILLE.y, w: GRILLE.w, h: GRILLE.h + 8, arche: 'M0 ' + GRILLE.h + ' V 78 A 76 78 0 0 1 ' + GRILLE.w + ' 78 V ' + GRILLE.h + ' Z', boite: {w: GRILLE.w, h: GRILLE.h}}];
    return [];
  },
  /* le sarcophage posé pile sur celui du décor de combat de la fausse crypte (decors/png/crypte.png, au centre) : même dessin, à l'échelle 0,61 */
  sarcophageSurCrypte: function(){
    var e = SALLES['crypte-sarco']().elements[0], k = 0.61, x = 388, y = 222;
    e.x = x; e.y = y; e.echelle = k;
    e.zone = {x: x + 10, y: y + 40, w: SARCO.w - 20, h: SARCO.h - 34};     /* (dans le dessin non réduit : elle est réduite avec lui) */
    e.amulette.x = 430; e.amulette.y = 196; e.amulette.zone = zoneDe(430, 196, 52, 66);
    return e;
  },
  outils: {mix: mix, clair: clair, sombre: sombre, Defs: Defs, svgTexte: svgTexte}
};
global.SCENES = SCENES;
})(typeof window !== 'undefined' ? window : this);
