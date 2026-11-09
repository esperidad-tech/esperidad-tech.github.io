
/* ============ l'Alchimiste : rôle ============ */
ROLES.alchimiste = {
  fab:alchimiste, bouche:'sourire',
  garde:{racine:{}, bassin:{y:9}, torse:6, tete:-4, pA:[96, 272], pB:[160, 272], mA:[184, 132], hA:-84, mB:[128, 138], hB:0, marmite:0},
  gardeChoisi:{racine:{}, bassin:{y:4}, torse:1, tete:-8, pA:[100, 272], pB:[156, 272], mA:[186, 124], hA:-80, mB:[130, 128], hB:0, marmite:0},
  joie:{mA:[178, 44], hA:-150, mB:[98, 30], hB:0},
  course:function(p, f){ p.brasB = -60 + 18 * Math.cos(2 * Math.PI * f); p.avantBrasB = -70; p.mainB = 130; },
  frein:function(p){ p.brasB = -20; p.avantBrasB = -100; p.mainB = 120; },
  init:function(){
    this.fioleB = this.$('[data-fiole-b] [data-fiole]'); this.fioleA = this.$('[data-fiole-main] [data-fiole]');
    this.filet = this.$('[data-filet]');
    this._couleur(this.fioleB, '#ff8a3a');
    this._bul = 0;
  },
  idle:function(A){
    var h = this._halo(this.$('[data-fiole-b] [data-halo]'));
    if(h){ h.style.transformBox = 'fill-box'; if(!this.cuit) h.style.transformOrigin = '50% 50%'; A.push(h.animate([{opacity:.45, transform:'scale(.9)'}, {opacity:.85, transform:'scale(1.08)'}], {duration:900, iterations:Infinity, direction:'alternate', easing:'ease-in-out'})); }
  },
  /* cuit, au repos : trois bulles qui montent en boucle dans la fiole (CSS), au lieu d'en fabriquer à chaque instant */
  cuit:function(){
    var g = this.fioleB && this.fioleB.querySelector('[data-bulles]'), c = this.fioleB && this.fioleB.querySelector('[data-r$="c"]');
    if(!g || !c || !g.ownerSVGElement) return;
    var hote = g.ownerSVGElement.parentNode, cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy');
    [[-4, 1.8, 0], [3, 2.2, -.45], [-1, 1.5, -.9]].forEach(function(b){
      var d = window.Cuire.ilot(hote, '<circle cx="' + (cx + b[0]) + '" cy="' + (cy + 10) + '" r="' + b[1] + '" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width=".8"/>', 'ha-calme-seul ha-bulle-boucle');
      d.style.transformOrigin = (cx + b[0]) + 'px ' + (cy + 10) + 'px'; d.style.animationDelay = b[2] + 's';
    });
  },
  lire:function(){ if(this._verse){ mat(this.filet); mat(this.reps[this.fioleA.getAttribute('data-fiole') + 'bec']); mat(this.reps[this.fioleB.getAttribute('data-fiole') + 'bec']); } },
  /* les bulles qui montent dans la fiole (tout le temps), plus fort quand il secoue */
  pas:function(dt){
    this._bul += dt * (this._bouillon || (this.ko ? 0 : 2.4));
    while(this._bul > 1){ this._bul -= 1; this._bulle(this.fioleB); }
    if(this._verse){
      var Mi = inv(mat(this.filet)), a = ou2(this.reps[this.fioleA.getAttribute('data-fiole') + 'bec'], Mi), b = ou2(this.reps[this.fioleB.getAttribute('data-fiole') + 'bec'], Mi);
      var mx = (a[0] + b[0]) / 2 - 4, my = Math.min(a[1], b[1]) - 2;
      this.filet.setAttribute('d', 'M' + r1(a[0]) + ' ' + r1(a[1]) + ' Q ' + r1(mx) + ' ' + r1(my) + ' ' + r1(b[0]) + ' ' + r1(b[1] - 4));
    }
  },
  geste:function(ok){
    var me = this, g = this.garde();
    /* (cuit et endormi : la fiole bouillonne en CSS, classe ha-bout, sans réveiller la boucle) */
    var bout = function(on){ me._bouillon = on ? 14 : 0; me.racine.classList.toggle('ha-bout', !!on); };
    var leve = {}; for(var k in g) leve[k] = g[k];
    leve.mB = [132, 108]; leve.tete = -12; leve.torse = 3;
    var s1 = {}; for(k in leve) s1[k] = leve[k]; s1.hB = -22;
    var s2 = {}; for(k in leve) s2[k] = leve[k]; s2.hB = 22;
    return this.jouer([{d:360, p:leve, e:'io', f:function(){ if(ok()){ bout(true); me.expr('content'); } }},
      {d:90, p:s1, e:'io'}, {d:110, p:s2, e:'io'}, {d:110, p:s1, e:'io'}, {d:110, p:s2, e:'io'}, {d:90, p:leve, e:'io', f:function(){ me._fumee(); }},
      {d:500, p:leve, e:'lin', f:function(){ bout(false); if(ok()) me.expr('garde'); }}, {d:420, p:g, e:'io'}]).then(function(){ bout(false); });
  }
};
function ou2(r, Mi){ var m = mat(r), p = ap(m, +r.getAttribute('cx'), +r.getAttribute('cy')); return ap(Mi, p[0], p[1]); }
/* cuit : le halo de la fiole est un petit îlot ; on anime son <div> (pivot au centre du halo) : la carte graphique s'en charge */
H._halo = function(h){
  if(!h || !this.cuit) return h;
  var d = h.ownerSVGElement && h.ownerSVGElement.parentNode;
  if(!d) return h;
  if(!d._pret){
    d._pret = 1;
    d.style.transformOrigin = h.getAttribute('cx') + 'px ' + h.getAttribute('cy') + 'px';
    d.style.opacity = h.getAttribute('opacity') || 1; h.setAttribute('opacity', 1);
    d.classList.add('ha-anime');
  }
  return d;
};
H._couleur = function(fiole, c){
  if(!fiole) return;
  fiole._c = c;
  [].forEach.call(fiole.querySelectorAll('[data-coul]'), function(e){ e.setAttribute('fill', c); });
  var id = fiole.getAttribute('data-fiole'), gr = this.svg.getElementById ? this.svg.getElementById(id + 'h') : this.svg.querySelector('#' + id + 'h');
  if(gr){ var st = gr.querySelectorAll('stop'); st[1].setAttribute('stop-color', c); st[2].setAttribute('stop-color', c); }
};
H._bulle = function(fiole, fort){
  var g = fiole.querySelector('[data-bulles]'), c = fiole.querySelector('[data-r$="c"]');
  if(!g || !c) return;
  var cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'), r = alea(1.2, fort ? 3.2 : 2.4), x = cx + alea(-7, 7);
  /* cuit : chaque bulle est son propre petit <div> (rien à repeindre pendant qu'elle monte) */
  var b = this.cuit && g.ownerSVGElement ? window.Cuire.ilot(g.ownerSVGElement.parentNode, '<circle cx="' + r1(x) + '" cy="' + r1(cy + 10) + '" r="' + r1(r) + '" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width=".8"/>')
    : nouveau(g, 'circle', {cx:x, cy:cy + 10, r:r, fill:'#fff', 'fill-opacity':.55, stroke:'#fff', 'stroke-width':.8});
  b.animate([{transform:'translate(0px,0px)', opacity:0}, {transform:'translate(' + alea(-2, 2) + 'px,-6px)', opacity:1, offset:.2}, {transform:'translate(' + alea(-3, 3) + 'px,-' + alea(14, 22) + 'px)', opacity:.9, offset:.8}, {transform:'translate(0px,-' + alea(24, 34) + 'px) scale(1.4)', opacity:0}],
    {duration:alea(700, 1100), easing:'ease-out'}).finished.then(function(){ b.remove(); });
};
H._fumee = function(){
  var p = this.rep('pince'), c = this.fioleB._c || '#ff8a3a';
  for(var k = 0; k < 4; k++) onde(this.fx, p.x + alea(-6, 6), p.y - 44 - k * 6, {css:'background:radial-gradient(circle,' + c + '88,' + c + '00 70%)', w:18, s0:0.4, s1:2.2, d:900, retard:k * 90});
};

