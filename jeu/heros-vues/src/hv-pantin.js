/* ==========================================================
   Les héros « en volume » — 5 sur 5 : LE PANTIN (ce qui assemble le dessin, et ce qui le fait vivre).
   HV.dessin(h, P, o) → le dessin (du SVG) du héros h dans la pose P, pour un cadre 300 × 440 :
     P.cap : vers où le corps est tourné (0 de face, 90 à droite, -90 à gauche) ; P.tete : la tête en plus, par rapport au corps ;
     P.pen : elle penche la tête ; P.rx, P.ry : le regard ; P.yo : les yeux ouverts ; P.souffle ; P.qx, P.qz : la queue de cheval…
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, RAD = HV.RAD, f1 = U.f1;

HV.dessin = function(h, P, o){
  o = o || {}; P = P || {};
  if(HV.POSES && !P.mainG){ var B0 = HV.POSES.repos, P2 = {}, kk; for(kk in B0) P2[kk] = B0[kk]; for(kk in P) P2[kk] = P[kk]; P = P2; }
  var K = o.K || HV.contexte(o.id || 'hv', h), cap = P.cap || 0, dt = P.tete || 0;
  var Vb = U.vue(cap), Vt = U.vue(cap + dt);
  var coif = HV.COIFFURES[h.coiffure] || HV.COIFFURES.queue;
  var CH = HV.cheveux(K, coif, Vt, P), T = HV.tete(K, h, Vt, P, CH), C = HV.corps(K, h, Vb, P);
  /* la place de la tête : elle tourne autour de l'axe du cou */
  var xo = 3 * Math.sin(dt * RAD), zo = -2 + 3 * Math.cos(dt * RAD), Xo = xo * Vb.c + zo * Vb.s + (P.tx || 0), Yo = 92 + (P.ty || 0);
  var tT = 'translate(' + f1(Xo) + ' ' + f1(Yo) + ')' + (P.pen ? ' rotate(' + f1(P.pen) + ' 0 28)' : '');
  var haut = 'translate(' + f1(150 + (P.bx || 0)) + ' ' + f1(-(P.souffle || 0) * 1.3) + ')';
  var ombreCou = '<path d="' + T.peau + '" transform="translate(' + f1(Xo + 1.2) + ' ' + f1(Yo + 7.5) + ')" fill="' + K.peau.ombre + '" opacity=".8"/>';
  var s = '<ellipse cx="150" cy="415" rx="' + f1(50 + 8 * Math.abs(Vb.s)) + '" ry="7" fill="' + K.u('ombre') + '"/>';
  /* l'ordre des morceaux : la tête vue de face (les cheveux de derrière d'abord, le visage à la fin) ou de dos (le visage d'abord,
     puis le cou, puis les cheveux par-dessus) ; la queue de cheval passe devant tout quand elle est de notre côté */
  var tDos = Vt.c < -0.15, G1 = '<g transform="' + tT + '">', bras = P.brasDessus ? '' : C.devant;
  s += '<g transform="' + haut + '">' + G1 + (CH.queueDevant ? '' : CH.queue) + (tDos ? '' : CH.dos) + '</g>' + C.derriere + '</g>';
  s += '<g transform="translate(150 0)">' + C.jambes + '</g>';
  s += '<g transform="' + haut + '">' + (tDos ? G1 + T.svg + T.oreille + '</g>' : '') + C.cou(Yo + (tDos ? 15 : 8), tDos ? '<rect x="-30" y="' + f1(Yo + 12) + '" width="60" height="13" fill="' + K.peau.ombre + '" opacity=".75"/>' : ombreCou) + C.torse + C.carquoisDevant + bras +
    G1 + (tDos ? CH.dos + CH.devant : T.svg + CH.devant + T.oreille + T.sourcils) + (CH.queueDevant ? CH.queue : '') + '</g>' + (P.brasDessus ? C.devant : '') + '</g>';
  return s;
};
/* ==========================================================
   LES POSES : où sont les mains, les pieds, la tête. Une pose ne dit que ce qui change par rapport à « repos ».
   (mainG : SON bras droit, à gauche de l'écran quand elle est de face — celui qui tient l'arc ; mainD : SON bras gauche.)
   ========================================================== */
