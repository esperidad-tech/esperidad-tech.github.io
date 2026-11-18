/* film-descente-2.js — LA DESCENTE, SUITE (Bible §13.68) : le conduit du puits, la salle d'en bas (le fond du puits ; la même, sans la
   corde, pour ceux qui arrivent par la crypte), et LA FIN COMMUNE aux deux films : le Pisteur regarde à ses pieds, le carnet dans le
   noir, la torche l'éclaire, la pierre de rune qui luit, le Sage se baisse, « Allons-y. Odette doit être par là. ». */
(function(){
'use strict';
var U = window.CU, MP = window.MP, HF = window.HF, DF = window.DF, CINE = window.CINE, D = CINE.DESC, PLANS = D.PLANS, DEC = D.DEC;
var K = D.K, r2 = D.r2, porteurs = D.porteurs, porte = D.porte, betes = D.betes, yeuxNoir = D.yeuxNoir, fenetre = D.fenetre;
var CHAUD = D.CHAUD, LAMPE = D.LAMPE, FROID = D.FROID, LUNE = D.LUNE, RUNE = D.RUNE;

/* ================================================================== LE DÉCOR 2 : LE CONDUIT DU PUITS (vu en coupe : la corde au milieu, en x = 0) */
DEC.conduit = function(S, e){
  var i, R = U.hasard(6);
  /* le mur rond du fond : des assises de pierres, des racines, de la mousse (un grand pan, répété de haut en bas) */
  var fond = S.couche('fond', {d:1170, lum:'lum', sc:5});
  var pan = MP.toile(700, 1500, e, function(g, w, h){
    DF.mur(g, 0, 0, w, h, {graine:8, rang:50, larg:[84, 150], ton:[126, 124, 134], mousse:1.6, humide:2.2, rond:1});
    var Rr = U.hasard(15); for(i = 0; i < 5; i++) DF.racine(g, 120 + Rr() * 460, Rr() * h, 120 + Rr() * 160, Rr, [86, 70, 54]);
    /* une pierre qui manque : un trou noir (une bête y a ses yeux) */
    g.fillStyle = '#040406'; g.beginPath(); g.moveTo(424, 742); g.lineTo(512, 738); g.lineTo(518, 782); g.lineTo(430, 786); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 5; g.stroke();
    DF.toile(g, 150, 380, 120, .1, 1.5, Rr, .3);
  });
  [-1, 0, 1, 2].forEach(function(n){ var c = n === 0 ? pan : MP.toile(700, 1500, 1, function(g){ g.drawImage(pan, 0, 0, 700, 1500); }); fond.poser(c, -350, n * 1500 - 750); });
  S.corde = S.couche('corde', {d:1000, lum:'lum', sc:3});
  S.corde.svg(DF.corde(0, -3200, 4200, 7));
  var act = S.couche('act', {d:1000, lum:'alpha', sc:4.5, spec:.4});
  S.fx = S.couche('fx', {d:1000, ecran:1});
  /* les deux côtés du conduit (plus près de nous) : la roche, des pierres qui dépassent */
  var cot = S.couche('cotes', {d:800, lum:'lum', sc:5, lumK:.8});
  function cote(sens){
    return MP.toile(560, 1500, e * .8, function(g, w, h){
      g.save(); g.beginPath();
      if(sens < 0){ g.moveTo(0, 0); for(i = 0; i <= 30; i++){ var y = h * i / 30; g.lineTo(w - 70 + U.fbm(y * .008, 3, 3) * 60 + (i % 5 === 2 ? 30 : 0), y); } g.lineTo(0, h); }
      else { g.moveTo(w, 0); for(i = 0; i <= 30; i++){ var y2 = h * i / 30; g.lineTo(70 + U.fbm(y2 * .008, 9, 3) * 60 - (i % 6 === 3 ? 30 : 0), y2); } g.lineTo(w, h); }
      g.closePath(); g.clip();
      DF.roche(g, 0, 0, w, h, {graine:sens < 0 ? 21 : 27, ton:[104, 98, 104], taille:86});
      var gr = g.createLinearGradient(sens < 0 ? w : 0, 0, sens < 0 ? w - 150 : 150, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var Rm = U.hasard(sens < 0 ? 4 : 5); for(i = 0; i < 30; i++) DF.tache(g, sens < 0 ? w - 60 - Rm() * 80 : 60 + Rm() * 80, Rm() * h, 20 + Rm() * 30, 14 + Rm() * 26, [70, 110, 70], .5);
      g.restore();
    });
  }
  var cg = cote(-1), cd = cote(1);
  [-1, 0, 1, 2].forEach(function(n){
    cot.poser(n === 0 ? cg : MP.toile(560, 1500, 1, function(g){ g.drawImage(cg, 0, 0, 560, 1500); }), -330 - 560 + 96, n * 1500 - 750);
    cot.poser(n === 0 ? cd : MP.toile(560, 1500, 1, function(g){ g.drawImage(cd, 0, 0, 560, 1500); }), 330 - 96, n * 1500 - 750);
  });
  /* tout près de nous : des pierres et des racines qui passent, floues */
  var pp = S.couche('premier', {d:430, lum:'lum', sc:2, lumK:.4, ambK:1});
  pp.poser(MP.toile(1500, 3000, .5, function(g, w, h){
    var Rp = U.hasard(12);
    for(i = 0; i < 7; i++){ var gauche = i % 2 === 0, y = 200 + i * 400 + Rp() * 120, x0 = gauche ? 0 : w, l = 260 + Rp() * 200;
      g.save(); g.beginPath(); g.moveTo(x0, y - 150); g.quadraticCurveTo(x0 + (gauche ? l : -l), y - 40, x0 + (gauche ? l * .8 : -l * .8), y + 60); g.quadraticCurveTo(x0 + (gauche ? l * .4 : -l * .4), y + 180, x0, y + 200); g.closePath(); g.clip();
      DF.roche(g, gauche ? 0 : w - 600, y - 200, 600, 420, {graine:40 + i, ton:[80, 76, 82], taille:120}); g.restore();
      DF.racine(g, x0 + (gauche ? l * .5 : -l * .5), y + 40, 200 + Rp() * 160, Rp, [50, 42, 34]); }
  }), -750, -1500);
  S.act = act;
  S.H = {p:HF.creer(S, act, 'pisteur')};
  S.H.p.sansSol = 1;
};
/* ---- PLAN 4 : dans le conduit — la corde, la lune au-dessus, la lueur de la torche tout en bas (5,6 s) */
PLANS.conduit = {id:'conduit', cle:'conduit', duree:5.6,
  monter:function(S){ DEC.conduit(S, 1.4); },
  etat:function(S, tl){
    var Y = -330 + 62 * tl;
    return {cam:{x:14 * Math.sin(tl * .5), y:Y - 156 + 13 * tl, zoom:1.3 + .02 * tl, focus:U.lerp(820, 1000, K(0, 1.4, tl)), ap:1.5}, amb:[16, 20, 40], fondu:(1 - K(0, .5, tl)) * .9, poussiere:{n:110, k:.8, fond:.03}, Y:Y};
  },
  acteurs:function(S, tl, E){
    var Y = -330 + 62 * tl, p = HF.corde(Y, {tete:10 + 6 * Math.sin(tl * .9)});
    HF.poser(S.H.p, {x:-37, y:Y, pose:p, cligne:HF.cligne(tl, 1), regard:[.4, 2.2], sansTorche:1, sourcils:'souci'});
  },
  dessin:function(S, tl, E){
    var cam = S.cam, t = S.t, Y = -330 + 62 * tl, v = MP.vacille(t, 1), fx = '', bas = cam.y + 330, haut = cam.y - 340, kb = .55 + .25 * tl;
    /* le rayon de lune qui tombe du haut du puits ; la lueur chaude qui monte du fond */
    fx += '<path d="M-90 ' + r2(haut - 80) + ' L 90 ' + r2(haut - 80) + ' L 200 ' + r2(haut + 620) + ' L -200 ' + r2(haut + 620) + ' Z" fill="url(#dsRayon)" opacity="' + r2(.34 + .04 * Math.sin(t)) + '" filter="url(#mpF14)"/>';
    fx += MP.halo(0, bas + 120, 520, 'Chaud', U.clamp(.34 * kb * v, 0, .8));
    /* des gouttes qui tombent, qui brillent en passant */
    var R = U.hasard(3);
    for(var i = 0; i < 9; i++){ var x = -260 + R() * 520, ph = (t * (.55 + R() * .3) + R()) % 1, y = cam.y - 400 + ph * 900; fx += '<path d="M' + r2(x) + ' ' + r2(y) + ' l 0 ' + r2(7 + 9 * ph) + '" stroke="#cfe4ff" stroke-width="1.1" stroke-linecap="round" opacity="' + r2(.3 * Math.sin(ph * Math.PI)) + '"/>'; }
    /* la bête dans son trou : deux yeux qui s'éteignent quand il arrive à sa hauteur */
    var py = 10, vu = U.inv(py - 150, py - 320, Y - 250);
    S.par.fond.svg(yeuxNoir([[120 / 1.17 + 2, 20 / 1.17, .2, 3.0, 12, 2.6]], tl));
    S.fx.svg(fx);
    return {lum:[{x:0, y:haut - 60, d:1000, c:LUNE, k:2.3, r:520, z:300, e:1.2, derriere:420}, {x:0, y:bas + 110, d:1000, c:CHAUD, k:1.5 * kb * v, r:520, z:300, e:1.2, derriere:420}]};
  }};

/* ================================================================== LE DÉCOR 3 : LA SALLE D'EN BAS (le sol en y = 170)
   variante 'puits' : le trou du plafond, le rayon de lune, la corde (en x = −200) ; 'crypte' et 'fin' : sans. */
var SOL = 170, XC = -200, ARCHES = [[-760, 200, 330], [330, 150, 250], [1000, 240, 350]], CARNET = [505, SOL + 44], PIERRE = [742, SOL + 12];
DEC.salle = function(S, e, variante, o){
  o = o || {};
  var i, R = U.hasard(14);
  var mur = S.couche('mur', {d:1120, lum:'lum', sc:5});
  mur.poser(MP.toile(3200, 760, e, function(g, w, h){
    g.translate(1500, 560);
    DF.mur(g, -1500, -560, 3200, 760, {graine:12, rang:58, larg:[96, 176], ton:[124, 120, 134], mousse:.9, humide:1.5});
    /* une frise de pierres plus claires, à mi-hauteur ; les pilastres */
    for(var x = -1500; x < 1700; x += 74) DF.bloc(g, x, -306, 74, 30, [150, 144, 150], R, {j:1.6});
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-1500, -276, 3200, 6);
    [-1180, -480, 80, 640, 1340].forEach(function(px, k){
      for(var y = -560; y < 150; y += 62) DF.bloc(g, px - 44, y, 88, 62, [146, 140, 150], R, {j:1.8});
      DF.bloc(g, px - 58, -330, 116, 34, [160, 154, 160], R, {j:1.6}); DF.bloc(g, px - 56, 116, 112, 36, [150, 146, 152], R, {j:1.6});
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(px + 44, -560, 12, 680);
    });
    /* les trois passages voûtés */
    ARCHES.forEach(function(a, k){ DF.arche(g, a[0] / 1.12, 150 / 1.12 + 16, a[1], a[2], {graine:30 + k, ep:32, fond:k === 2 ? [8, 10, 20] : [5, 5, 9], lueur:k === 2 ? [40, 70, 130] : null}); });
    /* au-dessus de chaque passage, une tête de pierre ; aux pilastres, des porte-torches de fer éteints ; des chaînes en guirlande */
    ARCHES.forEach(function(a, k){ DF.crane(g, a[0] / 1.12, 150 / 1.12 + 16 - a[2] - 34, 1.25, R, 0, [136, 130, 140]); });
    [[-1136, -524], [36, 596], [684, 1296]].forEach(function(q){ g.strokeStyle = '#2c2e34'; g.lineWidth = 5; g.setLineDash([9, 5]); g.beginPath(); g.moveTo(q[0], -330); g.quadraticCurveTo((q[0] + q[1]) / 2, -200, q[1], -330); g.stroke(); g.setLineDash([]); });
    /* les toiles d'araignée, les racines du plafond, de grandes fissures */
    var Rt = U.hasard(3);
    DF.toile(g, -1136, -296, 150, .05, 1.5, Rt, .34); DF.toile(g, 36, -296, 170, 1.64, 3.1, Rt, .3); DF.toile(g, 684, -296, 130, .05, 1.5, Rt, .3); DF.toile(g, 1296, -296, 160, 1.64, 3.1, Rt, .34);
    for(i = 0; i < 12; i++) DF.racine(g, -1400 + Rt() * 3000, -560, 90 + Rt() * 200, Rt, [84, 68, 52]);
    for(i = 0; i < 5; i++){ g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2.4; g.beginPath(); var fx = -1300 + Rt() * 2800, fy = -540; g.moveTo(fx, fy); for(var q = 0; q < 8; q++){ fx += (Rt() - .5) * 60; fy += 30 + Rt() * 50; g.lineTo(fx, fy); } g.stroke(); }
    if(variante === 'puits'){
      /* le trou du puits, au plafond : un bord de pierres, le noir bleu de la nuit au-dessus */
      var cx = XC / 1.12;
      g.fillStyle = '#0b1020'; g.beginPath(); g.ellipse(cx, -560, 150, 46, 0, 0, 7); g.fill();
      for(i = 0; i < 9; i++){ var a0 = i / 9 * Math.PI; g.save(); g.translate(cx + Math.cos(a0 + .17) * 150, -560 + Math.sin(a0 + .17) * 46); g.rotate(a0 + Math.PI / 2 + .17); DF.bloc(g, -26, -11, 52, 24, [150, 146, 156], R, {j:1.4}); g.restore(); }
    }
  }), -1500 * 1.0 / 1 , -560);
  /* le sol de dalles */
  var sol = S.couche('sol', {d:1000, lum:'lum', sc:4.5});
  sol.poser(MP.toile(3200, 230, e, function(g, w, h){ DF.dalles(g, 0, 0, w, h, {graine:5, rangs:3, larg:150, ton:[122, 118, 126]}); }), -1500, SOL - 22);
  /* ce qui traîne au pied du mur : des gravats, des cristaux, le carnet, la pierre de rune */
  var deco = S.couche('deco', {d:1000, lum:'lum', sc:4});
  S.pointes = [];
  deco.poser(MP.toile(3200, 260, e, function(g, w, h){
    g.translate(1500, 200);
    var Rg = U.hasard(22);
    [[-1250, 240], [-560, 160], [120, 220], [600, 190], [1240, 260]].forEach(function(q){ DF.gravats(g, q[0], 4 + Rg() * 8, q[1], 14, Rg, [120, 116, 124]); });
    [[-980, 44], [-330, 30], [226, 38], [868, 48], [1180, 34]].forEach(function(q){ DF.cristaux(g, q[0], 2, q[1], Rg).forEach(function(p){ S.pointes.push([p[0], p[1] + SOL - 22 + 22]); }); });
    DF.gravats(g, PIERRE[0] - 90, 10, 200, 7, Rg, [112, 110, 124]);
    /* des urnes dans les coins, un couvercle de tombe appuyé au mur, des os */
    [[-1090, 1], [-610, .8], [170, .9], [1420, 1.1]].forEach(function(q){ g.save(); g.translate(q[0], 4); g.scale(q[1], q[1]);
      var gu = g.createLinearGradient(-26, 0, 26, 0); gu.addColorStop(0, '#5c5048'); gu.addColorStop(.35, '#a08c78'); gu.addColorStop(1, '#40362e'); g.fillStyle = gu; g.strokeStyle = '#120e0c'; g.lineWidth = 2.6;
      g.beginPath(); g.moveTo(-12, 0); g.bezierCurveTo(-34, -20, -32, -62, -14, -76); g.lineTo(-17, -90); g.lineTo(17, -90); g.lineTo(14, -76); g.bezierCurveTo(32, -62, 34, -20, 12, 0); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(20,14,10,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-26, -48); g.lineTo(26, -48); g.moveTo(-22, -60); g.lineTo(22, -60); g.stroke(); g.restore(); });
    g.save(); g.translate(-930, 4); g.rotate(-.34); for(var kk = 0; kk < 3; kk++) DF.bloc(g, -40, -210 + kk * 70, 80, 70, [140, 134, 138], Rg, {j:1.2, r:6}); g.restore();
    for(i = 0; i < 7; i++){ var bx = -1300 + Rg() * 2700, by = 14 + Rg() * 30; g.save(); g.translate(bx, by); g.rotate(Rg() * 3); g.scale(.7, .7); g.strokeStyle = '#1a1410'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-13, 0); g.lineTo(13, 0); g.stroke(); g.strokeStyle = '#cfc6ac'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#cfc6ac'; g.beginPath(); g.arc(-14, -2, 3.4, 0, 7); g.arc(-14, 2, 3.4, 0, 7); g.arc(14, -2, 3.4, 0, 7); g.arc(14, 2, 3.4, 0, 7); g.fill(); g.restore(); }
  }), -1500, SOL - 200 - 4);
  if(variante !== 'gros'){
    deco.poser(MP.toile(92, 46, e * 1.6, function(g){ g.translate(44, 16); g.scale(.15, .15); DF.carnet(g); }), CARNET[0] - 44, CARNET[1] - 28);
    deco.poser(MP.toile(86, 52, e * 1.6, function(g){ g.translate(40, 28); g.scale(.16, .16); DF.pierreRune(g); }), PIERRE[0] - 40, PIERRE[1] - 44);
  }
  if(variante === 'puits'){
    S.cordeC = S.couche('corde', {d:1000, lum:'lum', sc:3});
    S.cordeC.svg(DF.corde(XC, -700, SOL - 6, 7) + '<ellipse cx="' + (XC + 30) + '" cy="' + (SOL + 6) + '" rx="46" ry="11" fill="none" stroke="#2a1c10" stroke-width="9"/><ellipse cx="' + (XC + 30) + '" cy="' + (SOL + 6) + '" rx="46" ry="11" fill="none" stroke="#b89868" stroke-width="6"/><ellipse cx="' + (XC + 34) + '" cy="' + (SOL + 3) + '" rx="30" ry="7" fill="none" stroke="#2a1c10" stroke-width="8"/><ellipse cx="' + (XC + 34) + '" cy="' + (SOL + 3) + '" rx="30" ry="7" fill="none" stroke="#a88858" stroke-width="5"/>');
  }
  S.objets = S.couche('objets', {d:1000, lum:'lum', sc:3});
  var act = S.couche('act', {d:1000, lum:'alpha', sc:4.5, spec:.35});
  S.fx = S.couche('fx', {d:1000, ecran:1});
  /* devant : des gravats, un fût de colonne tombé */
  var av = S.couche('avant', {d:850, lum:'lum', sc:4, lumK:.8});
  av.poser(MP.toile(3400, 200, e * .9, function(g, w, h){
    g.translate(1700, 190); var Ra = U.hasard(41);
    [[-1500, 300], [-700, 200], [-80, 260], [760, 240], [1300, 300]].forEach(function(q){ DF.gravats(g, q[0], 6, q[1], 12, Ra, [112, 108, 116]); });
    [[-380, 1], [1080, -1]].forEach(function(q){ g.save(); g.translate(q[0], -30); g.rotate(q[1] * .06); for(var k = 0; k < 4; k++) DF.bloc(g, k * 62 - 124, -34, 62, 68, [138, 132, 140], Ra, {j:1.6, r:8}); g.restore(); });
  }), -1700, SOL + 150);
  /* tout près de nous, flous : une colonne brisée à gauche, des racines et une chaîne qui pendent */
  var pp = S.couche('premier', {d:460, lum:'lum', sc:2, lumK:.45, ambK:1.2});
  if(o.premier !== false) pp.poser(MP.toile(3000, 1100, .5, function(g, w, h){
    g.translate(1500, 550); var Rp = U.hasard(9);
    (o.colonnes || [-1250, 1160]).forEach(function(x, k){ for(var y = -560; y < 560; y += 150) DF.bloc(g, x - 130 + Rp() * 14, y, 260, 150, [96, 92, 100], Rp, {j:3, r:14}); });
    for(i = 0; i < 9; i++) DF.racine(g, -1100 + Rp() * 2300, -560, 200 + Rp() * 320, Rp, [48, 40, 34]);
    DF.gravats(g, -400, 520, 700, 9, Rp, [84, 80, 88]);
    /* une chaîne */
    g.strokeStyle = '#34363c'; g.lineWidth = 9; for(i = 0; i < 12; i++){ g.beginPath(); g.ellipse(430, -540 + i * 40, i % 2 ? 9 : 15, 24, 0, 0, 7); g.stroke(); }
  }), -1500, -550);
  S.act = act; S.solC = sol; S.mur = mur; S.deco = deco;
};
function ambSalle(){ return [18, 20, 38]; }
/* les cristaux luisent tout seuls, un peu ; (puits) le rayon de lune sous le trou */
function lueursSalle(S, variante){
  var t = S.t, s = '', lum = [];
  (S.pointes || []).forEach(function(p, i){ s += MP.halo(p[0], p[1], 26, 'Rune', .2 + .08 * Math.sin(t * 1.3 + i)); });
  if(variante === 'puits'){
    s += '<path d="M' + (XC - 120) + ' -560 L ' + (XC + 120) + ' -560 L ' + (XC + 200) + ' ' + (SOL + 30) + ' L ' + (XC - 200) + ' ' + (SOL + 30) + ' Z" fill="url(#dsRayon)" opacity="' + r2(.4 + .04 * Math.sin(t * .8)) + '" filter="url(#mpF14)"/>';
    lum.push({x:XC, y:SOL - 60, d:1000, c:LUNE, k:1.5, r:300, z:150, e:1.4}, {x:XC, y:-380, d:1060, c:LUNE, k:1.3, r:300, z:160});
  }
  return {fx:s, lum:lum};
}

/* ---- PLAN 5 : le fond du puits — il arrive par la corde, les bêtes détalent, il reprend sa torche (7,4 s) */
var TX = -150;                              /* où la torche est tombée */
var BETES_FOND = [
  {x0:-60, y:SOL + 18, t0:2.72, vers:1, v:560, fin:340, s:1.15, regarde:-1}, {x0:-330, y:SOL + 40, t0:2.8, vers:-1, v:520, fin:-770, s:1.25}, {x0:40, y:SOL + 60, t0:2.9, vers:1, v:600, s:1.4},
  {x0:-420, y:SOL + 14, t0:3.0, vers:-1, v:480, fin:-770, s:1}, {x0:170, y:SOL + 12, t0:4.5, vers:1, v:560, fin:335, s:1, regarde:-1}, {x0:470, y:SOL + 34, t0:4.7, vers:1, v:620, s:1.2, regarde:-1}, {x0:-560, y:SOL + 56, t0:4.6, vers:-1, v:560, s:1.3}];
PLANS.fond = {id:'fond', cle:'sallePuits', duree:7.4,
  monter:function(S){ DEC.salle(S, 1.2, 'puits'); S.H = {p:HF.creer(S, S.act, 'pisteur')}; },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 7.4);
    return {cam:{x:U.lerp(-190, -60, k), y:U.lerp(-6, 8, k), zoom:U.lerp(1.02, 1.2, k), focus:1000, ap:1.3}, amb:ambSalle(), fondu:(1 - K(0, .35, tl)) * .8, poussiere:{n:130, k:.9, fond:.02}};
  },
  acteurs:function(S, tl){
    var a = S.H.p, tA = 2.6, Y = Math.min(SOL, SOL - 160 + 62 * tl), c = HF.corde(Y, {tete:8});
    /* 0 → 2,6 : la corde ; 2,6 → 3,2 : il se pose (les genoux plient) ; 3,2 → 4,1 : il se baisse vers la torche ; 4,1 → 5 : il se relève, la torche haute */
    var debout = {bassin:{x:0, y:9}, torse:5, tete:-4, pA:[104, 272], pB:[152, 272], fA:0, fB:0, mA:[142, 172], hA:-10, mB:[150, 168], hB:10};
    var pose = c, ks = K(tA - .15, tA + .5, tl);
    if(ks > 0){
      var flex = Math.sin(U.inv(tA, tA + .75, tl) * Math.PI) * 16, bais = K(3.25, 4.05, tl) * (1 - K(4.2, 5.0, tl)), leve = K(4.25, 5.2, tl);
      var d2 = {bassin:{x:10 * bais, y:9 + flex + 46 * bais}, torse:5 + 46 * bais - 2 * leve, tete:-4 + 14 * bais - 6 * leve + 3 * Math.sin(tl * 1.3) * leve,
        pA:[104, 272], pB:[152, 272], fA:0, fB:0, mA:[142 + 14 * bais, 172 + 30 * bais], hA:-10,
        mB:[150 + 44 * bais + 30 * leve, 168 + 96 * bais - 62 * leve], hB:10 + 20 * bais - 86 * leve};
      pose = HF.mel(c, d2, ks);
    }
    a.sansSol = tl < tA + .4;
    HF.poser(a, {x:XC - 37, y:Y, pose:pose, cligne:HF.cligne(tl, 1), regard:[1.2, tl < 4.2 ? 2 : 0], sansTorche:tl < 4.1, sourcils:tl > 4.6 ? 'garde' : 'souci'});
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOL}), L = lueursSalle(S, 'puits'), t = S.t, v = MP.vacille(t, 1), lum = P.lum.concat(L.lum), fx = L.fx + P.fx, ob = '';
    if(tl < 4.1){
      /* la torche par terre, là où elle est tombée : elle brûle toujours */
      ob += '<g transform="translate(' + TX + ' ' + (SOL + 8) + ') rotate(-8)"><path d="M-52 0 L 4 0" stroke="#24182e" stroke-width="9" stroke-linecap="round"/><path d="M-52 0 L 4 0" stroke="#7a4e2a" stroke-width="5" stroke-linecap="round"/><path d="M0 -7 L 18 -9 Q 26 0 18 9 L 0 7 Z" fill="#3a2a22" stroke="#24182e" stroke-width="3"/></g>';
      fx += MP.halo(TX + 22, SOL - 6, 240 * v, 'Chaud', .6) + MP.flamme(TX + 16, SOL + 6, 12, t, 1, {penche:.35}) + MP.halo(TX + 20, SOL - 4, 28, 'Chaud', .9);
      lum.push({x:TX + 20, y:SOL - 20, d:960, c:CHAUD, k:2.5 * v, r:270, z:110}, {x:TX + 20, y:SOL + 14, d:1000, c:CHAUD, k:1.4 * v, r:300, z:60, seul:['sol'], rim:0});
    }
    var B = betes(BETES_FOND, tl);
    S.objets.svg(ob + HF.ombre(S.H.p.x, SOL + 4, 60, .75 * K(2.2, 2.9, tl)) + B.corps);
    /* des yeux dans le noir des passages : ils s'éteignent quand la torche se lève */
    S.mur.svg(yeuxNoir([[ARCHES[1][0] / 1.12 - 14, 96, .6, 4.7, 8, 2.2], [ARCHES[1][0] / 1.12 + 22, 118, 1.5, 4.9, 7, 2], [ARCHES[2][0] / 1.12 - 30, 104, .2, 5.6, 9, 2.4], [ARCHES[2][0] / 1.12 + 40, 80, 1.1, 5.9, 8, 2.2], [ARCHES[0][0] / 1.12 + 20, 100, .4, 3.4, 8, 2.2]], tl));
    /* le Sage arrive par la corde : son cristal, une lueur bleue qui descend du plafond */
    var ks = K(5.6, 7.4, tl);
    if(ks > 0){ var ys = -640 + 260 * ks; fx += MP.halo(XC + 20, ys, 150, 'Froid', .7 * ks); lum.push({x:XC + 20, y:ys, d:980, c:FROID, k:1.6 * ks, r:260, z:140}); }
    S.fx.svg(fx + B.yeux);
    return {lum:lum};
  }};

