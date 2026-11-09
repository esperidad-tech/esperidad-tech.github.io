
/* ============ le Sage : rôle ============ */
ROLES.sage = {
  fab:sage,
  garde:{racine:{}, bassin:{y:4}, torse:3, tete:-3, pA:[106, 272], pB:[152, 272], mA:[160, 172], hA:-24, mB:[150, 146], hB:0},
  gardeChoisi:{racine:{}, bassin:{y:1}, torse:-1, tete:-7, pA:[108, 272], pB:[150, 272], mA:[162, 166], hA:-30, mB:[152, 138], hB:0},
  joie:{mA:[178, 58], hA:-150, mB:[92, 36], hB:-16},
  course:function(p, f){ p.brasB = -40 + 14 * Math.cos(2 * Math.PI * f); p.avantBrasB = -50; p.mainB = 60; },
  frein:function(p){ p.brasB = -60; p.avantBrasB = -20; p.mainB = 70; },
  init:function(){
    this.cristal = this.$('[data-cristal]'); this.crHalo = this.$('[data-cr-halo]');
    this.crHalo.style.transformBox = 'fill-box'; this.crHalo.style.transformOrigin = '50% 50%';
  },
  idle:function(A){
    A.push(this.crHalo.animate([{opacity:.45, transform:'scale(.82)'}, {opacity:1, transform:'scale(1.18)'}], {duration:1100, iterations:Infinity, direction:'alternate', easing:'ease-in-out'}));
    A.push(this.cristal.animate([{transform:'scale(1)'}, {transform:'scale(1.08)'}], {duration:1100, iterations:Infinity, direction:'alternate', easing:'ease-in-out'}));
  },
  pas:function(dt){
    if(!this._idle || this.ko) return;
    this._sc = (this._sc || 0) + dt;
    if(this._sc > 0.28){ this._sc = 0; var p = this.rep('cristal'); gerbe(this.fx, p.x + alea(-6, 6), p.y + alea(-6, 6), {n:1, c:['#bff8ff', '#e8fdff', CYAN], angle:-90, ecart:60, v0:8, v1:24, g:-20, t0:2, t1:3.5, d0:700, d1:1100}); }
  },
  geste:function(ok){
    var me = this, g = this.garde();
    if(Math.random() < 0.55){
      /* il frappe le sol de son bâton : une onde de runes */
      var leve = {}; for(var k in g) leve[k] = g[k]; leve.mB = [152, 128]; leve.tete = -8; leve.torse = 0;
      var tape = {}; for(k in g) tape[k] = g[k]; tape.mB = [150, 150]; tape.bassin = {y:7};
      return this.jouer([{d:340, p:leve, e:'io'}, {d:110, p:tape, e:'i', f:function(){ if(!ok()) return; var p = me.rep('baton-bas'); onde(me.fx, p.x, p.y, {w:70, h:16, c:CYAN, ep:2, s0:0.2, s1:1.8, d:700}); scintille(me.fx, p.x, p.y - 8, {n:5, rx:26, ry:6, dy:-24, c:[CYAN, '#e8fdff'], etale:200}); me.cristalFlash(); }},
        {d:200, p:tape, e:'lin'}, {d:420, p:g, e:'io'}]);
    }
    /* il remonte ses lunettes / se gratte le menton, pensif */
    var pense = {}; for(var k2 in g) pense[k2] = g[k2]; pense.mA = [140, 96]; pense.hA = -170; pense.tete = -10; pense.avA = 1;
    me.avant('A', true);
    return this.jouer([{d:420, p:pense, e:'io', f:function(){ if(ok()) me.expr('content'); }}, {d:500, p:pense, e:'lin'}, {d:420, p:g, e:'io', f:function(){ me.avant('A', false); if(ok()) me.expr('garde'); }}]).then(function(){ me.avant('A', false); });
  }
};
H.cristalFlash = function(fort){
  this.crHalo.animate([{opacity:1, transform:'scale(1)'}, {opacity:1, transform:'scale(' + (fort ? 2.4 : 1.7) + ')', offset:.3}, {opacity:.6, transform:'scale(1)'}], {duration:fort ? 700 : 450, easing:'ease-out'});
};

