/* ==========================================================
   Les héros « en volume » — 5 sur 5 : LE PANTIN (ce qui assemble le dessin, et ce qui le fait vivre).
   HV.dessin(h, P, o) → le dessin (du SVG) du héros h dans la pose P, pour un cadre 300 × 440 :
     P.cap : vers où le corps est tourné (0 de face, 90 à droite, -90 à gauche) ; P.tete : la tête en plus, par rapport au buste ;
     P.pen : elle penche la tête ; P.hoche : elle la baisse ; P.rx, P.ry : le regard ; P.yo : les yeux ouverts ; P.souffle ;
     P.qx, P.qz : la queue de cheval ; et tout ce que dit une pose (HV.POSES, plus bas).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, RAD = HV.RAD, f1 = U.f1;

HV.dessin = function(h, P, o){
  o = o || {}; P = P || {};
  var B0 = HV.POSES.repos, P2 = {}, kk;
  for(kk in B0) P2[kk] = B0[kk];
  for(kk in P) P2[kk] = P[kk];
  P = P2;
  /* (P.tourne : elle se tourne d'elle-même, en plus de l'angle où on la regarde — un geste « elle regarde à droite ») */
  var K = o.K || HV.contexte(o.id || 'hv', h), Vb = U.vue(HV.capDe(P));
  /* (les anciens : le haut du dos un peu voûté, en plus de la pose — K.voute, hv-corps.js GABARITS) */
  if(K.voute){ var d0 = P.dos || [0, 0, 0]; P.dos = [d0[0] + K.voute, d0[1], d0[2]]; }
  var C = HV.corps(K, h, Vb, P), tp = C.tete, Vt = tp.V;
  /* la tête : au bout du cou (hv-corps.js). Quand elle baisse la tête, vue de profil la tête penche vers l'avant ; vue de face,
     ce sont les traits du visage et la frange qui descendent. La queue de cheval, elle, continue de pendre vers le bas. */
  var rot = tp.rot, pend = Math.tan(Math.max(-0.9, Math.min(0.9, rot * RAD))) * 100 * (1 - Math.max(0, Math.min(1, P.couche || 0)));
  P.hocheF = tp.hocheF; P.qx = (P.qx || 0) + pend * Vt.c; P.qz = (P.qz || 0) + pend * Vt.s;
  var coif = HV.COIFFURES[h.coiffure] || HV.COIFFURES.queue;
  var CH = HV.cheveux(K, coif, Vt, P), T = HV.tete(K, h, Vt, P, CH);
  var tT = 'translate(' + f1(tp.tx + (P.tx || 0)) + ' ' + f1(tp.ty + (P.ty || 0)) + ')' + (rot ? ' rotate(' + f1(rot) + ' ' + f1(tp.px) + ' 28)' : '') +
    /* (l'enfant : la tête un peu plus grosse pour son corps, grandie depuis le cou — K.teteK) */
    (K.teteK !== 1 ? ' translate(' + f1(tp.px) + ' 28) scale(' + K.teteK + ') translate(' + f1(-tp.px) + ' -28)' : '');
  var ombreCou = '<path d="' + T.peau + '" transform="translate(1.2 7.5) ' + tT + '" fill="' + K.peau.ombre + '" opacity=".8"/>';
  var om = C.ombre, lv = Math.max(0, P.leve || 0), ko = 1 / (1 + lv / 90);
  var s = '<ellipse cx="' + f1(150 + om.cx) + '" cy="' + f1(om.cy) + '" rx="' + f1(om.rx * ko) + '" ry="' + f1(7 * ko) + '" fill="' + K.u('ombre') + '"' + (lv ? ' opacity="' + f1(ko) + '"' : '') + '/>';
  /* (la moitié de devant est dessinée dans le groupe du corps, décalé de 150 et levé de lv : on la décale d'autant) */
  var rxA = Math.max(86, om.rx * 1.35), AN = {der:anneau(P, 150 + om.cx, om.cy, rxA).der, dev:anneau(P, om.cx, om.cy + lv, rxA).dev};
  s += AN.der;
  /* l'ordre des morceaux : la tête vue de face (les cheveux de derrière d'abord, le visage à la fin) ou de dos (le visage d'abord,
     puis le cou, puis les cheveux par-dessus) ; la queue de cheval passe devant tout quand elle est de notre côté */
  var tDos = Vt.c < -0.15, G1 = '<g transform="' + tT + '">', dessus = C.dessus, bras = dessus ? '' : C.devant;
  var nuque = '<g transform="' + tT + '"><rect x="-30" y="12" width="60" height="13" fill="' + K.peau.ombre + '" opacity=".75"/></g>';
  var visage = G1 + (tDos ? CH.dos + CH.devant : T.svg + CH.devant + T.sourcils) + (CH.queueDevant ? CH.queue : '') + '</g>';
  /* (penchée loin de nous, vue de dos : la tête est derrière les épaules) */
  var loin = tp.fond < -22;
  s += '<g transform="translate(150 ' + f1(-lv) + ')">' + G1 + (CH.queueDevant ? '' : CH.queue) + (tDos ? '' : CH.dos) + '</g>' + C.derriere + C.jambes +
    (tDos ? G1 + T.svg + '</g>' : '') + (loin ? visage : '') + C.cou(tDos, tDos ? nuque : ombreCou) + C.torse + C.carquoisDevant + C.jambesApres + AN.dev + bras +
    (loin ? '' : visage) + (dessus ? C.devant : '') + '</g>';
  /* (l'enfant, les anciens : tout le héros plus petit, posé sur le sol au milieu — K.echelle ; HV.os en tient compte) */
  if(K.echelle !== 1) s = '<g transform="translate(150 ' + HV.SOL + ') scale(' + K.echelle + ') translate(-150 ' + (-HV.SOL) + ')">' + s + '</g>';
  return s;
};
/* L'ANNEAU DE CELUI DONT C'EST LE TOUR (Romain, 23 novembre, 18 h 51 : « le cercle est censé passer derrière les jambes […] le devant,
   il passe devant les bottes et l'arrière du cercle, il passe derrière les bottes […] un joli effet ») : un anneau doré posé au sol,
   en deux moitiés — celle du fond est dessinée avant elle, celle de devant après ses bottes — avec sa lueur, un reflet qui tourne,
   et de petites étincelles qui montent (celles du fond derrière elle, celles de devant devant).
   P.anneau : de 0 à 1 (il apparaît) ; P.anneauT : le temps (pour qu'il vive). → {der, dev} */
