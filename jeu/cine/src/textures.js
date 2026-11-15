/* textures.js — les matières du souterrain, peintes une fois sur des toiles (canvas) au chargement :
   la pierre des murs, les dalles du sol, le bois, la lumière des torches cuite dans le mur.
   Rien n'est tiré au hasard sans graine : le décor est le même à chaque film. */
(function(){
'use strict';
var U = window.CU, T = window.CT = {};

function toile(w, h){ var c = document.createElement('canvas'); c.width = Math.round(w); c.height = Math.round(h); return c; }

/* une tuile de bruit (512 × 512) qui se répète sans couture : le grain de la pierre */
T.grain = function(graine, freq, oct){
  var N = 256, c = toile(N, N), g = c.getContext('2d'), im = g.createImageData(N, N), d = im.data;
  for(var y = 0; y < N; y++) for(var x = 0; x < N; x++){
    /* bruit périodique : on mélange les quatre coins (sans couture) */
    var fx = x / N, fy = y / N, f = freq || 8;
    var a = U.fbm2(x / N * f, y / N * f, graine, oct || 5), b = U.fbm2((x / N - 1) * f, y / N * f, graine, oct || 5),
        cc = U.fbm2(x / N * f, (y / N - 1) * f, graine, oct || 5), dd = U.fbm2((x / N - 1) * f, (y / N - 1) * f, graine, oct || 5);
    var v = U.lerp(U.lerp(a, b, fx), U.lerp(cc, dd, fx), fy);
    var k = (y * N + x) * 4, n = Math.round(U.clamp((v - .5) * 2.2 + .5, 0, 1) * 255);
    d[k] = d[k + 1] = d[k + 2] = n; d[k + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
};

/* LE MUR DE PIERRE : de gros blocs taillés, irréguliers, du mortier, la suie au-dessus des torches, l'humidité en bas.
   o = {w, h, graine, torches:[[x, y]], arche:{x, w, h} (un trou en arc dans le mur), echelle (px par unité)} */
T.mur = function(o){
  var e = o.echelle || 1, W = o.w * e, H = o.h * e, c = toile(W, H), g = c.getContext('2d'), R = U.hasard(o.graine || 7);
  g.scale(e, e);
  /* le fond : le mortier, sombre */
  g.fillStyle = '#1d1712'; g.fillRect(0, 0, o.w, o.h);
  /* les rangées de blocs */
  var y = o.h, rang = 0;
  while(y > -10){
    var hb = 70 + R() * 46, x = -R() * 120;
    while(x < o.w){
      var wb = 110 + R() * 150, j = 3 + R() * 3;
      var ton = 52 + R() * 26, ch = R();
      var col = 'rgb(' + Math.round(ton * 1.12 + ch * 8) + ',' + Math.round(ton * 1.0) + ',' + Math.round(ton * .88 - ch * 6) + ')';
      /* un bloc un peu de travers, aux coins cassés */
      var x0 = x + j * .5, y0 = y - hb + j * .5, x1 = x + wb - j * .5, y1 = y - j * .5, cc = 6 + R() * 10;
      g.beginPath();
      g.moveTo(x0 + cc * R(), y0 + R() * 3); g.lineTo(x1 - cc * R(), y0 + R() * 3);
      g.lineTo(x1 + R() * 2, y0 + cc * R()); g.lineTo(x1 - R() * 2, y1 - cc * R());
      g.lineTo(x1 - cc * R(), y1 + R() * 2); g.lineTo(x0 + cc * R(), y1 - R() * 2);
      g.lineTo(x0 - R() * 2, y1 - cc * R()); g.lineTo(x0 + R() * 2, y0 + cc * R()); g.closePath();
      var gr = g.createLinearGradient(x0, y0, x0 + wb * .3, y1);
      gr.addColorStop(0, col); gr.addColorStop(1, 'rgb(' + Math.round(ton * .82) + ',' + Math.round(ton * .74) + ',' + Math.round(ton * .64) + ')');
      g.fillStyle = gr; g.fill();
      /* l'arête du haut accroche la lumière ; celle du bas est dans l'ombre */
      g.strokeStyle = 'rgba(255,230,190,.10)'; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(x0 + 4, y0 + 2); g.lineTo(x1 - 4, y0 + 2); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x0 + 4, y1 - 1); g.lineTo(x1 - 4, y1 - 1); g.stroke();
      /* une fissure de temps en temps */
      if(R() < .18){
        g.strokeStyle = 'rgba(10,6,4,.55)'; g.lineWidth = 1.4; g.beginPath();
        var fx = x0 + wb * (.2 + R() * .6), fy = y0 + 4; g.moveTo(fx, fy);
        for(var s = 0; s < 4; s++){ fx += (R() - .5) * 24; fy += hb * .22; g.lineTo(fx, fy); }
        g.stroke();
      }
      x += wb;
    }
    y -= hb; rang++;
  }
  /* le grain de la pierre, par-dessus (multiplié) */
  var gr1 = T._grain || (T._grain = T.grain(3, 10, 5)), gr2 = T._grainFin || (T._grainFin = T.grain(11, 34, 3));
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55;
  g.fillStyle = g.createPattern(gr1, 'repeat'); g.fillRect(0, 0, o.w, o.h);
  g.globalAlpha = .35; g.fillStyle = g.createPattern(gr2, 'repeat'); g.fillRect(0, 0, o.w, o.h);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  /* l'humidité en bas, des coulures */
  var hu = g.createLinearGradient(0, o.h, 0, o.h - 360);
  hu.addColorStop(0, 'rgba(14,18,10,.75)'); hu.addColorStop(1, 'rgba(14,18,10,0)');
  g.fillStyle = hu; g.fillRect(0, o.h - 360, o.w, 360);
  for(var k = 0; k < o.w / 70; k++){
    var cx = R() * o.w, lg = 120 + R() * 380, la = 10 + R() * 30;
    var co = g.createLinearGradient(0, 0, 0, lg); co.addColorStop(0, 'rgba(8,10,6,0)'); co.addColorStop(.3, 'rgba(8,10,6,.22)'); co.addColorStop(1, 'rgba(8,10,6,0)');
    g.fillStyle = co; g.save(); g.translate(cx, R() * o.h * .7); g.fillRect(-la / 2, 0, la, lg); g.restore();
  }
  /* le haut se perd dans le noir (la voûte) */
  var ha = g.createLinearGradient(0, 0, 0, o.h * .55);
  ha.addColorStop(0, 'rgba(4,3,6,.96)'); ha.addColorStop(1, 'rgba(4,3,6,0)');
  g.fillStyle = ha; g.fillRect(0, 0, o.w, o.h * .55);
  /* la suie au-dessus des torches, et leur lumière cuite dans la pierre */
  (o.torches || []).forEach(function(t){
    var su = g.createRadialGradient(t[0], t[1] - 160, 10, t[0], t[1] - 150, 230);
    su.addColorStop(0, 'rgba(0,0,0,.6)'); su.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = su; g.fillRect(t[0] - 260, t[1] - 420, 520, 420);
  });
  g.globalCompositeOperation = 'lighter';
  (o.torches || []).forEach(function(t){
    var li = g.createRadialGradient(t[0], t[1], 20, t[0], t[1] + 40, 520);
    li.addColorStop(0, 'rgba(255,170,80,.50)'); li.addColorStop(.35, 'rgba(220,110,40,.20)'); li.addColorStop(1, 'rgba(120,50,10,0)');
    g.fillStyle = li; g.fillRect(t[0] - 560, t[1] - 520, 1120, 1100);
  });
  g.globalCompositeOperation = 'source-over';
  /* un trou en arc (l'escalier) : on gomme */
  if(o.arche){
    var a = o.arche; g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.moveTo(a.x, o.h); g.lineTo(a.x, o.h - a.h + a.w / 2); g.arc(a.x + a.w / 2, o.h - a.h + a.w / 2, a.w / 2, Math.PI, 0); g.lineTo(a.x + a.w, o.h); g.closePath(); g.fill();
    g.globalCompositeOperation = 'source-over';
    /* les claveaux de l'arc, plus clairs, autour du trou */
    var r0 = a.w / 2, cy = o.h - a.h + a.w / 2, cx2 = a.x + a.w / 2;
    for(var v = 0; v < 15; v++){
      var a0 = Math.PI + v / 15 * Math.PI, a1 = Math.PI + (v + 1) / 15 * Math.PI;
      g.beginPath(); g.arc(cx2, cy, r0 + 70, a0 + .006, a1 - .006); g.arc(cx2, cy, r0, a1 - .006, a0 + .006, true); g.closePath();
      var t2 = 70 + R() * 18; g.fillStyle = 'rgb(' + Math.round(t2 * 1.1) + ',' + Math.round(t2) + ',' + Math.round(t2 * .86) + ')'; g.fill();
      g.strokeStyle = '#120d09'; g.lineWidth = 3; g.stroke();
    }
    [a.x - 70, a.x + a.w].forEach(function(px){
      for(var yy = o.h; yy > cy; yy -= 90){ g.fillStyle = 'rgb(' + Math.round(76 + R() * 14) + ',' + Math.round(68 + R() * 12) + ',' + Math.round(58 + R() * 10) + ')'; g.fillRect(px + 2, yy - 88, 66, 86); g.strokeStyle = '#120d09'; g.strokeRect(px + 2, yy - 88, 66, 86); }
    });
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.fillStyle = g.createPattern(gr1, 'repeat');
    g.fillRect(a.x - 80, o.h - a.h - 80, a.w + 160, a.h + 80); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  return c;
};

/* LE SOL : de grandes dalles usées, de la farine et de la paille par endroits (c'est le repaire d'un meunier) */
T.sol = function(o){
  var e = o.echelle || .6, c = toile(o.w * e, o.d * e), g = c.getContext('2d'), R = U.hasard(o.graine || 5);
  g.scale(e, e);
  g.fillStyle = '#1a1511'; g.fillRect(0, 0, o.w, o.d);
  var tl = 150;
  for(var j = 0; j * tl < o.d + tl; j++){
    var dec = (j % 2) * tl * .5 + R() * 30;
    for(var i = -1; i * tl < o.w + tl; i++){
      var x = i * tl * 1.3 + dec, y = j * tl, w = tl * 1.3 - 6, h = tl - 6, t = 48 + R() * 22;
      g.fillStyle = 'rgb(' + Math.round(t * 1.08) + ',' + Math.round(t * .98) + ',' + Math.round(t * .86) + ')';
      g.beginPath(); var cc = 8 + R() * 10;
      g.moveTo(x + cc, y); g.lineTo(x + w - cc * R(), y + R() * 3); g.lineTo(x + w, y + h - cc); g.lineTo(x + w - cc, y + h); g.lineTo(x + cc * R(), y + h - R() * 3); g.lineTo(x, y + cc); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,225,180,.06)'; g.lineWidth = 2; g.stroke();
    }
  }
  var gr1 = T._grain || (T._grain = T.grain(3, 10, 5));
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .6; g.fillStyle = g.createPattern(gr1, 'repeat'); g.fillRect(0, 0, o.w, o.d);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  /* la farine renversée et la paille (près des sacs) */
  (o.farine || []).forEach(function(f){
    var fa = g.createRadialGradient(f[0], f[1], 0, f[0], f[1], f[2]);
    fa.addColorStop(0, 'rgba(230,220,200,.45)'); fa.addColorStop(.6, 'rgba(220,210,190,.18)'); fa.addColorStop(1, 'rgba(220,210,190,0)');
    g.fillStyle = fa; g.beginPath(); g.ellipse(f[0], f[1], f[2], f[2] * .7, 0, 0, 7); g.fill();
  });
  (o.paille || []).forEach(function(p){
    for(var k = 0; k < p[2]; k++){
      var a = R() * 7, l = 14 + R() * 26, x = p[0] + (R() - .5) * p[3], y = p[1] + (R() - .5) * p[3] * .7;
      g.strokeStyle = 'rgba(' + Math.round(190 + R() * 50) + ',' + Math.round(150 + R() * 40) + ',70,' + (.5 + R() * .4) + ')'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  });
  /* la lumière des torches au pied du mur */
  g.globalCompositeOperation = 'lighter';
  (o.lumieres || []).forEach(function(l){
    var li = g.createRadialGradient(l[0], l[1], 10, l[0], l[1], l[2]);
    li.addColorStop(0, 'rgba(255,160,70,' + (l[3] || .35) + ')'); li.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = li; g.fillRect(l[0] - l[2], l[1] - l[2], l[2] * 2, l[2] * 2);
  });
  g.globalCompositeOperation = 'source-over';
  return c;
};

/* une planche de bois (les marches, les caisses) */
T.bois = function(w, h, graine, ton){
  var c = toile(w, h), g = c.getContext('2d'), R = U.hasard(graine || 9), t = ton || 80;
  g.fillStyle = 'rgb(' + t + ',' + Math.round(t * .66) + ',' + Math.round(t * .4) + ')'; g.fillRect(0, 0, w, h);
  for(var k = 0; k < h; k += 2){
    var v = U.fbm(k * .05, graine, 3);
    g.fillStyle = 'rgba(30,16,6,' + (.15 + v * .2) + ')'; g.fillRect(0, k, w, 1);
  }
  return c;
};
})();
