/* textures-village.js — les matières du VILLAGE DE BRUMEVAL, pour les trois films de début d'enquête (Bible §13.69) :
   la place et la mairie, les maisons à colombages, le clocher, la fontaine, les collines, la berge et le lavoir, le bureau du maire.
   Tout est peint une fois sur des toiles, « en plein jour, sans soleil » : la couleur des choses, leur grain, leurs taches, leurs
   ombres propres. La lumière de l'heure (la nuit bleue, l'aube rose, le matin doré) est ajoutée par le film, image par image
   (la carte des lumières : effets-village.js, FV.lumap). Rien n'est tiré au hasard sans graine. */
(function(){
'use strict';
var U = window.CU, T = window.CTV = {};

function toile(w, h){ var c = document.createElement('canvas'); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); return c; }
function hex(c){ return typeof c !== 'string' ? c : [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function css(c){ return 'rgb(' + Math.round(U.clamp(c[0], 0, 255)) + ',' + Math.round(U.clamp(c[1], 0, 255)) + ',' + Math.round(U.clamp(c[2], 0, 255)) + ')'; }
function rgba(c, a){ return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + a + ')'; }
function mel(a, b, k){ return [U.lerp(a[0], b[0], k), U.lerp(a[1], b[1], k), U.lerp(a[2], b[2], k)]; }
/* plus clair (k > 0) ou plus sombre (k < 0) */
function ton(c, k){ c = hex(c); return k >= 0 ? mel(c, [255, 255, 255], k) : mel(c, [0, 0, 0], -k); }
function tache(g, x, y, rx, ry, c, a){
  var gr = g.createRadialGradient(x, y, 0, x, y, 1);
  gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
  g.save(); g.translate(x, y); g.scale(Math.max(.1, rx), Math.max(.1, ry)); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 1, 0, 7); g.fill(); g.restore();
}
function poly(g, pts){ g.beginPath(); pts.forEach(function(p, i){ if(i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); }
function rr(g, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
T._ = {toile:toile, hex:hex, css:css, rgba:rgba, mel:mel, ton:ton, tache:tache, poly:poly, rr:rr};

/* ---------------------------------------------------------------- LE GRAIN : un bruit doux qui se répète sans couture (256 × 256),
   noir ou blanc, plus ou moins transparent — posé par-dessus une matière, agrandi, il fait les taches ; petit, le grain */
var VOILES = {};
function voileToile(graine, clair){
  var cle = graine + (clair ? 'c' : 's'); if(VOILES[cle]) return VOILES[cle];
  var n = 256, c = toile(n, n), g = c.getContext('2d'), im = g.createImageData(n, n), d = im.data, F = 6;
  function v(x, y){ return U.fbm2(x / n * F, y / n * F, graine, 4); }
  for(var y = 0; y < n; y++) for(var x = 0; x < n; x++){
    var fx = x / n, fy = y / n;
    var a = v(x, y) * (1 - fx) * (1 - fy) + v(x - n, y) * fx * (1 - fy) + v(x, y - n) * (1 - fx) * fy + v(x - n, y - n) * fx * fy;
    a = U.clamp((a - .5) * 2.6 + .5, 0, 1);
    var i = (y * n + x) * 4, k = clair ? 255 : 0;
    d[i] = k; d[i + 1] = k; d[i + 2] = k; d[i + 3] = Math.round(a * 255);
  }
  g.putImageData(im, 0, 0);
  return VOILES[cle] = c;
}
/* poser un voile de taches sur un rectangle (dans la découpe en cours) : ech = la taille des taches ; a = la force */
function voile(g, x, y, w, h, graine, ech, a, clair){
  g.save(); g.globalAlpha = a;
  var p = g.createPattern(voileToile(graine, clair), 'repeat'); p.setTransform(new DOMMatrix().translate(x, y).scale(ech));
  g.fillStyle = p; g.fillRect(x, y, w, h); g.restore();
}
function points(g, R, x, y, w, h, n, c, a, rmax){
  g.fillStyle = rgba(hex(c), a);
  for(var i = 0; i < n; i++){ var r = .4 + R() * (rmax || 1.2); g.beginPath(); g.arc(x + R() * w, y + R() * h, r, 0, 7); g.fill(); }
}
T.voile = voile; T.points = points;

/* ---------------------------------------------------------------- LES MATIÈRES */
/* un mur de pierres : des blocs en rangées, chacun sa teinte, le joint sombre, le haut éclairé, le bas dans l'ombre */
function pierres(g, R, x, y, w, h, o){
  o = o || {};
  var c0 = hex(o.c || '#a59a8a'), hr = o.hr || 30, lw = o.lw || 62, yy = y, n = 0;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = css(ton(c0, -.46)); g.fillRect(x, y, w, h);
  while(yy < y + h){
    var xx = x - R() * lw, hh = hr * (.86 + R() * .28);
    while(xx < x + w){
      var bw = lw * (.55 + R() * .9), c = ton(mel(c0, o.c2 ? hex(o.c2) : c0, R()), (R() - .5) * .24);
      g.fillStyle = css(c); rr(g, xx + 1.3, yy + 1.3, bw - 2.6, hh - 2.6, o.rond == null ? 3.5 : o.rond); g.fill();
      g.fillStyle = rgba([255, 255, 255], .16); g.fillRect(xx + 3, yy + 1.6, bw - 7, 1.6);
      g.fillStyle = rgba([0, 0, 0], .2); g.fillRect(xx + 3, yy + hh - 3.4, bw - 6, 1.8);
      if(R() < .3) tache(g, xx + bw * R(), yy + hh * R(), bw * .4, hh * .5, ton(c, -.3), .35);
      xx += bw; n++;
    }
    yy += hh;
  }
  voile(g, x, y, w, h, (o.graine || 1) + 3, 1.7, .26); voile(g, x, y, w, h, (o.graine || 1) + 5, .5, .14, true);
  points(g, R, x, y, w, h, Math.round(w * h / 420), '#2a2622', .22, 1.1);
  if(o.mousse) for(var i = 0; i < w / 26; i++) tache(g, x + R() * w, y + h - R() * R() * h * o.mousse, 10 + R() * 22, 5 + R() * 10, [78, 104, 52], .4);
  g.restore();
}
/* un crépi : la couleur, des taches d'humidité, un grain fin, quelques fissures */
function crepi(g, R, x, y, w, h, c, graine){
  c = hex(c);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, css(ton(c, -.1))); gr.addColorStop(.25, css(ton(c, .04))); gr.addColorStop(1, css(ton(c, -.07)));
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  voile(g, x, y, w, h, graine + 11, 1.3, .16); voile(g, x, y, w, h, graine + 13, .4, .1, true);
  points(g, R, x, y, w, h, Math.round(w * h / 260), '#5a4a3a', .12, .9);
  for(var i = 0; i < Math.max(1, w * h / 26000); i++){
    var fx = x + R() * w, fy = y + R() * h; g.strokeStyle = rgba(ton(c, -.5), .4); g.lineWidth = .8; g.beginPath(); g.moveTo(fx, fy);
    for(var k = 0; k < 5; k++){ fx += (R() - .5) * 14; fy += 5 + R() * 9; g.lineTo(fx, fy); } g.stroke();
  }
  /* les coulures sous le toit, la saleté en bas */
  var s = g.createLinearGradient(0, y + h - 26, 0, y + h); s.addColorStop(0, 'rgba(60,50,40,0)'); s.addColorStop(1, 'rgba(60,50,40,.22)'); g.fillStyle = s; g.fillRect(x, y + h - 26, w, 26);
  g.restore();
}
/* une poutre : de (x1, y1) à (x2, y2), épaisse de e ; le fil du bois, une arête claire, une ombre portée dessous */
function poutre(g, R, x1, y1, x2, y2, e, c){
  c = hex(c || '#4a3324');
  var L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1);
  g.save(); g.translate(x1, y1); g.rotate(a);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-1, e / 2 - .5, L + 2, 3.2);
  var gr = g.createLinearGradient(0, -e / 2, 0, e / 2); gr.addColorStop(0, css(ton(c, .2))); gr.addColorStop(.25, css(c)); gr.addColorStop(1, css(ton(c, -.3)));
  g.fillStyle = gr; g.fillRect(0, -e / 2, L, e);
  g.strokeStyle = rgba(ton(c, -.55), .5); g.lineWidth = .7;
  for(var i = 0; i < Math.max(2, e / 3.4); i++){ var yy = -e / 2 + 1 + R() * (e - 2), xa = R() * L * .5, xb = xa + L * (.25 + R() * .6); g.beginPath(); g.moveTo(xa, yy); g.quadraticCurveTo((xa + xb) / 2, yy + (R() - .5) * 2.4, Math.min(L, xb), yy + (R() - .5) * 1.4); g.stroke(); }
  if(R() < .5){ var nx = L * (.2 + R() * .6); g.fillStyle = rgba(ton(c, -.6), .6); g.beginPath(); g.ellipse(nx, (R() - .5) * e * .4, 2.6, 1.6, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(20,12,8,.75)'; g.lineWidth = 1; g.strokeRect(0, -e / 2, L, e);
  g.restore();
}
/* des planches (une porte, un volet, un plancher) */
function planches(g, R, x, y, w, h, c, o){
  o = o || {}; c = hex(c);
  var lp = o.lp || 16, n = Math.max(1, Math.round(w / lp)); lp = w / n;
  for(var i = 0; i < n; i++){
    var cc = ton(c, (R() - .5) * .2), gx = x + i * lp;
    var gr = g.createLinearGradient(gx, 0, gx + lp, 0); gr.addColorStop(0, css(ton(cc, -.18))); gr.addColorStop(.2, css(ton(cc, .06))); gr.addColorStop(.85, css(cc)); gr.addColorStop(1, css(ton(cc, -.3)));
    g.fillStyle = gr; g.fillRect(gx, y, lp, h);
    g.strokeStyle = rgba(ton(cc, -.5), .35); g.lineWidth = .6;
    for(var k = 0; k < 3; k++){ var fx = gx + 2 + R() * (lp - 4); g.beginPath(); g.moveTo(fx, y); g.bezierCurveTo(fx + (R() - .5) * 3, y + h * .3, fx + (R() - .5) * 3, y + h * .7, fx + (R() - .5) * 2, y + h); g.stroke(); }
  }
}
/* un toit de tuiles (ou d'ardoises) : dans le polygone « pts », des rangées d'écailles */
function tuiles(g, R, pts, c, o){
  o = o || {}; c = hex(c);
  var xs = pts.map(function(p){ return p[0]; }), ys = pts.map(function(p){ return p[1]; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), tw = o.tw || 13, th = o.th || 10;
  g.save(); poly(g, pts); g.clip();
  g.fillStyle = css(ton(c, -.5)); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for(var y = y0 - th, r = 0; y < y1 + th; y += th, r++){
    for(var x = x0 - tw + (r % 2) * tw / 2; x < x1 + tw; x += tw){
      var cc = ton(mel(c, o.c2 ? hex(o.c2) : c, R()), (R() - .5) * .3);
      g.fillStyle = css(cc);
      if(o.ardoise){ g.beginPath(); g.moveTo(x + .6, y); g.lineTo(x + tw - .6, y); g.lineTo(x + tw - .6, y + th * 1.1); g.lineTo(x + tw / 2, y + th * 1.45); g.lineTo(x + .6, y + th * 1.1); g.closePath(); g.fill(); }
      else { g.beginPath(); g.moveTo(x + .6, y); g.lineTo(x + tw - .6, y); g.lineTo(x + tw - .6, y + th * .9); g.quadraticCurveTo(x + tw / 2, y + th * 1.7, x + .6, y + th * .9); g.closePath(); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 1.5, y + 1, tw * .34, th * .8);
    }
    g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x0, y + th * 1.25, x1 - x0, 1.6);
  }
  var gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(255,240,220,.16)'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.26)');
  g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  voile(g, x0, y0, x1 - x0, y1 - y0, (o.graine || 2) + 21, 1.5, .26);
  if(o.mousse) for(var i = 0; i < (x1 - x0) / 30; i++) tache(g, x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), 8 + R() * 16, 4 + R() * 8, [92, 112, 58], .34);
  g.restore();
  g.strokeStyle = 'rgba(24,14,10,.8)'; g.lineWidth = 1.4; poly(g, pts); g.stroke();
}
/* une fenêtre : l'encadrement, la vitre sombre où le ciel se reflète, les croisillons, les rideaux, les volets ouverts, les fleurs */
function fenetre(g, R, x, y, w, h, o){
  o = o || {};
  var bois = hex(o.bois || '#e8e0cc'), vc = o.volets ? hex(o.volets) : null;
  /* les volets, ouverts de chaque côté */
  if(vc) [-1, 1].forEach(function(sg){
    var vx = sg < 0 ? x - w * .52 - 2 : x + w + 2, vw = w * .52;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(vx + 2, y + 3, vw, h);
    planches(g, R, vx, y, vw, h, vc, {lp:vw / 3});
    g.strokeStyle = css(ton(vc, -.5)); g.lineWidth = 2; g.beginPath(); g.moveTo(vx + 1, y + h * .12); g.lineTo(vx + vw - 1, y + h * .12); g.moveTo(vx + 1, y + h * .88); g.lineTo(vx + vw - 1, y + h * .88); g.moveTo(vx + 1, y + h * .88); g.lineTo(vx + vw - 1, y + h * .12); g.stroke();
    g.strokeStyle = 'rgba(20,12,8,.8)'; g.lineWidth = 1; g.strokeRect(vx, y, vw, h);
  });
  /* l'ébrasement (la fenêtre est en retrait dans le mur) */
  g.fillStyle = 'rgba(0,0,0,.34)'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  /* la vitre */
  var gr = g.createLinearGradient(x, y, x + w * .4, y + h); gr.addColorStop(0, '#31455e'); gr.addColorStop(.5, '#1a2636'); gr.addColorStop(1, '#0e151f');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = 'rgba(190,215,240,.2)'; poly(g, [[x + w * .05, y + h], [x + w * .5, y], [x + w * .72, y], [x + w * .27, y + h]]); g.fill();
  if(o.rideaux !== false){
    var rc = hex(o.rideaux || '#efe6d2');
    [-1, 1].forEach(function(sg){ g.fillStyle = rgba(rc, .9); g.beginPath(); var rx = sg < 0 ? x : x + w; g.moveTo(rx, y); g.lineTo(rx - sg * w * .34, y); g.quadraticCurveTo(rx - sg * w * .3, y + h * .5, rx - sg * w * .1, y + h * .62); g.lineTo(rx, y + h); g.closePath(); g.fill();
      g.strokeStyle = rgba(ton(rc, -.3), .6); g.lineWidth = .8; for(var k = 1; k < 4; k++){ g.beginPath(); g.moveTo(rx - sg * w * .34 * k / 4, y); g.quadraticCurveTo(rx - sg * w * .26 * k / 4, y + h * .4, rx - sg * w * .08 * k / 4, y + h * .62); g.stroke(); } });
  }
  g.restore();
  /* le cadre et les croisillons */
  g.strokeStyle = css(bois); g.lineWidth = Math.max(2.4, w * .07); g.strokeRect(x, y, w, h);
  g.lineWidth = Math.max(1.6, w * .045); g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h);
  var nb = o.carreaux || (h > w * 1.5 ? 3 : 2); for(var k = 1; k < nb; k++){ g.moveTo(x, y + h * k / nb); g.lineTo(x + w, y + h * k / nb); } g.stroke();
  g.strokeStyle = 'rgba(20,12,8,.7)'; g.lineWidth = 1; g.strokeRect(x - g.lineWidth, y - 1.5, w + 2, h + 3);
  /* l'appui, et la jardinière */
  g.fillStyle = css(ton(bois, -.2)); g.fillRect(x - 5, y + h, w + 10, 5); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x - 5, y + h + 5, w + 10, 3);
  if(o.fleurs){
    g.fillStyle = '#6a4630'; g.fillRect(x - 3, y + h - 3, w + 6, 9); g.strokeStyle = 'rgba(20,12,8,.7)'; g.strokeRect(x - 3, y + h - 3, w + 6, 9);
    for(var i = 0; i < w / 2.2; i++){ var fx = x - 4 + R() * (w + 8), fy = y + h - 4 - R() * 13; g.fillStyle = R() < .55 ? css(ton([70, 120, 60], (R() - .5) * .4)) : css(ton(hex(o.fleurs), (R() - .3) * .4)); g.beginPath(); g.arc(fx, fy, 1.6 + R() * 2.6, 0, 7); g.fill(); }
    for(i = 0; i < w / 9; i++){ var px = x + R() * w; g.strokeStyle = css(ton([70, 120, 60], -.2)); g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, y + h + 2); g.quadraticCurveTo(px + (R() - .5) * 8, y + h + 12, px + (R() - .5) * 10, y + h + 16 + R() * 10); g.stroke(); }
  }
  return {x:x, y:y, w:w, h:h};
}
/* une porte de planches, sous un linteau ; cintree : le haut en arc */
function porte(g, R, x, y, w, h, o){
  o = o || {};
  var c = hex(o.c || '#6a4a30');
  g.save(); g.beginPath();
  if(o.cintree){ g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); } else g.rect(x, y, w, h);
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); g.clip();
  planches(g, R, x + 3, y + 3, w - 6, h - 3, c, {lp:w / (o.n || 5)});
  g.fillStyle = '#2a2a30'; [.22, .72].forEach(function(k){ g.fillRect(x + 3, y + h * k, w * .7, 4.6); g.beginPath(); g.arc(x + 3 + w * .7, y + h * k + 2.3, 3.6, 0, 7); g.fill(); });
  g.fillStyle = '#c8a040'; g.beginPath(); g.arc(x + w - 11, y + h * .52, 3.6, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(x + w - 12, y + h * .52 - 1, 1.2, 0, 7); g.fill();
  var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(.3, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.restore();
}

/* ---------------------------------------------------------------- UNE MAISON À COLOMBAGES (dessinée dans une toile plus grande)
   (x, yb) : son coin bas-gauche ; w, h : la largeur et la hauteur du mur (jusqu'à la gouttière) ; o : {c (le crépi), bois, toit
   ('long' : la pente vers nous ; 'pignon' : le triangle vers nous), tuile, volets, fleurs, etages, pierre (le rez-de-chaussée en pierre),
   enseigne}. Rend ses fenêtres ([{x, y, w, h}], dans la toile) : le film les allume. */
function maison(g, R, x, yb, w, h, o){
  o = o || {};
  var c = hex(o.c || '#e9dcc0'), bois = o.bois || '#4a3324', et = o.etages || 2, hs = h / (et + (o.pierre ? .1 : 0)), fen = [], tuile = o.tuile || '#a8553a';
  var y0 = yb - h, eb = Math.max(7, w * .028), rh = o.rh || (o.toit === 'pignon' ? w * .62 : h * .5), ov = 12;
  /* LE TOIT d'abord (le mur passe devant sa base) */
  if(o.toit === 'pignon'){
    var faite = [x + w / 2, y0 - rh];
    /* le pignon : du crépi et des colombages dans le triangle */
    g.save(); poly(g, [[x, y0 + 1], faite, [x + w, y0 + 1]]); g.clip();
    crepi(g, R, x, y0 - rh, w, rh + 2, c, o.graine || 1);
    g.restore();
    poutre(g, R, x + w / 2, y0, x + w / 2, y0 - rh + 8, eb, bois);
    poutre(g, R, x + w * .22, y0 - rh * .44, x + w * .78, y0 - rh * .44, eb * .9, bois);
    poutre(g, R, x + w * .3, y0, x + w / 2 - 3, y0 - rh * .44, eb * .8, bois); poutre(g, R, x + w * .7, y0, x + w / 2 + 3, y0 - rh * .44, eb * .8, bois);
    var lw = w * .16; fen.push(fenetre(g, R, x + w / 2 - lw / 2, y0 - rh * .4 + 6, lw, lw * 1.25, {volets:null, rideaux:false, carreaux:2}));
    /* les deux pentes, vues par la tranche : une bande de tuiles de chaque côté */
    [[-1, x], [1, x + w]].forEach(function(q){
      var sg = q[0], bx = q[1] + sg * ov, e = 15;
      tuiles(g, R, [[bx, y0 + 6], [faite[0], faite[1] - e * .2], [faite[0], faite[1] - e * 1.4], [bx + sg * 4, y0 + 6 - e]], tuile, {graine:o.graine, tw:9, th:8, mousse:o.mousse});
      poutre(g, R, bx - sg * 2, y0 + 8, faite[0], faite[1] + 4, 6, bois);
    });
  } else {
    var inset = w * .04;
    tuiles(g, R, [[x - ov, y0 + 4], [x + inset, y0 - rh], [x + w - inset, y0 - rh], [x + w + ov, y0 + 4]], tuile, {graine:o.graine, mousse:o.mousse, c2:o.tuile2});
    /* le faîtage */
    g.fillStyle = css(ton(tuile, -.35)); g.fillRect(x + inset - 2, y0 - rh - 4, w - inset * 2 + 4, 6);
    /* une lucarne */
    if(o.lucarne !== false){
      var lx = x + w * (o.lucarneX || .5), lw2 = Math.min(64, w * .2), lh = lw2 * 1.05, ly = y0 - rh * .34;
      crepi(g, R, lx - lw2 / 2, ly - lh, lw2, lh, c, 7);
      fen.push(fenetre(g, R, lx - lw2 * .28, ly - lh * .8, lw2 * .56, lh * .68, {volets:null, rideaux:false, carreaux:2}));
      tuiles(g, R, [[lx - lw2 / 2 - 8, ly - lh + 3], [lx, ly - lh - lw2 * .5], [lx + lw2 / 2 + 8, ly - lh + 3]], tuile, {graine:5, tw:8, th:7});
      poutre(g, R, lx - lw2 / 2, ly, lx - lw2 / 2, ly - lh, 5, bois); poutre(g, R, lx + lw2 / 2, ly, lx + lw2 / 2, ly - lh, 5, bois);
    }
  }
  /* la cheminée */
  if(o.cheminee !== false){
    var cx = x + w * (o.chemineeX || .78), ch = o.toit === 'pignon' ? rh * .5 : rh * .5, cy = o.toit === 'pignon' ? y0 - rh * .62 : y0 - rh - 26, cw = Math.min(46, w * .13);
    pierres(g, R, cx, cy, cw, ch, {c:'#9a7a62', hr:11, lw:20, graine:9});
    g.fillStyle = '#5a463a'; g.fillRect(cx - 4, cy - 6, cw + 8, 8); g.strokeStyle = 'rgba(20,12,8,.8)'; g.lineWidth = 1; g.strokeRect(cx - 4, cy - 6, cw + 8, 8); g.strokeRect(cx, cy, cw, ch);
  }
  /* LE MUR, étage par étage (du bas vers le haut) */
  for(var e2 = 0; e2 < et; e2++){
    var yh = yb - hs * (e2 + 1), enc = e2 > 0 && o.encorbellement !== false ? 7 : 0, mx = x - enc, mw = w + enc * 2;
    if(e2 === 0 && o.pierre) pierres(g, R, mx, yh, mw, hs, {c:o.pierre === true ? '#a59a8a' : o.pierre, hr:22, lw:48, graine:o.graine, mousse:.4});
    else crepi(g, R, mx, yh, mw, hs, c, (o.graine || 1) + e2);
    /* l'ombre sous l'étage du dessus, sous le toit */
    var s = g.createLinearGradient(0, yh, 0, yh + 30); s.addColorStop(0, 'rgba(20,14,10,.42)'); s.addColorStop(1, 'rgba(20,14,10,0)'); g.fillStyle = s; g.fillRect(mx, yh, mw, 30);
    /* les fenêtres de l'étage (et la porte en bas) */
    var nf = o.nf || Math.max(2, Math.round(w / 190)), fw = Math.min(70, w / nf * .38), fh = Math.min(hs * .5, fw * 1.45), fy = yh + hs * .24;
    var places = [];
    for(var k = 0; k < nf; k++) places.push(mx + mw * (k + .5) / nf);
    if(e2 === 0 && o.porte !== false){
      var pk = o.porteK == null ? Math.floor(nf / 2) : o.porteK, pw = Math.min(84, fw * 1.35), ph = hs * .74;
      porte(g, R, places[pk] - pw / 2, yb - ph, pw, ph, {c:o.porteC || '#5e4230', cintree:o.cintree});
      /* le linteau, le seuil */
      poutre(g, R, places[pk] - pw / 2 - 8, yb - ph - 4, places[pk] + pw / 2 + 8, yb - ph - 4, 9, bois);
      g.fillStyle = '#8a8276'; g.fillRect(places[pk] - pw / 2 - 10, yb - 6, pw + 20, 6);
      if(o.enseigne){ var ex = places[pk] + pw / 2 + 16, ey = yb - ph - 6; g.strokeStyle = '#2a2a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(ex - 14, ey); g.lineTo(ex + 44, ey); g.stroke();
        g.fillStyle = css(hex(o.enseigne)); rr(g, ex + 4, ey + 6, 38, 30, 5); g.fill(); g.strokeStyle = 'rgba(20,12,8,.8)'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = 'rgba(255,240,200,.85)'; g.beginPath(); g.arc(ex + 23, ey + 21, 8, 0, 7); g.fill(); }
      places.splice(pk, 1);
    }
    places.forEach(function(px){
      /* les colombages : sous la fenêtre, une croix ou des potelets */
      if(!(e2 === 0 && o.pierre)){
        var by = fy + fh + 8, bh = yh + hs - by - 2;
        if(bh > 14){ if(R() < .6){ poutre(g, R, px - fw * .7, by, px + fw * .7, by + bh, eb * .7, bois); poutre(g, R, px + fw * .7, by, px - fw * .7, by + bh, eb * .7, bois); } else { poutre(g, R, px - fw * .3, by, px - fw * .3, by + bh, eb * .7, bois); poutre(g, R, px + fw * .3, by, px + fw * .3, by + bh, eb * .7, bois); } }
        poutre(g, R, px - fw * .78, yh + 2, px - fw * .78, yh + hs, eb * .8, bois); poutre(g, R, px + fw * .78, yh + 2, px + fw * .78, yh + hs, eb * .8, bois);
        poutre(g, R, px - fw * .78, fy + fh + 6, px + fw * .78, fy + fh + 6, eb * .7, bois);
      }
      fen.push(fenetre(g, R, px - fw / 2, fy, fw, fh, {volets:o.volets === undefined ? '#3f6b4f' : o.volets, fleurs:R() < (o.fleursK == null ? .6 : o.fleursK) ? (o.fleurs || '#c8382e') : null, rideaux:o.rideaux}));
    });
    /* les poteaux des coins, la sablière (la grosse poutre entre deux étages), une écharpe en biais */
    if(!(e2 === 0 && o.pierre)){
      poutre(g, R, mx + eb / 2, yh, mx + eb / 2, yh + hs, eb, bois); poutre(g, R, mx + mw - eb / 2, yh, mx + mw - eb / 2, yh + hs, eb, bois);
      if(R() < .7){ poutre(g, R, mx + eb, yh + hs - 2, mx + eb + hs * .34, yh + 4, eb * .75, bois); poutre(g, R, mx + mw - eb, yh + hs - 2, mx + mw - eb - hs * .34, yh + 4, eb * .75, bois); }
    }
    poutre(g, R, mx - 2, yh + hs, mx + mw + 2, yh + hs, eb * 1.15, bois);
    if(e2 === et - 1) poutre(g, R, mx - 4, yh + 2, mx + mw + 4, yh + 2, eb, bois);
  }
  /* le pied du mur : un soubassement, l'ombre au sol */
  if(!o.pierre){ pierres(g, R, x, yb - 16, w, 16, {c:'#8f8678', hr:16, lw:40, graine:3}); }
  var so = g.createLinearGradient(0, yb - 22, 0, yb); so.addColorStop(0, 'rgba(0,0,0,0)'); so.addColorStop(1, 'rgba(0,0,0,.32)'); g.fillStyle = so; g.fillRect(x - 8, yb - 22, w + 16, 22);
  return fen;
}
T.maison = maison;

/* une rangée de maisons sur une toile : o = {w, h, graine, sol (la marge sous les maisons), maisons:[{x, w, h, …}]} (en points de la toile).
   Rend la toile ; toile.fen = toutes les fenêtres [{x, y, w, h}] (en parts de la toile, 0 → 1) */
T.rangee = function(o){
  var c = toile(o.w, o.h), g = c.getContext('2d'), R = U.hasard(o.graine || 5), fen = [];
  o.maisons.forEach(function(m, i){ var f = maison(g, U.hasard((o.graine || 5) * 31 + i * 7), m.x, o.h - (o.sol || 0), m.w, m.h, m); f.forEach(function(q){ fen.push({x:(q.x + q.w / 2) / o.w, y:(q.y + q.h / 2) / o.h, w:q.w / o.w, h:q.h / o.h}); }); });
  c.fen = fen;
  return c;
};
/* des maisons tirées au sort, serrées les unes contre les autres (les rangées du fond) */
T.rangeeAuto = function(o){
  var R = U.hasard(o.graine || 9), L = [], x = o.x0 || 10;
  var CREPIS = ['#e9dcc0', '#f1e8d4', '#e2c890', '#e6c8b4', '#d6dcd8', '#ead2a6'], VOL = ['#3f6b4f', '#3c5f86', '#8e3b34', '#5a4a7a', '#2f6a6a'], TU = ['#a8553a', '#8f4a34', '#b0603e', '#7a4a3a', '#58606c'];
  while(x < o.w - 60){
    var w = (o.lMin || 190) + R() * ((o.lMax || 330) - (o.lMin || 190)), h = (o.hMin || 280) + R() * ((o.hMax || 400) - (o.hMin || 280));
    if(x + w > o.w - 8) w = o.w - 8 - x; if(w < 120) break;
    L.push({x:x, w:w, h:h, c:CREPIS[Math.floor(R() * CREPIS.length)], volets:VOL[Math.floor(R() * VOL.length)], tuile:TU[Math.floor(R() * TU.length)], toit:R() < .42 ? 'pignon' : 'long', etages:h > 340 ? 3 : 2,
      pierre:R() < .4, fleurs:R() < .5 ? '#c8382e' : '#e06a9a', mousse:R() < .5, cintree:R() < .4, lucarneX:.3 + R() * .4, chemineeX:.15 + R() * .7, graine:Math.floor(R() * 90) + 1, enseigne:R() < .22 ? '#8a3a2a' : null});
    x += w + (o.ecart == null ? 4 : o.ecart) + (R() < (o.trous || 0) ? 60 + R() * 120 : 0);
  }
  return T.rangee({w:o.w, h:o.h, graine:o.graine, sol:o.sol, maisons:L});
};

/* ---------------------------------------------------------------- LA MAIRIE : la grande façade de pierre, le perron, la porte, le balcon,
   les hautes fenêtres de l'étage (le bureau du maire est la deuxième à droite : T.MAIRIE.bureau), le toit d'ardoises, l'horloge */
T.MAIRIE = {w:1700, h:1300};
T.mairie = function(o){
  o = o || {};
  var W = T.MAIRIE.w, H = T.MAIRIE.h, c = toile(W, H), g = c.getContext('2d'), R = U.hasard(o.graine || 17), fen = [];
  var mx = 110, mw = W - 220, toitH = 250, y0 = toitH + 70, rez = 430, etg = H - y0 - rez;   /* y0 : le haut du mur */
  /* le toit d'ardoises, ses trois lucarnes, le fronton de l'horloge et le petit clocheton */
  tuiles(g, R, [[mx - 26, y0 + 6], [mx + 70, y0 - toitH], [mx + mw - 70, y0 - toitH], [mx + mw + 26, y0 + 6]], '#56606e', {ardoise:true, tw:15, th:12, c2:'#6a7482', graine:4});
  g.fillStyle = '#3a424e'; g.fillRect(mx + 66, y0 - toitH - 6, mw - 132, 8);
  [.2, .8].forEach(function(k){
    var lx = mx + mw * k, lw = 86, lh = 96, ly = y0 - 34;
    pierres(g, R, lx - lw / 2, ly - lh, lw, lh, {c:'#b9ae9c', hr:16, lw:34, graine:6});
    fenetre(g, R, lx - 22, ly - lh + 16, 44, 62, {volets:null, rideaux:false, bois:'#d8d0bc'});
    tuiles(g, R, [[lx - lw / 2 - 10, ly - lh + 4], [lx, ly - lh - 50], [lx + lw / 2 + 10, ly - lh + 4]], '#56606e', {ardoise:true, tw:10, th:9});
  });
  /* le fronton : l'horloge (ses aiguilles sont posées par le film, ou pas : elle est en panne) */
  var hx = W / 2, hy = y0 - 150;
  pierres(g, R, hx - 150, y0 - 250, 300, 256, {c:'#bdb2a0', hr:22, lw:50, graine:8});
  g.fillStyle = '#a89c8a'; poly(g, [[hx - 176, y0 - 250], [hx, y0 - 350], [hx + 176, y0 - 250]]); g.fill(); g.strokeStyle = 'rgba(24,14,10,.8)'; g.lineWidth = 1.6; g.stroke();
  g.fillStyle = '#8f8472'; g.fillRect(hx - 180, y0 - 256, 360, 12);
  g.fillStyle = '#2f2a26'; g.beginPath(); g.arc(hx, hy, 86, 0, 7); g.fill();
  g.fillStyle = '#f2ead6'; g.beginPath(); g.arc(hx, hy, 76, 0, 7); g.fill(); tache(g, hx - 20, hy - 24, 60, 60, [255, 255, 255], .5); voile(g, hx - 80, hy - 80, 160, 160, 31, .6, .16);
  g.fillStyle = '#2f2a26'; for(var i = 0; i < 12; i++){ var a = i / 12 * 6.283; g.save(); g.translate(hx + Math.sin(a) * 62, hy - Math.cos(a) * 62); g.rotate(a); g.fillRect(-2.5, -8, 5, i % 3 ? 10 : 16); g.restore(); }
  g.strokeStyle = '#c8a040'; g.lineWidth = 5; g.beginPath(); g.arc(hx, hy, 81, 0, 7); g.stroke();
  T.MAIRIE.horloge = {x:hx / W, y:hy / H, r:76 / W};
  /* le clocheton et son mât */
  g.fillStyle = '#56606e'; poly(g, [[hx - 34, y0 - 348], [hx, y0 - 430], [hx + 34, y0 - 348]]); g.fill(); g.stroke();
  g.strokeStyle = '#3a3a40'; g.lineWidth = 4; g.beginPath(); g.moveTo(hx, y0 - 430); g.lineTo(hx, 6); g.stroke();
  T.MAIRIE.mat = {x:hx / W, y:8 / H};
  /* LE MUR : de belles pierres claires ; les chaînes d'angle ; le bandeau entre les étages ; la corniche */
  pierres(g, R, mx, y0, mw, H - y0, {c:'#cfc4b0', c2:'#bfb39e', hr:30, lw:74, graine:12});
  [mx, mx + mw - 46].forEach(function(qx){ pierres(g, R, qx, y0, 46, H - y0, {c:'#aba08e', hr:38, lw:60, graine:14, rond:1}); });
  g.fillStyle = '#b3a894'; g.fillRect(mx - 14, y0 - 6, mw + 28, 22); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(mx - 14, y0 + 16, mw + 28, 7);
  g.fillStyle = '#b9ae9a'; g.fillRect(mx - 6, y0 + etg - 12, mw + 12, 18); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(mx - 6, y0 + etg + 6, mw + 12, 6);
  var s = g.createLinearGradient(0, y0 + 16, 0, y0 + 90); s.addColorStop(0, 'rgba(30,22,16,.4)'); s.addColorStop(1, 'rgba(30,22,16,0)'); g.fillStyle = s; g.fillRect(mx, y0 + 16, mw, 74);
  /* l'étage : cinq hautes fenêtres ; celle du milieu donne sur le balcon */
  var FX_ = [.14, .32, .5, .68, .86], fw = 96, fh = 216, fy = y0 + 64;
  FX_.forEach(function(k, i){
    var px = mx + mw * k;
    /* l'encadrement de pierre et sa clé */
    g.fillStyle = '#e0d8c6'; g.fillRect(px - fw / 2 - 12, fy - 14, fw + 24, fh + 26); g.strokeStyle = 'rgba(24,14,10,.5)'; g.lineWidth = 1; g.strokeRect(px - fw / 2 - 12, fy - 14, fw + 24, fh + 26);
    g.fillStyle = '#c8bca6'; poly(g, [[px - 16, fy - 14], [px + 16, fy - 14], [px + 11, fy - 36], [px - 11, fy - 36]]); g.fill(); g.stroke();
    var q = fenetre(g, R, px - fw / 2, fy, fw, fh, {volets:null, bois:'#f0ead8', rideaux:i === 3 ? false : '#7a3a4a', carreaux:4});
    fen.push({x:px / W, y:(fy + fh / 2) / H, w:fw / W, h:fh / H, bureau:i === 3});
    if(i === 3) T.MAIRIE.bureau = {x:px / W, y:(fy + fh / 2) / H, w:fw / W, h:fh / H};
  });
  /* le balcon, au milieu : la dalle, les balustres, la rambarde ; deux consoles dessous */
  var bx = mx + mw * .5, bw = 300, by = fy + fh + 12;
  g.fillStyle = '#a99e8a'; g.fillRect(bx - bw / 2, by, bw, 16); g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(bx - bw / 2, by + 16, bw, 9);
  for(i = 0; i < 13; i++){ var qx = bx - bw / 2 + 14 + i * (bw - 28) / 12; g.fillStyle = '#d6ccb8'; g.beginPath(); g.ellipse(qx, by - 22, 6, 20, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(24,14,10,.45)'; g.stroke(); }
  g.fillStyle = '#c4b8a2'; g.fillRect(bx - bw / 2 - 4, by - 52, bw + 8, 11); g.strokeStyle = 'rgba(24,14,10,.6)'; g.strokeRect(bx - bw / 2 - 4, by - 52, bw + 8, 11);
  [-1, 1].forEach(function(sg){ g.fillStyle = '#a0957f'; poly(g, [[bx + sg * 120, by + 16], [bx + sg * 92, by + 16], [bx + sg * 96, by + 62], [bx + sg * 112, by + 40]]); g.fill(); g.stroke(); });
  T.MAIRIE.balcon = {x:bx / W, y:(by - 52) / H, w:bw / W};
  /* le rez-de-chaussée : la grande porte cintrée à deux battants, deux colonnes, deux lanternes, deux fenêtres de chaque côté */
  var py = H - 330, pw = 200;
  g.fillStyle = '#e0d8c6'; g.beginPath(); g.moveTo(bx - pw / 2 - 26, H); g.lineTo(bx - pw / 2 - 26, py + pw / 2); g.arc(bx, py + pw / 2, pw / 2 + 26, Math.PI, 0); g.lineTo(bx + pw / 2 + 26, H); g.closePath(); g.fill(); g.strokeStyle = 'rgba(24,14,10,.6)'; g.stroke();
  for(i = 0; i < 9; i++){ var an = Math.PI + (i + .5) / 9 * Math.PI; g.strokeStyle = 'rgba(24,14,10,.35)'; g.beginPath(); g.moveTo(bx + Math.cos(an) * pw / 2, py + pw / 2 + Math.sin(an) * pw / 2); g.lineTo(bx + Math.cos(an) * (pw / 2 + 26), py + pw / 2 + Math.sin(an) * (pw / 2 + 26)); g.stroke(); }
  porte(g, R, bx - pw / 2, py, pw, 330, {c:'#5a3826', cintree:true, n:8});
  g.strokeStyle = 'rgba(14,8,6,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, py + 4); g.lineTo(bx, H); g.stroke();
  g.fillStyle = '#c8a040'; [-1, 1].forEach(function(sg){ g.beginPath(); g.arc(bx + sg * 16, py + 190, 7, 0, 7); g.fill(); });
  T.MAIRIE.porte = {x:bx / W, w:pw / W, y:py / H};
  [-1, 1].forEach(function(sg){
    var cx = bx + sg * (pw / 2 + 62), ct = y0 + etg + 12;
    var gr = g.createLinearGradient(cx - 24, 0, cx + 24, 0); gr.addColorStop(0, '#9a8f7c'); gr.addColorStop(.35, '#f0e8d6'); gr.addColorStop(1, '#8a7f6c');
    g.fillStyle = gr; g.fillRect(cx - 22, ct + 22, 44, H - ct - 44); voile(g, cx - 22, ct + 22, 44, H - ct - 44, 41, .8, .2);
    g.fillStyle = '#c4b8a2'; g.fillRect(cx - 32, ct, 64, 24); g.fillRect(cx - 30, H - 24, 60, 24); g.strokeStyle = 'rgba(24,14,10,.6)'; g.lineWidth = 1; g.strokeRect(cx - 32, ct, 64, 24); g.strokeRect(cx - 30, H - 24, 60, 24); g.strokeRect(cx - 22, ct + 24, 44, H - ct - 48);
    /* la lanterne de fer, sur sa potence */
    var lx = bx + sg * (pw / 2 + 150), ly = py + 60;
    g.strokeStyle = '#26262c'; g.lineWidth = 5; g.beginPath(); g.moveTo(lx - sg * 30, ly - 40); g.lineTo(lx, ly - 40); g.lineTo(lx, ly - 22); g.stroke();
    g.fillStyle = '#26262c'; poly(g, [[lx - 16, ly - 22], [lx + 16, ly - 22], [lx + 12, ly - 12], [lx - 12, ly - 12]]); g.fill(); poly(g, [[lx - 13, ly + 34], [lx + 13, ly + 34], [lx + 9, ly + 44], [lx - 9, ly + 44]]); g.fill();
    g.fillStyle = '#d8c890'; g.fillRect(lx - 11, ly - 12, 22, 46); g.strokeStyle = '#26262c'; g.lineWidth = 2.4; g.strokeRect(lx - 11, ly - 12, 22, 46); g.beginPath(); g.moveTo(lx, ly - 12); g.lineTo(lx, ly + 34); g.stroke();
    (T.MAIRIE.lanternes = T.MAIRIE.lanternes || []).push({x:lx / W, y:(ly + 10) / H});
    [.14, .32].forEach(function(k){ var px = sg < 0 ? mx + mw * k : mx + mw * (1 - k);
      g.fillStyle = '#e0d8c6'; g.fillRect(px - 56, py + 24, 112, 196); g.strokeStyle = 'rgba(24,14,10,.5)'; g.lineWidth = 1; g.strokeRect(px - 56, py + 24, 112, 196);
      fenetre(g, R, px - 44, py + 36, 88, 170, {volets:null, bois:'#f0ead8', rideaux:'#e8dcc0', carreaux:3});
      fen.push({x:px / W, y:(py + 120) / H, w:88 / W, h:170 / H}); });
  });
  /* le nom, gravé au-dessus de la porte */
  g.fillStyle = '#b3a894'; rr(g, bx - 110, py - 78, 220, 42, 4); g.fill(); g.strokeStyle = 'rgba(24,14,10,.55)'; g.stroke();
  g.font = '700 30px Macondo, serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(40,28,20,.85)'; g.fillText('MAIRIE', bx, py - 47); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillText('MAIRIE', bx + 1, py - 46);
  /* le soubassement, plus sombre ; la mousse au pied */
  pierres(g, R, mx, H - 54, mw, 54, {c:'#978c7a', hr:27, lw:80, graine:16, mousse:.6});
  /* le lierre, qui grimpe sur le coin gauche */
  for(i = 0; i < 520; i++){ var k2 = R(), ix = mx + 6 + R() * (60 + 130 * (1 - k2)) * (1 - k2 * .5), iy = H - 50 - k2 * (H - y0 - 100) + (R() - .5) * 40; g.fillStyle = css(ton([64, 104, 52], (R() - .5) * .5)); g.beginPath(); g.ellipse(ix, iy, 4 + R() * 6, 3 + R() * 4, R() * 3, 0, 7); g.fill(); }
  c.fen = fen;
  return c;
};
/* le perron : trois marches de pierre, vues de face (une toile large et basse) */
T.perron = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 23), n = o.marches || 3;
  for(var i = 0; i < n; i++){
    var y = h * i / n, inset = (n - 1 - i) * (o.retrait || 26);
    pierres(g, R, inset, y, w - inset * 2, h / n, {c:'#bcb19e', hr:h / n, lw:150, graine:25 + i, rond:1});
    g.fillStyle = 'rgba(255,250,235,.4)'; g.fillRect(inset, y, w - inset * 2, 3.5);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(inset, y + h / n - 4, w - inset * 2, 4);
  }
  return c;
};

/* ---------------------------------------------------------------- LE CLOCHER de l'église (loin) : la tour de pierre, les abat-sons, la flèche d'ardoises */
T.clocher = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 29), tw = w * .5, tx = (w - tw) / 2, fl = h * .42;
  tuiles(g, R, [[tx - 14, fl + 4], [w / 2 - 3, 8], [w / 2 + 3, 8], [tx + tw + 14, fl + 4]], '#4f5966', {ardoise:true, tw:11, th:10, graine:3});
  g.strokeStyle = '#2a2a30'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, 0); g.moveTo(w / 2 - 6, 4); g.lineTo(w / 2 + 6, 4); g.stroke();
  pierres(g, R, tx, fl, tw, h - fl, {c:'#b3a996', c2:'#a39884', hr:20, lw:44, graine:31, mousse:.2});
  g.fillStyle = '#9a907e'; g.fillRect(tx - 8, fl - 4, tw + 16, 14); g.fillRect(tx - 5, fl + (h - fl) * .42, tw + 10, 10);
  /* les abat-sons (la cloche est derrière), le cadran */
  [.3, .7].forEach(function(k){ var ax = tx + tw * k, ay = fl + 34, aw = tw * .2, ah = (h - fl) * .26;
    g.fillStyle = '#1a1612'; g.beginPath(); g.moveTo(ax - aw / 2, ay + ah); g.lineTo(ax - aw / 2, ay + aw / 2); g.arc(ax, ay + aw / 2, aw / 2, Math.PI, 0); g.lineTo(ax + aw / 2, ay + ah); g.closePath(); g.fill();
    g.strokeStyle = '#5a4a3a'; g.lineWidth = 2.2; for(var i = 1; i < 6; i++){ g.beginPath(); g.moveTo(ax - aw / 2, ay + ah * i / 6 + 6); g.lineTo(ax + aw / 2, ay + ah * i / 6); g.stroke(); } });
  var s = g.createLinearGradient(tx, 0, tx + tw, 0); s.addColorStop(0, 'rgba(255,240,220,.14)'); s.addColorStop(.5, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = s; g.fillRect(tx, fl, tw, h - fl);
  return c;
};

