/* multiplan.js — LE BANC-TITRE : des films en 2D, faits de calques peints posés à des profondeurs différentes (Bible §13.68).
   Romain, 18 novembre : « pas de 3D […] que ça reste de la 2D, mais avec des jolies profondeurs de champ […] les éclairages, c'est
   vraiment la clé ». Ici, donc, aucun décor en 3D : comme au cinéma d'animation d'autrefois, des calques plats, du plus loin au plus
   près, que la caméra fait glisser à des vitesses différentes (la profondeur), que le point net floute plus ou moins (la profondeur
   de champ), et que les lumières (torche, lanterne, cristal, lune) éclairent une par une (un filtre de lumière par calque : la
   pierre prend du relief, ce qui est devant la lumière reste en silhouette).

   Un film de ce genre déclare « rendu:'multiplan' » et une liste de PLANS (film-descente.js). Un plan :
     {id, t0, t1, monter(S), etat(S, tl), acteurs(S, tl, E), dessin(S, tl, E)}
   - monter(S)  : fabrique les calques du plan (S.couche) et ses héros — une fois, quand on entre dans le plan ;
   - etat(S, tl): la caméra, la lumière d'ambiance, le fondu : {cam:{x, y, z, zoom, focus, ap}, amb:[r, v, b], fondu} ;
   - acteurs    : pose les héros (rejoué depuis le début du plan quand on saute dans le film : les tissus sont simulés) ;
   - dessin     : le reste de l'image ; rend {lum:[les lumières]} ; dessine les flammes, les halos, les bêtes…

   Les unités : celles de l'écran quand la caméra est au repos (x = y = z = 0, zoom = 1) — 1440 × 616, le milieu de l'image en (0, 0).
   Un calque à la profondeur d (1000 = le plan des héros ; plus grand = plus loin) glisse d'autant moins que d est grand.
   Tout est DÉTERMINISTE (une image ne dépend que de son temps), comme le reste de l'atelier. */
