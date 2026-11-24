/* ==========================================================
   Les héros « en volume » — LE PANTIN CUIT (24 novembre, nuit).
   Romain, 4 h 14 : « les nouveaux personnages, ils font ramer même mon iPhone […] il faut qu'on soit à 24 images minimum pour
   toutes les tablettes, même celles qui sont très lentes […] la fluidité, c'est le plus important ».

   POURQUOI. Le pantin (hv-pantin.js) refait TOUT le dessin à chaque image : le calcul (HV.dessin), puis le navigateur repeint tout le
   SVG — sur une vieille tablette, 60 à 100 ms par image. Ici, comme les anciens héros (cuire.js, RAPIDITE.md) :
     - le héros est découpé en MORCEAUX (le buste, le haut et le bas de chaque bras, chaque main avec ce qu'elle tient, chaque cuisse,
       chaque botte, le cou, la tête, les cheveux de derrière) ; chaque morceau est dessiné UNE fois par le vrai dessin en volume
       (HV.morceaux, hv-corps.js), dans une petite toile ;
     - pendant un geste, on calcule d'avance, pour tout le geste, où sont les os (HV.squelette : presque rien à calculer) et donc où
       va chaque morceau ; la carte graphique les déplace (element.animate, transform et opacity) — le fil principal dort.
     - quand un morceau change vraiment de forme (la main se ferme, le visage change d'expression, la tête tourne), c'est une
       VARIANTE du morceau, dessinée à part (une fois, puis gardée) ; on passe de l'une à l'autre d'un coup (opacity).
     - devant / derrière (un bras passe derrière le buste) : le morceau existe dans plusieurs couches, une seule est visible.

   HV.Cuit.monter(hote, h, o) → R (le pantin cuit)
     o.cap : l'angle où on le regarde (le donjon : 55) ; o.cadre : la viewBox de l'hôte (comme le pantin) ; o.res : pixels par unité.
     R.preparer(P) → promesse : les morceaux de la pose P (cuits) ; R.jouer(images, o) : un geste (images = [{t, P}], t en secondes)
     R.boucle(images, duree) : une boucle (la respiration) ; R.os(t) : les os à l'instant t du geste en cours ; R.detruire()
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, RAD = HV.RAD;
var CU = HV.Cuit = {};
var NUM = 0;
CU.cache = {};

/* ---------- la géométrie ---------- */
function ang(a, b){ return Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD; }
function dist(a, b){ var x = b[0] - a[0], y = b[1] - a[1]; return Math.sqrt(x * x + y * y); }
function f2(v){ return Math.round(v * 100) / 100; }
/* un angle le plus près possible du précédent (pas de tour complet entre deux images) */
function pres(a, ref){ if(ref == null) return a; while(a - ref > 180) a -= 360; while(a - ref < -180) a += 360; return a; }

/* ---------- les morceaux et leurs os ----------
   type 'os' : le morceau va d'un point A à un point B (il tourne, et s'allonge un peu dans sa longueur) ;
   type 'tete' : il suit la tête (posée au bout du cou, penchée) ;
   type 'corps' : il suit le buste (du bassin au haut du dos). */
var MORCEAUX = {
  brasHautG:{type:'os', os:function(S){ return [S.bras.G.e, S.bras.G.c2]; }},
  brasBasG:{type:'os', os:function(S){ return [S.bras.G.c2, S.bras.G.w]; }},
  mainG:{type:'os', os:function(S){ return [S.bras.G.w, S.bras.G.m]; }},
  brasHautD:{type:'os', os:function(S){ return [S.bras.D.e, S.bras.D.c2]; }},
  brasBasD:{type:'os', os:function(S){ return [S.bras.D.c2, S.bras.D.w]; }},
  mainD:{type:'os', os:function(S){ return [S.bras.D.w, S.bras.D.m]; }},
  cuisseG:{type:'os', os:function(S){ return [S.jambes.G.ha, S.jambes.G.kn]; }},
  botteG:{type:'os', os:function(S){ return [S.jambes.G.kn, S.jambes.G.an]; }},
  cuisseD:{type:'os', os:function(S){ return [S.jambes.D.ha, S.jambes.D.kn]; }},
  botteD:{type:'os', os:function(S){ return [S.jambes.D.kn, S.jambes.D.an]; }},
  buste:{type:'os', os:function(S){ return [S.bassin, S.haut]; }, raide:true},
  carquois:{type:'os', os:function(S){ return [S.bassin, S.haut]; }, raide:true},
  robe:{type:'os', os:function(S){ return [S.bassin, S.haut]; }, raide:true},
  cou:{type:'os', os:function(S){ return [S.tete.bc, S.tete.cou0]; }, raide:true},
  /* l'arc (ses deux branches et sa poignée), chaque moitié de la corde, la flèche encochée : tendus entre leurs points (arcOs) */
  arc:{type:'os', os:function(S){ return [S.arc.t1, S.arc.t2]; }, bras:'G'},
  cordeH:{type:'os', os:function(S){ return [S.arc.t1, S.arc.mid]; }, bras:'G'},
  cordeB:{type:'os', os:function(S){ return [S.arc.t2, S.arc.mid]; }, bras:'G'},
  fleche:{type:'os', os:function(S){ return [S.arc.mid, S.arc.pt]; }, bras:'G'},
  /* le bâton du Sage, la louche de l'Alchimiste (objetsOs, hv-corps.js) */
  baton:{type:'os', os:function(S){ return [S.baton.a, S.baton.b]; }, bras:'G'},
  louche:{type:'os', os:function(S){ return [S.louche.a, S.louche.b]; }, bras:'G'},
  cheveuxDos:{type:'tete'},
  tete:{type:'tete'}
};
/* l'ordre, du fond vers nous (z-index = couche × 10 + rang dans la couche) ; les bras et les jambes ont plusieurs couches */
var Z = {cheveuxDos:1, carquois:3, brasFond:4, jambeLoin:6, jambePres:7, cou:9, buste:10, robe:11, carquoisDevant:12, brasAvant:13, tete:15, brasDessus:17};
var RANG = {brasBas:1, brasHaut:2, cordeH:3, cordeB:3, arc:4, baton:4, louche:4, fleche:5, main:6, cuisse:1, botte:2};
function rangDe(nom){ var r = RANG[nom.replace(/[GD]$/, '')]; return r == null ? 0 : r; }
function coucheBras(S, cle, P){
  var b = S.bras[cle];
  if(b.fond < -8 || b.sous) return 'brasFond';
  return P.brasDessus > 0.5 && !S.dos ? 'brasDessus' : 'brasAvant';
}

