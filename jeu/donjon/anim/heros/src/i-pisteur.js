
/* ============ un projectile qui vole de a à b (en cloche si haut > 0), appelé à chaque image ============ */
function voler(el, a, b, o){
  return new Promise(function(res){
    var t0 = null, D = o.d, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 - (o.haut || 0);
    function pos(t){ var u = 1 - t; return {x:u * u * a.x + 2 * u * t * cx + t * t * b.x, y:u * u * a.y + 2 * u * t * cy + t * t * b.y}; }
    function step(now){
      if(t0 === null) t0 = now;
      var t = Math.min(1, (now - t0) / D), te = o.ease ? o.ease(t) : t, p = pos(te), q = pos(Math.min(1, te + 0.01)), r = pos(Math.max(0, te - 0.01));
      var ang = Math.atan2(q.y - r.y, q.x - r.x) * DEG;
      el.style.transform = place(p.x, p.y, o.tourne !== undefined ? (o.r0 || 0) + o.tourne * t : ang, o.s);
      if(o.chaque) o.chaque(p, ang, t);
      if(t < 1) requestAnimationFrame(step); else res({x:p.x, y:p.y, ang:ang});
    }
    requestAnimationFrame(step);
  });
}
function couche(scene){ var c = scene.querySelector(':scope > .ha-fxs'); if(!c){ c = document.createElement('div'); c.className = 'ha-fx ha-fxs'; c.style.zIndex = 5; scene.appendChild(c); } return c; }
var FLECHE_SVG = function(type){
  return '<svg viewBox="-14 -16 150 32" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible">' +
    flecheDessin().replace('data-feu style="display:none"', 'data-feu' + (type === 'feu' ? '' : ' style="display:none"')).replace('data-huile style="display:none"', 'data-huile' + (type === 'huile' ? '' : ' style="display:none"')).replace('data-colle style="display:none"', 'data-colle' + (type === 'colle' ? '' : ' style="display:none"')) + '</svg>';
};

