/* film-descente-3.js — LA DESCENTE PAR LA CRYPTE (Bible §13.68) : la clé d'Anselme dans la vieille porte, l'escalier, le couloir aux
   arches (la caméra suit les héros derrière les piliers), les niches aux crânes — et, à la fin de ce fichier, LES DEUX FILMS :
   leurs plans bout à bout, leurs bruitages, leur réplique. */
(function(){
'use strict';
var U = window.CU, MP = window.MP, HF = window.HF, DF = window.DF, CINE = window.CINE, D = CINE.DESC, PLANS = D.PLANS, DEC = D.DEC;
var K = D.K, r2 = D.r2, porteurs = D.porteurs, porte = D.porte, betes = D.betes, yeuxNoir = D.yeuxNoir, fenetre = D.fenetre;
var CHAUD = D.CHAUD, LAMPE = D.LAMPE, FROID = D.FROID, LUNE = D.LUNE;

/* ================================================================== LE DÉCOR 6 : LA PORTE DE LA CRYPTE, DE PRÈS (la serrure en LX, LY) */
var LX = 150, LY = 26, PW = 900, PH = 780;
DEC.porte = function(S){
  var R = U.hasard(9), i;
  /* derrière la porte : le noir, un couloir voûté qui descend */
  var der = S.couche('derriere', {d:1500, lum:'lum', sc:4});
  der.poser(MP.toile(2200, 1200, 1, function(g, w, h){
    g.translate(1100, 600); g.fillStyle = '#020204'; g.fillRect(-1100, -600, w, h);
    for(i = 0; i < 6; i++){
      var q = Math.pow(.74, i), cx = 40 + i * 10, bas = 250 + i * 46, l = 760 * q, ht = 760 * q;
      g.save(); g.beginPath(); g.moveTo(cx - l / 2, bas); g.lineTo(cx - l / 2, bas - ht + l / 2); g.arc(cx, bas - ht + l / 2, l / 2, Math.PI, 0); g.lineTo(cx + l / 2, bas); g.closePath(); g.clip();
      DF.mur(g, cx - l / 2, bas - ht, l, ht, {graine:50 + i, rang:52 * q, larg:[70 * q, 130 * q], ton:[120 * Math.pow(.72, i), 116 * Math.pow(.72, i), 130 * Math.pow(.74, i)], mousse:.5});
      /* le trou du suivant */
      var q2 = q * .74, l2 = 760 * q2, h2 = 760 * q2, b2 = bas + 46, c2 = cx + 10;
      g.fillStyle = '#020204'; g.beginPath(); g.moveTo(c2 - l2 / 2, b2); g.lineTo(c2 - l2 / 2, b2 - h2 + l2 / 2); g.arc(c2, b2 - h2 + l2 / 2, l2 / 2, Math.PI, 0); g.lineTo(c2 + l2 / 2, b2); g.closePath(); g.fill();
      g.restore();
    }
    var Rt = U.hasard(5); DF.toile(g, -330, -360, 300, .2, 1.3, Rt, .3); DF.toile(g, 420, -330, 260, 1.8, 3.0, Rt, .26);
    for(i = 0; i < 5; i++) DF.racine(g, -300 + Rt() * 640, -400, 100 + Rt() * 180, Rt, [70, 58, 46]);
  }), -1100, -600);
  /* la porte elle-même (elle tourne sur ses gonds, à gauche) */
  var po = S.couche('porte', {d:1000, lum:'lum', sc:6});
  S.porteEl = po.poser(MP.toile(PW, PH, 1.5, function(g){ g.translate(PW * .62, PH / 2); DF.porteCrypte(g, PW, PH); }), LX - PW * .62, LY - PH / 2);
  S.porteEl.style.transformOrigin = '0 50%';
  /* le tour de pierre : les deux montants */
  var ca = S.couche('cadre', {d:985, lum:'lum', sc:6});
  ca.poser(MP.toile(2200, 1200, 1.2, function(g, w, h){
    g.translate(1100, 600);
    DF.mur(g, -1100, -600, 2200, 1200, {graine:17, rang:120, larg:[190, 330], ton:[130, 126, 136], mousse:1.2, humide:1.6});
    var x0 = LX - PW * .62, x1 = x0 + PW;
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x0 - 26, -600, 26, 1200); g.fillRect(x1, -600, 26, 1200);
    g.fillStyle = '#000'; g.globalCompositeOperation = 'destination-out'; g.fillRect(x0, -600, PW, 1200); g.globalCompositeOperation = 'source-over';
    /* les gonds */
    [-250, 270].forEach(function(y){ g.fillStyle = '#3c4048'; g.strokeStyle = '#08080a'; g.lineWidth = 3; g.beginPath(); g.rect(x0 - 40, y - 24, 52, 48); g.fill(); g.stroke(); g.fillStyle = '#7a7f8a'; g.beginPath(); g.arc(x0 - 14, y, 9, 0, 7); g.fill(); g.stroke(); });
  }), -1100, -600);
  S.main = S.couche('main', {d:940, lum:'alpha', sc:5, spec:.5});
  S.fx = S.couche('fx', {d:940, ecran:1});
};
PLANS.cle = {id:'cle', cle:'porte', duree:6.8,
  monter:function(S){ DEC.porte(S); },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 6.8), ouv = K(3.7, 6.5, tl);
    return {cam:{x:U.lerp(LX - 60, LX - 150, ouv), y:LY + 4 - 30 * ouv, zoom:U.lerp(1.5, 1.72, K(0, 3.2, tl)) - .78 * K(3.3, 5.2, tl) + .1 * K(5, 6.8, tl), z:0, focus:1000, ap:1.6}, amb:[16, 18, 34],
      fondu:Math.max(1 - K(0, .7, tl), K(6.3, 6.8, tl) * .9), tremble:U.secousse(tl, 2.4, 5, .35, 60), poussiere:{n:120, k:1, fond:.02}, ouv:ouv};
  },
  dessin:function(S, tl, E){
    var t = S.t, v = 1 + .06 * U.fbm(t * 5, 2, 2), ouv = E.ouv, s = '';
    /* la porte s'ouvre : elle tourne sur ses gonds, vers le noir */
    var an = 74 * U.COURBES.io(ouv) + (ouv > 0 && ouv < 1 ? 1.2 * Math.sin(tl * 9) * (1 - ouv) : 0);
    S.porteEl.style.transform = an > .05 ? 'perspective(2600px) rotateY(' + r2(an) + 'deg)' : '';
    S.porteEl.style.filter = an > .05 ? 'brightness(' + r2(1 - .5 * ouv) + ')' : '';
    /* la clé d'Anselme : elle arrive, elle entre (on la voit de bout), elle tourne, elle ressort */
    var arr = U.COURBES.o(U.inv(.25, 1.5, tl)), entre = K(1.5, 2.0, tl), tour = U.COURBES.dep(U.inv(2.05, 2.5, tl)), sort = K(2.9, 3.5, tl), ec = .78;
    if(sort < 1){
      var e2 = entre * (1 - sort), a2 = arr * (1 - sort * .0), bx = U.lerp(LX - 600, LX - 6, arr) - 320 * sort, by = U.lerp(LY + 330, LY + 16, arr) + 260 * sort, rot = U.lerp(-30, 0, arr) - 26 * sort;
      var sx = U.lerp(1, .16, e2), dx = 306 * ec * (1 - sx) * 0 + 49 * e2, rx = bx + dx - 306 * ec * sx, ry = by - 4 * e2;
      /* (de bout, la clé n'est plus qu'un anneau devant le trou : l'anneau tourne) */
      s += '<g transform="translate(' + r2(bx + dx) + ' ' + r2(by) + ') rotate(' + r2(rot) + ') scale(' + r2(ec * sx) + ' ' + ec + ')">' + '<g transform="rotate(' + r2(90 * tour * (1 - sort)) + ' -306 0)">' + DF.cle() + '</g></g>';
      var px = rx - 26 + 10 * e2, py = ry + 46 - 10 * e2;
      s += '<g transform="translate(' + r2(px) + ' ' + r2(py) + ') rotate(' + r2(rot * .6 + 9 * tour * (1 - sort)) + ')">' + DF.poing(54, 132) + '</g>';
    } else if(ouv < .5){
      /* la main pousse la porte, puis s'en va */
      var pk = K(3.5, 3.9, tl), hx = LX - 250 + 40 * pk - 500 * K(4.6, 5.3, tl), hy = LY + 90 + 300 * K(4.6, 5.3, tl);
      s += '<g transform="translate(' + r2(hx) + ' ' + r2(hy) + ') rotate(-8)" opacity="' + r2(K(3.4, 3.6, tl)) + '">' + DF.poing(54, 150) + '</g>';
    }
    S.main.svg(s);
    /* la lanterne de l'Alchimiste, hors champ en bas à gauche : sa lumière, un halo flou */
    var lx = LX - 620 + 30 * Math.sin(t * .7), ly = LY + 250;
    S.fx.svg(MP.halo(lx, ly, 420 * v, 'Chaud', .5));
    /* le laiton de la clé accroche la lumière quand elle tourne */
    var lum = [{x:lx + 120, y:ly - 90, d:880, c:LAMPE, k:2.3 * v, r:640, z:250, e:1.5}, {x:LX + 900, y:-500, d:880, c:FROID, k:.9, r:800, z:300, e:1},
      {x:LX - 100, y:LY - 40, d:1200, c:LAMPE, k:1.8 * ouv * v, r:700, z:300, e:1.2}];
    return {lum:lum};
  }};