/* ---------- les clés des variantes : deux poses qui donnent la même clé ont le même dessin de ce morceau ---------- */
function q(v, pas){ return Math.round((v || 0) / pas) * pas; }
/* (la vue d'un morceau du corps : l'angle où on le regarde, plus ce que le bassin et le dos tournent sur eux-mêmes) */
/* (pas : tous les combien de degrés une nouvelle variante — le buste change beaucoup quand il tourne ; un bras, une botte, presque pas) */
/* (un angle ramené entre -180 et 180 : après un tour complet, on retrouve les mêmes variantes) */
function tour(a){ a = ((a % 360) + 540) % 360 - 180; return a === -180 ? 180 : a; }
function vueDe(P, pas){ return tour(q(HV.capDe(P) + ((P.bang || [0, 0, 0])[2] + (P.dos || [0, 0, 0])[2]) * 0.5, P._vite ? Math.max(90, pas || 20) : pas || 20)); }
/* (quand le corps tourne vite — la victoire en tournant sur soi-même —, une variante tous les 60° suffit : on ne voit pas la différence,
   et il y en aurait plus de cent à dessiner) */
function marquer(images){
  for(var i = 1; i < images.length; i++){
    var a = images[i - 1], b = images[i], dt = Math.max(1e-3, b.t - a.t), d = Math.abs(HV.capDe(b.P) - HV.capDe(a.P)) / dt;
    if(d > 240){ a.P = copie(a.P); b.P = copie(b.P); a.P._vite = b.P._vite = true; }
  }
  return images;
}
function copie(P){ if(P._copie) return P; var R = {}, k; for(k in P) R[k] = P[k]; R._copie = true; return R; }
var PAS_VUE = {buste:20, carquois:20, robe:20, cou:30, arc:30, brasHautG:60, brasBasG:60, brasHautD:60, brasBasD:60, cuisseG:60, botteG:60, cuisseD:60, botteD:60};
function cleMain(P, c, K){
  /* (la couleur des fioles de l'Alchimiste : K.potion, K.potion2 — le donjon la change pendant ses gestes) */
  var fi = (c === 'D' ? P.fioleD : P.fioleG) > 0.3 && K ? 'k' + (K.potion || '') + (K.potion2 || '') : '';
  return fi + 'v' + vueDe(P, 30) + 'p' + q(P['poing' + c], 0.25) + 'i' + q(P['index' + c], 0.5) +
    (c === 'D' ? 'd' + q(P.dague, 1) + 'f' + q(P.flecheD, 1) + 'fd' + q(P.fioleD, 1) + 'm' + q(P.marmite, 1) + 'h' + q(P.herbes, 1) + 'l' + q(P.livre, 1) + q(P.livreO, 0.5) :
      't' + q(P.tendu, 0.5) + 'fg' + q(P.fioleG, 1) + 'lo' + q(P.louche, 1) + 'sb' + q(P.sansBaton, 1) + 'cr' + q(P.cristal, 0.5));
}
/* (le visage : assez de variantes pour qu'on voie l'expression changer, pas trop — chacune se dessine à part) */
function cleTete(P, yaw){
  return 'y' + q(yaw, 20) + 'h' + q(P.hoche, 12) + 's' + q(P.sourcils, 0.5) + 'p' + q(P.plisse, 0.5) +
    'r' + q(P.sourire, 0.5) + 'o' + q(P.ouvre, 0.34) + 'l' + q(P.largeB, 0.5) + 'e' + q(P.regX, 1) + q(P.regY, 1) + 'c' + (P.yo != null && P.yo < 0.5 ? 0 : 1);
}
function cleDe(nom, P, S, K){
  if(nom === 'mainG') return cleMain(P, 'G', K);
  if(nom === 'mainD') return cleMain(P, 'D', K);
  if(nom === 'tete') return cleTete(P, tour(P._vite ? q(S.tete.yaw + HV.capDe(P), 90) : q(S.tete.yaw + HV.capDe(P), 20)));
  if(nom === 'cheveuxDos') return 'y' + tour(q(S.tete.yaw + HV.capDe(P), P._vite ? 90 : 20));
  if(nom === 'arc') return S.arc ? 'v' + vueDe(P, 30) + 's' + S.arc.sens + 't' + q(S.arc.td, 0.5) : null;
  if(nom === 'cordeH' || nom === 'cordeB') return S.arc ? 'c' : null;
  if(nom === 'fleche') return S.arc && S.arc.pt ? 'f' : null;
  if(nom === 'baton') return S.baton ? 'v' + vueDe(P, 30) + 'c' + q(S.baton.cri, 0.25) : null;
  if(nom === 'louche') return S.louche ? 'o' + q(S.louche.o, 0.5) : null;
  /* (le haut d'un bras devant le buste se fond dans la poitrine ; derrière, il a tout son contour : deux dessins) */
  if(/^brasHaut/.test(nom)) return 'v' + vueDe(P, PAS_VUE[nom]) + (coucheBras(S, nom.slice(-1), P) === 'brasFond' ? 'f' : 'a');
  return 'v' + vueDe(P, PAS_VUE[nom]);
}

