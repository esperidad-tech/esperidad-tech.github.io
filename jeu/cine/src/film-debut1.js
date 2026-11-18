/* film-debut1.js — LE FILM DU DÉBUT DE L'ENQUÊTE 1, « La Lanterne d'Or » (Bible §13.69).
   Romain (18 novembre, à la voix) : « au début de l'enquête 1, avec la lanterne qui a disparu, le maire qui apparaît » ; « une petite
   cinématique où il y a quelqu'un, une silhouette qu'on voit pas très bien, prendre la lanterne et courir » ; « c'est Tim, qui court
   après son chien ».

   Ce que dit le jeu (e1.js) : la Lanterne d'Or dort dans le bureau du maire, à la mairie ; la nuit avant la fête, quelqu'un l'a prise ;
   la fenêtre du bureau a été ouverte depuis dehors ; une lumière dorée a filé dans la nuit. QUI ? C'est toute l'enquête : six suspects.
   Le film ne doit donc RIEN dire de plus que la lettre du maire :
   — la silhouette est une ombre floue derrière la vitre, puis un bras noir, puis une petite ombre vue de dos, de loin, dans la brume :
     ni sa taille, ni son âge, ni ses habits ne se lisent (pas d'écharpe, pas de casquette, pas de suie) ;
   — pas de chien, pas d'aboiement, pas de toits : ce sont des indices de l'enquête (Odette, le Sage, l'affiche) ;
   — on ne voit pas vers où part la lumière : elle se perd dans la brume, au bout de la place.
   Le film ne ment pas non plus : la silhouette n'a rien d'un bandit, elle est vive et légère.

   Huit plans, 40 secondes. Le plateau : plateau-village.js (les coins 'bureau', 'foule' — de nuit — et 'place').
   LA TÊTE DU MAIRE QUI TOURNE (plan 8) : trois dessins (de face, de trois quarts, de profil : gens-debut.js, GD.teteMaire), jamais un
   pantin qu'on fait pivoter (Romain : « pas de fausse 3D […] comme Mimi »). */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, FV = window.CFXV, FC = window.CFXC, PV = window.PLATEAU_VILLAGE, GD = window.GensDebut, G = window.Gens, O = CINE.O, cligne = O.cligne, parle = O.parle, D = CINE.DEB;
var XB = PV.X.bureau, XF = PV.X.foule, XP = PV.X.place, W = 1440, H = 616, P = 1600, NOIR = '#1a0e08';

/* ---------------------------------------------------------------- LE DÉROULÉ (en secondes) */
var T1 = 6.2, T2 = 10.4, T3 = 15.2, T4 = 19.8, T5 = 24.4, T6 = 28.8, T7 = 32.6, TITRE = 37.0, T = 40.2;
/* (des enfants lisent : six mots au plus par réplique, et chacune reste au moins 1,2 s + 0,3 s par mot) */
var LIGNES = [[29.5, 32.55, 'La Lanterne d\'Or… Elle a disparu !', 'Le maire'], [34.7, 36.95, 'C\'est une catastrophe !', 'Le maire']];
function defs(){ return FV.defs() + FC.defs(); }