/* ---------------------------------------------------------------- LA FONTAINE de la place : le bassin de pierre, la colonne, la vasque */
T.fontaine = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 37), cx = w / 2;
  /* la colonne et sa vasque */
  var gr = g.createLinearGradient(cx - 30, 0, cx + 30, 0); gr.addColorStop(0, '#8f8576'); gr.addColorStop(.35, '#e2dac8'); gr.addColorStop(1, '#7f7566');
  g.fillStyle = gr; g.fillRect(cx - 22, h * .2, 44, h * .5);
  g.fillStyle = '#c9bfac'; g.beginPath(); g.ellipse(cx, h * .2, w * .2, h * .045, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(24,14,10,.7)'; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = '#a69c8a'; g.beginPath(); g.moveTo(cx - w * .2, h * .2); g.quadraticCurveTo(cx - w * .12, h * .33, cx - 24, h * .34); g.lineTo(cx + 24, h * .34); g.quadraticCurveTo(cx + w * .12, h * .33, cx + w * .2, h * .2); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#b9af9c'; g.beginPath(); g.arc(cx, h * .12, h * .06, 0, 7); g.fill(); g.stroke(); g.fillRect(cx - 9, h * .14, 18, h * .07);
  /* le bassin : huit pans, la margelle */
  var by = h * .62;
  pierres(g, R, w * .04, by, w * .92, h - by, {c:'#b7ad9a', c2:'#a59b88', hr:(h - by) / 3, lw:90, graine:39, mousse:.5});
  [.27, .73].forEach(function(k){ g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(w * k - 2, by, 4, h - by); });
  var s = g.createLinearGradient(0, 0, w, 0); s.addColorStop(0, 'rgba(0,0,0,.34)'); s.addColorStop(.27, 'rgba(0,0,0,.05)'); s.addColorStop(.5, 'rgba(255,245,225,.12)'); s.addColorStop(.73, 'rgba(0,0,0,.08)'); s.addColorStop(1, 'rgba(0,0,0,.4)'); g.fillStyle = s; g.fillRect(w * .04, by, w * .92, h - by);
  g.fillStyle = '#d2c8b4'; rr(g, 0, by - 16, w, 24, 8); g.fill(); g.strokeStyle = 'rgba(24,14,10,.7)'; g.stroke();
  g.fillStyle = 'rgba(120,170,190,.5)'; g.fillRect(w * .05, by - 12, w * .9, 5);
  voile(g, 0, 0, w, h, 43, 1.4, .1);
  return c;
};