/* ---------- dessiner un SVG dans une toile ---------- */
function toile(texte, W, H){
  return new Promise(function(ok){
    var u = URL.createObjectURL(new Blob([texte], {type:'image/svg+xml'})), im = new Image();
    im.onload = function(){
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      try{ cv.getContext('2d').drawImage(im, 0, 0, W, H); }catch(e){}
      URL.revokeObjectURL(u); ok(cv);
    };
    im.onerror = function(){ URL.revokeObjectURL(u); ok(null); };
    im.src = u;
  });
}
/* la boîte d'un morceau (on le pose dans un SVG caché pour la mesurer) */
var MESURE = null;
function boite(svgDefs, corps){
  if(!MESURE){
    MESURE = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    MESURE.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:300px;height:440px;visibility:hidden;pointer-events:none');
    document.body.appendChild(MESURE);
  }
  MESURE.innerHTML = svgDefs + '<g>' + corps + '</g>';
  var g = MESURE.lastChild, b;
  try{ b = g.getBBox(); }catch(e){ b = null; }
  MESURE.innerHTML = '';
  return b && b.width > 0 ? {x:b.x - 5, y:b.y - 5, w:b.width + 10, h:b.height + 10} : null;
}

/* ==========================================================
   LE PANTIN CUIT
   ========================================================== */
function Cuit(hote, h, o){
  o = o || {};
  this.h = h; this.o = o; this.id = 'hvc' + (++NUM);
  /* (o.K : le contexte du pantin du donjon — ses couleurs du moment, la couleur des fioles que l'Alchimiste prépare…) */
  this.K = o.K || HV.contexte(this.id, h);
  this.cap = o.cap == null ? 55 : o.cap;
  this.res = o.res || 2;
  var vb = (o.cadre || '0 0 300 440').split(/[ ,]+/).map(Number);
  this.vb = vb;
  this.racine = document.createElement('div');
  this.racine.className = 'hvc';
  this.racine.style.cssText = 'position:absolute;inset:0;overflow:visible;pointer-events:none';
  /* fig : le repère du dessin (1 px = 1 unité) ; corps : décalé de 150 comme dans HV.dessin (et l'échelle des enfants, des anciens) */
  this.fig = document.createElement('div');
  this.fig.style.cssText = 'position:absolute;left:0;top:0;width:' + vb[2] + 'px;height:' + vb[3] + 'px;transform-origin:0 0';
  this.corps = document.createElement('div');
  var e = this.K.echelle || 1, SOL = HV.SOL;
  this.corps.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;transform:translate(' + (-vb[0]) + 'px,' + (-vb[1]) + 'px) ' +
    (e !== 1 ? 'translate(150px,' + SOL + 'px) scale(' + e + ') translate(-150px,' + (-SOL) + 'px) ' : '') + 'translate(150px,0px)';
  this.fig.appendChild(this.corps); this.racine.appendChild(this.fig);
  hote.appendChild(this.racine);
  this.hote = hote;
  /* (les variantes sont gardées pour toute la partie, pour ce héros avec cette allure : d'un combat à l'autre, rien n'est à recuire) */
  var ch = JSON.stringify(h) + '|' + this.res;
  this.variantes = (CU.cache[ch] = CU.cache[ch] || {});          /* nom → clé → variante {cv, x, y, w, h, A0, th0, L0, tete:{…}} */
  this.inst = {};               /* nom + '|' + clé + '|' + couche → {el, v} */
  this.anims = [];
  this.ajuster();
}
var CP = Cuit.prototype;
CU.monter = function(hote, h, o){ return new Cuit(hote, h, o); };
/* l'hôte a changé de taille : le repère du dessin suit (comme la viewBox du pantin, xMidYMid meet) */
CP.ajuster = function(){
  var W = this.hote.clientWidth || this.vb[2], H = this.hote.clientHeight || this.vb[3], k = Math.min(W / this.vb[2], H / this.vb[3]);
  var dx = (W - this.vb[2] * k) / 2, dy = (H - this.vb[3] * k) / 2;
  this.fig.style.transform = 'translate(' + f2(dx) + 'px,' + f2(dy) + 'px) scale(' + f2(k * 1000) / 1000 + ')';
  this.k = k;
};
CP.poseComplete = function(P){ var B = HV.POSES.repos, R = {}, k; for(k in B) R[k] = B[k]; for(k in P) R[k] = P[k]; R.cap = this.cap; if(R.yo == null) R.yo = 1; return R; };
CP.vue = function(P){ return U.vue(HV.capDe(P)); };
CP.squelette = function(P){ return HV.squelette(this.K, this.h, this.vue(P), P); };

