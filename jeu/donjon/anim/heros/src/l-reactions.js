/* ============ des effets sans aucun filtre (RAPIDITE.md R2 et R7) ============
   Chaque particule est un petit <div> (un dégradé ou un petit dessin SVG, peint une fois) dont la trajectoire est calculée
   d'avance et jouée par la carte graphique (transform et opacity). Pas de box-shadow, pas de drop-shadow. */
function transp(c){ return 'rgba(' + hx(c).join(',') + ',0)'; }
function tache(c, c2){ return 'border-radius:50%;background:radial-gradient(closest-side,' + c + ' 0,' + (c2 || c) + ' 42%,' + transp(c2 || c) + ' 100%)'; }
var FORMES = {
  etoile:function(c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + r1(t) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><circle r="7.5" fill="' + c + '" opacity=".3"/><path d="M0 -10 Q 1.5 -1.5 10 0 Q 1.5 1.5 0 10 Q -1.5 1.5 -10 0 Q -1.5 -1.5 0 -10 Z" fill="' + c + '"/><circle r="2" fill="#fff"/></svg>'; },
  goutte:function(c, t){ return '<svg viewBox="-6 -9 12 15" style="width:' + r1(t) + 'px;height:' + r1(t * 1.25) + 'px;display:block;overflow:visible"><path d="M0 -8 C 3 -3 5 0 5 2.5 C 5 5.5 2.6 6.5 0 6.5 C -2.6 6.5 -5 5.5 -5 2.5 C -5 0 -3 -3 0 -8 Z" fill="' + c + '" stroke="#24182e" stroke-width="1.3"/><circle cx="-1.6" cy="2" r="1.3" fill="#fff" opacity=".75"/></svg>'; },
  eclat:function(c, t){ return '<svg viewBox="-6 -8 12 16" style="width:' + r1(t * .75) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><path d="M0 -8 L 5 3 L -1 8 L -5 1 Z" fill="' + c + '" stroke="#24182e" stroke-width="1.1" stroke-linejoin="round"/><path d="M-1 -4 L 1.5 2" stroke="#fff" stroke-width="1.2" opacity=".8"/></svg>'; },
  flocon:function(c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + r1(t) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><path d="M0 -9 L 0 9 M-7.8 -4.5 L 7.8 4.5 M-7.8 4.5 L 7.8 -4.5 M-2.5 -7 L 0 -5 L 2.5 -7 M-2.5 7 L 0 5 L 2.5 7" stroke="#24182e" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".55"/><path d="M0 -9 L 0 9 M-7.8 -4.5 L 7.8 4.5 M-7.8 4.5 L 7.8 -4.5 M-2.5 -7 L 0 -5 L 2.5 -7 M-2.5 7 L 0 5 L 2.5 7" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>'; },
  paillette:function(c, t){ return '<svg viewBox="-6 -6 12 12" style="width:' + r1(t) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><path d="M0 -6 L 3.4 0 L 0 6 L -3.4 0 Z" fill="' + c + '" stroke="#7a5418" stroke-width=".9"/><path d="M0 -6 L 3.4 0 L 0 0 Z" fill="#fff" opacity=".55"/></svg>'; },
  feuille:function(c, t){ return '<svg viewBox="-2 -10 26 20" style="width:' + r1(t) + 'px;height:' + r1(t * .8) + 'px;display:block;overflow:visible">' + feuilleChene(0, 0, 0, 1, c) + '</svg>'; }
};
/* une gerbe de particules : n, c (couleur ou liste), forme (rond, lueur, trait, etoile, goutte, eclat, flocon, paillette, feuille),
   angle et ecart (degrés), v0 / v1 (vitesse), g (pesanteur), t0 / t1 (taille), d0 / d1 (durée), retard, etale */
function pluie(layer, x, y, o){
  o = o || {};
  var n = o.n || 10, ps = [];
  for(var i = 0; i < n; i++){
    var an = (o.angle || 0) + (o.ecart !== undefined ? alea(-o.ecart, o.ecart) : alea(-180, 180));
    var v = alea(o.v0 || 60, o.v1 || 160), vx = Math.cos(an / DEG) * v, vy = Math.sin(an / DEG) * v, g = o.g === undefined ? 300 : o.g;
    var dur = alea(o.d0 || 400, o.d1 || 800), sz = alea(o.t0 || 3, o.t1 || 6), c = o.c instanceof Array ? o.c[i % o.c.length] : (o.c || '#ffffff');
    var f = o.forme || 'rond', css = 'width:' + r1(sz) + 'px;height:' + r1(sz) + 'px;', html = '';
    if(f === 'trait') css = 'width:' + r1(sz) + 'px;height:' + r1(Math.max(1.6, sz * .26)) + 'px;border-radius:2px;background:' + c;
    else if(f === 'lueur') css = 'width:' + r1(sz * 2.4) + 'px;height:' + r1(sz * 2.4) + 'px;' + tache('#ffffff', c);
    else if(f === 'rond') css += 'border-radius:50%;background:' + c + (o.bord ? ';border:1px solid #24182e' : '');
    else html = FORMES[f](c, sz);
    var e = div(layer, css, html), k = [], rot0 = alea(-180, 180), rotv = o.tourne === undefined ? alea(-540, 540) : o.tourne;
    for(var s = 0; s <= 6; s++){
      var tt = s / 6 * dur / 1000, px = x + vx * tt, py = y + vy * tt + 0.5 * g * tt * tt;
      var rr = f === 'trait' ? Math.atan2(vy + g * tt, vx) * DEG : f === 'goutte' ? Math.atan2(vy + g * tt, vx) * DEG - 90 : rot0 + rotv * tt;
      k.push({transform:place(px, py, rr, o.s1 === undefined ? 1 : 1 + (o.s1 - 1) * s / 6), opacity:s === 0 ? 0 : Math.pow(1 - s / 6, o.fondu || 0.8) * (o.o0 || 1)});
    }
    k[1].opacity = Math.max(k[1].opacity, .9 * (o.o0 || 1));
    ps.push(jouerEl(e, k, {duration:dur, delay:(o.retard || 0) + alea(0, o.etale || 0), easing:'linear', fill:'backwards'}));
  }
  return Promise.all(ps);
}
/* une tache de lumière (un dégradé) qui grandit et s'efface */
function lueurFx(layer, x, y, o){
  o = o || {};
  var w = o.w || 60, h = o.h || w, e = div(layer, 'width:' + w + 'px;height:' + h + 'px;' + tache(o.c || '#ffffff', o.c2 || o.c || '#ffffff'));
  var k = o.k || [{transform:place(x, y, 0, o.s0 || .3), opacity:o.o0 === undefined ? 1 : o.o0}, {transform:place(x + (o.dx || 0), y + (o.dy || 0), 0, o.s1 || 1.6), opacity:0}];
  return jouerEl(e, k, {duration:o.d || 500, delay:o.retard || 0, easing:o.e || 'cubic-bezier(.1,.7,.3,1)', fill:'backwards'});
}
/* un anneau (un dégradé en couronne, peint une fois) qui s'élargit */
function anneau(layer, x, y, o){
  o = o || {};
  var w = o.w || 60, h = o.h || w, c = o.c || '#ffffff';
  var e = div(layer, 'width:' + w + 'px;height:' + h + 'px;border-radius:50%;background:radial-gradient(closest-side,' + transp(c) + ' 62%,' + c + ' 80%,' + transp(c) + ' 100%)');
  return jouerEl(e, [{transform:place(x, y, 0, o.s0 || .2), opacity:o.o0 === undefined ? 1 : o.o0}, {transform:place(x, y, 0, o.s1 || 2.2), opacity:0}], {duration:o.d || 600, delay:o.retard || 0, easing:'cubic-bezier(.1,.7,.3,1)', fill:'backwards'});
}
/* un dessin (SVG) qui surgit et s'efface : o.k = images clés, sinon un « pop » */
function surgit(layer, x, y, w, h, svg, o){
  o = o || {};
  var e = div(layer, 'width:' + w + 'px;height:' + h + 'px', svg), r = o.r || 0;
  return jouerEl(e, o.k || [{transform:place(x, y, r - 20, .2), opacity:0}, {transform:place(x, y, r, 1.15), opacity:1, offset:.25}, {transform:place(x, y, r + 6, 1), opacity:1, offset:.6}, {transform:place(x, y, r + 14, o.s1 || 1.25), opacity:0}],
    {duration:o.d || 600, delay:o.retard || 0, easing:o.e || 'ease-out', fill:'backwards'});
}
/* une étoile de choc de bande dessinée */
function chocSvg(c1, c2, n){
  n = n || 10;
  var p = '', q = '';
  for(var i = 0; i < n * 2; i++){ var a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 22 : 48 - (i % 4 ? 8 : 0), r2 = i % 2 ? 12 : 30 - (i % 4 ? 5 : 0);
    p += (i ? ' L ' : 'M') + r1(Math.cos(a) * r) + ' ' + r1(Math.sin(a) * r); q += (i ? ' L ' : 'M') + r1(Math.cos(a) * r2) + ' ' + r1(Math.sin(a) * r2); }
  return '<svg viewBox="-50 -50 100 100" style="width:100%;height:100%;display:block;overflow:visible"><path d="' + p + ' Z" fill="' + c1 + '" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/><path d="' + q + ' Z" fill="' + c2 + '"/></svg>';
}
/* un vol calculé d'avance (en cloche si haut > 0) : joué par la carte graphique ; o.chaque(p, angle, u) est appelé tous les
   o.pas ms (pour semer une traînée), sans boucle à chaque image */
function vol2(el, a, b, o){
  var D = o.d, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 - (o.haut || 0), N = o.n || 18, kf = [];
  function pos(t){ var u = 1 - t; return {x:u * u * a.x + 2 * u * t * cx + t * t * b.x, y:u * u * a.y + 2 * u * t * cy + t * t * b.y}; }
  function etat(t){ var te = o.ease ? o.ease(t) : t, p = pos(te), q = pos(Math.min(1, te + .01)), r = pos(Math.max(0, te - .01)); p.ang = Math.atan2(q.y - r.y, q.x - r.x) * DEG; p.r = o.tourne !== undefined ? (o.r0 || 0) + o.tourne * t : p.ang; return p; }
  for(var i = 0; i <= N; i++){ var p = etat(i / N); kf.push({offset:i / N, transform:place(p.x, p.y, p.r, o.s), opacity:1}); }
  if(o.apparait) kf[0].opacity = 0;
  var anim = el.animate(kf, {duration:D, delay:o.retard || 0, easing:'linear', fill:'both'});
  if(o.chaque){ var t0 = performance.now() + (o.retard || 0), pas = o.pas || 45;
    (function tic(){ var u = (performance.now() - t0) / D; if(u >= 1) return; if(u >= 0){ var q = etat(u); o.chaque(q, q.ang, u); } setTimeout(tic, pas); })(); }
  function fin(){ var q = etat(1); return {x:q.x, y:q.y, ang:q.ang}; }
  return anim.finished.then(fin, fin);
}
/* une suite de points (unités de la boîte) passée en courbe douce (Catmull-Rom), échantillonnée en n points */
function courbe(p, n){
  var r = [], seg = p.length - 1;
  for(var i = 0; i <= n; i++){
    var t = i / n * seg, k = Math.min(seg - 1, Math.floor(t)), u = t - k, p0 = p[Math.max(0, k - 1)], p1 = p[k], p2 = p[k + 1], p3 = p[Math.min(p.length - 1, k + 2)], u2 = u * u, u3 = u2 * u;
    r.push([0, 1].map(function(j){ return 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3); }));
  }
  return r;
}

/* ============ la place des choses dans la boîte du héros ============ */
/* (une seule lecture au début de chaque geste) les unités du dessin (250 × 300, pieds en bas) vers les pixels de la boîte */
H._mesure = function(){ this._W = this.fx.offsetWidth || 200; this._H = this.fx.offsetHeight || 240; };
H._px = function(x, y){
  if(!this._W) this._mesure();
  var s = Math.min(this._W / 250, this._H / 300);
  return {x:(this._W - 250 * s) / 2 + x * s, y:this._H - 300 * s + y * s, s:s};
};
/* un point {x, y} de la scène (ou de l'écran si pas de scène) vers les pixels de la boîte du héros */
H._versBoite = function(scene, p){
  var R = this.boite.getBoundingClientRect(), k = (R.width / (this.boite.offsetWidth || R.width)) || 1, cx = p.x, cy = p.y;
  if(scene){ var S = scene.getBoundingClientRect(), ks = (S.width / (scene.offsetWidth || S.width)) || 1; cx = S.left + p.x * ks; cy = S.top + p.y * ks; }
  return {x:(cx - R.left) / k, y:(cy - R.top) / k};
};

/* ============ l'équipement visible : h.equiper(objet, on) ============ */
var OBJETS = {'carquois-argent':'pisteur', 'carquois-lourd':'pisteur', 'cristal-lune':'sage', 'baton-chene':'sage', 'sacoche':'alchimiste', 'amulette':null};
var ALIAS_OBJ = {argent:'carquois-argent', 'fleches-argent':'carquois-argent', lourd:'carquois-lourd', lourde:'carquois-lourd', 'fleches-lourdes':'carquois-lourd',
  cristal:'cristal-lune', lune:'cristal-lune', chene:'baton-chene', 'baton':'baton-chene'};
H.equiper = function(objet, on, opt){
  if(on && typeof on === 'object'){ opt = on; on = true; }
  objet = ALIAS_OBJ[objet] || objet; on = on !== false; opt = opt || {};
  this.eq = this.eq || {};
  if(!(objet in OBJETS) || (OBJETS[objet] && OBJETS[objet] !== this.role)){ if(window.console) console.warn('HerosAnime.equiper : « ' + objet + ' » ne va pas au ' + this.role); return Promise.resolve(false); }
  /* un seul carquois à la fois */
  if(on && objet === 'carquois-argent' && this.eq['carquois-lourd']) this._eq('carquois-lourd', false);
  if(on && objet === 'carquois-lourd' && this.eq['carquois-argent']) this._eq('carquois-argent', false);
  var avant = !!this.eq[objet];
  this._eq(objet, on);
  if(on && !avant && !opt.discret) this._eclatObjet(objet);
  return Promise.resolve(true);
};
H.equipe = function(objet){ return !!(this.eq && this.eq[ALIAS_OBJ[objet] || objet]); };
/* montrer / cacher la variante dessinée (dans la vue ET dans la silhouette lumineuse du héros choisi) */
H._eq = function(objet, on){
  this.eq = this.eq || {};
  this.eq[objet] = !!on;
  [].forEach.call(this.svg.querySelectorAll('[data-eq="' + objet + '"]'), function(e){ e.style.display = on ? '' : 'none'; });
  if(objet.indexOf('carquois') === 0){
    var normal = !this.eq['carquois-argent'] && !this.eq['carquois-lourd'];
    [].forEach.call(this.svg.querySelectorAll('[data-carquois]'), function(e){ e.style.display = normal ? '' : 'none'; });
  }
};
/* (après l'ajout de la silhouette lumineuse : elle reprend l'équipement) */
H._reappliquer = function(){ for(var k in (this.eq || {})) if(this.eq[k]) this._eq(k, true); };
H._eclatObjet = function(objet){
  var r = this.vue.querySelector('[data-eq="' + objet + '"] [data-r]') || this.reps[{'cristal-lune':'cristal', amulette:'amulette'}[objet]] || this.reps.teteC;
  var p = ou(r, this.fx), c = {'carquois-argent':['#ffffff', '#dfe7f2', '#bfd4ff'], 'cristal-lune':['#ffffff', '#e8eeff', '#bfe8ff'], 'baton-chene':['#c8ff9a', '#6ab85a', '#fff6c0']}[objet] || ['#fff6c0', '#ffd36a', '#ffffff'];
  lueurFx(this.fx, p.x, p.y, {c:'#ffffff', c2:c[1], w:56, s0:.3, s1:1.4, d:460});
  anneau(this.fx, p.x, p.y, {c:c[1], w:44, s0:.3, s1:2, d:560});
  pluie(this.fx, p.x, p.y, {n:7, forme:'etoile', c:c, v0:20, v1:70, g:-30, t0:8, t1:14, d0:500, d1:800, etale:200});
};

/* ============ les calques des réactions (givre, bave, toile) ============ */
/* la pièce qui porte un calque : « epaules » (le torse de la tête), « tete », « bras » (le bras proche), sinon la vue entière */
H._piece = function(quoi){
  var v = this.vue, y = v.querySelector('[data-y="ouverts"]');
  if(quoi === 'epaules') return y && y.closest('[data-i="torse"]');
  if(quoi === 'tete') return y && y.closest('[data-i="tete"]');
  if(quoi === 'bras') return v.querySelector('[data-i="brasB"]');
  return v;
};
/* un calque fixe (unités du dessin) : cuit, un îlot (un petit SVG peint une fois, qui suit la pièce) ; sinon un <g> */
H._calque = function(quoi, html, origine){
  var p = this._piece(quoi), e;
  if(!p) return null;
  if(this.cuit && window.Cuire){ e = window.Cuire.ilot(p, html, 'ha-calque'); e.style.width = e.style.height = '1px'; }   /* (1 px : RAPIDITE.md R5) */
  else { e = document.createElementNS(SVGNS, 'g'); e.setAttribute('class', 'haJ ha-calque'); e.innerHTML = html; p.appendChild(e); }
  e.style.display = 'none';
  if(origine) e.style.transformOrigin = origine[0] + 'px ' + origine[1] + 'px';
  return e;
};
var ORIG = {epaules:[120, 104], tete:[128, 14], bras:[108, 108]};
H._calques = function(type){
  this._cq = this._cq || {};
  if(this._cq[type]) return this._cq[type];
  var D = type === 'givre' ? givreDessin(this.role) : baveDessin(this.role), me = this, r = {gouttes:D.gouttes || {}};
  ['epaules', 'tete', 'bras'].forEach(function(q){ r[q] = me._calque(q, D[q], ORIG[q]); });
  return (this._cq[type] = r);
};
function montrer(el, on){ if(el){ if(el._a){ el._a.cancel(); el._a = null; } el.style.display = on ? '' : 'none'; el.style.opacity = ''; } }
function animer(el, kf, o){ if(!el) return Promise.resolve(); if(el._a) el._a.cancel(); var a = el._a = el.animate(kf, o); return a.finished.then(function(){ if(el._a === a) el._a = null; }, function(){}); }

/* ============ h.touche(type) : les nouvelles réactions ============ */
var toucheBase = H.touche;
H.touche = function(type, opt){
  if(type === 'froid') return this._froid(opt || {});
  if(type === 'grouillement') return this._grouillement(opt || {});
  if(type === 'poing') return this._poing(opt || {});
  return toucheBase.call(this, type, opt);
};
function copieP(g, o){ var p = {}, k; for(k in g) p[k] = g[k]; for(k in o) p[k] = o[k]; return p; }
/* une flamme (pour la brûlure froide, bleue) */
function flammeSvg(c1, c2, c3){
  var d = 'M0 -40 C 8 -24 22 -16 22 2 C 22 16 12 24 0 24 C -12 24 -22 16 -22 2 C -22 -10 -12 -14 -10 -26 C -6 -18 -4 -14 -2 -12 C 2 -22 2 -30 0 -40 Z';
  return '<svg viewBox="-30 -44 60 72" style="width:100%;height:100%;display:block;overflow:visible"><path d="' + d + '" fill="' + c1 + '" stroke="#24182e" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M0 -14 C 6 -4 12 2 12 10 C 12 18 6 21 0 21 C -6 21 -12 18 -12 10 C -12 2 -4 -2 0 -14 Z" fill="' + c2 + '"/><path d="M0 2 C 3 7 6 10 6 14 C 6 18 3 19 0 19 C -3 19 -6 18 -6 14 C -6 10 -2 8 0 2 Z" fill="' + c3 + '"/></svg>';
}

/* ---------- la brûlure froide (feu follet) : éclat bleu, il se recroqueville et grelotte, du givre sur les épaules ---------- */
H._froid = function(o){
  return this._file(function(){
    this._mesure();
    var me = this, g = this.garde(), C = this._calques('givre');
    var poi = this._px(136, 146), bou = this._px(150, 84), F2 = this.fx;
    this.expr('surpris');
    /* l'éclat : une tache blanche et bleue, une flamme bleue qui lèche, des éclats de glace */
    lueurFx(F2, poi.x, poi.y, {c:'#ffffff', c2:'#5fc8ff', w:120, s0:.3, s1:1.5, d:520});
    anneau(F2, poi.x, poi.y, {c:'#9ad8ff', w:90, s0:.3, s1:2.1, d:620});
    surgit(F2, poi.x + 10, poi.y - 6, 48, 58, flammeSvg('#5fc8ff', '#bff0ff', '#ffffff'), {d:640, k:[{transform:place(poi.x + 10, poi.y + 4, 0, .3), opacity:0}, {transform:place(poi.x + 10, poi.y - 6, -8, 1.15), opacity:1, offset:.2}, {transform:place(poi.x + 6, poi.y - 10, 6, .95), opacity:1, offset:.5}, {transform:place(poi.x + 2, poi.y - 22, -4, .5), opacity:0}]});
    pluie(F2, poi.x, poi.y, {n:10, forme:'eclat', c:['#eaf8ff', '#bfeaff', '#7fd8ff'], angle:-120, ecart:80, v0:80, v1:200, g:520, t0:6, t1:10, d0:420, d1:700});
    pluie(F2, poi.x, poi.y - 20, {n:5, forme:'flocon', c:['#ffffff', '#cfefff'], v0:20, v1:60, g:40, t0:10, t1:15, d0:800, d1:1200, etale:300});
    this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(-16px)', offset:.12, easing:'cubic-bezier(.2,.8,.4,1)'}, {transform:'translateX(-10px)', offset:.3},
      {transform:'translateX(-12.5px)', offset:.36}, {transform:'translateX(-7.5px)', offset:.42}, {transform:'translateX(-12px)', offset:.48}, {transform:'translateX(-8px)', offset:.54},
      {transform:'translateX(-11px)', offset:.6}, {transform:'translateX(-8.5px)', offset:.66}, {transform:'translateX(-10.5px)', offset:.72}, {transform:'translateX(-9px)', offset:.78}, {transform:'translateX(0px)'}], {duration:1500, easing:'linear'});
    /* il se recroqueville, les bras serrés autour du corps, et grelotte */
    var b0 = (g.bassin && g.bassin.y) || 0;
    var hit = {bassin:{x:-6, y:b0 + 6}, torse:-12, tete:-14, mA:[188, 120], hA:-40, mB:[78, 116], hB:-140, pA:g.pA, pB:g.pB};
    var brr = {bassin:{y:b0 + 12}, torse:12, tete:12, mA:[124, 134], mB:[150, 130], cB:1, pA:[112, 272], pB:[146, 272]};
    var brr2 = copieP(brr, {torse:15, tete:9, mA:[126, 132], mB:[148, 133]});
    var seq = [{d:70, p:hit, e:'oo'}, {d:110, p:hit, e:'lin'}, {d:220, p:brr, e:'o', f0:function(){
      me.expr('aie');
      ['epaules', 'tete', 'bras'].forEach(function(q, i){ var e = C[q]; montrer(e, true); animer(e, [{opacity:0, transform:'scale(.6)'}, {opacity:1, transform:'scale(1.08)', offset:.6}, {opacity:1, transform:'scale(1)'}], {duration:300, delay:i * 60, easing:'ease-out', fill:'backwards'}); });
    }}];
    for(var i = 0; i < 7; i++) seq.push({d:80, p:i % 2 ? brr : brr2, e:'io'});
    seq.push({d:380, p:g, e:'b', f0:function(){ me.expr('garde'); me.cligner(); }});
    /* la buée qui sort de la bouche (deux petits nuages) */
    [380, 700].forEach(function(t){ lueurFx(F2, bou.x, bou.y, {c:'#ffffff', c2:'#dff4ff', w:24, s0:.4, s1:2.2, dx:18, dy:-12, d:800, retard:t, o0:.85}); });
    /* le givre fond ensuite, doucement (sans bloquer le jeu) ; un nouveau coup de froid repart de zéro */
    var tok = this._givreTok = (this._givreTok || 0) + 1;
    this.plus(2600, function(){
      if(tok !== me._givreTok) return;
      ['epaules', 'tete', 'bras'].forEach(function(q){ var e = C[q]; animer(e, [{opacity:1}, {opacity:0}], {duration:900, easing:'ease-in', fill:'forwards'}).then(function(){ if(e && !e._a) montrer(e, false); }); });
      var a = me._px(100, 112), b = me._px(150, 106);
      pluie(me.fx, a.x, a.y, {n:2, forme:'goutte', c:'#bfeaff', angle:90, ecart:10, v0:5, v1:20, g:300, t0:5, t1:6, d0:700, d1:900, etale:500});
      pluie(me.fx, b.x, b.y, {n:2, forme:'goutte', c:'#bfeaff', angle:90, ecart:10, v0:5, v1:20, g:300, t0:5, t1:6, d0:700, d1:900, etale:500, retard:200});
    });
    return this.jouer(seq);
  });
};

/* ---------- le grouillement (Roi des rats) : trois rats lui courent dessus, il saute, il se débat ---------- */
var RAT_SVG = '<svg viewBox="-34 -16 62 28" style="width:100%;height:100%;display:block;overflow:visible">' +
  '<path d="M-20 2 C -28 2 -32 -4 -34 -10" fill="none" stroke="#24182e" stroke-width="3.6" stroke-linecap="round"/><path d="M-20 2 C -28 2 -32 -4 -34 -10" fill="none" stroke="#d89a9a" stroke-width="1.8" stroke-linecap="round"/>' +
  '<path d="M-12 7 L -15 11 M-4 7 L -2 11 M6 6 L 4 10 M12 5 L 15 9" stroke="#24182e" stroke-width="2.6" stroke-linecap="round"/>' +
  '<path d="M-22 1 C -22 -8 -10 -12 2 -10 C 10 -9 14 -6 18 -4 C 22 -3 27 -1 27 2 C 27 4 23 5 19 5 C 14 7 6 8 -2 8 C -14 8 -22 7 -22 1 Z" fill="#8a7482" stroke="#24182e" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<path d="M-18 4 C -10 7 4 7 12 4 C 6 6 -8 7 -18 4 Z" fill="#c8b4be"/><path d="M-16 -3 C -10 -9 2 -9 10 -6" fill="none" stroke="#c0aab8" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>' +
  '<path d="M9 -7 C 8 -14 15 -15 15 -9 Z" fill="#c88a92" stroke="#24182e" stroke-width="1.6"/><circle cx="27" cy="1.6" r="2" fill="#ff9aa8" stroke="#24182e" stroke-width="1"/>' +
  '<circle cx="18" cy="-2.6" r="2" fill="#ffd21e"/><circle cx="18.6" cy="-3.2" r=".7" fill="#fff"/><path d="M26 3 L 33 1 M26 3.5 L 32 5" stroke="#24182e" stroke-width=".8"/></svg>';
H._ratCourt = function(pts, delai, D){
  var me = this, s = this._px(0, 0).s;
  var p = courbe(pts.map(function(q){ var r = me._px(q[0], q[1]); return [r.x, r.y]; }), 26), kf = [], ang0 = null;
  for(var i = 0; i < p.length; i++){
    var a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG, gauche = b[0] - a[0] < 0;
    if(ang0 !== null){ while(an - ang0 > 180) an -= 360; while(an - ang0 < -180) an += 360; }
    ang0 = an;
    /* il trottine (petits bonds) ; quand il court vers la gauche, il est retourné (le ventre reste contre le héros) */
    var bond = i % 2 ? -2.4 * s : 0;
    kf.push({offset:i / (p.length - 1), transform:'translate(' + r1(p[i][0]) + 'px,' + r1(p[i][1] + bond) + 'px) translate(-50%,-80%) rotate(' + r1(an) + 'deg) scale(1,' + (gauche ? -1 : 1) + ')', opacity:i === 0 || i === p.length - 1 ? 0 : 1});
  }
  var e = div(this.fx, 'width:' + r1(68 * s) + 'px;height:' + r1(30 * s) + 'px;z-index:4;transform-origin:50% 80%', RAT_SVG);
  return jouerEl(e, kf, {duration:D, delay:delai, easing:'linear', fill:'backwards'});
};
H._grouillement = function(o){
  return this._file(function(){
    var me = this, g = this.garde();
    this._mesure();
    this.expr('surpris');
    this._ratCourt([[262, 292], [196, 290], [164, 250], [156, 200], [146, 150], [134, 108], [128, 62], [120, 18], [92, 30], [78, 86], [70, 150], [58, 230], [36, 292], [-40, 294]], 0, 1500);
    this._ratCourt([[270, 280], [206, 288], [176, 236], [178, 182], [152, 140], [104, 132], [74, 172], [52, 244], [20, 292], [-50, 294]], 280, 1350);
    this._ratCourt([[256, 293], [186, 290], [158, 226], [146, 150], [136, 74], [146, 16], [196, -20], [244, 120], [270, 290], [330, 292]], 560, 1400);
    var b0 = (g.bassin && g.bassin.y) || 0;
    var sur = {racine:{y:-18}, bassin:{y:b0}, torse:-10, tete:-14, mA:[186, 70], hA:-110, mB:[92, 64], hB:-160, cB:1, pA:[104, 256], fA:30, pB:[160, 272]};
    var bas = {racine:{y:0}, bassin:{y:b0 + 18, x:4}, torse:22, tete:12, mA:[168, 200], hA:40, mB:[150, 214], hB:60, pA:[98, 272], pB:[168, 260], fB:24};
    var tete = {racine:{y:-12}, bassin:{y:b0 + 4}, torse:-6, tete:18, mA:[160, 40], hA:-150, mB:[104, 30], hB:-120, cB:1, pA:[110, 272], pB:[150, 262], fB:16};
    var dos = {racine:{y:0}, bassin:{y:b0 + 10, x:-4}, torse:-16, tete:-20, mA:[120, 120], hA:-150, mB:[70, 120], hB:-170, cB:1, pA:[96, 272], pB:[160, 272]};
    return this.jouer([
      {d:120, p:sur, e:'oo', f:function(){ me.expr('aie'); }}, {d:160, p:bas, e:'io'}, {d:150, p:tete, e:'o'}, {d:140, p:sur, e:'io'},
      {d:150, p:dos, e:'io', f0:function(){ me.expr('surpris'); }}, {d:150, p:bas, e:'io', f0:function(){ me.expr('aie'); }}, {d:140, p:tete, e:'o'}, {d:150, p:dos, e:'io'},
      {d:150, p:sur, e:'io'}, {d:150, p:bas, e:'io'}, {d:140, p:tete, e:'o'},
      {d:200, p:copieP(g, {torse:(g.torse || 0) + 6, tete:-10}), e:'io', f0:function(){
        me.expr('colere');
        var a = me._px(124, 120), b = me._px(130, 40);
        pluie(me.fx, a.x, a.y, {n:6, c:['#5e4c56', '#8a7884'], v0:40, v1:110, g:200, t0:3, t1:5, d0:500, d1:800});
        pluie(me.fx, b.x, b.y, {n:4, c:['#5e4c56', '#8a7884'], v0:40, v1:100, g:200, t0:3, t1:5, d0:500, d1:800});
      }},
      {d:360, p:g, e:'b', f:function(){ me.expr('garde'); me.cligner(); }}
    ]);
  });
};

/* ---------- le poing du Gardien : un gros coup, il recule en glissant, puis revient ---------- */
H._poing = function(o){
  return this._file(function(){
    var me = this, g = this.garde(), F2 = this.fx;
    this._mesure();
    var poi = this._px(150, 140), s = this._px(0, 0).s, D = 1700;
    this.expr('aie');
    surgit(F2, poi.x + 8, poi.y, 110, 110, chocSvg('#fff2a0', '#ffffff'), {d:420, r:12, s1:1.4});
    lueurFx(F2, poi.x, poi.y, {c:'#ffffff', c2:'#ffb0a0', w:130, s0:.3, s1:1.4, d:380});
    pluie(F2, poi.x, poi.y, {n:12, forme:'trait', c:['#ffffff', '#ffe08a'], angle:180, ecart:55, v0:180, v1:320, g:200, t0:10, t1:18, d0:240, d1:420});
    /* il est projeté en arrière et glisse sur le sol (la boîte recule ; la poussière reste où elle naît) */
    var X1 = -64, X2 = -90;
    this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(' + X1 + 'px)', offset:.1, easing:'cubic-bezier(.15,.6,.4,1)'}, {transform:'translateX(' + X2 + 'px)', offset:.32, easing:'ease-out'},
      {transform:'translateX(' + X2 + 'px)', offset:.56}, {transform:'translateX(0px)', offset:.9, easing:'cubic-bezier(.45,0,.3,1)'}, {transform:'translateX(0px)'}], {duration:D});
    var pied = this._px(150, 292);
    [[.06, X1 * .6], [.12, X1], [.2, (X1 + X2) / 2], [.28, X2 + 4]].forEach(function(q, i){
      lueurFx(F2, pied.x + q[1] + 6, pied.y - 4, {c:'#d8d0e4', c2:'#a89cb8', w:36, h:22, s0:.4, s1:2.2, dx:18, dy:-8, d:700, retard:q[0] * D, o0:.8});
      pluie(F2, pied.x + q[1], pied.y - 2, {n:3, c:['#8a8098', '#b8aec8'], angle:-30, ecart:30, v0:40, v1:110, g:300, t0:2, t1:4, d0:300, d1:500, retard:q[0] * D});
    });
    var b0 = (g.bassin && g.bassin.y) || 0;
    var plie = {racine:{y:0}, bassin:{x:-8, y:b0 + 16, r:-4}, torse:26, tete:16, mA:[204, 150], hA:10, mB:[176, 176], hB:20, pA:[82, 272], pB:[170, 272], fB:-6};
    var glisse = copieP(plie, {torse:20, tete:8, bassin:{x:-4, y:b0 + 20, r:-6}, mA:[196, 170], mB:[60, 140], hB:-150, cB:-1, pA:[84, 272], pB:[176, 272], fB:-14});
    var sonne = {racine:{y:0}, bassin:{y:b0 + 6}, torse:6, tete:-12, mA:[176, 150], mB:[120, 150], pA:[100, 272], pB:[158, 272]};
    var sonne2 = copieP(sonne, {tete:12, torse:2});
    var pas1 = copieP(g, {racine:{y:-6}, pA:[110, 262], fA:16}), pas2 = copieP(g, {racine:{y:-6}, pB:[150, 262], fB:16});
    return this.jouer([
      {d:80, p:plie, e:'oo'}, {d:340, p:glisse, e:'o'}, {d:160, p:glisse, e:'lin'},
      {d:220, p:sonne, e:'io', f0:function(){ me.expr('ko'); }}, {d:150, p:sonne2, e:'io'}, {d:140, p:sonne, e:'io', f:function(){ me.expr('colere'); }},
      {d:150, p:pas1, e:'io'}, {d:150, p:pas2, e:'io'}, {d:140, p:pas1, e:'io'},
      {d:300, p:g, e:'b', f:function(){ me.expr('garde'); me.cligner(); }}
    ]);
  });
};

