
/* ============ Le microscope ============ */
var MW = 1000, scenes = {}, SDPR = 1;
function genItems(){
  var d = S.niveau === 'difficile';
  /* À chaque grossissement, on voit déjà, tout petits, les grains du grossissement suivant (min) : « Trop petit : zoome ! » */
  S.items = {
    10:[{t:'noir', x:180, y:420, r:13}, {t:'noir', x:470, y:600, r:12}, {t:'noir', x:820, y:400, r:14}, {t:'brun', x:300, y:620, r:12},
        {t:'orange', x:640, y:470, r:4, min:40, ref:'o1'}, {t:'noir', x:556, y:372, r:3.6, min:40, ref:'n4'}].concat(d ? [{t:'brun', x:900, y:560, r:10}] : []),
    40:[{t:'orange', x:430, y:380, r:28, id:'o1'}, {t:'noir', x:690, y:640, r:30, id:'n4'}, {t:'or', x:560, y:300, r:5, min:100, ref:'or1'}],
    100:[{t:'or', x:300, y:180, r:26, id:'or1'}]
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
function ouvrirMicro(){
  if(S.occupe) return; S.zoom = 10; S.cx = 500; S.cy = 500;
  ouvrirMode('micro', '<div class="oculaire-hud" id="ocuHud" style="' + pos(42, 70, 500, 500) + '"><canvas id="lentille" aria-label="L\'échantillon au microscope"></canvas>' + svgOculaire() + '</div>' +
    '<button type="button" class="zoom-plaque pose" id="zoomTxt" data-act="molette" style="' + pos(24, 12, 124, 58) + '" aria-label="Changer de grossissement">×10</button><div class="pince-c" id="pinceC" hidden>' + svgPince() + '</div>');
  camera(783, 283, 1.749); majMolette(); brancherLentille(); requestAnimationFrame(rendLentille); lancerBoucle();
}
function lancerBoucle(){ cancelAnimationFrame(boucle); if(S.mode === 'micro' && !reduit){ var f = function(){ rendLentille(); boucle = requestAnimationFrame(f); }; boucle = requestAnimationFrame(f); } }
function rendLentille(){
  var cv = $('#lentille'); if(!cv) return; var r = prep(cv), c = r.ctx, T0 = r.w, half = T0/2, now = performance.now();
  S.cx = Math.min(Math.max(S.cx, half), MW - half); S.cy = Math.min(Math.max(S.cy, half), MW - half); var sx = S.cx - half, sy = S.cy - half;
  c.clearRect(0,0,T0,T0); c.save(); c.beginPath(); c.arc(half, half, half, 0, 6.283); c.clip();
  c.drawImage(scenes[S.zoom], sx*SDPR, sy*SDPR, T0*SDPR, T0*SDPR, 0, 0, T0, T0);
  S.items[S.zoom].forEach(function(it){ if(!it.pris) dessinerItem(c, it, it.x - sx, it.y - sy, now); });
  if(S.zoom === 100) dessinerMite(c, S.mite.x - sx, S.mite.y - sy, now);
  var vg = c.createRadialGradient(half, half, half*.7, half, half, half); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(20,12,30,.55)'); c.fillStyle = vg; c.fillRect(0,0,T0,T0); c.restore();
}
function brancherLentille(){
  var cv = $('#lentille'), pc = $('#pinceC'), boite = $('#hudBoite'), gl = null;
  var suivre = function(e){ var v = boite.getBoundingClientRect(); pc.hidden = false; pc.style.left = (e.clientX - v.left) + 'px'; pc.style.top = (e.clientY - v.top) + 'px'; };
  cv.addEventListener('pointerdown', function(e){ cv.setPointerCapture(e.pointerId); gl = {x:e.clientX, y:e.clientY, cx:S.cx, cy:S.cy, bouge:false}; suivre(e); });
  cv.addEventListener('pointermove', function(e){ suivre(e); if(!gl) return; var dx = e.clientX - gl.x, dy = e.clientY - gl.y; if(Math.hypot(dx,dy) > 9) gl.bouge = true; if(gl.bouge){ S.cx = gl.cx - dx; S.cy = gl.cy - dy; rendLentille(); } });
  cv.addEventListener('pointerup', function(e){ if(gl && !gl.bouge){ var r = cv.getBoundingClientRect(); toucherLentille(e.clientX - r.left, e.clientY - r.top, r.width, e.clientX, e.clientY); } gl = null; if(e.pointerType !== 'mouse') setTimeout(function(){ pc.hidden = true; }, 500); });
  cv.addEventListener('pointerleave', function(){ if(!gl) pc.hidden = true; });
  cv.addEventListener('pointercancel', function(){ gl = null; pc.hidden = true; });
}
function bulleLentille(gx, gy, t){
  var v = $('#hudBoite'), r = v.getBoundingClientRect(), b = v.querySelector('.bulle-l'); if(b) b.remove(); b = document.createElement('div'); b.className = 'bulle-l'; b.textContent = t;
  b.style.left = (gx - r.left) + 'px'; b.style.top = (gy - r.top) + 'px'; v.appendChild(b); setTimeout(function(){ b.remove(); }, 1700);
}
function toucherLentille(lx, ly, T0, gx, gy){
  var half = T0/2; if(Math.hypot(lx - half, ly - half) > half) return;
  var wx0 = S.cx - half + lx, wy0 = S.cy - half + ly, marge = Math.max(16, T0*.045);
  if(S.zoom === 100 && Math.hypot(S.mite.x - wx0, S.mite.y - wy0) < 42){ S.mite = {x:150 + Math.random()*700, y:150 + Math.random()*700}; bulleLentille(gx, gy, TXT.mite); return; }
  var it = S.items[S.zoom].filter(function(i){ return !i.pris && Math.hypot(i.x - wx0, i.y - wy0) < i.r + marge; })[0];
  if(!it) return;
  if(it.min && it.min > S.zoom){ bulleLentille(gx, gy, TXT.trop); var pc = $('#pinceC'); pc.classList.remove('non'); void pc.offsetWidth; pc.classList.add('non'); secouer($('#moletteG')); return; }
  it.pris = true; if(it.id) [10, 40].forEach(function(z){ S.items[z].forEach(function(i){ if(i.ref === it.id) i.pris = true; }); });
  var idx = ajouterCoupe(it.t); rendLentille(); bulleLentille(gx, gy, TXT.pris); envoler(it.t, gx, gy, idx);
}
function ajouterCoupe(t){ var i = S.coupes.findIndex(function(c){ return c && c.t === t; }); if(i >= 0){ S.coupes[i].n++; return i; } for(i = 0; i < COUPES.length - 1 && S.coupes[i]; i++){} S.coupes[i] = {t:t, n:1}; return i; }
/* La pince attrape le grain et le porte jusqu'à sa coupelle, qui est restée à sa place sur la paillasse */
function envoler(t, gx, gy, idx){
  var cible = $('#coupe' + idx), fin = function(){ dessinerCoupes(); dessinerLame(); };
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
