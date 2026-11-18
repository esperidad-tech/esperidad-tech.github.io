/* film-descente.js — LES DEUX FILMS DE LA DESCENTE DANS LE DONJON, REFAITS EN 2D (Bible §13.68 ; Romain, 18 novembre, 00 h 02 :
   « pas de 3D […] de la 2D, avec des jolies profondeurs de champ […] les éclairages, c'est vraiment la clé […] des cadrages dignes
   des films […] des pantins très détaillés »). Le Pisteur les voit en touchant « 🕯️ Descendre » (descente.js), selon son entrée.

   « puits »    : la forêt la nuit, les trois héros au vieux puits ; la torche lâchée dans le noir ; la corde ; le fond du puits.
   « escalier » : la clé d'Anselme dans la porte de la crypte ; l'escalier ; le couloir aux arches ; les niches ; la salle.
   Puis, LA MÊME FIN pour les deux (le Pisteur regarde à ses pieds, le carnet dans le noir, la torche l'éclaire, la pierre de rune
   qui luit, le Sage se baisse, « Allons-y. Odette doit être par là. »).

   Tout est fait de calques peints (multiplan.js, decors-film.js) ; les héros sont les vrais pantins du donjon (heros-film.js).
   Ce fichier : les décors (DEC.*), les plans (un par cadrage), et les deux films (leurs plans bout à bout, leurs sons). */
