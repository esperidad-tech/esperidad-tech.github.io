/* decors-film.js — LES DÉCORS PEINTS des films en 2D (multiplan.js ; Bible §13.68) : la pierre, la roche, les dalles, les troncs,
   le puits, les arches, les objets (le carnet, la pierre de rune, la porte et la clé). Des pinceaux : chacun peint dans une toile
   (g : le contexte 2D), en unités du calque. Tout est peint EN PLEIN JOUR, en tons moyens : c'est la lumière du film (un filtre par
   calque) qui fait la nuit, les ronds de torche et le relief — plus la peinture est claire et contrastée (joints sombres, pierres
   claires), plus la lumière a de quoi accrocher. Rien n'est tiré au hasard sans graine. */
(function(){
'use strict';
var U = window.CU, DF = window.DF = {};
function rgb(c, a){ return 'rgba(' + Math.round(U.clamp(c[0], 0, 255)) + ',' + Math.round(U.clamp(c[1], 0, 255)) + ',' + Math.round(U.clamp(c[2], 0, 255)) + ',' + (a == null ? 1 : a) + ')'; }
function mel(a, b, k){ return [U.lerp(a[0], b[0], k), U.lerp(a[1], b[1], k), U.lerp(a[2], b[2], k)]; }
function mul(c, k){ return [c[0] * k, c[1] * k, c[2] * k]; }
DF.rgb = rgb; DF.mel = mel;
function tache(g, x, y, rx, ry, c, a){
  var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  gr.addColorStop(0, rgb(c, a)); gr.addColorStop(.6, rgb(c, a * .45)); gr.addColorStop(1, rgb(c, 0));
  g.save(); g.translate(x, y); g.scale(rx, ry); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill(); g.restore();
}
DF.tache = tache;
/* le grain de la pierre : un petit carreau de points, répété (clairs et sombres) */
var _grain = {};
function grain(force, graine){
  var cle = force + '|' + graine; if(_grain[cle]) return _grain[cle];
  var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'), R = U.hasard(graine || 9), i;
  for(i = 0; i < 5200; i++){ var v = R(); g.fillStyle = v < .5 ? 'rgba(0,0,0,' + (R() * force) + ')' : 'rgba(255,255,255,' + (R() * force * .7) + ')'; var s = .6 + R() * 1.6; g.fillRect(R() * 256, R() * 256, s, s); }
  for(i = 0; i < 60; i++){ g.fillStyle = 'rgba(0,0,0,' + (R() * force * .9) + ')'; g.beginPath(); g.ellipse(R() * 256, R() * 256, 1 + R() * 3, 1 + R() * 2, R() * 3, 0, 7); g.fill(); }
  return (_grain[cle] = c);
}
function grainer(g, x, y, w, h, force, graine){ g.save(); g.fillStyle = g.createPattern(grain(force, graine), 'repeat'); g.globalCompositeOperation = 'source-atop'; g.fillRect(x, y, w, h); g.restore(); }
DF.grainer = grainer;

/* ---------------------------------------------------------------- UNE PIERRE TAILLÉE (un bloc, avec ses éclats, son arête claire en haut) */
function bloc(g, x, y, w, h, c, R, o){
  o = o || {};
  var r = Math.min(o.r == null ? 4 : o.r, w / 3, h / 3), j = o.j == null ? 2.2 : o.j;
  x += j; y += j; w -= 2 * j; h -= 2 * j;
  if(w < 3 || h < 3) return;
  var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, rgb(mul(c, 1.1))); gr.addColorStop(.25, rgb(c)); gr.addColorStop(1, rgb(mul(c, .8)));
  g.fillStyle = gr;
  g.beginPath();
  var d = function(){ return (R() - .5) * 2.4; };
  g.moveTo(x + r + d(), y + d()); g.lineTo(x + w - r + d(), y + d()); g.quadraticCurveTo(x + w, y, x + w + d(), y + r + d());
  g.lineTo(x + w + d(), y + h - r + d()); g.quadraticCurveTo(x + w, y + h, x + w - r + d(), y + h + d());
  g.lineTo(x + r + d(), y + h + d()); g.quadraticCurveTo(x, y + h, x + d(), y + h - r + d()); g.lineTo(x + d(), y + r + d()); g.quadraticCurveTo(x, y, x + r, y);
  g.closePath(); g.fill();
  /* l'arête du haut accroche la lumière, le bas est dans l'ombre */
  g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + r, y + 1.4); g.lineTo(x + w - r, y + 1.4); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x + r, y + h - 1.2); g.lineTo(x + w - r, y + h - 1.2); g.stroke();
  /* des plaques, des piqûres, un éclat, une fissure */
  var n = Math.round(w * h / 900);
  for(var i = 0; i < n; i++) tache(g, x + R() * w, y + R() * h, 6 + R() * w * .25, 4 + R() * h * .3, R() < .55 ? [0, 0, 0] : [255, 255, 255], .05 + R() * .08);
  if(R() < .3){ g.fillStyle = 'rgba(0,0,0,.45)'; var cx = R() < .5 ? x : x + w, cy = R() < .5 ? y : y + h, s = 5 + R() * 9; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (cx === x ? s : -s), cy); g.lineTo(cx, cy + (cy === y ? s : -s) * .8); g.closePath(); g.fill(); }
  if(R() < (o.fis == null ? .16 : o.fis)){
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.2; g.beginPath(); var fx = x + w * (.2 + R() * .6), fy = y; g.moveTo(fx, fy);
    for(var k = 0; k < 4; k++){ fx += (R() - .5) * 12; fy += h / 4; g.lineTo(fx, fy); } g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 1; g.stroke();
  }
}
DF.bloc = bloc;

/* ---------------------------------------------------------------- UN MUR DE PIERRES (en assises)
   o = {graine, rang (hauteur d'une assise), larg:[mini, maxi], ton:[r, v, b], joint:[r, v, b], mousse (0 → 1), humide (0 → 1), suie, rond (le mur d'un puits : sombre sur les côtés)} */
DF.mur = function(g, x, y, w, h, o){
  o = o || {};
  var R = U.hasard(o.graine || 3), rang = o.rang || 46, ton = o.ton || [128, 124, 132], joint = o.joint || [34, 31, 38], la = o.larg || [70, 130];
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = rgb(joint); g.fillRect(x, y, w, h);
  for(var yy = y, r = 0; yy < y + h; r++){
    var hr = rang * (.86 + R() * .28), xx = x - R() * la[1];
    while(xx < x + w){
      var bw = U.lerp(la[0], la[1], R()), v = .78 + R() * .42, c = mel(mul(ton, v), [ton[0] * 1.05, ton[1] * .98, ton[2] * .9], R() * .5);
      if(R() < .08) c = mul(c, .7);
      bloc(g, xx, yy, bw, hr, c, R, o);
      xx += bw;
    }
    yy += hr;
  }
  grainer(g, x, y, w, h, .2, 5);
  var i;
  /* l'humidité : de grandes coulures sombres ; la suie ; la mousse, dans les joints et en bas */
  for(i = 0; i < Math.round(w / 260 * (o.humide == null ? 1 : o.humide)); i++){ var hx = x + R() * w, hh = h * (.3 + R() * .6); tache(g, hx, y + (R() < .5 ? 0 : h), 30 + R() * 70, hh, [10, 14, 18], .3 + R() * .2); }
  for(i = 0; i < Math.round(w * h / 60000); i++) tache(g, x + R() * w, y + R() * h, 60 + R() * 160, 50 + R() * 120, R() < .5 ? [0, 0, 0] : [200, 200, 215], .08 + R() * .1);
  var mo = o.mousse == null ? .5 : o.mousse;
  for(i = 0; i < Math.round(w / 40 * mo); i++){
    var mx = x + R() * w, my = y + h - Math.pow(R(), 2.2) * h * .8, mr = 8 + R() * 26;
    tache(g, mx, my, mr * 1.5, mr * .7, [58 + R() * 30, 96 + R() * 30, 60], .5 + R() * .3);
    g.fillStyle = rgb([86 + R() * 40, 128 + R() * 30, 74], .5); for(var q = 0; q < 7; q++){ g.beginPath(); g.arc(mx + (R() - .5) * mr * 2, my + (R() - .5) * mr * .8, 1 + R() * 2.2, 0, 7); g.fill(); }
  }
  if(o.rond){
    var gr = g.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(.2, 'rgba(0,0,0,.3)'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); gr.addColorStop(.8, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,.85)');
    g.fillStyle = gr; g.fillRect(x, y, w, h);
  }
  g.restore();
};

