/* ==========================================================
   Mimi en pantin — 2 sur 3 : CE QUI LA FAIT VIVRE (DESIGN-saison1.md §12.66).
   Un pantin (MimiPantin.monter(svg)) redessine Mimi image par image :
     1. sa pose du moment, qui glisse vers la pose demandée (jamais d'un coup : Romain, « il n'y a pas de transition ») ;
        une patte qui doit changer de place se lève et se repose, elle ne glisse pas ;
     2. la marche, le trot, la course : les pattes suivent le chemin parcouru (elles ne patinent pas) ;
     3. le saut : elle se ramasse, remue les fesses, s'élance, s'étire en l'air, se réceptionne (jamais deux fois pareil) ;
     4. ses gestes (mimi-gestes.js), fondus les uns dans les autres ;
     5. sa petite vie : elle respire, cligne des yeux, une oreille frémit, la queue se balance avec un peu de retard ;
     6. son regard : ses yeux et sa tête suivent le doigt.
   Le reste du jeu (atelier.js) ne connaît que : pose(), cote(), geste(), sans(), marcher(), saut(), regard(), zone(), porter().
   Les classes CSS posées sur le chat par atelier.js (.at-x-…, .at-c-gauche…) sont lues à chaque image : elles lancent les gestes du même nom.
   Une seule boucle pour tous les pantins ; elle tourne au ralenti (une image sur deux) quand rien d'important ne bouge,
   et s'arrête quand il n'y a plus de pantin à l'écran.
   ========================================================== */