(function(){
'use strict';
var U = window.CU, MP = window.MP, HF = window.HF, DF = window.DF, CINE = window.CINE;
var CHAUD = [255, 168, 92], LAMPE = [255, 204, 128], FROID = [120, 196, 255], LUNE = [124, 150, 226], RUNE = [110, 240, 255];
function r2(v){ return Math.round(v * 100) / 100; }
function K(a, b, t){ return U.lisse(U.inv(a, b, t)); }                    /* de 0 à 1 entre a et b, en douceur */
function fenetre(t, a, b, m){ m = m || .3; return Math.min(U.inv(a, a + m, t), 1 - U.inv(b - m, b, t)); }

/* ---------------------------------------------------------------- LES LUMIÈRES QUE LES HÉROS PORTENT
   Chaque image : où est la flamme de la torche, la lampe, le cristal (à l'écran), d'où part la lumière ; et leur dessin (calque « fx »). */
function porteurs(S, tl, E, o){
  o = o || {};
  var cam = S.cam, lum = [], fx = '', H = S.H || {}, t = S.t;
  function monde(p){ return MP.monde(p.x, p.y, 1000, cam); }
  if(H.p && !H.p.P.cache && !H.p.P.sansTorche){
    var p = HF.ou(H.p, 'flamme'), w = monde(p), v = MP.vacille(t, 1), kt = (o.torche == null ? 1 : o.torche);
    lum.push({x:w.x + U.bruit(t * 13, 3) * 3, y:w.y - 20, d:960, c:CHAUD, k:2.7 * v * kt, r:o.rTorche || 260, z:o.zTorche || 125});
    fx += MP.halo(w.x, w.y - 18, 250 * v, 'Chaud', .66 * kt) + MP.flamme(w.x, w.y + 4, 15 * (H.p.ech || 1), t, 1) + MP.halo(w.x, w.y - 14, 32, 'Chaud', .9 * kt);
    S.torche = w;
  }
  if(H.a && !H.a.P.cache && !H.a.P.sansLanterne){
    var p2 = HF.ou(H.a, 'lampe'), w2 = monde(p2), v2 = 1 + .05 * U.fbm(t * 5, 21, 2), kl = (o.lampe == null ? 1 : o.lampe);
    lum.push({x:w2.x, y:w2.y, d:965, c:LAMPE, k:1.9 * v2 * kl, r:o.rLampe || 200, z:o.zLampe || 96});
    fx += MP.halo(w2.x, w2.y, 150 * v2, 'Chaud', .5 * kl) + MP.halo(w2.x, w2.y, 15, 'Blanc', .8 * kl);
    S.lampe = w2;
  }
  if(H.s && !H.s.P.cache){
    var p3 = HF.ou(H.s, 'cristal'), w3 = monde(p3), v3 = 1 + .1 * Math.sin(t * 2.3) + .04 * U.fbm(t * 4, 31, 2), kc = (o.cristal == null ? 1 : o.cristal);
    lum.push({x:w3.x, y:w3.y, d:965, c:FROID, k:1.7 * v3 * kc, r:o.rCristal || 190, z:o.zCristal || 90});
    fx += MP.halo(w3.x, w3.y, 130 * v3, 'Froid', .6 * kc) + MP.halo(w3.x, w3.y, 13, 'Blanc', .9 * kc);
    S.cristal = w3;
  }
  /* le rond de lumière au sol, sous chaque lumière portée (o.sol : la hauteur du sol ; o.solC : les calques du sol) */
  if(o.sol != null) lum.slice().forEach(function(L){ lum.push({x:L.x, y:o.sol + 16, d:1000, c:L.c, k:L.k * .5, r:300, z:70, seul:o.solC || ['sol'], rim:0}); });
  return {lum:lum, fx:fx};
}
/* un trajet à pied : on marche à la vitesse v depuis X0, on ralentit et on s'arrête en Xa (les deux pieds posés) */
function trajet(t, X0, v, Xa, dur){
  dur = dur || .9;
  var df = v * dur / 2, t1 = (Xa - df - X0) / v;
  if(t <= t1) return X0 + v * t;
  var u = U.clamp((t - t1) / dur, 0, 1);
  return Xa - df * (1 - u) * (1 - u);
}
/* les bras de celui qui porte quelque chose en marchant : la main proche tenue haut (la torche, la lanterne) ou sur le bâton */
function porte(pose, role, t, o){
  o = o || {};
  delete pose.brasB; delete pose.avantBrasB; delete pose.mainB;
  var b = U.fbm(t * 1.3, role.length, 2) * 3;
  if(role === 'pisteur'){ pose.mB = [(o.mx || 178) + b, (o.my || 116) + b * .6 + Math.sin(t * 6.6) * 1.5]; pose.hB = o.h == null ? -76 : o.h; }
  if(role === 'alchimiste'){ pose.mB = [(o.mx || 170) + b, (o.my || 124) + Math.sin(t * 6.6 + 1) * 1.5]; pose.hB = -60; }
  if(role === 'sage'){ pose.mB = [(o.mx || 152) + b * .4, (o.my || 148)]; pose.hB = o.h == null ? 3 : o.h; }
  return pose;
}
/* les bêtes qui détalent : des petites boules de poils sombres, deux yeux rouges, une queue. Une bête : {x0, y (le sol), t0 (elle part),
   vers (+1 / −1), v (sa vitesse), g, d (profondeur : pour sa taille), fin (où elle disparaît : un trou)}.
   Rend {corps (calque éclairé), yeux (calque de lumière)} en unités du monde. */
function betes(liste, tl, o){
  o = o || {};
  var corps = '', yeux = '';
  liste.forEach(function(b, i){
    var dt = tl - b.t0, s = b.s || 1, x = b.x0, y = b.y, cours = dt > 0, op = 1;
    if(cours){
      var dist = b.v * (dt + .5 * dt * dt * 2.2) * .5; x = b.x0 + b.vers * Math.min(dist, Math.abs((b.fin == null ? b.x0 + b.vers * 900 : b.fin) - b.x0));
      if(b.fin != null && Math.abs(x - b.fin) < 2) op = 0;
      op *= 1 - U.inv(b.dure || 2.2, (b.dure || 2.2) + .25, dt);
    }
    if(b.sol) y = b.sol(x) + 2;
    if(op <= 0) return;
    var saut = cours ? Math.abs(Math.sin(dt * 21 + i)) * 4 * s : 0, et = cours ? 1.25 : 1, sens = cours ? b.vers : (b.regarde || 1);
    /* avant de partir : elle lève la tête, ses yeux clignent */
    var cl = !cours && ((tl * .9 + i * .37) % 2.6) < .12 ? 0 : 1;
    corps += '<g transform="translate(' + r2(x) + ' ' + r2(y - saut) + ') scale(' + r2(sens * s) + ' ' + s + ')" opacity="' + r2(op) + '">' +
      '<path d="M-14 -2 Q -34 -8 -40 4 Q -44 12 -34 12" fill="none" stroke="#17121a" stroke-width="2.6" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="-8" rx="' + r2(15 * et) + '" ry="' + r2(9.5 / et) + '" fill="#231c28" stroke="#0a070c" stroke-width="2"/>' +
      '<ellipse cx="' + r2(13 * et) + '" cy="-9" rx="8" ry="6.4" fill="#2a2230" stroke="#0a070c" stroke-width="2"/>' +
      '<path d="M' + r2(10 * et) + ' -15 l -3 -6 l 6 2 Z M' + r2(15 * et) + ' -15 l 1 -7 l 5 4 Z" fill="#2a2230" stroke="#0a070c" stroke-width="1.6"/>' +
      (cours ? '<path d="M-8 0 l ' + r2(-6 * Math.sin(dt * 40)) + ' 4 M8 0 l ' + r2(6 * Math.sin(dt * 40)) + ' 4" stroke="#0a070c" stroke-width="2.4" stroke-linecap="round"/>' : '') + '</g>';
    if(cl) yeux += MP.halo(x + sens * s * 15 * et, y - saut - 10 * s, 9 * s, 'Rouge', .55 * op) + '<circle cx="' + r2(x + sens * s * 13.5 * et) + '" cy="' + r2(y - saut - 10.5 * s) + '" r="' + r2(1.7 * s) + '" fill="#ff5a3a" opacity="' + r2(op) + '"/><circle cx="' + r2(x + sens * s * 18 * et) + '" cy="' + r2(y - saut - 10 * s) + '" r="' + r2(1.5 * s) + '" fill="#ff5a3a" opacity="' + r2(op) + '"/>';
  });
  return {corps:corps, yeux:yeux};
}
/* des yeux rouges dans le noir (dans un trou, au fond d'une arche) : ils clignent, puis s'éteignent quand la lumière arrive (t1) */
function yeuxNoir(liste, tl){
  var s = '';
  liste.forEach(function(e, i){
    var k = fenetre(tl, e[2] == null ? -1 : e[2], e[3] == null ? 1e9 : e[3], .18), cl = ((tl * 1.1 + i * .61) % 2.3) < .1 ? 0 : 1, ec = e[4] || 7, r = e[5] || 2;
    if(k <= 0 || !cl) return;
    s += MP.halo(e[0], e[1], r * 5, 'Rouge', .5 * k) + '<circle cx="' + r2(e[0] - ec / 2) + '" cy="' + e[1] + '" r="' + r + '" fill="#ff4a2a" opacity="' + r2(k) + '"/><circle cx="' + r2(e[0] + ec / 2) + '" cy="' + r2(e[1] + .4) + '" r="' + r + '" fill="#ff4a2a" opacity="' + r2(k) + '"/>';
  });
  return s;
}
var DEC = {}, PLANS = {};

/* ================================================================== LE DÉCOR 1 : LA FORÊT, LA NUIT, LE VIEUX PUITS
   Le sol (les pieds des héros) est en y = 150 ; le puits en x = 260. */
var SOL_F = 150, PX = 260;
DEC.foret = function(S, e){
  var T = window.CTC, R = U.hasard(4), i;
  /* le ciel, la lune derrière les arbres */
  var ciel = S.couche('ciel', {d:9000, net:1, flou:1.5});
  ciel.poser(T.ciel({w:1900, h:900, graine:3, lune:[1330, 250, 46]}), -950, -450);
  ciel.poser(T.lune(46), -950 + 1330 - 46 * 1.5, -450 + 250 - 46 * 1.5);
  /* la forêt au loin, dans la brume */
  var loin = S.couche('loin', {d:4200});
  loin.poser(T.foret({w:2300, h:560, graine:11, n:34, hMin:.5, hMax:.96, brume:[70, 96, 150], brumeK:.75, lune:1}), -1150, -330);
  /* une rangée d'arbres, plus près : des troncs sombres, leurs feuillages */
  var moy = S.couche('moyen', {d:2300, lum:'lum', sc:3, lumK:.5, ambK:.8});
  moy.poser(MP.toile(2600, 900, 1, function(g, w, h){
    g.translate(1300, 560);
    for(i = 0; i < 13; i++){ var x = -1250 + i * 205 + (R() - .5) * 120; DF.tronc(g, x, 60 + R() * 20, 44 + R() * 40, 620 + R() * 200, {graine:20 + i, ton:[58, 56, 62], penche:(R() - .5) * .12}); }
    for(i = 0; i < 60; i++) T.touffe(g, -1300 + R() * 2600, -520 + R() * 190, 60 + R() * 70, [[16, 24, 30], [26, 42, 48], [40, 62, 66], [80, 110, 124]], R);
    for(i = 0; i < 26; i++) T.touffe(g, -1300 + R() * 2600, 30 + R() * 40, 40 + R() * 46, [[14, 22, 26], [24, 40, 42], [36, 58, 58], [70, 100, 110]], R);
  }), -1300, -560);
  /* la brume entre les arbres */
  var br = S.couche('brume', {d:1800, ecran:1, op:.5});
  br.poser(T.brume({w:2800, h:620, graine:5, c:[120, 150, 215], a:.1}), -1400, -330);
  /* les rayons de lune qui tombent entre les arbres (de la lumière : un calque « écran ») */
  var ray = S.couche('rayons', {d:1500, ecran:1, flou:3});
  ray.poser(MP.toile(2600, 900, .5, function(g, w, h){
    g.filter = 'blur(14px)';
    var Rr = U.hasard(8);
    for(i = 0; i < 9; i++){
      var x1 = 500 + Rr() * 2100, lg = 50 + Rr() * 120, dx = -520 - Rr() * 80, a = .05 + Rr() * .09;
      var gr = g.createLinearGradient(x1, 0, x1 + dx, 900); gr.addColorStop(0, 'rgba(150,180,255,' + a + ')'); gr.addColorStop(.6, 'rgba(150,180,255,' + a * .6 + ')'); gr.addColorStop(1, 'rgba(150,180,255,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x1, -20); g.lineTo(x1 + lg, -20); g.lineTo(x1 + lg * 1.8 + dx, 900); g.lineTo(x1 + dx - lg * .6, 900); g.closePath(); g.fill();
    }
  }), -1300, -520);
  S.rayons = ray;
  /* les gros arbres juste derrière la clairière, les buissons */
  var pres = S.couche('pres', {d:1260, lum:'lum', sc:4, lumK:.9});
  pres.poser(MP.toile(2400, 1000, e, function(g, w, h){
    g.translate(1200, 700);
    [[-830, 150, .05], [-470, 110, -.03], [70, 170, .02], [560, 124, -.04], [930, 160, .06]].forEach(function(q, k){
      DF.tronc(g, q[0], 150, q[1], 900, {graine:60 + k, ton:[92, 78, 66], penche:q[2], noeuds:3});
      var Rb = U.hasard(90 + k); for(var b = 0; b < 3; b++) DF.branche(g, q[0] + (Rb() - .5) * 30, -200 - Rb() * 360, 150 + Rb() * 130, (Rb() < .5 ? Math.PI : 0) + (Rb() - .5) * 1.2, 13, [70, 60, 52], Rb);
    });
    for(i = 0; i < 26; i++) T.touffe(g, -1200 + R() * 2400, -640 + R() * 150, 80 + R() * 80, [[22, 36, 30], [40, 70, 52], [66, 108, 78], [130, 170, 140]], R);
    for(i = 0; i < 22; i++) T.touffe(g, -1200 + R() * 2400, 110 + R() * 50, 46 + R() * 50, [[20, 34, 28], [38, 66, 48], [60, 100, 70], [120, 160, 126]], R);
    DF.herbes(g, -1200, 172, 2400, {graine:7, n:70, haut:54, ton:[64, 104, 64]});
  }), -1200, -700);
  /* le sol de la clairière */
  var sol = S.couche('sol', {d:1000, lum:'lum', sc:3.5});
  sol.poser(MP.toile(2600, 250, e, function(g, w, h){ g.translate(1300, 0); DF.solForet(g, -1300, 0, 2600, 250, {graine:3, terre:[PX - 380, PX + 300]}); DF.gravats(g, PX - 230, 30, 520, 16, U.hasard(9), [128, 124, 126]); }), -1300, SOL_F - 22);
  /* le puits : le fond (l'ouverture, les montants, le treuil), puis les héros, puis le devant */
  var pd = S.couche('puitsD', {d:1000, lum:'lum', sc:4, zone:[PX - 250, SOL_F - 340, PX + 250, SOL_F + 100]});
  pd.poser(MP.toile(420, 420, e * 1.25, function(g){ g.translate(210, 330); DF.puits(g, 'derriere'); }), PX - 210, SOL_F - 330);
  var act = S.couche('act', {d:1000, lum:'alpha', sc:4.5, spec:.3});
  var pf = S.couche('puitsF', {d:1000, lum:'lum', sc:4, zone:[PX - 130, SOL_F - 120, PX + 130, SOL_F + 30]});
  pf.poser(MP.toile(420, 420, e * 1.25, function(g){ g.translate(210, 330); DF.puits(g, 'devant'); }), PX - 210, SOL_F - 330);
  S.fx = S.couche('fx', {d:1000, ecran:1});
  /* les herbes de devant */
  var dev = S.couche('devant', {d:860, lum:'lum', sc:3, lumK:.8});
  dev.poser(MP.toile(2800, 260, e, function(g, w, h){ g.translate(1400, 250);
    DF.herbes(g, -1400, 6, 2800, {graine:17, n:90, haut:96, ton:[58, 96, 58], fougere:.5});
    var Rr = U.hasard(33); for(i = 0; i < 9; i++) DF.gravats(g, -1400 + Rr() * 2700, 4, 80, 2, Rr, [110, 108, 104]); }), -1400, SOL_F + 96 - 250 + 60);
  /* le premier plan : un gros tronc à gauche, une branche feuillue en haut à droite — tout près, tout flous, à contre-jour */
  var pp = S.couche('premier', {d:470, lum:'lum', sc:2, lumK:.5, ambK:1.1});
  pp.poser(MP.toile(1500, 1200, .6, function(g, w, h){ g.translate(750, 900);
    DF.tronc(g, -420, 300, 280, 1300, {graine:5, ton:[60, 52, 46], penche:.05, noeuds:2});
    var Rf = U.hasard(71); for(i = 0; i < 16; i++) T.touffe(g, 60 + Rf() * 620, -830 + Rf() * 190, 70 + Rf() * 80, [[12, 20, 18], [22, 38, 30], [34, 56, 42], [70, 100, 80]], Rf);
    DF.branche(g, 720, -700, 520, Math.PI + .25, 26, [44, 38, 34], Rf);
  }), -750 - 560, -900);
  S.act = act; S.solC = sol; S.pd = pd;
  S.H = {a:HF.creer(S, act, 'alchimiste'), s:HF.creer(S, act, 'sage'), p:HF.creer(S, act, 'pisteur')};
};
/* les lucioles de la clairière (des ronds de lumière flous, à toutes les profondeurs) */
function lucioles(t, cam, n, k){
  var R = U.hasard(19), s = '';
  for(var i = 0; i < n; i++){
    var d = 500 + R() * 2600, X = -1300 + R() * 2600 + Math.sin(t * (.2 + R() * .3) + i) * 60, Y = -260 + R() * 420 + Math.cos(t * (.25 + R() * .3) + i * 2) * 40, ph = R() * 9, p = MP.ecran(X, Y, d, cam);
    var cl = Math.pow(.5 + .5 * Math.sin(t * (.9 + R()) + ph), 3);
    if(p.x < -60 || p.x > 1500 || p.y < -60 || p.y > 680) continue;
    s += MP.bokeh(p.x, p.y, 2.2 * Math.max(.5, p.s), MP.flou(d, cam), '#d8ff9a', cl * (k || .9));
  }
  return s;
}
function ambForet(){ return [30, 40, 76]; }
/* la lune : une grande lumière froide, en haut à gauche, devant (elle donne le sens du relief à tout le décor) */
function lune(k){ return {x:700, y:-900, d:300, c:LUNE, k:(k || 1) * .5, r:1500, z:800, rim:.9, e:1}; }

/* ---- PLAN 1 : la clairière, vue d'ensemble — ils arrivent au puits (7 s) */
var VM = 96;
function marcheVers(a, role, tl, X0, Xa, o){
  o = o || {};
  var X = trajet(tl, X0, o.v || VM, Xa), opt = {x0:Xa - .55 * 54, torse:o.torse, tete:o.tete, bas:o.bas, pente:o.pente}, m = HF.marche(X, o.sol || function(){ return SOL_F; }, opt);
  var arrive = U.inv(Xa - 26, Xa, X), re = Math.sin(tl * 2 + role.length);
  porte(m.pose, role, tl, o.porte);
  /* arrêté : il respire */
  m.pose.torse = (typeof m.pose.torse === 'number' ? m.pose.torse : 0) + arrive * re * .8;
  return {X:X, y:m.y, pose:m.pose, arrive:arrive};
}
PLANS.clairiere = {id:'clairiere', cle:'foret', duree:7,
  monter:function(S){ DEC.foret(S, 1.25); },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 7);
    return {cam:{x:U.lerp(-150, 40, k), y:U.lerp(-52, -30, k), zoom:U.lerp(.8, .97, k), z:0, focus:1000, ap:1.25}, amb:ambForet(), fondu:1 - K(0, 1.1, tl), poussiere:{n:90, k:.5, fond:.05, c:'#a8c0ff'}};
  },
  acteurs:function(S, tl){
    var H = S.H;
    var p = marcheVers(H.p, 'pisteur', tl, -470, PX - 168, {porte:{my:116 - 14 * K(4.6, 6, tl), mx:178 + 6 * K(4.6, 6, tl)}});
    p.pose.tete = -5 + 9 * K(4.4, 5.6, tl);
    HF.poser(H.p, {x:p.X, y:p.y, pose:p.pose, cligne:HF.cligne(tl, 1), regard:[1.2 * K(4.4, 5.4, tl), 1.5 * K(4.4, 5.4, tl)], sourcils:'garde'});
    var s = marcheVers(H.s, 'sage', tl, -650, PX - 318, {torse:3});
    s.pose.tete = -3 - 6 * K(5.2, 6.4, tl);
    HF.poser(H.s, {x:s.X, y:s.y, pose:s.pose, cligne:HF.cligne(tl, 2), sourcils:tl > 5 ? 'souci' : 'garde'});
    var a = marcheVers(H.a, 'alchimiste', tl, -850, PX - 470, {});
    HF.poser(H.a, {x:a.X, y:a.y, pose:a.pose, cligne:HF.cligne(tl, 3)});
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOL_F}), H = S.H;
    S.fx.svg(P.fx);
    S.solC.svg([H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x, SOL_F + 4, 64, .7); }).join(''));
    return {lum:P.lum.concat([lune()]), air:lucioles(S.t, S.cam, 46)};
  }};