/* ---------------------------------------------------------------- LA ROCHE BRUTE (des facettes) ; o = {graine, ton, taille} */
DF.roche = function(g, x, y, w, h, o){
  o = o || {};
  var R = U.hasard(o.graine || 13), t = o.taille || 70, ton = o.ton || [92, 88, 96], nx = Math.ceil(w / t) + 2, ny = Math.ceil(h / t) + 2, P = [], i, j;
  for(j = 0; j <= ny; j++){ P.push([]); for(i = 0; i <= nx; i++) P[j].push([x + (i - 1 + (R() - .5) * .8) * t, y + (j - 1 + (R() - .5) * .8) * t]); }
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = rgb(mul(ton, .4)); g.fillRect(x, y, w, h);
  for(j = 0; j < ny; j++) for(i = 0; i < nx; i++){
    var a = P[j][i], b = P[j][i + 1], c = P[j + 1][i + 1], d = P[j + 1][i], dia = R() < .5;
    [dia ? [a, b, c] : [a, b, d], dia ? [a, c, d] : [b, c, d]].forEach(function(tr){
      var v = .62 + R() * .62; g.fillStyle = rgb(mel(mul(ton, v), [ton[0] * 1.08, ton[1], ton[2] * .88], R() * .5));
      g.beginPath(); g.moveTo(tr[0][0], tr[0][1]); g.lineTo(tr[1][0], tr[1][1]); g.lineTo(tr[2][0], tr[2][1]); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.6; g.stroke();
    });
  }
  grainer(g, x, y, w, h, .24, 7);
  for(i = 0; i < Math.round(w * h / 30000); i++) tache(g, x + R() * w, y + R() * h, 40 + R() * 140, 40 + R() * 110, R() < .6 ? [0, 0, 0] : [210, 210, 225], .1 + R() * .14);
  g.restore();
};

/* ---------------------------------------------------------------- LE SOL DE DALLES, vu de côté (une bande : le fond en haut, le bord près de nous en bas)
   o = {graine, ton, rangs, larg} */
DF.dalles = function(g, x, y, w, h, o){
  o = o || {};
  var R = U.hasard(o.graine || 23), ton = o.ton || [118, 114, 120], n = o.rangs || 3, la = o.larg || 150, yy = y, k;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = rgb([30, 28, 34]); g.fillRect(x, y, w, h);
  var tot = 0; for(k = 0; k < n; k++) tot += 1 + k * .75;
  for(k = 0; k < n; k++){
    var hr = h * (1 + k * .75) / tot, l = la * (1 + k * .35), xx = x - R() * l;
    while(xx < x + w){ var bw = l * (.7 + R() * .6); bloc(g, xx, yy, bw, hr, mul(ton, (.8 + R() * .36) * (.86 + k * .09)), R, {j:1.8 + k * .5, r:3, fis:.22}); xx += bw; }
    yy += hr;
  }
  grainer(g, x, y, w, h, .22, 11);
  for(k = 0; k < Math.round(w / 200); k++) tache(g, x + R() * w, y + R() * h, 50 + R() * 120, 10 + R() * 22, R() < .7 ? [0, 0, 0] : [215, 215, 230], .12 + R() * .12);
  /* le pied du mur : une ombre */
  var gr = g.createLinearGradient(0, y, 0, y + h * .45); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h * .45);
  g.restore();
};

/* ---------------------------------------------------------------- UNE ARCHE (un passage voûté dans un mur) : le trou noir, les claveaux autour
   cx : son milieu, bas : le sol, larg, haut (au sommet) ; o = {graine, ton, fond:[r, v, b], ep (l'épaisseur des pierres), lueur:[r, v, b]} */
DF.arche = function(g, cx, bas, larg, haut, o){
  o = o || {};
  var R = U.hasard(o.graine || 31), ton = o.ton || [140, 134, 140], r = larg / 2, yc = bas - haut + r, ep = o.ep || 30, i;
  function chemin(rr, dy){ g.beginPath(); g.moveTo(cx - rr, bas + (dy || 0)); g.lineTo(cx - rr, yc); g.arc(cx, yc, rr, Math.PI, 0); g.lineTo(cx + rr, bas + (dy || 0)); g.closePath(); }
  /* le noir du passage, sa profondeur */
  chemin(r); g.fillStyle = rgb(o.fond || [6, 6, 10]); g.fill();
  g.save(); chemin(r); g.clip();
  if(o.lueur){ tache(g, cx, bas - haut * .32, r * .8, haut * .5, o.lueur, .5); }
  /* le couloir s'enfonce : son sol, ses murs qui fuient, une autre arche plus loin, encore une au fond */
  var cf = o.lueur || [26, 28, 44];
  [[.66, .5], [.4, .28]].forEach(function(q, k){
    var rr = r * q[0], yb = bas - haut * (1 - q[0]) * .12, hh = haut * q[0];
    g.strokeStyle = rgb(cf, q[1]); g.lineWidth = 5 - k * 2; g.beginPath(); g.moveTo(cx - rr, yb); g.lineTo(cx - rr, yb - hh + rr); g.arc(cx, yb - hh + rr, rr, Math.PI, 0); g.lineTo(cx + rr, yb); g.stroke();
    g.fillStyle = rgb(cf, q[1] * .22); g.fill();
  });
  g.fillStyle = rgb(cf, .2); g.beginPath(); g.moveTo(cx - r, bas); g.lineTo(cx - r * .4, bas - haut * .07); g.lineTo(cx + r * .4, bas - haut * .07); g.lineTo(cx + r, bas); g.closePath(); g.fill();
  /* l'épaisseur du mur, qu'on voit à gauche (le passage s'enfonce) */
  var gr = g.createLinearGradient(cx - r, 0, cx - r + 26, 0); gr.addColorStop(0, rgb(mul(ton, .5), .9)); gr.addColorStop(1, rgb(mul(ton, .2), 0)); g.fillStyle = gr; g.fillRect(cx - r, bas - haut, 26, haut);
  g.restore();
  /* les pierres des montants */
  var hm = bas - yc, nm = Math.max(2, Math.round(hm / 46));
  for(i = 0; i < nm; i++) [-1, 1].forEach(function(s){ bloc(g, s < 0 ? cx - r - ep : cx + r, yc + i * hm / nm, ep, hm / nm, mul(ton, .85 + R() * .3), R, {j:1.6}); });
  /* les claveaux */
  var nc = Math.max(7, Math.round(Math.PI * r / 40)); if(nc % 2 === 0) nc++;
  for(i = 0; i < nc; i++){
    var a0 = Math.PI + i * Math.PI / nc, a1 = Math.PI + (i + 1) * Math.PI / nc, cle = i === (nc - 1) / 2, e2 = ep + (cle ? 8 : 0), c = mul(ton, (cle ? 1.08 : .84) + R() * .28);
    var gg = g.createLinearGradient(0, yc - r - e2, 0, yc); gg.addColorStop(0, rgb(mul(c, 1.1))); gg.addColorStop(1, rgb(mul(c, .82)));
    g.fillStyle = gg; g.beginPath(); g.arc(cx, yc, r, a0 + .012, a1 - .012); g.arc(cx, yc, r + e2, a1 - .009, a0 + .009, true); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.4; g.beginPath(); g.arc(cx, yc, r + e2 - 1.6, a0 + .03, a1 - .03); g.stroke();
  }
  /* l'ombre portée du bord dans le passage */
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 5; chemin(r - 2); g.stroke();
};