(function(G){
'use strict';
var M = G.MimiPantin, borne = M.outils.borne;
var MOINS = !!(G.matchMedia && G.matchMedia('(prefers-reduced-motion: reduce)').matches);
var TAU = Math.PI * 2;

function copie(P, o){ o = o || {}; for(var k in P) o[k] = P[k]; return o; }
function eio(u){ return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
function eo(u){ return 1 - (1 - u) * (1 - u); }
function seg(u, a, b){ return borne((u - a) / (b - a), 0, 1); }
function pic(u){ return Math.sin(Math.PI * borne(u, 0, 1)); }
function frac(x){ return x - Math.floor(x); }
function angle(d){ d = (d + 180) % 360; if(d < 0) d += 360; return d - 180; }
function vers(a, b, t){ return a + (b - a) * t; }
M.maths = {eio:eio, eo:eo, seg:seg, pic:pic, frac:frac, vers:vers, copie:copie, ang:angle};

var PANTINS = [], RAF = 0, IMG = 0;
M.CADENCE = [29, 62, 96];      /* le temps le plus court entre deux dessins (ms) : quand elle bouge (30 par seconde), au calme (15 : elle respire, sa queue se balance), endormie (10) */
function boucle(now){
  RAF = 0; IMG++;
  for(var i = PANTINS.length - 1; i >= 0; i--) PANTINS[i].image(now);
  if(PANTINS.length) RAF = requestAnimationFrame(boucle);
}
function lancer(){ if(!RAF && PANTINS.length) RAF = requestAnimationFrame(boucle); }

/* les pattes : [réglage x, réglage y, par terre à cette hauteur] */
var PATTES = [['a2x', 'a2y', -3.5], ['j1x', 'j1y', -1.8], ['a1x', 'a1y', -3.5], ['j2x', 'j2y', -1.8]];

function Pantin(svg, o){
  o = o || {};
  var moi = this;
  this.svg = svg; this.hote = o.hote || svg.parentNode;
  this.els = {}; this.att = {}; this.vu = {};
  Array.prototype.forEach.call(svg.querySelectorAll('[data-m]'), function(el){
    var s = el.getAttribute('data-m'), k = s.indexOf(':'), typ = k < 0 ? 't' : s.slice(k + 1);
    (moi.els[s] = moi.els[s] || []).push(el);
    moi.att[s] = typ === 't' ? 'transform' : typ === 'd' ? 'd' : typ === 'v' ? 'display' : 'opacity';
  });
  this.rac = svg.querySelector('.mi-rac'); this.gQueue = svg.querySelector('.mi-queue'); this.gPres = svg.querySelector('.mi-pres'); this.gTete = svg.querySelector('.mi-tete');
  this.gVl = svg.querySelector('.mi-vl'); this.gVq = svg.querySelector('.mi-vq'); this.gVc = svg.querySelector('.mi-vc');
  this.nom = o.pose || 'assis';
  this.P = M.pose(M.BASES[this.nom] || this.nom);
  /* sa direction (0 … 7, MimiPantin.VUES) : cap, là où elle est tournée ; capV, là où elle veut être tournée ; dir : la direction de sa marche
     ou de son saut (null : à l'arrêt, elle se remet de profil, du côté gauche ou droit que dit atelier.js) */
  this.gauche = !!o.gauche; this.cap = this.capV = this.gauche ? 4 : 0; this.capT = 0; this.dir = null; this.vueNom = 'profil';
  this.co = this.gauche ? -1 : 1;
  this.tw = null; this.couv = []; this.boucles = {}; this.cls = ''; this.clsG = {};
  this.t = 0; this.t0 = 0; this.vite = 0; this.phi = 0; this.mar = null; this.marW = 0; this.all = 'pas';
  this.q = null; this.reg = {x:0, y:0, w:0, cx:0, cy:0, jusqu:0};
  this.cli = {t:1.5 + Math.random() * 3, d:0}; this.ore = {t:3 + Math.random() * 5, d:0, c:0};
  this.F = {}; this.R = {}; this.qd = -1; this.hors = 0; this.mort = false;
  this.poseBoucle(this.nom);
  this.dessiner(0);
  PANTINS.push(this); lancer();
}
var PP = Pantin.prototype;

PP.detruire = function(){ this.mort = true; var i = PANTINS.indexOf(this); if(i >= 0) PANTINS.splice(i, 1); };

/* ---------- La pose ---------- */
/* une pose « composée » = une pose de base + un geste qui tourne (se laver, taper, manger…) */
PP.poseBoucle = function(nom){
  var veut = M.BOUCLES[nom] || null;
  if(this.bPose && this.bPose !== veut) this.sans(this.bPose);
  if(veut && this.bPose !== veut) this.geste(veut);
  this.bPose = veut;
};
PP.pose = function(nom, o){
  o = o || {};
  if(nom === this.nom && !o.plus && !o.force){ this.poseBoucle(nom); return 0; }
  var base = M.BASES[nom] || nom, cible = M.pose(base, o.plus), de = copie(this.P), k;
  this.nom = nom;
  this.poseBoucle(nom);
  var ecart = (Math.abs(cible.hx - de.hx) + Math.abs(cible.hy - de.hy) + Math.abs(cible.sx - de.sx) + Math.abs(cible.sy - de.sy)) / 2 + Math.abs(cible.bu - de.bu) * 16;
  var dur = o.dur || borne(250 + ecart * 9.5, 260, 720);
  if(MOINS || o.net){ this.P = cible; this.tw = null; this.reveiller(); return 0; }
  /* une patte posée qui doit changer de place : elle se lève et se repose, chacune à son tour */
  var pas = {}, n = 0;
  PATTES.forEach(function(pt){
    var dx = Math.abs(cible[pt[0]] - de[pt[0]]), sol = Math.abs(de[pt[1]] - pt[2]) < 1.2 && Math.abs(cible[pt[1]] - pt[2]) < 1.2;
    if(sol && dx > 2.4){ pas[pt[0]] = [0.06 + n * 0.14, 0.5 + n * 0.14, Math.min(4.2, 1.6 + dx * 0.22), pt[1]]; n++; }
  });
  /* (une pose qui n'est pas debout se prend de profil : elle finit d'abord de se tourner — attend) */
  var debout = base === 'debout';
  if(!debout && this.dir !== null) this.vers(null);
  this.tw = {a:de, b:cible, t:0, d:dur / 1000, pas:pas, attend:!debout};
  this.reveiller();
  return dur;
};
/* se tourner de l'autre côté (à l'arrêt) : elle passe par ses vues de trois-quarts et de face, une image après l'autre
   (Romain, 16 novembre, 19 h 56 : « il faut vraiment faire des dessins pour chaque étape et elle se retourne en 3 images ») */
PP.cote = function(gauche, net){
  this.gauche = !!gauche;
  if(this.dir === null) this.capV = this.gauche ? 4 : 0;
  if(net || MOINS) this.cap = this.capV;
  this.reveiller();
};
/* se tourner vers une direction (0 … 7), ou revenir de profil (null) */
PP.vers = function(dir){
  this.dir = dir === undefined || dir === null ? null : ((Math.round(dir) % 8) + 8) % 8;
  this.capV = this.dir === null ? (this.gauche ? 4 : 0) : this.dir;
  if(MOINS) this.cap = this.capV;
  this.reveiller();
};
PP.deProfil = function(){ return this.cap === 0 || this.cap === 4; };
/* les calques des autres vues, dans l'ordre : de dos, la tête est derrière le corps et la queue devant */
PP.ranger = function(nom){
  var r = this.rac;
  if(!r || !this.gVc) return;
  (nom === 'tqd' || nom === 'dos' ? [this.gVl, this.gTete, this.gVc, this.gVq] : [this.gVq, this.gVl, this.gVc, this.gTete]).forEach(function(g){ if(g) r.appendChild(g); });
  this.qd = -1;
};

/* ---------- Les gestes ---------- */
/* nom : un geste de MimiPantin.GESTES ; o : {d : sa durée en ms (un geste qui tourne : pas de durée), fin : appelé à la fin, … ses réglages à lui} */
PP.geste = function(nom, o){
  var g = M.GESTES[nom];
  if(!g) return null;
  o = o || {};
  var c = {nom:nom, f:g.f, d:(o.d || g.d || 0) / 1000, t:0, w:0, cible:1, ent:(g.ent === undefined ? 0.1 : g.ent), sor:(g.sor === undefined ? 0.14 : g.sor), o:o, fin:o.fin || null, plein:!!g.plein, m:{}};
  if(MOINS && g.d && g.saute){ if(c.fin) c.fin(); return null; }
  if(!c.d) this.sans(nom);                      /* (un geste qui tourne n'existe qu'une fois) */
  this.couv.push(c);
  if(!c.d) this.boucles[nom] = c;
  this.reveiller();
  return c;
};
PP.sans = function(nom){
  var c = this.boucles[nom];
  if(c){ c.cible = 0; delete this.boucles[nom]; }
  if(this.bPose === nom) this.bPose = null;
};
PP.fait = function(nom){ return this.couv.some(function(c){ return c.nom === nom && c.cible > 0; }); };
PP.sansGestes = function(){ this.couv.forEach(function(c){ c.cible = 0; if(c.d) c.d = Math.min(c.d, c.t + c.sor); }); this.boucles = {}; this.bPose = null; };

/* ---------- Marcher : le chemin à faire (dans ses mesures à elle), et où on en est (0 … 1) ---------- */
PP.marcher = function(o){
  this.mar = {dist:o.dist, prog:o.prog, fait:0, fini:false};
  this.all = o.vit > M.SEUILS[1] ? 'course' : o.vit > M.SEUILS[0] ? 'trot' : 'pas';
  if(o.dir !== undefined) this.vers(o.dir);          /* (elle se tourne vers là où elle va : de dos si elle s'éloigne, de face si elle vient) */
  this.reveiller();
};
PP.arretMarche = function(){ if(this.mar) this.mar.fini = true; };

/* ---------- Sauter ----------
   o : {dx, dy : le déplacement à l'écran (pour pencher le corps), haut : la hauteur de la cloche, pre, vol, post : les durées (ms),
        fesses : combien de fois elle les remue, temps : () → les ms écoulées depuis le début}
   MimiPantin.planSaut() choisit tout ça au hasard (jamais deux sauts pareils). */
M.planSaut = function(dist, monte){
  var fesses = Math.random() < 0.7 ? 1 + Math.floor(Math.random() * 3) : 0, haut = Math.random();
  return {pre:260 + fesses * 190 + Math.random() * 120, vol:borne(330 + dist * 0.55 + Math.max(0, monte) * 0.5, 340, 720) * (0.92 + haut * 0.2),
    post:300 + Math.random() * 100, fesses:fesses, cloche:0.75 + haut * 0.6, style:Math.random() < 0.5 ? 0 : 1};
};
PP.saut = function(o){
  this.sansGestes();
  if(this.nom !== 'saute'){ this.nom = 'saute'; this.tw = {a:copie(this.P), b:M.pose('debout'), t:0, d:0.16, pas:{}}; }
  this.mar = null;
  if(o.dir !== undefined){
    var moi = this, f0 = o.fin || null;
    this.vers(o.dir);
    o.fin = function(){ if(moi.dir === o.dir && !moi.mar) moi.vers(null); if(f0) f0(); };
  }
  return this.geste('saut', o);
};

/* ---------- Le regard : un point de l'écran (clientX, clientY) qu'elle suit des yeux un moment ---------- */
PP.local = function(cx, cy){
  try{
    var m = this.rac.getScreenCTM();
    if(!m) return null;
    var p = this.svg.createSVGPoint(); p.x = cx; p.y = cy; p = p.matrixTransform(m.inverse());
    return [p.x, p.y];
  }catch(e){ return null; }
};
/* (le doigt bouge bien plus souvent qu'on ne la redessine : on note seulement où il est ; la place du doigt dans ses mesures à elle
   est calculée une fois par dessin, pas à chaque mouvement du doigt — c'est ce calcul qui coûtait, sous le doigt) */
PP.regard = function(cx, cy, ms){
  this.reg.px = cx; this.reg.py = cy; this.reg.frais = true; this.reg.jusqu = this.t + (ms || 1400) / 1000;
  if(this.vite < 3) this.vite = 3;
  lancer();
};
PP.sansRegard = function(){ this.reg.jusqu = 0; };
/* ---------- Où le doigt la touche-t-il ? 'tete', 'queue', 'ventre', 'dos' (ou null : à côté) ---------- */
PP.zone = function(cx, cy){
  var p = this.local(cx, cy), R = this.R;
  if(!p || !R._tete) return null;
  var x = p[0], y = p[1], i, d;
  if(Math.hypot(x - R._tete[0], y - R._tete[1]) < 19) return 'tete';
  var hx = R._h[0], hy = R._h[1], sx = R._s[0], sy = R._s[1], ux = sx - hx, uy = sy - hy, l = Math.hypot(ux, uy) || 1;
  ux /= l; uy /= l;
  var al = (x - hx) * ux + (y - hy) * uy, tr = (x - hx) * uy - (y - hy) * ux;     /* le long du dos ; tr > 0 : du côté du dos */
  var dansCorps = al > -15 && al < l + 12 && Math.abs(tr) < 17;
  for(i = 2; i < R._q.length; i++){ d = Math.hypot(x - R._q[i][0], y - R._q[i][1]); if(d < 8.5 && !(dansCorps && i < 3)) return 'queue'; }
  if(!dansCorps) return y > -34 && Math.abs(x) < 34 ? 'ventre' : null;
  if(this.F.bu > 0.5) return 'ventre';
  return tr * 1 > -3 ? 'dos' : 'ventre';
};
/* ce qu'elle porte dans la gueule (du SVG, autour de (0, 0) = sa bouche) ; rien : elle le lâche */
PP.porter = function(svg){ var g = this.els.butin && this.els.butin[0]; if(g) g.innerHTML = svg ? '<g transform="translate(0,11)">' + svg + '</g>' : ''; };
/* un point du pantin, à l'écran : 'tete', 'gueule' → [clientX, clientY] */
PP.point = function(quoi){
  var R = this.R, F = this.F, q = R['_' + quoi];
  if(quoi === 'queue') q = R._q && R._q[4];
  else if(quoi === 'dos' || quoi === 'ventre'){
    var H = R._h, S = R._s, ux = S[0] - H[0], uy = S[1] - H[1], l = Math.hypot(ux, uy) || 1, k = quoi === 'dos' ? 7 : -8;
    q = [(H[0] + S[0]) / 2 + uy / l * k, (H[1] + S[1]) / 2 - ux / l * k];
  }
  if(!q) return null;
  try{ var m = this.rac.getScreenCTM(), p = this.svg.createSVGPoint(); p.x = q[0]; p.y = q[1]; p = p.matrixTransform(m); return [p.x, p.y]; }catch(e){ return null; }
};

PP.reveiller = function(){ this.vite = 12; lancer(); };

/* ---------- Les classes du chat (posées par atelier.js) → ses gestes ---------- */
PP.lireClasses = function(){
  var h = this.hote, s = h ? h.className : '';
  if(typeof s !== 'string' || s === this.cls) return;
  this.cls = s;
  var moi = this, la = {};
  s.split(/\s+/).forEach(function(c){ var g = M.CLASSES[c]; if(g) la[g] = 1; });
  Object.keys(M.CLASSES).forEach(function(c){
    var g = M.CLASSES[c];
    if(la[g] && !moi.clsG[g]){ moi.clsG[g] = 1; moi.geste(g); }
    else if(!la[g] && moi.clsG[g]){ delete moi.clsG[g]; moi.sans(g); }
  });
  var gauche = /(^|\s)at-c-gauche(\s|$)/.test(s);
  if(gauche !== this.gauche) this.cote(gauche);
};

/* ---------- Une image ---------- */
PP.image = function(now){
  if(this.mort || M.figer) return;
  if(!this.svg.isConnected){ if(++this.hors > 240) this.detruire(); return; }
  this.hors = 0;
  if(document.hidden){ this.t0 = now; return; }
  /* On ne la redessine pas plus souvent qu'il ne faut (Romain, 16 novembre, 19 h 56 : « sans que ça rame […] jamais en dessous de
     24 images secondes ») : 30 fois par seconde quand elle bouge (c'était 60), 15 quand elle ne fait que respirer, 10 quand elle dort —
     un clin d'œil, une oreille qui frémit, un regard la repassent à 30 le temps qu'il faut. Moins on la redessine, plus il reste de temps
     pour tout le reste de l'écran de l'Alchimiste. Son déplacement
     dans la pièce, lui, est fait par le navigateur à chaque image de l'écran : il reste parfaitement lisse. Sur un appareil lent,
     qui n'affiche que 30 images par seconde ou moins, elle est redessinée à chacune. */
  this.lireClasses();
  var ecart = this.t0 ? now - this.t0 : 1000;
  if(ecart < (this.vite > 0 ? M.CADENCE[0] : this.F.zz > 0.5 ? M.CADENCE[2] : M.CADENCE[1])) return;
  if(this.vite > 0) this.vite--;
  var dt = this.t0 ? Math.min(0.08, ecart / 1000) : 0.016;
  this.t0 = now;
  this.dessiner(dt);
};

PP.dessiner = function(dt){
  var moi = this, P, F, k, i, c, tw = this.tw, t;
  this.t += dt; t = this.t;
  /* 1. la pose glisse vers la pose demandée */
  if(tw){
    if(!(tw.attend && this.cap !== this.capV)) tw.t += dt;          /* (elle finit de se tourner, puis elle s'assoit, se couche…) */
    var u = Math.min(1, tw.t / tw.d), e = eio(u);
    P = this.P;
    for(k in tw.b) P[k] = k === 'q0' ? tw.a[k] + angle(tw.b[k] - tw.a[k]) * e : tw.a[k] + (tw.b[k] - tw.a[k]) * e;
    for(k in tw.pas){
      var ps = tw.pas[k], v = seg(u, ps[0], ps[1]);
      P[k] = tw.a[k] + (tw.b[k] - tw.a[k]) * eio(v);
      P[ps[3]] = tw.b[ps[3]] - ps[2] * Math.sin(Math.PI * v);
    }
    if(u >= 1){ this.P = copie(tw.b); this.tw = null; }
    this.vite = Math.max(this.vite, 3);
  }
  F = copie(this.P, this.F);
  /* 2. la marche */
  var mar = this.mar;
  if(mar){
    var pr = mar.fini ? null : mar.prog();
    if(!mar.fini && (pr === null || pr === undefined || pr >= 1)) mar.fini = true;       /* (arrivée, ou arrêtée en chemin) */
    var fait = pr === null || pr === undefined ? mar.fait : borne(pr, 0, 1) * mar.dist;
    this.phi += Math.max(0, fait - mar.fait) / M.ALLURES[this.all].L;
    mar.fait = fait;
    this.marW = mar.fini ? Math.max(0, this.marW - dt / 0.16) : Math.min(1, this.marW + dt / 0.13);
    if(mar.fini && this.marW <= 0){ this.mar = null; if(this.dir !== null && !this.fait('saut')) this.vers(null); }
    this.vite = Math.max(this.vite, 3);
  } else this.marW = 0;
  if(this.marW > 0) M.pas(F, this.phi, this.marW, M.ALLURES[this.all]);
  /* 3. les gestes, fondus */
  var tourne = this.cap !== this.capV && !!this.tw && this.tw.attend;
  for(i = 0; i < this.couv.length; i++){
    c = this.couv[i];
    if(tourne && this.bPose && c === this.boucles[this.bPose]) continue;      /* (sa toilette, son repas… attendent qu'elle ait fini de se tourner) */
    c.t += dt;
    if(c.d && c.t >= c.d - c.sor) c.cible = 0;
    c.w = c.cible ? Math.min(1, c.w + (c.ent ? dt / c.ent : 1)) : Math.max(0, c.w - (c.sor ? dt / c.sor : 1));
    if(c.t === dt && !c.ent) c.w = 1;
    if(!c.cible && c.w <= 0 || (c.d && c.t >= c.d)){
      this.couv.splice(i--, 1);
      if(c.fin){ c.fin(); c.fin = null; }
      continue;
    }
    if(c.w >= 0.999) c.f(F, c.d ? c.t / c.d : c.t, c.t, c, this);
    else {
      var av = copie(F, c._av || (c._av = {}));
      c.f(F, c.d ? c.t / c.d : c.t, c.t, c, this);
      for(k in av) if(F[k] !== av[k] && k !== 'vue') F[k] = av[k] + (F[k] - av[k]) * c.w;      /* (un tour sur elle-même ne se « fond » pas : c'est une vue ou une autre) */
    }
    this.vite = Math.max(this.vite, 3);
  }
  /* 4. sa petite vie : la respiration, les yeux, une oreille, la queue */
  if(!MOINS){
    var dodo = F.zz > 0.5, re = Math.sin(TAU * t * (dodo ? 0.2 : 0.3));
    F.sy -= re * (dodo ? 0.75 : 0.42); F.rs += re * (dodo ? 0.5 : 0.22); F.rm += re * (dodo ? 0.5 : 0.18);
    F.ta += 0.7 * Math.sin(TAU * t * 0.11 + 1);
    for(i = 0; i < 6; i++) F['q' + i] += F.qa * (0.35 + 0.22 * i) * Math.sin(TAU * F.qv * t - i * 0.6);
  }
  var cl = this.cli;
  if(cl.d > 0){ cl.d -= dt; var kc = 1 - cl.d / 0.19; F.yo *= 1 - pic(kc); this.vite = Math.max(this.vite, 2); if(cl.d <= 0) cl.t = t + 2.4 + Math.random() * 4.5; }
  else if(t > cl.t && F.yo > 0.5 && F.yc < 0.5){ cl.d = 0.19; if(Math.random() < 0.18) cl.t = t + 0.3; }
  var or = this.ore;
  if(or.d > 0){ or.d -= dt; var ko = pic(1 - or.d / 0.34) * 17; if(or.c) F.od += ko; else F.og -= ko; this.vite = Math.max(this.vite, 2); if(or.d <= 0) or.t = t + 4 + Math.random() * 8; }
  else if(t > or.t){ or.d = 0.34; or.c = Math.random() < 0.5 ? 1 : 0; }
  /* de temps en temps, un coup d'œil ailleurs (la tête suit un peu) */
  var ol = this.oeil || (this.oeil = {t:t + 2 + Math.random() * 4, d:0, x:0, y:0, k:0});
  if(ol.d > 0){ ol.d -= dt; ol.k = Math.min(1, ol.k + dt * 5); if(ol.d <= 0) ol.t = t + 3 + Math.random() * 6; }
  else {
    ol.k = Math.max(0, ol.k - dt * 4);
    if(t > ol.t && !MOINS && F.yo > 0.5 && F.yc < 0.5 && F.zz < 0.5 && !this.mar && !this.couv.length){ ol.d = 0.9 + Math.random() * 1.4; ol.x = (Math.random() * 2 - 1) * 0.9; ol.y = (Math.random() - 0.4) * 0.8; }
  }
  if(ol.k > 0.01){ F.lx = vers(F.lx, ol.x, ol.k); F.ly = vers(F.ly, ol.y, ol.k); F.ta += ol.x * 5 * ol.k; this.vite = Math.max(this.vite, 2); }
  /* 5. le regard */
  var rg = this.reg, veut = t < rg.jusqu ? 1 : 0;
  if(rg.frais){ rg.frais = false; var pl = this.local(rg.px, rg.py); if(pl){ rg.cx = pl[0]; rg.cy = pl[1]; } else veut = 0; }
  rg.w += (veut - rg.w) * Math.min(1, dt * 7);
  if(rg.w > 0.01){
    var hd = this.R._tete, tx0 = hd ? hd[0] : F.sx + F.tx, ty0 = hd ? hd[1] : F.sy + F.ty, ddx = rg.cx - tx0, ddy = rg.cy - ty0, ar = -F.ta * Math.PI / 180;
    var lxx = borne((ddx * Math.cos(ar) - ddy * Math.sin(ar)) / 42, -1, 1), lyy = borne((ddx * Math.sin(ar) + ddy * Math.cos(ar)) / 42, -1, 1);
    rg.x += (lxx - rg.x) * Math.min(1, dt * 11); rg.y += (lyy - rg.y) * Math.min(1, dt * 11);
    F.lx = vers(F.lx, rg.x, rg.w); F.ly = vers(F.ly, rg.y, rg.w);
    F.tx += rg.x * 1.4 * rg.w; F.ta += rg.x * 3 * rg.w;
    if(rg.w > 0.02 && rg.w < 0.98) this.vite = Math.max(this.vite, 2);
    if(Math.abs(lxx - rg.x) + Math.abs(lyy - rg.y) > 0.02) this.vite = Math.max(this.vite, 2);
  }
  /* 6. sa direction : d'une vue à la suivante, une image après l'autre (jamais d'image retournée à plat) */
  if(this.cap !== this.capV){
    this.capT -= dt;
    if(this.capT <= 0){ this.cap = ((this.cap + M.pasDeVue(this.cap, this.capV)) % 8 + 8) % 8; this.capT = M.DUREE_VUE; }
    this.vite = Math.max(this.vite, 3);
    /* (sur place, elle piétine un peu en tournant : une patte, puis l'autre) */
    if(this.marW <= 0 && !MOINS){
      this.capPh = (this.capPh || 0) + dt * 6.5;
      var pz = Math.sin(TAU * this.capPh), pz2 = Math.sin(TAU * this.capPh + 1.6);
      F.a1y -= 2.6 * Math.max(0, pz); F.a2y -= 2.6 * Math.max(0, -pz); F.j1y -= 2.2 * Math.max(0, -pz2); F.j2y -= 2.2 * Math.max(0, pz2);
      F.hy += 0.5 * Math.abs(pz2); F.sy += 0.5 * Math.abs(pz);
    }
  } else this.capT = 0;
  /* (un geste peut la faire tourner sur elle-même : F.vue, en huitièmes de tour) */
  var iv = ((this.cap + Math.round(F.vue || 0)) % 8 + 8) % 8, V = M.VUES[iv], prof = V.nom === 'profil';
  this.co = F.co = V.co;
  if(!prof && !MOINS) F.ql += 12 * Math.sin(TAU * 0.45 * t + 1) + (this.marW > 0 ? 10 * Math.sin(TAU * this.phi) * this.marW : 0);
  /* 7. la queue suit avec un peu de retard (la base ferme, le bout souple) */
  if(!this.q){ this.q = []; for(i = 0; i < 6; i++) this.q[i] = F['q' + i]; }
  for(i = 0; i < 6; i++){
    var kq = MOINS ? 1 : Math.min(1, dt * (16 - i * 1.9));
    this.q[i] += (i ? F['q' + i] - this.q[i] : angle(F.q0 - this.q[0])) * kq;
    F['q' + i] = this.q[i];
  }
  /* 8. on écrit */
  var R = prof ? M.resoudre(F, this.R) : M.resoudreVue(F, V, this.R), els = this.els, vu = this.vu, att = this.att, l, val, n, j;
  if(V.nom !== this.vueNom){ this.vueNom = V.nom; R['pf:v'] = prof ? 'inline' : 'none'; R['vu:v'] = prof ? 'none' : 'inline'; this.ranger(V.nom); }
  for(k in els){
    val = R[k];
    if(val === undefined || val === vu[k]) continue;
    vu[k] = val; l = els[k]; n = att[k];
    for(j = 0; j < l.length; j++) l[j].setAttribute(n, val);
  }
  if(R._qd !== this.qd && this.gQueue){
    this.qd = R._qd;
    if(R._qd) this.rac.insertBefore(this.gQueue, this.gTete); else this.rac.insertBefore(this.gQueue, this.gPres);
  }
};

/* ==========================================================
   Monter un pantin sur un dessin déjà en place (le <svg> contient MimiPantin.dessin(…)) ; o : {pose, gauche, hote : l'élément qui porte les classes}
   ========================================================== */
M.monter = function(svg, o){ return new Pantin(svg, o); };
M.pantins = function(){ return PANTINS.slice(); };
/* Mimi en image fixe : une pose, des classes de mimiques (« at-x-miaou at-x-clos »), ses accessoires */
M.image = function(v, pose, classes, acc){
  var base = M.BASES[pose] || pose, P = M.pose(base), b = M.BOUCLES[pose];
  var l = (b ? [b] : []).concat((classes || '').split(/\s+/).map(function(c){ return M.CLASSES[c]; }).filter(function(g){ return !!g; }));
  l.forEach(function(g){ var G2 = M.GESTES[g]; if(G2) G2.f(P, G2.d ? 0.5 : 0.45, 0.45, {o:{}, m:{}, fixe:1}, null); });
  if(/(^|\s)at-c-gauche(\s|$)/.test(classes || '')) P.co = -1;
  return M.dessin(v, P, acc || {});
};
})(window);