/* ---- PLAN 5 bis (la crypte) : ils entrent dans la salle par le passage de gauche ; les bêtes détalent (4,6 s) */
var BETES_SALLE = [
  {x0:-250, y:SOL + 20, t0:.9, vers:1, v:560, fin:335, s:1.1, regarde:-1}, {x0:-130, y:SOL + 52, t0:1.1, vers:1, v:620, s:1.35, regarde:-1}, {x0:-380, y:SOL + 34, t0:.6, vers:1, v:600, s:1.2, regarde:-1},
  {x0:90, y:SOL + 14, t0:1.7, vers:1, v:520, fin:335, s:1, regarde:-1}, {x0:240, y:SOL + 60, t0:2.1, vers:1, v:640, s:1.4, regarde:-1}, {x0:520, y:SOL + 24, t0:2.7, vers:1, v:600, s:1.1, regarde:-1}];
PLANS.salleCrypte = {id:'salleCrypte', cle:'salleCrypte', duree:4.6,
  monter:function(S){ DEC.salle(S, 1.2, 'crypte', {colonnes:[]}); S.H = {a:HF.creer(S, S.act, 'alchimiste'), s:HF.creer(S, S.act, 'sage'), p:HF.creer(S, S.act, 'pisteur')}; },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 4.6);
    return {cam:{x:U.lerp(-520, -330, k), y:U.lerp(-4, 8, k), zoom:U.lerp(1.0, 1.12, k), focus:1000, ap:1.3}, amb:ambSalle(), fondu:(1 - K(0, .4, tl)) * .8, poussiere:{n:130, k:.9, fond:.02}};
  },
  acteurs:function(S, tl){
    var H = S.H, sol = function(){ return SOL; };
    [['p', 'pisteur', -690, -344, 1], ['s', 'sage', -850, -500, 2], ['a', 'alchimiste', -1010, -650, 3]].forEach(function(q){
      var m = D.marcheVers(H[q[0]], q[1], tl, q[2], q[3], {sol:sol, torse:q[0] === 's' ? 3 : 6, porte:q[0] === 'p' ? {my:116 - 16 * K(3, 4.2, tl)} : {}});
      m.pose.tete = (q[0] === 's' ? -3 : -5) - 5 * K(3.2, 4.3, tl);
      HF.poser(H[q[0]], {x:m.X, y:m.y, pose:m.pose, cligne:HF.cligne(tl, q[4]), sourcils:q[0] === 's' ? 'souci' : 'garde'});
    });
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOL}), L = lueursSalle(S, 'crypte'), H = S.H, B = betes(BETES_SALLE, tl);
    S.objets.svg([H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x, SOL + 4, 62, .75); }).join('') + B.corps);
    S.mur.svg(yeuxNoir([[ARCHES[1][0] / 1.12 - 14, 96, .2, 3.2, 8, 2.2], [ARCHES[1][0] / 1.12 + 22, 118, .8, 3.5, 7, 2], [ARCHES[2][0] / 1.12 - 30, 104, .2, 9, 9, 2.4]], tl));
    S.fx.svg(L.fx + P.fx + B.yeux);
    return {lum:P.lum.concat(L.lum)};
  }};

