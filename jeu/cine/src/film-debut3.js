/* film-debut3.js — LE FILM DU DÉBUT DE L'ENQUÊTE 3, « La lettre d'Odette » (Bible §13.69).
   Romain (18 novembre, à la voix) : « une cinématique à chaque début d'enquête […] l'enquête 3, ce serait le maire qui présente la
   lettre au village, tout le monde est content, c'est le début de la fête » ; « hollywoodien : des profondeurs de champ, des très gros
   plans, des travellings, beaucoup d'effets d'éclairage […] des textures très poussées pour les personnages et les décors […]
   surtout pas de fausse 3D des personnages ».

   Ce que dit le jeu juste après (e3.js, lettreLue) : « À l'aube, devant la mairie, le maire lit une lettre… » — « Odette va bien !
   Pour fêter ça : grande fête cette nuit, sur la place ! ». Le film ne dit rien de plus, et rien qui trahisse l'enquête :
   — le maire ne ment jamais : il dit « J'ai reçu une lettre » (vrai), il LIT la lettre, puis ses deux phrases du jeu ;
   — on ne lit pas l'écriture de la lettre (c'est un indice du Sage) : seulement la signature ;
   — Mélusine est dans la foule, comme tout le monde, ni plus ni moins ; Anselme dort (il sonne la nuit) ; ni Léo ni Bastien ;
   — la seule fausse note de la fête : Moustache, le chat d'Odette, assis tout seul au milieu des jambes. Il ne dit ni qui, ni où.

   Huit plans, 37 secondes. Le plateau : plateau-village.js (les coins 'foule' et 'place'). Ce fichier porte aussi LES OUTILS COMMUNS
   aux trois films de début (CINE.DEB) : les poses de base, la marche, la joie, l'acteur éclairé par le soleil. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, FV = window.CFXV, PV = window.PLATEAU_VILLAGE, GD = window.GensDebut, O = CINE.O, respire = O.respire, cligne = O.cligne, parle = O.parle;
var XF = PV.X.foule, XP = PV.X.place, W = 1440, H = 616, P = 1600;

/* ====================================================================== LES OUTILS COMMUNS AUX TROIS FILMS */
var D = CINE.DEB = {};
var VV = {sourcils:{f:0, l:0, t:0}, yeux:{o:1, lx:0, ly:0, cl:0}, bouche:{o:0, w:0, c:0, cri:0}};
D.V = {
  inquiet:{sourcils:{f:0, l:.45, t:.75}, yeux:{o:1.05}, bouche:{c:-.5, o:0}},
  attend:{sourcils:{f:.15, l:.2, t:.4}, yeux:{o:1}, bouche:{c:-.25, o:0}},
  surpris:{sourcils:{f:0, l:1, t:.1}, yeux:{o:1.4}, bouche:{o:.5, w:-.3, c:0}},
  soulage:{sourcils:{f:0, l:.35, t:.25}, yeux:{o:.82}, bouche:{c:.7, o:.12}},
  joie:{sourcils:{f:0, l:.7, t:0}, yeux:{o:.95}, bouche:{c:1, o:.55, w:.25}},
  peur:{sourcils:{f:0, l:.9, t:.75}, yeux:{o:1.36}, bouche:{o:.34, c:-.6, w:-.1}},
  sourire:{sourcils:{f:0, l:.2, t:0}, yeux:{o:.9}, bouche:{c:.9, o:0}}
};
D.base = function(n, plus){
  var Dn = Gens.D[n], e = n === 'maire' ? 40 : 42;
  var p = U.melange({w:[0, Dn.taille[1]], r:0, t:0, tk:1, souffle:0, pend:0, tete:{r:0, k:0, ht:0, x:0, y:0}, bD:{a:10, c:-14, l1:1, l2:1}, bG:{a:10, c:-14, l1:1, l2:1}, jD:{p:[e, 0]}, jG:{p:[-e, 0]}, poingD:'poing', poingG:'poing', v:VV}, plus || {}, 1);
  p._n = n; return p;
};
D.visage = function(p, v, k){ p.v = U.melange(p.v, U.melange(p.v, v, 1), k == null ? 1 : k); return p; };
/* un pas (de face) : le pied se lève, le corps monte et balance */
D.pas = function(p, ph, amp, course){
  var j = Math.floor(ph), fr = ph - j, cote = (j % 2) ? 'D' : 'G', sg = cote === 'D' ? 1 : -1, e = Math.abs(p.jD.p[0]), s = Math.sin(Math.PI * fr), bal = sg * s;
  p['j' + cote] = {p:[sg * e, -s * (course ? 52 : 19) * amp]};
  p.w = [p.w[0] + bal * (course ? 9 : 5) * amp, p.w[1] - Math.abs(s) * (course ? 17 : 6) * amp];
  p.r = (p.r || 0) + bal * (course ? 4 : 2.4) * amp; p.t = (p.t || 0) - bal * (course ? 2.4 : 1.4) * amp; p.tete.r = (p.tete.r || 0) - bal * 1.6 * amp;
  p.pend = (p.pend || 0) + bal * (course ? 24 : 9) * amp;
  return bal;
};
/* il attend : il respire, il cligne des yeux, il se balance à peine, son regard se promène */
D.vivant = function(p, t, g, o){
  o = o || {};
  respire(p, t, o.souffle == null ? .5 : o.souffle, .26 + (g % 5) * .012, g);
  p.r = (p.r || 0) + U.fbm(t * .22, g * 3 + 1, 2) * 1.6; p.t = (p.t || 0) + U.fbm(t * .19, g * 3 + 2, 2) * 1.4;
  p.tete.r = (p.tete.r || 0) + U.fbm(t * .3, g * 5 + 3, 2) * 3; p.tete.k = (p.tete.k || 0) + U.fbm(t * .27, g * 5 + 4, 2) * 3;
  var cl = cligne(t * (.9 + (g % 4) * .07), g * .83);
  p.v = U.melange(p.v, {yeux:{cl:Math.max(p.v.yeux.cl || 0, cl), lx:(p.v.yeux.lx || 0) + (o.regard === 0 ? 0 : U.fbm(t * .35, g * 7 + 5, 2) * .7)}}, 1);
  return p;
};
/* LA JOIE : il saute sur place, les bras en l'air (sorte 0), il applaudit (1), un bras levé (2), les mains sur les joues puis en l'air (3).
   k : 0 → 1 (elle monte) ; rend la hauteur du saut */
