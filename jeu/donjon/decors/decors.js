/* decors.js — les décors de combat des salles du donjon (Les Enquêteurs de Brumeval), chemin long.
   Même modèle que le décor de la salle des rats (essai/dessins.js : COMBAT.decor / lumiere / avantPlan / vignette) :
   scène de 960 × 372, sol des personnages à y = 340 ; héros à gauche (x 0 à ~470), monstres à droite (x ~480 à 960).
   Style : sombre, détails au fond, lumière qui vient d'en haut à droite, contour #24182e, vignettage.
   Règle de lisibilité : rien de clair ni de très détaillé juste derrière les personnages ; le contraste va sur les
   bords, en haut (au-dessus des têtes, y < 100), dans le petit passage entre héros et monstres (x 445 à 490) et au sol.
   Pas de torche : la lumière vient de puits de lumière, de cristaux, de champignons, de runes, de l'eau.

     DECORS.ids                       ['canaux', 'toiles', 'atelier', 'ossuaire', 'bassin', 'egouts', 'crypte']
     DECORS[id].nom                   le nom de la salle
     DECORS[id].decor(W, H, sol)      le fond (SVG)
     DECORS[id].lumiere(W, H, sol)    la lumière qui passe aussi devant (SVG, mix-blend-mode:screen)
     DECORS[id].avantPlan(W, H, sol)  les silhouettes sombres du premier plan (SVG)
     DECORS[id].vignette(W, H)        le vignettage (SVG)
     DECORS.tout(id, W, H, sol)       les quatre empilés dans un <div> : c'est ce que rendre.py photographie en PNG

   Le jeu n'utilise que les PNG (decors/png/<id>.png) : ces SVG ont des flous, ils ne doivent jamais être animés.
   Les petites animations d'ambiance sont à part (decors/ambiance.js) et suivent les repères notés ici (REPERES). */
