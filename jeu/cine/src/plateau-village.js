/* plateau-village.js — LE VILLAGE DE BRUMEVAL : le troisième grand plateau des films, pour les trois films de début d'enquête
   (Bible §13.69). Même monde que les autres (x vers la droite, y vers le BAS, le sol en y = 0, z vers la caméra ; la caméra regarde
   vers le fond et les personnages sont dessinés de face). QUATRE COINS, loin les uns des autres sur l'axe x, chacun regardé de face :

     'place'    (x = 0)        la mairie vue par les villageois : la grande façade, le perron, les maisons de chaque côté ;
     'foule'    (x = 20000)    la place vue du perron : les villageois, la fontaine, les maisons d'en face, la rue par où le soleil
                               se lève, le clocher, les collines ;
     'riviere'  (x = 40000)    la berge vue depuis l'eau : le quai de pierre, le lavoir, le pré, les maisons, les collines ;
     'bureau'   (x = 60000)    le bureau du maire, au premier étage de la mairie : le mur du fond, sa haute fenêtre (un vrai trou :
                               on voit les toits du village, en bas), la porte, la bibliothèque.

   Comme au Vieux Chêne (plateau-chene.js) : des plans peints (textures-village.js) posés en 3D par le navigateur, floutés un par un
   selon leur distance au point net ; LE CIEL ET LES SOLS sont peints à la main à chaque image, sur une toile SOUS les plans.
   Ce qui est nouveau ici :
   — LE CIEL CHANGE AVEC L'HEURE (E.ciel : ses trois couleurs, la lueur de l'horizon, le soleil ou la lune, les étoiles, les nuages) ;
   — tout est peint « de jour, sans soleil », et c'est LA CARTE DES LUMIÈRES du film (E.ambiance, E.lampes : scene.js, la couche
     #lumap, qui MULTIPLIE l'image) qui fait la nuit, l'aube ou le matin. Le ciel, lui, est peint « à l'envers » de l'ambiance
     (divisé par elle) : une fois multiplié, il a exactement la couleur demandée ;
   — un coin n'est construit que la première fois qu'un film y va. */