/* ---------------------------------------------------------------- UN TRONC (son pied en x, bas) ; o = {graine, ton, penche, racines, branches} */
DF.tronc = function(g, x, bas, larg, haut, o){
  o = o || {};
  var R = U.hasard(o.graine || 41), ton = o.ton || [84, 70, 58], pen = o.penche || 0, i;
  function cx(v){ return x + pen * haut * v + Math.sin(v * 3.1 + (o.graine || 0)) * larg * .12; }
  function dm(v){ return larg * (.36 + .16 * (1 - v) + .32 * Math.pow(1 - v, 7)); }
  g.beginPath(); g.moveTo(cx(0) - dm(0), bas);
  for(i = 0; i <= 24; i++){ var v = i / 24; g.lineTo(cx(v) - dm(v) * (1 + .05 * U.bruit(v * 9, 3 + (o.graine || 0))), bas - haut * v); }
  for(i = 24; i >= 0; i--){ var v2 = i / 24; g.lineTo(cx(v2) + dm(v2) * (1 + .05 * U.bruit(v2 * 8, 9 + (o.graine || 0))), bas - haut * v2); }
  g.closePath();
  var gr = g.createLinearGradient(x - larg * .5, 0, x + larg * .5, 0); gr.addColorStop(0, rgb(mul(ton, .7))); gr.addColorStop(.3, rgb(mul(ton, 1.12))); gr.addColorStop(.62, rgb(ton)); gr.addColorStop(1, rgb(mul(ton, .55)));
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  /* l'écorce : de longs sillons sombres, des crêtes claires */
  for(i = 0; i < Math.round(larg * haut / 420); i++){
    var v0 = R(), u = (R() - .5) * 1.9, ll = haut * (.04 + R() * .13), sx = cx(v0) + u * dm(v0), sy = bas - haut * v0;
    g.strokeStyle = R() < .62 ? 'rgba(0,0,0,' + (.25 + R() * .3) + ')' : 'rgba(255,240,220,' + (.08 + R() * .1) + ')'; g.lineWidth = 1 + R() * 2.4;
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + (R() - .5) * 8, sy - ll * .5, sx + (R() - .5) * 6 + pen * ll, sy - ll); g.stroke();
  }
  for(i = 0; i < (o.noeuds == null ? 2 : o.noeuds); i++){ var vn = .2 + R() * .6, nx = cx(vn) + (R() - .5) * dm(vn), nyy = bas - haut * vn; g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(nx, nyy, larg * .08, larg * .12, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,235,210,.14)'; g.lineWidth = 2; g.stroke(); }
  /* la mousse, au pied */
  for(i = 0; i < 12; i++) tache(g, x + (R() - .5) * larg * 1.3, bas - R() * haut * .16, larg * (.14 + R() * .2), larg * (.08 + R() * .1), [64, 104, 62], .5);
  g.restore();
};
/* une branche nue (qui part de x, y) */
DF.branche = function(g, x, y, l, a, ep, ton, R, prof){
  var x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l, mx = (x + x2) / 2 + (R() - .5) * l * .3, my = (y + y2) / 2 + (R() - .5) * l * .3;
  g.strokeStyle = rgb(ton); g.lineWidth = ep; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
  if((prof || 0) < 3 && l > 26){ var n = 1 + Math.floor(R() * 2.2); for(var i = 0; i < n; i++) DF.branche(g, U.lerp(mx, x2, R()), U.lerp(my, y2, R()), l * (.45 + R() * .3), a + (R() - .5) * 1.5, ep * .6, ton, R, (prof || 0) + 1); }
};

/* ---------------------------------------------------------------- LE SOL DE LA FORÊT (une bande : de l'herbe en haut, de la terre, des feuilles mortes) */
DF.solForet = function(g, x, y, w, h, o){
  o = o || {};
  var R = U.hasard(o.graine || 51), i;
  g.save();
  var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#5a6a48'); gr.addColorStop(.25, '#4a5038'); gr.addColorStop(1, '#2c2a22');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x, y + h);
  for(i = 0; i <= 80; i++){ var xx = x + w * i / 80; g.lineTo(xx, y + 6 + U.fbm(xx * .006, 5 + (o.graine || 0), 3) * 9); }
  g.lineTo(x + w, y + h); g.closePath(); g.fill(); g.clip();
  for(i = 0; i < Math.round(w * h / 9000); i++) tache(g, x + R() * w, y + R() * h, 30 + R() * 110, 8 + R() * 26, R() < .5 ? [26, 24, 18] : [110, 120, 80], .22 + R() * .2);
  /* la terre battue devant le puits (o.terre : [x0, x1]) */
  if(o.terre) for(i = 0; i < 26; i++) tache(g, U.lerp(o.terre[0], o.terre[1], R()), y + 10 + R() * h * .7, 50 + R() * 90, 9 + R() * 16, [124, 104, 80], .3);
  for(i = 0; i < Math.round(w / 3); i++){
    var bx = x + R() * w, by = y + 4 + Math.pow(R(), 1.6) * h, l = 6 + R() * 15, a = -Math.PI / 2 + (R() - .5) * 1.3, t = R();
    g.strokeStyle = t < .5 ? rgb([70 + R() * 40, 110 + R() * 40, 60 + R() * 20], .9) : t < .8 ? 'rgba(20,30,18,.8)' : rgb([150, 170, 110], .7);
    g.lineWidth = .9 + R() * 1.5; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + Math.cos(a) * l * .5 + 2, by + Math.sin(a) * l * .5, bx + Math.cos(a) * l, by + Math.sin(a) * l); g.stroke();
  }
  for(i = 0; i < Math.round(w / 16); i++){ g.fillStyle = R() < .7 ? rgb([130 + R() * 50, 92 + R() * 30, 50], .8) : rgb([150, 150, 140], .8); g.save(); g.translate(x + R() * w, y + 12 + R() * (h - 14)); g.rotate(R() * 3); g.beginPath(); g.ellipse(0, 0, 3 + R() * 5, 1.6 + R() * 2.4, 0, 0, 7); g.fill(); g.restore(); }
  grainer(g, x, y, w, h, .2, 13);
  g.restore();
};
/* des touffes d'herbe et de fougères (devant) : des brins longs, en éventail ; o = {graine, n, haut, ton} */
DF.herbes = function(g, x, bas, w, o){
  o = o || {};
  var R = U.hasard(o.graine || 61), ton = o.ton || [58, 96, 60], n = o.n || 40, i, k;
  for(i = 0; i < n; i++){
    var cx = x + R() * w, H0 = (o.haut || 60) * (.5 + R() * .8), nb = 6 + Math.floor(R() * 7), fou = R() < (o.fougere == null ? .3 : o.fougere);
    for(k = 0; k < nb; k++){
      var a = -Math.PI / 2 + (k / (nb - 1) - .5) * 1.7 + (R() - .5) * .3, l = H0 * (.6 + R() * .5), ex = cx + Math.cos(a) * l, ey = bas + Math.sin(a) * l * (1 - Math.abs(Math.cos(a)) * .3), c = mul(ton, .55 + R() * .75);
      g.strokeStyle = rgb(c); g.lineWidth = fou ? 2.4 : 1.6 + R() * 2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx + (R() - .5) * 6, bas); g.quadraticCurveTo(cx + Math.cos(a) * l * .4, bas - l * .55, ex, ey + l * .12); g.stroke();
      if(fou){ g.fillStyle = rgb(mul(c, 1.05)); for(var q = 2; q < 9; q++){ var u = q / 9, px = U.lerp(cx, ex, u) + Math.cos(a) * l * .1 * (1 - u), py = U.lerp(bas, ey, u) - l * .22 * Math.sin(u * Math.PI); [-1, 1].forEach(function(sd){ g.save(); g.translate(px, py); g.rotate(a + sd * 1.1); g.beginPath(); g.ellipse(l * .08 * (1 - u * .6), 0, l * .1 * (1 - u * .6), l * .028, 0, 0, 7); g.fill(); g.restore(); }); } }
    }
  }
};