/* ============ h.relever({amulette:true}) : l'amulette de vie le relève (éclat d'or, elle se brise en paillettes) ============ */
var releverBase = H.relever;
H.relever = function(opt){
  if(opt && opt.amulette) return this._releverAmulette(opt);
  return releverBase.call(this, opt);
};
H._releverAmulette = function(o){
  return this._file(function(){
    var me = this, g = this.garde(), F2 = this.fx;
    this._mesure();
    this._etoiles(false);
    if(!this.equipe('amulette')) this._eq('amulette', true);   /* (on la voit même si le moteur ne l'avait pas montrée) */
    var A = ou(this.reps.amulette, F2), W = this._W, Hh = this._H, cx = W / 2, sol = this._px(0, 293).y;
    /* deux battements de cœur dorés sur l'amulette */
    lueurFx(F2, A.x, A.y, {c:'#fff6c0', c2:'#ffc850', w:90, d:760, k:[{transform:place(A.x, A.y, 0, .2), opacity:0}, {transform:place(A.x, A.y, 0, .9), opacity:1, offset:.18}, {transform:place(A.x, A.y, 0, .55), opacity:.7, offset:.38},
      {transform:place(A.x, A.y, 0, 1.15), opacity:1, offset:.6}, {transform:place(A.x, A.y, 0, .7), opacity:.8, offset:.85}, {transform:place(A.x, A.y, 0, 1.4), opacity:1}]});
    var coeur = '<svg viewBox="-12 -12 24 24" style="width:100%;height:100%;display:block;overflow:visible"><path d="' + coeurD(0, 1, 8) + '" fill="#ff4a6a" stroke="#24182e" stroke-width="2"/><circle cx="-3" cy="-2" r="2" fill="#fff" opacity=".8"/></svg>';
    [0, 330].forEach(function(t){ surgit(F2, A.x + 2, A.y - 26, 22, 22, coeur, {d:420, retard:t, k:[{transform:place(A.x + 2, A.y - 14, 0, .3), opacity:0}, {transform:place(A.x + 2, A.y - 26, 0, 1.2), opacity:1, offset:.35}, {transform:place(A.x + 2, A.y - 36, 0, 1), opacity:0}]}); });
    /* l'éclat d'or : l'amulette se brise en paillettes */
    this.plus(720, function(){
      me._eq('amulette', false);
      lueurFx(F2, A.x, A.y, {c:'#ffffff', c2:'#ffd36a', w:220, s0:.2, s1:1.5, d:700});
      surgit(F2, A.x, A.y, 150, 150, chocSvg('#ffe680', '#fff8d8', 12), {d:640, s1:1.5});
      anneau(F2, A.x, A.y, {c:'#ffd36a', w:90, s0:.2, s1:2.6, d:700});
      anneau(F2, A.x, A.y, {c:'#fff2b0', w:90, s0:.2, s1:3.2, d:900, retard:140});
      pluie(F2, A.x, A.y, {n:14, forme:'paillette', c:['#ffe680', '#ffd36a', '#fff6c0'], v0:80, v1:220, g:260, t0:5, t1:9, d0:700, d1:1200});
      pluie(F2, A.x, A.y, {n:6, forme:'eclat', c:['#f0c860', '#ffe08a'], v0:100, v1:200, g:600, t0:6, t1:9, d0:500, d1:800});
      me.expr('surpris');
    });
    /* la colonne de lumière dorée (un dégradé, sans flou ni mélange) et des étoiles qui montent */
    var col = div(F2, 'width:150px;height:260px;border-radius:50% 50% 40% 40%;background:radial-gradient(ellipse at 50% 80%,rgba(255,240,170,.85),rgba(255,205,100,.38) 40%,rgba(255,190,80,0) 70%)');
    jouerEl(col, [{transform:place(cx, sol - 110, 0, .2), opacity:0}, {transform:place(cx, sol - 120, 0, 1), opacity:1, offset:.35}, {transform:place(cx, sol - 124, 0, 1.06), opacity:.9, offset:.7}, {transform:place(cx, sol - 134, 0, 1.2), opacity:0}], {duration:1500, delay:700, easing:'ease-out', fill:'backwards'});
    anneau(F2, cx, sol, {c:'#ffd36a', w:150, h:34, s0:.2, s1:1.3, d:900, retard:760});
    pluie(F2, cx, sol - 20, {n:12, forme:'etoile', c:['#fff6c0', '#ffe680', '#ffffff'], angle:-90, ecart:40, v0:60, v1:170, g:-40, t0:8, t1:14, d0:800, d1:1200, etale:700, retard:760});
    var assis = {racine:{x:70, y:-10, r:-30}, bassin:{x:0, y:30, r:0}, torse:10, tete:0, cuisseA:-80, tibiaA:110, piedA:-30, cuisseB:-60, tibiaB:120, piedB:-60, brasA:-20, avantBrasA:-20, brasB:30, avantBrasB:-30, mainA:0, mainB:0};
    var genou = {racine:{x:0, y:0, r:0}, bassin:{x:0, y:48, r:0}, torse:22, tete:-10, pA:[92, 272], fA:40, pB:[160, 272], brasA:-30, avantBrasA:-50, brasB:20, avantBrasB:-40};
    var saut = {racine:{x:0, y:-34, r:0}, bassin:{y:-4}, torse:-8, tete:-14, pA:[108, 258], fA:20, pB:[150, 262], fB:14, brasA:-160, avantBrasA:-8, brasB:-150, avantBrasB:-10};
    var fier = copieP(g, {racine:{y:0}, torse:-4, tete:-10});
    if(this.R0.releve) this.R0.releve(saut);
    return this.jouer([{d:700, p:{}, e:'lin'}, {d:220, p:assis, e:'io'}, {d:200, p:genou, e:'io', f:function(){ me.expr('joie'); }},
      {d:220, p:saut, e:'o'}, {d:160, p:saut, e:'lin'}, {d:260, p:fier, e:'i', f0:function(){ me.ko = false; }, f:function(){ me._poussiere(); }}, {d:300, p:fier, e:'lin'},
      {d:300, p:g, e:'b'}]).then(function(){ me.ko = false; me.expr('garde'); });
  });
};

