/* plateau-chene.js — LE VIEUX CHÊNE, LA NUIT : le deuxième plateau des films (le rassemblement, enquête 2 ; Bible §12.63).
   Dehors, sous la lune. Même monde que le souterrain (x vers la droite, y vers le BAS, le sol en y = 0, z vers la caméra ; la
   caméra regarde toujours vers le fond, et les personnages sont dessinés de face) : pour filmer « dans l'autre sens », on ne
   retourne donc pas la caméra — le plateau a TROIS COINS, posés côte à côte, chacun regardé de face :

     'foule'    (autour de x = 0)       le chemin dans la forêt, vu du chêne : les villageois arrivent vers nous, le village
                                        et son clocher loin derrière eux ;
     'chene'    (autour de x = 9000)    le Vieux Chêne vu par les villageois : le tronc énorme, la lune dans ses branches,
                                        les gros rochers sur le trou, le buisson ;
     'derriere' (autour de x = 18000)   derrière le chêne : son écorce tout près, les racines ; au loin, à droite du tronc,
                                        les lanternes du village (le film les dessine : des ronds flous).

   Le film dit dans quel coin il est (etat → {zone:'chene'}) : les deux autres ne sont pas montrés.
   Comme pour le souterrain : des plans peints (textures-chene.js) posés en 3D par le navigateur, floutés un par un selon leur
   distance au point net (CAM.flou) ; les personnages, les lumières et la fumée sont dessinés par-dessus (scene.js).
   MAIS LE CIEL ET LE SOL SONT PEINTS À LA MAIN, à chaque image, sur une toile posée SOUS les plans (PC.peindreFond) : le sol,
   ligne d'écran par ligne d'écran (chaque ligne de l'image voit une ligne droite du sol : on y pose la tuile d'herbe, tournée et
   réduite comme il faut). En plans 3D, le navigateur perdait des morceaux du sol (de grands rectangles vides) dès que le sol
   passait sous la caméra. Un plan debout cache toujours le sol qui est derrière lui, et le sol devant lui est plus bas à
   l'écran : peindre tout le sol d'abord, puis les plans debout par-dessus, est donc juste. */