/* ---------- préparer : il verse une fiole dans l'autre, mélange, ça s'illumine ---------- */
function copie(g, o){ var p = {}; for(var k in g) p[k] = g[k]; for(var k2 in o) p[k2] = o[k2]; return p; }
H.preparer = function(couleur){
  couleur = couleur || '#5fd08a';
  return this._file(function(){
    var me = this, g = this.garde(), band = this.$('[data-band="1"]');
    var mainF = this.$('[data-fiole-main]'), gantT = this.$('[data-gantA="tient"]'), gantO = this.$('[data-gantA="ouvert"]');
    var liqB = this.fioleB.querySelector('[data-liq]');
    this._couleur(this.fioleA, couleur);
    this.avant('A', true);
    var base = {bassin:{y:9}, pA:[98, 272], pB:[160, 272]};
    var prend = copie(g, copie(base, {torse:4, tete:2, mA:[124, 120], hA:-10, mB:[124, 142], hB:0}));
    var leve = copie(g, copie(base, {torse:2, tete:10, mA:[156, 96], hA:-20, mB:[124, 158], hB:4}));
    var verse = copie(leve, {mA:[152, 99], hA:-122, tete:12, mB:[124, 158], hB:0});
    var verse2 = copie(leve, {mA:[151, 97], hA:-130, tete:12, mB:[125, 159], hB:0});
    var jette = copie(leve, {mA:[112, 52], hA:-210, tete:4});
    var s1 = copie(leve, {mA:[170, 130], hA:-70, mB:[126, 134], hB:-26, tete:4}), s2 = copie(s1, {hB:26, mB:[129, 131]});
    var montre = copie(g, copie(base, {torse:0, tete:-6, mA:[180, 120], hA:-80, mB:[140, 122], hB:0}));
    var t0 = performance.now();
    return this.jouer([
      {d:150, p:prend, e:'io', f:function(){ band.style.display = 'none'; mainF.style.display = ''; gantT.style.display = ''; gantO.style.display = 'none'; me.expr('content'); }},
      {d:150, p:leve, e:'io'},
      {d:110, p:verse, e:'io', f:function(){
        me.filet.setAttribute('stroke', couleur); me.filet.style.display = ''; me._verse = true; me._couleur(me.fioleB, couleur);
        liqB.animate([{transform:'scaleY(.25)'}, {transform:'scaleY(1)'}], {duration:260, easing:'ease-out'});
        me.filet.animate([{strokeWidth:1}, {strokeWidth:4.5, offset:.3}, {strokeWidth:3}, {strokeWidth:1}], {duration:260});
      }},
      {d:150, p:verse2, e:'lin', f:function(){ me._verse = false; me.filet.style.display = 'none'; }},
      {d:110, p:jette, e:'o', f:function(){ mainF.style.display = 'none'; gantT.style.display = 'none'; gantO.style.display = ''; me._jetteFiole(couleur); }},
      {d:60, p:s1, e:'io', f0:function(){ me._bouillon = 30; }}, {d:60, p:s2, e:'io'}, {d:60, p:s1, e:'io'}, {d:60, p:s2, e:'io'},
      {d:140, p:montre, e:'b', f0:function(){ me.avant('A', false); me._eclatCouleur(couleur); }},
      {d:120, p:montre, e:'lin', f:function(){ me._bouillon = 0; band.style.display = ''; }},
      {d:300, p:g, e:'io', f:function(){ me.expr('garde'); }}
    ]).then(function(){ me._bouillon = 0; });
  });
};
H._jetteFiole = function(c){
  var p = this.rep('mainA'), e = div(this.fx, 'width:18px;height:22px', fioleSVG(c, true));
  var kf = []; for(var i = 0; i <= 8; i++){ var t = i / 8; kf.push({transform:place(p.x - 70 * t, p.y - 50 * t + 140 * t * t, -720 * t, 0.9), opacity:t > 0.8 ? (1 - t) * 5 : 1}); }
  jouerEl(e, kf, {duration:650, easing:'linear'});
};
H._eclatCouleur = function(c){
  var p = this.rep(this.fioleB.getAttribute('data-fiole') + 'c');
  onde(this.fx, p.x, p.y + 4, {css:'background:radial-gradient(circle,#fff 0,' + c + ' 35%,' + c + '00 70%)', w:40, s0:0.3, s1:1.5, d:480});
  gerbe(this.fx, p.x, p.y - 6, {n:12, c:[c, '#fff'], angle:-90, ecart:70, v0:40, v1:120, g:-40, t0:3, t1:5, d0:500, d1:800});
  scintille(this.fx, p.x, p.y - 10, {n:5, rx:20, ry:20, c:['#fff', c], etale:200});
  var h = this._halo(this.fioleB.querySelector('[data-halo]'));
  h.animate([{opacity:1, transform:'scale(1.35)'}, {opacity:.7, transform:'scale(1)'}], {duration:600, easing:'ease-out'});
};
/* une fiole (pour les projectiles) */
function fioleSVG(c, vide){
  return '<svg viewBox="0 0 40 48" style="width:100%;height:100%;display:block;overflow:visible">' + (vide ? '' : '<circle cx="20" cy="30" r="20" fill="' + c + '" opacity=".35"/>') +
    P('M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z', vide ? '#dff4ff' : c, vide ? ' fill-opacity=".5"' : '') + P('M13 2 L 27 2 L 27 8 L 13 8 Z', '#8a5a32') +
    (vide ? '' : F('M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z', 'rgba(0,0,0,.2)')) +
    L('M14 22 Q 15 18 19 17', '#fff', 2.4, ' opacity=".8"') + C(26, 34, 1.6, '#fff', ' opacity=".6"') + '</svg>';
}

