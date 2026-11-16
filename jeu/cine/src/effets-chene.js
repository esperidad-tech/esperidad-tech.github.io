/* effets-chene.js — les effets du film du rassemblement (Bible §12.63), calculés pour un temps t comme tous les autres :
   les lumières qu'on porte (une lanterne, une torche) et leurs RONDS FLOUS quand elles sont hors du point net (le « bokeh » :
   c'est lui qui montre le jeu de focale), les flaques de lumière au sol, les lucioles, les rayons de lune, LA FUMÉE ROUGE du
   fumigène (des centaines de bouffées qui sortent, roulent au sol, montent et s'effacent), les étincelles de la mèche,
   et deux accessoires : le pot noir du fumigène, la barrière du chemin fermé. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, O = '#150c08';
var FC = window.CFXC = {};

FC.defs = function(){
  function rg(id, stops){ return '<radialGradient id="' + id + '">' + stops.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '" stop-opacity="' + s[2] + '"/>'; }).join('') + '</radialGradient>'; }
  var d = '';
  /* les halos (nets) et les ronds flous : chaud (une lanterne), feu (une torche), rouge (la braise du fumigène), lune (bleu pâle) */
  [['Chaud', '#ffe0a0', '#ffb050', '#c06a10'], ['Feu', '#ffd08a', '#ff8a2a', '#b04208'], ['Rouge', '#ffb0a0', '#ff3a2a', '#8a0a10'], ['Lune', '#f0f6ff', '#a8c4ff', '#3a5aa8'], ['Vert', '#f4ffb0', '#b8e84a', '#4a7a10']].forEach(function(c){
    d += rg('halo' + c[0], [[0, c[1], .6], [.35, c[2], .2], [1, c[3], 0]]);
    d += rg('coeur' + c[0], [[0, '#ffffff', .95], [.4, c[1], .6], [1, c[2], 0]]);
    /* un rond flou d'objectif : presque plat, un bord un peu plus clair, puis plus rien */
    d += rg('bokeh' + c[0], [[0, c[2], .42], [.72, c[2], .46], [.9, c[1], .62], [.97, c[1], .3], [1, c[1], 0]]);
    d += rg('flaque' + c[0], [[0, c[2], .5], [.5, c[2], .2], [1, c[3], 0]]);
  });
  /* les bouffées de fumée : le cœur plein, le bord qui s'efface */
  [['A', '#ff6a3a'], ['B', '#e0282a'], ['C', '#b01826'], ['D', '#7a1220'], ['E', '#4a0c16'], ['F', '#ff9a6a'], ['G', '#240810']].forEach(function(c){
    d += rg('fum' + c[0], [[0, c[1], 1], [.5, c[1], .82], [.78, c[1], .34], [1, c[1], 0]]);
  });
  d += '<linearGradient id="rayonLune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".0"/><stop offset=".15" stop-color="#cfe0ff" stop-opacity=".5"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></linearGradient>';
  d += '<linearGradient id="potX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050506"/><stop offset=".3" stop-color="#3a3a42"/><stop offset=".5" stop-color="#1c1c22"/><stop offset="1" stop-color="#030304"/></linearGradient>';
  d += '<linearGradient id="boisBarre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a44"/><stop offset=".5" stop-color="#5e4428"/><stop offset="1" stop-color="#2e2012"/></linearGradient>';
  return d;
};

/* ---------------------------------------------------------------- UNE LUMIÈRE (dans la couche des lumières : elle s'ajoute à l'image)
   (x, y, z) dans le monde ; o = {sorte:'Chaud' | 'Feu' | 'Rouge' | 'Lune' | 'Vert', r (le rayon du halo, en unités du monde), k (force), graine,
   sol (une flaque de lumière au sol, sous elle), coeur (le point brillant : 0 pour l'enlever)} */