/* ---------------------------------------------------------------- LE VIEUX PUITS (vu de côté). (0, 0) : le milieu de sa margelle, au sol.
   DF.puits(g, 'derriere') : l'intérieur de la margelle, les montants, la poutre, le treuil ; 'devant' : le mur rond, devant (le héros descend entre les deux). */
var PU = DF.PUITS = {rx:104, haut:78, ry:20, mont:196, corde:0};
DF.puits = function(g, part, o){
  var R = U.hasard(77), rx = PU.rx, H0 = PU.haut, ry = PU.ry, i, ton = [134, 130, 134];
  if(part === 'derriere'){
    /* l'ouverture : le noir, et le bord intérieur du fond */
    g.fillStyle = '#050508'; g.beginPath(); g.ellipse(0, -H0, rx - 14, ry - 3, 0, 0, 7); g.fill();
    g.fillStyle = rgb(mul(ton, .55)); g.beginPath(); g.ellipse(0, -H0, rx, ry, 0, Math.PI, 0); g.ellipse(0, -H0 + 5, rx - 15, ry - 4, 0, 0, Math.PI, true); g.closePath(); g.fill();
    for(i = 0; i < 7; i++){ var a = Math.PI + (i + .5) / 7 * Math.PI; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(Math.cos(a) * rx, -H0 + Math.sin(a) * ry); g.lineTo(Math.cos(a) * (rx - 15), -H0 + 5 + Math.sin(a) * (ry - 4)); g.stroke(); }
    /* les deux montants de bois, la poutre, le treuil et sa manivelle */
    [-1, 1].forEach(function(s){
      var px = s * (rx + 6), gr = g.createLinearGradient(px - 10, 0, px + 10, 0); gr.addColorStop(0, '#6a4c30'); gr.addColorStop(.4, '#9a7448'); gr.addColorStop(1, '#4e3620');
      g.fillStyle = gr; g.beginPath(); g.moveTo(px - 10, 4); g.lineTo(px - 8, -PU.mont); g.lineTo(px + 8, -PU.mont); g.lineTo(px + 10, 4); g.closePath(); g.fill(); g.strokeStyle = '#1c120a'; g.lineWidth = 2.4; g.stroke();
      for(var k = 0; k < 9; k++){ g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.2; g.beginPath(); var yy = -R() * PU.mont; g.moveTo(px - 6 + R() * 12, yy); g.lineTo(px - 6 + R() * 12, yy - 20 - R() * 40); g.stroke(); }
      /* une jambe de force */
      g.strokeStyle = '#1c120a'; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(px, -PU.mont + 52); g.lineTo(px - s * 44, -PU.mont + 6); g.stroke();
      g.strokeStyle = '#8a6640'; g.lineWidth = 7; g.stroke();
    });
    /* la poutre et son petit toit de planches */
    g.fillStyle = '#7a5a38'; g.strokeStyle = '#1c120a'; g.lineWidth = 2.4; g.beginPath(); g.rect(-rx - 26, -PU.mont - 12, 2 * rx + 52, 16); g.fill(); g.stroke();
    for(i = 0; i < 2; i++){ var sg = i ? 1 : -1; g.fillStyle = i ? '#5e4428' : '#6e5232'; g.beginPath(); g.moveTo(0, -PU.mont - 64); g.lineTo(sg * (rx + 48), -PU.mont - 8); g.lineTo(sg * (rx + 40), -PU.mont + 2); g.lineTo(0, -PU.mont - 50); g.closePath(); g.fill(); g.stroke();
      for(var q = 1; q < 6; q++){ g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(sg * q * (rx + 44) / 6, -PU.mont - 62 + q * 9.3); g.lineTo(sg * q * (rx + 40) / 6, -PU.mont - 49 + q * 8.6); g.stroke(); } g.strokeStyle = '#1c120a'; g.lineWidth = 2.4; }
    for(i = 0; i < 14; i++) tache(g, (R() - .5) * 2 * rx, -PU.mont - 20 - R() * 30, 16 + R() * 20, 6 + R() * 6, [70, 110, 66], .55);
    /* le treuil : un rondin, la corde enroulée */
    var ty = -PU.mont + 40;
    g.fillStyle = '#8c6a44'; g.beginPath(); g.rect(-rx - 4, ty - 9, 2 * rx + 8, 18); g.fill(); g.stroke();
    g.strokeStyle = '#c8ad7a'; g.lineWidth = 3.2; for(i = -6; i <= 6; i++){ g.beginPath(); g.moveTo(i * 4.6 - 2, ty - 10); g.lineTo(i * 4.6 + 2, ty + 10); g.stroke(); }
    g.strokeStyle = '#1c120a'; g.lineWidth = 5; g.beginPath(); g.moveTo(rx + 4, ty); g.lineTo(rx + 30, ty); g.lineTo(rx + 30, ty + 30); g.lineTo(rx + 46, ty + 30); g.stroke();
    g.strokeStyle = '#70747c'; g.lineWidth = 2.6; g.stroke();
    return;
  }
  /* devant : le mur rond de la margelle (des pierres en assises, plus sombres sur les bords), sa tablette */
  g.save();
  g.beginPath(); g.moveTo(-rx, -H0); g.lineTo(-rx + 4, 6); g.quadraticCurveTo(0, 18, rx - 4, 6); g.lineTo(rx, -H0); g.ellipse(0, -H0, rx, ry, 0, 0, Math.PI); g.closePath(); g.clip();
  g.fillStyle = '#231f26'; g.fillRect(-rx, -H0 - ry, 2 * rx, H0 + 2 * ry + 20);
  for(i = 0; i < 4; i++){
    var y0 = -H0 + 12 + i * 21, n = 6, dec = (i % 2) * .5;
    for(var k2 = -1; k2 < n; k2++){
      var a0 = Math.PI - (k2 + dec) / n * Math.PI, a1 = Math.PI - (k2 + 1 + dec) / n * Math.PI, x0 = Math.cos(a0) * rx, x1 = Math.cos(a1) * rx, cb = Math.sin((a0 + a1) / 2);
      var b0 = Math.sin(a0) * ry * .5, b1 = Math.sin(a1) * ry * .5;
      g.save(); g.transform(1, (b1 - b0) / Math.max(1, x1 - x0), 0, 1, 0, 0);
      bloc(g, x0, y0 + b0 - (b1 - b0) / Math.max(1, x1 - x0) * x0 + 2, x1 - x0, 21, mul(ton, (.5 + .6 * cb) * (.85 + R() * .3)), R, {j:1.5, r:3});
      g.restore();
    }
  }
  grainer(g, -rx, -H0 - ry, 2 * rx, H0 + 2 * ry + 20, .22, 3);
  for(i = 0; i < 16; i++) tache(g, (R() - .5) * 2 * rx, 4 - R() * 30, 12 + R() * 26, 6 + R() * 10, [62, 104, 62], .6);
  g.restore();
  /* la tablette (le dessus de la margelle) : un anneau de pierres plates */
  g.fillStyle = rgb(mul(ton, 1.08)); g.beginPath(); g.ellipse(0, -H0, rx + 7, ry + 3, 0, 0, Math.PI); g.ellipse(0, -H0 + 5, rx - 15, ry - 4, 0, Math.PI, 0, true); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 2; g.stroke();
  for(i = 0; i < 8; i++){ var a2 = (i + .3) / 8 * Math.PI; g.beginPath(); g.moveTo(Math.cos(a2) * (rx + 7), -H0 + Math.sin(a2) * (ry + 3)); g.lineTo(Math.cos(a2) * (rx - 15), -H0 + 5 + Math.sin(a2) * (ry - 4)); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, -H0 + 5, rx - 14, ry - 3.4, 0, .15, Math.PI - .15); g.stroke();
  /* les restes de la grille fondue (l'acide de l'Alchimiste) : des barreaux tordus, des coulures vertes */
  g.lineCap = 'round';
  [[-rx + 8, -1], [-rx + 30, -1], [rx - 14, 1]].forEach(function(b, k){
    g.strokeStyle = '#16181c'; g.lineWidth = 7; g.beginPath(); g.moveTo(b[0], -H0 + 8); g.quadraticCurveTo(b[0] + b[1] * 6, -H0 - 14 - k * 5, b[0] - b[1] * (16 + k * 6), -H0 - 20 - k * 7); g.stroke();
    g.strokeStyle = '#5a626c'; g.lineWidth = 3.6; g.stroke();
    g.fillStyle = 'rgba(120,220,90,.55)'; g.beginPath(); g.ellipse(b[0], -H0 + 10, 7, 3, 0, 0, 7); g.fill();
  });
};