/* ---------- cuire les morceaux d'une pose : ceux qui manquent ---------- */
CP.manquants = function(P, S){
  var me = this, L = [];
  Object.keys(MORCEAUX).forEach(function(nom){
    if(nom === 'carquois' && !(me.h.role === 'pisteur' || !me.h.role)) return;
    if(nom === 'robe' && !me.K.robe) return;
    var c = cleDe(nom, P, S, me.K);
    if(c != null && (!me.variantes[nom] || !me.variantes[nom][c])) L.push([nom, c]);
  });
  return L;
};
/* (ce qui manque pour cette pose, sans rien cuire : le plan d'un geste s'en sert pour savoir ce qu'il reste à préparer) */
CP.aCuire = function(P0){ var P = this.poseComplete(P0); return this.manquants(P, this.squelette(P)).length; };
var DE_LA_TETE = {tete:1, cheveuxDos:1, cou:1};
CP.preparer = function(P0){
  var me = this, P = this.poseComplete(P0), S = this.squelette(P), L = this.manquants(P, S);
  if(!L.length) return Promise.resolve();
  var K = this.K, h = this.h, V = this.vue(P), corps = L.some(function(x){ return !DE_LA_TETE[x[0]]; }), tete = L.some(function(x){ return DE_LA_TETE[x[0]]; });
  /* (le dessin du corps seulement s'il en manque un morceau : la tête seule se dessine bien plus vite) */
  var M = corps ? HV.morceaux(K, h, V, P) : null, tp = S.tete, dessins = {}, defsT = '', defsC = '';
  if(M){
    var ar = M.bras.G;
    dessins = {brasHautG:M.bras.G.haut, brasHautGa:M.bras.G.hautDevant, brasHautDa:M.bras.D.hautDevant, brasBasG:M.bras.G.bas, mainG:M.bras.G.main, brasHautD:M.bras.D.haut, brasBasD:M.bras.D.bas, mainD:M.bras.D.main,
      cuisseG:M.jambes.G.cuisse, botteG:M.jambes.G.botte, cuisseD:M.jambes.D.cuisse, botteD:M.jambes.D.botte,
      buste:M.buste, carquois:M.carquois, robe:M.robe || '', arc:ar.arc || '', cordeH:ar.cordeH || '', cordeB:ar.cordeB || '', fleche:ar.fleche || '',
      baton:ar.baton || '', louche:ar.louche || ''};
    /* (les dégradés, les caches : ceux de tous les morceaux du corps, disponibles pour chacun — dans un <defs>, rien n'y est dessiné) */
    defsC = '<defs>' + Object.keys(dessins).map(function(n){ return dessins[n]; }).join('') + '</defs>';
  }
  if(tete){
    /* la tête et les cheveux (comme HV.dessin) */
    var coif = HV.COIFFURES[h.coiffure] || HV.COIFFURES.queue, Vt = tp.V, P2 = {}, k;
    for(k in P) P2[k] = P[k];
    P2.hocheF = tp.hocheF; P2.qx = P.qx || 0; P2.qz = P.qz || 0;
    var CH = HV.cheveux(K, coif, Vt, P2), T = HV.tete(K, h, Vt, P2, CH), tDos = Vt.c < -0.15;
    var tT = 'translate(' + U.f1(tp.tx) + ' ' + U.f1(tp.ty) + ')' + (tp.rot ? ' rotate(' + U.f1(tp.rot) + ' ' + U.f1(tp.px) + ' 28)' : '') +
      (K.teteK !== 1 ? ' translate(' + U.f1(tp.px) + ' 28) scale(' + K.teteK + ') translate(' + U.f1(-tp.px) + ' -28)' : '');
    var ombreCou = '<path d="' + T.peau + '" transform="translate(1.2 7.5) ' + tT + '" fill="' + K.peau.ombre + '" opacity=".8"/>';
    var nuque = '<g transform="' + tT + '"><rect x="-30" y="12" width="60" height="13" fill="' + K.peau.ombre + '" opacity=".75"/></g>';
    dessins.cheveuxDos = (CH.queueDevant ? '' : CH.queue) + (tDos ? '' : CH.dos);
    dessins.tete = (tDos ? T.svg + CH.dos + CH.devant : T.svg + CH.devant + T.sourcils) + (CH.queueDevant ? CH.queue : '');
    if(L.some(function(x){ return x[0] === 'cou'; })) dessins.cou = (M || HV.morceaux(K, h, V, P)).cou(tDos, tDos ? nuque : ombreCou);
    defsT = '<defs>' + dessins.cheveuxDos + dessins.tete + '</defs>';
  }
  var base = HV.defs(K);
  var travail = L.map(function(x){
    var nom = x[0], cle = x[1], d = (/^brasHaut/.test(nom) && /a$/.test(cle) && dessins[nom + 'a']) || dessins[nom], tete = MORCEAUX[nom].type === 'tete';
    if(!d) return Promise.resolve(me.garder(nom, cle, {vide:true}));
    var defs = base + (DE_LA_TETE[nom] ? defsT : defsC);
    var b = boite('', d);
    if(!b) return Promise.resolve(me.garder(nom, cle, {vide:true}));
    var r = me.res, W = Math.ceil(b.w * r), H = Math.ceil(b.h * r);
    var txt = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="' + [b.x, b.y, b.w, b.h].map(U.f1).join(' ') + '">' + defs + d + '</svg>';
    return toile(txt, W, H).then(function(cv){
      var v = {cv:cv, x:b.x, y:b.y, w:b.w, h:b.h};
      if(tete){ v.tete = {tx:tp.tx, ty:tp.ty, px:tp.px, rot:tp.rot, k:K.teteK || 1}; }
      else { var ab = MORCEAUX[nom].os(S); v.A0 = ab[0]; v.B0 = ab[1]; v.th0 = ang(ab[0], ab[1]); v.L0 = dist(ab[0], ab[1]); }
      return me.garder(nom, cle, v);
    });
  });
  return Promise.all(travail);
};
CP.garder = function(nom, cle, v){ (this.variantes[nom] = this.variantes[nom] || {})[cle] = v; this.nVariantes = (this.nVariantes || 0) + 1; return v; };
/* la variante la plus proche quand celle qu'il faut n'est pas encore cuite : la même vue d'abord, sinon LA VUE LA PLUS PROCHE
   (24 novembre — Romain, 9 h 52 : « quand ils tournent sur eux-mêmes […] ils tournent que les jambes et la tête et pas le corps » :
   avant, à défaut de la même vue, on prenait la première variante cuite — le buste de face — pendant tout le tour) */
