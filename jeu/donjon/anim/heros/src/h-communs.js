
/* ============ les gestes communs aux trois héros ============ */
/* une image du cycle de course (f entre 0 et 1) */
function course(f, R0){
  function pied(ph){
    ph = ((ph % 1) + 1) % 1; var x, y, a = 0;
    if(ph < 0.4){ var s = ph / 0.4; x = 32 - 66 * s; y = 272; a = s < 0.15 ? -12 * (1 - s / 0.15) : 0; }
    else { var s2 = (ph - 0.4) / 0.6, e = s2 * s2 * (3 - 2 * s2); x = -34 + 66 * e - 16 * Math.sin(Math.PI * s2) * (1 - s2); y = 272 - 52 * Math.sin(Math.PI * Math.pow(s2, 0.75)); a = 28 * Math.sin(Math.PI * s2) - (s2 > 0.85 ? 12 * (s2 - 0.85) / 0.15 : 0); }
    return [x, y, a];
  }
  var b = pied(f), a = pied(f + 0.5), c2 = Math.cos(2 * Math.PI * f), c4 = Math.cos(4 * Math.PI * (f - 0.06));
  var p = {bassin:{y:6 + 6 * c4, r:2.5 * Math.sin(2 * Math.PI * f)}, torse:14 - 2 * c4, tete:-10 + 2 * c4,
    pA:[SQ.cuisseA[0] + 6 + a[0], a[1]], fA:a[2], pB:[SQ.cuisseB[0] - 6 + b[0], b[1]], fB:b[2],
    brasA:-14 - 44 * c2, avantBrasA:-88 + 18 * c2, mainA:10, brasB:-14 + 44 * c2, avantBrasB:-88 - 18 * c2, mainB:10};
  if(R0.course) R0.course(p, f);
  return p;
}
H.entrer = function(dist){
  dist = dist === undefined ? 320 : dist;
  /* il quitte tout de suite la scène (à gauche) : on ne le voit pas à sa place avant qu'il arrive */
  this.boite.style.transform = 'translateX(' + (-dist) + 'px)';
  this.souples.forEach(function(so){ so.init = false; });
  return this._file(function(){
    var me = this, D = dist, cyc = 360, n = Math.max(2, Math.round(Math.max(650, D * 0.9 / 0.46) / cyc)), tRun = n * cyc, tFr = 300, T = tRun + tFr;
    this.expr('garde');
    var seq = [], N = 10;
    this.poser(course(0, this.R0));
    for(var k = 1; k <= n * N; k++) seq.push({d:cyc / N, p:course(k / N, this.R0), e:'lin'});
    var fr = {bassin:{x:4, y:18, r:-5}, torse:-14, tete:6, pA:[94, 272], pB:[184, 272], fB:-16, brasA:-80, avantBrasA:-30, mainA:0, brasB:40, avantBrasB:-60, mainB:0};
    if(this.R0.frein) this.R0.frein(fr);
    seq.push({d:tFr * 0.5, p:fr, e:'o', f0:function(){ me._poussiere(); }});
    seq.push({d:tFr * 0.5, p:fr, e:'lin'});
    this.boite.animate([{transform:'translateX(' + (-D) + 'px)', easing:'linear'}, {transform:'translateX(' + (-D * 0.12) + 'px)', offset:tRun / T, easing:'cubic-bezier(.15,.7,.35,1)'}, {transform:'translateX(0px)', offset:(tRun + tFr * 0.8) / T}, {transform:'translateX(0px)'}],
      {duration:T});
    this.boite.style.transform = '';
    this.souples.forEach(function(so){ so.init = false; });
    return this.jouer(seq).then(function(){
      return me.jouer([{d:200, p:me._rebond(), e:'o'}, {d:380, p:me.garde(), e:'b'}]);
    });
  });
};
H._rebond = function(){ var g = this.garde(), p = {}; for(var k in g) p[k] = g[k]; p.torse = (g.torse || 0) + 9; p.tete = (g.tete || 0) - 4; p.bassin = {y:((g.bassin || {}).y || 0) + 7}; return p; };
H._poussiere = function(){
  var me = this;
  ['orteilB', 'chevilleB', 'orteilA'].forEach(function(r, i){
    var p = me.rep(r);
    for(var k = 0; k < 3; k++) onde(me.fx, p.x + alea(-10, 14), p.y + alea(-4, 2), {css:'background:radial-gradient(circle,rgba(190,180,210,.55),rgba(150,140,170,0) 70%)', w:alea(18, 30), s0:0.4, s1:alea(1.6, 2.4), d:alea(450, 650), retard:i * 60 + k * 50, o0:0.9});
    gerbe(me.fx, p.x, p.y, {n:4, c:'#8a8098', angle:-160, ecart:30, v0:40, v1:110, g:300, t0:2, t1:4, lueur:false, d0:300, d1:500});
  });
};
/* il encaisse un coup */
H.touche = function(){
  return this._file(function(){
    var me = this, g = this.garde();
    this.expr('aie');
    this._flash();
    this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(-24px)', offset:.18, easing:'cubic-bezier(.2,.8,.4,1)'}, {transform:'translateX(-5px)', offset:.7}, {transform:'translateX(0px)'}], {duration:700, easing:'ease-out'});
    var p = me.rep('tete');
    gerbe(this.fx, p.x + 30, p.y + 40, {n:7, c:['#fff', '#ffe08a'], angle:180, ecart:50, v0:120, v1:240, g:200, forme:'trait', t0:8, t1:14, d0:220, d1:380});
    gerbe(this.fx, p.x - 10, p.y - 8, {n:3, c:'#bfe8ff', angle:-120, ecart:40, v0:60, v1:110, g:400, t0:4, t1:6, d0:500, d1:700, lueur:false});
    var hit = {bassin:{x:-8, y:12, r:-4}, torse:-18, tete:-16, brasA:-30, avantBrasA:-40, brasB:40, avantBrasB:-50};
    for(var k in g) if(k.charAt(0) === 'p' || k.charAt(0) === 'f') hit[k] = g[k];
    if(this.R0.touche) this.R0.touche(hit);
    return this.jouer([{d:70, p:hit, e:'oo'}, {d:90, p:hit, e:'lin'}, {d:260, p:me._rebond(), e:'io', f0:function(){ me.expr('aie'); }}, {d:320, p:g, e:'b', f0:function(){ me.expr('garde'); me.cligner(); }}]);
  });
};
/* il tombe, sonné */
H.tomber = function(){
  return this._file(function(){
    var me = this;
    this.expr('aie');
    this._flash();
    var hit = {bassin:{x:-8, y:14}, torse:-22, tete:-18, brasA:-50, avantBrasA:-40, brasB:50, avantBrasB:-40, pA:[100, 272], pB:[164, 272]};
    var flanche = {bassin:{x:-4, y:40, r:4}, torse:16, tete:12, pA:[104, 272], pB:[156, 272], fA:0, fB:0, brasA:-20, avantBrasA:-20, brasB:14, avantBrasB:-14, mainA:0, mainB:0};
    var bascule = {racine:{x:58, y:-6, r:-46}, bassin:{x:0, y:24, r:0}, torse:-12, tete:-18, cuisseA:-56, tibiaA:80, piedA:-10, cuisseB:-70, tibiaB:96, piedB:-20, brasA:-150, avantBrasA:-30, brasB:-120, avantBrasB:-40};
    var sol = {racine:{x:127, y:-27, r:-90}, bassin:{x:0, y:0, r:0}, torse:0, tete:20, cuisseA:-28, tibiaA:46, piedA:-24, cuisseB:-58, tibiaB:92, piedB:-36, brasA:172, avantBrasA:-26, mainA:0, brasB:16, avantBrasB:-44, mainB:0};
    var rb = {}; for(var k in sol) rb[k] = sol[k]; rb.racine = {x:127, y:-38, r:-84}; rb.tete = 6; rb.cuisseA = -40; rb.tibiaA = 64; rb.cuisseB = -70; rb.tibiaB = 110; rb.brasA = 150; rb.brasB = -10;
    if(this.R0.tombe) this.R0.tombe(sol, rb);
    return this.jouer([{d:90, p:hit, e:'oo'}, {d:110, p:hit, e:'lin'}, {d:260, p:flanche, e:'io'}, {d:120, p:flanche, e:'lin'},
      {d:220, p:bascule, e:'i'}, {d:170, p:sol, e:'i', f:function(){ me._boum(); }}, {d:150, p:rb, e:'o'}, {d:240, p:sol, e:'b', f:function(){ me.expr('ko'); me.ko = true; me._etoiles(true); }}]).then(function(){ me.ko = true; });
  });
};
H._flash = function(){
  this.svg.animate([{filter:'brightness(1) drop-shadow(0 0 0 rgba(255,60,70,0))'}, {filter:'brightness(2.3) drop-shadow(0 0 2px rgba(255,255,255,.9))', offset:.1},
    {filter:'brightness(1.08) drop-shadow(0 0 7px rgba(255,50,70,.95))', offset:.3}, {filter:'brightness(1) drop-shadow(0 0 0 rgba(255,60,70,0))'}], {duration:560, easing:'ease-out'});
};
H._boum = function(){
  var p = this.rep('tete'), q = this.rep('chevilleB');
  for(var k = 0; k < 6; k++){ var x = p.x + (q.x - p.x) * k / 5; onde(this.fx, x + alea(-8, 8), q.y + 4, {css:'background:radial-gradient(circle,rgba(200,190,220,.6),rgba(150,140,170,0) 70%)', w:alea(26, 40), h:alea(14, 20), s0:0.5, s1:alea(1.8, 2.6), d:alea(500, 750), retard:k * 25}); }
  this.boite.animate([{transform:'translateY(0px)'}, {transform:'translateY(2px)', offset:.3}, {transform:'translateY(0px)'}], {duration:200});
};
H._etoiles = function(on){
  if(this._et){ var e = this._et; this._et = null; e.animate([{opacity:1}, {opacity:0, transform:'translateY(-14px) scale(.6)'}], {duration:300}).finished.then(function(){ e.remove(); }); }
  if(!on) return;
  var p = this.rep('teteC'), w = div(this.fx, 'left:' + (p.x + 4) + 'px;top:' + (p.y - 34) + 'px;width:0;height:0', '');
  w.style.transform = 'none';
  for(var k = 0; k < 4; k++){
    var s = div(w, '', etoile5(['#ffe36a', '#fff3b0', '#ffd04a', '#fff'][k], 20 - (k % 2) * 4)), kf = [];
    for(var i = 0; i <= 12; i++){ var a = (i / 12 + k / 4) * 2 * Math.PI, z = Math.sin(a); kf.push({transform:place(Math.cos(a) * 34, z * 10, i * 30, 0.75 + 0.3 * z), opacity:z < -0.3 ? 0.6 : 1, zIndex:z > 0 ? 2 : 0}); }
    s.animate(kf, {duration:1300, iterations:Infinity, easing:'linear'});
  }
  w.animate([{opacity:0}, {opacity:1}], {duration:300, fill:'backwards'});
  this._et = w;
};
/* il se relève, dans une lumière dorée */
H.relever = function(){
  return this._file(function(){
    var me = this, g = this.garde();
    this._etoiles(false);
    var W = this.fx.offsetWidth || 200, Hh = this.fx.offsetHeight || 240, cx = W / 2 - 30, sy = Hh * 293 / 300;
    var col = div(this.fx, 'width:150px;height:260px;border-radius:50% 50% 40% 40%;background:radial-gradient(ellipse at 50% 80%,rgba(255,236,160,.85),rgba(255,200,90,.35) 40%,rgba(255,190,80,0) 70%);mix-blend-mode:screen;filter:blur(2px)');
    jouerEl(col, [{transform:place(cx + 30, sy - 110, 0, 0.2), opacity:0}, {transform:place(cx + 30, sy - 120, 0, 1), opacity:1, offset:.35}, {transform:place(cx + 30, sy - 120, 0, 1.05), opacity:.9, offset:.7}, {transform:place(cx + 30, sy - 130, 0, 1.2), opacity:0}], {duration:1700, easing:'ease-out'});
    onde(this.fx, cx + 30, sy + 2, {w:150, h:34, c:'#ffd36a', ep:3, s0:0.2, s1:1.3, d:900});
    onde(this.fx, cx + 30, sy + 2, {w:150, h:34, c:'#fff0b0', ep:2, s0:0.2, s1:1.6, d:1100, retard:300});
    scintille(this.fx, cx + 30, sy - 90, {n:16, rx:60, ry:90, dy:-50, c:['#ffe9a0', '#fff', '#ffd36a'], etale:900, d0:600, d1:1000});
    gerbe(this.fx, cx + 30, sy - 10, {n:18, c:['#ffe36a', '#fff3c0'], angle:-90, ecart:40, v0:50, v1:150, g:-60, t0:3, t1:5, d0:700, d1:1200, etale:700});
    this.expr('surpris');
    var assis = {racine:{x:70, y:-10, r:-30}, bassin:{x:0, y:30, r:0}, torse:10, tete:0, cuisseA:-80, tibiaA:110, piedA:-30, cuisseB:-60, tibiaB:120, piedB:-60, brasA:-20, avantBrasA:-20, brasB:30, avantBrasB:-30, mainA:0, mainB:0};
    var genou = {racine:{x:0, y:0, r:0}, bassin:{x:0, y:48, r:0}, torse:22, tete:-10, pA:[92, 272], fA:40, pB:[160, 272], brasA:-30, avantBrasA:-50, brasB:20, avantBrasB:-40};
    var debout = {racine:{x:0, y:-12, r:0}, bassin:{y:-2}, torse:-6, tete:-10, pA:[110, 270], pB:[146, 270], brasA:-150, avantBrasA:-10, brasB:-20, avantBrasB:-30};
    if(this.R0.releve) this.R0.releve(debout);
    return this.jouer([{d:280, p:assis, e:'io', f0:function(){ me.cligner(); }}, {d:120, p:assis, e:'lin'}, {d:300, p:genou, e:'io', f:function(){ me.expr('content'); }},
      {d:240, p:debout, e:'o'}, {d:120, p:debout, e:'lin'}, {d:400, p:g, e:'b', f0:function(){ me.ko = false; }}]).then(function(){ me.ko = false; me.expr('garde'); });
  });
};
/* une petite danse de victoire */
H.joie = function(){
  return this._file(function(){
    var me = this, g = this.garde(), j = this.R0.joie || {};
    var tasse = {bassin:{y:20}, torse:10, tete:4}, haut = {racine:{y:-38}, bassin:{y:-2}, torse:-8, tete:-12, pA:[108, 262], pB:[150, 258], fA:20, fB:14};
    var tasse2 = {racine:{y:0}, bassin:{y:16}, torse:6, tete:0}, haut2 = {racine:{y:-22}, bassin:{y:0}, torse:-4, tete:-10, pA:[108, 266], pB:[150, 264], fA:12, fB:10};
    [tasse, haut, tasse2, haut2].forEach(function(p){ for(var k in g) if(!(k in p) && k !== 'racine') p[k] = g[k]; });
    [haut, haut2].forEach(function(p){ for(var k in j) p[k] = j[k]; });
    for(var k in j) tasse2[k] = j[k];
    tasse.pA = tasse2.pA = g.pA; tasse.pB = tasse2.pB = g.pB;
    var p = this.rep('tete');
    return this.jouer([{d:150, p:tasse, e:'io', f:function(){ me.expr('joie'); scintille(me.fx, p.x + 10, p.y - 10, {n:10, rx:70, ry:50, etale:500}); }},
      {d:260, p:haut, e:'o', f:function(){ gerbe(me.fx, p.x + 10, p.y - 40, {n:14, c:['#ffe36a', '#8ff3ff', '#ff8aa8', '#a6ff9a'], angle:-90, ecart:70, v0:90, v1:200, g:420, forme:'carre', t0:4, t1:7, d0:700, d1:1100}); }},
      {d:200, p:tasse2, e:'i'}, {d:220, p:haut2, e:'o'}, {d:180, p:tasse2, e:'i'}, {d:420, p:g, e:'b', f:function(){ me.expr('content'); }}]).then(function(){ return me.att(300); }).then(function(){ me.expr('garde'); });
  });
};
/* celui qui joue : plus droit, une lueur */
H.choisi = function(on){
  on = on !== false;
  if(this.cuit) this._lueurs(on);
  this.racine.classList.toggle('ha-choisi', on);
  if(!!this._choisi === on) return Promise.resolve();
  this._choisi = on;
  if(this.ko) return Promise.resolve();
  var me = this;
  return this._file(function(){ return me.jouer([{d:360, p:me.garde(), e:'b'}]); });
};
H.arreter = function(){
  this._veut = false; this._idleOff(); this._gTok++;
  this._etoiles(false);
  var i = VIVANTS.indexOf(this); if(i >= 0) VIVANTS.splice(i, 1);
  if(this.R0.arret) this.R0.arret.call(this);
};
H.detruire = function(){ this.arreter(); this.racine.remove(); };