/* ---------------------------------------------------------------- UNE CORDE (verticale, de y0 à y1, en x) */
DF.corde = function(x, y0, y1, ep){
  ep = ep || 6;
  var s = '<path d="M' + x + ' ' + y0 + ' L ' + x + ' ' + y1 + '" stroke="#2a1c10" stroke-width="' + (ep + 2.6) + '"/><path d="M' + x + ' ' + y0 + ' L ' + x + ' ' + y1 + '" stroke="#b89868" stroke-width="' + ep + '"/>' +
    '<path d="M' + x + ' ' + y0 + ' L ' + x + ' ' + y1 + '" stroke="#5e4428" stroke-width="' + ep + '" stroke-dasharray="2.4 ' + (ep * 1.1) + '" opacity=".75"/>' +
    '<path d="M' + (x - ep * .22) + ' ' + y0 + ' L ' + (x - ep * .22) + ' ' + y1 + '" stroke="#e8d4a8" stroke-width="' + (ep * .22) + '" opacity=".5"/>';
  return s;
};

/* ---------------------------------------------------------------- DES TOILES D'ARAIGNÉE (dans un coin : cx, cy ; elle s'ouvre vers a0 → a1) */
DF.toile = function(g, cx, cy, r, a0, a1, R, op){
  var n = 6, i, k;
  g.strokeStyle = 'rgba(225,230,240,' + (op || .32) + ')'; g.lineWidth = 1;
  for(i = 0; i <= n; i++){ var a = U.lerp(a0, a1, i / n); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
  for(k = 1; k <= 6; k++){ g.beginPath(); for(i = 0; i <= n; i++){ var a2 = U.lerp(a0, a1, i / n), rr = r * k / 6.5 * (1 + (R() - .5) * .08), px = cx + Math.cos(a2) * rr, py = cy + Math.sin(a2) * rr;
    if(i === 0) g.moveTo(px, py); else { var am = U.lerp(a0, a1, (i - .5) / n); g.quadraticCurveTo(cx + Math.cos(am) * rr * .86, cy + Math.sin(am) * rr * .86, px, py); } } g.stroke(); }
};
/* une racine qui pend (du plafond) */
DF.racine = function(g, x, y, l, R, ton){
  var px = x, py = y, n = 9; g.strokeStyle = rgb(ton || [70, 58, 46]); g.lineCap = 'round';
  for(var i = 0; i < n; i++){ var nx = px + (R() - .5) * 20, ny = py + l / n; g.lineWidth = Math.max(.8, 6 * (1 - i / n)); g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
    if(R() < .4){ g.lineWidth = 1; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + (R() - .5) * 40, ny + 10 + R() * 26); g.stroke(); } px = nx; py = ny; }
};
/* des gravats au sol */
DF.gravats = function(g, x, bas, w, n, R, ton){
  for(var i = 0; i < n; i++){
    var cx = x + R() * w, s = 4 + Math.pow(R(), 2) * 26, c = mul(ton || [118, 114, 120], .6 + R() * .6);
    g.fillStyle = rgb(c); g.beginPath(); g.moveTo(cx - s, bas); g.lineTo(cx - s * (.5 + R() * .4), bas - s * (.5 + R() * .5)); g.lineTo(cx + s * (R() - .3) * .6, bas - s * (.7 + R() * .4)); g.lineTo(cx + s * (.6 + R() * .4), bas - s * (.3 + R() * .4)); g.lineTo(cx + s, bas); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.4; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - s * .5, bas - s * .6); g.lineTo(cx + s * .1, bas - s * .8); g.stroke();
  }
};
/* un bouquet de cristaux (comme dans les salles du donjon) : rend leurs pointes [[x, y], …] pour les lueurs */
DF.cristaux = function(g, x, bas, taille, R){
  var pts = [], n = 4 + Math.floor(R() * 3);
  for(var i = 0; i < n; i++){
    var a = -Math.PI / 2 + (i / (n - 1) - .5) * 1.5 + (R() - .5) * .2, l = taille * (.55 + R() * .6), w = taille * (.1 + R() * .06), bx = x + (i - (n - 1) / 2) * taille * .16, tx = bx + Math.cos(a) * l, ty = bas + Math.sin(a) * l;
    var nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    g.fillStyle = 'rgb(150,214,226)'; g.beginPath(); g.moveTo(bx - nx, bas - ny); g.lineTo(tx - nx * .5, ty - ny * .5 + l * .12); g.lineTo(tx, ty); g.lineTo(tx + nx * .5, ty + ny * .5 + l * .12); g.lineTo(bx + nx, bas + ny); g.closePath(); g.fill();
    g.fillStyle = 'rgba(235,252,255,.75)'; g.beginPath(); g.moveTo(bx - nx, bas - ny); g.lineTo(tx - nx * .5, ty - ny * .5 + l * .12); g.lineTo(tx, ty); g.lineTo(bx, bas); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(20,40,60,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(bx - nx, bas - ny); g.lineTo(tx - nx * .5, ty - ny * .5 + l * .12); g.lineTo(tx, ty); g.lineTo(tx + nx * .5, ty + ny * .5 + l * .12); g.lineTo(bx + nx, bas + ny); g.stroke();
    pts.push([tx, ty + l * .3]);
  }
  return pts;
};
/* un crâne (dans une niche) */
DF.crane = function(g, x, y, s, R, tourne, ton){
  var c = ton || [176 + R() * 34, 166 + R() * 30, 138 + R() * 26], creux = ton ? rgb(mul(ton, .3)) : '#0a0706';
  g.save(); g.translate(x, y); g.rotate((R() - .5) * .36 + (tourne || 0)); g.scale(s * (R() < .5 ? 1 : -1), s);
  var gr = g.createRadialGradient(-5, -9, 2, 0, -2, 24); gr.addColorStop(0, rgb(mul(c, 1.12))); gr.addColorStop(.6, rgb(mul(c, .86))); gr.addColorStop(1, rgb(mul(c, .5)));
  g.fillStyle = gr; g.strokeStyle = 'rgba(16,10,8,.85)'; g.lineWidth = 1.4;
  /* la boîte du crâne, les pommettes, la mâchoire du haut */
  g.beginPath(); g.moveTo(-14.5, -1); g.bezierCurveTo(-17, -22, 17, -23, 14.5, -1); g.bezierCurveTo(14.5, 4, 12.5, 6, 11.5, 9); g.lineTo(8, 10); g.lineTo(7.5, 17); g.lineTo(-7.5, 17); g.lineTo(-8, 10); g.lineTo(-11.5, 9); g.bezierCurveTo(-12.5, 6, -14.5, 4, -14.5, -1); g.closePath(); g.fill(); g.stroke();
  /* les orbites (un peu tombantes), le nez */
  g.fillStyle = creux;
  g.beginPath(); g.moveTo(-10.5, -1); g.bezierCurveTo(-10, -6, -3, -5.5, -2.6, -.5); g.bezierCurveTo(-2.6, 4.5, -9.5, 5.5, -10.5, -1); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(10.5, -1); g.bezierCurveTo(10, -6, 3, -5.5, 2.6, -.5); g.bezierCurveTo(2.6, 4.5, 9.5, 5.5, 10.5, -1); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0, 5); g.lineTo(-2.2, 10.2); g.lineTo(0, 9.4); g.lineTo(2.2, 10.2); g.closePath(); g.fill();
  /* les dents, des fêlures, l'ombre sous le front */
  g.strokeStyle = 'rgba(16,10,8,.7)'; g.lineWidth = .9; for(var i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(i * 2.9, 12.4); g.lineTo(i * 2.9, 17); g.stroke(); } g.beginPath(); g.moveTo(-7.6, 12.6); g.lineTo(7.6, 12.6); g.stroke();
  if(R() < .6){ g.fillStyle = creux; g.fillRect((Math.floor(R() * 5) - 2.5) * 2.9, 12.8, 2.8, 4.2); }
  g.strokeStyle = 'rgba(16,10,8,.55)'; g.lineWidth = .8; g.beginPath(); var fx = -8 + R() * 16, fy = -17; g.moveTo(fx, fy); for(var k = 0; k < 3; k++){ fx += (R() - .5) * 6; fy += 3 + R() * 3; g.lineTo(fx, fy); } g.stroke();
  g.strokeStyle = 'rgba(255,250,235,.22)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, -4, 14, Math.PI * 1.15, Math.PI * 1.6); g.stroke();
  g.restore();
};

