
/* ============ les tissus et les cheveux souples (simulés à chaque image) ============ */
/* chaque point a un ressort vers sa place « dessinée » (qui suit le corps), l'air le freine, la pesanteur le tire */
function mat(el){ var m = el.getCTM(); return m ? [m.a, m.b, m.c, m.d, m.e, m.f] : [1, 0, 0, 1, 0, 0]; }
function ap(m, x, y){ return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
function inv(m){ var det = m[0] * m[3] - m[1] * m[2] || 1e-6; return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det]; }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
/* une courbe lisse (Catmull-Rom) qui passe par tous les points */
function lisse(p, ferme){
  var n = p.length; if(n < 2) return '';
  var s = 'M' + r1(p[0][0]) + ' ' + r1(p[0][1]);
  var last = ferme ? n : n - 1;
  for(var i = 0; i < last; i++){
    var p0 = p[ferme ? (i - 1 + n) % n : Math.max(i - 1, 0)], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[ferme ? (i + 2) % n : Math.min(i + 2, n - 1)];
    s += ' C ' + r1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + r1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + r1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + r1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + r1(p2[0]) + ' ' + r1(p2[1]);
  }
  return s + (ferme ? ' Z' : '');
}
var SVGNS = 'http://www.w3.org/2000/svg';
function nouveau(parent, tag, at){ var e = document.createElementNS(SVGNS, tag); for(var k in at) e.setAttribute(k, at[k]); parent.appendChild(e); return e; }

