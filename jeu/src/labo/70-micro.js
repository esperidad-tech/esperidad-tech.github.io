
/* ============ Le microscope ============
   Chaque dossier a sa vue : des fibres (le fil), des poils, une plume. Trois grossissements, trois images du même échantillon,
   de plus en plus près. Ce que la pince peut prélever est posé dessus (genItems). */
var MW = 1000, SC = {d:null, z:{}}, SDPR = 1;
/* Ce qu'il y a à prélever dans chaque dossier, à chaque grossissement.
   min : trop petit pour la pince avant ce grossissement (on le voit déjà, tout petit : « Trop petit : zoome ! ») ;
   ref / id : le même grain, vu à deux grossissements (pris en gros, il disparaît aussi en petit). */
function genItems(d){
  var dif = S.niveau === 'difficile';
  if(d === 'fil') return {
    10:[{t:'noir', x:180, y:420, r:13}, {t:'noir', x:470, y:600, r:12}, {t:'noir', x:820, y:400, r:14}, {t:'brun', x:300, y:620, r:12},
        {t:'orange', x:640, y:470, r:4, min:40, ref:'o1'}, {t:'noir', x:556, y:372, r:3.6, min:40, ref:'n4'}].concat(dif ? [{t:'brun', x:900, y:560, r:10}] : []),
    40:[{t:'orange', x:430, y:380, r:28, id:'o1'}, {t:'noir', x:690, y:640, r:30, id:'n4'}, {t:'or', x:560, y:300, r:5, min:100, ref:'or1'}],
    100:[{t:'or', x:300, y:180, r:26, id:'or1'}]
  };
  /* les poils : deux boules piquantes bien visibles ; le bout de feuille, coincé au fond, ne s'attrape qu'à ×40 */
  if(d === 'poils') return {
    10:[{t:'bardane', x:410, y:400, r:17}, {t:'bardane', x:720, y:660, r:15}, {t:'feuil', x:560, y:450, r:6, min:40, ref:'f1'}],
    40:[{t:'feuil', x:470, y:430, r:36, id:'f1'}],
    100:[]
  };
  /* la plume : deux points jaunes qu'on devine de loin ; il faut le plus fort grossissement pour les attraper */
  if(d === 'plume') return {
    10:[{t:'pollen', x:450, y:540, r:3, min:100, ref:'p1'}, {t:'pollen', x:650, y:380, r:3, min:100, ref:'p2'}],
    40:[{t:'pollen', x:430, y:570, r:7, min:100, ref:'p1'}, {t:'pollen', x:690, y:330, r:7, min:100, ref:'p2'}],
    100:[{t:'pollen', x:400, y:590, r:24, id:'p1'}, {t:'pollen', x:720, y:300, r:22, id:'p2'}]
  };
  return {10:[], 40:[], 100:[]};
}
function centre10(u){ return {x:40 + u*920, y:500 + 190*Math.sin(u*Math.PI*3) + 50*Math.sin(u*Math.PI*7)}; }
function surFil10(u, off){ var p = centre10(u), q = centre10(Math.min(1, u + .004)); var dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx,dy) || 1; return {x:p.x - dy/L*off, y:p.y + dx/L*off}; }
function fibre(c, pt, w, col, pas){
  var raw = []; for(var k=0;k<=160;k++){ var p = pt(k/160); raw.push([p.x, p.y]); } var pts = normales(raw);
  c.lineCap = 'round'; c.strokeStyle = col; c.lineWidth = w; chemin(c, pts, 0); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = w*.25; chemin(c, pts, w*.3);
  c.strokeStyle = 'rgba(70,10,18,.5)'; c.lineWidth = Math.max(1.4, w*.05); var acc = 0;
  for(var i=1;i<pts.length;i++){ acc += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); if(acc >= pas){ acc = 0; var q = pts[i], h = w*.47; c.beginPath(); c.moveTo(q.x + q.nx*h, q.y + q.ny*h); c.quadraticCurveTo(q.x + q.tx*w*.42, q.y + q.ty*w*.42, q.x - q.nx*h, q.y - q.ny*h); c.stroke(); } }
  c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = w*.13; chemin(c, pts, -w*.24);
}
/* Un poil vu de près : sa gaine, son canal du milieu (la moelle : chez un animal, il fait au moins la moitié de la largeur ; chez nous,
   un tiers au plus), et ses écailles, qui pointent vers le bout. */
