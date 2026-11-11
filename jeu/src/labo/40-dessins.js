
/* ============ Les dessins agrandis des échantillons (loupe et cartes des casiers) ============
   Tout est dessiné par le programme, autour du centre de la toile, à l'échelle s : la même fonction sert pour la petite carte et pour la loupe. */
function chemin(c, pts, off){ c.beginPath(); for(var i=0;i<pts.length;i++){ var q = pts[i], x = q.x + q.nx*off, y = q.y + q.ny*off; if(i) c.lineTo(x,y); else c.moveTo(x,y); } c.stroke(); }
function normales(raw){ return raw.map(function(q,i){ var a = raw[Math.max(0,i-1)], b = raw[Math.min(raw.length-1,i+1)]; var dx = b[0]-a[0], dy = b[1]-a[1], L = Math.hypot(dx,dy) || 1; return {x:q[0], y:q[1], nx:-dy/L, ny:dx/L, tx:dx/L, ty:dy/L}; }); }
function blob(c, x, y, r, Rn, col, pts){ c.fillStyle = col; c.beginPath(); var n = pts || 9; for(var i=0;i<n;i++){ var a = i/n*Math.PI*2, rr = r*(.7 + Rn()*.5); var px = x + Math.cos(a)*rr, py = y + Math.sin(a)*rr; if(i) c.lineTo(px,py); else c.moveTo(px,py); } c.closePath(); c.fill(); }
function rond(c, x, y, r){ c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
/* Le carré de cuir clair où l'on pose les échantillons : le même fond sous la loupe et sur les cartes des tiroirs */
function fondCuir(c, w, h){
  var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d6b48c'); g.addColorStop(1, '#c29a6e'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  var Rn = rng(5), n = Math.round(w*h/260); c.fillStyle = 'rgba(110,66,38,.13)';
  for(var i = 0; i < n; i++){ c.beginPath(); c.arc(Rn()*w, Rn()*h, .6 + Rn()*1.1, 0, 6.283); c.fill(); }
}
function dessinerFil(c, w, h, p, o){
  o = o || {}; var s = o.scale || 1, Rn = rng(o.seed || 1), t = p.thick*s;
  var amp = p.crimp*s, per = Math.max(22, p.thick*s*2.4), ph = Rn()*6.28, bend = (Rn()-.5)*30*s, raw = [];
  for(var x = -30; x <= w+30; x += 2) raw.push([x, h/2 + amp*Math.sin(2*Math.PI*x/per + ph) + bend*Math.sin(Math.PI*(x+30)/(w+60))]);
  var pts = normales(raw); c.lineCap = 'round'; c.lineJoin = 'round';
  var bord = Math.max(.8, Math.min(1.5*s, t*.2));
  c.globalAlpha = .22; c.strokeStyle = '#3a2414'; c.lineWidth = t; chemin(c, pts, t*.3 + 2*s); c.globalAlpha = 1;
  var nF = Math.round(p.fuzz*w*(s > 1.5 ? 1.5 : 1.1)); c.lineWidth = Math.max(.6, .45*s);
  for(var i=0;i<nF;i++){ var q = pts[2 + Math.floor(Rn()*(pts.length-4))], sd = Rn() < .5 ? -1 : 1, x0 = q.x + q.nx*sd*t*.42, y0 = q.y + q.ny*sd*t*.42;
    var len = (3 + Rn()*8)*s*(.6 + Math.min(p.fuzz,1.2)*.6)*(p.poil || 1), a = (Rn()-.5)*1.3, vx = q.nx*sd, vy = q.ny*sd, rx = vx*Math.cos(a) - vy*Math.sin(a), ry = vx*Math.sin(a) + vy*Math.cos(a);
    c.strokeStyle = clair(p.base, .15); c.globalAlpha = .9; c.beginPath(); c.moveTo(x0,y0); c.quadraticCurveTo(x0 + rx*len*.5, y0 + ry*len*.5 + (p.poil > 1 ? len*.15 : 0), x0 + rx*len, y0 + ry*len); c.stroke(); }
  c.globalAlpha = 1; c.strokeStyle = '#24182e'; c.lineWidth = t + 2*bord; chemin(c, pts, 0);
  if(p.strands){ for(var k=0;k<p.strands;k++){ var off = -t/2 + t*(k+.5)/p.strands; c.strokeStyle = k % 2 ? sombre(p.base, .08) : p.base; c.lineWidth = t/p.strands*.82; chemin(c, pts, off); c.strokeStyle = 'rgba(255,255,255,' + (.15 + p.sheen*.5) + ')'; c.lineWidth = Math.max(.8, t/p.strands*.18); chemin(c, pts, off - t/p.strands*.18); } }
  else {
    c.strokeStyle = p.base; c.lineWidth = t; chemin(c, pts, 0); c.globalAlpha = .35; c.strokeStyle = sombre(p.base, .55); c.lineWidth = t*.32; chemin(c, pts, t*.3); c.globalAlpha = 1;
    if(!p.single){ var pitch = Math.max(4, p.twist*s/p.plies), acc = 0; c.strokeStyle = sombre(p.base, .45); c.lineWidth = Math.max(1, 1.1*s); c.globalAlpha = p.twistAlpha == null ? .55 : p.twistAlpha;
      for(var j=1;j<pts.length;j++){ acc += Math.hypot(pts[j].x - pts[j-1].x, pts[j].y - pts[j-1].y); if(acc >= pitch){ acc = 0; var qq = pts[j], d = t*.45; c.beginPath(); c.moveTo(qq.x - qq.nx*t*.47 - qq.tx*d, qq.y - qq.ny*t*.47 - qq.ty*d); c.quadraticCurveTo(qq.x - qq.tx*d*.15, qq.y - qq.ty*d*.15, qq.x + qq.nx*t*.47 + qq.tx*d, qq.y + qq.ny*t*.47 + qq.ty*d); c.stroke(); } }
      c.globalAlpha = 1; }
    c.globalAlpha = .06 + p.sheen*.75; c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(1, t*(.1 + p.sheen*.12)); chemin(c, pts, -t*.22); c.globalAlpha = 1;
  }
  if(p.perles){ c.fillStyle = 'rgba(255,255,255,.9)'; for(var b = 12; b < pts.length - 12; b += Math.round(14 + Rn()*10)){ rond(c, pts[b].x, pts[b].y, (1.2 + Rn()*1.3)*s); } }
  if(o.suie){ for(var g=0; g<o.suie; g++){ var qs = pts[8 + Math.floor(Rn()*(pts.length-16))], of = (Rn()-.5)*t*.85; blob(c, qs.x + qs.nx*of, qs.y + qs.ny*of, (1.1 + Rn()*2.2)*s, Rn, '#17110f'); } }
}
function ombreSol(c, cx, cy, s){ c.fillStyle = 'rgba(20,14,40,.22)'; c.beginPath(); c.ellipse(cx + 6*s, cy + 32*s, 46*s, 9*s, 0, 0, 6.283); c.fill(); }
function dessinerGrain(c, w, h, k, seed, s){
  var Rn = rng(seed), cx = w/2, cy = h/2, i, a, px, py; s = s || 1; ombreSol(c, cx, cy, s);
  if(k === 'suie'){ for(i=0;i<34;i++){ a = Rn()*6.28; var d = Rn()*30*s; c.fillStyle = ['#141012','#221c1c','#2c2626','#1a1514'][i%4]; rond(c, cx + Math.cos(a)*d, cy + Math.sin(a)*d*.8, (4 + Rn()*6)*s); }
    c.fillStyle = 'rgba(40,40,50,.35)'; for(i=0;i<20;i++) rond(c, cx + (Rn()-.5)*80*s, cy + (Rn()-.5)*60*s, (1 + Rn()*2)*s); }
  else if(k === 'charbon'){ blob(c, cx, cy, 40*s, Rn, '#1b1b1f', 7); c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.moveTo(cx - 20*s, cy - 18*s); c.lineTo(cx + 12*s, cy - 26*s); c.lineTo(cx + 4*s, cy); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,120,135,.6)'; c.lineWidth = 1.4*s; for(i=-3;i<=3;i++){ c.beginPath(); c.moveTo(cx - 30*s, cy + i*8*s); c.lineTo(cx + 30*s, cy + i*8*s - 6*s); c.stroke(); } }
  else if(k === 'poudre'){ for(i=0;i<16;i++){ px = cx + (i%4 - 1.5)*17*s + (Rn()-.5)*5*s; py = cy + (Math.floor(i/4) - 1.5)*15*s; c.fillStyle = '#3a3d42'; rond(c, px, py, 7*s); c.fillStyle = 'rgba(255,255,255,.4)'; rond(c, px - 2*s, py - 2*s, 1.8*s); } }
  else if(k === 'poivre'){ [[-22,-6],[16,-12],[-4,16],[26,14]].forEach(function(q){ var x = cx + q[0]*s, y = cy + q[1]*s; c.fillStyle = '#3b2a20'; rond(c, x, y, 16*s); c.strokeStyle = '#1f140d'; c.lineWidth = 1.6*s; for(var j=0;j<5;j++){ c.beginPath(); c.arc(x + (Rn()-.5)*14*s, y + (Rn()-.5)*14*s, (4 + Rn()*6)*s, Rn()*3, Rn()*3 + 2); c.stroke(); } }); }
  else if(k === 'pavot'){ for(i=0;i<30;i++){ px = cx + (Rn()-.5)*72*s; py = cy + (Rn()-.5)*48*s; c.fillStyle = ['#3a4658','#2c3646','#465468'][i%3]; c.beginPath(); c.ellipse(px, py, 4.6*s, 3.6*s, Rn()*3, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,255,255,.45)'; rond(c, px - 1.4*s, py - 1.2*s, 1*s); } }
  else if(k === 'limaille'){ c.lineCap = 'round'; for(i=0;i<46;i++){ px = cx + (Rn()-.5)*74*s; py = cy + (Rn()-.5)*50*s; a = Rn()*3.14; var L = (5 + Rn()*8)*s; c.strokeStyle = ['#70747e','#9a9ea8','#565a64'][i%3]; c.lineWidth = (1.4 + Rn()*1.2)*s; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a)*L, py + Math.sin(a)*L); c.stroke(); if(i % 4 === 0){ c.strokeStyle = '#fff'; c.lineWidth = .8*s; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a)*L*.4, py + Math.sin(a)*L*.4); c.stroke(); } } }
  else if(k === 'ardoise'){ c.fillStyle = '#4a5564'; c.beginPath(); c.moveTo(cx - 42*s, cy - 6*s); c.lineTo(cx - 4*s, cy - 28*s); c.lineTo(cx + 40*s, cy - 12*s); c.lineTo(cx + 30*s, cy + 22*s); c.lineTo(cx - 22*s, cy + 28*s); c.closePath(); c.fill();
    c.fillStyle = '#687688'; c.beginPath(); c.moveTo(cx - 36*s, cy - 6*s); c.lineTo(cx - 4*s, cy - 24*s); c.lineTo(cx + 32*s, cy - 11*s); c.lineTo(cx + 2*s, cy + 2*s); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(20,26,36,.5)'; c.lineWidth = 1*s; for(i=0;i<5;i++){ c.beginPath(); c.moveTo(cx - 24*s + i*3*s, cy + 6*s + i*5*s); c.lineTo(cx + 30*s - i*2*s, cy + 2*s + i*5*s); c.stroke(); } }
  else if(k === 'terre'){ blob(c, cx, cy, 38*s, Rn, '#7a5230', 11); c.fillStyle = '#b08a5a'; for(i=0;i<22;i++) rond(c, cx + (Rn()-.5)*56*s, cy + (Rn()-.5)*44*s, (1 + Rn()*2.4)*s);
    c.fillStyle = '#9a96a8'; for(i=0;i<4;i++) rond(c, cx + (Rn()-.5)*50*s, cy + (Rn()-.5)*40*s, (3 + Rn()*3)*s); c.strokeStyle = '#d8c39a'; c.lineWidth = 1.5*s; c.beginPath(); c.moveTo(cx - 40*s, cy + 10*s); c.quadraticCurveTo(cx, cy - 10*s, cx + 44*s, cy + 6*s); c.stroke(); }
  else if(k === 'argile'){ blob(c, cx, cy, 38*s, Rn, '#b87a4a', 14); c.fillStyle = 'rgba(255,230,200,.3)'; c.beginPath(); c.ellipse(cx - 8*s, cy - 10*s, 20*s, 9*s, -.3, 0, 6.283); c.fill();
    c.strokeStyle = '#7a4a26'; c.lineWidth = 1.3*s; c.beginPath(); c.moveTo(cx - 20*s, cy + 14*s); c.lineTo(cx - 4*s, cy + 4*s); c.lineTo(cx + 6*s, cy + 12*s); c.lineTo(cx + 24*s, cy); c.moveTo(cx - 4*s, cy + 4*s); c.lineTo(cx + 2*s, cy - 12*s); c.stroke(); }
  else if(k === 'sciure'){ c.lineCap = 'round'; for(i=0;i<11;i++){ px = cx + (Rn()-.5)*66*s; py = cy + (Rn()-.5)*42*s; var r0 = (5 + Rn()*6)*s, a0 = Rn()*6; c.strokeStyle = '#a87a3e'; c.lineWidth = 4.6*s; c.beginPath(); c.arc(px, py, r0, a0, a0 + 2.2 + Rn()*2); c.stroke(); c.strokeStyle = '#e6c088'; c.lineWidth = 3*s; c.stroke(); }
    c.fillStyle = '#d8b070'; for(i=0;i<26;i++) rond(c, cx + (Rn()-.5)*80*s, cy + (Rn()-.5)*54*s, (.8 + Rn()*1.2)*s); }
  else if(k === 'rouille'){ for(i=0;i<5;i++){ px = cx + (Rn()-.5)*50*s; py = cy + (Rn()-.5)*30*s; blob(c, px, py, (13 + Rn()*8)*s, Rn, i % 2 ? '#a85a22' : '#8a4418', 8); c.fillStyle = '#d8843a'; rond(c, px - 3*s, py - 4*s, 3*s); c.fillStyle = '#5a2a10'; for(var j2=0;j2<4;j2++) rond(c, px + (Rn()-.5)*16*s, py + (Rn()-.5)*14*s, (1 + Rn()*1.6)*s); } }
  else if(k === 'cannelle'){ c.fillStyle = '#9a5a2a'; c.beginPath(); c.moveTo(cx - 42*s, cy - 10*s); c.lineTo(cx + 36*s, cy - 18*s); c.lineTo(cx + 40*s, cy + 6*s); c.lineTo(cx - 38*s, cy + 14*s); c.closePath(); c.fill();
    c.strokeStyle = '#6a3814'; c.lineWidth = 1.4*s; for(i=0;i<4;i++){ c.beginPath(); c.moveTo(cx - 40*s, cy - 6*s + i*5*s); c.lineTo(cx + 38*s, cy - 14*s + i*5*s); c.stroke(); }
    c.strokeStyle = '#6a3814'; c.lineWidth = 3*s; c.beginPath(); c.arc(cx + 38*s, cy - 6*s, 10*s, -1.6, 1.5); c.stroke(); c.beginPath(); c.arc(cx + 38*s, cy - 6*s, 5*s, -1.2, 2.4); c.stroke();
    c.fillStyle = '#b87a44'; for(i=0;i<14;i++) rond(c, cx + (Rn()-.5)*80*s, cy + 22*s + Rn()*8*s, (.8 + Rn()*1.2)*s); }
  else if(k === 'sable'){ for(i=0;i<9;i++){ var sx = cx + (Rn()-.5)*70*s, sy = cy + (Rn()-.5)*50*s, r = (9 + Rn()*7)*s; c.fillStyle = 'rgba(232,210,160,.95)'; rond(c, sx, sy, r); c.fillStyle = 'rgba(255,255,255,.55)'; rond(c, sx - r*.3, sy - r*.3, r*.3); } }
  else if(k === 'sel'){ for(i=0;i<8;i++){ px = cx + (Rn()-.5)*64*s; py = cy + (Rn()-.5)*40*s; var t2 = (9 + Rn()*7)*s, ro = Rn()*1.5; c.save(); c.translate(px, py); c.rotate(ro); c.fillStyle = 'rgba(244,248,255,.92)'; c.fillRect(-t2/2, -t2/2, t2, t2); c.strokeStyle = 'rgba(120,140,180,.8)'; c.lineWidth = 1*s; c.strokeRect(-t2/2, -t2/2, t2, t2);
      c.strokeStyle = 'rgba(120,140,180,.5)'; c.beginPath(); c.moveTo(-t2/2, -t2/2); c.lineTo(0, 0); c.lineTo(t2/2, -t2/2); c.moveTo(0, 0); c.lineTo(0, t2/2); c.stroke(); c.restore(); } }
  else if(k === 'cendre'){ c.fillStyle = 'rgba(190,186,182,.75)'; c.beginPath(); c.ellipse(cx, cy + 4*s, 42*s, 24*s, 0, 0, 6.283); c.fill(); for(i=0;i<70;i++){ c.fillStyle = ['#d8d4d0','#b0aca8','#c8c4c0','#9a9692'][i%4]; rond(c, cx + (Rn()-.5)*86*s, cy + (Rn()-.5)*50*s, (1 + Rn()*2.4)*s); } c.fillStyle = '#3a3634'; for(i=0;i<9;i++) rond(c, cx + (Rn()-.5)*60*s, cy + (Rn()-.5)*36*s, (1.2 + Rn()*1.8)*s); }
  else if(k === 'farine'){ var gf = c.createRadialGradient(cx - 10*s, cy - 10*s, 4*s, cx, cy, 48*s); gf.addColorStop(0, '#ffffff'); gf.addColorStop(1, '#e6dfd0'); c.fillStyle = gf; c.beginPath(); c.ellipse(cx, cy + 2*s, 44*s, 26*s, 0, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,255,255,.8)'; for(i=0;i<40;i++) rond(c, cx + (Rn()-.5)*100*s, cy + (Rn()-.5)*62*s, (.6 + Rn()*1.1)*s); }
  else if(k === 'tuile'){ c.fillStyle = '#d9772f'; c.beginPath(); c.moveTo(cx - 40*s, cy - 14*s); c.lineTo(cx + 18*s, cy - 30*s); c.lineTo(cx + 42*s, cy + 6*s); c.lineTo(cx + 6*s, cy + 30*s); c.lineTo(cx - 34*s, cy + 18*s); c.closePath(); c.fill();
    c.fillStyle = '#ee9a58'; c.beginPath(); c.moveTo(cx - 34*s, cy - 10*s); c.lineTo(cx + 16*s, cy - 24*s); c.lineTo(cx + 30*s, cy); c.lineTo(cx - 4*s, cy + 10*s); c.closePath(); c.fill(); c.fillStyle = '#8a3f12'; for(i=0;i<16;i++) rond(c, cx + (Rn()-.5)*60*s, cy + (Rn()-.5)*36*s, (1 + Rn()*1.6)*s); }
  else if(k === 'brique'){ blob(c, cx, cy, 40*s, Rn, '#a8432e', 6); c.fillStyle = '#e8e2d4'; c.beginPath(); c.ellipse(cx + 14*s, cy - 8*s, 14*s, 8*s, .4, 0, 6.283); c.fill(); }
  else if(k === 'or'){ var gr = c.createLinearGradient(cx - 40*s, cy - 30*s, cx + 40*s, cy + 30*s); gr.addColorStop(0,'#fff3b0'); gr.addColorStop(.5,'#f2c040'); gr.addColorStop(1,'#b07a1c'); blob(c, cx, cy, 38*s, Rn, gr, 12);
    c.strokeStyle = 'rgba(140,90,10,.6)'; c.lineWidth = 1.5*s; for(i=0;i<5;i++){ c.beginPath(); c.moveTo(cx + (Rn()-.5)*50*s, cy + (Rn()-.5)*40*s); c.lineTo(cx + (Rn()-.5)*50*s, cy + (Rn()-.5)*40*s); c.stroke(); }
    c.fillStyle = '#fff'; [[-12,-10],[10,4],[-2,14]].forEach(function(q){ rond(c, cx + q[0]*s, cy + q[1]*s, 2.2*s); }); }
  else if(k === 'laiton'){ c.strokeStyle = '#7a5a12'; c.lineWidth = 12*s; c.beginPath(); for(i=0;i<60;i++){ var a2 = i/60*Math.PI*3.2, r2 = 8*s + i*.5*s; var x2 = cx + Math.cos(a2)*r2, y2 = cy + Math.sin(a2)*r2*.7; if(i) c.lineTo(x2,y2); else c.moveTo(x2,y2); } c.stroke(); c.strokeStyle = '#c9a23a'; c.lineWidth = 7*s; c.stroke(); }
  else if(k === 'mica'){ c.fillStyle = 'rgba(225,232,244,.7)'; c.beginPath(); for(i=0;i<6;i++){ var a3 = i/6*6.283; c.lineTo(cx + Math.cos(a3)*38*s, cy + Math.sin(a3)*30*s); } c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 2*s; c.stroke(); c.beginPath(); c.moveTo(cx - 20*s, cy - 6*s); c.lineTo(cx + 10*s, cy - 18*s); c.stroke(); }
  else if(k === 'verre'){ [[-18,-4,0],[14,-10,1],[2,14,2.2]].forEach(function(q){ c.save(); c.translate(cx + q[0]*s, cy + q[1]*s); c.rotate(q[2]); c.fillStyle = 'rgba(140,205,175,.6)'; c.beginPath(); c.moveTo(-18*s, 6*s); c.lineTo(-4*s, -14*s); c.lineTo(18*s, -2*s); c.lineTo(6*s, 12*s); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.5*s; c.stroke(); c.beginPath(); c.moveTo(-4*s, -14*s); c.lineTo(2*s, 4*s); c.stroke(); c.restore(); }); }
  else if(k === 'bardane'){ dessinerBardane(c, cx, cy, 23*s, Rn); }
  /* le soufre : des cristaux jaune citron (enquête 2) */
  else if(k === 'soufre'){ for(i=0;i<7;i++){ px = cx + (Rn()-.5)*60*s; py = cy + (Rn()-.5)*40*s; var rS = (8 + Rn()*7)*s; c.fillStyle = i % 2 ? '#e8c830' : '#f2d84a'; c.strokeStyle = '#8a7010'; c.lineWidth = 1.2*s; c.beginPath(); for(var jS = 0; jS < 6; jS++){ var aS = jS/6*6.283 + Rn()*.4; c.lineTo(px + Math.cos(aS)*rS*(jS % 2 ? .7 : 1), py + Math.sin(aS)*rS*(jS % 2 ? .7 : 1)); } c.closePath(); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,252,210,.7)'; rond(c, px - rS*.3, py - rS*.3, rS*.2); } }
  /* le vert-de-gris : des croûtes vert-bleu, comme sur une vieille marmite de cuivre (enquête 2) */
  else if(k === 'vertdegris'){ for(i=0;i<6;i++){ px = cx + (Rn()-.5)*56*s; py = cy + (Rn()-.5)*36*s; blob(c, px, py, (10 + Rn()*8)*s, Rn, i % 2 ? '#3aa88a' : '#5cc0a0', 7); c.fillStyle = '#b06a3a'; rond(c, px + 3*s, py - 2*s, 2.4*s); c.fillStyle = 'rgba(255,255,255,.35)'; rond(c, px - 3*s, py - 4*s, 2*s); } }
  else if(k === 'pollenlav' || k === 'pollenpin' || k === 'pollenpis'){ [[-24,-8,15],[16,-13,13],[0,14,16]].forEach(function(q){ dessinerPollen(c, cx + q[0]*s, cy + q[1]*s, q[2]*s, k.slice(6)); }); }
}
function dessinerPlume(c, w, h, e, seed, s){
  var Rn = rng(seed); s = s || 1; var L = e.L || 1, lg = e.larg || 1, cx = w/2, cy = h/2;
  var x0 = cx - 46*s*L, y0 = cy + 15*s*L, x1 = cx + 46*s*L, y1 = cy - 15*s*L, ang = Math.atan2(y1 - y0, x1 - x0), n = 50, i; c.lineCap = 'round';
  for(i=0;i<n;i++){ var t = .12 + i/n*.87, x = x0 + (x1-x0)*t, y = y0 + (y1-y0)*t, len = (5 + 14*Math.sin(Math.PI*Math.min(1, (t-.12)*1.14)))*s*lg;
    [1,-1].forEach(function(sd){ var a = ang + sd*1.05, cc = e.col;
      if(e.bout && t > e.tb) cc = e.bout; if(e.tache && Rn() < .3) cc = e.tache; if(e.barres && (Math.floor(t*e.nb*2) % 2)) cc = e.barres;
      if(e.miroir && sd > 0){ if(t > .46 && t < .7) cc = e.miroir; else if((t > .42 && t <= .46) || (t >= .7 && t < .74)) cc = '#f4f4f4'; }
      if(e.oeil && t > .6) cc = '#3a9a5a';
      /* une plume teinte : la teinture n'a pas pris tout en bas ; l'eau chaude a délavé une bande */
      if(e.teinte && t < .2 + Rn()*.05) cc = '#d6d0c0'; if(e.delave && t > .44 && t < .64) cc = Rn() < .8 ? '#e4dfd2' : '#8a8690';
      var ex = x + Math.cos(a)*len + Math.cos(ang)*5*s, ey = y + Math.sin(a)*len + Math.sin(ang)*5*s, mx = x + Math.cos(a)*len*.55 + Math.cos(ang)*2.5*s, my = y + Math.sin(a)*len*.55 + Math.sin(ang)*2.5*s;
      c.strokeStyle = cc; c.lineWidth = 1.7*s; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
      if(e.coeur){ c.strokeStyle = e.coeur; c.beginPath(); c.moveTo(x, y); c.lineTo(mx, my); c.stroke(); }
      if(e.doux){ c.globalAlpha = .4; c.lineWidth = .7*s; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a + (Rn()-.5))*5*s, ey + Math.sin(a + (Rn()-.5))*5*s); c.stroke(); c.globalAlpha = 1; } }); }
  if(e.lustre){ c.globalAlpha = .38; c.strokeStyle = e.lustre; c.lineWidth = 4*s; c.beginPath(); c.moveTo(x0 + (x1-x0)*.3, y0 + (y1-y0)*.3 - 5*s); c.lineTo(x0 + (x1-x0)*.8, y0 + (y1-y0)*.8 - 5*s); c.stroke(); c.globalAlpha = 1; }
  if(e.oeil){ var ox = x0 + (x1-x0)*.76, oy = y0 + (y1-y0)*.76; [['#c8a030',15],['#1f8a8a',11.5],['#1a3a9a',8],['#101020',4.5]].forEach(function(q){ c.fillStyle = q[0]; c.beginPath(); c.ellipse(ox, oy, q[1]*s*1.1, q[1]*s*.85, ang, 0, 6.283); c.fill(); }); }
  c.strokeStyle = e.tige || '#e9e2d0'; c.lineWidth = 2.3*s; c.beginPath(); c.moveTo(x0 - 9*s, y0 + 3*s); c.lineTo(x1, y1); c.stroke();
}
function dessinerPoils(c, w, h, e, seed, s){
  var Rn = rng(seed); s = s || 1; var cx = w/2, cy = h/2; c.lineCap = 'round';
  for(var i=0;i<e.n;i++){ var y0 = cy + (Rn() - .5)*46*s, ph = Rn()*6, L = 104*s*e.l*(.7 + .3*Rn()), x0 = cx - L/2 + (Rn() - .5)*16*s*(e.l < .6 ? 4 : 1);
    var seg = e.bandes ? [[0,.34,e.bandes[0]],[.34,.68,e.bandes[1]],[.68,1,e.bandes[2]]] : (e.bout ? [[0,.8,e.col],[.8,1,e.bout]] : [[0,1,e.col]]);
    c.lineWidth = e.lw*s;
    seg.forEach(function(g){ c.strokeStyle = g[2]; c.beginPath(); for(var x = L*g[0]; x <= L*g[1] + .01; x += 2*s){ var yy = y0 + Math.sin(x/s*e.f + ph)*e.amp*s; if(x === L*g[0]) c.moveTo(x0 + x, yy); else c.lineTo(x0 + x, yy); } c.stroke(); });
    if(e.reflet){ c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1*s; c.beginPath(); c.moveTo(x0, y0 - 1*s); c.lineTo(x0 + L, y0 - 1*s); c.stroke(); } }
}
function dessinerPetale(c, w, h, e, seed, s){
  s = s || 1; var cx = w/2, cy = h/2, i, g0 = e.g || 1, u = s*g0;
  if(e.f === 'epi'){ c.strokeStyle = '#5a7a3a'; c.lineWidth = 3*s; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 50*s, cy + 22*s); c.lineTo(cx + 50*s, cy - 14*s); c.stroke();
    for(i=0;i<14;i++){ var t = .35 + i/14*.65, x = cx - 50*s + 100*s*t, y = cy + 22*s - 36*s*t; c.fillStyle = i % 2 ? '#8e6ad0' : '#a586e0'; c.beginPath(); c.ellipse(x, y - 4*s, 4*s, 6*s, -.4, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(x + 2*s, y + 4*s, 4*s, 5*s, .4, 0, 6.283); c.fill(); } return; }
  var col = e.c, g = c.createRadialGradient(cx - 30*u, cy + 6*u, 4*u, cx, cy, 60*u); g.addColorStop(0, col[1]); g.addColorStop(1, col[0]); c.fillStyle = g;
  c.beginPath();
  if(e.f === 'long'){ var L = e.L*s, W = e.W*s;
    if(e.pointe){ c.moveTo(cx - L, cy + 2*s); c.quadraticCurveTo(cx - L*.2, cy - W*1.7, cx + L, cy - 3*s); c.quadraticCurveTo(cx - L*.1, cy + W*1.7, cx - L, cy + 2*s); }
    else if(e.dents){ c.moveTo(cx - L, cy + 1*s); c.lineTo(cx - L*.7, cy - W); c.lineTo(cx + L*.86, cy - W - 2*s); for(i=0;i<5;i++){ c.lineTo(cx + L, cy - W - 2*s + (i + .5)*(2*W + 4*s)/5); c.lineTo(cx + L*.9, cy - W - 2*s + (i + 1)*(2*W + 4*s)/5); } c.lineTo(cx - L*.7, cy + W); c.closePath(); }
    else c.ellipse(cx, cy, L, W, -.1, 0, 6.283);
  } else if(e.f === 'frange'){ c.moveTo(cx - 46*s, cy + 3*s); c.lineTo(cx - 8*s, cy - 6*s); c.quadraticCurveTo(cx + 14*s, cy - 14*s, cx + 34*s, cy - 30*s); for(i=0;i<5;i++){ c.lineTo(cx + 46*s - (i % 2)*3*s, cy - 24*s + i*12*s); c.lineTo(cx + 34*s, cy - 18*s + i*12*s); } c.lineTo(cx + 36*s, cy + 30*s); c.quadraticCurveTo(cx + 14*s, cy + 16*s, cx - 8*s, cy + 8*s); c.closePath();
  } else if(e.f === 'coeur'){ c.moveTo(cx - 44*u, cy + 2*u); c.bezierCurveTo(cx - 30*u, cy - 44*u, cx + 40*u, cy - 46*u, cx + 46*u, cy - 12*u); c.quadraticCurveTo(cx + 44*u, cy - 4*u, cx + 32*u, cy); c.quadraticCurveTo(cx + 44*u, cy + 4*u, cx + 46*u, cy + 12*u); c.bezierCurveTo(cx + 40*u, cy + 46*u, cx - 30*u, cy + 44*u, cx - 44*u, cy + 2*u);
  } else { c.moveTo(cx - 46*u, cy + 8*u); c.bezierCurveTo(cx - 30*u, cy - 46*u, cx + 46*u, cy - 46*u, cx + 50*u, cy); c.bezierCurveTo(cx + 46*u, cy + 36*u, cx - 20*u, cy + 40*u, cx - 46*u, cy + 8*u); }
  c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1*s; c.stroke();
  if(e.f !== 'long' || !e.dents){ c.strokeStyle = e.rayures ? 'rgba(90,20,110,.5)' : 'rgba(0,0,0,.16)'; c.lineWidth = (e.rayures ? 1.6 : 1)*s; var nv = e.plis ? 11 : 6, ex = e.f === 'long' ? e.L*s*.9 : 42*u, ey = e.f === 'long' ? e.W*s*.7 : 30*u;
    for(var v=0; v<nv; v++){ var q = (v + .5)/nv*2 - 1; c.beginPath(); c.moveTo(cx - ex, cy + 3*s); c.quadraticCurveTo(cx, cy + q*ey*.7, cx + ex*.95, cy + q*ey); c.stroke(); } }
  if(e.tache){ c.fillStyle = e.tache; c.beginPath(); c.ellipse(cx - 40*u, cy + 6*u, 9*u, 7*u, 0, 0, 6.283); c.fill(); }
  if(e.base){ c.fillStyle = e.base; c.globalAlpha = .85; c.beginPath(); c.ellipse(cx - 34*u, cy + 2*u, 12*u, 7*u, 0, 0, 6.283); c.fill(); c.globalAlpha = 1; }
  if(e.bout){ c.fillStyle = e.bout; c.beginPath(); c.ellipse(cx + (e.L || 44)*s*.9, cy - 2*s, 6*s, 7*s, 0, 0, 6.283); c.fill(); }
  if(e.brille){ c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(cx + 8*u, cy - 14*u, 16*u, 6*u, -.3, 0, 6.283); c.fill(); }
}
function dessinerFeuille(c, w, h, e, seed, s){
  s = s || 1; var cx = w/2, cy = h/2, i, t, r, px, py; c.lineJoin = 'round'; c.lineCap = 'round';
  c.fillStyle = e.c; c.strokeStyle = 'rgba(0,0,0,.32)'; c.lineWidth = 1.5*s;
  var veine = e.f === 'lierre' ? 'rgba(230,240,200,.65)' : 'rgba(255,255,255,.42)';
  if(e.f === 'profil'){
    var ax = cx - 52*s, ay = cy + 5*s, bx = cx + 52*s, by = cy - 5*s, Lx = Math.hypot(bx - ax, by - ay), tx = (bx - ax)/Lx, ty = (by - ay)/Lx, nx = -ty, ny = tx, haut = [], bas = [];
    for(i=0;i<=100;i++){ var x = i/100, wv;
      if(e.tri) wv = Math.pow(x < e.tri ? x/e.tri : (1 - x)/(1 - e.tri), .85);
      else if(e.coeur) wv = Math.pow(Math.sin(Math.PI*Math.pow(x, .62)), .6);
      else wv = Math.pow(Math.sin(Math.PI*x), e.ex || .7);
      if(e.lobes) wv *= 1 - e.la*(.5 + .5*Math.cos(2*Math.PI*e.lobes*x));
      if(e.epines) wv *= .72 + .5*Math.pow(Math.abs(Math.sin(Math.PI*e.epines*x)), 5);
      var hw = e.w*Lx*wv; if(e.dents && wv > .06) hw += e.da*Lx*((x*e.dents) % 1);
      var mx = ax + tx*Lx*x, my = ay + ty*Lx*x; haut.push([mx + nx*hw, my + ny*hw]); bas.push([mx - nx*hw, my - ny*hw]); }
    if(e.tige){ c.strokeStyle = sombre(e.c, .3); c.lineWidth = 2.4*s; c.beginPath(); c.moveTo(ax - tx*16*s, ay - ty*16*s + 3*s); c.lineTo(ax, ay); c.stroke(); c.strokeStyle = 'rgba(0,0,0,.32)'; c.lineWidth = 1.5*s; }
    c.beginPath(); haut.forEach(function(q, j){ if(j) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); bas.reverse().forEach(function(q){ c.lineTo(q[0], q[1]); }); c.closePath(); c.fill(); c.stroke();
    if(e.brille){ c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(cx, cy - e.w*Lx*.35, Lx*.3, e.w*Lx*.2, Math.atan2(ty, tx), 0, 6.283); c.fill(); }
    c.strokeStyle = veine; c.lineWidth = 1.4*s; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    var nn = e.ner || 6; c.lineWidth = 1*s;
    for(i=1;i<=nn;i++){ var xv = i/(nn + 1), j0 = Math.round(xv*100), j1 = Math.min(100, j0 + 9), m0x = ax + tx*Lx*xv, m0y = ay + ty*Lx*xv, hq = haut[j1], bq = bas[100 - j1];
      c.beginPath(); c.moveTo(m0x, m0y); c.lineTo(m0x + (hq[0] - m0x)*.85, m0y + (hq[1] - m0y)*.85); c.moveTo(m0x, m0y); c.lineTo(m0x + (bq[0] - m0x)*.85, m0y + (bq[1] - m0y)*.85); c.stroke(); }
    if(e.poilue){ c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = .8*s; for(i=8;i<96;i+=5){ var qh = haut[i]; c.beginPath(); c.moveTo(qh[0], qh[1]); c.lineTo(qh[0] + nx*4*s, qh[1] + ny*4*s); c.stroke(); } }
    return;
  }
  if(e.f === 'compose'){ c.beginPath(); c.moveTo(cx - 55*s, cy + 6*s); c.lineTo(cx + 55*s, cy - 6*s); c.stroke(); for(i=0;i<7;i++){ var fx = cx - 46*s + i*15*s, fy = cy + 4*s - i*1.4*s; [1,-1].forEach(function(sd){ if(i === 6 && sd < 0) return; c.beginPath(); c.ellipse(fx + (i === 6 ? 8*s : 0), fy + sd*(i === 6 ? 0 : 10*s), 9*s, 4.5*s, sd*.5, 0, 6.283); c.fill(); c.stroke(); }); } return; }
  if(e.f === 'aiguilles'){ c.strokeStyle = '#6a4424'; c.lineWidth = 3*s; c.beginPath(); c.moveTo(cx - 50*s, cy + 8*s); c.lineTo(cx + 50*s, cy - 8*s); c.stroke();
    for(i=0;i<28;i++){ var q2 = i/27, gx = cx - 48*s + 96*s*q2, gy = cy + 7.6*s - 15.2*s*q2; [1,-1].forEach(function(sd){ c.strokeStyle = sd > 0 ? e.c : '#3f7a4e'; c.lineWidth = 2*s; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + 6*s, gy - sd*13*s); c.stroke(); }); } return; }
  if(e.f === 'fronde'){ c.strokeStyle = '#3a6a34'; c.lineWidth = 2.2*s; c.beginPath(); c.moveTo(cx - 52*s, cy + 8*s); c.lineTo(cx + 52*s, cy - 8*s); c.stroke();
    for(i=0;i<15;i++){ var q3 = (i + 1)/16, hx = cx - 52*s + 104*s*q3, hy = cy + 8*s - 16*s*q3, len = 24*s*Math.sin(Math.PI*Math.pow(q3, .7)) + 3*s; [1,-1].forEach(function(sd){ c.save(); c.translate(hx, hy); c.rotate(sd*-1.15 - .15); c.fillStyle = e.c; c.beginPath(); c.ellipse(len/2, 0, len/2, 2.8*s, 0, 0, 6.283); c.fill(); c.restore(); }); } return; }
  if(e.f === 'trefle'){ c.strokeStyle = '#3a7a3a'; c.lineWidth = 2.4*s; c.beginPath(); c.moveTo(cx, cy + 4*s); c.quadraticCurveTo(cx - 14*s, cy + 22*s, cx - 34*s, cy + 26*s); c.stroke();
    [-1.57, .52, 2.62].forEach(function(a){ c.save(); c.translate(cx + Math.cos(a)*15*s, cy - 2*s + Math.sin(a)*15*s); c.rotate(a + 1.57); c.fillStyle = e.c; c.strokeStyle = 'rgba(0,0,0,.32)'; c.lineWidth = 1.5*s;
      c.beginPath(); c.moveTo(0, 14*s); c.bezierCurveTo(-22*s, 2*s, -14*s, -20*s, 0, -10*s); c.bezierCurveTo(14*s, -20*s, 22*s, 2*s, 0, 14*s); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(235,250,220,.7)'; c.lineWidth = 1.6*s; c.beginPath(); c.moveTo(-8*s, -2*s); c.lineTo(0, 4*s); c.lineTo(8*s, -2*s); c.stroke(); c.restore(); }); return; }
  /* érable et lierre : cinq pointes autour du pied de la feuille */
  var lierre = e.f === 'lierre', bx0 = cx - 14*s;
  c.strokeStyle = sombre(e.c, .3); c.lineWidth = 2.4*s; c.beginPath(); c.moveTo(bx0, cy); c.lineTo(bx0 - 30*s, cy + 6*s); c.stroke(); c.strokeStyle = 'rgba(0,0,0,.32)'; c.lineWidth = 1.5*s;
  c.beginPath();
  for(i=0;i<=180;i++){ t = i/180*6.283 - Math.PI; var len2 = (lierre ? 40 : 46) - (lierre ? 14 : 18)*(1 - Math.cos(t))/2, pic = Math.pow(Math.abs(Math.cos(2.5*t)), lierre ? .75 : 1.5);
    r = ((lierre ? .58 : .3) + (lierre ? .42 : .7)*pic)*len2*s; if(!lierre) r *= 1 + .1*Math.pow(Math.abs(Math.cos(7.5*t)), 3);
    px = bx0 + Math.cos(t)*r*1.12; py = cy + Math.sin(t)*r*.95; if(i) c.lineTo(px, py); else c.moveTo(px, py); }
  c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = veine; c.lineWidth = 1.3*s; [0, 1.257, -1.257, 2.513, -2.513].forEach(function(a){ var l3 = ((lierre ? 40 : 46) - (lierre ? 14 : 18)*(1 - Math.cos(a))/2)*s*.86; c.beginPath(); c.moveTo(bx0, cy); c.lineTo(bx0 + Math.cos(a)*l3*1.12, cy + Math.sin(a)*l3*.95); c.stroke(); });
}
/* Une écriture à la plume (enquête 3 : la lettre d'Odette et les douze mots du Livre d'or), posée sur son bout de papier.
   Les mots sont écrits lettre par lettre. Trois signes se regardent de près : le « M » (e.M : pointu comme des dents de scie ; sinon
   rond comme deux collines), la barre du « t » (e.t : une longue vague ; sinon le petit trait droit), le point du « i » (e.i : un
   petit rond vide ; sinon un point plein). Le reste fait le caractère de chacun : la taille, la pente, le gras, une petite fleur,
   une tache de farine, des pâtés d'encre. Dessinée pour une case de 122 × 68 (× s). */
function dessinerEcriture(c, w, h, e, seed, s){
  s = s || 1; var Rn = rng((seed || 7) + e.l.join('').length), L = e.l, n = L.length, i, k;
  var pw = 122*s, ph = (e.lettre ? 86 : 68)*s, T0 = (e.taille || 1)*(n > 3 ? 14.5 : (n > 2 ? 16 : (n > 1 ? 20 : 26)))*s, encre = e.encre || '#2b2233';
  var police = (e.gras ? '700 ' : '500 '), fam = 'px Caveat, "Segoe Script", "Comic Sans MS", cursive';
  function largeur(t, T){ c.font = police + T + fam; var x = 0; for(var j = 0; j < t.length; j++){ var ch = t[j]; x += ch === 'M' ? T*.66 : c.measureText(ch === 'i' ? '\u0131' : ch).width; x += T*.02; } return x; }
  /* tout doit tenir sur le papier : on rapetisse un peu si une ligne dépasse */
  var plus = 0; for(i = 0; i < n; i++) plus = Math.max(plus, largeur(L[i], T0)); if(plus > pw*.9) T0 *= pw*.9/plus;
  var inter = T0*1.08, haut = inter*(n - 1), y0 = -haut/2 + T0*.28;
  c.save(); c.translate(w/2, h/2);
  /* le papier : une ombre, la feuille, ses lignes à peine tracées (la lettre : un pli au milieu, un coin corné) */
  c.rotate(e.lettre ? -.03 : (Rn() - .5)*.05);
  c.fillStyle = 'rgba(40,24,10,.28)'; c.fillRect(-pw/2 + 3*s, -ph/2 + 4*s, pw, ph);
  c.fillStyle = e.papier || '#fbf4de'; c.fillRect(-pw/2, -ph/2, pw, ph);
  c.strokeStyle = 'rgba(90,64,40,.55)'; c.lineWidth = Math.max(1, 1.1*s); c.strokeRect(-pw/2, -ph/2, pw, ph);
  if(e.lettre){ c.strokeStyle = 'rgba(120,96,60,.3)'; c.lineWidth = Math.max(1, 1.4*s); c.beginPath(); c.moveTo(-pw/2, 2*s); c.lineTo(pw/2, -1*s); c.stroke();
    c.fillStyle = 'rgba(120,96,60,.22)'; c.beginPath(); c.moveTo(pw/2, ph/2); c.lineTo(pw/2 - 13*s, ph/2); c.lineTo(pw/2, ph/2 - 13*s); c.closePath(); c.fill(); }
  else { c.strokeStyle = 'rgba(120,150,190,.28)'; c.lineWidth = Math.max(.6, .7*s); for(i = 0; i < n; i++){ c.beginPath(); c.moveTo(-pw/2 + 5*s, y0 + i*inter + T0*.1); c.lineTo(pw/2 - 5*s, y0 + i*inter + T0*.1); c.stroke(); } }
  c.fillStyle = encre; c.strokeStyle = encre; c.lineCap = 'round'; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  var pen = e.penche == null ? .14 : e.penche, ep = Math.max(1, T0*(e.gras ? .085 : .068));
  for(i = 0; i < n; i++){
    var t = L[i], lg = largeur(t, T0), x = -lg/2, signe = e.lettre && i === n - 1;
    c.save(); c.translate(signe ? pw*.16 : 0, y0 + i*inter); c.transform(1, 0, -pen, 1, 0, 0); c.font = police + T0 + fam;
    for(k = 0; k < t.length; k++){
      var ch = t[k], lw;
      if(ch === 'M'){
        lw = T0*.66; c.lineWidth = ep; c.beginPath();
        if(e.M){ c.lineJoin = 'miter'; c.miterLimit = 12; c.moveTo(x + T0*.02, 0); c.lineTo(x + T0*.12, -T0*.7); c.lineTo(x + T0*.31, -T0*.12); c.lineTo(x + T0*.48, -T0*.7); c.lineTo(x + T0*.6, 0); }
        else { c.lineJoin = 'round'; c.moveTo(x + T0*.03, 0); c.lineTo(x + T0*.05, -T0*.4); c.bezierCurveTo(x + T0*.06, -T0*.72, x + T0*.3, -T0*.72, x + T0*.31, -T0*.36); c.lineTo(x + T0*.31, -T0*.1);
          c.moveTo(x + T0*.31, -T0*.36); c.bezierCurveTo(x + T0*.32, -T0*.72, x + T0*.57, -T0*.72, x + T0*.58, -T0*.4); c.lineTo(x + T0*.6, 0); }
        c.stroke();
      } else if(ch === 'i'){
        lw = c.measureText('\u0131').width; c.fillText('\u0131', x, 0);
        c.beginPath(); if(e.i){ c.lineWidth = Math.max(.9, ep*.8); c.arc(x + lw*.5, -T0*.58, T0*.125, 0, 6.283); c.stroke(); } else { c.arc(x + lw*.5, -T0*.54, T0*.055, 0, 6.283); c.fill(); }
      } else if(ch === 't'){
        lw = c.measureText('t').width; c.fillText('t', x, 0);
        if(e.t){ c.lineWidth = Math.max(1, ep); c.lineJoin = 'round'; c.beginPath(); var x0 = x - T0*.16, x1 = x + lw + T0*.2, yb = -T0*.37;
          c.moveTo(x0, yb); c.bezierCurveTo(x0 + (x1 - x0)*.3, yb - T0*.17, x0 + (x1 - x0)*.42, yb - T0*.15, (x0 + x1)/2, yb); c.bezierCurveTo(x0 + (x1 - x0)*.6, yb + T0*.15, x0 + (x1 - x0)*.72, yb + T0*.15, x1, yb - T0*.03); c.stroke(); }
      } else { lw = c.measureText(ch).width; c.fillText(ch, x, 0); }
      x += lw + T0*.02;
    }
    c.restore();
  }
  /* ce qui traîne sur le papier */
  if(e.deco === 'fleur'){ var fx = pw*.33, fy = -ph*.2, fr = 5.5*s; c.fillStyle = '#b48cff'; for(i = 0; i < 5; i++){ var a = i/5*6.283 - 1.57; c.beginPath(); c.arc(fx + Math.cos(a)*fr, fy + Math.sin(a)*fr, fr*.62, 0, 6.283); c.fill(); }
    c.fillStyle = '#f5b945'; c.beginPath(); c.arc(fx, fy, fr*.5, 0, 6.283); c.fill(); c.strokeStyle = encre; c.lineWidth = Math.max(.8, .8*s); c.beginPath(); c.moveTo(fx, fy + fr*1.4); c.quadraticCurveTo(fx + 3*s, fy + fr*2.4, fx - 1*s, fy + fr*3.6); c.stroke(); }
  if(e.deco === 'farine'){ c.fillStyle = 'rgba(255,255,255,.82)'; for(i = 0; i < 26; i++){ var da = Rn()*6.283, dd = Rn()*17*s; c.beginPath(); c.arc(pw*.3 + Math.cos(da)*dd, ph*.22 + Math.sin(da)*dd*.6, (1 + Rn()*2.6)*s, 0, 6.283); c.fill(); } }
  if(e.deco === 'pates'){ c.fillStyle = encre; [[-.34, -.24, 4.6], [.36, .1, 6], [.12, .32, 3.4], [.4, .2, 2]].forEach(function(q){ blob(c, pw*q[0], ph*q[1], q[2]*s, Rn, encre, 8); }); }
  c.restore();
}
function dessinerRef(c, w, h, tk, r, seed, s){
  var e = ECH[tk][r];
  if(tk === 'ecritures'){ dessinerEcriture(c, w, h, e, seed, s || 1); return; }
  if(tk === 'fils') dessinerFil(c, w, h, e.p, {scale:s || 1, seed:seed});
  else if(tk === 'grains') dessinerGrain(c, w, h, r, seed, s);
  else if(tk === 'plumes') dessinerPlume(c, w, h, e, seed, s);
  else if(tk === 'poils') dessinerPoils(c, w, h, e, seed, s);
  else if(tk === 'petales') dessinerPetale(c, w, h, e, seed, s);
  else dessinerFeuille(c, w, h, e, seed, s);
}
/* Une pièce d'or vue de face (enquête 2) : le bord cranté, une couronne, une ronde d'étoiles, la petite fêlure en éclair sous la couronne ;
   o.farine : de la poussière blanche dans les creux ; o.tache : une croûte rouge sur le bord */
function dessinerPieceOr(c, x, y, r, o){
  o = o || {}; var i, a;
  /* (au microscope, la pièce est immense : les traits gardent une épaisseur raisonnable) */
  var L = function(v){ return Math.min(o.gros ? 12 : 99, Math.max(1, v)); };
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(40,20,8,.25)'; c.beginPath(); c.ellipse(r*.08, r*.12, r*1.02, r*1.02, 0, 0, 6.283); c.fill();
  var g = c.createRadialGradient(-r*.35, -r*.35, r*.1, 0, 0, r*1.05); g.addColorStop(0, '#fff3b0'); g.addColorStop(.55, '#f2c040'); g.addColorStop(1, '#b07a1c');
  c.fillStyle = g; c.strokeStyle = '#24182e'; c.lineWidth = L(r*.05); c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); c.stroke();
  c.strokeStyle = '#a8761a'; c.lineWidth = L(r*.025); for(i = 0; i < 48; i++){ a = i/48*6.283; c.beginPath(); c.moveTo(Math.cos(a)*r*.9, Math.sin(a)*r*.9); c.lineTo(Math.cos(a)*r*.98, Math.sin(a)*r*.98); c.stroke(); }
  c.beginPath(); c.arc(0, 0, r*.84, 0, 6.283); c.stroke();
  c.fillStyle = '#c8901e'; for(i = 0; i < 12; i++){ a = i/12*6.283 - 1.57; etoile(c, Math.cos(a)*r*.7, Math.sin(a)*r*.7, r*.06); }
  /* la couronne */
  c.fillStyle = '#d9a428'; c.strokeStyle = '#8a5a10'; c.lineWidth = L(r*.03); c.beginPath();
  c.moveTo(-r*.32, r*.08); c.lineTo(-r*.36, -r*.22); c.lineTo(-r*.18, -r*.06); c.lineTo(0, -r*.3); c.lineTo(r*.18, -r*.06); c.lineTo(r*.36, -r*.22); c.lineTo(r*.32, r*.08); c.closePath(); c.fill(); c.stroke();
  c.fillRect(-r*.32, r*.08, r*.64, r*.08); c.strokeRect(-r*.32, r*.08, r*.64, r*.08);
  /* la fêlure du moule : un petit éclair en relief, juste sous la couronne */
  c.strokeStyle = '#7a4a08'; c.lineWidth = L(r*.025); c.beginPath(); c.moveTo(-r*.1, r*.24); c.lineTo(r*.02, r*.32); c.lineTo(-r*.04, r*.36); c.lineTo(r*.1, r*.46); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-r*.42, -r*.5, r*.18, r*.08, -.6, 0, 6.283); c.fill();
  if(o.farine){ var Rn = rng(9); c.fillStyle = 'rgba(250,248,240,.95)'; for(i = 0; i < 26; i++){ a = Rn()*6.283; var d = r*(.55 + Rn()*.35); rond(c, Math.cos(a)*d, Math.sin(a)*d, r*(.02 + Rn()*.03)); } }
  if(o.tache){ c.fillStyle = 'rgba(168,24,42,.9)'; c.beginPath(); c.ellipse(r*.62, r*.42, r*.2, r*.12, .7, 0, 6.283); c.fill(); c.fillStyle = 'rgba(220,60,70,.7)'; rond(c, r*.56, r*.38, r*.05); }
  c.restore();
}
function etoile(c, x, y, r){ c.beginPath(); for(var i = 0; i < 10; i++){ var a = i/10*6.283 - 1.57, rr = i % 2 ? r*.45 : r; c.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr); } c.closePath(); c.fill(); }
/* Un bout de pétale déchiré : rouge, veiné, avec un coin de la tache noire du bas (le coquelicot) */
function dessinerBoutPetale(c, x, y, r, coul){
  c.save(); c.translate(x, y); c.rotate(-.3); c.lineJoin = 'round';
  c.fillStyle = coul || '#e8202a'; c.strokeStyle = '#6a0a10'; c.lineWidth = Math.max(1, r*.06);
  c.beginPath(); c.moveTo(-r, r*.3); c.bezierCurveTo(-r*.9, -r*.6, r*.2, -r*1.05, r*.95, -r*.5); c.lineTo(r*.7, -r*.15); c.lineTo(r*.9, r*.1); c.lineTo(r*.5, r*.25); c.lineTo(r*.6, r*.55); c.lineTo(r*.1, r*.5); c.lineTo(-r*.2, r*.8); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a1010'; c.beginPath(); c.moveTo(-r, r*.3); c.quadraticCurveTo(-r*.7, r*.05, -r*.55, r*.55); c.lineTo(-r*.2, r*.8); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,10,20,.5)'; c.lineWidth = Math.max(.8, r*.03); for(var i = 0; i < 5; i++){ c.beginPath(); c.moveTo(-r*.7 + i*r*.05, r*.5); c.quadraticCurveTo(-r*.2 + i*r*.2, -r*.2, r*.1 + i*r*.18, -r*.7 + i*r*.1); c.stroke(); }
  c.restore();
}
/* L'objet de l'enquête, tel qu'on le voit sous la loupe */
function dessinerPreuve(c, w, h, s){
  var t = S.sel, o = OBJETS[t];
  /* (enquête 3) la lettre d'Odette : quelques mots de son écriture */
  if(o.forme === 'papier'){ dessinerEcriture(c, w, h, ECR_LETTRE, 77, s*.8); return; }
  if(t === 'fil'){ var reste = S.dos.fil ? S.dos.fil.items[10].filter(function(i){ return i.t === 'noir' && !i.pris; }).length : 0;
    dessinerFil(c, w, h, {base:ROUGE, plies:2, twist:16, thick:13, fuzz:.75, sheen:.08, crimp:4.5}, {scale:s, seed:3, suie:reste*3 + 2}); }
  /* la grande plume noire : la forme d'une plume du tiroir, mais noire, sauf tout en bas (et là où l'eau chaude l'a délavée) */
  else if(t === 'plume'){ var m = ECH.plumes[o.bon] || {}; dessinerPlume(c, w, h, {col:'#17171d', tige:'#d9d2c0', lustre:'#3a3a52', L:m.L, larg:m.larg, teinte:true, delave:!!(S.dos.plume && S.dos.plume.delave)}, 77, s*.8); }
  else if(o.forme === 'piece'){
    /* (la farine se voit tant qu'on ne l'a pas toute prise ; la tache rouge, tant que l'eau chaude ne l'a pas fait fondre) */
    var dp = S.dos[t], farine = t === 'piece_pain' && !!dp && [10, 40, 100].some(function(z){ return dp.items[z].some(function(i){ return i.t === 'farine_p' && !i.pris; }); });
    var tache = t === 'piece_moulin' && !(dp && dp.coupes.some(function(c2){ return c2 && c2.t === 'rouge_m'; }));
    dessinerPieceOr(c, w/2, h/2, 34*s, {farine:farine, tache:tache}); }
  else if(o.fragment && o.tiroir === 'petales') dessinerBoutPetale(c, w/2, h/2, 34*s, o.coul);
  else if(o.noir && o.tiroir === 'fils') dessinerFil(c, w, h, Object.assign({}, ECH.fils[o.bon].p, {base:o.coul}), {scale:s*.9, seed:77});   /* (le brin de laine noire de la poudre : la forme du tiroir, mais noire) */
  else if(o.fragment) dessinerBoutFeuille(c, w/2, h/2, 34*s, .5);
  else if(t === 'poudre'){ dessinerGrain(c, w, h, 'poudre', 77, s); var Rp = rng(5); c.fillStyle = '#c8202a'; for(var ip = 0; ip < 9; ip++) rond(c, w/2 + (Rp() - .5)*70*s, h/2 + (Rp() - .5)*50*s, (2.2 + Rp()*2)*s); }
  else if(o.tiroir === 'grains') dessinerGrain(c, w, h, o.bon, 77, s);
  else dessinerRef(c, w, h, o.tiroir, o.bon, 77, s*({plumes:.8, poils:.74, feuilles:.8, petales:.76}[o.tiroir] || .8));
}