function anneau(P, cx, cy, rx){
  var a = Math.max(0, Math.min(1, P.anneau || 0)), t = P.anneauT || 0;
  if(a < 0.01) return {der:'', dev:''};
  var ry = rx * 0.24, k = 0.86 + 0.14 * a, R = rx * k, Ry = ry * k, pul = 0.85 + 0.15 * Math.sin(t * 3.2);
  function arc(haut){ return 'M' + f1(cx - R) + ' ' + f1(cy) + ' A' + f1(R) + ' ' + f1(Ry) + ' 0 0 ' + (haut ? 1 : 0) + ' ' + f1(cx + R) + ' ' + f1(cy); }
  function moitie(haut){
    var d = arc(haut), o = a * (haut ? 0.75 : 1), s = '';
    /* (la lueur, l'anneau, son bord clair, le reflet qui tourne) */
    s += '<path d="' + d + '" fill="none" stroke="#ffcf3a" stroke-width="16" stroke-linecap="round" opacity="' + f1(0.18 * o * pul) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#ffd84a" stroke-width="8" stroke-linecap="round" opacity="' + f1(0.35 * o * pul) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#7a4a10" stroke-width="6.4" stroke-linecap="round" opacity="' + f1(0.9 * o) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#ffd23f" stroke-width="3.6" stroke-linecap="round" opacity="' + f1(o) + '"/>';
    s += '<path d="' + d + '" fill="none" stroke="#fff6c8" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="14 26" stroke-dashoffset="' + f1((haut ? 1 : -1) * t * 40) + '" opacity="' + f1(0.9 * o) + '"/>';
    /* (les étincelles qui montent) */
    for(var i = 0; i < 8; i++){
      var th = i / 8 * Math.PI * 2 + t * 0.6, sy = Math.sin(th);
      if((sy < 0) !== haut) continue;
      var u = (t * 0.7 + i * 0.37) % 1, x = cx + R * Math.cos(th), y = cy + Ry * sy - 46 * u, r = 3.4 * (1 - u * 0.6), op = a * Math.sin(Math.PI * u) * (haut ? 0.7 : 1);
      s += '<path d="M' + f1(x) + ' ' + f1(y - r * 1.8) + ' L' + f1(x + r * 0.5) + ' ' + f1(y - r * 0.5) + ' L' + f1(x + r * 1.8) + ' ' + f1(y) + ' L' + f1(x + r * 0.5) + ' ' + f1(y + r * 0.5) +
        ' L' + f1(x) + ' ' + f1(y + r * 1.8) + ' L' + f1(x - r * 0.5) + ' ' + f1(y + r * 0.5) + ' L' + f1(x - r * 1.8) + ' ' + f1(y) + ' L' + f1(x - r * 0.5) + ' ' + f1(y - r * 0.5) + ' Z" fill="#fff2a8" opacity="' + f1(op) + '"/>';
    }
    return s;
  }
  return {der:moitie(true), dev:moitie(false)};
}
/* les os d'une pose (où sont le bassin, les genoux, les mains…), dans les mesures du héros : pour vérifier une pose, poser un objet */
HV.os = function(h, P){
  var B0 = HV.POSES.repos, P2 = {}, kk;
  for(kk in B0) P2[kk] = B0[kk];
  for(kk in P) P2[kk] = P[kk];
  var K = HV.contexte('os', h);
  if(K.voute){ var d0 = P2.dos || [0, 0, 0]; P2.dos = [d0[0] + K.voute, d0[1], d0[2]]; }
  var os = HV.corps(K, h, U.vue(HV.capDe(P2)), P2).os, e = K.echelle;
  /* (l'enfant, les anciens : le héros est dessiné plus petit, posé sur le sol — ses os aussi : x et z depuis le milieu, y depuis le sol) */
  if(e !== 1) for(kk in os) os[kk] = [os[kk][0] * e, HV.SOL + (os[kk][1] - HV.SOL) * e, os[kk][2] * e];
  return os;
};
/* vers où le corps est vraiment tourné : l'angle où on la regarde (cap), sauf pendant un geste qui la tourne vers un angle précis
   (capA, avec le poids capW : pour tirer, elle se met de côté par rapport à sa cible), plus ce qu'elle tourne d'elle-même (tourne) */