function vueDeCle(c){ var m = /v(-?\d+)/.exec(c) || /^[a-z]+(-?\d+)/i.exec(c); return m ? +m[1] : null; }
CP.variante = function(nom, cle){
  var t = this.variantes[nom]; if(!t) return null;
  if(t[cle]) return {cle:cle, v:t[cle]};
  var ks = Object.keys(t), vue = cle.split(/[a-z]+/i)[1], i;
  for(i = 0; i < ks.length; i++) if(ks[i].split(/[a-z]+/i)[1] === vue) return {cle:ks[i], v:t[ks[i]]};
  var a = vueDeCle(cle), meilleur = null, ecart = 1e9;
  if(a != null) for(i = 0; i < ks.length; i++){
    var b = vueDeCle(ks[i]); if(b == null) continue;
    var d = Math.abs(tour(b - a)) + (ks[i].replace(/-?\d+/g, '') === cle.replace(/-?\d+/g, '') ? 0 : 0.5);
    if(d < ecart){ ecart = d; meilleur = ks[i]; }
  }
  if(meilleur) return {cle:meilleur, v:t[meilleur]};
  return ks.length ? {cle:ks[0], v:t[ks[0]]} : null;
};

/* ---------- un exemplaire d'une variante dans une couche ---------- */
CP.exemplaire = function(nom, cle, couche){
  var id = nom + '|' + cle + '|' + couche, x = this.inst[id];
  if(x) return x;
  var v = this.variantes[nom][cle], el = document.createElement('div');
  el.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;opacity:0;will-change:transform,opacity;z-index:' + (Z[couche] * 10 + rangDe(nom)) +
    ';transform-origin:' + f2(v.tete ? v.tete.px : v.A0[0]) + 'px ' + f2(v.tete ? 28 : v.A0[1]) + 'px';
  if(v.cv){
    var cv = v.cv;
    if(cv._place){ var c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; c2.getContext('2d').drawImage(cv, 0, 0); cv = c2; }
    cv._place = true;
    cv.style.cssText = 'position:absolute;left:' + f2(v.x) + 'px;top:' + f2(v.y) + 'px;width:' + f2(v.w) + 'px;height:' + f2(v.h) + 'px';
    el.appendChild(cv);
  }
  this.corps.appendChild(el);
  return (this.inst[id] = {el:el, v:v, nom:nom, cle:cle, couche:couche});
};
/* où va le morceau (variante v) pour ces os : « translate rotate scale rotate », autour de son point d'attache */
function placer(v, nom, S, P, ref){
  if(v.tete){
    /* (la tête est dessinée dans son propre repère : HV.dessin la pose avec translate(tx, ty) rotate(rot, px, 28) scale(teteK)) */
    var t = S.tete, kt = v.tete.k || 1;
    return {x:t.tx, y:t.ty, a:pres(t.rot, ref), sx:kt, sy:kt, b:0};
  }
  var ab; try{ ab = MORCEAUX[nom].os(S); }catch(e){ ab = null; }
  if(!ab || !ab[0] || !ab[1]) return null;          /* (ce morceau n'existe pas à cet instant : l'arc rangé, pas de flèche) */
  var A = ab[0], B = ab[1], L = dist(A, B);
  var s = MORCEAUX[nom].raide || v.L0 < 3 ? 1 : Math.max(0.4, Math.min(1.5, L / v.L0)), th = L > 0.5 ? ang(A, B) : v.th0;
  return {x:A[0] - v.A0[0], y:A[1] - v.A0[1], a:pres(th, ref), sx:s, sy:1, b:-v.th0};
}
function css(p, lv){ return 'translate(' + f2(p.x) + 'px,' + f2(p.y - lv) + 'px) rotate(' + f2(p.a) + 'deg) scale(' + f2(p.sx * 1000) / 1000 + ',' + f2(p.sy * 1000) / 1000 + ') rotate(' + f2(p.b) + 'deg)'; }