/* ---------------------------------------------------------------- LES COLLINES et LES ARBRES (de jour) */
T.collines = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 47), col = hex(o.c || '#5f8a5a'), col2 = hex(o.c2 || '#86a878');
  var pts = [], n = 60;
  for(var i = 0; i <= n; i++){ var x = i / n; pts.push([x * w, h * (o.base || .5) - h * (o.amp || .3) * (U.fbm(x * (o.f || 3) + (o.graine || 1), o.graine || 1, 3) + (o.bosse ? o.bosse(x) : 0))]); }
  g.beginPath(); g.moveTo(0, h); pts.forEach(function(p){ g.lineTo(p[0], p[1]); }); g.lineTo(w, h); g.closePath();
  var gr = g.createLinearGradient(0, h * .1, 0, h); gr.addColorStop(0, css(col2)); gr.addColorStop(.6, css(col)); gr.addColorStop(1, css(ton(col, -.25)));
  g.fillStyle = gr; g.fill(); g.save(); g.clip();
  /* les bois : des touffes sombres, par paquets ; les champs : des bandes plus claires */
  for(i = 0; i < (o.bois == null ? 260 : o.bois); i++){ var bx = R() * w, k = Math.floor(bx / w * n), top = pts[Math.min(n, k)][1], by = top + 4 + R() * R() * (h - top), r = (5 + R() * 12) * (o.ech || 1);
    g.fillStyle = css(ton(col, -.3 - R() * .2)); g.beginPath(); g.arc(bx, by, r, 0, 7); g.fill(); g.fillStyle = rgba(ton(col2, .1), .5); g.beginPath(); g.arc(bx - r * .3, by - r * .3, r * .5, 0, 7); g.fill(); }
  for(i = 0; i < 14; i++) tache(g, R() * w, h * (.5 + R() * .5), 60 + R() * 160, 14 + R() * 30, R() < .5 ? [200, 196, 120] : [120, 160, 96], .25);
  voile(g, 0, 0, w, h, (o.graine || 1) + 51, 2.2, .2);
  g.restore();
  return c;
};
/* un bouquet d'arbres feuillus, de jour : des boules de feuilles (l'ombre dessous, la lumière en haut à gauche), les troncs */
function boule(g, R, x, y, r, tons){
  for(var i = 0; i < 26; i++){ var a = R() * 6.283, d = Math.sqrt(R()) * r, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .82, k = U.clamp(.5 - (px - x) / r * .28 - (py - y) / r * .5 + (R() - .5) * .3, 0, 1);
    var t = k > .72 ? tons[3] : k > .46 ? tons[2] : k > .22 ? tons[1] : tons[0];
    g.fillStyle = css(ton(t, (R() - .5) * .14)); g.beginPath(); g.arc(px, py, r * (.2 + R() * .2), 0, 7); g.fill(); }
  for(i = 0; i < 40; i++){ var a2 = R() * 6.283, d2 = Math.sqrt(R()) * r * 1.02, qx = x + Math.cos(a2) * d2, qy = y + Math.sin(a2) * d2 * .84, k2 = U.clamp(.5 - (qx - x) / r * .3 - (qy - y) / r * .5, 0, 1);
    g.fillStyle = css(ton(k2 > .6 ? tons[3] : k2 > .35 ? tons[2] : tons[1], (R() - .3) * .2)); g.beginPath(); g.ellipse(qx, qy, r * .06, r * .035, R() * 3, 0, 7); g.fill(); }
}
T.TONS_JOUR = [[38, 66, 40], [58, 98, 52], [92, 136, 66], [150, 178, 92]];
T.arbres = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 53), tons = o.tons || T.TONS_JOUR;
  (o.arbres || [[.5, .6]]).forEach(function(a){
    var x = a[0] * w, ht = a[1] * h, r = (a[2] || .3) * h, base = h;
    var gr = g.createLinearGradient(x - 12, 0, x + 12, 0); gr.addColorStop(0, '#3a2a1c'); gr.addColorStop(.4, '#7a5a3c'); gr.addColorStop(1, '#2e2016');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - r * .14, base); g.quadraticCurveTo(x - r * .06, base - ht * .5, x - r * .05, base - ht); g.lineTo(x + r * .05, base - ht); g.quadraticCurveTo(x + r * .06, base - ht * .5, x + r * .14, base); g.closePath(); g.fill();
    var n = 5 + Math.floor(R() * 3);
    for(var i = 0; i < n; i++) boule(g, R, x + (R() - .5) * r * 1.3, base - ht - r * .1 + (R() - .5) * r * .9, r * (.42 + R() * .3), tons);
    boule(g, R, x, base - ht - r * .5, r * .6, tons);
  });
  return c;
};
/* une haie, un buisson fleuri */
T.buisson = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 59);
  for(var i = 0; i < (o.n || 5); i++) boule(g, R, w * (.16 + .68 * (i + .5) / (o.n || 5)), h * (.62 + R() * .1), h * (.34 + R() * .1), o.tons || T.TONS_JOUR);
  if(o.fleurs) for(i = 0; i < 46; i++){ g.fillStyle = css(ton(hex(o.fleurs), (R() - .4) * .4)); g.beginPath(); g.arc(w * (.1 + R() * .8), h * (.34 + R() * .5), 2 + R() * 3, 0, 7); g.fill(); }
  return c;
};
/* un voile de brume (blanc, plus épais en bas) */
T.brume = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 61);
  for(var i = 0; i < (o.n || 60); i++) tache(g, R() * w, h * (.35 + R() * .65), w * (.05 + R() * .14), h * (.1 + R() * .3), o.c || [255, 255, 255], o.a || .08);
  return c;
};
/* des nuages (blancs, la transparence fait la forme) : le film leur donne leur couleur */
T.nuages = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 67);
  for(var k = 0; k < (o.n || 16); k++){
    var cx = R() * w, cy = h * (.2 + R() * .6), L = w * (.06 + R() * .14), e = h * (.05 + R() * .09);
    for(var q = 0; q < 16; q++) tache(g, cx + (R() - .5) * L * 2, cy + (R() - .5) * e * 1.4, L * (.3 + R() * .5), e * (.5 + R() * .8), [255, 255, 255], .16 + R() * .14);
  }
  return c;
};