HV.capDe = function(P){
  var c = P.cap || 0, w = P.capW || 0;
  if(w > 0){ var d = ((P.capA || 0) - c) % 360; d = (d + 540) % 360 - 180; c += d * w; }
  return c + (P.tourne || 0);
};

/* ==========================================================
   LES POSES. Une pose ne dit que ce qui change par rapport à « repos » ; « repos » donne TOUTES les clés (on glisse de l'une
   à l'autre en mélangeant les nombres). Les mesures : x > 0 vers SA gauche, y vers le bas (le sol : 414), z vers l'avant.
   - mainG : SON bras droit (à gauche de l'écran quand elle est de face), celui qui tient l'arc ; mainD : SON bras gauche.
     Le poignet. relG / relD : 1, la main suit le buste (mesures du héros debout) ; 0, elle est exactement là (au sol, sur un genou).
     coudeG / coudeD : de quel côté va le coude. mdirG / mdirD : vers où pointent les doigts ([0, 0, 0] : comme l'avant-bras).
     pouceG / pouceD : de quel côté est le pouce. poingG / poingD : 0 ouverte … 1 fermée. indexG / indexD : 1, l'index reste tendu.
   - piedG / piedD : la cheville. genouG / genouD : de quel côté va le genou. ouvG / ouvD : le pied tourné en dehors.
     pointeG / pointeD (degrés) : 0 à plat, 50 sur la pointe, 90 les orteils repliés (un genou à terre).
     lacetG / lacetD (degrés) : le pied pivote sur place (> 0 : vers SA gauche), comme quand on se tourne sans lever le pied.
   - bas [x, y, z] : le bassin se déplace (y > 0 : il descend). bang [avant, côté, vrille] : le bassin penche (degrés).
     dos [avant, côté, vrille] : le dos se courbe de la taille aux épaules.
   - tete : elle tourne la tête ; pen : elle la penche sur le côté ; hoche : elle la baisse (> 0) ou lève le nez.
   - arcAxe : dans quel sens est tenu l'arc (debout : [0, 1, 0]) ; arcDir : de quel côté est son ventre (la corde est à l'opposé) ;
     tendu ; dague : 1, elle a sa dague dans SA main gauche ; brasDessus : 1, les bras passent devant la tête.
   ========================================================== */