/* ---------------------------------------------------------------- LE BUREAU : où sont les choses */
var DESK = {x:XB + 40, z0:-340, z1:40, h:300, L:520}, LAN = {x:XB + 40, y:-352, z:-150};
var NUIT = [40, 52, 100], NCLIP = 0, BLANC = [255, 255, 255];
/* ce qu'on voit dehors, par la fenêtre (les toits d'en face, la brume) : assombri à la main (k : 0 la nuit → 1 le jour) */
function dehors(k){ var b = 'brightness(' + U.r(U.lerp(.2, 1, k)) + ') saturate(' + U.r(U.lerp(.7, 1, k)) + ')'; return {toits:{teinte:b}, toits2:{teinte:b}, brumeRue:{teinte:b, op:U.lerp(.5, 1, k)}, brumeRue2:{teinte:b, op:U.lerp(.5, 1, k)}, collines1:{teinte:b}}; }
var CIEL_NUIT = {haut:[5, 9, 28], milieu:[13, 23, 56], bas:[28, 44, 92], etoiles:1, nuages:{c1:[36, 46, 86], c2:[70, 86, 132], k:.55, vit:4}};
function cielNuit(az, alt, plus){ return U.melange(U.melange(CIEL_NUIT, {astre:{az:az, alt:alt, r:.03, c:[238, 242, 255], halo:[150, 176, 236], k:1, lune:true}, lueur:{az:az, c:[60, 80, 150], k:.5, l:.6, h:.3}}, 1), plus || {}, 1); }
function Bq(){ return PV.BUREAU; }
/* le meuble : son dessus (en perspective) et sa face ; le sous-main de cuir vert */
function bureauMeuble(x, z0, z1){
  return {type:'libre', x:x, y:0, z:z1, boite:[DESK.L + 40, DESK.h + 40], dessin:function(p){
    function q(a, b, c){ var r = CAM.projeter(a, b, c); return U.r(r.x) + ',' + U.r(r.y); }
    var L = DESK.L, y = -DESK.h - 16, s = '<linearGradient id="gdDessus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4426"/><stop offset="1" stop-color="#9a6a3e"/></linearGradient>';
    s += '<polygon points="' + q(x - L - 22, y, z0 - 20) + ' ' + q(x + L + 22, y, z0 - 20) + ' ' + q(x + L + 22, y, z1 + 4) + ' ' + q(x - L - 22, y, z1 + 4) + '" fill="url(#gdDessus)" stroke="' + NOIR + '" stroke-width="' + U.r(Math.max(1, 3 * p.s)) + '" stroke-linejoin="round"/>' +
      '<polygon points="' + q(x - L + 90, y, z0 + 36) + ' ' + q(x + L - 90, y, z0 + 36) + ' ' + q(x + L - 90, y, z1 - 50) + ' ' + q(x - L + 90, y, z1 - 50) + '" fill="#2f5a4e" stroke="#c8a040" stroke-width="' + U.r(Math.max(.8, 3 * p.s)) + '"/>';
    return s + '<g transform="translate(' + U.r(p.x) + ' ' + U.r(p.y) + ') scale(' + U.r(p.s * 1000) / 1000 + ')">' + GD.bureauFace(L, DESK.h) + '</g>';
  }};
}
/* ce qui est posé sur le bureau : le coussin (et la Lanterne), l'encrier, les papiers */
function surBureau(t, x, z, o){
  o = o || {};
  var L = [D.libre(x, -316, z, GD.coussin(!o.lanterne), [200, 200]), D.libre(x - 330, -316, z + 70, GD.encrier(), [160, 300]), D.libre(x + 340, -316, z + 90, GD.papiers(), [160, 80])];
  if(o.lanterne) L.push(D.libre(o.lx == null ? x : o.lx, o.ly == null ? LAN.y : o.ly, (o.lz == null ? z : o.lz) + 2, GD.lanterneOr(o.lanterne, t), [110, 320]));
  return L;
}
/* les deux battants de la fenêtre (ils s'ouvrent vers nous : ang, en degrés) ; reflet : la Lanterne se reflète dans les vitres (0 → 1) */
function battants(ang, reflet){
  var F = Bq().fenetre, zw = Bq().z + 4, w = (F.x1 - F.x0) / 2;
  return {type:'libre', x:(F.x0 + F.x1) / 2, y:F.y1, z:zw + (ang > 8 ? 44 : 0), boite:[w * 2 + 400, 1200], dessin:function(p){
    var s = '', e = Math.max(1.2, 13 * p.s);
    [[-1, F.x0], [1, F.x1]].forEach(function(qq){
      var sg = qq[0], xh = qq[1], a = U.rad(ang), xe = xh - sg * w * Math.cos(a), ze = zw + w * Math.sin(a);
      var A = CAM.projeter(xh, F.y0, zw), B2 = CAM.projeter(xe, F.y0, ze), C = CAM.projeter(xe, F.y1, ze), Dd = CAM.projeter(xh, F.y1, zw);
      function pt(u, v){ var x1 = A.x + (B2.x - A.x) * u, y1 = A.y + (B2.y - A.y) * u, x2 = Dd.x + (C.x - Dd.x) * u, y2 = Dd.y + (C.y - Dd.y) * u; return U.r(x1 + (x2 - x1) * v) + ' ' + U.r(y1 + (y2 - y1) * v); }
      s += '<polygon points="' + pt(0, 0) + ' ' + pt(1, 0) + ' ' + pt(1, 1) + ' ' + pt(0, 1) + '" fill="#9ab4e0" opacity=".1"/><polygon points="' + pt(.12, .04) + ' ' + pt(.4, .04) + ' ' + pt(.2, .96) + ' ' + pt(-.08 + .1, .96) + '" fill="#dce8ff" opacity=".1"/>';
      if(reflet > 0) s += '<polygon points="' + pt(.5, .5) + ' ' + pt(.86, .56) + ' ' + pt(.8, .9) + ' ' + pt(.46, .86) + '" fill="#ffc860" opacity="' + U.r(.22 * reflet) + '" filter="url(#fl10)"/>';
      var cadre = 'M' + pt(0, 0) + ' L ' + pt(1, 0) + ' L ' + pt(1, 1) + ' L ' + pt(0, 1) + ' Z M' + pt(0, .34) + ' L ' + pt(1, .34) + ' M' + pt(0, .67) + ' L ' + pt(1, .67) + ' M' + pt(.5, 0) + ' L ' + pt(.5, 1);
      s += '<path d="' + cadre + '" fill="none" stroke="' + NOIR + '" stroke-width="' + U.r(e + 3) + '" stroke-linejoin="round"/><path d="' + cadre + '" fill="none" stroke="#d8ccb0" stroke-width="' + U.r(e) + '" stroke-linejoin="round"/>';
    });
    return s;
  }};
}
/* les deux rideaux de velours, de chaque côté ; vent : ils se soulèvent (0 → 1) */
function rideaux(t, vent){
  var F = Bq().fenetre, yh = F.y0 - 110, z = Bq().z + 34;
  return {type:'libre', x:(F.x0 + F.x1) / 2, y:0, z:z, boite:[700, 1900], dessin:function(p){
    var s = p.s, r = '';
    function X(x){ return U.r(p.x + (x - (F.x0 + F.x1) / 2) * s); } function Y(y){ return U.r(p.y + y * s); }
    r += '<rect x="' + X(F.x0 - 300) + '" y="' + Y(yh - 16) + '" width="' + U.r((F.x1 - F.x0 + 600) * s) + '" height="' + U.r(26 * s) + '" rx="' + U.r(10 * s) + '" fill="#c8a040" stroke="' + NOIR + '" stroke-width="' + U.r(Math.max(1, 3 * s)) + '"/>';
    [[-1, F.x0 - 230, F.x0 + 30], [1, F.x1 - 30, F.x1 + 230]].forEach(function(q, i){
      var sg = q[0], xa = q[1], xb = q[2], n = 7, d = 'M' + X(xa) + ' ' + Y(yh), bas = [];
      for(var k = 0; k <= n; k++){ var u = k / n, x = U.lerp(xa, xb, u), dedans = sg < 0 ? u : 1 - u, sou = vent * dedans * (120 + 60 * Math.sin(t * 2.4 + k + i)) + Math.sin(t * 1.1 + k * 1.3 + i * 2) * 8;
        bas.push([x - sg * sou * .9, -26 - sou * .5 + (k % 2 ? 0 : -14)]); }
      d += ' L ' + X(xb) + ' ' + Y(yh); bas.slice().reverse().forEach(function(b){ d += ' L ' + X(b[0]) + ' ' + Y(b[1]); }); d += ' Z';
      r += '<path d="' + d + '" fill="url(#gdVelours)" stroke="' + NOIR + '" stroke-width="' + U.r(Math.max(1, 3 * s)) + '" stroke-linejoin="round"/><path d="' + d + '" fill="url(#tx_cotes)" opacity=".8"/>';
      for(k = 1; k < n; k++){ var x0 = U.lerp(xa, xb, k / n); r += '<path d="M' + X(x0) + ' ' + Y(yh + 16) + ' L ' + X(bas[k][0]) + ' ' + Y(bas[k][1]) + '" stroke="' + (k % 2 ? '#4a0a14' : '#e88a94') + '" stroke-width="' + U.r(Math.max(.8, (k % 2 ? 7 : 4) * s)) + '" opacity="' + (k % 2 ? .5 : .28) + '"/>'; }
    });
    return r;
  }};
}
function pendule(t, h){ return D.libre(XB + 1045, -1060, Bq().z + 10, GD.pendule(h, Math.sin(t * Math.PI) * 9), [160, 420], {relief:'Nuit'}); }
/* tout le bureau, vu vers la fenêtre : o = {lanterne (sa lueur), lx, ly, lz (elle bouge), ang (la fenêtre), vent, heure, reflet} */
function decorBureau(t, o){
  return [battants(o.ang || 0, o.reflet == null ? (o.lanterne ? 1 : 0) : o.reflet), rideaux(t, o.vent || 0), pendule(t, o.heure == null ? 0 : o.heure), bureauMeuble(DESK.x, DESK.z0, DESK.z1)].concat(surBureau(t, LAN.x, LAN.z, o));
}
/* LA CARTE DES LUMIÈRES DU BUREAU : la lune par la fenêtre (une tache sur le plancher), la Lanterne (o.lan : {x, y, z, k}), le matin (o.jour) */
function lampesBureau(t, o){
  var F = Bq().fenetre, zw = Bq().z, s = '', L = o.lan, amb = o.amb || NUIT, pw = CAM.projeter((F.x0 + F.x1) / 2, (F.y0 + F.y1) / 2, zw), fw = Math.min(14, CAM.flou(pw.d) * .6);
  /* 1. la Lanterne éclaire le mur et les rideaux derrière elle, et le dessus du bureau */
  if(L && L.k > 0){
    var bat = .95 + .05 * Math.sin(t * 2.1) + .03 * Math.sin(t * 5.3);
    s += FV.rondMonde(L.x + 60, -700, zw, 1150, [255, 176, 96], .5 * L.k * bat) + FV.rondSol(L.x, L.z + 40, 760, 420, [255, 214, 150], .9 * L.k * bat, -316);
  }
  /* 2. le matin : le mur s'éclaire autour de la fenêtre */
  if(o.jour > 0) s += FV.rondMonde((F.x0 + F.x1) / 2, -900, zw, 2600, [255, 244, 220], .5 * o.jour);
  /* 3. LE CIEL, dans la fenêtre, ne prend la lumière de personne et ne s'assombrit pas : la carte y est blanche (E.cielAmbiance : le ciel
     est peint tel quel ; les toits d'en face, eux, sont assombris par leur teinte : dehors()) */
  s += FV.forme([[F.x0 + 34, F.y0, zw], [F.x1 - 34, F.y0, zw], [F.x1 - 34, F.y1, zw], [F.x0 + 34, F.y1, zw]], BLANC, 1, fw);
  /* 4. la lune entre par la fenêtre : deux rectangles de biais, sur le plancher et sur le bureau (le montant du milieu fait la croix) */
  if(o.lune > 0){
    [[F.x0, (F.x0 + F.x1) / 2 - 14], [(F.x0 + F.x1) / 2 + 14, F.x1]].forEach(function(q){
      s += FV.forme([[q[0] - 150, 0, -700], [q[1] - 150, 0, -700], [q[1] - 620, 0, 560], [q[0] - 620, 0, 560]], [150, 174, 240], .62 * o.lune, 9) +
        FV.forme([[q[0] - 300, -316, DESK.z0], [q[1] - 300, -316, DESK.z0], [q[1] - 420, -316, DESK.z1], [q[0] - 420, -316, DESK.z1]], [150, 174, 240], .5 * o.lune, 6); });
    /* le bord des rideaux et l'appui, bleutés */
    s += FV.forme([[F.x0 + 40, F.y1 - 4, zw + 40], [F.x1 - 40, F.y1 - 4, zw + 40], [F.x1 - 40, F.y1 + 60, zw + 40], [F.x0 + 40, F.y1 + 60, zw + 40]], [150, 174, 240], .5 * o.lune, 8) + FV.rondMonde(LAN.x - 40, -370, LAN.z, 420, [150, 174, 240], .5 * o.lune);
  }
  if(o.jour > 0){
    /* le soleil du matin entre par la fenêtre : une grande tache dorée sur le plancher et sur le bureau */
    [[F.x0, (F.x0 + F.x1) / 2 - 14], [(F.x0 + F.x1) / 2 + 14, F.x1]].forEach(function(q){ s += FV.forme([[q[0] - 60, 0, -720], [q[1] - 60, 0, -720], [q[1] - 420 - o.jour * 240, 0, 760], [q[0] - 420 - o.jour * 240, 0, 760]], [255, 240, 200], .8 * o.jour, 8); });
    s += FV.rondSol(DESK.x - 80, -150, 700, 300, [255, 242, 206], .8 * o.jour, -316);
  }
  /* 5. la Lanterne elle-même : elle brille (un rond plein, juste sur elle) */
  if(L && L.k > 0){ var pl = CAM.projeter(L.x, L.y - 150, L.z); if(pl.d > 30) s += FV.rond(pl.x, pl.y, 100 * pl.s, 225 * pl.s, [255, 248, 224], Math.min(1, L.k * 1.2), true); }
  return s;
}
/* la lueur de la Lanterne dans l'air (la couche des lumières) : un grand halo doré, un cœur, des poussières d'or qui montent */
function lueurLanterne(t, x, y, z, k){
  if(!(k > 0)) return '';
  var p = CAM.projeter(x, y - 106, z), f = CAM.flou(p.d), bat = .94 + .06 * Math.sin(t * 2.1) + .03 * Math.sin(t * 5.3), s = '';
  s += '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(520 * p.s * bat + f * 2) + '" fill="url(#orHalo)" opacity="' + U.r(.5 * k) + '"/><circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(150 * p.s * bat + f * 1.5) + '" fill="url(#orHalo)" opacity="' + U.r(.6 * k) + '"/>';
  if(f < 4) s += '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(46 * p.s * bat) + '" fill="url(#orCoeur)" opacity="' + U.r(.9 * k) + '"/>';
  else s += '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(f * 1.3 + 20 * p.s) + '" fill="url(#bokehOr)" opacity="' + U.r(U.clamp(1.2 / (1 + f / 12), .25, 1) * k) + '"/>';
  /* les quatre branches d'une étoile, très fines (l'objectif) */
  s += '<path d="M' + U.r(p.x - 100 * p.s * k) + ' ' + U.r(p.y) + ' H ' + U.r(p.x + 100 * p.s * k) + ' M' + U.r(p.x) + ' ' + U.r(p.y - 60 * p.s * k) + ' V ' + U.r(p.y + 60 * p.s * k) + '" stroke="#fff2c0" stroke-width="' + U.r(Math.max(.8, 2 * p.s)) + '" opacity="' + U.r(.28 * k * bat) + '" filter="url(#fl3)"/>';
  var R = U.hasard(77);
  for(var i = 0; i < 16; i++){ var per = 2.4 + R() * 2, a = ((t + R() * per) % per) / per, q = CAM.projeter(x + (R() - .5) * 150 + Math.sin(t * 1.3 + i) * 20, y - 60 - a * 300, z + (R() - .5) * 60);
    s += '<circle cx="' + U.r(q.x) + '" cy="' + U.r(q.y) + '" r="' + U.r(Math.max(.7, 2.4 * q.s)) + '" fill="#ffe9a0" opacity="' + U.r(Math.sin(a * Math.PI) * .8 * k) + '"/>'; }
  return s;
}

/* ================================================================ 1. LA LANTERNE (0 → 6,2 s) : la nuit, le bureau du maire ; la caméra s'approche d'elle */
function plan1(t){
  var k = U.tresLisse(t / T1), cam = {x:XB + U.lerp(230, 90, k), y:U.lerp(-700, -476, k), z:U.lerp(2300, 720, k), tangage:U.lerp(.015, 0, k), focus:U.lerp(2450, 870, k), ouverture:U.lerp(.6, 1.3, k)};
  return {zone:'bureau', cam:cam, acteurs:decorBureau(t, {lanterne:1, heure:.6}), portee:.5, poussiere:0, ambiance:NUIT, cielAmbiance:BLANC, plans:dehors(0), ciel:cielNuit(.085, .15),
    lampes:function(){ return lampesBureau(t, {lune:1, lan:{x:LAN.x, y:LAN.y, z:LAN.z, k:1}}); },
    lumieres:function(){ return lueurLanterne(t, LAN.x, LAN.y, LAN.z, 1) + FV.poussiere(t, [XB - 700, -1300, -700, XB + 500, -40, 600], 70, 17, '#bcd0ff', .5); }};
}

/* ================================================================ 2. LA FENÊTRE (6,2 → 10,4 s) : derrière la vitre, une ombre ; la fenêtre s'ouvre */
function ombreFenetre(t, a){
  /* quelqu'un monte derrière la vitre : une tête et des épaules, noires sur le ciel ; puis une main se pose sur le montant */
  var F = Bq().fenetre, monte = U.COURBES.o(U.clamp((a - .3) / 1.0, 0, 1)), y = F.y1 + 30 + (1 - monte) * 330 + Math.sin(t * 2.3) * 6, x = (F.x0 + F.x1) / 2 - 30 + Math.sin(t * 1.1) * 10;
  var zw = Bq().z;
  return {type:'libre', x:x, y:y, z:zw - 70, boite:[300, 300], flouPlus:3, dessin:function(p){
    var id = 'csil' + (++NCLIP), pts = [[F.x0, F.y0], [F.x1, F.y0], [F.x1, F.y1], [F.x0, F.y1]].map(function(q){ var pp = CAM.projeter(q[0], q[1], zw); return U.r(pp.x) + ',' + U.r(pp.y); }).join(' ');
    return '<clipPath id="' + id + '"><polygon points="' + pts + '"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(' + U.r(p.x) + ' ' + U.r(p.y) + ') scale(' + U.r(p.s * 1000) / 1000 + ')"><path d="M-150 60 L -150 20 C -150 -70 -90 -120 -46 -128 C -62 -150 -62 -206 0 -212 C 62 -206 62 -150 46 -128 C 90 -120 150 -70 150 20 L 150 60 Z" fill="#05060e"/></g></g>'; }};
}
function plan2(t){
  var a = t - T1, k = U.lisse(a / (T2 - T1));
  var cam = {x:XB + U.lerp(300, 250, k), y:U.lerp(-430, -450, k), z:U.lerp(840, 760, k), tangage:U.lerp(.13, .16, k), focus:U.piste([[0, 980], [.9, 980], [2.0, 1600, 'io'], [9, 1600]])(a), ouverture:1.25};
  var ouvre = U.tresLisse(U.clamp((a - 2.0) / 1.5, 0, 1)), vent = U.lisse(U.clamp((a - 2.4) / 1.0, 0, 1));
  var A = decorBureau(t, {lanterne:1, heure:.62, ang:ouvre * 66, vent:vent * .8}).concat([ombreFenetre(t, a)]);
  /* le courant d'air : la lueur de la Lanterne frémit */
  var fr = 1 - .18 * vent * (.5 + .5 * Math.sin(t * 13));
  return {zone:'bureau', cam:cam, acteurs:A, portee:.6, poussiere:0, ambiance:NUIT, cielAmbiance:BLANC, plans:dehors(0), ciel:cielNuit(.085, .15),
    lampes:function(){ return lampesBureau(t, {lune:1 + ouvre * .3, lan:{x:LAN.x, y:LAN.y, z:LAN.z, k:fr}}); },
    lumieres:function(){ return lueurLanterne(t, LAN.x, LAN.y, LAN.z, fr) + FV.poussiere(t, [XB - 500, -1300, -760, XB + 700, -300, 300], 60, 17, '#bcd0ff', .5 + vent * .4); }};
}

/* ================================================================ 3. LA MAIN (10,4 → 15,2 s) : un bras noir, la Lanterne s'en va ; le bureau retombe dans le bleu de la nuit */
function plan3(t){
  var a = t - T2, k = U.lisse(a / (T3 - T2));
  var F = Bq().fenetre;
  /* la main arrive (0 → 0,9), se ferme sur l'anneau, soulève (1,2 → 1,9), emporte vers la fenêtre (1,9 → 3,3) */
  var arrive = U.COURBES.o(U.clamp(a / .9, 0, 1)), leve = U.tresLisse(U.clamp((a - 1.2) / .7, 0, 1)), part = U.tresLisse(U.clamp((a - 1.9) / 1.5, 0, 1));
  var lx = LAN.x + part * (F.x0 + 330 - LAN.x), ly = LAN.y - leve * 90 - part * 560 + Math.sin(a * 7) * 10 * part * (1 - part), lz = LAN.z + part * (Bq().z + 60 - LAN.z);
  var mx = lx + (1 - arrive) * 560, my = ly - 268 - (1 - arrive) * 420;
  var cam = {x:XB + U.lerp(110, 60, k), y:U.lerp(-520, -440, k), z:U.lerp(640, 560, k), tangage:.02, focus:U.lerp(800, 720, k), ouverture:1.3};
  var kl = 1 - U.clamp((a - 3.0) / .6, 0, 1), dedans = a < 3.5;
  var A = decorBureau(t, {lanterne:dedans ? Math.max(.3, kl) : 0, lx:lx, ly:ly, lz:lz, heure:.64, ang:66, vent:.5, reflet:kl});
  if(a < 3.6) A.push(D.libre(mx, my, lz + 4, GD.brasOmbre(F.x0 + 600 - mx, F.y1 - 300 - my), [900, 900]));
  var creux = a > 1.25;
  if(creux){ A = A.filter(function(q){ return true; }); A.push(D.libre(LAN.x, -316, LAN.z + 1, GD.coussin(true), [200, 200])); }
  /* à la place de la Lanterne, un peu de poussière d'or qui retombe */
  return {zone:'bureau', cam:cam, acteurs:A, portee:.6, poussiere:0, ambiance:NUIT, cielAmbiance:BLANC, plans:dehors(0), ciel:cielNuit(.085, .15),
    /* (la Lanterne partie, les yeux s'habituent : la lune suffit à voir le coussin vide) */
    lampes:function(){ return lampesBureau(t, {lune:1.2, lan:dedans ? {x:lx, y:ly, z:lz, k:kl} : null}) + FV.rondMonde(LAN.x, -350, LAN.z, 560, [206, 218, 255], .85 * (1 - kl)) + FV.rondSol(LAN.x, LAN.z + 40, 700, 380, [190, 206, 255], .7 * (1 - kl), -316); },
    lumieres:function(){ var s = dedans ? lueurLanterne(t, lx, ly, lz, kl) : '';
      if(creux){ var R = U.hasard(131), b = a - 1.25; for(var i = 0; i < 26; i++){ var dv = R() * 2.4, c = b - dv * .4; if(c < 0 || c > 2.6) continue; var q = CAM.projeter(LAN.x + (R() - .5) * 190, LAN.y - 220 * (1 - c / 2.6) - R() * 60, LAN.z + (R() - .5) * 80); s += '<circle cx="' + U.r(q.x) + '" cy="' + U.r(q.y) + '" r="' + U.r(Math.max(.8, 3 * q.s * (1 - c / 2.6))) + '" fill="#ffe9a0" opacity="' + U.r(.9 * (1 - c / 2.6)) + '"/>'; } }
      return s + FV.poussiere(t, [XB - 500, -1300, -760, XB + 700, -300, 300], 50, 17, '#bcd0ff', .7); }};
}

/* ================================================================ 4. LA LUMIÈRE S'EN VA (15,2 → 19,8 s) : la place, la nuit, vue d'en haut ; une ombre court, la brume l'avale */
var FEN_NUIT = null;
function plan4(t){
  var a = t - T3, d = T4 - T3, k = U.lisse(a / d);
  /* la caméra est basse, au ras des pavés : au bout de la place, la rue s'ouvre entre les maisons — la lune est juste là, et la brume */
  var cam = {x:XF + U.lerp(330, 210, k), y:U.lerp(-560, -640, k), z:U.lerp(1900, 1650, k), tangage:U.lerp(.05, .035, k), ouverture:.7};
  /* elle traverse la place en courant, droit vers la rue ; elle a déjà de l'avance quand le plan commence */
  var u = U.clamp((a + .2) / (d - .5), 0, 1), x = XF + U.lerp(150, -250, U.lisse(u)) + Math.sin(a * 2.2) * 26, z = U.lerp(-1250, -5500, Math.pow(u, 1.1));
  var brume = U.clamp((z + 3300) / -1900, 0, 1), kl = 1 - brume * brume * .97;
  cam.focus = cam.z - z;
  var A = [D.libre(x, 0, z, GD.coureur(t * 15), [80, 460], {op:1 - brume * .92, flouPlus:2.4 + brume * 7})];
  if(!FEN_NUIT){ var Fq = (PV.FEN.foule || []).filter(function(f){ return f.z < -5000 && f.y > -2300; });
    function pres(cx){ var m = null; Fq.forEach(function(f){ if(!m || Math.abs(f.x - cx) < Math.abs(m.x - cx)) m = f; }); return m; }
    FEN_NUIT = [pres(XF - 1900), pres(XF + 2500)].filter(Boolean); }
  var gx = XF - 250;
  return {zone:'foule', cam:cam, acteurs:A, portee:.8, poussiere:0, ambiance:[30, 40, 84], ciel:cielNuit(-.085, .1), plans:{brume:{op:1}, brumeRue:{op:1}},
    sol:function(){
      /* l'ombre de celui qui court : longue, vers nous (la lumière est devant lui) */
      var p0 = CAM.projeter(x, 0, z), p1 = CAM.projeter(x + (x - gx) * .3 - 90, 0, z + 1100), p2 = CAM.projeter(x + (x - gx) * .3 + 90, 0, z + 1100);
      return '<polygon points="' + U.r(p0.x - 22 * p0.s) + ',' + U.r(p0.y) + ' ' + U.r(p0.x + 22 * p0.s) + ',' + U.r(p0.y) + ' ' + U.r(p2.x) + ',' + U.r(p2.y) + ' ' + U.r(p1.x) + ',' + U.r(p1.y) + '" fill="#02030a" opacity="' + U.r(.6 * kl) + '" filter="url(#fl5)"/>'; },
    lampes:function(){
      /* la lune éclaire les pavés (une grande nappe froide, au fond) ; la lueur d'or court sur le sol avec celui qui la porte */
      var s = FV.rondSol(gx, -3600, 2600, 2400, [96, 120, 200], .5) + FV.rondSol(x, z - 200, 1250, 1000, [255, 200, 124], .95 * kl) + FV.rondMonde(x, -260, z - 40, 520, [255, 224, 170], .9 * kl);
      FEN_NUIT.forEach(function(f){ s += FV.rondMonde(f.x, f.y, f.z, 300, [255, 190, 110], .95, true); });
      if(PV.ASTRE){ var As = PV.ASTRE; s += FV.rond(As.x, As.y, As.r * 12, As.r * 9, [110, 140, 230], .6) + FV.rond(As.x, As.y, As.r * 1.36, As.r * 1.36, [255, 255, 255], 1, true); }
      return s; },
    lumieres:function(){
      var s = lueurLanterne(t, x, -150, z - 70, kl * .9), pg = CAM.projeter(gx, -500, -5200);
      /* la brume, au bout de la place : elle prend la lumière de la lune — et, un instant, celle de la Lanterne */
      s += FV.rond(pg.x, pg.y, 3000 * pg.s, 800 * pg.s, [150, 176, 236], .42) + FV.rond(pg.x, pg.y + 260 * pg.s, 5200 * pg.s, 420 * pg.s, [150, 176, 236], .3);
      if(brume > 0){ var pb = CAM.projeter(x, -260, z); s += '<ellipse cx="' + U.r(pb.x) + '" cy="' + U.r(pb.y) + '" rx="' + U.r(900 * pb.s) + '" ry="' + U.r(600 * pb.s) + '" fill="url(#orHalo)" opacity="' + U.r(Math.sin(Math.min(1, brume * 1.15) * Math.PI) * .75) + '" filter="url(#fl14)"/>'; }
      FEN_NUIT.forEach(function(f, i){ s += FC.lumiere(t, f.x, f.y, f.z + 6, {sorte:'Chaud', r:300, coeur:50, k:.7, graine:11 + i}); });
      return s + FV.poussiere(t, [XF - 2500, -1500, -4000, XF + 2500, -60, 800], 70, 23, '#bcd0ff', .5); }};
}

/* ================================================================ 5. LA NUIT PASSE (19,8 → 24,4 s) : le coussin vide ; la lune se couche, le jour se lève, la pendule tourne */
var C5 = {haut:FV.couleur([[0, [5, 9, 28]], [.5, [22, 30, 76]], [.74, [80, 110, 170]], [1, [70, 126, 210]]]), milieu:FV.couleur([[0, [13, 23, 56]], [.5, [100, 76, 124]], [.74, [232, 170, 150]], [1, [150, 190, 232]]]),
  bas:FV.couleur([[0, [28, 44, 92]], [.5, [236, 124, 92]], [.74, [255, 206, 140]], [1, [236, 226, 214]]]), amb:FV.couleur([[0, NUIT], [.5, [70, 66, 110]], [.74, [214, 180, 168]], [1, [255, 238, 214]]]),
  n1:FV.couleur([[0, [36, 46, 86]], [.5, [80, 66, 112]], [.74, [178, 146, 180]], [1, [255, 255, 255]]]), n2:FV.couleur([[0, [70, 86, 132]], [.5, [255, 140, 108]], [.74, [255, 182, 130]], [1, [236, 240, 248]]])};
function plan5(t){
  var a = t - T4, h = U.lisse(U.clamp((a - .3) / (T5 - T4 - .9), 0, 1)), k = a / (T5 - T4);
  var cam = {x:XB + U.lerp(230, 200, k), y:U.lerp(-700, -680, k), z:U.lerp(2300, 2050, k), tangage:.015, focus:2400, ouverture:.6};
  var jour = U.clamp((h - .72) / .28, 0, 1), soleilAlt = U.lerp(-.04, .15, U.clamp((h - .6) / .4, 0, 1));
  var ciel = {haut:C5.haut(h), milieu:C5.milieu(h), bas:C5.bas(h), etoiles:U.clamp(1 - h * 2, 0, 1), nuages:{c1:C5.n1(h), c2:C5.n2(h), k:.7, vit:90},
    lueur:{az:.045, c:h < .5 ? [60, 80, 150] : [255, 214, 150], k:h < .4 ? .4 : U.lerp(.4, .95, U.clamp((h - .4) / .3, 0, 1)), l:.7, h:.3},
    astre:h < .56 ? {az:U.lerp(.085, -.03, h / .56), alt:U.lerp(.15, .0, h / .56), r:.03, c:[238, 242, 255], halo:[150, 176, 236], k:U.clamp((.56 - h) * 6, 0, 1), lune:true} : {az:.045, alt:soleilAlt, r:.026, c:[255, 252, 232], halo:[255, 214, 140], k:1}};
  var F = Bq().fenetre;
  return {zone:'bureau', cam:cam, acteurs:decorBureau(t, {lanterne:0, heure:U.lerp(.66, 7.2, h), ang:66, vent:.25 + .2 * Math.sin(t * 1.3)}), portee:.4, poussiere:0, ambiance:C5.amb(h), cielAmbiance:BLANC, plans:dehors(U.clamp((h - .35) / .5, 0, 1)), ciel:ciel,
    lampes:function(){ return lampesBureau(t, {amb:C5.amb(h), lune:U.clamp(1.1 - h * 2.4, 0, 1.1), jour:jour}); },
    lumieres:function(){
      /* les rayons du matin : de grands pinceaux dorés, de la fenêtre jusqu'au plancher ; la poussière y danse */
      var s = '';
      if(jour > 0){ [[F.x0 + 20, F.x0 + 290], [F.x0 + 350, F.x1 - 20]].forEach(function(q, i){ var A = CAM.projeter(q[0], F.y0 + 80, Bq().z), B2 = CAM.projeter(q[1], F.y0 + 80, Bq().z), C = CAM.projeter(q[1] - 520, -10, 700), Dd = CAM.projeter(q[0] - 520, -10, 700);
          s += '<polygon points="' + U.r(A.x) + ',' + U.r(A.y) + ' ' + U.r(B2.x) + ',' + U.r(B2.y) + ' ' + U.r(C.x) + ',' + U.r(C.y) + ' ' + U.r(Dd.x) + ',' + U.r(Dd.y) + '" fill="#ffe2a8" opacity="' + U.r(.2 * jour * (.85 + .15 * Math.sin(t * 2 + i))) + '" filter="url(#fl14)"/>'; });
        s += FV.poussiere(t, [XB - 500, -1300, -700, XB + 600, -200, 500], 110, 29, '#fff0c0', jour); }
      return s + FV.poussiere(t, [XB - 500, -1300, -760, XB + 700, -300, 300], 40, 17, '#bcd0ff', .6 * (1 - jour)); }};
}

/* ================================================================ 6. LE MAIRE ENTRE (24,4 → 28,8 s) : contrechamp — la porte, vue de derrière le bureau */
var PX = XB - 1568;   /* le milieu de la porte ; le bureau est maintenant entre elle et nous */
function porteBureau(ang){
  var Pp = Bq().porte, zw = Bq().z + 4, w = Pp.x1 - Pp.x0;
  return {type:'libre', x:(Pp.x0 + Pp.x1) / 2, y:0, z:zw, boite:[w + 300, 1500], dessin:function(p){
    var a = U.rad(ang), xe = Pp.x0 + w * Math.cos(a), ze = zw + w * Math.sin(a);
    var A = CAM.projeter(Pp.x0, Pp.y0, zw), B2 = CAM.projeter(xe, Pp.y0, ze), C = CAM.projeter(xe, 0, ze), Dd = CAM.projeter(Pp.x0, 0, zw);
    function pt(u, v){ var x1 = A.x + (B2.x - A.x) * u, y1 = A.y + (B2.y - A.y) * u, x2 = Dd.x + (C.x - Dd.x) * u, y2 = Dd.y + (C.y - Dd.y) * u; return U.r(x1 + (x2 - x1) * v) + ' ' + U.r(y1 + (y2 - y1) * v); }
    var s = '<polygon points="' + pt(0, 0) + ' ' + pt(1, 0) + ' ' + pt(1, 1) + ' ' + pt(0, 1) + '" fill="#6a4628" stroke="' + NOIR + '" stroke-width="' + U.r(Math.max(1, 3 * p.s)) + '" stroke-linejoin="round"/><polygon points="' + pt(0, 0) + ' ' + pt(1, 0) + ' ' + pt(1, 1) + ' ' + pt(0, 1) + '" fill="url(#tx_bois)"/>';
    [[.12, .06, .88, .44], [.12, .5, .88, .94]].forEach(function(q){ s += '<polygon points="' + pt(q[0], q[1]) + ' ' + pt(q[2], q[1]) + ' ' + pt(q[2], q[3]) + ' ' + pt(q[0], q[3]) + '" fill="#5a3a20" stroke="#2a1a0c" stroke-width="' + U.r(Math.max(.8, 2.4 * p.s)) + '"/>'; });
    var bt = pt(.9, .52).split(' ');
    return s + '<circle cx="' + bt[0] + '" cy="' + bt[1] + '" r="' + U.r(Math.max(2, 13 * p.s)) + '" fill="url(#gdOr)" stroke="' + NOIR + '" stroke-width="' + U.r(Math.max(.6, 2 * p.s)) + '"/>';
  }};
}
var MATIN = [255, 238, 214];
function cielMatin(){ return {haut:[70, 126, 210], milieu:[150, 190, 232], bas:[236, 226, 214], etoiles:0, nuages:{c1:[255, 255, 255], c2:[236, 240, 248], k:.7, vit:5}}; }
function lampesMatin(t, plus){
  /* le soleil vient de la fenêtre, à droite : une nappe dorée sur le plancher ; le fond de la pièce reste doux */
  return FV.bain(W, 0, 0, 0, [180, 160, 170], 0, .35) + FV.forme([[PX + 500, 0, -700], [PX + 1500, 0, -700], [PX + 900, 0, 900], [PX - 100, 0, 900]], [255, 244, 210], .7, 12) + (plus || '');
}
function rayonsMatin(t){
  var A = CAM.projeter(PX + 1500, -1500, -700), B2 = CAM.projeter(PX + 2100, -1500, -700), C = CAM.projeter(PX + 500, 0, 600), Dd = CAM.projeter(PX - 200, 0, 600);
  return '<polygon points="' + U.r(A.x) + ',' + U.r(A.y) + ' ' + U.r(B2.x) + ',' + U.r(B2.y) + ' ' + U.r(C.x) + ',' + U.r(C.y) + ' ' + U.r(Dd.x) + ',' + U.r(Dd.y) + '" fill="#ffe6b0" opacity="' + U.r(.17 + .03 * Math.sin(t * 2)) + '" filter="url(#fl18)"/>' + FV.poussiere(t, [PX - 300, -1200, -600, PX + 1200, -100, 700], 90, 31, '#fff0c0', .9);
}
var MZ = -90;         /* où le maire s'arrête, derrière son bureau */
function plan6(t){
  var a = t - T5, k = U.lisse(a / (T6 - T5));
  var ouvre = U.tresLisse(U.clamp((a - .15) / .8, 0, 1)), marche = U.clamp((a - .8) / 1.9, 0, 1), z = U.lerp(Bq().z + 30, MZ, U.lisse(marche)), vu = U.lisse(U.clamp((a - 3.1) / .35, 0, 1));
  var dM = 0, cam = {x:PX + U.lerp(90, 30, k), y:U.lerp(-480, -466, k), z:U.lerp(1340, 1160, k), tangage:-.036, ouverture:1.2};
  dM = cam.z - z; cam.focus = U.lerp(dM, cam.z - 330, U.tresLisse(U.clamp((a - 3.35) / .7, 0, 1)));
  /* il entre en chantonnant, content de sa journée ; il arrive à son bureau… et il voit */
  var p = D.base('maire'); D.visage(p, {sourcils:{l:.3}, yeux:{o:.8}, bouche:{c:1, o:.12 + .1 * Math.abs(Math.sin(t * 6))}});
  if(marche > 0 && marche < 1){ D.pas(p, a * 2.5, 1); p.bD = {a:10 + Math.sin(a * 7.8) * 9, c:-14, l1:1, l2:1}; p.bG = {a:10 - Math.sin(a * 7.8) * 9, c:-14, l1:1, l2:1}; }
  p.tete.r = Math.sin(a * 3.9) * 5 * (1 - vu); p.tete.k = 16 * vu; p.v = U.melange(p.v, {yeux:{ly:.9 * vu, o:U.lerp(.8, 1.2, vu)}, bouche:{c:U.lerp(1, .5, vu), o:U.lerp(.14, 0, vu)}, sourcils:{l:U.lerp(.3, .7, vu)}}, 1);
  D.vivant(p, t, 21, {souffle:.5, regard:0});
  var A = [porteBureau(ouvre * 74)];
  if(a > .5) A.push(D.acteur(t, 'maire', PX, z, p, {gants:1}, 'face', {ombreOp:.45}));
  A = A.concat([bureauMeuble(PX, 250, 640)], [D.libre(PX, -316, 330, GD.coussin(true), [200, 200]), D.libre(PX - 330, -316, 400, GD.encrier(), [160, 300]), D.libre(PX + 340, -316, 420, GD.papiers(), [160, 80])]);
  return {zone:'bureau', cam:cam, acteurs:A, portee:.6, poussiere:0, ambiance:MATIN, ciel:cielMatin(), plans:{couloir:{teinte:'brightness(2.2)'}},
    lampes:function(){ return lampesMatin(t); }, lumieres:function(){ return rayonsMatin(t); }};
}

/* ================================================================ 7. SON VISAGE (28,8 → 32,6 s), en très gros plan : le sourire tombe — « La Lanterne d'Or… Elle a disparu ! » */
function plan7(t){
  var a = t - T6, k = U.lisse(a / (T7 - T6));
  var p = D.base('maire'), fige = U.clamp(a / .5, 0, 1), tombe = U.tresLisse(U.clamp((a - .45) / .7, 0, 1));
  /* le sourire reste accroché une demi-seconde, puis tout s'effondre : la bouche, les sourcils ; les yeux s'agrandissent */
  D.visage(p, {sourcils:{l:U.lerp(.5, 1, tombe), t:.6 * tombe, f:0}, yeux:{o:U.lerp(1.1, 1.5, tombe), ly:U.lerp(.8, .25, U.clamp((a - 1.3) / .4, 0, 1))}, bouche:{c:U.lerp(.9, -.75, tombe), o:U.lerp(0, .3, tombe)}});
  p.tete.k = U.lerp(16, 4, U.lisse(U.clamp((a - 1.3) / .5, 0, 1))); p.tete.x = Math.sin(t * 31) * 1.2 * tombe;
  var b = parle(t, LIGNES[0][0] + .05, LIGNES[0][1] - .5, 7); if(b) p.v = U.melange(p.v, {bouche:{o:b.o * 1.25, w:b.w - .1, c:-.6}}, 1);
  D.vivant(p, t, 21, {souffle:1.3, regard:0});
  var yeux = p.w[1] + G.D.maire.cou[1] - 62, z = U.lerp(370, 285, k), cam = {x:PX + U.lerp(-20, 6, k), y:yeux + .12 * H * z / P, z:MZ + z, focus:z, ouverture:1.5};
  var act = D.acteur(t, 'maire', PX, MZ, p, {gants:1}, 'face', {ombre:false});
  /* une goutte de sueur glisse sur sa tempe */
  var g = U.clamp((a - 1.5) / 1.6, 0, 1);
  act.plus = function(){ return g > 0 && g < 1 ? '<path d="M33 ' + U.r(yeux + 0 - 30 + g * 46 - 9) + ' c 5 7 5 12 0 14 c -5 -2 -5 -7 0 -14 Z" fill="#cfe6ff" stroke="#6a8ab0" stroke-width="1" opacity="' + U.r(Math.sin(g * Math.PI) * 1.4) + '"/>' : ''; };
  return {zone:'bureau', cam:cam, acteurs:[porteBureau(74), act], portee:.5 + tombe * .6, tremble:tombe * 1.2, poussiere:0, ambiance:MATIN, ciel:cielMatin(), plans:{couloir:{teinte:'brightness(2.2)'}},
    lampes:function(){ return lampesMatin(t); }, lumieres:function(){ return rayonsMatin(t) + FV.bokehs(t, 5, .35, 'Or', 61); }};
}

/* ================================================================ 8. « C'EST UNE CATASTROPHE ! » (32,6 → la fin) : il se penche à sa fenêtre, cherche à gauche, à droite — puis la caméra s'envole */
var CIEL_PLACE = {haut:[74, 124, 204], milieu:[156, 188, 230], bas:[240, 216, 200], lueur:{az:0, c:[255, 214, 200], k:.4, l:1, h:.16}, etoiles:0, nuages:{c1:[255, 255, 255], c2:[246, 214, 196], k:.8, vit:5}};
/* ce que fait sa tête : [de quand à quand, quel dessin, de quel côté] — chaque dessin tient au moins trois images */
var TETE = [[.50, .62, 'tq', -1], [.62, 1.12, 'profil', -1], [1.12, 1.24, 'tq', -1], [1.36, 1.48, 'tq', 1], [1.48, 1.98, 'profil', 1], [1.98, 2.1, 'tq', 1]];
function maireFenetre(t, a){
  var M = PV.MAIRIE, Fb = M.bureau, appui = Fb.y + Fb.h / 2, pieds = appui + 196;
  var p = D.base('maire'), vient = U.COURBES.dep(U.clamp(a / .4, 0, 1)), vue = null;
  TETE.forEach(function(q){ if(a >= q[0] && a < q[1]) vue = q; });
  var cote = vue ? vue[3] : 0, pen = vue ? (vue[2] === 'profil' ? 1 : .5) * cote : 0;
  D.visage(p, {sourcils:{l:1, t:.4}, yeux:{o:1.4}, bouche:{c:-.7, o:.22}});
  /* penché dehors, les deux mains sur l'appui ; le corps suit un peu le regard */
  p.tk = U.lerp(1, .88, vient); p.w = [pen * 16, p.w[1] + 8]; p.t = pen * 5; p.tete.k = 6; p.tete.x = pen * 8;
  var cy = -196 + 8;
  p.bD = {cible:[70 + pen * 10, cy - 4], ik:1, devant:true}; p.bG = {cible:[-70 + pen * 10, cy - 4], ik:1, devant:true}; p.poingD = p.poingG = 'ouvert';
  var b = parle(t, LIGNES[1][0] + .05, LIGNES[1][1] - .4, 9), ouvert = b ? b.o * 1.5 + .25 : 0;
  if(b) p.v = U.melange(p.v, {bouche:{o:ouvert, w:b.w, c:-.5, cri:.5}}, 1);
  if(vue) p.teteDessin = function(T2, v){ return GD.teteMaire(vue[2], cote, v); };
  else D.vivant(p, t, 21, {souffle:1.4, regard:0});
  if(!vue) p.v = U.melange(p.v, {yeux:{lx:a < .5 ? -.6 * (a / .5) : a > 2.1 ? 0 : (a < 1.3 ? -.5 : .5)}}, 1);
  return {type:'libre', x:Fb.x, y:pieds, z:M.z + 6, boite:[Fb.w, Fb.h + 400], dessin:function(pr){
    var s = pr.s, x0 = pr.x - Fb.w / 2 * s, y0 = pr.y - (196 + Fb.h) * s, w = Fb.w * s, h = Fb.h * s, id = 'fenM';
    var r = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120c0a"/><stop offset="1" stop-color="#3a2a22"/></linearGradient><rect x="' + U.r(x0) + '" y="' + U.r(y0) + '" width="' + U.r(w) + '" height="' + U.r(h) + '" fill="url(#' + id + ')"/>';
    /* les rideaux, dedans ; le maire, coupé par l'appui et par les bords de la fenêtre */
    r += '<rect x="' + U.r(x0) + '" y="' + U.r(y0) + '" width="' + U.r(w * .16) + '" height="' + U.r(h) + '" fill="#7a2a3a"/><rect x="' + U.r(x0 + w * .84) + '" y="' + U.r(y0) + '" width="' + U.r(w * .16) + '" height="' + U.r(h) + '" fill="#6a2232"/>';
    r += '<clipPath id="' + id + 'c"><rect x="' + U.r(x0 - 40 * s) + '" y="' + U.r(y0) + '" width="' + U.r(w + 80 * s) + '" height="' + U.r(h + 14 * s) + '"/></clipPath><g clip-path="url(#' + id + 'c)"><g filter="url(#reliefSoleil)"><g transform="translate(' + U.r(pr.x) + ' ' + U.r(pr.y + (1 - vient) * 60 * s) + ') scale(' + U.r(s * 1000) / 1000 + ')">' + window.CFXV.texturer(Gens.dessin('maire', p, {gants:1})) + '</g></g></g>';
    /* les deux battants, ouverts vers l'intérieur (on en voit la tranche) ; l'appui de pierre, par-dessus ses mains… non : ses mains sont posées dessus */
    r += '<rect x="' + U.r(x0 - 4 * s) + '" y="' + U.r(y0 + h - 2 * s) + '" width="' + U.r(w + 8 * s) + '" height="' + U.r(10 * s) + '" fill="#d6ccb8" stroke="' + NOIR + '" stroke-width="' + U.r(Math.max(.6, 1.6 * s)) + '"/>';
    return r;
  }};
}
/* les aiguilles de la grande horloge de la mairie (elle est déréglée : elle ne donne pas la bonne heure) */
function aiguilles(){
  var Hq = PV.MAIRIE.horloge;
  return D.libre(Hq.x, Hq.y, PV.MAIRIE.z + 6, '<path d="M0 14 L 0 -' + U.r(Hq.r * .55) + '" stroke="#2f2a26" stroke-width="20" stroke-linecap="round" transform="rotate(100)"/><path d="M0 18 L 0 -' + U.r(Hq.r * .84) + '" stroke="#2f2a26" stroke-width="13" stroke-linecap="round" transform="rotate(-36)"/><circle r="15" fill="#c8a040" stroke="#2f2a26" stroke-width="4"/>', [260, 260]);
}
function plan8(t){
  var a = t - T7, M = PV.MAIRIE, Fb = M.bureau;
  var recul = U.tresLisse(U.clamp((a - 2.5) / 2.6, 0, 1));
  var appui = Fb.y + Fb.h / 2, cam = {x:U.lerp(Fb.x + 10, XP, recul), y:U.lerp(appui - 163, -2600, recul), z:M.z + U.lerp(900, 9800, recul), tangage:U.lerp(0, .072, recul), focus:U.lerp(900, 9800, recul), ouverture:U.lerp(1.2, .4, recul)};
  var A = [maireFenetre(t, a), aiguilles()];
  return {zone:'place', cam:cam, acteurs:A, portee:.6, tremble:a > 2.1 && a < 2.5 ? 1.5 : 0, poussiere:0, ambiance:[255, 240, 216], ciel:CIEL_PLACE,
    lampes:function(){ return FV.bain(0, 0, W, H * .4, [255, 252, 240], .25, 0); },
    lumieres:function(){ return FV.poussiere(t, [XP - 2500, -3200, -1300, XP + 2500, -200, 2500], 80, 37, '#fff0c8', .5); },
    devant:function(){ return FV.oiseaux(t, T7 + 2.55, Fb.x - 900, Fb.y - 1500, M.z + 200, 14, 83, {dx:2400, l:2600, c:'#3a3440'}) + FV.oiseaux(t, T7 + 2.9, Fb.x + 1700, Fb.y - 1700, M.z + 400, 9, 89, {dx:2000, gauche:.8, c:'#3a3440'}); },
    avant:function(){ return FV.titre(t, TITRE, 'La Lanterne d\'Or', {sous:'ENQUÊTE 1', y:142, taille:92, voile:.2}); }};
}

CINE.films.debut1 = {
  nom:'La Lanterne d\'Or — le début', plateau:'village', duree:T, defs:defs,
  sons:[[.1, 'cineNuit'], [.3, 'cineTicTac'], [1.6, 'cineLanterneOr'], [4.2, 'cineTicTac'], [T1 + .1, 'cineNuit'], [T1 + .4, 'cineTicTac'], [T1 + 1.95, 'cineFenetre'], [T1 + 2.6, 'cineVent'], [T2 + .1, 'cineLanterneOr'], [T2 + .95, 'cinePrise'], [T2 + 2.2, 'cineLueurPart'],
    [T3 + .05, 'cineCourseLegere'], [T3 + .2, 'cineNuit'], [T3 + 2.3, 'cineCourseLegere'], [T4 + .1, 'cineTempsPasse'], [T4 + 2.9, 'cineOiseaux'], [T5 + .15, 'cinePorteBureau'], [T5 + .9, 'cineFredonne'], [T5 + 1.0, 'cinePasParquet'], [T5 + 2.0, 'cinePasParquet'],
    [T6 + .45, 'cineStupeur'], [T7 + .05, 'cineFenetre'], [T7 + 2.6, 'cineEnvol'], [T7 + 3.4, 'cineOiseaux']],
  sousTitres:LIGNES,
  etat:function(t){
    PV.prepare('bureau'); PV.prepare('foule'); PV.prepare('place');
    var E = t < T1 ? plan1(t) : t < T2 ? plan2(t) : t < T3 ? plan3(t) : t < T4 ? plan4(t) : t < T5 ? plan5(t) : t < T6 ? plan6(t) : t < T7 ? plan7(t) : plan8(t);
    return D.fondus(E, t, T, [[T3, .3], [T4, .35], [T5, .16, '#fff2d8']]);
  }
};
})();