/* ---------------------------------------------------------------- LES SOLS (des tuiles qui se répètent sans couture) */
function tuileSol(n, graine, peindre){
  var c = toile(n, n), g = c.getContext('2d'), R = U.hasard(graine);
  /* tout est peint neuf fois, décalé d'une tuile : ce qui dépasse d'un bord revient par l'autre */
  var L = peindre(R, n);
  [-1, 0, 1].forEach(function(dx){ [-1, 0, 1].forEach(function(dy){ g.save(); g.translate(dx * n, dy * n); L.forEach(function(f){ f(g); }); g.restore(); }); });
  return {c:c, g:g, R:R};
}
/* les pavés de la place : des rangées de pavés arrondis, chacun sa teinte, la terre sombre entre eux, la mousse */
T.paves = function(o){
  o = o || {};
  var n = o.n || 1024, base = hex(o.c || '#9a9186'), q = tuileSol(n, o.graine || 71, function(R){
    var L = [], rangs = o.rangs || 13, hr = n / rangs;
    for(var r = 0; r < rangs; r++){
      var x = -R() * 60, y = r * hr;
      while(x < n){
        (function(x, y, bw, c, sh){
          L.push(function(g){
            g.fillStyle = css(c); rr(g, x + 3, y + 3, bw - 6, hr - 6, 12); g.fill();
            var gr = g.createLinearGradient(x, y, x + bw * .4, y + hr); gr.addColorStop(0, 'rgba(255,250,240,' + sh + ')'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.26)');
            g.fillStyle = gr; rr(g, x + 3, y + 3, bw - 6, hr - 6, 12); g.fill();
          });
        })(x, y, hr * (.8 + R() * .9), ton(mel(base, [140, 120, 104], R() * .5), (R() - .5) * .26), .16 + R() * .16);
        x += hr * (.8 + R() * .9) * .92 + 2;
      }
    }
    return L;
  });
  var g = q.g, R = q.R;
  g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#3e372f'; g.fillRect(0, 0, n, n); g.globalCompositeOperation = 'source-over';
  voile(g, 0, 0, n, n, 73, 2, .24); voile(g, 0, 0, n, n, 75, .5, .12, true);
  points(g, R, 0, 0, n, n, 2600, '#2a2622', .2, 1.3);
  for(var i = 0; i < 26; i++){ var mx = R() * n, my = R() * n; [-n, 0, n].forEach(function(dx){ [-n, 0, n].forEach(function(dy){ tache(g, mx + dx, my + dy, 16 + (i % 5) * 7, 9 + (i % 3) * 5, [86, 108, 60], .26); }); }); }
  return q.c;
};
/* l'herbe de jour : le vert, des touffes plus claires et plus sombres, des brins, des trèfles, quelques pâquerettes */
T.herbe = function(o){
  o = o || {};
  var n = o.n || 1024, c = toile(n, n), g = c.getContext('2d'), R = U.hasard(o.graine || 79), base = hex(o.c || '#5f8f4a');
  g.fillStyle = css(base); g.fillRect(0, 0, n, n);
  voile(g, 0, 0, n, n, 81, 2, .3); voile(g, 0, 0, n, n, 83, 1.1, .16, true);
  function brin(x, y, l, c2){ [-n, 0, n].forEach(function(dx){ [-n, 0, n].forEach(function(dy){ g.strokeStyle = c2; g.beginPath(); g.moveTo(x + dx, y + dy); g.quadraticCurveTo(x + dx + l * .2, y + dy - l * .6, x + dx + l * .5, y + dy - l); g.stroke(); }); }); }
  g.lineWidth = 1.5;
  for(var i = 0; i < 5200; i++) brin(R() * n, R() * n, (5 + R() * 12) * (R() < .5 ? 1 : -1), css(ton(base, (R() - .45) * .5)));
  for(i = 0; i < 60; i++){ var px = R() * n, py = R() * n; g.fillStyle = '#f4f2e6'; for(var k = 0; k < 6; k++){ g.beginPath(); g.ellipse(px + Math.cos(k) * 3.2, py + Math.sin(k) * 3.2, 2.2, 1.3, k, 0, 7); g.fill(); } g.fillStyle = '#f0c63a'; g.beginPath(); g.arc(px, py, 1.6, 0, 7); g.fill(); }
  return c;
};
/* le plancher du bureau : de longues lames cirées, les joints, les clous, le fil du bois */
T.plancher = function(o){
  o = o || {};
  var n = o.n || 1024, c = toile(n, n), g = c.getContext('2d'), R = U.hasard(o.graine || 87), base = hex(o.c || '#8a5e3a'), lames = 8, hl = n / lames;
  for(var r = 0; r < lames; r++){
    var x = -R() * n * .6;
    while(x < n){ var L = n * (.45 + R() * .5), cc = ton(base, (R() - .5) * .24);
      var gr = g.createLinearGradient(0, r * hl, 0, (r + 1) * hl); gr.addColorStop(0, css(ton(cc, .1))); gr.addColorStop(.5, css(cc)); gr.addColorStop(1, css(ton(cc, -.2)));
      g.fillStyle = gr; g.fillRect(x, r * hl, L, hl);
      g.strokeStyle = rgba(ton(cc, -.5), .35); g.lineWidth = .8;
      for(var k = 0; k < 9; k++){ var fy = r * hl + 3 + R() * (hl - 6); g.beginPath(); g.moveTo(x, fy); g.bezierCurveTo(x + L * .3, fy + (R() - .5) * 8, x + L * .7, fy + (R() - .5) * 8, x + L, fy + (R() - .5) * 4); g.stroke(); }
      g.fillStyle = 'rgba(20,12,8,.7)'; g.fillRect(x - 1, r * hl, 2.2, hl); g.fillStyle = 'rgba(30,20,14,.8)'; [.2, .8].forEach(function(q){ g.beginPath(); g.arc(x + 9, (r + q) * hl, 2, 0, 7); g.fill(); g.beginPath(); g.arc(x + L - 9, (r + q) * hl, 2, 0, 7); g.fill(); });
      x += L; }
    g.fillStyle = 'rgba(20,12,8,.75)'; g.fillRect(0, r * hl - 1, n, 2.2);
  }
  voile(g, 0, 0, n, n, 89, 1.6, .2);
  return c;
};