(function(){
'use strict';
var U = window.CU, T = window.CTV;
var W = 1440, H = 616, P = 1600;
var X = {place:0, foule:20000, riviere:40000, bureau:60000};
var PV = window.PLATEAU_VILLAGE = {TORCHES:[], X:X, pret:false, FEN:{}, REP:{}};
var PL = [], FOND = {}, FAIT = {};

function plan(zone, src, w, h, tr, milieu, o){
  o = o || {};
  var d = src, kx = w / src.width, ky = h / src.height;
  d.style.width = src.width + 'px'; d.style.height = src.height + 'px';
  d.style.position = 'absolute'; d.style.left = '0'; d.style.top = '0';
  d.style.transformOrigin = '0 0'; d.style.transform = tr + ' scale(' + U.r(kx * 1000) / 1000 + ',' + U.r(ky * 1000) / 1000 + ')'; d.style.backfaceVisibility = 'hidden';
  d.style.display = 'none';
  PV.monde.appendChild(d);
  var p = {el:d, m:milieu, zone:zone, k:Math.sqrt(kx * ky), flouMax:o.flouMax, net:o.net, nom:o.nom, op:o.op, vu:false};
  if(o.op != null) d.style.opacity = o.op;
  PL.push(p);
  return p;
}
/* un plan debout, face à nous : son bord gauche en x0, son BAS en y1, à la profondeur z */
function debout(zone, toile, x0, y1, z, w, h, o){
  return plan(zone, toile, w, h, 'translate3d(' + x0 + 'px,' + (y1 - h) + 'px,' + z + 'px)', [x0 + w / 2, y1 - h * .45, z], o);
}
function mips(c, n){
  var L = [c];
  for(var i = 1; i < n; i++){ var p = L[i - 1], q = document.createElement('canvas'); q.width = Math.max(1, p.width >> 1); q.height = Math.max(1, p.height >> 1); var g = q.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(p, 0, 0, q.width, q.height); L.push(q); }
  return L;
}
/* les fenêtres d'une toile (toile.fen, en parts de la toile) → leurs places dans le monde */
function fenetres(zone, toile, x0, y1, z, w, h){
  (toile.fen || []).forEach(function(f){ (PV.FEN[zone] = PV.FEN[zone] || []).push({x:x0 + f.x * w, y:y1 - h + f.y * h, z:z, w:f.w * w, h:f.h * h, bureau:f.bureau}); });
}

PV.construire = function(racine){
  var vue = document.createElement('div');
  vue.id = 'vue3dVillage';
  vue.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:#000';
  var fond = document.createElement('canvas'); fond.width = W; fond.height = H; fond.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px';
  var persp = document.createElement('div');
  persp.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;perspective:' + P + 'px;perspective-origin:50% 50%;overflow:hidden';
  var monde = document.createElement('div');
  monde.style.cssText = 'position:absolute;left:' + W / 2 + 'px;top:' + H / 2 + 'px;width:0;height:0;transform-style:preserve-3d';
  persp.appendChild(monde); vue.appendChild(fond); vue.appendChild(persp); racine.appendChild(vue);
  PV.monde = monde; PV.vue = vue; PV.fond = fond;
  PV.solNet = document.createElement('canvas'); PV.solNet.width = W; PV.solNet.height = H;
  PV.tmp = document.createElement('canvas'); PV.tmp.width = W; PV.tmp.height = H;
  PV.NUAGES = [T.nuages({w:1600, h:420, graine:67, n:15}), T.nuages({w:1600, h:420, graine:69, n:11})];
};

/* ====================================================================== LES COINS (chacun construit à sa première image) */
var ZONES = {};
/* le lointain commun aux coins du dehors : deux rangs de collines, de la brume entre les deux */
function lointain(zone, C, o){
  o = o || {};
  debout(zone, T.collines({w:2600, h:300, graine:o.g1 || 47, c:'#7f9c8c', c2:'#a9bfb0', base:.62, amp:.42, f:2.2, bois:120, ech:.6}), C - 26000, 40, -30000, 52000, 6000, {nom:'collines2'});
  debout(zone, T.collines({w:2600, h:300, graine:o.g2 || 49, c:'#5f8a5a', c2:'#8cab78', base:.6, amp:.34, f:3.2, bois:300, bosse:o.bosse}), C - 20000, 40, -17000, 40000, 4600, {nom:'collines1'});
  debout(zone, T.brume({w:1200, h:200, graine:63, n:70, a:.07}), C - 18000, 60, -15000, 36000, 2400, {nom:'brumeLoin', op:o.brume == null ? .8 : o.brume});
}

/* ---------------------------------------------------------------- LA PLACE, CÔTÉ MAIRIE */
ZONES.place = function(){
  var C = X.place, z;
  lointain('place', C, {g1:147, g2:149});
  /* des arbres derrière la mairie, puis la mairie */
  debout('place', T.arbres({w:1800, h:560, graine:53, arbres:[[.08, .4, .34], [.2, .46, .4], [.36, .36, .3], [.64, .4, .34], [.8, .46, .4], [.93, .38, .32]]}), C - 7200, 20, -4200, 14400, 4480, {nom:'arbres'});
  var M = PV.MAIRIE = {x0:C - 2550, z:-1400, w:5100, h:3900};
  var tm = T.mairie({graine:17});
  debout('place', tm, M.x0, 0, M.z, M.w, M.h, {nom:'mairie'});
  fenetres('place', tm, M.x0, 0, M.z, M.w, M.h);
  var I = T.MAIRIE;
  M.bureau = {x:M.x0 + I.bureau.x * M.w, y:-M.h + I.bureau.y * M.h, w:I.bureau.w * M.w, h:I.bureau.h * M.h};
  M.horloge = {x:M.x0 + I.horloge.x * M.w, y:-M.h + I.horloge.y * M.h, r:I.horloge.r * M.w};
  M.porte = {x:M.x0 + I.porte.x * M.w, w:I.porte.w * M.w, h:(1 - I.porte.y) * M.h};
  M.lanternes = I.lanternes.map(function(l){ return {x:M.x0 + l.x * M.w, y:-M.h + l.y * M.h}; });
  /* le perron : trois marches, devant la porte (le maire se tient dessus : y = −PERRON.h) */
  PV.PERRON = {x:C, z:-1180, w:2300, h:150, zHaut:-1290};
  debout('place', T.perron({w:1150, h:75, graine:23, marches:3, retrait:26}), C - 1150, 0, PV.PERRON.z, 2300, 150, {nom:'perron'});
  /* les maisons de chaque côté de la mairie, puis plus près, au bord du cadre */
  var g1 = T.rangeeAuto({w:1100, h:800, graine:211, lMin:330, lMax:440, hMin:400, hMax:500}), g2 = T.rangeeAuto({w:1100, h:800, graine:223, lMin:330, lMax:440, hMin:400, hMax:500});
  debout('place', g1, C - 7100, 0, -1250, 4400, 3200, {nom:'maisonsG'}); fenetres('place', g1, C - 7100, 0, -1250, 4400, 3200);
  debout('place', g2, C + 2700, 0, -1250, 4400, 3200, {nom:'maisonsD'}); fenetres('place', g2, C + 2700, 0, -1250, 4400, 3200);
  var g3 = T.rangeeAuto({w:760, h:800, graine:227, lMin:340, lMax:420, hMin:420, hMax:500}), g4 = T.rangeeAuto({w:760, h:800, graine:229, lMin:340, lMax:420, hMin:420, hMax:500});
  debout('place', g3, C - 7000, 0, 300, 3040, 3200, {nom:'maisonsG2'}); debout('place', g4, C + 3960, 0, 300, 3040, 3200, {nom:'maisonsD2'});
  debout('place', T.brume({w:900, h:200, graine:65, n:50, a:.06}), C - 6000, 30, -1100, 12000, 1300, {nom:'brume', op:.6, flouMax:30});
  FOND.place = {sols:[{y:0, mips:mips(T.paves({n:1024, graine:71}), 6), TU:820}]};
};

/* ---------------------------------------------------------------- LA PLACE, CÔTÉ VILLAGEOIS (vue du perron) */
ZONES.foule = function(){
  var C = X.foule;
  lointain('foule', C, {g1:47, g2:49, bosse:function(x){ return -.5 * Math.exp(-Math.pow((x - .49) / .06, 2)); }});
  /* le clocher de l'église, au loin, à droite de la rue ; des arbres au bout de la rue */
  PV.CLOCHER = {x:C + 2900, z:-9800, w:1900, h:6300};
  debout('foule', T.clocher({w:300, h:1000, graine:29}), C + 1950, 20, -9800, 1900, 6300, {nom:'clocher'});
  debout('foule', T.arbres({w:1500, h:500, graine:57, arbres:[[.1, .4, .36], [.26, .5, .44], [.74, .46, .4], [.9, .4, .36]]}), C - 5400, 20, -8200, 10800, 3600, {nom:'arbres'});
  debout('foule', T.brume({w:900, h:200, graine:163, n:60, a:.08}), C - 9000, 40, -7000, 18000, 2000, {nom:'brumeRue', op:.9, flouMax:40});
  /* les maisons d'en face : deux rangées, la rue entre les deux (le soleil s'y lève) */
  var g1 = T.rangeeAuto({w:1700, h:820, graine:311, lMin:340, lMax:470, hMin:400, hMax:520}), g2 = T.rangeeAuto({w:1700, h:820, graine:317, lMin:340, lMax:470, hMin:400, hMax:520});
  PV.RUE = {x:C - 250, z:-5200, l:1100};
  debout('foule', g1, C - 7600, 0, -5200, 6800, 3280, {nom:'maisonsG'}); fenetres('foule', g1, C - 7600, 0, -5200, 6800, 3280);
  debout('foule', g2, C + 300, 0, -5200, 6800, 3280, {nom:'maisonsD'}); fenetres('foule', g2, C + 300, 0, -5200, 6800, 3280);
  /* la fontaine, au milieu de la place */
  PV.FONTAINE = {x:C + 900, z:-3000, w:1400, h:1240};
  debout('foule', T.fontaine({w:700, h:620, graine:37}), C + 200, 0, -3000, 1400, 1240, {nom:'fontaine'});
  /* les maisons des côtés, plus près */
  var g3 = T.rangeeAuto({w:900, h:820, graine:331, lMin:360, lMax:440, hMin:430, hMax:520}), g4 = T.rangeeAuto({w:900, h:820, graine:337, lMin:360, lMax:440, hMin:430, hMax:520});
  debout('foule', g3, C - 8600, 0, -2400, 3600, 3280, {nom:'maisonsG2'}); debout('foule', g4, C + 5000, 0, -2400, 3600, 3280, {nom:'maisonsD2'});
  debout('foule', T.brume({w:900, h:200, graine:165, n:50, a:.06}), C - 6000, 30, -2300, 12000, 1100, {nom:'brume', op:.7, flouMax:30});
  FOND.foule = {sols:[{y:0, mips:mips(T.paves({n:1024, graine:71}), 6), TU:820}]};
};

/* ---------------------------------------------------------------- LA RIVIÈRE (la berge vue depuis l'eau) */
ZONES.riviere = function(){
  var C = X.riviere;
  lointain('riviere', C, {g1:247, g2:249, bosse:function(x){ return -.42 * Math.exp(-Math.pow((x - .53) / .07, 2)); }, brume:1});
  /* (pas d'arbres au milieu : c'est par là, entre les maisons, qu'on voit le soleil sortir des collines) */
  debout('riviere', T.arbres({w:1900, h:330, graine:253, arbres:[[.05, .42, .4], [.15, .5, .46], [.26, .4, .38], [.36, .34, .3], [.71, .36, .32], [.8, .48, .44], [.92, .42, .4]]}), C - 9500, 20, -7600, 19000, 3300, {nom:'arbresLoin'});
  debout('riviere', T.brume({w:900, h:200, graine:263, n:70, a:.085}), C - 9000, 40, -6400, 18000, 1900, {nom:'brumePre', op:1, flouMax:40});
  /* les maisons du village, au bout du pré : deux rangées, un chemin entre les deux */
  var g1 = T.rangeeAuto({w:1700, h:820, graine:411, lMin:340, lMax:460, hMin:390, hMax:500}), g2 = T.rangeeAuto({w:1500, h:820, graine:417, lMin:340, lMax:460, hMin:390, hMax:500});
  debout('riviere', g1, C - 7700, 0, -4600, 6800, 3280, {nom:'maisonsG'}); fenetres('riviere', g1, C - 7700, 0, -4600, 6800, 3280);
  debout('riviere', g2, C + 600, 0, -4600, 6000, 3280, {nom:'maisonsD'}); fenetres('riviere', g2, C + 600, 0, -4600, 6000, 3280);
  /* un grand arbre, à droite, sur la berge ; des buissons en fleurs */
  debout('riviere', T.arbres({w:700, h:900, graine:271, arbres:[[.5, .5, .36]]}), C + 1500, 20, -1500, 2800, 3600, {nom:'grandArbre'});
  debout('riviere', T.buisson({w:520, h:230, graine:273, n:5, fleurs:'#e8e0d8'}), C + 900, 14, -700, 1560, 690, {nom:'buisson1'});
  debout('riviere', T.buisson({w:420, h:210, graine:277, n:4, fleurs:'#e89ab8'}), C - 3600, 14, -500, 1260, 630, {nom:'buisson2'});
  /* le lavoir (son toit, ses poteaux), puis le quai de pierre, au bord de l'eau (il descend sous l'eau) */
  PV.LAVOIR = {x0:C - 2100, x1:C + 100, z:-560, h:1160};
  debout('riviere', T.lavoir({w:1100, h:580, graine:97}), C - 2100, 0, -560, 2200, 1160, {nom:'lavoir'});
  PV.EAU = {y:76, z:0};
  debout('riviere', T.quai({w:2400, h:60, graine:91}), C - 6000, 300, 0, 12000, 300, {nom:'quai'});
  debout('riviere', T.brume({w:900, h:200, graine:265, n:50, a:.07}), C - 6000, 30, -400, 12000, 900, {nom:'brume', op:.8, flouMax:30});
  FOND.riviere = {sols:[{y:0, mips:mips(T.herbe({n:1024, graine:79}), 6), TU:1400}]};
};

/* ---------------------------------------------------------------- LE BUREAU DU MAIRE (au premier étage : la rue est 2 100 plus bas) */
ZONES.bureau = function(){
  var C = X.bureau, BAS = 2100;
  /* dehors : les collines, les toits des maisons d'en face (en contrebas), la brume de la rue */
  debout('bureau', T.collines({w:2200, h:300, graine:349, c:'#5f8a5a', c2:'#8cab78', base:.6, amp:.34, f:3.2, bois:260}), C - 20000, BAS + 40, -19000, 40000, 4600, {nom:'collines1'});
  var g1 = T.rangeeAuto({w:1900, h:820, graine:511, lMin:330, lMax:450, hMin:380, hMax:500, trous:.3});
  debout('bureau', g1, C - 4200, BAS, -6400, 7600, 3280, {nom:'toits'}); fenetres('bureau', g1, C - 4200, BAS, -6400, 7600, 3280);
  var g2 = T.rangeeAuto({w:1900, h:820, graine:517, lMin:330, lMax:450, hMin:380, hMax:500});
  debout('bureau', g2, C - 3000, BAS, -9400, 7600, 3280, {nom:'toits2'}); fenetres('bureau', g2, C - 3000, BAS, -9400, 7600, 3280);
  debout('bureau', T.brume({w:900, h:260, graine:365, n:90, a:.1}), C - 6000, BAS + 100, -6000, 12000, 2600, {nom:'brumeRue', op:1, flouMax:40});
  debout('bureau', T.brume({w:900, h:260, graine:367, n:90, a:.1}), C - 6000, BAS + 100, -8600, 12000, 3000, {nom:'brumeRue2', op:1, flouMax:40});
  /* dedans : le mur du fond (4 000 × 1 900), sa fenêtre et sa porte ; la bibliothèque, à droite ; le tableau, entre la porte et la fenêtre */
  var MW = 6400, MH = 1900, MZ = -800;
  var mur = T.murBureau({w:2560, h:760, graine:103, fx:.5, fy:.15, fw:.1, fh:.5, px:.215, py:.3, pw:.08});
  /* le couloir, derrière la porte : dans le noir */
  var noir = T.toile(60, 120), gn = noir.getContext('2d'), dg = gn.createLinearGradient(0, 0, 0, 120); dg.addColorStop(0, '#0c0806'); dg.addColorStop(1, '#241810'); gn.fillStyle = dg; gn.fillRect(0, 0, 60, 120);
  debout('bureau', noir, C - 2000, 0, MZ - 260, 1000, 1500, {nom:'couloir'});
  debout('bureau', mur, C - MW / 2, 0, MZ, MW, MH, {nom:'mur'});
  PV.BUREAU = {z:MZ, x0:C - MW / 2, w:MW, h:MH,
    fenetre:{x0:C - MW / 2 + mur.fenetre.x * MW, x1:C - MW / 2 + (mur.fenetre.x + mur.fenetre.w) * MW, y0:-MH + mur.fenetre.y * MH, y1:-MH + (mur.fenetre.y + mur.fenetre.h) * MH},
    porte:{x0:C - MW / 2 + mur.porte.x * MW, x1:C - MW / 2 + (mur.porte.x + mur.porte.w) * MW, y0:-MH + mur.porte.y * MH}};
  debout('bureau', T.bibliotheque({w:400, h:700, graine:113, rayons:5}), C + 1250, 0, MZ + 26, 920, 1610, {nom:'biblio'});
  debout('bureau', T.bibliotheque({w:400, h:700, graine:117, rayons:5}), C - 3050, 0, MZ + 26, 920, 1610, {nom:'biblio2'});
  debout('bureau', T.tableau({w:260, h:190, graine:127}), C - 900, -900, MZ + 8, 560, 410, {nom:'tableau'});
  FOND.bureau = {sols:[{y:BAS, mips:mips(T.paves({n:1024, graine:171}), 6), TU:1500, zMax:MZ - 600}, {y:0, mips:mips(T.plancher({n:1024, graine:87}), 6), TU:1300, zMin:MZ}]};
};

/* ====================================================================== LE CIEL de cette image
   C = {haut, milieu, bas : trois couleurs [r, v, b] ; lueur:{az, c, k, l (largeur), h (hauteur)} ; astre:{az, alt, r, c, halo, k, lune} ;
        etoiles (0 → 1) ; nuages:{c1, c2, k, vit}} ; amb : l'ambiance de l'image (le ciel est divisé par elle : voir en tête) */
var ETOILES = null;
function peindreCiel(g, C, amb, t){
  var c = CAM, D = 200000;
  function pre(col, a){ var v = [0, 1, 2].map(function(i){ return Math.round(U.clamp(col[i] * 255 / Math.max(8, amb[i]), 0, 255)); }); return a == null ? 'rgb(' + v.join(',') + ')' : 'rgba(' + v.join(',') + ',' + a + ')'; }
  function dir(az, alt){ return c.projeter(c.x + D * Math.tan(az), c.y - D * Math.tan(alt) / Math.cos(az), c.z - D); }
  var yh = dir(0, 0).y, y1 = dir(0, .62).y;
  var gr = g.createLinearGradient(0, y1, 0, yh);
  gr.addColorStop(0, pre(C.haut)); gr.addColorStop(.55, pre(C.milieu)); gr.addColorStop(1, pre(C.bas));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  /* la lueur de l'horizon, autour du soleil qui vient */
  if(C.lueur && C.lueur.k > 0){
    var L = C.lueur, pl = dir(L.az || 0, 0), rx = (L.l || .5) * P, ry = (L.h || .22) * P;
    var rg = g.createRadialGradient(0, 0, 0, 0, 0, 1); rg.addColorStop(0, pre(L.c, L.k)); rg.addColorStop(.45, pre(L.c, L.k * .45)); rg.addColorStop(1, pre(L.c, 0));
    g.save(); g.translate(pl.x, pl.y); g.scale(rx, ry); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill(); g.restore();
  }
  /* les étoiles (elles scintillent ; elles pâlissent avec le jour) */
  if(C.etoiles > 0){
    if(!ETOILES){ ETOILES = []; var R = U.hasard(977); for(var i = 0; i < 520; i++) ETOILES.push([(R() - .5) * 2.1, .02 + Math.pow(R(), 1.3) * .62, Math.pow(R(), 2.4), R() * 9, R() < .2 ? [255, 226, 190] : R() < .5 ? [200, 216, 255] : [245, 245, 255]]); }
    ETOILES.forEach(function(e){
      var p = dir(e[0], e[1]); if(p.x < -4 || p.x > W + 4 || p.y < -4 || p.y > yh) return;
      var sc = .75 + .25 * Math.sin(t * (1.3 + e[2] * 2) + e[3]), a = (.3 + e[2] * .7) * C.etoiles * sc * U.clamp(e[1] * 9, .2, 1);
      g.fillStyle = pre(e[4], U.clamp(a, 0, 1)); g.beginPath(); g.arc(p.x, p.y, .5 + e[2] * 1.3, 0, 7); g.fill();
      if(e[2] > .8){ var hg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7); hg.addColorStop(0, pre(e[4], a * .35)); hg.addColorStop(1, pre(e[4], 0)); g.fillStyle = hg; g.beginPath(); g.arc(p.x, p.y, 7, 0, 7); g.fill(); }
    });
  }
  /* le soleil ou la lune : le grand halo, le disque */
  if(C.astre && C.astre.k !== 0){
    var A = C.astre, pa = dir(A.az, A.alt), r = (A.r || .02) * P, k = A.k == null ? 1 : A.k;
    PV.ASTRE = {x:pa.x, y:pa.y, r:r, yh:yh};
    [[14, .16], [6, .26], [2.6, .5]].forEach(function(q){
      var hg2 = g.createRadialGradient(pa.x, pa.y, 0, pa.x, pa.y, r * q[0]); hg2.addColorStop(0, pre(A.halo || A.c, q[1] * k)); hg2.addColorStop(1, pre(A.halo || A.c, 0));
      g.fillStyle = hg2; g.beginPath(); g.arc(pa.x, pa.y, r * q[0], 0, 7); g.fill();
    });
    g.fillStyle = pre(A.c, U.clamp(k, 0, 1)); g.beginPath(); g.arc(pa.x, pa.y, r, 0, 7); g.fill();
    if(A.lune){ g.save(); g.beginPath(); g.arc(pa.x, pa.y, r, 0, 7); g.clip(); [[-.3, -.28, .3], [.18, -.36, .22], [.3, .08, .26], [-.12, .3, .2], [-.46, .14, .14]].forEach(function(m){ var mg = g.createRadialGradient(pa.x + m[0] * r, pa.y + m[1] * r, 0, pa.x + m[0] * r, pa.y + m[1] * r, m[2] * r); mg.addColorStop(0, pre(mel3(A.c, [90, 100, 130], .5), .5 * k)); mg.addColorStop(1, pre(A.c, 0)); g.fillStyle = mg; g.beginPath(); g.arc(pa.x + m[0] * r, pa.y + m[1] * r, m[2] * r, 0, 7); g.fill(); }); g.restore(); }
  } else PV.ASTRE = null;
  /* les nuages : deux voiles, très loin, qui glissent ; leur dessous prend la couleur du soleil levant */
  if(C.nuages && C.nuages.k > 0){
    var N = C.nuages, tg = PV.tmp.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, W, H);
    PV.NUAGES.forEach(function(nu, i){
      var a0 = dir(-1.25, .5), b0 = dir(1.25, .5), d0 = dir(-1.25, .03), larg = b0.x - a0.x, haut = d0.y - a0.y, dec = ((t * (N.vit || 6) * (i ? .6 : 1) + i * 700) % larg + larg) % larg;
      [-1, 0].forEach(function(q){ tg.drawImage(nu, a0.x + dec + q * larg, a0.y + (i ? haut * .12 : 0), larg, haut * (i ? .8 : 1)); });
    });
    tg.globalCompositeOperation = 'source-in';
    var ng = tg.createLinearGradient(0, yh - .5 * P, 0, yh); ng.addColorStop(0, pre(N.c1)); ng.addColorStop(1, pre(N.c2));
    tg.fillStyle = ng; tg.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = U.clamp(N.k, 0, 1); g.drawImage(PV.tmp, 0, 0); g.restore();
  }
}
function mel3(a, b, k){ return [U.lerp(a[0], b[0], k), U.lerp(a[1], b[1], k), U.lerp(a[2], b[2], k)]; }