D.joie = function(p, t, k, g, sorte){
  if(!(k > 0)) return 0;
  var per = .5 + (g % 4) * .035, ph = (t + g * .17) / per * Math.PI * 2, s = Math.sin(ph), haut = Math.pow(Math.max(0, s), .8) * 34 * k, tasse = Math.max(0, -s) * 9 * k;
  var e = Math.abs(p.jD.p[0]);
  p.jD = {p:[e, -haut]}; p.jG = {p:[-e, -haut]};
  p.w = [p.w[0], p.w[1] - haut + tasse];
  p.tete.k = (p.tete.k || 0) - 7 * k; p.tete.r = (p.tete.r || 0) + Math.sin(ph * .5 + g) * 5 * k;
  var ag = Math.sin(t * 8.4 + g) * 13;
  function vers(b, cible){ return U.melange(b, cible, k); }
  if(sorte === 1){   /* il applaudit, les mains devant lui */
    var cl = Math.sin(t * 15 + g) * .5 + .5, cy = p.w[1] + Gens.D[p._n].cou[1] + 80;
    p.bD = vers(p.bD, {a:40, c:120}); p.bG = vers(p.bG, {a:40, c:120});
    if(k > .7){ p.bD = {cible:[10 + cl * 26, cy], ik:1, devant:true}; p.bG = {cible:[-10 - cl * 26, cy], ik:1, devant:true}; }
    p.poingD = p.poingG = 'ouvert';
  } else if(sorte === 2){ p.bD = vers(p.bD, {a:156 + ag, c:16}); p.bG = vers(p.bG, {a:30, c:60}); p.poingD = 'ouvert'; }
  else if(sorte === 3){ p.bD = vers(p.bD, {a:140 + ag, c:34}); p.bG = vers(p.bG, {a:144 - ag, c:30}); p.poingD = p.poingG = 'ouvert'; }
  else { p.bD = vers(p.bD, {a:152 + ag, c:20}); p.bG = vers(p.bG, {a:150 - ag, c:22}); }
  D.visage(p, U.melange(D.V.joie, {bouche:{o:.35 + .3 * Math.abs(Math.sin(t * 5 + g))}}, 1), k);
  return haut;
};
/* la couleur d'un liseré, sans le frémissement des torches (scene.js le multiplie par la lueur d'une flamme : on le défait) */
function calme(k, t){ return k / (FX.lueur(t, 1) * (FX.flare || 1)); }
/* UN ACTEUR ÉCLAIRÉ PAR LE SOLEIL. sorte : 'contre' (le soleil est derrière lui : deux liserés dorés, le visage dans l'ombre douce),
   'face' (le soleil lui arrive en plein visage : chaud, un liseré de ciel bleu), 'nuit' (la lune : bleu, froid) */
D.acteur = function(t, n, x, z, p, o, sorte, plus){
  var lum;
  if(sorte === 'contre') lum = {c:'#f2e2da', k:1, dx:-120, dy:-520, z:220, rims:[[-1, -.9, calme(1.25, t), '#ffd898'], [1, -.9, calme(1.25, t), '#ffd898'], [0, -1.25, calme(.8, t), '#fff0c8']]};
  else if(sorte === 'nuit') lum = {c:'#c8d4f0', k:1, dx:-200, dy:-560, z:200, rims:[[-1, -.9, calme(.8, t), '#9ab8ff'], [1, -.9, calme(.3, t), '#6a80c0']]};
  else lum = {c:'#fff6e4', k:1, dx:-240, dy:-560, z:190, rims:[[-1, -.9, calme(.5, t), '#c4d6ff'], [1, -.9, calme(.7, t), '#ffe2a8']]};
  return U.melange({type:n, x:x, z:z, pose:p, o:o || {}, ombreR:120, ombreOp:.5, lum:lum}, plus || {}, 1);
};
/* un dessin libre posé dans le monde, à l'échelle de sa distance (un villageois de dos, un chapeau, le chat) */
D.libre = function(x, y, z, svg, boite, plus){
  var rel = plus && plus.relief;
  return U.melange({type:'libre', x:x, y:y, z:z, boite:boite || [200, 600], dessin:function(p){ return (rel ? '<g filter="url(#relief' + rel + ')">' : '') + '<g transform="translate(' + U.r(p.x) + ' ' + U.r(p.y) + ') scale(' + U.r(p.s * 1000) / 1000 + ')">' + (typeof svg === 'function' ? svg(p) : svg) + '</g>' + (rel ? '</g>' : ''); }}, plus || {}, 1);
};
/* les fondus d'un film : l'ouverture, les passages (une liste d'instants : un demi-battement de noir), la fin */
D.fondus = function(E, t, duree, coupes){
  if(t < .7) E.fondu = {k:1 - t / .7};
  else if(t > duree - .8) E.fondu = {k:U.clamp((t - (duree - .8)) / .7, 0, 1)};
  else (coupes || []).forEach(function(c){ var d = c[1] || .22; if(t > c[0] - d && t < c[0]) E.fondu = {k:(t - (c[0] - d)) / d, c:c[2]}; else if(t >= c[0] && t < c[0] + d) E.fondu = {k:1 - (t - c[0]) / d, c:c[2]}; });
  return E;
};

/* ====================================================================== LE DÉROULÉ (en secondes) */
var T1 = 5.2, T2 = 9.6, T3 = 14.0, T4 = 17.4, T5 = 20.8, T6 = 25.0, T7 = 30.2, TITRE = 33.2, T = 37.2;
/* (des enfants lisent : six mots au plus par réplique, et chacune reste au moins 1,2 s + 0,3 s par mot — tools/debut-films.py le vérifie) */
var LIGNES = [
  [6.3, 9.4, 'Mes amis ! J\'ai reçu une lettre !', 'Le maire'],
  [10.0, 13.8, 'Je vais très bien… Signé : Odette.', 'Le maire'],
  [14.7, 17.2, 'Odette va bien !', 'Le maire'],
  [21.2, 24.8, 'Grande fête cette nuit !', 'Le maire']
];
function dit(t, n){ var l = LIGNES[n]; return parle(t, l[0] + .05, l[1] - .7, n + 3); }