/* ============ h.entoile(on) : pris dans la toile d'araignée (il se débat) ; entoile(false) la déchire ============ */
H._toiles = function(){
  if(this._tl) return this._tl;
  var G = toileDessin();
  return (this._tl = [this._calque('toile', G[0], [86, 170]), this._calque('toile', G[1], [166, 170])]);
};
H.entoile = function(on){
  on = on !== false;
  /* (l'état voulu est noté tout de suite : entoile(true) puis entoile(false) aussitôt font bien les deux, dans l'ordre) */
  if(on === !!this._toileV) return Promise.resolve();
  this._toileV = on;
  return on ? this._entoiler() : this._dechirer();
};
H._pose_ligote = function(){
  var g = this.garde(), b0 = (g.bassin && g.bassin.y) || 0;
  return copieP(g, {bassin:{y:b0 + 6}, torse:(g.torse || 0) + 6, tete:-8, mA:[154, 150], mB:[110, 156], cB:1, pA:[114, 272], pB:[144, 272]});
};
H._entoiler = function(){
  return this._file(function(){
    var me = this, T = this._toiles(), lig = this._pose_ligote();
    this._toile = true;
    this.expr('surpris');
    T.forEach(function(e, i){ montrer(e, true); animer(e, [{opacity:0, transform:'scale(.4) rotate(' + (i ? 20 : -20) + 'deg)'}, {opacity:1, transform:'scale(1.06)', offset:.6}, {opacity:1, transform:'scale(1)'}], {duration:360, delay:i * 70, easing:'cubic-bezier(.2,.8,.3,1)', fill:'backwards'}); });
    var c = this._px(126, 160);
    pluie(this.fx, c.x, c.y, {n:8, c:'#f4f8ff', bord:true, v0:60, v1:140, g:300, t0:3, t1:5, d0:400, d1:600});
    return this.jouer([{d:240, p:lig, e:'oo'}].concat(this._debat(lig, 3), [{d:240, p:lig, e:'io', f:function(){ me.expr('effort'); }}]));
  });
};
/* il se débat dans la toile (n secousses) ; la toile tire avec lui */
H._debat = function(lig, n){
  var me = this, seq = [], T = this._tl || [];
  for(var i = 0; i < n; i++){
    var s = i % 2 ? 1 : -1;
    seq.push({d:120, p:copieP(lig, {torse:lig.torse + 7 * s, tete:lig.tete - 10 * s, bassin:{x:3 * s, y:lig.bassin.y}, mA:[158 + 4 * s, 146], mB:[106 - 4 * s, 150]}), e:'io', f0:i ? null : function(){
      T.forEach(function(e, k){ animer(e, [{transform:'scale(1)'}, {transform:'scale(1.04,.98) rotate(' + (k ? 2 : -2) + 'deg)'}, {transform:'scale(.99,1.02) rotate(' + (k ? -1 : 1) + 'deg)'}, {transform:'scale(1)'}], {duration:120 * n, easing:'ease-in-out'}); });
    }});
  }
  return seq;
};
H._dechirer = function(){
  return this._file(function(){
    var me = this, T = this._toiles(), g = this.garde(), lig = this._pose_ligote(), b0 = (g.bassin && g.bassin.y) || 0;
    this.expr('effort');
    var tasse = copieP(lig, {bassin:{y:b0 + 18}, torse:lig.torse + 8, tete:4, mA:[150, 156], mB:[114, 160]});
    var force = copieP(tasse, {torse:lig.torse + 10});
    var ouvre = copieP(g, {racine:{y:-14}, bassin:{y:b0}, torse:-8, tete:-12, mA:[200, 90], hA:-60, mB:[60, 92], hB:-160, cB:-1, pA:[92, 266], pB:[168, 266]});
    return this.jouer([{d:220, p:tasse, e:'io'}, {d:70, p:force, e:'io'}, {d:70, p:tasse, e:'io'}, {d:70, p:force, e:'io'},
      {d:120, p:ouvre, e:'oo', f0:function(){
        me.expr('cri');
        T.forEach(function(e, i){ var s = i ? 1 : -1;
          animer(e, [{opacity:1, transform:'translate(0px,0px) rotate(0deg) scale(1)'}, {opacity:1, transform:'translate(' + (26 * s) + 'px,-10px) rotate(' + (18 * s) + 'deg) scale(1.02)', offset:.3}, {opacity:0, transform:'translate(' + (70 * s) + 'px,-24px) rotate(' + (42 * s) + 'deg) scale(.86)'}],
            {duration:520, easing:'cubic-bezier(.2,.7,.4,1)', fill:'forwards'}).then(function(){ montrer(e, false); e.style.transform = ''; }); });
        var c = me._px(126, 160);
        pluie(me.fx, c.x, c.y, {n:12, forme:'trait', c:['#f4f8ff', '#e8f0ff'], v0:140, v1:300, g:400, t0:12, t1:22, d0:400, d1:700});
        pluie(me.fx, c.x, c.y - 20, {n:6, c:'#f8ffe8', bord:true, v0:80, v1:200, g:500, t0:3, t1:5, d0:500, d1:800});
        anneau(me.fx, c.x, c.y, {c:'#f4f8ff', w:120, s0:.3, s1:1.8, d:500});
      }},
      {d:300, p:ouvre, e:'lin', f0:function(){ me._toile = false; }}, {d:380, p:g, e:'b', f0:function(){ me.expr('content'); }, f:function(){ me.expr('garde'); }}]).then(function(){ me._toile = false; });
  });
};