/* ---------------------------------------------------------------- LA BERGE ET LE LAVOIR (enquête 2) */
/* le quai de pierre, vu depuis l'eau : de gros blocs, la mousse et l'algue en bas, les anneaux de fer */
T.quai = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 91);
  pierres(g, R, 0, 0, w, h, {c:'#9c9486', c2:'#8a8274', hr:h / 3.2, lw:110, graine:93, mousse:.9});
  g.fillStyle = '#b8b0a0'; g.fillRect(0, 0, w, 9); g.fillStyle = 'rgba(255,250,240,.35)'; g.fillRect(0, 0, w, 2.5); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 9, w, 4);
  var s = g.createLinearGradient(0, h * .45, 0, h); s.addColorStop(0, 'rgba(30,50,30,0)'); s.addColorStop(1, 'rgba(24,44,28,.7)'); g.fillStyle = s; g.fillRect(0, h * .45, w, h * .55);
  return c;
};
/* le lavoir : quatre poteaux de chêne, la charpente, le toit de tuiles ; dessous, la pierre à laver, penchée vers l'eau */
T.lavoir = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 97), ty = h * .36;
  /* l'ombre sous le toit (on voit le pré à travers : le lavoir est ouvert), le muret du fond, bas */
  var s = g.createLinearGradient(0, ty, 0, ty + h * .22); s.addColorStop(0, 'rgba(20,16,14,.5)'); s.addColorStop(1, 'rgba(20,16,14,0)'); g.fillStyle = s; g.fillRect(w * .06, ty, w * .88, h * .22);
  pierres(g, R, w * .06, h * .84, w * .88, h * .16, {c:'#8f8779', hr:h * .055, lw:60, graine:99, mousse:.5});
  g.fillStyle = '#a8a092'; g.fillRect(w * .05, h * .84 - 6, w * .9, 9); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(w * .05, h * .84 + 3, w * .9, 4);
  /* le toit */
  tuiles(g, R, [[0, ty + 4], [w * .1, h * .04], [w * .9, h * .04], [w, ty + 4]], '#9a4e36', {graine:101, mousse:true, c2:'#7f4532'});
  g.fillStyle = '#5a3a2a'; g.fillRect(w * .1 - 3, h * .04 - 5, w * .8 + 6, 7);
  /* la charpente et les poteaux */
  poutre(g, R, w * .02, ty + 6, w * .98, ty + 6, 16, '#5a4028');
  [.08, .36, .64, .92].forEach(function(k){ poutre(g, R, w * k, ty + 6, w * k, h, 18, '#5a4028'); poutre(g, R, w * k, ty + 60, w * k + (k < .5 ? 46 : -46), ty + 10, 9, '#4e3622'); });
  return c;
};