function poil(c, pt, w, blanc, o){
  var raw = [], k, i; for(k = 0; k <= 160; k++){ var p = pt(k/160); raw.push([p.x, p.y]); } var pts = normales(raw), acc, q, h;
  c.lineCap = 'round';
  c.strokeStyle = blanc ? '#8f897b' : '#07070a'; c.lineWidth = w + Math.max(2, w*.07); chemin(c, pts, 0);
  c.strokeStyle = blanc ? '#f3efe4' : '#24242c'; c.lineWidth = w; chemin(c, pts, 0);
  c.strokeStyle = blanc ? 'rgba(120,110,90,.25)' : 'rgba(0,0,0,.4)'; c.lineWidth = w*.2; chemin(c, pts, w*.35);
  if(o.moelle){
    c.lineCap = 'butt'; c.strokeStyle = blanc ? 'rgba(104,92,72,.5)' : 'rgba(128,128,160,.3)'; c.lineWidth = w*.5; chemin(c, pts, 0);
    c.strokeStyle = blanc ? 'rgba(60,50,38,.6)' : 'rgba(190,190,225,.32)'; c.lineWidth = Math.max(1.2, w*.035); acc = 0;
    for(i = 1; i < pts.length; i++){ acc += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); if(acc >= w*.3){ acc = 0; q = pts[i]; h = w*.25; var sl = ((i % 2) ? 1 : -1)*w*.06;
      c.beginPath(); c.moveTo(q.x + q.nx*h + q.tx*sl, q.y + q.ny*h + q.ty*sl); c.lineTo(q.x - q.nx*h - q.tx*sl, q.y - q.ny*h - q.ty*sl); c.stroke(); } }
    c.lineCap = 'round';
  }
  if(o.ecailles){
    c.strokeStyle = blanc ? 'rgba(110,100,84,.6)' : 'rgba(175,175,210,.42)'; c.lineWidth = Math.max(1.2, w*.022); acc = 0;
    for(i = 1; i < pts.length; i++){ acc += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); if(acc >= o.ecailles){ acc = 0; q = pts[i];
      [1, -1].forEach(function(sd){ c.beginPath(); c.moveTo(q.x + sd*q.nx*w*.5, q.y + sd*q.ny*w*.5); c.quadraticCurveTo(q.x + sd*q.nx*w*.4 + q.tx*w*.2, q.y + sd*q.ny*w*.4 + q.ty*w*.2, q.x + sd*q.nx*w*.27, q.y + sd*q.ny*w*.27); c.stroke(); }); } }
  }
  c.strokeStyle = blanc ? 'rgba(255,255,255,.85)' : 'rgba(150,150,180,.35)'; c.lineWidth = w*.09; chemin(c, pts, -w*.33);
}
function scenePoils(c, z, Rn){
  var i;
  if(z === 10){          /* la touffe : des poils noirs, des poils blancs, emmêlés */
    c.lineCap = 'round';
    for(i = 0; i < 96; i++){ var blanc = Rn() < .42, y0 = 110 + Rn()*780, y1 = y0 + (Rn() - .5)*520, my = (y0 + y1)/2 + (Rn() - .5)*300, mx = 500 + (Rn() - .5)*200, lw = 3.4 + Rn()*2.6;
      c.beginPath(); c.moveTo(-40, y0); c.quadraticCurveTo(mx, my, 1040, y1);
      if(blanc){ c.strokeStyle = '#9a9486'; c.lineWidth = lw + 1.8; c.stroke(); c.strokeStyle = '#f4f1e8'; c.lineWidth = lw; c.stroke(); }
      else { c.strokeStyle = '#1c1c22'; c.lineWidth = lw; c.stroke(); } }
  } else if(z === 40){   /* une dizaine de poils : on voit le canal du milieu */
    for(i = 0; i < 9; i++){ (function(y0, a1, a2, w, blanc){ poil(c, function(u){ return {x:-60 + u*1120, y:y0 + a1*Math.sin(u*Math.PI) + a2*Math.sin(u*Math.PI*2)}; }, w, blanc, {moelle:true}); })(80 + i*104 + (Rn() - .5)*40, (Rn() - .5)*200, (Rn() - .5)*80, 30 + Rn()*16, i % 3 === 1 || i === 6); }
  } else {               /* trois poils énormes : les écailles, le canal large */
    poil(c, function(u){ return {x:-80 + u*1160, y:300 + 110*Math.sin(u*Math.PI)}; }, 170, true, {moelle:true, ecailles:54});
    poil(c, function(u){ return {x:-80 + u*1160, y:740 - 80*Math.sin(u*Math.PI*1.2)}; }, 150, false, {moelle:true, ecailles:50});
    poil(c, function(u){ return {x:220 + u*460, y:-80 + u*1160}; }, 120, true, {moelle:true, ecailles:44});
  }
}
/* La plume : la tige et ses barbes (×10), les barbes et leurs barbules (×40), les barbules et leurs petits crochets (×100) */
function scenePlume(c, z, Rn){
  var NOIR = '#1c1c24', i, k, ux, uy, nx, ny, L;
  c.lineCap = 'round';
  if(z === 10){
    var x0 = -60, y0 = 800, x1 = 1060, y1 = 250; L = Math.hypot(x1 - x0, y1 - y0); ux = (x1 - x0)/L; uy = (y1 - y0)/L; nx = -uy; ny = ux;
    for(i = 0; i < L; i += 9){ var bx = x0 + ux*i, by = y0 + uy*i, trou = (i > 380 && i < 410) || (i > 760 && i < 780);
      [1, -1].forEach(function(sd){ if(trou && sd > 0) return; var len = 470 + Rn()*60, a = .95, dx = ux*Math.cos(a) + sd*nx*Math.sin(a), dy = uy*Math.cos(a) + sd*ny*Math.sin(a);
        c.strokeStyle = NOIR; c.lineWidth = 5.2; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + dx*len*.5 + ux*30, by + dy*len*.5 + uy*30, bx + dx*len + ux*70, by + dy*len + uy*70); c.stroke(); }); }
    c.strokeStyle = '#0c0c10'; c.lineWidth = 30; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = '#4c4a56'; c.lineWidth = 22; c.stroke(); c.strokeStyle = 'rgba(214,208,190,.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 - nx*5, y0 - ny*5); c.lineTo(x1 - nx*5, y1 - ny*5); c.stroke();
  } else if(z === 40){
    ux = Math.cos(-.5); uy = Math.sin(-.5); nx = -uy; ny = ux;
    for(k = -1; k < 7; k++){ var ox = -100 + nx*(k*172 - 150), oy = 560 + ny*(k*172 - 150);
      for(i = 0; i < 1500; i += 13){ var px = ox + ux*i, py = oy + uy*i;
        [1, -1].forEach(function(sd){ var a = .7, dx = ux*Math.cos(a) + sd*nx*Math.sin(a), dy = uy*Math.cos(a) + sd*ny*Math.sin(a), len = 104 + Rn()*14;
          c.strokeStyle = sd > 0 ? '#2a2a36' : NOIR; c.lineWidth = 3.4; c.beginPath(); c.moveTo(px, py); c.lineTo(px + dx*len, py + dy*len); c.stroke(); }); }
      c.strokeStyle = '#0c0c10'; c.lineWidth = 20; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + ux*1500, oy + uy*1500); c.stroke();
      c.strokeStyle = '#3a3846'; c.lineWidth = 13; c.stroke(); c.strokeStyle = 'rgba(200,196,214,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(ox - nx*4, oy - ny*4); c.lineTo(ox + ux*1500 - nx*4, oy + uy*1500 - ny*4); c.stroke(); }
  } else {
    ux = Math.cos(-.32); uy = Math.sin(-.32); nx = -uy; ny = ux;
    var barbes = [[-80, 300], [-80, 980]];
    /* les barbules du bas : lisses, avec un petit rebord ; celles du haut : des crochets au bout, qui viennent s'y agripper */
    for(i = 0; i < 1300; i += 46){ var qx = barbes[1][0] + ux*i, qy = barbes[1][1] + uy*i, a2 = 1.02, dx2 = ux*Math.cos(a2) - nx*Math.sin(a2), dy2 = uy*Math.cos(a2) - ny*Math.sin(a2);
      c.strokeStyle = '#30303e'; c.lineWidth = 9; c.beginPath(); c.moveTo(qx, qy); c.quadraticCurveTo(qx + dx2*200 + ux*20, qy + dy2*200 + uy*20, qx + dx2*400 + ux*60, qy + dy2*400 + uy*60); c.stroke();
      c.strokeStyle = 'rgba(190,186,206,.35)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(qx - 3, qy - 3); c.quadraticCurveTo(qx + dx2*200 + ux*20 - 3, qy + dy2*200 + uy*20 - 3, qx + dx2*400 + ux*60 - 3, qy + dy2*400 + uy*60 - 3); c.stroke(); }
    for(i = 0; i < 1300; i += 46){ var rx = barbes[0][0] + ux*i, ry = barbes[0][1] + uy*i, a3 = .98, dx3 = ux*Math.cos(a3) + nx*Math.sin(a3), dy3 = uy*Math.cos(a3) + ny*Math.sin(a3);
      c.strokeStyle = NOIR; c.lineWidth = 8; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + dx3*390, ry + dy3*390); c.stroke();
      c.lineWidth = 4.2; for(k = 0; k < 4; k++){ var hx = rx + dx3*(250 + k*44), hy = ry + dy3*(250 + k*44); c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + ux*26 + nx*4, hy + uy*26 + ny*4, hx + ux*20 + nx*22, hy + uy*20 + ny*22); c.quadraticCurveTo(hx + ux*8 + nx*30, hy + uy*8 + ny*30, hx + ux*2 + nx*20, hy + uy*2 + ny*20); c.stroke(); } }
    barbes.forEach(function(b){ c.strokeStyle = '#0c0c10'; c.lineWidth = 54; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] + ux*1300, b[1] + uy*1300); c.stroke();
      c.strokeStyle = '#3a3846'; c.lineWidth = 40; c.stroke(); c.strokeStyle = 'rgba(200,196,214,.3)'; c.lineWidth = 7; c.beginPath(); c.moveTo(b[0] - nx*11, b[1] - ny*11); c.lineTo(b[0] + ux*1300 - nx*11, b[1] + uy*1300 - ny*11); c.stroke(); });
  }
}
function fabriquerScene(scene, z){
  var cv = document.createElement('canvas'); cv.width = MW*SDPR; cv.height = MW*SDPR; var c = cv.getContext('2d'); c.scale(SDPR, SDPR); var Rn = rng(z*97 + (scene === 'fibres' ? 0 : scene.length*131));
  var g = c.createRadialGradient(500,500,40,500,500,720); g.addColorStop(0,'#fdf8ea'); g.addColorStop(1,'#e2d6bb'); c.fillStyle = g; c.fillRect(0,0,MW,MW);
  if(scene === 'poils') scenePoils(c, z, Rn);
  else if(scene === 'plume') scenePlume(c, z, Rn);
  else {
    var cols = ['#a3202a','#b8282f','#c4343a','#8f1b25','#cf4a4a'];
    if(z === 10){
      for(var i=0;i<80;i++){ var o = (Rn()-.5)*160, ph = Rn()*6.28, amp = 8 + Rn()*26; c.strokeStyle = cols[Math.floor(Rn()*5)]; c.lineWidth = 1.5 + Rn()*2.5; c.globalAlpha = .85; c.beginPath();
        for(var k=0;k<=220;k++){ var u = k/220, p = surFil10(u, o + amp*Math.sin(u*42 + ph)); if(k) c.lineTo(p.x,p.y); else c.moveTo(p.x,p.y); } c.stroke(); }
      c.globalAlpha = .55; c.lineWidth = 1.2; c.strokeStyle = '#c74a4a';
      for(var j=0;j<110;j++){ var b = surFil10(Rn(), (Rn() < .5 ? -1 : 1)*78), a = Rn()*6.28, len = 25 + Rn()*60; c.beginPath(); c.moveTo(b.x, b.y); c.quadraticCurveTo(b.x + Math.cos(a)*len*.5, b.y + Math.sin(a)*len*.5, b.x + Math.cos(a)*len, b.y + Math.sin(a)*len); c.stroke(); }
      c.globalAlpha = 1;
    } else if(z === 40){
      for(var f=0; f<9; f++){ (function(y0, a1, a2, w, col){ fibre(c, function(u){ return {x:-60 + u*1120, y:y0 + a1*Math.sin(u*Math.PI) + a2*Math.sin(u*Math.PI*2)}; }, w, col, 15); })(70 + f*105 + (Rn()-.5)*40, (Rn()-.5)*220, (Rn()-.5)*90, 22 + Rn()*14, cols[f%4]); }
    } else {
      fibre(c, function(u){ return {x:-80 + u*1160, y:330 + 120*Math.sin(u*Math.PI)}; }, 150, '#b8282f', 46);
      fibre(c, function(u){ return {x:-80 + u*1160, y:720 - 90*Math.sin(u*Math.PI*1.3)}; }, 120, '#a3202a', 40);
      fibre(c, function(u){ return {x:200 + u*500, y:-80 + u*1160}; }, 110, '#c4343a', 40);
    }
  }
  return cv;
}
/* Les trois images du dossier en cours (on n'en garde qu'un à la fois : ce sont de grandes images) */
function scenesDe(d){
  if(SC.d !== d){ SDPR = Math.min(window.devicePixelRatio || 1, 1.5); SC = {d:d, z:{}}; [10, 40, 100].forEach(function(z){ SC.z[z] = fabriquerScene(OBJETS[d].scene || 'fibres', z); }); }
  return SC.z;
}
function dessinerItem(c, it, x, y, t){
  var Rn = rng(Math.round(it.x*7 + it.y)), i, a;
  if(it.t === 'noir'){ blob(c, x, y, it.r, Rn, '#15100e'); c.fillStyle = 'rgba(255,255,255,.18)'; rond(c, x - it.r*.3, y - it.r*.3, it.r*.25); }
  else if(it.t === 'brun'){ blob(c, x, y, it.r, Rn, '#7a5230'); c.fillStyle = '#b08a5a'; for(i=0;i<5;i++) rond(c, x + (Rn()-.5)*it.r, y + (Rn()-.5)*it.r, 1.6); }
  else if(it.t === 'orange'){ c.fillStyle = '#d9772f'; c.beginPath(); c.moveTo(x - it.r, y - it.r*.3); c.lineTo(x + it.r*.4, y - it.r*.8); c.lineTo(x + it.r, y + it.r*.2); c.lineTo(x, y + it.r*.8); c.closePath(); c.fill();
    if(it.r > 10){ c.fillStyle = '#8a3f12'; for(var k=0;k<8;k++) rond(c, x + (Rn()-.5)*it.r*1.2, y + (Rn()-.5)*it.r*.8, 2); } }
  else if(it.t === 'or'){ var gr = c.createLinearGradient(x - it.r, y - it.r, x + it.r, y + it.r); gr.addColorStop(0,'#fff3b0'); gr.addColorStop(.5,'#f2c040'); gr.addColorStop(1,'#b07a1c'); blob(c, x, y, it.r, Rn, gr, 12);
    var sc = (Math.sin(t/260) + 1)/2; c.fillStyle = 'rgba(255,255,255,' + (.4 + .6*sc) + ')'; c.font = (14 + 8*sc) + 'px sans-serif'; c.textAlign = 'center'; c.fillText('✦', x + it.r*.6, y - it.r*.5); }
  else if(it.t === 'feuil'){ dessinerBoutFeuille(c, x, y, it.r, .5); }
  else if(it.t === 'bardane'){ dessinerBardane(c, x, y, it.r, Rn); }
  else if(it.t === 'pollen'){ dessinerPollen(c, x, y, it.r, 'lav'); }
}
/* Un bout de feuille déchiré : un bord en vagues (les lobes), un bord déchiré, des nervures */
function dessinerBoutFeuille(c, x, y, r, rot){
  c.save(); c.translate(x, y); c.rotate(rot || 0); c.lineJoin = 'round';
  c.fillStyle = '#5e8a3a'; c.strokeStyle = '#2a4a22'; c.lineWidth = Math.max(1, r*.07);
  c.beginPath(); c.moveTo(-r, r*.5);
  c.bezierCurveTo(-r*1.08, -r*.1, -r*.72, -r*.78, -r*.42, -r*.5); c.bezierCurveTo(-r*.3, -r*1.02, r*.15, -r*1.02, r*.2, -r*.55); c.bezierCurveTo(r*.45, -r*.97, r*.97, -r*.72, r*.86, -r*.15);
  c.lineTo(r*.55, r*.05); c.lineTo(r*.62, r*.4); c.lineTo(r*.22, r*.3); c.lineTo(r*.1, r*.7); c.lineTo(-r*.3, r*.45); c.lineTo(-r*.55, r*.82); c.closePath(); c.fill(); c.stroke();
  if(r > 12){ c.strokeStyle = 'rgba(214,230,170,.85)'; c.lineWidth = r*.05; c.lineCap = 'round'; c.beginPath(); c.moveTo(-r*.62, r*.6); c.lineTo(r*.62, -r*.5); c.moveTo(-r*.1, r*.12); c.lineTo(-r*.45, -r*.42); c.moveTo(r*.15, -r*.1); c.lineTo(0, -r*.72); c.moveTo(r*.3, -r*.22); c.lineTo(r*.62, -r*.08); c.stroke();
    c.fillStyle = 'rgba(120,80,30,.35)'; rond(c, r*.2, r*.3, r*.08); rond(c, -r*.35, r*.25, r*.06); }
  c.restore();
}
/* La boule de la bardane : brune, hérissée de piquants qui finissent en crochet */
function dessinerBardane(c, x, y, r, Rn){
  var n = 18, i, a; c.strokeStyle = '#5a4222'; c.lineWidth = Math.max(1, r*.1); c.lineCap = 'round';
  for(i = 0; i < n; i++){ a = i/n*6.283 + .2; var x1 = x + Math.cos(a)*r*1.5, y1 = y + Math.sin(a)*r*1.5;
    c.beginPath(); c.moveTo(x + Math.cos(a)*r*.7, y + Math.sin(a)*r*.7); c.lineTo(x1, y1); c.arc(x1 + Math.cos(a + 1.57)*r*.17, y1 + Math.sin(a + 1.57)*r*.17, r*.17, a - 1.57, a + 1.3); c.stroke(); }
  blob(c, x, y, r, Rn, '#8a6a3c', 11); c.fillStyle = '#b8935a'; rond(c, x - r*.25, y - r*.3, r*.26); c.fillStyle = '#5a4222'; for(i = 0; i < 6; i++) rond(c, x + (Rn() - .5)*r, y + (Rn() - .5)*r, r*.06);
}
/* Trois pollens, trois formes : la lavande (une boule à six sillons), le pin (un grain et ses deux ballons d'air), le pissenlit (une boule de piquants) */
function dessinerPollen(c, x, y, r, sorte){
  var i, a;
  if(sorte === 'pin'){ c.fillStyle = '#efe6b0'; c.strokeStyle = '#a89a50'; c.lineWidth = Math.max(.8, r*.07);
    [-1, 1].forEach(function(sd){ c.beginPath(); c.ellipse(x + sd*r*.78, y + r*.32, r*.62, r*.56, 0, 0, 6.283); c.fill(); if(r > 8) c.stroke(); });
    c.fillStyle = '#e0c860'; c.beginPath(); c.ellipse(x, y - r*.12, r*.82, r*.66, 0, 0, 6.283); c.fill(); if(r > 8) c.stroke(); return; }
  if(sorte === 'pis'){ c.strokeStyle = '#b88a1a'; c.lineWidth = Math.max(.8, r*.09); c.lineCap = 'round';
    for(i = 0; i < 16; i++){ a = i/16*6.283; c.beginPath(); c.moveTo(x + Math.cos(a)*r*.7, y + Math.sin(a)*r*.7); c.lineTo(x + Math.cos(a)*r*1.18, y + Math.sin(a)*r*1.18); c.stroke(); }
    c.fillStyle = '#f0c030'; rond(c, x, y, r*.88); c.fillStyle = '#d8a018'; for(i = 0; i < 7; i++){ a = i/7*6.283 + .4; rond(c, x + Math.cos(a)*r*.45, y + Math.sin(a)*r*.45, r*.12); } return; }
  c.fillStyle = '#e8c84a'; rond(c, x, y, r);
  if(r > 9){ c.strokeStyle = '#a8862a'; c.lineWidth = r*.07; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke();
    for(i = 0; i < 3; i++){ a = i/3*3.1416 + .3; c.beginPath(); c.ellipse(x, y, r*.96, r*.34, a, 0, 6.283); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.6)'; rond(c, x - r*.35, y - r*.4, r*.2); }
}
function dessinerMite(c, x, y, t){
  c.save(); c.translate(x, y); c.strokeStyle = '#6b4f3a'; c.lineWidth = 2.5; c.lineCap = 'round';
  for(var i=0;i<4;i++){ var w = i === 0 ? Math.sin(t/180)*.5 : 0; c.beginPath(); c.moveTo(-8, -4 + i*4); c.lineTo(-26 - i*2, -16 + i*10 + w*20); c.stroke(); c.beginPath(); c.moveTo(8, -4 + i*4); c.lineTo(26 + i*2, -16 + i*10); c.stroke(); }
  c.fillStyle = '#efd9bf'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 4, 15, 19, 0, 0, 6.283); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, -16, 8, 7, 0, 0, 6.283); c.fill(); c.stroke();
  c.fillStyle = '#24182e'; c.beginPath(); c.arc(-3, -17, 1.8, 0, 6.283); c.arc(3, -17, 1.8, 0, 6.283); c.fill(); c.restore();
}
/* La puce : un petit corps aplati brun-roux, et de grandes pattes de derrière repliées, prêtes à sauter */
function dessinerPuce(c, x, y, t){
  c.save(); c.translate(x, y - Math.abs(Math.sin(t/320))*4); c.strokeStyle = '#3a2010'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-6, 10); c.lineTo(-14, 24); c.moveTo(4, 11); c.lineTo(2, 25); c.moveTo(13, 8); c.lineTo(28, -8); c.lineTo(32, 24); c.stroke();
  c.fillStyle = '#8a4a26'; c.beginPath(); c.ellipse(0, 0, 23, 14, -.15, 0, 6.283); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(60,30,14,.7)'; c.lineWidth = 1.6; for(var i = -1; i <= 2; i++){ c.beginPath(); c.moveTo(i*7, -12); c.quadraticCurveTo(i*7 + 3, 0, i*7, 12); c.stroke(); }
  c.fillStyle = '#6a3618'; c.strokeStyle = '#3a2010'; c.lineWidth = 2; c.beginPath(); c.ellipse(-23, 2, 8, 7, 0, 0, 6.283); c.fill(); c.stroke(); c.fillStyle = '#120a0a'; rond(c, -26, 0, 1.8);
  c.restore();
}
/* L'oculaire : ce que l'œil voit dans le microscope, en très grand pour les doigts */
function svgOculaire(){
  var s = '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="oOr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#f5b945"/><stop offset="1" stop-color="#b07a1c"/></linearGradient></defs>' +
    '<circle cx="50" cy="50" r="47.4" fill="none" stroke="#24182e" stroke-width="5.2"/><circle cx="50" cy="50" r="47.4" fill="none" stroke="url(#oOr)" stroke-width="3.8"/>';
  for(var i=0;i<90;i++){ var a = i/90*Math.PI*2; s += '<line x1="' + f1(50 + Math.cos(a)*46.2) + '" y1="' + f1(50 + Math.sin(a)*46.2) + '" x2="' + f1(50 + Math.cos(a)*48.8) + '" y2="' + f1(50 + Math.sin(a)*48.8) + '" stroke="#8a5a12" stroke-width=".35"/>'; }
  return s + '<circle cx="50" cy="50" r="45" fill="none" stroke="#120c1c" stroke-width="1"/><path d="M22,32 C27,22 38,14.5 50,13" fill="none" stroke="#fff" stroke-width="1.6" opacity=".3" stroke-linecap="round"/></svg>';
}
function svgPince(grain){
  return '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M6,74 L66,8" fill="none" stroke="' + K + '" stroke-width="8" stroke-linecap="round"/><path d="M6,74 L66,8" fill="none" stroke="#c9c4de" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M6,74 L74,18" fill="none" stroke="' + K + '" stroke-width="8" stroke-linecap="round"/><path d="M6,74 L74,18" fill="none" stroke="#e6e2f4" stroke-width="4" stroke-linecap="round"/>' +
    '<rect x="60" y="2" width="18" height="18" rx="5" fill="#5f5872" stroke="' + K + '" stroke-width="3" transform="rotate(42 69 11)"/>' + (grain || '') + '</svg>';
}
function majMolette(){
  var m = $('#molette'); if(!m || !S) return; m.style.transform = 'rotate(' + ({10:0, 40:-120, 100:-240})[S.zoom] + 'deg)';
  $$('.obj').forEach(function(o){ o.classList.toggle('actif', +o.dataset.obj === S.zoom); }); $$('.num').forEach(function(n){ n.classList.toggle('actif', +n.dataset.zoom === S.zoom); });
  var z = $('#zoomTxt'); if(z) z.textContent = '×' + S.zoom;
}
/* Le cône de lumière : il part de la lentille du haut du microscope (l'oculaire, là où on met l'œil) et s'ouvre jusqu'au grand rond
   (Romain, 10 novembre, 17 h 18 ; avant, il partait de la lame). On comprend d'un coup d'œil que le grand rond, c'est ce qu'on voit
   en regardant dans le microscope. (L'oculaire : la lentille bleue en haut du tube, lui-même penché de 16°.) */
