/* ==========================================================
   Les héros « en volume » DANS LE DONJON — un premier essai (Romain, 23 novembre, 18 h 51 : « j'aimerais bien voir ce que ça donne
   dans le donjon. Donc si tu peux commencer à l'incruster dans le donjon. Et il faut qu'il ait sa tenue de combat »).
   Rien n'est changé dans le donjon : la page d'essai (donjon/construire-essai.py) reprend le donjon tel qu'il est en ligne et
   remplace seulement, au moment où il crée les héros, l'ancien Pisteur par la Pisteuse en volume (window.HerosAnime.creer).
   Elle répond aux mêmes ordres que l'ancien (entrer, attendre, choisi, tirer, dague, touche, tomber, relever, joie, entoile, avale,
   recrache, equiper…) : le combat ne voit pas la différence. Les deux autres héros restent les anciens.
   LES EFFETS : l'ancien Pisteur est toujours là, invisible (« l'ombre ») : on lui fait faire les mêmes gestes pour garder ses
   effets (le souffle de givre, le choc du poing, la lumière dorée, les confettis…). Ceux qui dépendent du corps (les étoiles,
   la poussière des pieds, la flèche qui part de l'arc, la lame) sont ses mêmes effets, posés sur le corps de la nouvelle.
   Et ceux des films (la toile, le ruban de la dague, les cristaux de givre, les rats, la bave) sont redessinés sur elle.
   Pas fait : les autres coiffures et apparences (elle est toujours la rousse à queue de cheval), Léo (phase 3 : être attrapée),
   les objets portés (equiper : retenu, pas dessiné sur elle), la flèche colorée encochée selon sa sorte.
   Chargé dans le <head>, AVANT le donjon : il attend que le donjon pose window.HerosAnime pour l'envelopper.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, PROTO = null;
/* (le cadre : la boîte du héros fait 200 × 240 ; ses pieds tombent là où tombaient ceux de l'ancien (le sol, y = 414, à 231,7 px
   du haut de la boîte) ; elle est 10 % plus grande qu'au premier essai — Romain, 20 h 05 : « elle est plus petite ») */
var CADRE = [-21.8, 32.2, 329.6, 395.5], CAP = 55;
/* (les effets des films sont écrits dans les pixels du film — cadre [-130, -64, 560, 560] dans une image de 900 : on garde leurs
   nombres, et le calque des effets prend ce repère-là) */