/* ---------- lancer : élan, le bras balance, la fiole vole en tournant et se brise ---------- */
H.lancer = function(scene, to, couleur, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde(), fB = this.$('[data-fiole-b]');
    if(couleur && couleur !== this.fioleB._c) this._couleur(this.fioleB, couleur);
    var c = this.fioleB._c;
    var base = {pA:[92, 272], pB:[164, 272]};
    var elan = copie(g, copie(base, {bassin:{x:-6, y:14, r:-4}, torse:-16, tete:-8, mA:[188, 104], hA:-70, mB:[74, 74], hB:-40, cB:-1}));
    var elan2 = copie(elan, {torse:-19, mB:[70, 78], hB:-50});
    var haut = copie(g, copie(base, {bassin:{x:0, y:12, r:0}, torse:2, tete:-6, mA:[176, 140], hA:-40, mB:[112, 36], hB:20, sB:1.1}));
    var lache = copie(g, copie(base, {bassin:{x:6, y:16, r:4}, torse:18, tete:-2, mA:[150, 156], hA:-20, mB:[190, 96], hB:60, sB:1.14}));
    var suite = copie(g, copie(base, {bassin:{x:8, y:18, r:4}, torse:22, tete:0, mA:[140, 160], hA:-10, mB:[176, 168], hB:80, sB:1.05}));
    var vole;
    this.expr('vise');
    return this.jouer([
      {d:260, p:elan, e:'io'}, {d:120, p:elan2, e:'io', f:function(){ me.expr('cri'); }},
      {d:100, p:haut, e:'i'},
      {d:70, p:lache, e:'lin', f:function(){
        var a = me.rep(me.fioleB.getAttribute('data-fiole') + 'c', scene);
        fB.style.display = 'none';
        vole = me._fioleVole(scene, a, to, c, opt).then(sig);
      }},
      {d:180, p:suite, e:'o'}, {d:160, p:suite, e:'lin'},
      {d:380, p:g, e:'io', f:function(){
        me._couleur(me.fioleB, '#ff8a3a'); fB.style.display = '';
        me.fioleB.animate([{transform:'scale(0)'}, {transform:'scale(1.2)', offset:.6}, {transform:'scale(1)'}], {duration:320, easing:'ease-out'});
        me.expr('garde');
      }}
    ]).then(function(){ return vole; });
  });
};
H._fioleVole = function(scene, a, to, c, opt){
  if(opt._potion) return this._fioleVole2(scene, a, to, c, opt);     /* (givre, acide, huile, colle : sans filtre, voir m-armes.js) */
  var L = couche(scene), e = div(L, 'width:26px;height:31px;filter:drop-shadow(0 0 6px ' + c + ')', fioleSVG(c));
  var dist = Math.hypot(to.x - a.x, to.y - a.y), last = 0;
  return voler(e, a, to, {d:Math.max(420, Math.min(760, dist * 1.3)), haut:120 + dist * 0.26, tourne:620, r0:-20, chaque:function(p){
    var n = performance.now(); if(n - last < 30) return; last = n;
    gerbe(L, p.x, p.y, {n:2, c:[c, '#fff'], angle:90, ecart:90, v0:10, v1:40, g:200, t0:2.5, t1:4.5, d0:300, d1:550});
  }}).then(function(r){
    e.remove();
    onde(L, to.x, to.y, {css:'background:radial-gradient(circle,#fff 0,' + c + ' 30%,' + c + 'aa 50%,' + c + '00 72%)', w:90, h:70, s0:0.2, s1:1.7, d:600});
    onde(L, to.x, to.y, {w:60, c:c, ep:4, s0:0.3, s1:2.6, d:520});
    gerbe(L, to.x, to.y, {n:14, c:['#e8f8ff', '#bfe0f0', '#ffffff'], forme:'eclat', v0:120, v1:260, g:600, t0:6, t1:11, d0:450, d1:750, lueur:false});
    gerbe(L, to.x, to.y, {n:20, c:[c, c, '#fff'], angle:-90, ecart:100, v0:90, v1:240, g:700, t0:4, t1:8, d0:500, d1:850});
    for(var i = 0; i < 3; i++) onde(L, to.x + alea(-16, 16), to.y - 14 - i * 10, {css:'background:radial-gradient(circle,' + c + '77,' + c + '00 70%)', w:36, s0:0.5, s1:2.4, d:1000, retard:120 + i * 90});
    if(opt.onImpact) try { opt.onImpact(r); } catch(err){ console.error(err); }
    return r;
  });
};