/* La bandelette de papier buvard : la goutte part du trait de crayon, en bas ; l'alcool monte (p de 0 à 1) et sépare les couleurs en bandes */
function dessinerBandelette(c, x, y, w, h, liste, p, o){
  o = o || {}; var Rn = rng(o.seed || 3), y0 = y + h*.9, course = h*.8, i;
  c.save(); c.fillStyle = 'rgba(40,24,10,.25)'; c.fillRect(x + w*.07, y + h*.012, w, h);
  var g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#f3ecd9'); g.addColorStop(.5, '#fffaf0'); g.addColorStop(1, '#ece3cc'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  /* le papier mouillé, jusqu'où l'alcool est monté */
  if(p > 0){ c.fillStyle = 'rgba(150,130,90,.16)'; c.fillRect(x, y0 - course*p*1.08, w, h); }
  c.fillStyle = 'rgba(120,100,70,.12)'; for(i = 0; i < w*h/90; i++) c.fillRect(x + Rn()*w, y + Rn()*h, 1, 1 + Rn()*3);
  /* le trait de crayon et ce qu'il reste de la goutte */
  c.strokeStyle = 'rgba(70,70,80,.55)'; c.lineWidth = Math.max(1, w*.02); c.beginPath(); c.moveTo(x, y0); c.lineTo(x + w, y0); c.stroke();
  if(liste.length){ c.fillStyle = couleurDe(liste); c.globalAlpha = p > 0 ? Math.max(.12, .9 - p) : .9; c.beginPath(); c.ellipse(x + w/2, y0, w*.2, w*.13, 0, 0, 6.283); c.fill(); c.globalAlpha = 1; }
  /* les bandes */
  liste.forEach(function(k){ teinte(k).b.forEach(function(b){
    var yb = y0 - course*b.y*p, hb = Math.max(2, course*b.h*(.25 + .75*p)), a = (b.a || .92)*Math.min(1, p*3);
    var gb = c.createLinearGradient(0, yb - hb/2, 0, yb + hb/2); var rgb = hexRgb(b.c).join(',');
    gb.addColorStop(0, 'rgba(' + rgb + ',0)'); gb.addColorStop(.3, 'rgba(' + rgb + ',' + a + ')'); gb.addColorStop(.7, 'rgba(' + rgb + ',' + a + ')'); gb.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = gb; c.fillRect(x + w*.08, yb - hb/2, w*.84, hb); }); });
  c.restore(); c.strokeStyle = '#24182e'; c.lineWidth = Math.max(1.5, w*.035); c.strokeRect(x, y, w, h);
}