/* ================================================================== LE DÉCOR 7 : L'ESCALIER (il descend vers la droite ; une marche tous les 54, de 26 de haut) */
function marche(x){ return Math.floor(x / 54 + .5) * 26; }
function pente(x){ return x / 54 * 26; }
DEC.escalier = function(S, e){
  var i, R = U.hasard(3), X0 = -1500, X1 = 1500;
  function penteG(g, dy0, dy1, x0, x1){ g.beginPath(); g.moveTo(x0, pente(x0) + dy0); g.lineTo(x1, pente(x1) + dy0); g.lineTo(x1, pente(x1) + dy1); g.lineTo(x0, pente(x0) + dy1); g.closePath(); }
  var mur = S.couche('mur', {d:1140, lum:'lum', sc:5});
  mur.poser(MP.toile(3000, 2100, e * .8, function(g, w, h){
    g.translate(1500, 1050);
    DF.mur(g, -1500, -1050, 3000, 2100, {graine:21, rang:54, larg:[90, 170], ton:[122, 118, 132], mousse:.8, humide:1.6});
    /* des niches le long de la descente : une urne, un crâne, une chandelle morte */
    var Rn = U.hasard(7);
    for(i = -4; i <= 4; i++){
      var nx = i * 300 + 60, ny = pente(nx * 1.14) / 1.14 - 60;
      DF.arche(g, nx, ny, 92, 132, {graine:60 + i, ep:16, fond:[5, 5, 9]});
      if((i + 8) % 3 === 0) DF.crane(g, nx, ny - 22, 1.5, Rn);
      else if((i + 8) % 3 === 1){ g.fillStyle = '#8a7a66'; g.strokeStyle = '#140f0c'; g.lineWidth = 2; g.beginPath(); g.moveTo(nx - 10, ny - 2); g.bezierCurveTo(nx - 26, ny - 18, nx - 22, ny - 48, nx - 9, ny - 56); g.lineTo(nx + 9, ny - 56); g.bezierCurveTo(nx + 22, ny - 48, nx + 26, ny - 18, nx + 10, ny - 2); g.closePath(); g.fill(); g.stroke(); }
      else { g.fillStyle = '#d8cfb4'; g.strokeStyle = '#140f0c'; g.lineWidth = 2; g.beginPath(); g.rect(nx - 6, ny - 34, 12, 32); g.fill(); g.stroke(); g.beginPath(); g.moveTo(nx, ny - 34); g.lineTo(nx, ny - 42); g.stroke(); }
      DF.toile(g, nx - 46, ny - 132, 70, .1, 1.5, Rn, .28);
    }
    for(i = 0; i < 10; i++) DF.racine(g, -1400 + Rn() * 2800, pente(-1400) / 1.14 - 600 + Rn() * 1500, 90 + Rn() * 160, Rn, [80, 66, 52]);
  }), -1500, -1050);
  /* les marches (la masse de pierre sous les pieds) */
  var ma = S.couche('marches', {d:1000, lum:'lum', sc:5});
  ma.poser(MP.toile(3000, 2000, e, function(g, w, h){
    g.translate(1500, 1000);
    g.save(); g.beginPath(); g.moveTo(X0, 1000);
    for(var n = Math.round(X0 / 54); n <= Math.round(X1 / 54); n++){ g.lineTo((n - .5) * 54, n * 26); g.lineTo((n + .5) * 54, n * 26); }
    g.lineTo(X1, 1000); g.closePath(); g.clip();
    DF.mur(g, -1500, -1000, 3000, 2000, {graine:5, rang:44, larg:[70, 130], ton:[112, 108, 118], mousse:.6, humide:1});
    g.restore();
    /* chaque marche : une dalle plus claire, son nez arrondi, l'ombre dessous */
    for(var n2 = Math.round(X0 / 54); n2 <= Math.round(X1 / 54); n2++){
      var x = (n2 - .5) * 54, y = n2 * 26;
      DF.bloc(g, x - 4, y - 1, 62, 12, [150 + R() * 20, 146 + R() * 18, 152 + R() * 16], R, {j:.6, r:4, fis:.1});
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x + 2, y + 11, 54, 6);
      if(R() < .3) DF.tache(g, x + 27, y + 4, 22, 5, [60, 100, 60], .6);
    }
  }), -1500, -1000);
  var act = S.couche('act', {d:1000, lum:'alpha', sc:4.5, spec:.35});
  S.fx = S.couche('fx', {d:1000, ecran:1});
  /* devant, en bas : le muret de la rampe ; en haut : la voûte qui descend avec nous */
  var av = S.couche('rampe', {d:890, lum:'lum', sc:4, lumK:.75});
  av.poser(MP.toile(3200, 2300, e * .6, function(g, w, h){
    g.translate(1600, 1150);
    g.save(); penteG(g, 112, 900, -1600, 1600); g.clip(); DF.mur(g, -1600, -1150, 3200, 2300, {graine:33, rang:60, larg:[100, 190], ton:[108, 104, 114], mousse:1}); g.restore();
    g.save(); penteG(g, 100, 122, -1600, 1600); g.clip(); DF.mur(g, -1600, -1150, 3200, 2300, {graine:35, rang:300, larg:[80, 140], ton:[146, 142, 150]}); g.restore();
  }), -1600, -1150);
  var pl = S.couche('voute', {d:870, lum:'lum', sc:4, lumK:.6});
  pl.poser(MP.toile(3200, 2300, e * .6, function(g, w, h){
    g.translate(1600, 1150);
    g.save(); g.beginPath(); g.moveTo(-1600, -1150);
    for(i = 0; i <= 40; i++){ var x = -1600 + i * 80; g.lineTo(x, pente(x) - 330 + U.fbm(i * .7, 4, 2) * 22 + (i % 5 === 0 ? 46 : 0)); }
    g.lineTo(1600, -1150); g.closePath(); g.clip();
    DF.roche(g, -1600, -1150, 3200, 2300, {graine:9, ton:[100, 96, 104], taille:90}); g.restore();
    var Rr = U.hasard(4); for(i = 0; i < 16; i++){ var rx = -1500 + Rr() * 3000; DF.racine(g, rx, pente(rx) - 336, 60 + Rr() * 130, Rr, [70, 58, 46]); }
  }), -1600, -1150);
  /* tout près : des piliers qui passent, flous */
  var pp = S.couche('premier', {d:440, lum:'lum', sc:2, lumK:.4, ambK:1.2});
  pp.poser(MP.toile(3600, 3200, .4, function(g){ g.translate(1800, 1600); var Rp = U.hasard(8);
    [-1200, 300, 1500].forEach(function(x){ for(var y = -1600; y < 1600; y += 160) DF.bloc(g, x - 120 + Rp() * 12, y, 240, 160, [92, 88, 96], Rp, {j:3, r:14}); }); }), -1800, -1600);
  S.act = act; S.mur = mur; S.marchesC = ma;
  S.H = {a:HF.creer(S, act, 'alchimiste'), s:HF.creer(S, act, 'sage'), p:HF.creer(S, act, 'pisteur')};
};
var VE = 84, XE0 = -600;
PLANS.escalier = {id:'escalier', cle:'escalier', duree:6.2,
  monter:function(S){ DEC.escalier(S, 1.2); },
  etat:function(S, tl){
    var X = XE0 + VE * tl + 30 + 20 * tl / 6.2;
    return {cam:{x:X, y:pente(X) - 104, zoom:1.06 + .03 * tl / 6.2, roll:0, focus:1000, ap:1.35}, amb:[15, 17, 32], fondu:Math.max(1 - K(0, .5, tl), 0), poussiere:{n:130, k:.9, fond:.02}};
  },
  acteurs:function(S, tl){
    var H = S.H;
    [['p', 'pisteur', 0, 1], ['s', 'sage', -162, 2], ['a', 'alchimiste', -310, 3]].forEach(function(q){
      var X = XE0 + q[2] + VE * tl, m = HF.marche(X, marche, {x0:0, pente:pente, torse:q[0] === 's' ? 5 : 9, bas:13, leve:13});
      porte(m.pose, q[1], tl, q[0] === 'p' ? {my:112, mx:182} : {});
      m.pose.tete = (q[0] === 's' ? 2 : 3) + 3 * Math.sin(tl * 1.1 + q[3]);
      HF.poser(H[q[0]], {x:X, y:m.y, pose:m.pose, cligne:HF.cligne(tl, q[3]), regard:[1.2, 1.6], sourcils:q[0] === 's' ? 'souci' : 'garde'});
    });
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:pente(S.H.p.x) + 6, solC:['marches']}), H = S.H, Xp = H.p.x;
    /* une bête sur les marches, plus bas : elle file devant la lumière */
    var B = betes([{x0:-250, y:0, t0:1.5, vers:1, v:420, s:1.1, regarde:-1, sol:marche, dure:2.6}, {x0:20, y:0, t0:3.6, vers:1, v:460, s:1.25, regarde:-1, sol:marche, dure:2.6}], tl);
    S.marchesC.svg(B.corps + [H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x + 6, marche(a.x) + 3, 46, .6); }).join(''));
    /* des yeux dans les niches, plus bas : ils s'éteignent quand on approche */
    var yx = []; for(var i = -1; i <= 3; i++){ var nx = i * 300 + 60; if((i + 8) % 3 !== 0) yx.push([nx, pente(nx * 1.14) / 1.14 - 60 - 16, -1, (nx * 1.14 - XE0 - 330) / VE, 7, 1.8]); }
    S.mur.svg(yeuxNoir(yx, tl));
    S.fx.svg(P.fx + B.yeux);
    return {lum:P.lum};
  }};