var CAM_MICRO = {x:819, y:276, z:1.62};          /* le gros plan du microscope : un peu plus haut qu'avant, pour bien voir l'oculaire */
function svgCone(camX, camY, z){
  var ax = 600 + (MICRO.x + 13.4*MICRO.e - camX)*z, ay = 320 + (MICRO.y - 186.9*MICRO.e - camY)*z, cx = 306, cy = 320, R0 = 290;
  var d = Math.hypot(ax - cx, ay - cy), phi = Math.atan2(ay - cy, ax - cx), al = Math.acos(Math.min(1, R0/d));
  var t1 = [cx + R0*Math.cos(phi + al), cy + R0*Math.sin(phi + al)], t2 = [cx + R0*Math.cos(phi - al), cy + R0*Math.sin(phi - al)];
  return '<svg class="cone-hud pose" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true" style="' + pos(0, 0, 1200, 640) + '"><defs>' +
    '<linearGradient id="gCone" gradientUnits="userSpaceOnUse" x1="' + f1(ax) + '" y1="' + f1(ay) + '" x2="' + f1(cx + R0*.55*Math.cos(phi)) + '" y2="' + f1(cy + R0*.55*Math.sin(phi)) + '"><stop offset="0" stop-color="#fffbe0" stop-opacity=".95"/><stop offset=".3" stop-color="#ffe9a3" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a3" stop-opacity=".22"/></linearGradient>' +
    '<radialGradient id="gConeP"><stop offset="0" stop-color="#fffbe0" stop-opacity="1"/><stop offset="1" stop-color="#ffe9a3" stop-opacity="0"/></radialGradient></defs>' +
    '<path class="cone" d="M' + f1(ax) + ',' + f1(ay) + ' L' + f1(t1[0]) + ',' + f1(t1[1]) + ' L' + f1(t2[0]) + ',' + f1(t2[1]) + ' Z" fill="url(#gCone)"/>' +
    '<path d="M' + f1(ax) + ',' + f1(ay) + ' L' + f1(t1[0]) + ',' + f1(t1[1]) + ' M' + f1(ax) + ',' + f1(ay) + ' L' + f1(t2[0]) + ',' + f1(t2[1]) + '" stroke="#fff7d0" stroke-width="2.5" stroke-opacity=".8" fill="none"/>' +
    '<circle class="cone-point" cx="' + f1(ax) + '" cy="' + f1(ay) + '" r="30" fill="url(#gConeP)"/></svg>';
}
function ouvrirMicro(){
  if(S.occupe) return; S.dc = dossierDe(S.sel) || S.dc; S.zoom = 10; S.cx = 500; S.cy = 500; scenesDe(S.dc);
  ouvrirMode('micro', svgCone(CAM_MICRO.x, CAM_MICRO.y, CAM_MICRO.z) + '<div class="oculaire-hud" id="ocuHud" style="' + pos(8, 22, 596, 596) + '"><canvas id="lentille" aria-label="L\'échantillon au microscope"></canvas>' + svgOculaire() + '</div>' +
    '<button type="button" class="zoom-plaque pose" id="zoomTxt" data-act="molette" style="' + pos(14, 8, 124, 58) + '" aria-label="Changer de grossissement">×10</button><div class="pince-c" id="pinceC" hidden>' + svgPince() + '</div>');
  camera(CAM_MICRO.x, CAM_MICRO.y, CAM_MICRO.z); majMolette(); brancherLentille(); requestAnimationFrame(rendLentille); lancerBoucle();
}
function lancerBoucle(){ cancelAnimationFrame(boucle); if(S.mode === 'micro' && !reduit){ var f = function(){ rendLentille(); boucle = requestAnimationFrame(f); }; boucle = requestAnimationFrame(f); } }
/* Sur un grand écran, l'image du microscope grossit avec l'oculaire (sur un téléphone ou une tablette : un point = un point) */
function echL(T0){ return Math.max(1, T0/560); }
function beteIci(){ return S.zoom === 100 ? (OBJETS[S.dc].bete || null) : null; }
function rendLentille(){
  var cv = $('#lentille'); if(!cv) return; var r = prep(cv), c = r.ctx, T0 = r.w, k = echL(T0), vis = T0/k, half = vis/2, now = performance.now(), d = D(), bete = beteIci();
  S.cx = Math.min(Math.max(S.cx, half), MW - half); S.cy = Math.min(Math.max(S.cy, half), MW - half); var sx = S.cx - half, sy = S.cy - half;
  c.clearRect(0,0,T0,T0); c.save(); c.beginPath(); c.arc(T0/2, T0/2, T0/2, 0, 6.283); c.clip();
  c.save(); c.scale(k, k);
  c.drawImage(scenesDe(S.dc)[S.zoom], sx*SDPR, sy*SDPR, vis*SDPR, vis*SDPR, 0, 0, vis, vis);
  d.items[S.zoom].forEach(function(it){ if(!it.pris) dessinerItem(c, it, it.x - sx, it.y - sy, now); });
  if(bete === 'acarien') dessinerMite(c, d.mite.x - sx, d.mite.y - sy, now); else if(bete === 'puce') dessinerPuce(c, d.mite.x - sx, d.mite.y - sy, now);
  c.restore();
  var vg = c.createRadialGradient(T0/2, T0/2, T0*.35, T0/2, T0/2, T0/2); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(20,12,30,.55)'); c.fillStyle = vg; c.fillRect(0,0,T0,T0); c.restore();
}
function brancherLentille(){
  var cv = $('#lentille'), pc = $('#pinceC'), boite = $('#hudBoite'), gl = null;
  var suivre = function(e){ var v = boite.getBoundingClientRect(); pc.hidden = false; pc.style.left = (e.clientX - v.left) + 'px'; pc.style.top = (e.clientY - v.top) + 'px'; };
  cv.addEventListener('pointerdown', function(e){ cv.setPointerCapture(e.pointerId); gl = {x:e.clientX, y:e.clientY, cx:S.cx, cy:S.cy, bouge:false}; suivre(e); });
  cv.addEventListener('pointermove', function(e){ suivre(e); if(!gl) return; var dx = e.clientX - gl.x, dy = e.clientY - gl.y; if(Math.hypot(dx,dy) > 9) gl.bouge = true; if(gl.bouge){ var k = echL(cv.getBoundingClientRect().width); S.cx = gl.cx - dx/k; S.cy = gl.cy - dy/k; rendLentille(); } });
  cv.addEventListener('pointerup', function(e){ if(gl && !gl.bouge){ var r = cv.getBoundingClientRect(); toucherLentille(e.clientX - r.left, e.clientY - r.top, r.width, e.clientX, e.clientY); } gl = null; if(e.pointerType !== 'mouse') setTimeout(function(){ pc.hidden = true; }, 500); });
  cv.addEventListener('pointerleave', function(){ if(!gl) pc.hidden = true; });
  cv.addEventListener('pointercancel', function(){ gl = null; pc.hidden = true; });
}
function bulleLentille(gx, gy, t){
  var v = $('#hudBoite'), r = v.getBoundingClientRect(), b = v.querySelector('.bulle-l'); if(b) b.remove(); b = document.createElement('div'); b.className = 'bulle-l'; b.textContent = t;
  b.style.left = (gx - r.left) + 'px'; b.style.top = (gy - r.top) + 'px'; v.appendChild(b); avecSon(b, t); setTimeout(function(){ if(!b.dataset.garde) b.remove(); }, 1900);
}
function toucherLentille(lx, ly, T0, gx, gy){
  var half = T0/2, k = echL(T0), d = D(), bete = beteIci(); if(Math.hypot(lx - half, ly - half) > half) return;
  var wx0 = S.cx + (lx - half)/k, wy0 = S.cy + (ly - half)/k, marge = Math.max(16, T0*.045)/k;
  if(bete && Math.hypot(d.mite.x - wx0, d.mite.y - wy0) < 46){ d.mite = {x:150 + Math.random()*700, y:150 + Math.random()*700}; son('acarien'); bulleLentille(gx, gy, TXT.betes[bete]); return; }
  var it = d.items[S.zoom].filter(function(i){ return !i.pris && Math.hypot(i.x - wx0, i.y - wy0) < i.r + marge; })[0];
  if(!it) return;
  if(it.min && it.min > S.zoom){ son('tropPetit'); bulleLentille(gx, gy, TXT.trop); var pc = $('#pinceC'); pc.classList.remove('non'); void pc.offsetWidth; pc.classList.add('non'); secouer($('#moletteG')); return; }
  it.pris = true; if(it.id) [10, 40].forEach(function(z){ d.items[z].forEach(function(i){ if(i.ref === it.id) i.pris = true; }); });
  var idx = ajouterCoupe(it.t); son('prise'); rendLentille(); bulleLentille(gx, gy, TXT.pris); envoler(it.t, gx, gy, idx); garder();
}
function ajouterCoupe(t){ var cp = D().coupes, i = cp.findIndex(function(c){ return c && c.t === t; }); if(i >= 0){ cp[i].n++; return i; } for(i = 0; i < COUPES.length - 1 && cp[i]; i++){} cp[i] = {t:t, n:1}; return i; }
/* La pince attrape le grain et le porte jusqu'à sa coupelle, qui est restée à sa place sur la paillasse */
function envoler(t, gx, gy, idx){
  var cible = $('#coupe' + idx), fin = function(){ son('coupelle'); dessinerCoupes(); dessinerLame(); };
  if(!cible || reduit){ fin(); return; }
  var pc = $('#pinceC'); if(pc) pc.hidden = true;
  var v = document.createElement('div'); v.className = 'vol pince-vol'; v.innerHTML = svgPince('<g transform="translate(6,74)">' + contenuCoupe(t, 0, 0, 1, 26) + '</g>'); document.body.appendChild(v);
  v.style.left = gx + 'px'; v.style.top = gy + 'px'; void v.offsetWidth;
  var r = cible.getBoundingClientRect(); v.style.left = (r.left + r.width/2) + 'px'; v.style.top = (r.top + r.height*.45) + 'px';
  setTimeout(function(){ v.remove(); fin(); }, 760);
}
function changerZoom(z){
  if(z === S.zoom || S.mode !== 'micro') return; var rx = S.cx/MW, ry = S.cy/MW; S.zoom = z; S.cx = rx*MW; S.cy = ry*MW; son('molette'); majMolette();
  var cv = $('#lentille'); if(cv && !reduit){ cv.classList.add('flou'); setTimeout(function(){ cv.classList.remove('flou'); }, 240); }
  rendLentille(); lancerBoucle();
  /* ce que ce grossissement apprend : dit une fois, sur un petit papier à côté du microscope */
  var sv = (SAVOIR_MICRO[OBJETS[S.dc].scene] || {})[z], cle = 'm:' + S.dc + ':' + z;
  if(sv && !S.dits[cle]){ S.dits[cle] = 1; attendre(500, function(){ if(S.mode === 'micro' && S.zoom === z) noteSavoir(sv, 'micro'); }); garder(); }
}