FC.lumiere = function(t, x, y, z, o){
  o = o || {};
  var p = CAM.projeter(x, y, z); if(p.d < 40) return '';
  var f = CAM.flou(p.d), sorte = o.sorte || 'Chaud', li = FX.lueur(t, o.graine || 1) * (o.k == null ? 1 : o.k), s = '';
  if(p.x < -500 || p.x > CAM.W + 500) return '';
  /* le halo dans l'air (il s'élargit un peu avec le flou) */
  var r = (o.r || 300) * p.s + f * 1.5;
  s += '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(r) + '" fill="url(#halo' + sorte + ')" opacity="' + U.r(U.clamp(.75 * li, 0, 1)) + '"/>';
  if(f < 3.5){
    if(o.coeur !== 0) s += '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(Math.max(2.5, (o.coeur || 30) * p.s)) + '" fill="url(#coeur' + sorte + ')" opacity="' + U.r(U.clamp(.9 * li, 0, 1)) + '"/>';
  } else {
    /* hors du point net : un rond, d'autant plus grand et plus pâle qu'il est flou */
    var rb = f * 1.25 + (o.coeur || 30) * p.s * .5, op = U.clamp(1.25 / (1 + f / 11), .2, 1) * li;
    s += '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(rb) + '" fill="url(#bokeh' + sorte + ')" opacity="' + U.r(U.clamp(op, 0, 1)) + '"/>';
  }
  /* la flaque de lumière au sol */
  if(o.sol){
    var c = CAM.projeter(x, 0, z + 20), a = CAM.projeter(x + o.sol, 0, z + 20), b1 = CAM.projeter(x, 0, z + 20 + o.sol * .8), b2 = CAM.projeter(x, 0, z + 20 - o.sol * .8);
    if(c.d > 60 && b1.d > 30) s += '<ellipse cx="' + U.r(c.x) + '" cy="' + U.r(c.y) + '" rx="' + U.r(Math.abs(a.x - c.x) + f) + '" ry="' + U.r(Math.max(3, Math.abs(b1.y - b2.y) / 2 + f * .5)) + '" fill="url(#flaque' + sorte + ')" opacity="' + U.r(U.clamp(.55 * li * (o.solK || 1), 0, 1)) + '"/>';
  }
  return s;
};

/* ---------------------------------------------------------------- LES LUCIOLES : des points verts-jaunes qui flottent et clignotent
   boite = [x0, y0, z0, x1, y1, z1] ; k (0 → 1 : elles s'éteignent quand la fumée arrive) */
FC.lucioles = function(t, boite, n, graine, k){
  if(!(k > 0)) return '';
  var R = U.hasard(graine || 5), s = '';
  for(var i = 0; i < n; i++){
    var x0 = U.lerp(boite[0], boite[3], R()), y0 = U.lerp(boite[1], boite[4], R()), z0 = U.lerp(boite[2], boite[5], R()), ph = R() * 9, vit = .5 + R();
    var x = x0 + U.fbm(t * .12 * vit + i, i, 2) * 260, y = y0 + U.fbm(t * .15 * vit + i * 2, i + 40, 2) * 120, z = z0 + U.fbm(t * .1 * vit + i * 3, i + 80, 2) * 200;
    var cl = Math.pow(Math.max(0, Math.sin(t * (1.1 + vit * .8) + ph)), 2) * k;
    if(cl < .05) continue;
    s += FC.lumiere(t, x, y, z, {sorte:'Vert', r:34, coeur:7, k:cl, graine:i});
  }
  return s;
};

/* ---------------------------------------------------------------- LES RAYONS DE LUNE à travers les branches (de grands pinceaux pâles, penchés) */
FC.rayons = function(t, liste, k){
  if(!(k > 0)) return '';
  var s = '';
  liste.forEach(function(r, i){
    var h = CAM.projeter(r[0], r[1], r[2]), b = CAM.projeter(r[0] + r[3], 0, r[2] + 60), l = r[4] * h.s, lb = r[4] * 1.9 * b.s;
    var op = k * (r[5] || .12) * (.75 + .25 * U.fbm(t * .3 + i, i * 3 + 1, 2));
    s += '<polygon points="' + U.r(h.x - l / 2) + ',' + U.r(h.y) + ' ' + U.r(h.x + l / 2) + ',' + U.r(h.y) + ' ' + U.r(b.x + lb / 2) + ',' + U.r(b.y) + ' ' + U.r(b.x - lb / 2) + ',' + U.r(b.y) + '" fill="url(#rayonLune)" opacity="' + U.r(op) + '" filter="url(#fl' + Math.max(8, Math.min(60, Math.round(l * .5))) + ')"/>';
  });
  return s;
};

/* ---------------------------------------------------------------- LA FUMÉE ROUGE
   Une SOURCE : {x, y, z (d'où elle sort), t0 (son début), duree (elle crache pendant), debit (bouffées par seconde), vie (secondes),
     jet:[vx, vy, vz] (la poussée du départ, unités par seconde), ouvert (l'éventail du jet, 0 → 1), etale (elle s'étale au sol),
     monte (elle monte), vent:[vx, vz], r0, r1 (le rayon d'une bouffée, au départ et à la fin), graine, dense (0 → 1)}
   FC.fumee(t, sources) → la liste des bouffées vivantes {x, y, z, r, a (opacité), age, c (teinte : 'A'… jeune et claire, 'E' vieille et sombre)}
   FC.fumeeTranches(t, sources, coupes) → des acteurs « libres », par tranches de profondeur : la fumée passe DERRIÈRE et DEVANT les
     personnages, comme une vraie. */
FC.fumee = function(t, sources){
  var L = [];
  sources.forEach(function(S, si){
    var a0 = t - S.t0; if(a0 <= 0) return;
    var vie = S.vie || 8, n0 = Math.max(0, Math.floor((a0 - vie) * S.debit)), n1 = Math.floor(Math.min(a0, S.duree == null ? 1e9 : S.duree) * S.debit);
    for(var i = n0; i <= n1; i++){
      var te = i / S.debit, a = a0 - te; if(a <= 0 || a >= vie) continue;
      var R = U.hasard((S.graine || 7) * 131 + i * 17 + si * 7919), ouv = S.ouvert == null ? .6 : S.ouvert;
      var j = S.jet || [0, -200, 0], vj = .55 + R() * .9, e1 = (R() - .5) * 2 * ouv, e2 = (R() - .5) * 2 * ouv, e3 = (R() - .5) * 2 * ouv;
      var jn = Math.hypot(j[0], j[1], j[2]) || 1;
      /* le jet : il part fort et s'essouffle */
      var dj = (1 - Math.exp(-a * 1.7)) / 1.7 * vj;
      var x = S.x + (j[0] + e1 * jn) * dj, y = S.y + (j[1] + e2 * jn * .7) * dj, z = S.z + (j[2] + e3 * jn) * dj;
      /* puis elle s'étale (au hasard autour), elle monte en tournant, le vent la pousse */
      var ang = R() * Math.PI * 2, et = (S.etale || 0) * Math.sqrt(a) * (.4 + R() * .9);
      x += Math.cos(ang) * et + (S.vent ? S.vent[0] * a : 0) + U.fbm(a * .45 + i * .37, i + 11, 2) * 46 * a;
      z += Math.sin(ang) * et * .8 + (S.vent ? S.vent[1] * a : 0) + U.fbm(a * .4 + i * .53, i + 71, 2) * 40 * a;
      y -= (S.monte || 0) * Math.pow(a, 1.25) * (.3 + R() * 1.1) + U.fbm(a * .6 + i, i + 31, 2) * 14 * a;
      if(y > -6) y = -6 - R() * 20;                                   /* elle ne passe pas sous le sol : elle roule dessus */
      var r = U.lerp(S.r0 || 40, S.r1 || 260, 1 - Math.exp(-a * (S.gonfle || .55))) * (.7 + R() * .6);
      var op = U.clamp(a / .22, 0, 1) * U.clamp((vie - a) / (vie * .45), 0, 1) * (S.dense == null ? .5 : S.dense) * (.6 + R() * .5);
      /* jeune : claire, orangée (la braise l'éclaire) ; puis rouge ; vieille : sombre, presque noire — c'est ce qui lui donne du volume */
      var kage = a / vie, c = kage < .05 ? (R() < .5 ? 'A' : 'F') : kage < .13 ? (R() < .6 ? 'B' : 'A') : kage < .3 ? (R() < .65 ? 'C' : 'B') : kage < .58 ? (R() < .7 ? 'D' : 'C') : (R() < .7 ? 'E' : 'D');
      if(kage > .1 && R() < .16) c = 'G';
      L.push({x:x, y:y, z:z, r:r, a:op, age:a, c:c, i:i});
    }
  });
  return L;
};
function bouffee(b, k){
  var p = CAM.projeter(b.x, b.y, b.z); if(p.d < 30) return '';
  var f = CAM.flou(p.d), r = Math.min(430, b.r * p.s + f * .8);
  if(p.x + r < -40 || p.x - r > CAM.W + 40 || p.y + r < -40 || p.y - r > CAM.H + 40) return '';
  /* (une bouffée tout contre la caméra couvrirait l'image d'un aplat : elle s'efface en approchant) */
  var pres = U.clamp((p.d - 60) / 500, 0, 1), op = U.clamp(b.a * (k == null ? 1 : k) * pres, 0, 1);
  if(op < .012) return '';
  var s = '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(r) + '" fill="url(#fum' + b.c + ')" opacity="' + U.r(op) + '"/>';
  /* le dessus de la bouffée accroche la lumière : une petite bosse plus claire, en haut à gauche */
  if(b.c !== 'G' && b.c !== 'E' && b.c !== 'D' && (b.i % 3) === 0) s += '<circle cx="' + U.r(p.x - r * .28) + '" cy="' + U.r(p.y - r * .34) + '" r="' + U.r(r * .5) + '" fill="url(#fum' + (b.c === 'A' || b.c === 'F' ? 'F' : b.c === 'B' ? 'A' : 'B') + ')" opacity="' + U.r(op * .45) + '"/>';
  return s;
}
FC.fumeeTranches = function(t, sources, coupes, k){
  var L = FC.fumee(t, sources), T = coupes.map(function(){ return []; }); T.push([]);
  L.forEach(function(b){ var n = 0; while(n < coupes.length && b.z > coupes[n]) n++; T[n].push(b); });
  return T.map(function(l, n){
    if(!l.length) return null;
    /* dans une tranche : les vieilles (grandes, sombres) d'abord, les jeunes par-dessus */
    l.sort(function(a, b){ return b.age - a.age; });
    var zm = n === 0 ? coupes[0] - 1 : n === coupes.length ? coupes[n - 1] + 1 : (coupes[n - 1] + coupes[n]) / 2;
    return {type:'libre', x:l[0].x, y:0, z:zm, flou:false, pres:-1e9, dessin:function(){ return '<g>' + l.map(function(b){ return bouffee(b, k); }).join('') + '</g>'; }};
  }).filter(Boolean);
};
/* combien de fumée devant la caméra (0 → 1) : pour le voile rouge de toute l'image */
FC.voile = function(k, coul){
  if(!(k > 0)) return '';
  return '<rect width="1440" height="616" fill="' + (coul || '#8a1420') + '" opacity="' + U.r(U.clamp(k, 0, 1)) + '"/>';
};

/* ---------------------------------------------------------------- DES ÉTINCELLES (la mèche qui brûle, le pot qui crache)
   elles jaillissent de (x, y, z) entre t0 et t1, retombent ; n par seconde */
FC.etincelles = function(t, t0, t1, x, y, z, n, graine, force){
  var s = ''; if(t < t0) return s;
  var F = force || 1, vie = .55, i0 = Math.max(0, Math.floor((t - t0 - vie) * n)), i1 = Math.floor((Math.min(t, t1) - t0) * n);
  for(var i = i0; i <= i1; i++){
    var a = t - t0 - i / n; if(a <= 0 || a >= vie) continue;
    var R = U.hasard((graine || 3) * 977 + i * 31), ang = R() * Math.PI * 2, el = -.2 - R() * 1.2, v = (140 + R() * 260) * F;
    var px = x + Math.cos(ang) * v * a * .7, pz = z + Math.sin(ang) * v * a * .5, py = y + el * v * a + 420 * a * a;
    var p = CAM.projeter(px, py, pz), q = CAM.projeter(px - Math.cos(ang) * v * .03, py - (el * v + 840 * a) * .03, pz), k = 1 - a / vie;
    s += '<path d="M' + U.r(q.x) + ' ' + U.r(q.y) + ' L ' + U.r(p.x) + ' ' + U.r(p.y) + '" stroke="' + (R() < .4 ? '#fff6c0' : '#ffb040') + '" stroke-width="' + U.r(Math.max(1, 3.2 * p.s * k)) + '" stroke-linecap="round" opacity="' + U.r(k) + '"/>';
  }
  return s;
};

/* ---------------------------------------------------------------- LE POT NOIR DU FUMIGÈNE (repère : son pied, au milieu ; ≈ 170 de large, 150 de haut)
   o = {meche (0 → 1 : ce qu'il reste de la mèche), feu (0 → 1 : la braise aux trous), chaud (0 → 1 : la lumière d'une flamme proche)} */
FC.pot = function(o){
  o = o || {};
  var s = '<ellipse cx="0" cy="2" rx="96" ry="13" fill="#000" opacity=".55"/>' +
    /* le ventre de fonte, ses trois pieds */
    '<path d="M-58 0 l -8 -16 l 16 0 Z M58 0 l 8 -16 l -16 0 Z M-8 4 l 0 -14 l 16 0 l 0 14 Z" fill="#0a0a0c" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M-78 -94 C -92 -60 -84 -22 -56 -10 L 56 -10 C 84 -22 92 -60 78 -94 Z" fill="url(#potX)" stroke="' + O + '" stroke-width="3.4"/>' +
    '<path d="M-84 -98 L 84 -98 L 80 -84 L -80 -84 Z" fill="#26262c" stroke="' + O + '" stroke-width="3"/>' +
    /* le couvercle percé de trous, son bouton */
    '<path d="M-78 -98 C -60 -128 60 -128 78 -98 Z" fill="url(#potX)" stroke="' + O + '" stroke-width="3.2"/><circle cx="0" cy="-124" r="10" fill="#1c1c22" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M-60 -70 C -66 -50 -62 -34 -52 -22" fill="none" stroke="#6a6a78" stroke-width="5" opacity=".45" stroke-linecap="round"/>';
  var feu = o.feu || 0;
  [[-44, -106], [-16, -112], [14, -112], [42, -106], [-52, -62], [-18, -52], [18, -52], [52, -62]].forEach(function(h, k){
    s += '<ellipse cx="' + h[0] + '" cy="' + h[1] + '" rx="7" ry="5" fill="' + (feu > 0 ? 'rgb(' + Math.round(40 + 215 * feu) + ',' + Math.round(20 + 120 * feu) + ',' + Math.round(10 + 30 * feu) + ')' : '#020203') + '" stroke="' + O + '" stroke-width="1.6"/>';
  });
  /* la lueur d'une flamme proche sur la fonte */
  if(o.chaud > 0) s += '<path d="M40 -90 C 62 -70 66 -40 52 -18" fill="none" stroke="#ffb060" stroke-width="7" opacity="' + U.r(.6 * o.chaud) + '" stroke-linecap="round"/><path d="M-70 -96 L 70 -96" stroke="#ffc880" stroke-width="3" opacity="' + U.r(.5 * o.chaud) + '"/>';
  return s;
};
/* la mèche du pot : une ficelle goudronnée qui sort du couvercle et traîne à droite ; FC.meche(k) rend son dessin et le point
   où elle brûle (k : 1 = entière, 0 = brûlée jusqu'au pot) ; repère : le pied du pot */
var MECHE = [[66, -102], [100, -112], [128, -84], [140, -44], [162, -14], [196, -8], [226, -12]];
FC.mechePoint = function(k){
  var n = MECHE.length - 1, u = U.clamp(k, 0, 1) * n, i = Math.min(n - 1, Math.floor(u)), fr = u - i;
  return [U.lerp(MECHE[i][0], MECHE[i + 1][0], fr), U.lerp(MECHE[i][1], MECHE[i + 1][1], fr)];
};
FC.meche = function(k){
  var n = 24, d = '', kk = U.clamp(k, 0, 1);
  if(kk < .02) return '';
  for(var i = 0; i <= n; i++){ var p = FC.mechePoint(kk * i / n); d += (i ? ' L ' : 'M') + U.r(p[0]) + ' ' + U.r(p[1]); }
  return '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#6a5a3a" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 3"/>';
};

/* ---------------------------------------------------------------- LA BARRIÈRE DU CHEMIN FERMÉ (repère : le sol, au milieu ; ≈ 1000 de large)
   o = {tombe (0 → 1 : la barre tombe, bousculée)} */
FC.barriere = function(o){
  o = o || {};
  var a = (o.tombe || 0) * 26, dy = (o.tombe || 0) * 96;
  function poteau(x){ return '<path d="M' + (x - 16) + ' 0 L ' + (x - 13) + ' -214 L ' + (x + 13) + ' -214 L ' + (x + 16) + ' 0 Z" fill="url(#boisBarre)" stroke="' + O + '" stroke-width="3.4"/><path d="M' + (x - 4) + ' -200 L ' + (x - 6) + ' -10" stroke="#3a2a18" stroke-width="2" opacity=".7"/><path d="M' + (x - 13) + ' -214 L ' + x + ' -232 L ' + (x + 13) + ' -214 Z" fill="#6a5030" stroke="' + O + '" stroke-width="3"/>'; }
  var s = '<ellipse cx="0" cy="2" rx="520" ry="14" fill="#000" opacity=".4"/>' + poteau(-470) + poteau(470);
  /* la barre (elle tombe d'un côté), et le panneau cloué dessus */
  s += '<g transform="translate(-470 ' + (-176 + dy * .1) + ') rotate(' + U.r(a) + ')"><path d="M-40 -15 L 980 -19 L 982 15 L -40 19 Z" fill="url(#boisBarre)" stroke="' + O + '" stroke-width="3.4"/>' +
    '<path d="M-20 -4 L 960 -7 M40 8 L 900 6" stroke="#3a2a18" stroke-width="2" opacity=".6"/>' +
    [80, 240, 700, 860].map(function(x, k){ return '<path d="M' + x + ' -17 L ' + (x + 70) + ' -17 L ' + (x + 40) + ' 17 L ' + (x - 30) + ' 17 Z" fill="' + (k % 2 ? '#b8322a' : '#e8e0c8') + '" stroke="' + O + '" stroke-width="2" opacity=".92"/>'; }).join('') +
    '<g transform="translate(470 -4)"><path d="M-150 -92 L 150 -98 L 154 26 L -154 30 Z" fill="#e6dcc0" stroke="' + O + '" stroke-width="4"/><path d="M-138 -80 L 138 -86 L 142 14 L -142 18 Z" fill="none" stroke="#b8322a" stroke-width="5"/>' +
    '<text x="0" y="-14" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="58" fill="#a0241e" transform="rotate(-1)">DANGER</text>' +
    '<circle cx="-136" cy="-78" r="5" fill="#3a3a44"/><circle cx="136" cy="-84" r="5" fill="#3a3a44"/></g></g>';
  return s;
};
})();