/* ================================================================== LE DÉCOR 8 : LE COULOIR AUX ARCHES (le sol en y = 170 ; la caméra suit, derrière une rangée de piliers) */
var SOLC = 170, TRAVEE = 400;
DEC.couloir = function(S, e){
  var i, R = U.hasard(18);
  var mur = S.couche('mur', {d:1160, lum:'lum', sc:5});
  mur.poser(MP.toile(4800, 700, e, function(g, w, h){
    g.translate(2300, 540);
    DF.mur(g, -2300, -540, 4800, 700, {graine:14, rang:56, larg:[90, 170], ton:[122, 118, 132], mousse:.8, humide:1.5});
    for(var x = -2300; x < 2500; x += 70) DF.bloc(g, x, -300, 70, 28, [148, 142, 150], R, {j:1.6});
    var Rn = U.hasard(11);
    for(var b = -6; b <= 6; b++){
      var bx = b * TRAVEE, sorte = ((b % 4) + 4) % 4;
      /* le pilastre entre deux travées */
      for(var y = -540; y < 140; y += 60) DF.bloc(g, bx - 200 - 34, y, 68, 60, [146, 140, 150], R, {j:1.8});
      DF.bloc(g, bx - 200 - 46, -326, 92, 30, [160, 154, 160], R, {j:1.6}); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(bx - 200 + 34, -296, 10, 440);
      /* la niche de la travée */
      if(sorte === 0 || sorte === 2){
        /* un tombeau dans un renfoncement */
        g.fillStyle = '#060609'; g.fillRect(bx - 130, -90, 260, 190); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 5; g.strokeRect(bx - 130, -90, 260, 190);
        DF.bloc(g, bx - 112, 26, 224, 74, [128, 122, 128], Rn, {j:1.4, r:5}); DF.bloc(g, bx - 120, -2, 240, 32, [150, 144, 148], Rn, {j:1.2, r:8});
        g.strokeStyle = 'rgba(20,16,20,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 40, 62); g.lineTo(bx, 44); g.lineTo(bx + 40, 62); g.lineTo(bx, 80); g.closePath(); g.stroke();
        DF.toile(g, bx - 130, -90, 110, .1, 1.4, Rn, .3);
      } else if(sorte === 1){
        /* des rayons de crânes */
        DF.arche(g, bx, 100, 230, 220, {graine:70 + b, ep:22, fond:[5, 5, 8]});
        g.fillStyle = '#3a3438'; g.fillRect(bx - 110, 4, 220, 8);
        for(i = 0; i < 4; i++){ DF.crane(g, bx - 78 + i * 52, 78, 1.35, Rn); if(i < 3) DF.crane(g, bx - 52 + i * 52, -16, 1.25, Rn); }
      } else {
        /* une grille de fer devant un trou noir */
        DF.arche(g, bx, 100, 200, 240, {graine:80 + b, ep:22, fond:[4, 4, 7]});
        g.strokeStyle = '#101216'; g.lineWidth = 9; for(i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(bx + i * 27, -116); g.lineTo(bx + i * 27, 100); g.stroke(); } g.beginPath(); g.moveTo(bx - 96, -30); g.lineTo(bx + 96, -30); g.moveTo(bx - 96, 44); g.lineTo(bx + 96, 44); g.stroke();
        g.strokeStyle = '#4a5058'; g.lineWidth = 3; for(i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(bx + i * 27 - 2, -112); g.lineTo(bx + i * 27 - 2, 98); g.stroke(); }
      }
    }
    for(i = 0; i < 16; i++) DF.racine(g, -2200 + Rn() * 4500, -540, 80 + Rn() * 190, Rn, [84, 68, 52]);
    for(i = 0; i < 9; i++) DF.toile(g, -2200 + Rn() * 4500, -296, 90 + Rn() * 60, .1, 1.5, Rn, .26);
  }), -2300, -540);
  var sol = S.couche('sol', {d:1000, lum:'lum', sc:4.5});
  sol.poser(MP.toile(5400, 230, e, function(g, w, h){ DF.dalles(g, 0, 0, w, h, {graine:8, rangs:3, larg:150, ton:[122, 118, 126]}); }), -2700, SOLC - 22);
  var deco = S.couche('deco', {d:1000, lum:'lum', sc:4});
  deco.poser(MP.toile(5400, 240, e, function(g){
    g.translate(2700, 196); var Rg = U.hasard(6);
    for(i = 0; i < 11; i++) DF.gravats(g, -2600 + i * 480 + Rg() * 200, 4 + Rg() * 8, 150 + Rg() * 100, 9, Rg, [118, 114, 122]);
    for(i = 0; i < 8; i++){ var ux = -2500 + i * 640 + Rg() * 160; g.save(); g.translate(ux, 4); var gu = g.createLinearGradient(-26, 0, 26, 0); gu.addColorStop(0, '#5c5048'); gu.addColorStop(.35, '#a08c78'); gu.addColorStop(1, '#40362e'); g.fillStyle = gu; g.strokeStyle = '#120e0c'; g.lineWidth = 2.6;
      g.beginPath(); g.moveTo(-12, 0); g.bezierCurveTo(-34, -20, -32, -62, -14, -76); g.lineTo(-17, -90); g.lineTo(17, -90); g.lineTo(14, -76); g.bezierCurveTo(32, -62, 34, -20, 12, 0); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  }), -2700, SOLC - 196 - 4);
  S.objets = S.couche('objets', {d:1000, lum:'lum', sc:3});
  var act = S.couche('act', {d:1000, lum:'alpha', sc:4.5, spec:.35});
  S.fx = S.couche('fx', {d:1000, ecran:1});
  /* LA RANGÉE D'ARCHES, entre eux et nous : des piliers, des arcs ; ils passent devant les héros et les cachent un instant */
  var ar = S.couche('arcade', {d:760, lum:'lum', sc:5, lumK:.5, ambK:.75});
  var PAS = 640, LP = 124, NB = 9;
  ar.poser(MP.toile(PAS * NB, 800, e * .7, function(g, w, h){
    g.translate(0, 400);
    DF.mur(g, 0, -400, w, 800, {graine:27, rang:74, larg:[110, 210], ton:[116, 112, 124], mousse:.7, humide:1.4});
    g.fillStyle = '#000'; g.globalCompositeOperation = 'destination-out';
    for(i = 0; i < NB; i++){ var x0 = i * PAS + LP / 2, x1 = (i + 1) * PAS - LP / 2, r = (x1 - x0) / 2, yc = -322 + r; g.beginPath(); g.moveTo(x0, 420); g.lineTo(x0, yc); g.arc(x0 + r, yc, r, Math.PI, 0); g.lineTo(x1, 420); g.closePath(); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    var Ra = U.hasard(2);
    for(i = 0; i <= NB; i++){
      var px = i * PAS;
      /* le fût du pilier : de grosses pierres ; son chapiteau, son socle */
      for(var y = -70; y < 400; y += 78) DF.bloc(g, px - LP / 2, y, LP, 78, [140 + Ra() * 14, 134 + Ra() * 12, 144 + Ra() * 12], Ra, {j:2, r:6});
      DF.bloc(g, px - LP / 2 - 16, -96, LP + 32, 34, [156, 150, 158], Ra, {j:1.6, r:5}); DF.bloc(g, px - LP / 2 - 18, 250, LP + 36, 150, [132, 126, 134], Ra, {j:2, r:6});
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(px + LP / 2 - 16, -62, 16, 312);
    }
  }), -PAS * NB / 2 + PAS / 2 - 150, -400);
  /* tout près de nous : des chaînes, des toiles qui pendent */
  var pp = S.couche('premier', {d:430, lum:'lum', sc:2, lumK:.4, ambK:1.2});
  pp.poser(MP.toile(5200, 800, .5, function(g){ g.translate(2600, 400); var Rp = U.hasard(5);
    for(i = 0; i < 6; i++){ var cx = -2400 + i * 900 + Rp() * 200; g.strokeStyle = '#30323a'; g.lineWidth = 10; for(var q = 0; q < 6 + Rp() * 5; q++){ g.beginPath(); g.ellipse(cx, -400 + q * 44, q % 2 ? 10 : 17, 26, 0, 0, 7); g.stroke(); }
      DF.racine(g, cx + 240, -400, 180 + Rp() * 200, Rp, [44, 38, 32]); DF.toile(g, cx - 300, -400, 240, .3, 2.6, Rp, .22); }
  }), -2600, -400);
  S.act = act; S.mur = mur;
  S.H = {a:HF.creer(S, act, 'alchimiste'), s:HF.creer(S, act, 'sage'), p:HF.creer(S, act, 'pisteur')};
};
var XC0 = -760, BETES_C = [];
(function(){ var R = U.hasard(31); for(var i = 0; i < 9; i++){ var x = -420 + i * 150 + R() * 70; BETES_C.push({x0:x, y:SOLC + 10 + R() * 54, t0:(x - 250 - XC0) / 96, vers:1, v:520 + R() * 160, s:.95 + R() * .5, regarde:-1, dure:1.9}); } })();
PLANS.arches = {id:'arches', cle:'couloir', duree:9,
  monter:function(S){ DEC.couloir(S, 1.15); },
  etat:function(S, tl){
    var X = XC0 + 96 * tl;
    return {cam:{x:X + 70 + 50 * U.tresLisse(tl / 9), y:-24, zoom:1.03, focus:1000, ap:1.45}, amb:[16, 18, 34], poussiere:{n:140, k:.9, fond:.02}};
  },
  acteurs:function(S, tl){
    var H = S.H, sol = function(){ return SOLC; };
    [['p', 'pisteur', 0, 1], ['s', 'sage', -158, 2], ['a', 'alchimiste', -306, 3]].forEach(function(q){
      var X = XC0 + q[2] + 96 * tl, m = HF.marche(X, sol, {x0:0, torse:q[0] === 's' ? 3 : 6});
      porte(m.pose, q[1], tl, {});
      /* ils regardent autour d'eux : la tête se lève vers les voûtes, se baisse vers les niches */
      m.pose.tete = (q[0] === 's' ? -3 : -5) + 7 * Math.sin(tl * .8 + q[3] * 1.7);
      HF.poser(H[q[0]], {x:X, y:m.y, pose:m.pose, cligne:HF.cligne(tl, q[3]), regard:[1.2, Math.sin(tl * .8 + q[3] * 1.7)], sourcils:q[0] === 'p' ? 'garde' : 'souci'});
    });
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOLC}), H = S.H, B = betes(BETES_C, tl);
    /* (la rangée d'arches est devant les lumières : elle en prend quand même un peu, sur ses bords) */
    P.lum.forEach(function(L){ L.derriere = 520; });
    S.objets.svg([H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x, SOLC + 4, 62, .75); }).join('') + B.corps);
    /* des yeux dans les trous noirs des grilles : ils s'éteignent quand la lumière arrive */
    var yx = []; for(var b = -1; b <= 4; b++) if(((b % 4) + 4) % 4 === 3){ var bx = b * TRAVEE; yx.push([bx - 30, 60, -1, (bx * 1.16 - XC0 - 300) / 96, 8, 2.2], [bx + 40, -10, -1, (bx * 1.16 - XC0 - 380) / 96, 7, 2]); }
    S.mur.svg(yeuxNoir(yx, tl));
    S.fx.svg(P.fx + B.yeux);
    return {lum:P.lum};
  }};