/* ---------- la louche : BONG sur la marmite, des ondes de choc ---------- */
H.louche = function(scene){
  return this._file(function(){
    var me = this, g = this.garde();
    var lC = this.$('[data-louche-ceinture]'), lM = this.$('[data-louche-main]'), gantT = this.$('[data-gantA="tient"]'), gantO = this.$('[data-gantA="ouvert"]');
    var base = {pA:[96, 272], pB:[160, 272]};
    var prend = copie(g, copie(base, {bassin:{y:10}, torse:8, tete:2, mA:[162, 162], hA:60}));
    var arme = copie(g, copie(base, {bassin:{y:6, r:-2}, torse:-8, tete:-12, mA:[150, 46], hA:-120, mB:[120, 124], hB:0}));
    var arme2 = copie(arme, {mA:[146, 44], hA:-128, torse:-10});
    var mi = copie(g, copie(base, {bassin:{y:12}, torse:4, tete:-4, mA:[184, 70], hA:-10, mB:[120, 128], hB:0}));
    var frappe = copie(g, copie(base, {bassin:{y:16}, torse:10, tete:4, mA:[186, 118], hA:122, mB:[118, 132], hB:0, marmite:{r:0}}));
    var rebond = copie(frappe, {mA:[188, 104], hA:100, torse:6, marmite:{r:-14}});
    var tient = copie(frappe, {mA:[188, 112], hA:110, torse:6, marmite:{r:10}});
    var range = copie(prend, {marmite:{r:-4}});
    return this.jouer([
      {d:170, p:prend, e:'io', f:function(){ lC.style.display = 'none'; lM.style.display = ''; gantT.style.display = ''; gantO.style.display = 'none'; me.avant('A', true); me.expr('cri'); }},
      {d:220, p:arme, e:'io'}, {d:80, p:arme2, e:'io'},
      {d:70, p:mi, e:'i', f0:function(){ me._swoosh(); }}, {d:60, p:frappe, e:'i', f:function(){ me._bong(scene); }},
      {d:140, p:rebond, e:'o', f0:function(){ me.expr('joie'); }}, {d:120, p:tient, e:'io'}, {d:140, p:copie(tient, {marmite:{r:-6}}), e:'io'}, {d:140, p:copie(tient, {marmite:{r:3}}), e:'io'},
      {d:220, p:range, e:'io', f:function(){ lC.style.display = ''; lM.style.display = 'none'; gantT.style.display = 'none'; gantO.style.display = ''; me.avant('A', false); }},
      {d:360, p:copie(g, {marmite:{r:0}}), e:'b', f:function(){ me.expr('garde'); }}
    ]);
  });
};
H._bong = function(scene){
  var L = couche(scene), p = this.rep('marmite', scene);
  mot(L, p.x + 30, p.y - 70, 'BONG !', {t:34, r:-8, c:'#ffe36a', monte:30});
  onde(L, p.x, p.y, {css:'background:radial-gradient(circle,#fff,rgba(255,230,150,.6) 35%,rgba(255,230,150,0) 70%)', w:50, s0:0.3, s1:1.6, d:260});
  for(var i = 0; i < 4; i++){
    onde(L, p.x + 12 + i * 22, p.y - 10, {w:70, h:96, css:'border:' + (4 - i * 0.6) + 'px solid rgba(255,232,160,.9);box-shadow:0 0 8px rgba(255,210,120,.8), inset 0 0 6px rgba(255,210,120,.5);', s0:0.2, s1:1.7 + i * 0.35, d:620 + i * 90, retard:i * 100, e:'cubic-bezier(.2,.6,.4,1)'});
  }
  gerbe(L, p.x, p.y, {n:10, c:['#fff', '#ffe08a'], angle:-60, ecart:70, v0:120, v1:240, g:300, forme:'trait', t0:8, t1:14, d0:250, d1:420});
  scintille(L, p.x + 10, p.y - 30, {n:6, rx:30, ry:20, etale:200});
  this.boite.animate([{transform:'translate(0px,0px)'}, {transform:'translate(-2px,1px)'}, {transform:'translate(2px,-1px)'}, {transform:'translate(-1px,1px)'}, {transform:'translate(0px,0px)'}], {duration:220});
};