/* des runes (petits signes gravés), en SVG pour ne dépendre d'aucune police */
var RUNES = ['M-6 8 L 0 -8 L 6 8 M-3 2 L 3 2', 'M-4 -8 L -4 8 M-4 -8 L 5 -3 L -4 2', 'M0 -8 L 0 8 M-6 -4 L 6 4 M6 -4 L -6 4', 'M-6 -6 L 6 6 M-6 6 L 6 -6 M0 -8 L 0 8', 'M-5 -8 L -5 8 M-5 0 L 5 -8 M-5 0 L 5 8', 'M0 -8 L 6 0 L 0 8 L -6 0 Z'];
function rune(i, c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible;filter:drop-shadow(0 0 3px ' + c + ') drop-shadow(0 0 6px ' + c + ')"><path d="' + RUNES[i % RUNES.length] + '" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function cercleRunes(t, id){
  var s = '<svg viewBox="-60 -60 120 120" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible;filter:drop-shadow(0 0 4px #8ff3ff) drop-shadow(0 0 10px #3fd0ff)">' +
    '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#e8fdff" stop-opacity=".55"/><stop offset=".6" stop-color="#3fd0ff" stop-opacity=".15"/><stop offset="1" stop-color="#3fd0ff" stop-opacity="0"/></radialGradient></defs>' +
    '<circle r="56" fill="url(#' + id + ')"/><circle r="50" fill="none" stroke="#bff8ff" stroke-width="2.4"/><circle r="40" fill="none" stroke="#8ff3ff" stroke-width="1.4" stroke-dasharray="4 5"/>' +
    '<g style="transform-origin:0 0;animation:haTourne 1.6s linear infinite">';
  for(var k = 0; k < 8; k++){ var a = k * 45; s += '<g transform="rotate(' + a + ') translate(0 -45) scale(.42)"><path d="' + RUNES[k % RUNES.length] + '" fill="none" stroke="#e8fdff" stroke-width="3" stroke-linecap="round"/></g>'; }
  s += '</g><g style="transform-origin:0 0;animation:haTourneR 2.4s linear infinite"><path d="M0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill="none" stroke="#e8fdff" stroke-width="2"/><circle r="7" fill="#e8fdff"/></g></svg>';
  return s;
}