(function(){
'use strict';
var U = window.CU, W = 1440, H = 616, D0 = 1000, MG = 72, NS = 'http://www.w3.org/2000/svg';
var MP = window.MP = {W:W, H:H, D0:D0};
var racine = null, defsEl = null, courant = null, S = null;

function r2(v){ return Math.round(v * 100) / 100; }
function coul(c, k){ k = k == null ? 1 : k; return 'rgb(' + Math.round(U.clamp(c[0] * k, 0, 255)) + ',' + Math.round(U.clamp(c[1] * k, 0, 255)) + ',' + Math.round(U.clamp(c[2] * k, 0, 255)) + ')'; }
MP.coul = coul;

function init(){
  if(racine) return;
  var film = document.getElementById('film');
  var st = document.createElement('style');
  st.textContent = '#mp{position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:#000;isolation:isolate}' +
    '#mp .mpe{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;pointer-events:none}' +
    '#mp .mpw{position:absolute;left:0;top:0;width:' + (W + 2 * MG) + 'px;height:' + (H + 2 * MG) + 'px;overflow:hidden;pointer-events:none}' +
    '#mp .mpl{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}#mp .mpl>*{position:absolute}' +
    '#mp svg.mpd{left:0;top:0;width:1px;height:1px;overflow:visible}';
  document.head.appendChild(st);
  racine = document.createElement('div'); racine.id = 'mp';
  film.appendChild(racine);
  var s = document.createElementNS(NS, 'svg'); s.setAttribute('width', 0); s.setAttribute('height', 0); s.style.cssText = 'position:absolute;left:0;top:0';
  defsEl = document.createElementNS(NS, 'defs'); s.appendChild(defsEl); film.appendChild(s);
  MP.racine = racine;
}

/* une toile peinte : w × h (unités du calque), à la finesse e (points par unité) ; fn(g, w, h) peint en unités du calque */
MP.toile = function(w, h, e, fn){
  var c = document.createElement('canvas'); e = e || 1;
  c.width = Math.max(2, Math.round(w * e)); c.height = Math.max(2, Math.round(h * e));
  c.style.width = w + 'px'; c.style.height = h + 'px';
  var g = c.getContext('2d'); g.scale(e, e);
  if(fn) fn(g, w, h);
  return c;
};

/* ---------------------------------------------------------------- LE PLATEAU D'UN PLAN : ses calques */
function Scene(){ this.couches = []; this.par = {}; this.heros = []; this.dernier = null; }
/* o = {d (profondeur), k (taille d'une unité du calque, d / 1000 par défaut), lum:'lum' | 'alpha' | 0 (comment la lumière l'éclaire),
        sc (le relief), ecran (calque de lumière : il s'ajoute), flou (en plus), net (jamais flou), ambK (part de l'ambiance), op} */
Scene.prototype.couche = function(id, o){
  /* (trois boîtes : « ext » remet le calque à sa taille quand il est peint en plus petit — voir « LA FINESSE » ; « w » porte le filtre
     de lumière et de flou ; « l » porte la caméra) */
  var ext = document.createElement('div'); ext.className = 'mpe';
  var w = document.createElement('div'); w.className = 'mpw'; ext.appendChild(w);
  var l = document.createElement('div'); l.className = 'mpl'; w.appendChild(l); racine.appendChild(ext);
  if(o.ecran) ext.style.mixBlendMode = 'screen';
  if(o.op != null) ext.style.opacity = o.op;
  var c = {id:id, d:o.d, k:o.k || o.d / D0, lum:o.lum || 0, sc:o.sc, ecran:!!o.ecran, flou:o.flou || 0, net:!!o.net, ambK:o.ambK == null ? 1 : o.ambK, lumK:o.lumK == null ? 1 : o.lumK,
    fixe:!!o.fixe, spec:o.spec || 0, ext:ext, w:w, l:l, dyn:null, o:o, q:1, zx:-MG, zy:-MG, zone:o.zone || null};
  c.poser = function(el, x, y){ el.style.left = x + 'px'; el.style.top = y + 'px'; l.appendChild(el); return el; };
  c.svg = function(html){
    if(!c.dyn){ c.dyn = document.createElementNS(NS, 'svg'); c.dyn.setAttribute('class', 'mpd'); l.appendChild(c.dyn); }
    c.dyn.innerHTML = html;
  };
  this.couches.push(c); this.par[id] = c;
  return c;
};
MP.Scene = Scene;

/* l'échelle d'un calque à l'écran (une unité du monde, à sa profondeur → des points d'écran) */
function echelle(c, cam){ return c.fixe ? 1 : cam.zoom * D0 / Math.max(60, c.d - cam.z); }
/* où tombe à l'écran un point du monde (X, Y) posé à la profondeur d */
MP.ecran = function(X, Y, d, cam){ var s = cam.zoom * D0 / Math.max(60, d - cam.z); return {x:W / 2 + s * (X - cam.x), y:H / 2 + s * (Y - cam.y), s:s}; };
/* l'inverse : le point du monde, à la profondeur d, qui tombe en (sx, sy) à l'écran */
MP.monde = function(sx, sy, d, cam){ var s = cam.zoom * D0 / Math.max(60, d - cam.z); return {x:cam.x + (sx - W / 2) / s, y:cam.y + (sy - H / 2) / s}; };
/* le flou (en points d'écran) d'une chose à la profondeur d */
MP.flou = function(d, cam){ var dist = Math.max(60, d - cam.z); return U.clamp((cam.ap == null ? 1 : cam.ap) * 15 * Math.abs(dist - cam.focus) / dist, 0, 44); };

/* ---------------------------------------------------------------- LA LUMIÈRE D'UN CALQUE (un filtre SVG, à l'écran)
   Une lumière : {x, y, d (dans le monde), c:[r, v, b], k (sa force), r (sa portée : 160 par défaut), z (sa hauteur mini au-dessus du calque)}.
   Sur un calque : un rond de lumière qui s'éteint comme une vraie lampe ((h / distance)³), plus large et plus faible quand le calque
   est loin derrière elle ; un calque DEVANT la lumière n'est presque pas éclairé (il reste en silhouette). Le relief : la clarté de
   la peinture sert de carte des hauteurs (les joints sombres se creusent), ou, pour les personnages, leur silhouette floutée. */
function filtre(id, c, cam, lums, amb, flou){
  var q = c.q, s = echelle(c, cam) / q, f = '<filter id="' + id + '" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">';
  var sc = c.sc == null ? (c.lum === 'lum' ? 4 : 8) : c.sc;
  if(c.lum === 'lum') f += '<feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="h0"/><feGaussianBlur in="h0" stdDeviation="' + r2(Math.max(.7 / q, .9 * s)) + '" result="h"/>';
  else if(c.lum === 'mix') f += '<feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="h0"/><feGaussianBlur in="h0" stdDeviation="' + r2(Math.max(.6, .8 * s)) + '" result="h1"/>' +
    '<feGaussianBlur in="SourceAlpha" stdDeviation="' + r2(Math.max(2, 5 * s)) + '" result="h2"/><feComposite in="h1" in2="h2" operator="arithmetic" k1="0" k2=".3" k3=".7" k4="0" result="h"/>';
  else f += '<feGaussianBlur in="SourceAlpha" stdDeviation="' + r2(Math.max(2 / q, 7 * s)) + '" result="h"/>';
  f += '<feFlood flood-color="' + coul(amb, c.ambK) + '" result="s0"/>';
  var n = 0, specs = '';
  lums.forEach(function(L){
    var dz = L.d - c.d, devant = dz > 0 ? U.clamp(1 - dz / (L.derriere || 140), 0, 1) : 1;      /* (dz > 0 : la lumière est derrière ce calque) */
    var h = Math.max(L.z || 150, Math.abs(dz)), r = L.r || 220, att = Math.min(1, 1.6 * r * r / (r * r + h * h)), k = L.k * att * devant * c.lumK * (c.lk == null ? 1 : c.lk);
    if(L.seul && L.seul.indexOf(c.id) < 0) return;
    if(L.sauf && L.sauf.indexOf(c.id) >= 0) return;
    if(k < .025) return;
    var p = MP.ecran(L.x, L.y, c.d, cam), x = r2((p.x - c.zx) / q), y = r2((p.y - c.zy) / q), z = r2(Math.max(8 / q, h * s * (L.zk || 1)));
    f += '<feDiffuseLighting in="h" surfaceScale="' + r2(sc * Math.max(.5, s)) + '" diffuseConstant="' + r2(k) + '" lighting-color="' + coul(L.c) + '" result="d' + n + '">' +
      '<feSpotLight x="' + x + '" y="' + y + '" z="' + z + '" pointsAtX="' + x + '" pointsAtY="' + y + '" pointsAtZ="0" specularExponent="' + (L.e == null ? 2 : L.e) + '"/></feDiffuseLighting>' +
      '<feComposite in="s' + n + '" in2="d' + n + '" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="s' + (n + 1) + '"/>';
    /* le liseré : la lumière accroche le bord des personnages */
    if(c.spec && L.rim !== 0 && devant > 0) specs += '<feSpecularLighting in="h" surfaceScale="' + r2(sc * Math.max(.5, s)) + '" specularConstant="' + r2(c.spec * Math.min(1.6, k) * (L.rim || 1)) + '" specularExponent="11" lighting-color="' + coul(L.c) + '" result="p' + n + '">' +
      '<fePointLight x="' + x + '" y="' + y + '" z="' + r2(Math.max(14 / q, z * .5)) + '"/></feSpecularLighting><feComposite in="p' + n + '" in2="SourceAlpha" operator="in" result="q' + n + '"/>';
    n++;
  });
  f += '<feComposite in="SourceGraphic" in2="s' + n + '" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="o0"/>';
  var der = 'o0', m = 0;
  if(specs){
    f += specs;
    for(var i = 0; i < n; i++) if(specs.indexOf('result="q' + i + '"') >= 0){ f += '<feComposite in="' + der + '" in2="q' + i + '" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="o' + (++m) + '"/>'; der = 'o' + m; }
  }
  if(flou > .35) f += '<feGaussianBlur in="' + der + '" stdDeviation="' + r2(flou / q) + '"/>';
  return f + '</filter>';
}

/* ---------------------------------------------------------------- LES LUMIÈRES QU'ON VOIT (calques « écran ») */
var DEFS_FIXES = (function(){
  function halo(id, stops){ return '<radialGradient id="' + id + '">' + stops.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '" stop-opacity="' + s[2] + '"/>'; }).join('') + '</radialGradient>'; }
  return halo('mpHChaud', [[0, '#fff3c8', 1], [.12, '#ffc46a', .75], [.4, '#ff8a2a', .28], [.75, '#ff6a1a', .07], [1, '#ff5a10', 0]]) +
    halo('mpHFroid', [[0, '#f2fdff', 1], [.14, '#9fe8ff', .7], [.45, '#3fa8ff', .24], [.8, '#2a6aff', .05], [1, '#2a5aff', 0]]) +
    halo('mpHLune', [[0, '#e8f0ff', .9], [.3, '#a8c0f0', .4], [.7, '#6a88d0', .1], [1, '#5a78c0', 0]]) +
    halo('mpHRune', [[0, '#f0ffff', 1], [.16, '#8ff3ff', .7], [.5, '#2fd0e0', .22], [1, '#1fb0d0', 0]]) +
    halo('mpHRouge', [[0, '#fff0e0', 1], [.25, '#ff5a3a', .9], [.6, '#e01a10', .3], [1, '#c00000', 0]]) +
    halo('mpHBlanc', [[0, '#ffffff', 1], [.5, '#ffffff', .35], [1, '#ffffff', 0]]) +
    halo('mpHNoir', [[0, '#000', .85], [.55, '#000', .45], [1, '#000', 0]]) +
    '<filter id="mpF1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>' +
    '<filter id="mpF3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>' +
    '<filter id="mpF6" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6"/></filter>' +
    '<filter id="mpF14" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>';
})();
MP.halo = function(x, y, r, sorte, op){ return '<circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r) + '" fill="url(#mpH' + (sorte || 'Chaud') + ')" opacity="' + r2(op == null ? 1 : op) + '"/>'; };
/* comment la flamme vacille (0,75 → 1,2), la même pour la lumière et pour le dessin */
MP.vacille = function(t, g){ return 1 + .13 * U.fbm(t * 7.3, 11 + (g || 0) * 3.7, 3) + .05 * U.bruit(t * 23, 41 + (g || 0)); };
/* une flamme (sa base en x, y ; elle monte) : trois langues l'une dans l'autre, qui dansent ; des étincelles qui montent */
MP.flamme = function(x, y, taille, t, g, o){
  o = o || {}; g = g || 0;
  var penche = (o.penche || 0) + U.fbm(t * 2.1, 5 + g, 2) * .18, v = MP.vacille(t, g), s = '';
  function langue(k, larg, haut, c, op){
    var hh = haut * taille * (v + U.fbm(t * 9 + k, 20 + g + k, 2) * .16), l = larg * taille, dx = penche * hh + U.fbm(t * 11 + k * 3, 30 + g, 2) * taille * .16;
    var px = x + dx, py = y - hh, w1 = U.fbm(t * 13, 60 + g + k, 2) * l * .25;
    return '<path d="M' + r2(x - l) + ' ' + r2(y) + ' C ' + r2(x - l * 1.25 + w1) + ' ' + r2(y - hh * .4) + ' ' + r2(px - l * .25) + ' ' + r2(py + hh * .35) + ' ' + r2(px) + ' ' + r2(py) +
      ' C ' + r2(px + l * .3) + ' ' + r2(py + hh * .4) + ' ' + r2(x + l * 1.2 + w1) + ' ' + r2(y - hh * .35) + ' ' + r2(x + l) + ' ' + r2(y) + ' Q ' + r2(x) + ' ' + r2(y + l * .7) + ' ' + r2(x - l) + ' ' + r2(y) + ' Z" fill="' + c + '" opacity="' + op + '"/>';
  }
  s += '<g filter="url(#mpF3)">' + langue(0, .5, 2.1, '#ff5a14', .75) + '</g>';
  s += '<g filter="url(#mpF1)">' + langue(1, .4, 1.7, '#ff9a2a', .95) + langue(2, .27, 1.2, '#ffd65a', 1) + langue(3, .15, .7, '#fff6d8', 1) + '</g>';
  if(o.etincelles !== 0) for(var i = 0; i < 5; i++){
    var ph = ((t * (.5 + i * .07) + i * .37 + g * .13) % 1 + 1) % 1, ex = x + penche * taille * 3 * ph + U.bruit(t * 2 + i * 9, g + i) * taille * (.5 + ph), ey = y - taille * (1.4 + ph * 4.2);
    s += '<circle cx="' + r2(ex) + '" cy="' + r2(ey) + '" r="' + r2(taille * .07 * (1.2 - ph)) + '" fill="#ffd27a" opacity="' + r2((1 - ph) * .9) + '"/>';
  }
  return s;
};
/* un rond de lumière floue (une luciole, une lanterne au loin, un œil dans le noir) : plus il est flou, plus il est grand et pâle */
MP.bokeh = function(x, y, r0, flou, c, op){
  var r = r0 + flou * .9, a = U.clamp(op * r0 * r0 / (r * r) * 2.2, 0, 1);
  return flou > 1.5 ? '<circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r) + '" fill="' + c + '" opacity="' + r2(a * .8) + '"/><circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r) + '" fill="none" stroke="' + c + '" stroke-width="' + r2(Math.max(.6, r * .09)) + '" opacity="' + r2(a) + '"/>'
    : '<circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r0 * 2.4) + '" fill="' + c + '" opacity="' + r2(op * .25) + '"/><circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r0) + '" fill="' + c + '" opacity="' + r2(op) + '"/>';
};

/* la poussière dans l'air : des grains qui dérivent, à toutes les profondeurs ; ils brillent près des lumières (dessinés à l'écran) */
MP.poussiere = function(t, cam, lums, o){
  o = o || {};
  var n = o.n || 150, R = U.hasard(o.graine || 77), s = '', lw = lums.map(function(L){ var p = MP.ecran(L.x, L.y, L.d, cam); return {x:p.x, y:p.y, r:(L.r || 160) * p.s * 1.9, c:L.c, k:L.k}; });
  for(var i = 0; i < n; i++){
    var d = 420 + R() * 1100, X0 = (R() - .5) * 3400, Y0 = (R() - .5) * 1500, vx = (R() - .5) * 14, vy = -3 - R() * 9, ph = R() * 9, taille = .7 + R() * 1.5;
    var X = X0 + vx * t + Math.sin(t * .5 + ph) * 16 + (o.x0 || 0), Y = Y0 + vy * t + Math.cos(t * .37 + ph * 2) * 12 + (o.y0 || 0);
    /* (le nuage de grains suit la caméra : il est sans fin) */
    X = cam.x + ((((X - cam.x) % 3400) + 3400 + 1700) % 3400) - 1700; Y = cam.y + ((((Y - cam.y) % 1500) + 1500 + 750) % 1500) - 750;
    var p = MP.ecran(X, Y, d, cam);
    if(p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) continue;
    var lu = o.fond || 0, cr = 0, cv = 0, cb = 0;
    lw.forEach(function(L){ var dd = Math.hypot(p.x - L.x, p.y - L.y), k = L.k * Math.pow(U.clamp(1 - dd / L.r, 0, 1), 1.6); lu += k; cr += L.c[0] * k; cv += L.c[1] * k; cb += L.c[2] * k; });
    if(lu < .03) continue;
    var c = lu > (o.fond || 0) + .001 && cr + cv + cb > 0 ? 'rgb(' + Math.round(U.clamp(cr / lu * 1.15 + 30, 0, 255)) + ',' + Math.round(U.clamp(cv / lu * 1.15 + 30, 0, 255)) + ',' + Math.round(U.clamp(cb / lu * 1.15 + 30, 0, 255)) + ')' : (o.c || '#c8d8ff');
    var tw = .6 + .4 * Math.sin(t * (1.3 + ph * .2) + ph * 5);
    s += MP.bokeh(p.x, p.y, taille * Math.max(.6, p.s), MP.flou(d, cam) * .7, c, U.clamp(lu * tw * (o.k || .8), 0, .95));
  }
  return s;
};

/* ---------------------------------------------------------------- UNE IMAGE */
function demonter(){
  if(S){ S.heros.forEach(function(a){ try{ a.h.detruire(); }catch(e){} }); }
  while(racine.firstChild) racine.removeChild(racine.firstChild);
  S = null; courant = null;
}
MP.image = function(F, t){
  init();
  var P = null, i;
  for(i = 0; i < F.plans.length; i++) if(t >= F.plans[i].t0 - 1e-6 && t < F.plans[i].t1 - 1e-6){ P = F.plans[i]; break; }
  if(!P) P = F.plans[F.plans.length - 1];
  var cle = P.cle || P.id;
  if(courant !== cle){
    demonter();
    S = new Scene(); S.F = F;
    P.monter(S);
    /* les deux calques communs : l'air (la poussière, les lumières devant tout) et le fondu */
    S.air = S.couche('air', {d:1, fixe:1, ecran:1, net:1});
    S.voile = document.createElement('div'); S.voile.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;background:#000;opacity:0';
    racine.appendChild(S.voile);
    courant = cle;
  }
  var dt = 1 / 30, tl = t - P.t0;
  /* les tissus des héros sont simulés pas à pas : si on n'arrive pas de l'image d'avant, on rejoue le plan depuis son début */
  var suite = S.dernier && S.dernier.plan === P && Math.abs(t - (S.dernier.t + dt)) < 1e-4;
  if(!suite && S.heros.length && P.acteurs){
    S.heros.forEach(function(a){ window.HF.reinit(a); });
    for(var tt = Math.max(0, tl - 2.5); tt < tl - 1e-6; tt += dt){
      var E0 = P.etat(S, tt);
      P.acteurs(S, tt, E0); S.heros.forEach(function(a){ window.HF.simuler(a, dt, tt); });
    }
  }
  /* dans l'ordre : l'état (la caméra), les héros posés, la boîte et la finesse de chaque calque, la caméra sur les calques, les tissus,
     et seulement alors le dessin (il mesure à l'écran où sont la flamme, la lampe, le cristal : tout doit être en place) */
  var E = P.etat(S, tl), cam = Object.assign({x:0, y:0, z:0, zoom:1, roll:0, focus:1000, ap:1}, E.cam);
  if(P.acteurs) P.acteurs(S, tl, E);
  S.dernier = {plan:P, t:t};
  S.cam = cam; S.t = t;
  /* LA FINESSE ET LA BOÎTE DE CHAQUE CALQUE (pour filmer plus vite, sans rien changer à l'image) : un calque flou est peint en plus
     petit (2, 3 ou 4 fois) puis remis à sa taille — le flou cache la différence ; un calque qui n'occupe qu'un coin de l'image
     (les héros, le puits) n'est éclairé que dans ce coin. */
  S.couches.forEach(function(c){
    var fl = c.net ? c.flou : MP.flou(c.d, cam) + c.flou;
    c.q = fl > 9 ? 4 : fl > 5 ? 3 : fl > 2.4 ? 2 : 1;
    var z = c.zone, b = [-MG, -MG, W + MG, H + MG];
    if(!z && S.heros.length && S.heros[0].couche === c){
      z = null;
      S.heros.forEach(function(a){ if(!a.P || a.P.cache) return; var e = a.ech, r = [a.x - 190 * e, a.y - 350 * e, a.x + 210 * e, a.y + 50 * e]; z = z ? [Math.min(z[0], r[0]), Math.min(z[1], r[1]), Math.max(z[2], r[2]), Math.max(z[3], r[3])] : r; });
      if(!z) z = [0, 0, 0, 0];
    }
    if(z && !c.fixe){
      var p0 = MP.ecran(z[0], z[1], c.d, cam), p1 = MP.ecran(z[2], z[3], c.d, cam), m = 30 + fl * 3;
      b = [Math.max(-MG, Math.floor(p0.x - m)), Math.max(-MG, Math.floor(p0.y - m)), Math.min(W + MG, Math.ceil(p1.x + m)), Math.min(H + MG, Math.ceil(p1.y + m))];
    }
    var vide = b[2] - b[0] < 2 || b[3] - b[1] < 2;
    c.ext.style.display = vide ? 'none' : '';
    c.zx = b[0]; c.zy = b[1];
    c.ext.style.transform = 'translate(' + b[0] + 'px,' + b[1] + 'px) scale(' + c.q + ')';
    c.w.style.width = Math.ceil((b[2] - b[0]) / c.q) + 'px'; c.w.style.height = Math.ceil((b[3] - b[1]) / c.q) + 'px';
  });
  cameraSur(cam);
  if(P.acteurs) S.heros.forEach(function(a){ window.HF.simuler(a, dt, tl); });
  var D = (P.dessin ? P.dessin(S, tl, E) : null) || {}, lums = D.lum || E.lum || [], amb = E.amb || [20, 26, 48];
  /* la lumière et le flou de chaque calque */
  var defs = DEFS_FIXES + (F.defs ? F.defs() : '');
  S.couches.forEach(function(c, k){
    var fl = c.net ? c.flou : MP.flou(c.d, cam) + c.flou;
    c.lk = E.lumK && E.lumK[c.id] != null ? E.lumK[c.id] : 1;          /* (un plan peut baisser la lumière d'un calque : le mur, dans un plan serré) */
    if(c.lum){ defs += filtre('mpL' + k, c, cam, lums, c.o.amb || amb, fl); c.w.style.filter = 'url(#mpL' + k + ')'; }
    else c.w.style.filter = fl > .35 ? 'blur(' + r2(fl / c.q) + 'px)' : '';
  });
  defsEl.innerHTML = defs;
  /* l'air : la poussière */
  var air = D.air || '';
  if(E.poussiere !== 0) air = MP.poussiere(t, cam, lums, E.poussiere || {}) + air;
  S.air.l.style.transform = 'translate(' + (-S.air.zx) + 'px,' + (-S.air.zy) + 'px)';
  S.air.svg(air);
  S.voile.style.opacity = E.fondu ? U.clamp(E.fondu, 0, 1) : 0;
  S.voile.style.background = E.fonduC || '#000';
  E.cam = cam; E.plan = P.id;
  return E;
};
function cameraSur(c){
  var cam = Object.assign({x:0, y:0, z:0, zoom:1, roll:0, focus:1000, ap:1}, c);
  S.couches.forEach(function(q){
    if(q.fixe) return;
    var s = echelle(q, cam);
    q.l.style.transform = 'translate(' + r2((W / 2 - q.zx) / q.q) + 'px,' + r2((H / 2 - q.zy) / q.q) + 'px) ' + (cam.roll ? 'rotate(' + r2(cam.roll) + 'deg) ' : '') + 'scale(' + (Math.round(s * q.k / q.q * 100000) / 100000) + ') translate(' + r2(-cam.x / q.k) + 'px,' + r2(-cam.y / q.k) + 'px)';
  });
  S.cam = cam;
  return cam;
}
/* (pour un plan qui a besoin d'un point à l'écran → dans un calque) */
MP.dansCalque = function(c, sx, sy, cam){ var s = echelle(c, cam) * c.k; return {x:(sx - W / 2) / s + cam.x / c.k, y:(sy - H / 2) / s + cam.y / c.k}; };
MP.scene = function(){ return S; };
MP.cacher = function(){ if(racine) racine.style.display = 'none'; };
MP.montrer = function(){ init(); racine.style.display = ''; };
})();