/* ---------------------------------------------------------------- LE BUREAU DU MAIRE (enquête 1)
   le mur du fond : la boiserie en bas, la tenture verte au-dessus, la corniche ; le TROU de la haute fenêtre (on voit dehors) ; à gauche,
   le TROU de la porte (le couloir). o : {w, h} en points ; rend la toile ; toile.fenetre et toile.porte : leurs places (0 → 1) */
T.murBureau = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 103), hb = h * .36, yb = h - hb;
  /* la tenture : un vert profond, un motif de losanges et de fleurs de lys, à peine plus clair */
  var gr = g.createLinearGradient(0, 0, 0, yb); gr.addColorStop(0, '#24443c'); gr.addColorStop(1, '#2f5a4e'); g.fillStyle = gr; g.fillRect(0, 0, w, yb);
  g.strokeStyle = 'rgba(214,190,120,.2)'; g.lineWidth = 1.3;
  var pas = 54;
  for(var yy = -pas; yy < yb + pas; yy += pas) for(var xx = -pas; xx < w + pas; xx += pas){
    var ox = xx + ((Math.round(yy / pas) % 2) ? pas / 2 : 0);
    g.beginPath(); g.moveTo(ox, yy - pas * .46); g.quadraticCurveTo(ox + pas * .3, yy, ox, yy + pas * .46); g.quadraticCurveTo(ox - pas * .3, yy, ox, yy - pas * .46); g.stroke();
    g.fillStyle = 'rgba(214,190,120,.22)'; g.beginPath(); g.arc(ox, yy, 3.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(ox - 7, yy + 4, 4.5, 2.2, .6, 0, 7); g.fill(); g.beginPath(); g.ellipse(ox + 7, yy + 4, 4.5, 2.2, -.6, 0, 7); g.fill();
  }
  voile(g, 0, 0, w, yb, 105, 1.8, .22); voile(g, 0, 0, w, yb, 107, .35, .08, true);
  /* la corniche, en haut */
  g.fillStyle = '#5a3c26'; g.fillRect(0, 0, w, 30); planches(g, R, 0, 0, w, 26, '#6a4830', {lp:140}); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 26, w, 8);
  var s0 = g.createLinearGradient(0, 30, 0, 130); s0.addColorStop(0, 'rgba(0,0,0,.4)'); s0.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = s0; g.fillRect(0, 30, w, 100);
  /* la boiserie : des panneaux moulurés */
  planches(g, R, 0, yb, w, hb, '#6e4a30', {lp:44});
  g.fillStyle = '#7e5638'; g.fillRect(0, yb - 8, w, 22); g.fillStyle = 'rgba(255,230,190,.26)'; g.fillRect(0, yb - 8, w, 3); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, yb + 14, w, 5);
  var pw = 170, np = Math.floor(w / pw);
  for(var i = 0; i < np; i++){ var px = (w - np * pw) / 2 + i * pw + 16, py = yb + 38;
    g.strokeStyle = 'rgba(30,18,10,.7)'; g.lineWidth = 3; g.strokeRect(px, py, pw - 32, hb - 84); g.strokeStyle = 'rgba(255,220,170,.22)'; g.lineWidth = 1.4; g.strokeRect(px + 4, py + 4, pw - 40, hb - 92);
    var gp = g.createLinearGradient(px, py, px + pw, py + hb); gp.addColorStop(0, 'rgba(255,220,170,.1)'); gp.addColorStop(1, 'rgba(0,0,0,.16)'); g.fillStyle = gp; g.fillRect(px + 5, py + 5, pw - 42, hb - 94); }
  g.fillStyle = '#4a301e'; g.fillRect(0, h - 26, w, 26); g.fillStyle = 'rgba(255,220,170,.2)'; g.fillRect(0, h - 26, w, 2.5);
  voile(g, 0, yb, w, hb, 109, 1.5, .2);
  /* LA FENÊTRE : un trou dans le mur, son embrasure de bois, sa tablette */
  var F = c.fenetre = {x:o.fx, y:o.fy, w:o.fw, h:o.fh};
  var fx = F.x * w, fy = F.y * h, fw = F.w * w, fh = F.h * h;
  g.fillStyle = '#4a301e'; g.fillRect(fx - 22, fy - 22, fw + 44, fh + 44); planches(g, R, fx - 20, fy - 20, fw + 40, fh + 40, '#7a5438', {lp:24});
  g.strokeStyle = 'rgba(20,12,8,.8)'; g.lineWidth = 2; g.strokeRect(fx - 21, fy - 21, fw + 42, fh + 42);
  g.clearRect(fx, fy, fw, fh);
  g.fillStyle = '#8a6040'; g.fillRect(fx - 34, fy + fh + 20, fw + 68, 16); g.fillStyle = 'rgba(255,225,180,.3)'; g.fillRect(fx - 34, fy + fh + 20, fw + 68, 3); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(fx - 30, fy + fh + 36, fw + 60, 7);
  /* LA PORTE : un trou, son chambranle */
  if(o.px != null){
    var Pp = c.porte = {x:o.px, y:o.py, w:o.pw, h:1 - o.py};
    var qx = Pp.x * w, qy = Pp.y * h, qw = Pp.w * w;
    planches(g, R, qx - 22, qy - 22, qw + 44, h - qy + 22, '#6a4830', {lp:22}); g.strokeStyle = 'rgba(20,12,8,.8)'; g.strokeRect(qx - 22, qy - 22, qw + 44, h - qy + 22);
    g.clearRect(qx, qy, qw, h - qy);
  }
  return c;
};
/* une bibliothèque : des rayons, des livres de toutes les couleurs, quelques objets */
T.bibliotheque = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 113), nr = o.rayons || 5, hr = (h - 30) / nr;
  planches(g, R, 0, 0, w, h, '#5e3f28', {lp:60}); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(14, 16, w - 28, h - 30);
  var COUL = ['#7a2a2a', '#2a4a6a', '#3a5a3a', '#6a4a2a', '#4a2a5a', '#8a6a2a', '#2a5a5a', '#5a2a3a', '#8a7a5a'];
  for(var r = 0; r < nr; r++){
    var y = 16 + r * hr, x = 18;
    while(x < w - 30){
      if(R() < .08){ x += 14 + R() * 30; continue; }
      var lw = 9 + R() * 16, lh = hr * (.6 + R() * .3), cc = ton(hex(COUL[Math.floor(R() * COUL.length)]), (R() - .5) * .3), pen = R() < .1 ? (R() - .5) * .3 : 0;
      g.save(); g.translate(x + lw / 2, y + hr - 9); g.rotate(pen);
      var gr = g.createLinearGradient(-lw / 2, 0, lw / 2, 0); gr.addColorStop(0, css(ton(cc, -.3))); gr.addColorStop(.3, css(ton(cc, .15))); gr.addColorStop(1, css(ton(cc, -.35)));
      g.fillStyle = gr; g.fillRect(-lw / 2, -lh, lw, lh);
      g.fillStyle = 'rgba(220,190,110,.7)'; g.fillRect(-lw / 2 + 1.5, -lh * .82, lw - 3, 1.6); g.fillRect(-lw / 2 + 1.5, -lh * .22, lw - 3, 1.6); if(R() < .5) g.fillRect(-lw / 2 + 2.5, -lh * .6, lw - 5, lh * .16);
      g.restore(); x += lw + .6;
    }
    planches(g, R, 10, y + hr - 9, w - 20, 10, '#7a5438', {lp:w}); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(14, y + hr + 1, w - 28, 6);
  }
  g.strokeStyle = 'rgba(20,12,8,.85)'; g.lineWidth = 2.4; g.strokeRect(1, 1, w - 2, h - 2);
  var s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, 'rgba(0,0,0,.3)'); s.addColorStop(.3, 'rgba(0,0,0,0)'); g.fillStyle = s; g.fillRect(0, 0, w, h);
  return c;
};
/* un tableau dans son cadre doré : un paysage de Brumeval dans la brume */
T.tableau = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 127), e = 16;
  var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#e8c868'); gr.addColorStop(.5, '#a87a22'); gr.addColorStop(1, '#6a4a12'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(40,24,6,.8)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); g.strokeRect(e - 3, e - 3, w - e * 2 + 6, h - e * 2 + 6);
  var cg = g.createLinearGradient(0, e, 0, h - e); cg.addColorStop(0, '#9ab4c8'); cg.addColorStop(.55, '#d8d2b8'); cg.addColorStop(.56, '#7a9a6a'); cg.addColorStop(1, '#4a6a48'); g.fillStyle = cg; g.fillRect(e, e, w - e * 2, h - e * 2);
  g.save(); g.beginPath(); g.rect(e, e, w - e * 2, h - e * 2); g.clip();
  for(var i = 0; i < 7; i++){ var hx = e + (w - e * 2) * (i + .5) / 7, hh = 14 + R() * 20; g.fillStyle = css(ton([120, 96, 80], (R() - .5) * .3)); g.fillRect(hx - 9, h * .56 - hh, 18, hh); g.fillStyle = '#7a4636'; poly(g, [[hx - 12, h * .56 - hh], [hx, h * .56 - hh - 12], [hx + 12, h * .56 - hh]]); g.fill(); }
  for(i = 0; i < 12; i++) tache(g, R() * w, h * (.5 + R() * .2), 30 + R() * 40, 8 + R() * 10, [240, 240, 235], .3);
  voile(g, e, e, w - e * 2, h - e * 2, 129, 1, .2);
  g.restore();
  return c;
};
T.toile = toile;
})();