/* ====================================================================== LES SOLS de cette image (une ligne d'écran = une ligne droite du sol) */
var CRANS = [0, .7, 1.4, 2.2, 3.2, 4.5, 6, 8, 11, 15, 20, 27, 36, 46];
function peindreSol(g, S){
  var c = CAM, k;
  var s2 = PV.solNet.getContext('2d'); s2.setTransform(1, 0, 0, 1, 0, 0); s2.clearRect(0, 0, W, H);
  var cl = Math.cos(c.lacet), sl = Math.sin(c.lacet), ct = Math.cos(c.tangage), st = Math.sin(c.tangage), q0 = S.TU / S.mips[0].width;
  var motifs = S._motifs || (S._motifs = S.mips.map(function(m){ return s2.createPattern(m, 'repeat'); }));
  var lignes = [], tPrec = null;
  for(var ys = H - 1; ys >= 0; ys--){
    var Y = ys + .5 - H / 2, vy = Y * ct - P * st, z1 = -Y * st - P * ct;
    if(vy <= .5) break;
    var t = (S.y - c.y) / vy; if(t <= 0) break;
    var dist = t * P; if(dist > (S.loin || 30000)) break;
    var X0 = -W / 2, gx = c.x + t * (X0 * cl - z1 * sl), gz = c.z + t * (X0 * sl + z1 * cl), gzM = c.z + t * z1 * cl;
    var prof = tPrec == null ? t : Math.abs(t - tPrec) * P / Math.max(.2, ct), n = Math.max(t, prof * .6);
    tPrec = t;
    if(S.zMin != null && gzM < S.zMin) continue;
    if(S.zMax != null && gzM > S.zMax) continue;
    var L = Math.max(0, Math.min(motifs.length - 1, Math.round(Math.log(Math.max(1, n / q0)) / Math.LN2))), q = q0 * Math.pow(2, L), kk = q / t;
    var u0 = gx / q, v0 = gz / q, a = kk * cl, b = -kk * sl, cc = kk * sl, d = kk * cl;
    var m = motifs[L]; m.setTransform(new DOMMatrix([a, b, cc, d, -(a * u0 + cc * v0), ys - (b * u0 + d * v0)]));
    s2.fillStyle = m; s2.fillRect(0, ys, W, 1);
    lignes.push([ys, dist]);
  }
  /* le flou de la profondeur de champ, par bandes */
  var i = 0;
  while(i < lignes.length){
    var f = c.flou(lignes[i][1]), cran = 0;
    for(k = 0; k < CRANS.length; k++) if(Math.abs(CRANS[k] - f) < Math.abs(CRANS[cran] - f)) cran = k;
    var j = i;
    while(j < lignes.length){ var f2 = c.flou(lignes[j][1]), cr2 = 0; for(k = 0; k < CRANS.length; k++) if(Math.abs(CRANS[k] - f2) < Math.abs(CRANS[cr2] - f2)) cr2 = k; if(cr2 !== cran) break; j++; }
    var yBas = lignes[i][0] + 1, yHaut = lignes[j - 1][0];
    g.save(); g.beginPath(); g.rect(0, yHaut, W, yBas - yHaut); g.clip();
    g.filter = CRANS[cran] > 0 ? 'blur(' + CRANS[cran] + 'px)' : 'none';
    g.drawImage(PV.solNet, 0, 0); g.restore();
    i = j;
  }
}