/* ---- PLAN 2 : à la margelle — le Pisteur se penche, regarde le noir, et lâche sa torche dans le puits (4,6 s) */
function auBord(S, tl, o){
  /* les trois héros arrêtés près du puits, comme à la fin du plan 1 (les mêmes pieds) */
  var H = S.H, r = {};
  [['p', 'pisteur', PX - 168], ['s', 'sage', PX - 318], ['a', 'alchimiste', PX - 470]].forEach(function(q){
    var X = (o && o[q[0]]) || q[2], m = HF.marche(X, function(){ return SOL_F; }, {x0:X - .55 * 54, torse:q[0] === 's' ? 3 : 6});
    porte(m.pose, q[1], tl, {});
    r[q[0]] = {x:X, y:SOL_F, pose:m.pose};
  });
  return r;
}
PLANS.margelle = {id:'margelle', cle:'foret', duree:4.6,
  monter:function(S){ DEC.foret(S, 1.25); },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 4.6);
    return {cam:{x:PX - 150 + 30 * k, y:SOL_F - 172 + 8 * k, zoom:U.lerp(1.5, 1.66, k), focus:1000, ap:1.5}, amb:ambForet(), poussiere:{n:80, k:.5, fond:.05, c:'#a8c0ff'}};
  },
  acteurs:function(S, tl){
    var H = S.H, B = auBord(S, tl), lache = 1.9, re = Math.sin(tl * 2.1);
    /* le Pisteur : penché au-dessus du trou, la torche à bout de bras ; il regarde en bas, il ouvre la main */
    var pen = K(0, 1.1, tl), p = B.p.pose, ap = K(lache + .5, lache + 1.6, tl);
    p.bassin = {x:8 * pen, y:10 + re * .6, r:2 * pen}; p.torse = 6 + 20 * pen - 8 * ap + re * .6; p.tete = -5 + 26 * pen - 10 * ap;
    p.mB = [178 + 36 * pen - 12 * ap, 116 - 6 * pen + 34 * ap]; p.hB = -76 + 50 * pen + 30 * K(lache - .25, lache, tl);
    p.mA = [150 + 12 * pen, 150]; p.hA = -20;
    HF.poser(H.p, {x:B.p.x, y:B.p.y, pose:p, cligne:HF.cligne(tl, 1), regard:[1.5 * pen, 2.6 * pen * (1 - ap * .6)], sourcils:tl < lache + .7 ? 'garde' : 'souci', sansTorche:tl >= lache});
    var s = B.s.pose; s.tete = -3 + 12 * K(lache, lache + .8, tl); s.torse = 3 + 5 * K(lache, lache + .9, tl);
    HF.poser(H.s, {x:B.s.x, y:B.s.y, pose:s, cligne:HF.cligne(tl, 2), sourcils:'souci', regard:[1.5, 1.5 * K(lache, lache + .6, tl)], bouche:tl > lache + .3 && tl < lache + 1.5 ? 'o' : 'neutre'});
    var a = B.a.pose; a.mB = [170 + 8 * K(1, 2.4, tl), 124 - 18 * K(1, 2.4, tl)]; a.tete = -5 + 8 * K(lache, lache + 1, tl);
    HF.poser(H.a, {x:B.a.x, y:B.a.y, pose:a, cligne:HF.cligne(tl, 3), regard:[1.5, .8]});
  },
  dessin:function(S, tl, E){
    var lache = 1.9, P = porteurs(S, tl, E, {sol:SOL_F}), H = S.H, dt = tl - lache, s = '', lum = P.lum.concat([lune()]), fx = P.fx;
    if(dt >= 0){
      /* la torche tombe : elle tourne, elle file dans le noir ; sa lumière remonte du trou, de plus en plus faible */
      var ch = {x:PX - 34, y:SOL_F - 198}, y = ch.y + 20 * dt + 520 * dt * dt, x = ch.x + 26 * dt, bord = SOL_F - DF.PUITS.haut + 4, v = MP.vacille(S.t, 1);
      if(y < bord + 40){
        s += '<g transform="translate(' + r2(x) + ' ' + r2(y) + ') rotate(' + r2(-60 + 420 * dt) + ')"><path d="M-40 0 L 6 0" stroke="#24182e" stroke-width="9" stroke-linecap="round"/><path d="M-40 0 L 6 0" stroke="#7a4e2a" stroke-width="5" stroke-linecap="round"/><ellipse cx="12" cy="0" rx="11" ry="8" fill="#3a2a22" stroke="#24182e" stroke-width="3"/></g>';
        if(y < bord) fx += MP.halo(x, y, 200 * v, 'Chaud', .55) + MP.flamme(x, y, 11, S.t, 1, {penche:-.6}) ;
        lum.push({x:x, y:Math.min(y, bord), d:985, c:CHAUD, k:2.5 * v, r:260, z:120});
      }
      var prof = Math.max(0, y - bord), kk = 2.6 / (1 + prof / 300) + .5;
      lum.push({x:PX, y:bord - 10, d:1000, c:CHAUD, k:kk * v * U.inv(bord - 60, bord, y), r:240, z:110, e:1.4});
      fx += MP.halo(PX, bord + 6, 150 + 60 * v, 'Chaud', U.clamp(kk * .32, 0, .7) * U.inv(bord - 30, bord + 20, y));
    }
    S.pd.svg(s);
    S.fx.svg(fx);
    S.solC.svg([H.p, H.s, H.a].map(function(a){ return HF.ombre(a.x, SOL_F + 4, 64, .7); }).join(''));
    return {lum:lum, air:lucioles(S.t, S.cam, 46)};
  }};