/* ================================================================== LE DÉCOR 9 : UNE NICHE AUX CRÂNES, DE PRÈS (la lumière passe ; des yeux dans un trou) */
DEC.niche = function(S){
  var R = U.hasard(7), i;
  var mur = S.couche('mur', {d:1080, lum:'lum', sc:6});
  mur.poser(MP.toile(2400, 900, 1.2, function(g, w, h){
    g.translate(1200, 450);
    DF.mur(g, -1200, -450, 2400, 900, {graine:19, rang:130, larg:[210, 380], ton:[124, 120, 134], mousse:1.4, humide:2});
    /* la niche : un renfoncement voûté, deux rayons */
    DF.arche(g, -60, 300, 820, 620, {graine:5, ep:54, fond:[6, 6, 10]});
    g.fillStyle = '#4a444a'; g.strokeStyle = '#0c0a0c'; g.lineWidth = 3; g.beginPath(); g.rect(-470, 20, 820, 24); g.fill(); g.stroke(); g.beginPath(); g.rect(-470, 276, 820, 26); g.fill(); g.stroke();
    var Rc = U.hasard(3);
    for(i = 0; i < 5; i++) DF.crane(g, -380 + i * 160 + Rc() * 20, -40, 3.5, Rc);
    for(i = 0; i < 5; i++) DF.crane(g, -390 + i * 164 + Rc() * 20, 214, 3.6, Rc);
    /* des chandelles mortes, leurs coulures */
    [[-200, 20], [130, 276], [-420, 276]].forEach(function(q){ g.fillStyle = '#d8cfb4'; g.strokeStyle = '#140f0c'; g.lineWidth = 2.4; g.beginPath(); g.rect(q[0] - 12, q[1] - 56, 24, 56); g.fill(); g.stroke(); g.beginPath(); g.moveTo(q[0], q[1] - 56); g.lineTo(q[0] + 2, q[1] - 70); g.stroke(); DF.tache(g, q[0], q[1] - 4, 26, 8, [216, 207, 180], .9); });
    DF.toile(g, -470, -320, 300, .1, 1.5, Rc, .34); DF.toile(g, 350, -320, 260, 1.7, 3.1, Rc, .3); DF.toile(g, 20, 44, 150, 0, 1.6, Rc, .24);
    /* à droite, une pierre descellée : un trou noir */
    g.fillStyle = '#030305'; g.beginPath(); g.moveTo(500, 150); g.lineTo(668, 142); g.lineTo(678, 250); g.lineTo(506, 260); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 6; g.stroke();
    for(i = 0; i < 5; i++) DF.racine(g, -1100 + Rc() * 2200, -450, 120 + Rc() * 200, Rc, [84, 68, 52]);
  }), -1200, -450);
  S.mur = mur;
  S.fx = S.couche('fx', {d:1080, ecran:1});
  S.av = S.couche('avant', {d:560, lum:'alpha', sc:4, lumK:.5});
  S.avFx = S.couche('avantFx', {d:560, ecran:1});
};
PLANS.niches = {id:'niches', cle:'niche', duree:3.6,
  monter:function(S){ DEC.niche(S); },
  etat:function(S, tl){
    var k = tl / 3.6;
    return {cam:{x:-40 + 190 * k, y:-10 + 14 * k, zoom:1.05 + .1 * k, focus:1080, ap:1.7}, amb:[14, 16, 30], poussiere:{n:140, k:1, fond:.02}};
  },
  dessin:function(S, tl, E){
    var t = S.t, v = MP.vacille(t, 1), xt = -1250 + 640 * tl, lum = [{x:xt, y:-40, d:900, c:CHAUD, k:2.6 * v, r:520, z:240, e:1.7}, {x:xt - 560, y:60, d:900, c:LAMPE, k:1.3, r:420, z:220, e:1.7}, {x:xt - 300, y:-200, d:900, c:FROID, k:1.0, r:420, z:220, e:1.7}];
    /* les yeux dans le trou : ils s'allument, clignent, et s'en vont quand la lumière les touche */
    S.fx.svg(yeuxNoir([[590, 200, .5, 2.5, 24, 4]], tl));
    /* une bête file au premier plan (floue) */
    var B = betes([{x0:880, y:262, t0:1.9, vers:-1, v:1500, s:5, dure:1.4, regarde:-1}], tl);
    S.av.svg(B.corps); S.avFx.svg(B.yeux);
    return {lum:lum};
  }};