(function(){
'use strict';
var U = window.CU, T = window.CTC;
var W = 1440, H = 616, P = 1600;
var X = {foule:0, chene:9000, derriere:18000};
var PC = window.PLATEAU_CHENE = {TORCHES:[], X:X, pret:false};
var PL = [];

/* un plan : une toile de w × h unités du monde, posée par « tr ».
   L'élément garde LA TAILLE DE SA TOILE (en points) et c'est « scale » qui l'agrandit jusqu'à sa taille dans le monde : le flou
   (calculé avant la perspective) travaille alors sur une petite image — un ciel de 26 000 unités flouté tel quel bloquait le
   navigateur pendant plus de trente secondes. */
function plan(zone, src, w, h, tr, milieu, o){
  o = o || {};
  var d, kx, ky;
  if(src && src.getContext){ d = src; kx = w / src.width; ky = h / src.height; d.style.width = src.width + 'px'; d.style.height = src.height + 'px'; }
  else { d = document.createElement('div'); kx = ky = o.k || 4; d.style.cssText = o.fond || ''; d.style.width = (w / kx) + 'px'; d.style.height = (h / ky) + 'px'; }
  d.style.position = 'absolute'; d.style.left = '0'; d.style.top = '0';
  d.style.transformOrigin = '0 0'; d.style.transform = tr + ' scale(' + U.r(kx * 1000) / 1000 + ',' + U.r(ky * 1000) / 1000 + ')'; d.style.backfaceVisibility = 'hidden';
  PC.monde.appendChild(d);
  PL.push({el:d, m:milieu, zone:zone, k:Math.sqrt(kx * ky), flouMax:o.flouMax, net:o.net});
  return d;
}
/* un plan debout, face à nous : son bord gauche en x0, son BAS en y1, à la profondeur z */
function debout(zone, toile, x0, y1, z, w, h, o){
  /* (jamais plus bas que le sol : un plan debout qui traverse le sol le découpe, et le navigateur en perd des morceaux) */
  if(y1 > -1) y1 = -1;
  return plan(zone, toile, w, h, 'translate3d(' + x0 + 'px,' + (y1 - h) + 'px,' + z + 'px)', [x0 + w / 2, y1 - h * .45, z], o);
}
/* le ciel et le sol d'un coin (peints par PC.peindreFond) : FOND[zone] = {ciel:{toile, x0, y0, w, h, z}, lune:{toile, x, y, r, z},
   chemin:{mips:[toiles], x0, z0, w, d}} */
var FOND = {};
/* des copies de plus en plus petites d'une toile (le sol au loin en a besoin : sinon il fourmille quand la caméra bouge) */
function mips(c, n){
  var L = [c];
  for(var i = 1; i < n; i++){ var p = L[i - 1], q = document.createElement('canvas'); q.width = Math.max(1, p.width >> 1); q.height = Math.max(1, p.height >> 1); var g = q.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(p, 0, 0, q.width, q.height); L.push(q); }
  return L;
}

PC.construire = function(racine){
  /* la « vue » : la toile du ciel et du sol, et par-dessus le monde en 3D (transparent là où il n'y a pas de plan) */
  var vue = document.createElement('div');
  vue.id = 'vue3dChene';
  vue.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:#03050c';
  var fond = document.createElement('canvas'); fond.width = W; fond.height = H; fond.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px';
  var persp = document.createElement('div');
  persp.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;perspective:' + P + 'px;perspective-origin:50% 50%;overflow:hidden';
  var monde = document.createElement('div');
  monde.style.cssText = 'position:absolute;left:' + W / 2 + 'px;top:' + H / 2 + 'px;width:0;height:0;transform-style:preserve-3d';
  persp.appendChild(monde); vue.appendChild(fond); vue.appendChild(persp); racine.appendChild(vue);
  PC.monde = monde; PC.vue = vue; PC.fond = fond; PC.solNet = document.createElement('canvas'); PC.solNet.width = W; PC.solNet.height = H;
  PC.TU = 1700;
  PC.herbe = mips(T.herbe({n:1024, graine:81}), 6);

  /* ================================================================ LE COIN « CHÊNE » (vu par les villageois) */
  var C = X.chene, z;
  /* le ciel et la lune (elle est à gauche, entre les feuilles du chêne et le haut de la forêt) */
  var LUNE = PC.LUNE = {x:C - 6360, y:-4050, r:640, z:-10900};
  FOND.chene = {ciel:{toile:T.ciel({w:3072, h:1280, graine:3, lune:[(LUNE.x - (C - 13000)) / 26000 * 3072, (LUNE.y + 9600) / 10800 * 1280, LUNE.r / 26000 * 3072]}), x0:C - 13000, y0:-9600, w:26000, h:10800, z:-11000},
    lune:{toile:T.lune(300), x:LUNE.x, y:LUNE.y, r:LUNE.r * 1.25, z:LUNE.z}};
  /* la forêt : loin dans la brume, puis plus près */
  debout('chene', T.foret({w:4000, h:500, graine:11, n:84, hMin:.5, hMax:.96, ton:[13, 23, 43], brume:[48, 70, 116], brumeK:.7}), C - 8000, 60, -6500, 16000, 2000);
  debout('chene', T.foret({w:3250, h:420, graine:23, n:34, hMin:.6, hMax:1, ton:[7, 13, 23], brume:[34, 52, 90], brumeK:.6, sapins:.2}), C - 6500, 40, -3600, 13000, 1680);
  debout('chene', T.brume({w:1200, h:300, graine:5, a:.045}), C - 6000, 30, -2800, 12000, 1500);
  /* le chêne : le feuillage du fond, le tronc et ses grosses branches, le feuillage de devant */
  debout('chene', T.feuillage({w:1300, h:760, graine:61, n:130, r:[55, 120], tons:[[5, 11, 13], [10, 23, 24], [17, 38, 37], [70, 104, 110]],
    forme:function(x, y){ var dx = (x - .5) / .47, dy = (y - .5) / .46; return dx * dx + dy * dy < 1; }}), C - 2500, -1950, -1150, 5000, 2920);
  debout('chene', T.chene({w:1300, h:1500, graine:41}), C - 1300, 26, -520, 2600, 3000);
  debout('chene', T.feuillage({w:1450, h:700, graine:67, n:170, r:[48, 110],
    forme:function(x, y, R){ var dx = (x - .5) / .47, dy = (y - .46) / .46; if(dx * dx + dy * dy > 1) return false; /* le bas est troué au milieu : on voit la fourche et les grosses branches */ return y < .34 + .16 * Math.sin(x * 23) + .08 * Math.sin(x * 61 + 1) + .5 * Math.abs(x - .5) || R() < .04; }}), C - 2900, -1600, -400, 5800, 2800);
  debout('chene', T.feuillage({w:1300, h:520, graine:69, n:90, r:[50, 105], ombreBas:.35,
    forme:function(x, y){ /* deux grandes branches basses, à gauche et à droite : la fumée sortira « de sous les branches » */ return (x < .24 || x > .76) && y < .3 + .7 * Math.abs(x - .5) + .1 * Math.sin(x * 40) && y > .06; }}), C - 2750, -1280, -140, 5500, 2200);
  /* les gros rochers, sur le trou ; le buisson */
  PC.ROCHERS = {x:C + 40, z:-300, l:2000, h:860};
  debout('chene', T.rochers({w:1000, h:430, graine:71, blocs:[[.5, .62, .21, .36], [.24, .78, .17, .3], [.76, .8, .18, .32], [.4, .97, .2, .33], [.64, .98, .17, .28], [.12, .99, .1, .17], [.88, .99, .1, .16]]}), C + 40 - 1000, 34, -300, 2000, 860);
  debout('chene', T.buisson({w:380, h:270, graine:111, baies:true}), C + 1150, 16, -180, 760, 540);
  debout('chene', T.buisson({w:300, h:200, graine:113}), C - 1750, 14, -260, 640, 420);
  debout('chene', T.brume({w:900, h:200, graine:7, a:.07}), C - 4000, 26, 300, 8000, 700, {flouMax:30});
  /* deux grands arbres au bord du cadre, tout près (flous : ils donnent la profondeur du grand plan) */
  debout('chene', T.rangee({w:2400, h:1100, graine:131, arbres:[[.175, 90, .1], [.8, 100, -.08]], feuilles:.22, bas:.6, lune:.35, sombre:true}), C - 4400, 30, 2100, 8800, 4000);
  /* le sol : l'herbe, le chemin qui arrive (du bas : la caméra) jusqu'à la terre battue devant les rochers, les griffures des rochers traînés */
  var Z0 = -6500, Z1 = 8000, CW = 5000;
  FOND.chene.chemin = {x0:C - CW / 2, z0:Z0, w:CW, d:Z1 - Z0, mips:mips(T.chemin({w:CW, d:Z1 - Z0, e:.22, graine:91, larg:760, v0:(600 - Z0) / (Z1 - Z0), cx:function(v){ return CW / 2 + 120 * Math.sin(v * 7); },
    place:[CW / 2, 500 - Z0, 1300, 700], traces:[[CW / 2 + 1500, 700 - Z0, CW / 2 + 500, -120 - Z0], [CW / 2 - 1700, 500 - Z0, CW / 2 - 600, -150 - Z0]]}), 4)};

  /* ================================================================ LE COIN « FOULE » (le chemin dans la forêt, vu du chêne) */
  var F = X.foule;
  FOND.foule = {ciel:{toile:T.ciel({w:3072, h:1280, graine:9}), x0:F - 13000, y0:-9600, w:26000, h:10800, z:-11000}};
  debout('foule', T.village({w:2600, h:650, graine:19}), F - 5600, 120, -9200, 11200, 2800);
  debout('foule', T.foret({w:4500, h:500, graine:13, n:90, hMin:.5, hMax:.95, ton:[10, 18, 34], brume:[34, 50, 88], brumeK:.6, lune:.5, sapins:.2}), F - 9000, 60, -7000, 18000, 2000);
  /* les arbres du chemin : des rangées de plus en plus proches ; le chemin passe au milieu */
  var RANG = [
    {z:-5400, l:11000, a:[[.17, 130, .04], [.3, 150, -.03], [.4, 120, .02], [.6, 130, -.02], [.71, 150, .03], [.85, 130, -.04]], g:141, f:.4, b:1, lune:.45},
    {z:-3900, l:10000, a:[[.12, 150, .05], [.28, 170, -.02], [.375, 130, .03], [.635, 150, -.03], [.75, 170, .02], [.9, 150, -.05]], g:143, f:.38, b:1, lune:.5},
    {z:-2500, l:9400, a:[[.08, 180, .04], [.31, 200, -.03], [.69, 190, .03], [.92, 180, -.04]], g:147, f:.36, b:1, lune:.55},
    {z:-1150, l:9000, a:[[.03, 200, .03], [.23, 230, -.02], [.335, 170, .04], [.675, 220, .02], [.8, 180, -.03], [.98, 200, -.03]], g:149, f:.34, b:1, lune:.6}
  ];
  RANG.forEach(function(r){
    debout('foule', T.rangee({w:r.l / 3.6, h:1100, graine:r.g, arbres:r.a.map(function(a){ return [a[0], a[1] / 3.6, a[2]]; }), feuilles:r.f, bas:r.b, lune:r.lune}), F - r.l / 2, 30, r.z, r.l, 3960);
    debout('foule', T.brume({w:900, h:220, graine:r.g + 1, a:.05}), F - r.l / 2, 26, r.z + 500, r.l, 900, {flouMax:30});
  });
  var FZ0 = -9200, FZ1 = 3600, FW = 4600;
  FOND.foule.chemin = {x0:F - FW / 2, z0:FZ0, w:FW, d:FZ1 - FZ0, mips:mips(T.chemin({w:FW, d:FZ1 - FZ0, e:.2, graine:93, larg:900, cx:function(v){ return FW / 2 + 160 * Math.sin(v * 5 + 1) * (1 - v); }, place:[FW / 2, 300 - FZ0, 1500, 900]}), 4)};

  /* ================================================================ LE COIN « DERRIÈRE » (derrière le chêne) */
  var D = X.derriere;
  FOND.derriere = {ciel:{toile:T.ciel({w:2048, h:860, graine:15}), x0:D - 13000, y0:-9600, w:26000, h:10800, z:-11000}};
  debout('derriere', T.foret({w:4000, h:500, graine:17, n:70, hMin:.5, hMax:.95, ton:[8, 14, 26], brume:[30, 44, 78], brumeK:.6, lune:.3}), D - 8000, 60, -6800, 16000, 2000);
  debout('derriere', T.rangee({w:2400, h:1100, graine:151, arbres:[[.57, 60, .03], [.66, 75, -.02], [.8, 70, .04], [.93, 80, -.03]], feuilles:.42, bas:1.4, lune:.2, sombre:true}), D - 4300, 30, -2600, 8600, 3900);
  /* le dos du chêne : un mur d'écorce, tout près, à gauche ; à sa droite, on voit loin */
  PC.DOS = {x0:D - 1750, x1:D + 250, z:-380};
  debout('derriere', T.ecorceDos({w:1000, h:1500, graine:53}), D - 1750, 30, -380, 2000, 3000);
  debout('derriere', T.feuillage({w:1500, h:520, graine:161, n:110, r:[50, 105], tons:[[4, 9, 11], [8, 19, 20], [14, 31, 31], [50, 76, 84]], ombreBas:.5,
    forme:function(x, y){ return y < .62 + .2 * Math.sin(x * 17) && y > .04; }}), D - 3000, -900, -150, 6000, 2080);
  debout('derriere', T.buisson({w:340, h:240, graine:163}), D + 900, 16, -1100, 700, 490);
  debout('derriere', T.buisson({w:300, h:200, graine:165}), D - 1500, 14, 260, 700, 470, {flouMax:40});
};

/* LE CIEL ET LE SOL, peints pour cette image (sous les plans en 3D) */
var CRANS = [0, .7, 1.4, 2.2, 3.2, 4.5, 6, 8, 11, 15, 20, 27, 36, 46];
PC.peindreFond = function(zone){
  var Fz = FOND[zone], g = PC.fond.getContext('2d'), c = CAM, k;
  g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.clearRect(0, 0, W, H);
  if(!Fz) return;
  /* le ciel : un grand plan debout, très loin (il ne tourne presque pas : on le pose par ses coins) ; puis la lune */
  function debout2(o, x0, y0, w, h, z){
    var a = c.projeter(x0, y0, z), b = c.projeter(x0 + w, y0, z), d = c.projeter(x0, y0 + h, z), f = c.flou((a.d + b.d) / 2);
    g.save(); g.filter = f > .4 ? 'blur(' + U.r(f) + 'px)' : 'none';
    g.setTransform((b.x - a.x) / o.width, (b.y - a.y) / o.width, (d.x - a.x) / o.height, (d.y - a.y) / o.height, a.x, a.y);
    g.drawImage(o, 0, 0); g.restore();
  }
  debout2(Fz.ciel.toile, Fz.ciel.x0, Fz.ciel.y0, Fz.ciel.w, Fz.ciel.h, Fz.ciel.z);
  if(Fz.lune) debout2(Fz.lune.toile, Fz.lune.x - Fz.lune.r, Fz.lune.y - Fz.lune.r, Fz.lune.r * 2, Fz.lune.r * 2, Fz.lune.z);
  /* le sol, net, sur une toile à part : une ligne d'écran = une ligne droite du sol */
  var s2 = PC.solNet.getContext('2d'); s2.setTransform(1, 0, 0, 1, 0, 0); s2.clearRect(0, 0, W, H);
  var cl = Math.cos(c.lacet), sl = Math.sin(c.lacet), ct = Math.cos(c.tangage), st = Math.sin(c.tangage), q0 = PC.TU / PC.herbe[0].width;
  var motifs = PC._motifs || (PC._motifs = PC.herbe.map(function(m){ return s2.createPattern(m, 'repeat'); }));
  var ch = Fz.chemin, motCh = ch ? (ch._motifs || (ch._motifs = ch.mips.map(function(m){ return s2.createPattern(m, 'no-repeat'); }))) : null, qc0 = ch ? ch.w / ch.mips[0].width : 1;
  var lignes = [], tPrec = null, haut = H;
  for(var ys = H - 1; ys >= 0; ys--){
    var Y = ys + .5 - H / 2, vy = Y * ct - P * st, z1 = -Y * st - P * ct;
    if(vy <= .5) break;                                  /* au-dessus de l'horizon */
    var t = -c.y / vy; if(t <= 0) break;
    var dist = t * P; if(dist > 26000) break;            /* trop loin : la brume et la forêt le cachent */
    /* le point du sol vu au bord gauche de la ligne (xs = 0) */
    var X0 = -W / 2, gx = c.x + t * (X0 * cl - z1 * sl), gz = c.z + t * (X0 * sl + z1 * cl);
    /* combien de sol dans un point d'écran : le long de la ligne (t) et dans la profondeur (l'écart avec la ligne d'avant) */
    var prof = tPrec == null ? t : Math.abs(t - tPrec) * P / Math.max(.2, ct), n = Math.max(t, prof * .6);
    tPrec = t;
    function ligne(motifsL, q0L, ox, oz){
      var L = Math.max(0, Math.min(motifsL.length - 1, Math.round(Math.log(Math.max(1, n / q0L)) / Math.LN2))), q = q0L * Math.pow(2, L), kk = q / t;
      var u0 = (gx - ox) / q, v0 = (gz - oz) / q, a = kk * cl, b = -kk * sl, cc = kk * sl, d = kk * cl;
      var m = motifsL[L]; m.setTransform(new DOMMatrix([a, b, cc, d, -(a * u0 + cc * v0), ys - (b * u0 + d * v0)]));
      s2.fillStyle = m; s2.fillRect(0, ys, W, 1);
    }
    ligne(motifs, q0, 0, 0);
    if(ch && gz > ch.z0 && gz < ch.z0 + ch.d) ligne(motCh, qc0, ch.x0, ch.z0);
    lignes.push([ys, dist]); haut = ys;
  }
  /* le flou de la profondeur de champ : par bandes d'écran (du net au très flou), prises dans le sol net */
  var i = 0;
  while(i < lignes.length){
    var f = c.flou(lignes[i][1]), cran = 0;
    for(k = 0; k < CRANS.length; k++) if(Math.abs(CRANS[k] - f) < Math.abs(CRANS[cran] - f)) cran = k;
    var j = i;
    while(j < lignes.length){ var f2 = c.flou(lignes[j][1]), cr2 = 0; for(k = 0; k < CRANS.length; k++) if(Math.abs(CRANS[k] - f2) < Math.abs(CRANS[cr2] - f2)) cr2 = k; if(cr2 !== cran) break; j++; }
    var yBas = lignes[i][0] + 1, yHaut = lignes[j - 1][0];
    g.save(); g.beginPath(); g.rect(0, yHaut, W, yBas - yHaut); g.clip();
    g.filter = CRANS[cran] > 0 ? 'blur(' + CRANS[cran] + 'px)' : 'none';
    g.drawImage(PC.solNet, 0, 0); g.restore();
    i = j;
  }
};

/* à chaque image : la caméra, le coin montré, et le flou de chaque plan selon sa distance */
PC.image = function(E){
  var zone = (E && E.zone) || 'chene';
  PC.monde.style.transform = CAM.transformCSS();
  PC.peindreFond(zone);
  PL.forEach(function(p){
    if(p.zone !== zone){ if(p.vu !== false){ p.el.style.display = 'none'; p.vu = false; } return; }
    if(p.vu !== true){ p.el.style.display = ''; p.vu = true; }
    var pr = CAM.projeter(p.m[0], p.m[1], p.m[2]), f = p.net ? 0 : CAM.flou(pr.d);
    if(p.flouMax) f = Math.min(f, p.flouMax);
    /* le flou CSS est appliqué AVANT la perspective : on le ramène en unités du plan */
    var loc = f / Math.max(pr.s, .05) / p.k;
    p.el.style.filter = loc > .25 ? 'blur(' + U.r(loc) + 'px)' : '';
  });
};
})();