/* les images clés à garder pour un morceau : RDP sur (x, y, angle, échelle), les bords des moments où il se voit */
function simplifier(pls, plan){
  var n = pls.length, k = new Array(n), i;
  function ecart(i, a, b){
    var u = (plan[i].t - plan[a].t) / ((plan[b].t - plan[a].t) || 1), A = pls[a], B = pls[b], P = pls[i];
    function m(v){ return A[v] + (B[v] - A[v]) * u; }
    return Math.max(Math.abs(P.x - m('x')) / 0.25, Math.abs(P.y - P.lv - (m('y') - (A.lv + (B.lv - A.lv) * u))) / 0.25, Math.abs(P.a - m('a')) / 0.5,
      Math.abs(P.sx - m('sx')) / 0.01, Math.abs(P.sy - m('sy')) / 0.01);
  }
  function rdp(a, b){
    if(b - a < 2) return;
    var best = -1, bi = -1;
    for(var j = a + 1; j < b; j++){ var e = ecart(j, a, b); if(e > best){ best = e; bi = j; } }
    if(best > 1){ k[bi] = true; rdp(a, bi); rdp(bi, b); }
  }
  k[0] = k[n - 1] = true;
  /* (les bords de ce qui se voit : on y garde les images, et on simplifie chaque morceau visible à part) */
  for(i = 1; i < n; i++) if(pls[i].vis !== pls[i - 1].vis){ k[i] = k[i - 1] = true; }
  var debut = -1;
  for(i = 0; i < n; i++){
    if(pls[i].vis && debut < 0) debut = i;
    if((!pls[i].vis || i === n - 1) && debut >= 0){ rdp(debut, pls[i].vis ? i : i - 1); debut = -1; }
  }
  var L = []; for(i = 0; i < n; i++) if(k[i]) L.push(i);
  return L;
}
/* ---------- jouer des images : [{t, P}] (t en secondes, croissant) ----------
   o.boucle : sans fin ; o.debut : l'instant (performance.now) où la première image doit être montrée */