/* ================================================================== LA FIN COMMUNE (dans la salle, loin de la corde) */
function salleFin(S){ DEC.salle(S, 2, 'fin', {premier:false}); S.H = {a:HF.creer(S, S.act, 'alchimiste'), s:HF.creer(S, S.act, 'sage'), p:HF.creer(S, S.act, 'pisteur')}; }
var XP = 452, XS = 132, XA = -10;          /* où ils sont quand le Pisteur regarde à ses pieds */
function debout(S, tl, qui, X, o){
  var m = HF.marche(X, function(){ return SOL; }, {x0:X - .55 * 54, torse:qui === 'sage' ? 3 : 6});
  porte(m.pose, qui, tl, o);
  var re = Math.sin(tl * 2 + qui.length);
  m.pose.torse += re * .7; m.pose.bassin.y += re * .6;
  return m.pose;
}
/* ---- F1 : le Pisteur, de près — quelque chose à ses pieds (3,2 s) */
PLANS.regard = {id:'regard', cle:'salleFin', duree:3.2,
  monter:salleFin,
  etat:function(S, tl){
    var k = U.tresLisse(tl / 3.2);
    return {cam:{x:XP + 44 - 8 * k, y:SOL - 196 + 14 * k, zoom:U.lerp(2.3, 2.5, k), focus:U.lerp(700, 1000, K(0, .9, tl)), ap:1.9}, amb:ambSalle(), lumK:{mur:.42, sol:.7}, poussiere:{n:130, k:.9, fond:.02}};
  },
  acteurs:function(S, tl){
    var H = S.H, bas = K(1.15, 2.0, tl);
    var p = debout(S, tl, 'pisteur', XP, {my:116 + 20 * bas, mx:178 + 8 * bas, h:-76 + 16 * bas});
    p.tete = -5 + 26 * bas; p.torse += 5 * bas;
    HF.poser(H.p, {x:XP, y:SOL, pose:p, cligne:Math.max(HF.cligne(tl, 1), tl > 1 && tl < 1.14 ? 1 : 0), regard:[1.4 * (1 - bas), 2.8 * bas], sourcils:bas > .5 ? 'souci' : 'garde', bouche:tl > 2.2 ? 'o' : 'neutre'});
    HF.poser(H.s, {x:XS, y:SOL, pose:debout(S, tl, 'sage', XS), cligne:HF.cligne(tl, 2)});
    HF.poser(H.a, {x:XA, y:SOL, pose:debout(S, tl, 'alchimiste', XA), cligne:HF.cligne(tl, 3)});
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOL}), L = lueursSalle(S, 'fin'), H = S.H;
    S.objets.svg([H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x, SOL + 4, 62, .75); }).join(''));
    S.fx.svg(L.fx + P.fx);
    return {lum:P.lum.concat(L.lum)};
  }};