ROLES.pisteur = {
  fab:pisteur,
  garde:{racine:{}, bassin:{y:8}, torse:4, tete:-4, pA:[98, 272], pB:[162, 272], mA:[190, 158], hA:16, mB:[126, 168], hB:10, arc:{}},
  gardeChoisi:{racine:{}, bassin:{y:3}, torse:0, tete:-8, pA:[104, 272], pB:[158, 272], mA:[184, 136], hA:-2, mB:[128, 160], hB:10, arc:{}},
  joie:{mA:[166, 32], hA:-20, mB:[96, 34], hB:-170, cB:-1},
  course:function(p, f){ p.brasA = -40 - 16 * Math.cos(2 * Math.PI * f); p.avantBrasA = -50; p.mainA = 40; },
  frein:function(p){ p.brasA = -96; p.avantBrasA = -10; p.mainA = 70; },
  init:function(){
    this.cordeEl = this.$('[data-corde]'); this.flG = this.$('[data-fleche]'); this.flI = this.$('[data-fl]');
    /* les repères de l'encoche et de la pointe sont dans le dessin de la flèche encochée */
    this.reps.flN = this.flI.querySelector('[data-r="flN"]'); this.reps.flP = this.flI.querySelector('[data-r="flP"]');
    this.corde = {mode:'libre', vib:0, ph:0, fl:0, blend:0};
  },
  /* (lu avant toute écriture de l'image : voir tick) */
  lire:function(){ var R = this.reps; [this.cordeEl, R.arcH, R.arcB, R.pince].forEach(mat); if(this.corde.fl) mat(R.poignee); },
  /* la corde et la flèche encochée, recalculées à chaque image */
  pas:function(dt){
    var c = this.corde, Mi = inv(mat(this.cordeEl));
    function loc(r){ var m = mat(r), cx = +r.getAttribute('cx'), cy = +r.getAttribute('cy'), p = ap(m, cx, cy); return ap(Mi, p[0], p[1]); }
    var h = loc(this.reps.arcH), b = loc(this.reps.arcB), pi = loc(this.reps.pince), d;
    if(c.mode === 'tire') d = 'M' + r1(h[0]) + ' ' + r1(h[1]) + ' L ' + r1(pi[0]) + ' ' + r1(pi[1]) + ' L ' + r1(b[0]) + ' ' + r1(b[1]);
    else {
      c.ph += dt * 2 * Math.PI * 15; c.vib *= Math.exp(-dt * 6);
      var mx = (h[0] + b[0]) / 2, my = (h[1] + b[1]) / 2, dx = b[0] - h[0], dy = b[1] - h[1], l = Math.hypot(dx, dy) || 1, o = c.vib * Math.sin(c.ph);
      d = 'M' + r1(h[0]) + ' ' + r1(h[1]) + ' Q ' + r1(mx - dy / l * o * 2) + ' ' + r1(my + dx / l * o * 2) + ' ' + r1(b[0]) + ' ' + r1(b[1]);
    }
    this.cordeEl.setAttribute('d', d);
    this.cordeEl.setAttribute('stroke-width', c.vib > 0.6 ? 1.4 : 1.8);
    if(c.fl){
      var g = loc(this.reps.poignee), mh = mat(this.reps.pince), ax = Mi[0] * mh[0] + Mi[2] * mh[1], ay = Mi[1] * mh[0] + Mi[3] * mh[1];
      var aMain = -100, aEnc = Math.atan2(g[1] - pi[1], g[0] - pi[0]) * DEG;
      var a = aMain + norm(aEnc - aMain) * c.blend;
      this.flG.style.display = '';
      if(this.cuit) this.flI.style.transform = 'translate(' + r1(pi[0]) + 'px,' + r1(pi[1]) + 'px) rotate(' + r1(a) + 'deg)';
      else this.flI.setAttribute('transform', 'translate(' + r1(pi[0]) + ' ' + r1(pi[1]) + ') rotate(' + r1(a) + ')');
    } else this.flG.style.display = 'none';
  },
  /* en attendant : il vérifie sa corde, ou jette un œil au carquois */
  geste:function(ok){
    var me = this, g = this.garde(), c = this.corde;
    if(Math.random() < 0.7){
      var tient = {}; for(var k in g) tient[k] = g[k];
      tient.mA = [196, 142]; tient.hA = 10; tient.tete = 6; tient.torse = 4;
      var pince = {}; for(k in tient) pince[k] = tient[k]; pince.mB = [166, 156]; pince.hB = -60; pince.sB = 1.06;
      var tire = {}; for(k in pince) tire[k] = pince[k]; tire.mB = [154, 154];
      return this.jouer([{d:380, p:tient, e:'io'}, {d:260, p:pince, e:'io'}, {d:160, p:tire, e:'io', f0:function(){ if(ok()) c.mode = 'tire'; }},
        {d:60, p:pince, e:'oo', f0:function(){ c.mode = 'libre'; c.vib = 5; }}, {d:420, p:pince, e:'lin'}, {d:200, p:tire, e:'io', f0:function(){ if(ok()){ c.mode = 'tire'; } }},
        {d:60, p:pince, e:'oo', f0:function(){ c.mode = 'libre'; c.vib = 4; }}, {d:300, p:pince, e:'lin', f:function(){ if(ok()) me.cligner(); }}, {d:420, p:g, e:'io'}]).then(function(){ c.mode = 'libre'; });
    }
    var regarde = {}; for(var k2 in g) regarde[k2] = g[k2];
    regarde.tete = -14; regarde.torse = -2; regarde.mB = [96, 86]; regarde.hB = -150;
    return this.jouer([{d:420, p:regarde, e:'io'}, {d:300, p:regarde, e:'lin'}, {d:420, p:g, e:'io'}]);
  },
  arret:function(){ this.corde.mode = 'libre'; }
};