/* ---------------------------------------------------------------- LE CARNET DE L'AVENTURIER (gros plan, posé sur les dalles). (0, 0) : son milieu ; large de ~560 */
DF.carnet = function(g){
  var R = U.hasard(5), cuir = [128, 84, 46], i;
  /* le plat du dessus : un quadrilatère vu de près, en biais */
  var A = [-270, -26], B = [196, -74], C = [286, 44], D = [-196, 108], ep = 46;
  function quad(p, q, r, s){ g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.lineTo(r[0], r[1]); g.lineTo(s[0], s[1]); g.closePath(); }
  /* l'ombre */
  tache(g, 20, 150, 380, 70, [0, 0, 0], .75);
  /* la tranche (les pages), le plat du dessous */
  quad(D, C, [C[0] - 4, C[1] + ep], [D[0] + 2, D[1] + ep]); g.fillStyle = '#d9c9a0'; g.fill();
  g.save(); g.clip(); for(i = 0; i < 20; i++){ g.strokeStyle = 'rgba(90,70,40,' + (.2 + R() * .3) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(D[0], D[1] + 4 + i * 2.2); g.lineTo(C[0], C[1] + 4 + i * 2.2 + (R() - .5) * 2); g.stroke(); } g.restore();
  quad(A, D, [D[0] + 2, D[1] + ep], [A[0] + 4, A[1] + ep * .8]); g.fillStyle = rgb(mul(cuir, .55)); g.fill(); g.strokeStyle = '#1a0f08'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#1a0f08'; g.lineWidth = 3; quad([D[0] + 2, D[1] + ep - 5], [C[0] - 4, C[1] + ep - 5], [C[0] - 4, C[1] + ep + 3], [D[0] + 2, D[1] + ep + 3]); g.fillStyle = rgb(mul(cuir, .6)); g.fill(); g.stroke();
  /* le plat du dessus : le cuir, usé */
  quad(A, B, C, D); var gr = g.createLinearGradient(-200, -60, 200, 100); gr.addColorStop(0, rgb(mul(cuir, 1.12))); gr.addColorStop(.6, rgb(cuir)); gr.addColorStop(1, rgb(mul(cuir, .74)));
  g.fillStyle = gr; g.fill(); g.strokeStyle = '#1a0f08'; g.lineWidth = 3.4; g.stroke();
  g.save(); quad(A, B, C, D); g.clip();
  for(i = 0; i < 40; i++) tache(g, -280 + R() * 580, -90 + R() * 210, 20 + R() * 70, 12 + R() * 40, R() < .55 ? [40, 20, 8] : [230, 190, 140], .1 + R() * .14);
  for(i = 0; i < 26; i++){ g.strokeStyle = 'rgba(30,14,6,' + (.2 + R() * .3) + ')'; g.lineWidth = .8 + R(); var sx = -260 + R() * 520, sy = -70 + R() * 170; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 10 + R() * 40, sy + (R() - .5) * 14); g.stroke(); }
  /* la transformation du plat : u (le long de AB), v (le long de AD) */
  function pt(u, v){ var x1 = U.lerp(A[0], B[0], u), y1 = U.lerp(A[1], B[1], u), x2 = U.lerp(D[0], C[0], u), y2 = U.lerp(D[1], C[1], u); return [U.lerp(x1, x2, v), U.lerp(y1, y2, v)]; }
  function ligne(pts, c, w){ g.strokeStyle = c; g.lineWidth = w; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function(p, k){ var q = pt(p[0], p[1]); if(k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); }
  /* un filet gaufré, et au milieu une rose des vents (le carnet d'un explorateur) */
  ligne([[.06, .1], [.94, .1], [.94, .9], [.06, .9], [.06, .1]], 'rgba(30,14,6,.55)', 3); ligne([[.065, .115], [.935, .115], [.935, .885], [.065, .885], [.065, .115]], 'rgba(240,200,130,.35)', 1.4);
  var cm = [.5, .5];
  for(i = 0; i < 8; i++){ var a = i * Math.PI / 4, l = i % 2 ? .1 : .19, lx = l * .62; ligne([[cm[0] + Math.cos(a - .32) * lx * .36, cm[1] + Math.sin(a - .32) * l * .5], [cm[0] + Math.cos(a) * lx, cm[1] + Math.sin(a) * l * 1.4], [cm[0] + Math.cos(a + .32) * lx * .36, cm[1] + Math.sin(a + .32) * l * .5]], 'rgba(226,186,104,.9)', 3); }
  g.restore();
  /* les coins et le fermoir en laiton */
  [[0, 0, 1, 1], [1, 0, -1, 1], [1, 1, -1, -1], [0, 1, 1, -1]].forEach(function(q){
    var p0 = pt(q[0], q[1]), p1 = pt(q[0] + q[2] * .09, q[1]), p2 = pt(q[0], q[1] + q[3] * .2);
    g.fillStyle = '#c9a35a'; g.strokeStyle = '#1a0f08'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,244,200,.7)'; g.beginPath(); g.arc((p0[0] * 2 + p1[0] + p2[0]) / 4, (p0[1] * 2 + p1[1] + p2[1]) / 4, 2.4, 0, 7); g.fill();
  });
  /* la sangle qui le ferme, et sa boucle */
  var s0 = pt(.62, -.02), s1 = pt(.7, -.02), s2 = pt(.7, 1.02), s3 = pt(.62, 1.02);
  quad(s0, s1, s2, s3); g.fillStyle = rgb(mul(cuir, .5)); g.fill(); g.strokeStyle = '#1a0f08'; g.lineWidth = 2.4; g.stroke();
  quad(s3, s2, [s2[0] - 2, s2[1] + ep * .7], [s3[0] + 1, s3[1] + ep * .7]); g.fillStyle = rgb(mul(cuir, .38)); g.fill(); g.stroke();
  var bo = pt(.66, .78); g.fillStyle = '#d9b46a'; g.beginPath(); g.ellipse(bo[0], bo[1], 22, 15, -.1, 0, 7); g.fill(); g.stroke(); g.fillStyle = rgb(mul(cuir, .5)); g.beginPath(); g.ellipse(bo[0], bo[1], 12, 7.5, -.1, 0, 7); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,250,220,.8)'; g.beginPath(); g.ellipse(bo[0] - 12, bo[1] - 8, 5, 2.2, -.5, 0, 7); g.fill();
  /* un ruban rouge qui dépasse */
  g.fillStyle = '#a8322c'; g.strokeStyle = '#1a0f08'; g.lineWidth = 2; g.beginPath(); var rb = pt(.3, 1.0); g.moveTo(rb[0], rb[1] + 20); g.lineTo(rb[0] + 16, rb[1] + 18); g.lineTo(rb[0] + 22, rb[1] + 92); g.lineTo(rb[0] + 12, rb[1] + 82); g.lineTo(rb[0] + 2, rb[1] + 96); g.closePath(); g.fill(); g.stroke();
};