(function(global){
'use strict';
var O = '#24182e';

/* =====================================================================
   1. Petits outils de dessin (les mêmes que dans dessins.js)
   ===================================================================== */
function f1(v){ return String(Math.round(v * 10) / 10); }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function op(v){ return ' opacity="' + v + '"'; }
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + f + '"' + (x2 || '') + '/>'; }
function E(x, y, rx, ry, f, x2){ return '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + f + '"' + (x2 || '') + '/>'; }
function Rc(x, y, w, h, f, x2){ return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + f + '"' + (x2 || '') + '/>'; }
/* un chemin écrit autour d'un centre, à l'échelle k : chaque paire « x y » devient (cx + x k, cy + y k) */
function TS(d, cx, cy, k){ return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function(m, a, b){ return f1(cx + a * k) + ' ' + f1(cy + b * k); }); }

/* une scène : ses dégradés, ses flous, ses motifs (les identifiants ont un préfixe par salle) */
function Scene(pre){ this.pre = pre; this.n = 0; this.defs = []; this.memo = {}; }
function arrets(st){ return st.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join(''); }
Scene.prototype.id = function(){ return this.pre + '-' + (++this.n); };
Scene.prototype.lin = function(st, x1, y1, x2, y2){   /* par défaut : de haut en bas ; (1, 0, 0, 1) = éclairé d'en haut à droite */
  var id = this.id();
  this.defs.push('<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + arrets(st) + '</linearGradient>');
  return 'url(#' + id + ')';
};
Scene.prototype.linU = function(st, x1, y1, x2, y2){
  var id = this.id();
  this.defs.push('<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '">' + arrets(st) + '</linearGradient>');
  return 'url(#' + id + ')';
};
Scene.prototype.rad = function(st, cx, cy, r){
  var id = this.id();
  this.defs.push('<radialGradient id="' + id + '" cx="' + (cx == null ? .5 : cx) + '" cy="' + (cy == null ? .5 : cy) + '" r="' + (r || .5) + '">' + arrets(st) + '</radialGradient>');
  return 'url(#' + id + ')';
};
Scene.prototype.halo = function(c, o){   /* une lueur : la couleur au centre, transparente au bord */
  var k = c + o;
  if(!this.memo[k]){
    var id = this.id();
    this.defs.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + o + '"/><stop offset=".4" stop-color="' + c + '" stop-opacity="' + f1(o * 45) / 100 + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>');
    this.memo[k] = 'url(#' + id + ')';
  }
  return this.memo[k];
};
Scene.prototype.flou = function(n){
  var k = 'flou' + n;
  if(!this.memo[k]){ var id = this.id(); this.defs.push('<filter id="' + id + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="' + n + '"/></filter>'); this.memo[k] = 'url(#' + id + ')'; }
  return this.memo[k];
};
Scene.prototype.motif = function(w, h, c){
  var id = this.id();
  this.defs.push('<pattern id="' + id + '" width="' + w + '" height="' + h + '" patternUnits="userSpaceOnUse">' + c + '</pattern>');
  return 'url(#' + id + ')';
};
Scene.prototype.clip = function(d){
  var id = this.id();
  this.defs.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>');
  return ' clip-path="url(#' + id + ')"';
};
Scene.prototype.svg = function(W, H, corps, style){
  return '<svg class="dc-abs" style="position:absolute;left:0;top:0;pointer-events:none;' + (style || '') + '" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' + this.defs.join('') + '</defs>' + corps + '</svg>';
};

/* =====================================================================
   2. Les morceaux communs
   ===================================================================== */
/* un mur de pierres taillées : dégradé, motif de joints, quelques pierres plus claires ou plus sombres */
function murPierres(S, R, W, H, haut, o){
  var bw = o.bw, bh = o.bh;
  var m = S.motif(bw * 2, bh * 2, '<path d="M0 0 h' + bw * 2 + ' M0 ' + bh + ' h' + bw * 2 + ' M0 0 v' + bh + ' M' + bw + ' 0 v' + bh + ' M' + bw / 2 + ' ' + bh + ' v' + bh + ' M' + bw * 1.5 + ' ' + bh + ' v' + bh + '" stroke="' + o.joint + '" stroke-width="3" fill="none"/>' +
    '<path d="M3 3 h' + f1(bw * .6) + ' M' + (bw + 4) + ' ' + (bh + 3) + ' h' + f1(bw * .3) + ' M' + f1(bw * .6) + ' 3 l4 3" stroke="' + o.trait + '" stroke-width="1.6" opacity=".55"/>' +
    '<path d="M' + (bw - 4) + ' ' + (bh - 3) + ' h-' + f1(bw * .35) + ' M' + (bw * 2 - 4) + ' ' + (bh * 2 - 3) + ' h-' + f1(bw * .3) + '" stroke="' + o.ombre + '" stroke-width="1.6" opacity=".5"/>');
  var s = Rc(0, 0, W, H, S.lin([[0, o.g[0]], [.6, o.g[1]], [1, o.g[2]]])) + Rc(0, 0, W, haut, m);
  for(var r = 0; r * bh < haut; r++) for(var c = -1; c * bw < W; c++){
    var x = c * bw + (r % 2 ? bw / 2 : 0), y = r * bh, k = R();
    if(k < .2) s += Rc(x + 1.5, y + 1.5, bw - 3, bh - 3, o.clair, op(f1((o.pc || .3) * (.7 + R() * .8))));
    else if(k < .38) s += Rc(x + 1.5, y + 1.5, bw - 3, bh - 3, o.sombre, op(f1((o.ps || .35) * (.7 + R() * .8))));
  }
  return s;
}
/* de la roche brute : des blocs irréguliers aux coins arrondis, éclairés sur l'arête du haut */
function rocher(S, R, W, y0, y1, o){
  var s = '', y = y0;
  while(y < y1){
    var h = o.hMin + R() * (o.hMax - o.hMin), x = -20 - R() * 30;
    while(x < W + 20){
      var w = o.wMin + R() * (o.wMax - o.wMin), j = function(){ return (R() - .5) * (o.jc || 5); };
      var dy = (R() - .5) * (o.jy || 0), a = x + 2, b = y + 2 + dy, c = x + w - 2, d = y + h * (1 - R() * (o.hv || 0)) - 2 + dy, rr = Math.min(o.rr || 10, (d - b) * .45);
      var p = 'M' + f1(a + rr) + ' ' + f1(b + j()) + ' L ' + f1(c - rr) + ' ' + f1(b + j()) + ' Q ' + f1(c) + ' ' + f1(b) + ' ' + f1(c + j()) + ' ' + f1(b + rr) +
        ' L ' + f1(c + j()) + ' ' + f1(d - rr) + ' Q ' + f1(c) + ' ' + f1(d) + ' ' + f1(c - rr) + ' ' + f1(d + j()) + ' L ' + f1(a + rr) + ' ' + f1(d + j()) +
        ' Q ' + f1(a) + ' ' + f1(d) + ' ' + f1(a + j()) + ' ' + f1(d - rr) + ' L ' + f1(a + j()) + ' ' + f1(b + rr) + ' Q ' + f1(a) + ' ' + f1(b) + ' ' + f1(a + rr) + ' ' + f1(b) + ' Z';
      s += '<path d="' + p + '" fill="' + o.tons[Math.floor(R() * o.tons.length)] + '" stroke="' + o.joint + '" stroke-width="2.6"/>' +
        L('M' + f1(a + rr) + ' ' + f1(b + 1.8) + ' L ' + f1(c - rr) + ' ' + f1(b + 1.8) + ' Q ' + f1(c - 1.8) + ' ' + f1(b + 1.8) + ' ' + f1(c - 1.8) + ' ' + f1(b + rr), o.arete, 1.4, op(f1(.2 + R() * .25)));
      x += w;
    }
    y += h;
  }
  return s;
}
/* un trou dans la roche, aux bords bosselés (de la base au sommet) */
function trouRoche(R, cx, base, rx, ry){
  var pts = [[cx - rx * 1.04, base + 2]];
  for(var i = 1; i < 16; i++){ var a = Math.PI * (1 + i / 16), j = 1 + (R() - .5) * .26; pts.push([cx + Math.cos(a) * rx * j, base + Math.sin(a) * ry * j * (1 - .15 * Math.abs(Math.cos(a)))]); }
  pts.push([cx + rx * 1.04, base + 2]);
  var d = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]) + ' L ' + f1(pts[1][0]) + ' ' + f1(pts[1][1]);
  for(var k = 1; k < pts.length - 2; k++){ d += ' Q ' + f1(pts[k][0]) + ' ' + f1(pts[k][1]) + ' ' + f1((pts[k][0] + pts[k + 1][0]) / 2) + ' ' + f1((pts[k][1] + pts[k + 1][1]) / 2); }
  return d + ' L ' + f1(pts[pts.length - 2][0]) + ' ' + f1(pts[pts.length - 2][1]) + ' L ' + f1(pts[pts.length - 1][0]) + ' ' + f1(pts[pts.length - 1][1]) + ' Z';
}
function fissures(liste, c){
  return liste.map(function(f){ var x = f[0], y = f[1];
    return L('M' + x + ' ' + y + ' l 6 10 l -4 8 l 7 9 l -2 12 M' + (x + 6) + ' ' + (y + 10) + ' l 9 3', c, 1.8); }).join('');
}
/* de la mousse : une tache floue et des petits points */
function mousse(S, R, liste, c0, c1, c2){
  return liste.map(function(m){
    var s = E(m[0], m[1], m[2], m[2] * .35, c0, ' opacity=".35" filter="' + S.flou(3) + '"');
    for(var k = 0; k < 9; k++) s += C(m[0] + (R() - .5) * m[2] * 1.4, m[1] + (R() - .5) * m[2] * .5, 1 + R() * 2, R() < .5 ? c1 : c2, op(.7));
    return s;
  }).join('');
}
function lueur(S, x, y, rx, ry, c, o){ return E(x, y, rx, ry, S.halo(c, o)); }
/* une grande arche : l'ouverture sombre (et ce qu'on y voit), des arcs qui s'enfoncent, l'anneau de pierres et la clé */
function arche(S, x, w, ress, sol, o, dedans){
  var l = x - w / 2, r = x + w / 2, k = w * .66, haut = ress - k * .75;
  var arc = 'M' + f1(l) + ' ' + sol + ' V ' + ress + ' C ' + f1(l) + ' ' + f1(ress - k) + ' ' + f1(r) + ' ' + f1(ress - k) + ' ' + f1(r) + ' ' + ress + ' V ' + sol;
  var s = '<path d="' + arc + ' Z" fill="' + o.trou + '"/>';
  if(dedans) s += '<g' + S.clip(arc + ' Z') + '>' + dedans + '</g>';
  if(o.recul) for(var n = 1; n <= 3; n++){
    var ww = w * (1 - n * .22), ll = x - ww / 2, r2 = x + ww / 2, top = ress + n * 24, kk = ww * .66;
    s += '<path d="M' + f1(ll) + ' ' + sol + ' V ' + top + ' C ' + f1(ll) + ' ' + f1(top - kk) + ' ' + f1(r2) + ' ' + f1(top - kk) + ' ' + f1(r2) + ' ' + top + ' V ' + sol + '" fill="none" stroke="' + o.recul + '" stroke-width="' + (4 - n) + '" opacity="' + f1(.6 - n * .14) + '"/>';
  }
  if(o.brume) s += E(x, sol - 10, w * .4, 22, o.brume, ' opacity=".12" filter="' + S.flou(3) + '"');
  s += '<path d="' + arc + '" fill="none" stroke="' + o.joint + '" stroke-width="' + ((o.ep || 11) + 5) + '"/><path d="' + arc + '" fill="none" stroke="' + o.pierre + '" stroke-width="' + (o.ep || 11) + '"/>';
  for(var v = 0; v <= 10; v++){
    var a = Math.PI * (1 - v / 10), cx = x + Math.cos(a) * (w / 2), cy = ress - Math.sin(a) * (ress - haut), e = (o.ep || 11) * .55;
    s += L('M' + f1(cx - Math.cos(a) * e) + ' ' + f1(cy + Math.sin(a) * e) + ' L ' + f1(cx + Math.cos(a) * e) + ' ' + f1(cy - Math.sin(a) * e), o.joint, 2);
  }
  if(o.lune) s += L('M' + f1(r + 4) + ' ' + ress + ' C ' + f1(r + 4) + ' ' + f1(ress - k * .7) + ' ' + f1(x + 20) + ' ' + f1(haut + 2) + ' ' + x + ' ' + f1(haut), o.lune, 1.6, op(.28));
  if(o.cle !== false) s += P('M' + (x - 9) + ' ' + f1(haut - 6) + ' L ' + (x + 9) + ' ' + f1(haut - 6) + ' L ' + (x + 6) + ' ' + f1(haut + 12) + ' L ' + (x - 6) + ' ' + f1(haut + 12) + ' Z', o.cle || o.pierre);
  return s;
}
/* un pilier de pierre (avec base et chapiteau) */
function pilier(S, x, w, sol, haut, c){
  var g = S.lin([[0, clair(c, .12)], [.6, c], [1, sombre(c, .45)]], 1, 0, 0, 0);
  return '<rect x="' + f1(x - w / 2) + '" y="' + haut + '" width="' + w + '" height="' + (sol - haut) + '" fill="' + g + '" stroke="' + O + '" stroke-width="3"/>' +
    L('M' + f1(x - w / 2 + 12) + ' ' + (haut + 60) + ' L ' + f1(x - w / 2 + 12) + ' ' + (sol - 30), sombre(c, .5), 2) + L('M' + f1(x + w / 2 - 6) + ' ' + (haut + 60) + ' L ' + f1(x + w / 2 - 6) + ' ' + (sol - 30), clair(c, .2), 2) +
    P('M' + f1(x - w / 2 - 8) + ' ' + (sol - 26) + ' L ' + f1(x + w / 2 + 8) + ' ' + (sol - 26) + ' L ' + f1(x + w / 2 + 8) + ' ' + sol + ' L ' + f1(x - w / 2 - 8) + ' ' + sol + ' Z', c) +
    P('M' + f1(x - w / 2 - 10) + ' ' + (haut + 40) + ' L ' + f1(x + w / 2 + 10) + ' ' + (haut + 40) + ' L ' + f1(x + w / 2 + 6) + ' ' + (haut + 58) + ' L ' + f1(x - w / 2 - 6) + ' ' + (haut + 58) + ' Z', clair(c, .06)) +
    L('M' + f1(x - w / 2 - 6) + ' ' + (haut + 50) + ' L ' + f1(x + w / 2 + 6) + ' ' + (haut + 50), sombre(c, .5), 2);
}
/* des champignons qui luisent */
function champignons(S, x, y, k, chap, pied, lu){
  var s = E(x, y - 8 * k, 22 * k, 16 * k, S.halo(lu, .55));
  [[-8, 12, 7], [0, 18, 9], [9, 10, 6]].forEach(function(c){
    var cx = x + c[0] * k, h = c[1] * k, r = c[2] * k;
    s += L('M' + f1(cx) + ' ' + y + ' L ' + f1(cx) + ' ' + f1(y - h), pied, 2.4 * k) + '<path d="M' + f1(cx - r) + ' ' + f1(y - h) + ' Q ' + f1(cx) + ' ' + f1(y - h - r * 1.3) + ' ' + f1(cx + r) + ' ' + f1(y - h) + ' Z" fill="' + chap + '" stroke="' + O + '" stroke-width="' + f1(1.8 * k) + '"/>' + C(cx - r * .3, y - h - r * .4, r * .18, '#ffffff', op(.8));
  });
  return s;
}
/* un puits de lumière (deux trapèzes) et la poussière qui flotte dedans */
function faisceau(S, t0, t1, b0, b1, yb, c, o, yt){
  yt = yt || 0;
  var g = S.lin([[0, c, o], [.65, c, f1(o * 32) / 100], [1, c, f1(o * 10) / 100]]);
  var m0 = (t0 + t1) / 2, m1 = (b0 + b1) / 2, dt = (t1 - t0) * .25, db = (b1 - b0) * .23;
  return F('M' + t0 + ' ' + yt + ' L ' + t1 + ' ' + yt + ' L ' + b1 + ' ' + yb + ' L ' + b0 + ' ' + yb + ' Z', g) +
    F('M' + f1(m0 - dt) + ' ' + yt + ' L ' + f1(m0 + dt) + ' ' + yt + ' L ' + f1(m1 + db) + ' ' + yb + ' L ' + f1(m1 - db) + ' ' + yb + ' Z', g, op(.7));
}
function grains(R, n, t0, t1, b0, b1, yb, c, rmax, y0){
  var s = '';
  for(var p = 0; p < n; p++){
    var y = (y0 || 0) + R() * (yb - (y0 || 0)), t = y / yb, xa = t0 + (b0 - t0) * t, xb = t1 + (b1 - t1) * t, x = xa + (xb - xa) * (.12 + R() * .76);
    s += C(x, y, .6 + R() * (rmax || 1.4), c, op(f1(.25 + R() * .5)));
  }
  return s;
}
/* le sol : un dégradé, une ligne de dalles et des joints qui fuient vers le fond */
function sol_(S, W, H, sol, c0, c1, joint, xs, ligne){
  var d = 'M0 ' + (sol + (ligne || 14)) + ' H ' + W;
  xs.forEach(function(x){ d += ' M' + x + ' ' + sol + ' L ' + f1(x + (x - W / 2) * .2) + ' ' + H; });
  return '<path d="M0 ' + sol + ' H ' + W + ' V ' + H + ' H 0 Z" fill="' + S.lin([[0, c0], [1, c1]]) + '"/>' +
    '<path d="' + d + '" stroke="' + joint + '" stroke-width="3" fill="none"/>' + L('M0 ' + (sol + 1.5) + ' H ' + W, clair(c0, .18), 2, op(.45));
}
/* la brume au ras du sol */
function brume(S, W, sol, c, o){
  return Rc(0, sol - 60, W, 90, S.lin([[0, c, 0], [1, c, o]])) +
    E(120, sol - 30, 140, 18, c, ' opacity=".08" filter="' + S.flou(8) + '"') + E(760, sol - 50, 160, 20, c, ' opacity=".07" filter="' + S.flou(8) + '"');
}
/* le vignettage (comme la salle des rats), dans la couleur de la salle */
function vign(pre, W, H, c, cx, cy){
  return '<svg class="dc-abs" style="position:absolute;left:0;top:0;pointer-events:none" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<radialGradient id="' + pre + '-vv" cx="' + f1(W * (cx || .47)) + '" cy="' + f1(H * (cy || .55)) + '" r="' + f1(W * .62) + '" gradientUnits="userSpaceOnUse"><stop offset=".42" stop-color="' + c + '" stop-opacity="0"/><stop offset=".8" stop-color="' + c + '" stop-opacity=".72"/><stop offset="1" stop-color="' + c + '" stop-opacity=".96"/></radialGradient>' +
    '<linearGradient id="' + pre + '-vh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".8"/><stop offset=".2" stop-color="' + c + '" stop-opacity="0"/></linearGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#' + pre + '-vv)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + pre + '-vh)"/></svg>';
}
/* une toile d'araignée : des rayons, des fils qui pendent d'un rayon à l'autre, des gouttes de rosée */
function toile(R, cx, cy, r, a0, a1, nr, nt, c, o, trous, plein){
  var ang = [], s = '', i;
  for(i = 0; i < nr; i++) ang.push(a0 + (a1 - a0) * i / (plein ? nr : nr - 1) + (R() - .5) * .1);
  ang.forEach(function(a){ var rr = r * (.88 + R() * .22); s += L('M' + f1(cx) + ' ' + f1(cy) + ' L ' + f1(cx + Math.cos(a) * rr) + ' ' + f1(cy + Math.sin(a) * rr), c, 1.1, op(o)); });
  var gouttes = '';
  for(var t = 1; t <= nt; t++){
    var rt = r * t / (nt + .4), d = '', n = plein ? ang.length : ang.length - 1;
    for(i = 0; i < n; i++){
      if(trous && R() < trous) continue;
      var a = ang[i], b = ang[(i + 1) % ang.length], m = (a + b) / 2 + (plein && i === ang.length - 1 ? Math.PI : 0);
      var x1 = cx + Math.cos(a) * rt, y1 = cy + Math.sin(a) * rt, x2 = cx + Math.cos(b) * rt, y2 = cy + Math.sin(b) * rt;
      var qx = cx + Math.cos(m) * rt * .86, qy = cy + Math.sin(m) * rt * .86 + 2.5;
      d += 'M' + f1(x1) + ' ' + f1(y1) + ' Q ' + f1(qx) + ' ' + f1(qy) + ' ' + f1(x2) + ' ' + f1(y2) + ' ';
      if(R() < .22) gouttes += C((x1 + x2) / 2 * .5 + qx * .5, (y1 + y2) / 2 * .5 + qy * .5, .8 + R() * .9, '#ffffff', op(f1(o * 1.6 > 1 ? 1 : o * 1.6)));
    }
    if(d) s += L(d, c, .9, op(f1(o * .9)));
  }
  return s + gouttes;
}
/* un cocon pendu à son fil */
function cocon(S, x, y0, y1, w, c, fil){
  var h = w * 2.3;
  var s = L('M' + x + ' ' + y0 + ' L ' + x + ' ' + (y1 + 2), fil, 1.2, op(.6)) +
    Pw('M' + x + ' ' + y1 + ' C ' + f1(x + w * .78) + ' ' + f1(y1 + h * .14) + ' ' + f1(x + w * .64) + ' ' + f1(y1 + h * .86) + ' ' + x + ' ' + f1(y1 + h) + ' C ' + f1(x - w * .64) + ' ' + f1(y1 + h * .86) + ' ' + f1(x - w * .78) + ' ' + f1(y1 + h * .14) + ' ' + x + ' ' + y1 + ' Z',
      S.lin([[0, clair(c, .22)], [.5, c], [1, sombre(c, .55)]], 1, 0, 0, 1), 2.2);
  for(var i = 1; i < 7; i++){ var y = y1 + h * i / 7, hw = w * .66 * Math.sin(Math.PI * i / 7); s += L('M' + f1(x - hw) + ' ' + f1(y - 2) + ' Q ' + x + ' ' + f1(y + 3) + ' ' + f1(x + hw) + ' ' + f1(y + 1), sombre(c, .38), 1.2, op(.7)); }
  return s + L('M' + f1(x + w * .26) + ' ' + f1(y1 + h * .2) + ' Q ' + f1(x + w * .42) + ' ' + f1(y1 + h * .5) + ' ' + f1(x + w * .22) + ' ' + f1(y1 + h * .8), '#ffffff', 1.4, op(.3));
}
/* une grappe d'œufs translucides qui luisent */
function oeufs(S, R, x, y, n, ec, c, lu, o){
  var s = E(x, y - ec * .4, ec * 1.9, ec * 1.3, S.halo(lu, o || .4)), l = [];
  for(var i = 0; i < n; i++) l.push([x + (R() - .5) * ec * 2, y - R() * ec * 1.2, 4.5 + R() * 6]);
  l.sort(function(a, b){ return a[1] - b[1]; });
  var g = S.rad([[0, clair(c, .55)], [.55, c], [1, sombre(c, .4)]], .62, .3, .75);
  l.forEach(function(e){ s += C(e[0], e[1], e[2], g, ' stroke="' + O + '" stroke-width="1.6" fill-opacity=".9"') + C(e[0] + e[2] * .3, e[1] - e[2] * .38, e[2] * .22, '#ffffff', op(.75)); });
  return s + E(x, y - ec * .5, ec * .9, ec * .6, S.halo(clair(lu, .4), (o || .4) * .5));
}
/* des cristaux qui luisent (k < 0 : ils pendent du plafond) */
function cristaux(S, x, y, k, c, lu){
  var s = E(x, y - 18 * k, 34 * Math.abs(k), 26 * Math.abs(k), S.halo(lu, .5));
  [[-11, 26, -22, 5], [11, 22, 18, 5], [-4, 20, -38, 4], [2, 42, 3, 6.5], [7, 16, 34, 4]].forEach(function(p){
    var h = p[1], w = p[3], a = p[2] * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    var pt = function(u, v){ return f1(x + (p[0] + u * ca - v * sa) * k) + ' ' + f1(y + (u * sa + v * ca) * k); };
    s += Pw('M' + pt(-w, 0) + ' L ' + pt(-w, -h * .72) + ' L ' + pt(0, -h) + ' L ' + pt(0, 0) + ' Z', sombre(c, .25), 1.8) +
      Pw('M' + pt(0, 0) + ' L ' + pt(0, -h) + ' L ' + pt(w, -h * .72) + ' L ' + pt(w, 0) + ' Z', clair(c, .2), 1.8) +
      L('M' + pt(w * .4, -h * .2) + ' L ' + pt(w * .4, -h * .6), '#ffffff', 1.2, op(.6));
  });
  return s;
}
/* un engrenage : dents, voile creusé, rayons, moyeu, rivets ; éclairé d'en haut à droite */
function engrenage(S, cx, cy, r, n, c, rayons){
  var ri = r * .83, pts = [];
  for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2, da = Math.PI / n; pts.push([ri, a - da * .55], [r, a - da * .3], [r, a + da * .3], [ri, a + da * .55]); }
  var d = 'M' + pts.map(function(p){ return f1(cx + Math.cos(p[1]) * p[0]) + ' ' + f1(cy + Math.sin(p[1]) * p[0]); }).join(' L ') + ' Z';
  var g = S.lin([[0, clair(c, .28)], [.5, c], [1, sombre(c, .5)]], 1, 0, 0, 1);
  var s = P(d, g) + C(cx, cy, r * .64, sombre(c, .45), ' stroke="' + O + '" stroke-width="2.5"');
  for(var k = 0; k < (rayons || 5); k++){
    var b = k / (rayons || 5) * Math.PI * 2 + .3, e = r * .1;
    s += P('M' + f1(cx + Math.cos(b + 1.57) * e) + ' ' + f1(cy + Math.sin(b + 1.57) * e) + ' L ' + f1(cx + Math.cos(b) * r * .66 + Math.cos(b + 1.57) * e) + ' ' + f1(cy + Math.sin(b) * r * .66 + Math.sin(b + 1.57) * e) +
      ' L ' + f1(cx + Math.cos(b) * r * .66 - Math.cos(b + 1.57) * e) + ' ' + f1(cy + Math.sin(b) * r * .66 - Math.sin(b + 1.57) * e) + ' L ' + f1(cx - Math.cos(b + 1.57) * e) + ' ' + f1(cy - Math.sin(b + 1.57) * e) + ' Z', g);
  }
  s += C(cx, cy, r * .2, g, ' stroke="' + O + '" stroke-width="2.5"') + C(cx, cy, r * .07, sombre(c, .7)) +
    L('M' + f1(cx + r * .5) + ' ' + f1(cy - r * .82) + ' A ' + f1(r * .95) + ' ' + f1(r * .95) + ' 0 0 1 ' + f1(cx + r * .9) + ' ' + f1(cy - r * .25), clair(c, .5), 1.6, op(.5));
  for(var v = 0; v < 8; v++){ var t = v / 8 * Math.PI * 2; s += C(cx + Math.cos(t) * r * .73, cy + Math.sin(t) * r * .73, Math.max(1, r * .028), clair(c, .35), op(.7)); }
  return s;
}
/* un crâne de face (gentil : pas de sang, juste du mystère) ; (x, y) = le milieu du front, k = 1 pour 20 px de large */
function crane(S, x, y, k, c, g){
  g = g || S.lin([[0, clair(c, .3)], [.5, c], [1, sombre(c, .45)]], 1, 0, 0, 1);
  return Pw(TS('M-9 1 C -10 -10 10 -10 9 1 C 9 5 7 6 6 8 L 5 11 L -5 11 L -6 8 C -7 6 -9 5 -9 1 Z', x, y, k), g, f1(Math.max(1.4, 2.4 * k))) +
    Pw(TS('M-4.6 11 L 4.6 11 L 4.2 14.6 C 2 16 -2 16 -4.2 14.6 Z', x, y, k), sombre(c, .12), f1(Math.max(1.2, 2 * k))) +
    E(x - 4 * k, y + 1.8 * k, 2.8 * k, 3.1 * k, '#140c0a') + E(x + 4 * k, y + 1.8 * k, 2.8 * k, 3.1 * k, '#140c0a') +
    F(TS('M0 5.2 L -1.5 8.3 L 1.5 8.3 Z', x, y, k), '#140c0a') +
    L(TS('M-2.2 11.2 L -2.2 14.2 M0.6 11.2 L 0.6 14.6 M3 11.2 L 3 14', x, y, k), sombre(c, .55), f1(Math.max(.8, 1.1 * k))) +
    L(TS('M3 -6.4 C 6 -5.4 8 -2.4 8 1', x, y, k), '#ffffff', f1(Math.max(.8, 1.4 * k)), op(.4));
}
/* un os long (fémur) entre deux points */
function os(x1, y1, x2, y2, w, c){
  var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l * w * .5, ny = dx / l * w * .5;
  var b = function(x, y, f, r){ return C(x + nx, y + ny, r, f) + C(x - nx, y - ny, r, f); };
  return L('M' + f1(x1) + ' ' + f1(y1) + ' L ' + f1(x2) + ' ' + f1(y2), O, w + 3) + b(x1, y1, O, w * .62 + 1.5) + b(x2, y2, O, w * .62 + 1.5) +
    L('M' + f1(x1) + ' ' + f1(y1) + ' L ' + f1(x2) + ' ' + f1(y2), c, w) + b(x1, y1, c, w * .62) + b(x2, y2, c, w * .62) +
    L('M' + f1(x1 + nx * .3) + ' ' + f1(y1 + ny * .3 - .6) + ' L ' + f1(x2 + nx * .3) + ' ' + f1(y2 + ny * .3 - .6), clair(c, .45), Math.max(.8, w * .3), op(.6));
}
/* une feuille de nénuphar (l'encoche à droite), éclairée d'en haut */
function nenuphar(S, x, y, rx, ry, c){
  var a1 = .2, a2 = -.2, g = S.lin([[0, clair(c, .3)], [.6, c], [1, sombre(c, .5)]], 1, 0, 0, 1);
  return Pw('M' + f1(x) + ' ' + f1(y) + ' L ' + f1(x + rx * Math.cos(a1)) + ' ' + f1(y + ry * Math.sin(a1)) + ' A ' + rx + ' ' + ry + ' 0 1 1 ' + f1(x + rx * Math.cos(a2)) + ' ' + f1(y + ry * Math.sin(a2)) + ' Z', g, f1(Math.max(1.2, ry * .4))) +
    L('M' + f1(x) + ' ' + f1(y) + ' L ' + f1(x - rx * .8) + ' ' + f1(y - ry * .1) + ' M' + f1(x) + ' ' + f1(y) + ' L ' + f1(x - rx * .4) + ' ' + f1(y + ry * .7) + ' M' + f1(x) + ' ' + f1(y) + ' L ' + f1(x - rx * .3) + ' ' + f1(y - ry * .75), sombre(c, .3), .9, op(.6)) +
    L('M' + f1(x + rx * .2) + ' ' + f1(y - ry * .85) + ' Q ' + f1(x + rx * .7) + ' ' + f1(y - ry * .7) + ' ' + f1(x + rx * .9) + ' ' + f1(y - ry * .3), '#e8ffe0', 1, op(.35));
}
/* une fleur de lotus qui luit (pétales du fond rose pâle, du devant presque blancs, cœur doré) */
function lotus(S, x, y, k){
  var petale = 'M0 0 C -5.5 -6 -4.5 -16 0 -21 C 4.5 -16 5.5 -6 0 0 Z';
  var s = E(x, y - 8 * k, 46 * k, 22 * k, S.halo('#ffd2ea', .5)) + E(x, y + 6 * k, 20 * k, 4 * k, '#ffd2ea', op(.25));
  var gF = S.lin([[0, '#ffe4f0'], [.6, '#f2a8c8'], [1, '#b85a88']], 1, 0, 0, 1), gD = S.lin([[0, '#ffffff'], [.5, '#ffe6f2'], [1, '#e89cc0']], 1, 0, 0, 1);
  [-72, -44, 44, 72, -16, 16].forEach(function(a){ s += '<path transform="translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + a + ') scale(' + k + ')" d="' + petale + '" fill="' + gF + '" stroke="' + O + '" stroke-width="' + f1(1.8 / k) + '" stroke-linejoin="round"/>'; });
  s += E(x, y - 4 * k, 6 * k, 3.5 * k, '#ffd870', ' stroke="' + O + '" stroke-width="1.4"');
  [-30, 0, 30].forEach(function(a){ s += '<path transform="translate(' + f1(x) + ' ' + f1(y + 1 * k) + ') rotate(' + a + ') scale(' + f1(k * .82) + ')" d="' + petale + '" fill="' + gD + '" stroke="' + O + '" stroke-width="' + f1(1.8 / k / .82) + '" stroke-linejoin="round"/>'; });
  for(var i = 0; i < 5; i++) s += C(x - 4 * k + i * 2 * k, y - 8 * k - (i % 2) * 1.5 * k, .9 * k, '#fff4b0');
  return s;
}
/* une flèche gravée ou tracée (a en degrés, 0 = vers la droite) */
function fleche(x, y, a, l, c, w, x2){
  var d = 'M' + f1(-l / 2) + ' 0 L ' + f1(l / 2) + ' 0 M' + f1(l / 2 - l * .26) + ' ' + f1(-l * .2) + ' L ' + f1(l / 2) + ' 0 L ' + f1(l / 2 - l * .26) + ' ' + f1(l * .2);
  return '<path transform="translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + a + ')" d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x2 || '') + '/>';
}
/* six runes des Fondateurs (des traits, comme sur les piliers de la salle des rats) */
var RUNES = ['M0 8 L 0 -8 M0 -2 L -6 -8 M0 -2 L 6 -8', 'M0 -8 L 6 -2 L 0 4 L -6 -2 Z M-6 9 L 0 4 L 6 9', 'M-6 -7 L 6 7 M6 -7 L -6 7 M-6 -7 L -6 7 M6 -7 L 6 7',
  'M0 8 L 0 -8 M-6 -2 L 0 -8 L 6 -2', 'M4 -8 L -4 -2 L 4 2 L -4 8', 'M0 -8 L 6 0 L 0 8 L -6 0 Z'];
function rune(n, x, y, k, c, w, o){ return L(TS(RUNES[n], x, y, k), c, w, op(o)); }
/* des racines qui percent la voûte */
function racine(d, ep, c0, c1){ return L(d, c0, ep) + L(d, c1, Math.max(1.4, ep * .4)); }
/* une rangée de maisons de la ville d'avant (silhouettes, fenêtres faiblement éclairées) */
function maisons(R, x0, x1, base, hmax, c, fen){
  var s = '', x = x0;
  while(x < x1){
    var w = 20 + R() * 24, h = 26 + R() * hmax, t = base - h, toit = R();
    var d = 'M' + f1(x) + ' ' + base + ' L ' + f1(x) + ' ' + f1(t);
    if(toit < .45) d += ' L ' + f1(x + w / 2) + ' ' + f1(t - w * .45) + ' L ' + f1(x + w) + ' ' + f1(t);
    else if(toit < .7) d += ' L ' + f1(x + w) + ' ' + f1(t);
    else d += ' L ' + f1(x + w * .25) + ' ' + f1(t) + ' L ' + f1(x + w * .25) + ' ' + f1(t - 12) + ' L ' + f1(x + w * .75) + ' ' + f1(t - 12) + ' L ' + f1(x + w * .75) + ' ' + f1(t) + ' L ' + f1(x + w) + ' ' + f1(t);
    d += ' L ' + f1(x + w) + ' ' + base + ' Z';
    s += '<path d="' + d + '" fill="' + c + '" stroke="' + clair(c, .1) + '" stroke-width="1.2"/>';
    for(var k = 0; k < 3; k++) if(R() < .5) s += Rc(x + 4 + R() * (w - 10), t + 5 + R() * (h - 14), 3.5, 5, fen, op(f1(.15 + R() * .5)));
    x += w + 1 + R() * 4;
  }
  return s;
}

/* les repères partagés avec ambiance.js (mêmes coordonnées que les dessins ci-dessous) */
var REPERES = {
  canaux: {eau: [356, 372], faisceau: [604, 646, 530, 760], grille: [724, 64], chute: [480, 342]},
  toiles: {oeufs: [[52, 330], [906, 328]], faisceau: [630, 652, 560, 740], cristal: [470, 336]},
  atelier: {sceau: [330, 64], runes: [[470, 140], [470, 200], [470, 260]], vanne: [944, 238], fenetre: [405, 66]},
  ossuaire: {bougies: [[146, 71], [750, 71], [932, 71]], faisceau: [462, 500, 400, 580], yeux: [[224, 64], [736, 64]]},
  bassin: {lotus: [504, 258], gouttes: [[514, 44], [944, 52]], ronds: [[514, 300], [944, 286]], cone: [650, 760, 540, 900]},
  egouts: {tuyau: [470, 128], rigole: [352, 364], fleche: [700, 150], fuite: [622, 98]},
  crypte: {faisceau: [470, 502, 396, 576], couvercle: [508, 248]}
};

/* =====================================================================
   3. Les salles
   ===================================================================== */
var D = {};

/* ---------- Les canaux de la ville d'avant (bleu-vert) ---------- */
D.canaux = {nom: 'Les canaux de la ville d\'avant', monstres: '2 chauves-souris, 1 rat d\'égout'};
D.canaux.decor = function(W, H, sol){
  var S = new Scene('ca'), R = rng(31), s = '';
  var PIERRE = '#3a5e58', ALGUE = '#7affc8', EAU = '#c8fff0';
  s += murPierres(S, R, W, H, sol, {g: ['#061214', '#11302e', '#0c2321'], bw: 36, bh: 18, joint: '#03100f', trait: '#2f5e57', ombre: '#020a0a', clair: '#2b5852', sombre: '#030c0d', pc: .3, ps: .4});
  /* l'humidité : des coulures sombres sous la voûte */
  for(var k = 0; k < 11; k++){ var cx = 20 + R() * 920, cw = 8 + R() * 22, ch = 50 + R() * 150; s += Rc(cx, 0, cw, ch, S.lin([[0, '#020909', .55], [1, '#020909', 0]])); }
  s += fissures([[30, 30], [612, 214], [690, 40], [900, 130], [352, 40], [880, 250]], '#020a0a');
  /* les deux arches de la ville d'avant, et la ville engloutie qu'on voit derrière */
  [[128, 170, 158], [846, 164, 158]].forEach(function(a){
    var x = a[0], w = a[1], b = sol - 46, Rv = rng(x);
    var dedans = Rc(x - w, 0, w * 2, sol, S.lin([[0, '#030a0b'], [.7, '#082022'], [1, '#04100f']])) + lueur(S, x, b - 20, w * .6, 40, '#5affc0', .22) +
      maisons(Rv, x - w / 2 - 6, x + w / 2 + 6, b, 40, '#0b2427', '#9fffd8') + maisons(Rv, x - w / 2 - 14, x + w / 2 + 14, b + 10, 22, '#071a1c', '#9fffd8') +
      Rc(x - w, b + 8, w * 2, 60, S.lin([[0, '#0c3032'], [1, '#04100f']])) +
      [0, 1, 2, 3, 4].map(function(i){ return L('M' + f1(x - w * .4 + Rv() * w * .6) + ' ' + f1(b + 14 + i * 7) + ' h ' + f1(8 + Rv() * 20), '#8fe8d8', 1.2, op(f1(.15 + Rv() * .25))); }).join('');
    s += arche(S, x, w, a[2], sol, {trou: '#04100f', joint: '#020a0a', pierre: '#2c4e4a', cle: '#3a5e58', lune: EAU}, dedans);
  });
  /* au milieu, la grande ouverture : un canal qui s'enfuit au loin, avec son petit pont de pierre */
  var V = [480, 236];
  var loin = Rc(360, 0, 240, sol, S.lin([[0, '#020809'], [.7, '#0a2a28'], [1, '#062020']])) +
    lueur(S, V[0], V[1] - 10, 104, 64, '#8affd8', .4) + lueur(S, V[0], V[1] - 4, 24, 14, '#e8fff4', .65);
  /* les maisons des deux rives, en perspective (t = 0 tout près, t = 1 au loin) : pignons, fenêtres alignées */
  var rive = function(sg){
    var out = '', xN = 480 - sg * 118, xL = 480 - sg * 8, bN = 322, bL = V[1] + 2;
    var X = function(t){ return xN + (xL - xN) * t; }, B = function(t){ return bN + (bL - bN) * t; }, K = function(t){ return 1 - t * .92; };
    var cuts = [0, .3, .52, .68, .8, .88, .94], hs = sg > 0 ? [196, 150, 214, 132, 176, 120] : [170, 214, 140, 190, 128, 160];
    for(var i = 0; i < cuts.length - 1; i++){
      var t0 = cuts[i], t1 = cuts[i + 1], h0 = hs[i] * K(t0), h1 = hs[i] * K(t1), c = mix('#061718', '#1c4642', (t0 + t1) / 2);
      out += '<path d="M' + f1(X(t0)) + ' ' + f1(B(t0)) + ' L ' + f1(X(t0)) + ' ' + f1(B(t0) - h0) + ' L ' + f1(X(t1)) + ' ' + f1(B(t1) - h1) + ' L ' + f1(X(t1)) + ' ' + f1(B(t1)) + ' Z" fill="' + c + '" stroke="' + sombre(c, .45) + '" stroke-width="1.4"/>' +
        F('M' + f1(X(t0)) + ' ' + f1(B(t0) - h0) + ' L ' + f1((X(t0) + X(t1)) / 2) + ' ' + f1(B(t0) - h0 - 16 * K(t0)) + ' L ' + f1(X(t1)) + ' ' + f1(B(t1) - h1) + ' Z', sombre(c, .3)) +
        L('M' + f1(X(t0)) + ' ' + f1(B(t0) - h0) + ' L ' + f1((X(t0) + X(t1)) / 2) + ' ' + f1(B(t0) - h0 - 16 * K(t0)), clair(c, .2), 1, op(.5));
      [.32, .62].forEach(function(v){ [.3, .7].forEach(function(u){
        var t = t0 + (t1 - t0) * u, k = K(t), x = X(t), y = B(t) - hs[i] * k * (1 - v);
        out += Rc(x - 2 * k, y - 5 * k, 4 * k, 9 * k, '#a8ffe0', op(R() < .55 ? f1(.18 + R() * .4) : .06));
      }); });
    }
    return out;
  };
  loin += rive(1) + rive(-1);
  /* les quais et l'eau qui vient vers nous (le reflet de la lueur ondule au milieu) */
  loin += F('M362 322 L 476 238 L 478 238 L 404 ' + sol + ' L 362 ' + sol + ' Z', '#1a3532') + F('M598 322 L 484 238 L 482 238 L 556 ' + sol + ' L 598 ' + sol + ' Z', '#15302d') +
    L('M404 ' + sol + ' L 478 238', '#6aa098', 1.4, op(.45)) + L('M556 ' + sol + ' L 482 238', '#4a807a', 1.2, op(.3)) +
    F('M478 238 L 482 238 L 556 ' + sol + ' L 404 ' + sol + ' Z', S.lin([[0, '#3a8a7e'], [.25, '#164a46'], [1, '#071c1c']]));
  for(var r = 0; r < 22; r++){ var t = r / 22, ry = 240 + t * t * 98, hw = 2 + t * t * 26; loin += L('M' + f1(480 - hw * (.4 + R() * .6)) + ' ' + f1(ry) + ' h ' + f1(hw * (.6 + R())), '#d8fff0', 1 + t, op(f1(.5 - t * .3))); }
  for(var r2 = 0; r2 < 10; r2++){ var t2 = .3 + R() * .7, ry2 = 238 + t2 * 100, hw2 = 4 + t2 * 74; loin += L('M' + f1(480 + (R() < .5 ? -1 : 1) * hw2 * (.4 + R() * .5)) + ' ' + f1(ry2) + ' h ' + f1(4 + t2 * 12), '#8fe8d0', 1, op(f1(.15 + R() * .2))); }
  /* le petit pont de pierre, en dos d'âne (on voit son arche de face) */
  var gp = S.lin([[0, '#5a8a80'], [.5, '#355e58'], [1, '#1c3a37']], 1, 0, 0, 1);
  loin += P('M414 286 Q 480 262 546 286 L 546 304 L 530 304 C 526 284 434 284 430 304 L 414 304 Z', gp) +
    F('M434 303 C 438 290 522 290 526 303 Z', '#04100f', op(.85)) + L('M436 302 C 440 292 520 292 524 302', '#0a2a28', 2) +
    P('M410 286 Q 480 260 550 286 L 550 280 Q 480 254 410 280 Z', '#4a7a72') + L('M414 280 Q 480 256 546 280', '#a8e8d8', 1.4, op(.5));
  [418, 431, 444, 457, 470, 490, 503, 516, 529, 542].forEach(function(px){ var py = 280 - 26 * (1 - Math.pow((px - 480) / 70, 2)) * .72; loin += Rc(px - 2, py - 9, 4, 9, '#3e6a62', ' stroke="' + O + '" stroke-width="1.4"'); });
  loin += L('M410 271 Q 480 245 550 271', '#2a4e48', 3) + E(500, 288, 10, 3, '#3a7a50', op(.6)) + E(425, 300, 7, 3, '#3a7a50', op(.5));
  s += arche(S, 480, 230, 176, sol, {trou: '#04100f', joint: '#020a0a', pierre: '#2c4e4a', cle: '#3a5e58', lune: EAU, ep: 13}, loin);
  /* deux piliers de la ville d'avant, gravés de vagues */
  [[300, 44], [662, 44]].forEach(function(pl){
    var x = pl[0];
    s += pilier(S, x, pl[1], sol, 0, '#22403c') + lueur(S, x, 160, 14, 60, '#7affd8', .12) +
      [130, 190].map(function(y){ return L('M' + (x - 10) + ' ' + y + ' q 5 -6 10 0 t 10 0 M' + (x - 10) + ' ' + (y + 8) + ' q 5 -6 10 0 t 10 0', '#7affd8', 2, op(.45)); }).join('') +
      L('M' + (x + 6) + ' 230 l 4 10 l -3 9 l 5 8', '#020a0a', 1.6);
  });
  /* la grille d'égout ronde, dans le mur : une coulée verte en descend */
  s += C(724, 64, 34, '#7affc8', ' opacity=".08" filter="' + S.flou(8) + '"') + Rc(721, 92, 6, 90, S.lin([[0, '#3aa080', .6], [1, '#3aa080', 0]])) +
    C(724, 64, 28, '#030a0b', ' stroke="' + O + '" stroke-width="3"') + C(724, 64, 28, 'none', ' stroke="#4a6e68" stroke-width="5"') + C(724, 64, 22, 'none', ' stroke="#2a4642" stroke-width="2"') +
    L('M704 64 H 744 M724 44 V 84 M710 50 L 738 78 M738 50 L 710 78', '#5a7e76', 3) + L('M726 40 A 24 24 0 0 1 748 62', '#bfffe8', 1.4, op(.4)) + C(724, 64, 4, '#3e625c', ' stroke="' + O + '" stroke-width="1.5"');
  /* le puits de lumière : une grille de la rue, tout là-haut */
  s += faisceau(S, 604, 646, 530, 760, sol, EAU, .26) + Rc(596, -4, 58, 14, '#071312', ' stroke="#3e605a" stroke-width="3"') + L('M608 -2 L 608 10 M620 -2 L 620 10 M632 -2 L 632 10 M644 -2 L 644 10', '#4a6e66', 3) +
    grains(R, 30, 604, 646, 530, 760, sol, '#e8fff8');
  /* des algues qui luisent, de la mousse, des champignons */
  [[36, 252, 26], [928, 300, 30], [300, 22, 18], [934, 40, 20], [584, 334, 14]].forEach(function(a){
    s += lueur(S, a[0], a[1], a[2] * 1.6, a[2], ALGUE, .3);
    for(var k = 0; k < 10; k++) s += C(a[0] + (R() - .5) * a[2] * 1.5, a[1] + (R() - .5) * a[2] * .6, .8 + R() * 1.6, R() < .5 ? '#b8ffe4' : '#4ad8a0', op(f1(.5 + R() * .4)));
  });
  s += mousse(S, R, [[128, 66, 30], [846, 70, 30], [480, 54, 34], [300, 50, 20], [662, 50, 22], [20, 320, 40], [940, 318, 34]], '#2f7a4c', '#4aa060', '#1f5a38');
  [[60, 30], [210, 22], [560, 34], [780, 26], [900, 40], [400, 18]].forEach(function(m){ s += L('M' + m[0] + ' 0 q 3 ' + f1(m[1] / 2) + ' -1 ' + m[1], '#1f4a36', 2.4) + L('M' + (m[0] + 6) + ' 0 q -3 ' + f1(m[1] / 3) + ' 1 ' + f1(m[1] * .7), '#2a5a40', 1.8); });
  s += champignons(S, 22, sol - 4, 1, '#5ff0c0', '#bff0e0', '#7affd0') + champignons(S, 944, sol - 4, 1.1, '#5ff0c0', '#bff0e0', '#7affd0') + champignons(S, 600, sol - 6, .55, '#5ff0c0', '#bff0e0', '#7affd0');
  /* le quai (où l'on se tient) et le canal qui passe devant */
  var quai = S.lin([[0, '#45706a'], [.35, '#2a4a46'], [1, '#132624']]);
  s += Rc(0, sol - 4, W, 12, quai) + L('M0 ' + (sol - 3) + ' H ' + W, '#8ac8bc', 1.6, op(.45)) + Rc(0, sol + 8, W, 8, '#0a1a19') + L('M0 ' + (sol + 8) + ' H ' + W, O, 2.5);
  for(var q = 0; q < W; q += 68 + (q % 3) * 6) s += L('M' + q + ' ' + (sol - 4) + ' v 12', '#0a1a19', 2.4);
  /* le ponceau, sous le quai : une petite voûte à barreaux d'où l'eau du canal du fond se jette dans celui de devant */
  s += F('M458 ' + (sol + 16) + ' V ' + (sol + 13) + ' C 458 ' + (sol + 7) + ' 502 ' + (sol + 7) + ' 502 ' + (sol + 13) + ' V ' + (sol + 16) + ' Z', '#020808') +
    L('M456 ' + (sol + 16) + ' V ' + (sol + 13) + ' C 456 ' + (sol + 5) + ' 504 ' + (sol + 5) + ' 504 ' + (sol + 13) + ' V ' + (sol + 16), '#5a8a80', 2.4) + L('M468 ' + (sol + 9) + ' v 7 M480 ' + (sol + 8) + ' v 8 M492 ' + (sol + 9) + ' v 7', '#4a6e66', 2);
  s += Rc(0, sol + 16, W, H - sol - 16, S.lin([[0, '#103a3c'], [1, '#03100f']]));
  for(var w2 = 0; w2 < 34; w2++){ var wx = R() * W, wy = sol + 18 + R() * 14; s += L('M' + f1(wx) + ' ' + f1(wy) + ' h ' + f1(6 + R() * 22), '#6ac8b8', 1.1, op(f1(.12 + R() * .3))); }
  for(var w3 = 0; w3 < 9; w3++) s += L('M' + f1(560 + R() * 180) + ' ' + f1(sol + 19 + R() * 12) + ' h ' + f1(10 + R() * 24), EAU, 1.4, op(f1(.3 + R() * .3)));
  s += L('M470 ' + (sol + 17) + ' q 10 5 20 0', '#e8fff8', 1.6, op(.5)) + E(480, sol + 21, 26, 3, '#e8fff8', op(.18));
  [[200, sol + 24], [760, sol + 22]].forEach(function(f){ s += E(f[0], f[1], 7, 2.2, '#3a7a40', ' stroke="' + O + '" stroke-width="1.2"'); });
  s += Rc(0, sol - 50, W, 70, S.lin([[0, '#8fe8d8', 0], [1, '#8fe8d8', .14]])) + E(140, sol - 26, 150, 16, '#8fe8d8', ' opacity=".07" filter="' + S.flou(8) + '"') + E(780, sol - 40, 160, 18, '#8fe8d8', ' opacity=".06" filter="' + S.flou(8) + '"');
  return S.svg(W, H, s);
};
D.canaux.lumiere = function(W, H, sol){
  var S = new Scene('cal');
  return S.svg(W, H, F('M604 0 L 646 0 L 760 ' + sol + ' L 530 ' + sol + ' Z', '#8ad8c8', op(.1)) + E(645, sol + 22, 110, 10, S.halo('#bfffe8', .35)), 'mix-blend-mode:screen');
};
D.canaux.avantPlan = function(W, H, sol){
  var S = new Scene('caa'), N = '#020707';
  return S.svg(W, H,
    /* une bitte d'amarrage et sa corde, à gauche ; des roseaux et une pierre à droite ; une chaîne qui pend */
    F('M0 ' + (H - 26) + ' C 14 ' + (H - 40) + ' 40 ' + (H - 38) + ' 56 ' + (H - 24) + ' L 64 ' + H + ' L 0 ' + H + ' Z', N) +
    F('M20 ' + (H - 28) + ' L 22 ' + (H - 44) + ' C 10 ' + (H - 46) + ' 10 ' + (H - 56) + ' 22 ' + (H - 56) + ' L 46 ' + (H - 56) + ' C 58 ' + (H - 56) + ' 58 ' + (H - 46) + ' 46 ' + (H - 44) + ' L 48 ' + (H - 28) + ' Z', N) +
    L('M22 ' + (H - 40) + ' C 34 ' + (H - 36) + ' 44 ' + (H - 36) + ' 50 ' + (H - 40) + ' M22 ' + (H - 34) + ' C 34 ' + (H - 30) + ' 44 ' + (H - 30) + ' 50 ' + (H - 34) + ' M50 ' + (H - 36) + ' C 62 ' + (H - 32) + ' 66 ' + (H - 22) + ' 74 ' + (H - 16), '#071413', 3) +
    F('M' + W + ' ' + (H - 34) + ' C ' + (W - 24) + ' ' + (H - 44) + ' ' + (W - 50) + ' ' + (H - 32) + ' ' + (W - 66) + ' ' + (H - 18) + ' L ' + (W - 72) + ' ' + H + ' L ' + W + ' ' + H + ' Z', N) +
    [[-50, 70, -8], [-38, 96, 4], [-24, 80, 14], [-60, 60, -18], [-12, 104, 8]].map(function(r){ return L('M' + (W + r[0]) + ' ' + H + ' Q ' + (W + r[0] + r[2] * .3) + ' ' + (H - r[1] * .6) + ' ' + (W + r[0] + r[2]) + ' ' + (H - r[1]), N, 4); }).join('') +
    [0, 1, 2, 3, 4, 5].map(function(i){ return '<ellipse cx="' + (W - 28 + (i % 2) * 2) + '" cy="' + (8 + i * 12) + '" rx="4" ry="7" fill="none" stroke="#040b0b" stroke-width="3.5"/>'; }).join('') +
    L('M40 0 q 4 30 -2 52 M52 0 q -2 20 3 34', '#030909', 4));
};
D.canaux.vignette = function(W, H){ return vign('cav', W, H, '#010708'); };

/* ---------- La cave aux toiles (gris pâle et violet) ---------- */
D.toiles = {nom: 'La cave aux toiles', monstres: '1 araignée, 2 feux follets'};
D.toiles.decor = function(W, H, sol){
  var S = new Scene('to'), R = rng(47), s = '';
  var FIL = '#ddd4ee', OEUF = '#a77ed8', LU = '#c088ff';
  s += Rc(0, 0, W, H, '#16141a') + rocher(S, R, W, -8, sol, {hMin: 24, hMax: 52, wMin: 30, wMax: 104, jy: 12, jc: 10, hv: .25, rr: 20, tons: ['#2b2730', '#312c36', '#26232b', '#35303a', '#221f27', '#2d2833'], joint: '#09080c', arete: '#8e8698'});
  s += Rc(0, 0, W, sol, S.lin([[0, '#050407', .7], [.35, '#050407', .15], [.75, '#050407', .2], [1, '#050407', .45]]));
  /* les trous de la cave : très sombres (les personnages s'y découpent bien) */
  [[trouRoche(R, 488, sol + 4, 104, 168), 488, 292], [trouRoche(R, 172, sol + 4, 78, 118), 172, 300], [trouRoche(R, 838, sol + 4, 88, 140), 838, 290]].forEach(function(t){
    s += F(t[0], S.rad([[0, '#0e0b14'], [.7, '#060509'], [1, '#09070c']], .5, .7, .7)) + lueur(S, t[1], t[2], 50, 34, '#8a68c0', .22) +
      '<path d="' + t[0] + '" fill="none" stroke="#07060a" stroke-width="7"/>' + '<path d="' + t[0] + '" fill="none" stroke="#5a5070" stroke-width="1.6" opacity=".45"/>';
  });
  [[90, 18], [180, 12], [270, 22], [420, 14], [540, 20], [660, 16], [760, 24], [880, 14]].forEach(function(t){ s += P('M' + (t[0] - 10) + ' -2 L ' + (t[0] + 10) + ' -2 L ' + (t[0] + 2) + ' ' + t[1] + ' Z', '#2a2532', ' stroke-width="2"') + L('M' + (t[0] + 5) + ' 0 L ' + (t[0] + 2) + ' ' + (t[1] - 4), '#8a80a0', 1, op(.35)); });
  /* un voile de toile devant les trous */
  s += toile(R, 172, 270, 64, 0, Math.PI * 2, 12, 5, FIL, .14, .3, true) + toile(R, 840, 262, 70, 0, Math.PI * 2, 12, 5, FIL, .12, .35, true) + toile(R, 488, 228, 56, 0, Math.PI * 2, 11, 4, FIL, .1, .4, true);
  /* des racines qui descendent de la voûte */
  s += racine('M42 0 C 52 40 30 70 38 120 C 44 160 22 190 18 236', 9, '#26161e', '#5a404a') + racine('M38 90 C 60 104 64 120 78 128', 4, '#26161e', '#5a404a') + racine('M28 170 C 12 182 8 196 6 210', 3, '#26161e', '#5a404a') +
    racine('M928 0 C 918 40 940 66 932 110 C 926 150 948 170 952 200', 8, '#26161e', '#5a404a') + racine('M934 60 C 910 72 904 88 896 96', 3.5, '#26161e', '#5a404a') +
    racine('M300 0 C 306 14 296 24 304 40', 5, '#26161e', '#5a404a') + racine('M698 0 C 690 18 702 30 694 48', 5, '#26161e', '#5a404a') + racine('M560 0 C 566 10 558 20 562 30', 3, '#26161e', '#5a404a');
  /* les grandes toiles, en haut et dans les coins */
  s += toile(R, 116, 72, 150, 0, Math.PI * 2, 16, 8, FIL, .36, .12, true) + L('M116 72 L 0 6 M116 72 L 0 196 M116 72 L 270 0 M116 72 L 32 0', FIL, 1.1, op(.32)) +
    toile(R, 852, 66, 160, 0, Math.PI * 2, 16, 8, FIL, .34, .12, true) + L('M852 66 L 960 0 M852 66 L 960 214 M852 66 L 690 0 M852 66 L 940 0', FIL, 1.1, op(.3)) +
    toile(R, 488, 44, 84, 0, Math.PI * 2, 13, 5, FIL, .3, .2, true) + L('M488 44 L 420 0 M488 44 L 560 0', FIL, 1, op(.3));
  [[250, 0, 140], [380, 0, 96], [620, 0, 120], [760, 0, 60]].forEach(function(f){ s += L('M' + f[0] + ' 0 L ' + (f[0] + 2) + ' ' + f[2], FIL, .9, op(.25)); });
  /* les cocons pendus */
  s += cocon(S, 330, 0, 50, 15, '#cfc6da', FIL) + cocon(S, 602, 0, 26, 18, '#cfc6da', FIL) + lueur(S, 602, 46, 24, 30, LU, .25) + cocon(S, 938, 0, 70, 22, '#c4bcd0', FIL) + cocon(S, 22, 0, 98, 15, '#c4bcd0', FIL) + cocon(S, 792, 0, 18, 10, '#cfc6da', FIL);
  /* les grappes d'œufs qui luisent */
  s += oeufs(S, R, 52, 334, 15, 30, OEUF, LU, .62) + oeufs(S, R, 908, 332, 14, 30, OEUF, LU, .62) + oeufs(S, R, 246, 90, 5, 11, OEUF, LU, .3);
  /* les cristaux pâles (la lumière de la salle) */
  s += cristaux(S, 470, sol + 2, .9, '#d8c8ff', '#b890ff') + cristaux(S, 700, 0, -.6, '#d8c8ff', '#b890ff') + cristaux(S, 14, 232, .5, '#d8c8ff', '#b890ff') + cristaux(S, 380, 0, -.45, '#d8c8ff', '#b890ff');
  /* un rai de lumière pâle par une fente de la voûte */
  s += faisceau(S, 630, 652, 560, 740, sol, '#efe6ff', .16) + F('M626 0 L 656 0 L 648 6 L 634 6 Z', '#0a080e') + grains(R, 26, 630, 652, 560, 740, sol, '#f4eeff');
  /* le sol : de la roche, des fils, des cailloux, deux petits os */
  s += sol_(S, W, H, sol, '#2e2836', '#0b090f', '#0a080e', [90, 280, 480, 680, 870], 16);
  for(var f = 0; f < 10; f++){ var fx = R() * W; s += L('M' + f1(fx) + ' ' + (sol + 2) + ' q ' + f1(20 + R() * 30) + ' ' + f1(8 + R() * 10) + ' ' + f1(50 + R() * 60) + ' ' + f1(R() * 20), FIL, .9, op(.28)); }
  [[230, sol + 9, 8], [252, sol + 13, 5], [640, sol + 24, 7], [40, sol + 22, 7], [820, sol + 12, 6]].forEach(function(p){ s += E(p[0], p[1], p[2], p[2] * .6, '#3a3346', ' stroke="' + O + '" stroke-width="2.2"'); });
  s += os(300, sol + 20, 322, sol + 16, 3.4, '#bdb2c8') + os(708, sol + 26, 730, sol + 28, 3, '#bdb2c8');
  s += brume(S, W, sol, '#b8a8d8', .2);
  return S.svg(W, H, s);
};
D.toiles.lumiere = function(W, H, sol){
  var S = new Scene('tol');
  return S.svg(W, H, F('M630 0 L 652 0 L 740 ' + sol + ' L 560 ' + sol + ' Z', '#b8a8e0', op(.08)) + E(52, 322, 70, 40, S.halo('#c088ff', .2)) + E(908, 320, 70, 40, S.halo('#c088ff', .2)) + E(470, 326, 46, 30, S.halo('#c8a8ff', .25)), 'mix-blend-mode:screen');
};
D.toiles.avantPlan = function(W, H, sol){
  var S = new Scene('toa'), R = rng(5), N = '#050408';
  return S.svg(W, H,
    F('M0 ' + (H - 34) + ' C 20 ' + (H - 50) + ' 50 ' + (H - 44) + ' 70 ' + (H - 26) + ' L 80 ' + H + ' L 0 ' + H + ' Z', N) +
    F('M' + W + ' ' + (H - 40) + ' C ' + (W - 30) + ' ' + (H - 52) + ' ' + (W - 58) + ' ' + (H - 36) + ' ' + (W - 74) + ' ' + (H - 20) + ' L ' + (W - 80) + ' ' + H + ' L ' + W + ' ' + H + ' Z', N) +
    racine('M' + (W - 20) + ' 0 C ' + (W - 10) + ' 40 ' + (W - 36) + ' 70 ' + (W - 24) + ' 120', 10, N, '#0c0910') +
    toile(R, -20, -16, 170, 0, Math.PI / 2, 7, 6, '#e0d8f0', .2, .15) + toile(R, W + 10, -10, 130, Math.PI / 2, Math.PI, 6, 5, '#e0d8f0', .18, .2));
};
D.toiles.vignette = function(W, H){ return vign('tov', W, H, '#050408'); };

/* ---------- L'atelier des Fondateurs (rouille et cuivre) ---------- */
D.atelier = {nom: 'L\'atelier des Fondateurs', monstres: 'le Gardien de rouille, 1 rat cuirassé'};
D.atelier.decor = function(W, H, sol){
  var S = new Scene('at'), R = rng(59), s = '';
  var CUIVRE = '#b06a36', RUNE = '#7ff0ff', VERT = '#4fa890';
  s += murPierres(S, R, W, H, sol, {g: ['#0c0705', '#22150d', '#190f0a'], bw: 40, bh: 20, joint: '#060302', trait: '#5a3a24', ombre: '#040201', clair: '#3c2616', sombre: '#060302', pc: .32, ps: .4});
  /* des coulées de rouille sous le gros tuyau */
  for(var k = 0; k < 18; k++){ var rx = 10 + R() * 940, rw = 3 + R() * 6, rh = 30 + R() * 120; s += F('M' + f1(rx) + ' 34 L ' + f1(rx + rw) + ' 34 L ' + f1(rx + rw * .65) + ' ' + f1(34 + rh) + ' L ' + f1(rx + rw * .4) + ' ' + f1(34 + rh) + ' Z', S.lin([[0, '#9a4216', f1(.3 + R() * .2)], [1, '#9a4216', 0]])); }
  s += fissures([[600, 220], [700, 120], [360, 230], [870, 250]], '#060302');
  /* un voile froid derrière les monstres (le Gardien et le rat cuirassé sont couleur rouille : ils doivent se détacher) */
  s += E(720, 230, 300, 170, S.halo('#060a12', .55));
  /* les grands engrenages */
  s += engrenage(S, 150, -26, 108, 24, '#4a3020', 6) + engrenage(S, 872, 62, 56, 16, '#7a4a2a', 5) + engrenage(S, 938, 140, 30, 10, '#8a6a34', 4) + engrenage(S, 790, 10, 24, 9, '#6a4428', 4);
  /* la fenêtre ronde en forme d'engrenage : la lumière chaude et poussiéreuse de l'atelier */
  s += faisceau(S, 392, 418, 352, 520, sol, '#ffd8a0', .2, 66) + grains(R, 30, 392, 418, 352, 520, sol, '#ffe8c0', 1.2, 70) +
    engrenage(S, 405, 66, 26, 12, '#5a3a22', 6) + C(405, 66, 15, S.rad([[0, '#fff2d0'], [.7, '#ffc070'], [1, '#c06a20']]), ' stroke="' + O + '" stroke-width="2.5"') + L('M390 66 H 420 M405 51 V 81', '#5a3a22', 3.4) + lueur(S, 405, 66, 40, 34, '#ffc070', .35);
  /* le gros tuyau de cuivre, en haut, et ses deux descentes */
  var gT = S.lin([[0, '#e8a468'], [.35, CUIVRE], [1, '#3a1c0c']]), gV = S.lin([[0, '#3a1c0c'], [.55, CUIVRE], [1, '#e8a468']], 0, 0, 1, 0);
  s += Rc(-4, 13, W + 8, 23, gT, ' stroke="' + O + '" stroke-width="2.5"') + L('M0 18 H ' + W, '#ffd0a0', 1.4, op(.5));
  [120, 330, 560, 760].forEach(function(x){ s += Rc(x - 6, 9, 12, 31, S.lin([[0, '#c88a50'], [1, '#4a2410']]), ' stroke="' + O + '" stroke-width="2"') + C(x, 14, 1.6, '#ffd8a8') + C(x, 34, 1.6, '#5a2a10'); });
  [[200, 26, 18], [618, 24, 22], [880, 28, 14]].forEach(function(v){ s += E(v[0], v[1], v[2], 7, VERT, op(.5)); });
  s += Rc(12, 34, 22, sol - 34, gV, ' stroke="' + O + '" stroke-width="2.5"') + P('M12 36 C 12 18 24 13 40 13 L 40 36 Z', CUIVRE) +
    Rc(W - 22, 34, 26, sol - 34, gV, ' stroke="' + O + '" stroke-width="2.5"') + E(23, 200, 6, 30, VERT, op(.45));
  /* le cadran sur la descente de gauche (il luit faiblement), et la vanne à droite */
  s += C(46, 132, 16, '#8a6a34', ' stroke="' + O + '" stroke-width="2.5"') + C(46, 132, 12, '#cfe8c0', op(.75)) + lueur(S, 46, 132, 30, 30, '#cfffb0', .25) + L('M46 132 L 53 125', O, 2) + L('M38 136 A 9 9 0 0 1 44 124', O, 1, op(.5)) + Rc(34, 128, 6, 8, '#6a4a24');
  s += C(944, 238, 17, 'none', ' stroke="' + O + '" stroke-width="7"') + C(944, 238, 17, 'none', ' stroke="#8a3a1a" stroke-width="4"') + L('M927 238 H 961 M944 221 V 255', '#8a3a1a', 3.4) + C(944, 238, 4, '#c88a50', ' stroke="' + O + '" stroke-width="1.6"') + L('M950 224 A 15 15 0 0 1 958 234', '#ffb080', 1.2, op(.5));
  /* le sceau des Fondateurs, gravé de runes qui luisent faiblement */
  s += C(330, 64, 40, RUNE, ' opacity=".1" filter="' + S.flou(8) + '"') + C(330, 64, 32, '#3a2a20', ' stroke="' + O + '" stroke-width="3"') + C(330, 64, 26, '#2a1c14', ' stroke="#5a4232" stroke-width="2"') +
    rune(5, 330, 64, .9, RUNE, 2, .8) + [0, 1, 2, 3, 4].map(function(n){ var a = -Math.PI / 2 + n / 5 * Math.PI * 2; return rune(n, 330 + Math.cos(a) * 17.5, 64 + Math.sin(a) * 17.5, .42, RUNE, 1.4, .6); }).join('');
  /* le pilier gravé du milieu : ses runes luisent (entre les héros et les monstres) */
  s += pilier(S, 470, 36, sol, 36, '#33241a') + Rc(456, 110, 28, 170, RUNE, ' opacity=".07" filter="' + S.flou(8) + '"') +
    [140, 200, 260].map(function(y, i){ return lueur(S, 470, y, 16, 16, RUNE, .3) + rune([0, 1, 4][i], 470, y, .95, RUNE, 2.2, .75); }).join('');
  /* l'étagère : bocaux, une tête d'automate, de petits rouages */
  s += Rc(108, 96, 184, 7, S.lin([[0, '#7a4a2a'], [1, '#3a2010']]), ' stroke="' + O + '" stroke-width="2"') + P('M118 103 L 118 116 L 128 103 Z', '#4a2c18') + P('M282 103 L 282 116 L 272 103 Z', '#4a2c18') +
    P('M124 96 L 124 80 C 124 76 136 76 136 80 L 136 96 Z', '#2a3a30') + Rc(126, 86, 8, 9, '#5ac08a', op(.6)) + lueur(S, 130, 88, 14, 12, '#7affb0', .3) + Rc(123, 75, 14, 4, '#6a4a2a', ' stroke="' + O + '" stroke-width="1.5"') +
    P('M144 96 L 144 84 C 144 80 152 80 152 84 L 152 96 Z', '#3a2e28') +
    P('M160 96 L 160 82 C 160 66 194 66 194 82 L 194 96 Z', S.lin([[0, '#a06a3a'], [1, '#3a2010']], 1, 0, 0, 1)) + C(170, 84, 4.5, '#140a06', ' stroke="#c88a50" stroke-width="1.5"') + C(184, 84, 4.5, '#140a06', ' stroke="#c88a50" stroke-width="1.5"') + C(184, 84, 1.8, '#ffb050') + L('M177 69 L 177 60', O, 2) + C(177, 59, 2.4, '#c88a50') + L('M166 92 H 188', '#140a06', 1.6) +
    engrenage(S, 214, 88, 9, 8, '#8a6a34', 3) + engrenage(S, 232, 90, 7, 7, '#7a4a2a', 3) + P('M248 96 L 248 82 L 280 82 L 280 96 Z', '#4a2a1a') + L('M252 86 H 276', '#c8a050', 1.2, op(.6));
  /* l'établi au fond à gauche (dans l'ombre) : un étau, un marteau, un bras d'automate */
  s += Rc(24, 268, 228, 10, S.lin([[0, '#6a4024'], [1, '#2a160a']]), ' stroke="' + O + '" stroke-width="2.5"') + L('M26 269.5 H 250', '#c08050', 1.4, op(.45)) +
    Rc(34, 278, 10, sol - 278, '#1e120a', ' stroke="' + O + '" stroke-width="2"') + Rc(232, 278, 10, sol - 278, '#1e120a', ' stroke="' + O + '" stroke-width="2"') + Rc(40, 312, 196, 6, '#24160c', ' stroke="' + O + '" stroke-width="1.6"') +
    P('M50 268 L 50 256 L 76 256 L 76 262 L 64 262 L 64 268 Z', '#3a3a40') + P('M96 266 L 136 262 L 136 266 L 96 270 Z', '#5a3a22') + P('M134 256 L 146 256 L 146 270 L 134 270 Z', '#4a4a50') +
    P('M168 266 L 196 258 L 200 266 L 172 272 Z', CUIVRE) + C(198, 262, 5, '#8a5a30', ' stroke="' + O + '" stroke-width="2"') + P('M202 262 L 224 256 L 226 262 L 204 268 Z', '#8a5a30') + P('M224 254 l 8 -2 l 2 4 l -6 1 l 4 2 l -8 2 Z', '#6a4a2a') +
    P('M60 312 L 60 296 L 92 296 L 92 312 Z', '#2e1c10') + P('M98 312 L 98 300 L 124 300 L 124 312 Z', '#2a180c');
  /* le sol : des plaques de fer rivetées, des boulons, une clé, une flaque d'huile irisée */
  s += sol_(S, W, H, sol, '#3a2a1e', '#0d0806', '#080403', [120, 300, 480, 660, 840], 14);
  for(var rv = 6; rv < W; rv += 24) s += C(rv, sol + 7, 1.2, '#8a6a4a', op(.6));
  s += E(722, sol + 18, 46, 6, '#07070c', op(.75)) + L('M690 ' + (sol + 16) + ' q 20 -3 40 0', '#5a8aa8', 1.2, op(.35)) + L('M704 ' + (sol + 20) + ' q 18 3 36 0', '#9a6ab0', 1.2, op(.3));
  s += P('M600 ' + (sol + 24) + ' L 636 ' + (sol + 18) + ' M632 ' + (sol + 14) + ' l 8 2 l -2 8 l -6 -2', 'none') + L('M600 ' + (sol + 24) + ' L 636 ' + (sol + 18), '#7a7a80', 2.4) +
    engrenage(S, 300, sol + 18, 7, 8, '#7a6a4a', 3) + [[260, sol + 10], [520, sol + 26], [860, sol + 12], [390, sol + 24]].map(function(b){ return '<polygon points="' + [0, 1, 2, 3, 4, 5].map(function(i){ return f1(b[0] + Math.cos(i * 1.047) * 3.4) + ',' + f1(b[1] + Math.sin(i * 1.047) * 2.2); }).join(' ') + '" fill="#6a5a4a" stroke="' + O + '" stroke-width="1.2"/>'; }).join('');
  /* un automate cassé, couché dans le coin (son cœur luit encore un peu) */
  s += P('M-6 ' + (sol - 30) + ' C 10 ' + (sol - 40) + ' 50 ' + (sol - 40) + ' 66 ' + (sol - 26) + ' C 72 ' + (sol - 12) + ' 64 ' + (sol + 4) + ' 50 ' + (sol + 6) + ' L -6 ' + (sol + 6) + ' Z', S.lin([[0, '#8a5a30'], [1, '#2a160a']], 1, 0, 0, 1)) +
    C(34, sol - 14, 8, '#1a0c06', ' stroke="' + O + '" stroke-width="2"') + C(34, sol - 14, 4, '#ffb040') + lueur(S, 34, sol - 14, 22, 18, '#ffa030', .45) + L('M8 ' + (sol - 30) + ' L 10 ' + (sol + 4) + ' M54 ' + (sol - 32) + ' L 58 ' + (sol + 2), '#2a160a', 2);
  s += brume(S, W, sol, '#c09070', .14);
  return S.svg(W, H, s);
};
D.atelier.lumiere = function(W, H, sol){
  var S = new Scene('atl');
  return S.svg(W, H, F('M392 66 L 418 66 L 520 ' + sol + ' L 352 ' + sol + ' Z', '#ffc890', op(.09)) + E(436, sol + 4, 90, 10, S.halo('#ffd8a0', .3)) + E(470, 200, 30, 90, S.halo('#7ff0ff', .12)), 'mix-blend-mode:screen');
};
D.atelier.avantPlan = function(W, H, sol){
  var S = new Scene('ata'), N = '#060302', s = '';
  /* un grand engrenage sombre à droite, une caisse et des chaînes à gauche */
  var pts = [], cx = W - 6, cy = H + 22, r = 74;
  for(var i = 0; i < 20; i++){ var a = i / 20 * Math.PI * 2, da = Math.PI / 20; pts.push([r * .84, a - da * .55], [r, a - da * .3], [r, a + da * .3], [r * .84, a + da * .55]); }
  s += F('M' + pts.map(function(p){ return f1(cx + Math.cos(p[1]) * p[0]) + ' ' + f1(cy + Math.sin(p[1]) * p[0]); }).join(' L ') + ' Z', N);
  s += F('M0 ' + (H - 30) + ' L 44 ' + (H - 34) + ' L 50 ' + H + ' L 0 ' + H + ' Z', N) + L('M44 ' + (H - 34) + ' L 0 ' + (H - 30), '#120a06', 2) +
    [0, 1, 2, 3, 4, 5, 6].map(function(i){ return '<ellipse cx="' + (W - 60 + (i % 2) * 2) + '" cy="' + (6 + i * 12) + '" rx="4" ry="7" fill="none" stroke="#080402" stroke-width="3.5"/>'; }).join('') + P('M' + (W - 66) + ' 88 l 6 0 l 4 12 l -8 6 l -6 -4', N, ' stroke="#080402"');
  return S.svg(W, H, s);
};
D.atelier.vignette = function(W, H){ return vign('atv', W, H, '#060302'); };

/* ---------- L'ossuaire (ivoire et brun) ---------- */
D.ossuaire = {nom: 'L\'ossuaire', monstres: 'le Roi des rats, 2 feux follets'};
D.ossuaire.decor = function(W, H, sol){
  var S = new Scene('os'), R = rng(71), s = '';
  var IV = '#e2d6ba', IVs = '#a8977a', gIv = S.lin([[0, '#fff4dc'], [.5, IV], [1, '#8a7a5e']], 1, 0, 0, 1);
  s += Rc(0, 0, W, H, '#140e0a') + rocher(S, R, W, -8, sol, {hMin: 24, hMax: 36, wMin: 40, wMax: 80, tons: ['#32251a', '#2b2016', '#382a1d', '#261c13', '#322419'], joint: '#0d0805', arete: '#a48c64'});
  /* les rangées d'os empilés (comme dans les vraies catacombes) : un motif de bouts d'os, très discret */
  var bouts = S.motif(14, 11, '<ellipse cx="7" cy="5.5" rx="5.2" ry="4.2" fill="#6a5a44" stroke="#120c08" stroke-width="1.4"/><ellipse cx="8" cy="4.6" rx="2.2" ry="1.6" fill="#9a8a6a" opacity=".6"/>');
  s += Rc(0, 108, W, 34, bouts, op(.55)) + L('M0 108 H ' + W + ' M0 142 H ' + W, '#0b0705', 3);
  for(var c = 0; c < 22; c++) s += crane(S, 22 + c * 44, 156, .5, '#8a7a60');
  s += Rc(0, 168, W, 26, bouts, op(.4)) + L('M0 168 H ' + W + ' M0 194 H ' + W, '#0b0705', 3);
  /* plus on descend vers les personnages, plus le mur est sombre */
  s += Rc(0, 100, W, sol - 100, S.lin([[0, '#0a0604', .1], [.4, '#0a0604', .5], [1, '#0a0604', .62]]));
  /* les arches basses : des passages très sombres ; au fond de celle du milieu, un couloir de crânes et une lueur dorée */
  var couloir = Rc(380, 120, 200, 230, S.lin([[0, '#050302'], [1, '#0e0906']])) + lueur(S, 480, 290, 60, 34, '#ffd890', .35) + lueur(S, 480, 292, 16, 10, '#fff2d0', .6);
  [[416, 240, .42], [544, 240, .42], [432, 258, .34], [528, 258, .34], [446, 272, .27], [514, 272, .27], [458, 282, .2], [502, 282, .2]].forEach(function(k, i){ couloir += crane(S, k[0], k[1], k[2], i < 2 ? '#7a6a50' : '#6a5a44'); });
  couloir += F('M410 ' + sol + ' L 470 296 L 490 296 L 550 ' + sol + ' Z', S.lin([[0, '#3a2a1a'], [1, '#160e08']]));
  s += arche(S, 172, 150, 232, sol, {trou: '#060403', joint: '#0b0705', pierre: '#3a2c20', cle: false, recul: '#2a2018', brume: '#d8c8a8'}) +
    arche(S, 480, 150, 228, sol, {trou: '#060403', joint: '#0b0705', pierre: '#3e3024', cle: false}, couloir) +
    arche(S, 800, 160, 232, sol, {trou: '#060403', joint: '#0b0705', pierre: '#3a2c20', cle: false, recul: '#2a2018', brume: '#d8c8a8'});
  [[172, 182, .62], [480, 177, .62], [800, 176, .66]].forEach(function(k){ s += crane(S, k[0], k[1], k[2], '#c8b896'); });
  /* deux colonnes d'os empilés, coiffées d'un crâne */
  [[322, 44], [640, 44]].forEach(function(p){
    var x = p[0], w = p[1];
    s += Rc(x - w / 2, 112, w, sol - 112, '#1a130d', ' stroke="' + O + '" stroke-width="3"');
    for(var y = 120; y < sol - 10; y += 16){
      if((y - 120) % 64 === 48) for(var u = 0; u < 3; u++) s += crane(S, x - 13 + u * 13, y - 2, .42, '#8a7a5e');
      else for(var v = 0; v < 4; v++) s += E(x - 15 + v * 10, y, 4.6, 5.4, '#7a6a4e', ' stroke="#120c08" stroke-width="1.2"') + E(x - 14 + v * 10, y - 1, 1.8, 2, '#a8987a', op(.6));
    }
    s += Rc(x - w / 2, 112, w, sol - 112, S.lin([[0, '#0a0604', .2], [1, '#0a0604', .55]])) + L('M' + (x + w / 2 - 3) + ' 116 V ' + (sol - 6), '#c8b896', 1.4, op(.3)) +
      P('M' + (x - w / 2 - 6) + ' 112 L ' + (x + w / 2 + 6) + ' 112 L ' + (x + w / 2 + 2) + ' 100 L ' + (x - w / 2 - 2) + ' 100 Z', '#3a2c20') + crane(S, x, 82, .9, IV, gIv);
  });
  /* les niches du haut : un crâne dans chacune, des bougies dans trois d'entre elles */
  var NICHES = [42, 132, 224, 412, 548, 736, 828, 918];
  NICHES.forEach(function(x, i){
    s += '<path d="M' + (x - 22) + ' 92 V 46 C ' + (x - 22) + ' 20 ' + (x + 22) + ' 20 ' + (x + 22) + ' 46 V 92 Z" fill="#080504" stroke="#463628" stroke-width="5"/>' +
      E(x, 70, 24, 22, S.halo('#ffd8a0', .08)) + crane(S, x + (i % 3 === 1 ? -4 : 0), 70, .9, IV, gIv);
    if(i % 3 === 1) s += os(x + 4, 89, x + 20, 86, 2.6, IVs);
    if(i === 2 || i === 7) s += os(x - 18, 90, x - 4, 88, 2.4, IVs) + os(x + 4, 88, x + 18, 90, 2.4, IVs);
  });
  s += Rc(0, 92, W, 9, S.lin([[0, '#4a3a2a'], [1, '#1e160e']]), ' stroke="' + O + '" stroke-width="2"') + L('M0 93.5 H ' + W, '#a08a68', 1.2, op(.4));
  /* les bougies (petites, pas une torche) */
  [146, 750, 932].forEach(function(x){
    s += lueur(S, x, 74, 26, 22, '#ffc070', .45) + Rc(x - 2.6, 76, 5.2, 14, '#efe2c4', ' stroke="' + O + '" stroke-width="1.4"') + '<path d="M' + x + ' 66 C ' + (x + 3) + ' 71 ' + (x + 2) + ' 75 ' + x + ' 75 C ' + (x - 2) + ' 75 ' + (x - 3) + ' 71 ' + x + ' 66 Z" fill="#ffd060"/>' + C(x, 73, 1, '#fff8e0');
  });
  /* le trou de la voûte : une lumière ivoire, et la poussière dorée */
  s += F('M462 0 L 500 0 L 494 8 L 468 8 Z', '#050302') + faisceau(S, 462, 500, 400, 580, sol, '#fff0d4', .17) + grains(R, 36, 462, 500, 400, 580, sol, '#ffe8b8');
  /* les tas d'os dans les coins */
  [[60, sol + 4, 1], [900, sol + 4, -1]].forEach(function(t){
    var x = t[0], y = t[1], g = t[2], Rt = rng(x + 3);
    s += F('M' + (x - 80) + ' ' + y + ' C ' + (x - 60) + ' ' + (y - 46) + ' ' + (x + 50) + ' ' + (y - 50) + ' ' + (x + 80) + ' ' + y + ' Z', '#1e150e');
    for(var b = 0; b < 16; b++){ var bx = x + (Rt() - .5) * 120, by = y - 4 - Rt() * 34 * (1 - Math.abs(bx - x) / 80), a = Rt() * Math.PI, l = 10 + Rt() * 12; s += os(bx - Math.cos(a) * l, by - Math.sin(a) * l * .4, bx + Math.cos(a) * l, by + Math.sin(a) * l * .4, 3 + Rt() * 1.5, Rt() < .5 ? IVs : '#8a7a60'); }
    s += crane(S, x - 18 * g, y - 34, .8, '#c8b896') + crane(S, x + 26 * g, y - 20, .7, '#a8977a') + crane(S, x - 44 * g, y - 14, .62, '#8a7a60');
  });
  /* le sol : de la terre battue, des pierres plates, des petits morceaux d'os */
  s += sol_(S, W, H, sol, '#33261a', '#0c0805', '#0b0705', [150, 330, 640, 820], 15);
  [[250, sol + 9, 9], [272, sol + 13, 6], [560, sol + 24, 7], [700, sol + 14, 8]].forEach(function(p){ s += E(p[0], p[1], p[2], p[2] * .6, '#3e3022', ' stroke="' + O + '" stroke-width="2.2"'); });
  s += os(380, sol + 22, 398, sol + 18, 2.6, IVs) + os(600, sol + 10, 614, sol + 14, 2.2, IVs) + crane(S, 468, sol - 4, .55, '#b8a888');
  s += brume(S, W, sol, '#d8c8a8', .16);
  return S.svg(W, H, s);
};
D.ossuaire.lumiere = function(W, H, sol){
  var S = new Scene('osl');
  return S.svg(W, H, F('M462 0 L 500 0 L 580 ' + sol + ' L 400 ' + sol + ' Z', '#f0dcb8', op(.08)) + E(490, sol + 4, 90, 9, S.halo('#fff0d0', .3)), 'mix-blend-mode:screen');
};
D.ossuaire.avantPlan = function(W, H, sol){
  var S = new Scene('osa'), N = '#060402', s = '', R = rng(9);
  s += F('M0 ' + (H - 30) + ' C 24 ' + (H - 52) + ' 58 ' + (H - 46) + ' 82 ' + (H - 22) + ' L 90 ' + H + ' L 0 ' + H + ' Z', N) +
    F('M' + W + ' ' + (H - 38) + ' C ' + (W - 26) + ' ' + (H - 56) + ' ' + (W - 60) + ' ' + (H - 42) + ' ' + (W - 80) + ' ' + (H - 18) + ' L ' + (W - 86) + ' ' + H + ' L ' + W + ' ' + H + ' Z', N);
  /* des os en silhouette sur les tas */
  [[20, H - 40, 50, H - 46], [44, H - 30, 76, H - 40], [W - 70, H - 44, W - 30, H - 50]].forEach(function(o){ s += os(o[0], o[1], o[2], o[3], 5, N).replace(/#24182e/g, N); });
  s += racine('M60 0 C 70 26 54 44 64 70', 8, N, '#0c0806') + racine('M' + (W - 40) + ' 0 C ' + (W - 50) + ' 24 ' + (W - 34) + ' 40 ' + (W - 44) + ' 66', 7, N, '#0c0806');
  return S.svg(W, H, s);
};
D.ossuaire.vignette = function(W, H){ return vign('osv', W, H, '#050302'); };

/* ---------- Le grand bassin (salle du boss) ---------- */
D.bassin = {nom: 'Le grand bassin', monstres: 'Bourbe (le boss), 2 têtards'};
/* la margelle de Bourbe : il y pose ses mains (anim/betes/bourbe/demo.html : de x = 440 jusqu'au bord droit, le dessus à y = 352) */
var MARGELLE = {x: 440, y: 352};
D.bassin.decor = function(W, H, sol){
  var S = new Scene('ba'), R = rng(83), s = '';
  var LUNE = '#dff2ff', NEN = '#3e8a4a', OR = '#c8a860';
  s += murPierres(S, R, W, H, sol, {g: ['#04060d', '#121a30', '#0d1426'], bw: 46, bh: 23, joint: '#03050b', trait: '#2c3a60', ombre: '#020309', clair: '#27345a', sombre: '#03050c', pc: .3, ps: .4});
  s += fissures([[40, 230], [300, 150], [612, 120], [880, 140]], '#020309');
  /* à gauche, la terrasse des héros : deux portes sombres, une frise de lotus, un médaillon à tête de crapaud */
  s += arche(S, 120, 130, 214, sol, {trou: '#03040a', joint: '#020309', pierre: '#26304e', cle: '#323e62', recul: '#1e2844', lune: LUNE}) +
    arche(S, 318, 120, 220, sol, {trou: '#03040a', joint: '#020309', pierre: '#26304e', cle: '#323e62', recul: '#1e2844', lune: LUNE});
  s += Rc(0, 14, 440, 30, S.lin([[0, '#1e2846'], [1, '#121a30']]), ' stroke="' + O + '" stroke-width="2.5"') + L('M0 16 H 440', '#5a6a98', 1.2, op(.4));
  for(var fx = 10; fx < 430; fx += 40) s += L('M' + fx + ' 38 C ' + (fx + 4) + ' 26 ' + (fx + 10) + ' 22 ' + (fx + 14) + ' 20 C ' + (fx + 18) + ' 22 ' + (fx + 24) + ' 26 ' + (fx + 28) + ' 38 M' + (fx + 14) + ' 20 V 38 M' + (fx + 30) + ' 30 h 6', OR, 1.4, op(.35));
  s += C(222, 78, 30, '#7ff0ff', ' opacity=".06" filter="' + S.flou(6) + '"') + C(222, 78, 24, '#2a3456', ' stroke="' + O + '" stroke-width="3"') + C(222, 78, 19, '#1e2846', ' stroke="#3e4a72" stroke-width="2"') +
    L('M208 82 C 208 70 236 70 236 82 C 236 90 208 90 208 82 Z M213 72 a 4 4 0 1 1 1 0 M231 72 a 4 4 0 1 1 1 0 M213 84 Q 222 88 231 84 M216 66 l 2 -4 l 2 3 l 2 -4 l 2 4 l 2 -3 l 2 4', OR, 1.4, op(.6));
  /* à droite, le bassin : au fond, une colonnade de la ville d'avant qui trempe dans l'eau */
  s += F('M452 0 H ' + W + ' V 246 H 452 Z', S.lin([[0, '#03050b', .55], [1, '#03050b', .2]]));
  [[540, 150], [700, 150], [868, 150]].forEach(function(a){
    var x = a[0], w = a[1], k = w * .66, ress = 132, Rv = rng(x + 7), arc = 'M' + (x - w / 2) + ' 246 V ' + ress + ' C ' + (x - w / 2) + ' ' + (ress - k) + ' ' + (x + w / 2) + ' ' + (ress - k) + ' ' + (x + w / 2) + ' ' + ress + ' V 246 Z';
    /* au fond de chaque arche : la ville d'avant, à moitié sous l'eau, et une lueur lointaine */
    s += '<path d="' + arc + '" fill="#05070f"/>' + '<g' + S.clip(arc) + '>' + lueur(S, x, 214, 90, 50, '#5a7ab0', .22) +
      maisons(Rv, x - w / 2 - 4, x + w / 2 + 4, 238, 46, '#0b1226', '#bfe0ff') + maisons(Rv, x - w / 2 - 10, x + w / 2 + 10, 246, 20, '#080d1c', '#bfe0ff') + '</g>' +
      '<path d="M' + (x - w / 2) + ' 246 V ' + ress + ' C ' + (x - w / 2) + ' ' + (ress - k) + ' ' + (x + w / 2) + ' ' + (ress - k) + ' ' + (x + w / 2) + ' ' + ress + ' V 246" fill="none" stroke="#2a3456" stroke-width="9"/>';
  });
  [466, 620, 784, 952].forEach(function(x, i){
    var hb = i === 2 ? 150 : 40;
    s += Rc(x - 13, hb, 26, 246 - hb, S.lin([[0, '#3a4670'], [.6, '#232c4c'], [1, '#121830']], 1, 0, 0, 0), ' stroke="' + O + '" stroke-width="2.5"') + L('M' + (x - 4) + ' ' + (hb + 10) + ' V 240 M' + (x + 5) + ' ' + (hb + 10) + ' V 240', '#121830', 1.4, op(.7));
    if(i === 2) s += P('M' + (x - 13) + ' ' + hb + ' l 6 -8 l 5 6 l 6 -10 l 5 8 l 4 -4 l 0 8 Z', '#2a3456');
    else s += P('M' + (x - 19) + ' ' + hb + ' L ' + (x + 19) + ' ' + hb + ' L ' + (x + 15) + ' ' + (hb + 12) + ' L ' + (x - 15) + ' ' + (hb + 12) + ' Z', '#323e62');
  });
  /* la voûte : des nervures, des stalactites, l'oculus d'où tombe la lumière */
  s += L('M-20 64 Q 220 -6 452 40', '#020309', 14) + L('M-20 64 Q 220 -6 452 40', '#26304e', 9) + L('M452 40 Q 700 -30 980 30', '#020309', 14) + L('M452 40 Q 700 -30 980 30', '#26304e', 9) + L('M470 34 Q 700 -34 970 22', '#6a7ab0', 1.4, op(.4));
  [[60, 52, 14], [150, 30, 18], [250, 22, 12], [500, 30, 20], [560, 22, 14], [600, 16, 22], [820, 12, 18], [900, 20, 16], [940, 24, 22], [380, 26, 10]].forEach(function(t){
    s += P('M' + (t[0] - 7) + ' ' + (t[1] - 6) + ' L ' + (t[0] + 7) + ' ' + (t[1] - 6) + ' L ' + t[0] + ' ' + (t[1] + t[2]) + ' Z', '#1a2238', ' stroke-width="2"') + L('M' + (t[0] + 3) + ' ' + (t[1] - 4) + ' L ' + t[0] + ' ' + (t[1] + t[2] - 3), '#7a8ac0', 1, op(.4));
  });
  s += E(705, 0, 64, 16, '#020309', ' stroke="#3a4670" stroke-width="5"') + E(705, 0, 56, 12, '#eaf6ff') + lueur(S, 705, 6, 120, 50, LUNE, .5);
  s += faisceau(S, 650, 760, 540, 900, 330, LUNE, .3) + grains(R, 40, 650, 760, 540, 900, 330, '#f4fbff', 1.5);
  /* l'eau noire du bassin, de la colonnade jusqu'à la margelle */
  var eau = 'M444 246 H ' + W + ' V ' + MARGELLE.y + ' H 444 Z';
  s += F(eau, S.lin([[0, '#14284a'], [.25, '#0a162a'], [1, '#03070d']])) +
    E(712, 300, 190, 40, S.halo(LUNE, .22)) + E(712, 296, 90, 16, S.halo('#ffffff', .2)) + L('M444 247 H ' + W, '#6a86c0', 1.4, op(.45)) +
    [470, 620, 784, 952].map(function(x){ return Rc(x - 10, 248, 20, 50, S.lin([[0, '#3a4670', .5], [1, '#3a4670', 0]])); }).join('');
  for(var r = 0; r < 40; r++){ var wy = 252 + R() * 96, wx = 450 + R() * 500; s += L('M' + f1(wx) + ' ' + f1(wy) + ' h ' + f1(5 + R() * 18 * (wy - 230) / 100), wx > 590 && wx < 870 ? '#eef8ff' : '#9ab8e0', 1.1, op(f1(.12 + R() * .3))); }
  [[514, 300], [944, 286]].forEach(function(o){ s += E(o[0], o[1], 16, 4, 'none', ' stroke="#bfe0ff" stroke-width="1.3" opacity=".35"') + E(o[0], o[1], 30, 7.5, 'none', ' stroke="#bfe0ff" stroke-width="1" opacity=".18"'); });
  /* des gouttes qui tombent de la voûte */
  [[514, 44], [944, 52]].forEach(function(g){ s += L('M' + g[0] + ' ' + (g[1] + 20) + ' V ' + (g[1] + 34), '#bfe0ff', 1.4, op(.4)) + '<path d="M' + g[0] + ' ' + (g[1] + 54) + ' c 2 3 2.6 5 2.6 6.4 a 2.6 2.6 0 0 1 -5.2 0 c 0 -1.4 .6 -3.4 2.6 -6.4 Z" fill="#dff2ff" opacity=".7"/>'; });
  /* le lotus qui luit, ses nénuphars ; d'autres nénuphars près de la margelle et à droite */
  s += E(504, 270, 18, 26, S.halo('#ffd2ea', .25)) + nenuphar(S, 470, 270, 20, 5.5, NEN) + nenuphar(S, 536, 274, 16, 4.6, NEN) + nenuphar(S, 488, 252, 11, 3, NEN) + nenuphar(S, 540, 256, 9, 2.6, NEN) + lotus(S, 504, 260, .85) +
    nenuphar(S, 476, 340, 17, 4.6, NEN) + nenuphar(S, 512, 346, 12, 3.4, NEN) + nenuphar(S, 944, 262, 14, 3.8, NEN) + nenuphar(S, 930, 320, 18, 5, NEN) + nenuphar(S, 600, 252, 10, 2.8, NEN) +
    L('M488 336 Q 486 326 490 318', '#3a6a40', 2) + P('M490 318 C 485 312 486 304 490 300 C 494 304 495 312 490 318 Z', '#f0a8c8', ' stroke-width="1.6"');
  /* des lucioles au-dessus de l'eau */
  [[478, 210], [526, 228], [910, 214], [300, 170], [440, 120], [930, 120]].forEach(function(l){ s += lueur(S, l[0], l[1], 9, 9, '#c8ffdc', .55) + C(l[0], l[1], 1.4, '#f0fff4'); });
  /* des lianes qui pendent */
  [[462, 140], [474, 96], [930, 190], [948, 150], [100, 70]].forEach(function(v){
    s += L('M' + v[0] + ' 0 C ' + (v[0] + 6) + ' ' + f1(v[1] * .4) + ' ' + (v[0] - 6) + ' ' + f1(v[1] * .7) + ' ' + v[0] + ' ' + v[1], '#1a3a22', 3) + L('M' + v[0] + ' 0 C ' + (v[0] + 6) + ' ' + f1(v[1] * .4) + ' ' + (v[0] - 6) + ' ' + f1(v[1] * .7) + ' ' + v[0] + ' ' + v[1], '#3a6a40', 1.2);
    for(var f = 20; f < v[1]; f += 22) s += E(v[0] + (f % 44 ? 5 : -5), f, 4.5, 2.2, '#2e5a34', ' stroke="' + O + '" stroke-width="1"');
  });
  /* la grande colonne à l'angle du bassin */
  s += Rc(426, 0, 36, sol, S.lin([[0, '#3e4a74'], [.55, '#242e50'], [1, '#121830']], 1, 0, 0, 0), ' stroke="' + O + '" stroke-width="3"') + L('M436 50 V ' + (sol - 30) + ' M452 50 V ' + (sol - 30), '#121830', 1.6) + L('M458 50 V ' + (sol - 30), '#6a7ab0', 1.2, op(.35)) +
    P('M418 44 L 470 44 L 466 60 L 422 60 Z', '#323e62') + L('M422 52 H 466', '#141a30', 2);
  /* la terrasse des héros : de grandes dalles polies, une flaque qui brille, de la mousse */
  s += sol_(S, 446, H, sol, '#2c3658', '#090c18', '#060810', [100, 250, 400], 15);
  s += E(300, sol + 18, 60, 5, '#6a7ab0', op(.35)) + E(290, sol + 17, 24, 1.6, '#eef8ff', op(.5)) + mousse(S, R, [[30, sol - 4, 40], [410, sol - 2, 30], [220, 46, 20]], '#2e6a40', '#4a9a5a', '#1e4a2c');
  /* la margelle : le dessus éclairé, la face avec ses joints et une frise de vagues ; la borne d'angle et son crapaud de pierre */
  var my = MARGELLE.y;
  s += Rc(MARGELLE.x, my - 3, W - MARGELLE.x + 4, 9, S.lin([[0, '#8a8ab0'], [1, '#4a4c6e']]), ' stroke="' + O + '" stroke-width="2.5"') + L('M' + (MARGELLE.x + 2) + ' ' + (my - 1.5) + ' H ' + W, '#d8e4ff', 1.4, op(.5)) +
    Rc(MARGELLE.x, my + 6, W - MARGELLE.x + 4, H - my, S.lin([[0, '#3a3c5c'], [1, '#14162a']]), ' stroke="' + O + '" stroke-width="2.5"');
  for(var mx = MARGELLE.x + 64; mx < W; mx += 72) s += L('M' + mx + ' ' + (my - 3) + ' v 9 M' + (mx + 30) + ' ' + (my + 6) + ' v ' + (H - my), '#0c0e1c', 2.2);
  for(var vx = MARGELLE.x + 10; vx < W; vx += 22) s += L('M' + vx + ' ' + (my + 14) + ' q 5.5 -5 11 0 t 11 0', '#8a90c0', 1.2, op(.3));
  s += Rc(428, 320, 34, H - 320, S.lin([[0, '#4a4c72'], [1, '#1a1c34']], 1, 0, 0, 1), ' stroke="' + O + '" stroke-width="2.5"') + P('M424 312 L 466 312 L 466 322 L 424 322 Z', '#6a6c94') + L('M426 313.5 H 464', '#d8e4ff', 1.2, op(.5));
  var gF = S.lin([[0, '#8aa090'], [.5, '#5a6e62'], [1, '#2a3632']], 1, 0, 0, 1);
  s += Pw(TS('M-14 0 C -16 -10 -10 -19 0 -19 C 10 -19 16 -10 14 0 Z', 445, 312, 1), gF, 2.2) + C(438, 293, 5, gF, ' stroke="' + O + '" stroke-width="2"') + C(452, 293, 5, gF, ' stroke="' + O + '" stroke-width="2"') +
    L('M436 293 h 4 M450 293 h 4', '#1a201c', 1.6) + L('M437 302 Q 445 306 453 302', '#1a201c', 1.4) + E(431, 311, 5, 2.4, gF, ' stroke="' + O + '" stroke-width="1.6"') + E(459, 311, 5, 2.4, gF, ' stroke="' + O + '" stroke-width="1.6"') +
    P('M440 289 L 441 284 L 443 288 L 445 283 L 447 288 L 449 284 L 450 289 Z', '#c8a050', ' stroke-width="1.2"') + E(447, 300, 6, 3, '#3a6a40', op(.6)) + L('M452 288 A 5 5 0 0 1 456 294', '#e8f0e8', 1, op(.5));
  /* la brume sur l'eau */
  s += Rc(444, 290, W - 444, 62, S.lin([[0, '#a8c8f0', 0], [1, '#a8c8f0', .16]])) + E(560, 330, 140, 12, '#c8e0ff', ' opacity=".1" filter="' + S.flou(6) + '"') + brume(S, 446, sol, '#a8b8e0', .12);
  return S.svg(W, H, s);
};
D.bassin.lumiere = function(W, H, sol){
  var S = new Scene('bal');
  return S.svg(W, H, F('M650 0 L 760 0 L 900 330 L 540 330 Z', '#a8d0ff', op(.12)) + E(705, 8, 150, 50, S.halo('#dff2ff', .3)) + E(504, 262, 40, 22, S.halo('#ffc8e0', .3)), 'mix-blend-mode:screen');
};
D.bassin.avantPlan = function(W, H, sol){
  var S = new Scene('baa'), N = '#020309', s = '';
  /* des roseaux et une pierre en bas à droite, une fougère et une pierre à gauche, des lianes et des stalactites en haut */
  s += F('M' + W + ' ' + (H - 26) + ' C ' + (W - 20) + ' ' + (H - 34) + ' ' + (W - 44) + ' ' + (H - 24) + ' ' + (W - 54) + ' ' + (H - 12) + ' L ' + (W - 58) + ' ' + H + ' L ' + W + ' ' + H + ' Z', N);
  [[-46, 96, -10], [-34, 120, 4], [-20, 100, 14], [-58, 70, -18], [-8, 112, 6], [-70, 54, -12]].forEach(function(r){ s += L('M' + (W + r[0]) + ' ' + H + ' Q ' + (W + r[0] + r[2] * .3) + ' ' + (H - r[1] * .6) + ' ' + (W + r[0] + r[2]) + ' ' + (H - r[1]), N, 3.6); });
  [[-34, 120, 4], [-8, 112, 6]].forEach(function(r){ s += E(W + r[0] + r[2] * .9, H - r[1] + 14, 4, 11, N); });
  s += F('M0 ' + (H - 30) + ' C 18 ' + (H - 44) + ' 46 ' + (H - 40) + ' 60 ' + (H - 24) + ' L 68 ' + H + ' L 0 ' + H + ' Z', N);
  for(var i = 0; i < 6; i++){ var a = -1.3 + i * .32; s += L('M30 ' + (H - 30) + ' q ' + f1(Math.cos(a) * 30) + ' ' + f1(Math.sin(a) * 30 - 10) + ' ' + f1(Math.cos(a) * 54) + ' ' + f1(Math.sin(a) * 40), N, 3); }
  s += L('M24 0 C 30 30 18 50 28 84 M40 0 C 36 20 46 34 40 52', N, 4) + [[W - 40, 30], [W - 20, 46], [W - 64, 20]].map(function(t){ return F('M' + (t[0] - 9) + ' 0 L ' + (t[0] + 9) + ' 0 L ' + t[0] + ' ' + t[1] + ' Z', N); }).join('');
  return S.svg(W, H, s);
};
D.bassin.vignette = function(W, H){ return vign('bav', W, H, '#02030a', .5, .5); };

/* ---------- Les égouts tournants (on s'y perd) ---------- */
D.egouts = {nom: 'Les égouts tournants', monstres: '1 rat errant'};
D.egouts.decor = function(W, H, sol){
  var S = new Scene('eg'), R = rng(97), s = '';
  var CRAIE = '#e8e0c0', PHOS = '#d4ff6a', TUYAU = '#4a4a38';
  s += murPierres(S, R, W, H, sol, {g: ['#060604', '#1e1d13', '#17160e'], bw: 30, bh: 14, joint: '#040403', trait: '#4a4830', ombre: '#030302', clair: '#3a3824', sombre: '#050503', pc: .3, ps: .45});
  /* la voûte ronde du tunnel : elle se courbe vers nous en haut */
  var vo = 'M0 0 H ' + W + ' V 64 Q 480 18 0 64 Z';
  s += F(vo, S.lin([[0, '#030302'], [1, '#141409']])) + '<g' + S.clip(vo) + '>' + [8, 20, 32, 44].map(function(y){ return L('M0 ' + (y + 18) + ' Q 480 ' + (y - 24) + ' ' + W + ' ' + (y + 18), '#2a2a1c', 2, op(.7)); }).join('') + '</g>' +
    L('M0 64 Q 480 18 ' + W + ' 64', '#040403', 7) + L('M0 66 Q 480 20 ' + W + ' 66', '#5a5838', 2, op(.5));
  /* des coulées sombres et des fissures */
  for(var k = 0; k < 10; k++){ var cx = 20 + R() * 920, cw = 6 + R() * 18; s += Rc(cx, 60, cw, 60 + R() * 160, S.lin([[0, '#020201', .5], [1, '#020201', 0]])); }
  s += fissures([[360, 200], [612, 250], [890, 120], [40, 120]], '#030302');
  /* les deux bouches rondes : des tunnels qui partent on ne sait où */
  [[196, 228, 76, '#c8ff6a'], [796, 224, 80, '#ffe08a']].forEach(function(b){
    var x = b[0], y = b[1], r = b[2];
    s += C(x, y, r + 10, '#0c0c07') + C(x, y, r, S.rad([[0, '#141409'], [.6, '#070704'], [1, '#020201']])) + C(x + 4, y - 2, r * .7, 'none', ' stroke="#2a2a1c" stroke-width="2" opacity=".55"') + C(x + 7, y - 3, r * .46, 'none', ' stroke="#2a2a1c" stroke-width="1.6" opacity=".4"') + lueur(S, x + 9, y - 4, r * .3, r * .26, b[3], .2) +
      C(x, y, r + 9, 'none', ' stroke="#040403" stroke-width="22"') + C(x, y, r + 9, 'none', ' stroke="#3a3826" stroke-width="16"');
    for(var a = 0; a < 24; a++){ var t = a / 24 * Math.PI * 2; s += L('M' + f1(x + Math.cos(t) * (r + 1)) + ' ' + f1(y + Math.sin(t) * (r + 1)) + ' L ' + f1(x + Math.cos(t) * (r + 17)) + ' ' + f1(y + Math.sin(t) * (r + 17)), '#040403', 2); }
    s += '<path d="M' + f1(x + (r + 9) * Math.cos(-1.2)) + ' ' + f1(y + (r + 9) * Math.sin(-1.2)) + ' A ' + (r + 9) + ' ' + (r + 9) + ' 0 0 1 ' + f1(x + (r + 9) * Math.cos(.1)) + ' ' + f1(y + (r + 9) * Math.sin(.1)) + '" fill="none" stroke="#7a7650" stroke-width="2" opacity=".5"/>' +
      L('M' + (x - 4) + ' ' + (y + r - 2) + ' C ' + (x - 8) + ' ' + (y + r + 12) + ' ' + (x + 2) + ' ' + (sol - 14) + ' ' + (x - 2) + ' ' + (sol + 12), '#6a8a40', 5, op(.45)) +
      L('M' + (x - 3) + ' ' + (y + r) + ' C ' + (x - 6) + ' ' + (y + r + 12) + ' ' + (x + 2) + ' ' + (sol - 14) + ' ' + (x - 1) + ' ' + (sol + 12), '#d8f0a0', 1.2, op(.45)) + E(x - 2, sol + 16, 12, 2.4, '#d8f0a0', op(.3));
  });
  /* les tuyaux, une fuite qui luit */
  var gT = S.lin([[0, '#7a7858'], [.4, TUYAU], [1, '#141409']]);
  s += Rc(-4, 70, W + 8, 14, gT, ' stroke="' + O + '" stroke-width="2.2"') + Rc(-4, 88, W + 8, 10, gT, ' stroke="' + O + '" stroke-width="2"');
  [90, 260, 430, 610, 780].forEach(function(x){ s += Rc(x - 5, 66, 10, 22, '#5a5840', ' stroke="' + O + '" stroke-width="1.8"') + Rc(x + 40, 85, 8, 16, '#5a5840', ' stroke="' + O + '" stroke-width="1.6"'); });
  [[160, 77, 16], [520, 92, 12], [700, 76, 20], [880, 93, 10]].forEach(function(t){ s += E(t[0], t[1], t[2], 4, '#8a5020', op(.6)); });
  s += lueur(S, 622, 104, 26, 18, PHOS, .4) + F('M617 97 Q 616 106 622 111 Q 628 106 627 97 Z', '#a8d840', op(.75)) + '<path d="M622 120 c 2 3 2.6 5 2.6 6.4 a 2.6 2.6 0 0 1 -5.2 0 c 0 -1.4 .6 -3.4 2.6 -6.4 Z" fill="' + PHOS + '" opacity=".8"/>';
  s += Rc(4, 98, 18, sol - 98, S.lin([[0, '#141409'], [.5, TUYAU], [1, '#7a7858']], 0, 0, 1, 0), ' stroke="' + O + '" stroke-width="2"') + Rc(W - 24, 98, 18, sol - 98, S.lin([[0, '#141409'], [.5, TUYAU], [1, '#7a7858']], 0, 0, 1, 0), ' stroke="' + O + '" stroke-width="2"');
  /* la bouche du tuyau du milieu : un filet d'eau tombe dans la rigole */
  s += C(470, 128, 22, '#3a3826', ' stroke="' + O + '" stroke-width="3"') + C(470, 128, 15, '#030302') + L('M456 116 A 18 18 0 0 1 486 122', '#8a8860', 1.4, op(.5)) +
    L('M468 142 C 470 200 466 260 469 ' + (sol + 14), '#a8c8a0', 2.6, op(.35)) + L('M470 142 C 471 200 468 260 470 ' + (sol + 14), '#e8ffe0', 1, op(.4));
  /* les flèches gravées qui se contredisent (on s'y perd), et les traits de quelqu'un qui compte ses tours */
  var grav = function(x, y, a, l){ return fleche(x + 1, y + 1.5, a, l, '#030302', 5) + fleche(x, y, a, l, '#5a5838', 3.4) + fleche(x - .6, y - .8, a, l, CRAIE, 1.1, op(.45)); };
  s += grav(196, 126, 0, 50) + grav(796, 118, 180, 54) + grav(560, 168, -90, 38) + grav(910, 280, 90, 34) + grav(40, 300, -90, 32);
  s += fleche(640, 200, 200, 46, CRAIE, 2.2, op(.45)) + fleche(641, 202, 200, 46, CRAIE, 1, op(.3)) + L('M622 186 L 660 214 M660 186 L 622 214', '#c86a50', 2.4, op(.5));
  s += lueur(S, 700, 150, 46, 22, PHOS, .32) + fleche(700, 150, 0, 54, PHOS, 4, op(.85)) + fleche(700, 150, 0, 54, '#ffffe0', 1.4, op(.7));
  s += '<path d="M880 150 A 18 18 0 1 1 862 132" fill="none" stroke="' + CRAIE + '" stroke-width="2.2" opacity=".45" stroke-linecap="round"/>' + fleche(862, 132, -100, 12, CRAIE, 2.2, op(.45));
  s += L('M128 112 v 14 M134 112 v 14 M140 112 v 14 M146 112 v 14 M124 124 L 150 114', CRAIE, 1.6, op(.4)) + L('M262 112 v 14 M268 112 v 14 M274 112 v 14', CRAIE, 1.6, op(.35));
  /* une bouche d'égout tout en haut : un peu de lumière */
  s += faisceau(S, 640, 668, 590, 760, sol, '#f0ffc8', .14) + E(654, 2, 18, 6, '#e8f8c0', op(.6)) + grains(R, 18, 640, 668, 590, 760, sol, '#f4ffd8', 1.2, 70);
  /* de la boue qui luit dans les coins */
  [[30, sol - 6, 30], [930, sol - 6, 30], [300, 102, 14], [770, 102, 16]].forEach(function(b){ s += lueur(S, b[0], b[1], b[2] * 1.6, b[2] * .8, PHOS, .28); for(var k2 = 0; k2 < 8; k2++) s += C(b[0] + (R() - .5) * b[2] * 1.6, b[1] + (R() - .5) * b[2] * .4, .8 + R() * 1.5, '#d8ff8a', op(f1(.4 + R() * .4))); });
  /* le sol : un trottoir étroit, puis la rigole où coule une eau trouble (et un petit bateau en papier) */
  s += Rc(0, sol, W, H - sol, '#0e0e08') + Rc(0, sol, W, 10, S.lin([[0, '#4a4830'], [1, '#26241a']])) + L('M0 ' + (sol + 1.5) + ' H ' + W, '#8a8860', 1.6, op(.45));
  for(var q = 20; q < W; q += 60) s += L('M' + q + ' ' + sol + ' v 10', '#0e0e08', 2.4);
  s += Rc(0, sol + 10, W, 4, '#050503') + Rc(0, sol + 13, W, 12, S.lin([[0, '#3a4a20'], [1, '#141a0a']]));
  for(var w2 = 0; w2 < 30; w2++) s += L('M' + f1(R() * W) + ' ' + f1(sol + 15 + R() * 8) + ' h ' + f1(8 + R() * 22), '#a8c070', 1, op(f1(.15 + R() * .3)));
  s += Rc(0, sol + 25, W, H - sol - 25, S.lin([[0, '#2a2a1c'], [1, '#0a0a06']])) + L('M0 ' + (sol + 25.5) + ' H ' + W, '#5a5838', 1.2, op(.4));
  s += P('M290 ' + (sol + 18) + ' L 312 ' + (sol + 18) + ' L 306 ' + (sol + 23) + ' L 296 ' + (sol + 23) + ' Z', '#d8d0b0', ' stroke-width="1.4"') + P('M300 ' + (sol + 18) + ' L 301 ' + (sol + 9) + ' L 307 ' + (sol + 18) + ' Z', '#efe8d0', ' stroke-width="1.4"');
  s += E(470, sol + 19, 10, 2.6, 'none', ' stroke="#e8ffe0" stroke-width="1.2" opacity=".5"');
  s += brume(S, W, sol, '#b8c890', .13);
  return S.svg(W, H, s);
};
D.egouts.lumiere = function(W, H, sol){
  var S = new Scene('egl');
  return S.svg(W, H, F('M640 0 L 668 0 L 760 ' + sol + ' L 590 ' + sol + ' Z', '#e0f0a0', op(.07)) + E(700, 150, 60, 30, S.halo('#d4ff6a', .2)), 'mix-blend-mode:screen');
};
D.egouts.avantPlan = function(W, H, sol){
  var S = new Scene('ega'), N = '#030302', s = '';
  s += F('M0 ' + (H - 40) + ' L 36 ' + (H - 40) + ' C 52 ' + (H - 40) + ' 60 ' + (H - 30) + ' 60 ' + (H - 16) + ' L 60 ' + H + ' L 0 ' + H + ' Z', N) + Rc(0, H - 46, 40, 10, N) +
    F('M' + W + ' ' + (H - 34) + ' C ' + (W - 24) + ' ' + (H - 44) + ' ' + (W - 50) + ' ' + (H - 32) + ' ' + (W - 64) + ' ' + (H - 18) + ' L ' + (W - 70) + ' ' + H + ' L ' + W + ' ' + H + ' Z', N) +
    [[60, 22], [86, 14], [880, 26], [910, 18], [400, 10]].map(function(d){ return F('M' + (d[0] - 8) + ' 0 Q ' + d[0] + ' ' + (d[1] + 8) + ' ' + (d[0] + 8) + ' 0 Z', N) + C(d[0], d[1] + 8, 2.6, N); }).join('');
  return S.svg(W, H, s);
};
D.egouts.vignette = function(W, H){ return vign('egv', W, H, '#030401'); };

/* ---------- La fausse crypte (sarcophage, statues brisées, poussière) ---------- */
D.crypte = {nom: 'La fausse crypte', monstres: '2 chauves-souris'};
D.crypte.decor = function(W, H, sol){
  var S = new Scene('cr'), R = rng(113), s = '';
  var PIERRE = '#5c5e64', OR = '#ffe2a8', FIL = '#cfcac0';
  s += murPierres(S, R, W, H, sol, {g: ['#08080a', '#1c1d21', '#161719'], bw: 40, bh: 20, joint: '#050506', trait: '#4a4a52', ombre: '#030304', clair: '#323338', sombre: '#060607', pc: .32, ps: .4});
  s += fissures([[40, 40], [600, 200], [700, 40], [890, 150], [250, 200]], '#040405');
  /* les plaques gravées (on ne lit plus les noms) et deux niches à urne */
  [[150, 56], [810, 56]].forEach(function(p){
    s += Rc(p[0] - 36, p[1] - 18, 72, 38, '#2a2b30', ' stroke="' + O + '" stroke-width="2.5"') + Rc(p[0] - 31, p[1] - 13, 62, 28, 'none', ' stroke="#46474e" stroke-width="1.4"') +
      [0, 1, 2].map(function(i){ return L('M' + (p[0] - 24) + ' ' + (p[1] - 5 + i * 7) + ' h ' + (40 - i * 8), '#4e4f56', 1.6, op(.7)); }).join('') + L('M' + (p[0] + 34) + ' ' + (p[1] - 17) + ' V ' + (p[1] + 19), '#8a8a90', 1, op(.35));
  });
  [[262, 70], [700, 70]].forEach(function(n){
    s += '<path d="M' + (n[0] - 16) + ' ' + (n[1] + 24) + ' V ' + (n[1] - 4) + ' C ' + (n[0] - 16) + ' ' + (n[1] - 24) + ' ' + (n[0] + 16) + ' ' + (n[1] - 24) + ' ' + (n[0] + 16) + ' ' + (n[1] - 4) + ' V ' + (n[1] + 24) + ' Z" fill="#060607" stroke="#3a3b40" stroke-width="4"/>' +
      P('M' + (n[0] - 7) + ' ' + (n[1] + 22) + ' C ' + (n[0] - 11) + ' ' + (n[1] + 10) + ' ' + (n[0] - 8) + ' ' + n[1] + ' ' + (n[0] - 3) + ' ' + (n[1] - 1) + ' L ' + (n[0] - 4) + ' ' + (n[1] - 5) + ' L ' + (n[0] + 4) + ' ' + (n[1] - 5) + ' L ' + (n[0] + 3) + ' ' + (n[1] - 1) + ' C ' + (n[0] + 8) + ' ' + n[1] + ' ' + (n[0] + 11) + ' ' + (n[1] + 10) + ' ' + (n[0] + 7) + ' ' + (n[1] + 22) + ' Z', '#4a4440', ' stroke-width="2"') + L('M' + (n[0] + 3) + ' ' + (n[1] + 2) + ' Q ' + (n[0] + 7) + ' ' + (n[1] + 8) + ' ' + (n[0] + 5) + ' ' + (n[1] + 16), '#a8a090', 1, op(.5));
  });
  /* l'abside : au fond, sur une estrade, le sarcophage fermé ; la lumière tombe dessus */
  var abside = Rc(360, 0, 240, sol, S.lin([[0, '#040405'], [.6, '#0c0c0e'], [1, '#141310']])) + lueur(S, 480, 300, 110, 44, '#ffe2a8', .18) +
    C(480, 112, 34, 'none', ' stroke="#c8a868" stroke-width="1.6" opacity=".2"') + L('M466 104 l 14 -14 l 14 14 l -14 14 Z M480 90 V 134', '#c8a868', 1.4, op(.18));
  var gS = S.lin([[0, '#7a7a80'], [.5, '#505258'], [1, '#222328']], 1, 0, 0, 1);
  abside += P('M372 ' + sol + ' L 372 318 L 588 318 L 588 ' + sol + ' Z', '#2e2f34') + L('M374 319.5 H 586', '#a8a49a', 1.4, op(.45)) +
    P('M390 318 L 390 304 L 570 304 L 570 318 Z', '#36373c') + L('M392 305.5 H 568', '#c8c0b0', 1.4, op(.5)) +
    P('M404 304 L 404 266 L 556 266 L 556 304 Z', gS) + Rc(414, 274, 40, 24, 'none', ' stroke="#2a2b30" stroke-width="2"') + Rc(506, 274, 40, 24, 'none', ' stroke="#2a2b30" stroke-width="2"') + C(480, 285, 8, 'none', ' stroke="#2a2b30" stroke-width="2"') +
    P('M398 268 L 398 258 L 562 258 L 562 268 Z', S.lin([[0, '#a8a8ae'], [1, '#4a4b50']])) + L('M400 259.5 H 560', '#efe6d0', 1.4, op(.6)) +
    P('M418 258 C 418 250 428 246 434 248 C 440 244 452 244 456 248 L 530 248 C 538 246 544 250 546 258 Z', '#7a7a80', ' stroke-width="2"') + C(428, 250, 6.5, '#8a8a90', ' stroke="' + O + '" stroke-width="2"') + L('M474 252 l 8 -4 l 8 4', '#4a4b50', 1.4) +
    L('M418 257 C 450 255 520 255 546 257', '#f4ead4', 1.4, op(.55)) + C(508, 249, 1.8, OR, op(.9));
  for(var p = 0; p < 18; p++) abside += C(400 + R() * 160, 258 + R() * 3, .8 + R() * 1.4, '#d8d0bc', op(f1(.3 + R() * .4)));
  s += arche(S, 480, 236, 160, sol, {trou: '#040405', joint: '#040405', pierre: '#34363c', cle: '#44464c', ep: 13}, abside);
  /* deux colonnes cannelées de part et d'autre */
  [352, 608].forEach(function(x){
    s += Rc(x - 13, 40, 26, sol - 40, S.lin([[0, '#4a4b52'], [.55, '#2e2f34'], [1, '#18191c']], 1, 0, 0, 0), ' stroke="' + O + '" stroke-width="2.5"') + L('M' + (x - 6) + ' 60 V ' + (sol - 24) + ' M' + x + ' 60 V ' + (sol - 24) + ' M' + (x + 6) + ' 60 V ' + (sol - 24), '#16171a', 1.4) +
      P('M' + (x - 20) + ' 40 L ' + (x + 20) + ' 40 L ' + (x + 16) + ' 54 L ' + (x - 16) + ' 54 Z', '#3e4046') + P('M' + (x - 19) + ' ' + (sol - 20) + ' L ' + (x + 19) + ' ' + (sol - 20) + ' L ' + (x + 19) + ' ' + sol + ' L ' + (x - 19) + ' ' + sol + ' Z', '#34363c');
  });
  /* le rai de lumière par une fente de la voûte, et beaucoup de poussière dorée */
  s += F('M466 0 L 506 0 L 498 6 L 474 6 Z', '#030304') + faisceau(S, 470, 502, 396, 576, 304, '#fff0d0', .22) + grains(R, 60, 470, 502, 396, 576, 304, '#ffe8c0', 1.3);
  /* les statues brisées : un ange sans tête à gauche, un chevalier coupé en deux à droite */
  var gT = S.lin([[0, '#7a7c82'], [.5, '#4a4c52'], [1, '#1e1f22']], 1, 0, 0, 1);
  s += P('M-4 300 L 70 300 L 70 ' + sol + ' L -4 ' + sol + ' Z', '#2a2b30') + L('M-2 301.5 H 68', '#8a8a90', 1.2, op(.4)) +
    P('M22 172 C 6 160 -2 132 4 102 C 8 116 12 124 18 130 C 12 134 12 142 18 148 C 14 152 16 160 26 166 Z', gT) + L('M6 118 Q 12 124 16 132 M8 136 Q 13 142 18 148', '#26272c', 1.4) +
    P('M14 300 C 12 262 14 222 20 192 L 26 166 L 50 166 L 56 192 C 62 222 64 262 60 300 Z', gT) + P('M26 166 L 29 159 L 33 164 L 37 157 L 41 163 L 45 158 L 50 166 Z', '#5a5c62', ' stroke-width="2"') +
    P('M22 196 C 30 204 46 204 56 196 L 54 208 C 46 214 30 214 24 208 Z', '#5a5c62', ' stroke-width="2"') + L('M26 222 C 28 250 26 276 24 296 M38 216 C 40 246 40 272 40 296 M50 222 C 52 250 54 276 54 296', '#26272c', 1.6) + L('M52 172 C 56 190 58 200 58 210', '#a8aab0', 1.2, op(.4));
  s += P('M890 296 L 964 296 L 964 ' + sol + ' L 890 ' + sol + ' Z', '#2a2b30') + L('M892 297.5 H 962', '#8a8a90', 1.2, op(.4)) +
    P('M904 296 L 908 236 L 916 216 L 924 222 L 930 212 L 938 220 L 946 214 L 950 236 L 954 296 Z', gT) + L('M928 236 V 294', '#26272c', 1.6) +
    P('M958 296 L 956 150 L 962 150 L 964 296 Z', '#5a5c62', ' stroke-width="2"') + P('M948 156 L 970 156 L 970 162 L 948 162 Z', '#6a6c72', ' stroke-width="2"');
  /* des toiles dans les coins et contre la colonne */
  s += toile(R, 36, 26, 96, 0, Math.PI * 2, 12, 6, FIL, .26, .15, true) + toile(R, 924, 24, 100, 0, Math.PI * 2, 12, 6, FIL, .24, .15, true) + toile(R, 372, 76, 30, -Math.PI / 2, Math.PI, 7, 3, FIL, .2, .1);
  /* une faible lueur froide de lichen sur les bords */
  [[16, 120, 20], [944, 260, 20], [600, 330, 12]].forEach(function(l){ s += lueur(S, l[0], l[1], l[2] * 1.6, l[2], '#8fd8d0', .22); for(var k = 0; k < 7; k++) s += C(l[0] + (R() - .5) * l[2] * 1.4, l[1] + (R() - .5) * l[2] * .6, .8 + R() * 1.3, '#bff0e8', op(f1(.4 + R() * .4))); });
  /* le sol couvert de poussière ; une tête de statue tombée, des débris, de petites traces de pas */
  s += sol_(S, W, H, sol, '#3c3a36', '#100f0e', '#0a0a0a', [120, 300, 660, 840], 15) + Rc(0, sol, W, 8, S.lin([[0, '#8a8478', .25], [1, '#8a8478', 0]]));
  s += Pw(TS('M-20 2 L -21 -6 C -21 -9 -19 -11 -16 -12 L -15 -15 L -12 -16 L -11 -19 C -9 -21 -7 -25 -4 -28 C -2 -26 -1 -23 0 -21 C 4 -23 10 -25 16 -23 C 24 -19 28 -9 24 0 L 20 3 Z', 472, sol, 1), gT, 2.4) +
    L(TS('M-20 2 L -16 -2 L -12 3 L -6 -1 L 0 4', 472, sol, 1), '#16171a', 1.6) + L(TS('M2 -18 Q 5 -16 8 -18 M14 -10 C 18 -12 20 -8 17 -5 M-14 -10 L -10 -11', 472, sol, 1), '#26272c', 1.5) +
    L(TS('M6 -24 C 14 -26 22 -20 24 -12', 472, sol, 1), '#d8d4cc', 1.2, op(.5)) + L(TS('M8 -6 l 4 4 l -2 4', 472, sol, 1), '#16171a', 1.2) + E(486, sol - 2, 6, 2.5, '#4a6a50', op(.5));
  [[250, sol + 8, 9], [274, sol + 12, 6], [640, sol + 24, 8], [720, sol + 10, 7], [40, sol + 22, 8], [820, sol + 20, 6]].forEach(function(b){ s += E(b[0], b[1], b[2], b[2] * .6, '#3a3b40', ' stroke="' + O + '" stroke-width="2.2"'); });
  [[540, 20], [566, 14], [592, 21], [618, 15], [644, 22]].forEach(function(t, i){ s += E(t[0], sol + t[1], 3.4, 1.8, '#08080a', op(.5)) + E(t[0] + 5, sol + t[1] + (i % 2 ? 2 : -2), 3, 1.6, '#08080a', op(.45)); });
  s += brume(S, W, sol, '#c8c0b0', .14);
  return S.svg(W, H, s);
};
D.crypte.lumiere = function(W, H, sol){
  var S = new Scene('crl');
  return S.svg(W, H, F('M470 0 L 502 0 L 576 304 L 396 304 Z', '#f0dcb0', op(.09)) + E(480, 262, 90, 20, S.halo('#fff0d0', .28)), 'mix-blend-mode:screen');
};
D.crypte.avantPlan = function(W, H, sol){
  var S = new Scene('cra'), N = '#040405', R = rng(3), s = '';
  s += F('M0 ' + (H - 34) + ' C 20 ' + (H - 50) + ' 50 ' + (H - 42) + ' 66 ' + (H - 24) + ' L 74 ' + H + ' L 0 ' + H + ' Z', N) + Rc(56, H - 26, 40, 26, N, ' transform="rotate(-8 76 ' + (H - 13) + ')"') +
    F('M' + W + ' ' + (H - 40) + ' C ' + (W - 26) + ' ' + (H - 54) + ' ' + (W - 54) + ' ' + (H - 36) + ' ' + (W - 70) + ' ' + (H - 20) + ' L ' + (W - 76) + ' ' + H + ' L ' + W + ' ' + H + ' Z', N) +
    toile(R, W + 6, -6, 120, Math.PI / 2, Math.PI, 6, 5, '#d8d4cc', .16, .2) + L('M30 0 L 34 40 M34 40 l -6 8 m 6 -8 l 6 8', '#0a0a0c', 1.6);
  return S.svg(W, H, s);
};
D.crypte.vignette = function(W, H){ return vign('crv', W, H, '#040405'); };

/* =====================================================================
   4. L'export
   ===================================================================== */
var IDS = ['canaux', 'toiles', 'atelier', 'ossuaire', 'bassin', 'egouts', 'crypte'];
var DECORS = {ids: IDS, REPERES: REPERES, MARGELLE: MARGELLE};
IDS.forEach(function(id){ DECORS[id] = D[id]; });
/* les quatre couches empilées, prêtes à photographier (c'est ce que fait rendre.py) */
DECORS.tout = function(id, W, H, sol){
  var d = D[id];
  return '<div style="position:relative;width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:#000">' + d.decor(W, H, sol) + d.lumiere(W, H, sol) + d.avantPlan(W, H, sol) + d.vignette(W, H) + '</div>';
};
global.DECORS = DECORS;
})(typeof window !== 'undefined' ? window : this);