/* ---------- le tir à l'arc ---------- */
H.tirer = function(scene, to, type, opt){
  if(typeof type === 'object'){ opt = type; type = opt.type; }
  type = type || 'normale'; opt = opt || {};
  var me = this;
  return this._file(function(sig){
    var c = this.corde, g = this.garde();
    var p0 = this.rep('poignee', scene), alpha = Math.max(-35, Math.min(30, Math.atan2(to.y - p0.y, to.x - p0.x) * DEG));
    var tor = 2 + alpha * 0.3, al = alpha - tor, ar = al / DEG;
    var S = SQ.brasA, bras = [S[0] + 71 * Math.cos(ar), S[1] + 71 * Math.sin(ar)];
    var base = {racine:{}, bassin:{y:9, r:-2}, pA:[96, 272], pB:[164, 272]};
    function P(o){ var p = {}; for(var k in base) p[k] = base[k]; for(k in o) p[k] = o[k]; return p; }
    var cherche = P({torse:-4, tete:-10, mA:[176, 146], hA:-10, mB:[92, 54], hB:-150, cB:1, arc:{}});
    var encoche = P({torse:tor - 2, tete:-2, mA:[S[0] + 60 * Math.cos(ar), S[1] + 6 + 60 * Math.sin(ar)], hA:al, mB:[152, 128], hB:al - 20, arc:{}});
    var bande = P({torse:tor - 3, tete:-1 + al * 0.4, mA:bras, hA:al, mB:[120, 98], sB:1.12, cB:-1, hB:al - 10, arc:{sx:1.2, sy:0.95}});
    var tremble = P({torse:tor - 3.4, tete:-1.3 + al * 0.4, mA:[bras[0] - 0.6, bras[1] + 0.4], hA:al, mB:[118, 98], sB:1.14, cB:-1, hB:al - 10, arc:{sx:1.22, sy:0.945}});
    var lache = P({bassin:{x:-2, y:10, r:-3}, torse:tor - 7, tete:-3 + al * 0.4, mA:[bras[0] - 2, bras[1] - 1], hA:al - 4, mB:[86, 92], sB:1.1, cB:-1, hB:-150, arc:{sx:0.93, sy:1.02}});
    var suite = P({torse:tor - 5, tete:-2 + al * 0.4, mA:bras, hA:al, mB:[84, 96], cB:-1, hB:-160, arc:{sx:1.03, sy:0.99}});
    var suite2 = P({torse:tor - 5, tete:-2 + al * 0.4, mA:bras, hA:al, mB:[84, 98], cB:-1, hB:-160, arc:{}});
    this.expr('vise');
    var tween = function(ms, f){ var t0 = performance.now(); (function s(n){ var t = Math.min(1, (n - t0) / ms); f(t); if(t < 1) requestAnimationFrame(s); })(t0); };
    var vole;
    return this.jouer([
      {d:240, p:cherche, e:'io', f:function(){ c.fl = 1; c.blend = 0; me._typeFleche(type); }},
      {d:90, p:cherche, e:'lin'},
      {d:280, p:encoche, e:'io', f0:function(){ tween(240, function(t){ c.blend = t * t; }); }, f:function(){ c.mode = 'tire'; c.blend = 1; }},
      {d:400, p:bande, e:'cubic-bezier(.5,0,.35,1)', f0:function(){ me.expr('effort'); }},
      {d:110, p:tremble, e:'io'}, {d:110, p:bande, e:'io'}, {d:90, p:tremble, e:'io'},
      {d:60, p:lache, e:'oo', f0:function(){
        var n = me.rep('flN', scene), t = me.rep('flP', scene);
        c.mode = 'libre'; c.vib = 9; c.fl = 0;
        vole = me._fleche(scene, n, t, to, type, opt).then(sig);
      }},
      {d:120, p:suite, e:'o', f0:function(){ me.expr('cri'); }}, {d:200, p:suite2, e:'io'}, {d:120, p:suite2, e:'lin'},
      {d:420, p:g, e:'b', f0:function(){ me.expr('garde'); }}
    ]).then(function(){ return vole; });
  });
};
H._typeFleche = function(type){
  ['feu', 'huile', 'colle'].forEach(function(t){ var e = this.$('[data-fleche] [data-' + t + ']'); if(e) e.style.display = t === type ? '' : 'none'; }, this);
};
H._fleche = function(scene, n, t, to, type, opt){
  var L = couche(scene), len = Math.hypot(t.x - n.x, t.y - n.y), k = len / 124;
  var w = div(L, 'width:0;height:0;z-index:3');
  var tr = div(w, 'left:' + (-len - 70 * k) + 'px;top:' + (-2.5 * k) + 'px;width:' + (len * 0.9) + 'px;height:' + (5 * k) + 'px;border-radius:3px;background:linear-gradient(90deg,rgba(255,255,255,0),' +
    ({feu:'rgba(255,150,50,.75)', huile:'rgba(90,70,40,.5)', colle:'rgba(230,245,210,.7)'}[type] || 'rgba(255,250,220,.6)') + ');filter:blur(1px)');
  tr.style.transform = 'none';
  var a = div(w, 'left:' + (-len - 14 * k) + 'px;top:' + (-16 * k) + 'px;width:' + (150 * k) + 'px;height:' + (32 * k) + 'px', FLECHE_SVG(type));
  a.style.transform = 'none';
  if(type === 'feu'){ var fe = a.querySelector('[data-feu]'); fe.style.transformBox = 'fill-box'; fe.style.transformOrigin = '30% 70%'; fe.animate([{transform:'scale(1,1)'}, {transform:'scale(1.25,.85)'}, {transform:'scale(.9,1.2)'}], {duration:120, iterations:Infinity, direction:'alternate'}); }
  var dist = Math.hypot(to.x - t.x, to.y - t.y), D = Math.max(220, Math.min(560, dist / 1.5)), last = 0;
  var me = this;
  return voler(w, t, to, {d:D, haut:dist * 0.06, chaque:function(p, ang, u){
    var now = performance.now(); if(now - last < 16) return; last = now;
    var bx = p.x - Math.cos(ang / DEG) * len * 0.6, by = p.y - Math.sin(ang / DEG) * len * 0.6;
    if(type === 'feu'){
      gerbe(L, p.x - Math.cos(ang / DEG) * 8, p.y - Math.sin(ang / DEG) * 8, {n:3, c:['#ffd84a', '#ff8a2a', '#ff5a1a'], angle:ang + 180, ecart:30, v0:20, v1:80, g:-160, t0:3, t1:7, d0:250, d1:500});
      if(Math.random() < 0.5) onde(L, bx, by, {css:'background:radial-gradient(circle,rgba(60,40,50,.45),rgba(60,40,50,0) 70%)', w:14, s0:0.6, s1:2.4, d:600});
    } else if(type === 'huile'){
      gerbe(L, p.x - Math.cos(ang / DEG) * 6, p.y + 4, {n:1, c:'#2a2014', angle:90, ecart:20, v0:10, v1:40, g:700, t0:4, t1:6, d0:400, d1:600, lueur:false});
      if(Math.random() < 0.4) gerbe(L, p.x, p.y + 4, {n:1, c:'#6a5a30', angle:90, ecart:10, v0:10, v1:30, g:700, t0:2, t1:3, d0:400, d1:500, lueur:false});
    } else if(type === 'colle'){
      if(Math.random() < 0.6){
        var f = div(L, 'width:' + alea(16, 26) + 'px;height:2px;border-radius:2px;background:#eef6dc;box-shadow:0 0 3px #fff');
        jouerEl(f, [{transform:place(bx, by, ang + alea(-20, 20), 1), opacity:.9}, {transform:place(bx - 6, by + 14, ang + alea(-60, 60), 0.6) + ' scaleY(1)', opacity:0}], {duration:alea(380, 600), easing:'ease-in'});
      }
      gerbe(L, p.x, p.y, {n:1, c:'#f2f8e4', angle:90, ecart:30, v0:10, v1:30, g:500, t0:3, t1:5, d0:400, d1:600});
    } else if(u > 0.05 && Math.random() < 0.6) gerbe(L, bx, by, {n:1, c:'#fff6d0', angle:ang + 180, ecart:20, v0:10, v1:40, g:0, t0:2, t1:3, d0:200, d1:350});
  }}).then(function(r){
    me._impactFleche(L, r, type, w, a, tr, k);
    if(opt.onImpact) try { opt.onImpact(r); } catch(e){ console.error(e); }
    return r;
  });
};
H._impactFleche = function(L, r, type, w, a, tr, k){
  tr.animate([{opacity:1}, {opacity:0}], {duration:120, fill:'forwards'});
  /* la flèche reste plantée un instant et vibre */
  var ang = r.ang;
  w.animate([{transform:place(r.x, r.y, ang)}, {transform:place(r.x + 2, r.y, ang - 6)}, {transform:place(r.x + 1, r.y, ang + 4)}, {transform:place(r.x + 1, r.y, ang - 2)}, {transform:place(r.x + 1, r.y, ang)}], {duration:360, fill:'forwards'});
  w.animate([{opacity:1}, {opacity:1, offset:.75}, {opacity:0}], {duration:900, fill:'forwards'}).finished.then(function(){ w.remove(); });
  if(type === 'feu'){
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#fff6c0,#ffb040 35%,rgba(255,90,20,.6) 55%,rgba(255,60,20,0) 72%)', w:70, s0:0.2, s1:1.9, d:520});
    onde(L, r.x, r.y, {w:50, c:'#ff9a3a', ep:4, s0:0.3, s1:2.6, d:500});
    gerbe(L, r.x, r.y, {n:22, c:['#ffe36a', '#ff9a2a', '#ff5a1a', '#fff'], v0:60, v1:220, g:-120, t0:4, t1:9, d0:400, d1:900});
    for(var i = 0; i < 4; i++) onde(L, r.x + alea(-14, 14), r.y - 10 - i * 8, {css:'background:radial-gradient(circle,rgba(60,40,55,.55),rgba(60,40,55,0) 70%)', w:30, s0:0.5, s1:2.6, d:900, retard:150 + i * 80});
  } else if(type === 'huile'){
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#3a2c18,#2a2010 50%,rgba(40,30,15,0) 72%)', w:56, h:40, s0:0.3, s1:1.5, d:700, o0:0.95});
    gerbe(L, r.x, r.y, {n:16, c:['#2a2014', '#4a3a20', '#6a5a30'], angle:-90, ecart:80, v0:80, v1:200, g:700, t0:4, t1:8, d0:450, d1:750, lueur:false});
    gerbe(L, r.x, r.y, {n:5, c:'#d8c890', angle:-90, ecart:80, v0:60, v1:150, g:600, t0:2, t1:3, d0:400, d1:600});
  } else if(type === 'colle'){
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#ffffff,#eef6dc 45%,rgba(220,240,200,0) 72%)', w:60, s0:0.3, s1:1.4, d:900, o0:0.95});
    for(var j = 0; j < 7; j++){
      var an = alea(0, 360), ln = alea(22, 40), f = div(L, 'width:' + ln + 'px;height:3px;border-radius:3px;background:#eef6dc;box-shadow:0 0 4px #fff;transform-origin:0 50%');
      jouerEl(f, [{transform:'translate(' + r.x + 'px,' + r.y + 'px) rotate(' + an + 'deg) scaleX(0)', opacity:1}, {transform:'translate(' + r.x + 'px,' + r.y + 'px) rotate(' + (an + 8) + 'deg) scaleX(1)', opacity:1, offset:.3},
        {transform:'translate(' + r.x + 'px,' + (r.y + 10) + 'px) rotate(' + (an + 20) + 'deg) scaleX(.9)', opacity:0}], {duration:alea(800, 1100), easing:'ease-out'});
    }
    gerbe(L, r.x, r.y, {n:10, c:'#f4faea', v0:40, v1:120, g:400, t0:3, t1:6, d0:500, d1:800});
  } else {
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#fff,rgba(255,240,180,.6) 40%,rgba(255,240,180,0) 70%)', w:46, s0:0.2, s1:1.5, d:300});
    gerbe(L, r.x, r.y, {n:12, c:['#fff', '#ffe08a'], angle:ang + 180, ecart:70, v0:90, v1:240, g:300, forme:'trait', t0:8, t1:14, d0:220, d1:420});
  }
};