CP.jouer = function(images, o){
  o = o || {};
  var me = this, n = images.length, D = Math.max(0.001, images[n - 1].t);
  this.arreter();
  marquer(images);
  /* 1) les os et les morceaux voulus à chaque image */
  /* (o.cle : un plan déjà fait pour ces mêmes images — la petite vie de la garde, la course — tant que rien n'a été cuit depuis) */
  this._plans = this._plans || {};
  var cache = o.cle && this._plans[o.cle], nv = this.nVariantes || 0;
  var plan = cache && cache.nv === nv ? cache.plan : images.map(function(im){
    var P = me.poseComplete(im.P), S = me.squelette(P), lv = Math.max(0, P.leve || 0), choix = {};
    Object.keys(MORCEAUX).forEach(function(nom){
      if(!me.variantes[nom]) return;
      var c0 = cleDe(nom, P, S, me.K); if(c0 == null) return;
      var c = me.variante(nom, c0); if(!c || c.v.vide) return;
      var couche = Z[nom] != null ? nom : null;
      if(/^(brasHaut|brasBas|main)/.test(nom)) couche = coucheBras(S, nom.slice(-1), P);
      else if(MORCEAUX[nom].bras) couche = coucheBras(S, MORCEAUX[nom].bras, P);
      else if(/^(cuisse|botte)/.test(nom)){ var cl = nom.slice(-1), autre = cl === 'G' ? 'D' : 'G'; couche = S.jambes[cl].fond <= S.jambes[autre].fond ? 'jambeLoin' : 'jambePres'; }
      /* (vu de dos, le carquois passe devant le buste) */
      else if(nom === 'carquois' && S.dos) couche = 'carquoisDevant';
      choix[nom] = {cle:c.cle, couche:couche};
    });
    return {t:im.t, P:P, S:S, lv:lv, choix:choix};
  });
  if(o.cle) this._plans[o.cle] = {plan:plan, nv:nv};
  this.plan = plan; this.D = D;
  /* 2) les exemplaires qui servent, et leurs images clés */
  var util = {};
  plan.forEach(function(p){ Object.keys(p.choix).forEach(function(nom){ var c = p.choix[nom]; util[nom + '|' + c.cle + '|' + c.couche] = [nom, c.cle, c.couche]; }); });
  var t0 = o.debut || performance.now(), dureeMs = D * 1000;
  /* (les exemplaires d'avant qui ne servent plus : cachés) */
  /* (24 novembre : et sortis de l'affichage — chacun a sa propre couche pour la carte graphique ; au bout de quelques combats, des
     centaines de couches cachées restaient en mémoire. Romain : le jeu « quitte » sur iPhone à l'ossuaire et chez Léo) */
  Object.keys(this.inst).forEach(function(id){ if(!util[id]){ var e = me.inst[id].el; e.style.opacity = 0; e.style.display = 'none'; } });
  Object.keys(util).forEach(function(id){
    var u = util[id], x = me.exemplaire(u[0], u[1], u[2]), ref = null, dernier = null;
    if(x.el.style.display) x.el.style.display = '';
    var pls = plan.map(function(p){
      var pl = placer(x.v, u[0], p.S, p.P, ref) || dernier || {x:0, y:0, a:0, sx:1, sy:1, b:0}; ref = pl.a; dernier = pl;
      pl.lv = p.lv; pl.vis = !!(p.choix[u[0]] && p.choix[u[0]].cle === u[1] && p.choix[u[0]].couche === u[2]);
      return pl;
    });
    /* MOINS D'IMAGES CLÉS (24 novembre, la vitesse : 76 images × 60 morceaux, c'était un tiers de seconde de travail au début de
       chaque geste sur une tablette lente) : on ne garde, pour chaque morceau, que les images où il ne va pas en ligne droite
       (Ramer-Douglas-Peucker, à un quart d'unité et un demi-degré près), celles où il apparaît ou disparaît, et rien quand il est
       caché. */
    var garde = simplifier(pls, plan);
    var tr = [], op = [], n0 = 0, toujours = pls.every(function(pl){ return pl.vis; });
    garde.forEach(function(i){ tr.push({offset:Math.min(1, plan[i].t / D), transform:css(pls[i], pls[i].lv)}); });
    if(!toujours){
      pls.forEach(function(pl, i){ if(i === 0 || pl.vis !== pls[i - 1].vis) op.push({offset:Math.min(1, plan[i].t / D), opacity:pl.vis ? 1 : 0, easing:'steps(1, end)'}); n0++; });
      if(op[op.length - 1].offset < 1) op.push({offset:1, opacity:pls[pls.length - 1].vis ? 1 : 0});
    }
    var opt = {duration:dureeMs, iterations:o.boucle ? Infinity : 1, fill:'both', easing:'linear'};
    if(tr.length < 2) tr.push({offset:1, transform:tr[0].transform});
    var a1 = x.el.animate(tr, opt); a1.startTime = t0; me.anims.push(a1);
    if(toujours) x.el.style.opacity = 1;
    else { x.el.style.opacity = 0; var a2 = x.el.animate(op, opt); a2.startTime = t0; me.anims.push(a2); }
  });
  this.t0 = t0;
  return new Promise(function(ok){ if(o.boucle) return ok(); setTimeout(ok, Math.max(0, t0 + dureeMs - performance.now())); });
};
/* une pose fixe (sans animation) */
CP.figer = function(P){ return this.jouer([{t:0, P:P}, {t:0.001, P:P}]); };
CP.arreter = function(){
  this.anims.forEach(function(a){ try{ a.commitStyles && a.effect && a.effect.target.isConnected && a.commitStyles(); }catch(e){} try{ a.cancel(); }catch(e){} });
  this.anims = [];
};
/* les os à l'instant t (secondes depuis le début du geste en cours) : pour poser les effets (la lame, la flèche…) */
CP.os = function(t){
  var p = this.plan; if(!p || !p.length) return null;
  if(t == null) t = (performance.now() - this.t0) / 1000;
  if(this.D) t = Math.max(0, Math.min(this.D, t));
  var i = 0; while(i < p.length - 1 && p[i + 1].t <= t) i++;
  return p[i];
};
/* ---------- L'ANNEAU DORÉ de celui dont c'est le tour : ses deux moitiés (l'arrière derrière les bottes, l'avant devant), dessinées
   une fois sous les pieds de la garde ; il apparaît / disparaît en fondu, et palpite doucement (tout par la carte graphique) ---------- */