/* ---------- les herbes : une pincée de feuilles lumineuses vers un allié ---------- */
var FEUILLE = '<svg viewBox="-10 -6 20 12" style="width:100%;height:100%;display:block;overflow:visible"><path d="M-9 0 Q -2 -7 9 0 Q -2 7 -9 0 Z" fill="#7ef08a" stroke="#1e5a2a" stroke-width="1.4"/><path d="M-8 0 L 8 0 M-2 0 l 3 -3 M2 0 l 3 3" stroke="#1e7a34" stroke-width="1" fill="none"/></svg>';
H.herbes = function(scene, to, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde(), hM = this.$('[data-herbes-main]'), gantT = this.$('[data-gantA="tient"]'), gantO = this.$('[data-gantA="ouvert"]');
    var moi = this.rep('tete', scene), arriere = to.x < moi.x;
    var base = {pA:[96, 272], pB:[160, 272]};
    var prend = copie(g, copie(base, {bassin:{y:12}, torse:10, tete:6, mA:[112, 160], hA:20}));
    var elan = arriere ? copie(g, copie(base, {bassin:{y:8, r:2}, torse:6, tete:-4, mA:[180, 150], hA:-30})) : copie(g, copie(base, {bassin:{y:10}, torse:2, tete:-4, mA:[128, 156], hA:30}));
    var jet = arriere ? copie(g, copie(base, {bassin:{y:8, r:-3}, torse:-12, tete:-14, mA:[104, 46], hA:-150})) : copie(g, copie(base, {bassin:{y:12}, torse:12, tete:-6, mA:[196, 92], hA:-60, sA:1.08}));
    var suite = copie(jet, {torse:arriere ? -14 : 14});
    return this.jouer([
      {d:200, p:prend, e:'io', f:function(){ me.avant('A', true); hM.style.display = ''; gantT.style.display = ''; gantO.style.display = 'none'; var p = me.rep('mainA'); scintille(me.fx, p.x, p.y, {n:4, rx:10, ry:10, c:['#a6ff9a', '#fff'], etale:150}); me.expr('content'); }},
      {d:180, p:elan, e:'io'},
      {d:110, p:jet, e:'o', f0:function(){
        var a = me.rep('mainA', scene);
        me.plus(60, function(){ hM.style.display = 'none'; gantT.style.display = 'none'; gantO.style.display = ''; });
        me._feuilles(scene, a, to, opt).then(sig);
      }},
      {d:240, p:suite, e:'lin'}, {d:360, p:g, e:'io', f:function(){ me.avant('A', false); me.expr('garde'); }}
    ]);
  });
};
H._feuilles = function(scene, a, to, opt){
  var L = couche(scene), ps = [], dist = Math.hypot(to.x - a.x, to.y - a.y);
  for(var i = 0; i < 11; i++) (function(i){
    var e = div(L, 'width:' + alea(12, 18) + 'px;height:' + alea(8, 11) + 'px;filter:drop-shadow(0 0 4px #8aff9a) drop-shadow(0 0 1px #fff)', FEUILLE), last = 0;
    var b = {x:to.x + alea(-26, 26), y:to.y + alea(-30, 24)};
    ps.push(new Promise(function(res){ setTimeout(res, i * 45); }).then(function(){
      return voler(e, {x:a.x + alea(-12, 12), y:a.y + alea(-12, 12)}, b, {d:alea(480, 760) + dist * 0.3, haut:alea(-30, 120) + dist * 0.12, tourne:alea(-540, 540), ease:function(t){ return t + Math.sin(t * Math.PI * 2) * 0.04; }, chaque:function(p, an, t){
        var n = performance.now(); if(n - last < 50) return; last = n;
        gerbe(L, p.x, p.y, {n:1, c:['#c8ffb8', '#8aff9a'], angle:-90, ecart:180, v0:5, v1:20, g:-10, t0:2, t1:3.2, d0:300, d1:500});
      }});
    }).then(function(){ e.animate([{opacity:1}, {opacity:0}], {duration:200, fill:'forwards'}).finished.then(function(){ e.remove(); }); }));
  })(i);
  return Promise.race([ps[0], new Promise(function(r){ setTimeout(r, 2000); })]).then(function(){
    return Promise.all(ps.slice(0, 4));
  }).then(function(){
    onde(L, to.x, to.y, {css:'background:radial-gradient(circle,rgba(220,255,210,.9),rgba(120,240,140,.5) 40%,rgba(120,240,140,0) 70%)', w:90, s0:0.3, s1:1.5, d:600});
    onde(L, to.x, to.y + 30, {w:110, h:26, c:'#8aff9a', ep:3, s0:0.2, s1:1.3, d:700});
    scintille(L, to.x, to.y, {n:10, rx:40, ry:50, c:['#c8ffb8', '#fff', '#8aff9a'], dy:-40, etale:500});
    for(var k = 0; k < 5; k++) gerbe(L, to.x + alea(-30, 30), to.y + alea(-10, 30), {n:1, forme:'html', html:'+', c:'#a6ff9a', angle:-90, ecart:10, v0:40, v1:70, g:-20, t0:16, t1:22, d0:800, d1:1100, retard:k * 90, fondu:2});
    if(opt.onImpact) try { opt.onImpact(to); } catch(err){ console.error(err); }
    return to;
  });
};

/* une traînée de mouvement (arc blanc) quand la louche s'abat */
H._swoosh = function(){
  var p = this.rep('marmite'), id = 'hsw' + (++uid);
  var e = div(this.fx, 'width:90px;height:110px', '<svg viewBox="-45 -55 90 110" style="width:100%;height:100%;overflow:visible"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff6d0" stop-opacity=".8"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>' +
    '<path d="M-30 -50 A 60 60 0 0 1 20 40 A 52 52 0 0 0 -30 -50 Z" fill="url(#' + id + ')"/><path d="M-20 -46 A 56 56 0 0 1 26 30 M-36 -40 A 66 66 0 0 1 12 46" fill="none" stroke="#fff" stroke-width="1.4" opacity=".6"/></svg>');
  jouerEl(e, [{transform:place(p.x + 26, p.y - 46, -20, 0.8), opacity:0}, {transform:place(p.x + 26, p.y - 44, 0, 1), opacity:1, offset:.3}, {transform:place(p.x + 24, p.y - 40, 15, 1.05), opacity:0}], {duration:260, easing:'ease-out'});
};