/* ---------- le coup de dague ---------- */
H.dague = function(scene, to, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde();
    var pied = this.rep('chevilleB', scene), pBoite = this.rep('chevilleB');
    var dx = Math.max(0, to.x - pied.x - 56), dy = 0;
    var dagueC = this.$('[data-dague-ceinture]'), dagueM = this.$('[data-dague-main]');
    var base = {racine:{}, pA:[98, 272], pB:[162, 272]};
    function P(o){ var p = {}; for(var k in base) p[k] = base[k]; for(var k2 in o) p[k2] = o[k2]; return p; }
    var prend = P({bassin:{y:12}, torse:10, tete:0, mA:[172, 150], hA:-4, mB:[150, 150], hB:-90, arc:{}});
    var tasse = P({bassin:{y:30, x:-4}, torse:22, tete:-8, pA:[92, 272], pB:[168, 272], mA:[150, 166], hA:-10, mB:[84, 132], hB:-170, arc:{}});
    var saute = {racine:{y:-30}, bassin:{y:-4}, torse:18, tete:-12, pA:[98, 250], fA:30, pB:[176, 246], fB:-10, mA:[130, 150], hA:-30, mB:[90, 60], cB:1, hB:-150};
    var frappe = {racine:{y:0}, bassin:{y:20, x:6}, torse:28, tete:-4, pA:[86, 272], pB:[176, 272], mA:[120, 160], hA:-20, mB:[198, 150], hB:-20, sB:1.12};
    var tient = {racine:{y:0}, bassin:{y:18, x:6}, torse:24, tete:-2, pA:[86, 272], pB:[176, 272], mA:[124, 160], hA:-20, mB:[196, 160], hB:-10, sB:1.08};
    var recule = {racine:{y:-26}, bassin:{y:-2}, torse:-12, tete:-6, pA:[92, 250], fA:20, pB:[150, 252], fB:10, mA:[176, 130], hA:-6, mB:[150, 120], hB:-40};
    var atterrit = P({bassin:{y:22}, torse:12, tete:-4, mA:[176, 150], hA:-4, mB:[150, 146], hB:-60});
    var range = P({bassin:{y:10}, torse:6, tete:-4, mA:[178, 150], hA:-4, mB:[150, 150], hB:-90});
    var tT = 0, tJ = 300;
    return this.jouer([
      {d:200, p:prend, e:'io', f:function(){ dagueC.style.display = 'none'; dagueM.style.display = ''; me.expr('colere'); }},
      {d:200, p:tasse, e:'io', f:function(){ me.expr('cri'); me.boite.animate([{transform:'translate(0px,0px)'}, {transform:'translate(' + dx + 'px,0px)'}], {duration:tJ, easing:'cubic-bezier(.3,.45,.45,1)', fill:'forwards'}); }},
      {d:tJ * 0.55, p:saute, e:'o'}, {d:tJ * 0.45, p:frappe, e:'i', f0:function(){ me.plus(tJ * 0.2, function(){ me._lame(scene, to); }); }, f:function(){
        me._impactDague(scene, to); sig(to); if(opt.onImpact) try { opt.onImpact(to); } catch(e){ console.error(e); }
      }},
      {d:180, p:tient, e:'o'},
      {d:330, p:recule, e:'o', f0:function(){ me.expr('garde'); var a = me.boite.getAnimations(); me.boite.animate([{transform:'translate(' + dx + 'px,0px)'}, {transform:'translate(0px,0px)'}], {duration:330, easing:'cubic-bezier(.3,.6,.4,1)', fill:'forwards'}).finished.then(function(){ a.concat(me.boite.getAnimations()).forEach(function(x){ x.cancel(); }); }); }},
      {d:160, p:atterrit, e:'i', f:function(){ me._poussiere(); }},
      {d:240, p:range, e:'io', f:function(){ dagueC.style.display = ''; dagueM.style.display = 'none'; }},
      {d:380, p:g, e:'b'}
    ]);
  });
};
/* le croissant de lumière de la lame */
H._lame = function(scene, to){
  var L = couche(scene), id = 'hal' + (++uid);
  var e = div(L, 'width:160px;height:160px', '<svg viewBox="-80 -80 160 160" style="width:100%;height:100%;overflow:visible"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#e8fdff"/><stop offset="1" stop-color="#8ff3ff"/></linearGradient></defs>' +
    '<path d="M-52 -46 A 70 70 0 0 1 40 50 A 62 62 0 0 0 -52 -46 Z" fill="url(#' + id + ')" style="filter:drop-shadow(0 0 6px #8ff3ff) drop-shadow(0 0 2px #fff)"/>' +
    '<path d="M-44 -40 A 62 62 0 0 1 34 44" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.12s" fill="freeze"/></path></svg>');
  jouerEl(e, [{transform:place(to.x - 8, to.y - 6, -30, 0.7), opacity:0}, {transform:place(to.x - 4, to.y - 4, 0, 1), opacity:1, offset:.25}, {transform:place(to.x, to.y, 18, 1.08), opacity:0}], {duration:360, easing:'ease-out'});
};
H._impactDague = function(scene, to){
  var L = couche(scene);
  onde(L, to.x, to.y, {css:'background:radial-gradient(circle,#fff,rgba(200,250,255,.7) 35%,rgba(150,240,255,0) 70%)', w:60, s0:0.3, s1:1.6, d:320});
  onde(L, to.x, to.y, {w:40, c:'#bff8ff', ep:3, s0:0.3, s1:2.2, d:420});
  gerbe(L, to.x, to.y, {n:14, c:['#fff', '#bff8ff', '#ffe08a'], angle:30, ecart:80, v0:120, v1:280, g:400, forme:'trait', t0:8, t1:16, d0:220, d1:420});
};