/* ============ Bourbe : h.avale() (happé par la langue) et h.recrache(scene, depuis) (il revient couvert de bave) ============ */
H.avale = function(opt){
  opt = opt || {};
  return this._file(function(){
    var me = this, g = this.garde();
    this._mesure();
    this._etoiles(false);
    var p = this._px(146, 150), D = opt.d || 460, dx = opt.dx || 170;
    this.expr('surpris');
    /* le bout de la langue colle à la poitrine (dans la boîte : il part avec lui) */
    var gl = div(this.boite, 'width:46px;height:40px;z-index:5', '<svg viewBox="-24 -20 48 40" style="width:100%;height:100%;display:block;overflow:visible"><path d="M-14 -6 C -18 -16 -2 -20 8 -16 C 20 -14 24 -2 18 8 C 12 18 -6 18 -12 10 C -18 4 -16 0 -14 -6 Z" fill="#d98aa4" stroke="#24182e" stroke-width="2.4"/><ellipse cx="-2" cy="-8" rx="7" ry="3.5" fill="#fff" opacity=".7"/><path d="M-6 14 C -7 20 -5 24 -3 25 C -1 23 -1 19 -2 14 Z" fill="#d98aa4" stroke="#24182e" stroke-width="1.6"/></svg>');
    jouerEl(gl, [{transform:place(p.x, p.y, 0, .3), opacity:0}, {transform:place(p.x, p.y, 0, 1.1), opacity:1, offset:.2}, {transform:place(p.x, p.y, 0, 1), opacity:1}], {duration:D, easing:'ease-out'});
    pluie(this.fx, p.x, p.y, {n:6, forme:'goutte', c:['#d98aa4', '#e8f4ff'], angle:-90, ecart:70, v0:60, v1:140, g:600, t0:5, t1:7, d0:400, d1:600});
    var tire = copieP(g, {racine:{y:-6}, bassin:{x:10}, torse:24, tete:16, mA:[120, 120], hA:-150, mB:[60, 100], hB:-170, cB:-1, pA:[96, 262], fA:30, pB:[150, 272]});
    var happe = {racine:{y:-30}, bassin:{x:16, y:10}, torse:30, tete:24, mA:[100, 90], hA:-160, mB:[50, 80], hB:-170, cB:-1, pA:[80, 240], fA:50, pB:[110, 250], fB:40};
    var a = this.boite.animate([{transform:'translate(0px,0px)', opacity:1}, {transform:'translate(14px,-4px) rotate(4deg)', opacity:1, offset:.22, easing:'cubic-bezier(.6,0,.9,.4)'},
      {transform:'translate(' + dx + 'px,-46px) rotate(30deg) scale(.42)', opacity:0}], {duration:D, fill:'forwards'});
    this.jouer([{d:D * .22, p:tire, e:'oo'}, {d:D * .78, p:happe, e:'i'}]);
    return a.finished.then(function(){
      me._avale = true;
      me.boite.style.opacity = '0'; me.boite.style.transform = ''; a.cancel();
      me._idleOff();
      me.poser(g);
    });
  });
};
H.recrache = function(scene, depuis, opt){
  /* recrache(point) : point en pixels de l'écran (comme bete.ancre('bouche')) ; recrache(scene, point) : en pixels de la scène */
  if(scene && scene.x !== undefined){ opt = depuis; depuis = scene; scene = null; }
  opt = opt || {};
  return this._file(function(){
    this._mesure();
    var me = this, g = this.garde(), F2 = this.fx, c0 = this._px(125, 160), dep = depuis ? this._versBoite(scene, depuis) : {x:c0.x + 360, y:c0.y - 60};
    var C = this._calques('bave');
    var ox = dep.x - c0.x, oy = dep.y - c0.y, D = opt.d || 720, N = 16, kf = [], hautV = Math.max(70, Math.abs(ox) * .28);
    /* le vol : une cloche, il tourne en boule */
    for(var i = 0; i <= N; i++){
      var t = i / N, u = 1 - t, mx = ox / 2, my = Math.min(oy, 0) / 2 - hautV, x = u * u * ox + 2 * u * t * mx, y = u * u * oy + 2 * u * t * my;
      kf.push({offset:t, transform:'translate(' + r1(x) + 'px,' + r1(y) + 'px) rotate(' + r1(-540 * u) + 'deg) scale(' + (.62 + .38 * t).toFixed(3) + ')', opacity:1});
    }
    this.boite.style.opacity = ''; this._avale = false;
    var b0 = (g.bassin && g.bassin.y) || 0;
    var boule = {racine:{y:-30}, bassin:{y:b0 + 30}, torse:34, tete:24, pA:[118, 226], fA:40, pB:[150, 222], fB:40, mA:[160, 204], hA:60, mB:[136, 206], hB:60, cB:1};
    var splat = {racine:{y:0}, bassin:{y:b0 + 34, x:-4}, torse:22, tete:14, pA:[88, 272], pB:[172, 272], mA:[200, 176], hA:20, mB:[58, 180], hB:-160, cB:-1};
    var beurk = copieP(g, {bassin:{y:b0 + 10}, torse:10, tete:14, mA:[176, 168], mB:[96, 170]});
    var se1 = copieP(beurk, {torse:-6, tete:-22, bassin:{y:b0 + 8, r:-4}, mA:[196, 130], mB:[70, 120], cB:-1}), se2 = copieP(beurk, {torse:20, tete:24, bassin:{y:b0 + 8, r:4}, mA:[160, 120], mB:[110, 110], cB:1});
    this.poser(boule);
    this.boite.animate(kf, {duration:D, easing:'linear'});
    var pied = this._px(126, 292), atterrit = function(){
      me.expr('aie');
      ['epaules', 'tete', 'bras'].forEach(function(q, k){ montrer(C[q], true); animer(C[q], [{opacity:0, transform:'scale(.5)'}, {opacity:1, transform:'scale(1.12)', offset:.5}, {opacity:1, transform:'scale(1)'}], {duration:280, delay:k * 40, easing:'ease-out', fill:'backwards'}); });
      /* la flaque de bave sous ses pieds, des éclaboussures */
      surgit(F2, pied.x, pied.y + 2, 150, 26, '<svg viewBox="-75 -13 150 26" style="width:100%;height:100%;display:block;overflow:visible"><path d="M-66 2 C -70 -8 -40 -11 -10 -10 C 20 -12 64 -9 68 0 C 70 8 40 11 0 10 C -36 11 -62 10 -66 2 Z" fill="#a6e07a" fill-opacity=".85" stroke="#3e7a2a" stroke-width="2"/><ellipse cx="-20" cy="-4" rx="18" ry="3" fill="#eaffd0" opacity=".8"/></svg>',
        {d:2200, k:[{transform:place(pied.x, pied.y + 2, 0, .2) + ' scaleY(.5)', opacity:0}, {transform:place(pied.x, pied.y + 2, 0, 1.05), opacity:1, offset:.08}, {transform:place(pied.x, pied.y + 2, 0, 1), opacity:1, offset:.7}, {transform:place(pied.x, pied.y + 2, 0, 1.1), opacity:0}]});
      pluie(F2, pied.x, pied.y - 6, {n:14, forme:'goutte', c:['#a6e07a', '#c8f0a0', '#7ac85a'], angle:-90, ecart:75, v0:90, v1:220, g:700, t0:6, t1:9, d0:500, d1:800});
      if(opt.onAtterrit) try { opt.onAtterrit(); } catch(e){ console.error(e); }
    };
    var goutter = function(){
      /* la bave dégouline (on lit les points d'abord, on crée les gouttes ensuite) */
      var pts = [];
      ['tete', 'epaules', 'bras'].forEach(function(q){ (C.gouttes[q] || []).slice(0, 2).forEach(function(p){ var r = me._px(p[0], p[1]); pts.push(r); }); });
      pts.forEach(function(r, k){ pluie(F2, r.x, r.y, {n:1, forme:'goutte', c:'#a6e07a', angle:90, ecart:5, v0:5, v1:20, g:420, t0:6, t1:7, d0:700, d1:900, retard:k * 70}); });
    };
    var secoue = function(){
      ['epaules', 'tete', 'bras'].forEach(function(q){ animer(C[q], [{opacity:1, transform:'scale(1) rotate(0deg)'}, {opacity:.9, transform:'scale(1.03) rotate(-3deg)', offset:.2}, {opacity:.75, transform:'scale(.98) rotate(3deg)', offset:.45}, {opacity:0, transform:'scale(.9) rotate(0deg)'}],
        {duration:620, easing:'ease-in', fill:'forwards'}).then(function(){ if(!C[q]._a) montrer(C[q], false); }); });
      var a = me._px(126, 20), b = me._px(124, 106);
      pluie(F2, a.x, a.y, {n:9, forme:'goutte', c:['#a6e07a', '#c8f0a0'], angle:-90, ecart:85, v0:140, v1:260, g:800, t0:6, t1:9, d0:550, d1:850, etale:300});
      pluie(F2, b.x, b.y, {n:8, forme:'goutte', c:['#a6e07a', '#7ac85a'], angle:-90, ecart:85, v0:120, v1:240, g:800, t0:5, t1:8, d0:550, d1:850, etale:300});
    };
    var seq = [{d:D, p:boule, e:'lin'}, {d:110, p:splat, e:'oo', f0:atterrit}, {d:240, p:splat, e:'lin'}, {d:260, p:beurk, e:'io', f0:function(){ me.expr('surpris'); goutter(); }},
      {d:300, p:beurk, e:'lin', f0:function(){ me.expr('aie'); }}];
    for(var k = 0; k < 6; k++) seq.push({d:95, p:k % 2 ? se2 : se1, e:'io', f0:k ? null : secoue});
    seq.push({d:380, p:g, e:'b', f0:function(){ me.expr('content'); }, f:function(){ me.expr('garde'); me.cligner(); }});
    return this.jouer(seq);
  });
};