/* ---------------------------------------------------------------- LE CIEL ET LA LUMIÈRE DES DEUX CÔTÉS DE LA PLACE */
var RUE = XF - 250, RUE_Z = -5200;
/* côté villageois : on regarde vers le soleil levant, au bout de la rue */
function cielFoule(t, cam){
  var az = Math.atan((RUE - cam.x) / (cam.z - RUE_Z + 9000)), alt = U.lerp(.012, .07, U.lisse(t / T));
  return {haut:[84, 114, 172], milieu:[236, 178, 150], bas:[255, 208, 142], lueur:{az:az, c:[255, 222, 150], k:.95, l:.75, h:.26},
    astre:{az:az, alt:alt, r:.026, c:[255, 252, 232], halo:[255, 214, 140], k:1}, etoiles:0, nuages:{c1:[172, 142, 178], c2:[255, 178, 128], k:.9, vit:4}};
}
var AMB_FOULE = [204, 180, 176];
/* les maisons d'en face sont à contre-jour : leurs façades sont dans l'ombre */
var PLANS_FOULE = {maisonsG:{teinte:'brightness(.66) saturate(.9)'}, maisonsD:{teinte:'brightness(.66) saturate(.9)'}, maisonsG2:{teinte:'brightness(.6) saturate(.9)'}, maisonsD2:{teinte:'brightness(.6) saturate(.9)'},
  fontaine:{teinte:'brightness(.74)'}, clocher:{teinte:'brightness(.8)'}, arbres:{teinte:'brightness(.74)'}};
function lampesFoule(t, k){
  /* le chemin de lumière qui sort de la rue et traverse la place ; le reflet doré de la mairie sur les visages ; le halo du soleil */
  return FV.forme([[RUE - 520, 0, RUE_Z], [RUE + 520, 0, RUE_Z], [RUE + 2300, 0, 3200], [RUE - 2300, 0, 3200]], [255, 226, 176], .8, 16) +
    FV.rondMonde(RUE, -700, RUE_Z, 3000, [255, 226, 180], .75) + FV.rondMonde(XF, -400, -300, 1700, [244, 222, 206], (k == null ? .6 : k));
}
function soleilFoule(t, k, rayons){
  var A = PV.ASTRE; if(!A) return '';
  return FV.soleil(A.x, A.y, A.r, k) + FV.rayons(t, A.x, A.y, k * (rayons == null ? .8 : rayons), {a0:10, a1:170, l:1300, n:13}) + FV.reflets(t, A.x, A.y, k * .7);
}
/* côté mairie : le soleil est dans notre dos, la façade est dorée */
var CIEL_PLACE = {haut:[78, 116, 180], milieu:[156, 176, 214], bas:[238, 204, 190], lueur:{az:0, c:[255, 206, 196], k:.5, l:1, h:.16}, etoiles:0, nuages:{c1:[255, 222, 184], c2:[244, 178, 156], k:.8, vit:4}};
var AMB_PLACE = [255, 234, 204];
function lampesPlace(t){
  /* le bas de l'image est dans l'ombre longue de la foule ; le haut de la façade est en plein soleil */
  return FV.bain(0, H, 0, H * .62, [132, 120, 150], .5, 0);
}

/* ---------------------------------------------------------------- LA FOULE (vue de face, côté villageois) */
var FOULE = [
  {n:'iris', x:-800, z:-20, g:1, joie:3}, {n:'gaspard', x:-330, z:30, g:2, joie:0, tient:{G:'rouleau'}}, {n:'margot', x:150, z:0, g:3, joie:1}, {n:'basile', x:620, z:-40, g:4, joie:2}, {n:'silas', x:1130, z:-90, g:5, joie:1},
  {n:'victor', x:-1080, z:-460, g:6, joie:2}, {n:'melusine', x:-570, z:-430, g:7, joie:1}, {n:'fortune', x:-90, z:-500, g:8, joie:0}, {n:'farinel', x:400, z:-470, g:9, joie:3}, {n:'lavandiere', x:880, z:-500, g:10, joie:0},
  {n:'lavandiere2', x:-320, z:-900, g:11, joie:3}, {n:'basile', x:1500, z:-880, g:12, joie:0, fig:1}, {n:'margot', x:-1500, z:-940, g:13, joie:2, fig:1}, {n:'fortune', x:640, z:-1320, g:14, joie:1, fig:1}, {n:'lavandiere', x:-900, z:-1380, g:15, joie:0, fig:1}, {n:'victor', x:120, z:-1400, g:16, joie:2, fig:1}
];
/* l'humeur de la foule : 0 = elle attend, inquiète ; 1 = soulagée ; 2 = la joie */
function poseFoule(c, t, humeur, joieK){
  var p = D.base(c.n);
  if(c.tient && c.tient.G === 'rouleau') p.bG = {a:26, c:96};
  D.visage(p, humeur < 1 ? U.melange(D.V.inquiet, D.V.soulage, humeur) : D.V.soulage);
  if(humeur < .5){
    /* ils attendent : les bras croisés, les mains jointes, une main sur le cœur… chacun sa façon */
    var q = c.g % 4, cy = p.w[1] + Gens.D[c.n].cou[1];
    if(q === 0){ p.bD = {cible:[-14, cy + 96], ik:1, devant:true}; p.bG = {cible:[14, cy + 104], ik:1, devant:true}; }
    else if(q === 1){ p.bD = {cible:[6, cy + 60], ik:1, devant:true}; p.poingD = 'ouvert'; }
    else if(q === 2){ p.bD = {cible:[8, cy + 110], ik:1, devant:true}; p.bG = {cible:[-8, cy + 114], ik:1, devant:true}; }
  }
  D.vivant(p, t, c.g, {souffle:.5});
  D.joie(p, t, joieK, c.g, c.joie);
  return p;
}
function acteursFoule(t, humeur, joieK, o){
  o = o || {};
  var L = [];
  FOULE.forEach(function(c){
    if(o.sans && o.sans.indexOf(c.g) >= 0) return;
    var k = typeof joieK === 'function' ? joieK(c) : joieK, hu = typeof humeur === 'function' ? humeur(c) : humeur, p = poseFoule(c, t, hu, k);
    var oo = {tient:c.tient || {}, graine:c.g}; if(o.sansCoiffe && o.sansCoiffe(c)) oo.sansCoiffe = true;
    var x = XF + c.x, z = c.z;
    L.push(D.acteur(t, c.n, x, z, p, oo, 'contre', {ombreLongue:{vx:(x - RUE) / (z + 9000) * 2.6, vz:2.6, op:.34, flou:6}, _c:c}));
  });
  return L;
}