/* ================================================================== LE DÉCOR 4 : LE CARNET, EN GROS PLAN (posé sur les dalles, dans le noir) */
DEC.grosCarnet = function(S){
  var sol = S.couche('sol', {d:1000, lum:'lum', sc:6});
  sol.poser(MP.toile(2400, 900, 1.2, function(g, w, h){
    g.translate(1200, 380);
    DF.dalles(g, -1200, -380, 2400, 900, {graine:31, rangs:2, larg:520, ton:[124, 120, 128]});
    var R = U.hasard(5); DF.gravats(g, -900, 60, 500, 9, R, [120, 116, 124]); DF.gravats(g, 420, -60, 500, 8, R, [120, 116, 124]);
    for(var i = 0; i < 40; i++){ g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(-1100 + R() * 2200, -300 + R() * 760, 2 + R() * 5, 1.4 + R() * 3, R() * 3, 0, 7); g.fill(); }
    DF.toile(g, 760, -380, 380, 1.7, 3.0, R, .22);
  }), -1200, -380);
  var obj = S.couche('carnet', {d:1000, lum:'lum', sc:5});
  obj.poser(MP.toile(760, 420, 1.6, function(g){ g.translate(370, 150); DF.carnet(g); }), -370 + 30, -150 + 40);
  S.fx = S.couche('fx', {d:1000, ecran:1});
  var av = S.couche('avant', {d:620, lum:'lum', sc:4, lumK:.8});
  av.poser(MP.toile(2600, 300, 1, function(g){ g.translate(1300, 280); var R = U.hasard(8); DF.gravats(g, -1300, 10, 900, 10, R, [116, 112, 120]); DF.gravats(g, 500, 10, 800, 9, R, [116, 112, 120]); }), -1300, 150);
  S.flammeAv = S.couche('flammeAv', {d:700, ecran:1});
};
/* ---- F2 : le carnet, par terre, dans le noir ; la torche s'approche et l'éclaire (5,2 s) */
PLANS.carnet = {id:'carnet', cle:'grosCarnet', duree:5.2,
  monter:function(S){ DEC.grosCarnet(S); },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 5.2);
    return {cam:{x:U.lerp(-40, 24, k), y:U.lerp(-4, 22, k), zoom:U.lerp(1.16, 1.4, k), focus:U.lerp(640, 1000, K(.9, 2.8, tl)), ap:1.6}, amb:[13, 15, 30], poussiere:{n:140, k:1, fond:.015}};
  },
  dessin:function(S, tl, E){
    var t = S.t, v = MP.vacille(t, 1), ka = K(1.0, 3.3, tl), x = U.lerp(-1050, -400, U.COURBES.o(U.inv(1.0, 3.5, tl))) + U.fbm(t * 1.2, 4, 2) * 14, y = U.lerp(-330, -150, ka) + U.fbm(t * 1.4, 7, 2) * 10;
    /* la flamme, tout près de nous, en haut à gauche (floue) */
    var p = MP.dansCalque(S.flammeAv, MP.ecran(x, y, 1000, S.cam).x, MP.ecran(x, y, 1000, S.cam).y, S.cam);
    S.flammeAv.svg(MP.halo(p.x, p.y - 30, 300 * v, 'Chaud', .5 * ka) + MP.flamme(p.x, p.y + 30, 30, t, 1) + MP.halo(p.x, p.y - 14, 60, 'Chaud', .9 * ka));
    /* le laiton du fermoir accroche la lumière */
    var ec = Math.pow(ka, 3) * (.5 + .5 * Math.sin(t * 3.1));
    S.fx.svg(MP.halo(214, 130, 60, 'Blanc', .35 * ec) + MP.halo(-232, 8, 34, 'Blanc', .25 * ec) + MP.halo(226, -32, 30, 'Blanc', .2 * ec));
    return {lum:[{x:x + 60, y:y + 60, d:900, c:CHAUD, k:3.1 * ka * v, r:560, z:230, e:1.6},
      /* dans le noir : un rien de bleu qui vient de loin, à droite (le cristal du Sage) */
      {x:980, y:-420, d:900, c:FROID, k:.55, r:700, z:300, e:1}]};
  }};