/* ---------- le sort : bâton en avant, cercle de runes, un éclat de lumière qui éclate en étoile ---------- */
H.sort = function(scene, to, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde();
    var c0 = this.rep('cristal', scene), alpha = Math.max(-40, Math.min(30, Math.atan2(to.y - c0.y, to.x - c0.x) * DEG));
    var base = {pA:[100, 272], pB:[160, 272]};
    var leve = copie(g, copie(base, {bassin:{y:6, r:-2}, torse:-6, tete:-10, mB:[136, 70], hB:-14, mA:[176, 120], hA:-70}));
    var pointe = copie(g, copie(base, {bassin:{x:4, y:10, r:2}, torse:6, tete:-6, mB:[176, 76], hB:28 + alpha * 0.4, sB:1.1, mA:[110, 150], hA:-10}));
    var recul = copie(pointe, {bassin:{x:-2, y:10, r:-2}, torse:0, tete:-8, mB:[166, 72], hB:14 + alpha * 0.4, sB:1.04});
    var vole, cercle;
    this.expr('colere');
    return this.jouer([
      {d:280, p:leve, e:'io', f:function(){ me.cristalFlash(true); var p = me.rep('cristal'); scintille(me.fx, p.x, p.y, {n:6, rx:18, ry:18, c:[CYAN, '#fff'], etale:150}); }},
      {d:180, p:pointe, e:'oo', f:function(){ me.expr('cri'); cercle = me._cercle(scene); }},
      {d:260, p:pointe, e:'lin', f:function(){
        var a = me.rep('cristal', scene);
        vole = me._eclair(scene, a, to, opt).then(sig);
        me.cristalFlash(true);
      }},
      {d:120, p:recul, e:'o'}, {d:300, p:recul, e:'lin', f:function(){ me.expr('garde'); }},
      {d:420, p:g, e:'io'}
    ]).then(function(){ return vole; });
  });
};
H._cercle = function(scene){
  var L = couche(scene), p = this.rep('cristal', scene), e = div(L, '', cercleRunes(62, 'hcr' + (++uid)));
  var me = this, vivant = true;
  (function suit(){ if(!vivant) return; var q = me.rep('cristal', scene); e.style.left = (q.x - p.x) + 'px'; e.style.top = (q.y - p.y) + 'px'; requestAnimationFrame(suit); })();
  return jouerEl(e, [{transform:place(p.x + 8, p.y, -90, 0), opacity:0}, {transform:place(p.x + 14, p.y, 0, 1.15), opacity:1, offset:.25}, {transform:place(p.x + 14, p.y, 40, 1), opacity:1, offset:.7}, {transform:place(p.x + 20, p.y, 90, 1.6), opacity:0}],
    {duration:820, easing:'ease-out'}).then(function(){ vivant = false; });
};
H._eclair = function(scene, a, to, opt){
  var L = couche(scene), dist = Math.hypot(to.x - a.x, to.y - a.y), ang = Math.atan2(to.y - a.y, to.x - a.x) * DEG;
  /* le rayon : un trait de lumière qui file */
  var r = div(L, 'width:' + dist + 'px;height:10px;border-radius:6px;transform-origin:0 50%;background:linear-gradient(90deg,rgba(143,243,255,0),rgba(191,248,255,.9) 70%,#fff);filter:blur(1px);box-shadow:0 0 14px #3fd0ff');
  jouerEl(r, [{transform:'translate(' + a.x + 'px,' + (a.y - 5) + 'px) rotate(' + ang + 'deg) scaleX(0) scaleY(1)', opacity:1}, {transform:'translate(' + a.x + 'px,' + (a.y - 5) + 'px) rotate(' + ang + 'deg) scaleX(1) scaleY(1)', opacity:1, offset:.45},
    {transform:'translate(' + a.x + 'px,' + (a.y - 5) + 'px) rotate(' + ang + 'deg) scaleX(1) scaleY(.15)', opacity:0}], {duration:420, easing:'ease-out'});
  var o = div(L, 'width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#fff 0,#fff 30%,#bff8ff 50%,rgba(63,208,255,0) 72%);box-shadow:0 0 18px #8ff3ff,0 0 34px #3fd0ff');
  var last = 0;
  return voler(o, a, to, {d:Math.max(150, Math.min(240, dist * 0.35)), haut:dist * 0.06, chaque:function(p){
    var n = performance.now(); if(n - last < 14) return; last = n;
    gerbe(L, p.x, p.y, {n:2, c:['#e8fdff', CYAN, '#fff'], angle:ang + 180, ecart:40, v0:20, v1:90, g:0, t0:2.5, t1:4.5, d0:250, d1:450});
  }}).then(function(res){
    o.remove();
    var st = div(L, 'width:120px;height:120px', '<svg viewBox="-60 -60 120 120" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 6px #8ff3ff) drop-shadow(0 0 16px #3fd0ff)"><path d="M0 -58 L 9 -9 L 58 0 L 9 9 L 0 58 L -9 9 L -58 0 L -9 -9 Z" fill="#e8fdff"/><path d="M0 -34 L 6 -6 L 34 0 L 6 6 L 0 34 L -6 6 L -34 0 L -6 -6 Z" fill="#fff" transform="rotate(45)"/><circle r="10" fill="#fff"/></svg>');
    jouerEl(st, [{transform:place(to.x, to.y, 0, 0.1), opacity:1}, {transform:place(to.x, to.y, 20, 1.1), opacity:1, offset:.3}, {transform:place(to.x, to.y, 45, 1.4), opacity:0}], {duration:560, easing:'ease-out'});
    onde(L, to.x, to.y, {css:'background:radial-gradient(circle,#fff,rgba(191,248,255,.7) 35%,rgba(63,208,255,0) 70%)', w:80, s0:0.3, s1:1.6, d:420});
    onde(L, to.x, to.y, {w:60, c:CYAN, ep:3, s0:0.3, s1:2.8, d:600});
    gerbe(L, to.x, to.y, {n:16, c:['#fff', CYAN, '#bff8ff'], v0:100, v1:260, g:60, forme:'trait', t0:8, t1:16, d0:300, d1:550});
    scintille(L, to.x, to.y, {n:8, rx:50, ry:40, c:['#e8fdff', CYAN], etale:300});
    if(opt.onImpact) try { opt.onImpact(res); } catch(err){ console.error(err); }
    return res;
  });
};