/* ================================================================ 1. L'ATTENTE (0 → 5,2 s) : la caméra glisse le long des visages, le soleil se lève derrière eux */
function plan1(t){
  var k = U.lisse(t / T1), cam = {x:XF + U.lerp(760, -560, k), y:-408, z:1060, focus:U.lerp(1075, 1090, k), ouverture:1.3};
  var A = acteursFoule(t, 0, 0);
  /* leurs regards vont vers la porte de la mairie (vers nous), puis les uns vers les autres */
  A.forEach(function(a){ var g = a._c.g; a.pose.v = U.melange(a.pose.v, {yeux:{ly:-.25, lx:U.clamp((cam.x - a.x) / 900, -1, 1) * .5 + (a.pose.v.yeux.lx || 0) * .5}}, 1);
    /* Margot se tord les mains ; Gaspard tapote son rouleau dans sa paume */
    if(g === 3){ var cy = a.pose.w[1] + Gens.D.margot.cou[1]; a.pose.bD = {cible:[8 + Math.sin(t * 3) * 5, cy + 104 + Math.cos(t * 3) * 4], ik:1, devant:true}; a.pose.bG = {cible:[-8 - Math.sin(t * 3) * 5, cy + 110], ik:1, devant:true}; } });
  return {zone:'foule', cam:cam, acteurs:A, portee:.6, poussiere:0, ambiance:AMB_FOULE, plans:PLANS_FOULE, ciel:cielFoule(t, cam), lampes:function(){ return lampesFoule(t, .7); },
    lumieres:function(){ return soleilFoule(t, .95, .9) + FV.poussiere(t, [XF - 1600, -900, -1200, XF + 1600, -60, 900], 90, 7, '#ffe6b0', .8) + FV.bokehs(t, 9, .5, 'Or', 31, [0, 0, W, 300]); }};
}