/* construire un coin (une seule fois) : un film qui a besoin de ses repères (PV.MAIRIE, PV.BUREAU…) le demande avant sa première image */
PV.prepare = function(zone){ if(!FAIT[zone]){ ZONES[zone](); FAIT[zone] = true; } };
/* à chaque image : la caméra, le coin montré, le ciel, les sols, et le flou de chaque plan selon sa distance */
PV.image = function(E){
  var zone = (E && E.zone) || 'place';
  PV.prepare(zone);
  PV.monde.style.transform = CAM.transformCSS();
  /* (E.cielAmbiance : quand le ciel n'est vu que par une fenêtre, le film remet lui-même la carte des lumières à cette couleur-là dans la fenêtre —
     film-debut1.js : le ciel de nuit garde sa lune blanche, le matin son soleil) */
  var g = PV.fond.getContext('2d'), amb = E.cielAmbiance || E.ambiance || [255, 255, 255];
  g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  if(E.ciel) peindreCiel(g, E.ciel, amb, window.CINE_T || 0); else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); PV.ASTRE = null; }
  (FOND[zone].sols || []).forEach(function(S){ peindreSol(g, S); });
  var R = E.plans || {};
  PL.forEach(function(p){
    var r = p.nom && R[p.nom];
    if(p.zone !== zone || (r && r.cache)){ if(p.vu !== false){ p.el.style.display = 'none'; p.vu = false; } return; }
    if(p.vu !== true){ p.el.style.display = ''; p.vu = true; }
    var op = r && r.op != null ? r.op : p.op; if(op !== p._op){ p.el.style.opacity = op == null ? '' : op; p._op = op; }
    var pr = CAM.projeter(p.m[0], p.m[1], p.m[2]), f = p.net ? 0 : CAM.flou(pr.d);
    if(p.flouMax) f = Math.min(f, p.flouMax);
    var loc = f / Math.max(pr.s, .05) / p.k;
    /* r.teinte : un réglage de plus pour ce plan (« brightness(.7) » : un mur à contre-jour) */
    p.el.style.filter = (loc > .25 ? 'blur(' + U.r(loc) + 'px) ' : '') + (r && r.teinte ? r.teinte : '');
  });
};
})();