/* ================================================================== LE DÉCOR 5 : LA PIERRE DE RUNE, EN GROS PLAN (au pied du mur) */
DEC.grosRune = function(S){
  var R = U.hasard(4);
  var mur = S.couche('mur', {d:1110, lum:'lum', sc:6});
  mur.poser(MP.toile(2600, 800, 1.1, function(g, w, h){ DF.mur(g, 0, 0, w, h, {graine:44, rang:168, larg:[260, 460], ton:[124, 120, 134], mousse:2, humide:2}); DF.toile(g, 380, 0, 420, .2, 1.4, R, .2); }), -1300, -640);
  var sol = S.couche('sol', {d:1000, lum:'lum', sc:6});
  sol.poser(MP.toile(2600, 560, 1.1, function(g, w, h){ DF.dalles(g, 0, 0, w, h, {graine:9, rangs:2, larg:480, ton:[122, 118, 126]}); }), -1300, 96);
  var obj = S.couche('pierre', {d:1000, lum:'lum', sc:6});
  obj.poser(MP.toile(1700, 520, 1.3, function(g){
    g.translate(850, 320);
    var Rg = U.hasard(17); DF.gravats(g, -820, 124, 560, 12, Rg, [116, 112, 126]); DF.gravats(g, 300, 126, 520, 11, Rg, [116, 112, 126]);
    g.save(); g.translate(-520, 128); g.scale(2.4, 2.4); S.pointes = DF.cristaux(g, 0, 0, 60, Rg).map(function(p){ return [-520 + p[0] * 2.4, 128 + p[1] * 2.4 - 0]; }); g.restore();
    DF.pierreRune(g);
  }), -850, -320 + 60);
  S.fx = S.couche('fx', {d:1000, ecran:1});
  var av = S.couche('avant', {d:600, lum:'lum', sc:3, lumK:.7});
  av.poser(MP.toile(2400, 620, .8, function(g){ g.translate(1200, 600); var Ra = U.hasard(3); DF.gravats(g, -1200, 10, 700, 8, Ra, [110, 106, 116]); DF.gravats(g, 620, 10, 560, 6, Ra, [110, 106, 116]);
    g.save(); g.translate(-760, 0); g.scale(4.4, 4.4); DF.cristaux(g, 0, 0, 60, Ra); g.restore(); }), -1200, -260);
};
PLANS.rune = {id:'rune', cle:'grosRune', duree:4,
  monter:function(S){ DEC.grosRune(S); },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 4);
    return {cam:{x:U.lerp(-70, 14, k), y:U.lerp(30, 44, k), zoom:U.lerp(1.0, 1.2, k), focus:U.lerp(600, 1000, K(.1, 1.5, tl)), ap:1.7}, amb:[14, 16, 32], poussiere:{n:140, k:1, fond:.02}};
  },
  dessin:function(S, tl, E){
    var t = S.t, v = MP.vacille(t, 1), pu = .62 + .38 * Math.sin(t * 2.4) * Math.sin(t * .9 + 1), ks = K(1.6, 3.8, tl), fx = '';
    /* le signe luit : son tracé, flou puis net, et un halo */
    fx += '<g transform="translate(8 38)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="' + DF.RUNE + '" stroke="#39d8f0" stroke-width="30" opacity="' + r2(.3 * pu) + '" filter="url(#mpF14)"/><path d="' + DF.RUNE + '" stroke="#8ff3ff" stroke-width="13" opacity="' + r2(.75 * pu) + '" filter="url(#mpF3)"/><path d="' + DF.RUNE + '" stroke="#f0ffff" stroke-width="4" opacity="' + r2(.9 * pu) + '"/></g>';
    fx += MP.halo(8, 44, 330, 'Rune', .34 * pu);
    (S.pointes || []).forEach(function(p, i){ fx += MP.halo(p[0], p[1] + 60, 60, 'Rune', .22 + .06 * Math.sin(t + i)); });
    /* des poussières de lumière qui montent de la pierre */
    var R = U.hasard(6);
    for(var i = 0; i < 14; i++){ var ph = (t * (.16 + R() * .12) + R()) % 1, x = -150 + R() * 330 + Math.sin(t + i) * 12, y = 80 - ph * 300; fx += MP.bokeh(x, y, 2.4, 0, '#bff8ff', Math.sin(ph * Math.PI) * .8 * pu); }
    S.fx.svg(fx);
    return {lum:[{x:8, y:40, d:940, c:RUNE, k:1.25 * pu, r:400, z:150, e:1.5}, {x:-880 + 60 * Math.sin(t * .4), y:-330, d:900, c:CHAUD, k:1.9 * v, r:600, z:280, e:1.4},
      {x:U.lerp(1500, 760, ks), y:-300, d:900, c:FROID, k:1.5 * ks, r:560, z:240, e:1.4}]};
  }};