/* ---------------------------------------------------------------- CÔTÉ MAIRIE : la porte ouverte, les bannières, le maire, la foule vue de dos */
function porteOuverte(){
  var M = PV.MAIRIE.porte, z = PV.MAIRIE.z + 3;
  return {type:'libre', x:M.x, y:0, z:z, boite:[M.w, M.h + 60], dessin:function(p){
    var w = M.w * p.s, h = M.h * p.s, x0 = p.x - w / 2, r = w / 2, id = 'po' + Math.round(p.x);
    var arc = 'M' + U.r(x0) + ' ' + U.r(p.y) + ' L ' + U.r(x0) + ' ' + U.r(p.y - h + r) + ' A ' + U.r(r) + ' ' + U.r(r) + ' 0 0 1 ' + U.r(x0 + w) + ' ' + U.r(p.y - h + r) + ' L ' + U.r(x0 + w) + ' ' + U.r(p.y) + ' Z';
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070504"/><stop offset=".7" stop-color="#150d08"/><stop offset="1" stop-color="#3a2a1c"/></linearGradient><path d="' + arc + '" fill="url(#' + id + ')"/>' +
      /* les deux battants, ouverts vers l'intérieur : on les voit par la tranche */
      '<clipPath id="' + id + 'c"><path d="' + arc + '"/></clipPath><g clip-path="url(#' + id + 'c)"><rect x="' + U.r(x0) + '" y="' + U.r(p.y - h) + '" width="' + U.r(w * .13) + '" height="' + U.r(h) + '" fill="#5a3826"/><rect x="' + U.r(x0 + w * .87) + '" y="' + U.r(p.y - h) + '" width="' + U.r(w * .13) + '" height="' + U.r(h) + '" fill="#4a2e1e"/>' +
      '<rect x="' + U.r(x0 + w * .13) + '" y="' + U.r(p.y - h) + '" width="' + U.r(w * .05) + '" height="' + U.r(h) + '" fill="#000" opacity=".5"/><rect x="' + U.r(x0 + w * .82) + '" y="' + U.r(p.y - h) + '" width="' + U.r(w * .05) + '" height="' + U.r(h) + '" fill="#000" opacity=".5"/></g>';
  }};
}
/* une longue bannière violette et or (la lanterne de Brumeval), pendue à la façade ; elle ondule */
function banniere(t, x, g){
  var yh = -2250, lg = 380, ht = 1150;
  return {type:'libre', x:x, y:0, z:PV.MAIRIE.z + 8, boite:[lg, 2400], dessin:function(p){
    var s = p.s, pts = [], n = 8;
    for(var i = 0; i <= n; i++){ var u = i / n, on = Math.sin(t * 1.5 + u * 3.2 + g) * 22 * u; pts.push([p.x + on * s, p.y + (yh + ht * u) * s]); }
    var gche = pts.map(function(q){ return U.r(q[0] - lg / 2 * s) + ' ' + U.r(q[1]); }), dte = pts.slice().reverse().map(function(q){ return U.r(q[0] + lg / 2 * s) + ' ' + U.r(q[1]); }), b = pts[n];
    var forme = 'M' + gche.join(' L ') + ' L ' + U.r(b[0]) + ' ' + U.r(b[1] - 130 * s) + ' L ' + dte.join(' L ') + ' Z', id = 'bn' + g;
    var em = pts[3];
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2f6a"/><stop offset=".3" stop-color="#6a5aaa"/><stop offset=".55" stop-color="#4a3c84"/><stop offset=".8" stop-color="#6252a0"/><stop offset="1" stop-color="#2a2250"/></linearGradient>' +
      '<rect x="' + U.r(p.x - (lg / 2 + 24) * s) + '" y="' + U.r(p.y + (yh - 14) * s) + '" width="' + U.r((lg + 48) * s) + '" height="' + U.r(16 * s) + '" fill="#5a3a20" stroke="#1a0e08" stroke-width="' + U.r(2 * s) + '"/>' +
      '<path d="' + forme + '" fill="url(#' + id + ')" stroke="#1a0e08" stroke-width="' + U.r(Math.max(.8, 3 * s)) + '" stroke-linejoin="round"/><path d="' + forme + '" fill="url(#tx_laine)"/>' +
      '<path d="M' + gche.map(function(q, i){ var a = q.split(' '); return U.r(+a[0] + 26 * s) + ' ' + a[1]; }).join(' L ') + '" fill="none" stroke="#e8b84a" stroke-width="' + U.r(Math.max(.8, 7 * s)) + '"/><path d="M' + pts.map(function(q){ return U.r(q[0] + (lg / 2 - 26) * s) + ' ' + U.r(q[1]); }).join(' L ') + '" fill="none" stroke="#e8b84a" stroke-width="' + U.r(Math.max(.8, 7 * s)) + '"/>' +
      /* la lanterne d'or brodée */
      '<g transform="translate(' + U.r(em[0]) + ' ' + U.r(em[1] + 110 * s) + ') scale(' + U.r(s * 1000) / 1000 + ')" stroke="#1a0e08" stroke-width="4" stroke-linejoin="round"><path d="M-22 -110 a22 22 0 1 1 44 0" fill="none" stroke="#e8b84a" stroke-width="10"/><path d="M-56 -110 L 56 -110 L 40 -70 L -40 -70 Z" fill="#e8b84a"/><path d="M-48 -70 L 48 -70 L 60 70 L -60 70 Z" fill="#fff4b8"/><path d="M-18 -70 L -21 70 M18 -70 L 21 70" stroke="#c8902a" stroke-width="7"/><circle cx="0" cy="0" r="26" fill="#ffc21f" stroke="none"/><path d="M-68 70 L 68 70 L 48 110 L -48 110 Z" fill="#e8b84a"/></g>';
  }};
}
/* les villageois vus de dos, entre la caméra et le perron */
var DOS = [
  {x:-560, z:520, o:{habit:'#f4f0e6', bas:'#6a5440', peau:'#dea575', poil:'#6a3a1c', l:80, coiffe:'toque', tablier:true}, g:2},
  {x:-90, z:640, o:{habit:'#a8302a', bas:'#8a2622', peau:'#dea575', poil:'#6a3a1c', l:60, coiffe:'chignon', jupe:true, tablier:true}, g:3},
  {x:420, z:500, o:{habit:'#e8d8b0', bas:'#3f5f9a', peau:'#c7935c', poil:'#946638', l:80, coiffe:'paille', bretelles:'#3f5f9a'}, g:4},
  {x:-1040, z:260, o:{habit:'#4a8a4a', bas:'#3f7a40', peau:'#efb88e', poil:'#e8c058', l:58, longs:true, jupe:true}, g:1},
  {x:900, z:300, o:{habit:'#3c6b40', bas:'#5a4a30', peau:'#f6d0a8', poil:'#2a2228', l:72}, g:5},
  {x:-320, z:20, o:{habit:'#2f7a5a', bas:'#286a4e', peau:'#f7caa6', poil:'#d05c26', l:58, coiffe:'chignon', jupe:true}, g:7},
  {x:180, z:-80, o:{habit:'#c8302a', bas:'#4a3a4a', peau:'#c7935c', poil:'#262738', l:68, coiffe:'plume'}, g:8},
  {x:660, z:-140, o:{habit:'#d8ccb0', bas:'#8a7a5e', peau:'#efb88e', poil:'#e8c058', l:80, coiffe:'bonnet', tablier:true}, g:9},
  {x:-760, z:-200, o:{habit:'#2f4f9a', bas:'#26386a', peau:'#dea575', poil:'#6a3a1c', l:68, coiffe:'facteur'}, g:6},
  {x:1240, z:-60, o:{habit:'#5a7aa8', bas:'#48648c', peau:'#efb88e', poil:'#946638', l:58, coiffe:'fichu', jupe:true}, g:10},
  {x:-1400, z:-120, o:{habit:'#8a6a3e', bas:'#6a5236', peau:'#dea575', poil:'#262738', l:58, coiffe:'fichu', fichu:'#c8503a', jupe:true}, g:11}
];
function acteursDos(t, joieK, o){
  o = o || {};
  return DOS.map(function(c){
    var x = c.x; if(o.couloir && Math.abs(x) < o.couloir + 300) x = (x < 0 ? -1 : 1) * (o.couloir + Math.abs(x) * .55);
    var k = typeof joieK === 'function' ? joieK(c) : joieK, per = .5 + (c.g % 4) * .035, s = Math.sin((t + c.g * .17) / per * Math.PI * 2), saut = Math.pow(Math.max(0, s), .8) * 34 * k;
    var oo = U.melange(c.o, {bG:k * (c.g % 3 === 1 ? .3 : 1) * (.86 + .14 * Math.sin(t * 8 + c.g)), bD:k * (c.g % 3 === 2 ? .35 : 1) * (.86 + .14 * Math.cos(t * 8 + c.g)), saut:saut, t:U.fbm(t * .25, c.g * 3, 2) * 2.4}, 1);
    return D.libre(XP + x, 0, c.z, GD.dos(oo), [240, 700], {relief:'Soleil'});
  });
}
function poseMaire(t){
  var p = D.base('maire');
  D.visage(p, {sourcils:{l:.25}, yeux:{o:.82}, bouche:{c:.95, o:0}});
  return p;
}
var PERRON_Y = -150;

