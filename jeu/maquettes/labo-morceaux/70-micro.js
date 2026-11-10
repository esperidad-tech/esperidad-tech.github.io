
/* ============ Le microscope ============ */
var MW = 1000, scenes = {}, SDPR = 1;
var PC_X = [146, 239, 332, 425, 518], PC_Y = 584;
function genItems(){
  var d = S.niveau === 'difficile';
  /* À ×10 on voit aussi, tout petits, les grains qu'on ne peut attraper qu'à ×40 (min:40) : « trop petit pour la pince » */
  S.items = {
    10:[{t:'noir', x:180, y:420, r:13}, {t:'noir', x:470, y:600, r:12}, {t:'noir', x:820, y:400, r:14}, {t:'brun', x:300, y:620, r:12},
        {t:'orange', x:640, y:470, r:4, min:40, ref:'o1'}, {t:'noir', x:556, y:372, r:3.6, min:40, ref:'n4'}].concat(d ? [{t:'brun', x:900, y:560, r:10}] : []),
    40:[{t:'orange', x:430, y:380, r:28, id:'o1'}, {t:'noir', x:690, y:640, r:30, id:'n4'}],
    100:[{t:'or', x:300, y:180, r:26}]
  };
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
function genScenes(){
  SDPR = Math.min(window.devicePixelRatio || 1, 2); scenes = {};
  [10,40,100].forEach(function(z){
    var cv = document.createElement('canvas'); cv.width = MW*SDPR; cv.height = MW*SDPR; var c = cv.getContext('2d'); c.scale(SDPR, SDPR); var Rn = rng(z*97);
    var g = c.createRadialGradient(500,500,40,500,500,720); g.addColorStop(0,'#fdf8ea'); g.addColorStop(1,'#e2d6bb'); c.fillStyle = g; c.fillRect(0,0,MW,MW);
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
    scenes[z] = cv;
  });
}
function dessinerItem(c, it, x, y, t){
  var Rn = rng(Math.round(it.x*7 + it.y));
  if(it.t === 'noir'){ blob(c, x, y, it.r, Rn, '#15100e'); c.fillStyle = 'rgba(255,255,255,.18)'; rond(c, x - it.r*.3, y - it.r*.3, it.r*.25); }
  else if(it.t === 'brun'){ blob(c, x, y, it.r, Rn, '#7a5230'); c.fillStyle = '#b08a5a'; for(var i=0;i<5;i++) rond(c, x + (Rn()-.5)*it.r, y + (Rn()-.5)*it.r, 1.6); }
  else if(it.t === 'orange'){ c.fillStyle = '#d9772f'; c.beginPath(); c.moveTo(x - it.r, y - it.r*.3); c.lineTo(x + it.r*.4, y - it.r*.8); c.lineTo(x + it.r, y + it.r*.2); c.lineTo(x, y + it.r*.8); c.closePath(); c.fill();
    if(it.r > 10){ c.fillStyle = '#8a3f12'; for(var k=0;k<8;k++) rond(c, x + (Rn()-.5)*it.r*1.2, y + (Rn()-.5)*it.r*.8, 2); } }
  else if(it.t === 'or'){ var gr = c.createLinearGradient(x - it.r, y - it.r, x + it.r, y + it.r); gr.addColorStop(0,'#fff3b0'); gr.addColorStop(.5,'#f2c040'); gr.addColorStop(1,'#b07a1c'); blob(c, x, y, it.r, Rn, gr, 12);
    var sc = (Math.sin(t/260) + 1)/2; c.fillStyle = 'rgba(255,255,255,' + (.4 + .6*sc) + ')'; c.font = (14 + 8*sc) + 'px sans-serif'; c.textAlign = 'center'; c.fillText('✦', x + it.r*.6, y - it.r*.5); }
}
function dessinerMite(c, x, y, t){
  c.save(); c.translate(x, y); c.strokeStyle = '#6b4f3a'; c.lineWidth = 2.5; c.lineCap = 'round';
  for(var i=0;i<4;i++){ var w = i === 0 ? Math.sin(t/180)*.5 : 0; c.beginPath(); c.moveTo(-8, -4 + i*4); c.lineTo(-26 - i*2, -16 + i*10 + w*20); c.stroke(); c.beginPath(); c.moveTo(8, -4 + i*4); c.lineTo(26 + i*2, -16 + i*10); c.stroke(); }
  c.fillStyle = '#efd9bf'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 4, 15, 19, 0, 0, 6.283); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, -16, 8, 7, 0, 0, 6.283); c.fill(); c.stroke();
  c.fillStyle = '#24182e'; c.beginPath(); c.arc(-3, -17, 1.8, 0, 6.283); c.arc(3, -17, 1.8, 0, 6.283); c.fill(); c.restore();
}
/* Le décor du microscope : la paillasse de près, le gros microscope de laiton vu de côté, sa molette, la planchette aux coupelles */
function sceneMicro(){
  var s = '<rect x="-1700" y="-1500" width="4400" height="1946" fill="#2a2140"/><rect x="-1700" y="-34" width="4400" height="480" fill="' + G('briques') + '" opacity=".7"/><rect x="-1700" y="-1500" width="4400" height="1946" fill="rgba(10,6,20,.45)"/><circle cx="330" cy="262" r="340" fill="' + G('lueur') + '"/>';
  s += '<rect x="-1700" y="446" width="4400" height="1900" fill="' + G('boisH') + '"/>' + T('M-1700,492 H2700 M-1700,566 H2700', '#a5653a', 3, ' opacity=".7"') + grainBois(-1700, 448, 4400, 42, 3, 51, '#8a5530', .35) + grainBois(-1700, 494, 4400, 70, 4, 52, '#8a5530', .35) + grainBois(-1700, 568, 4400, 130, 6, 53, '#8a5530', .35) +
    noeud(640, 610, 14, .5) + '<rect x="-1700" y="446" width="4400" height="44" fill="' + G('piedMur') + '"/>';
  /* ce que l'œil voit : un faisceau entre l'oculaire et la grande vue ronde */
  s += '<path d="M704,34 L732,48 L512,300 L420,96 Z" fill="#ffe9a3" opacity=".07"/>';
  /* le pied, la colonne */
  s += ombre(800, 584, 196, 20, .5) + P('M636,566 C636,540 700,528 800,528 C900,528 962,540 962,566 C962,592 636,592 636,566 Z', G('fer')) + '<path d="M662,556 C692,543 742,537 800,537 C860,537 912,543 940,554" stroke="#8a84a8" stroke-width="5" opacity=".5" fill="none" stroke-linecap="round"/>';
  s += R(864, 300, 40, 240, 8, G('laiton')) + T('M864,484 h40 M864,372 h40', '#8a5a12', 3) + reflet('M874,376 V530', 5, .4);
  /* le miroir, la platine, la lame et son fil */
  s += T('M800,470 L776,502 M800,470 L824,502', K, 7) + T('M800,470 L776,502 M800,470 L824,502', '#c9c4de', 3) + T('M824,488 L866,470', K, 9) + T('M824,488 L866,470', '#e0a23a', 4.5) + '<g transform="rotate(-18 800 468)">' + Ell(800, 468, 34, 13, '#d9e6f0') + reflet('M778,464 q20,-8 40,-3', 4, .8) + '</g>';
  s += P('M664,410 L872,410 L880,434 L652,434 Z', G('fer')) + reflet('M672,414 H866', 2.5, .25) + Ell(800, 422, 24, 6, '#0f0b18', ' stroke-width="2.5"') +
    R(742, 399, 116, 11, 2, 'rgba(225,245,255,.88)', ' stroke-width="2.5"') + T('M756,404 q12,-5 24,0 t24,0 t24,0 t18,0', K, 5) + T('M756,404 q12,-5 24,0 t24,0 t24,0 t18,0', ROUGE, 2.6) + T('M688,410 l34,-8 M852,410 l-28,-8', K, 8) + T('M688,410 l34,-8 M852,410 l-28,-8', '#f5b945', 4);
  /* le bras courbe, puis le tube penché avec l'oculaire en haut et la tourelle des objectifs en bas */
  s += T('M884,306 C962,250 952,120 836,108', K, 46) + T('M884,306 C962,250 952,120 836,108', '#e0a23a', 34) + reflet('M900,286 C948,244 940,142 850,122', 6, .4);
  s += '<g transform="rotate(-14 760 220)">' + R(784, 120, 62, 26, 6, G('fer')) + R(738, 70, 48, 250, 10, G('laiton')) + R(732, 110, 60, 12, 4, G('fer'), ' stroke-width="3"') + R(732, 252, 60, 12, 4, G('fer'), ' stroke-width="3"') + reflet('M750,80 V306', 6, .45) +
    R(742, 30, 40, 44, 7, G('fer')) + T('M742,46 h40 M742,58 h40', '#8a84a8', 2) + Ell(762, 30, 22, 6, '#bff3ff') + reflet('M750,29 h12', 2.5, .9) +
    Ell(762, 322, 42, 13, G('laitonV')) +
    [[10, 738, 26], [40, 762, 38], [100, 786, 50]].map(function(o){ return '<g class="obj" data-obj="' + o[0] + '">' + R(o[1] - 9, 326, 18, o[2], 4, G('laiton'), ' stroke-width="3"') + R(o[1] - 6, 326 + o[2], 12, 7, 2, G('fer'), ' stroke-width="2.5"') + '<ellipse cx="' + o[1] + '" cy="' + (334 + o[2]) + '" rx="5" ry="2" fill="#bff3ff" stroke="' + K + '" stroke-width="1.5"/></g>'; }).join('') + '</g>';
  /* la molette : on la tourne (ou on touche un chiffre) pour changer de grossissement */
  s += '<circle cx="888" cy="306" r="60" fill="rgba(8,4,16,.4)" filter="url(#flou)"/><g id="moletteG" data-act="molette" tabindex="0" role="button" aria-label="La molette des grossissements"><g id="molette" style="transform-origin:884px 300px">' +
    '<circle cx="884" cy="300" r="56" fill="' + G('laiton') + '" stroke="' + K + '" stroke-width="5"/><circle cx="884" cy="300" r="50.5" fill="none" stroke="#8a5a12" stroke-width="8" stroke-dasharray="3 4.2"/>' +
    '<circle cx="884" cy="300" r="43" fill="#f7cd6a" stroke="' + K + '" stroke-width="3"/><circle cx="872" cy="288" r="24" fill="#fff" opacity=".18"/>' +
    [[10, 0], [40, 120], [100, 240]].map(function(z){ return '<g class="num" data-zoom="' + z[0] + '" role="button" tabindex="0" aria-label="Grossissement ×' + z[0] + '" transform="rotate(' + z[1] + ' 884 300)"><circle cx="884" cy="273" r="18" fill="transparent"/>' +
      '<text x="884" y="274" font-size="' + (z[0] === 100 ? 15 : 17) + '" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#35281b" font-family="Andika, sans-serif">×' + z[0] + '</text></g>'; }).join('') +
    Cir(884, 300, 9, '#3a3450') + '</g>' + P('M873,226 L895,226 L884,246 Z', '#e8343c', ' stroke-width="3"') + '</g>';
  /* la planchette et ses cinq coupelles */
  s += ombre(332, 614, 268, 14, .45) + P('M100,552 L564,552 L586,602 L78,602 Z', G('boisC')) + grainBois(96, 556, 472, 42, 4, 54, '#7d4626', .3) + R(78, 602, 508, 14, 4, G('boisS'), ' stroke-width="3.5"');
  PC_X.forEach(function(x, i){ s += '<g id="pc' + i + '"></g>'; });
  return s;
}
function oculaireDevant(){
  var cx = 330, cy = 262, r = 180, s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 12) + '" fill="none" stroke="' + K + '" stroke-width="32"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 12) + '" fill="none" stroke="' + G('laiton') + '" stroke-width="24"/>';
  for(var i=0;i<90;i++){ var a = i/90*Math.PI*2; s += '<line x1="' + f1(cx + Math.cos(a)*(r + 15)) + '" y1="' + f1(cy + Math.sin(a)*(r + 15)) + '" x2="' + f1(cx + Math.cos(a)*(r + 23)) + '" y2="' + f1(cy + Math.sin(a)*(r + 23)) + '" stroke="#8a5a12" stroke-width="1.6"/>'; }
  return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 1) + '" fill="none" stroke="#120c1c" stroke-width="5"/>' + Cir(cx - 138, cy - 138, 5, '#b07a1c') + Cir(cx + 138, cy + 138, 5, '#b07a1c') +
    '<path d="M' + (cx - 128) + ',' + (cy - 72) + ' C' + (cx - 104) + ',' + (cy - 118) + ' ' + (cx - 60) + ',' + (cy - 148) + ' ' + (cx - 8) + ',' + (cy - 156) + '" fill="none" stroke="#fff" stroke-width="8" opacity=".3" stroke-linecap="round"/>';
}
function svgPince(grain){
  return '<svg viewBox="0 0 80 80" aria-hidden="true"><g class="branches"><path class="b1" d="M6,74 L66,8" fill="none" stroke="' + K + '" stroke-width="8" stroke-linecap="round"/><path class="b1" d="M6,74 L66,8" fill="none" stroke="#c9c4de" stroke-width="4" stroke-linecap="round"/>' +
    '<path class="b2" d="M6,74 L74,18" fill="none" stroke="' + K + '" stroke-width="8" stroke-linecap="round"/><path class="b2" d="M6,74 L74,18" fill="none" stroke="#e6e2f4" stroke-width="4" stroke-linecap="round"/></g>' +
    '<rect x="60" y="2" width="18" height="18" rx="5" fill="#5f5872" stroke="' + K + '" stroke-width="3" transform="rotate(42 69 11)"/>' + (grain || '') + '</svg>';
}
function majPlateauMicro(){ PC_X.forEach(function(x, i){ var g = $('#pc' + i); if(g) g.innerHTML = coupelle(x, PC_Y, 36, S.coupes[i]); }); }
function majMolette(){
  var m = $('#molette'); if(!m) return; m.style.transform = 'rotate(' + ({10:0, 40:-120, 100:-240})[S.zoom] + 'deg)';
  $$('.obj').forEach(function(o){ o.classList.toggle('actif', +o.dataset.obj === S.zoom); }); $$('.num').forEach(function(n){ n.classList.toggle('actif', +n.dataset.zoom === S.zoom); });
  var z = $('#zoomTxt'); if(z) z.textContent = '×' + S.zoom;
}
function ouvrirMicro(){
  if(S.occupe) return; S.zoom = 10; S.cx = 500; S.cy = 500;
  ouvrirMode('micro', '<div class="vue" id="vue"><svg class="fond" viewBox="0 0 1000 640">' + sceneMicro() + '</svg>' +
    '<canvas id="lentille" class="pose" style="' + pos(150, 82, 360, 360) + '" aria-label="Le fil au microscope"></canvas><svg class="devant" viewBox="0 0 1000 640" aria-hidden="true">' + oculaireDevant() + '</svg>' +
    '<div class="zoom-plaque pose" id="zoomTxt" style="' + pos(30, 24, 118, 56) + '" aria-live="polite">×10</div><div class="pince-c" id="pinceC" hidden>' + svgPince() + '</div></div>' + modeHaut(false, 'Quitter le microscope'), {x:674, y:300});
  majPlateauMicro(); majMolette(); brancherLentille(); requestAnimationFrame(rendLentille); lancerBoucle();
}
function lancerBoucle(){ cancelAnimationFrame(boucle); if(S.mode === 'micro' && !reduit){ var f = function(){ rendLentille(); boucle = requestAnimationFrame(f); }; boucle = requestAnimationFrame(f); } }
function rendLentille(){
  var cv = $('#lentille'); if(!cv) return; var r = prep(cv), c = r.ctx, T0 = r.w, half = T0/2, now = performance.now();
  S.cx = Math.min(Math.max(S.cx, half), MW - half); S.cy = Math.min(Math.max(S.cy, half), MW - half); var sx = S.cx - half, sy = S.cy - half;
  c.clearRect(0,0,T0,T0); c.save(); c.beginPath(); c.arc(half, half, half, 0, 6.283); c.clip();
  c.drawImage(scenes[S.zoom], sx*SDPR, sy*SDPR, T0*SDPR, T0*SDPR, 0, 0, T0, T0);
  S.items[S.zoom].forEach(function(it){ if(!it.pris) dessinerItem(c, it, it.x - sx, it.y - sy, now); });
  if(S.zoom === 100) dessinerMite(c, S.mite.x - sx, S.mite.y - sy, now);
  var vg = c.createRadialGradient(half, half, half*.62, half, half, half); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(20,12,30,.65)'); c.fillStyle = vg; c.fillRect(0,0,T0,T0); c.restore();
}
function brancherLentille(){
  var cv = $('#lentille'), pc = $('#pinceC'), vue = $('#vue'), gl = null;
  var suivre = function(e){ var v = vue.getBoundingClientRect(); pc.hidden = false; pc.style.left = (e.clientX - v.left) + 'px'; pc.style.top = (e.clientY - v.top) + 'px'; };
  cv.addEventListener('pointerdown', function(e){ cv.setPointerCapture(e.pointerId); gl = {x:e.clientX, y:e.clientY, cx:S.cx, cy:S.cy, bouge:false}; suivre(e); });
  cv.addEventListener('pointermove', function(e){ suivre(e); if(!gl) return; var dx = e.clientX - gl.x, dy = e.clientY - gl.y; if(Math.hypot(dx,dy) > 7) gl.bouge = true; if(gl.bouge){ S.cx = gl.cx - dx; S.cy = gl.cy - dy; rendLentille(); } });
  cv.addEventListener('pointerup', function(e){ if(gl && !gl.bouge){ var r = cv.getBoundingClientRect(); toucherLentille(e.clientX - r.left, e.clientY - r.top, r.width, e.clientX, e.clientY); } gl = null; if(e.pointerType !== 'mouse') pc.hidden = true; });
  cv.addEventListener('pointerleave', function(){ if(!gl) pc.hidden = true; });
  cv.addEventListener('pointercancel', function(){ gl = null; pc.hidden = true; });
}
function bulleLentille(gx, gy, t){
  var v = $('#vue'), r = v.getBoundingClientRect(), b = v.querySelector('.bulle-l'); if(b) b.remove(); b = document.createElement('div'); b.className = 'bulle-l'; b.textContent = t;
  b.style.left = (gx - r.left) + 'px'; b.style.top = (gy - r.top) + 'px'; v.appendChild(b); setTimeout(function(){ b.remove(); }, 1700);
}
function toucherLentille(lx, ly, T0, gx, gy){
  var half = T0/2; if(Math.hypot(lx - half, ly - half) > half) return;
  var wx0 = S.cx - half + lx, wy0 = S.cy - half + ly;
  if(S.zoom === 100 && Math.hypot(S.mite.x - wx0, S.mite.y - wy0) < 42){ S.mite = {x:150 + Math.random()*700, y:150 + Math.random()*700}; bulleLentille(gx, gy, TXT.mite); return; }
  var it = S.items[S.zoom].filter(function(i){ return !i.pris && Math.hypot(i.x - wx0, i.y - wy0) < i.r + 16; })[0];
  if(!it) return;
  if(it.min && it.min > S.zoom){ bulleLentille(gx, gy, TXT.trop); var pc = $('#pinceC'); pc.classList.remove('non'); void pc.offsetWidth; pc.classList.add('non'); return; }
  it.pris = true; if(it.id) S.items[10].forEach(function(i){ if(i.ref === it.id) i.pris = true; });
  var idx = ajouterCoupe(it.t); rendLentille(); bulleLentille(gx, gy, TXT.pris); envoler(it.t, gx, gy, idx);
}
function ajouterCoupe(t){ var i = S.coupes.findIndex(function(c){ return c && c.t === t; }); if(i >= 0){ S.coupes[i].n++; return i; } for(i = 0; i < POS_COUPES.length - 1 && S.coupes[i]; i++){} S.coupes[i] = {t:t, n:1}; return i; }
/* La pince attrape le grain et le porte jusqu'à sa coupelle */
function envoler(t, gx, gy, idx){
  var cible = $('#pc' + idx), fin = function(){ majPlateauMicro(); dessinerCoupes(); dessinerLame(); };
  if(!cible || reduit){ fin(); return; }
  var pc = $('#pinceC'); if(pc) pc.hidden = true;
  var v = document.createElement('div'); v.className = 'vol pince-vol'; v.innerHTML = svgPince('<g transform="translate(6,74)">' + contenuCoupe(t, 0, 0, 1, 26) + '</g>'); document.body.appendChild(v);
  v.style.left = gx + 'px'; v.style.top = gy + 'px'; void v.offsetWidth;
  var r = cible.getBoundingClientRect(); v.style.left = (r.left + r.width/2) + 'px'; v.style.top = (r.top + r.height*.45) + 'px';
  setTimeout(function(){ v.remove(); fin(); }, 760);
}
function changerZoom(z){
  if(z === S.zoom || S.mode !== 'micro') return; var rx = S.cx/MW, ry = S.cy/MW; S.zoom = z; S.cx = rx*MW; S.cy = ry*MW; majMolette();
  var cv = $('#lentille'); if(cv && !reduit){ cv.classList.add('flou'); setTimeout(function(){ cv.classList.remove('flou'); }, 240); }
  rendLentille(); lancerBoucle();
}