/* ---- F4 : le Sage — « qu'est-ce que c'est ? » — elle se baisse vers la pierre (4,2 s) */
var XS2 = 652, XP2 = 452;
PLANS.sage = {id:'sage', cle:'salleFin', duree:4.2,
  monter:salleFin,
  etat:function(S, tl){
    var k = U.tresLisse(tl / 4.2);
    return {cam:{x:XS2 + 54 + 6 * k, y:SOL - 150 + 62 * K(1.8, 3.6, tl), zoom:U.lerp(1.9, 2.12, k), focus:1000, ap:1.8}, amb:ambSalle(), lumK:{mur:.42, sol:.7}, poussiere:{n:130, k:.9, fond:.02}};
  },
  acteurs:function(S, tl){
    var H = S.H, vu = K(.2, 1.0, tl), hm = fenetre(tl, 1.15, 2.1, .3), bas = K(1.9, 3.5, tl), re = Math.sin(tl * 2);
    var m = HF.marche(XS2, function(){ return SOL; }, {x0:XS2 - .55 * 54}).pose;
    var p = {bassin:{x:8 * bas, y:8 + 62 * bas + re * .6 * (1 - bas), r:2 * bas}, torse:3 + 6 * vu + 17 * bas + re * .6, tete:-3 + 16 * vu - 14 * hm + 6 * bas,
      pA:m.pA, pB:m.pB, fA:0, fB:8 * bas, mB:[152 + 16 * bas, 148 + 26 * bas], hB:3, mA:[158 + 50 * bas, 172 + 74 * bas], hA:-24 - 30 * bas};
    HF.poser(H.s, {x:XS2, y:SOL, pose:p, cligne:Math.max(HF.cligne(tl, 2), tl > 1.1 && tl < 1.24 ? 1 : 0), regard:[1.2, 2.6 * vu], sourcils:hm > .5 ? 'content' : 'souci', bouche:hm > .4 ? 'o' : bas > .8 ? 'sourire' : 'neutre'});
    var pp = debout(S, tl, 'pisteur', XP2, {});
    pp.tete = -5 + 10 * vu;
    HF.poser(H.p, {x:XP2, y:SOL, pose:pp, cligne:HF.cligne(tl, 1), regard:[1.4, 1.4]});
    HF.poser(H.a, {x:XP2 - 150, y:SOL, pose:debout(S, tl, 'alchimiste', XP2 - 150), cligne:HF.cligne(tl, 3)});
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOL}), L = lueursSalle(S, 'fin'), H = S.H, t = S.t, pu = .62 + .38 * Math.sin(t * 2.4) * Math.sin(t * .9 + 1), bas = K(1.9, 3.5, tl), kr = .9 + .9 * bas;
    S.objets.svg([H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x, SOL + 4, 62, .75); }).join(''));
    S.fx.svg(L.fx + P.fx + MP.halo(PIERRE[0] + 2, PIERRE[1] - 18, 70 + 30 * bas, 'Rune', .5 * pu * kr) + MP.halo(PIERRE[0] + 2, PIERRE[1] - 20, 12, 'Blanc', .6 * pu));
    return {lum:P.lum.concat(L.lum, [{x:PIERRE[0], y:PIERRE[1] - 30, d:965, c:RUNE, k:1.2 * pu * kr, r:230, z:80, e:1.6}])};
  }};