/* ---------- le bouclier : runes qui montent, un dôme de runes sur l'allié ---------- */
H.bouclier = function(scene, cible, opt){
  opt = opt || {};
  var me = this, L = couche(scene), bq = {}, pret;
  var p = this._file(function(sig){
    var g = this.garde(), base = {pA:[102, 272], pB:[156, 272]};
    var leve = copie(g, copie(base, {bassin:{y:2}, torse:-4, tete:-12, mB:[150, 74], hB:0, mA:[178, 66], hA:-160}));
    var haut = copie(leve, {bassin:{y:-2}, torse:-6, tete:-14, mB:[150, 66], mA:[180, 60]});
    this.expr('colere');
    return this.jouer([
      {d:300, p:leve, e:'io', f:function(){ me.cristalFlash(true); me.expr('cri'); var q = me.rep('baton-bas'); onde(me.fx, q.x, q.y, {w:120, h:26, c:CYAN, ep:3, s0:0.2, s1:1.4, d:800}); me._runesMontent(); }},
      {d:200, p:haut, e:'b'},
      {d:260, p:haut, e:'lin', f:function(){ bq = me._dome(L, scene, cible, opt); sig(bq); }},
      {d:420, p:g, e:'io', f:function(){ me.expr('content'); }},
      {d:300, p:g, e:'lin', f:function(){ me.expr('garde'); }}
    ]);
  });
  pret = p;
  p.absorber = function(n){ return pret.then(function(b){ return b.absorber(n); }); };
  p.retirer = function(){ return pret.then(function(b){ return b.retirer(); }); };
  return p;
};
H._runesMontent = function(){
  var q = this.rep('baton-bas'), me = this;
  for(var k = 0; k < 9; k++) (function(k){
    var x = q.x - 70 + k * 16 + alea(-6, 6), e = div(me.fx, '', rune(k, k % 2 ? CYAN : '#e8fdff', alea(12, 18)));
    jouerEl(e, [{transform:place(x, q.y, 0, 0.4), opacity:0}, {transform:place(x + alea(-6, 6), q.y - 40, 0, 1), opacity:1, offset:.25}, {transform:place(x + alea(-10, 10), q.y - 150 - alea(0, 40), 0, 0.8), opacity:0}],
      {duration:alea(800, 1100), delay:k * 40, easing:'ease-out', fill:'backwards'});
  })(k);
};
/* la forme du dôme, en pixels de sa boîte (w × h) */
function domeChemin(w, h){
  function X(x){ return r1((x + 55) * w / 110); } function Y(y){ return r1(y * h / 104); }
  return 'M' + X(-50) + ' ' + Y(100) + ' C ' + X(-50) + ' ' + Y(30) + ' ' + X(-28) + ' ' + Y(4) + ' ' + X(0) + ' ' + Y(4) + ' C ' + X(28) + ' ' + Y(4) + ' ' + X(50) + ' ' + Y(30) + ' ' + X(50) + ' ' + Y(100) + ' Z';
}
H._dome = function(L, scene, cible, opt){
  var R = scene.getBoundingClientRect(), k = (R.width / (scene.offsetWidth || R.width)) || 1, r = cible.getBoundingClientRect();
  var w = r.width / k * 0.95, h = r.height / k * 0.92, x = (r.left - R.left) / k + r.width / k / 2, yb = (r.bottom - R.top) / k - 4;
  var id = 'hdm' + (++uid);
  var e = document.createElement('div'); e.className = 'ha-dome';
  e.style.cssText = 'left:' + (x - w / 2) + 'px;top:' + (yb - h) + 'px;width:' + w + 'px;height:' + h + 'px;transform-origin:50% 100%';
  var mot6 = '';
  for(var i = 0; i < 10; i++){ var a = Math.PI * (0.08 + 0.84 * i / 9), rx = Math.cos(a) * 46, ry = -Math.sin(a) * 92; mot6 += '<g transform="translate(' + r1(rx) + ' ' + r1(ry + 100) + ') scale(.38)"><path d="' + RUNES[i % RUNES.length] + '" fill="none" stroke="#e8fdff" stroke-width="3.4" stroke-linecap="round"/></g>'; }
  e.innerHTML = '<svg viewBox="-55 0 110 104" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">' +
    '<defs><radialGradient id="' + id + '" cx=".5" cy=".95" r=".9"><stop offset="0" stop-color="#3fd0ff" stop-opacity=".05"/><stop offset=".7" stop-color="#8ff3ff" stop-opacity=".18"/><stop offset="1" stop-color="#e8fdff" stop-opacity=".55"/></radialGradient>' +
    '<pattern id="' + id + 'p" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0 L 9 0 L 12 5.2 L 9 10.4 L 3 10.4 L 0 5.2 Z" fill="none" stroke="#bff8ff" stroke-width=".5" opacity=".55"/></pattern></defs>' +
    '<path d="M-50 100 C -50 30 -28 4 0 4 C 28 4 50 30 50 100 Z" fill="url(#' + id + ')"/>' +
    '<path d="M-50 100 C -50 30 -28 4 0 4 C 28 4 50 30 50 100" fill="none" stroke="#bff8ff" stroke-width="2" style="filter:drop-shadow(0 0 3px #8ff3ff)"/>' +
    '<path d="M-36 30 C -26 14 -14 9 -4 8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>' +
    '<g opacity=".85">' + mot6 + '</g>' +
    '<ellipse cx="0" cy="100" rx="52" ry="6" fill="none" stroke="#8ff3ff" stroke-width="2" stroke-dasharray="5 4" style="filter:drop-shadow(0 0 4px #3fd0ff)"/></svg>' +
    /* le motif d'hexagones qui défile (RAPIDITE.md) : un calque à part, animé en entier ; le dôme, lui, n'est jamais repeint */
    '<div class="ha-hexs" style="position:absolute;inset:0;overflow:hidden;-webkit-clip-path:path(\'' + domeChemin(w, h) + '\');clip-path:path(\'' + domeChemin(w, h) + '\')">' +
    '<svg viewBox="-55 0 110 114.4" preserveAspectRatio="none" class="ha-hex" style="position:absolute;left:0;top:0;width:100%;height:' + r1(h * 1.1) + 'px;overflow:visible;will-change:transform">' +
    '<rect x="-55" y="0" width="110" height="114.4" fill="url(#' + id + 'p)" opacity=".7"/></svg></div>' +
    '<div class="ha-badge">🛡️ −50 % · 1 tour</div>';
  L.appendChild(e);
  var svg = e.querySelector('svg');
  e.animate([{transform:'scale(.2,0)', opacity:0}, {transform:'scale(1.08,1.1)', opacity:1, offset:.6}, {transform:'scale(.97,.96)', offset:.8}, {transform:'scale(1,1)', opacity:1}], {duration:520, easing:'ease-out'});
  var vit = svg.animate([{opacity:.85}, {opacity:1}], {duration:900, iterations:Infinity, direction:'alternate', easing:'ease-in-out'});
  var hex = e.querySelector('.ha-hex'); hex.animate([{transform:'translateY(0px)'}, {transform:'translateY(' + r1(-10.4 * h / 104) + 'px)'}], {duration:1600, iterations:Infinity});
  scintille(L, x, yb - h * 0.5, {n:12, rx:w * 0.45, ry:h * 0.45, c:['#e8fdff', CYAN], etale:400});
  onde(L, x, yb, {w:w * 1.1, h:20, c:CYAN, ep:3, s0:0.3, s1:1.3, d:700});
  var fini = false;
  return {
    el:e,
    absorber:function(n){
      if(fini) return Promise.resolve();
      svg.animate([{filter:'brightness(2.2)'}, {filter:'brightness(1)'}], {duration:420, easing:'ease-out'});
      e.animate([{transform:'scale(1,1)'}, {transform:'scale(1.06,.95)', offset:.25}, {transform:'scale(.98,1.03)', offset:.6}, {transform:'scale(1,1)'}], {duration:420});
      onde(L, x, yb - h * 0.55, {css:'background:radial-gradient(circle,rgba(232,253,255,.8),rgba(143,243,255,0) 70%)', w:w * 0.7, s0:0.3, s1:1.5, d:450});
      gerbe(L, x, yb - h * 0.6, {n:10, c:['#fff', CYAN], v0:60, v1:140, g:100, t0:3, t1:5, d0:300, d1:550});
      return mot(L, x, yb - h - 14, '−' + n + ' absorbé' + (n > 1 ? 's' : ''), {t:22, c:'#bff8ff', lueur:'rgba(63,208,255,.8)', monte:30, d:1300});
    },
    retirer:function(){
      if(fini) return Promise.resolve(); fini = true;
      gerbe(L, x, yb - h * 0.5, {n:22, c:['#e8fdff', '#bff8ff', CYAN], forme:'eclat', v0:80, v1:220, g:500, t0:7, t1:13, d0:500, d1:850, lueur:false});
      scintille(L, x, yb - h * 0.5, {n:8, rx:w * 0.4, ry:h * 0.4, c:['#e8fdff', CYAN], etale:200});
      vit.cancel();
      return e.animate([{transform:'scale(1,1)', opacity:1, filter:'brightness(1)'}, {transform:'scale(1.06,1.04)', opacity:1, filter:'brightness(2)', offset:.25}, {transform:'scale(1.15,.7)', opacity:0, filter:'brightness(1)'}], {duration:380, easing:'ease-in', fill:'forwards'})
        .finished.then(function(){ e.remove(); });
    }
  };
};