HV.POSES = {
  repos:{mainG:[-49, 243, 4], coudeG:[-0.7, -0.1, -0.7], mainD:[49, 243, 4], coudeD:[0.7, -0.1, -0.7], piedG:[-19, 386, 3], piedD:[19, 386, -3], ouvG:0.3, ouvD:0.3,
    tete:0, pen:0, bx:0, ty:0, sourcils:0, arcDir:[-0.82, 0, 0.57], tendu:0, brasDessus:0},
  /* une main sur la hanche, la tête un peu penchée */
  hanche:{mainD:[30, 213, 10], coudeD:[1, -0.1, -0.5], pen:-5, bx:2.5, piedD:[23, 386, -2]},
  /* elle fait coucou de sa main libre */
  coucou:{mainD:[73, 103, 12], coudeD:[0.5, 1, -0.1], pen:4, sourcils:0.6, brasDessus:1},
  /* elle vise : le bras de l'arc tendu sur le côté, la corde à la joue, la tête tournée vers la cible */
  tir:{mainG:[-116, 151, 5], coudeG:[0, 0.7, -0.6], mainD:[17, 128, 12], coudeD:[1, -0.35, -0.3], tete:-84, sourcils:-0.6, arcDir:[-1, 0, 0.04], tendu:1, brasDessus:1,
    piedG:[-26, 386, 2], piedD:[22, 386, -2]}
};
HV.pose = function(nom){
  var B = HV.POSES.repos, Q = HV.POSES[nom] || {}, R = {}, k;
  for(k in B) R[k] = Q[k] !== undefined ? Q[k] : B[k];
  return R;
};
function melange(a, b, t){
  var R = {}, k;
  for(k in b){
    var x = a[k], y = b[k];
    if(x === undefined) x = y;
    R[k] = y instanceof Array ? y.map(function(v, i){ return x[i] + (v - x[i]) * t; }) : typeof y === 'number' ? x + (y - x) * t : y;
  }
  return R;
}
function eio(u){ return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

/* ==========================================================
   LE PANTIN : HV.monter(hote, h, o) pose le dessin dans « hote » et le fait vivre.
     .vers(angle)   : elle se tourne (la tête part la première, le corps suit, la queue de cheval traîne) ;
     .pose(nom)     : elle prend une pose, en glissant ;
     .regard(x, y)  : où elle regarde (-1 … 1) ;
     .fige(P)       : une image fixe (pour les planches et les films : plus de hasard) ;
   Une seule boucle pour tous les pantins, à 30 dessins par seconde au plus ; elle s'arrête quand il n'y en a plus à l'écran.
   ========================================================== */
var PANTINS = [], RAF = 0, NP = 0;
function boucle(now){ RAF = 0; for(var i = PANTINS.length - 1; i >= 0; i--) PANTINS[i].image(now); if(PANTINS.length) RAF = requestAnimationFrame(boucle); }
function lancer(){ if(!RAF && PANTINS.length && typeof requestAnimationFrame === 'function') RAF = requestAnimationFrame(boucle); }

function Pantin(hote, h, o){
  o = o || {};
  this.h = h; this.hote = hote; this.K = HV.contexte(o.id || ('hv' + (++NP)), h);
  hote.innerHTML = '<svg class="hv" viewBox="' + (o.cadre || '0 0 300 440') + '" xmlns="http://www.w3.org/2000/svg">' + HV.defs(this.K) + '<g class="hv-fig"></g></svg>';
  this.fig = hote.querySelector('.hv-fig');
  this.cap = o.cap || 0; this.capV = this.cap; this.vc = 0;          /* le corps : où il est tourné, où il veut l'être, sa vitesse */
  this.tt = 0; this.vt = 0;                                           /* la tête, en plus du corps */
  this.q = {x:0, z:0, vx:0, vz:0};                                    /* le bout de la queue de cheval */
  this.jupe = {x:0, v:0};
  this.A = HV.pose('repos'); this.B = this.A; this.tw = 1; this.dur = 0.4; this.nom = 'repos';
  this.t = 0; this.t0 = 0; this.cli = {t:1.2 + Math.random() * 2, d:0}; this.reg = {x:0, y:0, cx:0, cy:0, jusqu:0}; this.oe = {t:2, x:0, y:0};
  this.auto = o.vie !== false; this.mort = false; this.hors = 0;
  this.dessiner(0);
  PANTINS.push(this); lancer();
}
var PP = Pantin.prototype;
PP.detruire = function(){ this.mort = true; var i = PANTINS.indexOf(this); if(i >= 0) PANTINS.splice(i, 1); };
PP.vers = function(angle, net){ this.capV = angle; if(net){ this.cap = angle; this.vc = 0; } lancer(); };
PP.pose = function(nom, dur){
  if(nom === this.nom) return;
  this.A = this.courante(); this.B = HV.pose(nom); this.tw = 0; this.dur = dur || 0.45; this.nom = nom; this.tPose = this.t;
  lancer();
};
PP.courante = function(){ return this.tw >= 1 ? this.B : melange(this.A, this.B, eio(this.tw)); };
PP.regard = function(x, y, ms){ this.reg.cx = x; this.reg.cy = y; this.reg.jusqu = this.t + (ms || 1500) / 1000; };
PP.image = function(now){
  if(this.mort) return;
  if(!this.hote.isConnected){ if(++this.hors > 200) this.detruire(); return; }
  this.hors = 0;
  var ecart = this.t0 ? now - this.t0 : 33;
  if(ecart < 30) return;
  this.t0 = now;
  this.dessiner(Math.min(0.06, ecart / 1000));
};
/* faire avancer le pantin de dt secondes, et le redessiner */
PP.dessiner = function(dt){
  var t = (this.t += dt), TAU = Math.PI * 2;
  if(this.tw < 1) this.tw = Math.min(1, this.tw + dt / this.dur);
  var F = melange({}, this.courante(), 1), nom = this.nom, i;
  /* --- elle se tourne : un ressort bien amorti ; la tête prend de l'avance, les yeux encore plus --- */
  var ec = this.capV - this.cap;
  this.vc += (62 * ec - 15.5 * this.vc) * dt; this.cap += this.vc * dt;
  if(Math.abs(ec) < 0.05 && Math.abs(this.vc) < 0.5){ this.cap = this.capV; this.vc = 0; }
  var avance = Math.max(-46, Math.min(46, ec * 0.62)), tv = F.tete + avance;
  this.vt += (150 * (tv - this.tt) - 22 * this.vt) * dt; this.tt += this.vt * dt;
  F.cap = this.cap; F.tete = this.tt;
  /* --- la queue de cheval et la jupe : elles traînent derrière le mouvement, puis se balancent --- */
  var om = this.vc + this.vt, q = this.q, cx = Math.max(-17, Math.min(17, om * 0.075));
  q.vx += (95 * (cx - q.x) - 7.5 * q.vx) * dt; q.x += q.vx * dt;
  q.vz += (95 * (-Math.abs(cx) * 0.3 - q.z) - 9 * q.vz) * dt; q.z += q.vz * dt;
  var j = this.jupe, cj = Math.max(-5, Math.min(5, this.vc * 0.022));
  j.v += (120 * (cj - j.x) - 9 * j.v) * dt; j.x += j.v * dt;
  F.qx = q.x; F.qz = q.z; F.jx = j.x;
  F.rx = Math.max(-1, Math.min(1, ec / 34)); F.ry = 0; F.yo = 1; F.souffle = 0;
  if(this.auto){
    /* --- sa petite vie : elle respire, cligne des yeux, bouge un peu la tête, jette un coup d'œil --- */
    var re = Math.sin(TAU * t / 3.6);
    F.souffle = 0.5 + 0.5 * re;
    F.pen += 1.1 * Math.sin(TAU * t / 7.3 + 1); F.tete += 2.6 * Math.sin(TAU * t / 9.1);
    F.qx += 1.5 * Math.sin(TAU * t / 4.2); F.qz += 0.8 * Math.sin(TAU * t / 5.7 + 2);
    F.mainG = [F.mainG[0] - 0.7 * re, F.mainG[1] + 0.3 * re, F.mainG[2] + 1.2 * Math.sin(TAU * t / 5.1)];
    F.mainD = [F.mainD[0] + 0.7 * re, F.mainD[1] + 0.3 * re, F.mainD[2] - 1.2 * Math.sin(TAU * t / 5.1)];
    var cl = this.cli;
    if(cl.d > 0){ cl.d -= dt; F.yo = 1 - Math.sin(Math.PI * Math.max(0, Math.min(1, 1 - cl.d / 0.17))); if(cl.d <= 0) cl.t = t + 2.2 + Math.random() * 3.6; }
    else if(t > cl.t){ cl.d = 0.17; if(Math.random() < 0.2) cl.t = t + 0.32; }
    var oe = this.oe;
    if(t > oe.t){ oe.t = t + 1.6 + Math.random() * 3; oe.x = Math.random() < 0.45 ? 0 : (Math.random() * 2 - 1) * 0.8; oe.y = Math.random() < 0.6 ? 0 : (Math.random() - 0.5) * 0.7; }
    oe.cx = (oe.cx || 0) + (oe.x - (oe.cx || 0)) * Math.min(1, dt * 9); oe.cy = (oe.cy || 0) + (oe.y - (oe.cy || 0)) * Math.min(1, dt * 9);
    if(Math.abs(ec) < 3){ F.rx += oe.cx; F.ry += oe.cy; }
  }
  if(t < this.reg.jusqu){ F.rx = this.reg.cx; F.ry = this.reg.cy; }
  /* --- les gestes des poses --- */
  var w = nom === this.nom ? eio(this.tw) : 0, tp = t - (this.tPose || 0);
  if(nom === 'coucou'){ var a = Math.sin(TAU * tp * 2.3); F.mainD = [F.mainD[0] + 9 * a * w, F.mainD[1] + 3 * Math.abs(a) * w, F.mainD[2]]; F.yo = Math.min(F.yo, 1 - 0.0 * w); }
  if(nom === 'tir'){ F.rx = -0.5 * w; F.souffle *= 0.4; }
  this.F = F;
  this.fig.innerHTML = HV.dessin(this.h, F, {K:this.K});
};
/* une image fixe, sans hasard : P (une pose complète ou ses seuls changements), dt facultatif */
PP.fige = function(P){ this.auto = false; var F = melange({}, HV.pose('repos'), 1), k; for(k in P) F[k] = P[k]; this.F = F; this.fig.innerHTML = HV.dessin(this.h, F, {K:this.K}); };
HV.monter = function(hote, h, o){ return new Pantin(hote, h, o); };
HV.pantins = function(){ return PANTINS.slice(); };

HV.svg = function(h, P, o){
  o = o || {};
  var K = HV.contexte(o.id || 'hv', h);
  return '<svg class="hv" viewBox="' + (o.cadre || '0 0 300 440') + '" xmlns="http://www.w3.org/2000/svg">' + HV.defs(K) + '<g class="hv-fig">' + HV.dessin(h, P, {K:K}) + '</g></svg>';
};
})(window);