HV.POSES = {
  /* (la main de l'arc un peu écartée du corps : quand elle se tournait, l'arc rentrait dans la tunique — Romain, 16 h 39 : « l'arc qui
     a un petit bug là, qui passe sous les textures ») */
  repos:{mainG:[-56, 243, 6], coudeG:[-0.7, -0.1, -0.7], mainD:[50.5, 243, 4], coudeD:[0.7, -0.1, -0.7], relG:1, relD:1, mdirG:[0, 0, 0], mdirD:[0, 0, 0],
    pouceG:[0.25, 0.1, 1], pouceD:[-0.25, 0.1, 1], poingG:0.75, poingD:0.15, indexG:0, indexD:0,
    piedG:[-19.5, 386, 5], piedD:[19.5, 386, -5], genouG:[-0.25, 0, 1], genouD:[0.25, 0, 1], ouvG:0.3, ouvD:0.3, pointeG:0, pointeD:0, lacetG:0, lacetD:0,
    bas:[0, 0, 0], bang:[0, 0, 0], dos:[0, 0, 0], tete:0, pen:0, hoche:0, bx:0, ty:0, couche:0, visiere:0, mainSurTete:0,
    /* l'expression (hv-tete.js) : le sourire de toujours, les sourcils au repos, le regard droit devant */
    sourcils:0, sourcilsIn:0, sourcilsAsym:0, plisse:0, sourire:1, ouvre:0, largeB:1, bouchex:0, rougit:0, regX:0, regY:0,
    /* (l'arc tenu le long du corps : son ventre vers l'avant, la corde derrière — avant, la corde passait DANS la jupe : Romain,
       23 novembre, 15 h 04 : « au repos, il y a un bug avec son arc ») */
    arcDir:[-0.2, 0, 1], arcAxe:[-0.1, 1, 0], tendu:0, dague:0, brasDessus:0,
    /* tourne : elle se tourne d'elle-même (degrés) ; flecheD : une flèche dans SA main (celle qui tire la corde) */
    tourne:0, flecheD:0, flecheP:0, capA:0, capW:0,
    /* L'ALCHIMISTE (hv-alchimiste.js) : fioleG / fioleD, une fiole dans SA main droite / gauche (0 … 1) ; fioleV, elle penche (degrés,
       pour verser) ; louche, la grande louche dans SA main droite (loucheR : il la fait tournoyer, en degrés) ; marmite, la petite
       marmite dans SA main gauche ; herbes, une poignée d'herbes dans SA main gauche */
    fioleG:0, fioleD:0, fioleV:0, louche:0, loucheR:0, marmite:0, herbes:0,
    /* LE SAGE (hv-sage.js) : cristal, son cristal brille (0 … 1) ; sansBaton, le bâton est posé (1) ; livre, le livre dans SA main
       gauche (0 … 1) ; livreO, il est ouvert (0 … 1) */
    cristal:0, sansBaton:0, livre:0, livreO:0, livreP:0,
    /* leve : elle est en l'air (un saut), de tant ; son ombre reste au sol et rapetisse */
    leve:0},
  /* une main sur la hanche, la tête un peu penchée */
  hanche:{mainD:[33, 211, 10], coudeD:[1, -0.1, -0.5], mdirD:[-0.45, 0.75, 0.45], pouceD:[0.3, 0.3, -1], poingD:0.35, pen:-5, bx:2.5, piedD:[24, 386, -4]},
  /* elle fait coucou de sa main libre (la paume vers nous) */
  coucou:{mainD:[73, 103, 12], coudeD:[0.5, 1, -0.1], mdirD:[0.05, -1, 0], pouceD:[-1, 0, 0], poingD:0, pen:4, sourcils:0.6, brasDessus:1},
  /* elle vise : le bras de l'arc tendu sur le côté, la corde à la joue, la tête tournée vers la cible */
  tir:{mainG:[-116, 151, 5], coudeG:[0, 0.7, -0.6], pouceG:[0, -1, 0.1], mainD:[17, 128, 12], coudeD:[1, -0.35, -0.3], poingD:0.8, tete:-84, arcDir:[-1, 0, 0.04], tendu:1, brasDessus:1,
    sourcils:-0.8, plisse:0.5, sourire:-0.1, largeB:0.75,
    piedG:[-26, 386, 3], piedD:[22.5, 386, -3]}
};
/* les poses, dans l'ordre où on les montre : [nom, ce qu'on dit à l'écran] (HV.LISTE est complétée par hv-poses.js) */
HV.LISTE = [['repos', 'Au repos'], ['hanche', 'La main sur la hanche'], ['coucou', 'Coucou !'], ['tir', 'Elle vise']];
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
HV.melange = melange;
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
/* (24 novembre — le mode léger : un pantin qui n'a plus rien à dessiner répond « false » ; quand AUCUN n'a plus rien à faire, la boucle
   s'arrête : le fil principal dort, comme le veut le donjon — RAPIDITE.md, R3. HV.reveiller() la relance, dès qu'un geste commence.) */