var CSS_FAIT = false;
function cssCuit(){
  if(CSS_FAIT || !document.head) return; CSS_FAIT = true;
  var s = document.createElement('style');
  s.textContent = '.hvc-anneau{transition:opacity .35s ease;opacity:0}.hvc-anneau.on{opacity:1}' +
    '.hvc-anneau>canvas{animation:hvcPalpite 1.9s ease-in-out infinite}@keyframes hvcPalpite{0%,100%{opacity:1}50%{opacity:.72}}';
  document.head.appendChild(s);
}
CP.anneau = function(on){
  var me = this;
  cssCuit();
  this.anneauOn = !!on;
  if(!this._anneau){
    if(!this.anneauP) return;
    this._anneau = [];
    var P = this.poseComplete(this.anneauP), V = this.vue(P), M = HV.morceaux(this.K, this.h, V, P), om = M.ombre, rxA = Math.max(86, om.rx * 1.35);
    var A = HV._anneau({anneau:1, anneauT:0}, om.cx, om.cy, rxA);
    [['der', A.der, 5], ['dev', A.dev, 12]].forEach(function(x){
      var b = {x:om.cx - rxA - 30, y:om.cy - rxA * 0.24 - 60, w:rxA * 2 + 60, h:rxA * 0.48 + 80}, r = me.res, W = Math.ceil(b.w * r), H = Math.ceil(b.h * r);
      var el = document.createElement('div');
      el.className = 'hvc-anneau'; el.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:' + (x[2] * 10);
      me.corps.appendChild(el); me._anneau.push(el);
      toile('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="' + [b.x, b.y, b.w, b.h].map(U.f1).join(' ') + '">' + x[1] + '</svg>', W, H).then(function(cv){
        if(!cv) return;
        cv.style.cssText = 'position:absolute;left:' + f2(b.x) + 'px;top:' + f2(b.y) + 'px;width:' + f2(b.w) + 'px;height:' + f2(b.h) + 'px';
        el.appendChild(cv);
      });
    });
  }
  this._anneau.forEach(function(el){ el.classList.toggle('on', me.anneauOn); });
};
/* ---------- SA PETITE VIE, en boucle (7,2 s) : elle respire, passe son poids d'un pied sur l'autre, bouge un peu la tête, cligne des
   yeux deux fois — comme le pantin (hv-pantin.js, PP.dessiner), mais calculée une fois et jouée par la carte graphique ---------- */
var VIE = 7.2;
CU.vie = function(P0, t){
  var TAU = Math.PI * 2, P = {}, k;
  for(k in P0) P[k] = P0[k];
  var re = Math.sin(TAU * t / 3.6), ps = Math.sin(TAU * t / VIE);
  P.souffle = 0.5 + 0.5 * re;
  P.pen = (P.pen || 0) + 1.1 * Math.sin(TAU * t / 3.6 + 1); P.tete = (P.tete || 0) + 2.6 * Math.sin(TAU * t / VIE);
  var b = P.bas || [0, 0, 0], ba = P.bang || [0, 0, 0];
  P.bas = [b[0] + 2.2 * ps, b[1] + 0.6 * Math.abs(ps), b[2]]; P.bang = [ba[0], ba[1] - 1.6 * ps, ba[2] + 1.4 * ps];
  var rG = P.relG == null ? 1 : P.relG, rD = P.relD == null ? 1 : P.relD, mG = P.mainG || [-56, 243, 6], mD = P.mainD || [50.5, 243, 4];
  P.mainG = [mG[0] - 0.7 * re * rG, mG[1] + 0.3 * re * rG, mG[2] + 1.2 * Math.sin(TAU * t / 3.6) * rG];
  P.mainD = [mD[0] + 0.7 * re * rD, mD[1] + 0.3 * re * rD, mD[2] - 1.2 * Math.sin(TAU * t / 3.6) * rD];
  /* (deux clignements : à 2,1 s et à 5,4 s) */
  P.yo = (t > 2.1 && t < 2.27) || (t > 5.4 && t < 5.57) ? 0 : 1;
  return P;
};
CP.imagesVie = function(P0){
  var L = [], n = Math.round(VIE * 12), i;
  for(i = 0; i <= n; i++){ var t = VIE * i / n; L.push({t:t, P:CU.vie(P0, t)}); }
  /* (les clignements : des images juste au bord, pour qu'ils durent ce qu'il faut) */
  [2.1, 2.27, 5.4, 5.57].forEach(function(t){ L.push({t:t + 0.001, P:CU.vie(P0, t + 0.001)}); });
  L.sort(function(a, b){ return a.t - b.t; });
  return L;
};
/* ---------- CUIRE D'AVANCE les morceaux d'un geste (images = [{t, P}]) : un morceau à la fois, en laissant la page respirer entre
   deux ; libre() dit si on peut travailler maintenant (pas pendant un geste) → promesse ---------- */
CP.cuireImages = function(images, libre, pause){
  /* (pause : le repos entre deux dessins, en ms — 16 d'habitude ; plus long quand chaque image compte : Léo, en temps réel) */
  var me = this, i = 0, P0 = pause || 16;
  marquer(images);
  return new Promise(function(fini){
    (function suite(){
      if(me.mort) return fini();
      if(libre && !libre()) return setTimeout(suite, 400);
      var n0 = performance.now();
      /* (on avance jusqu'à la prochaine image qui a quelque chose à cuire) */
      while(i < images.length && !me.aCuire(images[i].P)){ i++; if(performance.now() - n0 > 8) return setTimeout(suite, 0); }
      if(i >= images.length) return fini();
      me.preparer(images[i++].P).then(function(){ setTimeout(suite, P0); }, function(){ setTimeout(suite, P0); });
    })();
  });
};
CP.detruire = function(){ this.arreter(); this.mort = true; this.racine.remove(); this.inst = {}; };
CU.MORCEAUX = MORCEAUX; CU.cleDe = cleDe;
})(window);