function Souple(h, spec){
  this.h = h; this.s = spec; this.t = Math.random() * 10;
  this.g = h.svg.querySelector('[data-souple="' + spec.nom + '"]');
  var me = this;
  if(spec.type === 'meche'){
    this.ch = [spec.pts.map(function(p){ return {r:p}; })];
    this.els = [nouveau(this.g, 'path', {fill:spec.f, stroke:O, 'stroke-width':3, 'stroke-linejoin':'round'})];
    (spec.traits || []).forEach(function(t){ me.els.push(nouveau(me.g, 'path', {fill:'none', stroke:t[0], 'stroke-width':t[1], opacity:t[2], 'stroke-linecap':'round'})); });
    if(spec.noeud) this.noeud = nouveau(this.g, 'circle', {r:spec.rNoeud || 5, fill:spec.noeud, stroke:O, 'stroke-width':2.4});
  } else if(spec.type === 'tresse'){
    this.ch = [spec.pts.map(function(p){ return {r:p}; })];
    this.els = [];
    for(var k = 0; k < spec.n; k++){
      var gg = nouveau(this.g, 'g', {});
      nouveau(gg, 'ellipse', {rx:7, ry:9, fill:spec.f, stroke:O, 'stroke-width':2.6});
      nouveau(gg, 'path', {d:'M-3 -4 q 3 3 6 0', fill:'none', stroke:spec.trait, 'stroke-width':1.6, opacity:.7});
      this.els.push(gg);
    }
    this.bout = nouveau(this.g, 'circle', {r:4, fill:spec.bout, stroke:O, 'stroke-width':2});
  } else {
    var dos = spec.dos || [spec.haut[0], lerp(spec.haut[0], spec.bas[0], .5), spec.bas[0]];
    var dev = spec.devant || [spec.haut[1], lerp(spec.haut[1], spec.bas[1], .5), spec.bas[1]];
    this.ch = [dos.map(function(p){ return {r:p}; }), dev.map(function(p){ return {r:p}; })];
    this.els = spec.chemins.map(function(c){
      var at = {fill:c.f || 'none'};
      if(c.contour){ at.stroke = O; at['stroke-width'] = 3; at['stroke-linejoin'] = 'round'; }
      if(c.s){ at.stroke = c.s; at['stroke-width'] = c.w; at['stroke-linecap'] = 'round'; }
      if(c.tirets) at['stroke-dasharray'] = '3 3';
      if(c.o) at.opacity = c.o;
      return nouveau(me.g, 'path', at);
    });
  }
  /* les longueurs de repos */
  this.ch.forEach(function(c){ for(var i = 1; i < c.length; i++) c[i].L = Math.hypot(c[i].r[0] - c[i - 1].r[0], c[i].r[1] - c[i - 1].r[1]); });
  this.init = false;
}
Souple.prototype.pas = function(dt, o, sol){
  var s = this.s, me = this, h = this.h;
  this.t += dt;
  var Mf = mat(this.g), M = Mf, sc = Math.hypot(M[0], M[1]);
  /* une jupe se calcule dans le repère du bassin (pas de vent de course), un tissu dans le monde */
  if(s.type === 'jupe'){ M = [1, 0, 0, 1, 0, 0]; o = [0, 0]; sc = 1; sol = 1e9; }
  var W = function(p){ var q = ap(M, p[0], p[1]); return [q[0] + o[0], q[1] + o[1]]; };
  /* la jupe : le bas suit les jambes */
  var cible = null;
  if(s.type === 'jupe'){
    if(!this.jA){ this.jA = h.svg.querySelector('[data-i="' + s.jambe + 'A"]'); this.jB = h.svg.querySelector('[data-i="' + s.jambe + 'B"]'); }
    var jA = this.jA, jB = this.jB, Mfi = inv(Mf);
    var a = ap(mat(jA), SQ.cuisseA[0], s.yJ), b = ap(mat(jB), SQ.cuisseB[0], s.yJ);
    a = ap(Mfi, a[0], a[1]); b = ap(Mfi, b[0], b[1]);
    var ar = a[0] < b[0] ? a : b, av = a[0] < b[0] ? b : a;
    if(s.milieu){ var mi = lerp(a, b, .5); ar = [mi[0] - 10, mi[1]]; av = [mi[0] + 10, mi[1]]; }
    var oa = [s.bas[0][0] - SQ.cuisseA[0], s.bas[0][1] - s.yJ], ob = [s.bas[1][0] - SQ.cuisseB[0], s.bas[1][1] - s.yJ];
    cible = [[ar[0] + oa[0], Math.max(ar[1], av[1] - 6) + oa[1]], [av[0] + ob[0], Math.max(av[1], ar[1] - 6) + ob[1]]];
  }
  var vent = (s.vent || 0) * (h._calme ? 1 : 0.5);
  this.ch.forEach(function(c, ci){
    var n = c.length - 1;
    c.forEach(function(p, i){
      var w = W(p.r);
      if(cible && i === n) w = cible[ci];
      if(cible && i > 0 && i < n){ var a0 = W(c[0].r), b0 = cible[ci]; w = [(a0[0] + b0[0]) / 2 + (ci ? 2 : -3) * sc, (a0[1] + b0[1]) / 2]; }
      if(!me.init || i === 0){ p.x = w[0]; p.y = w[1]; p.vx = 0; p.vy = 0; return; }
      var f = i / n, k = s.k * (1 - 0.45 * f), c2 = s.c * (0.7 + 0.6 * f);
      var ax = k * (w[0] - p.x) - c2 * p.vx, ay = k * (w[1] - p.y) - c2 * p.vy + (s.g || 0) * sc;
      if(vent){ ax += vent * 70 * sc * f * (Math.sin(me.t * 1.9 + i * 0.9 + ci) + 0.55 * Math.sin(me.t * 3.3 + i * 1.7)); ay += vent * 18 * sc * f * Math.sin(me.t * 2.6 + i); }
      p.vx += ax * dt; p.vy += ay * dt;
      p.px = p.x; p.py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt;
    });
    /* les longueurs (un tissu ne s'étire pas ; une jupe un peu) */
    if(me.init) for(var i = 1; i <= n; i++){
      var p = c[i], q = c[i - 1], dx = p.x - q.x, dy = p.y - q.y, dd = Math.hypot(dx, dy) || 1e-3, L = p.L * sc;
      var t = s.type === 'jupe' ? (dd > L * 1.35 ? L * 1.35 : dd < L * 0.7 ? L * 0.7 : dd) : L;
      p.x = q.x + dx / dd * t; p.y = q.y + dy / dd * t;
      if(p.y > sol){ p.y = sol; p.vx *= 0.85; }
      p.vx = (p.x - p.px) / dt; p.vy = (p.y - p.py) / dt;
    }
  });
  this.init = true;
  /* retour dans le repère de la pièce, puis le dessin */
  var Mi = inv(M), loc = this.ch.map(function(c){ return c.map(function(p){ return ap(Mi, p.x - o[0], p.y - o[1]); }); });
  this.dessiner(loc);
};
Souple.prototype.dessiner = function(loc){
  var s = this.s, me = this;
  if(s.type === 'meche' || s.type === 'tresse'){
    /* l'épine, échantillonnée */
    var c = loc[0], ep = [], la = [];
    for(var i = 0; i < c.length - 1; i++){
      var p0 = c[Math.max(i - 1, 0)], p1 = c[i], p2 = c[i + 1], p3 = c[Math.min(i + 2, c.length - 1)];
      for(var k = 0; k < 4; k++){
        var t = k / 4, t2 = t * t, t3 = t2 * t;
        ep.push([0, 1].map(function(j){ return 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3); }));
        if(s.larg) la.push(s.larg[i] + (s.larg[i + 1] - s.larg[i]) * t);
      }
    }
    ep.push(c[c.length - 1]); if(s.larg) la.push(s.larg[s.larg.length - 1]);
    var nor = ep.map(function(p, i){ var a = ep[Math.max(i - 1, 0)], b = ep[Math.min(i + 1, ep.length - 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
    if(s.type === 'meche'){
      var g = [], d = [];
      ep.forEach(function(p, i){ g.push([p[0] + nor[i][0] * la[i] / 2, p[1] + nor[i][1] * la[i] / 2]); d.unshift([p[0] - nor[i][0] * la[i] / 2, p[1] - nor[i][1] * la[i] / 2]); });
      this.els[0].setAttribute('d', lisse(g.concat(d), true));
      (s.traits || []).forEach(function(t, k){
        var pts = ep.slice(2, ep.length - 3).map(function(p, i){ var j = i + 2; return [p[0] + nor[j][0] * la[j] * t[3], p[1] + nor[j][1] * la[j] * t[3]]; });
        me.els[k + 1].setAttribute('d', lisse(pts, false));
      });
      if(this.noeud){ var ni = s.pompon ? ep.length - 1 : 2; this.noeud.setAttribute('cx', r1(ep[ni][0])); this.noeud.setAttribute('cy', r1(ep[ni][1])); }
    } else {
      /* la tresse : des maillons le long de l'épine */
      var cum = [0]; for(var i = 1; i < ep.length; i++) cum.push(cum[i - 1] + Math.hypot(ep[i][0] - ep[i - 1][0], ep[i][1] - ep[i - 1][1]));
      var tot = cum[cum.length - 1], j = 0;
      this.els.forEach(function(el, k){
        var at = Math.min(k * s.pasT, tot);
        while(j < cum.length - 2 && cum[j + 1] < at) j++;
        var u = (at - cum[j]) / ((cum[j + 1] - cum[j]) || 1), x = ep[j][0] + (ep[j + 1][0] - ep[j][0]) * u, y = ep[j][1] + (ep[j + 1][1] - ep[j][1]) * u;
        var an = Math.atan2(ep[j + 1][1] - ep[j][1], ep[j + 1][0] - ep[j][0]) * 180 / Math.PI - 90;
        el.setAttribute('transform', 'translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + r1(an) + ') scale(' + (1 - k * 0.04) + ')');
      });
      var fin = Math.min(this.els.length * s.pasT - 4, tot);
      while(j < cum.length - 2 && cum[j + 1] < fin) j++;
      var u2 = (fin - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
      this.bout.setAttribute('cx', r1(ep[j][0] + (ep[j + 1][0] - ep[j][0]) * u2)); this.bout.setAttribute('cy', r1(ep[j][1] + (ep[j + 1][1] - ep[j][1]) * u2));
    }
    return;
  }
  /* un tissu : on passe de (u, v) au dessin ; u va du bord arrière au bord avant, v du haut vers le bas */
  var B = loc[0], Fv = loc[1], t = this.t;
  function bord(c, v){ var q = [2 * c[1][0] - (c[0][0] + c[2][0]) / 2, 2 * c[1][1] - (c[0][1] + c[2][1]) / 2], a = (1 - v) * (1 - v), b = 2 * v * (1 - v), e = v * v; return [a * c[0][0] + b * q[0] + e * c[2][0], a * c[0][1] + b * q[1] + e * c[2][1]]; }
  var ond = s.onde === undefined ? 2.2 : s.onde;
  function M(u, v){
    var p = lerp(bord(B, v), bord(Fv, v), u);
    if(v > 0.85){ var w = (v - 0.85) / 0.15; p[1] += w * ond * Math.sin(u * 13 + t * 4.2) ; p[0] += w * ond * 0.5 * Math.cos(u * 9 + t * 3.1); }
    return p;
  }
  function ech(a0, a1, n, f){ var r = []; for(var i = 0; i <= n; i++) r.push(f(a0 + (a1 - a0) * i / n)); return r; }
  function zone(u0, u1, v0, v1){
    return ech(v0, v1, 6, function(v){ return M(u0, v); }).concat(ech(u0, u1, 8, function(u){ return M(u, v1); }).slice(1), ech(v1, v0, 6, function(v){ return M(u1, v); }).slice(1), ech(u1, u0, 3, function(u){ return M(u, v0); }).slice(1, -1));
  }
  s.chemins.forEach(function(c, k){
    var dd;
    if(c.contour) dd = lisse(zone(0, 1, 0, 1), true);
    else if(c.zone) dd = lisse(zone(c.zone[0], c.zone[1], c.zone[2], c.zone[3]), true);
    else { var l = c.ligne; dd = lisse(l[0] === 'u' ? ech(l[2], l[3], 6, function(v){ return M(l[1], v); }) : ech(l[2], l[3], 8, function(u){ return M(u, l[1]); }), false); }
    me.els[k].setAttribute('d', dd);
  });
};