function boucle(now){ RAF = 0; var encore = false; for(var i = PANTINS.length - 1; i >= 0; i--) if(PANTINS[i].image(now) !== false) encore = true; if(PANTINS.length && encore) RAF = requestAnimationFrame(boucle); }
function lancer(){ if(!RAF && PANTINS.length && typeof requestAnimationFrame === 'function') RAF = requestAnimationFrame(boucle); }
HV.reveiller = lancer;

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
/* elle prend une pose. dur (secondes) : sinon, d'autant plus longtemps que le bassin a de chemin à faire (se relever, s'accroupir) */
PP.pose = function(nom, dur){
  if(!this.enPosition){ this.posi = null; this.gest = null; }
  if(nom === this.nom) return;
  this.A = this.courante(); this.B = HV.pose(nom);
  var dy = Math.abs(this.B.bas[1] - this.A.bas[1]), dz = Math.abs(this.B.bas[2] - this.A.bas[2]);
  this.tw = 0; this.dur = dur || 0.45 + Math.min(0.45, (dy + dz) / 200); this.nom = nom; this.tPose = this.t;
  lancer();
};
PP.courante = function(){ return this.tw >= 1 ? this.B : melange(this.A, this.B, eio(this.tw)); };
/* LES POSITIONS (hv-positions.js) : elle prend la pose de base de la position et y reste ; de temps en temps, elle fait un des
   gestes de cette position (elle regarde à droite, se baisse, sort une flèche…), puis revient. .joue(geste) : ce geste-là, tout
   de suite (les films, les boutons). */