/* ---------------------------------------------------------------- LA PIERRE DE RUNE (gros plan). (0, 0) : son milieu, au sol en y = 120 ; large de ~380.
   Le signe est celui du jeu (scenes.js, A.pierreRune) ; DF.RUNE : son tracé, pour le faire luire (une unité = 9,4). */
DF.RUNE = 'M-56 -66 L 0 46 L 66 -75 M0 46 L 0 94 M-66 94 q 66 28 132 0';
DF.pierreRune = function(g){
  var R = U.hasard(8), ton = [108, 112, 144], i;
  tache(g, 0, 128, 250, 40, [0, 0, 0], .8);
  g.beginPath(); g.moveTo(-184, 118); g.bezierCurveTo(-222, 30, -170, -96, -44, -124); g.bezierCurveTo(84, -160, 224, -104, 250, 2); g.bezierCurveTo(268, 80, 222, 122, 150, 128); g.lineTo(-120, 130); g.closePath();
  var gr = g.createRadialGradient(-60, -70, 20, 20, 0, 300); gr.addColorStop(0, rgb(mul(ton, 1.25))); gr.addColorStop(.55, rgb(ton)); gr.addColorStop(1, rgb(mul(ton, .5)));
  g.fillStyle = gr; g.fill(); g.strokeStyle = '#0c0c18'; g.lineWidth = 4; g.stroke();
  g.save(); g.clip();
  for(i = 0; i < 46; i++) tache(g, -220 + R() * 480, -150 + R() * 280, 16 + R() * 60, 10 + R() * 40, R() < .55 ? [10, 10, 30] : [220, 225, 250], .08 + R() * .12);
  grainer(g, -240, -170, 520, 310, .3, 15);
  for(i = 0; i < 5; i++){ g.strokeStyle = 'rgba(8,8,22,.5)'; g.lineWidth = 1.5; var fx = -150 + R() * 340, fy = -110 + R() * 100; g.beginPath(); g.moveTo(fx, fy); for(var k = 0; k < 4; k++){ fx += (R() - .5) * 46; fy += 16 + R() * 26; g.lineTo(fx, fy); } g.stroke(); }
  for(i = 0; i < 9; i++) tache(g, -180 + R() * 400, 100 - R() * 40, 20 + R() * 40, 8 + R() * 14, [70, 112, 80], .55);
  /* le signe gravé : un creux sombre, un bord clair */
  g.lineCap = 'round'; g.lineJoin = 'round';
  var p = new Path2D(DF.RUNE);
  g.translate(8, -22);
  g.strokeStyle = 'rgba(6,8,24,.85)'; g.lineWidth = 17; g.stroke(p);
  g.translate(1.5, 2.5); g.strokeStyle = 'rgba(210,225,255,.3)'; g.lineWidth = 17; g.stroke(p); g.translate(-1.5, -2.5);
  g.strokeStyle = 'rgba(20,26,56,.95)'; g.lineWidth = 12; g.stroke(p);
  g.restore();
};