/* ================================================================ 2. LE MAIRE SORT (5,2 → 9,6 s) : on est dans la foule, on lève les yeux vers le perron */
function plan2(t){
  var a = t - T1, k = U.lisse(a / (T2 - T1));
  var cam = {x:XP + U.lerp(-90, 30, k), y:U.lerp(-470, -530, k), z:U.lerp(1380, 980, k), tangage:U.lerp(.02, .04, k), focus:U.lerp(2600, 2230, k), ouverture:.9};
  var p = poseMaire(t), sort = U.lisse(U.clamp(a / 1.5, 0, 1)), z = U.lerp(PV.MAIRIE.z + 30, PV.PERRON.zHaut + 40, sort);
  if(sort < 1) D.pas(p, a * 2.3, 1 - sort * .6);
  /* il lève la lettre bien haut (1,4 s), il parle, l'autre main s'ouvre vers la foule */
  var leve = U.COURBES.dep(U.clamp((a - 1.25) / .5, 0, 1));
  p.bG = {a:U.lerp(22, 152, leve) + Math.sin(t * 6) * 3 * leve, c:U.lerp(70, 14, leve)};
  var ouvre = U.lisse(U.clamp((a - 1.9) / .6, 0, 1));
  p.bD = {a:U.lerp(10, 64, ouvre) + Math.sin(t * 2.4) * 5 * ouvre, c:U.lerp(-14, 30, ouvre)}; if(ouvre > .3) p.poingD = 'ouvert';
  var b = dit(t, 0); if(b) p.v = U.melange(p.v, {bouche:{o:b.o, w:b.w, c:.6}, sourcils:{l:.6}}, 1);
  D.vivant(p, t, 21, {souffle:.6});
  var maire = D.acteur(t, 'maire', XP + 20, z, p, {tient:{G:'lettre'}, lettreA:-6 + Math.sin(t * 6) * 3, gants:1}, 'face', {y:PERRON_Y, ombreOp:.5});
  /* il sort de l'ombre de la porte : sombre d'abord, puis en plein soleil */
  var ombre = 1 - sort;
  return {zone:'place', cam:cam, acteurs:[porteOuverte(), banniere(t, XP - 620, 1), banniere(t, XP + 620, 2), maire].concat(acteursDos(t, 0, {couloir:330})), portee:.8, poussiere:0, ambiance:AMB_PLACE, ciel:CIEL_PLACE,
    lampes:function(){ return lampesPlace(t) + FV.rondMonde(XP + 20, PERRON_Y - 330, z, 520, [255, 248, 228], .9 * sort) + (ombre > 0 ? (function(){ var q = CAM.projeter(XP + 20, PERRON_Y - 300, z); return '<ellipse cx="' + U.r(q.x) + '" cy="' + U.r(q.y) + '" rx="' + U.r(300 * q.s) + '" ry="' + U.r(420 * q.s) + '" fill="#2a2038" opacity="' + U.r(ombre * .75) + '" filter="url(#fl20)"/>'; })() : ''); },
    lumieres:function(){ return FV.poussiere(t, [XP - 1500, -1100, -1000, XP + 1500, -80, 1200], 80, 9, '#fff0c8', .7) + FV.bokehs(t, 6, .35, 'Or', 37, [0, 0, W, 240]); }};
}

/* ================================================================ 3. LA LETTRE EN TRÈS GROS PLAN (9,6 → 14 s) : le point net descend jusqu'à la signature */
function plan3(t){
  var a = t - T2, d = T3 - T2;
  return {zone:'place', cam:{x:XP, y:-500, z:1400, focus:2600, ouverture:.9}, acteurs:[], portee:0, poussiere:0, ambiance:[255, 255, 255], ciel:CIEL_PLACE,
    avant:function(){ return GD.insertLettre(t, U.tresLisse(U.clamp((a - .5) / 2.6, 0, 1)), U.clamp((a - .9) / 2.6, 0, 1)) + FV.bokehs(t, 7, .5, 'Or', 43); }};
}

/* ================================================================ 4. LE MAIRE, EN GROS PLAN (14 → 17,4 s) : il lève les yeux de la lettre — « Odette va bien ! » */
function plan4(t){
  var a = t - T3, k = U.lisse(a / (T4 - T3));
  var p = poseMaire(t), zM = PV.PERRON.z - 30, xM = XP + 430;
  /* il lit encore (les yeux baissés, ils vont de gauche à droite), puis il relève la tête, et son sourire s'élargit */
  var leve = U.lisse(U.clamp((a - .35) / .45, 0, 1));
  p.tete.k = U.lerp(15, -4, leve); p.v = U.melange(p.v, {yeux:{ly:U.lerp(.9, -.1, leve), lx:(1 - leve) * Math.sin(t * 5) * .6, o:U.lerp(.7, .92, leve)}, sourcils:{l:U.lerp(.1, .7, leve)}, bouche:{c:U.lerp(.5, 1, leve)}}, 1);
  var b = dit(t, 2); if(b) p.v = U.melange(p.v, {bouche:{o:b.o * 1.1, w:b.w + .2, c:.8}}, 1);
  /* il tient la lettre à deux mains, plus bas (elle dépasse à peine dans le cadre) */
  var cy = p.w[1] + Gens.D.maire.cou[1];
  p.bG = {cible:[-46, cy + U.lerp(96, 150, leve)], ik:1, devant:true}; p.bD = {cible:[40, cy + U.lerp(104, 156, leve)], ik:1, devant:true};
  D.vivant(p, t, 21, {souffle:.5, regard:0});
  var yeux = PERRON_Y + p.w[1] + Gens.D.maire.cou[1] - 62, z = U.lerp(520, 400, k);
  var cam = {x:xM + U.lerp(-34, 8, k), y:yeux + .12 * H * z / P, z:zM + z, focus:z, ouverture:1.5};
  var maire = D.acteur(t, 'maire', xM, zM, p, {tient:{G:'lettre'}, lettreA:-10, gants:1}, 'face', {y:PERRON_Y, ombre:false});
  return {zone:'place', cam:cam, acteurs:[porteOuverte(), banniere(t, XP - 620, 1), banniere(t, XP + 620, 2), maire], portee:.7, poussiere:0, ambiance:AMB_PLACE, ciel:CIEL_PLACE,
    lampes:function(){ return FV.bain(0, 0, 0, H, [255, 246, 226], .0, .0); },
    lumieres:function(){ return FV.poussiere(t, [xM - 500, PERRON_Y - 760, zM - 100, xM + 500, PERRON_Y - 200, zM + 380], 46, 11, '#fff0c8', .8) + FV.bokehs(t, 5, .4, 'Or', 47); }};
}

/* ================================================================ 5. LA FOULE COMPREND (17,4 → 20,8 s) : le soulagement passe de visage en visage, puis la joie */
function plan5(t){
  var a = t - T4, k = U.lisse(a / (T5 - T4));
  var cam = {x:XF + U.lerp(-60, 60, k), y:U.lerp(-430, -470, k), z:U.lerp(1900, 2080, k), focus:U.lerp(1950, 2200, k), ouverture:.9};
  var A = acteursFoule(t, function(c){ return U.lisse(U.clamp((a - .15 - (c.g % 6) * .09) / .5, 0, 1)); }, function(c){ return U.lisse(U.clamp((a - 1.0 - (c.g % 5) * .13) / .6, 0, 1)); });
  return {zone:'foule', cam:cam, acteurs:A, portee:.9, poussiere:0, ambiance:AMB_FOULE, plans:PLANS_FOULE, ciel:cielFoule(t, cam), lampes:function(){ return lampesFoule(t, .7); },
    lumieres:function(){ return soleilFoule(t, .9, .8) + FV.poussiere(t, [XF - 1800, -1000, -1300, XF + 1800, -60, 1400], 90, 7, '#ffe6b0', .8); }};
}