/* ---------- étudier : le livre de la ceinture s'ouvre, les pages tournent, une idée s'allume ---------- */
H.etudier = function(){
  return this._file(function(){
    var me = this, g = this.garde(), lC = this.$('[data-livre-ceinture]'), lM = this.$('[data-livre-main]');
    var couv = lM.querySelector('[data-couv]'), pages = lM.querySelectorAll('[data-page]'), lueur = lM.querySelector('[data-lueur-pages]'), halo = lM.querySelector('[data-livre-halo]');
    var base = {pA:[106, 272], pB:[152, 272]};
    var prend = copie(g, copie(base, {bassin:{y:7}, torse:8, tete:6, mA:[150, 156], hA:0}));
    var lit = copie(g, copie(base, {bassin:{y:4}, torse:2, tete:12, mA:[170, 124], hA:0, mB:[128, 150], hB:-14}));
    var lit2 = copie(lit, {tete:9, torse:1, mA:[171, 121]});
    var eureka = copie(g, copie(base, {bassin:{y:0}, torse:-6, tete:-12, mA:[174, 112], hA:0, mB:[132, 138], hB:-10}));
    return this.jouer([
      {d:200, p:prend, e:'io', f:function(){ me.avant('A', true); lC.style.display = 'none'; lM.style.display = ''; couv.style.transform = 'scaleX(0)'; pages.forEach(function(pg){ pg.style.opacity = 0; }); }},
      {d:260, p:lit, e:'io', f:function(){
        me.expr('surpris');
        couv.animate([{transform:'scaleX(0)'}, {transform:'scaleX(1.1)', offset:.7}, {transform:'scaleX(1)'}], {duration:240, easing:'ease-out', fill:'forwards'}).finished.then(function(){ couv.style.transform = 'none'; });
        [].forEach.call(pages, function(pg, i){
          pg.animate([{transform:'scaleX(1)', opacity:1}, {transform:'scaleX(.15) skewY(-6deg)', opacity:1, offset:.45}, {transform:'scaleX(-1)', opacity:1, offset:.9}, {transform:'scaleX(-1)', opacity:0}], {duration:300, delay:240 + i * 170, easing:'ease-in-out', fill:'backwards'});
        });
      }},
      {d:300, p:lit2, e:'io', f:function(){ me.expr('savoir'); lueur.animate([{opacity:0}, {opacity:1}], {duration:300, fill:'forwards'}); halo.animate([{opacity:0}, {opacity:.95}], {duration:300, fill:'forwards'}); me._runesLivre(); }},
      {d:320, p:lit, e:'io'},
      {d:200, p:eureka, e:'b', f0:function(){ me._idee(); me.cristalFlash(true); }},
      {d:380, p:eureka, e:'lin'},
      {d:200, p:prend, e:'io', f0:function(){ me.expr('content'); couv.animate([{transform:'scaleX(1)'}, {transform:'scaleX(0)'}], {duration:160, fill:'forwards'}); lueur.animate([{opacity:1}, {opacity:0}], {duration:160, fill:'forwards'}); halo.animate([{opacity:.95}, {opacity:0}], {duration:160, fill:'forwards'}); },
        f:function(){ lC.style.display = ''; lM.style.display = 'none'; me.avant('A', false); }},
      {d:360, p:g, e:'io', f:function(){ me.expr('garde'); }}
    ]);
  });
};
H._runesLivre = function(){
  var p = this.rep('livre'), me = this;
  for(var k = 0; k < 8; k++){ var e = div(me.fx, '', rune(k + 2, k % 2 ? CYAN : '#e8fdff', alea(9, 14))), x = p.x + alea(-24, 24);
    jouerEl(e, [{transform:place(x, p.y, 0, 0.3), opacity:0}, {transform:place(x + alea(-8, 8), p.y - 30, 0, 1), opacity:1, offset:.3}, {transform:place(x + alea(-16, 16), p.y - 80, 0, 0.7), opacity:0}], {duration:alea(700, 1000), delay:k * 70, easing:'ease-out', fill:'backwards'}); }
};
H._idee = function(){
  var p = this.rep('tete'), id = 'hid' + (++uid);
  var e = div(this.fx, 'width:46px;height:56px', '<svg viewBox="-23 -30 46 56" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 6px #8ff3ff) drop-shadow(0 0 14px #3fd0ff)">' +
    '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#bff8ff"/><stop offset="1" stop-color="#3fd0ff"/></radialGradient></defs>' +
    '<path d="M0 -26 C 14 -26 20 -14 18 -4 C 16 4 10 8 9 14 L -9 14 C -10 8 -16 4 -18 -4 C -20 -14 -14 -26 0 -26 Z" fill="url(#' + id + ')" stroke="#24182e" stroke-width="2.6"/>' +
    '<path d="M-8 16 L 8 16 M-7 20 L 7 20 M-4 24 L 4 24" stroke="#e8c062" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M0 -18 L 0 0" stroke="#24182e" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="7" r="2.8" fill="#24182e"/>' +
    '<path d="M-26 -18 l -6 -4 M26 -18 l 6 -4 M-28 -2 l -7 0 M28 -2 l 7 0 M0 -32 l 0 -6" stroke="#bff8ff" stroke-width="2.4" stroke-linecap="round"/></svg>');
  scintille(this.fx, p.x + 4, p.y - 44, {n:7, rx:30, ry:24, c:['#e8fdff', CYAN], etale:300});
  return jouerEl(e, [{transform:place(p.x + 4, p.y - 26, -20, 0), opacity:0}, {transform:place(p.x + 4, p.y - 52, 8, 1.25), opacity:1, offset:.25}, {transform:place(p.x + 4, p.y - 48, -4, 1), opacity:1, offset:.4},
    {transform:place(p.x + 4, p.y - 54, 2, 1), opacity:1, offset:.8}, {transform:place(p.x + 4, p.y - 64, 0, .8), opacity:0}], {duration:1300, easing:'ease-out'});
};