/* ---------------------------------------------------------------- LA PORTE DE LA CRYPTE (gros plan : des planches, des ferrures, la serrure). (0, 0) : le trou de la serrure */
DF.porteCrypte = function(g, w, h){
  var R = U.hasard(12), x0 = -w * .62, y0 = -h * .5, i;
  /* les planches */
  var lp = 118;
  for(var x = x0; x < x0 + w; x += lp){
    var c = mul([126, 92, 60], .8 + R() * .34), gr = g.createLinearGradient(x, 0, x + lp, 0); gr.addColorStop(0, rgb(mul(c, .7))); gr.addColorStop(.12, rgb(mul(c, 1.08))); gr.addColorStop(.86, rgb(c)); gr.addColorStop(1, rgb(mul(c, .6)));
    g.fillStyle = gr; g.fillRect(x, y0, lp, h);
    for(i = 0; i < 26; i++){ g.strokeStyle = R() < .6 ? 'rgba(30,16,6,' + (.18 + R() * .3) + ')' : 'rgba(255,230,190,' + (.06 + R() * .1) + ')'; g.lineWidth = .8 + R() * 1.6; var sx = x + 6 + R() * (lp - 12), sy = y0 + R() * h, l = 40 + R() * 160; g.beginPath(); g.moveTo(sx, sy); g.bezierCurveTo(sx + (R() - .5) * 10, sy + l * .3, sx + (R() - .5) * 10, sy + l * .7, sx + (R() - .5) * 6, sy + l); g.stroke(); }
    if(R() < .7){ var ny = y0 + R() * h, nx = x + 20 + R() * (lp - 40); g.fillStyle = 'rgba(40,22,10,.75)'; g.beginPath(); g.ellipse(nx, ny, 7 + R() * 5, 11 + R() * 8, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,225,180,.16)'; g.lineWidth = 2; g.beginPath(); g.ellipse(nx, ny, 12 + R() * 6, 18 + R() * 9, 0, 0, 7); g.stroke(); }
    g.fillStyle = 'rgba(8,4,2,.9)'; g.fillRect(x - 2, y0, 4, h);
  }
  grainer(g, x0, y0, w, h, .2, 21);
  /* les ferrures : deux bandes de fer, leurs gros clous */
  function fer(yb){
    var gr = g.createLinearGradient(0, yb - 34, 0, yb + 34); gr.addColorStop(0, '#6c7078'); gr.addColorStop(.3, '#4a4e56'); gr.addColorStop(1, '#22242a');
    g.fillStyle = gr; g.strokeStyle = '#08080a'; g.lineWidth = 3; g.beginPath(); g.rect(x0 - 10, yb - 34, w + 20, 68); g.fill(); g.stroke();
    for(i = 0; i < 60; i++) tache(g, x0 + R() * w, yb - 30 + R() * 60, 8 + R() * 26, 5 + R() * 12, R() < .6 ? [120, 62, 30] : [0, 0, 0], .18 + R() * .2);
    for(var cx = x0 + 40; cx < x0 + w; cx += 118){ var cg = g.createRadialGradient(cx - 5, yb - 6, 2, cx, yb, 17); cg.addColorStop(0, '#a8adb8'); cg.addColorStop(.5, '#5a5e68'); cg.addColorStop(1, '#1c1e24'); g.fillStyle = cg; g.beginPath(); g.arc(cx, yb, 16, 0, 7); g.fill(); g.stroke(); }
  }
  fer(-h * .31); fer(h * .34);
  /* la serrure : une grosse plaque de fer, le trou */
  g.fillStyle = '#3a3e46'; g.strokeStyle = '#08080a'; g.lineWidth = 3.4;
  g.beginPath(); g.moveTo(-74, -108); g.lineTo(74, -108); g.lineTo(88, -60); g.lineTo(80, 100); g.quadraticCurveTo(0, 142, -80, 100); g.lineTo(-88, -60); g.closePath();
  var pg = g.createLinearGradient(-80, -100, 80, 110); pg.addColorStop(0, '#767b86'); pg.addColorStop(.4, '#4c5058'); pg.addColorStop(1, '#25272d'); g.fillStyle = pg; g.fill(); g.stroke();
  g.save(); g.clip(); for(i = 0; i < 40; i++) tache(g, -90 + R() * 180, -110 + R() * 240, 8 + R() * 30, 6 + R() * 20, R() < .6 ? [130, 66, 30] : [0, 0, 0], .16 + R() * .2); g.restore();
  [[-58, -86], [58, -86], [-62, 84], [62, 84]].forEach(function(p){ var cg = g.createRadialGradient(p[0] - 3, p[1] - 3, 1, p[0], p[1], 10); cg.addColorStop(0, '#b4b9c4'); cg.addColorStop(1, '#22242a'); g.fillStyle = cg; g.beginPath(); g.arc(p[0], p[1], 9, 0, 7); g.fill(); g.stroke(); });
  g.strokeStyle = 'rgba(200,205,215,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 46, 0, 7); g.stroke();
  g.fillStyle = '#030304'; g.beginPath(); g.arc(0, -8, 15, 0, 7); g.fill(); g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.lineTo(13, 44); g.lineTo(-13, 44); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(210,215,225,.3)'; g.lineWidth = 2; g.beginPath(); g.arc(0, -8, 17, .4, 2.6); g.stroke();
};
/* la clé d'Anselme (SVG ; son panneton en (0, 0), sa tige vers la gauche, son anneau au bout) */
DF.cle = function(){
  var o = '#0c0a08', f = '#8e8f96', c = '#c9c9d2';
  return '<g stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M-250 0 L 6 0" stroke="' + o + '" stroke-width="22"/><path d="M-250 0 L 6 0" stroke="' + f + '" stroke-width="15"/><path d="M-246 -4 L 2 -4" stroke="' + c + '" stroke-width="3" opacity=".7"/>' +
    '<path d="M-64 6 L -64 54 L -42 54 L -42 34 L -26 34 L -26 54 L -4 54 L -4 6 Z" fill="' + f + '" stroke="' + o + '" stroke-width="5"/><path d="M-58 12 L -58 48" stroke="' + c + '" stroke-width="2.4" opacity=".6"/>' +
    '<path d="M-218 -13 L -218 13 M-200 -13 L -200 13" stroke="' + o + '" stroke-width="12"/><path d="M-218 -12 L -218 12 M-200 -12 L -200 12" stroke="#b08a48" stroke-width="6"/>' +
    /* l'anneau : un trèfle de fer forgé */
    '<g transform="translate(-306 0)"><circle r="58" fill="none" stroke="' + o + '" stroke-width="24"/><circle r="58" fill="none" stroke="' + f + '" stroke-width="16"/>' +
    '<path d="M0 -58 L 0 58 M-58 0 L 58 0" stroke="' + o + '" stroke-width="14"/><path d="M0 -58 L 0 58 M-58 0 L 58 0" stroke="' + f + '" stroke-width="8"/><circle r="15" fill="#b08a48" stroke="' + o + '" stroke-width="5"/>' +
    '<path d="M-40 -42 A 58 58 0 0 1 20 -54" fill="none" stroke="' + c + '" stroke-width="3.4" opacity=".75"/></g></g>';
};
/* le poing du Pisteur qui tient quelque chose (SVG ; (0, 0) : le milieu du poing ; le bras part vers a, en degrés) */
DF.poing = function(r, a){
  var o = '#24182e', peau = '#f7caa6';
  return '<g><g transform="rotate(' + a + ')"><path d="M' + (r * .5) + ' ' + (-r * .78) + ' L ' + (r * 7) + ' ' + (-r * 1.05) + ' L ' + (r * 7) + ' ' + (r * 1.05) + ' L ' + (r * .5) + ' ' + (r * .78) + ' Z" fill="#3b7f54" stroke="' + o + '" stroke-width="' + (r * .16) + '"/>' +
    '<path d="M' + (r * .9) + ' ' + (-r * .9) + ' L ' + (r * 3.6) + ' ' + (-r * 1.0) + ' L ' + (r * 3.6) + ' ' + (r * 1.0) + ' L ' + (r * .9) + ' ' + (r * .9) + ' Z" fill="#8e5a36" stroke="' + o + '" stroke-width="' + (r * .16) + '"/>' +
    '<path d="M' + (r * 1.7) + ' ' + (-r * .95) + ' L ' + (r * 1.7) + ' ' + (r * .95) + ' M' + (r * 2.8) + ' ' + (-r * .98) + ' L ' + (r * 2.8) + ' ' + (r * .98) + '" stroke="#5a361f" stroke-width="' + (r * .13) + '"/></g>' +
    '<circle r="' + r + '" fill="' + peau + '" stroke="' + o + '" stroke-width="' + (r * .17) + '"/><circle cx="' + (-r * .3) + '" cy="' + (-r * .36) + '" r="' + (r * .3) + '" fill="#fff" opacity=".35"/>' +
    '<path d="M' + (-r * .72) + ' ' + (-r * .12) + ' Q 0 ' + (-r * .58) + ' ' + (r * .76) + ' ' + (-r * .2) + ' M' + (-r * .66) + ' ' + (r * .3) + ' Q 0 ' + (-r * .06) + ' ' + (r * .7) + ' ' + (r * .24) + '" fill="none" stroke="#c48652" stroke-width="' + (r * .11) + '" stroke-linecap="round"/></g>';
};
})();