var KF = 900 / 560, FX0 = (CADRE[0] + 130) * KF, FY0 = (CADRE[1] + 64) * KF;
var O = '#24182e';
function css(){
  if(document.getElementById('hva-css')) return;
  var s = document.createElement('style'); s.id = 'hva-css';
  s.textContent = '.hva{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:1}' +
    '.hva-boite{position:absolute;inset:0;overflow:visible;will-change:transform}.hva-boite>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block}' +
    '.hva-fx{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:2}' +
    '.hva-ombre-sol{position:absolute;left:0;top:0;width:100px;height:18px;margin:-9px 0 0 -50px;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(0,0,0,.6),rgba(0,0,0,0))}' +
    /* (son ombre et l'anneau de son tour sont dessinés avec elle : ceux de la case du donjon sont cachés) */
    '.perso.hv-volume>.ombre,.perso.hv-volume>.anneau{display:none!important}' +
    /* (l'ancien Pisteur, invisible : seuls ses effets se voient) */
    '.ha.hva-ombre>.ha-boite{visibility:hidden!important}';
  document.head.appendChild(s);
}
function maintenant(){ return (G.performance || Date).now() / 1000; }
function attendre(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function decale(L, dt){ return L.map(function(k){ return [k[0] + dt, k[1]]; }); }
function lisse(a){ a = Math.max(0, Math.min(1, a)); return a * a * (3 - 2 * a); }
function mixe(a, b, t){ return a + (b - a) * t; }
function mixe2(a, b, t){ return [mixe(a[0], b[0], t), mixe(a[1], b[1], t)]; }
/* mélanger deux poses complètes (pour passer en douceur d'un geste interrompu au suivant) */
function melange(A, B, t){
  var R = {}, k;
  for(k in B){ var a = A[k], b = B[k];
    if(typeof b === 'number' && typeof a === 'number') R[k] = a + (b - a) * t;
    else if(b instanceof Array && a instanceof Array) R[k] = b.map(function(v, i){ return (a[i] || 0) + (v - (a[i] || 0)) * t; });
    else R[k] = b; }
  return R;
}
/* une partie d'un geste, de t0 à t1, remise à zéro ; depart : la pose de départ, posée juste au début */
function morceau(Gst, t0, t1, depart){
  var L = Gst.filter(function(k){ return k[0] > t0 + 1e-6 && k[0] <= t1 + 1e-6; }).map(function(k){ return [k[0] - t0 + 0.01, k[1]]; });
  return depart ? [[0.01, depart]].concat(L) : L;
}
function rond(x, y, r, c, o, plus){ return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + c + '"' + (o != null ? ' opacity="' + o.toFixed(2) + '"' : '') + (plus || '') + '/>'; }

/* ==========================================================
   LA PISTEUSE EN VOLUME, avec les ordres de l'ancien Pisteur
   ========================================================== */
function Volume(cont, lk, creer0){
  css();
  var me = this;
  this.cont = cont; this.role = 'pisteur'; this.lk = lk || {}; this.ko = false; this._q = Promise.resolve(); this._timers = []; this._veut = false;
  if(getComputedStyle(cont).position === 'static') cont.style.position = 'relative';
  var slot = cont.closest && cont.closest('.perso'); if(slot) slot.classList.add('hv-volume');
  this.racine = document.createElement('div'); this.racine.className = 'hva';
  this.boite = document.createElement('div'); this.boite.className = 'hva-boite';
  this.fx = document.createElement('div'); this.fx.className = 'hva-fx';
  this.racine.appendChild(this.boite); this.racine.appendChild(this.fx);
  cont.appendChild(this.racine);
  /* (elle est toujours la Pisteuse rousse à queue de cheval, en tenue de combat : les autres apparences ne sont pas encore en volume) */
  this.h = {role:'pisteur', sexe:'f', peau:'p1', cheveux:'roux', yeux:'vert', combat:true};
  this.p = HV.monter(this.boite, this.h, {cadre:CADRE.join(' '), cap:CAP});
  this.p.posi = null; this.p.nom = 'donjonVolume';
  this.svg = this.boite.querySelector('svg');
  /* (son ombre au sol, sous ses pieds, bien visible comme celle des autres héros : Romain, 20 h 05, « les pieds posés sur le sol
     avec une petite ombre au sol […] qu'ils soient vraiment ancrés dans le donjon ») */
  this.ombreSol = document.createElement('div'); this.ombreSol.className = 'hva-ombre-sol';
  this.boite.insertBefore(this.ombreSol, this.svg);
  /* (le calque des effets des films, par-dessus elle, dans le repère du film) */
  this.calque = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.calque.setAttribute('viewBox', [FX0, FY0, CADRE[2] * KF, CADRE[3] * KF].map(function(v){ return v.toFixed(2); }).join(' '));
  this.calque.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none');
  this.boite.appendChild(this.calque);
  this.effets = [];
  this.base = HV.POSES.dGarde; this.cles = null; this.t0 = maintenant(); this.tenue = null; this.dernier = this.base;
  /* (c'est l'adaptateur qui dit au pantin quelle pose prendre, à chaque image ; le pantin y ajoute sa petite vie) */
  this.p.courante = function(){ return me.pose(); };
  var d0 = this.p.dessiner;
  this.p.dessiner = function(dt){ d0.call(this, dt); me.apresImage(); };
  /* (au calme — elle respire, cligne des yeux —, 15 dessins par seconde suffisent ; pendant un geste, 30 : la tablette souffle) */
  var im0 = this.p.image;
  this.p.image = function(now){ if(me.calme() && this.t0 && now - this.t0 < 64) return; im0.call(this, now); };
  this.p.vers(CAP, true);
  /* l'ancien Pisteur, invisible, pour ses effets */
  try{ this.ombre = creer0(cont, 'pisteur', lk); this.ombre.racine.classList.add('hva-ombre'); this.ombre._etoiles = function(){};
    cont.appendChild(this.ombre.racine); PROTO = PROTO || Object.getPrototypeOf(this.ombre);
    /* (ses effets à lui — la flèche qui vole, la lame — travaillent sur elle) */
    ['_fleche', '_fleche2', '_impactFleche', '_impactFleche2', '_rebondFleche', '_lame', '_impactDague', '_recul'].forEach(function(n){ if(PROTO[n] && !V[n]) V[n] = PROTO[n]; }); }
  catch(e){ this.ombre = null; if(G.console) console.warn('hv-adaptateur : pas d\'ancien Pisteur', e); }
  this._prochainRegard = maintenant() + 6 + Math.random() * 4;
  /* (la fuite : le combat fait partir la case vers la gauche, retournée — elle court, au lieu de glisser en garde) */
  /* (et l'anneau doré à ses pieds suit la case : quand on peut la choisir — « dispo » — et quand c'est son tour — « actif » —,
     comme l'anneau des autres héros, mais dessiné avec elle : l'arrière derrière les bottes, l'avant devant) */
  this.slot = slot;
  if(slot && G.MutationObserver) new MutationObserver(function(){
    if(slot.classList.contains('detale') && !me._fuit){ me._fuit = true; me._finGeste(); me.cles = null; me.trans = null; var t0 = maintenant(); me.course = function(){ return HV.course(maintenant() - t0); }; }
    me.p.choisi(slot.classList.contains('dispo') || slot.classList.contains('actif'));
  }).observe(slot, {attributes:true, attributeFilter:['class']});
  (G.HerosVuesDonjon.toutes = G.HerosVuesDonjon.toutes || []).push(this);
}
var V = Volume.prototype;

/* ---------- la pose de chaque image ---------- */
V.pose = function(){
  var t = maintenant(), u = t - this.t0, P;
  if(this.course) P = this.course(u);
  else if(this.cles && u < this.fin) P = HV.gesteImage(this.base, this.cles, u);
  else {
    if(this.cles){ var a = this.apres; this.cles = null; this.apresF = typeof a === 'function' ? a : null; this.tenue = a && typeof a !== 'function' ? HV.avec(this.base, a) : null; this.t0 = t; this.trans = null; u = 0; this._finGeste(); }
    P = this.apresF ? this.apresF(u) : this.tenue || this.base;
    /* (en attendant son tour, de temps en temps, elle regarde autour d'elle) */
    if(!this.apresF && !this.tenue && !this.ko && this._veut && t > this._prochainRegard){ this._prochainRegard = t + 9 + Math.random() * 6; this.jouer(HV.DONJON.regard); }
  }
  if(this.trans){ var a2 = (t - this.trans.t) / this.trans.d; if(a2 < 1) P = melange(this.trans.A, P, lisse(a2)); else this.trans = null; }
  this.dernier = P;
  return P;
};
V.calme = function(){ return !this.cles && !this.course && !this.apresF && !this.trans && !this.effets.length && !this._glisse && Math.abs((this.p.anV || 0) - (this.p.anC || 0)) < 0.02; };
V._finGeste = function(){ var f = this._quandFini; this._quandFini = null; if(f) f(); };
/* jouer des images clés (sur la garde du donjon) → une promesse, à la fin ; apres : la pose à garder ensuite (ou une fonction du temps) */
V.jouer = function(cles, apres){
  var me = this;
  this._finGeste();
  this.trans = {A:this.dernier, t:maintenant(), d:0.16};
  this.course = null; this.apresF = null; this.tenue = null;
  this.cles = cles; this.fin = cles[cles.length - 1][0]; this.t0 = maintenant(); this.apres = apres || null;
  return new Promise(function(r){ me._quandFini = r; });
};
/* la file des ordres : un à la fois ; sig(v) rend la promesse tout de suite (la flèche a touché), le geste continue */
V.file = function(fn){
  var me = this;
  return new Promise(function(res){
    me._q = me._q.then(function(){
      var fini = false, sig = function(v){ if(!fini){ fini = true; res(v); } };
      return Promise.resolve().then(function(){ return fn.call(me, sig); }).catch(function(e){ if(G.console) console.error('hv-adaptateur', e); }).then(function(v){ sig(v); });
    });
  });
};
V.plus = function(ms, fn){ var me = this, id = setTimeout(function(){ var i = me._timers.indexOf(id); if(i >= 0) me._timers.splice(i, 1); fn(); }, ms); this._timers.push(id); return id; };
/* glisser la boîte (courir, sauter, reculer) : de x0 à x1 pixels en d secondes */
V.glisse = function(x0, x1, d, ease, y){
  var me = this, t0 = maintenant(), tok = this._gl = (this._gl || 0) + 1;
  this._glisse = true;
  return new Promise(function(r){ (function pas(){ if(tok !== me._gl) return r(); var a = Math.min(1, (maintenant() - t0) / d), e = ease ? ease(a) : a; me.dx = x0 + (x1 - x0) * e;
    me.boite.style.transform = 'translate(' + me.dx.toFixed(1) + 'px,' + (y ? y(a) : 0).toFixed(1) + 'px)'; if(a < 1) requestAnimationFrame(pas); else { me._glisse = false; r(); } })(); });
};

/* ---------- où sont les choses ---------- */
/* les os de la pose affichée (dans ses mesures) */
V.os = function(){ return HV.os(this.h, this.p.F); };
/* un point d'elle (ses mesures) → coordonnées de son SVG */
V.versSvg = function(q){ var P = this.p.F, Vv = HV.outils.vue(HV.capDe(P)); return [150 + q[0] * Vv.c + q[2] * Vv.s, q[1] - Math.max(0, P.leve || 0)]; };
/* … → pixels dans « ref » (la scène des effets du combat, ou son calque fx) */
V.versRef = function(s, ref){
  var R = this.svg.getBoundingClientRect(), k = R.width / CADRE[2], x = R.left + (s[0] - CADRE[0]) * k, y = R.top + (s[1] - CADRE[1]) * k;
  var Q = ref.getBoundingClientRect(), kr = (Q.width / (ref.offsetWidth || Q.width)) || 1;
  return {x:(x - Q.left) / kr, y:(y - Q.top) / kr};
};
/* … → le repère des effets des films */
V.ecranF = function(q){ var s = this.versSvg(q); return [(s[0] + 130) * KF, (s[1] + 64) * KF]; };
/* les repères de l'ancien Pisteur (pour ses effets), posés sur elle */
var REP = {tete:['tete', 0, -30], teteC:['tete', 4, -34], cou:['cou'], chevilleB:['chevilleD'], chevilleA:['chevilleG'], orteilA:['orteilG'], orteilB:['orteilD'], poignee:['poignetG'], bassin:['bassin'], amulette:['cou', 0, 16]};
V.rep = function(nom, ref){
  var r = REP[nom] || ['bassin'], q = this.os()[r[0]], s = this.versSvg(q);
  return this.versRef([s[0] + (r[1] || 0), s[1] + (r[2] || 0)], ref || this.fx);
};

/* ---------- les effets des films, redessinés sur elle ---------- */
V.effet = function(nom, f, duree){ var e = {nom:nom, t0:maintenant(), f:f, d:duree || 99}; this.effets = this.effets.filter(function(x){ return x.nom !== nom; }); this.effets.push(e); return e; };
V.sansEffet = function(nom){ this.effets = this.effets.filter(function(x){ return x.nom !== nom; }); };
/* l'ombre au sol : sous ses pieds (et son bassin, son dos quand elle est couchée), sur le sol ; en l'air, elle rapetisse et pâlit */
V.ombreAuSol = function(){
  var F = this.p.F; if(!F || !this.ombreSol) return;
  var Vv = HV.outils.vue(HV.capDe(F)), b = F.bas || [0, 0, 0], pts = [F.piedG, F.piedD, [b[0], 245 + b[1], b[2]]], xa = 1e9, xb = -1e9, ds = 0;
  if((F.couche || 0) > 0.3) pts.push([b[0], 300, b[2] - 190 * F.couche]);
  pts.forEach(function(q){ var x = 150 + q[0] * Vv.c + q[2] * Vv.s; xa = Math.min(xa, x); xb = Math.max(xb, x); ds += -q[0] * Vv.s + q[2] * Vv.c; });
  var kx = (this.boite.offsetWidth || 200) / CADRE[2], lv = Math.max(0, F.leve || 0), k = 1 / (1 + lv / 70);
  var X = ((xa + xb) / 2 - CADRE[0]) * kx, Y = (415 + 0.13 * ds / pts.length - CADRE[1]) * kx, W = ((xb - xa) * kx + 50) * k;
  this.ombreSol.style.transform = 'translate(' + X.toFixed(1) + 'px,' + Y.toFixed(1) + 'px) scale(' + (W / 100).toFixed(3) + ',' + k.toFixed(3) + ')';
  this.ombreSol.style.opacity = k.toFixed(2);
};
V.apresImage = function(){
  var t = maintenant(), me = this;
  this.ombreAuSol();
  this.effets = this.effets.filter(function(e){ return t - e.t0 < e.d; });
  if(!this.effets.length){ if(this._calquePlein){ this.calque.innerHTML = ''; this._calquePlein = false; } return; }
  var os = this.os(), s = '';
  this.effets.forEach(function(e){ try{ s += e.f.call(me, t - e.t0, os, t) || ''; }catch(x){ if(G.console) console.error(x); } });
  this.calque.innerHTML = s; this._calquePlein = true;
};
/* le ruban de lumière laissé par le bout de la dague (le film) */
V.ruban = function(trace, garde, T){
  if(garde){ var os = this.os(), w = this.ecranF(os.poignetD), c = this.ecranF(os.coudeD), vx = w[0] - c[0], vy = w[1] - c[1], l = Math.sqrt(vx * vx + vy * vy) || 1; trace.push([w[0] + vx / l * 52, w[1] + vy / l * 52, T]); }
  var s = '';
  trace.forEach(function(q, i){
    if(i === 0) return; var p0 = trace[i - 1], o = 1 - (T - q[2]) / 0.22; if(o <= 0 || q[2] - p0[2] > 0.1) return;
    var d = 'M' + p0[0].toFixed(0) + ' ' + p0[1].toFixed(0) + ' L' + q[0].toFixed(0) + ' ' + q[1].toFixed(0);
    s += '<path d="' + d + '" stroke="#8ff3ff" stroke-width="' + (40 * o).toFixed(1) + '" stroke-linecap="round" opacity="' + (0.22 * o).toFixed(2) + '"/>' +
      '<path d="' + d + '" stroke="#d8fbff" stroke-width="' + (18 * o).toFixed(1) + '" stroke-linecap="round" opacity="' + (0.55 * o).toFixed(2) + '"/>' +
      '<path d="' + d + '" stroke="#fff" stroke-width="' + (6 * o).toFixed(1) + '" stroke-linecap="round" opacity="' + (0.95 * o).toFixed(2) + '"/>';
  });
  return s;
};
V.effetRuban = function(fenetres, duree){
  var trace = [];
  this.effet('ruban', function(u, os, T){ return this.ruban(trace, fenetres.some(function(f){ return u > f[0] && u < f[1]; }), T); }, duree);
};
/* les étoiles qui tournent au-dessus de sa tête (le grand coup de poing : le film) */
function etoilesFilm(u, c){
  var s = '', o = u < 0.15 ? u / 0.15 : u > 0.75 ? Math.max(0, (0.95 - u) / 0.2) : 1, i;
  for(i = 0; i < 4; i++){ var a = u * 7 + i * Math.PI / 2, x = c[0] + 70 * Math.cos(a) + 10, y = c[1] - 70 + 18 * Math.sin(a);
    s += '<path d="M' + x.toFixed(0) + ' ' + (y - 12).toFixed(0) + ' L' + (x + 4).toFixed(0) + ' ' + (y - 3).toFixed(0) + ' L' + (x + 13).toFixed(0) + ' ' + (y - 2).toFixed(0) + ' L' + (x + 6).toFixed(0) + ' ' + (y + 4).toFixed(0) + ' L' + (x + 8).toFixed(0) + ' ' + (y + 13).toFixed(0) +
      ' L' + x.toFixed(0) + ' ' + (y + 8).toFixed(0) + ' L' + (x - 8).toFixed(0) + ' ' + (y + 13).toFixed(0) + ' L' + (x - 6).toFixed(0) + ' ' + (y + 4).toFixed(0) + ' L' + (x - 13).toFixed(0) + ' ' + (y - 2).toFixed(0) + ' L' + (x - 4).toFixed(0) + ' ' + (y - 3).toFixed(0) + ' Z" fill="#ffd23f" stroke="' + O + '" stroke-width="2.5" opacity="' + o.toFixed(2) + '"/>'; }
  return s;
}
/* LE GIVRE (refait — Romain, 20 h 05 : « l'effet de froid, je suis pas fan » ; avant : de gros losanges posés sur elle) : un voile
   blanc-bleu de givre sur la tête, les épaules, les bras et les genoux, hérissé de fines aiguilles de glace, et quelques flocons
   qui tombent autour d'elle ; tout fond quand elle s'ébroue. o : l'opacité ; u : depuis quand */
function givre(me, os, o, u){
  if(o <= 0) return '';
  var s = '', i, k;
  ['tete', 'epauleG', 'epauleD', 'coudeG', 'coudeD', 'poignetG', 'genouG', 'genouD'].forEach(function(n, i){
    var q = me.ecranF(os[n]), x = q[0] + ((i * 37) % 17 - 8), y = q[1] + ((i * 53) % 13 - 6) - (n === 'tete' ? 46 : 0), r = (n === 'tete' ? 30 : 20) + (i % 3) * 3;
    s += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + (r * 1.3).toFixed(0) + '" ry="' + r.toFixed(0) + '" fill="#e8f7ff" opacity="' + (0.38 * o).toFixed(2) + '"/>';
    var d = '';
    for(k = 0; k < 7; k++){ var a = k / 7 * Math.PI * 2 + i * 0.7, l = r * (0.7 + 0.35 * ((k * 5 + i) % 3) / 2);
      d += 'M' + x.toFixed(0) + ' ' + y.toFixed(0) + ' L' + (x + Math.cos(a) * l).toFixed(0) + ' ' + (y + Math.sin(a) * l * 0.85).toFixed(0) + ' '; }
    s += '<path d="' + d + '" stroke="#9fd8f6" stroke-width="6" stroke-linecap="round" opacity="' + (0.7 * o).toFixed(2) + '"/>' +
      '<path d="' + d + '" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="' + (0.95 * o).toFixed(2) + '"/>';
  });
  var c = me.ecranF(os.cou);
  for(i = 0; i < 7; i++){ var fx = c[0] + (i - 3) * 46 + 14 * Math.sin(u * 2 + i), fy = c[1] - 150 + ((u * 120 + i * 67) % 420);
    s += '<path d="M' + (fx - 9).toFixed(0) + ' ' + fy.toFixed(0) + ' L' + (fx + 9).toFixed(0) + ' ' + fy.toFixed(0) + ' M' + (fx - 5).toFixed(0) + ' ' + (fy - 8).toFixed(0) + ' L' + (fx + 5).toFixed(0) + ' ' + (fy + 8).toFixed(0) +
      ' M' + (fx + 5).toFixed(0) + ' ' + (fy - 8).toFixed(0) + ' L' + (fx - 5).toFixed(0) + ' ' + (fy + 8).toFixed(0) + '" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="' + (0.85 * o).toFixed(2) + '"/>'; }
  return s;
}
/* les rats qui lui grimpent dessus, puis s'enfuient (le film) */
function rats(me, os, u){
  var s = '';
  [['chevilleG', 'genouG', 0.0, -1], ['chevilleD', 'genouD', 0.15, 1], ['chevilleG', 'hancheG', 0.3, 1], ['chevilleD', 'hancheD', 0.45, -1], ['chevilleD', 'genouD', 0.7, -1]].forEach(function(r, i){
    var a = (u - r[2]) / 1.4; if(a < 0) return;
    var A = me.ecranF(os[r[0]]), B = me.ecranF(os[r[1]]), x, y, fuite = Math.max(0, (u - 2.0 - i * 0.06) / 0.6);
    if(fuite <= 0){ var w = Math.min(1, a) * 0.85 + 0.15 * Math.sin(u * 9 + i) * 0.2; x = mixe(A[0], B[0], w) + r[3] * 10; y = mixe(A[1] + 30, B[1], w); }
    else { if(fuite > 1) return; x = A[0] + r[3] * (40 + 260 * fuite); y = A[1] + 30 - 60 * Math.sin(Math.min(1, fuite * 2) * Math.PI) * 0.4 + 40 * fuite; }
    /* (plus gros que dans le film : au donjon elle est petite à l'écran, et les rats doivent se voir — comme ceux de l'ancien) */
    var dx = fuite > 0 ? r[3] : (i % 2 ? 0.3 : -0.3), ang = fuite > 0 ? 0 : -70, G2 = 2.2;
    s += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + (ang * (dx > 0 ? -1 : 1)) + ') scale(' + (dx >= 0 ? G2 : -G2) + ' ' + G2 + ')">' +
      '<path d="M-14 4 Q-34 10 -40 -2" fill="none" stroke="' + O + '" stroke-width="5"/><path d="M-14 4 Q-34 10 -40 -2" fill="none" stroke="#d99aa0" stroke-width="2.5"/>' +
      '<ellipse cx="0" cy="0" rx="17" ry="10" fill="#6b6570" stroke="' + O + '" stroke-width="3"/><circle cx="16" cy="-3" r="7" fill="#6b6570" stroke="' + O + '" stroke-width="3"/>' +
      '<circle cx="12" cy="-10" r="4" fill="#d99aa0" stroke="' + O + '" stroke-width="2"/><circle cx="19" cy="-4" r="1.8" fill="' + O + '"/></g>';
  });
  return s;
}
/* LA TOILE (le film) : des rayons qui partent de sa poitrine, la spirale, les amarres, le cocon de soie ; dech : quand elle la
   déchire (null : pas encore) */
function toile(me, os, u, dech){
  var s = '', SOIE = '#f4f1ea', i, k, N = 16, RX = 150, RY = 230;
  var e = function(n){ return me.ecranF(os[n]); }, eG = e('epauleG'), eD = e('epauleD'), hG = e('hancheG'), hD = e('hancheD'), gG = e('genouG'), gD = e('genouD');
  var cx = (eG[0] + eD[0] + hG[0] + hD[0]) / 4, cy = mixe((eG[1] + eD[1]) / 2, (hG[1] + hD[1]) / 2, 0.35);
  function f(x){ return x.toFixed(1); }
  function fil(d, w, o, c){ return '<path d="' + d + '" fill="none" stroke="' + (c || SOIE) + '" stroke-width="' + w + '" stroke-linecap="round" opacity="' + o.toFixed(2) + '"/>'; }
  if(dech == null){
    var o = Math.min(1, u / 0.25), tr = 3 * Math.sin(u * 9) * (u > 0.33 ? 1 : 0), P = [];
    for(i = 0; i < N; i++){ var an = i / N * Math.PI * 2 + 0.13 * Math.sin(i * 2.3), rr = 1 + 0.12 * Math.sin(i * 1.7); P.push([Math.cos(an) * RX * rr, Math.sin(an) * RY * rr]); }
    [[260, -380], [-230, -380], [380, 20], [-300, 330], [230, 330]].forEach(function(a){ var q = P[Math.round((Math.atan2(a[1], a[0]) / (Math.PI * 2) + 1) * N) % N];
      s += fil('M' + f(cx + q[0] + tr) + ' ' + f(cy + q[1]) + ' L' + f(cx + a[0]) + ' ' + f(cy + a[1]), 2, 0.75 * o); });
    for(i = 0; i < N; i++) s += fil('M' + f(cx + tr) + ' ' + f(cy) + ' L' + f(cx + P[i][0] + tr) + ' ' + f(cy + P[i][1]), 2.2, 0.85 * o);
    for(k = 1; k <= 7; k++){ var fr = k / 7.4, d = '';
      for(i = 0; i < N; i++){ var a0 = P[i], a1 = P[(i + 1) % N], mx = (a0[0] + a1[0]) / 2 * fr * 0.86, my = (a0[1] + a1[1]) / 2 * fr * 0.86;
        d += (i === 0 ? 'M' + f(cx + a0[0] * fr + tr) + ' ' + f(cy + a0[1] * fr) : '') + ' Q' + f(cx + mx + tr) + ' ' + f(cy + my) + ' ' + f(cx + a1[0] * fr + tr) + ' ' + f(cy + a1[1] * fr); }
      s += fil(d, 1.7, 0.8 * o); }
    [[eG, eD, 0.0], [mixe2(eG, hG, 0.5), mixe2(eD, hD, 0.5), 0.1], [hG, hD, 0.2], [mixe2(hG, gG, 0.5), mixe2(hD, gD, 0.5), 0.3], [gG, gD, 0.4]].forEach(function(b, j){
      var a = Math.min(1, Math.max(0, (u - 0.08 - b[2] * 0.5) / 0.25)); if(a <= 0) return;
      var x0 = Math.min(b[0][0], b[1][0]) - 34, x1 = Math.max(b[0][0], b[1][0]) + 34, y0 = (b[0][1] + b[1][1]) / 2 + (j % 2 ? 8 : -6), dy = j % 2 ? -14 : 14;
      var d2 = 'M' + f(x0 + tr) + ' ' + f(y0 - dy) + ' Q' + f((x0 + x1) / 2 + tr) + ' ' + f(y0 + 26) + ' ' + f(x1 + tr) + ' ' + f(y0 + dy);
      s += fil(d2, 13, 0.55 * a * o, '#d9d4c8') + fil(d2, 8, 0.8 * a * o) + fil(d2, 1.4, 0.7 * a * o, '#ffffff');
    });
    return s;
  }
  var a2 = (u - dech) / 0.9; if(a2 > 1 || a2 < 0) return '';
  for(i = 0; i < N; i++){ var an2 = i / N * Math.PI * 2, r1 = 40 + 320 * a2, r2 = r1 + 50;
    s += fil('M' + f(cx + Math.cos(an2) * r1) + ' ' + f(cy + Math.sin(an2) * r1 * 1.3 + 140 * a2 * a2) + ' L' + f(cx + Math.cos(an2 + 0.2) * r2) + ' ' + f(cy + Math.sin(an2 + 0.2) * r2 * 1.3 + 140 * a2 * a2), 3, 0.9 * (1 - a2)); }
  [[260, -380], [-230, -380]].forEach(function(a, j){ var bx = cx + a[0] * 0.55 + 20 * Math.sin(u * 7 + j), by = cy + a[1] * 0.4;
    s += fil('M' + f(cx + a[0]) + ' ' + f(cy + a[1]) + ' Q' + f(cx + a[0] * 0.7) + ' ' + f(cy + a[1] * 0.6) + ' ' + f(bx) + ' ' + f(by), 2, 0.8 * (1 - a2)); });
  return s;
}
/* la bave verte (le crapaud : le film) ; ebroue : depuis quand elle s'ébroue (les gouttes) */
function bave(me, os, o, ebroue){
  if(o <= 0) return '';
  var s = '', f = me.ecranF(os.chevilleG), g = me.ecranF(os.chevilleD);
  s += '<ellipse cx="' + ((f[0] + g[0]) / 2 - 40).toFixed(0) + '" cy="' + (Math.max(f[1], g[1]) + 26).toFixed(0) + '" rx="150" ry="22" fill="#8fd16a" opacity="' + (0.55 * o).toFixed(2) + '"/>';
  ['tete', 'epauleG', 'epauleD', 'coudeD', 'genouG', 'genouD', 'bassin'].forEach(function(n, i){ var q = me.ecranF(os[n]), x = q[0] + (i % 2 ? 8 : -6), y = q[1] + 4, l = 14 + (i % 3) * 8;
    s += '<path d="M' + (x - 9).toFixed(0) + ' ' + y.toFixed(0) + ' Q' + x.toFixed(0) + ' ' + (y - 10).toFixed(0) + ' ' + (x + 9).toFixed(0) + ' ' + y.toFixed(0) + ' L' + (x + 4).toFixed(0) + ' ' + (y + l).toFixed(0) + ' Q' + x.toFixed(0) + ' ' + (y + l + 8).toFixed(0) + ' ' + (x - 4).toFixed(0) + ' ' + (y + l).toFixed(0) + ' Z" fill="#9be07a" stroke="#4f8a37" stroke-width="2" opacity="' + (0.85 * o).toFixed(2) + '"/>'; });
  if(ebroue > 0 && ebroue < 0.75){ var c2 = me.ecranF(os.tete), k2; for(k2 = 0; k2 < 8; k2++){ var an = k2 / 8 * Math.PI * 2 + 0.3, r = 50 + ebroue * 300 * ((k2 % 3) + 2) / 3;
    s += rond(c2[0] + 10 + r * Math.cos(an), c2[1] - 40 + r * 0.7 * Math.sin(an), 7, '#9be07a', Math.max(0, 1 - ebroue / 0.75), ' stroke="#4f8a37" stroke-width="2"'); } }
  return s;
}
/* (les effets de l'ancien, posés sur elle : ils lisent ses repères — rep, fx, boite) */
V._poussiere = function(){ if(PROTO) PROTO._poussiere.call(this); };
V._flash = function(){ if(PROTO) PROTO._flash.call(this); };
V._etoiles = function(on){ if(PROTO) PROTO._etoiles.call(this, on); };
V.ombreFait = function(nom){ var o = this.ombre, a = [].slice.call(arguments, 1); if(!o || !o[nom]) return Promise.resolve(); try{ return Promise.resolve(o[nom].apply(o, a)).catch(function(){}); }catch(e){ return Promise.resolve(); } };

/* ==========================================================
   LES ORDRES DU COMBAT
   ========================================================== */
/* ELLE ARRIVE EN COURANT, et freine (la course et l'arrêt validés par Romain) */
V.entrer = function(dist){
  dist = dist === undefined ? 320 : dist;
  var me = this;
  this.boite.style.transform = 'translateX(' + (-dist) + 'px)';
  return this.file(function(){
    var C = HV.COURSE, A = HV.ARRET, sc = (this.boite.offsetWidth || 200) / CADRE[2] * Math.sin(CAP * Math.PI / 180);
    var v = C.avance / C.cycle * sc, G9 = A.glisse(9) * sc;
    /* (elle commence à freiner à 93 % d'un pas, comme dans le film ; pas plus de 1,6 s de course : au-delà, elle glisse un peu) */
    var n = Math.max(1, Math.min(Math.floor(1.6 / C.cycle - 0.93), Math.round((dist - G9) / v / C.cycle - 0.93))), ts = (n + 0.93) * C.cycle, vr = (dist - G9) / ts;
    var dep = HV.course(ts), cles = HV.arret(), vu = {};
    this._finGeste(); this.cles = null; this.apresF = null; this.tenue = null; this.trans = null; this.t0 = maintenant();
    return new Promise(function(fini){
      me.course = function(u){
        var x, P;
        if(u < ts){ x = -dist + vr * u; P = HV.course(u); }
        else {
          var ua = u - ts; x = -G9 + A.glisse(Math.min(ua, A.duree)) * sc;
          A.poussiere.forEach(function(tp, i){ if(ua >= tp && !vu[i]){ vu[i] = 1; me._poussiere(); } });
          if(ua >= A.duree){ me.course = null; me.boite.style.transform = ''; setTimeout(fini, 0); return HV.gesteImage(dep, cles, A.duree); }
          P = HV.gesteImage(dep, cles, ua);
        }
        me.boite.style.transform = 'translateX(' + Math.min(0, x).toFixed(1) + 'px)';
        return P;
      };
    });
  });
};
V.attendre = function(){ this._veut = true; return this; };
/* C'EST SON TOUR : l'anneau doré (dessiné avec elle : l'arrière passe derrière ses bottes, l'avant devant), elle se redresse */
V.choisi = function(on){
  on = on !== false;
  if(!this.slot) this.p.choisi(on);
  if(!!this._choisi === on) return Promise.resolve();
  this._choisi = on;
  if(on && !this.ko && !this.cles && !this.course && !this.tenue && !this.apresF) this.jouer(HV.DONJON.choisi);
  return Promise.resolve();
};
V.joie = function(){
  return this.file(function(){ if(this.ko) return null; return Promise.all([this.jouer(HV.DONJON.joie), this.ombreFait('joie')]); });
};
/* ELLE PREND UN COUP : le coup simple, le givre, les rats, le grand coup de poing */
V.touche = function(type, opt){
  var g = type === 'froid' || type === 'brulure' ? 'froid' : type === 'grouillement' ? 'rats' : type === 'poing' ? 'poing' : 'coup';
  return this.file(function(){
    if(this.ko) return null;
    var me = this, L = [this.jouer(HV.DONJON[g])];
    if(g === 'coup') L.push(this.ombreFait('touche'));
    if(g === 'froid'){
      L.push(this.ombreFait('touche', 'froid', opt));
      this.effet('givre', function(u, os){ return givre(this, os, u < 0.3 ? u / 0.3 : u < 2.25 ? 1 : Math.max(0, 1 - (u - 2.25) / 0.35), u); }, 2.6);
    }
    if(g === 'rats'){
      this.effet('rats', function(u, os){ return rats(this, os, u); }, 3.0);
    }
    if(g === 'poing'){
      /* (le choc, la lueur, la poussière de l'ancien — la poussière tombe sous son pied de derrière ; elle ne glisse plus : Romain,
         20 h 05, « trop repoussé en arrière […] on a l'impression qu'il flotte ») */
      L.push(this.ombreFait('touche', 'poing', opt));
      this.effet('etoiles', function(u, os){ return u < 0.45 ? '' : etoilesFilm(u - 0.45, this.ecranF(os.tete)); }, 1.4);
    }
    return Promise.all(L);
  });
};
/* ELLE TOMBE SUR LE DOS, sonnée (la chute validée), et reste allongée */
V.tomber = function(){
  return this.file(function(){
    if(this.ko) return null;
    var me = this;
    this.ko = true;
    this.ombreFait('tomber');
    this.plus(860, function(){ if(me.ko) me._etoiles(true); });
    return this.jouer(HV.DONJON.chute.filter(function(k){ return k[0] <= 0.84 + 1e-6; }), HV.SONNEE);
  });
};
/* ELLE SE RELÈVE : comme après la chute ; avec l'amulette, la lumière dorée la soulève d'un coup */
V.relever = function(opt){
  opt = opt || {};
  return this.file(function(){
    var me = this, am = !!opt.amulette;
    this._etoiles(false);
    var L = am ? HV.DONJON.amulette : [[0.01, HV.SONNEE]].concat(decale(HV.RELEVE, 0.5));
    return attendre(opt.retard || 0).then(function(){
      var o = me.ombreFait('relever', opt);
      return Promise.all([me.jouer(L), o]);
    }).then(function(){ me.ko = false; });
  });
};
/* ELLE TIRE : le geste validé (la main au carquois, le bras levé haut, la flèche encochée, elle bande, elle lâche à 1,38 s) ;
   la flèche qui vole est celle de l'ancien (toutes les sortes : feu, huile, colle, argent, lourde, rebond…), partie de son arc */
var ANCIENNES = {normale:1, feu:1, huile:1, colle:1};
V.tirer = function(scene, to, type, opt){
  if(type && typeof type === 'object'){ opt = type; type = opt.type; }
  type = type || 'normale'; opt = opt || {};
  if(type === 'rebond'){ type = 'normale'; opt.rebond = true; }
  var me = this, neuve = !ANCIENNES[type] || opt.rebond;
  return this.file(function(sig){
    var fini = this.jouer(HV.DONJON.tir);
    var vole = attendre(1380).then(function(){
      /* (la flèche qui vole part tout entière DEVANT la main de l'arc : sa queue ne passe jamais sur son bras ni sur sa tête —
         Romain, 17 h 44 : « la flèche, quand elle tire, elle passe par-dessus le bras ») */
      var m = me.rep('poignee', scene), dx = to.x - m.x, dy = to.y - m.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      /* (une flèche à sa taille : Romain, 20 h 05, « la flèche qui va sur les ennemis, elle est 10 fois trop grosse ») */
      var k = me.echelle(scene), L = 56 * k, t ={x:m.x + ux * (L + 14 * k), y:m.y + uy * (L + 14 * k)}, n = {x:t.x - ux * L, y:t.y - uy * L};
      if(type === 'lourde' && me._recul) try{ me._recul(); }catch(e){}
      var f = neuve ? me._fleche2 : me._fleche;
      if(!f) return null;
      var r = f.call(me, scene, n, t, to, type, opt);
      /* (sa traînée de lumière, derrière elle, n'apparaît qu'une fois la flèche partie : elle ne passe pas sur son bras) */
      try{ var Ly = scene.querySelector(':scope > .ha-fxs'), w = Ly && Ly.lastElementChild, tr = w && w.firstElementChild;
        if(tr && !tr.querySelector('svg')) tr.animate([{opacity:0}, {opacity:0, offset:0.5}, {opacity:1}], {duration:180, fill:'backwards'}); }catch(e){}
      return r.then(sig);
    });
    return Promise.all([fini, vole]);
  });
};
/* combien de pixels de la scène pour un pixel de sa boîte */
V.echelle = function(scene){ var a = this.racine.getBoundingClientRect(), b = scene.getBoundingClientRect(); return (a.width / (this.racine.offsetWidth || a.width)) / ((b.width / (scene.offsetWidth || b.width)) || 1); };
/* LA DAGUE (Romain, 18 h 51 : « plus violent et plus vers devant […] que le bras entraîne le corps ») : près de l'ennemi, deux grands
   revers, elle avance d'un bond ; loin (le dernier rang), ELLE SAUTE jusqu'à lui, abat la dague en retombant, et revient */
var SEUIL_SAUT = 150;
V.dague = function(scene, to, opt){
  opt = opt || {};
  var me = this;
  return this.file(function(sig){
    var pied = this.rep('chevilleB', scene), k = this.echelle(scene), dx = Math.max(0, to.x - pied.x - 70) / k;
    var coup = function(dernier){
      try{ if(me._impactDague) me._impactDague(scene, to); }catch(e){}
      if(!dernier) return; sig(to); try{ if(opt.onImpact) opt.onImpact(to); }catch(e){ if(G.console) console.error(e); }
    };
    var lame = function(){ try{ if(me._lame) me._lame(scene, to); }catch(e){} };
    if(dx > SEUIL_SAUT){
      var S = HV.SAUT;
      this.plus(S.decolle * 1000, function(){ me._poussiere(); me.glisse(0, dx, S.frappe - S.decolle, lisse); });
      this.plus((S.frappe - 0.08) * 1000, lame);
      this.plus(S.frappe * 1000, function(){ coup(true); me._poussiere(); });
      this.plus(S.repart * 1000, function(){ me.glisse(dx, 0, S.revient - S.repart, lisse); });
      this.plus(S.revient * 1000, function(){ me._poussiere(); });
      this.effetRuban([[S.frappe - 0.16, S.frappe + 0.04]], 2.0);
      return this.jouer(HV.DONJON.dagueSaut);
    }
    /* (près : elle avance d'un bond pendant qu'elle arme, frappe deux fois, puis recule à sa place) */
    var av = Math.max(0, dx - 30);
    this.plus(300, function(){ me.glisse(0, av, 0.22, lisse); });
    this.plus(480, lame); this.plus(540, function(){ coup(true); });
    this.plus(840, lame); this.plus(900, function(){ coup(false); });
    this.plus(1300, function(){ me.glisse(av, 0, 0.36, lisse); });
    this.effetRuban([[0.46, 0.66], [0.84, 1.02]], 1.4);
    return this.jouer(HV.DONJON.dague);
  });
};
/* LA TOILE : collée dans une vraie toile d'araignée, elle se débat (en boucle) ; entoile(false) : elle la déchire */
V.entoile = function(on){
  on = on !== false;
  if(on === !!this._toileV) return Promise.resolve();
  this._toileV = on;
  return this.file(function(){
    var me = this;
    this.ombreFait('entoile', on);
    if(on){
      this.effet('toile', function(u, os){ return toile(this, os, u, null); }, 1e9);
      return this.jouer(HV.DONJON.toile.filter(function(k){ return k[0] <= 0.35 + 1e-6; }), function(u){
        var a = Math.sin(u * 3.2), b = Math.max(0, Math.sin(u * 1.6));
        return HV.avec(HV.POSES.dGarde, HV.avec(HV.COLLEE, {dos:[2 * b, 0, 12 * a], bas:[-3 * a, 30, -4], hoche:6 + 4 * b, plisse:0.4 + 0.4 * b}));
      }).then(function(){ return attendre(500); });
    }
    /* (elle se ramasse et l'ouvre d'un coup : les fils cassent et volent) */
    var L = morceau(HV.DONJON.toile, 1.6, 3.1, HV.COLLEE), dech = 1.92 - 1.6 + 0.01;
    this.plus(dech * 1000, function(){ var t0 = maintenant(); me.effet('toile', function(u, os){ return toile(this, os, maintenant() - t0, 0); }, 1.0); });
    return this.jouer(L);
  });
};
/* LE CRAPAUD : happée par la langue (tirée en avant, elle disparaît) … puis recrachée (en boule, elle retombe assise, couverte de
   bave, s'ébroue et se relève) */
V.avale = function(){
  return this.file(function(){
    var me = this, C = HV.CRAPAUD, D = 460;
    this._etoiles(false);
    this.ombreFait('avale');
    var L = morceau(HV.DONJON.crapaud, C.colle - 0.12, C.avalee);
    var a = this.boite.animate([{transform:'translate(0px,0px)', opacity:1}, {transform:'translate(14px,-4px) rotate(4deg)', opacity:1, offset:.22, easing:'cubic-bezier(.6,0,.9,.4)'},
      {transform:'translate(170px,-46px) rotate(30deg) scale(.42)', opacity:0}], {duration:D, delay:(L[L.length - 1][0] * 1000 - D), fill:'forwards'});
    return Promise.all([this.jouer(L), a.finished]).then(function(){ me._avale = true; me.boite.style.opacity = '0'; me.boite.style.transform = ''; a.cancel(); });
  });
};
V.recrache = function(scene, depuis){
  if(scene && scene.x !== undefined){ depuis = scene; scene = null; }
  return this.file(function(){
    var me = this, C = HV.CRAPAUD, dv = C.pose - C.recrachee, c0 = this.rep('bassin', this.fx);
    var dep = depuis ? (scene ? this.versRefDepuis(scene, depuis) : this.versRefEcran(depuis)) : {x:c0.x + 360, y:c0.y - 60};
    var ox = dep.x - c0.x, oy = dep.y - c0.y, N = 16, kf = [], hautV = Math.max(70, Math.abs(ox) * 0.28);
    for(var i = 0; i <= N; i++){
      var t = i / N, u = 1 - t, mx = ox / 2, my = Math.min(oy, 0) / 2 - hautV, x = u * u * ox + 2 * u * t * mx, y = u * u * oy + 2 * u * t * my;
      kf.push({offset:t, transform:'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (-360 * u).toFixed(1) + 'deg) scale(' + (0.62 + 0.38 * t).toFixed(3) + ')'});
    }
    this.boite.style.opacity = ''; this._avale = false;
    this.ombreFait('recrache', scene, depuis);
    this.boite.animate(kf, {duration:dv * 1000, easing:'linear'});
    /* (la fin de son geste, sans l'essuyage de la figure : le combat attend) */
    var L = morceau(HV.DONJON.crapaud, C.recrachee - 0.01, 4.6), fin = L[L.length - 1][0];
    L.push([fin + 0.5, {}]);
    this.plus(dv * 1000, function(){ var t0 = maintenant(); me.effet('bave', function(u2, os){ var v = maintenant() - t0; return bave(this, os, v < 2.2 ? 1 : Math.max(0, 1 - (v - 2.2) / 0.6), v - (3.05 - C.pose)); }, 3.0); });
    return this.jouer(L);
  });
};
/* un point de la scène (ou de l'écran) → pixels de son calque fx */
V.versRefDepuis = function(scene, p){ var S = scene.getBoundingClientRect(), ks = (S.width / (scene.offsetWidth || S.width)) || 1; return this.versRefEcran({x:S.left + p.x * ks, y:S.top + p.y * ks}); };
V.versRefEcran = function(p){ var Q = this.fx.getBoundingClientRect(), k = (Q.width / (this.fx.offsetWidth || Q.width)) || 1; return {x:(p.x - Q.left) / k, y:(p.y - Q.top) / k}; };
/* les objets : retenus (l'ancien, invisible, les porte ; elle, pas encore) */
V.equiper = function(objet, on, opt){ return this.ombreFait('equiper', objet, on, opt).then(function(v){ return v !== false; }); };
V.equipe = function(objet){ return !!(this.ombre && this.ombre.equipe && this.ombre.equipe(objet)); };
V.expr = function(){};
V.cligner = function(){};
V.arreter = function(){
  this._veut = false; this._timers.forEach(clearTimeout); this._timers = [];
  this._etoiles(false);
  if(this.ombre) try{ this.ombre.arreter(); }catch(e){}
};
V.detruire = function(){ this.arreter(); this.p.detruire(); this.racine.remove(); if(this.ombre) try{ this.ombre.detruire(); }catch(e){} };

/* ---------- l'enveloppe : quand le donjon pose window.HerosAnime, son « creer » donne la Pisteuse en volume ---------- */
function envelopper(HA){
  if(!HA || HA.__hv) return HA;
  var creer0 = HA.creer;
  HA.creer = function(cont, role, lk){
    if(role !== 'pisteur' || G.HV_ANCIEN) return creer0.apply(HA, arguments);
    return new Volume(cont, lk, function(c, r, l){ return creer0.call(HA, c, r, l); });
  };
  HA.__hv = true;
  return HA;
}
var ha;
if(G.HerosAnime) ha = envelopper(G.HerosAnime);
Object.defineProperty(G, 'HerosAnime', {configurable:true, get:function(){ return ha; }, set:function(v){ ha = envelopper(v); }});
G.HerosVuesDonjon = {Volume:Volume, CADRE:CADRE};
})(window);