/* ================================================================== LES DEUX FILMS */
var FIN = ['regard', 'carnet', 'rune', 'sage', 'allons'];
function assembler(noms){ var t = 0; return noms.map(function(n){ var P = Object.assign({}, PLANS[n]); P.t0 = t; t += P.duree; P.t1 = t; return P; }); }
function debut(plans, id){ for(var i = 0; i < plans.length; i++) if(plans[i].id === id) return plans[i].t0; return 0; }
function defs(){ return '<linearGradient id="dsRayon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8d8ff" stop-opacity=".95"/><stop offset=".55" stop-color="#9ab4f0" stop-opacity=".45"/><stop offset="1" stop-color="#8aa4e0" stop-opacity="0"/></linearGradient>'; }
/* des pas : un bruit de pas tous les « pas » secondes, de t0 à t1 */
function pas(sons, id, t0, t1, ecart){ for(var t = t0; t < t1 - .05; t += ecart) sons.push([r2(t), id]); }
/* les sons de la fin commune (f : le début du plan « regard ») */
function sonsFin(S, p){
  var f = debut(p, 'regard'), c = debut(p, 'carnet'), r = debut(p, 'rune'), s = debut(p, 'sage'), a = debut(p, 'allons');
  S.push([f, 'cineTorche'], [f + 1.2, 'cineEtoffe'], [c, 'cineTorche'], [c + 1.1, 'cineSouffleFeu'], [c + 3.3, 'cineEclat'], [r, 'cineRune'], [r + .1, 'cineTorche'], [s, 'cineTorche'], [s + .2, 'cineRune'], [s + 1.2, 'cineHm'], [s + 2.0, 'cineEtoffe'],
    [a, 'cineTorche'], [a + .1, 'cineEtoffe'], [a + .3, 'cineRune']);
  pas(S, 'cinePasPierre', a + 3.62, a + 5.1, .5);
  return S;
}
(function(){
  var p = assembler(['clairiere', 'margelle', 'cordeHaut', 'conduit', 'fond'].concat(FIN)), S = [], m = debut(p, 'margelle'), ch = debut(p, 'cordeHaut'), co = debut(p, 'conduit'), fo = debut(p, 'fond');
  S.push([.2, 'cineVent'], [1.6, 'cineHibou'], [0, 'cineTorche'], [3.6, 'cineTorche']);
  pas(S, 'cinePasHerbe', .15, 5.4, .56);
  S.push([m, 'cineTorche'], [m + .3, 'cineVent'], [m + 1.85, 'cineEtoffe'], [m + 2.0, 'cineChuteTorche'], [m + 2.9, 'cineHm']);
  S.push([ch, 'cineCordeGrince'], [ch + .3, 'cineCorde'], [ch + 1.3, 'cineCorde'], [ch + 2.3, 'cineCorde'], [ch + 1.6, 'cineLanterne']);
  S.push([co + .1, 'cineCorde'], [co + 1.1, 'cineCorde'], [co + 2.1, 'cineCorde'], [co + 3.1, 'cineCorde'], [co + 4.1, 'cineCorde'], [co + .6, 'cineGoutte'], [co + 2.4, 'cineGoutte'], [co + 4.3, 'cineGoutte'], [co + 1.8, 'cineCordeGrince'], [co + 2.7, 'cineCouinement']);
  S.push([fo, 'cineTorche'], [fo + .4, 'cineCorde'], [fo + 1.4, 'cineCorde'], [fo + 2.6, 'cineAtterrit'], [fo + 2.75, 'cineBetes'], [fo + 3.5, 'cineEtoffe'], [fo + 4.15, 'cineSouffleFeu'], [fo + 4.5, 'cineBetes'], [fo + 3.9, 'cineTorche'], [fo + 5.7, 'cineLueur'], [fo + 1.2, 'cineGoutte'], [fo + 5.2, 'cineGoutte']);
  CINE.films.puits = {nom:'Le puits', rendu:'multiplan', plans:p, duree:p[p.length - 1].t1, defs:defs, sons:sonsFin(S, p).sort(function(a, b){ return a[0] - b[0]; }),
    sousTitres:[[r2(debut(p, 'allons') + .55), r2(debut(p, 'allons') + 4.0), 'Allons-y. Odette doit être par là.', 'Le Pisteur']]};
})();
(function(){
  var p = assembler(['cle', 'escalier', 'arches', 'niches', 'salleCrypte'].concat(FIN)), S = [], e = debut(p, 'escalier'), a = debut(p, 'arches'), n = debut(p, 'niches'), sa = debut(p, 'salleCrypte');
  S.push([.2, 'cineLanterne'], [1.45, 'cineCleEntre'], [2.05, 'cineCleTourne'], [2.95, 'cineCleEntre'], [3.7, 'cineGrille'], [5.9, 'cineVentCave']);
  S.push([e, 'cineTorche'], [e + 3.4, 'cineTorche'], [e + .9, 'cineGoutte'], [e + 4.4, 'cineGoutte'], [e + 1.5, 'cineBetes'], [e + 3.6, 'cineCouinement'], [e + 2.2, 'cineLanterne']);
  pas(S, 'cinePasEscalier', e + .1, e + 6.1, .82);
  S.push([a, 'cineTorche'], [a + 3.6, 'cineTorche'], [a + 7.0, 'cineTorche'], [a + .2, 'cineVentCave'], [a + 1.3, 'cineBetes'], [a + 3.1, 'cineCouinement'], [a + 4.4, 'cineBetes'], [a + 6.2, 'cineCouinement'], [a + 7.3, 'cineBetes'], [a + 2.4, 'cineGoutte'], [a + 5.6, 'cineGoutte'], [a + 4.9, 'cineLanterne']);
  pas(S, 'cinePasPierre', a + .1, a + 8.9, .56); pas(S, 'cinePasPierre', a + .38, a + 8.9, .84);
  S.push([n, 'cineTorche'], [n + .5, 'cineSouffleFeu'], [n + 1.0, 'cineCouinement'], [n + 1.9, 'cineBetes'], [n + 2.5, 'cineGoutte']);
  pas(S, 'cinePasPierre', n + .1, n + 3.5, .56);
  S.push([sa, 'cineTorche'], [sa + .6, 'cineBetes'], [sa + 1.7, 'cineCouinement'], [sa + 2.1, 'cineBetes'], [sa + 3.3, 'cineGoutte']);
  pas(S, 'cinePasPierre', sa + .1, sa + 3.6, .56); pas(S, 'cinePasPierre', sa + .4, sa + 3.9, .84);
  CINE.films.escalier = {nom:'La crypte', rendu:'multiplan', plans:p, duree:p[p.length - 1].t1, defs:defs, sons:sonsFin(S, p).sort(function(a, b){ return a[0] - b[0]; }),
    sousTitres:[[r2(debut(p, 'allons') + .55), r2(debut(p, 'allons') + 4.0), 'Allons-y. Odette doit être par là.', 'Le Pisteur']]};
})();
})();