PP.position = function(nom){
  var Po = HV.POSITIONS && HV.POSITIONS[nom];
  if(!Po) return;
  if(this.posi === nom) return;
  var cur = this.F ? this.courante() : null;
  this.enPosition = true; this.pose(Po.base); this.enPosition = false;
  /* (sortir d'un geste en cours : on repart de là où elle en est) */
  if(this.gest && cur){ this.A = this.gestCourant || cur; this.tw = 0; }
  this.posi = nom; this.gest = null; this.prochain = null; this.gestForce = null;
  lancer();
};
PP.joue = function(g){ this.gestForce = g; lancer(); };
PP.choisi = function(on){ this.anC = on ? 1 : 0; lancer(); };
/* changer ses habits (h.couleurs, h.tenue…) sans rien interrompre : la pose, le geste en cours continuent */
PP.habiller = function(h){
  this.h = h; this.K = HV.contexte(this.K.id, h);
  var d = this.hote.querySelector('svg > defs'); if(d) d.outerHTML = HV.defs(this.K);
  this._force = true; this.dessiner(0);
};
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
  var base = this.courante();
  if(this.posi && HV.positionImage && this.tw >= 1){ base = HV.positionImage(this, base, t); this.gestCourant = base; }
  var F = melange({}, base, 1), nom = this.nom;
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
  /* (l'anneau doré de celui dont c'est le tour : p.choisi(true) le fait apparaître en douceur) */
  this.anV = (this.anV || 0) + ((this.anC || 0) - (this.anV || 0)) * Math.min(1, dt * 5);
  F.anneau = this.anV; F.anneauT = t;
  if(this.auto){
    /* --- sa petite vie : elle respire, cligne des yeux, bouge un peu la tête, jette un coup d'œil --- */
    var re = Math.sin(TAU * t / 3.6);
    F.souffle = 0.5 + 0.5 * re;
    F.pen += 1.1 * Math.sin(TAU * t / 7.3 + 1); F.tete += 2.6 * Math.sin(TAU * t / 9.1);
    /* (elle passe doucement son poids d'un pied sur l'autre, les hanches suivent un peu : elle n'est jamais figée) */
    var ps = Math.sin(TAU * t / 6.7);
    F.bas = [F.bas[0] + 2.2 * ps, F.bas[1] + 0.6 * Math.abs(ps), F.bas[2]]; F.bang = [F.bang[0], F.bang[1] - 1.6 * ps, F.bang[2] + 1.4 * ps];
    F.qx += 1.5 * Math.sin(TAU * t / 4.2); F.qz += 0.8 * Math.sin(TAU * t / 5.7 + 2);
    /* (une main posée au sol ou sur un genou ne bouge pas) */
    F.mainG = [F.mainG[0] - 0.7 * re * F.relG, F.mainG[1] + 0.3 * re * F.relG, F.mainG[2] + 1.2 * Math.sin(TAU * t / 5.1) * F.relG];
    F.mainD = [F.mainD[0] + 0.7 * re * F.relD, F.mainD[1] + 0.3 * re * F.relD, F.mainD[2] - 1.2 * Math.sin(TAU * t / 5.1) * F.relD];
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
  /* (dans une position, ce sont les gestes de la position qui jouent, pas ceux des poses) */
  var w = eio(this.tw), tp = t - (this.tPose || 0), g = !this.posi && HV.GESTES && HV.GESTES[nom];
  if(nom === 'coucou'){ var a = Math.sin(TAU * tp * 2.3); F.mainD = [F.mainD[0] + 9 * a * w, F.mainD[1] + 3 * Math.abs(a) * w, F.mainD[2]]; }
  if(nom.slice(0, 3) === 'tir'){ F.rx = -0.5 * w; F.souffle *= 0.4; }
  if(g) g(F, w, tp, this);
  /* (24 novembre — LE MODE LÉGER des vieilles tablettes, hv-adaptateur.js : sans sa petite vie, quand rien n'a bougé depuis la
     dernière image, on ne refait pas le dessin — c'est lui qui coûte : le calcul, puis la peinture. L'anneau ne scintille plus.) */
  if(this.leger){
    F.anneauT = 0;
    if(!this._force && this.F && memeF(this.F, F)) return false;
  }
  this._force = false;
  this.F = F;
  this.fig.innerHTML = HV.dessin(this.h, F, {K:this.K});
  return true;
};
/* deux poses identiques, à un rien près (le léger : on ne redessine pas pour rien) */
function memeF(a, b){
  for(var k in b){
    var x = a[k], y = b[k];
    if(typeof y === 'number'){ if(typeof x !== 'number' || Math.abs(x - y) > 0.004) return false; }
    else if(y instanceof Array){ if(!(x instanceof Array) || x.length !== y.length) return false; for(var i = 0; i < y.length; i++) if(Math.abs(x[i] - y[i]) > 0.004) return false; }
    else if(x !== y) return false;
  }
  return true;
}
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