/* ================================================================ 6. « GRANDE FÊTE CETTE NUIT ! » (20,8 → 25 s) : la caméra recule et s'élève au-dessus de la foule */
function plan6(t){
  var a = t - T5, k = U.tresLisse(a / (T6 - T5));
  var cam = {x:XP + U.lerp(60, -40, k), y:U.lerp(-540, -900, k), z:U.lerp(1300, 2500, k), tangage:U.lerp(.0, -.03, k), focus:U.lerp(2560, 3700, k), ouverture:.55};
  var p = poseMaire(t), ouv = U.COURBES.dep(U.clamp((a - .15) / .55, 0, 1));
  p.bD = {a:U.lerp(20, 116, ouv) + Math.sin(t * 3) * 4, c:U.lerp(0, 26, ouv)}; p.bG = {a:U.lerp(20, 122, ouv) - Math.sin(t * 3) * 4, c:U.lerp(0, 22, ouv)}; p.poingD = 'ouvert';
  p.tete.k = -6; var b = dit(t, 3); if(b) p.v = U.melange(p.v, {bouche:{o:b.o * 1.15, w:b.w + .2, c:.8}, sourcils:{l:.8}}, 1);
  D.vivant(p, t, 21, {souffle:.7});
  var maire = D.acteur(t, 'maire', XP, PV.PERRON.zHaut + 60, p, {tient:{G:'lettre'}, lettreA:20, gants:1}, 'face', {y:PERRON_Y});
  var joie = function(c){ return U.lisse(U.clamp((a - 1.5 - (c.g % 5) * .12) / .7, 0, 1)); };
  return {zone:'place', cam:cam, acteurs:[porteOuverte(), banniere(t, XP - 620, 1), banniere(t, XP + 620, 2), maire].concat(acteursDos(t, joie)), portee:.8, poussiere:0, ambiance:AMB_PLACE, ciel:CIEL_PLACE,
    lampes:function(){ return lampesPlace(t); },
    lumieres:function(){ return FV.poussiere(t, [XP - 2200, -1500, -1000, XP + 2200, -80, 2400], 110, 9, '#fff0c8', .7); },
    devant:function(){ return FV.confettis(t, T5 + 2.2, [XP - 2000, -2100, -900, XP + 2000, 0, 1400], 90, 61); }};
}

/* ================================================================ 7. LA FÊTE COMMENCE (25 → 30,2 s) : les chapeaux volent, les fanions montent, les oiseaux s'envolent du clocher */
var LANCERS = [{g:4, sorte:'paille', t0:.5, vx:120, h:760}, {g:8, sorte:'plume', t0:.9, vx:-160, h:640}, {g:6, sorte:'facteur', t0:1.3, vx:90, h:700}, {g:9, sorte:'bonnet', t0:1.7, vx:-60, h:600}];
function chapeaux(t){
  var L = [];
  LANCERS.forEach(function(l){
    var c = FOULE.filter(function(q){ return q.g === l.g; })[0], a = t - T6 - l.t0; if(a < 0 || a > 2.6) return;
    var u = a / 2.6, y = -520 - l.h * 4 * u * (1 - u), x = XF + c.x + l.vx * a, rot = a * 260 * (l.vx > 0 ? 1 : -1);
    L.push(D.libre(x, y, c.z + 6, '<g transform="rotate(' + U.r(rot) + ')">' + GD.chapeau(l.sorte) + '</g>', [120, 2400]));
  });
  return L;
}
function sansCoiffe(t){ return function(c){ return !c.fig && LANCERS.some(function(l){ return l.g === c.g && t > T6 + l.t0 && t < T6 + l.t0 + 2.6; }); }; }
function plan7(t){
  var a = t - T6, k = U.lisse(a / (T7 - T6));
  var cam = {x:XF + U.lerp(140, -80, k), y:U.lerp(-640, -980, k), z:U.lerp(2700, 3500, k), tangage:U.lerp(-.02, -.06, k), focus:U.lerp(2900, 3800, k), ouverture:.5};
  var A = acteursFoule(t, 1, 1, {sansCoiffe:sansCoiffe(t)}).concat(chapeaux(t));
  /* ceux qui lancent leur chapeau : le bras part d'un coup vers le haut */
  A.forEach(function(q){ if(!q._c) return; LANCERS.forEach(function(l){ if(l.g === q._c.g && !q._c.fig){ var b = t - T6 - l.t0; if(b > -.3 && b < .5) q.pose.bD = {a:U.lerp(60, 170, U.COURBES.dep(U.clamp((b + .3) / .3, 0, 1))), c:8}; } }); });
  var Cl = PV.CLOCHER;
  return {zone:'foule', cam:cam, acteurs:A, portee:.9, poussiere:0, ambiance:[214, 190, 184], plans:PLANS_FOULE, ciel:cielFoule(t, cam), lampes:function(){ return lampesFoule(t, .75); },
    lumieres:function(){ return soleilFoule(t, 1, 1) + FV.poussiere(t, [XF - 2400, -1400, -1500, XF + 2400, -60, 2000], 120, 7, '#ffe6b0', .8); },
    devant:function(){ return FV.oiseaux(t, T6 + .9, Cl.x, -5600, Cl.z, 16, 53, {dx:1700, l:900}) + FV.oiseaux(t, T6 + 2.2, XF - 4200, -3300, -5200, 9, 57, {dx:1300, gauche:.2}) +
      FV.fanions(t, [XF - 3900, -2050, -2380, 420], [XF + 4300, -1980, -2380], 17, U.lisse(U.clamp((a - .4) / 2.2, 0, 1)), 1) + FV.fanions(t, [XF - 3000, -1560, -700, 300], [XF + 2900, -1640, -700], 13, U.lisse(U.clamp((a - 1.3) / 2.2, 0, 1)), 4) +
      FV.confettis(t, T6 + .2, [XF - 2600, -2300, -1500, XF + 2600, 0, 1600], 150, 67); }};
}