/* ---- PLAN 3 : la corde — le Pisteur s'enfonce dans le puits ; l'Alchimiste l'éclaire d'en haut (3,4 s) */
PLANS.cordeHaut = {id:'cordeHaut', cle:'foret', duree:3.4,
  monter:function(S){ DEC.foret(S, 1.25); },
  etat:function(S, tl){
    var k = U.tresLisse(tl / 3.4);
    return {cam:{x:PX - 96 - 10 * k, y:SOL_F - 142 + 30 * k, zoom:U.lerp(1.3, 1.42, k), focus:1000, ap:1.4}, amb:ambForet(), poussiere:{n:80, k:.5, fond:.05, c:'#a8c0ff'}};
  },
  acteurs:function(S, tl){
    var H = S.H, B = auBord(S, tl, {a:PX - 176, s:PX - 330}), Y = SOL_F + 66 + 64 * tl;
    H.p.sansSol = 1;
    HF.poser(H.p, {x:PX - 37, y:Y, pose:HF.corde(Y, {tete:14}), cligne:HF.cligne(tl, 1), regard:[.5, 2.4], sansTorche:1});
    /* (ce qui est sous le sol ne se voit pas : il est dans le puits) */
    H.p.boite.style.clipPath = 'inset(-300px -300px ' + r2(Y - (SOL_F - DF.PUITS.haut + 20)) + 'px -300px)';
    var a = B.a.pose; a.torse = 6 + 12 * K(0, 1, tl); a.tete = -5 + 22 * K(.2, 1.2, tl); a.mB = [196, 112 + 8 * K(0, 1, tl)]; a.bassin = {x:6, y:10};
    HF.poser(H.a, {x:B.a.x, y:B.a.y, pose:a, cligne:HF.cligne(tl, 3), regard:[1.2, 2.4]});
    var s = B.s.pose; s.tete = -3 + 12 * K(0, 1, tl);
    HF.poser(H.s, {x:B.s.x, y:B.s.y, pose:s, cligne:HF.cligne(tl, 2), sourcils:'souci', regard:[1.5, 1.6]});
  },
  dessin:function(S, tl, E){
    var P = porteurs(S, tl, E, {sol:SOL_F}), H = S.H, v = MP.vacille(S.t, 1), bord = SOL_F - DF.PUITS.haut + 4;
    S.pd.svg(DF.corde(PX, SOL_F - DF.PUITS.mont + 40, SOL_F + 10));
    S.fx.svg(P.fx + MP.halo(PX, bord + 6, 130 + 30 * v, 'Chaud', .2));
    S.solC.svg([H.s, H.a].map(function(a){ return HF.ombre(a.x, SOL_F + 4, 64, .7); }).join(''));
    return {lum:P.lum.concat([lune(), {x:PX, y:bord - 6, d:1000, c:CHAUD, k:.5 * v, r:240, z:100, e:1.4}]), air:lucioles(S.t, S.cam, 46)};
  }};

/* ce que les autres fichiers du film reprennent */
CINE.DESC = {PLANS:PLANS, DEC:DEC, porteurs:porteurs, trajet:trajet, porte:porte, betes:betes, yeuxNoir:yeuxNoir, K:K, fenetre:fenetre, r2:r2, marcheVers:marcheVers,
  CHAUD:CHAUD, LAMPE:LAMPE, FROID:FROID, LUNE:LUNE, RUNE:RUNE};
})();