/* ---- F5 : « Allons-y. Odette doit être par là. » — le Pisteur lève sa torche vers le passage, et ils s'y enfoncent (5,2 s) */
var XP3 = 846, XS3 = 652, XA3 = 512, T_DIT = [.55, 3.3];
PLANS.allons = {id:'allons', cle:'salleFin', duree:5.2,
  monter:salleFin,
  etat:function(S, tl){
    var k = U.tresLisse(tl / 5.2);
    return {cam:{x:XP3 - 66 + 50 * k, y:SOL - 148 + 6 * k, zoom:U.lerp(1.5, 1.66, k), focus:1000, ap:1.6}, amb:ambSalle(), lumK:{mur:.55, sol:.8}, fondu:K(4.2, 5.1, tl), poussiere:{n:130, k:.9, fond:.02}};
  },
  acteurs:function(S, tl){
    var H = S.H, sol = function(){ return SOL; }, tm = 3.5, leve = K(.1, .9, tl) * (1 - .5 * K(tm, tm + .8, tl));
    /* le Pisteur : il lève la torche vers le passage, il parle, puis il y va */
    var Xp = tl < tm ? XP3 : XP3 + 96 * (tl - tm) * K(tm, tm + .7, tl), m = HF.marche(Xp, sol, {x0:XP3 - .55 * 54});
    porte(m.pose, 'pisteur', tl, {my:116 - 26 * leve, mx:178 + 12 * leve, h:-76 + 8 * leve});
    m.pose.tete = -5 - 5 * leve + (tl > T_DIT[0] && tl < T_DIT[1] ? 2 * Math.sin(tl * 9) : 0);
    HF.poser(H.p, {x:Xp, y:SOL, pose:m.pose, cligne:HF.cligne(tl, 1), regard:[1.6, -.4], sourcils:'garde', bouche:HF.parle(tl, T_DIT[0], T_DIT[1], 2)});
    /* le Sage se relève (elle était baissée vers la pierre), puis le suit ; l'Alchimiste aussi */
    var bas = 1 - K(0, 1.3, tl), ts = tm + .45, Xs = tl < ts ? XS3 : XS3 + 96 * (tl - ts) * K(ts, ts + .7, tl), ms = HF.marche(Xs, sol, {x0:XS3 - .55 * 54, torse:3});
    porte(ms.pose, 'sage', tl, {});
    ms.pose.bassin.y += 62 * bas; ms.pose.bassin.x = 8 * bas; ms.pose.torse = 3 + 17 * bas; ms.pose.mB = [152 + 16 * bas, 148 + 26 * bas]; ms.pose.tete = -3 + 4 * bas - 6 * K(1.2, 2.2, tl);
    HF.poser(H.s, {x:Xs, y:SOL, pose:ms.pose, cligne:HF.cligne(tl, 2), regard:[1.4, 2 * bas]});
    var ta = tm + .8, Xa = tl < ta ? XA3 : XA3 + 96 * (tl - ta) * K(ta, ta + .7, tl), ma = HF.marche(Xa, sol, {x0:XA3 - .55 * 54});
    porte(ma.pose, 'alchimiste', tl, {});
    HF.poser(H.a, {x:Xa, y:SOL, pose:ma.pose, cligne:HF.cligne(tl, 3)});
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOL}), L = lueursSalle(S, 'fin'), H = S.H, t = S.t, pu = .62 + .38 * Math.sin(t * 2.4) * Math.sin(t * .9 + 1);
    S.objets.svg([H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x, SOL + 4, 62, .75); }).join(''));
    S.fx.svg(L.fx + P.fx + MP.halo(PIERRE[0] + 2, PIERRE[1] - 18, 70, 'Rune', .45 * pu));
    return {lum:P.lum.concat(L.lum, [{x:PIERRE[0], y:PIERRE[1] - 30, d:965, c:RUNE, k:.9 * pu, r:230, z:80, e:1.6}])};
  }};
})();