/* ================================================================ 8. MOUSTACHE (30,2 → la fin) : on descend entre les jambes ; le chat d'Odette, tout seul, ne fait pas la fête : il nous regarde de travers */
var CHAT = {x:XF - 70, z:330};
function plan8(t){
  var a = t - T7, k = U.tresLisse(U.clamp(a / 3.4, 0, 1));
  var dz = U.lerp(1250, 700, k), cam = {x:CHAT.x + U.lerp(260, 0, k), y:U.lerp(-330, -128, k) - 64 * U.tresLisse(U.clamp((a - 2.2) / 1.2, 0, 1)), z:CHAT.z + dz, tangage:U.lerp(-.1, -.02, k), focus:U.lerp(dz + 500, dz, U.tresLisse(U.clamp((a - .5) / 1.7, 0, 1))), ouverture:1.5};
  var A = acteursFoule(t, 1, 1, {sansCoiffe:function(c){ return c.g === 4 || c.g === 8; }});
  /* deux danseurs passent tout près, devant nous (on ne voit que leurs jambes, floues) */
  var d1 = D.base('lavandiere'), d2 = D.base('victor'); D.joie(d1, t, 1, 31, 0); D.joie(d2, t, 1, 33, 3);
  A.push(D.acteur(t, 'lavandiere', CHAT.x + U.lerp(-560, 620, U.clamp((a - .1) / 1.7, 0, 1)), CHAT.z + 380, d1, {}, 'contre'), D.acteur(t, 'victor', CHAT.x + 330 + Math.cos(t * .9) * 60 + a * 26, CHAT.z + 300, d2, {}, 'contre'));
  /* le chat : les oreilles mi-couchées, il regarde à gauche, à droite, puis droit vers nous — et il n'est PAS content (Romain, 19 novembre :
     « une tête de chat pas content, avec des yeux un peu à moitié fermés, suspicieux », comme s'il savait qu'Odette a disparu et que tout ça
     est un piège) : ses yeux se plissent en biais (GD.chat, o.mefiant), sa queue bat d'agacement, il grogne tout bas. Il ne miaule plus. */
  var re = U.piste([[0, -.9], [1.2, -.9], [1.5, .9], [2.4, .9], [2.8, 0], [9, 0]])(a);
  var mf = .3 + .7 * U.tresLisse(U.clamp((a - 2.7) / 1.1, 0, 1));                  /* méfiant dès le début ; il plisse les yeux en nous regardant */
  var cl0 = cligne(t * 1.3, 2.2) * (1 - U.clamp((a - 2.6) / .4, 0, 1));             /* (il ne cligne plus : il nous fixe) */
  var chat = GD.chat({lx:re, ly:-.15 - .35 * U.clamp((a - 2.6) / .6, 0, 1), cl:cl0 + .12 * mf, oreilles:.62 + .14 * U.clamp((a - 2.8) / .8, 0, 1), miaou:0, mefiant:mf,
    queue:Math.max(0, Math.sin(t * (a > 3 ? 4.4 : 2.6))) * (a > 3 ? 1.3 : 1), tete:U.fbm(t * .5, 5, 2) * 2 + re * 3 - 5 * U.tresLisse(U.clamp((a - 2.8) / 1, 0, 1)), souffle:.5 + .5 * Math.sin(t * 2.2), pupille:.5});
  var lumChat = U.lisse(U.clamp((a - 1.6) / 1.6, 0, 1));
  A.push(D.libre(CHAT.x, 0, CHAT.z, '<ellipse cx="6" cy="2" rx="110" ry="17" fill="#000" opacity=".4"/>', [200, 300]), D.libre(CHAT.x, 0, CHAT.z + 1, chat, [200, 300], {relief:'Contre'}));
  /* un confetti s'est posé sur sa tête */
  return {zone:'foule', cam:cam, acteurs:A, portee:.7, poussiere:0, ambiance:[200, 178, 176], plans:PLANS_FOULE, ciel:cielFoule(t, cam),
    lampes:function(){ return lampesFoule(t, .5) + FV.rondSol(CHAT.x, CHAT.z, 420, 300, [255, 236, 200], .85 * lumChat) + FV.rondMonde(CHAT.x, -100, CHAT.z, 260, [255, 240, 214], .7 * lumChat); },
    lumieres:function(){ return soleilFoule(t, .9, .7) + FV.poussiere(t, [CHAT.x - 900, -500, CHAT.z - 400, CHAT.x + 900, -10, CHAT.z + 700], 60, 13, '#ffe6b0', .9); },
    devant:function(){ return FV.confettis(t, T6 + .2, [XF - 1800, -1500, -900, XF + 1800, 0, 1300], 110, 67); },
    avant:function(){ return FV.titre(t, TITRE, 'La lettre d\'Odette', {sous:'ENQUÊTE 3', y:206, taille:100, voile:.3}); }};
}

CINE.films.debut3 = {
  nom:'La lettre d\'Odette — le début', plateau:'village', duree:T, defs:FV.defs,
  sons:[[.1, 'cineAube'], [.6, 'cineMurmure'], [T1 + .05, 'cinePorteMairie'], [T1 + 1.3, 'cinePapier'], [T2 + .1, 'cinePapier'], [T4 + .25, 'cineSoupir'], [T4 + 1.1, 'cineHourra'], [T5 + 1.9, 'cineHourra'],
    [T6 + .1, 'cineFete'], [T6 + .9, 'cineClocheJoie'], [T6 + 1.0, 'cineEnvol'], [T6 + 2.6, 'cineClocheJoie'], [T7 + .2, 'cineFeteLoin'], [T7 + 3.5, 'cineMoustacheGrogne']],
  sousTitres:LIGNES,
  etat:function(t){
    PV.prepare('place'); PV.prepare('foule');
    var E = t < T1 ? plan1(t) : t < T2 ? plan2(t) : t < T3 ? plan3(t) : t < T4 ? plan4(t) : t < T5 ? plan5(t) : t < T6 ? plan6(t) : t < T7 ? plan7(t) : plan8(t);
    return D.fondus(E, t, T, [[T2, .16, '#fff6e0'], [T3, .16, '#fff6e0'], [T7, .3]]);
  }
};
})();
